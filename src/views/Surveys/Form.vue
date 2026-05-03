<template>
  <form @submit.prevent="save" class="flex flex-col">
    <!-- Clone mode banner -->
    <div v-if="mode === 'clone'"
      class="mb-4 px-3 py-2.5 rounded-lg bg-blue-50 border border-blue-200 flex items-start gap-2">
      <svg class="w-4 h-4 text-blue-600 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      <div class="text-[12px] text-blue-700 leading-snug">
        <p class="font-semibold">Anketadan nusxa olindi.</p>
        <p>Iltimos, quyidagi maydonlarni qayta to'ldiring:
          <span class="font-semibold">Ism, Familiya, Otasining ismi, Telefon, Tug'ilgan sana</span>.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Ism — 3 til -->
      <div class="md:col-span-2">
        <label class="text-sm font-semibold text-gray-700 dark:text-slate-200 select-none block mb-1.5">
          {{ $t('first_name') }}
        </label>
        <div class="grid grid-cols-3 gap-2">
          <div class="relative">
            <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-500 select-none pointer-events-none">UZ</span>
            <input v-model="form.name" @blur="autoFill('name')" required
              placeholder="Ism (lotin)"
              class="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-gray-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" />
          </div>
          <div class="relative">
            <span class="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-purple-500 select-none pointer-events-none">УЗК</span>
            <input v-model="form.name_uzk" @input="dirty.name_uzk = true"
              placeholder="Исм (кирилл)"
              class="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-gray-900 dark:text-slate-100 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition" />
          </div>
          <div class="relative">
            <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-rose-500 select-none pointer-events-none">РУ</span>
            <input v-model="form.name_ru" @input="dirty.name_ru = true"
              placeholder="Имя (рус.)"
              class="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-gray-900 dark:text-slate-100 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 transition" />
          </div>
        </div>
      </div>

      <!-- Familiya — 3 til -->
      <div class="md:col-span-2">
        <label class="text-sm font-semibold text-gray-700 dark:text-slate-200 select-none block mb-1.5">
          {{ $t('surname') }}
        </label>
        <div class="grid grid-cols-3 gap-2">
          <div class="relative">
            <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-500 select-none pointer-events-none">UZ</span>
            <input v-model="form.surname" @blur="autoFill('surname')"
              placeholder="Familiya (lotin)"
              class="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-gray-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" />
          </div>
          <div class="relative">
            <span class="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-purple-500 select-none pointer-events-none">УЗК</span>
            <input v-model="form.surname_uzk" @input="dirty.surname_uzk = true"
              placeholder="Фамилия (кирилл)"
              class="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-gray-900 dark:text-slate-100 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition" />
          </div>
          <div class="relative">
            <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-rose-500 select-none pointer-events-none">РУ</span>
            <input v-model="form.surname_ru" @input="dirty.surname_ru = true"
              placeholder="Фамилия (рус.)"
              class="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-gray-900 dark:text-slate-100 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 transition" />
          </div>
        </div>
      </div>

      <!-- Otasi ismi — 3 til -->
      <div class="md:col-span-2">
        <label class="text-sm font-semibold text-gray-700 dark:text-slate-200 select-none block mb-1.5">
          {{ $t('middle_name') }}
        </label>
        <div class="grid grid-cols-3 gap-2">
          <div class="relative">
            <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-500 select-none pointer-events-none">UZ</span>
            <input v-model="form.middle_name" @blur="autoFill('middle_name')"
              placeholder="Otasi ismi (lotin)"
              class="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-gray-900 dark:text-slate-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition" />
          </div>
          <div class="relative">
            <span class="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-purple-500 select-none pointer-events-none">УЗК</span>
            <input v-model="form.middle_name_uzk" @input="dirty.middle_name_uzk = true"
              placeholder="Отаси исми (кирилл)"
              class="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-gray-900 dark:text-slate-100 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition" />
          </div>
          <div class="relative">
            <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-rose-500 select-none pointer-events-none">РУ</span>
            <input v-model="form.middle_name_ru" @input="dirty.middle_name_ru = true"
              placeholder="Отчество (рус.)"
              class="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 text-gray-900 dark:text-slate-100 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/20 transition" />
          </div>
        </div>
      </div>

      <!-- Jinsi -->
      <BaseSelect
        :label="$t('gender')"
        v-model="form.gender"
        :options="genderOptions"
        labelKey="name"
        valueKey="value"
        :placeholder="$t('select')"
        :clearable="false"
        @change="onGenderChange"
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

      <!-- Ma'lumot (education) — 3 til -->
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
const props = defineProps({
  editData: Object,
  mode: { type: String, default: 'create' }, // 'create' | 'edit' | 'clone'
})

