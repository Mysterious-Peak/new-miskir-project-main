<template>
  <div class="p-2">
    <el-card shadow="hover" class="mt-2" :body-style="{ padding: '16px 24px 8px' }">
      <div class="flex items-center" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px">
        <el-icon class="mr-1" color="#52c41a"><InfoFilled /></el-icon>
        <span class="font-semibold">Shipment Information</span>
      </div>
      <el-form :model="shipmentOrderForm" label-width="240px" label-position="right" class="w-full">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="Shipment Id">
              <el-input v-model="shipmentOrderForm.shipmentId" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Source entity">
              <el-input v-model="shipmentOrderForm.sourceEntity" disabled />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Destination entity">
              <el-input v-model="shipmentOrderForm.destinationEntity" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Planned dispatch time">
              <el-input v-model="shipmentOrderForm.plannedDispatch" disabled />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="Delivery deadline">
              <el-input v-model="shipmentOrderForm.deliveryDeadline" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Logistics Company">
              <el-input v-model="shipmentOrderForm.providerId" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Status">
              <el-input :value="ShipmentOrderStatus[shipmentOrderForm.status]" disabled />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    <!-- Batch Link Information -->
    <el-card shadow="hover" class="mt-2" :body-style="{ padding: '16px 24px 8px' }">
      <div class="flex items-center" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px">
        <el-icon class="mr-1" color="#52c41a"><InfoFilled /></el-icon>
        <span class="font-semibold">Batch Link Information</span>
      </div>
      <el-table :data="batchLinkList" border style="width: 100%">
        <el-table-column label="shipment_batch_link_id" prop="shipmentBatchLinkId" align="center" />
        <el-table-column label="finished_batch_id" prop="finishedBatchId" align="center" />
        <el-table-column label="quantity" prop="quantity" align="center" />
      </el-table>
    </el-card>

    <!-- Vehicle & Driver Information -->
    <el-card shadow="hover" class="mt-2" :body-style="{ padding: '16px 24px 8px' }">
      <div class="flex items-center" style="border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 16px">
        <el-icon class="mr-1" color="#52c41a"><InfoFilled /></el-icon>
        <span class="font-semibold">Vehicle &amp; Driver Information</span>
      </div>
      <el-form label-width="0" class="mb-2">
        <el-form-item label-width="0" v-if="isViewFlag()">
          <el-button type="primary" @click="openVehicleDialog" style="width: fit-content !important">Add Vehicle &amp; Driver</el-button>
        </el-form-item>
      </el-form>
      <!-- 车辆与司机行内表单（原 600px 弹窗改页内展开/收起） -->
      <div v-show="vehicleDialogVisible" class="vehicle-dialog-form-wrap">
        <el-form ref="vehicleDialogFormRef" :model="vehicleDialogForm" :rules="vehicleDialogRules" label-width="auto">
          <el-form-item label="Trip Id" prop="tripId" v-show="isShow">
            <el-input v-model="vehicleDialogForm.tripId" placeholder="Please input" disabled />
          </el-form-item>
          <el-form-item label="Vehicle Id" prop="vehicleId">
            <el-select
              v-model="vehicleDialogForm.vehicleId"
              filterable
              remote
              reserve-keyword
              placeholder="Please input"
              :remote-method="vehicleIdRemoteMethod"
              :loading="vehicleIdLoading"
              :debounce="300"
              clearable
              @change="onVehicleIdChange"
              v-if="isViewFlag()"
            >
              <el-option v-for="item in vehicleIdOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-input v-else v-model="vehicleDialogForm.vehicleId" placeholder="Please input" disabled />
          </el-form-item>
          <el-form-item label="Driver Id" prop="driverId">
            <el-select
              v-model="vehicleDialogForm.driverId"
              filterable
              remote
              reserve-keyword
              placeholder="Please input"
              :remote-method="driverIdRemoteMethod"
              :loading="driverIdLoading"
              :debounce="300"
              clearable
              @change="onDriverIdChange"
              v-if="isViewFlag()"
            >
              <el-option v-for="item in driverIdOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-input v-else v-model="vehicleDialogForm.driverId" placeholder="Please input" disabled />
          </el-form-item>
          <el-form-item label="Trip start time" prop="startTime">
            <el-date-picker
              clearable
              v-model="vehicleDialogForm.startTime"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="Please select"
              :disabled="!isViewFlag()"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="Trip end time" prop="endTime">
            <el-date-picker
              clearable
              v-model="vehicleDialogForm.endTime"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              placeholder="Please select"
              :disabled="!isViewFlag()"
            >
            </el-date-picker>
          </el-form-item>
        </el-form>
        <div class="form-footer">
          <el-button type="primary" @click="handleVehicleDialogConfirm" v-if="isViewFlag()">Save</el-button>
          <el-button @click="handleVehicleDialogCancel" v-if="isViewFlag()">Cancel</el-button>
          <el-button @click="cancel" v-if="!isViewFlag()">Close</el-button>
        </div>
      </div>
      <el-table v-loading="loading" :data="vehicleList" stripe fit border>
        <el-table-column label="Trip Id" prop="tripId" align="center" :min-width="getColumnWidth('Trip Id')" />
        <el-table-column label="Vehicle Id" prop="vehicleId" align="center" :min-width="getColumnWidth('Vehicle Id')" />
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
        <el-table-column label="Cold Chain Capability" align="center" prop="coldChainCapable" :min-width="getColumnWidth('Cold Chain Capability')">
          <template #default="scope">
            <dict-tag :options="cold_chain_capable" :value="scope.row.coldChainCapable" />
          </template>
        </el-table-column>
        <el-table-column label="Driver Id" prop="driverId" align="center" :min-width="getColumnWidth('Driver Id')" />
        <el-table-column label="Driver license number" prop="licenseNumber" align="center" :min-width="getColumnWidth('Driver license number')" />
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
        <el-table-column label="Action" align="center" fixed="right" class-name="small-padding fixed-width" width="100">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top" v-if="isViewFlag()">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top" v-if="isViewFlag()">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="View" placement="top" v-if="!isViewFlag()">
              <el-button link type="primary" icon="View" @click="handleView(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Action Buttons -->
    <el-card shadow="hover" class="mt-2 mb-2" :body-style="{ padding: '12px 24px' }" v-if="isViewFlag()">
      <div class="dialog-footer" style="text-align: center">
        <el-button type="primary" @click="handleSave">Confirm</el-button>
        <el-button @click="handleCancel">Cancel</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="TripAssignment" lang="ts">
