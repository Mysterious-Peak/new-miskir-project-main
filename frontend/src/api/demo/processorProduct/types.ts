export interface ProcessorProductVO {
  /**
   * Product ID
   */
  productId: string | number;

  /**
   * Processor ID
   */
  processorId: string | number;

  /**
   * Product Name
   */
  productName: string;

  /**
   * Product Category
   */
  productCategory: string;

  /**
   * Standard Reference
   */
  standardReference: string;

  /**
   * Packaging Type
   */
  packagingType: string;

  /**
   * Export Eligible
   */
  exportEligible: number;

  /**
   * Status
   */
  status: string;

  /**
   * Approved By
   */
  approvedBy: number;

  /**
   * Approved Comment
   */
  approvedComment: string;

  /**
   * Approval Time
   */
  approvedAt: string;

}

export interface ProcessorProductForm extends BaseEntity {
  /**
   * Product ID
   */
  productId?: string | number;

  /**
   * Processor ID
   */
  processorId?: string | number;

  /**
   * Product Name
   */
  productName?: string;

  /**
   * Product Category
   */
  productCategory?: string;

  /**
   * Standard Reference
   */
  standardReference?: string;

  /**
   * Packaging Type
   */
  packagingType?: string;

  /**
   * Export Eligible
   */
  exportEligible?: number;

  /**
   * Status
   */
  status?: string;

  /**
   * Approved By
   */
  approvedBy?: number;

  /**
   * Approved Comment
   */
  approvedComment?: string;

  /**
   * Approval Time
   */
  approvedAt?: string;

}

export interface ProcessorProductQuery extends PageQuery {

  /**
   * Product ID
   */
  productId?: string | number;

  /**
   * Processor ID
   */
  processorId?: string | number;

  /**
   * Product Name
   */
  productName?: string;

  /**
   * Product Category
   */
  productCategory?: string;

  /**
   * Standard Reference
   */
  standardReference?: string;

  /**
   * Packaging Type
   */
  packagingType?: string;

  /**
   * Export Eligible
   */
  exportEligible?: number;

  /**
   * Status
   */
  status?: string;

  /**
   * Approved By
   */
  approvedBy?: number;

  /**
   * Approved Comment
   */
  approvedComment?: string;

  /**
   * Approval Time
   */
  approvedAt?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
