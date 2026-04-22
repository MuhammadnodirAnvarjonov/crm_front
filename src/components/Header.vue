<script setup>
import { ref, computed, inject } from "vue";
import { onClickOutside } from "@vueuse/core";
import { useUserStore } from "@/stores/user";
import { useChatStore } from "@/stores/chat";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import axios from "axios";
import usersService from "@/services/users.service";
import { getPermissionRoutes } from "@/config/menuConfig";
import { disconnectSocket, reconnectSocket } from "@/composables/useSocket";
import BaseSearch from "@/components/form/BaseSearch.vue";
import BaseButton from "@/components/form/BaseButton.vue";
import BaseInput from "@/components/form/BaseInput.vue";

const chatStore = useChatStore();

const props = defineProps({
  collapsed: Boolean,
  isMobile: Boolean,
});

const emit = defineEmits(["toggle-sidebar", "toggle-mobile"]);

const userStore = useUserStore();
const router = useRouter();
const { locale, t } = useI18n();
const fileUrl = inject("fileUrl", "");

// Dropdown states
const userDropdownOpen = ref(false);
const langDropdownOpen = ref(false);

// HTML element refs
const userDropdownRef = ref(null);
const langDropdownRef = ref(null);

// Tashqariga bosganda yopish
onClickOutside(userDropdownRef, () => {
  userDropdownOpen.value = false;
  cancelSwitch();
});
onClickOutside(langDropdownRef, () => (langDropdownOpen.value = false));

// Til sozlamalari
const currentLang = computed(() => {
  if (locale.value === 'uz') return { flag: '🇺🇿', label: "O'zbekcha" };
  if (locale.value === 'uzk') return { flag: '🇺🇿', label: "Ўзбекча" };
  return { flag: '🇷🇺', label: "Русский" };
});

const setLang = (lang) => {
  locale.value = lang;
  localStorage.setItem("lang", lang);
  langDropdownOpen.value = false;
};

// --- Xodim almashtirish (Switch User) ---
const switchMode = ref(false);
const switchUsers = ref([]);
const selectedUser = ref(null);
const switchPassword = ref("");
const switchLoading = ref(false);
const switchError = ref("");
const switchSearch = ref("");

const filteredSwitchUsers = computed(() => {
  if (!switchSearch.value) return switchUsers.value;
  const q = switchSearch.value.toLowerCase();
  return switchUsers.value.filter(u =>
    u.user_name?.toLowerCase().includes(q) || u.role?.name?.toLowerCase().includes(q)
  );
});

const openSwitchMode = async () => {
  switchMode.value = true;
  switchError.value = "";
  switchPassword.value = "";
  selectedUser.value = null;
  const branchId = userStore.user?.branch_id;
  if (branchId) {
    try {
      const res = await usersService.getByBranch(branchId);
      switchUsers.value = res || [];
    } catch (e) {
      console.error("Switch users load error:", e);
    }
  }
};

const selectSwitchUser = (user) => {
  selectedUser.value = user;
  switchPassword.value = "";
  switchError.value = "";
};

const getFirstAllowedRoute = () => {
  for (const { key, route } of getPermissionRoutes()) {
    if (userStore.hasPermission(key)) return route;
  }
  return "/home";
};

const switchLogin = async () => {
  if (!selectedUser.value || !switchPassword.value) return;
  switchLoading.value = true;
  switchError.value = "";
  try {
    const res = await axios.post("/users/login", {
      branch_id: userStore.user?.branch_id,
      user_name: selectedUser.value.user_name,
      password: switchPassword.value,
    });
    if (res && res.token) {
      localStorage.setItem("token", res.token);
      userStore.setUser(res);
      res.token = '';
      res.password_hash = '';
      localStorage.setItem("user", JSON.stringify({ ...res }));
      reconnectSocket();
      switchMode.value = false;
      userDropdownOpen.value = false;
      window.location.href = getFirstAllowedRoute();
    } else {
      switchError.value = "Token topilmadi";
    }
  } catch (err) {
    switchError.value = t("login_error") || "Parol xato!";
  } finally {
    switchLoading.value = false;
  }
};

const cancelSwitch = () => {
  switchMode.value = false;
  switchError.value = "";
  switchPassword.value = "";
  switchSearch.value = "";
  selectedUser.value = null;
};

