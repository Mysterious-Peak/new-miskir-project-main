/** Same allowed strings as TerraDraw `setCursor` */
export type MapCanvasCursorIdle = 'pointer' | 'grabbing' | 'grab' | 'unset' | 'crosshair' | 'move' | 'wait';

export type MapCanvasCursorOptions = {
  /**
   * Cursor when the left button is not held. Default `pointer` (edit map).
   * Use `grabbing` for read-only / approval view so the hand never shows as pointer.
   */
  idle?: MapCanvasCursorIdle;
};

/**
 * Map canvas cursor: by default `idle` when not dragging, `grabbing` while the left
 * button is held. Uses rAF so it runs after MapLibre / TerraDraw setCursor.
 */
export function attachUniformMapCanvasCursor(canvas: HTMLCanvasElement, options?: MapCanvasCursorOptions): () => void {
  const idle: MapCanvasCursorIdle = options?.idle ?? 'pointer';
  let rafId = 0;

  const onPointerMove = (e: PointerEvent) => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      const dragging = (e.buttons & 1) === 1;
      canvas.style.cursor = dragging ? 'grabbing' : idle;
    });
  };

  const resetToIdle = () => {
    canvas.style.cursor = idle;
  };

  const onWindowPointerUp = () => {
    resetToIdle();
  };

  canvas.style.cursor = idle;
  canvas.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onWindowPointerUp, true);

  return () => {
    cancelAnimationFrame(rafId);
    canvas.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onWindowPointerUp, true);
    canvas.style.cursor = '';
  };
}
