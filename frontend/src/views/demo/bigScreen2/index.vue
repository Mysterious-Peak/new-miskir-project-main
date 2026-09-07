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
        <h1>Oromia Zone Agriculture Bureau</h1>
      </div>
      <p>Zonal Performance Pulse</p>
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
            <div class="card-title">Input-Output Alignment Monitor</div>
            <div ref="inputTypeChartRef" class="chart-box"></div>
          </div>
          <div class="panel-card">
            <div class="card-title">Extension Service Maturity Matrix</div>
            <div ref="qualityRadarChartRef" class="chart-box"></div>
          </div>
        </div>

        <div class="center-panel">
          <div class="panel-card map-card">
            <div class="card-title">Geo-Spatial Yield & Risk Heatmap</div>
            <div ref="mapChartRef" class="map map-box"></div>
          </div>
        </div>

        <div class="side-panel">
          <div class="panel-card">
            <div class="card-title">Incident Response & Resolution Tracker</div>
            <div ref="coverageTrendChartRef" class="chart-box"></div>
          </div>
          <div class="panel-card">
            <div class="card-title">Capacity Building Penetration Funnel</div>
            <div ref="deliveryGaugeChartRef" class="chart-box"></div>
          </div>
        </div>
      </div>

      <div class="screen-bottom">
        <div class="panel-card bottom-left-card">
          <div class="card-title">Operational Efficiency Quadrant Analysis</div>
          <div ref="bottomTrendChartRef" class="chart-box bottom-chart-box"></div>
        </div>
        <div class="panel-card bottom-right-card">
          <div class="card-title">Real-Time Intelligence Feed</div>
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
  module: '2.1_kpi_cards_north_shewa',
  region: 'North Shewa',
  data: [
    {
      id: 'kpi_ns_1',
      label: 'Total Crop Output',
      value: 482000,
      unit: 'tons',
      trend: -2.1,
      trend_direction: 'down',
      sparkline_data: [495000, 490000, 488000, 482000],
      icon: 'grain'
    },
    {
      id: 'kpi_ns_2',
      label: 'Input Delivery Rate',
      value: 88.4,
      unit: '%',
      trend: 1.5,
      trend_direction: 'up',
      sparkline_data: [85, 86.2, 87, 88.4],
      icon: 'local_shipping'
    },
    {
      id: 'kpi_ns_3',
      label: 'Agri-Training Coverage',
      value: 35000,
      unit: 'households',
      trend: 8.2,
      trend_direction: 'up',
      sparkline_data: [30000, 32000, 33500, 35000],
      icon: 'school'
    },
    {
      id: 'kpi_ns_4',
      label: 'Disaster Risk Index',
      value: 2,
      unit: 'Level',
      trend: 0,
      trend_direction: 'stable',
      sparkline_data: [2, 2, 1, 2],
      icon: 'warning',
      sub_label: 'Moderate risk (frost/drought)'
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
let trainingPulseTimer: ReturnType<typeof setInterval> | null = null;
let modelPulseOn = false;
const ETHIOPIA_MAP_NAME = 'north_shewa_map';
const NORTH_SHEWA_MAP_URL = '/maps/north-shewa-woredas.geojson';
let mapReady = false;
const mapRegionNames = ref<string[]>([]);

const zoneMapPayload = {
  module: '2.3_crop_map_ns',
  title: 'North Shewa Woreda Crop Yield Achievement Distribution',
  region: 'North Shewa Zone',
  metric: 'yield_achievement_rate',
  unit: '%',
  color_scale: {
    high: { min: 85, color: '#10B981', label: 'High (>85%)' },
    medium: { min: 60, max: 84.9, color: '#F59E0B', label: 'Medium (60-85%)' },
    low: { max: 59.9, color: '#EF4444', label: 'Low (<60%)' }
  },
  woredas: [
    {
      id: 'NS_DB',
      name: 'Debre Birhan',
      center: [39.53, 9.68],
      yield_rate: 92.5,
      category: 'high',
      main_crops: ['Wheat', 'Teff', 'Barley'],
      avg_yield_ha: 45.2,
      trained_farmers: 4500,
      risk_level: 'Low',
      risk_detail: 'No significant hazard',
      delivery_status: 'Normal',
      tooltip_content:
        '<b>Debre Birhan</b><br>Main crops: Wheat, Teff<br>Yield achievement rate: 92.5%<br>Average yield: 45.2 quintal/ha<br>Risk: Low<br>Delivery: Normal'
    },
    {
      id: 'NS_TB',
      name: 'Tarmaber',
      center: [39.45, 9.75],
      yield_rate: 88,
      category: 'high',
      main_crops: ['Wheat', 'Pea'],
      avg_yield_ha: 41,
      trained_farmers: 3200,
      risk_level: 'Low',
      risk_detail: 'Localized frost',
      delivery_status: 'Normal',
      tooltip_content:
        '<b>Tarmaber</b><br>Main crops: Wheat, Pea<br>Yield achievement rate: 88.0%<br>Average yield: 41.0 quintal/ha<br>Risk: Low (localized frost)<br>Delivery: Normal'
    },
    {
      id: 'NS_KW',
      name: 'Kewet',
      center: [39.6, 9.55],
      yield_rate: 76.5,
      category: 'medium',
      main_crops: ['Sorghum', 'Maize'],
      avg_yield_ha: 35.5,
      trained_farmers: 2100,
      risk_level: 'Medium',
      risk_detail: 'Drought pressure',
      delivery_status: 'Delayed by 1 day',
      tooltip_content:
        '<b>Kewet</b><br>Main crops: Sorghum, Maize<br>Yield achievement rate: 76.5%<br>Average yield: 35.5 quintal/ha<br>Risk: Medium (drought)<br>Delivery: Delayed by 1 day'
    },
    {
      id: 'NS_HM',
      name: 'Hagere Mariam',
      center: [39.4, 9.6],
      yield_rate: 72,
      category: 'medium',
      main_crops: ['Teff', 'Wheat'],
      avg_yield_ha: 33,
      trained_farmers: 1800,
      risk_level: 'Medium',
      risk_detail: 'Pest and disease pressure',
      delivery_status: 'Normal',
      tooltip_content:
        '<b>Hagere Mariam</b><br>Main crops: Teff, Wheat<br>Yield achievement rate: 72.0%<br>Average yield: 33.0 quintal/ha<br>Risk: Medium (pest and disease)<br>Delivery: Normal'
    },
    {
      id: 'NS_MJ',
      name: 'Moretena Jiru',
      center: [39.5, 9.8],
      yield_rate: 68.5,
      category: 'medium',
      main_crops: ['Barley', 'Wheat'],
      avg_yield_ha: 30.5,
      trained_farmers: 1500,
      risk_level: 'Medium',
      risk_detail: 'Hail',
      delivery_status: 'Normal',
      tooltip_content:
        '<b>Moretena Jiru</b><br>Main crops: Barley, Wheat<br>Yield achievement rate: 68.5%<br>Average yield: 30.5 quintal/ha<br>Risk: Medium (hail)<br>Delivery: Normal'
    },
    {
      id: 'NS_MS',
      name: 'Minjar Shenkora',
      center: [39.65, 9.7],
      yield_rate: 82,
      category: 'medium',
      main_crops: ['Teff', 'Wheat'],
      avg_yield_ha: 38,
      trained_farmers: 2800,
      risk_level: 'Low',
      risk_detail: 'None',
      delivery_status: 'Normal',
      tooltip_content:
        '<b>Minjar Shenkora</b><br>Main crops: Teff, Wheat<br>Yield achievement rate: 82.0%<br>Average yield: 38.0 quintal/ha<br>Risk: Low<br>Delivery: Normal'
    },
    {
      id: 'NS_EG',
      name: 'Efratana Gidim',
      center: [39.35, 9.85],
      yield_rate: 65,
      category: 'medium',
      main_crops: ['Wheat', 'Lentil'],
      avg_yield_ha: 29,
      trained_farmers: 1200,
      risk_level: 'Medium',
      risk_detail: 'Soil degradation',
      delivery_status: 'Delayed by 2 days',
      tooltip_content:
        '<b>Efratana Gidim</b><br>Main crops: Wheat, Lentil<br>Yield achievement rate: 65.0%<br>Average yield: 29.0 quintal/ha<br>Risk: Medium (soil degradation)<br>Delivery: Delayed by 2 days'
    },
    {
      id: 'NS_AS',
      name: 'Asagirt',
      center: [39.3, 9.9],
      yield_rate: 58,
      category: 'low',
      main_crops: ['Barley', 'Oat'],
      avg_yield_ha: 25,
      trained_farmers: 900,
      risk_level: 'High',
      risk_detail: 'Severe frost',
      delivery_status: 'Blocked',
      tooltip_content:
        '<b>Asagirt</b><br>Main crops: Barley, Oat<br>Yield achievement rate: 58.0%<br>Average yield: 25.0 quintal/ha<br>Risk: High (severe frost)<br>Delivery: Blocked'
    },
    {
      id: 'NS_AN',
      name: 'Ankober',
      center: [39.7, 9.85],
      yield_rate: 55,
      category: 'low',
      main_crops: ['Wheat', 'Teff'],
      avg_yield_ha: 28,
      trained_farmers: 1200,
      risk_level: 'High',
      risk_detail: 'Frost hazard (moderate)',
      delivery_status: 'Delayed by 3 days',
      tooltip_content:
        '<b>Ankober</b><br>Main crops: Wheat, Teff<br>Yield achievement rate: 55.0%<br>Average yield: 28.0 quintal/ha<br>Risk: High (frost)<br>Delivery: Delayed by 3 days'
    },
    {
      id: 'NS_GR',
      name: 'Gishe Rabel',
      center: [39.25, 9.75],
      yield_rate: 62,
      category: 'medium',
      main_crops: ['Wheat', 'Faba Bean'],
      avg_yield_ha: 27.5,
      trained_farmers: 1100,
      risk_level: 'Medium',
      risk_detail: 'Uneven rainfall',
      delivery_status: 'Normal',
      tooltip_content:
        '<b>Gishe Rabel</b><br>Main crops: Wheat, Faba Bean<br>Yield achievement rate: 62.0%<br>Average yield: 27.5 quintal/ha<br>Risk: Medium (uneven rainfall)<br>Delivery: Normal'
    },
    {
      id: 'NS_KG',
      name: 'Keye Gebriel',
      center: [39.55, 9.95],
      yield_rate: 52,
      category: 'low',
      main_crops: ['Barley', 'Wheat'],
      avg_yield_ha: 24,
      trained_farmers: 800,
      risk_level: 'High',
      risk_detail: 'Extreme low temperature',
      delivery_status: 'Severely delayed',
      tooltip_content:
        '<b>Keye Gebriel</b><br>Main crops: Barley, Wheat<br>Yield achievement rate: 52.0%<br>Average yield: 24.0 quintal/ha<br>Risk: High (extreme low temperature)<br>Delivery: Severely delayed'
    },
    {
      id: 'NS_WB',
      name: 'Worebabu',
      center: [39.45, 9.5],
      yield_rate: 70,
      category: 'medium',
      main_crops: ['Maize', 'Sorghum'],
      avg_yield_ha: 32,
      trained_farmers: 1600,
      risk_level: 'Medium',
      risk_detail: 'Drought',
      delivery_status: 'Normal',
      tooltip_content:
        '<b>Worebabu</b><br>Main crops: Maize, Sorghum<br>Yield achievement rate: 70.0%<br>Average yield: 32.0 quintal/ha<br>Risk: Medium (drought)<br>Delivery: Normal'
    },
    {
      id: 'NS_MG',
      name: 'Menze Gera',
      center: [39.75, 9.75],
      yield_rate: 48,
      category: 'low',
      main_crops: ['Wheat', 'Barley'],
      avg_yield_ha: 22.5,
      trained_farmers: 750,
      risk_level: 'High',
      risk_detail: 'Logistics disruption / frost',
      delivery_status: 'Critically lagging',
      tooltip_content:
        '<b>Menze Gera</b><br>Main crops: Wheat, Barley<br>Yield achievement rate: 48.0%<br>Average yield: 22.5 quintal/ha<br>Risk: High (logistics/frost)<br>Delivery: Critically lagging'
    },
    {
      id: 'NS_SL',
      name: 'Selale',
      center: [39.3, 9.65],
      yield_rate: 78,
      category: 'medium',
      main_crops: ['Teff', 'Wheat'],
      avg_yield_ha: 36,
      trained_farmers: 2000,
      risk_level: 'Low',
      risk_detail: 'Mild disease',
      delivery_status: 'Normal',
      tooltip_content:
        '<b>Selale</b><br>Main crops: Teff, Wheat<br>Yield achievement rate: 78.0%<br>Average yield: 36.0 quintal/ha<br>Risk: Low<br>Delivery: Normal'
    },
    {
      id: 'NS_FI',
      name: 'Fiche (Special)',
      center: [39.28, 9.82],
      yield_rate: 85,
      category: 'high',
      main_crops: ['Vegetables', 'Wheat'],
      avg_yield_ha: 40,
      trained_farmers: 1900,
      risk_level: 'Low',
      risk_detail: 'None',
      delivery_status: 'Priority',
      tooltip_content:
        '<b>Fiche</b><br>Main crops: Vegetables, Wheat<br>Yield achievement rate: 85.0%<br>Average yield: 40.0 quintal/ha<br>Risk: Low<br>Delivery: Priority'
    },
    {
      id: 'NS_LG',
      name: 'Legambo',
      center: [39.6, 9.9],
      yield_rate: 59,
      category: 'low',
      main_crops: ['Barley', 'Wheat'],
      avg_yield_ha: 26,
      trained_farmers: 950,
      risk_level: 'High',
      risk_detail: 'Frost / poor transport access',
      delivery_status: 'Delayed',
      tooltip_content:
        '<b>Legambo</b><br>Main crops: Barley, Wheat<br>Yield achievement rate: 59.0%<br>Average yield: 26.0 quintal/ha<br>Risk: High (frost)<br>Delivery: Delayed'
    }
  ],
  summary_stats: { total_woredas: 16, high_perf_count: 4, med_perf_count: 6, low_perf_count: 6, avg_zone_yield_rate: 68.9 }
};

const smartAlertsPayload = {
  module: '2.5.2_smart_alerts_ns',
  scroll_speed: 30,
  alerts: [
    {
      id: 'alert_ns_001',
      type: 'EMERGENCY',
      priority: 1,
      icon: '🚨',
      zone_name: 'Ankober',
      message_html:
        '<b>Ankober</b>: Frost hazard alert! A sharp temperature drop is expected within the next 48 hours, with high wheat damage risk. Immediate anti-frost film coverage is recommended.',
      timestamp: '2026-03-19T10:00:00Z'
    },
    {
      id: 'alert_ns_002',
      type: 'ANOMALY',
      priority: 2,
      icon: '⚠️',
      zone_name: 'Menze Gera',
      message_html:
        '<b>Menze Gera</b>: Input delivery is severely delayed (65%). Logistics vehicles are blocked and backup routes should be coordinated.',
      timestamp: '2026-03-19T09:30:00Z'
    },
    {
      id: 'alert_ns_003',
      type: 'SUCCESS',
      priority: 3,
      icon: '🏆',
      zone_name: 'Debre Birhan',
      message_html:
        "<b>Debre Birhan</b>: Wheat yield surpassed <span style='color:#10B981;font-weight:bold'>45</span> quintal/ha, a historical high for this area!",
      timestamp: '2026-03-19T08:45:00Z'
    },
    {
      id: 'alert_ns_004',
      type: 'MACRO',
      priority: 3,
      icon: '📈',
      zone_name: 'North Shewa',
      message_html:
        "<b>Regional forecast</b>: Despite localized frost, total seasonal output is expected to reach <span style='color:#F8FAFC;font-weight:bold'>482,000</span> tons, roughly flat year-over-year.",
      timestamp: '2026-03-19T07:00:00Z'
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
  module: '2.2.1_production_combo_ns',
  title: 'North Shewa Woreda Output vs Input Delivery',
  x_axis: ['Debre Birhan', 'Ankober', 'Kewet', 'Tarmaber', 'Hagere Mariam', 'Moretena Jiru', 'Menze Gera'],
  series: [
    {
      name: 'Crop Output (tons)',
      type: 'bar',
      y_axis_index: 0,
      data: [120000, 45000, 85000, 98000, 62000, 55000, 48000]
    },
    {
      name: 'Input Delivery Completion Rate (%)',
      type: 'line',
      symbol: 'circle',
      y_axis_index: 1,
      data: [95.5, 72, 88.5, 92, 85, 78.5, 65],
      alert_threshold: 80
    }
  ],
  insights: [
    { woreda: 'Ankober', issue: 'High delivery demand but low completion rate (72%); prioritize replenishment.' },
    { woreda: 'Menze Gera', issue: 'Lowest delivery rate (65%); this may severely affect next-season sowing.' }
  ]
};

const buildInputTypeOption = () => {
  const alertThreshold = productionComboPayload.series[1].alert_threshold;
  const insightMap = new Map(productionComboPayload.insights.map((item) => [item.woreda, item.issue]));

  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any[]) => {
        const woreda = params?.[0]?.axisValue || '';
        const outputVal = Number(params?.find((p: any) => p.seriesName === productionComboPayload.series[0].name)?.value ?? 0);
        const deliveryVal = Number(params?.find((p: any) => p.seriesName === productionComboPayload.series[1].name)?.value ?? 0);
        const issue = insightMap.get(woreda);
        return [
          `<b>${woreda}</b>`,
          `${productionComboPayload.series[0].name}: ${outputVal.toLocaleString()}`,
          `${productionComboPayload.series[1].name}: ${deliveryVal.toFixed(1)}%`,
          issue ? `<span style="color:#F59E0B">Insight: ${issue}</span>` : ''
        ]
          .filter(Boolean)
          .join('<br/>');
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
        name: 'tons',
        nameTextStyle: { color: '#9cc7ff', fontSize: 10 },
        axisLabel: { color: '#9cc7ff', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(94, 138, 196, 0.25)' } }
      },
      {
        type: 'value',
        name: '%',
        nameTextStyle: { color: '#9cc7ff', fontSize: 10 },
        axisLabel: { color: '#9cc7ff', fontSize: 10, formatter: (value: number) => `${value}%` },
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
        lineStyle: { width: 2.5, color: '#FBBF24' },
        itemStyle: {
          color: (params: any) => (Number(params.value) < alertThreshold ? '#F59E0B' : '#FBBF24')
        },
        data: productionComboPayload.series[1].data.map((value) => ({
          value,
          itemStyle: { color: value < alertThreshold ? '#F59E0B' : '#FBBF24' }
        }))
      }
    ]
  };
};

const efficiencyRadarPayload = {
  module: '2.2.2_efficiency_radar_ns',
  title: 'North Shewa Agri-Tech Extension Efficiency Radar',
  indicators: [
    { name: 'Improved Seed Adoption', max: 100 },
    { name: 'Row Spacing Adoption', max: 100 },
    { name: 'Fertilizer Use Efficiency', max: 100 },
    { name: 'Farmer Training Coverage', max: 100 },
    { name: 'Pest Response Speed', max: 100 },
    { name: 'Irrigation Utilization', max: 100 }
  ],
  target_line: [90, 85, 80, 85, 90, 60],
  actual_data: [88, 75, 72, 82, 65, 35],
  area_color: 'rgba(16, 185, 129, 0.4)',
  border_color: '#10B981',
  analysis: 'Irrigation utilization (35%) is far below the target (60%) and is the key bottleneck; improved seed adoption performs strongly.'
};

const buildQualityRadarOption = () => ({
  tooltip: {
    trigger: 'item',
    formatter: (params: any) => {
      const val = params?.value;
      const values = Array.isArray(val) ? val.join(', ') : val;
      return `${params?.name || ''}<br/>Value: ${values}<br/>${efficiencyRadarPayload.analysis}`;
    }
  },
  grid: { top: 8, bottom: 44 },
  legend: {
    bottom: 8,
    textStyle: { color: '#9cc7ff', fontSize: 11 },
    data: ['District Annual Target', 'North Shewa Actual']
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
        color: 'rgba(148, 163, 184, 0.95)',
        width: 1.5,
        type: 'dashed'
      },
      areaStyle: { color: 'transparent' },
      data: [{ value: efficiencyRadarPayload.target_line, name: 'District Annual Target' }]
    },
    {
      type: 'radar',
      areaStyle: {
        color: efficiencyRadarPayload.area_color
      },
      lineStyle: { color: efficiencyRadarPayload.border_color, width: 2 },
      symbol: 'circle',
      symbolSize: 5,
      itemStyle: { color: efficiencyRadarPayload.border_color },
      data: [{ value: efficiencyRadarPayload.actual_data, name: 'North Shewa Actual' }]
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

const buildMapOption = () => {
  const getAreaColor = (category?: string) => {
    if (category === 'high') return zoneMapPayload.color_scale.high.color;
    if (category === 'medium') return zoneMapPayload.color_scale.medium.color;
    return zoneMapPayload.color_scale.low.color;
  };
  const getTierText = (score: number) => {
    if (score > 85) return zoneMapPayload.color_scale.high.label;
    if (score >= 60) return zoneMapPayload.color_scale.medium.label;
    return zoneMapPayload.color_scale.low.label;
  };
  const mapData = zoneMapPayload.woredas.map((woreda) => ({
    name: woreda.name,
    value: Number(woreda.yield_rate),
    zoneMetrics: woreda,
    itemStyle: {
      areaColor: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: adjustHexColor(getAreaColor(woreda.category), 24) },
        { offset: 1, color: adjustHexColor(getAreaColor(woreda.category), -28) }
      ]),
      borderColor: '#ffffff',
      borderWidth: 1.8,
      shadowBlur: 10,
      shadowOffsetY: 4,
      shadowColor: 'rgba(10, 20, 35, 0.28)'
    }
  }));

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove|click',
      formatter: (p: any) => {
        const metrics = p?.data?.zoneMetrics;
        if (!metrics) return p?.name || 'Region';
        const score = Number(metrics.yield_rate || 0);
        const title = p?.name || 'Unknown';
        return metrics.tooltip_content
          ? `${metrics.tooltip_content}<br>Tier: ${getTierText(score)}`
          : [`<b>${title}</b>`, `Yield achievement rate: ${score.toFixed(1)}${zoneMapPayload.unit}`, `Risk: ${metrics.risk_level ?? '-'}`].join(
              '<br/>'
            );
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
        name: 'Regional Command Map',
        type: 'map',
        map: ETHIOPIA_MAP_NAME,
        roam: true,
        zoom: 1.06,
        layoutCenter: ['50%', '50%'],
        layoutSize: '90%',
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
          shadowColor: 'rgba(9, 176, 255, 0.28)',
          areaColor: 'rgba(30, 41, 59, 0.78)'
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

const disasterResponsePayload = {
  module: '2.4.1_disaster_response_ns',
  title: 'North Shewa Disaster Response Progress',
  categories: [
    { type: 'Locust', label: 'Locust', new_reports: 5, resolved: 3, progress_percent: 60 },
    { type: 'Wheat Rust', label: 'Wheat Rust', new_reports: 2, resolved: 2, progress_percent: 100 },
    { type: 'Drought', label: 'Drought', new_reports: 0, resolved: 0, progress_percent: 0, display_mode: 'hidden_or_thin_line' },
    { type: 'Flood', label: 'Flood', new_reports: 1, resolved: 0, progress_percent: 0 }
  ]
};

const buildCoverageTrendOption = () => {
  const rows = disasterResponsePayload.categories.map((item) => ({
    ...item,
    displayLabel: `${item.label} (${item.type})`,
    displayNew: item.new_reports === 0 && item.display_mode === 'hidden_or_thin_line' ? 0.12 : item.new_reports
  }));
  const categories = rows.map((item) => item.displayLabel);
  const newReportsData = rows.map((item) => item.displayNew);
  const resolvedData = rows.map((item) => item.resolved);
  const maxNew = Math.max(...rows.map((item) => item.new_reports), 1);
  const ringX = 90;
  const ringTop = 14;
  const ringBottom = 12;
  const ringY = (index: number) => ringTop + ((index + 0.5) * (100 - ringTop - ringBottom)) / rows.length;

  const ringSeries = rows.map((item, index) => ({
    name: `${item.type}-progress`,
    type: 'pie',
    radius: ['5%', '7.5%'],
    center: [`${ringX}%`, `${ringY(index)}%`],
    startAngle: 90,
    clockwise: true,
    silent: true,
    label: { show: false },
    labelLine: { show: false },
    z: 5,
    data: [
      {
        value: item.progress_percent,
        itemStyle: {
          color: item.progress_percent >= 80 ? '#10B981' : item.progress_percent > 0 ? '#F59E0B' : '#64748B'
        }
      },
      {
        value: 100 - item.progress_percent,
        itemStyle: { color: 'rgba(148, 163, 184, 0.25)' }
      }
    ]
  }));

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any[]) => {
        const dataIndex = Number(params?.[0]?.dataIndex ?? 0);
        const row = rows[dataIndex];
        return [
          `<b>${row.displayLabel}</b>`,
          `New reports: ${row.new_reports}`,
          `Resolved: ${row.resolved}`,
          `Progress: ${row.progress_percent}%`
        ].join('<br/>');
      }
    },
    grid: { left: 98, right: 96, top: 20, bottom: 20 },
    xAxis: {
      type: 'value',
      min: 0,
      max: Math.ceil(maxNew * 1.25),
      axisLabel: { color: '#9cc7ff' },
      splitLine: { lineStyle: { color: 'rgba(94, 138, 196, 0.2)' } }
    },
    yAxis: {
      type: 'category',
      data: categories,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#dbeafe', fontSize: 10 }
    },
    series: [
      {
        name: 'New reports',
        type: 'bar',
        data: newReportsData,
        barWidth: 12,
        itemStyle: {
          borderRadius: 8,
          color: 'rgba(96, 165, 250, 0.35)'
        }
      },
      {
        name: 'Resolved',
        type: 'bar',
        data: resolvedData,
        barWidth: 8,
        barGap: '-100%',
        itemStyle: {
          borderRadius: 8,
          color: '#10B981'
        },
        label: {
          show: true,
          position: 'right',
          color: '#f8fafc',
          fontSize: 10,
          formatter: (params: any) => `${rows[params.dataIndex]?.progress_percent ?? 0}%`
        }
      },
      ...ringSeries
    ],
    graphic: [
      {
        type: 'text',
        right: 22,
        top: 6,
        style: {
          text: 'Progress Ring',
          fill: '#9cc7ff',
          fontSize: 10
        }
      }
    ]
  };
};

