t<template>
  <div>
    <!-- 🔹 Mobil backdrop (Orqa fon qorayishi) -->
    <transition name="fade">
      <div v-if="mobileOpen" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
        @click="$emit('toggle-mobile', false)"></div>
    </transition>

    <!-- 🔹 Sidebar -->
    <aside class="fixed top-0 left-0 h-full shadow-2xl flex flex-col transition-all duration-300 z-40 ease-in-out"
      style="background: linear-gradient(165deg, #13286e 0%, #1a3a8a 60%, #1e3f96 100%)" :class="[
        collapsed ? 'w-[260px] lg:w-[80px]' : 'w-[260px]',
      ]">

      <!-- Logo -->
      <div class="flex items-center justify-center h-16 relative px-3 border-b border-white/10">
        <transition name="fade" mode="out-in">
          <div v-if="isExpanded" class="flex items-center gap-2">
            <!-- CRM icon -->
            <svg viewBox="0 0 24 24" class="w-8 h-8 flex-shrink-0" fill="none" stroke="white" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            <div class="flex flex-col leading-none">
              <span class="text-xl font-extrabold tracking-tight text-white">CRM</span>
              <span class="text-[9px] text-white/60 uppercase tracking-widest font-medium">boshqaruv tizimi</span>
            </div>
          </div>
          <div v-else class="flex items-center justify-center">
            <svg viewBox="0 0 24 24" class="w-8 h-8" fill="none" stroke="white" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
        </transition>

        <!-- 🔹 Mobil yopish tugmasi -->
        <button
          class="absolute right-3 top-1/2 -translate-y-1/2 lg:hidden text-white/50 hover:text-white transition p-1.5 bg-white/10 hover:bg-white/20 rounded-lg z-50 cursor-pointer"
          @click="$emit('toggle-mobile', false)">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
            class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Menu -->
      <nav class="flex-1 overflow-y-auto scrollbar-hide py-3 px-2 space-y-0.5">
        <ul class="flex flex-col gap-1">
          <li v-for="(item, i) in filteredMenu" :key="i" class="relative"
            @mouseenter="handleMouseEnter($event, i, item)" @mouseleave="handleMouseLeave">

            <!-- Parent Item -->
            <div class="group relative flex items-center rounded-xl cursor-pointer transition-all duration-200" :class="[
              activeItem === item.key
                ? 'text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10',
              (!isExpanded) ? 'justify-center py-3 px-0' : 'justify-between px-3 py-2.5'
            ]"
              :style="activeItem === item.key ? 'background: linear-gradient(90deg, #E91E8C, #c4177a); box-shadow: 0 4px 15px rgba(233,30,140,0.35)' : ''"
              @click="handleParentClick(i, item)">

              <div class="flex items-center gap-3 relative z-10">
                <!-- Icon -->
                <span class="transition-transform duration-200 group-hover:scale-110 flex-shrink-0"
                  :class="activeItem === item.key ? 'text-white' : 'text-white/50 group-hover:text-white'">
                  <AppIcon :name="item.icon" :size="!isExpanded ? '26' : '22'" />
                </span>

                <!-- Label -->
                <transition name="fade">
                  <span v-if="isExpanded" class="font-medium text-[14px] truncate">
                    {{ t(item.label) }}
                  </span>
                </transition>
              </div>

              <!-- Arrow -->
              <svg v-if="item.children && isExpanded" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke-width="2.5" stroke="currentColor" :class="[
                  'w-3.5 h-3.5 transition-transform duration-300',
                  openMenus.includes(i) ? 'rotate-180 opacity-100' : 'opacity-40'
                ]">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>

            <!-- 🔹 Expanded Submenu -->
            <transition name="accordion">
              <ul v-if="item.children && openMenus.includes(i) && isExpanded"
                class="mt-1 ml-3 pl-3 border-l-2 space-y-0.5 overflow-hidden"
                style="border-color: rgba(233,30,140,0.35)">
                <li v-for="child in item.children" :key="child.key"
                  class="flex items-center gap-2.5 py-2 px-3 text-sm rounded-lg cursor-pointer transition-all duration-200"
                  :class="activeItem === child.key
                    ? 'text-white font-semibold'
                    : 'text-white/55 hover:text-white hover:bg-white/10'
                    " :style="activeItem === child.key ? 'background: rgba(233,30,140,0.25)' : ''"
                  @click.stop="setActive(child, i)">
                  <span class="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-300"
                    :style="activeItem === child.key ? 'background:#E91E8C' : 'background:rgba(255,255,255,0.3)'"></span>
                  <span class="truncate">{{ t(child.label) }}</span>
                </li>
              </ul>
            </transition>
          </li>
        </ul>
      </nav>

      <!-- 🔹 Floating Menu -->
      <transition name="popover">
        <div v-if="collapsed && hoveredItem && !mobileOpen"
          class="fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 w-56 hidden lg:block"
          :style="{ top: hoverTop + 'px', left: '85px' }" @mouseenter="cancelMouseLeave" @mouseleave="handleMouseLeave">

          <div class="px-3 py-2 border-b border-gray-100 mb-1 rounded-t-xl"
            style="background: linear-gradient(90deg, #fdf0f8, #eff6ff)">
            <span class="font-bold text-[#13286e] text-sm block">{{ t(hoveredItem.label) }}</span>
          </div>

          <ul v-if="hoveredItem.children" class="flex flex-col gap-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <li v-for="child in hoveredItem.children" :key="child.key"
              class="flex items-center gap-3 px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors"
              :class="activeItem === child.key ? 'font-semibold' : 'text-slate-600 hover:bg-pink-50 hover:text-[#E91E8C]'"
              :style="activeItem === child.key ? 'background:#fdf0f8; color:#E91E8C' : ''"
              @click.stop="setActive(child, null)">
              <div class="p-1 rounded-md shadow-sm"
                :style="activeItem === child.key ? 'background:#E91E8C' : 'background:#f3f4f6; color:#6b7280'">
                <AppIcon :name="child.icon || 'circle.svg'" size="14"
                  :style="activeItem === child.key ? 'color:white' : ''" />
              </div>
              <span>{{ t(child.label) }}</span>
            </li>
          </ul>

          <div class="absolute top-6 -left-1.5 w-3 h-3 bg-white border-l border-b border-gray-100 transform rotate-45">
          </div>
        </div>
      </transition>

      <!-- Footer User Profile -->
      <div class="p-3 border-t border-white/10" style="background: rgba(0,0,0,0.15)">
        <div class="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
          :class="!isExpanded ? 'justify-center' : ''">
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg"
            style="background: linear-gradient(135deg, #E91E8C, #c4177a); box-shadow: 0 2px 10px rgba(233,30,140,0.4)">
            A
          </div>
          <div v-if="isExpanded" class="overflow-hidden">
            <h4 class="text-sm font-bold text-white truncate">Admin User</h4>
            <p class="text-[10px] text-white/40 truncate tracking-wide">admin@crm.uz</p>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useUserStore } from "@/stores/user";
