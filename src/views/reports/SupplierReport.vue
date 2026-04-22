<template>
  <div class="flex flex-col h-full gap-2">

    <div class="flex-shrink-0 sticky top-0 z-10 flex flex-col gap-2 pb-1" style="background:#f0f2f5;">
      <div class="flex flex-wrap items-end gap-2 bg-white rounded-xl p-2 border border-gray-100 shadow-sm">
        <BaseInput type="datetime-local" v-model="filter.date_from" label="Dan" size="sm"/>
        <BaseInput type="datetime-local" v-model="filter.date_to" label="Gacha" size="sm"/>
        <BaseSelect v-model="filter.paid" :options="paidOptions" label="Holati" :clearable="false" size="sm"/>
        <div class="flex gap-2 mt-auto">
          <BaseButton @click="loadReport" :disabled="loading" :loading="loading" label="Filterlash" size="sm"/>
          <BaseButton @click="resetFilter" label="Tozalash" status="gray" size="sm"/>
          <BaseButton @click="exportExcel" status="success" size="sm">
            <template #icon><ExcelIcon/></template> Excel
          </BaseButton>
        </div>
      </div>

      <div v-if="rows.length" class="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <SummaryCard label="Jami yozuvlar" :value="rows.length" color="blue"/>
        <SummaryCard label="Jami summa" :value="totalSumma" type="money" color="indigo"/>
        <SummaryCard label="To'langan" :value="totalPaid" type="money" color="green"/>
        <SummaryCard label="To'lanmagan" :value="totalUnpaid" type="money" color="red"/>
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

      <table v-else id="supplier-report-table" class="w-full text-sm whitespace-nowrap">
        <thead class="text-xs sticky top-0 z-10" style="background:#f8fafc; color:#64748b;">
          <tr>
            <th class="px-2 py-1.5 text-left font-semibold">#</th>
            <th class="px-2 py-1.5 text-left font-semibold">Sana</th>
            <th class="px-2 py-1.5 text-left font-semibold">Yetkazuvchi</th>
            <th class="px-2 py-1.5 text-left font-semibold">Kirim (prixod)</th>
            <th class="px-2 py-1.5 text-left font-semibold">Doc turi</th>
            <th class="px-2 py-1.5 text-right font-semibold">Summa</th>
            <th class="px-2 py-1.5 text-center font-semibold">Holati</th>
            <th class="px-2 py-1.5 text-left font-semibold">Izoh</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in rows" :key="row.id" class="border-t border-gray-50 hover:bg-blue-50/40">
            <td class="px-2 py-1 text-blue-500 font-bold text-xs">{{ i + 1 }}</td>
            <td class="px-2 py-1 text-gray-400 text-xs font-mono">{{ formatDt(row.date_time) }}</td>
            <td class="px-2 py-1 font-medium text-gray-800 text-xs">{{ row.supplier?.name || '-' }}</td>
            <td class="px-2 py-1 text-gray-500 text-xs">{{ row.prixod ? formatDt(row.prixod.date_time) + ' (' + fmt(row.prixod.summa) + ')' : '-' }}</td>
            <td class="px-2 py-1 text-gray-500 text-xs">{{ row.doc_type || '-' }}</td>
            <td class="px-2 py-1 text-right font-bold text-blue-700">{{ fmt(row.summa) }}</td>
            <td class="px-2 py-1 text-center">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                :class="row.paid ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'">
                {{ row.paid ? "To'langan" : "To'lanmagan" }}
              </span>
            </td>
            <td class="px-2 py-1 text-gray-400 italic text-xs max-w-[140px] truncate">{{ row.comment || '-' }}</td>
          </tr>
        </tbody>
        <tfoot v-if="rows.length" class="border-t-2 border-blue-200 font-bold text-sm sticky bottom-0 z-10" style="background:#eff6ff;">
          <tr>
            <td colspan="5" class="px-2 py-1.5 text-gray-600">JAMI: {{ rows.length }} ta</td>
            <td class="px-2 py-1.5 text-right text-blue-700">{{ fmt(totalSumma) }}</td>
            <td colspan="2"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { useSummaFormat } from '@/composables/NumberFormat';
import { useReportFilter } from '@/composables/useReportFilter';
import registerSupplierService from '@/services/register_supplier.service';
import BaseInput from '@/components/form/BaseInput.vue';
import BaseSelect from '@/components/form/BaseSelect.vue';
import BaseButton from '@/components/form/BaseButton.vue';
import SummaryCard from './components/SummaryCard.vue';
import ExcelIcon from './components/ExcelIcon.vue';

const userStore = useUserStore();
const { canFilterUsers, applyUserFilter } = useReportFilter();
const fmt = useSummaFormat;

const paidOptions = [
  { id: '', name: 'Barchasi' },
  { id: 'true', name: "To'langan" },
  { id: 'false', name: "To'lanmagan" },
];

const loading = ref(false);
const rows    = ref([]);

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const fmtDt2 = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const formatDt = (d) => d ? new Date(d).toLocaleString('uz-UZ', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }) : '-';

const defaultFilter = () => ({
  date_from: fmtDt2(new Date(now.getFullYear(), now.getMonth(), 1, 0, 0)),
  date_to:   fmtDt2(new Date(now.getFullYear(), now.getMonth()+1, 0, 23, 59)),
  paid: '',
});
const filter = ref(defaultFilter());

const totalSumma  = computed(() => rows.value.reduce((s,r) => s + Number(r.summa||0), 0));
const totalPaid   = computed(() => rows.value.filter(r => r.paid).reduce((s,r) => s + Number(r.summa||0), 0));
const totalUnpaid = computed(() => rows.value.filter(r => !r.paid).reduce((s,r) => s + Number(r.summa||0), 0));

const loadReport = async () => {
  loading.value = true; rows.value = [];
  try {
    const params = { branch_id: userStore.user?.branch_id };
    if (filter.value.date_from) params.date_from = filter.value.date_from;
    if (filter.value.date_to)   params.date_to   = filter.value.date_to;
    if (filter.value.paid)      params.paid      = filter.value.paid;
    rows.value = await registerSupplierService.all(applyUserFilter(params)) || [];
  } catch(e) { console.error(e); }
  finally { loading.value = false; }
};

const resetFilter = () => { filter.value = defaultFilter(); rows.value = []; };

const exportExcel = () => {
  const table = document.getElementById('supplier-report-table');
  if (!table) return;
  let csv = '';
  for (const row of table.rows) {
    const cells = [...row.cells].map(c => `"${c.innerText.replace(/"/g,'""')}"`);
    csv += cells.join(',') + '\n';
  }
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `yetkazuvchi_hisobot_${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
};
</script>
