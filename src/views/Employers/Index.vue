<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseSelect from '@/components/form/BaseSelect.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import Form from './Form.vue'
import employersService from '@/services/employers.service'
import regionsService from '@/services/regions.service'
import { closeIcon } from '@/components/icons/icon-temp'

const { locale } = useI18n()

const items = ref([])
const regions = ref([])
const loading = ref(false)

const searchQuery = ref('')
const tierFilter = ref(null)
const statusFilter = ref(null)
const regionFilter = ref(null)
const districtFilter = ref(null)
const expiredFilter = ref(false)

const showModal = ref(false)
const editData = ref(null)
const showConfirm = ref(false)
const itemToDelete = ref(null)

watch(regionFilter, () => { districtFilter.value = null })

const tierOptions = [
  { value: 'free', name: 'Bepul' },
  { value: 'premium_a', name: 'Premium A' },
  { value: 'premium_b', name: 'Premium B' },
  { value: 'premium_v', name: 'Premium V' },
]
const statusOptions = [
  { value: 'active', name: 'Faol' },
  { value: 'inactive', name: 'Faol emas' },
  { value: 'archived', name: 'Arxiv' },
]

const TIER_LABELS = {
  free: 'Bepul', premium_a: 'Premium A', premium_b: 'Premium B', premium_v: 'Premium V',
}
const STATUS_LABELS = { active: 'Faol', inactive: 'Faol emas', archived: 'Arxiv' }

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
  return `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()}`
}

const formatMoney = (v) => {
  if (!v) return ''
  return Number(v).toLocaleString('fr-FR').replace(/\s/g, ',')
}

const regionOptions = computed(() => regions.value.map((r) => ({ id: r.id, name: nameByLocale(r) })))
const districtOptions = computed(() => {
  if (!regionFilter.value) return []
  const r = regions.value.find((x) => x.id === regionFilter.value)
  return (r?.districts || []).map((d) => ({ id: d.id, name: nameByLocale(d) }))
})

const view = computed(() => items.value.map((e) => {
  const region = nameByLocale(e.region)
  const district = nameByLocale(e.district)
  const address = [e.address, district, region].filter(Boolean).join(', ') || '—'
  return {
    id: e.id,
    raw: e,
    displayId: String(e.id).padStart(7, '0'),
    name: e.name,
    contactPerson: e.contact_person || '—',
    phone: e.phone,
    address,
    positionTitle: e.position_title || '—',
    positionCount: e.position_count || 1,
    salary: e.salary ? Number(e.salary) : null,
    deadline: e.deadline ? formatDate(e.deadline) : null,
    isExpired: !!e.is_expired,
    tier: e.tier,
    tierLabel: TIER_LABELS[e.tier] || e.tier,
    status: e.status,
    statusLabel: STATUS_LABELS[e.status] || e.status,
    accent: e.tier && e.tier !== 'free' ? 'pink' : 'orange',
    candidates: 0,
    matchTotal: 0,
  }
}))

const filtered = computed(() => {
  let list = view.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((e) => e.name.toLowerCase().includes(q) || e.phone.includes(q) || e.contactPerson.toLowerCase().includes(q))
  }
  if (tierFilter.value) list = list.filter((e) => e.tier === tierFilter.value)
  if (statusFilter.value) list = list.filter((e) => e.status === statusFilter.value)
  if (regionFilter.value) list = list.filter((e) => e.raw.region_id === regionFilter.value)
  if (districtFilter.value) list = list.filter((e) => e.raw.district_id === districtFilter.value)
  if (expiredFilter.value) list = list.filter((e) => e.isExpired)
  return list
})

const accentBar = (a) => (a === 'pink' ? 'bg-pink-500' : 'bg-orange-400')
const statusBadge = (status) => {
  if (status === 'active') return 'bg-emerald-100 text-emerald-700 border border-emerald-200'
  if (status === 'archived') return 'bg-slate-100 text-slate-700 border border-slate-200'
  return 'bg-amber-100 text-amber-700 border border-amber-200'
}
const tierBadge = (tier) => {
  if (tier === 'premium_v') return 'bg-purple-100 text-purple-700 border border-purple-200'
  if (tier === 'premium_b') return 'bg-indigo-100 text-indigo-700 border border-indigo-200'
  if (tier === 'premium_a') return 'bg-blue-100 text-blue-700 border border-blue-200'
  return 'bg-slate-100 text-slate-700 border border-slate-200'
}

const loadAll = async () => {
  loading.value = true
  try {
    items.value = (await employersService.all()) || []
  } catch (e) {
    console.error('Employers load error', e)
    items.value = []
  } finally {
    loading.value = false
  }
}

const loadRegions = async () => {
  try { regions.value = (await regionsService.all({})) || [] } catch (e) { console.error(e) }
}

const openForm = (data = null) => {
  editData.value = data
  showModal.value = true
}
const closeForm = () => { showModal.value = false; editData.value = null }
const openEdit = (item) => openForm(item.raw)

const promptDelete = (item) => { itemToDelete.value = item; showConfirm.value = true }
const handleConfirmDelete = async () => {
  if (!itemToDelete.value) return
  try {
    await employersService.delete(itemToDelete.value.id)
    showConfirm.value = false
    itemToDelete.value = null
    await loadAll()
  } catch (e) { console.error(e); showConfirm.value = false }
}

