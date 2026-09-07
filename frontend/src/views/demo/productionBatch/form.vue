<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- 添加或修改生产批次对话框 -->
      <el-form ref="productionBatchFormRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="Production Batch Id" prop="productionBatchId" v-show="!isAdd">
          <el-input v-model="form.productionBatchId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Processor Id" prop="processorId">
          <el-select
            v-model="form.processorId"
            filterable
            remote
            reserve-keyword
            placeholder="Please input"
            :remote-method="processorIdPopRemoteMethod"
            :loading="processorIdPopLoading"
            :debounce="300"
            v-if="!isViewFlag(form)"
            clearable
            @change="handleProcessorIdChange"
          >
            <el-option v-for="item in processorIdPopOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-else v-model="form.processorId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Product Id" prop="productId">
          <el-select
            v-model="form.productId"
            filterable
            remote
            reserve-keyword
            placeholder="Please input"
            :remote-method="productIdPopRemoteMethod"
            :loading="productIdPopLoading"
            :debounce="300"
            v-if="!isViewFlag(form)"
            clearable
          >
            <el-option v-for="item in productIdPopOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-else v-model="form.productId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Protocol Version" prop="protocolVersion">
          <el-input v-model="form.protocolVersion" placeholder="Please input" :disabled="isViewFlag(form)" clearable />
        </el-form-item>
        <el-form-item label="Start Time" prop="startTime">
          <el-date-picker
            clearable
            v-model="form.startTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select"
            :disabled="isViewFlag(form)"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="End Time" prop="endTime">
          <el-date-picker
            clearable
            v-model="form.endTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select"
            :disabled="isViewFlag(form)"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Created By" prop="createdUserName" v-if="isViewFlag(form)">
          <el-input v-model="form.createdUserName" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Creation Date" prop="createTime" v-if="isViewFlag(form)">
          <el-date-picker clearable v-model="form.createTime" type="date" value-format="YYYY-MM-DD" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Approved By" prop="approvedUserName" v-if="isViewFlag(form)">
          <el-input v-model="form.approvedUserName" placeholder="Please input Approved By" disabled />
        </el-form-item>
        <el-form-item label="Approved Date" prop="approvedAt" v-if="isViewFlag(form)">
          <el-date-picker clearable v-model="form.approvedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment" v-if="isViewFlag(form)">
          <el-input v-model="form.approvedComment" type="textarea" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item v-if="!isViewFlag(form)">
          <el-button type="primary" @click="handleAddStep" style="width: fit-content !important">add step</el-button>
        </el-form-item>

        <el-table stripe fit border :data="processStepRunList" class="mt-2">
          <el-table-column label="Step Run ID" align="center" prop="stepRunId" :min-width="getColumnWidth('Step Run ID')" />
          <el-table-column label="Step Name" align="center" prop="stepName" :min-width="getColumnWidth('Step Name')" />
          <el-table-column label="Start Time" align="center" prop="startTime" width="180" :min-width="getColumnWidth('Start Time')">
            <template #default="scope">
              <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
            </template>
          </el-table-column>
          <el-table-column label="End Time" align="center" prop="endTime" width="180" :min-width="getColumnWidth('End Time')">
            <template #default="scope">
              <span v-if="scope.row.endTime">{{ parseTime(scope.row.endTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="Operator User Name" align="center" prop="operatorUserName" :min-width="getColumnWidth('Operator User Name')" />
          <el-table-column label="Actions" align="center" fixed="right" class-name="action-column" v-if="!isViewFlag(form)" width="210">
            <template #default="scope">
              <el-button class="table-action-btn table-edit-btn" icon="EditPen" @click="handleEditStep(scope.row, scope.$index)">Edit</el-button>
              <el-button class="table-action-btn table-delete-btn" icon="Delete" @click="handleRemoveStep(scope.row)">Delete</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 添加或修改处理步骤对话框 -->
        <el-card v-show="stepDialog.visible" shadow="hover" class="mt-2">
          <template #header>
            <span>{{ stepDialog.title }}</span>
          </template>
          <el-form ref="processStepRunFormRef" :model="stepForm" :rules="stepRules" label-width="auto">
            <el-form-item label="Step Run ID" prop="stepRunId" v-if="stepDialogAction !== 'add'">
              <el-input v-model="stepForm.stepRunId" placeholder="Please input" disabled />
            </el-form-item>
            <el-form-item label="Step Name" prop="stepName">
              <el-input v-model="stepForm.stepName" placeholder="Please input" clearable />
            </el-form-item>
            <el-form-item label="Start Time" prop="startTime">
              <el-date-picker
                clearable
                v-model="stepForm.startTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="Please select"
                :disabled-date="stepStartDisabledDate"
              >
              </el-date-picker>
              <el-tooltip content="Start Time should be shorter than Production Batch Start Time." placement="top">
                <el-icon style="margin-left: 6px; color: #909399; cursor: help; font-size: 16px">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
            <el-form-item label="End Time" prop="endTime">
              <el-date-picker
                clearable
                v-model="stepForm.endTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="Please select"
                :disabled-date="stepEndDisabledDate"
              >
              </el-date-picker>
              <el-tooltip content="End Time should be shorter than Production Batch End Time." placement="top">
                <el-icon style="margin-left: 6px; color: #909399; cursor: help; font-size: 16px">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </el-form-item>
            <el-form-item label="Operator ID" prop="operatorId">
              <el-select v-model="stepForm.operatorId" placeholder="Please select" clearable filterable @change="handleOperatorChange">
                <el-option v-for="item in operatorIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-form>
          <div class="form-footer">
            <el-button @click="cancelStep">Cancel</el-button>
            <el-button :loading="stepButtonLoading" type="primary" @click="submitStepForm">Save</el-button>
          </div>
        </el-card>
      </el-form>
      <div class="form-footer" v-if="form.status">
        <el-button icon="SendPlane"
          :loading="buttonLoading"
          type="primary"
          @click="submitForm"
          v-if="
            (form.status == ProductionBatchStatus.Draft.toString() && form.productionBatchId) ||
            form.status == ProductionBatchStatus.NeedRevision.toString()
          "
          >Submit</el-button
        >
        <el-button @click="cancel" v-if="!isViewFlag(form)">Cancel</el-button>
        <el-button
          :loading="buttonLoading"
          type="primary"
          @click="saveForm"
          v-if="form.status == ProductionBatchStatus.Draft.toString() || form.status == ProductionBatchStatus.NeedRevision.toString()"
          >Save</el-button
        >
        <el-button @click="cancel" v-if="isViewFlag(form)">Close</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="ProductionBatchForm" lang="ts">
import { listAgroprocessor } from '@/api/demo/agroprocessor';
import { AgroprocessorVO } from '@/api/demo/agroprocessor/types';
import { ApprovalTaskClass } from '@/api/demo/approvalTask/ApprovalTaskClass';
import { listProcessorProduct } from '@/api/demo/processorProduct';
import { ProcessorProductVO } from '@/api/demo/processorProduct/types';
import { listProcessStepRuns } from '@/api/demo/processStepRuns';
import { getProductionBatch, saveProductionBatchWithSteps, updateProductionBatchWithSteps } from '@/api/demo/productionBatch';
import { ProductionBatchForm } from '@/api/demo/productionBatch/types';
import api from '@/api/system/user';
import {
  AgroprocessorStatus,
  BusinessType,
  PlanningAndProtocolTaskName,
  ProcessorProductStatus,
  ProductionBatchStatus
} from '@/enums/AgriculturalEnum';
import { QuestionFilled } from '@element-plus/icons-vue';
import { parseTime } from '@/utils/ruoyi';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const loading = ref(false);
const productionBatchFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const agroprocessorList = ref<AgroprocessorVO[]>([]);
const processorProductList = ref<ProcessorProductVO[]>([]);
const processStepRunList = ref<any[]>([]);
const operatorIdOptions = ref<{ label: string; value: string | number }[]>([]);

const isViewFlag = (data) => {
  return !(data.status == ProductionBatchStatus.Draft.toString() || data.status == ProductionBatchStatus.NeedRevision.toString());
};

const initFormData: ProductionBatchForm = {
  productionBatchId: undefined,
  processorId: undefined,
  productId: undefined,
  protocolVersion: undefined,
  startTime: undefined,
  endTime: undefined,
  status: ProductionBatchStatus.Draft.toString()
};

const form = ref<ProductionBatchForm>({ ...initFormData });

const rules = {
  processorId: [{ required: true, message: 'Processor Id cannot be empty', trigger: 'blur' }],
  productId: [{ required: true, message: 'Product Id cannot be empty', trigger: 'blur' }],
  protocolVersion: [{ required: false, message: 'Protocol Version cannot be empty', trigger: 'blur' }],
  startTime: [{ required: true, message: 'Start Time cannot be empty', trigger: 'change' }],
  endTime: [{ required: true, message: 'End Time cannot be empty', trigger: 'change' }]
};

const processorIdPopOptions = ref([]);
const processorIdPopLoading = ref(false);
const processorIdPopRemoteMethod = async (query: string) => {
  if (query) {
    processorIdPopLoading.value = true;
    const list = agroprocessorList.value
      .filter((f) => f.processorId.toString().toLowerCase().includes(query.toLowerCase()))
      .map((item) => item.processorId);
    processorIdPopOptions.value = list.map((item) => ({
      value: item,
      label: item
    }));
    processorIdPopLoading.value = false;
  } else {
    processorIdPopOptions.value = [];
  }
};

const productIdPopOptions = ref([]);
const productIdPopLoading = ref(false);

/** 按当前表单中的 processorId 拉取已审批的加工厂产品列表 */
const loadProcessorProductsByProcessorId = async (processorId: string | number | undefined) => {
  if (processorId === undefined || processorId === null || processorId === '') {
    processorProductList.value = [];
    return;
  }
  try {
    const res = await listProcessorProduct({
      processorId,
      status: ProcessorProductStatus.Approved.toString(),
      pageNum: null,
      pageSize: null
    } as any);
    processorProductList.value = res.rows || [];
  } catch (e) {
    console.error('loadProcessorProductsByProcessorId failed:', e);
    processorProductList.value = [];
  }
};

const handleProcessorIdChange = async (processorId: string | number | undefined) => {
  form.value.productId = undefined;
  productIdPopOptions.value = [];
  await loadProcessorProductsByProcessorId(processorId);
};

/** 下拉远程搜索：数据源为当前加工厂下的 processorProductList */
const productIdPopRemoteMethod = async (query: string) => {
  if (!form.value.processorId) {
    productIdPopOptions.value = [];
    return;
  }
  productIdPopLoading.value = true;
  try {
    const q = query.trim().toLowerCase();
    const list = processorProductList.value.filter((f) => {
      if (String(f.processorId) !== String(form.value.processorId)) return false;
      if (!q) return true;
      return String(f.productId).toLowerCase().includes(q);
    });
    productIdPopOptions.value = list.map((item) => ({
      value: item.productId,
      label: item.productId
    }));
  } finally {
    productIdPopLoading.value = false;
  }
};

/** 获取处理步骤列表 */
const getProcessStepRunList = async (productionBatchId: string | number) => {
  if (!productionBatchId) {
    processStepRunList.value = [];
    return;
  }
  try {
    const res = await listProcessStepRuns({
      productionBatchId,
      pageNum: 1,
      pageSize: 1000,
      orderByColumn: 'startTime',
      isAsc: 'asc'
    });
    processStepRunList.value = res.rows || [];
  } catch (error) {
    console.error('Failed to load process step runs:', error);
    processStepRunList.value = [];
  }
};

const stepDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const stepDialogAction = ref('');
const currentStepIndex = ref<number | null>(null);

const initStepFormData = {
  stepRunId: undefined,
  productionBatchId: undefined,
  stepName: undefined,
  startTime: undefined,
  endTime: undefined,
  operatorId: undefined,
  operatorUserName: undefined
};

const stepForm = ref({ ...initStepFormData });
const stepButtonLoading = ref(false);
const processStepRunFormRef = ref<ElFormInstance>();

const validateStepEndTime = (_rule: any, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    callback(new Error('End Time cannot be empty'));
    return;
  }
  if (!stepForm.value.startTime) {
    callback();
    return;
  }
  const start = new Date(stepForm.value.startTime).getTime();
  const end = new Date(value).getTime();
  if (end <= start) {
    callback(new Error('End Time must be greater than Start Time'));
    return;
  }
  callback();
};

const stepRules = {
  stepName: [{ required: true, message: 'Step Name cannot be empty', trigger: 'blur' }],
  startTime: [{ required: true, message: 'Start Time cannot be empty', trigger: 'change' }],
  endTime: [{ validator: validateStepEndTime, trigger: 'change' }],
  operatorId: [{ required: true, message: 'Operator ID cannot be empty', trigger: 'blur' }]
};

const stepStartDisabledDate = (time: Date) => {
  if (!form.value.startTime || !form.value.endTime) return false;
  const batchStart = new Date(form.value.startTime).setHours(0, 0, 0, 0);
  const batchEnd = new Date(form.value.endTime).setHours(23, 59, 59, 999);
  const current = new Date(time).getTime();
  return current < batchStart || current > batchEnd;
};

const stepEndDisabledDate = (time: Date) => {
  if (!form.value.startTime || !form.value.endTime) return false;
  const batchStart = new Date(form.value.startTime).setHours(0, 0, 0, 0);
  const batchEnd = new Date(form.value.endTime).setHours(23, 59, 59, 999);
  const current = new Date(time).getTime();
  return current < batchStart || current > batchEnd;
};

/** Operator 选择变化时，同步 operatorUserName，便于在表格中展示 */
const handleOperatorChange = (value: string | number) => {
  const item = operatorIdOptions.value.find((it) => it.value === value);
  stepForm.value.operatorUserName = item ? item.label : undefined;
};

/** 加载操作员下拉数据 */
const loadOperatorOptions = async () => {
  const { data } = await api.listUserNames();

  operatorIdOptions.value = data.map((item: any) => ({
    value: item.userId,
    label: item.nickName || item.userName || item.userId
  }));
};

/** 添加步骤按钮操作 */
const handleAddStep = () => {
  if (!form.value.startTime || !form.value.endTime) {
    proxy?.$modal.msgError('Please select Start Time and End Time');
    return;
  }
  resetStep();
  stepForm.value.productionBatchId = form.value.productionBatchId;
  stepDialog.visible = true;
  stepDialog.title = 'Add Process Step';
  stepDialogAction.value = 'add';
  currentStepIndex.value = null;
  loadOperatorOptions();
};

/** 步骤表单重置 */
const resetStep = () => {
  stepForm.value = { ...initStepFormData };
  processStepRunFormRef.value?.resetFields();
};

/** 取消步骤按钮 */
const cancelStep = () => {
  resetStep();
  stepDialog.visible = false;
};

/** 提交步骤表单 */
const submitStepForm = () => {
  processStepRunFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      stepButtonLoading.value = true;
      try {
        if (stepDialogAction.value === 'add') {
          // 新增 step：只更新列表，不保存到数据库（会在保存 batch 时一起保存）
          if (form.value.productionBatchId) {
            stepForm.value.productionBatchId = form.value.productionBatchId;
          }
          processStepRunList.value.push({ ...stepForm.value });
        } else if (stepDialogAction.value === 'edit') {
          // 编辑已有 step：只更新列表，不保存到数据库（会在保存 batch 时一起保存）
          if (currentStepIndex.value !== null && currentStepIndex.value >= 0) {
            processStepRunList.value[currentStepIndex.value] = { ...stepForm.value };
          } else if (stepForm.value.stepRunId) {
            const index = processStepRunList.value.findIndex((item) => item.stepRunId === stepForm.value.stepRunId);
            if (index !== -1) {
              processStepRunList.value[index] = { ...stepForm.value };
            }
          }
        }
        proxy?.$modal.msgSuccess('success');
        stepDialog.visible = false;
        resetStep();
      } finally {
        stepButtonLoading.value = false;
      }
    }
  });
};

