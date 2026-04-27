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
        { path: '/free-ads', name: 'free-ads', component: () => import('@/views/FreeAds/Index.vue') },
        { path: '/paid-ads', name: 'paid-ads', component: () => import('@/views/PaidAds/Index.vue') },
        { path: '/premium', name: 'premium', component: () => import('@/views/Premium/Index.vue') },
        { path: '/surveys', name: 'surveys', component: () => import('@/views/Surveys/Index.vue') },
        { path: '/tasks', name: 'tasks', component: () => import('@/views/Tasks/Index.vue') },
        { path: '/messages', name: 'messages', component: Placeholder },
        { path: '/blacklist', name: 'blacklist', component: () => import('@/views/Blacklist/Index.vue') },
        { path: '/advertising', name: 'advertising', component: () => import('@/views/Advertising/Index.vue') },
        { path: '/agent', name: 'agent', component: () => import('@/views/Agent/Index.vue') },
        { path: '/users', name: 'users', component: () => import('@/views/users/Index.vue') },
        { path: '/roles', name: 'roles', component: () => import('@/views/roles/Index.vue') },
        { path: '/job-types', name: 'job-types', component: () => import('@/views/JobTypes/Index.vue') },
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
