<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- 添加或修改生产季节对话框 -->
      <el-form ref="productionSeasonFormRef" :model="form" :rules="rules" label-width="auto">
        <!-- <el-form-item label="生产季节编号" prop="prodSeasonCode">
          <el-input v-model="form.prodSeasonCode" placeholder="请输入生产季节编号" />
        </el-form-item> -->
        <el-form-item label="Plan ID" prop="planId">
          <el-input v-model="form.planId" placeholder="Please input " disabled />
        </el-form-item>
        <el-form-item label="FarmLand ID" prop="farmlandId">
          <el-input v-model="form.farmlandId" placeholder="Please input " disabled />
        </el-form-item>
        <el-form-item label="Crop Type" prop="cropId">
          <el-input :model-value="getCropNameById(form.cropId)" placeholder="Please input " disabled />
        </el-form-item>
        <el-form-item label="Season" prop="seasonId">
          <el-input :model-value="getSeasonNameById(form.seasonId)" placeholder="Please input " disabled />
        </el-form-item>
        <el-form-item label="Year" prop="year">
          <el-input v-model="form.year" placeholder="Please input " disabled />
        </el-form-item>
        <el-form-item label="Area" prop="areaHa">
          <el-input v-model="form.areaTa" placeholder="Please input " disabled />
        </el-form-item>
        <el-form-item label="Created By" prop="createdUserName">
          <el-input v-model="form.createdUserName" placeholder="Please input Created By" disabled />
        </el-form-item>
        <el-form-item label="Created Date" prop="createTime">
          <el-date-picker clearable v-model="form.createTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Status" prop="status">
          <el-select v-model="form.status" placeholder="Please select Status" style="width: 100%" :disabled="isDetail">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.value === CroppingSeasonStatus.InProgress.toString() || item.value === CroppingSeasonStatus.Completed.toString()"
            />
            <el-option label="Canceled" :value="CroppingSeasonStatus.Cancelled.toString()" />
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

<script setup name="ProductionSeasonForm" lang="ts">
import { listCropMaster } from '@/api/demo/cropMaster';
import { addProductionSeason, getProductionSeason, updateProductionSeason } from '@/api/demo/productionSeason';
import { ProductionSeasonForm } from '@/api/demo/productionSeason/types';
import { listSeasonMaster } from '@/api/demo/seasonMaster';
import { CroppingSeasonStatus } from '@/enums/AgriculturalEnum';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const productionSeasonFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const statusOptions = [
  { value: CroppingSeasonStatus.Planned.toString(), label: 'Planned' },
  { value: CroppingSeasonStatus.InProgress.toString(), label: 'InProgress' },
  { value: CroppingSeasonStatus.Completed.toString(), label: 'Completed' }
  // { value: CroppingSeasonStatus.Cancelled.toString(), label: 'Cancelled' }
];

const initFormData: ProductionSeasonForm = {
  prodSeasonId: undefined,
  prodSeasonCode: undefined,
  planId: undefined,
  farmlandId: undefined,
  cropId: undefined,
  seasonId: undefined,
  year: undefined,
  areaTa: undefined,
  status: '0',
  createdUserName: undefined,
  createTime: undefined,
  deptId: undefined,
  remark: undefined
};

const form = ref<ProductionSeasonForm>({ ...initFormData });

const rules = {
  // prodSeasonId: [{ required: true, message: ' can not be null', trigger: 'blur' }],
  planId: [{ required: true, message: 'Plan ID can not be null', trigger: 'blur' }],
  farmlandId: [{ required: true, message: 'FarmLand ID can not be null', trigger: 'blur' }],
  cropId: [{ required: true, message: 'Crop ID can not be null', trigger: 'blur' }],
  seasonId: [{ required: true, message: 'Season ID can not be null', trigger: 'blur' }],
  year: [{ required: true, message: 'Year can not be null', trigger: 'blur' }],
  areaTa: [{ required: true, message: 'Area can not be null', trigger: 'blur' }]
};

const cropDataList = ref();
const getCropList = async () => {
  const res = await listCropMaster({ pageNum: 1, pageSize: 2000 });
  cropDataList.value = res.rows;
};
const seasonDataList = ref();
const getSeasonList = async () => {
  const res = await listSeasonMaster({ pageNum: 1, pageSize: 2000 });
  seasonDataList.value = res.rows;
};

const getCropNameById = (cropId: string | number | undefined) => {
  if (cropId === undefined || cropId === null || cropId === '') {
    return '';
  }
  return cropDataList.value?.find((item) => String(item.id) === String(cropId))?.cropName || String(cropId);
};
const getSeasonNameById = (seasonId: string | number | undefined) => {
  if (seasonId === undefined || seasonId === null || seasonId === '') {
    return '';
  }
  return seasonDataList.value?.find((item) => String(item.id) === String(seasonId))?.seasonName || String(seasonId);
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getProductionSeason(id.value);
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
  productionSeasonFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      if (form.value.prodSeasonId) {
        await updateProductionSeason(form.value);
      } else {
        await addProductionSeason(form.value);
      }
      proxy?.$modal.msgSuccess('Success');
      router.push({ path: listPath.value, query: { refresh: '1' } });
    } finally {
      buttonLoading.value = false;
    }
  });
};

onMounted(async () => {
  await getCropList();
  await getSeasonList();
  await loadRecord();
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
