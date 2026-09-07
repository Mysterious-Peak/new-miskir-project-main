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

    <div class="screen-header">
      <div class="header-glow"></div>
      <h1>Oromia Agricultural Input Administration</h1>
      <p class="screen-header__focus">Focus: Land administration &amp; land-use planning</p>
    </div>

    <div class="kpi-row">
      <div v-for="item in kpiCards" :key="item.id" class="kpi-card">
        <div class="kpi-value">
          {{ formatKpiValue(item) }}
          <span class="kpi-unit">{{ item.unit }}</span>
        </div>
        <div class="kpi-label">{{ item.label }}</div>
      </div>
    </div>

    <div class="screen-body">
      <div class="screen-top">
        <div class="side-panel">
          <div class="panel-card">
            <div class="card-title">Title registration vs. land allocation trend</div>
            <div ref="inputTypeChartRef" class="chart-box"></div>
          </div>
          <div class="panel-card">
            <div class="card-title">Digital title registration coverage trend</div>
            <div ref="qualityRadarChartRef" class="chart-box"></div>
          </div>
        </div>

        <div class="center-panel">
          <div class="panel-card map-card">
            <div class="card-title">Land use planning map</div>
            <div ref="mapChartRef" class="map map-box"></div>
          </div>
        </div>

        <div class="side-panel">
          <div class="panel-card">
            <div class="card-title">Digital title coverage by zone</div>
            <div ref="coverageTrendChartRef" class="chart-box"></div>
          </div>
          <div class="panel-card">
            <div class="card-title">Processing time by service type</div>
            <div ref="deliveryGaugeChartRef" class="chart-box"></div>
          </div>
        </div>
      </div>

      <div class="screen-bottom">
        <div class="panel-card bottom-left-card">
          <div class="card-title">Transfer compliance vs. processing time by zone</div>
          <div ref="bottomTrendChartRef" class="chart-box bottom-chart-box"></div>
        </div>
        <div class="panel-card bottom-right-card">
          <div class="card-title">Operations feed &amp; alerts</div>
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
  module: 'kpi_land',
  data: [
    {
      id: 'kpi_land_1',
      label: 'Plots with completed title registration',
      value: 398600,
      unit: 'parcels',
      trend: 7200,
      trend_direction: 'up',
      status_color: '#10B981',
      sparkline_data: [362000, 375000, 386500, 398600],
      icon: 'map'
    },
    {
      id: 'kpi_land_2',
      label: 'Land area allocated for development',
      value: 11240,
      unit: 'ha',
      trend: 380,
      trend_direction: 'up',
      status_color: '#8B5CF6',
      sparkline_data: [9880, 10200, 10860, 11240],
      icon: 'construction'
    },
    {
      id: 'kpi_land_3',
      label: 'Digital title registration coverage',
      value: 81.6,
      unit: '%',
      trend: 2.8,
      trend_direction: 'up',
      status_color: '#10B981',
      sparkline_data: [72.4, 75.8, 78.9, 81.6],
      icon: 'cloud_done'
    },
    {
      id: 'kpi_land_4',
      label: 'Land transfer compliance rate',
      value: 94.2,
      unit: '%',
      trend: 1.1,
      trend_direction: 'up',
      status_color: '#3B82F6',
      sparkline_data: [90.5, 91.8, 93.1, 94.2],
      icon: 'gavel'
    },
    {
      id: 'kpi_land_5',
      label: 'Avg. processing time (land services)',
      value: 7.2,
      unit: 'days',
      trend: -0.5,
      trend_direction: 'down',
      status_color: '#10B981',
      sparkline_data: [8.4, 8.1, 7.7, 7.2],
      icon: 'schedule'
    }
  ]
};

const kpiCards = kpiCardPayload.data;

type KpiCardItem = (typeof kpiCardPayload.data)[number];

