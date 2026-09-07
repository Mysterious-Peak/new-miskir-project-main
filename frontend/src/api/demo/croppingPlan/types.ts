export interface CroppingPlanVO {
  planScope?: 'FARMLAND' | 'CLUSTER';

  clusterId?: string;

  clusterName?: string;

  /**
   * 自增ID
   */
  planId: string | number;

  /**
   * 关联农田ID
   */
  farmlandId: string | number;

  /**
   * 季节(Meher/Belg)
   */
  seasonId: string;

  /**
   * 年份
   */
  year: number;

  /**
   * 作物代码
   */
  cropCode: string;

  /**
   * 作物名称
   */
  cropName: string;

  /**
   * 计划种植面积(公顷)
   */
  plannedAreaTa: number;

  /**
   * 计划总产量(公担)
   */
  plannedYieldQt: number;

  /**
   * 计划种植开始窗口
   */
  plantingWindowStart: string;

  /**
   * 计划种植结束窗口
   */
  plantingWindowEnd: string;

  /**
   * 收获窗口开始
   */
  harvestWindowStart: string;

  /**
   * 收获窗口结束
   */
  harvestWindowEnd: string;

  /**
   * 状态(0草稿 1已提交 2已批准 3已拒绝)
   */
  status: string;

  /**
   * 创建者
   */
  createdUserName: string;

  /**
   * 创建时间
   */
  createTime: string;

  /**
   * 批准人ID
   */
  approvedBy: string;

  /**
   * 批准时间
   */
  approvedAt: string;

  /**
   * 部门ID
   */
  deptId: string | number;

  /**
   * 备注
   */
  remark: string;

  seasonName?: string;
}

export interface CroppingPlanForm extends BaseEntity {
  planScope?: 'FARMLAND' | 'CLUSTER';

  clusterId?: string;

  clusterName?: string;

  /**
   * 自增ID
   */
  planId?: string | number;

  /**
   * 关联农田ID
   */
  farmlandId?: string | number;

  /**
   * 季节(Meher/Belg)
   */
  seasonId?: string;

  /**
   * 年份
   */
  year?: number;

  /**
   * 作物代码
   */
  cropCode?: string;

  /**
   * 计划种植面积(公顷)
   */
  plannedAreaTa?: number;

  /**
   * 计划总产量(公担)
   */
  plannedYieldQt?: number;

  /**
   * 计划种植开始窗口
   */
  plantingWindowStart?: string;

  /**
   * 计划种植结束窗口
   */
  plantingWindowEnd?: string;

  /**
   * 收获窗口开始
   */
  harvestWindowStart?: string;

  /**
   * 收获窗口结束
   */
  harvestWindowEnd?: string;

  /**
   * 状态(0草稿 1已提交 2已批准 3已拒绝)
   */
  status?: string;

  /**
   * 创建者
   */
  createdUserName?: string;

  /**
   * 创建时间
   */
  createTime?: string;

  /**
   * 批准人ID
   */
  approvedBy?: string;
  approvedUserName?: string;
  approvedComment?: string;

  /**
   * 批准时间
   */
  approvedAt?: string;

  /**
   * 部门ID
   */
  deptId?: string | number;

  /**
   * 备注
   */
  remark?: string;

  seasonName?: string;
}

export interface CroppingPlanQuery extends PageQuery {
  planScope?: 'FARMLAND' | 'CLUSTER';

  clusterId?: string;

  /**
   * 自增ID
   */
  planId?: string | number;

  /**
   * 关联农田ID
   */
  farmlandId?: string | number;

  /**
   * 季节(Meher/Belg)
   */
  seasonId?: string;

  /**
   * 年份
   */
  year?: number;

  /**
   * 作物代码
   */
  cropCode?: string;

  /**
   * 计划种植面积(公顷)
   */
  plannedAreaTa?: number;

  /**
   * 计划总产量(公担)
   */
  plannedYieldQt?: number;

  /**
   * 计划种植开始窗口
   */
  plantingWindowStart?: string;

  /**
   * 计划种植结束窗口
   */
  plantingWindowEnd?: string;

  /**
   * 收获窗口开始
   */
  harvestWindowStart?: string;

  /**
   * 收获窗口结束
   */
  harvestWindowEnd?: string;

  /**
   * 状态(0草稿 1已提交 2已批准 3已拒绝)
   */
  status?: string;

  /**
   * 创建者
   */
  createdUserName?: string;

  /**
   * 创建时间
   */
  createTime?: string;

  /**
   * 批准人ID
   */
  approvedBy?: string;

  /**
   * 批准时间
   */
  approvedAt?: string;

  /**
   * 部门ID
   */
  deptId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;

  orderByColumn?: string;
  isAsc?: string;
}
