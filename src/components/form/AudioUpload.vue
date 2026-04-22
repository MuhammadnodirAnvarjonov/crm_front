<template>
    <div class="space-y-3">
        <!-- Label -->
        <label v-if="label" class="text-sm font-medium text-gray-700 block">
            {{ label }}
        </label>

        <!-- 1. Audio yuklanmagan holat (Upload Box) -->
        <div v-if="!modelValue && !localPreview" class="border-2 border-dashed border-gray-300 rounded-xl p-6
             flex flex-col items-center justify-center gap-3 cursor-pointer
             hover:border-blue-500 hover:bg-blue-50 transition group bg-white" @click="selectFile" @dragover.prevent
            @drop.prevent="dropFile">

            <input ref="fileInput" type="file" class="hidden" accept="audio/*" @change="handleFile" />

            <!-- Icon -->
            <div
                class="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition">
                🎵
            </div>

            <div class="text-center">
                <p class="text-gray-600 text-sm">
                    <span class="font-medium text-blue-600">Audio yuklang</span> yoki tashlang
                </p>
                <p class="text-gray-400 text-xs mt-1">MP3, WAV, OGG (max 10MB)</p>
            </div>

            <p v-if="isUploading" class="text-blue-600 text-sm font-medium animate-pulse">
                Yuklanmoqda...
            </p>
        </div>

        <!-- 2. Audio mavjud holat (Player & Actions) -->
        <div v-else class="relative w-full rounded-xl border border-gray-200 bg-gray-50 p-4">

            <div class="flex items-center gap-3 mb-3">
                <div
                    class="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    🎵
                </div>
                <div class="overflow-hidden">
                    <p class="text-sm font-medium text-gray-900 truncate" :title="displayFileName">
                        {{ displayFileName }}
                    </p>
                    <p class="text-xs text-gray-500">Audio fayl</p>
                </div>
            </div>

            <!-- Audio Player -->
            <audio :src="previewUrl" controls class="w-full h-10 rounded-lg mb-3" />

            <!-- Actions -->
            <div class="flex items-center gap-3">
                <button type="button" @click="selectFile"
                    class="flex-1 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm">
                    🔄 Almashtirish
                </button>
                <button type="button" @click="removeFile"
                    class="flex-none bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition shadow-sm"
                    title="O'chirish">
                    🗑️
                </button>
            </div>

            <!-- Hidden Input -->
            <input ref="fileInput" type="file" class="hidden" accept="audio/*" @change="handleFile" />

            <!-- Yuklash jarayoni overlay -->
            <div v-if="isUploading"
                class="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl z-10">
                <p class="text-blue-600 font-medium animate-pulse">Yangilanmoqda...</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, inject, computed } from "vue"
import uploadService from "@/services/upload.service"

// Props va Model
defineProps({ label: String })
const modelValue = defineModel() // form.audio_url shu yerga tushadi

// Global Base URL (masalan: http://localhost:4000/api/v1/uploads/)
// Agar provide qilinmagan bo'lsa, bo'sh string oladi
const baseUrl = inject("fileUrl", "")

const fileInput = ref(null)
const localPreview = ref(null)
const localName = ref(null)
const isUploading = ref(false)

// 🟢 Audio manzilini aqlli aniqlash (Computed)
const previewUrl = computed(() => {
    // 1. Yangi yuklangan fayl (Blob) - eng ustuvor
    if (localPreview.value) {
        return localPreview.value
    }

    // 2. Bazadan kelgan ma'lumotni tekshirish
    if (modelValue.value) {
        // Agar qiymat "http" yoki "https" bilan boshlansa, demak bu to'liq URL
        if (modelValue.value.startsWith("http")) {
            return modelValue.value
        }

        // Agar faqat fayl nomi bo'lsa va bizda baseUrl bo'lsa
        if (baseUrl) {
            const separator = baseUrl.endsWith('/') ? '' : '/'
            return `${baseUrl}${separator}${modelValue.value}`
        }

        // Agar baseUrl bo'lmasa, shunchaki o'zini qaytaradi (ehtiyot chorasi)
        return modelValue.value
    }

    return null
})

// 🟢 Fayl nomini chiroyli ko'rsatish
const displayFileName = computed(() => {
    if (localName.value) return localName.value

    if (modelValue.value) {
        // Agar to'liq URL bo'lsa, faqat oxirgi qismini (fayl nomini) ajratib olamiz
        const parts = modelValue.value.split('/')
        return parts[parts.length - 1]
    }

    return "Nomsiz fayl"
})

const selectFile = () => fileInput.value?.click()

const dropFile = (e) => processFile(e.dataTransfer.files[0])
const handleFile = (e) => processFile(e.target.files[0])

const processFile = async (file) => {
    if (!file) return

    localName.value = file.name
    localPreview.value = URL.createObjectURL(file)
    isUploading.value = true

    try {
        const formData = new FormData()
        formData.append("file", file)

        const res = await uploadService.uploadFile(formData)

        // Backenddan qaytgan fayl nomini modelga yozamiz
        modelValue.value = res?.file || res?.data?.file

    } catch (e) {
        console.error("Audio upload xatosi:", e)
        alert("Audio yuklashda xatolik!")
        removeFile()
    } finally {
        isUploading.value = false
    }
}

const removeFile = () => {
    modelValue.value = null
    localPreview.value = null
    localName.value = null
    if (fileInput.value) fileInput.value.value = ""
}
</script>