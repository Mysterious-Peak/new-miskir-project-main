<template>
  <div class="big-screen">
    <div class="screen-decor-layer" aria-hidden="true">
      <span class="frame-line frame-line--top"></span>
      <span class="frame-line frame-line--bottom"></span>
      <span class="frame-line frame-line--left"></span>
      <span class="frame-line frame-line--right"></span>

      <span class="frame-corner frame-corner--tl"></span>
      <span class="frame-corner frame-corner--tr"></span>
      <span class="frame-corner frame-corner--bl"></span>
      <span class="frame-corner frame-corner--br"></span>

      <span class="flow-line flow-line--top"></span>
      <span class="flow-line flow-line--bottom"></span>
      <span class="flow-line flow-line--left"></span>
      <span class="flow-line flow-line--right"></span>
    </div>
    <div class="top-overview">
      <div class="screen-header">
        <div class="header-glow"></div>
        <h1>Oromia Woreda Agriculture Bureau</h1>
      </div>
      <p>Woreda Service Delivery Pulse</p>
      <div class="kpi-row">
        <div v-for="item in kpiCards" :key="item.label" class="kpi-card">
          <div class="kpi-value">
            {{ item.value }}
            <span class="kpi-unit">{{ item.unit }}</span>
          </div>
          <div class="kpi-label">{{ item.label }}</div>
        </div>
      </div>
    </div>

    <div class="screen-body">
      <div class="screen-top">
        <div class="side-panel">
          <div class="panel-card">
            <div class="card-title">Service Intensity vs. Crop Health Trend</div>
            <div ref="inputTypeChartRef" class="chart-box"></div>
          </div>
          <div class="panel-card">
            <div class="card-title">Woreda Operational Capacity Matrix</div>
            <div ref="qualityRadarChartRef" class="chart-box"></div>
          </div>
        </div>

        <div class="center-panel">
          <div class="panel-card map-card">
            <div class="card-title">Kebele Registration & Yield Heatmap</div>
            <div ref="mapChartRef" class="map map-box"></div>
          </div>
        </div>

        <div class="side-panel">
          <div class="panel-card">
            <div class="card-title">Input Supply-Demand Balance Board</div>
            <div ref="coverageTrendChartRef" class="chart-box"></div>
          </div>
          <div class="panel-card">
            <div class="card-title">Household Livelihood Vulnerability Index</div>
            <div ref="deliveryGaugeChartRef" class="chart-box"></div>
          </div>
        </div>
      </div>

      <div class="screen-bottom">
        <div class="panel-card bottom-left-card">
          <div class="card-title">Extension Impact Efficiency Quadrant</div>
          <div ref="bottomTrendChartRef" class="chart-box bottom-chart-box"></div>
        </div>
        <div class="panel-card bottom-right-card">
          <div class="card-title">Real-Time Field Intelligence Feed</div>
          <div class="bottom-ticker-wrap">
            <div ref="tickerWrapRef" class="smart-alert-ticker">
              <div
                ref="tickerTrackRef"
                class="ticker-track"
                :style="{ animationDuration: `${tickerDurationSec}s`, '--ticker-shift': `-${tickerShiftPx}px` }"
              >
                <div v-for="alert in smartAlertLoopList" :key="alert.loopKey" class="ticker-item" :class="getAlertTypeClass(alert.type)">
                  <div class="ticker-line">
                    <span class="ticker-msg" v-html="alert.message_html"></span>
                    <span class="ticker-time">{{ formatTickerTime(alert.timestamp) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="BigScreen" lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import * as echarts from 'echarts';

const kpiCardPayload = {
  module: 'debre_birhan_kpi',
  data: [
    {
      id: 'db_kpi_1',
      label: 'Farmer Registration Coverage',
      value: 94.2,
      unit: '%',
      trend: 1.5,
      trend_direction: 'up',
      status_color: '#10B981',
      sparkline_data: [90, 91, 92, 93, 94.2]
    },
    {
      id: 'db_kpi_2',
      label: 'Technical Guidance Visits',
      value: 3280,
      unit: 'visits',
      trend: 12,
      trend_direction: 'up',
      status_color: '#10B981',
      sparkline_data: [2800, 2900, 3050, 3100, 3280]
    },
    {
      id: 'db_kpi_3',
      label: 'Input Delivery Completion Rate',
      value: 88.5,
      unit: '%',
      trend: -2.3,
      trend_direction: 'down',
      status_color: '#F59E0B',
      sparkline_data: [92, 91, 90, 89, 88.5]
    },
    {
      id: 'db_kpi_4',
      label: 'Village Avg Yield Forecast',
      value: 36.5,
      unit: 'Qt/Ha',
      trend: 4.1,
      trend_direction: 'up',
      status_color: '#3B82F6',
      sparkline_data: [34, 34.5, 35, 35.8, 36.5]
    }
  ]
};

const kpiCards = kpiCardPayload.data;

const inputTypeChartRef = ref<HTMLElement>();
const qualityRadarChartRef = ref<HTMLElement>();
const inspectionTrendChartRef = ref<HTMLElement>();
const mapChartRef = ref<HTMLElement>();
const zoneBarChartRef = ref<HTMLElement>();
const coverageTrendChartRef = ref<HTMLElement>();
const deliveryGaugeChartRef = ref<HTMLElement>();
const riskAlarmChartRef = ref<HTMLElement>();
const bottomTrendChartRef = ref<HTMLElement>();

let inputTypeChart: echarts.ECharts | null = null;
let qualityRadarChart: echarts.ECharts | null = null;
let inspectionTrendChart: echarts.ECharts | null = null;
let mapChart: echarts.ECharts | null = null;
let zoneBarChart: echarts.ECharts | null = null;
let coverageTrendChart: echarts.ECharts | null = null;
let deliveryGaugeChart: echarts.ECharts | null = null;
let riskAlarmChart: echarts.ECharts | null = null;
let bottomTrendChart: echarts.ECharts | null = null;

let inspectTipTimer: ReturnType<typeof setInterval> | null = null;
let riskTipTimer: ReturnType<typeof setInterval> | null = null;
const ETHIOPIA_MAP_NAME = 'debre_birhan_villages';
const FICHE_VILLAGE_MAP_URL = '/maps/fiche-villages.geojson';
let mapReady = false;
const mapRegionNames = ref<string[]>([]);
const dbVillageMapPayload = {
  module: '2.3_village_map',
  region: 'Fitche Woreda (Efratana Gidim)',
  metric: 'household_registration_rate',
  unit: '%',
  legend: {
    high: { min: 90, color: '#10B981', label: 'High (>90%)' },
    medium: { min: 70, max: 89.9, color: '#F59E0B', label: 'Medium (70-90%)' },
    low: { max: 69.9, color: '#EF4444', label: 'Low (<70%)' }
  },
  villages: [
    {
      id: 'kebele_01',
      name: 'Fitche Town',
      registration_rate: 96.5,
      status: 'high',
      predicted_yield: 38.2,
      service_count: 450,
      risk: 'No major risk',
      coordinates: [9.28, 38.68],
      tooltip_content: '<b>Fitche Town</b><br>Registration rate: 96.5% (High)<br>Predicted yield: 38.2 Qt/Ha<br>Service visits: 450<br>Risk: None'
    },
    {
      id: 'kebele_02',
      name: 'Goro',
      registration_rate: 92.1,
      status: 'high',
      predicted_yield: 39.5,
      service_count: 380,
      risk: 'None',
      coordinates: [9.3, 38.7],
      tooltip_content: '<b>Goro</b><br>Registration rate: 92.1% (High)<br>Predicted yield: 39.5 Qt/Ha<br>Service visits: 380<br>Risk: None'
    },
    {
      id: 'kebele_03',
      name: 'Gulit',
      registration_rate: 82,
      status: 'medium',
      predicted_yield: 34,
      service_count: 120,
      risk: 'Localized drought (watch needed)',
      coordinates: [9.25, 38.65],
      tooltip_content:
        '<b>Gulit</b><br>Registration rate: 82.0% (Medium)<br>Predicted yield: 34.0 Qt/Ha<br>Service visits: 120<br>Risk: Localized drought'
    },
    {
      id: 'kebele_04',
      name: 'Chacha',
      registration_rate: 75.4,
      status: 'medium',
      predicted_yield: 32.8,
      service_count: 95,
      risk: 'Pest monitoring ongoing',
      coordinates: [9.22, 38.72],
      tooltip_content:
        '<b>Chacha</b><br>Registration rate: 75.4% (Medium)<br>Predicted yield: 32.8 Qt/Ha<br>Service visits: 95<br>Risk: Pest pressure'
    },
    {
      id: 'kebele_05',
      name: 'Dembela',
      registration_rate: 64.2,
      status: 'low',
      predicted_yield: 28.5,
      service_count: 45,
      risk: 'Transport blocked / weak service coverage',
      coordinates: [9.18, 38.6],
      tooltip_content:
        '<b>Dembela</b><br>Registration rate: 64.2% (Low)<br>Predicted yield: 28.5 Qt/Ha<br>Service visits: 45<br>Risk: Transport disruption'
    },
    {
      id: 'kebele_06',
      name: 'Kundi',
      registration_rate: 68.9,
      status: 'low',
      predicted_yield: 29.1,
      service_count: 52,
      risk: 'Seed supply shortage',
      coordinates: [9.2, 38.58],
      tooltip_content: '<b>Kundi</b><br>Registration rate: 68.9% (Low)<br>Predicted yield: 29.1 Qt/Ha<br>Service visits: 52<br>Risk: Seed shortage'
    },
    {
      id: 'kebele_07',
      name: 'Jarte',
      registration_rate: 88.5,
      status: 'medium',
      predicted_yield: 37,
      service_count: 150,
      risk: 'Good rainfall / technology reinforcement needed',
      coordinates: [9.26, 38.75],
      tooltip_content:
        '<b>Jarte</b><br>Registration rate: 88.5% (Medium)<br>Predicted yield: 37.0 Qt/Ha<br>Service visits: 150<br>Risk: Technology reinforcement needed'
    },
    {
      id: 'kebele_08',
      name: 'Mekane Selam',
      registration_rate: 91.2,
      status: 'high',
      predicted_yield: 36.8,
      service_count: 210,
      risk: 'None',
      coordinates: [9.29, 38.62],
      tooltip_content: '<b>Mekane Selam</b><br>Registration rate: 91.2% (High)<br>Predicted yield: 36.8 Qt/Ha<br>Service visits: 210<br>Risk: None'
    },
    {
      id: 'kebele_09',
      name: 'Shola Gebeya',
      registration_rate: 79.3,
      status: 'medium',
      predicted_yield: 33.5,
      service_count: 110,
      risk: 'Soil fertility decline',
      coordinates: [9.24, 38.69],
      tooltip_content:
        '<b>Shola Gebeya</b><br>Registration rate: 79.3% (Medium)<br>Predicted yield: 33.5 Qt/Ha<br>Service visits: 110<br>Risk: Soil fertility decline'
    },
    {
      id: 'kebele_10',
      name: 'Tula',
      registration_rate: 72.8,
      status: 'medium',
      predicted_yield: 31.2,
      service_count: 88,
      risk: 'Mild frost risk',
      coordinates: [9.21, 38.64],
      tooltip_content: '<b>Tula</b><br>Registration rate: 72.8% (Medium)<br>Predicted yield: 31.2 Qt/Ha<br>Service visits: 88<br>Risk: Frost risk'
    },
    {
      id: 'kebele_11',
      name: 'Yegol',
      registration_rate: 66.5,
      status: 'low',
      predicted_yield: 27.8,
      service_count: 40,
      risk: 'Lack of irrigation facilities',
      coordinates: [9.19, 38.66],
      tooltip_content: '<b>Yegol</b><br>Registration rate: 66.5% (Low)<br>Predicted yield: 27.8 Qt/Ha<br>Service visits: 40<br>Risk: Water shortage'
    },
    {
      id: 'kebele_12',
      name: 'Dero',
      registration_rate: 85.4,
      status: 'medium',
      predicted_yield: 35.6,
      service_count: 135,
      risk: 'None',
      coordinates: [9.27, 38.71],
      tooltip_content: '<b>Dero</b><br>Registration rate: 85.4% (Medium)<br>Predicted yield: 35.6 Qt/Ha<br>Service visits: 135<br>Risk: None'
    },
    {
      id: 'kebele_13',
      name: 'Meraro',
      registration_rate: 93.5,
      status: 'high',
      predicted_yield: 38.9,
      service_count: 260,
      risk: 'None',
      coordinates: [9.31, 38.67],
      tooltip_content: '<b>Meraro</b><br>Registration rate: 93.5% (High)<br>Predicted yield: 38.9 Qt/Ha<br>Service visits: 260<br>Risk: None'
    },
    {
      id: 'kebele_14',
      name: 'Kerer',
      registration_rate: 77.6,
      status: 'medium',
      predicted_yield: 32.4,
      service_count: 98,
      risk: 'Locust migration corridor',
      coordinates: [9.23, 38.61],
      tooltip_content:
        '<b>Kerer</b><br>Registration rate: 77.6% (Medium)<br>Predicted yield: 32.4 Qt/Ha<br>Service visits: 98<br>Risk: Locust migration'
    },
    {
      id: 'kebele_15',
      name: 'Gizach',
      registration_rate: 89.1,
      status: 'medium',
      predicted_yield: 36.2,
      service_count: 175,
      risk: 'None',
      coordinates: [9.28, 38.73],
      tooltip_content: '<b>Gizach</b><br>Registration rate: 89.1% (Medium)<br>Predicted yield: 36.2 Qt/Ha<br>Service visits: 175<br>Risk: None'
    },
    {
      id: 'kebele_16',
      name: 'Addis Alem',
      registration_rate: 90.5,
      status: 'high',
      predicted_yield: 37.5,
      service_count: 195,
      risk: 'None',
      coordinates: [9.32, 38.65],
      tooltip_content: '<b>Addis Alem</b><br>Registration rate: 90.5% (High)<br>Predicted yield: 37.5 Qt/Ha<br>Service visits: 195<br>Risk: None'
    },
    {
      id: 'kebele_17',
      name: 'Fitche Gelila',
      registration_rate: 84.2,
      status: 'medium',
      predicted_yield: 34.8,
      service_count: 125,
      risk: 'Localized flood',
      coordinates: [9.26, 38.66],
      tooltip_content:
        '<b>Fitche Gelila</b><br>Registration rate: 84.2% (Medium)<br>Predicted yield: 34.8 Qt/Ha<br>Service visits: 125<br>Risk: Flood'
    },
    {
      id: 'kebele_18',
      name: 'Gulale',
      registration_rate: 71.5,
      status: 'medium',
      predicted_yield: 30.9,
      service_count: 82,
      risk: 'Livestock disease',
      coordinates: [9.22, 38.68],
      tooltip_content:
        '<b>Gulale</b><br>Registration rate: 71.5% (Medium)<br>Predicted yield: 30.9 Qt/Ha<br>Service visits: 82<br>Risk: Livestock disease'
    },
    {
      id: 'kebele_19',
      name: 'Sina',
      registration_rate: 62.8,
      status: 'low',
      predicted_yield: 26.5,
      service_count: 35,
      risk: 'Severe drought / road disruption',
      coordinates: [9.17, 38.62],
      tooltip_content: '<b>Sina</b><br>Registration rate: 62.8% (Low)<br>Predicted yield: 26.5 Qt/Ha<br>Service visits: 35<br>Risk: Severe drought'
    },
    {
      id: 'kebele_20',
      name: 'Amba Giorgis',
      registration_rate: 74.9,
      status: 'medium',
      predicted_yield: 31.8,
      service_count: 90,
      risk: 'Hail',
      coordinates: [9.24, 38.74],
      tooltip_content: '<b>Amba Giorgis</b><br>Registration rate: 74.9% (Medium)<br>Predicted yield: 31.8 Qt/Ha<br>Service visits: 90<br>Risk: Hail'
    },
    {
      id: 'kebele_21',
      name: 'Debre Sina',
      registration_rate: 87.3,
      status: 'medium',
      predicted_yield: 35.9,
      service_count: 160,
      risk: 'None',
      coordinates: [9.29, 38.76],
      tooltip_content: '<b>Debre Sina</b><br>Registration rate: 87.3% (Medium)<br>Predicted yield: 35.9 Qt/Ha<br>Service visits: 160<br>Risk: None'
    },
    {
      id: 'kebele_22',
      name: 'Kochi',
      registration_rate: 69.4,
      status: 'low',
      predicted_yield: 28.2,
      service_count: 48,
      risk: 'Fertilizer delivery delay',
      coordinates: [9.2, 38.59],
      tooltip_content: '<b>Kochi</b><br>Registration rate: 69.4% (Low)<br>Predicted yield: 28.2 Qt/Ha<br>Service visits: 48<br>Risk: Delivery delay'
    },
    {
      id: 'kebele_23',
      name: 'Weyera',
      registration_rate: 81.6,
      status: 'medium',
      predicted_yield: 33.9,
      service_count: 115,
      risk: 'Wheat rust',
      coordinates: [9.25, 38.7],
      tooltip_content: '<b>Weyera</b><br>Registration rate: 81.6% (Medium)<br>Predicted yield: 33.9 Qt/Ha<br>Service visits: 115<br>Risk: Wheat rust'
    },
    {
      id: 'kebele_24',
      name: 'Gobero',
      registration_rate: 91.8,
      status: 'high',
      predicted_yield: 37.8,
      service_count: 230,
      risk: 'None',
      coordinates: [9.3, 38.69],
      tooltip_content: '<b>Gobero</b><br>Registration rate: 91.8% (High)<br>Predicted yield: 37.8 Qt/Ha<br>Service visits: 230<br>Risk: None'
    }
  ],
  summary_stats: {
    total_kebeles: 24,
    high_perf_count: 7,
    med_perf_count: 11,
    low_perf_count: 6,
    avg_registration_rate: 80.4,
    avg_predicted_yield: 33.6
  }
};

const smartAlertsPayload = {
  module: '2.5.2_smart_alerts',
  scroll_speed: 30,
  alerts: [
    {
      id: 'alert_db_001',
      type: 'EMERGENCY',
      priority: 1,
      icon: '🚨',
      zone_name: 'Kuter',
      message_html:
        "<b>Kuter Village</b>: Severe input shortage! Fertilizer gap has reached <span style='color:#EF4444;font-weight:bold'>45.8 tons</span>, affecting spring farming progress. Immediate emergency dispatch is recommended.",
      timestamp: '2026-03-19T08:15:00Z'
    },
    {
      id: 'alert_db_002',
      type: 'ANOMALY',
      priority: 2,
      icon: '⚠️',
      zone_name: 'Kuter',
      message_html:
        '<b>Kuter Village</b>: Service efficiency anomaly. 680 technical visits but yield is only 28 quintal/ha. Soil disease or seed quality issues should be investigated.',
      timestamp: '2026-03-19T09:30:00Z'
    },
    {
      id: 'alert_db_003',
      type: 'SUCCESS',
      priority: 3,
      icon: '🏆',
      zone_name: 'Debre Birhan Town',
      message_html:
        "<b>Debre Birhan Town</b>: New high-yield record! Wheat yield surpassed <span style='color:#10B981;font-weight:bold'>42.5</span> quintal/ha. Recommend promoting this planting model district-wide.",
      timestamp: '2026-03-19T07:45:00Z'
    },
    {
      id: 'alert_db_004',
      type: 'MACRO',
      priority: 3,
      icon: '📈',
      zone_name: 'Debre Birhan District',
      message_html:
        "<b>Woreda Bulletin</b>: Farmer registration coverage has reached <span style='color:#3B82F6;font-weight:bold'>94.2%</span>. Remaining remote villages are expected to be completed before Friday.",
      timestamp: '2026-03-19T06:00:00Z'
    },
    {
      id: 'alert_db_005',
      type: 'EMERGENCY',
      priority: 1,
      icon: '🌵',
      zone_name: 'Highland Village A',
      message_html:
        '<b>Highland Village A</b>: Drought warning! No rainfall for 10 consecutive days and soil moisture is below 20%. Please prioritize irrigation equipment support.',
      timestamp: '2026-03-19T10:00:00Z'
    }
  ]
};

const tickerWrapRef = ref<HTMLElement>();
const tickerTrackRef = ref<HTMLElement>();
const tickerDurationSec = ref(30);
const tickerShiftPx = ref(0);
const TICKER_REPEAT_TIMES = 10;

const sortedSmartAlerts = computed(() =>
  [...smartAlertsPayload.alerts].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return b.timestamp.localeCompare(a.timestamp);
  })
);

