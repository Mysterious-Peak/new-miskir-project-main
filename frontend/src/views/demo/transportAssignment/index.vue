<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <!-- <el-form-item label="Transport Task ID" prop="transportId">
              <el-input v-model="queryParams.transportId" placeholder="Please enter Transport Task ID" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <el-form-item label="Transport Task ID" prop="transportId">
              <el-select
                v-model="queryParams.transportId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="DispatchRemoteMethod"
                :loading="DispatchLoading"
                :debounce="300"
              >
                <el-option v-for="item in DispatchOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Batch ID" prop="batchId">
              <!-- <el-input v-model="queryParams.farmerId" placeholder="Please enter Farmer ID" clearable @keyup.enter="handleQuery" /> -->
              <el-select
                v-model="queryParams.batchId"
                filterable
                remote
                clearable
                reserve-keyword
                placeholder="Please input"
                :remote-method="batchIdFilterdRemoteMethod"
                :loading="batchIdFilterLoading"
                :debounce="300"
              >
                <el-option v-for="item in batchIdFilterOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="Transporter ID" prop="transporterId">
              <el-select
                v-model="form.transporterId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="TransporterRemoteMethod"
                :loading="TransporterLoading"
                :debounce="300"
              >
                <el-option v-for="item in TransporterOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item> -->
            <!-- <el-form-item label="From Location" prop="fromLocation">
              <el-input v-model="queryParams.fromLocation" placeholder="Please enter From Location" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="To Location" prop="toLocation">
              <el-input v-model="queryParams.toLocation" placeholder="Please enter To Location" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Scheduled Date" prop="scheduledDate">
              <el-date-picker
                clearable
                v-model="queryParams.scheduledDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Please select Scheduled Date"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item label="Actual Departure" prop="actualDeparture">
              <el-date-picker
                clearable
                v-model="queryParams.actualDeparture"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Please select Actual Departure"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item label="Actual Arrival" prop="actualArrival">
              <el-date-picker
                clearable
                v-model="queryParams.actualArrival"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Please select Actual Arrival"
              >
              </el-date-picker>
            </el-form-item>
            <el-form-item label="Approved By" prop="approvedBy">
              <el-input v-model="queryParams.approvedBy" placeholder="Please enter Approved By" clearable @keyup.enter="handleQuery" />
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
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['demo:transportAssignment:export']">Export</el-button>
          </el-col> --> 
          <!-- <el-col :span="1.5" style="margin-left: auto">
            <el-button
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete()"
              v-hasPermi="['demo:transportAssignment:remove']"
            >
              Delete
            </el-button>
          </el-col> -->
          <el-col :span="1.5" style="margin-left: auto; margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:transportAssignment:add']">Add</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="transportAssignmentList" @selection-change="handleSelectionChange" stripe fit border>
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="ID" align="center" prop="id" v-if="true" :min-width="getColumnWidth('ID')" />
        <el-table-column label="Transport Task ID" align="center" prop="transportId" :min-width="getColumnWidth('Transport Task ID')" />
        <el-table-column label="Batch ID" align="center" prop="batchName" :min-width="getColumnWidth('Batch ID')" />
        <el-table-column label="Transporter ID" align="center" prop="transporterId" :min-width="getColumnWidth('Transporter ID')" />
        <el-table-column label="From Location" align="center" prop="fromLocation" :min-width="getColumnWidth('From Location')" />
        <el-table-column label="To Location" align="center" prop="toLocation" :min-width="getColumnWidth('To Location')" />
        <!-- <el-table-column label="Status" align="center" prop="status" /> -->
        <el-table-column label="Scheduled Date" align="center" prop="scheduledDate" :min-width="getColumnWidth('Scheduled Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.scheduledDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Actual Departure" align="center" prop="actualDeparture" :min-width="getColumnWidth('Actual Departure')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.actualDeparture, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Actual Arrival" align="center" prop="actualArrival" :min-width="getColumnWidth('Actual Arrival')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.actualArrival, '{y}-{m}-{d}') }}</span>
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
        <el-table-column label="Approved Date" align="center" prop="approvedAt" :min-width="getColumnWidth('Approved Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.approvedAt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approval Comment" align="center" prop="approvedComment" :min-width="getColumnWidth('Approval Comment')" />
        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')">
          <template #default="scope">
            <el-tag>{{ transportAssignmentStatus[scope.row.status as transportAssignmentStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Action" align="center" fixed="right" class-name="action-column" width="210">
          <template #default="scope">
            <el-button v-if="isViewFlag(scope.row)" class="table-action-btn table-check-btn" icon="View" @click="handleUpdate(scope.row)"
              >View</el-button
            >
            <el-button v-if="!isViewFlag(scope.row)" class="table-action-btn table-edit-btn" icon="EditPen" @click="handleUpdate(scope.row)"
              >Edit</el-button
            >
            <el-button v-if="!isViewFlag(scope.row)" class="table-action-btn table-delete-btn" icon="Delete" @click="handleDelete(scope.row)"
              >Delete</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or Edit Transport Assignment Dialog -->
  </div>
</template>

<script setup name="TransportAssignment" lang="ts">
import { listPostharvestBatch } from '@/api/demo/postharvestBatch';
import {
  listTransportAssignment,
  getTransportAssignment,
  delTransportAssignment,
  addTransportAssignment,
  updateTransportAssignment
} from '@/api/demo/transportAssignment';
import { TransportAssignmentVO, TransportAssignmentQuery, TransportAssignmentForm } from '@/api/demo/transportAssignment/types';
import { listTransporterMaster } from '@/api/demo/transporterMaster';
import { transportAssignmentStatus, PostHarvestBatchStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import request from '@/utils/request';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { transport_assignment_status } = toRefs<any>(proxy?.useDict('transport_assignment_status'));

const transportAssignmentList = ref<TransportAssignmentVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const transportAssignmentFormRef = ref<ElFormInstance>();

const TransporterOptions = ref([]);
const farmLandList = ref([]);
const TransporterLoading = ref(false);
const batchIdOptions = ref([]);
const batchIdList = ref([]);
const batchIdLoading = ref(false);
const batchIdRemoteMethod = async (query: string) => {
  if (query) {
    batchIdLoading.value = true;
    const res = await listPostharvestBatch({ pageNum: 1, pageSize: 10, batchId: query });
    batchIdList.value = res.rows;
    batchIdOptions.value = res.rows.map((item) => ({
      value: item.id,
      label: `${item.batchId}`
    }));
    batchIdLoading.value = false;
  } else {
    batchIdOptions.value = [];
  }
};
const TransporterRemoteMethod = async (query: string) => {
  if (query) {
    TransporterLoading.value = true;

    const res = await listTransporterMaster({ pageNum: 1, pageSize: 10, id: query });
    farmLandList.value = res.rows;
    TransporterOptions.value = res.rows.map((item) => ({
      value: item.id,
      label: `${item.id}`
    }));
    TransporterLoading.value = false;
  } else {
    TransporterOptions.value = [];
  }
};

const DispatchLoading = ref(false);
const DispatchOptions = ref([]);
const DispatchList = ref([]);

const DispatchRemoteMethod = async (query: string) => {
  if (query) {
    DispatchLoading.value = true;

    const res = await listTransportAssignment({ pageNum: 1, pageSize: 10, transportId: query });
    DispatchList.value = res.rows;
    DispatchOptions.value = res.rows.map((item) => ({
      value: item.transportId,
      label: `${item.transportId}`
    }));
    DispatchLoading.value = false;
  } else {
    DispatchOptions.value = [];
  }
};

const batchIdFilterOptions = ref([]);
const batchIdFilterList = ref([]);
const batchIdFilterLoading = ref(false);
const batchIdFilterdRemoteMethod = async (query: string) => {
  if (query) {
    batchIdFilterLoading.value = true;
    const res = await request({
      url: '/demo/lossMonitoring/autoComplete/batchId',
      method: 'get',
      params: { batchName: query }
    });
    batchIdFilterList.value = res.data;
    batchIdFilterOptions.value = res.data.map((item) => ({
      value: item.id,
      label: `${item.batchId}`
    }));
    batchIdFilterLoading.value = false;
  } else {
    batchIdFilterOptions.value = [];
  }
};

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: TransportAssignmentForm = {
  id: undefined,
  transportId: undefined,
  batchId: undefined,
  transporterId: undefined,
  fromLocation: undefined,
  toLocation: undefined,
  status: undefined,
  scheduledDate: undefined,
  actualDeparture: undefined,
  actualArrival: undefined,
  approvedBy: undefined
};
const data = reactive<PageData<TransportAssignmentForm, TransportAssignmentQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    transportId: undefined,
    batchId: undefined,
    transporterId: undefined,
    fromLocation: undefined,
    toLocation: undefined,
    status: undefined,
    scheduledDate: undefined,
    actualDeparture: undefined,
    actualArrival: undefined,
    approvedBy: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    id: [{ required: true, message: 'ID cannot be empty', trigger: 'blur' }],
    transportId: [{ required: true, message: 'Transport Task ID cannot be empty', trigger: 'blur' }],
    batchId: [{ required: true, message: 'Batch ID cannot be empty', trigger: 'blur' }],
    transporterId: [{ required: true, message: 'Transporter ID cannot be empty', trigger: 'blur' }],
    fromLocation: [{ required: true, message: 'From Location cannot be empty', trigger: 'blur' }],
    toLocation: [{ required: true, message: 'To Location cannot be empty', trigger: 'blur' }],
    status: [{ required: true, message: 'Status (Scheduled/InTransit/Delivered/Cancelled) cannot be empty', trigger: 'change' }],
    scheduledDate: [{ required: true, message: 'Scheduled Date cannot be empty', trigger: 'blur' }],
    approvedBy: [{ required: true, message: 'Approved By cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** Query Transport Assignment List */
const getList = async () => {
  loading.value = true;
  const res = await listTransportAssignment(queryParams.value);
  transportAssignmentList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** Cancel Button */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** Form Reset */
const reset = () => {
  form.value = { ...initFormData };
  transportAssignmentFormRef.value?.resetFields();
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

/** Multi-select Change */
const handleSelectionChange = (selection: TransportAssignmentVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** Add Button Action */
const handleAdd = () => {
  router.push({ name: 'TransportAssignmentAdd' });
};

/** Edit / View Button Action */
const handleUpdate = (row?: TransportAssignmentVO) => {
  const current: any = row || {};
  const _id = current.id || ids.value[0];
  if (isViewFlag(current)) {
    router.push({ name: 'TransportAssignmentDetail', params: { id: _id } });
  } else {
    router.push({ name: 'TransportAssignmentEdit', params: { id: _id } });
  }
};

/** Submit Button */
const submitForm = () => {
  transportAssignmentFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      // Set default status to '0' if not set
      if (!form.value.status) {
        form.value.status = '0';
      }
      if (form.value.id) {
        await updateTransportAssignment(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addTransportAssignment(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

/** Delete Button Action */
const handleDelete = async (row?: TransportAssignmentVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure to delete the Transport Assignment with ID "' + _ids + '"?').finally(() => (loading.value = false));
  await delTransportAssignment(_ids);
  proxy?.$modal.msgSuccess('Delete successful');
  await getList();
};

/** Export Button Action */
const handleExport = () => {
  proxy?.download(
    'demo/transportAssignment/export',
    {
      ...queryParams.value
    },
    `transportAssignment_${new Date().getTime()}.xlsx`
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

const isViewFlag = (data) => {
  return data.status == transportAssignmentStatus.Deliver || data.status == transportAssignmentStatus.Cancel;
};
</script>

