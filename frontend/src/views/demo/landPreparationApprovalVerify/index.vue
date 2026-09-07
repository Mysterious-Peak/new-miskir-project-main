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
        </el-row>
      </template>

      <el-table v-loading="loading" :data="landPreparationApprovalVerifyList" @selection-change="handleSelectionChange" stripe fit border>
        <el-table-column
          label="Land Preparation Record ID"
          align="center"
          prop="landprepId"
          v-if="true"
          :min-width="getColumnWidth('Land Preparation Record ID')"
        />
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
        <el-table-column label="Approved By" align="center" prop="verifiedUserName" :min-width="getColumnWidth('Approved By')" />
        <el-table-column label="Approved Date" align="center" prop="verifiedAt" :min-width="getColumnWidth('Approved Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.verifiedAt, '{y}-{m}-{d}') }}</span>
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

<script setup name="LandPreparationApprovalVerify" lang="ts">
import {
  getLandPreparationApprovalVerify,
  delLandPreparationApprovalVerify,
  addLandPreparationApprovalVerify,
  updateLandPreparationApprovalVerify,
  listLandPreparationApprovalVerifyApprove
} from '@/api/demo/landPreparationApprovalVerify';
import { LandPreparationApprovalVerifyVO, LandPreparationApprovalVerifyQuery, LandPreparationApprovalVerifyForm } from '@/api/demo/landPreparationApprovalVerify/types';
import { listOperation } from '@/api/demo/landPreparationAdvanced';
import { LandPreparationOperationVO } from '@/api/demo/landPreparationAdvanced/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import { getColumnWidth } from '@/utils/utils';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { land_prep_date, land_method, land_machinery_used } = toRefs<any>(proxy?.useDict('land_prep_date', 'land_method', 'land_machinery_used'));
const landPreparationApprovalVerifyList = ref<LandPreparationApprovalVerifyVO[]>([]);
const operationList = ref<LandPreparationOperationVO[]>([]);
const operationCountMap = ref<Record<string, number>>({});
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const landPreparationApprovalVerifyFormRef = ref<ElFormInstance>();

const productionSeasonAllList = ref<LandPreparationApprovalVerifyVO[]>([]);
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
  const res = await listLandPreparationApprovalVerifyApprove();
  productionSeasonAllList.value = res.rows ?? [];
};

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: LandPreparationApprovalVerifyForm = {
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
const data = reactive<PageData<LandPreparationApprovalVerifyForm, LandPreparationApprovalVerifyQuery>>({
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
  const res = await listLandPreparationApprovalVerifyApprove(queryParams.value);
  landPreparationApprovalVerifyList.value = res.rows;
  total.value = res.total;
  loading.value = false;
  loadOperationCounts();
};

const loadOperationCounts = async () => {
  const map: Record<string, number> = {};
  for (const row of landPreparationApprovalVerifyList.value) {
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
  operationList.value = [];
  landPreparationApprovalVerifyFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: LandPreparationApprovalVerifyVO[]) => {
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
const handleUpdate = (row?: LandPreparationApprovalVerifyVO) => {
  const _landprepId = row?.landprepId || ids.value[0];
  router.push({ name: 'LandPreparationApprovalApprove', params: { id: _landprepId } });
};

/** Submit Button */
const submitForm = () => {
  landPreparationApprovalVerifyFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = ApprovalStatus.Approved.toString();
      const submitData = { ...form.value };
      if (form.value.landprepId) {
        await updateLandPreparationApprovalVerify(submitData).finally(() => (buttonLoading.value = false));
      } else {
        await addLandPreparationApprovalVerify(submitData).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

const rejectForm = () => {
  landPreparationApprovalVerifyFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.Rejected.toString();
      const submitData = { ...form.value };

      if (form.value.landprepId) {
        await updateLandPreparationApprovalVerify(submitData).finally(() => (buttonLoading.value = false));
      } else {
        await addLandPreparationApprovalVerify(submitData).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    }
  });
};

const RevisionForm = () => {
  landPreparationApprovalVerifyFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.NeedRevision.toString();
      const submitData = { ...form.value };

      if (form.value.landprepId) {
        await updateLandPreparationApprovalVerify(submitData).finally(() => (buttonLoading.value = false));
      } else {
        await addLandPreparationApprovalVerify(submitData).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    }
  });
};

/** Delete Button Action */
const handleDelete = async (row?: LandPreparationApprovalVerifyVO) => {
  const _landprepIds = row?.landprepId || ids.value;
  await proxy?.$modal
    .confirm('Are you sure to delete the Land Preparation Record with ID "' + _landprepIds + '"?')
    .finally(() => (loading.value = false));
  await delLandPreparationApprovalVerify(_landprepIds);
  proxy?.$modal.msgSuccess('Delete successful');
  await getList();
};

/** Export Button Action */
const handleExport = () => {
  proxy?.download(
    'demo/landPreparationAdvancedApproval/verify/export',
    {
      ...queryParams.value
    },
    `landPreparationApprovalVerify_${new Date().getTime()}.xlsx`
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

const dictLabel = (dictList: any[], value: string) => {
  const item = dictList?.find((d: any) => d.value === value);
  return item?.label || value || '';
};

const isViewFlag = (data) => {
  return data.status == ApprovalStatus.Approved || data.status == ApprovalStatus.Rejected || data.status == ApprovalStatus.NeedRevision;
};
</script>

