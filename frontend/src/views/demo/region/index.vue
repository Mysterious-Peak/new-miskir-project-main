<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="上一级行政区划编码" prop="parentCode">
              <el-input prefix-icon="Search" v-model="queryParams.parentCode" placeholder="请输入" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="行政区划编码" prop="code">
              <el-input v-model="queryParams.code" placeholder="请输入行政区划编码" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="层级" prop="level">
              <el-select v-model="queryParams.level" placeholder="请选择层级" clearable>
                <el-option v-for="dict in region_level" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="区域名称" prop="name">
              <el-input v-model="queryParams.name" placeholder="请输入区域名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="中心经度" prop="centerLongitude">
              <el-input v-model="queryParams.centerLongitude" placeholder="请输入中心经度" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="中心纬度" prop="centerLatitude">
              <el-input v-model="queryParams.centerLatitude" placeholder="请输入中心纬度" clearable @keyup.enter="handleQuery" />
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
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['demo:region:export']">导出</el-button>
          </el-col>
          <el-col :span="1.5" style="margin-left: auto">
            <el-button type="danger" plain icon="Delete" v-if="!multiple" @click="handleDelete()" v-hasPermi="['demo:region:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5" style="margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:region:add']">新增</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="regionList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!-- <el-table-column label="" align="center" prop="id" v-if="true" /> -->
        <el-table-column label="上一级行政区划编码" align="center" prop="parentCode" />
        <el-table-column label="行政区划编码" align="center" prop="code" />
        <el-table-column label="层级: 1=Region, 2=Zone, 3=Woreda, 4=Kebele" align="center" prop="level">
          <template #default="scope">
            <dict-tag :options="region_level" :value="scope.row.level" />
          </template>
        </el-table-column>
        <el-table-column label="区域名称" align="center" prop="name" />
        <el-table-column label="中心经度" align="center" prop="centerLongitude" />
        <el-table-column label="中心纬度" align="center" prop="centerLatitude" />
        <el-table-column label="操作" align="center" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['demo:region:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['demo:region:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改行政区域对话框 -->
  </div>
</template>

<script setup name="Region" lang="ts">
import { listRegion, getRegion, delRegion, addRegion, updateRegion } from '@/api/demo/region';
import { RegionVO, RegionQuery, RegionForm } from '@/api/demo/region/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { region_level } = toRefs<any>(proxy?.useDict('region_level'));

const regionList = ref<RegionVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const regionFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: RegionForm = {
  id: undefined,
  parentCode: undefined,
  code: undefined,
  level: undefined,
  name: undefined,
  centerLongitude: undefined,
  centerLatitude: undefined
};
const data = reactive<PageData<RegionForm, RegionQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    parentCode: undefined,
    code: undefined,
    level: undefined,
    name: undefined,
    centerLongitude: undefined,
    centerLatitude: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: '不能为空', trigger: 'blur' }],
    code: [{ required: true, message: '行政区划编码不能为空', trigger: 'blur' }],
    level: [{ required: true, message: '层级: 1=Region, 2=Zone, 3=Woreda, 4=Kebele不能为空', trigger: 'change' }],
    name: [{ required: true, message: '区域名称不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询行政区域列表 */
const getList = async () => {
  loading.value = true;
  const res = await listRegion(queryParams.value);
  regionList.value = res.rows;
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
  regionFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: RegionVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  router.push({ name: 'RegionAdd' });
};

/** 修改按钮操作 */
const handleUpdate = (row?: RegionVO) => {
  const _id = row?.id || ids.value[0];
  router.push({ name: 'RegionEdit', params: { id: _id } });
};

/** 提交按钮 */
const submitForm = () => {
  regionFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateRegion(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addRegion(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: RegionVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除行政区域编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delRegion(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'demo/region/export',
    {
      ...queryParams.value
    },
    `region_${new Date().getTime()}.xlsx`
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

