<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams"  label-position="top" class="search-section">
            <el-form-item label="Warehouse Receipt ID" prop="receiptId">
              <el-select
                v-model="queryParams.receiptId"
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
            <el-form-item label="Warehouse Code" prop="warehouseId">
              <!-- <el-input v-model="queryParams.farmerId" placeholder="Please enter Farmer ID" clearable @keyup.enter="handleQuery" /> -->
              <el-select
                v-model="queryParams.warehouseId"
                filterable
                remote
                clearable
                reserve-keyword
                placeholder="Please input"
                :remote-method="warehouseFilterRemoteMethod"
                :loading="warehouseFilterLoading"
                :debounce="300"
              >
                <el-option v-for="item in warehouseFilterOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="Quantity" prop="qty">
              <el-input v-model="queryParams.qty" placeholder="Please enter Quantity" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Estimated Value (ETB)" prop="valueEtb">
              <el-input v-model="queryParams.valueEtb" placeholder="Please enter Estimated Value (ETB)" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:warehouseReceipt:add']">Add</el-button>
          </el-col> -->
          <!-- <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['demo:warehouseReceipt:edit']">
              Edit
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['demo:warehouseReceipt:remove']">
              Delete
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['demo:warehouseReceipt:export']">Export</el-button>
          </el-col> -->
        </el-row>
      </template>

      <el-table v-loading="loading" :data="warehouseReceiptList" @selection-change="handleSelectionChange" stripe fit border>
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column label="ID" align="center" prop="id" v-if="true" :min-width="getColumnWidth('ID')" />
        <el-table-column label="Warehouse Receipt ID" align="center" prop="receiptId" :min-width="getColumnWidth('Warehouse Receipt ID')" />
        <el-table-column label="Batch ID" align="center" prop="batchName" :min-width="getColumnWidth('Batch ID')" />
        <el-table-column label="Warehouse Code" align="center" prop="warehouseCode" :min-width="getColumnWidth('Warehouse Code')"> </el-table-column>
        <el-table-column label="Quantity" align="center" prop="qty" :min-width="getColumnWidth('Quantity')" />
        <el-table-column label="Estimated Value (ETB)" align="center" prop="valueEtb" :min-width="getColumnWidth('Estimated Value (ETB)')" />
        <el-table-column label="Created By" align="center" prop="createdUserName" :min-width="getColumnWidth('Created By')" />
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
        <!-- <el-table-column label="部门ID" align="center" prop="deptId" />
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="状态" align="center" prop="status" /> -->
        <el-table-column label="Approval Comment" align="center" prop="approvedComment" :min-width="getColumnWidth('Approval Comment')" />
        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')">
          <template #default="scope">
            <el-tag>{{ PledgedStatus[scope.row.status as PledgedStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" align="center" fixed="right" class-name="action-column" width="110">
          <template #default="scope">
            <el-button v-if="isViewFlag(scope.row)" class="table-action-btn table-check-btn" icon="View" @click="handleUpdate(scope.row)"
              >View</el-button
            >
            <el-button v-if="!isViewFlag(scope.row)" class="table-action-btn table-edit-btn" icon="EditPen" @click="handleUpdate(scope.row)"
              >Edit</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="WarehouseReceipt" lang="ts">
import { listPostharvestBatch } from '@/api/demo/postharvestBatch';
import { listExternalWarehouseList } from '@/api/demo/warehouseIntake';
import {
  addWarehouseReceipt,
  delWarehouseReceipt,
  getWarehouseReceipt,
  listWarehouseReceipt,
  updateWarehouseReceipt
} from '@/api/demo/warehouseReceipt';
import { WarehouseReceiptForm, WarehouseReceiptQuery, WarehouseReceiptVO } from '@/api/demo/warehouseReceipt/types';
import { PledgedStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import request from '@/utils/request';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { warehouse_receipt_status } = toRefs<any>(proxy?.useDict('warehouse_receipt_status'));

const warehouseReceiptList = ref<WarehouseReceiptVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const warehouseReceiptFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const DispatchLoading = ref(false);
const DispatchOptions = ref([]);
const DispatchList = ref([]);

const DispatchRemoteMethod = async (query: string) => {
  if (query) {
    DispatchLoading.value = true;

    const res = await listWarehouseReceipt({ pageNum: 1, pageSize: 10, receiptId: query });
    DispatchList.value = res.rows;
    DispatchOptions.value = res.rows.map((item) => ({
      value: item.receiptId,
      label: `${item.receiptId}`
    }));
    DispatchLoading.value = false;
  } else {
    DispatchOptions.value = [];
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

const warehouseIdOptions = ref([]);
const warehouseIdList = ref([]);
const warehouseIdAllList = ref<any[]>([]);
const warehouseIdLoading = ref(false);
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

const warehouseFilterOptions = ref([]);
const warehouseFilterList = ref([]);
const warehouseFilterLoading = ref(false);
const warehouseFilterRemoteMethod = async (query: string) => {
  if (query) {
    warehouseFilterLoading.value = true;
    warehouseFilterList.value = warehouseIdAllList.value.filter((f: any) =>
      String(f.warehouseCode || f.warehouseId || f.warehouseName || f.id)
        .toLowerCase()
        .includes(query.toLowerCase())
    );
    warehouseFilterOptions.value = warehouseFilterList.value.map((item: any) => ({
      value: item.id,
      label: `${item.warehouseCode || item.warehouseId || item.warehouseName || item.id}`
    }));
    warehouseFilterLoading.value = false;
  } else {
    warehouseFilterOptions.value = [];
  }
};

const initFormData: WarehouseReceiptForm = {
  id: undefined,
  receiptId: undefined,
  batchId: undefined,
  warehouseId: undefined,
  qty: undefined,
  valueEtb: undefined,
  status: PledgedStatus.Active.toString(),
  approvedComment: undefined
};
const data = reactive<PageData<WarehouseReceiptForm, WarehouseReceiptQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    receiptId: undefined,
    batchId: undefined,
    warehouseId: undefined,
    qty: undefined,
    valueEtb: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    id: [{ required: true, message: 'ID cannot be empty', trigger: 'blur' }],
    receiptId: [{ required: true, message: 'Warehouse Receipt ID cannot be empty', trigger: 'blur' }],
    batchId: [{ required: true, message: 'Batch ID cannot be empty', trigger: 'blur' }],
    warehouseId: [{ required: true, message: 'Warehouse Code cannot be empty', trigger: 'blur' }],
    qty: [{ required: true, message: 'Quantity cannot be empty', trigger: 'blur' }],
    valueEtb: [{ required: true, message: 'Estimated Value (ETB) cannot be empty', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

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

/** Query Warehouse Receipt List */
const getList = async () => {
  loading.value = true;
  const res = await listWarehouseReceipt(queryParams.value);
  warehouseReceiptList.value = res.rows;
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
  warehouseReceiptFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: WarehouseReceiptVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** Add Button Action */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = 'Add Warehouse Receipt';
};

/** Edit / View Button Action */
const handleUpdate = (row?: WarehouseReceiptVO) => {
  // 使用表格行里的名称，保证下拉框显示 name 而不是纯 ID
  const current: any = row || {};
  const _id = current.id || ids.value[0];
  if (isViewFlag(current)) {
    router.push({ name: 'WarehouseReceiptApprovalDetail', params: { id: _id } });
  } else {
    router.push({ name: 'WarehouseReceiptApprovalApprove', params: { id: _id } });
  }
};

/** Submit Button */
const submitForm = () => {
  warehouseReceiptFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      editForm();
      form.value.status = PledgedStatus.Approved.toString();
      if (form.value.id) {
        await updateWarehouseReceipt(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addWarehouseReceipt(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

/** Rejected Button - 从Active状态变为Rejected状态 */
const rejectStatusForm = () => {
  warehouseReceiptFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = PledgedStatus.Rejected.toString();
      if (form.value.id) {
        await updateWarehouseReceipt(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addWarehouseReceipt(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

/** Cancel Button - 从Pledged状态变为Cancel状态 */
const cancelForm = () => {
  warehouseReceiptFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = PledgedStatus.Canceled.toString();
      if (form.value.id) {
        await updateWarehouseReceipt(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addWarehouseReceipt(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

/** Delete Button Action */
const handleDelete = async (row?: WarehouseReceiptVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure to delete the Warehouse Receipt with ID "' + _ids + '"?').finally(() => (loading.value = false));
  await delWarehouseReceipt(_ids);
  proxy?.$modal.msgSuccess('Delete successful');
  await getList();
};

/** Export Button Action */
const handleExport = () => {
  proxy?.download(
    'demo/warehouseReceipt/export',
    {
      ...queryParams.value
    },
    `warehouseReceipt_${new Date().getTime()}.xlsx`
  );
};

onMounted(async () => {
  try {
    await Promise.all([getList(), initWarehouseOptions()]);
  } catch (error) {
    console.error('init failed:', error);
  }
});
const isViewFlag = (data) => {
  return data.status == PledgedStatus.Rejected || data.status == PledgedStatus.Canceled;
};

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});
</script>