const smartAlertLoopList = computed(() =>
  Array.from({ length: TICKER_REPEAT_TIMES }).flatMap((_, repeatIndex) =>
    sortedSmartAlerts.value.map((item, idx) => ({ ...item, loopKey: `${item.id}-${repeatIndex}-${idx}` }))
  )
);

const getAlertTypeClass = (type: string) => {
  if (type === 'EMERGENCY') return 'ticker-item--emergency';
  if (type === 'SUCCESS') return 'ticker-item--success';
  if (type === 'ANOMALY') return 'ticker-item--anomaly';
  return 'ticker-item--macro';
};

const formatTickerTime = (timeStr: string) => {
  const date = new Date(timeStr);
  if (Number.isNaN(date.getTime())) return timeStr;
  return `${date.getUTCMonth() + 1}-${date.getUTCDate()} ${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')} UTC`;
};

const refreshTickerDuration = () => {
  const track = tickerTrackRef.value;
  if (!track) return;
  const singleTrackHeight = track.scrollHeight / TICKER_REPEAT_TIMES;
  const speed = Math.max(10, smartAlertsPayload.scroll_speed);
  tickerShiftPx.value = Math.max(1, Math.round(singleTrackHeight));
  const calculatedSeconds = tickerShiftPx.value > 0 ? tickerShiftPx.value / speed : 30;
  tickerDurationSec.value = Math.max(6, Number(calculatedSeconds.toFixed(1)));
};

