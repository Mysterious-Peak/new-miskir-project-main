<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Name of the crop (e.g., Rice, Wheat, Tomato)" prop="name">
              <el-input prefix-icon="Search" v-model="queryParams.name" placeholder="请输入Name of the crop (e.g., Rice, Wheat, Tomato)" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Foreign key referencing the crop category (ori_crop_category.id)" prop="categoryId">
              <el-input v-model="queryParams.categoryId" placeholder="请输入Foreign key referencing the crop category (ori_crop_category.id)" clearable @keyup.enter="handleQuery" />
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
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['demo:crop:export']">导出</el-button>
          </el-col>
          <el-col :span="1.5" style="margin-left: auto">
            <el-button type="danger" plain icon="Delete" v-if="!multiple" @click="handleDelete()" v-hasPermi="['demo:crop:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5" style="margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:crop:add']">新增</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="cropList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="Unique auto-incremented identifier for the crop" align="center" prop="id" v-if="true" />
        <el-table-column label="Name of the crop (e.g., Rice, Wheat, Tomato)" align="center" prop="name" />
        <el-table-column label="Foreign key referencing the crop category (ori_crop_category.id)" align="center" prop="categoryId" />
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['demo:crop:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['demo:crop:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改Crop Management对话框 -->
  </div>
</template>

<script setup name="Crop" lang="ts">
import { listCrop, getCrop, delCrop, addCrop, updateCrop } from '@/api/demo/crop';
import { CropVO, CropQuery, CropForm } from '@/api/demo/crop/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const cropList = ref<CropVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const cropFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: CropForm = {
  id: undefined,
  name: undefined,
  categoryId: undefined
}
const data = reactive<PageData<CropForm, CropQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    categoryId: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "Unique auto-incremented identifier for the crop不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "Name of the crop (e.g., Rice, Wheat, Tomato)不能为空", trigger: "blur" }
    ],
    categoryId: [
      { required: true, message: "Foreign key referencing the crop category (ori_crop_category.id)不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询Crop Management列表 */
const getList = async () => {
  loading.value = true;
  const res = await listCrop(queryParams.value);
  cropList.value = res.rows;
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
  cropFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: CropVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  router.push({ name: 'CropAdd' });
}

/** 修改按钮操作 */
const handleUpdate = (row?: CropVO) => {
  const _id = row?.id || ids.value[0];
  router.push({ name: 'CropEdit', params: { id: _id } });
}

/** 提交按钮 */
const submitForm = () => {
  cropFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateCrop(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addCrop(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: CropVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除Crop Management编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delCrop(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('demo/crop/export', {
    ...queryParams.value
  }, `crop_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});
</script>

