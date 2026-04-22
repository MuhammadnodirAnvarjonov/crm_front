<template>
  <div class="space-y-5 animate-fadeIn pb-10">

    <!-- ── Banner ──────────────────────────────────────────────────────────── -->
    <div class="relative bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-3xl p-6 md:p-8 shadow-lg overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
      <div class="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>

      <div class="relative z-10 text-center md:text-left">
        <h2 class="text-2xl md:text-3xl font-bold mb-1">
          {{ $t('welcome') }}, {{ userStore.user?.user_name || 'Admin' }}!
        </h2>
        <p class="text-blue-100 max-w-lg">
          <span v-if="canReg" class="font-bold text-white">{{ data.stats.today_reg_count }} {{ $t('reception_count_label') }}</span>
          <template v-if="canReg && canEmerg">, </template>
          <span v-if="canEmerg" class="font-bold text-white">{{ data.stats.emergency_pending }} {{ $t('emergency_count_label') }}</span>
          <template v-if="canReg || canEmerg"> {{ $t('waiting_label') }}.</template>
        </p>
        <div class="mt-5 flex flex-wrap gap-3 justify-center md:justify-start">
          <router-link v-if="canReg" to="/registrations"
            class="bg-white text-blue-600 px-5 py-2.5 rounded-xl font-semibold shadow hover:bg-gray-50 transition active:scale-95 text-sm">
            {{ $t('add_reception') }}
          </router-link>
          <router-link v-if="canReports" to="/reports"
            class="bg-blue-700 bg-opacity-40 text-white border border-blue-400 px-5 py-2.5 rounded-xl font-semibold hover:bg-opacity-50 transition active:scale-95 text-sm">
            {{ $t('reports') }}
          </router-link>
        </div>
      </div>

      <div class="relative z-10 hidden md:block">
        <svg viewBox="0 0 24 24" class="w-36 drop-shadow-xl text-white/80" fill="none" stroke="currentColor" stroke-width="1">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      </div>
    </div>

    <!-- ── KPI kartochkalar ────────────────────────────────────────────────── -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      <KpiCard v-if="canPat"    :title="t('total_patients')"    :value="data.stats.total_patients"              icon="users"     color="bg-blue-50 text-blue-600"      :loading="loading" />
      <KpiCard v-if="canReg"    :title="t('today_receptions')"  :value="data.stats.today_reg_count"             icon="calendar"  color="bg-cyan-50 text-cyan-600"      :loading="loading" />
      <KpiCard v-if="canKassa"  :title="t('today_kassa')"       :value="fmtM(data.stats.today_kassa_summa)"     icon="dollar"    color="bg-green-50 text-green-600"    :loading="loading" />
      <KpiCard v-if="canKassa"  :title="t('monthly_kassa')"     :value="fmtM(data.stats.month_kassa_summa)"     icon="dollar"    color="bg-emerald-50 text-emerald-600" :loading="loading" />
      <KpiCard v-if="canEmerg"  :title="t('emergency_waiting')" :value="data.stats.emergency_pending"            icon="ambulance" color="bg-red-50 text-red-600"        :loading="loading" />
      <KpiCard v-if="canDirect" :title="t('unpaid_direct')"     :value="data.stats.direct_unpaid_count"         icon="alert"     color="bg-orange-50 text-orange-600"  :loading="loading" :sub="fmtM(data.stats.direct_unpaid_summa)" />
    </div>

    <!-- ══ BEMORLAR OQIMI (Registratsiya statistikasi) ════════════════════════ -->
    <div v-if="canReg" class="space-y-5">

      <!-- Sarlavha + davr tanlash + navigatsiya -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 class="text-lg font-bold text-gray-800">{{ $t('patient_flow') }}</h3>
        <div class="flex items-center gap-2 flex-wrap">
          <div class="flex bg-gray-100 rounded-xl p-0.5">
            <button v-for="p in allPeriods" :key="p.key"
              @click="changeFlowPeriod(p.key)"
              :class="[
                'px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-all',
                flowFilter.group_by === p.key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              ]">
              {{ p.label }}
            </button>
          </div>
          <!-- ← label → navigatsiya -->
          <div class="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
            <button @click="navFlow(-1)" class="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition text-sm font-bold">‹</button>
            <span class="px-3 py-1.5 text-xs font-semibold text-gray-700 min-w-[90px] text-center select-none">{{ getNavLabel(flowFilter.group_by, flowFilter.navDate) }}</span>
            <button @click="navFlow(1)" class="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition text-sm font-bold">›</button>
          </div>
        </div>
      </div>

      <!-- Asosiy card -->
      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="flex items-center gap-2 px-6 pt-5 pb-3 border-b border-gray-50">
          <div class="w-3 h-3 rounded-full bg-indigo-500"></div>
          <h4 class="text-sm font-bold text-gray-700">{{ $t('patient_flow') }}</h4>
        </div>

        <!-- KPI cardlar -->
        <div class="px-6 pt-4 pb-2">
          <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 xl:grid-cols-8 gap-2">
            <AnimatedKpiCard :title="t('today_registrations_count')" :value="flowData.today.reg_count"     color="blue"    :loading="flowLoading" />
            <AnimatedKpiCard :title="t('today_patients_count')"      :value="flowData.today.patient_count" color="cyan"    :loading="flowLoading" />
            <AnimatedKpiCard :title="t('month_registrations_count')" :value="flowData.month.reg_count"     color="emerald" :loading="flowLoading" />
            <AnimatedKpiCard :title="t('month_patients_count')"      :value="flowData.month.patient_count" color="green"   :loading="flowLoading" />
            <AnimatedKpiCard :title="t('year_registrations_count')"  :value="flowData.year.reg_count"      color="purple"  :loading="flowLoading" />
            <AnimatedKpiCard :title="t('year_patients_count')"       :value="flowData.year.patient_count"  color="orange"  :loading="flowLoading" />
            <AnimatedKpiCard :title="t('period_registrations')"      :value="flowData.period.reg_count"    color="gray"    :loading="flowLoading" />
            <AnimatedKpiCard :title="t('period_patients')"           :value="flowData.period.patient_count" color="gray"   :loading="flowLoading" />
          </div>
        </div>

        <!-- Grafik: qabullar va bemorlar soni -->
        <div class="px-6 pb-5 pt-2" style="min-height:280px">
          <v-chart v-if="!flowLoading && flowChartOption" :option="flowChartOption" autoresize style="height:260px;width:100%" />
          <ChartSkeleton v-else-if="flowLoading" />
          <div v-else class="flex items-center justify-center h-40 text-gray-300 text-sm">{{ $t('no_data') }}</div>
        </div>

        <!-- Bo'limlar bo'yicha + Status bo'yicha -->
        <div v-if="!flowLoading && (flowData.by_section.length || flowData.by_status.length)"
          class="px-6 pb-5 grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div v-if="flowData.by_section.length">
            <h4 class="text-sm font-bold text-gray-600 mb-2">{{ $t('by_section') }}</h4>
            <div class="space-y-1.5">
              <div v-for="(sec, i) in flowData.by_section" :key="i" class="flex items-center gap-2">
                <span class="text-xs text-gray-500 w-28 truncate" :title="sec.section_name">{{ sec.section_name || '-' }}</span>
                <div class="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div class="bg-indigo-500 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-1.5"
                    :style="{ width: Math.max((sec.count / maxSectionCount) * 100, 8) + '%' }">
                    <span class="text-[10px] text-white font-bold">{{ sec.count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="flowData.by_status.length">
            <h4 class="text-sm font-bold text-gray-600 mb-2">{{ $t('by_status_today') }}</h4>
            <div class="grid grid-cols-2 gap-2">
              <div v-for="st in flowData.by_status" :key="st.status"
                class="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p class="text-xs text-gray-500">{{ st.status }}</p>
                <p class="text-lg font-bold text-gray-800">{{ st.count }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ REGISTER STATISTIKASI (Kirim / Chiqim) ════════════════════════════ -->
    <div v-if="canKassa" class="space-y-5">

      <!-- Global sarlavha + davr + navigatsiya -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 class="text-lg font-bold text-gray-800">{{ $t('register_income_expense') }}</h3>
        <div class="flex items-center gap-2 flex-wrap">
          <div class="flex bg-gray-100 rounded-xl p-0.5">
            <button v-for="p in allPeriods" :key="p.key"
              @click="changeGlobalRegPeriod(p.key)"
              :class="[
                'px-2.5 py-1.5 text-[11px] font-semibold rounded-lg transition-all',
                globalRegFilter.group_by === p.key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              ]">
              {{ p.label }}
            </button>
          </div>
          <div class="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
            <button @click="navGlobalReg(-1)" class="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition text-sm font-bold">‹</button>
            <span class="px-3 py-1.5 text-xs font-semibold text-gray-700 min-w-[90px] text-center select-none">{{ getNavLabel(globalRegFilter.group_by, globalRegFilter.navDate) }}</span>
            <button @click="navGlobalReg(1)" class="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition text-sm font-bold">›</button>
          </div>
        </div>
      </div>

      <!-- ─── Har bir register: card + grafik ─── -->
      <div v-for="reg in registerTabs" :key="reg.key"
        class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

        <!-- Header: nom + alohida davr + sana -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-6 pt-5 pb-3 border-b border-gray-50">
          <div class="flex items-center gap-2">
            <div :class="`w-3 h-3 rounded-full ${reg.dotColor}`"></div>
            <h4 class="text-sm font-bold text-gray-700">{{ reg.label }}</h4>
          </div>
          <!-- Per-card filter -->
          <div class="flex items-center gap-1.5 flex-wrap">
            <div class="flex bg-gray-100 rounded-lg p-0.5">
              <button v-for="p in allPeriods" :key="p.key"
                @click="changePerRegPeriod(reg.key, p.key)"
                :class="[
                  'px-2 py-1 text-[10px] font-semibold rounded-md transition-all',
                  getEffectiveRegFilter(reg.key).group_by === p.key ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                ]">
                {{ p.short }}
              </button>
            </div>
            <div class="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
              <button @click="navPerReg(reg.key, -1)" class="px-1.5 py-1 text-gray-400 hover:bg-gray-50 hover:text-blue-600 transition text-xs font-bold">‹</button>
              <span class="px-2 py-1 text-[10px] font-semibold text-gray-600 min-w-[70px] text-center select-none">{{ getNavLabel(getEffectiveRegFilter(reg.key).group_by, getEffectiveRegFilter(reg.key).navDate) }}</span>
              <button @click="navPerReg(reg.key, 1)" class="px-1.5 py-1 text-gray-400 hover:bg-gray-50 hover:text-blue-600 transition text-xs font-bold">›</button>
            </div>
            <button v-if="perRegFilter[reg.key]" @click="resetPerRegFilter(reg.key)"
              class="h-7 px-1.5 text-[10px] text-red-500 hover:bg-red-50 rounded-lg transition" :title="t('reset')">✕</button>
          </div>
        </div>

        <!-- Cardlar -->
        <div class="px-6 pt-4 pb-2">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-2">
            <AnimatedKpiCard :title="t('today_income')"   :value="getRegStat(reg.key, 'today_kirim')"  :count="getRegStat(reg.key, 'today_kirim_count')"  color="green"   :loading="isRegCardLoading(reg.key)" />
            <AnimatedKpiCard :title="t('today_expense')"  :value="getRegStat(reg.key, 'today_chiqim')" :count="getRegStat(reg.key, 'today_chiqim_count')" color="red"     :loading="isRegCardLoading(reg.key)" />
            <AnimatedKpiCard :title="t('month_income')"   :value="getRegStat(reg.key, 'month_kirim')"  :count="getRegStat(reg.key, 'month_kirim_count')"  color="emerald" :loading="isRegCardLoading(reg.key)" />
            <AnimatedKpiCard :title="t('month_expense')"  :value="getRegStat(reg.key, 'month_chiqim')" :count="getRegStat(reg.key, 'month_chiqim_count')" color="orange"  :loading="isRegCardLoading(reg.key)" />
            <AnimatedKpiCard :title="t('period_income')"  :value="getRegStat(reg.key, 'total_kirim')"  :count="getRegStat(reg.key, 'kirim_count')"        color="blue"    :loading="isRegCardLoading(reg.key)" />
            <AnimatedKpiCard :title="t('period_expense')" :value="getRegStat(reg.key, 'total_chiqim')" :count="getRegStat(reg.key, 'chiqim_count')"       color="purple"  :loading="isRegCardLoading(reg.key)" />
            <AnimatedKpiCard :title="t('balance')"        :value="getRegStat(reg.key, 'balance')"      color="cyan"    :loading="isRegCardLoading(reg.key)" :highlight="true" />
          </div>
        </div>

        <!-- Grafik (shu register uchun) -->
        <div class="px-6 pb-5 pt-2" style="min-height:250px">
          <v-chart v-if="!isRegCardLoading(reg.key) && getRegChartOption(reg.key)" :option="getRegChartOption(reg.key)" autoresize style="height:240px;width:100%" />
          <ChartSkeleton v-else-if="isRegCardLoading(reg.key)" />
          <div v-else class="flex items-center justify-center h-40 text-gray-300 text-sm">{{ $t('no_data') }}</div>
        </div>
      </div>

      <!-- ─── Kassa: To'lov turi + Manba bo'yicha ─── -->
      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <!-- To'lov turi donut -->
          <div style="min-height:280px">
            <h4 class="text-sm font-bold text-gray-600 mb-2">{{ $t('by_pay_type') }}</h4>
            <v-chart v-if="!regLoading && regPayTypeChartOption" :option="regPayTypeChartOption" autoresize style="height:260px;width:100%" />
            <ChartSkeleton v-else-if="regLoading" />
          </div>
          <!-- Manba bo'yicha (doc_type) -->
          <div v-if="!regLoading && regData.charts.by_doc_type.length">
            <h4 class="text-sm font-bold text-gray-600 mb-3">{{ $t('by_source') }}</h4>
            <div class="grid grid-cols-2 gap-2">
              <div v-for="item in regData.charts.by_doc_type" :key="item.doc_type + item.type"
                class="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p class="text-xs text-gray-500">{{ docTypeLabel(item.doc_type) }} <span :class="item.type === 'kirim' ? 'text-green-600' : 'text-red-500'">({{ item.type }})</span></p>
                <p class="text-sm font-bold text-gray-800 mt-1">{{ fmtM(item.total) }}</p>
                <p class="text-xs text-gray-400">{{ item.count }} ta</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Grafiklar qatori ────────────────────────────────────────────────── -->
    <div v-if="canReg || canKassa" class="grid grid-cols-1 xl:grid-cols-3 gap-5">

      <!-- Oylik qabullar (bar chart) -->
      <div v-if="canReg" :class="canKassa ? 'xl:col-span-2' : 'xl:col-span-3'"
        class="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-gray-800">{{ $t('monthly_receptions') }}</h3>
          <span class="text-xs text-gray-400">{{ $t('last_6_months') }}</span>
        </div>
        <div class="flex-1" style="min-height:220px">
          <v-chart v-if="!loading && regChartOption" :option="regChartOption" autoresize style="height:220px;width:100%" />
          <ChartSkeleton v-else />
        </div>
      </div>

      <!-- To'lov turi (donut) -->
      <div v-if="canKassa" :class="canReg ? '' : 'xl:col-span-3'"
        class="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 flex flex-col">
        <h3 class="font-bold text-gray-800 mb-4">{{ $t('payment_types_month') }}</h3>
        <div class="flex-1" style="min-height:220px">
          <v-chart v-if="!loading && payTypeChartOption" :option="payTypeChartOption" autoresize style="height:220px;width:100%" />
          <ChartSkeleton v-else />
        </div>
      </div>
    </div>

    <!-- ── Kassa grafigi (line) + Emergency status donut ─────────────────── -->
    <div v-if="canKassa || canEmerg" class="grid grid-cols-1 xl:grid-cols-3 gap-5">

      <!-- Oylik kassa grafigi -->
      <div v-if="canKassa" :class="canEmerg ? 'xl:col-span-2' : 'xl:col-span-3'"
        class="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-bold text-gray-800">{{ $t('monthly_kassa_income') }}</h3>
          <span class="text-xs text-gray-400">{{ $t('last_6_months') }} ({{ $t('som') }})</span>
        </div>
        <div class="flex-1" style="min-height:200px">
          <v-chart v-if="!loading && kassaChartOption" :option="kassaChartOption" autoresize style="height:200px;width:100%" />
          <ChartSkeleton v-else />
        </div>
      </div>

      <!-- Tez yordam statuslari -->
      <div v-if="canEmerg" :class="canKassa ? '' : 'xl:col-span-3'"
        class="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 flex flex-col">
        <h3 class="font-bold text-gray-800 mb-4">{{ $t('emergency_statuses') }}</h3>
        <div class="flex-1" style="min-height:200px">
          <v-chart v-if="!loading && emergencyChartOption" :option="emergencyChartOption" autoresize style="height:200px;width:100%" />
          <div v-else-if="!loading" class="flex items-center justify-center h-full text-gray-400 text-sm">{{ $t('no_info') }}</div>
          <ChartSkeleton v-else />
        </div>
      </div>
    </div>

    <!-- ── So'nggi tez yordam + Bugungi qabullar ──────────────────────────── -->
    <div v-if="canReg" class="grid grid-cols-1 lg:grid-cols-2 gap-5">

      <!-- Tez yordam qo'ng'iroqlari -->
      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
        <div class="flex justify-between items-center">
          <h3 class="font-bold text-gray-800 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block"></span>
            {{ $t('recent_emergency') }}
          </h3>
          <router-link to="/emergency" class="text-xs text-blue-500 hover:underline">{{ $t('view_all') }}</router-link>
        </div>

        <div v-if="loading" class="space-y-2">
          <div v-for="i in 5" :key="i" class="h-10 bg-gray-100 animate-pulse rounded-xl"></div>
        </div>

        <div v-else-if="!data.lists.recent_emergency.length"
          class="text-center text-gray-400 text-sm py-8">
          {{ $t('no_emergency_calls') }}
        </div>

        <div v-else class="overflow-auto">
          <table class="w-full text-sm">
            <thead class="text-xs text-gray-400 border-b">
              <tr>
                <th class="pb-2 text-left font-medium">#</th>
                <th class="pb-2 text-left font-medium">{{ $t('patient') }}</th>
                <th class="pb-2 text-left font-medium">{{ $t('phone') }}</th>
                <th class="pb-2 text-left font-medium">{{ $t('status') }}</th>
                <th class="pb-2 text-left font-medium">{{ $t('time') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(emg, i) in data.lists.recent_emergency" :key="emg.id"
                class="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                <td class="py-2 text-xs text-blue-500 font-bold">{{ i + 1 }}</td>
                <td class="py-2 font-semibold text-gray-700">
                  {{ emg.patient?.full_name || $t('unknown') }}
                </td>
                <td class="py-2 text-gray-500 text-xs">
                  {{ emg.patient?.phone1 || emg.phone || '-' }}
                </td>
                <td class="py-2">
                  <EmgBadge :status="emg.status" />
                </td>
                <td class="py-2 text-gray-400 text-xs whitespace-nowrap">
                  {{ fmtDt(emg.createdAt) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Bugungi qabullar -->
      <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
        <div class="flex justify-between items-center">
          <h3 class="font-bold text-gray-800">{{ $t('today_receptions') }}</h3>
          <router-link to="/registrations" class="text-xs text-blue-500 hover:underline">{{ $t('view_all') }}</router-link>
        </div>

        <div v-if="loading" class="space-y-2">
          <div v-for="i in 5" :key="i" class="h-10 bg-gray-100 animate-pulse rounded-xl"></div>
        </div>

        <div v-else-if="!data.lists.today_registrations.length"
          class="text-center text-gray-400 text-sm py-8">
          {{ $t('no_receptions_today') }}
        </div>

        <div v-else class="overflow-auto">
          <table class="w-full text-sm">
            <thead class="text-xs text-gray-400 border-b">
              <tr>
                <th class="pb-2 text-left font-medium">#</th>
                <th class="pb-2 text-left font-medium">{{ $t('patient') }}</th>
                <th class="pb-2 text-left font-medium">{{ $t('doctor') }}</th>
                <th class="pb-2 text-right font-medium">{{ $t('summa') }}</th>
                <th class="pb-2 text-left font-medium">{{ $t('status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(reg, i) in data.lists.today_registrations" :key="reg.id"
                class="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                <td class="py-2 text-xs text-blue-500 font-bold">{{ i + 1 }}</td>
                <td class="py-2 font-semibold text-gray-700">{{ reg.patient?.full_name || '-' }}</td>
                <td class="py-2 text-gray-500 text-xs">{{ reg.user?.user_name || '-' }}</td>
                <td class="py-2 text-right text-blue-700 font-medium">{{ fmtM(reg.summa) }}</td>
                <td class="py-2">
                  <RegBadge :status="reg.status" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, defineComponent, h } from 'vue';
import { useI18n } from 'vue-i18n';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  TooltipComponent, GridComponent, LegendComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';

import reportService from '@/services/report.service';
import { useUserStore } from '@/stores/user';
import { useSummaFormat } from '@/composables/NumberFormat';

use([CanvasRenderer, BarChart, LineChart, PieChart, TooltipComponent, GridComponent, LegendComponent]);

const { t } = useI18n();
const userStore = useUserStore();
const loading = ref(true);

// ── Dashboard ruxsatlari (settings.dashboard dan olinadi) ──────────────────
const canDash = (key) => {
  const dashboard = userStore.roleSettings?.dashboard;
  if (!dashboard) return true;              // dashboard settings yo'q = hamma ko'rinadi
  if (!(key in dashboard)) return true;     // key yo'q = default yoqilgan
  return !!dashboard[key];
};
const canReg     = computed(() => canDash('registration'));
const canKassa   = computed(() => canDash('kassa'));
const canDirect  = computed(() => canDash('direct'));
const canPat     = computed(() => canDash('patients'));
const canEmerg   = computed(() => canDash('emergency'));
const canReports = computed(() => canDash('kassa'));

// ── Boshlang'ich holat ────────────────────────────────────────────────────
const data = ref({
  stats: {
    total_patients: 0, today_reg_count: 0,
    today_kassa_summa: 0, month_kassa_summa: 0,
    emergency_pending: 0, direct_unpaid_count: 0, direct_unpaid_summa: 0,
  },
  charts: { monthly_registrations: [], monthly_kassa: [], kassa_by_pay_type: [], emergency_by_status: [] },
  lists: { recent_emergency: [], today_registrations: [] },
});

// ── Helpers ───────────────────────────────────────────────────────────────
const fmtM = (v) => useSummaFormat(v || 0, 'uz-UZ', 0);
const fmtDt = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleString('uz-UZ', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};
const MONTHS = ['Yan','Fev','Mar','Apr','May','Iyun','Iyul','Avg','Sen','Okt','Noy','Dek'];
const fmtMonth = (ym) => { if (!ym) return ''; const [,m] = ym.split('-'); return MONTHS[+m - 1] || ym; };

// ── Chart options ──────────────────────────────────────────────────────────
const regChartOption = computed(() => {
  const items = data.value.charts.monthly_registrations;
  if (!items.length) return null;
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 36, right: 10, top: 10, bottom: 28 },
    xAxis: { type: 'category', data: items.map(i => fmtMonth(i.month)), axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value', minInterval: 1, axisLabel: { fontSize: 10 } },
    series: [{
      name: t('receptions'), type: 'bar',
      data: items.map(i => Number(i.count)),
      itemStyle: { borderRadius: [5,5,0,0], color: '#0ea5e9' },
      barMaxWidth: 44,
    }],
  };
});

const kassaChartOption = computed(() => {
  const items = data.value.charts.monthly_kassa;
  if (!items.length) return null;
  return {
    tooltip: { trigger: 'axis', formatter: (p) => `${p[0].name}<br/>${useSummaFormat(p[0].value,'uz-UZ',0)} ${t('som')}` },
    grid: { left: 56, right: 10, top: 10, bottom: 28 },
    xAxis: { type: 'category', data: items.map(i => fmtMonth(i.month)), axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10, formatter: (v) => v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v } },
    series: [{
      name: t('kassa'), type: 'line',
      data: items.map(i => Number(i.total)),
      smooth: true,
      areaStyle: { color: 'rgba(16,185,129,0.12)' },
      lineStyle: { color: '#10b981', width: 2 },
      itemStyle: { color: '#10b981' },
      symbol: 'circle', symbolSize: 6,
    }],
  };
});

const payTypeChartOption = computed(() => {
  const items = data.value.charts.kassa_by_pay_type;
  if (!items.length) return null;
  const colors = { naqd: '#22c55e', plastik: '#3b82f6', bank: '#8b5cf6' };
  return {
    tooltip: { trigger: 'item', formatter: (p) => `${p.name}: ${useSummaFormat(p.value,'uz-UZ',0)} ${t('som')} (${p.percent}%)` },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    series: [{
      type: 'pie', radius: ['40%','70%'], center: ['50%','43%'],
      data: items.map(i => ({ name: i.pay_type || 'other', value: Number(i.total), itemStyle: { color: colors[i.pay_type] || '#94a3b8' } })),
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 13, fontWeight: 'bold' } },
    }],
  };
});

const emergencyChartOption = computed(() => {
  const items = data.value.charts.emergency_by_status;
  if (!items.length) return null;
  const colorMap = { pending:'#f97316', accepted:'#3b82f6', on_way:'#8b5cf6', completed:'#22c55e', cancelled:'#94a3b8' };
  const labelMap = { pending: t('pending'), accepted: t('accepted_status'), on_way: t('on_way'), completed: t('finished'), cancelled: t('cancelled') };
  return {
    tooltip: { trigger: 'item', formatter: (p) => `${p.name}: ${p.value} ta (${p.percent}%)` },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    series: [{
      type: 'pie', radius: ['35%','65%'], center: ['50%','43%'],
      data: items.map(i => ({ name: labelMap[i.status] || i.status, value: Number(i.count), itemStyle: { color: colorMap[i.status] || '#94a3b8' } })),
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 13, fontWeight: 'bold' } },
    }],
  };
});

// ── Universal davr tanlovlari + navigatsiya ─────────────────────────────
const allPeriods = computed(() => [
  { key: 'hourly',  label: t('hourly'),       short: 'S' },
  { key: 'daily',   label: t('daily'),        short: 'K' },
  { key: 'weekly',  label: t('weekly'),       short: 'H' },
  { key: 'monthly', label: t('monthly_label'), short: 'O' },
  { key: 'yearly',  label: t('yearly'),       short: 'Y' },
]);

const fmtDateParam = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Navigatsiya: davr turi va sanadan datetime1/datetime2 hisoblash
const getNavRange = (groupBy, navDate) => {
  const d = new Date(navDate);
  let dt1, dt2;
  switch (groupBy) {
    case 'hourly':
      dt1 = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      dt2 = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
      break;
    case 'daily':
      dt1 = new Date(d.getFullYear(), d.getMonth(), 1);
      dt2 = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      break;
    case 'weekly':
      dt1 = new Date(d.getFullYear(), d.getMonth(), 1);
      dt2 = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      break;
    case 'monthly':
      dt1 = new Date(d.getFullYear(), 0, 1);
      dt2 = new Date(d.getFullYear(), 11, 31, 23, 59, 59);
      break;
    case 'yearly': {
      const sy = d.getFullYear() - 2;
      dt1 = new Date(sy, 0, 1);
      dt2 = new Date(sy + 4, 11, 31, 23, 59, 59);
      break;
    }
    default:
      dt1 = new Date(d.getFullYear(), 0, 1);
      dt2 = new Date(d.getFullYear(), 11, 31, 23, 59, 59);
  }
  return { datetime1: fmtDateParam(dt1), datetime2: fmtDateParam(dt2) };
};

// ← → bosilganda sanani siljitish
const shiftNavDate = (groupBy, navDate, dir) => {
  const d = new Date(navDate);
  switch (groupBy) {
    case 'hourly': d.setDate(d.getDate() + dir); break;
    case 'daily': d.setDate(d.getDate() + dir); break;
    case 'weekly': d.setMonth(d.getMonth() + dir); break;
    case 'monthly': d.setFullYear(d.getFullYear() + dir); break;
    case 'yearly': d.setFullYear(d.getFullYear() + dir * 5); break;
  }
  return d;
};

// Navigatsiya label: "09.03.2026", "Mart 2026", "2026", "2022–2026"
const getNavLabel = (groupBy, navDate) => {
  const d = new Date(navDate);
  switch (groupBy) {
    case 'hourly':
      return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
    case 'daily':
      return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
    case 'weekly':
      return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    case 'monthly':
      return String(d.getFullYear());
    case 'yearly': {
      const sy = d.getFullYear() - 2;
      return `${sy}–${sy + 4}`;
    }
    default: return '';
  }
};

const fmtPeriodLabel = (period, groupBy) => {
  if (!period) return '';
  switch (groupBy) {
    case 'hourly': return period.split(' ')[1] || period;
    case 'daily': {
      const d = new Date(period);
      return `${d.getDate()}/${d.getMonth()+1}`;
    }
    case 'weekly': {
      const [,w] = period.split('-');
      return `${w}-${t('week_short')}`;
    }
    case 'monthly': return fmtMonth(period);
    case 'yearly': return period;
    default: return period;
  }
};

// ══ BEMORLAR OQIMI (registratsiya statistikasi) ══════════════════════════
const flowLoading = ref(true);
const flowFilter = ref({ group_by: 'monthly', navDate: new Date() });

const emptyFlowPeriodStats = () => ({ reg_count: 0, patient_count: 0, total_summa: 0, total_pay_summa: 0 });

const flowData = ref({
  today: emptyFlowPeriodStats(),
  month: emptyFlowPeriodStats(),
  year: emptyFlowPeriodStats(),
  period: emptyFlowPeriodStats(),
  time_grouped: [],
  by_status: [],
  by_section: [],
});

const maxSectionCount = computed(() => {
  const sections = flowData.value.by_section;
  if (!sections.length) return 1;
  return Math.max(...sections.map(s => Number(s.count) || 1));
});

const loadRegistrationFlow = async () => {
  flowLoading.value = true;
  try {
    const { datetime1, datetime2 } = getNavRange(flowFilter.value.group_by, flowFilter.value.navDate);
    const params = {
      branch_id: userStore.user?.branch_id,
      group_by: flowFilter.value.group_by,
      datetime1, datetime2,
    };
    if (flowFilter.value.group_by === 'daily' || flowFilter.value.group_by === 'hourly') {
      params.selected_date = fmtDateParam(new Date(flowFilter.value.navDate));
    }
    const res = await reportService.registrationFlow(params);
    if (res) {
      flowData.value = {
        today: res.today || emptyFlowPeriodStats(),
        month: res.month || emptyFlowPeriodStats(),
        year: res.year || emptyFlowPeriodStats(),
        period: res.period || emptyFlowPeriodStats(),
        time_grouped: res.time_grouped || [],
        by_status: res.by_status || [],
        by_section: res.by_section || [],
      };
    }
  } catch (e) {
    console.error('Registration flow xatosi:', e);
  } finally {
    flowLoading.value = false;
  }
};

const changeFlowPeriod = (key) => {
  flowFilter.value.group_by = key;
  flowFilter.value.navDate = new Date();
  loadRegistrationFlow();
};

const navFlow = (dir) => {
  flowFilter.value.navDate = shiftNavDate(flowFilter.value.group_by, flowFilter.value.navDate, dir);
  loadRegistrationFlow();
};

const flowChartOption = computed(() => {
  const items = flowData.value.time_grouped;
  if (!items.length) return null;
  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let html = `<b>${params[0].name}</b><br/>`;
        params.forEach(p => { html += `${p.marker} ${p.seriesName}: ${p.value}<br/>`; });
        return html;
      },
    },
    legend: { data: [t('registrations_count'), t('patients_count')], bottom: 0, textStyle: { fontSize: 11 } },
    grid: { left: 46, right: 16, top: 16, bottom: 36 },
    xAxis: {
      type: 'category',
      data: items.map(i => fmtPeriodLabel(i.period, flowFilter.value.group_by)),
      axisLabel: { fontSize: 10, rotate: items.length > 15 ? 45 : 0 },
    },
    yAxis: { type: 'value', minInterval: 1, axisLabel: { fontSize: 10 } },
    series: [
      {
        name: t('registrations_count'), type: 'bar',
        data: items.map(i => Number(i.reg_count)),
        itemStyle: { borderRadius: [4, 4, 0, 0], color: '#6366f1' },
        barMaxWidth: 36,
      },
      {
        name: t('patients_count'), type: 'line',
        data: items.map(i => Number(i.patient_count)),
        smooth: true,
        lineStyle: { color: '#0ea5e9', width: 2 },
        itemStyle: { color: '#0ea5e9' },
        symbol: 'circle', symbolSize: 6,
      },
    ],
  };
});

