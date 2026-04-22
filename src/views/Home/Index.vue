<script setup>
import { useUserStore } from '@/stores/user'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const userStore = useUserStore()
const { t } = useI18n()

const user = computed(() => userStore.user || {})
const roleName = computed(() => user.value?.role?.name || '—')
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 5) return t('good_night') || 'Xayrli tun'
  if (h < 12) return t('good_morning') || 'Xayrli tong'
  if (h < 18) return t('good_afternoon') || 'Xayrli kun'
  return t('good_evening') || 'Xayrli kech'
})
</script>

<template>
  <div class="flex-1 p-6">
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <h1 class="text-2xl font-bold text-slate-800">
          {{ greeting }}, {{ user.user_name || '—' }}
        </h1>
        <p class="text-slate-500 mt-2">
          {{ t('welcome') || 'CRM tizimiga xush kelibsiz' }}
        </p>

        <dl class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="rounded-xl bg-slate-50 border border-slate-100 p-4">
            <dt class="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              {{ t('user_name') || 'Foydalanuvchi' }}
            </dt>
            <dd class="mt-1 text-lg font-semibold text-slate-800">
              {{ user.user_name || '—' }}
            </dd>
          </div>
          <div class="rounded-xl bg-slate-50 border border-slate-100 p-4">
            <dt class="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              {{ t('role') || 'Rol' }}
            </dt>
            <dd class="mt-1 text-lg font-semibold text-slate-800">{{ roleName }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>
