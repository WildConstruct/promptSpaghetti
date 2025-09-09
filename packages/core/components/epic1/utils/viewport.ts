import type { ReactFlowInstance } from 'reactflow';

export type Viewport = { x: number; y: number; zoom: number };

export function captureViewport(
  instance: ReactFlowInstance | null | undefined
): Viewport | null {
  try {
    if (!instance || typeof (instance as any).getViewport !== 'function')
      return null;
    // React Flow v11 exposes getViewport(); fallback: internal state
    const vp = (instance as any).getViewport?.();
    if (
      vp &&
      typeof vp.x === 'number' &&
      typeof vp.y === 'number' &&
      typeof vp.zoom === 'number'
    ) {
      return { x: vp.x, y: vp.y, zoom: vp.zoom };
    }
  } catch {}
  return null;
}

export function restoreViewport(
  instance: ReactFlowInstance | null | undefined,
  vp: Viewport | null
): void {
  try {
    if (!instance || !vp) return;
    if (typeof (instance as any).setViewport === 'function') {
      (instance as any).setViewport(vp);
    }
  } catch {}
}
