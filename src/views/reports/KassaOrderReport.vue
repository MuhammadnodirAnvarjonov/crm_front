<template>
  <div class="flex flex-col h-full gap-2">

    <!-- Sticky controls -->
    <div class="flex-shrink-0 sticky top-0 z-10 flex flex-col gap-2 pb-1" style="background:#f0f2f5;">
      <div class="flex flex-wrap items-end gap-2 bg-white rounded-xl p-2 border border-gray-100 shadow-sm">
        <BaseInput type="datetime-local" v-model="filter.datetime1" label="Dan" size="sm"/>
        <BaseInput type="datetime-local" v-model="filter.datetime2" label="Gacha" size="sm"/>
        <BaseSelect v-model="filter.type" :options="typeOptions" label="Turi" :clearable="false" size="sm"/>
        <BaseSelect v-model="filter.pay_type_id" :options="payTypeOptions" :label="$t('pay_type')"
          :label-key="payTypeLabelKey" value-key="id" :clearable="false" size="sm"/>
        <div class="flex gap-2 mt-auto">
          <BaseButton @click="loadReport" :disabled="loading" :loading="loading" label="Filterlash" size="sm"/>
          <BaseButton @click="resetFilter" label="Tozalash" status="gray" size="sm"/>
          <BaseButton @click="exportExcel" status="success" size="sm">
            <template #icon><ExcelIcon/></template> Excel
          </BaseButton>
        </div>
      </div>

      <!-- Summary -->
      <div v-if="rows.length" class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <SummaryCard label="Jami yozuvlar" :value="rows.length" color="blue"/>
        <SummaryCard label="Kirim" :value="totalKirim" type="money" color="green"/>
        <SummaryCard label="Chiqim" :value="totalChiqim" type="money" color="red"/>
        <SummaryCard label="Balans" :value="totalKirim - totalChiqim" type="money" color="indigo"/>
      </div>
    </div>

    <!-- Table -->
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

      <table v-else id="kassa-order-report-table" class="w-full text-sm whitespace-nowrap">
        <thead class="text-xs sticky top-0 z-10" style="background:#f8fafc; color:#64748b;">
          <tr>
            <th class="px-2 py-1.5 text-left font-semibold">#</th>
            <th class="px-2 py-1.5 text-left font-semibold">Sana</th>
            <th class="px-2 py-1.5 text-left font-semibold">Bemor</th>
            <th class="px-2 py-1.5 text-left font-semibold">Xodim</th>
            <th class="px-2 py-1.5 text-left font-semibold">Ro'yxatchi</th>
            <th class="px-2 py-1.5 text-left font-semibold">To'lov turi</th>
            <th class="px-2 py-1.5 text-left font-semibold">Turi</th>
            <th class="px-2 py-1.5 text-left font-semibold">Doc turi</th>
            <th class="px-2 py-1.5 text-right font-semibold text-green-600">Kirim</th>
            <th class="px-2 py-1.5 text-right font-semibold text-red-500">Chiqim</th>
            <th class="px-2 py-1.5 text-right font-semibold">Chegirma</th>
            <th class="px-2 py-1.5 text-center font-semibold">Qaytarilgan</th>
            <th class="px-2 py-1.5 text-left font-semibold">Izoh</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in rows" :key="row.id" class="border-t border-gray-50 hover:bg-blue-50/40">
            <td class="px-2 py-1 text-blue-500 font-bold text-xs">{{ i + 1 }}</td>
            <td class="px-2 py-1 text-gray-400 text-xs font-mono">{{ formatDt(row.date_time) }}</td>
            <td class="px-2 py-1 font-medium text-gray-800 text-xs">{{ row.patient?.full_name || '-' }}</td>
            <td class="px-2 py-1 text-gray-600 text-xs">{{ row.user_doc?.user_name || '-' }}</td>
            <td class="px-2 py-1 text-gray-600 text-xs">{{ row.user?.user_name || '-' }}</td>
            <td class="px-2 py-1">
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="payTypeClass(row.pay_type?.color)">
                {{ row.pay_type?.[payTypeLabelKey] || row.pay_type?.name || '-' }}
              </span>
            </td>
            <td class="px-2 py-1">
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                :class="row.type === 'kirim' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'">
                {{ row.type === 'kirim' ? 'Kirim' : 'Chiqim' }}
              </span>
            </td>
            <td class="px-2 py-1 text-gray-500 text-xs">{{ docTypeLabel(row.doc_type) }}</td>
            <td class="px-2 py-1 text-right font-bold" :class="row.type === 'kirim' ? 'text-green-700' : 'text-gray-300'">
              {{ row.type === 'kirim' ? fmt(row.summa) : '0' }}
            </td>
            <td class="px-2 py-1 text-right font-bold" :class="row.type === 'chiqim' ? 'text-red-600' : 'text-gray-300'">
              {{ row.type === 'chiqim' ? fmt(row.summa) : '0' }}
            </td>
            <td class="px-2 py-1 text-right text-orange-500 text-xs">{{ fmt(row.discount) }}</td>
            <td class="px-2 py-1 text-center">
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                :class="row.refund === 'yes' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'">
                {{ row.refund === 'yes' ? 'Ha' : "Yo'q" }}
              </span>
            </td>
            <td class="px-2 py-1 text-gray-400 italic text-xs max-w-[160px] truncate">{{ row.comment || '-' }}</td>
          </tr>
        </tbody>
        <tfoot v-if="rows.length" class="border-t-2 border-blue-200 font-bold text-sm sticky bottom-0 z-10" style="background:#eff6ff;">
          <tr>
            <td colspan="8" class="px-2 py-1.5 text-gray-600">JAMI: {{ rows.length }} ta</td>
            <td class="px-2 py-1.5 text-right text-green-700">{{ fmt(totalKirim) }}</td>
            <td class="px-2 py-1.5 text-right text-red-600">{{ fmt(totalChiqim) }}</td>
            <td class="px-2 py-1.5 text-right text-orange-500">{{ fmt(totalDiscount) }}</td>
            <td colspan="2"></td>
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
import { useGlobalStore } from '@/stores/global';
import reportService from '@/services/report.service';
import { useReportFilter } from '@/composables/useReportFilter';
import { useSummaFormat } from '@/composables/NumberFormat';
import BaseInput from '@/components/form/BaseInput.vue';
import BaseSelect from '@/components/form/BaseSelect.vue';
import BaseButton from '@/components/form/BaseButton.vue';
import SummaryCard from './components/SummaryCard.vue';
import ExcelIcon from './components/ExcelIcon.vue';