// ══ REGISTER STATISTIKASI (kirim/chiqim) ══════════════════════════════════
const regLoading = ref(true);
const globalRegFilter = ref({ group_by: 'monthly', navDate: new Date() });
const perRegFilter = ref({});          // { kassa: { group_by, navDate }, ... }
const perRegLoading = ref({});         // { kassa: true, ... }

const emptyRegStats = () => ({
  total_kirim: 0, total_chiqim: 0, balance: 0,
  kirim_count: 0, chiqim_count: 0, total_count: 0, total_discount: 0,
  today_kirim: 0, today_chiqim: 0, today_kirim_count: 0, today_chiqim_count: 0,
  month_kirim: 0, month_chiqim: 0, month_kirim_count: 0, month_chiqim_count: 0,
});

const regData = ref({
  registers: {
    kassa:   { stats: emptyRegStats(), time_grouped: [] },
    service: { stats: emptyRegStats(), time_grouped: [] },
    palata:  { stats: emptyRegStats(), time_grouped: [] },
    patient: { stats: emptyRegStats(), time_grouped: [] },
    product: { stats: emptyRegStats(), time_grouped: [] },
  },
  charts: { by_pay_type: [], by_doc_type: [] },
});

const registerTabs = computed(() => [
  { key: 'kassa',   label: t('reg_kassa'),   dotColor: 'bg-green-500' },
  { key: 'service', label: t('reg_service'), dotColor: 'bg-blue-500' },
  { key: 'palata',  label: t('reg_palata'),  dotColor: 'bg-purple-500' },
  { key: 'patient', label: t('reg_patient'), dotColor: 'bg-cyan-500' },
  { key: 'product', label: t('reg_product'), dotColor: 'bg-orange-500' },
]);

