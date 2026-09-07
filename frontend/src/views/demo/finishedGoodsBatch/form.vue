<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- Finished Goods Batch Dialog -->
      <el-form ref="innerFormRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="Production Batch ID" prop="productionBatchId">
          <el-input v-if="isReadonlyMode" :model-value="form.productionBatchId" placeholder="Please input Production Batch ID" disabled />
          <el-select
            v-else
            v-model="form.productionBatchId"
            filterable
            remote
            reserve-keyword
            placeholder="Please input Production Batch ID"
            :remote-method="productionBatchIdRemoteMethod"
            :loading="productionBatchIdLoading"
            :debounce="300"
            clearable
            style="width: 100%"
          >
            <el-option v-for="item in productionBatchIdOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Warehouse Code" prop="warehouseId">
          <el-input v-if="isReadonlyMode" v-model="form.warehouseCode" placeholder="Please input Warehouse Code" disabled />
          <el-select
            v-else
            v-model="form.warehouseId"
            filterable
            remote
            reserve-keyword
            placeholder="Please input Warehouse ID"
            :remote-method="warehouseIdRemoteMethod"
            :loading="warehouseIdLoading"
            :debounce="300"
            clearable
            style="width: 100%"
          >
            <el-option v-for="item in warehouseIdOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Stock Keeping Unit Code" prop="stockKeepingUnitCode">
          <el-input v-model="form.stockKeepingUnitCode" placeholder="Please input Stock Keeping Unit Code" :disabled="isReadonlyMode" />
        </el-form-item>
        <el-form-item label="Quantity" prop="quantity">
          <el-input-number v-model="form.quantity" placeholder="Please input Quantity" :min="0" style="width: 100%" :disabled="isReadonlyMode" />
        </el-form-item>
        <el-form-item label="Packaging Type" prop="packagingType">
          <el-select v-model="form.packagingType" placeholder="Please select Packaging Type" :disabled="isReadonlyMode" style="width: 100%">
            <el-option v-for="dict in packagingTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="Expiry Date" prop="expiryDate">
          <el-date-picker
            v-model="form.expiryDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="Please select Expiry Date"
            style="width: 100%"
            :disabled="isReadonlyMode"
          />
        </el-form-item>
        <el-form-item label="QR Code" prop="qrCode">
          <image-upload v-model="form.qrCode" :disabled="isReadonlyMode" />
        </el-form-item>

        <el-form-item v-if="showApprovedComment || showApprovedCommentInput" label="Approval Comment" prop="approvedComment">
          <el-input v-model="form.approvedComment" type="textarea" placeholder="Please input content" :disabled="isApprovedCommentDisabled" />
        </el-form-item>
      </el-form>
      <div class="form-footer">
        <template v-if="isDetail || (isVerify && !isSubmitted)">
          <el-button @click="cancel">Close</el-button>
        </template>
        <template v-else>
          <el-button v-if="showSaveButton" type="primary" :loading="buttonLoading" @click="handleSave"> Save </el-button>
          <el-button
            v-if="statusButtonHandlers[FinishedGoodsBatchStatus.Submitted] && showSubmittedButton"
            type="primary"
            :loading="buttonLoading"
            @click="handleStatusClick(FinishedGoodsBatchStatus.Submitted)"
          >
            {{ FinishedGoodsBatchStatus[FinishedGoodsBatchStatus.Submitted] }}
          </el-button>
          <template v-if="isVerify">
            <el-button
              v-if="statusButtonHandlers[FinishedGoodsBatchStatus.Approved]"
              type="success"
              :loading="buttonLoading"
              @click="handleStatusClick(FinishedGoodsBatchStatus.Approved)"
            >
              {{ FinishedGoodsBatchStatus[FinishedGoodsBatchStatus.Approved] }}
            </el-button>
            <el-button
              v-if="statusButtonHandlers[FinishedGoodsBatchStatus.Rejected]"
              type="warning"
              :loading="buttonLoading"
              @click="handleStatusClick(FinishedGoodsBatchStatus.Rejected)"
            >
              {{ FinishedGoodsBatchStatus[FinishedGoodsBatchStatus.Rejected] }}
            </el-button>
            <el-button
              v-if="statusButtonHandlers[FinishedGoodsBatchStatus.NeedRevision]"
              type="warning"
              :loading="buttonLoading"
              @click="handleStatusClick(FinishedGoodsBatchStatus.NeedRevision)"
            >
              {{ FinishedGoodsBatchStatus[FinishedGoodsBatchStatus.NeedRevision] }}
            </el-button>
          </template>
          <el-button @click="cancel">Cancel</el-button>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup name="FinishedGoodsBatchForm" lang="ts">
