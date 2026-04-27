<script setup>
import { ref, onMounted, onBeforeUnmount, computed, inject, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { useUiStore } from '@/stores/ui'

defineProps({ collapsed: Boolean, isMobile: Boolean })
const emit = defineEmits(['toggle-sidebar', 'toggle-mobile'])

const userStore = useUserStore()
const uiStore = useUiStore()
const fileUrl = inject('fileUrl')
const { locale } = useI18n()

// ─── Language switcher ──────────────────────────────────────
const languages = [
  { code: 'uz', label: "O'zbekcha", short: 'UZ' },
  { code: 'uzk', label: 'Ўзбекча', short: 'УЗ' },
  { code: 'ru', label: 'Русский', short: 'RU' },
]
const langOpen = ref(false)
const langRef = ref(null)
const currentLang = computed(() => languages.find((l) => l.code === locale.value) || languages[0])
const setLang = (code) => {
  locale.value = code
  localStorage.setItem('lang', code)
  langOpen.value = false
}
const onClickOutsideLang = (e) => {
  if (!langOpen.value) return
  if (langRef.value && !langRef.value.contains(e.target)) langOpen.value = false
}

const currentTime = ref('')
let timer = null

const updateTime = () => {
  const d = new Date()
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  currentTime.value = `${h}:${m}`
}

const userInitial = computed(
  () => userStore.user?.user_name?.charAt(0).toUpperCase() || 'G',
)

const userImage = computed(() => {
  const img = userStore.user?.image
  return img ? `${fileUrl}${img}` : null
})

const toggleTheme = () => uiStore.toggleTheme()

// ─── Chat panel ─────────────────────────────────────────────
const chatOpen = ref(false)
const chatRef = ref(null)
const chatBoxRef = ref(null)
const chatInput = ref('')
const chatMessages = ref([
  { from: 'Farangiz Abdullayeva', text: 'Assalomu Aleykum', time: '12:36', side: 'left' },
  { from: 'Farangiz Abdullayeva', text: 'Assalomu Aleykum', time: '12:36', side: 'right' },
])
const unreadCount = computed(() => chatMessages.value.filter((m) => m.side === 'left' && !m.read).length)

const scrollChatToBottom = () => {
  nextTick(() => {
    if (chatBoxRef.value) chatBoxRef.value.scrollTop = chatBoxRef.value.scrollHeight
  })
}

const toggleChat = () => {
  chatOpen.value = !chatOpen.value
  if (chatOpen.value) {
    chatMessages.value.forEach((m) => (m.read = true))
    scrollChatToBottom()
  }
}

const sendChat = () => {
  if (!chatInput.value.trim()) return
  chatMessages.value.push({
    from: 'Men',
    text: chatInput.value,
    time: currentTime.value,
    side: 'right',
    read: true,
  })
  chatInput.value = ''
  scrollChatToBottom()
}

const onClickOutside = (e) => {
  if (!chatOpen.value) return
  if (chatRef.value && !chatRef.value.contains(e.target)) chatOpen.value = false
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 30000)
  document.addEventListener('mousedown', onClickOutside)
  document.addEventListener('mousedown', onClickOutsideLang)
})
onBeforeUnmount(() => {
  clearInterval(timer)
  document.removeEventListener('mousedown', onClickOutside)
  document.removeEventListener('mousedown', onClickOutsideLang)
})
</script>

