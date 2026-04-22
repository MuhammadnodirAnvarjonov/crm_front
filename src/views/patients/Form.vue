<template>
  <form @submit.prevent="savePatient" class="flex flex-col h-full">

    <!-- Scrollable Content Area -->
    <div class="flex-1 overflow-y-auto px-1 py-2">
      <div class="space-y-6 pb-4">

        <!-- 1-BLOK: ASOSIY MA'LUMOTLAR (Eng muhim - Moviy fon) -->
        <div class="bg-blue-50/60 p-5 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden">
          <!-- Dekorativ element -->
          <div
            class="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-bl-full opacity-50 -mr-4 -mt-4 pointer-events-none">
          </div>

          <h3
            class="text-sm uppercase tracking-wide text-blue-700 font-bold mb-5 flex items-center gap-2 relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
            </svg>
            {{ $t('personal_info') }} <span class="text-xs normal-case font-normal text-blue-500 ml-2">({{
              $t('most_important') }})</span>
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-6 relative z-10">
            <!-- F.I.O -->
            <div class="md:col-span-8">
              <BaseInput :label="$t('full_name')" v-model="form.full_name" required
                placeholder="Familiya Ism Otasining ismi" @input="detectGender" />
            </div>

            <!-- Jins (Radio Buttons) -->
            <div class="md:col-span-4">
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">{{ $t('gender') }}</label>
              <div class="flex gap-2 h-[46px]"> <!-- Input balandligi bilan bir xil -->
                <label class="flex-1 cursor-pointer relative">
                  <input type="radio" v-model="form.gender" value="male" class="peer sr-only">
                  <div
                    class="w-full h-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white text-gray-600 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 transition-all shadow-sm font-medium">
                    <span>Erkak</span>
                  </div>
                </label>
                <label class="flex-1 cursor-pointer relative">
                  <input type="radio" v-model="form.gender" value="female" class="peer sr-only">
                  <div
                    class="w-full h-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white text-gray-600 peer-checked:bg-pink-500 peer-checked:text-white peer-checked:border-pink-500 transition-all shadow-sm font-medium">
                    <span>Ayol</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Asosiy Telefon -->
            <div class="md:col-span-4">
              <BaseInput :label="$t('phone') + ' 1'" v-model="form.phone1" required type="tel"
                v-mask="'(##) ###-##-##'" />
            </div>

            <!-- Tug'ilgan sana (Auto-focus logic) -->
            <div class="md:col-span-8">
              <label class="block text-sm font-semibold text-gray-700 mb-1.5 select-none">{{ $t('birth_date') }}</label>
              <div class="flex gap-3">
                <!-- Kun -->
                <div class="w-24 relative">
                  <input ref="dayRef" v-model="form.birthday" type="number" placeholder="Kun"
                    class="w-full text-center rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    @input="handleDateInput($event, 'day', 2, monthRef)" />
                  <span class="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">DD</span>
                </div>

                <span class="text-gray-400 text-xl pt-1">/</span>

                <!-- Oy -->
                <div class="w-24 relative">
                  <input ref="monthRef" v-model="form.birthmonth" type="number" placeholder="Oy"
                    class="w-full text-center rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    @input="handleDateInput($event, 'month', 2, yearRef)"
                    @keydown.backspace="handleBackspace($event, form.birthmonth, dayRef)" />
                  <span class="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">MM</span>
                </div>

                <span class="text-gray-400 text-xl pt-1">/</span>

                <!-- Yil -->
                <div class="flex-1 relative">
                  <input ref="yearRef" v-model="form.birthyear" type="number" placeholder="Yil"
                    class="w-full text-center rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    @keydown.backspace="handleBackspace($event, form.birthyear, monthRef)" />
                  <span class="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">YYYY</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2-BLOK: MANZIL (Hudud va Tuman) - Kulrang fon -->
        <div class="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 shadow-sm">
          <h3 class="text-sm uppercase tracking-wide text-gray-600 font-bold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clip-rule="evenodd" />
            </svg>
            {{ $t('address_info') }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-5">
            <!-- Region -->
            <div class="md:col-span-6">
              <BaseSelect :label="$t('region')" v-model="form.region_id" :options="regions" label-key="name_uz"
                value-key="id" @change="onRegionChange" required />
            </div>

            <!-- District -->
            <div class="md:col-span-6">
              <BaseSelect :label="$t('district')" v-model="form.district_id" :options="districts" label-key="name_uz"
                value-key="id" :disabled="!form.region_id" required />
            </div>

            <!-- Manzil -->
            <div class="md:col-span-12">
              <BaseInput :label="$t('address')" v-model="form.address" required :placeholder="$t('enter_address')" />
            </div>
          </div>
        </div>

        <!-- 3-BLOK: HUJJAT VA QO'SHIMCHA - Kulrang fon -->
        <div class="bg-gray-50/50 p-5 rounded-2xl border border-gray-100 shadow-sm">
          <h3 class="text-sm uppercase tracking-wide text-gray-600 font-bold mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clip-rule="evenodd" />
            </svg>
            {{ $t('passport_and_extra_info') }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-5">
            <!-- Pasport Seriya -->
            <div class="md:col-span-4">
              <BaseInput :label="$t('passport_series')" v-model="form.passport" placeholder="AA1234567"
                class="uppercase" />
            </div>

            <!-- JSHSHIR -->
            <div class="md:col-span-4">
              <BaseInput :label="$t('jshshir')" v-model="form.password_hash" placeholder="--------------" type="number"
                :maxlength="14" />
            </div>

            <!-- Qo'shimcha telefon -->
            <div class="md:col-span-4">
              <BaseInput :label="$t('phone') + ' 2'" v-model="form.phone2" type="tel" v-mask="'(##) ###-##-##'" />
            </div>

            <!-- Fuqarolik -->
            <div class="md:col-span-4">
              <BaseInput :label="$t('citizenship')" v-model="form.citizenship" required />
            </div>

            <!-- Ish joyi -->
            <div class="md:col-span-8">
              <BaseInput :label="$t('workplace')" v-model="form.workplace" />
            </div>

            <!-- Izoh -->
            <div class="md:col-span-12">
              <BaseInput type="textarea" :label="$t('comment')" v-model="form.comment" rows="2" />
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Footer Action Buttons -->
    <div class="flex justify-end gap-3 pt-5 mt-2 border-t border-gray-100 bg-white sticky bottom-0 z-10">
      <BaseButton type="button" status="gray" @click="$emit('close')">
        {{ $t('cancel') }}
      </BaseButton>

      <BaseButton type="submit" status="primary">
        {{ $t('save') }}
      </BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, defineEmits, onMounted, nextTick } from "vue";
import ModelService from "@/services/patients.service";
import regionService from "@/services/region.service";
import districtService from "@/services/district.service";

import BaseInput from "@/components/form/BaseInput.vue";
import BaseSelect from "@/components/form/BaseSelect.vue";
import BaseButton from "@/components/form/BaseButton.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const emit = defineEmits(["saved", "close"]);

const props = defineProps({
  editData: Object,
});

// Ma'lumotlar
const regions = ref([]);
const districts = ref([]);

// Input Refs (Focus boshqarish uchun)
const dayRef = ref(null);
const monthRef = ref(null);
const yearRef = ref(null);

const form = ref({
  full_name: "",
  region_id: null,
  district_id: null,
  address: "",
  phone1: "+998",
  phone2: "",
  code: "",
  passport: "",
  password_hash: "",
  balance: 0,
  gender: "male", // Default
  birthday: "",
  birthmonth: "",
  birthyear: "",
  citizenship: "Uzbekistan",
  comment: "",
  workplace: "",
});

// --- Jinsni Avtomatik aniqlash (Fullname orqali) ---
const detectGender = () => {
  const name = form.value.full_name.trim().toLowerCase();
  if (!name) return;

  // Uzbek ismlari/familiyalari uchun qo'shimchalar (Kirill va Lotin)
  const femaleSuffixes = ['qizi', 'kizi', 'ova', 'eva', ' қизи', 'ова', 'ева'];
  const maleSuffixes = ['ovich', 'vich', 'ov', 'ev', 'ович', 'вич', 'ов', 'ев'];

  // Ayol jinsini tekshirish
  if (femaleSuffixes.some(suffix => name.endsWith(suffix))) {
    form.value.gender = 'female';
    return;
  }

  // Erkak jinsini tekshirish
  if (maleSuffixes.some(suffix => name.endsWith(suffix))) {
    form.value.gender = 'male';
    return;
  }

  // Qo'shimcha tekshiruv: Familiya odatda birinchi keladi (masalan: Aliyeva Dildora)
  const parts = name.split(' ');
  if (parts.length > 0) {
    const firstPart = parts[0]; // Familiya ehtimoli yuqori
    if (femaleSuffixes.some(suffix => firstPart.endsWith(suffix))) form.value.gender = 'female';
    else if (maleSuffixes.some(suffix => firstPart.endsWith(suffix))) form.value.gender = 'male';
  }
};

// --- Sana Inputlari Logikasi (Auto Focus) ---
const handleDateInput = (event, type, maxLength, nextRef) => {
  const val = event.target.value;

  // Faqat raqamlarni qoldirish (xavfsizlik uchun)
  if (type === 'day') form.value.birthday = val.slice(0, 2);
  if (type === 'month') form.value.birthmonth = val.slice(0, 2);
  if (type === 'year') form.value.birthyear = val.slice(0, 4);

  // Agar uzunlik yetarli bo'lsa, keyingi inputga o'tish
  if (val.length >= maxLength && nextRef) {
    nextRef.focus();
  }
};

const handleBackspace = (event, currentValue, prevRef) => {
  // Agar input bo'sh bo'lsa va backspace bosilsa, oldingi inputga qaytish
  if (!currentValue && prevRef) {
    prevRef.focus();
  }
};

// Yordamchi funksiyalar
const getRegions = async () => {
  try {
    const res = await regionService.all();
    regions.value = res || [];
  } catch (e) { console.error(e); }
};

const getDistricts = async (regionId) => {
  if (!regionId) {
    districts.value = [];
    return;
  }
  try {
    const res = await districtService.all({ region_id: regionId });
    districts.value = res || [];
  } catch (e) { console.error(e); }
};

const onRegionChange = async () => {
  form.value.district_id = null;
  await getDistricts(form.value.region_id);
};

// Formani to'ldirish
onMounted(async () => {
  await getRegions();

  if (props.editData) {
    form.value = { ...props.editData };

    if (form.value.region_id) {
      await getDistricts(form.value.region_id);
    }
  }
});

const savePatient = async () => {
  try {
    // Kun va oyni 0 bilan to'ldirish
    if (form.value.birthday) form.value.birthday = String(form.value.birthday).padStart(2, '0');
    if (form.value.birthmonth) form.value.birthmonth = String(form.value.birthmonth).padStart(2, '0');

    if (props.editData) {
      await ModelService.update(props.editData.id, form.value);
    } else {
      await ModelService.create(form.value);
    }

    emit("saved");
    emit("close");
  } catch (err) {
    console.error("Patient save error:", err);
  }
};
</script>