<template>
  <div>
    <el-button type="primary" @click="onOpenSearch">Search</el-button>
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="1400px" append-to-body destroy-on-close>
      <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
        <el-form-item label="Farmer ID" prop="farmerId">
          <el-input v-model="queryParams.farmerId" placeholder="Please input Farmer ID" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="Kebele ID" prop="kebeleId">
          <el-input v-model="queryParams.kebeleId" placeholder="Please input Kebele ID" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
          <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="loading" border :data="dataList">
        <el-table-column label="FarmLand ID" align="center" prop="id" v-if="true" />
        <el-table-column label="Farmer ID" align="center" prop="farmerId" />
        <el-table-column label="Kebele ID" align="center" prop="kebeleId" />
        <el-table-column label="Latitude" align="center" prop="gpsLat" />
        <el-table-column label="Longitude" align="center" prop="gpsLong" />
        <el-table-column label="Area(ha)" align="center" prop="areaTa" />
        <el-table-column label="Soil Code" align="center" prop="soilCode" />
        <el-table-column label="Irrigation Code" align="center" prop="irrigationCode" />
        <el-table-column label="Slope Class" align="center" prop="slopeClass" />
        <el-table-column label="Land Use Type" align="center" prop="landUseType" />
        <el-table-column label="Status" align="center" prop="status">
          <template #default="scope">
            <el-tag>{{ ApprovalStatus[scope.row.status as ApprovalStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Create Date" align="center" prop="daCreateTime" width="180">
          <template #default="scope">
            <span v-if="isNew(scope.row.daCreateTime)" class="font-black">{{ parseTime(scope.row.daCreateTime, '{y}-{m}-{d}') }}</span>
            <span v-else>{{ parseTime(scope.row.daCreateTime, '{y}-{m}-{d}') }}</span>
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

<script setup name="SelectFarmLand" lang="ts">
import { listFarmland } from '@/api/demo/farmland';
import { FarmlandQuery } from '@/api/demo/farmland/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import request from '@/utils/request';
import axios from 'axios';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const queryFormRef = ref<ElFormInstance>();

const dataList = ref<any[]>([]);
const loading = ref(true);
const total = ref(0);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const queryParams = reactive<FarmlandQuery>({
  pageNum: 1,
  pageSize: 10,
  farmerId: undefined,
  kebeleId: undefined,
  gpsLat: undefined,
  gpsLong: undefined,
  gpsPolygon: undefined,
  areaTa: undefined,
  soilCode: undefined,
  irrigationCode: undefined,
  slopeClass: undefined,
  landUseType: undefined,
  // elevationM: undefined,
  status: ApprovalStatus.Approved.toString(),
  approvedBy: undefined,
  approvedTime: undefined,
  rejectionReason: undefined,
  daCreateBy: undefined,
  daCreateTime: undefined,
  params: {},
  orderByColumn: 'daCreateTime',
  isAsc: 'desc'
});

interface Props {
  modelValue: string | number | undefined;
}
const props = withDefaults(defineProps<Props>(), { modelValue: '' });
const emit = defineEmits<{
  'update:modelValue': [value: string | number];
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
  const res = await listFarmland(queryParams);
  dataList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

const handleSelect = async (row: any) => {
  dialog.visible = false;
  emit('update:modelValue', row.id);
};

onMounted(() => {});
</script>
