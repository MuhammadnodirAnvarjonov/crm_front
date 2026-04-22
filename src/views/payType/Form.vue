<template>
  <form @submit.prevent="saveData" class="space-y-4">
    <div class="grid grid-cols-1 gap-4">
      <BaseInput v-model="form.name" label="Key (naqd, plastik, ...)" required />
      <BaseInput v-model="form.name_uz" :label="$t('name') + ' (UZ)'" required />
      <BaseInput v-model="form.name_uzk" :label="$t('name') + ' (УЗ)'" />
      <BaseInput v-model="form.name_ru" :label="$t('name') + ' (RU)'" />

      <BaseSelect
        v-model="form.color"
        :label="$t('pay_type_color')"
        :options="colorOptions"
        label-key="label"
        value-key="value"
      />

      <BaseInputNumber v-model="form.order" :label="$t('pay_type_order')" :min="0" :step="1" />

      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" v-model="form.is_default" class="w-4 h-4 text-blue-600 rounded border-gray-300" />
        <span class="text-sm text-gray-700">{{ $t('is_default') }}</span>
      </label>
    </div>

    <div class="flex justify-end mt-5 gap-2">
      <BaseButton type="button" status="gray" @click="$emit('close')" :label="$t('cancel')" />
      <BaseButton type="submit" status="primary" :label="$t('save')" />
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted } from "vue";
import PayTypeService from "@/services/pay-type.service";
import BaseInput from "@/components/form/BaseInput.vue";
import BaseSelect from "@/components/form/BaseSelect.vue";
import BaseInputNumber from "@/components/form/BaseInputNumber.vue";
import BaseButton from "@/components/form/BaseButton.vue";

const emit = defineEmits(["saved", "close"]);
const props = defineProps({
  editData: Object,
});

const colorOptions = [
  { value: 'success', label: 'Success (green)' },
  { value: 'info', label: 'Info (blue)' },
  { value: 'warning', label: 'Warning (yellow)' },
  { value: 'primary', label: 'Primary (indigo)' },
  { value: 'purple', label: 'Purple' },
  { value: 'danger', label: 'Danger (red)' },
  { value: 'default', label: 'Default (gray)' },
];

const form = ref({
  name: "",
  name_uz: "",
  name_uzk: "",
  name_ru: "",
  color: "default",
  order: 0,
  is_default: false,
});

const saveData = async () => {
  try {
    const payload = { ...form.value };
    if (props.editData?.id) {
      await PayTypeService.update(props.editData.id, payload);
    } else {
      await PayTypeService.create(payload);
    }
    emit("saved");
    emit("close");
  } catch (err) {
    console.error("PayType save error:", err);
  }
};

onMounted(() => {
  if (props.editData) {
    form.value = { ...props.editData };
  }
});
</script>
