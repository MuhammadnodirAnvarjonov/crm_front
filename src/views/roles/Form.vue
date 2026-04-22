<template>
  <form @submit.prevent="saveRole" class="space-y-5">
    <h3 class="text-lg font-semibold mb-2">{{ $t('role') }}</h3>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <BaseInput v-model="form.name" :label="$t('name')" required />
      <BaseInput v-model="form.comment" :label="$t('comment')" />

      <!-- Umumiy sozlamalar -->
      <div class="sm:col-span-2">
        <h4 class="text-sm text-gray-700 font-semibold mb-2">{{ $t('settings') }}</h4>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 rounded-lg p-3 border border-gray-100">
          <label v-for="(label, key) in generalSettings" :key="key"
            class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" v-model="form.settings[key]" class="w-4 h-4 text-blue-600" />
            <span>{{ label }}</span>
          </label>
        </div>
      </div>

      <!-- Bosh sahifa bo'limlari -->
      <div class="sm:col-span-2">
        <h4 class="text-sm text-gray-700 font-semibold mb-2">Bosh sahifa bo'limlari</h4>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-blue-50 rounded-lg p-3 border border-blue-100">
          <label v-for="widget in DASHBOARD_WIDGETS" :key="widget.key"
            class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" v-model="form.settings.dashboard[widget.key]" class="w-4 h-4 text-blue-600" />
            <span>{{ widget.label }}</span>
          </label>
        </div>
      </div>

      <!-- Sahifa ruxsatlari (CRUD) -->
      <div class="sm:col-span-2">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm text-gray-700 font-semibold">Sahifa ruxsatlari</h4>
          <div class="flex gap-2">
            <button type="button" @click="toggleAll(true)" class="text-xs text-blue-600 hover:underline">Hammasini
              yoq</button>
            <span class="text-gray-300">|</span>
            <button type="button" @click="toggleAll(false)" class="text-xs text-red-500 hover:underline">Hammasini
              o'chir</button>
          </div>
        </div>

        <div class="border rounded-lg overflow-hidden">
          <div v-for="group in pageGroups" :key="group.label" class="border-b last:border-b-0">
            <!-- Group header -->
            <div class="flex items-center gap-2 px-3 py-2 bg-gray-100 border-b">
              <input type="checkbox" :checked="isGroupChecked(group)" :indeterminate.prop="isGroupIndeterminate(group)"
                @change="toggleGroup(group, $event.target.checked)" class="w-4 h-4 text-blue-600 cursor-pointer" />
              <span class="text-sm font-bold text-gray-700">{{ group.label }}</span>
            </div>

            <!-- Table header: oddiy sahifalar -->
            <div v-if="!hasReportPages(group)"
              class="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-1 px-4 py-1.5 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase">
              <span>Sahifa</span>
              <span class="text-center">Ko'rish</span>
              <span class="text-center">Qo'shish</span>
              <span class="text-center">Tahrirlash</span>
              <span class="text-center">O'chirish</span>
            </div>

            <!-- Table header: hisobot sahifalar -->
            <div v-else
              class="grid grid-cols-[2fr_1fr_1fr] gap-1 px-4 py-1.5 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase">
              <span>Sahifa</span>
              <span class="text-center">Ko'rish</span>
              <span class="text-center">Barcha xodimlar</span>
            </div>

            <!-- Page rows: oddiy sahifalar -->
            <template v-if="!hasReportPages(group)">
              <div v-for="page in group.pages" :key="page.key"
                class="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-1 px-4 py-2 items-center border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer font-medium">
                  <input type="checkbox" :checked="isPageChecked(page.key)"
                    :indeterminate.prop="isPageIndeterminate(page.key)"
                    @change="togglePage(page.key, $event.target.checked)" class="w-4 h-4 text-blue-600" />
                  {{ page.label }}
                </label>
                <div class="flex justify-center">
                  <input type="checkbox" v-model="form.settings.pages[page.key + '.read']"
                    class="w-4 h-4 text-blue-600 cursor-pointer" :title="$t('view')" />
                </div>
                <div class="flex justify-center">
                  <input type="checkbox" v-model="form.settings.pages[page.key + '.create']"
                    class="w-4 h-4 text-green-600 cursor-pointer" title="Qo'shish" />
                </div>
                <div class="flex justify-center">
                  <input type="checkbox" v-model="form.settings.pages[page.key + '.update']"
                    class="w-4 h-4 text-amber-500 cursor-pointer" :title="$t('edit')" />
                </div>
                <div class="flex justify-center">
                  <input type="checkbox" v-model="form.settings.pages[page.key + '.delete']"
                    class="w-4 h-4 text-red-500 cursor-pointer" :title="$t('delete')" />
                </div>
              </div>
            </template>

            <!-- Page rows: hisobot sahifalar -->
            <template v-else>
              <div v-for="page in group.pages" :key="page.key"
                class="grid grid-cols-[2fr_1fr_1fr] gap-1 px-4 py-2 items-center border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer font-medium">
                  <input type="checkbox" v-model="form.settings.pages[page.key + '.read']"
                    @change="onReportReadChange(page.key, $event.target.checked)"
                    class="w-4 h-4 text-blue-600" />
                  {{ page.label }}
                </label>
                <div class="flex justify-center">
                  <input type="checkbox" v-model="form.settings.pages[page.key + '.read']"
                    class="w-4 h-4 text-blue-600 cursor-pointer" title="Ko'rish" />
                </div>
                <div class="flex justify-center">
                  <input type="checkbox" v-model="form.settings.pages[page.key + '.all_users']"
                    class="w-4 h-4 text-indigo-600 cursor-pointer" title="Barcha xodimlarni ko'rish" />
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Hisobot ruxsatlari -->
      <div class="sm:col-span-2">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm text-gray-700 font-semibold">Hisobot ruxsatlari</h4>
          <div class="flex gap-2">
            <button type="button" @click="toggleAllReports(true)" class="text-xs text-blue-600 hover:underline">Hammasini yoq</button>
            <span class="text-gray-300">|</span>
            <button type="button" @click="toggleAllReports(false)" class="text-xs text-red-500 hover:underline">Hammasini o'chir</button>
          </div>
        </div>

        <div class="border rounded-lg overflow-hidden">
          <!-- Header -->
          <div class="grid grid-cols-[2fr_1fr_1fr] gap-1 px-4 py-1.5 bg-gray-100 border-b text-xs font-semibold text-gray-500 uppercase">
            <span>Hisobot</span>
            <span class="text-center">Ko'rish</span>
            <span class="text-center">Barcha xodimlar</span>
          </div>
          <!-- Rows -->
          <div v-for="rp in REPORT_PERMISSIONS" :key="rp.key"
            class="grid grid-cols-[2fr_1fr_1fr] gap-1 px-4 py-2 items-center border-b last:border-b-0 hover:bg-gray-50 transition-colors">
            <span class="text-sm text-gray-700 font-medium">{{ rp.label }}</span>
            <div class="flex justify-center">
              <input type="checkbox" v-model="form.settings.reports[rp.key]"
                @change="onReportToggle(rp.key, $event.target.checked)"
                class="w-4 h-4 text-blue-600 cursor-pointer" title="Ko'rish" />
            </div>
            <div class="flex justify-center">
              <input type="checkbox" v-model="form.settings.reports[rp.key + '.all_users']"
                :disabled="!form.settings.reports[rp.key]"
                class="w-4 h-4 text-indigo-600 cursor-pointer" title="Barcha xodimlarni ko'rish" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tugmalar -->
    <div class="flex justify-end gap-2 sticky bottom-0 bg-white py-3 border-t border-gray-200 -mx-4 px-4">
      <BaseButton type="button" status="gray" @click="$emit('close')">{{ $t('cancel') }}</BaseButton>
      <BaseButton type="submit" status="primary">{{ $t('save') }}</BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from "vue";
