<template>
  <div class="p-4 md:p-6 bg-white rounded-3xl h-full shadow-xl border border-gray-100 flex flex-col">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <span>{{ $t('pay_types') }}</span>
        <span class="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
          {{ filteredItems.length }}
        </span>
      </h2>

      <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <BaseSearch v-model="searchQuery" />
        <BaseButton @click="openForm" :label="$t('add')" status="pink">
          <template #icon>
            <addIcon />
          </template>
        </BaseButton>
        <UpdateButton @click="getModels" />
      </div>
    </div>

    <!-- Table Section -->
    <div class="flex-1 min-h-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50/30">
      <ResponsiveTable :columns="columns" :data="filteredItems" @refresh="getModels">
        <template #color="{ item }">
          <span
            class="px-2 py-0.5 rounded-full text-xs font-medium"
            :class="colorClasses[item.color] || 'bg-gray-100 text-gray-600'"
          >
            {{ item.color }}
          </span>
        </template>
        <template #is_default="{ item }">
          <span v-if="item.is_default" class="text-green-600 font-semibold">&#10003;</span>
        </template>
        <template #actions="{ item }">
          <div class="flex items-center justify-end gap-2">
            <button
              class="group p-2 rounded-lg bg-white border border-amber-100 text-amber-600 hover:bg-amber-50 hover:border-amber-200 active:scale-90 transition-all duration-200"
              :title="$t('edit')" @click="openForm(item)">
              <editIcon size="w-4 h-4" class="group-hover:scale-110 transition-transform" />
            </button>
            <button
              class="group p-2 rounded-lg bg-white border border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 active:scale-90 transition-all duration-200"
              :title="$t('delete')" @click="promptDelete(item)">
              <trashIcon size="w-4 h-4" class="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </template>
      </ResponsiveTable>
    </div>

    <!-- MODAL: Add / Edit -->
    <Transition name="modal">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="closeForm"></div>
        <div class="modal-content relative bg-white rounded-2xl shadow-2xl w-full max-w-md md:max-w-lg flex flex-col max-h-[90vh]">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
            <h3 class="text-lg font-bold text-gray-800">
              {{ editData ? $t('edit') : $t('add') }}
            </h3>
            <button class="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
              @click="closeForm">
              <closeIcon class="w-6 h-6" />
            </button>
          </div>
          <div class="p-6 overflow-y-auto">
            <Form :edit-data="editData" @close="closeForm" @saved="onSaved" />
          </div>
        </div>
      </div>
    </Transition>

    <!-- CONFIRM MODAL (Delete) -->
    <ConfirmModal v-if="showConfirmModal" :show="showConfirmModal" :title="$t('delete')"
      :message="`${itemToDelete?.name_uz} — ${$t('delete')}?`" :confirm-text="$t('delete')"
      :cancel-text="$t('cancel')" type="danger" :duration="5" @confirm="handleConfirmDelete"
      @cancel="showConfirmModal = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import ResponsiveTable from "@/components/common/ResponsiveTable.vue";
import Form from "./Form.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import PayTypeService from "@/services/pay-type.service";
import { editIcon, trashIcon, addIcon, closeIcon } from "@/components/icons/icon-temp";
import BaseSearch from "@/components/form/BaseSearch.vue";
import BaseButton from "@/components/form/BaseButton.vue";
import UpdateButton from "@/components/form/UpdateButton.vue";
import { useGlobalStore } from "@/stores/global";

const { t, locale } = useI18n();
const globalStore = useGlobalStore();
const items = ref([]);
const searchQuery = ref("");

const showModal = ref(false);
const editData = ref(null);
const showConfirmModal = ref(false);
const itemToDelete = ref(null);

const colorClasses = {
  success: 'bg-green-100 text-green-700',
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-yellow-100 text-yellow-700',
  primary: 'bg-indigo-100 text-indigo-700',
  purple: 'bg-purple-100 text-purple-700',
  danger: 'bg-red-100 text-red-700',
  default: 'bg-gray-100 text-gray-600',
};

const nameKey = computed(() => 'name_' + (locale.value === 'uzk' ? 'uzk' : locale.value === 'ru' ? 'ru' : 'uz'));

const columns = computed(() => [
  { key: "id", label: "#", headerClass: "w-16 text-center text-gray-500 font-medium", class: "font-bold text-blue-600 text-center bg-gray-50", render: (row, i) => i + 1 },
  { key: "name", label: "Key", class: "font-mono text-gray-600" },
  { key: nameKey.value, label: t('name'), class: "font-semibold text-gray-800" },
  { key: "color", label: t('pay_type_color'), slot: "color" },
  { key: "order", label: t('pay_type_order'), class: "text-center" },
  { key: "is_default", label: t('is_default'), slot: "is_default", class: "text-center" },
  { key: "actions", label: t('actions'), slot: "actions", headerClass: "text-end pr-4", class: "pr-2" },
]);

const getModels = async () => {
  items.value = await PayTypeService.all();
};

const filteredItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return items.value;
  return items.value.filter((item) =>
    item.name?.toLowerCase().includes(q) ||
    item.name_uz?.toLowerCase().includes(q) ||
    item.name_ru?.toLowerCase().includes(q)
  );
});

const openForm = (data = null) => { editData.value = data; showModal.value = true; };
const closeForm = () => { showModal.value = false; editData.value = null; };

const onSaved = async () => {
  await getModels();
  globalStore.fetchPayTypes();
};

const promptDelete = (item) => {
  itemToDelete.value = item;
  showConfirmModal.value = true;
};

const handleConfirmDelete = async () => {
  if (!itemToDelete.value) return;
  try {
    await PayTypeService.delete(itemToDelete.value.id);
    showConfirmModal.value = false;
    itemToDelete.value = null;
    await getModels();
    globalStore.fetchPayTypes();
  } catch (err) {
    console.error(err);
    showConfirmModal.value = false;
  }
};

onMounted(() => getModels());
</script>
