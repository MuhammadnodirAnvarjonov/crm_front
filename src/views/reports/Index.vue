<template>
  <div class="p-4 md:p-6 bg-gray-50 min-h-full">

    <!-- Header -->
    <div class="mb-8 fade-in-header">
      <h2 class="text-2xl md:text-3xl font-extrabold text-gray-800">{{ $t('report_center') }}</h2>
      <p class="text-gray-500 mt-1 text-sm md:text-base">{{ $t('report_center_desc') }}</p>
    </div>

    <!-- Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
      <div
        v-for="(group, gi) in reportGroups"
        :key="group.titleKey"
        class="report-card bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        :style="{ '--delay': gi * 80 + 'ms' }"
      >
        <!-- Card Header -->
        <div :class="group.color" class="px-5 py-4 flex items-center gap-3 text-white">
          <span class="text-xl leading-none select-none">{{ group.emoji }}</span>
          <h3 class="font-bold text-base">{{ $t(group.titleKey) }}</h3>
          <span class="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">{{ group.links.length }}</span>
        </div>

        <!-- Links -->
        <div class="p-3 flex flex-col gap-0.5">
          <router-link
            v-for="link in group.links"
            :key="link.routeName"
            :to="{ name: link.routeName }"
            class="link-row flex items-center justify-between px-4 py-2.5 rounded-xl border border-transparent transition-all duration-200"
          >
            <div class="flex items-center gap-2.5">
              <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="group.dotColor"></span>
              <span class="text-sm text-gray-700 font-medium">{{ $t(link.labelKey) }}</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="arrow-icon h-4 w-4 text-gray-300 transition-all duration-200 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </router-link>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

/** Hisobot ruxsatini tekshiradi (settings.reports[key]) */
const hasReportAccess = (key) => {
  const s = userStore.user?.role?.settings;
  let settings = {};
  try { settings = s ? (typeof s === 'string' ? JSON.parse(s) : s) : {}; } catch { settings = {}; }
  const reports = settings.reports;
  if (!reports) return true; // reports yo'q bo'lsa hamma ruxsat bor (eski rollar)
  if (!(key in reports)) return true; // key yo'q bo'lsa ruxsat bor
  return !!reports[key];
};

const allReportGroups = [
  // ─── CRM va mijozlar ────────────────────────────────────────
  {
    titleKey: 'report_crm',
    color: 'bg-gradient-to-r from-purple-600 to-violet-500',
    dotColor: 'bg-purple-500',
    emoji: '🤝',
    links: [
      { labelKey: 'report_crm_link', routeName: 'crm-report' },
    ]
  },

  // ─── Moliya va kassa ────────────────────────────────────────
  {
    titleKey: 'report_finance',
    color: 'bg-gradient-to-r from-amber-500 to-yellow-400',
    dotColor: 'bg-amber-500',
    emoji: '💰',
    links: [
      { labelKey: 'report_kassa_link', routeName: 'kassa-report' },
      { labelKey: 'report_kassa_order', routeName: 'kassa-order-report' },
      { labelKey: 'report_user_payment', routeName: 'user-payment-report' },
    ]
  },

  // ─── Ombor va ta'minot ──────────────────────────────────────
  {
    titleKey: 'report_warehouse',
    color: 'bg-gradient-to-r from-teal-600 to-cyan-500',
    dotColor: 'bg-teal-500',
    emoji: '📦',
    links: [
      { labelKey: 'report_prixod', routeName: 'prixod-report' },
      { labelKey: 'report_rasxod', routeName: 'rasxod-report' },
      { labelKey: 'report_supplier_register', routeName: 'supplier-report' },
    ]
  },

  // ─── Xodimlar va HR ─────────────────────────────────────────
  {
    titleKey: 'report_staff',
    color: 'bg-gradient-to-r from-rose-600 to-pink-500',
    dotColor: 'bg-rose-500',
    emoji: '👤',
    links: [
      { labelKey: 'report_staff_link', routeName: 'user-report' },
      { labelKey: 'report_attendance', routeName: 'attendance-report' },
    ]
  },
];

/** Ruxsat bo'lgan linklar bo'yicha filtrlab, bo'sh guruhlarni olib tashlash */
const reportGroups = computed(() =>
  allReportGroups
    .map(g => ({ ...g, links: g.links.filter(l => hasReportAccess(l.routeName)) }))
    .filter(g => g.links.length > 0)
);
</script>

<style scoped>
.fade-in-header {
  animation: fadeDown 0.45s ease both;
}

.report-card {
  animation: cardIn 0.4s ease both;
  animation-delay: var(--delay, 0ms);
}

.link-row:hover {
  background-color: #f9fafb;
  border-color: #e5e7eb;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.link-row:hover span:not(.w-1\.5) {
  color: #2563eb;
}

.link-row:hover .arrow-icon {
  color: #3b82f6;
  transform: translateX(4px);
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(18px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
