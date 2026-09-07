<template>
  <div class="soil-profile-form-body">
    <el-card v-if="currentStep === 0" shadow="hover" class="section-card">
      <div class="section-card__title">
        <!-- <el-icon class="mr-1" color="#52c41a"><InfoFilled /></el-icon> -->
        <span>Basic Information</span>
      </div>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Farmland ID" prop="farmlandId">
            <el-select
              v-if="showFarmlandSelect"
              v-model="form.farmlandId"
              filterable
              remote
              clearable
              reserve-keyword
              placeholder="Please input"
              :remote-method="(q: string) => emit('farmland-search', q)"
              :loading="farmLandLoading"
              :debounce="300"
              :disabled="disabled"
              style="width: 100%"
              @change="(value) => emit('farmland-change', value)"
            >
              <el-option v-for="item in farmLandOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-input v-else v-model="form.farmlandId" disabled style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Sample Date" prop="sampleDate">
            <el-date-picker
              v-model="form.sampleDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="Please select Sample Date"
              :disabled="disabled"
              clearable
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Soil pH" prop="ph">
            <el-input-number
              v-model="form.ph"
              placeholder="Please enter Soil pH"
              :min="0"
              :max="99.99"
              :precision="2"
              :disabled="disabled"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Organic Matter (%)" prop="organicMatterPct">
            <el-input-number
              v-model="form.organicMatterPct"
              placeholder="Please enter Organic Matter (%)"
              :min="0"
              :max="99.99"
              :precision="2"
              :disabled="disabled"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="N Level (kg/ha)" prop="nlevel">
            <el-input-number
              v-model="form.nlevel"
              placeholder="Please enter N Level"
              :min="0"
              :max="999999999.99"
              :disabled="disabled"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="P Level (kg/ha)" prop="plevel">
            <el-input-number
              v-model="form.plevel"
              placeholder="Please enter P Level"
              :min="0"
              :max="999999999.99"
              :disabled="disabled"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="K Level (kg/ha)" prop="klevel">
            <el-input-number
              v-model="form.klevel"
              placeholder="Please enter K Level"
              :min="0"
              :max="999999999.99"
              :disabled="disabled"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Soil texture - % sand" prop="sandPct">
            <el-input-number v-model="form.sandPct" :min="0" :max="100" :precision="2" :disabled="disabled" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Soil texture - % silt" prop="siltPct">
            <el-input-number v-model="form.siltPct" :min="0" :max="100" :precision="2" :disabled="disabled" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Soil texture - % clay" prop="clayPct">
            <el-input-number v-model="form.clayPct" :min="0" :max="100" :precision="2" :disabled="disabled" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Soil type classification" prop="soilTypeClassification">
            <el-select
              v-model="form.soilTypeClassification"
              :disabled="disabled"
              clearable
              filterable
              placeholder="Please select"
              style="width: 100%"
            >
              <el-option v-for="item in soilTypeOptions" :key="item.soilCode" :label="item.soilName" :value="item.soilCode" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Soil structure" prop="soilStructure">
            <el-select v-model="form.soilStructure" :disabled="disabled" clearable filterable placeholder="Please select" style="width: 100%">
              <el-option v-for="dict in soil_structure" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Gravel/stone content" prop="gravelStoneContent">
            <el-input-number v-model="form.gravelStoneContent" :min="0" :max="999999999.99" :precision="2" :disabled="disabled" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>

    <el-card v-for="(section, index) in sections" v-show="currentStep === index + 1" :key="section.title" shadow="hover" class="section-card">
      <div class="section-card__title">
        <!-- <el-icon class="mr-1" color="#52c41a"><InfoFilled /></el-icon> -->
        <span>{{ section.title }}</span>
      </div>
      <el-row :gutter="20">
        <el-col v-for="field in section.fields" :key="field.prop" :span="12">
          <el-form-item :label="field.label" :prop="field.prop">
            <el-select
              v-if="field.type === 'soilType'"
              v-model="form[field.prop]"
              :disabled="disabled"
              clearable
              filterable
              placeholder="Please select"
              style="width: 100%"
            >
              <el-option v-for="item in soilTypeOptions" :key="item.soilCode" :label="item.soilName" :value="item.soilCode" />
            </el-select>
            <el-select
              v-else-if="field.type === 'structure'"
              v-model="form[field.prop]"
              :disabled="disabled"
              clearable
              filterable
              placeholder="Please select"
              style="width: 100%"
            >
              <el-option v-for="dict in soil_structure" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
            <el-select
              v-else-if="field.type === 'dict'"
              v-model="form[field.prop]"
              :disabled="disabled"
              clearable
              filterable
              placeholder="Please select"
              style="width: 100%"
            >
              <el-option v-for="dict in dictMap[field.dictKey || ''] || []" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
            <el-input
              v-else-if="field.type === 'text'"
              v-model="form[field.prop]"
              :type="field.multiline ? 'textarea' : 'text'"
              :disabled="disabled"
              :placeholder="field.placeholder || 'Please input'"
            />
            <el-input-number
              v-else
              v-model="form[field.prop]"
              :disabled="disabled"
              :min="0"
              :max="999999999.99"
              :precision="field.precision ?? 2"
              :placeholder="field.placeholder || 'Please input'"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>

    <el-card v-if="showAuditFields && currentStep === sections.length + 1" shadow="hover" class="section-card">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="Created By" prop="createdUserName">
            <el-input v-model="form.createdUserName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Created Time" prop="createTime">
            <el-date-picker
              v-model="form.createTime"
              type="datetime"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              disabled
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Approved By" prop="approvedUserName">
            <el-input v-model="form.approvedUserName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Approved Time" prop="approvedAt">
            <el-date-picker
              v-model="form.approvedAt"
              type="datetime"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              disabled
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="Approval Comment" prop="approvedComment" class="remark-full-row">
            <el-input v-model="form.approvedComment" type="textarea" disabled />
          </el-form-item>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { InfoFilled } from '@element-plus/icons-vue';
