export interface SeasonMasterVO {
  /**
   *
   */
  id: string | number;

  /**
   * Season Code
   */
  seasonCode: string;

  /**
   * 季节名称
   */
  seasonName: string;

  /**
   * Description
   */
  description: string;
}

export interface SeasonMasterForm extends BaseEntity {
  /**
   *
   */
  id?: string | number;

  /**
   * Season Code
   */
  seasonCode?: string;

  /**
   * 季节名称
   */
  seasonName?: string;

  /**
   * Description
   */
  description?: string;
}

export interface SeasonMasterQuery extends PageQuery {
  /**
   * 季节名称
   */
  seasonName?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
