<template>
  <div class="flex flex-col gap-3 h-full overflow-hidden">

    <!-- ═══ STATS ═══ -->
    <div class="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3 flex-shrink-0">
      <button v-for="stat in statCards" :key="stat.key"
        class="flex flex-col items-start p-3 md:p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-left"
        :class="activeStatus === stat.key
          ? stat.activeClass
          : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'" @click="toggleStatusFilter(stat.key)">
        <span class="text-[10px] md:text-xs font-bold uppercase tracking-wide mb-1 opacity-70">{{ stat.label }}</span>
        <span class="text-xl md:text-2xl font-black">{{ stats[stat.key] ?? 0 }}</span>
      </button>
    </div>

    <!-- ═══ FILTER BAR ═══ -->
    <div
      class="flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-col sm:flex-row gap-2">
      <!-- Search -->
      <BaseInput v-model="searchQuery" placeholder="Mijoz, telefon yoki mavzu..." class="flex-1"/>
      <!-- Source filter -->
      <BaseSelect v-model="filterSource" :options="sourceOptions" placeholder="Barcha manbalar" :clearable="false" class="sm:w-44"/>
      <!-- Add button -->
      <BaseButton @click="openForm()" label="Yangi murojaat" size="sm">
        <template #icon>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </template>
      </BaseButton>
    </div>

    <!-- ═══ MAIN CONTENT ═══ -->
    <!-- MOBILE/TABLET (< lg): Tab + card list -->
    <div class="lg:hidden flex-1 flex flex-col gap-3 min-h-0">
      <!-- Category tabs — horizontal scroll allowed here (small scrollbar) -->
      <div class="flex-shrink-0 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          class="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all"
          :class="mobileTab === null ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'"
          @click="mobileTab = null">
          Hammasi
          <span class="bg-white/30 text-inherit text-[10px] px-1.5 py-0.5 rounded-md">{{ filteredAll.length }}</span>
        </button>
        <button v-for="cat in categories" :key="cat.id"
          class="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all"
          :class="mobileTab === cat.id
            ? 'text-white border-transparent'
            : 'bg-white text-gray-600 border-gray-200'"
          :style="mobileTab === cat.id ? { backgroundColor: cat.color, borderColor: cat.color } : {}"
          @click="mobileTab = cat.id">
          {{ cat.name }}
          <span class="text-[10px] px-1.5 py-0.5 rounded-md"
            :class="mobileTab === cat.id ? 'bg-white/30' : 'bg-gray-100'">
            {{ filteredByCategory(cat.id).length }}
          </span>
        </button>
      </div>

      <!-- Card list -->
      <div class="flex-1 overflow-y-auto space-y-2 pb-2 scrollbar-thin">
        <template v-if="mobileCards.length">
          <div v-for="item in mobileCards" :key="item.id"
            class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
            @click="viewItem(item)">
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="flex items-center gap-2 flex-wrap min-w-0">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md" :class="statusClass(item.status)">
                  {{ getStatusLabel(item.status) }}
                </span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                  :style="{ backgroundColor: item.category?.color || '#6366f1' }">
                  {{ item.category?.name }}
                </span>
              </div>
              <button @click.stop="openForm(item)"
                class="flex-shrink-0 p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 opacity-0 group-hover:opacity-100 transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>

            <h4 class="font-bold text-gray-800 text-sm mb-2 line-clamp-2">{{ item.subject }}</h4>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2 min-w-0">
                <span class="text-base">{{ getSourceIcon(item.source) }}</span>
                <span class="text-xs text-gray-600 font-medium truncate">
                  {{ item.patient?.full_name || item.patient_name || 'Noma\'lum' }}
                </span>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <span class="text-[10px] font-bold" :class="priorityClass(item.priority)">
                  {{ getPriorityLabel(item.priority) }}
                </span>
                <span class="text-[10px] text-gray-400">{{ formatDate(item.createdAt) }}</span>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="flex flex-col items-center justify-center py-16 text-gray-400">
          <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p class="text-sm font-medium">Murojaatlar topilmadi</p>
        </div>
      </div>
    </div>

    <!-- DESKTOP (>= lg): Kanban board — fixed height, internal horizontal scroll -->
    <div
      class="hidden lg:flex flex-1 w-full min-w-0 min-h-0 gap-4 overflow-x-auto overflow-y-hidden pb-4 scrollbar-thin snap-x snap-mandatory">

      <div v-for="cat in groupedModels" :key="cat.id"
        class="flex-shrink-0 w-72 xl:w-80 flex flex-col gap-3 snap-start h-full">


        <!-- Column header -->
        <div class="flex items-center justify-between px-1 flex-shrink-0">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ backgroundColor: cat.color }"></span>
            <h3 class="font-bold text-gray-700 text-sm truncate">{{ cat.name }}</h3>
            <span class="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex-shrink-0">
              {{ cat.items.length }}
            </span>
          </div>

          <button @click="openForm({ category_id: cat.id })"
            class="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex-shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <!-- Cards column — scrollable vertically -->
        <div
          class="flex-1 overflow-y-auto overflow-x-hidden space-y-2.5 pr-1 scrollbar-thin bg-gray-100/60 rounded-2xl p-2.5">
          <div v-for="item in cat.items" :key="item.id"
            class="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
            @click="viewItem(item)">

            <div class="flex items-start justify-between mb-2">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-md" :class="statusClass(item.status)">
                {{ getStatusLabel(item.status) }}
              </span>
              <button @click.stop="openForm(item)"
                class="opacity-0 group-hover:opacity-100 p-1 rounded-md text-amber-500 hover:bg-amber-50 transition-all flex-shrink-0">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>

            <h4
              class="font-bold text-gray-800 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {{ item.subject }}
            </h4>

            <p v-if="item.sub_category" class="text-[10px] text-blue-500 font-semibold mb-2"># {{ item.sub_category.name
            }}
            </p>

            <div class="bg-gray-50 rounded-lg px-2.5 py-2 mb-2.5">
              <p class="text-xs font-semibold text-gray-700 truncate">
                {{ item.patient?.full_name || item.patient_name || 'Noma\'lum' }}
              </p>
              <p class="text-[10px] text-gray-400 truncate">{{ item.patient?.phone1 || item.patient_phone || '' }}</p>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-gray-100">
              <div class="flex items-center gap-1.5">
                <span class="text-sm" :title="getSourceLabel(item.source)">{{ getSourceIcon(item.source) }}</span>
                <span class="text-[10px] font-bold" :class="priorityClass(item.priority)">
                  {{ getPriorityLabel(item.priority) }}
                </span>
              </div>
              <span class="text-[10px] text-gray-400">{{ formatDate(item.createdAt) }}</span>
            </div>
          </div>

          <div v-if="cat.items.length === 0"
            class="py-8 text-center text-gray-400 text-[11px] font-semibold uppercase tracking-widest">
            Bo'sh
          </div>
        </div>
      </div>

      <!-- Empty state when no categories -->
      <div v-if="!groupedModels.length" class="flex-1 flex items-center justify-center text-gray-400">
        <div class="text-center">
          <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p class="font-medium text-sm">Kategoriya topilmadi</p>
          <p class="text-xs mt-1">Avval CRM kategoriyalarini qo'shing</p>
        </div>
      </div>
    </div>

    <!-- ═══ MODALS ═══ -->
    <Transition name="modal">
      <div v-if="showModal" class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeForm"></div>
        <div
          class="relative bg-white w-full sm:max-w-3xl sm:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
          <div
            class="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-3xl sm:rounded-t-2xl flex-shrink-0">
            <h3 class="text-base font-bold text-gray-800">{{ editData?.subject ? 'Tahrirlash' : 'Yangi murojaat' }}</h3>
            <button @click="closeForm"
              class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-4 sm:p-6">
            <AppealForm :edit-data="editData" @close="closeForm" @saved="handleSaved" />
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="showViewModal" class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeView"></div>
        <div
          class="relative bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
          <AppealView :model="selectModel" @close="closeView" @edit="(item) => { closeView(); openForm(item); }"
            @status-changed="handleSaved" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import CrmAppealService from "@/services/crm_appeal.service";
