<template>
  <div class="border rounded-lg overflow-hidden border-gray-200">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
              <input type="text" v-model="service.th_name"
                class="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-xs font-bold uppercase text-gray-700 text-center py-1"
                :placeholder="$t('Column Name')"
                @blur="saveHeaders" />
            </th>

            <th v-for="(col, colIndex) in parsedHeaders" :key="colIndex"
                class="px-2 py-2 min-w-[180px] relative group border-l border-r border-gray-100 bg-gray-50">
              <div class="flex items-center gap-1">
                <input type="text" v-model="col.name"
                       class="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none text-xs font-bold uppercase text-gray-700 text-center py-1"
                       :placeholder="$t('Column Name')"
                       @blur="saveHeaders" />

                <div class="flex items-center absolute right-0 -top-1 bg-white shadow rounded border z-10 transition-opacity">
                  <BaseCheckbox
                    v-model="col.disabled"
                    @update:modelValue="toggleColumnDisabled(colIndex, $event)"
                    class="text-xs mt-1" 
                  />
                  <button @click="addColumn" type="button"
                      v-if="colIndex === parsedHeaders.length - 1"
                      class="w-6 h-6 flex items-center justify-center text-green-600 hover:bg-green-50 font-bold border-r text-lg">
                    +
                  </button>
                  <button v-if="parsedHeaders.length > 1" @click="removeColumn(colIndex)" type="button"
                      class="w-6 h-6 flex items-center justify-center text-red-600 hover:bg-red-50 font-bold text-lg">
                    -
                  </button>
                </div>
              </div>
            </th>

            <template v-if="service.selectable">
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[230px]">
                {{ $t('price') }}
              </th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[230px]">
                {{ $t('citizen_price') }}
              </th>
              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[230px]">
                {{ $t('stationar_price') }}
              </th>
            </template>

            <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[50px]">
              {{ $t('actions') }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(item, index) in service.childs" :key="index" class="hover:bg-gray-50 transition">
            <td class="px-2 py-2 align-top">
              <textarea v-model="item.name" rows="1"
                class="w-full border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 px-2 py-1 border resize-none"
                @input="emit('updateSection', props.service)"></textarea>
            </td>
            <template v-for="(cell, cellIndex) in item.norm" :key="'cell-' + cellIndex">
              <td :colspan="cell.colspan"
                v-if="!cell.hidden"
                  class="px-2 py-2 align-top border-l border-gray-100">

                <div class="flex justify-center items-center gap-2 mb-1">
                    <button v-if="cell.colspan > 1" type="button"
                            @click="shrinkCell(item.norm, cellIndex)"
                            class="w-5 h-4 flex items-center justify-center bg-red-100 text-red-700 hover:bg-red-200 rounded text-[10px] font-bold border border-red-200">
                      &lt;
                    </button>

                    <div @click="changeColor(cell, 'red')" :class="['w-5 h-2 rounded-full cursor-pointer border', cell.status === 'red' ? 'bg-red-500' : 'bg-red-100']"></div>
                    <div @click="changeColor(cell, 'black')" :class="['w-5 h-2 rounded-full cursor-pointer border', cell.status === 'black' ? 'bg-gray-800' : 'bg-gray-200']"></div>
                    <div @click="changeColor(cell, 'yellow')" :class="['w-5 h-2 rounded-full cursor-pointer border', cell.status === 'yellow' ? 'bg-yellow-500' : 'bg-yellow-100']"></div>
                    <div @click="changeColor(cell, 'green')" :class="['w-5 h-2 rounded-full cursor-pointer border', cell.status === 'green' ? 'bg-green-500' : 'bg-green-100']"></div>

                    <button v-if="canExpand(item.norm, cellIndex)" type="button"
                            @click="expandCell(item.norm, cellIndex)"
                            class="w-5 h-4 flex items-center justify-center bg-green-100 text-green-700 hover:bg-green-200 rounded text-[10px] font-bold border border-green-200">
                      &gt;
                    </button>
                </div>

                <div class="flex gap-1 items-start">
                  <textarea v-model="cell.value" rows="1"
                    :style="{ color: cell.status }"
                    class="w-full border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 px-2 py-1 border resize-none overflow-hidden min-h-[35px]"
                    @input="autoResize($event)"
                    :disabled="cell.disabled"></textarea>

                    <BaseCheckbox v-model="cell.disabled"
                        class="text-xs mt-1"
                        @update:modelValue="emit('updateSection', props.service)" />
                </div>
              </td>
            </template>

            <template v-if="service.selectable">
              <td class="px-2 py-2 align-top">
                <BaseInputNumber v-model="item.price" :step="1000" :min="0" />
              </td>
              <td class="px-2 py-2 align-top">
                <BaseInputNumber v-model="item.citizen_price" :step="1000" :min="0" />
              </td>
              <td class="px-2 py-2 align-top">
                <BaseInputNumber v-model="item.stationar_price" :step="1000" :min="0" />
              </td>
            </template>

            <td class="px-2 py-2 align-top text-center">
              <button type="button" @click="removeRow(index)"
                class="text-red-500 hover:text-red-700 p-1 bg-red-50 hover:bg-red-100 rounded transition">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import BaseInputNumber from "@/components/form/BaseInputNumber.vue";
import BaseCheckbox from "@/components/form/BaseCheckbox.vue";
import { computed } from "vue";
const emit = defineEmits(["updateSection"]);

const props = defineProps({
  service: {
    type: Object,
    required: true
  }
});

const parsedHeaders = computed(() => {
  try {
    return typeof props.service.th_text === 'string' 
      ? JSON.parse(props.service.th_text) 
      : props.service.th_text;
  } catch (e) {
    return [{ name: "Natija" }, { name: "Norma" }];
  }
});

const saveHeaders = () => {
  props.service.th_text = JSON.stringify(parsedHeaders.value);
  emit("updateSection", props.service);
};

const toggleColumnDisabled = (colIndex, value) => {
  // 1. Barcha qatorlardagi tegishli ustunni o'zgartirish
  props.service.childs.forEach(child => {
    if (child.norm[colIndex]) {
      child.norm[colIndex].disabled = value;
    }
  });

  // 2. Header holatini saqlash uchun JSONni yangilash
  props.service.th_text = JSON.stringify(parsedHeaders.value);
  
  emit("updateSection", props.service);
};

const createCell = () => ({
  value: "",
  colspan: 1,
  hidden: false,
  status: "black",
  disabled: false
});

const getNorm = (child) => {
  if (Array.isArray(child.norm)) return child.norm;
  try { return JSON.parse(child.norm) || []; } catch { return []; }
};

const addColumn = () => {
  const headers = parsedHeaders.value;
  headers.push({ name: "Yangi ustun" });
  props.service.th_text = JSON.stringify(headers);
  props.service.childs.forEach(child => {
    child.norm = getNorm(child);
    child.norm.push(createCell());
  });
  emit("updateSection", props.service);
};

const removeColumn = (index) => {
  const headers = parsedHeaders.value;
  headers.splice(index, 1);
  props.service.th_text = JSON.stringify(headers);
  props.service.childs.forEach(child => {
    child.norm = getNorm(child);
    child.norm.splice(index, 1);
  });
  emit("updateSection", props.service);
};

const removeRow = (index) => {
  props.service.childs.splice(index, 1);
  emit("updateSection", props.service);
};

const changeColor = (cell, color) => {
  cell.status = color;
  emit("updateSection", props.service);
};

const autoResize = (event) => {
  event.target.style.height = 'auto';
  event.target.style.height = event.target.scrollHeight + 'px';
  emit("updateSection", props.service);
};

const canExpand = (norm, index) => {
  const cell = norm[index];
  const nextIndex = index + cell.colspan;
  return nextIndex < norm.length;
};

const expandCell = (norm, index) => {
  const cell = norm[index];
  const nextIndex = index + cell.colspan;
  if (nextIndex < norm.length) {
    norm[nextIndex].hidden = true;
    cell.colspan += norm[nextIndex].colspan;
  }
  emit("updateSection", props.service);
};

const shrinkCell = (norm, index) => {
  const cell = norm[index];
  if (cell.colspan <= 1) return;
  // Oxirgi yashirilgan katak indeksini topamiz
  const lastHiddenIndex = index + cell.colspan - 1;
  const freed = norm[lastHiddenIndex];
  if (freed) {
    freed.hidden = false;
    freed.colspan = 1;
    cell.colspan -= 1;
  }
  emit("updateSection", props.service);
};
</script>