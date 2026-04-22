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
      <BaseSelect v-model="filter.user_id" :options="users" label="Xodim" label-key="user_name" value-key="id" :clearable="true" size="sm" placeholder="Barcha xodimlar" class="w-64"/>
      <BaseSelect v-model="filter.refund" :options="refundOptions" label="Qaytarilgan" :clearable="false" size="sm"/>

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
      <div v-if="summary && !loading" class="flex-shrink-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <SummaryCard label="Jami yozuvlar" :value="summary.total_count" type="count" color="blue"/>
        <SummaryCard label="Jami summa" :value="summary.total_summa" type="money" color="indigo"/>
        <SummaryCard label="Chegirma" :value="summary.total_discount" type="money" color="orange"/>
        <SummaryCard label="NDS" :value="summary.total_nds" type="money" color="purple"/>
        <SummaryCard label="Qaytarilgan" :value="summary.refund_count" type="count" color="red"/>
        <SummaryCard label="Qaytarilgan summa" :value="summary.refund_summa" type="money" color="red"/>
      </div>

      <!-- Grouped by user -->
      <div class="flex-1 overflow-auto rounded-xl border border-gray-100 min-h-0">
        <table class="w-full text-sm whitespace-nowrap">
          <thead class="bg-gray-50 text-gray-500 text-xs sticky top-0 z-10">
            <tr>
              <th class="px-2 py-1 text-left">#</th>
              <th class="px-2 py-1 text-left">Foydalanuvchi</th>
              <th class="px-2 py-1 text-right">Jami</th>
              <th class="px-2 py-1 text-right">Summa</th>
              <th class="px-2 py-1 text-right">Chegirma</th>
              <th class="px-2 py-1 text-right">NDS</th>
              <th class="px-2 py-1 text-right">Qaytarilgan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-6 text-gray-400">
                <div class="flex items-center justify-center gap-2">
                  <svg class="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  <span>Ma'lumotlar yuklanmoqda...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="groupedByUser.length === 0">
              <td colspan="7" class="text-center py-6 text-gray-400">Ma'lumot yo'q. Avval filterlang.</td>
            </tr>
            <tr
              v-else
              v-for="(grp, i) in groupedByUser"
              :key="grp.user_id"
              @click="openModal(grp)"
              class="border-t hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <td class="px-2 py-1 text-blue-600 font-bold">{{ i + 1 }}</td>
              <td class="px-2 py-1 font-medium text-gray-800">{{ grp.user_name }}</td>
              <td class="px-2 py-1 text-right font-bold text-blue-700">{{ grp.count }}</td>
              <td class="px-2 py-1 text-right font-semibold text-gray-800">{{ useSummaFormat(grp.summa) }}</td>
              <td class="px-2 py-1 text-right text-orange-600">{{ useSummaFormat(grp.discount) }}</td>
              <td class="px-2 py-1 text-right text-purple-600">{{ useSummaFormat(grp.nds) }}</td>
              <td class="px-2 py-1 text-right text-red-600">{{ grp.refund_count }}</td>
            </tr>
          </tbody>
          <tfoot v-if="groupedByUser.length && summary" class="bg-blue-50 font-semibold text-sm border-t-2 border-blue-200 sticky bottom-0">
            <tr>
              <td colspan="2" class="px-2 py-1">JAMI</td>
              <td class="px-2 py-1 text-right text-blue-700">{{ summary.total_count }}</td>
              <td class="px-2 py-1 text-right text-gray-800">{{ useSummaFormat(summary.total_summa) }}</td>
              <td class="px-2 py-1 text-right text-orange-600">{{ useSummaFormat(summary.total_discount) }}</td>
              <td class="px-2 py-1 text-right text-purple-600">{{ useSummaFormat(summary.total_nds) }}</td>
              <td class="px-2 py-1 text-right text-red-600">{{ summary.refund_count }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- SVERKA: individual transactions -->
    <div v-if="view === 'sverka'" class="flex-1 overflow-auto rounded-xl border border-gray-100 min-h-0">
      <table id="user-report-table" class="w-full text-sm whitespace-nowrap">
        <thead class="bg-gray-50 text-gray-500 text-xs sticky top-0 z-10">
          <tr>
            <th class="px-2 py-1 text-left">#</th>
            <th class="px-2 py-1 text-left">Sana/Vaqt</th>
            <th class="px-2 py-1 text-left">Foydalanuvchi</th>
            <th class="px-2 py-1 text-left">Manba</th>
            <th class="px-2 py-1 text-right">Summa</th>
            <th class="px-2 py-1 text-right">Chegirma</th>
            <th class="px-2 py-1 text-right">NDS</th>
            <th class="px-2 py-1 text-center">Qaytarilgan</th>
            <th class="px-2 py-1 text-left">Resurs</th>
            <th class="px-2 py-1 text-left">Izoh</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="10" class="text-center py-6 text-gray-400">
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
            <td colspan="10" class="text-center py-6 text-gray-400">Ma'lumotlar topilmadi</td>
          </tr>
          <template v-else>
            <tr v-for="(row, i) in rows" :key="row.id" class="border-t hover:bg-gray-50">
              <td class="px-2 py-1 text-blue-600 font-bold">{{ i + 1 }}</td>
              <td class="px-2 py-1 text-gray-500 text-xs">{{ formatDatetime(row.date_time) }}</td>
              <td class="px-2 py-1">
                <div class="font-medium text-gray-800">{{ row.user?.user_name || '-' }}</div>
                <div class="text-xs text-gray-400">{{ row.user?.phone || '' }}</div>
              </td>
              <td class="px-2 py-1">
                <span class="px-1.5 py-0.5 rounded text-xs font-medium" :class="docTypeClass(row.doc_type)">
                  {{ row.service?.name || '' }}
                </span>
              </td>
              <td class="px-2 py-1 text-right font-semibold text-gray-800">{{ useSummaFormat(row.summa) }}</td>
              <td class="px-2 py-1 text-right text-orange-600">{{ useSummaFormat(row.discount) }}</td>
              <td class="px-2 py-1 text-right text-purple-600">{{ useSummaFormat(row.nds) }}</td>
              <td class="px-2 py-1 text-center">
                <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="row.refund === 'yes' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'">
                  {{ row.refund === 'yes' ? 'Ha' : "Yo'q" }}
                </span>
              </td>
              <td class="px-2 py-1 text-gray-500 text-xs">{{ row.pay_resource || '-' }}</td>
              <td class="px-2 py-1 text-gray-400 italic text-xs">{{ row.comment || '-' }}</td>
            </tr>
          </template>
        </tbody>
        <tfoot v-if="rows.length && summary" class="bg-blue-50 font-semibold text-sm border-t-2 border-blue-200 sticky bottom-0 z-10">
          <tr>
            <td class="px-2 py-1" colspan="4">JAMI: {{ rows.length }} ta</td>
            <td class="px-2 py-1 text-right text-blue-700">{{ useSummaFormat(summary.total_summa) }}</td>
            <td class="px-2 py-1 text-right text-orange-600">{{ useSummaFormat(summary.total_discount) }}</td>
            <td class="px-2 py-1 text-right text-purple-600">{{ useSummaFormat(summary.total_nds) }}</td>
            <td colspan="3" class="px-2 py-1"></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- MODAL: Foydalanuvchi tranzaksiyalari -->
    <Transition name="modal-fade">
      <div v-if="detailModal.show" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" @click.self="detailModal.show = false">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="detailModal.show = false"/>
        <div class="relative bg-white w-full sm:max-w-4xl sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh] z-10">

          <!-- Modal header -->
          <div class="flex items-center justify-between px-3 py-2 border-b border-gray-100">
            <div>
              <h3 class="font-bold text-gray-800 text-base">{{ detailModal.user_name }}</h3>
              <p class="text-xs text-gray-400 mt-0.5">
                Jami: <span class="font-semibold text-blue-700">{{ detailModal.rows.length }}</span> ta yozuv,
                Summa: <span class="font-semibold text-gray-700">{{ useSummaFormat(detailModal.summa) }}</span>
              </p>
            </div>
            <button @click="detailModal.show = false" class="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Modal table -->
          <div class="overflow-auto flex-1">
            <table class="w-full text-sm whitespace-nowrap">
              <thead class="bg-gray-50 text-gray-500 text-xs sticky top-0">
                <tr>
                  <th class="px-2 py-1 text-left">#</th>
                  <th class="px-2 py-1 text-left">Sana/Vaqt</th>
                  <th class="px-2 py-1 text-left">Manba</th>
                  <th class="px-2 py-1 text-right">Summa</th>
                  <th class="px-2 py-1 text-right">Chegirma</th>
                  <th class="px-2 py-1 text-right">NDS</th>
                  <th class="px-2 py-1 text-center">Qaytarilgan</th>
                  <th class="px-2 py-1 text-left">Resurs</th>
                  <th class="px-2 py-1 text-left">Izoh</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="detailModal.rows.length === 0">
                  <td colspan="9" class="text-center py-8 text-gray-400">Ma'lumot yo'q</td>
                </tr>
                <tr v-for="(row, i) in detailModal.rows" :key="row.id" class="border-t hover:bg-gray-50">
                  <td class="px-2 py-1 text-blue-600 font-bold">{{ i + 1 }}</td>
                  <td class="px-2 py-1 text-gray-500 text-xs">{{ formatDatetime(row.date_time) }}</td>
                  <td class="px-2 py-1">
                    <span class="px-1.5 py-0.5 rounded text-xs font-medium" :class="docTypeClass(row.doc_type)">
                      {{ row.service?.name || '' }}
                    </span>
                  </td>
                  <td class="px-2 py-1 text-right font-semibold text-gray-800">{{ useSummaFormat(row.summa) }}</td>
                  <td class="px-2 py-1 text-right text-orange-600">{{ useSummaFormat(row.discount) }}</td>
                  <td class="px-2 py-1 text-right text-purple-600">{{ useSummaFormat(row.nds) }}</td>
                  <td class="px-2 py-1 text-center">
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                      :class="row.refund === 'yes' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'">
                      {{ row.refund === 'yes' ? 'Ha' : "Yo'q" }}
                    </span>
                  </td>
                  <td class="px-2 py-1 text-gray-500 text-xs">{{ row.pay_resource || '-' }}</td>
                  <td class="px-2 py-1 text-gray-400 italic text-xs">{{ row.comment || '-' }}</td>
                </tr>
              </tbody>
              <tfoot v-if="detailModal.rows.length" class="bg-blue-50 font-semibold text-sm border-t-2 border-blue-200 sticky bottom-0">
                <tr>
                  <td colspan="3" class="px-2 py-1">JAMI: {{ detailModal.rows.length }} ta</td>
                  <td class="px-2 py-1 text-right text-blue-700">{{ useSummaFormat(detailModal.summa) }}</td>
                  <td class="px-2 py-1 text-right text-orange-600">{{ useSummaFormat(detailModal.discount) }}</td>
                  <td class="px-2 py-1 text-right text-purple-600">{{ useSummaFormat(detailModal.nds) }}</td>
                  <td colspan="3" class="px-2 py-1"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { useSummaFormat } from '@/composables/NumberFormat';
import reportService from '@/services/report.service';
import usersService from '@/services/users.service';
import { useReportFilter } from '@/composables/useReportFilter';
import SummaryCard from './components/SummaryCard.vue';
import BaseInput from '@/components/form/BaseInput.vue';
import BaseSelect from '@/components/form/BaseSelect.vue';
import BaseButton from '@/components/form/BaseButton.vue';

const refundOptions = [
  { id: '', name: 'Barchasi' },
  { id: 'no', name: "Yo'q" },
  { id: 'yes', name: 'Ha' },
];

const userStore = useUserStore();
const { canFilterUsers, applyUserFilter } = useReportFilter();
const view = ref('hisobot');
const loading = ref(false);
const rows = ref([]);
const summary = ref(null);
const users = ref([]);

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

const filter = ref({
  datetime1: fmt(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0)),
  datetime2: fmt(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59)),
  refund: '',
  user_id: null,
});

