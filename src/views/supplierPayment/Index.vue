<template>
  <div class="p-4 md:p-6 bg-white rounded-3xl h-full shadow-xl border border-gray-100 flex flex-col gap-4">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h2 class="text-2xl font-bold text-gray-800">{{ $t('supplier_payments') }}</h2>
      <div class="flex flex-wrap items-center gap-2">
        <input type="date" v-model="filter.date_from"
          class="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400" />
        <input type="date" v-model="filter.date_to"
          class="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400" />
        <button @click="loadStats"
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
            <th class="px-3 py-2 text-left">{{ $t('supplier') }}</th>
            <th class="px-3 py-2 text-left">{{ $t('phone') }}</th>
            <th class="px-3 py-2 text-right">{{ $t('total_summa') }}</th>
            <th class="px-3 py-2 text-center">{{ $t('count') }}</th>
            <th class="px-3 py-2 text-right text-green-600">{{ $t('paid') }}</th>
            <th class="px-3 py-2 text-right text-red-600 font-bold">{{ $t('balance') }}</th>
            <th class="px-3 py-2 text-center">{{ $t('unpaid') }}</th>
            <th class="px-3 py-2 text-center">{{ $t('actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in stats" :key="item.supplier_id"
            class="border-t hover:bg-blue-50/50 transition cursor-pointer"
            :class="selectedSupplierId === item.supplier_id ? 'bg-blue-50 ring-1 ring-blue-200' : ''"
            @click="selectSupplier(item)">
            <td class="px-3 py-2 text-center text-blue-600 font-bold">{{ i + 1 }}</td>
            <td class="px-3 py-2 font-semibold text-gray-800 whitespace-nowrap">{{ item.supplier?.name || '-' }}</td>
            <td class="px-3 py-2 text-gray-500">{{ item.supplier?.phone || '-' }}</td>
            <td class="px-3 py-2 text-right text-blue-600">{{ fmt(item.total_summa) }}</td>
            <td class="px-3 py-2 text-center text-gray-500">{{ item.count }}</td>
            <td class="px-3 py-2 text-right text-green-600">{{ fmt(item.paid_summa) }}</td>
            <td class="px-3 py-2 text-right font-bold"
              :class="item.balance > 0 ? 'text-red-600' : item.balance < 0 ? 'text-green-600' : 'text-gray-400'">
              {{ fmt(item.balance) }}
            </td>
            <td class="px-3 py-2 text-center text-red-500">{{ item.unpaid_count }}</td>
            <td class="px-3 py-2 text-center">
              <button @click.stop="openPayModal(item)"
                class="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition font-medium">
                {{ $t('make_payment') }}
              </button>
            </td>
          </tr>
          <tr v-if="stats.length === 0">
            <td colspan="9" class="text-center py-10 text-gray-400">{{ $t('no_data') }}</td>
          </tr>
        </tbody>
        <!-- Jami qator -->
        <tfoot v-if="stats.length > 0" class="bg-gray-50 border-t-2 border-gray-200">
          <tr class="font-bold text-sm">
            <td class="px-3 py-2" colspan="3">{{ $t('jami') }}</td>
            <td class="px-3 py-2 text-right text-blue-600">{{ fmt(totals.total_summa) }}</td>
            <td class="px-3 py-2 text-center text-gray-500">{{ totals.count }}</td>
            <td class="px-3 py-2 text-right text-green-600">{{ fmt(totals.paid_summa) }}</td>
            <td class="px-3 py-2 text-right" :class="totals.balance > 0 ? 'text-red-600' : 'text-green-600'">{{ fmt(totals.balance) }}</td>
            <td class="px-3 py-2 text-center text-red-500">{{ totals.unpaid_count }}</td>
            <td class="px-3 py-2"></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Tafsilotlar Modal -->
    <Transition name="modal">
      <div v-if="selectedSupplierId" class="fixed inset-0 z-40 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="selectedSupplierId = null"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
          <!-- Modal header -->
          <div class="flex items-center justify-between px-6 py-4 border-b shrink-0">
            <h3 class="text-lg font-bold text-gray-800">
              {{ selectedItem?.supplier?.name }} — {{ $t('details') }}
            </h3>
            <button @click="selectedSupplierId = null" class="text-gray-400 hover:text-red-500 transition text-xl">&times;</button>
          </div>

          <!-- Tablar -->
          <div class="flex gap-2 px-6 pt-4 pb-2 border-b border-gray-100 shrink-0">
            <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
              class="px-3 py-1.5 text-xs rounded-lg font-medium transition"
              :class="activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'">
              {{ tab.label }} <span v-if="tab.count !== undefined" class="ml-1 opacity-70">({{ tab.count }})</span>
            </button>
          </div>

          <!-- Modal body — scrollable -->
          <div class="flex-1 overflow-auto px-6 py-4">

            <!-- To'lovlar tarixi -->
            <div v-if="activeTab === 'payments'" class="overflow-auto rounded-xl border border-gray-100">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 text-gray-500 text-xs">
                  <tr>
                    <th class="px-3 py-2 text-left">#</th>
                    <th class="px-3 py-2 text-left">{{ $t('date') }}</th>
                    <th class="px-3 py-2 text-left">{{ $t('pay_type') }}</th>
                    <th class="px-3 py-2 text-right">{{ $t('summa') }}</th>
                    <th class="px-3 py-2 text-left">{{ $t('comment') }}</th>
                    <th class="px-3 py-2 text-center">{{ $t('actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(pay, i) in payments" :key="pay.id" class="border-t hover:bg-gray-50">
                    <td class="px-3 py-2 text-blue-600 font-bold">{{ i + 1 }}</td>
                    <td class="px-3 py-2">{{ formatDate(pay.date_time) }}</td>
                    <td class="px-3 py-2">
                      <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                        :class="payTypeColorClass(pay.pay_type?.color)">
                        {{ pay.pay_type?.[payTypeLabelKey] || pay.pay_type?.name || '-' }}
                      </span>
                    </td>
                    <td class="px-3 py-2 text-right font-semibold text-gray-800">{{ fmt(pay.summa) }}</td>
                    <td class="px-3 py-2 text-gray-500 italic">{{ pay.comment || '-' }}</td>
                    <td class="px-3 py-2 text-center">
                      <button @click="deletePayment(pay)" class="text-red-400 hover:text-red-600 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="payments.length === 0">
                    <td colspan="6" class="text-center py-6 text-gray-400">{{ $t('no_data') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Prixodlar ro'yxati -->
            <div v-if="activeTab === 'prixodlar'" class="overflow-auto rounded-xl border border-gray-100">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 text-gray-500 text-xs">
                  <tr>
                    <th class="px-3 py-2 text-left">#</th>
                    <th class="px-3 py-2 text-left">{{ $t('date') }}</th>
                    <th class="px-3 py-2 text-right">{{ $t('summa') }}</th>
                    <th class="px-3 py-2 text-left">{{ $t('type') }}</th>
                    <th class="px-3 py-2 text-center">{{ $t('paid') }}</th>
                    <th class="px-3 py-2 text-left">{{ $t('comment') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p, i) in registerSupplierItems" :key="p.id" class="border-t hover:bg-gray-50">
                    <td class="px-3 py-2 text-blue-600 font-bold">{{ i + 1 }}</td>
                    <td class="px-3 py-2">{{ formatDate(p.date_time) }}</td>
                    <td class="px-3 py-2 text-right font-semibold text-blue-600">{{ fmt(p.summa) }}</td>
                    <td class="px-3 py-2">
                      <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {{ p.doc_type || '-' }}
                      </span>
                    </td>
                    <td class="px-3 py-2 text-center">
                      <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                        :class="p.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                        {{ p.paid ? $t('paid') : $t('unpaid') }}
                      </span>
                    </td>
                    <td class="px-3 py-2 text-gray-500 italic">{{ p.comment || '-' }}</td>
                  </tr>
                  <tr v-if="registerSupplierItems.length === 0">
                    <td colspan="6" class="text-center py-6 text-gray-400">{{ $t('no_data') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </div>
    </Transition>

    <!-- To'lov Modal -->
    <Transition name="modal">
      <div v-if="showPayModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closePayModal"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
          <div class="flex items-center justify-between mb-4 border-b pb-3">
            <h3 class="text-lg font-bold text-gray-800">{{ $t('make_payment') }} — {{ payForm.supplierName }}</h3>
            <button @click="closePayModal" class="text-gray-400 hover:text-red-500 transition text-xl">&times;</button>
          </div>

          <div class="space-y-4">
            <!-- Supplier info + balance -->
            <div class="bg-blue-50 rounded-xl p-3 text-sm">
              <div class="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p class="text-xs text-gray-500">{{ $t('total_summa') }}</p>
                  <p class="font-bold text-blue-700">{{ fmt(payForm.totalSumma) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">{{ $t('paid') }}</p>
                  <p class="font-bold text-green-700">{{ fmt(payForm.paidSumma) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">{{ $t('balance') }}</p>
                  <p class="font-bold text-red-700">{{ fmt(payForm.balance) }}</p>
                </div>
              </div>
            </div>

            <!-- Register supplier yozuvlarini tanlash -->
            <div v-if="unpaidSupplierItems.length > 0">
              <p class="text-sm font-medium text-gray-700 mb-2">{{ $t('select_records_to_pay') }}:</p>
              <div class="max-h-48 overflow-y-auto border rounded-lg divide-y">
                <label v-for="item in unpaidSupplierItems" :key="item.id"
                  class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" :value="item.id" v-model="payForm.selectedIds"
                    @change="updatePaySumma" class="w-4 h-4" />
                  <div class="flex-1 text-sm">
                    <span class="text-gray-700">{{ item.doc_type || 'prixod' }}</span>
                    <span class="text-gray-400 text-xs ml-2">{{ formatDate(item.date_time) }}</span>
                  </div>
                  <span class="font-semibold text-gray-800">{{ fmt(item.summa) }}</span>
                </label>
              </div>
            </div>

            <!-- Summa -->
            <BaseInputNumber v-model="payForm.summa" :label="$t('payment_amount')" :min="0" :step="1000" size="lg" />

            <!-- To'lov turi -->
            <BaseSelect v-model="payForm.pay_type_id" :label="$t('pay_type')"
              :options="globalStore.payTypes" :label-key="payTypeLabelKey" value-key="id" />

            <!-- Izoh -->
            <div>
              <label class="text-sm text-gray-600 mb-1 block">{{ $t('comment') }}</label>
              <input type="text" v-model="payForm.comment"
                class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                :placeholder="$t('optional')" />
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-5">
            <button @click="closePayModal"
              class="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition">
              {{ $t('cancel') }}
            </button>
            <button @click="submitPayment" :disabled="paying || !payForm.summa || payForm.summa <= 0"
              class="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-50">
              {{ paying ? $t('saving') : $t('make_payment') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import supplierPaymentService from "@/services/supplier_payment.service";
import registerSupplierService from "@/services/register_supplier.service";
import { useUserStore } from "@/stores/user";
import { useGlobalStore } from "@/stores/global";
import { useSummaFormat } from "@/composables/NumberFormat";
import BaseInputNumber from "@/components/form/BaseInputNumber.vue";
import BaseSelect from "@/components/form/BaseSelect.vue";

const { t, locale } = useI18n();
const userStore = useUserStore();
const globalStore = useGlobalStore();
const payTypeLabelKey = computed(() => 'name_' + (locale.value === 'uzk' ? 'uzk' : locale.value === 'ru' ? 'ru' : 'uz'));
const defaultPayTypeId = computed(() => globalStore.payTypes.find(pt => pt.is_default)?.id || globalStore.payTypes[0]?.id || null);
const fmt = useSummaFormat;

const colorClassMap = {
  success: 'bg-green-100 text-green-700',
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-yellow-100 text-yellow-700',
  primary: 'bg-indigo-100 text-indigo-700',
  purple: 'bg-purple-100 text-purple-700',
  danger: 'bg-red-100 text-red-700',
  default: 'bg-gray-100 text-gray-600',
};
const payTypeColorClass = (color) => colorClassMap[color] || 'bg-gray-100 text-gray-600';

const filter = ref({ date_from: '', date_to: '' });
const stats = ref([]);
const selectedSupplierId = ref(null);
const selectedItem = ref(null);
const activeTab = ref('payments');
const payments = ref([]);
const registerSupplierItems = ref([]);
const unpaidSupplierItems = ref([]);

const showPayModal = ref(false);
const paying = ref(false);
const payForm = ref({
  supplier_id: null,
  supplierName: '',
  totalSumma: 0,
  paidSumma: 0,
  balance: 0,
  summa: 0,
  pay_type_id: null,
  comment: '',
  selectedIds: [],
});

const formatDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-';

// Jami hisoblash
const totals = computed(() => {
  const r = { total_summa: 0, count: 0, paid_summa: 0, balance: 0, unpaid_count: 0 };
  stats.value.forEach(s => {
    r.total_summa += s.total_summa || 0;
    r.count += s.count || 0;
    r.paid_summa += s.paid_summa || 0;
    r.balance += s.balance || 0;
    r.unpaid_count += s.unpaid_count || 0;
  });
  return r;
});

// Tablar
const tabs = computed(() => [
  { key: 'payments', label: t('payment_history'), count: payments.value.length },
  { key: 'prixodlar', label: t('prixodlar'), count: registerSupplierItems.value.length },
]);

// Data load
const loadStats = async () => {
  const res = await supplierPaymentService.stats({
    branch_id: userStore.user?.branch_id,
    date_from: filter.value.date_from || undefined,
    date_to: filter.value.date_to || undefined,
  });
  stats.value = res || [];
  if (selectedSupplierId.value) {
    const item = stats.value.find(s => s.supplier_id === selectedSupplierId.value);
    if (item) {
      selectedItem.value = item;
      await loadDetails(item.supplier_id);
    } else {
      selectedSupplierId.value = null;
    }
  }
};

const selectSupplier = async (item) => {
  if (selectedSupplierId.value === item.supplier_id) {
    selectedSupplierId.value = null;
    return;
  }
  selectedSupplierId.value = item.supplier_id;
  selectedItem.value = item;
  activeTab.value = 'payments';
  await loadDetails(item.supplier_id);
};

const loadDetails = async (supplierId) => {
  const params = {
    supplier_id: supplierId,
    branch_id: userStore.user?.branch_id,
    date_from: filter.value.date_from || undefined,
    date_to: filter.value.date_to || undefined,
  };

  const [paymentsRes, supplierRes] = await Promise.all([
    supplierPaymentService.all(params),
    registerSupplierService.all(params),
  ]);
  payments.value = paymentsRes || [];
  registerSupplierItems.value = supplierRes || [];
};

// To'lov modal
const openPayModal = async (item) => {
  const balance = item.balance || 0;
  payForm.value = {
    supplier_id: item.supplier_id,
    supplierName: item.supplier?.name || '',
    totalSumma: item.total_summa || 0,
    paidSumma: item.paid_summa || 0,
    balance: balance,
    summa: balance > 0 ? balance : 0,
    pay_type_id: defaultPayTypeId.value,
    comment: '',
    selectedIds: [],
  };
  const res = await registerSupplierService.all({
    supplier_id: item.supplier_id, paid: false, branch_id: userStore.user?.branch_id,
    date_from: filter.value.date_from || undefined,
    date_to: filter.value.date_to || undefined,
  }).catch(() => []);
  unpaidSupplierItems.value = Array.isArray(res) ? res : [];
  showPayModal.value = true;
};

const updatePaySumma = () => {
  const total = unpaidSupplierItems.value
    .filter(i => payForm.value.selectedIds.includes(i.id))
    .reduce((sum, i) => sum + Number(i.summa), 0);
  payForm.value.summa = total;
};

const closePayModal = () => {
  showPayModal.value = false;
  unpaidSupplierItems.value = [];
};

const submitPayment = async () => {
  if (!payForm.value.summa || payForm.value.summa <= 0) return;
  paying.value = true;
  try {
    await supplierPaymentService.create({
      branch_id: userStore.user?.branch_id,
      supplier_id: payForm.value.supplier_id,
      summa: payForm.value.summa,
      pay_type_id: payForm.value.pay_type_id,
      comment: payForm.value.comment,
      date_time: new Date(),
      register_supplier_ids: payForm.value.selectedIds,
    });
    closePayModal();
    await loadStats();
  } catch (err) {
    console.error("To'lov xatosi:", err);
  } finally {
    paying.value = false;
  }
};

const deletePayment = async (pay) => {
  if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
  await supplierPaymentService.delete(pay.id);
  await loadStats();
};

onMounted(() => loadStats());
</script>