const formatKpiValue = (item: KpiCardItem) => {
  const v = Number(item.value);
  if (item.unit === 'parcels' || item.unit === 'ha') return v.toLocaleString('en-US');
  if (item.unit === '%') return v.toFixed(1);
  if (item.unit === 'days') return v.toFixed(1);
  return String(item.value);
};

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
      metrics: {
        digital_coverage_pct: 88.2,
        planning_area_kha: 124.6,
        transfer_compliance_pct: 96.1,
        avg_process_days: 6.2,
        dominant_land_use: 'Agriculture / urban-rural mix'
      }
    },
    {
      zone_id: 'JIMMA',
      zone_name: 'Jimma',
      center: [36.83, 7.67],
      metrics: {
        digital_coverage_pct: 84.5,
        planning_area_kha: 96.3,
        transfer_compliance_pct: 94.8,
        avg_process_days: 6.9,
        dominant_land_use: 'Agroforestry & crops'
      }
    },
    {
      zone_id: 'WEST_WELEGA',
      zone_name: 'West Welega',
      center: [36.55, 9.08],
      metrics: {
        digital_coverage_pct: 76.8,
        planning_area_kha: 71.2,
        transfer_compliance_pct: 91.4,
        avg_process_days: 8.1,
        dominant_land_use: 'Pasture–cropland mosaic; cropland protection'
      }
    },
    {
      zone_id: 'EAST_HARARGE',
      zone_name: 'East Hararghe',
      center: [40.87, 9.08],
      metrics: {
        digital_coverage_pct: 72.1,
        planning_area_kha: 58.4,
        transfer_compliance_pct: 89.2,
        avg_process_days: 8.9,
        dominant_land_use: 'Irrigated agriculture belt'
      }
    },
    {
      zone_id: 'BORENA',
      zone_name: 'Borena',
      center: [39.58, 5.33],
      metrics: {
        digital_coverage_pct: 64.3,
        planning_area_kha: 42.7,
        transfer_compliance_pct: 86.5,
        avg_process_days: 10.4,
        dominant_land_use: 'Pastoral & ecological conservation'
      }
    },
    {
      zone_id: 'BALE',
      zone_name: 'Bale',
      center: [39.95, 6.85],
      metrics: {
        digital_coverage_pct: 69.5,
        planning_area_kha: 88.1,
        transfer_compliance_pct: 88.0,
        avg_process_days: 9.2,
        dominant_land_use: 'Highland farming & forest'
      }
    },
    {
      zone_id: 'ARSI',
      zone_name: 'Arsi',
      center: [38.75, 7.1],
      metrics: {
        digital_coverage_pct: 79.4,
        planning_area_kha: 102.5,
        transfer_compliance_pct: 93.2,
        avg_process_days: 7.4,
        dominant_land_use: 'Commercial farming zone'
      }
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
        "<b>Borena</b>: <span style='color:#EF4444;font-weight:bold'>3</span> suspected unauthorized construction cases flagged—routed to enforcement for on-site verification.",
      timestamp: '2026-03-19T09:15:00Z'
    },
    {
      id: 'alert_002',
      type: 'SUCCESS',
      priority: 3,
      icon: '✅',
      zone_name: 'East Shewa',
      message_html:
        "<b>East Shewa</b>: First-pass completion for title registration hit <span style='color:#10B981;font-weight:bold'>92%</span> this month—digital filing leads the region.",
      timestamp: '2026-03-19T08:30:00Z'
    },
    {
      id: 'alert_003',
      type: 'ANOMALY',
      priority: 2,
      icon: '⚠️',
      zone_name: 'Jimma',
      message_html:
        '<b>Jimma</b>: Avg. processing time for land-use change cases rose <span style="color:#F97316;font-weight:bold">1.3</span> business days MoM—check front-desk backlog.',
      timestamp: '2026-03-19T07:45:00Z'
    },
    {
      id: 'alert_004',
      type: 'MACRO',
      priority: 3,
      icon: '📋',
      zone_name: 'Region-wide',
      message_html:
        "<b>Flash stats</b>: Spot-check compliance for land transfers this quarter <span style='color:#F8FAFC;font-weight:bold'>94.2%</span>, up 1.1 pp vs last quarter.",
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
  module: '2.2.1_registration_vs_allocation',
  title: 'Oromia monthly title registration vs. allocation',
  x_axis: ['2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'],
  series: [
    {
      name: 'Title registrations (k parcels)',
      type: 'bar',
      color_gradient: ['#10B981', '#059669'],
      y_axis_index: 0,
      data: [32, 34, 35, 33, 36, 38, 39, 40, 38, 37, 38, 41]
    },
    {
      name: 'Allocated land (k ha)',
      type: 'line',
      color: '#8B5CF6',
      symbol: 'circle',
      y_axis_index: 1,
      data: [0.9, 1.1, 1.0, 0.8, 1.2, 1.3, 1.4, 1.2, 1.0, 0.9, 1.1, 1.2]
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
      name: 'k parcels',
      nameTextStyle: { color: '#9cc7ff', fontSize: 10 },
      axisLabel: { color: '#9cc7ff', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(94, 138, 196, 0.25)' } }
    },
    {
      type: 'value',
      name: 'k ha',
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

const digitalCoverageTrendPayload = {
  module: '2.2.2_digital_coverage_trend',
  title: 'Digital cadastre coverage trend',
  target_line: 85,
  /** Demo: 12-month smooth ramp; last point aligns with KPI 81.6% */
  x_axis: ['2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'],
  data: [72.4, 73.05, 73.8, 74.35, 75.5, 76.2, 77.15, 78.0, 78.85, 79.6, 80.55, 81.6],
  alert_thresholds: { warning: 80, critical: 75 }
};

const getCoveragePointColor = (value: number) => {
  if (value < digitalCoverageTrendPayload.alert_thresholds.critical) return '#EF4444';
  if (value < digitalCoverageTrendPayload.alert_thresholds.warning) return '#F97316';
  return '#38BDF8';
};

const buildQualityRadarOption = () => {
  const seriesData = digitalCoverageTrendPayload.data;
  const lastIdx = seriesData.length - 1;

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(8, 20, 48, 0.92)',
      borderColor: 'rgba(56, 189, 248, 0.45)',
      borderWidth: 1,
      textStyle: { color: '#e2e8f0', fontSize: 12 },
      formatter: (items: any[]) => {
        const pt = items?.[0];
        if (!pt) return '';
        const idx = Number(pt.dataIndex);
        const raw = pt.data;
        const val = Number(typeof raw === 'object' && raw != null && 'value' in raw ? (raw as { value: number }).value : pt.value);
        const prev = idx > 0 ? seriesData[idx - 1] : null;
        const mom = prev != null ? val - prev : 0;
        const momStr = prev == null ? '' : `MoM ${mom >= 0 ? '+' : ''}${mom.toFixed(2)}%`;
        const bar = idx === lastIdx ? '<span style="color:#22d3ee">● Latest month</span>' : '';
        const month = String(pt.axisValue ?? pt.name ?? '');
        return `${month}<br/>Coverage <b style="color:#7dd3fc">${val.toFixed(2)}%</b>${momStr ? `<br/>${momStr}` : ''}${bar ? `<br/>${bar}` : ''}`;
      }
    },
    grid: { left: 44, right: 16, top: 36, bottom: 28 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: digitalCoverageTrendPayload.x_axis,
      axisLabel: {
        color: '#9cc7ff',
        fontSize: 9,
        rotate: 20,
        formatter: (v: string) => {
          const m = /^(\d{4})-(\d{2})$/.exec(v);
          return m ? `${m[1].slice(2)}/${m[2]}` : v;
        }
      },
      axisLine: { lineStyle: { color: '#3a6fb1' } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      min: 70,
      max: 90,
      interval: 5,
      scale: false,
      axisLabel: {
        color: '#9cc7ff',
        formatter: '{value}%'
      },
      splitLine: { lineStyle: { color: 'rgba(94, 138, 196, 0.2)' } },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['rgba(56, 189, 248, 0.04)', 'rgba(15, 23, 42, 0.02)']
        }
      }
    },
    series: [
      {
        name: digitalCoverageTrendPayload.title,
        type: 'line',
        smooth: 0.45,
        data: seriesData.map((value, idx) => {
          const isLast = idx === lastIdx;
          return {
            value,
            symbolSize: isLast ? 12 : 6,
            itemStyle: {
              color: getCoveragePointColor(value),
              borderColor: '#ffffff',
              borderWidth: isLast ? 2 : 1,
              shadowBlur: isLast ? 14 : 0,
              shadowColor: 'rgba(34, 211, 238, 0.55)'
            }
          };
        }),
        lineStyle: {
          width: 3,
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#22d3ee' },
            { offset: 0.55, color: '#38BDF8' },
            { offset: 1, color: '#818CF8' }
          ]),
          shadowBlur: 10,
          shadowColor: 'rgba(56, 189, 248, 0.35)',
          shadowOffsetY: 2
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(34, 211, 238, 0.42)' },
            { offset: 0.45, color: 'rgba(56, 189, 248, 0.12)' },
            { offset: 1, color: 'rgba(15, 23, 42, 0)' }
          ])
        },
        markLine: {
          symbol: 'none',
          label: {
            show: true,
            position: 'insideStartTop',
            distance: 6,
            formatter: `Target ${digitalCoverageTrendPayload.target_line}%`,
            color: '#FDE68A',
            fontSize: 10,
            backgroundColor: 'rgba(0,0,0,0.45)',
            padding: [3, 8],
            borderRadius: 4
          },
          lineStyle: {
            color: 'rgba(253, 224, 106, 0.85)',
            type: 'dashed',
            width: 1.5
          },
          data: [{ yAxis: digitalCoverageTrendPayload.target_line }]
        }
      }
    ]
  };
};

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
        if (!metrics) return `<b>${p?.name || 'Oromia'}</b><br/>(Demo: no detailed metrics for this zone)`;
        const m = metrics as {
          digital_coverage_pct: number;
          planning_area_kha: number;
          transfer_compliance_pct: number;
          avg_process_days: number;
          dominant_land_use: string;
        };
        return [
          `<b>${p.name}</b>`,
          `Dominant land use: ${m.dominant_land_use}`,
          `Digital title coverage: ${Number(m.digital_coverage_pct).toFixed(1)}%`,
          `Planning area under control: ${Number(m.planning_area_kha).toFixed(1)} k ha`,
          `Transfer compliance: ${Number(m.transfer_compliance_pct).toFixed(1)}%`,
          `Avg. processing time: ${Number(m.avg_process_days).toFixed(1)} days`
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
        name: 'Oromia',
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

/** Demo: digital title coverage by zone, ascending for bar readability */
const zoneDigitalCoverageBarPayload = {
  module: '2.4.1_zone_digital_coverage',
  target_pct: 80,
  data: [
    { zone: 'Borena', coverage_pct: 64.3 },
    { zone: 'Bale', coverage_pct: 69.5 },
    { zone: 'East Harerge', coverage_pct: 72.1 },
    { zone: 'West Welega', coverage_pct: 76.8 },
    { zone: 'Arsi', coverage_pct: 79.4 },
    { zone: 'West Arsi', coverage_pct: 81.2 },
    { zone: 'Jimma', coverage_pct: 84.5 },
    { zone: 'East Shewa', coverage_pct: 88.2 }
  ]
};

const buildCoverageTrendOption = () => {
  const zones = zoneDigitalCoverageBarPayload.data.map((row) => row.zone);
  const values = zoneDigitalCoverageBarPayload.data.map((row) => row.coverage_pct);

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any[]) => {
        const idx = Number(params?.[0]?.dataIndex ?? 0);
        const row = zoneDigitalCoverageBarPayload.data[idx];
        if (!row) return '';
        return `${row.zone}<br/>Digital title coverage: <b>${row.coverage_pct}%</b>`;
      }
    },
    grid: { left: 100, right: 36, top: 20, bottom: 28 },
    xAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        color: '#9cc7ff',
        formatter: '{value}%'
      },
      splitLine: { lineStyle: { color: 'rgba(94, 138, 196, 0.2)' } }
    },
    yAxis: {
      type: 'category',
      data: zones,
      axisLine: { lineStyle: { color: '#3a6fb1' } },
      axisLabel: { color: '#cfe6ff', fontSize: 10 }
    },
    series: [
      {
        name: 'Digital title coverage',
        type: 'bar',
        data: values,
        barWidth: 10,
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
          color: (params: any) => {
            const v = Number(params.value);
            if (v >= zoneDigitalCoverageBarPayload.target_pct) return '#10B981';
            if (v >= 72) return '#3B82F6';
            return '#F97316';
          }
        },
        label: {
          show: true,
          position: 'right',
          color: '#e2e8f0',
          fontSize: 10,
          formatter: (params: any) => `${params.value}%`
        },
        markLine: {
          silent: true,
          symbol: 'none',
          label: {
            show: true,
            formatter: `Target ${zoneDigitalCoverageBarPayload.target_pct}%`,
            color: '#FBBF24',
            fontSize: 10
          },
          lineStyle: { color: '#FBBF24', type: 'dashed', width: 1.2 },
          data: [{ xAxis: zoneDigitalCoverageBarPayload.target_pct }]
        }
      }
    ]
  };
};

