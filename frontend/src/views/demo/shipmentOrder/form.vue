<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- Add or Edit Shipment Order Dialog -->
      <el-form
        ref="shipmentOrderFormRef"
        :model="form"
        :rules="rules"
        :disabled="isDetail"
        label-width="198px"
        class="shipment-order-form"
      >
        <el-form-item label="Shipment ID" prop="shipmentId" v-if="form.shipmentId">
          <el-input v-model="form.shipmentId" placeholder="Please enter Shipment ID" :disabled="true" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="Batch Type" prop="batchType">
          <el-radio-group v-model="form.batchType" :disabled="isViewFlag(form) || !!form.shipmentId" @change="handleBatchTypeChange">
            <span v-for="(dict, index) in batch_type" :key="dict.value" class="batch-type-radio-item">
              <el-radio :value="dict.value">{{ dict.label }}</el-radio>
              <el-tooltip
                :content="
                  index === 0
                    ? 'Finished product batch: applicable to products that have completed all processing steps and meet the final sales standards (Scenario example: Packaged and labeled bread).'
                    : index === 1
                      ? 'Post harvest batch: applicable to crops that have not yet undergone deep processing (Scenario example: Harvesting barley stored in the warehouse).'
                      : ''
                "
                placement="top"
                popper-class="shipment-batch-type-tooltip"
              >
                <el-icon class="batch-type-help-icon">
                  <QuestionFilled />
                </el-icon>
              </el-tooltip>
            </span>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Source entity" prop="sourceEntity">
          <el-input v-model="form.sourceEntity" placeholder="Please enter Source entity" class="entity-field-input" :disabled="isViewFlag(form)" />
        </el-form-item>
        <el-form-item label="Destination entity" prop="destinationEntity">
          <el-input
            v-model="form.destinationEntity"
            placeholder="Please enter Destination entity"
            class="entity-field-input"
            :disabled="isViewFlag(form)"
          />
        </el-form-item>
        <el-form-item label="Planned dispatch time" prop="plannedDispatch">
          <el-date-picker
            clearable
            v-model="form.plannedDispatch"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Planned dispatch time"
            :disabled="isViewFlag(form)"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Delivery deadline" prop="deliveryDeadline">
          <el-date-picker
            clearable
            v-model="form.deliveryDeadline"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Delivery deadline"
            :disabled="isViewFlag(form)"
          >
          </el-date-picker>
        </el-form-item>
        <!-- <el-form-item label="Logistics supervisor user ID" prop="approvedBy">
          <el-input v-model="form.approvedBy" placeholder="Please enter Logistics supervisor user ID" :disabled="isViewFlag(form)" />
        </el-form-item> -->
        <el-form-item label="Logistics Provider" prop="providerId">
          <el-select
            v-model="form.providerId"
            filterable
            remote
            reserve-keyword
            placeholder="Please input"
            :remote-method="providerIdPopRemoteMethod"
            :loading="providerIdPopLoading"
            :debounce="300"
            v-if="!isViewFlag(form)"
            clearable
          >
            <el-option v-for="item in providerIdPopOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-else v-model="form.providerId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment" v-if="form.status !== ShipmentOrderStatus.Created.toString()">
          <el-input v-model="form.approvedComment" type="textarea" placeholder="Please enter content" :disabled="isViewFlag(form)" />
        </el-form-item>
        <!-- Batch link selector -->
        <!-- Add/Edit Shipment Batch Link Dialog -->
        <el-form-item label-width="0" v-if="!isViewFlag(form)">
          <el-button type="primary" plain icon="Plus" @click="toggleBatchLinkPanel" style="width: 150px !important">Add Batch Link</el-button>
        </el-form-item>
        <el-form-item label-width="0" v-if="batchLinkPanelVisible">
          <div class="batch-link-inline-form">
            <el-form ref="batchLinkFormRef" :model="batchLinkForm" :rules="batchLinkRules" label-width="auto" inline>
              <el-form-item
                :label="form.batchType === '1' ? 'Finished Batch ID' : 'PostHarvest Batch ID'"
                prop="finishedBatchId"
                label-width="auto"
              >
                <el-select
                  v-model="batchLinkForm.finishedBatchId"
                  filterable
                  remote
                  clearable
                  reserve-keyword
                  placeholder="Please input"
                  :remote-method="finishedBatchRemoteMethod"
                  :loading="finishedBatchLoading"
                  :debounce="300"
                  :disabled="editingBatchLinkIndex !== null"
                  style="width: 260px"
                >
                  <el-option v-for="item in finishedBatchOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="Quantity" prop="quantity">
                <el-input v-model="batchLinkForm.quantity" placeholder="Please enter quantity" style="width: 160px" />
              </el-form-item>
              <el-form-item>
                <el-button @click="handleBatchLinkCancel">Cancel</el-button>
                <el-button type="primary" @click="handleBatchLinkSave">Save</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-form-item>
        <el-form-item label-width="0">
          <el-table :data="shipmentBatchLinks" border style="width: 100%" v-loading="shipmentBatchLoading">
            <el-table-column
              label="Shipment Batch link ID"
              prop="shipmentBatchLinkId"
              align="center"
              :min-width="getColumnWidth('Shipment Batch link ID')"
            />
            <el-table-column
              :label="form.batchType === '2' ? 'Postharvest Batch ID' : 'Finished BatchID'"
              prop="finishedBatchId"
              align="center"
              :min-width="getColumnWidth('Postharvest Batch ID')"
            />
            <el-table-column label="Quantity" prop="quantity" align="center" :min-width="getColumnWidth('Quantity')" />
            <el-table-column label="Action" align="center" fixed="right" width="100" v-if="!isViewFlag(form)">
              <template #default="scope">
                <el-tooltip content="Edit" placement="top">
                  <el-icon
                    class="cursor-pointer"
                    style="color: #009a44; font-size: 18px; margin-right: 10px"
                    @click="handleEditBatchLink(scope.$index)"
                  >
                    <Edit />
                  </el-icon>
                </el-tooltip>
                <el-tooltip content="Delete" placement="top">
                  <el-icon class="cursor-pointer" style="color: #009a44; font-size: 18px" @click="handleDeleteBatchLink(scope.$index)">
                    <Delete />
                  </el-icon>
                </el-tooltip>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
        <!-- <el-form-item label="Approval date" prop="approvedAt">
          <el-date-picker
            clearable
            v-model="form.approvedAt"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Approval date"
            :disabled="isViewFlag(form)"
          >
          </el-date-picker>
        </el-form-item> -->
      </el-form>
      <div class="form-footer">
        <el-button v-if="!isViewFlag(form)" :loading="buttonLoading" type="primary" @click="submitForm">Confirm</el-button>
        <el-button @click="cancel">{{ isViewFlag(form) ? 'Close' : 'Cancel' }}</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="ShipmentOrderForm" lang="ts">
