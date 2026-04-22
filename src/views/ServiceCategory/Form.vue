<template>
  <form @submit.prevent="saveBranch" class="space-y-4">
    <h3 class="text-lg font-semibold mb-2">
      {{ $t('service-category') }}
    </h3>

    <div class="grid grid-cols-1  gap-4">
      <BaseSelect :label="$t('branch')" v-model="form.branch_id" :options="branches" label-key="name" value-key="id"
        :placeholder="$t('branch')" required />
      <BaseInput :label="$t('name')" v-model="form.name" required :maxlength="256" :showCount="true" />
    </div>
    <ImageUpload :label="$t('image')" v-model="form.image" />

    <!-- 🔹 Tugmalar -->
    <div class="flex justify-end mt-5 gap-2">
      <BaseButton type="button" status="gray" @click="$emit('close')">{{ $t('cancel') }}</BaseButton>
      <BaseButton type="submit" status="primary">{{ $t('save') }}</BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, defineEmits, onMounted } from "vue";
import ModelService from "@/services/service-category.service";
import branchService from "@/services/branchs.service";
import uploadService from "@/services/upload.service";
import BaseSelect from "@/components/form/BaseSelect.vue";
import ImageUpload from "@/components/form/ImageUpload.vue";
import BaseInput from "@/components/form/BaseInput.vue";
import BaseButton from "@/components/form/BaseButton.vue";
import { useUserStore } from "@/stores/user"
const emit = defineEmits(["saved", "close"]);
const branches = ref([]);

const userStore = useUserStore();
const props = defineProps({
  editData: Object,
});


const form = ref({
  name: "",
  image: "",
  branch_id: userStore.user?.branch_id,
});

const saveBranch = async () => {
  try {

    if (props.editData) {
      await ModelService.update(props.editData.id, form.value);
    } else {
      await ModelService.create(form.value);
    }

    emit("saved");
    emit("close");
  } catch (err) {
    console.error("Role save error:", err);
  }
};
const getAllBranches = async () => {
  try {
    const res = await branchService.all(); // API: /branch
    branches.value = res || [];
  } catch (err) {
    console.error("Branch load error:", err);
  }
}

onMounted(() => {
  getAllBranches();
  if (props.editData) {
    form.value = props.editData;
  }
})
</script>
