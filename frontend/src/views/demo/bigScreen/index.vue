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
        <h1>Oromia Regional Bureau of Agriculture</h1>
      </div>
      <p>Strategic Performance Pulse</p>
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
            <div class="card-title">Production Volume & Yield Trend</div>
            <div ref="inputTypeChartRef" class="chart-box"></div>
          </div>
          <div class="panel-card">
            <div class="card-title">Holistic Capability Matrix</div>
            <div ref="qualityRadarChartRef" class="chart-box"></div>
          </div>
        </div>

        <div class="center-panel">
          <div class="panel-card map-card">
            <div class="card-title">Regional Tech Adoption Heatmap</div>
            <div ref="mapChartRef" class="map map-box"></div>
          </div>
        </div>

        <div class="side-panel">
          <div class="panel-card">
            <div class="card-title">Supply-Demand Balance</div>
            <div ref="coverageTrendChartRef" class="chart-box"></div>
          </div>
          <div class="panel-card">
            <div class="card-title">Household Food Vulnerability Profile</div>
            <div ref="deliveryGaugeChartRef" class="chart-box"></div>
          </div>
        </div>
      </div>

      <div class="screen-bottom">
        <div class="panel-card bottom-left-card">
          <div class="card-title">Technology-Yield Correlation Analysis</div>
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
  module: '2.1_kpi_cards',
  data: [
    {
      id: 'kpi_1',
      label: 'Food Self-sufficiency Rate',
      value: 92.4,
      unit: '%',
      trend: -2.1,
      trend_direction: 'down',
      status_color: '#EF4444',
      sparkline_data: [95, 94, 93, 92.4],
      icon: 'grain'
    },
    {
      id: 'kpi_2',
      label: 'Composite Production Index',
      value: 104.5,
      unit: 'Index',
      trend: 1.2,
      trend_direction: 'up',
      status_color: '#10B981',
      sparkline_data: [101, 102, 103.3, 104.5],
      icon: 'trending_up'
    },
    {
      id: 'kpi_3',
      label: 'Population with Tech Coverage',
      value: 1245000,
      unit: 'people',
      trend: 5.4,
      trend_direction: 'up',
      status_color: '#10B981',
      sparkline_data: [1100000, 1150000, 1200000, 1245000],
      icon: 'people'
    },
    {
      id: 'kpi_4',
      label: 'High-risk Household Share',
      value: 13.2,
      unit: '%',
      trend: 0.8,
      trend_direction: 'up',
      status_color: '#EF4444',
      sparkline_data: [11.5, 12.0, 12.4, 13.2],
      icon: 'warning'
    },
    {
      id: 'kpi_5',
      label: 'Milk Output',
      value: 45.2,
      unit: '10k tons',
      trend: 3.5,
      trend_direction: 'up',
      status_color: '#10B981',
      sparkline_data: [42, 43, 44, 45.2],
      icon: 'local_drink'
    },
    {
      id: 'kpi_6',
      label: 'Meat Output',
      value: 28.8,
      unit: '10k tons',
      trend: 1.2,
      trend_direction: 'up',
      status_color: '#10B981',
      sparkline_data: [27, 27.5, 28, 28.8],
      icon: 'set_meal'
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
      metrics: { tech_adoption: 78.5, trained_farmers: 45000, yield_avg: 42.1, self_sufficiency: 115 }
    },
    {
      zone_id: 'JIMMA',
      zone_name: 'Jimma',
      center: [36.83, 7.67],
      metrics: { tech_adoption: 72, trained_farmers: 38000, yield_avg: 38.5, self_sufficiency: 108 }
    },
    {
      zone_id: 'WEST_WELEGA',
      zone_name: 'West Welega',
      center: [36.55, 9.08],
      metrics: { tech_adoption: 55, trained_farmers: 29000, yield_avg: 30.2, self_sufficiency: 95 }
    },
    {
      zone_id: 'EAST_HARARGE',
      zone_name: 'East Hararghe',
      center: [40.87, 9.08],
      metrics: { tech_adoption: 38, trained_farmers: 15000, yield_avg: 22.5, self_sufficiency: 82 }
    },
    {
      zone_id: 'BORENA',
      zone_name: 'Borena',
      center: [39.58, 5.33],
      metrics: { tech_adoption: 24.5, trained_farmers: 8000, yield_avg: 18, self_sufficiency: 65 }
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
        "<b>Borena</b>: Food security crisis! Deficit has reached <span style='color:#EF4444;font-weight:bold'>25%</span>, and severe food-insecure households are at 30%. Immediate emergency dispatch is recommended.",
      timestamp: '2026-03-19T09:15:00Z'
    },
    {
      id: 'alert_002',
      type: 'SUCCESS',
      priority: 3,
      icon: '🏆',
      zone_name: 'East Shewa',
      message_html:
        "<b>East Shewa</b>: Technology extension is highly effective! Yield has exceeded <span style='color:#10B981;font-weight:bold'>42</span> quintal/ha. Recommend organizing a regional field demonstration event.",
      timestamp: '2026-03-19T08:30:00Z'
    },
    {
      id: 'alert_003',
      type: 'ANOMALY',
      priority: 2,
      icon: '⚠️',
      zone_name: 'Special Irrigation Project',
      message_html:
        '<b>Special Irrigation Project</b>: Abnormal water-use efficiency detected. Irrigated area increased by 15% but output did not improve. Pest/disease or soil factors should be investigated.',
      timestamp: '2026-03-19T07:45:00Z'
    },
    {
      id: 'alert_004',
      type: 'MACRO',
      priority: 3,
      icon: '📈',
      zone_name: 'Oromia Region',
      message_html:
        "<b>Regional Forecast</b>: Total seasonal output is expected to reach <span style='color:#F8FAFC;font-weight:bold'>235</span> (10k tons), likely exceeding the annual target by 4.5%.",
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
  module: '2.2.1_production_combo',
  title: 'Oromia Monthly Production Trend',
  x_axis: ['2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'],
  series: [
    {
      name: 'Cultivated Area (kha)',
      type: 'bar',
      color_gradient: ['#10B981', '#059669'],
      y_axis_index: 0,
      data: [420, 425, 430, 428, 435, 440, 442, 445, 448, 450, 452, 455]
    },
    {
      name: 'Total Output (10k tons)',
      type: 'line',
      color: '#FBBF24',
      symbol: 'circle',
      y_axis_index: 1,
      data: [180, 195, 210, 205, 230, 250, 265, 260, 240, 220, 215, 235]
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

const efficiencyRadarPayload = {
  module: '2.2.2_efficiency_radar',
  title: 'Regional Production Efficiency Radar',
  indicators: [
    { name: 'Yield Level', max: 100 },
    { name: 'Irrigation Coverage', max: 100 },
    { name: 'Tech Adoption Rate', max: 100 },
    { name: 'Livestock Growth', max: 100 },
    { name: 'Market Access', max: 100 },
    { name: 'Climate Resilience', max: 100 }
  ],
  target_line: [80, 60, 70, 65, 75, 70],
  actual_data: [72, 45, 58, 68, 62, 55],
  area_color: 'rgba(16, 185, 129, 0.4)',
  border_color: '#10B981'
};

const buildQualityRadarOption = () => ({
  tooltip: { trigger: 'item' },
  grid: { top: 8, bottom: 44 },
  legend: {
    bottom: 8,
    textStyle: { color: '#9cc7ff', fontSize: 11 },
    data: ['Annual Target', 'Actual Performance']
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
      data: [{ value: efficiencyRadarPayload.target_line, name: 'Annual Target' }]
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
      data: [{ value: efficiencyRadarPayload.actual_data, name: 'Actual Performance' }]
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
        if (!metrics) return p?.name || 'Ethiopia';
        return [
          `<b>${p.name}</b>`,
          `Tech Adoption: ${Number(metrics.tech_adoption).toFixed(1)}%`,
          `Trained Farmers: ${Number(metrics.trained_farmers).toLocaleString()}`,
          `Avg Yield: ${Number(metrics.yield_avg).toFixed(1)}`,
          `Self-sufficiency: ${Number(metrics.self_sufficiency).toFixed(0)}%`
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

const supplyDemandPayload = {
  module: '2.4.1_supply_demand_optimized',
  strategy: 'TOP_BOTTOM_5',
  unit: 'kt',
  balance_zero_line: 0,
  data: [
    { zone: 'East Shewa', value: 152.5, type: 'surplus', rank: 1 },
    { zone: 'West Arsi', value: 98.3, type: 'surplus', rank: 2 },
    { zone: 'Jimma', value: 85.6, type: 'surplus', rank: 3 },
    {
      zone: '',
      value: 12.5,
      type: 'balanced',
      is_aggregate: true,
      hidden_zones: ['North Shewa', 'West Welega', 'Horo Guduru', '...']
    },
    { zone: 'Guji', value: -12.8, type: 'deficit', rank: -3 },
    { zone: 'Bale', value: -8.4, type: 'deficit', rank: -2 },
    { zone: 'Borena', value: -95.4, type: 'deficit', rank: -1 }
  ]
};

const buildCoverageTrendOption = () => {
  const zones = supplyDemandPayload.data.map((item, index) => {
    if (item.zone) return item.zone;
    if (item.is_aggregate) return '';
    return `Zone ${index + 1}`;
  });
  const barValues = supplyDemandPayload.data.map((item) => item.value);
  const deficitLabelAnchors = supplyDemandPayload.data
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.value < 0)
    .map(({ index }) => ({ value: [0, zones[index]], zone: zones[index] }));
  const maxAbs = Math.max(...barValues.map((value) => Math.abs(value)), 1);
  const axisExtent = Math.ceil((maxAbs * 1.15) / 10) * 10;

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any[]) => {
        const val = Number(params?.[0]?.value ?? 0);
        const dataIndex = Number(params?.[0]?.dataIndex ?? 0);
        const zone = zones[dataIndex] || '';
        const row = supplyDemandPayload.data[dataIndex];
        const type = row?.type === 'balanced' ? 'Balanced' : val >= 0 ? 'Surplus' : 'Deficit';
        return `${zone}<br/>${type}: ${Math.abs(val).toFixed(1)} ${supplyDemandPayload.unit}`;
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
      data: zones,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false }
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
          show: true,
          color: '#f8fafc',
          fontSize: 10,
          formatter: (params: any) => (Number(params.value) < 0 ? '' : zones[params.dataIndex] || ''),
          position: 'left',
          distance: 6
        },
        markLine: {
          silent: true,
          symbol: 'none',
          label: {
            show: true,
            formatter: '0 (Balance)',
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
      },
      {
        name: 'deficit-label-anchor',
        type: 'scatter',
        symbolSize: 1,
        data: deficitLabelAnchors,
        itemStyle: {
          color: 'rgba(0,0,0,0)'
        },
        label: {
          show: true,
          position: 'right',
          distance: 6,
          color: '#f8fafc',
          fontSize: 10,
          formatter: (params: any) => params?.data?.zone || ''
        },
        emphasis: { disabled: true },
        tooltip: { show: false }
      }
    ]
  };
};

const vulnerabilityPyramidPayload = {
  module: '2.4.2_vulnerability_pyramid',
  title: 'Regional Household Food Vulnerability Distribution',
  layers: [
    { level: 'severe', label: 'Severe Insecurity', percentage: 13.2, count: 594000 },
    { level: 'moderate', label: 'Moderate Insecurity', percentage: 21.5, count: 675000 },
    { level: 'mild', label: 'Mild Insecurity', percentage: 28.3, count: 1183500 },
    { level: 'secure', label: 'Secure', percentage: 37, count: 2047500 }
  ]
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
  const severeLayer = vulnerabilityPyramidPayload.layers.find((item) => item.level === 'severe');
  const severePercent = Math.round(Number(severeLayer?.percentage ?? 0));

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
          text: `${severePercent}%`,
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
          text: 'Urgent Intv.',
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
  module: '2.5.1_scatter_analysis',
  x_axis: { label: 'Tech Adoption Rate (%)', min: 0, max: 100 },
  y_axis: { label: 'Average Crop Yield (quintal/ha)', min: 0, max: 60 },
  quadrants: [
    { id: 'Q1', label: '⭐ Model Zones' },
    { id: 'Q2', label: 'Natural Potential Zones' },
    { id: 'Q3', label: 'Priority Support Zones' },
    { id: 'Q4', label: 'Efficiency Concern Zones' }
  ],
  points: [
    {
      zone_id: 'EAST_SHEWA',
      zone_name: 'East Shewa',
      cluster_color: '#3B82F6',
      x: 78.5,
      y: 42.1,
      category: 'MODEL_ZONE',
      tooltip: 'East Shewa: Adoption 78.5%, Yield 42.1'
    },
    {
      zone_id: 'JIMMA',
      zone_name: 'Jimma',
      cluster_color: '#F97316',
      x: 72,
      y: 38.5,
      category: 'MODEL_ZONE',
      tooltip: 'Jimma: Adoption 72.0%, Yield 38.5'
    },
    {
      zone_id: 'WEST_ARSI',
      zone_name: 'West Arsi',
      cluster_color: '#10B981',
      x: 35,
      y: 36,
      category: 'POTENTIAL_NAT',
      tooltip: 'West Arsi: Adoption 35.0%, Yield 36.0'
    },
    {
      zone_id: 'EAST_HARARGE',
      zone_name: 'East Hararghe',
      cluster_color: '#F59E0B',
      x: 38,
      y: 22.5,
      category: 'KEY_SUPPORT',
      tooltip: 'East Hararghe: Adoption 38.0%, Yield 22.5'
    },
    {
      zone_id: 'BORENA',
      zone_name: 'Borena',
      cluster_color: '#EF4444',
      x: 24.5,
      y: 18,
      category: 'KEY_SUPPORT',
      tooltip: 'Borena: Adoption 24.5%, Yield 18.0'
    },
    {
      zone_id: 'SPECIAL_ZONE_X',
      zone_name: 'Demo Irrigation Zone',
      cluster_color: '#8B5CF6',
      x: 85,
      y: 21,
      category: 'EFFICIENCY_ISSUE',
      tooltip: 'Demo Zone: Adoption 85.0%, Yield 21.0 (anomaly)'
    },
    {
      zone_id: 'WEST_SHEWA',
      zone_name: 'West Shewa',
      cluster_color: '#3B82F6',
      x: 58,
      y: 34.8,
      category: 'MODEL_ZONE',
      tooltip: 'West Shewa: Adoption 58.0%, Yield 34.8'
    },
    {
      zone_id: 'NORTH_SHEWA',
      zone_name: 'North Shewa',
      cluster_color: '#3B82F6',
      x: 61.5,
      y: 31.2,
      category: 'MODEL_ZONE',
      tooltip: 'North Shewa: Adoption 61.5%, Yield 31.2'
    },
    {
      zone_id: 'ARSI',
      zone_name: 'Arsi',
      cluster_color: '#10B981',
      x: 49.5,
      y: 35.5,
      category: 'POTENTIAL_NAT',
      tooltip: 'Arsi: Adoption 49.5%, Yield 35.5'
    },
    {
      zone_id: 'BALE',
      zone_name: 'Bale',
      cluster_color: '#F59E0B',
      x: 32,
      y: 20.8,
      category: 'KEY_SUPPORT',
      tooltip: 'Bale: Adoption 32.0%, Yield 20.8'
    },
    {
      zone_id: 'GUJI',
      zone_name: 'Guji',
      cluster_color: '#F59E0B',
      x: 29.5,
      y: 19.2,
      category: 'KEY_SUPPORT',
      tooltip: 'Guji: Adoption 29.5%, Yield 19.2'
    },
    {
      zone_id: 'WEST_WELEGA',
      zone_name: 'West Welega',
      cluster_color: '#10B981',
      x: 55,
      y: 30,
      category: 'TRANSITION',
      tooltip: 'West Welega: Adoption 55.0%, Yield 30.0'
    },
    {
      zone_id: 'EAST_WELEGA',
      zone_name: 'East Welega',
      cluster_color: '#10B981',
      x: 52.3,
      y: 29.4,
      category: 'TRANSITION',
      tooltip: 'East Welega: Adoption 52.3%, Yield 29.4'
    },
    {
      zone_id: 'NORTH_WELEGA',
      zone_name: 'North Welega',
      cluster_color: '#F59E0B',
      x: 44.1,
      y: 25.1,
      category: 'KEY_SUPPORT',
      tooltip: 'North Welega: Adoption 44.1%, Yield 25.1'
    },
    {
      zone_id: 'KELEM_WELEGA',
      zone_name: 'Kelem Welega',
      cluster_color: '#F59E0B',
      x: 41.6,
      y: 24.3,
      category: 'KEY_SUPPORT',
      tooltip: 'Kelem Welega: Adoption 41.6%, Yield 24.3'
    },
    {
      zone_id: 'HORO_GUDURU',
      zone_name: 'Horo Guduru',
      cluster_color: '#10B981',
      x: 47.2,
      y: 28.6,
      category: 'POTENTIAL_NAT',
      tooltip: 'Horo Guduru: Adoption 47.2%, Yield 28.6'
    },
    {
      zone_id: 'ILLUBABOR',
      zone_name: 'Illubabor',
      cluster_color: '#10B981',
      x: 45.8,
      y: 27.9,
      category: 'POTENTIAL_NAT',
      tooltip: 'Illubabor: Adoption 45.8%, Yield 27.9'
    },
    {
      zone_id: 'WEST_HARARGE',
      zone_name: 'West Hararghe',
      cluster_color: '#F59E0B',
      x: 36.2,
      y: 23.4,
      category: 'KEY_SUPPORT',
      tooltip: 'West Hararghe: Adoption 36.2%, Yield 23.4'
    },
    {
      zone_id: 'SOUTHWEST_SHEWA',
      zone_name: 'Southwest Shewa',
      cluster_color: '#3B82F6',
      x: 64.2,
      y: 33.5,
      category: 'MODEL_ZONE',
      tooltip: 'Southwest Shewa: Adoption 64.2%, Yield 33.5'
    },
    {
      zone_id: 'SPECIAL_ZONE_AA',
      zone_name: 'Special Zone Surrounding AA',
      cluster_color: '#8B5CF6',
      x: 82.7,
      y: 24.7,
      category: 'EFFICIENCY_ISSUE',
      tooltip: 'Special Zone AA: Adoption 82.7%, Yield 24.7 (high input, low efficiency)'
    }
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

.top-overview {
  position: relative;
  margin-bottom: 10px;
  border: 1px solid rgba(68, 129, 246, 0.45);
  border-radius: 12px;
  padding: 8px;
  background: linear-gradient(180deg, rgba(9, 28, 73, 0.62) 0%, rgba(8, 24, 60, 0.72) 100%);
  box-shadow:
    inset 0 0 24px rgba(0, 148, 255, 0.08),
    0 0 10px rgba(0, 102, 255, 0.12);
}

.screen-header {
  position: relative;
  margin-bottom: 8px;
  /* border: 1px solid rgba(68, 129, 246, 0.35); */
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

.top-overview > p {
  margin: 0 0 10px;
  text-align: center;
  color: #95c3ff;
  font-size: 12px;
  letter-spacing: 1.6px;
  text-transform: uppercase;
}

.kpi-row {
  display: grid;
  grid-template-columns: repeat(6, minmax(180px, 1fr));
  justify-content: center;
  gap: 10px;
  margin-bottom: 0;
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
