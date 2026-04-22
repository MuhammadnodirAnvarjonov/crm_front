<template>
  <form @submit.prevent="saveData" class="flex flex-col h-full">
    <!-- Form Content -->
    <div class="flex-1 overflow-y-auto px-1">
      <div class="space-y-4">
        <!-- 1. Category Type Selector (Segmented Control) -->
        <div class="bg-gray-100 p-1.5 rounded-2xl flex relative h-14">
          <BaseButton size="lg" class="w-full" :status="form.type === 'kirim' ? 'success' : ''" :disabled="loading"
            @click="form.type = 'kirim'">
            {{ $t('income') }}
          </BaseButton>
          <BaseButton size="lg" class="w-full" :status="form.type === 'chiqim' ? 'danger' : ''" :disabled="loading"
            @click="form.type = 'chiqim'">
            {{ $t('expense') }}
          </BaseButton>
        </div>
        <BaseSelect :label="$t('branch')" v-model="form.branch_id" :options="branches" label-key="name" value-key="id"
          :placeholder="$t('branch')" required :clearable="false" />

        <!-- 3. Category Hierarchy Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="flex items-end gap-2">
            <BaseSelect class="flex-1" :label="$t('kassa-parent')" v-model="form.kassa_parent_id" :options="kassaParents"
              label-key="name" value-key="id" :placeholder="$t('kassa-parent')" required
              @update:modelValue="updateKassaParent" />
            <button type="button" @click="showParentModal = true"
              class="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition mb-0.5">
              <span class="text-xl leading-none">+</span>
            </button>
          </div>

          <div class="flex items-end gap-2">
            <BaseSelect class="flex-1" :label="$t('kassa-category')" v-model="form.kassa_category_id" :options="kassaCategories"
              label-key="name" value-key="id" :placeholder="$t('kassa-category')" required
              :disabled="!form.kassa_parent_id" />
            <button type="button" @click="openCategoryModal" :disabled="!form.kassa_parent_id"
              class="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition mb-0.5 disabled:opacity-40 disabled:cursor-not-allowed">
              <span class="text-xl leading-none">+</span>
            </button>
          </div>

          <BaseSelect :label="$t('pay type')" v-model="form.pay_type_id" :options="globalStore.payTypes" :label-key="'name_' + locale"
            value-key="id" :placeholder="$t('pay type')" required />
          <BaseInputNumber :label="$t('summa')" v-model="form.summa" required :step="10000" :min="0" />
        </div>
        <BaseTextarea :label="$t('comment')" v-model="form.comment" rows="2" :placeholder="$t('optional-comment')" />
      </div>
    </div>
    <div class="flex items-center justify-end gap-3 ">
      <BaseButton status="warning" @click="$emit('close')">
        {{ $t('cancel') }}
      </BaseButton>

      <BaseButton :status="form.type === 'kirim' ? 'success' : 'danger'" :disabled="loading" @click="saveData">
        {{ $t('save') }}
      </BaseButton>
    </div>

    <!-- Kassa Parent Quick Create Modal -->
    <Transition name="fade">
      <div v-if="showParentModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-md" @click="showParentModal = false"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <button type="button" @click="showParentModal = false"
            class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          <h3 class="text-lg font-semibold mb-4">{{ $t('kassa parent') }}</h3>
          <div class="space-y-4">
            <BaseSelect :label="$t('branch')" v-model="parentForm.branch_id" :options="branches" label-key="name"
              value-key="id" :placeholder="$t('branch')" />
            <BaseInput :label="$t('name')" v-model="parentForm.name" required />
            <div class="flex justify-end gap-2">
              <BaseButton type="button" status="gray" @click="showParentModal = false">{{ $t('cancel') }}</BaseButton>
              <BaseButton type="button" status="primary" @click="saveParent">{{ $t('save') }}</BaseButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Kassa Category Quick Create Modal -->
    <Transition name="fade">
      <div v-if="showCategoryModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-md" @click="showCategoryModal = false"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <button type="button" @click="showCategoryModal = false"
            class="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          <h3 class="text-lg font-semibold mb-4">{{ $t('kassa-category') }}</h3>
          <div class="space-y-4">
            <div class="flex p-1 bg-gray-100 rounded-xl w-full">
              <button type="button" @click="categoryForm.type = 'kirim'" :class="[
                'flex-1 py-2 rounded-lg font-bold transition-all duration-200',
                categoryForm.type === 'kirim' ? 'bg-green-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'
              ]">{{ $t('income') }}</button>
              <button type="button" @click="categoryForm.type = 'chiqim'" :class="[
                'flex-1 py-2 rounded-lg font-bold transition-all duration-200',
                categoryForm.type === 'chiqim' ? 'bg-red-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'
              ]">{{ $t('expense') }}</button>
            </div>
            <BaseSelect :label="$t('branch')" v-model="categoryForm.branch_id" :options="branches" label-key="name"
              value-key="id" :placeholder="$t('branch')" required />
            <BaseSelect :label="$t('kassa-parent')" v-model="categoryForm.kassa_parent_id" :options="kassaParents"
              label-key="name" value-key="id" :placeholder="$t('kassa-parent')" required />
            <BaseInput :label="$t('name')" v-model="categoryForm.name" required :maxlength="256" />
            <BaseTextarea :label="$t('comment')" v-model="categoryForm.comment" rows="2" :placeholder="$t('optional-comment')" />
            <div class="flex justify-end gap-2">
              <BaseButton type="button" status="gray" @click="showCategoryModal = false">{{ $t('cancel') }}</BaseButton>
              <BaseButton type="button" :status="categoryForm.type === 'kirim' ? 'success' : 'danger'" @click="saveCategory">{{ $t('save') }}</BaseButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </form>
