<template>
  <div class="flex flex-col h-full gap-2">

    <div class="flex-shrink-0 sticky top-0 z-10 flex flex-col gap-2 pb-1" style="background:#f0f2f5;">
      <div class="flex flex-wrap items-end gap-2 bg-white rounded-xl p-2 border border-gray-100 shadow-sm">
        <BaseInput type="datetime-local" v-model="filter.date_from" label="Dan" size="sm"/>
        <BaseInput type="datetime-local" v-model="filter.date_to" label="Gacha" size="sm"/>
        <BaseSelect v-model="filter.type" :options="typeOptions" label="Turi" :clearable="false" size="sm"/>
        <div class="flex gap-2 mt-auto">
          <BaseButton @click="loadReport" :disabled="loading" :loading="loading" label="Filterlash" size="sm"/>
          <BaseButton @click="resetFilter" label="Tozalash" status="gray" size="sm"/>
          <BaseButton @click="exportExcel" status="success" size="sm">
            <template #icon><ExcelIcon/></template> Excel
          </BaseButton>
        </div>
      </div>

      <div v-if="rows.length" class="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <SummaryCard label="Jami to'lovlar" :value="rows.length" color="blue"/>
        <SummaryCard label="Oylik to'lov" :value="totalOylik" type="money" color="green"/>
        <SummaryCard label="Avans" :value="totalAvans" type="money" color="amber"/>
        <SummaryCard label="Jami to'langan" :value="totalSumma" type="money" color="indigo"/>
        <SummaryCard label="Xodimlar" :value="uniqueUsers" color="purple"/>
      </div>
    </div>

    <div class="flex-1 overflow-auto rounded-xl border border-gray-100 min-h-0 bg-white shadow-sm">
      <div v-if="loading" class="py-6 text-center text-gray-400">
        <svg class="w-5 h-5 animate-spin text-blue-500 inline-block mr-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>Yuklanmoqda...
      </div>

      <div v-else-if="rows.length === 0" class="py-6 text-center text-gray-400 text-sm">
        Ma'lumot yo'q — avval filterlang va <b>Filterlash</b> tugmasini bosing
      </div>

      <table v-else id="user-payment-report-table" class="w-full text-sm whitespace-nowrap">
        <thead class="text-xs sticky top-0 z-10" style="background:#f8fafc; color:#64748b;">
          <tr>
            <th class="px-2 py-1.5 text-left font-semibold">#</th>
            <th class="px-2 py-1.5 text-left font-semibold">Sana</th>
            <th class="px-2 py-1.5 text-left font-semibold">Xodim</th>
            <th class="px-2 py-1.5 text-left font-semibold">Turi</th>
            <th class="px-2 py-1.5 text-left font-semibold">Oy/Yil</th>
            <th class="px-2 py-1.5 text-right font-semibold">Fix</th>
            <th class="px-2 py-1.5 text-right font-semibold">Xizmat</th>
            <th class="px-2 py-1.5 text-right font-semibold">Palata</th>
            <th class="px-2 py-1.5 text-right font-semibold">Direct</th>
            <th class="px-2 py-1.5 text-right font-semibold text-red-500">Jarima</th>
            <th class="px-2 py-1.5 text-right font-semibold">To'lov turi</th>
            <th class="px-2 py-1.5 text-right font-semibold text-green-600">Summa</th>
            <th class="px-2 py-1.5 text-left font-semibold">Izoh</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in rows" :key="row.id" class="border-t border-gray-50 hover:bg-blue-50/40">
            <td class="px-2 py-1 text-blue-500 font-bold text-xs">{{ i + 1 }}</td>
            <td class="px-2 py-1 text-gray-400 text-xs font-mono">{{ formatDt(row.date_time) }}</td>
            <td class="px-2 py-1 font-medium text-gray-800 text-xs">{{ row.user?.user_name || '-' }}</td>
            <td class="px-2 py-1">
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                :class="row.type === 'avans' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'">
                {{ row.type === 'avans' ? 'Avans' : 'Oylik' }}
              </span>
            </td>
            <td class="px-2 py-1 text-gray-500 text-xs">{{ monthLabel(row.month) }} {{ row.year }}</td>
            <td class="px-2 py-1 text-right text-indigo-600 text-xs">{{ fmt(row.fix_summa) }}</td>
            <td class="px-2 py-1 text-right text-blue-600 text-xs">{{ fmt(row.service_summa) }}</td>
            <td class="px-2 py-1 text-right text-purple-600 text-xs">{{ fmt(row.palata_summa) }}</td>
            <td class="px-2 py-1 text-right text-cyan-600 text-xs">{{ fmt(row.direct_summa) }}</td>
            <td class="px-2 py-1 text-right text-red-500 text-xs">{{ row.jarima ? fmt(row.jarima) : '0' }}</td>
            <td class="px-2 py-1 text-right">
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="payTypeClass(row.pay_type?.color)">
                {{ row.pay_type?.[payTypeLabelKey] || row.pay_type?.name || '-' }}
              </span>
            </td>
            <td class="px-2 py-1 text-right font-bold text-green-700">{{ fmt(row.jami_summa) }}</td>
            <td class="px-2 py-1 text-gray-400 italic text-xs max-w-[140px] truncate">{{ row.comment || '-' }}</td>
          </tr>
        </tbody>
        <tfoot v-if="rows.length" class="border-t-2 border-blue-200 font-bold text-sm sticky bottom-0 z-10" style="background:#eff6ff;">
          <tr>
            <td colspan="5" class="px-2 py-1.5 text-gray-600">JAMI: {{ rows.length }} ta</td>
            <td class="px-2 py-1.5 text-right text-indigo-600">{{ fmt(totals.fix) }}</td>
            <td class="px-2 py-1.5 text-right text-blue-600">{{ fmt(totals.service) }}</td>
            <td class="px-2 py-1.5 text-right text-purple-600">{{ fmt(totals.palata) }}</td>
            <td class="px-2 py-1.5 text-right text-cyan-600">{{ fmt(totals.direct) }}</td>
            <td class="px-2 py-1.5 text-right text-red-500">{{ fmt(totals.jarima) }}</td>
            <td class="px-2 py-1.5"></td>
            <td class="px-2 py-1.5 text-right text-green-700">{{ fmt(totals.jami) }}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/user';
