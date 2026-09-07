<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
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
            <el-form-item label="Provider Id" prop="providerId">
              <el-select
                v-model="queryParams.providerId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="providerIdRemoteMethod"
                :loading="providerIdLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in providerIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Vehicle Registration Plate" prop="plateNumber">
              <el-select
                v-model="queryParams.plateNumber"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="plateNumberRemoteMethod"
                :loading="plateNumberLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in plateNumberOptions" :key="item.value" :label="item.label" :value="item.value" />
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
          <el-col :span="1.5" style="margin-left: auto; margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" border stripe fit :data="vehicleList" @selection-change="handleSelectionChange">
        <el-table-column label="Vehicle Id" align="center" prop="vehicleId" v-if="true" :min-width="getColumnWidth('Vehicle Id')" />
        <el-table-column label="Provider Id" align="center" prop="providerId" :min-width="getColumnWidth('Provider Id')" />
        <el-table-column
          label="Vehicle Registration Plate"
          align="center"
          prop="plateNumber"
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
        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')">
          <template #default="scope">
            <el-tag>{{ VehicleInfoStatus[scope.row.status as VehicleInfoStatus] }}</el-tag>
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
        <el-table-column label="Action" align="center" fixed="right" class-name="action-column" :width="actionColumnWidth">
          <template #default="scope">
            <el-button v-if="isViewFlag(scope.row)" class="table-action-btn table-check-btn" icon="View" @click="handleView(scope.row)"
              >View</el-button
            >
            <template v-else>
              <el-button class="table-action-btn table-edit-btn" icon="EditPen" @click="handleUpdate(scope.row)">Edit</el-button>
              <el-button class="table-action-btn table-delete-btn" icon="Delete" @click="handleDelete(scope.row)">Delete</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改车辆主对话框 -->
  </div>
</template>

<script setup name="Vehicle" lang="ts">
import { listLogisticsProvider } from '@/api/demo/logisticsProvider';
import { LogisticsProviderVO } from '@/api/demo/logisticsProvider/types';
import { listVehicle, getVehicle, delVehicle, addVehicle, updateVehicle } from '@/api/demo/vehicle';
import { VehicleVO, VehicleQuery, VehicleForm } from '@/api/demo/vehicle/types';
import { VehicleInfoStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { vehicle_type, cold_chain_capable } = toRefs<any>(proxy?.useDict('vehicle_type', 'cold_chain_capable'));

const vehicleList = ref<VehicleVO[]>([]);
const vehicleAllList = ref<VehicleVO[]>([]);
const logisticsProviderList = ref<LogisticsProviderVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const actionColumnWidth = computed(() => {
  const hasTwoButtons = vehicleList.value.some((row) => !isViewFlag(row));
  return hasTwoButtons ? 210 : 110;
});

const queryFormRef = ref<ElFormInstance>();
const vehicleFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: VehicleForm = {
  vehicleId: undefined,
  providerId: undefined,
  plateNumber: undefined,
  vehicleType: undefined,
  coldChainCapable: undefined,
  status: VehicleInfoStatus.Draft.toString()
};
const data = reactive<PageData<VehicleForm, VehicleQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    vehicleId: undefined,
    providerId: undefined,
    plateNumber: undefined,
    vehicleType: undefined,
    coldChainCapable: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    providerId: [{ required: true, message: 'Provider Id cannot be empty', trigger: 'blur' }],
    plateNumber: [{ required: true, message: 'Vehicle Registration Plate cannot be empty', trigger: 'blur' }],
    vehicleType: [{ required: true, message: 'Vehicle Type cannot be empty', trigger: 'change' }],
    coldChainCapable: [{ required: true, message: 'Cold Chain Capability cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const vehicleIdOptions = ref([]);
const vehicleIdList = ref([]);
const vehicleIdLoading = ref(false);
const vehicleIdRemoteMethod = async (query: string) => {
  if (query) {
    await listVehicle();
    vehicleIdList.value = vehicleAllList.value
      .filter((f) => f.vehicleId.toString().toLowerCase().includes(query.toLowerCase()))
      .map((item) => item.vehicleId);
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

const providerIdOptions = ref([]);
const providerIdList = ref([]);
const providerIdLoading = ref(false);
const providerIdRemoteMethod = async (query: string) => {
  if (query) {
    providerIdList.value = [
      ...new Set(
        vehicleAllList.value.filter((f) => f.providerId.toString().toLowerCase().includes(query.toLowerCase())).map((item) => item.providerId)
      )
    ];
    providerIdLoading.value = true;
    providerIdOptions.value = providerIdList.value.map((item) => ({
      value: item,
      label: item
    }));
    providerIdLoading.value = false;
  } else {
    providerIdOptions.value = [];
  }
};

const plateNumberOptions = ref([]);
const plateNumberList = ref([]);
const plateNumberLoading = ref(false);
const plateNumberRemoteMethod = async (query: string) => {
  if (query) {
    plateNumberList.value = [
      ...new Set(
        vehicleAllList.value.filter((f) => f.plateNumber.toString().toLowerCase().includes(query.toLowerCase())).map((item) => item.plateNumber)
      )
    ];
    plateNumberLoading.value = true;
    plateNumberOptions.value = plateNumberList.value.map((item) => ({
      value: item,
      label: item
    }));
    plateNumberLoading.value = false;
  } else {
    plateNumberOptions.value = [];
  }
};

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

/** 查询车辆主列表 */
const getList = async () => {
  loading.value = true;
  const res = await listVehicle(queryParams.value);
  vehicleList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 查询车辆主列表 */
const getAllList = async () => {
  loading.value = true;
  const res = await listVehicle();
  vehicleAllList.value = res.rows;
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
  vehicleFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: VehicleVO[]) => {
  ids.value = selection.map((item) => item.vehicleId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

const dialogAction = ref('');

const isShow = computed(() => {
  return dialogAction.value !== 'add';
});

/** 新增按钮操作 */
const handleAdd = () => {
  router.push({ name: 'VehicleAdd' });
};

/** 查看按钮操作 */
const handleView = (row?: VehicleVO) => {
  const _vehicleId = row?.vehicleId || ids.value[0];
  router.push({ name: 'VehicleDetail', params: { id: _vehicleId } });
};

/** 修改按钮操作 */
const handleUpdate = (row?: VehicleVO) => {
  const _vehicleId = row?.vehicleId || ids.value[0];
  router.push({ name: 'VehicleEdit', params: { id: _vehicleId } });
};

/** 提交按钮 */
const submitForm = () => {
  vehicleFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = VehicleInfoStatus.Draft.toString();
      if (form.value.vehicleId) {
        await updateVehicle(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addVehicle(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      dialog.visible = false;
      await getList();
      await getAllList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: VehicleVO) => {
  const _vehicleIds = row?.vehicleId || ids.value;
  await proxy?.$modal.confirm('Are you sure delete this data?').finally(() => (loading.value = false));
  await delVehicle(_vehicleIds);
  proxy?.$modal.msgSuccess('success');
  await getList();
  await getAllList();
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

const isViewFlag = (data) => {
  return data.status == VehicleInfoStatus.Approved || data.status == VehicleInfoStatus.Rejected;
};
</script>
