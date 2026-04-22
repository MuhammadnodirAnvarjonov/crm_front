/**
 * MENU_CONFIG — Menu.vue va Roles/Form.vue uchun YAGONA MANBA.
 * Yangi sahifa qo'shish uchun shu yerga element qo'shing + router/index.js da route qo'shing.
 */
export const MENU_CONFIG = [
  { key: 'home', label: 'Bosh sahifa', pageLabel: 'Bosh sahifa', icon: 'home', route: '/home', group: 'Asosiy' },
  { key: 'candidates', label: 'Nomzodlar statistikasi', pageLabel: 'Nomzodlar', icon: 'users', route: '/candidates', group: 'Asosiy' },
  { key: 'employers', label: 'Ish beruvchilar', pageLabel: 'Ish beruvchilar', icon: 'briefcase', route: '/employers', group: 'Asosiy' },
  { key: 'free-ads', label: "Bepul e'lonlar", pageLabel: "Bepul e'lonlar", icon: 'tag', route: '/free-ads', group: 'Asosiy' },
  { key: 'paid-ads', label: "Pullik e'lonlar", pageLabel: "Pullik e'lonlar", icon: 'dollar', route: '/paid-ads', group: 'Asosiy' },
  { key: 'premium', label: 'Premium shartnomalar', pageLabel: 'Premium', icon: 'star', route: '/premium', group: 'Asosiy' },
  { key: 'surveys', label: 'Anketalar', pageLabel: 'Anketalar', icon: 'document', route: '/surveys', group: 'Asosiy' },
  { key: 'tasks', label: 'Vazifalar', pageLabel: 'Vazifalar', icon: 'calendar', route: '/tasks', group: 'Asosiy' },
  { key: 'messages', label: 'Xabarlar', pageLabel: 'Xabarlar', icon: 'chat', route: '/messages', group: 'Asosiy' },
  { key: 'blacklist', label: "Qora ro'yxat", pageLabel: "Qora ro'yxat", icon: 'blocked', route: '/blacklist', group: 'Asosiy' },
  { key: 'advertising', label: 'Reklama', pageLabel: 'Reklama', icon: 'megaphone', route: '/advertising', group: 'Asosiy' },
  { key: 'agent', label: 'Agent', pageLabel: 'Agent', icon: 'userCog', route: '/agent', group: 'Asosiy' },
]

export const buildPageGroups = () => {
  const groupMap = new Map()
  MENU_CONFIG.forEach((item) => {
    if (item.noPermission) return
    const gLabel = item.group || 'Asosiy'
    if (!groupMap.has(gLabel)) groupMap.set(gLabel, { label: gLabel, pages: [] })
    groupMap.get(gLabel).pages.push({ key: item.key, label: item.pageLabel || item.label })
  })
  return [...groupMap.values()].filter((g) => g.pages.length > 0)
}

export const getPermissionRoutes = () =>
  MENU_CONFIG.filter((i) => !i.noPermission).map((i) => ({ key: i.key, route: i.route }))
