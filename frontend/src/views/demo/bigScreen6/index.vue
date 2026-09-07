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
        <h1>Oromia Regional Bureau of Irrigation & Pastoral Development</h1>
      </div>
      <p>Business Name: Strategic Irrigation & Pastoral Performance Pulse</p>
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
            <div class="card-title" style="font-size: 14px">Irrigation Expansion vs. Infrastructure Integrity Trend</div>
            <div ref="inputTypeChartRef" class="chart-box"></div>
          </div>
          <div class="panel-card">
            <div class="card-title">Agricultural Water Supply Stability Trend</div>
            <div ref="qualityRadarChartRef" class="chart-box"></div>
          </div>
        </div>

        <div class="center-panel">
          <div class="panel-card map-card">
            <div class="card-title">Irrigation Coverage Map</div>
            <div ref="mapChartRef" class="map map-box"></div>
          </div>
        </div>

        <div class="side-panel">
          <div class="panel-card">
            <div class="card-title">Irrigation Coverage by Zone</div>
            <div ref="coverageTrendChartRef" class="chart-box"></div>
          </div>
          <div class="panel-card">
            <div class="card-title">Pastoral Livelihood Indicators by Zone</div>
            <div ref="deliveryGaugeChartRef" class="chart-box"></div>
          </div>
        </div>
      </div>

      <div class="screen-bottom">
        <div class="panel-card bottom-left-card">
          <div class="card-title">Irrigation Area vs. Crop Yield by Zone</div>
          <div ref="bottomTrendChartRef" class="chart-box bottom-chart-box"></div>
        </div>
        <div class="panel-card bottom-right-card">
          <div class="card-title">Water Supply Alerts & Pastoral Support Feed</div>
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
  module: 'kpi_irrigation',
  data: [
    {
      id: 'kpi_irr_1',
      label: 'Irrigated land expansion area',
      value: 12450,
      unit: 'ha',
      trend: 380,
      trend_direction: 'up',
      status_color: '#10B981',
      sparkline_data: [10800, 11200, 11800, 12450],
      icon: 'water_drop'
    },
    {
      id: 'kpi_irr_2',
      label: 'Irrigation infrastructure integrity rate',
      value: 88.2,
      unit: '%',
      trend: 2.1,
      trend_direction: 'up',
      status_color: '#10B981',
      sparkline_data: [82, 84, 86, 88.2],
      icon: 'build'
    },
    {
      id: 'kpi_irr_3',
      label: 'Agricultural water supply stability',
      value: 91.5,
      unit: '%',
      trend: 1.8,
      trend_direction: 'up',
      status_color: '#3B82F6',
      sparkline_data: [86, 88, 90, 91.5],
      icon: 'water'
    },
    {
      id: 'kpi_irr_4',
      label: 'Crop yield per irrigated hectare',
      value: 38.6,
      unit: 'quintal/ha',
      trend: 2.2,
      trend_direction: 'up',
      status_color: '#10B981',
      sparkline_data: [32, 34, 36, 38.6],
      icon: 'grass'
    },
    {
      id: 'kpi_irr_5',
      label: 'Pastoral livestock productivity index',
      value: 105.2,
      unit: 'index',
      trend: 3.5,
      trend_direction: 'up',
      status_color: '#10B981',
      sparkline_data: [98, 100, 103, 105.2],
      icon: 'pets'
    },
    {
      id: 'kpi_irr_6',
      label: 'Pastoral support projects implemented',
      value: 24,
      unit: 'no.',
      trend: 4,
      trend_direction: 'up',
      status_color: '#8B5CF6',
      sparkline_data: [16, 18, 21, 24],
      icon: 'handshake'
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
const ETHIOPIA_MAP_NAME = 'oromia_zones_adm2';
const ETHIOPIA_MAP_URL = '/maps/ethiopia-adm2.geojson';
let mapReady = false;
const mapRegionNames = ref<string[]>([]);
const OROMIA_ZONE_NAMES = new Set([
  'Arsi',
  'Bale',
  'Borena',
  'East Harerge',
  'East Shewa',
  'East Wellega',
  'Guji',
  'Horo Guduru',
  'Ilubabor',
  'Jimma',
  'Kelem Wellega',
  'North Shewa(R4)',
  'South West Shewa',
  'West Arsi',
  'West Harerge',
  'West Shewa',
  'West Wellega'
]);

const zoneMapPayload = {
  module: '2.3_zone_map',
  projection: 'Mercator',
  zones: [
    {
      zone_id: 'EAST_SHEWA',
      zone_name: 'East Shewa',
      center: [39.27, 8.54],
      metrics: { irrigation_coverage_pct: 42.5, water_supply_stability: 94.2, yield_avg: 42.1, livestock_productivity: 108.5, pastoral_projects: 5 }
    },
    {
      zone_id: 'JIMMA',
      zone_name: 'Jimma',
      center: [36.83, 7.67],
      metrics: { irrigation_coverage_pct: 38.2, water_supply_stability: 92.1, yield_avg: 38.5, livestock_productivity: 102.3, pastoral_projects: 4 }
    },
    {
      zone_id: 'WEST_WELEGA',
      zone_name: 'West Welega',
      center: [36.55, 9.08],
      metrics: { irrigation_coverage_pct: 28.6, water_supply_stability: 88.5, yield_avg: 30.2, livestock_productivity: 98.2, pastoral_projects: 3 }
    },
    {
      zone_id: 'EAST_HARARGE',
      zone_name: 'East Hararghe',
      center: [40.87, 9.08],
      metrics: { irrigation_coverage_pct: 35.2, water_supply_stability: 89.8, yield_avg: 32.5, livestock_productivity: 95.6, pastoral_projects: 3 }
    },
    {
      zone_id: 'BORENA',
      zone_name: 'Borena',
      center: [39.58, 5.33],
      metrics: { irrigation_coverage_pct: 12.4, water_supply_stability: 78.2, yield_avg: 18.0, livestock_productivity: 112.5, pastoral_projects: 4 }
    },
    {
      zone_id: 'BALE',
      zone_name: 'Bale',
      center: [39.95, 6.85],
      metrics: { irrigation_coverage_pct: 22.8, water_supply_stability: 85.4, yield_avg: 25.8, livestock_productivity: 99.2, pastoral_projects: 2 }
    },
    {
      zone_id: 'ARSI',
      zone_name: 'Arsi',
      center: [38.75, 7.1],
      metrics: { irrigation_coverage_pct: 45.6, water_supply_stability: 95.1, yield_avg: 40.2, livestock_productivity: 104.2, pastoral_projects: 3 }
    }
  ]
};

const smartAlertsPayload = {
  module: '2.5.2_smart_alerts',
  scroll_speed: 70,
  alerts: [
    {
      id: 'alert_001',
      type: 'EMERGENCY',
      priority: 1,
      icon: '🚨',
      zone_name: 'Borena',
      message_html:
        "<b>Borena</b>: <span style='color:#EF4444;font-weight:bold'>Water supply stability 78.2%</span> below target—drought risk in pastoral areas, recommend emergency water trucking.",
      timestamp: '2026-03-19T09:15:00Z'
    },
    {
      id: 'alert_002',
      type: 'SUCCESS',
      priority: 3,
      icon: '✅',
      zone_name: 'East Shewa',
      message_html:
        "<b>East Shewa</b>: <span style='color:#10B981;font-weight:bold'>2</span> new irrigation schemes completed this month, 420 ha brought under irrigation.",
      timestamp: '2026-03-19T08:30:00Z'
    },
    {
      id: 'alert_003',
      type: 'ANOMALY',
      priority: 2,
      icon: '⚠️',
      zone_name: 'Jimma',
      message_html:
        '<b>Jimma</b>: Pump station maintenance overdue—water supply down <span style="color:#F97316;font-weight:bold">8%</span> MoM in Zone 3.',
      timestamp: '2026-03-19T07:45:00Z'
    },
    {
      id: 'alert_004',
      type: 'MACRO',
      priority: 3,
      icon: '📋',
      zone_name: 'Region-wide',
      message_html:
        "<b>Flash stats</b>: Regional water supply stability <span style='color:#F8FAFC;font-weight:bold'>91.5%</span> this quarter; 24 pastoral support projects implemented.",
      timestamp: '2026-03-19T06:00:00Z'
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
  module: '2.2.1_irrigation_expansion_integrity',
  title: 'Oromia monthly irrigation expansion vs. integrity',
  x_axis: ['2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'],
  series: [
    {
      name: 'Irrigated land expansion (k ha)',
      type: 'bar',
      color_gradient: ['#0EA5E9', '#0284C7'],
      y_axis_index: 0,
      data: [0.95, 1.02, 1.08, 1.05, 1.12, 1.18, 1.15, 1.22, 1.2, 1.18, 1.22, 1.28]
    },
    {
      name: 'Infrastructure integrity (%)',
      type: 'line',
      color: '#10B981',
      symbol: 'circle',
      y_axis_index: 1,
      data: [82, 83.5, 84.2, 85, 86, 87, 87.5, 88, 88.2, 88.5, 88.8, 88.2]
    }
  ]
};

const buildInputTypeOption = () => ({
  tooltip: { trigger: 'axis' },
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
      name: 'kha',
      nameTextStyle: { color: '#9cc7ff', fontSize: 10 },
      axisLabel: { color: '#9cc7ff', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(94, 138, 196, 0.25)' } }
    },
    {
      type: 'value',
      name: '10k tons',
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
          { offset: 0, color: productionComboPayload.series[0].color_gradient[0] },
          { offset: 1, color: productionComboPayload.series[0].color_gradient[1] }
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
      lineStyle: { width: 2.5, color: productionComboPayload.series[1].color },
      itemStyle: { color: productionComboPayload.series[1].color },
      data: productionComboPayload.series[1].data
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

const waterStabilityPayload = {
  module: '2.2.2_water_supply_stability',
  title: 'Agricultural water supply stability trend',
  target_line: 90,
  x_axis: ['2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'],
  data: [86, 86.8, 87.2, 87.8, 88.5, 89, 89.2, 89.8, 90.2, 90.5, 91, 91.5],
  alert_thresholds: { warning: 90, critical: 85 }
};

const buildQualityRadarOption = () => ({
  tooltip: {
    trigger: 'axis',
    formatter: (params: any[]) => {
      const p = params?.[0];
      const val = Number(p?.value ?? 0);
      const level =
        val >= waterStabilityPayload.alert_thresholds.warning
          ? 'Healthy'
          : val >= waterStabilityPayload.alert_thresholds.critical
            ? 'Watch'
            : 'Critical';
      return `${p?.axisValue || ''}<br/>Water supply stability: ${val.toFixed(1)}%<br/>Status: ${level}`;
    }
  },
  grid: { left: 44, right: 20, top: 24, bottom: 32 },
  xAxis: {
    type: 'category',
    data: waterStabilityPayload.x_axis,
    axisLabel: { color: '#9cc7ff', fontSize: 10 },
    axisLine: { lineStyle: { color: '#3a6fb1' } }
  },
  yAxis: {
    type: 'value',
    min: 80,
    max: 95,
    interval: 5,
    axisLabel: { color: '#9cc7ff', formatter: (v: number) => `${v}%` },
    splitLine: { lineStyle: { color: 'rgba(94, 138, 196, 0.25)' } }
  },
  series: [
    {
      name: 'Water supply stability',
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      lineStyle: { width: 2.6, color: '#3B82F6' },
      itemStyle: {
        color: (params: any) => {
          const value = Number(params?.value ?? 0);
          if (value >= waterStabilityPayload.alert_thresholds.warning) return '#10B981';
          if (value >= waterStabilityPayload.alert_thresholds.critical) return '#3B82F6';
          return '#F59E0B';
        }
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(59,130,246,0.35)' },
          { offset: 1, color: 'rgba(59,130,246,0.05)' }
        ])
      },
      data: waterStabilityPayload.data
    }
  ],
  markLine: {
    symbol: 'none',
    data: [{ yAxis: waterStabilityPayload.target_line }],
    lineStyle: { color: '#FACC15', type: 'dashed', width: 1.4 },
    label: { formatter: 'Target 90%', color: '#FACC15', backgroundColor: 'rgba(0,0,0,0.3)', padding: [2, 4] }
  }
});

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
  const regionPalette = ['#08b7e8', '#ff2f86', '#8b4cf5', '#5ca0ea', '#39c61d', '#f8f000', '#ff8b30', '#ff4d00', '#a86c3f', '#3fd47a', '#5fc4ff'];
  const metricsByZone = new Map(zoneMapPayload.zones.map((item) => [normalizeZoneName(item.zone_name), item]));
  const mapData = mapRegionNames.value.map((name, index) => ({
    name,
    value: index + 1,
    zoneMetrics: metricsByZone.get(normalizeZoneName(name))?.metrics,
    itemStyle: {
      areaColor: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: adjustHexColor(regionPalette[index % regionPalette.length], 28) },
        { offset: 1, color: adjustHexColor(regionPalette[index % regionPalette.length], -35) }
      ]),
      borderColor: '#ffffff',
      borderWidth: 1.6,
      shadowBlur: 12,
      shadowOffsetY: 5,
      shadowColor: 'rgba(10, 20, 35, 0.35)'
    }
  }));

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove|click',
      formatter: (p: any) => {
        const metrics = p?.data?.zoneMetrics;
        if (!metrics) return p?.name || 'Ethiopia';
        return [
          `<b>${p.name}</b>`,
          `Irrigation coverage: ${Number(metrics.irrigation_coverage_pct).toFixed(1)}%`,
          `Water supply stability: ${Number(metrics.water_supply_stability).toFixed(1)}%`,
          `Crop yield (irrigated): ${Number(metrics.yield_avg).toFixed(1)} quintal/ha`,
          `Livestock productivity index: ${Number(metrics.livestock_productivity).toFixed(1)}`,
          `Pastoral support projects: ${Number(metrics.pastoral_projects).toLocaleString()}`
        ].join('<br/>');
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
        name: 'Ethiopia',
        type: 'map',
        map: ETHIOPIA_MAP_NAME,
        roam: true,
        zoom: 1.0,
        layoutCenter: ['50%', '50%'],
        layoutSize: '93%',
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

const irrigationCoveragePayload = {
  module: '2.4.1_zone_irrigation_coverage',
  target_pct: 75,
  data: [
    { zone: 'Borena', coverage_pct: 12.4 },
    { zone: 'Bale', coverage_pct: 22.8 },
    { zone: 'West Welega', coverage_pct: 28.6 },
    { zone: 'East Hararghe', coverage_pct: 35.2 },
    { zone: 'Jimma', coverage_pct: 38.2 },
    { zone: 'East Shewa', coverage_pct: 42.5 },
    { zone: 'Arsi', coverage_pct: 45.6 }
  ]
};

const buildCoverageTrendOption = () => {
  const zones = irrigationCoveragePayload.data.map((item) => item.zone);
  const values = irrigationCoveragePayload.data.map((item) => item.coverage_pct);
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any[]) => {
        const p = params?.[0];
        return `${p?.axisValue || ''}<br/>Coverage: ${Number(p?.value ?? 0).toFixed(1)}%`;
      }
    },
    grid: { left: 86, right: 24, top: 24, bottom: 24 },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: { color: '#9cc7ff', formatter: (v: number) => `${v}%` },
      splitLine: { lineStyle: { color: 'rgba(94, 138, 196, 0.2)' } }
    },
    yAxis: {
      type: 'category',
      data: zones,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#cfe6ff', fontSize: 10 }
    },
    series: [
      {
        name: 'Irrigation coverage',
        type: 'bar',
        barWidth: 10,
        data: values,
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
          color: (params: any) => {
            const v = Number(params?.value ?? 0);
            if (v >= 75) return '#10B981';
            if (v >= 60) return '#3B82F6';
            return '#F59E0B';
          }
        },
        label: {
          show: true,
          position: 'right',
          color: '#f8fafc',
          formatter: (p: any) => `${Number(p?.value ?? 0).toFixed(1)}%`
        },
        markLine: {
          symbol: 'none',
          data: [{ xAxis: irrigationCoveragePayload.target_pct }],
          lineStyle: { color: '#ffffff', type: 'dashed', width: 1.2 },
          label: { show: true, formatter: 'Target 75%', color: '#ffffff' }
        }
      }
    ]
  };
};

