export interface ProcessStepRunsVO {
  /**
   * 处理步骤运行唯一标识
   */
  stepRunId: string | number;

  /**
   * 生产批次ID (FK → t_production_batch)
   */
  productionBatchId: string | number;

  /**
   * 步骤名称（如：清洗、加工、包装）
   */
  stepName: string;

  /**
   * 开始时间
   */
  startTime: string;

  /**
   * 结束时间
   */
  endTime: string;

  /**
   * 操作员用户ID (FK → sys_user)
   */
  operatorId: string | number;

  /**
   * 操作员用户名称
   */
  operatorUserName?: string;
}

export interface ProcessStepRunsForm extends BaseEntity {
  /**
   * 处理步骤运行唯一标识
   */
  stepRunId?: string | number;

  /**
   * 生产批次ID (FK → t_production_batch)
   */
  productionBatchId?: string | number;

  /**
   * 步骤名称（如：清洗、加工、包装）
   */
  stepName?: string;

  /**
   * 开始时间
   */
  startTime?: string;

  /**
   * 结束时间
   */
  endTime?: string;

  /**
   * 操作员用户ID (FK → sys_user)
   */
  operatorId?: string | number;

  /**
   * 操作员用户名称
   */
  operatorUserName?: string;
}

export interface ProcessStepRunsQuery extends PageQuery {
  /**
   * 生产批次ID (FK → t_production_batch)
   */
  productionBatchId?: string | number;

  /**
   * 步骤名称（如：清洗、加工、包装）
   */
  stepName?: string;

  /**
   * 开始时间
   */
  startTime?: string;

  /**
   * 结束时间
   */
  endTime?: string;

  /**
   * 操作员用户ID (FK → sys_user)
   */
  operatorId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;

  orderByColumn?: string;

  isAsc?: string;
}
