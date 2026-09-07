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
  // console.log(queryParams.value);
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
  reset();
  dialog.visible = true;
  dialog.title = "Verify " + processorProductConfig.title;
}

/** 审批/查看按钮操作 */
const handleUpdate = (row?: ProcessorProductVO) => {
  const _productId = row?.productId || ids.value[0]
  // 根据状态跳转：Submitted 可审批显示 Verify，其他状态只读显示 View
  if (row && canEdit(row)) {
    router.push({ name: 'ProcessorProductApprove', params: { id: _productId } });
  } else {
    router.push({ name: 'ProcessorProductDetail', params: { id: _productId } });
  }
}

/** 提交按钮 */
const submitForm = () => {
  processorProductFormRef.value?.formRef?.validate(async (valid: boolean) => {
    console.log(valid);
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
  form.value.status = String(status);
  submitForm();
};

/** 底部各状态按钮对应的回调配置 */
const statusButtonHandlers: Partial<Record<ProcessorProductStatus, () => void>> = {
  // [ProcessorProductStatus.Draft]: () => handleSubmitWithStatus(ProcessorProductStatus.Draft),
  // [ProcessorProductStatus.Submitted]: () => handleSubmitWithStatus(ProcessorProductStatus.Submitted),
  [ProcessorProductStatus.Approved]: () => handleSubmitWithStatus(ProcessorProductStatus.Approved),
  [ProcessorProductStatus.Rejected]: () => handleSubmitWithStatus(ProcessorProductStatus.Rejected),
  [ProcessorProductStatus.NeedRevision]: () => handleSubmitWithStatus(ProcessorProductStatus.NeedRevision)
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
  // 例如：只有已审核状态可以编辑
  return row.status === String(ProcessorProductStatus.Submitted);
  // return true; // 默认返回 true，可以根据实际需求修改
}


/** 判断是否可以删除 */
const canDelete = (row: ProcessorProductVO): boolean => {
  // 可以根据 row 的数据来判断是否可以删除
  // 例如：只有草稿状态可以删除
  // return row.status === String(ProcessorProductStatus.Draft);
  return false;
  // return true; // 默认返回 true，可以根据实际需求修改
}

/** 判断是否展示审批意见 */
const showApprovedComment = (row: ProcessorProductForm): boolean => {
  // 可以根据 row 的数据来判断是否展示审批意见
  // 例如：只有已审批或已审核状态才展示
  return row.status === String(ProcessorProductStatus.Approved) || row.status === String(ProcessorProductStatus.Submitted);
  // return row.status != undefined && row.status != String(ProcessorProductStatus.Approved);
}

/** 判断是否显示审批意见输入框（不显示原有数据，让用户输入） */
const showApprovedCommentInput = (row: ProcessorProductForm): boolean => {
  // 只有 Reviewed 状态才需要编辑 ApprovedComment
  return row.status === String(ProcessorProductStatus.Submitted);
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
