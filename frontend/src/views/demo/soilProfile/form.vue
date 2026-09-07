<template>
  <div v-loading="pageLoading" class="p-2">
    <el-form ref="soilProfileFormRef" :model="form" :rules="rules" label-position="right">
      <el-alert
        v-if="existingProfile"
        class="mb-3"
        type="warning"
        :closable="false"
        show-icon
        title="An approved soil profile already exists for this Farmland ID. The latest record has been loaded as a starting point."
      />
      <el-steps :active="currentStep" finish-status="success" process-status="process" align-center class="soil-profile-steps">
        <el-step v-for="step in steps" :key="step.title" :title="step.title" />
      </el-steps>
      <SoilProfileFormBody
        :key="formKey"
        :form="form"
        :current-step="currentStep"
        :disabled="isView"
        :show-farmland-select="!isView"
        :show-audit-fields="isView"
        :farm-land-options="farmLandOptionsPop"
        :farm-land-loading="farmLandLoadingPop"
        @farmland-search="farmLandRemoteMethodPop"
        @farmland-change="handleFarmlandChange"
      />
      <div class="form-footer">
        <template v-if="isView">
          <el-button v-if="currentStep > 0" @click="previousStep">Back</el-button>
          <el-button v-if="currentStep < steps.length - 1" type="primary" @click="nextStep">Next</el-button>
          <el-button v-else @click="cancel">Close</el-button>
        </template>
        <template v-else>
          <el-button @click="cancel">Cancel</el-button>
          <el-button v-if="currentStep > 0" @click="previousStep">Back</el-button>
          <el-button v-if="currentStep < steps.length - 1" type="primary" @click="nextStep">Next</el-button>
          <el-button v-else :loading="buttonLoading" type="primary" @click="submitForm">Save</el-button>
        </template>
      </div>
    </el-form>
  </div>
</template>

<script setup name="SoilProfileForm" lang="ts">
import { listFarmland } from '@/api/demo/farmland';
import { addSoilProfile, getSoilProfile, listSoilProfile, updateSoilProfile } from '@/api/demo/soilProfile';
import { SoilProfileForm, SoilProfileVO } from '@/api/demo/soilProfile/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';
import { initSoilProfileForm, parseSoilProfileFormData } from '@/views/demo/soilProfile/constants';
import SoilProfileFormBody from '@/views/demo/soilProfile/SoilProfileFormBody.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();

const pageLoading = ref(false);
const buttonLoading = ref(false);
const existingProfile = ref<SoilProfileVO | null>(null);
const formKey = ref(0);
const soilProfileFormRef = ref<ElFormInstance>();
const form = ref<SoilProfileForm>(initSoilProfileForm());
const currentStep = ref(0);
const isView = computed(() => route.query.mode === 'view');
const isEdit = computed(() => !!route.query.soilProfileId && !isView.value);

const allSteps = [
  {
    title: 'Basic & Texture',
    fields: [
      'farmlandId',
      'sampleDate',
      'ph',
      'organicMatterPct',
      'nlevel',
      'plevel',
      'klevel',
      'sandPct',
      'siltPct',
      'clayPct',
      'soilTypeClassification',
      'soilStructure',
      'gravelStoneContent'
    ]
  },
  {
    title: 'Condition & Water',
    fields: [
      'bulkDensity',
      'porosity',
      'penetrationResistance',
      'fieldCapacity',
      'wiltingPoint',
      'infiltrationRate',
      'hydraulicConductivity',
      'volumetricMoisture',
      'drainageStatus',
      'waterTableDepth',
      'evapotranspirationRate'
    ]
  },
  {
    title: 'Chemistry & Macro Nutrients',
    fields: [
      'electricalConductivity',
      'limeContentPct',
      'naLevel',
      'salinizationRisk',
      'acidificationTrend',
      'cationExchangeCapacity',
      'caLevel',
      'mgLevel',
      'sLevel'
    ]
  },
  {
    title: 'Trace Elements & Contaminants',
    fields: ['feLevel', 'znLevel', 'mnLevel', 'cuLevel', 'bLevel', 'moLevel', 'heavyMetalPb', 'heavyMetalCd', 'heavyMetalAs']
  },
  {
    title: 'Biology, Health & Remarks',
    fields: [
      'microbialBiomass',
      'respirationRate',
      'microbialDiversityIndex',
      'earthwormDensity',
      'enzymeActivity',
      'omDecompositionRate',
      'rootDensity',
      'soilTemperature',
      'erosionRiskLevel',
      'nutrientDepletionRate',
      'compactionTrend',
      'desertificationVulnerabilityIndex',
      'remark'
    ]
  },
  { title: 'Audit Details', fields: ['createdUserName', 'createTime', 'approvedUserName', 'approvedAt', 'approvedComment'] }
];

const steps = computed(() => (isView.value ? allSteps : allSteps.slice(0, -1)));

