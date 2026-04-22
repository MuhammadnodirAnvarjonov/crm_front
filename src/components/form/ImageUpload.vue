<template>
    <div class="space-y-3">
        <!-- Label -->
        <label v-if="label" class="text-sm font-medium text-gray-700 block">
            {{ label }}
        </label>

        <!-- 1. Rasm yuklanmagan holat (Upload Box) -->
        <div v-if="!modelValue && !localPreview" class="border-2 border-dashed border-gray-300 rounded-xl p-6
             flex flex-col items-center justify-center gap-3 cursor-pointer
             hover:border-blue-500 hover:bg-blue-50 transition group bg-white" @click="selectFile" @dragover.prevent
            @drop.prevent="dropFile">

            <input ref="fileInput" type="file" class="hidden" accept="image/*" @change="handleFile" />

            <div
                class="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition">
                🖼️
            </div>

            <div class="text-center">
                <p class="text-gray-600 text-sm">
                    <span class="font-medium text-blue-600">Rasm yuklang</span> yoki tashlang
                </p>
                <p class="text-gray-400 text-xs mt-1">{{ placeholder || 'JPG, PNG, GIF (max 5MB)' }}</p>
            </div>

            <p v-if="isUploading" class="text-blue-600 text-sm font-medium animate-pulse">
                Yuklanmoqda...
            </p>
        </div>

        <!-- 2. Rasm mavjud holat (Preview & Actions) -->
        <div v-else class="relative w-full overflow-hidden rounded-xl border border-gray-200 group">
            <!-- Rasm -->
            <img :src="previewUrl" class="w-full h-64 object-cover bg-gray-50" alt="Uploaded image" />

            <!-- Ustidagi buttonlar (Hover bo'lganda chiqadi) -->
            <div
                class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                <!-- O'zgartirish -->
                <button type="button" @click="selectFile"
                    class="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-100 transition">
                    🔄 Almashtirish
                </button>

                <!-- O'chirish -->
                <button type="button" @click="removeImage"
                    class="bg-white text-red-500 p-2 rounded-lg shadow-sm hover:bg-gray-100 transition"
                    title="Rasmni o'chirish">
                    🗑️
                </button>
            </div>

            <!-- Hidden Input (Almashtirish uchun kerak) -->
            <input ref="fileInput" type="file" class="hidden" accept="image/*" @change="handleFile" />

            <!-- Yuklash jarayoni overlay -->
            <div v-if="isUploading" class="absolute inset-0 bg-white/80 flex items-center justify-center">
                <p class="text-blue-600 font-medium animate-pulse">Yangilanmoqda...</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, inject, computed } from "vue"
import uploadService from "@/services/upload.service";

// Props va Model
const props = defineProps({
    label: String,
    placeholder: String
})

// v-model="form.image" (faqat rasm nomi saqlanadi, masalan: "photo_123.jpg")
const modelValue = defineModel()

// Global Base URL ni olish (http://localhost:4000/api/v1/uploads/)
const baseUrl = inject("fileUrl", "")

const fileInput = ref(null)
const localPreview = ref(null) // Yangi yuklangan fayl uchun vaqtinchalik blob
const isUploading = ref(false)

// 🟢 Rasm manzilini aniqlash (Computed)
const previewUrl = computed(() => {
    // 1. Agar yangi rasm tanlangan bo'lsa (local blob)
    if (localPreview.value) {
        return localPreview.value
    }
    // 2. Agar bazadan kelgan rasm nomi bo'lsa (Edit mode)
    if (modelValue.value) {
        // Base URL oxirida '/' bor-yo'qligini tekshirib qo'shamiz
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

    // Lokal ko'rish uchun (tezkor UI uchun)
    localPreview.value = URL.createObjectURL(file)
    isUploading.value = true

    try {
        const formData = new FormData()
        formData.append("file", file)

        const res = await uploadService.uploadFile(formData)

        // Backenddan qaytgan fayl nomini modelga yozamiz
        // Masalan: res.file = "1748392_image.jpg"
        modelValue.value = res?.file || res?.data?.file // API javobiga qarab moslang

    } catch (e) {
        console.error("Upload xatosi:", e)
        alert("Rasm yuklashda xatolik yuz berdi")
        removeImage() // Xato bo'lsa previewni o'chiramiz
    } finally {
        isUploading.value = false
    }
}

const removeImage = () => {
    modelValue.value = null
    localPreview.value = null
    if (fileInput.value) fileInput.value.value = ""
}
</script>