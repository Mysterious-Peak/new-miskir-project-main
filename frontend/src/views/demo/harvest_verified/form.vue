<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- 添加或修改收获记录对话框 -->
      <el-form ref="harvestFormRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="Production Season ID" prop="prodSeasonId">
          <div class="flex gap-2 flex-1">
            <el-input v-model="form.prodSeasonId" placeholder="Please input Production Season ID" disabled />
          </div>
        </el-form-item>
        <el-form-item label="Harvest Date" prop="harvestDate">
          <el-date-picker clearable v-model="form.harvestDate" type="date" value-format="YYYY-MM-DD" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Harested Area (ha)" prop="harvestedAreaTa">
          <el-input v-model="form.harvestedAreaTa" placeholder="Please input Harested Area (ha)" disabled />
        </el-form-item>
        <el-form-item label="Harvest Yield (q)" prop="actualYieldQt">
          <el-input v-model="form.actualYieldQt" placeholder="Please input Harvest Yield (q)" disabled />
        </el-form-item>
        <el-form-item label="Moisture (%)" prop="moisturePct">
          <el-input v-model="form.moisturePct" placeholder="Please input Moisture" disabled />
        </el-form-item>
        <el-form-item label="Quality Grade" prop="qualityGrade">
          <el-select v-model="form.qualityGrade" placeholder="Please select" disabled>
            <el-option v-for="dict in harvest_quality_grade" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Methods" prop="methods">
          <el-select v-model="form.methods" placeholder="Please select" disabled>
            <el-option v-for="dict in harvest_methods" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Buyer Name" prop="buyerName">
          <el-input v-model="form.buyerName" placeholder="Please input Buyer Name" disabled />
        </el-form-item>
        <el-form-item label="Recorded By" prop="recordedUserName">
          <el-input v-model="form.recordedUserName" placeholder="Please input Recorded By" disabled />
        </el-form-item>
        <el-form-item label="Created Time" prop="createTime">
          <el-date-picker clearable v-model="form.createTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
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
        <!-- <el-form-item label="Approved By" prop="verifiedBy">
          <el-input v-model="form.verifiedBy" placeholder="Please input Approved By" />
        </el-form-item>
        <el-form-item label="Verified Date" prop="verifiedAt">
          <el-date-picker clearable v-model="form.verifiedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select">
          </el-date-picker>
        </el-form-item> -->
      </el-form>
      <div class="form-footer">
        <template v-if="!isDetail">
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

<script setup name="HarvestVerifiedForm" lang="ts">
import { getHarvest, addHarvest, updateHarvest } from '@/api/demo/harvest';
import { HarvestForm } from '@/api/demo/harvest/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { harvest_quality_grade, harvest_methods } = toRefs<any>(
  proxy?.useDict('harvest_quality_grade', 'harvest_methods')
);

const pageLoading = ref(false);
const buttonLoading = ref(false);
const harvestFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const isApprove = computed(() => route.path.endsWith('/approve') || route.path.includes('/approve/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: HarvestForm = {
  harvestId: undefined,
  prodSeasonId: undefined,
  harvestDate: undefined,
  harvestedAreaTa: undefined,
  actualYieldQt: undefined,
  moisturePct: undefined,
  qualityGrade: undefined,
  buyerName: undefined,
  recordedBy: undefined,
  recordedUserName: undefined,
  verifiedBy: undefined,
  verifiedUserName: undefined,
  verifiedAt: undefined,
  deptId: undefined,
  remark: undefined,
  status: undefined,
  createBy: undefined,
  createTime: undefined,
  approvedComment: undefined
};

const form = ref<HarvestForm>({ ...initFormData });

const rules = {
  // harvestId: [{ required: true, message: '收获ID不能为空', trigger: 'blur' }],
  prodSeasonId: [{ required: true, message: 'Production Season ID can not be null', trigger: 'blur' }],
  harvestDate: [{ required: true, message: 'Harvest Date can not be null', trigger: 'blur' }],
  actualYieldQt: [{ required: true, message: 'Actual Yield can not be null', trigger: 'blur' }],
  recordedBy: [{ required: true, message: 'Recorded By can not be null', trigger: 'blur' }]
};

/** Load record for approve/detail mode */
const loadRecord = async () => {
  if (!id.value) {
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getHarvest(id.value);
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
  harvestFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      form.value.status = ApprovalStatus.Approved.toString();

      if (form.value.harvestId) {
        await updateHarvest(form.value);
      } else {
        await addHarvest(form.value);
      }
      proxy?.$modal.msgSuccess('Success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    } finally {
      buttonLoading.value = false;
    }
  });
};
const rejectForm = () => {
  harvestFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      form.value.status = ApprovalStatus.Rejected.toString();

      if (form.value.harvestId) {
        await updateHarvest(form.value);
      } else {
        await addHarvest(form.value);
      }
      proxy?.$modal.msgSuccess('Success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    } finally {
      buttonLoading.value = false;
    }
  });
};

const RevisionForm = () => {
  harvestFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      form.value.status = ApprovalStatus.NeedRevision.toString();

      if (form.value.harvestId) {
        await updateHarvest(form.value);
      } else {
        await addHarvest(form.value);
      }
      proxy?.$modal.msgSuccess('Success');
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