import roleService from "@/services/roles.service";
import BaseInput from "@/components/form/BaseInput.vue";
import BaseButton from "@/components/form/BaseButton.vue";
import { buildPageGroups, DASHBOARD_WIDGETS, REPORT_PERMISSIONS } from "@/config/menuConfig";

const emit = defineEmits(["saved", "close"]);
const props = defineProps({ editData: Object });

// CRUD suffixes
const CRUD = ['read', 'create', 'update', 'delete'];

// Umumiy sozlamalar
const generalSettings = {
  branch: "Filial tanlash",
  disabled_input: "Kiritish bloklangan",
  reg_create: "Ro'yxat yaratish",
  reg_delete: "Ro'yxatni o'chirish",
  own_registrations: "Faqat o'z bemorlarini ko'rish",
  own_services: "Faqat o'z bo'lim xizmatlari",
  own_patients: "Faqat o'z bemorlarini qidirish",
  hide_debtors: "Qarzdor bemorlarni yashirish",
  hide_prices: "Narxlarni yashirish (Reg)",
  hide_payment: "To'lov bo'limini yashirish (Reg)",
  reg_service_delete: "Xizmatni o'chirish (Reg)",
  reg_palata_manage: "Palata boshqarish (Reg)",
  reg_payment_add: "To'lov qo'shish (Reg)",
  switch_users: "Xodim almashtirish",
};

