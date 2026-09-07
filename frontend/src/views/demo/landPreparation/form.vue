<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="landPreparationFormRef" :model="form" :rules="rules" label-width="auto">
        <el-alert
          v-if="existingLandPreparation"
          class="mb-3"
          type="warning"
          :closable="false"
          show-icon
          title="A previous land preparation record exists for this Production Season ID. The latest record has been loaded as a starting point."
        />
        <el-form-item label="Production Season ID" prop="prodSeasonId">
          <!-- <div v-if="!isViewFlag(form)" class="flex gap-2 flex-1">
            <el-input v-model="form.prodSeasonId" placeholder="Please input Production Season ID" disabled />
            <SelectProductionSeason v-model="form.prodSeasonId" @select="handleProductionSeasonSelect"></SelectProductionSeason>
          </div>
          <el-input v-else v-model="form.prodSeasonId" placeholder="Please input Production Season ID" disabled /> -->
          <el-select
            v-model="form.prodSeasonId"
            filterable
            remote
            reserve-keyword
            placeholder="Please input"
            :remote-method="productionSeasonRemoteMethod"
            :loading="productionSeasonLoading"
            :debounce="300"
            @change="handleProductionSeasonSelect"
            v-if="!isViewFlag(form)"
          >
            <el-option v-for="item in productionSeasonOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-else v-model="form.prodSeasonId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Preparation Date" prop="prepDate">
          <div class="flex flex-1 items-center gap-2">
            <el-date-picker
              clearable
              v-model="form.prepDate"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="Please select Preparation Date"
              :disabled="isViewFlag(form)"
              :disabled-date="disabledPastDate"
            >
            </el-date-picker>
            <el-tooltip
              content="10 tillage 2–3 months before rains, 20 tillage 2–3 months before rains, Land leveling, Bed/Ridge making before planting, Conservation tillage flexible."
              placement="top"
            >
              <el-icon><InfoFilled /></el-icon>
            </el-tooltip>
          </div>
        </el-form-item>
        <el-form-item label="Preparation Method" prop="method">
          <el-select v-model="form.method" placeholder="Please select" :disabled="isViewFlag(form)" multiple>
            <el-option v-for="dict in land_method" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Machinery Used" prop="machineryUsed">
          <el-select v-model="form.machineryUsed" placeholder="Please select" :disabled="isViewFlag(form)">
            <el-option v-for="dict in land_machinery_used" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Tillage Depth (cm)" prop="depthCm">
          <el-input-number
            style="width: 500px"
            v-model="form.depthCm"
            :min="0"
            :max="999.99"
            placeholder="Please enter Tillage Depth (cm)"
            :disabled="isViewFlag(form)"
          />
        </el-form-item>
        <el-form-item label="Remarks" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="Please enter content" :disabled="isViewFlag(form)" />
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment" v-if="form.landprepId">
          <el-input v-model="form.approvedComment" type="textarea" placeholder="Please input" disabled />
        </el-form-item>
        <!-- <el-form-item label="Recorded By ID" prop="recordedUserName">
          <el-input v-model="form.recordedUserName" placeholder="Please enter Recorded By ID" maxlength="20" show-word-limit :disabled="true" />
        </el-form-item> -->
        <!-- <el-form-item label="Approved By ID" prop="verifiedBy">
          <el-input v-model="form.verifiedBy" placeholder="Please enter Approved By ID" :disabled="isViewFlag(form)" />
        </el-form-item>
        <el-form-item label="Approved Date" prop="verifiedAt">
          <el-date-picker
            clearable
            v-model="form.verifiedAt"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Approved Date"
            :disabled="isViewFlag(form)"
          >
          </el-date-picker>
        </el-form-item> -->
        <!-- <el-form-item label="Department ID" prop="deptId">
          <el-input v-model="form.deptId" placeholder="Please enter Department ID" :disabled="isViewFlag(form)" />
        </el-form-item>
        <el-form-item label="Remark" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="Please enter content" :disabled="isViewFlag(form)" />
        </el-form-item> -->
        <!-- <el-form-item label="状态" prop="status">
          <el-input v-model="form.status" placeholder="请输入状态" />
        </el-form-item> -->
      </el-form>
      <div class="form-footer">
        <el-button @click="cancel" v-if="!isViewFlag(form)">Cancel</el-button>
        <el-button :loading="buttonLoading" type="primary" @click="submitForm" v-if="!isViewFlag(form)">Save</el-button>
        <el-button @click="cancel" v-if="isViewFlag(form)">Close</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="LandPreparationForm" lang="ts">
