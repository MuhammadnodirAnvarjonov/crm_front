<template>
  <div class="p-4 md:p-6 bg-white rounded-3xl h-full shadow-xl border border-gray-100 flex flex-col gap-4">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h2 class="text-2xl font-bold text-gray-800">{{ $t('user_payments') }}</h2>
      <div class="flex flex-wrap items-center gap-2">
        <BaseSelect v-model="filter.month" :options="months" label-key="label" value-key="value"
          :clearable="false" size="sm" class="w-36" />
        <BaseSelect v-model="filter.year" :options="yearOptions" label-key="label" value-key="value"
          :clearable="false" size="sm" class="w-24" />
      </div>
    </div>

    <!-- Statistika jadvali -->
    <div class="flex-1 min-h-0 overflow-auto rounded-xl border border-gray-100">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500 text-xs sticky top-0 z-10">
          <tr>
            <th class="px-3 py-2 text-center w-10">#</th>
            <th class="px-3 py-2 text-left">{{ $t('user') }}</th>
            <th class="px-3 py-2 text-right">{{ $t('fix') }}</th>
            <th class="px-3 py-2 text-right">{{ $t('service') }}</th>
            <th class="px-3 py-2 text-right">{{ $t('palata') }}</th>
            <th class="px-3 py-2 text-right">{{ $t('direct') }}</th>
            <th class="px-3 py-2 text-right text-red-500">{{ $t('jarima') }}</th>
            <th class="px-3 py-2 text-right font-bold">{{ $t('jami') }}</th>
            <th class="px-3 py-2 text-right text-yellow-600">{{ $t('avans') }}</th>
            <th class="px-3 py-2 text-right text-green-600">{{ $t('paid') }}</th>
            <th class="px-3 py-2 text-right text-red-600 font-bold">{{ $t('balance') }}</th>
            <th class="px-3 py-2 text-center">{{ $t('actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in stats" :key="item.user_id"
            class="border-t hover:bg-blue-50/50 transition cursor-pointer" @click="openHistoryModal(item)">
            <td class="px-3 py-2 text-center text-blue-600 font-bold">{{ i + 1 }}</td>
            <td class="px-3 py-2 font-semibold text-gray-800 whitespace-nowrap">{{ item.user_name }}</td>
            <td class="px-3 py-2 text-right">{{ fmt(item.fix) }}</td>
            <td class="px-3 py-2 text-right text-blue-600">{{ fmt(item.service_summa) }}</td>
            <td class="px-3 py-2 text-right text-purple-600">{{ fmt(item.palata_summa) }}</td>
            <td class="px-3 py-2 text-right text-cyan-600">{{ fmt(item.direct_summa) }}</td>
            <td class="px-3 py-2 text-right text-red-500">{{ item.jarima ? '-' + fmt(item.jarima) : '0' }}</td>
            <td class="px-3 py-2 text-right font-bold text-gray-800">{{ fmt(item.jami) }}</td>
            <td class="px-3 py-2 text-right text-yellow-600">{{ fmt(item.avans_summa) }}</td>
            <td class="px-3 py-2 text-right text-green-600">{{ fmt(item.paid_summa) }}</td>
            <td class="px-3 py-2 text-right font-bold" :class="item.qoldiq > 0 ? 'text-red-600' : 'text-gray-400'">
              {{ fmt(item.qoldiq) }}
            </td>
            <td class="px-3 py-2 text-center">
              <div class="flex items-center justify-center gap-1">
                <button @click.stop="openPayModal(item, 'avans')"
                  class="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition font-medium">
                  {{ $t('avans') }}
                </button>
                <button @click.stop="openPayModal(item, 'oylik')"
                  class="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition font-medium">
                  {{ $t('oylik') }}
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="stats.length === 0">
            <td colspan="12" class="text-center py-10 text-gray-400">{{ $t('no_data') }}</td>
          </tr>
        </tbody>
        <!-- Jami qator -->
        <tfoot v-if="stats.length > 0" class="bg-gray-50 border-t-2 border-gray-200">
          <tr class="font-bold text-sm">
            <td class="px-3 py-2" colspan="2">{{ $t('jami') }}</td>
            <td class="px-3 py-2 text-right">{{ fmt(totals.fix) }}</td>
            <td class="px-3 py-2 text-right text-blue-600">{{ fmt(totals.service_summa) }}</td>
            <td class="px-3 py-2 text-right text-purple-600">{{ fmt(totals.palata_summa) }}</td>
            <td class="px-3 py-2 text-right text-cyan-600">{{ fmt(totals.direct_summa) }}</td>
            <td class="px-3 py-2 text-right text-red-500">{{ totals.jarima ? '-' + fmt(totals.jarima) : '0' }}</td>
            <td class="px-3 py-2 text-right text-gray-800">{{ fmt(totals.jami) }}</td>
            <td class="px-3 py-2 text-right text-yellow-600">{{ fmt(totals.avans_summa) }}</td>
            <td class="px-3 py-2 text-right text-green-600">{{ fmt(totals.paid_summa) }}</td>
            <td class="px-3 py-2 text-right text-red-600">{{ fmt(totals.qoldiq) }}</td>
            <td class="px-3 py-2"></td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- TARIX MODAL -->
    <Transition name="modal">
      <div v-if="showHistoryModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="showHistoryModal = false"></div>
        <div
          class="relative bg-white w-full sm:rounded-2xl sm:shadow-2xl sm:max-w-4xl sm:max-h-[90vh] max-h-[95vh] flex flex-col rounded-t-2xl">

          <!-- Modal Header -->
          <div class="flex items-center justify-between px-4 sm:px-6 py-4 border-b bg-gray-50 sm:rounded-t-2xl rounded-t-2xl">
            <div>
              <h3 class="text-base sm:text-lg font-bold text-gray-800">{{ selectedItem?.user_name }}</h3>
              <div class="flex flex-wrap gap-3 mt-1 text-xs">
                <span class="text-indigo-600 font-semibold">{{ $t('fix') }}: {{ fmt(selectedItem?.fix) }}</span>
                <span class="text-blue-600 font-semibold">{{ $t('service') }}: {{ fmt(selectedItem?.service_summa) }}</span>
                <span class="text-purple-600 font-semibold">{{ $t('palata') }}: {{ fmt(selectedItem?.palata_summa) }}</span>
                <span class="text-cyan-600 font-semibold">{{ $t('direct') }}: {{ fmt(selectedItem?.direct_summa) }}</span>
                <span class="text-red-500 font-semibold">{{ $t('jarima') }}: -{{ fmt(selectedItem?.jarima) }}</span>
                <span class="text-gray-800 font-bold">{{ $t('jami') }}: {{ fmt(selectedItem?.jami) }}</span>
              </div>
            </div>
            <button @click="showHistoryModal = false"
              class="text-gray-400 hover:text-red-500 transition text-2xl ml-3 flex-shrink-0">&times;</button>
          </div>

          <!-- Tablar -->
          <div class="flex gap-1 px-4 sm:px-6 py-2 border-b overflow-x-auto no-scrollbar bg-white">
            <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
              class="px-3 py-1.5 text-xs rounded-lg font-medium transition whitespace-nowrap"
              :class="activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
              {{ tab.label }}
              <span v-if="tab.count !== undefined" class="ml-0.5 opacity-70">({{ tab.count }})</span>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="flex-1 overflow-auto px-4 sm:px-6 py-3">

            <!-- To'lovlar tarixi -->
            <div v-if="activeTab === 'payments'">
              <div class="overflow-auto rounded-xl border border-gray-100">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50 text-gray-500 text-xs sticky top-0">
                    <tr>
                      <th class="px-3 py-2 text-left">#</th>
                      <th class="px-3 py-2 text-left">{{ $t('date') }}</th>
                      <th class="px-3 py-2 text-left">{{ $t('type') }}</th>
                      <th class="px-3 py-2 text-left hidden sm:table-cell">{{ $t('pay_type') }}</th>
                      <th class="px-3 py-2 text-right">{{ $t('summa') }}</th>
                      <th class="px-3 py-2 text-left hidden sm:table-cell">{{ $t('comment') }}</th>
                      <th class="px-3 py-2 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(pay, i) in historyPayments" :key="pay.id" class="border-t hover:bg-gray-50">
                      <td class="px-3 py-2 text-blue-600 font-bold">{{ i + 1 }}</td>
                      <td class="px-3 py-2 whitespace-nowrap">{{ formatDate(pay.date_time) }}</td>
                      <td class="px-3 py-2">
                        <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                          :class="pay.type === 'avans' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'">
                          {{ pay.type === 'avans' ? $t('avans') : $t('oylik') }}
                        </span>
                      </td>
                      <td class="px-3 py-2 hidden sm:table-cell">{{ pay.pay_type?.[payTypeLabelKey] || pay.pay_type?.name || '-' }}</td>
                      <td class="px-3 py-2 text-right font-semibold">{{ fmt(pay.jami_summa) }}</td>
                      <td class="px-3 py-2 text-gray-500 italic hidden sm:table-cell">{{ pay.comment || '-' }}</td>
                      <td class="px-3 py-2 text-center">
                        <button @click="deletePayment(pay)" class="text-red-400 hover:text-red-600 transition">
                          <trashIcon size="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                    <tr v-if="historyPayments.length === 0">
                      <td colspan="7" class="text-center py-6 text-gray-400">{{ $t('no_data') }}</td>
                    </tr>
                  </tbody>
                  <tfoot v-if="historyPayments.length > 0" class="bg-gray-50 border-t-2 font-bold text-sm">
                    <tr>
                      <td colspan="4" class="px-3 py-2">{{ $t('jami') }}</td>
                      <td class="px-3 py-2 text-right">{{ fmt(paymentsTotals) }}</td>
                      <td colspan="2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <!-- Xizmatlar -->
            <div v-if="activeTab === 'services'">
              <div class="overflow-auto rounded-xl border border-gray-100">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50 text-gray-500 text-xs sticky top-0">
                    <tr>
                      <th class="px-3 py-2 text-left">#</th>
                      <th class="px-3 py-2 text-left">{{ $t('date') }}</th>
                      <th class="px-3 py-2 text-left">{{ $t('service') }}</th>
                      <th class="px-3 py-2 text-left hidden sm:table-cell">{{ $t('patient') }}</th>
                      <th class="px-3 py-2 text-right">{{ $t('summa') }}</th>
                      <th class="px-3 py-2 text-right">{{ $t('user_summa') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(s, i) in historyData.services" :key="s.id" class="border-t hover:bg-gray-50">
                      <td class="px-3 py-2 text-blue-600 font-bold">{{ i + 1 }}</td>
                      <td class="px-3 py-2 whitespace-nowrap">{{ formatDate(s.date_time) }}</td>
                      <td class="px-3 py-2">{{ s.service?.name || '-' }}</td>
                      <td class="px-3 py-2 hidden sm:table-cell">{{ s.patient?.full_name || '-' }}</td>
                      <td class="px-3 py-2 text-right">{{ fmt(s.summa) }}</td>
                      <td class="px-3 py-2 text-right font-semibold text-blue-600">{{ fmt(s.user_summa) }}</td>
                    </tr>
                    <tr v-if="!historyData.services?.length">
                      <td colspan="6" class="text-center py-6 text-gray-400">{{ $t('no_data') }}</td>
                    </tr>
                  </tbody>
                  <tfoot v-if="historyData.services?.length" class="bg-gray-50 border-t-2 font-bold text-sm">
                    <tr>
                      <td colspan="4" class="px-3 py-2">{{ $t('jami') }} ({{ historyData.services.length }})</td>
                      <td class="px-3 py-2 text-right">{{ fmt(servicesTotals.summa) }}</td>
                      <td class="px-3 py-2 text-right text-blue-600">{{ fmt(servicesTotals.user_summa) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <!-- Palatalar -->
            <div v-if="activeTab === 'palatas'">
              <div class="overflow-auto rounded-xl border border-gray-100">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50 text-gray-500 text-xs sticky top-0">
                    <tr>
                      <th class="px-3 py-2 text-left">#</th>
                      <th class="px-3 py-2 text-left">{{ $t('date') }}</th>
                      <th class="px-3 py-2 text-left">{{ $t('palata') }}</th>
                      <th class="px-3 py-2 text-left hidden sm:table-cell">{{ $t('patient') }}</th>
                      <th class="px-3 py-2 text-right">{{ $t('day') }}</th>
                      <th class="px-3 py-2 text-right">{{ $t('summa') }}</th>
                      <th class="px-3 py-2 text-right">{{ $t('user_summa') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(p, i) in historyData.palatas" :key="p.id" class="border-t hover:bg-gray-50">
                      <td class="px-3 py-2 text-blue-600 font-bold">{{ i + 1 }}</td>
                      <td class="px-3 py-2 whitespace-nowrap">{{ formatDate(p.date_time) }}</td>
                      <td class="px-3 py-2">{{ p.palata?.name || '-' }}</td>
                      <td class="px-3 py-2 hidden sm:table-cell">{{ p.patient?.full_name || '-' }}</td>
                      <td class="px-3 py-2 text-right">{{ p.count || 1 }}</td>
                      <td class="px-3 py-2 text-right">{{ fmt(p.summa) }}</td>
                      <td class="px-3 py-2 text-right font-semibold text-purple-600">{{ fmt(p.user_summa) }}</td>
                    </tr>
                    <tr v-if="!historyData.palatas?.length">
                      <td colspan="7" class="text-center py-6 text-gray-400">{{ $t('no_data') }}</td>
                    </tr>
                  </tbody>
                  <tfoot v-if="historyData.palatas?.length" class="bg-gray-50 border-t-2 font-bold text-sm">
                    <tr>
                      <td colspan="4" class="px-3 py-2">{{ $t('jami') }} ({{ historyData.palatas.length }} kun)</td>
                      <td class="px-3 py-2 text-right">{{ palatasTotals.days }}</td>
                      <td class="px-3 py-2 text-right">{{ fmt(palatasTotals.summa) }}</td>
                      <td class="px-3 py-2 text-right text-purple-600">{{ fmt(palatasTotals.user_summa) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <!-- Vakillar -->
            <div v-if="activeTab === 'directs'">
              <div class="overflow-auto rounded-xl border border-gray-100">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50 text-gray-500 text-xs sticky top-0">
                    <tr>
                      <th class="px-3 py-2 text-left">#</th>
                      <th class="px-3 py-2 text-left">{{ $t('date') }}</th>
                      <th class="px-3 py-2 text-left">{{ $t('patient') }}</th>
                      <th class="px-3 py-2 text-right">{{ $t('summa') }}</th>
                      <th class="px-3 py-2 text-right">{{ $t('user_summa') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(d, i) in historyData.directs" :key="d.id" class="border-t hover:bg-gray-50">
                      <td class="px-3 py-2 text-blue-600 font-bold">{{ i + 1 }}</td>
                      <td class="px-3 py-2 whitespace-nowrap">{{ formatDate(d.date_time) }}</td>
                      <td class="px-3 py-2">{{ d.patient?.full_name || '-' }}</td>
                      <td class="px-3 py-2 text-right">{{ fmt(d.service_summa) }}</td>
                      <td class="px-3 py-2 text-right font-semibold text-cyan-600">{{ fmt(d.summa) }}</td>
                    </tr>
                    <tr v-if="!historyData.directs?.length">
                      <td colspan="5" class="text-center py-6 text-gray-400">{{ $t('no_data') }}</td>
                    </tr>
                  </tbody>
                  <tfoot v-if="historyData.directs?.length" class="bg-gray-50 border-t-2 font-bold text-sm">
                    <tr>
                      <td colspan="3" class="px-3 py-2">{{ $t('jami') }} ({{ historyData.directs.length }})</td>
                      <td class="px-3 py-2 text-right">{{ fmt(directsTotals.service_summa) }}</td>
                      <td class="px-3 py-2 text-right text-cyan-600">{{ fmt(directsTotals.summa) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <!-- Jarimalar -->
            <div v-if="activeTab === 'penalties'">
              <div class="overflow-auto rounded-xl border border-gray-100">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50 text-gray-500 text-xs sticky top-0">
                    <tr>
                      <th class="px-3 py-2 text-left">#</th>
                      <th class="px-3 py-2 text-left">{{ $t('date') }}</th>
                      <th class="px-3 py-2 text-center">{{ $t('came') }}</th>
                      <th class="px-3 py-2 text-center">{{ $t('left') }}</th>
                      <th class="px-3 py-2 text-center hidden sm:table-cell">{{ $t('plan_come') }}</th>
                      <th class="px-3 py-2 text-center hidden sm:table-cell">{{ $t('plan_leave') }}</th>
                      <th class="px-3 py-2 text-right text-red-500">{{ $t('jarima') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(p, i) in historyData.penalties" :key="p.id" class="border-t hover:bg-gray-50">
                      <td class="px-3 py-2 text-blue-600 font-bold">{{ i + 1 }}</td>
                      <td class="px-3 py-2 whitespace-nowrap">{{ formatDate(p.createdAt) }}</td>
                      <td class="px-3 py-2 text-center">{{ unixToTime(p.real_come_time) }}</td>
                      <td class="px-3 py-2 text-center">{{ unixToTime(p.real_leave_time) }}</td>
                      <td class="px-3 py-2 text-center text-gray-400 hidden sm:table-cell">{{ unixToTime(p.come_time) }}</td>
                      <td class="px-3 py-2 text-center text-gray-400 hidden sm:table-cell">{{ unixToTime(p.leave_time) }}</td>
                      <td class="px-3 py-2 text-right font-semibold text-red-500">{{ p.penalty > 0 ? fmt(p.penalty) : '-' }}</td>
                    </tr>
                    <tr v-if="!historyData.penalties?.length">
                      <td colspan="7" class="text-center py-6 text-gray-400">{{ $t('no_data') }}</td>
                    </tr>
                  </tbody>
                  <tfoot v-if="historyData.penalties?.length" class="bg-gray-50 border-t-2 font-bold text-sm">
                    <tr>
                      <td colspan="6" class="px-3 py-2">{{ $t('jami') }} ({{ historyData.penalties.length }} kun)</td>
                      <td class="px-3 py-2 text-right text-red-500">{{ fmt(penaltiesTotals) }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Transition>

    <!-- To'lov Modal -->
    <Transition name="modal">
      <div v-if="showPayModal" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closePayModal"></div>
        <div class="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-xl p-5 sm:p-6">
          <div class="flex items-center justify-between mb-4 border-b pb-3">
            <h3 class="text-lg font-bold text-gray-800">
              {{ payForm.type === 'avans' ? $t('avans') : $t('oylik') }} — {{ payForm.userName }}
            </h3>
            <button @click="closePayModal" class="text-gray-400 hover:text-red-500 transition text-xl">&times;</button>
          </div>

          <div class="space-y-4">
            <!-- Hisob-kitob -->
            <div class="bg-blue-50 rounded-xl p-3 text-sm">
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div>
                  <p class="text-xs text-gray-500">{{ $t('fix') }}</p>
                  <p class="font-bold text-indigo-700">{{ fmt(payForm.fix) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">{{ $t('service') }}</p>
                  <p class="font-bold text-blue-700">{{ fmt(payForm.service_summa) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">{{ $t('palata') }}</p>
                  <p class="font-bold text-purple-700">{{ fmt(payForm.palata_summa) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">{{ $t('direct') }}</p>
                  <p class="font-bold text-cyan-700">{{ fmt(payForm.direct_summa) }}</p>
                </div>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center mt-2 pt-2 border-t border-blue-200">
                <div>
                  <p class="text-xs text-red-400">{{ $t('jarima') }}</p>
                  <p class="font-bold text-red-600">{{ fmt(payForm.jarima) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">{{ $t('total') }}</p>
                  <p class="font-bold text-gray-800">{{ fmt(payForm.jami) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">{{ $t('avans') }}</p>
                  <p class="font-bold text-yellow-700">{{ fmt(payForm.avans_summa) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-500">{{ $t('balance') }}</p>
                  <p class="font-bold text-red-700">{{ fmt(payForm.qoldiq) }}</p>
                </div>
              </div>
            </div>

            <!-- Bir nechta to'lov turi -->
            <div>
              <label class="text-sm text-gray-600 mb-2 block font-medium">{{ $t('pay_type') }}</label>
              <div class="space-y-2">
                <div v-for="(row, idx) in payRows" :key="idx" class="flex items-center gap-2">
                  <select v-model="row.pay_type_id"
                    class="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400">
                    <option v-for="pt in globalStore.payTypes" :key="pt.id" :value="pt.id">
                      {{ pt[payTypeLabelKey] || pt.name }}
                    </option>
                  </select>
                  <input type="number" v-model.number="row.summa"
                    class="w-36 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 text-right"
                    :placeholder="$t('summa')" min="0" />
                  <button v-if="payRows.length > 1" @click="payRows.splice(idx, 1)"
                    class="text-red-400 hover:text-red-600 transition text-lg px-1">&times;</button>
                </div>
              </div>
              <button @click="addPayRow" class="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium">
                + {{ $t('add') }}
              </button>
              <div class="mt-2 text-right text-sm font-bold text-gray-700">
                {{ $t('jami') }}: {{ fmt(payRowsTotal) }}
              </div>
            </div>

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
            <button @click="submitPayment" :disabled="paying || payRowsTotal <= 0"
              class="px-5 py-2 rounded-lg text-white font-medium transition disabled:opacity-50"
              :class="payForm.type === 'avans' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'">
              {{ paying ? $t('saving') : $t('make_payment') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import userPaymentService from "@/services/user_payment.service";
import { useUserStore } from "@/stores/user";
import { useGlobalStore } from "@/stores/global";
import { useSummaFormat } from "@/composables/NumberFormat";
import { trashIcon } from "@/components/icons/icon-temp";
import BaseSelect from "@/components/form/BaseSelect.vue";

const { t, locale } = useI18n();
const userStore = useUserStore();
const globalStore = useGlobalStore();
const payTypeLabelKey = computed(() => 'name_' + (locale.value === 'uzk' ? 'uzk' : locale.value === 'ru' ? 'ru' : 'uz'));
const defaultPayTypeId = computed(() => globalStore.payTypes.find(pt => pt.is_default)?.id || globalStore.payTypes[0]?.id || null);
const fmt = useSummaFormat;

const now = new Date();
const filter = ref({ month: now.getMonth() + 1, year: now.getFullYear() });
const stats = ref([]);
const selectedItem = ref(null);
const activeTab = ref('payments');
const historyPayments = ref([]);
const historyData = ref({ services: [], palatas: [], directs: [], penalties: [] });

const showHistoryModal = ref(false);
const showPayModal = ref(false);
const paying = ref(false);
const payForm = ref({});
const payRows = ref([]);

const months = [
  { value: 1, label: 'Yanvar' }, { value: 2, label: 'Fevral' }, { value: 3, label: 'Mart' },
  { value: 4, label: 'Aprel' }, { value: 5, label: 'May' }, { value: 6, label: 'Iyun' },
  { value: 7, label: 'Iyul' }, { value: 8, label: 'Avgust' }, { value: 9, label: 'Sentabr' },
  { value: 10, label: 'Oktabr' }, { value: 11, label: 'Noyabr' }, { value: 12, label: 'Dekabr' },
];
const currentYear = now.getFullYear();
const yearOptions = [currentYear - 1, currentYear, currentYear + 1].map(y => ({ value: y, label: String(y) }));

const formatDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', { year: 'numeric', month: '2-digit', day: '2-digit' }) : '-';

const unixToTime = (ts) => {
  if (!ts) return '-';
  const d = new Date(ts * 1000);
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
};

// Jami hisoblash (asosiy jadval)
const totals = computed(() => {
  const t = { fix: 0, service_summa: 0, palata_summa: 0, direct_summa: 0, jarima: 0, jami: 0, avans_summa: 0, paid_summa: 0, qoldiq: 0 };
  stats.value.forEach(s => {
    t.fix += s.fix || 0;
    t.service_summa += s.service_summa || 0;
    t.palata_summa += s.palata_summa || 0;
    t.direct_summa += s.direct_summa || 0;
    t.jarima += s.jarima || 0;
    t.jami += s.jami || 0;
    t.avans_summa += s.avans_summa || 0;
    t.paid_summa += s.paid_summa || 0;
    t.qoldiq += s.qoldiq || 0;
  });
  return t;
});

// History totals
const paymentsTotals = computed(() =>
  historyPayments.value.reduce((s, p) => s + (Number(p.jami_summa) || 0), 0)
);

const servicesTotals = computed(() => {
  const r = { summa: 0, user_summa: 0 };
  (historyData.value.services || []).forEach(s => {
    r.summa += Number(s.summa) || 0;
    r.user_summa += Number(s.user_summa) || 0;
  });
  return r;
});

const palatasTotals = computed(() => {
  const r = { summa: 0, user_summa: 0, days: 0 };
  (historyData.value.palatas || []).forEach(p => {
    r.summa += Number(p.summa) || 0;
    r.user_summa += Number(p.user_summa) || 0;
    r.days += Number(p.count) || 1;
  });
  return r;
});

const directsTotals = computed(() => {
  const r = { service_summa: 0, summa: 0 };
  (historyData.value.directs || []).forEach(d => {
    r.service_summa += Number(d.service_summa) || 0;
    r.summa += Number(d.summa) || 0;
  });
  return r;
});

const penaltiesTotals = computed(() =>
  (historyData.value.penalties || []).reduce((s, p) => s + (Number(p.penalty) || 0), 0)
);

const payRowsTotal = computed(() => payRows.value.reduce((s, r) => s + (Number(r.summa) || 0), 0));

// Tablar
const tabs = computed(() => [
  { key: 'payments', label: t('payment_history'), count: historyPayments.value.length },
  { key: 'services', label: t('service'), count: historyData.value.services?.length || 0 },
  { key: 'palatas', label: t('palata'), count: historyData.value.palatas?.length || 0 },
  { key: 'directs', label: t('direct'), count: historyData.value.directs?.length || 0 },
  { key: 'penalties', label: t('jarima'), count: historyData.value.penalties?.length || 0 },
]);

// Data load
const loadStats = async () => {
  const res = await userPaymentService.stats({
    branch_id: userStore.user?.branch_id,
    month: filter.value.month,
    year: filter.value.year,
  });
  stats.value = res || [];
};

const openHistoryModal = async (item) => {
  selectedItem.value = item;
  activeTab.value = 'payments';
  showHistoryModal.value = true;
  await loadHistory(item.user_id);
};

const loadHistory = async (userId) => {
  const params = {
    user_id: userId,
    month: filter.value.month,
    year: filter.value.year,
    branch_id: userStore.user?.branch_id,
  };

  const [paymentsRes, historyRes] = await Promise.all([
    userPaymentService.all(params),
    userPaymentService.history(params),
  ]);
  historyPayments.value = paymentsRes || [];
  historyData.value = historyRes || { services: [], palatas: [], directs: [], penalties: [] };
};

// To'lov modal
const openPayModal = (item, type) => {
  payForm.value = {
    user_id: item.user_id,
    userName: item.user_name,
    fix: item.fix || 0,
    service_summa: item.service_summa || 0,
    palata_summa: item.palata_summa || 0,
    direct_summa: item.direct_summa || 0,
    jarima: item.jarima || 0,
    avans_summa: item.avans_summa || 0,
    paid_summa: item.paid_summa || 0,
    jami: item.jami || 0,
    qoldiq: item.qoldiq || 0,
    type,
    comment: '',
  };
  payRows.value = [{
    pay_type_id: defaultPayTypeId.value,
    summa: type === 'avans' ? 0 : Math.max(0, item.qoldiq || 0),
  }];
  showPayModal.value = true;
};

const addPayRow = () => {
  payRows.value.push({ pay_type_id: defaultPayTypeId.value, summa: 0 });
};

const closePayModal = () => { showPayModal.value = false; };

const submitPayment = async () => {
  if (payRowsTotal.value <= 0) return;
  paying.value = true;
  try {
    await userPaymentService.create({
      branch_id: userStore.user?.branch_id,
      user_id: payForm.value.user_id,
      fix_summa: payForm.value.fix,
      service_summa: payForm.value.service_summa,
      palata_summa: payForm.value.palata_summa,
      direct_summa: payForm.value.direct_summa,
      avans_summa: payForm.value.type === 'avans' ? payRowsTotal.value : payForm.value.avans_summa,
      bonus: 0,
      jarima: payForm.value.jarima,
      jami_summa: payRowsTotal.value,
      payments: payRows.value.filter(r => r.summa > 0),
      type: payForm.value.type,
      month: filter.value.month,
      year: filter.value.year,
      comment: payForm.value.comment,
      date_time: new Date(),
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
  await userPaymentService.delete(pay.id);
  await loadHistory(selectedItem.value.user_id);
  await loadStats();
};

watch(() => [filter.value.month, filter.value.year], () => loadStats());

onMounted(() => loadStats());
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active > div:last-child, .modal-leave-active > div:last-child {
  transition: transform 0.2s ease;
}
.modal-enter-from, .modal-leave-to {
  opacity: 0;
}
.modal-enter-from > div:last-child {
  transform: translateY(20px);
}
.modal-leave-to > div:last-child {
  transform: translateY(20px);
}
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
