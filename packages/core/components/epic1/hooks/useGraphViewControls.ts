import { useCallback, useState } from 'react';
import { ReactFlowInstance, Viewport } from 'reactflow';

interface UseGraphViewControlsOptions {
  showToast?: (type: 'success' | 'error' | 'info', message: string) => void;
  defaultZoom?: number;
  minZoom?: number;
  maxZoom?: number;
}

/**
 * Custom hook for managing graph view controls (zoom, pan, fit)
 */
export function useGraphViewControls(
  reactFlowInstance: ReactFlowInstance | null,
  options: UseGraphViewControlsOptions = {}
) {
  const { showToast, defaultZoom = 1, minZoom = 0.1, maxZoom = 4 } = options;

  const [viewport, setViewport] = useState<Viewport>({
    x: 0,
    y: 0,
    zoom: defaultZoom
  });

  // Zoom controls
  const zoomIn = useCallback(() => {
    if (!reactFlowInstance) return;
    const currentZoom = reactFlowInstance.getZoom();
    const newZoom = Math.min(currentZoom * 1.2, maxZoom);
    reactFlowInstance.zoomTo(newZoom);
    showToast?.('info', `Zoom: ${Math.round(newZoom * 100)}%`);
  }, [reactFlowInstance, maxZoom, showToast]);

  const zoomOut = useCallback(() => {
    if (!reactFlowInstance) return;
    const currentZoom = reactFlowInstance.getZoom();
    const newZoom = Math.max(currentZoom / 1.2, minZoom);
    reactFlowInstance.zoomTo(newZoom);
    showToast?.('info', `Zoom: ${Math.round(newZoom * 100)}%`);
  }, [reactFlowInstance, minZoom, showToast]);

  const resetZoom = useCallback(() => {
    if (!reactFlowInstance) return;
    reactFlowInstance.zoomTo(defaultZoom);
    showToast?.('info', 'Zoom reset to 100%');
  }, [reactFlowInstance, defaultZoom, showToast]);

  const fitView = useCallback(
    (options?: { padding?: number; duration?: number }) => {
      if (!reactFlowInstance) return;
      reactFlowInstance.fitView({
        padding: options?.padding || 0.1,
        duration: options?.duration || 200
      });
      showToast?.('info', 'View fitted to content');
    },
    [reactFlowInstance, showToast]
  );

  // Pan controls
  const panToCenter = useCallback(() => {
    if (!reactFlowInstance) return;
    reactFlowInstance.setCenter(0, 0, { zoom: defaultZoom, duration: 200 });
    showToast?.('info', 'View centered');
  }, [reactFlowInstance, defaultZoom, showToast]);

  const panToNode = useCallback(
    (nodeId: string) => {
      if (!reactFlowInstance) return;
      const node = reactFlowInstance.getNode(nodeId);
      if (!node) {
        showToast?.('error', 'Node not found');
        return;
      }
      reactFlowInstance.setCenter(
        node.position.x + (node.width || 100) / 2,
        node.position.y + (node.height || 50) / 2,
        { zoom: reactFlowInstance.getZoom(), duration: 200 }
      );
      showToast?.('info', `Focused on node: ${nodeId}`);
    },
    [reactFlowInstance, showToast]
  );

  // Viewport capture and restore
  const captureViewport = useCallback((): Viewport | null => {
    if (!reactFlowInstance) return null;
    const currentViewport = reactFlowInstance.getViewport();
    setViewport(currentViewport);
    return currentViewport;
  }, [reactFlowInstance]);

  const restoreViewport = useCallback(
    (savedViewport?: Viewport) => {
      if (!reactFlowInstance) return;
      const targetViewport = savedViewport || viewport;
      reactFlowInstance.setViewport(targetViewport, { duration: 200 });
      showToast?.('info', 'Viewport restored');
    },
    [reactFlowInstance, viewport, showToast]
  );

  // Get current viewport info
  const getViewportInfo = useCallback(() => {
    if (!reactFlowInstance) return null;
    const vp = reactFlowInstance.getViewport();
    return {
      zoom: Math.round(vp.zoom * 100),
      x: Math.round(vp.x),
      y: Math.round(vp.y)
    };
  }, [reactFlowInstance]);

  // Handle viewport change
  const onViewportChange = useCallback((newViewport: Viewport) => {
    setViewport(newViewport);
  }, []);

  return {
    // State
    viewport,

    // Zoom controls
    zoomIn,
    zoomOut,
    resetZoom,
    fitView,

    // Pan controls
    panToCenter,
    panToNode,

    // Viewport management
    captureViewport,
    restoreViewport,
    getViewportInfo,
    onViewportChange
  };
}
