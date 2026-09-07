<template>
  <div class="p-2 cluster-detail">
    <el-card shadow="hover" class="mb-[10px]">
      <el-form :inline="true" label-width="auto">
        <el-form-item label="Year">
          <el-select v-model="filterYear" placeholder="Select year" style="width: 140px">
            <el-option v-for="item in yearSelectOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Season">
          <el-select v-model="filterSeasonId" placeholder="Select season" style="width: 200px">
            <el-option v-for="item in seasonSelectOptions" :key="item.seasonId" :label="item.seasonName" :value="item.seasonId" />
          </el-select>
        </el-form-item>
        <el-form-item label="Crop Type">
          <el-select v-model="filterCropId" placeholder="Select crop" style="width: 200px">
            <el-option v-for="item in cropSelectOptions" :key="item.cropId" :label="item.cropName || item.cropId" :value="item.cropId" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">Search</el-button>
          <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['demo:clusterFarming:export']"> Export </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="mb-[10px]" :body-style="{ padding: '16px 24px 8px' }">
      <div class="flex items-center" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px">
        <el-icon class="mr-1" color="#52c41a"><InfoFilled /></el-icon>
        <span class="font-semibold">Cluster Yield Summary</span>
      </div>
      <el-form label-position="top" class="w-full">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="Cluster Name">
              <span>{{ summaryDisplay.clusterName }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Kebele">
              <span>{{ summaryDisplay.kebele }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Parcel Count">
              <span>{{ summaryDisplay.parcelCount }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Farmer Count">
              <span>{{ summaryDisplay.farmerCount }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Total Area (ha)">
              <span>{{ summaryDisplay.totalAreaHa }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Total Planned Area (ha)">
              <span>{{ summaryDisplay.totalPlannedAreaHa }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Total Harested Area (ha)">
              <span>{{ summaryDisplay.totalHarvestedArea }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Total Actual Yield (qt)">
              <span>{{ summaryDisplay.totalActualYield }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Avg Yield (qt/ha)">
              <span>{{ summaryDisplay.avgYield }}</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <el-card shadow="hover" :body-style="{ padding: '16px 24px 8px' }">
      <div class="flex items-center" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px">
        <el-icon class="mr-1" color="#52c41a"><InfoFilled /></el-icon>
        <span class="font-semibold">Parcel Report</span>
      </div>
      <el-table v-loading="reportLoading" :data="reportList" stripe border>
        <el-table-column label="Parcel ID" align="center" prop="farmlandId" :min-width="getColumnWidth('Parcel ID')" />
        <el-table-column label="Harvest ID" align="center" prop="harvestId" :min-width="getColumnWidth('Harvest ID')" />
        <el-table-column label="Farmer ID" align="center" prop="farmerId" :min-width="getColumnWidth('Farmer ID')" />
        <el-table-column label="Farmer" align="center" prop="farmerName" :min-width="getColumnWidth('Farmer')" />
        <el-table-column label="Area (ha)" align="center" prop="areaTa" :min-width="getColumnWidth('Area (ha)')" />
        <el-table-column label="Planned Area (ha)" align="center" prop="plannedAreaTa" :min-width="getColumnWidth('Planned Area (ha)')" />
        <el-table-column label="Crop Type" align="center" prop="cropName" :min-width="getColumnWidth('Crop Type')" />
        <el-table-column label="Harested Area (ha)" align="center" prop="harvestedAreaTa" :min-width="getColumnWidth('Harested Area (ha)')" />
        <el-table-column label="Actual Yield (qt)" align="center" prop="actualYieldQt" :min-width="getColumnWidth('Actual Yield (qt)')" />
        <el-table-column label="Year" align="center" prop="year" :min-width="getColumnWidth('Year')" />
        <el-table-column label="Season" align="center" prop="seasonName" :min-width="getColumnWidth('Season')" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup name="ClusterFarmingDetail" lang="ts">
import { InfoFilled } from '@element-plus/icons-vue';
import {
  getClusterReport,
  getClusterReportFilterOptions,
  getClusterSummary
} from '@/api/demo/clusterFarming';
import {
  ClusterReportFilterOptionVO,
  ClusterReportVO,
  ClusterSummaryVO,
  CLUSTER_NO_CROP_ID,
  CLUSTER_NO_SEASON_ID,
  CLUSTER_NO_YEAR
} from '@/api/demo/clusterFarming/types';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();

const clusterId = computed(() => route.query.id as string);
const summary = ref<ClusterSummaryVO>({} as ClusterSummaryVO);
const reportList = ref<ClusterReportVO[]>([]);
const filterOptions = ref<ClusterReportFilterOptionVO[]>([]);
const showNoYear = ref(false);
const showNoSeason = ref(false);
const showNoCrop = ref(false);
const filterYear = ref<number | undefined>();
const filterSeasonId = ref<number | undefined>();
const filterCropId = ref<string | undefined>();
const reportLoading = ref(false);

const isNoYear = (year?: number) => year === CLUSTER_NO_YEAR;
const isNoSeason = (seasonId?: number) => seasonId === CLUSTER_NO_SEASON_ID;

const matchesSelectedYear = (item: ClusterReportFilterOptionVO) => {
  if (filterYear.value == null || isNoYear(filterYear.value)) {
    return true;
  }
  return item.year === filterYear.value;
};

const matchesSelectedSeason = (item: ClusterReportFilterOptionVO) => {
  if (filterSeasonId.value == null || isNoSeason(filterSeasonId.value)) {
    return true;
  }
  return Number(item.seasonId) === Number(filterSeasonId.value);
};

const yearSelectOptions = computed(() => {
  const years = filterOptions.value
    .map((item) => item.year)
    .filter((year): year is number => year !== undefined && year !== null);
  const options = [...new Set(years)].sort((a, b) => b - a).map((year) => ({ value: year, label: String(year) }));
  if (showNoYear.value) {
    options.unshift({ value: CLUSTER_NO_YEAR, label: 'No Year' });
  }
  return options;
});

const seasonSelectOptions = computed(() => {
  const options: Array<{ seasonId: number; seasonName: string }> = [];
  if (showNoSeason.value) {
    options.push({ seasonId: CLUSTER_NO_SEASON_ID, seasonName: 'No Season' });
  }
  const map = new Map<number, { seasonId: number; seasonName: string }>();
  filterOptions.value.filter(matchesSelectedYear).forEach((item) => {
    if (item.seasonId === undefined || item.seasonId === null) {
      return;
    }
    const seasonId = Number(item.seasonId);
    if (!map.has(seasonId)) {
      map.set(seasonId, {
        seasonId,
        seasonName: item.seasonName || String(seasonId)
      });
    }
  });
  options.push(...[...map.values()].sort((a, b) => b.seasonId - a.seasonId));
  return options;
});

const cropSelectOptions = computed(() => {
  const options: Array<{ cropId: string; cropName: string }> = [];
  if (showNoCrop.value) {
    options.push({ cropId: CLUSTER_NO_CROP_ID, cropName: 'No Crop' });
  }
  const map = new Map<string, { cropId: string; cropName: string }>();
  filterOptions.value.filter((item) => matchesSelectedYear(item) && matchesSelectedSeason(item)).forEach((item) => {
    if (!item.cropId || map.has(item.cropId)) {
      return;
    }
    map.set(item.cropId, {
      cropId: item.cropId,
      cropName: item.cropName || item.cropId
    });
  });
  options.push(
    ...[...map.values()].sort((a, b) => a.cropName.localeCompare(b.cropName, undefined, { sensitivity: 'base' }))
  );
  return options;
});

const seasonFilter = computed(() => ({
  year: filterYear.value,
  seasonId: filterSeasonId.value,
  cropId: filterCropId.value
}));

const formatNumber = (val?: number) => {
  if (val === undefined || val === null || Number.isNaN(Number(val))) {
    return '-';
  }
  return Number(val).toFixed(2);
};

const formatCount = (val?: number) => {
  if (val === undefined || val === null) {
    return '-';
  }
  return String(val);
};

const formatYield = (val?: number) => {
  if (val === undefined || val === null) {
    return '0';
  }
  return String(val);
};

const summaryDisplay = computed(() => {
  const kebeleName = summary.value.kebeleName;
  const kebeleId = summary.value.kebeleId;
  const kebele = kebeleName && kebeleId ? `${kebeleName} (${kebeleId})` : kebeleName || kebeleId || '-';
  return {
    clusterName: summary.value.clusterName || '-',
    kebele,
    parcelCount: formatCount(summary.value.parcelCount),
    farmerCount: formatCount(summary.value.farmerCount),
    totalAreaHa: formatNumber(summary.value.totalAreaHa),
    totalPlannedAreaHa: formatNumber(summary.value.totalPlannedAreaHa),
    totalHarvestedArea: formatNumber(summary.value.totalHarvestedAreaHa),
    totalActualYield: formatYield(summary.value.totalActualYieldQt),
    avgYield: formatNumber(summary.value.avgYieldPerHa)
  };
});

const pickFirstRealOption = <T,>(items: T[], isSentinel: (item: T) => boolean, getValue: (item: T) => unknown) => {
  const preferred = items.find((item) => !isSentinel(item));
  return preferred ? getValue(preferred) : items.length > 0 ? getValue(items[0]) : undefined;
};

const ensureSeasonSelectionValid = () => {
  if (seasonSelectOptions.value.length === 0) {
    filterSeasonId.value = undefined;
    return;
  }
  if (!seasonSelectOptions.value.some((item) => item.seasonId === filterSeasonId.value)) {
    filterSeasonId.value = pickFirstRealOption(
      seasonSelectOptions.value,
      (item) => item.seasonId === CLUSTER_NO_SEASON_ID,
      (item) => item.seasonId
    ) as number | undefined;
  }
};

const ensureCropSelectionValid = () => {
  if (cropSelectOptions.value.length === 0) {
    filterCropId.value = undefined;
    return;
  }
  if (!cropSelectOptions.value.some((item) => item.cropId === filterCropId.value)) {
    filterCropId.value = pickFirstRealOption(
      cropSelectOptions.value,
      (item) => item.cropId === CLUSTER_NO_CROP_ID,
      (item) => item.cropId
    ) as string | undefined;
  }
};

const applyDefaultYearFilter = () => {
  if (yearSelectOptions.value.length === 0) {
    filterYear.value = undefined;
    return;
  }
  if (filterYear.value == null) {
    filterYear.value = pickFirstRealOption(
      yearSelectOptions.value,
      (item) => item.value === CLUSTER_NO_YEAR,
      (item) => item.value
    ) as number | undefined;
  }
};

const applyDefaultSeasonFilter = () => {
  ensureSeasonSelectionValid();
  if (filterSeasonId.value == null && seasonSelectOptions.value.length > 0) {
    filterSeasonId.value = pickFirstRealOption(
      seasonSelectOptions.value,
      (item) => item.seasonId === CLUSTER_NO_SEASON_ID,
      (item) => item.seasonId
    ) as number | undefined;
  }
};

const applyDefaultCropFilter = () => {
  ensureCropSelectionValid();
  if (!filterCropId.value && cropSelectOptions.value.length > 0) {
    filterCropId.value = pickFirstRealOption(
      cropSelectOptions.value,
      (item) => item.cropId === CLUSTER_NO_CROP_ID,
      (item) => item.cropId
    ) as string | undefined;
  }
};

const loadFilterOptions = async () => {
  if (!clusterId.value) return;
  const res = await getClusterReportFilterOptions(clusterId.value);
  const data = res.data || {};
  filterOptions.value = data.options || [];
  showNoYear.value = !!data.showNoYear;
  showNoSeason.value = !!data.showNoSeason;
  showNoCrop.value = !!data.showNoCrop;
  applyDefaultYearFilter();
  applyDefaultSeasonFilter();
  applyDefaultCropFilter();
};

const isFilterComplete = () => filterYear.value != null && filterSeasonId.value != null && !!filterCropId.value;

const loadAnalytics = async () => {
  if (!clusterId.value || !isFilterComplete()) {
    summary.value = {} as ClusterSummaryVO;
    reportList.value = [];
    return;
  }
  reportLoading.value = true;
  try {
    const [summaryRes, reportRes] = await Promise.all([
      getClusterSummary(clusterId.value, seasonFilter.value),
      getClusterReport(clusterId.value, seasonFilter.value)
    ]);
    summary.value = summaryRes.data || ({} as ClusterSummaryVO);
    reportList.value = reportRes.data || [];
  } finally {
    reportLoading.value = false;
  }
};

const handleSearch = () => {
  if (!isFilterComplete()) {
    proxy?.$modal.msgWarning('Please select Year, Season and Crop Type');
    return;
  }
  loadAnalytics();
};

const handleExport = () => {
  if (!isFilterComplete()) {
    proxy?.$modal.msgWarning('Please select Year, Season and Crop Type');
    return;
  }
  proxy?.download(
    'demo/clusterFarming/report/export',
    {
      id: clusterId.value,
      year: filterYear.value,
      seasonId: filterSeasonId.value,
      cropId: filterCropId.value
    },
    `cluster_report_${summary.value.clusterId || clusterId.value}_${new Date().getTime()}.xlsx`
  );
};

watch(filterYear, () => {
  ensureSeasonSelectionValid();
  ensureCropSelectionValid();
});

watch(filterSeasonId, () => {
  ensureCropSelectionValid();
});

onMounted(async () => {
  await loadFilterOptions();
  await loadAnalytics();
});
</script>

<style scoped lang="scss">
.cluster-detail :deep(.el-form-item__content) {
  line-height: 1.5;
  color: var(--el-text-color-primary);
}
</style>
