export interface WarehouseReceiptVO {
  /**
   * 主键ID（非自增）
   */
  id: string | number;

  /**
   * 数字仓单编号（如 WR-001）
   */
  receiptId: string | number;

  /**
   * 关联的批次ID（逻辑外键 -> t_postharvest_batch.id）
   */
  batchId: string | number;

  /**
   * 存储仓库ID（逻辑外键 -> t_warehouse_master.id）
   */
  warehouseId: string | number;

  /**
   * 仓单对应数量（单位：quintal）
   */
  qty: number;

  /**
   * 仓单估值（埃塞俄比亚比尔 ETB），用于融资抵押
   */
  valueEtb: number;

  warehouseCode?: string | number;
}

export interface WarehouseReceiptForm extends BaseEntity {
  /**
   * 主键ID（非自增）
   */
  id?: string | number;

  /**
   * 数字仓单编号（如 WR-001）
   */
  receiptId?: string | number;

  /**
   * 关联的批次ID（逻辑外键 -> t_postharvest_batch.id）
   */
  batchId?: string | number;

  /**
   * 存储仓库ID（逻辑外键 -> t_warehouse_master.id）
   */
  warehouseId?: string | number;

  /**
   * 仓单对应数量（单位：quintal）
   */
  qty?: number;

  /**
   * 仓单估值（埃塞俄比亚比尔 ETB），用于融资抵押
   */
  valueEtb?: number;
  status?: string;
  approvedComment: string;
  approvedBy?: number;
  approvedUserName?: string;
  approvedAt?: string;

  warehouseCode?: string | number;
}

export interface WarehouseReceiptQuery extends PageQuery {
  /**
   * 数字仓单编号（如 WR-001）
   */
  receiptId?: string | number;

  /**
   * 关联的批次ID（逻辑外键 -> t_postharvest_batch.id）
   */
  batchId?: string | number;

  /**
   * 存储仓库ID（逻辑外键 -> t_warehouse_master.id）
   */
  warehouseId?: string | number;

  /**
   * 仓单对应数量（单位：quintal）
   */
  qty?: number;

  /**
   * 仓单估值（埃塞俄比亚比尔 ETB），用于融资抵押
   */
  valueEtb?: number;

  /**
   * 日期范围参数
   */
  params?: any;
  orderByColumn?: string;
  isAsc?: string;

  warehouseCode?: string | number;
}
