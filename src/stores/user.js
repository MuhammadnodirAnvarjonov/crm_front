import { defineStore } from "pinia";
import axios from "axios";

export const useUserStore = defineStore("user", {
    state: () => ({
        token: localStorage.getItem("token") || null,
        user: null,
        loading: false,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,

        // Role settings objectini qaytaradi
        roleSettings: (state) => {
            const s = state.user?.role?.settings;
            if (!s) return {};
            try {
                return typeof s === 'string' ? JSON.parse(s) : s;
            } catch { return {}; }
        },

        // Berilgan page key uchun ruxsat bor-yo'qligini tekshiradi
        // Agar pages ob'ektida key yo'q bo'lsa — default true (mavjud sahifalar ochiq)
        hasPermission: (state) => (pageKey) => {
            const s = state.user?.role?.settings;
            let settings = {};
            try {
                settings = s ? (typeof s === 'string' ? JSON.parse(s) : s) : {};
            } catch { settings = {}; }
            const pages = settings.pages;
            if (!pages) return true; // pages yo'q bo'lsa hamma sahifa ochiq
            // Yangi CRUD key {page}.read mavjud bo'lsa — shu asosida
            if (`${pageKey}.read` in pages) return !!pages[`${pageKey}.read`];
            // Eski simple key
            if (!(pageKey in pages)) return true;
            return !!pages[pageKey];
        },

        // Sahifa uchun aniq CRUD ruxsatini tekshiradi: hasCrud('registration','delete')
        hasCrud: (state) => (pageKey, action) => {
            const s = state.user?.role?.settings;
            let settings = {};
            try {
                settings = s ? (typeof s === 'string' ? JSON.parse(s) : s) : {};
            } catch { settings = {}; }
            const pages = settings.pages;
            if (!pages) return true; // settings yo'q bo'lsa hamma ruxsat bor
            const crudKey = `${pageKey}.${action}`;
            if (!(crudKey in pages)) return true; // key yo'q bo'lsa ruxsat bor
            return !!pages[crudKey];
        },

        // Hisobot sahifasi ruxsatini tekshiradi: hasReportPermission('service-report')
        hasReportPermission: (state) => (reportKey) => {
            const s = state.user?.role?.settings;
            let settings = {};
            try {
                settings = s ? (typeof s === 'string' ? JSON.parse(s) : s) : {};
            } catch { settings = {}; }
            const reports = settings.reports;
            if (!reports) return true; // reports yo'q bo'lsa hamma ruxsat bor
            if (!(reportKey in reports)) return true; // key yo'q bo'lsa ruxsat bor
            return !!reports[reportKey];
        },

        // Umumiy setting qiymatini qaytaradi: roleSetting('own_registrations')
        roleSetting: (state) => (key) => {
            const s = state.user?.role?.settings;
            let settings = {};
            try {
                settings = s ? (typeof s === 'string' ? JSON.parse(s) : s) : {};
            } catch { settings = {}; }
            if (!(key in settings)) return false;
            return !!settings[key];
        },
    },

    actions: {
        async initUser() {
            if (!this.token) return;

            this.loading = true;
            try {
                const data = await axios.get("/users/getUser");
                if (data) {
                    this.user = data;

                    if (data.token) {
                        this.token = data.token;
                        localStorage.setItem("token", this.token);
                    };

                } else {
                    this.clearUser();
                }
            } catch (err) {
                console.error("❌ initUser error:", err);
                this.clearUser();
            } finally {
                this.loading = false;
            }
        },

        setUser(data) {
            this.token = data.token;
            this.user = data || null;
            localStorage.setItem("token", this.token);
        },

        clearUser() {
            this.token = null;
            this.user = null;
            localStorage.clear();
        },
    },
});
