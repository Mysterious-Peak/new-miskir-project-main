import { SoilProfileExtendedFields, SoilProfileForm, SoilProfileVO } from '@/api/demo/soilProfile/types';
import { ApprovalStatus } from '@/enums/AgriculturalEnum';

export type SoilProfileTableColumnType = 'number' | 'dict' | 'soilType';

export interface SoilProfileTableColumn {
  prop: keyof SoilProfileExtendedFields;
  label: string;
  type?: SoilProfileTableColumnType;
  dictKey?: string;
}

/** 扩展字段表格列（K Level 与 Remark 之间） */
export const soilProfileExtendedColumns: SoilProfileTableColumn[] = [
  { prop: 'sandPct', label: 'Soil texture - % sand' },
  { prop: 'siltPct', label: 'Soil texture - % silt' },
  { prop: 'clayPct', label: 'Soil texture - % clay' },
  { prop: 'soilTypeClassification', label: 'Soil type classification', type: 'soilType' },
  { prop: 'bulkDensity', label: 'Bulk density (g/cm³)' },
  { prop: 'soilStructure', label: 'Soil structure', type: 'dict', dictKey: 'soil_structure' },
  { prop: 'porosity', label: 'Porosity (%)' },
  { prop: 'fieldCapacity', label: 'Water holding capacity - field capacity' },
  { prop: 'wiltingPoint', label: 'Water holding capacity - wilting point' },
  { prop: 'infiltrationRate', label: 'Infiltration rate' },
  { prop: 'hydraulicConductivity', label: 'Hydraulic conductivity' },
  { prop: 'penetrationResistance', label: 'Compaction level - penetration resistance' },
  { prop: 'gravelStoneContent', label: 'Gravel/stone content' },
  { prop: 'electricalConductivity', label: 'Electrical conductivity (EC)' },
  { prop: 'cationExchangeCapacity', label: 'Cation exchange capacity (CEC)' },
  { prop: 'caLevel', label: 'Calcium (Ca)' },
  { prop: 'mgLevel', label: 'Magnesium (Mg)' },
  { prop: 'sLevel', label: 'Sulfur (S)' },
  { prop: 'feLevel', label: 'Iron (Fe)' },
  { prop: 'znLevel', label: 'Zinc (Zn)' },
  { prop: 'mnLevel', label: 'Manganese (Mn)' },
  { prop: 'cuLevel', label: 'Copper (Cu)' },
  { prop: 'bLevel', label: 'Boron (B)' },
  { prop: 'moLevel', label: 'Molybdenum (Mo)' },
  { prop: 'naLevel', label: 'Sodium (Na)' },
  { prop: 'heavyMetalPb', label: 'Heavy metals - Pb' },
  { prop: 'heavyMetalCd', label: 'Heavy metals - Cd' },
  { prop: 'heavyMetalAs', label: 'Heavy metals - As' },
  { prop: 'limeContentPct', label: 'Lime content / alkalinity (CaCO₃ %)' },
  { prop: 'microbialBiomass', label: 'Soil microbial biomass' },
  { prop: 'respirationRate', label: 'Soil respiration rate' },
  { prop: 'microbialDiversityIndex', label: 'Microbial diversity index' },
  { prop: 'earthwormDensity', label: 'Earthworm density / macro-fauna presence' },
  { prop: 'enzymeActivity', label: 'Enzyme activity indicators' },
  { prop: 'rootDensity', label: 'Root density / root zone health' },
  { prop: 'omDecompositionRate', label: 'Organic matter decomposition rate' },
  { prop: 'volumetricMoisture', label: 'Volumetric soil moisture' },
  { prop: 'soilTemperature', label: 'Soil temperature' },
  { prop: 'evapotranspirationRate', label: 'Evapotranspiration rate (ET0 / ETc)' },
  { prop: 'waterTableDepth', label: 'Water table depth' },
  { prop: 'drainageStatus', label: 'Drainage status', type: 'dict', dictKey: 'drainage_status' },
  { prop: 'erosionRiskLevel', label: 'Erosion risk level', type: 'dict', dictKey: 'erosion_risk_level' },
  { prop: 'salinizationRisk', label: 'Salinization risk', type: 'dict', dictKey: 'salinization_risk' },
  { prop: 'acidificationTrend', label: 'Acidification trend', type: 'dict', dictKey: 'acidification_trend' },
  { prop: 'nutrientDepletionRate', label: 'Nutrient depletion rate' },
  { prop: 'compactionTrend', label: 'Soil compaction trend', type: 'dict', dictKey: 'soil_compaction_trend' },
  { prop: 'desertificationVulnerabilityIndex', label: 'Desertification vulnerability index' }
];

