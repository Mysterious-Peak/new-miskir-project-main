export interface ApprovalTaskVO {
  /**
   * Unique task identifier (UUID)
   */
  taskId: string | number;

  /**
   * 业务类型
   */
  businessType: string;

  /**
   * 任务名称（按 business_type 对应的 task_name 枚举）
   */
  taskName?: string;

  /**
   * 业务主键 (UUID)
   */
  businessKey: string;

  /**
   * 审批人用户ID
   */
  assignee: string;

  /**
   * 审批人用户名称
   */
  assigneeName: string;

  /**
   * 审批状态: Pending / Approved / Rejected
   */
  approvalStatus: string;

  /**
   * 审批意见/备注
   */
  comments: string;

  /**
   * 操作时间
   */
  operateTime: string;

  /**
   * 备注显示标志 0-不显示 1-显示
   */
  commentsShowFlg?: number;
}

export interface ApprovalTaskForm extends BaseEntity {
  /**
   * Unique task identifier (UUID)
   */
  taskId?: string | number;

  /**
   * 业务主键 (UUID)
   */
  businessKey?: string;

  /**
   * 业务类型
   */
  businessType?: string;

  /**
   * 任务名称（按 business_type 对应的 task_name 枚举）
   */
  taskName?: string;

  /**
   * 审批人用户ID
   */
  assignee?: string;

  /**
   * 操作时间
   */
  operateTime?: string;

  /**
   * 审批意见/备注
   */
  comments?: string;

  /**
   * 审批状态: Pending / Approved / Rejected
   */
  approvalStatus?: string;

  /**
   * 备注显示标志 0-不显示 1-显示
   */
  commentsShowFlg?: number;
}

export interface ApprovalTaskQuery extends PageQuery {
  /**
   * 业务类型
   */
  businessType?: string;

  /**
   * 任务名称（按 business_type 对应的 task_name 枚举）
   */
  taskName?: string;

  /**
   * 业务主键 (UUID)
   */
  businessKey?: string;

  /**
   * 审批人用户ID
   */
  assignee?: string;

  /**
   * 审批状态: Pending / Approved / Rejected
   */
  approvalStatus?: string;

  /**
   * 审批意见/备注
   */
  comments?: string;

  /**
   * 操作时间
   */
  operateTime?: string;

  /**
   * 备注显示标志 0-不显示 1-显示
   */
  commentsShowFlg?: number;

  /**
   * 日期范围参数
   */
  params?: any;

  /**
   * 排序列（如 operateTime）
   */
  orderByColumn?: string;

  /**
   * 排序方向 asc / desc
   */
  isAsc?: string;
}
