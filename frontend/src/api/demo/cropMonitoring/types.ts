export interface CropMonitoringVO {
  /**
   * 监测ID
   */
  monitorId: string | number;

  /**
   * 关联生产季节ID
   */
  prodSeasonId: string | number;

  /**
   * 监测日期
   */
  monitoringDate: string;

  /**
   * 作物阶段代码 (如TILL)
   */
  stageCode: string;

  /**
   * 植株高度 (厘米)
   */
  plantHeightCm: number;

  /**
   * 冠层覆盖率 (%)
   */
  canopyCoverPct: number;

  /**
   * 每平方米株数
   */
  standCountM2: number;

  /**
   * 叶面积指数
   */
  leafAreaIndex: number;

  /**
   * 叶绿素含量
   */
  chlorophyllContent: number;

  /**
   * 归一化植被指数
   */
  ndvi: number;

  /**
   * 健康评分(1-10)
   */
  healthScore: number;

  /**
   * 土壤湿度(%)
   */
  soilMoisturePct: number;

  /**
   * 温度(℃)
   */
  temperatureC: number;

  /**
   * 观察记录
   */
  observations: string;

  /**
   * 照片链接
   */
  photoUrl: string;

  photoUrlUrl: string;

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

export interface CropMonitoringForm extends BaseEntity {
  /**
   * 监测ID
   */
  monitorId?: string | number;

  /**
   * 关联生产季节ID
   */
  prodSeasonId?: string | number;

  /**
   * 监测日期
   */
  monitoringDate?: string;

  /**
   * 作物阶段代码 (如TILL)
   */
  stageCode?: string;

  /**
   * 植株高度 (厘米)
   */
  plantHeightCm?: number;

  /**
   * 冠层覆盖率 (%)
   */
  canopyCoverPct?: number;

  /**
   * 每平方米株数
   */
  standCountM2?: number;

  /**
   * 叶面积指数
   */
  leafAreaIndex?: number;

  /**
   * 叶绿素含量
   */
  chlorophyllContent?: number;

  /**
   * 归一化植被指数
   */
  ndvi?: number;

  /**
   * 健康评分(1-10)
   */
  healthScore?: number;

  /**
   * 土壤湿度(%)
   */
  soilMoisturePct?: number;

  /**
   * 温度(℃)
   */
  temperatureC?: number;

  /**
   * 观察记录
   */
  observations?: string;

  /**
   * 照片链接
   */
  photoUrl?: string;

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

export interface CropMonitoringQuery extends PageQuery {
  /**
   * 关联生产季节ID
   */
  prodSeasonId?: string | number;

  /**
   * 监测日期
   */
  monitoringDate?: string;

  /**
   * 作物阶段代码 (如TILL)
   */
  stageCode?: string;

  /**
   * 植株高度 (厘米)
   */
  plantHeightCm?: number;

  /**
   * 冠层覆盖率 (%)
   */
  canopyCoverPct?: number;

  /**
   * 每平方米株数
   */
  standCountM2?: number;

  /**
   * 叶面积指数
   */
  leafAreaIndex?: number;

  /**
   * 叶绿素含量
   */
  chlorophyllContent?: number;

  /**
   * 归一化植被指数
   */
  ndvi?: number;

  /**
   * 健康评分(1-10)
   */
  healthScore?: number;

  /**
   * 土壤湿度(%)
   */
  soilMoisturePct?: number;

  /**
   * 温度(℃)
   */
  temperatureC?: number;

  /**
   * 观察记录
   */
  observations?: string;

  /**
   * 照片链接
   */
  photoUrl?: string;

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