import { listSoilTypeMaster } from '@/api/demo/soilTypeMaster';
import { SoilTypeMasterVO } from '@/api/demo/soilTypeMaster/types';
import { SoilProfileForm } from '@/api/demo/soilProfile/types';

type FieldType = 'number' | 'text' | 'soilType' | 'structure' | 'dict';

interface FormField {
  prop: keyof SoilProfileForm;
  label: string;
  type?: FieldType;
  dictKey?: string;
  placeholder?: string;
  multiline?: boolean;
  precision?: number;
}

interface FormSection {
  title: string;
  fields: FormField[];
}

const props = withDefaults(
  defineProps<{
    form: SoilProfileForm;
    disabled?: boolean;
    currentStep?: number;
    showFarmlandSelect?: boolean;
    showAuditFields?: boolean;
    farmLandOptions?: Array<{ value: string | number; label: string }>;
    farmLandLoading?: boolean;
  }>(),
  {
    disabled: false,
    currentStep: 0,
    showFarmlandSelect: true,
    showAuditFields: false,
    farmLandOptions: () => [],
    farmLandLoading: false
  }
);

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { soil_structure, drainage_status, erosion_risk_level, salinization_risk, acidification_trend, soil_compaction_trend } = toRefs<any>(
  proxy?.useDict('soil_structure', 'drainage_status', 'erosion_risk_level', 'salinization_risk', 'acidification_trend', 'soil_compaction_trend')
);

const dictMap = computed<Record<string, any[]>>(() => ({
  soil_structure: soil_structure.value || [],
  drainage_status: drainage_status.value || [],
  erosion_risk_level: erosion_risk_level.value || [],
  salinization_risk: salinization_risk.value || [],
  acidification_trend: acidification_trend.value || [],
  soil_compaction_trend: soil_compaction_trend.value || []
}));

const emit = defineEmits<{
  'farmland-search': [query: string];
  'farmland-change': [value?: string | number];
}>();

const soilTypeOptions = ref<SoilTypeMasterVO[]>([]);

