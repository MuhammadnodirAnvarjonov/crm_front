<template>
  <div class="p-4 md:p-6 bg-white rounded-3xl h-full shadow-xl border border-gray-100 flex flex-col">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <!-- Title -->
      <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <span>{{ $t('services') }}</span>
        <span class="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
          {{ filteredModels.length }}
        </span>
      </h2>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <!-- User Filter -->
        <BaseSelect v-model="selectedUserId" :options="users" label-key="user_name" value-key="id" size="small" placeholder="Xodim bo'yicha" class="w-200" :clearable="true" />
        <!-- Search Input -->
        <BaseSearch v-model="searchQuery" />

        <!-- Add Button -->
        <BaseButton @click="openForm()" :label="$t('add')" status="pink">
          <template #icon>
            <addIcon />
          </template>
        </BaseButton>
        <BaseButton @click="migrateUsers" label="Xodimlarni ko'chirish" status="orange" :disabled="isMigrating">
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </template>
        </BaseButton>
        <UpdateButton @click="getModels" />
      </div>
    </div>
    <!-- Service Category Tabs -->
    <TabFilter :model-value="activeServiceId" :items="serviceCategories" :show-image="true" :file-url="fileUrl"
      @update:model-value="v => selectCategory(v)" class="mb-6" />
    <!-- Table Section -->
    <div class="flex-1 min-h-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50/30">
      <ResponsiveTable :columns="columns" :data="filteredModels" @refresh="getModels">
        <template #actions="{ item }">
          <div class="flex items-center justify-end gap-2">
            <!-- View -->
            <button
              class="group p-2 rounded-lg bg-white border border-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-200 active:scale-90 transition-all duration-200"
              title="Ko‘rish" @click.stop="viewItem(item)">
              <viewIcon size="w-4 h-4" class="group-hover:scale-110 transition-transform" />
            </button>

            <!-- Edit -->
            <button
              class="group p-2 rounded-lg bg-white border border-amber-100 text-amber-600 hover:bg-amber-50 hover:border-amber-200 active:scale-90 transition-all duration-200"
              :title="$t('edit')" @click.stop="openForm(item)">
              <editIcon size="w-4 h-4" class="group-hover:scale-110 transition-transform" />
            </button>

            <!-- Delete -->
            <button
              class="group p-2 rounded-lg bg-white border border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 active:scale-90 transition-all duration-200"
              title="O‘chirish" @click.stop="promptDelete(item)">
              <trashIcon size="w-4 h-4" class="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </template>
      </ResponsiveTable>
    </div>

    <!-- MODAL: Add / Edit -->
    <Transition name="modal">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"></div>

        <!-- Modal Content -->
        <div class="modal-content relative bg-white rounded-2xl shadow-2xl w-full flex flex-col max-h-[90vh]">
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
            <h3 class="text-lg font-bold text-gray-800">
              {{ editData ? $t('edit') : $t('add') }}
            </h3>
            <BaseButton size="sm" status="gray" @click="closeForm">
              <template #icon>
                <closeIcon class="w-6 h-6" />
              </template>
            </BaseButton>
          </div>

          <!-- Modal Body -->
          <div class="p-6 overflow-y-auto">
            <!-- editData bu yerga uzatiladi, Form.vue endi o'zi getById ni chaqiradi -->
            <Form :edit-data="editData" @close="closeForm" @saved="getModels" :category-id="activeServiceId" />
          </div>
        </div>
      </div>
    </Transition>

    <!-- MODAL: View -->
    <Transition name="modal">
      <div v-if="showViewModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="closeView"></div>

        <div class="modal-content relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
          <BaseButton size="sm" status="gray" class="absolute top-4 right-4" @click="closeView">
            <template #icon>
              <closeIcon class="w-6 h-6" />
            </template>
          </BaseButton>
          <div class="mb-4 pb-2 border-b border-gray-100">
            <h3 class="text-lg font-bold text-gray-800">{{ $t('details') }}</h3>
          </div>
          <View :model="selectModel" @close="closeView" />
        </div>
      </div>
    </Transition>

    <!-- CONFIRM MODAL (Delete) -->
    <ConfirmModal v-if="showConfirmModal" :show="showConfirmModal" :title="$t('delete')"
      :message="`${itemToDelete?.name} xizmatini o‘chirishni tasdiqlaysizmi?`" confirm-text="Ha, o‘chirish"
      :cancel-text="$t('cancel')" type="danger" :duration="5" @confirm="handleConfirmDelete"
      @cancel="showConfirmModal = false" />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from "vue";
