<template>
  <div class="p-2">
    <!-- Farmer Detail View -->
    <template v-if="viewMode === 'farmerDetail' && detailFarmerId">
      <el-button type="primary" circle icon="ArrowLeft" @click="backToList" class="mb-[10px]" />
      <FarmerDetail :farmerId="detailFarmerId" />
    </template>

    <!-- Farmland List View -->
    <template v-else>
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="FarmLand ID" prop="id">
              <el-select
                v-model="queryParams.id"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="farmLandIdRemoteMethod"
                :loading="farmLandIdLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in farmLandIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item :label="proxy.$t('farmland.farmerId')" prop="farmerId">
              <el-select
                v-model="queryParams.farmerId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="farmerIdRemoteMethod"
                :loading="farmerIdLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in farmerIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item :label="proxy.$t('farmland.kebeleId')" prop="kebeleId">
              <el-input prefix-icon="Search" v-model="queryParams.kebeleId" :placeholder="proxy.$t('farmland.alertHolderKebeleId')" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item class="search-actions">
              <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
              <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="18"><span class="table-page-title"><el-icon class="table-page-title-icon"><Tickets /></el-icon> {{ ($route.meta.title || "") + " List" }}</span></el-col>
          <el-col :span="1.5" style="margin-left: auto; margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="router.push({ path: '/farmland_management/farmlandEdit' })">Add</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="farmlandList" @selection-change="handleSelectionChange" stripe fit border>
        <el-table-column label="FarmLand ID" align="center" prop="id" :min-width="getColumnWidth('FarmLand ID')" />
        <el-table-column label="Farmer ID" align="center" prop="farmerId" :min-width="getColumnWidth('Farmer ID')" />
        <el-table-column label="Kebele ID" align="center" prop="kebeleId" :min-width="getColumnWidth('Kebele ID')" />
        <el-table-column label="Latitude" align="center" prop="gpsLat" :min-width="getColumnWidth('Latitude')" />
        <el-table-column label="Longitude" align="center" prop="gpsLong" :min-width="getColumnWidth('Longitude')" />
        <el-table-column label="Area(ha)" align="center" prop="areaTa" :min-width="getColumnWidth('Area(ha)')" />
        <el-table-column label="Soil Type" align="center" prop="soilCode" :min-width="getColumnWidth('Soil Type')">
          <template #default="scope">
            <span>{{ getSoilNameByCode(scope.row.soilCode) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Irrigation Type" align="center" prop="irrigationCode" :min-width="getColumnWidth('Irrigation Type')">
          <template #default="scope">
            <span>{{ getIrrigationNameByCode(scope.row.irrigationCode) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Slope Class" align="center" prop="slopeClass" :min-width="getColumnWidth('Slope Class')">
          <template #default="scope">
            <dict-tag :options="slope_class" :value="scope.row.slopeClass" />
          </template>
        </el-table-column>
        <el-table-column label="Land Use Type" align="center" prop="landUseType" :min-width="getColumnWidth('Land Use Type')">
          <template #default="scope">
            <dict-tag :options="land_use_type" :value="scope.row.landUseType" />
          </template>
        </el-table-column>
        <el-table-column label="Altitude(m)" align="center" prop="elevationM" :min-width="getColumnWidth('Altitude(m)')" />
        <el-table-column label="Land Ownership Type" align="center" prop="landOwnershipType" :min-width="getColumnWidth('Land Ownership Type')">
          <template #default="scope">
            <dict-tag :options="land_ownership_type" :value="scope.row.landOwnershipType" />
          </template>
        </el-table-column>
        <el-table-column label="Aspect / Slope Direction" align="center" prop="slopeAspect" :min-width="getColumnWidth('Aspect / Slope Direction')">
          <template #default="scope">
            <dict-tag :options="slope_aspect" :value="scope.row.slopeAspect" />
          </template>
        </el-table-column>
        <el-table-column label="Sampling depth" align="center" prop="samplingDepth" :min-width="getColumnWidth('Sampling depth')">
          <template #default="scope">
            <dict-tag :options="sampling_depth" :value="scope.row.samplingDepth" />
          </template>
        </el-table-column>
        <el-table-column label="Land use history" align="center" prop="landUseRecord" :min-width="getColumnWidth('Land use history')">
          <template #default="scope">
            <dict-tag :options="land_use_record" :value="scope.row.landUseRecord" />
          </template>
        </el-table-column>
        <el-table-column label="Accessibility to infrastructure" align="center" prop="infrastructureAccessibility" :min-width="getColumnWidth('Accessibility to infrastructure')" show-overflow-tooltip />
        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')">
          <template #default="scope">
            <el-tag>{{ ApprovalStatus[scope.row.status as ApprovalStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Created By" align="center" prop="createdUserName" :min-width="getColumnWidth('Created By')" />
        <el-table-column label="Created Date" align="center" prop="createTime" width="180" :min-width="getColumnWidth('Created Date')">
          <template #default="scope">
            <span v-if="isNew(scope.row.createTime)" class="font-black">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            <span v-else>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approved By" align="center" prop="approvedUserName" :min-width="getColumnWidth('Approved By')" />
        <el-table-column label="Approved Date" align="center" prop="approvedTime" width="180" :min-width="getColumnWidth('Approved Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.approvedTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approval Comment" align="center" prop="approvedComment" width="180" :min-width="getColumnWidth('Approval Comment')" />
        <el-table-column label="Actions" align="center" fixed="right" class-name="action-column" width="300">
          <template #default="scope">
            <el-button type="primary" class="table-action-btn" icon="View" @click="handleFarmerDetail(scope.row)"
              >View</el-button
            >
            <el-button v-if="isViewFlag(scope.row)" class="table-action-btn table-check-btn" icon="EditPen" @click="router.push({ path: '/farmland_management/farmlandEdit', query: { id: scope.row.id, mode: 'view' } })"
              >Edit</el-button
            >
            <template v-else>
              <el-button class="table-action-btn table-edit-btn" icon="EditPen" @click="router.push({ path: '/farmland_management/farmlandEdit', query: { id: scope.row.id } })">Edit</el-button>
              <el-button class="table-action-btn table-delete-btn" icon="Delete" @click="handleDelete(scope.row)">Delete</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    </template>
  </div>
</template>

<script setup name="Farmland" lang="ts">
import {
  autoCompleteFarmerId,
  autoCompleteFarmlandId,
  delFarmland,
  listFarmland
} from '@/api/demo/farmland';
import { FarmlandQuery, FarmlandVO } from '@/api/demo/farmland/types';
import { listIrrigationTypeMaster } from '@/api/demo/irrigationTypeMaster';
import { IrrigationTypeMasterVO } from '@/api/demo/irrigationTypeMaster/types';
import { listSoilTypeMaster } from '@/api/demo/soilTypeMaster';
import { SoilTypeMasterVO } from '@/api/demo/soilTypeMaster/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import { getColumnWidth } from '@/utils/utils';
import FarmerDetail from '@/views/demo/farmer/detail.vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const viewMode = ref(route.query.view || 'list');
const detailFarmerId = ref(route.query.farmerId as string || '');

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { slope_class, land_use_type } = toRefs<any>(proxy?.useDict('slope_class', 'land_use_type'));
const { land_ownership_type, slope_aspect, sampling_depth, land_use_record } = toRefs<any>(
  proxy?.useDict('land_ownership_type', 'slope_aspect', 'sampling_depth', 'land_use_record')
);

const farmlandList = ref<FarmlandVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();

const soilTypeMasterList = ref<SoilTypeMasterVO[]>([]);
async function getSoilTypes() {
  const res = await listSoilTypeMaster();
  soilTypeMasterList.value = res.rows;
}
const irrigationTypeMasterList = ref<IrrigationTypeMasterVO[]>([]);
async function getIrrigationTypes() {
  const res = await listIrrigationTypeMaster();
  irrigationTypeMasterList.value = res.rows;
}
const getSoilNameByCode = (code?: string) => {
  if (!code) return '';
  return soilTypeMasterList.value.find((item) => item.soilCode === code)?.soilName || code;
};
const getIrrigationNameByCode = (code?: string) => {
  if (!code) return '';
  return code.split(',').map(c => {
    return irrigationTypeMasterList.value.find((item) => item.irrigationCode === c.trim())?.irrigationName || c.trim();
  }).join(', ');
};

const farmLandIdOptions = ref([]);
const farmLandIdList = ref<any[]>([]);
const farmLandIdLoading = ref(false);
const farmLandIdRemoteMethod = async (query: string) => {
  if (query) {
    farmLandIdLoading.value = true;
    try {
      const res = await autoCompleteFarmlandId({
        id: query?.trim(),
        pageNum: null,
        pageSize: null
      });

      farmLandIdList.value = res.data;
      farmLandIdOptions.value = farmLandIdList.value.map((item) => ({
        value: item.id,
        label: item.id
      }));
    } catch (e) {
      console.error('autoCompleteFarmlandId failed:', e);
      farmLandIdList.value = [];
      farmLandIdOptions.value = [];
    } finally {
      farmLandIdLoading.value = false;
    }
  } else {
    farmLandIdOptions.value = [];
  }
};

const farmerIdOptions = ref([]);
const farmerIdList = ref<any[]>([]);
const farmerIdLoading = ref(false);
const farmerIdRemoteMethod = async (query: string) => {
  if (query) {
    farmerIdLoading.value = true;
    try {
      const res = await autoCompleteFarmerId({
        farmerId: query?.trim(),
        pageNum: null,
        pageSize: null
      });

      farmerIdList.value = res.data;
      farmerIdOptions.value = farmerIdList.value.map((item) => ({
        value: item.farmerId,
        label: item.farmerId
      }));
    } catch (e) {
      console.error('autoCompleteFarmerId failed:', e);
      farmerIdList.value = [];
      farmerIdOptions.value = [];
    } finally {
      farmerIdLoading.value = false;
    }
  } else {
    farmerIdOptions.value = [];
  }
};

const queryParams = reactive<FarmlandQuery>({
  pageNum: 1,
  pageSize: 10,
  id: undefined,
  farmerId: undefined,
  kebeleId: undefined,
  gpsLat: undefined,
  gpsLong: undefined,
  gpsPolygon: undefined,
  areaTa: undefined,
  soilCode: undefined,
  irrigationCode: undefined,
  slopeClass: undefined,
  landUseType: undefined,
  landOwnershipType: undefined,
  slopeAspect: undefined,
  samplingDepth: undefined,
  landUseRecord: undefined,
  infrastructureAccessibility: undefined,
  elevationM: undefined,
  status: undefined,
  approvedBy: undefined,
  approvedTime: undefined,
  rejectionReason: undefined,
  createdUserName: undefined,
  createTime: undefined,
  params: {},
  orderByColumn: 'createTime',
  isAsc: 'desc'
});

const getList = async () => {
  loading.value = true;
  const res = await listFarmland(queryParams);
  farmlandList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleSelectionChange = (selection: FarmlandVO[]) => {
  ids.value = selection.map((item) => item.id);
};

const handleDelete = async (row?: FarmlandVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure delete this data?').finally(() => (loading.value = false));
  await delFarmland(_ids);
  proxy?.$modal.msgSuccess('Success');
  await getList();
};

const handleFarmerDetail = (row?: FarmlandVO) => {
  if (row?.farmerId) {
    router.push({ query: { view: 'farmerDetail', farmerId: row.farmerId } });
    viewMode.value = 'farmerDetail';
    detailFarmerId.value = row.farmerId;
  }
};

const backToList = () => {
  router.push({ query: {} });
  viewMode.value = 'list';
  detailFarmerId.value = '';
};

const isViewFlag = (data: FarmlandVO) => {
  return data.status == ApprovalStatus.Approved.toString() || data.status == ApprovalStatus.Rejected.toString();
};

onActivated(() => {
  getList();
});

onMounted(async () => {
  getSoilTypes();
  getIrrigationTypes();
  getList();
});
</script>
