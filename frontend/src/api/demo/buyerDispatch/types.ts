export interface BuyerDispatchVO {
  /**
   * 主键ID（非自增）
   */
  id: string | number;

  /**
   * 买家发货单号（如 BD-0001）
   */
  dispatchId: string | number;

  /**
   * 关联的批次ID（逻辑外键 -> t_postharvest_batch.id）
   */
  batchId: string | number;

  /**
   * 买方名称（公司或个人）
   */
  buyer: string;

  /**
   * 发货数量（单位：quintal）
   */
  qty: number;

  /**
   * 发货日期时间
   */
  dispatchDate: string;

  /**
   * 发货状态：Dispatched=已发货, Completed=买家确认收货, Cancelled=已取消
   */
  status: string;

  warehouseCode?: string | number;
}

export interface BuyerDispatchForm extends BaseEntity {
  /**
   * 主键ID（非自增）
   */
  id?: string | number;

  /**
   * 买家发货单号（如 BD-0001）
   */
  dispatchId?: string | number;
  warehouseId?: string | number;
  warehouseCode?: string | number;

  /**
   * 关联的批次ID（逻辑外键 -> t_postharvest_batch.id）
   */
  batchId?: string | number;

  /**
   * 买方名称（公司或个人）
   */
  buyer?: string;

  /**
   * 发货数量（单位：quintal）
   */
  qty?: number;

  /**
   * 发货日期时间
   */
  dispatchDate?: string;

  /**
   * 发货状态：Dispatched=已发货, Completed=买家确认收货, Cancelled=已取消
   */
  status?: string;
  approvedComment?: string;
}

export interface BuyerDispatchQuery extends PageQuery {
  /**
   * 买家发货单号（如 BD-0001）
   */
  dispatchId?: string | number;

  /**
   * 关联的批次ID（逻辑外键 -> t_postharvest_batch.id）
   */
  batchId?: string | number;

  /**
   * 买方名称（公司或个人）
   */
  buyer?: string;

  /**
   * 发货数量（单位：quintal）
   */
  qty?: number;

  /**
   * 发货日期时间
   */
  dispatchDate?: string;

  /**
   * 发货状态：Dispatched=已发货, Completed=买家确认收货, Cancelled=已取消
   */
  status?: string;

  warehouseCode?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
  orderByColumn?: string;
  isAsc?: string;
}
