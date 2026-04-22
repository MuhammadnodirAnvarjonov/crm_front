<template>
  <div>
    <label v-if="label" class="text-sm text-gray-600 mb-1 block">
      {{ label }}
    </label>

    <div class="relative">
      <textarea v-bind="$attrs" v-model="model" :maxlength="maxlength"
        class="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none resize-none text-gray-800 placeholder-gray-400"></textarea>

      <span v-if="showCount && maxlength" class="absolute right-2 bottom-1 text-xs text-gray-400">
        {{ model?.length || 0 }}/{{ maxlength }}
      </span>
    </div>
  </div>
</template>

<script setup>
const model = defineModel()

const props = defineProps({
  label: String,
  maxlength: Number,
  showCount: Boolean,
})
</script>
