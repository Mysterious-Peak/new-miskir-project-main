<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- Add or Edit Yield Estimate Dialog -->
      <el-form ref="yieldEstimateFormRef" :model="form" :rules="rules" label-width="300px">
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
            @change="onProdSeasonIdChange"
            v-if="!isViewFlag(form)"
          >
            <el-option v-for="item in productionSeasonOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-else v-model="form.prodSeasonId" placeholder="Please input" disabled />
        </el-form-item>
        <!-- <el-form-item label="Estimate Date" prop="estimateDate">
          <div class="flex flex-1 items-center gap-2">
            <el-date-picker
              clearable
              v-model="form.estimateDate"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="Please select Estimate Date"
              :disabled-date="disabledEstimateDate"
              :disabled="isViewFlag(form)"
            >
            </el-date-picker>
            <el-tooltip content="Meher = October – December; Belg = May – June; off-season/ irrigation = January – February" placement="top">
              <el-icon><InfoFilled /></el-icon>
            </el-tooltip>
          </div>
        </el-form-item> -->
        <el-form-item label="Method" prop="method">
          <el-select v-model="form.method" placeholder="Please select" :disabled="isViewFlag(form)">
            <el-option v-for="dict in yield_estimate_method" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Anticipated Yield">
          <el-input-number
            style="width: 100%"
            :min="0"
            :max="99999999.99"
            v-model="form.priviousPlannedEstimatedYieldQt"
            placeholder="From cropping plan (planned yield)"
            disabled
          />
        </el-form-item>
        <el-form-item label="Predicted Yield" prop="estimatedYieldQt">
          <el-input-number
            style="width: 100%"
            :min="0"
            :max="99999999.99"
            v-model="form.estimatedYieldQt"
            placeholder="Please enter Predicted Yield"
            :disabled="isViewFlag(form)"
          />
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment" v-if="form.estimateId">
          <el-input v-model="form.approvedComment" type="textarea" placeholder="Please input" disabled />
        </el-form-item>
        <!-- <el-form-item label="Estimated Yield per ha (quintal/ha)" prop="estimatedYieldPerHa">
          <el-input v-model="form.estimatedYieldPerHa" placeholder="Please enter Estimated Yield per ha (quintal/ha)" :disabled="isViewFlag(form)" />
        </el-form-item>
        <el-form-item label="Confidence (Low/Medium/High)" prop="confidenceLevel">
          <el-input v-model="form.confidenceLevel" placeholder="Please enter Confidence (Low/Medium/High)" :disabled="isViewFlag(form)" />
        </el-form-item>
        <el-form-item label="Sample Area (m²)" prop="sampleAreaM2">
          <el-input v-model="form.sampleAreaM2" placeholder="Please enter Sample Area (m²)" :disabled="isViewFlag(form)" />
        </el-form-item>
        <el-form-item label="Sample Weight (kg)" prop="sampleWeightKg">
          <el-input v-model="form.sampleWeightKg" placeholder="Please enter Sample Weight (kg)" :disabled="isViewFlag(form)" />
        </el-form-item>
        <el-form-item label="Plant Count" prop="plantCount">
          <el-input v-model="form.plantCount" placeholder="Please enter Plant Count" :disabled="isViewFlag(form)" />
        </el-form-item>
        <el-form-item label="Grain Moisture (%)" prop="grainMoisturePct">
          <el-input v-model="form.grainMoisturePct" placeholder="Please enter Grain Moisture (%)" :disabled="isViewFlag(form)" />
        </el-form-item> -->
        <!-- <el-form-item label="Recorded By ID" prop="recordedBy">
          <el-input v-model="form.recordedBy" placeholder="Please enter Recorded By ID" :disabled="true" />
        </el-form-item> -->
        <!-- <el-form-item label="Department ID" prop="deptId">
          <el-input v-model="form.deptId" maxlength="20" show-word-limit placeholder="Please enter Department ID" :disabled="isViewFlag(form)" />
        </el-form-item> -->
        <!-- <el-form-item label="Remark" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="Please enter content" :disabled="isViewFlag(form)" />
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

<script setup name="YieldEstimateForm" lang="ts">
import { getYieldEstimate, addYieldEstimate, updateYieldEstimate } from '@/api/demo/yieldEstimate';
import { YieldEstimateForm } from '@/api/demo/yieldEstimate/types';
import SelectProductionSeason from '@/components/FarmLand/SelectProductionSeason.vue';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';
import { useUserStore } from '@/store/modules/user';
import { getProductionSeason } from '@/api/demo/productionSeason';
import { getCroppingPlan } from '@/api/demo/croppingPlan';
import { listProductionSeason } from '@/api/demo/productionSeason';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const { yield_estimate_method } = toRefs<any>(proxy?.useDict('yield_estimate_method'));
const userStore = useUserStore();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const yieldEstimateFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

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

