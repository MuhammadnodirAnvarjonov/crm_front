<template>
  <div class="flex flex-col h-full gap-2">

    <!-- ── Sticky controls ── -->
    <div class="flex-shrink-0 sticky top-0 z-10 flex flex-col gap-2 pb-1" style="background:#f0f2f5;">

      <!-- Tab switcher -->
      <div class="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit shadow-sm">
        <button @click="view = 'hisobot'"
          class="px-5 py-1.5 rounded-lg text-sm font-semibold transition-all"
          :class="view === 'hisobot' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-800'">
          Hisobot
        </button>
        <button @click="view = 'sverka'"
          class="px-5 py-1.5 rounded-lg text-sm font-semibold transition-all"
          :class="view === 'sverka' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:text-gray-800'">
          Sverka
        </button>
      </div>

      <!-- Filter -->
      <div class="flex flex-wrap items-end gap-2 bg-white rounded-xl p-2 border border-gray-100 shadow-sm">
        <BaseInput type="datetime-local" v-model="filter.datetime1" label="Dan" size="sm"/>
        <BaseInput type="datetime-local" v-model="filter.datetime2" label="Gacha" size="sm"/>
        <BaseSelect v-model="filter.pay_type_id" :options="payTypeOptions" :label="$t('pay_type')"
          :label-key="payTypeLabelKey" value-key="id" :clearable="false" size="sm"/>
        <BaseSelect v-model="filter.refund" :options="refundOptions" label="Qaytarilgan"
          :clearable="false" size="sm"/>
        <BaseSelect v-model="filter.doc_type" :options="docTypeOptions"
          label="Doc turi" :clearable="false" size="sm"/>
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
    </div><!-- /sticky controls -->

    <!-- ══════════════ HISOBOT ══════════════ -->
    <KassaHisobot v-if="view === 'hisobot'"
      :rows="rows" :loading="loading"
      :all-pay-types="globalStore.payTypes"
      :pay-type-label-key="payTypeLabelKey"/>

    <!-- ══════════════ SVERKA ══════════════ -->
    <KassaSverka v-else-if="view === 'sverka'"
      :rows="rows" :loading="loading"
      :pay-type-label-key="payTypeLabelKey"
      :doc-type="filter.doc_type"/>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@/stores/user';
import { useGlobalStore } from '@/stores/global';
import reportService from '@/services/report.service';
import { useReportFilter } from '@/composables/useReportFilter';
import BaseInput from '@/components/form/BaseInput.vue';
import BaseSelect from '@/components/form/BaseSelect.vue';
import BaseButton from '@/components/form/BaseButton.vue';
import KassaHisobot from './KassaHisobot.vue';
import KassaSverka from './KassaSverka.vue';

const { t, locale } = useI18n();
const userStore   = useUserStore();
const globalStore = useGlobalStore();
const { canFilterUsers, applyUserFilter } = useReportFilter();

const payTypeLabelKey = computed(() =>
  'name_' + (locale.value === 'uzk' ? 'uzk' : locale.value === 'ru' ? 'ru' : 'uz')
);

const payTypeOptions = computed(() => {
  const all = [{ id: '', name: t('all'), name_uz: t('all'), name_uzk: t('all'), name_ru: t('all') }];
  return [...all, ...globalStore.payTypes];
});

const refundOptions = [
  { id: '', name: 'Barchasi' },
  { id: 'no', name: "Yo'q" },
  { id: 'yes', name: 'Ha' },
];

const docTypeOptions = [
  { id: '',               name: 'Barchasi' },
  { id: 'reg_service',    name: "Xizmat ko'rsatish" },
  { id: 'reg_palata',     name: "Palata to'lov" },
  { id: 'user_payment',   name: "Xodim to'lov" },
  { id: 'direct_payment', name: "Vakil uchun to'lov" },
];

const view    = ref('hisobot');
const loading = ref(false);
const rows    = ref([]);

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const fmt = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

const filter = ref({
  datetime1:   fmt(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0)),
  datetime2:   fmt(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59)),
  pay_type_id: '',
  refund:      '',
  doc_type:    '',
});

const loadReport = async () => {
  loading.value = true;
  rows.value    = [];
  try {
    const params = {
      branch_id: userStore.user?.branch_id,
      datetime1: filter.value.datetime1 || undefined,
      datetime2: filter.value.datetime2 || undefined,
    };
    if (filter.value.pay_type_id) params.pay_type_id = filter.value.pay_type_id;
    if (filter.value.refund)      params.refund       = filter.value.refund;
    const res  = await reportService.kassa(applyUserFilter(params));
    rows.value = res?.rows || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const resetFilter = () => {
  filter.value = {
    datetime1:   fmt(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0)),
    datetime2:   fmt(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59)),
    pay_type_id: '',
    refund:      '',
    doc_type:    '',
  };
  rows.value = [];
};

const exportExcel = () => {
  const table = document.getElementById('kassa-report-table');
  if (!table) return;
  let csv = '';
  for (const row of table.rows) {
    const cells = [...row.cells].map(c => `"${c.innerText.replace(/"/g, '""')}"`);
    csv += cells.join(',') + '\n';
  }
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `kassa_hisobot_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
</script>
