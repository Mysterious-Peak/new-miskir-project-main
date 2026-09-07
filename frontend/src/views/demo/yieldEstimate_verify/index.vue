<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams"  label-position="top" class="search-section">
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
                clearable
              >
                <el-option v-for="item in productionSeasonOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Estimate Date" prop="estimateDate">
              <el-date-picker
                clearable
                v-model="queryParams.estimateDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Please select Estimate Date"
              />
            </el-form-item>
            <el-form-item label="Estimation Method" prop="method">
              <el-input prefix-icon="Search" v-model="queryParams.method" placeholder="Please enter Estimation Method" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!-- <el-form-item label="Estimated Yield (Quintal)" prop="estimatedYieldQt">
              <el-input
                v-model="queryParams.estimatedYieldQt"
                placeholder="Please enter Estimated Yield (Quintal)"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="Estimated Yield per ha (quintal/ha)" prop="estimatedYieldPerHa">
              <el-input
                v-model="queryParams.estimatedYieldPerHa"
                placeholder="Please enter Estimated Yield per ha (quintal/ha)"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="Confidence (Low/Medium/High)" prop="confidenceLevel">
              <el-input
                v-model="queryParams.confidenceLevel"
                placeholder="Please enter Confidence (Low/Medium/High)"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="Sample Area (m²)" prop="sampleAreaM2">
              <el-input v-model="queryParams.sampleAreaM2" placeholder="Please enter Sample Area (m²)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Sample Weight (kg)" prop="sampleWeightKg">
              <el-input v-model="queryParams.sampleWeightKg" placeholder="Please enter Sample Weight (kg)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Plant Count" prop="plantCount">
              <el-input v-model="queryParams.plantCount" placeholder="Please enter Plant Count" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Grain Moisture (%)" prop="grainMoisturePct">
              <el-input v-model="queryParams.grainMoisturePct" placeholder="Please enter Grain Moisture (%)" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:yieldEstimate:add']">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['demo:yieldEstimate:edit']">
              Edit
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['demo:yieldEstimate:remove']">
              Delete
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['demo:yieldEstimate:export']">Export</el-button>
          </el-col> -->
        </el-row>
      </template>

      <el-table v-loading="loading" :data="yieldEstimateList" @selection-change="handleSelectionChange" stripe fit border>
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column label="Estimate ID" align="center" prop="estimateId" v-if="true" :min-width="getColumnWidth('Estimate ID')" />
        <el-table-column label="Production Season ID" align="center" prop="prodSeasonId" :min-width="getColumnWidth('Production Season ID')" />
        <!-- <el-table-column label="Estimate Date" align="center" prop="estimateDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.estimateDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column> -->
        <el-table-column label="Preparation Method" align="center" prop="method" :min-width="getColumnWidth('Preparation Method')">
          <template #default="scope">
            <dict-tag :options="yield_estimate_method" :value="scope.row.method" />
          </template>
        </el-table-column>
        <el-table-column
          label="Anticipated Yield"
          align="center"
          prop="priviousPlannedEstimatedYieldQt"
          :min-width="getColumnWidth('Anticipated Yield')"
        />
        <el-table-column label="Predicted Yield" align="center" prop="estimatedYieldQt" :min-width="getColumnWidth('Predicted Yield')" />
        <el-table-column label="Recorded By" align="center" prop="recordedUserName" :min-width="getColumnWidth('Recorded By')" />
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
        <!-- <el-table-column label="Estimated Yield per ha (quintal/ha)" align="center" prop="estimatedYieldPerHa" />
        <el-table-column label="Confidence (Low/Medium/High)" align="center" prop="confidenceLevel" />
        <el-table-column label="Sample Area (m²)" align="center" prop="sampleAreaM2" />
        <el-table-column label="Sample Weight (kg)" align="center" prop="sampleWeightKg" />
        <el-table-column label="Plant Count" align="center" prop="plantCount" />
        <el-table-column label="Grain Moisture (%)" align="center" prop="grainMoisturePct" /> -->
        <!-- <el-table-column label="Department ID" align="center" prop="deptId" /> -->
        <!-- <el-table-column label="Remark" align="center" prop="remark" /> -->
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
    <!-- Add or Edit Yield Estimate Dialog -->
  </div>
</template>

<script setup name="YieldEstimate" lang="ts">
import {
  listYieldEstimate,
  getYieldEstimate,
  delYieldEstimate,
  addYieldEstimate,
  updateYieldEstimate,
  listYieldEstimateApprove
} from '@/api/demo/yieldEstimate';
import { YieldEstimateVO, YieldEstimateQuery, YieldEstimateForm } from '@/api/demo/yieldEstimate/types';
import SelectProductionSeason from '@/components/FarmLand/SelectProductionSeason.vue';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import { getColumnWidth } from '@/utils/utils';
import { listProductionSeason } from '@/api/demo/productionSeason';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { yield_estimate_method } = toRefs<any>(proxy?.useDict('yield_estimate_method'));

