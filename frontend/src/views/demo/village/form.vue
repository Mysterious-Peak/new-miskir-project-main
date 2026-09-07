<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- Add or Edit Village Dialog -->
      <el-form ref="villageFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="auto">
        <el-form-item label="Unique code of the village" prop="code">
          <el-input v-model="form.code" placeholder="请输入Unique code of the village" />
        </el-form-item>
        <el-form-item label="Name of the village" prop="name">
          <el-input v-model="form.name" placeholder="请输入Name of the village" />
        </el-form-item>
        <el-form-item label="Longitude coordinate of the village center" prop="longitude">
          <el-input v-model="form.longitude" placeholder="请输入Longitude coordinate of the village center" />
        </el-form-item>
        <el-form-item label="Latitude coordinate of the village center" prop="latitude">
          <el-input v-model="form.latitude" placeholder="请输入Latitude coordinate of the village center" />
        </el-form-item>
        <el-form-item label="Brief description or introduction of the village" prop="introduction">
          <el-input v-model="form.introduction" placeholder="请输入Brief description or introduction of the village" />
        </el-form-item>
        <el-form-item label="Region Code" prop="regionCode">
          <el-input v-model="form.regionCode" placeholder="请输入" />
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

<script setup name="VillageForm" lang="ts">
import { getVillage, addVillage, updateVillage } from '@/api/demo/village';
import { VillageForm } from '@/api/demo/village/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const villageFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: VillageForm = {
  id: undefined,
  code: undefined,
  name: undefined,
  longitude: undefined,
  latitude: undefined,
  introduction: undefined,
  regionCode: undefined
};

const form = ref<VillageForm>({ ...initFormData });

const rules = {
  id: [{ required: true, message: '不能为空', trigger: 'blur' }],
  code: [{ required: true, message: 'Unique code of the village不能为空', trigger: 'blur' }],
  name: [{ required: true, message: 'Name of the village不能为空', trigger: 'blur' }],
  introduction: [{ required: true, message: 'Brief description or introduction of the village不能为空', trigger: 'blur' }]
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getVillage(id.value);
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
  villageFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      if (isEdit.value) {
        await updateVillage(form.value);
      } else {
        await addVillage(form.value);
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
