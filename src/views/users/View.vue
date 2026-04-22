<template>
  <div class="space-y-6">
    <!-- 🔹 Sarlavha -->
    <h3 class="text-lg font-semibold mb-3 text-gray-800">
      👁️ {{ form.user_name }} ma’lumotlari
    </h3>

    <!-- 🔹 Asosiy ma’lumotlar -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <BaseView label="Foydalanuvchi nomi" :value="form.user_name" />
      <BaseView label="Telefon" :value="form.phone" />
      <BaseView label="Filial" :value="branchName" />
      <BaseView label="Rol" :value="roleName" />
      <BaseView label="Palata foizi (%)" :value="form.palata_percent" />
      <BaseView label="Fix maosh" :value="form.fix" />
      <BaseView label="Scott" :value="form.scot" />
      <BaseView label="Bo‘lim ID" :value="form.section_id" />
      <BaseView label="Xona ID" :value="form.room_id" />
      <BaseView label="Telegram Chat ID" :value="form.chat_id" />
      <BaseView label="Mutaxassisligi" :value="form.expertise" />

      <div class="md:col-span-2 flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
        <BaseView label="Faol foydalanuvchi" :value="form.activity ? '✅ Ha' : '❌ Yo‘q'" />
        <BaseView label="Hisoblash vaqtini qo‘shish" :value="form.to_count_time ? '✅ Ha' : '❌ Yo‘q'" />
      </div>

      <BaseView class="md:col-span-2" label="Izoh" :value="form.comment || '-'" />
    </div>

    <!-- 🔹 Hikvision jadvali -->
    <div class="md:col-span-2 mt-4">
      <h4 class="text-sm font-semibold text-gray-700 mb-2">Ish vaqtlari (Hikvision)</h4>
      <div class="overflow-x-auto rounded-lg border border-gray-200">
        <table class="w-full min-w-[500px] text-sm text-gray-700">
          <thead class="bg-gray-100 text-gray-700">
            <tr>
              <th class="p-2 border">Kun</th>
              <th class="p-2 border">Kirish</th>
              <th class="p-2 border">Chiqish</th>
              <th class="p-2 border text-center">Faol</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(day, idx) in form.hikvision_setting" :key="idx">
              <td class="border p-2">{{ day.name }}</td>
              <td class="border p-2 text-center">{{ day.come_time || "-" }}</td>
              <td class="border p-2 text-center">{{ day.leave_time || "-" }}</td>
              <td class="border text-center">{{ day.disabled ? "✅" : "❌" }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 🔹 Tugma -->
    <div class="flex justify-end mt-6">
      <button
        @click="$emit('close')"
        type="button"
        class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition"
      >
        Yopish
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from "vue";
import BaseView from "@/components/form/BaseView.vue";
import branchService from "@/services/branchs.service";
import roleService from "@/services/roles.service";

const emit = defineEmits(["close"]);
const props = defineProps({ viewData: Object });

const form = ref({});
const branches = ref([]);
const roles = ref([]);

const branchName = computed(() => {
  const b = branches.value.find((i) => i.id === form.value.branch_id);
  return b ? b.name : "-";
});

const roleName = computed(() => {
  const r = roles.value.find((i) => i.id === form.value.role_id);
  return r ? r.name : "-";
});

watch(
  () => props.viewData,
  (val) => {
    if (val) {
      form.value = {
        ...val,
        hikvision_setting:
          typeof val.hikvision_setting === "string"
            ? JSON.parse(val.hikvision_setting)
            : val.hikvision_setting || [],
      };
    }
  },
  { immediate: true }
);

onMounted(async () => {
  try {
    [branches.value, roles.value] = await Promise.all([
      branchService.all(),
      roleService.all(),
    ]);
  } catch (e) {
    console.error("Filial/rol yuklashda xato:", e);
  }
});
</script>
