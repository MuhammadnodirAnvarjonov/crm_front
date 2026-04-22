<template>
  <form @submit.prevent="saveModel" class="flex flex-col gap-5">
    <!-- Kategoriya -->
    <BaseSelect v-model="form.category_id" :options="props.categories" label="Asosiy kategoriya" :required="true" placeholder="Tanlang..."/>

    <!-- Nom -->
    <BaseInput v-model="form.name" label="Nom" :required="true" :maxlength="150" placeholder="Kichik kategoriya nomi..."/>

    <!-- Tavsif -->
    <BaseTextarea v-model="form.description" label="Tavsif" :rows="3" :maxlength="500" />

    <!-- Tartib va holat -->
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
import CrmSubCategoryService from "@/services/crm_sub_category.service";
import BaseInput from "@/components/form/BaseInput.vue";
import BaseInputNumber from "@/components/form/BaseInputNumber.vue";
import BaseSelect from "@/components/form/BaseSelect.vue";
import BaseButton from "@/components/form/BaseButton.vue";
import BaseTextarea from "@/components/form/BaseTextarea.vue";

const emit = defineEmits(["saved", "close"]);
const props = defineProps({ editData: Object, categories: Array });
const loading = ref(false);

const form = ref({
  category_id: "",
  name: "",
  description: "",
  is_active: true,
  sort_order: 0,
});

const saveModel = async () => {
  loading.value = true;
  try {
    if (props.editData) {
      await CrmSubCategoryService.update(props.editData.id, form.value);
    } else {
      await CrmSubCategoryService.create(form.value);
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