/** 编辑步骤按钮操作 */
const handleEditStep = (row: any, index: number) => {
  resetStep();
  stepForm.value = { ...row };
  currentStepIndex.value = index;
  stepDialog.visible = true;
  stepDialog.title = 'Edit Process Step';
  stepDialogAction.value = 'edit';
  loadOperatorOptions();
};

/** 删除步骤按钮操作 */
const handleRemoveStep = async (row: any) => {
  await proxy?.$modal.confirm('Are you sure delete this step?').finally(() => (loading.value = false));
  // 从列表中移除
  processStepRunList.value = processStepRunList.value.filter((item) => item.stepRunId !== row.stepRunId);
  proxy?.$modal.msgSuccess('success');
};

/** Load record for add/edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    const res1 = await listAgroprocessor({ status: AgroprocessorStatus.Approved.toString(), pageNum: null, pageSize: null });
    agroprocessorList.value = res1.rows;
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getProductionBatch(id.value);
    Object.assign(form.value, res.data);
    await getProcessStepRunList(id.value);
    if (form.value.processorId) {
      await loadProcessorProductsByProcessorId(form.value.processorId);
    }
  } finally {
    pageLoading.value = false;
  }
};

/** Cancel Button */
const cancel = () => {
  router.push(listPath.value);
};

