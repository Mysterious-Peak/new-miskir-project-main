// ==================== 旧类型（保持 regions/index.vue 兼容） ====================

export interface RegionVO {
  /**
   *
   */
  id: string | number;

  /**
   *
   */
  parentCode: string;

  /**
   * 行政区划编码
   */
  code: string;

  /**
   * 层级: 1=Region, 2=Zone, 3=Woreda, 4=Kebele
   */
  level: number;

  /**
   * 区域名称
   */
  name: string;

  /**
   * 中心经度
   */
  centerLongitude: number;

  /**
   * 中心纬度
   */
  centerLatitude: number;

}

export interface RegionForm extends BaseEntity {
  /**
   *
   */
  id?: string | number;

  /**
   *
   */
  parentCode?: string;

  /**
   * 行政区划编码
   */
  code?: string;

  /**
   * 层级: 1=Region, 2=Zone, 3=Woreda, 4=Kebele
   */
  level?: number;

  /**
   * 区域名称
   */
  name?: string;

  /**
   * 中心经度
   */
  centerLongitude?: number;

  /**
   * 中心纬度
   */
  centerLatitude?: number;

}

export interface RegionQuery extends PageQuery {

  /**
   *
   */
  parentCode?: string;

  /**
   * 行政区划编码
   */
  code?: string;

  /**
   * 层级: 1=Region, 2=Zone, 3=Woreda, 4=Kebele
   */
  level?: number;

  /**
   * 区域名称
   */
  name?: string;

  /**
   * 中心经度
   */
  centerLongitude?: number;

  /**
   * 中心纬度
   */
  centerLatitude?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}

// ==================== 新类型（CascadingRegionSelect 使用） ====================

export interface SysPubRegionVO {
  /** 行政区划编码 (PK) */
  code: string;

  /** 行政区划名称 */
  name: string;

  /** 短编码 */
  shortCode?: string;

  /** 层级: 1=Region, 2=Zone, 3=Woreda, 4=Sub-Woreda, 5=Kebele */
  grade: string;

  /** 父级编码 */
  parentCode?: string;

  /** 排序 */
  sortOrder?: number;

  /** 状态: 1=正常, 0=停用 */
  status?: string;

  /** 备注 */
  remark?: string;
}

export interface SysPubRegionQuery extends PageQuery {
  code?: string;
  name?: string;
  grade?: string;
  parentCode?: string;
  status?: string;
  params?: any;
}
