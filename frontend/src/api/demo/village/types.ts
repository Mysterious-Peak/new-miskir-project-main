export interface VillageVO {
  /**
   * 
   */
  id: string | number;

  /**
   * Unique code of the village
   */
  code: string;

  /**
   * Name of the village
   */
  name: string;

  /**
   * Longitude coordinate of the village center
   */
  longitude: number;

  /**
   * Latitude coordinate of the village center
   */
  latitude: number;

  /**
   * Brief description or introduction of the village
   */
  introduction: string;

  /**
   * 
   */
  regionCode: string;

}

export interface VillageForm extends BaseEntity {
  /**
   * 
   */
  id?: string | number;

  /**
   * Unique code of the village
   */
  code?: string;

  /**
   * Name of the village
   */
  name?: string;

  /**
   * Longitude coordinate of the village center
   */
  longitude?: number;

  /**
   * Latitude coordinate of the village center
   */
  latitude?: number;

  /**
   * Brief description or introduction of the village
   */
  introduction?: string;

  /**
   * 
   */
  regionCode?: string;

}

export interface VillageQuery extends PageQuery {

  /**
   * Unique code of the village
   */
  code?: string;

  /**
   * Name of the village
   */
  name?: string;

  /**
   * Longitude coordinate of the village center
   */
  longitude?: number;

  /**
   * Latitude coordinate of the village center
   */
  latitude?: number;

  /**
   * Brief description or introduction of the village
   */
  introduction?: string;

  /**
   * 
   */
  regionCode?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
