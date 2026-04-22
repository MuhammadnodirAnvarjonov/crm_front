<template>
  <div class="p-5 space-y-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
      <div>
        <p class="text-gray-500">{{ $t('min_time') }}</p>
        <p class="font-medium text-gray-800">{{ model.min_time }} daqiqa</p>
      </div>
      <div>
        <p class="text-gray-500">{{ $t('max_time') }}</p>
        <p class="font-medium text-gray-800">{{ model.max_time }} daqiqa</p>
      </div>
      <div>
        <p class="text-gray-500">{{ $t('summa') }}</p>
        <p class="font-medium text-blue-600 text-lg">{{ useSummaFormat(model.summa) }}</p>
      </div>
      <div>
        <p class="text-gray-500">{{ $t('description') }}</p>
        <p class="font-medium text-gray-800">{{ model.description || '-' }}</p>
      </div>
    </div>

    <div class="flex justify-end mt-5 gap-2">
      <button type="button" @click="$emit('close')"
        class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg font-medium transition">
        {{ $t('close') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useSummaFormat } from "@/composables/NumberFormat";

defineProps({
  model: { type: Object, required: true },
});
</script>
