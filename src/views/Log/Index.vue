<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { getPermissionRoutes } from '@/config/menuConfig'
import usersService from '@/services/users.service'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()

// Mode: login | register | forgot
const mode = ref('login')

const loginForm = ref({ user_name: '', password: '' })
const registerForm = ref({ user_name: '', phone: '', password: '', password2: '' })

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const firstAllowed = () => {
  for (const { key, route } of getPermissionRoutes()) {
    if (userStore.hasPermission(key)) return route
  }
  return '/home'
}

const login = async () => {
  errorMessage.value = ''
  if (!loginForm.value.user_name || !loginForm.value.password) {
    errorMessage.value = "Barcha maydonlarni to'ldiring"
    return
  }
  isLoading.value = true
  try {
    const res = await usersService.login(loginForm.value)
    if (!res?.token) throw new Error('Token topilmadi')
    localStorage.setItem('token', res.token)
    localStorage.setItem('lang', localStorage.getItem('lang') || 'uz')
    userStore.setUser(res)
    router.push(firstAllowed())
  } catch (err) {
    errorMessage.value = err?.message || 'Login yoki parol xato'
  } finally {
    isLoading.value = false
  }
}

const register = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  const f = registerForm.value
  if (!f.user_name || !f.password) {
    errorMessage.value = "Foydalanuvchi nomi va parol talab qilinadi"
    return
  }
  if (f.password.length < 6) {
    errorMessage.value = "Parol kamida 6 ta belgidan iborat bo'lishi kerak"
    return
  }
  if (f.password !== f.password2) {
    errorMessage.value = "Parollar mos kelmadi"
    return
  }
  isLoading.value = true
  try {
    const res = await usersService.register({
      user_name: f.user_name,
      password: f.password,
      phone: f.phone,
    })
    if (!res?.token) throw new Error('Token topilmadi')
    localStorage.setItem('token', res.token)
    localStorage.setItem('lang', localStorage.getItem('lang') || 'uz')
    userStore.setUser(res)
    router.push(firstAllowed())
  } catch (err) {
    errorMessage.value = err?.message || "Ro'yxatdan o'tishda xatolik"
  } finally {
    isLoading.value = false
  }
}

