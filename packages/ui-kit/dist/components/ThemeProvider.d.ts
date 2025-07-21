/**
 * Theme Provider component for cross-platform theming
 */
import React from 'react';
import { Theme } from '../types';
interface ThemeProviderProps {
    children: React.ReactNode;
    theme?: Partial<Theme>;
    defaultColorMode?: 'light' | 'dark' | 'system';
}
export declare const ThemeProvider: React.FC<ThemeProviderProps>;
export {};
//# sourceMappingURL=ThemeProvider.d.ts.map