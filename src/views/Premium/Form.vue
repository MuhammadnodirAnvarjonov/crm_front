<template>
  <form @submit.prevent="save" class="flex flex-col">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <BaseSelect label="Ish beruvchi" v-model="form.employer_id" :options="employerOptions"
        labelKey="name" valueKey="id" placeholder="Tanlang" required />
      <BaseInput label="Shartnoma raqami" v-model="form.contract_number" placeholder="SH-2026/001" />

      <BaseSelect label="Tarif" v-model="form.tier" :options="tierOptions" labelKey="name" valueKey="value" :clearable="false" />
      <BaseSelect label="Holati" v-model="form.status" :options="statusOptions" labelKey="name" valueKey="value" :clearable="false" />

      <div>
        <label class="text-sm font-semibold text-gray-700">Boshlanish</label>
        <input type="date" v-model="form.start_date" class="w-full mt-1.5 px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
      </div>
      <div>
        <label class="text-sm font-semibold text-gray-700">Tugash</label>
        <input type="date" v-model="form.end_date" class="w-full mt-1.5 px-3 py-2 text-sm rounded-lg border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
      </div>

      <div class="md:col-span-2">
        <BaseInputNumber label="Umumiy summa" v-model="form.total_amount" :min="0" :step="100000" />
      </div>

      <div class="md:col-span-2">
        <BaseTextarea label="Izoh" v-model="form.comment" rows="3" />
      </div>
    </div>

    <div class="px-1 py-4 border-t border-gray-100 mt-4 flex justify-end gap-3 sticky bottom-0 bg-white">
      <BaseButton type="button" status="gray" @click="$emit('close')">Bekor qilish</BaseButton>
      <BaseButton type="submit" status="primary" :loading="saving">Saqlash</BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseInputNumber from '@/components/form/BaseInputNumber.vue'
import BaseSelect from '@/components/form/BaseSelect.vue'
import BaseTextarea from '@/components/form/BaseTextarea.vue'
import BaseButton from '@/components/form/BaseButton.vue'
import contractsService from '@/services/contracts.service'
import employersService from '@/services/employers.service'

const { locale } = useI18n()
const emit = defineEmits(['saved', 'close'])
const props = defineProps({ editData: Object })

const saving = ref(false)
const employers = ref([])

const form = ref({
  employer_id: null, contract_number: '',
  tier: 'basic', status: 'active',
  start_date: '', end_date: '',
  total_amount: null, comment: '',
})

const tierOptions = [
  { value: 'basic', name: 'Asosiy' },
  { value: 'premium_a', name: 'Premium A' },
  { value: 'premium_b', name: 'Premium B' },
  { value: 'premium_v', name: 'Premium V' },
]
const statusOptions = [
  { value: 'active', name: 'Faol' },
  { value: 'expired', name: 'Muddati o\'tgan' },
  { value: 'cancelled', name: 'Bekor qilingan' },
  { value: 'completed', name: 'Yakunlangan' },
]

const employerOptions = computed(() => employers.value.map((e) => ({ id: e.id, name: e.name })))

const populate = (data) => {
  if (!data) {
    form.value = {
      employer_id: null, contract_number: '',
      tier: 'basic', status: 'active',
      start_date: '', end_date: '',
      total_amount: null, comment: '',
    }
    return
  }
  form.value = {
    employer_id: data.employer_id || null,
    contract_number: data.contract_number || '',
    tier: data.tier || 'basic',
    status: data.status || 'active',
    start_date: data.start_date ? String(data.start_date).slice(0, 10) : '',
    end_date: data.end_date ? String(data.end_date).slice(0, 10) : '',
    total_amount: data.total_amount != null ? Number(data.total_amount) : null,
    comment: data.comment || '',
  }
}

const save = async () => {
  if (saving.value) return
  saving.value = true
  try {
    const payload = { ...form.value }
    if (!payload.start_date) payload.start_date = null
    if (!payload.end_date) payload.end_date = null
    if (props.editData?.id) await contractsService.update(props.editData.id, payload)
    else await contractsService.create(payload)
    emit('saved')
    emit('close')
  } catch (e) {
    console.error('Contract save error', e)
  } finally {
    saving.value = false
  }
}

watch(() => props.editData, populate, { immediate: true })

onMounted(async () => {
  try { employers.value = (await employersService.all()) || [] } catch (e) { console.error(e) }
})
</script>
