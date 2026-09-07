<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Soil Code" prop="soilCode">
              <el-input prefix-icon="Search" v-model="queryParams.soilCode" placeholder="Please input Soil Code" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Soil Name" prop="soilName">
              <el-input v-model="queryParams.soilName" placeholder="Please input Soil Name" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!-- <el-form-item label="Description" prop="description">
              <el-input v-model="queryParams.description" placeholder="Please input " clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <!-- <el-form-item label="排序" prop="sort">
              <el-input v-model="queryParams.sort" placeholder="Please input " clearable @keyup.enter="handleQuery" />
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
            <el-button type="danger" plain icon="Delete" v-if="!multiple" @click="handleDelete()" v-hasPermi="['demo:soilTypeMaster:remove']"
              >Delete</el-button
            >
          </el-col>
          <el-col :span="1.5" style="margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:soilTypeMaster:add']">Add</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" stripe fit border :data="soilTypeMasterList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="" align="center" prop="id" v-if="true" />
        <el-table-column label="Soil Code" align="center" prop="soilCode" :min-width="getColumnWidth('Soil Code')" />
        <el-table-column label="Soil Name" align="center" prop="soilName" :min-width="getColumnWidth('Soil Name')" />
        <el-table-column label="Description" align="center" prop="description" :min-width="getColumnWidth('Description')" />
        <!-- <el-table-column label="排序" align="center" prop="sort" />
        <el-table-column label="状态(0正常 1停用)" align="center" prop="status" />
        <el-table-column label="备注" align="center" prop="remark" /> -->
        <el-table-column label="Actions" align="center" fixed="right" class-name="action-column" width="210">
          <template #default="scope">
            <el-button class="table-action-btn table-edit-btn" icon="EditPen" @click="handleUpdate(scope.row)" v-hasPermi="['demo:soilTypeMaster:edit']"
              >Edit</el-button
            >
            <el-button
              class="table-action-btn table-delete-btn"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['demo:soilTypeMaster:remove']"
              >Delete</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改土壤类型主数据对话框 -->
  </div>
</template>

<script setup name="SoilTypeMaster" lang="ts">
import { listSoilTypeMaster, getSoilTypeMaster, delSoilTypeMaster, addSoilTypeMaster, updateSoilTypeMaster } from '@/api/demo/soilTypeMaster';
import { SoilTypeMasterVO, SoilTypeMasterQuery, SoilTypeMasterForm } from '@/api/demo/soilTypeMaster/types';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const soilTypeMasterList = ref<SoilTypeMasterVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const soilTypeMasterFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: SoilTypeMasterForm = {
  id: undefined,
  soilCode: undefined,
  soilName: undefined,
  description: undefined,
  sort: undefined,
  status: undefined,
  remark: undefined
};
const data = reactive<PageData<SoilTypeMasterForm, SoilTypeMasterQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    soilCode: undefined,
    soilName: undefined,
    description: undefined,
    sort: undefined,
    status: undefined,
    params: {}
  },
  rules: {
    // id: [{ required: true, message: '不能为空', trigger: 'blur' }],
    soilCode: [{ required: true, message: 'Soil Code Cannot be empty', trigger: 'blur' }],
    soilName: [{ required: true, message: 'Soil Name Cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询土壤类型主数据列表 */
const getList = async () => {
  loading.value = true;
  const res = await listSoilTypeMaster(queryParams.value);
  soilTypeMasterList.value = res.rows;
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
  soilTypeMasterFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: SoilTypeMasterVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  router.push({ name: 'SoilTypeMasterAdd' });
};

/** 修改按钮操作 */
const handleUpdate = (row?: SoilTypeMasterVO) => {
  const _id = row?.id || ids.value[0];
  router.push({ name: 'SoilTypeMasterEdit', params: { id: _id } });
};

/** 提交按钮 */
const submitForm = () => {
  soilTypeMasterFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateSoilTypeMaster(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addSoilTypeMaster(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: SoilTypeMasterVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure delete this data?').finally(() => (loading.value = false));
  await delSoilTypeMaster(_ids);
  proxy?.$modal.msgSuccess('Success');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'demo/soilTypeMaster/export',
    {
      ...queryParams.value
    },
    `soilTypeMaster_${new Date().getTime()}.xlsx`
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

