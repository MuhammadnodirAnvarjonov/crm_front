<template>
  <div>
    <label v-if="label" class="text-sm text-gray-600 dark:text-slate-200 mb-1 block">
      {{ label }}
    </label>

    <div class="relative">
      <textarea v-bind="$attrs" v-model="model" :maxlength="maxlength"
        class="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700/60 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500/40 focus:border-blue-500 dark:focus:border-blue-500 outline-none resize-none text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400"></textarea>

      <span v-if="showCount && maxlength" class="absolute right-2 bottom-1 text-xs text-gray-400 dark:text-slate-500">
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
