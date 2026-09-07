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
      <h1>Oromia Bureau of Investment & Industry</h1>
      <p class="screen-header__focus">Focus: Agricultural investment & industry development</p>
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
            <div class="card-title">Investment scale trend</div>
            <div ref="inputTypeChartRef" class="chart-box"></div>
          </div>
          <div class="panel-card">
            <div class="card-title">Agro-processing industry growth by sector</div>
            <div ref="qualityRadarChartRef" class="chart-box"></div>
          </div>
        </div>

        <div class="center-panel">
          <div class="panel-card map-card">
            <div class="card-title">Agricultural investment & industry distribution map</div>
            <div ref="mapChartRef" class="map map-box"></div>
          </div>
        </div>

        <div class="side-panel">
          <div class="panel-card">
            <div class="card-title">Investment completion rate by zone</div>
            <div ref="coverageTrendChartRef" class="chart-box"></div>
          </div>
          <div class="panel-card">
            <div class="card-title">Job creation by zone</div>
            <div ref="deliveryGaugeChartRef" class="chart-box"></div>
          </div>
        </div>
      </div>

      <div class="screen-bottom">
        <div class="panel-card bottom-left-card">
          <div class="card-title">Investment vs. employment correlation</div>
          <div ref="bottomTrendChartRef" class="chart-box bottom-chart-box"></div>
        </div>
        <div class="panel-card bottom-right-card">
          <div class="card-title">Investment feed & alerts</div>
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
  module: 'kpi_investment',
  data: [
    {
      id: 'kpi_1',
      label: 'Agricultural investment opportunities identified',
      value: 186,
      unit: 'no.',
      trend: 24,
      trend_direction: 'up',
      status_color: '#10B981',
      sparkline_data: [142, 156, 168, 186],
      icon: 'search'
    },
    {
      id: 'kpi_2',
      label: 'Investment promotion events held',
      value: 48,
      unit: 'events',
      trend: 6,
      trend_direction: 'up',
      status_color: '#10B981',
      sparkline_data: [38, 42, 45, 48],
      icon: 'campaign'
    },
    {
      id: 'kpi_3',
      label: 'Investment project completion rate',
      value: 78.5,
      unit: '%',
      trend: 3.2,
      trend_direction: 'up',
      status_color: '#10B981',
      sparkline_data: [72, 74, 76.5, 78.5],
      icon: 'check_circle'
    },
    {
      id: 'kpi_4',
      label: 'Agricultural investment return rate',
      value: 12.5,
      unit: '%',
      trend: 0.8,
      trend_direction: 'up',
      status_color: '#10B981',
      sparkline_data: [10.2, 11.0, 11.8, 12.5],
      icon: 'trending_up'
    },
    {
      id: 'kpi_5',
      label: 'New agro-processing enterprises',
      value: 32,
      unit: 'firms',
      trend: 5,
      trend_direction: 'up',
      status_color: '#10B981',
      sparkline_data: [24, 27, 29, 32],
      icon: 'business'
    },
    {
      id: 'kpi_6',
      label: 'Agro-processing industry index',
      value: 112.8,
      unit: 'pts',
      trend: 4.2,
      trend_direction: 'up',
      status_color: '#10B981',
      sparkline_data: [98, 102, 108, 112.8],
      icon: 'analytics'
    },
    {
      id: 'kpi_7',
      label: 'New jobs in agro-processing',
      value: 2840,
      unit: 'jobs',
      trend: 420,
      trend_direction: 'up',
      status_color: '#10B981',
      sparkline_data: [2100, 2350, 2620, 2840],
      icon: 'people'
    }
  ]
};

const kpiCards = kpiCardPayload.data;

type KpiCardItem = (typeof kpiCardPayload.data)[number];

