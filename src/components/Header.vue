<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useUiStore } from '@/stores/ui'

defineProps({ collapsed: Boolean, isMobile: Boolean })
const emit = defineEmits(['toggle-sidebar', 'toggle-mobile'])

const userStore = useUserStore()
const uiStore = useUiStore()

const currentTime = ref('')
let timer = null

const updateTime = () => {
  const d = new Date()
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  currentTime.value = `${h}:${m}`
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 30000)
})
onBeforeUnmount(() => clearInterval(timer))

const userInitial = computed(
  () => userStore.user?.user_name?.charAt(0).toUpperCase() || 'G',
)

const toggleTheme = () => uiStore.toggleTheme()
</script>

<template>
  <header
    class="h-[64px] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-3 sm:px-4 gap-2 sm:gap-3 transition-colors">
    <!-- Left: toggle + operator info + schedule -->
    <div class="flex items-center gap-2 sm:gap-4 min-w-0">
      <button
        class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition shrink-0"
        @click="isMobile ? emit('toggle-mobile') : emit('toggle-sidebar')" :title="collapsed ? 'Menyuni ochish' : 'Menyuni yopish'">
        <svg class="w-5 h-5 transition-transform duration-300" :class="collapsed ? 'rotate-180' : ''" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      <!-- Operator info -->
      <div class="flex items-center gap-2 sm:gap-2.5 min-w-0">
        <div
          class="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 font-bold text-sm shrink-0">
          {{ userInitial }}
        </div>
        <div class="hidden sm:flex flex-col leading-tight min-w-0">
          <span class="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">
            {{ userStore.user?.user_name || 'Gulsanamxon' }}
          </span>
          <span class="text-[11px] text-slate-400 dark:text-slate-500">
            {{ userStore.user?.role?.name || 'Operator' }}
          </span>
        </div>
      </div>

      <!-- Schedule -->
      <div
        class="hidden lg:grid grid-cols-2 gap-x-3 text-[11px] text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-4">
        <div class="flex items-center gap-1">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 14" />
          </svg>
          <span>09:00</span>
        </div>
        <div class="flex items-center gap-1">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 14" />
          </svg>
          <span>18:00</span>
        </div>
        <div class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 14" />
          </svg>
          <span>09:12</span>
        </div>
        <div class="flex items-center gap-1">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 14" />
          </svg>
          <span>17:57</span>
        </div>
      </div>
    </div>

    <!-- Middle: stat buttons -->
    <div class="hidden md:flex items-center gap-2">
      <button
        class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[12px] font-semibold shadow-sm transition">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>Bepul e'lon</span>
        <span class="bg-white/25 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">100</span>
      </button>

      <button
        class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[12px] font-semibold shadow-sm transition">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>Pullik e'lon</span>
        <span class="bg-white/25 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">100</span>
      </button>

      <button
        class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-white text-[12px] font-semibold shadow-sm transition">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <span>Anketalar soni</span>
        <span class="bg-white/30 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">9</span>
      </button>

      <button
        class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-white text-[12px] font-semibold shadow-sm transition">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 11v3a4 4 0 0 0 4 4h1l4 4V7L8 11H3z" />
          <path d="M17 7a5 5 0 0 1 0 10" />
        </svg>
        <span>Reklama</span>
        <span class="bg-white/30 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">9</span>
      </button>

      <button
        class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-white text-[12px] font-semibold shadow-sm transition">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
        </svg>
        <span>Premium</span>
        <span class="bg-white/30 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">9</span>
      </button>
    </div>

    <!-- Right: current time + theme toggle + notification -->
    <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
      <div
        class="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
        <svg class="w-4 h-4 text-slate-500 dark:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2">
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 14" />
        </svg>
        <span class="text-[13px] font-semibold">{{ currentTime }}</span>
        <span class="hidden sm:inline text-[11px] text-slate-400 dark:text-slate-500">Abet</span>
      </div>

      <!-- Theme toggle -->
      <button @click="toggleTheme"
        class="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        :title="uiStore.dark ? 'Yorug\' tema' : 'Qorong\'i tema'">
        <!-- Sun (shown in dark mode, click → light) -->
        <svg v-if="uiStore.dark" class="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
        <!-- Moon (shown in light mode, click → dark) -->
        <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>

      <!-- Notifications -->
      <button
        class="relative p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span
          class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-white text-[10px] font-bold flex items-center justify-center">
          3
        </span>
      </button>
    </div>
  </header>
</template>
