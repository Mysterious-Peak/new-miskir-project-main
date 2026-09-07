export interface BatchInputVO {
  /**
   * Unique batch-input link identifier (UUID)
   */
  batchInputLinkId: string | number;

  /**
   * FK → t_production_batch.production_batch_id
   */
  productionBatchId: string | number;

  /**
   * FK → t_raw_material_intake.intake_id
   */
  intakeId: string | number;

  /**
   * Quantity of raw material used
   */
  quantityUsed: number;

  /**
   * Measurement unit (e.g. kg, ton)
   */
  unit: string;

}

export interface BatchInputForm extends BaseEntity {
  /**
   * Unique batch-input link identifier (UUID)
   */
  batchInputLinkId?: string | number;

  /**
   * FK → t_production_batch.production_batch_id
   */
  productionBatchId?: string | number;

  /**
   * FK → t_raw_material_intake.intake_id
   */
  intakeId?: string | number;

  /**
   * Quantity of raw material used
   */
  quantityUsed?: number;

  /**
   * Measurement unit (e.g. kg, ton)
   */
  unit?: string;

}

export interface BatchInputQuery extends PageQuery {

  /**
   * FK → t_production_batch.production_batch_id
   */
  productionBatchId?: string | number;

  /**
   * FK → t_raw_material_intake.intake_id
   */
  intakeId?: string | number;

  /**
   * Quantity of raw material used
   */
  quantityUsed?: number;

  /**
   * Measurement unit (e.g. kg, ton)
   */
  unit?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
