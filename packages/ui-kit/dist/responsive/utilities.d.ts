/**
 * Responsive utility functions and hooks
 */
import { BreakpointKey } from './breakpoints';
import { DeviceInfo } from './device';
/**
 * Enhanced responsive hook with device info
 */
export declare function useEnhancedResponsive(): {
    width: number;
    height: number;
    breakpoint: BreakpointKey;
    device: DeviceInfo | null;
};
/**
 * Hook for conditional rendering based on breakpoints
 */
export declare function useBreakpointValue<T>(
  values: Partial<Record<BreakpointKey,
  T>>,
  defaultValue?: T
): T | undefined;
/**
 * Hook for matching specific breakpoints
 */
export declare function useBreakpointMatch(query: BreakpointKey | BreakpointKey[] | {
    min?: BreakpointKey;
    max?: BreakpointKey;
    only?: BreakpointKey;
}): boolean;
/**
 * Hook for device-specific rendering
 */
export declare function useDeviceDetection(): {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isTV: boolean;
    isTouch: boolean;
    isRetina: boolean;
    isPortrait: boolean;
    isLandscape: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    isWindows: boolean;
    isMacOS: boolean;
    isChrome: boolean;
    isSafari: boolean;
    isFirefox: boolean;
    device: DeviceInfo | null;
};
/**
 * Utility for creating responsive class names
 */
export declare function responsiveClasses(
  baseClass: string,
  modifiers: Partial<Record<BreakpointKey,
  string | string[]>>
): string;
/**
 * Utility for responsive spacing
 */
export declare function responsiveSpacing(values: Partial<Record<BreakpointKey, number | string>>): string;
/**
 * Create responsive style object
 */
export declare function responsiveStyle<T extends Record<string, any>>(styles: Partial<Record<BreakpointKey, T>>): T;
/**
 * Visibility utilities
 */
export declare function useVisibility(config: {
    showOn?: BreakpointKey | BreakpointKey[];
    hideOn?: BreakpointKey | BreakpointKey[];
}): boolean;
/**
 * Container query hook (polyfill)
 */
export declare function useContainerQuery(
  ref: React.RefObject<HTMLElement>,
  queries: Record<string,
  number>
): Record<string, boolean>;
/**
 * Performance-optimized resize observer
 */
export declare function useResizeObserver<T extends HTMLElement>(callback: (entry: ResizeObserverEntry) => void, options?: {
    debounce?: number;
    throttle?: number;
}): React.RefObject<T>;
//# sourceMappingURL=utilities.d.ts.map