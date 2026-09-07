<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- 添加或修改田间操作日志对话框 -->
      <el-form ref="fieldOperationLogFormRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="Production Season ID" prop="prodSeasonId">
          <!-- <div class="flex gap-2 flex-1" v-if="!isViewFlag(form)">
            <el-input v-model="form.prodSeasonId" placeholder="Please input Production Season ID" disabled />
            <SelectProductionSeason v-model="form.prodSeasonId" @select="handleProductionSeasonSelect"></SelectProductionSeason>
          </div>
          <el-input v-else v-model="form.prodSeasonId" placeholder="Please input Production Season ID" disabled /> -->
          <el-select
            v-model="form.prodSeasonId"
            filterable
            remote
            reserve-keyword
            placeholder="Please input"
            :remote-method="productionSeasonRemoteMethod"
            :loading="productionSeasonLoading"
            :debounce="300"
            v-if="!isViewFlag(form)"
            @change="handleProductionSeasonChange"
          >
            <el-option v-for="item in productionSeasonOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-else v-model="form.prodSeasonId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Operation Date" prop="operationDate">
          <div class="flex flex-1 items-center gap-2">
            <el-date-picker
              clearable
              v-model="form.operationDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="Please select"
              :disabled="isViewFlag(form) || form.prodSeasonId == undefined"
              :disabled-date="disabledDate"
              :default-value="defaultDate"
            >
            </el-date-picker>
            <el-tooltip content="Year rounds" placement="top">
              <el-icon><InfoFilled /></el-icon>
            </el-tooltip>
          </div>
        </el-form-item>
        <el-form-item label="Operation Type" prop="operationCode">
          <el-select v-model="form.operationCode" placeholder="Please select" @change="onOperationCodeChange" :disabled="isViewFlag(form)">
            <el-option v-for="dict in operationOptions" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Input Type" prop="inputType">
          <!-- <el-cascader
            v-model="form.inputType"
            :options="inputTypeOptions"
            :props="{
              emitPath: false,
              expandTrigger: 'hover' as const
            }"
            :show-all-levels="false"
            :disabled="isViewFlag(form)"
          /> -->
          <el-input v-if="isViewFlag(form)" :model-value="resolveInputTypeLabel(form)" disabled />
          <el-select v-else v-model="form.inputType" placeholder="Please select" @change="onInputTypeChange">
            <el-option v-for="dict in inputOptions" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Unit" prop="unit">
          <el-select v-model="form.unit" placeholder="Please select" :disabled="isViewFlag(form)">
            <el-option v-for="dict in unitOptions" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Quantity" prop="quantity">
          <!-- <el-select v-model="form.quantity" placeholder="Please select" :disabled="isViewFlag(form)">
            <el-option v-for="dict in operation_quantity" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select> -->
          <el-input-number
            v-model="form.quantity"
            placeholder="Please input"
            :min="quantityMin"
            :max="quantityMax"
            style="width: 100%"
            :disabled="isViewFlag(form)"
          />
        </el-form-item>
        <el-form-item label="Remark" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="Please input Remark" :disabled="isViewFlag(form)" />
        </el-form-item>
        <!-- <el-form-item label="Performed By" prop="performedBy">
          <el-input v-model="form.performedBy" placeholder="Please input Performed By" maxlength="20" show-word-limit :disabled="isViewFlag(form)" />
        </el-form-item> -->
        <el-form-item label="Approved By" prop="verifiedUserName" v-if="isViewFlag(form)">
          <el-input v-model="form.verifiedUserName" placeholder="Please input Approved By" disabled />
        </el-form-item>
        <el-form-item label="Approved Date" prop="verifiedAt" v-if="isViewFlag(form)">
          <el-date-picker clearable v-model="form.verifiedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment" v-if="isViewFlag(form)">
          <el-input v-model="form.approvedComment" type="textarea" placeholder="Please input" disabled />
        </el-form-item>
        <!-- <el-form-item label="Status" prop="status" v-if="isViewFlag(form)">
          <el-tag>{{ ApprovalStatus[form.status as unknown as ApprovalStatus] }}</el-tag>
        </el-form-item> -->
      </el-form>
      <div class="form-footer" v-if="form.status">
        <el-button @click="cancel" v-if="!isViewFlag(form)">Cancel</el-button>
        <el-button :loading="buttonLoading" type="primary" @click="submitForm" v-if="!isViewFlag(form)">Save</el-button>
        <el-button @click="cancel" v-if="isViewFlag(form)">Close</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="FieldOperationLogForm" lang="ts">
