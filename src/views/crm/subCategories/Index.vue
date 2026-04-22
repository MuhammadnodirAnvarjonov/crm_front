<template>
  <div class="p-4 md:p-6 bg-white rounded-3xl h-full shadow-xl border border-gray-100 flex flex-col">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <span>Kichik Kategoriyalar</span>
        <span class="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
          {{ filteredModels.length }}
        </span>
      </h2>
      <div class="flex flex-wrap items-center gap-3">
        <BaseInput v-model="searchQuery" placeholder="Qidirish..."/>
        <BaseSelect v-model="filterCategoryId" :options="categoryFilterOptions" :clearable="false"/>
        <BaseButton @click="openForm()" label="Qo'shish">
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </template>
        </BaseButton>
      </div>
    </div>

    <!-- Table -->
    <div class="flex-grow overflow-auto">
      <table v-if="filteredModels.length > 0" class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 text-gray-500 font-semibold text-xs uppercase tracking-wide">
            <th class="px-4 py-3 text-left rounded-l-xl">#</th>
            <th class="px-4 py-3 text-left">Nom</th>
            <th class="px-4 py-3 text-left">Kategoriya</th>
            <th class="px-4 py-3 text-left">Tavsif</th>
            <th class="px-4 py-3 text-left">Tartib</th>
            <th class="px-4 py-3 text-left">Holat</th>
            <th class="px-4 py-3 text-center rounded-r-xl">Amallar</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="(item, idx) in filteredModels" :key="item.id"
            class="hover:bg-indigo-50/30 transition-colors group">
            <td class="px-4 py-3 text-gray-400">{{ idx + 1 }}</td>
            <td class="px-4 py-3 font-semibold text-gray-800">{{ item.name }}</td>
            <td class="px-4 py-3">
              <span v-if="item.category" class="inline-flex items-center px-2.5 py-1 rounded-lg text-white text-xs font-semibold shadow-sm"
                :style="{ backgroundColor: item.category.color || '#6366f1' }">
                {{ item.category.name }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">{{ item.description || '—' }}</td>
            <td class="px-4 py-3 text-gray-500">{{ item.sort_order }}</td>
            <td class="px-4 py-3">
              <span class="px-2.5 py-1 rounded-lg text-xs font-semibold"
                :class="item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'">
                {{ item.is_active ? 'Faol' : 'Faol emas' }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <div class="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="openForm(item)" class="p-1.5 rounded-lg text-amber-600 hover:bg-amber-100 transition">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="promptDelete(item)" class="p-1.5 rounded-lg text-red-600 hover:bg-red-100 transition">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="flex flex-col items-center justify-center h-64 text-gray-400">
        <div class="bg-gray-50 p-6 rounded-full mb-4">
          <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <p>Ma'lumot topilmadi</p>
      </div>
    </div>

    <!-- Form Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeForm"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
            <h3 class="text-lg font-bold text-gray-800">{{ editData ? 'Tahrirlash' : 'Yangi kichik kategoriya' }}</h3>
            <button class="text-gray-400 hover:text-red-500 transition p-1" @click="closeForm">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6 overflow-y-auto">
            <SubCategoryForm :edit-data="editData" :categories="categories" @close="closeForm" @saved="getModels" />
          </div>
        </div>
      </div>
    </Transition>

    <ConfirmModal v-if="showConfirmModal" :show="showConfirmModal" :title="$t('delete')"
      :message="`'${itemToDelete?.name}' ni o'chirasizmi?`"
      :confirm-text="$t('confirm_yes_delete')" :cancel-text="$t('cancel')" type="danger"
      @confirm="handleConfirmDelete" @cancel="showConfirmModal = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import CrmSubCategoryService from "@/services/crm_sub_category.service";
import CrmCategoryService from "@/services/crm_category.service";
import SubCategoryForm from "./Form.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import BaseInput from "@/components/form/BaseInput.vue";
import BaseSelect from "@/components/form/BaseSelect.vue";
import BaseButton from "@/components/form/BaseButton.vue";

const models = ref([]);
const categories = ref([]);
const searchQuery = ref("");
const filterCategoryId = ref("");

const categoryFilterOptions = computed(() => [
  { id: '', name: 'Barcha kategoriyalar' },
  ...categories.value
]);
const showModal = ref(false);
const showConfirmModal = ref(false);
const editData = ref(null);
const itemToDelete = ref(null);

const filteredModels = computed(() => {
  let list = models.value;
  const q = searchQuery.value.trim().toLowerCase();
  if (q) list = list.filter(m => m.name?.toLowerCase().includes(q));
  if (filterCategoryId.value) list = list.filter(m => m.category_id == filterCategoryId.value);
  return list;
});

const getModels = async () => {
  [models.value, categories.value] = await Promise.all([
    CrmSubCategoryService.all(),
    CrmCategoryService.all(),
  ]);
};

const openForm = (data = null) => { editData.value = data; showModal.value = true; };
const closeForm = () => { showModal.value = false; editData.value = null; };
const promptDelete = (item) => { itemToDelete.value = item; showConfirmModal.value = true; };
const handleConfirmDelete = async () => {
  if (!itemToDelete.value) return;
  try { await CrmSubCategoryService.delete(itemToDelete.value.id); await getModels(); }
  catch (err) { console.error(err); }
  showConfirmModal.value = false;
};

onMounted(() => getModels());
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
