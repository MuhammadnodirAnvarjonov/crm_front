<template>
  <form @submit.prevent="save" class="flex flex-col">
    <!-- Yuqori boshqaruv paneli: hammasini tarjima qilish -->
    <div class="px-1 pb-3 mb-3 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-end gap-3">
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-gray-700 dark:text-slate-200 select-none">
          Manba til
        </label>
        <select v-model="bulkSource"
          class="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-gray-900 dark:text-slate-100 outline-none hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
          <option value="uz">UZ (lotin)</option>
          <option value="uzk">UZK (kirill)</option>
          <option value="ru">RU</option>
        </select>
      </div>

      <button type="button" @click="translateAll" :disabled="bulkLoading || !hasAnySource"
        class="h-[40px] px-4 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-sm transition">
        <svg v-if="bulkLoading" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" stroke-opacity="0.25" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
        </svg>
        <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 8h14M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M7 8l4 8M17 8l-4 8M3 21h18" />
        </svg>
        Hammasini tarjima qilish
      </button>

      <p class="sm:ml-auto text-[11px] text-gray-400 dark:text-slate-500 self-center">
        Maksimal {{ MAX_ROWS }} ta qator. Hozir: {{ rows.length }}
      </p>
    </div>

    <!-- Qatorlar ro'yxati -->
    <div class="flex flex-col gap-3 max-h-[55vh] overflow-y-auto pr-1">
      <div v-for="(row, idx) in rows" :key="row._key"
        class="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/30 p-3">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-bold text-gray-500 dark:text-slate-400">
            #{{ idx + 1 }}
          </span>
          <button type="button" @click="removeRow(idx)" :disabled="rows.length === 1"
            class="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="O'chirish">
            <trashIcon size="w-4 h-4" />
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="relative">
            <BaseInput :label="$t('name_uz')" v-model="row.name_uz" required size="sm" />
            <button type="button" @click="translateRow(idx, 'uz')"
              :disabled="!row.name_uz?.trim() || row._loading.uz" title="Shu qatordan tarjima qilish"
              class="absolute right-1.5 top-[24px] flex items-center justify-center w-6 h-6 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition">
              <svg v-if="row._loading.uz" class="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" stroke-opacity="0.25" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
              </svg>
              <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 8h14M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M7 8l4 8M17 8l-4 8M3 21h18" />
              </svg>
            </button>
          </div>

          <div class="relative">
            <BaseInput :label="$t('name_uzk')" v-model="row.name_uzk" required size="sm" />
            <button type="button" @click="translateRow(idx, 'uzk')"
              :disabled="!row.name_uzk?.trim() || row._loading.uzk" title="Shu qatordan tarjima qilish"
              class="absolute right-1.5 top-[24px] flex items-center justify-center w-6 h-6 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition">
              <svg v-if="row._loading.uzk" class="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" stroke-opacity="0.25" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
              </svg>
              <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 8h14M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M7 8l4 8M17 8l-4 8M3 21h18" />
              </svg>
            </button>
          </div>

          <div class="relative">
            <BaseInput :label="$t('name_ru')" v-model="row.name_ru" required size="sm" />
            <button type="button" @click="translateRow(idx, 'ru')"
              :disabled="!row.name_ru?.trim() || row._loading.ru" title="Shu qatordan tarjima qilish"
              class="absolute right-1.5 top-[24px] flex items-center justify-center w-6 h-6 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition">
              <svg v-if="row._loading.ru" class="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" stroke-opacity="0.25" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
              </svg>
              <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 8h14M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M7 8l4 8M17 8l-4 8M3 21h18" />
              </svg>
            </button>
          </div>

          <BaseInputNumber :label="$t('index')" v-model="row.index" size="sm" />
        </div>
      </div>
    </div>

    <!-- Qator qo'shish tugmasi -->
    <div class="mt-3 px-1">
      <button type="button" @click="addRow" :disabled="rows.length >= MAX_ROWS"
        class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm font-semibold">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Qator qo'shish
      </button>
    </div>

    <p class="px-1 mt-2 text-[11px] text-gray-400 dark:text-slate-500">
      Har bir qator yonidagi tarjima tugmasi — faqat shu qator uchun. Yuqoridagi tugma — hammasini birgalikda tarjima qiladi.
    </p>

    <div class="px-1 py-4 border-t border-gray-100 dark:border-slate-700 mt-4 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-800">
      <BaseButton type="button" status="gray" @click="$emit('close')">{{ $t('cancel') }}</BaseButton>
      <BaseButton type="submit" status="primary" :loading="saving">
        {{ $t('save') }} ({{ rows.length }})
      </BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue'
import jobTypeService from '@/services/jobTypes.service'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseInputNumber from '@/components/form/BaseInputNumber.vue'
import BaseButton from '@/components/form/BaseButton.vue'
import { trashIcon } from '@/components/icons/icon-temp'
import { autoTranslate } from '@/utils/translation'

const emit = defineEmits(['saved', 'close'])

const MAX_ROWS = 50
const FIELD_BY_LANG = { uz: 'name_uz', uzk: 'name_uzk', ru: 'name_ru' }

let rowSeq = 0
const makeRow = () => ({
  _key: ++rowSeq,
  name_uz: '',
  name_uzk: '',
  name_ru: '',
  index: 0,
  _loading: { uz: false, uzk: false, ru: false },
})

const rows = ref([makeRow()])
const bulkSource = ref('uz')
const bulkLoading = ref(false)
const saving = ref(false)

const hasAnySource = computed(() => {
  const field = FIELD_BY_LANG[bulkSource.value]
  return rows.value.some((r) => (r[field] || '').trim())
})

const addRow = () => {
  if (rows.value.length >= MAX_ROWS) return
  rows.value.push(makeRow())
}

const removeRow = (idx) => {
  if (rows.value.length === 1) return
  rows.value.splice(idx, 1)
}

const translateRow = async (idx, from) => {
  const row = rows.value[idx]
  const sourceField = FIELD_BY_LANG[from]
  const text = (row[sourceField] || '').trim()
  if (!text) return

  const targets = Object.keys(FIELD_BY_LANG).filter((k) => k !== from)
  targets.forEach((k) => (row._loading[k] = true))

  try {
    const translated = await autoTranslate(from, text)
    targets.forEach((k) => {
      const field = FIELD_BY_LANG[k]
      if (translated[field]) row[field] = translated[field]
    })
  } finally {
    targets.forEach((k) => (row._loading[k] = false))
  }
}

const translateAll = async () => {
  const from = bulkSource.value
  const sourceField = FIELD_BY_LANG[from]
  bulkLoading.value = true
  try {
    await Promise.all(
      rows.value.map(async (row) => {
        const text = (row[sourceField] || '').trim()
        if (!text) return
        const translated = await autoTranslate(from, text)
        Object.keys(FIELD_BY_LANG)
          .filter((k) => k !== from)
          .forEach((k) => {
            const field = FIELD_BY_LANG[k]
            if (translated[field]) row[field] = translated[field]
          })
      })
    )
  } finally {
    bulkLoading.value = false
  }
}

const save = async () => {
  saving.value = true
  try {
    const payloads = rows.value.map((r) => ({
      name_uz: r.name_uz,
      name_uzk: r.name_uzk,
      name_ru: r.name_ru,
      index: r.index ?? 0,
    }))
    await Promise.all(payloads.map((p) => jobTypeService.create(p)))
    emit('saved')
    emit('close')
  } catch (e) {
    console.error('Job type bulk save error', e)
  } finally {
    saving.value = false
  }
}
</script>
