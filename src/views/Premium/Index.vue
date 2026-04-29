<script setup>
import { ref, computed, onMounted } from 'vue'
import BaseSelect from '@/components/form/BaseSelect.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import Form from './Form.vue'
import contractsService from '@/services/contracts.service'
import employersService from '@/services/employers.service'
import { closeIcon } from '@/components/icons/icon-temp'

const items = ref([])
const employers = ref([])
const loading = ref(false)

const searchQuery = ref('')
const tierFilter = ref(null)
const statusFilter = ref(null)
const employerFilter = ref(null)
const expiredFilter = ref(false)

const showModal = ref(false)
const editData = ref(null)
const showConfirm = ref(false)
const itemToDelete = ref(null)

const tierOptions = [
  { value: 'basic', name: 'Asosiy' },
  { value: 'premium_a', name: 'Premium A' },
  { value: 'premium_b', name: 'Premium B' },
  { value: 'premium_v', name: 'Premium V' },
]
const statusOptions = [
  { value: 'active', name: 'Faol' },
  { value: 'expired', name: "Muddati o'tgan" },
  { value: 'cancelled', name: 'Bekor qilingan' },
  { value: 'completed', name: 'Yakunlangan' },
]
const TIER_LABELS = {
  basic: 'Asosiy', premium_a: 'Premium A', premium_b: 'Premium B', premium_v: 'Premium V',
}
const STATUS_LABELS = {
  active: 'Faol', expired: "Muddati o'tgan", cancelled: 'Bekor qilingan', completed: 'Yakunlangan',
}

const employerOptions = computed(() => employers.value.map((e) => ({ id: e.id, name: e.name })))