import { getCroppingPlan } from '@/api/demo/croppingPlan';
import {
  addLandPreparation,
  getLandPreparation,
  getLatestLandPreparationByProdSeason,
  listLandPreparation,
  updateLandPreparation
} from '@/api/demo/landPreparation';
import { LandPreparationForm, LandPreparationVO } from '@/api/demo/landPreparation/types';
import { listProductionSeason } from '@/api/demo/productionSeason';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';
import { useUserStore } from '@/store/modules/user';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const landPreparationFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const id = computed(() => (route.params.id as string) || '');
const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const existingLandPreparation = ref<LandPreparationVO | null>(null);
const productionSeasonAllList = ref<LandPreparationVO[]>([]);
const productionSeasonOptions = ref([]);
const productionSeasonList = ref([]);
const productionSeasonLoading = ref(false);
const productionSeasonRemoteMethod = async (query: string) => {
  if (query) {
    productionSeasonLoading.value = true;

    const res = await listProductionSeason({ pageNum: 1, pageSize: 10, prodSeasonId: query });
    productionSeasonList.value = res.rows;
    productionSeasonOptions.value = res.rows.map((item) => ({
      value: item.prodSeasonId,
      label: `${item.prodSeasonId}`
    }));
    productionSeasonLoading.value = false;
  } else {
    productionSeasonOptions.value = [];
  }
};

/** Load all land prep rows for local Production Season ID filter (dedupe via Set in remote method). */
const getAllList = async () => {
  const res = await listLandPreparation();
  productionSeasonAllList.value = res.rows ?? [];
};

const { land_prep_date, land_method, land_machinery_used } = toRefs<any>(proxy?.useDict('land_prep_date', 'land_method', 'land_machinery_used'));

/** Store selected Production Season Year */
const selectedProductionSeasonYear = ref<number | undefined>(undefined);
/** Store selected Production Season Plan ID */
const selectedProductionSeasonPlanId = ref<number | string | undefined>(undefined);
/** Store planting window start and end dates */
const startDate = ref<string | undefined>(undefined);
const endDate = ref<string | undefined>(undefined);

/** Handle Production Season selection */
const handleProductionSeasonSelect = async (prodSeasonId: string | number) => {
  existingLandPreparation.value = null;
  // If prodSeasonId already has a value (user is reselecting), clear the date
  if (form.value.prodSeasonId) {
    form.value.prepDate = undefined;
  }

  // Find the selected Production Season from the list to get year and planId
  let selectedSeason = productionSeasonList.value.find((item: any) => item.prodSeasonId === prodSeasonId);

  // If not found in the list, try to fetch it
  if (!selectedSeason && prodSeasonId) {
    try {
      const res = await listProductionSeason({ pageNum: 1, pageSize: 10, prodSeasonId: String(prodSeasonId) });
      if (res.rows && res.rows.length > 0) {
        selectedSeason = res.rows[0];
        // Update the list for future use
        if (!productionSeasonList.value.find((item: any) => item.prodSeasonId === prodSeasonId)) {
          productionSeasonList.value.push(selectedSeason);
        }
      }
    } catch (error) {
      console.error('Failed to fetch Production Season:', error);
    }
  }

  if (!selectedSeason) {
    existingLandPreparation.value = null;
    selectedProductionSeasonYear.value = undefined;
    selectedProductionSeasonPlanId.value = undefined;
    startDate.value = undefined;
    endDate.value = undefined;
    return;
  }

  selectedProductionSeasonYear.value = selectedSeason.year ? parseInt(selectedSeason.year, 10) : undefined;
  selectedProductionSeasonPlanId.value = selectedSeason.planId;

  if (!form.value.landprepId) {
    try {
      const existingRes = await getLatestLandPreparationByProdSeason(prodSeasonId);
      if (existingRes.data) {
        existingLandPreparation.value = existingRes.data;
        const currentSeasonId = form.value.prodSeasonId;
        Object.assign(form.value, existingRes.data);
        form.value.landprepId = undefined;
        form.value.prodSeasonId = currentSeasonId;
        form.value.status = ApprovalStatus.Draft.toString();
        form.value.method = existingRes.data.method ? (String(existingRes.data.method).split(',').filter(Boolean) as any) : ([] as any);
        form.value.recordedBy = userStore.userId?.toString() || existingRes.data.recordedBy || '';
      }
    } catch {
      existingLandPreparation.value = null;
    }
  }

  // Call getCroppingPlan with planId
  if (selectedProductionSeasonPlanId.value) {
    try {
      const res = await getCroppingPlan(selectedProductionSeasonPlanId.value.toString());
      const planData = res.data;
      if (planData) {
        startDate.value = planData.plantingWindowStart;
        endDate.value = planData.plantingWindowEnd;
      } else {
        startDate.value = undefined;
        endDate.value = undefined;
      }
    } catch (error) {
      console.error('Failed to get cropping plan:', error);
      startDate.value = undefined;
      endDate.value = undefined;
    }
  } else {
    startDate.value = undefined;
    endDate.value = undefined;
  }
};

