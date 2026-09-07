<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Production Season ID" prop="prodSeasonId">
              <!-- <el-input v-model="queryParams.prodSeasonId" placeholder="Please input Production Season ID" clearable @keyup.enter="handleQuery" /> -->
              <el-select
                v-model="queryParams.prodSeasonId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="productionSeasonRemoteMethodFilter"
                :loading="productionSeasonLoadingFilter"
                :debounce="300"
                @change="handleQueryProductionSeasonSelect"
                clearable
              >
                <el-option v-for="item in productionSeasonOptionsFilter" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="Crop Type" prop="seedType">
              <el-select v-model="queryParams.seedType" placeholder="" disabled>
                <el-option v-for="dict in queryDynamicSeedTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
              </el-select>
            </el-form-item> -->
            <el-form-item label="Variety name" prop="seedLotCode">
              <el-select v-model="queryParams.seedLotCode" placeholder="Please select" clearable>
                <el-option v-for="dict in queryDynamicSowingVarietyOptions" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Sowing Date" prop="sowingDate">
              <el-date-picker
                clearable
                v-model="queryParams.sowingDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Please select Sowing Date"
              />
            </el-form-item>
            <!-- <el-form-item label="Seed Type (e.g. Obsa-23)" prop="seedType">
              <el-input v-model="queryParams.seedType" placeholder="Please enter Seed Type (e.g. Obsa-23)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Quantity" prop="seedRateKg">
              <el-input v-model="queryParams.seedRateKg" placeholder="Please enter Quantity" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Spacing (cm)" prop="spacingCm">
              <el-input v-model="queryParams.spacingCm" placeholder="Please enter Spacing (cm)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Method" prop="method">
              <el-input v-model="queryParams.method" placeholder="Please enter Method" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Recorded By ID" prop="recordedBy">
              <el-input v-model="queryParams.recordedBy" placeholder="Please enter Recorded By ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Department ID" prop="deptId">
              <el-input v-model="queryParams.deptId" placeholder="Please enter Department ID" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <el-form-item class="search-actions">
              <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
              <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="18"><span class="table-page-title"><el-icon class="table-page-title-icon"><Tickets /></el-icon> {{ ($route.meta.title || "") + " List" }}</span></el-col>
          <!-- <el-col :span="1.5" style="margin-left: auto">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['demo:sowing:remove']"
              >Delete</el-button
            >
          </el-col> --> 
          <el-col :span="1.5" style="margin-left: auto; margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="sowingList" @selection-change="handleSelectionChange" stripe fit border>
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column label="Sowing Record ID" align="center" prop="sowingId" v-if="true" :min-width="getColumnWidth('Sowing Record ID')" />
        <el-table-column label="Production Season ID" align="center" prop="prodSeasonId" :min-width="getColumnWidth('Production Season ID')" />
        <!-- <el-table-column label="Variety name" align="center" prop="seedLotCode" /> -->
        <el-table-column label="Crop Type" align="center" prop="seedType" :min-width="getColumnWidth('Crop Type')">
          <template #default="scope">
            <dict-tag :options="sowingSeedTypeTagOptions" :value="scope.row.seedType" />
          </template>
        </el-table-column>
        <el-table-column label="Variety name" align="center" prop="seedLotCode" :min-width="getColumnWidth('Variety name')">
          <template #default="scope">
            <dict-tag :options="sowingVarietyTagOptions" :value="scope.row.seedLotCode" />
          </template>
        </el-table-column>
        <el-table-column label="Quantity" align="center" prop="seedRateKg" :min-width="getColumnWidth('Quantity')" />
        <el-table-column label="Method" align="center" prop="method" :min-width="getColumnWidth('Method')">
          <template #default="scope">
            <dict-tag :options="sowing_method" :value="scope.row.method" />
          </template>
        </el-table-column>

        <el-table-column label="Row Spacing (cm)" align="center" prop="spacingCm" :min-width="getColumnWidth('Row Spacing (cm)')" />
        <el-table-column label="Plant Spacing (cm)" align="center" prop="plantSpacingCm" :min-width="getColumnWidth('Plant Spacing (cm)')" />

        <el-table-column label="Sowing Date" align="center" prop="sowingDate" :min-width="getColumnWidth('Sowing Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.sowingDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Recorded By" align="center" prop="recordedUserName" :min-width="getColumnWidth('Recorded By')" />
        <!-- <el-table-column label="Department ID" align="center" prop="deptId" />
        <el-table-column label="Remark" align="center" prop="remark" /> -->
        <el-table-column label="Create Date" align="center" prop="createTime" :min-width="getColumnWidth('Create Date')">
          <template #default="scope">
            <span v-if="isNew(scope.row.createTime)" class="font-black">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            <span v-else>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approved By" align="center" prop="approvedUserName" :min-width="getColumnWidth('Approved By')" />
        <el-table-column label="Approved Date" align="center" prop="approvedAt" :min-width="getColumnWidth('Approved Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.approvedAt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approval Comment" align="center" prop="approvedComment" width="180" />
        <el-table-column label="Status" align="center" prop="status">
          <template #default="scope">
            <el-tag>{{ ApprovalStatus[scope.row.status as ApprovalStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" fixed="right" class-name="action-column" width="110">
          <template #default="scope">
            <el-button v-if="isViewFlag(scope.row)" class="table-action-btn table-check-btn" icon="View" @click="handleView(scope.row)"
              >View</el-button
            >
            <el-button v-if="!isViewFlag(scope.row)" class="table-action-btn table-edit-btn" icon="EditPen" @click="handleUpdate(scope.row)"
              >Edit</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or Edit Sowing Record Dialog -->
  </div>
</template>

<script setup name="Sowing" lang="ts">
import { listProductionSeason } from '@/api/demo/productionSeason';
import { getCropMaster } from '@/api/demo/cropMaster';
import { addSowing, delSowing, getSowing, listSowing, updateSowing } from '@/api/demo/sowing';
import { SowingForm, SowingQuery, SowingVO } from '@/api/demo/sowing/types';
import { ApprovalStatus, CroppingSeasonStatus } from '@/enums/AgriculturalEnum';
import { useUserStore } from '@/store/modules/user';
import { isNew } from '@/utils/FarmTools';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

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

const sowingList = ref<SowingVO[]>([]);
const sowingSeedTypeNameMap = ref<Record<string, string>>({});
const sowingVarietyTagOptions = computed(() =>
  Array.from(new Set((sowingList.value || []).map((item: any) => String(item.seedLotCode || '')).filter((item) => !!item))).map((item) => ({
    label: item,
    value: item
  }))
);
const sowingSeedTypeTagOptions = computed(() =>
  Array.from(new Set((sowingList.value || []).map((item: any) => String(item.seedType || '')).filter((item) => !!item))).map((item) => ({
    label: sowingSeedTypeNameMap.value[item] || item,
    value: item
  }))
);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

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
const queryDynamicSowingVarietyOptions = ref<any[]>([]);
const queryDynamicSeedTypeOptions = ref<any[]>([]);
const resetDynamicSowingVarietyOptions = () => {
  dynamicSowingVarietyOptions.value = [];
};
const resetDynamicSeedTypeOptions = () => {
  dynamicSeedTypeOptions.value = [];
};
const resetDynamicPlantingMaterialOptions = () => {
  dynamicPlantingMaterialOptions.value = [];
};
const resetQueryDynamicSowingVarietyOptions = () => {
  queryDynamicSowingVarietyOptions.value = [];
};
const resetQueryDynamicSeedTypeOptions = () => {
  queryDynamicSeedTypeOptions.value = [];
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

const autoMatchQuerySeedTypeByCropId = async (cropId: string | number | undefined) => {
  if (cropId === undefined || cropId === null || cropId === '') {
    queryParams.value.seedType = undefined;
    resetQueryDynamicSeedTypeOptions();
    return;
  }
  try {
    const res = await getCropMaster(cropId);
    const cropName = res?.data?.cropName ? String(res.data.cropName) : '';
    if (cropName) {
      queryDynamicSeedTypeOptions.value = [{ label: cropName, value: String(cropId) }];
      queryParams.value.seedType = String(cropId);
      return;
    }
  } catch (error) {
    console.error('Failed to fetch Crop Master for query seedType:', cropId, error);
  }
  const fallback = String(cropId);
  queryDynamicSeedTypeOptions.value = [{ label: fallback, value: fallback }];
  queryParams.value.seedType = fallback;
};

const handleQueryProductionSeasonSelect = async (prodSeasonId: string | number) => {
  let selectedSeason = productionSeasonList.value.find((item: any) => item.prodSeasonId === prodSeasonId);
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
      }
    } catch (error) {
      console.error('Failed to fetch Production Season for query form:', error);
    }
  }

  if (!selectedSeason) {
    queryParams.value.seedLotCode = undefined;
    queryParams.value.seedType = undefined;
    resetQueryDynamicSowingVarietyOptions();
    resetQueryDynamicSeedTypeOptions();
    return;
  }

  const selectedCropId = (selectedSeason as any).cropId;
  try {
    const cropRes = await getCropMaster(selectedCropId);
    const description = cropRes?.data?.description ? String(cropRes.data.description) : '';
    const varietyValues = description
      .split(',')
      .map((item) => item.trim())
      .filter((item) => !!item);
    queryDynamicSowingVarietyOptions.value = varietyValues.map((item) => ({
      label: item,
      value: item
    }));
    queryParams.value.seedLotCode = undefined;
    await autoMatchQuerySeedTypeByCropId(selectedCropId);
  } catch (error) {
    console.error('Failed to load query variety options from crop master description:', error);
    queryParams.value.seedLotCode = undefined;
    queryParams.value.seedType = undefined;
    resetQueryDynamicSowingVarietyOptions();
    resetQueryDynamicSeedTypeOptions();
  }
};

// const inputTypeData = ref<any>();
// const inputTypeOptions = ref<Array<any>>([]);

const queryFormRef = ref<ElFormInstance>();
const sowingFormRef = ref<ElFormInstance>();
const productionSeasonAllList = ref<SowingVO[]>([]);
const productionSeasonOptionsFilter = ref([]);
const productionSeasonListFilter = ref([]);
const productionSeasonLoadingFilter = ref(false);
const productionSeasonRemoteMethodFilter = async (query: string) => {
  if (query) {
    productionSeasonListFilter.value = [
      ...new Set(
        productionSeasonAllList.value
          .filter((f) => f.prodSeasonId?.toString().toLowerCase().includes(query.toLowerCase()))
          .map((item) => item.prodSeasonId)
      )
    ];
    productionSeasonLoadingFilter.value = true;
    productionSeasonOptionsFilter.value = productionSeasonListFilter.value.map((item) => ({
      value: item,
      label: `${item}`
    }));
    productionSeasonLoadingFilter.value = false;
  } else {
    productionSeasonOptionsFilter.value = [];
  }
};

const getAllList = async () => {
  const res = await listSowing();
  productionSeasonAllList.value = res.rows ?? [];
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

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

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
const data = reactive<PageData<SowingForm, SowingQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    prodSeasonId: undefined,
    sowingDate: undefined,
    seedLotCode: undefined,
    seedType: undefined,
    seedRateKg: undefined,
    spacingCm: undefined,
    method: undefined,
    recordedBy: undefined,
    deptId: undefined,
    params: {},
    status: undefined,
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
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
  }
});

