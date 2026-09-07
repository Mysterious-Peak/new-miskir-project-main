<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="sowingFormRef" :model="form" :rules="rules" label-width="auto">
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
        <!-- <el-form-item label="Variety name" prop="seedLotCode">
          <el-input v-model="form.seedLotCode" maxlength="30" show-word-limit placeholder="Please enter Variety name" />
        </el-form-item> -->
        <el-form-item label="Crop Type" prop="seedType">
          <el-select v-model="form.seedType" placeholder="Please select" :disabled="true">
            <el-option
              v-for="dict in dynamicSeedTypeOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
              :disabled="isViewFlag(form)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Variety name" prop="seedLotCode">
          <!-- <el-cascader
            v-model="form.seedLotCode"
            :options="inputTypeOptions"
            :props="{
              emitPath: false,
              expandTrigger: 'hover' as const
            }"
            :show-all-levels="false"
          /> -->
          <el-select v-model="form.seedLotCode" placeholder="Please select" :disabled="isViewFlag(form)" @change="handleSeedLotCodeChange">
            <el-option
              v-for="dict in dynamicSowingVarietyOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
              :disabled="isViewFlag(form)"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="Planting Material" prop="plantingMaterial">
          <el-select v-model="form.plantingMaterial" placeholder="Please select" :disabled="isViewFlag(form)">
            <el-option
              v-for="dict in dynamicPlantingMaterialOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
              :disabled="isViewFlag(form)"
            ></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="Quantity" prop="seedRateKg">
          <el-input-number
            style="width: 100%"
            :min="0"
            :max="99999999.99"
            v-model="form.seedRateKg"
            placeholder="Please enter Quantity"
            :disabled="isViewFlag(form)"
          />
        </el-form-item>
        <el-form-item label="Method" prop="method">
          <el-select v-model="form.method" placeholder="Please select" :disabled="isViewFlag(form)" @change="handleMethodChange">
            <el-option v-for="dict in sowing_method" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="showSpacingFields" label="Row Spacing (cm)" prop="spacingCm" :required="showSpacingFields">
          <el-input-number
            style="width: 100%"
            :model-value="form.spacingCm == null || form.spacingCm === '' ? undefined : Number(form.spacingCm)"
            @update:model-value="(val) => (form.spacingCm = val == null ? undefined : String(val))"
            placeholder="Please enter Spacing (cm)"
            :disabled="isViewFlag(form)"
          />
        </el-form-item>
        <el-form-item v-if="showSpacingFields" label="Plant Spacing (cm)" prop="plantSpacingCm" :required="showSpacingFields">
          <el-input-number
            style="width: 100%"
            :model-value="form.plantSpacingCm == null || form.plantSpacingCm === '' ? undefined : Number(form.plantSpacingCm)"
            @update:model-value="(val) => (form.plantSpacingCm = val == null ? undefined : String(val))"
            placeholder="Please enter Plant Spacing (cm)"
            :disabled="isViewFlag(form)"
          />
        </el-form-item>
        <el-form-item label="Sowing Date" prop="sowingDate">
          <div class="flex flex-1 items-center gap-2">
            <el-date-picker
              clearable
              v-model="form.sowingDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="Please select Sowing Date"
              :disabled-date="disabledSowingDate"
              :disabled="isViewFlag(form)"
            >
            </el-date-picker>
            <el-tooltip
              content="Meher = Mid-June to early July, Belg = Late February to March, off-season/irrigation = October–November"
              placement="top"
            >
              <el-icon><InfoFilled /></el-icon>
            </el-tooltip>
          </div>
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment" v-if="form.sowingId">
          <el-input v-model="form.approvedComment" type="textarea" placeholder="Please input" disabled />
        </el-form-item>
        <!-- <el-form-item label="Recorded By ID" prop="recordedBy">
          <el-input v-model="form.recordedBy" maxlength="20" placeholder="Please enter Recorded By ID" :disabled="true" />
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
        <!-- <el-form-item label="Status" prop="status" v-if="isViewFlag(form)">
          <el-tag>{{ ApprovalStatus[form.status as unknown as ApprovalStatus] }}</el-tag>
        </el-form-item> -->
      </el-form>
      <div class="form-footer">
        <el-button @click="cancel" v-if="!isViewFlag(form)">Cancel</el-button>
        <el-button :loading="buttonLoading" type="primary" v-if="!isViewFlag(form)" @click="submitForm">Save</el-button>
        <el-button @click="cancel" v-if="isViewFlag(form)">Close</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="SowingForm" lang="ts">