<template>
  <header
    class="h-[64px] bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-3 sm:px-4 gap-2 sm:gap-3 transition-colors">
    <!-- Left: toggle + operator info + schedule -->
    <div class="flex items-center gap-2 sm:gap-4 min-w-0">
      <button
        class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 transition shrink-0"
        @click="isMobile ? emit('toggle-mobile') : emit('toggle-sidebar')" :title="collapsed ? $t('open_menu') : $t('close_menu')">
        <svg class="w-5 h-5 transition-transform duration-300" :class="collapsed ? 'rotate-180' : ''" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      <!-- Operator info -->
      <div class="flex items-center gap-2 sm:gap-2.5 min-w-0">
        <div
          class="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 font-bold text-sm shrink-0 overflow-hidden">
          <img v-if="userImage" :src="userImage" :alt="userStore.user?.user_name" class="w-full h-full object-cover" />
          <span v-else>{{ userInitial }}</span>
        </div>
        <div class="hidden sm:flex flex-col leading-tight min-w-0">
          <span class="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">
            {{ userStore.user?.user_name || 'Gulsanamxon' }}
          </span>
          <span class="text-[11px] text-slate-400 dark:text-slate-500">
            {{ userStore.user?.role?.name || $t('operator') }}
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
        <span>{{ $t('free_ad_short') }}</span>
        <span class="bg-white/25 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">100</span>
      </button>

      <button
        class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[12px] font-semibold shadow-sm transition">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>{{ $t('paid_ad_short') }}</span>
        <span class="bg-white/25 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">100</span>
      </button>

      <button
        class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-white text-[12px] font-semibold shadow-sm transition">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <span>{{ $t('surveys_count') }}</span>
        <span class="bg-white/30 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">9</span>
      </button>

      <button
        class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-white text-[12px] font-semibold shadow-sm transition">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 11v3a4 4 0 0 0 4 4h1l4 4V7L8 11H3z" />
          <path d="M17 7a5 5 0 0 1 0 10" />
        </svg>
        <span>{{ $t('advertising') }}</span>
        <span class="bg-white/30 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">9</span>
      </button>

      <button
        class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-white text-[12px] font-semibold shadow-sm transition">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
        </svg>
        <span>{{ $t('premium') }}</span>
        <span class="bg-white/30 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">9</span>
      </button>
    </div>

    <!-- Right: chat + clock + theme + notifications -->
    <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
      <!-- Operator chat -->
      <div ref="chatRef" class="relative">
        <button @click="toggleChat" :title="'Operatorlar chat'"
          class="relative flex items-center justify-center w-9 h-9 rounded-full overflow-hidden border-2 transition"
          :class="chatOpen ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900' : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'">
          <img v-if="userImage" :src="userImage" :alt="userStore.user?.user_name" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
            {{ userInitial }}
          </div>
          <span v-if="unreadCount > 0"
            class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-800">
            {{ unreadCount }}
          </span>
        </button>

        <!-- Chat dropdown -->
        <Transition name="chat">
          <div v-if="chatOpen"
            class="absolute right-0 top-[calc(100%+8px)] z-50 w-[340px] sm:w-[380px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <!-- Header -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900/50 dark:to-slate-900/50">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span class="text-[13px] font-bold text-slate-700 dark:text-slate-200">{{ $t('operators') }}</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="flex -space-x-1.5">
                  <div class="w-5 h-5 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 ring-2 ring-white dark:ring-slate-800"></div>
                  <div class="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 ring-2 ring-white dark:ring-slate-800"></div>
                  <div class="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 ring-2 ring-white dark:ring-slate-800"></div>
                </div>
                <button @click="chatOpen = false"
                  class="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Messages -->
            <div ref="chatBoxRef" class="px-3 py-3 space-y-2 max-h-[320px] overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
              <div v-for="(m, i) in chatMessages" :key="i" class="flex gap-2"
                :class="m.side === 'right' ? 'flex-row-reverse' : ''">
                <div class="w-6 h-6 rounded-full bg-gradient-to-br shrink-0 mt-3"
                  :class="m.side === 'right' ? 'from-pink-400 to-pink-600' : 'from-blue-400 to-blue-600'"></div>
                <div class="flex-1 min-w-0">
                  <div class="text-[10px] text-slate-400 mb-0.5" :class="m.side === 'right' ? 'text-right' : ''">
                    {{ m.from }}
                  </div>
                  <div class="text-[12px] rounded-lg px-2.5 py-1.5 inline-block max-w-full break-words"
                    :class="m.side === 'right'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200'">
                    {{ m.text }}
                  </div>
                  <div class="text-[10px] text-slate-400 mt-0.5" :class="m.side === 'right' ? 'text-right' : ''">
                    {{ m.time }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Input -->
            <form @submit.prevent="sendChat"
              class="flex items-center gap-1.5 px-3 py-2 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
              <button type="button" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </button>
              <input v-model="chatInput" :placeholder="$t('type_message')"
                class="flex-1 min-w-0 text-[12px] px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-400" />
              <button type="submit"
                class="text-white bg-blue-500 hover:bg-blue-600 p-1.5 rounded-lg transition">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        </Transition>
      </div>

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

      <!-- Language switcher -->
      <div ref="langRef" class="relative" data-lang-switcher>
        <button @click="langOpen = !langOpen" :title="$t('language')"
          class="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          <svg class="w-4 h-4 text-slate-500 dark:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
          </svg>
          <span class="text-[12px] font-bold">{{ currentLang.short }}</span>
          <svg class="w-3 h-3 text-slate-400 transition-transform" :class="langOpen ? 'rotate-180' : ''"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        <Transition name="chat">
          <div v-if="langOpen"
            class="absolute right-0 top-[calc(100%+6px)] z-50 w-[160px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            <button v-for="l in languages" :key="l.code" @click="setLang(l.code)"
              class="w-full flex items-center justify-between px-3 py-2 text-[13px] transition"
              :class="locale === l.code
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'">
              <span>{{ l.label }}</span>
              <svg v-if="locale === l.code" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </div>
        </Transition>
      </div>

      <!-- Theme toggle -->
      <button @click="toggleTheme"
        class="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        :title="uiStore.dark ? $t('light_theme') : $t('dark_theme')">
        <svg v-if="uiStore.dark" class="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
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

<style scoped>
.chat-enter-active,
.chat-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
  transform-origin: top right;
}
.chat-enter-from,
.chat-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-6px);
}
</style>
