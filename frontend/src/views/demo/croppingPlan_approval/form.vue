<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="croppingPlanFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="220px" class="cropping-plan-dialog-form">
        <div class="cropping-dialog-section cropping-dialog-section--farmland">
          <div class="cropping-dialog-section__title">Farm Land Information</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Farm Land ID" prop="farmlandId">
                <el-input v-model="form.farmlandId" placeholder="Please input" disabled class="!w-full" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Farmer ID">
                <el-input :model-value="formatFarmlandField(farmlandInfoDisplay?.farmerId)" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Kebele ID">
                <el-input :model-value="formatFarmlandField(farmlandInfoDisplay?.kebeleId)" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Latitude">
                <el-input :model-value="formatCoordinate(farmlandInfoDisplay?.gpsLat)" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Longitude">
                <el-input :model-value="formatCoordinate(farmlandInfoDisplay?.gpsLong)" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Area(ha)">
                <el-input :model-value="formatAreaHa(farmlandInfoDisplay?.areaTa)" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Soil Name">
                <el-input :model-value="getSoilNameByCode(farmlandInfoDisplay?.soilCode)" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Irrigation Name">
                <el-input :model-value="getIrrigationNameByCode(farmlandInfoDisplay?.irrigationCode)" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Slope Class">
                <el-input :model-value="formatSlopeClassDisplay(farmlandInfoDisplay?.slopeClass)" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Land Use Type">
                <el-input :model-value="formatLandUseTypeDisplay(farmlandInfoDisplay?.landUseType)" disabled />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <div class="cropping-dialog-section cropping-dialog-section--plan">
          <div class="cropping-dialog-section__title">Cropping Plan Information</div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Year" prop="year">
                <el-date-picker
                  v-model="yearProxy"
                  type="year"
                  format="YYYY"
                  value-format="YYYY"
                  placeholder="Pick a year"
                  disabled
                  class="!w-full"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Season" prop="seasonName">
                <el-input v-model="form.seasonName" placeholder="…" disabled class="!w-full" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Crop Type" prop="cropCode">
                <el-input v-model="form.cropCode" placeholder="Please input Crop Type" disabled class="!w-full" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Area(ha)" prop="plannedAreaTa">
                <el-input
                  :model-value="form.plannedAreaTa == null || form.plannedAreaTa === undefined ? '' : String(form.plannedAreaTa)"
                  disabled
                  class="!w-full"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Anticipated Yield" prop="plannedYieldQt">
                <el-input
                  :model-value="form.plannedYieldQt == null || form.plannedYieldQt === undefined ? '' : String(form.plannedYieldQt)"
                  disabled
                  class="!w-full"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Remaining Area (ha)">
                <el-input
                  :model-value="form.farmlandId ? remainingAreaDisplay : ''"
                  disabled
                  class="!w-full"
                  :class="form.farmlandId && remainingAreaAfterCurrentInput < 0 ? 'remaining-area-negative' : ''"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Planting Window Start" prop="plantingWindowStart">
                <el-date-picker
                  class="!w-full"
                  clearable
                  v-model="form.plantingWindowStart"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="Please select"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Planting Window End" prop="plantingWindowEnd">
                <el-date-picker
                  class="!w-full"
                  clearable
                  v-model="form.plantingWindowEnd"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="Please select"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Harvest Window Start" prop="harvestWindowStart">
                <el-date-picker
                  class="!w-full"
                  clearable
                  v-model="form.harvestWindowStart"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="Please select"
                  disabled
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Harvest Window End" prop="harvestWindowEnd">
                <el-date-picker
                  class="!w-full"
                  clearable
                  v-model="form.harvestWindowEnd"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="Please select"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" v-if="isViewFlag(form)">
            <el-col :span="12">
              <el-form-item label="Created By" prop="createdUserName">
                <el-input v-model="form.createdUserName" placeholder="Please input Created By" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Created Time" prop="createTime">
                <el-date-picker
                  class="!w-full"
                  clearable
                  v-model="form.createTime"
                  type="datetime"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  placeholder="Please select"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" v-if="isViewFlag(form)">
            <el-col :span="12">
              <el-form-item label="Approved By" prop="approvedUserName">
                <el-input v-model="form.approvedUserName" placeholder="Please input Approved By" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Approved Time" prop="approvedAt">
                <el-date-picker
                  class="!w-full"
                  clearable
                  v-model="form.approvedAt"
                  type="datetime"
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  placeholder="Please select"
                  disabled
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <el-form-item label="Approval Comment" prop="approvedComment">
          <el-input
            v-model="form.approvedComment"
            type="textarea"
            placeholder="Please input"
            :disabled="form.status != CroppingPlanApprovalStatus.Submitted.toString()"
          />
        </el-form-item>
        <!-- <el-form-item label="Approved By" prop="approvedBy">
          <el-input v-model="form.approvedBy" placeholder="Please input Approved By" />
        </el-form-item>
        <el-form-item label="Approved Date" prop="approvedAt">
          <el-date-picker clearable v-model="form.approvedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select">
          </el-date-picker>
        </el-form-item> -->

        <!-- <el-form-item label="Approval">
          <el-radio-group v-model="form.status">
            <el-radio :value="CroppingPlanApprovalStatus.Approved.toString()" size="large">Approval</el-radio>
            <el-radio :value="CroppingPlanApprovalStatus.Rejected.toString()" size="large">Reject</el-radio>
          </el-radio-group>
        </el-form-item> -->
        <!-- <el-form-item label="Status" prop="status">
          <el-tag>{{ CroppingPlanApprovalStatus[form.status as unknown as CroppingPlanApprovalStatus] }}</el-tag>
        </el-form-item> -->
      </el-form>
      <div class="form-footer">
        <div class="dialog-footer" v-if="form.status && form.status == CroppingPlanApprovalStatus.Submitted.toString()">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">Approval</el-button>
          <el-button :loading="buttonLoading" type="warning" @click="rejectForm">Reject</el-button>
          <el-button :loading="buttonLoading" type="warning" @click="RevisionForm">Need Revision</el-button>
          <el-button @click="cancel">Cancel</el-button>
        </div>
        <div class="dialog-footer" v-if="form.status != CroppingPlanApprovalStatus.Submitted.toString()">
          <el-button @click="cancel">Close</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup name="CroppingPlanApproveForm" lang="ts">
