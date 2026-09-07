<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="sessionFormRef" :model="form" label-width="auto" class="session-dialog-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Operation ID">
              <el-input v-model="form.sessionId" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Production Season ID">
              <el-input v-model="form.prodSeasonId" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Operation Date">
              <el-input :model-value="form.operationDate" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Plan ID">
              <el-input v-model="form.planId" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Farmland ID">
              <el-input v-model="form.farmlandId" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Crop Type">
              <el-input v-model="form.cropName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Season">
              <el-input v-model="form.seasonName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Year">
              <el-input v-model="form.year" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Area (ha)">
              <el-input v-model="form.areaTa" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Approval Comment" prop="approvedComment" class="mb-2">
          <el-input
            v-model="form.approvedComment"
            type="textarea"
            placeholder="Please input"
            :disabled="form.status != ApprovalStatus.Draft.toString()"
          />
        </el-form-item>

        <el-table stripe fit border :data="operationList" class="mt-2">
          <el-table-column label="Operation Type" align="center" prop="operationCode" :min-width="getColumnWidth('Operation Type')">
            <template #default="scope">
              <span>{{ operationLabel(scope.row.operationCode) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Input Type" align="center" prop="inputType" :min-width="getColumnWidth('Input Type')">
            <template #default="scope">
              <span>{{ inputTypeLabel(scope.row) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Quantity" align="center" prop="quantity" width="120" />
          <el-table-column label="Unit" align="center" prop="unit" width="120" />
          <el-table-column label="Remark" align="center" prop="remark" :min-width="getColumnWidth('Remark')" />
        </el-table>
      </el-form>
      <div class="form-footer">
        <template v-if="isApprove && form.status == ApprovalStatus.Draft.toString()">
          <el-button :loading="buttonLoading" type="primary" @click="submitApproval">Approval</el-button>
          <el-button :loading="buttonLoading" type="warning" @click="rejectApproval">Reject</el-button>
          <el-button :loading="buttonLoading" type="warning" @click="revisionApproval">Need Revision</el-button>
          <el-button @click="cancel">Cancel</el-button>
        </template>
        <el-button v-else @click="cancel">Close</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="FieldOperationSessionVerifyForm" lang="ts">
import { getFieldOperationSessionDetail, updateFieldOperationSessionApproval } from '@/api/demo/fieldOperationSession';
import { FieldOperationSessionItemForm, FieldOperationSessionPageForm } from '@/api/demo/fieldOperationSession/types';
import { listIrrigationTypeMaster } from '@/api/demo/irrigationTypeMaster';
import type { IrrigationTypeMasterVO } from '@/api/demo/irrigationTypeMaster/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const sessionFormRef = ref<ElFormInstance>();
const operationList = ref<FieldOperationSessionItemForm[]>([]);
const irrigationTypeMasterList = ref<IrrigationTypeMasterVO[]>([]);

const isApprove = computed(() => route.path.endsWith('/approve') || route.path.includes('/approve/'));
const isAction = computed(() => route.path.endsWith('/action') || route.path.includes('/action/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

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

const form = ref<FieldOperationSessionPageForm>({ ...initFormData });

const operationOptions = [
  { value: '0', label: 'FERT' },
  { value: '6', label: 'CHEM' },
  { value: '1', label: 'IRR' },
  { value: '2', label: 'WEED' }
];

const operationLabel = (code?: string) => operationOptions.find((item) => item.value === code)?.label ?? code;

const inputTypeLabel = (row: FieldOperationSessionItemForm) => {
  if (row.operationCode === '1' && row.inputType) {
    const fromMaster = irrigationTypeMasterList.value.find((item) => item.irrigationCode === row.inputType);
    return fromMaster?.irrigationName || row.inputType;
  }
  return row.inputType;
};

/** Load record for approve/detail mode */
const loadRecord = async () => {
  if (!id.value) {
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getFieldOperationSessionDetail(id.value);
    const detail = res.data;
    form.value.sessionId = detail.sessionId;
    form.value.prodSeasonId = detail.prodSeasonId;
    form.value.operationDate = detail.operationDate;
    form.value.status = detail.status;
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
  } finally {
    pageLoading.value = false;
  }
};

/** Cancel Button */
const cancel = () => {
  router.push(listPath.value);
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
    router.push({ path: listPath.value, query: { refresh: '1' } });
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
  await loadRecord();
});
</script>

<style scoped>
.form-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 0;
}
</style>
