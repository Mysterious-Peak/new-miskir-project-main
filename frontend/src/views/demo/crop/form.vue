<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- 添加或修改Crop Management对话框 -->
      <el-form ref="cropFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="80px">
        <el-form-item label="Name of the crop (e.g., Rice, Wheat, Tomato)" prop="name">
          <el-input v-model="form.name" placeholder="请输入Name of the crop (e.g., Rice, Wheat, Tomato)" />
        </el-form-item>
        <el-form-item label="Foreign key referencing the crop category (ori_crop_category.id)" prop="categoryId">
          <el-input v-model="form.categoryId" placeholder="请输入Foreign key referencing the crop category (ori_crop_category.id)" />
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

<script setup name="CropForm" lang="ts">
import { getCrop, addCrop, updateCrop } from '@/api/demo/crop';
import { CropForm } from '@/api/demo/crop/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const cropFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: CropForm = {
  id: undefined,
  name: undefined,
  categoryId: undefined
};

const form = ref<CropForm>({ ...initFormData });

const rules = {
  id: [{ required: true, message: "Unique auto-incremented identifier for the crop不能为空", trigger: "blur" }],
  name: [{ required: true, message: "Name of the crop (e.g., Rice, Wheat, Tomato)不能为空", trigger: "blur" }],
  categoryId: [{ required: true, message: "Foreign key referencing the crop category (ori_crop_category.id)不能为空", trigger: "blur" }]
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getCrop(id.value);
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
  cropFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      if (isEdit.value) {
        await updateCrop(form.value);
      } else {
        await addCrop(form.value);
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
