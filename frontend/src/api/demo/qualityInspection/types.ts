export interface QualityInspectionVO {
  /**
   * 主键ID（非自增）
   */
  id: string | number;

  /**
   * 质检记录编码（如 QI-001）
   */
  qiId: string | number;

  /**
   * 关联的批次ID（逻辑外键 -> t_postharvest_batch.id）
   */
  batchId: string | number;

  /**
   * 质量等级编码（引用 t_quality_grade_master.grade_code）
   */
  gradeCode: string;

  /**
   * 质检时水分百分比（%）
   */
  moisturePct: number;

  /**
   * Batch actual yield in quintal.
   */
  batchWeightQt?: number;

  /**
   * 杂质含量百分比（%）
   */
  impurityLevel: number;

  /**
   * 质检员用户ID（逻辑外键 -> t_user.id）
   */
  inspector: number;

  /**
   * 质检执行日期时间
   */
  inspectionDate: string;
}

export interface QualityInspectionForm extends BaseEntity {
  /**
   * 主键ID（非自增）
   */
  id?: string | number;

  /**
   * 质检记录编码（如 QI-001）
   */
  qiId?: string | number;

  /**
   * 关联的批次ID（逻辑外键 -> t_postharvest_batch.id）
   */
  batchId?: string | number;

  /**
   * 质量等级编码（引用 t_quality_grade_master.grade_code）
   */
  gradeCode?: string;

  /**
   * 质检时水分百分比（%）
   */
  moisturePct?: number;

  /**
   * Batch actual yield in quintal.
   */
  batchWeightQt?: number;

  /**
   * 杂质含量百分比（%）
   */
  impurityLevel?: number;

  /**
   * 质检员用户ID（逻辑外键 -> t_user.id）
   */
  inspector?: number;

  /**
   * 质检执行日期时间
   */
  inspectionDate?: string;

  inspectorUserName?: string;

  status?: string;

  createdUserName?: string;
  createTime?: string;

  approvedBy?: number;
  approvedUserName?: string;
  approvedAt?: string;
  approvedComment?: string;

  batchName?: string;
}

export interface QualityInspectionQuery extends PageQuery {
  /**
   * 质检记录编码（如 QI-001）
   */
  qiId?: string | number;

  /**
   * 关联的批次ID（逻辑外键 -> t_postharvest_batch.id）
   */
  batchId?: string | number;

  /**
   * 质量等级编码（引用 t_quality_grade_master.grade_code）
   */
  gradeCode?: string;

  /**
   * 质检时水分百分比（%）
   */
  moisturePct?: number;

  /**
   * 杂质含量百分比（%）
   */
  impurityLevel?: number;

  /**
   * 质检员用户ID（逻辑外键 -> t_user.id）
   */
  inspector?: number;

  /**
   * 质检执行日期时间
   */
  inspectionDate?: string;

  /**
   * 日期范围参数
   */
  params?: any;

  orderByColumn?: string;
  isAsc?: string;
}
