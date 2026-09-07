<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="shipmentOrderFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="198px" class="shipment-order-form">
        <el-form-item label="Shipment ID" prop="shipmentId" v-if="form.shipmentId">
          <el-input v-model="form.shipmentId" placeholder="Please enter Shipment ID" :disabled="true" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="Batch Type" prop="batchType">
          <el-radio-group v-model="form.batchType" disabled>
            <el-radio v-for="dict in batch_type" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Source entity" prop="sourceEntity">
          <el-input v-model="form.sourceEntity" placeholder="Please enter Source entity" :disabled="true" class="entity-field-input" />
        </el-form-item>
        <el-form-item label="Destination entity" prop="destinationEntity">
          <el-input v-model="form.destinationEntity" placeholder="Please enter Destination entity" :disabled="true" class="entity-field-input" />
        </el-form-item>
        <el-form-item label="Planned dispatch time" prop="plannedDispatch">
          <el-date-picker
            clearable
            v-model="form.plannedDispatch"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Planned dispatch time"
            :disabled="true"
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
            :disabled="true"
          >
          </el-date-picker>
        </el-form-item>
        <!-- <el-form-item label="Logistics supervisor user ID" prop="approvedBy">
          <el-input v-model="form.approvedBy" placeholder="Please enter Logistics supervisor user ID" :disabled="true" />
        </el-form-item> -->
        <el-form-item label="Logistics Provider" prop="providerId">
          <el-input v-model="form.providerId" placeholder="Please input" :disabled="true" class="entity-field-input" />
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment">
          <el-input v-model="form.approvedComment" type="textarea" placeholder="Please enter content" :disabled="isViewFlag(form)" />
        </el-form-item>
        <!-- Batch link table -->
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
          </el-table>
        </el-form-item>
        <!-- <el-form-item label="Approval date" prop="approvedAt">
          <el-date-picker
            clearable
            v-model="form.approvedAt"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Approval date"
            :disabled="true"
          >
          </el-date-picker>
        </el-form-item> -->
      </el-form>
      <div class="form-footer">
        <el-button v-if="isDetail" @click="cancel">Close</el-button>
        <template v-else>
          <div class="dialog-footer">
            <!-- Created 状态：Planned / Rejected -->
            <el-button
              v-if="!isViewFlag(form) && form.status == ShipmentOrderStatus.Created.toString()"
              :loading="buttonLoading"
              type="primary"
              @click="toPlannedForm"
            >
              Planned
            </el-button>
            <el-button
              v-if="!isViewFlag(form) && form.status == ShipmentOrderStatus.Created.toString()"
              :loading="buttonLoading"
              type="danger"
              @click="rejectStatusForm"
            >
              Rejected
            </el-button>
            <!-- Planned 状态：Assigned -->
            <el-button
              v-if="!isViewFlag(form) && form.status == ShipmentOrderStatus.Planned.toString()"
              :loading="buttonLoading"
              type="primary"
              @click="toAssignedForm"
            >
              Assigned
            </el-button>
            <!-- Assigned 状态：In-Transit -->
            <el-button
              v-if="!isViewFlag(form) && form.status == ShipmentOrderStatus.Assigned.toString()"
              :loading="buttonLoading"
              type="primary"
              @click="toInTransitForm"
            >
              In-Transit
            </el-button>
            <!-- 关闭按钮 -->
            <el-button @click="cancel">{{ isViewFlag(form) ? 'Close' : 'Cancel' }}</el-button>
          </div>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup name="ShipmentOrderApprovalForm" lang="ts">
import { getShipmentOrder, updateShipmentOrder } from '@/api/demo/shipmentOrder';
import { ShipmentOrderForm } from '@/api/demo/shipmentOrder/types';
import { getColumnWidth } from '@/utils/utils';
import { ShipmentOrderStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { batch_type } = toRefs<any>(proxy?.useDict('batch_type'));

const pageLoading = ref(false);
const buttonLoading = ref(false);
const shipmentOrderFormRef = ref<ElFormInstance>();

// Shipment batch link table
const shipmentBatchLinks = ref<any[]>([]);
const shipmentBatchLoading = ref(false);

const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isApprove = computed(() => route.path.endsWith('/approve') || route.path.includes('/approve/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

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

const form = ref<ShipmentOrderForm>({ ...initFormData });

const rules = {
  shipmentId: [{ required: true, message: 'Unique shipment identifier cannot be empty', trigger: 'blur' }],
  status: [{ required: true, message: 'Created=0,Planned=1,In-Transit=2,Delivered=3 cannot be empty', trigger: 'change' }]
};

/** Load record for detail/approve mode */
const loadRecord = async () => {
  if (!id.value) {
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
  } finally {
    pageLoading.value = false;
  }
};

/** Cancel / Close Button */
const cancel = () => {
  router.push(listPath.value);
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
      router.push({ path: listPath.value, query: { refresh: '1' } });
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
      router.push({ path: listPath.value, query: { refresh: '1' } });
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
      router.push({ path: listPath.value, query: { refresh: '1' } });
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
/* entity inputs use full content width */
.shipment-order-form :deep(.el-form-item__content) {
  min-width: 0;
}
.shipment-order-form .entity-field-input {
  width: 100%;
}
</style>
