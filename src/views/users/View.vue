<template>
  <div class="space-y-6">
    <h3 class="text-lg font-semibold mb-3 text-gray-800">
      👁️ {{ form.user_name }} ma'lumotlari
    </h3>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <BaseView label="Foydalanuvchi nomi" :value="form.user_name" />
      <BaseView label="Telefon" :value="form.phone" />
      <BaseView label="Rol" :value="roleName" />
      <BaseView label="Jinsi" :value="genderLabel" />
      <BaseView label="Faol" :value="form.activity ? '✅ Ha' : '❌ Yo\'q'" />
      <BaseView class="md:col-span-2" label="Izoh" :value="form.comment || '-'" />
    </div>

    <div class="flex justify-end mt-6">
      <button @click="$emit('close')" type="button"
        class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition">
        Yopish
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import BaseView from '@/components/form/BaseView.vue'

defineEmits(['close'])
const props = defineProps({ viewData: Object })

const form = ref({})

const roleName = computed(() => form.value.role?.name || '-')
const genderLabel = computed(() => {
  if (form.value.gender === 'male') return 'Erkak'
  if (form.value.gender === 'female') return 'Ayol'
  return '-'
})

watch(() => props.viewData, (val) => {
  if (val) form.value = { ...val }
}, { immediate: true })
</script>
