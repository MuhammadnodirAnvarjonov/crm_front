<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { getPermissionRoutes } from '@/config/menuConfig'
import http from '@/services/http'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()

const form = ref({ user_name: '', password: '' })
const isLoading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

const firstAllowed = () => {
  for (const { key, route } of getPermissionRoutes()) {
    if (userStore.hasPermission(key)) return route
  }
  return '/home'
}

const login = async () => {
  errorMessage.value = ''
  if (!form.value.user_name || !form.value.password) {
    errorMessage.value = t('fill_all_fields') || "Barcha maydonlarni to'ldiring"
    return
  }
  isLoading.value = true
  try {
    const res = await http.post('/users/login', form.value)
    if (!res?.token) throw new Error('Token topilmadi')
    localStorage.setItem('token', res.token)
    localStorage.setItem('lang', localStorage.getItem('lang') || 'uz')
    userStore.setUser(res)
    router.push(firstAllowed())
  } catch (err) {
    errorMessage.value = err?.data?.message || t('login_error') || 'Login yoki parol xato'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900 p-4">
    <div class="w-full max-w-[420px] bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-md mb-4">
          <svg viewBox="0 0 24 24" class="w-9 h-9 text-blue-600" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M15 6.75a3 3 0 11-6 0 3 3 0 016 0zM7.5 15.75a4.5 4.5 0 119 0v.75H7.5v-.75z" />
          </svg>
        </div>
        <h2 class="text-2xl font-extrabold text-white">{{ t('login') || 'Tizimga kirish' }}</h2>
        <p class="text-white/60 text-sm mt-1">{{ t('login_subtitle') || 'Hisobingizga kiring' }}</p>
      </div>

      <form @submit.prevent="login" class="space-y-4">
        <div v-if="errorMessage"
          class="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-sm font-medium">
          {{ errorMessage }}
        </div>

        <input v-model="form.user_name" type="text" autocomplete="username"
          :placeholder="t('user_name') || 'Foydalanuvchi'"
          class="w-full px-4 py-3 bg-white/90 rounded-xl text-slate-800 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500" />

        <div class="relative">
          <input v-model="form.password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password"
            :placeholder="t('password') || 'Parol'"
            class="w-full px-4 py-3 pr-12 bg-white/90 rounded-xl text-slate-800 placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          <button type="button" @click="showPassword = !showPassword"
            class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-cyan-600">
            <svg v-if="!showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.5 12C3.8 7.9 7.5 5 12 5s8.2 2.9 9.5 7c-1.3 4.1-5 7-9.5 7S3.8 16.1 2.5 12z" />
            </svg>
            <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M13.9 18.8A10 10 0 0112 19c-4.5 0-8.3-2.9-9.5-7a10 10 0 011.6-2.6M5.8 5.8A10 10 0 0112 5c4.5 0 8.3 2.9 9.5 7a10 10 0 01-3.2 5.5M9.9 9.9l4.2 4.2M3 3l18 18" />
            </svg>
          </button>
        </div>

        <button type="submit" :disabled="isLoading"
          class="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-70 disabled:cursor-not-allowed">
          {{ isLoading ? (t('loading') || 'Yuklanmoqda...') : (t('enter') || 'Kirish') }}
        </button>
      </form>

      <p class="mt-6 text-center text-white/40 text-xs">
        &copy; {{ new Date().getFullYear() }} CRM
      </p>
    </div>
  </div>
</template>
