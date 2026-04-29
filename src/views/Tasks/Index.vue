<script setup>
import { ref, computed, onMounted } from 'vue'
import BaseSelect from '@/components/form/BaseSelect.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import Form from './Form.vue'
import tasksService from '@/services/tasks.service'
import usersService from '@/services/users.service'
import { closeIcon } from '@/components/icons/icon-temp'

const items = ref([])
const users = ref([])
const loading = ref(false)

const searchQuery = ref('')
const typeFilter = ref(null)
const statusFilter = ref(null)
const userFilter = ref(null)
const overdueFilter = ref(false)

const showModal = ref(false)
const editData = ref(null)
const showConfirm = ref(false)
const itemToDelete = ref(null)

const TYPE_LABELS = {
  call: "Qo'ng'iroq", callback: 'Qayta aloqa', check: 'Tekshiruv',
  payment: "To'lov eslatmasi", sale: 'Sotuv', offer: 'Taklif',
  contract: 'Shartnoma', ad: 'Reklama taklifi', other: 'Boshqa',
}
const STATUS_LABELS = {
  pending: 'Kutilmoqda', progress: 'Jarayonda', done: 'Bajarildi',
  overdue: "Muddati o'tdi", no_contact: 'Aloqa yo\'q',
}
const TYPE_COLORS = {
  call: 'sky', callback: 'purple', check: 'pink', payment: 'orange',
  sale: 'amber', offer: 'indigo', contract: 'emerald', ad: 'rose', other: 'slate',
}

const typeOptions = Object.entries(TYPE_LABELS).map(([value, name]) => ({ value, name }))
const statusOptions = Object.entries(STATUS_LABELS).map(([value, name]) => ({ value, name }))
const userOptions = computed(() => users.value.map((u) => ({
  id: u.id,
  name: u.user_name || `User ${u.id}`,
})))

