/**
 * Web platform adapter implementation
 */

import { PlatformAdapter } from './usePlatformAdapter';

export class WebAdapter implements PlatformAdapter {
  // Event handling
  handlePress = (callback: () => void) => ({
    onClick: callback,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        callback();
      }
    },
  });

  handleLongPress = (callback: () => void) => {
    let timeout: NodeJS.Timeout;
    return {
      onMouseDown: () => {
        timeout = setTimeout(callback, 500);
      },
      onMouseUp: () => {
        clearTimeout(timeout);
      },
      onMouseLeave: () => {
        clearTimeout(timeout);
      },
    };
  };

  handleHover = (callback: () => void) => ({
    onMouseEnter: callback,
  });

  // Styling
  createStyleSheet = (styles: any) => styles; // Web doesn't need stylesheet compilation

  resolveStyle = (style: any) => {
    if (Array.isArray(style)) {
      return Object.assign({}, ...style);
    }
    return style;
  };

  // Navigation
  openUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    }
  };

  // Storage (using localStorage)
  getStorageItem = async (key: string): Promise<string | null> => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  setStorageItem = async (key: string, value: string): Promise<void> => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to set storage item:', error);
    }
  };

  removeStorageItem = async (key: string): Promise<void> => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove storage item:', error);
    }
  };

  // Device features
  hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    // Web vibration API (if available)
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 50,
      };
      navigator.vibrate(patterns[type]);
    }
  };

  copyToClipboard = async (text: string): Promise<void> => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.warn('Failed to copy to clipboard:', error);
      throw error;
    }
  };

  shareContent = async (content: { title?: string; text?: string; url?: string }): Promise<void> => {
    try {
      if (navigator.share) {
        await navigator.share(content);
      } else {
        // Fallback: copy to clipboard
        const shareText = `${content.title || ''}\n${content.text || ''}\n${content.url || ''}`.trim();
        await this.copyToClipboard(shareText);
      }
    } catch (error) {
      console.warn('Failed to share content:', error);
      throw error;
    }
  };

  // Layout measurements
  measureElement = async (element: HTMLElement): Promise<{ width: number; height: number; x: number; y: number }> => {
    return new Promise(resolve => {
      if (element.getBoundingClientRect) {
        const rect = element.getBoundingClientRect();
        resolve({
          width: rect.width,
          height: rect.height,
          x: rect.left,
          y: rect.top,
        });
      } else {
        resolve({ width: 0, height: 0, x: 0, y: 0 });
      }
    });
  };

  // Animation (using Web Animations API or CSS transitions)
  createAnimation = (config: { duration?: number; easing?: string; fill?: 'forwards' | 'backwards' | 'both' }) => {
    return {
      duration: config.duration || 300,
      easing: config.easing || 'ease',
      fill: config.fill || 'forwards',
    };
  };

  // Platform-specific components (Web implementations)
  ScrollView = 'div';
  SafeAreaView = 'div';
  StatusBar = null;
  KeyboardAvoidingView = 'div';

  // File system (Web File API)
  readFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  writeFile = async (filename: string, content: string): Promise<void> => {
    // Web download implementation
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Network
  fetch = fetch.bind(window);

  // Platform info
  getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;

    return {
      model: platform,
      brand: 'Web',
      osVersion: userAgent,
      appVersion: typeof process !== 'undefined' ? process.env.npm_package_version : '1.0.0',
    };
  };
}
