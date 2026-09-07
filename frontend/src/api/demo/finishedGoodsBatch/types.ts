export interface FinishedGoodsBatchVO {
  /**
   * Finished Batch ID
   */
  finishedBatchId: string | number;

  /**
   * Production Batch ID
   */
  productionBatchId: string | number;

  /**
   * Stock Keeping Unit Code
   */
  stockKeepingUnitCode: string;

  /**
   * Quantity
   */
  quantity: number;

  /**
   * Packaging Type
   */
  packagingType: string;

  /**
   * Expiry Date
   */
  expiryDate: string;

  /**
   * QR Code
   */
  qrCode: string;

  /**
   * QR CodeUrl
   */
  qrCodeUrl: string;
  /**
   * Warehouse ID
   */
  warehouseId: string | number;

  /**
   * Status
   */
  status: string;

  /**
   * Approved By
   */
  approvedBy: number;

  /**
   * Approval Comment
   */
  approvedComment: string;

  /**
   * Approved Date
   */
  approvedAt: string;

  warehouseCode?: string | number;
}

export interface FinishedGoodsBatchForm extends BaseEntity {
  /**
   * Finished Batch ID
   */
  finishedBatchId?: string | number;

  /**
   * Production Batch ID
   */
  productionBatchId?: string | number;

  /**
   * Stock Keeping Unit Code
   */
  stockKeepingUnitCode?: string;

  /**
   * Quantity
   */
  quantity?: number;

  /**
   * Packaging Type
   */
  packagingType?: string;

  /**
   * Expiry Date
   */
  expiryDate?: string;

  /**
   * QR Code
   */
  qrCode?: string;

  /**
   * Warehouse ID
   */
  warehouseId?: string | number;

  /**
   * Status
   */
  status?: string;

  /**
   * Approved By
   */
  approvedBy?: number;

  /**
   * Approval Comment
   */
  approvedComment?: string;

  /**
   * Approved Date
   */
  approvedAt?: string;

  warehouseCode?: string | number;
}

export interface FinishedGoodsBatchQuery extends PageQuery {
  /**
   * Finished Batch ID
   */
  finishedBatchId?: string | number;

  /**
   * Production Batch ID
   */
  productionBatchId?: string | number;

  /**
   * Stock Keeping Unit Code
   */
  stockKeepingUnitCode?: string;

  /**
   * Quantity
   */
  quantity?: number;

  /**
   * Packaging Type
   */
  packagingType?: string;

  /**
   * Expiry Date
   */
  expiryDate?: string;

  /**
   * QR Code
   */
  qrCode?: string;

  /**
   * Warehouse ID
   */
  warehouseId?: string | number;

  /**
   * Status
   */
  status?: string;

  /**
   * Approved By
   */
  approvedBy?: number;

  /**
   * Approval Comment
   */
  approvedComment?: string;

  /**
   * Approved Date
   */
  approvedAt?: string;

  /**
   * 日期范围参数
   */
  params?: any;

  warehouseCode?: string | number;
}
