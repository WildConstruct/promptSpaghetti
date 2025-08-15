import { useEffect } from 'react';
import { usePreviewTrayStore } from '../../stores/previewTrayStore';

export function usePreviewTrayKeyboardShortcuts() {
  const { toggleTray, switchView, viewMode } = usePreviewTrayStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + P: Toggle tray
      if (modKey && e.key === 'p' && !e.shiftKey) {
        e.preventDefault();
        toggleTray();
      }

      // Cmd/Ctrl + Shift + P: Switch between tray/modal
      if (modKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        switchView(viewMode === 'tray' ? 'modal' : 'tray');
      }

      // Escape: Close tray when focused
      if (e.key === 'Escape') {
        const trayElement = document.querySelector('.preview-tray');
        if (trayElement && document.activeElement && trayElement.contains(document.activeElement)) {
          e.preventDefault();
          toggleTray();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTray, switchView, viewMode]);
}