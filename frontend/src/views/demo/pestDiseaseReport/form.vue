<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="pestDiseaseReportFormRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="Production Season ID" prop="prodSeasonId">
          <!-- <div class="flex gap-2 flex-1" v-if="!isViewFlag(form)">
            <el-input v-model="form.prodSeasonId" placeholder="Please input Production Season ID" disabled />
            <SelectProductionSeason v-model="form.prodSeasonId"></SelectProductionSeason>
          </div>
          <el-input v-else v-model="form.prodSeasonId" placeholder="" disabled /> -->
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
          >
            <el-option v-for="item in productionSeasonOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-else v-model="form.prodSeasonId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Report Date" prop="reportDate">
          <el-date-picker
            clearable
            v-model="form.reportDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="Please select"
            :disabled="isViewFlag(form)"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Report Time" prop="reportTime">
          <el-time-picker
            clearable
            v-model="form.reportTime"
            value-format="HH:mm:ss"
            placeholder="Please select"
            :disabled="isViewFlag(form)"
          />
        </el-form-item>
        <el-form-item label="Category" prop="category">
          <el-select
            v-model="form.category"
            placeholder="Please select"
            :disabled="isViewFlag(form)"
            @change="handleReportCategoryChange"
          >
            <el-option v-for="dict in pestDiseaseReportCategoryOptions" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="showTypeField" label="Type" prop="pestType">
          <el-select v-model="form.pestType" placeholder="Please select" :disabled="isViewFlag(form)">
            <el-option v-for="dict in categoryTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="showCategoryDetailFields" label="Description" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="Please enter content" :disabled="isViewFlag(form)" />
        </el-form-item>
        <el-form-item label="Severity Score (1-5)" prop="severityScore">
          <el-select v-model="form.severityScore" placeholder="Please select" :disabled="isViewFlag(form)">
            <el-option v-for="dict in pest_severity_score" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="showCategoryDetailFields" label="Image Url" prop="imageUrl">
          <image-upload v-model="form.imageUrl" v-if="!isViewFlag(form)" />
          <image-preview v-else :src="(form as any).imageUrlUrl" :width="150" :height="50" />
        </el-form-item>
        <el-form-item label="Re-AI-Diagnose or not">
          <el-switch v-model="form.aiDetected" active-value="1" inactive-value="0" />
        </el-form-item>
        <el-form-item label="Auto Diagnosis" prop="detectResultImgUrl" v-if="form.pestId">
          <image-preview :src="(form as any).detectResultImgUrl" :width="150" :height="50" />
        </el-form-item>
        <!-- <el-form-item label="Auto Diagnosis" prop="aiDiagnosis">
          <el-input v-model="form.aiDiagnosis" placeholder="Please input Auto Diagnosis" maxlength="100" show-word-limit :disabled="isViewFlag(form)" />
        </el-form-item> -->
        <el-form-item label="Recommended Action" prop="recommendedAction">
          <el-input v-model="form.recommendedAction" type="textarea" placeholder="Please input Recommended Action" :disabled="isViewFlag(form)" />
        </el-form-item>
        <!-- <el-form-item label="Status" prop="status">
          <el-select v-model="form.status" placeholder="Please select Status" style="width: 100%" :disabled="isViewFlag(form)">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item> -->
        <el-form-item label="Recorded By" prop="recordedUserName" v-if="isViewFlag(form)">
          <el-input
            v-model="form.recordedUserName"
            placeholder="Please input Recorded By"
            maxlength="20"
            show-word-limit
            :disabled="isViewFlag(form)"
          />
        </el-form-item>
        <el-form-item label="Approved By" prop="verifiedUserName" v-if="isViewFlag(form)">
          <el-input v-model="form.verifiedUserName" placeholder="Please input Approved By" disabled />
        </el-form-item>
        <el-form-item label="Approved Date" prop="approvedAt" v-if="isViewFlag(form)">
          <el-date-picker clearable v-model="form.approvedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment" v-if="isViewFlag(form)">
          <el-input v-model="form.approvedComment" type="textarea" placeholder="Please input" disabled />
        </el-form-item>
        <!-- <el-form-item label="Status" prop="status" v-if="form.pestId">
          <el-tag>{{ PestDiseaseStatus[form.status as unknown as PestDiseaseStatus] }}</el-tag>
        </el-form-item> -->
      </el-form>
      <div class="form-footer">
        <el-button v-if="isDetail" @click="cancel">Close</el-button>
        <template v-else>
          <el-button @click="cancel">Cancel</el-button>
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">Save</el-button>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup name="PestDiseaseReportForm" lang="ts">
import { getPestDiseaseReport, addPestDiseaseReport, updatePestDiseaseReport } from '@/api/demo/pestDiseaseReport';
import { PestDiseaseReportForm, applyPestDiseaseReportToForm } from '@/api/demo/pestDiseaseReport/types';
import { usePestDiseaseReportCategoryForm } from '@/views/demo/pestDiseaseReport/usePestDiseaseReportCategoryForm';
import { resolvePestDiseaseReportCategoryOptions } from '@/views/demo/pestDiseaseReport/constants';
import { listProductionSeason } from '@/api/demo/productionSeason';
import { CroppingSeasonStatus, PestDiseaseStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const { pest_type, pest_severity_score, pest_report_date, pest_disease_report_category } = toRefs<any>(
  proxy?.useDict('pest_type', 'pest_severity_score', 'pest_report_date', 'pest_disease_report_category')
);

const pageLoading = ref(false);
const buttonLoading = ref(false);
const pestDiseaseReportFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: PestDiseaseReportForm = {
  pestId: undefined,
  prodSeasonId: undefined,
  reportDate: undefined,
  reportTime: undefined,
  pestType: undefined,
  category: undefined,
  severityScore: undefined,
  imageUrl: undefined,
  detectResultImgUrl: undefined,
  aiDiagnosis: undefined,
  recommendedAction: undefined,
  status: PestDiseaseStatus.Reported.toString(),
  recordedBy: undefined,
  recordedUserName: undefined,
  verifiedBy: undefined,
  verifiedUserName: undefined,
  deptId: undefined,
  remark: undefined,
  approvedComment: undefined,
  aiDetected: undefined
};

const form = ref<PestDiseaseReportForm>({ ...initFormData });

const rules = ref<ElFormRules>({
  prodSeasonId: [{ required: true, message: 'Production Season ID can not be null', trigger: 'blur' }],
  reportDate: [{ required: true, message: 'Report Date can not be null', trigger: 'blur' }],
  reportTime: [{ required: true, message: 'Report Time can not be null', trigger: 'change' }],
  category: [{ required: true, message: 'Category can not be null', trigger: 'change' }],
  pestType: [{ required: true, message: 'Type can not be null', trigger: 'change' }],
  severityScore: [{ required: true, message: 'Severity Score can not be null', trigger: 'blur' }],
  status: [{ required: true, message: 'Status can not be null', trigger: 'change' }],
  recordedBy: [{ required: true, message: 'Recorded By can not be null', trigger: 'blur' }]
});

const pestDiseaseReportCategoryOptions = computed(() =>
  resolvePestDiseaseReportCategoryOptions(pest_disease_report_category.value)
);

const {
  showTypeField,
  showCategoryDetailFields,
  categoryTypeOptions,
  handleReportCategoryChange,
  syncCategoryFormRules,
  preparePestTypeOnSubmit
} = usePestDiseaseReportCategoryForm({
  form,
  rules,
  pestDiseaseReportFormRef,
  pestDiseaseReportCategory: pestDiseaseReportCategoryOptions,
  pestTypeDict: pest_type
});

const productionSeasonOptions = ref([]);
const productionSeasonList = ref([]);
const productionSeasonLoading = ref(false);
const productionSeasonRemoteMethod = async (query: string) => {
  if (query) {
    productionSeasonLoading.value = true;

    const res = await listProductionSeason({ pageNum: 1, pageSize: 10, prodSeasonId: query, status: CroppingSeasonStatus.InProgress.toString() });
    productionSeasonList.value = res.rows;
    productionSeasonOptions.value = res.rows.map((item) => ({
      value: item.prodSeasonId,
      label: `${item.prodSeasonId}`
    }));
    productionSeasonLoading.value = false;
  } else {
    productionSeasonOptions.value = [];
  }
};

const isViewFlag = (data) => {
  return (
    data.status == PestDiseaseStatus.Approved.toString() ||
    data.status == PestDiseaseStatus.Rejected ||
    data.status == PestDiseaseStatus.Actioned.toString() ||
    data.status == PestDiseaseStatus.Closed.toString()
  );
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getPestDiseaseReport(id.value);
    applyPestDiseaseReportToForm(form.value, res.data, undefined, pestDiseaseReportCategoryOptions.value);
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
    if (!valid) return;
    buttonLoading.value = true;
    try {
      form.value.status = PestDiseaseStatus.Reported.toString();
      if (form.value.pestId) {
        await updatePestDiseaseReport(form.value);
      } else {
        await addPestDiseaseReport(form.value);
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
