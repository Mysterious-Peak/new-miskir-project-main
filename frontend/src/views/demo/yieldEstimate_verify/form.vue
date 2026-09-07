<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="yieldEstimateFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="300px">
        <el-form-item label="Production Season ID" prop="prodSeasonId">
          <div v-if="isViewFlag(form)" class="flex gap-2 flex-1">
            <el-input v-model="form.prodSeasonId" placeholder="Please input Production Season ID" disabled />
            <!-- <SelectProductionSeason v-model="form.prodSeasonId"></SelectProductionSeason> -->
          </div>
          <el-input v-else v-model="form.prodSeasonId" placeholder="Please input Production Season ID" disabled />
        </el-form-item>
        <el-form-item label="Method" prop="method">
          <el-select v-model="form.method" placeholder="Please select" :disabled="true">
            <el-option v-for="dict in yield_estimate_method" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Anticipated Yield">
          <el-input-number
            style="width: 100%"
            :min="0"
            :max="9999999999.99"
            v-model="form.priviousPlannedEstimatedYieldQt"
            placeholder="Please enter Anticipated Yield"
            :disabled="true"
          />
        </el-form-item>
        <el-form-item label="Predicted Yield" prop="estimatedYieldQt">
          <el-input-number
            style="width: 100%"
            :min="0"
            :max="9999999999.99"
            v-model="form.estimatedYieldQt"
            placeholder="Please enter Predicted Yield"
            :disabled="true"
          />
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment">
          <el-input
            v-model="form.approvedComment"
            type="textarea"
            placeholder="Please input"
            :disabled="form.status != ApprovalStatus.Draft.toString()"
          />
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

<script setup name="YieldEstimateApproveForm" lang="ts">
import { getYieldEstimate, addYieldEstimate, updateYieldEstimate } from '@/api/demo/yieldEstimate';
import { YieldEstimateForm } from '@/api/demo/yieldEstimate/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { yield_estimate_method } = toRefs<any>(proxy?.useDict('yield_estimate_method'));

const pageLoading = ref(false);
const buttonLoading = ref(false);
const yieldEstimateFormRef = ref<ElFormInstance>();

const isApprove = computed(() => route.path.endsWith('/approve') || route.path.includes('/approve/'));
const isSubmit = computed(() => route.path.endsWith('/submit') || route.path.includes('/submit/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

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

const form = ref<YieldEstimateForm>({ ...initFormData });

const rules = {
  estimateId: [{ required: true, message: 'Estimate ID cannot be empty', trigger: 'blur' }],
  prodSeasonId: [{ required: true, message: 'Production Season ID cannot be empty', trigger: 'blur' }],
  estimateDate: [{ required: true, message: 'Estimate Date cannot be empty', trigger: 'blur' }],
  method: [{ required: true, message: 'Estimation Method cannot be empty', trigger: 'blur' }],
  estimatedYieldQt: [{ required: true, message: 'Predicted Yield cannot be empty', trigger: 'blur' }],
  recordedBy: [{ required: true, message: 'Recorded By ID cannot be empty', trigger: 'blur' }]
};

const isViewFlag = (data) => {
  return data.status == ApprovalStatus.Approved || data.status == ApprovalStatus.Rejected || data.status == ApprovalStatus.NeedRevision;
};

/** Load record for approve mode */
const loadRecord = async () => {
  if (!id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getYieldEstimate(id.value);
    Object.assign(form.value, res.data);
  } finally {
    pageLoading.value = false;
  }
};

/** Cancel / Close Button */
const cancel = () => {
  router.push(listPath.value);
};

/** Submit Button - Approval */
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
      router.push({ path: listPath.value, query: { refresh: '1' } });
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
      router.push({ path: listPath.value, query: { refresh: '1' } });
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
