import { jsx as _jsx } from 'react/jsx-runtime';
/**
 * Platform Provider for managing platform-specific adaptations
 */
import { createContext, useContext, useMemo } from 'react';
import { detectPlatform } from '../platform';
const PlatformContext = createContext(null);
export const PlatformProvider = ({ children, platform: overridePlatform, capabilities: overrideCapabilities }) => {
  const detectedPlatform = useMemo(() => {
    return overridePlatform || detectPlatform();
  }, [overridePlatform]);
  const defaultCapabilities = useMemo(() => {
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
  const contextValue = useMemo(
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
  return _jsx(PlatformContext.Provider, { value: contextValue, children: children });
};
export const usePlatformContext = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatformContext must be used within a PlatformProvider');
  }
  return context;
};
//# sourceMappingURL=PlatformProvider.js.map