const formatDate = (d) => {
  if (!d) return ''
  const dt = new Date(d); if (isNaN(dt.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()}`
}
const formatMoney = (v) => v ? Number(v).toLocaleString('fr-FR').replace(/\s/g, ',') : '0'

const view = computed(() => items.value.map((c) => ({
  id: c.id, raw: c,
  displayId: String(c.id).padStart(7, '0'),
  contractNumber: c.contract_number || `№${c.id}`,
  employerName: c.employer?.name || '—',
  employerPhone: c.employer?.phone || '',
  tier: c.tier, tierLabel: TIER_LABELS[c.tier] || c.tier,
  status: c.status, statusLabel: STATUS_LABELS[c.status] || c.status,
  startDate: formatDate(c.start_date),
  endDate: formatDate(c.end_date),
  totalAmount: c.total_amount ? Number(c.total_amount) : 0,
  isExpired: !!c.is_expired,
  daysLeft: c.days_left,
})))

const filtered = computed(() => {
  let list = view.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((c) => c.employerName.toLowerCase().includes(q) || c.contractNumber.toLowerCase().includes(q))
  }
  if (tierFilter.value) list = list.filter((c) => c.tier === tierFilter.value)
  if (statusFilter.value) list = list.filter((c) => c.status === statusFilter.value)
  if (employerFilter.value) list = list.filter((c) => c.raw.employer_id === employerFilter.value)
  if (expiredFilter.value) list = list.filter((c) => c.isExpired)
  return list
})

const tierBadge = (t) => {
  if (t === 'premium_v') return 'bg-purple-100 text-purple-700 border-purple-200'
  if (t === 'premium_b') return 'bg-indigo-100 text-indigo-700 border-indigo-200'
  if (t === 'premium_a') return 'bg-blue-100 text-blue-700 border-blue-200'
  return 'bg-slate-100 text-slate-700 border-slate-200'
}
const statusBadge = (s) => {
  if (s === 'active') return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (s === 'expired') return 'bg-rose-100 text-rose-700 border-rose-200'
  if (s === 'cancelled') return 'bg-slate-100 text-slate-700 border-slate-200'
  return 'bg-amber-100 text-amber-700 border-amber-200'
}

const loadAll = async () => {
  loading.value = true
  try { items.value = (await contractsService.all()) || [] }
  catch (e) { console.error(e); items.value = [] }
  finally { loading.value = false }
}
const loadEmployers = async () => {
  try { employers.value = (await employersService.all()) || [] } catch (e) { console.error(e) }
}

const openForm = (data = null) => { editData.value = data; showModal.value = true }
const closeForm = () => { showModal.value = false; editData.value = null }
const openEdit = (item) => openForm(item.raw)

const promptDelete = (item) => { itemToDelete.value = item; showConfirm.value = true }
const handleConfirmDelete = async () => {
  if (!itemToDelete.value) return
  try { await contractsService.delete(itemToDelete.value.id); showConfirm.value = false; itemToDelete.value = null; await loadAll() }
  catch (e) { console.error(e); showConfirm.value = false }
}

const resetFilters = () => {
  searchQuery.value = ''; tierFilter.value = null; statusFilter.value = null
  employerFilter.value = null; expiredFilter.value = false
}

onMounted(() => { loadEmployers(); loadAll() })
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-start justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-800">{{ $t('premium_contracts') }}</h1>
        <p class="text-xs text-slate-500 mt-1">Ish beruvchilar bilan tuzilgan shartnomalar</p>
        <p class="text-[11px] text-slate-400 mt-1">Jami: <span class="font-semibold text-slate-700">{{ filtered.length }}</span></p>
      </div>
      <button type="button" @click="openForm()"
        class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold shadow-sm">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Shartnoma qo'shish
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-slate-100 p-3 space-y-3">
      <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
        <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input v-model="searchQuery" placeholder="Kompaniya yoki shartnoma raqami..."
          class="flex-1 bg-transparent text-[13px] placeholder-slate-400 focus:outline-none" />
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        <BaseSelect v-model="tierFilter" :options="tierOptions" labelKey="name" valueKey="value" placeholder="Tarif" size="sm" />
        <BaseSelect v-model="statusFilter" :options="statusOptions" labelKey="name" valueKey="value" placeholder="Holati" size="sm" />
        <BaseSelect v-model="employerFilter" :options="employerOptions" labelKey="name" valueKey="id" placeholder="Ish beruvchi" size="sm" />
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
    <div v-if="!loading && filtered.length === 0" class="bg-white rounded-xl border border-slate-100 py-16 px-4 text-center">
      <p class="text-slate-500 text-sm">Shartnomalar topilmadi</p>
    </div>

    <!-- Cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <div v-for="c in filtered" :key="c.id" class="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition">
        <div class="h-1.5 bg-amber-400"></div>
        <div class="p-3 space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-[10px] text-slate-400">id: {{ c.displayId }}</p>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded border" :class="tierBadge(c.tier)">{{ c.tierLabel }}</span>
          </div>

          <div>
            <p class="text-[13px] font-bold text-slate-800 truncate">{{ c.employerName }}</p>
            <p class="text-[11px] text-slate-500">№ {{ c.contractNumber }}</p>
          </div>

          <div class="space-y-1 text-[12px] text-slate-700">
            <div v-if="c.startDate || c.endDate" class="flex items-center gap-1.5">
              <svg class="w-3 h-3 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span>{{ c.startDate || '—' }} → {{ c.endDate || '—' }}</span>
            </div>
            <div v-if="c.daysLeft != null" class="flex items-center gap-1.5"
              :class="c.isExpired ? 'text-rose-500' : c.daysLeft < 7 ? 'text-amber-600' : 'text-emerald-600'">
              <svg class="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" />
              </svg>
              <span v-if="c.isExpired">{{ Math.abs(c.daysLeft) }} kun oldin tugagan</span>
              <span v-else>{{ c.daysLeft }} kun qoldi</span>
            </div>
            <div v-if="c.totalAmount" class="flex items-center gap-1.5 font-bold">
              <svg class="w-3 h-3 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span>{{ formatMoney(c.totalAmount) }} so'm</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-slate-100">
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded border" :class="statusBadge(c.status)">
              {{ c.statusLabel }}
            </span>
            <div class="flex items-center gap-1">
              <button @click="openEdit(c)" title="Tahrirlash"
                class="w-7 h-7 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-100 flex items-center justify-center">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button @click="promptDelete(c)" title="O'chirish"
                class="w-7 h-7 rounded-md bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 flex items-center justify-center">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Transition name="modal">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeForm"></div>
        <div class="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl flex flex-col max-h-[90vh]">
          <div class="px-4 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
            <h3 class="text-lg font-bold text-gray-800">{{ editData?.id ? 'Shartnomani tahrirlash' : "Shartnoma qo'shish" }}</h3>
            <button class="text-gray-400 hover:text-red-500 p-1" @click="closeForm"><closeIcon class="w-6 h-6" /></button>
          </div>
          <div class="p-4 sm:p-6 overflow-y-auto">
            <Form :edit-data="editData" @close="closeForm" @saved="loadAll" />
          </div>
        </div>
      </div>
    </Transition>

    <ConfirmModal v-if="showConfirm" :show="showConfirm" title="Shartnomani o'chirish"
      :message="`${itemToDelete?.contractNumber || ''} ni o'chirishni tasdiqlaysizmi?`"
      confirm-text="Ha, o'chirish" cancel-text="Bekor qilish" type="danger" :duration="5"
      @confirm="handleConfirmDelete" @cancel="showConfirm = false" />
  </div>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
