<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- Add or Edit Sowing Record Dialog -->
      <el-form ref="sowingFormRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="Production Season ID" prop="prodSeasonId">
          <div class="flex gap-2 flex-1">
            <el-input v-model="form.prodSeasonId" placeholder="Please enter Production Season ID" disabled />
            <!-- <SelectProductionSeasonPlaned v-model="form.prodSeasonId"></SelectProductionSeasonPlaned> -->
          </div>
        </el-form-item>
        <el-form-item label="Crop Type" prop="seedType">
          <el-select v-model="form.seedType" placeholder="Please select" :disabled="true">
            <el-option v-for="dict in dynamicSeedTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Variety name" prop="seedLotCode">
          <el-input v-model="form.seedLotCode" maxlength="30" disabled show-word-limit placeholder="Please enter Variety name" />
        </el-form-item>
        <el-form-item label="Quantity" prop="seedRateKg">
          <el-input-number style="width: 100%" :min="0" :max="99999999.99" disabled v-model="form.seedRateKg" placeholder="Please enter Quantity" />
        </el-form-item>
        <el-form-item label="Method" prop="method">
          <el-select v-model="form.method" placeholder="Please select" :disabled="true">
            <el-option v-for="dict in sowing_method" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="showSpacingFields" label="Row Spacing (cm)" prop="spacingCm" :required="showSpacingFields">
          <el-input-number
            style="width: 100%"
            disabled
            :model-value="form.spacingCm == null || form.spacingCm === '' ? undefined : Number(form.spacingCm)"
            placeholder="Please enter Spacing (cm)"
          />
        </el-form-item>
        <el-form-item v-if="showSpacingFields" label="Plant Spacing (cm)" prop="plantSpacingCm" :required="showSpacingFields">
          <el-input-number
            style="width: 100%"
            disabled
            :model-value="form.plantSpacingCm == null || form.plantSpacingCm === '' ? undefined : Number(form.plantSpacingCm)"
            placeholder="Please enter Plant Spacing (cm)"
          />
        </el-form-item>
        <el-form-item label="Sowing Date" prop="sowingDate">
          <el-date-picker
            clearable
            v-model="form.sowingDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="Please select Sowing Date"
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
        <!-- <el-form-item label="Recorded By ID" prop="recordedBy">
          <el-input v-model="form.recordedBy" maxlength="20" show-word-limit disabled placeholder="Please enter Recorded By ID" />
        </el-form-item> -->
        <!-- <el-form-item label="Department ID" prop="deptId">
          <el-input v-model="form.deptId" placeholder="Please enter Department ID" />
        </el-form-item>
        <el-form-item label="Remark" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="Please enter content" />
        </el-form-item> -->
        <!-- <el-form-item label="seedType" prop="seedType">
          <el-input v-model="form.seedType" type="textarea" placeholder="Please enter seed type" />
        </el-form-item> -->
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

<script setup name="SowingVerifiedForm" lang="ts">
import { addSowing, getSowing, updateSowing } from '@/api/demo/sowing';
import { SowingForm } from '@/api/demo/sowing/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';
import { getCropMaster } from '@/api/demo/cropMaster';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { sowing_variety_name, sowing_seed_type, sowing_method } = toRefs<any>(
  proxy?.useDict('sowing_variety_name', 'sowing_seed_type', 'sowing_method')
);

const getMethodKind = (method?: string | number) => {
  if (method === undefined || method === null || method === '') return '';
  const dictItem = sowing_method.value?.find((item: any) => String(item.value) === String(method));
  const text = (dictItem?.label || String(method)).toLowerCase();
  if (text.includes('broadcast')) return 'broadcast';
  if (text.includes('transplant')) return 'transplant';
  if (text.includes('row')) return 'row';
  return text;
};

const isSpacingRequired = (method?: string | number) => {
  const kind = getMethodKind(method);
  return kind === 'row' || kind === 'transplant';
};

const dynamicSeedTypeOptions = ref<any[]>([]);