import { MENU_CONFIG } from "@/config/menuConfig";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const props = defineProps({
  collapsed: Boolean,
  mobileOpen: Boolean,
});
const emit = defineEmits(["toggle-mobile"]);

// 🔹 YANGI: Menyuni kengaytirilgan holda ko'rsatish sharti
// Agar mobil menyu ochiq bo'lsa (mobileOpen) YOKI desktopda menyu yig'ilmagan bo'lsa (!collapsed)
const isExpanded = computed(() => props.mobileOpen || !props.collapsed);

const openMenus = ref(JSON.parse(localStorage.getItem("openMenus")) || []);
const activeItem = ref(localStorage.getItem("activeItem") || null);

// Floating Menu Logic
const hoveredItem = ref(null);
const hoverTop = ref(0);
let hoverTimeout = null;


// Permission asosida filterlangan menyu
const filteredMenu = computed(() => {
  return MENU_CONFIG
    .map(item => {
      if (item.children) {
        const visibleChildren = item.children.filter(child => userStore.hasPermission(child.key));
        if (visibleChildren.length === 0) return null;
        return { ...item, children: visibleChildren };
      }
      // noPermission bo'lsa — barcha uchun ko'rinadi
      if (item.noPermission) return item;
      // Parent item uchun route key = item.key
      if (!userStore.hasPermission(item.key)) return null;
      return item;
    })
    .filter(Boolean);
});