const vulnerabilityPyramidPayload = {
  module: '2.4.2_training_pyramid_ns',
  title: 'North Shewa Farmer Training Tier Distribution',
  total_households: 70000,
  layers: [
    { level: 'model', label: 'Model Farmers', percentage: 5, count: 3500, style: 'animate_pulse' },
    { level: 'backbone', label: 'Backbone Farmers', percentage: 15, count: 10500 },
    { level: 'regular', label: 'Regular Trainees', percentage: 30, count: 21000 },
    { level: 'uncovered', label: 'Uncovered Farmers', percentage: 50, count: 35000 }
  ],
  center_text: {
    big: '50%',
    small: 'Coverage Pending Conversion'
  }
};

const getVulnerabilityColor = (level: string) => {
  if (level === 'uncovered') return '#64748B';
  if (level === 'regular') return '#3B82F6';
  if (level === 'backbone') return '#10B981';
  if (level === 'model') return modelPulseOn ? '#FACC15' : '#F59E0B';
  return '#94A3B8';
};

const buildDeliveryGaugeOption = () => {
  const ringOrder = ['uncovered', 'regular', 'backbone', 'model'];
  const ordered = ringOrder
    .map((level) => vulnerabilityPyramidPayload.layers.find((item) => item.level === level))
    .filter((item): item is (typeof vulnerabilityPyramidPayload.layers)[number] => Boolean(item));
  const ringSizes: Array<[string, string]> = [
    ['62%', '76%'],
    ['48%', '60%'],
    ['34%', '46%'],
    ['20%', '30%']
  ];

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => `${params.name}<br/>Share: ${params.value}%<br/>Households: ${(params.data?.count ?? 0).toLocaleString()}`
    },
    legend: {
      bottom: 2,
      left: 'center',
      data: ordered.map((item) => item.label),
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: '#cfe6ff', fontSize: 10 }
    },
    series: ordered.map((item, idx) => ({
      name: item.label,
      type: 'pie',
      radius: ringSizes[idx] || ['20%', '30%'],
      center: ['50%', '46%'],
      startAngle: 90,
      clockwise: true,
      silent: true,
      label: { show: false },
      labelLine: { show: false },
      z: 4 + idx,
      data: [
        {
          name: item.label,
          value: item.percentage,
          count: item.count,
          itemStyle: {
            color: getVulnerabilityColor(item.level),
            shadowBlur: item.level === 'model' ? 12 : 0,
            shadowColor: item.level === 'model' ? 'rgba(250, 204, 21, 0.55)' : 'transparent'
          }
        },
        {
          name: `${item.label}-rest`,
          value: 100 - item.percentage,
          count: 0,
          itemStyle: { color: 'rgba(148, 163, 184, 0.16)' }
        }
      ]
    })),
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '38%',
        style: {
          text: vulnerabilityPyramidPayload.center_text.big,
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
          text: vulnerabilityPyramidPayload.center_text.small,
          fill: '#F59E0B',
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
  module: '2.5.1_scatter_analysis_ns',
  x_axis: { label: 'Delivery Timeliness (%)', min: 0, max: 100 },
  y_axis: { label: 'Average Woreda Yield (quintal/ha)', min: 0, max: 60 },
  quadrants: [
    { id: 'Q1', label: '⭐ Model Woreda (Debre Birhan)' },
    { id: 'Q2', label: 'Natural Potential Zone' },
    { id: 'Q3', label: '🆘 Priority Support (Ankober)' },
    { id: 'Q4', label: '⚠️ Efficiency Concern' }
  ],
  points: [
    {
      woreda_id: 'DEBRE_BIRHAN',
      woreda_name: 'Debre Birhan',
      x: 95.5,
      y: 45.2,
      category: 'MODEL_ZONE',
      tooltip: 'Debre Birhan: Delivery 95.5%, Yield 45.2'
    },
    {
      woreda_id: 'TARMABER',
      woreda_name: 'Tarmaber',
      x: 92,
      y: 41,
      category: 'MODEL_ZONE',
      tooltip: 'Tarmaber: Delivery 92.0%, Yield 41.0'
    },
    {
      woreda_id: 'ANKOBER',
      woreda_name: 'Ankober',
      x: 72,
      y: 28,
      category: 'KEY_SUPPORT',
      tooltip: 'Ankober: Delivery 72.0%, Yield 28.0 (frost impact)'
    },
    {
      woreda_id: 'MENZE_GERA',
      woreda_name: 'Menze Gera',
      x: 65,
      y: 22.5,
      category: 'KEY_SUPPORT',
      tooltip: 'Menze Gera: Delivery 65.0%, Yield 22.5'
    },
    {
      woreda_id: 'KEWET',
      woreda_name: 'Kewet',
      x: 88.5,
      y: 35.5,
      category: 'POTENTIAL_NAT',
      tooltip: 'Kewet: Delivery 88.5%, Yield 35.5'
    },
    {
      woreda_id: 'SPECIAL_TEST',
      woreda_name: 'Demo Site X',
      x: 98,
      y: 25,
      category: 'EFFICIENCY_ISSUE',
      tooltip: 'Demo Site X: Delivery 98.0% but yield only 25.0 (suspected soil disease)'
    }
  ]
};

