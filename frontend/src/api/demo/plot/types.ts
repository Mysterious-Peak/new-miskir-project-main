export interface PlotVO {
  /**
   * Unique identifier for the plot
   */
  id: string | number;

  /**
   * Name of the plot
   */
  name: string;

  /**
   * Unique code identifying the plot
   */
  plotCode: string;

  /**
   * ID of the village where the plot is located
   */
  villageId: string | number;

  /**
   * ID of the farmer who owns or manages the plot
   */
  farmerId: string | number;

  /**
   * Area of the plot in square meters (or other defined unit)
   */
  area: number;

  /**
   * Sorting order for display purposes
   */
  orderSort: number;

  /**
   * Longitude coordinate of the plot location
   */
  longitude: number;

  /**
   * Latitude coordinate of the plot location
   */
  latitude: number;

  /**
   * Brief description or introduction of the plot
   */
  introduction: string;

  /**
   * Type of soil on the plot (coded value, e.g., 1=sandy, 2=clay, etc.)
   */
  soilType: number;
}

export interface PlotForm extends BaseEntity {
  /**
   * Unique identifier for the plot
   */
  id?: string | number;

  /**
   * Name of the plot
   */
  name?: string;

  /**
   * Unique code identifying the plot
   */
  plotCode?: string;

  /**
   * ID of the village where the plot is located
   */
  villageId?: string | number;

  /**
   * ID of the farmer who owns or manages the plot
   */
  farmerId?: string | number;

  /**
   * Area of the plot in square meters (or other defined unit)
   */
  area?: number;

  /**
   * Sorting order for display purposes
   */
  orderSort?: number;

  /**
   * Longitude coordinate of the plot location
   */
  longitude?: number;

  /**
   * Latitude coordinate of the plot location
   */
  latitude?: number;

  /**
   * Brief description or introduction of the plot
   */
  introduction?: string;

  /**
   * Type of soil on the plot (coded value, e.g., 1=sandy, 2=clay, etc.)
   */
  soilType?: number;
}

export interface PlotQuery extends PageQuery {
  /**
   * Name of the plot
   */
  name?: string;

  /**
   * Unique code identifying the plot
   */
  plotCode?: string;

  /**
   * ID of the village where the plot is located
   */
  villageId?: string | number;

  /**
   * ID of the farmer who owns or manages the plot
   */
  farmerId?: string | number;

  /**
   * Area of the plot in square meters (or other defined unit)
   */
  area?: number;

  /**
   * Sorting order for display purposes
   */
  orderSort?: number;

  /**
   * Longitude coordinate of the plot location
   */
  longitude?: number;

  /**
   * Latitude coordinate of the plot location
   */
  latitude?: number;

  /**
   * Brief description or introduction of the plot
   */
  introduction?: string;

  /**
   * Type of soil on the plot (coded value, e.g., 1=sandy, 2=clay, etc.)
   */
  soilType?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
