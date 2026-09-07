<template>
  <div>
    <el-button type="primary" @click="onOpenSearch">Search</el-button>
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="1400px" append-to-body destroy-on-close>
      <el-table v-loading="loading" border :data="dataList">
        <el-table-column label="ID" align="center" prop="id" v-if="true" />
        <el-table-column label="Grade Code" align="center" prop="gradeCode" />
        <el-table-column label="Grade Name" align="center" prop="gradeName" />
        <el-table-column label="Description" align="center" prop="description" />
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

<script setup name="SelectQualityGrade" lang="ts">
import { listQualityGradeMaster } from '@/api/demo/qualityGradeMaster';
import { QualityGradeMasterQuery } from '@/api/demo/qualityGradeMaster/types';
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

const queryParams = reactive<QualityGradeMasterQuery>({
  pageNum: 1,
  pageSize: 10,
  gradeCode: undefined,
  gradeName: undefined,
  description: undefined,
  params: {}
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
  const res = await listQualityGradeMaster(queryParams);
  dataList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

const handleSelect = async (row: any) => {
  dialog.visible = false;
  emit('update:modelValue', row.gradeCode);
};

onMounted(() => {});
</script>
