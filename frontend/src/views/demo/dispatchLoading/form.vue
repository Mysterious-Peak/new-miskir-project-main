<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="shipmentOrderFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="198px">
        <!-- Add or Edit Dispatch & Loading Dialog -->
        <!-- Shipment Information -->
        <el-card shadow="hover" class="mb-4" :body-style="{ padding: '16px 24px 8px' }">
          <div class="flex items-center" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px">
            <el-icon class="mr-1" color="#52c41a"><InfoFilled /></el-icon>
            <span class="font-semibold">Shipment Information</span>
          </div>
          <div class="dispatch-shipment-info-fields">
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="Shipment ID" prop="shipmentId" v-if="form.shipmentId">
                  <el-input v-model="form.shipmentId" placeholder="Please enter Shipment ID" :disabled="true" maxlength="20" show-word-limit />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Source entity" prop="sourceEntity">
                  <el-input v-model="form.sourceEntity" placeholder="Please enter Source entity" :disabled="true" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="Destination entity" prop="destinationEntity">
                  <el-input v-model="form.destinationEntity" placeholder="Please enter Destination entity" :disabled="true" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Planned dispatch time" prop="plannedDispatch">
                  <el-date-picker
                    clearable
                    v-model="form.plannedDispatch"
                    type="datetime"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    placeholder="Please select Planned dispatch time"
                    :disabled="true"
                    style="width: 100%"
                  >
                  </el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="Delivery deadline" prop="deliveryDeadline">
                  <el-date-picker
                    clearable
                    v-model="form.deliveryDeadline"
                    type="datetime"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    placeholder="Please select Delivery deadline"
                    :disabled="true"
                    style="width: 100%"
                  >
                  </el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Logistics Provider" prop="providerId">
                  <el-select
                    v-model="form.providerId"
                    filterable
                    remote
                    reserve-keyword
                    placeholder="Please input"
                    :disabled="true"
                    :remote-method="providerIdPopRemoteMethod"
                    :loading="providerIdPopLoading"
                    :debounce="300"
                    v-if="!isViewFlag(form)"
                    clearable
                    style="width: 100%"
                  >
                    <el-option v-for="item in providerIdPopOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                  <el-input v-else v-model="form.providerId" placeholder="Please input" disabled style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <el-form-item label="Approval Comment" prop="approvedComment" v-if="form.status !== ShipmentOrderStatus.Created.toString()">
            <el-input v-model="form.approvedComment" type="textarea" placeholder="Please enter content" :disabled="true" />
          </el-form-item>
        </el-card>

        <!-- Add Shipment Batch Link Dialog -->
        <!-- Batch Link Information -->
        <el-card shadow="hover" class="mb-4" :body-style="{ padding: '16px 24px 8px' }">
          <div class="flex items-center" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px">
            <el-icon class="mr-1" color="#52c41a"><InfoFilled /></el-icon>
            <span class="font-semibold">Batch Link Information</span>
          </div>
          <el-form-item label-width="0" v-if="!isViewFlag(form)">
            <el-button type="primary" plain icon="Plus" @click="toggleBatchLinkPanel" style="width: 150px !important">Add Batch Link</el-button>
          </el-form-item>
          <el-form-item label-width="0" v-if="batchLinkPanelVisible">
            <div class="batch-link-inline-form">
              <el-form ref="batchLinkFormRef" :model="batchLinkForm" :rules="batchLinkRules" label-width="auto" inline>
                <el-form-item label="Finished Batch ID" prop="finishedBatchId">
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
              <el-table-column label="Shipment Batch link ID" prop="shipmentBatchLinkId" align="center" />
              <el-table-column
                :label="form.batchType === '2' ? 'Post Harvest Batch ID' : 'Finished Batch ID'"
                prop="finishedBatchId"
                align="center"
              />
              <el-table-column label="Quantity" prop="quantity" align="center" />
              <el-table-column label="Action" align="center" width="100" v-if="!isViewFlag(form)">
                <template #default="scope">
                  <el-tooltip content="Delete" placement="top">
                    <el-icon class="cursor-pointer" style="color: #009a44; font-size: 18px" @click="handleDeleteBatchLink(scope.$index)">
                      <Delete />
                    </el-icon>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
        </el-card>

        <!-- Vehicle & Driver Information -->
        <el-card shadow="hover" class="mb-4" :body-style="{ padding: '16px 24px 8px' }" v-if="form.shipmentId">
          <div class="flex items-center" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px">
            <el-icon class="mr-1" color="#52c41a"><InfoFilled /></el-icon>
            <span class="font-semibold">Vehicle & Driver Information</span>
          </div>
          <el-form-item label-width="0">
            <el-table :data="vehicleList" stripe fit border style="width: 100%">
              <el-table-column label="Trip ID" prop="tripId" align="center" :min-width="getColumnWidth('Trip Id')" />
              <el-table-column label="Vehicle ID" prop="vehicleId" align="center" :min-width="getColumnWidth('Vehicle Id')" />
              <el-table-column
                label="Vehicle Registration Plate"
                prop="plateNumber"
                align="center"
                :min-width="getColumnWidth('Vehicle Registration Plate')"
              />
              <el-table-column label="Vehicle Type" align="center" prop="vehicleType" :min-width="getColumnWidth('Vehicle Type')">
                <template #default="scope">
                  <dict-tag :options="vehicle_type" :value="scope.row.vehicleType" />
                </template>
              </el-table-column>
              <el-table-column
                label="Cold Chain Capability"
                align="center"
                prop="coldChainCapable"
                :min-width="getColumnWidth('Cold Chain Capability')"
              >
                <template #default="scope">
                  <dict-tag :options="cold_chain_capable" :value="scope.row.coldChainCapable" />
                </template>
              </el-table-column>
              <el-table-column label="Driver ID" prop="driverId" align="center" :min-width="getColumnWidth('Driver Id')" />
              <el-table-column
                label="Driver license number"
                prop="licenseNumber"
                align="center"
                :min-width="getColumnWidth('Driver license number')"
              />
              <el-table-column label="Contact phone number" prop="phoneNumber" align="center" :min-width="getColumnWidth('Contact phone number')" />
              <el-table-column label="Start Time" prop="startTime" align="center" width="180" :min-width="getColumnWidth('Start Time')">
                <template #default="scope">
                  <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
                </template>
              </el-table-column>
              <el-table-column label="End Time" prop="endTime" align="center" width="180" :min-width="getColumnWidth('End Time')">
                <template #default="scope">
                  <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
        </el-card>
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