const productionComboPayload = {
  module: '2.2.1_production_service_combo',
  title: 'Debre Birhan Monthly Production and Service Trend',
  x_axis: ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'],
  series: [
    {
      name: 'Technical Guidance Visits',
      type: 'bar',
      y_axis_index: 0,
      data: [420, 580, 750, 820, 650, 560]
    },
    {
      name: 'Main Crop Growth Index',
      type: 'line',
      symbol: 'circle',
      smooth: true,
      y_axis_index: 1,
      data: [45, 52, 68, 75, 82, 88]
    }
  ],
  y_axes: [
    { name: 'Guidance Visits', min: 0, max: 1000 },
    { name: 'Growth Index (0-100)', min: 0, max: 100 }
  ]
};

const buildInputTypeOption = () => ({
  tooltip: {
    trigger: 'axis',
    formatter: (params: any[]) => {
      const bar = params?.find((item) => item?.seriesType === 'bar');
      const line = params?.find((item) => item?.seriesType === 'line');
      const axisVal = params?.[0]?.axisValue ?? '';
      return [
        `<b>${productionComboPayload.title}</b>`,
        `${axisVal}`,
        `${productionComboPayload.series[0].name}: ${bar?.value ?? '-'}`,
        `${productionComboPayload.series[1].name}: ${line?.value ?? '-'}`,
        `<span style="color:#F59E0B">Insight: Track whether increased field visits are driving stronger crop growth.</span>`
      ].join('<br/>');
    }
  },
  legend: {
    top: 8,
    right: 10,
    itemWidth: 14,
    itemHeight: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 4,
    padding: [4, 8],
    textStyle: { color: '#ffffff', fontSize: 11 }
  },
  grid: { left: 44, right: 48, top: 42, bottom: 30 },
  xAxis: {
    type: 'category',
    data: productionComboPayload.x_axis,
    axisLabel: { color: '#9cc7ff', fontSize: 10 },
    axisLine: { lineStyle: { color: '#3a6fb1' } }
  },
  yAxis: [
    {
      type: 'value',
      name: productionComboPayload.y_axes[0].name,
      min: productionComboPayload.y_axes[0].min,
      max: productionComboPayload.y_axes[0].max,
      nameTextStyle: { color: '#9cc7ff', fontSize: 10 },
      axisLabel: { color: '#9cc7ff', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(94, 138, 196, 0.25)' } }
    },
    {
      type: 'value',
      name: productionComboPayload.y_axes[1].name,
      min: productionComboPayload.y_axes[1].min,
      max: productionComboPayload.y_axes[1].max,
      nameTextStyle: { color: '#9cc7ff', fontSize: 10 },
      axisLabel: { color: '#9cc7ff', fontSize: 10 },
      splitLine: { show: false }
    }
  ],
  series: [
    {
      name: productionComboPayload.series[0].name,
      type: 'bar',
      yAxisIndex: productionComboPayload.series[0].y_axis_index,
      barMaxWidth: 16,
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#10B981' },
          { offset: 1, color: '#059669' }
        ])
      },
      data: productionComboPayload.series[0].data
    },
    {
      name: productionComboPayload.series[1].name,
      type: 'line',
      yAxisIndex: productionComboPayload.series[1].y_axis_index,
      smooth: true,
      symbol: productionComboPayload.series[1].symbol,
      symbolSize: 7,
      lineStyle: { width: 2.5, color: '#3B82F6' },
      itemStyle: { color: '#3B82F6' },
      data: productionComboPayload.series[1].data
    }
  ]
});

