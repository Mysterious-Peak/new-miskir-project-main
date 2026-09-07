<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- 添加或修改病虫害报告对话框 -->
      <el-form ref="pestDiseaseReportFormRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="Production Season ID" prop="prodSeasonId">
          <el-input v-model="form.prodSeasonId" placeholder="" disabled />
        </el-form-item>
        <el-form-item label="Report Date" prop="reportDate">
          <el-date-picker clearable v-model="form.reportDate" type="date" value-format="YYYY-MM-DD" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Category" prop="category">
          <el-select v-model="form.category" placeholder="Please select" disabled>
            <el-option v-for="dict in pest_disease_report_category" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="showTypeField" label="Type" prop="pestType">
          <el-select v-model="form.pestType" placeholder="Please select" disabled>
            <el-option v-for="dict in categoryTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="showCategoryDetailFields" label="Description" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="Please enter content" disabled />
        </el-form-item>
        <el-form-item label="Severity Score (1-5)" prop="severityScore">
          <el-select v-model="form.severityScore" placeholder="Please select" disabled>
            <el-option v-for="dict in pest_severity_score" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="showCategoryDetailFields" label="Image Url" prop="imageUrl">
          <image-preview :src="(form as any).imageUrlUrl" :width="150" :height="50" />
        </el-form-item>
        <el-form-item label="Auto Diagnosis" prop="aiDiagnosis">
          <el-input v-model="form.aiDiagnosis" placeholder="Please input Auto Diagnosis" disabled />
        </el-form-item>
        <el-form-item label="Recommended Action" prop="recommendedAction">
          <el-input v-model="form.recommendedAction" type="textarea" placeholder="Please input Recommended Action" disabled />
        </el-form-item>
        <!-- <el-form-item label="Status" prop="status">
          <el-select v-model="form.status" placeholder="Please select Status" style="width: 100%" :disabled="isViewFlag(form)">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item> -->
        <el-form-item label="Recorded By" prop="recordedUserName">
          <el-input v-model="form.recordedUserName" placeholder="Please input Recorded By" disabled />
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment">
          <el-input
            v-model="form.approvedComment"
            type="textarea"
            placeholder="Please input"
            :disabled="form.status != PestDiseaseStatus.Reported.toString()"
          />
        </el-form-item>
        <!-- <el-form-item label="Approved By" prop="verifiedBy">
          <el-input v-model="form.verifiedBy" placeholder="Please input Approved By" disabled />
        </el-form-item> -->
        <!-- <el-form-item label="Status" prop="status">
          <el-tag>{{ PestDiseaseStatus[form.status as unknown as PestDiseaseStatus] }}</el-tag>
        </el-form-item> -->
        <!-- <el-form-item label="部门ID" prop="deptId">
          <el-input v-model="form.deptId" placeholder="请输入部门ID" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item> -->
      </el-form>
      <div class="form-footer">
        <template v-if="isApprove && form.status == PestDiseaseStatus.Reported.toString()">
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

<script setup name="PestDiseaseReportVerifiedForm" lang="ts">
import { addPestDiseaseReport, getPestDiseaseReport, updatePestDiseaseReport } from '@/api/demo/pestDiseaseReport';
import { PestDiseaseReportForm, applyPestDiseaseReportToForm } from '@/api/demo/pestDiseaseReport/types';
import { usePestDiseaseReportCategoryForm } from '@/views/demo/pestDiseaseReport/usePestDiseaseReportCategoryForm';
import { PestDiseaseStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { pest_type, pest_severity_score, pest_report_date, pest_disease_report_category } = toRefs<any>(
  proxy?.useDict('pest_type', 'pest_severity_score', 'pest_report_date', 'pest_disease_report_category')
);

const pageLoading = ref(false);
const buttonLoading = ref(false);
const pestDiseaseReportFormRef = ref<ElFormInstance>();

const isApprove = computed(() => route.path.endsWith('/approve') || route.path.includes('/approve/'));
const isAction = computed(() => route.path.endsWith('/action') || route.path.includes('/action/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: PestDiseaseReportForm = {
  pestId: undefined,
  prodSeasonId: undefined,
  reportDate: undefined,
  pestType: undefined,
  category: undefined,
  severityScore: undefined,
  imageUrl: undefined,
  aiDiagnosis: undefined,
  recommendedAction: undefined,
  status: undefined,
  recordedBy: undefined,
  recordedUserName: undefined,
  verifiedBy: undefined,
  verifiedUserName: undefined,
  deptId: undefined,
  remark: undefined,
  approvedComment: undefined
};

const form = ref<PestDiseaseReportForm>({ ...initFormData });

const rules = ref<ElFormRules>({
  // pestId: [{ required: true, message: '病虫害ID不能为空', trigger: 'blur' }],
  prodSeasonId: [{ required: true, message: 'Production Season ID can not be null', trigger: 'blur' }],
  reportDate: [{ required: true, message: 'Report Date can not be null', trigger: 'blur' }],
  category: [{ required: true, message: 'Category can not be null', trigger: 'change' }],
  pestType: [{ required: true, message: 'Type can not be null', trigger: 'change' }],
  severityScore: [{ required: true, message: 'Severity Score can not be null', trigger: 'blur' }],
  status: [{ required: true, message: 'Status can not be null', trigger: 'change' }],
  recordedBy: [{ required: true, message: 'Recorded By can not be null', trigger: 'blur' }]
});

const { showTypeField, showCategoryDetailFields, categoryTypeOptions, syncCategoryFormRules, preparePestTypeOnSubmit } =
  usePestDiseaseReportCategoryForm({
    form,
    rules,
    pestDiseaseReportFormRef,
    pestDiseaseReportCategory: pest_disease_report_category,
    pestTypeDict: pest_type
  });

/** Load record for approve mode */
const loadRecord = async () => {
  if (!id.value) {
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getPestDiseaseReport(id.value);
    applyPestDiseaseReportToForm(form.value, res.data, undefined, pest_disease_report_category.value ?? []);
    syncCategoryFormRules();
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
  preparePestTypeOnSubmit();
  pestDiseaseReportFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = PestDiseaseStatus.Approved.toString();

      if (form.value.pestId) {
        await updatePestDiseaseReport(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addPestDiseaseReport(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

const rejectForm = () => {
  preparePestTypeOnSubmit();
  pestDiseaseReportFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = PestDiseaseStatus.Rejected.toString();

      if (form.value.pestId) {
        await updatePestDiseaseReport(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addPestDiseaseReport(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

const RevisionForm = () => {
  preparePestTypeOnSubmit();
  pestDiseaseReportFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = PestDiseaseStatus.NeedRevision.toString();

      if (form.value.pestId) {
        await updatePestDiseaseReport(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addPestDiseaseReport(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
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
