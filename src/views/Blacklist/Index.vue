<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')

const blacklisted = ref([
  {
    name: 'Abdullo Xayriddinov',
    job: 'Dasturchi',
    phone: '+998901234567',
    rating: 3,
    reason: 'Test uchun',
  },
])

const filtered = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return blacklisted.value
  return blacklisted.value.filter(
    (p) => p.name.toLowerCase().includes(q) || p.phone.includes(q),
  )
})

const removeFromList = (idx) => {
  blacklisted.value.splice(idx, 1)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div>
      <h1 class="text-xl sm:text-2xl font-bold text-slate-800">Qora Ro'yxat</h1>
      <p class="text-xs sm:text-sm text-slate-500 mt-1">Ishonchsiz va qora ro'yxatga tushgan nomzodlar</p>
    </div>

    <!-- Search -->
    <div class="bg-white rounded-xl border border-slate-100 p-3">
      <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
        <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input v-model="searchQuery" placeholder="Nomzod ismi yoki telefon raqamini kiriting"
          class="flex-1 bg-transparent text-[13px] placeholder-slate-400 focus:outline-none" />
      </div>
    </div>

    <!-- Cards grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <article v-for="(p, i) in filtered" :key="i"
        class="bg-white rounded-xl border-2 border-red-500 p-4 space-y-3 hover:shadow-md transition">

        <!-- Avatar + name + badge -->
        <div class="flex items-start gap-3">
          <div
            class="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg shrink-0">
            {{ p.name.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[15px] font-bold text-slate-800">{{ p.name }}</p>
            <span
              class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-red-500 text-white text-[11px] font-semibold">
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="9" />
                <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
              </svg>
              Qora ro'yxat
            </span>
          </div>
        </div>

        <!-- Rating -->
        <div class="flex items-center gap-3 px-3 py-2 rounded-lg bg-red-50">
          <span class="text-[13px] font-semibold text-red-500">Reyting:</span>
          <div class="flex gap-0.5">
            <svg v-for="n in 3" :key="n" class="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="currentColor">
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
            </svg>
          </div>
        </div>

        <!-- Info -->
        <div class="space-y-1 text-[13px]">
          <p><span class="font-semibold text-slate-700">Kasb:</span> <span class="text-slate-600">{{ p.job }}</span></p>
          <p>
            <span class="font-semibold text-slate-700">Telefon:</span>
            <span class="text-slate-600 ml-1">{{ p.phone }}</span>
          </p>
        </div>

        <div class="border-t border-slate-100"></div>

        <!-- Reason -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <p class="text-[13px] font-semibold text-red-500">Sababi:</p>
            <button class="p-1 text-slate-400 hover:text-slate-700 rounded">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
          <div class="px-3 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-700">
            {{ p.reason }}
          </div>
        </div>

        <!-- Remove button -->
        <button @click="removeFromList(i)"
          class="w-full py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition">
          Ro'yxatdan chiqarish
        </button>
      </article>

      <!-- Empty state -->
      <div v-if="!filtered.length" class="col-span-full text-center py-10">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-3">
          <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
            stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9" />
            <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
          </svg>
        </div>
        <p class="text-sm text-slate-400">Qora ro'yxatda nomzodlar yo'q</p>
      </div>
    </div>
  </div>
</template>
