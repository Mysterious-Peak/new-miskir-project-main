export interface CropMasterVO {
  /**
   *
   */
  id: string | number;

  /**
   * 作物代码
   */
  cropCode: string;

  /**
   * 作物名称
   */
  cropName: string;

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

  /**
   * 实测水分默认值
   */
  measuredMoistureValue?: number;
}

export interface CropMasterForm extends BaseEntity {
  /**
   *
   */
  id?: string | number;

  /**
   * 作物代码
   */
  cropCode?: string;

  /**
   * 作物名称
   */
  cropName?: string;

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

  /**
   * 实测水分默认值
   */
  measuredMoistureValue?: number;
}

export interface CropMasterQuery extends PageQuery {
  /**
   * 作物代码
   */
  cropCode?: string;

  /**
   * 作物名称
   */
  cropName?: string;

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
