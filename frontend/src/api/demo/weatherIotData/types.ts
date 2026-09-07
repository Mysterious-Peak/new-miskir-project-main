export interface WeatherIotDataVO {
  /**
   * 数据ID
   */
  weatherId: string | number;

  /**
   * 关联生产季节ID
   */
  prodSeasonId: string | number;

  /**
   * 农田ID(可选)
   */
  farmlandId: string | number;

  /**
   * 数据记录时间戳
   */
  timestamp: string;

  /**
   * 降雨量 (毫米)
   */
  rainfallMm: number;

  /**
   * 温度 (摄氏度)
   */
  temperatureC: number;

  /**
   * 最低温度(℃)
   */
  temperatureMinC: number;

  /**
   * 最高温度(℃)
   */
  temperatureMaxC: number;

  /**
   * 湿度百分比
   */
  humidityPct: string | number;

  /**
   * 风速(m/s)
   */
  windSpeedMs: number;

  /**
   * 太阳辐射
   */
  solarRadiation: number;

  /**
   * 土壤湿度百分比
   */
  soilMoisturePct: number;

  /**
   * 土壤温度(℃)
   */
  soilTemperatureC: number;

  /**
   * 土壤电导率
   */
  soilEc: number;

  /**
   * 数据来源(IoT/AWS/Satellite/Manual)
   */
  dataSource: string;

  /**
   * 部门ID
   */
  deptId: string | number;

  /**
   * 备注
   */
  remark: string;
}

export interface WeatherIotDataForm extends BaseEntity {
  /**
   * 数据ID
   */
  weatherId?: string | number;

  /**
   * 关联生产季节ID
   */
  prodSeasonId?: string | number;

  /**
   * 农田ID(可选)
   */
  farmlandId?: string | number;

  /**
   * 数据记录时间戳
   */
  timestamp?: string;

  /**
   * 降雨量 (毫米)
   */
  rainfallMm?: number;

  /**
   * 温度 (摄氏度)
   */
  temperatureC?: number;

  /**
   * 最低温度(℃)
   */
  temperatureMinC?: number;

  /**
   * 最高温度(℃)
   */
  temperatureMaxC?: number;

  /**
   * 湿度百分比
   */
  humidityPct?: string | number;

  /**
   * 风速(m/s)
   */
  windSpeedMs?: number;

  /**
   * 太阳辐射
   */
  solarRadiation?: number;

  /**
   * 土壤湿度百分比
   */
  soilMoisturePct?: number;

  /**
   * 土壤温度(℃)
   */
  soilTemperatureC?: number;

  /**
   * 土壤电导率
   */
  soilEc?: number;

  /**
   * 数据来源(IoT/AWS/Satellite/Manual)
   */
  dataSource?: string;

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

export interface WeatherIotDataQuery extends PageQuery {
  /**
   * 关联生产季节ID
   */
  prodSeasonId?: string | number;

  /**
   * 农田ID(可选)
   */
  farmlandId?: string | number;

  /**
   * 数据记录时间戳
   */
  timestamp?: string;

  /**
   * 降雨量 (毫米)
   */
  rainfallMm?: number;

  /**
   * 温度 (摄氏度)
   */
  temperatureC?: number;

  /**
   * 最低温度(℃)
   */
  temperatureMinC?: number;

  /**
   * 最高温度(℃)
   */
  temperatureMaxC?: number;

  /**
   * 湿度百分比
   */
  humidityPct?: string | number;

  /**
   * 风速(m/s)
   */
  windSpeedMs?: number;

  /**
   * 太阳辐射
   */
  solarRadiation?: number;

  /**
   * 土壤湿度百分比
   */
  soilMoisturePct?: number;

  /**
   * 土壤温度(℃)
   */
  soilTemperatureC?: number;

  /**
   * 土壤电导率
   */
  soilEc?: number;

  /**
   * 数据来源(IoT/AWS/Satellite/Manual)
   */
  dataSource?: string;

  /**
   * 部门ID
   */
  deptId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
  orderByColumn: string;
  isAsc: string;
}
