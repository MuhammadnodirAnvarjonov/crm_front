<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useI18n } from "vue-i18n";
import axios from "axios";
import branchService from "@/services/branchs.service";
import usersService from "@/services/users.service";
import { getPermissionRoutes } from "@/config/menuConfig";

import BaseSelect from "@/components/form/BaseSelect.vue";

const { t } = useI18n();
const router = useRouter();
const userStore = useUserStore();

// Data
const branchOption = ref([]);
const userOption = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");

const form_data = ref({
    branch_id: null,
    user_name: null,
    password: "",
});

const showPassword = ref(false);

// 🔹 1. Filiallarni olish
const getBranches = async () => {
    try {
        const res = await branchService.all();
        branchOption.value = res || [];

        if (branchOption.value.length === 1) {
            form_data.value.branch_id = branchOption.value[0].id;
        }
    } catch (err) {
        console.error("Branch load error:", err);
    }
};

// 🔹 2. Userlarni olish
const getUsers = async (branch_id) => {
    if (!branch_id) return;
    try {
        userOption.value = [];
        form_data.value.user_name = null;

        const res = await usersService.getActiveByBranch(branch_id);
        userOption.value = res || [];
    } catch (err) {
        console.error("User load error:", err);
    }
};

// 🔹 Rol asosida birinchi ruxsat berilgan sahifani topish
const getFirstAllowedRoute = () => {
    for (const { key, route } of getPermissionRoutes()) {
        if (userStore.hasPermission(key)) return route;
    }
    return "/registrations"; // Default route agar hech narsa mos kelmasa
};

// 🔹 3. Login
const login = async () => {
    errorMessage.value = "";
    const { branch_id, user_name, password } = form_data.value;

    if (!branch_id || !user_name || !password) {
        errorMessage.value = t("fill_all_fields");
        return;
    }

    isLoading.value = true;

    try {
        const res = await axios.post("/users/login", {
            branch_id,
            user_name,
            password,
        });

        if (res && res.token) {
            localStorage.setItem("token", res.token);
            localStorage.setItem("lang", "uz");
            userStore.setUser(res);
            res.token = '';
            res.password_hash = '';
            localStorage.setItem("user", JSON.stringify({ ...res }));
            router.push(getFirstAllowedRoute());
        } else {
            throw new Error("Token topilmadi");
        }
    } catch (err) {
        console.error(err);
        errorMessage.value = t("login_error") || "Login yoki parol xato!";
    } finally {
        isLoading.value = false;
    }
};

watch(
    () => form_data.value.branch_id,
    (newVal) => {
        if (newVal) getUsers(newVal);
    }
);

onMounted(async () => {
    await getBranches();

    // Tez qayta login: agar oldingi branch_id saqlangan bo'lsa, avtomatik tanlash
    const lastBranchId = localStorage.getItem("last_branch_id");
    if (lastBranchId) {
        const exists = branchOption.value.find(b => String(b.id) === String(lastBranchId));
        if (exists) {
            form_data.value.branch_id = exists.id;
        }
    }
});
</script>

