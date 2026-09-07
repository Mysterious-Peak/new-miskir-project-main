export interface LandPreparationApprovalVerifyVO {
  /**
   * 土地准备记录ID
   */
  landprepId: string | number;

  /**
   * 关联生产季节ID
   */
  prodSeasonId: string | number;

  /**
   * 准备日期
   */
  prepDate: string;

  /**
   * 准备方法 (如Ploughing)
   */
  method: string;

  /**
   * 使用的机械/工具 (如Oxen)
   */
  machineryUsed: string;

  /**
   * 耕作深度 (厘米)
   */
  depthCm: number;

  /**
   * 备注
   */
  remarks: string;

  /**
   * 记录人ID
   */
  recordedBy: string;

  /**
   * 核实人ID
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

export interface LandPreparationApprovalVerifyForm extends BaseEntity {
  /**
   * 土地准备记录ID
   */
  landprepId?: string | number;

  /**
   * 关联生产季节ID
   */
  prodSeasonId?: string | number;

  /**
   * 准备日期
   */
  prepDate?: string;

  /**
   * 准备方法 (如Ploughing)
   */
  method?: string;

  /**
   * 使用的机械/工具 (如Oxen)
   */
  machineryUsed?: string;

  /**
   * 耕作深度 (厘米)
   */
  depthCm?: number;

  /**
   * 备注
   */
  remarks?: string;

  /**
   * 记录人ID
   */
  recordedBy?: string;

  /**
   * 核实人ID
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
   * 备注
   */
  remark?: string;

  /**
   * 状态
   */
  status?: string;
  approvedComment?: string;
}

export interface LandPreparationApprovalVerifyQuery extends PageQuery {
  /**
   * 关联生产季节ID
   */
  prodSeasonId?: string | number;

  /**
   * 准备日期
   */
  prepDate?: string;

  /**
   * 准备方法 (如Ploughing)
   */
  method?: string;

  /**
   * 使用的机械/工具 (如Oxen)
   */
  machineryUsed?: string;

  /**
   * 耕作深度 (厘米)
   */
  depthCm?: number;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 记录人ID
   */
  recordedBy?: string;

  /**
   * 核实人ID
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
