export interface ProofOfDeliveryVO {
  /**
   * Unique POD identifier
   */
  podId: string | number;

  /**
   * Shipment order FK
   */
  shipmentId: string | number;

  /**
   * Name of receiver
   */
  receivedBy: string;

  /**
   * Receipt timestamp
   */
  receivedAt: string;

  /**
   * Digital signature blob
   */
  signature: string;

  /**
   * Delivery photos in JSON format
   */
  photos: string;
}

export interface ProofOfDeliveryForm extends BaseEntity {
  /**
   * Unique POD identifier
   */
  podId?: string | number;

  /**
   * Shipment order FK
   */
  shipmentId?: string | number;

  /**
   * Name of receiver
   */
  receivedBy?: string;

  /**
   * Receipt timestamp
   */
  receivedAt?: string;

  /**
   * Digital signature blob
   */
  signature?: string;

  /**
   * Delivery photos in JSON format
   */
  photos?: string;

  status?: string;
}

export interface ProofOfDeliveryQuery extends PageQuery {
  /**
   * Shipment order FK
   */
  shipmentId?: string | number;

  /**
   * Name of receiver
   */
  receivedBy?: string;

  /**
   * Receipt timestamp
   */
  receivedAt?: string;

  /**
   * Digital signature blob
   */
  signature?: string;

  /**
   * Delivery photos in JSON format
   */
  photos?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
