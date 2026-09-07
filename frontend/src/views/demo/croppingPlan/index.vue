<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Plan ID" prop="planId">
              <el-select
                v-model="queryParams.planId"
                filterable
                remote
                clearable
                reserve-keyword
                placeholder="Please input"
                :remote-method="planIdRemoteMethod"
                :loading="planIdLoading"
                :debounce="300"
              >
                <el-option v-for="item in planIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Plan Scope" prop="planScope">
              <el-select v-model="queryParams.planScope" placeholder="Please select" clearable>
                <el-option label="FarmLand" value="FARMLAND" />
                <el-option label="Cluster" value="CLUSTER" />
              </el-select>
            </el-form-item>
            <el-form-item label="FarmLand ID" prop="farmlandId">
              <!-- <el-input v-model="queryParams.farmlandId" placeholder="Please input FarmLand ID" clearable @keyup.enter="handleQuery" /> -->
              <el-select
                v-model="queryParams.farmlandId"
                filterable
                remote
                clearable
                reserve-keyword
                placeholder="Please input"
                :remote-method="farmLandRemoteMethod"
                :loading="farmLandLoading"
                :debounce="300"
              >
                <el-option v-for="item in farmLandOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Cluster ID" prop="clusterId">
              <el-select
                v-model="queryParams.clusterId"
                filterable
                remote
                clearable
                reserve-keyword
                placeholder="Please input"
                :remote-method="clusterRemoteMethod"
                :loading="clusterLoading"
                :debounce="300"
              >
                <el-option v-for="item in clusterOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Year" prop="year">
              <el-input prefix-icon="Search" v-model="queryParams.year" placeholder="Please input Year" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!-- <el-form-item label="Crop ID" prop="cropId">
              <el-input v-model="queryParams.cropId" placeholder="Please input Crop ID" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <el-form-item label="Crop Type" prop="cropCode">
              <!-- <el-select v-model="queryParams.cropId" placeholder="Please select" clearable>
                <el-option v-for="dict in cropDataList" :key="dict.id" :label="dict.cropName" :value="dict.id"></el-option>
              </el-select> -->
              <el-select
                v-model="queryParams.cropCode"
                filterable
                remote
                clearable
                reserve-keyword
                placeholder="Please input"
                :remote-method="cropCodeRemoteMethod"
                :loading="cropCodeLoading"
                :debounce="300"
              >
                <el-option v-for="item in cropCodeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="计划种植面积(公顷)" prop="plannedAreaTa">
              <el-input v-model="queryParams.plannedAreaTa" placeholder="请输入计划种植面积(公顷)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="计划总产量(公担)" prop="plannedYieldQt">
              <el-input v-model="queryParams.plannedYieldQt" placeholder="请输入计划总产量(公担)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="计划种植开始窗口" prop="plantingWindowStart">
              <el-date-picker
                clearable
                v-model="queryParams.plantingWindowStart"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择计划种植开始窗口"
              />
            </el-form-item>
            <el-form-item label="计划种植结束窗口" prop="plantingWindowEnd">
              <el-date-picker
                clearable
                v-model="queryParams.plantingWindowEnd"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择计划种植结束窗口"
              />
            </el-form-item>
            <el-form-item label="收获窗口开始" prop="harvestWindowStart">
              <el-date-picker
                clearable
                v-model="queryParams.harvestWindowStart"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择收获窗口开始"
              />
            </el-form-item>
            <el-form-item label="收获窗口结束" prop="harvestWindowEnd">
              <el-date-picker
                clearable
                v-model="queryParams.harvestWindowEnd"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择收获窗口结束"
              />
            </el-form-item>
            <el-form-item label="创建者" prop="daCreatedBy">
              <el-input v-model="queryParams.daCreatedBy" placeholder="请输入创建者" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="创建时间" prop="daCreatedAt">
              <el-date-picker clearable v-model="queryParams.daCreatedAt" type="date" value-format="YYYY-MM-DD" placeholder="请选择创建时间" />
            </el-form-item>
            <el-form-item label="批准人ID" prop="approvedBy">
              <el-input v-model="queryParams.approvedBy" placeholder="请输入批准人ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="批准时间" prop="approvedAt">
              <el-date-picker clearable v-model="queryParams.approvedAt" type="date" value-format="YYYY-MM-DD" placeholder="请选择批准时间" />
            </el-form-item>
            <el-form-item label="部门ID" prop="deptId">
              <el-input v-model="queryParams.deptId" placeholder="请输入部门ID" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" stripe fit border :data="croppingPlanList" @selection-change="handleSelectionChange">
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column label="Plan ID" align="center" prop="planId" v-if="true" :min-width="getColumnWidth('Plan ID')" />
        <el-table-column label="Plan Scope" align="center" prop="planScope" :min-width="getColumnWidth('Plan Scope')" />
        <el-table-column label="Cluster ID" align="center" prop="clusterId" :min-width="getColumnWidth('Cluster ID')" />
        <el-table-column label="Cluster Name" align="center" prop="clusterName" :min-width="getColumnWidth('Cluster Name')" />
        <el-table-column label="FarmLand ID" align="center" prop="farmlandId" :min-width="getColumnWidth('FarmLand ID')" />
        <el-table-column label="Season Name" align="center" prop="seasonName" :min-width="getColumnWidth('Season Name')" />
        <el-table-column label="Year" align="center" prop="year" :min-width="getColumnWidth('Year')" />
        <el-table-column
          label="Crop Type"
          align="center"
          prop="cropCode"
          :formatter="cropCodeNameFormatter"
          :min-width="getColumnWidth('Crop Type')"
        />
        <el-table-column label="Area(ha)" align="center" prop="plannedAreaTa" :min-width="getColumnWidth('Area(ha)')" />
        <el-table-column label="Anticipated Yield" align="center" prop="plannedYieldQt" :min-width="getColumnWidth('Anticipated Yield')" />
        <el-table-column
          label="Planting Window Start"
          align="center"
          prop="plantingWindowStart"
          width="180"
          :min-width="getColumnWidth('Planting Window Start')"
        >
          <template #default="scope">
            <span>{{ parseTime(scope.row.plantingWindowStart, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="Planting Window End"
          align="center"
          prop="plantingWindowEnd"
          width="180"
          :min-width="getColumnWidth('Planting Window End')"
        >
          <template #default="scope">
            <span>{{ parseTime(scope.row.plantingWindowEnd, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="Harvest Window Start"
          align="center"
          prop="harvestWindowStart"
          width="180"
          :min-width="getColumnWidth('Harvest Window Start')"
        >
          <template #default="scope">
            <span>{{ parseTime(scope.row.harvestWindowStart, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="Harvest Window End"
          align="center"
          prop="harvestWindowEnd"
          width="180"
          :min-width="getColumnWidth('Harvest Window End')"
        >
          <template #default="scope">
            <span>{{ parseTime(scope.row.harvestWindowEnd, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" align="center" prop="status" width="120" :min-width="getColumnWidth('Status')">
          <template #default="scope">
            <el-tag>{{ CroppingPlanApprovalStatus[scope.row.status as CroppingPlanApprovalStatus] }}</el-tag>
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
        <el-table-column label="Approved Date" align="center" prop="approvedAt" width="180" :min-width="getColumnWidth('Approved Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.approvedAt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approval Comment" align="center" prop="approvedComment" width="180" :min-width="getColumnWidth('Approval Comment')" />
        <el-table-column label="Actions" align="center" fixed="right" class-name="action-column" width="210">
          <template #default="scope">
            <el-button v-if="isViewFlag(scope.row)" class="table-action-btn table-check-btn" icon="View" @click="handleView(scope.row)"
              >View</el-button
            >
            <template v-else>
              <el-button class="table-action-btn table-edit-btn" icon="EditPen" @click="handleUpdate(scope.row)">Edit</el-button>
              <el-button class="table-action-btn table-delete-btn" icon="Delete" @click="handleDelete(scope.row)">Delete</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改种植计划对话框 -->
  </div>
</template>

<script setup name="CroppingPlan" lang="ts">
import { listCropMaster } from '@/api/demo/cropMaster';
import { addCroppingPlan, delCroppingPlan, getCroppingPlan, listCroppingPlan, updateCroppingPlan } from '@/api/demo/croppingPlan';
import { CroppingPlanForm, CroppingPlanQuery, CroppingPlanVO } from '@/api/demo/croppingPlan/types';
import { getClusterFarming, listClusterFarming } from '@/api/demo/clusterFarming';
import { ClusterFarmingVO } from '@/api/demo/clusterFarming/types';
import { getFarmland, listFarmland } from '@/api/demo/farmland';
import { FarmlandVO } from '@/api/demo/farmland/types';
import { listIrrigationTypeMaster } from '@/api/demo/irrigationTypeMaster';
import { IrrigationTypeMasterVO } from '@/api/demo/irrigationTypeMaster/types';
import { listSoilTypeMaster } from '@/api/demo/soilTypeMaster';
import { SoilTypeMasterVO } from '@/api/demo/soilTypeMaster/types';
import { listSeasonMaster } from '@/api/demo/seasonMaster';
import { listSoilProfile } from '@/api/demo/soilProfile';
import { CroppingPlanApprovalStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import { getColumnWidth } from '@/utils/utils';
import { selectDictLabel } from '@/utils/ruoyi';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { harvest_window_start, harvest_window_end, planting_window_end, planting_window_start, slope_class, land_use_type } = toRefs<any>(
  proxy?.useDict('harvest_window_start', 'harvest_window_end', 'planting_window_end', 'planting_window_start', 'slope_class', 'land_use_type')
);

const formatSlopeClassDisplay = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '';
  return selectDictLabel(slope_class.value, value as string) || '';
};

const formatLandUseTypeDisplay = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '';
  return selectDictLabel(land_use_type.value, value as string) || '';
};

const croppingPlanList = ref<CroppingPlanVO[]>([]);
const croppingPlanAllList = ref<CroppingPlanVO[]>([]);
const cropCodeNameMap = ref<Record<string, string>>({});
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const croppingPlanFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: CroppingPlanForm = {
  planId: undefined,
  planScope: 'FARMLAND',
  clusterId: undefined,
  clusterName: undefined,
  farmlandId: undefined,
  seasonId: undefined,
  year: undefined,
  cropCode: undefined,
  plannedAreaTa: undefined,
  plannedYieldQt: undefined,
  plantingWindowStart: undefined,
  plantingWindowEnd: undefined,
  harvestWindowStart: undefined,
  harvestWindowEnd: undefined,
  status: CroppingPlanApprovalStatus.Draft.toString(),
  createdUserName: undefined,
  createTime: undefined,
  approvedBy: undefined,
  approvedUserName: undefined,
  approvedAt: undefined,
  deptId: undefined,
  remark: undefined,
  seasonName: undefined,
  approvedComment: undefined
};

const farmLandOptions = ref([]);
const farmLandList = ref([]);
const farmLandLoading = ref(false);
const clusterOptions = ref<Array<{ value: string; label: string }>>([]);
const clusterLoading = ref(false);
const clusterInfoDisplay = ref<ClusterFarmingVO | null>(null);

const clusterRemoteMethod = async (query: string) => {
  if (query) {
    clusterLoading.value = true;
    const res = await listClusterFarming({ pageNum: 1, pageSize: 10, clusterId: query.trim() });
    clusterOptions.value = (res.rows || []).map((item) => ({
      value: item.clusterId,
      label: `${item.clusterId}${item.clusterName ? ` - ${item.clusterName}` : ''}`
    }));
    clusterLoading.value = false;
  } else {
    clusterOptions.value = [];
  }
};
const planIdOptions = ref([]);
const planIdList = ref([]);
const planIdLoading = ref(false);
const planIdRemoteMethod = async (query: string) => {
  if (query) {
    planIdLoading.value = true;
    planIdList.value = [
      ...new Set(croppingPlanAllList.value.filter((f) => f.planId?.toString().toLowerCase().includes(query.toLowerCase())).map((item) => item.planId))
    ];

    planIdOptions.value = planIdList.value.map((item) => ({
      value: item,
      label: `${item}`
    }));
    planIdLoading.value = false;
  } else {
    planIdOptions.value = [];
  }
};
const farmLandRemoteMethod = async (query: string) => {
  if (query) {
    farmLandLoading.value = true;
    farmLandList.value = [
      ...new Set(
        croppingPlanAllList.value
          .filter((f) => f.farmlandId && f.farmlandId.toString().toLowerCase().includes(query.toLowerCase()))
          .map((item) => item.farmlandId)
      )
    ];

    farmLandOptions.value = farmLandList.value.map((item) => ({
      value: item,
      label: item
    }));
    farmLandLoading.value = false;
  } else {
    farmLandOptions.value = [];
  }
};

const farmLandOptionsPop = ref([]);
const farmLandListPop = ref([]);
const farmLandLoadingPop = ref(false);
const farmLandRemoteMethodPop = async (query: string) => {
  if (query) {
    farmLandLoadingPop.value = true;

    const res = await listFarmland({ pageNum: 1, pageSize: null, id: query });
    farmLandListPop.value = res.rows;
    farmLandOptionsPop.value = res.rows.map((item) => ({
      value: item.id,
      label: `${item.id}`
    }));
    farmLandLoadingPop.value = false;
  } else {
    farmLandOptionsPop.value = [];
  }
};

/** Validate year - must be greater than or equal to current year */
const validateYear = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('Year can not be null'));
    return;
  }
  const currentYear = new Date().getFullYear();
  const inputYear = typeof value === 'number' ? value : parseInt(value, 10);
  // if (isNaN(inputYear)) {
  //   callback(new Error('Year must be a valid number'));
  //   return;
  // }
  if (inputYear < currentYear) {
    callback(new Error(`Year cannot be less than ${currentYear}`));
    return;
  }
  callback();
};

const data = reactive<PageData<CroppingPlanForm, CroppingPlanQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    planId: undefined,
    planScope: undefined,
    clusterId: undefined,
    farmlandId: undefined,
    seasonId: undefined,
    year: undefined,
    cropCode: undefined,
    plannedAreaTa: undefined,
    plannedYieldQt: undefined,
    plantingWindowStart: undefined,
    plantingWindowEnd: undefined,
    harvestWindowStart: undefined,
    harvestWindowEnd: undefined,
    status: undefined,
    createdUserName: undefined,
    createTime: undefined,
    approvedBy: undefined,
    approvedAt: undefined,
    deptId: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    // planId: [{ required: true, message: '自增ID不能为空', trigger: 'blur' }],

    planScope: [{ required: true, message: 'Plan Scope can not be null', trigger: 'change' }],
    farmlandId: [
      {
        validator: (_rule: any, value: any, callback: any) => {
          if (form.value.planScope !== 'CLUSTER' && !value) {
            callback(new Error('FarmLand ID can not be null'));
            return;
          }
          callback();
        },
        trigger: 'change'
      }
    ],
    clusterId: [
      {
        validator: (_rule: any, value: any, callback: any) => {
          if (form.value.planScope === 'CLUSTER' && !value) {
            callback(new Error('Cluster ID can not be null'));
            return;
          }
          callback();
        },
        trigger: 'change'
      }
    ],
    seasonId: [{ required: true, message: 'Season ID can not be null', trigger: 'blur' }],
    year: [
      { required: true, message: 'Year can not be null', trigger: 'blur' },
      { validator: validateYear, trigger: 'blur' }
    ],
    cropCode: [{ required: true, message: 'Crop Type can not be null', trigger: 'blur' }],
    plannedAreaTa: [{ required: true, message: 'Area can not be null', trigger: 'blur' }],
    plannedYieldQt: [{ required: true, message: 'Yield can not be null', trigger: 'blur' }],
    // plantingWindowStart: [{ required: true, message: 'Planting Window Start can not be null', trigger: 'blur' }],
    // plantingWindowEnd: [{ required: true, message: 'Planting Window End can not be null', trigger: 'blur' }],
    // harvestWindowStart: [{ required: true, message: 'Harvest Window Start can not be null', trigger: 'blur' }],
    // harvestWindowEnd: [{ required: true, message: 'Harvest Window End can not be null', trigger: 'blur' }]

    plantingWindowStart: [{ required: true, message: 'Planting Window Start can not be null', trigger: 'change' }],
    plantingWindowEnd: [{ required: true, message: 'Planting Window End can not be null', trigger: 'change' }],
    harvestWindowStart: [{ required: true, message: 'Harvest Window Start can not be null', trigger: 'change' }],
    harvestWindowEnd: [{ required: true, message: 'Harvest Window End can not be null', trigger: 'change' }]
    // daCreatedBy: [{ required: true, message: '创建者不能为空', trigger: 'blur' }],
    // daCreatedAt: [{ required: true, message: '创建时间不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const cropCodeOptions = ref([]);
const cropCodeList = ref([]);
const cropCodeLoading = ref(false);
const cropCodeRemoteMethod = async (query: string) => {
  if (query) {
    cropCodeLoading.value = true;
    const dedupMap = new Map<string, { cropCode: string; cropName: string }>();
    croppingPlanAllList.value
      .filter((f) => f.cropName.toString().toLowerCase().includes(query.toLowerCase()))
      .forEach((item) => {
        const code = item.cropCode;
        if (!code || dedupMap.has(code)) return;
        dedupMap.set(code, { cropCode: code, cropName: cropCodeNameMap.value[code] || code });
      });
    cropCodeList.value = Array.from(dedupMap.values());

    cropCodeOptions.value = cropCodeList.value.map((item) => ({
      value: item.cropCode,
      label: item.cropName
    }));
    cropCodeLoading.value = false;
  } else {
    cropCodeOptions.value = [];
  }
};

const cropCodeOptionsPopup = ref([]);
const cropCodeListPopup = ref([]);
const cropCodeLoadingPopup = ref(false);
const cropCodeRemoteMethodPopup = async (query: string) => {
  if (query) {
    cropCodeLoadingPopup.value = true;

    const res = await listCropMaster({ pageNum: 1, pageSize: 10, cropCode: query });
    cropCodeListPopup.value = res.rows;

    cropCodeOptionsPopup.value = res.rows.map((item) => ({
      value: item.cropCode,
      label: `${item.cropName}`
    }));
    cropCodeLoadingPopup.value = false;
  } else {
    cropCodeOptionsPopup.value = [];
  }
};

const plantStart_disabledDate = (time: Date) => {
  if (form.value.seasonName == 'Meher') {
    return !(time.getFullYear() == form.value.year && time.getMonth() + 1 == 5);
  } else if (form.value.seasonName == 'Belg') {
    return !(time.getFullYear() == form.value.year && time.getMonth() + 1 == 1);
  } else if (form.value.seasonName == 'Irrigation') {
    return !(time.getFullYear() == form.value.year && time.getMonth() + 1 == 9);
  }
  return true;
};
const plantStart_defaultDate = computed(() => {
  if (form.value.seasonName == 'Meher') {
    return new Date(form.value.year, 4, 1);
  } else if (form.value.seasonName == 'Belg') {
    return new Date(form.value.year, 0, 1);
  } else if (form.value.seasonName == 'Irrigation') {
    return new Date(form.value.year, 8, 1);
  }
  return new Date();
});
const plantEnd_disabledDate = (time: Date) => {
  if (form.value.seasonName == 'Meher') {
    return !(time.getFullYear() == form.value.year && time.getMonth() + 1 == 7);
  } else if (form.value.seasonName == 'Belg') {
    return !(time.getFullYear() == form.value.year && time.getMonth() + 1 == 3);
  } else if (form.value.seasonName == 'Irrigation') {
    return !(time.getFullYear() == form.value.year && time.getMonth() + 1 == 11);
  }
  return true;
};
const plantEnd_defaultDate = computed(() => {
  if (form.value.seasonName == 'Meher') {
    return new Date(form.value.year, 6, 1);
  } else if (form.value.seasonName == 'Belg') {
    return new Date(form.value.year, 2, 1);
  } else if (form.value.seasonName == 'Irrigation') {
    return new Date(form.value.year, 10, 1);
  }
  return new Date();
});
const harvestStart_disabledDate = (time: Date) => {
  if (form.value.seasonName == 'Meher') {
    return !(time.getFullYear() == form.value.year && time.getMonth() + 1 == 10);
  } else if (form.value.seasonName == 'Belg') {
    return !(time.getFullYear() == form.value.year && time.getMonth() + 1 == 5);
  } else if (form.value.seasonName == 'Irrigation') {
    return !(time.getFullYear() == form.value.year && time.getMonth() + 1 == 1);
  }
  return true;
};
const harvestStart_defaultDate = computed(() => {
  if (form.value.seasonName == 'Meher') {
    return new Date(form.value.year, 9, 1);
  } else if (form.value.seasonName == 'Belg') {
    return new Date(form.value.year, 4, 1);
  } else if (form.value.seasonName == 'Irrigation') {
    return new Date(form.value.year, 0, 1);
  }
  return new Date();
});
const harvestEnd_disabledDate = (time: Date) => {
  if (form.value.seasonName == 'Meher') {
    return !(time.getFullYear() == form.value.year && time.getMonth() + 1 == 12);
  } else if (form.value.seasonName == 'Belg') {
    return !(time.getFullYear() == form.value.year && time.getMonth() + 1 == 6);
  } else if (form.value.seasonName == 'Irrigation') {
    return !(time.getFullYear() == form.value.year && time.getMonth() + 1 == 2);
  }
  return true;
};
const harvestEnd_defaultDate = computed(() => {
  if (form.value.seasonName == 'Meher') {
    return new Date(form.value.year, 11, 1);
  } else if (form.value.seasonName == 'Belg') {
    return new Date(form.value.year, 5, 1);
  } else if (form.value.seasonName == 'Irrigation') {
    return new Date(form.value.year, 1, 1);
  }
  return new Date();
});

const onSeasonChange = (value) => {
  form.value.seasonName = seasonOptions.value.find((item) => item.value === value)?.label;
};

type SeasonHintKey = 'plantingStart' | 'plantingEnd' | 'harvestStart' | 'harvestEnd';

const SEASON_HINTS: Record<string, Record<SeasonHintKey, string>> = {
  Meher: {
    plantingStart: `Meher Planting Start
• Recommended: Late May
• Reference: ≥ May 25
Select a start date on or after this time.`,
    plantingEnd: `Meher Planting End
• Deadline: Mid-July
• Reference: ≤ July 15
Ensure sowing is completed by this date.`,
    harvestStart: `Meher Harvest Start
• Recommended: October
• Reference: ≥ Oct 1
Crops are typically ready for harvest from this date.`,
    harvestEnd: `Meher Harvest End
• Deadline: December
• Reference: ≤ Dec 31
All harvesting activities should be completed by this date.`
  },
  Belg: {
    plantingStart: `Belg Planting Start
• Recommended: January
• Reference: ≥ Jan 1
Begin planting as the short rains start.`,
    plantingEnd: `Belg Planting End
• Deadline: Early March
• Reference: ≤ Mar 10
The season is short; complete sowing early.`,
    harvestStart: `Belg Harvest Start
• Recommended: May
• Reference: ≥ May 1
Crops mature quickly; prepare to harvest.`,
    harvestEnd: `Belg Harvest End
• Deadline: June
• Reference: ≤ June 30
Finish harvesting before the dry season intensifies.`
  },
  Irrigation: {
    plantingStart: `Irrigation Season Start
• Recommended: September
• Reference: ≥ Sep 1
Utilize residual soil moisture or irrigation sources.`,
    plantingEnd: `Irrigation Season End
• Deadline: November
• Reference: ≤ Nov 30
Ensure crops have enough growth time before cold weather.`,
    harvestStart: `Irrigation Harvest Start
• Recommended: January
• Reference: ≥ Jan 1
Harvesting begins in the new year.`,
    harvestEnd: `Irrigation Harvest End
• Deadline: February
• Reference: ≤ Feb 28/29
Complete harvesting before the next Belg rains begin.`
  }
};

const getSeasonHint = (key: SeasonHintKey): string => {
  const seasonName = form.value.seasonName;
  if (!seasonName) return '';
  return SEASON_HINTS[seasonName]?.[key] ?? '';
};

const getSeasonHintHtml = (key: SeasonHintKey): string => {
  const text = getSeasonHint(key);
  return text ? text.replace(/\n/g, '<br/>') : '';
};

/** 查询种植计划列表 */
const getList = async () => {
  loading.value = true;
  const res = await listCroppingPlan(queryParams.value);
  croppingPlanList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

const getCropMasterList = async () => {
  const res = await listCropMaster({ pageNum: 1, pageSize: 1000 });
  const map: Record<string, string> = {};
  (res.rows || []).forEach((item) => {
    if (!item?.cropCode) return;
    map[item.cropCode] = item.cropName || item.cropCode;
  });
  cropCodeNameMap.value = map;
  if (croppingPlanAllList.value.length > 0) {
    croppingPlanAllList.value = attachCropName(croppingPlanAllList.value);
  }
};

const cropCodeNameFormatter = (row: CroppingPlanVO) => {
  const code = row?.cropCode;
  if (!code) return '';
  return cropCodeNameMap.value[code] || code;
};

const currentFarmlandTotalAreaTa = ref<number | null>(null);

/** Popup: read-only farmland detail (not part of cropping plan form submit) */
const farmlandInfoDisplay = ref<FarmlandVO | null>(null);
const soilTypeMasterList = ref<SoilTypeMasterVO[]>([]);
const irrigationTypeMasterList = ref<IrrigationTypeMasterVO[]>([]);

const loadSoilAndIrrigationMasters = async () => {
  const [soilRes, irrRes] = await Promise.all([
    listSoilTypeMaster({ pageNum: 1, pageSize: 2000 }),
    listIrrigationTypeMaster({ pageNum: 1, pageSize: 2000 })
  ]);
  soilTypeMasterList.value = soilRes.rows || [];
  irrigationTypeMasterList.value = irrRes.rows || [];
};

const getSoilNameByCode = (code?: string) => {
  if (!code) return '';
  return soilTypeMasterList.value.find((item) => item.soilCode === code)?.soilName || code;
};
const getIrrigationNameByCode = (code?: string) => {
  if (!code) return '';
  return irrigationTypeMasterList.value.find((item) => item.irrigationCode === code)?.irrigationName || code;
};

const formatFarmlandField = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '';
  return String(value);
};

const formatCoordinate = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(6) : String(value);
};

const formatAreaHa = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : String(value);
};

const loadFarmlandInfoDisplay = async (farmlandId?: string | number | null) => {
  if (!farmlandId) {
    farmlandInfoDisplay.value = null;
    return;
  }
  try {
    const res: any = await getFarmland(farmlandId);
    const data = res?.data ?? res;
    farmlandInfoDisplay.value = data || null;
  } catch {
    farmlandInfoDisplay.value = null;
  }
};

const loadClusterInfoDisplay = async (clusterId?: string | null) => {
  if (!clusterId) {
    clusterInfoDisplay.value = null;
    return;
  }
  try {
    const listRes = await listClusterFarming({ pageNum: 1, pageSize: 10, clusterId });
    const match = (listRes.rows || []).find((item) => item.clusterId === clusterId) || listRes.rows?.[0];
    if (!match?.id) {
      clusterInfoDisplay.value = null;
      return;
    }
    const res: any = await getClusterFarming(match.id);
    const data = res?.data ?? res;
    clusterInfoDisplay.value = data || null;
    form.value.clusterName = data?.clusterName || match.clusterName;
  } catch {
    clusterInfoDisplay.value = null;
  }
};

const getNumericValue = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const allocatedAreaTaExcludingCurrentPlan = computed(() => {
  if (!form.value.farmlandId || !form.value.year || !form.value.seasonId) return 0;
  return croppingPlanAllList.value
    .filter(
      (item) =>
        String(item.farmlandId) === String(form.value.farmlandId) &&
        String(item.year) === String(form.value.year) &&
        String(item.seasonId) === String(form.value.seasonId) &&
        String(item.planId) !== String(form.value.planId || '') &&
        item.status !== CroppingPlanApprovalStatus.Rejected.toString()
    )
    .reduce((sum, item) => sum + getNumericValue(item.plannedAreaTa), 0);
});

const remainingAreaBeforeCurrentInput = computed(() => {
  return getNumericValue(currentFarmlandTotalAreaTa.value) - allocatedAreaTaExcludingCurrentPlan.value;
});

const remainingAreaAfterCurrentInput = computed(() => {
  return remainingAreaBeforeCurrentInput.value - getNumericValue(form.value.plannedAreaTa);
});

const remainingAreaDisplay = computed(() => remainingAreaAfterCurrentInput.value.toFixed(2));

const clusterTotalAreaTa = computed(() => {
  const fromParcels = clusterInfoDisplay.value?.parcels?.reduce((sum, item) => sum + getNumericValue(item.areaTa), 0);
  if (fromParcels && fromParcels > 0) return fromParcels;
  return getNumericValue(clusterInfoDisplay.value?.totalAreaTa);
});

const clusterRemainingAreaAfterCurrentInput = computed(() => clusterTotalAreaTa.value - getNumericValue(form.value.plannedAreaTa));
const clusterRemainingAreaDisplay = computed(() => clusterRemainingAreaAfterCurrentInput.value.toFixed(2));
const remainingAreaIsNegative = computed(() =>
  form.value.planScope === 'CLUSTER'
    ? !!form.value.clusterId && clusterRemainingAreaAfterCurrentInput.value < 0
    : !!form.value.farmlandId && remainingAreaAfterCurrentInput.value < 0
);

const loadFarmlandTotalArea = async (farmlandId?: string | number) => {
  if (!farmlandId) {
    currentFarmlandTotalAreaTa.value = null;
    return;
  }
  const res = await listFarmland({ pageNum: 1, pageSize: 1, id: farmlandId });
  const match = (res.rows || []).find((item) => String(item.id) === String(farmlandId)) || res.rows?.[0];
  currentFarmlandTotalAreaTa.value = match ? getNumericValue(match.areaTa) : null;
};

watch(
  () => form.value.farmlandId,
  (value) => {
    if (form.value.planScope !== 'CLUSTER') {
      loadFarmlandTotalArea(value);
      loadFarmlandInfoDisplay(value);
    }
  }
);

watch(
  () => form.value.clusterId,
  (value) => {
    if (form.value.planScope === 'CLUSTER') {
      loadClusterInfoDisplay(value);
    }
  }
);

const attachCropName = (rows: CroppingPlanVO[] = []) => {
  return rows.map((item) => ({
    ...item,
    cropName: cropCodeNameMap.value[item.cropCode] || item.cropCode
  })) as CroppingPlanVO[];
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  farmlandInfoDisplay.value = null;
  clusterInfoDisplay.value = null;
  croppingPlanFormRef.value?.resetFields();
};

const handlePlanScopeChange = () => {
  if (form.value.planScope === 'CLUSTER') {
    form.value.farmlandId = undefined;
    farmlandInfoDisplay.value = null;
    currentFarmlandTotalAreaTa.value = null;
    loadClusterInfoDisplay(form.value.clusterId);
  } else {
    form.value.clusterId = undefined;
    form.value.clusterName = undefined;
    clusterInfoDisplay.value = null;
    loadFarmlandTotalArea(form.value.farmlandId);
    loadFarmlandInfoDisplay(form.value.farmlandId);
  }
};

const validateScopeAndArea = () => {
  if (form.value.planScope === 'CLUSTER') {
    if (!form.value.clusterId) {
      proxy?.$modal.msgError('Cluster ID can not be null');
      return false;
    }
    if (clusterTotalAreaTa.value <= 0) {
      proxy?.$modal.msgError('Cluster has no valid parcel area');
      return false;
    }
    if (clusterRemainingAreaAfterCurrentInput.value < 0) {
      proxy?.$modal.msgError('Planned area exceeds cluster total area');
      return false;
    }
    return true;
  }
  if (!form.value.farmlandId) {
    proxy?.$modal.msgError('FarmLand ID can not be null');
    return false;
  }
  if (remainingAreaAfterCurrentInput.value < 0) {
    proxy?.$modal.msgError('Planned area exceeds remaining farmland area');
    return false;
  }
  return true;
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  console.log('Query Params:', queryParams.value);
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: CroppingPlanVO[]) => {
  ids.value = selection.map((item) => item.planId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  router.push({ name: 'CroppingPlanAdd' });
};

/** 修改按钮操作 */
const handleUpdate = (row?: CroppingPlanVO) => {
  const _planId = row?.planId || ids.value[0];
  router.push({ name: 'CroppingPlanEdit', params: { id: _planId } });
};

const saveForm = () => {
  croppingPlanFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (!validateScopeAndArea()) return;
      buttonLoading.value = true;

      form.value.status = CroppingPlanApprovalStatus.Draft.toString();

      if (form.value.planId) {
        await updateCroppingPlan(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addCroppingPlan(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      dialog.visible = false;
      await getList();
      await getAllList();
    }
  });
};

const submitForm = () => {
  croppingPlanFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (!validateScopeAndArea()) return;
      buttonLoading.value = true;

      form.value.status = CroppingPlanApprovalStatus.Submitted.toString();
      if (form.value.planId) {
        await updateCroppingPlan(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addCroppingPlan(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: CroppingPlanVO) => {
  const _planIds = row?.planId || ids.value;
  await proxy?.$modal.confirm('Are you sure delete this data?').finally(() => (loading.value = false));
  await delCroppingPlan(_planIds);
  proxy?.$modal.msgSuccess('success');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'demo/croppingPlan/export',
    {
      ...queryParams.value
    },
    `croppingPlan_${new Date().getTime()}.xlsx`
  );
};

const yearProxy = computed({
  get() {
    return form.value.year ? String(form.value.year) : '';
  },
  set(value) {
    form.value.year = value ? Number(value) : null;
  }
});

const handleView = (row?: CroppingPlanVO) => {
  const _planId = row?.planId || ids.value[0];
  router.push({ name: 'CroppingPlanDetail', params: { id: _planId } });
};

const isViewFlag = (data) => {
  return (
    data.status == CroppingPlanApprovalStatus.Submitted ||
    data.status == CroppingPlanApprovalStatus.Approved ||
    data.status == CroppingPlanApprovalStatus.Rejected
  );
};

const seasonOptions = ref([]);
const getSeasonList = async () => {
  const res = await listSeasonMaster();
  seasonOptions.value = res.rows.map((item) => ({
    value: item.id,
    label: item.seasonName
  }));
};

onMounted(async () => {
  await loadSoilAndIrrigationMasters();
  getSeasonList();
  getCropMasterList();
  getList();
  getAllList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});

/** Query All Soil Profile List */
const getAllList = async () => {
  loading.value = true;
  const res = await listCroppingPlan();
  croppingPlanAllList.value = attachCropName(res.rows || []);
  total.value = res.total;
  loading.value = false;
};
</script>

<style scoped>
:deep(.season-hint-tooltip) {
  max-width: 420px;
  white-space: pre-line;
  word-break: break-word;
  line-height: 1.5;
}

/* Wider label column + no wrap, avoid “Planting Window Start” etc. breaking in 2 columns */
.cropping-plan-dialog-form :deep(.el-form-item__label) {
  white-space: nowrap;
}

/* el-input disabled 默认用 var(--el-disabled-text-color)，需显式覆盖 */
.cropping-plan-dialog-form :deep(.remaining-area-negative.el-input.is-disabled) {
  --el-disabled-text-color: var(--el-color-danger);
  --el-text-color-disabled: var(--el-color-danger);
  --el-input-text-color: var(--el-color-danger);
}
.cropping-plan-dialog-form :deep(.remaining-area-negative.is-disabled .el-input__inner),
.cropping-plan-dialog-form :deep(.remaining-area-negative.is-disabled .el-input__wrapper) {
  color: var(--el-color-danger) !important;
  -webkit-text-fill-color: var(--el-color-danger) !important;
}
.cropping-plan-dialog-form :deep(.remaining-area-negative.is-disabled input) {
  color: var(--el-color-danger) !important;
  -webkit-text-fill-color: var(--el-color-danger) !important;
}

.cropping-dialog-section {
  padding: 12px 16px 4px;
  margin-bottom: 16px;
}
.cropping-dialog-section:last-of-type {
  margin-bottom: 0;
}
.cropping-dialog-section__title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  color: var(--el-text-color-primary);
}
</style>

