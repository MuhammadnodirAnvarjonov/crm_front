<script setup>
import { ref, onMounted } from 'vue'
import anketaService from '@/services/anketa.service'
import anketaTypesService from '@/services/anketaTypes.service'
import jobTypesService from '@/services/jobTypes.service'
import regionsService from '@/services/regions.service'

const step = ref('form') // 'form' | 'success' | 'error'
const loading = ref(false)

const anketaTypes = ref([])
const jobTypes = ref([])
const regions = ref([])
const districts = ref([])

const form = ref({
  name: '',
  surname: '',
  middle_name: '',
  gender: '',
  phone_number: '',
  anketa_type_id: '',
  job_type_id: '',
  region_id: '',
  district_id: '',
  birthday: '',
  experience_year: '',
  expected_salary: '',
  information: '',
})

const errors = ref({})

const validate = () => {
  const e = {}
  if (!form.value.name.trim()) e.name = "Ism kiritilishi shart"
  if (!form.value.phone_number.trim()) e.phone_number = "Telefon raqami kiritilishi shart"
  errors.value = e
  return Object.keys(e).length === 0
}

const onRegionChange = () => {
  form.value.district_id = ''
  const r = regions.value.find((x) => x.id === Number(form.value.region_id))
  districts.value = r?.districts || []
}

const submit = async () => {
  if (!validate()) return
  loading.value = true
  try {
    const payload = { ...form.value }
    for (const k of Object.keys(payload)) {
      if (payload[k] === '' || payload[k] === null) delete payload[k]
    }
    if (payload.anketa_type_id) payload.anketa_type_id = Number(payload.anketa_type_id)
    if (payload.job_type_id) payload.job_type_id = Number(payload.job_type_id)
    if (payload.region_id) payload.region_id = Number(payload.region_id)
    if (payload.district_id) payload.district_id = Number(payload.district_id)
    if (payload.experience_year) payload.experience_year = Number(payload.experience_year)
    if (payload.expected_salary) payload.expected_salary = Number(payload.expected_salary)

    await anketaService.publicSubmit(payload)
    step.value = 'success'
  } catch (e) {
    step.value = 'error'
  } finally {
    loading.value = false
  }
}

const reset = () => {
  step.value = 'form'
  errors.value = {}
  form.value = {
    name: '', surname: '', middle_name: '', gender: '',
    phone_number: '', anketa_type_id: '', job_type_id: '',
    region_id: '', district_id: '', birthday: '',
    experience_year: '', expected_salary: '', information: '',
  }
}