const pastoralLivelihoodPayload = {
  module: '2.4.2_pastoral_livelihood',
  data: [
    { zone: 'East Shewa', projects: 5, livestock_index: 108.5 },
    { zone: 'Jimma', projects: 4, livestock_index: 102.3 },
    { zone: 'Borena', projects: 4, livestock_index: 112.5 },
    { zone: 'West Welega', projects: 3, livestock_index: 98.2 },
    { zone: 'East Hararghe', projects: 3, livestock_index: 95.6 },
    { zone: 'Arsi', projects: 3, livestock_index: 104.2 },
    { zone: 'Bale', projects: 2, livestock_index: 99.2 }
  ]
};

const vulnerabilityPyramidPayload = {
  module: '2.4.2_pastoral_livelihood',
  title: 'Pastoral Livelihood Indicators by Zone',
  data: pastoralLivelihoodPayload.data
};

const buildDeliveryGaugeOption = () => {
  const rows = [...vulnerabilityPyramidPayload.data].sort((a, b) => a.livestock_index - b.livestock_index);
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any[]) => {
        const idx = Number(params?.[0]?.dataIndex ?? 0);
        const row = rows[idx];
        return `${row.zone}<br/>Livestock productivity index: ${row.livestock_index}<br/>Pastoral projects: ${row.projects}`;
      }
    },
    grid: { left: 90, right: 24, top: 24, bottom: 24 },
    xAxis: {
      type: 'value',
      min: 0,
      max: 130,
      axisLabel: { color: '#9cc7ff' },
      splitLine: { lineStyle: { color: 'rgba(94, 138, 196, 0.2)' } }
    },
    yAxis: {
      type: 'category',
      data: rows.map((r) => r.zone),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#cfe6ff', fontSize: 10 }
    },
    series: [
      {
        name: 'Livestock productivity index',
        type: 'bar',
        barWidth: 10,
        data: rows.map((r) => ({ value: r.livestock_index, projects: r.projects })),
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
            { offset: 0, color: '#8B5CF6' },
            { offset: 1, color: '#3B82F6' }
          ])
        },
        label: {
          show: true,
          position: 'right',
          color: '#f8fafc',
          formatter: (p: any) => `${Number(p?.value ?? 0).toFixed(1)} | P:${p?.data?.projects ?? '-'}`
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
  module: '2.5.1_irrigation_yield',
  x_axis: { label: 'Irrigation coverage (%)', min: 0, max: 50 },
  y_axis: { label: 'Crop yield (quintal/ha)', min: 0, max: 50 },
  quadrants: [
    { id: 'Q1', label: 'High irrigation, high yield' },
    { id: 'Q2', label: 'Low irrigation, high yield' },
    { id: 'Q3', label: 'Low irrigation, low yield' },
    { id: 'Q4', label: 'High irrigation, low yield' }
  ],
  points: [
    { zone_name: 'East Shewa', cluster_color: '#10B981', x: 42.5, y: 42.1, tooltip: 'East Shewa: irrigation 42.5%, yield 42.1 q/ha' },
    { zone_name: 'Arsi', cluster_color: '#10B981', x: 45.6, y: 40.2, tooltip: 'Arsi: irrigation 45.6%, yield 40.2 q/ha' },
    { zone_name: 'Jimma', cluster_color: '#3B82F6', x: 38.2, y: 38.5, tooltip: 'Jimma: irrigation 38.2%, yield 38.5 q/ha' },
    { zone_name: 'East Hararghe', cluster_color: '#F59E0B', x: 35.2, y: 32.5, tooltip: 'East Hararghe: irrigation 35.2%, yield 32.5 q/ha' },
    { zone_name: 'West Welega', cluster_color: '#F59E0B', x: 28.6, y: 30.2, tooltip: 'West Welega: irrigation 28.6%, yield 30.2 q/ha' },
    { zone_name: 'Bale', cluster_color: '#F97316', x: 22.8, y: 25.8, tooltip: 'Bale: irrigation 22.8%, yield 25.8 q/ha' },
    { zone_name: 'Borena', cluster_color: '#EF4444', x: 12.4, y: 18.0, tooltip: 'Borena: irrigation 12.4%, yield 18.0 q/ha' }
  ]
};

