/**
 * Platform Provider for managing platform-specific adaptations
 */

import React, { createContext, useContext, useMemo } from 'react';
import { Platform, DeviceCapabilities } from '../types';
import { detectPlatform } from '../platform';

interface PlatformContextValue {
  platform: Platform;
  capabilities: DeviceCapabilities;
  isWeb: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  isReactNative: boolean;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

interface PlatformProviderProps {
  children: React.ReactNode;
  platform?: Platform;
  capabilities?: Partial<DeviceCapabilities>;
}

export const PlatformProvider: React.FC<PlatformProviderProps> = ({
  children,
  platform: overridePlatform,
  capabilities: overrideCapabilities,
}) => {
  const detectedPlatform = useMemo(() => {
    return overridePlatform || detectPlatform();
  }, [overridePlatform]);

  const defaultCapabilities: DeviceCapabilities = useMemo(() => {
    // const isWebPlatform = detectedPlatform === 'web';
    const isMobilePlatform = detectedPlatform === 'mobile';

    return {
      touchSupport: isMobilePlatform || (typeof window !== 'undefined' && 'ontouchstart' in window),
      hoverSupport: !isMobilePlatform && typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches,
      keyboardSupport: true,
      maxViewportWidth: typeof window !== 'undefined' ? window.screen.width : 1920,
      maxViewportHeight: typeof window !== 'undefined' ? window.screen.height : 1080,
      pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
      ...overrideCapabilities,
    };
  }, [detectedPlatform, overrideCapabilities]);

  const contextValue: PlatformContextValue = useMemo(
    () => ({
      platform: detectedPlatform,
      capabilities: defaultCapabilities,
      isWeb: detectedPlatform === 'web',
      isMobile: detectedPlatform === 'mobile',
      isDesktop: detectedPlatform === 'desktop',
      isReactNative: false, // Will be overridden by React Native adapter
    }),
    [detectedPlatform, defaultCapabilities]
  );

  return <PlatformContext.Provider value={contextValue}>{children}</PlatformContext.Provider>;
};

export const usePlatformContext = (): PlatformContextValue => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatformContext must be used within a PlatformProvider');
  }
  return context;
};
