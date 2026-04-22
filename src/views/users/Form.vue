<template>
  <form @submit.prevent="saveUser" class="flex flex-col h-full bg-white">
    <!-- 🔹 Scrollable Content -->
    <div class="p-6 space-y-8 overflow-y-auto custom-scrollbar">

      <!-- 1-Guruh: Asosiy Ma'lumotlar -->
      <section>
        <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 border-l-4 border-blue-500 pl-3">
          Shaxsiy ma'lumotlar
        </h4>

        <!-- Asosiy Container: Mobileda ustma-ust, Desktopda yonma-yon -->
        <div class="flex flex-col lg:flex-row gap-6 lg:gap-10">

          <!-- 1. RASMLAR QISMI (Chap taraf yoki tepa) -->
          <div class="flex-shrink-0 w-full lg:w-64 flex flex-col items-center lg:items-start gap-4">
            <!-- Mobile ilova uchun rasm -->
            <div class="w-full max-w-xs lg:max-w-full">
              <ImageUpload v-model="form.image" label="Mobile ilova uchun rasm" :placeholder="'Rasm (200x200)'" />
              <p class="text-xs text-gray-500 text-center lg:text-left mt-1">
                Format: JPG, PNG. Maksimal: 5MB
              </p>
            </div>
            <!-- Hikvision uchun rasm -->
            <div class="w-full max-w-xs lg:max-w-full">
              <label class="text-sm font-medium text-gray-700 block mb-2">Hikvision uchun rasm</label>
              <!-- Preview -->
              <div v-if="form.hikvision_image || hikPreview" class="relative w-full overflow-hidden rounded-xl border border-gray-200 group">
                <img :src="hikPreviewUrl" class="w-full h-48 object-cover bg-gray-50" alt="Hikvision rasm" />
                <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                  <button type="button" @click="$refs.hikInput.click()"
                    class="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-100 transition">
                    Almashtirish
                  </button>
                  <button type="button" @click="removeHikImage"
                    class="bg-white text-red-500 p-2 rounded-lg shadow-sm hover:bg-gray-100 transition">
                    O'chirish
                  </button>
                </div>
                <div v-if="hikUploading" class="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <p class="text-blue-600 font-medium animate-pulse">Siqilmoqda va yuklanmoqda...</p>
                </div>
              </div>
              <!-- Upload box -->
              <div v-else class="border-2 border-dashed border-gray-300 rounded-xl p-4
                flex flex-col items-center justify-center gap-2 cursor-pointer
                hover:border-blue-500 hover:bg-blue-50 transition group bg-white"
                @click="$refs.hikInput.click()" @dragover.prevent @drop.prevent="hikDrop">
                <div class="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg">
                  📷
                </div>
                <p class="text-gray-600 text-xs">
                  <span class="font-medium text-blue-600">Rasm yuklang</span> (200x200)
                </p>
                <p v-if="hikUploading" class="text-blue-600 text-sm font-medium animate-pulse">Yuklanmoqda...</p>
              </div>
              <input ref="hikInput" type="file" class="hidden" accept="image/*" @change="hikFileChange" />
              <p class="text-xs text-gray-500 text-center lg:text-left mt-1">
                Avtomatik 200KB gacha siqiladi
              </p>
            </div>
          </div>

          <!-- 2. INPUTLAR QISMI (O'ng taraf) -->
          <div class="flex-grow grid grid-cols-1 md:grid-cols-2 gap-5 h-fit">

            <!-- F.I.O -->
            <div>
              <BaseInput label="F.I.O *" v-model="form.user_name" required placeholder="To'liq ismini kiriting" />
            </div>

            <!-- Jinsi -->
            <div>
              <BaseSelect label="Jinsi" v-model="form.gender" :options="genderOptions" label-key="label" value-key="value" placeholder="Avtomatik aniqlanadi" />
            </div>

            <!-- Telefon -->
            <div>
              <BaseInput label="Telefon raqam" v-model="form.phone" placeholder="+998 (90) 123-45-67" />
            </div>

            <!-- Parol -->
            <div>
              <BaseInput label="Parol" v-model="form.password" type="password"
                :placeholder="editData ? 'O\'zgartirish uchun yangi parol' : '********'" :required="!editData" />
            </div>

            <!-- Mutaxassislik -->
            <div class="md:col-span-2 lg:col-span-1">
              <BaseInput label="Mutaxassisligi" v-model="form.expertise" placeholder="Masalan: Terapevt, Kassir..." />
            </div>

            <!-- Filial -->
            <div class="md:col-span-2 lg:col-span-1">
              <BaseSelect label="Filial" v-model="form.branch_id" :options="branches" label-key="name" value-key="id"
                :placeholder="$t('branch')" />
            </div>

          </div>
        </div>
      </section>

      <hr class="border-gray-100">

      <!-- 2-Guruh: Lavozim va Joylashuv -->
      <section>
        <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-l-4 border-indigo-500 pl-2">
          Lavozim va Joylashuv
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <BaseSelect label="Rol (Ruxsatlar)" v-model="form.role_id" :options="roles" label-key="name" value-key="id" />
          <BaseSelect :label="$t('section')" v-model="form.section_id" :options="sections" label-key="name"
            value-key="id" />
          <BaseSelect :label="$t('room')" v-model="form.room_id" :options="rooms" label-key="name" value-key="id" />
          <BaseInputNumber :label="$t('duration')" v-model="form.duration" :step="1" :min="0" :format="false" />
          <div class="col-span-2 flex flex-wrap gap-6 mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <BaseCheckbox v-model="views.mobile" :label="$t('mobile')" />
            <BaseCheckbox v-model="views.bot" :label="$t('bot')" />
            <BaseCheckbox v-model="views.sayt" :label="$t('sayt')" />
            <BaseCheckbox v-model="views.panel" :label="$t('panel')" />
          </div>
        </div>

        <!-- Status Checkboxlar -->
        <div class="flex flex-wrap gap-6 mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <BaseCheckbox v-model="form.activity" label="Faol foydalanuvchi (Tizimga kira oladi)" />
          <BaseCheckbox v-model="form.to_count_time" label="Ish vaqti hisoblansin (KPI)" />
          <BaseCheckbox v-model="form.is_direct" label="Direct (Yo'naltiruvchi)" />
        </div>
      </section>

      <!-- 3-Guruh: Moliya (Alohida Card ko'rinishida) -->
      <section class="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <h4 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span class="bg-green-100 text-green-700 p-1 rounded">💰</span> Moliya va Ish haqi
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <BaseInputNumber label="Fix maosh (so'm)" v-model="form.fix" :step="100" required class="font-medium" />
          <BaseSelect label="Palata ulush turi" v-model="form.palata_type" :options="globalStore.userPalataTypes" :clearable="false" />
          <BaseInputNumber v-if="form.palata_type === 'percent'" label="Palata ulushi (%)" v-model="form.palata_percent" :step="0.1" />
          <BaseInputNumber v-else-if="form.palata_type === 'per_day'" label="Kunlik summa (so'm)" v-model="form.palata_summa" :step="100" />
          <BaseInputNumber v-else label="Umumiy summa (so'm)" v-model="form.palata_summa" :step="100" />
          <BaseInputNumber label="NDS" v-model="form.scot" :step="10" :max="100" />
          <!-- <BaseInputNumber label="Oylik maosh (so'm)" v-model="form.salary" :step="1000" /> -->
        </div>

      </section>

      <section>
        <div class="flex justify-between items-center mb-3">
          <h4 class="text-sm font-bold text-gray-900 uppercase tracking-wider border-l-4 border-orange-500 pl-2">
            Kirish-chiqish vaqtlari (Hikvision)
          </h4>
          <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Avto-sinxronizatsiya</span>
        </div>

        <div class="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div class="flex items-center gap-4 px-4 py-3 bg-blue-50 border-b border-gray-200">
            <span class="text-xs font-medium text-blue-700 whitespace-nowrap">Umumiy:</span>
            <BaseInput type="time" v-model="commonTime.come_time" placeholder="Kelish"
              @update:modelValue="applyCommonTime" class="w-36" />
            <BaseInput type="time" v-model="commonTime.leave_time" placeholder="Ketish"
              @update:modelValue="applyCommonTime" class="w-36" />
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm text-left text-gray-600">
              <thead class="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th class="px-4 py-3 font-medium">Hafta kuni</th>
                  <th class="px-4 py-3 font-medium">Kelish vaqti</th>
                  <th class="px-4 py-3 font-medium">Ketish vaqti</th>
                  <th class="px-4 py-3 font-medium text-center">Dam olish</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(day, idx) in form.hikvision_setting" :key="idx" class="hover:bg-gray-50 transition-colors"
                  :class="{ 'bg-gray-50 opacity-70': day.disabled }">
                  <td class="px-4 py-2 font-medium text-gray-800">{{ day.name }}</td>
                  <td class="px-4 py-2">
                    <BaseInput type="time" v-model="day.come_time" :disabled="day.disabled" />
                  </td>
                  <td class="px-4 py-2">
                    <BaseInput type="time" v-model="day.leave_time" :disabled="day.disabled" />
                  </td>
                  <td class="px-4 py-2 text-center">
                    <BaseSwitch v-model="day.disabled" color="red" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Izoh -->
      <div class="col-span-full">
        <BaseTextarea label="Qo'shimcha izoh" v-model="form.comment" rows="2"
          placeholder="Foydalanuvchi haqida qo'shimcha ma'lumot..." />
      </div>

    </div>

    <!-- 🔹 Footer Buttons (Sticky) -->
    <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 sticky bottom-0 z-10">
      <BaseButton type="button" status="gray" @click="$emit('close')">{{ $t('cancel') }}</BaseButton>
      <BaseButton type="submit" status="primary">{{ $t('save') }}</BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed, inject, onMounted } from "vue";
import userService from "@/services/users.service";
import branchService from "@/services/branchs.service";
import roleService from "@/services/roles.service";
import sectionService from "@/services/sections.service";
import roomService from "@/services/rooms.service";
import uploadService from "@/services/upload.service";
// UI komponentlar (importlar o'zgarmadi)
import BaseInput from "@/components/form/BaseInput.vue";
import BaseSelect from "@/components/form/BaseSelect.vue";
import BaseTextarea from "@/components/form/BaseTextarea.vue";
import BaseCheckbox from "@/components/form/BaseCheckbox.vue";
import BaseSwitch from '@/components/form/BaseSwitch.vue';
import ImageUpload from "@/components/form/ImageUpload.vue";
import BaseInputNumber from "@/components/form/BaseInputNumber.vue";
import BaseButton from "@/components/form/BaseButton.vue";
import { useUserStore } from "@/stores/user";
import { useGlobalStore } from "@/stores/global";
const userStore = useUserStore();
const globalStore = useGlobalStore();
const baseUrl = inject("fileUrl", "");

const emit = defineEmits(["saved", "close"]);
const props = defineProps({ editData: Object });
const views = ref({
  mobile: false,
  panel: true,
  sayt: true,
  bot: false
})
// State
const branches = ref([]);
const roles = ref([]);
const sections = ref([]);
const rooms = ref([]);
const serviceCategories = ref([]);
const genderOptions = [
  { value: 'male', label: 'Erkak' },
  { value: 'female', label: 'Ayol' },
];

// Standart Hikvision vaqtlari
const defaultHikvision = [
  { name: "Yakshanba", come_time: "", leave_time: "", disabled: true },
  { name: "Dushanba", come_time: "08:00", leave_time: "17:00", disabled: false },
  { name: "Seshanba", come_time: "08:00", leave_time: "17:00", disabled: false },
  { name: "Chorshanba", come_time: "08:00", leave_time: "17:00", disabled: false },
  { name: "Payshanba", come_time: "08:00", leave_time: "17:00", disabled: false },
  { name: "Juma", come_time: "08:00", leave_time: "17:00", disabled: false },
  { name: "Shanba", come_time: "08:00", leave_time: "17:00", disabled: false },
];

const commonTime = ref({ come_time: '', leave_time: '' });

const applyCommonTime = () => {
  form.value.hikvision_setting.forEach(day => {
    if (!day.disabled) {
      if (commonTime.value.come_time) day.come_time = commonTime.value.come_time;
      if (commonTime.value.leave_time) day.leave_time = commonTime.value.leave_time;
    }
  });
};

const form = ref({
  user_name: "",
  image: null,
  phone: "",
  branch_id: userStore.user?.branch_id || null,
  role_id: null,
  comment: "",
  password: "123456",
  fix: 0,
  palata_percent: 0,
  palata_summa: 0,
  palata_type: 'percent',
  scot: 0,
  salary: 0,
  to_count_time: false,
  hikvision_setting: JSON.parse(JSON.stringify(defaultHikvision)),
  expertise: "",
  activity: true,
  section_id: null,
  room_id: null,
  duration: 0,
  is_direct: false,
  gender: null,
  hikvision_image: null,
});

// === Hikvision rasm ===
const hikPreview = ref(null);
const hikUploading = ref(false);

const hikPreviewUrl = computed(() => {
  if (hikPreview.value) return hikPreview.value;
  if (form.value.hikvision_image) {
    const sep = baseUrl.endsWith('/') ? '' : '/';
    return `${baseUrl}${sep}${form.value.hikvision_image}`;
  }
  return null;
});

// Rasmni canvas orqali 200KB gacha siqish
const compressImage = (file, maxSizeKB = 200) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      let quality = 0.9;
      const tryCompress = () => {
        canvas.toBlob((blob) => {
          if (blob.size > maxSizeKB * 1024 && quality > 0.1) {
            quality -= 0.1;
            tryCompress();
          } else {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          }
        }, 'image/jpeg', quality);
      };
      tryCompress();
    };
    img.src = URL.createObjectURL(file);
  });
};

