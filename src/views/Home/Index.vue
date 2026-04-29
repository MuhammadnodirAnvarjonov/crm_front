<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import statsService from '@/services/stats.service'

const userStore = useUserStore()
const userName = computed(() => userStore.user?.user_name || '—')

const today = computed(() => {
  const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']
  const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr']
  const d = new Date()
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
})

const data = ref(null)
const loading = ref(false)

const loadStats = async () => {
  loading.value = true
  try { data.value = await statsService.dashboard() }
  catch (e) { console.error(e); data.value = null }
  finally { loading.value = false }
}

const kpi = computed(() => data.value?.kpi || {})
const donutCounts = computed(() => data.value?.donut || { anketa: 0, suhbat: 0, sinov: 0, qabul: 0 })
const monthGroup = computed(() => data.value?.this_month || { anketa: 0, suhbat: 0, sinov: 0, qabul: 0 })

const kpiCards = computed(() => [
  { label: 'BUGUNGI NOMZODLAR', value: kpi.value.today_anketas || 0, sub: `Jami: ${kpi.value.total_anketas || 0}`, color: 'blue' },
  { label: 'BUGUNGI VAZIFALAR', value: kpi.value.today_tasks || 0, sub: `Jami: ${kpi.value.total_tasks || 0}`, color: 'amber' },
  { label: 'PREMIUM FAOL', value: kpi.value.premium_active || 0, sub: `Jami: ${kpi.value.total_employers || 0}`, color: 'purple' },
  { label: '3 KUNLIK SINOV', value: kpi.value.trial_anketas || 0, sub: 'Monitoring kerak', color: 'rose' },
])

// Bar chart — monthly revenue
const MONTH_NAMES = ['Yan','Fev','Mar','Apr','May','Iyun','Iyul','Avg','Sen','Okt','Noy','Dek']
const barData = computed(() => {
  const rows = data.value?.monthly_revenue || []
  return rows.map((r) => ({ label: MONTH_NAMES[r.month - 1], value: r.value }))
})
const maxBar = computed(() => Math.max(1, ...barData.value.map((b) => b.value)))
const yAxisLabels = computed(() => {
  const m = maxBar.value
  return [m, Math.round(m * 0.75), Math.round(m * 0.5), Math.round(m * 0.25), 0]
})

const formatMoney = (v) => Number(v || 0).toLocaleString('fr-FR').replace(/\s/g, ',')

// Donut
const donut = computed(() => [
  { label: 'Anketa', value: donutCounts.value.anketa || 0, color: '#3b82f6' },
  { label: 'Suhbat', value: donutCounts.value.suhbat || 0, color: '#f59e0b' },
  { label: 'Sinov',  value: donutCounts.value.sinov  || 0, color: '#8b5cf6' },
  { label: 'Qabul',  value: donutCounts.value.qabul  || 0, color: '#10b981' },
])
const donutTotal = computed(() => donut.value.reduce((s, d) => s + d.value, 0))
const donutSegments = computed(() => {
  const c = 2 * Math.PI * 55
  if (!donutTotal.value) return []
  let offset = 0
  return donut.value.map((d) => {
    const length = (d.value / donutTotal.value) * c
    const seg = { ...d, length, offset, circumference: c }
    offset += length
    return seg
  })
})

const monthlyResults = computed(() => [
  { label: 'Anketalar', value: monthGroup.value.anketa, highlight: false },
  { label: 'Suhbatlar', value: monthGroup.value.suhbat, highlight: false },
  { label: 'Qabul qilingan', value: monthGroup.value.qabul, highlight: true },
  { label: 'Sinov', value: monthGroup.value.sinov, highlight: false },
])

onMounted(loadStats)
</script>

<template>
  <div class="space-y-4">
    <!-- Welcome -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-4 sm:p-6 text-white">
      <h1 class="text-xl sm:text-2xl font-bold">Xush kelibsiz, {{ userName }}!</h1>
      <p class="text-[13px] sm:text-sm opacity-90 mt-1">{{ today }}</p>
    </div>

    <!-- KPI cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div v-for="k in kpiCards" :key="k.label" class="bg-white rounded-xl border border-slate-100 p-3">
        <p class="text-[10px] font-bold uppercase text-slate-500 tracking-wider">{{ k.label }}</p>
        <p class="text-2xl sm:text-3xl font-bold mt-1"
          :class="{ 'text-blue-600': k.color === 'blue', 'text-amber-600': k.color === 'amber', 'text-purple-600': k.color === 'purple', 'text-rose-600': k.color === 'rose' }">
          {{ k.value }}
        </p>
        <p class="text-[11px] text-slate-500 mt-1">{{ k.sub }}</p>
      </div>
    </div>

    <!-- Bar chart + donut -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <div class="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-4">
        <h3 class="text-sm font-bold text-slate-800 mb-3">Oylik daromad (oxirgi 6 oy)</h3>
        <div class="flex gap-2">
          <div class="flex flex-col justify-between text-[10px] text-slate-400 h-[180px] py-1">
            <span v-for="l in yAxisLabels" :key="l">{{ formatMoney(l) }}</span>
          </div>
          <div class="flex-1 flex items-end justify-around gap-2 h-[180px] border-l border-b border-slate-100 pl-2 pb-1">
            <div v-for="b in barData" :key="b.label" class="flex flex-col items-center gap-1 flex-1">
              <div class="w-full max-w-[40px] bg-blue-500 rounded-sm transition-all"
                :style="{ height: ((b.value / maxBar) * 160) + 'px' }"
                :title="`${b.label}: ${formatMoney(b.value)} so'm`"></div>
              <span class="text-[10px] text-slate-500">{{ b.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-100 p-4">
        <h3 class="text-sm font-bold text-slate-800 mb-3">Nomzodlar holati</h3>
        <div class="relative w-[160px] mx-auto">
          <svg viewBox="0 0 140 140" class="w-full -rotate-90">
            <circle cx="70" cy="70" r="55" fill="none" stroke="#f1f5f9" stroke-width="14" />
            <circle v-for="(s, i) in donutSegments" :key="i" cx="70" cy="70" r="55" fill="none"
              :stroke="s.color" stroke-width="14"
              :stroke-dasharray="`${s.length} ${s.circumference}`"
              :stroke-dashoffset="-s.offset" stroke-linecap="butt" />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p class="text-[10px] uppercase text-slate-400 font-semibold">Jami</p>
            <p class="text-2xl font-bold text-slate-800 leading-none">{{ donutTotal }}</p>
          </div>
        </div>
        <div class="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-600">
          <span v-for="d in donut" :key="d.label" class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: d.color }"></span>
            <span class="font-medium">{{ d.label }}:</span>
            <span class="font-semibold text-slate-800">{{ d.value }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- This month results -->
    <div class="bg-white rounded-xl border border-slate-100 p-4">
      <h3 class="text-sm font-bold text-slate-800 mb-3">Joriy oy natijalari</h3>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div v-for="m in monthlyResults" :key="m.label"
          class="rounded-lg p-3 border"
          :class="m.highlight ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-100'">
          <p class="text-[11px] text-slate-500">{{ m.label }}</p>
          <p class="text-2xl font-bold mt-1" :class="m.highlight ? 'text-emerald-600' : 'text-slate-800'">
            {{ m.value }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
