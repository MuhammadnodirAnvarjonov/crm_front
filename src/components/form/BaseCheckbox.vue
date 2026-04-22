<template>
  <label :class="[
    'inline-flex items-center cursor-pointer group select-none transition-all duration-200',
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  ]">
    <!-- Yashirin haqiqiy input (Screen readers uchun kerak) -->
    <input type="checkbox" v-model="model" :disabled="disabled" class="peer sr-only" />

    <!-- Checkbox qutichasi (Custom Design) -->
    <div :class="[
      'relative flex items-center justify-center border-2 rounded-lg transition-all duration-200 ease-in-out',
      'bg-white border-gray-300 shadow-sm',
      'group-hover:border-blue-400', // Hover effekti
      'peer-focus:ring-4 peer-focus:ring-blue-100 peer-focus:border-blue-500', // Focus effekti
      'peer-checked:bg-blue-600 peer-checked:border-blue-600', // Checked holati
      sizeClasses[size].box // O'lcham klasslari
    ]">
      <!-- Tichka (Check) Ikonkasi -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
        stroke-linecap="round" stroke-linejoin="round" :class="[
          'text-white transform transition-all duration-200 ease-out',
          model ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
          sizeClasses[size].icon
        ]">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>

    <!-- Label matni -->
    <span v-if="label" :class="[
      'ml-3 font-medium text-gray-700 transition-colors',
      'peer-checked:text-gray-900',
      sizeClasses[size].text
    ]">
      {{ label }}
    </span>
  </label>
</template>

<script setup>
import { computed } from 'vue'

const model = defineModel()

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md', // Default o'lcham
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

// O'lchamlar uchun maxsus klasslar to'plami
const sizeClasses = {
  sm: {
    box: 'w-4 h-4 rounded-sm',
    icon: 'w-3 h-3',
    text: 'text-xs'
  },
  md: {
    box: 'w-5 h-5 rounded-md',
    icon: 'w-3.5 h-3.5',
    text: 'text-sm'
  },
  lg: {
    box: 'w-6 h-6 rounded-lg',
    icon: 'w-4 h-4',
    text: 'text-base'
  }
}
</script>