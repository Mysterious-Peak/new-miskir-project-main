<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- 添加或修改Original plot information table对话框 -->
      <el-form ref="plotFormRef" :model="form" :rules="rules" :disabled="isDetail" label-width="auto">
        <el-form-item label="Name of the plot" prop="name">
          <el-input v-model="form.name" placeholder="请输入Name of the plot" />
        </el-form-item>
        <el-form-item label="Unique code identifying the plot" prop="plotCode">
          <el-input v-model="form.plotCode" placeholder="请输入Unique code identifying the plot" />
        </el-form-item>
        <el-form-item label="ID of the village where the plot is located" prop="villageId">
          <el-input v-model="form.villageId" placeholder="请输入ID of the village where the plot is located" />
        </el-form-item>
        <el-form-item label="ID of the farmer who owns or manages the plot" prop="farmerId">
          <el-input v-model="form.farmerId" placeholder="请输入ID of the farmer who owns or manages the plot" />
        </el-form-item>
        <el-form-item label="Area of the plot in square meters (or other defined unit)" prop="area">
          <el-input v-model="form.area" placeholder="请输入Area of the plot in square meters (or other defined unit)" />
        </el-form-item>
        <el-form-item label="Sorting order for display purposes" prop="orderSort">
          <el-input v-model="form.orderSort" placeholder="请输入Sorting order for display purposes" />
        </el-form-item>
        <el-form-item label="Longitude coordinate of the plot location" prop="longitude">
          <el-input v-model="form.longitude" placeholder="请输入Longitude coordinate of the plot location" />
        </el-form-item>
        <el-form-item label="Latitude coordinate of the plot location" prop="latitude">
          <el-input v-model="form.latitude" placeholder="请输入Latitude coordinate of the plot location" />
        </el-form-item>
        <el-form-item label="Brief description or introduction of the plot" prop="introduction">
          <el-input v-model="form.introduction" placeholder="请输入Brief description or introduction of the plot" />
        </el-form-item>
        <el-form-item label="Type of soil on the plot " prop="soilType">
          <el-select v-model="form.soilType" placeholder="请选择Type of soil on the plot ">
            <el-option v-for="dict in ori_soil_type" :key="dict.value" :label="dict.label" :value="parseInt(dict.value)"></el-option>
          </el-select>
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

<script setup name="PlotForm" lang="ts">
import { getPlot, addPlot, updatePlot } from '@/api/demo/plot';
import { PlotForm } from '@/api/demo/plot/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { ori_soil_type } = toRefs<any>(proxy?.useDict('ori_soil_type'));
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const plotFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: PlotForm = {
  id: undefined,
  name: undefined,
  plotCode: undefined,
  villageId: undefined,
  farmerId: undefined,
  area: undefined,
  orderSort: undefined,
  longitude: undefined,
  latitude: undefined,
  introduction: undefined,
  soilType: undefined
};

const form = ref<PlotForm>({ ...initFormData });

const rules = {
  id: [{ required: true, message: 'Unique identifier for the plot不能为空', trigger: 'blur' }],
  name: [{ required: true, message: 'Name of the plot不能为空', trigger: 'blur' }],
  plotCode: [{ required: true, message: 'Unique code identifying the plot不能为空', trigger: 'blur' }],
  villageId: [{ required: true, message: 'ID of the village where the plot is located不能为空', trigger: 'blur' }],
  farmerId: [{ required: true, message: 'ID of the farmer who owns or manages the plot不能为空', trigger: 'blur' }],
  area: [{ required: true, message: 'Area of the plot in square meters (or other defined unit)不能为空', trigger: 'blur' }],
  orderSort: [{ required: true, message: 'Sorting order for display purposes不能为空', trigger: 'blur' }],
  longitude: [{ required: true, message: 'Longitude coordinate of the plot location不能为空', trigger: 'blur' }],
  latitude: [{ required: true, message: 'Latitude coordinate of the plot location不能为空', trigger: 'blur' }],
  soilType: [{ required: true, message: 'Type of soil on the plot (coded value, e.g., 1=sandy, 2=clay, etc.)不能为空', trigger: 'change' }]
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getPlot(id.value);
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
  plotFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      if (isEdit.value) {
        await updatePlot(form.value);
      } else {
        await addPlot(form.value);
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
