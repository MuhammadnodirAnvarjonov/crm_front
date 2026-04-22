<template>
  <div class="p-3 md:p-6 bg-gray-50/50 min-h-full flex flex-col gap-4">

    <!-- 1. Header: Sarlavha va Qo'shish tugmasi -->
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
      <div>
        <h2 class="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
          {{ $t('kassa-order') }}
          <span class="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
            {{ models.length }}
          </span>
        </h2>
      </div>

      <div class="flex items-center gap-2">
        <BaseButton status="primary" @click="openForm" class="!rounded-2xl shadow-blue-100 w-full md:w-auto">
          <template #icon>
            <addIcon size="w-5 h-5" color="currentColor" />
          </template>
          {{ $t('add') }}
        </BaseButton>
        <!-- Refresh Button -->
        <button @click="getModels"
          class="p-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex-shrink-0"
          style="background:#fdf0f8; border-color:#fce7f3; color:#E91E8C"
          @mouseenter="e => { e.currentTarget.style.background='#E91E8C'; e.currentTarget.style.color='white'; e.currentTarget.style.borderColor='#E91E8C' }"
          @mouseleave="e => { e.currentTarget.style.background='#fdf0f8'; e.currentTarget.style.color='#E91E8C'; e.currentTarget.style.borderColor='#fce7f3' }"
          :title="$t('refresh')">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
        </button>
      </div>
    </div>

    <!-- 2. Filter Bar: Qidiruv, Tablar va Selectlar -->
    <!-- Filter Bar qismi -->
    <div class="bg-white p-2 rounded-3xl shadow-sm border border-gray-100 space-y-5">
      <div class="flex justify-between flex-wrap gap-2">

        <!-- Tabs -->
        <TabFilter
          :model-value="activeTab"
          :items="tabs.filter(t => t.value !== 'all')"
          value-key="value"
          label-key="label"
          all-value="all"
          @update:model-value="v => { activeTab = v; getModels() }"
        />

        <div class="flex flex-wrap items-center gap-4">
          <BaseSearch v-model="searchQuery" @update:modelValue="debounceSearch" />
          <div>
            <DatePicker v-model="filterHeader.date" mode="datetimerange" :placeholder="$t('date')"
              @update:modelValue="getModels" />
          </div>
          <BaseSelect v-model="filterHeader.kassa_parent_id" :options="kassaParents" label-key="name" value-key="id"
            :placeholder="$t('kassa-parent')" class="!mb-0" @update:modelValue="changeKassaParent" />

          <BaseSelect v-model="filterHeader.kassa_category_id" :options="kassaCategories" label-key="name"
            value-key="id" :placeholder="$t('kassa-category')" class="!mb-0" :disabled="!filterHeader.kassa_parent_id"
            @update:modelValue="getModels" />
        </div>
      </div>
    </div>
    <!-- 3. Table Section -->
    <div class="flex-1 min-h-0 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      <ResponsiveTable :columns="columns" :data="models" :loading="loading" @refresh="getModels">

        <!-- Name & Type Slot -->
        <template #nameSlot="{ item }">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm shrink-0"
              :class="item.type === 'kirim' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'">
              <svg v-if="item.type === 'kirim'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
                  d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-gray-900 font-bold truncate">{{ item.kassa_category?.name || '-' }}</span>
              <span class="text-[10px] font-black uppercase tracking-widest text-gray-400">
                {{ item.kassa_parent?.name || 'No Category' }} / {{ item.kassa_category?.name || 'No Parent' }}
              </span>
            </div>
          </div>
        </template>

        <!-- Actions Slot -->
        <template #actions="{ item }">
          <div class="flex items-center justify-end gap-1.5">
            <button @click="viewItem(item)" class="p-2.5 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors">
              <viewIcon size="w-5 h-5" />
            </button>
            <button @click="openForm(item)" class="p-2.5 rounded-xl text-amber-500 hover:bg-amber-50 transition-colors">
              <editIcon size="w-5 h-5" />
            </button>
            <button @click="promptDelete(item)" class="p-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors">
              <trashIcon size="w-5 h-5" />
            </button>
          </div>
        </template>
      </ResponsiveTable>
    </div>

    <!-- Form Modal -->
    <Transition name="fade">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-md" @click="closeForm"></div>
        <div
          class="relative bg-white rounded-[24px] shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
          <div class="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-white">
            <div>
              <h3 class="text-xl font-black text-gray-800">{{ editData ? $t('edit') : $t('add') }}</h3>
            </div>
            <button @click="closeForm" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <closeIcon class="w-6 h-6 text-gray-400" />
            </button>
          </div>
          <div class="p-5 overflow-y-auto">
            <Form :edit-data="editData" @close="closeForm" @saved="getModels" />
          </div>
        </div>
      </div>
    </Transition>

    <!-- View Modal -->
    <Transition name="fade">
      <div v-if="showViewModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-md" @click="closeView"></div>
        <div class="relative bg-white rounded-[32px] shadow-2xl w-full max-w-lg p-8">
          <View :model="selectModel" @close="closeView" />
        </div>
      </div>
    </Transition>

    <ConfirmModal v-if="showConfirmModal" :show="showConfirmModal" :title="$t('delete')"
      :message="`${itemToDelete?.name} ni o‘chirishni tasdiqlaysizmi?`" @confirm="handleConfirmDelete"
      @cancel="showConfirmModal = false" />
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from "vue";
import { useI18n } from "vue-i18n";
import ResponsiveTable from "@/components/common/ResponsiveTable.vue";
import TabFilter from "@/components/TabFilter.vue";
import BaseSearch from "@/components/form/BaseSearch.vue";
import BaseButton from "@/components/form/BaseButton.vue";
import BaseSelect from "@/components/form/BaseSelect.vue";
import DatePicker from "@/components/form/DatePicker.vue";
import Form from "./Form.vue";
import View from "./View.vue";
import ModelService from "@/services/kassa-order.service";
import kassaCategoryService from "@/services/kassa-category.service";
import kassaParentService from "@/services/kassa-parent.service";
import ConfirmModal from "@/components/ConfirmModal.vue";
import { editIcon, viewIcon, trashIcon, addIcon, closeIcon } from "@/components/icons/icon-temp";
import { useUserStore } from "@/stores/user";
import { useSummaFormat } from "@/composables/NumberFormat";