const processHikFile = async (file) => {
  if (!file) return;
  hikPreview.value = URL.createObjectURL(file);
  hikUploading.value = true;
  try {
    const compressed = await compressImage(file);
    const formData = new FormData();
    formData.append('file', compressed);
    const res = await uploadService.uploadFile(formData);
    form.value.hikvision_image = res?.file || res?.data?.file;
  } catch (e) {
    console.error('Hikvision rasm yuklash xatosi:', e);
    removeHikImage();
  } finally {
    hikUploading.value = false;
  }
};

const hikFileChange = (e) => processHikFile(e.target.files[0]);
const hikDrop = (e) => processHikFile(e.dataTransfer.files[0]);

const removeHikImage = () => {
  form.value.hikvision_image = null;
  hikPreview.value = null;
};

// Ismdan jinsni avtomatik aniqlash
const detectGender = (name) => {
  if (!name || !name.trim()) return;
  const lower = name.trim().toLowerCase();
  const femaleSuffixes = ['qizi', 'kizi', 'ova', 'eva', 'қизи', 'ова', 'ева'];
  const maleSuffixes = ['ovich', 'vich', 'ov', 'ev', 'ович', 'вич', 'ов', 'ев'];

  const parts = lower.split(/\s+/);
  const checkParts = [lower, ...parts];

  for (const part of checkParts) {
    if (femaleSuffixes.some(s => part.endsWith(s))) {
      form.value.gender = 'female';
      return;
    }
    if (maleSuffixes.some(s => part.endsWith(s))) {
      form.value.gender = 'male';
      return;
    }
  }
};

