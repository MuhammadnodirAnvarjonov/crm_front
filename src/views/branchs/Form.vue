<template>
  <form @submit.prevent="saveBranch" class="space-y-4">
    <h3 class="text-lg font-semibold mb-2">
      {{ $t('branch') }}
    </h3>

    <div class="grid grid-cols-1  gap-4">
      <!-- 🔹 Rol nomi -->
      <div class="sm:col-span-2 md:col-span-1">
        <BaseInput v-model="form.name" :label="$t('name')" required />
      </div>

      <!-- 🔹 Izoh -->
      <div class="sm:col-span-2 md:col-span-1">
        <BaseInput v-model="form.comment" :label="$t('comment')" />
      </div>
    </div>

    <!-- 🔹 Tugmalar -->
    <div class="flex justify-end mt-5 gap-2">
      <BaseButton type="button" status="gray" @click="$emit('close')" :label="$t('cancel')" />
      <BaseButton type="submit" status="primary" :label="$t('save')" />
    </div>
  </form>
</template>

<script setup>
import { ref, defineEmits, onMounted } from "vue";
import branchservice from "@/services/branchs.service";
import BaseInput from "@/components/form/BaseInput.vue";
import BaseButton from "@/components/form/BaseButton.vue";

const emit = defineEmits(["saved", "close"]);

const props = defineProps({
  editData: Object,
});


const form = ref({
  name: "",
  comment: "",
});

const saveBranch = async () => {
  try {
    const payload = {
      name: form.value.name,
      comment: form.value.comment,
    };

    if (props.editData) {

      await branchservice.update(props.editData.id, payload);
    } else {
      await branchservice.create(payload);
    }

    emit("saved");
    emit("close");
  } catch (err) {
    console.error("Role save error:", err);
  }
};
onMounted(() => {
  if (props.editData) {
    form.value = props.editData;
  }
})
</script>