import { listProductionSeason } from '@/api/demo/productionSeason';
import { getCropMaster } from '@/api/demo/cropMaster';
import { addSowing, getSowing, listSowing, updateSowing } from '@/api/demo/sowing';
import { SowingForm, SowingVO } from '@/api/demo/sowing/types';
import { ApprovalStatus, CroppingSeasonStatus } from '@/enums/AgriculturalEnum';
import { useUserStore } from '@/store/modules/user';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const sowingFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const id = computed(() => (route.params.id as string) || '');
const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

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

const seedType = {
  0: 'Pure Line',
  1: 'Open Pollinated (OPV)',
  2: 'Hybrid',
  3: 'Synthetic',
  4: 'Local'
};
const plantingMaterial = {
  0: 'Seeds',
  1: 'Seedlings',
  2: 'Cuttings'
};
const dynamicSowingVarietyOptions = ref<any[]>([]);
const dynamicSeedTypeOptions = ref<any[]>([]);
const dynamicPlantingMaterialOptions = ref<any[]>([]);
const resetDynamicSowingVarietyOptions = () => {
  dynamicSowingVarietyOptions.value = [];
};
const resetDynamicSeedTypeOptions = () => {
  dynamicSeedTypeOptions.value = [];
};
const resetDynamicPlantingMaterialOptions = () => {
  dynamicPlantingMaterialOptions.value = [];
};

const parseRemarkToMatrix = (remark: string): number[][] => {
  const matrix: number[][] = [];
  const regex = /\[(.*?)\]/g;
  let match: RegExpExecArray | null = regex.exec(remark);
  while (match) {
    const values = match[1]
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((item) => !Number.isNaN(item));
    matrix.push(values);
    match = regex.exec(remark);
  }
  return matrix;
};

const handleSeedLotCodeChange = (seedLotCode: string | number) => {
  const selectedVariety = dynamicSowingVarietyOptions.value.find((item: any) => String(item.value) === String(seedLotCode));
  const remark = selectedVariety?.remark;
  if (!remark || typeof remark !== 'string') {
    resetDynamicPlantingMaterialOptions();
    form.value.plantingMaterial = undefined;
    return;
  }

  const [seedTypeCodes, plantingMaterialCodes] = parseRemarkToMatrix(remark);
  const plantingMaterialCode = plantingMaterialCodes?.[0];
  // Seed type is auto matched by cropId after selecting Production Season ID.
  // Variety change no longer rewrites seed type.
  void seedTypeCodes;

  if (plantingMaterialCode === undefined) {
    resetDynamicPlantingMaterialOptions();
    form.value.plantingMaterial = undefined;
  } else {
    const plantingMaterialLabel = plantingMaterial[plantingMaterialCode as keyof typeof plantingMaterial];
    if (!plantingMaterialLabel) {
      resetDynamicPlantingMaterialOptions();
      form.value.plantingMaterial = undefined;
    } else {
      const option = { label: plantingMaterialLabel, value: String(plantingMaterialCode) };
      dynamicPlantingMaterialOptions.value = [option];
      form.value.plantingMaterial = option.value;
    }
  }
  console.log('Selected variety remark:', remark, '=> seedType:', form.value.seedType, '=> plantingMaterial:', form.value.plantingMaterial);
};

const autoMatchSeedTypeByCropId = async (cropId: string | number | undefined) => {
  if (cropId === undefined || cropId === null || cropId === '') {
    form.value.seedType = undefined;
    resetDynamicSeedTypeOptions();
    return;
  }
  try {
    const res = await getCropMaster(cropId);
    const cropName = res?.data?.cropName ? String(res.data.cropName) : '';
    if (cropName) {
      // Show cropName in select while persisting cropId as the value.
      dynamicSeedTypeOptions.value = [{ label: cropName, value: String(cropId) }];
      form.value.seedType = String(cropId);
      return;
    }
  } catch (error) {
    console.error('Failed to fetch Crop Master by cropId:', cropId, error);
  }
  const fallback = String(cropId);
  dynamicSeedTypeOptions.value = [{ label: fallback, value: fallback }];
  form.value.seedType = fallback;
};

