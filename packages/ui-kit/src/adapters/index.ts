/**
 * Platform-specific adapters for cross-platform components
 */

export { WebAdapter } from './WebAdapter';
export { ReactNativeAdapter } from './ReactNativeAdapter';
export { PlatformProvider } from './PlatformProvider';
export { usePlatformAdapter } from './usePlatformAdapter';

// Platform-specific component exports
export * from './web';
export * from './react-native';