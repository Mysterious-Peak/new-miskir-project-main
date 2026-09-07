<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- 添加或修改质量等级标准对话框 -->
      <el-form ref="qualityGradeMasterFormRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="Grade Code" prop="gradeCode">
          <el-input v-model="form.gradeCode" placeholder="Please input Grade Code" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="Grade Name" prop="gradeName">
          <el-input v-model="form.gradeName" placeholder="Please input Grade Name" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="Please input Description" />
        </el-form-item>
      </el-form>
      <div class="form-footer">
        <el-button @click="cancel">Cancel</el-button>
        <el-button :loading="buttonLoading" type="primary" @click="submitForm">Save</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup name="QualityGradeMasterForm" lang="ts">
import { addQualityGradeMaster, getQualityGradeMaster, updateQualityGradeMaster } from '@/api/demo/qualityGradeMaster';
import { QualityGradeMasterForm } from '@/api/demo/qualityGradeMaster/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const qualityGradeMasterFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: QualityGradeMasterForm = {
  id: undefined,
  gradeCode: undefined,
  gradeName: undefined,
  description: undefined
};

const form = ref<QualityGradeMasterForm>({ ...initFormData });

const rules = {
  // id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
  gradeCode: [{ required: true, message: 'Grade Code cannot be empty', trigger: 'blur' }],
  gradeName: [{ required: true, message: 'Grade Name cannot be empty', trigger: 'blur' }]
};

/** Load record for edit mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getQualityGradeMaster(id.value);
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
  qualityGradeMasterFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      if (isEdit.value) {
        await updateQualityGradeMaster(form.value);
      } else {
        await addQualityGradeMaster(form.value);
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