import { getCroppingPlan, listCroppingPlan } from '@/api/demo/croppingPlan';
import { CroppingPlanForm, CroppingPlanVO } from '@/api/demo/croppingPlan/types';
import { getFarmland, listFarmland } from '@/api/demo/farmland';
import { FarmlandVO } from '@/api/demo/farmland/types';
import { listIrrigationTypeMaster } from '@/api/demo/irrigationTypeMaster';
import { IrrigationTypeMasterVO } from '@/api/demo/irrigationTypeMaster/types';
import { listSoilTypeMaster } from '@/api/demo/soilTypeMaster';
import { SoilTypeMasterVO } from '@/api/demo/soilTypeMaster/types';
import { CroppingPlanApprovalStatus } from '@/enums/AgriculturalEnum';
import request from '@/utils/request';
import { selectDictLabel } from '@/utils/ruoyi';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { slope_class, land_use_type } = toRefs<any>(proxy?.useDict('slope_class', 'land_use_type'));

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
  approvedUserName: undefined,
  approvedAt: undefined,
  deptId: undefined,
  remark: undefined,
  approvedComment: undefined,
  seasonName: undefined
};

const form = ref<CroppingPlanForm>({ ...initFormData });

const rules = {
  farmlandId: [{ required: true, message: 'FarmLand ID can not be null', trigger: 'blur' }],
  seasonId: [{ required: true, message: 'Season ID can not be null', trigger: 'blur' }],
  year: [{ required: true, message: 'Year can not be null', trigger: 'blur' }],
  cropCode: [{ required: true, message: 'Crop Type can not be null', trigger: 'blur' }],
  plannedAreaTa: [{ required: true, message: 'Area can not be null', trigger: 'blur' }],
  plannedYieldQt: [{ required: true, message: 'Yield can not be null', trigger: 'blur' }],
  plantingWindowStart: [{ required: true, message: 'Planting Window Start can not be null', trigger: 'blur' }],
  plantingWindowEnd: [{ required: true, message: 'Planting Window End can not be null', trigger: 'blur' }],
  harvestWindowStart: [{ required: true, message: 'Harvest Window Start can not be null', trigger: 'blur' }],
  harvestWindowEnd: [{ required: true, message: 'Harvest Window End can not be null', trigger: 'blur' }]
};

const croppingPlanAllList = ref<CroppingPlanVO[]>([]);

const isViewFlag = (data) => {
  return data.status != CroppingPlanApprovalStatus.Submitted.toString();
};

const yearProxy = computed({
  get() {
    return form.value.year ? String(form.value.year) : '';
  },
  set(value) {
    form.value.year = value ? Number(value) : null;
  }
});

const farmlandInfoDisplay = ref<FarmlandVO | null>(null);
const soilTypeMasterList = ref<SoilTypeMasterVO[]>([]);
const irrigationTypeMasterList = ref<IrrigationTypeMasterVO[]>([]);
const currentFarmlandTotalAreaTa = ref<number | null>(null);

const loadSoilAndIrrigationMasters = async () => {
  const [soilRes, irrRes] = await Promise.all([
    listSoilTypeMaster({ pageNum: 1, pageSize: 2000 }),
    listIrrigationTypeMaster({ pageNum: 1, pageSize: 2000 })
  ]);
  soilTypeMasterList.value = soilRes.rows || [];
  irrigationTypeMasterList.value = irrRes.rows || [];
};

const getSoilNameByCode = (code?: string) => {
  if (!code) return '';
  return soilTypeMasterList.value.find((item) => item.soilCode === code)?.soilName || code;
};
const getIrrigationNameByCode = (code?: string) => {
  if (!code) return '';
  return irrigationTypeMasterList.value.find((item) => item.irrigationCode === code)?.irrigationName || code;
};

const formatFarmlandField = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '';
  return String(value);
};

