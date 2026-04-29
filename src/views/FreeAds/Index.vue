<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseSelect from '@/components/form/BaseSelect.vue'
import anketaService from '@/services/anketa.service'
import anketaTypesService from '@/services/anketaTypes.service'
import jobTypesService from '@/services/jobTypes.service'

const { locale } = useI18n()

const allAnketas = ref([])
const allFreeAds = ref([])
const anketaTypes = ref([])
const jobTypes = ref([])
const loading = ref(false)

const dateFilter = ref('')
const searchQuery = ref('')
const anketaTypeFilter = ref(null)
const jobTypeFilter = ref(null)

const dateFilterOptions = [
  { value: '', name: 'Barcha vaqt' },
  { value: 'today', name: 'Bugun' },
  { value: 'week', name: 'Shu hafta' },
  { value: 'month', name: 'Shu oy' },
]

const showAddModal = ref(false)
const showRejectModal = ref(false)
const rejectTarget = ref(null)
const rejectReason = ref('')
const rejectSaving = ref(false)

const nameByLocale = (obj) => {
  if (!obj) return ''
  const lang = locale.value
  return (lang === 'ru' ? obj.name_ru : lang === 'uzk' ? obj.name_uzk : obj.name_uz) || obj.name_uz || ''
}

const formatMoney = (v) => {
  if (!v) return '0'
  return Number(v).toLocaleString('fr-FR').replace(/\s/g, ',')
}

const daysSince = (d) => {
  if (!d) return 0
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
}

const dateRangeMs = (key) => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (key === 'today') return [start.getTime(), start.getTime() + 86400000]
  if (key === 'week') {
    const day = start.getDay() || 7
    const monday = new Date(start); monday.setDate(start.getDate() - (day - 1))
    const next = new Date(monday); next.setDate(monday.getDate() + 7)
    return [monday.getTime(), next.getTime()]
  }
  if (key === 'month') {
    return [new Date(now.getFullYear(), now.getMonth(), 1).getTime(),
            new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime()]
  }
  return null
}

const view = computed(() => allFreeAds.value.map((c) => {
  const fullName = [c.surname, c.name, c.middle_name].filter(Boolean).join(' ') || c.name
  return {
    id: c.id, raw: c,
    displayId: String(c.id).padStart(7, '0'),
    name: fullName,
    job: nameByLocale(c.job_type) || '—',
    phone: c.phone_number || '',
    location: [nameByLocale(c.region), nameByLocale(c.district)].filter(Boolean).join(', ') || '—',
    salary: Number(c.expected_salary || 0),
    freeAdStatus: c.free_ad_status,
    freeAdPostedAt: c.free_ad_posted_at,
    freeAdApprovedAt: c.free_ad_approved_at,
    freeAdRejectionReason: c.free_ad_rejection_reason || '',
    daysSincePosted: daysSince(c.free_ad_posted_at),
    daysSinceApproved: daysSince(c.free_ad_approved_at),
    anketaTypeId: c.anketa_type_id || null,
    jobTypeId: c.job_type_id || null,
    postedAtMs: c.free_ad_posted_at ? new Date(c.free_ad_posted_at).getTime() : 0,
  }
}))

const filteredView = computed(() => {
  let list = view.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q))
  }
  if (anketaTypeFilter.value) list = list.filter((c) => c.anketaTypeId === anketaTypeFilter.value)
  if (jobTypeFilter.value) list = list.filter((c) => c.jobTypeId === jobTypeFilter.value)
  const range = dateRangeMs(dateFilter.value)
  if (range) list = list.filter((c) => c.postedAtMs >= range[0] && c.postedAtMs < range[1])
  return list
})

const columns = computed(() => [
  {
    key: 'rejected', title: 'Qayta murojat',
    items: filteredView.value.filter((c) => c.freeAdStatus === 'rejected'),
  },
  {
    key: 'pending', title: "+ Bepul e'lon",
    items: filteredView.value.filter((c) => c.freeAdStatus === 'pending'),
  },
  {
    key: 'approved_fresh', title: "Tasdiqlangan e'lon",
    items: filteredView.value.filter((c) => c.freeAdStatus === 'approved' && c.daysSinceApproved < 3),
  },
  {
    key: 'approved_old', title: "3 kun o'tdi",
    items: filteredView.value.filter((c) => c.freeAdStatus === 'approved' && c.daysSinceApproved >= 3),
  },
])

