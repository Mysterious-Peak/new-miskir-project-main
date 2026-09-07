<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" class="search-card">
          <el-form ref="queryFormRef" :model="queryParams" label-position="top" class="search-section">
            <el-form-item label="Operation ID" prop="sessionId">
              <el-select
                v-model="queryParams.sessionId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="sessionRemoteMethodFilter"
                :loading="sessionLoadingFilter"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in sessionOptionsFilter" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Production Season ID" prop="prodSeasonId">
              <el-select
                v-model="queryParams.prodSeasonId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="productionSeasonRemoteMethodFilter"
                :loading="productionSeasonLoadingFilter"
                :debounce="300"
                clearable
              >
                <el-option v-for="item in productionSeasonOptionsFilter" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="Operation Date" prop="operationDate">
              <el-date-picker clearable v-model="queryParams.operationDate" type="date" value-format="YYYY-MM-DD" placeholder="Please select" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['demo:fieldOperationSession:add']">Add</el-button>
          </el-col>
        </el-row>
      </template>

      <el-table v-loading="loading" stripe fit border :data="sessionList">
        <el-table-column label="Operation ID" align="center" prop="sessionId" :min-width="getColumnWidth('Operation ID')" />
        <el-table-column label="Production Season ID" align="center" prop="prodSeasonId" :min-width="getColumnWidth('Production Season ID')" />
        <el-table-column label="Operation Date" align="center" prop="operationDate" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.operationDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Farmland ID" align="center" prop="farmlandId" :min-width="getColumnWidth('Farmland ID')" />
        <el-table-column label="Crop Type" align="center" prop="cropName" :min-width="getColumnWidth('Crop Type')" />
        <el-table-column label="Season" align="center" prop="seasonName" :min-width="getColumnWidth('Season')" />
        <el-table-column label="Year" align="center" prop="year" width="100" />
        <el-table-column label="Area (ha)" align="center" prop="areaTa" width="120" />
        <el-table-column label="Operations" align="center" prop="operationCount" width="120" />
        <el-table-column label="Status" align="center" prop="status" width="120">
          <template #default="scope">
            <el-tag>{{ ApprovalStatus[scope.row.status as ApprovalStatus] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Create By" align="center" prop="createdUserName" :min-width="getColumnWidth('Create By')" />
        <el-table-column label="Create Date" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approved By" align="center" prop="approvedUserName" :min-width="getColumnWidth('Approved By')" />
        <el-table-column label="Approved Date" align="center" prop="approvedAt" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.approvedAt, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Approval Comment" align="center" prop="approvedComment" :min-width="getColumnWidth('Approval Comment')" />
        <el-table-column label="Action" align="center" fixed="right" class-name="action-column" width="210">
          <template #default="scope">
            <el-button v-if="!isEditableFlag(scope.row)" class="table-action-btn table-check-btn" icon="View" @click="handleView(scope.row)"
              >View</el-button
            >
            <template v-else>
              <el-button
                class="table-action-btn table-edit-btn"
                icon="EditPen"
                @click="handleUpdate(scope.row)"
                v-hasPermi="['demo:fieldOperationSession:edit']"
                >Edit</el-button
              >
              <el-button
                class="table-action-btn table-delete-btn"
                icon="Delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['demo:fieldOperationSession:remove']"
                >Delete</el-button
              >
            </template>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="FieldOperationSession" lang="ts">
import {
  delFieldOperationSession,
  autoCompleteFieldOperationSessionId,
  autoCompleteFieldOperationSessionProdSeasonId,
  getFieldOperationSessionContext,
  getFieldOperationSessionDetail,
  listFieldOperationSession,
  saveFieldOperationSessionWithOperations,
  updateFieldOperationSessionWithOperations
} from '@/api/demo/fieldOperationSession';
import {
  FieldOperationSessionItemForm,
  FieldOperationSessionPageForm,
  FieldOperationSessionQuery,
  FieldOperationSessionVO,
  FieldOperationSessionContextVO
} from '@/api/demo/fieldOperationSession/types';
import { listProductionSeason } from '@/api/demo/productionSeason';
import { listIrrigationTypeMaster } from '@/api/demo/irrigationTypeMaster';
import type { IrrigationTypeMasterVO } from '@/api/demo/irrigationTypeMaster/types';
import { ApprovalStatus, CroppingSeasonStatus } from '@/enums/AgriculturalEnum';
import { parseTime } from '@/utils/ruoyi';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const sessionList = ref<FieldOperationSessionVO[]>([]);
const operationList = ref<FieldOperationSessionItemForm[]>([]);
const sessionContext = ref<FieldOperationSessionContextVO>({});
const irrigationTypeMasterList = ref<IrrigationTypeMasterVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const sessionFormRef = ref<ElFormInstance>();
const operationFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({ visible: false, title: '' });
const operationDialog = reactive<DialogOption>({ visible: false, title: '' });
const operationDialogAction = ref<'add' | 'edit'>('add');
const currentOperationIndex = ref<number | null>(null);
const operationButtonLoading = ref(false);

const operationOptions = [
  { value: '0', label: 'FERT' },
  { value: '6', label: 'CHEM' },
  { value: '1', label: 'IRR' },
  { value: '2', label: 'WEED' }
];

const inputOptions = ref<{ value: string; label: string }[]>([]);
const unitOptions = ref<{ value: string; label: string }[]>([]);
const quantityMin = ref(0);
const quantityMax = ref(999999);

const initFormData: FieldOperationSessionPageForm = {
  sessionId: undefined,
  prodSeasonId: undefined,
  operationDate: undefined,
  planId: undefined,
  farmlandId: undefined,
  cropName: undefined,
  seasonName: undefined,
  year: undefined,
  areaTa: undefined,
  status: ApprovalStatus.Draft.toString(),
  approvedComment: undefined,
  isEdit: false
};

const initOperationForm: FieldOperationSessionItemForm = {
  itemId: undefined,
  operationCode: undefined,
  inputType: undefined,
  quantity: undefined,
  unit: undefined,
  remark: undefined
};

const operationForm = ref<FieldOperationSessionItemForm>({ ...initOperationForm });

const data = reactive<PageData<FieldOperationSessionPageForm, FieldOperationSessionQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    sessionId: undefined,
    prodSeasonId: undefined,
    operationDate: undefined,
    status: undefined
  },
  rules: {
    prodSeasonId: [{ required: true, message: 'Production Season ID can not be null', trigger: 'change' }],
    operationDate: [{ required: true, message: 'Operation Date can not be null', trigger: 'change' }]
  }
});

