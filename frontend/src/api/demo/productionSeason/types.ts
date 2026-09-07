export interface ProductionSeasonVO {
  /**
   * 生产季节 ID
   */
  prodSeasonId: string | number;

  /**
   * 生产季节编号
   */
  prodSeasonCode: string;

  /**
   * 关联作物规划 ID
   */
  planId: string | number;

  /**
   * 关联农田 ID
   */
  farmlandId: string | number;

  /**
   * 作物代码
   */
  cropId: string;

  /**
   * 季节
   */
  seasonId: string;

  /**
   * 年份
   */
  year: number;

  /**
   * 生产面积 (公顷)
   */
  areaTa: number;

  /**
   * 状态(0计划中 1进行中 2已完成 3已取消)
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
   * 部门ID
   */
  deptId: string | number;

  /**
   * 备注
   */
  remark: string;
}

export interface ProductionSeasonForm extends BaseEntity {
  /**
   * 生产季节 ID
   */
  prodSeasonId?: string | number;

  /**
   * 生产季节编号
   */
  prodSeasonCode?: string;

  /**
   * 关联作物规划 ID
   */
  planId?: string | number;

  /**
   * 关联农田 ID
   */
  farmlandId?: string | number;

  /**
   * 作物代码
   */
  cropId?: string;

  /**
   * 季节
   */
  seasonId?: string;

  /**
   * 年份
   */
  year?: number;

  /**
   * 生产面积 (公顷)
   */
  areaTa?: number;

  /**
   * 状态(0计划中 1进行中 2已完成 3已取消)
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
   * 部门ID
   */
  deptId?: string | number;

  /**
   * 备注
   */
  remark?: string;
}

export interface ProductionSeasonQuery extends PageQuery {
  /**
   * 生产季节编号
   */
  prodSeasonCode?: string;

  /**
   * 关联作物规划 ID
   */
  planId?: string | number;

  /**
   * 关联农田 ID
   */
  farmlandId?: string | number;

  /**
   * 作物代码
   */
  cropId?: string;

  /**
   * 季节
   */
  seasonId?: string;

  /**
   * 年份
   */
  year?: number;

  /**
   * 生产面积 (公顷)
   */
  areaTa?: number;

  /**
   * 状态(0计划中 1进行中 2已完成 3已取消)
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
   * 部门ID
   */
  deptId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;

  orderByColumn?: string;
  isAsc?: string;

  prodSeasonId?: string;
}
