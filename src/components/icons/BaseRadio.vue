<script setup>
import { computed } from 'vue';

const props = defineProps({
    modelValue: {
        type: [String, Number, Boolean, Object], // Object va null ham bo'lishi mumkin
        default: ''
    },
    value: {
        type: [String, Number, Boolean],
        required: true
    },
    label: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    color: {
        type: String,
        default: 'blue'
    },
    size: {
        type: String,
        default: 'md',
        validator: (val) => ['sm', 'md', 'lg', 'xl'].includes(val)
    }
});

const emit = defineEmits(['update:modelValue']);

// Radio tanlanganligini tekshirish
const isChecked = computed(() => props.modelValue === props.value);

// Oddiy bosilganda (Tanlash)
const handleChange = () => {
    if (!props.disabled) {
        emit('update:modelValue', props.value);
    }
};

// ---------------------------------------------------------
// YANGI QO'SHILGAN QISM: Double Click (Reset)
// ---------------------------------------------------------
const handleDblClick = () => {
    if (props.disabled) return;

    // Agar radio allaqachon tanlangan bo'lsa va unga 2 marta bosilsa
    if (isChecked.value) {
        // Qiymatni null ga aylantiramiz (tanlovni bekor qilish)
        emit('update:modelValue', null);
    }
};
// ---------------------------------------------------------

const sizeStyles = {
    sm: { outer: 'w-8 h-3', inner: 'w-2 h-2', text: 'text-xs ml-2' },
    md: { outer: 'w-8 h-5', inner: 'w-3 h-3', text: 'text-sm ml-3' },
    lg: { outer: 'w-10 h-6', inner: 'w-4 h-4', text: 'text-base ml-3' },
    xl: { outer: 'w-12 h-7', inner: 'w-5 h-5', text: 'text-lg ml-4' }
};

const currentSize = computed(() => sizeStyles[props.size] || sizeStyles.md);

const colorClasses = computed(() => {
    const colors = {
        blue: { border: 'border-blue-500', bg: 'bg-blue-500' },
        red: { border: 'border-red-500', bg: 'bg-red-500' },
        green: { border: 'border-green-500', bg: 'bg-green-500' },
        yellow: { border: 'border-yellow-400', bg: 'bg-yellow-400' },
        indigo: { border: 'border-indigo-500', bg: 'bg-indigo-500' },
        gray: { border: 'border-gray-500', bg: 'bg-gray-500' },
    };

    if (props.disabled) {
        return 'border-gray-300 bg-gray-100';
    }

    const activeColor = colors[props.color] || colors.blue;

    if (isChecked.value) {
        return `${activeColor.border} ${activeColor.bg}`;
    } else {
        return `${activeColor.border} bg-white hover:bg-gray-50`;
    }
});
</script>

<template>
    <!-- Labelga @dblclick.prevent hodisasi qo'shildi -->
    <label 
        class="inline-flex items-center cursor-pointer group relative select-none"
        :class="{ 'opacity-50 cursor-not-allowed': disabled }"
        @dblclick.prevent="handleDblClick"
    >
        <input 
            type="radio" 
            class="sr-only peer" 
            :name="name" 
            :value="value" 
            :checked="isChecked" 
            :disabled="disabled"
            @change="handleChange" 
        />

        <!-- Tashqi OVAL -->
        <div 
            class="border-2 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out"
            :class="[
                colorClasses,
                currentSize.outer,
                'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-blue-400'
            ]"
        >
            <!-- Ichki nuqta -->
            <div 
                class="bg-white rounded-full transform transition-transform duration-200" 
                :class="[
                    isChecked ? 'scale-100' : 'scale-0',
                    currentSize.inner
                ]"
            ></div>
        </div>

        <!-- Label matni -->
        <span 
            v-if="label" 
            class="font-medium text-gray-700" 
            :class="[
                currentSize.text,
                disabled ? 'text-gray-400' : ''
            ]"
        >
            {{ label }}
        </span>
    </label>
</template>