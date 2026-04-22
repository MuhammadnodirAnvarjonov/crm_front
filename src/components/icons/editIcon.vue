<template>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" :class="['inline-block', size]" :width="width"
        :height="height" fill="none" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3"></path>
        <path d="M9 15h3l8.5-8.5a1.5 1.5 0 0 0-3-3L9 12v3"></path>
        <path d="M16 5l3 3"></path>
    </svg>
</template>

<script setup>
const props = defineProps({
    color: {
        type: String,
        default: "currentColor"
    },
    size: {
        type: String,
        default: "w-5 h-5" // Tailwind klassi uchun
    },
    width: {
        type: [String, Number],
        default: 20 // 20px (w-5 ga teng)
    },
    height: {
        type: [String, Number],
        default: 20 // 20px (h-5 ga teng)
    }
})
</script>