const yieldEstimateList = ref<YieldEstimateVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const yieldEstimateFormRef = ref<ElFormInstance>();
const productionSeasonOptions = ref([]);
const productionSeasonList = ref([]);
const yieldEstimateListAllList = ref([]);
const productionSeasonLoading = ref(false);
const productionSeasonRemoteMethod = async (query: string) => {
  if (query) {
    productionSeasonList.value = [
      ...new Set(
        yieldEstimateListAllList.value
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

const getAllList = async () => {
  const res = await listYieldEstimateApprove();
  yieldEstimateListAllList.value = res.rows;
};

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: YieldEstimateForm = {
  estimateId: undefined,
  prodSeasonId: undefined,
  estimateDate: undefined,
  method: undefined,
  priviousPlannedEstimatedYieldQt: undefined,
  estimatedYieldQt: undefined,
  estimatedYieldPerHa: undefined,
  confidenceLevel: undefined,
  sampleAreaM2: undefined,
  sampleWeightKg: undefined,
  plantCount: undefined,
  grainMoisturePct: undefined,
  recordedBy: undefined,
  deptId: undefined,
  remark: undefined,
  approvedComment: undefined
};
const data = reactive<PageData<YieldEstimateForm, YieldEstimateQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    prodSeasonId: undefined,
    estimateDate: undefined,
    method: undefined,
    priviousPlannedEstimatedYieldQt: undefined,
    estimatedYieldQt: undefined,
    estimatedYieldPerHa: undefined,
    confidenceLevel: undefined,
    sampleAreaM2: undefined,
    sampleWeightKg: undefined,
    plantCount: undefined,
    grainMoisturePct: undefined,
    recordedBy: undefined,
    deptId: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    estimateId: [{ required: true, message: 'Estimate ID cannot be empty', trigger: 'blur' }],
    prodSeasonId: [{ required: true, message: 'Production Season ID cannot be empty', trigger: 'blur' }],
    estimateDate: [{ required: true, message: 'Estimate Date cannot be empty', trigger: 'blur' }],
    method: [{ required: true, message: 'Estimation Method cannot be empty', trigger: 'blur' }],
    estimatedYieldQt: [{ required: true, message: 'Predicted Yield cannot be empty', trigger: 'blur' }],
    recordedBy: [{ required: true, message: 'Recorded By ID cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query Yield Estimate List */
const getList = async () => {
  loading.value = true;
  const res = await listYieldEstimateApprove(queryParams.value);
  yieldEstimateList.value = res.rows;
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
  yieldEstimateFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: YieldEstimateVO[]) => {
  ids.value = selection.map((item) => item.estimateId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** Add Button Action */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = 'Add Yield Estimate';
};

/** Edit Button Action */
const handleUpdate = async (row?: YieldEstimateVO) => {
  const _estimateId = row?.estimateId || ids.value[0];
  router.push({ name: 'YieldEstimateApprove', params: { id: _estimateId } });
};

/** Submit Button */
const submitForm = () => {
  yieldEstimateFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = ApprovalStatus.Approved.toString();
      if (form.value.estimateId) {
        await updateYieldEstimate(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addYieldEstimate(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

const RevisionForm = () => {
  yieldEstimateFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.NeedRevision.toString();

      if (form.value.estimateId) {
        await updateYieldEstimate(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addYieldEstimate(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    }
  });
};

const rejectForm = () => {
  yieldEstimateFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.Rejected.toString();

      if (form.value.estimateId) {
        await updateYieldEstimate(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addYieldEstimate(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    }
  });
};

/** Delete Button Action */
const handleDelete = async (row?: YieldEstimateVO) => {
  const _estimateIds = row?.estimateId || ids.value;
  await proxy?.$modal.confirm('Are you sure to delete the Yield Estimate with ID "' + _estimateIds + '"?').finally(() => {
    loading.value = false;
  });
  await delYieldEstimate(_estimateIds);
  proxy?.$modal.msgSuccess('Delete successful');
  await getList();
};

/** Export Button Action */
const handleExport = () => {
  proxy?.download(
    'demo/yieldEstimate/export',
    {
      ...queryParams.value
    },
    `yieldEstimate_${new Date().getTime()}.xlsx`
  );
};

const isViewFlag = (data) => {
  return data.status == ApprovalStatus.Approved || data.status == ApprovalStatus.Rejected || data.status == ApprovalStatus.NeedRevision;
};

onMounted(() => {
  getList();
  getAllList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});
</script>

