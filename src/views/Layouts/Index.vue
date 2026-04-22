<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useI18n } from 'vue-i18n'
import Header from '@/components/Header.vue'
import Menu from '@/components/Menu.vue'

const collapsed = ref(false)
const mobileOpen = ref(false)
const isMobile = ref(false)
const isPageLoading = ref(false)

const router = useRouter()
const userStore = useUserStore()
const { locale } = useI18n()

const toggleSidebar = () => (collapsed.value = !collapsed.value)
const toggleMobile = () => (mobileOpen.value = !mobileOpen.value)
const closeMobile = () => (mobileOpen.value = false)

const handleResize = () => {
  isMobile.value = window.innerWidth < 1024
  if (!isMobile.value) {
    mobileOpen.value = false
    if (window.innerWidth < 1200) collapsed.value = true
  }
}

router.beforeEach(() => {
  isPageLoading.value = true
  if (isMobile.value) closeMobile()
})
router.afterEach(() => {
  setTimeout(() => (isPageLoading.value = false), 300)
})

onMounted(async () => {
  handleResize()
  window.addEventListener('resize', handleResize)
  locale.value = localStorage.getItem('lang') || 'uz'
  await userStore.initUser()
  if (!userStore.user) router.push({ name: 'Login' })
})

onBeforeUnmount(() => window.removeEventListener('resize', handleResize))
</script>

<template>
  <div v-if="!userStore.user" class="fixed inset-0 flex flex-col items-center justify-center z-[9999]"
    style="background: linear-gradient(135deg, #f8f0f7 0%, #eff4ff 100%)">
    <div class="w-10 h-10 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin mb-4"></div>
    <p class="text-sm font-medium text-slate-700 animate-pulse">Tizim yuklanmoqda...</p>
  </div>

  <div v-else class="h-screen flex overflow-hidden" style="background: #f3f6ff">
    <div v-if="isMobile && mobileOpen" @click="closeMobile"
      class="fixed inset-0 z-20 backdrop-blur-sm transition-opacity duration-300"
      style="background: rgba(19,40,110,0.5)"></div>

    <aside class="fixed top-0 left-0 z-30 h-full shadow-xl transition-all duration-300 ease-in-out" :class="[
      isMobile
        ? (mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64')
        : (collapsed ? 'w-20' : 'w-[260px]')
    ]">
      <Menu :collapsed="collapsed && !isMobile" />
    </aside>

    <div class="flex-1 flex flex-col min-h-0 transition-all duration-300 ease-in-out min-w-0"
      :class="[isMobile ? 'ml-0' : (collapsed ? 'ml-20' : 'ml-[260px]')]">
      <header class="sticky top-0 z-40 h-16">
        <Header :collapsed="collapsed" :is-mobile="isMobile" @toggle-sidebar="toggleSidebar"
          @toggle-mobile="toggleMobile" />
      </header>

      <main class="flex-1 p-3 md:p-4 relative flex flex-col min-w-0 min-h-0 overflow-auto">
        <div v-if="isPageLoading" class="absolute inset-0 z-10 flex items-start justify-center pt-20"
          style="background: rgba(243,246,255,0.75); backdrop-filter: blur(2px)">
          <div class="bg-white p-4 rounded-full shadow-lg">
            <div class="w-8 h-8 rounded-full border-2 border-blue-100 border-t-blue-600 animate-spin"></div>
          </div>
        </div>

        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <div :key="$route.path" class="w-full min-w-0 flex flex-col">
              <component :is="Component" />
            </div>
          </transition>
        </router-view>
      </main>

      <footer class="text-center py-2 text-xs" style="color:#13286e; opacity:0.4">
        &copy; {{ new Date().getFullYear() }} CRM
      </footer>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
