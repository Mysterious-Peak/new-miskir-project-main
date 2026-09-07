<template>
  <el-dialog :title="title" :model-value="modelValue" width="600px" append-to-body @update:model-value="onUpdateVisible">
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

      <el-form-item v-if="showApprovedComment?.(form) || showApprovedCommentInput?.(form)" label="Approval Comment" prop="approvedComment">
        <el-input v-model="approvedCommentValue" type="textarea" placeholder="Please input content" :disabled="isApprovedCommentDisabled" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <template v-if="modelValue && mode === 'readonly'">
          <el-button @click="handleCancel">Close</el-button>
        </template>
        <template v-else-if="modelValue && (mode === 'partial-edit' || mode === 'all-edit')">
          <el-button v-if="showSaveButton && saveHandler" type="primary" :loading="buttonLoading" @click="saveHandler()"> Save </el-button>
          <template v-for="status in statusList" :key="status">
            <el-button
              v-if="statusButtonHandlers && statusButtonHandlers[status] && (status !== FinishedGoodsBatchStatus.Submitted || showSubmittedButton)"
              :type="getButtonType(status)"
              :loading="buttonLoading"
              @click="handleStatusClick(status)"
            >
              {{ FinishedGoodsBatchStatus[status] }}
            </el-button>
          </template>
          <el-button @click="handleCancel">{{ cancelButtonText }}</el-button>
        </template>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance } from 'element-plus';
import type { FinishedGoodsBatchForm } from '@/api/demo/finishedGoodsBatch/types';
import { FinishedGoodsBatchStatus, ProductionBatchStatus } from '@/enums/AgriculturalEnum';
import { listProductionBatch } from '@/api/demo/productionBatch/index';
import type { ProductionBatchQuery } from '@/api/demo/productionBatch/types';

type DialogMode = 'readonly' | 'partial-edit' | 'all-edit';

const props = withDefaults(
  defineProps<{
    title: string;
    modelValue: boolean;
    form: FinishedGoodsBatchForm;
    rules: any;
    mode?: DialogMode;
    showApprovedComment?: (row: FinishedGoodsBatchForm) => boolean;
    showApprovedCommentInput?: (row: FinishedGoodsBatchForm) => boolean;
    packagingTypeOptions: any[];
    warehouseList: any[];
    warehouseCodeResolver: (warehouseId: string | number | undefined) => string;
    buttonLoading?: boolean;
    showSaveButton?: boolean;
    showSubmittedButton?: boolean;
    saveHandler?: () => void;
    statusOrder?: FinishedGoodsBatchStatus[];
    statusButtonHandlers?: Partial<Record<FinishedGoodsBatchStatus, () => void>>;
  }>(),
  {
    mode: 'readonly',
    showApprovedComment: () => true,
    warehouseCodeResolver: (warehouseId?: string | number) => String(warehouseId || ''),
    buttonLoading: false,
    showSaveButton: false,
    showSubmittedButton: false
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'cancel'): void;
}>();

const innerFormRef = ref<FormInstance>();

const localApprovedComment = ref<string>('');

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      if (props.mode === 'partial-edit') {
        localApprovedComment.value = '';
      } else if (props.showApprovedCommentInput?.(props.form)) {
        props.form.approvedComment = '';
      }
    } else {
      if (props.mode === 'partial-edit') {
        localApprovedComment.value = '';
      }
    }
  }
);

watch(
  () => props.showApprovedCommentInput?.(props.form),
  (shouldClear) => {
    if (shouldClear && props.modelValue) {
      if (props.mode === 'partial-edit') {
        localApprovedComment.value = '';
      } else {
        props.form.approvedComment = '';
      }
    }
  }
);

watch(localApprovedComment, (newVal) => {
  if (props.mode === 'partial-edit') {
    props.form.approvedComment = newVal;
  }
});

const approvedCommentValue = computed({
  get() {
    if (props.mode === 'partial-edit') {
      return localApprovedComment.value;
    }
    return props.form.approvedComment || '';
  },
  set(val: string) {
    if (props.mode === 'partial-edit') {
      localApprovedComment.value = val;
    } else {
      props.form.approvedComment = val;
    }
  }
});

const isReadonlyMode = computed(() => {
  return props.mode === 'readonly' || props.mode === 'partial-edit';
});

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
    const source = Array.isArray(props.warehouseList) ? props.warehouseList : [];
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
  () => props.form.warehouseId,
  (warehouseId) => {
    if (warehouseId == null || warehouseId === '') return;
    const exists = warehouseIdOptions.value.some((item) => String(item.value) === String(warehouseId));
    if (exists) return;
    warehouseIdOptions.value = [
      {
        value: warehouseId,
        label: props.warehouseCodeResolver(warehouseId)
      },
      ...warehouseIdOptions.value
    ];
  },
  { immediate: true }
);

const isApprovedCommentDisabled = computed(() => {
  if (props.mode === 'readonly') {
    return true;
  }
  return false;
});

const statusList = computed<FinishedGoodsBatchStatus[]>(() => {
  if (props.statusOrder && props.statusOrder.length > 0) {
    return props.statusOrder;
  }
  const values = Object.values(FinishedGoodsBatchStatus).filter((v) => typeof v === 'number') as FinishedGoodsBatchStatus[];
  return values.sort((a, b) => b - a);
});

const onUpdateVisible = (val: boolean) => {
  emit('update:modelValue', val);
};

const handleCancel = () => {
  emit('cancel');
};

const handleStatusClick = (status: FinishedGoodsBatchStatus) => {
  if (props.statusButtonHandlers && props.statusButtonHandlers[status]) {
    props.statusButtonHandlers[status]!();
  }
};

const getButtonType = (status: FinishedGoodsBatchStatus): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  const buttonTypeMap: Record<FinishedGoodsBatchStatus, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    [FinishedGoodsBatchStatus.Draft]: 'primary',
    [FinishedGoodsBatchStatus.Approved]: 'success',
    [FinishedGoodsBatchStatus.Submitted]: 'primary',
    [FinishedGoodsBatchStatus.Rejected]: 'warning',
    [FinishedGoodsBatchStatus.NeedRevision]: 'warning'
  };
  return buttonTypeMap[status] || 'primary';
};

const hasOtherButtons = computed(() => {
  if (props.mode !== 'partial-edit' && props.mode !== 'all-edit') {
    return false;
  }
  const hasSaveButton = props.showSaveButton && props.saveHandler;
  const hasStatusButtons =
    props.statusButtonHandlers &&
    statusList.value.some((status) => {
      if (status === FinishedGoodsBatchStatus.Submitted && !props.showSubmittedButton) {
        return false;
      }
      return !!props.statusButtonHandlers?.[status];
    });
  return hasSaveButton || hasStatusButtons;
});

const cancelButtonText = computed(() => {
  return hasOtherButtons.value ? 'Cancel' : 'Close';
});

defineExpose({
  formRef: innerFormRef,
  localApprovedComment
});
</script>
