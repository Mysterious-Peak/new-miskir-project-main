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
          <!-- <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()"
              >Approval</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
              >Delete</el-button
            >
          </el-col> -->
        </el-row>
      </template>

      <el-table v-loading="loading" stripe fit border :data="croppingPlanList" @selection-change="handleSelectionChange">
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column label="Plan ID" align="center" prop="planId" v-if="true" :min-width="getColumnWidth('Plan ID')" />
        <el-table-column label="FarmLand ID" align="center" prop="farmlandId" :min-width="getColumnWidth('FarmLand ID')" />
        <el-table-column label="Season Name" align="center" prop="seasonName" :min-width="getColumnWidth('Season Name')" />
        <el-table-column label="Year" align="center" prop="year" :min-width="getColumnWidth('Year')" />
        <el-table-column label="Crop Type" align="center" prop="cropName" :min-width="getColumnWidth('Crop Type')" />
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
        <!-- <el-table-column label="Remark" align="center" prop="remark" /> -->
        <el-table-column label="Actions" align="center" fixed="right" class-name="action-column" width="110">
          <template #default="scope">
            <el-button
              class="table-action-btn table-check-btn"
              link
              icon="View"
              @click="handleUpdate(scope.row)"
              v-if="scope.row.status != CroppingPlanApprovalStatus.Submitted.toString()"
              >View</el-button
            >
            <el-button
              link
              class="table-action-btn table-edit-btn"
              icon="EditPen"
              @click="handleUpdate(scope.row)"
              v-if="scope.row.status == CroppingPlanApprovalStatus.Submitted.toString()"
              >Edit</el-button
            >
            <!-- <el-tooltip content="Delete" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" ></el-button>
            </el-tooltip> -->
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改种植计划对话框（布局与 croppingPlan 主表一致，审批页字段只读） -->
  </div>
</template>

<script setup name="CroppingPlan Approval" lang="ts">
import { delCroppingPlan, getCroppingPlan, listCroppingPlan } from '@/api/demo/croppingPlan';
import { CroppingPlanForm, CroppingPlanQuery, CroppingPlanVO } from '@/api/demo/croppingPlan/types';
import { getFarmland, listFarmland } from '@/api/demo/farmland';
import { FarmlandVO } from '@/api/demo/farmland/types';
import { listIrrigationTypeMaster } from '@/api/demo/irrigationTypeMaster';
import { IrrigationTypeMasterVO } from '@/api/demo/irrigationTypeMaster/types';
import { listSoilTypeMaster } from '@/api/demo/soilTypeMaster';
import { SoilTypeMasterVO } from '@/api/demo/soilTypeMaster/types';
import { CroppingPlanApprovalStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import request from '@/utils/request';
import { selectDictLabel } from '@/utils/ruoyi';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { harvest_window_start, harvest_window_end, planting_window_end, planting_window_start, slope_class, land_use_type } = toRefs<any>(
  proxy?.useDict('harvest_window_start', 'harvest_window_end', 'planting_window_end', 'planting_window_start', 'slope_class', 'land_use_type')
);

const croppingPlanList = ref<CroppingPlanVO[]>([]);
const croppingPlanAllList = ref<CroppingPlanVO[]>([]);
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
  approvedUserName: undefined,
  approvedAt: undefined,
  deptId: undefined,
  remark: undefined,
  approvedComment: undefined,
  seasonName: undefined
};
const data = reactive<PageData<CroppingPlanForm, CroppingPlanQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    planId: undefined,
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
    status: CroppingPlanApprovalStatus.Submitted.toString(),
    createdUserName: undefined,
    createTime: undefined,
    approvedBy: undefined,
    approvedAt: undefined,
    deptId: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
    // orderByColumn: undefined,
    // isAsc: undefined
  },
  rules: {
    // planId: [{ required: true, message: '自增ID不能为空', trigger: 'blur' }],

    farmlandId: [{ required: true, message: 'FarmLand ID can not be null', trigger: 'blur' }],
    seasonId: [{ required: true, message: 'Season ID can not be null', trigger: 'blur' }],
    year: [{ required: true, message: 'Year can not be null', trigger: 'blur' }],
    cropCode: [{ required: true, message: 'Crop Type can not be null', trigger: 'blur' }],
    plannedAreaTa: [{ required: true, message: 'Area can not be null', trigger: 'blur' }],
    plannedYieldQt: [{ required: true, message: 'Yield can not be null', trigger: 'blur' }],
    plantingWindowStart: [{ required: true, message: 'Planting Window Start can not be null', trigger: 'blur' }],
    plantingWindowEnd: [{ required: true, message: 'Planting Window End can not be null', trigger: 'blur' }],
    harvestWindowStart: [{ required: true, message: 'Harvest Window Start can not be null', trigger: 'blur' }],
    harvestWindowEnd: [{ required: true, message: 'Harvest Window End can not be null', trigger: 'blur' }]
    // daCreatedBy: [{ required: true, message: '创建者不能为空', trigger: 'blur' }],
    // daCreatedAt: [{ required: true, message: '创建时间不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const cropCodeOptions = ref([]);
const cropCodeLoading = ref(false);
const cropCodeRemoteMethod = async (query: string) => {
  if (query) {
    cropCodeLoading.value = true;
    cropCodeOptions.value = croppingPlanAllList.value
      .filter((f) => f.cropName?.toLowerCase().includes(query.toLowerCase()))
      .filter((item, index, self) => self.findIndex((t) => t.cropCode === item.cropCode) === index)
      .map((item) => ({
        value: item.cropCode,
        label: item.cropName
      }));
    cropCodeLoading.value = false;
  } else {
    cropCodeOptions.value = [];
  }
};

const farmLandOptions = ref([]);
const farmLandList = ref([]);
const farmLandLoading = ref(false);
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
        croppingPlanAllList.value.filter((f) => f.farmlandId.toString().toLowerCase().includes(query.toLowerCase())).map((item) => item.farmlandId)
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

/** 查询种植计划列表 */
const getList = async () => {
  loading.value = true;
  // const res = await listCroppingPlan(queryParams.value);
  const res = await request({
    url: '/demo/croppingPlan/list/approved',
    method: 'get',
    params: queryParams.value
  });
  croppingPlanList.value = res.rows;
  total.value = res.total;
  loading.value = false;
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
  currentFarmlandTotalAreaTa.value = null;
  croppingPlanFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
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
  reset();
  dialog.visible = true;
  dialog.title = 'Add cropping plan';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: CroppingPlanVO) => {
  const _planId = row?.planId || ids.value[0];
  router.push({ name: 'CroppingPlanApprove', params: { id: _planId } });
};

/** 提交按钮 */
const submitForm = () => {
  croppingPlanFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      await request({
        url: '/demo/croppingPlan/approve',
        method: 'post',
        data: { id: form.value.planId, comment: form.value.approvedComment }
      }).finally(() => (buttonLoading.value = false));

      proxy?.$modal.msgSuccess('success');
      dialog.visible = false;
      await getList();
    }
  });
};