const buildBottomTrendOption = () => {
  const xMid = (scatterAnalysisPayload.x_axis.min + scatterAnalysisPayload.x_axis.max) / 2;
  const yMid = (scatterAnalysisPayload.y_axis.min + scatterAnalysisPayload.y_axis.max) / 2;
  const points = scatterAnalysisPayload.points.map((item) => ({
    value: [item.x, item.y],
    zone_name: item.zone_name,
    tooltip: item.tooltip,
    itemStyle: {
      color: item.cluster_color,
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
    const res = await fetch(ETHIOPIA_MAP_URL);
    if (!res.ok) throw new Error(`Failed to load map json: ${res.status}`);
    const rawGeoJson = await res.json();
    const sourceFeatures = Array.isArray(rawGeoJson?.features) ? rawGeoJson.features : [];
    const oromiaFeatures = sourceFeatures.filter((feature: any) => {
      const props = feature?.properties || {};
      const name = props.shapeName || props.name || props.NAME_2 || props.NAME_1 || props.ADM2_EN || props.admin2Name;
      return OROMIA_ZONE_NAMES.has(name);
    });

    if (!oromiaFeatures.length) {
      throw new Error('No Oromia zone features found in ADM2 geojson');
    }

    const filteredGeoJson = {
      ...rawGeoJson,
      features: oromiaFeatures
    };

    mapRegionNames.value = filteredGeoJson.features.map((feature: any, index: number) => {
      const props = feature?.properties || {};
      const name = props.shapeName || props.name || props.NAME_2 || props.NAME_1 || props.ADM2_EN || props.admin2Name || `Zone-${index + 1}`;
      feature.properties = { ...props, name };
      return name;
    });
    echarts.registerMap(ETHIOPIA_MAP_NAME, filteredGeoJson);
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
  grid-template-columns: repeat(6, minmax(0, 1fr));
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
.top-overview > p {
  margin: 0 0 10px;
  text-align: center;
  color: #95c3ff;
  font-size: 12px;
  letter-spacing: 1.6px;
  text-transform: uppercase;
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
    grid-template-columns: repeat(6, minmax(0, 1fr));
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
