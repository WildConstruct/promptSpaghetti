/**
 * Platform detection and capabilities hook
 */

import { useState, useEffect } from 'react';
import { Platform, DeviceCapabilities } from '../types';
import {
  detectPlatform,
  getPlatformCapabilities,
  getPlatformOptimizations,
  isReducedMotion,
  isTouchDevice,
  isApplePlatform,
} from '../platform';

export interface PlatformState {
  platform: Platform;
  capabilities: DeviceCapabilities;
  optimizations: ReturnType<typeof getPlatformOptimizations>;
  isReducedMotion: boolean;
  isTouchDevice: boolean;
  isApplePlatform: boolean;
  isOnline: boolean;
}

export function usePlatform(): PlatformState {
  const [platformState, setPlatformState] = useState<PlatformState>(() => {
    const platform = detectPlatform();
    const capabilities = getPlatformCapabilities();
    const optimizations = getPlatformOptimizations(platform);

    return {
      platform,
      capabilities,
      optimizations,
      isReducedMotion: isReducedMotion(),
      isTouchDevice: isTouchDevice(),
      isApplePlatform: isApplePlatform(),
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    };
  });

  useEffect(() => {
    const updatePlatformState = () => {
      const platform = detectPlatform();
      const capabilities = getPlatformCapabilities();
      const optimizations = getPlatformOptimizations(platform);

      setPlatformState(prev => ({
        ...prev,
        platform,
        capabilities,
        optimizations,
        isReducedMotion: isReducedMotion(),
        isTouchDevice: isTouchDevice(),
        isApplePlatform: isApplePlatform(),
      }));
    };

    // Listen for media query changes
    if (typeof window !== 'undefined') {
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const hoverQuery = window.matchMedia('(hover: hover)');

      const handleMediaChange = () => updatePlatformState();

      reducedMotionQuery.addEventListener('change', handleMediaChange);
      hoverQuery.addEventListener('change', handleMediaChange);

      // Listen for online/offline changes
      const handleOnline = () => setPlatformState(prev => ({ ...prev, isOnline: true }));
      const handleOffline = () => setPlatformState(prev => ({ ...prev, isOnline: false }));

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        reducedMotionQuery.removeEventListener('change', handleMediaChange);
        hoverQuery.removeEventListener('change', handleMediaChange);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  return platformState;
}

// Specific platform checks
export function useIsMobile(): boolean {
  const { platform } = usePlatform();
  return platform === 'mobile';
}

export function useIsDesktop(): boolean {
  const { platform } = usePlatform();
  return platform === 'desktop';
}

export function useIsWeb(): boolean {
  const { platform } = usePlatform();
  return platform === 'web';
}

export function useTouchSupport(): boolean {
  const { capabilities } = usePlatform();
  return capabilities.touchSupport;
}

export function useHoverSupport(): boolean {
  const { capabilities } = usePlatform();
  return capabilities.hoverSupport;
}

export function useKeyboardSupport(): boolean {
  const { capabilities } = usePlatform();
  return capabilities.keyboardSupport;
}