/** Disable selecting past date-time for Preparation Date and validate year */
const disabledPastDate = (time: Date) => {
  // If startDate and endDate are set, only allow dates within this range
  if (startDate.value && endDate.value) {
    const timeValue = time.getTime();
    const startTime = new Date(startDate.value).getTime();
    const endTime = new Date(endDate.value).getTime();

    // Determine the actual min and max dates (handle cases where start > end)
    const minTime = Math.min(startTime, endTime);
    const maxTime = Math.max(startTime, endTime);

    // Disable if time is outside the valid range
    if (timeValue < minTime || timeValue > maxTime) {
      return true;
    }
    // Allow dates within the range
    return false;
  }

  // If startDate and endDate are not set, disable all dates
  return true;
};

const initFormData: LandPreparationForm = {
  landprepId: undefined,
  prodSeasonId: undefined,
  prepDate: undefined,
  method: [] as any,
  machineryUsed: undefined,
  depthCm: undefined,
  remark: undefined,
  recordedBy: undefined,
  verifiedBy: undefined,
  verifiedAt: undefined,
  deptId: undefined,
  status: ApprovalStatus.Draft.toString(),
  approvedComment: undefined
};

const form = ref<LandPreparationForm>({ ...initFormData });

const rules = {
  landprepId: [{ required: true, message: 'Land preparation record ID cannot be empty', trigger: 'blur' }],
  prodSeasonId: [{ required: true, message: 'Related production season ID cannot be empty', trigger: 'blur' }],
  prepDate: [{ required: true, message: 'Preparation date cannot be empty', trigger: 'blur' }],
  method: [{ required: true, type: 'array', min: 1, message: 'Please select at least one preparation method', trigger: 'change' }],
  recordedBy: [{ required: true, message: 'Recorder ID cannot be empty', trigger: 'blur' }],
  status: [{ required: true, message: 'Status cannot be empty', trigger: 'blur' }]
};

/** Form Reset */
const reset = () => {
  form.value = { ...initFormData };
  existingLandPreparation.value = null;
  selectedProductionSeasonYear.value = undefined;
  selectedProductionSeasonPlanId.value = undefined;
  startDate.value = undefined;
  endDate.value = undefined;
  landPreparationFormRef.value?.resetFields();
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    reset();
    // Set current logged in user ID
    form.value.recordedBy = userStore.userId?.toString() || '';
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getLandPreparation(id.value);
    Object.assign(form.value, res.data);
    existingLandPreparation.value = null;
    // Convert method string to array if needed
    if (form.value.method && typeof form.value.method === 'string') {
      form.value.method = form.value.method.split(',').filter((item: string) => item.trim()) as any;
    } else if (!form.value.method) {
      form.value.method = [] as any;
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
  landPreparationFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = ApprovalStatus.Draft.toString();
      // Convert method array to string if backend expects string
      const submitData = { ...form.value };
      if (Array.isArray(submitData.method)) {
        submitData.method = submitData.method.join(',') as any;
      }
      if (form.value.landprepId) {
        await updateLandPreparation(submitData).finally(() => (buttonLoading.value = false));
      } else {
        await addLandPreparation(submitData).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      router.push({ path: listPath.value, query: { refresh: '1' } });
      await getAllList();
    }
  });
};

const isViewFlag = (data) => {
  return data.status == ApprovalStatus.Approved || data.status == ApprovalStatus.Rejected;
};

onMounted(async () => {
  getAllList();
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
