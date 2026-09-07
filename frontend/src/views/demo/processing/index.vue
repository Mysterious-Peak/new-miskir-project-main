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
      <!-- <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="18"><span class="table-page-title"><el-icon class="table-page-title-icon"><Tickets /></el-icon> {{ ($route.meta.title || "") + " List" }}</span></el-col>
          <el-col :span="1.5" style="margin-left: auto; margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
          </el-col>
        </el-row>
      </template> -->
      <template #header>
        <el-row :gutter="10" class="mb8">
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
            <el-button v-if="!isViewFlag(scope.row)" class="table-action-btn table-check-btn" icon="View" @click="handleUpdate(scope.row)"
              >View</el-button
            >
            <el-button v-if="isViewFlag(scope.row)" class="table-action-btn table-edit-btn" icon="EditPen" @click="handleUpdate(scope.row)"
              >Edit</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 查看审批任务对话框（时间线） -->
    <ApprovalTaskDialog v-model:visible="approvalTaskDialog.visible" :loading="approvalTaskDialog.loading" :tasks="approvalTaskList" />
  </div>
</template>

<script setup name="ProductionBatch" lang="ts">
import { listApprovalTask } from '@/api/demo/approvalTask';
import type { ApprovalTaskVO } from '@/api/demo/approvalTask/types';
import { listProductionBatch } from '@/api/demo/productionBatch';
import { ProductionBatchQuery, ProductionBatchVO } from '@/api/demo/productionBatch/types';
import { ProductionBatchStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import { parseTime } from '@/utils/ruoyi';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const productionBatchList = ref<ProductionBatchVO[]>([]);
const productionBatchAllList = ref<ProductionBatchVO[]>([]);
const approvalTaskList = ref<ApprovalTaskVO[]>([]);
const approvalTaskDialog = reactive<{ visible: boolean; loading: boolean }>({
  visible: false,
  loading: false
});
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();

const queryParams = ref<ProductionBatchQuery>({
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
});

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
const handleUpdate = async (row?: ProductionBatchVO) => {
  proxy.$tab.closePage(proxy.$route);
  proxy.$router.push({
    path: `processingOperations`,
    query: {
      productionBatchId: row?.productionBatchId || ids.value[0]
    }
  });
};

onMounted(() => {
  getList();
  getAllList();
});

const isViewFlag = (data: { status?: string | number }) => {
  if (!data || data.status === undefined || data.status === null) return false;
  const status = data.status.toString();
  return status === ProductionBatchStatus.Planned.toString() || status === ProductionBatchStatus.Running.toString();
};
</script>
