<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import BaseSelect from '@/components/form/BaseSelect.vue'
import adCampaignsService from '@/services/adCampaigns.service'

const userStore = useUserStore()
const operatorName = computed(() => userStore.user?.user_name || '—')

const items = ref([])
const loading = ref(false)
const saving = ref(false)
const searchQuery = ref('')
const adTypeFilter = ref(null)
const statusFilter = ref(null)

const form = ref({
  advertiser_name: '',
  phone: '',
  address: '',
  start_date: '',
  end_date: '',
  ad_type: 'image',
  channels: [],
  status: 'draft',
  comment: '',
})

const adTypes = [
  { value: 'text', name: 'Text Reklama', sub: 'Oddiy matnli reklama', price: 0 },
  { value: 'image', name: 'Rasm Reklama', sub: 'Rasm bilan reklama', price: 50000 },
  { value: 'video', name: 'Video Reklama', sub: 'Video bilan reklama', price: 150000 },
]

const statusOptions = [
  { value: 'draft', name: 'Loyiha' },
  { value: 'active', name: 'Faol' },
  { value: 'completed', name: 'Yakunlangan' },
  { value: 'cancelled', name: 'Bekor qilingan' },
]

const channels = ref([
  { key: 'tashkent', label: 'Toshkent ish bor', members: 150000, selected: true },
  { key: 'bukhara', label: 'Buxoro ish bor', members: 110000, selected: false },
  { key: 'navoi', label: 'Navoiy ish bor', members: 100000, selected: false },
  { key: 'fergana', label: "Farg'ona ish bor", members: 130000, selected: false },
  { key: 'samarkand', label: 'Samarqand ish bor', members: 120000, selected: false },
  { key: 'khorezm', label: 'Xorazm ish bor', members: 120000, selected: false },
  { key: 'jizzakh', label: 'Jizzax ish bor', members: 120000, selected: false },
  { key: 'syrdarya', label: 'Sirdaryo ish bor', members: 120000, selected: false },
  { key: 'namangan', label: 'Namangan ish bor', members: 130000, selected: false },
  { key: 'kashkadarya', label: 'Qashqadaryo ish bor', members: 120000, selected: false },
])

const selectedAdType = computed(() => adTypes.find((t) => t.value === form.value.ad_type))
const selectedChannels = computed(() => channels.value.filter((c) => c.selected))

const days = computed(() => {
  if (!form.value.start_date || !form.value.end_date) return 0
  const s = new Date(form.value.start_date), e = new Date(form.value.end_date)
  const diff = Math.round((e - s) / 86400000)
  return diff >= 0 ? diff + 1 : 0
})

const totalCost = computed(() => {
  const d = days.value || 0
  const n = selectedChannels.value.length || 0
  return d * n * (selectedAdType.value?.price || 0)
})

const totalReach = computed(() => selectedChannels.value.reduce((s, c) => s + c.members, 0))