<template>
    <!-- Asosiy konteyner: Full screen va markazlashgan -->
    <div class="min-h-screen w-full flex items-center justify-center font-sans overflow-hidden relative">

        <!-- 1. ORQA FON -->
        <div class="absolute inset-0 z-0">
            <div class="w-full h-full bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900"></div>
            <div class="absolute inset-0 bg-slate-900/20"></div>
        </div>

        <!-- 2. LOGIN KARTASI (Center Card) -->
        <div class="w-full max-w-[450px] m-4 relative z-10">
            
            <div class=" backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 animate-fade-in-up" style="background: rgb(104 186 255 / 27%);">
                
                <!-- Logo & Header -->
                <div class="text-center mb-8">
                    <div class="relative inline-block group">
                        <div class="absolute -inset-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <div class="relative bg-white p-3 rounded-2xl shadow-sm border border-slate-100 mb-3 inline-flex items-center justify-center">
                            <svg viewBox="0 0 24 24" class="h-12 w-12 text-blue-600" fill="none" stroke="currentColor" stroke-width="1.5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                            </svg>
                        </div>
                    </div>
                    <h2 style="font-size: 18pt; font-weight: 900; color: #fff;">
                        {{ t("login") || "Tizimga kirish" }}
                    </h2>
                    <p class="text-slate-500 mt-1 text-sm font-medium" style="color: rgb(175 211 255);">
                        {{ t("login_subtitle") }}
                    </p>
                </div>

                <!-- Form -->
                <form @submit.prevent="login" class="space-y-5">

                    <!-- Error Alert -->
                    <div v-if="errorMessage"
                        class="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-2 text-red-700 text-sm animate-shake shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                        <span class="font-medium">{{ errorMessage }}</span>
                    </div>

                    <!-- 1. Branch Select -->
                    <div class="group">
                        <BaseSelect
                            v-model="form_data.branch_id"
                            :options="branchOption"
                            label-key="name"
                            value-key="id"
                            :placeholder="t('select_branch')"
                            class="transition-all group-hover:ring-cyan-200 rounded-xl shadow-sm bg-slate-50"
                        />
                    </div>

                    <!-- 2. User Select -->
                    <div :class="{ 'opacity-60 pointer-events-none grayscale': !form_data.branch_id }" 
                         class="transition-all duration-300 group">
                        
                        <BaseSelect
                            v-model="form_data.user_name"
                            :options="userOption"
                            clearable
                            label-key="user_name"
                            value-key="user_name"
                            :placeholder="t('select_user')"
                            class="bg-slate/0 transition-all duration-300 rounded-xl group-hover:shadow-sm"
                        />
                    </div>

                    <!-- 3. Password Input -->
                    <div class="space-y-1">
                        <!-- <label class="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wider flex items-center gap-1">
                            {{ t("password") }} <span class="text-red-500">*</span>
                        </label> -->
                        <div class="relative group">
                            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <input 
                                v-model="form_data.password" 
                                :type="showPassword ? 'text' : 'password'"
                                class="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:bg-white transition-all"
                                :placeholder="t('password_placeholder') || 'Parolingizni kiriting'" 
                            />
                            <button type="button" @click="showPassword = !showPassword"
                                class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-cyan-600 cursor-pointer transition-colors focus:outline-none">
                                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 011.574-2.59M5.753 5.753A9.957 9.957 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.058 10.058 0 01-3.2 5.5" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.88 9.88l4.24 4.24" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <button type="submit" :disabled="isLoading"
                        class="w-full relative overflow-hidden flex items-center justify-center py-3.5 px-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 transform transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4 group">
                        
                        <!-- Shine effect -->
                        <div class="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shine"></div>

                        <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span class="tracking-wide">{{ isLoading ? t("loading") || 'Kirish' : t("enter") }}</span>
                        <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </button>
                    
                    <div class="flex items-center justify-center mt-6 space-x-2 text-xs text-slate-400 font-medium">
                        <svg class="w-3 h-3 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        <span>{{ t("protected_system") }} v2.0</span>
                    </div>

                </form>

                <!-- Footer (Inside card) -->
                <div class="mt-6 text-center border-t border-slate-100 pt-4">
                    <p class="text-slate-400 text-[11px]">
                        &copy; {{ new Date().getFullYear() }} <span class="text-cyan-600 font-bold">CRM</span>. {{ t("all_rights_reserved") }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Rasmni juda sekin yaqinlashtirish animatsiyasi */
@keyframes slowZoom {
    0% { transform: scale(1); }
    100% { transform: scale(1.1); }
}

.animate-slow-zoom {
    animation: slowZoom 30s ease-in-out infinite alternate;
}

/* Formani pastdan yuqoriga silliq chiqarish */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in-up {
    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Tugma yaltirashi */
@keyframes shine {
    100% {
        left: 125%;
    }
}
.group-hover\:animate-shine:hover {
    animation: shine 0.75s;
}

/* Xatolik silkinishi */
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
    20%, 40%, 60%, 80% { transform: translateX(4px); }
}

.animate-shake {
    animation: shake 0.4s cubic-bezier(.36, .07, .19, .97) both;
}
</style>