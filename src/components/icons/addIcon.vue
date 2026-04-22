<template>
    <div>
        <svg xmlns="http://www.w3.org/2000/svg" :class="['inline-block', sizeClass]" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24">
            <g fill="none">
                <path
                    d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2zm0 5a.75.75 0 0 0-.743.648l-.007.102v3.5h-3.5a.75.75 0 0 0-.102 1.493l.102.007h3.5v3.5a.75.75 0 0 0 1.493.102l.007-.102v-3.5h3.5a.75.75 0 0 0 .102-1.493l-.102-.007h-3.5v-3.5A.75.75 0 0 0 12 7z"
                    fill="currentColor" :stroke="color">
                </path>
            </g>
        </svg>
    </div>
</template>
<script setup>
import { computed } from "vue"
const props = defineProps({
    color: {
        type: String,
        default: "currentColor" 
    },
    size: {
        type: String,
        default: "w-5 h-5" // default o‘lcham
    }
})

// class’ga prop orqali dinamik o‘lcham kiritish
const sizeClass = computed(() => props.size)
</script>