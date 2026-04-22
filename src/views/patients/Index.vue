<template>
  <div class="p-4 md:p-6 bg-white rounded-3xl h-full shadow-xl border border-gray-100 flex flex-col">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <!-- Title -->
      <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <span>{{ $t('patients') }}</span>
        <span class="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
          {{ filteredModels.length }}
        </span>
      </h2>

      <!-- Actions -->
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
            <!-- View -->
            <button
              class="group p-2 rounded-lg bg-white border border-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-200 active:scale-90 transition-all duration-200"
              title="Ko’rish" @click="viewItem(item)">
              <viewIcon size="w-4 h-4" class="group-hover:scale-110 transition-transform" />
            </button>

            <!-- Edit -->
            <button
              class="group p-2 rounded-lg bg-white border border-amber-100 text-amber-600 hover:bg-amber-50 hover:border-amber-200 active:scale-90 transition-all duration-200"
              :title="$t('edit')" @click="openForm(item)">
              <editIcon size="w-4 h-4" class="group-hover:scale-110 transition-transform" />
            </button>

            <!-- Delete -->
            <button
              class="group p-2 rounded-lg bg-white border border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 active:scale-90 transition-all duration-200"
              title="O’chirish" @click="promptDelete(item)">
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
        <div
          class="modal-content relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl flex flex-col max-h-[90vh]">
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
      :message="`${itemToDelete?.full_name} bemorini o’chirishni tasdiqlaysizmi?`" confirm-text="Ha, o’chirish"
      :cancel-text="$t('cancel')" type="danger" :duration="5" @confirm="handleConfirmDelete"
      @cancel="showConfirmModal = false" />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import ResponsiveTable from "@/components/common/ResponsiveTable.vue";
import Form from "./Form.vue";
import View from "./View.vue";
import ModelService from "@/services/patients.service";
import ConfirmModal from "@/components/ConfirmModal.vue";
import { editIcon, viewIcon, trashIcon, addIcon, closeIcon } from "@/components/icons/icon-temp";
import BaseSearch from "@/components/form/BaseSearch.vue";
import BaseButton from "@/components/form/BaseButton.vue";
import UpdateButton from "@/components/form/UpdateButton.vue";
import { usePhoneFormat } from "@/composables/NumberFormat";

const { t } = useI18n();

// Data states
const models = ref([]);

// UI/Logic states
const searchQuery = ref("");
const searchedOnce = ref(false);
const showModal = ref(false);
const showViewModal = ref(false);
const editData = ref(null);
const selectModel = ref(null);

// Delete Modal states
const showConfirmModal = ref(false);
const itemToDelete = ref(null);

const columns = [
  { key: "id", label: "#", headerClass: "w-12 text-center text-gray-500 font-medium", class: "text-center text-gray-500 font-medium", render: (row, i) => i + 1 },
  { key: "full_name", label: t('full_name'), class: "font-semibold text-gray-700" },
  { key: "phone1", label: t('phone'), render: (row) => row.phone1 }, // Format funksiyasini shu yerga qo'shish mumkin
  { key: "address", label: t('address'), class: "text-gray-600 truncate max-w-[150px]" },
  { key: "balance", label: t('balance'), class: "font-mono text-blue-600" },
  { key: "gender", label: t('gender'), render: (row) => row.gender === 'male' ? t('male') : t('female') },
  { key: "actions", label: t('actions'), slot: "actions", headerClass: "text-end w-32", class: "text-end" },
];

const getModels = async () => {
  try {
    const header = { text: searchQuery.value || null };
    models.value = await ModelService.all(header);
    searchedOnce.value = false;
  } catch (error) {
    console.error("Patients loading error:", error);
  }
};

const filteredModels = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return models.value;
  return models.value.filter((b) => 
    b.full_name?.toLowerCase().includes(q) || 
    b.phone1?.includes(q) ||
    b.passport?.toLowerCase().includes(q)
  );
});

let debounceTimer;
watch(searchQuery, (val) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    if (!val) {
      await getModels();
      return;
    }
    const local = models.value.filter((b) =>
      b.full_name?.toLowerCase().includes(val.trim().toLowerCase())
    );
    if (local.length === 0 && !searchedOnce.value) {
      try {
        const result = await ModelService.all({ text: val });
        if (result?.length) {
          models.value = result;
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
const viewItem = (item) => { selectModel.value = item; showViewModal.value = true; };
const closeView = () => { showViewModal.value = false; selectModel.value = null; };

// O’chirish (Confirm Modal orqali)
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
    console.error("O’chirish xatosi:", err);
    showConfirmModal.value = false;
  }
};

onMounted(async () => {
  await getModels();
});
</script>
