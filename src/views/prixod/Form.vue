<template>
    <!-- Asosiy Konteyner -->
    <div class="flex flex-col md:flex-row gap-4 h-full overflow-hidden p-2 bg-gray-100">

        <!-- CHAP TOMON: Mahsulotlar Ro'yxati (Desktop: 30%, Mobile: 400px) -->
        <div
            class="w-full md:w-[23%] flex flex-col bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden shrink-0">
            <!-- Header -->
            <div class="p-3 border-b border-gray-100 bg-gray-50/80">
                <div class="flex justify-between items-center mb-3">
                    <h4 class="font-bold text-gray-800 text-sm uppercase tracking-tight">{{ $t('products') }}</h4>
                    <span class="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {{ filteredProducts.length }}
                    </span>
                </div>
                <BaseSearch v-model="searchQuery" :placeholder="$t('search')" class="mb-2" size="sm" />
                <div class="overflow-x-auto no-scrollbar">
                    <TabFilter size="sm" :model-value="selectedProductType" :items="globalStore.product_type"
                        @update:model-value="v => selectedProductType = v" />
                </div>
            </div>

            <!-- List Body -->
            <div class="flex-1 overflow-y-auto custom-scrollbar">
                <div v-for="prod in filteredProducts" :key="prod.id" @click="addToTable(prod)"
                    class="p-3 border-b border-gray-50 cursor-pointer transition-all hover:bg-blue-50 group relative"
                    :class="[isInTable(prod.id) ? 'bg-blue-50/50' : '']">

                    <div v-if="isInTable(prod.id)" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>

                    <div class="flex justify-between items-start">
                        <div class="flex-1 pr-2">
                            <div class="font-bold text-gray-800 text-xs leading-tight group-hover:text-blue-700">
                                {{ prod.name }}
                            </div>
                            <div class="flex items-center gap-2 mt-1">
                                <span v-if="prod.last_series_price" class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                    {{ useSummaFormat(prod.last_series_price) }}
                                </span>
                                <span class="text-[10px] text-gray-400 italic">{{ prod.comment || 'Izoh yo\'q' }}</span>
                            </div>
                        </div>
                        <div class="text-right shrink-0">
                            <div class="font-black text-xs"
                                :class="prod.residue > 0 ? 'text-green-600' : 'text-red-500'">
                                {{ prod.residue || 0 }}
                            </div>
                            <div class="text-[9px] text-gray-400 uppercase font-medium">Qoldiq</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- O'NG TOMON: Jadval va Forma -->
        <form @submit.prevent="savePrixod" class="flex-1 flex flex-col min-w-0 h-full space-y-3">

            <!-- Yuqori qism: Supplier va Date -->
            <div
                class="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                <BaseSelect :label="$t('supplier')" v-model="form.supplier_id" :options="suppliers" label-key="name"
                    value-key="id" required size="sm" />
                <DatePicker v-model="form.date_time" :label="$t('date')" mode="datetime" size="sm" />
                <BaseInput :label="$t('comment')" v-model="form.comment" :placeholder="$t('comment')" size="sm" />
            </div>

            <!-- Jadval qismi -->
            <div
                class="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-0">

                <!-- Desktop Table -->
                <div ref="tableRef" class="hidden md:block overflow-y-auto flex-1 custom-scrollbar" @keydown.enter.prevent="focusNextInput">
                    <table class="w-full text-left border-collapse">
                        <thead class="sticky top-0 z-20 border-b border-gray-200">
                            <tr>
                                <th rowspan="2" class="px-1 py-1.5 w-7 bg-gray-50 text-[8pt] text-gray-400 uppercase font-bold text-center align-middle border-r border-gray-200">#</th>
                                <th rowspan="2" class="px-1.5 py-1.5 bg-gray-50 text-[8pt] text-gray-400 uppercase font-bold align-middle border-r border-gray-200 min-w-[90px]">{{ $t('product') }}</th>
                                <th colspan="4" class="px-1 py-1 bg-blue-50 text-[8pt] text-blue-600 uppercase font-bold text-center border-r border-blue-200">MIQDOR</th>
                                <th colspan="3" class="px-1 py-1 bg-emerald-50 text-[8pt] text-emerald-600 uppercase font-bold text-center border-r border-emerald-200">NARX</th>
                                <th rowspan="2" class="px-1 py-1.5 bg-gray-50 text-[8pt] text-gray-400 uppercase font-bold align-middle text-center border-r border-gray-200 w-[90px]">Muddati</th>
                                <th rowspan="2" class="px-1.5 py-1.5 bg-gray-50 text-[8pt] text-gray-400 uppercase font-bold text-right align-middle w-[75px]">Summa</th>
                                <th rowspan="2" class="px-1 py-1.5 w-7 bg-gray-50"></th>
                            </tr>
                            <tr>
                                <th class="px-1 py-1 bg-blue-50/70 text-[8pt] text-blue-500 font-bold text-center border-t border-blue-100">Quti</th>
                                <th class="px-1 py-1 bg-blue-50/50 text-[8pt] text-blue-400 font-bold text-center border-t border-blue-100">Blok</th>
                                <th class="px-1 py-1 bg-blue-50/30 text-[8pt] text-blue-400 font-bold text-center border-t border-blue-100">Dona</th>
                                <th class="px-1 py-1 bg-gray-50 text-[8pt] text-gray-400 font-bold text-center border-t border-r border-gray-200 w-[50px]">Jami</th>
                                <th class="px-1 py-1 bg-emerald-50/70 text-[8pt] text-emerald-600 font-bold text-center border-t border-emerald-100">Dona</th>
                                <th class="px-1 py-1 bg-emerald-50/40 text-[8pt] text-emerald-500 font-bold text-center border-t border-emerald-100">Blok</th>
                                <th class="px-1 py-1 bg-emerald-50/20 text-[8pt] text-emerald-400 font-bold text-center border-t border-r border-emerald-100">Quti</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 bg-white">
                            <tr v-for="(item, index) in form.prixod_table" :key="item.product_id"
                                class="hover:bg-gray-50/60 transition-colors">
                                <td class="px-1 py-1 text-[10px] text-gray-400 text-center border-r border-gray-100">{{ index + 1 }}</td>
                                <td class="px-1.5 py-1 border-r border-gray-100">
                                    <div class="font-bold text-gray-800 text-[11px] leading-tight truncate">{{ getProductName(item.product_id) }}</div>
                                </td>

                                <td class="px-0.5 py-1 bg-blue-50/20">
                                    <BaseInputNumber :button="false" v-model="item.box_count" @change="val => onCountChange(item, 'box', val)" :min="0" size="sm" />
                                </td>
                                <td class="px-0.5 py-1 bg-blue-50/10">
                                    <BaseInputNumber :button="false" v-model="item.disc_count" @change="val => onCountChange(item, 'disc', val)" :min="0" size="sm" />
                                </td>
                                <td class="px-0.5 py-1 bg-blue-50/5">
                                    <BaseInputNumber :button="false" v-model="item.count" @change="val => onCountChange(item, 'count', val)" :min="0" size="sm" />
                                </td>
                                <td class="px-1 py-1 text-center border-r border-gray-100">
                                    <span class="text-[11px] font-bold text-gray-600">{{ item.total_count > 0 ? item.total_count.toLocaleString() : '—' }}</span>
                                </td>

                                <td class="px-0.5 py-1 bg-emerald-50/20">
                                    <BaseInputNumber :button="false" v-model="item.price" @change="val => onPriceChange(item, 'price', val)" :min="0" :step="100" size="sm" />
                                </td>
                                <td class="px-0.5 py-1 bg-emerald-50/10">
                                    <BaseInputNumber :button="false" v-model="item.disc_price" @change="val => onPriceChange(item, 'disc', val)" :min="0" :step="1000" size="sm" />
                                </td>
                                <td class="px-0.5 py-1 bg-emerald-50/5 border-r border-gray-100">
                                    <BaseInputNumber :button="false" v-model="item.box_price" @change="val => onPriceChange(item, 'box', val)" :min="0" :step="10000" size="sm" />
                                </td>

                                <td class="px-0.5 py-1 text-center border-r border-gray-100">
                                    <input type="date" v-model="item.expire_date"
                                        class="text-[9px] text-orange-500 border border-orange-100 rounded px-1 py-0.5 bg-orange-50 w-full" />
                                </td>

                                <td class="px-1.5 py-1 text-right">
                                    <div class="text-[11px] font-black text-gray-900">{{ useSummaFormat(calcSumma(item)) }}</div>
                                </td>

                                <td class="px-0.5 py-1 text-center">
                                    <button type="button" @click="removeRow(index)"
                                        class="text-red-300 hover:text-red-500 transition-colors p-0.5 rounded hover:bg-red-50">
                                        <trashIcon size="w-3.5 h-3.5" />
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Mobile Card View -->
                <div class="md:hidden flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50 custom-scrollbar">
                    <div v-for="(item, index) in form.prixod_table" :key="item.product_id"
                        class="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <span class="text-[9px] font-bold text-blue-600">#{{ index + 1 }}</span>
                                <h4 class="font-bold text-xs text-gray-800">{{ getProductName(item.product_id) }}</h4>
                            </div>
                            <button type="button" @click="removeRow(index)" class="text-red-400 p-1">
                                <trashIcon size="w-4 h-4" />
                            </button>
                        </div>

                        <!-- MIQDOR -->
                        <div class="bg-blue-50/40 rounded-lg p-2 space-y-2">
                            <div class="text-[8px] font-bold text-blue-500 uppercase tracking-widest">Miqdor</div>
                            <div class="grid grid-cols-3 gap-2">
                                <div>
                                    <div class="text-[8px] text-gray-400 mb-0.5">Quti soni</div>
                                    <BaseInputNumber  v-model="item.box_count" @change="val => onCountChange(item, 'box', val)" :min="0" size="sm" />
                                </div>
                                <div>
                                    <div class="text-[8px] text-gray-400 mb-0.5">Blok/Quti</div>
                                    <BaseInputNumber  v-model="item.disc_count" @change="val => onCountChange(item, 'disc', val)" :min="0" size="sm" />
                                </div>
                                <div>
                                    <div class="text-[8px] text-gray-400 mb-0.5">Dona/Blok</div>
                                    <BaseInputNumber  v-model="item.count" @change="val => onCountChange(item, 'count', val)" :min="0" size="sm" />
                                </div>
                            </div>
                            <div class="text-[10px] text-gray-500">Jami dona: <span class="font-bold text-gray-700">{{ item.total_count > 0 ? item.total_count.toLocaleString() : '—' }}</span></div>
                        </div>

                        <!-- NARX -->
                        <div class="bg-emerald-50/40 rounded-lg p-2 space-y-2">
                            <div class="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">Narx</div>
                            <div class="grid grid-cols-3 gap-2">
                                <div>
                                    <div class="text-[8px] text-gray-400 mb-0.5">Dona narxi</div>
                                    <BaseInputNumber v-model="item.price" @change="val => onPriceChange(item, 'price', val)" :min="0" :step="100" size="sm" />
                                </div>
                                <div>
                                    <div class="text-[8px] text-emerald-500 mb-0.5">Blok narxi</div>
                                    <BaseInputNumber v-model="item.disc_price" @change="val => onPriceChange(item, 'disc', val)" :min="0" :step="1000" size="sm" />
                                </div>
                                <div>
                                    <div class="text-[8px] text-emerald-400 mb-0.5">Quti narxi</div>
                                    <BaseInputNumber v-model="item.box_price" @change="val => onPriceChange(item, 'box', val)" :min="0" :step="10000" size="sm" />
                                </div>
                            </div>
                        </div>

                        <div class="mt-2 pt-2 border-t flex justify-between items-center">
                            <input type="date" v-model="item.expire_date"
                                class="text-[9px] text-orange-500 border border-orange-100 rounded px-1 py-0.5 bg-orange-50" />
                            <span class="text-blue-600 font-black text-sm">{{ useSummaFormat(calcSumma(item)) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Footer Summary -->
                <div class="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
                    <div>
                        <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ $t('total_summa')
                            }}</div>
                        <div class="text-xl font-black text-blue-600 tracking-tight">
                            {{ useSummaFormat(totalSumma) }}
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <BaseButton :label="$t('cancel')" status="gray" @click="$emit('close')" type="button" class="!rounded-xl"></BaseButton>
                        <BaseButton type="submit" :disabled="form.prixod_table.length === 0"
                            class="!rounded-xl !px-8 shadow-lg shadow-blue-200" :label="$t('save')">  </BaseButton>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from "vue";
