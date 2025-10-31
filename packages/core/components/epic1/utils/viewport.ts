import type { ReactFlowInstance } from 'reactflow';

export type Viewport = { x: number; y: number; zoom: number };

type ViewportApi = {
  getViewport?: () => Viewport | null | undefined;
  setViewport?: (viewport: Viewport) => void;
};

const hasViewportReader = (
  instance: ReactFlowInstance | ViewportApi | null | undefined
): instance is ReactFlowInstance & Required<Pick<ViewportApi, 'getViewport'>> =>
  Boolean(instance && typeof (instance as ViewportApi).getViewport === 'function');

const hasViewportWriter = (
  instance: ReactFlowInstance | ViewportApi | null | undefined
): instance is ReactFlowInstance & Required<Pick<ViewportApi, 'setViewport'>> =>
  Boolean(instance && typeof (instance as ViewportApi).setViewport === 'function');

export function captureViewport(
  instance: ReactFlowInstance | null | undefined
): Viewport | null {
  if (!hasViewportReader(instance)) {
    return null;
  }

  const viewport = instance.getViewport();
  if (
    viewport &&
    typeof viewport.x === 'number' &&
    typeof viewport.y === 'number' &&
    typeof viewport.zoom === 'number'
  ) {
    return { x: viewport.x, y: viewport.y, zoom: viewport.zoom };
  }

  return null;
}

export function restoreViewport(
  instance: ReactFlowInstance | null | undefined,
  vp: Viewport | null
): void {
  if (!vp || !hasViewportWriter(instance)) {
    return;
  }

  instance.setViewport(vp);
}
