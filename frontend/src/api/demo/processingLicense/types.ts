export interface ProcessingLicenseVO {
  /**
   *
   */
  licenseId: string | number;

  /**
   * FK → AGROPROCESSOR
   */
  processorId: string | number;

  /**
   * Operational / Export
   */
  licenseType: string;

  /**
   * ESA / EFDA / Regional
   */
  issuingAuthority: string;

  /**
   *
   */
  issueDate: string;

  /**
   *
   */
  expireDate: string;

  /**
   * Pending / Valid / Expired
   */
  status: string;

  /**
   * Digital copy
   */
  documentUrl: string;

  /**
   *
   */
  approvedBy: number;

  /**
   *
   */
  approvedComment: string;

  /**
   * Approval Time
   */
  approvedAt: string;
}

export interface ProcessingLicenseForm extends BaseEntity {
  /**
   *
   */
  licenseId?: string | number;

  /**
   * FK → AGROPROCESSOR
   */
  processorId?: string | number;

  /**
   * Operational / Export
   */
  licenseType?: string;

  /**
   * ESA / EFDA / Regional
   */
  issuingAuthority?: string;

  /**
   *
   */
  issueDate?: string;
  expireDate?: string;

  /**
   * Pending / Valid / Expired
   */
  status?: string;
  validityStatus?: string;

  /**
   * Digital copy
   */
  documentUrl?: string;

  /**
   *
   */
  approvedBy?: number;

  /**
   *
   */
  approvedComment?: string;

  /**
   * Approval Time
   */
  approvedAt?: string;
}

export interface ProcessingLicenseQuery extends PageQuery {
  /**
   * License ID（查询）
   */
  licenseId?: string | number;

  /**
   * FK → AGROPROCESSOR
   */
  processorId?: string | number;

  /**
   * Operational / Export
   */
  licenseType?: string;

  /**
   * ESA / EFDA / Regional
   */
  issuingAuthority?: string;

  /**
   *
   */
  issueDate?: string;

  /**
   *
   */
  expireDate?: string;

  /**
   * Pending / Valid / Expired
   */
  status?: string;
  validityStatus?: string;

  /**
   * Digital copy
   */
  documentUrl?: string;

  /**
   *
   */
  approvedBy?: number;

  /**
   *
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
  orderByColumn?: string;
  isAsc?: string;
}
