<template>
  <el-dialog
    :title="title"
    :model-value="modelValue"
    width="600px"
    append-to-body
    @update:model-value="onUpdateVisible"
  >
    <el-form
      ref="innerFormRef"
      :model="form"
      :rules="rules"
      label-width="auto"
    >
      <el-form-item label="Processor ID" prop="processorId">
        <el-autocomplete
          v-model="form.processorId"
          :fetch-suggestions="queryProcessorId as any"
          :trigger-on-focus="false"
          placeholder="Please input Processor ID"
          :disabled="isReadonlyMode"
          :loading="processorIdLoading"
          clearable
          @select="handleProcessorIdSelect"
        >
          <template #default="{ item }">
            <div>
              <span>{{ item.value }}</span>
              <span v-if="item.processorName" style="color: #8492a6; font-size: 13px; margin-left: 8px">
              </span>
            </div>
          </template>
        </el-autocomplete>
      </el-form-item>
      <el-form-item label="Product Name" prop="productName">
        <el-input
          v-model="form.productName"
          placeholder="Please input Product Name"
          :disabled="isReadonlyMode"
        />
      </el-form-item>
      <el-form-item label="Product Category" prop="productCategory">
        <el-select
          v-model="form.productCategory"
          placeholder="Please select Product Category"
          :disabled="isReadonlyMode"
        >
          <el-option
            v-for="dict in processorTypeOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Standard Reference" prop="standardReference">
        <el-input
          v-model="form.standardReference"
          placeholder="Please input Standard Reference"
          :disabled="isReadonlyMode"
        />
      </el-form-item>
      <el-form-item label="Packaging Type" prop="packagingType">
        <el-input
          v-model="form.packagingType"
          placeholder="Please input Packaging Type"
          :disabled="isReadonlyMode"
        />
      </el-form-item>
      <el-form-item label="Export Eligible" prop="exportEligible">
        <el-radio-group v-model="form.exportEligible" :disabled="isReadonlyMode">
          <el-radio :label="0">No</el-radio>
          <el-radio :label="1">Yes</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        v-if="showApprovedComment?.(form) || showApprovedCommentInput?.(form)"
        label="Approval Comment"
        prop="approvedComment"
      >
        <el-input
          v-model="approvedCommentValue"
          type="textarea"
          placeholder="Please input content"
          :disabled="isApprovedCommentDisabled"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <!-- 只读模式：只显示 Close 按钮 -->
        <template v-if="modelValue && mode === 'readonly'">
          <el-button @click="handleCancel">Close</el-button>
        </template>
        <!-- 部分编辑模式和全部编辑模式：根据回调函数显示按钮 -->
        <template v-else-if="modelValue && (mode === 'partial-edit' || mode === 'all-edit')">
          <el-button
            v-if="showSaveButton && saveHandler"
            type="primary"
            :loading="buttonLoading"
            @click="saveHandler()"
          >
            Save
          </el-button>
          <template
            v-for="status in statusList"
            :key="status"
          >
            <el-button
              v-if="statusButtonHandlers && statusButtonHandlers[status]"
              :type="getButtonType(status)"
              :loading="buttonLoading"
              @click="handleStatusClick(status)"
            >
              {{ ProcessorProductStatus[status] }}
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
import type { ProcessorProductForm } from '@/api/demo/processorProduct/types';
import { ProcessorProductStatus } from '@/enums/AgriculturalEnum';
import { listAgroprocessor } from '@/api/demo/agroprocessor/index';
import type { AgroprocessorQuery } from '@/api/demo/agroprocessor/types';

type DialogMode = 'readonly' | 'partial-edit' | 'all-edit';

const props = withDefaults(defineProps<{
  /** 标题名称 */
  title: string;
  /** v-model:visible */
  modelValue: boolean;
  /** 表单数据（父组件传入） */
  form: ProcessorProductForm;
  /** 校验规则（父组件传入） */
  rules: any;
  /** 对话框模式：readonly-全部只读，partial-edit-部分编辑（只有ApprovedComment可编辑），all-edit-全部可编辑 */
  mode?: DialogMode;
  /** 是否展示审批意见（回调函数，参数是row） */
  showApprovedComment?: (row: ProcessorProductForm) => boolean;
  /** 是否显示审批意见输入框（回调函数，参数是row），如果返回true，则不显示原有数据，让用户输入 */
  showApprovedCommentInput?: (row: ProcessorProductForm) => boolean;
  /** Select 字典：产品类别 */
  processorTypeOptions: any[];
  /** 底部按钮 loading 状态 */
  buttonLoading?: boolean;
  /** 是否显示 Save 按钮（仅在 partial-edit 和 all-edit 模式下有效） */
  showSaveButton?: boolean;
  /** Save 按钮回调（仅在 partial-edit 和 all-edit 模式下有效） */
  saveHandler?: () => void;
  /** 底部状态按钮显示顺序（从左到右），不配置则按枚举数值降序（仅在 partial-edit 和 all-edit 模式下有效） */
  statusOrder?: ProcessorProductStatus[];
  /** 各状态对应的回调（仅在 partial-edit 和 all-edit 模式下有效） */
  statusButtonHandlers?: Partial<Record<ProcessorProductStatus, () => void>>;
}>(), {
  mode: 'readonly',
  showApprovedComment: () => true,
  buttonLoading: false,
  showSaveButton: false
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'cancel'): void;
}>();

const innerFormRef = ref<FormInstance>();

