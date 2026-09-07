<template>
  <div class="p-2">
    <el-card shadow="hover" class="search-card">
      <el-form ref="queryFormRef" :model="queryParams" :rules="queryRules"  label-position="top" class="search-section">
        <el-form-item label="Farmland ID" prop="farmlandId">
          <el-select
            v-model="queryParams.farmlandId"
            filterable
            remote
            reserve-keyword
            placeholder="Please input"
            :remote-method="farmLandRemoteMethod"
            :loading="farmLandLoading"
            :debounce="300"
          >
            <el-option v-for="item in farmLandOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Start Time" prop="startTime">
          <el-date-picker clearable v-model="queryParams.startTime" type="date" value-format="YYYY-MM-DD" placeholder="Please select Start Time" />
        </el-form-item>
        <el-form-item label="End Time" prop="endTime">
          <el-date-picker clearable v-model="queryParams.endTime" type="date" value-format="YYYY-MM-DD" placeholder="Please select End Time" />
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
          <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card style="margin-top: 10px" :class="['trend-panel', { 'trend-panel--empty': !hasTrendData }]">
      <div v-if="!hasTrendData" class="trend-empty-tip">Please select conditions and click Search to load chart data.</div>
      <el-row v-else :gutter="12">
        <el-col :span="24"><div ref="phChartRef" class="trend-chart"></div></el-col>
        <el-col :span="24"><div ref="organicMatterChartRef" class="trend-chart"></div></el-col>
        <el-col :span="24"><div ref="nlevelChartRef" class="trend-chart"></div></el-col>
        <el-col :span="24"><div ref="plevelChartRef" class="trend-chart"></div></el-col>
        <el-col :span="24"><div ref="klevelChartRef" class="trend-chart"></div></el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted } from 'vue';
import { getSoilProfileTrend, listSoilProfileFarmlandIds } from '@/api/demo/soilProfile';
import * as echarts from 'echarts';

const queryFormRef = ref<ElFormInstance>();
const queryParams = reactive({
  farmlandId: undefined as string | number | undefined,
  startTime: undefined as string | undefined,
  endTime: undefined as string | undefined
});
const queryRules = reactive({
  farmlandId: [{ required: true, message: 'Please select Farmland ID', trigger: 'change' }]
});

const farmLandOptions = ref<Array<{ value: string | number; label: string }>>([]);
const farmLandList = ref<Array<string | number>>([]);
const farmLandLoading = ref(false);
const trendData = ref<any>(null);
const klevelChartRef = ref<HTMLElement>();
const nlevelChartRef = ref<HTMLElement>();
const organicMatterChartRef = ref<HTMLElement>();
const phChartRef = ref<HTMLElement>();
const plevelChartRef = ref<HTMLElement>();

let klevelChart: echarts.ECharts | null = null;
let nlevelChart: echarts.ECharts | null = null;
let organicMatterChart: echarts.ECharts | null = null;
let phChart: echarts.ECharts | null = null;
let plevelChart: echarts.ECharts | null = null;

const farmLandRemoteMethod = async (query: string) => {
  const keyword = (query || '').toLowerCase();
  if (!keyword) {
    farmLandOptions.value = [];
    return;
  }
  farmLandOptions.value = farmLandList.value
    .filter((item) => `${item}`.toLowerCase().includes(keyword))
    .map((item) => ({
      value: item,
      label: `${item}`
    }));
};

const handleQuery = async () => {
  try {
    await queryFormRef.value?.validate();
  } catch {
    return;
  }
  const res = await getSoilProfileTrend({
    farmlandId: queryParams.farmlandId,
    startTime: queryParams.startTime,
    endTime: queryParams.endTime
  });
  trendData.value = res?.data ?? res;
  await nextTick();
  if (hasTrendData.value) {
    renderAllCharts();
  } else {
    disposeCharts();
  }
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  trendData.value = null;
  disposeCharts();
};

const getTrendPayload = () => {
  if (!trendData.value) return null;
  return trendData.value?.data ? trendData.value.data : trendData.value;
};

