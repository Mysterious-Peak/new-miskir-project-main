<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- 添加或修改生产批次对话框 -->
      <el-form ref="productionBatchFormRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="Production Batch Id" prop="productionBatchId" v-show="!isAdd">
          <el-input v-model="form.productionBatchId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Processor Id" prop="processorId">
          <el-input v-model="form.processorId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Product Id" prop="productId">
          <el-input v-model="form.productId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Protocol Version" prop="protocolVersion">
          <el-input v-model="form.protocolVersion" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Start Time" prop="startTime">
          <el-date-picker clearable v-model="form.startTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="End Time" prop="endTime">
          <el-date-picker clearable v-model="form.endTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Created By" prop="createdUserName">
          <el-input v-model="form.createdUserName" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Creation Date" prop="createTime">
          <el-date-picker clearable v-model="form.createTime" type="date" value-format="YYYY-MM-DD" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Approved By" prop="approvedUserName">
          <el-input v-model="form.approvedUserName" placeholder="Please input Approved By" disabled />
        </el-form-item>
        <el-form-item label="Approved Date" prop="approvedAt">
          <el-date-picker clearable v-model="form.approvedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment">
          <el-input
            v-model="form.approvedComment"
            type="textarea"
            placeholder="Please input"
            :disabled="form.status != ProductionBatchStatus.Submitted.toString()"
          />
        </el-form-item>
        <el-form-item prop="processSteps">
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
          </el-table>
        </el-form-item>
      </el-form>
      <div class="form-footer" v-if="form.status && form.status == ProductionBatchStatus.Submitted.toString()">
        <el-button :loading="buttonLoading" style="width: fit-content !important" type="primary" @click="submitForm"
          >Planning & Protocol Approval</el-button
        >
        <el-button :loading="buttonLoading" type="warning" @click="rejectForm">Reject</el-button>
        <el-button :loading="buttonLoading" type="warning" @click="revisionForm">Need Revision</el-button>
        <el-button @click="cancel">Cancel</el-button>
      </div>
      <div class="form-footer" v-if="form.status && form.status != ProductionBatchStatus.Submitted.toString()">
        <el-button @click="cancel">Close</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="ProductionBatchApprovalForm" lang="ts">
import { ApprovalTaskClass } from '@/api/demo/approvalTask/ApprovalTaskClass';
import { listProcessStepRuns } from '@/api/demo/processStepRuns';
import { getProductionBatch, updateProductionBatch } from '@/api/demo/productionBatch';
import { ProductionBatchForm } from '@/api/demo/productionBatch/types';
import { ApprovalStatus, BusinessType, PlanningAndProtocolTaskName, ProductionBatchStatus } from '@/enums/AgriculturalEnum';
import { parseTime } from '@/utils/ruoyi';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const productionBatchFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isApprove = computed(() => route.path.endsWith('/approve') || route.path.includes('/approve/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const processStepRunList = ref([]);

const initFormData: ProductionBatchForm = {
  productionBatchId: undefined,
  processorId: undefined,
  productId: undefined,
  protocolVersion: undefined,
  startTime: undefined,
  endTime: undefined,
  status: undefined
};

const form = ref<ProductionBatchForm>({ ...initFormData });

const rules = {};

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

/** Load record for approve/detail mode */
const loadRecord = async () => {
  if (!id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getProductionBatch(id.value);
    Object.assign(form.value, res.data);
    await getProcessStepRunList(id.value);
  } finally {
    pageLoading.value = false;
  }
};

/** Cancel Button */
const cancel = () => {
  router.push(listPath.value);
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
        router.push({ path: listPath.value, query: { refresh: '1' } });
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
      router.push({ path: listPath.value, query: { refresh: '1' } });
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
      router.push({ path: listPath.value, query: { refresh: '1' } });
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
