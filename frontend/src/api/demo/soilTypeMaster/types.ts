export interface SoilTypeMasterVO {
  /**
   * 
   */
  id: string | number;

  /**
   * 土壤代码
   */
  soilCode: string;

  /**
   * 土壤名称
   */
  soilName: string;

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

export interface SoilTypeMasterForm extends BaseEntity {
  /**
   * 
   */
  id?: string | number;

  /**
   * 土壤代码
   */
  soilCode?: string;

  /**
   * 土壤名称
   */
  soilName?: string;

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

export interface SoilTypeMasterQuery extends PageQuery {

  /**
   * 土壤代码
   */
  soilCode?: string;

  /**
   * 土壤名称
   */
  soilName?: string;

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
