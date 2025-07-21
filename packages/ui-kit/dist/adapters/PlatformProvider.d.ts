/**
 * Platform Provider for managing platform-specific adaptations
 */
import React from 'react';
import { Platform, DeviceCapabilities } from '../types';
interface PlatformContextValue {
    platform: Platform;
    capabilities: DeviceCapabilities;
    isWeb: boolean;
    isMobile: boolean;
    isDesktop: boolean;
    isReactNative: boolean;
}
interface PlatformProviderProps {
    children: React.ReactNode;
    platform?: Platform;
    capabilities?: Partial<DeviceCapabilities>;
}
export declare const PlatformProvider: React.FC<PlatformProviderProps>;
export declare const usePlatformContext: () => PlatformContextValue;
export {};
//# sourceMappingURL=PlatformProvider.d.ts.map