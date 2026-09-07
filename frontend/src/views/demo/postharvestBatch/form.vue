<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="postharvestBatchFormRef" :model="form" :rules="rules" label-width="auto">
        <div class="flex items-end justify-between gap-4 flex-wrap">
          <div class="flex items-end gap-4 flex-wrap">
            <el-form-item label="Batch ID" prop="batchId" style="width: 280px" v-show="isShow">
              <el-input v-model="form.batchId" placeholder="Please input Batch ID" disabled />
            </el-form-item>
            <el-form-item label="Crop Type" prop="cropCode" class="postharvest-batch-crop-type-item">
              <el-select
                v-model="form.cropCode"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="cropCodeRemoteMethod"
                :loading="cropCodeLoading"
                :debounce="300"
                class="!w-full"
                @change="handleCropCodeChange"
                v-if="!isViewFlag(form)"
              >
                <el-option v-for="item in cropCodeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
              <el-input v-else :model-value="getCropDisplayName(form)" class="!w-full" placeholder="Please input" disabled />
            </el-form-item>
          </div>
        </div>
        <!-- <el-form-item label="Batch Weight(qt)" prop="batchWeightQt">
          <div v-if="!isViewFlag(form)" class="flex gap-2">
            <el-input v-model="form.batchWeightQt" placeholder="Please input" disabled />
            <el-button
              type="primary"
              @click="handleLoadAvailableData"
              :disabled="form.cropCode == undefined"
              style="width: fit-content !important"
              >Select Harvest Collection</el-button
            >
          </div>
          <el-input v-else v-model="form.batchWeightQt" placeholder="Please input" disabled />
        </el-form-item> -->
        <!-- <el-form-item label="Creation Date" prop="creationDate" v-if="isViewFlag(form)">
          <el-date-picker clearable v-model="form.creationDate" type="date" value-format="YYYY-MM-DD" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item> -->
        <el-form-item label="Created By" prop="createdUserName" v-if="isViewFlag(form)">
          <el-input v-model="form.createdUserName" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Created Date" prop="createTime" v-if="isViewFlag(form)">
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

        <template v-if="!isViewFlag(form)">
          <el-card shadow="never" class="mb-3" style="border: 1px solid #dcdfe6 !important">
            <div class="flex items-center gap-3 mb-2 flex-nowrap overflow-x-auto">
              <div class="font-semibold whitespace-nowrap min-w-fit" style="margin-top: -20px">Harvest Data</div>
              <el-form :model="availableQueryParams" :inline="true" label-width="auto" class="flex-1 whitespace-nowrap min-w-max">
                <el-form-item label="Harvest ID">
                  <el-input v-model="availableQueryParams.harvestId" placeholder="Please input Harvest ID" clearable style="width: 190px" />
                </el-form-item>
                <el-form-item label="Farmer ID">
                  <el-input v-model="availableQueryParams.farmerId" placeholder="Please input Farmer ID" clearable style="width: 190px" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" icon="Search" @click="handleQueryAvailable">Search</el-button>
                  <el-button icon="Refresh" @click="resetAvailableQuery">Reset</el-button>
                </el-form-item>
              </el-form>
            </div>
            <el-table v-loading="availableLoading" stripe fit border row-key="id" :data="unifiedHarvestCollectionList">
              <el-table-column width="55" align="center">
                <template #header>
                  <el-checkbox
                    :model-value="allVisibleHarvestSelected"
                    :indeterminate="someVisibleHarvestSelected"
                    @change="toggleAllVisibleHarvest"
                  />
                </template>
                <template #default="scope">
                  <el-checkbox
                    :model-value="isHarvestSelected(scope.row)"
                    @change="(checked) => handleHarvestCheckboxChange(scope.row, checked)"
                    @click.stop
                  />
                </template>
              </el-table-column>
              <el-table-column label="Harvest ID" align="center" prop="harvestId" :min-width="getColumnWidth('Harvest ID')" />
              <el-table-column label="Farmer ID" align="center" prop="farmerId" :min-width="getColumnWidth('Farmer ID')" />
              <el-table-column label="Crop Type" align="center" prop="cropName" :formatter="cropFormatter" :min-width="getColumnWidth('Crop Type')" />
              <el-table-column label="Quantity (qt)" align="center" prop="quantityQt" :min-width="getColumnWidth('Quantity (qt)')" />
              <el-table-column label="Moisture (%)" align="center" prop="moisturePercentage" :min-width="getColumnWidth('Moisture (%)')" />
              <el-table-column
                label="Collection Date"
                align="center"
                prop="collectionDate"
                width="180"
                :min-width="getColumnWidth('Collection Date')"
              >
                <template #default="scope">
                  <span>{{ parseTime(scope.row.collectionDate, '{y}-{m}-{d}') }}</span>
                </template>
              </el-table-column>
            </el-table>
            <pagination
              v-show="availableTotal > 0"
              :total="availableTotal"
              v-model:page="availableQueryParams.pageNum"
              v-model:limit="availableQueryParams.pageSize"
              @pagination="getAvailableHarvestList"
            />
            <div class="mt-4 text-right">
              Selected Harvest Weight (qt): <span class="font-semibold">{{ form.batchWeightQt || 0 }}</span>
            </div>
          </el-card>
        </template>

        <template v-else>
          <el-table stripe fit border :data="harvestCollectionList" class="mt-2">
            <el-table-column label="Harvest ID" align="center" prop="harvestId" :min-width="getColumnWidth('Harvest ID')" />
            <el-table-column label="Farmer ID" align="center" prop="farmerId" :min-width="getColumnWidth('Farmer ID')" />
            <el-table-column label="Crop Type" align="center" prop="cropName" :formatter="cropFormatter" :min-width="getColumnWidth('Crop Type')" />
            <el-table-column label="Quantity (qt)" align="center" prop="quantityQt" :min-width="getColumnWidth('Quantity (qt)')" />
            <el-table-column label="Moisture (%)" align="center" prop="moisturePercentage" :min-width="getColumnWidth('Moisture (%)')" />
            <el-table-column label="Collection Date" align="center" prop="collectionDate" width="180" :min-width="getColumnWidth('Collection Date')">
              <template #default="scope">
                <span>{{ parseTime(scope.row.collectionDate, '{y}-{m}-{d}') }}</span>
              </template>
            </el-table-column>
          </el-table>
        </template>
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

