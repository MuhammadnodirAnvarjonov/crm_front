<template>
    <div :class="['relative group transition-all duration-300', fullWidth ? 'w-full' : 'w-auto sm:w-80']">

        <!-- Search Icon (SVG) -->
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg :class="[
                'text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300',
                sizeMap[size].icon
            ]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>

        <!-- Input -->
        <input type="text" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"
            :placeholder="placeholder || $t('search')" :class="[
                'w-full bg-gray-50 border border-gray-100 rounded-2xl outline-none transition-all duration-300 shadow-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500',
                sizeMap[size].input
            ]" />

        <!-- Tozalash tugmasi (X icon SVG) -->
        <button v-if="modelValue && clearable" @click="$emit('update:modelValue', '')" type="button"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-400 transition-colors">
            <svg :class="sizeMap[size].clearIcon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>
</template>

<script setup>
const props = defineProps({
    modelValue: String,
    placeholder: String,
    clearable: { type: Boolean, default: true },
    fullWidth: { type: Boolean, default: false },
    size: {
        type: String,
        default: 'md', // sm, md, lg
        validator: (v) => ['sm', 'md', 'lg'].includes(v)
    }
});

defineEmits(['update:modelValue']);

// O'lchamlarga qarab SVG va Input klasslari
const sizeMap = {
    sm: {
        input: 'py-2 pl-10 pr-8 text-xs',
        icon: 'h-4 w-4',
        clearIcon: 'h-3.5 w-3.5'
    },
    md: {
        input: 'py-2.5 pl-11 pr-10 text-sm',
        icon: 'h-5 w-5',
        clearIcon: 'h-4 w-4'
    },
    lg: {
        input: 'py-3.5 pl-14 pr-12 text-base',
        icon: 'h-6 w-6',
        clearIcon: 'h-5 w-5'
    }
};
</script>