const formatDatetime = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const docTypeLabel = (t) => {
  if (t === 'reg_service') return 'Xizmat';
  if (t === 'reg_palata') return 'Palata';
  if (t === 'user_payment') return "Xodim to'lov";
  return t || '-';
};
const docTypeClass = (t) => {
  if (t === 'reg_service') return 'bg-blue-100 text-blue-700';
  if (t === 'reg_palata') return 'bg-teal-100 text-teal-700';
  if (t === 'user_payment') return 'bg-orange-100 text-orange-700';
  return 'bg-gray-100 text-gray-500';
};

// Group by user for Hisobot
const groupedByUser = computed(() => {
  const map = {};
  rows.value.forEach(r => {
    const uid = r.user_id || 'unknown';
    const uname = r.user?.user_name || '—';
    if (!map[uid]) map[uid] = { user_id: uid, user_name: uname, count: 0, summa: 0, discount: 0, nds: 0, refund_count: 0 };
    map[uid].count++;
    map[uid].summa    += Number(r.summa    || 0);
    map[uid].discount += Number(r.discount || 0);
    map[uid].nds      += Number(r.nds      || 0);
    if (r.refund === 'yes') map[uid].refund_count++;
  });
  return Object.values(map).sort((a, b) => b.summa - a.summa);
});

// Modal
const detailModal = reactive({ show: false, user_name: '', user_id: null, rows: [], summa: 0, discount: 0, nds: 0 });

const openModal = (grp) => {
  detailModal.show = true;
  detailModal.user_name = grp.user_name;
  detailModal.user_id = grp.user_id;
  detailModal.summa = grp.summa;
  detailModal.discount = grp.discount;
  detailModal.nds = grp.nds;
  detailModal.rows = rows.value.filter(r => (r.user_id || 'unknown') === grp.user_id);
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
    if (filter.value.refund) params.refund = filter.value.refund;
    if (filter.value.user_id) params.user_id = filter.value.user_id;
    const res = await reportService.user(applyUserFilter(params));
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
    refund: '',
    user_id: null,
  };
  rows.value = [];
  summary.value = null;
};

onMounted(async () => {
  try {
    users.value = await usersService.all() || [];
  } catch (e) {
    console.error(e);
  }
});

const exportExcel = () => {
  const table = document.getElementById('user-report-table');
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
  a.download = `foydalanuvchi_hisobot_${new Date().toISOString().slice(0,10)}.csv`;
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
