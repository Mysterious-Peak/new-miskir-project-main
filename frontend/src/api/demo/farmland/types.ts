export interface FarmlandVO {
  /**
   * 农田ID
   */
  id: string | number;

  /**
   * 农户ID
   */
  farmerId: string | number;

  /**
   * 所属村ID
   */
  kebeleId: string | number;

  /**
   * 纬度
   */
  gpsLat: number;

  /**
   * 经度
   */
  gpsLong: number;

  /**
   * 海拔(米) — 需求2.1：GPS数据增强
   */
  elevationM: number;

  /**
   * GPS多边形坐标(JSON格式)
   */
  gpsPolygon: string;

  /**
   * 面积(公顷)
   */
  areaTa: number;

  /**
   * 土壤类型代码
   */
  soilCode: string;

  /**
   * 灌溉类型代码(多选，逗号分隔) — 需求2.3
   */
  irrigationCode: string;

  /**
   * 坡度等级(Flat/Gentle/Steep)
   */
  slopeClass: string;

  /**
   * 土地用途(Arable/Pasture/Mixed)
   */
  landUseType: string;

  /**
   * 土地所有权类型 — 需求2.3
   */
  landOwnershipType: string;

  /**
   * 坡向/朝向 — 需求2.3
   */
  slopeAspect: string;

  /**
   * 采样深度 — 需求2.3
   */
  samplingDepth: string;

  /**
   * 土地利用记录 — 需求2.3
   */
  landUseRecord: string;

  /**
   * 土地基础设施可达性 — 需求2.3
   */
  infrastructureAccessibility: string;

  /**
   * 状态(0草稿 1已批准 2已拒绝)
   */
  status: string;

  /**
   * 批准人
   */
  approvedBy: number;

  /**
   * 批准时间
   */
  approvedTime: string;

  /**
   * 拒绝原因
   */
  rejectionReason: string;

  /**
   * 创建者
   */
  createdUserName: string;

  /**
   * 创建时间
   */
  createTime: string;

  /**
   * 备注
   */
  remark: string;
}

export interface FarmlandForm extends BaseEntity {
  /**
   * 农田ID
   */
  id?: string | number;

  /**
   * 农户ID
   */
  farmerId?: string | number;

  /**
   * 所属村ID
   */
  kebeleId?: string | number;

  /**
   * 纬度
   */
  gpsLat?: number;

  /**
   * 经度
   */
  gpsLong?: number;

  /**
   * 海拔(米) — 需求2.1：GPS数据增强
   */
  elevationM?: number;

  /**
   * GPS多边形坐标(JSON格式)
   */
  gpsPolygon?: string;

  /**
   * 面积(公顷)
   */
  areaTa?: number;

  /**
   * 土壤类型代码
   */
  soilCode?: string;

  /**
   * 灌溉类型代码(多选) — 需求2.3
   */
  irrigationCode?: string | string[];

  /**
   * 坡度等级(Flat/Gentle/Steep)
   */
  slopeClass?: string;

  /**
   * 土地用途(Arable/Pasture/Mixed)
   */
  landUseType?: string;

  /**
   * 土地所有权类型 — 需求2.3
   */
  landOwnershipType?: string;

  /**
   * 坡向/朝向 — 需求2.3
   */
  slopeAspect?: string;

  /**
   * 采样深度 — 需求2.3
   */
  samplingDepth?: string;

  /**
   * 土地利用记录 — 需求2.3
   */
  landUseRecord?: string;

  /**
   * 土地基础设施可达性 — 需求2.3
   */
  infrastructureAccessibility?: string;

  /**
   * 状态(0草稿 1已批准 2已拒绝)
   */
  status?: string;

  /**
   * 批准人
   */
  approvedBy?: number;
  approvedUserName?: string;
  approvedComment?: string;

  /**
   * 批准时间
   */
  approvedTime?: string;

  /**
   * 拒绝原因
   */
  rejectionReason?: string;

  /**
   * 创建者
   */
  createdUserName?: string;

  createTime?: string;

  /**
   * 备注
   */
  remark?: string;
}

export interface FarmlandQuery extends PageQuery {
  id?: string | number;

  /**
   * 农户ID
   */
  farmerId?: string | number;

  /**
   * 所属村ID
   */
  kebeleId?: string | number;

  /**
   * 纬度
   */
  gpsLat?: number;

  /**
   * 经度
   */
  gpsLong?: number;

  /**
   * 海拔(米) — 需求2.1：GPS数据增强
   */
  elevationM?: number;

  /**
   * GPS多边形坐标(JSON格式)
   */
  gpsPolygon?: string;

  /**
   * 面积(公顷)
   */
  areaTa?: number;

  /**
   * 土壤类型代码
   */
  soilCode?: string;

  /**
   * 灌溉类型代码
   */
  irrigationCode?: string;

  /**
   * 坡度等级(Flat/Gentle/Steep)
   */
  slopeClass?: string;

  /**
   * 土地用途(Arable/Pasture/Mixed)
   */
  landUseType?: string;

  /**
   * 土地所有权类型 — 需求2.3
   */
  landOwnershipType?: string;

  /**
   * 坡向/朝向 — 需求2.3
   */
  slopeAspect?: string;

  /**
   * 采样深度 — 需求2.3
   */
  samplingDepth?: string;

  /**
   * 土地利用记录 — 需求2.3
   */
  landUseRecord?: string;

  /**
   * 土地基础设施可达性 — 需求2.3
   */
  infrastructureAccessibility?: string;

  /**
   * 状态(0草稿 1已批准 2已拒绝)
   */
  status?: string;

  /**
   * 批准人
   */
  approvedBy?: number;

  /**
   * 批准时间
   */
  approvedTime?: string;

  /**
   * 拒绝原因
   */
  rejectionReason?: string;

  /**
   * 创建者(DA)
   */
  createdUserName?: string;

  /**
   * 创建时间
   */
  createTime?: string;

  /**
   * 日期范围参数
   */
  params?: any;

  orderByColumn?: string;
  isAsc?: string;
}
