<template>
    <form @submit.prevent="saveProduct" class="space-y-4">
        <div class="grid grid-cols-1 gap-4">
            <BaseSelect :label="$t('branch')" v-model="form.branch_id" :options="branches" label-key="name"
                value-key="id" :placeholder="$t('branch')" />
            <BaseInput :label="$t('name')" v-model="form.name" required />

            <BaseSelect :label="$t('type')" v-model="form.product_type" :options="product_type" label-key="name"
                value-key="id" :placeholder="$t('type')" />

            <BaseInputNumber :label="$t('residue')" v-model="form.residue" type="number" :step="1" />

            <BaseTextarea :label="$t('comment')" v-model="form.comment" />
        </div>

        <!-- Tugmalar -->
        <div class="flex justify-end mt-5 gap-2">
            <BaseButton type="button" status="gray" @click="$emit('close')">
                {{ $t('cancel') }}
            </BaseButton>

            <BaseButton type="submit" status="primary">
                {{ $t('save') }}
            </BaseButton>
        </div>
    </form>
</template>

<script setup>
import { ref, defineEmits, onMounted } from "vue";
import ModelService from "@/services/products.service";
import branchService from "@/services/branchs.service";
import BaseInput from "@/components/form/BaseInput.vue";
import BaseSelect from "@/components/form/BaseSelect.vue";
import BaseTextarea from "@/components/form/BaseTextarea.vue";
import BaseButton from "@/components/form/BaseButton.vue";
import { useUserStore } from "@/stores/user";
import { useGlobalStore } from "@/stores/global";
import BaseInputNumber from "@/components/form/BaseInputNumber.vue";

const emit = defineEmits(["saved", "close"]);
const branches = ref([]);
const userStore = useUserStore();
const globalStore = useGlobalStore();
const product_type = globalStore.product_type;
const props = defineProps({
    editData: Object
});

const form = ref({
    name: "",
    branch_id: userStore.user?.branch_id,
    product_type: "pill",
    comment: "",
    residue: 0,
});

const saveProduct = async () => {
    try {
        if (props.editData) {
            await ModelService.update(props.editData.id, form.value);
        } else {
            await ModelService.create(form.value);
        }

        emit("saved");
        emit("close");
    } catch (err) {
        console.error("Product save error:", err);
    }
};

const getAllBranches = async () => {
    try {
        const res = await branchService.all();
        branches.value = res || [];
    } catch (err) {
        console.error("Branch load error:", err);
    }
}

onMounted(() => {
    getAllBranches();
    if (props.editData) {
        form.value = { ...props.editData };
    }
});
</script>
