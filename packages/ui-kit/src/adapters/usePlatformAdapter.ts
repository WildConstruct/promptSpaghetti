/**
 * Hook for accessing platform-specific adapters
 */

import { useMemo } from 'react';
import { usePlatformContext } from './PlatformProvider';
import { WebAdapter } from './WebAdapter';
import { ReactNativeAdapter } from './ReactNativeAdapter';

export interface PlatformAdapter {
  // Event handling
  handlePress: (callback: () => void) => any;
  handleLongPress: (callback: () => void) => any;
  handleHover: (callback: () => void) => any;
  
  // Styling
  createStyleSheet: (styles: any) => any;
  resolveStyle: (style: any) => any;
  
  // Navigation
  openUrl: (url: string) => void;
  goBack: () => void;
  
  // Storage
  getStorageItem: (key: string) => Promise<string | null>;
  setStorageItem: (key: string, value: string) => Promise<void>;
  removeStorageItem: (key: string) => Promise<void>;
  
  // Device features
  hapticFeedback: (type?: 'light' | 'medium' | 'heavy') => void;
  copyToClipboard: (text: string) => Promise<void>;
  shareContent: (content: { title?: string; text?: string; url?: string }) => Promise<void>;
  
  // Layout measurements
  measureElement: (element: any) => Promise<{ width: number; height: number; x: number; y: number }>;
  
  // Animation
  createAnimation: (config: any) => any;
  
  // Platform-specific components
  ScrollView: any;
  SafeAreaView: any;
  StatusBar: any;
  KeyboardAvoidingView: any;
  
  // File system (if available)
  readFile?: (path: string) => Promise<string>;
  writeFile?: (path: string, content: string) => Promise<void>;
  
  // Network
  fetch: typeof fetch;
  
  // Platform info
  getDeviceInfo: () => {
    model?: string;
    brand?: string;
    osVersion?: string;
    appVersion?: string;
  };
}

export const usePlatformAdapter = (): PlatformAdapter => {
  const { platform, isReactNative } = usePlatformContext();
  
  return useMemo(() => {
    if (isReactNative || platform === 'mobile') {
      return new ReactNativeAdapter();
    }
    
    return new WebAdapter();
  }, [platform, isReactNative]);
};