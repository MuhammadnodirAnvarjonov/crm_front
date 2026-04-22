<template>
  <div class="flex-1 flex flex-col gap-2 min-h-0">

    <!-- Tranzaksiya jadvali -->
    <div class="flex-1 overflow-auto rounded-xl border border-gray-100 min-h-0 bg-white shadow-sm">
      <table class="w-full text-sm whitespace-nowrap">
        <thead class="text-xs sticky top-0 z-10" style="background:#f8fafc; color:#64748b;">
          <tr>
            <th class="px-2 py-1.5 text-left font-semibold">#</th>
            <th class="px-2 py-1.5 text-left font-semibold">Sana / Vaqt</th>
            <th class="px-2 py-1.5 text-left font-semibold">Bemor</th>
            <th class="px-2 py-1.5 text-left font-semibold">Xodim</th>
            <th class="px-2 py-1.5 text-left font-semibold">Ro'yxatchi</th>
            <th class="px-2 py-1.5 text-left font-semibold">To'lov turi</th>
            <th class="px-2 py-1.5 text-left font-semibold">Turi</th>
            <th class="px-2 py-1.5 text-right font-semibold text-green-600">Kirim</th>
            <th class="px-2 py-1.5 text-right font-semibold text-red-500">Chiqim</th>
            <th class="px-2 py-1.5 text-right font-semibold">Chegirma</th>
            <th class="px-2 py-1.5 text-right font-semibold">NDS</th>
            <th class="px-2 py-1.5 text-center font-semibold">Qaytarilgan</th>
            <th class="px-2 py-1.5 text-left font-semibold">Doc turi</th>
            <th class="px-2 py-1.5 text-left font-semibold">Izoh</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="14" class="py-6 text-center text-gray-400">
              <div class="flex items-center justify-center gap-2">
                <svg class="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Yuklanmoqda...
              </div>
            </td>
          </tr>
          <tr v-else-if="filteredRows.length === 0">
            <td colspan="14" class="py-6 text-center text-gray-400 text-sm">
              Ma'lumot yo'q — avval filterlang va <b>Filterlash</b> tugmasini bosing
            </td>
          </tr>
          <tr v-for="(row, i) in filteredRows" v-else :key="row.id"
            class="border-t border-gray-50 hover:bg-gray-50/80">
            <td class="px-2 py-1.5 text-blue-500 font-bold text-xs">{{ i + 1 }}</td>
            <td class="px-2 py-1.5 text-gray-400 text-xs font-mono">{{ formatDt(row.date_time) }}</td>
            <td class="px-2 py-1.5 font-medium text-gray-800 text-xs">{{ row.patient?.full_name || '-' }}</td>
            <td class="px-2 py-1.5 text-gray-600 text-xs">{{ row.user_doc?.user_name || '-' }}</td>
            <td class="px-2 py-1.5 text-gray-600 text-xs">{{ row.user?.user_name || '-' }}</td>
            <td class="px-2 py-1.5">
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="payTypeClass(row.pay_type?.color)">
                {{ row.pay_type?.[payTypeLabelKey] || row.pay_type?.name || '-' }}
              </span>
            </td>
            <td class="px-2 py-1.5">
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                :class="row.type === 'kirim' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'">
                {{ row.type === 'kirim' ? 'Kirim' : 'Chiqim' }}
              </span>
            </td>
            <td class="px-2 py-1.5 text-right font-bold"
              :class="row.type === 'kirim' ? 'text-green-700' : 'text-gray-300'">
              {{ row.type === 'kirim' ? useSummaFormat(row.summa) : '0' }}
            </td>
            <td class="px-2 py-1.5 text-right font-bold"
              :class="row.type === 'chiqim' ? 'text-red-600' : 'text-gray-300'">
              {{ row.type === 'chiqim' ? useSummaFormat(row.summa) : '0' }}
            </td>
            <td class="px-2 py-1.5 text-right text-orange-500 text-xs">{{ useSummaFormat(row.discount) }}</td>
            <td class="px-2 py-1.5 text-right text-purple-500 text-xs">{{ useSummaFormat(row.nds) }}</td>
            <td class="px-2 py-1.5 text-center">
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                :class="row.refund === 'yes' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'">
                {{ row.refund === 'yes' ? 'Ha' : "Yo'q" }}
              </span>
            </td>
            <td class="px-2 py-1.5 text-gray-500 text-xs">{{ docTypeLabel(row.doc_type) }}</td>
            <td class="px-2 py-1.5 text-gray-400 italic text-xs max-w-[160px] truncate">{{ row.comment || '-' }}</td>
          </tr>
        </tbody>
        <tfoot v-if="filteredRows.length"
          class="border-t-2 border-blue-200 font-bold text-sm sticky bottom-0 z-10" style="background:#eff6ff;">
          <tr>
            <td colspan="7" class="px-2 py-1.5 text-gray-600">JAMI: {{ filteredRows.length }} ta</td>
            <td class="px-2 py-1.5 text-right text-green-700">{{ useSummaFormat(totalKirim) }}</td>
            <td class="px-2 py-1.5 text-right text-red-600">{{ useSummaFormat(totalChiqim) }}</td>
            <td colspan="5" class="px-2 py-1.5"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSummaFormat } from '@/composables/NumberFormat';

const { t } = useI18n();

const props = defineProps({
  rows:           { type: Array,   default: () => [] },
  loading:        { type: Boolean, default: false },
  payTypeLabelKey:{ type: String,  default: 'name' },
  docType:        { type: String,  default: '' },
});

const docTypeLabel = (type) => {
  const key = 'doc_type_' + type;
  const translated = t(key);
  return translated !== key ? translated : type || '—';
};

const colorClassMap = {
  success: 'bg-green-100 text-green-700',
  info:    'bg-blue-100 text-blue-700',
  warning: 'bg-yellow-100 text-yellow-700',
  primary: 'bg-indigo-100 text-indigo-700',
  purple:  'bg-purple-100 text-purple-700',
  danger:  'bg-red-100 text-red-700',
};
const payTypeClass = (color) => colorClassMap[color] || 'bg-gray-100 text-gray-600';

const formatDt = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleString('uz-UZ', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
};

// doc_type filter
const filteredRows = computed(() => {
  if (!props.docType) return props.rows;
  return props.rows.filter(r => r.doc_type === props.docType);
});

const totalKirim = computed(() =>
  filteredRows.value.filter(r => r.type === 'kirim').reduce((s, r) => s + Number(r.summa || 0), 0)
);
const totalChiqim = computed(() =>
  filteredRows.value.filter(r => r.type === 'chiqim').reduce((s, r) => s + Number(r.summa || 0), 0)
);
</script>
