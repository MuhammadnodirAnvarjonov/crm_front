import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    dark: localStorage.getItem('theme') === 'dark',
    sidebarCollapsed: localStorage.getItem('sidebar') === 'collapsed',
  }),

  actions: {
    applyTheme() {
      const el = document.documentElement
      if (this.dark) el.classList.add('dark')
      else el.classList.remove('dark')
    },

    toggleTheme() {
      this.dark = !this.dark
      localStorage.setItem('theme', this.dark ? 'dark' : 'light')
      this.applyTheme()
    },

    setDark(val) {
      this.dark = !!val
      localStorage.setItem('theme', this.dark ? 'dark' : 'light')
      this.applyTheme()
    },

    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
      localStorage.setItem('sidebar', this.sidebarCollapsed ? 'collapsed' : 'expanded')
    },

    init() {
      // System preference on first visit
      if (!localStorage.getItem('theme')) {
        this.dark = window.matchMedia?.('(prefers-color-scheme: dark)').matches || false
      }
      this.applyTheme()
    },
  },
})
