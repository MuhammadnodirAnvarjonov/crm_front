import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getPermissionRoutes } from '@/config/menuConfig'

const Placeholder = () => import('@/views/Placeholder.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home',
      component: () => import('@/views/Layouts/Index.vue'),
      children: [
        { path: '/home', name: 'home', component: () => import('@/views/Home/Index.vue') },
        { path: '/candidates', name: 'candidates', component: () => import('@/views/Candidates/Index.vue') },
        { path: '/employers', name: 'employers', component: () => import('@/views/Employers/Index.vue') },
        { path: '/free-ads', name: 'free-ads', component: Placeholder },
        { path: '/paid-ads', name: 'paid-ads', component: Placeholder },
        { path: '/premium', name: 'premium', component: Placeholder },
        { path: '/surveys', name: 'surveys', component: Placeholder },
        { path: '/tasks', name: 'tasks', component: Placeholder },
        { path: '/messages', name: 'messages', component: Placeholder },
        { path: '/blacklist', name: 'blacklist', component: Placeholder },
        { path: '/advertising', name: 'advertising', component: Placeholder },
        { path: '/agent', name: 'agent', component: Placeholder },
        { path: '/users', name: 'users', component: () => import('@/views/users/Index.vue') },
        { path: '/roles', name: 'roles', component: () => import('@/views/roles/Index.vue') },
      ],
    },
    { path: '/login', name: 'Login', component: () => import('@/views/Log/Index.vue') },
    { path: '/:pathMatch(.*)*', name: 'error page', component: () => import('@/views/error.vue') },
  ],
})

const PUBLIC_ROUTES = ['Login', 'error page']

const findFirstAllowed = (userStore) => {
  for (const { key, route } of getPermissionRoutes()) {
    if (userStore.hasPermission(key)) return route
  }
  return null
}

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  if (!userStore.user && userStore.token) await userStore.initUser()

  const isPublic = PUBLIC_ROUTES.includes(to.name)

  if (!userStore.isAuthenticated && !isPublic) return next({ name: 'Login' })

  if (userStore.isAuthenticated && (to.name === 'Login' || (to.path === '/' && !to.name))) {
    const allowed = findFirstAllowed(userStore)
    if (allowed && allowed !== to.path) return next(allowed)
    return next({ name: 'error page' })
  }

  if (userStore.isAuthenticated && !isPublic) {
    if (!userStore.hasPermission(to.name)) {
      const allowed = findFirstAllowed(userStore)
      if (allowed && allowed !== to.path) return next(allowed)
      return next({ name: 'error page' })
    }
  }

  next()
})

export default router
