/**
 * Platform detection and capabilities hook
 */
import { Platform, DeviceCapabilities } from '../types';
import { getPlatformOptimizations } from '../platform';
export interface PlatformState {
    platform: Platform;
    capabilities: DeviceCapabilities;
    optimizations: ReturnType<typeof getPlatformOptimizations>;
    isReducedMotion: boolean;
    isTouchDevice: boolean;
    isApplePlatform: boolean;
    isOnline: boolean;
}
export declare function usePlatform(): PlatformState;
export declare function useIsMobile(): boolean;
export declare function useIsDesktop(): boolean;
export declare function useIsWeb(): boolean;
export declare function useTouchSupport(): boolean;
export declare function useHoverSupport(): boolean;
export declare function useKeyboardSupport(): boolean;
//# sourceMappingURL=usePlatform.d.ts.map