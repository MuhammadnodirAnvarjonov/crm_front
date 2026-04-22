<template>
  <Teleport to="body">
    <!-- 
      v-bind="$attrs" ni shu yerga qo'shamiz. 
      Endi komponentga berilgan class'lar shu divga tushadi 
    -->
    <div
      v-if="isOpen"
      v-bind="$attrs"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="backdropClick"
    >
      <div
        class="bg-white rounded-xl shadow-xl flex flex-col relative animate-fadeIn w-full max-h-[95vh]"
        :style="{ maxWidth: widthValue }"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between py-3 px-4 border-b border-gray-100">
          <div class="text-xl font-bold text-gray-800">
            <slot name="title">{{ title }}</slot>
          </div>

          <button
            v-if="showClose"
            class="text-gray-400 hover:text-red-500 transition-colors p-1"
            @click="close"
          >
            <slot name="closeIcon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </slot>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="overflow-y-auto flex-1 min-h-0">
          <slot></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, onBeforeUnmount } from "vue";

// 1. BU YERDA: Atributlarni avtomatik o'tishini o'chiramiz
defineOptions({
  inheritAttrs: false
});

const props = defineProps({
  id: { type: String, required: true },
  modelValue: { type: Boolean, default: null },
  closeOnBackdrop: { type: Boolean, default: true },
  showClose: { type: Boolean, default: true },
  title: { type: String, default: "" },
  width: { type: String, default: "500px" } 
});

const emit = defineEmits(["update:modelValue"]);

const internal = ref(false);

const isOpen = computed(() => {
  return props.modelValue !== null ? props.modelValue : internal.value;
});

function open() {
  if (props.modelValue !== null) emit("update:modelValue", true);
  else internal.value = true;
}

function close() {
  if (props.modelValue !== null) emit("update:modelValue", false);
  else internal.value = false;
}

function backdropClick() {
  if (props.closeOnBackdrop) close();
}

const widthValue = computed(() => props.width);

window[`open_${props.id}`] = open;
window[`close_${props.id}`] = close;

onBeforeUnmount(() => {
  delete window[`open_${props.id}`];
  delete window[`close_${props.id}`];
});
</script>

<style>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-in-out;
}
</style>