<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- 添加或修改田间操作日志对话框 -->
      <el-form ref="fieldOperationLogFormRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="Production Season ID" prop="prodSeasonId">
          <el-input v-model="form.prodSeasonId" placeholder="Production Season ID" disabled />
        </el-form-item>
        <el-form-item label="Operation Date" prop="operationDate">
          <el-date-picker clearable v-model="form.operationDate" type="date" value-format="YYYY-MM-DD" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Operation Type" prop="operationCode">
          <el-select v-model="form.operationCode" placeholder="Please select" disabled>
            <el-option v-for="dict in operation_code" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Input Type" prop="inputType">
          <el-input :model-value="resolveInputTypeLabel(form)" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Unit" prop="unit">
          <el-select v-model="form.unit" placeholder="Please select" disabled>
            <el-option v-for="dict in operation_unit" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Quantity" prop="quantity">
          <!-- <el-select v-model="form.quantity" placeholder="Please select" disabled>
            <el-option v-for="dict in operation_quantity" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select> -->
          <el-input-number v-model="form.quantity" placeholder="Please input" style="width: 100%" disabled />
        </el-form-item>
        <el-form-item label="Remark" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="Please input Remark" disabled />
        </el-form-item>
        <el-form-item label="Performed By" prop="performedBy">
          <el-input v-model="form.performedBy" placeholder="Performed By" disabled />
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment">
          <el-input
            v-model="form.approvedComment"
            type="textarea"
            placeholder="Please input"
            :disabled="form.status != ApprovalStatus.Draft.toString()"
          />
        </el-form-item>
        <!-- <el-form-item label="Approved By" prop="verifiedBy">
          <el-input v-model="form.verifiedBy" placeholder="Approved By" />
        </el-form-item> -->
        <!-- <el-form-item label="Approved Date" prop="verifiedAt">
          <el-date-picker clearable v-model="form.verifiedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select">
          </el-date-picker>
        </el-form-item> -->
        <!-- <el-form-item label="部门ID" prop="deptId">
          <el-input v-model="form.deptId" placeholder="请输入部门ID" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item> -->
      </el-form>
      <div class="form-footer">
        <template v-if="isApprove && form.status == ApprovalStatus.Draft.toString()">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">Approval</el-button>
          <el-button :loading="buttonLoading" type="warning" @click="rejectForm">Reject</el-button>
          <el-button :loading="buttonLoading" type="warning" @click="RevisionForm">Need Revision</el-button>
          <el-button @click="cancel">Cancel</el-button>
        </template>
        <el-button v-else @click="cancel">Close</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="FieldOperationLogVerifyForm" lang="ts">
import { getFieldOperationLog, addFieldOperationLog, updateFieldOperationLog } from '@/api/demo/fieldOperationLog';
import { FieldOperationLogForm } from '@/api/demo/fieldOperationLog/types';
import { listIrrigationTypeMaster } from '@/api/demo/irrigationTypeMaster';
import type { IrrigationTypeMasterVO } from '@/api/demo/irrigationTypeMaster/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { input_type, operation_unit, operation_quantity, operation_code } = toRefs<any>(
  proxy?.useDict('input_type', 'operation_unit', 'operation_quantity', 'operation_code')
);

const pageLoading = ref(false);
const buttonLoading = ref(false);
const fieldOperationLogFormRef = ref<ElFormInstance>();
const irrigationTypeMasterList = ref<IrrigationTypeMasterVO[]>([]);

const isApprove = computed(() => route.path.endsWith('/approve') || route.path.includes('/approve/'));
const isAction = computed(() => route.path.endsWith('/action') || route.path.includes('/action/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
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
  verifiedAt: undefined,
  deptId: undefined,
  remark: undefined,
  status: undefined,
  approvedComment: undefined
};

const form = ref<FieldOperationLogForm>({ ...initFormData });

const rules = {
  // operationId: [{ required: true, message: '操作 ID不能为空', trigger: 'blur' }],
  prodSeasonId: [{ required: true, message: 'Production Season ID can not be null', trigger: 'blur' }],
  operationDate: [{ required: true, message: 'Operation Date can not be null', trigger: 'blur' }],
  operationCode: [{ required: true, message: 'Operation Type can not be null', trigger: 'blur' }]
};

/** Load record for approve mode */
const loadRecord = async () => {
  if (!id.value) {
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getFieldOperationLog(id.value);
    Object.assign(form.value, res.data);
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
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.Approved.toString();
      // form.value.verifiedAt = new Date().toLocaleString();

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
      router.push({ path: listPath.value, query: { refresh: '1' } });
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
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

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

onMounted(async () => {
  const res = await listIrrigationTypeMaster();
  irrigationTypeMasterList.value = res.rows ?? [];
  await loadRecord();
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
