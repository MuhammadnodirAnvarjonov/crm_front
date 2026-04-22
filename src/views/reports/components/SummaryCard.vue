<template>
  <div :class="['rounded-xl border p-3 flex flex-col gap-1', colorClass]">
    <p class="text-xs opacity-70 font-medium leading-tight">{{ label }}</p>
    <p class="text-lg font-bold leading-tight">{{ displayValue }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useSummaFormat } from '@/composables/NumberFormat';

const props = defineProps({
  label: String,
  value: [Number, String],
  type: { type: String, default: 'count' }, // 'count' | 'money'
  color: { type: String, default: 'blue' },
});

const colorMap = {
  blue:   'bg-blue-50 border-blue-200 text-blue-700',
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  green:  'bg-green-50 border-green-200 text-green-700',
  red:    'bg-red-50 border-red-200 text-red-700',
  orange: 'bg-orange-50 border-orange-200 text-orange-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
  teal:   'bg-teal-50 border-teal-200 text-teal-700',
  amber:  'bg-amber-50 border-amber-200 text-amber-700',
};

const colorClass = computed(() => colorMap[props.color] || colorMap.blue);
const displayValue = computed(() =>
  props.type === 'money' ? useSummaFormat(props.value || 0) : (props.value || 0)
);
</script>