/** 保存按钮 */
const saveForm = () => {
  productionBatchFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      try {
        // 如果当前状态是 Submitted，保持 Submitted；否则设置为 Draft
        if (form.value.status !== ProductionBatchStatus.Submitted.toString()) {
          form.value.status = ProductionBatchStatus.Draft.toString();
        }

        const steps = (processStepRunList.value || []).map((step) => {
          const stepData = { ...step };
          return stepData;
        });

        if (!steps || steps.length === 0) {
          proxy?.$modal.msgError('Please add at least one process step before saving');
          buttonLoading.value = false;
          return;
        }

        const approvalTaskForm = new ApprovalTaskClass({
          businessKey: form.value.productionBatchId != null ? String(form.value.productionBatchId) : undefined,
          businessType: BusinessType.PlanningAndProtocol.toString(),
          taskName: PlanningAndProtocolTaskName.InitiatePlan.toString(),
          approvalStatus: ProductionBatchStatus.Draft.toString()
        });

        if (form.value.productionBatchId) {
          await updateProductionBatchWithSteps({
            productionBatch: form.value,
            processSteps: steps
          });
        } else {
          // 新增：同时保存 batch、steps 及审批任务（Draft）
          await saveProductionBatchWithSteps({
            productionBatch: form.value,
            processSteps: steps,
            approvalTaskForm
          });
        }

        proxy?.$modal.msgSuccess('success');
        router.push({ path: listPath.value, query: { refresh: '1' } });
      } finally {
        buttonLoading.value = false;
      }
    }
  });
};

