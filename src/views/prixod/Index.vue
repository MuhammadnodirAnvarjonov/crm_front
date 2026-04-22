<template>
    <div class="p-4 md:p-6 bg-white rounded-3xl h-full shadow-xl border border-gray-100 flex flex-col">
        <!-- Header Section -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span>{{ $t('prixod') || 'Kirimlar' }}</span>
                <span
                    class="text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                    {{ filteredModels.length }}
                </span>
            </h2>

            <div class="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <BaseSearch v-model="searchQuery" class="w-full sm:w-auto" />
                <DatePicker v-model="dateRange" mode="daterange" @update:modelValue="getModels" class="w-full sm:w-auto" />
                <BaseSelect v-model="selectedSupplier" :options="suppliers" label-key="name"
                    value-key="id" size="sm" :placeholder="$t('supplier')" @change="getModels" class="w-full sm:w-80" />
                <div class="flex items-center gap-2 ml-auto sm:ml-0">
                    <BaseButton @click="openForm()" :label="$t('add')" status="pink">
                        <template #icon>
                            <addIcon />
                        </template>
                    </BaseButton>
                    <UpdateButton @click="getModels" />
                </div>
            </div>
        </div>

        <!-- Split Layout: Prixod List (chap) + Detail (o'ng) -->
        <div class="flex-1 min-h-0 flex flex-col md:flex-row gap-4 overflow-hidden">

            <!-- CHAP: Prixodlar ro'yxati -->
            <div class="w-full md:w-[45%] flex flex-col border border-gray-100 rounded-xl bg-gray-50/30 overflow-hidden">
                <div class="flex-1 overflow-y-auto custom-scrollbar">
                    <div v-for="(item, index) in filteredModels" :key="item.id"
                        @click="selectPrixod(item)"
                        class="px-4 py-3 border-b border-gray-100 cursor-pointer transition-all hover:bg-blue-50/60 relative"
                        :class="selectedPrixod?.id === item.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''">

                        <div class="flex items-center justify-between gap-3">
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-[10px] font-bold text-gray-400">#{{ index + 1 }}</span>
                                    <span class="text-xs font-bold text-gray-800 truncate">{{ item.supplier?.name || '-' }}</span>
                                </div>
                                <div class="flex items-center gap-3 text-[10px] text-gray-400">
                                    <span>{{ dayJS(item.date_time).format("YYYY-MM-DD HH:mm") }}</span>
                                    <span v-if="item.comment" class="italic truncate max-w-[120px]">{{ item.comment }}</span>
                                </div>
                            </div>

                            <div class="text-right shrink-0">
                                <div class="text-sm font-black text-green-700">{{ useSummaFormat(item.summa) }}</div>
                                <div class="text-[9px] text-gray-400">{{ item.user?.user_name || '' }}</div>
                            </div>

                            <div class="flex items-center gap-1 shrink-0">
                                <button type="button"
                                    class="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors"
                                    :title="$t('edit')" @click.stop="openForm(item)">
                                    <editIcon size="w-3.5 h-3.5" />
                                </button>
                                <button type="button"
                                    class="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                                    title="O'chirish" @click.stop="promptDelete(item)">
                                    <trashIcon size="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div v-if="filteredModels.length === 0" class="p-8 text-center text-gray-400 text-sm">
                        Ma'lumot topilmadi
                    </div>
                </div>
            </div>

            <!-- O'NG: Tanlangan prixod tafsilotlari -->
            <div class="w-full md:w-[55%] flex flex-col border border-gray-100 rounded-xl bg-white overflow-hidden">
                <!-- Hech narsa tanlanmagan -->
                <div v-if="!selectedPrixod" class="flex-1 flex items-center justify-center text-gray-300">
                    <div class="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p class="text-sm font-medium">Prixodni tanlang</p>
                    </div>
                </div>

                <!-- Detail loading -->
                <div v-else-if="detailLoading" class="flex-1 flex items-center justify-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>

                <!-- Detail content -->
                <template v-else-if="prixodDetail">
                    <!-- Detail Header -->
                    <div class="p-4 bg-gray-50 border-b border-gray-100 shrink-0">
                        <div class="grid grid-cols-3 gap-4">
                            <div>
                                <p class="text-[10px] font-bold text-gray-400 uppercase">{{ $t('supplier') }}</p>
                                <p class="font-bold text-gray-800 text-sm">{{ prixodDetail.supplier?.name || '-' }}</p>
                            </div>
                            <div>
                                <p class="text-[10px] font-bold text-gray-400 uppercase">{{ $t('date') }}</p>
                                <p class="font-bold text-gray-800 text-sm">{{ dayJS(prixodDetail.date_time).format("YYYY-MM-DD HH:mm") }}</p>
                            </div>
                            <div>
                                <p class="text-[10px] font-bold text-gray-400 uppercase">{{ $t('total_summa') }}</p>
                                <p class="font-extrabold text-blue-700 text-lg">{{ useSummaFormat(prixodDetail.summa) }}</p>
                            </div>
                        </div>
                        <p v-if="prixodDetail.comment" class="text-xs text-gray-500 italic mt-2">{{ prixodDetail.comment }}</p>
                    </div>

                    <!-- Detail Table -->
                    <div class="flex-1 overflow-y-auto custom-scrollbar">
                        <table class="w-full text-left">
                            <thead class="sticky top-0 bg-gray-100/90 text-gray-500 text-[10px] font-bold uppercase z-10">
                                <tr>
                                    <th class="px-3 py-2.5">#</th>
                                    <th class="px-3 py-2.5">{{ $t('product') }}</th>
                                    <th class="px-3 py-2.5 text-center">{{ $t('count') }}</th>
                                    <th class="px-3 py-2.5 text-right">{{ $t('price') }}</th>
                                    <th class="px-3 py-2.5 text-center">{{ $t('expire_date') }}</th>
                                    <th class="px-3 py-2.5 text-right">{{ $t('summa') }}</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-50">
                                <tr v-for="(row, idx) in prixodDetail.prixod_table" :key="idx"
                                    class="hover:bg-gray-50/60 transition-colors">
                                    <td class="px-3 py-2 text-xs text-gray-400">{{ idx + 1 }}</td>
                                    <td class="px-3 py-2">
                                        <p class="font-semibold text-gray-800 text-xs">{{ row.product?.name || '-' }}</p>
                                    </td>
                                    <td class="px-3 py-2 text-center text-xs font-bold text-gray-700">
                                        {{ Number(row.total_count || row.count).toLocaleString() }}
                                    </td>
                                    <td class="px-3 py-2 text-right text-xs text-gray-600">
                                        {{ useSummaFormat(row.price) }}
                                    </td>
                                    <td class="px-3 py-2 text-center text-xs">
                                        <span v-if="row.expire_date"
                                            :class="dayJS(row.expire_date).isBefore(dayJS()) ? 'text-red-500 font-bold' : 'text-gray-600'">
                                            {{ dayJS(row.expire_date).format("YYYY-MM-DD") }}
                                        </span>
                                        <span v-else class="text-gray-300">-</span>
                                    </td>
                                    <td class="px-3 py-2 text-right text-xs font-extrabold text-gray-900">
                                        {{ useSummaFormat(row.summa) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </template>
            </div>
        </div>

        <!-- Full Screen Modal for Form -->
        <Transition name="fade">
            <div v-if="showModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm">
                <div
                    class="bg-white w-full h-full md:w-[100%] md:h-[85%] md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
                    <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 class="text-xl font-bold text-gray-800">
                            {{ editData ? $t('edit') : $t('add') }} {{ $t('prixod') || 'Kirim' }}
                        </h3>
                        <button
                            class="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                            @click="closeForm">
                            <closeIcon class="w-8 h-8" />
                        </button>
                    </div>
                    <div class="flex-grow overflow-y-auto p-4 bg-gray-50/50">
                        <Form :edit-data="editData" @close="closeForm" @saved="onFormSaved" />
                    </div>
                </div>
            </div>
        </Transition>

        <ConfirmModal v-if="showConfirmModal" :show="showConfirmModal" :title="$t('delete')"
            :message="`${itemToDelete?.id}-sonli kirimni o'chirishni tasdiqlaysizmi? Bu mahsulotlar qoldig'iga ta'sir qiladi.`"
            confirm-text="Ha, o'chirish" :cancel-text="$t('cancel')" type="danger" :duration="5"
            @confirm="handleConfirmDelete" @cancel="showConfirmModal = false" />

    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from "vue";
import { useI18n } from "vue-i18n";
import Form from "./Form.vue";
import ConfirmModal from "@/components/ConfirmModal.vue";
import ModelService from "@/services/prixod.service";
import { editIcon, trashIcon, addIcon, closeIcon } from "@/components/icons/icon-temp";
import { useUserStore } from "@/stores/user";
import { useGlobalStore } from "@/stores/global";
import DatePicker from "@/components/form/DatePicker.vue";
import BaseSelect from "@/components/form/BaseSelect.vue";
import BaseSearch from "@/components/form/BaseSearch.vue";
import BaseButton from "@/components/form/BaseButton.vue";
import UpdateButton from "@/components/form/UpdateButton.vue";
import suppliersService from "@/services/suppliers.service";
import { useSummaFormat } from "@/composables/NumberFormat";

const { t } = useI18n();
const userStore = useUserStore();
const globalStore = useGlobalStore();
const dayJS = inject("dayJS");

const models = ref([]);
const searchQuery = ref("");
const selectedType = ref(null);
const suppliers = ref([]);
const selectedSupplier = ref(null);
const dateRange = ref([
    dayJS().startOf('month').valueOf(),
    dayJS().endOf('day').valueOf()
]);
const showModal = ref(false);
const showConfirmModal = ref(false);
const itemToDelete = ref(null);
const editData = ref(null);

// Detail panel
const selectedPrixod = ref(null);
const prixodDetail = ref(null);
const detailLoading = ref(false);

const getModels = async () => {
    let header = {
        branch_id: userStore.user?.branch_id,
        text: searchQuery.value || null,
        product_type: selectedType.value || null,
        supplier_id: selectedSupplier.value || null,
        from_date: dateRange.value?.[0] || null,
        to_date: dateRange.value?.[1] || null
    }
    try {
        models.value = await ModelService.all(header);
    } catch (error) {
        console.error("Prixod loading error:", error);
    }
};

const filteredModels = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return models.value;
    return models.value.filter(m =>
        m.supplier?.name?.toLowerCase().includes(q) ||
        m.user?.name?.toLowerCase().includes(q) ||
        String(m.id).includes(q)
    );
});

watch(searchQuery, () => {
    getModels();
});

const selectPrixod = async (item) => {
    if (selectedPrixod.value?.id === item.id) return;
    selectedPrixod.value = item;
    detailLoading.value = true;
    prixodDetail.value = null;
    try {
        prixodDetail.value = await ModelService.getById(item.id);
    } catch (err) {
        console.error("Detail load error:", err);
    } finally {
        detailLoading.value = false;
    }
};

const openForm = (data = null) => {
    editData.value = data;
    showModal.value = true;
};

const closeForm = () => {
    showModal.value = false;
    editData.value = null;
};

const onFormSaved = async () => {
    await getModels();
    if (selectedPrixod.value) {
        const still = models.value.find(m => m.id === selectedPrixod.value.id);
        if (still) await selectPrixod({ ...still, id: still.id, _force: Date.now() });
        else { selectedPrixod.value = null; prixodDetail.value = null; }
    }
};

const promptDelete = (item) => {
    itemToDelete.value = item;
    showConfirmModal.value = true;
};

const handleConfirmDelete = async () => {
    if (!itemToDelete.value) return;
    try {
        await ModelService.delete(itemToDelete.value.id);
        showConfirmModal.value = false;
        if (selectedPrixod.value?.id === itemToDelete.value.id) {
            selectedPrixod.value = null;
            prixodDetail.value = null;
        }
        itemToDelete.value = null;
        await getModels();
    } catch (err) {
        console.error("Delete error:", err);
        showConfirmModal.value = false;
    }
};

onMounted(async () => {
    const filter = { branch_id: userStore.user?.branch_id };
    const [, supRes] = await Promise.all([
        getModels(),
        suppliersService.all(filter)
    ]);
    suppliers.value = supRes || [];
});
</script>

<style scoped>
.animate-slideUp {
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from {
        transform: translateY(20px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
    height: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>
