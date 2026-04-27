<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { MENU_CONFIG } from '@/config/menuConfig'
import MenuIcon from '@/components/MenuIcon.vue'

const props = defineProps({ collapsed: Boolean })

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { t, locale } = useI18n()

const filteredMenu = computed(() =>
  MENU_CONFIG.filter((item) => userStore.hasPermission(item.key)),
)

const menuGroups = computed(() => {
  const map = new Map()
  filteredMenu.value.forEach((item) => {
    const g = item.group || 'menu_main'
    if (!map.has(g)) map.set(g, [])
    map.get(g).push(item)
  })
  return [...map.entries()].map(([labelKey, items]) => ({ labelKey, label: t(labelKey), items }))
})

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
  const role = userStore.user?.role?.name || t('user_role')
  const name = userStore.user?.user_name || ''
  return name ? `${role}: ${name}` : t('system_subtitle')
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
  const days = {
    uz: ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'],
    uzk: ['Якшанба', 'Душанба', 'Сешанба', 'Чоршанба', 'Пайшанба', 'Жума', 'Шанба'],
    ru: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
  }
  const months = {
    uz: ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'],
    uzk: ['январ', 'феврал', 'март', 'апрел', 'май', 'июн', 'июл', 'август', 'сентябр', 'октябр', 'ноябр', 'декабр'],
    ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  }
  const lng = days[locale.value] ? locale.value : 'uz'
  const d = now.value
  return `${d.getDate()}-${months[lng][d.getMonth()]}, ${days[lng][d.getDay()]}`
})

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
        <span class="text-[14px] font-bold text-slate-800 dark:text-slate-100">{{ $t('operator_panel') }}</span>
        <span class="text-[10px] text-slate-400 dark:text-slate-500 truncate">{{ subtitle }}</span>
      </div>
    </div>

    <!-- Menu -->
    <nav class="flex-1 overflow-y-auto py-2 px-2 scrollbar-thin">
      <div v-for="(grp, gi) in menuGroups" :key="grp.label" :class="gi > 0 ? 'mt-3' : ''">
        <!-- Group label (expanded) -->
        <div v-if="!collapsed"
          class="px-2.5 mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
          {{ grp.label }}
        </div>
        <!-- Group divider (collapsed) -->
        <div v-else-if="gi > 0" class="mx-2 my-2 border-t border-slate-100 dark:border-slate-700"></div>

        <ul class="space-y-0.5">
          <li v-for="item in grp.items" :key="item.key" class="relative group">
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
              <span v-if="!collapsed">{{ $t(item.label) }}</span>
            </button>

            <!-- Tooltip when collapsed -->
            <div v-if="collapsed"
              class="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 hidden group-hover:block px-2 py-1 rounded-md bg-slate-900 text-white text-[11px] font-medium whitespace-nowrap shadow-lg">
              {{ $t(item.label) }}
            </div>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Expanded footer: clock -->
    <template v-if="!collapsed">
      <!-- Hozirgi vaqt -->
      <div class="mx-2 mb-2 rounded-xl bg-indigo-50 dark:bg-slate-700 px-3 py-2">
        <div class="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
          <svg class="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 14" />
          </svg>
          <span>{{ $t('current_time') }}</span>
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
      <button @click="logout" :title="collapsed ? $t('exit') : ''"
        class="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-[12px] font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span v-if="!collapsed">{{ $t('exit') }}</span>
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
