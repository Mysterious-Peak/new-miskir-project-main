<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="warehouseIntakeFormRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="Intake ID" prop="intakeId">
          <el-input v-model="form.intakeId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Batch ID" prop="batchId">
          <el-input v-model="form.batchName" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Warehouse Code" prop="warehouseId">
          <el-input v-model="form.warehouseCode" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Quantity" prop="qty">
          <el-input v-model="form.qty" placeholder="Please input" disabled />
        </el-form-item>
        <!-- <el-form-item label="Intake Date" prop="intakeDate">
          <el-date-picker clearable v-model="form.intakeDate" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item> -->
        <el-form-item label="Created By" prop="createdUserName">
          <el-input v-model="form.createdUserName" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Created Date" prop="createTime">
          <el-date-picker clearable v-model="form.createTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Approved By" prop="approvedUserName">
          <el-input v-model="form.approvedUserName" placeholder="Please input Approved By" disabled />
        </el-form-item>
        <el-form-item label="Approved Date" prop="approvedAt">
          <el-date-picker clearable v-model="form.approvedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment">
          <el-input
            v-model="form.approvedComment"
            type="textarea"
            placeholder="Please input"
            :disabled="form.status != ApprovalStatus.Draft.toString()"
          />
        </el-form-item>
      </el-form>
      <div class="form-footer">
        <template v-if="!isDetail">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">Approval</el-button>
          <el-button :loading="buttonLoading" type="warning" @click="rejectForm">Reject</el-button>
          <!-- <el-button :loading="buttonLoading" type="warning" @click="RevisionForm">Need Revision</el-button> -->
          <el-button @click="cancel">Cancel</el-button>
        </template>
        <el-button v-else @click="cancel">Close</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="WarehouseIntakeApprovalForm" lang="ts">
import { addWarehouseIntake, getWarehouseIntake, listExternalWarehouseList, updateWarehouseIntake } from '@/api/demo/warehouseIntake';
import { WarehouseIntakeForm } from '@/api/demo/warehouseIntake/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const warehouseIntakeFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const isApprove = computed(() => route.path.endsWith('/approve') || route.path.includes('/approve/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: WarehouseIntakeForm = {
  id: undefined,
  intakeId: undefined,
  batchId: undefined,
  warehouseId: undefined,
  warehouseCode: undefined,
  qty: undefined,
  intakeDate: undefined,
  status: undefined,
  createdUserName: undefined,
  createTime: undefined,
  approvedBy: undefined,
  approvedUserName: undefined,
  approvedAt: undefined,
  approvedComment: undefined
};

const form = ref<WarehouseIntakeForm>({ ...initFormData });

const rules = {
  // id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
  intakeId: [{ required: true, message: 'Intake ID cannot be empty', trigger: 'blur' }],
  batchId: [{ required: true, message: 'Batch ID cannot be empty', trigger: 'blur' }],
  warehouseId: [{ required: true, message: 'Warehouse Code cannot be empty', trigger: 'blur' }],
  qty: [{ required: true, message: 'Quantity cannot be empty', trigger: 'blur' }]
  // intakeDate: [{ required: true, message: '入库操作日期时间不能为空', trigger: 'blur' }],
  // approvedBy: [{ required: true, message: '审批人用户ID不能为空', trigger: 'blur' }]
};

const warehouseIdAllList = ref<any[]>([]);
const getWarehouseCodeById = (warehouseId: string | number) => {
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

/** Load record for approve/detail mode */
const loadRecord = async () => {
  if (!id.value) {
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getWarehouseIntake(id.value);
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
  warehouseIntakeFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      editForm();

      form.value.status = ApprovalStatus.Approved.toString();

      if (form.value.id) {
        await updateWarehouseIntake(form.value);
      } else {
        await addWarehouseIntake(form.value);
      }
      proxy?.$modal.msgSuccess('success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    } finally {
      buttonLoading.value = false;
    }
  });
};

const rejectForm = () => {
  warehouseIntakeFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      editForm();

      form.value.status = ApprovalStatus.Rejected.toString();

      if (form.value.id) {
        await updateWarehouseIntake(form.value);
      } else {
        await addWarehouseIntake(form.value);
      }
      proxy?.$modal.msgSuccess('success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    } finally {
      buttonLoading.value = false;
    }
  });
};

const RevisionForm = () => {
  warehouseIntakeFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      editForm();

      form.value.status = ApprovalStatus.NeedRevision.toString();

      if (form.value.id) {
        await updateWarehouseIntake(form.value);
      } else {
        await addWarehouseIntake(form.value);
      }
      proxy?.$modal.msgSuccess('success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    } finally {
      buttonLoading.value = false;
    }
  });
};

onMounted(async () => {
  await initWarehouseOptions();
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
