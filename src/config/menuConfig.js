/**
 * MENU_CONFIG — Menu.vue va Roles/Form.vue uchun YAGONA MANBA.
 * Yangi sahifa qo'shish uchun shu yerga element qo'shing + router/index.js da route qo'shing.
 */
export const MENU_CONFIG = [
  {
    key: 'home',
    label: 'dashboard',
    pageLabel: 'Bosh sahifa',
    icon: 'registrationIcon.svg',
    route: '/home',
    group: 'Asosiy',
  },
  {
    key: 'users',
    label: 'employees',
    pageLabel: 'Xodimlar',
    icon: 'userIcon.svg',
    route: '/users',
    group: "Ma'lumotlar",
  },
  {
    key: 'roles',
    label: 'roles',
    pageLabel: 'Rollar',
    icon: 'role.svg',
    route: '/roles',
    group: "Ma'lumotlar",
  },
]

/**
 * Roles/Form.vue uchun pageGroups ni avtomatik hosil qiladi.
 */
export const buildPageGroups = () => {
  const groupMap = new Map()
  MENU_CONFIG.forEach((item) => {
    if (item.noPermission) return
    if (item.children) {
      const gLabel = item.groupLabel || item.label
      if (!groupMap.has(gLabel)) groupMap.set(gLabel, { label: gLabel, pages: [] })
      if (item.route) {
        groupMap.get(gLabel).pages.push({ key: item.key, label: item.pageLabel || item.label })
      }
      item.children.forEach((child) => {
        if (!child.noPermission) {
          groupMap.get(gLabel).pages.push({ key: child.key, label: child.pageLabel || child.label })
        }
      })
    } else {
      const gLabel = item.group || 'Asosiy'
      if (!groupMap.has(gLabel)) groupMap.set(gLabel, { label: gLabel, pages: [] })
      groupMap.get(gLabel).pages.push({ key: item.key, label: item.pageLabel || item.label })
    }
  })
  return [...groupMap.values()].filter((g) => g.pages.length > 0)
}

/** Login redirect uchun ruxsat berilgan routelar ro'yxati. */
export const getPermissionRoutes = () =>
  MENU_CONFIG.flatMap((item) => {
    if (item.noPermission) return []
    if (item.children) {
      const result = item.children.filter((c) => !c.noPermission).map((c) => ({ key: c.key, route: c.route }))
      if (item.route) result.unshift({ key: item.key, route: item.route })
      return result
    }
    return [{ key: item.key, route: item.route }]
  })