// Sahifa guruhlari — menuConfig.js dan avtomatik olinadi
const pageGroups = buildPageGroups();

// Oddiy sahifalar va hisobot sahifalarni ajratish
const regularPages = pageGroups.flatMap(g => g.pages.filter(p => !p.reportPage));
const reportPages = pageGroups.flatMap(g => g.pages.filter(p => p.reportPage));

// Barcha sahifa keylarini (CRUD bilan birga) yig'amiz
const allPageKeys = regularPages.flatMap(p => CRUD.map(c => `${p.key}.${c}`));

// Hisobot sahifalar uchun faqat read va all_users
const REPORT_ACTIONS = ['read', 'all_users'];
const allReportKeys = reportPages.flatMap(p => REPORT_ACTIONS.map(a => `${p.key}.${a}`));

// Eski oddiy key lar (orqaga muvofiqligi uchun)
const allSimpleKeys = pageGroups.flatMap(g => g.pages.map(p => p.key));

// Guruhda report sahifa bor-yo'qligini tekshiradi
const hasReportPages = (group) => group.pages.some(p => p.reportPage);

// Report sahifa read o'zgarganda simple key ham yangilash
const onReportReadChange = (pageKey, val) => {
  form.value.settings.pages[pageKey] = val;
};

const defaultPages = () => {
  const obj = {};
  // Oddiy sahifalar uchun CRUD keylar
  allPageKeys.forEach(k => { obj[k] = false; });
  // Hisobot sahifalar uchun read + all_users keylar
  allReportKeys.forEach(k => { obj[k] = false; });
  // Eski simple keylar (orqaga muvofiqligi)
  allSimpleKeys.forEach(k => { obj[k] = false; });
  return obj;
};

// Dashboard widgetlari default qiymatlari (yangi rol uchun hamma yoqilgan)
const defaultDashboard = () => {
  const obj = {};
  DASHBOARD_WIDGETS.forEach(w => { obj[w.key] = true; });
  return obj;
};

// Hisobot ruxsatlari default qiymatlari (yangi rol uchun hamma yoqilgan)
const defaultReports = () => {
  const obj = {};
  REPORT_PERMISSIONS.forEach(rp => {
    obj[rp.key] = true;
    obj[rp.key + '.all_users'] = true;
  });
  return obj;
};

// Ko'rish o'chirilganda all_users ham o'chirish
const onReportToggle = (key, val) => {
  if (!val) {
    form.value.settings.reports[key + '.all_users'] = false;
  }
};

// Barcha hisobot ruxsatlarini yoq/o'chir
const toggleAllReports = (val) => {
  REPORT_PERMISSIONS.forEach(rp => {
    form.value.settings.reports[rp.key] = val;
    form.value.settings.reports[rp.key + '.all_users'] = val;
  });
};

const defaultSettings = {
  branch: false,
  disabled_input: false,
  reg_create: true,
  reg_delete: false,
  own_registrations: false,
  own_services: false,
  own_patients: false,
  hide_debtors: false,
  hide_prices: false,
  hide_payment: false,
  reg_service_delete: true,
  reg_palata_manage: true,
  reg_payment_add: true,
  switch_users: false,
};

const form = ref({
  name: "",
  comment: "",
  settings: { ...defaultSettings, dashboard: defaultDashboard(), pages: defaultPages(), reports: defaultReports() },
});

