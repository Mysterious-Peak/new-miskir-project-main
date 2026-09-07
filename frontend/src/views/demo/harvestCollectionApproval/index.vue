<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Harvest ID" prop="harvestId">
              <el-select
                v-model="queryParams.harvestId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="harvestIdRemoteMethod"
                :loading="harvestIdLoading"
                :debounce="300"
              >
                <el-option v-for="item in harvestIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Farmer ID" prop="farmerId">
              <!-- <el-input v-model="queryParams.farmerId" placeholder="Please enter Farmer ID" clearable @keyup.enter="handleQuery" /> -->
              <el-select
                v-model="queryParams.farmerId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="farmerFilterRemoteMethod"
                :loading="farmerFilterLoading"
                :debounce="300"
              >
                <el-option v-for="item in farmerFilterOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Crop Type" prop="cropName">
              <!-- <el-select v-model="queryParams.cropName" placeholder="Please select" clearable>
                <el-option v-for="dict in cropDataList" :key="dict.id" :label="dict.cropName" :value="dict.id"></el-option>
              </el-select> -->
              <el-select
                v-model="queryParams.cropName"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="cropFilterRemoteMethod"
                :loading="cropFilterLoading"
                :debounce="300"
              >
                <el-option v-for="item in cropFilterOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="Harvest Quantity" prop="quantityQt">
              <el-input v-model="queryParams.quantityQt" placeholder="Please enter Harvest Quantity" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Moisture Percentage" prop="moisturePercentage">
              <el-input
                v-model="queryParams.moisturePercentage"
                placeholder="Please enter Moisture Percentage"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="Collection Date" prop="collectionDate">
              <el-date-picker
                clearable
                v-model="queryParams.collectionDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Please select Collection Date"
              />
            </el-form-item> -->
            <el-form-item label="Production Season ID" prop="prodSeasonId">
              <!-- <el-input v-model="queryParams.prodSeasonId" placeholder="Please input Production Season ID" clearable @keyup.enter="handleQuery" /> -->
              <el-select
                v-model="queryParams.prodSeasonId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="productionSeasonRemoteMethod"
                :loading="productionSeasonLoading"
                :debounce="300"
              >
                <el-option v-for="item in productionSeasonOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
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
          <!-- <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
          </el-col> -->
          <!-- <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()"
              >Edit</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
              >Delete</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" >Export</el-button>
          </el-col> -->
        </el-row>
      </template>

      <el-table v-loading="loading" stripe fit border :data="harvestCollectionList" @selection-change="handleSelectionChange">
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <!-- <el-table-column label="ID" align="center" prop="id" v-if="true" /> -->
        <el-table-column label="Harvest ID" align="center" prop="harvestId" :min-width="getColumnWidth('Harvest ID')" />
        <el-table-column label="Farmer ID" align="center" prop="farmerId" :min-width="getColumnWidth('Farmer ID')" />
        <el-table-column label="Production Season ID" align="center" prop="prodSeasonId" :min-width="getColumnWidth('Production Season ID')" />
        <el-table-column label="Crop Type" align="center" prop="cropName" :min-width="getColumnWidth('Crop Type')">
          <template #default="scope">
            <span>{{ scope.row.cropName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Harvest Date" align="center" prop="harvestDate" width="180" :min-width="getColumnWidth('Harvest Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.harvestDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Harested Area (ha)" align="center" prop="harvestedAreaTa" :min-width="getColumnWidth('Harested Area (ha)')" />
        <el-table-column label="Harvest Yield" align="center" prop="harvestYieldQt" :min-width="getColumnWidth('Harvest Yield')" />
        <el-table-column label="Actual Yield (q)" align="center" prop="actualYieldQt" :min-width="getColumnWidth('Actual Yield (q)')" />
        <el-table-column label="Quality Grade" align="center" prop="qualityGrade" :min-width="getColumnWidth('Quality Grade')">
          <template #default="scope">
            <dict-tag :options="harvest_quality_grade" :value="scope.row.qualityGrade" />
          </template>
        </el-table-column>
        <el-table-column label="Methods" align="center" prop="methods" :min-width="getColumnWidth('Methods')">
          <template #default="scope">
            <dict-tag :options="harvest_methods" :value="scope.row.methods" />
          </template>
        </el-table-column>
        <!-- <el-table-column label="Buyer Name" align="center" prop="buyerName" /> -->
        <el-table-column label="Recorded By" align="center" prop="recordedUserName" :min-width="getColumnWidth('Recorded By')" />
        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')">
          <template #default="scope">
            <el-tag>{{ ApprovalStatus[scope.row.status as ApprovalStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Collection Date" align="center" prop="collectionDate" width="180" :min-width="getColumnWidth('Collection Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.collectionDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Created By" align="center" prop="createdUserName" :min-width="getColumnWidth('Created By')" />
        <el-table-column label="Create Date" align="center" prop="createTime" width="180" :min-width="getColumnWidth('Create Date')">
          <template #default="scope">
            <span v-if="isNew(scope.row.createTime)" class="font-black">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            <span v-else>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approved By" align="center" prop="approvedUserName" :min-width="getColumnWidth('Approved By')" />
        <el-table-column label="Approved Date" align="center" prop="approvedAt" width="180" :min-width="getColumnWidth('Approved Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.approvedAt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approval Comment" align="center" prop="approvedComment" width="180" :min-width="getColumnWidth('Approval Comment')" />
        <el-table-column label="Actions" align="center" fixed="right" class-name="action-column" width="110">
          <template #default="scope">
            <el-button
              v-if="scope.row.status != ApprovalStatus.Created.toString()"
              class="table-action-btn table-check-btn"
              icon="View"
              @click="handleView(scope.row)"
              >View</el-button
            >
            <el-button
              v-if="scope.row.status == ApprovalStatus.Created.toString()"
              class="table-action-btn table-edit-btn"
              icon="EditPen"
              @click="handleUpdate(scope.row)"
              >Edit</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="HarvestCollection" lang="ts">
import { getCropMaster, listCropMaster } from '@/api/demo/cropMaster';
import { listSowing } from '@/api/demo/sowing';
import { listYieldEstimate } from '@/api/demo/yieldEstimate';
import {
  addHarvestCollection,
  delHarvestCollection,
  getHarvestCollection,
  listHarvestCollection,
  updateHarvestCollection
} from '@/api/demo/harvestCollection';
import { HarvestCollectionForm, HarvestCollectionQuery, HarvestCollectionVO } from '@/api/demo/harvestCollection/types';
import { listProductionSeason } from '@/api/demo/productionSeason';
import { ApprovalStatus, CroppingSeasonStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import request from '@/utils/request';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { harvest_quality_grade, harvest_methods } = toRefs<any>(proxy?.useDict('harvest_quality_grade', 'harvest_methods'));

const harvestCollectionList = ref<HarvestCollectionVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const harvestCollectionFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: HarvestCollectionForm = {
  id: undefined,
  harvestId: undefined,
  farmerId: undefined,
  cropCode: undefined,
  cropName: undefined,
  varietyName: undefined,
  measuredMoistureValue: undefined,
  harvestYieldQt: undefined,
  actualYieldQt: undefined,
  moisturePct: undefined,
  quantityQt: undefined,
  moisturePercentage: undefined,
  collectionDate: undefined,
  prodSeasonId: undefined
};
const data = reactive<PageData<HarvestCollectionForm, HarvestCollectionQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    harvestId: undefined,
    farmerId: undefined,
    cropName: undefined,
    quantityQt: undefined,
    moisturePercentage: undefined,
    collectionDate: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    id: [{ required: true, message: 'Primary Key ID cannot be empty', trigger: 'blur' }],
    harvestId: [{ required: true, message: 'Harvest Record Code cannot be empty', trigger: 'blur' }],
    farmerId: [{ required: true, message: 'Farmer ID cannot be empty', trigger: 'blur' }],
    cropCode: [{ required: true, message: 'Crop Name cannot be empty', trigger: 'blur' }],
    quantityQt: [{ required: true, message: 'Harvest Quantity cannot be empty', trigger: 'blur' }],
    moisturePercentage: [{ required: true, message: 'Moisture Percentage cannot be empty', trigger: 'blur' }],
    collectionDate: [{ required: true, message: 'Collection Date cannot be empty', trigger: 'blur' }],
    prodSeasonId: [{ required: true, message: 'Production Season ID can not be null', trigger: 'blur' }],
    harvestDate: [{ required: true, message: 'Harvest Date can not be null', trigger: 'blur' }],
    harvestYieldQt: [{ required: true, message: 'Harvest Yield can not be null', trigger: 'blur' }],
    actualYieldQt: [{ required: true, message: 'Actual Yield can not be null', trigger: 'blur' }],
    moisturePct: [{ required: true, message: 'Moisture (%) cannot be empty', trigger: 'blur' }],
    recordedBy: [{ required: true, message: 'Recorded By can not be null', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const DEFAULT_STANDARD_MOISTURE = 13;

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
  if (denominator <= 0 || measuredMoisture >= 100) {
    return undefined;
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

const harvestIdOptions = ref([]);
const harvestIdList = ref([]);
const harvestIdLoading = ref(false);
const harvestIdRemoteMethod = async (query: string) => {
  if (query) {
    harvestIdLoading.value = true;
    const res = await listHarvestCollection({ pageNum: 1, pageSize: 10, harvestId: query });
    harvestIdList.value = res.rows;
    harvestIdOptions.value = res.rows.map((item) => ({
      value: item.harvestId,
      label: `${item.harvestId}`
    }));
    harvestIdLoading.value = false;
  } else {
    harvestIdOptions.value = [];
  }
};

const farmerFilterOptions = ref([]);
const farmerFilterList = ref([]);
const farmerFilterLoading = ref(false);
const farmerFilterRemoteMethod = async (query: string) => {
  if (query) {
    farmerFilterLoading.value = true;
    const res = await request({
      url: '/demo/harvestCollection/autoComplete/farmerId',
      method: 'get',
      params: { farmerId: query }
    });
    farmerFilterList.value = res.data;
    farmerFilterOptions.value = res.data.map((item) => ({
      value: item,
      label: `${item}`
    }));
    farmerFilterLoading.value = false;
  } else {
    farmerFilterOptions.value = [];
  }
};

const cropFilterOptions = ref([]);
const cropFilterList = ref([]);
const cropFilterLoading = ref(false);
const cropFilterRemoteMethod = async (query: string) => {
  if (query) {
    cropFilterLoading.value = true;
    const res = await request({
      url: '/demo/harvestCollection/autoComplete/cropName',
      method: 'get',
      params: { cropName: query }
    });
    cropFilterList.value = res.data;
    cropFilterOptions.value = res.data.map((item) => ({
      value: item,
      label: item
    }));
    cropFilterLoading.value = false;
  } else {
    cropFilterOptions.value = [];
  }
};

const cropCodeOptions = ref([]);
const cropCodeList = ref([]);
const cropCodeLoading = ref(false);
const cropCodeRemoteMethod = async (query: string) => {
  if (query) {
    cropCodeLoading.value = true;
    const res = await listCropMaster({ pageNum: 1, pageSize: 10, cropCode: query });
    cropCodeList.value = res.rows;
    cropCodeOptions.value = res.rows.map((item) => ({
      value: item.cropCode,
      label: `${item.cropCode}`
    }));
    cropCodeLoading.value = false;
  } else {
    cropCodeOptions.value = [];
  }
};

const productionSeasonOptions = ref([]);
const productionSeasonList = ref([]);
const productionSeasonAllList = ref([]);
const productionSeasonLoading = ref(false);
const productionSeasonRemoteMethod = async (query: string) => {
  if (query) {
    productionSeasonLoading.value = true;
    const res = await listProductionSeason({
      pageNum: 1,
      pageSize: 10,
      prodSeasonId: query,
      status: CroppingSeasonStatus.InProgress.toString()
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

const getAllList = async () => {
  const res = await listHarvestCollection();
  productionSeasonAllList.value = res.rows;
};

/** Query Harvest Collection List */
const getList = async () => {
  loading.value = true;
  const query = await buildListQueryParams();
  const res = await listHarvestCollection(query);
  harvestCollectionList.value = enrichHarvestCollectionRows(res.rows);
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
  harvestCollectionFormRef.value?.resetFields();
};

/** Search Button Action */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** Reset Button Action */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** Multi-select Change */
const handleSelectionChange = (selection: HarvestCollectionVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** Add Button Action */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = 'Add Harvest Collection';
};

/** Edit Button Action */
const handleUpdate = (row?: HarvestCollectionVO) => {
  const _id = row?.id || ids.value[0];
  router.push({ name: 'HarvestCollectionApprovalApprove', params: { id: _id } });
};

const getExData = async (row) => {
  if (form.value.prodSeasonId) {
    await loadRelatedDataByProdSeason(form.value.prodSeasonId);
    return;
  }
  const crop = cropDataList.value?.find((item) => item.cropCode == row?.cropCode);
  form.value.cropName = crop?.cropName;
  syncActualYieldQt();
};

/** Submit Button */
const submitForm = () => {
  harvestCollectionFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.Approved.toString();

      if (form.value.id) {
        await updateHarvestCollection(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addHarvestCollection(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

const rejectForm = () => {
  harvestCollectionFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.Rejected.toString();

      if (form.value.id) {
        await updateHarvestCollection(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addHarvestCollection(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

const RevisionForm = () => {
  harvestCollectionFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.NeedRevision.toString();

      if (form.value.id) {
        await updateHarvestCollection(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addHarvestCollection(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

/** Delete Button Action */
const handleDelete = async (row?: HarvestCollectionVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure to delete the Harvest Collection with ID "' + _ids + '"?').finally(() => {
    loading.value = false;
  });
  await delHarvestCollection(_ids);
  proxy?.$modal.msgSuccess('Delete successful');
  await getList();
};

/** Export Button Action */
const handleExport = () => {
  proxy?.download(
    'demo/harvestCollection/export',
    {
      ...queryParams.value
    },
    `harvestCollection_${new Date().getTime()}.xlsx`
  );
};

const cropDataList = ref();
const getCropList = async () => {
  const res = await listCropMaster({ pageNum: 1, pageSize: 2000 });
  cropDataList.value = res.rows;
};

const normalizeCropName = (name?: string) => name?.trim().toLowerCase() ?? '';

const findCropMasterByName = (cropName?: string) => {
  const target = normalizeCropName(cropName);
  if (!target) {
    return undefined;
  }
  return cropDataList.value?.find((item) => normalizeCropName(item.cropName) === target);
};

const resolveCropCodeForQuery = async (cropName?: string) => {
  if (!cropName) {
    return undefined;
  }
  if (!cropDataList.value?.length) {
    await getCropList();
  }
  const matchedCrop = findCropMasterByName(cropName);
  if (matchedCrop?.cropCode) {
    return matchedCrop.cropCode;
  }
  const res = await listCropMaster({ pageNum: 1, pageSize: 20, cropName });
  const crop =
    res.rows?.find((item) => normalizeCropName(item.cropName) === normalizeCropName(cropName)) ?? res.rows?.[0];
  return crop?.cropCode;
};

const buildListQueryParams = async (): Promise<HarvestCollectionQuery> => {
  const query: HarvestCollectionQuery = { ...queryParams.value };
  if (query.cropName) {
    query.cropCode = await resolveCropCodeForQuery(query.cropName);
  } else {
    query.cropCode = undefined;
  }
  return query;
};

const isDateLikeValue = (value: unknown) => /^\d{4}-\d{2}-\d{2}/.test(String(value ?? ''));

const resolveCropDisplayName = (row?: HarvestCollectionVO) => {
  const crop = cropDataList.value?.find(
    (item) => item.cropCode == row?.cropCode || String(item.id) === String(row?.cropCode)
  );
  if (crop?.cropName) {
    return crop.cropName;
  }
  if (row?.cropName && !isDateLikeValue(row.cropName)) {
    return String(row.cropName);
  }
  return '';
};

const enrichHarvestCollectionRows = (rows: HarvestCollectionVO[] = []) =>
  rows.map((row) => ({
    ...row,
    cropName: resolveCropDisplayName(row)
  }));

const handleView = (row?: HarvestCollectionVO) => {
  const _id = row?.id || ids.value[0];
  router.push({ name: 'HarvestCollectionApprovalDetail', params: { id: _id } });
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

  const selectedSeason = await resolveProductionSeason(prodSeasonId);
  if (!selectedSeason) {
    syncActualYieldQt();
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
    form.value.measuredMoistureValue = moisture === undefined || moisture === null ? undefined : Number(moisture);
  } catch {
    form.value.measuredMoistureValue = cropMasterMoisture;
  }
  if (form.value.measuredMoistureValue == null) {
    form.value.measuredMoistureValue = DEFAULT_STANDARD_MOISTURE;
  }
  syncActualYieldQt();
};

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

onMounted(async () => {
  await getCropList();
  await getAllList();
  await getList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});
</script>

