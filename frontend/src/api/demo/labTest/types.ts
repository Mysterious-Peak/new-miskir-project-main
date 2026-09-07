export interface LabTestVO {
  /**
   * Unique lab test identifier (UUID)
   */
  labTestId: string | number;

  /**
   * FK → t_quality_inspection.inspection_id
   */
  inspectionId: string | number;

  /**
   * Test parameter name
   */
  testParameter: string;

  /**
   * Test value
   */
  testValue: number;

  /**
   * Standard limit value
   */
  standardLimit: number;

  /**
   * Test result: Pass / Fail
   */
  result: string;

}

export interface LabTestForm extends BaseEntity {
  /**
   * Unique lab test identifier (UUID)
   */
  labTestId?: string | number;

  /**
   * FK → t_quality_inspection.inspection_id
   */
  inspectionId?: string | number;

  /**
   * Test parameter name
   */
  testParameter?: string;

  /**
   * Test value
   */
  testValue?: number;

  /**
   * Standard limit value
   */
  standardLimit?: number;

  /**
   * Test result: Pass / Fail
   */
  result?: string;

}

export interface LabTestQuery extends PageQuery {

  /**
   * FK → t_quality_inspection.inspection_id
   */
  inspectionId?: string | number;

  /**
   * Test parameter name
   */
  testParameter?: string;

  /**
   * Test value
   */
  testValue?: number;

  /**
   * Standard limit value
   */
  standardLimit?: number;

  /**
   * Test result: Pass / Fail
   */
  result?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