const hasTrendData = computed(() => {
  const payload = getTrendPayload();
  return Array.isArray(payload?.sampleDateList) && payload.sampleDateList.length > 0;
});

const buildLineOption = (title: string, xAxisData: Array<string | number>, yAxisData: Array<number | string>, unit?: string) => {
  return {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 600
      }
    },
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number | string) => `${value}${unit ?? ''}`
    },
    grid: {
      left: 50,
      right: 20,
      top: 50,
      bottom: 35
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      boundaryGap: false,
      axisLabel: {
        color: '#606266'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#606266',
        formatter: (value: number) => `${value}${unit ?? ''}`
      },
      splitLine: {
        lineStyle: {
          color: '#ebedf0'
        }
      }
    },
    series: [
      {
        type: 'line',
        smooth: true,
        data: yAxisData,
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: {
          color: '#5470c6',
          width: 2
        },
        itemStyle: {
          color: '#fff',
          borderColor: '#5470c6',
          borderWidth: 2
        }
      }
    ]
  };
};

const renderChart = (
  chartRef: Ref<HTMLElement | undefined>,
  instance: echarts.ECharts | null,
  title: string,
  xAxisData: Array<string | number>,
  yAxisData: Array<number | string>,
  unit?: string
) => {
  if (!chartRef.value) return instance;
  const chart = instance ?? echarts.init(chartRef.value);
  chart.setOption(buildLineOption(title, xAxisData, yAxisData, unit));
  return chart;
};

const renderAllCharts = () => {
  const payload = getTrendPayload();
  if (!payload) return;
  const xAxisData = Array.isArray(payload.sampleDateList)
    ? payload.sampleDateList.map((item) => `${item}`.split(' ')[0])
    : [];
  phChart = renderChart(phChartRef, phChart, 'Soil pH', xAxisData, payload.phList ?? []);
  organicMatterChart = renderChart(
    organicMatterChartRef,
    organicMatterChart,
    'Organic Matter (%)',
    xAxisData,
    payload.organicMatterPctList ?? [],
    '%'
  );
  nlevelChart = renderChart(nlevelChartRef, nlevelChart, 'N Level (kg/ha)', xAxisData, payload.nlevelList ?? []);
  plevelChart = renderChart(plevelChartRef, plevelChart, 'P Level (kg/ha)', xAxisData, payload.plevelList ?? []);
  klevelChart = renderChart(klevelChartRef, klevelChart, 'K Level (kg/ha)', xAxisData, payload.klevelList ?? []);
};

const resizeCharts = () => {
  klevelChart?.resize();
  nlevelChart?.resize();
  organicMatterChart?.resize();
  phChart?.resize();
  plevelChart?.resize();
};

const disposeCharts = () => {
  klevelChart?.dispose();
  nlevelChart?.dispose();
  organicMatterChart?.dispose();
  phChart?.dispose();
  plevelChart?.dispose();
  klevelChart = null;
  nlevelChart = null;
  organicMatterChart = null;
  phChart = null;
  plevelChart = null;
};

onMounted(async () => {
  farmLandLoading.value = true;
  const res = await listSoilProfileFarmlandIds();
  const sourceList = Array.isArray(res.data) ? res.data : Array.isArray(res.rows) ? res.rows : [];
  farmLandList.value = sourceList.map((item) =>
    typeof item === 'string' || typeof item === 'number' ? item : (item.farmlandId ?? item.farmlandld ?? item.id ?? item.value)
  );
  farmLandOptions.value = [];
  farmLandLoading.value = false;
  window.addEventListener('resize', resizeCharts);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts);
  disposeCharts();
});
</script>

<style scoped>
.trend-panel {
  transition: all 0.2s ease;
}

.trend-panel--empty {
  min-height: 90px;
}

.trend-empty-tip {
  color: #909399;
  padding: 18px 6px;
}

.trend-chart {
  width: 100%;
  height: 320px;
  margin-bottom: 12px;
}
</style>