const saving = ref(false)

// ─── Latin → Uzbek Cyrillic (uzk) ────────────────────────────
const UZK_MAP = [
  ["O'", 'Ў'], ["o'", 'ў'],
  ["G'", 'Ғ'], ["g'", 'ғ'],
  ['Sh', 'Ш'], ['sh', 'ш'],
  ['Ch', 'Ч'], ['ch', 'ч'],
  ['Ng', 'Нг'], ['ng', 'нг'],
  ['Yo', 'Ё'], ['yo', 'ё'],
  ['Yu', 'Ю'], ['yu', 'ю'],
  ['Ya', 'Я'], ['ya', 'я'],
  ['Ye', 'Е'], ['ye', 'е'],
  ['A', 'А'], ['a', 'а'],
  ['B', 'Б'], ['b', 'б'],
  ['D', 'Д'], ['d', 'д'],
  ['E', 'Э'], ['e', 'э'],
  ['F', 'Ф'], ['f', 'ф'],
  ['G', 'Г'], ['g', 'г'],
  ['H', 'Ҳ'], ['h', 'ҳ'],
  ['I', 'И'], ['i', 'и'],
  ['J', 'Ж'], ['j', 'ж'],
  ['K', 'К'], ['k', 'к'],
  ['L', 'Л'], ['l', 'л'],
  ['M', 'М'], ['m', 'м'],
  ['N', 'Н'], ['n', 'н'],
  ['O', 'О'], ['o', 'о'],
  ['P', 'П'], ['p', 'п'],
  ['Q', 'Қ'], ['q', 'қ'],
  ['R', 'Р'], ['r', 'р'],
  ['S', 'С'], ['s', 'с'],
  ['T', 'Т'], ['t', 'т'],
  ['U', 'У'], ['u', 'у'],
  ['V', 'В'], ['v', 'в'],
  ['X', 'Х'], ['x', 'х'],
  ['Y', 'Й'], ['y', 'й'],
  ['Z', 'З'], ['z', 'з'],
]

// Russian: q→К, h→Х, o'→У, g'→Г, rest same as uzk
const RU_OVERRIDES = {
  'Қ': 'К', 'қ': 'к',
  'Ҳ': 'Х', 'ҳ': 'х',
  'Ў': 'У', 'ў': 'у',
  'Ғ': 'Г', 'ғ': 'г',
}

const toUzk = (text) => {
  if (!text) return ''
  let r = text
  for (const [lat, cyr] of UZK_MAP) r = r.replaceAll(lat, cyr)
  return r
}

const toRu = (text) => {
  if (!text) return ''
  let r = toUzk(text)
  for (const [uzk, ru] of Object.entries(RU_OVERRIDES)) r = r.replaceAll(uzk, ru)
  return r
}

// ─── Dirty flags — prevent overwriting manual edits ──────────
const dirty = reactive({
  name_uzk: false, name_ru: false,
  surname_uzk: false, surname_ru: false,
  middle_name_uzk: false, middle_name_ru: false,
})

const autoFill = (field) => {
  const val = form.value[field] || ''
  if (!dirty[`${field}_uzk`]) form.value[`${field}_uzk`] = toUzk(val)
  if (!dirty[`${field}_ru`])  form.value[`${field}_ru`]  = toRu(val)
}

