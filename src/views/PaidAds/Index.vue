<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseSelect from '@/components/form/BaseSelect.vue'
import employersService from '@/services/employers.service'
import regionsService from '@/services/regions.service'

const { locale } = useI18n()

const items = ref([])
const regions = ref([])
const loading = ref(false)

const searchQuery = ref('')
const tierFilter = ref(null)
const regionFilter = ref(null)
const districtFilter = ref(null)
const expiredFilter = ref(false)

watch(regionFilter, () => { districtFilter.value = null })

const tierOptions = [
  { value: 'premium_a', name: 'Premium A' },
  { value: 'premium_b', name: 'Premium B' },
  { value: 'premium_v', name: 'Premium V' },
]
const TIER_LABELS = { premium_a: 'Premium A', premium_b: 'Premium B', premium_v: 'Premium V' }

const nameByLocale = (obj) => {
  if (!obj) return ''
  const lang = locale.value
  return (lang === 'ru' ? obj.name_ru : lang === 'uzk' ? obj.name_uzk : obj.name_uz) || obj.name_uz || ''
}

const formatDate = (d) => {
  if (!d) return ''
  const dt = new Date(d); if (isNaN(dt.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()}`
}
const formatMoney = (v) => v ? Number(v).toLocaleString('fr-FR').replace(/\s/g, ',') : ''

const regionOptions = computed(() => regions.value.map((r) => ({ id: r.id, name: nameByLocale(r) })))
const districtOptions = computed(() => {
  if (!regionFilter.value) return []
  const r = regions.value.find((x) => x.id === regionFilter.value)
  return (r?.districts || []).map((d) => ({ id: d.id, name: nameByLocale(d) }))
})

const view = computed(() => items.value
  .filter((e) => e.tier && e.tier !== 'free')
  .map((e) => ({
    id: e.id, raw: e,
    displayId: String(e.id).padStart(7, '0'),
    name: e.name, contactPerson: e.contact_person || '—',
    phone: e.phone,
    address: [e.address, nameByLocale(e.district), nameByLocale(e.region)].filter(Boolean).join(', ') || '—',
    positionTitle: e.position_title || '—', positionCount: e.position_count || 1,
    salary: e.salary ? Number(e.salary) : null,
    deadline: e.deadline ? formatDate(e.deadline) : null,
    isExpired: !!e.is_expired,
    tier: e.tier, tierLabel: TIER_LABELS[e.tier] || e.tier,
    createdAt: formatDate(e.createdAt),
  }))
)

const filtered = computed(() => {
  let list = view.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((e) => e.name.toLowerCase().includes(q) || e.phone.includes(q))
  }
  if (tierFilter.value) list = list.filter((e) => e.tier === tierFilter.value)
  if (regionFilter.value) list = list.filter((e) => e.raw.region_id === regionFilter.value)
  if (districtFilter.value) list = list.filter((e) => e.raw.district_id === districtFilter.value)
  if (expiredFilter.value) list = list.filter((e) => e.isExpired)
  return list
})

const counts = computed(() => ({
  all: view.value.length,
  a: view.value.filter((e) => e.tier === 'premium_a').length,
  b: view.value.filter((e) => e.tier === 'premium_b').length,
  v: view.value.filter((e) => e.tier === 'premium_v').length,
}))

const tierBadge = (tier) => {
  if (tier === 'premium_v') return 'bg-purple-100 text-purple-700 border border-purple-200'
  if (tier === 'premium_b') return 'bg-indigo-100 text-indigo-700 border border-indigo-200'
  return 'bg-blue-100 text-blue-700 border border-blue-200'
}
const tierAccent = (tier) => {
  if (tier === 'premium_v') return 'bg-purple-500'
  if (tier === 'premium_b') return 'bg-indigo-500'
  return 'bg-blue-500'
}

const loadAll = async () => {
  loading.value = true
  try { items.value = (await employersService.all()) || [] }
  catch (e) { console.error(e); items.value = [] }
  finally { loading.value = false }
}
const loadRegions = async () => {
  try { regions.value = (await regionsService.all({})) || [] } catch (e) { console.error(e) }
}

const resetFilters = () => {
  searchQuery.value = ''; tierFilter.value = null
  regionFilter.value = null; districtFilter.value = null; expiredFilter.value = false
}

onMounted(() => { loadRegions(); loadAll() })
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-start justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-800">{{ $t('paid_ads') }}</h1>
        <p class="text-xs text-slate-500 mt-1">Premium ish beruvchilarning pullik e'lonlari</p>
        <p class="text-[11px] text-slate-400 mt-1">
          Jami: <span class="font-semibold text-slate-700">{{ counts.all }}</span>
          · A: {{ counts.a }} · B: {{ counts.b }} · V: {{ counts.v }}
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-slate-100 p-3 space-y-3">
      <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
        <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input v-model="searchQuery" placeholder="Kompaniya nomi yoki telefon..."
          class="flex-1 bg-transparent text-[13px] placeholder-slate-400 focus:outline-none" />
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        <BaseSelect v-model="tierFilter" :options="tierOptions" labelKey="name" valueKey="value" placeholder="Tarif" size="sm" />
        <BaseSelect v-model="regionFilter" :options="regionOptions" labelKey="name" valueKey="id" placeholder="Viloyat" size="sm" />
        <BaseSelect v-model="districtFilter" :options="districtOptions" labelKey="name" valueKey="id" placeholder="Tuman" size="sm" :disabled="!regionFilter" />
        <label class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] cursor-pointer hover:bg-slate-50">
          <input type="checkbox" v-model="expiredFilter" class="w-4 h-4 rounded border-slate-300 text-rose-500" />
          <span>Muddati o'tgan</span>
        </label>
        <button type="button" @click="resetFilters"
          class="text-[12px] text-slate-500 hover:text-slate-700 font-medium flex items-center justify-center gap-1 border border-slate-200 rounded-lg">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Tozalash
        </button>
      </div>
    </div>

    <!-- Empty -->
    <div v-if="!loading && filtered.length === 0"
      class="bg-white rounded-xl border border-slate-100 py-16 px-4 flex flex-col items-center gap-3 text-center">
      <p class="text-slate-500 text-sm">Pullik e'lonlar yo'q</p>
      <p class="text-[12px] text-slate-400">Ish beruvchilar sahifasida tarifni Premium A/B/V ga o'rnating</p>
    </div>

    <!-- Cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <div v-for="e in filtered" :key="e.id"
        class="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition ring-2 ring-pink-200">
        <div class="h-1.5" :class="tierAccent(e.tier)"></div>
        <div class="p-3 space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-[10px] text-slate-400">id: {{ e.displayId }}</p>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded" :class="tierBadge(e.tier)">{{ e.tierLabel }}</span>
          </div>

          <div class="flex items-start gap-2">
            <div class="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">{{ e.name.charAt(0) }}</div>
            <div class="flex-1 min-w-0">
              <p class="text-[13px] font-bold text-slate-800 truncate">{{ e.name }}</p>
              <p class="text-[11px] text-slate-500 truncate">{{ e.contactPerson }}</p>
            </div>
          </div>

          <div class="space-y-1 text-[12px] text-slate-700">
            <div class="flex items-center gap-1.5">
              <svg class="w-3 h-3 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span class="truncate">{{ e.phone }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <svg class="w-3 h-3 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <span class="truncate">{{ e.address }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <svg class="w-3 h-3 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              </svg>
              <span>{{ e.positionTitle }} - {{ e.positionCount }} ta</span>
            </div>
            <div v-if="e.salary" class="flex items-center gap-1.5 font-semibold">
              <svg class="w-3 h-3 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span>{{ formatMoney(e.salary) }} so'm</span>
            </div>
            <div v-if="e.deadline" class="flex items-center gap-1.5" :class="e.isExpired ? 'text-rose-500' : ''">
              <svg class="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span>Muddat: {{ e.deadline }}</span>
              <span v-if="e.isExpired" class="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200">o'tgan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
