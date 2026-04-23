<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const statCards = [
  { label: "Qo'ng'iroqlar", today: 9, total: 16, icon: 'clock', iconBg: 'bg-orange-50', iconColor: 'text-orange-500' },
  { label: 'Anketalar', today: 9, total: 16, icon: 'doc', iconBg: 'bg-slate-50', iconColor: 'text-slate-500' },
  { label: "Bepul e'lon", today: 9, total: 16, icon: 'bot', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
  { label: "Pullik e'lon", today: 9, total: 16, icon: 'dollar', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
  { label: 'Shartnomalar', today: 9, total: 16, icon: 'crown', iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
  { label: 'Agent', today: 9, total: 16, icon: 'building', iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
]

const dateFilter = ref('')
const employerFilter = ref('')
const employerOpen = ref(false)
const searchQuery = ref('')
const categoryFilter = ref('Barchasi')

const employerOptions = [
  'Aziz Rahmonov',
  "Jahongir Ortiqxo'jayev",
  'Shaxboz Sultunov',
  'Aziz Rahmonov',
  'Shaxboz Sultunov',
  "Jahongir Ortiqxo'jayev",
]

const employerDropdownRef = ref(null)
const onDocClick = (e) => {
  if (employerDropdownRef.value && !employerDropdownRef.value.contains(e.target)) {
    employerOpen.value = false
  }
}
onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))

const selectEmployer = (name) => {
  employerFilter.value = name
  employerOpen.value = false
}

// Cards — 8 total
const basePositions = [
  [
    { role: 'Ofitsiant', count: 2 },
    { role: 'Bugalter', count: 1 },
  ],
  [
    { role: 'Dasturchi', count: 2 },
    { role: 'Farrosh', count: 3 },
  ],
  [
    { role: 'Dizayner', count: 1 },
    { role: 'Chuchvarachi', count: 3 },
  ],
]

const progressSegments = [
  { value: 22, color: '#22c55e', label: 'Yuborildi' },
  { value: 18, color: '#16a34a', label: "Tasdiqlandi" },
  { value: 16, color: '#eab308', label: 'Suhbat' },
  { value: 12, color: '#f97316', label: 'Sinov' },
  { value: 10, color: '#3b82f6', label: 'Anketa' },
  { value: 12, color: '#8b5cf6', label: 'Qabul qilindi' },
  { value: 10, color: '#ef4444', label: "Rad etildi" },
]

const baseCard = {
  id: '7897897', company: 'Grand Hotel', contact: 'Jamshid Rahimov',
  phone: '+998901111113', address: "Toshkent, Navoiy ko'chasi 28",
  positions: basePositions,
  startDate: '15.01.2025', deadline: '25.01.2025',
  candidates: 12,
}

const employers = ref(Array.from({ length: 8 }, () => ({ ...baseCard })))

const filtered = computed(() => {
  let list = employers.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((e) => e.company.toLowerCase().includes(q) || e.phone.includes(q))
  }
  return list
})
</script>

<template>
  <div class="space-y-4">
    <!-- Top stat bar -->
    <div class="flex flex-col sm:flex-row items-stretch gap-3">
      <button
        class="h-14 sm:h-auto w-full sm:w-[72px] shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md">
        <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      </button>

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

    <!-- Filter panel: 2 dropdowns on left + search + dropdown right -->
    <div class="bg-white rounded-xl border border-slate-100 p-3 grid grid-cols-1 lg:grid-cols-[200px_1fr_160px] gap-3">
      <!-- Left: two stacked dropdowns -->
      <div class="space-y-2">
        <div class="relative">
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

        <!-- Ish beruvchilar custom dropdown -->
        <div ref="employerDropdownRef" class="relative">
          <button @click.stop="employerOpen = !employerOpen"
            class="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-700 text-left focus:outline-none focus:border-blue-400">
            <svg class="absolute top-1/2 left-3 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            {{ employerFilter || 'Ish beruvchilar' }}
            <svg class="absolute top-1/2 right-3 -translate-y-1/2 w-3 h-3 text-slate-400" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <div v-if="employerOpen"
            class="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 max-h-64 overflow-y-auto">
            <button v-for="(name, i) in employerOptions" :key="i" @click="selectEmployer(name)"
              class="w-full text-left px-3 py-2 text-[13px] text-slate-700 hover:bg-blue-50 hover:text-blue-600">
              {{ name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Middle: search -->
      <div class="relative">
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

      <!-- Right: category -->
      <div class="relative">
        <select v-model="categoryFilter"
          class="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-700 appearance-none focus:outline-none focus:border-blue-400">
          <option>Barchasi</option>
          <option>Premium A</option>
          <option>Premium B</option>
          <option>Premium V</option>
        </select>
        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Cards grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <div v-for="(e, i) in filtered" :key="i"
        class="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition">
        <!-- Gradient orange top strip -->
        <div class="h-1.5" style="background: linear-gradient(90deg, #fb923c, #f97316)"></div>

        <div class="p-3 space-y-2">
          <!-- Top: avatar + name + id -->
          <div class="flex items-start gap-2">
            <div
              class="w-10 h-10 rounded-full bg-amber-400 text-white flex items-center justify-center font-bold shrink-0">
              {{ e.company.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[14px] font-bold text-slate-800 truncate">{{ e.company }}</p>
              <p class="text-[11px] text-slate-500 truncate">{{ e.contact }}</p>
            </div>
            <p class="text-[10px] text-slate-400 whitespace-nowrap mt-1">id:0000 {{ e.id }}</p>
          </div>

          <!-- Action icons -->
          <div class="flex items-center justify-end gap-1.5 -mt-1">
            <button class="p-1 text-slate-500 hover:bg-slate-50 rounded">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </button>
            <button class="p-1 text-slate-500 hover:bg-slate-50 rounded">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>

          <!-- Phone + location -->
          <div class="space-y-1 text-[12px] text-slate-700">
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>{{ e.phone }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span class="truncate">{{ e.address }}</span>
            </div>
          </div>

          <!-- Positions grid (2 columns × 3 rows) -->
          <div class="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px] text-slate-700">
            <template v-for="(row, ri) in e.positions">
              <div v-for="(p, pi) in row" :key="`${ri}-${pi}`" class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                <span>{{ p.role }} - {{ p.count }} ta</span>
              </div>
            </template>
          </div>

          <!-- Dates row -->
          <div class="grid grid-cols-2 gap-3 text-[12px] text-slate-700 pt-1">
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span>Sana: {{ e.startDate }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span>Muddat: {{ e.deadline }}</span>
            </div>
          </div>

          <!-- Progress bar with mini labels -->
          <div class="pt-1">
            <div class="flex h-1.5 rounded-full overflow-hidden bg-slate-100">
              <div v-for="(seg, si) in progressSegments" :key="si"
                :style="{ width: seg.value + '%', background: seg.color }"></div>
            </div>
            <div class="flex text-[7px] text-slate-400 mt-0.5 leading-tight">
              <div v-for="(seg, si) in progressSegments" :key="si"
                :style="{ width: seg.value + '%' }" class="text-center truncate px-0.5">
                {{ seg.label }}
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              <span>Mos nomzodlar</span>
              <span
                class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                {{ e.candidates }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