const formatKpiValue = (item: KpiCardItem) => {
  const v = Number(item.value);
  if (['no.', 'events', 'firms', 'jobs'].includes(item.unit)) return v.toLocaleString('en-US');
  if (item.unit === '%' || item.unit === 'pts') return v.toFixed(1);
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
      metrics: { investment_mn_usd: 42.5, projects_count: 28, completed_rate: 85.2, new_enterprises: 12, new_jobs: 680 }
    },
    {
      zone_id: 'JIMMA',
      zone_name: 'Jimma',
      center: [36.83, 7.67],
      metrics: { investment_mn_usd: 38.2, projects_count: 24, completed_rate: 82.1, new_enterprises: 10, new_jobs: 520 }
    },
    {
      zone_id: 'WEST_WELEGA',
      zone_name: 'West Welega',
      center: [36.55, 9.08],
      metrics: { investment_mn_usd: 22.8, projects_count: 15, completed_rate: 76.5, new_enterprises: 6, new_jobs: 340 }
    },
    {
      zone_id: 'EAST_HARARGE',
      zone_name: 'East Hararghe',
      center: [40.87, 9.08],
      metrics: { investment_mn_usd: 18.6, projects_count: 12, completed_rate: 71.2, new_enterprises: 4, new_jobs: 280 }
    },
    {
      zone_id: 'BORENA',
      zone_name: 'Borena',
      center: [39.58, 5.33],
      metrics: { investment_mn_usd: 8.4, projects_count: 6, completed_rate: 65.0, new_enterprises: 2, new_jobs: 120 }
    },
    {
      zone_id: 'BALE',
      zone_name: 'Bale',
      center: [39.95, 6.85],
      metrics: { investment_mn_usd: 15.2, projects_count: 10, completed_rate: 74.2, new_enterprises: 3, new_jobs: 195 }
    },
    {
      zone_id: 'ARSI',
      zone_name: 'Arsi',
      center: [38.75, 7.1],
      metrics: { investment_mn_usd: 28.6, projects_count: 18, completed_rate: 79.8, new_enterprises: 7, new_jobs: 420 }
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
        "<b>Borena</b>: Investment completion rate <span style='color:#EF4444;font-weight:bold'>65%</span> below regional target—recommend strengthening project oversight and resource allocation.",
      timestamp: '2026-03-19T09:15:00Z'
    },
    {
      id: 'alert_002',
      type: 'SUCCESS',
      priority: 3,
      icon: '✅',
      zone_name: 'East Shewa',
      message_html:
        "<b>East Shewa</b>: <span style='color:#10B981;font-weight:bold'>3</span> new agro-processing projects signed this month, ~280 new jobs expected—consider organizing investment roadshow.",
      timestamp: '2026-03-19T08:30:00Z'
    },
    {
      id: 'alert_003',
      type: 'ANOMALY',
      priority: 2,
      icon: '⚠️',
      zone_name: 'Jimma',
      message_html:
        '<b>Jimma</b>: Edible oil processing project delayed—planned 2 completions in Q1, only 1 achieved; check land use and approval bottlenecks.',
      timestamp: '2026-03-19T07:45:00Z'
    },
    {
      id: 'alert_004',
      type: 'MACRO',
      priority: 3,
      icon: '📈',
      zone_name: 'Region-wide',
      message_html:
        "<b>Flash stats</b>: Agricultural investment completion rate <span style='color:#F8FAFC;font-weight:bold'>78.5%</span> this quarter, up 3.2 pp vs last quarter; 2,840 new jobs created.",
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

const investmentTrendPayload = {
  module: '2.2.1_investment_trend',
  title: 'Oromia monthly investment scale trend',
  x_axis: ['2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'],
  series: [
    {
      name: 'Investment opportunities',
      type: 'bar',
      color_gradient: ['#10B981', '#059669'],
      y_axis_index: 0,
      data: [12, 14, 15, 13, 16, 18, 17, 19, 18, 16, 17, 20]
    },
    {
      name: 'Completed projects',
      type: 'line',
      color: '#FBBF24',
      symbol: 'circle',
      y_axis_index: 1,
      data: [8, 9, 10, 11, 12, 14, 13, 15, 14, 12, 13, 16]
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
    data: investmentTrendPayload.x_axis,
    axisLabel: { color: '#9cc7ff', fontSize: 10 },
    axisLine: { lineStyle: { color: '#3a6fb1' } }
  },
  yAxis: [
    {
      type: 'value',
      name: 'no.',
      nameTextStyle: { color: '#9cc7ff', fontSize: 10 },
      axisLabel: { color: '#9cc7ff', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(94, 138, 196, 0.25)' } }
    },
    {
      type: 'value',
      name: 'proj.',
      nameTextStyle: { color: '#9cc7ff', fontSize: 10 },
      axisLabel: { color: '#9cc7ff', fontSize: 10 },
      splitLine: { show: false }
    }
  ],
  series: [
    {
      name: investmentTrendPayload.series[0].name,
      type: 'bar',
      yAxisIndex: investmentTrendPayload.series[0].y_axis_index,
      barMaxWidth: 16,
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: investmentTrendPayload.series[0].color_gradient[0] },
          { offset: 1, color: investmentTrendPayload.series[0].color_gradient[1] }
        ])
      },
      data: investmentTrendPayload.series[0].data
    },
    {
      name: investmentTrendPayload.series[1].name,
      type: 'line',
      yAxisIndex: investmentTrendPayload.series[1].y_axis_index,
      smooth: true,
      symbol: investmentTrendPayload.series[1].symbol,
      symbolSize: 7,
      lineStyle: { width: 2.5, color: investmentTrendPayload.series[1].color },
      itemStyle: { color: investmentTrendPayload.series[1].color },
      data: investmentTrendPayload.series[1].data
    }
  ]
});

