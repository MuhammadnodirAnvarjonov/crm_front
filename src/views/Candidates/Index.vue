<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseSelect from '@/components/form/BaseSelect.vue'
import anketaService from '@/services/anketa.service'
import anketaTypesService from '@/services/anketaTypes.service'
import jobTypesService from '@/services/jobTypes.service'
import regionsService from '@/services/regions.service'

const { locale } = useI18n()

const candidates = ref([])
const loading = ref(false)

const anketaTypes = ref([])
const jobTypes = ref([])
const regions = ref([])

// Filterlar
const searchQuery = ref('')
const dateFilter = ref('')
const activeFilter = ref('Barchasi')
const anketaTypeFilter = ref(null)
const jobTypeFilter = ref(null)
const regionFilter = ref(null)
const districtFilter = ref(null)
const genderFilter = ref(null)

const STATUS_GROUPS = {
  anketa: ['anketa_olindi'],
  suhbat: ['suhbatga_belgilandi', 'suhbatga_bordi', 'suhbatga_bormadi'],
  sinov: ['3_kunlik_sinov'],
  qabul: ['qabul_qilindi'],
}

const STATUS_LABELS = {
  anketa_olindi: { label: 'Anketa olindi', type: 'anketa' },
  suhbatga_belgilandi: { label: 'Suhbatga belgilandi', type: 'suhbat' },
  suhbatga_bordi: { label: 'Suhbatga bordi', type: 'suhbat-done' },
  suhbatga_bormadi: { label: 'Suhbatga bormadi', type: 'searching' },
  '3_kunlik_sinov': { label: '3 kunlik sinov', type: 'sinov' },
  qabul_qilindi: { label: 'Qabul qilindi', type: 'qabul' },
  rad_etildi: { label: 'Rad etildi', type: 'searching' },
}

const filterTabs = ['Barchasi', 'Anketa', 'Suhbat', 'Sinov', 'Qabul']

const dateFilterOptions = [
  { value: '', name: 'Barcha vaqt' },
  { value: 'today', name: 'Bugun' },
  { value: 'week', name: 'Shu hafta' },
  { value: 'month', name: 'Shu oy' },
]

const genderOptions = [
  { value: 'male', name: 'Erkak' },
  { value: 'female', name: 'Ayol' },
]

const nameByLocale = (obj) => {
  if (!obj) return ''
  const lang = locale.value
  return (lang === 'ru' ? obj.name_ru : lang === 'uzk' ? obj.name_uzk : obj.name_uz) || obj.name_uz || ''
}

const anketaTypeOptions = computed(() => anketaTypes.value.map((t) => ({ id: t.id, name: nameByLocale(t) })))
const jobTypeOptions = computed(() => jobTypes.value.map((t) => ({ id: t.id, name: nameByLocale(t) })))
const regionOptions = computed(() => regions.value.map((r) => ({ id: r.id, name: nameByLocale(r) })))
const districtOptions = computed(() => {
  if (!regionFilter.value) return []
  const r = regions.value.find((x) => x.id === regionFilter.value)
  return (r?.districts || []).map((d) => ({ id: d.id, name: nameByLocale(d) }))
})

watch(regionFilter, () => { districtFilter.value = null })

const dateRangeMs = (key) => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (key === 'today') return [start.getTime(), start.getTime() + 86400000]
  if (key === 'week') {
    const day = start.getDay() || 7
    const monday = new Date(start)
    monday.setDate(start.getDate() - (day - 1))
    const nextMonday = new Date(monday)
    nextMonday.setDate(monday.getDate() + 7)
    return [monday.getTime(), nextMonday.getTime()]
  }
  if (key === 'month') {
    const first = new Date(now.getFullYear(), now.getMonth(), 1)
    const nextFirst = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return [first.getTime(), nextFirst.getTime()]
  }
  return null
}