const efficiencyRadarPayload = {
  module: '2.2.2_service_radar',
  title: 'Woreda Service Capacity Assessment',
  indicators: [
    { name: 'Registration Completeness', max: 100 },
    { name: 'Technical Coverage Rate', max: 100 },
    { name: 'Delivery Timeliness', max: 100 },
    { name: 'Disaster Response Speed', max: 100 },
    { name: 'Data Collection Accuracy', max: 100 },
    { name: 'Village Mobilization Capacity', max: 100 }
  ],
  target_line: [85, 85, 85, 85, 85, 85],
  actual_data: [94, 88, 72, 78, 90, 86],
  status_colors: {
    target: '#94A3B8',
    actual: '#3B82F6',
    warning_threshold: 80
  }
};

const buildQualityRadarOption = () => ({
  tooltip: { trigger: 'item' },
  grid: { top: 8, bottom: 44 },
  legend: {
    bottom: 8,
    textStyle: { color: '#9cc7ff', fontSize: 11 },
    data: ['Annual Assessment Target', 'Current Score']
  },
  radar: {
    radius: '56%',
    center: ['50%', '42%'],
    indicator: efficiencyRadarPayload.indicators,
    axisName: { color: '#9cc7ff', fontSize: 11 },
    splitLine: { lineStyle: { color: 'rgba(80, 158, 255, 0.35)' } },
    splitArea: { areaStyle: { color: ['rgba(25, 45, 102, 0.25)', 'rgba(25, 45, 102, 0.4)'] } }
  },
  series: [
    {
      type: 'radar',
      symbol: 'none',
      lineStyle: {
        color: efficiencyRadarPayload.status_colors.target,
        width: 1.5,
        type: 'dashed'
      },
      areaStyle: { color: 'transparent' },
      data: [{ value: efficiencyRadarPayload.target_line, name: 'Annual Assessment Target' }]
    },
    {
      type: 'radar',
      areaStyle: {
        color: 'rgba(59, 130, 246, 0.3)'
      },
      lineStyle: { color: efficiencyRadarPayload.status_colors.actual, width: 2 },
      symbol: 'circle',
      symbolSize: 5,
      itemStyle: { color: efficiencyRadarPayload.status_colors.actual },
      data: [{ value: efficiencyRadarPayload.actual_data, name: 'Current Score' }]
    }
  ]
});

const buildInspectionTrendOption = () => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 38, right: 16, top: 24, bottom: 28 },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    axisLine: { lineStyle: { color: '#3a6fb1' } },
    axisLabel: { color: '#9cc7ff' }
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false },
    axisLabel: { color: '#9cc7ff' },
    splitLine: { lineStyle: { color: 'rgba(94, 138, 196, 0.25)' } }
  },
  series: [
    {
      name: 'Inspections',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      lineStyle: { width: 3, color: '#5b8ff9' },
      itemStyle: { color: '#00f5ff' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(91, 143, 249, 0.5)' },
          { offset: 1, color: 'rgba(91, 143, 249, 0.05)' }
        ])
      },
      data: [126, 143, 158, 174, 169, 188, 202]
    }
  ]
});

const adjustHexColor = (hex: string, amount: number) => {
  const normalized = hex.replace('#', '');
  const num = Number.parseInt(normalized, 16);
  const clamp = (value: number) => Math.max(0, Math.min(255, value));
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0x00ff) + amount);
  const b = clamp((num & 0x0000ff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

const normalizeZoneName = (name?: string) => {
  return (name || '')
    .toLowerCase()
    .replace(/\(r4\)/g, '')
    .replace(/harerge/g, 'hararghe')
    .replace(/wellega/g, 'welega')
    .replace(/\s+/g, ' ')
    .trim();
};

const buildMapOption = () => {
  const getRateColor = (status?: string, rate?: number) => {
    if (status === 'high' || (rate ?? 0) > 90) return dbVillageMapPayload.legend.high.color;
    if (status === 'medium' || (rate ?? 0) >= 70) return dbVillageMapPayload.legend.medium.color;
    return dbVillageMapPayload.legend.low.color;
  };
  const getRateTier = (rate: number) => {
    if (rate > 90) return dbVillageMapPayload.legend.high.label;
    if (rate >= 70) return dbVillageMapPayload.legend.medium.label;
    return dbVillageMapPayload.legend.low.label;
  };
  const metricsByVillage = new Map(dbVillageMapPayload.villages.map((item) => [normalizeZoneName(item.name), item]));
  const mapData = mapRegionNames.value.map((name) => {
    const village = metricsByVillage.get(normalizeZoneName(name));
    const regRate = Number(village?.registration_rate ?? 0);
    return {
      name,
      value: regRate,
      villageMetrics: village,
      itemStyle: {
        areaColor: getRateColor(village?.status, regRate),
        borderColor: '#ffffff',
        borderWidth: 1.6,
        shadowBlur: 12,
        shadowOffsetY: 5,
        shadowColor: 'rgba(10, 20, 35, 0.35)'
      }
    };
  });

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove|click',
      formatter: (p: any) => {
        const metrics = p?.data?.villageMetrics;
        if (!metrics) return p?.name || 'Village';
        const rate = Number(metrics.registration_rate ?? 0);
        if (metrics.tooltip_content) {
          return `${metrics.tooltip_content}<br/>Tier: ${getRateTier(rate)}`;
        }
        return [`<b>${p.name}</b>`, `Registration rate: ${rate}% (${getRateTier(rate)})`, `Risk: ${metrics.risk ?? '-'}`].join('<br/>');
      }
    },
    graphic: [
      {
        type: 'ellipse',
        left: 'center',
        top: '73%',
        shape: {
          cx: 0,
          cy: 0,
          rx: 180,
          ry: 36
        },
        silent: true,
        z: 0,
        style: {
          fill: new echarts.graphic.RadialGradient(0.5, 0.5, 0.75, [
            { offset: 0, color: 'rgba(0, 0, 0, 0.28)' },
            { offset: 1, color: 'rgba(0, 0, 0, 0.02)' }
          ])
        }
      }
    ],
    series: [
      {
        name: 'Fitche Villages',
        type: 'map',
        map: ETHIOPIA_MAP_NAME,
        roam: true,
        scaleLimit: { min: 1, max: 8 },
        zoom: 1.34,
        layoutCenter: ['50%', '50%'],
        layoutSize: '98%',
        selectedMode: false,
        label: {
          show: true,
          color: '#ffffff',
          fontSize: 11,
          fontWeight: 400
        },
        itemStyle: {
          borderColor: '#ffffff',
          borderWidth: 1.6,
          shadowBlur: 18,
          shadowColor: 'rgba(9, 176, 255, 0.28)'
        },
        emphasis: {
          label: {
            show: true
          },
          itemStyle: {
            areaColor: '#b7f3ff',
            borderColor: '#ffffff',
            borderWidth: 2
          }
        },
        zlevel: 2,
        data: mapData
      }
    ]
  };
};