const agroProcessingGrowthPayload = {
  module: '2.2.2_agro_processing_growth',
  x_axis: ['Edible oil', 'Dairy', 'Grain', 'Fruit & veg', 'Meat', 'Feed'],
  data: [18.5, 22.3, 15.2, 28.6, 12.4, 19.8],
  unit: 'firms'
};

const buildQualityRadarOption = () => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: (params: any[]) => {
      const idx = Number(params?.[0]?.dataIndex ?? 0);
      const row = agroProcessingGrowthPayload.data[idx];
      return `${agroProcessingGrowthPayload.x_axis[idx]}<br/>New firms: <b>${row}</b>`;
    }
  },
  grid: { left: 72, right: 24, top: 20, bottom: 24 },
  xAxis: {
    type: 'category',
    data: agroProcessingGrowthPayload.x_axis,
    axisLabel: { color: '#9cc7ff', fontSize: 10, rotate: 18 },
    axisLine: { lineStyle: { color: '#3a6fb1' } }
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: '#9cc7ff', formatter: '{value}' },
    splitLine: { lineStyle: { color: 'rgba(94, 138, 196, 0.2)' } }
  },
  series: [
    {
      name: 'New firms',
      type: 'bar',
      data: agroProcessingGrowthPayload.data,
      barWidth: 14,
      itemStyle: {
        borderRadius: [6, 6, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#10B981' },
          { offset: 1, color: '#059669' }
        ])
      },
      label: { show: true, position: 'top', color: '#e2e8f0', fontSize: 9 }
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
        if (!metrics) return `<b>${p?.name || 'Oromia'}</b><br/>(Demo: no investment data for this zone)`;
        const m = metrics as { investment_mn_usd: number; projects_count: number; completed_rate: number; new_enterprises: number; new_jobs: number };
        return [
          `<b>${p.name}</b>`,
          `Cumulative investment: ${Number(m.investment_mn_usd).toFixed(1)} mn USD`,
          `Projects (pipeline/active): ${m.projects_count}`,
          `Completion rate: ${Number(m.completed_rate).toFixed(1)}%`,
          `New agro-processing firms: ${m.new_enterprises}`,
          `New jobs: ${m.new_jobs}`
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

const zoneCompletionPayload = {
  module: '2.4.1_zone_completion',
  target_pct: 80,
  data: [
    { zone: 'Borena', completed_rate: 65.0 },
    { zone: 'East Hararghe', completed_rate: 71.2 },
    { zone: 'Bale', completed_rate: 74.2 },
    { zone: 'West Welega', completed_rate: 76.5 },
    { zone: 'Arsi', completed_rate: 79.8 },
    { zone: 'Jimma', completed_rate: 82.1 },
    { zone: 'East Shewa', completed_rate: 85.2 }
  ]
};

const buildCoverageTrendOption = () => {
  const zones = zoneCompletionPayload.data.map((r) => r.zone);
  const values = zoneCompletionPayload.data.map((r) => r.completed_rate);

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any[]) => {
        const idx = Number(params?.[0]?.dataIndex ?? 0);
        const row = zoneCompletionPayload.data[idx];
        if (!row) return '';
        return `${row.zone}<br/>Completion rate: <b>${row.completed_rate}%</b>`;
      }
    },
    grid: { left: 100, right: 36, top: 20, bottom: 28 },
    xAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { color: '#9cc7ff', formatter: '{value}%' },
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
        name: 'Completion rate',
        type: 'bar',
        data: values,
        barWidth: 10,
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
          color: (params: any) => {
            const v = Number(params.value);
            if (v >= zoneCompletionPayload.target_pct) return '#10B981';
            if (v >= 72) return '#3B82F6';
            return '#F97316';
          }
        },
        label: { show: true, position: 'right', color: '#e2e8f0', fontSize: 10, formatter: (p: any) => `${p.value}%` },
        markLine: {
          silent: true,
          symbol: 'none',
          label: { show: true, formatter: `Target ${zoneCompletionPayload.target_pct}%`, color: '#FBBF24', fontSize: 10 },
          lineStyle: { color: '#FBBF24', type: 'dashed', width: 1.2 },
          data: [{ xAxis: zoneCompletionPayload.target_pct }]
        }
      }
    ]
  };
};

