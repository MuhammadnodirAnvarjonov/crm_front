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

const router = useRouter()
const userStore = useUserStore()
const { locale } = useI18n()

const toggleSidebar = () => (collapsed.value = !collapsed.value)
const toggleMobile = () => (mobileOpen.value = !mobileOpen.value)
const closeMobile = () => (mobileOpen.value = false)

const handleResize = () => {
  isMobile.value = window.innerWidth < 1024
  if (!isMobile.value) mobileOpen.value = false
}

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
  <div v-if="!userStore.user"
    class="fixed inset-0 flex flex-col items-center justify-center z-[9999] bg-slate-50">
    <div class="w-10 h-10 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin mb-4"></div>
    <p class="text-sm font-medium text-slate-700">Tizim yuklanmoqda...</p>
  </div>

  <div v-else class="h-screen flex overflow-hidden bg-slate-50">
    <!-- Mobile overlay -->
    <div v-if="isMobile && mobileOpen" @click="closeMobile"
      class="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-sm"></div>

    <!-- Sidebar -->
    <div class="fixed top-0 left-0 z-30 h-full transition-transform duration-300 ease-in-out"
      :class="isMobile ? (mobileOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'">
      <Menu :collapsed="collapsed && !isMobile" />
    </div>

    <!-- Main area -->
    <div class="flex-1 flex flex-col min-h-0 min-w-0" :class="isMobile ? 'ml-0' : 'ml-[240px]'">
      <Header :collapsed="collapsed" :is-mobile="isMobile" @toggle-sidebar="toggleSidebar"
        @toggle-mobile="toggleMobile" />

      <main class="flex-1 overflow-auto p-4 md:p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>
