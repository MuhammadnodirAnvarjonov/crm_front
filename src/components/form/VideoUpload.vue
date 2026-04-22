<template>
    <div class="space-y-3">
        <!-- Label -->
        <label v-if="label" class="text-sm font-medium text-gray-700 block">
            {{ label }}
        </label>

        <!-- 1. Video yuklanmagan holat (Upload Box) -->
        <div v-if="!modelValue && !localPreview" class="border-2 border-dashed border-gray-300 rounded-xl p-6
             flex flex-col items-center justify-center gap-3 cursor-pointer
             hover:border-blue-500 hover:bg-blue-50 transition group bg-white" @click="selectFile" @dragover.prevent
            @drop.prevent="dropFile">

            <input ref="fileInput" type="file" class="hidden" accept="video/mp4,video/x-m4v,video/*"
                @change="handleFile" />

            <!-- Video Icon -->
            <div
                class="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition">
                🎥
            </div>

            <div class="text-center">
                <p class="text-gray-600 text-sm">
                    <span class="font-medium text-blue-600">Video yuklang</span> yoki tashlang
                </p>
                <p class="text-gray-400 text-xs mt-1">{{ placeholder || 'MP4, MOV, AVI (max 20MB)' }}</p>
            </div>

            <p v-if="isUploading" class="text-blue-600 text-sm font-medium animate-pulse">
                Yuklanmoqda...
            </p>
        </div>

        <!-- 2. Video mavjud holat (Preview & Actions) -->
        <div v-else class="relative w-full overflow-hidden rounded-xl border border-gray-200 group bg-black">
            <!-- Video Player -->
            <video :src="previewUrl" class="w-full h-64 object-contain" controls preload="metadata">
                Sizning brauzeringiz videoni qo'llab-quvvatlamaydi.
            </video>

            <!-- Ustidagi buttonlar (Hover bo'lganda chiqadi) -->
            <div
                class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3 z-10">
                <!-- O'zgartirish -->
                <button type="button" @click="selectFile"
                    class="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-100 transition">
                    🔄 Almashtirish
                </button>

                <!-- O'chirish -->
                <button type="button" @click="removeFile"
                    class="bg-white text-red-500 p-2 rounded-lg shadow-sm hover:bg-gray-100 transition"
                    title="Videoni o'chirish">
                    🗑️
                </button>
            </div>

            <!-- Hidden Input -->
            <input ref="fileInput" type="file" class="hidden" accept="video/*" @change="handleFile" />

            <!-- Yuklash overlay -->
            <div v-if="isUploading" class="absolute inset-0 bg-white/90 z-20 flex items-center justify-center">
                <p class="text-blue-600 font-medium animate-pulse">Video yuklanmoqda...</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, inject, computed } from "vue"
import uploadService from "@/services/upload.service";

// Props
const props = defineProps({
    label: String,
    placeholder: String
})

// Model (faqat fayl nomi, masalan: "video_123.mp4")
const modelValue = defineModel()

// Global Base URL
const baseUrl = inject("fileUrl", "")

const fileInput = ref(null)
const localPreview = ref(null)
const isUploading = ref(false)

// 🟢 Video manzilini aniqlash
const previewUrl = computed(() => {
    if (localPreview.value) return localPreview.value

    if (modelValue.value) {
        const separator = baseUrl.endsWith('/') ? '' : '/'
        return `${baseUrl}${separator}${modelValue.value}`
    }
    return null
})

const selectFile = () => fileInput.value?.click()
const dropFile = (e) => processFile(e.dataTransfer.files[0])
const handleFile = (e) => processFile(e.target.files[0])

const processFile = async (file) => {
    if (!file) return

    // Fayl hajmini tekshirish (Masalan 50MB)
    if (file.size > 50 * 1024 * 1024) {
        alert("Video hajmi 50MB dan oshmasligi kerak!")
        return
    }

    // Lokal preview
    localPreview.value = URL.createObjectURL(file)
    isUploading.value = true

    try {
        const formData = new FormData()
        formData.append("file", file)

        const res = await uploadService.uploadFile(formData)

        // Backend javobiga qarab to'g'irlang (res.file yoki res.data.file)
        modelValue.value = res?.file || res?.data?.file

    } catch (e) {
        console.error("Upload xatosi:", e)
        alert("Video yuklashda xatolik yuz berdi")
        removeFile()
    } finally {
        isUploading.value = false
    }
}

const removeFile = () => {
    modelValue.value = null
    localPreview.value = null
    if (fileInput.value) fileInput.value.value = ""
}
</script>