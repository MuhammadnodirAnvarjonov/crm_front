<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const topFilter = ref('Barchasi')
const subTab = ref('Barchasi')

const topFilters = ['Barchasi', 'Bepul', 'Premium A', 'Premium B', 'Premium V']

const employers = [
  {
    id: '3654899', name: 'Grand Hotel', contact: 'Jamshid Rahimov',
    phone: '+998901111113', address: "Toshkent, Navoiy ko'chasi 28",
    position: 'Ofitsiant', positionCount: 2, tier: 'Premium V',
    salary: 3500000, deadline: '25.01.2025', expired: true,
    candidates: 1, matchTotal: 2, type: 'toliq', accent: 'pink',
    status: 'Faol', statusColor: 'green', selected: true,
  },
  {
    id: '3654899', name: 'Grand Hotel', contact: 'Jamshid Rahimov',
    phone: '+998901111113', address: "Toshkent, Navoiy ko'chasi 28",
    position: 'Ofitsiant', positionCount: 2, tier: null,
    salary: null, deadline: null, expired: false,
    candidates: 1, matchTotal: 2, type: 'qisman', accent: 'orange',
    status: 'faol', statusColor: 'amber', selected: false,
  },
  {
    id: '3654899', name: 'Grand Hotel', contact: 'Jamshid Rahimov',
    phone: '+998901111113', address: "Toshkent, Navoiy ko'chasi 28",
    position: 'Ofitsiant', positionCount: 2, tier: 'Premium V',
    salary: 3500000, deadline: '25.01.2025', expired: false,
    candidates: 1, matchTotal: 2, type: 'toliq', accent: 'orange',
    status: 'faol', statusColor: 'amber', selected: false,
  },
  {
    id: '3654899', name: 'Grand Hotel', contact: 'Jamshid Rahimov',
    phone: '+998901111113', address: "Toshkent, Navoiy ko'chasi 28",
    position: 'Ofitsiant', positionCount: 2, tier: 'Premium V',
    salary: 3500000, deadline: '25.01.2025', expired: false,
    candidates: 1, matchTotal: 2, type: 'toliq', accent: 'orange',
    status: 'faol', statusColor: 'amber', selected: false,
  },
  {
    id: '3654899', name: 'Grand Hotel', contact: 'Jamshid Rahimov',
    phone: '+998901111113', address: "Toshkent, Navoiy ko'chasi 28",
    position: 'Ofitsiant', positionCount: 2, tier: 'Premium V',
    salary: 3500000, deadline: '25.01.2025', expired: false,
    candidates: 1, matchTotal: 2, type: 'toliq', accent: 'orange',
    status: 'faol', statusColor: 'amber', selected: false,
  },
  {
    id: '3654899', name: 'Grand Hotel', contact: 'Jamshid Rahimov',
    phone: '+998901111113', address: "Toshkent, Navoiy ko'chasi 28",
    position: 'Ofitsiant', positionCount: 2, tier: 'Premium V',
    salary: 3500000, deadline: '25.01.2025', expired: false,
    candidates: 1, matchTotal: 2, type: 'qisman', accent: 'orange',
    status: 'faol', statusColor: 'amber', selected: false,
  },
  {
    id: '3654899', name: 'Grand Hotel', contact: 'Jamshid Rahimov',
    phone: '+998901111113', address: "Toshkent, Navoiy ko'chasi 28",
    position: 'Ofitsiant', positionCount: 2, tier: 'Premium V',
    salary: 3500000, deadline: '25.01.2025', expired: false,
    candidates: 1, matchTotal: 2, type: 'toliq', accent: 'orange',
    status: 'faol', statusColor: 'amber', selected: false,
  },
  {
    id: '3654899', name: 'Grand Hotel', contact: 'Jamshid Rahimov',
    phone: '+998901111113', address: "Toshkent, Navoiy ko'chasi 28",
    position: 'Ofitsiant', positionCount: 2, tier: 'Premium V',
    salary: 3500000, deadline: '25.01.2025', expired: false,
    candidates: 1, matchTotal: 2, type: 'qisman', accent: 'orange',
    status: 'faol', statusColor: 'amber', selected: false,
  },
]

const counts = computed(() => ({
  all: employers.length,
  qisman: employers.filter((e) => e.type === 'qisman').length,
  toliq: employers.filter((e) => e.type === 'toliq').length,
}))

const subTabList = computed(() => [
  { name: 'Barchasi', count: counts.value.all },
  { name: 'Qisman', count: counts.value.qisman },
  { name: "To'liq", count: counts.value.toliq },
])

const filteredEmployers = computed(() => {
  let list = employers
  if (subTab.value === 'Qisman') list = list.filter((e) => e.type === 'qisman')
  if (subTab.value === "To'liq") list = list.filter((e) => e.type === 'toliq')
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((e) => e.name.toLowerCase().includes(q) || e.phone.includes(q))
  }
  return list
})

