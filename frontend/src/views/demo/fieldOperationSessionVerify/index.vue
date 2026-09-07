<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Operation ID" prop="sessionId">
              <el-select
                v-model="queryParams.sessionId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="sessionRemoteMethodFilter"
                :loading="sessionLoadingFilter"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in sessionOptionsFilter" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
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
            <el-form-item label="Operation Date" prop="operationDate">
              <el-date-picker clearable v-model="queryParams.operationDate" type="date" value-format="YYYY-MM-DD" placeholder="Please select" />
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

      <el-table v-loading="loading" stripe fit border :data="sessionList">
        <el-table-column label="Operation ID" align="center" prop="sessionId" :min-width="getColumnWidth('Operation ID')" />
        <el-table-column label="Production Season ID" align="center" prop="prodSeasonId" :min-width="getColumnWidth('Production Season ID')" />
        <el-table-column label="Operation Date" align="center" prop="operationDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.operationDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Farmland ID" align="center" prop="farmlandId" :min-width="getColumnWidth('Farmland ID')" />
        <el-table-column label="Crop Type" align="center" prop="cropName" :min-width="getColumnWidth('Crop Type')" />
        <el-table-column label="Operations" align="center" prop="operationCount" width="120" />
        <el-table-column label="Status" align="center" prop="status" width="120">
          <template #default="scope">
            <el-tag>{{ ApprovalStatus[scope.row.status as ApprovalStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Create By" align="center" prop="createdUserName" :min-width="getColumnWidth('Create By')" />
        <el-table-column label="Create Date" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approved By" align="center" prop="approvedUserName" :min-width="getColumnWidth('Approved By')" />
        <el-table-column label="Approved Date" align="center" prop="approvedAt" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.approvedAt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approval Comment" align="center" prop="approvedComment" :min-width="getColumnWidth('Approval Comment')" />
        <el-table-column label="Action" align="center" fixed="right" class-name="action-column" width="110">
          <template #default="scope">
            <el-button
              v-if="scope.row.status != ApprovalStatus.Draft.toString()"
              class="table-action-btn table-check-btn"
              icon="View"
              @click="handleOpen(scope.row)"
              >View</el-button
            >
            <el-button v-else class="table-action-btn table-edit-btn" icon="EditPen" @click="handleOpen(scope.row)">Edit</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="FieldOperationSession Approval" lang="ts">
import {
  autoCompleteFieldOperationSessionIdApproved,
  autoCompleteFieldOperationSessionProdSeasonIdApproved,
  getFieldOperationSessionDetail,
  listFieldOperationSessionApproved,
  updateFieldOperationSessionApproval
} from '@/api/demo/fieldOperationSession';
import {
  FieldOperationSessionItemForm,
  FieldOperationSessionPageForm,
  FieldOperationSessionQuery,
  FieldOperationSessionVO
} from '@/api/demo/fieldOperationSession/types';
import { listIrrigationTypeMaster } from '@/api/demo/irrigationTypeMaster';
import type { IrrigationTypeMasterVO } from '@/api/demo/irrigationTypeMaster/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';
import { parseTime } from '@/utils/ruoyi';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const sessionList = ref<FieldOperationSessionVO[]>([]);
const operationList = ref<FieldOperationSessionItemForm[]>([]);
const irrigationTypeMasterList = ref<IrrigationTypeMasterVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const sessionFormRef = ref<ElFormInstance>();
const dialog = reactive<DialogOption>({ visible: false, title: '' });

const initFormData: FieldOperationSessionPageForm = {
  sessionId: undefined,
  prodSeasonId: undefined,
  operationDate: undefined,
  planId: undefined,
  farmlandId: undefined,
  cropName: undefined,
  seasonName: undefined,
  year: undefined,
  areaTa: undefined,
  status: undefined,
  approvedComment: undefined
};

const data = reactive<PageData<FieldOperationSessionPageForm, FieldOperationSessionQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    sessionId: undefined,
    prodSeasonId: undefined,
    operationDate: undefined,
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {}
});

const { queryParams, form } = toRefs(data);

const operationOptions = [
  { value: '0', label: 'FERT' },
  { value: '6', label: 'CHEM' },
  { value: '1', label: 'IRR' },
  { value: '2', label: 'WEED' }
];

const sessionOptionsFilter = ref<{ value: string | number; label: string }[]>([]);
const sessionLoadingFilter = ref(false);
const sessionRemoteMethodFilter = async (query: string) => {
  if (query) {
    sessionLoadingFilter.value = true;
    try {
      const res = await autoCompleteFieldOperationSessionIdApproved({
        sessionIdLike: query.trim()
      });
      sessionOptionsFilter.value = (res.data || []).map((item) => ({
        value: item.sessionId!,
        label: `${item.sessionId}`
      }));
    } catch {
      sessionOptionsFilter.value = [];
    } finally {
      sessionLoadingFilter.value = false;
    }
  } else {
    sessionOptionsFilter.value = [];
  }
};

const productionSeasonOptionsFilter = ref<{ value: string | number; label: string }[]>([]);
const productionSeasonLoadingFilter = ref(false);
const productionSeasonRemoteMethodFilter = async (query: string) => {
  if (query) {
    productionSeasonLoadingFilter.value = true;
    try {
      const res = await autoCompleteFieldOperationSessionProdSeasonIdApproved({
        prodSeasonIdLike: query.trim()
      });
      productionSeasonOptionsFilter.value = (res.data || []).map((item) => ({
        value: item.prodSeasonId!,
        label: `${item.prodSeasonId}`
      }));
    } catch {
      productionSeasonOptionsFilter.value = [];
    } finally {
      productionSeasonLoadingFilter.value = false;
    }
  } else {
    productionSeasonOptionsFilter.value = [];
  }
};

const operationLabel = (code?: string) => operationOptions.find((item) => item.value === code)?.label ?? code;

const inputTypeLabel = (row: FieldOperationSessionItemForm) => {
  if (row.operationCode === '1' && row.inputType) {
    const fromMaster = irrigationTypeMasterList.value.find((item) => item.irrigationCode === row.inputType);
    return fromMaster?.irrigationName || row.inputType;
  }
  return row.inputType;
};

const getList = async () => {
  loading.value = true;
  const res = await listFieldOperationSessionApproved(queryParams.value);
  sessionList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

const reset = () => {
  form.value = { ...initFormData };
  operationList.value = [];
  sessionFormRef.value?.resetFields();
};

const cancel = () => {
  reset();
  dialog.visible = false;
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const loadSessionIntoForm = async (row: FieldOperationSessionVO) => {
  const res = await getFieldOperationSessionDetail(row.sessionId!);
  const detail = res.data;
  form.value.sessionId = detail.sessionId;
  form.value.prodSeasonId = detail.prodSeasonId;
  form.value.operationDate = detail.operationDate;
  form.value.status = row.status ?? detail.status;
  form.value.approvedComment = detail.approvedComment;
  form.value.planId = detail.context?.planId;
  form.value.farmlandId = detail.context?.farmlandId;
  form.value.cropName = detail.context?.cropName;
  form.value.seasonName = detail.context?.seasonName;
  form.value.year = detail.context?.year;
  form.value.areaTa = detail.context?.areaTa;
  operationList.value = (detail.operations || []).map((item) => ({
    ...item,
    quantity: item.quantity != null ? Number(item.quantity) : undefined
  }));
};

const handleOpen = (row: FieldOperationSessionVO) => {
  if (row.status == ApprovalStatus.Draft.toString()) {
    router.push({ name: 'FieldOperationSessionVerifyApprove', params: { id: row.sessionId! } });
  } else {
    router.push({ name: 'FieldOperationSessionVerifyDetail', params: { id: row.sessionId! } });
  }
};

const submitStatus = async (status: ApprovalStatus) => {
  if (!form.value.sessionId) {
    return;
  }
  buttonLoading.value = true;
  try {
    await updateFieldOperationSessionApproval({
      sessionId: form.value.sessionId,
      status: status.toString(),
      approvedComment: form.value.approvedComment
    });
    proxy?.$modal.msgSuccess('Success');
    dialog.visible = false;
    await getList();
  } finally {
    buttonLoading.value = false;
  }
};

const submitApproval = () => submitStatus(ApprovalStatus.Approved);
const rejectApproval = () => submitStatus(ApprovalStatus.Rejected);
const revisionApproval = () => submitStatus(ApprovalStatus.NeedRevision);

onMounted(async () => {
  const res = await listIrrigationTypeMaster();
  irrigationTypeMasterList.value = res.rows ?? [];
  await getList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});
</script>