/** Store selected Production Season Year and Season ID */
const selectedProductionSeasonYear = ref<number | undefined>(undefined);
const selectedProductionSeasonSeasonId = ref<number | undefined>(undefined);
/** Handle Production Season selection */
const handleProductionSeasonSelect = (row: any) => {
  selectedProductionSeasonYear.value = row.year ? Number(row.year) : undefined;
  selectedProductionSeasonSeasonId.value = row.seasonId ? Number(row.seasonId) : undefined;

  // If prodSeasonId already has a value (user is reselecting), clear the date
  if (form.value.prodSeasonId) {
    form.value.estimateDate = undefined;
  }
};

/** 根据 Production Season → plan_id → t_cropping_plan.planned_yield_qt 填充 Anticipated Yield */
const onProdSeasonIdChange = async (prodSeasonId: string | number | undefined | null) => {
  if (!prodSeasonId) {
    form.value.priviousPlannedEstimatedYieldQt = undefined;
    return;
  }
  try {
    const psRes: any = await getProductionSeason(prodSeasonId);
    const seasonData = psRes?.data ?? psRes;
    const planId = seasonData?.planId;
    if (planId === undefined || planId === null || planId === '') {
      form.value.priviousPlannedEstimatedYieldQt = undefined;
      return;
    }
    const cpRes: any = await getCroppingPlan(planId);
    const planData = cpRes?.data ?? cpRes;
    const qty = planData?.plannedYieldQt;
    form.value.priviousPlannedEstimatedYieldQt = qty === undefined || qty === null || qty === '' ? undefined : Number(qty);
  } catch (error) {
    console.error('Failed to load planned yield from cropping plan:', error);
    form.value.priviousPlannedEstimatedYieldQt = undefined;
  }
};

const initFormData: YieldEstimateForm = {
  estimateId: undefined,
  prodSeasonId: undefined,
  estimateDate: undefined,
  method: undefined,
  priviousPlannedEstimatedYieldQt: undefined,
  estimatedYieldQt: undefined,
  // estimatedYieldPerHa: undefined,
  // confidenceLevel: undefined,
  // sampleAreaM2: undefined,
  // sampleWeightKg: undefined,
  // plantCount: undefined,
  // grainMoisturePct: undefined,
  recordedBy: undefined,
  deptId: undefined,
  remark: undefined,
  status: ApprovalStatus.Draft.toString(),
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
  return data.status == ApprovalStatus.Approved;
};

/** Disable date function for Estimate Date picker */
const disabledEstimateDate = (time: Date) => {
  // If no year is selected, disable all dates
  if (!selectedProductionSeasonYear.value) {
    return true;
  }

  const selectedYear = selectedProductionSeasonYear.value;
  const timeYear = time.getFullYear();
  const timeMonth = time.getMonth() + 1; // getMonth() returns 0-11, so add 1 for actual month
  const timeDate = time.getDate();

  // Year must match the selected Production Season year
  if (timeYear !== selectedYear) {
    return true;
  }

  // Determine season type based on Season ID
  // Season ID === 1: only allow October to December
  // Season ID === 2: only allow May to June
  // Season ID === other: only allow January to February
  if (selectedProductionSeasonSeasonId.value === 1) {
    // Season ID === 1: only allow October to December
    if (timeMonth === 10 || timeMonth === 11 || timeMonth === 12) {
      return false; // Allow these months
    } else {
      return true; // Disable all other months
    }
  } else if (selectedProductionSeasonSeasonId.value === 2) {
    // Season ID === 2: only allow May to June
    if (timeMonth === 5 || timeMonth === 6) {
      return false; // Allow these months
    } else {
      return true; // Disable all other months
    }
  } else if (selectedProductionSeasonSeasonId.value) {
    // Other values: only allow January to February
    if (timeMonth === 1 || timeMonth === 2) {
      return false; // Allow these months
    } else {
      return true; // Disable all other months
    }
  }

  // If no season ID is set, disable all dates
  return true;
};

/** Load record for add/edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    // Set current logged in user ID
    form.value.recordedBy = userStore.userId?.toString() || '';
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getYieldEstimate(id.value);
    Object.assign(form.value, res.data);

    // Load Production Season data to get year and seasonId for date restrictions
    if (form.value.prodSeasonId) {
      try {
        const prodSeasonRes = await getProductionSeason(form.value.prodSeasonId);
        if (prodSeasonRes.data) {
          selectedProductionSeasonYear.value = prodSeasonRes.data.year ? Number(prodSeasonRes.data.year) : undefined;
          selectedProductionSeasonSeasonId.value = prodSeasonRes.data.seasonId ? Number(prodSeasonRes.data.seasonId) : undefined;
        }
      } catch (error) {
        console.error('Failed to load Production Season data:', error);
      }
      // 以库里已存值为准，仅旧数据无该字段时再从种植计划回填
      const storedPrev = (res as any).data?.priviousPlannedEstimatedYieldQt;
      if (storedPrev === null || storedPrev === undefined) {
        await onProdSeasonIdChange(form.value.prodSeasonId);
      }
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
  yieldEstimateFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = ApprovalStatus.Draft.toString();
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