const anketaTypeOptions = computed(() => anketaTypes.value.map((t) => ({ id: t.id, name: nameByLocale(t) })))
const jobTypeOptions = computed(() => jobTypes.value.map((t) => ({ id: t.id, name: nameByLocale(t) })))

// Adding new free-ad: pick any anketa not posted yet
const eligibleAnketas = computed(() => allAnketas.value.filter((a) => a.free_ad_status === 'none'))

const loadAll = async () => {
  loading.value = true
  try {
    const [withAds, all] = await Promise.all([
      anketaService.all({ free_ad: true }),
      anketaService.all(),
    ])
    allFreeAds.value = Array.isArray(withAds) ? withAds : []
    allAnketas.value = Array.isArray(all) ? all : []
  } catch (e) {
    console.error('FreeAds load error', e)
  } finally {
    loading.value = false
  }
}

const loadLookups = async () => {
  try {
    const [at, jt] = await Promise.all([anketaTypesService.all(), jobTypesService.all()])
    anketaTypes.value = at || []
    jobTypes.value = jt || []
  } catch (e) { console.error(e) }
}

const postFreeAd = async (anketaId) => {
  try {
    await anketaService.postFreeAd(anketaId)
    showAddModal.value = false
    await loadAll()
  } catch (e) { console.error(e) }
}
const approveAd = async (item) => {
  try { await anketaService.approveFreeAd(item.id); await loadAll() } catch (e) { console.error(e) }
}
const openReject = (item) => { rejectTarget.value = item; rejectReason.value = ''; showRejectModal.value = true }
const closeReject = () => { showRejectModal.value = false; rejectTarget.value = null; rejectReason.value = '' }
const submitReject = async () => {
  if (!rejectTarget.value || rejectSaving.value) return
  if (!rejectReason.value.trim()) return
  rejectSaving.value = true
  try {
    await anketaService.rejectFreeAd(rejectTarget.value.id, rejectReason.value.trim())
    closeReject()
    await loadAll()
  } catch (e) { console.error(e) } finally { rejectSaving.value = false }
}
const resubmit = async (item) => {
  try { await anketaService.postFreeAd(item.id); await loadAll() } catch (e) { console.error(e) }
}

const resetFilters = () => {
  searchQuery.value = ''
  dateFilter.value = ''
  anketaTypeFilter.value = null
  jobTypeFilter.value = null
}

const statusBadge = (s) => {
  if (s === 'rejected') return 'bg-orange-100 text-orange-600 border-orange-200'
  if (s === 'pending') return 'bg-amber-100 text-amber-700 border-amber-200'
  if (s === 'approved') return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  return 'bg-slate-100 text-slate-600 border-slate-200'
}
const statusLabel = (s) => ({
  rejected: 'Tasdiqlanmadi', pending: 'Tasdiqlanmagan', approved: 'Tasdiqlandi',
})[s] || s

