export interface PestDiseaseReportVO {
  /**
   * 病虫害ID
   */
  pestId: string | number;

  /**
   * 生产季节ID
   */
  prodSeasonId: string | number;

  /**
   * 报告日期
   */
  reportDate: string;

  /**
   * 报告时间
   */
  reportTime: string;

  /**
   * 病虫害类型 (如Rust)
   */
  pestType: string;

  /**
   * 报告分类
   */
  category?: string | number;

  /**
   * 严重程度评分 (1-5)
   */
  severityScore: string;

  /**
   * 图像链接
   */
  imageUrl: string;

  /**
   * 图像链接Url
   */
  imageUrlUrl: string;
  /**
   * AI诊断结果
   */
  aiDiagnosis: string;

  /**
   * 推荐的行动/治疗措施
   */
  recommendedAction: string;

  /**
   * 状态 (0 Reported, 1 Verified, 2 Actioned, 3 Closed)
   */
  status: string;

  /**
   * 记录人ID
   */
  recordedBy: string;

  /**
   * 核实人ID
   */
  verifiedBy: string;

  /**
   * 部门ID
   */
  deptId: string | number;

  /**
   * 备注
   */
  remark: string;
}

export interface PestDiseaseReportForm extends BaseEntity {
  /**
   * 病虫害ID
   */
  pestId?: string | number;

  /**
   * 生产季节ID
   */
  prodSeasonId?: string | number;

  /**
   * 报告日期
   */
  reportDate?: string;

  /**
   * 报告时间
   */
  reportTime?: string;

  /**
   * 病虫害类型 (如Rust)
   */
  pestType?: string;
  aiDetected?: string;

  /**
   * 报告分类
   */
  category?: string | number;

  /**
   * 严重程度评分 (1-5)
   */
  severityScore?: string;

  /**
   * 图像链接
   */
  imageUrl?: string;
  detectResultImgUrl?: string;
  /**
   * AI诊断结果
   */
  aiDiagnosis?: string;

  /**
   * 推荐的行动/治疗措施
   */
  recommendedAction?: string;

  /**
   * 状态 (0 Reported, 1 Verified, 2 Actioned, 3 Closed)
   */
  status?: string;

  /**
   * 记录人ID
   */
  recordedBy?: string;
  recordedUserName?: string;

  /**
   * 核实人ID
   */
  verifiedBy?: string;
  verifiedUserName?: string;

  /**
   * 部门ID
   */
  deptId?: string | number;

  /**
   * 备注
   */
  remark?: string;

  approvedAt?: string;
  approvedComment?: string;
}

export interface PestDiseaseReportQuery extends PageQuery {
  /**
   * 生产季节ID
   */
  prodSeasonId?: string | number;

  /**
   * 报告日期
   */
  reportDate?: string;

  /**
   * 报告时间
   */
  reportTime?: string;

  /**
   * 病虫害类型 (如Rust)
   */
  pestType?: string;

  /**
   * 报告分类
   */
  category?: string | number;

  /**
   * 严重程度评分 (1-5)
   */
  severityScore?: string;

  /**
   * 图像链接
   */
  imageUrl?: string;

  /**
   * AI诊断结果
   */
  aiDiagnosis?: string;

  /**
   * 推荐的行动/治疗措施
   */
  recommendedAction?: string;

  /**
   * 状态 (0 Reported, 1 Verified, 2 Actioned, 3 Closed)
   */
  status?: string;

  /**
   * 记录人ID
   */
  recordedBy?: string;

  /**
   * 核实人ID
   */
  verifiedBy?: string;

  /**
   * 部门ID
   */
  deptId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;

  orderByColumn: string;
  isAsc: string;
}

type PestDiseaseRemarkSource = {
  remark?: string;
  description?: string;
};

type PestDiseaseCategorySource = {
  category?: string | number;
  reportCategory?: string | number;
  pestType?: string;
};

type PestReportDictOption = {
  label: string;
  value: string | number;
};

const INSECT_PEST_TYPES = ['aphids', 'armyworm', 'cutworm'];
const DISEASE_PEST_TYPES = ['blight', 'other disease types'];

const inferCategoryFromPestType = (
  pestType: string | undefined,
  categoryDict: PestReportDictOption[] = []
): string | number | undefined => {
  if (!pestType || !categoryDict.length) {
    return undefined;
  }
  const normalized = pestType.toLowerCase();
  let keyword: 'insect' | 'disease' | undefined;
  if (INSECT_PEST_TYPES.some((item) => normalized.includes(item))) {
    keyword = 'insect';
  } else if (DISEASE_PEST_TYPES.some((item) => normalized.includes(item))) {
    keyword = 'disease';
  }
  if (!keyword) {
    return undefined;
  }
  return categoryDict.find((item) => item.label.toLowerCase().includes(keyword))?.value;
};

const normalizeCategoryValue = (
  raw: string | number,
  categoryDict: PestReportDictOption[] = []
): string | number => {
  if (!categoryDict.length) {
    return raw;
  }
  const matched = categoryDict.find(
    (item) => String(item.value) === String(raw) || item.label === String(raw)
  );
  return matched ? matched.value : raw;
};

/** 解析 Category 回显值（兼容 category 别名，并匹配字典 value 类型） */
export const resolvePestDiseaseReportCategory = (
  detail?: PestDiseaseCategorySource,
  row?: PestDiseaseCategorySource,
  categoryDict: PestReportDictOption[] = []
): string | number | undefined => {
  for (const source of [detail, row]) {
    if (!source) {
      continue;
    }
    const raw = source.category ?? source.reportCategory;
    if (raw !== undefined && raw !== null && raw !== '') {
      return normalizeCategoryValue(raw, categoryDict);
    }
  }
  return inferCategoryFromPestType(detail?.pestType ?? row?.pestType, categoryDict);
};

/** 解析 Description 展示值（后端字段 remark，兼容 description 别名） */
export const resolvePestDiseaseRemark = (
  detail?: PestDiseaseRemarkSource,
  row?: PestDiseaseRemarkSource
): string | undefined => {
  for (const source of [detail, row]) {
    if (!source) {
      continue;
    }
    const value = source.remark ?? source.description;
    if (value !== undefined && value !== null && value !== '') {
      return String(value);
    }
  }
  return undefined;
};

/** 详情/列表数据写入表单，确保 remark、category 正确回显 */
export const applyPestDiseaseReportToForm = (
  form: PestDiseaseReportForm,
  detail?: Partial<PestDiseaseReportForm & PestDiseaseRemarkSource & PestDiseaseCategorySource>,
  row?: Partial<PestDiseaseReportForm & PestDiseaseRemarkSource & PestDiseaseCategorySource>,
  categoryDict: PestReportDictOption[] = []
) => {
  Object.assign(form, detail ?? {});
  form.remark = resolvePestDiseaseRemark(detail, row);
  form.category = resolvePestDiseaseReportCategory(detail, row, categoryDict);
};