const { t, locale } = useI18n();
const userStore = useUserStore();
const dayJS = inject("dayJS");
// States
const models = ref([]);
const kassaParents = ref([]);
const kassaCategories = ref([]);
const searchQuery = ref("");
const activeTab = ref('all');
const loading = ref(false);
const filterHeader = ref({
  date: [new Date().setHours(0, 0, 0, 0), new Date().setHours(23, 59, 59, 999)],
  kassa_parent_id: null,
  kassa_category_id: null,
  branch_id: userStore.user?.branch_id
});

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
  { key: "id", label: "#", headerClass: "w-14 text-center", class: "text-center font-bold text-gray-400", render: (row, i) => i + 1 },
  { key: "nameSlot", label: t('name'), slot: "nameSlot" },
  { key: "date_time", label: t('date'), class: "font-semibold text-gray-800 text-center", render: (row) => dayJS(row.date_time).format("DD-MM-YYYY HH:mm") },
  { key: "pay_type", label: t('pay type'), render: (row) => row.pay_type?.['name_' + locale.value] || row.pay_type?.name || '-' },
  { key: "summa", label: t('summa'), class: "font-semibold text-gray-800 text-right", render: (row) => useSummaFormat(row.summa) },
  { key: "comment", label: t('comment'), class: "text-gray-500 italic text-sm" },
  { key: "user.user_name", label: t('employee'), class: "text-gray-500 italic text-sm" },
  { key: "branch.name", label: t('branch'), render: (row) => row.branch?.name || '-' },
  { key: "actions", label: t('actions'), slot: "actions", headerClass: "text-end" },
];

const getModels = async () => {
  loading.value = true;
  try {
    const params = {
      text: searchQuery.value,
      type: activeTab.value,
      kassa_parent_id: filterHeader.value.kassa_parent_id,
      kassa_category_id: filterHeader.value.kassa_category_id,
      branch_id: filterHeader.value.branch_id,
    };

    // Sana oralig'ini tekshirish va paramsga qo'shish
    if (filterHeader.value.date && Array.isArray(filterHeader.value.date)) {
      if (filterHeader.value.date[0]) params.startDate = filterHeader.value.date[0];
      if (filterHeader.value.date[1]) params.endDate = filterHeader.value.date[1];
    }

    models.value = await ModelService.all(params);
  } catch (error) {
    console.error("Ma'lumot olishda xatolik:", error);
  } finally {
    loading.value = false;
  }
};

let searchTimeout;
const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => getModels(), 500);
};

const changeKassaParent = async (id) => {
  filterHeader.value.kassa_category_id = null;
  if (id) {
    kassaCategories.value = await kassaCategoryService.all({ kassa_parent_id: id });
  }
  getModels();
};



const openForm = (data = null) => { editData.value = data; showModal.value = true; };
const closeForm = () => { showModal.value = false; editData.value = null; };
const viewItem = (item) => { selectModel.value = item; showViewModal.value = true; };
const closeView = () => { showViewModal.value = false; selectModel.value = null; };

const promptDelete = (item) => {
  itemToDelete.value = item;
  showConfirmModal.value = true;
};

const handleConfirmDelete = async () => {
  await ModelService.delete(itemToDelete.value.id);
  showConfirmModal.value = false;
  getModels();
};

onMounted(async () => {
  getModels();
  kassaParents.value = await kassaParentService.all();
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>manage_your_transactions
