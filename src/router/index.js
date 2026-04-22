import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/user";
import { getPermissionRoutes } from "@/config/menuConfig";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/home",
      component: () => import("@/views/Layouts/Index.vue"),
      children: [
        {
          path: "/home",
          name: "home",
          component: () => import("@/views/Home/Index.vue"),
        },
        {
          path: "/patients",
          name: "patients",
          component: () => import("@/views/patients/Index.vue"),
        },
        {
          path: "/users",
          name: "users",
          component: () => import("@/views/users/Index.vue"),
        },
        {
          path: "/penalties-and-bonus",
          name: "penalties-and-bonus",
          component: () => import("@/views/penaltiesAndBonus/Index.vue"),
        },
        {
          path: "/register-jarima",
          name: "register-jarima",
          component: () => import("@/views/registerJarima/Index.vue"),
        },
        {
          path: "/roles",
          name: "roles",
          component: () => import("@/views/roles/Index.vue"),
        },
        {
          path: "/sections",
          name: "sections",
          component: () => import("@/views/sections/Index.vue"),
        },
        {
          path: "/branchs",
          name: "branchs",
          component: () => import("@/views/branchs/Index.vue"),
        },
        {
          path: "/branch-settings",
          name: "branch-settings",
          component: () => import("@/views/branchSettings/Index.vue"),
        },
        {
          path: "/kassa-category",
          name: "kassa-category",
          component: () => import("@/views/kassaCategory/Index.vue"),
        },
        {
          path: "/kassa-parent",
          name: "kassa-parent",
          component: () => import("@/views/kassaParent/Index.vue"),
        },
        {
          path: "/kassa-order",
          name: "kassa-order",
          component: () => import("@/views/kassaOrder/Index.vue"),
        },
        {
          path: "/service-category",
          name: "service-category",
          component: () => import("@/views/ServiceCategory/Index.vue"),
        },
        {
          path: "/service",
          name: "service",
          component: () => import("@/views/Service/Index.vue"),
        },
        {
          path: "/user-payment",
          name: "user-payment",
          component: () => import("@/views/userPayment/Index.vue"),
        },
        {
          path: "/reports",
          name: "reports",
          component: () => import("@/views/reports/Index.vue"),
        },
        // CRM Module
        {
          path: "/crm-appeals",
          name: "crm-appeals",
          component: () => import("@/views/crm/appeals/Index.vue"),
        },
        {
          path: "/crm-categories",
          name: "crm-categories",
          component: () => import("@/views/crm/categories/Index.vue"),
        },
        {
          path: "/crm-sub-categories",
          name: "crm-sub-categories",
          component: () => import("@/views/crm/subCategories/Index.vue"),
        },
        {
          path: "/products",
          name: "products",
          component: () => import("@/views/products/Index.vue"),
        },
        {
          path: "/suppliers",
          name: "suppliers",
          component: () => import("@/views/suppliers/Index.vue"),
        },
        {
          path: "/prixod",
          name: "prixod",
          component: () => import("@/views/prixod/Index.vue"),
        },
        {
          path: "/rasxod-section",
          name: "rasxod-section",
          component: () => import("@/views/rasxodSection/Index.vue"),
        },
        {
          path: "/pay-types",
          name: "pay_types",
          component: () => import("@/views/payType/Index.vue"),
        },
        {
          path: "/register-product",
          name: "register-product",
          component: () => import("@/views/registerProduct/Index.vue"),
        },
        {
          path: "/supplier-payment",
          name: "supplier-payment",
          component: () => import("@/views/supplierPayment/Index.vue"),
        },
      ]
    },
    {
      path: "/login",
      name: "Login",
      component: () => import("@/views/Log/Index.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: 'error page',
      component: () => import('../views/error.vue')
    },
    {
      path: "/",
      component: () => import("@/views/reports/ReportLayout.vue"),
      children: [
        {
          path: "/kassa-report",
          name: "kassa-report",
          component: () => import("@/views/reports/KassaReport.vue"),
          meta: { title: "Kassa hisoboti" },
        },
        {
          path: "/crm-report",
          name: "crm-report",
          component: () => import("@/views/reports/CrmReport.vue"),
          meta: { title: "Murojaatlar hisoboti" },
        },
        {
          path: "/user-report",
          name: "user-report",
          component: () => import("@/views/reports/UserReport.vue"),
          meta: { title: "Xodimlar hisoboti" },
        },
        {
          path: "/kassa-order-report",
          name: "kassa-order-report",
          component: () => import("@/views/reports/KassaOrderReport.vue"),
          meta: { title: "Kassa order hisoboti" },
        },
        {
          path: "/prixod-report",
          name: "prixod-report",
          component: () => import("@/views/reports/PrixodReport.vue"),
          meta: { title: "Kirim hisoboti" },
        },
        {
          path: "/rasxod-report",
          name: "rasxod-report",
          component: () => import("@/views/reports/RasxodReport.vue"),
          meta: { title: "Chiqim hisoboti" },
        },
        {
          path: "/user-payment-report",
          name: "user-payment-report",
          component: () => import("@/views/reports/UserPaymentReport.vue"),
          meta: { title: "Xodim to'lov hisoboti" },
        },
        {
          path: "/supplier-report",
          name: "supplier-report",
          component: () => import("@/views/reports/SupplierReport.vue"),
          meta: { title: "Yetkazuvchi hisoboti" },
        },
        {
          path: "/attendance-report",
          name: "attendance-report",
          component: () => import("@/views/reports/AttendanceReport.vue"),
          meta: { title: "Davomat hisoboti" },
        },
      ],
    },
  ],
});

// Permission tekshiruvi kerak bo'lmagan routelar
const PUBLIC_ROUTES = ["Login", "error page"];

// Birinchi ruxsat berilgan sahifani topish (infinite loop oldini olish uchun)
const findFirstAllowed = (userStore) => {
  for (const { key, route } of getPermissionRoutes()) {
    if (userStore.hasPermission(key)) return route;
  }
  return null;
};

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  // User ma'lumotlarini tiklash
  if (!userStore.user && userStore.token) {
    await userStore.initUser();
  }

  // Sahifa public (hamma kira oladigan) sahifami?
  const isPublicRoute = PUBLIC_ROUTES.includes(to.name);

  // 2. AGAR user login qilmagan bo'lsa VA sahifa public bo'lmasa -> Loginga yuborish
  if (!userStore.isAuthenticated && !isPublicRoute) {
    return next({ name: "Login" });
  }

  // 3. AGAR user login qilgan bo'lsa VA root "/" yoki Loginga kirmoqchi bo'lsa -> birinchi ruxsat berilgan sahifaga
  if (userStore.isAuthenticated && (to.name === "Login" || (to.path === "/" && !to.name))) {
    const allowed = findFirstAllowed(userStore);
    if (allowed && allowed !== to.path) return next(allowed);
    return next({ name: "error page" });
  }

  // 4. Permission tekshiruvi (faqat login qilganlar va public bo'lmagan sahifalar uchun)
  if (userStore.isAuthenticated && !isPublicRoute) {
    if (!userStore.hasPermission(to.name)) {
      const allowed = findFirstAllowed(userStore);
      if (allowed && allowed !== to.path) return next(allowed);
      return next({ name: "error page" });
    }
  }

  next();
});

export default router;
