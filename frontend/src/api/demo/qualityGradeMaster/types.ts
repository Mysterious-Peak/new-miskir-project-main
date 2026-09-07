export interface QualityGradeMasterVO {
  /**
   * 主键ID（非自增）
   */
  id: string | number;

  /**
   * 质量等级编码（如 G1、G2）
   */
  gradeCode: string;

  /**
   * 等级名称（如 Premium Grade）
   */
  gradeName: string;

  /**
   * 等级评定标准说明（如水分、杂质要求等）
   */
  description: string;
}

export interface QualityGradeMasterForm extends BaseEntity {
  /**
   * 主键ID（非自增）
   */
  id?: string | number;

  /**
   * 质量等级编码（如 G1、G2）
   */
  gradeCode?: string;

  /**
   * 等级名称（如 Premium Grade）
   */
  gradeName?: string;

  /**
   * 等级评定标准说明（如水分、杂质要求等）
   */
  description?: string;
}

export interface QualityGradeMasterQuery extends PageQuery {
  /**
   * 质量等级编码（如 G1、G2）
   */
  gradeCode?: string;

  /**
   * 等级名称（如 Premium Grade）
   */
  gradeName?: string;

  /**
   * 等级评定标准说明（如水分、杂质要求等）
   */
  description?: string;

  /**
   * 日期范围参数
   */
  params?: any;

  orderByColumn?: string;
  isAsc?: string;
}