import CrmCategoryService from "@/services/crm_category.service";
import AppealForm from "./Form.vue";
import AppealView from "./View.vue";
import BaseInput from "@/components/form/BaseInput.vue";
import BaseSelect from "@/components/form/BaseSelect.vue";
import BaseButton from "@/components/form/BaseButton.vue";

const sourceOptions = [
  { id: '', name: 'Barcha manbalar' },
  { id: 'phone', name: '📞 Telefon' },
  { id: 'telegram', name: '✈️ Telegram' },
  { id: 'instagram', name: '📷 Instagram' },
  { id: 'whatsapp', name: '💬 WhatsApp' },
  { id: 'walk_in', name: '🚶 Shaxsan' },
  { id: 'email', name: '📧 Email' },
];

const models = ref([]);
const categories = ref([]);
const stats = ref({ total: 0, new: 0, in_progress: 0, resolved: 0, closed: 0 });
const searchQuery = ref("");
const filterSource = ref("");
const activeStatus = ref("");
const mobileTab = ref(null);   // null = hammasi
const showModal = ref(false);
const showViewModal = ref(false);
const editData = ref(null);
const selectModel = ref(null);

/* ── Lookup data ─────────────────────────────────── */
const sources = [
  { value: 'phone', label: 'Telefon', icon: '📞' },
  { value: 'telegram', label: 'Telegram', icon: '✈️' },
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { value: 'walk_in', label: 'Shaxsan', icon: '🚶' },
  { value: 'email', label: 'Email', icon: '📧' },
];

