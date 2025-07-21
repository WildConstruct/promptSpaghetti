/**
 * Global UI state management hook
 */
import { UIState, Theme } from '../types';
interface UIStore extends UIState {
    setTheme: (theme: Partial<Theme>) => void;
    setSelectedNodeId: (nodeId: string | undefined) => void;
    toggleInspector: () => void;
    togglePalette: () => void;
    setInspectorOpen: (open: boolean) => void;
    setPaletteOpen: (open: boolean) => void;
    updateBreakpoint: () => void;
}
export declare         <U>(selector: (state: UIStore) => U, listener: (selectedState: U, previousSelectedState: U) => void, options?: {
            equalityFn?: ((a: U, b: U) => boolean) | undefined;
            fireImmediately?: boolean;
        } | undefined): () => void;
    };
}>;
export declare function useUIState(): UIStore;
export declare function useSelectedNode(): {
    selectedNodeId: string | undefined;
    setSelectedNodeId: (nodeId: string | undefined) => void;
};
export declare function useInspectorState(): {
    inspectorOpen: boolean;
    toggleInspector: () => void;
    setInspectorOpen: (open: boolean) => void;
};
export declare function usePaletteState(): {
    paletteOpen: boolean;
    togglePalette: () => void;
    setPaletteOpen: (open: boolean) => void;
};
export declare function useThemeState(): {
    theme: Theme;
    setTheme: (theme: Partial<Theme>) => void;
};
export {};
//# sourceMappingURL=useUIState.d.ts.map