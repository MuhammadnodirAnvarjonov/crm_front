<template>
  <div
    class="inline-flex items-center justify-center"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <!-- Agar SVG bo‘lsa -->
    <div
      v-if="isSvg"
      v-html="svgContent"
      class="w-full h-full"
      :class="iconClass"
    ></div>

    <!-- Agar PNG, JPG bo‘lsa -->
    <img
      v-else-if="iconUrl"
      :src="iconUrl"
      :alt="name"
      class="object-contain w-full h-full"
      :class="iconClass"
    />

    <!-- Agar topilmasa fallback -->
    <div
      v-else
      class="w-full h-full flex items-center justify-center text-gray-400"
    >
      ❔
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { icons } from "./icon.js";

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 24 },
  color: { type: String, default: "currentColor" },
  class: { type: String, default: "" },
});

const iconUrl = computed(() => {
  // 🔧 Fayl nomida ".svg" bo‘lsa, olib tashlaymiz
  const key = props.name.replace(/\.(svg|png|jpg|jpeg|webp)$/i, "");
  return icons[key] || "";
});

const isSvg = computed(() => iconUrl.value.endsWith(".svg"));
const svgContent = ref("");

onMounted(async () => {

  if (isSvg.value && iconUrl.value) {
    try {
      const res = await fetch(iconUrl.value);
      svgContent.value = await res.text();
    } catch (e) {
      console.warn("❌ SVG yuklanmadi:", props.name);
    }
  }
});

const iconClass = computed(() => [props.class, `text-[${props.color}]`]);
</script>