export interface SowingVO {
  /**
   * 播种记录ID
   */
  sowingId: string | number;

  /**
   * 关联生产季节ID
   */
  prodSeasonId: string | number;

  /**
   * 播种日期
   */
  sowingDate: string;

  /**
   * 种子批次代码
   */
  seedLotCode: string;

  /**
   * 种子类型 (如Obsa-23)
   */
  seedType: string;

  /**
   * 播种材料
   */
  plantingMaterial?: string;

  /**
   * 播种量 (公斤)
   */
  seedRateKg: number;

  /**
   * 行/株距 (厘米)
   */
  spacingCm: string;

  /**
   * 株距 (厘米)
   */
  plantSpacingCm?: string | number;

  /**
   * 播种方法
   */
  method: string;

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

export interface SowingForm extends BaseEntity {
  /**
   * 播种记录ID
   */
  sowingId?: string | number;

  /**
   * 关联生产季节ID
   */
  prodSeasonId?: string | number;

  /**
   * 播种日期
   */
  sowingDate?: string;

  /**
   * 种子批次代码
   */
  seedLotCode?: string;

  /**
   * 种子类型 (如Obsa-23)
   */
  seedType?: string;

  /**
   * 播种材料
   */
  plantingMaterial?: string;

  /**
   * 播种量 (公斤)
   */
  seedRateKg?: number;

  /**
   * 行/株距 (厘米)
   */
  spacingCm?: string;

  /**
   * 株距 (厘米)
   */
  plantSpacingCm?: string | number;

  /**
   * 播种方法
   */
  method?: string;

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
  approvedComment?:string;
}

export interface SowingQuery extends PageQuery {

  /**
   * 关联生产季节ID
   */
  prodSeasonId?: string | number;

  /**
   * 播种日期
   */
  sowingDate?: string;

  /**
   * 种子批次代码
   */
  seedLotCode?: string;

  /**
   * 种子类型 (如Obsa-23)
   */
  seedType?: string;

  /**
   * 播种材料
   */
  plantingMaterial?: string;

  /**
   * 播种量 (公斤)
   */
  seedRateKg?: number;

  /**
   * 行/株距 (厘米)
   */
  spacingCm?: string;

  /**
   * 播种方法
   */
  method?: string;

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
