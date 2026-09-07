<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Name of the plot" prop="name">
              <el-input prefix-icon="Search" v-model="queryParams.name" placeholder="请输入Name of the plot" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Unique code identifying the plot" prop="plotCode">
              <el-input v-model="queryParams.plotCode" placeholder="请输入Unique code identifying the plot" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="ID of the village where the plot is located" prop="villageId">
              <el-input
                v-model="queryParams.villageId"
                placeholder="请输入ID of the village where the plot is located"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="ID of the farmer who owns or manages the plot" prop="farmerId">
              <el-input
                v-model="queryParams.farmerId"
                placeholder="请输入ID of the farmer who owns or manages the plot"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="Area of the plot in square meters (or other defined unit)" prop="area">
              <el-input
                v-model="queryParams.area"
                placeholder="请输入Area of the plot in square meters (or other defined unit)"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="Sorting order for display purposes" prop="orderSort">
              <el-input v-model="queryParams.orderSort" placeholder="请输入Sorting order for display purposes" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Longitude coordinate of the plot location" prop="longitude">
              <el-input
                v-model="queryParams.longitude"
                placeholder="请输入Longitude coordinate of the plot location"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="Latitude coordinate of the plot location" prop="latitude">
              <el-input
                v-model="queryParams.latitude"
                placeholder="请输入Latitude coordinate of the plot location"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="Brief description or introduction of the plot" prop="introduction">
              <el-input
                v-model="queryParams.introduction"
                placeholder="请输入Brief description or introduction of the plot"
                clearable
                @keyup.enter="handleQuery"
              />
            </el-form-item>
            <el-form-item label="Type of soil on the plot " prop="soilType">
              <el-select v-model="queryParams.soilType" placeholder="请选择Type of soil on the plot " clearable>
                <el-option v-for="dict in ori_soil_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
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
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['demo:plot:export']">导出</el-button>
          </el-col>
          <el-col :span="1.5" style="margin-left: auto">
            <el-button type="danger" plain icon="Delete" v-if="!multiple" @click="handleDelete()" v-hasPermi="['demo:plot:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5" style="margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:plot:add']">新增</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="plotList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="Unique identifier for the plot" align="center" prop="id" v-if="true" />
        <el-table-column label="Name of the plot" align="center" prop="name" />
        <el-table-column label="Unique code identifying the plot" align="center" prop="plotCode" />
        <el-table-column label="ID of the village where the plot is located" align="center" prop="villageId" />
        <el-table-column label="ID of the farmer who owns or manages the plot" align="center" prop="farmerId" />
        <el-table-column label="Area of the plot in square meters (or other defined unit)" align="center" prop="area" />
        <el-table-column label="Sorting order for display purposes" align="center" prop="orderSort" />
        <el-table-column label="Longitude coordinate of the plot location" align="center" prop="longitude" />
        <el-table-column label="Latitude coordinate of the plot location" align="center" prop="latitude" />
        <el-table-column label="Brief description or introduction of the plot" align="center" prop="introduction" />
        <el-table-column label="Type of soil on the plot (coded value, e.g., 1=sandy, 2=clay, etc.)" align="center" prop="soilType">
          <template #default="scope">
            <dict-tag :options="ori_soil_type" :value="scope.row.soilType" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['demo:plot:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['demo:plot:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改Original plot information table对话框 -->
  </div>
</template>

<script setup name="Plot" lang="ts">
import { listPlot, getPlot, delPlot, addPlot, updatePlot } from '@/api/demo/plot';
import { PlotVO, PlotQuery, PlotForm } from '@/api/demo/plot/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { ori_soil_type } = toRefs<any>(proxy?.useDict('ori_soil_type'));

const plotList = ref<PlotVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const plotFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: PlotForm = {
  id: undefined,
  name: undefined,
  plotCode: undefined,
  villageId: undefined,
  farmerId: undefined,
  area: undefined,
  orderSort: undefined,
  longitude: undefined,
  latitude: undefined,
  introduction: undefined,
  soilType: undefined
};
const data = reactive<PageData<PlotForm, PlotQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    plotCode: undefined,
    villageId: undefined,
    farmerId: undefined,
    area: undefined,
    orderSort: undefined,
    longitude: undefined,
    latitude: undefined,
    introduction: undefined,
    soilType: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: 'Unique identifier for the plot不能为空', trigger: 'blur' }],
    name: [{ required: true, message: 'Name of the plot不能为空', trigger: 'blur' }],
    plotCode: [{ required: true, message: 'Unique code identifying the plot不能为空', trigger: 'blur' }],
    villageId: [{ required: true, message: 'ID of the village where the plot is located不能为空', trigger: 'blur' }],
    farmerId: [{ required: true, message: 'ID of the farmer who owns or manages the plot不能为空', trigger: 'blur' }],
    area: [{ required: true, message: 'Area of the plot in square meters (or other defined unit)不能为空', trigger: 'blur' }],
    orderSort: [{ required: true, message: 'Sorting order for display purposes不能为空', trigger: 'blur' }],
    longitude: [{ required: true, message: 'Longitude coordinate of the plot location不能为空', trigger: 'blur' }],
    latitude: [{ required: true, message: 'Latitude coordinate of the plot location不能为空', trigger: 'blur' }],
    soilType: [{ required: true, message: 'Type of soil on the plot (coded value, e.g., 1=sandy, 2=clay, etc.)不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询Original plot information table列表 */
const getList = async () => {
  loading.value = true;
  const res = await listPlot(queryParams.value);
  plotList.value = res.rows;
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
  plotFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: PlotVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  router.push({ name: 'PlotAdd' });
};

/** 修改按钮操作 */
const handleUpdate = (row?: PlotVO) => {
  const _id = row?.id || ids.value[0];
  router.push({ name: 'PlotEdit', params: { id: _id } });
};

/** 提交按钮 */
const submitForm = () => {
  plotFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updatePlot(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addPlot(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: PlotVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除Original plot information table编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delPlot(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'demo/plot/export',
    {
      ...queryParams.value
    },
    `plot_${new Date().getTime()}.xlsx`
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

onUnmounted(() => {});
</script>
<style lang="css" scoped>
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  display: none;
  z-index: 1000;
  min-width: 150px;
}

.context-menu ul {
  list-style: none;
  margin: 0;
  padding: 5px 0;
}

.context-menu li {
  padding: 8px 15px;
  cursor: pointer;
  font-size: 14px;
}

.context-menu li:hover {
  background-color: #f5f5f5;
}

.context-menu hr {
  margin: 5px 0;
  border: none;
  border-top: 1px solid #eee;
}
</style>

