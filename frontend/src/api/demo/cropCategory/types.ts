export interface CropCategoryVO {
  /**
   * Unique auto-incremented identifier for the crop category
   */
  id: string | number;

  /**
   * Name of the crop category (e.g., Cereals, Vegetables, Fruits)
   */
  name: string;

}

export interface CropCategoryForm extends BaseEntity {
  /**
   * Unique auto-incremented identifier for the crop category
   */
  id?: string | number;

  /**
   * Name of the crop category (e.g., Cereals, Vegetables, Fruits)
   */
  name?: string;

}

export interface CropCategoryQuery extends PageQuery {

  /**
   * Name of the crop category (e.g., Cereals, Vegetables, Fruits)
   */
  name?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