import { useSummaFormat } from '@/composables/NumberFormat';
import { useReportFilter } from '@/composables/useReportFilter';
import userPaymentService from '@/services/user_payment.service';
import BaseInput from '@/components/form/BaseInput.vue';
import BaseSelect from '@/components/form/BaseSelect.vue';
import BaseButton from '@/components/form/BaseButton.vue';
import SummaryCard from './components/SummaryCard.vue';
import ExcelIcon from './components/ExcelIcon.vue';

const { locale } = useI18n();
const userStore = useUserStore();
const { canFilterUsers, applyUserFilter } = useReportFilter();
const fmt = useSummaFormat;

const payTypeLabelKey = computed(() =>
  'name_' + (locale.value === 'uzk' ? 'uzk' : locale.value === 'ru' ? 'ru' : 'uz')
);

const MONTHS = ['', 'Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
const monthLabel = (m) => MONTHS[m] || m;

const typeOptions = [
  { id: '', name: 'Barchasi' },
  { id: 'oylik', name: 'Oylik' },
  { id: 'avans', name: 'Avans' },
];

const colorClassMap = {
  success: 'bg-green-100 text-green-700', info: 'bg-blue-100 text-blue-700',
  warning: 'bg-yellow-100 text-yellow-700', primary: 'bg-indigo-100 text-indigo-700',
  purple: 'bg-purple-100 text-purple-700', danger: 'bg-red-100 text-red-700',
};
const payTypeClass = (c) => colorClassMap[c] || 'bg-gray-100 text-gray-600';

const loading = ref(false);
const rows    = ref([]);

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const fmtDt2 = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const formatDt = (d) => d ? new Date(d).toLocaleString('uz-UZ', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }) : '-';

const defaultFilter = () => ({
  date_from: fmtDt2(new Date(now.getFullYear(), now.getMonth(), 1, 0, 0)),
  date_to:   fmtDt2(new Date(now.getFullYear(), now.getMonth()+1, 0, 23, 59)),
  type: '',
});
const filter = ref(defaultFilter());

const totalSumma = computed(() => rows.value.reduce((s,r) => s + Number(r.jami_summa||0), 0));
const totalOylik = computed(() => rows.value.filter(r => r.type === 'oylik').reduce((s,r) => s + Number(r.jami_summa||0), 0));
const totalAvans = computed(() => rows.value.filter(r => r.type === 'avans').reduce((s,r) => s + Number(r.jami_summa||0), 0));
const uniqueUsers = computed(() => new Set(rows.value.map(r => r.user_id).filter(Boolean)).size);

const totals = computed(() => {
  const t = { fix: 0, service: 0, palata: 0, direct: 0, jarima: 0, jami: 0 };
  rows.value.forEach(r => {
    t.fix     += Number(r.fix_summa||0);
    t.service += Number(r.service_summa||0);
    t.palata  += Number(r.palata_summa||0);
    t.direct  += Number(r.direct_summa||0);
    t.jarima  += Number(r.jarima||0);
    t.jami    += Number(r.jami_summa||0);
  });
  return t;
});

const loadReport = async () => {
  loading.value = true; rows.value = [];
  try {
    const params = { branch_id: userStore.user?.branch_id };
    if (filter.value.date_from) params.date_from = filter.value.date_from;
    if (filter.value.date_to)   params.date_to   = filter.value.date_to;
    if (filter.value.type)      params.type      = filter.value.type;
    rows.value = await userPaymentService.all(applyUserFilter(params)) || [];
  } catch(e) { console.error(e); }
  finally { loading.value = false; }
};

const resetFilter = () => { filter.value = defaultFilter(); rows.value = []; };

const exportExcel = () => {
  const table = document.getElementById('user-payment-report-table');
  if (!table) return;
  let csv = '';
  for (const row of table.rows) {
    const cells = [...row.cells].map(c => `"${c.innerText.replace(/"/g,'""')}"`);
    csv += cells.join(',') + '\n';
  }
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `xodim_tolov_hisobot_${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
};
</script>
