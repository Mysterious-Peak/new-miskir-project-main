<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Irrigation Code" prop="irrigationCode">
              <el-input prefix-icon="Search" v-model="queryParams.irrigationCode" placeholder="Please input Irrigation Code" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Irrigation Name" prop="irrigationName">
              <el-input v-model="queryParams.irrigationName" placeholder="Please input Irrigation Name" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!-- <el-form-item label="描述" prop="description">
              <el-input v-model="queryParams.description" placeholder="请输入描述" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="排序" prop="sort">
              <el-input v-model="queryParams.sort" placeholder="请输入排序" clearable @keyup.enter="handleQuery" />
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
          <el-col :span="1.5" style="margin-left: auto">
            <el-button
              type="danger"
              plain
              icon="Delete"
              v-if="!multiple"
              @click="handleDelete()"
              v-hasPermi="['demo:irrigationTypeMaster:remove']"
              >Delete</el-button
            >
          </el-col>
          <el-col :span="1.5" style="margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:irrigationTypeMaster:add']">Add</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" stripe fit border :data="irrigationTypeMasterList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="" align="center" prop="id" v-if="true" />
        <el-table-column label="Irrigation Code" align="center" prop="irrigationCode" :min-width="getColumnWidth('Irrigation Code')" />
        <el-table-column label="Irrigation Name" align="center" prop="irrigationName" :min-width="getColumnWidth('Irrigation Name')" />
        <el-table-column label="Description" align="center" prop="description" :min-width="getColumnWidth('Description')" />
        <!-- <el-table-column label="排序" align="center" prop="sort" />
        <el-table-column label="状态(0正常 1停用)" align="center" prop="status" />
        <el-table-column label="备注" align="center" prop="remark" /> -->
        <el-table-column label="Actions" align="center" fixed="right" class-name="action-column" width="210">
          <template #default="scope">
            <el-button
              class="table-action-btn table-edit-btn"
              icon="EditPen"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['demo:irrigationTypeMaster:edit']"
              >Edit</el-button
            >
            <el-button
              class="table-action-btn table-delete-btn"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['demo:irrigationTypeMaster:remove']"
              >Delete</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改灌溉类型主数据对话框 -->
  </div>
</template>

<script setup name="IrrigationTypeMaster" lang="ts">
import {
  addIrrigationTypeMaster,
  delIrrigationTypeMaster,
  getIrrigationTypeMaster,
  listIrrigationTypeMaster,
  updateIrrigationTypeMaster
} from '@/api/demo/irrigationTypeMaster';
import { IrrigationTypeMasterForm, IrrigationTypeMasterQuery, IrrigationTypeMasterVO } from '@/api/demo/irrigationTypeMaster/types';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const irrigationTypeMasterList = ref<IrrigationTypeMasterVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const irrigationTypeMasterFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: IrrigationTypeMasterForm = {
  id: undefined,
  irrigationCode: undefined,
  irrigationName: undefined,
  description: undefined,
  sort: undefined,
  status: undefined,
  remark: undefined
};
const data = reactive<PageData<IrrigationTypeMasterForm, IrrigationTypeMasterQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    irrigationCode: undefined,
    irrigationName: undefined,
    description: undefined,
    sort: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    // id: [{ required: true, message: '不能为空', trigger: 'blur' }],
    irrigationCode: [{ required: true, message: 'Irrigation Code Cannot be empty', trigger: 'blur' }],
    irrigationName: [{ required: true, message: 'Irrigation Name Cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询灌溉类型主数据列表 */
const getList = async () => {
  loading.value = true;
  const res = await listIrrigationTypeMaster(queryParams.value);
  irrigationTypeMasterList.value = res.rows;
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
  irrigationTypeMasterFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: IrrigationTypeMasterVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  router.push({ name: 'IrrigationTypeMasterAdd' });
};

/** 修改按钮操作 */
const handleUpdate = (row?: IrrigationTypeMasterVO) => {
  const _id = row?.id || ids.value[0];
  router.push({ name: 'IrrigationTypeMasterEdit', params: { id: _id } });
};

/** 提交按钮 */
const submitForm = () => {
  irrigationTypeMasterFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateIrrigationTypeMaster(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addIrrigationTypeMaster(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: IrrigationTypeMasterVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure delete this data?').finally(() => (loading.value = false));
  await delIrrigationTypeMaster(_ids);
  proxy?.$modal.msgSuccess('Success');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'demo/irrigationTypeMaster/export',
    {
      ...queryParams.value
    },
    `irrigationTypeMaster_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});
</script>

