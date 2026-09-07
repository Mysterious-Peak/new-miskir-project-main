<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Shipment ID" prop="shipmentId">
              <el-select
                v-model="queryParams.shipmentId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="shipmentIdRemoteMethod"
                :loading="shipmentIdLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in shipmentIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Source entity" prop="sourceEntity">
              <el-input prefix-icon="Search" v-model="queryParams.sourceEntity" placeholder="Please enter Source entity" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Destination entity" prop="destinationEntity">
              <el-input v-model="queryParams.destinationEntity" placeholder="Please enter Destination entity" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!-- <el-form-item label="Planned dispatch time" prop="plannedDispatch">
              <el-date-picker
                clearable
                v-model="queryParams.plannedDispatch"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Please select Planned dispatch time"
              />
            </el-form-item> -->
            <!-- <el-form-item label="Delivery deadline" prop="deliveryDeadline">
              <el-date-picker
                clearable
                v-model="queryParams.deliveryDeadline"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Please select Delivery deadline"
              />
            </el-form-item>
            <el-form-item label="Logistics supervisor user ID" prop="approvedBy">
              <el-input v-model="queryParams.approvedBy" placeholder="Please enter Logistics supervisor user ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Approval Comment" prop="approvedComment">
              <el-input v-model="queryParams.approvedComment" placeholder="Please enter Approval Comment" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Approval date" prop="approvedAt">
              <el-date-picker clearable v-model="queryParams.approvedAt" type="date" value-format="YYYY-MM-DD" placeholder="Please select Approval date" />
            </el-form-item> -->
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
          <!-- <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:shipmentOrder:add']">Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['demo:shipmentOrder:edit']"
              >Edit</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['demo:shipmentOrder:remove']"
              >Delete</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['demo:shipmentOrder:export']">Export</el-button>
          </el-col> -->
        </el-row>
      </template>

      <el-table v-loading="loading" :data="shipmentOrderList" @selection-change="handleSelectionChange" stripe fit border>
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column label="Shipment ID" align="center" prop="shipmentId" v-if="true" :min-width="getColumnWidth('Shipment ID')" />
        <el-table-column label="Batch Type" align="center" prop="batchType" width="140px" :min-width="getColumnWidth('Batch Type')">
          <template #default="scope">
            <dict-tag :options="batch_type" :value="scope.row.batchType" />
          </template>
        </el-table-column>
        <el-table-column label="Source entity" align="center" prop="sourceEntity" :min-width="getColumnWidth('Source entity')" />
        <el-table-column label="Destination entity" align="center" prop="destinationEntity" :min-width="getColumnWidth('Destination entity')" />
        <el-table-column label="Planned dispatch time" align="center" prop="plannedDispatch" :min-width="getColumnWidth('Planned dispatch time')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.plannedDispatch, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Delivery deadline" align="center" prop="deliveryDeadline" :min-width="getColumnWidth('Delivery deadline')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.deliveryDeadline, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column
          label="Logistics supervisor user ID"
          align="center"
          prop="approvedBy"
          :min-width="getColumnWidth('Logistics supervisor user ID')"
        /> -->
        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')">
          <template #default="scope">
            <el-tag>{{ ShipmentOrderStatus[scope.row.status as ShipmentOrderStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Created By" align="center" prop="createdUserName" :min-width="getColumnWidth('Created By')" />
        <el-table-column label="Create Date" align="center" prop="createTime" :min-width="getColumnWidth('Create Date')">
          <template #default="scope">
            <span v-if="isNew(scope.row.createTime)" class="font-black">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            <span v-else>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approved By" align="center" prop="approvedUserName" :min-width="getColumnWidth('Approved By')" />
        <el-table-column label="Approval date" align="center" prop="approvedAt" :min-width="getColumnWidth('Approval date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.approvedAt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approval Comment" align="center" prop="approvedComment" :min-width="getColumnWidth('Approval Comment')" />
        <el-table-column label="Action" align="center" fixed="right" class-name="action-column" width="110">
          <template #default="scope">
            <el-button
              v-if="isViewFlag(scope.row)"
              class="table-action-btn table-check-btn"
              icon="View"
              @click="router.push({ name: 'ShipmentOrderApprovalDetail', params: { id: scope.row.shipmentId } })"
              >View</el-button
            >
            <el-button
              v-if="!isViewFlag(scope.row)"
              class="table-action-btn table-edit-btn"
              icon="EditPen"
              @click="router.push({ name: 'ShipmentOrderApprovalApprove', params: { id: scope.row.shipmentId } })"
              v-hasPermi="['demo:shipmentOrder:edit']"
              >Edit</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or Edit Shipment Order Dialog -->
  </div>
</template>

<script setup name="ShipmentOrder" lang="ts">
import {
  listShipmentOrder,
  autoCompleteShipmentId,
  getShipmentOrder,
  delShipmentOrder,
  addShipmentOrder,
  updateShipmentOrder
} from '@/api/demo/shipmentOrder';
import { ShipmentOrderVO, ShipmentOrderQuery, ShipmentOrderForm } from '@/api/demo/shipmentOrder/types';
import { getColumnWidth } from '@/utils/utils';
import { ShipmentOrderStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { batch_type } = toRefs<any>(proxy?.useDict('batch_type'));

const shipmentOrderList = ref<ShipmentOrderVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const shipmentOrderFormRef = ref<ElFormInstance>();

const shipmentIdOptions = ref<Array<{ value: string | number; label: string }>>([]);
const shipmentIdList = ref<any[]>([]);
const shipmentIdLoading = ref(false);
const shipmentIdRemoteMethod = async (query: string) => {
  if (query) {
    shipmentIdLoading.value = true;
    try {
      const res = await autoCompleteShipmentId({
        shipmentId: query?.trim(),
        pageNum: null,
        pageSize: null
      } as any);
      shipmentIdList.value = (res as any).data || (res as any).rows || [];
      shipmentIdOptions.value = shipmentIdList.value.map((item: any) => ({
        value: item.shipmentId,
        label: item.shipmentId
      }));
    } catch (e) {
      console.error('autoCompleteShipmentId failed:', e);
      shipmentIdList.value = [];
      shipmentIdOptions.value = [];
    } finally {
      shipmentIdLoading.value = false;
    }
  } else {
    shipmentIdOptions.value = [];
  }
};

// Shipment batch link table in dialog
const shipmentBatchLinks = ref<any[]>([]);
const shipmentBatchLoading = ref(false);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ShipmentOrderForm = {
  shipmentId: undefined,
  providerId: undefined,
  sourceEntity: undefined,
  destinationEntity: undefined,
  plannedDispatch: undefined,
  deliveryDeadline: undefined,
  batchType: undefined,
  status: undefined,
  approvedBy: undefined,
  approvedComment: undefined,
  approvedAt: undefined
};
const data = reactive<PageData<ShipmentOrderForm, ShipmentOrderQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    shipmentId: undefined,
    sourceEntity: undefined,
    destinationEntity: undefined,
    plannedDispatch: undefined,
    deliveryDeadline: undefined,
    status: undefined,
    approvedBy: undefined,
    approvedComment: undefined,
    approvedAt: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    shipmentId: [{ required: true, message: 'Unique shipment identifier cannot be empty', trigger: 'blur' }],
    status: [{ required: true, message: 'Created=0,Planned=1,In-Transit=2,Delivered=3 cannot be empty', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query Shipment Order List */
const getList = async () => {
  loading.value = true;
  try {
    const uiPageNum = queryParams.value.pageNum || 1;
    const uiPageSize = queryParams.value.pageSize || 10;
    const selectedShipmentId = queryParams.value.shipmentId?.toString().trim();

    if (selectedShipmentId) {
      const res = await listShipmentOrder({
        ...queryParams.value,
        pageNum: 1,
        pageSize: Math.max(uiPageSize, 2000)
      });
      const rows = res.rows || [];
      const matchedRows = rows.filter((item: any) => String(item.shipmentId ?? '') === selectedShipmentId);

      total.value = matchedRows.length;
      const start = (uiPageNum - 1) * uiPageSize;
      const end = start + uiPageSize;
      shipmentOrderList.value = matchedRows.slice(start, end);
      return;
    }

    const res = await listShipmentOrder(queryParams.value);
    shipmentOrderList.value = res.rows;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
};

/** Cancel Button */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** Form Reset */
const reset = () => {
  form.value = { ...initFormData };
  shipmentOrderFormRef.value?.resetFields();
  shipmentBatchLinks.value = [];
};

/** Search Button Action */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** Reset Button Action */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** Multi-select Selected Data */
const handleSelectionChange = (selection: ShipmentOrderVO[]) => {
  ids.value = selection.map((item) => item.shipmentId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** Add Button Action */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = 'Add Shipment Order';
};

/** Edit Button Action */
const handleUpdate = async (row?: ShipmentOrderVO) => {
  reset();
  const _shipmentId = row?.shipmentId || ids.value[0];
  const res = await getShipmentOrder(_shipmentId);
  const orderData = res.data as any;
  Object.assign(form.value, orderData);
  // 填充批次链接数据
  // 处理不同的数据结构：可能是 batchLinks 数组，或者直接是批次链接数组
  let batchLinksData: any[] = [];
  if (orderData.batchLinks && Array.isArray(orderData.batchLinks)) {
    batchLinksData = orderData.batchLinks;
  } else if (Array.isArray(orderData) && orderData.length > 0 && orderData[0].finishedBatchId) {
    // 如果返回的直接是批次链接数组
    batchLinksData = orderData;
  }
  if (batchLinksData.length > 0) {
    shipmentBatchLinks.value = batchLinksData.map((link: any) => ({
      shipmentBatchLinkId: link.shipmentBatchLinkId || '',
      shipmentId: link.shipmentId || form.value.shipmentId || '',
      finishedBatchId: link.finishedBatchId || '',
      quantity: link.quantity || ''
    }));
  }
  dialog.visible = true;
  dialog.title = isViewFlag(orderData) ? 'View Shipment Order' : 'Edit Shipment Order';
};

/** 从 Created -> Planned */
const toPlannedForm = () => {
  shipmentOrderFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = ShipmentOrderStatus.Planned.toString();
      if (form.value.shipmentId) {
        await updateShipmentOrder(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 从 Planned -> Assigned */
const toAssignedForm = () => {
  shipmentOrderFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = ShipmentOrderStatus.Assigned.toString();
      if (form.value.shipmentId) {
        await updateShipmentOrder(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 从 Assigned -> In-Transit */
const toInTransitForm = () => {
  shipmentOrderFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = ShipmentOrderStatus.InTransit.toString();
      if (form.value.shipmentId) {
        await updateShipmentOrder(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 从 Created -> Rejected */
const rejectStatusForm = () => {
  shipmentOrderFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = ShipmentOrderStatus.Rejected.toString();
      if (form.value.shipmentId) {
        await updateShipmentOrder(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

/** Export Button Action */
const handleExport = () => {
  proxy?.download(
    'demo/shipmentOrder/export',
    {
      ...queryParams.value
    },
    `shipmentOrder_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});

/** 仅 Created 可编辑（Editor）；其余状态只读 Check。无 status 时沿用可编辑（表单初始态） */
const isViewFlag = (data: { status?: string | number }) => {
  if (!data || data.status === undefined || data.status === null) return false;
  return data.status.toString() !== ShipmentOrderStatus.Created.toString();
};
</script>

<style>
/* Popup: entity inputs use full content width */
.shipment-order-dialog-form :deep(.el-form-item__content) {
  min-width: 0;
}
.shipment-order-dialog-form .entity-field-input {
  width: 100%;
}
</style>