<script setup name="PostharvestBatchForm" lang="ts">
import { listCropMaster } from '@/api/demo/cropMaster';
import { HarvestCollectionVO } from '@/api/demo/harvestCollection/types';
import { addPostharvestBatch, getPostharvestBatch, updatePostharvestBatch } from '@/api/demo/postharvestBatch';
import { PostharvestBatchForm } from '@/api/demo/postharvestBatch/types';
import { PostHarvestBatchStatus } from '@/enums/AgriculturalEnum';
import request from '@/utils/request';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const postharvestBatchFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const isShow = computed(() => {
  return !isAdd.value;
});

const harvestCollectionList = ref<HarvestCollectionVO[]>([]);
const availableHarvestCollectionList = ref<HarvestCollectionVO[]>([]);
const availableLoading = ref(false);
const availableTotal = ref(0);

const initFormData: PostharvestBatchForm = {
  id: undefined,
  batchId: undefined,
  harvestIdsJson: undefined,
  cropCode: undefined,
  cropName: undefined,
  batchWeightQt: undefined,
  creationDate: undefined,
  status: PostHarvestBatchStatus.Created.toString()
};

const form = ref<PostharvestBatchForm>({ ...initFormData });

const rules = {
  id: [{ required: true, message: 'ID cannot be empty', trigger: 'blur' }],
  // batchId: [{ required: true, message: 'Batch ID cannot be empty', trigger: 'blur' }],
  // harvestIdsJson: [{ required: true, message: '关联的收获记录ID列表不能为空 cannot be empty', trigger: 'blur' }],
  cropCode: [{ required: true, message: 'Crop Name cannot be empty', trigger: 'blur' }],
  batchWeightQt: [{ required: true, message: 'Batch Weight cannot be empty', trigger: 'blur' }],
  // creationDate: [{ required: true, message: '批次创建日期时间不能为空 cannot be empty', trigger: 'blur' }],
  status: [{ required: true, message: 'Status cannot be empty', trigger: 'change' }]
};

const availableQueryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  harvestId: undefined as string | undefined,
  farmerId: undefined as string | undefined
});
const unifiedHarvestCollectionList = computed(() => {
  const selectedIds = new Set(harvestCollectionList.value.map((item) => item.id));
  return [...harvestCollectionList.value, ...availableHarvestCollectionList.value.filter((item) => !selectedIds.has(item.id))];
});

const cropCodeOptions = ref<Array<{ value: string; label: string }>>([]);
const cropCodeList = ref<Array<{ cropCode: string; cropName?: string }>>([]);
const cropCodeLoading = ref(false);

const mapCropMasterToOptions = (rows: Array<{ cropCode?: string; cropName?: string }>) => {
  const dedup = new Map<string, { cropCode: string; cropName?: string }>();
  (rows || []).forEach((item) => {
    if (item.cropCode) {
      dedup.set(item.cropCode, { cropCode: item.cropCode, cropName: item.cropName });
    }
  });
  return [...dedup.values()].map((item) => ({
    value: item.cropCode,
    label: item.cropName || item.cropCode
  }));
};

const syncCropCodeOptionForForm = (cropCode?: string, cropName?: string) => {
  if (!cropCode) {
    return;
  }
  const label = cropName || resolveCropNameByCode(cropCode);
  if (!cropCodeOptions.value.some((item) => item.value === cropCode)) {
    cropCodeOptions.value = [{ value: cropCode, label }, ...cropCodeOptions.value];
  }
};

const cropCodeRemoteMethod = async (query: string) => {
  if (!query) {
    syncCropCodeOptionForForm(form.value.cropCode, form.value.cropName);
    if (!form.value.cropCode) {
      cropCodeOptions.value = [];
    }
    return;
  }
  cropCodeLoading.value = true;
  try {
    const [byCodeRes, byNameRes] = await Promise.all([
      listCropMaster({ pageNum: 1, pageSize: 20, cropCode: query }),
      listCropMaster({ pageNum: 1, pageSize: 20, cropName: query })
    ]);
    const dedup = new Map<string, { cropCode: string; cropName?: string }>();
    [...(byCodeRes.rows || []), ...(byNameRes.rows || [])].forEach((item) => {
      if (item.cropCode) {
        dedup.set(item.cropCode, item);
      }
    });
    cropCodeList.value = [...dedup.values()];
    cropCodeOptions.value = mapCropMasterToOptions(cropCodeList.value);
    syncCropCodeOptionForForm(form.value.cropCode, form.value.cropName);
  } finally {
    cropCodeLoading.value = false;
  }
};

const cropDataList = ref();
const getCropList = async () => {
  const res = await listCropMaster({ pageNum: 1, pageSize: 2000 });
  cropDataList.value = res.rows || [];
};

const resolveCropNameByCode = (cropCode?: string) => {
  if (!cropCode) {
    return '—';
  }
  const found = cropDataList.value?.find((item) => item.cropCode === cropCode);
  return found?.cropName || cropCode;
};

const getCropDisplayName = (row?: { cropCode?: string; cropName?: string }) => {
  if (row?.cropName) {
    return row.cropName;
  }
  return resolveCropNameByCode(row?.cropCode);
};

const cropFormatter = (row: { cropCode?: string; cropName?: string }) => {
  return getCropDisplayName(row);
};

const isViewFlag = (data) => {
  return data.status != PostHarvestBatchStatus.Created;
};

const getExData = async (row) => {
  const res = await request({
    url: `/demo/postharvestBatch/${row.id}/connection`,
    method: 'get'
  });
  harvestCollectionList.value = res.data;
  syncSelectedHarvestData();

  form.value.cropName = row.cropName || cropDataList.value?.find((item) => item.cropCode == row.cropCode)?.cropName;
  syncCropCodeOptionForForm(form.value.cropCode, form.value.cropName);
  await getAvailableHarvestList();
};

const handleCropCodeChange = async (cropCode: string) => {
  const crop = cropCodeList.value?.find((item) => item.cropCode === cropCode) || cropDataList.value?.find((item) => item.cropCode === cropCode);
  form.value.cropName = crop?.cropName;
  syncCropCodeOptionForForm(cropCode, form.value.cropName);
  harvestCollectionList.value = [];
  syncSelectedHarvestData();
  await getAvailableHarvestList();
};

