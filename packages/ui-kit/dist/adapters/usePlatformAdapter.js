/**
 * Hook for accessing platform-specific adapters
 */
import { useMemo } from 'react';
import { usePlatformContext } from './PlatformProvider';
import { WebAdapter } from './WebAdapter';
import { ReactNativeAdapter } from './ReactNativeAdapter';
export const usePlatformAdapter = () => {
  const { platform, isReactNative } = usePlatformContext();
  return useMemo(() => {
    if (isReactNative || platform === 'mobile') {
      return new ReactNativeAdapter();
    }
    return new WebAdapter();
  }, [platform, isReactNative]);
};
//# sourceMappingURL=usePlatformAdapter.js.map