</template>

<script setup>
import { ref, defineEmits, onMounted } from "vue";
import ModelService from "@/services/kassa-order.service";
import kassaParentService from "@/services/kassa-parent.service";
import kassaCategoryService from "@/services/kassa-category.service";
import branchService from "@/services/branchs.service";
import BaseSelect from "@/components/form/BaseSelect.vue";
import BaseInput from "@/components/form/BaseInput.vue";
import BaseInputNumber from "@/components/form/BaseInputNumber.vue";
import BaseTextarea from "@/components/form/BaseTextarea.vue";
import BaseButton from "@/components/form/BaseButton.vue";
import { useUserStore } from "@/stores/user";
import { useGlobalStore } from "@/stores/global";
import { useI18n } from "vue-i18n";
const { locale } = useI18n();
const emit = defineEmits(["saved", "close"]);
const userStore = useUserStore();
const globalStore = useGlobalStore();
const loading = ref(false);
const branches = ref([]);
const kassaCategories = ref([]);
const kassaParents = ref([]);

const props = defineProps({
  editData: Object,
});

const form = ref({
  date_time: new Date().toISOString(),
  kassa_parent_id: null,
  kassa_category_id: null,
  pay_type_id: null,
  summa: 0,
  type: "kirim",
  comment: "",
  branch_id: userStore.user?.branch_id,
});

// --- Quick Create Modals ---
const showParentModal = ref(false);
const showCategoryModal = ref(false);

const parentForm = ref({
  name: "",
  branch_id: userStore.user?.branch_id,
});

const categoryForm = ref({
  name: "",
  type: "kirim",
  comment: "",
  branch_id: userStore.user?.branch_id,
  kassa_parent_id: null,
});

const saveParent = async () => {
  try {
    const res = await kassaParentService.create(parentForm.value);
    showParentModal.value = false;
    parentForm.value = { name: "", branch_id: userStore.user?.branch_id };
    await getAllKassaParents();
    if (res?.id) form.value.kassa_parent_id = res.id;
  } catch (err) {
    console.error("Kassa parent save error:", err);
  }
};

const openCategoryModal = () => {
  categoryForm.value.kassa_parent_id = form.value.kassa_parent_id;
  categoryForm.value.branch_id = form.value.branch_id;
  categoryForm.value.type = form.value.type;
  showCategoryModal.value = true;
};

const saveCategory = async () => {
  try {
    const res = await kassaCategoryService.create(categoryForm.value);
    showCategoryModal.value = false;
    categoryForm.value = { name: "", type: "kirim", comment: "", branch_id: userStore.user?.branch_id, kassa_parent_id: null };
    await getAllKassaCategories();
    if (res?.id) form.value.kassa_category_id = res.id;
  } catch (err) {
    console.error("Kassa category save error:", err);
  }
};

// --- Main Form Logic ---
const saveData = async () => {
  if (loading.value) return;
  loading.value = true;
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
  } finally {
    loading.value = false;
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

const getAllKassaCategories = async () => {
  if (!form.value.kassa_parent_id) return;
  try {
    let filter = { kassa_parent_id: form.value.kassa_parent_id, branch_id: form.value.branch_id };
    const res = await kassaCategoryService.all(filter);
    kassaCategories.value = res || [];
  } catch (err) {
    console.error("Kassa category load error:", err);
  }
};

const updateKassaParent = (id) => {
  form.value.kassa_category_id = null;
  form.value.kassa_parent_id = id;
  getAllKassaCategories();
};

onMounted(() => {
  getAllBranches();
  getAllKassaParents();
  if (props.editData) {
    form.value = {
      ...props.editData,
      type: props.editData.type !== undefined ? props.editData.type : "kirim"
    };
    if (form.value.kassa_parent_id) getAllKassaCategories();
  }
});
</script>
