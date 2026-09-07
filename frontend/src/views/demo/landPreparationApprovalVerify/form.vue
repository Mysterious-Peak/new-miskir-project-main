<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- Add or Edit Land Preparation Record Dialog -->
      <el-form ref="landPreparationApprovalVerifyFormRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="Production Season ID" prop="prodSeasonId">
          <el-input v-model="form.prodSeasonId" placeholder="Please enter Production Season ID" disabled />
        </el-form-item>
        <el-form-item label="Preparation Date" prop="prepDate">
          <el-date-picker
            clearable
            v-model="form.prepDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="Please select Preparation Date"
            :disabled="true"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment">
          <el-input
            v-model="form.approvedComment"
            type="textarea"
            placeholder="Please input"
            :disabled="form.status != ApprovalStatus.Draft.toString()"
          />
        </el-form-item>
        <el-form-item v-if="operationList.length > 0" label="Operations">
          <el-table :data="operationList" stripe border max-height="250">
            <el-table-column label="Preparation Method" align="center" width="160">
              <template #default="scope">
                <span>{{ dictLabel(land_method, scope.row.method) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Machinery Used" align="center" width="140">
              <template #default="scope">
                <span>{{ dictLabel(land_machinery_used, scope.row.machineryUsed) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Tillage Depth (cm)" align="center" prop="depthCm" width="140" />
            <el-table-column label="Remarks" align="center" prop="remark" />
          </el-table>
        </el-form-item>
      </el-form>
      <div class="form-footer">
        <div class="dialog-footer" v-if="form.status && form.status == ApprovalStatus.Draft.toString()">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">Approval</el-button>
          <el-button :loading="buttonLoading" type="warning" @click="rejectForm">Reject</el-button>
          <el-button :loading="buttonLoading" type="warning" @click="RevisionForm">Need Revision</el-button>
          <el-button @click="cancel">Cancel</el-button>
        </div>
        <div class="dialog-footer" v-if="form.status != ApprovalStatus.Draft.toString()">
          <el-button @click="cancel">Close</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup name="LandPreparationApprovalVerifyForm" lang="ts">
import {
  addLandPreparationApprovalVerify,
  getLandPreparationApprovalVerify,
  updateLandPreparationApprovalVerify
} from '@/api/demo/landPreparationApprovalVerify';
import { LandPreparationApprovalVerifyForm } from '@/api/demo/landPreparationApprovalVerify/types';
import { listOperation } from '@/api/demo/landPreparationAdvanced';
import { LandPreparationOperationVO } from '@/api/demo/landPreparationAdvanced/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { land_prep_date, land_method, land_machinery_used } = toRefs<any>(proxy?.useDict('land_prep_date', 'land_method', 'land_machinery_used'));

const pageLoading = ref(false);
const buttonLoading = ref(false);
const landPreparationApprovalVerifyFormRef = ref<ElFormInstance>();
const operationList = ref<LandPreparationOperationVO[]>([]);

const isApprove = computed(() => route.path.endsWith('/approve') || route.path.includes('/approve/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');
const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

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

const form = ref<LandPreparationApprovalVerifyForm>({ ...initFormData });

const rules = {
  landprepId: [{ required: true, message: 'Land preparation record ID cannot be empty', trigger: 'blur' }],
  prodSeasonId: [{ required: true, message: 'Related production season ID cannot be empty', trigger: 'blur' }],
  prepDate: [{ required: true, message: 'Preparation date cannot be empty', trigger: 'blur' }],
  method: [{ required: true, message: 'Preparation method (e.g. Ploughing) cannot be empty', trigger: 'blur' }],
  recordedBy: [{ required: true, message: 'Recorder ID cannot be empty', trigger: 'blur' }],
  status: [{ required: true, message: 'Status cannot be empty', trigger: 'blur' }]
};

const dictLabel = (dictList: any[], value: string) => {
  const item = dictList?.find((d: any) => d.value === value);
  return item?.label || value || '';
};

/** Load record for approve mode */
const loadRecord = async () => {
  if (!id.value) return;
  pageLoading.value = true;
  try {
    const res = await getLandPreparationApprovalVerify(id.value);
    Object.assign(form.value, res.data);
    // Load operations
    try {
      const opRes = await listOperation(id.value);
      operationList.value = (opRes as any).data || [];
    } catch (e) {
      operationList.value = [];
    }
  } finally {
    pageLoading.value = false;
  }
};

/** Cancel Button */
const cancel = () => {
  router.push(listPath.value);
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
      router.push({ path: listPath.value, query: { refresh: '1' } });
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
      router.push({ path: listPath.value, query: { refresh: '1' } });
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
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

onMounted(() => {
  loadRecord();
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
