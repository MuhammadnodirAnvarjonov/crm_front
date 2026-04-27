<template>
    <div class="flex flex-col" :class="containerGap">
        <!-- Label: Hajmga qarab shrift o'zgaradi -->
        <label v-if="label" :for="uid" class="font-semibold text-gray-700 dark:text-slate-200 select-none" :class="labelSizeClasses">
            {{ label }}
            <!-- O'ZGARTIRILDI: Agar required bo'lsa, qizil yulduzcha chiqadi -->
            <span v-if="required" class="text-red-500 dark:text-red-400 ml-0.5">*</span>
        </label>

        <div class="relative">
            <input :id="uid" :required="required" v-bind="$attrs" v-model="model" :maxlength="maxlength" @input="handleInput" :type="type"
                :class="[
                    'w-full border bg-white dark:bg-slate-700/60 text-gray-900 dark:text-slate-100 shadow-sm transition-all duration-200 outline-none',
                    'border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/30',
                    'placeholder:text-gray-400 dark:placeholder:text-slate-400 disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-400 dark:disabled:text-slate-500',
                    sizeClasses
                ]" />

            <!-- Belgilar soni -->
            <span v-if="showCount && maxlength"
                class="absolute right-2 bottom-1 font-medium transition-colors pointer-events-none" :class="[
                    isNearLimit ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-slate-500',
                    size === 'sm' ? 'text-[9px]' : 'text-[10px]'
                ]">
                {{ currentLength }}/{{ maxlength }}
            </span>
        </div>
    </div>
</template>

<script setup>
import { computed, useId } from 'vue'

const model = defineModel({ type: [String, Number], default: '' })

const props = defineProps({
    label: String,
    maxlength: {
        type: [Number, String],
        default: null
    },
    showCount: Boolean,
    type: {
        type: String,
        default: 'text'
    },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
    },
    required: {
        type: Boolean,
        default: false
    } 
})

const uid = useId()

const sizeClasses = computed(() => {
    const sizes = {
        sm: 'px-2 py-1.5 text-xs rounded-md',
        md: 'px-3 py-2 text-sm rounded-lg',
        lg: 'px-4 py-2.5 text-base rounded-lg',
        xl: 'px-5 py-3 text-lg rounded-xl'
    }
    return sizes[props.size] || sizes.md
})

const labelSizeClasses = computed(() => {
    const labelSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-sm',
        xl: 'text-base'
    }
    return labelSizes[props.size] || labelSizes.md
})

const containerGap = computed(() => {
    return props.size === 'sm' ? 'gap-1' : 'gap-1.5'
})

const currentLength = computed(() => String(model.value || '').length)

const isNearLimit = computed(() => {
    if (!props.maxlength) return false
    return currentLength.value >= Number(props.maxlength) * 0.9
})

const handleInput = (event) => {
    if (!props.maxlength) return
    const val = event.target.value.toString()
    if (val.length > props.maxlength) {
        const truncated = val.slice(0, props.maxlength)
        event.target.value = truncated
        model.value = truncated
    }
}
</script>