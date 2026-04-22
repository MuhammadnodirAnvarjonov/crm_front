<template>
  <div v-if="model" class="flex flex-col h-full">
    <!-- Status bar -->
    <div class="px-6 py-3 flex items-center justify-between gap-3 flex-wrap border-b border-gray-100">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="px-3 py-1.5 rounded-xl text-sm font-bold"
          :class="statusClass(model.status)">
          {{ getStatusLabel(model.status) }}
        </span>
        <span class="px-3 py-1.5 rounded-xl text-sm font-bold"
          :class="priorityClass(model.priority)">
          {{ getPriorityLabel(model.priority) }}
        </span>
        <span class="px-3 py-1.5 rounded-xl text-sm font-semibold text-white shadow-sm"
          :style="{ backgroundColor: model.category?.color || '#6366f1' }">
          {{ model.category?.name || '—' }}
        </span>
        <span v-if="model.sub_category" class="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
          {{ model.sub_category.name }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <button @click="$emit('edit', model)"
          class="flex items-center gap-1.5 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Tahrirlash
        </button>
      </div>
    </div>

    <div class="p-6 overflow-y-auto flex flex-col gap-5">

      <!-- Bemor info -->
      <div class="bg-blue-50/60 rounded-2xl p-4 border border-blue-100">
        <h4 class="text-xs font-bold text-blue-700 uppercase tracking-wide mb-3">Bemor ma'lumotlari</h4>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span class="text-gray-500 text-xs">Ism familiya</span>
            <p class="font-semibold text-gray-800">
              {{ model.patient?.full_name || model.patient_name || '—' }}
            </p>
          </div>
          <div>
            <span class="text-gray-500 text-xs">Telefon</span>
            <p class="font-semibold text-gray-800">
              {{ model.patient?.phone1 || model.patient_phone || '—' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Murojaat mavzusi -->
      <div>
        <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Mavzu</h4>
        <p class="text-gray-800 font-semibold text-base">{{ model.subject }}</p>
      </div>

      <!-- Tavsif -->
      <div v-if="model.description">
        <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Batafsil tavsif</h4>
        <div class="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed border border-gray-100">
          {{ model.description }}
        </div>
      </div>

      <!-- Hal qilish yo'li -->
      <div v-if="model.resolution" class="bg-green-50 border border-green-200 rounded-2xl p-4">
        <h4 class="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">Hal qilish yo'li</h4>
        <p class="text-sm text-green-800">{{ model.resolution }}</p>
      </div>

      <!-- Ichki eslatma -->
      <div v-if="model.internal_note" class="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <h4 class="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">Ichki eslatma</h4>
        <p class="text-sm text-amber-800">{{ model.internal_note }}</p>
      </div>

      <!-- Meta info grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div class="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <span class="text-xs text-gray-400 block mb-1">Manba</span>
          <span class="font-medium text-sm text-gray-700">{{ getSourceLabel(model.source) }}</span>
        </div>
        <div class="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <span class="text-xs text-gray-400 block mb-1">Operator</span>
          <span class="font-medium text-sm text-gray-700">{{ model.operator?.user_name || '—' }}</span>
        </div>
        <div class="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <span class="text-xs text-gray-400 block mb-1">Mas'ul</span>
          <span class="font-medium text-sm text-gray-700">{{ model.assigned_user?.user_name || '—' }}</span>
        </div>
        <div class="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <span class="text-xs text-gray-400 block mb-1">Filial</span>
          <span class="font-medium text-sm text-gray-700">{{ model.branch?.name || '—' }}</span>
        </div>
        <div class="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <span class="text-xs text-gray-400 block mb-1">Murojaat sanasi</span>
          <span class="font-medium text-sm text-gray-700">{{ formatDate(model.createdAt) }}</span>
        </div>
        <div v-if="model.closed_at" class="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <span class="text-xs text-gray-400 block mb-1">Yopildi</span>
          <span class="font-medium text-sm text-gray-700">{{ formatDate(model.closed_at) }}</span>
        </div>
      </div>

      <!-- Tezkor status o'zgartirish -->
      <div class="border-t border-gray-100 pt-4">
        <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Holatni o'zgartirish</h4>
        <div class="flex flex-wrap gap-2">
          <button v-for="s in statuses" :key="s.value"
            class="px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2"
            :class="model.status === s.value
              ? `${s.activeClass} border-current scale-105 shadow-sm`
              : `${s.inactiveClass} border-transparent hover:scale-105`"
            @click="changeStatus(s.value)">
            {{ s.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import CrmAppealService from "@/services/crm_appeal.service";

const props = defineProps({ model: Object });
const emit = defineEmits(["close", "edit", "status-changed"]);

const statuses = [
  { value: 'new', label: '🔵 Yangi', activeClass: 'bg-blue-100 text-blue-700', inactiveClass: 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600' },
  { value: 'in_progress', label: '🟡 Jarayonda', activeClass: 'bg-amber-100 text-amber-700', inactiveClass: 'bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-600' },
  { value: 'resolved', label: '🟢 Hal qilindi', activeClass: 'bg-green-100 text-green-700', inactiveClass: 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600' },
  { value: 'closed', label: '⚫ Yopildi', activeClass: 'bg-gray-200 text-gray-700', inactiveClass: 'bg-gray-100 text-gray-500 hover:bg-gray-200' },
  { value: 'cancelled', label: '🔴 Bekor', activeClass: 'bg-red-100 text-red-600', inactiveClass: 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500' },
];

const getStatusLabel = (s) => {
  const found = statuses.find(x => x.value === s);
  return found?.label || s;
};

const getPriorityLabel = (p) => {
  const labels = { low: '🟢 Past', medium: '🟡 O\'rta', high: '🟠 Yuqori', urgent: '🔴 Shoshilinch' };
  return labels[p] || p;
};

const getSourceLabel = (source) => {
  const sources = { phone: '📞 Telefon', telegram: '✈️ Telegram', instagram: '📷 Instagram', whatsapp: '💬 WhatsApp', walk_in: '🚶 Shaxsan', email: '📧 Email', other: '🔹 Boshqa' };
  return sources[source] || source;
};

const statusClass = (s) => {
  return { new: 'bg-blue-100 text-blue-700', in_progress: 'bg-amber-100 text-amber-700', resolved: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-600', cancelled: 'bg-red-100 text-red-500' }[s] || 'bg-gray-100 text-gray-600';
};

const priorityClass = (p) => {
  return { low: 'bg-gray-100 text-gray-600', medium: 'bg-blue-100 text-blue-700', high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700' }[p] || 'bg-gray-100 text-gray-600';
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const changeStatus = async (newStatus) => {
  if (!props.model || props.model.status === newStatus) return;
  try {
    await CrmAppealService.changeStatus(props.model.id, newStatus);
    props.model.status = newStatus;
    if (newStatus === 'closed' || newStatus === 'resolved') {
      props.model.closed_at = new Date().toISOString();
    }
    emit('status-changed');
  } catch (err) { console.error(err); }
};
</script>