import {
  getShipmentOrder,
  updateShipmentOrder,
  createShipmentOrderWithBatch,
  addShipmentOrderBatchLink,
  delShipmentOrderBatchLink,
  updateShipmentOrderBatchLink
} from '@/api/demo/shipmentOrder';
import { listFinishedGoodsBatch } from '@/api/demo/finishedGoodsBatch';
import { listPostharvestBatch } from '@/api/demo/postharvestBatch';
import { listLogisticsProvider } from '@/api/demo/logisticsProvider';
import { ShipmentOrderForm } from '@/api/demo/shipmentOrder/types';
import { getColumnWidth } from '@/utils/utils';
import { ShipmentOrderStatus } from '@/enums/AgriculturalEnum';
import { LogisticsProviderVO } from '@/api/demo/logisticsProvider/types';
import { Delete, Edit, QuestionFilled } from '@element-plus/icons-vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { batch_type } = toRefs<any>(proxy?.useDict('batch_type'));

const pageLoading = ref(false);
const buttonLoading = ref(false);
const shipmentOrderFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

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

const form = ref<ShipmentOrderForm>({ ...initFormData });

const rules = {
  shipmentId: [{ required: true, message: 'Unique shipment identifier cannot be empty', trigger: 'blur' }],
  batchType: [{ required: true, message: 'Batch Type cannot be empty', trigger: 'change' }],
  providerId: [{ required: true, message: 'Logistics Provider cannot be empty', trigger: 'change' }],
  status: [{ required: true, message: 'Created=0,Planned=1,In-Transit=2,Delivered=3 cannot be empty', trigger: 'change' }]
};

