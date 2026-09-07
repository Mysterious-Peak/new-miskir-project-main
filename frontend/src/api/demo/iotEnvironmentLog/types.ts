export interface IotEnvironmentLogVO {
  /**
   * 主键ID（非自增）
   */
  id: string | number;

  /**
   * IoT环境日志编号（如 IOT-001）
   */
  logId: string | number;

  /**
   * 所属仓库ID（逻辑外键 -> t_warehouse_master.id）
   */
  warehouseId: string | number;

  /**
   * 所属仓库编码（对应 warehouse_code）
   */
  warehouseCode?: string;

  /**
   * 环境温度（摄氏度）
   */
  temp: number;

  /**
   * 环境湿度（%）
   */
  humidity: string | number;

  /**
   * 二氧化碳浓度（ppm）
   */
  co2Level: number;

  /**
   * 传感器数据记录时间
   */
  recordedAt: string;

}

export interface IotEnvironmentLogForm extends BaseEntity {
  /**
   * IoT环境日志编号（如 IOT-001）
   */
  logId?: string | number;

  /**
   * 所属仓库ID（逻辑外键 -> t_warehouse_master.id）
   */
  warehouseId?: string | number;

  /**
   * 所属仓库编码（对应 warehouse_code）
   */
  warehouseCode?: string;

  sensorId?: number;

  /**
   * 环境温度（摄氏度）
   */
  temp?: number;

  /**
   * 环境湿度（%）
   */
  humidity?: string | number;

  /**
   * 二氧化碳浓度（ppm）
   */
  co2Level?: number;

  /**
   * 传感器数据记录时间
   */
  recordedAt?: string;

}

export interface IotEnvironmentLogQuery extends PageQuery {

  /**
   * IoT环境日志编号（如 IOT-001）
   */
  logId?: string | number;

  /**
   * 所属仓库ID（逻辑外键 -> t_warehouse_master.id）
   */
  warehouseId?: string | number;

  /**
   * 所属仓库编码（对应 warehouse_code）
   */
  warehouseCode?: string;

  /**
   * 环境温度（摄氏度）
   */
  temp?: number;

  /**
   * 环境湿度（%）
   */
  humidity?: string | number;

  /**
   * 二氧化碳浓度（ppm）
   */
  co2Level?: number;

  /**
   * 传感器数据记录时间
   */
  recordedAt?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
