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
        <el-table-column label="Action" align="center" fixed="right" class-name="action-column" width="210">
          <template #default="scope">
            <el-button class="table-action-btn table-check-btn" icon="Document" @click="handleViewApprovalTask(scope.row)">Log</el-button>
            <el-button
              v-if="scope.row.status != ProductionBatchStatus.Submitted.toString()"
              class="table-action-btn table-check-btn"
              icon="View"
              @click="handleView(scope.row)"
              >View</el-button
            >
            <el-button
              v-if="scope.row.status == ProductionBatchStatus.Submitted.toString()"
              class="table-action-btn table-edit-btn"
              icon="EditPen"
              @click="handleUpdate(scope.row)"
              >Edit</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改生产批次对话框 -->

    <!-- 查看审批任务对话框（时间线） -->
    <ApprovalTaskDialog v-model:visible="approvalTaskDialog.visible" :loading="approvalTaskDialog.loading" :tasks="approvalTaskList" />
  </div>
</template>

<script setup name="ProductionBatchApproval" lang="ts">
import { listApprovalTask } from '@/api/demo/approvalTask';
import { ApprovalTaskClass } from '@/api/demo/approvalTask/ApprovalTaskClass';
import type { ApprovalTaskVO } from '@/api/demo/approvalTask/types';
import { listProcessStepRuns } from '@/api/demo/processStepRuns';
import { getProductionBatch, listProductionBatch, updateProductionBatch } from '@/api/demo/productionBatch';
import { ProductionBatchForm, ProductionBatchQuery, ProductionBatchVO } from '@/api/demo/productionBatch/types';
import { ApprovalStatus, BusinessType, PlanningAndProtocolTaskName, ProductionBatchStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import { parseTime } from '@/utils/ruoyi';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const productionBatchList = ref<ProductionBatchVO[]>([]);
const productionBatchAllList = ref<ProductionBatchVO[]>([]);
const processStepRunList = ref([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const productionBatchFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const approvalTaskList = ref<ApprovalTaskVO[]>([]);
const approvalTaskDialog = reactive<{ visible: boolean; loading: boolean }>({
  visible: false,
  loading: false
});

const initFormData: ProductionBatchForm = {
  productionBatchId: undefined,
  processorId: undefined,
  productId: undefined,
  protocolVersion: undefined,
  startTime: undefined,
  endTime: undefined,
  status: undefined
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
  rules: {}
});

const { queryParams, form, rules } = toRefs(data);

const productionBatchIdOptions = ref([]);
const productionBatchIdList = ref([]);
const productionBatchIdLoading = ref(false);
const productionBatchIdRemoteMethod = async (query: string) => {
  if (query) {
    productionBatchIdLoading.value = true;
    productionBatchIdList.value = productionBatchAllList.value
      .filter((f) => f.productionBatchId.toString().toLowerCase().includes(query.toLowerCase()))
      .map((item) => item.productionBatchId);
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
    processorIdLoading.value = true;
    processorIdList.value = [
      ...new Set(
        productionBatchAllList.value
          .filter((f) => f.processorId.toString().toLowerCase().includes(query.toLowerCase()))
          .map((item) => item.processorId)
      )
    ];
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
    productIdLoading.value = true;
    productIdList.value = [
      ...new Set(
        productionBatchAllList.value.filter((f) => f.productId.toString().toLowerCase().includes(query.toLowerCase())).map((item) => item.productId)
      )
    ];
    productIdOptions.value = productIdList.value.map((item) => ({
      value: item,
      label: item
    }));
    productIdLoading.value = false;
  } else {
    productIdOptions.value = [];
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
  processStepRunList.value = [];
  productionBatchFormRef.value?.resetFields();
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
      pageSize: 1000
    });
    processStepRunList.value = res.rows || [];
  } catch (error) {
    console.error('Failed to load process step runs:', error);
    processStepRunList.value = [];
  }
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

/** 查看按钮操作 */
const handleView = (row?: ProductionBatchVO) => {
  const _productionBatchId = row?.productionBatchId || ids.value[0];
  router.push({ name: 'ProductionBatchApprovalDetail', params: { id: _productionBatchId } });
};

/** 修改按钮操作 */
const handleUpdate = (row?: ProductionBatchVO) => {
  const _productionBatchId = row?.productionBatchId || ids.value[0];
  router.push({ name: 'ProductionBatchApprovalApprove', params: { id: _productionBatchId } });
};

/** 提交按钮 */
const submitForm = () => {
  productionBatchFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      try {
        form.value.status = ProductionBatchStatus.Planned.toString();
        if (form.value.productionBatchId) {
          const approvalTaskForm = new ApprovalTaskClass({
            businessKey: form.value.productionBatchId != null ? String(form.value.productionBatchId) : undefined,
            businessType: BusinessType.PlanningAndProtocol.toString(),
            taskName: PlanningAndProtocolTaskName.ApprovePlan.toString(),
            approvalStatus: ProductionBatchStatus.Planned.toString(),
            comments: form.value.approvedComment,
            commentsShowFlg: 1
          });
          await updateProductionBatch({ ...form.value, approvalTaskForm }).finally(() => (buttonLoading.value = false));
        }
        proxy?.$modal.msgSuccess('success');
        dialog.visible = false;
        await getList();
      } finally {
        buttonLoading.value = false;
      }
    }
  });
};

const rejectForm = () => {
  productionBatchFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ProductionBatchStatus.Rejected.toString();

      if (form.value.productionBatchId) {
        const approvalTaskForm = new ApprovalTaskClass({
          businessKey: form.value.productionBatchId != null ? String(form.value.productionBatchId) : undefined,
          businessType: BusinessType.PlanningAndProtocol.toString(),
          taskName: PlanningAndProtocolTaskName.RejectPlan.toString(),
          approvalStatus: ApprovalStatus.Rejected.toString(),
          comments: form.value.approvedComment,
          commentsShowFlg: 1
        });
        await updateProductionBatch({ ...form.value, approvalTaskForm }).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      dialog.visible = false;
      await getList();
    }
  });
};

const revisionForm = () => {
  productionBatchFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ProductionBatchStatus.NeedRevision.toString();

      if (form.value.productionBatchId) {
        const approvalTaskForm = new ApprovalTaskClass({
          businessKey: form.value.productionBatchId != null ? String(form.value.productionBatchId) : undefined,
          businessType: BusinessType.PlanningAndProtocol.toString(),
          taskName: PlanningAndProtocolTaskName.RequestPlanRevisions.toString(),
          approvalStatus: ApprovalStatus.NeedRevision.toString(),
          comments: form.value.approvedComment,
          commentsShowFlg: 1
        });
        await updateProductionBatch({ ...form.value, approvalTaskForm }).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      dialog.visible = false;
      await getList();
    }
  });
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
</script>