// Shipment batch link table
const shipmentBatchLinks = ref<any[]>([]);
const shipmentBatchLoading = ref(false);

// 页内行内表单：新增/编辑 batch link（原弹窗改页内展开/收起）
const batchLinkPanelVisible = ref(false);
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

// 物流服务商列表，用于 Logistics Provider 自动补全
const logisticsProviderList = ref<LogisticsProviderVO[]>([]);
const providerIdPopOptions = ref([]);
const providerIdPopLoading = ref(false);
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

/** 仅 Created 可编辑；detail 模式强制只读 */
const isViewFlag = (data: { status?: string | number }) => {
  if (isDetail.value) return true;
  if (!data || data.status === undefined || data.status === null) return false;
  return data.status.toString() !== ShipmentOrderStatus.Created.toString();
};

/** Clear batch links when Batch Type changes */
const handleBatchTypeChange = () => {
  shipmentBatchLinks.value = [];
  batchLinkPanelVisible.value = false;
  editingBatchLinkIndex.value = null;
  batchLinkForm.finishedBatchId = '';
  batchLinkForm.quantity = '';
};

/** Add Batch Link 按钮：展开/收起页内行内表单 */
const toggleBatchLinkPanel = () => {
  if (!form.value.batchType) {
    proxy?.$modal.msgError('Please select Batch Type first');
    return;
  }
  if (batchLinkPanelVisible.value) {
    handleBatchLinkCancel();
    return;
  }
  editingBatchLinkIndex.value = null; // Reset editing index for new item
  batchLinkForm.finishedBatchId = '';
  batchLinkForm.quantity = '';
  finishedBatchOptions.value = [];
  finishedBatchLoading.value = false;
  batchLinkPanelVisible.value = true;
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
  batchLinkPanelVisible.value = true;
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
          batchLinkPanelVisible.value = false;
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
        batchLinkPanelVisible.value = false;
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
          batchLinkPanelVisible.value = false;
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
        batchLinkPanelVisible.value = false;
        // 重置表单
        batchLinkForm.finishedBatchId = '';
        batchLinkForm.quantity = '';
      }
    }
  });
};

const handleBatchLinkCancel = () => {
  batchLinkPanelVisible.value = false;
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

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value) {
    form.value = { ...initFormData };
    form.value.status = ShipmentOrderStatus.Created.toString();
    await loadLogisticsProviders();
    return;
  }
  if (!id.value) return;
  pageLoading.value = true;
  try {
    const res = await getShipmentOrder(id.value);
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
    await loadLogisticsProviders();
  } finally {
    pageLoading.value = false;
  }
};

/** Cancel Button */
const cancel = () => {
  router.push(listPath.value);
};

/** Submit Button */
const submitForm = () => {
  shipmentOrderFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    if (shipmentBatchLinks.value.length === 0) {
      proxy?.$modal.msgError('Please add at least one Batch Link');
      return;
    }
    buttonLoading.value = true;
    try {
      if (form.value.shipmentId) {
        // 编辑已有订单：批次链接为必填，始终携带 batchLinks
        const updateData = { ...form.value };
        updateData.batchLinks = shipmentBatchLinks.value.map((item) => ({
          finishedBatchId: item.finishedBatchId,
          quantity: Number(item.quantity)
        }));
        await updateShipmentOrder(updateData);
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
        });
      }
      proxy?.$modal.msgSuccess('Operation successful');
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
</style>

<style scoped>
.form-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 0;
}

.shipment-order-form :deep(.el-form-item__content) {
  min-width: 0;
}

.shipment-order-form .entity-field-input {
  width: 100%;
}

.batch-link-inline-form {
  width: 100%;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 12px 16px 0;
  background: #fafafa;
}
</style>
