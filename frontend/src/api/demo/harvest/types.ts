export interface HarvestVO {
  /**
   * 收获ID
   */
  harvestId: string | number;

  /**
   * 生产季节 ID
   */
  prodSeasonId: string | number;

  /**
   * 收获日期
   */
  harvestDate: string;

  /**
   * 已收获面积 (公顷)
   */
  harvestedAreaTa: number;

  /**
   * 收获产量 (公担)：收获时录入的原始实测产量
   */
  actualYieldQt: number;

  /**
   * 水分百分比
   */
  moisturePct: number;

  /**
   * 质量等级
   */
  qualityGrade: string;

  methods: string;

  /**
   * 买家
   */
  buyerName: string;

  /**
   * 记录者
   */
  recordedBy: string;

  /**
   * 核实人 ID
   */
  verifiedBy: string;

  /**
   * 核实时间
   */
  verifiedAt: string;

  /**
   * 部门ID
   */
  deptId: string | number;

  /**
   * 备注
   */
  remark: string;

  /**
   * 状态
   */
  status: string;
}

export interface HarvestForm extends BaseEntity {
  /**
   * 收获ID
   */
  harvestId?: string | number;

  /**
   * 生产季节 ID
   */
  prodSeasonId?: string | number;

  /**
   * 收获日期
   */
  harvestDate?: string;

  /**
   * 已收获面积 (公顷)
   */
  harvestedAreaTa?: number;

  /**
   * 收获产量 (公担)：收获时录入的原始实测产量
   */
  actualYieldQt?: number;

  /**
   * 水分百分比
   */
  moisturePct?: number;

  /**
   * 质量等级
   */
  qualityGrade?: string;

  methods?: string;

  /**
   * 买家
   */
  buyerName?: string;

  /**
   * 记录者
   */
  recordedBy?: string;
  recordedUserName?: string;

  /**
   * 核实人 ID
   */
  verifiedBy?: string;

  verifiedUserName?: string;

  /**
   * 核实时间
   */
  verifiedAt?: string;

  /**
   * 部门ID
   */
  deptId?: string | number;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 状态
   */
  status?: string;

  createBy: number;
  createTime: string;

  croppingPlan?: any;
  seasonName?: string;

  approvedComment?: string;
}

export interface HarvestQuery extends PageQuery {
  harvestId?: string | number;
  /**
   * 生产季节 ID
   */
  prodSeasonId?: string | number;

  /**
   * 收获日期
   */
  harvestDate?: string;

  /**
   * 已收获面积 (公顷)
   */
  harvestedAreaTa?: number;

  /**
   * 收获产量 (公担)：收获时录入的原始实测产量
   */
  actualYieldQt?: number;

  /**
   * 水分百分比
   */
  moisturePct?: number;

  /**
   * 质量等级
   */
  qualityGrade?: string;

  methods?: string;

  /**
   * 买家
   */
  buyerName?: string;

  /**
   * 记录者
   */
  recordedBy?: string;

  /**
   * 核实人 ID
   */
  verifiedBy?: string;

  /**
   * 核实时间
   */
  verifiedAt?: string;

  /**
   * 部门ID
   */
  deptId?: string | number;

  /**
   * 状态
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;

  orderByColumn: string;
  isAsc: string;
}
