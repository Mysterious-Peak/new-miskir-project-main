<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Loss Record ID" prop="lossId">
              <el-select
                v-model="queryParams.lossId"
                filterable
                remote
                clearable
                reserve-keyword
                placeholder="Please input"
                :remote-method="lossIdFilterRemoteMethod"
                :loading="lossIdFilterLoading"
                :debounce="300"
              >
                <el-option v-for="item in lossIdFilterOptions" :key="item.value" :label="item.label" :value="item.value" />
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
            <el-form-item label="Loss Quantity" prop="qty">
              <el-input prefix-icon="Search" v-model="queryParams.qty" placeholder="Please enter Loss Quantity" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!-- <el-form-item label="Loss Cause" prop="cause">
              <el-input v-model="queryParams.cause" placeholder="Please enter Loss Cause" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Reported At" prop="reportedAt">
              <el-date-picker
                clearable
                v-model="queryParams.reportedAt"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Please select Reported At"
              >
              </el-date-picker>
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
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['demo:lossMonitoring:export']">Export</el-button>
          </el-col> --> 
          <!-- <el-col :span="1.5" style="margin-left: auto">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['demo:lossMonitoring:remove']">
              Delete
            </el-button>
          </el-col> -->
          <el-col :span="1.5" style="margin-left: auto; margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:lossMonitoring:add']">Add</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="lossMonitoringList" @selection-change="handleSelectionChange" stripe fit border>
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column label="ID" align="center" prop="id" v-if="true" :min-width="getColumnWidth('ID')" />
        <el-table-column label="Loss Record ID" align="center" prop="lossId" :min-width="getColumnWidth('Loss Record ID')" />
        <el-table-column label="Batch ID" align="center" prop="batchName" :min-width="getColumnWidth('Batch ID')" />
        <el-table-column label="Warehouse Code" align="center" prop="warehouseCode" :min-width="getColumnWidth('Warehouse Code')"> </el-table-column>
        <el-table-column label="Loss Type" align="center" prop="type" :min-width="getColumnWidth('Loss Type')">
          <template #default="scope">
            <dict-tag :options="loss_monitoring_type" :value="scope.row.type" />
          </template>
        </el-table-column>
        <el-table-column label="Loss Quantity" align="center" prop="qty" :min-width="getColumnWidth('Loss Quantity')" />
        <el-table-column label="Loss Cause" align="center" prop="cause" :min-width="getColumnWidth('Loss Cause')" />
        <el-table-column label="Created Date" align="center" prop="createTime" :min-width="getColumnWidth('Create Date')">
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
        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status007')">
          <template #default="scope">
            <el-tag>{{ LossMonitoringStatus[scope.row.status as LossMonitoringStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" fixed="right" class-name="action-column" width="110">
          <template #default="scope">
            <el-button v-if="scope.row.status == 1" class="table-action-btn table-check-btn" icon="View" @click="handleUpdate(scope.row)"
              >View</el-button
            >
            <el-button
              v-if="scope.row.status != 1"
              class="table-action-btn table-edit-btn"
              icon="EditPen"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['demo:lossMonitoring:edit']"
              >Edit</el-button
            >
            <el-button
              v-if="scope.row.status != 1"
              class="table-action-btn table-delete-btn"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['demo:lossMonitoring:remove']"
              >Delete</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="LossMonitoring" lang="ts">
import { addLossMonitoring, delLossMonitoring, getLossMonitoring, listLossMonitoring, updateLossMonitoring } from '@/api/demo/lossMonitoring';
import { LossMonitoringForm, LossMonitoringQuery, LossMonitoringVO } from '@/api/demo/lossMonitoring/types';
import { listPostharvestBatch } from '@/api/demo/postharvestBatch';
import { listExternalWarehouseList } from '@/api/demo/warehouseIntake';
import { LossMonitoringStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import request from '@/utils/request';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { loss_monitoring_type } = toRefs<any>(proxy?.useDict('loss_monitoring_type'));

const lossMonitoringList = ref<LossMonitoringVO[]>([]);
/** 全量列表缓存，供 Loss Record ID 等搜索下拉去重使用 */
const lossMonitoringAllList = ref<LossMonitoringVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const lossMonitoringFormRef = ref<ElFormInstance>();

const warehouseIdOptions = ref([]);
const warehouseIdList = ref([]);
const warehouseIdAllList = ref<any[]>([]);
const warehouseIdLoading = ref(false);
const lossIdFilterOptions = ref<{ value: string | number; label: string }[]>([]);
const lossIdFilterList = ref<(string | number)[]>([]);
const lossIdFilterLoading = ref(false);
const lossIdFilterRemoteMethod = async (query: string) => {
  const q = query?.trim();
  if (!q) {
    lossIdFilterOptions.value = [];
    lossIdFilterList.value = [];
    return;
  }
  lossIdFilterLoading.value = true;
  try {
    const lower = q.toLowerCase();
    lossIdFilterList.value = [
      ...new Set(
        lossMonitoringAllList.value
          .filter((f) => f.lossId != null && String(f.lossId).toLowerCase().includes(lower))
          .map((item) => item.lossId as string | number)
      )
    ];
    lossIdFilterOptions.value = lossIdFilterList.value.map((lid) => ({
      value: lid,
      label: String(lid)
    }));
  } finally {
    lossIdFilterLoading.value = false;
  }
};

const warehouseIdRemoteMethod = async (query: string) => {
  if (query) {
    warehouseIdLoading.value = true;
    warehouseIdList.value = warehouseIdAllList.value.filter((f: any) =>
      String(f.warehouseCode || f.warehouseId || f.warehouseName || f.id)
        .toLowerCase()
        .includes(query.toLowerCase())
    );
    warehouseIdOptions.value = warehouseIdList.value.map((item: any) => ({
      value: item.id,
      label: `${item.warehouseCode || item.warehouseId || item.warehouseName || item.id}`
    }));
    warehouseIdLoading.value = false;
  } else {
    warehouseIdOptions.value = [];
  }
};

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

const getWarehouseCodeById = (warehouseId: string | number | undefined) => {
  const matched = warehouseIdAllList.value.find((item: any) => String(item.id) === String(warehouseId));
  return matched?.warehouseCode || String(warehouseId || '');
};

const editForm = () => {
  form.value.warehouseCode = getWarehouseCodeById(form.value.warehouseId as string | number | undefined) || undefined;
};

const initWarehouseOptions = async () => {
  try {
    const res = await listExternalWarehouseList();
    const rows = (res as any)?.data?.rows || [];
    warehouseIdAllList.value = rows;
  } catch (error) {
    console.error('Failed to initialize warehouse options:', error);
  }
};

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: LossMonitoringForm = {
  id: undefined,
  lossId: undefined,
  batchId: undefined,
  type: undefined,
  qty: undefined,
  cause: undefined,
  reportedAt: undefined,
  warehouseId: undefined,
  status: LossMonitoringStatus.Draft.toString()
};
const data = reactive<PageData<LossMonitoringForm, LossMonitoringQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    lossId: undefined,
    batchId: undefined,
    type: undefined,
    qty: undefined,
    cause: undefined,
    reportedAt: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    id: [{ required: true, message: 'ID cannot be empty', trigger: 'blur' }],
    lossId: [{ required: true, message: 'Loss Record ID cannot be empty', trigger: 'blur' }],
    batchId: [{ required: true, message: 'Batch ID cannot be empty', trigger: 'blur' }],
    type: [{ required: true, message: 'Loss Type (Spoilage/Pest/Shrinkage/Breakage) cannot be empty', trigger: 'change' }],
    qty: [{ required: true, message: 'Loss Quantity cannot be empty', trigger: 'blur' }],
    cause: [{ required: true, message: 'Loss Cause cannot be empty', trigger: 'blur' }],
    reportedAt: [{ required: true, message: 'Reported At cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const isViewFlag = (data: { status?: string | number }) => {
  return data && data.status === LossMonitoringStatus.Confirmed.toString();
};

/** Query Loss Monitoring List */
const getList = async () => {
  loading.value = true;
  const res = await listLossMonitoring(queryParams.value);
  lossMonitoringList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 拉取全表缓存（不带查询条件），供 Loss Record ID 下拉等使用 */
const getAllList = async () => {
  try {
    const res = await listLossMonitoring();
    lossMonitoringAllList.value = res.rows || [];
  } catch (error) {
    console.error('getAllList failed:', error);
    lossMonitoringAllList.value = [];
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
  lossMonitoringFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: LossMonitoringVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** Add Button Action */
const handleAdd = () => {
  router.push({ name: 'LossMonitoringAdd' });
};

/** Edit / View Button Action */
const handleUpdate = (row?: LossMonitoringVO) => {
  // 使用表格行里的名称，保证下拉框显示 name 而不是纯 ID
  const current: any = row || {};
  const _id = current.id || ids.value[0];
  if (row?.status == 1) {
    router.push({ name: 'LossMonitoringDetail', params: { id: _id } });
  } else {
    router.push({ name: 'LossMonitoringEdit', params: { id: _id } });
  }
};

/** Submit Button */
const submitForm = () => {
  lossMonitoringFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      editForm();
      form.value.status = LossMonitoringStatus.Draft.toString();
      if (form.value.id) {
        await updateLossMonitoring(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addLossMonitoring(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
      await getAllList();
    }
  });
};

const Confirmed = () => {
  lossMonitoringFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      editForm();
      form.value.status = LossMonitoringStatus.Confirmed.toString();
      if (form.value.id) {
        await updateLossMonitoring(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addLossMonitoring(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
      await getAllList();
    }
  });
};

/** Delete Button Action */
const handleDelete = async (row?: LossMonitoringVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure to delete the Loss Monitoring with ID "' + _ids + '"?').finally(() => (loading.value = false));
  await delLossMonitoring(_ids);
  proxy?.$modal.msgSuccess('Delete successful');
  await getList();
};

/** Export Button Action */
const handleExport = () => {
  proxy?.download(
    'demo/lossMonitoring/export',
    {
      ...queryParams.value
    },
    `lossMonitoring_${new Date().getTime()}.xlsx`
  );
};

onMounted(async () => {
  try {
    await Promise.all([getList(), getAllList()]);
  } catch (error) {
    console.error('init failed:', error);
  }
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});
</script>

