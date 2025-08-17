import { useEffect } from 'react';
import { usePreviewTrayStore } from '../../../stores/previewTrayStore';

/**
 * Hook to manage layout adjustments when PreviewTray is open
 * Pushes the main content up to make room for the tray
 */
export function usePreviewTrayLayout(showPreview: boolean = true) {
  // Read relevant state to keep subscription but avoid imperative DOM changes.
  const { isOpen, height } = usePreviewTrayStore();
  // Preserve API shape: some callers may destructure `mode`.
  type PreviewTrayLayoutState = { isOpen: boolean; mode?: 'minimized' | 'open'; height: number };
  const mode = undefined as undefined | 'minimized' | 'open';

  useEffect(() => {
    // No-op: layout is handled purely by CSS flex.
    // Keeping an effect ensures consistent hook order when feature-flagged.
    void showPreview;
    void isOpen;
    void height;
  }, [showPreview, isOpen, height]);

  const state: PreviewTrayLayoutState = { isOpen, mode, height };
  return state;
}