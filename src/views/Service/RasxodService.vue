<template>
  <div class="flex flex-col md:flex-row gap-3 h-full overflow-hidden">

    <!-- CHAP TOMON: Maxsulotlar ro'yxati -->
    <div class="w-full md:w-[350px] flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden shrink-0 md:self-start md:max-h-full"
      :class="mobileTab === 'products' ? 'flex' : 'hidden md:flex'">
      <!-- Header -->
      <div class="p-2 border-b border-gray-100 bg-gray-50/80">
        <div class="flex justify-between items-center mb-1.5">
          <h4 class="font-bold text-gray-800 text-[11px] uppercase tracking-tight">{{ $t('products') }}</h4>
          <span class="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
            {{ filteredProducts.length }}
          </span>
        </div>
        <BaseSearch v-model="searchQuery" class="w:[100%]" :placeholder="$t('search')" size="sm" />
      </div>

      <!-- List -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <div v-for="prod in filteredProducts" :key="prod.id" @click="addProduct(prod)"
          class="px-2.5 py-2 border-b border-gray-50 cursor-pointer transition-all hover:bg-blue-50 group relative"
          :class="[isInTable(prod.id) ? 'bg-blue-50/50' : '']">
          <div v-if="isInTable(prod.id)" class="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-600"></div>
          <div class="font-semibold text-gray-800 text-[11px] leading-tight group-hover:text-blue-700 truncate">
            {{ prod.name }}
          </div>
          <div v-if="prod.comment" class="text-[9px] text-gray-400 truncate mt-0.5">{{ prod.comment }}</div>
        </div>
        <div v-if="filteredProducts.length === 0" class="p-4 text-center text-gray-400 text-xs">
          {{ $t('no data') }}
        </div>
      </div>
    </div>

    <!-- O'NG TOMON: Rasxod jadvali -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden"
      :class="mobileTab === 'table' ? 'flex' : 'hidden md:flex'">

      <!-- Mobile Tab Switcher -->
      <div class="md:hidden flex border-b border-gray-200 mb-2">
        <button type="button" @click="mobileTab = 'products'"
          class="flex-1 py-2 text-xs font-bold uppercase text-center transition"
          :class="mobileTab === 'products' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'">
          {{ $t('products') }}
        </button>
        <button type="button" @click="mobileTab = 'table'"
          class="flex-1 py-2 text-xs font-bold uppercase text-center transition"
          :class="mobileTab === 'table' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'">
          {{ $t('rasxod') }}
          <span v-if="service.rasxod_services?.length" class="ml-1 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
            {{ service.rasxod_services.length }}
          </span>
        </button>
      </div>

      <!-- Desktop Table -->
      <div class="hidden md:flex flex-1 overflow-auto custom-scrollbar items-start">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th class="px-1.5 py-1.5 text-left text-[9px] font-bold text-gray-500 uppercase w-[30px]">#</th>
              <th class="px-1.5 py-1.5 text-left text-[9px] font-bold text-gray-500 uppercase min-w-[120px]">{{ $t('product') }}</th>
              <th class="px-1.5 py-1.5 text-left text-[9px] font-bold text-gray-500 uppercase min-w-[140px]">{{ $t('child') }}</th>
              <th class="px-1.5 py-1.5 text-left text-[9px] font-bold text-gray-500 uppercase w-[80px]">{{ $t('count') }}</th>
              <th class="px-1.5 py-1.5 text-left text-[9px] font-bold text-gray-500 uppercase w-[80px]">{{ $t('disc_count') }}</th>
              <th class="px-1.5 py-1.5 text-center text-[9px] font-bold text-gray-500 uppercase w-[50px]">1/N</th>
              <th class="px-1.5 py-1.5 text-left text-[9px] font-bold text-gray-500 uppercase min-w-[100px]">{{ $t('comment') }}</th>
              <th class="px-1 py-1.5 w-[30px]"></th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-for="(item, index) in service.rasxod_services" :key="index" class="hover:bg-gray-50/60 transition">
              <td class="px-1.5 py-1 text-[10px] text-gray-400 text-center">{{ index + 1 }}</td>
              <td class="px-1.5 py-1">
                <div class="font-semibold text-gray-800 text-[11px] leading-tight truncate max-w-[140px]">
                  {{ getProductName(item.product_id) }}
                </div>
              </td>
              <td class="px-1 py-1">
                <BaseSelect v-model="item.key" :options="childOptions" label-key="name" value-key="key" size="sm" />
              </td>
              <td class="px-0.5 py-1">
                <BaseInputNumber v-model="item.count" :button="false" :step="0.1" :min="0" size="sm" />
              </td>
              <td class="px-0.5 py-1">
                <BaseInputNumber v-model="item.disc_count" :button="false" :step="0.1" :min="0" size="sm" />
              </td>
              <td class="px-1 py-1 text-center">
                <input type="checkbox" v-model="item.one_for_many"
                  class="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
              </td>
              <td class="px-1 py-1">
                <input type="text" v-model="item.comment"
                  class="w-full border-gray-300 rounded text-[11px] focus:ring-blue-500 focus:border-blue-500 px-1.5 py-0.5 border"
                  :placeholder="$t('comment')" />
              </td>
              <td class="px-0.5 py-1 text-center">
                <button type="button" @click="removeRow(index)"
                  class="text-red-300 hover:text-red-500 transition p-0.5 rounded hover:bg-red-50">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clip-rule="evenodd" />
                  </svg>
                </button>
              </td>
            </tr>
            <tr v-if="!service.rasxod_services || service.rasxod_services.length === 0">
              <td colspan="8" class="px-4 py-6 text-center text-gray-400 text-xs">
                {{ $t('no data') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View -->
      <div class="md:hidden flex-1 overflow-y-auto custom-scrollbar space-y-2 px-1">
        <div v-for="(item, index) in service.rasxod_services" :key="index"
          class="bg-white rounded-lg border border-gray-200 shadow-sm p-2.5">
          <!-- Header: product name + delete -->
          <div class="flex justify-between items-start mb-2">
            <div>
              <span class="text-[9px] font-bold text-blue-600">#{{ index + 1 }}</span>
              <h4 class="font-bold text-xs text-gray-800 leading-tight">{{ getProductName(item.product_id) }}</h4>
            </div>
            <button type="button" @click="removeRow(index)" class="text-red-400 hover:text-red-600 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <!-- Fields -->
          <div class="space-y-2">
            <BaseSelect v-model="item.key" :options="childOptions" label-key="name" value-key="key" size="sm" :label="$t('child')" />
            <div class="grid grid-cols-2 gap-2">
              <BaseInputNumber v-model="item.count" :button="false" :step="0.1" :min="0" size="sm" :label="$t('count')" />
              <BaseInputNumber v-model="item.disc_count" :button="false" :step="0.1" :min="0" size="sm" :label="$t('disc_count')" />
            </div>
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" v-model="item.one_for_many"
                  class="w-3.5 h-3.5 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
                <span class="text-gray-600 text-[11px]">{{ $t('one_for_many') }}</span>
              </label>
            </div>
            <input type="text" v-model="item.comment"
              class="w-full border-gray-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500 px-2 py-1.5 border"
              :placeholder="$t('comment')" />
          </div>
        </div>
        <div v-if="!service.rasxod_services || service.rasxod_services.length === 0"
          class="py-8 text-center text-gray-400 text-xs">
          {{ $t('no data') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import BaseSelect from "@/components/form/BaseSelect.vue";
import BaseInputNumber from "@/components/form/BaseInputNumber.vue";
import BaseSearch from "@/components/form/BaseSearch.vue";
import productsService from "@/services/products.service";
import { generateRandomString } from "@/composables/RandomGenerator";

const props = defineProps({
  service: {
    type: Object,
    required: true
  }
});

const products = ref([]);
const searchQuery = ref("");
const mobileTab = ref("products");

const childOptions = computed(() => {
  return (props.service.childs || []).filter(c => c.name);
});

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value;
  const q = searchQuery.value.toLowerCase();
  return products.value.filter(p =>
    p.name.toLowerCase().includes(q) || (p.comment && p.comment.toLowerCase().includes(q))
  );
});

const isInTable = (productId) => {
  return (props.service.rasxod_services || []).some(r => r.product_id === productId);
};

const getProductName = (productId) => {
  return products.value.find(p => p.id === productId)?.name || '...';
};

const addProduct = (product) => {
  if (!props.service.rasxod_services) {
    props.service.rasxod_services = [];
  }
  // Agar childs bo'sh bo'lsa, avtomatik bitta child yaratib qo'y
  if (!props.service.childs || props.service.childs.length === 0) {
    props.service.childs = [{
      name: props.service.name || '',
      key: `${new Date().getTime()}_${generateRandomString(4)}`,
      norm: [
          {
          value: "",
          colspan: 1,
          hidden: false,
          status: "black",
          disabled: false
        },
        {
          value: "",
          colspan: 1,
          hidden: false,
          status: "black",
          disabled: false
        }
      ],
      price: 0,
      citizen_price: 0,
      stationar_price: 0,
    }];
  }
  props.service.rasxod_services.push({
    product_id: product.id,
    key: null,
    count: 1,
    disc_count: 1,
    one_for_many: false,
    doc_type: "service",
    comment: ""
  });
  mobileTab.value = "table";
};

const removeRow = (index) => {
  props.service.rasxod_services.splice(index, 1);
};

const fetchProducts = async () => {
  try {
    const res = await productsService.all({});
    products.value = res.data || res || [];
  } catch (err) {
    console.error("Error loading products:", err);
  }
};

onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
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