const getRegStat = (regKey, statKey) => {
  return regData.value.registers?.[regKey]?.stats?.[statKey] || 0;
};

const getEffectiveRegFilter = (regKey) => {
  return perRegFilter.value[regKey] || globalRegFilter.value;
};

const isRegCardLoading = (regKey) => {
  return perRegFilter.value[regKey] ? !!perRegLoading.value[regKey] : regLoading.value;
};

// ── Global register stats yuklash ────────────────────────────────────────
const loadAllRegisterStats = async () => {
  regLoading.value = true;
  try {
    const { datetime1, datetime2 } = getNavRange(globalRegFilter.value.group_by, globalRegFilter.value.navDate);
    const params = {
      branch_id: userStore.user?.branch_id,
      group_by: globalRegFilter.value.group_by,
      datetime1, datetime2,
    };
    if (globalRegFilter.value.group_by === 'daily' || globalRegFilter.value.group_by === 'hourly') {
      params.selected_date = fmtDateParam(new Date(globalRegFilter.value.navDate));
    }
    const res = await reportService.registerStats(params);
    if (res) {
      const regs = res.registers || {};
      for (const key of Object.keys(regs)) {
        if (!perRegFilter.value[key]) {
          regData.value.registers[key] = regs[key];
        }
      }
      regData.value.charts = res.charts || regData.value.charts;
    }
  } catch (e) {
    console.error('Register stats xatosi:', e);
  } finally {
    regLoading.value = false;
  }
};

