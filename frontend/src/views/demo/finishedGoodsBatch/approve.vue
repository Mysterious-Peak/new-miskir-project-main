<template>
  <div class="p-2">
    <FinishedGoodsBatchSearch
      :show-search="showSearch"
      :query-params="queryParams"
      :warehouse-list="warehouseIdAllList"
      @search="handleQuery"
      @reset="resetQuery"
    />

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="18"><span class="table-page-title"><el-icon class="table-page-title-icon"><Tickets /></el-icon> {{ ($route.meta.title || "") + " List" }}</span></el-col>
        </el-row>
      </template>

      <FinishedGoodsBatchList
        :loading="loading"
        :finished-goods-batch-list="finishedGoodsBatchList"
        :packaging_type="packaging_type"
        :FinishedGoodsBatchStatus="FinishedGoodsBatchStatus"
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
  </div>
</template>

<script setup name="FinishedGoodsBatchApprove" lang="ts">
import { getFinishedGoodsBatch, listFinishedGoodsBatch, updateFinishedGoodsBatch } from '@/api/demo/finishedGoodsBatch';
import { FinishedGoodsBatchForm, FinishedGoodsBatchQuery, FinishedGoodsBatchVO } from '@/api/demo/finishedGoodsBatch/types';
import { FinishedGoodsBatchStatus } from '@/enums/AgriculturalEnum';
import FinishedGoodsBatchDialog from './dialog.vue';
import FinishedGoodsBatchList from './list.vue';
import FinishedGoodsBatchSearch from './search.vue';
import { list } from '@/api/monitor/online';
import { listExternalWarehouseList } from '@/api/demo/warehouseIntake';

class FinishedGoodsBatchConfig {
  public readonly title: string = 'Finished Goods Batch';
}

const finishedGoodsBatchConfig = new FinishedGoodsBatchConfig();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { packaging_type } = toRefs<any>(proxy?.useDict('packaging_type'));

const finishedGoodsBatchList = ref<FinishedGoodsBatchVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const warehouseIdAllList = ref<any[]>([]);

const finishedGoodsBatchFormRef = ref<InstanceType<typeof FinishedGoodsBatchDialog>>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: FinishedGoodsBatchForm = {
  finishedBatchId: undefined,
  productionBatchId: undefined,
  stockKeepingUnitCode: undefined,
  quantity: undefined,
  packagingType: undefined,
  expiryDate: undefined,
  qrCode: undefined,
  warehouseId: undefined,
  status: undefined,
  approvedBy: undefined,
  approvedComment: undefined,
  approvedAt: undefined
};

const data = reactive<PageData<FinishedGoodsBatchForm, FinishedGoodsBatchQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    finishedBatchId: undefined,
    productionBatchId: undefined,
    stockKeepingUnitCode: undefined,
    quantity: undefined,
    packagingType: undefined,
    expiryDate: undefined,
    qrCode: undefined,
    warehouseId: undefined,
    // status: String(FinishedGoodsBatchStatus.Submitted),
    approvedBy: undefined,
    approvedComment: undefined,
    approvedAt: undefined,
    params: {}
  },
  rules: {
    productionBatchId: [{ required: true, message: 'Production Batch ID is required', trigger: 'blur' }],
    warehouseId: [{ required: true, message: 'Warehouse ID is required', trigger: 'blur' }],
    status: [{ required: true, message: 'Status is required', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const getWarehouseCodeById = (warehouseId: string | number | undefined) => {
  const matched = warehouseIdAllList.value.find((item: any) => String(item.id) === String(warehouseId));
  return matched?.warehouseCode || String(warehouseId || '');
};

const initWarehouseOptions = async () => {
  try {
    const res = await listExternalWarehouseList();
    const rows = (res as any)?.data?.rows || [];
    warehouseIdAllList.value = rows;
  } catch (error) {
    console.error('Failed to initialize warehouse options:', error);
  }
};

/** 查询列表（默认只查 Submitted） */
const getList = async () => {
  loading.value = true;
  const res = await listFinishedGoodsBatch(queryParams.value);
  finishedGoodsBatchList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 取消 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  finishedGoodsBatchFormRef.value?.formRef?.resetFields();
};

/** 搜索 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置搜索 */
const resetQuery = () => {
  handleQuery();
};

/** 多选 */
const handleSelectionChange = (selection: FinishedGoodsBatchVO[]) => {
  ids.value = selection.map((item) => item.finishedBatchId);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

/** 修改/查看（审核页无新增） */
const handleUpdate = (row?: FinishedGoodsBatchVO) => {
  const _id = row?.finishedBatchId ?? ids.value[0];
  router.push({ name: 'VerifyFinishedGoodsBatch', params: { id: _id } });
};

/** 提交（仅用于状态按钮时带 status 的 update） */
const submitForm = () => {
  finishedGoodsBatchFormRef.value?.formRef?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      try {
        await updateFinishedGoodsBatch(form.value);
        proxy?.$modal.msgSuccess('Success');
        dialog.visible = false;
        await getList();
      } finally {
        buttonLoading.value = false;
      }
    } else {
      proxy?.$modal.msgError('Please check the form');
    }
  });
};

/** 点击状态按钮：设置 status 后提交 */
const handleSubmitWithStatus = (status: FinishedGoodsBatchStatus) => {
  form.value.status = String(status);
  submitForm();
};

const statusButtonHandlers: Partial<Record<FinishedGoodsBatchStatus, () => void>> = {
  [FinishedGoodsBatchStatus.Approved]: () => handleSubmitWithStatus(FinishedGoodsBatchStatus.Approved),
  [FinishedGoodsBatchStatus.Rejected]: () => handleSubmitWithStatus(FinishedGoodsBatchStatus.Rejected),
  [FinishedGoodsBatchStatus.NeedRevision]: () => handleSubmitWithStatus(FinishedGoodsBatchStatus.NeedRevision)
};

/** 审核页不可删除 */
const handleDelete = async () => {};

/** 可编辑：仅 Submitted（可点 Approved/Rejected） */
const canEdit = (row: FinishedGoodsBatchVO): boolean => {
  return row.status === String(FinishedGoodsBatchStatus.Submitted);
};

/** 审核页不可删除 */
const canDelete = (row: FinishedGoodsBatchVO): boolean => {
  return false;
};

/** 是否展示审批意见（只读） */
const showApprovedComment = (row: FinishedGoodsBatchForm): boolean => {
  return (
    row.status === String(FinishedGoodsBatchStatus.Approved) ||
    row.status === String(FinishedGoodsBatchStatus.Rejected) ||
    row.status === String(FinishedGoodsBatchStatus.Submitted)
  );
};

/** 是否显示审批意见输入框（Submitted 时让审核人输入） */
const showApprovedCommentInput = (row: FinishedGoodsBatchForm): boolean => {
  return row.status === String(FinishedGoodsBatchStatus.Submitted);
};

onMounted(async () => {
  try {
    await Promise.all([getList(), initWarehouseOptions()]);
  } catch (error) {
    console.error('init failed:', error);
  }
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});
</script>
