<template>
    <div class="flex items-center gap-4 p-4 bg-white shadow-md rounded-xl border border-gray-200">

        <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl">
            🎵
        </div>

        <div class="flex-1">
            <audio v-if="src" :src="src" controls class="w-full mt-1 rounded-lg border"></audio>
            <p v-else class="text-gray-400 text-xs">Audio topilmadi</p>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
    src: { type: String, required: true }   // PROP sifatida URL qabul qilamiz
});

const fileName = ref("");

watch(
    () => props.src,
    (url) => {
        if (!url) {
            fileName.value = "Audio yo‘q";
            return;
        }

        try {
            const parts = url.split("/");
            fileName.value = parts.pop();
        } catch {
            fileName.value = "Audio";
        }
    },
    { immediate: true }
);
</script>

<style scoped>
audio::-webkit-media-controls-panel {
    background-color: #f8fafc;
}
</style>