const changeGlobalRegPeriod = (key) => {
  globalRegFilter.value.group_by = key;
  globalRegFilter.value.navDate = new Date();
  loadAllRegisterStats();
};

const navGlobalReg = (dir) => {
  globalRegFilter.value.navDate = shiftNavDate(globalRegFilter.value.group_by, globalRegFilter.value.navDate, dir);
  loadAllRegisterStats();
};

// ── Per-register individual yuklash ──────────────────────────────────────
const loadSingleRegisterStats = async (regKey) => {
  perRegLoading.value[regKey] = true;
  try {
    const f = perRegFilter.value[regKey];
    const { datetime1, datetime2 } = getNavRange(f.group_by, f.navDate);
    const params = {
      branch_id: userStore.user?.branch_id,
      group_by: f.group_by,
      datetime1, datetime2,
    };
    if (f.group_by === 'daily' || f.group_by === 'hourly') {
      params.selected_date = fmtDateParam(new Date(f.navDate));
    }
    const res = await reportService.registerStats(params);
    if (res?.registers?.[regKey]) {
      regData.value.registers[regKey] = res.registers[regKey];
    }
  } catch (e) {
    console.error(`Register ${regKey} stats xatosi:`, e);
  } finally {
    perRegLoading.value[regKey] = false;
  }
};

