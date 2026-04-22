<script setup>
import { computed } from 'vue';

// Props (tashqaridan keladigan ma'lumotlar)
const props = defineProps({
    // v-model bilan ishlash uchun
    modelValue: {
        type: Boolean,
        default: false,
    },
    // Rang (red, blue, green, indigo, etc.)
    color: {
        type: String,
        default: 'blue',
    },
    // O'lcham (sm, md, lg)
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg'].includes(value),
    },
    // O'chirilgan holat (disabled)
    disabled: {
        type: Boolean,
        default: false,
    },
});

// Emit (o'zgarishni ota komponentga xabar qilish)
const emit = defineEmits(['update:modelValue']);

// Checkbox o'zgarganda ishlaydigan funksiya
const toggle = (event) => {
    if (!props.disabled) {
        emit('update:modelValue', event.target.checked);
    }
};

// O'lchamlar uchun sozlamalar (Tailwind classlari)
const sizeClasses = computed(() => {
    const sizes = {
        sm: {
            wrapper: 'w-7 h-4',
            thumb: 'h-3 w-3',
            translate: 'peer-checked:translate-x-3',
        },
        md: {
            wrapper: 'w-11 h-6',
            thumb: 'h-5 w-5',
            translate: 'peer-checked:translate-x-full', // 100% suriladi
        },
        lg: {
            wrapper: 'w-14 h-7',
            thumb: 'h-6 w-6',
            translate: 'peer-checked:translate-x-7',
        },
    };
    return sizes[props.size];
});

// Rang klassini hisoblash
// Eslatma: Tailwind JIT mode ishlatilsa, ranglarni safelist qilish kerak bo'lishi mumkin,
// yoki to'liq rang nomini prop sifatida yuborish kerak.
const colorClass = computed(() => {
    return `peer-checked:bg-${props.color}-500 peer-focus:ring-${props.color}-300`;
});
</script>

<template>
    <label class="relative inline-flex items-center select-none transition-opacity duration-200"
        :class="[disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer']">
        <!-- Yashirin Input -->
        <input type="checkbox" :checked="modelValue" @change="toggle" :disabled="disabled" class="sr-only peer">

        <!-- Switch orqa foni (Track) -->
        <div class="bg-gray-200 peer-focus:outline-none peer-focus:ring-2 rounded-full peer transition-all duration-300 ease-in-out"
            :class="[sizeClasses.wrapper, colorClass]"></div>

        <!-- Switch tugmasi (Thumb) -->
        <div class="absolute bg-white border border-gray-300 rounded-full shadow-sm transition-all duration-300 ease-in-out top-[2px] left-[2px]"
            :class="[sizeClasses.thumb, sizeClasses.translate, { 'border-white': modelValue }]"></div>
    </label>
</template>