const formatDate = (d) => {
  if (!d) return ''
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

// Backenddagi anketani UI shakliga keltirish
const view = computed(() => {
  return candidates.value.map((c) => {
    const fullName = [c.surname, c.name, c.middle_name].filter(Boolean).join(' ') || c.name || '—'
    const status = STATUS_LABELS[c.anketa_status] || { label: c.anketa_status || '—', type: 'anketa' }
    let group = 'other'
    for (const [g, list] of Object.entries(STATUS_GROUPS)) {
      if (list.includes(c.anketa_status)) { group = g; break }
    }
    const region = nameByLocale(c.region)
    const district = nameByLocale(c.district)
    const location = [region, district].filter(Boolean).join(', ')
    return {
      id: c.id,
      raw: c,
      displayId: String(c.id).padStart(7, '0'),
      name: fullName,
      age: c.age ?? '',
      stars: 3,
      blacklist: false,
      phone: c.phone_number || '',
      job: nameByLocale(c.job_type) || '—',
      location: location || '—',
      status: status.label,
      statusType: status.type,
      statusGroup: group,
      amount: Number(c.expected_salary || 0),
      suhbat: c.interview_datetime ? formatDate(c.interview_datetime) : null,
      sinov: c.anketa_status === '3_kunlik_sinov',
      anketaTypeId: c.anketa_type_id || null,
      jobTypeId: c.job_type_id || null,
      regionId: c.region_id || null,
      districtId: c.district_id || null,
      gender: c.gender || null,
      createdAtMs: c.createdAt ? new Date(c.createdAt).getTime() : 0,
    }
  })
})

const filteredCandidates = computed(() => {
  let list = view.value

  if (activeFilter.value !== 'Barchasi') {
    const map = { Anketa: 'anketa', Suhbat: 'suhbat', Sinov: 'sinov', Qabul: 'qabul' }
    const target = map[activeFilter.value]
    list = list.filter((c) => c.statusGroup === target)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q))
  }
  if (anketaTypeFilter.value) list = list.filter((c) => c.anketaTypeId === anketaTypeFilter.value)
  if (jobTypeFilter.value) list = list.filter((c) => c.jobTypeId === jobTypeFilter.value)
  if (regionFilter.value) list = list.filter((c) => c.regionId === regionFilter.value)
  if (districtFilter.value) list = list.filter((c) => c.districtId === districtFilter.value)
  if (genderFilter.value) list = list.filter((c) => c.gender === genderFilter.value)

  const range = dateRangeMs(dateFilter.value)
  if (range) {
    const [from, to] = range
    list = list.filter((c) => c.createdAtMs >= from && c.createdAtMs < to)
  }

  return list
})

const resetFilters = () => {
  searchQuery.value = ''
  dateFilter.value = ''
  activeFilter.value = 'Barchasi'
  anketaTypeFilter.value = null
  jobTypeFilter.value = null
  regionFilter.value = null
  districtFilter.value = null
  genderFilter.value = null
}

// Statistika — filterlangan anketalar bo'yicha
const groupCounts = computed(() => {
  const counts = { anketa: 0, suhbat: 0, sinov: 0, qabul: 0, other: 0 }
  for (const c of filteredCandidates.value) counts[c.statusGroup] = (counts[c.statusGroup] || 0) + 1
  return counts
})

const donut = computed(() => [
  { label: 'Anketa', value: groupCounts.value.anketa, color: '#3b82f6' },
  { label: 'Suhbat', value: groupCounts.value.suhbat, color: '#f59e0b' },
  { label: 'Sinov',  value: groupCounts.value.sinov,  color: '#8b5cf6' },
  { label: 'Qabul',  value: groupCounts.value.qabul,  color: '#10b981' },
])
const donutTotal = computed(() => donut.value.reduce((s, d) => s + d.value, 0))
const donutSegments = computed(() => {
  const circumference = 2 * Math.PI * 48
  if (donutTotal.value === 0) return []
  let offset = 0
  return donut.value.map((d) => {
    const length = (d.value / donutTotal.value) * circumference
    const seg = { ...d, length, offset, circumference }
    offset += length
    return seg
  })
})

// Bar chart — oxirgi 6 oy bo'yicha anketalar soni (filterlangan ro'yxatdan)
const MONTH_NAMES_UZ = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
const barData = computed(() => {
  const now = new Date()
  const buckets = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    buckets.push({
      label: MONTH_NAMES_UZ[d.getMonth()],
      from: d.getTime(),
      to: next.getTime(),
      value: 0,
    })
  }
  for (const c of filteredCandidates.value) {
    for (const b of buckets) {
      if (c.createdAtMs >= b.from && c.createdAtMs < b.to) { b.value++; break }
    }
  }
  return buckets
})
const maxBar = computed(() => Math.max(1, ...barData.value.map((b) => b.value)))
const yAxisLabels = computed(() => {
  const m = maxBar.value
  return [m, Math.round((m * 3) / 4), Math.round(m / 2), Math.round(m / 4), 0]
})