import { listDriver } from '@/api/demo/driver';
import { getShipmentOrderBatch, updateShipmentOrder } from '@/api/demo/shipmentOrder';
import type { ShipmentOrderBatchLinkVO, ShipmentOrderForm } from '@/api/demo/shipmentOrder/types';
import { addTrip, delTrip, getTrip, getTripByShipmentOrder, updateTrip } from '@/api/demo/trip';
import { TripVO } from '@/api/demo/trip/types';
import { listVehicle } from '@/api/demo/vehicle';
import { DriverInfoStatus, ShipmentOrderStatus, VehicleInfoStatus } from '@/enums/AgriculturalEnum';
import { parseTime } from '@/utils/ruoyi';
import { getColumnWidth } from '@/utils/utils';
import { InfoFilled } from '@element-plus/icons-vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { vehicle_type, cold_chain_capable } = toRefs<any>(proxy?.useDict('vehicle_type', 'cold_chain_capable'));
const buttonLoading = ref(false);
const loading = ref(true);

const initialFormData = {
  tripId: undefined,
  shipmentId: undefined,
  vehicleId: undefined,
  plateNumber: undefined,
  vehicleType: undefined,
  coldChainCapable: undefined,
  driverId: undefined,
  licenseNumber: undefined,
  phoneNumber: undefined,
  startTime: undefined,
  endTime: undefined
};

// Shipment Information
const shipmentOrderForm = ref<ShipmentOrderForm>({
  shipmentId: undefined,
  sourceEntity: undefined,
  destinationEntity: undefined,
  plannedDispatch: undefined,
  deliveryDeadline: undefined,
  status: undefined,
  approvedBy: undefined,
  logisticsCompany: undefined,
  approvedComment: undefined,
  approvedAt: undefined
});

// Batch Link Information
const batchLinkList = ref<ShipmentOrderBatchLinkVO[]>([]);

// 车辆与司机信息表格数据
const vehicleList = ref<any[]>([]);

