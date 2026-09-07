export interface FieldOperationLogVO {
  /**
   * 操作 ID
   */
  operationId: string | number;

  /**
   * 关联生产季节 ID
   */
  prodSeasonId: string | number;

  /**
   * 操作日期
   */
  operationDate: string;

  /**
   * 操作代码
   */
  operationCode: string;

  /**
   * input type
   */
  inputType: number;

  /**
   * 数量
   */
  quantity: number;

  /**
   * 单位
   */
  unit: string;

  /**
   * 操作人 ID
   */
  performedBy: string;

  /**
   * 核实人 ID
   */
  verifiedBy: string;

  /**
   * 审核时间
   */
  verifiedAt: string;

  /**
   * 部门ID
   */
  deptId: string | number;

  /**
   * 备注
   */
  remark: string;

  /**
   * 状态
   */
  status: string;
}

export interface FieldOperationLogForm extends BaseEntity {
  /**
   * 操作 ID
   */
  operationId?: string | number;

  /**
   * 关联生产季节 ID
   */
  prodSeasonId?: string | number;

  /**
   * 操作日期
   */
  operationDate?: string;

  /**
   * 操作代码
   */
  operationCode?: string;

  /**
   * input type
   */
  inputType?: string;

  /**
   * 数量
   */
  quantity?: number;

  /**
   * 单位
   */
  unit?: string;

  /**
   * 操作人 ID
   */
  performedBy?: string;

  /**
   * 核实人 ID
   */
  verifiedBy?: string;

  verifiedUserName?: string;

  /**
   * 审核时间
   */
  verifiedAt?: string;

  /**
   * 部门ID
   */
  deptId?: string | number;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 状态
   */
  status?: string;

  croppingPlan?: any;
  seasonName?: string;

  approvedComment?: string;
}

export interface FieldOperationLogQuery extends PageQuery {
  /**
   * 关联生产季节 ID
   */
  prodSeasonId?: string | number;

  /**
   * Partial prod season id for remote select
   */
  prodSeasonIdLike?: string;

  /**
   * 操作日期
   */
  operationDate?: string;

  /**
   * 操作代码
   */
  operationCode?: string;

  /**
   * input type
   */
  inputType?: string;

  /**
   * 数量
   */
  quantity?: number;

  /**
   * 单位
   */
  unit?: string;

  /**
   * 操作人 ID
   */
  performedBy?: string;

  /**
   * 核实人 ID
   */
  verifiedBy?: string;

  /**
   * 审核时间
   */
  verifiedAt?: string;

  /**
   * 部门ID
   */
  deptId?: string | number;

  /**
   * 状态
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;

  orderByColumn: string;
  isAsc: string;
}