const formatMoney = (v) => Number(v || 0).toLocaleString('fr-FR').replace(/\s/g, ',')
const formatDateTime = (d) => {
  if (!d) return ''
  const dt = new Date(d); if (isNaN(dt.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()}`
}

const submit = async () => {
  if (saving.value) return
  if (!form.value.advertiser_name) return alert('Reklamachi ismini kiriting')
  saving.value = true
  try {
    await adCampaignsService.create({
      ...form.value,
      channels: selectedChannels.value.map((c) => c.key),
      days: days.value,
      total_cost: totalCost.value,
      operator_user_id: userStore.user?.id || null,
    })
    form.value = { advertiser_name: '', phone: '', address: '', start_date: '', end_date: '', ad_type: 'image', channels: [], status: 'draft', comment: '' }
    channels.value.forEach((c) => (c.selected = false))
    await loadAll()
  } catch (e) { console.error(e) } finally { saving.value = false }
}

const view = computed(() => items.value.map((c) => ({
  id: c.id, raw: c,
  name: c.advertiser_name,
  phone: c.phone || '',
  adType: c.ad_type,
  adTypeLabel: adTypes.find((t) => t.value === c.ad_type)?.name || c.ad_type,
  channelCount: Array.isArray(c.channels) ? c.channels.length : 0,
  startDate: formatDateTime(c.start_date),
  endDate: formatDateTime(c.end_date),
  days: c.days,
  totalCost: Number(c.total_cost || 0),
  status: c.status,
  statusLabel: statusOptions.find((s) => s.value === c.status)?.name || c.status,
})))

const filtered = computed(() => {
  let list = view.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q))
  }
  if (adTypeFilter.value) list = list.filter((c) => c.adType === adTypeFilter.value)
  if (statusFilter.value) list = list.filter((c) => c.status === statusFilter.value)
  return list
})

const statusBadge = (s) => {
  if (s === 'active') return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (s === 'completed') return 'bg-slate-100 text-slate-700 border-slate-200'
  if (s === 'cancelled') return 'bg-rose-100 text-rose-700 border-rose-200'
  return 'bg-amber-100 text-amber-700 border-amber-200'
}

const loadAll = async () => {
  loading.value = true
  try { items.value = (await adCampaignsService.all()) || [] }
  catch (e) { console.error(e); items.value = [] }
  finally { loading.value = false }
}

onMounted(loadAll)
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-xl sm:text-2xl font-bold text-slate-800">{{ $t('advertising_title') }}</h1>
      <p class="text-xs text-slate-500 mt-1">{{ $t('advertising_subtitle') }}</p>
      <p class="text-[11px] text-slate-400 mt-1">Operator: <span class="font-semibold">{{ operatorName }}</span></p>
    </div>

    <!-- Form card -->
    <div class="bg-white rounded-xl border border-slate-100 p-4 space-y-4">
      <h3 class="font-bold text-slate-800">Yangi reklama</h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="text-sm font-semibold text-gray-700">Reklamachi ismi</label>
          <input v-model="form.advertiser_name" type="text" required placeholder="Ism Familiya"
            class="w-full mt-1.5 px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div>
          <label class="text-sm font-semibold text-gray-700">Telefon</label>
          <input v-model="form.phone" type="text" placeholder="+998..."
            class="w-full mt-1.5 px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div class="md:col-span-2">
          <label class="text-sm font-semibold text-gray-700">Manzil</label>
          <input v-model="form.address" type="text"
            class="w-full mt-1.5 px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div>
          <label class="text-sm font-semibold text-gray-700">Boshlanish</label>
          <input v-model="form.start_date" type="date"
            class="w-full mt-1.5 px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div>
          <label class="text-sm font-semibold text-gray-700">Tugash</label>
          <input v-model="form.end_date" type="date"
            class="w-full mt-1.5 px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
        </div>
      </div>

      <!-- Ad types -->
      <div>
        <p class="text-sm font-semibold text-gray-700 mb-2">Reklama turi</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <label v-for="t in adTypes" :key="t.value"
            class="flex items-start gap-2 px-3 py-2.5 rounded-lg border cursor-pointer transition"
            :class="form.ad_type === t.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'">
            <input type="radio" :value="t.value" v-model="form.ad_type" class="mt-1" />
            <div class="flex-1 min-w-0">
              <p class="text-[13px] font-bold text-slate-800">{{ t.name }}</p>
              <p class="text-[11px] text-slate-500">{{ t.sub }}</p>
              <p class="text-[11px] font-semibold text-blue-600">+{{ formatMoney(t.price) }} so'm/kun</p>
            </div>
          </label>
        </div>
      </div>

      <!-- Channels -->
      <div>
        <p class="text-sm font-semibold text-gray-700 mb-2">Kanallar (tanlanmagan: {{ selectedChannels.length }})</p>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <label v-for="c in channels" :key="c.key"
            class="flex items-start gap-2 px-2 py-2 rounded-lg border cursor-pointer text-[12px] transition"
            :class="c.selected ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'">
            <input type="checkbox" v-model="c.selected" class="mt-0.5" />
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-slate-800 truncate">{{ c.label }}</p>
              <p class="text-[10px] text-slate-500">{{ formatMoney(c.members) }} a'zo</p>
            </div>
          </label>
        </div>
      </div>

      <!-- Summary -->
      <div class="bg-slate-50 rounded-lg p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div>
          <p class="text-[11px] text-slate-500">Kunlar</p>
          <p class="font-bold text-slate-800">{{ days }}</p>
        </div>
        <div>
          <p class="text-[11px] text-slate-500">Kanallar</p>
          <p class="font-bold text-slate-800">{{ selectedChannels.length }}</p>
        </div>
        <div>
          <p class="text-[11px] text-slate-500">Qamrov</p>
          <p class="font-bold text-slate-800">{{ formatMoney(totalReach) }}</p>
        </div>
        <div>
          <p class="text-[11px] text-slate-500">Jami</p>
          <p class="font-bold text-blue-600">{{ formatMoney(totalCost) }} so'm</p>
        </div>
      </div>

      <button @click="submit" :disabled="saving"
        class="w-full px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[14px] disabled:opacity-50">
        {{ saving ? 'Saqlanmoqda...' : 'Reklamani saqlash' }}
      </button>
    </div>

    <!-- List -->
    <div class="bg-white rounded-xl border border-slate-100 p-3 space-y-3">
      <h3 class="font-bold text-slate-800">Saqlangan reklamalar</h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 lg:col-span-2">
          <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input v-model="searchQuery" placeholder="Reklamachi ismi yoki telefon..."
            class="flex-1 bg-transparent text-[13px] placeholder-slate-400 focus:outline-none" />
        </div>
        <BaseSelect v-model="adTypeFilter" :options="adTypes" labelKey="name" valueKey="value" placeholder="Reklama turi" size="sm" />
        <BaseSelect v-model="statusFilter" :options="statusOptions" labelKey="name" valueKey="value" placeholder="Holati" size="sm" />
      </div>

      <div v-if="!loading && filtered.length === 0" class="text-center text-slate-400 text-sm py-8">
        Reklamalar topilmadi
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <div v-for="c in filtered" :key="c.id" class="bg-slate-50 rounded-lg border border-slate-100 p-3 space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">{{ c.adTypeLabel }}</span>
            <span class="text-[10px] font-semibold px-2 py-0.5 rounded border" :class="statusBadge(c.status)">{{ c.statusLabel }}</span>
          </div>
          <p class="text-[13px] font-bold text-slate-800 truncate">{{ c.name }}</p>
          <p class="text-[11px] text-slate-500">{{ c.phone }}</p>
          <div class="text-[11px] text-slate-600">{{ c.startDate || '—' }} → {{ c.endDate || '—' }} · {{ c.days }} kun</div>
          <div class="text-[11px] text-slate-600">Kanallar: <span class="font-semibold">{{ c.channelCount }}</span></div>
          <p class="text-[12px] font-bold text-blue-600">{{ formatMoney(c.totalCost) }} so'm</p>
        </div>
      </div>
    </div>
  </div>
</template>
