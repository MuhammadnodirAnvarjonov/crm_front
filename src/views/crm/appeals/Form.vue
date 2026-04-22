<template>
  <form @submit.prevent="saveModel" class="flex flex-col gap-5">

    <!-- Bemor tanlash yoki yangi -->
    <div class="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
      <div class="flex items-center gap-3 mb-3">
        <span class="text-blue-600 font-semibold text-sm">Bemor ma'lumotlari</span>
        <label class="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" v-model="isNewPatient" class="w-4 h-4 rounded accent-blue-600" />
          <span class="text-gray-600">Yangi bemor (bazada yo'q)</span>
        </label>
      </div>

      <div v-if="!isNewPatient" class="relative">
        <BaseInput v-model="patientSearch" label="Bemor qidirish" @keydown.enter.prevent="handlePatientEnter" @input="searchPatients" placeholder="Ism yoki telefon..."/>

        <!-- Natijalar ro'yxati -->
        <div v-if="patientSearch && (patientResults.length || !loadingPatient)"
          class="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">

          <div v-for="p in patientResults" :key="p.id"
            class="px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-sm flex justify-between items-center border-b border-gray-50 last:border-0"
            @click="selectPatient(p)">
            <span class="font-medium">{{ p.full_name }}</span>
            <span class="text-gray-400 text-xs">{{ p.phone1 }}</span>
          </div>

          <!-- AGAR BEMOR TOPILMASA SHU QISMI CHIQADI -->
          <div v-if="patientSearch.length >= 2 && patientResults.length === 0" @click="switchToNewPatient"
            class="px-4 py-3 hover:bg-amber-50 cursor-pointer text-sm border-t border-gray-100 flex items-center gap-2 text-amber-700 font-semibold">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" stroke-width="2" stroke-linecap="round" />
            </svg>
            "{{ patientSearch }}" - yangi bemor sifatida qo'shish
          </div>
        </div>

        <!-- Tanlangan bemor chipi -->
        <div v-if="form.patient_id"
          class="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-sm">
          <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="font-medium text-green-700">{{ selectedPatientName }}</span>
          <button type="button" @click="clearPatient" class="ml-auto text-gray-400 hover:text-red-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <BaseInput v-model="form.patient_name" id="new_patient_name" label="Ism familiya" placeholder="F.I.Sh."/>
        <BaseInput v-model="form.patient_phone" label="Telefon raqam" placeholder="+998 __ ___ __ __"/>
      </div>
    </div>
    <!-- Kategoriya va kichik kategoriya -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <BaseSelect v-model="form.category_id" :options="categories" label="Kategoriya" :required="true" placeholder="Tanlang..." @change="onCategoryChange"/>
      <BaseSelect v-model="form.sub_category_id" :options="filteredSubCategories" label="Kichik kategoriya" :disabled="!form.category_id" placeholder="Tanlang..."/>
    </div>

    <!-- Mavzu -->
    <BaseInput v-model="form.subject" label="Murojaat mavzusi" :required="true" :maxlength="300" placeholder="Murojaatning qisqacha mazmuni..."/>

    <!-- Tavsif -->
    <BaseTextarea v-model="form.description" label="Batafsil tavsif" :rows="4" placeholder="Murojaat haqida to'liq ma'lumot..." />

    <!-- Manba, Ustunlik, Holat -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <BaseSelect v-model="form.source" :options="sourceOptions" label="Manba" :clearable="false"/>
      <BaseSelect v-model="form.priority" :options="priorityOptions" label="Ustunlik" :clearable="false"/>
      <BaseSelect v-model="form.status" :options="appealStatusOptions" label="Holat" :clearable="false"/>
    </div>

    <!-- Hal qilish yo'li (faqat resolved/closed uchun) -->
    <div v-if="form.status === 'resolved' || form.status === 'closed'">
      <BaseTextarea v-model="form.resolution" label="Hal qilish yo'li" :rows="3" placeholder="Murojaat qanday hal qilindi..." />
    </div>

    <!-- Ichki eslatma -->
    <BaseTextarea v-model="form.internal_note" label="Ichki eslatma" :rows="2" placeholder="Qo'shimcha eslatmalar..." />

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
      <BaseButton type="button" status="gray" @click="$emit('close')">{{ $t('cancel') }}</BaseButton>
      <BaseButton type="submit" status="primary" :disabled="loading" :loading="loading">{{ $t('save') }}</BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import CrmAppealService from "@/services/crm_appeal.service";
import CrmCategoryService from "@/services/crm_category.service";
import CrmSubCategoryService from "@/services/crm_sub_category.service";
import patientsService from "@/services/patients.service";
import BaseInput from "@/components/form/BaseInput.vue";
import BaseSelect from "@/components/form/BaseSelect.vue";
import BaseButton from "@/components/form/BaseButton.vue";
import BaseTextarea from "@/components/form/BaseTextarea.vue";

const sourceOptions = [
  { id: 'phone', name: '📞 Telefon' },
  { id: 'telegram', name: '✈️ Telegram' },
  { id: 'instagram', name: '📷 Instagram' },
  { id: 'whatsapp', name: '💬 WhatsApp' },
  { id: 'walk_in', name: '🚶 Shaxsan' },
  { id: 'email', name: '📧 Email' },
  { id: 'other', name: '🔹 Boshqa' },
];

const priorityOptions = [
  { id: 'low', name: '🟢 Past' },
  { id: 'medium', name: "🟡 O'rta" },
  { id: 'high', name: '🟠 Yuqori' },
  { id: 'urgent', name: '🔴 Shoshilinch' },
];

const appealStatusOptions = [
  { id: 'new', name: '🔵 Yangi' },
  { id: 'in_progress', name: '🟡 Jarayonda' },
  { id: 'resolved', name: '🟢 Hal qilindi' },
  { id: 'closed', name: '⚫ Yopildi' },
  { id: 'cancelled', name: '🔴 Bekor qilindi' },
];

const emit = defineEmits(["saved", "close"]);
const props = defineProps({ editData: Object });
const loadingPatient = ref(false); // yuklanish holati uchun

const loading = ref(false);
const isNewPatient = ref(false);
const categories = ref([]);
const subCategories = ref([]);
const patientSearch = ref("");
const patientResults = ref([]);
const selectedPatientName = ref("");

const sources = [
  { value: 'phone', label: 'Telefon', icon: '📞' },
  { value: 'telegram', label: 'Telegram', icon: '✈️' },
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { value: 'walk_in', label: 'Shaxsan', icon: '🚶' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'other', label: 'Boshqa', icon: '🔹' },
];

const form = ref({
  patient_id: null,
  patient_name: "",
  patient_phone: "",
  category_id: "",
  sub_category_id: "",
  subject: "",
  description: "",
  resolution: "",
  internal_note: "",
  status: "new",
  priority: "medium",
  source: "phone",
});

const filteredSubCategories = computed(() => {
  if (!form.value.category_id) return [];
  return subCategories.value.filter(s => s.category_id == form.value.category_id);
});

const handlePatientEnter = () => {
  // Agar qidiruv matni kamida 2 ta harf bo'lsa
  if (patientSearch.value.length >= 2) {
    // Agar natijalar ro'yxati bo'sh bo'lsa
    if (patientResults.value.length === 0) {
      switchToNewPatient();
    } else {
      // Agar natijalar bo'lsa, birinchi natijani avtomatik tanlash (ixtiyoriy)
      selectPatient(patientResults.value[0]);
    }
  }
};

// Yangi bemor rejimiga o'tish funksiyasi
const switchToNewPatient = () => {
  if (!patientSearch.value) return;

  const nameToTransfer = patientSearch.value;
  isNewPatient.value = true;
  form.value.patient_name = nameToTransfer;

  // Tozalash
  patientSearch.value = "";
  patientResults.value = [];

  // Ism familiya inputiga fokus berish va kursorni matn oxiriga qo'yish
  nextTick(() => {
    const input = document.getElementById('new_patient_name');
    if (input) {
      input.focus();
      // Kursorni matn oxiriga surish
      const len = input.value.length;
      input.setSelectionRange(len, len);
    }
  });
};
const onCategoryChange = () => {
  form.value.sub_category_id = "";
};

let searchTimer;
const searchPatients = (e) => {
  clearTimeout(searchTimer);
  if (!patientSearch.value || patientSearch.value.length < 2) {
    patientResults.value = [];
    return;
  }
  loadingPatient.value = true;
  searchTimer = setTimeout(async () => {
    try {
      const res = await patientsService.all({ text: patientSearch.value });
      patientResults.value = (res?.data?.data || res || []).slice(0, 10);
      console.log(patientResults.value, e);
      if (patientResults.value.length === 0 && e.keyCode === 13) switchToNewPatient();
    } catch {
      patientResults.value = [];
    } finally {
      loadingPatient.value = false;
    }
  }, 400);
};


const selectPatient = (p) => {
  form.value.patient_id = p.id;
  selectedPatientName.value = `${p.full_name} — ${p.phone1 || ''}`;
  patientResults.value = [];
  patientSearch.value = "";
};

const clearPatient = () => {
  form.value.patient_id = null;
  selectedPatientName.value = "";
};

const saveModel = async () => {
  loading.value = true;
  try {
    const data = { ...form.value };
    if (isNewPatient.value) data.patient_id = null;
    else { data.patient_name = null; data.patient_phone = null; }

    if (props.editData) {
      await CrmAppealService.update(props.editData.id, data);
    } else {
      await CrmAppealService.create(data);
    }
    emit("saved");
    emit("close");
  } catch (err) {
    console.error("Save error:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  // Kategoriyalarni yuklash
  [categories.value, subCategories.value] = await Promise.all([
    CrmCategoryService.all(),
    CrmSubCategoryService.all(),
  ]);

  if (props.editData) {
    // Agar tahrirlash bo'lsa yoki shunchaki default kategoriya uzatilgan bo'lsa
    form.value.category_id = props.editData.category_id || "";

    // Agar bu yangi yaratish bo'lsa (faqat category_id kelgan bo'lsa)
    // qolgan maydonlarni to'ldirish shart emas
    if (props.editData.subject) { // Bu haqiqiy tahrirlash (Edit mode)
      form.value.patient_id = props.editData.patient_id;
      form.value.patient_name = props.editData.patient_name || "";
      form.value.patient_phone = props.editData.patient_phone || "";
      form.value.sub_category_id = props.editData.sub_category_id || "";
      form.value.subject = props.editData.subject;
      form.value.description = props.editData.description || "";
      form.value.status = props.editData.status;
      form.value.priority = props.editData.priority;
      form.value.source = props.editData.source;

      if (props.editData.patient_name) isNewPatient.value = true;
      if (props.editData.patient) {
        selectedPatientName.value = `${props.editData.patient.full_name} — ${props.editData.patient.phone1 || ''}`;
      }
    }
  }
});
</script>
