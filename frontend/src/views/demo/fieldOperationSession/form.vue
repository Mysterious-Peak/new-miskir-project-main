<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="sessionFormRef" :model="form" :rules="rules" label-width="auto" class="session-dialog-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Production Season ID" prop="prodSeasonId">
              <el-select
                v-model="form.prodSeasonId"
                filterable
                remote
                reserve-keyword
                placeholder="Please input"
                :remote-method="productionSeasonRemoteMethod"
                :loading="productionSeasonLoading"
                :debounce="300"
                v-if="!isViewFlag(form) && !form.isEdit"
                clearable
                @change="handleProductionSeasonChange"
              >
                <el-option v-for="item in productionSeasonOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
              <el-input v-else v-model="form.prodSeasonId" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Operation Date" prop="operationDate">
              <el-date-picker
                clearable
                v-model="form.operationDate"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="Please select"
                :disabled="isViewFlag(form) || !form.prodSeasonId"
                :disabled-date="disabledDate"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Plan ID">
              <el-input v-model="form.planId" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Farmland ID">
              <el-input v-model="form.farmlandId" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Crop Type">
              <el-input v-model="form.cropName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Season">
              <el-input v-model="form.seasonName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Year">
              <el-input v-model="form.year" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Area (ha)">
              <el-input v-model="form.areaTa" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item v-if="isViewFlag(form)" label="Approval Comment" prop="approvedComment" class="mb-2 session-approval-comment-item">
          <el-input v-model="form.approvedComment" type="textarea" placeholder="Please input" disabled />
        </el-form-item>

        <el-form-item v-if="!isViewFlag(form)" label-width="0" class="session-add-operation-item">
          <el-button type="primary" icon="Plus" @click="handleAddOperation">Add Operation</el-button>
        </el-form-item>

        <el-table stripe fit border :data="operationList" class="mt-2">
          <el-table-column label="Operation Type" align="center" prop="operationCode" :min-width="getColumnWidth('Operation Type')">
            <template #default="scope">
              <span>{{ operationLabel(scope.row.operationCode) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Input Type" align="center" prop="inputType" :min-width="getColumnWidth('Input Type')">
            <template #default="scope">
              <span>{{ inputTypeLabel(scope.row) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="Quantity" align="center" prop="quantity" width="120" />
          <el-table-column label="Unit" align="center" prop="unit" width="120" />
          <el-table-column label="Remark" align="center" prop="remark" :min-width="getColumnWidth('Remark')" />
          <el-table-column label="Actions" align="center" fixed="right" class-name="action-column" v-if="!isViewFlag(form)" width="210">
            <template #default="scope">
              <el-button class="table-action-btn table-edit-btn" icon="EditPen" @click="handleEditOperation(scope.row, scope.$index)">Edit</el-button>
              <el-button class="table-action-btn table-delete-btn" icon="Delete" @click="handleRemoveOperation(scope.$index)">Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>

      <!-- Add / Edit Operation Dialog -->
      <el-card v-if="operationEditorVisible" shadow="never" class="operation-inline-editor">
        <template #header>
          <span>{{ operationDialogAction === 'edit' ? 'Edit Operation' : 'Add Operation' }}</span>
        </template>
        <el-form
          ref="operationFormRef"
          :model="operationForm"
          :rules="operationRules"
          label-width="auto"
          class="session-operation-dialog-form"
          :validate-on-rule-change="false"
        >
          <el-form-item label="Operation Type" prop="operationCode">
            <el-select
              v-model="operationForm.operationCode"
              placeholder="Please select"
              :validate-event="false"
              @change="() => onOperationCodeChange()"
            >
              <el-option v-for="dict in operationOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="Input Type" prop="inputType">
            <el-select v-model="operationForm.inputType" placeholder="Please select" :validate-event="false" @change="() => onInputTypeChange()">
              <el-option v-for="dict in inputOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="Unit" prop="unit">
            <el-select v-model="operationForm.unit" placeholder="Please select" :validate-event="false">
              <el-option v-for="dict in unitOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="Quantity" prop="quantity">
            <el-input-number
              v-model="operationForm.quantity"
              placeholder="Please input"
              :min="quantityMin"
              :max="quantityMax"
              :validate-event="false"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="Remark" prop="remark">
            <el-input v-model="operationForm.remark" type="textarea" placeholder="Please input Remark" :validate-event="false" />
          </el-form-item>
        </el-form>
        <div class="form-footer">
          <el-button @click="cancelOperation">Cancel</el-button>
          <el-button :loading="operationButtonLoading" type="primary" @click="submitOperationForm">Save</el-button>
        </div>
      </el-card>

      <div class="form-footer">
        <el-button :loading="buttonLoading" type="primary" @click="saveForm" v-if="!isViewFlag(form)">Save</el-button>
        <el-button @click="cancel">{{ isViewFlag(form) ? 'Close' : 'Cancel' }}</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="FieldOperationSessionForm" lang="ts">
import {
  getFieldOperationSessionContext,
  getFieldOperationSessionDetail,
  saveFieldOperationSessionWithOperations,
  updateFieldOperationSessionWithOperations
} from '@/api/demo/fieldOperationSession';
import {
  FieldOperationSessionItemForm,
  FieldOperationSessionPageForm,
  FieldOperationSessionVO,
  FieldOperationSessionContextVO
} from '@/api/demo/fieldOperationSession/types';
import { listProductionSeason } from '@/api/demo/productionSeason';
import { listIrrigationTypeMaster } from '@/api/demo/irrigationTypeMaster';
import type { IrrigationTypeMasterVO } from '@/api/demo/irrigationTypeMaster/types';
import { ApprovalStatus, CroppingSeasonStatus } from '@/enums/AgriculturalEnum';
import { getColumnWidth } from '@/utils/utils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const operationList = ref<FieldOperationSessionItemForm[]>([]);
const sessionContext = ref<FieldOperationSessionContextVO>({});
const irrigationTypeMasterList = ref<IrrigationTypeMasterVO[]>([]);
const buttonLoading = ref(false);

const sessionFormRef = ref<ElFormInstance>();
const operationFormRef = ref<ElFormInstance>();

const operationDialogAction = ref<'add' | 'edit'>('add');
const currentOperationIndex = ref<number | null>(null);
const operationButtonLoading = ref(false);
const operationEditorVisible = ref(false);

const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const id = computed(() => (route.params.id as string) || '');
const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

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

const form = ref<FieldOperationSessionPageForm>({ ...initFormData });

const rules = {
  prodSeasonId: [{ required: true, message: 'Production Season ID can not be null', trigger: 'change' }],
  operationDate: [{ required: true, message: 'Operation Date can not be null', trigger: 'change' }]
};

const operationRules = {
  operationCode: [{ required: true, message: 'Operation Type can not be null', trigger: 'blur' }],
  inputType: [{ required: true, message: 'Input type can not be null', trigger: 'blur' }],
  unit: [{ required: true, message: 'Unit can not be null', trigger: 'blur' }],
  quantity: [{ required: true, message: 'Quantity can not be null', trigger: 'blur' }]
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

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    operationList.value = [];
    sessionContext.value = {};
    return;
  }
  pageLoading.value = true;
  try {
    await loadSessionIntoForm({ sessionId: id.value } as FieldOperationSessionVO);
  } finally {
    pageLoading.value = false;
  }
};

/** Cancel Button */
const cancel = () => {
  router.push(listPath.value);
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
      router.push({ path: listPath.value, query: { refresh: '1' } });
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
  operationEditorVisible.value = true;
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
  operationEditorVisible.value = true;
};

const handleRemoveOperation = (index: number) => {
  operationList.value.splice(index, 1);
};

const cancelOperation = () => {
  resetOperationForm();
  operationEditorVisible.value = false;
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
    operationEditorVisible.value = false;
    resetOperationForm();
  });
};

onMounted(async () => {
  const res = await listIrrigationTypeMaster();
  irrigationTypeMasterList.value = res.rows ?? [];
  loadRecord();
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

.form-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 0;
}
</style>
