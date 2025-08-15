import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TrayMode = 'minimized' | 'normal' | 'maximized';
export type ViewMode = 'tray' | 'modal';

interface PreviewTrayState {
  // Tray state
  isOpen: boolean;
  height: number;
  mode: TrayMode;
  isPinned: boolean;
  
  // View preferences
  viewMode: ViewMode;
  defaultView: ViewMode;
  
  // Content state
  activeTab: number;
  scrollPosition: number;
  selectedResults: Set<string>;
  
  // Actions
  toggleTray: () => void;
  setHeight: (height: number) => void;
  setMode: (mode: TrayMode) => void;
  togglePin: () => void;
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
      isOpen: true,  // Start with tray open by default
      height: 250,
      mode: 'normal',
      isPinned: false,
      viewMode: 'tray',
      defaultView: 'tray',
      activeTab: 0,
      scrollPosition: 0,
      selectedResults: new Set(),

      // Actions
      toggleTray: () => set((state) => ({ isOpen: !state.isOpen })),
      
      setHeight: (height) => set({ height }),
      
      setMode: (mode) => set({ mode, isOpen: true }),
      
      togglePin: () => set((state) => ({ isPinned: !state.isPinned })),
      
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
        mode: state.mode,
      }),
    }
  )
);