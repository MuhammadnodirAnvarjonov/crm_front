<template>
  <form @submit.prevent="save" class="flex flex-col">
    <div class="p-1 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="relative">
        <BaseInput :label="$t('name_uz')" v-model="form.name_uz" required />
        <button type="button" @click="translateFrom('uz')" :disabled="!form.name_uz?.trim() || loading.uz"
          title="Boshqa tillarga tarjima qilish"
          class="absolute right-2 top-[30px] flex items-center justify-center w-7 h-7 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition">
          <svg v-if="loading.uz" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" stroke-opacity="0.25" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
          </svg>
          <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 8h14M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M7 8l4 8M17 8l-4 8M3 21h18" />
          </svg>
        </button>
      </div>

      <div class="relative">
        <BaseInput :label="$t('name_uzk')" v-model="form.name_uzk" required />
        <button type="button" @click="translateFrom('uzk')" :disabled="!form.name_uzk?.trim() || loading.uzk"
          title="Boshqa tillarga tarjima qilish"
          class="absolute right-2 top-[30px] flex items-center justify-center w-7 h-7 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition">
          <svg v-if="loading.uzk" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" stroke-opacity="0.25" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
          </svg>
          <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 8h14M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M7 8l4 8M17 8l-4 8M3 21h18" />
          </svg>
        </button>
      </div>

      <div class="relative">
        <BaseInput :label="$t('name_ru')" v-model="form.name_ru" required />
        <button type="button" @click="translateFrom('ru')" :disabled="!form.name_ru?.trim() || loading.ru"
          title="Boshqa tillarga tarjima qilish"
          class="absolute right-2 top-[30px] flex items-center justify-center w-7 h-7 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-30 disabled:cursor-not-allowed transition">
          <svg v-if="loading.ru" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" stroke-opacity="0.25" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
          </svg>
          <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 8h14M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M7 8l4 8M17 8l-4 8M3 21h18" />
          </svg>
        </button>
      </div>

      <BaseInputNumber :label="$t('index')" v-model="form.index" />
    </div>

    <p class="px-1 mt-2 text-[11px] text-gray-400 dark:text-slate-500">
      Maydon yoniga kiritilgan tarjima tugmasini bosing — boshqa tillarga avtomatik o'tkaziladi.
    </p>

    <div class="px-1 py-4 border-t border-gray-100 dark:border-slate-700 mt-4 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-800">
      <BaseButton type="button" status="gray" @click="$emit('close')">{{ $t('cancel') }}</BaseButton>
      <BaseButton type="submit" status="primary">{{ $t('save') }}</BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import jobTypeService from '@/services/jobTypes.service'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseInputNumber from '@/components/form/BaseInputNumber.vue'
import BaseButton from '@/components/form/BaseButton.vue'
import { autoTranslate } from '@/utils/translation'

const emit = defineEmits(['saved', 'close'])
const props = defineProps({ editData: Object })

const form = ref({
  name_uz: '',
  name_uzk: '',
  name_ru: '',
  index: 0,
})

const loading = reactive({ uz: false, uzk: false, ru: false })

const FIELD_BY_LANG = { uz: 'name_uz', uzk: 'name_uzk', ru: 'name_ru' }

const populate = (data) => {
  if (!data) {
    form.value = { name_uz: '', name_uzk: '', name_ru: '', index: 0 }
    return
  }
  form.value = {
    name_uz: data.name_uz || '',
    name_uzk: data.name_uzk || '',
    name_ru: data.name_ru || '',
    index: data.index ?? 0,
  }
}

// Tugma bosilganda — manba til (`from`) qiymatidan qolgan ikki maydonga tarjimani yozadi
// (boshqa maydonlarda qiymat bo'lsa ham bosib o'tkazadi — chunki foydalanuvchi qo'lda chaqirgan).
const translateFrom = async (from) => {
  const sourceField = FIELD_BY_LANG[from]
  const text = (form.value[sourceField] || '').trim()
  if (!text) return

  const targets = Object.keys(FIELD_BY_LANG).filter((k) => k !== from)
  targets.forEach((k) => (loading[k] = true))

  try {
    const translated = await autoTranslate(from, text)
    targets.forEach((k) => {
      const field = FIELD_BY_LANG[k]
      if (translated[field]) form.value[field] = translated[field]
    })
  } finally {
    targets.forEach((k) => (loading[k] = false))
  }
}

const save = async () => {
  const payload = { ...form.value }
  try {
    if (props.editData?.id) {
      await jobTypeService.update(props.editData.id, payload)
    } else {
      await jobTypeService.create(payload)
    }
    emit('saved')
    emit('close')
  } catch (e) {
    console.error('Job type save error', e)
  }
}

watch(() => props.editData, populate, { immediate: true })
</script>
