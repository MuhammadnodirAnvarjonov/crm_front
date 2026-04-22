<template>
  <div>
    <label v-if="label" class="text-sm text-gray-600 mb-1 block">{{ label }}</label>
    <div class="w-full border rounded-md px-3 py-2 bg-gray-50 text-gray-800 min-h-[38px] flex items-center">
      {{ value || "-" }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: [String, Number, Boolean],
});
</script>
