<script setup>
import { ref, computed } from 'vue'

// Top stat cards
const statCards = [
  { label: 'Jami vazifalar', value: 10, icon: 'doc', bg: 'bg-slate-50', color: 'text-slate-600' },
  { label: 'Kutilmoqda', value: 7, icon: 'clock', bg: 'bg-amber-50', color: 'text-amber-500' },
  { label: 'Jarayonda', value: 2, icon: 'play', bg: 'bg-blue-50', color: 'text-blue-500' },
  { label: 'Bajarildi', value: 0, icon: 'check', bg: 'bg-emerald-50', color: 'text-emerald-500' },
  { label: "Muddati o'tdi", value: 1, icon: 'alert', bg: 'bg-rose-50', color: 'text-rose-500' },
]

// Task type filters
const activeType = ref('all')
const taskTypes = [
  { key: 'all', label: 'Barchasi', count: 10, color: 'blue' },
  { key: 'call', label: "Qo'ng'iroq", count: 2, color: 'sky' },
  { key: 'callback', label: 'Qayta aloqa', count: 2, color: 'teal' },
  { key: 'check', label: 'Tekshiruv', count: 1, color: 'pink' },
  { key: 'payment', label: "To'lov eslatmasi", count: 1, color: 'orange' },
  { key: 'sale', label: 'Sotuv', count: 1, color: 'amber' },
  { key: 'offer', label: 'Taklif', count: 1, color: 'purple' },
  { key: 'contract', label: 'Shartnoma', count: 1, color: 'emerald' },
  { key: 'ad', label: 'Reklama taklifi', count: 1, color: 'rose' },
]

const activeStatus = ref('Barchasi')
const statuses = ['Barchasi', 'Kutilmoqda', 'Jarayonda', 'Bajarildi', "Muddati o'tdi", "Aloqa yo'q"]

// Tasks
const tasks = ref([
  {
    type: 'call', typeLabel: "Qo'ng'iroq", iconColor: 'sky', icon: 'phone',
    title: 'Yangi ariza', desc: "Mijoz bilan bog'lanish - yangi ish ariza",
    person: 'Jasur Alimov', phone: '+998 90 123 45 67',
    timeEstimate: 'Tahminan 1 soat dan keyin', timeDate: '24 Yan, 18:33',
    status: 'Kutilmoqda', statusType: 'pending',
    action: 'start',
  },
  {
    type: 'callback', typeLabel: 'Qayta aloqa', iconColor: 'purple', icon: 'chat',
    title: "Qayta qo'ng'iroq", desc: "Qayta qo'ng'iroq qilish - mijoz javob bermadi",
    person: 'Nodira Rahimova', phone: '+998 91 234 56 78',
    timeEstimate: '1 kun dan keyin', timeDate: '25 Yan, 17:33',
    attempts: '1/3',
    status: 'Kutilmoqda', statusType: 'pending',
    action: 'start',
  },
  {
    type: 'check', typeLabel: 'Tekshiruv', iconColor: 'pink', icon: 'check',
    title: 'Suhbat tekshiruvi', desc: 'Xodim bordimi – aniqlash',
    person: 'Kamol Umarov', phone: '+998 93 345 67 89',
    timeEstimate: '1 kun dan keyin', timeDate: '25 Yan, 17:33',
    status: 'Jarayonda', statusType: 'progress',
    action: 'outcomes',
  },
  {
    type: 'payment', typeLabel: "To'lov eslatmasi", iconColor: 'orange', icon: 'dollar',
    title: "To'lov eslatmasi", desc: "To'lovni eslatish - muddat yaqinlashmoqda",
    person: 'Sherzod Toshev', phone: '+998 94 456 78 90',
    timeEstimate: '1 kun dan keyin', timeDate: '25 Yan, 17:33',
    status: 'Kutilmoqda', statusType: 'pending',
    action: 'start',
  },
  {
    type: 'sale', typeLabel: 'Sotuv', iconColor: 'amber', icon: 'cart',
    title: 'Pullik xizmat taklifi', desc: "Pullik xizmat taklif qil - 3 kun bepul e'lon",
    person: 'Malika Qodirova', phone: '+998 95 567 89 01',
    timeEstimate: 'tahminan 4 soat dan keyin', timeDate: '24 Yan, 21:33',
    status: 'Kutilmoqda', statusType: 'pending',
    action: 'start',
  },
  {
    type: 'offer', typeLabel: 'Taklif', iconColor: 'purple', icon: 'edit',
    title: 'Qayta taklif',
    desc: "Qayta kanalga bepul e'lon berish + pullik xizmatlami tushuntirish",
    person: 'Rustam Nazarov', phone: '+998 97 789 01 23',
    timeEstimate: '7 kun dan keyin', timeDate: '31 Yan, 17:33',
    status: 'Kutilmoqda', statusType: 'pending',
    action: 'start',
  },
  {
    type: 'ad', typeLabel: 'Reklama taklifi', iconColor: 'rose', icon: 'megaphone',
    title: 'Reklama taklifi', desc: 'Reklama xizmatini taklif qil - mos xodim topilmadi',
    person: 'Gulnora Abdullayeva', phone: '+998 99 890 12 34',
    timeEstimate: 'tahminan 2 soat dan keyin', timeDate: '24 Yan, 19:33',
    status: 'Kutilmoqda', statusType: 'pending',
    action: 'start',
  },
  {
    type: 'contract', typeLabel: 'Shartnoma', iconColor: 'emerald', icon: 'contract',
    title: 'Shartnoma yuborish',
    desc: 'Shartnoma yuborish / pullik xizmatni faollashtirish',
    person: 'Axmal Rasulov', phone: '+998 90 901 23 45',
    timeEstimate: 'bir minutdan kam oldin', timeDate: '24 Yan, 17:33',
    timeOverdue: true,
    status: 'Jarayonda', statusType: 'progress',
    action: 'done',
  },
  {
    type: 'callback', typeLabel: 'Qayta aloqa', iconColor: 'purple', icon: 'chat',
    title: 'Uchinchi urinish', desc: 'Oxirgi urinish - 3 marta javob bermadi',
    person: 'Sarvar Mahmudov', phone: '+998 91 012 34 56',
    timeEstimate: 'tahminan 2 soat oldin', timeDate: '24 Yan, 15:33',
    timeOverdue: true,
    attempts: '3/3',
    status: "Muddati o'tdi", statusType: 'overdue',
    action: 'none',
  },
])

