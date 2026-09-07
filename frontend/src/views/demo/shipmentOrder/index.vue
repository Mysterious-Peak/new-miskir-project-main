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
          <el-col :span="1.5" style="margin-left: auto; margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:shipmentOrder:add']">Add</el-button>
          </el-col>
          <!-- <el-col :span="1.5">
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
        <el-table-column label="Action" align="center" fixed="right" class-name="action-column" :width="actionColumnWidth">
          <template #default="scope">
            <el-button v-if="isViewFlag(scope.row)" class="table-action-btn table-check-btn" icon="View" @click="handleUpdate(scope.row)"
              >View</el-button
            >
            <template v-else>
              <el-button
                class="table-action-btn table-edit-btn"
                icon="EditPen"
                @click="handleUpdate(scope.row)"
                v-hasPermi="['demo:shipmentOrder:edit']"
                >Edit</el-button
              >
              <el-button
                class="table-action-btn table-delete-btn"
                icon="Delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['demo:shipmentOrder:remove']"
                >Delete</el-button
              >
            </template>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="ShipmentOrder" lang="ts">
import {
  listShipmentOrder,
  autoCompleteShipmentId,
  getShipmentOrder,
  delShipmentOrder,
  updateShipmentOrder,
  createShipmentOrderWithBatch,
  addShipmentOrderBatchLink,
  delShipmentOrderBatchLink,
  updateShipmentOrderBatchLink
} from '@/api/demo/shipmentOrder';
import { listFinishedGoodsBatch } from '@/api/demo/finishedGoodsBatch';
import { listPostharvestBatch } from '@/api/demo/postharvestBatch';
import { listLogisticsProvider } from '@/api/demo/logisticsProvider';
import { ShipmentOrderVO, ShipmentOrderQuery, ShipmentOrderForm } from '@/api/demo/shipmentOrder/types';
import { getColumnWidth } from '@/utils/utils';
import { ShipmentOrderStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import { LogisticsProviderVO } from '@/api/demo/logisticsProvider/types';
import { Delete, Edit, QuestionFilled } from '@element-plus/icons-vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { batch_type } = toRefs<any>(proxy?.useDict('batch_type'));
const route = useRoute();
const router = useRouter();

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

// dialog for adding/editing a batch link
const batchLinkDialogVisible = ref(false);
const batchLinkFormRef = ref<ElFormInstance>();
const editingBatchLinkIndex = ref<number | null>(null); // Track which batch link is being edited
const batchLinkForm = reactive({
  finishedBatchId: '',
  quantity: ''
});
const batchLinkRules = {
  finishedBatchId: [{ required: true, message: 'Please enter finished_batch_id', trigger: 'blur' }],
  quantity: [{ required: true, message: 'Please enter quantity', trigger: 'blur' }]
};

// options & loading for finished_batch_id select
const finishedBatchOptions = ref<{ label: string; value: string | number }[]>([]);
const finishedBatchLoading = ref(false);

/** Clear batch links when Batch Type changes */
const handleBatchTypeChange = () => {
  shipmentBatchLinks.value = [];
};

const handleSelectBatchLink = () => {
  if (!form.value.batchType) {
    proxy?.$modal.msgError('Please select Batch Type first');
    return;
  }

  editingBatchLinkIndex.value = null; // Reset editing index for new item
  batchLinkForm.finishedBatchId = '';
  batchLinkForm.quantity = '';
  finishedBatchOptions.value = [];
  finishedBatchLoading.value = false;
  batchLinkDialogVisible.value = true;
};

/** Edit batch link */
const handleEditBatchLink = (index: number) => {
  const batchLink = shipmentBatchLinks.value[index];
  editingBatchLinkIndex.value = index;
  batchLinkForm.finishedBatchId = batchLink.finishedBatchId || '';
  batchLinkForm.quantity = batchLink.quantity || '';
  // Pre-populate the select options with current value
  if (batchLink.finishedBatchId) {
    finishedBatchOptions.value = [
      {
        value: batchLink.finishedBatchId,
        label: String(batchLink.finishedBatchId)
      }
    ];
  } else {
    finishedBatchOptions.value = [];
  }
  finishedBatchLoading.value = false;
  batchLinkDialogVisible.value = true;
};

const finishedBatchRemoteMethod = async (query: string) => {
  if (!query) {
    finishedBatchOptions.value = [];
    return;
  }
  finishedBatchLoading.value = true;
  try {
    if (form.value.batchType === '1') {
      const res = await listFinishedGoodsBatch({ pageNum: 1, pageSize: 20, finishedBatchId: query } as any);
      const rows: any[] = (res as any).rows || (res as any).data?.rows || [];
      finishedBatchOptions.value = rows.map((item) => ({
        value: item.finishedBatchId,
        label: String(item.finishedBatchId)
      }));
    } else {
      const res = await listPostharvestBatch({ pageNum: 1, pageSize: 20, batchId: query } as any);
      const rows: any[] = (res as any).rows || (res as any).data?.rows || [];
      finishedBatchOptions.value = rows.map((item) => ({
        value: item.batchId,
        label: String(item.batchId)
      }));
    }
  } finally {
    finishedBatchLoading.value = false;
  }
};

const handleBatchLinkSave = async () => {
  batchLinkFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;

    // Check if we're editing an existing batch link
    if (editingBatchLinkIndex.value !== null) {
      const index = editingBatchLinkIndex.value;
      const existingBatchLink = shipmentBatchLinks.value[index];

      if (form.value.shipmentId && existingBatchLink.shipmentBatchLinkId) {
        // 编辑模式（已有 shipmentId 和 shipmentBatchLinkId）：调用编辑 API
        try {
          await updateShipmentOrderBatchLink({
            shipmentBatchLinkId: existingBatchLink.shipmentBatchLinkId,
            finishedBatchId: batchLinkForm.finishedBatchId,
            quantity: Number(batchLinkForm.quantity)
          });
          // 重新获取订单数据以更新批次链接列表
          const res = await getShipmentOrder(form.value.shipmentId);
          const orderData = res.data as any;
          let batchLinksData: any[] = [];
          if (orderData.batchLinks && Array.isArray(orderData.batchLinks)) {
            batchLinksData = orderData.batchLinks;
          } else if (Array.isArray(orderData) && orderData.length > 0 && orderData[0].finishedBatchId) {
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
          proxy?.$modal.msgSuccess('Operation successful');
          batchLinkDialogVisible.value = false;
          editingBatchLinkIndex.value = null;
          // 重置表单
          batchLinkForm.finishedBatchId = '';
          batchLinkForm.quantity = '';
        } catch (error) {
          console.error('Failed to update batch link:', error);
          proxy?.$modal.msgError('Failed to update batch link');
        }
      } else {
        // 编辑模式（新建订单，还没有 shipmentId）：直接更新本地数组
        shipmentBatchLinks.value[index] = {
          ...existingBatchLink,
          finishedBatchId: batchLinkForm.finishedBatchId,
          quantity: batchLinkForm.quantity
        };
        batchLinkDialogVisible.value = false;
        editingBatchLinkIndex.value = null;
        // 重置表单
        batchLinkForm.finishedBatchId = '';
        batchLinkForm.quantity = '';
      }
    } else {
      // 新增模式
      if (form.value.shipmentId) {
        // 编辑模式：调用 API 添加批次链接
        try {
          await addShipmentOrderBatchLink({
            shipmentId: form.value.shipmentId,
            finishedBatchId: batchLinkForm.finishedBatchId,
            quantity: Number(batchLinkForm.quantity)
          });
          // 重新获取订单数据以更新批次链接列表
          const res = await getShipmentOrder(form.value.shipmentId);
          const orderData = res.data as any;
          let batchLinksData: any[] = [];
          if (orderData.batchLinks && Array.isArray(orderData.batchLinks)) {
            batchLinksData = orderData.batchLinks;
          } else if (Array.isArray(orderData) && orderData.length > 0 && orderData[0].finishedBatchId) {
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
          proxy?.$modal.msgSuccess('Operation successful');
          batchLinkDialogVisible.value = false;
          // 重置表单
          batchLinkForm.finishedBatchId = '';
          batchLinkForm.quantity = '';
        } catch (error) {
          console.error('Failed to add batch link:', error);
        }
      } else {
        // 新建模式：直接添加到本地数组
        shipmentBatchLinks.value.push({
          shipmentBatchLinkId: '',
          shipmentId: form.value.shipmentId || '',
          finishedBatchId: batchLinkForm.finishedBatchId,
          quantity: batchLinkForm.quantity
        });
        batchLinkDialogVisible.value = false;
        // 重置表单
        batchLinkForm.finishedBatchId = '';
        batchLinkForm.quantity = '';
      }
    }
  });
};

const handleBatchLinkCancel = () => {
  batchLinkDialogVisible.value = false;
  editingBatchLinkIndex.value = null;
  batchLinkForm.finishedBatchId = '';
  batchLinkForm.quantity = '';
};

/** Delete batch link */
const handleDeleteBatchLink = async (index: number) => {
  const batchLink = shipmentBatchLinks.value[index];
  if (form.value.shipmentId && batchLink.shipmentBatchLinkId) {
    // 编辑模式：调用 API 删除批次链接
    try {
      await delShipmentOrderBatchLink(batchLink.shipmentBatchLinkId);
      // 重新获取订单数据以更新批次链接列表
      const res = await getShipmentOrder(form.value.shipmentId);
      const orderData = res.data as any;
      let batchLinksData: any[] = [];
      if (orderData.batchLinks && Array.isArray(orderData.batchLinks)) {
        batchLinksData = orderData.batchLinks;
      } else if (Array.isArray(orderData) && orderData.length > 0 && orderData[0].finishedBatchId) {
        batchLinksData = orderData;
      }
      if (batchLinksData.length > 0) {
        shipmentBatchLinks.value = batchLinksData.map((link: any) => ({
          shipmentBatchLinkId: link.shipmentBatchLinkId || '',
          shipmentId: link.shipmentId || form.value.shipmentId || '',
          finishedBatchId: link.finishedBatchId || '',
          quantity: link.quantity || ''
        }));
      } else {
        shipmentBatchLinks.value = [];
      }
      proxy?.$modal.msgSuccess('Delete successful');
    } catch (error) {
      console.error('Failed to delete batch link:', error);
      proxy?.$modal.msgError('Failed to delete batch link');
    }
  } else {
    // 新建模式：直接从本地数组删除
    shipmentBatchLinks.value.splice(index, 1);
  }
};

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
  batchType: '1',
  status: undefined,
  approvedBy: undefined,
  logisticsCompany: undefined,
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
    batchType: [{ required: true, message: 'Batch Type cannot be empty', trigger: 'change' }],
    providerId: [{ required: true, message: 'Logistics Provider cannot be empty', trigger: 'change' }],
    status: [{ required: true, message: 'Created=0,Planned=1,In-Transit=2,Delivered=3 cannot be empty', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

// 物流服务商列表，用于 Logistics Provider 自动补全
const logisticsProviderList = ref<LogisticsProviderVO[]>([]);
const providerIdPopOptions = ref([]);
const providerIdPopLoading = ref(false);
const actionColumnWidth = computed(() => (shipmentOrderList.value.some((item) => !isViewFlag(item)) ? '210' : '110'));
const providerIdPopRemoteMethod = async (query: string) => {
  if (query) {
    providerIdPopLoading.value = true;
    const list = logisticsProviderList.value
      .filter((f) => f.providerId.toString().toLowerCase().includes(query.toLowerCase()))
      .map((item) => item.providerId);
    providerIdPopOptions.value = list.map((item) => ({
      value: item,
      label: item
    }));
    providerIdPopLoading.value = false;
  } else {
    providerIdPopOptions.value = [];
  }
};

const loadLogisticsProviders = async () => {
  // 已经加载过就不再请求
  if (logisticsProviderList.value.length) return;
  const res = await listLogisticsProvider({ pageNum: 1, pageSize: 100 } as any);
  logisticsProviderList.value = (res as any).rows || (res as any).data?.rows || [];
};

/** Query Shipment Order List */
const getList = async () => {
  loading.value = true;
  try {
    const uiPageNum = queryParams.value.pageNum || 1;
    const uiPageSize = queryParams.value.pageSize || 10;
    const selectedShipmentId = queryParams.value.shipmentId?.toString().trim();

    // 兜底：若后端未按 shipmentId 过滤，前端按 shipmentId 精确过滤
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
  router.push({ name: 'ShipmentOrderAdd' });
};

/** Edit Button Action */
const handleUpdate = (row?: ShipmentOrderVO) => {
  const _shipmentId = row?.shipmentId || ids.value[0];
  if (isViewFlag(row)) {
    router.push({ name: 'ShipmentOrderDetail', params: { id: _shipmentId } });
  } else {
    router.push({ name: 'ShipmentOrderEdit', params: { id: _shipmentId } });
  }
};

/** Submit Button */
const submitForm = () => {
  shipmentOrderFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (shipmentBatchLinks.value.length === 0) {
        proxy?.$modal.msgError('Please add at least one Batch Link');
        return;
      }
      buttonLoading.value = true;
      if (form.value.shipmentId) {
        // 编辑已有订单：批次链接为必填，始终携带 batchLinks
        const updateData = { ...form.value };
        updateData.batchLinks = shipmentBatchLinks.value.map((item) => ({
          finishedBatchId: item.finishedBatchId,
          quantity: Number(item.quantity)
        }));
        await updateShipmentOrder(updateData).finally(() => (buttonLoading.value = false));
      } else {
        // 新建订单：批次链接为必填，调用 createBatch 接口
        await createShipmentOrderWithBatch({
          providerId: (form.value.providerId || '') as string,
          sourceEntity: form.value.sourceEntity as string,
          destinationEntity: form.value.destinationEntity as string,
          plannedDispatch: form.value.plannedDispatch as string,
          deliveryDeadline: form.value.deliveryDeadline as string,
          batchType: form.value.batchType as string,
          batchLinks: shipmentBatchLinks.value.map((item) => ({
            finishedBatchId: item.finishedBatchId,
            quantity: Number(item.quantity)
          }))
        }).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

/** Delete Button Action */
const handleDelete = async (row?: ShipmentOrderVO) => {
  const _shipmentIds = row?.shipmentId || ids.value;
  await proxy?.$modal
    .confirm('Are you sure you want to delete the shipment order with ID "' + _shipmentIds + '"?')
    .finally(() => (loading.value = false));
  await delShipmentOrder(_shipmentIds);
  proxy?.$modal.msgSuccess('Delete successful');
  await getList();
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

/** 仅 Created 可编辑；status 未赋值时（新增）仍可编辑 */
const isViewFlag = (data: { status?: string | number }) => {
  if (!data || data.status === undefined || data.status === null) return false;
  return data.status.toString() !== ShipmentOrderStatus.Created.toString();
};
</script>

<style>
.shipment-batch-type-tooltip {
  max-width: 360px;
  white-space: normal;
  word-break: break-word;
  line-height: 1.5;
}


.batch-type-radio-item {
  display: inline-flex;
  align-items: center;
  margin-right: 12px;
}

.batch-type-radio-item :deep(.el-radio) {
  margin-right: 0;
}

.batch-type-help-icon {
  margin-left: -25px;
  color: #909399;
  cursor: help;
  font-size: 20px;
}

/* Popup: entity inputs use full content width */
.shipment-order-dialog-form :deep(.el-form-item__content) {
  min-width: 0;
}
.shipment-order-dialog-form .entity-field-input {
  width: 100%;
}
</style>
