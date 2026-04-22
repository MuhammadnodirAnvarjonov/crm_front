<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useChatStore } from "@/stores/chat";
import { useChat } from "@/composables/useChat";
import { useI18n } from "vue-i18n";
import Header from "@/components/Header.vue";
import Menu from "@/components/Menu.vue";
import ChatModal from "@/components/chat/ChatModal.vue";

const collapsed = ref(false);
const mobileOpen = ref(false);
const isMobile = ref(false);
const isPageLoading = ref(false); // Router almashish holati

const router = useRouter();
const userStore = useUserStore();
const chatStore = useChatStore();
const { initChatListeners, cleanupChatListeners } = useChat();
const { locale } = useI18n();

const toggleSidebar = () => (collapsed.value = !collapsed.value);
const toggleMobile = ($event, action) => {
  mobileOpen.value = !mobileOpen.value
};
const closeMobile = () => (mobileOpen.value = false);

// Ekranni o'lchash
const handleResize = () => {
  isMobile.value = window.innerWidth < 1024;
  if (!isMobile.value) {
    mobileOpen.value = false;
    // Desktopda juda kichik bo'lsa avtomatik yig'ish (ixtiyoriy)
    if (window.innerWidth < 1200) collapsed.value = true;
  }
};

// Router hodisalarini tinglash (Loader uchun)
router.beforeEach(() => {
  isPageLoading.value = true;
  // Telefonda sahifa almashganda menyuni yopish
  if (isMobile.value) closeMobile();
});

router.afterEach(() => {
  // Biroz kechikish bilan o'chirish (animatsiya silliq bo'lishi uchun)
  setTimeout(() => {
    isPageLoading.value = false;
  }, 300);
});

onMounted(async () => {
  handleResize();
  window.addEventListener("resize", handleResize);

  // Tilni yuklash
  const lang = localStorage.getItem("lang") || "uz";
  locale.value = lang;

  // Foydalanuvchini tekshirish
  await userStore.initUser();
  if (!userStore.user) {
    router.push({ name: "Login" });
  } else {
    // Chat tizimini ishga tushirish
    await chatStore.ensureGeneralRoom();
    await chatStore.fetchUnreadTotal();
    initChatListeners();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  cleanupChatListeners();
});
</script>

<template>
  <!-- 1. Global App Loader -->
  <div v-if="!userStore.user" class="fixed inset-0 flex flex-col items-center justify-center z-[9999]"
    style="background: linear-gradient(135deg, #f8f0f7 0%, #eff4ff 100%)">
    <div class="mb-5 flex items-center gap-3">
      <svg viewBox="0 0 40 36" class="w-10 h-10" fill="none">
        <path d="M20 34 C20 34 2 22 2 11 C2 5.5 6.5 1 12 1 C15.5 1 18.5 2.8 20 5.5 C21.5 2.8 24.5 1 28 1 C33.5 1 38 5.5 38 11 C38 22 20 34 20 34Z"
          fill="#E91E8C" />
      </svg>
      <span class="text-2xl font-extrabold" style="color:#13286e">Evo<span style="color:#E91E8C">med</span></span>
    </div>
    <div class="w-10 h-10 rounded-full border-4 border-pink-100 border-t-[#E91E8C] animate-spin mb-4"></div>
    <p class="text-sm font-medium animate-pulse" style="color:#13286e">Tizim yuklanmoqda...</p>
  </div>

  <!-- 2. Asosiy Layout -->
  <div v-else class="h-screen flex overflow-hidden" style="background: #f3f6ff">

    <!-- Mobile Overlay -->
    <div v-if="isMobile && mobileOpen" @click="closeMobile"
      class="fixed inset-0 z-20 backdrop-blur-sm transition-opacity duration-300"
      style="background: rgba(19,40,110,0.5)"></div>

    <!-- Sidebar (Menu) -->
    <aside
      class="fixed top-0 left-0 z-30 h-full shadow-xl transition-all duration-300 ease-in-out"
      :class="[
        isMobile
          ? (mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64')
          : (collapsed ? 'w-20' : 'w-[260px]')
      ]">
      <Menu :collapsed="collapsed && !isMobile" />
    </aside>

    <!-- Main Content Wrapper -->
    <div class="flex-1 flex flex-col min-h-0 transition-all duration-300 ease-in-out min-w-0" :class="[
      isMobile ? 'ml-0' : (collapsed ? 'ml-20' : 'ml-[260px]')
    ]">

      <!-- Header (Sticky Top) -->
      <header class="sticky top-0 z-40 h-16">
        <Header :collapsed="collapsed" :is-mobile="isMobile" @toggle-sidebar="toggleSidebar"
          @toggle-mobile="toggleMobile" />
      </header>

      <!-- Main Section -->
      <main class="flex-1 p-3 md:p-4 relative flex flex-col min-w-0 min-h-0 overflow-auto">

        <!-- Router View Loader -->
        <div v-if="isPageLoading"
          class="absolute inset-0 z-10 flex items-start justify-center pt-20"
          style="background: rgba(243,246,255,0.75); backdrop-filter: blur(2px)">
          <div class="bg-white p-4 rounded-full shadow-lg">
            <div class="w-8 h-8 rounded-full border-2 border-pink-100 border-t-[#E91E8C] animate-spin"></div>
          </div>
        </div>

        <!-- Router View with Transition -->
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <div :key="$route.path" class="w-full min-w-0 flex flex-col">
              <component :is="Component" />
            </div>
          </transition>
        </router-view>

      </main>

      <!-- Footer -->
      <footer class="text-center py-2 text-xs" style="color:#13286e; opacity:0.4">
        &copy; {{ new Date().getFullYear() }} CRM. Barcha huquqlar himoyalangan.
      </footer>
    </div>

    <!-- Chat Modal (Teleport orqali body ga chiqadi) -->
    <ChatModal />
  </div>
</template>

<style scoped>
/* Sahifa almashish animatsiyasi */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
  /* Pastdan chiqib kelish effekti */
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>