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
                clearable
              >
                <el-option v-for="item in productionSeasonOptions" :key="item.value" :label="item.label" :value="item.value" />
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
            <el-form-item label="Remark" prop="remark">
              <el-input v-model="queryParams.remark" placeholder="Please enter Remark" clearable @keyup.enter="handleQuery" />
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
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
              <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
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
          <!-- <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:landPreparation:add']">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['demo:landPreparation:edit']"
              >Edit</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['demo:landPreparation:remove']"
              >Delete</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['demo:landPreparation:export']">Export</el-button>
          </el-col> -->
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
        <el-table-column label="Remark" align="center" prop="remark" :min-width="getColumnWidth('Remark')" />
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
        <!-- <el-table-column label="部门ID" align="center" prop="deptId" />
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="状态" align="center" prop="status" /> -->
        <el-table-column label="Approval Comment" align="center" prop="approvedComment" :min-width="getColumnWidth('Approval Comment')" />
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
import {
  getLandPreparation,
  delLandPreparation,
  addLandPreparation,
  updateLandPreparation,
  listLandPreparationApprove
} from '@/api/demo/landPreparation';
import { LandPreparationVO, LandPreparationQuery, LandPreparationForm } from '@/api/demo/landPreparation/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import { getColumnWidth } from '@/utils/utils';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { land_prep_date, land_method, land_machinery_used } = toRefs<any>(proxy?.useDict('land_prep_date', 'land_method', 'land_machinery_used'));
const landPreparationList = ref<LandPreparationVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const landPreparationFormRef = ref<ElFormInstance>();

const productionSeasonAllList = ref<LandPreparationVO[]>([]);
const productionSeasonOptions = ref([]);
const productionSeasonList = ref([]);
const productionSeasonLoading = ref(false);
const productionSeasonRemoteMethod = async (query: string) => {
  if (query) {
    productionSeasonList.value = [
      ...new Set(
        productionSeasonAllList.value
          .filter((f) => f.prodSeasonId?.toString().toLowerCase().includes(query.toLowerCase()))
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
  const res = await listLandPreparationApprove();
  productionSeasonAllList.value = res.rows ?? [];
};

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: LandPreparationForm = {
  landprepId: undefined,
  prodSeasonId: undefined,
  prepDate: undefined,
  method: undefined,
  machineryUsed: undefined,
  depthCm: undefined,
  recordedBy: undefined,
  verifiedBy: undefined,
  verifiedAt: undefined,
  deptId: undefined,
  remark: undefined,
  status: undefined,
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
    status: ApprovalStatus.Draft.toString(),
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    landprepId: [{ required: true, message: 'Land preparation record ID cannot be empty', trigger: 'blur' }],
    prodSeasonId: [{ required: true, message: 'Related production season ID cannot be empty', trigger: 'blur' }],
    prepDate: [{ required: true, message: 'Preparation date cannot be empty', trigger: 'blur' }],
    method: [{ required: true, message: 'Preparation method (e.g. Ploughing) cannot be empty', trigger: 'blur' }],
    recordedBy: [{ required: true, message: 'Recorder ID cannot be empty', trigger: 'blur' }],
    status: [{ required: true, message: 'Status cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query Land Preparation Record List */
const getList = async () => {
  loading.value = true;
  const res = await listLandPreparationApprove(queryParams.value);
  landPreparationList.value = res.rows;
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
  reset();
  dialog.visible = true;
  dialog.title = 'Add Land Preparation Record';
};

/** Edit Button Action */
const handleUpdate = (row?: LandPreparationVO) => {
  const _landprepId = row?.landprepId || ids.value[0];
  router.push({ name: 'LandPreparationApprove', params: { id: _landprepId } });
};

/** Submit Button */
const submitForm = () => {
  landPreparationFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = ApprovalStatus.Approved.toString();
      const submitData = { ...form.value };
      if (Array.isArray(submitData.method)) {
        submitData.method = submitData.method.join(',') as any;
      }
      // form.value.verifiedAt = new Date().toLocaleString();
      if (form.value.landprepId) {
        await updateLandPreparation(submitData).finally(() => (buttonLoading.value = false));
      } else {
        await addLandPreparation(submitData).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

const rejectForm = () => {
  landPreparationFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.Rejected.toString();
      const submitData = { ...form.value };
      if (Array.isArray(submitData.method)) {
        submitData.method = submitData.method.join(',') as any;
      }

      if (form.value.landprepId) {
        await updateLandPreparation(submitData).finally(() => (buttonLoading.value = false));
      } else {
        await addLandPreparation(submitData).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    }
  });
};

const RevisionForm = () => {
  landPreparationFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.NeedRevision.toString();
      const submitData = { ...form.value };
      if (Array.isArray(submitData.method)) {
        submitData.method = submitData.method.join(',') as any;
      }

      if (form.value.landprepId) {
        await updateLandPreparation(submitData).finally(() => (buttonLoading.value = false));
      } else {
        await addLandPreparation(submitData).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
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

onMounted(() => {
  getAllList();
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

