<template>
    <div class="flex flex-col h-full min-h-0">
        <!-- Desktop table -->
        <div class="hidden md:flex flex-col h-full min-h-0 overflow-auto custom-scrollbar rounded-xl border border-gray-200">
            <table class="w-full text-sm border-collapse">
                <thead class="bg-gray-100 text-gray-700 font-medium sticky top-0 z-10">
                    <tr>
                        <th v-for="col in columns" :key="col.key" :class="[
                            'px-4 py-2 border border-gray-200 text-left align-middle select-none bg-gray-100',
                            col.headerClass || defaultHeaderClass,
                        ]">
                            {{ col.label }}
                        </th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="(item, idx) in data" :key="item.id || idx"
                        :class="['border-t transition cursor-pointer', rowClass ? rowClass(item) : 'hover:bg-blue-50']" @click="$emit('row-click', item)">

                        <td v-for="col in columns" :key="col.key" :class="[
                            'px-2 py-1.5 border border-gray-100 text-gray-700 text-left align-middle font-bold text-sm',
                            col.class || defaultCellClass,
                        ]" @click="col.stopClick ? $event.stopPropagation() : null">

                            <div v-if="typeof col.render === 'function'">
                                {{ col.render(item, idx) }}
                            </div>

                            <div v-else-if="col.type === 'image-text'" class="flex items-center gap-3">
                                <img v-if="resolveValue(item, col.imageKey)" :src="resolveValue(item, col.imageKey)"
                                    class="w-8 h-8 rounded-full object-cover border" alt="" />
                                <span>{{ resolveValue(item, col.textKey) }}</span>
                            </div>

                            <div v-else-if="col.type === 'icon-text'" class="flex items-center gap-2">
                                <span>{{ col.icon }}</span>
                                <span>{{ resolveValue(item, col.textKey) }}</span>
                            </div>

                            <slot v-else-if="col.slot" :name="col.slot" :item="item"
                                :value="resolveValue(item, col.key)"></slot>

                            <span v-else>{{ resolveValue(item, col.key) }}</span>
                        </td>
                    </tr>

                    <tr v-if="data.length === 0">
                        <td :colspan="columns.length" class="text-center py-10 text-gray-500 text-sm border-t">
                            {{ $t('no_data') }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Mobile cards -->
        <div class="flex flex-col min-h-[300px] md:hidden">
            <div class="flex-1 overflow-auto custom-scrollbar space-y-2 p-1">
                <div v-for="(item, idx) in data" :key="item.id || idx"
                    :class="['rounded-xl shadow-sm border overflow-hidden cursor-pointer hover:shadow-md transition active:scale-[0.99]', rowClass ? rowClass(item) : 'bg-white border-gray-200']"
                    @click="$emit('row-click', item)">

                    <!-- Mobile card content -->
                    <div class="divide-y divide-gray-100">
                        <template v-for="col in mobileColumns">
                            <!-- Slot columns -->
                            <div v-if="col.slot" :key="col.key + '-slot'" class="px-3 py-2"
                                @click="col.stopClick ? $event.stopPropagation() : null">
                                <slot :name="col.slot" :item="item" :value="resolveValue(item, col.key)"></slot>
                            </div>

                            <!-- Render function -->
                            <div v-else-if="typeof col.render === 'function'" :key="col.key + '-render'" class="flex items-center justify-between px-3 py-2">
                                <span class="text-xs text-gray-400 shrink-0">{{ col.label }}</span>
                                <span class="text-sm font-medium text-gray-800 text-right">{{ col.render(item, idx) }}</span>
                            </div>

                            <!-- Image + text -->
                            <div v-else-if="col.type === 'image-text'" :key="col.key + '-img'" class="flex items-center gap-3 px-3 py-2.5">
                                <img v-if="resolveValue(item, col.imageKey)" :src="resolveValue(item, col.imageKey)"
                                    class="w-9 h-9 rounded-full object-cover border border-gray-200" alt="" />
                                <div class="text-sm text-gray-800 font-semibold">
                                    {{ resolveValue(item, col.textKey) }}
                                </div>
                            </div>

                            <!-- Icon + text -->
                            <div v-else-if="col.type === 'icon-text'" :key="col.key + '-icon'" class="flex items-center gap-2 px-3 py-2">
                                <span>{{ col.icon }}</span>
                                <span class="text-sm text-gray-700">{{ resolveValue(item, col.textKey) }}</span>
                            </div>

                            <!-- Default: label + value -->
                            <div v-else :key="col.key" class="flex items-center justify-between px-3 py-2">
                                <span class="text-xs text-gray-400 shrink-0">{{ col.label }}</span>
                                <span class="text-sm font-medium text-gray-700 text-right truncate ml-3">
                                    {{ resolveValue(item, col.key) }}
                                </span>
                            </div>
                        </template>
                    </div>
                </div>

                <!-- Empty state -->
                <div v-if="data.length === 0" class="flex justify-center items-center py-16">
                    <div class="text-center px-6 py-10 flex flex-col items-center gap-3">
                        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg class="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                        </div>
                        <p class="text-gray-400 text-sm">{{ $t('no_data') }}</p>
                        <button class="mt-2 px-4 py-2.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                            @click="$emit('refresh')">Refresh</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const props = defineProps({
    columns: Array,
    data: Array,
    rowClass: Function,
});

defineEmits(['refresh', 'row-click']);

const defaultHeaderClass = 'text-left';
const defaultCellClass = 'text-left';

// Mobile uchun # ustunni yashirish
const mobileColumns = computed(() =>
    props.columns.filter(col => !col.hideOnMobile)
);

const resolveValue = (obj, path) => {
    if (!path) return '';
    return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? '';
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 5px;
    height: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #d1d5db;
    border-radius: 20px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #9ca3af;
}
</style>