const syncSelectedHarvestData = () => {
  form.value.batchWeightQt = harvestCollectionList.value.reduce((total, item) => total + (item.quantityQt || 0), 0);
  const harvestIds = harvestCollectionList.value.map((item) => item.id);
  form.value.harvestIdsJson = JSON.stringify(harvestIds);
};

const getAvailableHarvestList = async () => {
  if (!form.value.cropCode) {
    availableHarvestCollectionList.value = [];
    availableTotal.value = 0;
    return;
  }
  availableLoading.value = true;
  try {
    const res = await request({
      url: '/demo/harvestCollection/list/unused',
      method: 'get',
      params: {
        pageNum: availableQueryParams.pageNum,
        pageSize: availableQueryParams.pageSize,
        cropCode: form.value.cropCode,
        harvestId: availableQueryParams.harvestId,
        farmerId: availableQueryParams.farmerId
      }
    });
    const selectedIds = new Set(harvestCollectionList.value.map((item) => item.id));
    availableHarvestCollectionList.value = (res.rows || []).filter((item) => !selectedIds.has(item.id));
    availableTotal.value = (res.total || availableHarvestCollectionList.value.length) + harvestCollectionList.value.length;
  } finally {
    availableLoading.value = false;
  }
};

const handleLoadAvailableData = async () => {
  availableQueryParams.pageNum = 1;
  await getAvailableHarvestList();
};

const handleQueryAvailable = () => {
  availableQueryParams.pageNum = 1;
  getAvailableHarvestList();
};

const resetAvailableQuery = () => {
  availableQueryParams.harvestId = undefined;
  availableQueryParams.farmerId = undefined;
  availableQueryParams.pageNum = 1;
  getAvailableHarvestList();
};

const isHarvestSelected = (row: HarvestCollectionVO) => harvestCollectionList.value.some((item) => item.id === row.id);

const allVisibleHarvestSelected = computed(() => {
  const rows = unifiedHarvestCollectionList.value;
  return rows.length > 0 && rows.every((row) => isHarvestSelected(row));
});

const someVisibleHarvestSelected = computed(() => {
  const rows = unifiedHarvestCollectionList.value;
  const selectedCount = rows.filter((row) => isHarvestSelected(row)).length;
  return selectedCount > 0 && selectedCount < rows.length;
});

const updateHarvestSelection = (row: HarvestCollectionVO, checked: boolean) => {
  const selectedById = new Map(harvestCollectionList.value.map((item) => [item.id, item]));
  if (checked) {
    selectedById.set(row.id, row);
  } else {
    selectedById.delete(row.id);
  }
  harvestCollectionList.value = [...selectedById.values()];
  syncSelectedHarvestData();
};

const handleHarvestCheckboxChange = (row: HarvestCollectionVO, checked: boolean | string | number) => {
  updateHarvestSelection(row, Boolean(checked));
};

const toggleAllVisibleHarvest = (checked: boolean | string | number) => {
  const selectedById = new Map(harvestCollectionList.value.map((item) => [item.id, item]));
  unifiedHarvestCollectionList.value.forEach((row) => {
    if (Boolean(checked)) {
      selectedById.set(row.id, row);
    } else {
      selectedById.delete(row.id);
    }
  });
  harvestCollectionList.value = [...selectedById.values()];
  syncSelectedHarvestData();
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getPostharvestBatch(id.value);
    Object.assign(form.value, res.data);
    syncCropCodeOptionForForm(form.value.cropCode, form.value.cropName);
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
  postharvestBatchFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      form.value.status = PostHarvestBatchStatus.Created.toString();

      if (form.value.id) {
        await updatePostharvestBatch(form.value);
      } else {
        await addPostharvestBatch(form.value);
      }
      proxy?.$modal.msgSuccess('success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    } finally {
      buttonLoading.value = false;
    }
  });
};

const submitFormUpdate = () => {
  postharvestBatchFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      form.value.status = PostHarvestBatchStatus.Created.toString();

      if (form.value.id) {
        await updatePostharvestBatch(form.value);
      } else {
        await addPostharvestBatch(form.value);
      }
      proxy?.$modal.msgSuccess('success');
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
.postharvest-batch-crop-type-item {
  width: 400px;
  min-width: 400px;
}
.form-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 0;
}
</style>
