/**
 * TerraDraw `setCursor` only allows: unset | grab | grabbing | crosshair | pointer | wait | move
 * All set to `pointer` so the canvas + `mapCanvasCursor` can own pointer vs grabbing.
 */
export const TERRA_SELECT_MODE_CURSORS = {
  pointerOver: 'pointer',
  dragStart: 'pointer',
  dragEnd: 'pointer',
  insertMidpoint: 'pointer'
} as const;

export const TERRA_POLYGON_MODE_CURSORS = {
  start: 'pointer',
  close: 'pointer',
  dragStart: 'pointer',
  dragEnd: 'pointer'
} as const;

/** Farmland approval (read-only map): no pointer hand, always grabbing */
export const TERRA_SELECT_MODE_CURSORS_GRABBING = {
  pointerOver: 'grabbing',
  dragStart: 'grabbing',
  dragEnd: 'grabbing',
  insertMidpoint: 'grabbing'
} as const;

export const TERRA_POLYGON_MODE_CURSORS_GRABBING = {
  start: 'grabbing',
  close: 'grabbing',
  dragStart: 'grabbing',
  dragEnd: 'grabbing'
} as const;
