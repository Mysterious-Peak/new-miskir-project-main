export interface IrrigationTypeMasterVO {
  /**
   * 
   */
  id: string | number;

  /**
   * 灌溉代码
   */
  irrigationCode: string;

  /**
   * 灌溉名称
   */
  irrigationName: string;

  /**
   * 描述
   */
  description: string;

  /**
   * 排序
   */
  sort: number;

  /**
   * 状态(0正常 1停用)
   */
  status: string;

  /**
   * 备注
   */
  remark: string;

}

export interface IrrigationTypeMasterForm extends BaseEntity {
  /**
   * 
   */
  id?: string | number;

  /**
   * 灌溉代码
   */
  irrigationCode?: string;

  /**
   * 灌溉名称
   */
  irrigationName?: string;

  /**
   * 描述
   */
  description?: string;

  /**
   * 排序
   */
  sort?: number;

  /**
   * 状态(0正常 1停用)
   */
  status?: string;

  /**
   * 备注
   */
  remark?: string;

}

export interface IrrigationTypeMasterQuery extends PageQuery {

  /**
   * 灌溉代码
   */
  irrigationCode?: string;

  /**
   * 灌溉名称
   */
  irrigationName?: string;

  /**
   * 描述
   */
  description?: string;

  /**
   * 排序
   */
  sort?: number;

  /**
   * 状态(0正常 1停用)
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
