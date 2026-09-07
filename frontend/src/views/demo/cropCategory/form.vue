<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- 添加或修改Crop category Management对话框 -->
      <el-form ref="cropCategoryFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="80px">
        <el-form-item label="Name of the crop category (e.g., Cereals, Vegetables, Fruits)" prop="name">
          <el-input v-model="form.name" placeholder="请输入Name of the crop category (e.g., Cereals, Vegetables, Fruits)" />
        </el-form-item>
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

<script setup name="CropCategoryForm" lang="ts">
import { getCropCategory, addCropCategory, updateCropCategory } from '@/api/demo/cropCategory';
import { CropCategoryForm } from '@/api/demo/cropCategory/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const cropCategoryFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: CropCategoryForm = {
  id: undefined,
  name: undefined
};

const form = ref<CropCategoryForm>({ ...initFormData });

const rules = {
  id: [{ required: true, message: "Unique auto-incremented identifier for the crop category不能为空", trigger: "blur" }],
  name: [{ required: true, message: "Name of the crop category (e.g., Cereals, Vegetables, Fruits)不能为空", trigger: "blur" }]
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getCropCategory(id.value);
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
  cropCategoryFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      if (isEdit.value) {
        await updateCropCategory(form.value);
      } else {
        await addCropCategory(form.value);
      }
      proxy?.$modal.msgSuccess("操作成功");
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
