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

const searchQuery = ref('')
const typeFilter = ref('Barchasi')
const statusFilter = ref('Barchasi')
const activeSummary = ref('pending')

// Summary cards
const summaryCards = [
  { key: 'pending', label: 'Kutilmoqda', value: 3, icon: 'clock', color: 'amber' },
  { key: 'seekers', label: 'Ish izlovchilar', value: 3, icon: 'search', color: 'blue' },
  { key: 'employers', label: 'Ish beruvchilar', value: 2, icon: 'briefcase', color: 'purple' },
  { key: 'ads', label: "Bepul e'lonlar", value: 1, icon: 'tag', color: 'slate' },
]

const agents = ref([
  {
    agent: 'Abdullayev Komil', agentPhone: '+998901234567',
    type: 'employer', typeLabel: "Ish beruvchi",
    infoTitle: 'Domino Pizza', infoSub: 'Fasfood',
    phone: '+998901234567',
    dateDay: '16.01.2026', dateTime: '08:51',
    imageCount: 5,
    status: 'Tasdiqlandi', statusType: 'approved',
  },
  {
    agent: 'Rahimov Bobur', agentPhone: '+998901234567',
    type: 'ad', typeLabel: "Bepul e'lon",
    infoTitle: "Yangi Do'kon", infoSub: 'Kassir-sotuvchi',
    phone: '+998901234567',
    dateDay: '16.01.2026', dateTime: '06:37',
    imageCount: 5,
    status: 'Kutilmoqda', statusType: 'pending',
  },
])

const filteredAgents = computed(() => {
  let list = agents.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((a) =>
      a.agent.toLowerCase().includes(q) || a.phone.includes(q) || a.infoTitle.toLowerCase().includes(q),
    )
  }
  return list
})

const statusBadge = (type) => {
  const map = {
    approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    rejected: 'bg-rose-100 text-rose-700 border-rose-200',
  }
  return map[type] || 'bg-slate-100 text-slate-600 border-slate-200'
}

const summaryStyle = (c, active) => {
  if (active) {
    const map = {
      amber: 'bg-amber-50 border-amber-200',
      blue: 'bg-blue-50 border-blue-200',
      purple: 'bg-purple-50 border-purple-200',
      slate: 'bg-slate-50 border-slate-200',
    }
    return map[c] || 'bg-slate-50'
  }
  return 'bg-white border-slate-100 hover:bg-slate-50'
}

const summaryIconClass = (c) => {
  const map = {
    amber: 'text-amber-500',
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    slate: 'text-slate-500',
  }
  return map[c] || 'text-slate-500'
}

const approve = (idx) => {
  agents.value[idx].status = 'Tasdiqlandi'
  agents.value[idx].statusType = 'approved'
}
const reject = (idx) => {
  agents.value[idx].status = 'Rad etildi'
  agents.value[idx].statusType = 'rejected'
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
            </svg>
            <svg v-else-if="s.icon === 'bot'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="8" width="16" height="12" rx="2" />
              <path d="M12 8V4M8 4h8" />
              <circle cx="9" cy="13" r="1" />
              <circle cx="15" cy="13" r="1" />
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
      <select v-model="typeFilter"
        class="w-full sm:w-[180px] px-3 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-700 appearance-none focus:outline-none focus:border-blue-400">
        <option>Barchasi</option>
        <option>Ish beruvchi</option>
        <option>Ish izlovchi</option>
        <option>Bepul e'lon</option>
      </select>
      <select v-model="statusFilter"
        class="w-full sm:w-[180px] px-3 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-700 appearance-none focus:outline-none focus:border-blue-400">
        <option>Barchasi</option>
        <option>Tasdiqlandi</option>
        <option>Kutilmoqda</option>
        <option>Rad etildi</option>
      </select>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <button v-for="c in summaryCards" :key="c.key" @click="activeSummary = c.key"
        class="rounded-xl border-2 p-4 flex items-center justify-between text-left transition"
        :class="summaryStyle(c.color, activeSummary === c.key)">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm"
            :class="summaryIconClass(c.color)">
            <svg v-if="c.icon === 'clock'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 14" />
            </svg>
            <svg v-else-if="c.icon === 'search'" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <svg v-else-if="c.icon === 'briefcase'" class="w-5 h-5" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <circle cx="7" cy="7" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <div>
            <p class="text-[13px] text-slate-600">{{ c.label }}</p>
            <p class="text-2xl font-bold" :class="summaryIconClass(c.color)">{{ c.value }}</p>
          </div>
        </div>
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-[12px] font-semibold text-slate-500 border-b border-slate-100">
              <th class="px-4 py-3">Agent</th>
              <th class="px-4 py-3">Turi</th>
              <th class="px-4 py-3">Ma'lumot</th>
              <th class="px-4 py-3">Telefon</th>
              <th class="px-4 py-3">Sana</th>
              <th class="px-4 py-3">Rasm</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Amallar</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(a, i) in filteredAgents" :key="i"
              class="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50">
              <td class="px-4 py-4">
                <p class="text-[13px] font-semibold text-slate-800">{{ a.agent }}</p>
                <p class="text-[11px] text-slate-400">{{ a.agentPhone }}</p>
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-1.5 text-[13px] text-slate-700">
                  <svg v-if="a.type === 'employer'" class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M20 21a8 8 0 0 0-16 0" />
                  </svg>
                  <svg v-else class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>{{ a.typeLabel }}</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <p class="text-[13px] font-semibold text-slate-800">{{ a.infoTitle }}</p>
                <p class="text-[11px] text-slate-500">{{ a.infoSub }}</p>
              </td>
              <td class="px-4 py-4">
                <a :href="'tel:' + a.phone" class="text-[13px] text-blue-500 hover:underline">{{ a.phone }}</a>
              </td>
              <td class="px-4 py-4">
                <p class="text-[13px] text-slate-700">{{ a.dateDay }}</p>
                <p class="text-[11px] text-slate-400">{{ a.dateTime }}</p>
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-1">
                  <div
                    class="w-12 h-9 rounded bg-gradient-to-br from-slate-200 to-slate-400 flex items-center justify-center text-slate-500 overflow-hidden">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <span class="text-[11px] font-semibold text-slate-600">+{{ a.imageCount }}</span>
                </div>
              </td>
              <td class="px-4 py-4">
                <span class="text-[11px] font-semibold px-2.5 py-1 rounded-md border" :class="statusBadge(a.statusType)">
                  {{ a.status }}
                </span>
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-1.5">
                  <button class="p-1.5 rounded text-slate-500 hover:bg-slate-100" title="Ko'rish">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <template v-if="a.statusType === 'pending'">
                    <button @click="approve(i)" class="p-1.5 rounded text-emerald-500 hover:bg-emerald-50"
                      title="Tasdiqlash">
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                        stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                    <button @click="reject(i)" class="p-1.5 rounded text-rose-500 hover:bg-rose-50" title="Rad etish">
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                        stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-if="!filteredAgents.length">
              <td colspan="8" class="px-4 py-10 text-center text-sm text-slate-400">
                Agentlar topilmadi
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