const operationRules = {
  operationCode: [{ required: true, message: 'Operation Type can not be null', trigger: 'blur' }],
  inputType: [{ required: true, message: 'Input type can not be null', trigger: 'blur' }],
  unit: [{ required: true, message: 'Unit can not be null', trigger: 'blur' }],
  quantity: [{ required: true, message: 'Quantity can not be null', trigger: 'blur' }]
};

const { queryParams, form, rules } = toRefs(data);

const sessionOptionsFilter = ref<{ value: string | number; label: string }[]>([]);
const sessionLoadingFilter = ref(false);
const sessionRemoteMethodFilter = async (query: string) => {
  if (query) {
    sessionLoadingFilter.value = true;
    try {
      const res = await autoCompleteFieldOperationSessionId({
        sessionIdLike: query.trim()
      });
      sessionOptionsFilter.value = (res.data || []).map((item) => ({
        value: item.sessionId!,
        label: `${item.sessionId}`
      }));
    } catch {
      sessionOptionsFilter.value = [];
    } finally {
      sessionLoadingFilter.value = false;
    }
  } else {
    sessionOptionsFilter.value = [];
  }
};

const productionSeasonOptionsFilter = ref<{ value: string | number; label: string }[]>([]);
const productionSeasonLoadingFilter = ref(false);
const productionSeasonRemoteMethodFilter = async (query: string) => {
  if (query) {
    productionSeasonLoadingFilter.value = true;
    try {
      const res = await autoCompleteFieldOperationSessionProdSeasonId({
        prodSeasonIdLike: query.trim()
      });
      productionSeasonOptionsFilter.value = (res.data || []).map((item) => ({
        value: item.prodSeasonId!,
        label: `${item.prodSeasonId}`
      }));
    } catch {
      productionSeasonOptionsFilter.value = [];
    } finally {
      productionSeasonLoadingFilter.value = false;
    }
  } else {
    productionSeasonOptionsFilter.value = [];
  }
};