const summaryCards = computed(() => [
  { label: 'Anketalar', value: groupCounts.value.anketa, color: 'bg-blue-500' },
  { label: 'Suhbatlar', value: groupCounts.value.suhbat, color: 'bg-emerald-500' },
  { label: 'Qabul qilinganlar', value: groupCounts.value.qabul, color: 'bg-amber-500' },
])

const statusBadge = (type) => {
  const map = {
    qabul: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    suhbat: 'bg-amber-50 text-amber-600 border-amber-200',
    'suhbat-done': 'bg-emerald-50 text-emerald-600 border-emerald-200',
    sinov: 'bg-purple-50 text-purple-600 border-purple-200',
    anketa: 'bg-blue-50 text-blue-600 border-blue-200',
    searching: 'bg-rose-50 text-rose-600 border-rose-200',
  }
  return map[type] || 'bg-slate-50 text-slate-600 border-slate-200'
}

const formatMoney = (v) => {
  if (!v) return '0'
  return Number(v).toLocaleString('fr-FR').replace(/\s/g, ',')
}

const loadAnketas = async () => {
  loading.value = true
  try {
    const data = await anketaService.all()
    candidates.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Anketa load error', e)
    candidates.value = []
  } finally {
    loading.value = false
  }
}

const loadLookups = async () => {
  try {
    const [at, jt, rg] = await Promise.all([
      anketaTypesService.all(),
      jobTypesService.all(),
      regionsService.all({}),
    ])
    anketaTypes.value = at || []
    jobTypes.value = jt || []
    regions.value = rg || []
  } catch (e) {
    console.error('Lookup load error', e)
  }
}

