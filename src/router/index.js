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
          path: "/users",
          name: "users",
          component: () => import("@/views/users/Index.vue"),
        },

        {
          path: "/roles",
          name: "roles",
          component: () => import("@/views/roles/Index.vue"),
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

  ],
});

const PUBLIC_ROUTES = ["Login", "error page"];

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

  const isPublicRoute = PUBLIC_ROUTES.includes(to.name);

  if (!userStore.isAuthenticated && !isPublicRoute) {
    return next({ name: "Login" });
  }

  if (userStore.isAuthenticated && (to.name === "Login" || (to.path === "/" && !to.name))) {
    const allowed = findFirstAllowed(userStore);
    if (allowed && allowed !== to.path) return next(allowed);
    return next({ name: "error page" });
  }

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
