/**
 * MENU_CONFIG — Menu.vue va Roles/Form.vue uchun YAGONA MANBA
 *
 * Yangi bo'lim qo'shganda faqat SHU FAYLGA qo'shing!
 * Menu.vue va Roles/Form.vue avtomatik yangilanadi.
 *
 * Har bir item:
 *   key          — permission key (hasPermission(key) da ishlatiladi)
 *   label        — i18n key (Menu.vue da t(label) orqali ko'rsatiladi)
 *   pageLabel    — Roles/Form.vue da ko'rsatiladigan o'zbek nom
 *   icon         — ikonka fayli nomi
 *   route        — URL yo'li (navigatsiya uchun)
 *   group        — top-level itemlar uchun Roles guruh nomi
 *   groupLabel   — children bo'lgan parent item uchun Roles guruh nomi
 *   children     — kichik menu itemlari (xuddi shu struktura)
 *   noPermission — true bo'lsa: menuda ko'rinadi lekin Roles formda yo'q
 */
export const MENU_CONFIG = [
  // ─── Asosiy ───────────────────────────────────────────────────────────────
  {
    key: "home",
    label: "dashboard",
    pageLabel: "Bosh sahifa",
    icon: "registrationIcon.svg",
    route: "/home",
    group: "Asosiy",
  },
  {
    key: "patients",
    label: "patients",
    pageLabel: "Mijozlar",
    icon: "patients.svg",
    route: "/patients",
    group: "Asosiy",
  },
  {
    key: "chat",
    label: "chat",
    pageLabel: "Chat",
    icon: "registrationIcon.svg",
    route: "#chat",
    group: "Asosiy",
    noPermission: true,
  },

  // ─── CRM ──────────────────────────────────────────────────────────────────
  {
    key: "crm",
    label: "crm",
    groupLabel: "CRM",
    icon: "registrationIcon.svg",
    children: [
      { key: "crm-appeals", label: "crm_appeals", pageLabel: "Murojaatlar", icon: "registrationIcon.svg", route: "/crm-appeals" },
      { key: "crm-categories", label: "crm_categories", pageLabel: "Kategoriyalar", icon: "service-category.svg", route: "/crm-categories" },
      { key: "crm-sub-categories", label: "crm_sub_categories", pageLabel: "Kichik kategoriyalar", icon: "service.svg", route: "/crm-sub-categories" },
    ],
  },

  // ─── Hujjatlar ────────────────────────────────────────────────────────────
  {
    key: "documents",
    label: "documents",
    groupLabel: "Hujjatlar",
    icon: "registrationIcon.svg",
    children: [
      { key: "kassa-order", label: "kassa-order", pageLabel: "Kassa order", icon: "kassa-category.svg", route: "/kassa-order" },
      { key: "prixod", label: "prixod", pageLabel: "Kirim", icon: "kassa-category.svg", route: "/prixod" },
      { key: "rasxod-section", label: "rasxod-section", pageLabel: "Chiqim bo'lim", icon: "kassa-category.svg", route: "/rasxod-section" },
      { key: "user-payment", label: "user_payment", pageLabel: "Xodim to'lovlari", icon: "userIcon.svg", route: "/user-payment" },
      { key: "supplier-payment", label: "supplier_payment", pageLabel: "Yetkazib beruvchi to'lovlar", icon: "kassa-category.svg", route: "/supplier-payment" },
      { key: "register-product", label: "register_product", pageLabel: "Mahsulotlar registri", icon: "kassa-category.svg", route: "/register-product" },
      { key: "register-jarima", label: "register_jarima", pageLabel: "Jarima ro'yxati", icon: "userIcon.svg", route: "/register-jarima" },
      { key: "penalties-and-bonus", label: "penalties_and_bonus", pageLabel: "Jarima va bonuslar", icon: "userIcon.svg", route: "/penalties-and-bonus" },
    ],
  },

  // ─── Hisobotlar ───────────────────────────────────────────────────────────
  {
    key: "reports",
    label: "reports",
    pageLabel: "Hisobotlar",
    icon: "registrationIcon.svg",
    route: "/reports",
    group: "Hisobotlar",
  },

  // ─── Ma'lumotlar ──────────────────────────────────────────────────────────
  {
    key: "information",
    label: "information",
    groupLabel: "Ma'lumotlar",
    icon: "registrationIcon.svg",
    children: [
      { key: "branchs", label: "branchs", pageLabel: "Filiallar", icon: "userIcon.svg", route: "/branchs" },
      { key: "branch-settings", label: "branch-settings", pageLabel: "Filial sozlamalari", icon: "userIcon.svg", route: "/branch-settings" },
      { key: "sections", label: "sections", pageLabel: "Bo'limlar", icon: "userIcon.svg", route: "/sections" },
      { key: "roles", label: "roles", pageLabel: "Rollar", icon: "role.svg", route: "/roles" },
      { key: "users", label: "employees", pageLabel: "Xodimlar", icon: "userIcon.svg", route: "/users" },
      { key: "service-category", label: "service-category", pageLabel: "Xizmat kategoriyasi", icon: "service-category.svg", route: "/service-category" },
      { key: "service", label: "services", pageLabel: "Xizmatlar", icon: "service.svg", route: "/service" },
      { key: "kassa-parent", label: "kassa-parent", pageLabel: "Kassa parent", icon: "kassa-parent.svg", route: "/kassa-parent" },
      { key: "kassa-category", label: "kassa-category", pageLabel: "Kassa kategoriyasi", icon: "kassa-category.svg", route: "/kassa-category" },
      { key: "products", label: "products", pageLabel: "Mahsulotlar", icon: "kassa-category.svg", route: "/products" },
      { key: "suppliers", label: "suppliers", pageLabel: "Yetkazib beruvchilar", icon: "kassa-category.svg", route: "/suppliers" },
      { key: "pay-types", label: "pay-types", pageLabel: "To'lov turlari", icon: "kassa-category.svg", route: "/pay-types" },
    ],
  },
];

