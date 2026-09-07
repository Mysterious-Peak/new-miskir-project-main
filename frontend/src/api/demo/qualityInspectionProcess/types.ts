export interface QualityInspectionProcessVO {
  /**
   * Unique inspection identifier (UUID)
   */
  inspectionId: string | number;

  /**
   * FK → t_production_batch.production_batch_id
   */
  productionBatchId: string | number;

  /**
   * Inspector user ID (FK → USER)
   */
  inspectorId: string | number;

  /**
   * Inspector user name
   */
  inspectorUserName?: string;

  /**
   * Inspection date
   */
  inspectionDate: string;

  /**
   * Quality score
   */
  qualityScore: number;

  /**
   * Inspection status code (e.g. 0 / 1)
   */
  status: string;

  /**
   * Inspection result: Pass / Fail (or 0 / 1)
   */
  result: string;

}

export interface QualityInspectionProcessForm extends BaseEntity {
  /**
   * Unique inspection identifier (UUID)
   */
  inspectionId?: string | number;

  /**
   * FK → t_production_batch.production_batch_id
   */
  productionBatchId?: string | number;

  /**
   * Inspector user ID (FK → USER)
   */
  inspectorId?: string | number;

  /**
   * Inspector user name
   */
  inspectorUserName?: string;

  /**
   * Inspection date
   */
  inspectionDate?: string;

  /**
   * Quality score
   */
  qualityScore?: number;

  /**
   * Inspection status code (e.g. 0 / 1)
   */
  status?: string;

  /**
   * Inspection result: Pass / Fail (or 0 / 1)
   */
  result?: string;

}

export interface QualityInspectionProcessQuery extends PageQuery {

  /**
   * FK → t_production_batch.production_batch_id
   */
  productionBatchId?: string | number;

  /**
   * Inspector user ID (FK → USER)
   */
  inspectorId?: string | number;

  /**
   * Inspection date
   */
  inspectionDate?: string;

  /**
   * Quality score
   */
  qualityScore?: number;

  /**
   * Inspection status code (e.g. 0 / 1)
   */
  status?: string;

  /**
   * Inspection result: Pass / Fail (or 0 / 1)
   */
  result?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
