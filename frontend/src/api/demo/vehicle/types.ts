export interface VehicleVO {
  /**
   * Unique vehicle identifier
   */
  vehicleId: string | number;

  /**
   * Logistics provider FK
   */
  providerId: string | number;

  /**
   * Vehicle registration plate
   */
  plateNumber: string;

  /**
   * Truck=0 / Refrigerated=1
   */
  vehicleType: string;

  /**
   * Cold chain capability: No=0 / Yes=1
   */
  coldChainCapable: number;

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

export interface VehicleForm extends BaseEntity {
  /**
   * Unique vehicle identifier
   */
  vehicleId?: string | number;

  /**
   * Logistics provider FK
   */
  providerId?: string | number;

  /**
   * Vehicle registration plate
   */
  plateNumber?: string;

  /**
   * Truck=0 / Refrigerated=1
   */
  vehicleType?: string;

  /**
   * Cold chain capability: No=0 / Yes=1
   */
  coldChainCapable?: number;

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

export interface VehicleQuery extends PageQuery {
  /**
   * vehicle id
   */
  vehicleId?: string | number;
  /**
   * Logistics provider FK
   */
  providerId?: string | number;

  /**
   * Vehicle registration plate
   */
  plateNumber?: string;

  /**
   * Truck=0 / Refrigerated=1
   */
  vehicleType?: string;

  /**
   * Cold chain capability: No=0 / Yes=1
   */
  coldChainCapable?: number;

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
