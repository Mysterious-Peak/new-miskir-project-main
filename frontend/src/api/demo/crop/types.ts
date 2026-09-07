export interface CropVO {
  /**
   * Unique auto-incremented identifier for the crop
   */
  id: string | number;

  /**
   * Name of the crop (e.g., Rice, Wheat, Tomato)
   */
  name: string;

  /**
   * Foreign key referencing the crop category (ori_crop_category.id)
   */
  categoryId: string | number;

}

export interface CropForm extends BaseEntity {
  /**
   * Unique auto-incremented identifier for the crop
   */
  id?: string | number;

  /**
   * Name of the crop (e.g., Rice, Wheat, Tomato)
   */
  name?: string;

  /**
   * Foreign key referencing the crop category (ori_crop_category.id)
   */
  categoryId?: string | number;

}

export interface CropQuery extends PageQuery {

  /**
   * Name of the crop (e.g., Rice, Wheat, Tomato)
   */
  name?: string;

  /**
   * Foreign key referencing the crop category (ori_crop_category.id)
   */
  categoryId?: string | number;

  /**
   * 日期范围参数
   */
  params?: any;
}
