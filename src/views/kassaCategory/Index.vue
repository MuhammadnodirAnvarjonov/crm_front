<template>
  <div class="p-4 md:p-6 bg-white rounded-3xl h-full shadow-xl border border-gray-100 flex flex-col">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <!-- Title -->
      <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <span>{{ $t('kassa-categories') }}</span>
        <span class="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
          {{ filteredModels.length }}
        </span>
      </h2>

      <!-- Actions -->
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

    <!-- Filter Section -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div class="flex flex-wrap items-center gap-4">
        <TabFilter
          :model-value="activeTab"
          :items="tabs.filter(t => t.value !== 'all')"
          value-key="value"
          label-key="label"
          all-value="all"
          @update:model-value="v => { activeTab = v }"
        />
        <div class="w-full sm:w-64">
          <BaseSelect v-model="kassaParentId" :options="kassaParents" label-key="name" value-key="id"
            :placeholder="$t('kassa-parents')" class="!mb-0" />
        </div>
      </div>
      <button v-if="hasFilters" @click="resetFilters"
        class="text-sm font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-1">
        {{ $t('reset_filter') }}
      </button>
    </div>

    <!-- Table Section -->
    <div class="flex-1 min-h-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50/30 relative">
      <!-- Loading Overlay -->
      <div v-if="loading"
        class="absolute inset-0 bg-white/60 z-20 backdrop-blur-[2px] flex items-center justify-center">
        <div class="flex flex-col items-center gap-2">
          <i class="pi pi-spin pi-spinner text-4xl text-blue-600"></i>
          <span class="text-sm font-bold text-gray-500 tracking-widest uppercase">{{ $t('loading') }}</span>
        </div>
      </div>

      <ResponsiveTable :columns="columns" :data="filteredModels" @refresh="getModels">
        <!-- Custom Name Slot -->
        <template #nameSlot="{ item }">
          <div class="flex items-center gap-3 py-1 group">
            <div :class="[
              'w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border transition-all group-hover:scale-110',
              item.type === 'kirim' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
            ]">
              <i :class="item.type === 'kirim' ? 'pi pi-plus-circle' : 'pi pi-minus-circle'" class="text-lg"></i>
            </div>
            <div class="flex flex-col">
              <span class="text-gray-900 font-bold leading-none">{{ item.name }}</span>
              <span class="text-[11px] text-gray-400 mt-1 font-medium italic">
                {{ item.kassa_parent?.name || '---' }}
              </span>
            </div>
          </div>
        </template>

        <!-- Actions Slot -->
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
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="closeForm"></div>
        <div
          class="modal-content relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
            <h3 class="text-lg font-bold text-gray-800">{{ editData ? $t('edit') : $t('add') }}</h3>
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

    <ConfirmModal v-if="showConfirmModal" :show="showConfirmModal" :title="$t('delete')"
      :message="`${itemToDelete?.name} ni tizimdan o‘chirishga rozimisiz?`" @confirm="handleConfirmDelete"
      @cancel="showConfirmModal = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import ModelService from "@/services/kassa-category.service";
import kassaParentService from "@/services/kassa-parent.service";
import ResponsiveTable from "@/components/common/ResponsiveTable.vue";
import TabFilter from "@/components/TabFilter.vue";
import BaseSelect from "@/components/form/BaseSelect.vue";
import Form from "./Form.vue";
import View from "./View.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import BaseSearch from "@/components/form/BaseSearch.vue";
import BaseButton from "@/components/form/BaseButton.vue";
import UpdateButton from "@/components/form/UpdateButton.vue";
import { editIcon, viewIcon, trashIcon, addIcon, closeIcon } from "@/components/icons/icon-temp";

const { t } = useI18n();

// 🔹 States
const models = ref([]);
const kassaParents = ref([]);
const loading = ref(false);
const searchQuery = ref("");
const activeTab = ref('all');
const kassaParentId = ref(null);

const showModal = ref(false);
const showViewModal = ref(false);
const selectModel = ref(null);
const editData = ref(null);
const showConfirmModal = ref(false);
const itemToDelete = ref(null);

const tabs = [
  { label: t('all'), value: 'all' },
  { label: t('income'), value: 'kirim' },
  { label: t('expense'), value: 'chiqim' },
];

const columns = [
  { key: "id", label: "#", class: "w-12 text-center text-gray-400", render: (r, i) => i + 1 },
  { key: "nameSlot", label: t('name'), slot: "nameSlot" },
  { key: "comment", label: t('comment'), class: "text-gray-500 text-sm italic" },
  { key: "branch.name", label: t('branch'), class: "font-medium text-gray-600" },
  { key: "actions", label: "", slot: "actions", headerClass: "text-end" },
];

// 🔹 1. Local Filtering Logic
const filteredModels = computed(() => {
  let list = models.value;

  if (activeTab.value !== 'all') {
    list = list.filter(m => String(m.type) === activeTab.value);
  }

  if (kassaParentId.value) {
    list = list.filter(m => m.kassa_parent_id === kassaParentId.value);
  }

  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter(m => m.name?.toLowerCase().includes(q));
  }

  return list;
});

const hasFilters = computed(() => {
  return searchQuery.value || activeTab.value !== 'all' || kassaParentId.value;
});

// 🔹 2. Backend Search Logic
const fetchFromBackend = async () => {
  loading.value = true;
  try {
    const params = {
      text: searchQuery.value || undefined,
      type: activeTab.value === 'all' ? undefined : activeTab.value,
      kassa_parent_id: kassaParentId.value || undefined
    };
    const res = await ModelService.all(params);
    models.value = res || [];
  } catch (err) {
    console.error("Backend fetch error:", err);
  } finally {
    loading.value = false;
  }
};

// 🔹 Watcher: Localda ma'lumot qolmasa backenddan qidirish (Debounce bilan)
let debounceTimer;
watch([searchQuery, activeTab, kassaParentId], () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    // Agar local natija 0 bo'lsa yoki biz filter qo'shsak, serverdan yangilashni tekshiramiz
    if (filteredModels.value.length === 0) {
      fetchFromBackend();
    }
  }, 400);
});

// 🔹 Data Loaders
const getModels = async () => {
  loading.value = true;
  models.value = await ModelService.all();
  loading.value = false;
};

const getKassaParents = async () => {
  kassaParents.value = await kassaParentService.all();
};

const resetFilters = () => {
  searchQuery.value = "";
  activeTab.value = "all";
  kassaParentId.value = null;
  getModels();
};

// 🔹 Modal Actions
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
    await getModels();
  } catch (err) {
    console.error(err);
  }
};

onMounted(async () => {
  await Promise.all([getModels(), getKassaParents()]);
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>