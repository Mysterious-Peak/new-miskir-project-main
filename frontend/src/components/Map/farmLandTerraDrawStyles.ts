/**
 * Farmland parcel styling: Polygon and Select "selected" use the same blues so
 * the colour does not flash when the selection or pointer state changes.
 */
const BLUE_MAIN = '#3F97E0';
const BLUE_DARK = '#1D4ED8';

export const FARM_LAND_TERRA_POLYGON_STYLES = {
  fillColor: BLUE_MAIN,
  fillOpacity: 0.35,
  outlineColor: BLUE_MAIN,
  outlineWidth: 2,
  closingPointColor: '#FAFAFA',
  closingPointWidth: 3,
  closingPointOutlineColor: BLUE_DARK,
  closingPointOutlineWidth: 1
} as const;

export const FARM_LAND_TERRA_SELECT_POLYGON_STYLES = {
  selectedPolygonColor: FARM_LAND_TERRA_POLYGON_STYLES.fillColor,
  selectedPolygonFillOpacity: FARM_LAND_TERRA_POLYGON_STYLES.fillOpacity,
  selectedPolygonOutlineColor: FARM_LAND_TERRA_POLYGON_STYLES.outlineColor,
  selectedPolygonOutlineWidth: FARM_LAND_TERRA_POLYGON_STYLES.outlineWidth
} as const;