// Filter
const filtered = computed(() => {
  let list = tasks.value
  if (activeType.value !== 'all') {
    list = list.filter((t) => t.type === activeType.value)
  }
  if (activeStatus.value !== 'Barchasi') {
    list = list.filter((t) => t.status === activeStatus.value)
  }
  return list
})

// Styles
const typeTabClass = (tab) => {
  if (activeType.value === tab.key) {
    const map = {
      blue: 'bg-blue-600 text-white', sky: 'bg-sky-500 text-white',
      teal: 'bg-teal-500 text-white', pink: 'bg-pink-500 text-white',
      orange: 'bg-orange-500 text-white', amber: 'bg-amber-500 text-white',
      purple: 'bg-purple-500 text-white', emerald: 'bg-emerald-500 text-white',
      rose: 'bg-rose-500 text-white',
    }
    return map[tab.color] || 'bg-blue-600 text-white'
  }
  const map = {
    blue: 'bg-blue-50 text-blue-600', sky: 'bg-sky-50 text-sky-600',
    teal: 'bg-teal-50 text-teal-600', pink: 'bg-pink-50 text-pink-600',
    orange: 'bg-orange-50 text-orange-600', amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600', emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
  }
  return map[tab.color] || 'bg-slate-50 text-slate-600'
}

const statusBadge = (type) => {
  const map = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    progress: 'bg-blue-100 text-blue-700 border-blue-200',
    overdue: 'bg-rose-100 text-rose-700 border-rose-200',
    done: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  }
  return map[type] || 'bg-slate-100 text-slate-600 border-slate-200'
}

