<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Production Season ID" prop="prodSeasonId">
              <el-select
                v-model="queryParams.prodSeasonId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="productionSeasonRemoteMethodFilter"
                :loading="productionSeasonLoadingFilter"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in productionSeasonOptionsFilter" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Preparation Date" prop="prepDate">
              <el-date-picker
                clearable
                v-model="queryParams.prepDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Please select Preparation Date"
              />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="landPreparationAdvancedList" @selection-change="handleSelectionChange" stripe fit border>
        <el-table-column label="Land Preparation Record ID" align="center" prop="landprepId" :min-width="getColumnWidth('Land Preparation Record ID')" />
        <el-table-column label="Production Season ID" align="center" prop="prodSeasonId" :min-width="getColumnWidth('Production Season ID')" />
        <el-table-column label="Plan ID" align="center" prop="planId" min-width="100" />
        <el-table-column label="FarmLand ID" align="center" prop="farmlandId" min-width="110" />
        <el-table-column label="Crop Type" align="center" prop="cropName" min-width="100" />
        <el-table-column label="Season" align="center" prop="seasonName" min-width="80" />
        <el-table-column label="Year" align="center" prop="year" min-width="70" />
        <el-table-column label="Area (ha)" align="center" prop="areaTa" min-width="90" />
        <el-table-column label="Preparation Date" align="center" prop="prepDate" :min-width="getColumnWidth('Preparation Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.prepDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Recorded By" align="center" prop="recordedUserName" :min-width="getColumnWidth('Recorded By')" />
        <el-table-column label="Create Date" align="center" prop="createTime" :min-width="getColumnWidth('Create Date')">
          <template #default="scope">
            <span v-if="isNew(scope.row.createTime)" class="font-black">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            <span v-else>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approval Comment" align="center" prop="approvedComment" :min-width="getColumnWidth('Approval Comment')" />
        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')">
          <template #default="scope">
            <el-tag>{{ ApprovalStatus[scope.row.status as ApprovalStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Operations" align="center" width="100">
          <template #default="scope">
            <span>{{ operationCountMap[scope.row.landprepId] ?? 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Action" align="center" fixed="right" class-name="action-column" width="110">
          <template #default="scope">
            <el-button v-if="isViewFlag(scope.row)" class="table-action-btn table-check-btn" icon="View" @click="handleUpdate(scope.row)">View</el-button>
            <el-button v-if="!isViewFlag(scope.row)" class="table-action-btn table-edit-btn" icon="EditPen" @click="handleUpdate(scope.row)">Edit</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>


    <!-- Add / Edit Land Preparation Record Dialog -->

    <!-- Add / Edit Operation Dialog -->
  </div>
</template>

<script setup name="LandPreparationAdvanced" lang="ts">
import { getCroppingPlan } from '@/api/demo/croppingPlan';
import { addLandPreparationAdvanced, delLandPreparationAdvanced, getLandPreparationAdvanced, listLandPreparationAdvanced, updateLandPreparationAdvanced, listOperation, addOperation, delOperationByLandprepId } from '@/api/demo/landPreparationAdvanced';
import { LandPreparationAdvancedForm, LandPreparationAdvancedQuery, LandPreparationAdvancedVO, LandPreparationOperationVO, LandPreparationOperationForm } from '@/api/demo/landPreparationAdvanced/types';
import { listProductionSeason } from '@/api/demo/productionSeason';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';
import { useUserStore } from '@/store/modules/user';
import { isNew } from '@/utils/FarmTools';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const landPreparationAdvancedList = ref<LandPreparationAdvancedVO[]>([]);
const operationCountMap = ref<Record<string, number>>({});
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const landPreparationAdvancedFormRef = ref<ElFormInstance>();
const operationFormRef = ref<ElFormInstance>();
const productionSeasonAllList = ref<LandPreparationAdvancedVO[]>([]);
const productionSeasonOptions = ref([]);
const productionSeasonList = ref([]);
const productionSeasonLoading = ref(false);

// Operation table data (client-side list before save)
const operationList = ref<(LandPreparationOperationVO & { _localId?: number })[]>([]);
let localIdCounter = 0;
const operationButtonLoading = ref(false);

// Method → Machinery mapping (using dict values)
const methodMachineryMap: Record<string, string[]> = {
  '0': ['1', '2'],       // Plowing → Tractor, Oxen
  '1': ['1', '2'],       // Harrowing → Tractor, Oxen
  '2': ['1'],            // Rotavating → Tractor
  '3': ['1', '2', '0'],  // Leveling → Tractor, Oxen, Hoe
  '4': ['1', '0'],       // Bed formation → Tractor, Hoe
  '5': ['0']             // Minimum disturbance → Hoe
};

const { land_prep_date, land_method, land_machinery_used } = toRefs<any>(proxy?.useDict('land_prep_date', 'land_method', 'land_machinery_used'));

const operationDialog = reactive<DialogOption>({
  visible: false,
  title: 'Add Operation'
});

const initOperationForm: LandPreparationOperationForm & { _editIndex?: number } = {
  operationId: undefined,
  landprepId: undefined,
  operationDate: undefined,
  method: '',
  machineryUsed: '',
  depthCm: undefined,
  remark: ''
};

const operationForm = ref<LandPreparationOperationForm & { _editIndex?: number }>({ ...initOperationForm });

const operationRules = {
  operationDate: [{ required: true, message: 'Operation date cannot be empty', trigger: 'change' }],
  method: [{ required: true, message: 'Preparation method cannot be empty', trigger: 'change' }],
  machineryUsed: [{ required: true, message: 'Machinery used cannot be empty', trigger: 'change' }]
};

// Allowed machinery based on selected method
const allowedMachinery = computed(() => {
  const method = operationForm.value.method;
  if (!method || !methodMachineryMap[method]) return [];
  const allowed = methodMachineryMap[method];
  return (land_machinery_used.value || []).filter((dict: any) => allowed.includes(dict.value));
});

const onMethodChange = () => {
  operationForm.value.machineryUsed = '';
};

const productionSeasonRemoteMethod = async (query: string) => {
  if (query) {
    productionSeasonLoading.value = true;
    const res = await listProductionSeason({ pageNum: 1, pageSize: 10, prodSeasonId: query });
    productionSeasonList.value = res.rows;
    productionSeasonOptions.value = res.rows.map((item) => ({
      value: item.prodSeasonId,
      label: `${item.prodSeasonId}`
    }));
    productionSeasonLoading.value = false;
  } else {
    productionSeasonOptions.value = [];
  }
};

const productionSeasonOptionsFilter = ref([]);
const productionSeasonListFilter = ref([]);
const productionSeasonLoadingFilter = ref(false);
const productionSeasonRemoteMethodFilter = async (query: string) => {
  if (query) {
    productionSeasonListFilter.value = [
      ...new Set(
        productionSeasonAllList.value
          .filter((f) => f.prodSeasonId?.toString().toLowerCase().includes(query.toLowerCase()))
          .map((item) => item.prodSeasonId)
      )
    ];
    productionSeasonLoadingFilter.value = true;
    productionSeasonOptionsFilter.value = productionSeasonListFilter.value.map((item) => ({ value: item, label: `${item}` }));
    productionSeasonLoadingFilter.value = false;
  } else {
    productionSeasonOptionsFilter.value = [];
  }
};

const getAllList = async () => {
  const res = await listLandPreparationAdvanced();
  productionSeasonAllList.value = res.rows ?? [];
};

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const selectedProductionSeasonYear = ref<number | undefined>(undefined);
const selectedProductionSeasonPlanId = ref<number | string | undefined>(undefined);
const startDate = ref<string | undefined>(undefined);
const endDate = ref<string | undefined>(undefined);

const handleProductionSeasonSelect = async (prodSeasonId: string | number) => {
  if (form.value.prodSeasonId) {
    form.value.prepDate = undefined;
  }
  let selectedSeason = productionSeasonList.value.find((item: any) => item.prodSeasonId === prodSeasonId);
  if (!selectedSeason && prodSeasonId) {
    try {
      const res = await listProductionSeason({ pageNum: 1, pageSize: 10, prodSeasonId: String(prodSeasonId) });
      if (res.rows && res.rows.length > 0) {
        selectedSeason = res.rows[0];
        if (!productionSeasonList.value.find((item: any) => item.prodSeasonId === prodSeasonId)) {
          productionSeasonList.value.push(selectedSeason);
        }
      }
    } catch (error) {
      console.error('Failed to fetch Production Season:', error);
    }
  }
  if (!selectedSeason) {
    selectedProductionSeasonYear.value = undefined;
    selectedProductionSeasonPlanId.value = undefined;
    startDate.value = undefined;
    endDate.value = undefined;
    return;
  }
  selectedProductionSeasonYear.value = selectedSeason.year ? parseInt(selectedSeason.year, 10) : undefined;
  selectedProductionSeasonPlanId.value = selectedSeason.planId;
  if (selectedProductionSeasonPlanId.value) {
    try {
      const res = await getCroppingPlan(selectedProductionSeasonPlanId.value.toString());
      const planData = res.data;
      if (planData) {
        startDate.value = planData.plantingWindowStart;
        endDate.value = planData.plantingWindowEnd;
      } else {
        startDate.value = undefined;
        endDate.value = undefined;
      }
    } catch (error) {
      console.error('Failed to get cropping plan:', error);
      startDate.value = undefined;
      endDate.value = undefined;
    }
  } else {
    startDate.value = undefined;
    endDate.value = undefined;
  }
};

const disabledPastDate = (time: Date) => {
  if (startDate.value && endDate.value) {
    const timeValue = time.getTime();
    const startTime = new Date(startDate.value).getTime();
    const endTime = new Date(endDate.value).getTime();
    const minTime = Math.min(startTime, endTime);
    const maxTime = Math.max(startTime, endTime);
    if (timeValue < minTime || timeValue > maxTime) return true;
    return false;
  }
  return true;
};

const initFormData: LandPreparationAdvancedForm = {
  landprepId: undefined,
  prodSeasonId: undefined,
  prepDate: undefined,
  method: [] as any,
  machineryUsed: undefined,
  depthCm: undefined,
  recordedBy: undefined,
  verifiedBy: undefined,
  verifiedAt: undefined,
  deptId: undefined,
  remark: undefined,
  status: ApprovalStatus.Draft.toString(),
  approvedComment: undefined
};
const data = reactive<PageData<LandPreparationAdvancedForm, LandPreparationAdvancedQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    prodSeasonId: undefined,
    prepDate: undefined,
    method: undefined,
    machineryUsed: undefined,
    depthCm: undefined,
    remark: undefined,
    recordedBy: undefined,
    verifiedBy: undefined,
    verifiedAt: undefined,
    deptId: undefined,
    status: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    prodSeasonId: [{ required: true, message: 'Related production season ID cannot be empty', trigger: 'blur' }],
    prepDate: [{ required: true, message: 'Preparation date cannot be empty', trigger: 'blur' }],
    recordedBy: [{ required: true, message: 'Recorder ID cannot be empty', trigger: 'blur' }],
    status: [{ required: true, message: 'Status cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const getList = async () => {
  loading.value = true;
  const res = await listLandPreparationAdvanced(queryParams.value);
  landPreparationAdvancedList.value = res.rows;
  total.value = res.total;
  loading.value = false;
  loadOperationCounts();
};

const loadOperationCounts = async () => {
  const map: Record<string, number> = {};
  for (const row of landPreparationAdvancedList.value) {
    try {
      const opRes: any = await listOperation(row.landprepId);
      map[row.landprepId] = (opRes?.rows || opRes?.data || opRes)?.length ?? 0;
    } catch {
      map[row.landprepId] = 0;
    }
  }
  operationCountMap.value = map;
};

const cancel = () => {
  reset();
  dialog.visible = false;
};

const reset = () => {
  form.value = { ...initFormData };
  operationList.value = [];
  selectedProductionSeasonYear.value = undefined;
  selectedProductionSeasonPlanId.value = undefined;
  startDate.value = undefined;
  endDate.value = undefined;
  landPreparationAdvancedFormRef.value?.resetFields();
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleSelectionChange = (selection: LandPreparationAdvancedVO[]) => {
  ids.value = selection.map((item) => item.landprepId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

const handleAdd = () => {
  router.push({ name: 'LandPreparationAdvancedAdd' });
};

const handleUpdate = (row?: LandPreparationAdvancedVO) => {
  const _landprepId = row?.landprepId || ids.value[0];
  if (isViewFlag(row)) {
    router.push({ name: 'LandPreparationAdvancedDetail', params: { id: _landprepId } });
  } else {
    router.push({ name: 'LandPreparationAdvancedEdit', params: { id: _landprepId } });
  }
};

// ==================== Operation CRUD ====================

const handleAddOperation = () => {
  operationForm.value = { ...initOperationForm, _editIndex: undefined };
  operationDialog.title = 'Add Operation';
  operationDialog.visible = true;
};

const handleEditOperation = (row: any, index: number) => {
  operationForm.value = {
    operationId: row.operationId,
    landprepId: row.landprepId || form.value.landprepId,
    // Legacy operation rows predate operation_date; use the parent date until
    // the row is explicitly updated with its own activity date.
    operationDate: row.operationDate || form.value.prepDate,
    method: row.method,
    machineryUsed: row.machineryUsed,
    depthCm: row.depthCm,
    remark: row.remark,
    _editIndex: index
  };
  operationDialog.title = 'Edit Operation';
  operationDialog.visible = true;
};

const handleDeleteOperation = (index: number) => {
  operationList.value.splice(index, 1);
};

const submitOperation = async () => {
  operationFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      operationButtonLoading.value = true;
      try {
        const data: any = { ...operationForm.value };
        if (data._editIndex !== undefined && data._editIndex !== null) {
          // Edit existing row in local list
          const idx = data._editIndex;
          delete data._editIndex;
          operationList.value[idx] = { ...data };
        } else {
          // Add new row to local list
          delete data._editIndex;
          data._localId = --localIdCounter;
          operationList.value.push(data);
        }
        operationDialog.visible = false;
      } finally {
        operationButtonLoading.value = false;
      }
    }
  });
};

const submitForm = () => {
  landPreparationAdvancedFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = ApprovalStatus.Draft.toString();
      const submitData: any = { ...form.value };
      if (Array.isArray(submitData.method)) {
        submitData.method = submitData.method.join(',');
      }
      try {
        if (form.value.landprepId) {
          await updateLandPreparationAdvanced(submitData);
        } else {
          const res = await addLandPreparationAdvanced(submitData);
          const newLandprepId = (res as any)?.data;
          if (newLandprepId) {
            form.value.landprepId = newLandprepId;
          }
        }
        // Batch save all operations
        const landprepId = form.value.landprepId;
        if (landprepId) {
          // Delete all existing operations for this record
          await delOperationByLandprepId(landprepId);
          // Re-insert all operations from local list
          for (const op of operationList.value) {
            await addOperation({
              landprepId,
              operationDate: op.operationDate || form.value.prepDate,
              method: op.method,
              machineryUsed: op.machineryUsed,
              depthCm: op.depthCm,
              remark: op.remark
            } as any);
          }
        }
        proxy?.$modal.msgSuccess('Operation successful');
        dialog.visible = false;
        await getList();
        await getAllList();
      } finally {
        buttonLoading.value = false;
      }
    }
  });
};

const handleDelete = async (row?: LandPreparationAdvancedVO) => {
  const _landprepIds = row?.landprepId || ids.value;
  await proxy?.$modal
    .confirm('Are you sure to delete the Land Preparation Record with ID "' + _landprepIds + '"?')
    .finally(() => (loading.value = false));
  await delLandPreparationAdvanced(_landprepIds);
  proxy?.$modal.msgSuccess('Delete successful');
  await getList();
};

const handleExport = () => {
  proxy?.download(
    'demo/landPreparationAdvanced/export',
    { ...queryParams.value },
    `landPreparationAdvanced_${new Date().getTime()}.xlsx`
  );
};

const dictLabel = (dictList: any[], value: string) => {
  const item = dictList?.find((d: any) => d.value === value);
  return item?.label || value || '';
};

const isViewFlag = (data: any) => {
  return data.status == ApprovalStatus.Approved || data.status == ApprovalStatus.Rejected;
};

onMounted(() => {
  getAllList();
  getList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});
</script>

