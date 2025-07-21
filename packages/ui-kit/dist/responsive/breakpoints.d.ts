/**
 * Enhanced breakpoint management system
 */
export interface Breakpoints {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
}
export declare export interface BreakpointConfig {
    breakpoints: Breakpoints;
    defaultBreakpoint: BreakpointKey;
    mobileFirst: boolean;
}
export declare /**
 * Breakpoint helper utilities
 */
export declare const breakpoints: {
    up: (bp: BreakpointKey, bps?: Breakpoints) => string;
    down: (bp: BreakpointKey, bps?: Breakpoints) => string;
    only: (bp: BreakpointKey, bps?: Breakpoints) => string;
    between: (start: BreakpointKey, end: BreakpointKey, bps?: Breakpoints) => string;
};
//# sourceMappingURL=breakpoints.d.ts.map