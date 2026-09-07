<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- 添加或修改季节主数据对话框 -->
      <el-form ref="seasonMasterFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="auto">
        <el-form-item label="Season Code" prop="seasonCode">
          <el-input v-model="form.seasonCode" placeholder="Please input Season Code" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="Season Name" prop="seasonName">
          <el-input v-model="form.seasonName" placeholder="Please input Season Name" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="Please input Description" maxlength="500" show-word-limit />
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

<script setup name="SeasonMasterForm" lang="ts">
import { addSeasonMaster, getSeasonMaster, updateSeasonMaster } from '@/api/demo/seasonMaster';
import { SeasonMasterForm } from '@/api/demo/seasonMaster/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const seasonMasterFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: SeasonMasterForm = {
  id: undefined,
  seasonCode: undefined,
  seasonName: undefined,
  description: undefined
};

const form = ref<SeasonMasterForm>({ ...initFormData });

const rules = {
  // id: [{ required: true, message: '不能为空', trigger: 'blur' }],
  seasonCode: [{ required: true, message: 'Season Code cannot be empty', trigger: 'blur' }],
  seasonName: [{ required: true, message: 'Season Name Cannot be empty', trigger: 'blur' }]
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getSeasonMaster(id.value);
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
  seasonMasterFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      if (isEdit.value) {
        await updateSeasonMaster(form.value);
      } else {
        await addSeasonMaster(form.value);
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
