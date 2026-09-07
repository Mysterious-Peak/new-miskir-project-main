<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Warehouse ID" prop="warehouseId">
              <el-input prefix-icon="Search" v-model="queryParams.warehouseId" placeholder="Please input Warehouse ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Warehouse Name" prop="warehouseName">
              <el-input v-model="queryParams.warehouseName" placeholder="Please input Warehouse Name" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!-- <el-form-item label="仓库地理位置" prop="location">
              <el-input v-model="queryParams.location" placeholder="请输入仓库地理位置" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="仓库总容量" prop="capacityMt">
              <el-input v-model="queryParams.capacityMt" placeholder="请输入仓库总容量" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="仓库占地面积" prop="areaSqM">
              <el-input v-model="queryParams.areaSqM" placeholder="请输入仓库占地面积" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <el-form-item class="search-actions">
              <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
              <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="18"><span class="table-page-title"><el-icon class="table-page-title-icon"><Tickets /></el-icon> {{ ($route.meta.title || "") + " List" }}</span></el-col>
          <!-- <el-col :span="1.5" style="margin-left: auto">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
              >Delete</el-button
            >
          </el-col> --> 
          <el-col :span="1.5" style="margin-left: auto; margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" stripe fit border :data="warehouseMasterList" @selection-change="handleSelectionChange">
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <!-- <el-table-column label="ID" align="center" prop="id" /> -->
        <el-table-column label="Warehouse ID" align="center" prop="warehouseId" :min-width="getColumnWidth('Warehouse ID')" />
        <el-table-column label="Warehouse Name" align="center" prop="warehouseName" :min-width="getColumnWidth('Warehouse Name')" />
        <el-table-column
          label="Warehouse Type"
          align="center"
          prop="warehouseType"
          :formatter="formatWarehouseType"
          :min-width="getColumnWidth('Warehouse Type')"
        />
        <el-table-column label="Location" align="center" prop="location" :min-width="getColumnWidth('Location')" />
        <el-table-column label="Capacity (Mt)" align="center" prop="capacityMt" :min-width="getColumnWidth('Capacity (Mt)')" />
        <el-table-column label="Area (m²)" align="center" prop="areaSqM" :min-width="getColumnWidth('Area (m²)')" />
        <el-table-column label="Created Date" align="center" prop="createTime" width="180" :min-width="getColumnWidth('Create Date')">
          <template #default="scope">
            <span v-if="isNew(scope.row.createTime)" class="font-black">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            <span v-else>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Action" align="center" fixed="right" class-name="action-column" width="210">
          <template #default="scope">
            <el-button class="table-action-btn table-edit-btn" icon="EditPen" @click="handleUpdate(scope.row)">Edit</el-button>
            <el-button class="table-action-btn table-delete-btn" icon="Delete" @click="handleDelete(scope.row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="WarehouseMaster" lang="ts">
import { addWarehouseMaster, delWarehouseMaster, getWarehouseMaster, listWarehouseMaster, updateWarehouseMaster } from '@/api/demo/warehouseMaster';
import { WarehouseMasterForm, WarehouseMasterQuery, WarehouseMasterVO } from '@/api/demo/warehouseMaster/types';
import { isNew } from '@/utils/FarmTools';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { warehouse_type } = toRefs<any>(proxy?.useDict('warehouse_type'));

const warehouseMasterList = ref<WarehouseMasterVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const warehouseMasterFormRef = ref<ElFormInstance>();

const formatWarehouseType = (row, column, cellValue, index) => {
  const option = warehouse_type.value.find((item) => item.value === cellValue);
  return option ? option.label : cellValue;
};

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: WarehouseMasterForm = {
  id: undefined,
  warehouseId: undefined,
  warehouseName: undefined,
  warehouseType: undefined,
  location: undefined,
  capacityMt: undefined,
  areaSqM: undefined
};
const data = reactive<PageData<WarehouseMasterForm, WarehouseMasterQuery>>({
  form: { ...initFormData },
  queryParams: {
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
  },
  rules: {
    // id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
    warehouseId: [{ required: true, message: 'Warehouse ID cannot be empty', trigger: 'blur' }],
    warehouseName: [{ required: true, message: 'Warehouse Name cannot be empty', trigger: 'blur' }],
    warehouseType: [{ required: true, message: 'Warehouse Type cannot be empty', trigger: 'change' }],
    location: [{ required: true, message: 'Location cannot be empty', trigger: 'blur' }],
    capacityMt: [{ required: true, message: 'Capacity cannot be empty', trigger: 'blur' }],
    areaSqM: [{ required: true, message: 'Area cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询仓库主数据列表 */
const getList = async () => {
  loading.value = true;
  const res = await listWarehouseMaster(queryParams.value);
  warehouseMasterList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  warehouseMasterFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: WarehouseMasterVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  router.push({ name: 'WarehouseMasterAdd' });
};

/** 修改按钮操作 */
const handleUpdate = (row?: WarehouseMasterVO) => {
  const _id = row?.id || ids.value[0];
  router.push({ name: 'WarehouseMasterEdit', params: { id: _id } });
};

/** 提交按钮 */
const submitForm = () => {
  warehouseMasterFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateWarehouseMaster(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addWarehouseMaster(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: WarehouseMasterVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure delete this data?').finally(() => (loading.value = false));
  await delWarehouseMaster(_ids);
  proxy?.$modal.msgSuccess('Success');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'demo/warehouseMaster/export',
    {
      ...queryParams.value
    },
    `warehouseMaster_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
  console.log('warehouse_type', warehouse_type.value);
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});
</script>

