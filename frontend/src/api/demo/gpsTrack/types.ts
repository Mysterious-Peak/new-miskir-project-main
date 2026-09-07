export interface GpsTrackVO {
  /**
   * Unique GPS track identifier
   */
  gpsTrackId: string | number;

  /**
   * Trip FK
   */
  tripId: string | number;

  /**
   * GPS latitude
   */
  latitude: number;

  /**
   * GPS longitude
   */
  longitude: number;

  /**
   * GPS record timestamp
   */
  recordedAt: string;
}

export interface GpsTrackForm extends BaseEntity {
  /**
   * Unique GPS track identifier
   */
  gpsTrackId?: string | number;

  /**
   * Trip FK
   */
  tripId?: string | number;

  /**
   * GPS latitude
   */
  latitude?: number;

  /**
   * GPS longitude
   */
  longitude?: number;

  /**
   * GPS record timestamp
   */
  recordedAt?: string;
}

export interface GpsTrackQuery extends PageQuery {
  /**
   * Unique GPS track identifier
   */
  gpsTrackId?: string | number;

  /**
   * Trip FK
   */
  tripId?: string | number;

  /**
   * GPS latitude
   */
  latitude?: number;

  /**
   * GPS longitude
   */
  longitude?: number;

  /**
   * GPS record timestamp
   */
  recordedAt?: string;

  /**
   * 日期范围参数
   */
  params?: any;

  /*
   * 创建时间
   */
  createTime?: string;

  /**
   * 排序字段
   */
  orderByColumn?: string;

  /**
   * 排序方式
   */
  isAsc?: string;
}