const formatDateTime = (d) => {
  if (!d) return ''
  const dt = new Date(d); if (isNaN(dt.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

const view = computed(() => items.value.map((t) => {
  const isOverdue = !!t.is_overdue && t.status !== 'done'
  const status = isOverdue && t.status !== 'done' ? 'overdue' : t.status
  return {
    id: t.id, raw: t,
    type: t.type, typeLabel: TYPE_LABELS[t.type] || t.type, typeColor: TYPE_COLORS[t.type] || 'slate',
    title: t.title, description: t.description || '',
    personName: t.person_name || '—',
    phone: t.phone || '',
    dueAt: formatDateTime(t.due_at),
    dueAtMs: t.due_at ? new Date(t.due_at).getTime() : 0,
    status, statusLabel: STATUS_LABELS[status] || status,
    attempts: t.attempts, maxAttempts: t.max_attempts,
    assignedUser: t.assigned_user ? (t.assigned_user.user_name || `User ${t.assigned_user.id}`) : '—',
    isOverdue,
  }
}))

const filtered = computed(() => {
  let list = view.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((t) => t.title.toLowerCase().includes(q) ||
      t.personName.toLowerCase().includes(q) || t.phone.includes(q))
  }
  if (typeFilter.value) list = list.filter((t) => t.type === typeFilter.value)
  if (statusFilter.value) list = list.filter((t) => t.status === statusFilter.value)
  if (userFilter.value) list = list.filter((t) => t.raw.assigned_user_id === userFilter.value)
  if (overdueFilter.value) list = list.filter((t) => t.isOverdue)
  return list
})

const counts = computed(() => ({
  total: view.value.length,
  pending: view.value.filter((t) => t.status === 'pending').length,
  progress: view.value.filter((t) => t.status === 'progress').length,
  done: view.value.filter((t) => t.status === 'done').length,
  overdue: view.value.filter((t) => t.isOverdue).length,
}))

const statusBadge = (s) => {
  if (s === 'done') return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (s === 'progress') return 'bg-blue-100 text-blue-700 border-blue-200'
  if (s === 'overdue') return 'bg-rose-100 text-rose-700 border-rose-200'
  if (s === 'no_contact') return 'bg-slate-100 text-slate-700 border-slate-200'
  return 'bg-amber-100 text-amber-700 border-amber-200'
}
const typeBadge = (color) => ({
  sky: 'bg-sky-50 text-sky-600 border-sky-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
  pink: 'bg-pink-50 text-pink-600 border-pink-200',
  orange: 'bg-orange-50 text-orange-600 border-orange-200',
  amber: 'bg-amber-50 text-amber-600 border-amber-200',
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  rose: 'bg-rose-50 text-rose-600 border-rose-200',
  slate: 'bg-slate-50 text-slate-600 border-slate-200',
})[color] || 'bg-slate-50 text-slate-600 border-slate-200'

const loadAll = async () => {
  loading.value = true
  try { items.value = (await tasksService.all()) || [] }
  catch (e) { console.error(e); items.value = [] }
  finally { loading.value = false }
}
const loadUsers = async () => {
  try {
    const data = await usersService.all()
    users.value = Array.isArray(data) ? data : (data?.rows || [])
  } catch (e) { console.error(e) }
}

const openForm = (data = null) => { editData.value = data; showModal.value = true }
const closeForm = () => { showModal.value = false; editData.value = null }
const openEdit = (item) => openForm(item.raw)

const promptDelete = (item) => { itemToDelete.value = item; showConfirm.value = true }
const handleConfirmDelete = async () => {
  if (!itemToDelete.value) return
  try { await tasksService.delete(itemToDelete.value.id); showConfirm.value = false; itemToDelete.value = null; await loadAll() }
  catch (e) { console.error(e); showConfirm.value = false }
}

const startTask = async (item) => {
  try { await tasksService.start(item.id); await loadAll() } catch (e) { console.error(e) }
}
const completeTask = async (item) => {
  const outcome = window.prompt('Natija (ixtiyoriy):', '')
  try { await tasksService.complete(item.id, outcome || null); await loadAll() } catch (e) { console.error(e) }
}

const resetFilters = () => {
  searchQuery.value = ''; typeFilter.value = null; statusFilter.value = null
  userFilter.value = null; overdueFilter.value = false
}

onMounted(() => { loadUsers(); loadAll() })
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-start justify-between gap-3 flex-wrap">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-800">{{ $t('tasks') }}</h1>
        <p class="text-xs text-slate-500 mt-1">Vazifalar va eslatmalar</p>
      </div>
      <button type="button" @click="openForm()"
        class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold shadow-sm">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Yangi vazifa
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
      <div class="bg-white rounded-lg border border-slate-100 p-3">
        <p class="text-[11px] text-slate-500">Jami</p>
        <p class="text-lg font-bold text-slate-800">{{ counts.total }}</p>
      </div>
      <div class="bg-white rounded-lg border border-slate-100 p-3">
        <p class="text-[11px] text-slate-500">Kutilmoqda</p>
        <p class="text-lg font-bold text-amber-600">{{ counts.pending }}</p>
      </div>
      <div class="bg-white rounded-lg border border-slate-100 p-3">
        <p class="text-[11px] text-slate-500">Jarayonda</p>
        <p class="text-lg font-bold text-blue-600">{{ counts.progress }}</p>
      </div>
      <div class="bg-white rounded-lg border border-slate-100 p-3">
        <p class="text-[11px] text-slate-500">Bajarildi</p>
        <p class="text-lg font-bold text-emerald-600">{{ counts.done }}</p>
      </div>
      <div class="bg-white rounded-lg border border-slate-100 p-3">
        <p class="text-[11px] text-slate-500">Muddati o'tdi</p>
        <p class="text-lg font-bold text-rose-600">{{ counts.overdue }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl border border-slate-100 p-3 space-y-3">
      <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
        <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input v-model="searchQuery" placeholder="Sarlavha, ism yoki telefon..."
          class="flex-1 bg-transparent text-[13px] placeholder-slate-400 focus:outline-none" />
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        <BaseSelect v-model="typeFilter" :options="typeOptions" labelKey="name" valueKey="value" placeholder="Vazifa turi" size="sm" />
        <BaseSelect v-model="statusFilter" :options="statusOptions" labelKey="name" valueKey="value" placeholder="Holati" size="sm" />
        <BaseSelect v-model="userFilter" :options="userOptions" labelKey="name" valueKey="id" placeholder="Mas'ul xodim" size="sm" />
        <label class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] cursor-pointer hover:bg-slate-50">
          <input type="checkbox" v-model="overdueFilter" class="w-4 h-4 rounded border-slate-300 text-rose-500" />
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
      <p class="text-slate-500 text-sm">Vazifalar topilmadi</p>
    </div>

    <!-- Cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <div v-for="t in filtered" :key="t.id"
        class="bg-white rounded-xl border border-slate-100 p-3 space-y-2 hover:shadow-md transition"
        :class="t.isOverdue ? 'border-rose-300' : ''">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded border" :class="typeBadge(t.typeColor)">
            {{ t.typeLabel }}
          </span>
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded border" :class="statusBadge(t.status)">
            {{ t.statusLabel }}
          </span>
        </div>

        <div>
          <p class="text-[13px] font-bold text-slate-800 leading-tight">{{ t.title }}</p>
          <p v-if="t.description" class="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{{ t.description }}</p>
        </div>

        <div class="space-y-1 text-[12px] text-slate-700">
          <div v-if="t.personName !== '—'" class="flex items-center gap-1.5">
            <svg class="w-3 h-3 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 0 0-16 0" />
            </svg>
            <span class="truncate">{{ t.personName }}</span>
          </div>
          <div v-if="t.phone" class="flex items-center gap-1.5">
            <svg class="w-3 h-3 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>{{ t.phone }}</span>
          </div>
          <div v-if="t.dueAt" class="flex items-center gap-1.5" :class="t.isOverdue ? 'text-rose-500' : ''">
            <svg class="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" />
            </svg>
            <span>{{ t.dueAt }}</span>
          </div>
          <div v-if="t.assignedUser !== '—'" class="text-[11px] text-slate-500">
            Mas'ul: <span class="font-semibold text-slate-700">{{ t.assignedUser }}</span>
          </div>
          <div v-if="t.type === 'callback' && t.maxAttempts > 1" class="text-[11px] text-slate-500">
            Urinishlar: <span class="font-semibold">{{ t.attempts }}/{{ t.maxAttempts }}</span>
          </div>
        </div>

        <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div class="flex items-center gap-1">
            <button v-if="t.status === 'pending'" @click="startTask(t)" title="Boshlash"
              class="px-2 py-1 rounded-md text-[10px] font-semibold text-white bg-blue-600 hover:bg-blue-700">
              Boshlash
            </button>
            <button v-else-if="t.status === 'progress'" @click="completeTask(t)" title="Yakunlash"
              class="px-2 py-1 rounded-md text-[10px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700">
              Yakunlash
            </button>
            <span v-else-if="t.status === 'done'" class="text-[11px] text-emerald-600 font-semibold">✓ Bajarildi</span>
          </div>
          <div class="flex items-center gap-1">
            <button @click="openEdit(t)" title="Tahrirlash"
              class="w-7 h-7 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-100 flex items-center justify-center">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button @click="promptDelete(t)" title="O'chirish"
              class="w-7 h-7 rounded-md bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 flex items-center justify-center">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <Transition name="modal">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeForm"></div>
        <div class="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl flex flex-col max-h-[90vh]">
          <div class="px-4 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
            <h3 class="text-lg font-bold text-gray-800">{{ editData?.id ? 'Vazifani tahrirlash' : 'Yangi vazifa' }}</h3>
            <button class="text-gray-400 hover:text-red-500 p-1" @click="closeForm"><closeIcon class="w-6 h-6" /></button>
          </div>
          <div class="p-4 sm:p-6 overflow-y-auto">
            <Form :edit-data="editData" @close="closeForm" @saved="loadAll" />
          </div>
        </div>
      </div>
    </Transition>

    <ConfirmModal v-if="showConfirm" :show="showConfirm" title="Vazifani o'chirish"
      :message="`'${itemToDelete?.title || ''}' vazifasini o'chirishni tasdiqlaysizmi?`"
      confirm-text="Ha, o'chirish" cancel-text="Bekor qilish" type="danger" :duration="5"
      @confirm="handleConfirmDelete" @cancel="showConfirm = false" />
  </div>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
