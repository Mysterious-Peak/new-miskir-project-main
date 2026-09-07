export interface ColdChainReadingVO {
  /**
   * Unique sensor reading identifier
   */
  sensorId: string | number;

  /**
   * Trip FK
   */
  tripId: string | number;

  /**
   * Temperature in Celsius
   */
  temperature: number;

  /**
   * Reading timestamp
   */
  recordedAt: string;
}

export interface ColdChainReadingForm extends BaseEntity {
  /**
   * Unique sensor reading identifier
   */
  sensorId?: string | number;

  /**
   * Trip FK
   */
  tripId?: string | number;

  /**
   * Temperature in Celsius
   */
  temperature?: number;

  /**
   * Reading timestamp
   */
  recordedAt?: string;
}

export interface ColdChainReadingQuery extends PageQuery {
  /**
   * Unique sensor reading identifier
   */
  sensorId?: string | number;

  /**
   * Trip FK
   */
  tripId?: string | number;

  /**
   * Temperature in Celsius
   */
  temperature?: number;

  /**
   * Reading timestamp
   */
  recordedAt?: string;

  /**
   * 日期范围参数
   */
  params?: any;

  /**
   * 排序字段
   */
  orderByColumn?: string;

  /**
   * 排序方向 Ascending=asc / Descending=desc
   */
  isAsc?: string;
}
