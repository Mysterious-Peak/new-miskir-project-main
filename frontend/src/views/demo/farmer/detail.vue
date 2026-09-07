<template>
  <div class="farmer-detail">
    <!-- Top: Two stat cards -->
    <el-row :gutter="16" class="mb-[16px]">
      <el-col :span="12">
        <el-card shadow="hover" class="h-full">
          <template #header>
            <span class="text-base font-medium">Land Summary</span>
          </template>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-statistic title="Total Land Area" :value="summary?.totalLandArea || 0" suffix="ha" />
            </el-col>
            <el-col :span="12">
              <el-statistic title="Land Count" :value="summary?.landCount || 0" />
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="h-full">
          <template #header>
            <span class="text-base font-medium">Production Overview</span>
          </template>
          <div v-if="productionData.length" class="production-table">
            <div class="flex items-center justify-between px-3 py-1.5 text-xs font-medium text-gray-500 border-b">
              <span class="w-20">Season</span>
              <span class="flex-1">Crop</span>
              <span class="w-24 text-right">Yield(qt)</span>
            </div>
            <div v-for="(row, i) in productionData" :key="i" class="flex items-center justify-between px-3 py-1.5 text-sm border-b last:border-b-0">
              <span class="w-20">{{ row.seasonName }}</span>
              <span class="flex-1">{{ row.cropName || row.cropCode }}</span>
              <span class="w-24 text-right">{{ row.totalYieldQt }}</span>
            </div>
            <div class="flex justify-end px-3 py-2 text-sm font-semibold">
              Total: {{ totalYield.toFixed(2) }} qt
            </div>
          </div>
          <div v-else class="text-center text-gray-400 py-8">No production data</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Bottom: Farmland table -->
    <el-card shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-base font-medium">Farmlands</span>
          <span class="text-sm text-gray-500">Farmer ID: {{ props.farmerId }}</span>
        </div>
      </template>
      <el-table v-loading="loading" border :data="farmlands" stripe>
        <el-table-column label="FarmLand ID" align="center" prop="id" min-width="180" />
        <el-table-column label="Kebele ID" align="center" prop="kebeleId" min-width="120" />
        <el-table-column label="Latitude" align="center" prop="gpsLat" min-width="110" />
        <el-table-column label="Longitude" align="center" prop="gpsLong" min-width="110" />
        <el-table-column label="Area(ha)" align="center" prop="areaTa" min-width="100" />
        <el-table-column label="Elevation(m)" align="center" prop="elevationM" min-width="120" />
        <el-table-column label="Soil Code" align="center" prop="soilCode" min-width="110" />
        <el-table-column label="Irrigation" align="center" prop="irrigationCode" min-width="130" />
        <el-table-column label="Slope" align="center" prop="slopeClass" min-width="100" />
        <el-table-column label="Land Use" align="center" prop="landUseType" min-width="110" />
        <el-table-column label="Status" align="center" prop="status" min-width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === '0'" type="warning">Draft</el-tag>
            <el-tag v-else-if="scope.row.status === '1'" type="success">Approved</el-tag>
            <el-tag v-else-if="scope.row.status === '2'" type="danger">Rejected</el-tag>
            <span v-else>{{ scope.row.status }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Created Date" align="center" prop="createTime" min-width="160" />
      </el-table>
      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="loadData"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { getFarmerSummary } from '@/api/demo/farmer';
import type { FarmerSummaryVO, ProductionByCrop } from '@/api/demo/farmer/types';
import type { FarmlandVO } from '@/api/demo/farmland/types';

const props = defineProps<{ farmerId: string }>();

const loading = ref(false);
const total = ref(0);
const summary = ref<{ totalLandArea?: number; landCount?: number } | null>(null);
const farmlands = ref<FarmlandVO[]>([]);
const productionData = ref<ProductionByCrop[]>([]);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
});

onMounted(() => {
  loadData();
});

async function loadData() {
  loading.value = true;
  try {
    const res: any = await getFarmerSummary(props.farmerId, {
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize
    });
    const data: FarmerSummaryVO = res.data;
    summary.value = {
      totalLandArea: data.totalLandArea || 0,
      landCount: data.landCount || 0
    };
    farmlands.value = data.farmlands || [];
    total.value = data.farmlandTotal || 0;
    productionData.value = data.productionByCrop || [];
  } catch (e) {
    console.error('Failed to load farmer detail', e);
  } finally {
    loading.value = false;
  }
}

const totalYield = computed(() =>
  productionData.value.reduce((acc, r) => acc + Number(r.totalYieldQt || 0), 0)
);
</script>