import ModelService from "@/services/prixod.service";
import productsService from "@/services/products.service";
import suppliersService from "@/services/suppliers.service";
import BaseSelect from "@/components/form/BaseSelect.vue";
import { trashIcon } from "@/components/icons/icon-temp";
import { useUserStore } from "@/stores/user";
import { useGlobalStore } from "@/stores/global";
import TabFilter from "@/components/TabFilter.vue";
import BaseSearch from "@/components/form/BaseSearch.vue";
import BaseButton from "@/components/form/BaseButton.vue";
import DatePicker from "@/components/form/DatePicker.vue";
import { useSummaFormat } from "@/composables/NumberFormat";
import BaseInput from "@/components/form/BaseInput.vue";
import seriesService from "@/services/series.service";
import BaseInputNumber from "@/components/form/BaseInputNumber.vue";

const emit = defineEmits(["saved", "close"]);
const userStore = useUserStore();
const globalStore = useGlobalStore();
const dayJS = inject("dayJS");

const props = defineProps({ editData: Object });
const selectedProductType = ref(null);
const suppliers = ref([]);
const products = ref([]);
const searchQuery = ref("");
const tableRef = ref(null);

const focusNextInput = (e) => {
    if (!tableRef.value) return;
    const inputs = tableRef.value.querySelectorAll('input');
    const arr = Array.from(inputs);
    const idx = arr.indexOf(e.target);
    if (idx >= 0 && idx < arr.length - 1) {
        arr[idx + 1].focus();
        arr[idx + 1].select();
    }
};