const iconBg = (c) => {
  const map = {
    sky: 'bg-sky-500', purple: 'bg-purple-500', pink: 'bg-pink-500',
    orange: 'bg-orange-500', amber: 'bg-amber-500', emerald: 'bg-emerald-500',
    rose: 'bg-rose-500',
  }
  return map[c] || 'bg-slate-500'
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header with action -->
    <div class="flex justify-end">
      <button
        class="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold shadow-sm">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Yangi vazifa
      </button>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
      <div v-for="(s, i) in statCards" :key="i"
        class="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between">
        <div>
          <p class="text-[12px] font-semibold text-slate-500">{{ s.label }}</p>
          <p class="text-3xl font-bold mt-1" :class="s.color">{{ s.value }}</p>
        </div>
        <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="[s.bg, s.color]">
          <svg v-if="s.icon === 'doc'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <svg v-else-if="s.icon === 'clock'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 14" />
          </svg>
          <svg v-else-if="s.icon === 'play'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9" />
            <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
          </svg>
          <svg v-else-if="s.icon === 'check'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
          <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12" y2="13" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Filter panel -->
    <div class="bg-white rounded-xl border border-slate-100 p-4 space-y-4">
      <div>
        <p class="text-[12px] font-semibold text-slate-500 mb-2">Vazifa turi</p>
        <div class="flex flex-wrap gap-2">
          <button v-for="tab in taskTypes" :key="tab.key" @click="activeType = tab.key"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition"
            :class="typeTabClass(tab)">
            <span>{{ tab.label }}</span>
            <span class="text-[11px] font-bold px-1.5 rounded"
              :class="activeType === tab.key ? 'bg-white/25' : 'bg-white/60'">
              {{ tab.count }}
            </span>
          </button>
        </div>
      </div>

      <div>
        <p class="text-[12px] font-semibold text-slate-500 mb-2">Holat</p>
        <div class="flex flex-wrap gap-2">
          <button v-for="s in statuses" :key="s" @click="activeStatus = s"
            class="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition"
            :class="activeStatus === s ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'">
            {{ s }}
          </button>
        </div>
      </div>
    </div>

    <!-- Task cards grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <article v-for="(t, i) in filtered" :key="i"
        class="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition space-y-3">

        <!-- Header: icon + type/title + status -->
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-start gap-2 min-w-0">
            <div class="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
              :class="iconBg(t.iconColor)">
              <svg v-if="t.icon === 'phone'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <svg v-else-if="t.icon === 'chat'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <svg v-else-if="t.icon === 'check'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <svg v-else-if="t.icon === 'dollar'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <svg v-else-if="t.icon === 'cart'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <svg v-else-if="t.icon === 'edit'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <svg v-else-if="t.icon === 'megaphone'" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 11v3a4 4 0 0 0 4 4h1l4 4V7L8 11H3z" />
                <path d="M17 7a5 5 0 0 1 0 10" />
              </svg>
              <svg v-else-if="t.icon === 'contract'" class="w-4 h-4" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="8" y1="13" x2="16" y2="13" />
                <line x1="8" y1="17" x2="13" y2="17" />
              </svg>
            </div>
            <div class="min-w-0">
              <p class="text-[14px] font-bold text-slate-800 truncate">{{ t.typeLabel }}</p>
              <p class="text-[11px] text-slate-500 truncate">{{ t.title }}</p>
            </div>
          </div>
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0"
            :class="statusBadge(t.statusType)">
            {{ t.status }}
          </span>
        </div>

        <!-- Description -->
        <p class="text-[13px] text-slate-700">{{ t.desc }}</p>

        <!-- Person + phone -->
        <div class="flex items-center gap-4 text-[12px] text-slate-600 flex-wrap">
          <div class="flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 0 0-16 0" />
            </svg>
            <span>{{ t.person }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>{{ t.phone }}</span>
          </div>
        </div>

        <!-- Time -->
        <div class="flex items-center gap-4 text-[12px] flex-wrap">
          <div class="flex items-center gap-1.5" :class="t.timeOverdue ? 'text-rose-500' : 'text-slate-600'">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 14" />
            </svg>
            <span>{{ t.timeEstimate }}</span>
          </div>
          <span class="text-slate-400">•</span>
          <div class="flex items-center gap-1.5 text-slate-600">
            <svg class="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span>{{ t.timeDate }}</span>
          </div>
        </div>

        <!-- Attempts -->
        <p v-if="t.attempts" class="text-[12px] text-slate-500">Urinishlar: <span
            class="font-semibold text-slate-700">{{ t.attempts }}</span></p>

        <!-- Actions -->
        <div v-if="t.action === 'start'" class="pt-1">
          <button class="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold">
            Boshlash
          </button>
        </div>
        <div v-else-if="t.action === 'done'" class="pt-1">
          <button
            class="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[12px] font-semibold">
            Bajarildi
          </button>
        </div>
        <div v-else-if="t.action === 'outcomes'" class="pt-1 flex flex-wrap gap-2">
          <button
            class="px-3 py-1 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200">
            Bajarildi
          </button>
          <button
            class="px-3 py-1 rounded-md text-[11px] font-semibold bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200">
            Bordi
          </button>
          <button
            class="px-3 py-1 rounded-md text-[11px] font-semibold bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200">
            Bormadi
          </button>
          <button
            class="px-3 py-1 rounded-md text-[11px] font-semibold bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200">
            Kechiktirdi
          </button>
        </div>
      </article>

      <div v-if="!filtered.length" class="col-span-full text-center py-10 text-slate-400 text-sm">
        Vazifalar topilmadi
      </div>
    </div>
  </div>
</template>
