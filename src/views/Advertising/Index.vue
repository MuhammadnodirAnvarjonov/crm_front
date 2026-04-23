<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const operatorName = computed(() => userStore.user?.user_name || 'Gulsanamxon')

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
const categoryFilter = ref('Barchasi')

// Form state
const form = ref({
  name: '',
  phone: '',
  address: '',
  startDate: '',
  endDate: '',
  adType: 'image',
})

const adTypes = [
  { key: 'text', label: 'Text Reklama', sub: "oddiy matnli reklama", price: 0, priceLabel: "+0 so'm" },
  { key: 'image', label: 'Rasm Reklama', sub: 'Rasm bilan reklama', price: 50000, priceLabel: "+50,000 so'm/kun" },
  { key: 'video', label: 'Video Reklama', sub: 'Video bilan reklama', price: 150000, priceLabel: "+150,000 so'm/kun" },
]

const channels = ref([
  { key: 'tashkent', label: 'Toshkent ish bor', sub: "150,000 a'zo", selected: true },
  { key: 'bukhara', label: 'Buxoro ish bor', sub: "110,000 a'zo", selected: false },
  { key: 'navoi', label: 'Navoiy ish bor', sub: "100,000 a'zo", selected: true },
  { key: 'fergana', label: "Farg'ona ish bor", sub: "130,000 a'zo", selected: true },
  { key: 'samarkand', label: 'Samarqand ish bor', sub: "120,000 a'zo", selected: false },
  { key: 'khorezm', label: 'Xorazm ish bor', sub: "120,000 a'zo", selected: false },
  { key: 'jizzakh', label: 'Jizzax ish bor', sub: "120,000 a'zo", selected: false },
  { key: 'syrdarya', label: 'Sirdaryo ish bor', sub: "120,000 a'zo", selected: false },
  { key: 'namangan', label: 'Namangan ish bor', sub: "130,000 a'zo", selected: false },
  { key: 'kashkadarya', label: 'Qashqadaryo ish bor', sub: "120,000 a'zo", selected: false },
])

const selectedAdType = computed(() => adTypes.find((t) => t.key === form.value.adType))
const selectedChannels = computed(() => channels.value.filter((c) => c.selected))

const days = computed(() => {
  if (!form.value.startDate || !form.value.endDate) return 0
  const start = new Date(form.value.startDate)
  const end = new Date(form.value.endDate)
  const diff = Math.round((end - start) / (1000 * 60 * 60 * 24))
  return diff >= 0 ? diff + 1 : 0
})

const totalCost = computed(() => {
  const d = days.value || 8
  const nChannels = selectedChannels.value.length || 1
  return d * nChannels * (selectedAdType.value?.price || 0)
})

const formatMoney = (v) => v.toLocaleString('fr-FR').replace(/\s/g, ',')

