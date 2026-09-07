<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="auto">
            <el-form-item label="Trip Id" prop="tripId">
              <el-select
                v-model="queryParams.tripId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="tripIdRemoteMethod"
                :loading="tripIdLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in tripIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>

            <el-form-item label="Shipment Order" prop="shipmentId">
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

            <el-form-item label="Vehicle Id" prop="vehicleId">
              <el-select
                v-model="queryParams.vehicleId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="vehicleIdRemoteMethod"
                :loading="vehicleIdLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in vehicleIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>

            <el-form-item label="Driver Id" prop="driverId">
              <el-select
                v-model="queryParams.driverId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="driverIdRemoteMethod"
                :loading="driverIdLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in driverIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>

            <el-form-item>
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
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border stripe fit :data="tripList" @selection-change="handleSelectionChange">
        <el-table-column label="Trip Id" align="center" prop="tripId" v-if="true" :min-width="getColumnWidth('Trip Id')" />
        <el-table-column label="Shipment Order" align="center" prop="shipmentId" :min-width="getColumnWidth('Shipment order')" />
        <el-table-column label="Vehicle Id" align="center" prop="vehicleId" :min-width="getColumnWidth('Vehicle Id')" />
        <el-table-column label="Driver Id" align="center" prop="driverId" :min-width="getColumnWidth('Driver Id')" />
        <el-table-column label="Trip start time" align="center" prop="startTime" width="180" :min-width="getColumnWidth('Trip start time')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Trip end time" align="center" prop="endTime" width="180" :min-width="getColumnWidth('Trip end time')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Created By" align="center" prop="createdUserName" :min-width="getColumnWidth('Created By')" />
        <el-table-column label="Create Date" align="center" prop="createTime" width="180" :min-width="getColumnWidth('Create Date')">
          <template #default="scope">
            <span v-if="isNew(scope.row.createTime)" class="font-black">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            <span v-else>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Action" align="center" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="Edit" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- <el-table v-loading="loading" :data="shipmentOrderList" @selection-change="handleSelectionChange" stripe fit border>
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column
          label="Unique shipment identifier"
          align="center"
          prop="shipmentId"
          v-if="true"
          :min-width="getColumnWidth('Unique shipment identifier')"
        />
        <el-table-column
          label="Source warehouse or processor"
          align="center"
          prop="sourceEntity"
          :min-width="getColumnWidth('Source warehouse or processor')"
        />
        <el-table-column label="Destination location" align="center" prop="destinationEntity" :min-width="getColumnWidth('Destination location')" />
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
        <el-table-column
          label="Logistics supervisor user ID"
          align="center"
          prop="approvedBy"
          :min-width="getColumnWidth('Logistics supervisor user ID')"
        />
        <el-table-column label="Created By" align="center" prop="createdUserName" :min-width="getColumnWidth('Created By')" />
        <el-table-column label="Create Date" align="center" prop="createTime" :min-width="getColumnWidth('Create Date')">
          <template #default="scope">
            <span v-if="isNew(scope.row.createTime)" class="font-black">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            <span v-else>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approved By" align="center" prop="approvedUserName" :min-width="getColumnWidth('Approved By')" />
        <el-table-column label="Approval Comment" align="center" prop="approvedComment" :min-width="getColumnWidth('Approval Comment')" />
        <el-table-column label="Approval date" align="center" prop="approvedAt" :min-width="getColumnWidth('Approval date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.approvedAt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')">
          <template #default="scope">
            <el-tag>{{ ShipmentOrderStatus[scope.row.status as ShipmentOrderStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="View" placement="top" v-if="isViewFlag(scope.row)">
              <el-button link type="primary" icon="View" @click="handleUpdate(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip content="Edit" placement="top" v-if="!isViewFlag(scope.row)">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['demo:shipmentOrder:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top" v-if="!isViewFlag(scope.row)">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['demo:shipmentOrder:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table> -->

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改运输行程对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="tripFormRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="Trip Id" prop="tripId" v-show="isShow">
          <el-input v-model="form.tripId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Shipment Order" prop="shipmentId">
          <el-select
            v-model="form.shipmentId"
            filterable
            remote
            reserve-keyword
            placeholder="Please input"
            :remote-method="shipmentIdPopRemoteMethod"
            :loading="shipmentIdPopLoading"
            :debounce="300"
            clearable
          >
            <el-option v-for="item in shipmentIdPopOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="Vehicle Id" prop="vehicleId">
          <el-input v-model="form.vehicleId" placeholder="Please input" clearable />
        </el-form-item>
        <el-form-item label="Driver Id" prop="driverId">
          <el-input v-model="form.driverId" placeholder="Please input" clearable />
        </el-form-item>
        <el-form-item label="Trip start time" prop="startTime">
          <el-date-picker clearable v-model="form.startTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select">
          </el-date-picker>
        </el-form-item>
        <!-- TODO -->
        <el-form-item label="Trip end time" prop="endTime">
          <el-date-picker clearable v-model="form.endTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">Save</el-button>
          <el-button @click="cancel">Cancel</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Trip" lang="ts">
import { listShipmentOrder } from '@/api/demo/shipmentOrder';
import { ShipmentOrderVO } from '@/api/demo/shipmentOrder/types';
import { listTrip, getTrip, delTrip, addTrip, updateTrip } from '@/api/demo/trip';
import { TripVO, TripQuery, TripForm } from '@/api/demo/trip/types';
import { isNew } from '@/utils/FarmTools';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tripList = ref<TripVO[]>([]);
const tripAllList = ref<TripVO[]>([]);
const shipmentOrderlist = ref<ShipmentOrderVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const tripFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: TripForm = {
  tripId: undefined,
  shipmentId: undefined,
  vehicleId: undefined,
  driverId: undefined,
  startTime: undefined,
  endTime: undefined
};
const data = reactive<PageData<TripForm, TripQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tripId: undefined,
    shipmentId: undefined,
    vehicleId: undefined,
    driverId: undefined,
    startTime: undefined,
    endTime: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    shipmentId: [{ required: true, message: 'Shipment order cannot be empty', trigger: 'blur' }],
    vehicleId: [{ required: true, message: 'Vehicle Id cannot be empty', trigger: 'blur' }],
    driverId: [{ required: true, message: 'Driver Id cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const tripIdOptions = ref([]);
const tripIdList = ref([]);
const tripIdLoading = ref(false);
const tripIdRemoteMethod = async (query: string) => {
  if (query) {
    tripIdLoading.value = true;
    tripIdList.value = tripAllList.value.filter((f) => f.tripId.toString().toLowerCase().includes(query.toLowerCase())).map((item) => item.tripId);
    tripIdOptions.value = tripIdList.value.map((item) => ({
      value: item,
      label: item
    }));
    tripIdLoading.value = false;
  } else {
    tripIdOptions.value = [];
  }
};

const shipmentIdOptions = ref([]);
const shipmentIdList = ref([]);
const shipmentIdLoading = ref(false);
const shipmentIdRemoteMethod = async (query: string) => {
  if (query) {
    shipmentIdList.value = [
      ...new Set(tripAllList.value.filter((f) => f.shipmentId.toString().toLowerCase().includes(query.toLowerCase())).map((item) => item.shipmentId))
    ];

    shipmentIdLoading.value = true;
    shipmentIdOptions.value = shipmentIdList.value.map((item) => ({
      value: item,
      label: item
    }));
    shipmentIdLoading.value = false;
  } else {
    shipmentIdOptions.value = [];
  }
};

const vehicleIdOptions = ref([]);
const vehicleIdList = ref([]);
const vehicleIdLoading = ref(false);
const vehicleIdRemoteMethod = async (query: string) => {
  if (query) {
    vehicleIdList.value = [
      ...new Set(tripAllList.value.filter((f) => f.vehicleId.toString().toLowerCase().includes(query.toLowerCase())).map((item) => item.vehicleId))
    ];

    vehicleIdLoading.value = true;
    vehicleIdOptions.value = vehicleIdList.value.map((item) => ({
      value: item,
      label: item
    }));
    vehicleIdLoading.value = false;
  } else {
    vehicleIdOptions.value = [];
  }
};

const driverIdOptions = ref([]);
const driverIdList = ref([]);
const driverIdLoading = ref(false);
const driverIdRemoteMethod = async (query: string) => {
  if (query) {
    driverIdList.value = [
      ...new Set(tripAllList.value.filter((f) => f.driverId.toString().toLowerCase().includes(query.toLowerCase())).map((item) => item.driverId))
    ];
    driverIdLoading.value = true;
    driverIdOptions.value = driverIdList.value.map((item) => ({
      value: item,
      label: item
    }));
    driverIdLoading.value = false;
  } else {
    driverIdOptions.value = [];
  }
};

const shipmentIdPopOptions = ref([]);
const shipmentIdPopLoading = ref(false);
const shipmentIdPopRemoteMethod = async (query: string) => {
  if (query) {
    shipmentIdPopLoading.value = true;
    shipmentIdPopOptions.value = shipmentOrderlist.value
      .filter((f) => f.shipmentId.toString().toLowerCase().includes(query.toLowerCase()))
      .map((item) => ({
        value: item.shipmentId,
        label: `${item.shipmentId}`
      }));

    shipmentIdPopLoading.value = false;
  } else {
    shipmentIdPopOptions.value = [];
  }
};

/** 查询运输行程列表 */
const getList = async () => {
  loading.value = true;
  const res = await listTrip(queryParams.value);
  tripList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 查询运输行程列表 */
const getAllList = async () => {
  loading.value = true;
  const res = await listTrip();
  tripAllList.value = res.rows;
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
  tripFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: TripVO[]) => {
  ids.value = selection.map((item) => item.tripId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

const dialogAction = ref('');

const isShow = computed(() => {
  return dialogAction.value !== 'add';
});

/** 新增按钮操作 */
const handleAdd = async () => {
  reset();
  dialog.visible = true;
  dialog.title = 'Add Trip Info';
  dialogAction.value = 'add';
  // TODO 获取所有的运输订单
  const res = await listShipmentOrder();
  shipmentOrderlist.value = res.rows;
};

/** 修改按钮操作 */
const handleUpdate = async (row?: TripVO) => {
  reset();
  const _tripId = row?.tripId || ids.value[0];
  const res = await getTrip(_tripId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = 'Edit Trip Info';
  dialogAction.value = 'edit';
};

/** 提交按钮 */
const submitForm = () => {
  tripFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.tripId) {
        await updateTrip(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addTrip(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      dialog.visible = false;
      await getList();
      await getAllList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: TripVO) => {
  const _tripIds = row?.tripId || ids.value;
  await proxy?.$modal.confirm('Are you sure delete this data?').finally(() => (loading.value = false));
  await delTrip(_tripIds);
  proxy?.$modal.msgSuccess('success');
  await getList();
  await getAllList();
};

onMounted(() => {
  getList();
  getAllList();
});
</script>
