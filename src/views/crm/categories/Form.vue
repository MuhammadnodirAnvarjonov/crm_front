<template>
  <form @submit.prevent="saveModel" class="flex flex-col gap-5">
    <!-- Nom -->
    <BaseInput v-model="form.name" label="Kategoriya nomi" :required="true" :maxlength="150" placeholder="Masalan: Shikoyat, Taklif, Savol..."/>

    <!-- Tavsif -->
    <BaseTextarea v-model="form.description" label="Tavsif" :rows="3" :maxlength="500" placeholder="Kategoriya haqida qisqacha..." />

    <!-- Rang -->
    <div>
      <label class="block text-sm font-semibold text-gray-700 mb-1.5">Rang</label>
      <div class="flex items-center gap-3">
        <input type="color" v-model="form.color"
          class="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
        <div class="flex flex-wrap gap-2">
          <button v-for="color in presetColors" :key="color" type="button"
            class="w-8 h-8 rounded-lg border-2 transition-all"
            :class="form.color === color ? 'border-gray-800 scale-110' : 'border-transparent'"
            :style="{ backgroundColor: color }"
            @click="form.color = color" />
        </div>
      </div>
    </div>

    <!-- Tartib raqami va faollik -->
    <div class="grid grid-cols-2 gap-4">
      <BaseInputNumber v-model="form.sort_order" label="Tartib raqami" :min="0" :format="false"/>
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-1.5">Holat</label>
        <div class="flex items-center gap-3 mt-3">
          <button type="button" @click="form.is_active = !form.is_active"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300"
            :class="form.is_active ? 'bg-green-500' : 'bg-gray-300'">
            <span class="inline-block w-4 h-4 transform rounded-full bg-white shadow transition-transform duration-300"
              :class="form.is_active ? 'translate-x-6' : 'translate-x-1'" />
          </button>
          <span class="text-sm text-gray-600">{{ form.is_active ? 'Faol' : 'Faol emas' }}</span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
      <BaseButton type="button" status="gray" @click="$emit('close')">{{ $t('cancel') }}</BaseButton>
      <BaseButton type="submit" status="primary" :disabled="loading" :loading="loading">{{ $t('save') }}</BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted } from "vue";
import CrmCategoryService from "@/services/crm_category.service";
import BaseInput from "@/components/form/BaseInput.vue";
import BaseInputNumber from "@/components/form/BaseInputNumber.vue";
import BaseButton from "@/components/form/BaseButton.vue";
import BaseTextarea from "@/components/form/BaseTextarea.vue";

const emit = defineEmits(["saved", "close"]);
const props = defineProps({ editData: Object });
const loading = ref(false);

const presetColors = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

const form = ref({
  name: "",
  description: "",
  color: "#7c3aed",
  icon: "chat",
  is_active: true,
  sort_order: 0,
});

const saveModel = async () => {
  loading.value = true;
  try {
    if (props.editData) {
      await CrmCategoryService.update(props.editData.id, form.value);
    } else {
      await CrmCategoryService.create(form.value);
    }
    emit("saved");
    emit("close");
  } catch (err) {
    console.error("Save error:", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (props.editData) {
    form.value = { ...props.editData };
  }
});
</script>
