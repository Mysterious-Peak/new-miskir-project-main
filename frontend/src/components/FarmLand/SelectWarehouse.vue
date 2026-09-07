<template>
  <div>
    <el-button type="primary" @click="onOpenSearch">Search</el-button>
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="1400px" append-to-body destroy-on-close>
      <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
        <el-form-item label="Warehouse ID" prop="warehouseId">
          <el-input v-model="queryParams.warehouseId" placeholder="Please input Warehouse ID" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="Warehouse Name" prop="warehouseName">
          <el-input v-model="queryParams.warehouseName" placeholder="Please input Warehouse Name" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
          <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
        </el-form-item>
      </el-form>
      <el-table v-loading="loading" border :data="dataList">
        <el-table-column label="Warehouse ID" align="center" prop="warehouseId" />
        <el-table-column label="Warehouse Name" align="center" prop="warehouseName" />
        <el-table-column label="Warehouse Type" align="center" prop="warehouseType" :formatter="formatWarehouseType" />
        <el-table-column label="Location" align="center" prop="location" />
        <el-table-column label="Capacity (Mt)" align="center" prop="capacityMt" />
        <el-table-column label="Area (m²)" align="center" prop="areaSqM" />
        <el-table-column label="Create Date" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span v-if="isNew(scope.row.createTime)" class="font-black">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            <span v-else>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
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

<script setup name="SelectPostHarvestBatch" lang="ts">
import { listWarehouseMaster } from '@/api/demo/warehouseMaster';
import { WarehouseMasterQuery } from '@/api/demo/warehouseMaster/types';
import { warehouseTypeOptions } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import request from '@/utils/request';
import axios from 'axios';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const dataList = ref<any[]>([]);
const loading = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();

const formatWarehouseType = (row, column, cellValue, index) => {
  const option = warehouseTypeOptions.find((item) => item.value === cellValue);
  return option ? option.label : cellValue;
};

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const queryParams = reactive<WarehouseMasterQuery>({
  pageNum: 1,
  pageSize: 10,
  warehouseId: undefined,
  warehouseName: undefined,
  warehouseType: undefined,
  location: undefined,
  capacityMt: undefined,
  areaSqM: undefined,
  params: {},
  orderByColumn: 'createTime',
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

const getList = async () => {
  loading.value = true;
  const res = await listWarehouseMaster({ pageNum: 1, pageSize: 10 });
  dataList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleSelect = async (row: any) => {
  dialog.visible = false;
  emit('update:modelValue', row.id);
};

onMounted(async () => {});
</script>
