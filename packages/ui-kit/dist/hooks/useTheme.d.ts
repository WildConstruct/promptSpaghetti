/**
 * Theme management hook
 */
import { Theme } from '../types';
export declare     toggleColorMode: () => void;
    colorMode: "light" | "dark";
}>;
export declare function useTheme(): Theme;
export declare function useThemeControls(): {
    setTheme: (theme: Partial<Theme>) => void;
    toggleColorMode: () => void;
    colorMode: "light" | "dark";
};
//# sourceMappingURL=useTheme.d.ts.map