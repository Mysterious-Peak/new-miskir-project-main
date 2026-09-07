<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Grade Code" prop="gradeCode">
              <el-input prefix-icon="Search" v-model="queryParams.gradeCode" placeholder="Please input Grade Code" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Grade Name" prop="gradeName">
              <el-input v-model="queryParams.gradeName" placeholder="Please input Grade Name" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!-- <el-form-item label="等级评定标准说明" prop="description">
              <el-input v-model="queryParams.description" placeholder="请输入等级评定标准说明" clearable @keyup.enter="handleQuery" />
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

      <el-table v-loading="loading" stripe fit border :data="qualityGradeMasterList" @selection-change="handleSelectionChange">
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column label="ID" align="center" prop="id" v-if="true" :min-width="getColumnWidth('ID')" />
        <el-table-column label="Grade Code" align="center" prop="gradeCode" :min-width="getColumnWidth('Grade Code')" />
        <el-table-column label="Grade Name" align="center" prop="gradeName" :min-width="getColumnWidth('Grade Name')" />
        <el-table-column label="Description" align="center" prop="description" :min-width="getColumnWidth('Description')" />
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

<script setup name="QualityGradeMaster" lang="ts">
import {
  addQualityGradeMaster,
  delQualityGradeMaster,
  getQualityGradeMaster,
  listQualityGradeMaster,
  updateQualityGradeMaster
} from '@/api/demo/qualityGradeMaster';
import { QualityGradeMasterForm, QualityGradeMasterQuery, QualityGradeMasterVO } from '@/api/demo/qualityGradeMaster/types';
import { isNew } from '@/utils/FarmTools';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const qualityGradeMasterList = ref<QualityGradeMasterVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const qualityGradeMasterFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: QualityGradeMasterForm = {
  id: undefined,
  gradeCode: undefined,
  gradeName: undefined,
  description: undefined
};
const data = reactive<PageData<QualityGradeMasterForm, QualityGradeMasterQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    gradeCode: undefined,
    gradeName: undefined,
    description: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    // id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
    gradeCode: [{ required: true, message: 'Grade Code cannot be empty', trigger: 'blur' }],
    gradeName: [{ required: true, message: 'Grade Name cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询质量等级标准列表 */
const getList = async () => {
  loading.value = true;
  const res = await listQualityGradeMaster(queryParams.value);
  qualityGradeMasterList.value = res.rows;
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
  qualityGradeMasterFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: QualityGradeMasterVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  router.push({ name: 'QualityGradeMasterAdd' });
};

/** 修改按钮操作 */
const handleUpdate = (row?: QualityGradeMasterVO) => {
  const _id = row?.id || ids.value[0];
  router.push({ name: 'QualityGradeMasterEdit', params: { id: _id } });
};

/** 提交按钮 */
const submitForm = () => {
  qualityGradeMasterFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateQualityGradeMaster(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addQualityGradeMaster(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: QualityGradeMasterVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure delete this data?').finally(() => (loading.value = false));
  await delQualityGradeMaster(_ids);
  proxy?.$modal.msgSuccess('success');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'demo/qualityGradeMaster/export',
    {
      ...queryParams.value
    },
    `qualityGradeMaster_${new Date().getTime()}.xlsx`
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

