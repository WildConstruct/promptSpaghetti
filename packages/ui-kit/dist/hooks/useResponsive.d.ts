/**
 * Responsive design hook
 */
export interface ResponsiveState {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    breakpoint: 'mobile' | 'tablet' | 'desktop';
    width: number;
    height: number;
}
export declare function useResponsive(): ResponsiveState;
export declare function useBreakpoint(breakpoint: 'mobile' | 'tablet' | 'desktop'): boolean;
export declare function useMediaQuery(query: string): boolean;
//# sourceMappingURL=useResponsive.d.ts.map