/** Demo: avg. processing time by service (business days) */
const landBusinessProcessPayload = {
  module: '2.4.2_land_business_process',
  regional_avg_days: 7.2,
  data: [
    { biz: 'Title registration', avg_days: 5.2 },
    { biz: 'Land-use change', avg_days: 8.1 },
    { biz: 'Mortgage registration', avg_days: 6.4 },
    { biz: 'Transfer transaction', avg_days: 9.2 },
    { biz: 'Objection mediation', avg_days: 12.5 }
  ]
};

const buildDeliveryGaugeOption = () => {
  const categories = landBusinessProcessPayload.data.map((row) => row.biz);
  const values = landBusinessProcessPayload.data.map((row) => row.avg_days);
  const avg = landBusinessProcessPayload.regional_avg_days;

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any[]) => {
        const row = landBusinessProcessPayload.data[Number(params?.[0]?.dataIndex ?? 0)];
        if (!row) return '';
        return `${row.biz}<br/>Avg. processing: <b>${row.avg_days}</b> business days`;
      }
    },
    grid: { left: 118, right: 40, top: 18, bottom: 22 },
    xAxis: {
      type: 'value',
      min: 0,
      max: 16,
      axisLabel: { color: '#9cc7ff', formatter: '{value} d' },
      splitLine: { lineStyle: { color: 'rgba(94, 138, 196, 0.2)' } }
    },
    yAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: '#3a6fb1' } },
      axisLabel: {
        color: '#cfe6ff',
        fontSize: 8,
        lineHeight: 12,
        align: 'right',
        margin: 6
      }
    },
    series: [
      {
        name: 'Avg. processing time',
        type: 'bar',
        data: values,
        barWidth: 10,
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
          color: (params: any) => {
            const d = Number(params.value);
            if (d <= avg) return '#10B981';
            if (d <= avg + 2) return '#3B82F6';
            return '#F97316';
          }
        },
        label: {
          show: true,
          position: 'right',
          color: '#e2e8f0',
          fontSize: 9,
          formatter: (params: any) => `${params.value} d`
        },
        markLine: {
          silent: true,
          symbol: 'none',
          label: {
            show: true,
            formatter: `Regional avg. ${avg} d`,
            color: '#FBBF24',
            fontSize: 9
          },
          lineStyle: { color: '#FBBF24', type: 'dashed', width: 1.2 },
          data: [{ xAxis: avg }]
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

/** Demo: transfer compliance vs. avg. processing time by zone */
const complianceScatterPayload = {
  module: '2.5.1_compliance_efficiency',
  x_axis: { label: 'Transfer compliance (%)', min: 82, max: 99 },
  y_axis: { label: 'Avg. processing time (business days)', min: 5, max: 12 },
  quadrants: [
    { id: 'Q1', label: 'High compliance, slower' },
    { id: 'Q2', label: 'Compliance pressure' },
    { id: 'Q3', label: 'Dual risk watch' },
    { id: 'Q4', label: 'Efficient & compliant' }
  ],
  points: [
    {
      zone_name: 'East Shewa',
      cluster_color: '#10B981',
      x: 96.1,
      y: 6.2,
      tooltip: 'East Shewa: compliance 96.1%, avg. processing 6.2 d'
    },
    {
      zone_name: 'Jimma',
      cluster_color: '#3B82F6',
      x: 94.8,
      y: 6.9,
      tooltip: 'Jimma: compliance 94.8%, avg. processing 6.9 d'
    },
    {
      zone_name: 'West Welega',
      cluster_color: '#3B82F6',
      x: 91.4,
      y: 8.1,
      tooltip: 'West Welega: compliance 91.4%, avg. processing 8.1 d'
    },
    {
      zone_name: 'East Hararghe',
      cluster_color: '#F59E0B',
      x: 89.2,
      y: 8.9,
      tooltip: 'East Hararghe: compliance 89.2%, avg. processing 8.9 d'
    },
    {
      zone_name: 'Borena',
      cluster_color: '#EF4444',
      x: 86.5,
      y: 10.4,
      tooltip: 'Borena: compliance 86.5%, avg. processing 10.4 d'
    },
    {
      zone_name: 'Bale',
      cluster_color: '#F97316',
      x: 88.0,
      y: 9.2,
      tooltip: 'Bale: compliance 88.0%, avg. processing 9.2 d'
    },
    {
      zone_name: 'Arsi',
      cluster_color: '#10B981',
      x: 93.2,
      y: 7.4,
      tooltip: 'Arsi: compliance 93.2%, avg. processing 7.4 d'
    },
    {
      zone_name: 'West Arsi',
      cluster_color: '#8B5CF6',
      x: 92.6,
      y: 7.8,
      tooltip: 'West Arsi: compliance 92.6%, avg. processing 7.8 d'
    },
    {
      zone_name: 'North Shewa',
      cluster_color: '#3B82F6',
      x: 90.1,
      y: 8.4,
      tooltip: 'North Shewa: compliance 90.1%, avg. processing 8.4 d'
    }
  ]
};

const buildBottomTrendOption = () => {
  const xMid = (complianceScatterPayload.x_axis.min + complianceScatterPayload.x_axis.max) / 2;
  const yMid = (complianceScatterPayload.y_axis.min + complianceScatterPayload.y_axis.max) / 2;
  const points = complianceScatterPayload.points.map((item) => ({
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
        return data?.tooltip || `${data?.zone_name || ''}<br/>Compliance: ${params.value?.[0]}%<br/>Processing: ${params.value?.[1]} d`;
      }
    },
    grid: { left: 82, right: 24, top: 34, bottom: 38 },
    xAxis: {
      type: 'value',
      min: complianceScatterPayload.x_axis.min,
      max: complianceScatterPayload.x_axis.max,
      name: complianceScatterPayload.x_axis.label,
      nameLocation: 'middle',
      nameGap: 28,
      nameTextStyle: { color: '#9cc7ff', fontSize: 11 },
      axisLabel: { color: '#9cc7ff' },
      axisLine: { lineStyle: { color: '#3a6fb1' } },
      splitLine: { lineStyle: { color: 'rgba(94, 138, 196, 0.22)' } }
    },
    yAxis: {
      type: 'value',
      min: complianceScatterPayload.y_axis.min,
      max: complianceScatterPayload.y_axis.max,
      name: complianceScatterPayload.y_axis.label,
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
        style: { text: complianceScatterPayload.quadrants[0].label, fill: 'rgba(255,255,255,0.68)', fontSize: 12, fontWeight: 600 }
      },
      {
        type: 'text',
        left: '14%',
        top: '16%',
        style: { text: complianceScatterPayload.quadrants[1].label, fill: 'rgba(255,255,255,0.62)', fontSize: 12 }
      },
      {
        type: 'text',
        left: '14%',
        top: '76%',
        style: { text: complianceScatterPayload.quadrants[2].label, fill: 'rgba(255,255,255,0.62)', fontSize: 12 }
      },
      {
        type: 'text',
        left: '70%',
        top: '76%',
        style: { text: complianceScatterPayload.quadrants[3].label, fill: 'rgba(255,255,255,0.62)', fontSize: 12 }
      }
    ],
    series: [
      {
        name: 'Zones',
        type: 'scatter',
        symbol: 'circle',
        symbolSize: 10,
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
  border: 1px solid rgba(68, 129, 246, 0.45);
  border-radius: 12px;
  text-align: center;
  overflow: hidden;
  background: linear-gradient(90deg, rgba(9, 28, 73, 0.65), rgba(13, 45, 106, 0.65), rgba(9, 28, 73, 0.65));
}

.header-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.16), transparent);
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
  letter-spacing: 0.5px;
}

.screen-header__focus {
  letter-spacing: 0.8px;
  font-size: 15px;
  color: #b8d4ff;
  margin: 0 0 4px;
}

.screen-header__hint {
  letter-spacing: 1px;
  font-size: 11px;
  color: #7aa8e6;
  opacity: 0.92;
  margin: 0 0 10px;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
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
  font-size: 11px;
  color: #c7e2ff;
  line-height: 1.35;
  white-space: normal;
  min-height: 2.6em;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
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
  grid-template-columns: 23% 54% 23%;
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
    grid-template-columns: repeat(3, minmax(140px, 1fr));
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
