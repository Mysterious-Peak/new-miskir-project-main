export interface WarehouseIntakeVO {
  /**
   * 主键ID（非自增）
   */
  id: string | number;

  /**
   * 入库单号（如 IN-0001）
   */
  intakeId: string | number;

  /**
   * 关联的批次ID（逻辑外键 -> t_postharvest_batch.id）
   */
  batchId: string | number;

  /**
   * 目标仓库ID（逻辑外键 -> t_warehouse_master.id）
   */
  warehouseId: string | number;

  /**
   * 目标仓库编码（对应 warehouse_code）
   */
  warehouseCode?: string;

  /**
   * 实际入库数量（单位：quintal）
   */
  qty: number;

  /**
   * 入库操作日期时间
   */
  intakeDate: string;

  /**
   * 审批人用户ID（逻辑外键 -> t_user.id）
   */
  approvedBy: number;
}

export interface WarehouseIntakeForm extends BaseEntity {
  /**
   * 主键ID（非自增）
   */
  id?: string | number;

  /**
   * 入库单号（如 IN-0001）
   */
  intakeId?: string | number;

  /**
   * 关联的批次ID（逻辑外键 -> t_postharvest_batch.id）
   */
  batchId?: string | number;

  /**
   * 目标仓库ID（逻辑外键 -> t_warehouse_master.id）
   */
  warehouseId?: string | number;

  /**
   * 目标仓库编码（对应 warehouse_code）
   */
  warehouseCode?: string;

  /**
   * 实际入库数量（单位：quintal）
   */
  qty?: number;

  /**
   * 入库操作日期时间
   */
  intakeDate?: string;

  status?: string;

  createdUserName?: string;
  createTime?: string;

  /**
   * 审批人用户ID（逻辑外键 -> t_user.id）
   */
  approvedBy?: number;
  approvedUserName?: string;
  approvedAt?: string;
  approvedComment?: string;

  batchName?: string;
  warehouseName?: string;
}

export interface WarehouseIntakeQuery extends PageQuery {
  /**
   * 入库单号（如 IN-0001）
   */
  intakeId?: string | number;

  /**
   * 关联的批次ID（逻辑外键 -> t_postharvest_batch.id）
   */
  batchId?: string | number;

  /**
   * 目标仓库ID（逻辑外键 -> t_warehouse_master.id）
   */
  warehouseId?: string | number;

  /**
   * 目标仓库编码（对应 warehouse_code）
   */
  warehouseCode?: string;

  /**
   * 实际入库数量（单位：quintal）
   */
  qty?: number;

  /**
   * 入库操作日期时间
   */
  intakeDate?: string;

  /**
   * 审批人用户ID（逻辑外键 -> t_user.id）
   */
  approvedBy?: number;

  /**
   * 日期范围参数
   */
  params?: any;

  orderByColumn?: string;
  isAsc?: string;
}
