<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="cropMonitoringFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="auto">
        <el-form-item label="Production Season ID" prop="prodSeasonId">
          <el-select
            v-model="form.prodSeasonId"
            filterable
            remote
            reserve-keyword
            placeholder="Please input"
            :remote-method="productionSeasonRemoteMethodPopup"
            :loading="productionSeasonLoadingPopup"
            :debounce="300"
            v-if="!isViewFlag(form)"
          >
            <el-option v-for="item in productionSeasonOptionsPopup" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-else v-model="form.prodSeasonId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Monitoring Date" prop="monitoringDate">
          <el-date-picker
            clearable
            v-model="form.monitoringDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Monitoring Date"
            disabled
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Crop Stage" prop="stageCode">
          <el-select v-model="form.stageCode" placeholder="Please select" :disabled="isViewFlag(form)">
            <el-option v-for="dict in crop_monitoring_stage_code" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Plant Height (cm)" prop="plantHeightCm">
          <el-input-number
            :disabled="isViewFlag(form)"
            v-model="form.plantHeightCm"
            style="width: 100%"
            :min="0"
            :max="999.99"
            placeholder="Please enter Plant Height (cm)"
            type="number"
          />
        </el-form-item>
        <el-form-item label="Canopy Cover (%)" prop="canopyCoverPct">
          <el-input-number
            :disabled="isViewFlag(form)"
            style="width: 100%"
            :min="0"
            :max="999.99"
            v-model="form.canopyCoverPct"
            placeholder="Please enter Canopy Cover (%)"
            type="number"
          />
        </el-form-item>
        <el-form-item label="Stand Count per m虏" prop="standCountM2">
          <el-input-number
            :disabled="isViewFlag(form)"
            style="width: 100%"
            :min="0"
            :max="9999.99"
            v-model="form.standCountM2"
            placeholder="Please enter Stand Count per m虏"
            type="number"
          />
        </el-form-item>
        <el-form-item label="NDVI" prop="ndvi">
          <el-input-number
            style="width: 100%"
            :min="0"
            :max="9.999"
            v-model="form.ndvi"
            placeholder="Please enter NDVI"
            type="number"
            :disabled="isViewFlag(form)"
          />
        </el-form-item>
        <el-form-item label="Photo URL" prop="photoUrl">
          <image-upload v-model="form.photoUrl" :disabled="isViewFlag(form)" />
        </el-form-item>
        <el-form-item label="Remark" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="Please enter content" :disabled="isViewFlag(form)" />
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment" v-if="form.monitorId">
          <el-input v-model="form.approvedComment" type="textarea" placeholder="Please input" disabled />
        </el-form-item>
      </el-form>
      <div class="form-footer">
        <el-button v-if="isDetail" @click="cancel">Close</el-button>
        <template v-else>
          <el-button @click="cancel">Cancel</el-button>
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">Save</el-button>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup name="CropMonitoringForm" lang="ts">
import { getCropMonitoring, addCropMonitoring, updateCropMonitoring } from '@/api/demo/cropMonitoring';
import { CropMonitoringForm } from '@/api/demo/cropMonitoring/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';
import { useUserStore } from '@/store/modules/user';
import { listProductionSeason } from '@/api/demo/productionSeason';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const { crop_monitoring_date, crop_monitoring_stage_code } = toRefs<any>(proxy?.useDict('crop_monitoring_date', 'crop_monitoring_stage_code'));

const pageLoading = ref(false);
const buttonLoading = ref(false);
const cropMonitoringFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const productionSeasonOptionsPopup = ref([]);
const productionSeasonListPopup = ref([]);
const productionSeasonLoadingPopup = ref(false);
const productionSeasonRemoteMethodPopup = async (query: string) => {
  if (query) {
    productionSeasonLoadingPopup.value = true;

    const res = await listProductionSeason({ pageNum: 1, pageSize: 10, prodSeasonId: query });
    productionSeasonListPopup.value = res.rows;
    productionSeasonOptionsPopup.value = res.rows.map((item) => ({
      value: item.prodSeasonId,
      label: `${item.prodSeasonId}`
    }));
    productionSeasonLoadingPopup.value = false;
  } else {
    productionSeasonOptionsPopup.value = [];
  }
};

// Helper function to get current date-time in YYYY-MM-DD HH:mm:ss format
const getCurrentDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const initFormData: CropMonitoringForm = {
  monitorId: undefined,
  prodSeasonId: undefined,
  monitoringDate: getCurrentDateTime(),
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
  status: ApprovalStatus.Draft.toString(),
  approvedComment: undefined
};

const form = ref<CropMonitoringForm>({ ...initFormData });

const rules = ref<ElFormRules>({
  monitorId: [{ required: true, message: 'Monitoring ID cannot be empty', trigger: 'blur' }],
  prodSeasonId: [{ required: true, message: 'Production Season ID cannot be empty', trigger: 'blur' }],
  monitoringDate: [{ required: true, message: 'Monitoring Date cannot be empty', trigger: 'blur' }],
  stageCode: [{ required: true, message: 'Crop Stage  cannot be empty', trigger: 'blur' }],
  recordedBy: [{ required: true, message: 'Recorded By ID cannot be empty', trigger: 'blur' }]
});

const isViewFlag = (data) => {
  return data.status == ApprovalStatus.Approved || data.status == ApprovalStatus.Rejected;
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData, monitoringDate: getCurrentDateTime() };
    // Set current logged in user ID
    form.value.recordedBy = userStore.userId?.toString() || '';
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

/** Cancel Button */
const cancel = () => {
  router.push(listPath.value);
};

/** Submit Button */
const submitForm = () => {
  cropMonitoringFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      form.value.status = ApprovalStatus.Draft.toString();
      if (form.value.monitorId) {
        await updateCropMonitoring(form.value);
      } else {
        await addCropMonitoring(form.value);
      }
      proxy?.$modal.msgSuccess('Operation successful');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    } finally {
      buttonLoading.value = false;
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
