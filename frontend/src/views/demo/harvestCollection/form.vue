<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- Add or Edit Harvest Collection Dialog -->
      <el-form ref="harvestCollectionFormRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="Harvest ID" prop="harvestId" v-show="isShow">
          <el-input v-model="form.harvestId" maxlength="20" show-word-limit placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Production Season ID" prop="prodSeasonId">
          <el-select
            v-model="form.prodSeasonId"
            filterable
            remote
            reserve-keyword
            placeholder="Please input"
            :remote-method="productionSeasonRemoteMethod"
            :loading="productionSeasonLoading"
            :debounce="300"
            v-if="!isViewFlag(form)"
            @change="handleProductionSeasonChange"
          >
            <el-option v-for="item in productionSeasonOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-else v-model="form.prodSeasonId" placeholder="Please input" disabled />
        </el-form-item>
        <!-- <el-form-item v-if="form.cropName" label="Crop Type">
          <el-input v-model="form.cropName" disabled />
        </el-form-item>
        <el-form-item v-if="form.varietyName" label="Variety name">
          <el-input v-model="form.varietyName" disabled />
        </el-form-item> -->
        <!-- <el-form-item label="Measured Moisture Value">
          <el-input :model-value="form.measuredMoistureValue ?? ''" placeholder="No value fetched" disabled />
        </el-form-item> -->
        <el-form-item label="Harvest Date" prop="harvestDate">
          <div class="flex flex-1 items-center gap-2">
            <el-date-picker
              clearable
              v-model="form.harvestDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="Please select"
              :disabled="isViewFlag(form) || form.prodSeasonId == undefined"
              :disabled-date="disabledDate"
              :default-value="defaultDate"
            >
            </el-date-picker>
            <el-tooltip content="Meher = October – December; Belg = May – June; off-season = January – February" placement="top">
              <el-icon><InfoFilled /></el-icon>
            </el-tooltip>
          </div>
        </el-form-item>
        <!-- <el-form-item label="Harvest Date" prop="harvestDate">
          <div class="flex flex-1 items-center gap-2">
            <el-date-picker
              clearable
              v-model="form.harvestDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="Please select"
              :disabled="isViewFlag(form) || form.prodSeasonId == undefined"
            >
            </el-date-picker>
            <el-tooltip content="Meher = October – December; Belg = May – June; off-season = January – February" placement="top">
              <el-icon><InfoFilled /></el-icon>
            </el-tooltip>
          </div>
        </el-form-item> -->
        <el-form-item label="Harested Area (ha)" prop="harvestedAreaTa">
          <el-input-number
            v-model="form.harvestedAreaTa"
            placeholder="Please input Harested Area (ha)"
            :min="0"
            :max="99999.99"
            style="width: 100%"
            :disabled="isViewFlag(form)"
          />
        </el-form-item>
        <el-form-item label="Harvest Yield" prop="harvestYieldQt">
          <el-input-number
            v-model="form.harvestYieldQt"
            placeholder="Please input Harvest Yield"
            :min="0"
            :max="99999999.99"
            style="width: 100%"
            :disabled="isViewFlag(form)"
          />
        </el-form-item>
        <el-form-item label="Measured Moisture (%)" prop="moisturePct">
          <el-input-number
            v-model="form.moisturePct"
            placeholder="Please input Measured Moisture"
            :min="0"
            :max="100"
            style="width: 100%"
            :disabled="isViewFlag(form)"
          />
        </el-form-item>
        <el-form-item label="Standard Moisture (%)">
          <div class="flex flex-1 items-center gap-2">
            <el-input :model-value="form.standardMoisturePct ?? form.measuredMoistureValue ?? ''" placeholder="No value fetched" disabled />
            <el-tooltip
              v-if="form.standardMoistureNeedsReview || standardMoistureNeedsReview"
              :content="`Need review${form.standardMoistureSource ? ` (${form.standardMoistureSource})` : ''}`"
              placement="top"
            >
              <el-icon><InfoFilled /></el-icon>
            </el-tooltip>
          </div>
        </el-form-item>
        <el-form-item label="Actual Yield (q)" prop="actualYieldQt">
          <el-input-number
            v-model="form.actualYieldQt"
            placeholder="Auto calculated"
            :min="0"
            :max="99999999.99"
            :precision="2"
            style="width: 100%"
            disabled
          />
        </el-form-item>
        <el-form-item label="Quality Grade" prop="qualityGrade">
          <div class="flex flex-1 items-center gap-2">
            <el-select v-model="form.qualityGrade" placeholder="Please select" :disabled="isViewFlag(form)">
              <el-option v-for="dict in harvest_quality_grade" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
            </el-select>
            <el-tooltip :content="grade_tooltipContent" placement="top">
              <el-icon><InfoFilled /></el-icon>
            </el-tooltip>
          </div>
        </el-form-item>
        <el-form-item label="Methods" prop="methods">
          <el-select v-model="form.methods" placeholder="Please select" :disabled="isViewFlag(form)">
            <el-option v-for="dict in harvest_methods" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>

        <!-- <el-form-item label="Quantity (qt)" prop="quantityQt">
          <el-input-number
            :min="0"
            :max="99999999.99"
            style="width: 100%"
            v-model="form.quantityQt"
            placeholder="Please input"
            :disabled="isViewFlag(form)"
          />
        </el-form-item>
        <el-form-item label="Moisture (%)" prop="moisturePercentage">
          <el-input-number
            :min="0"
            :max="999.99"
            style="width: 100%"
            v-model="form.moisturePercentage"
            placeholder="Please input"
            :disabled="isViewFlag(form)"
          />
        </el-form-item> -->
        <el-form-item label="Collection Date" prop="collectionDate" v-if="isViewFlag(form)">
          <el-date-picker
            clearable
            v-model="form.collectionDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="Please select"
            style="width: 100%"
            disabled
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Created By" prop="createdUserName" v-if="isViewFlag(form)">
          <el-input v-model="form.createdUserName" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Created Time" prop="createTime" v-if="isViewFlag(form)">
          <el-date-picker clearable v-model="form.createTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Approved By" prop="approvedUserName" v-if="isViewFlag(form)">
          <el-input v-model="form.approvedUserName" placeholder="Please input Approved By" disabled />
        </el-form-item>
        <el-form-item label="Approved Date" prop="approvedAt" v-if="isViewFlag(form)">
          <el-date-picker clearable v-model="form.approvedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment" v-if="isViewFlag(form)">
          <el-input v-model="form.approvedComment" type="textarea" placeholder="Please input" disabled />
        </el-form-item>
      </el-form>
      <div class="form-footer">
        <el-button v-if="isViewFlag(form)" @click="cancel">Close</el-button>
        <template v-else>
          <el-button @click="cancel">Cancel</el-button>
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">Save</el-button>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup name="HarvestCollectionForm" lang="ts">
import { getCropMaster, listCropMaster } from '@/api/demo/cropMaster';
import { getFarmland } from '@/api/demo/farmland';
import { listSowing } from '@/api/demo/sowing';
import { listYieldEstimate } from '@/api/demo/yieldEstimate';
import { addHarvestCollection, getHarvestCollection, updateHarvestCollection } from '@/api/demo/harvestCollection';
import { HarvestCollectionForm } from '@/api/demo/harvestCollection/types';
import { listProductionSeason } from '@/api/demo/productionSeason';
import { ApprovalStatus, CroppingSeasonStatus } from '@/enums/AgriculturalEnum';

