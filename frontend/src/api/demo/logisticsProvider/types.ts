export interface LogisticsProviderVO {
  /**
   * Unique provider identifier
   */
  providerId: string | number;

  /**
   * Provider business name
   */
  providerName: string | number;

  /**
   * Transport license number
   */
  licenseNumber: string;

  /**
   * Number of vehicles in fleet
   */
  fleetSize: number;

  /**
   * Operating region
   */
  region: string;

  /**
   * Department ID
   */
  deptId?: number | string;

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

export interface LogisticsProviderForm extends BaseEntity {
  /**
   * Unique provider identifier
   */
  providerId?: string | number;

  /**
   * Provider business name
   */
  providerName?: string | number;

  /**
   * Transport license number
   */
  licenseNumber?: string;

  /**
   * Number of vehicles in fleet
   */
  fleetSize?: number;

  /**
   * Operating region
   */
  region?: string;

  /**
   * Department ID
   */
  deptId?: number | string;

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

}

export interface LogisticsProviderQuery extends PageQuery {
  /**
   * Unique provider identifier（查询）
   */
  providerId?: string | number;

  /**
   * Provider business name
   */
  providerName?: string | number;

  /**
   * Transport license number
   */
  licenseNumber?: string;

  /**
   * Number of vehicles in fleet
   */
  fleetSize?: number;

  /**
   * Operating region
   */
  region?: string;

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

  /**
   * 排序字段
   */
  orderByColumn?: string;

  /**
   * 排序方向
   */
  isAsc?: string;
}
