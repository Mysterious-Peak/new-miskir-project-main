<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Season Name" prop="seasonName">
              <el-input prefix-icon="Search" v-model="queryParams.seasonName" placeholder="Please input Season Name" clearable @keyup.enter="handleQuery" />
            </el-form-item>
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
            <el-button type="danger" plain icon="Delete" v-if="!multiple" @click="handleDelete()" v-hasPermi="['demo:seasonMaster:remove']"
              >Delete</el-button
            >
          </el-col>
          <el-col :span="1.5" style="margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:seasonMaster:add']">Add</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" stripe fit border :data="seasonMasterList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="" align="center" prop="id" v-if="true" />
        <el-table-column label="Season Code" align="center" prop="seasonCode" :min-width="getColumnWidth('Season Code')" />
        <el-table-column label="Season Name" align="center" prop="seasonName" :min-width="getColumnWidth('Season Name')" />
        <el-table-column label="Description" align="center" prop="description" :min-width="getColumnWidth('Description')" />
        <el-table-column label="Actions" align="center" fixed="right" class-name="action-column" width="210">
          <template #default="scope">
            <el-button class="table-action-btn table-edit-btn" icon="EditPen" @click="handleUpdate(scope.row)" v-hasPermi="['demo:seasonMaster:edit']"
              >Edit</el-button
            >
            <el-button
              class="table-action-btn table-delete-btn"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['demo:seasonMaster:remove']"
              >Delete</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改季节主数据对话框 -->
  </div>
</template>

<script setup name="SeasonMaster" lang="ts">
import { addSeasonMaster, delSeasonMaster, getSeasonMaster, listSeasonMaster, updateSeasonMaster } from '@/api/demo/seasonMaster';
import { SeasonMasterForm, SeasonMasterQuery, SeasonMasterVO } from '@/api/demo/seasonMaster/types';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const seasonMasterList = ref<SeasonMasterVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const seasonMasterFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: SeasonMasterForm = {
  id: undefined,
  seasonCode: undefined,
  seasonName: undefined,
  description: undefined
};
const data = reactive<PageData<SeasonMasterForm, SeasonMasterQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    seasonName: undefined,
    params: {}
  },
  rules: {
    // id: [{ required: true, message: '不能为空', trigger: 'blur' }],
    seasonCode: [{ required: true, message: 'Season Code cannot be empty', trigger: 'blur' }],
    seasonName: [{ required: true, message: 'Season Name Cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询季节主数据列表 */
const getList = async () => {
  loading.value = true;
  const res = await listSeasonMaster(queryParams.value);
  seasonMasterList.value = res.rows;
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
  seasonMasterFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: SeasonMasterVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  router.push({ name: 'SeasonMasterAdd' });
};

/** 修改按钮操作 */
const handleUpdate = (row?: SeasonMasterVO) => {
  const _id = row?.id || ids.value[0];
  router.push({ name: 'SeasonMasterEdit', params: { id: _id } });
};

/** 提交按钮 */
const submitForm = () => {
  seasonMasterFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateSeasonMaster(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addSeasonMaster(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: SeasonMasterVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure delete this data?').finally(() => (loading.value = false));
  await delSeasonMaster(_ids);
  proxy?.$modal.msgSuccess('Success');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'demo/seasonMaster/export',
    {
      ...queryParams.value
    },
    `seasonMaster_${new Date().getTime()}.xlsx`
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

