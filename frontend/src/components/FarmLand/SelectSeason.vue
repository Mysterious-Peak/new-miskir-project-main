<template>
  <div>
    <el-button type="primary" @click="onOpenSearch">Search</el-button>
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="1400px" append-to-body destroy-on-close>
      <el-table v-loading="loading" border :data="dataList">
        <el-table-column label="Season ID" align="center" prop="id" />
        <el-table-column label="Season Name" align="center" prop="seasonName" />
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

<script setup name="SelectSeason" lang="ts">
import { listSeasonMaster } from '@/api/demo/seasonMaster';
import { SeasonMasterQuery } from '@/api/demo/seasonMaster/types';
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

const queryParams = reactive<SeasonMasterQuery>({
  pageNum: 1,
  pageSize: 10,
  seasonName: undefined,
  params: {}
});

interface Props {
  seasonId: string | number;
  seasonName: string | number;
}
const props = withDefaults(defineProps<Props>(), { seasonId: '', seasonName: '' });
const emit = defineEmits<{
  'update:seasonId': [value: string | number];
  'update:seasonName': [value: string | number];
}>();

const onOpenSearch = () => {
  getList();
  dialog.visible = true;
};

const getList = async () => {
  loading.value = true;
  const res = await listSeasonMaster(queryParams);
  dataList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

const handleSelect = async (row: any) => {
  dialog.visible = false;
  emit('update:seasonId', row.id);
  emit('update:seasonName', row.seasonName);
};

onMounted(() => {});
</script>
