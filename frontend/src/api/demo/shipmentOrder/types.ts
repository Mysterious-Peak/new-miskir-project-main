export interface ShipmentOrderBatchLinkVO {
  /**
   * Shipment batch link ID
   */
  shipmentBatchLinkId: string;
  /**
   * Shipment ID
   */
  shipmentId: string;
  /**
   * Finished goods batch ID
   */
  finishedBatchId: string;
  /**
   * Quantity in kg or liters
   */
  quantity: number;
}

export interface ShipmentOrderVO {
  /**
   * Unique shipment identifier
   */
  shipmentId: string | number;

  /**
   * Source warehouse or processor
   */
  sourceEntity: string;

  /**
   * Destination location
   */
  destinationEntity: string;

  /**
   * Planned dispatch time
   */
  plannedDispatch: string;

  /**
   * Delivery deadline
   */
  deliveryDeadline: string;

  /**
   * Batch Type (dict: batch_type)
   */
  batchType: string;

  /**
   * Created=0,Planned=1,In-Transit=2,Delivered=3
   */
  status: string;

  /**
   * Logistics supervisor user ID
   */
  approvedBy: number;

  /**
   * 审批意见
   */
  approvedComment: string;

  /**
   * Approval date
   */
  approvedAt: string;

  /**
   * Batch links associated with this shipment order
   */
  batchLinks?: ShipmentOrderBatchLinkVO[];

  providerId?: string;
}

export interface ShipmentOrderForm extends BaseEntity {
  /**
   * Unique shipment identifier
   */
  shipmentId?: string | number;

  /**
   * LogisticsProvider
   */
  providerId?: string;

  /**
   * Source warehouse or processor
   */
  sourceEntity?: string;

  /**
   * Destination location
   */
  destinationEntity?: string;

  /**
   * Planned dispatch time
   */
  plannedDispatch?: string;

  /**
   * Delivery deadline
   */
  deliveryDeadline?: string;

  /**
   * Batch Type (dict: batch_type)
   */
  batchType?: string;

  /**
   * Created=0,Planned=1,In-Transit=2,Delivered=3
   */
  status?: string;

  /**
   * Logistics supervisor user ID
   */
  approvedBy?: number;

  /**
   * Logistics Company
   */
  logisticsCompany?: string;

  /**
   * 审批意见
   */
  approvedComment?: string;

  /**
   * Approval date
   */
  approvedAt?: string;

  /**
   * Batch links associated with this shipment order
   */
  batchLinks?: ShipmentOrderBatchLinkItem[];
}

export interface ShipmentOrderBatchLinkItem {
  /**
   * Finished goods batch FK
   */
  finishedBatchId: string;
  /**
   * Quantity in kg or liters
   */
  quantity: number;
}

export interface ShipmentOrderCreateBatchForm extends BaseEntity {
  /**
   * LogisticsProvider
   */
  providerId: string;
  /**
   * Source warehouse or processor
   */
  sourceEntity: string;
  /**
   * Destination location
   */
  destinationEntity: string;
  /**
   * Planned dispatch time
   */
  plannedDispatch: string;
  /**
   * Delivery deadline
   */
  deliveryDeadline: string;
  /**
   * Batch Type (dict: batch_type)
   */
  batchType?: string;
  /**
   * 成品批次分配明细
   */
  batchLinks: ShipmentOrderBatchLinkItem[];
}

export interface ShipmentOrderBatchLinkItem {
  /**
   * Finished goods batch FK
   */
  finishedBatchId: string;
  /**
   * Quantity in kg or liters
   */
  quantity: number;
}

export interface ShipmentOrderCreateBatchForm extends BaseEntity {
  /**
   * LogisticsProvider
   */
  providerId: string;
  /**
   * Source warehouse or processor
   */
  sourceEntity: string;
  /**
   * Destination location
   */
  destinationEntity: string;
  /**
   * Planned dispatch time
   */
  plannedDispatch: string;
  /**
   * Delivery deadline
   */
  deliveryDeadline: string;
  /**
   * Batch Type (dict: batch_type)
   */
  batchType?: string;
  /**
   * 成品批次分配明细
   */
  batchLinks: ShipmentOrderBatchLinkItem[];
}

export interface ShipmentOrderQuery extends PageQuery {
  /**
   * Unique shipment identifier
   */
  shipmentId?: string | number;

  /**
   * Source warehouse or processor
   */
  sourceEntity?: string;

  /**
   * Destination location
   */
  destinationEntity?: string;

  /**
   * Planned dispatch time
   */
  plannedDispatch?: string;

  /**
   * Delivery deadline
   */
  deliveryDeadline?: string;

  /**
   * Batch Type (dict: batch_type)
   */
  batchType?: string;

  /**
   * Created=0,Planned=1,In-Transit=2,Delivered=3
   */
  status?: string;

  /**
   * Logistics supervisor user ID
   */
  approvedBy?: number;

  /**
   * Logistics Company
   */
  logisticsCompany?: string;

  /**
   * 审批意见
   */
  approvedComment?: string;

  /**
   * Approval date
   */
  approvedAt?: string;

  /**
   * 日期范围参数
   */
  params?: any;
  orderByColumn?: string;

  /**
   * 排序方向
   */
  isAsc?: string;
}