const rules = {
  farmlandId: [{ required: true, message: 'Farmland ID cannot be empty', trigger: 'change' }],
  sampleDate: [{ required: true, message: 'Sample Date cannot be empty', trigger: 'change' }]
};

const farmLandOptionsPop = ref<Array<{ value: string | number; label: string }>>([]);
const farmLandLoadingPop = ref(false);

const farmLandRemoteMethodPop = async (query: string) => {
  if (query) {
    farmLandLoadingPop.value = true;
    try {
      const res = await listFarmland({ pageNum: 1, pageSize: null, id: query });
      farmLandOptionsPop.value = (res.rows || []).map((item) => ({
        value: String(item.id),
        label: `${item.id}`
      }));
    } finally {
      farmLandLoadingPop.value = false;
    }
  } else {
    farmLandOptionsPop.value = [];
  }
};

const listPath = computed(() => (route.meta.showPath as string) || route.path.replace(/\/form$/, ''));

const resetForm = () => {
  form.value = initSoilProfileForm();
  currentStep.value = 0;
  existingProfile.value = null;
  farmLandOptionsPop.value = [];
  nextTick(() => {
    soilProfileFormRef.value?.clearValidate();
  });
};

const validateCurrentStep = async () => {
  const fields = steps.value[currentStep.value]?.fields || [];
  if (!fields.length) return true;
  if (!soilProfileFormRef.value) return false;
  try {
    await soilProfileFormRef.value.validateField(fields);
    return true;
  } catch {
    return false;
  }
};

const nextStep = async () => {
  if (!isView.value && !(await validateCurrentStep())) return;
  if (currentStep.value < steps.value.length - 1) {
    currentStep.value += 1;
    nextTick(() => soilProfileFormRef.value?.clearValidate());
  }
};

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value -= 1;
    nextTick(() => soilProfileFormRef.value?.clearValidate());
  }
};

const handleFarmlandChange = async (farmlandId?: string | number) => {
  existingProfile.value = null;
  if (isEdit.value || isView.value || farmlandId == null || farmlandId === '') {
    return;
  }

  try {
    const res = await listSoilProfile({
      farmlandId,
      status: ApprovalStatus.Approved.toString(),
      pageNum: 1,
      pageSize: 1,
      orderByColumn: 'createTime',
      isAsc: 'desc'
    });
    const record = res.rows?.[0];
    if (!record) {
      return;
    }

    existingProfile.value = record;
    const prefilled = parseSoilProfileFormData(record as unknown as Partial<SoilProfileForm>);
    // Keep this as a new record. Never submit the historical primary key.
    prefilled.soilProfileId = undefined;
    prefilled.farmlandId = farmlandId;
    prefilled.status = ApprovalStatus.Draft.toString();
    form.value = prefilled;
    syncFarmlandOption();
    formKey.value += 1;
  } catch {
    existingProfile.value = null;
  }
};

const syncFarmlandOption = () => {
  if (form.value.farmlandId == null || form.value.farmlandId === '') return;
  farmLandOptionsPop.value = [
    {
      value: String(form.value.farmlandId),
      label: String(form.value.farmlandId)
    }
  ];
};

const loadProfile = async () => {
  const soilProfileId = Array.isArray(route.query.soilProfileId) ? route.query.soilProfileId[0] : route.query.soilProfileId;
  resetForm();
  if (!soilProfileId) {
    formKey.value += 1;
    return;
  }

  pageLoading.value = true;
  try {
    const res = await getSoilProfile(soilProfileId);
    form.value = parseSoilProfileFormData(res.data as unknown as Partial<SoilProfileForm>);
    syncFarmlandOption();
    formKey.value += 1;
  } finally {
    pageLoading.value = false;
  }
};

const cancel = () => {
  router.push(listPath.value);
};

const submitForm = () => {
  soilProfileFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    buttonLoading.value = true;
    try {
      form.value.status = ApprovalStatus.Draft.toString();
      if (isEdit.value) {
        await updateSoilProfile(form.value);
      } else {
        await addSoilProfile(form.value);
      }
      proxy?.$modal.msgSuccess('success');
      if (isEdit.value) {
        router.push(listPath.value);
      } else {
        router.push({
          path: listPath.value,
          query: { refresh: '1' }
        });
      }
    } finally {
      buttonLoading.value = false;
    }
  });
};

watch(
  () => [route.query.soilProfileId, route.query.mode] as const,
  () => {
    loadProfile();
  },
  { immediate: true }
);

onActivated(() => {
  loadProfile();
});
</script>

<style scoped>
.form-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px 0;
}

.soil-profile-steps {
  margin: 20px 12px 28px;
  overflow-x: auto;
}

.soil-profile-steps :deep(.el-step) {
  min-width: 120px;
}

@media (max-width: 900px) {
  .soil-profile-steps {
    justify-content: flex-start;
  }
}
</style>
