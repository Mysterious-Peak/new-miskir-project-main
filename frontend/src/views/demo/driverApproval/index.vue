<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
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

            <el-form-item label="Driver license number" prop="licenseNumber">
              <el-select
                v-model="queryParams.licenseNumber"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="licenseNumberRemoteMethod"
                :loading="licenseNumberLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in licenseNumberOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>

            <!-- <el-form-item label="Contact phone number" prop="phoneNumber">
              <el-select
                v-model="queryParams.phoneNumber"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="phoneNumberRemoteMethod"
                :loading="phoneNumberLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in phoneNumberOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
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
        </el-row>
      </template>

      <el-table v-loading="loading" border stripe fit :data="driverList" @selection-change="handleSelectionChange">
        <el-table-column label="Driver Id" align="center" prop="driverId" v-if="true" :min-width="getColumnWidth('Driver Id')" />
        <el-table-column label="Provider Id" align="center" prop="providerId" :min-width="getColumnWidth('Provider Id')" />
        <el-table-column label="Driver license number" align="center" prop="licenseNumber" :min-width="getColumnWidth('Driver license number')" />
        <el-table-column label="Contact phone number" align="center" prop="phoneNumber" :min-width="getColumnWidth('Contact phone number')" />

        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')">
          <template #default="scope">
            <el-tag>{{ DriverInfoStatus[scope.row.status as DriverInfoStatus] }}</el-tag>
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
        <el-table-column label="Action" align="center" fixed="right" class-name="action-column" width="110">
          <template #default="scope">
            <el-button
              v-if="scope.row.status != DriverInfoStatus.Draft.toString()"
              class="table-action-btn table-check-btn"
              icon="View"
              @click="router.push({ name: 'DriverApprovalDetail', params: { id: scope.row.driverId } })"
              >View</el-button
            >
            <el-button
              v-if="scope.row.status == DriverInfoStatus.Draft.toString()"
              class="table-action-btn table-edit-btn"
              icon="EditPen"
              @click="router.push({ name: 'DriverApprovalApprove', params: { id: scope.row.driverId } })"
              >Edit</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改司机主对话框 -->
  </div>
</template>

<script setup name="Driver Approval" lang="ts">
import { addDriver, delDriver, getDriver, listDriver, updateDriver } from '@/api/demo/driver';
import { DriverForm, DriverQuery, DriverVO } from '@/api/demo/driver/types';
import { DriverInfoStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const driverList = ref<DriverVO[]>([]);
const driverAllList = ref<DriverVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const driverFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: DriverForm = {
  driverId: undefined,
  providerId: undefined,
  licenseNumber: undefined,
  phoneNumber: undefined,
  status: undefined
};
const data = reactive<PageData<DriverForm, DriverQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    driverId: undefined,
    providerId: undefined,
    licenseNumber: undefined,
    phoneNumber: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    providerId: [{ required: true, message: 'Provider Id cannot be empty', trigger: 'blur' }],
    licenseNumber: [{ required: true, message: 'Driver license number cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const driverIdOptions = ref([]);
const driverIdList = ref([]);
const driverIdLoading = ref(false);
const driverIdRemoteMethod = async (query: string) => {
  if (query) {
    driverIdLoading.value = true;
    driverIdList.value = driverAllList.value
      .filter((f) => f.driverId.toString().toLowerCase().includes(query.toLowerCase()))
      .map((item) => item.driverId);
    driverIdOptions.value = driverIdList.value.map((item) => ({
      value: item,
      label: item
    }));
    driverIdLoading.value = false;
  } else {
    driverIdOptions.value = [];
  }
};

const providerIdOptions = ref([]);
const providerIdList = ref([]);
const providerIdLoading = ref(false);
const providerIdRemoteMethod = async (query: string) => {
  if (query) {
    providerIdLoading.value = true;
    providerIdList.value = [
      ...new Set(
        driverAllList.value.filter((f) => f.providerId.toString().toLowerCase().includes(query.toLowerCase())).map((item) => item.providerId)
      )
    ];
    providerIdOptions.value = providerIdList.value.map((item) => ({
      value: item,
      label: item
    }));
    providerIdLoading.value = false;
  } else {
    providerIdOptions.value = [];
  }
};

const licenseNumberOptions = ref([]);
const licenseNumberList = ref([]);
const licenseNumberLoading = ref(false);
const licenseNumberRemoteMethod = async (query: string) => {
  if (query) {
    licenseNumberLoading.value = true;
    licenseNumberList.value = [
      ...new Set(
        driverAllList.value.filter((f) => f.licenseNumber.toString().toLowerCase().includes(query.toLowerCase())).map((item) => item.licenseNumber)
      )
    ];
    licenseNumberOptions.value = licenseNumberList.value.map((item) => ({
      value: item,
      label: item
    }));
    licenseNumberLoading.value = false;
  } else {
    licenseNumberOptions.value = [];
  }
};

// const phoneNumberOptions = ref([]);
// const phoneNumberList = ref([]);
// const phoneNumberLoading = ref(false);
// const phoneNumberRemoteMethod = async (query: string) => {
//   if (query) {
//     phoneNumberList.value = driverList.value
//       .filter((f) => f.phoneNumber.toString().toLowerCase().includes(query.toLowerCase()))
//       .map((item) => item.phoneNumber);
//     phoneNumberLoading.value = true;
//     phoneNumberOptions.value = phoneNumberList.value.map((item) => ({
//       value: item,
//       label: item
//     }));
//     phoneNumberLoading.value = false;
//   } else {
//     phoneNumberOptions.value = [];
//   }
// };

/** 查询司机主列表 */
const getList = async () => {
  loading.value = true;
  const res = await listDriver(queryParams.value);
  driverList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 查询司机主列表 */
const getAllList = async () => {
  loading.value = true;
  const res = await listDriver();
  driverAllList.value = res.rows;
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
  driverFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: DriverVO[]) => {
  ids.value = selection.map((item) => item.driverId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 查看按钮操作 */
const handleView = async (row?: DriverVO) => {
  reset();
  const _driverId = row?.driverId || ids.value[0];
  const res = await getDriver(_driverId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = 'View Driver Info';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: DriverVO) => {
  reset();
  const _driverId = row?.driverId || ids.value[0];
  const res = await getDriver(_driverId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = 'Edit Driver Info';
};

/** 提交按钮 */
const submitForm = () => {
  driverFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = DriverInfoStatus.Approved.toString();

      if (form.value.driverId) {
        await updateDriver(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addDriver(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      dialog.visible = false;
      await getList();
    }
  });
};

const rejectForm = () => {
  driverFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = DriverInfoStatus.Rejected.toString();

      if (form.value.driverId) {
        await updateDriver(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addDriver(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      dialog.visible = false;
      await getList();
    }
  });
};

const revisionForm = () => {
  driverFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = DriverInfoStatus.NeedRevision.toString();

      if (form.value.driverId) {
        await updateDriver(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addDriver(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      dialog.visible = false;
      await getList();
    }
  });
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
</script>
