<template>
  <form @submit.prevent="saveCategory" class="space-y-5">
    <h3 class="text-xl font-bold text-gray-800 border-b pb-2">
      {{ $t('kassa-category') }}
    </h3>

    <div class="grid grid-cols-1 gap-4">
      <!-- 🟢 Kirim / 🔴 Chiqim Tanlovi -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('category-type') }}
        </label>
        <div class="flex p-1 bg-gray-100 rounded-xl w-full">
          <button type="button" @click="form.type = 'kirim'" :class="[
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold transition-all duration-200',
            form.type === 'kirim'
              ? 'bg-green-600 text-white shadow-md'
              : 'text-gray-500 hover:bg-gray-200'
          ]">
            <i class="pi pi-plus-circle"></i>
            {{ $t('income') }} (Kirim)
          </button>
          <button type="button" @click="form.type = 'chiqim'" :class="[
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold transition-all duration-200',
            form.type === 'chiqim'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-gray-500 hover:bg-gray-200'
          ]">
            <i class="pi pi-minus-circle"></i>
            {{ $t('expense') }} (Chiqim)
          </button>
        </div>
      </div>

      <!-- Filial tanlash -->
      <BaseSelect :label="$t('branch')" v-model="form.branch_id" :options="branches" label-key="name" value-key="id"
        :placeholder="$t('branch')" required />
      <BaseSelect :label="$t('kassa-parent')" v-model="form.kassa_parent_id" :options="kassaParents" label-key="name"
        value-key="id" :placeholder="$t('kassa-parent')" required />
      <!-- Nomi -->
      <BaseInput :label="$t('name')" v-model="form.name" required :maxlength="256" :showCount="true"
        :placeholder="$t('enter-name')" />

      <!-- Izoh (Comment) -->
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-gray-700">{{ $t('comment') }}</label>
        <textarea v-model="form.comment"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          rows="3" :placeholder="$t('optional-comment')"></textarea>
      </div>
    </div>

    <!-- 🔹 Tugmalar -->
    <div class="flex justify-end mt-6 gap-3">
      <BaseButton type="button" status="gray" @click="$emit('close')">{{ $t('cancel') }}</BaseButton>
      <BaseButton type="submit" :status="form.type === 'kirim' ? 'success' : 'danger'">
        <i class="pi pi-save mr-2"></i>
        {{ $t('save') }}
      </BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, defineEmits, onMounted } from "vue";
import ModelService from "@/services/kassa-category.service";
import kassaParentService from "@/services/kassa-parent.service";
import branchService from "@/services/branchs.service";
import BaseSelect from "@/components/form/BaseSelect.vue";
import BaseInput from "@/components/form/BaseInput.vue";
import BaseButton from "@/components/form/BaseButton.vue";
import { useUserStore } from "@/stores/user";

const emit = defineEmits(["saved", "close"]);
const userStore = useUserStore();
const branches = ref([]);
const kassaParents = ref([]);
const props = defineProps({
  editData: Object,
});

const form = ref({
  name: "",
  type: 'kirim', 
  comment: "",
  branch_id: userStore.user?.branch_id,
});

const saveCategory = async () => {
  try {
    if (props.editData?.id) {
      await ModelService.update(props.editData.id, form.value);
    } else {
      await ModelService.create(form.value);
    }
    emit("saved");
    emit("close");
  } catch (err) {
    console.error("Kassa category save error:", err);
  }
};

const getAllBranches = async () => {
  try {
    const res = await branchService.all();
    branches.value = res || [];
  } catch (err) {
    console.error("Branch load error:", err);
  }
};

const getAllKassaParents = async () => {
  try {
    const res = await kassaParentService.all();
    kassaParents.value = res || [];
  } catch (err) {
    console.error("Kassa parent load error:", err);
  }
};

onMounted(() => {
  getAllBranches();
  getAllKassaParents();
  if (props.editData) {
    // Edit holatida ma'lumotlarni to'ldirish
    form.value = {
      ...props.editData,
      // Agar editData ichida type kelmasa default 1 qoladi
      type: props.editData.type !== undefined ? props.editData.type : 1
    };
  }
});
</script>