const sections: FormSection[] = [
  {
    title: 'Condition & Water Movement',
    fields: [
      { prop: 'bulkDensity', label: 'Bulk density (g/cm³)' },
      { prop: 'porosity', label: 'Porosity (%)' },
      { prop: 'penetrationResistance', label: 'Compaction level - penetration resistance' },
      { prop: 'fieldCapacity', label: 'Water holding capacity - field capacity' },
      { prop: 'wiltingPoint', label: 'Water holding capacity - wilting point' },
      { prop: 'infiltrationRate', label: 'Infiltration rate' },
      { prop: 'hydraulicConductivity', label: 'Hydraulic conductivity' },
      { prop: 'volumetricMoisture', label: 'Volumetric soil moisture' },
      { prop: 'drainageStatus', label: 'Drainage status', type: 'dict', dictKey: 'drainage_status' },
      { prop: 'waterTableDepth', label: 'Water table depth' },
      { prop: 'evapotranspirationRate', label: 'Evapotranspiration rate (ET0 / ETc)' }
    ]
  },
  {
    title: 'Chemistry & Macro Nutrients',
    fields: [
      { prop: 'electricalConductivity', label: 'Electrical conductivity (EC)' },
      { prop: 'limeContentPct', label: 'Lime content / alkalinity (CaCO₃ %)' },
      { prop: 'naLevel', label: 'Sodium (Na)' },
      { prop: 'salinizationRisk', label: 'Salinization risk', type: 'dict', dictKey: 'salinization_risk' },
      { prop: 'acidificationTrend', label: 'Acidification trend', type: 'dict', dictKey: 'acidification_trend' },
      { prop: 'cationExchangeCapacity', label: 'Cation exchange capacity (CEC)' },
      { prop: 'caLevel', label: 'Calcium (Ca)' },
      { prop: 'mgLevel', label: 'Magnesium (Mg)' },
      { prop: 'sLevel', label: 'Sulfur (S)' }
    ]
  },
  {
    title: 'Trace Elements & Contaminants',
    fields: [
      { prop: 'feLevel', label: 'Iron (Fe)' },
      { prop: 'znLevel', label: 'Zinc (Zn)' },
      { prop: 'mnLevel', label: 'Manganese (Mn)' },
      { prop: 'cuLevel', label: 'Copper (Cu)' },
      { prop: 'bLevel', label: 'Boron (B)' },
      { prop: 'moLevel', label: 'Molybdenum (Mo)' },
      { prop: 'heavyMetalPb', label: 'Heavy metals - Pb' },
      { prop: 'heavyMetalCd', label: 'Heavy metals - Cd' },
      { prop: 'heavyMetalAs', label: 'Heavy metals - As' }
    ]
  },
  {
    title: 'Biology, Health & Remarks',
    fields: [
      { prop: 'microbialBiomass', label: 'Soil microbial biomass' },
      { prop: 'respirationRate', label: 'Soil respiration rate' },
      { prop: 'microbialDiversityIndex', label: 'Microbial diversity index' },
      { prop: 'earthwormDensity', label: 'Earthworm density / macro-fauna presence' },
      { prop: 'enzymeActivity', label: 'Enzyme activity indicators' },
      { prop: 'omDecompositionRate', label: 'Organic matter decomposition rate' },
      { prop: 'rootDensity', label: 'Root density / root zone health' },
      { prop: 'soilTemperature', label: 'Soil temperature' },
      { prop: 'erosionRiskLevel', label: 'Erosion risk level', type: 'dict', dictKey: 'erosion_risk_level' },
      { prop: 'nutrientDepletionRate', label: 'Nutrient depletion rate' },
      { prop: 'compactionTrend', label: 'Soil compaction trend', type: 'dict', dictKey: 'soil_compaction_trend' },
      { prop: 'desertificationVulnerabilityIndex', label: 'Desertification vulnerability index' },
      { prop: 'remark', label: 'Remark', type: 'text', placeholder: 'Please enter remark', multiline: true }
    ]
  }
];

onMounted(async () => {
  const res = await listSoilTypeMaster({ pageNum: 1, pageSize: 2000 });
  soilTypeOptions.value = res.rows || [];
});
</script>

<style scoped>
.soil-profile-form-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-card__title {
  display: flex;
  align-items: center;
  font-weight: 600;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
  margin-bottom: 16px;
}

.section-card :deep(.el-form-item) {
  display: flex;
  align-items: center;
  width: 100%;
}

.section-card :deep(.el-form-item:has(.el-textarea)) {
  align-items: flex-start;
}

.section-card :deep(.el-form-item__label) {
  width: 50% !important;
  max-width: 50%;
  flex: 0 0 50%;
  height: auto;
  line-height: 32px;
  min-height: 32px;
  padding-top: 0;
  padding-bottom: 0;
  margin-bottom: 0;
  padding-right: 12px;
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  white-space: normal;
  word-break: break-word;
}

.section-card :deep(.el-form-item:has(.el-textarea) .el-form-item__label) {
  line-height: 1.4;
  min-height: auto;
  padding-top: 8px;
}

.section-card :deep(.el-form-item__content) {
  width: 50%;
  max-width: 50%;
  flex: 0 0 50%;
  margin-left: 0 !important;
  display: flex;
  align-items: center;
  line-height: 32px;
}

.section-card :deep(.el-form-item__content > *) {
  width: 100%;
}

.section-card :deep(.remark-only.el-form-item) {
  align-items: flex-start;
}

.section-card :deep(.remark-only .el-form-item__content) {
  width: 100%;
  max-width: 100%;
  flex: 1 1 100%;
}

.section-card :deep(.remark-full-row.el-form-item) {
  align-items: flex-start;
}

.section-card :deep(.remark-full-row .el-form-item__label) {
  width: 25% !important;
  max-width: 25%;
  flex: 0 0 25%;
  line-height: 1.4;
  min-height: auto;
  padding-top: 8px;
}

.section-card :deep(.remark-full-row .el-form-item__content) {
  width: 75%;
  max-width: 75%;
  flex: 0 0 75%;
}
</style>
