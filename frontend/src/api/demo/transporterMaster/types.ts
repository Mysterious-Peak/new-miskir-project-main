export interface TransporterMasterVO {
  /**
   * 主键ID（非自增）
   */
  id: string | number;

  /**
   * 承运商编码（如 TR-001）
   */
  transporterId: string | number;

  /**
   * 承运商/车主名称
   */
  name: string;

  /**
   * 车辆牌照号
   */
  vehiclePlate: string;

  /**
   * 车辆载重能力（公吨）
   */
  capacityMt: number;

  /**
   * 是否启用GPS追踪：0=否，1=是
   */
  gpsEnabled: number;

  /**
   * 联系电话
   */
  phone: string;

}

export interface TransporterMasterForm extends BaseEntity {
  /**
   * 主键ID（非自增）
   */
  id?: string | number;

  /**
   * 承运商编码（如 TR-001）
   */
  transporterId?: string | number;

  /**
   * 承运商/车主名称
   */
  name?: string;

  /**
   * 车辆牌照号
   */
  vehiclePlate?: string;

  /**
   * 车辆载重能力（公吨）
   */
  capacityMt?: number;

  /**
   * 是否启用GPS追踪：0=否，1=是
   */
  gpsEnabled?: number;

  /**
   * 联系电话
   */
  phone?: string;

}

export interface TransporterMasterQuery extends PageQuery {

  /**
   * 承运商编码（如 TR-001）
   */
  id?: string | number;
  transporterId?: string | number;

  /**
   * 承运商/车主名称
   */
  name?: string;

  /**
   * 车辆牌照号
   */
  vehiclePlate?: string;

  /**
   * 车辆载重能力（公吨）
   */
  capacityMt?: number;

  /**
   * 是否启用GPS追踪：0=否，1=是
   */
  gpsEnabled?: number;

  /**
   * 联系电话
   */
  phone?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
