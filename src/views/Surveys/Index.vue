<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Form from './Form.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import anketaService from '@/services/anketa.service'
import anketaTypesService from '@/services/anketaTypes.service'
import jobTypesService from '@/services/jobTypes.service'
import regionsService from '@/services/regions.service'
import BaseSelect from '@/components/form/BaseSelect.vue'
import { closeIcon } from '@/components/icons/icon-temp'

const { locale } = useI18n()

const statCards = [
  { label: "Qo'ng'iroqlar", today: 9, total: 16, icon: 'clock', iconBg: 'bg-orange-50', iconColor: 'text-orange-500' },
  { label: 'Anketalar', today: 9, total: 16, icon: 'doc', iconBg: 'bg-slate-50', iconColor: 'text-slate-500' },
  { label: "Bepul e'lon", today: 9, total: 16, icon: 'bot', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
  { label: "Pullik e'lon", today: 9, total: 16, icon: 'dollar', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
  { label: 'Shartnomalar', today: 9, total: 16, icon: 'crown', iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
  { label: 'Agent', today: 9, total: 16, icon: 'building', iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
]

const dateFilter = ref('week')
const searchQuery = ref('')
const anketaTypeFilter = ref(null)
const jobTypeFilter = ref(null)
const regionFilter = ref(null)
const districtFilter = ref(null)
const genderFilter = ref(null)
const statusFilter = ref(null)

const candidates = ref([])
const anketaTypes = ref([])
const jobTypes = ref([])
const regions = ref([])
const loading = ref(false)

watch(regionFilter, () => { districtFilter.value = null })

const TYPE_COLORS = [
  { bg: 'bg-amber-400 text-white', soft: 'bg-amber-50 text-amber-700 border-amber-200' },
  { bg: 'bg-purple-500 text-white', soft: 'bg-purple-50 text-purple-700 border-purple-200' },
  { bg: 'bg-orange-400 text-white', soft: 'bg-orange-50 text-orange-700 border-orange-200' },
  { bg: 'bg-blue-500 text-white', soft: 'bg-blue-50 text-blue-700 border-blue-200' },
  { bg: 'bg-emerald-500 text-white', soft: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { bg: 'bg-rose-500 text-white', soft: 'bg-rose-50 text-rose-700 border-rose-200' },
  { bg: 'bg-cyan-500 text-white', soft: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { bg: 'bg-indigo-500 text-white', soft: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
]
const typeColorById = (id) => TYPE_COLORS[(Number(id) || 0) % TYPE_COLORS.length]

const showModal = ref(false)
const editData = ref(null)
const showConfirmModal = ref(false)
const itemToDelete = ref(null)

const showBlacklistModal = ref(false)
const blacklistTarget = ref(null)
const blacklistReason = ref('')
const blacklistSaving = ref(false)

const STATUS_LABELS = {
  anketa_olindi: { label: 'Anketa olindi', type: 'anketa' },
  suhbatga_belgilandi: { label: 'Suhbatga belgilandi', type: 'suhbat' },
  suhbatga_bordi: { label: 'Suhbatga bordi', type: 'suhbat-done' },
  suhbatga_bormadi: { label: 'Suhbatga bormadi', type: 'searching' },
  '3_kunlik_sinov': { label: '3 kunlik sinov', type: 'sinov' },
  qabul_qilindi: { label: 'Qabul qilindi', type: 'qabul' },
  rad_etildi: { label: 'Rad etildi', type: 'searching' },
}

const GENDER_LABELS = { male: 'Erkak', female: 'Ayol' }

const nameByLocale = (obj) => {
  if (!obj) return ''
  const lang = locale.value
  return (lang === 'ru' ? obj.name_ru : lang === 'uzk' ? obj.name_uzk : obj.name_uz) || obj.name_uz || ''
}

const formatDate = (d) => {
  if (!d) return ''
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

const view = computed(() => {
  return candidates.value.map((c) => {
    const fullName = [c.surname, c.name, c.middle_name].filter(Boolean).join(' ') || c.name || '—'
    const status = STATUS_LABELS[c.anketa_status] || { label: c.anketa_status || '—', type: 'anketa' }
    const region = nameByLocale(c.region)
    const district = nameByLocale(c.district)
    const location = [region, district].filter(Boolean).join(', ')
    const anketaTypeName = nameByLocale(c.anketa_type)
    const colors = typeColorById(c.anketa_type_id)
    return {
      id: c.id,
      raw: c,
      name: fullName,
      age: c.age ?? '',
      gender: GENDER_LABELS[c.gender] || '—',
      phone: c.phone_number || '',
      job: nameByLocale(c.job_type) || '—',
      location: location || '—',
      salary: Number(c.expected_salary || 0),
      status: status.label,
      statusType: status.type,
      suhbat: c.interview_datetime ? formatDate(c.interview_datetime) : null,
      avatarColor: 'bg-blue-500',
      anketaTypeId: c.anketa_type_id || null,
      anketaTypeName: anketaTypeName || '—',
      anketaTypeBadgeClass: colors.bg,
      anketaTypeSoftClass: colors.soft,
      anketaTypeInitial: anketaTypeName ? anketaTypeName.charAt(0).toUpperCase() : '—',
      jobTypeId: c.job_type_id || null,
      regionId: c.region_id || null,
      districtId: c.district_id || null,
      genderRaw: c.gender || null,
      anketaStatusRaw: c.anketa_status || null,
      isBlacklisted: !!c.is_blacklisted,
      blacklistReason: c.blacklist_reason || '',
      createdAtMs: c.createdAt ? new Date(c.createdAt).getTime() : 0,
    }
  })
})

const dateRangeMs = (key) => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (key === 'today') return [start.getTime(), start.getTime() + 86400000]
  if (key === 'week') {
    const day = start.getDay() || 7  // Du=1 ... Ya=7
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

const statusOptions = [
  { value: 'anketa_olindi', name: 'Anketa olindi' },
  { value: 'suhbatga_belgilandi', name: 'Suhbatga belgilandi' },
  { value: 'suhbatga_bordi', name: 'Suhbatga bordi' },
  { value: 'suhbatga_bormadi', name: 'Suhbatga bormadi' },
  { value: '3_kunlik_sinov', name: '3 kunlik sinov' },
  { value: 'qabul_qilindi', name: 'Qabul qilindi' },
  { value: 'rad_etildi', name: 'Rad etildi' },
]

const anketaTypeOptions = computed(() =>
  anketaTypes.value.map((t) => ({ id: t.id, name: nameByLocale(t) }))
)
const jobTypeOptions = computed(() =>
  jobTypes.value.map((t) => ({ id: t.id, name: nameByLocale(t) }))
)
const regionOptions = computed(() =>
  regions.value.map((r) => ({ id: r.id, name: nameByLocale(r) }))
)
const districtOptions = computed(() => {
  if (!regionFilter.value) return []
  const r = regions.value.find((x) => x.id === regionFilter.value)
  return (r?.districts || []).map((d) => ({ id: d.id, name: nameByLocale(d) }))
})

const filtered = computed(() => {
  let list = view.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q))
  }
  if (anketaTypeFilter.value) list = list.filter((c) => c.anketaTypeId === anketaTypeFilter.value)
  if (jobTypeFilter.value) list = list.filter((c) => c.jobTypeId === jobTypeFilter.value)
  if (regionFilter.value) list = list.filter((c) => c.regionId === regionFilter.value)
  if (districtFilter.value) list = list.filter((c) => c.districtId === districtFilter.value)
  if (genderFilter.value) list = list.filter((c) => c.genderRaw === genderFilter.value)
  if (statusFilter.value) list = list.filter((c) => c.anketaStatusRaw === statusFilter.value)

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
  anketaTypeFilter.value = null
  jobTypeFilter.value = null
  regionFilter.value = null
  districtFilter.value = null
  genderFilter.value = null
  statusFilter.value = null
}

const formatMoney = (v) => {
  if (!v) return '0'
  return Number(v).toLocaleString('fr-FR').replace(/\s/g, ',')
}

const statusBadge = (type) => {
  const map = {
    qabul: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    suhbat: 'bg-amber-100 text-amber-700 border-amber-200',
    'suhbat-done': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    sinov: 'bg-purple-100 text-purple-700 border-purple-200',
    anketa: 'bg-blue-100 text-blue-700 border-blue-200',
    searching: 'bg-rose-100 text-rose-700 border-rose-200',
  }
  return map[type] || 'bg-slate-100 text-slate-600 border-slate-200'
}

const loadLookups = async () => {
  try {
    const [at, jt, rg] = await Promise.all([
      anketaTypesService.all(),
      jobTypesService.all(),
      regionsService.all({}),
    ])
    anketaTypes.value = Array.isArray(at) ? at : []
    jobTypes.value = Array.isArray(jt) ? jt : []
    regions.value = Array.isArray(rg) ? rg : []
  } catch (e) {
    console.error('Lookup load error', e)
  }
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

const formMode = ref('create') // 'create' | 'edit' | 'clone'

const openForm = (data = null) => {
  editData.value = data
  formMode.value = data?.id ? 'edit' : 'create'
  showModal.value = true
}
const closeForm = () => {
  showModal.value = false
  editData.value = null
  formMode.value = 'create'
}

const openEdit = (item) => openForm(item.raw)

const openClone = (item) => {
  const src = item.raw || {}
  // Identity maydonlari tozalanadi — qaytadan kiritilishi kerak
  editData.value = {
    ...src,
    id: undefined,
    name: '',
    surname: '',
    middle_name: '',
    phone_number: '',
    birthday: null,
  }
  formMode.value = 'clone'
  showModal.value = true
}

const promptDelete = (item) => {
  itemToDelete.value = item
  showConfirmModal.value = true
}

const openBlacklist = (item) => {
  blacklistTarget.value = item
  blacklistReason.value = ''
  showBlacklistModal.value = true
}
const closeBlacklist = () => {
  showBlacklistModal.value = false
  blacklistTarget.value = null
  blacklistReason.value = ''
}
const submitBlacklist = async () => {
  if (!blacklistTarget.value || blacklistSaving.value) return
  const reason = blacklistReason.value.trim()
  if (!reason) return
  blacklistSaving.value = true
  try {
    await anketaService.addToBlacklist(blacklistTarget.value.id, reason)
    closeBlacklist()
    await loadAnketas()
  } catch (e) {
    console.error('Blacklist add error', e)
  } finally {
    blacklistSaving.value = false
  }
}
const removeFromBlacklist = async (item) => {
  try {
    await anketaService.removeFromBlacklist(item.id)
    await loadAnketas()
  } catch (e) {
    console.error('Blacklist remove error', e)
  }
}

const handleConfirmDelete = async () => {
  if (!itemToDelete.value) return
  try {
    await anketaService.delete(itemToDelete.value.id)
    showConfirmModal.value = false
    itemToDelete.value = null
    await loadAnketas()
  } catch (e) {
    console.error('Anketa delete error', e)
    showConfirmModal.value = false
  }
}

onMounted(() => {
  loadLookups()
  loadAnketas()
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

    <!-- Filter bar + Add button -->
    <div class="bg-white rounded-xl border border-slate-100 p-3 space-y-3">
      <!-- Top row: search + add -->
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input v-model="searchQuery" placeholder="Ism yoki telefon raqamini qidirish..."
            class="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-[13px] placeholder-slate-400 focus:outline-none focus:border-blue-400" />
        </div>

        <button type="button" @click="openForm()"
          class="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold whitespace-nowrap shadow-sm transition">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Anketa qo'shish
        </button>
      </div>

      <!-- Filter selects -->
      <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2">
        <BaseSelect v-model="dateFilter" :options="dateFilterOptions" labelKey="name" valueKey="value"
          placeholder="Vaqt oraliği" :clearable="false" size="sm" />
        <BaseSelect v-model="anketaTypeFilter" :options="anketaTypeOptions" placeholder="Anketa turi" size="sm" />
        <BaseSelect v-model="jobTypeFilter" :options="jobTypeOptions" placeholder="Kasb" size="sm" />
        <BaseSelect v-model="regionFilter" :options="regionOptions" placeholder="Viloyat" size="sm" />
        <BaseSelect v-model="districtFilter" :options="districtOptions" placeholder="Tuman" size="sm"
          :disabled="!regionFilter" />
        <BaseSelect v-model="genderFilter" :options="genderOptions" labelKey="name" valueKey="value"
          placeholder="Jinsi" size="sm" />
        <BaseSelect v-model="statusFilter" :options="statusOptions" labelKey="name" valueKey="value"
          placeholder="Status" size="sm" />
      </div>

      <!-- Reset -->
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

    <!-- Empty state -->
    <div v-if="!loading && filtered.length === 0"
      class="bg-white rounded-xl border border-slate-100 py-16 px-4 flex flex-col items-center gap-3 text-center">
      <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
        <svg class="w-8 h-8 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>
      <p class="text-slate-500 text-sm">Hozircha anketalar yo'q</p>
      <button type="button" @click="openForm()"
        class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold transition">
        Birinchi anketani qo'shish
      </button>
    </div>

    <!-- Cards grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <article v-for="c in filtered" :key="c.id"
        class="bg-white rounded-xl p-3 relative hover:shadow-md transition space-y-2"
        :class="c.isBlacklisted ? 'border-2 border-red-400' : 'border border-slate-100'">

        <div class="flex items-center justify-between">
          <div class="flex gap-0.5">
            <svg v-for="n in 3" :key="n" class="w-3 h-3 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
            </svg>
          </div>
          <div class="flex items-center gap-1">
            <button @click="openClone(c)" title="Nusxa olish"
              class="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 flex items-center justify-center">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <button v-if="!c.isBlacklisted" @click="openBlacklist(c)" title="Qora ro'yxatga qo'shish"
              class="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 flex items-center justify-center">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9" />
                <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
              </svg>
            </button>
            <button v-else @click="removeFromBlacklist(c)" title="Qora ro'yxatdan chiqarish"
              class="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
            <button @click="openEdit(c)" title="Tahrirlash"
              class="w-7 h-7 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-100 flex items-center justify-center">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button @click="promptDelete(c)" title="O'chirish"
              class="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 flex items-center justify-center">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex items-start gap-2">
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
            :class="c.avatarColor">
            {{ c.name.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <p class="text-[14px] font-bold text-slate-800 truncate">{{ c.name }}</p>
              <span v-if="c.isBlacklisted" :title="c.blacklistReason"
                class="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded bg-red-500 text-white shrink-0">
                <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <circle cx="12" cy="12" r="9" />
                  <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
                </svg>
                Q.r
              </span>
            </div>
            <p class="text-[11px] text-slate-500">{{ c.age || '—' }} yosh</p>
          </div>
          <div class="flex flex-col items-end gap-0.5 max-w-[110px]">
            <span class="text-[9px] text-slate-400">Anketa turi</span>
            <span
              class="px-1.5 py-0.5 rounded-md text-[10px] font-semibold border truncate max-w-full"
              :class="c.anketaTypeSoftClass"
              :title="c.anketaTypeName">
              {{ c.anketaTypeName }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-1.5 text-[12px] text-slate-600">
          <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M20 21a8 8 0 0 0-16 0" />
          </svg>
          <span>{{ c.gender }}</span>
        </div>

        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5 text-[12px] text-slate-600 min-w-0">
            <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span class="truncate">{{ c.phone }}</span>
          </div>
          <button @click="openEdit(c)"
            class="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 whitespace-nowrap">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Anketani ko'rish
          </button>
        </div>

        <div class="flex items-center gap-1.5 text-[12px] text-slate-600">
          <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          <span>{{ c.job }}</span>
        </div>

        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5 text-[12px] text-slate-600 min-w-0">
            <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span class="truncate">{{ c.location }}</span>
          </div>
        </div>

        <div v-if="c.suhbat" class="flex items-center justify-between gap-2 text-[12px] text-slate-600">
          <div class="flex items-center gap-1.5 min-w-0">
            <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span class="truncate">Suhbat: {{ c.suhbat }}</span>
          </div>
          <span class="font-bold text-slate-800 whitespace-nowrap">{{ formatMoney(c.salary) }} so'm</span>
        </div>
        <div v-else class="flex justify-end">
          <span class="text-[13px] font-bold text-slate-800">{{ formatMoney(c.salary) }} so'm</span>
        </div>

        <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <span class="text-[11px] font-semibold px-2 py-1 rounded-md border" :class="statusBadge(c.statusType)">
            {{ c.status }}
          </span>
          <button
            class="px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 whitespace-nowrap">
            Korxonaga biriktirish
          </button>
        </div>
      </article>
    </div>

    <!-- Add / Edit Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeForm"></div>

        <div class="modal-content relative bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl flex flex-col max-h-[95vh] sm:max-h-[90vh]">
          <div class="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/40 rounded-t-2xl">
            <h3 class="text-lg font-bold text-gray-800 dark:text-slate-100">
              {{ formMode === 'edit' ? 'Nomzodni tahrirlash' : formMode === 'clone' ? 'Anketadan nusxa olish' : "Anketa qo'shish" }}
            </h3>
            <button class="text-gray-400 dark:text-white hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
              @click="closeForm">
              <closeIcon class="w-6 h-6" />
            </button>
          </div>
          <div class="p-4 sm:p-6 overflow-y-auto">
            <Form :edit-data="editData" :mode="formMode" @close="closeForm" @saved="loadAnketas" />
          </div>
        </div>
      </div>
    </Transition>

    <ConfirmModal v-if="showConfirmModal" :show="showConfirmModal" title="Anketani o'chirish"
      :message="`${itemToDelete?.name || ''} anketasini o'chirishni tasdiqlaysizmi?`" confirm-text="Ha, o'chirish"
      cancel-text="Bekor qilish" type="danger" :duration="5" @confirm="handleConfirmDelete"
      @cancel="showConfirmModal = false" />

    <!-- Blacklist Modal -->
    <Transition name="modal">
      <div v-if="showBlacklistModal" class="fixed inset-0 z-[55] flex items-end sm:items-center justify-center sm:p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeBlacklist"></div>
        <div class="modal-content relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md flex flex-col">
          <div class="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <div class="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="9" />
                <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-bold text-gray-800">Qora ro'yxatga qo'shish</h3>
              <p class="text-[12px] text-slate-500 truncate">{{ blacklistTarget?.name }}</p>
            </div>
          </div>
          <form @submit.prevent="submitBlacklist" class="px-5 py-4 space-y-3">
            <label class="block">
              <span class="text-[12px] font-semibold text-slate-700">Sababi <span class="text-red-500">*</span></span>
              <textarea v-model="blacklistReason" rows="3" required
                placeholder="Nima uchun qora ro'yxatga qo'shilyapti?"
                class="mt-1 w-full px-3 py-2 text-[13px] rounded-lg border border-slate-300 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20 resize-none"></textarea>
            </label>
            <div class="flex justify-end gap-2 pt-1">
              <button type="button" @click="closeBlacklist"
                class="px-4 py-2 rounded-lg text-[13px] font-medium text-slate-700 border border-slate-200 hover:bg-slate-50">
                Bekor qilish
              </button>
              <button type="submit" :disabled="!blacklistReason.trim() || blacklistSaving"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
                {{ blacklistSaving ? 'Saqlanmoqda...' : "Qora ro'yxatga qo'shish" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.25s ease;
}
.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: translateY(20px);
}
</style>
