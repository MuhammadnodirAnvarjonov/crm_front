<template>
  <div class="p-4 md:p-6 bg-white rounded-3xl h-full shadow-xl border border-gray-100 flex flex-col">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <!-- Title -->
      <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <span>{{ $t('roles') }}</span>
        <span class="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
          {{ filteredRoles.length }}
        </span>
      </h2>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <!-- Search Input -->
        <BaseSearch v-model="searchQuery" />

        <!-- Add Button -->
        <BaseButton @click="openForm()" :label="$t('add')" status="pink">
          <template #icon>
            <addIcon />
          </template>
        </BaseButton>
        <UpdateButton @click="getRoles" />
      </div>
    </div>

    <!-- Table Section -->
    <div class="flex-1 min-h-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50/30">
      <ResponsiveTable :columns="columns" :data="filteredRoles" @refresh="getRoles">
        <template #actions="{ item }">
          <div class="flex items-center justify-end gap-2">
            <!-- View -->
            <button
              class="group p-2 rounded-lg bg-white border border-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-200 active:scale-90 transition-all duration-200"
              title="Ko‘rish" @click="viewItem(item)">
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
              title="O‘chirish" @click="promptDelete(item)">
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
        <div
          class="modal-content relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl flex flex-col max-h-[90vh]">
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
            <h3 class="text-lg font-bold text-gray-800">
              {{ editData ? $t('edit') : $t('add') }}
            </h3>
            <button class="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
              @click="closeForm">
              <closeIcon class="w-6 h-6" />
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 overflow-y-auto">
            <Form :edit-data="editData" @close="closeForm" @saved="getRoles" />
          </div>
        </div>
      </div>
    </Transition>

    <!-- MODAL: View -->
    <Transition name="modal">
      <div v-if="showViewModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="closeView"></div>

        <div class="modal-content relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-3xl p-6">
          <button class="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors" @click="closeView">
            <closeIcon class="w-6 h-6" />
          </button>
          <div class="mb-4 pb-2 border-b border-gray-100">
            <h3 class="text-lg font-bold text-gray-800">{{ $t('details') }}</h3>
          </div>
          <View :role="selectedRole" @close="closeView" />
        </div>
      </div>
    </Transition>

    <!-- CONFIRM MODAL (Delete) -->
    <ConfirmModal v-if="showConfirmModal" :show="showConfirmModal" :title="$t('delete')"
      :message="`${itemToDelete?.name} rolini o‘chirishni tasdiqlaysizmi?`" confirm-text="Ha, o‘chirish"
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
import ConfirmModal from "@/components/ConfirmModal.vue"; // ConfirmModal
import roleService from "@/services/roles.service";
import { editIcon, viewIcon, trashIcon, addIcon, closeIcon } from "@/components/icons/icon-temp";
import BaseSearch from "@/components/form/BaseSearch.vue";
import BaseButton from "@/components/form/BaseButton.vue";
import UpdateButton from "@/components/form/UpdateButton.vue";

const { t } = useI18n();
const roles = ref([]);
const searchQuery = ref("");
const searchedOnce = ref(false);

// Modal states
const showModal = ref(false);
const showViewModal = ref(false);
const editData = ref(null);
const selectedRole = ref(null);

// Delete Modal states
const showConfirmModal = ref(false);
const itemToDelete = ref(null);

const columns = [
  { key: "id", label: "#", headerClass: "w-16 text-center text-gray-500 font-medium", class: "font-bold text-blue-600 text-center bg-gray-50", render: (row, index) => index + 1 },
  { key: "name", label: t('name'), class: "font-semibold text-gray-800" },
  { key: "comment", label: t('comment'), class: "text-gray-500 italic" },
  { key: "actions", label: t('actions'), slot: "actions", headerClass: "text-end pr-4", class: "pr-2" },
];

// 🔹 Ma'lumotlarni olish
const getRoles = async () => {
  roles.value = await roleService.all();
  searchedOnce.value = false;
};

// 🔹 Computed Filter
const filteredRoles = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return roles.value;
  return roles.value.filter((b) => b.name?.toLowerCase().includes(q));
});

// 🔹 Search Watcher
let debounceTimer;
watch(searchQuery, (val) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    if (!val) {
      await getRoles();
      return;
    }

    const local = roles.value.filter((b) =>
      b.name?.toLowerCase().includes(val.trim().toLowerCase())
    );

    if (local.length === 0 && !searchedOnce.value) {
      try {
        const result = await roleService.all({ text: val });
        if (result?.length) {
          roles.value = [...roles.value, ...result];
        }
        searchedOnce.value = true;
      } catch (err) {
        console.error("Backend qidiruv xatosi:", err);
      }
    }
  }, 300);
});

// 🔹 Modal boshqaruvi
const openForm = (data = null) => { editData.value = data; showModal.value = true; };
const closeForm = () => { showModal.value = false; editData.value = null; };
const viewItem = (item) => { selectedRole.value = item; showViewModal.value = true; };
const closeView = () => { showViewModal.value = false; selectedRole.value = null; };

// 🔹 O‘chirish (Confirm Modal orqali)
const promptDelete = (item) => {
  itemToDelete.value = item;
  showConfirmModal.value = true;
};

const handleConfirmDelete = async () => {
  if (!itemToDelete.value) return;

  try {
    await roleService.delete(itemToDelete.value.id);
    showConfirmModal.value = false;
    itemToDelete.value = null;
    await getRoles();
  } catch (err) {
    console.error("O‘chirish xatosi:", err);
    showConfirmModal.value = false;
  }
};

onMounted(() => getRoles());
</script>
