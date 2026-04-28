<template>
  <div class="p-4 md:p-6 bg-white dark:bg-slate-800 rounded-3xl h-full shadow-xl dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 flex flex-col">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
        <span>{{ $t('job_types') }}</span>
        <span class="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-lg border border-blue-100 dark:border-blue-900/50">
          {{ filteredItems.length }}
        </span>
      </h2>

      <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <BaseSearch v-model="searchQuery" />
        <BaseButton @click="openForm()" :label="$t('add')" status="pink">
          <template #icon>
            <addIcon />
          </template>
        </BaseButton>
        <BaseButton @click="openMoreForm()" label="Ko'proq qo'shish" status="primary">
          <template #icon>
            <addIcon />
          </template>
        </BaseButton>
        <UpdateButton @click="getItems" />
      </div>
    </div>

    <!-- Table -->
    <div class="flex-1 min-h-0 overflow-hidden rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50/30 dark:bg-slate-900/30">
      <ResponsiveTable :columns="columns" :data="filteredItems" @refresh="getItems">
        <template #actions="{ item }">
          <div class="flex items-center justify-end gap-2">
            <button
              class="group p-2 rounded-lg bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-200 active:scale-90 transition-all duration-200"
              :title="$t('edit')" @click="openForm(item)">
              <editIcon size="w-4 h-4" class="group-hover:scale-110 transition-transform" />
            </button>
            <button
              class="group p-2 rounded-lg bg-white dark:bg-slate-800 border border-red-100 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 active:scale-90 transition-all duration-200"
              title="O‘chirish" @click="promptDelete(item)">
              <trashIcon size="w-4 h-4" class="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </template>
      </ResponsiveTable>
    </div>

    <!-- Add / Edit Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="closeForm"></div>

        <div class="modal-content relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/40 rounded-t-2xl">
            <h3 class="text-lg font-bold text-gray-800 dark:text-slate-100">
              {{ editData ? $t('edit') : $t('add') }}
            </h3>
            <button class="text-gray-400 dark:text-white hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
              @click="closeForm">
              <closeIcon class="w-6 h-6" />
            </button>
          </div>
          <div class="p-6 overflow-y-auto">
            <Form :edit-data="editData" @close="closeForm" @saved="getItems" />
          </div>
        </div>
      </div>
    </Transition>

    <!-- Bulk Add Modal -->
    <Transition name="modal">
      <div v-if="showMoreModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="closeMoreForm"></div>

        <div class="modal-content relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
          <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/40 rounded-t-2xl">
            <h3 class="text-lg font-bold text-gray-800 dark:text-slate-100">
              Ko'proq qo'shish
            </h3>
            <button class="text-gray-400 dark:text-white hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
              @click="closeMoreForm">
              <closeIcon class="w-6 h-6" />
            </button>
          </div>
          <div class="p-6 overflow-y-auto">
            <MoreForm @close="closeMoreForm" @saved="getItems" />
          </div>
        </div>
      </div>
    </Transition>

    <!-- Confirm Delete -->
    <ConfirmModal v-if="showConfirmModal" :show="showConfirmModal" :title="$t('delete')"
      :message="`${itemToDelete?.name_uz} ni o‘chirishni tasdiqlaysizmi?`" confirm-text="Ha, o‘chirish"
      :cancel-text="$t('cancel')" type="danger" :duration="5" @confirm="handleConfirmDelete"
      @cancel="showConfirmModal = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import ResponsiveTable from "@/components/common/ResponsiveTable.vue";
import Form from "./Form.vue";
import MoreForm from "./MoreForm.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import jobTypeService from "@/services/jobTypes.service";
import { editIcon, trashIcon, addIcon, closeIcon } from "@/components/icons/icon-temp";
import BaseSearch from "@/components/form/BaseSearch.vue";
import BaseButton from "@/components/form/BaseButton.vue";
import UpdateButton from "@/components/form/UpdateButton.vue";

const { t } = useI18n();
const items = ref([]);
const searchQuery = ref("");
const searchedOnce = ref(false);

const showModal = ref(false);
const editData = ref(null);

const showMoreModal = ref(false);

const showConfirmModal = ref(false);
const itemToDelete = ref(null);

const columns = [
  { key: "id", label: "#", headerClass: "w-16 text-center text-gray-500 dark:text-slate-400 font-medium", class: "font-bold text-blue-600 dark:text-blue-400 text-center bg-gray-50 dark:bg-slate-900/40", render: (row, index) => index + 1 },
  { key: "name_uz", label: t('name_uz'), class: "font-semibold text-gray-800 dark:text-slate-100" },
  { key: "name_uzk", label: t('name_uzk'), class: "text-gray-700 dark:text-slate-200" },
  { key: "name_ru", label: t('name_ru'), class: "text-gray-700 dark:text-slate-200" },
  { key: "index", label: t('index'), class: "text-center text-gray-700 dark:text-slate-200" },
  { key: "actions", label: t('actions'), slot: "actions", headerClass: "text-end pr-4", class: "pr-2" },
];

const getItems = async () => {
  items.value = await jobTypeService.all();
  searchedOnce.value = false;
};

const filteredItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return items.value;
  return items.value.filter((b) =>
    b.name_uz?.toLowerCase().includes(q) ||
    b.name_uzk?.toLowerCase().includes(q) ||
    b.name_ru?.toLowerCase().includes(q)
  );
});

let debounceTimer;
watch(searchQuery, (val) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    if (!val) {
      await getItems();
      return;
    }
    const local = filteredItems.value;
    if (local.length === 0 && !searchedOnce.value) {
      try {
        const result = await jobTypeService.all({ text: val });
        if (result?.length) {
          items.value = [...items.value, ...result];
        }
        searchedOnce.value = true;
      } catch (err) {
        console.error("Backend qidiruv xatosi:", err);
      }
    }
  }, 300);
});

const openForm = (data = null) => { editData.value = data; showModal.value = true; };
const closeForm = () => { showModal.value = false; editData.value = null; };

const openMoreForm = () => { showMoreModal.value = true; };
const closeMoreForm = () => { showMoreModal.value = false; };

const promptDelete = (item) => {
  itemToDelete.value = item;
  showConfirmModal.value = true;
};

const handleConfirmDelete = async () => {
  if (!itemToDelete.value) return;
  try {
    await jobTypeService.delete(itemToDelete.value.id);
    showConfirmModal.value = false;
    itemToDelete.value = null;
    await getItems();
  } catch (err) {
    console.error("O‘chirish xatosi:", err);
    showConfirmModal.value = false;
  }
};

onMounted(() => getItems());
</script>
