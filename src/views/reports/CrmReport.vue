<template>
  <div class="h-full flex flex-col gap-2 min-h-0">

    <!-- Controls: sticky -->
    <div class="flex-shrink-0 flex flex-wrap items-end gap-2 bg-white rounded-xl px-2 py-1.5 border border-gray-100 shadow-sm">

      <!-- Tab switcher -->
      <div class="flex gap-1 bg-gray-100 rounded-xl p-1 mr-2">
        <button @click="view = 'hisobot'"
          class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
          :class="view === 'hisobot' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'">
          Hisobot
        </button>
        <button @click="view = 'sverka'"
          class="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
          :class="view === 'sverka' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-700'">
          Sverka
        </button>
      </div>

      <!-- Filters -->
      <BaseInput type="datetime-local" v-model="filter.datetime1" label="Dan" size="sm"/>
      <BaseInput type="datetime-local" v-model="filter.datetime2" label="Gacha" size="sm"/>
      <BaseSelect v-model="filter.status" :options="crmStatusOptions" label="Holat" :clearable="false" size="sm"/>

      <div class="flex gap-2 mt-auto">
        <BaseButton @click="loadReport" :disabled="loading" :loading="loading" label="Filterlash" size="sm"/>
        <BaseButton @click="resetFilter" label="Tozalash" status="gray" size="sm"/>
        <BaseButton @click="exportExcel" status="success" size="sm">
          <template #icon>
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
          </template>
          Excel
        </BaseButton>
      </div>
    </div>

    <!-- HISOBOT -->
    <div v-if="view === 'hisobot'" class="flex-1 flex flex-col gap-2 min-h-0">

      <!-- Summary cards -->
      <div v-if="summary && !loading" class="flex-shrink-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        <SummaryCard label="Jami murojaatlar" :value="summary.total_count" type="count" color="blue"/>
        <SummaryCard label="Yangi" :value="summary.by_status?.new || 0" type="count" color="indigo"/>
        <SummaryCard label="Jarayonda" :value="summary.by_status?.in_progress || 0" type="count" color="amber"/>
        <SummaryCard label="Hal qilindi" :value="summary.by_status?.resolved || 0" type="count" color="green"/>
        <SummaryCard label="Yopildi/Bekor" :value="(summary.by_status?.closed || 0) + (summary.by_status?.cancelled || 0)" type="count" color="red"/>
      </div>

      <!-- Grouped table by operator -->
      <div class="flex-1 overflow-auto rounded-xl border border-gray-100 min-h-0">
        <table class="w-full text-sm whitespace-nowrap">
          <thead class="bg-gray-50 text-gray-500 text-xs sticky top-0 z-10">
            <tr>
              <th class="px-2 py-1 text-left">#</th>
              <th class="px-2 py-1 text-left">Operator</th>
              <th class="px-2 py-1 text-right">Jami</th>
              <th class="px-2 py-1 text-right">Yangi</th>
              <th class="px-2 py-1 text-right">Jarayonda</th>
              <th class="px-2 py-1 text-right">Hal qilindi</th>
              <th class="px-2 py-1 text-right">Yopildi</th>
              <th class="px-2 py-1 text-right">Bekor</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="text-center py-6 text-gray-400">
                <div class="flex items-center justify-center gap-2">
                  <svg class="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  <span>Ma'lumotlar yuklanmoqda...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="groupedByOperator.length === 0">
              <td colspan="8" class="text-center py-6 text-gray-400">Ma'lumot yo'q. Avval filterlang.</td>
            </tr>
            <tr
              v-else
              v-for="(grp, i) in groupedByOperator"
              :key="grp.user_id"
              @click="openModal(grp)"
              class="border-t hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <td class="px-2 py-1 text-blue-600 font-bold">{{ i + 1 }}</td>
              <td class="px-2 py-1 font-medium text-gray-800">{{ grp.user_name }}</td>
              <td class="px-2 py-1 text-right font-bold text-blue-700">{{ grp.total }}</td>
              <td class="px-2 py-1 text-right text-indigo-600">{{ grp.new }}</td>
              <td class="px-2 py-1 text-right text-amber-600">{{ grp.in_progress }}</td>
              <td class="px-2 py-1 text-right text-green-600">{{ grp.resolved }}</td>
              <td class="px-2 py-1 text-right text-gray-500">{{ grp.closed }}</td>
              <td class="px-2 py-1 text-right text-red-500">{{ grp.cancelled }}</td>
            </tr>
          </tbody>
          <tfoot v-if="groupedByOperator.length" class="bg-blue-50 font-semibold text-sm border-t-2 border-blue-200 sticky bottom-0">
            <tr>
              <td class="px-2 py-1" colspan="2">JAMI</td>
              <td class="px-2 py-1 text-right text-blue-700">{{ summary?.total_count || 0 }}</td>
              <td class="px-2 py-1 text-right text-indigo-600">{{ summary?.by_status?.new || 0 }}</td>
              <td class="px-2 py-1 text-right text-amber-600">{{ summary?.by_status?.in_progress || 0 }}</td>
              <td class="px-2 py-1 text-right text-green-600">{{ summary?.by_status?.resolved || 0 }}</td>
              <td class="px-2 py-1 text-right text-gray-500">{{ summary?.by_status?.closed || 0 }}</td>
              <td class="px-2 py-1 text-right text-red-500">{{ summary?.by_status?.cancelled || 0 }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- SVERKA: individual transactions -->
    <div v-if="view === 'sverka'" class="flex-1 overflow-auto rounded-xl border border-gray-100 min-h-0">
      <table id="crm-report-table" class="w-full text-sm whitespace-nowrap">
        <thead class="bg-gray-50 text-gray-500 text-xs sticky top-0 z-10">
          <tr>
            <th class="px-2 py-1 text-left">#</th>
            <th class="px-2 py-1 text-left">Sana</th>
            <th class="px-2 py-1 text-left">Bemor</th>
            <th class="px-2 py-1 text-left">Operator</th>
            <th class="px-2 py-1 text-left">Kategoriya</th>
            <th class="px-2 py-1 text-left">Mavzu</th>
            <th class="px-2 py-1 text-center">Holat</th>
            <th class="px-2 py-1 text-center">Ustuvorlik</th>
            <th class="px-2 py-1 text-left">Manba</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="9" class="text-center py-6 text-gray-400">
              <div class="flex items-center justify-center gap-2">
                <svg class="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                <span>Ma'lumotlar yuklanmoqda...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="rows.length === 0">
            <td colspan="9" class="text-center py-6 text-gray-400">Ma'lumotlar topilmadi</td>
          </tr>
          <template v-else>
            <tr v-for="(row, i) in rows" :key="row.id" class="border-t hover:bg-gray-50">
              <td class="px-2 py-1 text-blue-600 font-bold">{{ i + 1 }}</td>
              <td class="px-2 py-1 text-gray-500 text-xs">{{ formatDatetime(row.createdAt) }}</td>
              <td class="px-2 py-1">
                <div class="font-medium text-gray-800">{{ row.patient?.full_name || row.patient_name || '—' }}</div>
                <div class="text-xs text-gray-400">{{ row.patient?.phone1 || row.patient_phone || '' }}</div>
              </td>
              <td class="px-2 py-1 text-gray-700 text-sm">{{ row.operator?.user_name || row.user?.user_name || '—' }}</td>
              <td class="px-2 py-1">
                <span class="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                  :style="{ backgroundColor: row.category?.color || '#6366f1' }">
                  {{ row.category?.name || '—' }}
                </span>
              </td>
              <td class="px-2 py-1 text-gray-800 max-w-[200px] truncate">{{ row.subject }}</td>
              <td class="px-2 py-1 text-center">
                <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="statusClass(row.status)">
                  {{ statusLabel(row.status) }}
                </span>
              </td>
              <td class="px-2 py-1 text-center">
                <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="priorityClass(row.priority)">
                  {{ priorityLabel(row.priority) }}
                </span>
              </td>
              <td class="px-2 py-1 text-gray-500 text-xs">{{ sourceLabel(row.source) }}</td>
            </tr>
          </template>
        </tbody>
        <tfoot v-if="rows.length" class="bg-blue-50 font-semibold text-sm border-t-2 border-blue-200 sticky bottom-0 z-10">
          <tr>
            <td class="px-2 py-1" colspan="9">JAMI: {{ rows.length }} ta murojaat</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- MODAL: Operator murojaatlari -->
    <Transition name="modal-fade">
      <div v-if="detailModal.show" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" @click.self="detailModal.show = false">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="detailModal.show = false"/>
        <div class="relative bg-white w-full sm:max-w-4xl sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh] z-10">

          <!-- Modal header -->
          <div class="flex items-center justify-between px-3 py-2 border-b border-gray-100">
            <div>
              <h3 class="font-bold text-gray-800 text-base">{{ detailModal.user_name }}</h3>
              <p class="text-xs text-gray-400 mt-0.5">
                Jami: <span class="font-semibold text-blue-700">{{ detailModal.rows.length }}</span> ta murojaat
              </p>
            </div>
            <div class="flex gap-2 items-center">
              <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">{{ detailModal.new }} Yangi</span>
              <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{{ detailModal.in_progress }} Jarayonda</span>
              <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">{{ detailModal.resolved }} Hal qilindi</span>
              <button @click="detailModal.show = false" class="ml-2 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Modal table -->
          <div class="overflow-auto flex-1">
            <table class="w-full text-sm whitespace-nowrap">
              <thead class="bg-gray-50 text-gray-500 text-xs sticky top-0">
                <tr>
                  <th class="px-2 py-1 text-left">#</th>
                  <th class="px-2 py-1 text-left">Sana</th>
                  <th class="px-2 py-1 text-left">Bemor</th>
                  <th class="px-2 py-1 text-left">Kategoriya</th>
                  <th class="px-2 py-1 text-left">Mavzu</th>
                  <th class="px-2 py-1 text-center">Holat</th>
                  <th class="px-2 py-1 text-center">Ustuvorlik</th>
                  <th class="px-2 py-1 text-left">Manba</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="detailModal.rows.length === 0">
                  <td colspan="8" class="text-center py-8 text-gray-400">Ma'lumot yo'q</td>
                </tr>
                <tr v-for="(row, i) in detailModal.rows" :key="row.id" class="border-t hover:bg-gray-50">
                  <td class="px-2 py-1 text-blue-600 font-bold">{{ i + 1 }}</td>
                  <td class="px-2 py-1 text-gray-500 text-xs">{{ formatDatetime(row.createdAt) }}</td>
                  <td class="px-2 py-1">
                    <div class="font-medium text-gray-800">{{ row.patient?.full_name || row.patient_name || '—' }}</div>
                    <div class="text-xs text-gray-400">{{ row.patient?.phone1 || row.patient_phone || '' }}</div>
                  </td>
                  <td class="px-2 py-1">
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                      :style="{ backgroundColor: row.category?.color || '#6366f1' }">
                      {{ row.category?.name || '—' }}
                    </span>
                  </td>
                  <td class="px-2 py-1 text-gray-800 max-w-[180px] truncate">{{ row.subject }}</td>
                  <td class="px-2 py-1 text-center">
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="statusClass(row.status)">
                      {{ statusLabel(row.status) }}
                    </span>
                  </td>
                  <td class="px-2 py-1 text-center">
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium" :class="priorityClass(row.priority)">
                      {{ priorityLabel(row.priority) }}
                    </span>
                  </td>
                  <td class="px-2 py-1 text-gray-500 text-xs">{{ sourceLabel(row.source) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { useUserStore } from '@/stores/user';
import reportService from '@/services/report.service';
import { useReportFilter } from '@/composables/useReportFilter';
import SummaryCard from './components/SummaryCard.vue';
import BaseInput from '@/components/form/BaseInput.vue';
import BaseSelect from '@/components/form/BaseSelect.vue';
import BaseButton from '@/components/form/BaseButton.vue';

const crmStatusOptions = [
  { id: '', name: 'Barchasi' },
  { id: 'new', name: 'Yangi' },
  { id: 'in_progress', name: 'Jarayonda' },
  { id: 'resolved', name: 'Hal qilindi' },
  { id: 'closed', name: 'Yopildi' },
  { id: 'cancelled', name: 'Bekor' },
];

const userStore = useUserStore();
const { canFilterUsers, applyUserFilter } = useReportFilter();
const view = ref('hisobot');
const loading = ref(false);
const rows = ref([]);
const summary = ref(null);

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

const filter = ref({
  datetime1: fmt(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0)),
  datetime2: fmt(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59)),
  status: '',
});

const statusLabel = (s) => {
  const map = { new: 'Yangi', in_progress: 'Jarayonda', resolved: 'Hal qilindi', closed: 'Yopildi', cancelled: 'Bekor' };
  return map[s] || s;
};
const statusClass = (s) => {
  const map = {
    new: 'bg-blue-100 text-blue-700', in_progress: 'bg-amber-100 text-amber-700',
    resolved: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-600', cancelled: 'bg-red-100 text-red-500',
  };
  return map[s] || 'bg-gray-100 text-gray-600';
};
const priorityLabel = (p) => {
  const map = { low: 'Past', medium: "O'rta", high: 'Yuqori', urgent: 'Shoshilinch' };
  return map[p] || p;
};
const priorityClass = (p) => {
  const map = { low: 'bg-gray-100 text-gray-600', medium: 'bg-blue-100 text-blue-600', high: 'bg-orange-100 text-orange-600', urgent: 'bg-red-100 text-red-600' };
  return map[p] || 'bg-gray-100 text-gray-600';
};
const sourceLabel = (s) => {
  const map = { phone: 'Telefon', telegram: 'Telegram', instagram: 'Instagram', whatsapp: 'WhatsApp', walk_in: 'Shaxsan', email: 'Email', other: 'Boshqa' };
  return map[s] || s;
};
const formatDatetime = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

// Group by operator for Hisobot
const groupedByOperator = computed(() => {
  const map = {};
  rows.value.forEach(r => {
    const uid = r.user_id || r.operator_id || 'unknown';
    const uname = r.operator?.user_name || r.user?.user_name || '—';
    if (!map[uid]) map[uid] = { user_id: uid, user_name: uname, total: 0, new: 0, in_progress: 0, resolved: 0, closed: 0, cancelled: 0 };
    map[uid].total++;
    if (r.status in map[uid]) map[uid][r.status]++;
  });
  return Object.values(map).sort((a, b) => b.total - a.total);
});

// Modal
const detailModal = reactive({ show: false, user_name: '', user_id: null, rows: [], new: 0, in_progress: 0, resolved: 0 });

const openModal = (grp) => {
  detailModal.show = true;
  detailModal.user_name = grp.user_name;
  detailModal.user_id = grp.user_id;
  detailModal.new = grp.new;
  detailModal.in_progress = grp.in_progress;
  detailModal.resolved = grp.resolved;
  detailModal.rows = rows.value.filter(r => (r.user_id || r.operator_id || 'unknown') === grp.user_id);
};

const loadReport = async () => {
  loading.value = true;
  rows.value = [];
  summary.value = null;
  try {
    const params = {
      branch_id: userStore.user?.branch_id,
      datetime1: filter.value.datetime1 || undefined,
      datetime2: filter.value.datetime2 || undefined,
    };
    if (filter.value.status) params.status = filter.value.status;
    const res = await reportService.crm(applyUserFilter(params));
    rows.value = res?.rows || [];
    summary.value = res?.summary || null;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const resetFilter = () => {
  filter.value = {
    datetime1: fmt(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0)),
    datetime2: fmt(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59)),
    status: '',
  };
  rows.value = [];
  summary.value = null;
};

const exportExcel = () => {
  const table = document.getElementById('crm-report-table');
  if (!table) return;
  let csv = '';
  for (const row of table.rows) {
    const cells = [...row.cells].map(c => `"${c.innerText.replace(/"/g, '""')}"`);
    csv += cells.join(',') + '\n';
  }
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `crm_hisobot_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active > div:last-child,
.modal-fade-leave-active > div:last-child { transition: transform 0.25s ease; }
.modal-fade-enter-from > div:last-child { transform: translateY(24px); }
.modal-fade-leave-to > div:last-child { transform: translateY(24px); }
</style>