const buildZoneBarOption = () => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: 58, right: 20, top: 24, bottom: 20 },
  xAxis: {
    type: 'value',
    axisLabel: { color: '#9cc7ff' },
    splitLine: { lineStyle: { color: 'rgba(94, 138, 196, 0.25)' } }
  },
  yAxis: {
    type: 'category',
    axisLabel: { color: '#cfe6ff' },
    data: ['E.Hararaghe', 'Borena', 'Guji', 'Bale', 'W.Shewa']
  },
  series: [
    {
      type: 'bar',
      barWidth: 12,
      data: [92, 86, 79, 73, 67],
      itemStyle: {
        borderRadius: [0, 10, 10, 0],
        color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
          { offset: 0, color: '#00f5ff' },
          { offset: 1, color: '#00ab4c' }
        ])
      }
    }
  ]
});

const supplyDemandPayload = {
  module: '2.4.1_input_supply_demand',
  strategy: 'TOP_BOTTOM_3_AGGREGATE',
  unit: 'tons',
  balance_zero_line: 0,
  data: [
    { village: 'Debre Birhan Town', value: 45.2, type: 'surplus', rank: 1 },
    { village: 'Addis Alem', value: 32.8, type: 'surplus', rank: 2 },
    { village: 'Gulit', value: 18.5, type: 'surplus', rank: 3 },
    {
      village: 'Other 8 Balanced Villages (Aggregate)',
      value: 5.2,
      type: 'balanced',
      is_aggregate: true,
      hidden_villages: ['Kuter', 'Highland B', 'Valley C', '...']
    },
    { village: 'Highland Village A', value: -12.5, type: 'deficit', rank: -3 },
    { village: 'Remote D', value: -28.4, type: 'deficit', rank: -2 },
    { village: 'Kuter', value: -45.8, type: 'deficit', rank: -1 }
  ]
};

const buildCoverageTrendOption = () => {
  const villages = supplyDemandPayload.data.map((item, index) => item.village || `Village ${index + 1}`);
  const barValues = supplyDemandPayload.data.map((item) => Number(item.value || 0));
  const maxAbs = Math.max(...barValues.map((value) => Math.abs(value)), 1);
  const axisExtent = Math.ceil((maxAbs * 1.15) / 10) * 10;

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any[]) => {
        const val = Number(params?.[0]?.value ?? 0);
        const dataIndex = Number(params?.[0]?.dataIndex ?? 0);
        const village = villages[dataIndex] || '';
        const row = supplyDemandPayload.data[dataIndex];
        const type = row?.type === 'balanced' ? 'Balanced' : val >= 0 ? 'Surplus' : 'Deficit';
        return `${village}<br/>${type}: ${Math.abs(val).toFixed(1)} ${supplyDemandPayload.unit}`;
      }
    },
    grid: { left: 62, right: 62, top: 24, bottom: 24 },
    xAxis: {
      type: 'value',
      min: -axisExtent,
      max: axisExtent,
      axisLabel: {
        color: '#9cc7ff',
        formatter: (value: number) => `${Math.abs(value)}`
      },
      splitLine: { lineStyle: { color: 'rgba(94, 138, 196, 0.2)' } }
    },
    yAxis: {
      type: 'category',
      data: villages,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: true, color: '#cfe6ff', fontSize: 10 }
    },
    series: [
      {
        name: 'Supply-Demand Gap',
        type: 'bar',
        data: barValues,
        barWidth: 8,
        itemStyle: {
          borderRadius: 6,
          color: (params: any) => {
            const row = supplyDemandPayload.data[params.dataIndex];
            if (row?.type === 'balanced') return '#94A3B8';
            return params.value >= 0 ? '#10B981' : '#EF4444';
          }
        },
        label: {
          show: false
        },
        markLine: {
          silent: true,
          symbol: 'none',
          label: {
            show: true,
            formatter: '0 (Supply-Demand Balance)',
            color: '#ffffff',
            fontSize: 10,
            backgroundColor: 'rgba(0,0,0,0.3)',
            padding: [2, 6],
            borderRadius: 3
          },
          lineStyle: {
            color: '#ffffff',
            type: 'dashed',
            width: 1.2
          },
          data: [{ xAxis: supplyDemandPayload.balance_zero_line }]
        }
      }
    ]
  };
};

const vulnerabilityPyramidPayload = {
  module: '2.4.2_vulnerability_donut',
  title: 'Woreda Farmer Livelihood Security Distribution',
  total_households: 12450,
  layers: [
    { level: 'severe', label: 'Severe Vulnerability (Urgent Aid)', percentage: 15, count: 1868 },
    { level: 'moderate', label: 'Moderate Vulnerability (Tech Support)', percentage: 25, count: 3113 },
    { level: 'mild', label: 'Mild Vulnerability (Routine Service)', percentage: 30, count: 3735 },
    { level: 'secure', label: 'Secure / Better-off (Model Farmers)', percentage: 30, count: 3734 }
  ],
  center_content: {
    big_text: '15%',
    small_text: 'Priority Support Needed'
  }
};

const getVulnerabilityColor = (level: string) => {
  if (level === 'secure') return '#10B981';
  if (level === 'mild') return '#FBBF24';
  if (level === 'moderate') return '#F97316';
  if (level === 'severe') return '#EF4444';
  return '#94A3B8';
};

const buildDeliveryGaugeOption = () => {
  const ringOrder = ['secure', 'mild', 'moderate', 'severe'];
  const ordered = ringOrder
    .map((level) => vulnerabilityPyramidPayload.layers.find((item) => item.level === level))
    .filter((item): item is (typeof vulnerabilityPyramidPayload.layers)[number] => Boolean(item));
  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => `${params.name}<br/>Share: ${params.value}%<br/>Households: ${(params.data?.count ?? 0).toLocaleString()}`
    },
    legend: {
      bottom: 2,
      left: 'center',
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: '#cfe6ff', fontSize: 10 }
    },
    series: [
      {
        name: vulnerabilityPyramidPayload.title,
        type: 'pie',
        radius: ['58%', '78%'],
        center: ['50%', '46%'],
        clockwise: true,
        startAngle: 90,
        label: {
          show: false
        },
        labelLine: { show: false },
        itemStyle: {
          borderColor: 'rgba(6,18,48,0.95)',
          borderWidth: 3
        },
        data: ordered.map((item) => ({
          name: item.label,
          value: item.percentage,
          count: item.count,
          level: item.level,
          itemStyle: {
            color: getVulnerabilityColor(item.level)
          }
        }))
      }
    ],
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '38%',
        style: {
          text: vulnerabilityPyramidPayload.center_content.big_text,
          fill: '#F8FAFC',
          fontSize: 34,
          fontWeight: 700,
          textAlign: 'center'
        }
      },
      {
        type: 'text',
        left: 'center',
        top: '58%',
        style: {
          text: vulnerabilityPyramidPayload.center_content.small_text,
          fill: '#EF4444',
          fontSize: 11,
          fontWeight: 600,
          textAlign: 'center'
        }
      }
    ]
  };
};

