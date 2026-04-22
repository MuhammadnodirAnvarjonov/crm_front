<template>
    <div>
        <label class="text-md text-gray-600 mb-1 block font-bold">
            {{ label }}
        </label>
    </div>
</template>

<script setup>

const props = defineProps({
    label: String,
})
</script>