// 车辆与司机弹窗表单 & 校验
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});
// 页内行内表单展开/收起（原弹窗）
const vehicleDialogVisible = ref(false);

const vehicleDialogFormRef = ref<ElFormInstance>();
const vehicleDialogForm = ref({ ...initialFormData });

const vehicleDialogRules = {
  vehicleId: [{ required: true, message: 'Vehicle Id cannot be empty', trigger: 'blur' }],
  driverId: [{ required: true, message: 'Driver Id cannot be empty', trigger: 'blur' }]
};

// 弹窗：确认
const handleVehicleDialogConfirm = () => {
  vehicleDialogFormRef.value?.validate(async (valid) => {
    if (!valid) return;
    vehicleDialogForm.value.shipmentId = shipmentOrderForm.value.shipmentId;

    if (vehicleDialogForm.value.tripId) {
      await updateTrip(vehicleDialogForm.value).finally(() => (buttonLoading.value = false));
    } else {
      await addTrip(vehicleDialogForm.value).finally(() => (buttonLoading.value = false));
    }
    vehicleDialogVisible.value = false;
    await getTripInfo(vehicleDialogForm.value.shipmentId);
  });
};
// 弹窗：取消
const handleVehicleDialogCancel = () => {
  vehicleDialogVisible.value = false;
};

const dialogAction = ref('');
const isShow = computed(() => {
  return dialogAction.value !== 'add';
});

const vehicleRows = ref<any[]>([]);
const driverRows = ref<any[]>([]);

const loadApprovedVehiclesAndDrivers = async () => {
  const providerId = shipmentOrderForm.value.providerId;
  if (providerId == null || providerId === '') {
    vehicleRows.value = [];
    driverRows.value = [];
    return;
  }
  try {
    vehicleIdLoading.value = true;
    driverIdLoading.value = true;
    const [vehicleRes, driverRes] = await Promise.all([
      listVehicle({
        providerId,
        status: VehicleInfoStatus.Approved.toString(),
        pageNum: null,
        pageSize: null
      }),
      listDriver({
        providerId,
        status: DriverInfoStatus.Approved.toString(),
        pageNum: null,
        pageSize: null
      })
    ]);
    vehicleRows.value = vehicleRes.rows || [];
    driverRows.value = driverRes.rows || [];
  } finally {
    vehicleIdLoading.value = false;
    driverIdLoading.value = false;
  }
};

const openVehicleDialog = async () => {
  reset();
  vehicleDialogVisible.value = true;
  dialog.title = 'Add Vehicle & Driver Info';
  dialogAction.value = 'add';
  await loadApprovedVehiclesAndDrivers();
};

const vehicleIdOptions = ref<{ value: string | number; label: string | number }[]>([]);
const vehicleIdLoading = ref(false);
const vehicleIdRemoteMethod = async (query: string) => {
  if (query) {
    vehicleIdLoading.value = true;
    vehicleIdOptions.value = (vehicleRows.value ?? [])
      .filter((f) => f.vehicleId?.toString().toLowerCase().includes(query.toLowerCase()))
      .map((item) => ({
        value: item.vehicleId,
        label: `${item.vehicleId}`
      }));
    vehicleIdLoading.value = false;
  } else {
    vehicleIdOptions.value = [];
  }
};

const driverIdOptions = ref<{ value: string | number; label: string | number }[]>([]);
const driverIdLoading = ref(false);
const driverIdRemoteMethod = async (query: string) => {
  if (query) {
    driverIdLoading.value = true;
    driverIdOptions.value = (driverRows.value ?? [])
      .filter((f: any) => f.driverId?.toString().toLowerCase().includes(query.toLowerCase()))
      .map((item: any) => ({
        value: item.driverId,
        label: `${item.driverId}`
      }));
    driverIdLoading.value = false;
  } else {
    driverIdOptions.value = [];
  }
};

/** 修改按钮操作 */
const handleUpdate = async (row?: TripVO) => {
  reset();
  const _tripId = row?.tripId;
  const res = await getTrip(_tripId);
  Object.assign(vehicleDialogForm.value, res.data);
  await loadApprovedVehiclesAndDrivers();
  vehicleDialogVisible.value = true;
  dialog.title = 'Edit Vehicle & Driver Info';
  dialogAction.value = 'edit';
};