const { queryParams, form, rules } = toRefs(data);

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

/** Query Sowing Record List */
const getList = async () => {
  loading.value = true;
  const res = await listSowing(queryParams.value);
  sowingList.value = res.rows;
  const seedTypeIds = Array.from(new Set((res.rows || []).map((item: any) => String(item.seedType || '')).filter((item) => !!item)));
  const localSeedTypeNameMap: Record<string, string> = {};
  await Promise.all(
    seedTypeIds.map(async (id) => {
      try {
        const cropRes = await getCropMaster(id);
        const cropName = cropRes?.data?.cropName ? String(cropRes.data.cropName) : '';
        if (cropName) {
          localSeedTypeNameMap[id] = cropName;
        }
      } catch (error) {
        console.error('Failed to fetch Crop Master for seedType id:', id, error);
      }
    })
  );
  sowingSeedTypeNameMap.value = localSeedTypeNameMap;
  total.value = res.total;
  loading.value = false;
};

/** Cancel Button */
const cancel = () => {
  reset();
  dialog.visible = false;
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

/** Search Button Action */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** Reset Button Action */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  resetQueryDynamicSowingVarietyOptions();
  resetQueryDynamicSeedTypeOptions();
  handleQuery();
};

/** Multi-select Change */
const handleSelectionChange = (selection: SowingVO[]) => {
  ids.value = selection.map((item) => item.sowingId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** Add Button Action */
const handleAdd = () => {
  router.push({ name: 'SowingAdd' });
};

/** Edit Button Action */
const handleUpdate = (row?: SowingVO) => {
  const _sowingId = row?.sowingId || ids.value[0];
  router.push({ name: 'SowingEdit', params: { id: _sowingId } });
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
      dialog.visible = false;
      await getList();
      await getAllList();
    }
  });
};