const changePerRegPeriod = (regKey, periodKey) => {
  if (!perRegFilter.value[regKey]) {
    perRegFilter.value[regKey] = {
      group_by: periodKey,
      navDate: new Date(globalRegFilter.value.navDate),
    };
  } else {
    perRegFilter.value[regKey].group_by = periodKey;
    perRegFilter.value[regKey].navDate = new Date();
  }
  loadSingleRegisterStats(regKey);
};

const navPerReg = (regKey, dir) => {
  if (!perRegFilter.value[regKey]) {
    perRegFilter.value[regKey] = {
      group_by: globalRegFilter.value.group_by,
      navDate: new Date(globalRegFilter.value.navDate),
    };
  }
  perRegFilter.value[regKey].navDate = shiftNavDate(
    perRegFilter.value[regKey].group_by,
    perRegFilter.value[regKey].navDate,
    dir
  );
  loadSingleRegisterStats(regKey);
};

const resetPerRegFilter = (regKey) => {
  delete perRegFilter.value[regKey];
  delete perRegLoading.value[regKey];
  loadAllRegisterStats();
};

// doc_type labellar
const docTypeLabel = (dt) => {
  const key = 'src_' + dt;
  const translated = t(key);
  return translated !== key ? translated : dt || '-';
};

// ── Register vaqt grafigi (har bir register uchun alohida) ─────────────────
const getRegChartOption = (regKey) => {
  const items = regData.value.registers?.[regKey]?.time_grouped || [];
  if (!items.length) return null;
  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let html = `<b>${params[0].name}</b><br/>`;
        params.forEach(p => {
          html += `${p.marker} ${p.seriesName}: ${useSummaFormat(p.value, 'uz-UZ', 0)} so'm<br/>`;
        });
        return html;
      }
    },
    legend: { data: [t('income'), t('expense')], bottom: 0, textStyle: { fontSize: 11 } },
    grid: { left: 56, right: 16, top: 16, bottom: 36 },
    xAxis: {
      type: 'category',
      data: items.map(i => fmtPeriodLabel(i.period, getEffectiveRegFilter(regKey).group_by)),
      axisLabel: { fontSize: 10, rotate: items.length > 15 ? 45 : 0 },
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontSize: 10, formatter: (v) => v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v >= 1e3 ? (v/1e3).toFixed(0)+'K' : v },
    },
    series: [
      {
        name: t('income'), type: 'bar',
        data: items.map(i => Number(i.kirim)),
        itemStyle: { borderRadius: [4,4,0,0], color: '#22c55e' },
        barMaxWidth: 36,
      },
      {
        name: t('expense'), type: 'bar',
        data: items.map(i => Number(i.chiqim)),
        itemStyle: { borderRadius: [4,4,0,0], color: '#ef4444' },
        barMaxWidth: 36,
      },
    ],
  };
};

