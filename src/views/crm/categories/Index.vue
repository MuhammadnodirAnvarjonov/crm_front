<template>
  <div class="p-4 md:p-6 bg-white rounded-3xl h-full shadow-xl border border-gray-100 flex flex-col">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <span>CRM Kategoriyalar</span>
        <span class="text-sm font-bold text-violet-600 bg-violet-50 px-2.5 py-0.5 rounded-lg border border-violet-100">
          {{ models.length }}
        </span>
      </h2>
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <div class="relative w-full sm:w-64 group">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input type="text" v-model="searchQuery" placeholder="Qidirish..."
            class="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:bg-white focus:ring-4 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all" />
        </div>
        <button
          class="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-violet-500/30 active:scale-95 transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
          @click="openForm()">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Qo'shish</span>
        </button>
      </div>
    </div>

    <!-- Cards Grid -->
    <div class="flex-grow overflow-y-auto">
      <div v-if="filteredModels.length > 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="item in filteredModels" :key="item.id"
          class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-300">
          <!-- Category header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md"
                :style="{ backgroundColor: item.color || '#7c3aed' }">
                {{ item.name?.charAt(0)?.toUpperCase() }}
              </div>
              <div>
                <h3 class="font-bold text-gray-800 text-base">{{ item.name }}</h3>
                <p class="text-xs text-gray-400">{{ item.sub_categories?.length || 0 }} ta kichik kategoriya</p>
              </div>
            </div>
            <span class="px-2 py-1 text-xs rounded-lg font-medium"
              :class="item.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'">
              {{ item.is_active ? 'Faol' : 'Faol emas' }}
            </span>
          </div>

          <!-- Description -->
          <p v-if="item.description" class="text-sm text-gray-500 mb-3 line-clamp-2">{{ item.description }}</p>

          <!-- Sub-categories preview -->
          <div v-if="item.sub_categories?.length" class="flex flex-wrap gap-1.5 mb-3">
            <span v-for="sub in item.sub_categories.slice(0, 4)" :key="sub.id"
              class="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
              {{ sub.name }}
            </span>
            <span v-if="item.sub_categories.length > 4" class="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md">
              +{{ item.sub_categories.length - 4 }}
            </span>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-3 border-t border-gray-100">
            <span class="text-xs text-gray-400">ID: {{ item.id }}</span>
            <div class="flex gap-2">
              <button @click="openForm(item)" class="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition" :title="$t('edit')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button @click="promptDelete(item)" class="p-2 rounded-lg text-red-600 hover:bg-red-50 transition" :title="$t('delete')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center h-64 text-gray-400">
        <div class="bg-gray-50 p-6 rounded-full mb-4">
          <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p>Ma'lumot topilmadi</p>
      </div>
    </div>

    <!-- Form Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeForm"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
            <h3 class="text-lg font-bold text-gray-800">{{ editData ? 'Tahrirlash' : 'Yangi kategoriya' }}</h3>
            <button class="text-gray-400 hover:text-red-500 transition p-1" @click="closeForm">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6 overflow-y-auto">
            <CategoryForm :edit-data="editData" @close="closeForm" @saved="getModels" />
          </div>
        </div>
      </div>
    </Transition>

    <!-- Confirm Delete -->
    <ConfirmModal v-if="showConfirmModal" :show="showConfirmModal" :title="$t('delete')"
      :message="`'${itemToDelete?.name}' kategoriyasini o'chirasizmi?`"
      :confirm-text="$t('confirm_yes_delete')" :cancel-text="$t('cancel')" type="danger"
      @confirm="handleConfirmDelete" @cancel="showConfirmModal = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import CrmCategoryService from "@/services/crm_category.service";
import CategoryForm from "./Form.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";

const models = ref([]);
const searchQuery = ref("");
const showModal = ref(false);
const showConfirmModal = ref(false);
const editData = ref(null);
const itemToDelete = ref(null);

const filteredModels = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return models.value;
  return models.value.filter(m => m.name?.toLowerCase().includes(q));
});

const getModels = async () => {
  models.value = await CrmCategoryService.all();
  console.log(models.value);
};

const openForm = (data = null) => { editData.value = data; showModal.value = true; };
const closeForm = () => { showModal.value = false; editData.value = null; };
const promptDelete = (item) => { itemToDelete.value = item; showConfirmModal.value = true; };
const handleConfirmDelete = async () => {
  if (!itemToDelete.value) return;
  try { await CrmCategoryService.delete(itemToDelete.value.id); await getModels(); }
  catch (err) { console.error(err); }
  showConfirmModal.value = false;
};

onMounted(() => getModels());
</script>
