export interface RawMaterialIntakeVO {
  /**
   * Unique intake identifier (UUID)
   */
  intakeId: string | number;

  /**
   * FK → t_agroprocessor.processor_id
   */
  processorId: string | number;

  /**
   * FK → upstream post-harvest batch
   */
  sourceBatchId: string | number;

  /**
   * Commodity type
   */
  commodityType: string;

  /**
   * Quantity (e.g. kg)
   */
  quantity: number;

  /**
   * Quality grade
   */
  qualityGrade: string;

  /**
   * Moisture content (%)
   */
  moistureContent: number;

  /**
   * Intake date
   */
  intakeDate: string;

  /**
   * Received by user ID (FK → USER)
   */
  receivedBy: number;

}

export interface RawMaterialIntakeForm extends BaseEntity {
  /**
   * Unique intake identifier (UUID)
   */
  intakeId?: string | number;

  /**
   * FK → t_agroprocessor.processor_id
   */
  processorId?: string | number;

  /**
   * FK → upstream post-harvest batch
   */
  sourceBatchId?: string | number;

  /**
   * Commodity type
   */
  commodityType?: string;

  /**
   * Quantity (e.g. kg)
   */
  quantity?: number;

  /**
   * Quality grade
   */
  qualityGrade?: string;

  /**
   * Moisture content (%)
   */
  moistureContent?: number;

  /**
   * Intake date
   */
  intakeDate?: string;

  /**
   * Received by user ID (FK → USER)
   */
  receivedBy?: number;

}

export interface RawMaterialIntakeQuery extends PageQuery {

  /**
   * FK → t_agroprocessor.processor_id
   */
  processorId?: string | number;

  /**
   * FK → upstream post-harvest batch
   */
  sourceBatchId?: string | number;

  /**
   * Commodity type
   */
  commodityType?: string;

  /**
   * Quantity (e.g. kg)
   */
  quantity?: number;

  /**
   * Quality grade
   */
  qualityGrade?: string;

  /**
   * Moisture content (%)
   */
  moistureContent?: number;

  /**
   * Intake date
   */
  intakeDate?: string;

  /**
   * Received by user ID (FK → USER)
   */
  receivedBy?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
