<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- Add or Edit Soil Type Master Data Dialog -->
      <el-form ref="soilTypeMasterFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="auto">
        <el-form-item label="Soil Code" prop="soilCode">
          <el-input v-model="form.soilCode" placeholder="Please input Soil Code" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="Soil Name" prop="soilName">
          <el-input v-model="form.soilName" placeholder="Please input Soil Name" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="Please input Description" />
        </el-form-item>
        <!-- <el-form-item label="Sort" prop="sort">
          <el-input v-model="form.sort" placeholder="请输入排序" />
        </el-form-item> -->
        <!-- <el-form-item label="Remark" prop="remark">
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

<script setup name="SoilTypeMasterForm" lang="ts">
import { getSoilTypeMaster, addSoilTypeMaster, updateSoilTypeMaster } from '@/api/demo/soilTypeMaster';
import { SoilTypeMasterForm } from '@/api/demo/soilTypeMaster/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const soilTypeMasterFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: SoilTypeMasterForm = {
  id: undefined,
  soilCode: undefined,
  soilName: undefined,
  description: undefined,
  sort: undefined,
  status: undefined,
  remark: undefined
};

const form = ref<SoilTypeMasterForm>({ ...initFormData });

const rules = {
  // id: [{ required: true, message: '不能为空', trigger: 'blur' }],
  soilCode: [{ required: true, message: 'Soil Code Cannot be empty', trigger: 'blur' }],
  soilName: [{ required: true, message: 'Soil Name Cannot be empty', trigger: 'blur' }]
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getSoilTypeMaster(id.value);
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
  soilTypeMasterFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      if (isEdit.value) {
        await updateSoilTypeMaster(form.value);
      } else {
        await addSoilTypeMaster(form.value);
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
