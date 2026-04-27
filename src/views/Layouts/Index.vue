<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useUiStore } from '@/stores/ui'
import { useI18n } from 'vue-i18n'
import Header from '@/components/Header.vue'
import Menu from '@/components/Menu.vue'

const mobileOpen = ref(false)
const isMobile = ref(false)
const isPageLoading = ref(false)

const router = useRouter()
const userStore = useUserStore()
const uiStore = useUiStore()
const { sidebarCollapsed } = storeToRefs(uiStore)
const { locale } = useI18n()

const toggleSidebar = () => uiStore.toggleSidebar()
const toggleMobile = () => (mobileOpen.value = !mobileOpen.value)
const closeMobile = () => (mobileOpen.value = false)

const sidebarWidth = computed(() => (sidebarCollapsed.value ? 'w-[72px]' : 'w-[240px]'))
const mainMargin = computed(() => {
  if (isMobile.value) return 'ml-0'
  return sidebarCollapsed.value ? 'ml-[72px]' : 'ml-[240px]'
})

const handleResize = () => {
  isMobile.value = window.innerWidth < 1024
  if (!isMobile.value) mobileOpen.value = false
}

// Route transition loading
let loadingTimer = null
const beforeGuard = router.beforeEach((to, from, next) => {
  if (to.fullPath !== from.fullPath) {
    isPageLoading.value = true
  }
  if (isMobile.value) closeMobile()
  next()
})
const afterGuard = router.afterEach(() => {
  clearTimeout(loadingTimer)
  loadingTimer = setTimeout(() => {
    isPageLoading.value = false
  }, 350)
})

onMounted(async () => {
  handleResize()
  window.addEventListener('resize', handleResize)
  locale.value = localStorage.getItem('lang') || 'uz'
  await userStore.initUser()
  if (!userStore.user) router.push({ name: 'Login' })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  clearTimeout(loadingTimer)
  if (beforeGuard) beforeGuard()
  if (afterGuard) afterGuard()
})
</script>

<template>
  <!-- App boot / refresh loader -->
  <div v-if="!userStore.user"
    class="fixed inset-0 flex flex-col items-center justify-center z-[9999] bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors">
    <div class="flex flex-col items-center">
      <!-- Logo -->
      <div class="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg mb-5 animate-pulse">
        <svg viewBox="0 0 24 24" class="w-8 h-8 text-white" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
      </div>

      <!-- Spinner -->
      <div class="relative w-14 h-14 mb-4">
        <div class="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-slate-700"></div>
        <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
      </div>

      <p class="text-[14px] font-semibold text-slate-700 dark:text-slate-200">{{ $t('operator_panel') }}</p>
      <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{{ $t('loading_app') }}</p>
    </div>
  </div>

  <!-- Main layout -->
  <div v-else class="h-screen flex overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors">
    <!-- Top progress bar -->
    <div v-show="isPageLoading" class="fixed top-0 left-0 right-0 z-[100] h-[2px] overflow-hidden pointer-events-none">
      <div class="progress-bar h-full bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400"></div>
    </div>

    <!-- Mobile overlay -->
    <div v-if="isMobile && mobileOpen" @click="closeMobile"
      class="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm"></div>

    <!-- Sidebar -->
    <div class="fixed top-0 left-0 z-30 h-full transition-all duration-300 ease-in-out" :class="[
      isMobile ? 'w-[240px]' : sidebarWidth,
      isMobile ? (mobileOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0',
    ]">
      <Menu :collapsed="sidebarCollapsed && !isMobile" />
    </div>

    <!-- Main area -->
    <div class="flex-1 flex flex-col min-h-0 min-w-0 transition-all duration-300" :class="mainMargin">
      <Header :collapsed="sidebarCollapsed" :is-mobile="isMobile" @toggle-sidebar="toggleSidebar"
        @toggle-mobile="toggleMobile" />

      <main class="flex-1 overflow-auto p-3 sm:p-4 md:p-6 text-slate-800 dark:text-slate-200 relative">
        <!-- Route transition loading overlay -->
        <transition name="fade">
          <div v-if="isPageLoading"
            class="absolute inset-0 z-10 flex items-start justify-center pt-16 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm pointer-events-none">
            <div class="flex flex-col items-center gap-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-5 shadow-lg">
              <div class="relative w-10 h-10">
                <div class="absolute inset-0 rounded-full border-[3px] border-blue-100 dark:border-slate-700"></div>
                <div class="absolute inset-0 rounded-full border-[3px] border-transparent border-t-blue-600 animate-spin"></div>
              </div>
              <p class="text-[12px] font-medium text-slate-600 dark:text-slate-300">{{ $t('loading') }}</p>
            </div>
          </div>
        </transition>

        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Top progress bar animation */
.progress-bar {
  width: 40%;
  animation: slide 1.2s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}

@keyframes slide {
  0% {
    transform: translateX(-100%);
    width: 30%;
  }
  50% {
    transform: translateX(120%);
    width: 50%;
  }
  100% {
    transform: translateX(250%);
    width: 40%;
  }
}

/* Fade animation for loading overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Page transition */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
