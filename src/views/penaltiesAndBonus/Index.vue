<template>
  <div class="p-4 md:p-6 bg-white rounded-3xl h-full shadow-xl border border-gray-100 flex flex-col">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <span>{{ $t('penalties_and_bonus') }}</span>
        <span class="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
          {{ filteredModels.length }}
        </span>
      </h2>

      <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <BaseSearch v-model="searchQuery" />
        <BaseButton @click="openForm()" :label="$t('add')" status="pink">
          <template #icon>
            <addIcon />
          </template>
        </BaseButton>
        <UpdateButton @click="getModels" />
      </div>
    </div>

    <!-- Table Section -->
    <div class="flex-1 min-h-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50/30">
      <ResponsiveTable :columns="columns" :data="filteredModels" @refresh="getModels">
        <template #actions="{ item }">
          <div class="flex items-center justify-end gap-2">
            <button
              class="group p-2 rounded-lg bg-white border border-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-200 active:scale-90 transition-all duration-200"
              :title="$t('view')" @click="viewItem(item)">
              <viewIcon size="w-4 h-4" class="group-hover:scale-110 transition-transform" />
            </button>
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
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-[15px] w-[2800px] h-full">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="closeForm"></div>
        <div class="modal-content relative bg-white rounded-2xl shadow-2xl flex flex-col w-full h-full">
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
            <Form :edit-data="editData" @close="closeForm" @saved="getModels" />
          </div>
        </div>
      </div>
    </Transition>

    <!-- MODAL: View -->
    <Transition name="modal">
      <div v-if="showViewModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="closeView"></div>
        <div class="modal-content relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
          <button class="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors" @click="closeView">
            <closeIcon class="w-6 h-6" />
          </button>
          <div class="mb-4 pb-2 border-b border-gray-100">
            <h3 class="text-lg font-bold text-gray-800">{{ $t('details') }}</h3>
          </div>
          <View :model="selectModel" @close="closeView" />
        </div>
      </div>
    </Transition>

    <!-- CONFIRM MODAL (Delete) -->
    <ConfirmModal v-if="showConfirmModal" :show="showConfirmModal" :title="$t('delete')"
      :message="`${itemToDelete?.min_time}-${itemToDelete?.max_time} daqiqalik jarimani o'chirishni tasdiqlaysizmi?`"
      :confirm-text="$t('confirm_yes_delete')" :cancel-text="$t('cancel')" type="danger" :duration="5"
      @confirm="handleConfirmDelete" @cancel="showConfirmModal = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import ResponsiveTable from "@/components/common/ResponsiveTable.vue";
import Form from "./Form.vue";
import View from "./View.vue";
import ModelService from "@/services/penalties_and_bonus.service";
import ConfirmModal from "@/components/ConfirmModal.vue";
import { editIcon, viewIcon, trashIcon, addIcon, closeIcon } from "@/components/icons/icon-temp";
import BaseSearch from "@/components/form/BaseSearch.vue";
import BaseButton from "@/components/form/BaseButton.vue";
import UpdateButton from "@/components/form/UpdateButton.vue";
import { useSummaFormat } from "@/composables/NumberFormat";

const { t } = useI18n();

const models = ref([]);
const searchQuery = ref("");
const showModal = ref(false);
const showViewModal = ref(false);
const editData = ref(null);
const selectModel = ref(null);
const showConfirmModal = ref(false);
const itemToDelete = ref(null);

const columns = [
  { key: "id", label: "#", headerClass: "w-16 text-center", class: "font-bold text-blue-600 text-center bg-gray-50", render: (row, i) => i + 1, hideOnMobile: true },
  { key: "min_time", label: t('min_time'), class: "font-semibold text-gray-800", render: (row) => row.min_time + " daq" },
  { key: "max_time", label: t('max_time'), class: "font-semibold text-gray-800", render: (row) => row.max_time + " daq" },
  { key: "summa", label: t('summa'), class: "font-semibold text-right text-blue-600", render: (row) => useSummaFormat(row.summa) },
  { key: "description", label: t('description'), class: "text-gray-600" },
  { key: "actions", label: t('actions'), slot: "actions", headerClass: "text-end pr-4", class: "pr-2" },
];

const getModels = async () => {
  try {
    models.value = await ModelService.all();
  } catch (err) {
    console.error("Loading error:", err);
  }
};

const filteredModels = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return models.value;
  return models.value.filter((b) =>
    b.description?.toLowerCase().includes(q) ||
    String(b.min_time).includes(q) ||
    String(b.max_time).includes(q)
  );
});

const openForm = (data = null) => { editData.value = data; showModal.value = true; };
const closeForm = () => { showModal.value = false; editData.value = null; };
const viewItem = (item) => { selectModel.value = item; showViewModal.value = true; };
const closeView = () => { showViewModal.value = false; selectModel.value = null; };

const promptDelete = (item) => {
  itemToDelete.value = item;
  showConfirmModal.value = true;
};

const handleConfirmDelete = async () => {
  if (!itemToDelete.value) return;
  try {
    await ModelService.delete(itemToDelete.value.id);
    showConfirmModal.value = false;
    itemToDelete.value = null;
    await getModels();
  } catch (err) {
    console.error("Delete error:", err);
    showConfirmModal.value = false;
  }
};

onMounted(() => getModels());
</script>