onMounted(() => { loadLookups(); loadAll() })
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-start justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-800">{{ $t('free_ads') }}</h1>
        <p class="text-xs text-slate-500 mt-1">Anketalarning bepul e'lon moderatsiyasi</p>
      </div>
      <button type="button" @click="showAddModal = true"
        class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold shadow-sm">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Bepul e'lon yuborish
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-slate-100 p-3 space-y-3">
      <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
        <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input v-model="searchQuery" placeholder="Ism yoki telefon raqamini qidiring..."
          class="flex-1 bg-transparent text-[13px] placeholder-slate-400 focus:outline-none" />
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        <BaseSelect v-model="dateFilter" :options="dateFilterOptions" labelKey="name" valueKey="value"
          placeholder="Vaqt" :clearable="false" size="sm" />
        <BaseSelect v-model="anketaTypeFilter" :options="anketaTypeOptions" placeholder="Anketa turi" size="sm" />
        <BaseSelect v-model="jobTypeFilter" :options="jobTypeOptions" placeholder="Kasb" size="sm" />
        <button type="button" @click="resetFilters"
          class="text-[12px] text-slate-500 hover:text-slate-700 font-medium flex items-center justify-center gap-1 border border-slate-200 rounded-lg">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Tozalash
        </button>
      </div>
    </div>

    <!-- Kanban -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <div v-for="col in columns" :key="col.key" class="bg-slate-50 rounded-xl p-2 space-y-2">
        <div class="flex items-center justify-between px-1">
          <h3 class="text-[12px] font-bold text-slate-700">{{ col.title }}</h3>
          <span class="text-[11px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
            {{ col.items.length }}
          </span>
        </div>

        <div v-if="col.items.length === 0" class="text-center text-[11px] text-slate-400 py-6">
          Bo'sh
        </div>

        <article v-for="c in col.items" :key="c.id"
          class="bg-white rounded-lg border border-slate-100 p-2.5 space-y-1.5 hover:shadow transition">
          <p class="text-[9px] text-slate-400 leading-none">id: {{ c.displayId }}</p>

          <div class="flex items-start gap-2">
            <div class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[12px] shrink-0">
              {{ c.name.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[12px] font-bold text-slate-800 truncate">{{ c.name }}</p>
              <p class="text-[10px] text-slate-500">{{ c.job }}</p>
            </div>
          </div>

          <div class="space-y-0.5 text-[11px] text-slate-600">
            <div class="flex items-center gap-1.5">
              <svg class="w-3 h-3 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span class="truncate">{{ c.phone }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <svg class="w-3 h-3 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span class="truncate">{{ c.location }}</span>
            </div>
            <div v-if="c.salary" class="font-bold text-slate-800 text-[11px]">{{ formatMoney(c.salary) }} so'm</div>
          </div>

          <p v-if="col.key === 'rejected' && c.freeAdRejectionReason"
            class="text-[10px] text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100">
            <span class="font-semibold">Sabab:</span> {{ c.freeAdRejectionReason }}
          </p>

          <div class="flex items-center justify-between pt-1.5 border-t border-slate-100">
            <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded border" :class="statusBadge(c.freeAdStatus)">
              {{ statusLabel(c.freeAdStatus) }}
            </span>

            <div class="flex items-center gap-1">
              <template v-if="col.key === 'pending'">
                <button @click="approveAd(c)" title="Tasdiqlash"
                  class="w-6 h-6 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                </button>
                <button @click="openReject(c)" title="Rad etish"
                  class="w-6 h-6 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 flex items-center justify-center">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </template>
              <template v-else-if="col.key === 'rejected'">
                <button @click="resubmit(c)" title="Qayta yuborish"
                  class="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 text-[10px] font-semibold">
                  Qayta yuborish
                </button>
              </template>
              <template v-else>
                <span class="text-[10px] text-slate-400">{{ c.daysSinceApproved }} kun</span>
              </template>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- Add modal: pick anketa -->
    <Transition name="modal">
      <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="showAddModal = false"></div>
        <div class="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg flex flex-col max-h-[85vh]">
          <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-base font-bold text-gray-800">Bepul e'lon uchun anketa tanlang</h3>
            <button @click="showAddModal = false" class="text-gray-400 hover:text-red-500 p-1">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div class="p-4 overflow-y-auto space-y-2">
            <p v-if="eligibleAnketas.length === 0" class="text-center text-slate-400 text-sm py-8">
              E'lon yuborish uchun bo'sh anketalar yo'q
            </p>
            <button v-for="a in eligibleAnketas" :key="a.id" @click="postFreeAd(a.id)"
              class="w-full text-left px-3 py-2 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[12px] shrink-0">
                {{ (a.surname || a.name || '—').charAt(0) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[13px] font-semibold text-slate-800 truncate">
                  {{ [a.surname, a.name, a.middle_name].filter(Boolean).join(' ') }}
                </p>
                <p class="text-[11px] text-slate-500 truncate">{{ a.phone_number }}</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Reject modal -->
    <Transition name="modal">
      <div v-if="showRejectModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeReject"></div>
        <div class="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md">
          <div class="px-5 py-4 border-b border-gray-100">
            <h3 class="text-base font-bold text-gray-800">E'lonni rad etish</h3>
            <p class="text-[12px] text-slate-500 truncate">{{ rejectTarget?.name }}</p>
          </div>
          <form @submit.prevent="submitReject" class="px-5 py-4 space-y-3">
            <textarea v-model="rejectReason" rows="3" required placeholder="Rad etish sababi..."
              class="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 outline-none resize-none"></textarea>
            <div class="flex justify-end gap-2">
              <button type="button" @click="closeReject" class="px-4 py-2 rounded-lg text-[13px] font-medium text-slate-700 border border-slate-200 hover:bg-slate-50">
                Bekor qilish
              </button>
              <button type="submit" :disabled="!rejectReason.trim() || rejectSaving"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50">
                {{ rejectSaving ? 'Saqlanmoqda...' : 'Rad etish' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>