// ── Register to'lov turi donut ────────────────────────────────────────────
const regPayTypeChartOption = computed(() => {
  const items = regData.value.charts.by_pay_type;
  if (!items.length) return null;
  const chartData = items.map(i => {
    const pt = i.pay_type || i.dataValues?.pay_type || {};
    const name = pt.name_uz || pt.name || 'Boshqa';
    const color = pt.color || '#94a3b8';
    return {
      name: `${name} (${i.type || i.dataValues?.type || ''})`,
      value: Number(i.dataValues?.total || i.total || 0),
      itemStyle: { color },
    };
  });
  return {
    tooltip: { trigger: 'item', formatter: (p) => `${p.name}: ${useSummaFormat(p.value,'uz-UZ',0)} so'm (${p.percent}%)` },
    legend: { bottom: 0, textStyle: { fontSize: 10 }, type: 'scroll' },
    series: [{
      type: 'pie', radius: ['35%','65%'], center: ['50%','43%'],
      data: chartData,
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 12, fontWeight: 'bold' } },
    }],
  };
});

// ── Animated KPI Card component ───────────────────────────────────────────
const AnimatedKpiCard = defineComponent({
  props: ['title', 'value', 'count', 'color', 'loading', 'highlight'],
  setup(props) {
    const displayed = ref(0);
    let animFrame = null;

    const colorClasses = {
      green: 'from-green-50 to-green-100 border-green-200',
      red: 'from-red-50 to-red-100 border-red-200',
      emerald: 'from-emerald-50 to-emerald-100 border-emerald-200',
      orange: 'from-orange-50 to-orange-100 border-orange-200',
      blue: 'from-blue-50 to-blue-100 border-blue-200',
      purple: 'from-purple-50 to-purple-100 border-purple-200',
      cyan: 'from-cyan-50 to-cyan-100 border-cyan-200',
      gray: 'from-gray-50 to-gray-100 border-gray-200',
    };
    const textColors = {
      green: 'text-green-700', red: 'text-red-600', emerald: 'text-emerald-700',
      orange: 'text-orange-700', blue: 'text-blue-700', purple: 'text-purple-700',
      cyan: 'text-cyan-700', gray: 'text-gray-600',
    };

    const animateTo = (target) => {
      const numTarget = Number(target) || 0;
      const start = displayed.value;
      const diff = numTarget - start;
      if (Math.abs(diff) < 1) { displayed.value = numTarget; return; }
      const duration = 800;
      const startTime = performance.now();
      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutExpo
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        displayed.value = start + diff * ease;
        if (progress < 1) {
          animFrame = requestAnimationFrame(step);
        } else {
          displayed.value = numTarget;
        }
      };
      if (animFrame) cancelAnimationFrame(animFrame);
      animFrame = requestAnimationFrame(step);
    };

    watch(() => props.value, (newVal) => {
      animateTo(newVal);
    }, { immediate: true });

    onUnmounted(() => {
      if (animFrame) cancelAnimationFrame(animFrame);
    });

    return () => {
      if (props.loading) {
        return h('div', { class: 'rounded-2xl border p-3 animate-pulse bg-gray-50' }, [
          h('div', { class: 'h-3 bg-gray-200 rounded mb-2 w-2/3' }),
          h('div', { class: 'h-5 bg-gray-200 rounded w-1/2' }),
        ]);
      }
      const cc = colorClasses[props.color] || colorClasses.gray;
      const tc = textColors[props.color] || textColors.gray;
      return h('div', {
        class: `rounded-2xl border p-3 bg-gradient-to-br ${cc} transition-all hover:shadow-md ${props.highlight ? 'ring-2 ring-cyan-300' : ''}`,
      }, [
        h('p', { class: 'text-[10px] text-gray-500 leading-tight mb-1 truncate', title: props.title }, props.title),
        h('p', { class: `text-base font-bold ${tc} leading-tight` },
          useSummaFormat(Math.round(displayed.value), 'uz-UZ', 0)
        ),
        props.count !== undefined && props.count !== null
          ? h('p', { class: 'text-[10px] text-gray-400 mt-0.5' }, `${props.count} ta`)
          : null,
      ]);
    };
  },
});