const buildRiskAlarmOption = () => ({
  tooltip: { trigger: 'axis' },
  grid: { left: 38, right: 14, top: 24, bottom: 28 },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['03-12', '03-13', '03-14', '03-15', '03-16', '03-17', '03-18'],
    axisLabel: { color: '#9cc7ff' },
    axisLine: { lineStyle: { color: '#3a6fb1' } }
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: '#9cc7ff' },
    splitLine: { lineStyle: { color: 'rgba(94, 138, 196, 0.25)' } }
  },
  series: [
    {
      name: 'Risk Events',
      type: 'line',
      smooth: true,
      symbolSize: 8,
      lineStyle: { color: '#f74b4b', width: 2.5 },
      itemStyle: { color: '#f74b4b' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(247, 75, 75, 0.45)' },
          { offset: 1, color: 'rgba(247, 75, 75, 0.05)' }
        ])
      },
      data: [6, 8, 7, 11, 9, 6, 4]
    }
  ]
});

const scatterAnalysisPayload = {
  module: '2.5.1_efficiency_scatter',
  x_axis: { label: 'Technical Guidance Visits', min: 0, max: 1000 },
  y_axis: { label: 'Village Avg Yield (quintal/ha)', min: 0, max: 50 },
  quadrants: [
    { id: 'Q1', label: '⭐ Model Villages (High Service / High Output)', color: 'rgba(16, 185, 129, 0.1)' },
    { id: 'Q2', label: '🌱 Potential Villages (Low Service / High Output)', color: 'rgba(59, 130, 246, 0.1)' },
    { id: 'Q3', label: '🆘 Priority Support (Low Service / Low Output)', color: 'rgba(239, 68, 68, 0.1)' },
    { id: 'Q4', label: '❓ Efficiency Concerns (High Service / Low Output)', color: 'rgba(245, 158, 11, 0.1)' }
  ],
  points: [
    {
      village_id: 'DB_TOWN',
      village_name: 'Debre Birhan Town',
      x: 820,
      y: 42.5,
      category: 'MODEL',
      color: '#10B981',
      tooltip: 'Debre Birhan Town: 820 visits, yield 42.5'
    },
    {
      village_id: 'ADDIS_ALEM',
      village_name: 'Addis Alem',
      x: 750,
      y: 39,
      category: 'MODEL',
      color: '#10B981',
      tooltip: 'Addis Alem: 750 visits, yield 39.0'
    },
    {
      village_id: 'GULIT',
      village_name: 'Gulit',
      x: 420,
      y: 36,
      category: 'POTENTIAL',
      color: '#3B82F6',
      tooltip: 'Gulit: 420 visits, yield 36.0 (good natural conditions)'
    },
    {
      village_id: 'KUTER',
      village_name: 'Kuter',
      x: 680,
      y: 28,
      category: 'ISSUE',
      color: '#F59E0B',
      tooltip: 'Kuter: 680 visits, yield 28.0 (check soil conditions)'
    },
    {
      village_id: 'REMOTE_A',
      village_name: 'Highland Village A',
      x: 240,
      y: 22,
      category: 'SUPPORT',
      color: '#EF4444',
      tooltip: 'Highland Village A: 240 visits, yield 22.0 (increase service frequency)'
    },
    {
      village_id: 'REMOTE_D',
      village_name: 'Remote D',
      x: 180,
      y: 19.5,
      category: 'SUPPORT',
      color: '#EF4444',
      tooltip: 'Remote D: 180 visits, yield 19.5'
    }
  ]
};

const buildBottomTrendOption = () => {
  const xMid = (scatterAnalysisPayload.x_axis.min + scatterAnalysisPayload.x_axis.max) / 2;
  const yMid = (scatterAnalysisPayload.y_axis.min + scatterAnalysisPayload.y_axis.max) / 2;
  const points = scatterAnalysisPayload.points.map((item) => ({
    value: [item.x, item.y],
    zone_name: item.village_name,
    tooltip: item.tooltip,
    itemStyle: {
      color: item.color,
      borderColor: '#ffffff',
      borderWidth: 1.2
    }
  }));

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const data = params?.data;
        return data?.tooltip || `${data?.zone_name || ''}<br/>Adoption: ${params.value?.[0]}%<br/>Yield: ${params.value?.[1]}`;
      }
    },
    grid: { left: 82, right: 24, top: 34, bottom: 38 },
    xAxis: {
      type: 'value',
      min: scatterAnalysisPayload.x_axis.min,
      max: scatterAnalysisPayload.x_axis.max,
      name: scatterAnalysisPayload.x_axis.label,
      nameLocation: 'middle',
      nameGap: 28,
      nameTextStyle: { color: '#9cc7ff', fontSize: 11 },
      axisLabel: { color: '#9cc7ff' },
      axisLine: { lineStyle: { color: '#3a6fb1' } },
      splitLine: { lineStyle: { color: 'rgba(94, 138, 196, 0.22)' } }
    },
    yAxis: {
      type: 'value',
      min: scatterAnalysisPayload.y_axis.min,
      max: scatterAnalysisPayload.y_axis.max,
      name: scatterAnalysisPayload.y_axis.label,
      nameTextStyle: { color: '#9cc7ff', fontSize: 11, padding: [20, 0, 0, 0] },
      axisLabel: { color: '#9cc7ff' },
      axisLine: { lineStyle: { color: '#3a6fb1' } },
      splitLine: { lineStyle: { color: 'rgba(94, 138, 196, 0.22)' } }
    },
    graphic: [
      {
        type: 'text',
        left: '72%',
        top: '16%',
        style: { text: scatterAnalysisPayload.quadrants[0].label, fill: 'rgba(255,255,255,0.68)', fontSize: 12, fontWeight: 600 }
      },
      {
        type: 'text',
        left: '14%',
        top: '16%',
        style: { text: scatterAnalysisPayload.quadrants[1].label, fill: 'rgba(255,255,255,0.62)', fontSize: 12 }
      },
      {
        type: 'text',
        left: '14%',
        top: '76%',
        style: { text: scatterAnalysisPayload.quadrants[2].label, fill: 'rgba(255,255,255,0.62)', fontSize: 12 }
      },
      {
        type: 'text',
        left: '70%',
        top: '76%',
        style: { text: scatterAnalysisPayload.quadrants[3].label, fill: 'rgba(255,255,255,0.62)', fontSize: 12 }
      }
    ],
    series: [
      {
        name: 'Zone',
        type: 'scatter',
        symbol: 'circle',
        symbolSize: 8,
        data: points,
        emphasis: {
          scale: 1.15,
          label: {
            show: true,
            formatter: (params: any) => params?.data?.zone_name || '',
            color: '#ffffff',
            fontSize: 11,
            position: 'top'
          }
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: {
            color: 'rgba(255,255,255,0.55)',
            type: 'dashed',
            width: 1
          },
          data: [{ xAxis: xMid }, { yAxis: yMid }]
        },
        markArea: {
          silent: true,
          itemStyle: { borderWidth: 0 },
          data: [
            [
              { xAxis: xMid, yAxis: yMid, itemStyle: { color: scatterAnalysisPayload.quadrants[0].color } },
              { xAxis: scatterAnalysisPayload.x_axis.max, yAxis: scatterAnalysisPayload.y_axis.max }
            ],
            [
              { xAxis: scatterAnalysisPayload.x_axis.min, yAxis: yMid, itemStyle: { color: scatterAnalysisPayload.quadrants[1].color } },
              { xAxis: xMid, yAxis: scatterAnalysisPayload.y_axis.max }
            ],
            [
              {
                xAxis: scatterAnalysisPayload.x_axis.min,
                yAxis: scatterAnalysisPayload.y_axis.min,
                itemStyle: { color: scatterAnalysisPayload.quadrants[2].color }
              },
              { xAxis: xMid, yAxis: yMid }
            ],
            [
              { xAxis: xMid, yAxis: scatterAnalysisPayload.y_axis.min, itemStyle: { color: scatterAnalysisPayload.quadrants[3].color } },
              { xAxis: scatterAnalysisPayload.x_axis.max, yAxis: yMid }
            ]
          ]
        }
      }
    ]
  };
};

