<script setup>
import { useRouter } from 'vue-router'
import { useGlobalStore } from '@/stores/global'

const globalData = useGlobalStore()
const router = useRouter()
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 text-white p-4">
    <div class="text-center">
      <h1 class="text-[8rem] md:text-[10rem] font-black leading-none drop-shadow-lg">
        {{ globalData.errorPage.error_code || 404 }}
      </h1>
      <p class="text-xl md:text-2xl font-medium mt-2 opacity-90">
        {{ globalData.errorPage.message || 'Sahifa topilmadi' }}
      </p>
      <button @click="router.push({ path: '/login' })"
        class="mt-8 px-8 py-3 bg-white text-blue-700 font-semibold rounded-xl shadow-lg hover:bg-blue-50 transition">
        Tizimga qaytish
      </button>
    </div>
  </div>
</template>
