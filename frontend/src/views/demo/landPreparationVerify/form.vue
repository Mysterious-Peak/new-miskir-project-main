<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- Add or Edit Land Preparation Record Dialog -->
      <el-form ref="landPreparationFormRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="Production Season ID" prop="prodSeasonId">
          <el-input v-model="form.prodSeasonId" placeholder="Please enter Production Season ID" disabled />
        </el-form-item>
        <el-form-item label="Preparation Date" prop="prepDate">
          <el-date-picker
            clearable
            v-model="form.prepDate"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Preparation Date"
            :disabled="true"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Preparation Method" prop="method">
          <el-select v-model="form.method" placeholder="Please select" :disabled="true" multiple>
            <el-option v-for="dict in land_method" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Machinery Used" prop="machineryUsed">
          <el-select v-model="form.machineryUsed" placeholder="Please select" :disabled="true">
            <el-option v-for="dict in land_machinery_used" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Tillage Depth (cm)" prop="depthCm">
          <el-input-number
            style="width: 500px"
            v-model="form.depthCm"
            placeholder="Please enter Tillage Depth (cm)"
            :min="0"
            :max="999.99"
            disabled
          />
        </el-form-item>
        <el-form-item label="Remark" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="Please enter content" disabled />
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment">
          <el-input
            v-model="form.approvedComment"
            type="textarea"
            placeholder="Please input"
            :disabled="form.status != ApprovalStatus.Draft.toString()"
          />
        </el-form-item>
        <!-- <el-form-item label="Recorded By ID" prop="recordedBy">
          <el-input v-model="form.recordedBy" show-word-limit maxlength="20" placeholder="Please enter Recorded By ID" disabled />
        </el-form-item> -->
        <!-- <el-form-item label="Approved By ID" prop="verifiedBy">
          <el-input v-model="form.verifiedBy" placeholder="Please enter Approved By ID" disabled />
        </el-form-item>
        <el-form-item label="Approved Date" prop="verifiedAt">
          <el-date-picker
            clearable
            disabled
            v-model="form.verifiedAt"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="Please select Approved Date"
          >
          </el-date-picker>
        </el-form-item> -->
        <!-- <el-form-item label="Department ID" prop="deptId">
          <el-input v-model="form.deptId" placeholder="Please enter Department ID" disabled />
        </el-form-item> -->
        <!-- <el-form-item label="Remark" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="Please enter content" disabled />
        </el-form-item> -->
      </el-form>
      <div class="form-footer">
        <div class="dialog-footer" v-if="form.status && form.status == ApprovalStatus.Draft.toString()">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">Approval</el-button>
          <el-button :loading="buttonLoading" type="warning" @click="rejectForm">Reject</el-button>
          <el-button :loading="buttonLoading" type="warning" @click="RevisionForm">Need Revision</el-button>
          <el-button @click="cancel">Cancel</el-button>
        </div>
        <div class="dialog-footer" v-if="form.status != ApprovalStatus.Draft.toString()">
          <el-button @click="cancel">Close</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup name="LandPreparationVerifyForm" lang="ts">
import { addLandPreparation, getLandPreparation, updateLandPreparation } from '@/api/demo/landPreparation';
import { LandPreparationForm } from '@/api/demo/landPreparation/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { land_prep_date, land_method, land_machinery_used } = toRefs<any>(proxy?.useDict('land_prep_date', 'land_method', 'land_machinery_used'));

const pageLoading = ref(false);
const buttonLoading = ref(false);
const landPreparationFormRef = ref<ElFormInstance>();

const isApprove = computed(() => route.path.endsWith('/approve') || route.path.includes('/approve/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');
const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: LandPreparationForm = {
  landprepId: undefined,
  prodSeasonId: undefined,
  prepDate: undefined,
  method: undefined,
  machineryUsed: undefined,
  depthCm: undefined,
  recordedBy: undefined,
  verifiedBy: undefined,
  verifiedAt: undefined,
  deptId: undefined,
  remark: undefined,
  status: undefined,
  approvedComment: undefined
};

const form = ref<LandPreparationForm>({ ...initFormData });

const rules = {
  landprepId: [{ required: true, message: 'Land preparation record ID cannot be empty', trigger: 'blur' }],
  prodSeasonId: [{ required: true, message: 'Related production season ID cannot be empty', trigger: 'blur' }],
  prepDate: [{ required: true, message: 'Preparation date cannot be empty', trigger: 'blur' }],
  method: [{ required: true, message: 'Preparation method (e.g. Ploughing) cannot be empty', trigger: 'blur' }],
  recordedBy: [{ required: true, message: 'Recorder ID cannot be empty', trigger: 'blur' }],
  status: [{ required: true, message: 'Status cannot be empty', trigger: 'blur' }]
};

/** Load record for approve mode */
const loadRecord = async () => {
  if (!id.value) return;
  pageLoading.value = true;
  try {
    const res = await getLandPreparation(id.value);
    Object.assign(form.value, res.data);
    if (form.value.method && typeof form.value.method === 'string') {
      form.value.method = form.value.method.split(',').filter((item: string) => item.trim()) as any;
    } else if (!form.value.method) {
      form.value.method = [] as any;
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
  landPreparationFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      form.value.status = ApprovalStatus.Approved.toString();
      const submitData = { ...form.value };
      if (Array.isArray(submitData.method)) {
        submitData.method = submitData.method.join(',') as any;
      }
      // form.value.verifiedAt = new Date().toLocaleString();
      if (form.value.landprepId) {
        await updateLandPreparation(submitData).finally(() => (buttonLoading.value = false));
      } else {
        await addLandPreparation(submitData).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Operation successful');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

const rejectForm = () => {
  landPreparationFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.Rejected.toString();
      const submitData = { ...form.value };
      if (Array.isArray(submitData.method)) {
        submitData.method = submitData.method.join(',') as any;
      }

      if (form.value.landprepId) {
        await updateLandPreparation(submitData).finally(() => (buttonLoading.value = false));
      } else {
        await addLandPreparation(submitData).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    }
  });
};

const RevisionForm = () => {
  landPreparationFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      form.value.status = ApprovalStatus.NeedRevision.toString();
      const submitData = { ...form.value };
      if (Array.isArray(submitData.method)) {
        submitData.method = submitData.method.join(',') as any;
      }

      if (form.value.landprepId) {
        await updateLandPreparation(submitData).finally(() => (buttonLoading.value = false));
      } else {
        await addLandPreparation(submitData).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('Success');
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
