<script setup>
import { ref, computed, inject } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useUserStore } from '@/stores/user'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import usersService from '@/services/users.service'
import http from '@/services/http'
import { getPermissionRoutes } from '@/config/menuConfig'
import BaseSearch from '@/components/form/BaseSearch.vue'
import BaseButton from '@/components/form/BaseButton.vue'
import BaseInput from '@/components/form/BaseInput.vue'

defineProps({ collapsed: Boolean, isMobile: Boolean })
const emit = defineEmits(['toggle-sidebar', 'toggle-mobile'])

const userStore = useUserStore()
const router = useRouter()
const { locale, t } = useI18n()
const fileUrl = inject('fileUrl', '')

const userDropdownOpen = ref(false)
const langDropdownOpen = ref(false)
const userDropdownRef = ref(null)
const langDropdownRef = ref(null)

onClickOutside(userDropdownRef, () => {
  userDropdownOpen.value = false
  cancelSwitch()
})
onClickOutside(langDropdownRef, () => (langDropdownOpen.value = false))

const currentLang = computed(() => {
  if (locale.value === 'uz') return { flag: '🇺🇿', label: "O'zbekcha" }
  if (locale.value === 'uzk') return { flag: '🇺🇿', label: 'Ўзбекча' }
  return { flag: '🇷🇺', label: 'Русский' }
})

const setLang = (lang) => {
  locale.value = lang
  localStorage.setItem('lang', lang)
  langDropdownOpen.value = false
}

// --- Xodim almashtirish ---
const switchMode = ref(false)
const switchUsers = ref([])
const selectedUser = ref(null)
const switchPassword = ref('')
const switchLoading = ref(false)
const switchError = ref('')
const switchSearch = ref('')

const filteredSwitchUsers = computed(() => {
  if (!switchSearch.value) return switchUsers.value
  const q = switchSearch.value.toLowerCase()
  return switchUsers.value.filter(u =>
    u.user_name?.toLowerCase().includes(q) || u.role?.name?.toLowerCase().includes(q)
  )
})

const openSwitchMode = async () => {
  switchMode.value = true
  switchError.value = ''
  switchPassword.value = ''
  selectedUser.value = null
  try {
    switchUsers.value = (await usersService.all()) || []
  } catch (e) {
    console.error('Switch users load error:', e)
  }
}

const selectSwitchUser = (user) => {
  selectedUser.value = user
  switchPassword.value = ''
  switchError.value = ''
}

const getFirstAllowedRoute = () => {
  for (const { key, route } of getPermissionRoutes()) {
    if (userStore.hasPermission(key)) return route
  }
  return '/home'
}

const switchLogin = async () => {
  if (!selectedUser.value || !switchPassword.value) return
  switchLoading.value = true
  switchError.value = ''
  try {
    const res = await http.post('/users/login', {
      user_name: selectedUser.value.user_name,
      password: switchPassword.value,
    })
    if (!res?.token) {
      switchError.value = 'Token topilmadi'
      return
    }
    localStorage.setItem('token', res.token)
    userStore.setUser(res)
    switchMode.value = false
    userDropdownOpen.value = false
    window.location.href = getFirstAllowedRoute()
  } catch {
    switchError.value = t('login_error') || 'Parol xato!'
  } finally {
    switchLoading.value = false
  }
}

const cancelSwitch = () => {
  switchMode.value = false
  switchError.value = ''
  switchPassword.value = ''
  switchSearch.value = ''
  selectedUser.value = null
}

const logout = () => {
  userDropdownOpen.value = false
  userStore.clearUser()
  router.push({ name: 'Login' })
}

const userInitial = computed(() =>
  userStore.user?.user_name ? userStore.user.user_name.charAt(0).toUpperCase() : 'A'
)
</script>