// Processor ID 自动完成相关
const processorIdLoading = ref(false);
const queryProcessorId = (queryString: string, cb: (suggestions: any[]) => void) => {
  if (!queryString) {
    cb([]);
    return;
  }
  processorIdLoading.value = true;
  listAgroprocessor({
    processorId: queryString,
    pageNum: 1,
    pageSize: 20
  } as AgroprocessorQuery)
    .then((res) => {
      const data = res.rows || [];
      const suggestions = data.map((item) => ({
        value: item.processorId,
        processorName: item.processorName,
        label: item.processorId ? `${item.processorId}` : String(item.processorId)
      }));
      cb(suggestions);
    })
    .catch((error) => {
      console.error('查询 Processor ID 失败:', error);
      cb([]);
    })
    .finally(() => {
      processorIdLoading.value = false;
    });
};

const handleProcessorIdSelect = (item: any) => {
  props.form.processorId = item.value;
};

// 部分编辑模式下，ApprovedComment 使用本地状态，不使用服务数据
const localApprovedComment = ref<string>('');

// 监听 dialog 打开/关闭，管理 approvedComment
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // 打开对话框时
    if (props.mode === 'partial-edit') {
      // 部分编辑模式：清空本地状态，不使用服务数据
      localApprovedComment.value = '';
    } else if (props.showApprovedCommentInput?.(props.form)) {
      // 如果 showApprovedCommentInput 返回 true，清空原有数据，让用户输入
      props.form.approvedComment = '';
    }
  } else {
    // 关闭对话框时
    if (props.mode === 'partial-edit') {
      // 清空本地状态，避免下次打开时保留旧值
      localApprovedComment.value = '';
    }
  }
});

// 监听 showApprovedCommentInput 的变化，如果返回 true 且对话框已打开，清空值
watch(() => props.showApprovedCommentInput?.(props.form), (shouldClear) => {
  if (shouldClear && props.modelValue) {
    if (props.mode === 'partial-edit') {
      localApprovedComment.value = '';
    } else {
      props.form.approvedComment = '';
    }
  }
});

// 监听本地 approvedComment 变化，同步到 form（用于提交）
watch(localApprovedComment, (newVal) => {
  if (props.mode === 'partial-edit') {
    props.form.approvedComment = newVal;
  }
});

// ApprovedComment 的值：
// 1. partial-edit 模式使用本地状态
// 2. 其他模式使用 form 中的数据
// 注意：如果 showApprovedCommentInput 返回 true，会在对话框打开时清空值（在 watch 中处理）
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

// 判断普通字段是否为只读模式
// readonly: 所有字段只读
// partial-edit: 除了 ApprovedComment 外，其他字段只读
// all-edit: 所有字段可编辑
const isReadonlyMode = computed(() => {
  return props.mode === 'readonly' || props.mode === 'partial-edit';
});

// 判断 ApprovedComment 是否禁用
const isApprovedCommentDisabled = computed(() => {
  // 只读模式下禁用
  if (props.mode === 'readonly') {
    return true;
  }
  // partial-edit 和 all-edit 模式下可编辑
  return false;
});

const statusList = computed<ProcessorProductStatus[]>(() => {
  // 如果外部配置了顺序，则优先使用外部配置
  if (props.statusOrder && props.statusOrder.length > 0) {
    return props.statusOrder;
  }
  // 默认：按枚举数值从大到小排序（降序），从左到右展示
  const values = Object.values(ProcessorProductStatus).filter(
    (v) => typeof v === 'number'
  ) as ProcessorProductStatus[];
  return values.sort((a, b) => b - a);
});

const onUpdateVisible = (val: boolean) => {
  emit('update:modelValue', val);
};

const handleCancel = () => {
  emit('cancel');
};

const handleStatusClick = (status: ProcessorProductStatus) => {
  if (props.statusButtonHandlers && props.statusButtonHandlers[status]) {
    props.statusButtonHandlers[status]!();
  }
};

// 根据不同的 ProcessorProductStatus 返回按钮的 type
const getButtonType = (status: ProcessorProductStatus): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  // 默认都是 primary，后续可以根据不同状态配置不同的 type
  const buttonTypeMap: Record<ProcessorProductStatus, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    [ProcessorProductStatus.Draft]: 'primary',
    [ProcessorProductStatus.Submitted]: 'primary',
    [ProcessorProductStatus.Approved]: 'primary',
    [ProcessorProductStatus.Rejected]: 'warning',
    [ProcessorProductStatus.NeedRevision]: 'warning'
  };
  return buttonTypeMap[status] || 'primary';
};

// 判断是否有其他按钮（Save 或状态按钮）
const hasOtherButtons = computed(() => {
  if (props.mode !== 'partial-edit' && props.mode !== 'all-edit') {
    return false;
  }
  // 检查是否有 Save 按钮
  const hasSaveButton = props.showSaveButton && props.saveHandler;
  
  // 检查是否有状态按钮
  const hasStatusButtons = props.statusButtonHandlers && 
    statusList.value.some(status => props.statusButtonHandlers?.[status]);
  
  return hasSaveButton || hasStatusButtons;
});

// 关闭按钮文字：如果有其他按钮则显示 Cancel，否则显示 Close
const cancelButtonText = computed(() => {
  return hasOtherButtons.value ? 'Cancel' : 'Close';
});

// 暴露表单引用和本地 approvedComment 给父组件
defineExpose({
  formRef: innerFormRef,
  localApprovedComment
});
</script>