import { InfoFilled } from '@element-plus/icons-vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { harvest_quality_grade, harvest_methods } = toRefs<any>(proxy?.useDict('harvest_quality_grade', 'harvest_methods'));

const pageLoading = ref(false);
const buttonLoading = ref(false);
const harvestCollectionFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const isShow = computed(() => {
  return !isAdd.value;
});

const initFormData: HarvestCollectionForm = {
  id: undefined,
  harvestId: undefined,
  farmerId: undefined,
  cropCode: undefined,
  cropName: undefined,
  varietyName: undefined,
  measuredMoistureValue: undefined,
  standardMoisturePct: undefined,
  standardMoistureSource: undefined,
  standardMoistureNeedsReview: undefined,
  quantityQt: undefined,
  moisturePercentage: undefined,
  collectionDate: undefined,
  status: ApprovalStatus.Draft.toString(),
  prodSeasonId: undefined
};

const form = ref<HarvestCollectionForm>({ ...initFormData });

const rules = {
  id: [{ required: true, message: 'Primary Key ID cannot be empty', trigger: 'blur' }],
  // harvestId: [{ required: true, message: 'Harvest Record Code cannot be empty', trigger: 'blur' }],
  farmerId: [{ required: true, message: 'Farmer ID cannot be empty', trigger: 'blur' }],
  cropCode: [{ required: true, message: 'Crop Type cannot be empty', trigger: 'blur' }],
  quantityQt: [{ required: true, message: 'Harvest Quantity cannot be empty', trigger: 'blur' }],
  moisturePercentage: [{ required: true, message: 'Moisture Percentage cannot be empty', trigger: 'blur' }],
  collectionDate: [{ required: true, message: 'Collection Date cannot be empty', trigger: 'blur' }],
  prodSeasonId: [{ required: true, message: 'Production Season ID can not be null', trigger: 'blur' }],
  harvestDate: [{ required: true, message: 'Harvest Date can not be null', trigger: 'blur' }],
  harvestYieldQt: [{ required: true, message: 'Harvest Yield can not be null', trigger: 'blur' }],
  moisturePct: [{ required: true, message: 'Moisture (%) cannot be empty', trigger: 'blur' }],
  recordedBy: [{ required: true, message: 'Recorded By can not be null', trigger: 'blur' }]
};