const formatCoordinate = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(6) : String(value);
};

const formatAreaHa = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : String(value);
};

const formatSlopeClassDisplay = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '';
  return selectDictLabel(slope_class.value, value as string) || '';
};

const formatLandUseTypeDisplay = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '';
  return selectDictLabel(land_use_type.value, value as string) || '';
};

const loadFarmlandInfoDisplay = async (farmlandId?: string | number | null) => {
  if (!farmlandId) {
    farmlandInfoDisplay.value = null;
    return;
  }
  try {
    const res: any = await getFarmland(farmlandId);
    const data = res?.data ?? res;
    farmlandInfoDisplay.value = data || null;
  } catch {
    farmlandInfoDisplay.value = null;
  }
};

const getNumericValue = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const allocatedAreaTaExcludingCurrentPlan = computed(() => {
  if (!form.value.farmlandId || !form.value.year || !form.value.seasonId) return 0;
  return croppingPlanAllList.value
    .filter(
      (item) =>
        String(item.farmlandId) === String(form.value.farmlandId) &&
        String(item.year) === String(form.value.year) &&
        String(item.seasonId) === String(form.value.seasonId) &&
        String(item.planId) !== String(form.value.planId || '') &&
        item.status !== CroppingPlanApprovalStatus.Rejected.toString()
    )
    .reduce((sum, item) => sum + getNumericValue(item.plannedAreaTa), 0);
});

const remainingAreaBeforeCurrentInput = computed(() => {
  return getNumericValue(currentFarmlandTotalAreaTa.value) - allocatedAreaTaExcludingCurrentPlan.value;
});

const remainingAreaAfterCurrentInput = computed(() => {
  return remainingAreaBeforeCurrentInput.value - getNumericValue(form.value.plannedAreaTa);
});

const remainingAreaDisplay = computed(() => remainingAreaAfterCurrentInput.value.toFixed(2));

const loadFarmlandTotalArea = async (farmlandId?: string | number) => {
  if (!farmlandId) {
    currentFarmlandTotalAreaTa.value = null;
    return;
  }
  const res = await listFarmland({ pageNum: 1, pageSize: 1, id: farmlandId });
  const match = (res.rows || []).find((item) => String(item.id) === String(farmlandId)) || res.rows?.[0];
  currentFarmlandTotalAreaTa.value = match ? getNumericValue(match.areaTa) : null;
};

watch(
  () => form.value.farmlandId,
  (value) => {
    loadFarmlandTotalArea(value);
    loadFarmlandInfoDisplay(value);
  }
);

/** Query All Cropping Plan List (for Remaining Area calc) */
const getAllList = async () => {
  const res = await listCroppingPlan();
  croppingPlanAllList.value = res.rows;
};

/** Load record for approve mode */
const loadRecord = async () => {
  if (!id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getCroppingPlan(id.value);
    Object.assign(form.value, res.data);
    await Promise.all([loadSoilAndIrrigationMasters(), getAllList()]);
  } finally {
    pageLoading.value = false;
  }
};

/** Cancel / Close Button */
const cancel = () => {
  router.push(listPath.value);
};

/** Approval Button */
const submitForm = () => {
  croppingPlanFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      await request({
        url: '/demo/croppingPlan/approve',
        method: 'post',
        data: { id: form.value.planId, comment: form.value.approvedComment }
      }).finally(() => (buttonLoading.value = false));

      proxy?.$modal.msgSuccess('success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

const rejectForm = () => {
  croppingPlanFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      await request({
        url: '/demo/croppingPlan/reject',
        method: 'post',
        data: { id: form.value.planId }
      }).finally(() => (buttonLoading.value = false));

      proxy?.$modal.msgSuccess('success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

const RevisionForm = () => {
  croppingPlanFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      await request({
        url: '/demo/croppingPlan/revision',
        method: 'post',
        data: { id: form.value.planId, comment: form.value.approvedComment }
      }).finally(() => (buttonLoading.value = false));

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
.cropping-plan-dialog-form :deep(.el-form-item__label) {
  white-space: nowrap;
}

.cropping-plan-dialog-form :deep(.remaining-area-negative.el-input.is-disabled) {
  --el-disabled-text-color: var(--el-color-danger);
  --el-text-color-disabled: var(--el-color-danger);
  --el-input-text-color: var(--el-color-danger);
}
.cropping-plan-dialog-form :deep(.remaining-area-negative.is-disabled .el-input__inner),
.cropping-plan-dialog-form :deep(.remaining-area-negative.is-disabled .el-input__wrapper) {
  color: var(--el-color-danger) !important;
  -webkit-text-fill-color: var(--el-color-danger) !important;
}
.cropping-plan-dialog-form :deep(.remaining-area-negative.is-disabled input) {
  color: var(--el-color-danger) !important;
  -webkit-text-fill-color: var(--el-color-danger) !important;
}
.cropping-dialog-section {
  padding: 12px 16px 4px;
  margin-bottom: 16px;
}
.cropping-dialog-section:last-of-type {
  margin-bottom: 0;
}
.cropping-dialog-section__title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  color: var(--el-text-color-primary);
}
</style>
