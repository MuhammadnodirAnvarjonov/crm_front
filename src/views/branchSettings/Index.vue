<template>
  <div class="p-4 md:p-6 h-full flex flex-col gap-5 overflow-y-auto">
    <!-- ── HEADER ──────────────────────────────────────────────── -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-extrabold text-gray-900 tracking-tight">
          Blank sarlavhasi
        </h1>
        <p class="text-sm text-gray-400 mt-0.5">
          Pechat qilinganida hujjat yuqorisida chiqadigan ma'lumotlar (logo, manzil, telefon va h.k.)
        </p>
      </div>

      <!-- Branch Selector -->
      <div class="flex items-center gap-2">
        <BaseSelect
          :label="$t('branch')"
          v-model="selectedBranchId"
          :options="branches"
          label-key="name"
          value-key="id"
          :placeholder="$t('branch')"
          @update:modelValue="onBranchChange"
        />
        <button @click="refresh" :class="[
          'p-2.5 rounded-xl border transition-all',
          rotating
            ? 'border-blue-200 bg-blue-50'
            : 'border-gray-200 bg-white hover:bg-gray-50',
        ]" :title="$t('refresh')">
          <svg :class="[
            'w-4 h-4 text-gray-500 transition-transform duration-500',
            rotating && 'rotate-180',
          ]" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>
    </div>

    <!-- ════════════════════════════════════════
         FILIAL TANLANMAGAN — EMPTY STATE
    ════════════════════════════════════════ -->
    <Transition name="fade">
      <div v-if="!selectedBranchId"
        class="flex-1 flex items-center justify-center bg-white rounded-3xl border border-gray-100 shadow-sm py-20">
        <div class="text-center max-w-xs">
          <div class="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 00-1-1h-2a1 1 0 00-1 1v5m4 0H9" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-gray-700 mb-1">Filial tanlang</h3>
          <p class="text-sm text-gray-400">
            Yuqoridagi ro'yxatdan filial tanlang — blank sarlavhasini tahrirlash mumkin bo'ladi
          </p>
        </div>
      </div>
    </Transition>

    <!-- ════════════════════════════════════════
         ASOSIY KONTENT — TextEditor
    ════════════════════════════════════════ -->
    <Transition name="slide-up">
      <div v-if="selectedBranchId" class="flex flex-col gap-3">
        <!-- Card Header -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 class="font-bold text-gray-800 text-sm">
                  Blank sarlavhasi — {{ selectedBranchName }}
                </h2>
                <p class="text-xs text-gray-400">
                  Pechat qilinganida har bir hujjat yuqorisida shu kontent chiqadi
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <!-- Status badge -->
              <span v-if="isNew && !loading"
                class="text-xs font-medium px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Yangi
              </span>
              <span v-else-if="!isNew && !loading"
                class="text-xs font-medium px-3 py-1 rounded-full bg-green-50 text-green-600 border border-green-200 flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd" />
                </svg>
                Saqlangan
              </span>

              <!-- Save button -->
              <BaseButton status="primary" :loading="saving" @click="save" label="Saqlash" />
            </div>
          </div>

          <!-- Loading skeleton -->
          <div v-if="loading" class="p-8 flex items-center justify-center">
            <div class="flex flex-col items-center gap-3">
              <div class="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
              <p class="text-sm text-gray-400">Yuklanmoqda...</p>
            </div>
          </div>

          <!-- TextEditor -->
          <div v-else class="editor-container">
            <TextEditor
              :service="blankService"
              :selected-service-index="0"
              @update-text="onEditorUpdate"
            />
          </div>

          <!-- Footer -->
          <div v-if="!loading && lastSaved"
            class="px-4 py-2 border-t border-gray-100 bg-gray-50/60 flex items-center justify-end">
            <p class="text-xs text-gray-400">
              Oxirgi saqlash: {{ lastSaved }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import branchService from "@/services/branchs.service";
import settingService from "@/services/branch_setting.service";
import { useNotification } from "@/composables/useNotification";
import BaseSelect from "@/components/form/BaseSelect.vue";
import BaseButton from "@/components/form/BaseButton.vue";
import TextEditor from "@/views/registration/RegComponents/TextEditor.vue";
import { useUserStore } from "@/stores/user";

const { success, error } = useNotification();

// ── State ─────────────────────────────────────────────────────────────────
const userStore = useUserStore();
const branches = ref([]);

const selectedBranchId = ref(userStore.user?.branch_id);
const isNew = ref(false);
const loading = ref(false);
const saving = ref(false);
const rotating = ref(false);
const lastSaved = ref("");

// ── TextEditor uchun service wrapper ──────────────────────────────────────
// TextEditor { childs: [{ text: '...' }] } formatida ishlaydi
const blankService = reactive({
  childs: [{ name: "blank_header", text: "", price: 0, citizen_price: 0, stationar_price: 0 }],
});

// ── Computed ──────────────────────────────────────────────────────────────
const selectedBranchName = computed(() => {
  const b = branches.value.find((b) => b.id === selectedBranchId.value);
  return b?.name ?? "";
});

// ── Helpers ──────────────────────────────────────────────────────────────
function formatTime() {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

// TextEditor dan kelgan o'zgarishni qabul qilish
const onEditorUpdate = (updatedService) => {
  blankService.childs = updatedService.childs;
};

// ── Data Loading ──────────────────────────────────────────────────────────
async function loadBlankHeader() {
  if (!selectedBranchId.value) return;
  loading.value = true;
  isNew.value = false;
  blankService.childs = [{ name: "blank_header", text: "", price: 0, citizen_price: 0, stationar_price: 0 }];

  try {
    const data = await settingService.getOne(selectedBranchId.value, null);
    const headerVal = data?.settings?.blank_header;
    if (headerVal?.value) {
      blankService.childs[0].text = headerVal.value;
    }
  } catch (err) {
    if (err?.response?.status === 404 || err?.status === 404) {
      isNew.value = true;
    } else {
      error("Ma'lumotlarni yuklashda xatolik");
    }
  } finally {
    loading.value = false;
  }
}

async function onBranchChange(branchId) {
  lastSaved.value = "";
  blankService.childs = [{ name: "blank_header", text: "", price: 0, citizen_price: 0, stationar_price: 0 }];
  if (!branchId) return;
  await loadBlankHeader();
}

async function refresh() {
  rotating.value = true;
  await loadInitial();
  if (selectedBranchId.value) {
    await loadBlankHeader();
  }
  setTimeout(() => {
    rotating.value = false;
  }, 500);
}

async function loadInitial() {
  try {
    const branchRes = await branchService.all();
    branches.value = Array.isArray(branchRes) ? branchRes : [];

    if (selectedBranchId.value) {
      await loadBlankHeader();
    }
  } catch (e) {
    error("Ma'lumotlarni yuklashda xatolik");
  }
}

// ── Save ──────────────────────────────────────────────────────────────────
async function save() {
  if (!selectedBranchId.value) return;
  saving.value = true;

  const headerHtml = blankService.childs[0]?.text || "";

  try {
    if (isNew.value) {
      await settingService.create({
        branch_id: selectedBranchId.value,
        service_category_id: null,
        settings: { blank_header: headerHtml },
      });
      isNew.value = false;
    } else {
      await settingService.update(
        selectedBranchId.value,
        null,
        { blank_header: headerHtml }
      );
    }
    lastSaved.value = formatTime();
    success("Blank sarlavhasi saqlandi");
  } catch (e) {
    error("Saqlashda xatolik yuz berdi");
  } finally {
    saving.value = false;
  }
}

onMounted(loadInitial);
</script>

<style scoped>
.editor-container {
  padding: 0;
}
.editor-container :deep(.dte-wrap) {
  border: none;
  border-radius: 0;
}
.editor-container :deep(.dte-toolbar) {
  border-radius: 0;
}
.editor-container :deep(.dte-main) {
  max-height: 300px;
  overflow: hidden;
}
.editor-container :deep(.dte-paper-area) {
  overflow: hidden;
}
.editor-container :deep(.dte-body) {
  min-height: unset;
  height: 200px;
  overflow: hidden;
  resize: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
</style>