// Chiqish — branch_id ni saqlab qolish (tez qayta login uchun)
const logout = () => {
  userDropdownOpen.value = false;
  const branchId = userStore.user?.branch_id;
  disconnectSocket();
  userStore.clearUser();
  if (branchId) localStorage.setItem("last_branch_id", branchId);
  router.push({ name: "Login" });
};

// User avatar uchun ranglar
const userInitial = computed(() =>
  userStore.user?.user_name ? userStore.user.user_name.charAt(0).toUpperCase() : "A"
);
</script>

<template>
  <!-- 
    NOTE: width va left hisoblash SHART EMAS. 
    Layout.vue da Header main wrapper ichida turgani uchun "w-full" o'zi yetarli.
  -->
  <header
    class="sticky top-0 z-[1] w-full h-16 bg-white flex items-center justify-between px-4 sm:px-6 transition-all duration-300"
    style="border-bottom: 2px solid #f0f4ff; box-shadow: 0 1px 12px rgba(19,40,110,0.07)">

    <!-- Pink top accent line -->
    <div class="absolute top-0 left-0 right-0 h-0.5" style="background: linear-gradient(90deg, #E91E8C, #1e3a8a)"></div>

    <!-- 🔹 LEFT: Toggle & Title -->
    <div class="flex items-center gap-3 md:gap-4">
      <button
        class="p-2 rounded-xl transition-all duration-200 focus:outline-none active:scale-95 z-1"
        style="color:#6b7280"
        @mouseenter="e => e.currentTarget.style.cssText='background:#fdf0f8;color:#E91E8C;border-radius:0.75rem;padding:0.5rem;transition:all 0.2s'"
        @mouseleave="e => e.currentTarget.style.cssText='color:#6b7280;border-radius:0.75rem;padding:0.5rem;transition:all 0.2s'"
        @click="isMobile ? emit('toggle-mobile') : emit('toggle-sidebar')" :title="isMobile ? 'Menu' : 'Sidebar'">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
          class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      <!-- Breadcrumb / Sahifa nomi -->
      <div class="hidden sm:flex flex-col">
        <h2 class="text-base font-bold leading-none tracking-tight" style="color:#13286e">
          Dashboard
        </h2>
        <span class="text-[11px] font-medium mt-0.5" style="color:#E91E8C">Xush kelibsiz!</span>
      </div>
    </div>

    <!-- 🔹 RIGHT: Actions -->
    <div class="flex items-center gap-2 sm:gap-3">

      <!-- 1. Language Switcher -->
      <div class="relative" ref="langDropdownRef">
        <button @click="langDropdownOpen = !langDropdownOpen"
          class="flex items-center justify-center gap-2 px-2.5 py-1.5 rounded-lg transition-all border border-transparent hover:border-pink-100"
          style="color:#4b5563"
          @mouseenter="e => e.currentTarget.style.background='#fdf0f8'"
          @mouseleave="e => e.currentTarget.style.background='transparent'">
          <span class="text-xl leading-none filter drop-shadow-sm">{{ currentLang.flag }}</span>
          <span class="text-sm font-medium hidden md:block">{{ currentLang.label }}</span>
          <svg class="w-3 h-3 hidden md:block" style="color:#9ca3af" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Dropdown -->
        <transition name="dropdown">
          <div v-if="langDropdownOpen"
            class="absolute right-0 top-14 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 z-[1]">
            <button @click="setLang('uz')"
              class="w-full px-4 py-2.5 text-left flex items-center gap-3 text-sm transition-colors"
              :style="locale === 'uz' ? 'background:#fdf0f8; color:#E91E8C; font-weight:700' : 'color:#374151'"
              @mouseenter="e => { if(locale!=='uz') e.currentTarget.style.background='#fdf0f8' }"
              @mouseleave="e => { if(locale!=='uz') e.currentTarget.style.background='transparent' }">
              <span class="text-lg">🇺🇿</span>
              <span>O'zbekcha</span>
            </button>
            <button @click="setLang('uzk')"
              class="w-full px-4 py-2.5 text-left flex items-center gap-3 text-sm transition-colors"
              :style="locale === 'uzk' ? 'background:#fdf0f8; color:#E91E8C; font-weight:700' : 'color:#374151'"
              @mouseenter="e => { if(locale!=='uzk') e.currentTarget.style.background='#fdf0f8' }"
              @mouseleave="e => { if(locale!=='uzk') e.currentTarget.style.background='transparent' }">
              <span class="text-lg">🇺🇿</span>
              <span>Ўзбекча</span>
            </button>
            <button @click="setLang('ru')"
              class="w-full px-4 py-2.5 text-left flex items-center gap-3 text-sm transition-colors"
              :style="locale === 'ru' ? 'background:#fdf0f8; color:#E91E8C; font-weight:700' : 'color:#374151'"
              @mouseenter="e => { if(locale!=='ru') e.currentTarget.style.background='#fdf0f8' }"
              @mouseleave="e => { if(locale!=='ru') e.currentTarget.style.background='transparent' }">
              <span class="text-lg">🇷🇺</span>
              <span>Русский</span>
            </button>
          </div>
        </transition>
      </div>

      <!-- 2. Chat / Notifications -->
      <button
        @click="chatStore.openChatModal()"
        class="relative p-2.5 rounded-full transition-all active:scale-95 group"
        style="color:#6b7280"
        @mouseenter="e => { e.currentTarget.style.background='#fdf0f8'; e.currentTarget.style.color='#E91E8C' }"
        @mouseleave="e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#6b7280' }"
        title="Chat">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor"
          class="w-6 h-6 group-hover:animate-swing">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
        </svg>
        <!-- Unread Badge -->
        <span v-if="chatStore.totalUnread > 0"
          class="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1 shadow-sm"
          style="background:#E91E8C">
          {{ chatStore.totalUnread > 99 ? '99+' : chatStore.totalUnread }}
        </span>
      </button>

      <div class="h-8 w-[1px] mx-1 hidden sm:block" style="background:#e5e7eb"></div>

      <!-- 3. User Profile -->
      <div class="relative" ref="userDropdownRef">
        <button @click="userDropdownOpen = !userDropdownOpen"
          class="flex items-center gap-3 focus:outline-none group p-1 pr-2.5 rounded-full transition-all border border-transparent hover:border-pink-100"
          @mouseenter="e => e.currentTarget.style.background='#fdf0f8'"
          @mouseleave="e => e.currentTarget.style.background='transparent'">
          <!-- Avatar -->
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold ring-2 ring-white group-hover:scale-105 transition-transform shadow-md"
            style="background: linear-gradient(135deg, #E91E8C, #13286e); box-shadow: 0 2px 8px rgba(233,30,140,0.3)">
            {{ userInitial }}
          </div>

          <!-- Text Info (Desktop) -->
          <div class="hidden md:flex flex-col text-right leading-tight">
            <span class="font-bold text-sm" style="color:#13286e">
              {{ userStore.user?.user_name || "Foydalanuvchi" }}
            </span>
            <span class="text-[10px] uppercase font-semibold tracking-wider" style="color:#E91E8C">
              {{ userStore.user?.role?.name || "Admin" }}
            </span>
          </div>

          <!-- Chevron -->
          <svg class="w-4 h-4 transition-transform duration-200 hidden md:block" style="color:#9ca3af"
            :class="{ 'rotate-180': userDropdownOpen }" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        <!-- User Dropdown Menu -->
        <transition name="dropdown">
          <div v-if="userDropdownOpen"
            class="absolute right-0 top-14 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[1] origin-top-right"
            :class="switchMode ? 'w-72' : 'w-60'">

            <!-- Xodim almashtirish rejimi -->
            <template v-if="switchMode">
              <!-- Sarlavha -->
              <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-2"
                style="background: linear-gradient(90deg, #fdf0f8, #eff6ff)">
                <button @click="cancelSwitch" class="p-1 rounded-lg hover:bg-white/60 transition-colors" title="Orqaga">
                  <svg class="w-4 h-4" style="color:#13286e" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <p class="font-bold text-sm" style="color:#13286e">Xodim almashtirish</p>
              </div>

              <!-- Xatolik -->
              <div v-if="switchError" class="mx-3 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
                {{ switchError }}
              </div>

              <!-- Xodim tanlangan: parol kiritish -->
              <div v-if="selectedUser" class="p-3 space-y-3">
                <div class="flex items-center gap-3 p-2 rounded-lg" style="background:#f0f4ff">
                  <img v-if="selectedUser.image" :src="fileUrl + selectedUser.image"
                    class="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm" />
                  <div v-else class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style="background: linear-gradient(135deg, #E91E8C, #13286e)">
                    {{ selectedUser.user_name?.charAt(0).toUpperCase() }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold truncate" style="color:#13286e">{{ selectedUser.user_name }}</p>
                    <p class="text-[10px] font-medium" style="color:#E91E8C">{{ selectedUser.role?.name || '' }}</p>
                  </div>
                  <button @click="selectedUser = null; switchPassword = ''; switchError = ''"
                    class="p-1 rounded hover:bg-gray-200 transition-colors">
                    <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form @submit.prevent="switchLogin" class="space-y-2">
                  <BaseInput v-model="switchPassword" type="password" size="sm"
                    :placeholder="t('password_placeholder') || 'Parolni kiriting'" />
                  <BaseButton type="submit" status="pink" size="sm" full-width
                    :loading="switchLoading" :disabled="!switchPassword"
                    :label="t('enter') || 'Kirish'" />
                </form>
              </div>

              <!-- Xodimlar ro'yxati -->
              <div v-else class="p-2">
                <!-- Search -->
                <BaseSearch v-model="switchSearch" size="sm" full-width placeholder="Qidirish..." class="mb-2" />
                <div class="max-h-56 overflow-y-auto">
                <button v-for="user in filteredSwitchUsers" :key="user.id"
                  @click="selectSwitchUser(user)"
                  class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-blue-50"
                  :class="user.user_name === userStore.user?.user_name ? 'bg-pink-50' : ''">
                  <img v-if="user.image" :src="fileUrl + user.image"
                    class="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm" />
                  <div v-else class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style="background: linear-gradient(135deg, #E91E8C, #13286e)">
                    {{ user.user_name?.charAt(0).toUpperCase() }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium truncate" style="color:#13286e">{{ user.user_name }}</p>
                    <p class="text-[10px]" style="color:#9ca3af">{{ user.role?.name || '' }}</p>
                  </div>
                  <span v-if="user.user_name === userStore.user?.user_name" class="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style="background:#fdf0f8; color:#E91E8C">Siz</span>
                </button>
                <p v-if="!filteredSwitchUsers.length" class="text-center text-xs text-gray-400 py-4">Xodimlar topilmadi</p>
                </div>
              </div>
            </template>

            <!-- Oddiy dropdown menu -->
            <template v-else>
              <!-- Header gradient -->
              <div class="px-5 py-3 border-b border-gray-100 rounded-t-xl"
                style="background: linear-gradient(90deg, #fdf0f8, #eff6ff)">
                <p class="font-bold text-sm" style="color:#13286e">{{ userStore.user?.user_name }}</p>
                <p class="text-xs mt-0.5" style="color:#E91E8C">{{ userStore.user?.role?.name || 'Admin' }}</p>
              </div>

              <div class="p-2 mt-1 space-y-1">
                <!-- Xodim almashtirish -->
                <button v-if="userStore.roleSetting('switch_users')" @click="openSwitchMode"
                  class="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors group"
                  style="color:#13286e">
                  <svg class="w-5 h-5 transition-colors" style="color:#6b7280" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                  </svg>
                  Xodim almashtirish
                </button>

                <!-- Chiqish -->
                <button @click="logout"
                  class="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors group">
                  <svg class="w-5 h-5 text-red-400 group-hover:text-red-600 transition-colors" fill="none"
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1">
                    </path>
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
/* Qo'ng'iroqcha animatsiyasi */
@keyframes swing {
  20% {
    transform: rotate(15deg);
  }

  40% {
    transform: rotate(-10deg);
  }

  60% {
    transform: rotate(5deg);
  }

  80% {
    transform: rotate(-5deg);
  }

  100% {
    transform: rotate(0deg);
  }
}

.group-hover\:animate-swing:hover {
  animation: swing 0.5s ease-in-out;
}

/* Dropdown ochilish animatsiyasi */
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