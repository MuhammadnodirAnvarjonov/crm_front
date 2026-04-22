<template>
    <div class="p-5 space-y-4">
        <h3 class="text-lg font-semibold border-b pb-2 flex items-center gap-2">
            {{ $t("section") }}
        </h3>

        <!-- 🔹 Section info -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <!-- Name -->
            <div>
                <p class="text-gray-500">{{ $t("name") }}</p>
                <p class="font-medium text-gray-800">{{ model.name || "-" }}</p>
            </div>

            <!-- Branch -->
            <div>
                <p class="text-gray-500">{{ $t("branch") }}</p>
                <p class="font-medium text-gray-800">
                    {{ model?.branch?.name || "-" }}
                </p>
            </div>

            <!-- Created At -->
            <div>
                <p class="text-gray-500">{{ $t("created_at") }}</p>
                <p class="font-medium text-gray-800">
                    {{ dayJS(model.createdAt).format("YYYY-MM-DD HH:mm") }}
                </p>
            </div>

            <!-- Updated At -->
            <div>
                <p class="text-gray-500">{{ $t("updated_at") }}</p>
                <p class="font-medium text-gray-800">
                    {{ dayJS(model.updatedAt).format("YYYY-MM-DD HH:mm") }}
                </p>
            </div>
        </div>

        <!-- 🔊 Audio preview -->
        <div v-if="model.audio_url" class="mt-4">
            <BaseAudio :src="fileUrl + model.audio_url" />
        </div>

        <!-- Close button -->
        <div class="flex justify-end mt-5 gap-2">
            <button type="button" @click="$emit('close')"
                class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg font-medium transition">
                {{ $t("close") }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { inject } from "vue";
import BaseAudio from "@/components/form/BaseAudio.vue";

const dayJS = inject("dayJS");
const fileUrl = inject("fileUrl");

const props = defineProps({
    model: {
        type: Object,
        required: true,
    },
});
</script>
