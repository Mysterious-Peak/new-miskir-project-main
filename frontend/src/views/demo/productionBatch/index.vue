<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Production Batch Id" prop="productionBatchId">
              <el-select
                v-model="queryParams.productionBatchId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="productionBatchIdRemoteMethod"
                :loading="productionBatchIdLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in productionBatchIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Processor Id" prop="processorId">
              <el-select
                v-model="queryParams.processorId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="processorIdRemoteMethod"
                :loading="processorIdLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in processorIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Product Id" prop="productId">
              <el-select
                v-model="queryParams.productId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="productIdRemoteMethod"
                :loading="productIdLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in productIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>

            <el-form-item class="search-actions">
              <el-button type="primary" icon="Search" @click="handleQuery">Search</el-button>
              <el-button icon="Refresh" @click="resetQuery">Reset</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="18"><span class="table-page-title"><el-icon class="table-page-title-icon"><Tickets /></el-icon> {{ ($route.meta.title || "") + " List" }}</span></el-col>
          <el-col :span="1.5" style="margin-left: auto; margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" border stripe fit :data="productionBatchList" @selection-change="handleSelectionChange">
        <el-table-column
          label="Production Batch Id"
          align="center"
          prop="productionBatchId"
          v-if="true"
          :min-width="getColumnWidth('Production Batch Id')"
        />
        <el-table-column label="Processor Id" align="center" prop="processorId" :min-width="getColumnWidth('Processor Id')" />
        <el-table-column label="Product Id" align="center" prop="productId" :min-width="getColumnWidth('Product Id')" />
        <el-table-column label="Protocol Version" align="center" prop="protocolVersion" :min-width="getColumnWidth('Protocol Version')" />
        <el-table-column label="Start Time" align="center" prop="startTime" width="180" :min-width="getColumnWidth('Start Time')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="End Time" align="center" prop="endTime" width="180" :min-width="getColumnWidth('End Time')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')" width="120px">
          <template #default="scope">
            <el-tag>{{ ProductionBatchStatus[scope.row.status as ProductionBatchStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Created By" align="center" prop="createdUserName" :min-width="getColumnWidth('Created By')" />
        <el-table-column label="Create Date" align="center" prop="createTime" width="180" :min-width="getColumnWidth('Create Date')">
          <template #default="scope">
            <span v-if="isNew(scope.row.createTime)" class="font-black">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            <span v-else>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approved By" align="center" prop="approvedUserName" :min-width="getColumnWidth('Approved By')" />
        <el-table-column label="Approved Date" align="center" prop="approvedAt" width="180" :min-width="getColumnWidth('Approved Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.approvedAt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approval Comment" align="center" prop="approvedComment" width="180" :min-width="getColumnWidth('Approval Comment')" />
        <el-table-column label="Action" align="center" fixed="right" class-name="action-column" :width="mainActionColumnWidth">
          <template #default="scope">
            <el-button class="table-action-btn table-check-btn" icon="Document" @click="handleViewApprovalTask(scope.row)">Log</el-button>
            <el-button v-if="isViewFlag(scope.row)" class="table-action-btn table-check-btn" icon="View" @click="handleView(scope.row)"
              >View</el-button
            >
            <template v-else>
              <el-button class="table-action-btn table-edit-btn" icon="EditPen" @click="handleUpdate(scope.row)">Edit</el-button>
              <el-button class="table-action-btn table-delete-btn" icon="Delete" @click="handleDelete(scope.row)">Delete</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改生产批次对话框 -->
    <!-- 添加或修改处理步骤对话框 -->

    <!-- 查看审批任务对话框（时间线） -->
    <ApprovalTaskDialog v-model:visible="approvalTaskDialog.visible" :loading="approvalTaskDialog.loading" :tasks="approvalTaskList" />
  </div>
</template>

<script setup name="ProductionBatch" lang="ts">
import { listAgroprocessor } from '@/api/demo/agroprocessor';
import { AgroprocessorVO } from '@/api/demo/agroprocessor/types';
import { listApprovalTask } from '@/api/demo/approvalTask';
import { ApprovalTaskClass } from '@/api/demo/approvalTask/ApprovalTaskClass';
import type { ApprovalTaskVO } from '@/api/demo/approvalTask/types';
import { listProcessorProduct } from '@/api/demo/processorProduct';
import { ProcessorProductVO } from '@/api/demo/processorProduct/types';
import { listProcessStepRuns } from '@/api/demo/processStepRuns';
import {
  delProductionBatch,
  getProductionBatch,
  listProductionBatch,
  saveProductionBatchWithSteps,
  updateProductionBatchWithSteps
} from '@/api/demo/productionBatch';
import { ProductionBatchForm, ProductionBatchQuery, ProductionBatchVO } from '@/api/demo/productionBatch/types';
import api from '@/api/system/user';
import {
  AgroprocessorStatus,
  BusinessType,
  PlanningAndProtocolTaskName,
  ProcessorProductStatus,
  ProductionBatchStatus
} from '@/enums/AgriculturalEnum';
import { QuestionFilled } from '@element-plus/icons-vue';
import { isNew } from '@/utils/FarmTools';
import { parseTime } from '@/utils/ruoyi';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const productionBatchList = ref<ProductionBatchVO[]>([]);
const productionBatchAllList = ref<ProductionBatchVO[]>([]);
const agroprocessorList = ref<AgroprocessorVO[]>([]);
const processorProductList = ref<ProcessorProductVO[]>([]);
const processStepRunList = ref<any[]>([]);
const operatorIdOptions = ref<{ label: string; value: string | number }[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const mainActionColumnWidth = computed(() => {
  const hasThreeButtons = productionBatchList.value.some((row) => !isViewFlag(row));
  return hasThreeButtons ? 300 : 210;
});

const queryFormRef = ref<ElFormInstance>();
const productionBatchFormRef = ref<ElFormInstance>();
const processStepRunFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const stepDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const approvalTaskList = ref<ApprovalTaskVO[]>([]);
const approvalTaskDialog = reactive<{ visible: boolean; loading: boolean }>({
  visible: false,
  loading: false
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

const initFormData: ProductionBatchForm = {
  productionBatchId: undefined,
  processorId: undefined,
  productId: undefined,
  protocolVersion: undefined,
  startTime: undefined,
  endTime: undefined,
  status: ProductionBatchStatus.Draft.toString()
};
const data = reactive<PageData<ProductionBatchForm, ProductionBatchQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    productionBatchId: undefined,
    processorId: undefined,
    productId: undefined,
    protocolVersion: undefined,
    startTime: undefined,
    endTime: undefined,
    status: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    processorId: [{ required: true, message: 'Processor Id cannot be empty', trigger: 'blur' }],
    productId: [{ required: true, message: 'Product Id cannot be empty', trigger: 'blur' }],
    protocolVersion: [{ required: false, message: 'Protocol Version cannot be empty', trigger: 'blur' }],
    startTime: [{ required: true, message: 'Start Time cannot be empty', trigger: 'change' }],
    endTime: [{ required: true, message: 'End Time cannot be empty', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const productionBatchIdOptions = ref([]);
const productionBatchIdList = ref([]);
const productionBatchIdLoading = ref(false);
const productionBatchIdRemoteMethod = async (query: string) => {
  if (query) {
    productionBatchIdList.value = productionBatchAllList.value
      .filter((f) => f.productionBatchId.toString().toLowerCase().includes(query.toLowerCase()))
      .map((item) => item.productionBatchId);
    productionBatchIdLoading.value = true;
    productionBatchIdOptions.value = productionBatchIdList.value.map((item) => ({
      value: item,
      label: item
    }));
    productionBatchIdLoading.value = false;
  } else {
    productionBatchIdOptions.value = [];
  }
};

const processorIdOptions = ref([]);
const processorIdList = ref([]);
const processorIdLoading = ref(false);
const processorIdRemoteMethod = async (query: string) => {
  if (query) {
    processorIdList.value = [
      ...new Set(
        productionBatchAllList.value
          .filter((f) => f.processorId.toString().toLowerCase().includes(query.toLowerCase()))
          .map((item) => item.processorId)
      )
    ];
    processorIdLoading.value = true;
    processorIdOptions.value = processorIdList.value.map((item) => ({
      value: item,
      label: item
    }));
    processorIdLoading.value = false;
  } else {
    processorIdOptions.value = [];
  }
};

const productIdOptions = ref([]);
const productIdList = ref([]);
const productIdLoading = ref(false);
const productIdRemoteMethod = async (query: string) => {
  if (query) {
    productIdList.value = [
      ...new Set(
        productionBatchAllList.value.filter((f) => f.productId.toString().toLowerCase().includes(query.toLowerCase())).map((item) => item.productId)
      )
    ];
    productIdLoading.value = true;
    productIdOptions.value = productIdList.value.map((item) => ({
      value: item,
      label: item
    }));
    productIdLoading.value = false;
  } else {
    productIdOptions.value = [];
  }
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

/** 查询生产批次列表 */
const getList = async () => {
  loading.value = true;
  const res = await listProductionBatch(queryParams.value);
  productionBatchList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 查询生产批次列表 */
const getAllList = async () => {
  loading.value = true;
  const res = await listProductionBatch();
  productionBatchAllList.value = res.rows;
  loading.value = false;
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  productionBatchFormRef.value?.resetFields();
  processStepRunList.value = [];
  processorProductList.value = [];
  productIdPopOptions.value = [];
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: ProductionBatchVO[]) => {
  ids.value = selection.map((item) => item.productionBatchId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

const dialogAction = ref('');

const isShow = computed(() => {
  return dialogAction.value !== 'add';
});

/** 新增按钮操作 */
const handleAdd = () => {
  router.push({ name: 'ProductionBatchAdd' });
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

/** 查看按钮操作 */
const handleView = (row?: ProductionBatchVO) => {
  const _productionBatchId = row?.productionBatchId || ids.value[0];
  router.push({ name: 'ProductionBatchDetail', params: { id: _productionBatchId } });
};

/** 查看审批任务 */
const handleViewApprovalTask = async (row: ProductionBatchVO) => {
  const businessKey = String(row?.productionBatchId ?? '');
  if (!businessKey) return;
  approvalTaskDialog.loading = true;
  approvalTaskDialog.visible = true;
  try {
    const res = await listApprovalTask({
      businessKey,
      pageNum: 1,
      pageSize: 100,
      orderByColumn: 'operateTime',
      isAsc: 'desc'
    });
    approvalTaskList.value = (res as any)?.rows ?? (Array.isArray(res) ? res : []);
  } catch (e) {
    console.error('listApprovalTask error:', e);
    approvalTaskList.value = [];
    proxy?.$modal.msgError('Failed to load Actions Log');
  } finally {
    approvalTaskDialog.loading = false;
  }
};

/** 修改按钮操作 */
const handleUpdate = (row?: ProductionBatchVO) => {
  const _productionBatchId = row?.productionBatchId || ids.value[0];
  router.push({ name: 'ProductionBatchEdit', params: { id: _productionBatchId } });
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
        dialog.visible = false;
        await getList();
        await getAllList();
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
        dialog.visible = false;
        await getList();
        await getAllList();
      } finally {
        buttonLoading.value = false;
      }
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: ProductionBatchVO) => {
  const _productionBatchIds = row?.productionBatchId || ids.value;
  await proxy?.$modal.confirm('Are you sure delete this data?').finally(() => (loading.value = false));
  await delProductionBatch(_productionBatchIds);
  proxy?.$modal.msgSuccess('success');
  await getList();
  await getAllList();
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

onMounted(() => {
  getList();
  getAllList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});

const isViewFlag = (data) => {
  return !(data.status == ProductionBatchStatus.Draft.toString() || data.status == ProductionBatchStatus.NeedRevision.toString());
};
</script>