/**
 * Hisobot sahifalari ruxsatlari.
 * Roles/Form.vue da "Hisobot ruxsatlari" sifatida ko'rsatiladi.
 * Reports/Index.vue da settings.reports[key] orqali tekshiriladi.
 *
 * Har bir item:
 *   key       — permission key (settings.reports[key])
 *   label     — Roles formda ko'rsatiladigan nom
 *   routeName — router name (Reports/Index.vue da link uchun)
 */
export const REPORT_PERMISSIONS = [
  { key: "crm-report",                label: "Murojaatlar hisoboti" },
  { key: "kassa-report",              label: "Kassa hisoboti" },
  { key: "kassa-order-report",        label: "Kassa order hisoboti" },
  { key: "user-report",               label: "Xodimlar hisoboti" },
  { key: "user-payment-report",       label: "Xodim to'lov hisoboti" },
  { key: "attendance-report",         label: "Davomat hisoboti" },
  { key: "prixod-report",             label: "Kirim hisoboti" },
  { key: "rasxod-report",             label: "Chiqim hisoboti" },
  { key: "supplier-report",           label: "Yetkazuvchi hisoboti" },
];

/**
 * Bosh sahifa (Dashboard) widgetlari.
 * Roles/Form.vue da "Bosh sahifa bo'limlari" sifatida ko'rsatiladi.
 * Home/Index.vue da settings.dashboard[key] orqali tekshiriladi.
 */
export const DASHBOARD_WIDGETS = [
  { key: "kassa", label: "Kassa (KPI + grafiklar)" },
  { key: "patients", label: "Mijozlar statistikasi" },
];

/**
 * Roles/Form.vue uchun pageGroups ni avtomatik hosil qiladi.
 * noPermission=true bo'lgan itemlar o'tkazib yuboriladi.
 */
export const buildPageGroups = () => {
  const groupMap = new Map();

  MENU_CONFIG.forEach(item => {
    if (item.noPermission) return;

    if (item.children) {
      const gLabel = item.groupLabel || item.label;
      if (!groupMap.has(gLabel)) groupMap.set(gLabel, { label: gLabel, pages: [] });
      // Parent item ham route ga ega bo'lsa, uni ham qo'shish
      if (item.route) {
        groupMap.get(gLabel).pages.push({ key: item.key, label: item.pageLabel || item.label, reportPage: !!item.reportPage });
      }
      item.children.forEach(child => {
        if (!child.noPermission) {
          groupMap.get(gLabel).pages.push({ key: child.key, label: child.pageLabel || child.label, reportPage: !!child.reportPage });
        }
      });
    } else {
      const gLabel = item.group || "Asosiy";
      if (!groupMap.has(gLabel)) groupMap.set(gLabel, { label: gLabel, pages: [] });
      groupMap.get(gLabel).pages.push({ key: item.key, label: item.pageLabel || item.label });
    }
  });

  return [...groupMap.values()].filter(g => g.pages.length > 0);
};

/**
 * Login redirect uchun barcha permission-tekshiriladigan route-larni qaytaradi.
 * { key, route } — key hasPermission uchun, route router.push uchun.
 */
export const getPermissionRoutes = () =>
  MENU_CONFIG.flatMap(item => {
    if (item.noPermission) return [];
    if (item.children) {
      const result = item.children.filter(c => !c.noPermission).map(c => ({ key: c.key, route: c.route }));
      // Parent item ham route ga ega bo'lsa, uni ham qo'shish
      if (item.route) result.unshift({ key: item.key, route: item.route });
      return result;
    }
    return [{ key: item.key, route: item.route }];
  });
