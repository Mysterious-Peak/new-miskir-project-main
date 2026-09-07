<template>
  <div>
    <el-button type="primary" @click="onOpenSearch">Search</el-button>
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="1400px" append-to-body destroy-on-close>
      <!-- <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
        <el-form-item label="Farmer ID" prop="FarmerId">
          <el-input v-model="queryParams.FarmerId" placeholder="Please input Farmer ID" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="Farmer Name" prop="FarmerName">
          <el-input v-model="queryParams.FarmerName" placeholder="Please input Farmer Name" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
          <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
        </el-form-item>
      </el-form> -->
      <el-table v-loading="loading" border :data="farmerList">
        <el-table-column label="FarmerId" align="center" prop="farmerId" />
        <el-table-column label="FarmerName" align="center" prop="farmerName" />
        <el-table-column label="ID Card" align="center" prop="idCard" />
        <el-table-column label="Phone" align="center" prop="phone" />
        <!-- <el-table-column label="Union Name" align="center" prop="unionName" /> -->
        <el-table-column label="Region Code" align="center" prop="regionCode" />
        <el-table-column label="Region Name" align="center" prop="regionName" />
        <el-table-column label="Zone Code" align="center" prop="zoneCode" />
        <el-table-column label="Zone Name" align="center" prop="zoneName" />
        <el-table-column label="Woreda Code" align="center" prop="woredaCode" />
        <el-table-column label="Woreda Name" align="center" prop="woredaName" />
        <el-table-column label="Kebele Code" align="center" prop="kebeleCode" />
        <el-table-column label="Kebele Name" align="center" prop="kebeleName" />
        <el-table-column label="Address" align="center" prop="address" />
        <el-table-column label="Total Land Area" align="center" prop="totalLandArea" />
        <el-table-column label="Land Count" align="center" prop="landCount" />
        <el-table-column label="Action" align="center" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Select" placement="top">
              <el-button type="primary" icon="Select" @click="handleSelect(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup name="SelectFarmer" lang="ts">
import { getFarmerInfoList } from '@/api/demo/farmer';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const queryFormRef = ref<ElFormInstance>();

const farmerList = ref<any[]>([]);
const loading = ref(true);
const total = ref(0);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  FarmerId: undefined,
  FarmerName: undefined
});

interface Props {
  FarmerId: string | number;
  KebeleId?: string | number;
}
const props = withDefaults(defineProps<Props>(), { FarmerId: '', KebeleId: '' });
const emit = defineEmits<{
  'update:FarmerId': [FarmerId: string | number];
  'update:KebeleId': [KebeleId: string | number];
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
  const res = await getFarmerInfoList();
  farmerList.value = res.data || [];
  total.value = farmerList.value.length;
  loading.value = false;
};

const handleSelect = async (row: any) => {
  dialog.visible = false;
  emit('update:FarmerId', row.farmerId);
  emit('update:KebeleId', row.kebeleCode);
};

onMounted(() => {});
</script>
