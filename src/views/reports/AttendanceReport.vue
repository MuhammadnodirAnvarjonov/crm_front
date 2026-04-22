<template>
  <div class="h-full flex flex-col gap-2 min-h-0">

    <!-- Controls -->
    <div class="flex-shrink-0 flex flex-wrap items-end gap-2 bg-white rounded-xl px-2 py-1.5 border border-gray-100 shadow-sm">
      <BaseInput type="datetime-local" v-model="filter.datetime1" label="Dan" size="sm"/>
      <BaseInput type="datetime-local" v-model="filter.datetime2" label="Gacha" size="sm"/>
      <BaseSelect v-if="canFilterUsers" v-model="filter.user_id" :options="users" label-key="user_name" value-key="id" label="Xodim" clearable size="sm"/>

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

    <!-- Summary cards -->
    <div v-if="rows.length && !loading" class="flex-shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-2">
      <SummaryCard label="Jami yozuvlar" :value="rows.length" type="count" color="blue"/>
      <SummaryCard label="Jami jarima" :value="totalPenalty" type="money" color="red"/>
      <SummaryCard label="Kechikishlar" :value="lateCount" type="count" color="amber"/>
      <SummaryCard label="Dam olish kuni" :value="restDayCount" type="count" color="green"/>
    </div>

    <!-- Table -->
    <div class="flex-1 overflow-auto rounded-xl border border-gray-100 min-h-0">
      <table id="attendance-report-table" class="w-full text-sm whitespace-nowrap">
        <thead class="bg-gray-50 text-gray-500 text-xs sticky top-0 z-10">
          <tr>
            <th class="px-2 py-1 text-left">#</th>
            <th class="px-2 py-1 text-left">Xodim</th>
            <th class="px-2 py-1 text-left">Sana</th>
            <th class="px-2 py-1 text-center">Reja kelish</th>
            <th class="px-2 py-1 text-center">Reja ketish</th>
            <th class="px-2 py-1 text-center">Haqiqiy kelish</th>
            <th class="px-2 py-1 text-center">Haqiqiy ketish</th>
            <th class="px-2 py-1 text-right">Kechikish</th>
            <th class="px-2 py-1 text-right">Erta ketish</th>
            <th class="px-2 py-1 text-right">Jarima</th>
            <th class="px-2 py-1 text-center">Holat</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="11" class="text-center py-6 text-gray-400">
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
            <td colspan="11" class="text-center py-6 text-gray-400">Ma'lumot yo'q. Avval filterlang.</td>
          </tr>
          <tr v-else v-for="(row, i) in rows" :key="row.id || i" class="border-t hover:bg-gray-50">
            <td class="px-2 py-1 text-blue-600 font-bold">{{ i + 1 }}</td>
            <td class="px-2 py-1 font-medium text-gray-800">{{ row.user?.user_name || '—' }}</td>
            <td class="px-2 py-1 text-gray-500 text-xs">{{ formatDate(row.real_come_time || row.createdAt) }}</td>
            <td class="px-2 py-1 text-center">{{ formatTime(row.come_time) }}</td>
            <td class="px-2 py-1 text-center">{{ formatTime(row.leave_time) }}</td>
            <td class="px-2 py-1 text-center font-medium">{{ formatTime(row.real_come_time) }}</td>
            <td class="px-2 py-1 text-center font-medium">{{ formatTime(row.real_leave_time) }}</td>
            <td class="px-2 py-1 text-right text-amber-600 font-medium">
              {{ lateMinutes(row) > 0 ? lateMinutes(row) + ' daq' : '—' }}
            </td>
            <td class="px-2 py-1 text-right text-amber-600 font-medium">
              {{ earlyLeaveMinutes(row) > 0 ? earlyLeaveMinutes(row) + ' daq' : '—' }}
            </td>
            <td class="px-2 py-1 text-right font-bold text-red-600">
              {{ parseFloat(row.penalty) > 0 ? useSummaFormat(row.penalty) : '—' }}
            </td>
            <td class="px-2 py-1 text-center">
              <span v-if="row.is_rest_day" class="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">Dam olish</span>
              <span v-else-if="parseFloat(row.penalty) > 0" class="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">Jarima</span>
              <span v-else class="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">Normal</span>
            </td>
          </tr>
        </tbody>
        <tfoot v-if="rows.length" class="bg-blue-50 font-semibold text-sm border-t-2 border-blue-200 sticky bottom-0">
          <tr>
            <td colspan="7" class="px-2 py-1">JAMI: {{ rows.length }} ta</td>
            <td class="px-2 py-1 text-right text-amber-600">{{ totalLateMinutes }} daq</td>
            <td class="px-2 py-1 text-right text-amber-600">{{ totalEarlyMinutes }} daq</td>
            <td class="px-2 py-1 text-right text-red-700">{{ useSummaFormat(totalPenalty) }}</td>
            <td class="px-2 py-1"></td>
          </tr>
        </tfoot>
      </table>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useSummaFormat } from '@/composables/NumberFormat';