const { t, locale } = useI18n();
const userStore   = useUserStore();
const globalStore = useGlobalStore();
const { canFilterUsers, applyUserFilter } = useReportFilter();
const fmt = useSummaFormat;

const payTypeLabelKey = computed(() =>
  'name_' + (locale.value === 'uzk' ? 'uzk' : locale.value === 'ru' ? 'ru' : 'uz')
);

const DOC_LABELS = {
  kassa_kirim: 'Kassa kirim', kassa_chiqim: 'Kassa chiqim',
  registration: 'Qabul', reg_payment: "Qabul to'lovi",
  reg_service: "Xizmat ko'rsatish", reg_palata: "Palata to'lov",
  user_payment: "Xodim to'lov", direct_payment: "Direct to'lovi",
  med_direct_payment: "Med Direct", supplier_payment: "Yetkazuvchi",
  patient_payment: "Bemor to'lov", rasxod: 'Xarajat', refund: 'Qaytarish',
};
const docTypeLabel = (t) => DOC_LABELS[t] || t || '-';

const typeOptions = [
  { id: '', name: 'Barchasi' },
  { id: 'kirim', name: 'Kirim' },
  { id: 'chiqim', name: 'Chiqim' },
];

const payTypeOptions = computed(() => {
  const all = [{ id: '', name: t('all'), name_uz: t('all'), name_uzk: t('all'), name_ru: t('all') }];
  return [...all, ...globalStore.payTypes];
});

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
  datetime1: fmtDt2(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0)),
  datetime2: fmtDt2(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59)),
  type: '', pay_type_id: '',
});
const filter = ref(defaultFilter());

const totalKirim    = computed(() => rows.value.filter(r => r.type === 'kirim').reduce((s,r) => s + Number(r.summa||0), 0));
const totalChiqim   = computed(() => rows.value.filter(r => r.type === 'chiqim').reduce((s,r) => s + Number(r.summa||0), 0));
const totalDiscount = computed(() => rows.value.reduce((s,r) => s + Number(r.discount||0), 0));

const loadReport = async () => {
  loading.value = true; rows.value = [];
  try {
    const params = {
      branch_id: userStore.user?.branch_id,
      datetime1: filter.value.datetime1 || undefined,
      datetime2: filter.value.datetime2 || undefined,
    };
    if (filter.value.pay_type_id) params.pay_type_id = filter.value.pay_type_id;
    if (filter.value.type) params.type = filter.value.type;
    const res = await reportService.kassa(applyUserFilter(params));
    // Filter only kassa_order related doc_types
    const allRows = res?.rows || [];
    rows.value = allRows.filter(r => r.place === 'kassa_order' || r.doc_type === 'kassa_kirim' || r.doc_type === 'kassa_chiqim');
  } catch(e) { console.error(e); }
  finally { loading.value = false; }
};

const resetFilter = () => { filter.value = defaultFilter(); rows.value = []; };

const exportExcel = () => {
  const table = document.getElementById('kassa-order-report-table');
  if (!table) return;
  let csv = '';
  for (const row of table.rows) {
    const cells = [...row.cells].map(c => `"${c.innerText.replace(/"/g,'""')}"`);
    csv += cells.join(',') + '\n';
  }
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `kassa_order_hisobot_${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
};
</script>
