export interface DriverVO {
  /**
   * Unique driver identifier
   */
  driverId: string | number;

  /**
   * Logistics provider FK
   */
  providerId: string | number;

  /**
   * Driver license number
   */
  licenseNumber: string;

  /**
   * Contact phone number
   */
  phoneNumber: string;

  /**
   * Draft=0 / Approved=1
   */
  status: string;

  /**
   * Approving authority user ID
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
}

export interface DriverForm extends BaseEntity {
  /**
   * Unique driver identifier
   */
  driverId?: string | number;

  /**
   * Logistics provider FK
   */
  providerId?: string | number;

  /**
   * Driver license number
   */
  licenseNumber?: string;

  /**
   * Contact phone number
   */
  phoneNumber?: string;

  /**
   * Draft=0 / Approved=1
   */
  status?: string;

  createdUserName?: string;
  createTime?: string;
  approvedBy?: number;
  approvedUserName?: string;
  approvedAt?: string;
  approvedComment?: string;
}

export interface DriverQuery extends PageQuery {
  /**
   * Unique driver identifier
   */
  driverId?: string | number;
  /**
   * Logistics provider FK
   */
  providerId?: string | number;

  /**
   * Driver license number
   */
  licenseNumber?: string;

  /**
   * Contact phone number
   */
  phoneNumber?: string;

  /**
   * Draft=0 / Approved=1
   */
  status?: string;

  /**
   * Approving authority user ID
   */
  approvedBy?: number;

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

  isAsc?: string;
}
