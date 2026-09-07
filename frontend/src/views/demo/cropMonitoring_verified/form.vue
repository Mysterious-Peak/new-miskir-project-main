<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="cropMonitoringFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="auto">
        <el-form-item label="Production Season ID" prop="prodSeasonId">
          <div class="flex gap-2 flex-1">
            <el-input v-model="form.prodSeasonId" placeholder="Please enter Production Season ID" disabled />
            <!-- <SelectProductionSeason v-model="form.prodSeasonId"></SelectProductionSeason> -->
          </div>
        </el-form-item>
        <el-form-item label="Monitoring Date" prop="monitoringDate">
          <el-date-picker
            clearable
            v-model="form.monitoringDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Monitoring Date"
            :disabled="true"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Crop Stage" prop="stageCode">
          <el-select v-model="form.stageCode" placeholder="Please select" :disabled="true">
            <el-option v-for="dict in crop_monitoring_stage_code" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Plant Height (cm)" prop="plantHeightCm">
          <el-input-number style="width: 100%" :min="0" :max="999.99" disabled placeholder="Please enter Plant Height (cm)" type="number" />
        </el-form-item>
        <el-form-item label="Canopy Cover (%)" prop="canopyCoverPct">
          <el-input-number
            style="width: 100%"
            :min="0"
            :max="999.99"
            v-model="form.canopyCoverPct"
            placeholder="Please enter Canopy Cover (%)"
            type="number"
            disabled
          />
        </el-form-item>
        <el-form-item label="Stand Count per m虏" prop="standCountM2">
          <el-input-number
            style="width: 100%"
            :min="0"
            :max="9999.99"
            v-model="form.standCountM2"
            placeholder="Please enter Stand Count per m虏"
            type="number"
            disabled
          />
        </el-form-item>
        <el-form-item label="NDVI" prop="ndvi">
          <el-input-number style="width: 100%" :min="0" :max="9.999" v-model="form.ndvi" placeholder="Please enter NDVI" type="number" disabled />
        </el-form-item>
        <el-form-item label="Photo URL" prop="photoUrl">
          <!-- <el-input v-model="form.photoUrl" type="textarea" placeholder="Please enter content" /> -->
          <image-preview :src="(form as any).photoUrlUrl" :width="150" :height="150" />
        </el-form-item>
        <el-form-item label="Remark" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="Please enter content" disabled />
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

<script setup name="CropMonitoringApproveForm" lang="ts">
import { getCropMonitoring, addCropMonitoring, updateCropMonitoring } from '@/api/demo/cropMonitoring';
import { CropMonitoringForm } from '@/api/demo/cropMonitoring/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { crop_monitoring_stage_code } = toRefs<any>(proxy?.useDict('crop_monitoring_stage_code'));

const pageLoading = ref(false);
const buttonLoading = ref(false);
const cropMonitoringFormRef = ref<ElFormInstance>();

const isApprove = computed(() => route.path.endsWith('/approve') || route.path.includes('/approve/'));
const isSubmit = computed(() => route.path.endsWith('/submit') || route.path.includes('/submit/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

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

const form = ref<CropMonitoringForm>({ ...initFormData });

const rules = {
  monitorId: [{ required: true, message: 'Monitoring ID cannot be empty', trigger: 'blur' }],
  prodSeasonId: [{ required: true, message: 'Production Season ID cannot be empty', trigger: 'blur' }],
  monitoringDate: [{ required: true, message: 'Monitoring Date cannot be empty', trigger: 'blur' }],
  stageCode: [{ required: true, message: 'Crop Stage  cannot be empty', trigger: 'blur' }],
  recordedBy: [{ required: true, message: 'Recorded By ID cannot be empty', trigger: 'blur' }]
};

/** Load record for approve mode */
const loadRecord = async () => {
  if (!id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getCropMonitoring(id.value);
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
      router.push({ path: listPath.value, query: { refresh: '1' } });
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
      router.push({ path: listPath.value, query: { refresh: '1' } });
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