watch(
  () => props.editData,
  (val) => {
    if (val) {
      let parsed = {};
      try {
        parsed = typeof val.settings === "string" ? JSON.parse(val.settings) : val.settings || {};
      } catch (e) { console.warn("Settings parse error:", e); }

      // Eski simple keylarni CRUD keylariga o'tkazish
      const oldPages = parsed.pages || {};
      const migratedPages = { ...defaultPages() };

      // Eski simple key bor bo'lsa — read = true qilamiz (migration)
      allSimpleKeys.forEach(k => {
        if (oldPages[k] === true) {
          // Report sahifa bo'lsa — faqat read va all_users
          const isReport = reportPages.some(p => p.key === k);
          if (isReport) {
            migratedPages[`${k}.read`] = true;
            migratedPages[`${k}.all_users`] = true;
          } else {
            CRUD.forEach(c => { migratedPages[`${k}.${c}`] = true; });
          }
        }
      });
      // Yangi CRUD keylarni ustiga yozamiz
      allPageKeys.forEach(k => {
        if (k in oldPages) migratedPages[k] = oldPages[k];
      });
      // Report keylarni ustiga yozamiz
      allReportKeys.forEach(k => {
        if (k in oldPages) migratedPages[k] = oldPages[k];
      });
      // Eski simple keylarni ham saqlaymiz (orqaga muvofiqligi)
      allSimpleKeys.forEach(k => {
        const isReport = reportPages.some(p => p.key === k);
        if (isReport) {
          migratedPages[k] = !!migratedPages[`${k}.read`];
        } else {
          migratedPages[k] = CRUD.some(c => migratedPages[`${k}.${c}`]);
        }
      });

      // Dashboard: mavjud qiymatlarga default qo'shish (eski rollar uchun hamma yoqilgan)
      const migratedDashboard = { ...defaultDashboard(), ...(parsed.dashboard || {}) };

      // Hisobot ruxsatlari: mavjud qiymatlarga default qo'shish (eski rollar uchun hamma yoqilgan)
      const migratedReports = { ...defaultReports(), ...(parsed.reports || {}) };

      form.value = {
        name: val.name || "",
        comment: val.comment || "",
        settings: {
          ...defaultSettings,
          ...parsed,
          dashboard: migratedDashboard,
          reports: migratedReports,
          pages: migratedPages,
        },
      };
    } else {
      form.value = {
        name: "",
        comment: "",
        settings: { ...defaultSettings, dashboard: defaultDashboard(), pages: defaultPages(), reports: defaultReports() },
      };
    }
  },
  { immediate: true }
);

// Page uchun barcha CRUD checked bo'lganini tekshiradi
const isPageChecked = (pageKey) =>
  CRUD.every(c => form.value.settings.pages[`${pageKey}.${c}`]);

// Page qisman checked (indeterminate)
const isPageIndeterminate = (pageKey) => {
  const checked = CRUD.filter(c => form.value.settings.pages[`${pageKey}.${c}`]).length;
  return checked > 0 && checked < CRUD.length;
};

// Bir sahifaning barcha CRUD ruxsatlarini birdaniga o'zgartirish
const togglePage = (pageKey, val) => {
  CRUD.forEach(c => { form.value.settings.pages[`${pageKey}.${c}`] = val; });
  // Simple key ni yangilash (orqaga muvofiqligi + menu filter uchun)
  form.value.settings.pages[pageKey] = val;
};

// Guruh uchun barcha sahifalar checked bo'lganini tekshiradi
const isGroupChecked = (group) =>
  group.pages.every(p =>
    p.reportPage ? !!form.value.settings.pages[`${p.key}.read`] : isPageChecked(p.key)
  );

// Guruh qisman checked (indeterminate)
const isGroupIndeterminate = (group) => {
  const checked = group.pages.filter(p =>
    p.reportPage ? !!form.value.settings.pages[`${p.key}.read`] : isPageChecked(p.key)
  ).length;
  return checked > 0 && checked < group.pages.length;
};

// Guruhni to'liq yoq/o'chir
const toggleGroup = (group, val) => {
  group.pages.forEach(p => {
    if (p.reportPage) {
      form.value.settings.pages[`${p.key}.read`] = val;
      form.value.settings.pages[`${p.key}.all_users`] = val;
      form.value.settings.pages[p.key] = val;
    } else {
      togglePage(p.key, val);
    }
  });
};

// Hammasini yoq/o'chir
const toggleAll = (val) => {
  allPageKeys.forEach(k => { form.value.settings.pages[k] = val; });
  allReportKeys.forEach(k => { form.value.settings.pages[k] = val; });
  allSimpleKeys.forEach(k => { form.value.settings.pages[k] = val; });
  DASHBOARD_WIDGETS.forEach(w => { form.value.settings.dashboard[w.key] = val; });
  toggleAllReports(val);
};

const saveRole = async () => {
  try {
    // Simple keylarni sync qilib yuboramiz
    allSimpleKeys.forEach(k => {
      const isReport = reportPages.some(p => p.key === k);
      if (isReport) {
        form.value.settings.pages[k] = !!form.value.settings.pages[`${k}.read`];
      } else {
        form.value.settings.pages[k] = CRUD.some(c => form.value.settings.pages[`${k}.${c}`]);
      }
    });

    const payload = {
      name: form.value.name,
      comment: form.value.comment,
      settings: form.value.settings,
    };
    if (props.editData) {
      await roleService.update(props.editData.id, payload);
    } else {
      await roleService.create(payload);
    }
    emit("saved");
    emit("close");
  } catch (err) {
    console.error("Role save error:", err);
  }
};
</script>