/** 提交按钮 */
const submitForm = () => {
  productionBatchFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      try {
        const submittedStatus = ProductionBatchStatus.Submitted.toString();
        const submittedProductionBatch = {
          ...form.value,
          status: submittedStatus
        };

        const steps = (processStepRunList.value || []).map((step) => {
          const stepData = { ...step };
          return stepData;
        });

        if (!steps || steps.length === 0) {
          proxy?.$modal.msgError('Please add at least one process step before submitting');
          buttonLoading.value = false;
          return;
        }

        const approvalTaskForm = new ApprovalTaskClass({
          businessType: BusinessType.PlanningAndProtocol.toString(),
          taskName: PlanningAndProtocolTaskName.SubmitPlanForApproval.toString(),
          approvalStatus: submittedStatus,
          businessKey: form.value.productionBatchId != null ? String(form.value.productionBatchId) : undefined
        });
        const targetMessage = 'Step start time cannot be earlier than batch start time, step name: 1';

        if (form.value.productionBatchId) {
          // 编辑：同时更新 batch 和 steps
          try {
            await updateProductionBatchWithSteps({
              productionBatch: submittedProductionBatch,
              processSteps: steps,
              approvalTaskForm
            });
          } catch (error: any) {
            const status = error?.response?.status;
            const responseData = error?.response?.data ?? {};
            const errorCode = responseData?.code;
            const errorMsg = responseData?.msg;
            if (status === 500 && (errorCode === targetMessage || errorMsg === targetMessage)) {
              proxy?.$modal.msgError(targetMessage);
              return;
            }
            throw error;
          }
        } else {
          // 新增：同时保存 batch 和 steps
          await saveProductionBatchWithSteps({
            productionBatch: submittedProductionBatch,
            processSteps: steps,
            approvalTaskForm
          });
        }

        proxy?.$modal.msgSuccess('success');
        router.push({ path: listPath.value, query: { refresh: '1' } });
      } finally {
        buttonLoading.value = false;
      }
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
