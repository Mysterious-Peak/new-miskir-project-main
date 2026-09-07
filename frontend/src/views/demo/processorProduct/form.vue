<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="innerFormRef" :model="form" :rules="rules" label-width="auto">
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
      <div class="form-footer">
        <!-- 只读模式：只显示 Close 按钮 -->
        <template v-if="mode === 'readonly'">
          <el-button @click="cancel">Close</el-button>
        </template>
        <!-- 部分编辑模式和全部编辑模式：根据回调函数显示按钮 -->
        <template v-else-if="mode === 'partial-edit' || mode === 'all-edit'">
          <el-button v-if="showSaveButton" type="primary" :loading="buttonLoading" @click="submitForm">
            Save
          </el-button>
          <template v-for="status in statusList" :key="status">
            <el-button
              v-if="statusButtonHandlers && statusButtonHandlers[status]"
              :type="getButtonType(status)"
              :loading="buttonLoading"
              @click="handleStatusClick(status)"
            >
              {{ ProcessorProductStatus[status] }}
            </el-button>
          </template>
          <el-button @click="cancel">{{ cancelButtonText }}</el-button>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup name="ProcessorProductForm" lang="ts">
import type { FormInstance } from 'element-plus';
import { getProcessorProduct, addProcessorProduct, updateProcessorProduct } from '@/api/demo/processorProduct';
import type { ProcessorProductForm } from '@/api/demo/processorProduct/types';
import { ProcessorProductStatus } from '@/enums/AgriculturalEnum';
import { listAgroprocessor } from '@/api/demo/agroprocessor/index';
import type { AgroprocessorQuery } from '@/api/demo/agroprocessor/types';

type DialogMode = 'readonly' | 'partial-edit' | 'all-edit';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { t_agroprocessor_type } = toRefs<any>(proxy?.useDict('t_agroprocessor_type'));

