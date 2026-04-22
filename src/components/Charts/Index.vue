<script setup>
import * as echarts from "echarts";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import {
  PieChart,
  BarChart
} from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from "echarts/components";
import VChart, { THEME_KEY } from "vue-echarts";
import { ref, provide, computed, watch } from "vue";

// Registratsiya
use([
  CanvasRenderer,
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
]);

// Props
const props = defineProps({
  data: Object,
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '400px'
  }
});

// Provide ECharts theme
provide(THEME_KEY, "light");

// Reaktiv `option`
const option = ref({});

// Dynamic update: props.data o‘zgarganda option yangilanadi
watch(
  () => props.data,
  (newData) => {
    if (newData && typeof newData === 'object') {
      option.value = { ...newData }; // Shallow copy
    }
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <div class="chart-box">
    <v-chart
      class="chart-home"
      :style="{ width: width, height: height }"
      :option="option"
      autoresize
    />
  </div>
</template>

<style scoped>
.chart-box {
  @apply w-full p-4 bg-white shadow-md rounded-xl;
}

.chart-home {
  max-width: 100%;
}
</style>
