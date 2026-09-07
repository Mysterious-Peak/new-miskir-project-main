<template>
  <div v-loading="pageLoading" class="p-2">
    <el-card shadow="never">
      <!-- 添加或修改收获记录对话框 -->
      <el-form ref="harvestFormRef" :model="form" :rules="rules" label-width="auto">
        <el-form-item label="Production Season ID" prop="prodSeasonId">
          <!-- <div v-if="!isViewFlag(form)" class="flex gap-2 flex-1">
            <el-input v-model="form.prodSeasonId" placeholder="Please input Production Season ID" disabled />
            <SelectProductionSeason v-model="form.prodSeasonId" @select="handleProductionSeasonSelect"></SelectProductionSeason>
          </div>
          <el-input v-else v-model="form.prodSeasonId" placeholder="Please input Production Season ID" disabled /> -->
          <el-select
            v-model="form.prodSeasonId"
            filterable
            remote
            reserve-keyword
            placeholder="Please input"
            :remote-method="productionSeasonRemoteMethod"
            :loading="productionSeasonLoading"
            :debounce="300"
            v-if="!isViewFlag(form)"
          >
            <el-option v-for="item in productionSeasonOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-input v-else v-model="form.prodSeasonId" placeholder="Please input" disabled />
        </el-form-item>
        <el-form-item label="Harvest Date" prop="harvestDate">
          <div class="flex flex-1 items-center gap-2">
            <el-date-picker
              clearable
              v-model="form.harvestDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="Please select"
              :disabled="isViewFlag(form) || form.prodSeasonId == undefined"
              :disabled-date="disabledDate"
              :default-value="defaultDate"
            >
            </el-date-picker>
            <el-tooltip content="Meher = October – December; Belg = May – June; off-season = January – February" placement="top">
              <el-icon><InfoFilled /></el-icon>
            </el-tooltip>
          </div>
        </el-form-item>
        <el-form-item label="Harested Area (ha)" prop="harvestedAreaTa">
          <el-input-number
            v-model="form.harvestedAreaTa"
            placeholder="Please input Harested Area (ha)"
            :min="0"
            :max="99999.99"
            style="width: 100%"
            :disabled="isViewFlag(form)"
          />
        </el-form-item>
        <el-form-item label="Harvest Yield (q)" prop="actualYieldQt">
          <el-input-number
            v-model="form.actualYieldQt"
            placeholder="Please input Harvest Yield (q)"
            :min="0"
            :max="99999999.99"
            style="width: 100%"
            :disabled="isViewFlag(form)"
          />
        </el-form-item>
        <el-form-item label="Moisture (%)" prop="moisturePct">
          <el-input-number
            v-model="form.moisturePct"
            placeholder="Please input Moisture"
            :min="0"
            :max="999.99"
            style="width: 100%"
            :disabled="isViewFlag(form)"
          />
        </el-form-item>
        <el-form-item label="Quality Grade" prop="qualityGrade">
          <div class="flex flex-1 items-center gap-2">
            <el-select v-model="form.qualityGrade" placeholder="Please select" :disabled="isViewFlag(form)">
              <el-option v-for="dict in harvest_quality_grade" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
            </el-select>
            <el-tooltip :content="grade_tooltipContent" placement="top">
              <el-icon><InfoFilled /></el-icon>
            </el-tooltip>
          </div>
        </el-form-item>
        <el-form-item label="Methods" prop="methods">
          <el-select v-model="form.methods" placeholder="Please select" :disabled="isViewFlag(form)">
            <el-option v-for="dict in harvest_methods" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="Buyer Name" prop="buyerName">
          <el-input v-model="form.buyerName" placeholder="Please input Buyer Name" maxlength="100" show-word-limit :disabled="isViewFlag(form)" />
        </el-form-item> -->
        <el-form-item label="Recorded By" prop="recordedUserName" v-if="isViewFlag(form)">
          <el-input v-model="form.recordedUserName" placeholder="Please input Recorded By" disabled />
        </el-form-item>
        <el-form-item label="Created Time" prop="createTime" v-if="isViewFlag(form)">
          <el-date-picker clearable v-model="form.createTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Approved By" prop="verifiedUserName" v-if="isViewFlag(form)">
          <el-input v-model="form.verifiedUserName" placeholder="Please input Approved By" disabled />
        </el-form-item>
        <el-form-item label="Approved Date" prop="verifiedAt" v-if="isViewFlag(form)">
          <el-date-picker clearable v-model="form.verifiedAt" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="Please select" disabled>
          </el-date-picker>
        </el-form-item>
        <el-form-item label="Approval Comment" prop="approvedComment" v-if="isViewFlag(form)">
          <el-input v-model="form.approvedComment" type="textarea" placeholder="Please input" disabled />
        </el-form-item>
        <!-- <el-form-item label="Status" prop="status" v-if="isViewFlag(form)">
          <el-tag>{{ ApprovalStatus[form.status as unknown as ApprovalStatus] }}</el-tag>
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

<script setup name="HarvestForm" lang="ts">
import { getCroppingPlan } from '@/api/demo/croppingPlan';
import { getHarvest, addHarvest, updateHarvest } from '@/api/demo/harvest';
import { HarvestForm } from '@/api/demo/harvest/types';
import { getProductionSeason, listProductionSeason } from '@/api/demo/productionSeason';
import { ApprovalStatus, CroppingSeasonStatus } from '@/enums/AgriculturalEnum';

