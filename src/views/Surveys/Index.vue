<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Form from './Form.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import anketaService from '@/services/anketa.service'
import anketaTypesService from '@/services/anketaTypes.service'
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

const dateFilter = ref('')
const searchQuery = ref('')
const anketaTypeFilter = ref(null)

const candidates = ref([])
const anketaTypes = ref([])
const loading = ref(false)

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
    }
  })
})

const filtered = computed(() => {
  let list = view.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q))
  }
  if (anketaTypeFilter.value) {
    list = list.filter((c) => c.anketaTypeId === anketaTypeFilter.value)
  }
  return list
})

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

const loadAnketaTypes = async () => {
  try {
    const data = await anketaTypesService.all()
    anketaTypes.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Anketa types load error', e)
    anketaTypes.value = []
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

const openForm = (data = null) => {
  editData.value = data
  showModal.value = true
}
const closeForm = () => {
  showModal.value = false
  editData.value = null
}

const openEdit = (item) => openForm(item.raw)

const promptDelete = (item) => {
  itemToDelete.value = item
  showConfirmModal.value = true
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
  loadAnketaTypes()
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

      <div class="relative w-full sm:w-[200px]">
        <select v-model="anketaTypeFilter"
          class="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-700 appearance-none focus:outline-none focus:border-blue-400">
          <option :value="null">Barcha anketa turlari</option>
          <option v-for="t in anketaTypes" :key="t.id" :value="t.id">
            {{ nameByLocale(t) }}
          </option>
        </select>
        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      <!-- Add Anketa button -->
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
        class="bg-white rounded-xl border border-slate-100 p-3 relative hover:shadow-md transition space-y-2">

        <div class="flex items-center justify-between">
          <div class="flex gap-0.5">
            <svg v-for="n in 3" :key="n" class="w-3 h-3 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
            </svg>
          </div>
          <div class="flex items-center gap-1">
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
            <p class="text-[14px] font-bold text-slate-800 truncate">{{ c.name }}</p>
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
              {{ editData ? 'Nomzodni tahrirlash' : "Anketa qo'shish" }}
            </h3>
            <button class="text-gray-400 dark:text-white hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
              @click="closeForm">
              <closeIcon class="w-6 h-6" />
            </button>
          </div>
          <div class="p-4 sm:p-6 overflow-y-auto">
            <Form :edit-data="editData" @close="closeForm" @saved="loadAnketas" />
          </div>
        </div>
      </div>
    </Transition>

    <ConfirmModal v-if="showConfirmModal" :show="showConfirmModal" title="Anketani o'chirish"
      :message="`${itemToDelete?.name || ''} anketasini o'chirishni tasdiqlaysizmi?`" confirm-text="Ha, o'chirish"
      cancel-text="Bekor qilish" type="danger" :duration="5" @confirm="handleConfirmDelete"
      @cancel="showConfirmModal = false" />
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
