export interface CropVO {
  /**
   * ID
   */
  id: string | number;

  /**
   * Name
   */
  name: string;

  /**
   * Category
   */
  categoryId: string | number;

}

export interface CropForm extends BaseEntity {
  /**
   * ID
   */
  id?: string | number;

  /**
   * Name
   */
  name?: string;

  /**
   * Category
   */
  categoryId?: string | number;

}

export interface CropQuery extends PageQuery {

  /**
   * Name
   */
  name?: string;

  /**
   * Category
   */
  categoryId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
}
