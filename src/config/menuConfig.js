/**
 * MENU_CONFIG — Menu.vue va Roles/Form.vue uchun YAGONA MANBA.
 * `label`/`pageLabel`/`group` — i18n kalitlari ($t() bilan tarjima qilinadi).
 */
export const MENU_CONFIG = [
  { key: 'home', label: 'home', pageLabel: 'home', icon: 'home', route: '/home', group: 'menu_main' },
  { key: 'candidates', label: 'candidates_stats', pageLabel: 'candidates', icon: 'users', route: '/candidates', group: 'menu_main' },
  { key: 'employers', label: 'employers', pageLabel: 'employers', icon: 'briefcase', route: '/employers', group: 'menu_main' },
  { key: 'free-ads', label: 'free_ads', pageLabel: 'free_ads', icon: 'tag', route: '/free-ads', group: 'menu_main' },
  { key: 'paid-ads', label: 'paid_ads', pageLabel: 'paid_ads', icon: 'dollar', route: '/paid-ads', group: 'menu_main' },
  { key: 'premium', label: 'premium_contracts', pageLabel: 'premium', icon: 'star', route: '/premium', group: 'menu_main' },
  { key: 'surveys', label: 'surveys', pageLabel: 'surveys', icon: 'document', route: '/surveys', group: 'menu_main' },
  { key: 'tasks', label: 'tasks', pageLabel: 'tasks', icon: 'calendar', route: '/tasks', group: 'menu_main' },
  { key: 'messages', label: 'messages', pageLabel: 'messages', icon: 'chat', route: '/messages', group: 'menu_main' },
  { key: 'blacklist', label: 'blacklist', pageLabel: 'blacklist', icon: 'blocked', route: '/blacklist', group: 'menu_main' },
  { key: 'advertising', label: 'advertising', pageLabel: 'advertising', icon: 'megaphone', route: '/advertising', group: 'menu_main' },
  { key: 'agent', label: 'agent', pageLabel: 'agent', icon: 'userCog', route: '/agent', group: 'menu_main' },

  { key: 'users', label: 'employees', pageLabel: 'employees', icon: 'idCard', route: '/users', group: 'menu_settings' },
  { key: 'roles', label: 'roles', pageLabel: 'roles', icon: 'shield', route: '/roles', group: 'menu_settings' },
  { key: 'job-types', label: 'job_types', pageLabel: 'job_types', icon: 'briefcase', route: '/job-types', group: 'menu_settings' },
]

export const buildPageGroups = () => {
  const groupMap = new Map()
  MENU_CONFIG.forEach((item) => {
    if (item.noPermission) return
    const gKey = item.group || 'menu_main'
    if (!groupMap.has(gKey)) groupMap.set(gKey, { label: gKey, pages: [] })
    groupMap.get(gKey).pages.push({ key: item.key, label: item.pageLabel || item.label })
  })
  return [...groupMap.values()].filter((g) => g.pages.length > 0)
}

export const getPermissionRoutes = () =>
  MENU_CONFIG.filter((i) => !i.noPermission).map((i) => ({ key: i.key, route: i.route }))