const form = ref({
    branch_id: userStore.user?.branch_id,
    supplier_id: null,
    user_id: userStore.user?.id,
    date_time: dayJS().format("YYYY-MM-DDTHH:mm"),
    summa: 0,
    comment: "",
    prixod_table: []
});

const filteredProducts = computed(() => {
    let list = products.value;
    if (selectedProductType.value) list = list.filter(p => p.product_type === selectedProductType.value);
    if (!searchQuery.value) return list;
    const q = searchQuery.value.toLowerCase();
    return list.filter(p => p.name.toLowerCase().includes(q) || (p.comment && p.comment.toLowerCase().includes(q)));
});

const totalSumma = computed(() => {
    return form.value.prixod_table.reduce((sum, item) => sum + calcSumma(item), 0);
});

const isInTable = (id) => form.value.prixod_table.some(item => item.product_id === id);
const getProductName = (id) => products.value.find(p => p.id === id)?.name || '...';

const addToTable = async (product) => {
    const existingItem = form.value.prixod_table.find(item => item.product_id === product.id);
    if (existingItem) {
        existingItem.box_count = Number(existingItem.box_count || 0) + 1;
        recalculate(existingItem);
    } else {
        let lastPrice = Number(product.price) || 0;
        try {
            const res = await seriesService.lastPrice(product.id, userStore.user?.branch_id);
            if (res?.price != null) lastPrice = Number(res.price);
        } catch (e) { /* fallback to product.price */ }

        const newItem = {
            product_id: product.id,
            box_count: 1,
            disc_count: 1,
            count: 1,
            box_price: 0,
            disc_price: 0,
            price: lastPrice,
            total_count: 0,
            expire_date: null
        };
        form.value.prixod_table.unshift(newItem);
        recalculate(newItem);
    }
};