import { useI18n } from "vue-i18n";
import ResponsiveTable from "@/components/common/ResponsiveTable.vue";
import TabFilter from "@/components/TabFilter.vue";
import Form from "./Form.vue";
import View from "./View.vue";
import ModelService from "@/services/service.service";
import ConfirmModal from "@/components/ConfirmModal.vue";
import { editIcon, viewIcon, trashIcon, addIcon, closeIcon } from "@/components/icons/icon-temp";
import BaseSearch from "@/components/form/BaseSearch.vue";
import BaseButton from "@/components/form/BaseButton.vue";
import UpdateButton from "@/components/form/UpdateButton.vue";
import serviceCategoryService from "@/services/service-category.service";
import usersService from "@/services/users.service";
import { useSummaFormat } from "@/composables/NumberFormat";
import BaseSelect from "@/components/form/BaseSelect.vue";
const { t } = useI18n();
const fileUrl = inject("fileUrl");
// Data States
const models = ref([]);
const serviceCategories = ref([]);
const searchQuery = ref("");
const searchedOnce = ref(false);
const activeServiceId = ref(null);
const selectedUserId = ref(null);
const users = ref([]);
// Modal States
const showModal = ref(false);
const showViewModal = ref(false);
const editData = ref(null);
const selectModel = ref(null);

// Delete Modal States
const showConfirmModal = ref(false);
const itemToDelete = ref(null);
const isMigrating = ref(false);

const migrateUsers = async () => {
  if (!confirm("Barcha xizmatlarning user_id larini service_users jadvaliga ko'chirishni tasdiqlaysizmi?")) return;
  isMigrating.value = true;
  try {
    const res = await ModelService.migrateUsers();
    alert(`Muvaffaqiyatli! ${res.data?.migrated || 0} ta xodim ko'chirildi.`);
    await getModels();
  } catch (err) {
    console.error("Migration xatosi:", err);
    alert("Xatolik yuz berdi!");
  } finally {
    isMigrating.value = false;
  }
};

// Table Columns
const columns = [
  { key: "id", label: "#", headerClass: "w-16 text-center text-gray-500 font-medium", class: "font-bold text-blue-600 text-center bg-gray-50", render: (row, i) => i + 1 },
  { key: "name", label: t('name'), class: "font-semibold text-gray-800" },
  { key: "section.name", label: t('section'), class: "font-semibold text-gray-800" },
  { key: "service_category.name", label: t('service-category'), class: "font-semibold text-gray-800" },
  { key: "user.user_name", label: t('doctor'), class: "font-semibold text-gray-800" },
  {
    key: "price", label: t('price'), class: "font-semibold text-gray-800 text-right",
    render: (row) => {
      return useSummaFormat(row.price);
    }
  },
  { key: "user_bonus", label: t('bonus'), class: "font-semibold text-gray-800 text-right" },
  { key: "index", label: t('index'), class: "font-semibold text-gray-800 text-right" },
  { key: "actions", label: t('actions'), slot: "actions", headerClass: "text-end pr-4", class: "pr-2" },
];

// 🔹 Ma'lumotlarni olish
const getModels = async () => {
  let filterHeader = {
    service_category_id: activeServiceId.value,
  }
  if (selectedUserId.value) filterHeader.user_id = selectedUserId.value;
  models.value = await ModelService.all(filterHeader);
  searchedOnce.value = false;
};

const getCategories = async () => {
  serviceCategories.value = await serviceCategoryService.all() || [];
};

// 🔹 Filterlash
const filteredModels = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return models.value;
  return models.value.filter((b) => b.name?.toLowerCase().includes(q));
});

// 🔹 Qidiruv kuzatuvchi
let debounceTimer;
watch(searchQuery, (val) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    if (!val) {
      await getModels();
      return;
    }

    const local = models.value.filter((b) =>
      b.name?.toLowerCase().includes(val.trim().toLowerCase())
    );

    if (local.length === 0 && !searchedOnce.value) {
      try {
        const result = await ModelService.all({ text: val });
        if (result?.length) {
          models.value = [...models.value, ...result];
        }
        searchedOnce.value = true;
      } catch (err) {
        console.error("Backend qidiruv xatosi:", err);
      }
    }
  }, 300);
});

// 🔹 Modal Actions
const openForm = (data = null) => {
  editData.value = data;
  showModal.value = true;
};
const closeForm = () => { showModal.value = false; editData.value = null; };
const viewItem = (item) => { selectModel.value = item; showViewModal.value = true; };
const closeView = () => { showViewModal.value = false; selectModel.value = null; };

// 🔹 O‘chirish (Confirm Modal orqali)
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
    console.error("O‘chirish xatosi:", err);
    showConfirmModal.value = false;
  }
};

const getUsers = async () => {
  users.value = await usersService.all() || [];
};

onMounted(async () => {
  await getModels()
  await getCategories()
  await getUsers()
});

const selectCategory = async (id) => {
  activeServiceId.value = id;
  await getModels();
};

watch(selectedUserId, () => getModels());
</script>