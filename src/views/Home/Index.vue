<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const userName = computed(() => userStore.user?.user_name || 'Gulsanamxon')

const today = computed(() => {
  const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']
  const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr']
  const d = new Date()
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
})

// KPI cards
const kpiCards = [
  { label: 'BUGUNGI NOMZODLAR', value: 8, sub: 'Jami: 8', iconColor: 'text-slate-400', icon: 'users' },
  { label: 'BUGUNGI VAZIFALAR', value: 1, sub: 'Jami: 11', iconColor: 'text-slate-400', icon: 'calendar' },
  { label: 'PREMIUM FAOL', value: 7, sub: 'Jami: 8', iconColor: 'text-amber-400', icon: 'star' },
  { label: '3 KUNLIK SINOV', value: 1, sub: 'Monitoring kerak', iconColor: 'text-slate-400', icon: 'clock' },
]

// Bar chart data (Yan-Iyun)
const barData = [
  { label: 'Yan', value: 11000000 },
  { label: 'Fev', value: 14500000 },
  { label: 'Mar', value: 17500000 },
  { label: 'Apr', value: 15500000 },
  { label: 'May', value: 21500000 },
  { label: 'Iyun', value: 24000000 },
]
const maxValue = 26000000
const yAxisLabels = [0, 6500000, 13000000, 19500000, 26000000].reverse()

// Monthly results
const monthlyResults = [
  { label: 'Anketalar', value: 0, highlight: false },
  { label: 'Suhbatlar', value: 0, highlight: false },
  { label: 'Qabul qilingan', value: 0, highlight: true },
  { label: 'Jami ball', value: 0, highlight: false },
]

// Donut chart — Anketa: 2, Suhbat: 2, Sinov: 1, Qabul: 2
const donut = [
  { label: 'Anketa', value: 2, color: '#3b82f6' },
  { label: 'Suhbat', value: 2, color: '#f59e0b' },
  { label: 'Sinov', value: 1, color: '#8b5cf6' },
  { label: 'Qabul', value: 2, color: '#10b981' },
]
const donutTotal = donut.reduce((s, d) => s + d.value, 0)
const donutSegments = computed(() => {
  const circumference = 2 * Math.PI * 55
  let offset = 0
  return donut.map((d) => {
    const length = (d.value / donutTotal) * circumference
    const seg = { ...d, length, offset, circumference }
    offset += length
    return seg
  })
})

// Today's tasks
const todayTasks = [
  {
    title: 'Bir kunda 100ta mijoz',
    desc: 'Biz bugun 100ta mijozni ish bilan ta\'minlashimiz kerak',
    time: '09:04',
    tag: 'Premium',
    priority: 'yuqori',
  },
]

// Recent candidates
const candidates = [
  { name: 'Alisher Umarov', age: 25, phone: '+998901234567', job: 'Dasturchi', status: 'Qabul', time: '15.11', color: 'blue' },
  { name: 'Dilnoza Karimova', age: 28, phone: '+998901234568', job: 'Buxgalter', status: 'Suhbat', time: '15.11', color: 'amber' },
  { name: 'Bobur Rahimov', age: 30, phone: '+998901234569', job: 'Menejer', status: 'Sinov', time: '15.11', color: 'purple' },
  { name: 'Malika Azimova', age: 23, phone: '+998901234570', job: 'Dizayner', status: 'Anketa', time: '15.11', color: 'sky' },
  { name: 'Sardor Toshmatov', age: 27, phone: '+998901234571', job: 'Sotuvchi', status: 'Keldi', time: '15.11', color: 'emerald' },
  { name: 'Nigora Sultonova', age: 26, phone: '+998901234572', job: 'Marketing mutaxassisi', status: 'Qabul', time: '15.11', color: 'rose' },
  { name: 'Jasur Normatov', age: 29, phone: '+998901234573', job: 'Haydovchi', status: 'Suhbat', time: '15.11', color: 'indigo' },
  { name: 'Feruza Abdullayeva', age: 24, phone: '+998901234574', job: 'HR menejer', status: 'Anketa', time: '15.11', color: 'pink' },
]

const statusBadge = (status) => {
  const map = {
    'Qabul': 'bg-emerald-50 text-emerald-600',
    'Suhbat': 'bg-amber-50 text-amber-600',
    'Sinov': 'bg-sky-50 text-sky-600',
    'Anketa': 'bg-blue-50 text-blue-600',
    'Keldi': 'bg-green-50 text-green-600',
  }
  return map[status] || 'bg-slate-50 text-slate-600'
}

const avatarBg = (color) => {
  const map = {
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
    sky: 'bg-sky-500',
    emerald: 'bg-emerald-500',
    rose: 'bg-rose-500',
    indigo: 'bg-indigo-500',
    pink: 'bg-pink-500',
  }
  return map[color] || 'bg-slate-500'
}

