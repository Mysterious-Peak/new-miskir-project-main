<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Dispatch ID" prop="dispatchId">
              <el-select
                v-model="queryParams.dispatchId"
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
            <el-form-item label="Buyer Name" prop="buyer">
              <el-input prefix-icon="Search" v-model="queryParams.buyer" placeholder="Please enter Buyer Name" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!-- <el-form-item label="Dispatch Quantity" prop="qty">
              <el-input v-model="queryParams.qty" placeholder="Please enter Dispatch Quantity" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="Dispatch Date" prop="dispatchDate">
              <el-date-picker
                clearable
                v-model="queryParams.dispatchDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Please select Dispatch Date"
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:buyerDispatch:add']">Add</el-button>
          </el-col> -->
          <!-- <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['demo:buyerDispatch:edit']">
              Edit
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['demo:buyerDispatch:remove']">
              Delete
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['demo:buyerDispatch:export']">Export</el-button>
          </el-col> -->
        </el-row>
      </template>

      <el-table v-loading="loading" :data="buyerDispatchList" @selection-change="handleSelectionChange" stripe fit border>
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column label="ID" align="center" prop="id" v-if="true" :min-width="getColumnWidth('ID')" />
        <el-table-column label="Dispatch ID" align="center" prop="dispatchId" :min-width="getColumnWidth('Dispatch ID')" />
        <el-table-column label="Warehouse Code" align="center" prop="warehouseId" :min-width="getColumnWidth('Warehouse Code')">
          <template #default="scope">
            <span>{{ getWarehouseCodeById(scope.row.warehouseId) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Batch ID" align="center" prop="batchName" :min-width="getColumnWidth('Batch ID')" />
        <el-table-column label="Buyer Name" align="center" prop="buyer" :min-width="getColumnWidth('Buyer Name')" />
        <el-table-column label="Dispatch Quantity" align="center" prop="qty" :min-width="getColumnWidth('Dispatch Quantity')" />
        <el-table-column label="Dispatch Date" align="center" prop="dispatchDate" :min-width="getColumnWidth('Dispatch Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.dispatchDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
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
            <el-tag>{{ buyerStatus[scope.row.status as buyerStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Action" align="center" fixed="right" class-name="action-column" width="110">
          <template #default="scope">
            <el-button
              v-if="isViewFlag(scope.row)"
              class="table-action-btn table-check-btn"
              icon="View"
              @click="router.push({ name: 'BuyerDispatchApprovalDetail', params: { id: scope.row.id } })"
              >View</el-button
            >
            <el-button
              v-if="!isViewFlag(scope.row)"
              class="table-action-btn table-edit-btn"
              icon="EditPen"
              @click="router.push({ name: 'BuyerDispatchApprovalApprove', params: { id: scope.row.id } })"
              >Edit</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- Add or Edit Buyer Dispatch Dialog -->
  </div>
</template>

<script setup name="BuyerDispatch" lang="ts">
import { addBuyerDispatch, delBuyerDispatch, getBuyerDispatch, listBuyerDispatch, updateBuyerDispatch } from '@/api/demo/buyerDispatch';
import { BuyerDispatchForm, BuyerDispatchQuery, BuyerDispatchVO } from '@/api/demo/buyerDispatch/types';
import { listPostharvestBatch } from '@/api/demo/postharvestBatch';
import { listExternalWarehouseList } from '@/api/demo/warehouseIntake';
import { buyerStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import request from '@/utils/request';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { buyer_dispatch_status } = toRefs<any>(proxy?.useDict('buyer_dispatch_status'));

const buyerDispatchList = ref<BuyerDispatchVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const buyerDispatchFormRef = ref<ElFormInstance>();

const DispatchLoading = ref(false);
const DispatchOptions = ref([]);
const DispatchList = ref([]);

const DispatchRemoteMethod = async (query: string) => {
  if (query) {
    DispatchLoading.value = true;

    const res = await listBuyerDispatch({ pageNum: 1, pageSize: 10, dispatchId: query });
    DispatchList.value = res.rows;
    DispatchOptions.value = res.rows.map((item) => ({
      value: item.dispatchId,
      label: `${item.dispatchId}`
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

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: BuyerDispatchForm = {
  id: undefined,
  dispatchId: undefined,
  batchId: undefined,
  buyer: undefined,
  qty: undefined,
  dispatchDate: undefined,
  status: undefined,
  approvedComment: undefined
};
const data = reactive<PageData<BuyerDispatchForm, BuyerDispatchQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    dispatchId: undefined,
    batchId: undefined,
    buyer: undefined,
    qty: undefined,
    dispatchDate: undefined,
    status: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    id: [{ required: true, message: 'ID cannot be empty', trigger: 'blur' }],
    dispatchId: [{ required: true, message: 'Dispatch ID cannot be empty', trigger: 'blur' }],
    warehouseId: [{ required: true, message: 'Warehouse Code cannot be empty', trigger: 'blur' }],
    batchId: [{ required: true, message: 'Batch ID cannot be empty', trigger: 'blur' }],
    buyer: [{ required: true, message: 'Buyer Name cannot be empty', trigger: 'blur' }],
    qty: [{ required: true, message: 'Dispatch Quantity cannot be empty', trigger: 'blur' }],
    dispatchDate: [{ required: true, message: 'Dispatch Date cannot be empty', trigger: 'blur' }],
    status: [{ required: true, message: 'Status (Dispatched/Completed/Cancelled) cannot be empty', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const getWarehouseCodeById = (warehouseId: string | number | undefined) => {
  const matched = warehouseIdAllList.value.find((item: any) => String(item.id) === String(warehouseId));
  return matched?.warehouseCode || '';
};

const editForm = () => {
  form.value.warehouseCode = getWarehouseCodeById(form.value.warehouseId as string | number) || undefined;
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

/** Query Buyer Dispatch List */
const getList = async () => {
  loading.value = true;
  const res = await listBuyerDispatch(queryParams.value);
  buyerDispatchList.value = res.rows;
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
  buyerDispatchFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: BuyerDispatchVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** Add Button Action */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = 'Add Buyer Dispatch';
};

/** Edit / View Button Action */
const handleUpdate = async (row?: BuyerDispatchVO) => {
  reset();
  const current: any = row || {};
  const _id = current.id || ids.value[0];
  const res = await getBuyerDispatch(_id);
  Object.assign(form.value, res.data);

  // 使用表格行里的名称，保证下拉框显示 name 而不是纯 ID
  if (current) {
    if (form.value.warehouseId) {
      const matched = warehouseIdAllList.value.find((item: any) => String(item.id) === String(form.value.warehouseId));
      warehouseIdOptions.value = [
        {
          value: form.value.warehouseId,
          label: matched?.warehouseCode || current.warehouseCode || current.warehouseName || String(form.value.warehouseId)
        }
      ];
    }
    if (form.value.batchId) {
      batchIdOptions.value = [
        {
          value: form.value.batchId,
          label: current.batchName || String(form.value.batchId)
        }
      ];
    }
  }

  dialog.visible = true;
  dialog.title = isViewFlag(current) ? 'View Buyer Dispatch' : 'Edit Buyer Dispatch';
};

/** Submit Button */
const submitForm = () => {
  buyerDispatchFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      editForm();
      form.value.status = buyerStatus.Approved.toString();
      if (form.value.id) {
        await updateBuyerDispatch(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addBuyerDispatch(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      dialog.visible = false;
      await getList();
    }
  });
};

const rejectForm = () => {
  buyerDispatchFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = buyerStatus.Cancel.toString();

      if (form.value.id) {
        await updateBuyerDispatch(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addBuyerDispatch(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    }
  });
};

/** Delete Button Action */
const handleDelete = async (row?: BuyerDispatchVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure to delete the Buyer Dispatch with ID "' + _ids + '"?').finally(() => (loading.value = false));
  await delBuyerDispatch(_ids);
  proxy?.$modal.msgSuccess('Delete successful');
  await getList();
};

/** Export Button Action */
const handleExport = () => {
  proxy?.download(
    'demo/buyerDispatch/export',
    {
      ...queryParams.value
    },
    `buyerDispatch_${new Date().getTime()}.xlsx`
  );
};

onMounted(async () => {
  try {
    await Promise.all([getList(), initWarehouseOptions()]);
  } catch (error) {
    console.error('init failed:', error);
  }
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});
const isViewFlag = (data) => {
  return data.status == buyerStatus.Approved || data.status == buyerStatus.Cancel;
};
</script>

