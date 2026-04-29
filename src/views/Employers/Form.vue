<template>
  <form @submit.prevent="save" class="flex flex-col">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <BaseInput label="Kompaniya nomi" v-model="form.name" required placeholder="Grand Hotel" />
      <BaseInput label="Aloqa shaxsi" v-model="form.contact_person" placeholder="Jamshid Rahimov" />

      <BaseInput label="Telefon" v-model="form.phone" required placeholder="+998901234567" />
      <BaseInput label="Qo'shimcha telefon" v-model="form.phone2" placeholder="+998..." />

      <BaseSelect label="Forma turi" v-model="form.form_type" :options="formTypeOptions"
        labelKey="name" valueKey="value" :clearable="false" />
      <BaseSelect label="Tarif (tier)" v-model="form.tier" :options="tierOptions"
        labelKey="name" valueKey="value" :clearable="false" />

      <BaseSelect label="Viloyat" v-model="form.region_id" :options="regionOptions"
        labelKey="name" valueKey="id" placeholder="Tanlang" @change="form.district_id = null" />
      <BaseSelect label="Tuman" v-model="form.district_id" :options="districtOptions"
        labelKey="name" valueKey="id" placeholder="Tanlang" :disabled="!form.region_id" />

      <div class="md:col-span-2">
        <BaseInput label="Manzil" v-model="form.address" placeholder="Ko'cha, uy raqami..." />
      </div>

      <BaseInput label="Lavozim" v-model="form.position_title" placeholder="Ofitsiant" />
      <BaseInputNumber label="Lavozim soni" v-model="form.position_count" :min="1" :max="999" :format="false" :step="1" />

      <BaseInputNumber label="Maosh" v-model="form.salary" :min="0" :step="100000" />
      <div>
        <label class="text-sm font-semibold text-gray-700 select-none">Muddati</label>
        <input type="date" v-model="form.deadline"
          class="w-full mt-1.5 px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
      </div>

      <BaseSelect label="Holati" v-model="form.status" :options="statusOptions"
        labelKey="name" valueKey="value" :clearable="false" />

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
import employersService from '@/services/employers.service'
import regionsService from '@/services/regions.service'

const { locale } = useI18n()
const emit = defineEmits(['saved', 'close'])
const props = defineProps({ editData: Object })

const saving = ref(false)
const regions = ref([])

const form = ref({
  name: '', contact_person: '', phone: '', phone2: '',
  address: '', region_id: null, district_id: null,
  form_type: 'partial', tier: 'free', status: 'active',
  position_title: '', position_count: 1, salary: null,
  deadline: '', comment: '',
})

const nameByLocale = (obj) => {
  if (!obj) return ''
  const lang = locale.value
  return (lang === 'ru' ? obj.name_ru : lang === 'uzk' ? obj.name_uzk : obj.name_uz) || obj.name_uz || ''
}

const formTypeOptions = [
  { value: 'partial', name: 'Qisman' },
  { value: 'full', name: "To'liq" },
]
const tierOptions = [
  { value: 'free', name: 'Bepul' },
  { value: 'premium_a', name: 'Premium A' },
  { value: 'premium_b', name: 'Premium B' },
  { value: 'premium_v', name: 'Premium V' },
]
const statusOptions = [
  { value: 'active', name: 'Faol' },
  { value: 'inactive', name: 'Faol emas' },
  { value: 'archived', name: 'Arxiv' },
]

const regionOptions = computed(() => regions.value.map((r) => ({ id: r.id, name: nameByLocale(r) })))
const districtOptions = computed(() => {
  if (!form.value.region_id) return []
  const r = regions.value.find((x) => x.id === form.value.region_id)
  return (r?.districts || []).map((d) => ({ id: d.id, name: nameByLocale(d) }))
})

const populate = (data) => {
  if (!data) {
    form.value = {
      name: '', contact_person: '', phone: '', phone2: '',
      address: '', region_id: null, district_id: null,
      form_type: 'partial', tier: 'free', status: 'active',
      position_title: '', position_count: 1, salary: null,
      deadline: '', comment: '',
    }
    return
  }
  form.value = {
    name: data.name || '',
    contact_person: data.contact_person || '',
    phone: data.phone || '',
    phone2: data.phone2 || '',
    address: data.address || '',
    region_id: data.region_id || null,
    district_id: data.district_id || null,
    form_type: data.form_type || 'partial',
    tier: data.tier || 'free',
    status: data.status || 'active',
    position_title: data.position_title || '',
    position_count: data.position_count ?? 1,
    salary: data.salary != null ? Number(data.salary) : null,
    deadline: data.deadline ? String(data.deadline).slice(0, 10) : '',
    comment: data.comment || '',
  }
}

const save = async () => {
  if (saving.value) return
  saving.value = true
  try {
    const payload = { ...form.value }
    if (!payload.deadline) payload.deadline = null
    if (props.editData?.id) {
      await employersService.update(props.editData.id, payload)
    } else {
      await employersService.create(payload)
    }
    emit('saved')
    emit('close')
  } catch (e) {
    console.error('Employer save error', e)
  } finally {
    saving.value = false
  }
}

watch(() => props.editData, populate, { immediate: true })

onMounted(async () => {
  try {
    regions.value = (await regionsService.all({})) || []
  } catch (e) { console.error(e) }
})
</script>
