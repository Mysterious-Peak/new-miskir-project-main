export interface WasteByproductRecordVO {
  /**
   * Unique waste/byproduct record identifier (UUID)
   */
  wasteRecordId: string | number;

  /**
   * FK → t_production_batch.production_batch_id
   */
  productionBatchId: string | number;

  /**
   * Waste or byproduct type (e.g. husk, bran, wastewater, etc.)
   */
  wasteType: string;

  /**
   * Quantity of waste/byproduct
   */
  quantity: number;

  /**
   * Whether the waste/byproduct has reuse potential: 0=No, 1=Yes
   */
  reusePotential: string;
}

export interface WasteByproductRecordForm extends BaseEntity {
  /**
   * Unique waste/byproduct record identifier (UUID)
   */
  wasteRecordId?: string | number;

  /**
   * FK → t_production_batch.production_batch_id
   */
  productionBatchId?: string | number;

  /**
   * Waste or byproduct type (e.g. husk, bran, wastewater, etc.)
   */
  wasteType?: string;

  /**
   * Quantity of waste/byproduct
   */
  quantity?: number;

  /**
   * Whether the waste/byproduct has reuse potential: 0=No, 1=Yes
   */
  reusePotential?: string;
}

export interface WasteByproductRecordQuery extends PageQuery {
  /**
   * FK → t_production_batch.production_batch_id
   */
  productionBatchId?: string | number;

  /**
   * Waste or byproduct type (e.g. husk, bran, wastewater, etc.)
   */
  wasteType?: string;

  /**
   * Quantity of waste/byproduct
   */
  quantity?: number;

  /**
   * Whether the waste/byproduct has reuse potential: 0=No, 1=Yes
   */
  reusePotential?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
