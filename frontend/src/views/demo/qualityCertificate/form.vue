<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- 添加或修改质量认证证书对话框 -->
      <el-form ref="qualityCertificateFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="production_batch_id" prop="productionBatchId">
          <el-input v-model="form.productionBatchId" placeholder="请输入production_batch_id" />
        </el-form-item>
        <el-form-item label="issuing_body" prop="issuingBody">
          <el-input v-model="form.issuingBody" placeholder="请输入issuing_body" />
        </el-form-item>
        <el-form-item label="valid_until" prop="validUntil">
          <el-date-picker clearable
            v-model="form.validUntil"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择valid_until">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="document_url" prop="documentUrl">
            <el-input v-model="form.documentUrl" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="approved_by" prop="approvedBy">
          <el-input v-model="form.approvedBy" placeholder="请输入approved_by" />
        </el-form-item>
        <el-form-item label="approved_by" prop="approvedComment">
            <el-input v-model="form.approvedComment" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="Approval Time" prop="approvedAt">
          <el-date-picker clearable
            v-model="form.approvedAt"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择Approval Time">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div class="form-footer">
        <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="QualityCertificateForm" lang="ts">
import { getQualityCertificate, addQualityCertificate, updateQualityCertificate } from '@/api/demo/qualityCertificate';
import { QualityCertificateForm } from '@/api/demo/qualityCertificate/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const qualityCertificateFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: QualityCertificateForm = {
  certificateId: undefined,
  productionBatchId: undefined,
  certificateType: undefined,
  issuingBody: undefined,
  validUntil: undefined,
  documentUrl: undefined,
  approvedBy: undefined,
  approvedComment: undefined,
  approvedAt: undefined
};

const form = ref<QualityCertificateForm>({ ...initFormData });

const rules = {
  certificateId: [{ required: true, message: 'certificate_id不能为空', trigger: 'blur' }],
  productionBatchId: [{ required: true, message: 'production_batch_id不能为空', trigger: 'blur' }],
  certificateType: [{ required: true, message: 'ISO / Organic / Export不能为空', trigger: 'change' }]
};

/** Load record for edit mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getQualityCertificate(id.value);
    Object.assign(form.value, res.data);
  } finally {
    pageLoading.value = false;
  }
};

/** 取消按钮 */
const cancel = () => {
  router.push(listPath.value);
};

/** 提交按钮 */
const submitForm = () => {
  qualityCertificateFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      if (form.value.certificateId) {
        await updateQualityCertificate(form.value);
      } else {
        await addQualityCertificate(form.value);
      }
      proxy?.$modal.msgSuccess('操作成功');
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