const formatMoney = (v) => {
  if (v >= 1000000) return (v / 1000000).toFixed(0) + 'M'
  if (v >= 1000) return (v / 1000).toFixed(0) + 'K'
  return String(v)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Welcome -->
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Xush kelibsiz, {{ userName }}</h1>
        <p class="text-sm text-slate-500 mt-1">{{ today }}</p>
      </div>
      <button
        class="w-11 h-11 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      </button>
    </div>

    <!-- KPI cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="(c, i) in kpiCards" :key="i"
        class="bg-white rounded-xl border border-slate-100 p-4 relative"
        :class="i === 0 ? 'ring-2 ring-amber-300' : ''">
        <div class="flex justify-between items-start">
          <span class="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">{{ c.label }}</span>
          <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center" :class="c.iconColor">
            <svg v-if="c.icon === 'users'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <svg v-else-if="c.icon === 'calendar'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <svg v-else-if="c.icon === 'star'" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 14" />
            </svg>
          </div>
        </div>
        <p class="text-3xl font-bold text-slate-800 mt-3">{{ c.value }}</p>
        <p class="text-[12px] text-slate-400 mt-0.5">{{ c.sub }}</p>
      </div>
    </div>

    <!-- Middle row: tasks + monthly -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Today's tasks -->
      <div class="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="flex items-center gap-2 text-[14px] font-semibold text-slate-700">
            <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 14" />
            </svg>
            Bugungi vazifalar
          </h3>
          <span class="text-[11px] text-slate-400">{{ todayTasks.length }} ta</span>
        </div>
        <div class="space-y-2">
          <div v-for="(t, i) in todayTasks" :key="i"
            class="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
            <div class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 7 12 12 15 14" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between">
                <h4 class="text-[14px] font-semibold text-slate-800">{{ t.title }}</h4>
                <span class="text-[11px] font-medium px-2 py-0.5 rounded-md bg-red-50 text-red-500">{{ t.priority }}</span>
              </div>
              <p class="text-[12px] text-slate-500 mt-0.5">{{ t.desc }}</p>
              <div class="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                <span class="flex items-center gap-1">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="9" />
                    <polyline points="12 7 12 12 15 14" />
                  </svg>
                  {{ t.time }}
                </span>
                <span class="flex items-center gap-1 text-amber-500">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
                  </svg>
                  {{ t.tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly results -->
      <div class="bg-white rounded-xl border border-slate-100 p-4">
        <h3 class="flex items-center gap-2 text-[14px] font-semibold text-slate-700 mb-3">
          <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" />
          </svg>
          Oylik natijalar
        </h3>
        <div class="space-y-2">
          <div v-for="(r, i) in monthlyResults" :key="i"
            class="flex items-center justify-between px-3 py-2.5 rounded-lg"
            :class="r.highlight ? 'bg-purple-50' : 'bg-slate-50'">
            <span class="text-[13px] text-slate-600">{{ r.label }}</span>
            <span class="text-[13px] font-bold text-blue-500">{{ r.value }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart row: bar + donut -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Bar chart -->
      <div class="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-4">
        <h3 class="flex items-center gap-2 text-[14px] font-semibold text-slate-700 mb-3">
          <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3v18h18" />
            <path d="M7 15l4-4 4 4 5-6" />
          </svg>
          Haftalik statistika
        </h3>
        <div class="flex gap-3">
          <!-- Y-axis labels -->
          <div class="flex flex-col justify-between text-[10px] text-slate-400 py-1 h-[260px]">
            <span v-for="l in yAxisLabels" :key="l">{{ formatMoney(l) }}</span>
          </div>
          <!-- Bars -->
          <div class="flex-1 flex items-end justify-around gap-2 h-[260px] border-l border-b border-slate-100 pl-2 pb-1 relative">
            <!-- Gridlines -->
            <div class="absolute inset-0 flex flex-col justify-between pl-2 pb-1 pointer-events-none">
              <div v-for="(_, i) in yAxisLabels" :key="i" class="border-t border-slate-50"></div>
            </div>
            <div v-for="b in barData" :key="b.label" class="flex flex-col items-center gap-2 flex-1 relative z-10">
              <div class="w-full max-w-[56px] bg-blue-500 rounded-sm transition-all"
                :style="{ height: (b.value / maxValue * 240) + 'px' }"></div>
              <span class="text-[11px] text-slate-500">{{ b.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Donut chart -->
      <div class="bg-white rounded-xl border border-slate-100 p-4">
        <h3 class="flex items-center gap-2 text-[14px] font-semibold text-slate-700 mb-3">
          <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a14 14 0 0 1 0 18" />
          </svg>
          Nomzodlar holati
        </h3>
        <div class="flex items-center justify-center py-3">
          <svg viewBox="0 0 150 150" class="w-[160px] h-[160px] -rotate-90">
            <circle cx="75" cy="75" r="55" fill="none" stroke="#f1f5f9" stroke-width="18" />
            <circle v-for="(s, i) in donutSegments" :key="i" cx="75" cy="75" r="55" fill="none"
              :stroke="s.color" stroke-width="18"
              :stroke-dasharray="`${s.length} ${s.circumference}`"
              :stroke-dashoffset="-s.offset" stroke-linecap="butt" />
          </svg>
        </div>
        <div class="flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
          <span v-for="d in donut" :key="d.label" class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full" :style="{ background: d.color }"></span>
            {{ d.label }}: {{ d.value }}
          </span>
        </div>
      </div>
    </div>

    <!-- Recent candidates -->
    <div class="bg-white rounded-xl border border-slate-100 p-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="flex items-center gap-2 text-[14px] font-semibold text-slate-700">
          <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          So'nggi nomzodlar
        </h3>
        <span class="text-[11px] text-slate-400">{{ candidates.length }} ta</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div v-for="(c, i) in candidates" :key="i"
          class="p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition">
          <div class="flex items-start gap-3">
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
              :class="avatarBg(c.color)">
              {{ c.name.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[13px] font-bold text-slate-800 truncate">{{ c.name }}</p>
              <p class="text-[11px] text-slate-400">{{ c.age }} yosh</p>
            </div>
          </div>
          <div class="mt-2.5 space-y-1 text-[12px] text-slate-500">
            <p class="flex items-center gap-1.5">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {{ c.phone }}
            </p>
            <p class="flex items-center gap-1.5">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              {{ c.job }}
            </p>
          </div>
          <div class="mt-2.5 flex items-center justify-between">
            <span class="text-[11px] font-semibold px-2 py-0.5 rounded-md" :class="statusBadge(c.status)">
              {{ c.status }}
            </span>
            <span class="text-[11px] text-slate-400">{{ c.time }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
