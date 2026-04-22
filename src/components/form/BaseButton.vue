<template>
  <button @click="$emit('click')" :disabled="loading || disabled" :type="type" :class="[
    'relative overflow-hidden font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:active:scale-100 group shadow-lg',
    statusClasses[status],
    sizeClasses[size],
    fullWidth ? 'w-full' : 'w-auto'
  ]">
    <!-- Loading Spinner (SVG orqali, pi-spin o'rniga) -->
    <svg v-if="loading" class="animate-spin h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none"
      viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
      </path>
    </svg>

    <!-- Icon Slot (Agar loading bo'lmasa ko'rinadi) -->
    <div v-if="!loading && ($slots.icon || icon)"
      class="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 flex items-center justify-center">
      <slot name="icon">
        <!-- Agar icon nomi string bo'lib kelsa (i tagi uchun) -->
        <i :class="icon"></i>
      </slot>
    </div>

    <span v-if="label || $slots.default" class="whitespace-nowrap">
      <slot>{{ label }}</slot>
    </span>

    <!-- Hover Glass Effect -->
    <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
    </div>
  </button>
</template>

<script setup>
const props = defineProps({
  label: String,
  icon: String, // String ko'rinishida icon klassi (ixtiyoriy)
  loading: Boolean,
  disabled: Boolean,
  fullWidth: Boolean,
  type: { type: String, default: 'button' },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  status: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'success', 'danger', 'warning', 'gray', 'white', 'pink'].includes(v)
  }
});

defineEmits(['click']);

const sizeClasses = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base'
};

const statusClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200',
  success: 'bg-green-600 hover:bg-green-700 text-white shadow-green-200',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-red-200',
  warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-100',
  gray: 'bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-transparent border border-gray-200',
  white: 'bg-white hover:bg-gray-50 text-gray-800 shadow-gray-200 border border-gray-200',
  pink: 'bg-pink-500 hover:bg-pink-600 text-white shadow-pink-200',
  table: 'group p-2 rounded-lg bg-white border border-amber-100 text-amber-600 hover:bg-amber-50 hover:border-amber-200 active:scale-90 transition-all duration-200'
};
</script>