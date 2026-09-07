<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="Village name" prop="name">
              <el-input v-model="queryParams.name" placeholder="请输入Village name" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Village longitude (GIS coordinate)" prop="longitude">
              <el-input v-model="queryParams.longitude" placeholder="请输入Village longitude (GIS coordinate)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Village latitude (GIS coordinate)" prop="latitude">
              <el-input v-model="queryParams.latitude" placeholder="请输入Village latitude (GIS coordinate)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Brief description/introduction of the village" prop="introduction">
              <el-input v-model="queryParams.introduction" placeholder="请输入Brief description/introduction of the village" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
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
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:village:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:village:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:village:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:village:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="villageList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="Unique identifier for the village (primary key, auto-increment)" align="center" prop="id" v-if="true" />
        <el-table-column label="Village name" align="center" prop="name" />
        <el-table-column label="Village longitude (GIS coordinate)" align="center" prop="longitude" />
        <el-table-column label="Village latitude (GIS coordinate)" align="center" prop="latitude" />
        <el-table-column label="Brief description/introduction of the village" align="center" prop="introduction" />
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:village:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:village:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改village对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="villageFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="Village name" prop="name">
          <el-input v-model="form.name" placeholder="请输入Village name" />
        </el-form-item>
        <el-form-item label="Village longitude (GIS coordinate)" prop="longitude">
          <el-input v-model="form.longitude" placeholder="请输入Village longitude (GIS coordinate)" />
        </el-form-item>
        <el-form-item label="Village latitude (GIS coordinate)" prop="latitude">
          <el-input v-model="form.latitude" placeholder="请输入Village latitude (GIS coordinate)" />
        </el-form-item>
        <el-form-item label="Brief description/introduction of the village" prop="introduction">
            <el-input v-model="form.introduction" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Village" lang="ts">
import { listVillage, getVillage, delVillage, addVillage, updateVillage } from '@/api/system/village';
import { VillageVO, VillageQuery, VillageForm } from '@/api/system/village/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

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
  name: undefined,
  longitude: undefined,
  latitude: undefined,
  introduction: undefined,
}
const data = reactive<PageData<VillageForm, VillageQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    longitude: undefined,
    latitude: undefined,
    introduction: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "Unique identifier for the village (primary key, auto-increment)不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "Village name不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询village列表 */
const getList = async () => {
  loading.value = true;
  const res = await listVillage(queryParams.value);
  villageList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  villageFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: VillageVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加village";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: VillageVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getVillage(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改village";
}

/** 提交按钮 */
const submitForm = () => {
  villageFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateVillage(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addVillage(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: VillageVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除village编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delVillage(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/village/export', {
    ...queryParams.value
  }, `village_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
