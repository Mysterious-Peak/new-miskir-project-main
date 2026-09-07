<template>
  <div class="p-2">
    <el-card shadow="hover" class="search-card">
      <el-form ref="queryFormRef" :model="queryParams" :rules="queryRules"  label-position="top" class="search-section">
        <el-form-item label="Data Source" prop="dataSource">
          <el-select v-model="queryParams.dataSource" clearable placeholder="Please select Data Source" style="width: 220px">
            <el-option v-for="item in dataSourceOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Production Season ID" prop="prodSeasonId">
          <el-select
            v-model="queryParams.prodSeasonId"
            filterable
            remote
            reserve-keyword
            placeholder="Please input"
            :remote-method="prodSeasonRemoteMethod"
            :loading="prodSeasonLoading"
            :debounce="300"
            clearable
          >
            <el-option v-for="item in prodSeasonOptions" :key="item.value" :label="item.label" :value="item.value" />
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
        <el-col :span="24"><div ref="rainfallChartRef" class="trend-chart"></div></el-col>
        <el-col :span="24"><div ref="temperatureChartRef" class="trend-chart"></div></el-col>
        <el-col :span="24"><div ref="humidityChartRef" class="trend-chart"></div></el-col>
        <el-col :span="24"><div ref="soilMoistureChartRef" class="trend-chart"></div></el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted } from 'vue';
import { getWeatherIotTrend, listWeatherIotDataSources, listWeatherIotProdSeasonIds } from '@/api/demo/weatherIotData';
import * as echarts from 'echarts';

const queryFormRef = ref<ElFormInstance>();
const queryParams = reactive({
  dataSource: undefined as string | undefined,
  prodSeasonId: undefined as string | number | undefined,
  startTime: undefined as string | undefined,
  endTime: undefined as string | undefined
});
const queryRules = reactive({
  dataSource: [{ required: true, message: 'Please select Data Source', trigger: 'change' }],
  prodSeasonId: [{ required: true, message: 'Please select Production Season ID', trigger: 'change' }]
});

const dataSourceOptions = ref<Array<{ value: string; label: string }>>([]);
const prodSeasonOptions = ref<Array<{ value: string | number; label: string }>>([]);
const prodSeasonList = ref<Array<string | number>>([]);
const prodSeasonLoading = ref(false);
const trendData = ref<any>(null);
const temperatureChartRef = ref<HTMLElement>();
const humidityChartRef = ref<HTMLElement>();
const rainfallChartRef = ref<HTMLElement>();
const soilMoistureChartRef = ref<HTMLElement>();

let temperatureChart: echarts.ECharts | null = null;
let humidityChart: echarts.ECharts | null = null;
let rainfallChart: echarts.ECharts | null = null;
let soilMoistureChart: echarts.ECharts | null = null;

