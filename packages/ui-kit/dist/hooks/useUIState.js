/**
 * Global UI state management hook
 */
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { createTheme, detectPlatform, getPlatformCapabilities, getBreakpoint, getViewportSize } from '../platform';
export const useUIStore = create()(subscribeWithSelector((set, get) => {
    const initialTheme = createTheme();
    const initialPlatform = detectPlatform();
    const initialCapabilities = getPlatformCapabilities();
    const { width } = getViewportSize();
    const initialBreakpoint = getBreakpoint(width);
    return {
        // Initial state
        theme: initialTheme,
        platform: initialPlatform,
        capabilities: initialCapabilities,
        breakpoint: initialBreakpoint,
        isReducedMotion: typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        selectedNodeId: undefined,
        inspectorOpen: false,
        paletteOpen: true,
        // Actions
        setTheme: (themeOverrides) => {
            const currentTheme = get().theme;
            const newTheme = { ...currentTheme, ...themeOverrides };
            set({ theme: newTheme });
        },
        setSelectedNodeId: (nodeId) => {
            set({ selectedNodeId: nodeId });
        },
        toggleInspector: () => {
            set((state) => ({ inspectorOpen: !state.inspectorOpen }));
        },
        togglePalette: () => {
            set((state) => ({ paletteOpen: !state.paletteOpen }));
        },
        setInspectorOpen: (open) => {
            set({ inspectorOpen: open });
        },
        setPaletteOpen: (open) => {
            set({ paletteOpen: open });
        },
        updateBreakpoint: () => {
            const { width } = getViewportSize();
            const breakpoint = getBreakpoint(width);
            set({ breakpoint });
        }
    };
}));
// Hook to use UI state
export function useUIState() {
    const state = useUIStore();
    return state;
}
// Specific UI state hooks
export function useSelectedNode() {
    const selectedNodeId = useUIStore((state) => state.selectedNodeId);
    const setSelectedNodeId = useUIStore((state) => state.setSelectedNodeId);
    return { selectedNodeId, setSelectedNodeId };
}
export function useInspectorState() {
    const inspectorOpen = useUIStore((state) => state.inspectorOpen);
    const toggleInspector = useUIStore((state) => state.toggleInspector);
    const setInspectorOpen = useUIStore((state) => state.setInspectorOpen);
    return { inspectorOpen, toggleInspector, setInspectorOpen };
}
export function usePaletteState() {
    const paletteOpen = useUIStore((state) => state.paletteOpen);
    const togglePalette = useUIStore((state) => state.togglePalette);
    const setPaletteOpen = useUIStore((state) => state.setPaletteOpen);
    return { paletteOpen, togglePalette, setPaletteOpen };
}
// Theme-specific hooks
export function useThemeState() {
    const theme = useUIStore((state) => state.theme);
    const setTheme = useUIStore((state) => state.setTheme);
    return { theme, setTheme };
}
// Initialize responsive updates
if (typeof window !== 'undefined') {
    const updateBreakpoint = () => {
        useUIStore.getState().updateBreakpoint();
    };
    window.addEventListener('resize', updateBreakpoint);
    window.addEventListener('orientationchange', () => {
        setTimeout(updateBreakpoint, 100);
    });
}
//# sourceMappingURL=useUIState.js.map