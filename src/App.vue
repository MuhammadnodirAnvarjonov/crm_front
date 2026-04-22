<script setup>
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useErrorStore } from '@/stores/errors'
import { useNotification } from '@/composables/useNotification'

const { t } = useI18n()
const { error } = useNotification()
const errorStore = useErrorStore()

watch(
  () => errorStore.error_text,
  (val) => {
    if (val) {
      error(t('error') || 'Xatolik', val.toString())
      setTimeout(() => (errorStore.error_text = ''), 3000)
    }
  }
)
</script>

<template>
  <router-view></router-view>
  <!-- notificationlar chiqadigan joy -->
  <div id="notifications" class="fixed top-5 right-5 z-[9999] flex flex-col gap-3"></div>
</template>