const prodSeasonRemoteMethod = async (query: string) => {
  const keyword = (query || '').toLowerCase();
  if (!keyword) {
    prodSeasonOptions.value = [];
    return;
  }
  prodSeasonOptions.value = prodSeasonList.value
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
  const res = await getWeatherIotTrend({
    prodSeasonId: queryParams.prodSeasonId,
    prodSeasonld: queryParams.prodSeasonId,
    dataSource: queryParams.dataSource,
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
  const rawPayload = trendData.value?.data ? trendData.value.data : trendData.value;
  if (Array.isArray(rawPayload)) return rawPayload[0] ?? null;
  return rawPayload;
};

const hasTrendData = computed(() => {
  const payload = getTrendPayload();
  return Array.isArray(payload?.timestampList) && payload.timestampList.length > 0;
});

const buildLineOption = (
  title: string,
  xAxisData: Array<string | number>,
  yAxisData: Array<number | string>,
  unit?: string,
  thresholds?: Array<{ value: number; label: string }>,
  yAxisMax?: number,
  yAxisMin?: number
) => {
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
      ...(yAxisMin !== undefined ? { min: yAxisMin } : {}),
      ...(yAxisMax !== undefined ? { max: yAxisMax } : {}),
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
        },
        ...(thresholds && thresholds.length > 0
          ? {
              markLine: {
                symbol: 'none',
                lineStyle: {
                  color: '#f56c6c',
                  type: 'dashed',
                  width: 2
                },
                label: {
                  show: true,
                  position: 'start',
                  distance: 10,
                  formatter: ({ data }: any) => data?.label ?? '',
                  color: '#fff',
                  backgroundColor: '#f56c6c',
                  padding: [2, 6],
                  borderRadius: 3
                },
                data: thresholds.map((item) => ({
                  yAxis: item.value,
                  label: `${item.label}${unit ?? ''}`
                }))
              }
            }
          : {})
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
  unit?: string,
  thresholds?: Array<{ value: number; label: string }>,
  yAxisMax?: number,
  yAxisMin?: number
) => {
  if (!chartRef.value) return instance;
  const chart = instance ?? echarts.init(chartRef.value);
  chart.setOption(buildLineOption(title, xAxisData, yAxisData, unit, thresholds, yAxisMax, yAxisMin));
  return chart;
};

const renderAllCharts = () => {
  const payload = getTrendPayload();
  if (!payload) return;
  const xAxisData = Array.isArray(payload.timestampList) ? payload.timestampList.map((item) => `${item}`.split(' ')[0]) : [];
  temperatureChart = renderChart(
    temperatureChartRef,
    temperatureChart,
    'Temperature (°C)',
    xAxisData,
    payload.temperatureCList ?? [],
    '°C',
    [
      { value: 35, label: '>35' },
      { value: 4, label: '<4' }
    ],
    40
  );
  humidityChart = renderChart(
    humidityChartRef,
    humidityChart,
    'Humidity (%)',
    xAxisData,
    payload.humidityPctList ?? [],
    '%',
    [{ value: 90, label: '>90' }],
    100
  );
  rainfallChart = renderChart(rainfallChartRef, rainfallChart, 'Rainfall (mm)', xAxisData, payload.rainfallMmList ?? [], 'mm', [
    { value: 5, label: 'Threshold: 5' }
  ]);
  soilMoistureChart = renderChart(
    soilMoistureChartRef,
    soilMoistureChart,
    'Soil Moisture (%)',
    xAxisData,
    payload.soilMoisturePctList ?? [],
    '%',
    [
      { value: 40, label: '<40' },
      { value: 85, label: '>85' }
    ],
    100,
    10
  );
};

const resizeCharts = () => {
  temperatureChart?.resize();
  humidityChart?.resize();
  rainfallChart?.resize();
  soilMoistureChart?.resize();
};

const disposeCharts = () => {
  temperatureChart?.dispose();
  humidityChart?.dispose();
  rainfallChart?.dispose();
  soilMoistureChart?.dispose();
  temperatureChart = null;
  humidityChart = null;
  rainfallChart = null;
  soilMoistureChart = null;
};

onMounted(async () => {
  const sourceRes = await listWeatherIotDataSources();
  const dataSourceList = Array.isArray(sourceRes.data) ? sourceRes.data : [];
  dataSourceOptions.value = dataSourceList.map((item) => ({
    value: `${item}`,
    label: `${item}`
  }));
  prodSeasonLoading.value = true;
  const res = await listWeatherIotProdSeasonIds();
  const prodSeasonSourceList: any[] = Array.isArray(res.data) ? res.data : Array.isArray(res.rows) ? res.rows : [];
  prodSeasonList.value = prodSeasonSourceList.map((item) =>
    typeof item === 'string' || typeof item === 'number' ? item : (item.prodSeasonId ?? item.prodSeasonld ?? item.id ?? item.value)
  );
  prodSeasonOptions.value = [];
  prodSeasonLoading.value = false;
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