import type { FormInstance } from 'element-plus';
import { getFinishedGoodsBatch, addFinishedGoodsBatch, updateFinishedGoodsBatch } from '@/api/demo/finishedGoodsBatch';
import type { FinishedGoodsBatchForm } from '@/api/demo/finishedGoodsBatch/types';
import { FinishedGoodsBatchStatus, ProductionBatchStatus } from '@/enums/AgriculturalEnum';
import { listProductionBatch } from '@/api/demo/productionBatch/index';
import { listExternalWarehouseList } from '@/api/demo/warehouseIntake';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { packaging_type } = toRefs<any>(proxy?.useDict('packaging_type'));

const pageLoading = ref(false);
const buttonLoading = ref(false);
const innerFormRef = ref<FormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isVerify = computed(() => route.path.endsWith('/verify') || route.path.includes('/verify/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const packagingTypeOptions = computed(() => packaging_type.value || []);

const warehouseIdAllList = ref<any[]>([]);

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

const form = ref<FinishedGoodsBatchForm>({ ...initFormData });

const rules = {
  productionBatchId: [{ required: true, message: 'Production Batch ID is required', trigger: 'blur' }],
  warehouseId: [{ required: true, message: 'Warehouse ID is required', trigger: 'blur' }],
  status: [{ required: true, message: 'Status is required', trigger: 'change' }]
};

const getWarehouseCodeById = (warehouseId: string | number | undefined) => {
  const matched = warehouseIdAllList.value.find((item: any) => String(item.id) === String(warehouseId));
  return matched?.warehouseCode || String(warehouseId || '');
};

const editForm = () => {
  form.value.warehouseCode = getWarehouseCodeById(form.value.warehouseId as string | number | undefined) || undefined;
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

const isReadonlyMode = computed(() => {
  return isDetail.value || isVerify.value;
});

const isSubmitted = computed(() => form.value.status === String(FinishedGoodsBatchStatus.Submitted));

const productionBatchIdOptions = ref<any[]>([]);
const productionBatchIdLoading = ref(false);
const productionBatchIdRemoteMethod = async (query: string) => {
  if (query) {
    productionBatchIdLoading.value = true;
    try {
      // 按后端要求使用 production_batch_id 字段进行模糊查询
      const response = await listProductionBatch({ production_batch_id: query } as any);
      const rows = response.rows || [];
      const filteredRows = rows.filter((item: any) => item.status === ProductionBatchStatus.Completed.toString());
      // 兼容后端返回 TableDataInfo 结构
      productionBatchIdOptions.value = filteredRows.map((item: any) => ({
        value: item.productionBatchId,
        label: item.productionBatchId
      }));
    } catch (error) {
      console.error('查询 Production Batch ID 失败:', error);
      productionBatchIdOptions.value = [];
    } finally {
      productionBatchIdLoading.value = false;
    }
  } else {
    productionBatchIdOptions.value = [];
  }
};

const warehouseIdOptions = ref<any[]>([]);
const warehouseIdLoading = ref(false);
const warehouseIdRemoteMethod = async (query: string) => {
  warehouseIdLoading.value = true;
  try {
    const q = (query || '').trim().toLowerCase();
    const source = Array.isArray(warehouseIdAllList.value) ? warehouseIdAllList.value : [];
    const filtered = source.filter((item: any) => {
      if (!q) return true;
      const idText = String(item?.id || '').toLowerCase();
      const codeText = String(item?.warehouseCode || '').toLowerCase();
      const nameText = String(item?.warehouseName || '').toLowerCase();
      return idText.includes(q) || codeText.includes(q) || nameText.includes(q);
    });
    const dedupMap = new Map<string, any>();
    filtered.forEach((item: any) => {
      const key = String(item?.id || '');
      if (!key || dedupMap.has(key)) return;
      dedupMap.set(key, {
        value: item.id,
        label: item.warehouseCode || item.warehouseName || item.id
      });
    });
    warehouseIdOptions.value = Array.from(dedupMap.values()).slice(0, 100);
  } finally {
    warehouseIdLoading.value = false;
  }
};

watch(
  () => form.value.warehouseId,
  (warehouseId) => {
    if (warehouseId == null || warehouseId === '') return;
    const exists = warehouseIdOptions.value.some((item) => String(item.value) === String(warehouseId));
    if (exists) return;
    warehouseIdOptions.value = [
      {
        value: warehouseId,
        label: getWarehouseCodeById(warehouseId)
      },
      ...warehouseIdOptions.value
    ];
  },
  { immediate: true }
);

/** 是否展示审批意见（只读） */
const showApprovedComment = computed(() => {
  const s = form.value.status;
  return (
    s === String(FinishedGoodsBatchStatus.Approved) ||
    s === String(FinishedGoodsBatchStatus.Rejected) ||
    (isVerify.value && s === String(FinishedGoodsBatchStatus.Submitted))
  );
});

/** 是否显示审批意见输入框（Submitted 时让审核人输入） */
const showApprovedCommentInput = computed(() => {
  return isVerify.value && form.value.status === String(FinishedGoodsBatchStatus.Submitted);
});

const isApprovedCommentDisabled = computed(() => {
  if (isDetail.value) {
    return true;
  }
  if (isVerify.value && !showApprovedCommentInput.value) {
    return true;
  }
  return false;
});

/** 可编辑：Draft、NeedRevision（可保存或提交为 Submitted） */
const canEdit = (row: FinishedGoodsBatchForm): boolean => {
  return (
    row.status === String(FinishedGoodsBatchStatus.Draft) || row.status === undefined || row.status === String(FinishedGoodsBatchStatus.NeedRevision)
  );
};

const showSaveButton = computed(() => canEdit(form.value));

/** 是否展示提交按钮 */
const showSubmittedButton = computed(() => {
  const s = form.value.status;
  if (s === undefined) {
    return false;
  }
  return s === String(FinishedGoodsBatchStatus.Draft) || s === String(FinishedGoodsBatchStatus.NeedRevision);
});

/** Load record for add/edit/detail/verify mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getFinishedGoodsBatch(id.value);
    Object.assign(form.value, res.data);
    editForm();
    // 校验页（partial-edit）：Submitted 时清空审批意见，让审核人输入
    if (isVerify.value && showApprovedCommentInput.value) {
      form.value.approvedComment = '';
    }
  } finally {
    pageLoading.value = false;
  }
};

/** Cancel Button */
const cancel = () => {
  router.push(listPath.value);
};

/** 提交（仅用于状态按钮时带 status 的 update） */
const submitForm = () => {
  innerFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      try {
        if (form.value.finishedBatchId) {
          await updateFinishedGoodsBatch(form.value);
        } else {
          await addFinishedGoodsBatch(form.value);
        }
        proxy?.$modal.msgSuccess('Success');
        router.push({ path: listPath.value, query: { refresh: '1' } });
      } finally {
        buttonLoading.value = false;
      }
    } else {
      proxy?.$modal.msgError('Please check the form');
    }
  });
};

