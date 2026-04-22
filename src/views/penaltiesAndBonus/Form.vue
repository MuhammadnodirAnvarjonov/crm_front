<template>
  <form @submit.prevent="saveItem" class="space-y-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <BaseInputNumber v-model="form.min_time" :label="$t('min_time')" :min="0" :button="false" />
      <BaseInputNumber v-model="form.max_time" :label="$t('max_time')" :min="0" :button="false" />
      <div class="sm:col-span-2">
        <BaseInputNumber v-model="form.summa" :label="$t('summa')" :step="100" :min="0" />
      </div>
      <div class="sm:col-span-2">
        <BaseInput v-model="form.description" :label="$t('description')" />
      </div>
    </div>

    <div class="flex justify-end mt-5 gap-2">
      <BaseButton type="button" status="gray" @click="$emit('close')" :label="$t('cancel')" />
      <BaseButton type="submit" status="primary" :label="$t('save')" />
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted } from "vue";
import service from "@/services/penalties_and_bonus.service";
import BaseInput from "@/components/form/BaseInput.vue";
import BaseInputNumber from "@/components/form/BaseInputNumber.vue";
import BaseButton from "@/components/form/BaseButton.vue";

const emit = defineEmits(["saved", "close"]);
const props = defineProps({ editData: Object });

const form = ref({
  min_time: 0,
  max_time: 0,
  summa: 0,
  description: "",
});

const saveItem = async () => {
  try {
    const payload = {
      min_time: form.value.min_time,
      max_time: form.value.max_time,
      summa: form.value.summa,
      description: form.value.description,
    };

    if (props.editData) {
      await service.update(props.editData.id, payload);
    } else {
      await service.create(payload);
    }

    emit("saved");
    emit("close");
  } catch (err) {
    console.error("Save error:", err);
  }
};

onMounted(() => {
  if (props.editData) {
    form.value = { ...props.editData };
  }
});
</script>
