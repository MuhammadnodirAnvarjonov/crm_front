<template>
    <div class="space-y-3">
        <label v-if="label" class="text-sm text-gray-600 mb-1 block">{{ label }}</label>

        <!-- CUSTOM UPLOAD UI -->
        <div class="border-2 border-dashed border-gray-300 rounded-xl p-5
           flex flex-col items-center justify-center gap-2 cursor-pointer
           hover:border-blue-500 hover:bg-blue-50 transition" @click="selectFile" @dragover.prevent
            @drop.prevent="dropFile">
            <input ref="fileInput" type="file" class="hidden" @change="handleFile" />

            <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl">
                📁
            </div>

            <p class="text-gray-600 text-sm">
                <span class="font-medium text-blue-600">Fayl yuklang</span> yoki tashlang
            </p>

            <p v-if="fileName" class="text-gray-800 text-sm mt-1">
                📄 {{ fileName }}
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue"

const model = defineModel()
defineProps({ label: String })

const fileInput = ref(null)
const fileName = ref("")

const selectFile = () => fileInput.value.click()

const dropFile = (e) => {
    const file = e.dataTransfer.files[0]
    processFile(file)
}

const handleFile = (e) => {
    const file = e.target.files[0]
    processFile(file)
}

const processFile = (file) => {
    if (!file) return

    model.value = file
    fileName.value = file.name
}
</script>
