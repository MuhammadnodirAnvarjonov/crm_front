<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { MENU_CONFIG } from '@/config/menuConfig'
import MenuIcon from '@/components/MenuIcon.vue'

const props = defineProps({ collapsed: Boolean })

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const filteredMenu = computed(() =>
  MENU_CONFIG.filter((item) => userStore.hasPermission(item.key)),
)

const isActive = (item) => route.path === item.route || route.name === item.key

// Track which item is being loaded after click
const loadingKey = ref(null)
const navBeforeGuard = router.beforeEach((to) => {
  if (!loadingKey.value) loadingKey.value = to.name
})
const navAfterGuard = router.afterEach(() => {
  setTimeout(() => (loadingKey.value = null), 250)
})
onBeforeUnmount(() => {
  if (navBeforeGuard) navBeforeGuard()
  if (navAfterGuard) navAfterGuard()
})

const go = (item) => {
  if (isActive(item) || loadingKey.value) return
  loadingKey.value = item.key
  router.push(item.route)
}

const logout = () => {
  userStore.clearUser()
  router.push({ name: 'Login' })
}

const subtitle = computed(() => {
  const role = userStore.user?.role?.name || 'Foydalanuvchi'
  const name = userStore.user?.user_name || ''
  return name ? `${role}: ${name}` : 'Ish boshqaruv tizimi'
})

const userInitial = computed(() => userStore.user?.user_name?.charAt(0).toUpperCase() || 'U')

// Live clock
const now = ref(new Date())
let timer = null
onMounted(() => {
  timer = setInterval(() => (now.value = new Date()), 1000)
})
onBeforeUnmount(() => clearInterval(timer))

const timeString = computed(() => {
  const d = now.value
  return (
    String(d.getHours()).padStart(2, '0') + ':' +
    String(d.getMinutes()).padStart(2, '0') + ':' +
    String(d.getSeconds()).padStart(2, '0')
  )
})

const dateString = computed(() => {
  const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']
  const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr']
  const d = now.value
  return `${d.getDate()}-${months[d.getMonth()]}, ${days[d.getDay()]}`
})

// Chat mock
const chatInput = ref('')
const chatMessages = ref([
  { from: 'Farangiz Abdullayeva', text: 'Assalomu Aleykum', time: '12:36', side: 'left' },
  { from: 'Farangiz Abdullayeva', text: 'Assalomu Aleykum', time: '12:36', side: 'right' },
])
const sendChat = () => {
  if (!chatInput.value.trim()) return
  chatMessages.value.push({
    from: 'Men',
    text: chatInput.value,
    time: timeString.value.slice(0, 5),
    side: 'right',
  })
  chatInput.value = ''
}
</script>