// Soni o'zgarganda narx zanjiri qayta hisoblanadi
// disc_count = blok/quti (nisbat), count = dona/blok (nisbat)
const onCountChange = (item, source, newVal) => {
    if (source === 'box') {
        item.box_count = Number(newVal) || 0;
        // box_count o'zgarsa faqat summa o'zgaradi, narxlar o'zgarmaydi
    } else if (source === 'disc') {
        item.disc_count = Number(newVal) || 0;
        // disc_count (nisbat) o'zgarsa → box_price = disc_count × disc_price
        const dc = item.disc_count;
        const dp = Number(item.disc_price) || 0;
        if (dc > 0 && dp > 0) item.box_price = parseFloat((dc * dp).toFixed(2));
    } else if (source === 'count') {
        item.count = Number(newVal) || 0;
        // count (nisbat) o'zgarsa → disc_price = count × price → box_price = disc_count × disc_price
        const c  = item.count;
        const p  = Number(item.price) || 0;
        const dc = Number(item.disc_count) || 0;
        if (c > 0 && p > 0) {
            item.disc_price = parseFloat((c * p).toFixed(2));
            if (dc > 0) item.box_price = parseFloat((dc * item.disc_price).toFixed(2));
        }
    }
    recalculate(item);
};

// Narx zanjiri (pastdan yuqoriga):
//   price → disc_price = count × price → box_price = disc_count × disc_price
const onPriceChange = (item, source, newVal) => {
    const dc = Number(item.disc_count) || 0;
    const c  = Number(item.count) || 0;

    if (source === 'price') {
        item.price = Number(newVal) || 0;
        const p = item.price;
        if (c > 0) {
            item.disc_price = parseFloat((c * p).toFixed(2));
            if (dc > 0) item.box_price = parseFloat((dc * item.disc_price).toFixed(2));
        }
    } else if (source === 'disc') {
        item.disc_price = Number(newVal) || 0;
        const dp = item.disc_price;
        // Pastga: price = disc_price / count
        if (c > 0) item.price = parseFloat((dp / c).toFixed(2));
        // Yuqoriga: box_price = disc_count × disc_price
        if (dc > 0) item.box_price = parseFloat((dc * dp).toFixed(2));
    } else if (source === 'box') {
        item.box_price = Number(newVal) || 0;
        const bp = item.box_price;
        // Pastga: disc_price = box_price / disc_count → price = disc_price / count
        if (dc > 0) {
            item.disc_price = parseFloat((bp / dc).toFixed(2));
            if (c > 0) item.price = parseFloat((item.disc_price / c).toFixed(2));
        }
    }
    recalculate(item);
};

