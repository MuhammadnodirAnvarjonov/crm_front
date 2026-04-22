<template>
    <div class="w-full flex flex-col gap-1">
        <!-- Label -->
        <label v-if="label" :class="['font-semibold text-gray-700 ml-1', sizeConfig.label]">
            {{ label }}
        </label>

        <div :class="[
            'flex items-center gap-2',
            isRange ? 'flex-col sm:flex-row' : ''
        ]">

            <!-- Birinchi yoki Yagona Input -->
            <div class="relative w-full group">
                <input 
                    :type="inputType" 
                    :value="internalValue1" 
                    @input="handleInput($event, 0)" 
                    :class="[baseInputClass, sizeConfig.input]"
                    v-bind="$attrs" 
                />
                <span v-if="isRange"
                    :class="['absolute px-1 bg-white text-gray-400 font-bold uppercase tracking-wider', sizeConfig.rangeLabel]">
                    {{ $t('from') }}
                </span>
            </div>

            <!-- Range uchun ikkinchi input -->
            <template v-if="isRange">
                <div class="hidden sm:block text-gray-400 font-bold" :class="sizeConfig.label">→</div>
                <div class="relative w-full group">
                    <input 
                        :type="inputType" 
                        :value="internalValue2" 
                        @input="handleInput($event, 1)" 
                        :class="[baseInputClass, sizeConfig.input]"
                        v-bind="$attrs" 
                    />
                    <span
                        :class="['absolute px-1 bg-white text-gray-400 font-bold uppercase tracking-wider', sizeConfig.rangeLabel]">
                        {{ $t('to') }}
                    </span>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { computed, inject } from 'vue';

const dayjs = inject('dayJS');

const props = defineProps({
    label: String,
    modelValue: [String, Number, Array],
    mode: {
        type: String,
        default: 'date',
        validator: (v) => ['date', 'datetime', 'daterange', 'datetimerange'].includes(v)
    },
    outputType: {
        type: String,
        default: 'timestamp'
    },
    size: {
        type: String,
        default: 'md',
        validator: (v) => ['sm', 'md', 'lg'].includes(v)
    }
});

const emit = defineEmits(['update:modelValue']);

// O'lchamlar konfiguratsiyasi
const sizeConfig = computed(() => {
    const configs = {
        sm: {
            input: 'px-2 py-1.5 text-[11px] rounded-xl h-8',
            label: 'text-[11px]',
            rangeLabel: '-top-1.5 left-2 text-[8px]'
        },
        md: {
            input: 'px-3 py-2 text-sm rounded-2xl h-10',
            label: 'text-sm',
            rangeLabel: '-top-2 left-3 text-[10px]'
        },
        lg: {
            input: 'px-4 py-2.5 text-base rounded-[18px] h-12',
            label: 'text-base',
            rangeLabel: '-top-2.5 left-4 text-[11px]'
        }
    };
    return configs[props.size] || configs.md;
});

const baseInputClass = "w-full bg-gray-50 border border-gray-200 font-medium text-gray-700 outline-none transition-all duration-300 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 placeholder-gray-400";

const inputType = computed(() => props.mode.includes('datetime') ? 'datetime-local' : 'date');
const isRange = computed(() => props.mode.includes('range'));
const htmlFormat = computed(() => props.mode.includes('datetime') ? 'YYYY-MM-DDTHH:mm' : 'YYYY-MM-DD');

const internalValue1 = computed(() => {
    const val = isRange.value ? (props.modelValue?.[0]) : props.modelValue;
    return val ? dayjs(val).format(htmlFormat.value) : '';
});

const internalValue2 = computed(() => {
    if (!isRange.value) return '';
    const val = props.modelValue?.[1];
    return val ? dayjs(val).format(htmlFormat.value) : '';
});

const handleInput = (event, index) => {
    const newValue = event.target.value;
    if (!newValue) {
        updateValue(null, index);
        return;
    }
    const processedValue = props.outputType === 'timestamp'
        ? dayjs(newValue).valueOf()
        : dayjs(newValue).toISOString();

    updateValue(processedValue, index);
};

const updateValue = (val, index) => {
    if (isRange.value) {
        const currentRange = Array.isArray(props.modelValue) ? [...props.modelValue] : [null, null];
        currentRange[index] = val;
        emit('update:modelValue', currentRange);
    } else {
        emit('update:modelValue', val);
    }
};
</script>

<style scoped>
input::-webkit-calendar-picker-indicator {
    cursor: pointer;
    filter: invert(0.5);
    padding: 2px;
    border-radius: 4px;
    transition: all 0.2s;
}

input::-webkit-calendar-picker-indicator:hover {
    background: #f3f4f6;
    filter: invert(0.2);
}
</style>