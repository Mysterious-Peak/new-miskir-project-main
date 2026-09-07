<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Unique code of the village" prop="code">
              <el-input prefix-icon="Search" v-model="queryParams.code" placeholder="请输入Unique code of the village" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Name of the village" prop="name">
              <el-input v-model="queryParams.name" placeholder="请输入Name of the village" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Longitude coordinate of the village center" prop="longitude">
              <el-input
                v-model="queryParams.longitude"
                placeholder="请输入Longitude coordinate of the village center"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="Latitude coordinate of the village center" prop="latitude">
              <el-input
                v-model="queryParams.latitude"
                placeholder="请输入Latitude coordinate of the village center"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="Brief description or introduction of the village" prop="introduction">
              <el-input
                v-model="queryParams.introduction"
                placeholder="请输入Brief description or introduction of the village"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="Region Code" prop="regionCode">
              <el-input v-model="queryParams.regionCode" placeholder="请输入Region Code" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item class="search-actions">
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="18"><span class="table-page-title"><el-icon class="table-page-title-icon"><Tickets /></el-icon> {{ ($route.meta.title || "") + " List" }}</span></el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['demo:village:export']">导出</el-button>
          </el-col>
          <el-col :span="1.5" style="margin-left: auto">
            <el-button type="danger" plain icon="Delete" v-if="!multiple" @click="handleDelete()" v-hasPermi="['demo:village:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5" style="margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:village:add']">新增</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="villageList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!-- <el-table-column label="" align="center" prop="id" v-if="true" /> -->
        <el-table-column label="Unique code of the village" align="center" prop="code" />
        <el-table-column label="Name of the village" align="center" prop="name" />
        <el-table-column label="Longitude coordinate of the village center" align="center" prop="longitude" />
        <el-table-column label="Latitude coordinate of the village center" align="center" prop="latitude" />
        <el-table-column label="Brief description or introduction of the village" align="center" prop="introduction" />
        <el-table-column label="Region Code" align="center" prop="regionCode" />
        <el-table-column label="操作" align="center" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['demo:village:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['demo:village:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改村子对话框 -->
  </div>
</template>

<script setup name="Village" lang="ts">
import { listVillage, getVillage, delVillage, addVillage, updateVillage } from '@/api/demo/village';
import { VillageVO, VillageQuery, VillageForm } from '@/api/demo/village/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const villageList = ref<VillageVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const villageFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: VillageForm = {
  id: undefined,
  code: undefined,
  name: undefined,
  longitude: undefined,
  latitude: undefined,
  introduction: undefined,
  regionCode: undefined
};
const data = reactive<PageData<VillageForm, VillageQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    code: undefined,
    name: undefined,
    longitude: undefined,
    latitude: undefined,
    introduction: undefined,
    regionCode: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: '不能为空', trigger: 'blur' }],
    code: [{ required: true, message: 'Unique code of the village不能为空', trigger: 'blur' }],
    name: [{ required: true, message: 'Name of the village不能为空', trigger: 'blur' }],
    introduction: [{ required: true, message: 'Brief description or introduction of the village不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询村子列表 */
const getList = async () => {
  loading.value = true;
  const res = await listVillage(queryParams.value);
  villageList.value = res.rows;
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
  villageFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: VillageVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  router.push({ name: 'VillageAdd' });
};

/** 修改按钮操作 */
const handleUpdate = (row?: VillageVO) => {
  const _id = row?.id || ids.value[0];
  router.push({ name: 'VillageEdit', params: { id: _id } });
};

/** 提交按钮 */
const submitForm = () => {
  villageFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateVillage(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addVillage(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: VillageVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除村子编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delVillage(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'demo/village/export',
    {
      ...queryParams.value
    },
    `village_${new Date().getTime()}.xlsx`
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

