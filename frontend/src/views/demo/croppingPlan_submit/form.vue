<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="croppingPlanFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="auto">
        <el-form-item label="FarmLand ID" prop="farmlandId">
          <el-input v-model="form.farmlandId" placeholder="Please input FarmLand ID" disabled />
        </el-form-item>
        <el-form-item label="Season Name" prop="seasonName">
          <el-input v-model="form.seasonName" placeholder="Please input Season Name" disabled />
        </el-form-item>
        <el-form-item label="Year" prop="year">
          <el-input v-model="form.year" placeholder="Please input Year" disabled />
        </el-form-item>
        <el-form-item label="Crop Code" prop="cropCode">
          <el-input v-model="form.cropCode" placeholder="Please input Crop Code" disabled />
        </el-form-item>
        <el-form-item label="Area(ha)" prop="plannedAreaTa">
          <el-input v-model="form.plannedAreaTa" placeholder="Please input Area(ha)" disabled />
        </el-form-item>
        <el-form-item label="Anticipated Yield" prop="plannedYieldQt">
          <el-input v-model="form.plannedYieldQt" placeholder="Please input Anticipated Yield" disabled />
        </el-form-item>
        <el-form-item label="Planting Window Start" prop="plantingWindowStart">
          <el-date-picker
            clearable
            v-model="form.plantingWindowStart"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Planting Window Start"
            disabled
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Planting Window End" prop="plantingWindowEnd">
          <el-date-picker
            clearable
            v-model="form.plantingWindowEnd"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Planting Window End"
            disabled
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Harvest Window Start" prop="harvestWindowStart">
          <el-date-picker
            clearable
            v-model="form.harvestWindowStart"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Harvest Window Start"
            disabled
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Harvest Window End" prop="harvestWindowEnd">
          <el-date-picker
            clearable
            v-model="form.harvestWindowEnd"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Harvest Window End"
            disabled
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Created By" prop="createdUserName">
          <el-input v-model="form.createTime" placeholder="Please input Created By" disabled />
        </el-form-item>
        <el-form-item label="Create Date" prop="createTime">
          <el-date-picker clearable v-model="form.createTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Status" prop="status">
          <el-tag>{{ CroppingPlanApprovalStatus[form.status as unknown as CroppingPlanApprovalStatus] }}</el-tag>
        </el-form-item>
      </el-form>
      <div class="form-footer">
        <div class="dialog-footer">
          <el-button icon="SendPlane" :loading="buttonLoading" type="primary" @click="submitForm">Submit</el-button>
          <!-- <el-button :loading="buttonLoading" type="warning" @click="rejectForm">Reject</el-button> -->
          <el-button @click="cancel">Cancel</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup name="CroppingPlanSubmitForm" lang="ts">
import { addCroppingPlan, getCroppingPlan, updateCroppingPlan } from '@/api/demo/croppingPlan';
import { CroppingPlanForm } from '@/api/demo/croppingPlan/types';
import { CroppingPlanApprovalStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const croppingPlanFormRef = ref<ElFormInstance>();

const isApprove = computed(() => route.path.endsWith('/approve') || route.path.includes('/approve/'));
const isSubmit = computed(() => route.path.endsWith('/submit') || route.path.includes('/submit/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: CroppingPlanForm = {
  planId: undefined,
  farmlandId: undefined,
  seasonId: undefined,
  year: undefined,
  cropCode: undefined,
  plannedAreaTa: undefined,
  plannedYieldQt: undefined,
  plantingWindowStart: undefined,
  plantingWindowEnd: undefined,
  harvestWindowStart: undefined,
  harvestWindowEnd: undefined,
  status: undefined,
  createdUserName: undefined,
  createTime: undefined,
  approvedBy: undefined,
  approvedAt: undefined,
  deptId: undefined,
  remark: undefined
};

const form = ref<CroppingPlanForm>({ ...initFormData });

const rules = {
  farmlandId: [{ required: true, message: 'FarmLand ID can not be null', trigger: 'blur' }],
  seasonId: [{ required: true, message: 'Season ID can not be null', trigger: 'blur' }],
  year: [{ required: true, message: 'Year can not be null', trigger: 'blur' }],
  cropCode: [{ required: true, message: 'Crop Code can not be null', trigger: 'blur' }],
  plannedAreaTa: [{ required: true, message: 'Area can not be null', trigger: 'blur' }],
  plannedYieldQt: [{ required: true, message: 'Yield can not be null', trigger: 'blur' }],
  plantingWindowStart: [{ required: true, message: 'Planting Window Start can not be null', trigger: 'blur' }],
  plantingWindowEnd: [{ required: true, message: 'Planting Window End can not be null', trigger: 'blur' }],
  harvestWindowStart: [{ required: true, message: 'Harvest Window Start can not be null', trigger: 'blur' }],
  harvestWindowEnd: [{ required: true, message: 'Harvest Window End can not be null', trigger: 'blur' }]
};

/** Load record for submit mode */
const loadRecord = async () => {
  if (!id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getCroppingPlan(id.value);
    Object.assign(form.value, res.data);
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
  croppingPlanFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = CroppingPlanApprovalStatus.Submitted.toString();
      if (form.value.planId) {
        await updateCroppingPlan(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addCroppingPlan(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
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
