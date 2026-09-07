<template>
  <el-dialog :title="dialog.title" v-model="dialog.visible" width="1200px" append-to-body>
    <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
      <el-form-item label="Harvest ID" prop="harvestId">
        <el-input v-model="queryParams.harvestId" placeholder="Please input Harvest ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="Farmer ID" prop="farmerId">
        <el-input v-model="queryParams.farmerId" placeholder="Please input Farmer ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <!-- <el-form-item label="Crop Code" prop="cropCode">
        <el-select v-model="queryParams.cropCode" placeholder="Please select" clearable>
          <el-option v-for="dict in cropDataList" :key="dict.id" :label="dict.cropName" :value="dict.id"></el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
        <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
      </el-form-item>
    </el-form>

    <el-table ref="tableRef" v-loading="loading" stripe fit border :data="harvestCollectionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="Primary Key ID" align="center" prop="id" v-if="true" /> -->
      <el-table-column label="Harvest ID" align="center" prop="harvestId" :min-width="getColumnWidth('Harvest ID')" />
      <el-table-column label="Farmer ID" align="center" prop="farmerId" :min-width="getColumnWidth('Farmer ID')" />
      <el-table-column label="Crop Code" align="center" prop="cropCode" :min-width="getColumnWidth('Crop Code')" />
      <el-table-column label="Quantity (qt)" align="center" prop="quantityQt" :min-width="getColumnWidth('Quantity (qt)')" />
      <el-table-column label="Moisture (%)" align="center" prop="moisturePercentage" :min-width="getColumnWidth('Moisture (%)')" />
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
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    <template #footer>
      <div class="dialog-footer">
        <el-button :loading="buttonLoading" type="primary" @click="onSelectFinished">Select</el-button>
        <el-button @click="cancel">Cancel</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="HarvestCollection" lang="ts">
import { listCropMaster } from '@/api/demo/cropMaster';
import { HarvestCollectionForm, HarvestCollectionQuery, HarvestCollectionVO } from '@/api/demo/harvestCollection/types';
import { isNew } from '@/utils/FarmTools';
import request from '@/utils/request';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

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
const tableRef = ref<any>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: HarvestCollectionForm = {
  id: undefined,
  harvestId: undefined,
  farmerId: undefined,
  cropCode: undefined,
  quantityQt: undefined,
  moisturePercentage: undefined,
  collectionDate: undefined
};
const data = reactive<PageData<HarvestCollectionForm, HarvestCollectionQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    harvestId: undefined,
    farmerId: undefined,
    cropCode: undefined,
    quantityQt: undefined,
    moisturePercentage: undefined,
    collectionDate: undefined,
    params: {}
  },
  rules: {}
});

const { queryParams, form } = toRefs(data);

const props = defineProps<{
  onSelectFinished: Function;
}>();

const onOpenDialog = async (cropId, selectList) => {
  queryParams.value.cropCode = cropId;
  await getList();

  if (selectList && selectList.length > 0) {
    ids.value = selectList.map((item) => item.id);
    single.value = selectList.length != 1;
    multiple.value = !selectList.length;

    nextTick(() => {
      tableRef.value?.clearSelection?.();
      ids.value.forEach((id) => {
        const row = harvestCollectionList.value.find((r) => r.id === id);
        if (row) {
          tableRef.value?.toggleRowSelection?.(row, true);
        }
      });
    });
  } else {
    ids.value = [];
    single.value = true;
    multiple.value = true;
  }

  dialog.visible = true;
};

/** Query Harvest Collection List */
const getList = async () => {
  loading.value = true;
  // const res = await listHarvestCollection(queryParams.value);
  const res = await request({
    url: '/demo/harvestCollection/list/unused',
    method: 'get',
    params: queryParams.value
  });
  harvestCollectionList.value = res.rows;
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

const onSelectFinished = () => {
  props.onSelectFinished(harvestCollectionList.value.filter((item) => ids.value.includes(item.id)));
  cancel();
};

const cropDataList = ref();
const getCropList = async () => {
  const res = await listCropMaster({ pageNum: 1, pageSize: 10 });
  cropDataList.value = res.rows;
};
const cropFormatter = (row) => {
  return cropDataList.value.find((item) => item.cropCode == row.cropCode).cropName;
};

onMounted(async () => {
  await getCropList();
  await getList();
});

defineExpose({
  onOpenDialog
});
</script>