// ─── Form state ───────────────────────────────────────────────
const EMPTY_FORM = () => ({
  name: '', name_uzk: '', name_ru: '',
  surname: '', surname_uzk: '', surname_ru: '',
  middle_name: '', middle_name_uzk: '', middle_name_ru: '',
  gender: 'male',
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

const form = ref(EMPTY_FORM())

const anketaTypes = ref([])
const jobTypes = ref([])
const regions = ref([])

const nameKey = computed(() => {
  const lang = locale.value
  if (lang === 'ru') return 'name_ru'
  if (lang === 'uzk') return 'name_uzk'
  return 'name_uz'
})

const GENDER_I18N = [
  { value: 'male',   uz: 'Erkak', uzk: 'Эркак', ru: 'Мужской' },
  { value: 'female', uz: 'Ayol',  uzk: 'Аёл',   ru: 'Женский' },
]
const genderOptions = computed(() =>
  GENDER_I18N.map((g) => ({ value: g.value, name: g[locale.value] || g.uz }))
)

const userTouchedGender = ref(false)

const detectGender = (name, surname, middleName) => {
  const mn = (middleName || '').toLowerCase().trim()
  if (mn.includes('qizi')) return 'female'
  if (mn.includes("o'g'li") || mn.includes('ogli') || mn.includes('ugli')) return 'male'
  const sn = (surname || '').toLowerCase().trim()
  if (/(ova|eva|ovna|evna)$/i.test(sn)) return 'female'
  if (/(ov|ev)$/i.test(sn)) return 'male'
  const nm = (name || '').toLowerCase().trim()
  if (!nm) return 'male'
  if (/a$/i.test(nm)) return 'female'
  return 'male'
}

const onGenderChange = () => {
  userTouchedGender.value = true
}

// Education options with 3-language labels
const EDUCATION_LABELS = {
  oliy:             { uz: 'Oliy',              uzk: 'Олий',           ru: 'Высшее' },
  orta_maxsus:      { uz: "O'rta-maxsus",      uzk: 'Ўрта-махсус',    ru: 'Средне-специальное' },
  orta:             { uz: "O'rta",             uzk: 'Ўрта',           ru: 'Среднее' },
  tugatilmagan_oliy:{ uz: 'Tugatilmagan oliy', uzk: 'Тугатилмаган олий', ru: 'Незаконченное высшее' },
  magistr:          { uz: 'Magistr',           uzk: 'Магистр',        ru: 'Магистр' },
}

const educationOptions = computed(() =>
  Object.entries(EDUCATION_LABELS).map(([value, labels]) => ({
    value,
    name: labels[locale.value] || labels.uz,
  }))
)

const STATUS_LABELS = {
  anketa_olindi:        { uz: 'Anketa olindi',        uzk: 'Анкета олинди',        ru: 'Анкета принята' },
  suhbatga_belgilandi:  { uz: 'Suhbatga belgilandi',  uzk: 'Суҳбатга белгиланди',  ru: 'Назначено собеседование' },
  suhbatga_bordi:       { uz: 'Suhbatga bordi',       uzk: 'Суҳбатга борди',       ru: 'Прошёл собеседование' },
  suhbatga_bormadi:     { uz: 'Suhbatga bormadi',     uzk: 'Суҳбатга бормади',     ru: 'Не явился на собеседование' },
  '3_kunlik_sinov':     { uz: '3 kunlik sinov',       uzk: '3 кунлик синов',       ru: '3-дневное испытание' },
  qabul_qilindi:        { uz: 'Qabul qilindi',        uzk: 'Қабул қилинди',        ru: 'Принят на работу' },
  rad_etildi:           { uz: 'Rad etildi',           uzk: 'Рад этилди',           ru: 'Отказано' },
}

const statusOptions = computed(() =>
  Object.entries(STATUS_LABELS).map(([value, labels]) => ({
    value,
    name: labels[locale.value] || labels.uz,
  }))
)

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
  // Reset dirty flags
  Object.keys(dirty).forEach((k) => (dirty[k] = false))
  userTouchedGender.value = false

  if (!data) {
    form.value = EMPTY_FORM()
    return
  }

  userTouchedGender.value = !!data.gender

  // Mark uzk/ru dirty if already stored (don't auto-overwrite existing data)
  dirty.name_uzk         = !!data.name_uzk
  dirty.name_ru          = !!data.name_ru
  dirty.surname_uzk      = !!data.surname_uzk
  dirty.surname_ru       = !!data.surname_ru
  dirty.middle_name_uzk  = !!data.middle_name_uzk
  dirty.middle_name_ru   = !!data.middle_name_ru

  form.value = {
    name:             data.name || '',
    name_uzk:         data.name_uzk || '',
    name_ru:          data.name_ru || '',
    surname:          data.surname || '',
    surname_uzk:      data.surname_uzk || '',
    surname_ru:       data.surname_ru || '',
    middle_name:      data.middle_name || '',
    middle_name_uzk:  data.middle_name_uzk || '',
    middle_name_ru:   data.middle_name_ru || '',
    gender:           data.gender || 'male',
    phone_number:     data.phone_number || '',
    anketa_type_id:   data.anketa_type_id || null,
    job_type_id:      data.job_type_id || null,
    region_id:        data.region_id || null,
    district_id:      data.district_id || null,
    interview_datetime: data.interview_datetime
      ? new Date(data.interview_datetime).toISOString().slice(0, 16)
      : '',
    anketa_status:    data.anketa_status || 'anketa_olindi',
    birthday:         data.birthday ? String(data.birthday).slice(0, 10) : '',
    experience_year:  data.experience_year != null ? Number(data.experience_year) : null,
    expected_salary:  data.expected_salary != null ? Number(data.expected_salary) : null,
    information:      data.information || '',
    comment:          data.comment || '',
  }
}

watch(
  () => [form.value.name, form.value.surname, form.value.middle_name],
  ([n, s, m]) => {
    if (userTouchedGender.value) return
    form.value.gender = detectGender(n, s, m)
  }
)

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