<script setup name="DispatchLoadingForm" lang="ts">
import { getShipmentOrder, updateShipmentOrder, addShipmentOrderBatchLink, delShipmentOrderBatchLink } from '@/api/demo/shipmentOrder';
import { listFinishedGoodsBatch } from '@/api/demo/finishedGoodsBatch';
import { listLogisticsProvider } from '@/api/demo/logisticsProvider';
import { ShipmentOrderForm } from '@/api/demo/shipmentOrder/types';
import { getColumnWidth } from '@/utils/utils';
import { ShipmentOrderStatus } from '@/enums/AgriculturalEnum';
import { LogisticsProviderVO } from '@/api/demo/logisticsProvider/types';
import { Delete, InfoFilled } from '@element-plus/icons-vue';
import { getTripByShipmentOrder } from '@/api/demo/trip';
import { parseTime } from '@/utils/ruoyi';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { vehicle_type, cold_chain_capable } = toRefs<any>(proxy?.useDict('vehicle_type', 'cold_chain_capable'));

const pageLoading = ref(false);
const buttonLoading = ref(false);
const shipmentOrderFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

// Vehicle & Driver Information
const vehicleList = ref<any[]>([]);

const initFormData: ShipmentOrderForm = {
  shipmentId: undefined,
  providerId: undefined,
  sourceEntity: undefined,
  destinationEntity: undefined,
  plannedDispatch: undefined,
  deliveryDeadline: undefined,
  status: undefined,
  approvedBy: undefined,
  logisticsCompany: undefined,
  approvedComment: undefined,
  approvedAt: undefined
};

