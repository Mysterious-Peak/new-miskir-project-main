export interface WarehouseMasterVO {
  /**
   * 主键ID（非自增）
   */
  id: string | number;

  /**
   * 仓库编码（业务主键，如 WH-REG-01）
   */
  warehouseId: string | number;

  /**
   * 仓库名称
   */
  warehouseName: string;

  /**
   * 仓库类型：Region=区域仓, Union=联合社仓, Coop=合作社仓, Processor=加工厂仓
   */
  warehouseType: string;

  /**
   * 仓库地理位置（地址或GPS坐标）
   */
  location: string;

  /**
   * 仓库总容量（公吨）
   */
  capacityMt: number;

  /**
   * 仓库占地面积（平方米）
   */
  areaSqM: number;
}

export interface WarehouseMasterForm extends BaseEntity {
  /**
   * 主键ID（非自增）
   */
  id?: string | number;

  /**
   * 仓库编码（业务主键，如 WH-REG-01）
   */
  warehouseId?: string | number;

  /**
   * 仓库名称
   */
  warehouseName?: string;

  /**
   * 仓库类型：Region=区域仓, Union=联合社仓, Coop=合作社仓, Processor=加工厂仓
   */
  warehouseType?: string;

  /**
   * 仓库地理位置（地址或GPS坐标）
   */
  location?: string;

  /**
   * 仓库总容量（公吨）
   */
  capacityMt?: number;

  /**
   * 仓库占地面积（平方米）
   */
  areaSqM?: number;
}

export interface WarehouseMasterQuery extends PageQuery {
  id?: string | number;
  /**
   * 仓库编码（业务主键，如 WH-REG-01）
   */
  warehouseId?: string | number;

  /**
   * 仓库名称
   */
  warehouseName?: string;

  /**
   * 仓库类型：Region=区域仓, Union=联合社仓, Coop=合作社仓, Processor=加工厂仓
   */
  warehouseType?: string;

  /**
   * 仓库地理位置（地址或GPS坐标）
   */
  location?: string;

  /**
   * 仓库总容量（公吨）
   */
  capacityMt?: number;

  /**
   * 仓库占地面积（平方米）
   */
  areaSqM?: number;

  /**
   * 日期范围参数
   */
  params?: any;

  orderByColumn?: string;
  isAsc?: string;
}
