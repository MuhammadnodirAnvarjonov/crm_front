<template>
  <div class="p-4 md:p-6 bg-white dark:bg-slate-800 rounded-3xl h-full shadow-xl dark:shadow-slate-900/50 border border-gray-100 dark:border-slate-700 flex flex-col">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <!-- Title -->
      <h2 class="text-2xl font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
        <span>{{ $t('employees') }}</span>
        <span class="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-lg border border-blue-100 dark:border-blue-900/50">
          {{ filteredUsers.length }}
        </span>
      </h2>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <!-- Search Input -->
        <BaseSearch v-model="searchQuery" />

        <!-- Hikvision Sync Button -->
        <!-- <BaseButton @click="syncToHikvision" :label="'Hikvision sync'" status="blue" :disabled="syncing">
          <template #icon>
            <syncIcon />
          </template>
        </BaseButton> -->

        <!-- Add Button -->
        <BaseButton @click="openForm()" :label="$t('add')" status="pink">
          <template #icon>
            <addIcon />
          </template>
        </BaseButton>
        <UpdateButton @click="getUsers" />
      </div>
    </div>

    <!-- Table Section -->
    <div class="flex-1 min-h-0 overflow-hidden rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50/30 dark:bg-slate-900/30">
      <ResponsiveTable :columns="columns" :data="filteredUsers" :rowClass="getRowClass" @refresh="getUsers">
        <template #user="{ item }">
          <div class="flex items-center gap-3">
            <img v-if="item.image" :src="fileUrl + item.image"
              class="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-slate-600 shrink-0 cursor-pointer hover:ring-2 hover:ring-pink-300 dark:hover:ring-pink-500 transition-all"
              @click.stop="previewImage = fileUrl + item.image" />
            <div v-else class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style="background: linear-gradient(135deg, #E91E8C, #13286e)">
              {{ item.user_name?.charAt(0).toUpperCase() }}
            </div>
            <span class="font-semibold text-gray-800 dark:text-slate-100">{{ item.user_name }}</span>
          </div>
        </template>
        <template #palata_share="{ item }">
          <div class="text-center text-xs">
            <span v-if="Number(item.palata_percent)" class="font-bold text-purple-600 dark:text-purple-400">{{ Number(item.palata_percent) }}%</span>
            <span v-if="Number(item.palata_percent) && Number(item.palata_summa)" class="text-gray-400 dark:text-slate-500 mx-0.5">+</span>
            <span v-if="Number(item.palata_summa)" class="font-bold text-green-600 dark:text-green-400">{{ Number(item.palata_summa).toLocaleString() }}</span>
            <span v-if="!Number(item.palata_percent) && !Number(item.palata_summa)" class="text-gray-400 dark:text-slate-500">—</span>
          </div>
        </template>
        <template #actions="{ item }">
          <div class="flex items-center justify-end gap-2">
            <!-- View -->
            <button
              class="group p-2 rounded-lg bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 active:scale-90 transition-all duration-200"
              :title="$t('view')" @click="openView(item)">
              <viewIcon size="w-4 h-4" class="group-hover:scale-110 transition-transform" />
            </button>

            <!-- Edit -->
            <button
              class="group p-2 rounded-lg bg-white dark:bg-slate-800 border border-amber-100 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-200 active:scale-90 transition-all duration-200"
              :title="$t('edit')" @click="openForm(item)">
              <editIcon size="w-4 h-4" class="group-hover:scale-110 transition-transform" />
            </button>

            <!-- Delete -->
            <button
              class="group p-2 rounded-lg bg-white dark:bg-slate-800 border border-red-100 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 active:scale-90 transition-all duration-200"
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
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="closeForm"></div>

        <!-- Modal Content -->
        <div class="modal-content relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[90vh]">
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/40 rounded-t-2xl">
            <h3 class="text-lg font-bold text-gray-800 dark:text-slate-100">
              {{ editData ? $t('edit') : $t('add') }}
            </h3>
            <button class="text-gray-400 dark:text-white hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
              @click="closeForm">
              <closeIcon class="w-6 h-6" />
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 overflow-y-auto">
            <Form :edit-data="editData" @close="closeForm" @saved="getUsers" />
          </div>
        </div>
      </div>
    </Transition>

    <!-- MODAL: View -->
    <Transition name="modal">
      <div v-if="showViewModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="closeView"></div>

        <div class="modal-content relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl p-6">
          <button class="absolute top-4 right-4 text-gray-400 dark:text-white hover:text-red-500 dark:hover:text-red-400 transition-colors" @click="closeView">
            <closeIcon class="w-6 h-6" />
          </button>
          <div class="mb-4 pb-2 border-b border-gray-100 dark:border-slate-700">
            <h3 class="text-lg font-bold text-gray-800 dark:text-slate-100">{{ $t('details') }}</h3>
          </div>
          <View :view-data="selectedUser" @close="closeView" />
        </div>
      </div>
    </Transition>

    <!-- IMAGE PREVIEW MODAL -->
    <Transition name="modal">
      <div v-if="previewImage" class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        @click="previewImage = null">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <img :src="previewImage" class="relative max-w-sm max-h-[80vh] rounded-2xl shadow-2xl object-contain" @click.stop />
        <button class="absolute top-6 right-6 text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          @click="previewImage = null">
          <closeIcon class="w-7 h-7" />
        </button>
      </div>
    </Transition>

    <!-- CONFIRM MODAL (Delete) -->
    <ConfirmModal v-if="showConfirmModal" :show="showConfirmModal" :title="$t('delete')"
      :message="`${itemToDelete?.user_name} ${$t('confirm_delete_user')}`" :confirm-text="$t('yes_delete')"
      :cancel-text="$t('cancel')" type="danger" :duration="5" @confirm="handleConfirmDelete"
      @cancel="showConfirmModal = false" />

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, inject } from "vue";
import { useI18n } from "vue-i18n";
import ResponsiveTable from "@/components/common/ResponsiveTable.vue";
import Form from "./Form.vue";
import View from "./View.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import userService from "@/services/users.service";
import { usePhoneFormat } from "@/composables/NumberFormat";
import { editIcon, viewIcon, trashIcon, addIcon, closeIcon } from "@/components/icons/icon-temp";
import BaseSearch from "@/components/form/BaseSearch.vue";
import BaseButton from "@/components/form/BaseButton.vue";
import UpdateButton from "@/components/form/UpdateButton.vue";