const form = ref<ShipmentOrderForm>({ ...initFormData });

const rules = {
  shipmentId: [{ required: true, message: 'Unique shipment identifier cannot be empty', trigger: 'blur' }],
  status: [{ required: true, message: 'Created=0,Planned=1,In-Transit=2,Delivered=3 cannot be empty', trigger: 'change' }]
};

// Shipment batch link table
const shipmentBatchLinks = ref<any[]>([]);
const shipmentBatchLoading = ref(false);

// 页内行内表单：新增 batch link（原弹窗改页内展开/收起）
const batchLinkPanelVisible = ref(false);
const batchLinkFormRef = ref<ElFormInstance>();
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

/** 非 Assigned 即只读（View）；detail 模式强制只读 */
const isViewFlag = (data: { status?: string | number }) => {
  if (isDetail.value) return true;
  if (!data || data.status === undefined || data.status === null) return false;
  const status = data.status.toString();
  return (
    status === ShipmentOrderStatus.Created.toString() ||
    status === ShipmentOrderStatus.Planned.toString() ||
    status === ShipmentOrderStatus.InTransit.toString() ||
    status === ShipmentOrderStatus.Delivered.toString() ||
    status === ShipmentOrderStatus.Rejected.toString()
  );
};

/** Add Batch Link 按钮：展开/收起页内行内表单 */
const toggleBatchLinkPanel = () => {
  if (batchLinkPanelVisible.value) {
    handleBatchLinkCancel();
    return;
  }
  batchLinkForm.finishedBatchId = '';
  batchLinkForm.quantity = '';
  finishedBatchOptions.value = [];
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
    const res = await listFinishedGoodsBatch({ pageNum: 1, pageSize: 20, finishedBatchId: query } as any);
    const rows: any[] = (res as any).rows || (res as any).data?.rows || [];
    finishedBatchOptions.value = rows.map((item) => ({
      value: item.finishedBatchId,
      label: String(item.finishedBatchId)
    }));
  } finally {
    finishedBatchLoading.value = false;
  }
};

const handleBatchLinkSave = async () => {
  batchLinkFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
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
  });
};

const handleBatchLinkCancel = () => {
  batchLinkPanelVisible.value = false;
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

/** Load vehicle information by shipmentId */
const loadVehicleInfo = async (shipmentId: string | number) => {
  try {
    const res = await getTripByShipmentOrder(shipmentId);
    vehicleList.value = res.data || [];
  } catch (error) {
    console.error('Failed to load vehicle information:', error);
    vehicleList.value = [];
  }
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
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
    // Load vehicle information if shipmentId exists
    if (form.value.shipmentId) {
      await loadVehicleInfo(form.value.shipmentId);
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
    buttonLoading.value = true;
    try {
      form.value.status = ShipmentOrderStatus.InTransit.toString();
      // 编辑已有订单，如果有批次链接数据，也要一起传递
      const updateData = { ...form.value };
      if (shipmentBatchLinks.value.length > 0) {
        updateData.batchLinks = shipmentBatchLinks.value.map((item) => ({
          finishedBatchId: item.finishedBatchId,
          quantity: Number(item.quantity)
        }));
      }
      await updateShipmentOrder(updateData);
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

<style scoped>
.form-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 0;
}

.batch-link-inline-form {
  width: 100%;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 12px 16px 0;
  background: #fafafa;
}

/* Shipment Information: two columns, narrower label column so controls are wider */
.dispatch-shipment-info-fields :deep(.el-form-item__label) {
  width: 148px !important;
  padding-right: 8px;
}
.dispatch-shipment-info-fields :deep(.el-form-item__content) {
  flex: 1;
  min-width: 0;
}
.dispatch-shipment-info-fields :deep(.el-col .el-form-item) {
  margin-bottom: 18px;
}
</style>