// ── Inline sub-komponentlar ───────────────────────────────────────────────
const KpiCard = defineComponent({
  props: ['title', 'value', 'icon', 'color', 'loading', 'sub'],
  setup(props) {
    const iconPaths = {
      users:     'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      calendar:  'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      dollar:    'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      ambulance: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      alert:     'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    };
    return () => {
      if (props.loading) {
        return h('div', { class: 'bg-white rounded-3xl border border-gray-100 p-4 animate-pulse' }, [
          h('div', { class: 'h-4 bg-gray-200 rounded mb-3 w-2/3' }),
          h('div', { class: 'h-7 bg-gray-200 rounded w-1/2' }),
        ]);
      }
      return h('div', { class: 'bg-white p-4 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow' }, [
        h('div', { class: `inline-flex p-2 rounded-xl mb-2 ${props.color}` }, [
          h('svg', { class: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
            h('path', { strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2, d: iconPaths[props.icon] || '' }),
          ]),
        ]),
        h('p', { class: 'text-xl font-bold text-gray-800 leading-tight' }, String(props.value ?? 0)),
        h('p', { class: 'text-xs text-gray-500 mt-0.5 leading-tight' }, props.title),
        props.sub ? h('p', { class: 'text-xs text-orange-500 font-semibold mt-0.5' }, props.sub) : null,
      ]);
    };
  },
});

