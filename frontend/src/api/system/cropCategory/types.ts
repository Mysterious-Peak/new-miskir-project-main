export interface CropCategoryVO {
  /**
   * ID
   */
  id: string | number;

  /**
   * Category Name
   */
  name: string;

}

export interface CropCategoryForm extends BaseEntity {
  /**
   * ID
   */
  id?: string | number;

  /**
   * Category Name
   */
  name?: string;

}

export interface CropCategoryQuery extends PageQuery {

  /**
   * Category Name
   */
  name?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