// Handle Hover
const handleMouseEnter = (event, _index, item) => {
  // Mobilda hover ishlamasin
  if (!props.collapsed || window.innerWidth < 1024) return;

  clearTimeout(hoverTimeout);
  const rect = event.currentTarget.getBoundingClientRect();
  hoverTop.value = rect.top;
  hoveredItem.value = item;
};

const handleMouseLeave = () => {
  if (!props.collapsed) return;
  hoverTimeout = setTimeout(() => {
    hoveredItem.value = null;
  }, 150);
};

const cancelMouseLeave = () => {
  clearTimeout(hoverTimeout);
};

// Navigation Logic
const handleParentClick = (index, item) => {
  // Mobilda collapsed mantiqini ishlatmaymiz
  if (props.collapsed && !props.mobileOpen) {
    if (!item.children || item.children.length === 0) {
      activeItem.value = item.key;
      router.push(item.route || `/${item.key}`);
    }
    return;
  }

  if (item.children && item.children.length) {
    if (openMenus.value.includes(index))
      openMenus.value = openMenus.value.filter((i) => i !== index);
    else openMenus.value.push(index);
  } else {
    activeItem.value = item.key;
    router.push(item.route || `/${item.key}`);
    // Agar mobil menyu bo'lsa, bosganda yopilsin
    if (window.innerWidth < 1024) emitClose();
  }
};

const setActive = (child, parentIndex) => {
  activeItem.value = child.key;
  if (parentIndex !== null && !openMenus.value.includes(parentIndex)) {
    openMenus.value.push(parentIndex);
  }
  hoveredItem.value = null;
  router.push(child.route || `/${child.key}`);

  // Mobil menyuni yopish
  if (window.innerWidth < 1024) emitClose();
};

const emitClose = () => {
  emit("toggle-mobile", false);
};

// Watchers
watch(
  [() => route.path, filteredMenu],
  ([newPath]) => {
    const parentIndex = filteredMenu.value.findIndex(
      (m) => m.route === newPath || m.children?.some((c) => c.route === newPath)
    );
    if (parentIndex !== -1) {
      const foundParent = filteredMenu.value[parentIndex];
      const child = foundParent.children?.find((c) => c.route === newPath);
      activeItem.value = child ? child.key : foundParent.key;
      // Child item bo'lsa parent guruhini ochish
      if (child && !openMenus.value.includes(parentIndex)) {
        openMenus.value.push(parentIndex);
      }
    }
  },
  { immediate: true }
);

watch([openMenus, activeItem], () => {
  localStorage.setItem("openMenus", JSON.stringify(openMenus.value));
  localStorage.setItem("activeItem", activeItem.value);
});
</script>

<style scoped>
/* Avvalgi stillaringiz o'zgarishsiz qoladi */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s ease-in-out;
  max-height: 300px;
  opacity: 1;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}

.popover-enter-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.popover-leave-active {
  transition: all 0.15s ease-in;
}

.popover-enter-from {
  opacity: 0;
  transform: translateX(-10px) scale(0.95);
}

.popover-enter-to {
  opacity: 1;
  transform: translateX(0) scale(1);
}

.popover-leave-from {
  opacity: 1;
  transform: scale(1);
}

.popover-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>