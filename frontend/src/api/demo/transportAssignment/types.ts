export interface TransportAssignmentVO {
  /**
   * 主键ID（非自增）
   */
  id: string | number;

  /**
   * 运输任务编号（如 TA-001）
   */
  transportId: string | number;

  /**
   * 关联的批次ID（逻辑外键 -> t_postharvest_batch.id）
   */
  batchId: string | number;

  /**
   * 承运商ID（逻辑外键 -> t_transporter_master.id）
   */
  transporterId: string | number;

  /**
   * 起运地（通常为仓库名称或地址）
   */
  fromLocation: string;

  /**
   * 目的地（买家或加工厂地址）
   */
  toLocation: string;

  /**
   * 运输状态：Scheduled=已调度, InTransit=运输中, Delivered=已送达, Cancelled=已取消
   */
  status: string;

  /**
   * 计划发运时间
   */
  scheduledDate: string;

  /**
   * 实际发车时间（可为空）
   */
  actualDeparture: string;

  /**
   * 实际到达时间（可为空）
   */
  actualArrival: string;

  /**
   * 运输任务审批人用户ID（逻辑外键 -> t_user.id）
   */
  approvedBy: number;

}

export interface TransportAssignmentForm extends BaseEntity {
  /**
   * 主键ID（非自增）
   */
  id?: string | number;

  /**
   * 运输任务编号（如 TA-001）
   */
  transportId?: string | number;

  /**
   * 关联的批次ID（逻辑外键 -> t_postharvest_batch.id）
   */
  batchId?: string | number;

  /**
   * 承运商ID（逻辑外键 -> t_transporter_master.id）
   */
  transporterId?: string | number;

  /**
   * 起运地（通常为仓库名称或地址）
   */
  fromLocation?: string;

  /**
   * 目的地（买家或加工厂地址）
   */
  toLocation?: string;

  /**
   * 运输状态：Scheduled=已调度, InTransit=运输中, Delivered=已送达, Cancelled=已取消
   */
  status?: string;

  /**
   * 计划发运时间
   */
  scheduledDate?: string;

  /**
   * 实际发车时间（可为空）
   */
  actualDeparture?: string;

  /**
   * 实际到达时间（可为空）
   */
  actualArrival?: string;

  /**
   * 运输任务审批人用户ID（逻辑外键 -> t_user.id）
   */
  approvedBy?: number;
  approvedComment?: string;

}

export interface TransportAssignmentQuery extends PageQuery {

  /**
   * 运输任务编号（如 TA-001）
   */
  transportId?: string | number;

  /**
   * 关联的批次ID（逻辑外键 -> t_postharvest_batch.id）
   */
  batchId?: string | number;

  /**
   * 承运商ID（逻辑外键 -> t_transporter_master.id）
   */
  transporterId?: string | number;

  /**
   * 起运地（通常为仓库名称或地址）
   */
  fromLocation?: string;

  /**
   * 目的地（买家或加工厂地址）
   */
  toLocation?: string;

  /**
   * 运输状态：Scheduled=已调度, InTransit=运输中, Delivered=已送达, Cancelled=已取消
   */
  status?: string;

  /**
   * 计划发运时间
   */
  scheduledDate?: string;

  /**
   * 实际发车时间（可为空）
   */
  actualDeparture?: string;

  /**
   * 实际到达时间（可为空）
   */
  actualArrival?: string;

  /**
   * 运输任务审批人用户ID（逻辑外键 -> t_user.id）
   */
  approvedBy?: number;

  /**
   * 日期范围参数
   */
  params?: any;
  orderByColumn?: string;
  isAsc?: string;
}
