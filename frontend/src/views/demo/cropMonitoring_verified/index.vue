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
                :remote-method="productionSeasonRemoteMethod"
                :loading="productionSeasonLoading"
                :debounce="300"
              >
                <el-option v-for="item in productionSeasonOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Monitoring Date" prop="monitoringDate">
              <el-date-picker
                clearable
                v-model="queryParams.monitoringDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Please select Monitoring Date"
              />
            </el-form-item>
            <el-form-item label="Crop Stage " prop="stageCode">
              <el-input prefix-icon="Search" v-model="queryParams.stageCode" placeholder="Please enter Crop Stage " clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!-- <el-form-item label="Plant Height (cm)" prop="plantHeightCm">
              <el-input v-model="queryParams.plantHeightCm" placeholder="Please enter Plant Height (cm)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Canopy Cover (%)" prop="canopyCoverPct">
              <el-input v-model="queryParams.canopyCoverPct" placeholder="Please enter Canopy Cover (%)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Stand Count per m²" prop="standCountM2">
              <el-input v-model="queryParams.standCountM2" placeholder="Please enter Stand Count per m²" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Leaf Area Index" prop="leafAreaIndex">
              <el-input v-model="queryParams.leafAreaIndex" placeholder="Please enter Leaf Area Index" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="NDVI" prop="ndvi">
              <el-input v-model="queryParams.ndvi" placeholder="Please enter NDVI" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Health Score (1-10)" prop="healthScore">
              <el-input v-model="queryParams.healthScore" placeholder="Please enter Health Score (1-10)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Soil Moisture (%)" prop="soilMoisturePct">
              <el-input v-model="queryParams.soilMoisturePct" placeholder="Please enter Soil Moisture (%)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Temperature (°C)" prop="temperatureC">
              <el-input v-model="queryParams.temperatureC" placeholder="Please enter Temperature (°C)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Observations" prop="observations">
              <el-input v-model="queryParams.observations" placeholder="Please enter Observations" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Photo URL" prop="photoUrl">
              <el-input v-model="queryParams.photoUrl" placeholder="Please enter Photo URL" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Recorded By ID" prop="recordedBy">
              <el-input v-model="queryParams.recordedBy" placeholder="Please enter Recorded By ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Department ID" prop="deptId">
              <el-input v-model="queryParams.deptId" placeholder="Please enter Department ID" clearable @keyup.enter="handleQuery" />
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
          <!-- <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:cropMonitoring:add']">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['demo:cropMonitoring:edit']"
              >Edit</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['demo:cropMonitoring:remove']"
              >Delete</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['demo:cropMonitoring:export']">Export</el-button>
          </el-col> -->
        </el-row>
      </template>

      <el-table v-loading="loading" :data="cropMonitoringList" @selection-change="handleSelectionChange" stripe fit border>
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column label="Monitoring ID" align="center" prop="monitorId" v-if="true" :min-width="getColumnWidth('Monitoring ID')" />
        <el-table-column label="Production Season ID" align="center" prop="prodSeasonId" :min-width="getColumnWidth('Production Season ID')" />
        <el-table-column label="Monitoring Date" align="center" prop="monitoringDate" :min-width="getColumnWidth('Monitoring Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.monitoringDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Crop Stage " align="center" prop="stageCode" :min-width="getColumnWidth('Crop Stage ')">
          <template #default="scope">
            <dict-tag :options="crop_monitoring_stage_code" :value="scope.row.stageCode" />
          </template>
        </el-table-column>
        <el-table-column label="Plant Height (cm)" align="center" prop="plantHeightCm" :min-width="getColumnWidth('Plant Height (cm)')" />
        <el-table-column label="Canopy Cover (%)" align="center" prop="canopyCoverPct" :min-width="getColumnWidth('Canopy Cover (%)')" />
        <el-table-column label="Stand Count per m²" align="center" prop="standCountM2" :min-width="getColumnWidth('Stand Count per m²')" />
        <!-- <el-table-column label="Leaf Area Index" align="center" prop="leafAreaIndex" />
        <el-table-column label="Chlorophyll Content" align="center" prop="chlorophyllContent" /> -->
        <el-table-column label="NDVI" align="center" prop="ndvi" :min-width="getColumnWidth('NDVI')" />
        <!-- <el-table-column label="Health Score (1-10)" align="center" prop="healthScore" />
        <el-table-column label="Soil Moisture (%)" align="center" prop="soilMoisturePct" />
        <el-table-column label="Temperature (°C)" align="center" prop="temperatureC" />
        <el-table-column label="Observations" align="center" prop="observations" /> -->
        <el-table-column label="Photo URL" align="center" prop="photoUrl" :min-width="getColumnWidth('Photo URL')">
          <template #default="scope">
            <image-preview :src="scope.row.photoUrlUrl" :width="150" :height="50" />
          </template>
        </el-table-column>
        <el-table-column label="Recorded By" align="center" prop="recordedUserName" :min-width="getColumnWidth('Recorded By')" />
        <!-- <el-table-column label="Department ID" align="center" prop="deptId" />
        <el-table-column label="Remark" align="center" prop="remark" /> -->
        <el-table-column label="Create Date" align="center" prop="createTime" :min-width="getColumnWidth('Create Date')">
          <template #default="scope">
            <span v-if="isNew(scope.row.createTime)" class="font-black">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            <span v-else>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approved By" align="center" prop="approvedUserName" :min-width="getColumnWidth('Approved By')" />
        <el-table-column label="Approved Date" align="center" prop="approvedAt" :min-width="getColumnWidth('Approved Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.approvedAt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approval Comment" align="center" prop="approvedComment" :min-width="getColumnWidth('Approval Comment')" />
        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')">
          <template #default="scope">
            <el-tag>{{ ApprovalStatus[scope.row.status as ApprovalStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" fixed="right" class-name="action-column" width="110">
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
    <!-- Add or Edit Crop Monitoring Record Dialog -->
  </div>
</template>

<script setup name="CropMonitoring" lang="ts">
import {
  listCropMonitoring,
  getCropMonitoring,
  delCropMonitoring,
  addCropMonitoring,
  updateCropMonitoring,
  listCropMonitoringApprove
} from '@/api/demo/cropMonitoring';
import { CropMonitoringVO, CropMonitoringQuery, CropMonitoringForm } from '@/api/demo/cropMonitoring/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { crop_monitoring_date, crop_monitoring_stage_code } = toRefs<any>(proxy?.useDict('crop_monitoring_date', 'crop_monitoring_stage_code'));

const cropMonitoringList = ref<CropMonitoringVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const cropMonitoringFormRef = ref<ElFormInstance>();
const productionSeasonOptions = ref([]);
const productionSeasonList = ref([]);
const productionSeasonAllList = ref([]);
const productionSeasonLoading = ref(false);
const productionSeasonRemoteMethod = async (query: string) => {
  if (query) {
    productionSeasonList.value = [
      ...new Set(
        productionSeasonAllList.value
          .filter((f) => f.prodSeasonId.toString().toLowerCase().includes(query.toLowerCase()))
          .map((item) => item.prodSeasonId)
      )
    ];
    productionSeasonLoading.value = true;
    productionSeasonOptions.value = productionSeasonList.value.map((item) => ({
      value: item,
      label: `${item}`
    }));
    productionSeasonLoading.value = false;
  } else {
    productionSeasonOptions.value = [];
  }
};

const getProductionSeasonAllList = async () => {
  const res = await listCropMonitoring({ pageNum: 1, pageSize: 2000, orderByColumn: 'createTime', isAsc: 'desc' });
  productionSeasonAllList.value = res.rows;
};

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: CropMonitoringForm = {
  monitorId: undefined,
  prodSeasonId: undefined,
  monitoringDate: undefined,
  stageCode: undefined,
  plantHeightCm: undefined,
  canopyCoverPct: undefined,
  standCountM2: undefined,
  leafAreaIndex: undefined,
  chlorophyllContent: undefined,
  ndvi: undefined,
  healthScore: undefined,
  soilMoisturePct: undefined,
  temperatureC: undefined,
  observations: undefined,
  photoUrl: undefined,
  recordedBy: undefined,
  deptId: undefined,
  remark: undefined,
  status: undefined,
  approvedComment: undefined
};
const data = reactive<PageData<CropMonitoringForm, CropMonitoringQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    prodSeasonId: undefined,
    monitoringDate: undefined,
    stageCode: undefined,
    plantHeightCm: undefined,
    canopyCoverPct: undefined,
    standCountM2: undefined,
    leafAreaIndex: undefined,
    chlorophyllContent: undefined,
    ndvi: undefined,
    healthScore: undefined,
    soilMoisturePct: undefined,
    temperatureC: undefined,
    observations: undefined,
    photoUrl: undefined,
    recordedBy: undefined,
    deptId: undefined,
    params: {},
    status: ApprovalStatus.Draft.toString(),
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    monitorId: [{ required: true, message: 'Monitoring ID cannot be empty', trigger: 'blur' }],
    prodSeasonId: [{ required: true, message: 'Production Season ID cannot be empty', trigger: 'blur' }],
    monitoringDate: [{ required: true, message: 'Monitoring Date cannot be empty', trigger: 'blur' }],
    stageCode: [{ required: true, message: 'Crop Stage  cannot be empty', trigger: 'blur' }],
    recordedBy: [{ required: true, message: 'Recorded By ID cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query Crop Monitoring Record List */
const getList = async () => {
  loading.value = true;
  const res = await listCropMonitoringApprove(queryParams.value);
  // cropMonitoringList.value = res.rows.filter((item: any) => item.status === '0');
  cropMonitoringList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** Cancel Button */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** Form Reset */
const reset = () => {
  form.value = { ...initFormData };
  cropMonitoringFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: CropMonitoringVO[]) => {
  ids.value = selection.map((item) => item.monitorId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** Add Button Action */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = 'Add Crop Monitoring Record';
};

/** Edit Button Action */
const handleUpdate = async (row?: CropMonitoringVO) => {
  const _monitorId = row?.monitorId || ids.value[0];
  router.push({ name: 'CropMonitoringApprove', params: { id: _monitorId } });
};

/** Submit Button */
const submitForm = () => {
  cropMonitoringFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = ApprovalStatus.Approved.toString();
      if (form.value.monitorId) {
        await updateCropMonitoring(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addCropMonitoring(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

const RevisionForm = () => {
  cropMonitoringFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.NeedRevision.toString();

      if (form.value.monitorId) {
        await updateCropMonitoring(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addCropMonitoring(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    }
  });
};

const rejectForm = () => {
  cropMonitoringFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.Rejected.toString();

      if (form.value.monitorId) {
        await updateCropMonitoring(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addCropMonitoring(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    }
  });
};

/** Delete Button Action */
const handleDelete = async (row?: CropMonitoringVO) => {
  const _monitorIds = row?.monitorId || ids.value;
  await proxy?.$modal
    .confirm('Are you sure to delete the Crop Monitoring Record with ID "' + _monitorIds + '"?')
    .finally(() => (loading.value = false));
  await delCropMonitoring(_monitorIds);
  proxy?.$modal.msgSuccess('Delete successful');
  await getList();
};

/** Export Button Action */
const handleExport = () => {
  proxy?.download(
    'demo/cropMonitoring/export',
    {
      ...queryParams.value
    },
    `cropMonitoring_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getProductionSeasonAllList();
  getList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});
const isViewFlag = (data) => {
  return data.status == ApprovalStatus.Approved || data.status == ApprovalStatus.Rejected || data.status == ApprovalStatus.NeedRevision;
};
</script>

