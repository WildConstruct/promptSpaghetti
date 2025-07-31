/**
 * Web platform adapter implementation
 */
import { PlatformAdapter } from './usePlatformAdapter';
export declare class WebAdapter implements PlatformAdapter {
  handlePress: (callback: () => void) => {
    onClick: () => void;
    onKeyDown: (e: KeyboardEvent) => void;
  };
  handleLongPress: (callback: () => void) => {
    onMouseDown: () => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
  };
  handleHover: (callback: () => void) => {
    onMouseEnter: () => void;
  };
  createStyleSheet: (styles: any) => any;
  resolveStyle: (style: any) => any;
  openUrl: (url: string) => void;
  goBack: () => void;
  getStorageItem: (key: string) => Promise<string | null>;
  setStorageItem: (key: string, value: string) => Promise<void>;
  removeStorageItem: (key: string) => Promise<void>;
  hapticFeedback: (type?: 'light' | 'medium' | 'heavy') => void;
  copyToClipboard: (text: string) => Promise<void>;
  shareContent: (content: { title?: string; text?: string; url?: string }) => Promise<void>;
  measureElement: (element: HTMLElement) => Promise<{
    width: number;
    height: number;
    x: number;
    y: number;
  }>;
  createAnimation: (config: { duration?: number; easing?: string; fill?: 'forwards' | 'backwards' | 'both' }) => {
    duration: number;
    easing: string;
    fill: 'both' | 'backwards' | 'forwards';
  };
  ScrollView: string;
  SafeAreaView: string;
  StatusBar: null;
  KeyboardAvoidingView: string;
  readFile: (file: File) => Promise<string>;
  writeFile: (filename: string, content: string) => Promise<void>;
  fetch: typeof fetch;
  getDeviceInfo: () => {
    model: string;
    brand: string;
    osVersion: string;
    appVersion: string | undefined;
  };
}
//# sourceMappingURL=WebAdapter.d.ts.map
