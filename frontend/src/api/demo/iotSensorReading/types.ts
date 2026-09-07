export interface IotSensorReadingVO {
  /**
   * Unique sensor reading identifier (UUID)
   */
  sensorReadingId: string | number;

  /**
   * FK → t_process_step_run.step_run_id
   */
  stepRunId: string | number;

  /**
   * Sensor type: Temp / Humidity / etc.
   */
  sensorType: string;

  /**
   * Sensor reading value
   */
  readingValue: number;

  /**
   * Sensor reading timestamp
   */
  readingTime: string;
}

export interface IotSensorReadingForm extends BaseEntity {
  /**
   * Unique sensor reading identifier (UUID)
   */
  sensorReadingId?: string | number;

  /**
   * FK → t_process_step_run.step_run_id
   */
  stepRunId?: string | number;

  /**
   * Sensor type: Temp / Humidity / etc.
   */
  sensorType?: string;

  /**
   * Sensor reading value
   */
  readingValue?: number;

  /**
   * Sensor reading timestamp
   */
  readingTime?: string;
}

export interface IotSensorReadingQuery extends PageQuery {
  /**
   * FK → t_process_step_run.step_run_id
   */
  stepRunId?: string | number;

  /**
   * Sensor type: Temp / Humidity / etc.
   */
  sensorType?: string;

  /**
   * Sensor reading value
   */
  readingValue?: number;

  /**
   * Sensor reading timestamp
   */
  readingTime?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