<template>
  <aside
    class="h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300"
    :class="collapsed ? 'w-[72px]' : 'w-[240px]'">

    <!-- Logo -->
    <div class="px-3 py-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-700"
      :class="collapsed ? 'justify-center' : ''">
      <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shrink-0">
        <svg viewBox="0 0 24 24" class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
      </div>
      <div v-if="!collapsed" class="flex flex-col leading-tight min-w-0">
        <span class="text-[14px] font-bold text-slate-800 dark:text-slate-100">Operator Panel</span>
        <span class="text-[10px] text-slate-400 dark:text-slate-500 truncate">{{ subtitle }}</span>
      </div>
    </div>

    <!-- Menu -->
    <nav class="flex-1 overflow-y-auto py-2 px-2 scrollbar-thin">
      <ul class="space-y-0.5">
        <li v-for="item in filteredMenu" :key="item.key" class="relative group">
          <button @click="go(item)" :disabled="loadingKey === item.key"
            class="w-full flex items-center gap-2.5 rounded-lg text-[13px] font-medium transition-colors"
            :class="[
              collapsed ? 'justify-center px-2 py-2.5' : 'px-2.5 py-2',
              isActive(item)
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700',
            ]">
            <span class="w-[18px] h-[18px] shrink-0 flex items-center justify-center">
              <svg v-if="loadingKey === item.key" class="w-[18px] h-[18px] animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" stroke-opacity="0.25" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
              </svg>
              <MenuIcon v-else :name="item.icon" class="w-[18px] h-[18px]" />
            </span>
            <span v-if="!collapsed">{{ item.label }}</span>
          </button>

          <!-- Tooltip when collapsed -->
          <div v-if="collapsed"
            class="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 hidden group-hover:block px-2 py-1 rounded-md bg-slate-900 text-white text-[11px] font-medium whitespace-nowrap shadow-lg">
            {{ item.label }}
          </div>
        </li>
      </ul>
    </nav>

    <!-- Expanded footer: chat + clock -->
    <template v-if="!collapsed">
      <div class="mx-2 mb-2 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800">
        <div class="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-700">
          <div class="flex items-center gap-1.5">
            <svg class="w-4 h-4 text-slate-500 dark:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span class="text-[12px] font-semibold text-slate-700 dark:text-slate-200">Operatorlar</span>
          </div>
          <div class="flex -space-x-1.5">
            <div class="w-5 h-5 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 ring-2 ring-white dark:ring-slate-800"></div>
            <div class="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 ring-2 ring-white dark:ring-slate-800"></div>
            <div class="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 ring-2 ring-white dark:ring-slate-800"></div>
          </div>
        </div>

        <div class="px-2 py-2 space-y-1.5 max-h-[120px] overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
          <div v-for="(m, i) in chatMessages" :key="i" class="flex gap-1.5"
            :class="m.side === 'right' ? 'flex-row-reverse' : ''">
            <div class="w-5 h-5 rounded-full bg-gradient-to-br shrink-0 mt-3"
              :class="m.side === 'right' ? 'from-pink-400 to-pink-600' : 'from-blue-400 to-blue-600'"></div>
            <div class="flex-1 min-w-0">
              <div class="text-[9px] text-slate-400 mb-0.5" :class="m.side === 'right' ? 'text-right' : ''">
                {{ m.from }}
              </div>
              <div class="text-[11px] rounded-lg px-2 py-1 inline-block max-w-full"
                :class="m.side === 'right'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200'">
                {{ m.text }}
              </div>
              <div class="text-[9px] text-slate-400 mt-0.5" :class="m.side === 'right' ? 'text-right' : ''">
                {{ m.time }}
              </div>
            </div>
          </div>
        </div>

        <form @submit.prevent="sendChat"
          class="flex items-center gap-1 px-2 py-1.5 border-t border-slate-100 dark:border-slate-700">
          <button type="button" class="text-slate-400 hover:text-slate-600 p-1">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </button>
          <input v-model="chatInput" placeholder="Xabar yozing..."
            class="flex-1 min-w-0 text-[11px] px-2 py-1 rounded bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-400" />
          <button type="submit" class="text-blue-500 hover:text-blue-600 p-1">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>

      <!-- Hozirgi vaqt -->
      <div class="mx-2 mb-2 rounded-xl bg-indigo-50 dark:bg-slate-700 px-3 py-2">
        <div class="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
          <svg class="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 14" />
          </svg>
          <span>Hozirgi vaqt</span>
        </div>
        <p class="text-lg font-bold text-red-500 font-mono leading-tight">{{ timeString }}</p>
        <p class="text-[10px] text-slate-500 dark:text-slate-400">{{ dateString }}</p>
      </div>
    </template>

    <!-- Collapsed footer: avatar + clock mini -->
    <template v-else>
      <div class="px-2 pb-2 flex flex-col items-center gap-2 border-t border-slate-100 dark:border-slate-700 pt-2">
        <div
          class="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
          {{ userInitial }}
        </div>
        <p class="text-[10px] font-mono font-bold text-red-500">{{ timeString.slice(0, 5) }}</p>
      </div>
    </template>

    <!-- Chiqish -->
    <div class="px-2 pb-2">
      <button @click="logout" :title="collapsed ? 'Chiqish' : ''"
        class="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-[12px] font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span v-if="!collapsed">Chiqish</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 4px;
}
:global(.dark) .scrollbar-thin::-webkit-scrollbar-thumb {
  background: #475569;
}
</style>
