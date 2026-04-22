<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useUserStore } from '@/stores/user'

defineProps({ collapsed: Boolean, isMobile: Boolean })
const emit = defineEmits(['toggle-sidebar', 'toggle-mobile'])

const userStore = useUserStore()

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
</script>

<template>
  <header class="h-[64px] bg-white border-b border-slate-200 flex items-center justify-between px-4 gap-3">
    <!-- Left: toggle + operator info + schedule -->
    <div class="flex items-center gap-4 min-w-0">
      <button class="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
        @click="isMobile ? emit('toggle-mobile') : emit('toggle-sidebar')">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <!-- Operator info -->
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
          {{ userInitial }}
        </div>
        <div class="flex flex-col leading-tight">
          <span class="text-[14px] font-bold text-slate-800">
            {{ userStore.user?.user_name || 'Gulsanamxon' }}
          </span>
          <span class="text-[11px] text-slate-400">
            {{ userStore.user?.role?.name || 'Operator' }}
          </span>
        </div>
      </div>

      <!-- Schedule -->
      <div class="hidden lg:grid grid-cols-2 gap-x-3 text-[11px] text-slate-500 border-l border-slate-200 pl-4">
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
        <div class="flex items-center gap-1 text-emerald-600">
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 14" />
          </svg>
          <span>09:12</span>
        </div>
        <div class="flex items-center gap-1 text-slate-500">
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
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <span>Reklama</span>
        <span class="bg-white/30 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">9</span>
      </button>

      <button
        class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-white text-[12px] font-semibold shadow-sm transition">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <span>Premium</span>
        <span class="bg-white/30 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">9</span>
      </button>
    </div>

    <!-- Right: current time + theme + notification -->
    <div class="flex items-center gap-2">
      <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200">
        <svg class="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 14" />
        </svg>
        <span class="text-[13px] font-semibold text-slate-700">{{ currentTime }}</span>
        <span class="text-[11px] text-slate-400">Abet</span>
      </div>
      <button class="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" title="Tema">
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      </button>
      <button class="relative p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
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