/** Keep DB seedType value and backfill display option from Crop Master */
const ensureSeedTypeOptionByCurrentValue = async () => {
  const current = form.value.seedType;
  if (current === undefined || current === null || current === '') {
    dynamicSeedTypeOptions.value = [];
    return;
  }
  const value = String(current);
  try {
    const cropRes = await getCropMaster(value);
    const cropName = cropRes?.data?.cropName ? String(cropRes.data.cropName) : '';
    dynamicSeedTypeOptions.value = [{ label: cropName || value, value }];
  } catch (error) {
    console.error('Failed to backfill seedType option by current DB value:', value, error);
    dynamicSeedTypeOptions.value = [{ label: value, value }];
  }
};

const pageLoading = ref(false);
const buttonLoading = ref(false);
const sowingFormRef = ref<ElFormInstance>();

const isApprove = computed(() => route.path.endsWith('/approve') || route.path.includes('/approve/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');
const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: SowingForm = {
  sowingId: undefined,
  prodSeasonId: undefined,
  sowingDate: undefined,
  seedLotCode: undefined,
  seedType: undefined,
  seedRateKg: undefined,
  spacingCm: undefined,
  plantSpacingCm: undefined,
  method: undefined,
  recordedBy: undefined,
  deptId: undefined,
  remark: undefined,
  status: undefined,
  approvedComment: undefined
};

const form = ref<SowingForm>({ ...initFormData });

const rules = ref({
  sowingId: [{ required: true, message: 'Sowing Record ID cannot be empty', trigger: 'blur' }],
  prodSeasonId: [{ required: true, message: 'Production Season ID cannot be empty', trigger: 'blur' }],
  sowingDate: [{ required: true, message: 'Sowing Date cannot be empty', trigger: 'blur' }],
  seedLotCode: [{ required: true, message: 'Variety name cannot be empty', trigger: 'blur' }],
  seedType: [{ required: true, message: 'Crop Type cannot be empty', trigger: 'blur' }],
  seedRateKg: [{ required: true, message: 'Quantity cannot be empty', trigger: 'blur' }],
  method: [{ required: true, message: 'Method cannot be empty', trigger: 'blur' }],
  spacingCm: [],
  plantSpacingCm: [],
  recordedBy: [{ required: true, message: 'Recorded By ID cannot be empty', trigger: 'blur' }]
});

const showSpacingFields = computed(() => isSpacingRequired(form.value.method));

const syncSpacingFormRules = () => {
  if (isSpacingRequired(form.value.method)) {
    rules.value.spacingCm = [{ required: true, message: 'Row Spacing (cm) cannot be empty', trigger: ['blur', 'change'] }];
    rules.value.plantSpacingCm = [{ required: true, message: 'Plant Spacing (cm) cannot be empty', trigger: ['blur', 'change'] }];
  } else {
    rules.value.spacingCm = [];
    rules.value.plantSpacingCm = [];
  }
};

watch(
  () => [form.value.method, sowing_method.value],
  () => syncSpacingFormRules(),
  { deep: true }
);

/** Load record for approve mode */
const loadRecord = async () => {
  if (!id.value) return;
  pageLoading.value = true;
  try {
    const res = await getSowing(id.value);
    Object.assign(form.value, res.data);
    await ensureSeedTypeOptionByCurrentValue();
    syncSpacingFormRules();
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
  syncSpacingFormRules();
  sowingFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = ApprovalStatus.Approved.toString();
      // form.value.verifiedAt = new Date().toLocaleString();
      if (form.value.sowingId) {
        await updateSowing(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addSowing(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

const RevisionForm = () => {
  syncSpacingFormRules();
  sowingFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.NeedRevision.toString();

      if (form.value.sowingId) {
        await updateSowing(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addSowing(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

const rejectForm = () => {
  syncSpacingFormRules();
  sowingFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.Rejected.toString();

      if (form.value.sowingId) {
        await updateSowing(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addSowing(form.value).finally(() => (buttonLoading.value = false));
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