const jobCreationPayload = {
  module: '2.4.2_job_creation',
  data: [
    { zone: 'East Shewa', jobs: 680 },
    { zone: 'Jimma', jobs: 520 },
    { zone: 'Arsi', jobs: 420 },
    { zone: 'West Welega', jobs: 340 },
    { zone: 'East Hararghe', jobs: 280 },
    { zone: 'Bale', jobs: 195 },
    { zone: 'Borena', jobs: 120 }
  ]
};

const buildDeliveryGaugeOption = () => {
  const zones = jobCreationPayload.data.map((r) => r.zone);
  const values = jobCreationPayload.data.map((r) => r.jobs);

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any[]) => {
        const row = jobCreationPayload.data[Number(params?.[0]?.dataIndex ?? 0)];
        if (!row) return '';
        return `${row.zone}<br/>New jobs: <b>${row.jobs}</b>`;
      }
    },
    grid: { left: 100, right: 36, top: 18, bottom: 24 },
    xAxis: {
      type: 'value',
      min: 0,
      axisLabel: { color: '#9cc7ff', formatter: '{value}' },
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
        name: 'New jobs',
        type: 'bar',
        data: values,
        barWidth: 10,
        itemStyle: {
          borderRadius: [0, 8, 8, 0],
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
            { offset: 0, color: '#00f5ff' },
            { offset: 1, color: '#10B981' }
          ])
        },
        label: { show: true, position: 'right', color: '#e2e8f0', fontSize: 10, formatter: (p: any) => `${p.value}` }
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