const resetFilters = () => {
  searchQuery.value = ''
  tierFilter.value = null
  statusFilter.value = null
  regionFilter.value = null
  districtFilter.value = null
  expiredFilter.value = false
}

onMounted(() => { loadRegions(); loadAll() })
</script>

<template>
  <div class="space-y-4">
    <!-- Title + actions -->
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-800">{{ $t('employers') }}</h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">{{ $t('manage_employers') }}</p>
        <p class="text-[11px] text-slate-400 mt-1">Jami: <span class="font-semibold text-slate-700">{{ filtered.length }}</span></p>
      </div>
      <div class="flex items-center gap-2">
        <button type="button" @click="openForm()"
          class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold shadow-sm">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Yangi ish beruvchi
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-slate-100 p-3 space-y-3">
      <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
        <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input v-model="searchQuery" :placeholder="$t('company_or_phone_search')"
          class="flex-1 bg-transparent text-[13px] placeholder-slate-400 focus:outline-none" />
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        <BaseSelect v-model="tierFilter" :options="tierOptions" labelKey="name" valueKey="value" placeholder="Tarif" size="sm" />
        <BaseSelect v-model="statusFilter" :options="statusOptions" labelKey="name" valueKey="value" placeholder="Holati" size="sm" />
        <BaseSelect v-model="regionFilter" :options="regionOptions" labelKey="name" valueKey="id" placeholder="Viloyat" size="sm" />
        <BaseSelect v-model="districtFilter" :options="districtOptions" labelKey="name" valueKey="id" placeholder="Tuman" size="sm" :disabled="!regionFilter" />
        <label class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] cursor-pointer hover:bg-slate-50">
          <input type="checkbox" v-model="expiredFilter" class="w-4 h-4 rounded border-slate-300 text-rose-500 focus:ring-rose-400" />
          <span>Muddati o'tgan</span>
        </label>
      </div>

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
    <div v-if="!loading && filtered.length === 0"
      class="bg-white rounded-xl border border-slate-100 py-16 px-4 flex flex-col items-center gap-3 text-center">
      <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
        <svg class="w-8 h-8 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 9h6v6H9z" />
        </svg>
      </div>
      <p class="text-slate-500 text-sm">Ish beruvchilar topilmadi</p>
    </div>

    <!-- Cards grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <div v-for="e in filtered" :key="e.id"
        class="bg-white rounded-xl border border-slate-100 overflow-hidden transition hover:shadow-md"
        :class="e.tier !== 'free' ? 'ring-2 ring-pink-300' : ''">
        <div class="h-1.5" :class="accentBar(e.accent)"></div>

        <div class="p-3 space-y-2">
          <p class="text-[10px] text-slate-400">id: {{ e.displayId }}</p>

          <div class="flex items-start gap-2">
            <div class="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">
              {{ e.name.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[13px] font-bold text-slate-800 truncate">{{ e.name }}</p>
              <p class="text-[11px] text-slate-500 truncate">{{ e.contactPerson }}</p>
            </div>
            <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0" :class="statusBadge(e.status)">
              {{ e.statusLabel }}
            </span>
          </div>

          <div class="flex items-center justify-end gap-1">
            <button @click="openEdit(e)" title="Tahrirlash"
              class="w-7 h-7 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-100 flex items-center justify-center">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button @click="promptDelete(e)" title="O'chirish"
              class="w-7 h-7 rounded-md bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 flex items-center justify-center">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
              </svg>
            </button>
          </div>

          <div class="space-y-1.5 text-[12px] text-slate-700">
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span class="truncate">{{ e.phone }}</span>
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
                <span class="truncate">{{ e.positionTitle }} - {{ e.positionCount }} ta</span>
              </div>
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded shrink-0" :class="tierBadge(e.tier)">
                {{ e.tierLabel }}
              </span>
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
              <div class="flex items-center gap-1.5" :class="e.isExpired ? 'text-rose-500' : ''">
                <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <span>Muddat: {{ e.deadline }}</span>
              </div>
              <span v-if="e.isExpired"
                class="px-2 py-0.5 rounded-md text-[10px] font-semibold text-rose-500 bg-rose-50 border border-rose-200">
                Muddati o'tgan
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="fixed inset-0 z-50 flex flex-col">
        <div class="flex flex-col flex-1 bg-white dark:bg-slate-900 overflow-hidden">
          <div class="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800 shrink-0">
            <h3 class="text-lg font-bold text-gray-800 dark:text-slate-100">
              {{ editData?.id ? 'Ish beruvchini tahrirlash' : 'Yangi ish beruvchi' }}
            </h3>
            <button class="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50" @click="closeForm">
              <closeIcon class="w-6 h-6" />
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-4 sm:p-6">
            <Form :edit-data="editData" @close="closeForm" @saved="loadAll" />
          </div>
        </div>
      </div>
    </Transition>

    <ConfirmModal v-if="showConfirm" :show="showConfirm" title="Ish beruvchini o'chirish"
      :message="`${itemToDelete?.name || ''} ni o'chirishni tasdiqlaysizmi?`" confirm-text="Ha, o'chirish"
      cancel-text="Bekor qilish" type="danger" :duration="5"
      @confirm="handleConfirmDelete" @cancel="showConfirm = false" />
  </div>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
