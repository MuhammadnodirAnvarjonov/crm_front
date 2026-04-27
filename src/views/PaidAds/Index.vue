<script setup>
import { ref, computed } from 'vue'
import BaseButton from '@/components/form/BaseButton.vue'
import { addIcon } from '@/components/icons/icon-temp'

// Top stat cards (same as Bepul page)
const statCards = [
  { label: "Qo'ng'iroqlar", today: 9, total: 16, icon: 'clock', iconBg: 'bg-orange-50', iconColor: 'text-orange-500' },
  { label: 'Anketalar', today: 9, total: 16, icon: 'doc', iconBg: 'bg-slate-50', iconColor: 'text-slate-500' },
  { label: "Bepul e'lon", today: 9, total: 16, icon: 'bot', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
  { label: "Pullik e'lon", today: 9, total: 16, icon: 'dollar', iconBg: 'bg-orange-50', iconColor: 'text-orange-500' },
  { label: 'Shartnomalar', today: 9, total: 16, icon: 'crown', iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
  { label: 'Agent', today: 9, total: 16, icon: 'building', iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
]

const searchQuery = ref('')
const topFilter = ref('Barchasi')
const topFilters = ['Barchasi', 'Bepul', 'Premium A', 'Premium B', 'Premium V']

// Employer card template
const baseEmployer = {
  id: '4654648', company: 'Grand Hotel', contact: 'Jamshid Rahimov',
  phone: '+998901111113', address: "Toshkent, Navoiy ko'chasi 28",
  position: 'Ofitsiant', positionCount: 2, tier: 'V',
  salary: 3500000, startDate: '15.01.2025', deadline: '25.01.2025',
  candidates: 1, matchTotal: 2,
}

const employers = ref(Array.from({ length: 8 }, () => ({ ...baseEmployer })))

const filtered = computed(() => {
  if (!searchQuery.value.trim()) return employers.value
  const q = searchQuery.value.toLowerCase()
  return employers.value.filter((e) =>
    e.company.toLowerCase().includes(q) || e.phone.includes(q),
  )
})

const formatMoney = (v) => v.toLocaleString('fr-FR').replace(/\s/g, ',')
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

    <!-- Filter + action row -->
    <div class="bg-white rounded-xl border border-slate-100 p-3 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
      <div class="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
        <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input v-model="searchQuery" placeholder="Kompaniya nomi yoki telefon raqamini qidiring..."
          class="flex-1 bg-transparent text-[13px] placeholder-slate-400 focus:outline-none" />
      </div>
      <div class="flex items-center gap-1 bg-slate-50 rounded-lg p-1 flex-wrap">
        <button v-for="tab in topFilters" :key="tab" @click="topFilter = tab"
          class="px-3 py-1.5 rounded-md text-[12px] font-medium transition"
          :class="topFilter === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'">
          {{ tab }}
        </button>
      </div>
      <BaseButton :label="$t('new_employer')" status="primary" size="sm">
        <template #icon>
          <addIcon size="w-4 h-4" />
        </template>
      </BaseButton>
    </div>

    <!-- Employer cards grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <div v-for="(e, i) in filtered" :key="i"
        class="bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition">
        <!-- Orange top strip -->
        <div class="h-1.5 bg-orange-400"></div>

        <div class="p-3 space-y-2">
          <!-- Top row: avatar + name + id -->
          <div class="flex items-start gap-2">
            <div
              class="w-10 h-10 rounded-full bg-amber-400 text-white flex items-center justify-center font-bold shrink-0">
              {{ e.company.charAt(0) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[14px] font-bold text-slate-800 truncate">{{ e.company }}</p>
              <p class="text-[11px] text-slate-500 truncate">{{ e.contact }}</p>
            </div>
            <p class="text-[10px] text-slate-400 whitespace-nowrap mt-1">id:000 {{ e.id }}</p>
          </div>

          <!-- Tier + action icons -->
          <div class="flex items-center justify-end gap-1.5 -mt-1">
            <span class="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold bg-purple-500 text-white">
              {{ e.tier }}
            </span>
            <button class="p-1 text-slate-500 hover:bg-slate-50 rounded">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </button>
            <button class="p-1 text-slate-500 hover:bg-slate-50 rounded">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>

          <!-- Info -->
          <div class="space-y-1.5 text-[12px] text-slate-700">
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>{{ e.phone }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span class="truncate">{{ e.address }}</span>
            </div>

            <!-- Position + Xodim biriktirish button -->
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                <span>{{ e.position }} - {{ e.positionCount }} ta</span>
              </div>
              <div class="flex flex-col items-end gap-1">
                <button
                  class="px-2.5 py-1 rounded-md text-[11px] font-medium text-slate-600 border border-slate-200 hover:bg-slate-50">
                  Xodim biriktirish
                </button>
                <button
                  class="w-5 h-5 rounded border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center">
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                    stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <span>{{ formatMoney(e.salary) }} so'm</span>
            </div>
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span>Sana: {{ e.startDate }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              <span>Muddat: {{ e.deadline }}</span>
            </div>
          </div>

          <!-- Multi-color progress bar -->
          <div class="flex h-1.5 rounded-full overflow-hidden bg-slate-100">
            <div class="bg-emerald-400" style="width: 45%"></div>
            <div class="bg-emerald-500" style="width: 20%"></div>
            <div class="bg-amber-400" style="width: 15%"></div>
            <div class="bg-orange-400" style="width: 10%"></div>
            <div class="bg-red-400" style="width: 10%"></div>
          </div>

          <!-- Footer: Mos nomzodlar -->
          <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              <span>Mos nomzodlar</span>
              <span
                class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                {{ e.candidates }}
              </span>
            </div>
            <span class="text-slate-400">{{ e.candidates }}/{{ e.matchTotal }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
