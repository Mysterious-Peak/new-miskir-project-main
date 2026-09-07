<template>
  <div>
    <el-button type="primary" @click="onOpenSearch">Search</el-button>
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="1400px" append-to-body destroy-on-close>
      <el-table v-loading="loading" border :data="dataList">
        <el-table-column label="Crop ID" align="center" prop="id" />
        <el-table-column label="Crop Code" align="center" prop="cropCode" />
        <el-table-column label="Crop Name" align="center" prop="cropName" />
        <el-table-column label="Description" align="center" prop="description" />
        <el-table-column label="Status" align="center" prop="status">
          <template #default="scope">
            <el-tag>{{ scope.row.status == 0 ? 'enable' : 'disable' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Remark" align="center" prop="remark" />
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

<script setup name="SelectCrop" lang="ts">
import { listCropMaster } from '@/api/demo/cropMaster';
import { CropMasterQuery } from '@/api/demo/cropMaster/types';
import request from '@/utils/request';
import axios from 'axios';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const dataList = ref<any[]>([]);
const loading = ref(true);
const total = ref(0);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const queryParams = reactive<CropMasterQuery>({
  pageNum: 1,
  pageSize: 10,
  cropCode: undefined,
  cropName: undefined,
  description: undefined,
  sort: undefined,
  status: undefined,
  params: {}
});

interface Props {
  cropId: string | number;
  cropName: string | number;
}
const props = withDefaults(defineProps<Props>(), { cropId: '', cropName: '' });
const emit = defineEmits<{
  'update:cropId': [value: string | number];
  'update:cropName': [value: string | number];
}>();

const onOpenSearch = () => {
  getList();
  dialog.visible = true;
};

const getList = async () => {
  loading.value = true;
  const res = await listCropMaster(queryParams);
  dataList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

const handleSelect = async (row: any) => {
  dialog.visible = false;
  emit('update:cropId', row.id);
  emit('update:cropName', row.cropName);
};

onMounted(() => {});
</script>