const buildBottomTrendOption = () => {
  const xMid = (scatterAnalysisPayload.x_axis.min + scatterAnalysisPayload.x_axis.max) / 2;
  const yMid = (scatterAnalysisPayload.y_axis.min + scatterAnalysisPayload.y_axis.max) / 2;
  const categoryColorMap: Record<string, string> = {
    MODEL_ZONE: '#3B82F6',
    POTENTIAL_NAT: '#10B981',
    KEY_SUPPORT: '#F59E0B',
    EFFICIENCY_ISSUE: '#EF4444'
  };
  const points = scatterAnalysisPayload.points.map((item) => ({
    value: [item.x, item.y],
    zone_name: item.woreda_name,
    tooltip: item.tooltip,
    itemStyle: {
      color: categoryColorMap[item.category] || '#8B5CF6',
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
        }
      }
    ]
  };
};

const ensureEthiopiaMap = async () => {
  if (mapReady) return true;
  try {
    const res = await fetch(NORTH_SHEWA_MAP_URL);
    if (!res.ok) throw new Error(`Failed to load map json: ${res.status}`);
    const woredaGeoJson = await res.json();
    if (!Array.isArray(woredaGeoJson?.features) || !woredaGeoJson.features.length) {
      throw new Error('north-shewa-woredas.geojson has no features');
    }
    mapRegionNames.value = woredaGeoJson.features.map((feature: any, index: number) => {
      const props = feature?.properties || {};
      const name = props.name || `Woreda-${index + 1}`;
      feature.properties = { ...props, name };
      return name;
    });
    echarts.registerMap(ETHIOPIA_MAP_NAME, woredaGeoJson as any);
    mapReady = true;
    return true;
  } catch (error) {
    console.error('Load Ethiopia map failed:', error);
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

  trainingPulseTimer = setInterval(() => {
    modelPulseOn = !modelPulseOn;
    if (deliveryGaugeChart) {
      deliveryGaugeChart.setOption(buildDeliveryGaugeOption(), true);
    }
  }, 900);
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
  if (trainingPulseTimer) {
    clearInterval(trainingPulseTimer);
    trainingPulseTimer = null;
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
  min-height: 360px;
}

.map {
  transform: rotateX(14deg) scale(0.98);
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
.top-overview > p {
  margin: 0 0 10px;
  text-align: center;
  color: #95c3ff;
  font-size: 12px;
  letter-spacing: 1.6px;
  text-transform: uppercase;
}
.kpi-card::before {
  animation-duration: 3.8s;
}

.map-tag::before {
  animation-duration: 2.6s;
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