/** Delete Button Action */
const handleDelete = async (row?: SowingVO) => {
  const _sowingIds = row?.sowingId || ids.value;
  await proxy?.$modal.confirm('Are you sure to delete the Sowing Record with ID "' + _sowingIds + '"?').finally(() => (loading.value = false));
  await delSowing(_sowingIds);
  proxy?.$modal.msgSuccess('Delete successful');
  await getList();
};

/** Export Button Action */
const handleExport = () => {
  proxy?.download(
    'demo/sowing/export',
    {
      ...queryParams.value
    },
    `sowing_${new Date().getTime()}.xlsx`
  );
};

onMounted(async () => {
  await getAllList();
  getList();
  resetDynamicSowingVarietyOptions();
  resetDynamicSeedTypeOptions();
  resetDynamicPlantingMaterialOptions();
  // inputTypeData.value = await getInputTypeData();
  // const formattedOptions = formatInputTypeJson(inputTypeData.value);
  // // Get children from the first item
  // inputTypeOptions.value =
  //   Array.isArray(formattedOptions) && formattedOptions.length > 0 && formattedOptions[0]?.children ? formattedOptions[0].children : [];
  // console.log('inputTypeOptions', inputTypeOptions.value);
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});

const isViewFlag = (data) => {
  return data.status == ApprovalStatus.Approved || data.status == ApprovalStatus.Rejected;
};

const handleView = (row?: SowingVO) => {
  const _sowingId = row?.sowingId || ids.value[0];
  router.push({ name: 'SowingDetail', params: { id: _sowingId } });
};
</script>

