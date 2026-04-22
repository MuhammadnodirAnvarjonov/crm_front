<script setup>
import { useNotification } from '@/composables/useNotification'
import { ref, watch } from 'vue'
import { useErrorStore } from '@/stores/errors'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const { error, success } = useNotification()
const error_store = useErrorStore()

watch(
  () => error_store.error_text,
  (val) => {
    if (val) {
      error(t('error'), val.toString())
      setTimeout(() => (error_store.error_text = ''), 3000)
    }
  }
)

// Sinov uchun:
// success('Maʼlumot saqlandi ✅', 'Bazaga muvaffaqiyatli yozildi')
</script>

<template>
  <router-view></router-view>
  <!-- notificationlar chiqadigan joy -->
  <div id="notifications" class="fixed top-5 right-5 z-[9999] flex flex-col gap-3"></div>
</template>
