<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Production Season ID" prop="prodSeasonId">
              <!-- <el-input v-model="queryParams.prodSeasonId" placeholder="Please input Production Season ID" clearable @keyup.enter="handleQuery" /> -->
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
            <!-- <el-form-item label="Preparation Method (e.g. Ploughing)" prop="method">
              <el-input
                v-model="queryParams.method"
                placeholder="Please enter Preparation Method (e.g. Ploughing)"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item> -->
            <!-- <el-form-item label="Machinery/Tools Used (e.g. Oxen)" prop="machineryUsed">
              <el-input
                v-model="queryParams.machineryUsed"
                placeholder="Please enter Machinery/Tools Used (e.g. Oxen)"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="Tillage Depth (cm)" prop="depthCm">
              <el-input v-model="queryParams.depthCm" placeholder="Please enter Tillage Depth (cm)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Remarks" prop="remark">
              <el-input v-model="queryParams.remark" placeholder="Please enter Remarks" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Recorded By ID" prop="recordedBy">
              <el-input v-model="queryParams.recordedBy" placeholder="Please enter Recorded By ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Approved By ID" prop="verifiedBy">
              <el-input v-model="queryParams.verifiedBy" placeholder="Please enter Approved By ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Approved Date" prop="verifiedAt">
              <el-date-picker
                clearable
                v-model="queryParams.verifiedAt"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Please select Approved Date"
              />
            </el-form-item>
            <el-form-item label="Department ID" prop="deptId">
              <el-input v-model="queryParams.deptId" placeholder="Please enter Department ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-input v-model="queryParams.status" placeholder="请输入状态" clearable @keyup.enter="handleQuery" />
            </el-form-item>
             -->
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
          <!-- <el-col :span="1.5" style="margin-left: auto">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['demo:landPreparation:remove']"
              >Delete</el-button
            >
          </el-col> --> 
          <el-col :span="1.5" style="margin-left: auto; margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="landPreparationList" @selection-change="handleSelectionChange" stripe fit border>
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column
          label="Land Preparation Record ID"
          align="center"
          prop="landprepId"
          v-if="true"
          :min-width="getColumnWidth('Land Preparation Record ID')"
        />
        <el-table-column label="Production Season ID" align="center" prop="prodSeasonId" :min-width="getColumnWidth('Production Season ID')" />
        <el-table-column label="Preparation Date" align="center" prop="prepDate" :min-width="getColumnWidth('Preparation Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.prepDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Preparation Method" align="center" prop="method" :min-width="getColumnWidth('Preparation Method')">
          <template #default="scope">
            <dict-tag :options="land_method" :value="scope.row.method" />
          </template>
        </el-table-column>
        <el-table-column label="Machinery Used" align="center" prop="machineryUsed" :min-width="getColumnWidth('Machinery Used')">
          <template #default="scope">
            <dict-tag :options="land_machinery_used" :value="scope.row.machineryUsed" />
          </template>
        </el-table-column>
        <el-table-column label="Tillage Depth (cm)" align="center" prop="depthCm" :min-width="getColumnWidth('Tillage Depth (cm)')" />
        <el-table-column label="Remarks" align="center" prop="remark" :min-width="getColumnWidth('Remarks')" />
        <el-table-column label="Recorded By" align="center" prop="recordedUserName" :min-width="getColumnWidth('Recorded By')" />
        <el-table-column label="Create Date" align="center" prop="createTime" :min-width="getColumnWidth('Create Date')">
          <template #default="scope">
            <span v-if="isNew(scope.row.createTime)" class="font-black">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            <span v-else>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approved By" align="center" prop="verifiedUserName" :min-width="getColumnWidth('Approved By')" />
        <el-table-column label="Approved Date" align="center" prop="verifiedAt" :min-width="getColumnWidth('Approved Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.verifiedAt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approval Comment" align="center" prop="approvedComment" :min-width="getColumnWidth('Approval Comment')" />
        <!-- <el-table-column label="部门ID" align="center" prop="deptId" />
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="状态" align="center" prop="status" /> -->
        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')">
          <template #default="scope">
            <el-tag>{{ ApprovalStatus[scope.row.status as ApprovalStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Action" align="center" fixed="right" class-name="action-column" width="110">
          <template #default="scope">
            <el-button v-if="isViewFlag(scope.row)" class="table-action-btn table-check-btn" icon="View" @click="handleUpdate(scope.row)"
              >View</el-button
            >
            <el-button v-if="!isViewFlag(scope.row)" class="table-action-btn table-edit-btn" icon="EditPen" @click="handleUpdate(scope.row)"
              >Edit</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or Edit Land Preparation Record Dialog -->
  </div>
</template>

<script setup name="LandPreparation" lang="ts">
import { getCroppingPlan } from '@/api/demo/croppingPlan';
import {
  addLandPreparation,
  delLandPreparation,
  getLandPreparation,
  getLatestLandPreparationByProdSeason,
  listLandPreparation,
  updateLandPreparation
} from '@/api/demo/landPreparation';
import { listOperation } from '@/api/demo/landPreparationAdvanced';
import { LandPreparationForm, LandPreparationQuery, LandPreparationVO } from '@/api/demo/landPreparation/types';
import { listProductionSeason } from '@/api/demo/productionSeason';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';
import { useUserStore } from '@/store/modules/user';
import { isNew } from '@/utils/FarmTools';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const landPreparationList = ref<LandPreparationVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const operationCountMap = ref<Record<string, number>>({});

const queryFormRef = ref<ElFormInstance>();
const landPreparationFormRef = ref<ElFormInstance>();
const existingLandPreparation = ref<LandPreparationVO | null>(null);
const productionSeasonAllList = ref<LandPreparationVO[]>([]);
const productionSeasonOptions = ref([]);
const productionSeasonList = ref([]);
const productionSeasonLoading = ref(false);
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
    productionSeasonOptionsFilter.value = productionSeasonListFilter.value.map((item) => ({
      value: item,
      label: `${item}`
    }));
    productionSeasonLoadingFilter.value = false;
  } else {
    productionSeasonOptionsFilter.value = [];
  }
};

/** Load all land prep rows for local Production Season ID filter (dedupe via Set in remote method). */
const getAllList = async () => {
  const res = await listLandPreparation();
  productionSeasonAllList.value = res.rows ?? [];
};

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const { land_prep_date, land_method, land_machinery_used } = toRefs<any>(proxy?.useDict('land_prep_date', 'land_method', 'land_machinery_used'));

/** Store selected Production Season Year */
const selectedProductionSeasonYear = ref<number | undefined>(undefined);
/** Store selected Production Season Plan ID */
const selectedProductionSeasonPlanId = ref<number | string | undefined>(undefined);
/** Store planting window start and end dates */
const startDate = ref<string | undefined>(undefined);
const endDate = ref<string | undefined>(undefined);

/** Handle Production Season selection */
const handleProductionSeasonSelect = async (prodSeasonId: string | number) => {
  existingLandPreparation.value = null;
  // If prodSeasonId already has a value (user is reselecting), clear the date
  if (form.value.prodSeasonId) {
    form.value.prepDate = undefined;
  }

  // Find the selected Production Season from the list to get year and planId
  let selectedSeason = productionSeasonList.value.find((item: any) => item.prodSeasonId === prodSeasonId);

  // If not found in the list, try to fetch it
  if (!selectedSeason && prodSeasonId) {
    try {
      const res = await listProductionSeason({ pageNum: 1, pageSize: 10, prodSeasonId: String(prodSeasonId) });
      if (res.rows && res.rows.length > 0) {
        selectedSeason = res.rows[0];
        // Update the list for future use
        if (!productionSeasonList.value.find((item: any) => item.prodSeasonId === prodSeasonId)) {
          productionSeasonList.value.push(selectedSeason);
        }
      }
    } catch (error) {
      console.error('Failed to fetch Production Season:', error);
    }
  }

  if (!selectedSeason) {
    existingLandPreparation.value = null;
    selectedProductionSeasonYear.value = undefined;
    selectedProductionSeasonPlanId.value = undefined;
    startDate.value = undefined;
    endDate.value = undefined;
    return;
  }

  selectedProductionSeasonYear.value = selectedSeason.year ? parseInt(selectedSeason.year, 10) : undefined;
  selectedProductionSeasonPlanId.value = selectedSeason.planId;

  if (!form.value.landprepId) {
    try {
      const existingRes = await getLatestLandPreparationByProdSeason(prodSeasonId);
      if (existingRes.data) {
        existingLandPreparation.value = existingRes.data;
        const currentSeasonId = form.value.prodSeasonId;
        Object.assign(form.value, existingRes.data);
        form.value.landprepId = undefined;
        form.value.prodSeasonId = currentSeasonId;
        form.value.status = ApprovalStatus.Draft.toString();
        form.value.method = existingRes.data.method ? (String(existingRes.data.method).split(',').filter(Boolean) as any) : ([] as any);
        form.value.recordedBy = userStore.userId?.toString() || existingRes.data.recordedBy || '';
      }
    } catch {
      existingLandPreparation.value = null;
    }
  }

  // Call getCroppingPlan with planId
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

/** Disable selecting past date-time for Preparation Date and validate year */
const disabledPastDate = (time: Date) => {
  // If startDate and endDate are set, only allow dates within this range
  if (startDate.value && endDate.value) {
    const timeValue = time.getTime();
    const startTime = new Date(startDate.value).getTime();
    const endTime = new Date(endDate.value).getTime();

    // Determine the actual min and max dates (handle cases where start > end)
    const minTime = Math.min(startTime, endTime);
    const maxTime = Math.max(startTime, endTime);

    // Disable if time is outside the valid range
    if (timeValue < minTime || timeValue > maxTime) {
      return true;
    }
    // Allow dates within the range
    return false;
  }

  // If startDate and endDate are not set, disable all dates
  return true;
};

const initFormData: LandPreparationForm = {
  landprepId: undefined,
  prodSeasonId: undefined,
  prepDate: undefined,
  method: [] as any,
  machineryUsed: undefined,
  depthCm: undefined,
  remark: undefined,
  recordedBy: undefined,
  verifiedBy: undefined,
  verifiedAt: undefined,
  deptId: undefined,
  status: ApprovalStatus.Draft.toString(),
  approvedComment: undefined
};
const data = reactive<PageData<LandPreparationForm, LandPreparationQuery>>({
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
    landprepId: [{ required: true, message: 'Land preparation record ID cannot be empty', trigger: 'blur' }],
    prodSeasonId: [{ required: true, message: 'Related production season ID cannot be empty', trigger: 'blur' }],
    prepDate: [{ required: true, message: 'Preparation date cannot be empty', trigger: 'blur' }],
    method: [{ required: true, type: 'array', min: 1, message: 'Please select at least one preparation method', trigger: 'change' }],
    recordedBy: [{ required: true, message: 'Recorder ID cannot be empty', trigger: 'blur' }],
    status: [{ required: true, message: 'Status cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query Land Preparation Record List */
const getList = async () => {
  loading.value = true;
  const res = await listLandPreparation(queryParams.value);
  landPreparationList.value = res.rows;
  total.value = res.total;
  loading.value = false;
  loadOperationCounts();
};

const loadOperationCounts = async () => {
  const map: Record<string, number> = {};
  for (const row of landPreparationList.value) {
    try {
      const opRes: any = await listOperation(row.landprepId);
      map[row.landprepId] = (opRes?.rows || opRes?.data || opRes)?.length ?? 0;
    } catch {
      map[row.landprepId] = 0;
    }
  }
  operationCountMap.value = map;
};

/** Cancel Button */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** Form Reset */
const reset = () => {
  form.value = { ...initFormData };
  existingLandPreparation.value = null;
  selectedProductionSeasonYear.value = undefined;
  selectedProductionSeasonPlanId.value = undefined;
  startDate.value = undefined;
  endDate.value = undefined;
  landPreparationFormRef.value?.resetFields();
};

/** Search Button Action */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** Reset Button Action */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** Multi-select Change */
const handleSelectionChange = (selection: LandPreparationVO[]) => {
  ids.value = selection.map((item) => item.landprepId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** Add Button Action */
const handleAdd = () => {
  router.push({ name: 'LandPreparationAdd' });
};

/** Edit Button Action */
const handleUpdate = (row?: LandPreparationVO) => {
  const _landprepId = row?.landprepId || ids.value[0];
  if (row && isViewFlag(row)) {
    router.push({ name: 'LandPreparationDetail', params: { id: _landprepId } });
  } else {
    router.push({ name: 'LandPreparationEdit', params: { id: _landprepId } });
  }
};

/** Submit Button */
const submitForm = () => {
  landPreparationFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = ApprovalStatus.Draft.toString();
      // Convert method array to string if backend expects string
      const submitData = { ...form.value };
      if (Array.isArray(submitData.method)) {
        submitData.method = submitData.method.join(',') as any;
      }
      if (form.value.landprepId) {
        await updateLandPreparation(submitData).finally(() => (buttonLoading.value = false));
      } else {
        await addLandPreparation(submitData).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
      await getAllList();
    }
  });
};

/** Delete Button Action */
const handleDelete = async (row?: LandPreparationVO) => {
  const _landprepIds = row?.landprepId || ids.value;
  await proxy?.$modal
    .confirm('Are you sure to delete the Land Preparation Record with ID "' + _landprepIds + '"?')
    .finally(() => (loading.value = false));
  await delLandPreparation(_landprepIds);
  proxy?.$modal.msgSuccess('Delete successful');
  await getList();
};

/** Export Button Action */
const handleExport = () => {
  proxy?.download(
    'demo/landPreparation/export',
    {
      ...queryParams.value
    },
    `landPreparation_${new Date().getTime()}.xlsx`
  );
};

const handleView = async (row?: LandPreparationVO) => {
  reset();
  const _landprepId = row?.landprepId || ids.value[0];
  const res = await getLandPreparation(_landprepId);
  Object.assign(form.value, res.data);
  existingLandPreparation.value = null;
  // Convert method string to array if needed
  if (form.value.method && typeof form.value.method === 'string') {
    form.value.method = form.value.method.split(',').filter((item: string) => item.trim()) as any;
  } else if (!form.value.method) {
    form.value.method = [] as any;
  }
  dialog.visible = true;
  dialog.title = 'View Land Preparation Record';
};

const isViewFlag = (data) => {
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