import { InfoFilled } from '@element-plus/icons-vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const { harvest_quality_grade, harvest_methods } = toRefs<any>(
  proxy?.useDict('harvest_quality_grade', 'harvest_methods')
);

const pageLoading = ref(false);
const buttonLoading = ref(false);
const harvestFormRef = ref<ElFormInstance>();

const isAdd = computed(() => route.path.endsWith('/add'));
const isDetail = computed(() => route.path.endsWith('/detail') || route.path.includes('/detail/'));
const isEdit = computed(() => route.path.endsWith('/edit') || route.path.includes('/edit/'));
const id = computed(() => (route.params.id as string) || '');

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/[^/]+$/, ''));

const initFormData: HarvestForm = {
  harvestId: undefined,
  prodSeasonId: undefined,
  harvestDate: undefined,
  harvestedAreaTa: undefined,
  actualYieldQt: undefined,
  moisturePct: undefined,
  qualityGrade: undefined,
  buyerName: undefined,
  recordedBy: undefined,
  recordedUserName: undefined,
  verifiedBy: undefined,
  verifiedUserName: undefined,
  verifiedAt: undefined,
  deptId: undefined,
  remark: undefined,
  status: ApprovalStatus.Draft.toString(),
  createBy: undefined,
  createTime: undefined,
  croppingPlan: undefined,
  approvedComment: undefined
};

const form = ref<HarvestForm>({ ...initFormData });

const rules = {
  // harvestId: [{ required: true, message: '收获ID不能为空', trigger: 'blur' }],
  prodSeasonId: [{ required: true, message: 'Production Season ID can not be null', trigger: 'blur' }],
  harvestDate: [{ required: true, message: 'Harvest Date can not be null', trigger: 'blur' }],
  actualYieldQt: [{ required: true, message: 'Harvest Yield can not be null', trigger: 'blur' }],
  moisturePct: [{ required: true, message: 'Moisture (%) can not be null', trigger: 'blur' }],
  recordedBy: [{ required: true, message: 'Recorded By can not be null', trigger: 'blur' }]
};

const productionSeasonOptions = ref([]);
const productionSeasonList = ref([]);
const productionSeasonLoading = ref(false);
const productionSeasonRemoteMethod = async (query: string) => {
  if (query) {
    productionSeasonLoading.value = true;

    const res = await listProductionSeason({ pageNum: 1, pageSize: 10, prodSeasonId: query, status: CroppingSeasonStatus.InProgress.toString() });
    productionSeasonList.value = res.rows;
    productionSeasonOptions.value = res.rows.map((item) => ({
      value: item.prodSeasonId,
      label: `${item.prodSeasonId}`
    }));
    productionSeasonLoading.value = false;
  } else {
    productionSeasonOptions.value = [];
  }
};

const grade_tooltipContent = computed(() => {
  if (form.value.qualityGrade == '0') {
    return '<2% foreign matter';
  } else if (form.value.qualityGrade == '1') {
    return '<5% foreign matter';
  } else if (form.value.qualityGrade == '2') {
    return '>5% foreign matter';
  } else {
    return 'Please select a quality grade';
  }
});

const getExData = async (prodSeasonId) => {
  const seasonRes = await getProductionSeason(prodSeasonId);
  if (seasonRes.data) {
    const planRes = await getCroppingPlan(seasonRes.data.planId);
    if (planRes.data) {
      form.value.croppingPlan = planRes.data;
      // form.value.seasonName = seasonDataList.value.find((item) => item.id == form.value.croppingPlan.seasonId).seasonName;
      form.value.seasonName = form.value.croppingPlan.seasonName;
    }
  }
};

const handleProductionSeasonSelect = async (row: any) => {
  const planRes = await getCroppingPlan(row.planId);
  if (planRes.data) {
    form.value.croppingPlan = planRes.data;
    // form.value.seasonName = seasonDataList.value.find((item) => item.id == form.value.croppingPlan.seasonId).seasonName;
    form.value.seasonName = form.value.croppingPlan.seasonName;
  }
};

const disabledDate = (time: Date) => {
  if (form.value.seasonName == 'Meher') {
    return !(time.getMonth() + 1 >= 10 && time.getMonth() + 1 <= 12);
  } else if (form.value.seasonName == 'Belg') {
    return !(time.getMonth() + 1 >= 5 && time.getMonth() + 1 <= 6);
  } else if (form.value.seasonName == 'Irrigation') {
    return !(time.getMonth() + 1 >= 1 && time.getMonth() + 1 <= 2);
  }
  return true;
};
const defaultDate = computed(() => {
  if (form.value.seasonName == 'Meher') {
    return new Date(new Date().getFullYear(), 10, 1);
  } else if (form.value.seasonName == 'Belg') {
    return new Date(new Date().getFullYear(), 5, 1);
  } else if (form.value.seasonName == 'Irrigation') {
    return new Date(new Date().getFullYear(), 1, 1);
  }
  return new Date();
});

const isViewFlag = (data) => {
  return data.status == ApprovalStatus.Approved || data.status == ApprovalStatus.Rejected;
};

/** Load record for edit/detail mode */
const loadRecord = async () => {
  if (isAdd.value || !id.value) {
    form.value = { ...initFormData };
    return;
  }
  pageLoading.value = true;
  try {
    const res = await getHarvest(id.value);
    Object.assign(form.value, res.data);
    getExData(form.value.prodSeasonId);
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
  harvestFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      form.value.status = ApprovalStatus.Draft.toString();

      if (form.value.harvestId) {
        await updateHarvest(form.value);
      } else {
        await addHarvest(form.value);
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