export const initSoilProfileForm = (): SoilProfileForm => ({
  soilProfileId: undefined,
  farmlandId: undefined,
  sampleDate: undefined,
  ph: undefined,
  organicMatterPct: undefined,
  nlevel: undefined,
  plevel: undefined,
  klevel: undefined,
  deptId: undefined,
  remark: undefined,
  createdUserName: undefined,
  status: ApprovalStatus.Draft.toString(),
  approvedComment: undefined,
  approvedUserName: undefined,
  approvedAt: undefined,
  sandPct: undefined,
  siltPct: undefined,
  clayPct: undefined,
  soilTypeClassification: undefined,
  bulkDensity: undefined,
  soilStructure: undefined,
  porosity: undefined,
  fieldCapacity: undefined,
  wiltingPoint: undefined,
  infiltrationRate: undefined,
  hydraulicConductivity: undefined,
  penetrationResistance: undefined,
  gravelStoneContent: undefined,
  electricalConductivity: undefined,
  cationExchangeCapacity: undefined,
  caLevel: undefined,
  mgLevel: undefined,
  sLevel: undefined,
  feLevel: undefined,
  znLevel: undefined,
  mnLevel: undefined,
  cuLevel: undefined,
  bLevel: undefined,
  moLevel: undefined,
  naLevel: undefined,
  heavyMetalPb: undefined,
  heavyMetalCd: undefined,
  heavyMetalAs: undefined,
  limeContentPct: undefined,
  microbialBiomass: undefined,
  respirationRate: undefined,
  microbialDiversityIndex: undefined,
  earthwormDensity: undefined,
  enzymeActivity: undefined,
  rootDensity: undefined,
  omDecompositionRate: undefined,
  volumetricMoisture: undefined,
  soilTemperature: undefined,
  evapotranspirationRate: undefined,
  waterTableDepth: undefined,
  drainageStatus: undefined,
  erosionRiskLevel: undefined,
  salinizationRisk: undefined,
  acidificationTrend: undefined,
  nutrientDepletionRate: undefined,
  compactionTrend: undefined,
  desertificationVulnerabilityIndex: undefined
});

/**
 * Boron/Sulfur 在 Java 中若定义为 bLevel/sLevel，Jackson 可能序列化为 BLevel/SLevel；
 * 实际持久化字段与 N/P/K 一致，使用全小写 blevel/slevel。
 */
const boronResponseKeys = ['blevel', 'bLevel', 'BLevel', 'b_level'] as const;
const sulfurResponseKeys = ['slevel', 'sLevel', 'SLevel', 's_level'] as const;

const pickFirstDefined = (data: Record<string, unknown>, keys: readonly string[]) => {
  for (const key of keys) {
    const value = data[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return undefined;
};

const normalizeSpecialLevelFieldsFromResponse = (data: Record<string, unknown>) => {
  const boron = pickFirstDefined(data, boronResponseKeys);
  if (boron !== undefined) {
    data.bLevel = boron;
  }
  const sulfur = pickFirstDefined(data, sulfurResponseKeys);
  if (sulfur !== undefined) {
    data.sLevel = sulfur;
  }
  return data;
};

const applyApiFieldAliasesFromResponse = (data: Record<string, unknown>) => {
  return normalizeSpecialLevelFieldsFromResponse(data);
};

const applyApiFieldAliasesFromVo = (row: SoilProfileVO): SoilProfileVO => {
  const record = row as SoilProfileVO & Record<string, unknown>;
  const boron = pickFirstDefined(record, boronResponseKeys);
  if (boron !== undefined) {
    record.bLevel = Number(boron);
  }
  const sulfur = pickFirstDefined(record, sulfurResponseKeys);
  if (sulfur !== undefined) {
    record.sLevel = Number(sulfur);
  }
  return record;
};

const applyApiFieldAliasesForRequest = (data: Record<string, unknown>) => {
  const payload = { ...data };
  if (payload.bLevel !== undefined) {
    payload.blevel = payload.bLevel;
    delete payload.bLevel;
  }
  if (payload.sLevel !== undefined) {
    payload.slevel = payload.sLevel;
    delete payload.sLevel;
  }
  delete payload.BLevel;
  delete payload.SLevel;
  return payload;
};

const soilProfileNumberFields: (keyof SoilProfileExtendedFields | 'ph' | 'organicMatterPct' | 'nlevel' | 'plevel' | 'klevel')[] = [
  'ph',
  'organicMatterPct',
  'nlevel',
  'plevel',
  'klevel',
  ...soilProfileExtendedColumns.filter((col) => col.type !== 'dict' && col.type !== 'soilType').map((col) => col.prop)
];

/** 将接口详情数据规范为表单可用结构 */
export const parseSoilProfileFormData = (data: Partial<SoilProfileForm> = {}): SoilProfileForm => {
  const normalized = applyApiFieldAliasesFromResponse({ ...data } as Record<string, unknown>);
  const form: SoilProfileForm = { ...initSoilProfileForm(), ...(normalized as Partial<SoilProfileForm>) };

  soilProfileNumberFields.forEach((key) => {
    const value = form[key];
    if (value !== undefined && value !== null && value !== '') {
      (form as Record<string, unknown>)[key as string] = Number(value);
    }
  });

  if (form.soilProfileId != null) {
    form.soilProfileId = String(form.soilProfileId);
  }
  if (form.farmlandId != null) {
    form.farmlandId = String(form.farmlandId);
  }

  return form;
};

/** 列表/详情接口单行数据字段名规范化 */
export const normalizeSoilProfileRecord = (row: SoilProfileVO): SoilProfileVO => {
  return applyApiFieldAliasesFromVo(row);
};

/** 提交前转换为后端可识别的字段名 */
export const serializeSoilProfileFormData = (data: SoilProfileForm): SoilProfileForm => {
  return applyApiFieldAliasesForRequest({ ...data } as Record<string, unknown>) as SoilProfileForm;
};