const formatMoney = (v) => (v ? v.toLocaleString('fr-FR').replace(/\s/g, ',') : null)

const accentBar = (a) => (a === 'pink' ? 'bg-pink-500' : 'bg-orange-400')
const accentRing = (a) => (a === 'pink' ? 'ring-2 ring-pink-400' : '')

const statusBadge = (color) => {
  if (color === 'green') return 'bg-emerald-100 text-emerald-700 border border-emerald-200'
  return 'bg-amber-100 text-amber-700 border border-amber-200'
}
</script>

<template>
  <div class="space-y-4">
    <!-- Title + actions -->
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Ish beruvchilar</h1>
        <p class="text-sm text-slate-500 mt-1">Kompaniyalar va ish beruvchilarni boshqarish</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-semibold shadow-sm">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Qisman anketa
        </button>
        <button class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold shadow-sm">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          To'liq anketa
        </button>
      </div>
    </div>

    <!-- Search + top filter tabs -->
    <div class="bg-white rounded-xl border border-slate-100 p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <div class="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
        <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input v-model="searchQuery" placeholder="Kompaniya nomi yoki telefon raqamini qidiring..."
          class="flex-1 bg-transparent text-[13px] placeholder-slate-400 focus:outline-none" />
      </div>
      <div class="flex items-center gap-1 bg-slate-50 rounded-lg p-1 flex-wrap">
        <button v-for="tab in topFilters" :key="tab" @click="topFilter = tab"
          class="px-3 py-1.5 rounded-md text-[12px] font-medium transition"
          :class="topFilter === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
          {{ tab }}
        </button>
      </div>
    </div>

    <!-- Sub-tabs: Barchasi / Qisman / To'liq -->
    <div class="bg-slate-100 rounded-lg p-1 grid grid-cols-3 gap-1">
      <button v-for="tab in subTabList" :key="tab.name" @click="subTab = tab.name"
        class="py-2 rounded-md text-[13px] font-semibold transition"
        :class="subTab === tab.name ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
        {{ tab.name }} ({{ tab.count }})
      </button>
    </div>

    <!-- Employer cards grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <div v-for="(e, i) in filteredEmployers" :key="i"
        class="bg-white rounded-xl border border-slate-100 overflow-hidden transition hover:shadow-md"
        :class="accentRing(e.accent)">
        <!-- Accent bar -->
        <div class="h-1.5" :class="accentBar(e.accent)"></div>

        <div class="p-3 space-y-2">
          <!-- ID -->
          <p class="text-[10px] text-slate-400">id:0 {{ e.id }}</p>

          <!-- Avatar + Name + Status + actions -->
          <div class="flex items-start gap-2">
            <div class="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">
              {{ e.name.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[14px] font-bold text-slate-800 truncate">{{ e.name }}</p>
              <p class="text-[11px] text-slate-500 truncate">{{ e.contact }}</p>
            </div>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0" :class="statusBadge(e.statusColor)">
              {{ e.status }}
            </span>
          </div>

          <!-- Action icons row -->
          <div class="flex items-center justify-end gap-1.5 -mt-1">
            <button class="p-1 text-blue-500 hover:bg-blue-50 rounded">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
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

          <!-- Info rows -->
          <div class="space-y-1.5 text-[12px] text-slate-700">
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
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                <span>{{ e.position }} - {{ e.positionCount }} ta</span>
              </div>
              <div v-if="e.tier" class="flex flex-col items-end gap-1">
                <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                  {{ e.tier }}
                </span>
                <button class="w-5 h-5 rounded border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                    stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            </div>
            <div v-if="e.salary" class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span>{{ formatMoney(e.salary) }} so'm</span>
            </div>
            <div v-if="e.deadline" class="flex items-center justify-between">
              <div class="flex items-center gap-1.5" :class="e.expired ? 'text-rose-500' : ''">
                <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <span>Muddat: {{ e.deadline }}</span>
              </div>
              <button v-if="e.expired"
                class="px-2.5 py-1 rounded-md text-[11px] font-semibold text-rose-500 bg-rose-50 border border-rose-200 hover:bg-rose-100">
                Muddati o'tgan
              </button>
              <button v-else
                class="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-600 border border-slate-200 hover:bg-slate-50">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Ko'rish
              </button>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="h-1 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full bg-emerald-400 rounded-full" style="width: 60%"></div>
          </div>

          <!-- Footer: Mos nomzodlar -->
          <div class="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              <span>Mos nomzodlar</span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                {{ e.candidates }}
              </span>
            </div>
            <span class="text-slate-400">{{ e.candidates }}/{{ e.matchTotal }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