onMounted(async () => {
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
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
    <div class="w-full max-w-lg">
      <!-- Header -->
      <div class="text-center mb-6">
        <div class="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <h1 class="text-xl font-bold text-slate-800">Anketa to'ldirish</h1>
        <p class="text-[13px] text-slate-500 mt-1">Ma'lumotlaringizni to'liq va to'g'ri kiriting</p>
      </div>

      <!-- Success -->
      <div v-if="step === 'success'" class="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center space-y-4">
        <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <svg class="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 class="text-lg font-bold text-slate-800">Anketa yuborildi!</h2>
        <p class="text-[13px] text-slate-500">Sizning anketangiz muvaffaqiyatli qabul qilindi. Operatorlar tez orada ko'rib chiqadi.</p>
        <button @click="reset"
          class="mt-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[13px] font-semibold transition">
          Yangi anketa yuborish
        </button>
      </div>

      <!-- Error -->
      <div v-else-if="step === 'error'" class="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center space-y-4">
        <div class="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto">
          <svg class="w-8 h-8 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <h2 class="text-lg font-bold text-slate-800">Xatolik yuz berdi</h2>
        <p class="text-[13px] text-slate-500">Anketa yuborishda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.</p>
        <button @click="step = 'form'"
          class="mt-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[13px] font-semibold transition">
          Qaytadan urinish
        </button>
      </div>

      <!-- Form -->
      <div v-else class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
        <!-- Shaxsiy ma'lumotlar -->
        <div>
          <h3 class="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Shaxsiy ma'lumotlar</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[12px] text-slate-600 font-medium mb-1">
                Ism <span class="text-rose-500">*</span>
              </label>
              <input v-model="form.name" type="text" placeholder="Ismingiz"
                class="w-full border rounded-lg px-3 py-2 text-[13px] focus:outline-none transition"
                :class="errors.name ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus:border-blue-400'" />
              <p v-if="errors.name" class="text-[11px] text-rose-500 mt-0.5">{{ errors.name }}</p>
            </div>
            <div>
              <label class="block text-[12px] text-slate-600 font-medium mb-1">Familiya</label>
              <input v-model="form.surname" type="text" placeholder="Familiyangiz"
                class="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-blue-400 transition" />
            </div>
            <div>
              <label class="block text-[12px] text-slate-600 font-medium mb-1">Otasining ismi</label>
              <input v-model="form.middle_name" type="text" placeholder="Otasining ismi"
                class="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-blue-400 transition" />
            </div>
            <div>
              <label class="block text-[12px] text-slate-600 font-medium mb-1">Jinsi</label>
              <select v-model="form.gender"
                class="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-blue-400 transition bg-white">
                <option value="">Tanlang</option>
                <option value="male">Erkak</option>
                <option value="female">Ayol</option>
              </select>
            </div>
            <div>
              <label class="block text-[12px] text-slate-600 font-medium mb-1">
                Telefon raqami <span class="text-rose-500">*</span>
              </label>
              <input v-model="form.phone_number" type="tel" placeholder="+998 __ ___ __ __"
                class="w-full border rounded-lg px-3 py-2 text-[13px] focus:outline-none transition"
                :class="errors.phone_number ? 'border-rose-400 bg-rose-50' : 'border-slate-200 focus:border-blue-400'" />
              <p v-if="errors.phone_number" class="text-[11px] text-rose-500 mt-0.5">{{ errors.phone_number }}</p>
            </div>
            <div>
              <label class="block text-[12px] text-slate-600 font-medium mb-1">Tug'ilgan sana</label>
              <input v-model="form.birthday" type="date"
                class="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-blue-400 transition" />
            </div>
          </div>
        </div>

        <!-- Ish ma'lumotlari -->
        <div>
          <h3 class="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Ish ma'lumotlari</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-if="anketaTypes.length">
              <label class="block text-[12px] text-slate-600 font-medium mb-1">Anketa turi</label>
              <select v-model="form.anketa_type_id"
                class="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-blue-400 transition bg-white">
                <option value="">Tanlang</option>
                <option v-for="t in anketaTypes" :key="t.id" :value="t.id">{{ t.name_uz }}</option>
              </select>
            </div>
            <div v-if="jobTypes.length">
              <label class="block text-[12px] text-slate-600 font-medium mb-1">Kasb / Mutaxassislik</label>
              <select v-model="form.job_type_id"
                class="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-blue-400 transition bg-white">
                <option value="">Tanlang</option>
                <option v-for="t in jobTypes" :key="t.id" :value="t.id">{{ t.name_uz }}</option>
              </select>
            </div>
            <div>
              <label class="block text-[12px] text-slate-600 font-medium mb-1">Ish tajribasi (yil)</label>
              <input v-model="form.experience_year" type="number" min="0" step="0.5" placeholder="Masalan: 2"
                class="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-blue-400 transition" />
            </div>
            <div>
              <label class="block text-[12px] text-slate-600 font-medium mb-1">Kutilayotgan maosh (so'm)</label>
              <input v-model="form.expected_salary" type="number" min="0" placeholder="Masalan: 3000000"
                class="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-blue-400 transition" />
            </div>
          </div>
        </div>

        <!-- Manzil -->
        <div v-if="regions.length">
          <h3 class="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Manzil</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-[12px] text-slate-600 font-medium mb-1">Viloyat</label>
              <select v-model="form.region_id" @change="onRegionChange"
                class="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-blue-400 transition bg-white">
                <option value="">Tanlang</option>
                <option v-for="r in regions" :key="r.id" :value="r.id">{{ r.name_uz }}</option>
              </select>
            </div>
            <div>
              <label class="block text-[12px] text-slate-600 font-medium mb-1">Tuman</label>
              <select v-model="form.district_id" :disabled="!form.region_id"
                class="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-blue-400 transition bg-white disabled:opacity-50">
                <option value="">Tanlang</option>
                <option v-for="d in districts" :key="d.id" :value="d.id">{{ d.name_uz }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Qo'shimcha -->
        <div>
          <label class="block text-[12px] text-slate-600 font-medium mb-1">Qo'shimcha ma'lumot</label>
          <textarea v-model="form.information" rows="3"
            class="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-blue-400 transition resize-none"
            placeholder="O'zingiz haqingizda qo'shimcha ma'lumot..."></textarea>
        </div>

        <button @click="submit" :disabled="loading"
          class="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-[14px] font-bold transition disabled:opacity-50 flex items-center justify-center gap-2">
          <svg v-if="loading" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ loading ? 'Yuborilmoqda...' : 'Anketani yuborish' }}
        </button>
      </div>
    </div>
  </div>
</template>