const switchMode = (m) => {
  mode.value = m
  errorMessage.value = ''
  successMessage.value = ''
}
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-slate-700 p-6">
    <!-- Login container: split panel -->
    <div class="w-full max-w-6xl min-h-[640px] rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row"
      style="background: #0f2439">

      <!-- LEFT: Brand panel -->
      <div class="flex-1 flex flex-col items-center justify-center p-10 text-white">
        <div class="flex flex-col items-center text-center">
          <!-- Logo -->
          <div class="flex items-center gap-1 mb-3">
            <span class="text-5xl font-black tracking-tight">ISH B</span>
            <!-- Stylized O with magnifier + person -->
            <div class="relative w-14 h-14 flex items-center justify-center">
              <div class="absolute inset-0 rounded-full bg-amber-400"></div>
              <svg class="absolute inset-0 w-full h-full" viewBox="0 0 56 56" fill="none">
                <!-- Person silhouette inside -->
                <circle cx="24" cy="20" r="6" fill="#0f2439" />
                <path d="M14 36c0-5.5 4.5-10 10-10s10 4.5 10 10v4H14v-4z" fill="#0f2439" />
                <!-- Magnifier handle -->
                <line x1="40" y1="40" x2="52" y2="52" stroke="white" stroke-width="4" stroke-linecap="round" />
              </svg>
            </div>
            <span class="text-5xl font-black tracking-tight">R</span>
          </div>
          <p class="text-xl font-bold tracking-[0.3em] mb-4">FERGANA</p>
          <p class="text-sm text-white/70">Farg'ona bo'ylab eng yaxshi ish e'lonlari</p>
        </div>
      </div>

      <!-- RIGHT: Form panel -->
      <div class="w-full lg:w-[420px] bg-white flex items-center justify-center p-8">
        <div class="w-full max-w-sm">

          <!-- Error / Success messages -->
          <div v-if="errorMessage"
            class="mb-4 p-3 rounded-lg bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium">
            {{ errorMessage }}
          </div>
          <div v-if="successMessage"
            class="mb-4 p-3 rounded-lg bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-sm font-medium">
            {{ successMessage }}
          </div>

          <!-- LOGIN FORM -->
          <form v-if="mode === 'login'" @submit.prevent="login" class="space-y-4">
            <!-- User name -->
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
              </div>
              <input v-model="loginForm.user_name" type="text" autocomplete="username"
                placeholder="Foydalanuvchi nomi"
                class="w-full pl-10 pr-3 py-3 rounded-lg border border-slate-200 text-slate-800 text-[14px] placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800" />
            </div>

            <!-- Password -->
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input v-model="loginForm.password" type="password" autocomplete="current-password"
                placeholder="••••••••"
                class="w-full pl-10 pr-24 py-3 rounded-lg border border-slate-200 text-slate-800 text-[14px] placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800" />
              <button type="button" @click="switchMode('forgot')"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-[12px] text-slate-500 hover:text-slate-800 underline">
                Parolni unutdim
              </button>
            </div>

            <!-- Submit -->
            <button type="submit" :disabled="isLoading"
              class="w-full py-3 rounded-lg text-white font-semibold text-[15px] transition disabled:opacity-70"
              style="background: #0f2439">
              {{ isLoading ? 'Yuklanmoqda...' : 'Kirish' }}
            </button>

            <p class="text-center text-[13px] text-slate-500 mt-4">
              Hisobingiz yo'qmi?
              <button type="button" @click="switchMode('register')"
                class="text-slate-800 font-semibold hover:underline underline">
                Ro'yxatdan o'tish
              </button>
            </p>
          </form>

          <!-- REGISTER FORM -->
          <form v-else-if="mode === 'register'" @submit.prevent="register" class="space-y-4">
            <h2 class="text-xl font-bold text-slate-800 mb-1">Ro'yxatdan o'tish</h2>
            <p class="text-sm text-slate-500 mb-4">Yangi hisob yarating</p>

            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M20 21a8 8 0 0 0-16 0" />
                </svg>
              </div>
              <input v-model="registerForm.user_name" type="text" autocomplete="username"
                placeholder="Foydalanuvchi nomi"
                class="w-full pl-10 pr-3 py-3 rounded-lg border border-slate-200 text-slate-800 text-[14px] placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800" />
            </div>

            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <input v-model="registerForm.phone" type="tel"
                placeholder="Telefon (+998...)"
                class="w-full pl-10 pr-3 py-3 rounded-lg border border-slate-200 text-slate-800 text-[14px] placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800" />
            </div>

            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input v-model="registerForm.password" type="password" autocomplete="new-password"
                placeholder="Parol (kamida 6 belgi)"
                class="w-full pl-10 pr-3 py-3 rounded-lg border border-slate-200 text-slate-800 text-[14px] placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800" />
            </div>

            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <input v-model="registerForm.password2" type="password" autocomplete="new-password"
                placeholder="Parolni takrorlang"
                class="w-full pl-10 pr-3 py-3 rounded-lg border border-slate-200 text-slate-800 text-[14px] placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800" />
            </div>

            <button type="submit" :disabled="isLoading"
              class="w-full py-3 rounded-lg text-white font-semibold text-[15px] transition disabled:opacity-70"
              style="background: #0f2439">
              {{ isLoading ? 'Yuklanmoqda...' : "Ro'yxatdan o'tish" }}
            </button>

            <p class="text-center text-[13px] text-slate-500 mt-4">
              Hisobingiz bormi?
              <button type="button" @click="switchMode('login')"
                class="text-slate-800 font-semibold hover:underline underline">
                Kirish
              </button>
            </p>
          </form>

          <!-- FORGOT FORM (placeholder) -->
          <div v-else class="space-y-4 text-center">
            <div class="w-14 h-14 mx-auto rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
              <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 class="text-xl font-bold text-slate-800">Parolni tiklash</h2>
            <p class="text-sm text-slate-500">
              Parolingizni tiklash uchun administratorga murojaat qiling.
            </p>
            <button type="button" @click="switchMode('login')"
              class="w-full py-3 rounded-lg text-white font-semibold text-[15px]" style="background: #0f2439">
              Kirish sahifasiga qaytish
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
