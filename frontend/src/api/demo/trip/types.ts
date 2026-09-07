export interface TripVO {
  /**
   * Unique trip identifier
   */
  tripId: string | number;

  /**
   * Shipment order FK
   */
  shipmentId: string | number;

  /**
   * Vehicle FK
   */
  vehicleId: string | number;

  /**
   * Driver FK
   */
  driverId: string | number;

  /**
   * Trip start time
   */
  startTime: string;

  /**
   * Trip end time
   */
  endTime: string;

  /**
   * Created by user name
   */
  createdUserName?: string;

  /**
   * Creation time
   */
  createTime?: string;
}

export interface TripForm extends BaseEntity {
  /**
   * Unique trip identifier
   */
  tripId?: string | number;

  /**
   * Shipment order FK
   */
  shipmentId?: string | number;

  /**
   * Vehicle FK
   */
  vehicleId?: string | number;

  /**
   * Driver FK
   */
  driverId?: string | number;

  /**
   * Trip start time
   */
  startTime?: string;

  /**
   * Trip end time
   */
  endTime?: string;
}

export interface TripQuery extends PageQuery {
  /**
   * Unique trip identifier
   */
  tripId?: string | number;
  /**
   * Shipment order FK
   */
  shipmentId?: string | number;

  /**
   * Vehicle FK
   */
  vehicleId?: string | number;

  /**
   * Driver FK
   */
  driverId?: string | number;

  /**
   * Trip start time
   */
  startTime?: string;

  /**
   * Trip end time
   */
  endTime?: string;

  /**
   * 日期范围参数
   */
  params?: any;

  orderByColumn?: string;

  isAsc?: string;
}
