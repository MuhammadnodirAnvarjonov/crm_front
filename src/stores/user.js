import { defineStore } from 'pinia'
import http from '@/services/http'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,

    roleSettings: (state) => {
      const s = state.user?.role?.settings
      if (!s) return {}
      try {
        return typeof s === 'string' ? JSON.parse(s) : s
      } catch {
        return {}
      }
    },

    hasPermission: (state) => (pageKey) => {
      const s = state.user?.role?.settings
      let settings = {}
      try {
        settings = s ? (typeof s === 'string' ? JSON.parse(s) : s) : {}
      } catch {
        settings = {}
      }
      const pages = settings.pages
      if (!pages) return true
      if (`${pageKey}.read` in pages) return !!pages[`${pageKey}.read`]
      if (!(pageKey in pages)) return true
      return !!pages[pageKey]
    },

    hasCrud: (state) => (pageKey, action) => {
      const s = state.user?.role?.settings
      let settings = {}
      try {
        settings = s ? (typeof s === 'string' ? JSON.parse(s) : s) : {}
      } catch {
        settings = {}
      }
      const pages = settings.pages
      if (!pages) return true
      const crudKey = `${pageKey}.${action}`
      if (!(crudKey in pages)) return true
      return !!pages[crudKey]
    },

    roleSetting: (state) => (key) => {
      const s = state.user?.role?.settings
      let settings = {}
      try {
        settings = s ? (typeof s === 'string' ? JSON.parse(s) : s) : {}
      } catch {
        settings = {}
      }
      if (!(key in settings)) return false
      return !!settings[key]
    },
  },

  actions: {
    async initUser() {
      if (!this.token) return
      this.loading = true
      try {
        const data = await http.get('/users/getUser')
        if (data) {
          this.user = data
          if (data.token) {
            this.token = data.token
            localStorage.setItem('token', this.token)
          }
        } else {
          this.clearUser()
        }
      } catch (err) {
        console.error('initUser error:', err)
        this.clearUser()
      } finally {
        this.loading = false
      }
    },

    setUser(data) {
      this.token = data.token
      this.user = data || null
      localStorage.setItem('token', this.token)
    },

    clearUser() {
      this.token = null
      this.user = null
      localStorage.clear()
    },
  },
})