const productionSeasonOptions = ref([]);
const productionSeasonList = ref([]);
const productionSeasonLoading = ref(false);
const productionSeasonRemoteMethod = async (query: string) => {
  if (query) {
    productionSeasonLoading.value = true;

    const res = await listProductionSeason({
      pageNum: 1,
      pageSize: 10,
      prodSeasonId: query,
      status: CroppingSeasonStatus.Planned.toString()
    });
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
const handleProductionSeasonSelect = async (prodSeasonId: string | number, preserveCurrentValues = false) => {
  console.log('handleProductionSeasonSelect called with:', prodSeasonId);
  console.log('productionSeasonList:', productionSeasonList.value);

  // If prodSeasonId already has a value (user is reselecting), clear the date
  if (form.value.prodSeasonId && !preserveCurrentValues) {
    form.value.sowingDate = undefined;
  }

  // Find the selected Production Season from the list to get year and seasonId
  let selectedSeason = productionSeasonList.value.find((item: any) => item.prodSeasonId === prodSeasonId);

  // If not found in the list, try to fetch it
  if (!selectedSeason && prodSeasonId) {
    try {
      const res = await listProductionSeason({
        pageNum: 1,
        pageSize: 10,
        prodSeasonId: String(prodSeasonId),
        status: CroppingSeasonStatus.Planned.toString()
      });
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
    selectedProductionSeasonYear.value = undefined;
    selectedProductionSeasonSeasonId.value = undefined;
    resetDynamicSowingVarietyOptions();
    resetDynamicSeedTypeOptions();
    resetDynamicPlantingMaterialOptions();
    if (!preserveCurrentValues) {
      form.value.seedType = undefined;
      form.value.plantingMaterial = undefined;
    }
    return;
  }

  selectedProductionSeasonYear.value = selectedSeason.year ? Number(selectedSeason.year) : undefined;
  selectedProductionSeasonSeasonId.value = selectedSeason.seasonId ? Number(selectedSeason.seasonId) : undefined;
  const selectedCropId = (selectedSeason as any).cropId;
  console.log('Selected Production Season cropId:', selectedCropId);
  console.log('Selected crop id for crop master:', selectedCropId);

  if (selectedCropId !== undefined && selectedCropId !== null && selectedCropId !== '') {
    try {
      const cropRes = await getCropMaster(selectedCropId);
      const description = cropRes?.data?.description ? String(cropRes.data.description) : '';
      const varietyValues = description
        .split(',')
        .map((item) => item.trim())
        .filter((item) => !!item);
      dynamicSowingVarietyOptions.value = varietyValues.map((item) => ({
        label: item,
        value: item
      }));
      if (preserveCurrentValues) {
        if (form.value.seedLotCode !== undefined && form.value.seedLotCode !== null && form.value.seedLotCode !== '') {
          handleSeedLotCodeChange(form.value.seedLotCode);
        } else {
          resetDynamicSeedTypeOptions();
          resetDynamicPlantingMaterialOptions();
        }
        // Edit/View should keep DB value of seedType. Do not overwrite from Production Season linkage.
      } else {
        form.value.seedLotCode = undefined;
        form.value.plantingMaterial = undefined;
        await autoMatchSeedTypeByCropId(selectedCropId);
        resetDynamicPlantingMaterialOptions();
      }
    } catch (error) {
      console.error('Failed to load dynamic variety options from crop master description:', error);
      resetDynamicSowingVarietyOptions();
      resetDynamicSeedTypeOptions();
      resetDynamicPlantingMaterialOptions();
    }
  } else {
    resetDynamicSowingVarietyOptions();
    if (!preserveCurrentValues) {
      await autoMatchSeedTypeByCropId(selectedCropId);
    }
    resetDynamicPlantingMaterialOptions();
  }
};

/** In Edit/View, keep DB seedType value and only backfill display option */
const ensureSeedTypeOptionByCurrentValue = async () => {
  const current = form.value.seedType;
  if (current === undefined || current === null || current === '') {
    resetDynamicSeedTypeOptions();
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

const initFormData: SowingForm = {
  sowingId: undefined,
  prodSeasonId: undefined,
  sowingDate: undefined,
  seedLotCode: undefined,
  seedType: undefined,
  plantingMaterial: undefined,
  seedRateKg: undefined,
  spacingCm: undefined,
  plantSpacingCm: undefined,
  method: undefined,
  recordedBy: undefined,
  deptId: undefined,
  remark: undefined,
  status: ApprovalStatus.Draft.toString(),
  approvedComment: undefined
};

const form = ref<SowingForm>({ ...initFormData });

const rules = {
  sowingId: [{ required: true, message: 'Sowing Record ID cannot be empty', trigger: 'blur' }],
  prodSeasonId: [{ required: true, message: 'Production Season ID cannot be empty', trigger: 'blur' }],
  sowingDate: [{ required: true, message: 'Sowing Date cannot be empty', trigger: 'blur' }],
  seedLotCode: [{ required: true, message: 'Variety name cannot be empty', trigger: 'blur' }],
  seedType: [{ required: true, message: 'Crop Type cannot be empty', trigger: 'blur' }],
  seedRateKg: [{ required: true, message: 'Quantity cannot be empty', trigger: 'blur' }],
  method: [{ required: true, message: 'Method cannot be empty', trigger: 'change' }],
  spacingCm: [],
  plantSpacingCm: [],
  recordedBy: [{ required: true, message: 'Recorded By ID cannot be empty', trigger: 'blur' }]
};

const showSpacingFields = computed(() => isSpacingRequired(form.value.method));

const syncSpacingFormRules = () => {
  if (isSpacingRequired(form.value.method)) {
    rules.spacingCm = [{ required: true, message: 'Row Spacing (cm) cannot be empty', trigger: ['blur', 'change'] }];
    rules.plantSpacingCm = [{ required: true, message: 'Plant Spacing (cm) cannot be empty', trigger: ['blur', 'change'] }];
  } else {
    rules.spacingCm = [];
    rules.plantSpacingCm = [];
  }
};

const handleMethodChange = () => {
  if (!showSpacingFields.value) {
    form.value.spacingCm = undefined;
    form.value.plantSpacingCm = undefined;
  }
  syncSpacingFormRules();
  nextTick(() => {
    if (showSpacingFields.value) {
      sowingFormRef.value?.validateField(['spacingCm', 'plantSpacingCm']).catch(() => undefined);
    } else {
      sowingFormRef.value?.clearValidate(['spacingCm', 'plantSpacingCm']);
    }
  });
};

watch(
  () => form.value.method,
  () => syncSpacingFormRules()
);

/** Disable date function for Sowing Date picker */
const disabledSowingDate = (time: Date) => {
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
  // Season ID === 1: Meher - only allow June 11 to July 10
  // Season ID === 2: Belg - only allow February 21 to March 31
  // Season ID === other: Irrigation - only allow October 1 to November 30
  if (selectedProductionSeasonSeasonId.value === 1) {
    // Meher: only allow June 11 to July 10
    if (timeMonth === 6) {
      return !(timeDate >= 11);
    } else if (timeMonth === 7) {
      return !(timeDate <= 10);
    } else {
      return true; // Disable all other months
    }
  } else if (selectedProductionSeasonSeasonId.value === 2) {
    // Belg: only allow February 21 to March 31
    if (timeMonth === 2) {
      return !(timeDate >= 21);
    } else if (timeMonth === 3) {
      return !(timeDate <= 31);
    } else {
      return true; // Disable all other months
    }
  } else if (selectedProductionSeasonSeasonId.value) {
    // Irrigation: only allow October 1 to November 30
    if (timeMonth === 10) {
      return !(timeDate >= 1);
    } else if (timeMonth === 11) {
      return !(timeDate <= 30);
    } else {
      return true; // Disable all other months
    }
  }

  // If no season ID is set, disable all dates
  return true;
};

const productionSeasonAllList = ref<SowingVO[]>([]);

const getAllList = async () => {
  const res = await listSowing();
  productionSeasonAllList.value = res.rows ?? [];
};

/** Form Reset */
const reset = () => {
  form.value = { ...initFormData };
  sowingFormRef.value?.resetFields();
  selectedProductionSeasonYear.value = undefined;
  selectedProductionSeasonSeasonId.value = undefined;
  resetDynamicSowingVarietyOptions();
  resetDynamicSeedTypeOptions();
  resetDynamicPlantingMaterialOptions();
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    reset();
    // Set current logged in user ID
    form.value.recordedBy = userStore.userId?.toString() || '';
    syncSpacingFormRules();
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getSowing(id.value);
    Object.assign(form.value, res.data);

    // Keep edit behavior consistent with add: same dynamic dict pipeline.
    if (form.value.prodSeasonId) {
      await handleProductionSeasonSelect(form.value.prodSeasonId, true);
    }
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
      form.value.status = ApprovalStatus.Draft.toString();
      if (form.value.sowingId) {
        await updateSowing(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addSowing(form.value).finally(() => (buttonLoading.value = false));
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
  await getAllList();
  resetDynamicSowingVarietyOptions();
  resetDynamicSeedTypeOptions();
  resetDynamicPlantingMaterialOptions();
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