// total_count = quti × blok/quti × dona/blok
const recalculate = (item) => {
    const bc = Number(item.box_count)  || 0;
    const dc = Number(item.disc_count) || 0;
    const c  = Number(item.count)      || 0;

    item.total_count = bc * dc * c;
};

// summa = quti soni × quti narxi (yoki pastroq darajadan fallback)
const calcSumma = (item) => {
    const bc = Number(item.box_count)  || 0;
    const dc = Number(item.disc_count) || 0;
    const c  = Number(item.count)      || 0;
    const bp = Number(item.box_price)  || 0;
    const dp = Number(item.disc_price) || 0;
    const p  = Number(item.price)      || 0;

    if (bp > 0)      return Math.round(bc * bp);
    else if (dp > 0) return Math.round(bc * dc * dp);
    else             return Math.round(bc * dc * c * p);
};

const removeRow = (index) => form.value.prixod_table.splice(index, 1);

const savePrixod = async () => {
    if (form.value.prixod_table.length === 0) return;
    if (!form.value.supplier_id) {
        alert("Iltimos, yetkazib beruvchini tanlang!");
        return;
    }
    form.value.prixod_table.forEach(item => {
        item.summa = calcSumma(item);
        item.total_count = (Number(item.box_count) || 0) * (Number(item.disc_count) || 0) * (Number(item.count) || 0);
    });
    form.value.summa = totalSumma.value;
    try {
        if (props.editData) await ModelService.update(props.editData.id, form.value);
        else await ModelService.create(form.value);
        emit("saved");
        emit("close");
    } catch (err) { console.error(err); }
};

const loadInitialData = async () => {
    try {
        const filter = { branch_id: userStore.user?.branch_id };
        const [supRes, prodRes] = await Promise.all([suppliersService.all(filter), productsService.all(filter)]);
        suppliers.value = supRes || [];
        products.value = prodRes || [];
    } catch (err) { console.error(err); }
};

onMounted(async () => {
    await loadInitialData();
    if (props.editData) {
        const res = await ModelService.getById(props.editData.id);
        if (res) {
            const table = (res.prixod_table || []).map(item => {
                const bc = Number(item.box_count) || 0;
                const dc = Number(item.disc_count) || 0;
                const c  = Number(item.count) || 0;
                return { ...item, total_count: item.total_count || (bc * dc * c) };
            });
            form.value = {
                ...res,
                date_time: dayJS(res.date_time).format("YYYY-MM-DDTHH:mm"),
                prixod_table: table
            };
        }
    }
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
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