watch(() => form.value.user_name, (val) => {
  detectGender(val);
});

// Palata: type o'zgarganda ikkinchisini nolga tushirish
watch(() => form.value.palata_type, (val) => {
  if (val === 'percent') form.value.palata_summa = 0;
  else form.value.palata_percent = 0;
});

// Ma'lumotlarni yuklash va formani to'ldirish
watch(
  () => props.editData,
  (val) => {
    if (val) {
      form.value = {
        ...val,
        // JSON string kelishi mumkin yoki object
        hikvision_setting: typeof val.hikvision_setting === "string"
          ? JSON.parse(val.hikvision_setting)
          : val.hikvision_setting || JSON.parse(JSON.stringify(defaultHikvision)),
        password: "", // Parolni xavfsizlik uchun bo'shatamiz
      };
      const savedView = JSON.parse(val.view || "[]"); // ["mobile", "sayt"]

      // Hammasini false qilib, keyin borlarini true qilish

      if (Array.isArray(savedView)) {
        // Hammasini avval o'chiramiz (ixtiyoriy)
        Object.keys(views.value).forEach(k => views.value[k] = false);

        // Borlarini yoqamiz
        savedView.forEach(key => {
          if (views.value.hasOwnProperty(key)) {
            views.value[key] = true;
          }
        });
      }
    }
  },
  { immediate: true }
);

