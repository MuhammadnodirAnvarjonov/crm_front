<script setup>
import { ref, computed } from 'vue'

// Bar chart data (Yan-Iyun)
const barData = [
  { label: 'Yan', value: 1300 },
  { label: 'Fev', value: 1400 },
  { label: 'Mar', value: 1750 },
  { label: 'Apr', value: 1650 },
  { label: 'May', value: 2200 },
  { label: 'Iyun', value: 2600 },
]
const maxValue = 2600
const yAxisLabels = [0, 650, 1300, 1950, 2600].reverse()

// Donut chart
const donut = [
  { label: 'Anketa', value: 2, color: '#3b82f6' },
  { label: 'Suhbat', value: 2, color: '#f59e0b' },
  { label: 'Sinov', value: 1, color: '#8b5cf6' },
  { label: 'Qabul', value: 2, color: '#10b981' },
]
const donutTotal = donut.reduce((s, d) => s + d.value, 0)
const donutSegments = computed(() => {
  const circumference = 2 * Math.PI * 48
  let offset = 0
  return donut.map((d) => {
    const length = (d.value / donutTotal) * circumference
    const seg = { ...d, length, offset, circumference }
    offset += length
    return seg
  })
})

// Filter tabs
const filterTabs = ['Barchasi', 'Anketa', 'Suhbat', 'Sinov', 'Qabul']
const activeFilter = ref('Barchasi')
const searchQuery = ref('')

// Candidates data
const allCandidates = [
  {
    id: '3654899', name: 'Alisher Umarov', age: 28, stars: 3, blacklist: true,
    phone: '+998901234567', job: 'Buxgalter', location: 'Toshkent, Chilonzor',
    status: 'Qabul qilindi', statusType: 'qabul', amount: 8000000, suhbat: null, sinov: false,
  },
  {
    id: '3654899', name: 'Dilnoza Karimova', age: 28, stars: 3,
    phone: '+998901234568', job: 'Buxgalter', location: 'Toshkent, Chilonzor',
    status: 'Suhbatga belgilandi', statusType: 'suhbat', amount: 6000000, suhbat: '20.01.2025 10:00',
  },
  {
    id: '3654899', name: 'Bobur Rahimov', age: 30, stars: 3,
    phone: '+998901234569', job: 'Menejer', location: "Toshkent, Mirzo Ulug'bek",
    status: '3 kunlik sinov', statusType: 'sinov', amount: 10000000, sinov: true,
  },
  {
    id: '3654899', name: 'Jasur Normatov', age: 29, stars: 2,
    phone: '+998901234573', job: 'Haydovchi', location: 'Toshkent, Bektemir',
    status: 'Suhbatga belgilandi', statusType: 'suhbat', amount: 5500000, suhbat: '21.01.2025 09:00',
  },
  {
    id: '3654899', name: 'Malika Azimova', age: 23, stars: 1,
    phone: '+998901234570', job: 'Dizayner', location: 'Toshkent, Sergeli',
    status: 'Anketa olindi', statusType: 'anketa', amount: 5000000,
  },
  {
    id: '3654899', name: 'Sardor Toshmatov', age: 27, stars: 3,
    phone: '+998901234571', job: 'Sotuvchi', location: 'Toshkent, Yakkasaroy',
    status: 'Suhbatga bordi', statusType: 'suhbat-done', amount: 4500000, suhbat: '18.01.2025 14:00',
  },
  {
    id: '3654899', name: 'Nigora Sultonova', age: 26, stars: 3,
    phone: '+998901234572', job: 'Marketing mutaxassisi', location: 'Toshkent, Olmazor',
    status: 'Qabul qilindi', statusType: 'qabul', amount: 7000000,
  },
  {
    id: '3654899', name: 'Feruza Abdullayeva', age: 24, stars: 3,
    phone: '+998901234574', job: 'HR menejer', location: 'Toshkent, Shayxontohur',
    status: 'Anketa olindi', statusType: 'anketa', amount: 6500000,
  },
]

const filteredCandidates = computed(() => {
  let list = allCandidates
  if (activeFilter.value !== 'Barchasi') {
    const map = {
      'Anketa': 'anketa',
      'Suhbat': ['suhbat', 'suhbat-done'],
      'Sinov': 'sinov',
      'Qabul': 'qabul',
    }
    const match = map[activeFilter.value]
    list = list.filter((c) => Array.isArray(match) ? match.includes(c.statusType) : c.statusType === match)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((c) =>
      c.name.toLowerCase().includes(q) || c.phone.includes(q),
    )
  }
  return list
})

const statusBadge = (type) => {
  const map = {
    qabul: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    suhbat: 'bg-amber-50 text-amber-600 border-amber-200',
    'suhbat-done': 'bg-emerald-50 text-emerald-600 border-emerald-200',
    sinov: 'bg-purple-50 text-purple-600 border-purple-200',
    anketa: 'bg-blue-50 text-blue-600 border-blue-200',
  }
  return map[type] || 'bg-slate-50 text-slate-600 border-slate-200'
}

const formatMoney = (v) => v.toLocaleString('fr-FR').replace(/\s/g, ',')

// Right-side summary cards
const summaryCards = [
  { label: 'Anketalar', value: 0, color: 'bg-blue-500' },
  { label: 'Suhbatlar', value: 0, color: 'bg-emerald-500' },
  { label: 'Qabul qilinganlar', value: 0, color: 'bg-amber-500' },
]
</script>

