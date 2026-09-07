export interface YieldEstimateVO {
  /**
   * 估算ID
   */
  estimateId: string | number;

  /**
   * 生产季节ID
   */
  prodSeasonId: string | number;

  /**
   * 估算日期
   */
  estimateDate: string;

  /**
   * 估算方法
   */
  method: string;

  /**
   * 上一次计划预估产量 (公担)
   */
  priviousPlannedEstimatedYieldQt: number;

  /**
   * 估算产量 (公担)
   */
  estimatedYieldQt: number;

  /**
   * 实测水分值 (%)
   */
  measuredMoistureValue?: number;

  /**
   * 谷物水分 (%)
   */
  grainMoisturePct?: number;

  /**
   * 记录人ID
   */
  recordedBy: string;

  /**
   * 部门ID
   */
  deptId: string | number;

  /**
   * 备注
   */
  remark: string;
}

export interface YieldEstimateForm extends BaseEntity {
  /**
   * 估算ID
   */
  estimateId?: string | number;

  /**
   * 生产季节ID
   */
  prodSeasonId?: string | number;

  /**
   * 估算日期
   */
  estimateDate?: string;

  /**
   * 估算方法
   */
  method?: string;

  /**
   * 上一次计划预估产量 (公担)
   */
  priviousPlannedEstimatedYieldQt?: number;

  /**
   * 估算产量 (公担)
   */
  estimatedYieldQt?: number;

  /**
   * 记录人ID
   */
  recordedBy?: string;

  /**
   * 部门ID
   */
  deptId?: string | number;

  /**
   * 备注
   */
  remark?: string;
  status?: string | number;
  approvedComment?: string;
}

export interface YieldEstimateQuery extends PageQuery {
  /**
   * 生产季节ID
   */
  prodSeasonId?: string | number;

  /**
   * 估算日期
   */
  estimateDate?: string;

  /**
   * 估算方法
   */
  method?: string;

  /**
   * 上一次计划预估产量 (公担)
   */
  priviousPlannedEstimatedYieldQt?: number;

  /**
   * 估算产量 (公担)
   */
  estimatedYieldQt?: number;

  /**
   * 记录人ID
   */
  recordedBy?: string;

  /**
   * 部门ID
   */
  deptId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
  status?: string | number;
  orderByColumn: string;
  isAsc: string;
}
