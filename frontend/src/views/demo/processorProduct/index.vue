<template>
  <div class="p-2">
    <ProcessorProductSearch
      :show-search="showSearch"
      :query-params="queryParams"
      :processor-product-all-list="processorProductAllList"
      @search="handleQuery"
      @reset="resetQuery"
    />

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="18"><span class="table-page-title"><el-icon class="table-page-title-icon"><Tickets /></el-icon> {{ ($route.meta.title || "") + " List" }}</span></el-col>
          <el-col :span="1.5" style="margin-left: auto; margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:processorProduct:add']">Add</el-button>
          </el-col>
        </el-row>
      </template>

      <ProcessorProductList
        :loading="loading"
        :processor-product-list="processorProductList"
        :t_agroprocessor_type="t_agroprocessor_type"
        :ProcessorProductStatus="ProcessorProductStatus"
        :total="total"
        :query-params="queryParams"
        :can-edit="canEdit"
        :can-delete="canDelete"
        @selectionChange="handleSelectionChange"
        @update="handleUpdate"
        @delete="handleDelete"
        @pagination="getList"
      />
    </el-card>
    <!-- 添加或修改加工厂产品注册对话框 -->
  </div>
</template>

<script setup name="ProcessorProduct" lang="ts">
import { listProcessorProduct, getProcessorProduct, delProcessorProduct, addProcessorProduct, updateProcessorProduct } from '@/api/demo/processorProduct';
import { ProcessorProductVO, ProcessorProductQuery, ProcessorProductForm } from '@/api/demo/processorProduct/types';
import { ProcessorProductStatus } from '@/enums/AgriculturalEnum';
import ProcessorProductDialog from './dialog.vue';
import ProcessorProductSearch from './search.vue';
import ProcessorProductList from './list.vue';

/** 当前文件级别配置类，仅在本文件中使用 */
class ProcessorProductConfig {
  /** 页面标题名称 */
  public readonly title: string = 'Processor Product';
}

/** 本文件唯一配置实例 */
const processorProductConfig = new ProcessorProductConfig();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { t_agroprocessor_type } = toRefs<any>(proxy?.useDict('t_agroprocessor_type'));

const processorProductList = ref<ProcessorProductVO[]>([]);
const processorProductAllList = ref<ProcessorProductVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const processorProductFormRef = ref<InstanceType<typeof ProcessorProductDialog>>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ProcessorProductForm = {
  productId: undefined,
  processorId: undefined,
  productName: undefined,
  productCategory: undefined,
  standardReference: undefined,
  packagingType: undefined,
  exportEligible: 0,
  status: undefined,
  approvedBy: undefined,
  approvedComment: undefined,
  approvedAt: undefined
}
const data = reactive<PageData<ProcessorProductForm, ProcessorProductQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    productId: undefined,
    processorId: undefined,
    productName: undefined,
    productCategory: undefined,
    standardReference: undefined,
    packagingType: undefined,
    exportEligible: undefined,
    status: undefined,
    approvedBy: undefined,
    approvedComment: undefined,
    approvedAt: undefined,
    params: {
    }
  },
  rules: {
    processorId: [
      { required: true, message: "Processor ID is required", trigger: "blur" }
    ],
    productName: [
      { required: true, message: "Product Name is required", trigger: "blur" }
    ],
    productCategory: [
      { required: true, message: "Product Category is required", trigger: "change" }
    ],
    exportEligible: [
      { required: true, message: "Export Eligible is required", trigger: "change" }
    ],
    status: [
      { required: true, message: "Status is required", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);


/** 查询加工厂产品注册列表 */
const getList = async () => {
  loading.value = true;
  const res = await listProcessorProduct(queryParams.value);
  processorProductList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 查询全部加工厂产品注册列表（用于搜索下拉） */
const getAllList = async () => {
  const res = await listProcessorProduct();
  processorProductAllList.value = res.rows;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  processorProductFormRef.value?.formRef?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  console.log(queryParams.value);
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: ProcessorProductVO[]) => {
  ids.value = selection.map(item => item.productId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  router.push({ name: 'ProcessorProductAdd' });
}

/** 修改/查看按钮操作 */
const handleUpdate = (row?: ProcessorProductVO) => {
  const _productId = row?.productId || ids.value[0]
  if (row && canEdit(row)) {
    router.push({ name: 'ProcessorProductEdit', params: { id: _productId } });
  } else {
    router.push({ name: 'ProcessorProductDetail', params: { id: _productId } });
  }
}

/** 提交按钮 */
const submitForm = () => {
  form.value.status = String(ProcessorProductStatus.Draft);
  processorProductFormRef.value?.formRef?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.productId) {
        await updateProcessorProduct(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addProcessorProduct(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("Success");
      dialog.visible = false;
      await getList();
      await getAllList();
    } else {
      proxy?.$modal.msgError("Please check the form");
    }
  });
}

/** 点击不同状态按钮时提交表单 */
const handleSubmitWithStatus = (status: ProcessorProductStatus) => {
  if (status === ProcessorProductStatus.NeedRevision) {
  }
  form.value.status = String(ProcessorProductStatus.Draft);
  submitForm();
};

/** 底部各状态按钮对应的回调配置 */
const statusButtonHandlers: Partial<Record<ProcessorProductStatus, () => void>> = {
  // [ProcessorProductStatus.Draft]: () => handleSubmitWithStatus(ProcessorProductStatus.Draft),
  // [ProcessorProductStatus.Reviewed]: () => handleSubmitWithStatus(ProcessorProductStatus.Reviewed),
  // [ProcessorProductStatus.Approved]: () => handleSubmitWithStatus(ProcessorProductStatus.Approved),
  // [ProcessorProductStatus.Rejected]: () => handleSubmitWithStatus(ProcessorProductStatus.Rejected)
};

/** 删除按钮操作 */
const handleDelete = async (row?: ProcessorProductVO) => {
  const _productIds = row?.productId || ids.value;
  await proxy?.$modal.confirm('Are you sure to delete the Processor Product with ID "' + _productIds + '" ?').finally(() => loading.value = false);
  await delProcessorProduct(_productIds);
  proxy?.$modal.msgSuccess("Success");
  await getList();
  await getAllList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('demo/processorProduct/export', {
    ...queryParams.value
  }, `processorProduct_${new Date().getTime()}.xlsx`)
}

/** 判断是否可以编辑 */
const canEdit = (row: ProcessorProductVO): boolean => {
  // 可以根据 row 的数据来判断是否可以编辑
  // 例如：只有草稿状态可以编辑
  return row.status === String(ProcessorProductStatus.Draft) || row.status == undefined || row.status === String(ProcessorProductStatus.NeedRevision);
  // return true; // 默认返回 true，可以根据实际需求修改
}


/** 判断是否可以删除 */
const canDelete = (row: ProcessorProductVO): boolean => {
  // 可以根据 row 的数据来判断是否可以删除
  // 例如：只有草稿状态可以删除
  return row.status === String(ProcessorProductStatus.Draft);
  // return true; // 默认返回 true，可以根据实际需求修改
}

/** 判断是否展示审批意见 */
const showApprovedComment = (row: ProcessorProductForm): boolean => {
  // 可以根据 row 的数据来判断是否展示审批意见
  // 例如：只有已审批或已拒绝状态才展示
  return row.status === String(ProcessorProductStatus.Approved) || 
         row.status === String(ProcessorProductStatus.Rejected);
  // return false; // 默认返回 false，可以根据实际需求修改
}


onMounted(() => {
  getList();
  getAllList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});
</script>
