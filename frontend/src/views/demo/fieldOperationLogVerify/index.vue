<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Production Season ID" prop="prodSeasonId">
              <!-- <el-input v-model="queryParams.prodSeasonId" placeholder="Please input Production Season ID" clearable @keyup.enter="handleQuery" /> -->
              <el-select
                v-model="queryParams.prodSeasonId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="productionSeasonRemoteMethod"
                :loading="productionSeasonLoading"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in productionSeasonOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Operation Date" prop="operationDate">
              <el-date-picker clearable v-model="queryParams.operationDate" type="date" value-format="YYYY-MM-DD" placeholder="Please select" />
            </el-form-item>
            <el-form-item label="Operation Type" prop="operationCode">
              <el-select v-model="queryParams.operationCode" placeholder="Please select" clearable>
                <el-option v-for="dict in operationOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="数量" prop="quantity">
              <el-input v-model="queryParams.quantity" placeholder="请输入数量" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="单位" prop="unit">
              <el-input v-model="queryParams.unit" placeholder="请输入单位" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="记录" prop="notes">
              <el-input v-model="queryParams.notes" placeholder="请输入记录" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="操作人 ID" prop="performedBy">
              <el-input v-model="queryParams.performedBy" placeholder="请输入操作人 ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="核实人 ID" prop="verifiedBy">
              <el-input v-model="queryParams.verifiedBy" placeholder="请输入核实人 ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="审核时间" prop="verifiedAt">
              <el-date-picker clearable v-model="queryParams.verifiedAt" type="date" value-format="YYYY-MM-DD" placeholder="请选择审核时间" />
            </el-form-item>
            <el-form-item label="部门ID" prop="deptId">
              <el-input v-model="queryParams.deptId" placeholder="请输入部门ID" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" >Add</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()"
              >Approval</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()"
              >Delete</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" >导出</el-button>
          </el-col> -->
        </el-row>
      </template>

      <el-table v-loading="loading" stripe fit border :data="fieldOperationLogList" @selection-change="handleSelectionChange">
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column label="Operation ID" align="center" prop="operationId" v-if="true" :min-width="getColumnWidth('Operation ID')" />
        <el-table-column label="Production Season ID" align="center" prop="prodSeasonId" :min-width="getColumnWidth('Production Season ID')" />
        <el-table-column label="Operation Date" align="center" prop="operationDate" width="180" :min-width="getColumnWidth('Operation Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.operationDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Operation Type" align="center" prop="operationCode" :min-width="getColumnWidth('Operation Type')">
          <template #default="scope">
            <dict-tag :options="operation_code" :value="scope.row.operationCode" />
          </template>
        </el-table-column>
        <el-table-column label="Input Type" align="center" prop="inputType" :min-width="getColumnWidth('Input Type')">
          <template #default="scope">
            <el-tag>{{ resolveInputTypeLabel(scope.row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Quantity" align="center" prop="quantity" :min-width="getColumnWidth('Quantity')" />
        <el-table-column label="Unit" align="center" prop="unit" :min-width="getColumnWidth('Unit')">
          <template #default="scope">
            <dict-tag :options="operation_unit" :value="scope.row.unit" />
          </template>
        </el-table-column>
        <el-table-column label="Remark" align="center" prop="remark" :min-width="getColumnWidth('Remark')" />
        <el-table-column label="Performed By" align="center" prop="performedBy" :min-width="getColumnWidth('Performed By')" />
        <el-table-column label="Status" align="center" prop="status" :min-width="getColumnWidth('Status')">
          <template #default="scope">
            <el-tag>{{ ApprovalStatus[scope.row.status as ApprovalStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Create By" align="center" prop="createdUserName" :min-width="getColumnWidth('Create By')" />
        <el-table-column label="Create Date" align="center" prop="createTime" width="180" :min-width="getColumnWidth('Create Date')">
          <template #default="scope">
            <span v-if="isNew(scope.row.createTime)" class="font-black">{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
            <span v-else>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approved By" align="center" prop="verifiedUserName" :min-width="getColumnWidth('Approved By')" />
        <el-table-column label="Approved Date" align="center" prop="verifiedAt" width="180" :min-width="getColumnWidth('Approved Date')">
          <template #default="scope">
            <span>{{ parseTime(scope.row.verifiedAt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approval Comment" align="center" prop="approvedComment" width="180" :min-width="getColumnWidth('Approval Comment')" />
        <el-table-column label="Action" align="center" fixed="right" class-name="action-column" width="110">
          <template #default="scope">
            <el-button
              class="table-action-btn table-check-btn"
              icon="View"
              @click="handleUpdate(scope.row)"
              v-if="scope.row.status != ApprovalStatus.Draft.toString()"
              >View</el-button
            >
            <el-button
              class="table-action-btn table-edit-btn"
              icon="EditPen"
              @click="handleUpdate(scope.row)"
              v-if="scope.row.status == ApprovalStatus.Draft.toString()"
              >Edit</el-button
            >
            <!-- <el-tooltip content="Delete" placement="top">
              <el-button
                link
                type="primary"
                icon="Delete"
                @click="handleDelete(scope.row)"
              ></el-button>
            </el-tooltip> -->
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改田间操作日志对话框 -->
  </div>
</template>

<script setup name="FieldOperationLog Approval" lang="ts">
import {
  listFieldOperationLog,
  getFieldOperationLog,
  delFieldOperationLog,
  addFieldOperationLog,
  updateFieldOperationLog,
  autoCompleteFieldOperationLogProdSeasonIdApproved
} from '@/api/demo/fieldOperationLog';
import { FieldOperationLogVO, FieldOperationLogQuery, FieldOperationLogForm } from '@/api/demo/fieldOperationLog/types';
import { listIrrigationTypeMaster } from '@/api/demo/irrigationTypeMaster';
import type { IrrigationTypeMasterVO } from '@/api/demo/irrigationTypeMaster/types';
import { ApprovalStatus, CroppingSeasonStatus } from '@/enums/AgriculturalEnum';
import { formatInputTypeJson, isNew } from '@/utils/FarmTools';
import request from '@/utils/request';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { input_type, operation_unit, operation_quantity, operation_code } = toRefs<any>(
  proxy?.useDict('input_type', 'operation_unit', 'operation_quantity', 'operation_code')
);

const fieldOperationLogList = ref<FieldOperationLogVO[]>([]);
const irrigationTypeMasterList = ref<IrrigationTypeMasterVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const fieldOperationLogFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: FieldOperationLogForm = {
  operationId: undefined,
  prodSeasonId: undefined,
  operationDate: undefined,
  operationCode: undefined,
  inputType: undefined,
  quantity: undefined,
  unit: undefined,
  performedBy: undefined,
  verifiedBy: undefined,
  verifiedAt: undefined,
  deptId: undefined,
  remark: undefined,
  status: undefined,
  approvedComment: undefined
};
const data = reactive<PageData<FieldOperationLogForm, FieldOperationLogQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    prodSeasonId: undefined,
    operationDate: undefined,
    operationCode: undefined,
    inputType: undefined,
    quantity: undefined,
    unit: undefined,
    performedBy: undefined,
    verifiedBy: undefined,
    verifiedAt: undefined,
    deptId: undefined,
    status: undefined,
    params: {},
    orderByColumn: 'createTime',
    isAsc: 'desc'
    // orderByColumn: undefined,
    // isAsc: undefined
  },
  rules: {
    // operationId: [{ required: true, message: '操作 ID不能为空', trigger: 'blur' }],
    prodSeasonId: [{ required: true, message: 'Production Season ID can not be null', trigger: 'blur' }],
    operationDate: [{ required: true, message: 'Operation Date can not be null', trigger: 'blur' }],
    operationCode: [{ required: true, message: 'Operation Type can not be null', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

const productionSeasonOptions = ref([]);
const productionSeasonLoading = ref(false);
const productionSeasonRemoteMethod = async (query: string) => {
  if (query) {
    productionSeasonLoading.value = true;
    try {
      const res = await autoCompleteFieldOperationLogProdSeasonIdApproved({
        prodSeasonIdLike: query.trim()
      });
      productionSeasonOptions.value = (res.data || []).map((item) => ({
        value: item.prodSeasonId,
        label: `${item.prodSeasonId}`
      }));
    } catch {
      productionSeasonOptions.value = [];
    } finally {
      productionSeasonLoading.value = false;
    }
  } else {
    productionSeasonOptions.value = [];
  }
};

/** 查询田间操作日志列表 */
const getList = async () => {
  loading.value = true;
  // const res = await listFieldOperationLog(queryParams.value);
  const res = await request({
    url: '/demo/fieldOperationLog/list/approved',
    method: 'get',
    params: queryParams.value
  });
  fieldOperationLogList.value = res.rows;
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
  fieldOperationLogFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: FieldOperationLogVO[]) => {
  ids.value = selection.map((item) => item.operationId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = 'Add Operation Log';
};

/** 修改按钮操作 */
const handleUpdate = (row?: FieldOperationLogVO) => {
  const _operationId = row?.operationId || ids.value[0];
  router.push({ name: 'FieldOperationLogApprove', params: { id: _operationId } });
};

/** 提交按钮 */
const submitForm = () => {
  fieldOperationLogFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.Approved.toString();
      // form.value.verifiedAt = new Date().toLocaleString();

      if (form.value.operationId) {
        await updateFieldOperationLog(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addFieldOperationLog(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    }
  });
};

const rejectForm = () => {
  fieldOperationLogFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.Rejected.toString();

      if (form.value.operationId) {
        await updateFieldOperationLog(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addFieldOperationLog(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    }
  });
};

const RevisionForm = () => {
  fieldOperationLogFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.NeedRevision.toString();

      if (form.value.operationId) {
        await updateFieldOperationLog(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addFieldOperationLog(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: FieldOperationLogVO) => {
  const _operationIds = row?.operationId || ids.value;
  await proxy?.$modal.confirm('Are you sure delete this data?').finally(() => (loading.value = false));
  await delFieldOperationLog(_operationIds);
  proxy?.$modal.msgSuccess('Success');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'demo/fieldOperationLog/export',
    {
      ...queryParams.value
    },
    `fieldOperationLog_${new Date().getTime()}.xlsx`
  );
};

onMounted(async () => {
  const res = await listIrrigationTypeMaster();
  irrigationTypeMasterList.value = res.rows ?? [];
  getList();
});

onActivated(() => {
  if (route.query.refresh === '1') {
    getList();
  }
});

const getIrrigationNameByCode = (code?: string) => {
  if (!code) {
    return '';
  }
  return irrigationTypeMasterList.value.find((item) => item.irrigationCode === code)?.irrigationName || code;
};

const resolveInputTypeLabel = (row: { operationCode?: string; inputType?: string }) => {
  if (row.operationCode === '1' && row.inputType) {
    return getIrrigationNameByCode(row.inputType);
  }
  return row.inputType;
};

const operationOptions = [
  {
    value: '0',
    label: 'FERT'
  },
  {
    value: '6',
    label: 'CHEM'
  },
  {
    value: '1',
    label: 'IRR'
  },
  {
    value: '2',
    label: 'WEED'
  }
];
</script>

