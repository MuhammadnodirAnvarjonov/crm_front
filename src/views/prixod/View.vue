<template>
    <div v-if="loading" class="p-12 flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
    <div v-else-if="model" class="space-y-6">
        <!-- Header Info -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div>
                <p class="text-xs font-bold text-gray-400 uppercase mb-1">{{ $t('supplier') }}</p>
                <p class="font-bold text-gray-800 text-lg">{{ model.supplier?.name || '-' }}</p>
            </div>
            <div>
                <p class="text-xs font-bold text-gray-400 uppercase mb-1">{{ $t('date') }}</p>
                <p class="font-bold text-gray-800 text-lg">{{ dayJS(model.date_time).format("YYYY-MM-DD HH:mm") }}</p>
            </div>
            <div>
                <p class="text-xs font-bold text-gray-400 uppercase mb-1">{{ $t('total_summa') }}</p>
                <p class="font-extrabold text-blue-700 text-2xl">{{ Number(model.summa).toLocaleString() }}</p>
            </div>
            <div v-if="model.comment" class="md:col-span-3">
                <p class="text-xs font-bold text-gray-400 uppercase mb-1">{{ $t('comment') }}</p>
                <p class="text-gray-600 italic">{{ model.comment }}</p>
            </div>
        </div>

        <!-- Table Info -->
        <div class="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <table class="w-full text-left">
                <thead class="bg-gray-100/50 text-gray-500 text-xs font-bold uppercase">
                    <tr>
                        <th class="px-4 py-3">#</th>
                        <th class="px-4 py-3">{{ $t('product') }}</th>
                        <th class="px-4 py-3 text-center">{{ $t('count') }}</th>
                        <th class="px-4 py-3 text-right">{{ $t('price') }}</th>
                        <th class="px-4 py-3 text-center">{{ $t('expire_date') }}</th>
                        <th class="px-4 py-3 text-right">{{ $t('summa') }}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-for="(item, index) in model.prixod_table" :key="index"
                        class="hover:bg-gray-50 transition-colors">
                        <td class="px-4 py-3 text-sm text-gray-400">{{ index + 1 }}</td>
                        <td class="px-4 py-3">
                            <p class="font-semibold text-gray-800">{{ item.product?.name || '-' }}</p>
                            <p class="text-[10px] text-gray-400">{{ item.product?.product_type || '-' }}</p>
                        </td>
                        <td class="px-4 py-3 text-center font-bold text-gray-700">
                            {{ Number(item.count).toLocaleString() }}
                        </td>
                        <td class="px-4 py-3 text-right">
                            {{ Number(item.price).toLocaleString() }}
                        </td>
                        <td class="px-4 py-3 text-center text-sm">
                            <span v-if="item.expire_date"
                                :class="isExpired(item.expire_date) ? 'text-red-500 font-bold' : 'text-gray-600'">
                                {{ dayJS(item.expire_date).format("YYYY-MM-DD") }}
                            </span>
                            <span v-else>-</span>
                        </td>
                        <td class="px-4 py-3 text-right font-extrabold text-gray-900">
                            {{ Number(item.summa).toLocaleString() }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Footer Meta -->
        <div class="flex justify-between items-center text-[10px] text-gray-400 px-2">
            <p>{{ $t('created_at') }}: {{ dayJS(model.createdAt).format("YYYY-MM-DD HH:mm") }}</p>
            <p>{{ $t('updated_at') }}: {{ dayJS(model.updatedAt).format("YYYY-MM-DD HH:mm") }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, inject } from "vue";
import ModelService from "@/services/prixod.service";

const props = defineProps({
    modelId: {
        type: Number,
        required: true
    }
});

const dayJS = inject("dayJS");
const model = ref(null);
const loading = ref(true);

const isExpired = (date) => {
    return dayJS(date).isBefore(dayJS());
};

onMounted(async () => {
    try {
        model.value = await ModelService.getById(props.modelId);
    } catch (err) {
        console.error("Load view data error:", err);
    } finally {
        loading.value = false;
    }
});
</script>
