<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- 添加或修改作物主数据对话框 -->
      <el-form ref="cropMasterFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="80px">
        <el-form-item label="Crop Code" prop="cropCode">
          <el-input v-model="form.cropCode" placeholder="Please input Crop Code" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="Crop Name" prop="cropName">
          <el-input v-model="form.cropName" placeholder="Please input Crop Name" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="Description" />
        </el-form-item>
        <!-- <el-form-item label="排序" prop="sort">
          <el-input v-model="form.sort" placeholder="请输入排序" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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

<script setup name="CropMasterForm" lang="ts">
import { addCropMaster, getCropMaster, updateCropMaster } from '@/api/demo/cropMaster';
import { CropMasterForm } from '@/api/demo/cropMaster/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const cropMasterFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: CropMasterForm = {
  id: undefined,
  cropCode: undefined,
  cropName: undefined,
  description: undefined,
  sort: undefined,
  status: undefined,
  remark: undefined
};

const form = ref<CropMasterForm>({ ...initFormData });

const rules = {
  // id: [{ required: true, message: '不能为空', trigger: 'blur' }],
  cropCode: [{ required: true, message: 'Crop Code Cannot be empty', trigger: 'blur' }],
  cropName: [{ required: true, message: 'Crop Name Cannot be empty', trigger: 'blur' }]
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getCropMaster(id.value);
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
  cropMasterFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      if (isEdit.value) {
        await updateCropMaster(form.value);
      } else {
        await addCropMaster(form.value);
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
