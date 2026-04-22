<template>
  <div class="flex flex-col h-full gap-2">

    <div class="flex-shrink-0 sticky top-0 z-10 flex flex-col gap-2 pb-1" style="background:#f0f2f5;">
      <div class="flex flex-wrap items-end gap-2 bg-white rounded-xl p-2 border border-gray-100 shadow-sm">
        <BaseInput type="datetime-local" v-model="filter.datetime1" label="Dan" size="sm"/>
        <BaseInput type="datetime-local" v-model="filter.datetime2" label="Gacha" size="sm"/>
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
        <SummaryCard label="Jami summa" :value="totalSumma" type="money" color="red"/>
        <SummaryCard label="Jami mahsulot" :value="totalCount" color="indigo"/>
        <SummaryCard label="Bo'limlar" :value="uniqueSections" color="purple"/>
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

      <table v-else id="rasxod-report-table" class="w-full text-sm whitespace-nowrap">
        <thead class="text-xs sticky top-0 z-10" style="background:#f8fafc; color:#64748b;">
          <tr>
            <th class="px-2 py-1.5 text-left font-semibold">#</th>
            <th class="px-2 py-1.5 text-left font-semibold">Sana</th>
            <th class="px-2 py-1.5 text-left font-semibold">Mahsulot</th>
            <th class="px-2 py-1.5 text-left font-semibold">Yetkazuvchi</th>
            <th class="px-2 py-1.5 text-right font-semibold">Soni</th>
            <th class="px-2 py-1.5 text-right font-semibold">Narxi</th>
            <th class="px-2 py-1.5 text-right font-semibold">Summa</th>
            <th class="px-2 py-1.5 text-left font-semibold">Izoh</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in rows" :key="row.id" class="border-t border-gray-50 hover:bg-red-50/30">
            <td class="px-2 py-1 text-blue-500 font-bold text-xs">{{ i + 1 }}</td>
            <td class="px-2 py-1 text-gray-400 text-xs font-mono">{{ formatDt(row.date_time) }}</td>
            <td class="px-2 py-1 font-medium text-gray-800 text-xs">{{ row.product?.name || '-' }}</td>
            <td class="px-2 py-1 text-gray-600 text-xs">{{ row.supplier?.name || '-' }}</td>
            <td class="px-2 py-1 text-right text-gray-600 text-xs">{{ row.count }}</td>
            <td class="px-2 py-1 text-right text-gray-600 text-xs">{{ fmt(row.price) }}</td>
            <td class="px-2 py-1 text-right font-bold text-red-600">{{ fmt(row.summa) }}</td>
            <td class="px-2 py-1 text-gray-400 italic text-xs max-w-[160px] truncate">{{ row.comment || '-' }}</td>
          </tr>
        </tbody>
        <tfoot v-if="rows.length" class="border-t-2 border-red-200 font-bold text-sm sticky bottom-0 z-10" style="background:#fef2f2;">
          <tr>
            <td colspan="4" class="px-2 py-1.5 text-gray-600">JAMI: {{ rows.length }} ta</td>
            <td class="px-2 py-1.5 text-right text-gray-600">{{ totalCount }}</td>
            <td class="px-2 py-1.5"></td>
            <td class="px-2 py-1.5 text-right text-red-600">{{ fmt(totalSumma) }}</td>
            <td></td>
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
import BaseInput from '@/components/form/BaseInput.vue';
import BaseButton from '@/components/form/BaseButton.vue';
import SummaryCard from './components/SummaryCard.vue';
import ExcelIcon from './components/ExcelIcon.vue';

const userStore = useUserStore();
const { canFilterUsers, applyUserFilter } = useReportFilter();
const fmt = useSummaFormat;

const loading = ref(false);
const rows    = ref([]);

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const fmtDt2 = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const formatDt = (d) => d ? new Date(d).toLocaleString('uz-UZ', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }) : '-';

const defaultFilter = () => ({
  datetime1: fmtDt2(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0)),
  datetime2: fmtDt2(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59)),
});
const filter = ref(defaultFilter());

const totalSumma = computed(() => rows.value.reduce((s,r) => s + Number(r.summa||0), 0));
const totalCount = computed(() => rows.value.reduce((s,r) => s + Number(r.count||0), 0));
const uniqueSections = computed(() => new Set(rows.value.map(r => r.doc_id).filter(Boolean)).size);

const loadReport = async () => {
  loading.value = true; rows.value = [];
  try {
    const params = { branch_id: userStore.user?.branch_id };
    if (filter.value.datetime1) params.date_from = filter.value.datetime1;
    if (filter.value.datetime2) params.date_to = filter.value.datetime2;
    const res = await (await import('@/services/register_product.service')).default.all(applyUserFilter(params));
    rows.value = (res || []).filter(r => r.doc_type === 'rasxod_section' || r.type === 'chiqim_section');
  } catch(e) { console.error(e); }
  finally { loading.value = false; }
};

const resetFilter = () => { filter.value = defaultFilter(); rows.value = []; };

const exportExcel = () => {
  const table = document.getElementById('rasxod-report-table');
  if (!table) return;
  let csv = '';
  for (const row of table.rows) {
    const cells = [...row.cells].map(c => `"${c.innerText.replace(/"/g,'""')}"`);
    csv += cells.join(',') + '\n';
  }
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `rasxod_hisobot_${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
};
</script>
