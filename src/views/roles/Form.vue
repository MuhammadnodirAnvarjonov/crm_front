<template>
  <form @submit.prevent="saveRole" class="space-y-5">
    <h3 class="text-lg font-semibold mb-2 text-gray-800 dark:text-slate-100">{{ $t('role') }}</h3>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <BaseInput v-model="form.name" :label="$t('name')" required />
      <BaseInput v-model="form.comment" :label="$t('comment')" />

      <!-- Umumiy sozlamalar -->
      <div class="sm:col-span-2">
        <h4 class="text-sm text-gray-700 dark:text-slate-200 font-semibold mb-2">{{ $t('settings') }}</h4>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 dark:bg-slate-900/40 rounded-lg p-3 border border-gray-100 dark:border-slate-700">
          <label v-for="(label, key) in generalSettings" :key="key"
            class="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200 cursor-pointer">
            <input type="checkbox" v-model="form.settings[key]" class="w-4 h-4 text-blue-600 dark:bg-slate-700 dark:border-slate-500 rounded" />
            <span>{{ label }}</span>
          </label>
        </div>
      </div>

      <!-- Sahifa ruxsatlari (CRUD) -->
      <div class="sm:col-span-2">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm text-gray-700 dark:text-slate-200 font-semibold">{{ $t('page_settings') }}</h4>
          <div class="flex gap-2">
            <button type="button" @click="toggleAll(true)" class="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              {{ $t('enable_all_short') }}
            </button>
            <span class="text-gray-300 dark:text-slate-600">|</span>
            <button type="button" @click="toggleAll(false)" class="text-xs text-red-500 dark:text-red-400 hover:underline">
              {{ $t('disable_all_short') }}
            </button>
          </div>
        </div>

        <div class="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <div v-for="group in pageGroups" :key="group.label" class="border-b border-gray-200 dark:border-slate-700 last:border-b-0">
            <div class="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-700/70 border-b border-gray-200 dark:border-slate-700">
              <input type="checkbox" :checked="isGroupChecked(group)"
                :indeterminate.prop="isGroupIndeterminate(group)"
                @change="toggleGroup(group, $event.target.checked)"
                class="w-4 h-4 text-blue-600 dark:bg-slate-700 dark:border-slate-500 rounded cursor-pointer" />
              <span class="text-sm font-bold text-gray-700 dark:text-slate-100">{{ $t(group.label) }}</span>
            </div>

            <div
              class="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-1 px-4 py-1.5 bg-gray-50 dark:bg-slate-900/40 border-b border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">
              <span>{{ $t('page_label') }}</span>
              <span class="text-center">{{ $t('page_view') }}</span>
              <span class="text-center">{{ $t('page_create') }}</span>
              <span class="text-center">{{ $t('page_update') }}</span>
              <span class="text-center">{{ $t('page_delete') }}</span>
            </div>

            <div v-for="page in group.pages" :key="page.key"
              class="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-1 px-4 py-2 items-center border-b border-gray-100 dark:border-slate-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-slate-700/40">
              <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200 cursor-pointer font-medium">
                <input type="checkbox" :checked="isPageChecked(page.key)"
                  :indeterminate.prop="isPageIndeterminate(page.key)"
                  @change="togglePage(page.key, $event.target.checked)" class="w-4 h-4 text-blue-600 dark:bg-slate-700 dark:border-slate-500 rounded" />
                {{ $t(page.label) }}
              </label>
              <div class="flex justify-center">
                <input type="checkbox" v-model="form.settings.pages[page.key + '.read']"
                  class="w-4 h-4 text-blue-600 dark:bg-slate-700 dark:border-slate-500 rounded cursor-pointer" />
              </div>
              <div class="flex justify-center">
                <input type="checkbox" v-model="form.settings.pages[page.key + '.create']"
                  class="w-4 h-4 text-green-600 dark:bg-slate-700 dark:border-slate-500 rounded cursor-pointer" />
              </div>
              <div class="flex justify-center">
                <input type="checkbox" v-model="form.settings.pages[page.key + '.update']"
                  class="w-4 h-4 text-amber-500 dark:bg-slate-700 dark:border-slate-500 rounded cursor-pointer" />
              </div>
              <div class="flex justify-center">
                <input type="checkbox" v-model="form.settings.pages[page.key + '.delete']"
                  class="w-4 h-4 text-red-500 dark:bg-slate-700 dark:border-slate-500 rounded cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-2 sticky bottom-0 bg-white dark:bg-slate-800 py-3 border-t border-gray-200 dark:border-slate-700 -mx-4 px-4">
      <BaseButton type="button" status="gray" @click="$emit('close')">{{ $t('cancel') }}</BaseButton>
      <BaseButton type="submit" status="primary">{{ $t('save') }}</BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import roleService from '@/services/roles.service'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseButton from '@/components/form/BaseButton.vue'
import { buildPageGroups } from '@/config/menuConfig'

const emit = defineEmits(['saved', 'close'])
const props = defineProps({ editData: Object })
const { t } = useI18n()

const CRUD = ['read', 'create', 'update', 'delete']

const generalSettings = computed(() => ({
  switch_users: t('switch_users'),
}))

const pageGroups = buildPageGroups()
const allPageKeys = pageGroups.flatMap((g) => g.pages.flatMap((p) => CRUD.map((c) => `${p.key}.${c}`)))
const allSimpleKeys = pageGroups.flatMap((g) => g.pages.map((p) => p.key))

const defaultPages = () => {
  const obj = {}
  allPageKeys.forEach((k) => (obj[k] = false))
  allSimpleKeys.forEach((k) => (obj[k] = false))
  return obj
}

const defaultSettings = { switch_users: false }

const form = ref({
  name: '',
  comment: '',
  settings: { ...defaultSettings, pages: defaultPages() },
})

watch(() => props.editData, (val) => {
  if (val) {
    let parsed = {}
    try {
      parsed = typeof val.settings === 'string' ? JSON.parse(val.settings) : val.settings || {}
    } catch {
      parsed = {}
    }
    form.value = {
      name: val.name || '',
      comment: val.comment || '',
      settings: {
        ...defaultSettings,
        ...parsed,
        pages: { ...defaultPages(), ...(parsed.pages || {}) },
      },
    }
  }
}, { immediate: true })

// CRUD helpers
const isPageChecked = (pageKey) => CRUD.every((c) => form.value.settings.pages[`${pageKey}.${c}`])
const isPageIndeterminate = (pageKey) => {
  const vals = CRUD.map((c) => form.value.settings.pages[`${pageKey}.${c}`])
  return vals.some(Boolean) && !vals.every(Boolean)
}
const togglePage = (pageKey, val) => {
  CRUD.forEach((c) => (form.value.settings.pages[`${pageKey}.${c}`] = val))
  form.value.settings.pages[pageKey] = val
}

const isGroupChecked = (group) => group.pages.every((p) => isPageChecked(p.key))
const isGroupIndeterminate = (group) => {
  const states = group.pages.map((p) => isPageChecked(p.key))
  return states.some(Boolean) && !states.every(Boolean)
}
const toggleGroup = (group, val) => group.pages.forEach((p) => togglePage(p.key, val))

const toggleAll = (val) => pageGroups.forEach((g) => toggleGroup(g, val))

const saveRole = async () => {
  const payload = {
    ...form.value,
    settings: JSON.stringify(form.value.settings),
  }
  try {
    if (props.editData?.id) {
      await roleService.update(props.editData.id, payload)
    } else {
      await roleService.create(payload)
    }
    emit('saved')
    emit('close')
  } catch (e) {
    console.error('Role save error', e)
  }
}
</script>
