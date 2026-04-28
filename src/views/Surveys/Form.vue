<template>
  <form @submit.prevent="save" class="flex flex-col">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Ism -->
      <BaseInput :label="$t('first_name')" v-model="form.name" required size="md" placeholder="Ism" />

      <!-- Familiya -->
      <BaseInput :label="$t('surname')" v-model="form.surname" size="md" placeholder="Familiya" />

      <!-- Otasi ismi -->
      <BaseInput :label="$t('middle_name')" v-model="form.middle_name" size="md" placeholder="Otasi ismi" />

      <!-- Jinsi -->
      <BaseSelect
        :label="$t('gender')"
        v-model="form.gender"
        :options="genderOptions"
        labelKey="name"
        valueKey="value"
        :placeholder="$t('select')"
      />

      <!-- Telefon -->
      <BaseInput
        :label="$t('phone')"
        v-model="form.phone_number"
        required
        placeholder="+998901234567"
      />

      <!-- Tug'ilgan sana -->
      <div>
        <label class="text-sm font-semibold text-gray-700 dark:text-slate-200 select-none">
          {{ $t('birth_date') }}
          <span v-if="age !== null" class="text-blue-600 font-normal text-xs ml-1">— {{ age }} yosh</span>
        </label>
        <input
          type="date"
          v-model="form.birthday"
          class="w-full mt-1.5 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-gray-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
        />
      </div>

      <!-- Anketa turi -->
      <BaseSelect
        :label="$t('anketa_type')"
        v-model="form.anketa_type_id"
        :options="anketaTypes"
        :labelKey="nameKey"
        valueKey="id"
        :placeholder="$t('select')"
      />

      <!-- Kasb (Job type) -->
      <BaseSelect
        :label="$t('job')"
        v-model="form.job_type_id"
        :options="jobTypes"
        :labelKey="nameKey"
        valueKey="id"
        :placeholder="$t('select')"
      />

      <!-- Tajriba (yil) -->
      <BaseInputNumber
        :label="$t('experience_year')"
        v-model="form.experience_year"
        :min="0"
        :max="60"
        :step="0.5"
        :format="false"
        size="md"
      />

      <!-- Kutilayotgan maosh -->
      <BaseInputNumber
        :label="$t('expected_salary')"
        v-model="form.expected_salary"
        :min="0"
        :step="100000"
        size="md"
      />

      <!-- Ma'lumot (education) -->
      <BaseSelect
        :label="$t('education')"
        v-model="form.information"
        :options="educationOptions"
        labelKey="name"
        valueKey="value"
        :placeholder="$t('select')"
      />

      <!-- Status -->
      <BaseSelect
        :label="$t('status')"
        v-model="form.anketa_status"
        :options="statusOptions"
        labelKey="name"
        valueKey="value"
        :placeholder="$t('select')"
        :clearable="false"
      />

      <!-- Region -->
      <BaseSelect
        :label="$t('region')"
        v-model="form.region_id"
        :options="regions"
        :labelKey="nameKey"
        valueKey="id"
        :placeholder="$t('select')"
        @change="onRegionChange"
      />

      <!-- District -->
      <BaseSelect
        :label="$t('district')"
        v-model="form.district_id"
        :options="filteredDistricts"
        :labelKey="nameKey"
        valueKey="id"
        :placeholder="$t('select')"
        :disabled="!form.region_id"
      />

      <!-- Suhbat sanasi -->
      <div class="md:col-span-2">
        <label class="text-sm font-semibold text-gray-700 dark:text-slate-200 select-none">
          {{ $t('interview_datetime') }}
        </label>
        <input
          type="datetime-local"
          v-model="form.interview_datetime"
          class="w-full mt-1.5 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-gray-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
        />
      </div>

      <!-- Izoh -->
      <div class="md:col-span-2">
        <BaseTextarea
          :label="$t('comment')"
          v-model="form.comment"
          rows="3"
          placeholder=""
        />
      </div>
    </div>

    <!-- Footer -->
    <div class="px-1 py-4 border-t border-gray-100 dark:border-slate-700 mt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-800">
      <BaseButton type="button" status="gray" @click="$emit('close')">
        {{ $t('cancel') }}
      </BaseButton>
      <BaseButton type="submit" status="primary" :loading="saving">
        {{ $t('save') }}
      </BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseInput from '@/components/form/BaseInput.vue'
import BaseInputNumber from '@/components/form/BaseInputNumber.vue'
import BaseSelect from '@/components/form/BaseSelect.vue'
import BaseTextarea from '@/components/form/BaseTextarea.vue'
import BaseButton from '@/components/form/BaseButton.vue'

import anketaService from '@/services/anketa.service'
import anketaTypesService from '@/services/anketaTypes.service'
import jobTypesService from '@/services/jobTypes.service'
import regionsService from '@/services/regions.service'

