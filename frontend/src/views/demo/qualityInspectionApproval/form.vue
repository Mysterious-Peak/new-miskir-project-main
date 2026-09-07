<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- 添加或修改质量检验对话框 -->
      <el-form ref="qualityInspectionFormRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="Quality Inspection ID" prop="qiId">
          <el-input v-model="form.qiId" placeholder="Please input " disabled />
        </el-form-item>
        <el-form-item label="Batch ID" prop="batchId">
          <el-input v-model="form.batchName" placeholder="Please input Batch ID" disabled />
        </el-form-item>
        <el-form-item label="Batch Actual Yield (q)">
          <el-input v-model="form.batchWeightQt" placeholder="Auto from postharvest batch" disabled />
        </el-form-item>
        <el-form-item label="Grade" prop="gradeCode">
          <el-input v-model="form.gradeCode" placeholder="Please input Grade" disabled />
        </el-form-item>
        <el-form-item label="Moisture (%)" prop="moisturePct">
          <el-input-number v-model="form.moisturePct" placeholder="Please input Moisture (%)" :min="0" :max="999.99" style="width: 100%" disabled />
        </el-form-item>
        <el-form-item label="Impurity Level (%)" prop="impurityLevel">
          <el-input-number
            v-model="form.impurityLevel"
            placeholder="Please input Impurity Level (%)"
            :min="0"
            :max="999.99"
            style="width: 100%"
            disabled
          />
        </el-form-item>
        <el-form-item label="Inspector" prop="inspector">
          <el-input v-model="form.inspectorUserName" placeholder="Please input Inspector" maxlength="20" show-word-limit disabled />
        </el-form-item>
        <!-- <el-form-item label="Inspection Date" prop="inspectionDate">
          <el-date-picker clearable v-model="form.inspectionDate" type="date" value-format="YYYY-MM-DD" placeholder="Please select" disabled>
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

<script setup name="QualityInspectionApprovalForm" lang="ts">
import { addQualityInspection, getQualityInspection, updateQualityInspection } from '@/api/demo/qualityInspection';
import { QualityInspectionForm } from '@/api/demo/qualityInspection/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const qualityInspectionFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const isApprove = computed(() => route.path.endsWith('/approve') || route.path.includes('/approve/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: QualityInspectionForm = {
  id: undefined,
  qiId: undefined,
  batchId: undefined,
  batchWeightQt: undefined,
  gradeCode: undefined,
  moisturePct: undefined,
  impurityLevel: undefined,
  inspector: undefined,
  inspectionDate: undefined
};

const form = ref<QualityInspectionForm>({ ...initFormData });

const rules = {
  // id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
  qiId: [{ required: true, message: 'Quality Inspection ID cannot be empty', trigger: 'blur' }],
  batchId: [{ required: true, message: 'Batch ID cannot be empty', trigger: 'blur' }],
  gradeCode: [{ required: true, message: 'Grade cannot be empty', trigger: 'blur' }],
  moisturePct: [{ required: true, message: 'Moisture (%) cannot be empty', trigger: 'blur' }]
  // impurityLevel: [{ required: true, message: 'Impurity Level (%) cannot be empty', trigger: 'blur' }]
  // inspector: [{ required: true, message: 'Inspector cannot be empty', trigger: 'blur' }],
  // inspectionDate: [{ required: true, message: 'Inspection Date cannot be empty', trigger: 'blur' }]
};

/** Load record for approve/detail mode */
const loadRecord = async () => {
  if (!id.value) {
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getQualityInspection(id.value);
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
  qualityInspectionFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      form.value.status = ApprovalStatus.Approved.toString();

      if (form.value.id) {
        await updateQualityInspection(form.value);
      } else {
        await addQualityInspection(form.value);
      }

      proxy?.$modal.msgSuccess('success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    } finally {
      buttonLoading.value = false;
    }
  });
};

const rejectForm = () => {
  qualityInspectionFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      form.value.status = ApprovalStatus.Rejected.toString();

      if (form.value.id) {
        await updateQualityInspection(form.value);
      } else {
        await addQualityInspection(form.value);
      }

      proxy?.$modal.msgSuccess('success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    } finally {
      buttonLoading.value = false;
    }
  });
};

const RevisionForm = () => {
  qualityInspectionFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      form.value.status = ApprovalStatus.NeedRevision.toString();

      if (form.value.id) {
        await updateQualityInspection(form.value);
      } else {
        await addQualityInspection(form.value);
      }

      proxy?.$modal.msgSuccess('success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    } finally {
      buttonLoading.value = false;
    }
  });
};

onMounted(() => {
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
