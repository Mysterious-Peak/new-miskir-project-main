export interface ResourceUseRecordVO {
  /**
   * Unique resource usage record identifier (UUID)
   */
  resourceRecordId: string | number;

  /**
   * FK → t_production_batch.production_batch_id
   */
  productionBatchId: string | number;

  /**
   * Resource type: Water / Energy / Fuel
   */
  resourceType: string;

  /**
   * Quantity of resource used
   */
  quantityUsed: number;

  /**
   * Measurement time of resource usage
   */
  measurementTime: string;
}

export interface ResourceUseRecordForm extends BaseEntity {
  /**
   * Unique resource usage record identifier (UUID)
   */
  resourceRecordId?: string | number;

  /**
   * FK → t_production_batch.production_batch_id
   */
  productionBatchId?: string | number;

  /**
   * Resource type: Water / Energy / Fuel
   */
  resourceType?: string;

  /**
   * Quantity of resource used
   */
  quantityUsed?: number;

  /**
   * Measurement time of resource usage
   */
  measurementTime?: string;
}

export interface ResourceUseRecordQuery extends PageQuery {
  /**
   * FK → t_production_batch.production_batch_id
   */
  productionBatchId?: string | number;

  /**
   * Resource type: Water / Energy / Fuel
   */
  resourceType?: string;

  /**
   * Quantity of resource used
   */
  quantityUsed?: number;

  /**
   * Measurement time of resource usage
   */
  measurementTime?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
