export interface VillageVO {
  /**
   * Unique identifier for the village (primary key, auto-increment)
   */
  id: string | number;

  /**
   * Village name
   */
  name: string;

  /**
   * Village longitude (GIS coordinate)
   */
  longitude: number;

  /**
   * Village latitude (GIS coordinate)
   */
  latitude: number;

  /**
   * Brief description/introduction of the village
   */
  introduction: string;

}

export interface VillageForm extends BaseEntity {
  /**
   * Unique identifier for the village (primary key, auto-increment)
   */
  id?: string | number;

  /**
   * Village name
   */
  name?: string;

  /**
   * Village longitude (GIS coordinate)
   */
  longitude?: number;

  /**
   * Village latitude (GIS coordinate)
   */
  latitude?: number;

  /**
   * Brief description/introduction of the village
   */
  introduction?: string;

}

export interface VillageQuery extends PageQuery {

  /**
   * Village name
   */
  name?: string;

  /**
   * Village longitude (GIS coordinate)
   */
  longitude?: number;

  /**
   * Village latitude (GIS coordinate)
   */
  latitude?: number;

  /**
   * Brief description/introduction of the village
   */
  introduction?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