const statCards = [
  { key: 'total', label: 'Jami', activeClass: 'bg-slate-700 text-white border-slate-700' },
  { key: 'new', label: 'Yangi', activeClass: 'bg-blue-600 text-white border-blue-600' },
  { key: 'in_progress', label: 'Jarayonda', activeClass: 'bg-amber-500 text-white border-amber-500' },
  { key: 'resolved', label: 'Hal etildi', activeClass: 'bg-green-600 text-white border-green-600' },
  { key: 'closed', label: 'Yopildi', activeClass: 'bg-gray-500 text-white border-gray-500' },
];

/* ── Helpers ─────────────────────────────────────── */
const getSourceIcon = (s) => sources.find(x => x.value === s)?.icon || '🔹';
const getSourceLabel = (s) => sources.find(x => x.value === s)?.label || s;
const getStatusLabel = (s) => ({ new: 'Yangi', in_progress: 'Jarayonda', resolved: 'Hal etildi', closed: 'Yopildi', cancelled: 'Bekor' }[s] || s);
const getPriorityLabel = (p) => ({ low: 'Past', medium: 'O\'rta', high: 'Yuqori', urgent: 'Tezkor' }[p] || p);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' }) : '—';

const statusClass = (s) => ({
  new: 'bg-blue-50 text-blue-600',
  in_progress: 'bg-amber-50 text-amber-600',
  resolved: 'bg-green-50 text-green-600',
  closed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-50 text-red-500',
}[s] || 'bg-gray-100 text-gray-500');

const priorityClass = (p) => ({
  low: 'text-gray-400',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-600',
}[p] || '');

/* ── Filtering ───────────────────────────────────── */
const baseFilter = (list) => list.filter(m => {
  const q = searchQuery.value.toLowerCase();
  const matchSearch = !q ||
    m.subject?.toLowerCase().includes(q) ||
    m.patient_name?.toLowerCase().includes(q) ||
    m.patient?.full_name?.toLowerCase().includes(q) ||
    m.patient?.phone1?.includes(q) ||
    m.patient_phone?.includes(q);
  const matchSource = !filterSource.value || m.source === filterSource.value;
  const matchStatus = !activeStatus.value || activeStatus.value === 'total' || m.status === activeStatus.value;
  return matchSearch && matchSource && matchStatus;
});

const filteredAll = computed(() => baseFilter(models.value));
const filteredByCategory = (catId) => filteredAll.value.filter(m => m.category_id === catId);

// Mobile: show all OR filter by tab
const mobileCards = computed(() =>
  mobileTab.value === null
    ? filteredAll.value
    : filteredAll.value.filter(m => m.category_id === mobileTab.value)
);

// Desktop: Kanban columns
const groupedModels = computed(() =>
  categories.value.map(cat => ({ ...cat, items: filteredByCategory(cat.id) }))
);

/* ── API ─────────────────────────────────────────── */
const getModels = async () => {
  const [data, cats, statistics] = await Promise.all([
    CrmAppealService.all(),
    CrmCategoryService.all(),
    CrmAppealService.stats(),
  ]);
  models.value = Array.isArray(data) ? data : data?.data || [];
  categories.value = Array.isArray(cats) ? cats : cats?.data || [];
  stats.value = statistics?.data || statistics || {};
};

const toggleStatusFilter = (key) => {
  activeStatus.value = activeStatus.value === key ? "" : key;
};

/* ── CRUD ────────────────────────────────────────── */
const openForm = (data = null) => { editData.value = data; showModal.value = true; };
const closeForm = () => { showModal.value = false; editData.value = null; };
const viewItem = (item) => { selectModel.value = item; showViewModal.value = true; };
const closeView = () => { showViewModal.value = false; selectModel.value = null; };
const handleSaved = async () => { await getModels(); };

onMounted(getModels);
</script>

<style scoped>
/* Thin scrollbar - horizontal & vertical */
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 99px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
