<template>
  <div class="p-4 md:p-6 bg-white rounded-3xl h-full shadow-xl border border-gray-100 flex flex-col">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
      <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <span>{{ $t('register_jarima') }}</span>
        <span class="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
          {{ models.length }}
        </span>
      </h2>

      <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <DatePicker v-model="dateRange" mode="datetimerange" @update:modelValue="getModels" />
        <BaseSelect
          v-model="selectedUserId"
          :options="users"
          label-key="user_name"
          value-key="id"
          :placeholder="$t('select_employee')"
          clearable
          size="md"
          @change="getModels"
        />
        <UpdateButton @click="getModels" />
      </div>
    </div>

    <!-- Umumiy statistika -->
    <div v-if="models.length" class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      <div class="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
        <p class="text-xs text-blue-500 font-medium">{{ $t('total_records') }}</p>
        <p class="text-xl font-bold text-blue-700">{{ models.length }}</p>
      </div>
      <div class="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
        <p class="text-xs text-red-500 font-medium">{{ $t('total_penalty') }}</p>
        <p class="text-xl font-bold text-red-700">{{ useSummaFormat(totalPenalty) }}</p>
      </div>
      <div class="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
        <p class="text-xs text-amber-500 font-medium">{{ $t('late_arrivals') }}</p>
        <p class="text-xl font-bold text-amber-700">{{ lateCount }}</p>
      </div>
      <div class="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
        <p class="text-xs text-green-500 font-medium">{{ $t('rest_day') }}</p>
        <p class="text-xl font-bold text-green-700">{{ restDayCount }}</p>
      </div>
    </div>

    <!-- Table -->
    <div class="flex-1 min-h-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50/30">
      <ResponsiveTable :columns="columns" :data="models" @refresh="getModels">
        <template #statusSlot="{ item }">
          <span v-if="item.is_rest_day"
            class="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700">
            {{ $t('rest_day_short') }}
          </span>
          <span v-else-if="parseFloat(item.penalty) > 0"
            class="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700">
            {{ $t('penalty') }}
          </span>
          <span v-else
            class="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
            {{ $t('normal_status') }}
          </span>
        </template>
      </ResponsiveTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import ResponsiveTable from "@/components/common/ResponsiveTable.vue";
import faceidService from "@/services/faceid.service";
import usersService from "@/services/users.service";
import DatePicker from "@/components/form/DatePicker.vue";
import BaseSelect from "@/components/form/BaseSelect.vue";
import UpdateButton from "@/components/form/UpdateButton.vue";
import { useSummaFormat } from "@/composables/NumberFormat";

const { t } = useI18n();

const models = ref([]);
const users = ref([]);
const dateRange = ref([]);
const selectedUserId = ref(null);

// Unix timestamp → vaqt formati
const formatTime = (unix) => {
  if (!unix) return "—";
  const d = new Date(unix * 1000);
  return d.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (unix) => {
  if (!unix) return "—";
  const d = new Date(unix * 1000);
  return d.toLocaleDateString("uz-UZ", { year: "numeric", month: "2-digit", day: "2-digit" });
};

// Kechikish daqiqalarini hisoblash
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

const columns = [
  { key: "id", label: "#", headerClass: "w-12 text-center", class: "text-center text-gray-500", render: (row, i) => i + 1, hideOnMobile: true },
  { key: "user.user_name", label: t('employee'), class: "font-semibold text-gray-800" },
  { key: "date", label: t('date'), render: (row) => formatDate(row.real_come_time || row.createdAt) },
  { key: "come_time", label: t('scheduled_come'), render: (row) => formatTime(row.come_time), hideOnMobile: true },
  { key: "leave_time", label: t('scheduled_leave'), render: (row) => formatTime(row.leave_time), hideOnMobile: true },
  { key: "real_come_time", label: t('actual_come'), render: (row) => formatTime(row.real_come_time), class: "font-medium" },
  { key: "real_leave_time", label: t('actual_leave'), render: (row) => formatTime(row.real_leave_time), class: "font-medium" },
  { key: "late", label: t('late_minutes'), render: (row) => { const m = lateMinutes(row); return m > 0 ? m + " daq" : "—"; }, class: "text-amber-600 font-medium" },
  { key: "early", label: t('early_leave_minutes'), render: (row) => { const m = earlyLeaveMinutes(row); return m > 0 ? m + " daq" : "—"; }, class: "text-amber-600 font-medium", hideOnMobile: true },
  { key: "penalty", label: t('penalty'), render: (row) => parseFloat(row.penalty) > 0 ? useSummaFormat(row.penalty) : "—", class: "font-bold text-red-600 text-right" },
  { key: "status", label: t('status'), slot: "statusSlot", headerClass: "text-center", class: "text-center" },
];

// Statistikalar
const totalPenalty = computed(() =>
  models.value.reduce((sum, r) => sum + parseFloat(r.penalty || 0), 0)
);
const lateCount = computed(() =>
  models.value.filter((r) => lateMinutes(r) > 0).length
);
const restDayCount = computed(() =>
  models.value.filter((r) => r.is_rest_day).length
);

const getModels = async () => {
  try {
    const filter = {};
    if (dateRange.value?.length === 2) {
      filter.datetime1 = dateRange.value[0];
      filter.datetime2 = dateRange.value[1];
    }
    if (selectedUserId.value) {
      filter.user_id = selectedUserId.value;
    }
    models.value = await faceidService.report(filter);
  } catch (err) {
    console.error("Report loading error:", err);
  }
};

const getUsers = async () => {
  try {
    users.value = await usersService.all();
  } catch (err) {
    console.error("Users loading error:", err);
  }
};

onMounted(async () => {
  await Promise.all([getModels(), getUsers()]);
});
</script>