const saveUser = async () => {
  try {
    // Hikvision settingni stringga o'girib jo'natamiz
    const activeViews = Object.keys(views.value).filter(key => views.value[key]);
    const payload = {
      ...form.value,
      hikvision_setting: JSON.stringify(form.value.hikvision_setting),
      view: `[${activeViews}]`
    };

    // Parol bo'sh bo'lsa, uni payload dan olib tashlash kerak (agar backend parolni o'zgartirmaslikni qo'llab-quvvatlasa)
    if (!payload.password) delete payload.password;

    if (props.editData) await userService.update(props.editData.id, payload);
    else await userService.create(payload);

    emit("saved");
    emit("close");
  } catch (err) {
    console.error("User save error:", err);
    // Xatolik xabarini chiqarish logikasini shu yerga qo'shishingiz mumkin (Toast va h.k.)
  }
};

// API so'rovlar
const fetchData = async () => {
  try {
    const [bRes, rRes, sRes, rmRes] = await Promise.all([
      branchService.all(),
      roleService.all(),
      sectionService.all(),
      roomService.all()
    ]);
    branches.value = bRes || [];
    roles.value = rRes || [];
    sections.value = sRes || [];
    rooms.value = rmRes || [];
  } catch (e) {
    console.error("Ma'lumotlarni yuklashda xato:", e);
  }
};

onMounted(async () => {
  await fetchData();
});
</script>

<style scoped>
/* Kichik detallar uchun */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>