const ensureEthiopiaMap = async () => {
  if (mapReady) return true;
  try {
    const res = await fetch(FICHE_VILLAGE_MAP_URL);
    if (!res.ok) throw new Error(`Failed to load map json: ${res.status}`);
    const geoJson = await res.json();
    if (!Array.isArray(geoJson?.features) || !geoJson.features.length) {
      throw new Error('fiche-villages.geojson has no features');
    }
    mapRegionNames.value = geoJson.features.map((feature: any, index: number) => {
      const props = feature?.properties || {};
      const name = props.name || `Village-${index + 1}`;
      feature.properties = { ...props, name };
      return name;
    });
    echarts.registerMap(ETHIOPIA_MAP_NAME, geoJson as any);
    mapReady = true;
    return true;
  } catch (error) {
    console.error('Load Debre Birhan village map failed:', error);
    return false;
  }
};

const initCharts = async () => {
  if (inputTypeChartRef.value) {
    inputTypeChart = echarts.init(inputTypeChartRef.value);
    inputTypeChart.setOption(buildInputTypeOption());
  }
  if (qualityRadarChartRef.value) {
    qualityRadarChart = echarts.init(qualityRadarChartRef.value);
    qualityRadarChart.setOption(buildQualityRadarOption());
  }
  if (inspectionTrendChartRef.value) {
    inspectionTrendChart = echarts.init(inspectionTrendChartRef.value);
    inspectionTrendChart.setOption(buildInspectionTrendOption());
  }
  if (mapChartRef.value) {
    mapChart = echarts.init(mapChartRef.value);
    const ready = await ensureEthiopiaMap();
    if (ready) {
      mapChart.setOption(buildMapOption());
    }
  }
  if (zoneBarChartRef.value) {
    zoneBarChart = echarts.init(zoneBarChartRef.value);
    zoneBarChart.setOption(buildZoneBarOption());
  }
  if (coverageTrendChartRef.value) {
    coverageTrendChart = echarts.init(coverageTrendChartRef.value);
    coverageTrendChart.setOption(buildCoverageTrendOption());
  }
  if (deliveryGaugeChartRef.value) {
    deliveryGaugeChart = echarts.init(deliveryGaugeChartRef.value);
    deliveryGaugeChart.setOption(buildDeliveryGaugeOption());
  }
  if (riskAlarmChartRef.value) {
    riskAlarmChart = echarts.init(riskAlarmChartRef.value);
    riskAlarmChart.setOption(buildRiskAlarmOption());
  }
  if (bottomTrendChartRef.value) {
    bottomTrendChart = echarts.init(bottomTrendChartRef.value);
    bottomTrendChart.setOption(buildBottomTrendOption());
  }
};

const startAutoTooltip = () => {
  let inspectIndex = 0;
  inspectTipTimer = setInterval(() => {
    inspectionTrendChart?.dispatchAction({ type: 'downplay', seriesIndex: 0, dataIndex: (inspectIndex + 6) % 7 });
    inspectionTrendChart?.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: inspectIndex });
    inspectionTrendChart?.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex: inspectIndex });
    inspectIndex = (inspectIndex + 1) % 7;
  }, 1800);

  let riskIndex = 0;
  riskTipTimer = setInterval(() => {
    riskAlarmChart?.dispatchAction({ type: 'downplay', seriesIndex: 0, dataIndex: (riskIndex + 6) % 7 });
    riskAlarmChart?.dispatchAction({ type: 'highlight', seriesIndex: 0, dataIndex: riskIndex });
    riskAlarmChart?.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex: riskIndex });
    riskIndex = (riskIndex + 1) % 7;
  }, 2000);
};

const stopAutoTooltip = () => {
  if (inspectTipTimer) {
    clearInterval(inspectTipTimer);
    inspectTipTimer = null;
  }
  if (riskTipTimer) {
    clearInterval(riskTipTimer);
    riskTipTimer = null;
  }
};

const resizeAll = () => {
  inputTypeChart?.resize();
  qualityRadarChart?.resize();
  inspectionTrendChart?.resize();
  mapChart?.resize();
  zoneBarChart?.resize();
  coverageTrendChart?.resize();
  deliveryGaugeChart?.resize();
  riskAlarmChart?.resize();
  bottomTrendChart?.resize();
  refreshTickerDuration();
};

const disposeAll = () => {
  inputTypeChart?.dispose();
  qualityRadarChart?.dispose();
  inspectionTrendChart?.dispose();
  mapChart?.dispose();
  zoneBarChart?.dispose();
  coverageTrendChart?.dispose();
  deliveryGaugeChart?.dispose();
  riskAlarmChart?.dispose();
  bottomTrendChart?.dispose();
  inputTypeChart = null;
  qualityRadarChart = null;
  inspectionTrendChart = null;
  mapChart = null;
  zoneBarChart = null;
  coverageTrendChart = null;
  deliveryGaugeChart = null;
  riskAlarmChart = null;
  bottomTrendChart = null;
};

onMounted(() => {
  void initCharts();
  startAutoTooltip();
  void nextTick(() => {
    refreshTickerDuration();
  });
  window.addEventListener('resize', resizeAll);
});

onBeforeUnmount(() => {
  stopAutoTooltip();
  window.removeEventListener('resize', resizeAll);
  disposeAll();
});
</script>

<style scoped>
.big-screen {
  position: relative;
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  padding: 12px;
  margin: 0;
  z-index: 3000;
  color: #d9ebff;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 35%, rgba(39, 90, 180, 0.35) 0%, rgba(7, 17, 45, 0.88) 45%, #050c24 100%),
    linear-gradient(160deg, #071634 0%, #040a1e 100%);
}

.screen-decor-layer {
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 0;
}

.frame-line {
  position: absolute;
  display: block;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 245, 255, 0.22);
}

.frame-line--top,
.frame-line--bottom {
  left: 34px;
  right: 34px;
  height: 2px;
  background: linear-gradient(90deg, rgba(0, 245, 255, 0.1), rgba(0, 245, 255, 0.9), rgba(0, 245, 255, 0.1));
}

.frame-line--top {
  top: 8px;
}

.frame-line--bottom {
  bottom: 8px;
}

.frame-line--left,
.frame-line--right {
  top: 34px;
  bottom: 34px;
  width: 2px;
  background: linear-gradient(180deg, rgba(0, 245, 255, 0.08), rgba(0, 245, 255, 0.82), rgba(0, 245, 255, 0.08));
}

.frame-line--left {
  left: 8px;
}

.frame-line--right {
  right: 8px;
}

.frame-corner {
  position: absolute;
  width: 44px;
  height: 44px;
  border: 3px solid #23dbff;
  filter: drop-shadow(0 0 8px rgba(35, 219, 255, 0.7));
}

.frame-corner--tl {
  top: 6px;
  left: 6px;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 8px;
}

.frame-corner--tr {
  top: 6px;
  right: 6px;
  border-left: none;
  border-bottom: none;
  border-top-right-radius: 8px;
}

.frame-corner--bl {
  bottom: 6px;
  left: 6px;
  border-right: none;
  border-top: none;
  border-bottom-left-radius: 8px;
}

.frame-corner--br {
  bottom: 6px;
  right: 6px;
  border-left: none;
  border-top: none;
  border-bottom-right-radius: 8px;
}

.flow-line {
  position: absolute;
  display: block;
  background: linear-gradient(90deg, rgba(0, 245, 255, 0), rgba(0, 245, 255, 0.95), rgba(0, 245, 255, 0));
  filter: blur(0.5px);
}

.flow-line--top,
.flow-line--bottom {
  width: 160px;
  height: 3px;
  animation: frameFlowX 6.5s linear infinite;
}

.flow-line--top {
  top: 7px;
  left: -180px;
}

.flow-line--bottom {
  bottom: 7px;
  left: -240px;
  animation-delay: 1.4s;
}

.flow-line--left,
.flow-line--right {
  width: 3px;
  height: 170px;
  background: linear-gradient(180deg, rgba(0, 245, 255, 0), rgba(0, 245, 255, 0.95), rgba(0, 245, 255, 0));
  animation: frameFlowY 7.2s linear infinite;
}

.flow-line--left {
  left: 7px;
  top: -220px;
}

.flow-line--right {
  right: 7px;
  top: -260px;
  animation-delay: 1.8s;
}

