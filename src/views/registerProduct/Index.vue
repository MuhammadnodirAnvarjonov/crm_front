<template>
  <div class="p-4 md:p-6 bg-white rounded-3xl h-full shadow-xl border border-gray-100 flex flex-col gap-4">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h2 class="text-2xl font-bold text-gray-800">{{ $t('register_product') }}</h2>
      <div class="flex flex-wrap items-center gap-2">
        <input type="date" v-model="filter.date_from"
          class="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400" />
        <input type="date" v-model="filter.date_to"
          class="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400" />
        <button @click="loadData"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          {{ $t('filter') }}
        </button>
      </div>
    </div>

    <!-- Statistika jadvali -->
    <div class="flex-1 min-h-0 overflow-auto rounded-xl border border-gray-100">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500 text-xs sticky top-0 z-10">
          <tr>
            <th class="px-3 py-2 text-center w-10">#</th>
            <th class="px-3 py-2 text-left">{{ $t('product') }}</th>
            <th class="px-3 py-2 text-left">{{ $t('supplier') }}</th>
            <th class="px-3 py-2 text-right">{{ $t('count') }}</th>
            <th class="px-3 py-2 text-right">{{ $t('price') }}</th>
            <th class="px-3 py-2 text-right">{{ $t('summa') }}</th>
            <th class="px-3 py-2 text-left">{{ $t('type') }}</th>
            <th class="px-3 py-2 text-left">{{ $t('date') }}</th>
            <th class="px-3 py-2 text-left">{{ $t('expire_date') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in data" :key="item.id"
            class="border-t hover:bg-blue-50/50 transition">
            <td class="px-3 py-2 text-center text-blue-600 font-bold">{{ i + 1 }}</td>
            <td class="px-3 py-2 font-semibold text-gray-800 whitespace-nowrap">{{ item.product?.name || '-' }}</td>
            <td class="px-3 py-2 text-gray-500">{{ item.supplier?.name || '-' }}</td>
            <td class="px-3 py-2 text-right">{{ item.count }}</td>
            <td class="px-3 py-2 text-right">{{ fmt(item.price) }}</td>
            <td class="px-3 py-2 text-right font-semibold text-blue-600">{{ fmt(item.summa) }}</td>
            <td class="px-3 py-2">
              <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                :class="item.type === 'kirim' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                {{ item.type === 'kirim' ? $t('kirim') : $t('chiqim') }}
              </span>
            </td>
            <td class="px-3 py-2 text-gray-500">{{ formatDate(item.date_time) }}</td>
            <td class="px-3 py-2 text-gray-500">{{ item.expire_date ? formatDate(item.expire_date) : '-' }}</td>
          </tr>
          <tr v-if="data.length === 0">
            <td colspan="9" class="text-center py-10 text-gray-400">{{ $t('no_data') }}</td>
          </tr>
        </tbody>
        <!-- Jami qator -->
        <tfoot v-if="data.length > 0" class="bg-gray-50 border-t-2 border-gray-200">
          <tr class="font-bold text-sm">
            <td class="px-3 py-2" colspan="3">{{ $t('jami') }}</td>
            <td class="px-3 py-2 text-right">{{ totals.count }}</td>
            <td class="px-3 py-2"></td>
            <td class="px-3 py-2 text-right text-blue-600">{{ fmt(totals.summa) }}</td>
            <td class="px-3 py-2" colspan="3"></td>
          </tr>
        </tfoot>
      </table>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import registerProductService from "@/services/register_product.service";
import { useUserStore } from "@/stores/user";
import { useSummaFormat } from "@/composables/NumberFormat";

const { t } = useI18n();
const userStore = useUserStore();
const fmt = useSummaFormat;

const filter = ref({ date_from: '', date_to: '' });
const data = ref([]);

const formatDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-';

const totals = computed(() => {
  const r = { count: 0, summa: 0 };
  data.value.forEach(item => {
    r.count += Number(item.count) || 0;
    r.summa += Number(item.summa) || 0;
  });
  return r;
});

const loadData = async () => {
  const res = await registerProductService.all({
    branch_id: userStore.user?.branch_id,
    date_from: filter.value.date_from || undefined,
    date_to: filter.value.date_to || undefined,
  });
  data.value = res || [];
};

onMounted(() => loadData());
</script>
