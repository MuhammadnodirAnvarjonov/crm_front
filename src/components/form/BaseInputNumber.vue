<template>
    <div class="flex flex-col gap-1.5">
        <label v-if="label" :for="uid" class="text-sm font-semibold text-gray-700 select-none">
            {{ label }}
        </label>

        <div :class="[
            'flex items-center rounded-lg border border-gray-300 shadow-sm transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 hover:border-blue-400 overflow-hidden bg-white',
            sizeConfig.container
        ]">

            <!-- Kamaytirish (-) -->
            <button v-if="button" type="button" @mousedown="startRepeat(decrement)" @mouseup="stopRepeat" @mouseleave="stopRepeat"
                @touchstart.prevent="startRepeat(decrement)" @touchend="stopRepeat"
                :disabled="disabled || isMinLimitReached" :class="[
                    'flex shrink-0 items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-blue-600 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed border-r border-gray-200 transition-colors select-none',
                    sizeConfig.button
                ]">
                <svg xmlns="http://www.w3.org/2000/svg" :width="sizeConfig.icon" :height="sizeConfig.icon"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                    stroke-linejoin="round">
                    <path d="M5 12h14" />
                </svg>
            </button>

            <!-- Input -->
            <input :id="uid" ref="inputRef" type="text" :value="displayValue" @input="handleInput" @blur="handleBlur"
                @keydown.enter="$event.target.blur()" v-bind="$attrs" :disabled="disabled" inputmode="decimal"
                autocomplete="off" :class="[
                    'w-full flex-1 border-none bg-transparent text-center text-gray-800 outline-none focus:ring-0 placeholder:text-gray-400 font-mono',
                    sizeConfig.input
                ]" />

            <!-- Ko'paytirish (+) -->
            <button v-if="button" type="button" @mousedown="startRepeat(increment)" @mouseup="stopRepeat" @mouseleave="stopRepeat"
                @touchstart.prevent="startRepeat(increment)" @touchend="stopRepeat"
                :disabled="disabled || isMaxLimitReached" :class="[
                    'flex shrink-0 items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-blue-600 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed border-l border-gray-200 transition-colors select-none',
                    sizeConfig.button
                ]">
                <svg xmlns="http://www.w3.org/2000/svg" :width="sizeConfig.icon" :height="sizeConfig.icon"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                    stroke-linejoin="round">
                    <path d="M12 5v14M5 12h14" />
                </svg>
            </button>
        </div>
    </div>
</template>
<script>
// inheritAttrs ni o'chirish uchun alohida script bloki kerak (yoki defineOptions ishlatiladi)
export default {
    inheritAttrs: false
}
</script>
<script setup>
import { ref, watch, useId, computed, nextTick, onUnmounted } from 'vue'
import { useParsenumber, useFormatnumber } from '@/composables/NumberFormat'


const model = defineModel({ type: [Number, String] })
const emit = defineEmits(['change'])

const props = defineProps({
    label: String,
    min: { type: Number, default: -Infinity },
    max: { type: Number, default: Infinity },
    step: { type: Number, default: 1 },
    disabled: Boolean,
    format: { type: Boolean, default: true },
    button: { type: Boolean, default: true },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
    }
})

// --- Uzoq bosib turganda ishlash logikasi ---
let repeatTimer = null;
let repeatInterval = null;

const startRepeat = (action) => {
    if (props.disabled) return;

    // Birinchi marta bosganda darhol ishga tushadi
    action();

    // 500ms bosib turgandan keyin tezlik bilan oshirish/kamaytirishni boshlaydi
    repeatTimer = setTimeout(() => {
        repeatInterval = setInterval(() => {
            action();
        }, 80); // Har 80ms da takrorlanadi (tezlikni shu yerdan o'zgartirish mumkin)
    }, 500);
}

const stopRepeat = () => {
    clearTimeout(repeatTimer);
    clearInterval(repeatInterval);
}

// Komponent o'chirilganda taymerlarni tozalash (xotira xavfsizligi)
onUnmounted(() => {
    stopRepeat();
})

// --- Qolgan mavjud logikalar ---
const sizeConfig = computed(() => {
    switch (props.size) {
        case 'sm': return { container: 'h-8', button: 'w-8 h-8', input: 'px-2 py-1 text-xs', icon: 14 }
        case 'lg': return { container: 'h-12', button: 'w-12 h-12', input: 'px-4 py-3 text-base', icon: 20 }
        case 'xl': return { container: 'h-14', button: 'w-14 h-14', input: 'px-5 py-3 text-xl font-semibold tracking-wide min-w-[220px]', icon: 24 }
        default: return { container: 'h-10', button: 'w-10 h-10', input: 'px-3 py-2 text-sm', icon: 16 }
    }
})

const uid = useId()
const inputRef = ref(null)
const displayValue = ref('')

const getFormattedValue = (val) => {
    if (val === null || val === undefined || val === '') return ''
    return props.format ? useFormatnumber(val) : String(val)
}

const isMinLimitReached = computed(() => {
    const val = Number(model.value)
    return (model.value !== null && model.value !== '') && !isNaN(val) && val <= props.min
})

const isMaxLimitReached = computed(() => {
    const val = Number(model.value)
    return (model.value !== null && model.value !== '') && !isNaN(val) && val >= props.max
})

watch(model, (newVal) => {
    if (document.activeElement !== inputRef.value) {
        displayValue.value = getFormattedValue(newVal)
    }
}, { immediate: true })

const handleInput = (event) => {
    const rawValue = event.target.value
    displayValue.value = rawValue
    const parsed = useParsenumber(rawValue)
    if (parsed !== null && !isNaN(parsed)) {
        model.value = parsed
        // Qo'lda yozilganda ham ota komponentga xabar berish
        emit('change', parsed)
    } else if (rawValue === '') {
        model.value = null
        emit('change', null)
    }
}

const handleBlur = () => {
    let val = useParsenumber(displayValue.value)
    if (val === null) {
        model.value = null
        displayValue.value = ''
        return
    }
    if (!isNaN(val)) {
        if (val > props.max) val = props.max
        if (val < props.min) val = props.min
        updateModelAndDisplay(val)
    } else {
        displayValue.value = getFormattedValue(model.value)
    }
}

const increment = () => {
    let current = Number(model.value) || 0
    if (current < props.max) {
        const newVal = current + Number(props.step)
        updateModelAndDisplay(newVal <= props.max ? newVal : props.max)
    } else {
        stopRepeat(); // Limitga yetganda to'xtatish
    }
}

const decrement = () => {
    let current = Number(model.value) || 0
    if (current > props.min) {
        const newVal = current - Number(props.step)
        updateModelAndDisplay(newVal >= props.min ? newVal : props.min)
    } else {
        stopRepeat(); // Limitga yetganda to'xtatish
    }
}

const updateModelAndDisplay = (val) => {
    let num = Number(Number(val).toFixed(10))
    model.value = num

    // Qiymat tugmalar orqali o'zgarganda 'change' hodisasini tarqatamiz
    emit('change', num)

    nextTick(() => {
        displayValue.value = getFormattedValue(num)
    })
}

</script>

<style scoped>
/* Tugma bosilganda ko'k rangli tanlanish (highlight) bo'lmasligi uchun */
.select-none {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
</style>