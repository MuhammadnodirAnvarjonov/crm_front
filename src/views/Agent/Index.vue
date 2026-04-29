<script setup>
import { ref, computed, onMounted } from 'vue'
import BaseSelect from '@/components/form/BaseSelect.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import agentSubmissionsService from '@/services/agentSubmissions.service'

const items = ref([])
const loading = ref(false)

const searchQuery = ref('')
const typeFilter = ref(null)
const statusFilter = ref(null)

const showRejectModal = ref(false)
const rejectTarget = ref(null)
const rejectReason = ref('')
const rejectSaving = ref(false)
const showConfirm = ref(false)
const itemToDelete = ref(null)

const TYPE_LABELS = { employer: 'Ish beruvchi', seeker: 'Ish izlovchi', ad: "Bepul e'lon" }
const STATUS_LABELS = { pending: 'Kutilmoqda', approved: 'Tasdiqlandi', rejected: 'Rad etildi' }

const typeOptions = Object.entries(TYPE_LABELS).map(([value, name]) => ({ value, name }))
const statusOptions = Object.entries(STATUS_LABELS).map(([value, name]) => ({ value, name }))

const formatDateTime = (d) => {
  if (!d) return ''
  const dt = new Date(d); if (isNaN(dt.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

const view = computed(() => items.value.map((s) => ({
  id: s.id, raw: s,
  agent: s.agent_name, agentPhone: s.agent_phone || '',
  type: s.type, typeLabel: TYPE_LABELS[s.type] || s.type,
  infoTitle: s.target_title || '—', infoSub: s.target_subtitle || '',
  phone: s.target_phone || '',
  imageCount: s.image_count || 0,
  status: s.status, statusLabel: STATUS_LABELS[s.status] || s.status,
  rejectionReason: s.rejection_reason || '',
  createdAt: formatDateTime(s.createdAt),
  comment: s.comment || '',
})))

const filtered = computed(() => {
  let list = view.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((a) => a.agent.toLowerCase().includes(q) ||
      a.phone.includes(q) || a.infoTitle.toLowerCase().includes(q))
  }
  if (typeFilter.value) list = list.filter((a) => a.type === typeFilter.value)
  if (statusFilter.value) list = list.filter((a) => a.status === statusFilter.value)
  return list
})

const counts = computed(() => ({
  pending: view.value.filter((a) => a.status === 'pending').length,
  seekers: view.value.filter((a) => a.type === 'seeker').length,
  employers: view.value.filter((a) => a.type === 'employer').length,
  ads: view.value.filter((a) => a.type === 'ad').length,
}))

const statusBadge = (s) => {
  if (s === 'approved') return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (s === 'rejected') return 'bg-rose-100 text-rose-700 border-rose-200'
  return 'bg-amber-100 text-amber-700 border-amber-200'
}
const typeBadge = (t) => {
  if (t === 'employer') return 'bg-purple-50 text-purple-700 border-purple-200'
  if (t === 'seeker') return 'bg-blue-50 text-blue-700 border-blue-200'
  return 'bg-slate-50 text-slate-700 border-slate-200'
}

const loadAll = async () => {
  loading.value = true
  try { items.value = (await agentSubmissionsService.all()) || [] }
  catch (e) { console.error(e); items.value = [] }
  finally { loading.value = false }
}

const approve = async (item) => {
  try { await agentSubmissionsService.approve(item.id); await loadAll() } catch (e) { console.error(e) }
}
const openReject = (item) => { rejectTarget.value = item; rejectReason.value = ''; showRejectModal.value = true }
const closeReject = () => { showRejectModal.value = false; rejectTarget.value = null; rejectReason.value = '' }
const submitReject = async () => {
  if (!rejectTarget.value || rejectSaving.value || !rejectReason.value.trim()) return
  rejectSaving.value = true
  try {
    await agentSubmissionsService.reject(rejectTarget.value.id, rejectReason.value.trim())
    closeReject(); await loadAll()
  } catch (e) { console.error(e) } finally { rejectSaving.value = false }
}

const promptDelete = (item) => { itemToDelete.value = item; showConfirm.value = true }
const handleConfirmDelete = async () => {
  if (!itemToDelete.value) return
  try { await agentSubmissionsService.delete(itemToDelete.value.id); showConfirm.value = false; itemToDelete.value = null; await loadAll() }
  catch (e) { console.error(e); showConfirm.value = false }
}

const resetFilters = () => { searchQuery.value = ''; typeFilter.value = null; statusFilter.value = null }

onMounted(loadAll)
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-start justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-800">{{ $t('agent') }}</h1>
        <p class="text-xs text-slate-500 mt-1">Agentlar tomonidan yuborilgan murojaatlar</p>
      </div>
    </div>

    <!-- Summary -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <div class="bg-white rounded-lg border border-slate-100 p-3">
        <p class="text-[11px] text-slate-500">Kutilmoqda</p>
        <p class="text-lg font-bold text-amber-600">{{ counts.pending }}</p>
      </div>
      <div class="bg-white rounded-lg border border-slate-100 p-3">
        <p class="text-[11px] text-slate-500">Ish izlovchilar</p>
        <p class="text-lg font-bold text-blue-600">{{ counts.seekers }}</p>
      </div>
      <div class="bg-white rounded-lg border border-slate-100 p-3">
        <p class="text-[11px] text-slate-500">Ish beruvchilar</p>
        <p class="text-lg font-bold text-purple-600">{{ counts.employers }}</p>
      </div>
      <div class="bg-white rounded-lg border border-slate-100 p-3">
        <p class="text-[11px] text-slate-500">Bepul e'lonlar</p>
        <p class="text-lg font-bold text-slate-700">{{ counts.ads }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-slate-100 p-3 space-y-3">
      <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
        <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input v-model="searchQuery" placeholder="Agent ismi, telefon yoki sarlavha..."
          class="flex-1 bg-transparent text-[13px] placeholder-slate-400 focus:outline-none" />
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
        <BaseSelect v-model="typeFilter" :options="typeOptions" labelKey="name" valueKey="value" placeholder="Tur" size="sm" />
        <BaseSelect v-model="statusFilter" :options="statusOptions" labelKey="name" valueKey="value" placeholder="Holati" size="sm" />
        <button type="button" @click="resetFilters"
          class="text-[12px] text-slate-500 hover:text-slate-700 font-medium flex items-center justify-center gap-1 border border-slate-200 rounded-lg">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          Tozalash
        </button>
      </div>
    </div>

    <div v-if="!loading && filtered.length === 0" class="bg-white rounded-xl border border-slate-100 py-16 text-center">
      <p class="text-slate-500 text-sm">Murojaatlar topilmadi</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      <div v-for="a in filtered" :key="a.id"
        class="bg-white rounded-xl border border-slate-100 p-3 space-y-2 hover:shadow-md transition">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded border" :class="typeBadge(a.type)">{{ a.typeLabel }}</span>
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded border" :class="statusBadge(a.status)">{{ a.statusLabel }}</span>
        </div>

        <div class="border-l-2 border-blue-300 pl-2">
          <p class="text-[10px] uppercase text-slate-400">Agent</p>
          <p class="text-[13px] font-bold text-slate-800">{{ a.agent }}</p>
          <p v-if="a.agentPhone" class="text-[11px] text-slate-500">{{ a.agentPhone }}</p>
        </div>

        <div class="border-l-2 border-emerald-300 pl-2">
          <p class="text-[10px] uppercase text-slate-400">Murojaat</p>
          <p class="text-[13px] font-bold text-slate-800 truncate">{{ a.infoTitle }}</p>
          <p v-if="a.infoSub" class="text-[11px] text-slate-500 truncate">{{ a.infoSub }}</p>
          <p v-if="a.phone" class="text-[11px] text-slate-600">{{ a.phone }}</p>
        </div>

        <div class="text-[11px] text-slate-500">{{ a.createdAt }} · Rasm: {{ a.imageCount }}</div>

        <p v-if="a.rejectionReason" class="text-[10px] text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100">
          <span class="font-semibold">Sabab:</span> {{ a.rejectionReason }}
        </p>

        <div class="flex items-center justify-between pt-2 border-t border-slate-100">
          <div class="flex items-center gap-1">
            <template v-if="a.status === 'pending'">
              <button @click="approve(a)"
                class="px-2 py-1 rounded-md text-[10px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700">
                Tasdiqlash
              </button>
              <button @click="openReject(a)"
                class="px-2 py-1 rounded-md text-[10px] font-semibold text-white bg-rose-600 hover:bg-rose-700">
                Rad etish
              </button>
            </template>
          </div>
          <button @click="promptDelete(a)" title="O'chirish"
            class="w-7 h-7 rounded-md bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 flex items-center justify-center">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Reject modal -->
    <Transition name="modal">
      <div v-if="showRejectModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeReject"></div>
        <div class="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md">
          <div class="px-5 py-4 border-b border-gray-100">
            <h3 class="text-base font-bold text-gray-800">Murojaatni rad etish</h3>
            <p class="text-[12px] text-slate-500 truncate">{{ rejectTarget?.agent }} - {{ rejectTarget?.infoTitle }}</p>
          </div>
          <form @submit.prevent="submitReject" class="px-5 py-4 space-y-3">
            <textarea v-model="rejectReason" rows="3" required placeholder="Rad etish sababi..."
              class="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 outline-none resize-none"></textarea>
            <div class="flex justify-end gap-2">
              <button type="button" @click="closeReject" class="px-4 py-2 rounded-lg text-[13px] font-medium text-slate-700 border border-slate-200 hover:bg-slate-50">Bekor qilish</button>
              <button type="submit" :disabled="!rejectReason.trim() || rejectSaving"
                class="px-4 py-2 rounded-lg text-[13px] font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50">
                {{ rejectSaving ? 'Saqlanmoqda...' : 'Rad etish' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <ConfirmModal v-if="showConfirm" :show="showConfirm" title="Murojaatni o'chirish"
      :message="`${itemToDelete?.agent || ''} murojaatini o'chirishni tasdiqlaysizmi?`"
      confirm-text="Ha, o'chirish" cancel-text="Bekor qilish" type="danger" :duration="5"
      @confirm="handleConfirmDelete" @cancel="showConfirm = false" />
  </div>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
