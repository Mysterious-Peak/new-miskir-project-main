<template>
  <div>
    <el-button type="primary" @click="onOpenSearch">Search</el-button>
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="1400px" append-to-body destroy-on-close>
      <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
        <el-form-item label="Plan ID" prop="planId">
          <el-input v-model="queryParams.planId" placeholder="Please input " clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="FarmLand ID" prop="farmlandId">
          <el-input v-model="queryParams.farmlandId" placeholder="Please input " clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="Crop" prop="cropId">
          <el-select v-model="queryParams.cropId" placeholder="Please select" clearable>
            <el-option v-for="dict in cropDataList" :key="dict.id" :label="dict.cropName" :value="dict.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Season" prop="seasonId">
          <el-select v-model="queryParams.seasonId" placeholder="Please select" clearable>
            <el-option v-for="dict in seasonDataList" :key="dict.id" :label="dict.seasonName" :value="dict.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
          <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="loading" border :data="dataList">
        <el-table-column label="ID" align="center" prop="prodSeasonId" v-if="true" />
        <el-table-column label="Plan ID" align="center" prop="planId" />
        <el-table-column label="FarmLand ID" align="center" prop="farmlandId" />
        <el-table-column label="Crop" align="center" prop="cropId" :formatter="cropFormatter" />
        <el-table-column label="Season" align="center" prop="seasonId" :formatter="seasonFormatter" />
        <el-table-column label="Year" align="center" prop="year" />
        <el-table-column label="Area" align="center" prop="areaHa" />
        <el-table-column label="Status" align="center" prop="status">
          <template #default="scope">
            <el-tag>{{ CroppingSeasonStatus[scope.row.status as CroppingSeasonStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Created By" align="center" prop="daUserName" />
        <el-table-column label="Created Date" align="center" prop="daCreatedAt" width="180">
          <template #default="scope">
            <span v-if="isNew(scope.row.daCreatedAt)" class="font-black">{{ parseTime(scope.row.daCreatedAt, '{y}-{m}-{d}') }}</span>
            <span v-else>{{ parseTime(scope.row.daCreatedAt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Action" align="center" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Select" placement="top">
              <el-button type="primary" icon="Select" @click="handleSelect(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-dialog>
  </div>
</template>

<script setup name="SelectProductionSeason" lang="ts">
import { listCropMaster } from '@/api/demo/cropMaster';
import { listProductionSeason } from '@/api/demo/productionSeason';
import { ProductionSeasonQuery } from '@/api/demo/productionSeason/types';
import { listSeasonMaster } from '@/api/demo/seasonMaster';
import { CroppingSeasonStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const queryFormRef = ref<ElFormInstance>();

const dataList = ref<any[]>([]);
const loading = ref(true);
const total = ref(0);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});
const queryParams = reactive<ProductionSeasonQuery>({
  pageNum: 1,
  pageSize: 10,
  prodSeasonCode: undefined,
  planId: undefined,
  farmlandId: undefined,
  cropId: undefined,
  seasonId: undefined,
  year: undefined,
  areaTa: undefined,
  status: CroppingSeasonStatus.InProgress.toString(),
  daCreatedBy: undefined,
  daCreatedAt: undefined,
  deptId: undefined,
  params: {},
  orderByColumn: 'daCreatedAt',
  isAsc: 'desc'
});

interface Props {
  modelValue: string | number | undefined;
}
const props = withDefaults(defineProps<Props>(), { modelValue: '' });
const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  'select': [row: any];
}>();

const onOpenSearch = () => {
  getList();
  dialog.visible = true;
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const getList = async () => {
  loading.value = true;
  const res = await listProductionSeason(queryParams);
  dataList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

const handleSelect = async (row: any) => {
  dialog.visible = false;
  emit('update:modelValue', row.prodSeasonId);
  emit('select', row);
};

const cropDataList = ref();
const getCropList = async () => {
  const res = await listCropMaster({ pageNum: 1, pageSize: 10 });
  cropDataList.value = res.rows;
};
const seasonDataList = ref();
const getSeasonList = async () => {
  const res = await listSeasonMaster({ pageNum: 1, pageSize: 10 });
  seasonDataList.value = res.rows;
};

const cropFormatter = (row) => {
  return cropDataList.value.find((item) => item.id == row.cropId).cropName;
};
const seasonFormatter = (row) => {
  return seasonDataList.value.find((item) => item.id == row.seasonId).seasonName;
};

onMounted(async () => {
  await getCropList();
  await getSeasonList();
});
</script>