<template>
  <div class="flex flex-col xl:flex-row gap-4">
    <!-- Left content -->
    <div class="flex-1 min-w-0 space-y-4">
      <!-- Top: Title + Bar chart -->
      <div class="bg-white rounded-xl border border-slate-100 p-4">
        <div class="flex items-start gap-6">
          <!-- Title -->
          <div class="shrink-0">
            <h1 class="text-2xl font-bold text-slate-800">Nomzodlar statistikasi</h1>
            <p class="text-sm text-slate-500 mt-1">Barcha nomzodlarni boshqarish</p>
          </div>

          <!-- Bar chart -->
          <div class="flex-1 min-w-0">
            <p class="text-[13px] text-slate-600 mb-2">Anketalar soni</p>
            <div class="flex gap-2">
              <div class="flex flex-col justify-between text-[10px] text-slate-400 h-[150px] py-1">
                <span v-for="l in yAxisLabels" :key="l">{{ l }}</span>
              </div>
              <div class="flex-1 flex items-end justify-around gap-1.5 h-[150px] border-l border-b border-slate-100 pl-2 pb-1">
                <div v-for="b in barData" :key="b.label" class="flex flex-col items-center gap-1 flex-1">
                  <div class="w-full max-w-[40px] bg-blue-500 rounded-sm"
                    :style="{ height: (b.value / maxValue * 130) + 'px' }"></div>
                  <span class="text-[10px] text-slate-500">{{ b.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search + filter tabs -->
      <div class="bg-white rounded-xl border border-slate-100 p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div class="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
          <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input v-model="searchQuery" placeholder="Nomzod ismi yoki telefon raqamini qidiring..."
            class="flex-1 bg-transparent text-[13px] placeholder-slate-400 focus:outline-none" />
        </div>
        <div class="flex items-center gap-1 bg-slate-50 rounded-lg p-1">
          <button v-for="tab in filterTabs" :key="tab" @click="activeFilter = tab"
            class="px-3 py-1.5 rounded-md text-[12px] font-medium transition"
            :class="activeFilter === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
            {{ tab }}
          </button>
        </div>
      </div>

      <!-- Candidates grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <div v-for="(c, i) in filteredCandidates" :key="i"
          class="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition">
          <!-- Blue top strip -->
          <div class="h-1 bg-blue-500"></div>

          <div class="p-3 space-y-2">
            <!-- ID -->
            <p class="text-[10px] text-slate-400">id:0 {{ c.id }}</p>

            <!-- Avatar + Name + Blacklist -->
            <div class="flex items-start gap-2.5">
              <div class="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0">
                {{ c.name.charAt(0) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <p class="text-[13px] font-bold text-slate-800 truncate">{{ c.name }}</p>
                  <span v-if="c.blacklist"
                    class="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-red-500 text-white">
                    <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    Qora ro'yxat
                  </span>
                </div>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="text-[11px] text-slate-500">{{ c.age }} yosh</span>
                  <div class="flex gap-0.5">
                    <svg v-for="n in 3" :key="n" class="w-3 h-3"
                      :class="n <= c.stars ? 'text-amber-400' : 'text-slate-200'"
                      viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Info rows -->
            <div class="space-y-1 text-[12px] text-slate-600">
              <div class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>{{ c.phone }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                <span>{{ c.job }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span class="truncate">{{ c.location }}</span>
              </div>
              <div v-if="c.suhbat" class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <span>Suhbat: {{ c.suhbat }}</span>
              </div>
              <div v-if="c.sinov">
                <span class="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                  3 kunlik sinov
                </span>
              </div>
            </div>

            <!-- Footer: status + amount -->
            <div class="flex items-center justify-between pt-2 border-t border-slate-100">
              <span class="text-[11px] font-semibold px-2 py-1 rounded-md border" :class="statusBadge(c.statusType)">
                {{ c.status }}
              </span>
              <span class="text-[13px] font-bold text-slate-800">{{ formatMoney(c.amount) }} so'm</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: donut + summary cards (mobilda tepada, xl dan boshlab yon tarafda) -->
    <div class="order-first xl:order-last flex flex-col sm:flex-row xl:flex-col gap-3 w-full xl:w-[140px] shrink-0">
      <!-- Donut -->
      <div class="bg-white rounded-xl border border-slate-100 p-3 relative">
        <svg viewBox="0 0 130 130" class="w-full -rotate-90">
          <circle cx="65" cy="65" r="48" fill="none" stroke="#f1f5f9" stroke-width="14" />
          <circle v-for="(s, i) in donutSegments" :key="i" cx="65" cy="65" r="48" fill="none"
            :stroke="s.color" stroke-width="14"
            :stroke-dasharray="`${s.length} ${s.circumference}`"
            :stroke-dashoffset="-s.offset" stroke-linecap="butt" />
        </svg>
        <!-- Tooltip -->
        <div class="absolute top-3 right-1 bg-white border border-slate-200 rounded-md px-2 py-1 shadow-sm">
          <p class="text-[11px] font-semibold text-slate-700">Anketa: 2</p>
        </div>
        <!-- Legend -->
        <div class="mt-3 grid grid-cols-2 gap-x-1 gap-y-1 text-[10px] text-slate-600">
          <span v-for="d in donut" :key="d.label" class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: d.color }"></span>
            {{ d.label }}: {{ d.value }}
          </span>
        </div>
      </div>

      <!-- Summary stat cards -->
      <div v-for="card in summaryCards" :key="card.label"
        class="rounded-xl p-3 text-white shadow-sm flex-1" :class="card.color">
        <p class="text-[12px] font-medium opacity-90">{{ card.label }}</p>
        <div class="flex items-end justify-between mt-2">
          <p class="text-3xl font-bold">{{ card.value }}</p>
          <svg class="w-5 h-5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>
        <p class="text-[11px] opacity-80 mt-0.5">Bu oyda</p>
      </div>
    </div>
  </div>
</template>
