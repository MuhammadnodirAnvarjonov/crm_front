<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import anketaService from '@/services/anketa.service'
import ConfirmModal from '@/components/ConfirmModal.vue'

const { locale } = useI18n()

const searchQuery = ref('')
const items = ref([])
const loading = ref(false)
const showConfirmModal = ref(false)
const itemToRemove = ref(null)

const nameByLocale = (obj) => {
  if (!obj) return ''
  const lang = locale.value
  return (lang === 'ru' ? obj.name_ru : lang === 'uzk' ? obj.name_uzk : obj.name_uz) || obj.name_uz || ''
}

const formatDate = (d) => {
  if (!d) return ''
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()}`
}

const view = computed(() => {
  return items.value.map((c) => {
    const fullName = [c.surname, c.name, c.middle_name].filter(Boolean).join(' ') || c.name || '—'
    return {
      id: c.id,
      raw: c,
      name: fullName,
      job: nameByLocale(c.job_type) || '—',
      phone: c.phone_number || '',
      reason: c.blacklist_reason || '—',
      blacklistedAt: formatDate(c.blacklisted_at),
    }
  })
})

const filtered = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return view.value
  return view.value.filter(
    (p) => p.name.toLowerCase().includes(q) || p.phone.includes(q),
  )
})

const loadBlacklist = async () => {
  loading.value = true
  try {
    const data = await anketaService.all({ is_blacklisted: true })
    items.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Blacklist load error', e)
    items.value = []
  } finally {
    loading.value = false
  }
}

const promptRemove = (item) => {
  itemToRemove.value = item
  showConfirmModal.value = true
}

const handleConfirmRemove = async () => {
  if (!itemToRemove.value) return
  try {
    await anketaService.removeFromBlacklist(itemToRemove.value.id)
    showConfirmModal.value = false
    itemToRemove.value = null
    await loadBlacklist()
  } catch (e) {
    console.error('Unblacklist error', e)
    showConfirmModal.value = false
  }
}

onMounted(loadBlacklist)
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">{{ $t('blacklist') }}</h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">{{ $t('blacklist_subtitle') }}</p>
      </div>
      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 text-red-600 text-[12px] font-semibold">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="9" />
          <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
        </svg>
        Jami: {{ filtered.length }}
      </span>
    </div>

    <!-- Search -->
    <div class="bg-white rounded-xl border border-slate-100 p-3">
      <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
        <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input v-model="searchQuery" :placeholder="$t('name_or_phone')"
          class="flex-1 bg-transparent text-[13px] placeholder-slate-400 focus:outline-none" />
      </div>
    </div>

    <!-- Empty -->
    <div v-if="!loading && filtered.length === 0"
      class="bg-white rounded-xl border border-slate-100 py-16 px-4 flex flex-col items-center gap-3 text-center">
      <div class="w-16 h-16 bg-red-50 rounded-2xl text-red-300 flex items-center justify-center">
        <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="9" />
          <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
        </svg>
      </div>
      <p class="text-sm text-slate-400">Qora ro'yxatda nomzodlar yo'q</p>
    </div>

    <!-- Cards grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <article v-for="p in filtered" :key="p.id"
        class="bg-white rounded-xl border-2 border-red-500 p-4 space-y-3 hover:shadow-md transition">

        <!-- Avatar + name + badge -->
        <div class="flex items-start gap-3">
          <div
            class="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg shrink-0">
            {{ p.name.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[15px] font-bold text-slate-800 truncate">{{ p.name }}</p>
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

        <!-- Info -->
        <div class="space-y-1 text-[13px]">
          <p><span class="font-semibold text-slate-700">Kasb:</span> <span class="text-slate-600">{{ p.job }}</span></p>
          <p>
            <span class="font-semibold text-slate-700">Telefon:</span>
            <span class="text-slate-600 ml-1">{{ p.phone }}</span>
          </p>
          <p v-if="p.blacklistedAt">
            <span class="font-semibold text-slate-700">Sana:</span>
            <span class="text-slate-600 ml-1">{{ p.blacklistedAt }}</span>
          </p>
        </div>

        <div class="border-t border-slate-100"></div>

        <!-- Reason -->
        <div>
          <p class="text-[13px] font-semibold text-red-500 mb-2">Sababi:</p>
          <div class="px-3 py-2 rounded-lg border border-slate-200 bg-white text-[13px] text-slate-700 break-words">
            {{ p.reason }}
          </div>
        </div>

        <!-- Remove button -->
        <button @click="promptRemove(p)"
          class="w-full py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition">
          Ro'yxatdan chiqarish
        </button>
      </article>
    </div>

    <ConfirmModal v-if="showConfirmModal" :show="showConfirmModal"
      title="Qora ro'yxatdan chiqarish"
      :message="`${itemToRemove?.name || ''} ni qora ro'yxatdan chiqarishni tasdiqlaysizmi?`"
      confirm-text="Ha, chiqarish" cancel-text="Bekor qilish" type="info" :duration="0"
      @confirm="handleConfirmRemove" @cancel="showConfirmModal = false" />
  </div>
</template>