.screen-header {
  position: relative;
  margin-bottom: 10px;
  /* border: 1px solid rgba(68, 129, 246, 0.45); */
  border-radius: 12px;
  text-align: center;
  overflow: hidden;
  /* background: linear-gradient(90deg, rgba(9, 28, 73, 0.65), rgba(13, 45, 106, 0.65), rgba(9, 28, 73, 0.65)); */
}

.header-glow {
  position: absolute;
  inset: 0;
  /* background: linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.16), transparent); */
  animation: moveGlow 4s linear infinite;
}

.screen-header h1 {
  position: relative;
  margin: 10px 0 2px;
  font-size: 30px;
  letter-spacing: 1.5px;
  color: #e8f3ff;
  text-shadow: 0 0 12px rgba(0, 245, 255, 0.45);
}

.screen-header p {
  position: relative;
  margin: 0 0 10px;
  color: #95c3ff;
  font-size: 12px;
  letter-spacing: 2.5px;
  text-transform: uppercase;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(220px, 1fr));
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.kpi-card {
  position: relative;
  border: 1px solid rgba(70, 131, 255, 0.4);
  border-radius: 10px;
  padding: 10px 8px;
  text-align: center;
  background: linear-gradient(180deg, rgba(19, 49, 112, 0.5) 0%, rgba(10, 24, 61, 0.75) 100%);
  box-shadow:
    inset 0 0 28px rgba(0, 173, 255, 0.08),
    0 0 12px rgba(0, 123, 255, 0.16);
}

.kpi-value {
  font-size: 28px;
  line-height: 1;
  font-weight: 700;
  color: #00f5ff;
  text-shadow: 0 0 8px rgba(0, 245, 255, 0.5);
}

.kpi-unit {
  margin-left: 2px;
  font-size: 14px;
  color: #94beff;
}

.kpi-label {
  margin-top: 6px;
  font-size: 12px;
  color: #c7e2ff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.screen-body {
  display: grid;
  grid-template-rows: minmax(0, 1fr) 260px;
  gap: 10px;
  flex: 1;
  min-height: 650px;
}

.screen-top {
  display: grid;
  grid-template-columns: 24% 52% 24%;
  gap: 10px;
  min-height: 0;
}

.side-panel,
.center-panel,
.screen-bottom {
  display: grid;
  gap: 10px;
}

.side-panel {
  grid-template-rows: repeat(2, minmax(0, 1fr));
}

.center-panel {
  grid-template-rows: minmax(0, 1fr);
}

.screen-bottom {
  grid-template-columns: 1fr 1fr;
  min-height: 0;
}

.panel-card {
  position: relative;
  border: 1px solid rgba(70, 131, 255, 0.35);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(11, 29, 72, 0.72) 0%, rgba(6, 18, 48, 0.78) 100%);
  box-shadow:
    inset 0 0 24px rgba(0, 148, 255, 0.06),
    0 0 12px rgba(0, 102, 255, 0.1);
  overflow: hidden;
}

.card-title {
  position: relative;
  padding: 8px 14px;
  font-size: 15px;
  font-weight: 600;
  color: #d7eaff;
  letter-spacing: 0.5px;
  background: linear-gradient(90deg, rgba(31, 91, 202, 0.34), rgba(31, 91, 202, 0));
}

.card-title::before {
  content: '';
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 8px;
  border-radius: 50%;
  background: #00f5ff;
  box-shadow: 0 0 8px rgba(0, 245, 255, 0.9);
}

.chart-box {
  width: 100%;
  height: calc(100% - 39px);
  min-height: 180px;
}

.bottom-chart-box {
  min-height: 0;
}

.bottom-left-card,
.bottom-right-card {
  min-height: 0;
}

.bottom-ticker-wrap {
  height: calc(100% - 39px);
  padding: 8px 10px;
}

.smart-alert-ticker {
  height: 100%;
  overflow: hidden;
  position: relative;
  border-radius: 6px;
  background: transparent;
}

.ticker-track {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  gap: 4px;
  padding: 2px 0 8px;
  animation-name: tickerMarquee;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  will-change: transform;
}

.smart-alert-ticker:hover .ticker-track {
  animation-play-state: paused;
}

.ticker-item {
  width: 100%;
  min-width: 0;
  padding: 2px 0;
  border: none;
  background: transparent;
  box-shadow: none;
}

.ticker-line {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 22px;
  white-space: nowrap;
  overflow: hidden;
}

.ticker-icon {
  font-size: 15px;
  line-height: 1;
  flex: 0 0 auto;
}

.ticker-time {
  margin-left: auto;
  font-size: 11px;
  color: #94a3b8;
  flex: 0 0 auto;
  padding-left: 8px;
}

.ticker-msg {
  font-size: 14px;
  line-height: 1.35;
  color: #e2e8f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ticker-item--emergency {
  color: #ef4444;
}

.ticker-item--success {
  color: #10b981;
}

.ticker-item--anomaly {
  color: #f59e0b;
}

.ticker-item--macro {
  color: #60a5fa;
}

.map-card {
  display: flex;
  flex-direction: column;
  perspective: 1400px;
}

.map-box {
  flex: 1;
  min-height: 420px;
}

.map {
  transform: rotateX(14deg) scale(1.08);
  transform-origin: center 58%;
  will-change: transform;
  filter: drop-shadow(0 22px 22px rgba(0, 0, 0, 0.25));
}

.map-footer {
  display: flex;
  gap: 8px;
  padding: 0 10px 10px;
}

.map-tag {
  position: relative;
  border: 1px solid rgba(0, 245, 255, 0.45);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
  color: #bfe8ff;
  background: rgba(7, 32, 82, 0.68);
}

.screen-header,
.kpi-card,
.panel-card,
.map-tag {
  isolation: isolate;
}

.screen-header::before,
.kpi-card::before,
.panel-card::before,
.map-tag::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(
    120deg,
    rgba(0, 245, 255, 0) 0%,
    rgba(0, 245, 255, 0.9) 20%,
    rgba(91, 143, 249, 0.9) 35%,
    rgba(0, 245, 255, 0) 55%,
    rgba(0, 171, 76, 0.8) 70%,
    rgba(0, 245, 255, 0) 100%
  );
  background-size: 240% 240%;
  background-position: 200% 50%;
  animation: borderShine 4.5s linear infinite;
  pointer-events: none;
  z-index: 3;
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.panel-card::before {
  animation-duration: 5s;
}

.kpi-card::before {
  animation-duration: 3.8s;
}

.map-tag::before {
  animation-duration: 2.6s;
}
.top-overview > p {
  margin: 0 0 10px;
  text-align: center;
  color: #95c3ff;
  font-size: 12px;
  letter-spacing: 1.6px;
  text-transform: uppercase;
}
.top-overview > p {
  margin: 0 0 10px;
  text-align: center;
  color: #95c3ff;
  font-size: 12px;
  letter-spacing: 1.6px;
  text-transform: uppercase;
}
@keyframes moveGlow {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes borderShine {
  0% {
    background-position: 220% 50%;
  }
  100% {
    background-position: -40% 50%;
  }
}

@keyframes frameFlowX {
  0% {
    transform: translateX(0);
    opacity: 0.2;
  }
  15% {
    opacity: 1;
  }
  100% {
    transform: translateX(calc(100vw + 320px));
    opacity: 0.1;
  }
}

@keyframes frameFlowY {
  0% {
    transform: translateY(0);
    opacity: 0.18;
  }
  15% {
    opacity: 1;
  }
  100% {
    transform: translateY(calc(100vh + 340px));
    opacity: 0.08;
  }
}

@keyframes tickerMarquee {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(0, var(--ticker-shift, -50%), 0);
  }
}

@media (max-width: 1600px) {
  .kpi-row {
    grid-template-columns: repeat(2, minmax(220px, 1fr));
  }

  .screen-body {
    height: auto;
    grid-template-rows: none;
  }

  .screen-top,
  .screen-bottom,
  .side-panel,
  .center-panel {
    grid-template-rows: none;
    grid-template-columns: 1fr;
  }
}
</style>