const rejectForm = () => {
  croppingPlanFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      await request({
        url: '/demo/croppingPlan/reject',
        method: 'post',
        data: { id: form.value.planId }
      }).finally(() => (buttonLoading.value = false));

      proxy?.$modal.msgSuccess('success');
      dialog.visible = false;
      await getList();
    }
  });
};

const RevisionForm = () => {
  croppingPlanFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      await request({
        url: '/demo/croppingPlan/revision',
        method: 'post',
        data: { id: form.value.planId, comment: form.value.approvedComment }
      }).finally(() => (buttonLoading.value = false));

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

const isViewFlag = (data) => {
  return data.status != CroppingPlanApprovalStatus.Submitted.toString();
};

const yearProxy = computed({
  get() {
    return form.value.year ? String(form.value.year) : '';
  },
  set(value) {
    form.value.year = value ? Number(value) : null;
  }
});

const farmlandInfoDisplay = ref<FarmlandVO | null>(null);
const soilTypeMasterList = ref<SoilTypeMasterVO[]>([]);
const irrigationTypeMasterList = ref<IrrigationTypeMasterVO[]>([]);
const currentFarmlandTotalAreaTa = ref<number | null>(null);

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

const formatSlopeClassDisplay = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '';
  return selectDictLabel(slope_class.value, value as string) || '';
};

const formatLandUseTypeDisplay = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '';
  return selectDictLabel(land_use_type.value, value as string) || '';
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
    loadFarmlandTotalArea(value);
    loadFarmlandInfoDisplay(value);
  }
);

/** Query All Cropping Plan List (for Remaining Area calc) */
const getAllList = async () => {
  loading.value = true;
  const res = await listCroppingPlan();
  croppingPlanAllList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

onMounted(async () => {
  await loadSoilAndIrrigationMasters();
  getList();
  await getAllList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});
</script>

<style scoped>
.cropping-plan-dialog-form :deep(.el-form-item__label) {
  white-space: nowrap;
}

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