const EmgBadge = defineComponent({
  props: ['status'],
  setup(props) {
    const map = {
      pending:   'bg-orange-100 text-orange-700',
      accepted:  'bg-blue-100 text-blue-700',
      on_way:    'bg-purple-100 text-purple-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-gray-100 text-gray-500',
    };
    const labels = {
      pending: t('pending'), accepted: t('accepted'), on_way: t('on_way'), completed: t('finished'), cancelled: t('cancelled'),
    };
    return () => h('span', {
      class: `px-2 py-0.5 rounded-full text-xs font-medium ${map[props.status] || 'bg-gray-100 text-gray-500'}`,
    }, labels[props.status] || props.status || '-');
  },
});

const RegBadge = defineComponent({
  props: ['status'],
  setup(props) {
    const map = { active:'bg-green-100 text-green-700', completed:'bg-gray-100 text-gray-500' };
    return () => h('span', { class: `px-2 py-0.5 rounded-full text-xs font-medium ${map[props.status] || 'bg-blue-100 text-blue-700'}` },
      props.status || '-'
    );
  },
});

const ChartSkeleton = defineComponent({
  setup() {
    return () => h('div', { class: 'w-full h-full flex items-end gap-2 px-2 pb-6 animate-pulse' },
      [40, 65, 50, 80, 55, 90].map((pct) =>
        h('div', { class: 'flex-1 bg-gray-100 rounded-t-lg', style: { height: pct + '%' } })
      )
    );
  },
});

// ── Load ──────────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const [dashRes] = await Promise.all([
      reportService.dashboard({ branch_id: userStore.user?.branch_id }),
      loadAllRegisterStats(),
      loadRegistrationFlow(),
    ]);
    if (dashRes) data.value = dashRes;
  } catch (e) {
    console.error('Dashboard xatosi:', e);
  } finally {
    loading.value = false;
  }
});
</script>

<style>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
</style>
