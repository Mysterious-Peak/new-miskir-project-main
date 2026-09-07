export interface LossMonitoringVO {
  /**
   * 主键ID（非自增）
   */
  id: string | number;

  /**
   * 损耗记录编号（如 LOSS-001）
   */
  lossId: string | number;

  /**
   * 关联的批次ID（逻辑外键 -> t_postharvest_batch.id）
   */
  batchId: string | number;

  /**
   * 损耗类型：Spoilage=腐烂, Pest=虫害, Shrinkage=干缩, Breakage=破损
   */
  type: string;

  /**
   * 损耗数量（单位：quintal）
   */
  qty: number;

  /**
   * 损耗原因描述（如“高湿度导致霉变”）
   */
  cause: string;

  /**
   * 损耗上报时间
   */
  reportedAt: string;

  warehouseCode?: string | number;
}

export interface LossMonitoringForm extends BaseEntity {
  /**
   * 主键ID（非自增）
   */
  id?: string | number;

  /**
   * 损耗记录编号（如 LOSS-001）
   */
  lossId?: string | number;

  warehouseId?: string | number;

  /**
   * 关联的批次ID（逻辑外键 -> t_postharvest_batch.id）
   */
  batchId?: string | number;

  /**
   * 损耗类型：Spoilage=腐烂, Pest=虫害, Shrinkage=干缩, Breakage=破损
   */
  type?: string;

  /**
   * 损耗数量（单位：quintal）
   */
  qty?: number;

  /**
   * 损耗原因描述（如“高湿度导致霉变”）
   */
  cause?: string;

  /**
   * 损耗上报时间
   */
  reportedAt?: string;
  status?: string;

  warehouseCode?: string | number;
}

export interface LossMonitoringQuery extends PageQuery {
  /**
   * 损耗记录编号（如 LOSS-001）
   */
  lossId?: string | number;

  /**
   * 关联的批次ID（逻辑外键 -> t_postharvest_batch.id）
   */
  batchId?: string | number;

  /**
   * 损耗类型：Spoilage=腐烂, Pest=虫害, Shrinkage=干缩, Breakage=破损
   */
  type?: string;

  /**
   * 损耗数量（单位：quintal）
   */
  qty?: number;

  /**
   * 损耗原因描述（如“高湿度导致霉变”）
   */
  cause?: string;

  /**
   * 损耗上报时间
   */
  reportedAt?: string;

  /**
   * 日期范围参数
   */
  params?: any;

  warehouseCode?: string | number;
}