const investmentEmploymentScatterPayload = {
  module: '2.5.1_investment_employment',
  x_axis: { label: 'Cumulative investment (mn USD)', min: 0, max: 50 },
  y_axis: { label: 'New jobs', min: 0, max: 800 },
  quadrants: [
    { id: 'Q1', label: 'High investment, high jobs' },
    { id: 'Q2', label: 'Low investment, high jobs' },
    { id: 'Q3', label: 'Low investment, low jobs' },
    { id: 'Q4', label: 'High investment, low jobs' }
  ],
  points: [
    { zone_name: 'East Shewa', cluster_color: '#10B981', x: 42.5, y: 680, tooltip: 'East Shewa: 42.5 mn USD investment, 680 new jobs' },
    { zone_name: 'Jimma', cluster_color: '#3B82F6', x: 38.2, y: 520, tooltip: 'Jimma: 38.2 mn USD investment, 520 new jobs' },
    { zone_name: 'Arsi', cluster_color: '#3B82F6', x: 28.6, y: 420, tooltip: 'Arsi: 28.6 mn USD investment, 420 new jobs' },
    { zone_name: 'West Welega', cluster_color: '#F59E0B', x: 22.8, y: 340, tooltip: 'West Welega: 22.8 mn USD investment, 340 new jobs' },
    { zone_name: 'East Hararghe', cluster_color: '#F59E0B', x: 18.6, y: 280, tooltip: 'East Hararghe: 18.6 mn USD investment, 280 new jobs' },
    { zone_name: 'Bale', cluster_color: '#F97316', x: 15.2, y: 195, tooltip: 'Bale: 15.2 mn USD investment, 195 new jobs' },
    { zone_name: 'Borena', cluster_color: '#EF4444', x: 8.4, y: 120, tooltip: 'Borena: 8.4 mn USD investment, 120 new jobs' }
  ]
};

const buildBottomTrendOption = () => {
  const xMid = (investmentEmploymentScatterPayload.x_axis.min + investmentEmploymentScatterPayload.x_axis.max) / 2;
  const yMid = (investmentEmploymentScatterPayload.y_axis.min + investmentEmploymentScatterPayload.y_axis.max) / 2;
  const points = investmentEmploymentScatterPayload.points.map((item) => ({
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
        return data?.tooltip || `${data?.zone_name || ''}<br/>Investment: ${params.value?.[0]} mn USD<br/>Jobs: ${params.value?.[1]}`;
      }
    },
    grid: { left: 82, right: 24, top: 34, bottom: 38 },
    xAxis: {
      type: 'value',
      min: investmentEmploymentScatterPayload.x_axis.min,
      max: investmentEmploymentScatterPayload.x_axis.max,
      name: investmentEmploymentScatterPayload.x_axis.label,
      nameLocation: 'middle',
      nameGap: 28,
      nameTextStyle: { color: '#9cc7ff', fontSize: 11 },
      axisLabel: { color: '#9cc7ff' },
      axisLine: { lineStyle: { color: '#3a6fb1' } },
      splitLine: { lineStyle: { color: 'rgba(94, 138, 196, 0.22)' } }
    },
    yAxis: {
      type: 'value',
      min: investmentEmploymentScatterPayload.y_axis.min,
      max: investmentEmploymentScatterPayload.y_axis.max,
      name: investmentEmploymentScatterPayload.y_axis.label,
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
        style: { text: investmentEmploymentScatterPayload.quadrants[0].label, fill: 'rgba(255,255,255,0.68)', fontSize: 12, fontWeight: 600 }
      },
      {
        type: 'text',
        left: '14%',
        top: '16%',
        style: { text: investmentEmploymentScatterPayload.quadrants[1].label, fill: 'rgba(255,255,255,0.62)', fontSize: 12 }
      },
      {
        type: 'text',
        left: '14%',
        top: '76%',
        style: { text: investmentEmploymentScatterPayload.quadrants[2].label, fill: 'rgba(255,255,255,0.62)', fontSize: 12 }
      },
      {
        type: 'text',
        left: '70%',
        top: '76%',
        style: { text: investmentEmploymentScatterPayload.quadrants[3].label, fill: 'rgba(255,255,255,0.62)', fontSize: 12 }
      }
    ],
    series: [
      {
        name: 'Zone',
        type: 'scatter',
        symbol: 'circle',
        symbolSize: 10,
        data: points,
        emphasis: {
          scale: 1.15,
          label: { show: true, formatter: (params: any) => params?.data?.zone_name || '', color: '#ffffff', fontSize: 11, position: 'top' }
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: 'rgba(255,255,255,0.55)', type: 'dashed', width: 1 },
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
  letter-spacing: 2.5px;
  text-transform: uppercase;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
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