<template>
  <header
    class="sticky top-0 z-[1] w-full h-16 bg-white flex items-center justify-between px-4 sm:px-6 transition-all duration-300"
    style="border-bottom: 2px solid #f0f4ff; box-shadow: 0 1px 12px rgba(19,40,110,0.07)">
    <div class="absolute top-0 left-0 right-0 h-0.5" style="background: linear-gradient(90deg, #E91E8C, #1e3a8a)"></div>

    <div class="flex items-center gap-3 md:gap-4">
      <button class="p-2 rounded-xl text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition"
        @click="isMobile ? emit('toggle-mobile') : emit('toggle-sidebar')">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
          class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      <div class="hidden sm:flex flex-col">
        <h2 class="text-base font-bold leading-none tracking-tight text-[#13286e]">Dashboard</h2>
        <span class="text-[11px] font-medium mt-0.5 text-pink-600">Xush kelibsiz!</span>
      </div>
    </div>

    <div class="flex items-center gap-2 sm:gap-3">
      <!-- Language -->
      <div class="relative" ref="langDropdownRef">
        <button @click="langDropdownOpen = !langDropdownOpen"
          class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-pink-50 transition">
          <span class="text-xl leading-none">{{ currentLang.flag }}</span>
          <span class="text-sm font-medium hidden md:block">{{ currentLang.label }}</span>
        </button>
        <transition name="dropdown">
          <div v-if="langDropdownOpen"
            class="absolute right-0 top-12 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-[1]">
            <button v-for="lang in [
              { v: 'uz', flag: '🇺🇿', label: 'O\'zbekcha' },
              { v: 'uzk', flag: '🇺🇿', label: 'Ўзбекча' },
              { v: 'ru', flag: '🇷🇺', label: 'Русский' }
            ]" :key="lang.v" @click="setLang(lang.v)"
              class="w-full px-4 py-2.5 text-left flex items-center gap-3 text-sm hover:bg-pink-50"
              :class="locale === lang.v ? 'bg-pink-50 text-pink-600 font-bold' : 'text-slate-700'">
              <span class="text-lg">{{ lang.flag }}</span>
              <span>{{ lang.label }}</span>
            </button>
          </div>
        </transition>
      </div>

      <div class="h-8 w-[1px] mx-1 hidden sm:block bg-slate-200"></div>

      <!-- User profile -->
      <div class="relative" ref="userDropdownRef">
        <button @click="userDropdownOpen = !userDropdownOpen"
          class="flex items-center gap-3 p-1 pr-2.5 rounded-full hover:bg-pink-50 transition">
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold ring-2 ring-white shadow-md"
            style="background: linear-gradient(135deg, #E91E8C, #13286e)">
            {{ userInitial }}
          </div>
          <div class="hidden md:flex flex-col text-right leading-tight">
            <span class="font-bold text-sm text-[#13286e]">{{ userStore.user?.user_name || 'Foydalanuvchi' }}</span>
            <span class="text-[10px] uppercase font-semibold tracking-wider text-pink-600">
              {{ userStore.user?.role?.name || 'Admin' }}
            </span>
          </div>
        </button>

        <transition name="dropdown">
          <div v-if="userDropdownOpen"
            class="absolute right-0 top-14 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[1] origin-top-right"
            :class="switchMode ? 'w-72' : 'w-60'">
            <template v-if="switchMode">
              <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-pink-50/50">
                <button @click="cancelSwitch" class="p-1 rounded-lg hover:bg-white/60">
                  <svg class="w-4 h-4 text-[#13286e]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <p class="font-bold text-sm text-[#13286e]">Xodim almashtirish</p>
              </div>

              <div v-if="switchError" class="mx-3 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
                {{ switchError }}
              </div>

              <div v-if="selectedUser" class="p-3 space-y-3">
                <div class="flex items-center gap-3 p-2 rounded-lg bg-blue-50">
                  <img v-if="selectedUser.image" :src="fileUrl + selectedUser.image"
                    class="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm" />
                  <div v-else class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style="background: linear-gradient(135deg, #E91E8C, #13286e)">
                    {{ selectedUser.user_name?.charAt(0).toUpperCase() }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold truncate text-[#13286e]">{{ selectedUser.user_name }}</p>
                    <p class="text-[10px] font-medium text-pink-600">{{ selectedUser.role?.name || '' }}</p>
                  </div>
                  <button @click="selectedUser = null; switchPassword = ''; switchError = ''"
                    class="p-1 rounded hover:bg-gray-200">
                    <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form @submit.prevent="switchLogin" class="space-y-2">
                  <BaseInput v-model="switchPassword" type="password" size="sm"
                    :placeholder="t('password_placeholder') || 'Parolni kiriting'" />
                  <BaseButton type="submit" status="pink" size="sm" full-width :loading="switchLoading"
                    :disabled="!switchPassword" :label="t('enter') || 'Kirish'" />
                </form>
              </div>

              <div v-else class="p-2">
                <BaseSearch v-model="switchSearch" size="sm" full-width placeholder="Qidirish..." class="mb-2" />
                <div class="max-h-56 overflow-y-auto">
                  <button v-for="user in filteredSwitchUsers" :key="user.id" @click="selectSwitchUser(user)"
                    class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-blue-50"
                    :class="user.user_name === userStore.user?.user_name ? 'bg-pink-50' : ''">
                    <img v-if="user.image" :src="fileUrl + user.image"
                      class="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm" />
                    <div v-else
                      class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style="background: linear-gradient(135deg, #E91E8C, #13286e)">
                      {{ user.user_name?.charAt(0).toUpperCase() }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium truncate text-[#13286e]">{{ user.user_name }}</p>
                      <p class="text-[10px] text-slate-400">{{ user.role?.name || '' }}</p>
                    </div>
                    <span v-if="user.user_name === userStore.user?.user_name"
                      class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-pink-50 text-pink-600">Siz</span>
                  </button>
                  <p v-if="!filteredSwitchUsers.length" class="text-center text-xs text-gray-400 py-4">
                    Xodimlar topilmadi
                  </p>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="px-5 py-3 border-b border-gray-100 rounded-t-xl bg-pink-50/50">
                <p class="font-bold text-sm text-[#13286e]">{{ userStore.user?.user_name }}</p>
                <p class="text-xs mt-0.5 text-pink-600">{{ userStore.user?.role?.name || 'Admin' }}</p>
              </div>
              <div class="p-2 mt-1 space-y-1">
                <button v-if="userStore.roleSetting('switch_users')" @click="openSwitchMode"
                  class="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-blue-50 text-[#13286e]">
                  <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                  Xodim almashtirish
                </button>
                <button @click="logout"
                  class="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50">
                  <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {{ t('logout') || 'Chiqish' }}
                </button>
              </div>
            </template>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}
</style>
