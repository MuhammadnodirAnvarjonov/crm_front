<template>
    <Transition name="fade">
        <div v-if="show" class="fixed inset-0 z-[60] flex items-center justify-center p-4">

            <!-- Orqa fon (Backdrop) -->
            <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" @click="handleCancel">
            </div>

            <!-- Modal oynasi -->
            <div
                class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">

                <div class="p-6 text-center">
                    <!-- Icon (Typega qarab o'zgaradi) -->
                    <div class="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-full"
                        :class="type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'">

                        <!-- Warning Icon (Danger) -->
                        <svg v-if="type === 'danger'" xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <!-- Question Icon (Info) -->
                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <!-- Title & Message -->
                    <h3 class="text-xl font-bold text-gray-800 mb-2">{{ title }}</h3>
                    <p class="text-gray-500 text-sm leading-relaxed mb-6">{{ message }}</p>

                    <!-- Buttons -->
                    <div class="flex gap-3 justify-center">
                        <button @click="handleCancel"
                            class="px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors focus:ring-4 focus:ring-gray-100">
                            {{ cancelText }}
                        </button>

                        <button @click="handleConfirm"
                            class="px-5 py-2.5 rounded-xl text-sm font-medium text-white shadow-lg transition-all active:scale-95 focus:ring-4"
                            :class="type === 'danger'
                                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-200 shadow-red-500/30'
                                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-200 shadow-blue-500/30'">
                            {{ confirmText }}
                        </button>
                    </div>
                </div>

                    <div v-if="duration > 0" class="absolute bottom-0 left-0 h-1.5 bg-gray-100 w-full">
                    <div class="h-full transition-all ease-linear"
                        :class="type === 'danger' ? 'bg-red-500' : 'bg-blue-500'"
                        :style="{ width: progressWidth + '%', transitionDuration: '100ms' }">
                    </div>
                </div>

            </div>
        </div>
    </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    show: { type: Boolean, default: false }, // Modal ko'rinishi uchun
    title: { type: String, default: "Tasdiqlash" },
    message: { type: String, default: "Haqiqatan ham ushbu amalni bajarmoqchimisiz?" },
    confirmText: { type: String, default: "Ha, o‘chirish" },
    cancelText: { type: String, default: "Bekor qilish" },
    type: { type: String, default: "danger" }, // 'danger' yoki 'info'
    duration: { type: Number, default: 5 }, // 5 soniyada yopiladi (0 bo'lsa timer ishlamaydi)
});

const emit = defineEmits(['confirm', 'cancel']);

const progressWidth = ref(100);
let timerInterval = null;

const startTimer = () => {
    if (props.duration <= 0) return;

    progressWidth.value = 100;
    const step = 100 / (props.duration * 10); // har 100ms da yangilash

    timerInterval = setInterval(() => {
        progressWidth.value -= step;
        if (progressWidth.value <= 0) {
            handleCancel(); // Vaqt tugasa bekor qilinadi
        }
    }, 100);
};

const stopTimer = () => {
    if (timerInterval) clearInterval(timerInterval);
};

const handleConfirm = () => {
    stopTimer();
    emit('confirm');
};

const handleCancel = () => {
    stopTimer();
    emit('cancel');
};

// Modal ochilganda timerni ishga tushirish
onMounted(() => {
    if (props.show) startTimer();
});

// Agar parent komponentda v-if ishlatilsa, onMounted ishlaydi. 
// Agar v-show ishlatilsa yoki parentdan prop o'zgarsa, watch kerak bo'lishi mumkin. 
// Hozirgi holatda oddiy onMounted yetarli deb hisoblaymiz, lekin xavfsizlik uchun:
onUnmounted(() => {
    stopTimer();
});
</script>

<style scoped>
/* Modal Fade Animatsiyasi */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Modal ichki qismi (Zoom) */
.fade-enter-active .transform,
.fade-leave-active .transform {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-enter-from .transform,
.fade-leave-to .transform {
    transform: scale(0.95);
}
</style>