import { getCroppingPlan } from '@/api/demo/croppingPlan';
import { addFieldOperationLog, getFieldOperationLog, updateFieldOperationLog } from '@/api/demo/fieldOperationLog';
import { FieldOperationLogForm } from '@/api/demo/fieldOperationLog/types';
import { listIrrigationTypeMaster } from '@/api/demo/irrigationTypeMaster';
import type { IrrigationTypeMasterVO } from '@/api/demo/irrigationTypeMaster/types';
import { getFieldOperationSessionContext } from '@/api/demo/fieldOperationSession';
import type { FieldOperationSessionContextVO } from '@/api/demo/fieldOperationSession/types';
import { getProductionSeason, listProductionSeason } from '@/api/demo/productionSeason';
import { ApprovalStatus, CroppingSeasonStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { input_type, operation_unit, operation_quantity, operation_code } = toRefs<any>(
  proxy?.useDict('input_type', 'operation_unit', 'operation_quantity', 'operation_code')
);

const pageLoading = ref(false);
const buttonLoading = ref(false);
const fieldOperationLogFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const id = computed(() => (route.params.id as string) || '');
const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

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
  verifiedUserName: undefined,
  verifiedAt: undefined,
  deptId: undefined,
  remark: undefined,
  status: ApprovalStatus.Draft.toString(),
  approvedComment: undefined
};

const form = ref<FieldOperationLogForm>({ ...initFormData });