/** 删除按钮操作 */
const handleDelete = async (row?: TripVO) => {
  const _tripIds = row?.tripId;
  await proxy?.$modal.confirm('Are you sure delete this data?').finally(() => (loading.value = false));
  await delTrip(_tripIds);
  proxy?.$modal.msgSuccess('success');
  await getTripInfo(shipmentOrderForm.value.shipmentId);
};

/** 查看按钮操作 */
const handleView = async (row?: TripVO) => {
  reset();
  const _tripIds = row?.tripId;
  const res = await getTrip(_tripIds);
  Object.assign(vehicleDialogForm.value, res.data);
  vehicleDialogVisible.value = true;
  dialog.title = 'View Vehicle & Driver Info';
  dialogAction.value = 'view';
};

onMounted(async () => {
  nextTick(async () => {
    const shipmentId = proxy.$route.query.shipmentId as string;
    if (!shipmentId) return;

    const { data: shipmentOrderBatchInfo } = await getShipmentOrderBatch(shipmentId);
    shipmentOrderForm.value = shipmentOrderBatchInfo;
    batchLinkList.value = shipmentOrderBatchInfo.batchLinks || [];

    getTripInfo(shipmentId);
  });
});

onActivated(() => {
  if (proxy.$route.query.refresh === '1') {
    const shipmentId = proxy.$route.query.shipmentId as string;
    if (!shipmentId) return;
    getShipmentOrderBatch(shipmentId).then(({ data: shipmentOrderBatchInfo }) => {
      shipmentOrderForm.value = shipmentOrderBatchInfo;
      batchLinkList.value = shipmentOrderBatchInfo.batchLinks || [];
      getTripInfo(shipmentId);
    });
  }
});

const onVehicleIdChange = (value) => {
  (vehicleRows.value ?? []).find((v) => {
    if (v.vehicleId === value) {
      vehicleDialogForm.value.vehicleId = v.vehicleId;
      vehicleDialogForm.value.plateNumber = v.plateNumber;
      vehicleDialogForm.value.vehicleType = v.vehicleType;
      vehicleDialogForm.value.coldChainCapable = v.coldChainCapable;
      return true;
    }
    return false;
  });
};

const onDriverIdChange = (value) => {
  (driverRows.value ?? []).find((v) => {
    if (v.driverId === value) {
      vehicleDialogForm.value.driverId = v.driverId;
      vehicleDialogForm.value.licenseNumber = v.licenseNumber;
      vehicleDialogForm.value.phoneNumber = v.phoneNumber;
      return true;
    }
    return false;
  });
};

// 初始化车辆与司机信息表格
const getTripInfo = async (shipmentId) => {
  loading.value = true;
  const res = await getTripByShipmentOrder(shipmentId);
  vehicleList.value = res.data || [];
  loading.value = false;
};

/** 表单重置 */
const reset = () => {
  vehicleDialogForm.value = { ...initialFormData };
  vehicleDialogFormRef.value?.resetFields();
};

// 确认按钮
const handleSave = async () => {
  if (!vehicleList.value || vehicleList.value.length === 0) {
    proxy?.$modal.alertError('no Vehicle & Driver Information can not confirm');
    return;
  }
  buttonLoading.value = true;
  try {
    shipmentOrderForm.value.status = ShipmentOrderStatus.Assigned.toString();
    if (shipmentOrderForm.value.shipmentId) {
      await updateShipmentOrder(shipmentOrderForm.value);
    }
    proxy?.$modal.msgSuccess('success');
    handleCancel();
  } finally {
    buttonLoading.value = false;
  }
};

// 取消按钮
const handleCancel = () => {
  proxy.$tab.closePage(proxy.$route);
  proxy.$router.go(-1);
};

/** 取消按钮 */
const cancel = () => {
  reset();
  vehicleDialogVisible.value = false;
};

const isViewFlag = () => {
  return shipmentOrderForm.value.status === ShipmentOrderStatus.Planned.toString();
};
</script>

<style scoped>
.vehicle-dialog-form-wrap {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 16px 16px 4px;
  margin-bottom: 16px;
  background: #fafafa;
}

.form-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 0;
}
</style>
