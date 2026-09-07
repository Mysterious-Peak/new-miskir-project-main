/** 土壤剖面扩展属性（与后端实体字段对齐） */
export interface SoilProfileExtendedFields {
  sandPct?: number;
  siltPct?: number;
  clayPct?: number;
  soilTypeClassification?: string;
  bulkDensity?: number;
  soilStructure?: string;
  porosity?: number;
  fieldCapacity?: number;
  wiltingPoint?: number;
  infiltrationRate?: number;
  hydraulicConductivity?: number;
  penetrationResistance?: number;
  gravelStoneContent?: number;
  electricalConductivity?: number;
  cationExchangeCapacity?: number;
  caLevel?: number;
  mgLevel?: number;
  sLevel?: number;
  feLevel?: number;
  znLevel?: number;
  mnLevel?: number;
  cuLevel?: number;
  bLevel?: number;
  moLevel?: number;
  naLevel?: number;
  heavyMetalPb?: number;
  heavyMetalCd?: number;
  heavyMetalAs?: number;
  limeContentPct?: number;
  microbialBiomass?: number;
  respirationRate?: number;
  microbialDiversityIndex?: number;
  earthwormDensity?: number;
  enzymeActivity?: number;
  rootDensity?: number;
  omDecompositionRate?: number;
  volumetricMoisture?: number;
  soilTemperature?: number;
  evapotranspirationRate?: number;
  waterTableDepth?: number;
  drainageStatus?: string;
  erosionRiskLevel?: string;
  salinizationRisk?: string;
  acidificationTrend?: string;
  nutrientDepletionRate?: number;
  compactionTrend?: string;
  desertificationVulnerabilityIndex?: number;
}

export interface SoilProfileVO extends SoilProfileExtendedFields {
  soilProfileId: string | number;
  farmlandId: string | number;
  sampleDate: string;
  ph: number;
  organicMatterPct: number;
  nlevel: number;
  plevel: number;
  klevel: number;
  deptId: string | number;
  remark: string;
  createdUserName: string;
}

export interface SoilProfileForm extends BaseEntity, SoilProfileExtendedFields {
  soilProfileId?: string | number;
  farmlandId?: string | number;
  sampleDate?: string;
  ph?: number;
  organicMatterPct?: number;
  nlevel?: number;
  plevel?: number;
  klevel?: number;
  deptId?: string | number;
  remark?: string;
  createdUserName?: string;
  status?: string | number;
  approvedComment?: string;
  approvedUserName?: string;
  approvedAt?: string;
}

export interface SoilProfileQuery extends PageQuery {
  farmlandId?: string | number;
  sampleDate?: string;
  ph?: number;
  organicMatterPct?: number;
  nLevel?: number;
  pLevel?: number;
  kLevel?: number;
  deptId?: string | number;
  params?: any;
  status?: string | number;
  orderByColumn?: string;
  isAsc?: string;
}
