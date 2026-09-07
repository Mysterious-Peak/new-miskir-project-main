<template>
  <div>
    <el-button type="primary" @click="onOpenSearch">Search</el-button>
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="1400px" append-to-body destroy-on-close>
      <el-table v-loading="loading" border :data="dataList">
        <el-table-column label="ID" align="center" prop="id" v-if="true" />
        <el-table-column label="Batch ID" align="center" prop="batchId" />
        <!-- <el-table-column label="关联的收获记录ID列表" align="center" prop="harvestIdsJson" /> -->
        <el-table-column label="Crop" align="center" prop="cropCode" :formatter="cropFormatter" />
        <el-table-column label="Batch Weight (qt)" align="center" prop="batchWeightQt" />
        <el-table-column label="Creation Date" align="center" prop="creationDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.creationDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" align="center" prop="status">
          <template #default="scope">
            <el-tag>{{ PostHarvestBatchStatus[scope.row.status as PostHarvestBatchStatus] }}</el-tag>
          </template>
        </el-table-column>
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
import { listCropMaster } from '@/api/demo/cropMaster';
import { listPostharvestBatch } from '@/api/demo/postharvestBatch';
import { PostharvestBatchQuery } from '@/api/demo/postharvestBatch/types';
import { PostHarvestBatchStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import request from '@/utils/request';
import axios from 'axios';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const dataList = ref<any[]>([]);
const loading = ref(true);
const total = ref(0);

const dataId = defineModel();

const props = defineProps<{
  status: string;
}>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const queryParams = reactive<PostharvestBatchQuery>({
  pageNum: 1,
  pageSize: 10,
  batchId: undefined,
  harvestIdsJson: undefined,
  cropCode: undefined,
  batchWeightQt: undefined,
  creationDate: undefined,
  status: undefined,
  params: {}
});

const onOpenSearch = () => {
  getList();
  dialog.visible = true;
};

const getList = async () => {
  loading.value = true;
  const res = await listPostharvestBatch({ status: props.status, pageNum: 1, pageSize: 10 });
  dataList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

const handleSelect = async (row: any) => {
  dialog.visible = false;
  dataId.value = row.id;
};

const cropDataList = ref();
const getCropList = async () => {
  const res = await listCropMaster({ pageNum: 1, pageSize: 10 });
  cropDataList.value = res.rows;
};
const cropFormatter = (row) => {
  return cropDataList.value.find((item) => item.id == row.cropCode).cropName;
};

onMounted(async () => {
  await getCropList();
});
</script>