const { t } = useI18n();
const fileUrl = inject("fileUrl", "");

// Data States
const users = ref([]);
const searchQuery = ref("");
const searchedOnce = ref(false);

// Modal States
const showModal = ref(false);
const showViewModal = ref(false);
const editData = ref(null);
const selectedUser = ref(null);

// Delete Modal States
const showConfirmModal = ref(false);
const itemToDelete = ref(null);

// Image Preview
const previewImage = ref(null);

// Table Columns
const columns = [
  { key: 'id', label: '#', headerClass: 'w-16 text-center text-gray-500 dark:text-slate-400 font-medium', class: 'font-bold text-blue-600 dark:text-blue-400 text-center bg-gray-50 dark:bg-slate-900/40', render: (row, index) => index + 1 },
  { key: 'user_name', label: t('user'), slot: 'user', class: "font-semibold text-gray-800 dark:text-slate-100" },
  { key: 'gender', label: t('gender'), render: (row) => row.gender === 'male' ? t('male') : row.gender === 'female' ? t('female') : '—', headerClass: 'text-center', class: 'text-center font-medium' },
  { key: 'role.name', label: t('role'), render: (row) => row.role?.name || '—', class: 'font-medium' },
  { key: 'phone', label: t('phone'), render: (row) => usePhoneFormat(row.phone), class: 'font-medium text-blue-600 dark:text-blue-400' },
  { key: 'actions', label: t('actions'), slot: 'actions', headerClass: 'text-end pr-4', class: 'pr-2' },
];

// Row class: role yo'q bo'lsa qizil
const getRowClass = (row) => {
  if (!row.role_id) return 'bg-red-200 dark:bg-red-900/40 hover:bg-red-300 dark:hover:bg-red-900/60 text-red-900 dark:text-red-200';
  return '';
};

// 🔹 Ma'lumotlarni olish
const getUsers = async () => {
  try {
    users.value = await userService.all();
    searchedOnce.value = false;
  } catch (err) {
    console.error("Users loading error:", err);
  }
};

// 🔹 Computed Filter
const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return users.value;

  return users.value.filter((user) =>
    user.user_name?.toLowerCase().includes(q) ||
    user.phone?.includes(q)
  );
});

// 🔹 Search Watcher (Backend Search bilan)
let debounceTimer;
watch(searchQuery, (val) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    if (!val) {
      await getUsers();
      return;
    }

    const local = users.value.filter((user) =>
      user.user_name?.toLowerCase().includes(val.trim().toLowerCase()) ||
      user.phone?.includes(val.trim())
    );

    if (local.length === 0 && !searchedOnce.value) {
      try {
        const result = await userService.all({ text: val });
        if (result?.length) {
          users.value = [...users.value, ...result];
        }
        searchedOnce.value = true;
      } catch (err) {
        console.error("Backend qidiruv xatosi:", err);
      }
    }
  }, 300);
});

// 🔹 Modal Actions
const openForm = (data = null) => { editData.value = data; showModal.value = true; };
const closeForm = () => { showModal.value = false; editData.value = null; };
const openView = (user) => { selectedUser.value = user; showViewModal.value = true; };
const closeView = () => { showViewModal.value = false; selectedUser.value = null; };

// 🔹 O‘chirish (Confirm Modal orqali)
const promptDelete = (item) => {
  itemToDelete.value = item;
  showConfirmModal.value = true;
};

const handleConfirmDelete = async () => {
  if (!itemToDelete.value) return;

  try {
    // Diqqat: Asl kodda ModelService bo'lgan, lekin bu User sahifasi.
    // Shu sababli userService.delete ishlatildi.
    await userService.delete(itemToDelete.value.id);
    showConfirmModal.value = false;
    itemToDelete.value = null;
    await getUsers();
  } catch (err) {
    console.error("O‘chirish xatosi:", err);
    showConfirmModal.value = false;
  }
};

onMounted(() => getUsers());
</script>