onMounted(() => {
  loadLookups()
  loadAnketas()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Top stats strip: title + bar chart + donut + summary cards -->
    <div class="bg-white rounded-xl border border-slate-100 p-3 sm:p-4">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        <!-- Title -->
        <div class="lg:col-span-2">
          <h1 class="text-lg sm:text-xl font-bold text-slate-800 leading-tight">Nomzodlar statistikasi</h1>
          <p class="text-xs text-slate-500 mt-1">Barcha nomzodlarni boshqarish</p>
          <p class="text-[11px] text-slate-400 mt-1">
            Jami: <span class="font-semibold text-slate-700">{{ filteredCandidates.length }}</span>
          </p>
        </div>

        <!-- Bar chart -->
        <div class="lg:col-span-5">
          <p class="text-[11px] text-slate-500 mb-1">Anketalar soni (oxirgi 6 oy)</p>
          <div class="flex gap-2">
            <div class="flex flex-col justify-between text-[9px] text-slate-400 h-[90px] py-1">
              <span v-for="l in yAxisLabels" :key="l">{{ l }}</span>
            </div>
            <div class="flex-1 flex items-end justify-around gap-1.5 h-[90px] border-l border-b border-slate-100 pl-2 pb-1">
              <div v-for="b in barData" :key="b.label" class="flex flex-col items-center gap-1 flex-1">
                <div class="w-full max-w-[28px] bg-blue-500 rounded-sm transition-all"
                  :style="{ height: ((b.value / maxBar) * 75) + 'px' }"
                  :title="`${b.label}: ${b.value}`"></div>
                <span class="text-[9px] text-slate-500">{{ b.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Donut -->
        <div class="lg:col-span-2 flex items-center gap-3">
          <div class="relative w-[90px] h-[90px] shrink-0">
            <svg viewBox="0 0 130 130" class="w-full -rotate-90">
              <circle cx="65" cy="65" r="48" fill="none" stroke="#f1f5f9" stroke-width="14" />
              <circle v-for="(s, i) in donutSegments" :key="i" cx="65" cy="65" r="48" fill="none"
                :stroke="s.color" stroke-width="14"
                :stroke-dasharray="`${s.length} ${s.circumference}`"
                :stroke-dashoffset="-s.offset" stroke-linecap="butt" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p class="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Jami</p>
              <p class="text-lg font-bold text-slate-800 leading-none">{{ donutTotal }}</p>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-y-0.5 text-[10px] text-slate-600 min-w-0">
            <span v-for="d in donut" :key="d.label" class="flex items-center gap-1 whitespace-nowrap">
              <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: d.color }"></span>
              <span class="font-medium">{{ d.label }}:</span>
              <span class="font-semibold text-slate-800">{{ d.value }}</span>
            </span>
          </div>
        </div>

        <!-- 3 summary cards -->
        <div class="lg:col-span-3 grid grid-cols-3 gap-2">
          <div v-for="card in summaryCards" :key="card.label"
            class="rounded-lg p-2.5 text-white shadow-sm" :class="card.color">
            <p class="text-[10px] font-semibold opacity-95 leading-tight truncate">{{ card.label }}</p>
            <p class="text-xl font-bold leading-none mt-1.5">{{ card.value }}</p>
            <p class="text-[9px] opacity-80 mt-1">Filtrlangan</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
      <div class="bg-white rounded-xl border border-slate-100 p-3 space-y-3">
        <!-- Top row: search + status tabs -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div class="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
            <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input v-model="searchQuery" placeholder="Nomzod ismi yoki telefon raqamini qidiring..."
              class="flex-1 bg-transparent text-[13px] placeholder-slate-400 focus:outline-none" />
          </div>
          <div class="flex items-center gap-1 bg-slate-50 rounded-lg p-1 overflow-x-auto">
            <button v-for="tab in filterTabs" :key="tab" @click="activeFilter = tab"
              class="px-3 py-1.5 rounded-md text-[12px] font-medium transition whitespace-nowrap"
              :class="activeFilter === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
              {{ tab }}
            </button>
          </div>
        </div>

        <!-- Filter selects -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <BaseSelect v-model="dateFilter" :options="dateFilterOptions" labelKey="name" valueKey="value"
            placeholder="Vaqt oraliği" :clearable="false" size="sm" />
          <BaseSelect v-model="anketaTypeFilter" :options="anketaTypeOptions" placeholder="Anketa turi" size="sm" />
          <BaseSelect v-model="jobTypeFilter" :options="jobTypeOptions" placeholder="Kasb" size="sm" />
          <BaseSelect v-model="regionFilter" :options="regionOptions" placeholder="Viloyat" size="sm" />
          <BaseSelect v-model="districtFilter" :options="districtOptions" placeholder="Tuman" size="sm"
            :disabled="!regionFilter" />
          <BaseSelect v-model="genderFilter" :options="genderOptions" labelKey="name" valueKey="value"
            placeholder="Jinsi" size="sm" />
        </div>

        <!-- Reset button -->
        <div class="flex justify-end">
          <button type="button" @click="resetFilters"
            class="text-[12px] text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            Filterni tozalash
          </button>
        </div>
      </div>

      <!-- Empty -->
      <div v-if="!loading && filteredCandidates.length === 0"
        class="bg-white rounded-xl border border-slate-100 py-16 px-4 flex flex-col items-center gap-3 text-center">
        <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <p class="text-slate-500 text-sm">Filterlarga mos nomzod topilmadi</p>
      </div>

      <!-- Cards grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5">
        <div v-for="c in filteredCandidates" :key="c.id"
          class="bg-white rounded-lg border border-slate-100 overflow-hidden hover:shadow-md transition">
          <div class="p-2.5 space-y-1.5">
            <p class="text-[9px] text-slate-400 leading-none">id: {{ c.displayId }}</p>

            <div class="flex items-start gap-2">
              <div class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shrink-0 text-[12px]">
                {{ c.name.charAt(0) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1 flex-wrap">
                  <p class="text-[12px] font-bold text-slate-800 truncate leading-tight">{{ c.name }}</p>
                  <span v-if="c.blacklist"
                    class="inline-flex items-center gap-0.5 text-[8px] font-semibold px-1 py-0.5 rounded bg-red-500 text-white">
                    <svg class="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    Q.r
                  </span>
                </div>
                <div class="flex items-center gap-1 mt-0.5">
                  <span class="text-[10px] text-slate-500">{{ c.age || '—' }} yosh</span>
                  <div class="flex gap-0.5">
                    <svg v-for="n in 3" :key="n" class="w-2.5 h-2.5"
                      :class="n <= c.stars ? 'text-amber-400' : 'text-slate-200'"
                      viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-0.5 text-[11px] text-slate-600">
              <div class="flex items-center gap-1.5">
                <svg class="w-3 h-3 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span class="truncate">{{ c.phone }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <svg class="w-3 h-3 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
                <span class="truncate">{{ c.job }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <svg class="w-3 h-3 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span class="truncate">{{ c.location }}</span>
              </div>
              <div v-if="c.suhbat" class="flex items-center gap-1.5">
                <svg class="w-3 h-3 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <span class="truncate">{{ c.suhbat }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100">
              <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded border truncate" :class="statusBadge(c.statusType)">
                {{ c.status }}
              </span>
              <span class="text-[11px] font-bold text-slate-800 whitespace-nowrap">{{ formatMoney(c.amount) }} so'm</span>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>
