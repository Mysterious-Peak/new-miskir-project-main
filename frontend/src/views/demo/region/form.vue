<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- Add or Edit Region Dialog -->
      <el-form ref="regionFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="auto">
        <el-form-item label="上一级行政区划编码" prop="parentCode">
          <el-input v-model="form.parentCode" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="行政区划编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入行政区划编码" />
        </el-form-item>
        <el-form-item label="层级" prop="level">
          <el-select v-model="form.level" placeholder="请选择层级">
            <el-option v-for="dict in region_level" :key="dict.value" :label="dict.label" :value="parseInt(dict.value)"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="区域名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入区域名称" />
        </el-form-item>
        <el-form-item label="中心经度" prop="centerLongitude">
          <el-input v-model="form.centerLongitude" placeholder="请输入中心经度" />
        </el-form-item>
        <el-form-item label="中心纬度" prop="centerLatitude">
          <el-input v-model="form.centerLatitude" placeholder="请输入中心纬度" />
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

<script setup name="RegionForm" lang="ts">
import { getRegion, addRegion, updateRegion } from '@/api/demo/region';
import { RegionForm } from '@/api/demo/region/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { region_level } = toRefs<any>(proxy?.useDict('region_level'));
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const regionFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: RegionForm = {
  id: undefined,
  parentCode: undefined,
  code: undefined,
  level: undefined,
  name: undefined,
  centerLongitude: undefined,
  centerLatitude: undefined
};

const form = ref<RegionForm>({ ...initFormData });

const rules = {
  id: [{ required: true, message: '不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '行政区划编码不能为空', trigger: 'blur' }],
  level: [{ required: true, message: '层级: 1=Region, 2=Zone, 3=Woreda, 4=Kebele不能为空', trigger: 'change' }],
  name: [{ required: true, message: '区域名称不能为空', trigger: 'blur' }]
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getRegion(id.value);
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
  regionFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      if (isEdit.value) {
        await updateRegion(form.value);
      } else {
        await addRegion(form.value);
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