const { locale } = useI18n()

const emit = defineEmits(['saved', 'close'])
const props = defineProps({ editData: Object })

const saving = ref(false)

const form = ref({
  name: '',
  surname: '',
  middle_name: '',
  gender: null,
  phone_number: '',
  anketa_type_id: null,
  job_type_id: null,
  region_id: null,
  district_id: null,
  interview_datetime: '',
  anketa_status: 'anketa_olindi',
  birthday: '',
  experience_year: null,
  expected_salary: null,
  information: '',
  comment: '',
})

const anketaTypes = ref([])
const jobTypes = ref([])
const regions = ref([])

const nameKey = computed(() => {
  const lang = locale.value
  if (lang === 'ru') return 'name_ru'
  if (lang === 'uzk') return 'name_uzk'
  return 'name_uz'
})

const genderOptions = [
  { value: 'male', name: 'Erkak' },
  { value: 'female', name: 'Ayol' },
]

const educationOptions = [
  { value: 'oliy', name: 'Oliy' },
  { value: 'orta_maxsus', name: "O'rta-maxsus" },
  { value: 'orta', name: "O'rta" },
  { value: 'tugatilmagan_oliy', name: 'Tugatilmagan oliy' },
  { value: 'magistr', name: 'Magistr' },
]

const statusOptions = [
  { value: 'anketa_olindi', name: 'Anketa olindi' },
  { value: 'suhbatga_belgilandi', name: 'Suhbatga belgilandi' },
  { value: 'suhbatga_bordi', name: 'Suhbatga bordi' },
  { value: 'suhbatga_bormadi', name: 'Suhbatga bormadi' },
  { value: '3_kunlik_sinov', name: '3 kunlik sinov' },
  { value: 'qabul_qilindi', name: 'Qabul qilindi' },
  { value: 'rad_etildi', name: 'Rad etildi' },
]

const filteredDistricts = computed(() => {
  if (!form.value.region_id) return []
  const r = regions.value.find((x) => x.id === form.value.region_id)
  return r?.districts || []
})

const onRegionChange = () => {
  form.value.district_id = null
}

const age = computed(() => {
  if (!form.value.birthday) return null
  const bd = new Date(form.value.birthday)
  if (isNaN(bd.getTime())) return null
  const today = new Date()
  let a = today.getFullYear() - bd.getFullYear()
  const m = today.getMonth() - bd.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) a--
  return a >= 0 ? a : null
})

const populate = (data) => {
  if (!data) {
    form.value = {
      name: '',
      surname: '',
      middle_name: '',
      gender: null,
      phone_number: '',
      anketa_type_id: null,
      job_type_id: null,
      region_id: null,
      district_id: null,
      interview_datetime: '',
      anketa_status: 'anketa_olindi',
      birthday: '',
      experience_year: null,
      expected_salary: null,
      information: '',
      comment: '',
    }
    return
  }
  form.value = {
    name: data.name || '',
    surname: data.surname || '',
    middle_name: data.middle_name || '',
    gender: data.gender || null,
    phone_number: data.phone_number || '',
    anketa_type_id: data.anketa_type_id || null,
    job_type_id: data.job_type_id || null,
    region_id: data.region_id || null,
    district_id: data.district_id || null,
    interview_datetime: data.interview_datetime
      ? new Date(data.interview_datetime).toISOString().slice(0, 16)
      : '',
    anketa_status: data.anketa_status || 'anketa_olindi',
    birthday: data.birthday ? String(data.birthday).slice(0, 10) : '',
    experience_year: data.experience_year != null ? Number(data.experience_year) : null,
    expected_salary: data.expected_salary != null ? Number(data.expected_salary) : null,
    information: data.information || '',
    comment: data.comment || '',
  }
}

const loadLookups = async () => {
  try {
    const [at, jt, rg] = await Promise.all([
      anketaTypesService.all(),
      jobTypesService.all(),
      regionsService.all({}),
    ])
    anketaTypes.value = at || []
    jobTypes.value = jt || []
    regions.value = rg || []
  } catch (e) {
    console.error('Lookup load error', e)
  }
}

const save = async () => {
  if (saving.value) return
  saving.value = true
  try {
    const payload = { ...form.value }
    if (!payload.birthday) payload.birthday = null
    if (!payload.interview_datetime) payload.interview_datetime = null
    if (props.editData?.id) {
      await anketaService.update(props.editData.id, payload)
    } else {
      await anketaService.create(payload)
    }
    emit('saved')
    emit('close')
  } catch (e) {
    console.error('Anketa save error', e)
  } finally {
    saving.value = false
  }
}

watch(() => props.editData, populate, { immediate: true })

onMounted(loadLookups)
</script>
