<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Intake ID" prop="intakeId">
              <el-select
                v-model="queryParams.intakeId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="intakeIdRemoteMethod"
                :loading="intakeIdLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in intakeIdOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Batch ID" prop="batchId">
              <!-- <el-input v-model="queryParams.batchId" placeholder="Please input" clearable @keyup.enter="handleQuery" /> -->
              <el-select
                v-model="queryParams.batchId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="batchIdFilterRemoteMethod"
                :loading="batchIdFilterLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in batchIdFilterOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="目标仓库ID" prop="warehouseId">
              <el-input v-model="queryParams.warehouseId" placeholder="请输入目标仓库ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="实际入库数量" prop="qty">
              <el-input v-model="queryParams.qty" placeholder="请输入实际入库数量" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="入库操作日期时间" prop="intakeDate">
              <el-date-picker clearable
                v-model="queryParams.intakeDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择入库操作日期时间"
              />
            </el-form-item>
            <el-form-item label="审批人用户ID" prop="approvedBy">
              <el-input v-model="queryParams.approvedBy" placeholder="请输入审批人用户ID" clearable @keyup.enter="handleQuery" />
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
            <el-button type="warning" plain icon="Download" @click="handleExport">导出</el-button>
          </el-col> --> 
          <!-- <el-col :span="1.5" style="margin-left: auto">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()">删除</el-button>
          </el-col> -->
          <el-col :span="1.5" style="margin-left: auto; margin-right: 5px">
            <el-button type="primary" plain icon="Plus" @click="handleAdd">Add</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" stripe fit border :data="warehouseIntakeList" @selection-change="handleSelectionChange">
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <!-- <el-table-column label="主键ID" align="center" prop="id" v-if="true" /> -->
        <el-table-column label="Intake ID" align="center" prop="intakeId" :min-width="getColumnWidth('Intake ID')" />
        <el-table-column label="Batch ID" align="center" prop="batchName" :min-width="getColumnWidth('Batch ID')" />
        <el-table-column label="Warehouse Code" align="center" prop="warehouseCode" :min-width="getColumnWidth('Warehouse Code')"> </el-table-column>
        <el-table-column label="Quantity" align="center" prop="qty" :min-width="getColumnWidth('Quantity')" />
        <!-- <el-table-column label="Intake Date" align="center" prop="intakeDate" width="180" :min-width="getColumnWidth('Intake Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.intakeDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column> -->
        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')">
          <template #default="scope">
            <el-tag>{{ ApprovalStatus[scope.row.status as ApprovalStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Created By" align="center" prop="createdUserName" :min-width="getColumnWidth('Create By')" />
        <el-table-column label="Created Date" align="center" prop="createTime" width="180" :min-width="getColumnWidth('Create Date')">
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
        <el-table-column label="Action" align="center" fixed="right" class-name="action-column" width="210">
          <template #default="scope">
            <el-button v-if="isViewFlag(scope.row)" class="table-action-btn table-check-btn" icon="View" @click="handleView(scope.row)"
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
  </div>
</template>

<script setup name="WarehouseIntake" lang="ts">
import { listPostharvestBatch } from '@/api/demo/postharvestBatch';
import {
  addWarehouseIntake,
  delWarehouseIntake,
  getWarehouseIntake,
  listExternalWarehouseList,
  listWarehouseIntake,
  updateWarehouseIntake
} from '@/api/demo/warehouseIntake';
import { WarehouseIntakeForm, WarehouseIntakeQuery, WarehouseIntakeVO } from '@/api/demo/warehouseIntake/types';
import { ApprovalStatus, PostHarvestBatchStatus } from '@/enums/AgriculturalEnum';
import { isNew } from '@/utils/FarmTools';
import request from '@/utils/request';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const warehouseIntakeList = ref<WarehouseIntakeVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const warehouseIntakeFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: WarehouseIntakeForm = {
  id: undefined,
  intakeId: undefined,
  batchId: undefined,
  warehouseId: undefined,
  warehouseCode: undefined,
  qty: undefined,
  intakeDate: undefined,
  createdUserName: undefined,
  createTime: undefined,
  approvedBy: undefined,
  approvedUserName: undefined,
  approvedAt: undefined,
  approvedComment: undefined,
  status: ApprovalStatus.Draft.toString()
};
const data = reactive<PageData<WarehouseIntakeForm, WarehouseIntakeQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    intakeId: undefined,
    batchId: undefined,
    warehouseId: undefined,
    qty: undefined,
    intakeDate: undefined,
    approvedBy: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
  },
  rules: {
    // id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
    // intakeId: [{ required: true, message: 'Intake ID cannot be empty', trigger: 'blur' }],
    batchId: [{ required: true, message: 'Batch ID cannot be empty', trigger: 'blur' }],
    warehouseId: [{ required: true, message: 'Warehouse Code cannot be empty', trigger: 'blur' }],
    qty: [{ required: true, message: 'Quantity cannot be empty', trigger: 'blur' }]
    // intakeDate: [{ required: true, message: '入库操作日期时间不能为空', trigger: 'blur' }],
    // approvedBy: [{ required: true, message: '审批人用户ID不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const intakeIdOptions = ref([]);
const intakeIdList = ref([]);
const intakeIdLoading = ref(false);
const intakeIdRemoteMethod = async (query: string) => {
  if (query) {
    intakeIdLoading.value = true;
    const res = await listWarehouseIntake({ pageNum: 1, pageSize: 10, intakeId: query });
    intakeIdList.value = res.rows;
    intakeIdOptions.value = res.rows.map((item) => ({
      value: item.intakeId,
      label: `${item.intakeId}`
    }));
    intakeIdLoading.value = false;
  } else {
    intakeIdOptions.value = [];
  }
};

const batchIdOptions = ref([]);
const batchIdList = ref([]);
const batchIdLoading = ref(false);
const batchIdRemoteMethod = async (query: string) => {
  if (query) {
    batchIdLoading.value = true;
    const res = await listPostharvestBatch({ pageNum: 1, pageSize: 10, batchId: query, status: PostHarvestBatchStatus.Inspected.toString() });
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
const batchIdFilterRemoteMethod = async (query: string) => {
  if (query) {
    batchIdFilterLoading.value = true;
    const res = await request({
      url: '/demo/warehouseIntake/autoComplete/batchId',
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
const warehouseIdLoading = ref(false);
const warehouseIdRemoteMethod = async (query: string) => {
  if (query) {
    warehouseIdLoading.value = true;
    warehouseIdList.value = warehouseIdAllList.value.filter((f) => f.warehouseCode.toLowerCase().includes(query.toLowerCase()));
    warehouseIdOptions.value = warehouseIdList.value.map((item) => ({
      value: item.id,
      label: item.warehouseCode
    }));
    warehouseIdLoading.value = false;
  } else {
    warehouseIdOptions.value = [];
  }
};

/**
 * 初始化时调用外部仓库列表接口，预加载仓库下拉数据
 */
const warehouseIdAllList = ref<any[]>([]);
const getWarehouseCodeById = (warehouseId: string | number | undefined) => {
  const matched = warehouseIdAllList.value.find((item: any) => String(item.id) === String(warehouseId));
  return matched?.warehouseCode || '';
};

const editForm = () => {
  form.value.status = ApprovalStatus.Draft.toString();
  form.value.warehouseCode = getWarehouseCodeById(form.value.warehouseId);
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

/** 查询仓库入库列表 */
const getList = async () => {
  loading.value = true;
  const res = await listWarehouseIntake(queryParams.value);
  warehouseIntakeList.value = res.rows;
  total.value = res.total;
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
  warehouseIntakeFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: WarehouseIntakeVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

const dialogAction = ref('');

const isShow = computed(() => {
  return dialogAction.value !== 'add';
});

/** 新增按钮操作 */
const handleAdd = () => {
  router.push({ name: 'WarehouseIntakeAdd' });
};

/** 修改按钮操作 */
const handleUpdate = (row?: WarehouseIntakeVO) => {
  const _id = row?.id || ids.value[0];
  router.push({ name: 'WarehouseIntakeEdit', params: { id: _id } });
};

/** 提交按钮 */
const submitForm = () => {
  warehouseIntakeFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      editForm();
      if (form.value.id) {
        await updateWarehouseIntake(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addWarehouseIntake(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: WarehouseIntakeVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('Are you sure delete this data?').finally(() => (loading.value = false));
  await delWarehouseIntake(_ids);
  proxy?.$modal.msgSuccess('success');
  await getList();
};

// /** 导出按钮操作 */
// const handleExport = () => {
//   proxy?.download(
//     'demo/warehouseIntake/export',
//     {
//       ...queryParams.value
//     },
//     `warehouseIntake_${new Date().getTime()}.xlsx`
//   );
// };

// const isViewFlag = (data) => {
//   return data.status != ApprovalStatus.Draft;
// };

const handleView = (row?: WarehouseIntakeVO) => {
  // await initWarehouseOptions();
  const _id = row?.id || ids.value[0];
  router.push({ name: 'WarehouseIntakeDetail', params: { id: _id } });
};

const isViewFlag = (data) => {
  return data.status == ApprovalStatus.Approved || data.status == ApprovalStatus.Rejected;
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
</script>