/** 保存按钮处理函数 */
const handleSave = () => {
  form.value.status = String(FinishedGoodsBatchStatus.Draft);
  editForm();
  submitForm();
};

/** 点击状态按钮：设置 status 后提交 */
const handleSubmitWithStatus = (status: FinishedGoodsBatchStatus) => {
  form.value.status = String(status);
  editForm();
  submitForm();
};

const statusButtonHandlers: Partial<Record<FinishedGoodsBatchStatus, () => void>> = {
  [FinishedGoodsBatchStatus.Submitted]: () => handleSubmitWithStatus(FinishedGoodsBatchStatus.Submitted),
  [FinishedGoodsBatchStatus.Approved]: () => handleSubmitWithStatus(FinishedGoodsBatchStatus.Approved),
  [FinishedGoodsBatchStatus.Rejected]: () => handleSubmitWithStatus(FinishedGoodsBatchStatus.Rejected),
  [FinishedGoodsBatchStatus.NeedRevision]: () => handleSubmitWithStatus(FinishedGoodsBatchStatus.NeedRevision)
};

const handleStatusClick = (status: FinishedGoodsBatchStatus) => {
  if (statusButtonHandlers[status]) {
    statusButtonHandlers[status]!();
  }
};

onMounted(async () => {
  await initWarehouseOptions();
  await loadRecord();
});
</script>

<style scoped>
.form-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 0;
}
</style>
