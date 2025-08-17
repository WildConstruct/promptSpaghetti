import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewMode = 'tray' | 'modal';

interface PreviewTrayState {
  // Tray state
  isOpen: boolean;
  height: number;
  isPinned: boolean;
  minimized: boolean;
  
  // View preferences
  viewMode: ViewMode;
  defaultView: ViewMode;
  
  // Content state
  activeTab: number;
  scrollPosition: number;
  selectedResults: Set<string>;
  
  // Actions
  setOpen: (open: boolean) => void;
  toggleTray: () => void;
  setHeight: (height: number) => void;
  togglePin: () => void;
  setMinimized: (minimized: boolean) => void;
  toggleMinimized: () => void;
  switchView: (mode: ViewMode) => void;
  setDefaultView: (mode: ViewMode) => void;
  setActiveTab: (index: number) => void;
  setScrollPosition: (position: number) => void;
  toggleResultSelection: (resultId: string) => void;
  clearSelection: () => void;
}

export const usePreviewTrayStore = create<PreviewTrayState>()(
  persist(
    (set) => ({
      // Initial state
      isOpen: false,  // Start with tray closed
      height: 250,
      isPinned: false,
      minimized: false,
      viewMode: 'tray',
      defaultView: 'tray',
      activeTab: 0,
      scrollPosition: 0,
      selectedResults: new Set(),

      // Actions
      setOpen: (open) => set({ isOpen: open }),
      toggleTray: () => set((state) => ({ isOpen: !state.isOpen })),
      
      setHeight: (height) => set({ height: Math.min(Math.max(height, 100), window.innerHeight * 0.6) }),
      
      togglePin: () => set((state) => ({ isPinned: !state.isPinned })),
      
      setMinimized: (minimized) => set({ minimized }),
      toggleMinimized: () => set((state) => ({ minimized: !state.minimized })),
      
      switchView: (mode) => set({ viewMode: mode }),
      
      setDefaultView: (mode) => set({ defaultView: mode, viewMode: mode }),
      
      setActiveTab: (index) => set({ activeTab: index }),
      
      setScrollPosition: (position) => set({ scrollPosition: position }),
      
      toggleResultSelection: (resultId) => set((state) => {
        const newSelection = new Set(state.selectedResults);
        if (newSelection.has(resultId)) {
          newSelection.delete(resultId);
        } else {
          newSelection.add(resultId);
        }
        return { selectedResults: newSelection };
      }),
      
      clearSelection: () => set({ selectedResults: new Set() }),
    }),
    {
      name: 'preview-tray-preferences',
      partialize: (state) => ({
        height: state.height,
        isPinned: state.isPinned,
        defaultView: state.defaultView,
      }),
    }
  )
);