const submit = () => {
  alert('Reklama tasdiqlandi! Jami: ' + formatMoney(totalCost.value) + " so'm")
}
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

    <!-- Filter bar -->
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
        </select>
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
      <div class="relative w-full sm:w-[160px]">
        <select v-model="categoryFilter"
          class="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-700 appearance-none focus:outline-none focus:border-blue-400">
          <option>Barchasi</option>
          <option>Text</option>
          <option>Rasm</option>
          <option>Video</option>
        </select>
      </div>
    </div>

    <!-- Main form card -->
    <form @submit.prevent="submit"
      class="bg-white rounded-2xl border border-slate-100 max-w-4xl mx-auto w-full p-6 md:p-8 relative">
      <!-- Operator top right -->
      <p class="absolute top-4 right-6 text-[12px] text-slate-500">
        Operator: <span class="text-blue-500 font-semibold">{{ operatorName }}</span>
      </p>

      <!-- Title -->
      <div class="text-center mb-6">
        <h1 class="text-3xl font-bold text-slate-800">Reklama berish</h1>
        <p class="text-sm text-slate-500 mt-1">Reklama ma'lumotlarini to'ldiring va narxni avtomatik hisoblang</p>
      </div>

      <!-- Row 1: 3 fields -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700 mb-1.5">
            <svg class="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 0 0-16 0" />
            </svg>
            Reklamachi ismi
          </label>
          <input v-model="form.name" type="text" placeholder="Ism Familyangizni kiriting"
            class="w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] placeholder-slate-400 focus:outline-none focus:border-blue-400" />
        </div>
        <div>
          <label class="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700 mb-1.5">
            <svg class="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Telefon raqam
          </label>
          <input v-model="form.phone" type="tel" placeholder="Telefon raqamingiz"
            class="w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] placeholder-slate-400 focus:outline-none focus:border-blue-400" />
        </div>
        <div>
          <label class="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700 mb-1.5">
            <svg class="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Manzil
          </label>
          <input v-model="form.address" type="text" placeholder="Shahr, Kocha"
            class="w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] placeholder-slate-400 focus:outline-none focus:border-blue-400" />
        </div>
      </div>

      <!-- Dates -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label class="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700 mb-1.5">
            <svg class="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Boshlanish sanasi
          </label>
          <input v-model="form.startDate" type="date"
            class="w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] focus:outline-none focus:border-blue-400" />
        </div>
        <div>
          <label class="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700 mb-1.5">
            <svg class="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            Tugash sanasi
          </label>
          <input v-model="form.endDate" type="date"
            class="w-full px-3 py-2 rounded-lg border border-slate-200 text-[13px] focus:outline-none focus:border-blue-400" />
        </div>
      </div>

      <!-- Ad type selection -->
      <div class="mb-6">
        <p class="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700 mb-3">
          <svg class="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          Reklama turini tanlang
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label v-for="t in adTypes" :key="t.key"
            class="relative block rounded-xl border-2 p-5 text-center cursor-pointer transition"
            :class="form.adType === t.key ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'">
            <input type="radio" v-model="form.adType" :value="t.key" class="absolute top-3 right-3" />
            <div class="flex justify-center mb-3 text-slate-600">
              <svg v-if="t.key === 'text'" class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="4 7 4 4 20 4 20 7" />
                <line x1="9" y1="20" x2="15" y2="20" />
                <line x1="12" y1="4" x2="12" y2="20" />
              </svg>
              <svg v-else-if="t.key === 'image'" class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <svg v-else class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" />
              </svg>
            </div>
            <p class="text-[14px] font-bold text-slate-800">{{ t.label }}</p>
            <p class="text-[11px] text-emerald-600 font-semibold mt-1">{{ t.priceLabel }}</p>
            <p class="text-[11px] text-slate-500 mt-1">{{ t.sub }}</p>
          </label>
        </div>
      </div>

      <!-- Channels -->
      <div class="mb-6">
        <p class="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700 mb-3">
          <svg class="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Kanallarni tanlang
        </p>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
          <label v-for="c in channels" :key="c.key"
            class="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition text-[11px]"
            :class="c.selected ? 'border-blue-400 bg-blue-50 text-slate-800' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'">
            <input type="checkbox" v-model="c.selected" class="shrink-0" />
            <div class="min-w-0">
              <p class="font-semibold truncate">{{ c.label }}</p>
              <p class="text-[10px] text-slate-500 truncate">{{ c.sub }}</p>
            </div>
          </label>
        </div>
      </div>

      <!-- Total cost -->
      <div class="rounded-xl bg-amber-100 border border-amber-200 p-5 text-center mb-4">
        <p class="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-slate-700 mb-1">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          Jami to'lov
        </p>
        <p class="text-3xl font-bold text-red-500">{{ formatMoney(totalCost) }} so'm</p>
        <p class="text-[11px] text-slate-600 mt-1">
          {{ days || 8 }} kun × {{ selectedChannels.length || 1 }} ta kanal × {{ selectedAdType?.label }}
          ({{ selectedAdType?.priceLabel }})
        </p>
      </div>

      <!-- Submit button -->
      <button type="submit"
        class="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[14px] shadow-sm transition">
        Reklamani Tasdiqlash
      </button>
    </form>
  </div>
</template>
