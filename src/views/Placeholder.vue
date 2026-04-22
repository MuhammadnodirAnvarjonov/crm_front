<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { MENU_CONFIG } from '@/config/menuConfig'
import MenuIcon from '@/components/MenuIcon.vue'

const route = useRoute()

const menuItem = computed(() =>
  MENU_CONFIG.find((m) => m.key === route.name) || { label: 'Sahifa', icon: 'home' },
)
</script>

<template>
  <div class="min-h-[60vh] flex items-center justify-center">
    <div class="text-center bg-white rounded-2xl border border-slate-100 p-10 max-w-md">
      <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
        <MenuIcon :name="menuItem.icon" class="w-8 h-8" />
      </div>
      <h2 class="text-xl font-bold text-slate-800">{{ menuItem.label }}</h2>
      <p class="text-sm text-slate-400 mt-2">
        Bu bo'lim ishlab chiqilmoqda. Tez orada foydalanishga tayyor bo'ladi.
      </p>
    </div>
  </div>
</template>
