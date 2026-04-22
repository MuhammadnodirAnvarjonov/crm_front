<template>
  <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide select-none flex-wrap">

    <!-- Barchasi tugmasi -->
    <button v-if="!dontShowAll" @click="$emit('update:modelValue', allValue)"
      class="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap border flex items-center gap-1.5 flex-shrink-0"
      :style="isAll ? activeStyle : inactiveStyle">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24"
        stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
      </svg>
      <span>{{ allLabel || t('all') || 'Barchasi' }}</span>
    </button>

    <!-- Items loop -->
    <button v-for="item in items" :key="item[valueKey]"
      @click="$emit('update:modelValue', item[valueKey])"
      class="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap border flex items-center gap-1.5 flex-shrink-0"
      :style="modelValue === item[valueKey] ? activeStyle : inactiveStyle">

      <!-- Rasm / Initial (ixtiyoriy) -->
      <div v-if="showImage"
        class="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center border transition-colors"
        :style="modelValue === item[valueKey]
          ? 'border-color:rgba(255,255,255,0.35); background:rgba(255,255,255,0.2)'
          : 'border-color:#f3f4f6; background:#f3f4f6'">
        <img v-if="item[imageKey]"
          :src="(fileUrl || '') + item[imageKey]"
          class="w-full h-full object-cover"
          @error="e => e.target.style.display = 'none'"
          alt="" />
        <span v-else class="text-[10px] font-bold uppercase"
          :style="modelValue === item[valueKey] ? 'color:white' : 'color:#2563eb'">
          {{ item[labelKey]?.charAt(0) }}
        </span>
      </div>

      <span>{{ item[labelKey] }}</span>
    </button>

  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  dontShowAll: { type: Boolean, default: false },
  modelValue:  { default: null },
  items:       { type: Array,   default: () => [] },
  valueKey:    { type: String,  default: 'id' },
  labelKey:    { type: String,  default: 'name' },
  allValue:    { default: null },
  allLabel:    { type: String,  default: null },
  showImage:   { type: Boolean, default: false },
  imageKey:    { type: String,  default: 'image' },
  fileUrl:     { type: String,  default: '' },
});

defineEmits(['update:modelValue']);

const isAll = computed(() => props.modelValue === props.allValue);

const activeStyle  = 'background:#E91E8C; color:white; border-color:#E91E8C; box-shadow:0 3px 12px rgba(233,30,140,0.3)';
const inactiveStyle = 'background:white; color:#6b7280; border-color:#e5e7eb';
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
