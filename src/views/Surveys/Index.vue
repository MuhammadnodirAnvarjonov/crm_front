<script setup>
import { ref, computed } from 'vue'

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

// Candidates / applications
const candidates = ref([
  {
    name: 'Alisher Umarov', age: 25, gender: 'Erkak', category: 'A', categoryColor: 'amber',
    phone: '+998901234567', job: 'Dasturchi', location: 'Toshkent, Yunusobod',
    salary: 8000000, status: 'Qabul qilindi', statusType: 'qabul', suhbat: null, avatarColor: 'bg-blue-500',
  },
  {
    name: 'Dilnoza Karimova', age: 28, gender: 'Ayol', category: 'V', categoryColor: 'purple',
    phone: '+998901234568', job: 'Buxgalter', location: 'Toshkent, Chilonzor',
    salary: 6000000, status: 'Suhbatga belgilandi', statusType: 'suhbat',
    suhbat: '20.01.2025 10:00', avatarColor: 'bg-blue-500',
  },
  {
    name: 'Bobur Rahimov', age: 30, gender: 'Erkak', category: 'A', categoryColor: 'amber',
    phone: '+998901234569', job: 'Menejer', location: "Toshkent, Mirzo Ulug'bek",
    salary: 10000000, status: '3 kunlik sinov', statusType: 'sinov', suhbat: null,
    avatarColor: 'bg-blue-500',
  },
  {
    name: 'Jasur Normatov', age: 29, gender: 'Erkak', category: 'B', categoryColor: 'orange',
    phone: '+998901234573', job: 'Haydovchi', location: 'Toshkent, Bektemir',
    salary: 5500000, status: 'Suhbatga belgilandi', statusType: 'suhbat',
    suhbat: '21.01.2025 09:00', avatarColor: 'bg-blue-500',
  },
  {
    name: 'Malika Azimova', age: 23, gender: 'Ayol', category: 'A', categoryColor: 'amber',
    phone: '+998901234570', job: 'Dizayner', location: 'Toshkent, Sergeli',
    salary: 5000000, status: 'Anketa olindi', statusType: 'anketa', suhbat: null,
    avatarColor: 'bg-blue-500',
  },
  {
    name: 'Sardor Toshmatov', age: 27, gender: 'Erkak', category: 'A', categoryColor: 'amber',
    phone: '+998901234571', job: 'Sotuvchi', location: 'Toshkent, Yakkasaroy',
    salary: 4500000, status: 'Suhbatga bordi', statusType: 'suhbat-done',
    suhbat: '18.01.2025 14:00', avatarColor: 'bg-blue-500',
  },
  {
    name: 'Nigora Sultonova', age: 26, gender: 'Ayol', category: 'V', categoryColor: 'purple',
    phone: '+998901234572', job: 'Marketing mutaxassisi', location: 'Toshkent, Olmazor',
    salary: 7000000, status: 'Ish qidirilmoqda', statusType: 'searching', suhbat: null,
    avatarColor: 'bg-blue-500',
  },
  {
    name: 'Feruza Abdullayeva', age: 24, gender: 'Ayol', category: 'B', categoryColor: 'orange',
    phone: '+998901234574', job: 'HR menejer', location: 'Toshkent, Shayxontohur',
    salary: 6500000, status: 'Anketa olindi', statusType: 'anketa', suhbat: null,
    avatarColor: 'bg-blue-500',
  },
])

const filtered = computed(() => {
  let list = candidates.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q))
  }
  return list
})

const formatMoney = (v) => v.toLocaleString('fr-FR').replace(/\s/g, ',')

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

const categoryBg = (color) => {
  const map = {
    amber: 'bg-amber-400 text-white',
    purple: 'bg-purple-500 text-white',
    orange: 'bg-orange-400 text-white',
  }
  return map[color] || 'bg-slate-400 text-white'
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

      <div class="relative w-full sm:w-[160px]">
        <select v-model="categoryFilter"
          class="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-700 appearance-none focus:outline-none focus:border-blue-400">
          <option>Barchasi</option>
          <option>Kategoriya A</option>
          <option>Kategoriya B</option>
          <option>Kategoriya V</option>
        </select>
        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Cards grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <article v-for="(c, i) in filtered" :key="i"
        class="bg-white rounded-xl border border-slate-100 p-3 relative hover:shadow-md transition space-y-2">

        <!-- Top row: stars + download button -->
        <div class="flex items-center justify-between">
          <div class="flex gap-0.5">
            <svg v-for="n in 3" :key="n" class="w-3 h-3 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
            </svg>
          </div>
          <button class="w-7 h-7 rounded-lg bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>

        <!-- Avatar + Name + Category -->
        <div class="flex items-start gap-2">
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
            :class="c.avatarColor">
            {{ c.name.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[14px] font-bold text-slate-800 truncate">{{ c.name }}</p>
            <p class="text-[11px] text-slate-500">{{ c.age }} yosh</p>
          </div>
          <div class="flex flex-col items-end gap-0.5">
            <span class="text-[9px] text-slate-400">Kategoriya</span>
            <span class="w-7 h-7 rounded-md flex items-center justify-center text-[13px] font-bold"
              :class="categoryBg(c.categoryColor)">
              {{ c.category }}
            </span>
          </div>
        </div>

        <!-- Gender -->
        <div class="flex items-center gap-1.5 text-[12px] text-slate-600">
          <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M20 21a8 8 0 0 0-16 0" />
          </svg>
          <span>{{ c.gender }}</span>
        </div>

        <!-- Phone + Anketani ko'rish -->
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5 text-[12px] text-slate-600 min-w-0">
            <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span class="truncate">{{ c.phone }}</span>
          </div>
          <button
            class="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 whitespace-nowrap">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Anketani ko'rish
          </button>
        </div>

        <!-- Job -->
        <div class="flex items-center gap-1.5 text-[12px] text-slate-600">
          <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          <span>{{ c.job }}</span>
        </div>

        <!-- Location + send icon -->
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5 text-[12px] text-slate-600 min-w-0">
            <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span class="truncate">{{ c.location }}</span>
          </div>
          <button class="text-blue-500 hover:text-blue-600 shrink-0">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        <!-- Suhbat row + salary -->
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

        <!-- Footer: status + biriktirish button -->
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
  </div>
</template>