import { useReportFilter } from '@/composables/useReportFilter';
import faceidService from '@/services/faceid.service';
import usersService from '@/services/users.service';
import SummaryCard from './components/SummaryCard.vue';
import BaseInput from '@/components/form/BaseInput.vue';
import BaseSelect from '@/components/form/BaseSelect.vue';
import BaseButton from '@/components/form/BaseButton.vue';

const { canFilterUsers, applyUserFilter } = useReportFilter();

const loading = ref(false);
const rows = ref([]);
const users = ref([]);

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

const filter = ref({
  datetime1: fmt(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0)),
  datetime2: fmt(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59)),
  user_id: null,
});

const formatTime = (unix) => {
  if (!unix) return '—';
  const d = new Date(unix * 1000);
  return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (unix) => {
  if (!unix) return '—';
  const d = new Date(unix * 1000);
  return d.toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const lateMinutes = (row) => {
  if (!row.real_come_time || !row.come_time || row.is_rest_day) return 0;
  const diff = Math.floor((row.real_come_time - row.come_time) / 60);
  return diff > 0 ? diff : 0;
};

const earlyLeaveMinutes = (row) => {
  if (!row.real_leave_time || !row.leave_time || row.is_rest_day) return 0;
  const diff = Math.floor((row.leave_time - row.real_leave_time) / 60);
  return diff > 0 ? diff : 0;
};

const totalPenalty = computed(() =>
  rows.value.reduce((sum, r) => sum + parseFloat(r.penalty || 0), 0)
);
const lateCount = computed(() =>
  rows.value.filter(r => lateMinutes(r) > 0).length
);
const restDayCount = computed(() =>
  rows.value.filter(r => r.is_rest_day).length
);
const totalLateMinutes = computed(() =>
  rows.value.reduce((sum, r) => sum + lateMinutes(r), 0)
);
const totalEarlyMinutes = computed(() =>
  rows.value.reduce((sum, r) => sum + earlyLeaveMinutes(r), 0)
);

const loadReport = async () => {
  loading.value = true;
  rows.value = [];
  try {
    const params = {};
    if (filter.value.datetime1) params.datetime1 = filter.value.datetime1;
    if (filter.value.datetime2) params.datetime2 = filter.value.datetime2;
    if (filter.value.user_id) params.user_id = filter.value.user_id;
    rows.value = await faceidService.report(applyUserFilter(params));
  } catch (err) {
    console.error('Attendance report error:', err);
  } finally {
    loading.value = false;
  }
};

const resetFilter = () => {
  filter.value = {
    datetime1: fmt(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0)),
    datetime2: fmt(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59)),
    user_id: null,
  };
  rows.value = [];
};

const exportExcel = () => {
  const table = document.getElementById('attendance-report-table');
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
  a.download = `davomat_hisobot_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

onMounted(async () => {
  try {
    users.value = await usersService.all();
  } catch (err) {
    console.error('Users loading error:', err);
  }
  loadReport();
});
</script>
