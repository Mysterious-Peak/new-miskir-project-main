<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- 添加或修改质量检验对话框 -->
      <el-form ref="qualityInspectionFormRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="Quality Inspection ID" prop="qiId" v-show="isShow">
          <el-input v-model="form.qiId" placeholder="Please input " disabled />
        </el-form-item>
        <el-form-item label="Batch ID" prop="batchId">
          <!-- <div v-if="!isViewFlag(form)" class="flex gap-2 flex-1">
            <el-input v-model="form.batchId" placeholder="Please input Batch ID" disabled />
            <SelectPostHarvestBatch v-model="form.batchId" :status="PostHarvestBatchStatus.Confirmed.toString()"></SelectPostHarvestBatch>
          </div> -->
          <el-select
            v-model="form.batchId"
            filterable
            remote
            reserve-keyword
            placeholder="Please input"
            :remote-method="batchIdRemoteMethod"
            :loading="batchIdLoading"
            :debounce="300"
            v-if="!isViewFlag(form)"
          >
            <el-option v-for="item in batchIdOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-else v-model="form.batchName" placeholder="Please input Batch ID" disabled />
        </el-form-item>
        <el-form-item label="Batch Actual Yield (q)">
          <el-input v-model="form.batchWeightQt" placeholder="Auto from postharvest batch" disabled />
        </el-form-item>
        <el-form-item label="Grade Name" prop="gradeCode">
          <!-- <div v-if="!isViewFlag(form)" class="flex gap-2 flex-1">
            <el-input v-model="form.gradeCode" placeholder="Please input Grade" disabled />
            <SelectQualityGrade v-model="form.gradeCode"></SelectQualityGrade>
          </div> -->
          <el-select v-if="!isViewFlag(form)" v-model="form.gradeCode" placeholder="Please select">
            <el-option v-for="dict in gradeOptions" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
          <el-input v-else v-model="form.gradeCode" placeholder="Please input Grade" disabled />
        </el-form-item>
        <el-form-item label="Moisture (%)" prop="moisturePct">
          <el-input-number
            v-model="form.moisturePct"
            placeholder="Please input Moisture (%)"
            :min="0"
            :max="999.99"
            style="width: 100%"
            :disabled="isViewFlag(form)"
          />
        </el-form-item>
        <el-form-item label="Impurity Level (%)" prop="impurityLevel">
          <el-input-number
            v-model="form.impurityLevel"
            placeholder="Please input Impurity Level (%)"
            :min="0"
            :max="999.99"
            style="width: 100%"
            :disabled="isViewFlag(form)"
          />
        </el-form-item>
        <el-form-item label="Inspector" prop="inspector" v-if="isViewFlag(form)">
          <el-input v-model="form.inspectorUserName" placeholder="Please input Inspector" disabled />
        </el-form-item>
        <!-- <el-form-item label="Inspection Date" prop="inspectionDate" v-if="isViewFlag(form)">
          <el-date-picker clearable v-model="form.inspectionDate" type="date" value-format="YYYY-MM-DD" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item> -->
        <el-form-item label="Created By" prop="createdUserName" v-if="isViewFlag(form)">
          <el-input v-model="form.createdUserName" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Created Date" prop="createTime" v-if="isViewFlag(form)">
          <el-date-picker clearable v-model="form.createTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Approved By" prop="approvedUserName" v-if="isViewFlag(form)">
          <el-input v-model="form.approvedUserName" placeholder="Please input Approved By" disabled />
        </el-form-item>
        <el-form-item label="Approved Date" prop="approvedAt" v-if="isViewFlag(form)">
          <el-date-picker clearable v-model="form.approvedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment" v-if="isViewFlag(form)">
          <el-input v-model="form.approvedComment" type="textarea" placeholder="Please input" disabled />
        </el-form-item>
      </el-form>
      <div class="form-footer">
        <el-button v-if="isViewFlag(form)" @click="cancel">Close</el-button>
        <template v-else>
          <el-button @click="cancel">Cancel</el-button>
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">Save</el-button>
        </template>
      </div>
    </el-card>
  </div>
</template>

<script setup name="QualityInspectionForm" lang="ts">
import { listPostharvestBatch } from '@/api/demo/postharvestBatch';
import { listQualityGradeMaster } from '@/api/demo/qualityGradeMaster';
import { addQualityInspection, getQualityInspection, updateQualityInspection } from '@/api/demo/qualityInspection';
import { QualityInspectionForm } from '@/api/demo/qualityInspection/types';
import { ApprovalStatus, PostHarvestBatchStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const qualityInspectionFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const isShow = computed(() => {
  return !isAdd.value;
});

const initFormData: QualityInspectionForm = {
  id: undefined,
  qiId: undefined,
  batchId: undefined,
  batchWeightQt: undefined,
  gradeCode: undefined,
  moisturePct: undefined,
  impurityLevel: undefined,
  inspector: undefined,
  inspectionDate: undefined,
  status: ApprovalStatus.Draft.toString()
};

const form = ref<QualityInspectionForm>({ ...initFormData });

const rules = {
  // id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
  // qiId: [{ required: true, message: 'Quality Inspection ID cannot be empty', trigger: 'blur' }],
  batchId: [{ required: true, message: 'Batch ID cannot be empty', trigger: 'blur' }],
  gradeCode: [{ required: true, message: 'Grade cannot be empty', trigger: 'blur' }],
  moisturePct: [{ required: true, message: 'Moisture (%) cannot be empty', trigger: 'blur' }]
  // impurityLevel: [{ required: true, message: 'Impurity Level (%) cannot be empty', trigger: 'blur' }]
  // inspector: [{ required: true, message: 'Inspector cannot be empty', trigger: 'blur' }],
  // inspectionDate: [{ required: true, message: 'Inspection Date cannot be empty', trigger: 'blur' }]
};

const batchIdOptions = ref([]);
const batchIdList = ref([]);
const batchIdLoading = ref(false);
const batchIdRemoteMethod = async (query: string) => {
  if (query) {
    batchIdLoading.value = true;
    const res = await listPostharvestBatch({ pageNum: 1, pageSize: 10, batchId: query, status: PostHarvestBatchStatus.Approved.toString() });
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

const isViewFlag = (data) => {
  return data.status == ApprovalStatus.Approved || data.status == ApprovalStatus.Rejected;
};

const gradeOptions = ref([]);
const getGradeList = async () => {
  const res = await listQualityGradeMaster({ pageNum: 1, pageSize: 10 });
  gradeOptions.value = res.rows.map((item) => ({
    value: item.gradeCode,
    label: `${item.gradeName}`
  }));
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getQualityInspection(id.value);
    Object.assign(form.value, res.data);

    if (!isViewFlag(form.value)) {
      {
        batchIdLoading.value = true;
        const res = await listPostharvestBatch({ pageNum: 1, pageSize: 10, id: form.value.batchId });
        batchIdList.value = res.rows;
        batchIdOptions.value = res.rows.map((item) => ({
          value: item.id.toString(),
          label: `${item.batchId}`
        }));
        batchIdLoading.value = false;
      }
    }
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
      form.value.status = ApprovalStatus.Draft.toString();

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

onMounted(async () => {
  await getGradeList();
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
