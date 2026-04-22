<template>
  <div class="flex-1 overflow-auto rounded-xl border border-gray-100 min-h-0 bg-white shadow-sm">
    <!-- Loading -->
    <div v-if="loading" class="py-6 text-center text-gray-400">
      <div class="flex items-center justify-center gap-2">
        <svg class="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        Yuklanmoqda...
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="rows.length === 0" class="py-6 text-center text-gray-400 text-sm">
      Ma'lumot yo'q — avval filterlang va <b>Filterlash</b> tugmasini bosing
    </div>

    <!-- Pivot table -->
    <table v-else id="kassa-report-table" class="w-full text-sm whitespace-nowrap">
      <thead class="text-xs sticky top-0 z-10" style="background:#f8fafc; color:#64748b;">
        <!-- 1-qator: pay_type nomlari -->
        <tr>
          <th class="px-2 py-1.5 text-left font-semibold border-b border-r border-gray-200"
            rowspan="2">Doc turi</th>
          <th v-for="pt in allPayTypes" :key="pt.id"
            class="px-2 py-2 text-center font-semibold border-b border-l border-gray-200" colspan="2">
            {{ pt[payTypeLabelKey] || pt.name }}
          </th>
          <th class="px-2 py-2 text-center font-semibold border-b border-l border-gray-200" colspan="2">
            Jami
          </th>
        </tr>
        <!-- 2-qator: kirim / chiqim -->
        <tr>
          <th v-for="h in subHeaders" :key="h.key"
            class="px-3 py-1.5 text-center text-xs font-semibold border-b" :class="h.cls">
            {{ h.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in pivotRows" :key="row.docType"
          class="border-t border-gray-50 hover:bg-blue-50/40">
          <td class="px-2 py-1 font-medium text-gray-700 border-r border-gray-100">{{ row.label }}</td>
          <td v-for="cell in row.cells" :key="cell.key"
            class="px-3 py-2 text-right text-xs font-semibold" :class="cell.cls">
            {{ cell.txt }}
          </td>
        </tr>
      </tbody>
      <tfoot class="border-t-2 border-blue-200 font-bold text-xs sticky bottom-0 z-10" style="background:#eff6ff;">
        <tr>
          <td class="px-2 py-1.5 text-gray-700 border-r border-blue-200">JAMI</td>
          <td v-for="cell in totalCells" :key="cell.key"
            class="px-3 py-2.5 text-right font-bold" :class="cell.cls">
            {{ cell.txt }}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useSummaFormat } from '@/composables/NumberFormat';

const props = defineProps({
  rows:           { type: Array,   default: () => [] },
  loading:        { type: Boolean, default: false },
  allPayTypes:    { type: Array,   default: () => [] },
  payTypeLabelKey:{ type: String,  default: 'name' },
});

const DOC_TYPE_LABELS = {
  registration:       'Qabul',
  reg_payment:        'Qabul to\'lovi',
  direct_payment:     'Direct to\'lovi',
  med_direct_payment: 'Med Direct to\'lovi',
  refund:             'Qaytarish',
  rasxod:             'Xarajat',
  kassa_kirim:        'Kassa kirim',
  kassa_chiqim:       'Kassa chiqim',
  palata:             'Palata',
  service:            'Xizmat',
  lab:                'Laboratoriya',
  uzi:                'UZI',
  reg_service:        'Xizmat ko\'rsatish',
  reg_palata:         'Palata to\'lov',
  user_payment:       'Xodim to\'lov',
  other:              'Boshqa',
};
const docTypeLabel = (t) => DOC_TYPE_LABELS[t] || t || '—';

// Sub-headers: Kirim/Chiqim for each pay_type + Jami
const subHeaders = computed(() => {
  const h = [];
  props.allPayTypes.forEach(pt => {
    h.push({ key: 'k-' + pt.id, label: 'Kirim',  cls: 'text-green-600 border-l border-gray-200 bg-green-50/40' });
    h.push({ key: 'c-' + pt.id, label: 'Chiqim', cls: 'text-red-500 bg-red-50/40' });
  });
  h.push({ key: 'jk', label: 'Kirim',  cls: 'text-green-600 border-l border-gray-200 bg-green-50/40' });
  h.push({ key: 'jc', label: 'Chiqim', cls: 'text-red-500 bg-red-50/40' });
  return h;
});

// Build pivot: doc_type → pay_type → { kirim, chiqim }
const pivotRows = computed(() => {
  const docMap = {};
  props.rows.forEach(r => {
    const dt   = r.doc_type || 'other';
    const ptId = r.pay_type_id;
    if (!docMap[dt]) docMap[dt] = {};
    if (!docMap[dt][ptId]) docMap[dt][ptId] = { kirim: 0, chiqim: 0 };
    const val = Number(r.summa || 0);
    if (r.type === 'kirim') docMap[dt][ptId].kirim  += val;
    else                    docMap[dt][ptId].chiqim += val;
  });

  return Object.entries(docMap)
    .map(([docType, ptData]) => {
      let totalK = 0, totalC = 0;
      const cells = [];
      props.allPayTypes.forEach(pt => {
        const k = ptData[pt.id]?.kirim  || 0;
        const c = ptData[pt.id]?.chiqim || 0;
        totalK += k; totalC += c;
        cells.push({ key: 'k-'+pt.id, txt: k > 0 ? useSummaFormat(k) : '—', cls: k > 0 ? 'text-green-600 border-l border-gray-100' : 'text-gray-300 border-l border-gray-100' });
        cells.push({ key: 'c-'+pt.id, txt: c > 0 ? useSummaFormat(c) : '—', cls: c > 0 ? 'text-red-500' : 'text-gray-300' });
      });
      cells.push({ key: 'jk', txt: totalK > 0 ? useSummaFormat(totalK) : '—', cls: totalK > 0 ? 'text-green-700 font-bold border-l border-gray-200' : 'text-gray-300 border-l border-gray-200' });
      cells.push({ key: 'jc', txt: totalC > 0 ? useSummaFormat(totalC) : '—', cls: totalC > 0 ? 'text-red-600 font-bold' : 'text-gray-300' });
      return { docType, label: docTypeLabel(docType), cells, total: totalK + totalC };
    })
    .sort((a, b) => b.total - a.total);
});

// Footer totals
const totalCells = computed(() => {
  const totals = {};
  props.allPayTypes.forEach(pt => { totals[pt.id] = { kirim: 0, chiqim: 0 }; });

  props.rows.forEach(r => {
    const ptId = r.pay_type_id;
    if (!totals[ptId]) totals[ptId] = { kirim: 0, chiqim: 0 };
    const val = Number(r.summa || 0);
    if (r.type === 'kirim') totals[ptId].kirim += val;
    else                    totals[ptId].chiqim += val;
  });

  let grandK = 0, grandC = 0;
  const cells = [];
  props.allPayTypes.forEach(pt => {
    const k = totals[pt.id]?.kirim  || 0;
    const c = totals[pt.id]?.chiqim || 0;
    grandK += k; grandC += c;
    cells.push({ key: 'k-'+pt.id, txt: useSummaFormat(k), cls: 'text-green-700 border-l border-blue-200' });
    cells.push({ key: 'c-'+pt.id, txt: useSummaFormat(c), cls: 'text-red-600' });
  });
  cells.push({ key: 'jk', txt: useSummaFormat(grandK), cls: 'text-green-700 border-l border-blue-200' });
  cells.push({ key: 'jc', txt: useSummaFormat(grandC), cls: 'text-red-600' });
  return cells;
});
</script>