const pageLoading = ref(false);
const buttonLoading = ref(false);
const innerFormRef = ref<FormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isApprove = computed(() => route.path.endsWith('/approve') || route.path.includes('/approve/'));
const isReview = computed(() => route.path.endsWith('/review') || route.path.includes('/review/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

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
};

const form = ref<ProcessorProductForm>({ ...initFormData });

const rules = {
  processorId: [{ required: true, message: 'Processor ID is required', trigger: 'blur' }],
  productName: [{ required: true, message: 'Product Name is required', trigger: 'blur' }],
  productCategory: [{ required: true, message: 'Product Category is required', trigger: 'change' }],
  exportEligible: [{ required: true, message: 'Export Eligible is required', trigger: 'change' }],
  status: [{ required: true, message: 'Status is required', trigger: 'change' }]
};

// 页面 mode 判定：readonly-全部只读，partial-edit-部分编辑（只有ApprovedComment可编辑），all-edit-全部可编辑
const mode = computed<DialogMode>(() => {
  // 审批页：Submitted 可审批显示 partial-edit，其他状态只读显示 readonly
  if (isApprove.value) {
    return canEditApprove(form.value) ? 'partial-edit' : 'readonly';
  }
  // 复核页：Draft 可编辑显示 all-edit，其他状态只读显示 readonly
  if (isReview.value) {
    return canEditReview(form.value) ? 'all-edit' : 'readonly';
  }
  // 列表页：新增为 all-edit；编辑按 canEdit 判定 all-edit / readonly；查看为 readonly
  if (isAdd.value) {
    return 'all-edit';
  }
  if (isEdit.value) {
    return canEditIndex(form.value) ? 'all-edit' : 'readonly';
  }
  return 'readonly';
});

/** 列表页：判断是否可以编辑（草稿/未定义/需修订 可编辑） */
const canEditIndex = (row: ProcessorProductForm): boolean => {
  return row.status === String(ProcessorProductStatus.Draft) || row.status == undefined || row.status === String(ProcessorProductStatus.NeedRevision);
};

/** 审批页：判断是否可以编辑（Submitted 可审批） */
const canEditApprove = (row: ProcessorProductForm): boolean => {
  return row.status === String(ProcessorProductStatus.Submitted);
};

/** 复核页：判断是否可以编辑（Draft/未定义 可编辑） */
const canEditReview = (row: ProcessorProductForm): boolean => {
  return row.status === String(ProcessorProductStatus.Draft) || row.status == undefined;
};

/** 列表页：判断是否展示审批意见 */
const showApprovedCommentIndex = (row: ProcessorProductForm): boolean => {
  return row.status === String(ProcessorProductStatus.Approved) || row.status === String(ProcessorProductStatus.Rejected);
};

/** 审批页：判断是否展示审批意见 */
const showApprovedCommentApprove = (row: ProcessorProductForm): boolean => {
  return row.status === String(ProcessorProductStatus.Approved) || row.status === String(ProcessorProductStatus.Submitted);
};

/** 复核页：判断是否展示审批意见 */
const showApprovedCommentReview = (row: ProcessorProductForm): boolean => {
  return row.approvedComment != undefined && row.approvedComment != '';
};

/** 是否展示审批意见（回调函数，参数是row） */
const showApprovedComment = (row: ProcessorProductForm): boolean => {
  if (isApprove.value) {
    return showApprovedCommentApprove(row);
  }
  if (isReview.value) {
    return showApprovedCommentReview(row);
  }
  return showApprovedCommentIndex(row);
};

/** 是否显示审批意见输入框（回调函数，参数是row），如果返回true，则不显示原有数据，让用户输入 */
const showApprovedCommentInput = (row: ProcessorProductForm): boolean => {
  if (isApprove.value) {
    // 审批页：只有 Submitted 状态才需要编辑 ApprovedComment
    return row.status === String(ProcessorProductStatus.Submitted);
  }
  // 列表页/复核页：不显示审批意见输入框
  return false;
};

// 部分编辑模式下，ApprovedComment 使用本地状态，不使用服务数据
const localApprovedComment = ref<string>('');

// ApprovedComment 的值：
// 1. partial-edit 模式使用本地状态
// 2. 其他模式使用 form 中的数据
// 注意：如果 showApprovedCommentInput 返回 true，会清空值（在 loadRecord 中处理）
const approvedCommentValue = computed({
  get() {
    if (mode.value === 'partial-edit') {
      return localApprovedComment.value;
    }
    return form.value.approvedComment || '';
  },
  set(val: string) {
    if (mode.value === 'partial-edit') {
      localApprovedComment.value = val;
    } else {
      form.value.approvedComment = val;
    }
  }
});

// 监听本地 approvedComment 变化，同步到 form（用于提交）
watch(localApprovedComment, (newVal) => {
  if (mode.value === 'partial-edit') {
    form.value.approvedComment = newVal;
  }
});

// 判断普通字段是否为只读模式
// readonly: 所有字段只读
// partial-edit: 除了 ApprovedComment 外，其他字段只读
// all-edit: 所有字段可编辑
const isReadonlyMode = computed(() => {
  return mode.value === 'readonly' || mode.value === 'partial-edit';
});

// 判断 ApprovedComment 是否禁用
const isApprovedCommentDisabled = computed(() => {
  // 只读模式下禁用
  if (mode.value === 'readonly') {
    return true;
  }
  // partial-edit 和 all-edit 模式下可编辑
  return false;
});

const statusList = computed<ProcessorProductStatus[]>(() => {
  // 列表页：[Rejected, Approved, Submitted, Draft]
  if (isAdd.value || isEdit.value || isDetail.value) {
    return [ProcessorProductStatus.Rejected, ProcessorProductStatus.Approved, ProcessorProductStatus.Submitted, ProcessorProductStatus.Draft];
  }
  // 审批页/复核页：[Approved, Submitted, Rejected, NeedRevision, Draft]
  return [ProcessorProductStatus.Approved, ProcessorProductStatus.Submitted, ProcessorProductStatus.Rejected, ProcessorProductStatus.NeedRevision, ProcessorProductStatus.Draft];
});

/** 底部各状态按钮对应的回调配置 */
const statusButtonHandlers = computed<Partial<Record<ProcessorProductStatus, () => void>>>(() => {
  const handlers: Partial<Record<ProcessorProductStatus, () => void>> = {};
  if (isApprove.value) {
    handlers[ProcessorProductStatus.Approved] = () => handleSubmitWithStatus(ProcessorProductStatus.Approved);
    handlers[ProcessorProductStatus.Rejected] = () => handleSubmitWithStatus(ProcessorProductStatus.Rejected);
    handlers[ProcessorProductStatus.NeedRevision] = () => handleSubmitWithStatus(ProcessorProductStatus.NeedRevision);
  } else if (isReview.value) {
    handlers[ProcessorProductStatus.Submitted] = () => handleSubmitWithStatus(ProcessorProductStatus.Submitted);
  }
  return handlers;
});

const handleStatusClick = (status: ProcessorProductStatus) => {
  if (statusButtonHandlers.value && statusButtonHandlers.value[status]) {
    statusButtonHandlers.value[status]!();
  }
};

/** 是否显示 Save 按钮（列表页新增/可编辑时显示；审批页/复核页不显示） */
const showSaveButton = computed(() => {
  if (isApprove.value || isReview.value) {
    return false;
  }
  if (isAdd.value) {
    return true;
  }
  if (isEdit.value) {
    return canEditIndex(form.value);
  }
  return false;
});

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
  if (mode.value !== 'partial-edit' && mode.value !== 'all-edit') {
    return false;
  }
  // 检查是否有 Save 按钮
  const hasSaveButton = showSaveButton.value;

  // 检查是否有状态按钮
  const hasStatusButtons = statusButtonHandlers.value && statusList.value.some((status) => statusButtonHandlers.value?.[status]);

  return hasSaveButton || hasStatusButtons;
});

// 关闭按钮文字：如果有其他按钮则显示 Cancel，否则显示 Close
const cancelButtonText = computed(() => {
  return hasOtherButtons.value ? 'Cancel' : 'Close';
});

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
  form.value.processorId = item.value;
};

/** Load record for edit/detail/approve/review mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getProcessorProduct(id.value);
    Object.assign(form.value, res.data);
    // 打开对话框时的逻辑：partial-edit 模式清空本地状态；showApprovedCommentInput 返回 true 时清空原有数据
    if (mode.value === 'partial-edit') {
      localApprovedComment.value = '';
    } else if (showApprovedCommentInput(form.value)) {
      form.value.approvedComment = '';
    }
  } finally {
    pageLoading.value = false;
  }
};

/** 点击不同状态按钮时提交表单 */
const handleSubmitWithStatus = (status: ProcessorProductStatus) => {
  form.value.status = String(status);
  submitForm();
};

/** 取消/关闭按钮 */
const cancel = () => {
  router.push(listPath.value);
};

/** 提交按钮 */
const submitForm = () => {
  // 列表页新增/修改：提交时固定为 Draft 状态（与列表页原逻辑一致）
  if (isAdd.value || isEdit.value) {
    form.value.status = String(ProcessorProductStatus.Draft);
  }
  innerFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      proxy?.$modal.msgError('Please check the form');
      return;
    }
    buttonLoading.value = true;
    try {
      if (form.value.productId) {
        await updateProcessorProduct(form.value);
      } else {
        await addProcessorProduct(form.value);
      }
      proxy?.$modal.msgSuccess('Success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    } finally {
      buttonLoading.value = false;
    }
  });
};

onMounted(() => {
  loadRecord();
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
