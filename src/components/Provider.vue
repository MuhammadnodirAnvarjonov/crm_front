<script setup>
import App from '../App.vue'
import { useGlobalStore } from "@/stores/global"
import { ref, provide } from "vue"

// Global store
const store = useGlobalStore()

// Tilni boshqarish
const locale = ref(store.currentLang || 'uz')
const changeLang = (lang) => {
  locale.value = lang
  store.currentLang = lang
}

// Tailwind orqali soddalashgan tema (dark/light uchun)
const theme = ref('light')
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

// Notification holati (Naive o‘rniga Tailwind alert)
const notifications = ref([])

const showNotification = (type, message) => {
  const id = Date.now()
  notifications.value.push({ id, type, message })
  setTimeout(() => {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }, 3000)
}

// App ichida foydalanish uchun provide qilamiz
provide('showNotification', showNotification)
provide('changeLang', changeLang)
provide('locale', locale)
provide('theme', theme)
provide('toggleTheme', toggleTheme)
</script>

<template>
  <div :class="theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'"
    class="min-h-screen transition-colors">

    <!-- Notifications (Naive UI o‘rniga Tailwind alert) -->
    <div class="fixed top-4 right-4 space-y-2 z-50">
      <transition-group name="fade">
        <div v-for="note in notifications" :key="note.id" :class="[
          'px-4 py-3 rounded-lg shadow-md text-sm font-medium',
          note.type === 'error' ? 'bg-red-500 text-white' :
            note.type === 'success' ? 'bg-green-500 text-white' :
              'bg-blue-500 text-white'
        ]">
          {{ note.message }}
        </div>
      </transition-group>
    </div>

    <!-- Loading bar (Naive o‘rniga Tailwind progress) -->
    <div id="loading-bar" class="fixed top-0 left-0 w-0 h-1 bg-green-600 transition-all duration-500"></div>

    <!-- App Component -->
    <div class="app-box">
      <App />
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
