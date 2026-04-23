<script setup>
import { ref, computed } from 'vue'

// Top stat cards
const statCards = [
  { label: "Qo'ng'iroqlar", today: 9, total: 16, icon: 'clock', iconBg: 'bg-orange-50', iconColor: 'text-orange-500' },
  { label: 'Anketalar', today: 9, total: 16, icon: 'doc', iconBg: 'bg-slate-50', iconColor: 'text-slate-500' },
  { label: "Bepul e'lon", today: 9, total: 16, icon: 'bot', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
  { label: "Pullik e'lon", today: 9, total: 16, icon: 'dollar', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
  { label: 'Shartnomalar', today: 9, total: 16, icon: 'crown', iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
  { label: 'Agent', today: 9, total: 16, icon: 'building', iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
]

const dateFilter = ref('')
const searchQuery = ref('')
const categoryFilter = ref('Barchasi')

// Column definitions
const columns = [
  { key: 'resubmit', title: 'Qayta murojat', accent: 'bg-blue-500' },
  { key: 'free', title: "+ Bepul e'lon", accent: 'bg-blue-500', withPlus: true },
  { key: 'approved', title: "Tasdiqlangan e'lon", accent: 'bg-blue-500' },
  { key: 'threedays', title: "3 kun o'tdi", accent: 'bg-blue-500' },
  { key: 'paid', title: "Pullik e'lon", accent: 'bg-blue-500' },
]

const baseCard = {
  id: '5646489', name: 'Alisher Umarov', job: 'Dasturchi',
  phone: '+998901234567', location: 'Toshkent, Yunusobod', salary: 8000000,
}

// Kanban data: 2 rows per column
const kanban = {
  resubmit: [
    { ...baseCard, status: 'Tasdiqlanmadi', statusType: 'rejected', time: '1 kun' },
    { ...baseCard, status: 'Tasdiqlanmadi', statusType: 'rejected', time: '3 kun' },
  ],
  free: [
    { ...baseCard, status: 'Tasdiqlanmagan', statusType: 'pending', highlight: true, editable: true },
    { ...baseCard, status: 'Tasdiqlandi', statusType: 'approved', showActions: true },
  ],
  approved: [
    { ...baseCard, status: 'Tasdiqlandi', statusType: 'approved' },
    { ...baseCard, status: 'Tasdiqlandi', statusType: 'approved' },
  ],
  threedays: [
    { ...baseCard, status: 'Tasdiqlandi', statusType: 'approved' },
    { ...baseCard, status: 'Tasdiqlandi', statusType: 'approved' },
  ],
  paid: [
    { ...baseCard, category: 'A', categoryColor: 'amber', buttons: true },
    { ...baseCard, category: 'V', categoryColor: 'purple', buttons: true },
  ],
}

const formatMoney = (v) => v.toLocaleString('fr-FR').replace(/\s/g, ',')

const statusBadge = (type) => {
  const map = {
    rejected: 'bg-orange-100 text-orange-600 border-orange-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  }
  return map[type] || 'bg-slate-100 text-slate-600 border-slate-200'
}

const categoryBadge = (color) => {
  const map = {
    amber: 'bg-amber-400 text-white',
    purple: 'bg-purple-500 text-white',
  }
  return map[color] || 'bg-slate-400 text-white'
}
</script>

<template>
  <div class="space-y-4">
    <!-- Top stat bar: big call icon + 6 stat cards -->
    <div class="flex flex-col sm:flex-row items-stretch gap-3">
      <!-- Big call button -->
      <button
        class="h-14 sm:h-auto w-full sm:w-[72px] shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition">
        <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      </button>

      <!-- Stat cards -->
      <div class="flex-1 grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div v-for="(s, i) in statCards" :key="i"
          class="bg-white rounded-xl border border-slate-100 px-3 py-2 flex items-center justify-between">
          <div>
            <p class="text-[11px] font-semibold text-slate-500">{{ s.label }}</p>
            <div class="flex gap-3 mt-1">
              <div>
                <p class="text-[10px] text-slate-400">Bugungi</p>
                <p class="text-[14px] font-bold" :class="s.iconColor">{{ s.today }}</p>
              </div>
              <div>
                <p class="text-[10px] text-slate-400">Umumiy</p>
                <p class="text-[14px] font-bold" :class="s.iconColor">{{ s.total }}</p>
              </div>
            </div>
          </div>
          <div class="w-9 h-9 rounded-lg flex items-center justify-center" :class="[s.iconBg, s.iconColor]">
            <svg v-if="s.icon === 'clock'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 14" />
              <path d="M19 5l2 2M3 5l2 2" />
            </svg>
            <svg v-else-if="s.icon === 'doc'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="8" y1="13" x2="16" y2="13" />
              <line x1="8" y1="17" x2="13" y2="17" />
            </svg>
            <svg v-else-if="s.icon === 'bot'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="8" width="16" height="12" rx="2" />
              <path d="M12 8V4M8 4h8" />
              <circle cx="9" cy="13" r="1" />
              <circle cx="15" cy="13" r="1" />
              <path d="M10 17h4" />
            </svg>
            <svg v-else-if="s.icon === 'dollar'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <svg v-else-if="s.icon === 'crown'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 18l2-10 5 4 3-8 3 8 5-4 2 10H2z" />
            </svg>
            <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <path d="M9 22V12h6v10M9 6h.01M15 6h.01M9 10h.01M15 10h.01" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="bg-white rounded-xl border border-slate-100 p-3 flex flex-col sm:flex-row gap-3">
      <div class="relative w-full sm:w-[240px]">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </div>
        <select v-model="dateFilter"
          class="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-700 appearance-none focus:outline-none focus:border-blue-400">
          <option value="">Sana bo'yicha filtrlash</option>
          <option value="today">Bugun</option>
          <option value="week">Shu hafta</option>
          <option value="month">Shu oy</option>
        </select>
        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      <div class="relative flex-1">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input v-model="searchQuery" placeholder="Filtrlash"
          class="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-[13px] placeholder-slate-400 focus:outline-none focus:border-blue-400" />
      </div>

      <div class="relative w-full sm:w-[160px]">
        <select v-model="categoryFilter"
          class="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-700 appearance-none focus:outline-none focus:border-blue-400">
          <option>Barchasi</option>
          <option>Anketa</option>
          <option>Ko'rib chiqilgan</option>
          <option>Yakunlangan</option>
        </select>
        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Kanban board -->
    <div class="bg-white rounded-xl border border-slate-100 p-3 overflow-x-auto">
      <div class="min-w-[1200px]">
      <!-- Column headers -->
      <div class="grid grid-cols-[40px_repeat(5,1fr)] gap-3 mb-3 pb-3 border-b border-slate-100">
        <div></div>
        <div v-for="col in columns" :key="col.key"
          class="text-center text-[14px] font-bold text-slate-700 px-2 py-2">
          {{ col.title }}
        </div>
      </div>

      <!-- Rows (2 rows) -->
      <div v-for="rowIdx in [0, 1]" :key="rowIdx"
        class="grid grid-cols-[40px_repeat(5,1fr)] gap-3 mb-3">
        <!-- Row number -->
        <div class="flex items-start justify-center pt-6">
          <span class="text-[22px] font-bold text-slate-300">{{ rowIdx + 1 }}</span>
        </div>

        <!-- Cards for each column -->
        <div v-for="col in columns" :key="col.key">
          <div v-if="kanban[col.key][rowIdx]" class="relative">
            <article class="rounded-xl border overflow-hidden transition"
              :class="kanban[col.key][rowIdx].highlight
                ? 'bg-amber-50 border-amber-200'
                : 'bg-white border-slate-100 hover:shadow-md'">
              <!-- Top strip -->
              <div class="h-1 bg-blue-500"></div>

              <div class="p-3 space-y-1.5">
                <!-- Top row: id + optional category badge -->
                <div class="flex items-start justify-between gap-2">
                  <p class="text-[10px] text-slate-400">id:00 {{ kanban[col.key][rowIdx].id }}</p>
                  <div v-if="kanban[col.key][rowIdx].category" class="flex items-center gap-1.5">
                    <span class="text-[10px] text-slate-400">Kategoriya</span>
                    <span class="w-6 h-6 rounded-md flex items-center justify-center text-[12px] font-bold"
                      :class="categoryBadge(kanban[col.key][rowIdx].categoryColor)">
                      {{ kanban[col.key][rowIdx].category }}
                    </span>
                  </div>
                </div>

                <!-- Name -->
                <p class="text-[14px] font-bold text-slate-800">{{ kanban[col.key][rowIdx].name }}</p>

                <!-- Info -->
                <div class="space-y-1 text-[12px] text-slate-600">
                  <div class="flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    <span>{{ kanban[col.key][rowIdx].job }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>{{ kanban[col.key][rowIdx].phone }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{{ kanban[col.key][rowIdx].location }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    <span>{{ formatMoney(kanban[col.key][rowIdx].salary) }} so'm</span>
                  </div>
                </div>

                <!-- Footer -->
                <div class="pt-2 border-t border-slate-100">
                  <!-- Status + time -->
                  <div v-if="kanban[col.key][rowIdx].status" class="flex items-center justify-between gap-2">
                    <span class="text-[11px] font-semibold px-2 py-1 rounded-md border"
                      :class="statusBadge(kanban[col.key][rowIdx].statusType)">
                      {{ kanban[col.key][rowIdx].status }}
                    </span>
                    <div v-if="kanban[col.key][rowIdx].time" class="flex items-center gap-1 text-[11px] text-slate-500">
                      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="9" />
                        <polyline points="12 7 12 12 15 14" />
                      </svg>
                      <span>{{ kanban[col.key][rowIdx].time }}</span>
                    </div>
                    <button v-if="kanban[col.key][rowIdx].editable"
                      class="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-white">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  </div>
                  <!-- Buttons (paid column) -->
                  <div v-if="kanban[col.key][rowIdx].buttons" class="flex items-center gap-2">
                    <button
                      class="flex-1 py-1.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200">
                      Natijani bilish
                    </button>
                    <button
                      class="flex-1 py-1.5 rounded-md text-[11px] font-semibold bg-emerald-500 hover:bg-emerald-600 text-white">
                      Pullik e'lon
                    </button>
                  </div>
                </div>
              </div>
            </article>

            <!-- Hover action icons (column 2, row 2 in image) -->
            <div v-if="kanban[col.key][rowIdx].showActions"
              class="absolute top-1/2 -right-3 -translate-y-1/2 flex flex-col gap-1 bg-white rounded-lg border border-slate-200 shadow-sm p-1">
              <button class="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
              <button class="p-1.5 text-slate-500 hover:bg-slate-50 rounded">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>