const productionSeasonOptions = ref<{ value: string | number; label: string }[]>([]);
const productionSeasonLoading = ref(false);
const productionSeasonRemoteMethod = async (query: string) => {
  if (query) {
    productionSeasonLoading.value = true;
    try {
      const res = await listProductionSeason({
        pageNum: 1,
        pageSize: 10,
        prodSeasonId: query.trim(),
        status: CroppingSeasonStatus.InProgress.toString()
      });
      productionSeasonOptions.value = (res.rows || []).map((item) => ({
        value: item.prodSeasonId!,
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

const operationLabel = (code?: string) => operationOptions.find((item) => item.value === code)?.label ?? code;

const inputTypeLabel = (row: FieldOperationSessionItemForm) => {
  if (row.operationCode === '1' && row.inputType) {
    const fromContext = sessionContext.value.irrigationOptions?.find((item) => item.irrigationCode === row.inputType);
    if (fromContext?.irrigationName) {
      return fromContext.irrigationName;
    }
    const fromMaster = irrigationTypeMasterList.value.find((item) => item.irrigationCode === row.inputType);
    return fromMaster?.irrigationName || row.inputType;
  }
  return row.inputType;
};

const isViewFlag = (row: { status?: string }) => {
  const status = row.status;
  return status === ApprovalStatus.Approved.toString() || status === ApprovalStatus.Rejected.toString();
};

const isEditableFlag = (row: { status?: string }) => {
  const status = row.status;
  return !status || status === ApprovalStatus.Draft.toString() || status === ApprovalStatus.NeedRevision.toString();
};

const disabledDate = (time: Date) => {
  if (!sessionContext.value.plantingWindowStart) {
    return false;
  }
  const startDate = new Date(sessionContext.value.plantingWindowStart);
  return time.getTime() <= startDate.getTime();
};

const resetOptions = () => {
  inputOptions.value = [];
  unitOptions.value = [];
  quantityMin.value = 0;
  quantityMax.value = 999999;
};

const onOperationCodeChange = (preserveValues = false) => {
  const keepValues = preserveValues === true;
  const savedInputType = operationForm.value.inputType;
  const savedUnit = operationForm.value.unit;
  const savedQuantity = operationForm.value.quantity;

  if (!keepValues) {
    operationForm.value.inputType = undefined;
    operationForm.value.unit = undefined;
    operationForm.value.quantity = undefined;
  }
  resetOptions();
  if (!operationForm.value.operationCode) {
    if (!keepValues) {
      clearOperationFormValidate();
    }
    return;
  }
  switch (operationForm.value.operationCode) {
    case '0':
      inputOptions.value = [
        { value: 'DAP', label: 'DAP' },
        { value: 'Urea', label: 'Urea' },
        { value: 'NPS', label: 'NPS' }
      ];
      break;
    case '6':
      inputOptions.value = [{ value: 'Chemicals', label: 'Chemicals' }];
      break;
    case '1': {
      inputOptions.value = (sessionContext.value.irrigationOptions || []).map((item) => ({
        value: item.irrigationCode || '',
        label: item.irrigationName || item.irrigationCode || ''
      }));
      if (keepValues && savedInputType) {
        const exists = inputOptions.value.some((item) => item.value === savedInputType);
        if (!exists) {
          const master = irrigationTypeMasterList.value.find((item) => item.irrigationCode === savedInputType);
          inputOptions.value.push({
            value: savedInputType,
            label: master?.irrigationName || savedInputType
          });
        }
      }
      break;
    }
    case '2':
      inputOptions.value = [
        { value: 'Herbicides', label: 'Herbicides' },
        { value: 'Manual weeding', label: 'Manual weeding' }
      ];
      unitOptions.value = [{ value: 'ha', label: 'ha' }];
      if (!keepValues) {
        operationForm.value.unit = 'ha';
      }
      quantityMin.value = 0.01;
      quantityMax.value = 999999;
      break;
    default:
      break;
  }

  if (keepValues) {
    operationForm.value.inputType = savedInputType;
    operationForm.value.unit = savedUnit;
    operationForm.value.quantity = savedQuantity;
  } else {
    clearOperationFormValidate();
  }
};

const onInputTypeChange = (preserveValues = false) => {
  const keepValues = preserveValues === true;
  if (operationForm.value.operationCode === '2') {
    unitOptions.value = [{ value: 'ha', label: 'ha' }];
    if (!keepValues) {
      operationForm.value.unit = 'ha';
    }
    quantityMin.value = 0.01;
    quantityMax.value = 999999;
    return;
  }
  const savedUnit = operationForm.value.unit;
  const savedQuantity = operationForm.value.quantity;

  switch (operationForm.value.inputType) {
    case 'DAP':
    case 'Urea':
    case 'NPS':
      unitOptions.value = [{ value: 'kg/ha', label: 'kg/ha' }];
      quantityMin.value = operationForm.value.inputType === 'Urea' ? 50 : 100;
      quantityMax.value = keepValues ? Math.max(100, savedQuantity ?? 100) : 100;
      if (!keepValues) {
        operationForm.value.unit = 'kg/ha';
        operationForm.value.quantity = quantityMin.value;
      }
      break;
    case 'Chemicals':
      unitOptions.value = [{ value: 'L/ha', label: 'L/ha' }];
      quantityMin.value = 1;
      quantityMax.value = keepValues ? Math.max(2, savedQuantity ?? 2) : 2;
      if (!keepValues) {
        operationForm.value.unit = 'L/ha';
        operationForm.value.quantity = 1;
      }
      break;
    case 'Herbicides':
    case 'Manual weeding':
      unitOptions.value = [{ value: 'ha', label: 'ha' }];
      quantityMin.value = 0.01;
      quantityMax.value = 999999;
      if (!keepValues) {
        operationForm.value.unit = 'ha';
      }
      break;
    default:
      if (operationForm.value.operationCode === '1') {
        unitOptions.value = [{ value: 'm³/ha per application', label: 'm³/ha per application' }];
        quantityMin.value = 200;
        quantityMax.value = keepValues ? Math.max(300, savedQuantity ?? 300) : 300;
        if (!keepValues) {
          operationForm.value.unit = 'm³/ha per application';
          operationForm.value.quantity = 200;
        }
      }
      break;
  }

  if (keepValues) {
    if (savedUnit && !unitOptions.value.some((item) => item.value === savedUnit)) {
      unitOptions.value.push({ value: savedUnit, label: savedUnit });
    }
    operationForm.value.unit = savedUnit;
    operationForm.value.quantity = savedQuantity;
  }
};

const applyContextToForm = (context: FieldOperationSessionContextVO) => {
  sessionContext.value = context;
  form.value.planId = context.planId;
  form.value.farmlandId = context.farmlandId;
  form.value.cropName = context.cropName;
  form.value.seasonName = context.seasonName;
  form.value.year = context.year;
  form.value.areaTa = context.areaTa;
};

const loadSessionContext = async (prodSeasonId?: string | number) => {
  if (!prodSeasonId) {
    sessionContext.value = {};
    return;
  }
  const res = await getFieldOperationSessionContext(prodSeasonId);
  applyContextToForm(res.data || {});
};

const handleProductionSeasonChange = async (prodSeasonId: string | number) => {
  await loadSessionContext(prodSeasonId);
};

const getList = async () => {
  loading.value = true;
  const res = await listFieldOperationSession(queryParams.value);
  sessionList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

const reset = () => {
  form.value = { ...initFormData };
  operationList.value = [];
  sessionContext.value = {};
  sessionFormRef.value?.resetFields();
};

const cancel = () => {
  reset();
  dialog.visible = false;
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleAdd = () => {
  router.push({ name: 'FieldOperationSessionAdd' });
};

const loadSessionIntoForm = async (row: FieldOperationSessionVO) => {
  const res = await getFieldOperationSessionDetail(row.sessionId!);
  const detail = res.data;
  form.value.sessionId = detail.sessionId;
  form.value.prodSeasonId = detail.prodSeasonId;
  form.value.operationDate = detail.operationDate;
  form.value.status = row.status ?? detail.status;
  form.value.approvedComment = detail.approvedComment;
  form.value.isEdit = true;
  applyContextToForm(detail.context || {});
  operationList.value = (detail.operations || []).map((item) => ({
    ...item,
    quantity: item.quantity != null ? Number(item.quantity) : undefined
  }));
};

const handleUpdate = (row: FieldOperationSessionVO) => {
  router.push({ name: 'FieldOperationSessionEdit', params: { id: row.sessionId } });
};

const handleView = (row: FieldOperationSessionVO) => {
  router.push({ name: 'FieldOperationSessionDetail', params: { id: row.sessionId } });
};

const handleDelete = async (row: FieldOperationSessionVO) => {
  await proxy?.$modal.confirm('Are you sure delete this session?');
  await delFieldOperationSession(row.sessionId!);
  proxy?.$modal.msgSuccess('Success');
  await getList();
};

const saveForm = () => {
  sessionFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    if (!operationList.value.length) {
      proxy?.$modal.msgError('Please add at least one operation before saving');
      return;
    }
    buttonLoading.value = true;
    try {
      const payload = {
        sessionId: form.value.sessionId,
        prodSeasonId: form.value.prodSeasonId,
        operationDate: form.value.operationDate,
        operations: operationList.value.map((item) => ({
          itemId: item.itemId,
          operationCode: item.operationCode,
          inputType: item.inputType,
          quantity: item.quantity,
          unit: item.unit,
          remark: item.remark
        }))
      };
      if (form.value.isEdit) {
        await updateFieldOperationSessionWithOperations(payload);
      } else {
        await saveFieldOperationSessionWithOperations(payload);
      }
      proxy?.$modal.msgSuccess('Success');
      dialog.visible = false;
      await getList();
    } finally {
      buttonLoading.value = false;
    }
  });
};

const resetOperationForm = () => {
  operationForm.value = { ...initOperationForm };
  resetOptions();
  operationFormRef.value?.resetFields();
  clearOperationFormValidate();
};

const clearOperationFormValidate = () => {
  operationFormRef.value?.clearValidate();
  nextTick(() => {
    operationFormRef.value?.clearValidate();
  });
};

const handleAddOperation = () => {
  if (!form.value.prodSeasonId) {
    proxy?.$modal.msgError('Please select production season first');
    return;
  }
  resetOperationForm();
  operationDialogAction.value = 'add';
  currentOperationIndex.value = null;
  operationDialog.visible = true;
  operationDialog.title = 'Add Operation';
};

const handleEditOperation = (row: FieldOperationSessionItemForm, index: number) => {
  resetOperationForm();
  operationForm.value = {
    ...row,
    quantity: row.quantity != null ? Number(row.quantity) : undefined
  };
  onOperationCodeChange(true);
  if (operationForm.value.inputType) {
    onInputTypeChange(true);
  }
  operationDialogAction.value = 'edit';
  currentOperationIndex.value = index;
  operationDialog.visible = true;
  operationDialog.title = 'Edit Operation';
};

const handleRemoveOperation = (index: number) => {
  operationList.value.splice(index, 1);
};

const cancelOperation = () => {
  resetOperationForm();
  operationDialog.visible = false;
};

const submitOperationForm = () => {
  operationFormRef.value?.validate((valid: boolean) => {
    if (!valid) {
      return;
    }
    if (operationForm.value.operationCode === '2' && operationForm.value.unit !== 'ha') {
      proxy?.$modal.msgError('WEED operations must use unit ha');
      return;
    }
    const row = { ...operationForm.value };
    if (operationDialogAction.value === 'edit' && currentOperationIndex.value != null) {
      operationList.value.splice(currentOperationIndex.value, 1, row);
    } else {
      operationList.value.push(row);
    }
    operationDialog.visible = false;
    resetOperationForm();
  });
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
</script>

<style scoped lang="scss">
.session-dialog-form {
  :deep(.el-form-item__content) {
    max-width: 280px;
  }

  :deep(.el-select),
  :deep(.el-input),
  :deep(.el-date-editor.el-input) {
    width: 100%;
  }

  :deep(.el-input-number) {
    width: 100%;
    max-width: 280px;
  }
}

.session-add-operation-item {
  :deep(.el-form-item__content) {
    max-width: none;
    margin-left: 0 !important;
    justify-content: flex-start;
  }
}

.session-approval-comment-item {
  :deep(.el-form-item__content) {
    max-width: none;
    width: 100%;
  }
}

.session-operation-dialog-form {
  :deep(.el-form-item__content) {
    max-width: none;
    width: 100%;
  }

  :deep(.el-select),
  :deep(.el-input),
  :deep(.el-date-editor.el-input),
  :deep(.el-input-number) {
    width: 100%;
  }
}
</style>

