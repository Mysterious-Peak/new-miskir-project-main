<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <el-form ref="postharvestBatchFormRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="Batch ID" prop="batchId" style="width: 400px">
          <el-input v-model="form.batchId" placeholder="Please input Batch ID" disabled />
        </el-form-item>
        <el-form-item label="Crop Type" prop="cropCode">
          <el-input :model-value="getCropDisplayName(form)" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Batch Weight(qt)" prop="batchWeightQt">
          <el-input v-model="form.batchWeightQt" placeholder="Please input" disabled />
        </el-form-item>
        <!-- <el-form-item label="Creation Date" prop="creationDate">
          <el-date-picker clearable v-model="form.creationDate" type="date" value-format="YYYY-MM-DD" placeholder="Please select" disabled>
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
            :disabled="form.status != PostHarvestBatchStatus.Created.toString()"
          />
        </el-form-item>

        <el-table border :data="harvestCollectionList" class="mt-2">
          <!-- <el-table-column label="Primary Key ID" align="center" prop="id" v-if="true" /> -->
          <el-table-column label="Harvest ID" align="center" prop="harvestId" />
          <el-table-column label="Farmer ID" align="center" prop="farmerId" />
          <el-table-column label="Crop Type" align="center" prop="cropName" :formatter="cropFormatter" />
          <el-table-column label="Quantity (qt)" align="center" prop="quantityQt" />
          <el-table-column label="Moisture (%)" align="center" prop="moisturePercentage" />
          <el-table-column label="Collection Date" align="center" prop="collectionDate" width="180" disabled>
            <template #default="scope">
              <span>{{ parseTime(scope.row.collectionDate, '{y}-{m}-{d}') }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <div class="form-footer">
        <template v-if="!isDetail">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">Approve</el-button>
          <el-button :loading="buttonLoading" type="warning" @click="rejectForm">Reject</el-button>
          <!-- <el-button :loading="buttonLoading" type="warning" @click="RevisionForm">Need Revision</el-button> -->
          <el-button @click="cancel">Cancel</el-button>
        </template>
        <el-button v-else @click="cancel">Close</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="PostharvestBatchApprovalForm" lang="ts">
import { listCropMaster } from '@/api/demo/cropMaster';
import { HarvestCollectionVO } from '@/api/demo/harvestCollection/types';
import { addPostharvestBatch, getPostharvestBatch, updatePostharvestBatch } from '@/api/demo/postharvestBatch';
import { PostharvestBatchForm } from '@/api/demo/postharvestBatch/types';
import { PostHarvestBatchStatus } from '@/enums/AgriculturalEnum';
import request from '@/utils/request';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const postharvestBatchFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const isApprove = computed(() => route.path.endsWith('/approve') || route.path.includes('/approve/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const harvestCollectionList = ref<HarvestCollectionVO[]>([]);

const initFormData: PostharvestBatchForm = {
  id: undefined,
  batchId: undefined,
  harvestIdsJson: undefined,
  cropCode: undefined,
  cropName: undefined,
  batchWeightQt: undefined,
  creationDate: undefined,
  status: PostHarvestBatchStatus.Created.toString()
};

const form = ref<PostharvestBatchForm>({ ...initFormData });

const rules = {
  id: [{ required: true, message: 'ID cannot be empty', trigger: 'blur' }],
  batchId: [{ required: true, message: 'Batch ID cannot be empty', trigger: 'blur' }],
  // harvestIdsJson: [{ required: true, message: '关联的收获记录ID列表不能为空 cannot be empty', trigger: 'blur' }],
  cropCode: [{ required: true, message: 'Crop Type cannot be empty', trigger: 'blur' }],
  batchWeightQt: [{ required: true, message: 'Batch Weight cannot be empty', trigger: 'blur' }],
  // creationDate: [{ required: true, message: '批次创建日期时间不能为空 cannot be empty', trigger: 'blur' }],
  status: [{ required: true, message: 'Status cannot be empty', trigger: 'change' }]
};

const cropDataList = ref();
const getCropList = async () => {
  const res = await listCropMaster({ pageNum: 1, pageSize: 2000 });
  cropDataList.value = res.rows || [];
};

const resolveCropNameByCode = (cropCode?: string) => {
  if (!cropCode) {
    return '—';
  }
  const found = cropDataList.value?.find((item) => item.cropCode === cropCode);
  return found?.cropName || cropCode;
};

const getCropDisplayName = (row?: { cropCode?: string; cropName?: string }) => {
  if (row?.cropName) {
    return row.cropName;
  }
  return resolveCropNameByCode(row?.cropCode);
};

const cropFormatter = (row: { cropCode?: string; cropName?: string }) => {
  return getCropDisplayName(row);
};

const getExData = async (row) => {
  const res = await request({
    url: `/demo/postharvestBatch/${row.id}/connection`,
    method: 'get'
  });
  harvestCollectionList.value = res.data;
  form.value.batchWeightQt = res.data.reduce((total, item) => total + (item.quantityQt || 0), 0);

  form.value.cropName = row.cropName || cropDataList.value?.find((item) => item.cropCode == row.cropCode)?.cropName;
};

/** Load record for approve/detail mode */
const loadRecord = async () => {
  if (!id.value) {
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getPostharvestBatch(id.value);
    Object.assign(form.value, res.data);
    await getExData(form.value);
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
  postharvestBatchFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      form.value.status = PostHarvestBatchStatus.Approved.toString();

      if (form.value.id) {
        await updatePostharvestBatch(form.value);
      } else {
        await addPostharvestBatch(form.value);
      }
      proxy?.$modal.msgSuccess('success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    } finally {
      buttonLoading.value = false;
    }
  });
};

const rejectForm = () => {
  postharvestBatchFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      form.value.status = PostHarvestBatchStatus.Rejected.toString();

      if (form.value.id) {
        await updatePostharvestBatch(form.value);
      } else {
        await addPostharvestBatch(form.value);
      }
      proxy?.$modal.msgSuccess('success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    } finally {
      buttonLoading.value = false;
    }
  });
};

const RevisionForm = () => {
  postharvestBatchFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      form.value.status = PostHarvestBatchStatus.NeedRevision.toString();

      if (form.value.id) {
        await updatePostharvestBatch(form.value);
      } else {
        await addPostharvestBatch(form.value);
      }
      proxy?.$modal.msgSuccess('success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    } finally {
      buttonLoading.value = false;
    }
  });
};

onMounted(async () => {
  await getCropList();
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