const rules = {
  // operationId: [{ required: true, message: '操作 ID不能为空', trigger: 'blur' }],
  prodSeasonId: [{ required: true, message: 'Production Season ID can not be null', trigger: 'blur' }],
  operationDate: [{ required: true, message: 'Operation Date can not be null', trigger: 'blur' }],
  operationCode: [{ required: true, message: 'Operation Type can not be null', trigger: 'blur' }],
  remark: [
    { required: true, message: 'Production Season ID can not be null', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value && /^\d+$/.test(value)) {
          callback(new Error('Value must include non-numeric characters, not just numbers.'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

const productionSeasonOptions = ref([]);
const productionSeasonList = ref([]);
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
      productionSeasonList.value = res.rows;
      productionSeasonOptions.value = (res.rows || []).map((item) => ({
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
const inputOptions = ref([]);
const unitOptions = ref([]);
const operationContext = ref<FieldOperationSessionContextVO>({});
const irrigationTypeMasterList = ref<IrrigationTypeMasterVO[]>([]);
const quantityMin = ref(0);
const quantityMax = ref(0);

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

const resetOptions = () => {
  inputOptions.value = [];
  unitOptions.value = [];
  quantityMin.value = 0;
  quantityMax.value = 0;
};

const onOperationCodeChange = () => {
  form.value.inputType = undefined;
  form.value.unit = undefined;
  form.value.quantity = undefined;
  resetOptions();
  if (!form.value.operationCode) {
    return;
  }
  switch (form.value.operationCode) {
    case '0': // FERT
      inputOptions.value = [
        { value: 'DAP', label: 'DAP' },
        { value: 'Urea', label: 'Urea' },
        { value: 'NPS', label: 'NPS' }
      ];
      break;
    case '6': // CHEM
      inputOptions.value = [{ value: 'Chemicals', label: 'Chemicals' }];
      break;
    case '1': // IRR
      inputOptions.value = (operationContext.value.irrigationOptions || []).map((item) => ({
        value: item.irrigationCode || '',
        label: item.irrigationName || item.irrigationCode || ''
      }));
      break;
    case '2': // WEED
      inputOptions.value = [
        { value: 'Herbicides', label: 'Herbicides' },
        { value: 'Manual weeding', label: 'Manual weeding' }
      ];
      unitOptions.value = [{ value: 'ha', label: 'ha' }];
      form.value.unit = 'ha';
      quantityMin.value = 0.01;
      quantityMax.value = 999999;
      break;
    default:
      resetOptions();
      break;
  }
};
const onInputTypeChange = () => {
  if (form.value.operationCode === '2') {
    form.value.unit = 'ha';
    return;
  }
  if (!form.value.inputType) {
    return;
  }
  switch (form.value.inputType) {
    case 'DAP':
      unitOptions.value.length = 0;
      unitOptions.value.push({ value: 'kg/ha', label: 'kg/ha' });
      form.value.unit = 'kg/ha';
      quantityMin.value = 100;
      quantityMax.value = 100;
      if (!form.value.quantity) form.value.quantity = 100;
      break;
    case 'Urea':
      unitOptions.value.length = 0;
      unitOptions.value.push({ value: 'kg/ha', label: 'kg/ha' });
      form.value.unit = 'kg/ha';
      quantityMin.value = 50;
      quantityMax.value = 100;
      if (!form.value.quantity) form.value.quantity = 50;
      break;
    case 'NPS':
      unitOptions.value.length = 0;
      unitOptions.value.push({ value: 'kg/ha', label: 'kg/ha' });
      form.value.unit = 'kg/ha';
      quantityMin.value = 100;
      quantityMax.value = 100;
      if (!form.value.quantity) form.value.quantity = 100;
      break;
    case 'Chemicals':
      unitOptions.value.length = 0;
      unitOptions.value.push({ value: 'L/ha', label: 'L/ha' });
      form.value.unit = 'L/ha';
      quantityMin.value = 1;
      quantityMax.value = 2;
      if (!form.value.quantity) form.value.quantity = 1;
      break;
    case 'Herbicides':
    case 'Manual weeding':
      unitOptions.value.length = 0;
      unitOptions.value.push({ value: 'ha', label: 'ha' });
      form.value.unit = 'ha';
      quantityMin.value = 0.01;
      quantityMax.value = 999999;
      break;
    default:
      if (form.value.operationCode === '1') {
        unitOptions.value.push({ value: 'm³/ha per application', label: 'm³/ha per application' });
        unitOptions.value.length = 0;
        form.value.unit = 'm³/ha per application';
        quantityMin.value = 200;
        quantityMax.value = 300;
        if (!form.value.quantity) form.value.quantity = 200;
      }
      break;
  }
};

const loadOperationContext = async (prodSeasonId?: string | number) => {
  if (!prodSeasonId) {
    operationContext.value = {};
    return;
  }
  const res = await getFieldOperationSessionContext(prodSeasonId);
  operationContext.value = res.data || {};
};

const getExData = async (prodSeasonId) => {
  const seasonRes = await getProductionSeason(prodSeasonId);
  if (seasonRes.data) {
    const planRes = await getCroppingPlan(seasonRes.data.planId);
    if (planRes.data) {
      form.value.croppingPlan = planRes.data;
      form.value.seasonName = form.value.croppingPlan.seasonName;
    }
  }
  await loadOperationContext(prodSeasonId);
};

const handleProductionSeasonChange = async (prodSeasonId: string | number) => {
  await loadOperationContext(prodSeasonId);
  if (form.value.operationCode === '1') {
    onOperationCodeChange();
  }
};

const disabledDate = (time: Date) => {
  if (form.value.croppingPlan) {
    const startDate = new Date(form.value.croppingPlan.plantingWindowStart);
    return !(time.getFullYear() == startDate.getFullYear() && time.getTime() > startDate.getTime());
  }
  return false;
};
const defaultDate = computed(() => {
  // if (form.value.seasonName == 'Meher') {
  //   return new Date(new Date().getFullYear(), 10, 1);
  // } else if (form.value.seasonName == 'Belg') {
  //   return new Date(new Date().getFullYear(), 5, 1);
  // } else if (form.value.seasonName == 'Irrigation') {
  //   return new Date(new Date().getFullYear(), 1, 1);
  // }
  return new Date();
});

const isViewFlag = (data) => {
  return data.status == ApprovalStatus.Approved || data.status == ApprovalStatus.Rejected;
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    operationContext.value = {};
    resetOptions();
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getFieldOperationLog(id.value);
    Object.assign(form.value, res.data);
    form.value.quantity = form.value.quantity != null ? Number(form.value.quantity) : undefined;

    await getExData(form.value.prodSeasonId);
    onOperationCodeChange();
    onInputTypeChange();
  } finally {
    pageLoading.value = false;
  }
};

/** Cancel Button */
const cancel = () => {
  router.push(listPath.value);
};

/** Submit Button */
const submitForm = () => {
  fieldOperationLogFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (form.value.operationCode === '2' && form.value.unit !== 'ha') {
        proxy?.$modal.msgError('WEED operations must use unit ha');
        return;
      }
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.Draft.toString();

      if (form.value.operationId) {
        await updateFieldOperationLog(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addFieldOperationLog(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

onMounted(async () => {
  const res = await listIrrigationTypeMaster();
  irrigationTypeMasterList.value = res.rows ?? [];
  loadRecord();
});
</script>

<style scoped>
.form-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 0;
}
</style>