const DEFAULT_STANDARD_MOISTURE = 13;
const standardMoistureNeedsReview = ref(false);

/** Actual Yield (q) = Harvest Yield × (100 - Measured Moisture) / (100 - Standard Moisture) */
const calcActualYieldQt = (
  harvestYield: number | undefined,
  measuredMoisture: number | undefined,
  standardMoisture: number | undefined
): number | undefined => {
  if (harvestYield == null || measuredMoisture == null || standardMoisture == null) {
    return undefined;
  }
  const denominator = 100 - standardMoisture;
  if (denominator <= 0) {
    return undefined;
  }
  if (measuredMoisture >= 100) {
    return 0;
  }
  const result = harvestYield * ((100 - measuredMoisture) / denominator);
  return Math.round(result * 100) / 100;
};

const syncActualYieldQt = () => {
  form.value.actualYieldQt = calcActualYieldQt(form.value.harvestYieldQt, form.value.moisturePct, form.value.measuredMoistureValue);
};

watch(
  () => [form.value.harvestYieldQt, form.value.moisturePct, form.value.measuredMoistureValue],
  () => syncActualYieldQt()
);

const productionSeasonOptions = ref([]);
const productionSeasonList = ref([]);
const productionSeasonLoading = ref(false);
const productionSeasonRemoteMethod = async (query: string) => {
  if (query) {
    productionSeasonLoading.value = true;

    const res = await listProductionSeason({ pageNum: 1, pageSize: 10, prodSeasonId: query, status: CroppingSeasonStatus.InProgress.toString() });
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

const cropDataList = ref();
const getCropList = async () => {
  const res = await listCropMaster({ pageNum: 1, pageSize: 2000 });
  cropDataList.value = res.rows;
};

const getExData = async (row) => {
  if (form.value.prodSeasonId) {
    await loadRelatedDataByProdSeason(form.value.prodSeasonId);
    return;
  }
  const crop = cropDataList.value?.find((item) => item.cropCode == row?.cropCode);
  form.value.cropName = crop?.cropName;
};

const resolveProductionSeason = async (prodSeasonId: string | number) => {
  let selectedSeason = productionSeasonList.value.find((item) => item.prodSeasonId == prodSeasonId);
  if (!selectedSeason && prodSeasonId) {
    const res = await listProductionSeason({
      pageNum: 1,
      pageSize: 10,
      prodSeasonId: String(prodSeasonId),
      status: CroppingSeasonStatus.InProgress.toString()
    });
    selectedSeason = res.rows?.[0];
    if (selectedSeason) {
      productionSeasonList.value.push(selectedSeason);
    }
  }
  return selectedSeason;
};

const loadRelatedDataByProdSeason = async (prodSeasonId: string | number) => {
  form.value.cropName = undefined;
  form.value.varietyName = undefined;
  form.value.measuredMoistureValue = undefined;
  form.value.cropCode = undefined;
  standardMoistureNeedsReview.value = false;

  const selectedSeason = await resolveProductionSeason(prodSeasonId);
  if (!selectedSeason) {
    return;
  }

  form.value.seasonId = selectedSeason.seasonId;

  const cropId = selectedSeason.cropId;
  let cropMasterMoisture: number | undefined;
  if (cropId) {
    try {
      const cropRes = await getCropMaster(cropId);
      form.value.cropName = cropRes.data?.cropName;
      form.value.cropCode = cropRes.data?.cropCode;
      const rawMoisture = cropRes.data?.measuredMoistureValue;
      cropMasterMoisture = rawMoisture === undefined || rawMoisture === null ? undefined : Number(rawMoisture);
    } catch {
      const crop = cropDataList.value?.find((item) => item.id == cropId);
      form.value.cropName = crop?.cropName;
      form.value.cropCode = crop?.cropCode;
      const rawMoisture = crop?.measuredMoistureValue;
      cropMasterMoisture = rawMoisture === undefined || rawMoisture === null ? undefined : Number(rawMoisture);
    }
  }

  try {
    const sowingRes = await listSowing({
      pageNum: 1,
      pageSize: 1,
      prodSeasonId: String(prodSeasonId),
      orderByColumn: 'createTime',
      isAsc: 'desc'
    });
    form.value.varietyName = sowingRes.rows?.[0]?.seedLotCode || undefined;
  } catch {
    form.value.varietyName = undefined;
  }

  let fetchedMoisture: number | undefined;
  try {
    const yieldRes = await listYieldEstimate({
      pageNum: 1,
      pageSize: 1,
      prodSeasonId: String(prodSeasonId),
      orderByColumn: 'createTime',
      isAsc: 'desc'
    });
    const estimate = yieldRes.rows?.[0];
    const moisture = estimate?.measuredMoistureValue ?? estimate?.grainMoisturePct ?? cropMasterMoisture;
    fetchedMoisture = moisture === undefined || moisture === null ? undefined : Number(moisture);
  } catch {
    fetchedMoisture = cropMasterMoisture;
  }
  if (fetchedMoisture == null) {
    form.value.measuredMoistureValue = DEFAULT_STANDARD_MOISTURE;
    form.value.standardMoisturePct = DEFAULT_STANDARD_MOISTURE;
    form.value.standardMoistureSource = 'FALLBACK_DEFAULT';
    form.value.standardMoistureNeedsReview = true;
    standardMoistureNeedsReview.value = true;
  } else {
    form.value.measuredMoistureValue = fetchedMoisture;
    form.value.standardMoisturePct = fetchedMoisture;
    form.value.standardMoistureSource = 'CLIENT_RESOLVED';
    form.value.standardMoistureNeedsReview = false;
    standardMoistureNeedsReview.value = false;
  }
  syncActualYieldQt();
};

const handleProductionSeasonChange = async (value: string | number) => {
  form.value.harvestDate = undefined;
  if (isAdd.value) {
    form.value.moisturePct = undefined;
  }
  if (!value) {
    form.value.seasonId = undefined;
    form.value.cropName = undefined;
    form.value.varietyName = undefined;
    form.value.measuredMoistureValue = undefined;
    form.value.standardMoisturePct = undefined;
    form.value.standardMoistureSource = undefined;
    form.value.standardMoistureNeedsReview = undefined;
    form.value.cropCode = undefined;
    standardMoistureNeedsReview.value = false;
    return;
  }
  await loadRelatedDataByProdSeason(value);
};

const disabledDate = (time: Date) => {
  if (form.value.seasonId === 1) {
    return !(time.getMonth() + 1 >= 10 && time.getMonth() + 1 <= 12);
  } else if (form.value.seasonId === 2) {
    return !(time.getMonth() + 1 >= 5 && time.getMonth() + 1 <= 6);
  } else if (form.value.seasonId === 3) {
    return !(time.getMonth() + 1 >= 1 && time.getMonth() + 1 <= 2);
  }
  return true;
};
const defaultDate = computed(() => {
  if (form.value.seasonId === 1) {
    return new Date(new Date().getFullYear(), 10, 1);
  } else if (form.value.seasonId === 2) {
    return new Date(new Date().getFullYear(), 5, 1);
  } else if (form.value.seasonId === 3) {
    return new Date(new Date().getFullYear(), 1, 1);
  }
  return new Date();
});

const grade_tooltipContent = computed(() => {
  if (form.value.qualityGrade == '0') {
    return '<2% foreign matter';
  } else if (form.value.qualityGrade == '1') {
    return '<5% foreign matter';
  } else if (form.value.qualityGrade == '2') {
    return '>5% foreign matter';
  } else {
    return 'Please select a quality grade';
  }
});

const isViewFlag = (data) => {
  return data.status == ApprovalStatus.Approved || data.status == ApprovalStatus.Rejected || data.status == ApprovalStatus.Registered;
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getHarvestCollection(id.value);
    Object.assign(form.value, res.data);
    await getExData(form.value);
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
  syncActualYieldQt();
  harvestCollectionFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      form.value.status = ApprovalStatus.Created.toString();

      for (const item of productionSeasonList.value) {
        if (item.prodSeasonId == form.value.prodSeasonId) {
          form.value.cropCode = cropDataList.value.find((crop) => crop.id == item.cropId).cropCode;
          const res = await getFarmland(item.farmlandId);
          form.value.farmerId = res.data.farmerId.toString();
          form.value.quantityQt = form.value.actualYieldQt ?? form.value.harvestYieldQt;
          form.value.moisturePercentage = form.value.moisturePct;
        }
      }
      if (form.value.id) {
        await updateHarvestCollection(form.value);
      } else {
        await addHarvestCollection(form.value);
      }
      proxy?.$modal.msgSuccess('Operation successful');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    } finally {
      buttonLoading.value = false;
    }
  });
};

onMounted(async () => {
  await getCropList();
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
