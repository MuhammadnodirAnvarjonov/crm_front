<template>
    <div class="p-5 space-y-4">
        <h3 class="text-lg font-semibold border-b pb-2 flex items-center gap-2">
            <span>👁️</span> {{ $t('role_info') }}
        </h3>

        <!-- 🔹 Asosiy ma'lumotlar -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
                <p class="text-gray-500">{{ $t('name') }}</p>
                <p class="font-medium text-gray-800">{{ role.name || '-' }}</p>
            </div>

            <div>
                <p class="text-gray-500">{{ $t('comment') }}</p>
                <p class="font-medium text-gray-800">{{ role.comment || '-' }}</p>
            </div>

            <div>
                <p class="text-gray-500">{{ $t('created_at') }}</p>
                <p class="font-medium text-gray-800">
                    {{ dayJS(role.createdAt).format('YYYY-MM-DD HH:mm') }}
                </p>
            </div>

            <div>
                <p class="text-gray-500">{{ $t('updated_at') }}</p>
                <p class="font-medium text-gray-800">
                    {{ dayJS(role.updatedAt).format('YYYY-MM-DD HH:mm') }}
                </p>
            </div>
        </div>

        <!-- 🔹 Settings (boolean flags) -->
        <div>
            <h4 class="text-sm text-gray-700 font-semibold mb-3">
                ⚙️ {{ $t('settings') }}
            </h4>

            <div v-if="parsedSettings" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div v-for="(value, key) in parsedSettings" :key="key" class="flex items-center gap-2 text-sm">
                    <span class="inline-flex items-center justify-center w-5 h-5 rounded border"
                        :class="value ? 'bg-green-500 border-green-600' : 'bg-gray-200 border-gray-300'">
                        <svg v-if="value" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                            stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                            class="w-3 h-3">
                            <path d="M5 13l4 4L19 7" />
                        </svg>
                    </span>
                    <span class="text-gray-700">{{ keyLabels[key] || key }}</span>
                </div>
            </div>

            <p v-else class="text-gray-400 text-sm">Hech qanday sozlama mavjud emas</p>
        </div>

        <!-- 🔹 Tugmalar -->
        <div class="flex justify-end mt-5 gap-2">
            <button type="button" @click="$emit('close')"
                class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg font-medium transition">
                {{ $t('close') }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed, inject } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const dayJS = inject("dayJS");

const props = defineProps({
    role: {
        type: Object,
        required: true,
    },
});

// 🔹 JSON string bo‘lsa – parse qilamiz
const parsedSettings = computed(() => {
    if (!props.role?.settings) return null;
    try {
        return typeof props.role.settings === "string"
            ? JSON.parse(props.role.settings)
            : props.role.settings;
    } catch (e) {
        console.warn("Settings JSON xato:", e);
        return null;
    }
});

// 🔹 Sozlamalar uchun label tarjimalari
const keyLabels = {
    branch: "Filial tanlash",
    disabled_input: "Kiritish bloklangan",
    reg_create: "Ro‘yxat yaratish",
    reg_delete: "Ro‘yxat o‘chirish",
};
</script>
