/**
 * Touch feedback system for visual and haptic responses
 */

import { GestureType } from './gestures';

export type HapticStyle = 
  | 'light'
  | 'medium' 
  | 'heavy'
  | 'soft'
  | 'rigid'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error';

export type VisualFeedbackType =
  | 'ripple'
  | 'highlight'
  | 'scale'
  | 'glow'
  | 'pulse'
  | 'shake';

export interface HapticFeedbackConfig {
  enabled: boolean;
  intensity: number; // 0-1
  duration: number; // ms
  pattern?: number[]; // Custom vibration pattern
}

export interface VisualFeedbackConfig {
  enabled: boolean;
  type: VisualFeedbackType;
  duration: number; // ms
  color?: string;
  scale?: number;
  opacity?: number;
}

export interface TouchFeedbackConfig {
  haptic: HapticFeedbackConfig;
  visual: VisualFeedbackConfig;
  audio?: {
    enabled: boolean;
    volume: number; // 0-1
    sound?: string; // URL or preset
  };
}

/**
 * Default feedback configurations for different gestures
 */
export const gestureFeedbackPresets: Record<GestureType, TouchFeedbackConfig> = {
  tap: {
    haptic: {
      enabled: true,
      intensity: 0.3,
      duration: 10
    },
    visual: {
      enabled: true,
      type: 'ripple',
      duration: 300,
      opacity: 0.3
    }
  },
  
  doubleTap: {
    haptic: {
      enabled: true,
      intensity: 0.4,
      duration: 15,
      pattern: [10, 50, 10]
    },
    visual: {
      enabled: true,
      type: 'pulse',
      duration: 400,
      scale: 1.1
    }
  },
  
  longPress: {
    haptic: {
      enabled: true,
      intensity: 0.5,
      duration: 50
    },
    visual: {
      enabled: true,
      type: 'highlight',
      duration: 200,
      opacity: 0.5
    }
  },
  
  swipe: {
    haptic: {
      enabled: true,
      intensity: 0.2,
      duration: 20
    },
    visual: {
      enabled: true,
      type: 'ripple',
      duration: 200
    }
  },
  
  pan: {
    haptic: {
      enabled: false, // Too frequent
      intensity: 0,
      duration: 0
    },
    visual: {
      enabled: false,
      type: 'highlight',
      duration: 0
    }
  },
  
  pinch: {
    haptic: {
      enabled: true,
      intensity: 0.1,
      duration: 5
    },
    visual: {
      enabled: true,
      type: 'scale',
      duration: 0
    }
  },
  
  rotate: {
    haptic: {
      enabled: false,
      intensity: 0,
      duration: 0
    },
    visual: {
      enabled: true,
      type: 'glow',
      duration: 0
    }
  },
  
  drag: {
    haptic: {
      enabled: true,
      intensity: 0.2,
      duration: 10
    },
    visual: {
      enabled: true,
      type: 'highlight',
      duration: 0,
      opacity: 0.2
    }
  },
  
  flick: {
    haptic: {
      enabled: true,
      intensity: 0.3,
      duration: 15
    },
    visual: {
      enabled: true,
      type: 'ripple',
      duration: 150
    }
  }
};

/**
 * Haptic feedback manager
 */
export class HapticFeedback {
  private static instance: HapticFeedback;
  private enabled: boolean = true;
  
  static getInstance(): HapticFeedback {
    if (!HapticFeedback.instance) {
      HapticFeedback.instance = new HapticFeedback();
    }
    return HapticFeedback.instance;
  }
  
  constructor() {
    this.enabled = this.isSupported();
  }
  
  isSupported(): boolean {
    return 'vibrate' in navigator;
  }
  
  setEnabled(enabled: boolean): void {
    this.enabled = enabled && this.isSupported();
  }
  
  trigger(style: HapticStyle | HapticFeedbackConfig): void {
    if (!this.enabled) return;
    
    if (typeof style === 'string') {
      this.triggerPreset(style);
    } else {
      this.triggerCustom(style);
    }
  }
  
  private triggerPreset(style: HapticStyle): void {
    const patterns: Record<HapticStyle, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 50,
      soft: [5, 10, 5],
      rigid: [30],
      selection: 15,
      success: [10, 50, 10, 50, 10],
      warning: [20, 20, 20],
      error: [50, 100, 50]
    };
    
    const pattern = patterns[style] || 10;
    navigator.vibrate(pattern);
  }
  
  private triggerCustom(config: HapticFeedbackConfig): void {
    if (!config.enabled) return;
    
    if (config.pattern) {
      navigator.vibrate(config.pattern);
    } else {
      navigator.vibrate(Math.round(config.duration * config.intensity));
    }
  }
}

/**
 * Visual feedback renderer
 */
export class VisualFeedback {
  private static activeEffects = new Map<string, HTMLElement>();
  
  static trigger(
    element: HTMLElement,
    config: VisualFeedbackConfig,
    position?: { x: number; y: number }
  ): void {
    if (!config.enabled) return;
    
    switch (config.type) {
    case 'ripple':
      this.createRipple(element, config, position);
      break;
    case 'highlight':
      this.createHighlight(element, config);
      break;
    case 'scale':
      this.createScale(element, config);
      break;
    case 'glow':
      this.createGlow(element, config);
      break;
    case 'pulse':
      this.createPulse(element, config);
      break;
    case 'shake':
      this.createShake(element, config);
      break;
    }
  }
  
  private static createRipple(
    element: HTMLElement,
    config: VisualFeedbackConfig,
    position?: { x: number; y: number }
  ): void {
    const ripple = document.createElement('div');
    ripple.className = 'touch-ripple';
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    
    const x = position ? position.x - rect.left : rect.width / 2;
    const y = position ? position.y - rect.top : rect.height / 2;
    
    Object.assign(ripple.style, {
      position: 'absolute',
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      transform: 'translate(-50%, -50%) scale(0)',
      left: `${x}px`,
      top: `${y}px`,
      backgroundColor: config.color || 'currentColor',
      opacity: config.opacity || 0.3,
      pointerEvents: 'none',
      transition: `transform ${config.duration}ms ease-out, opacity ${config.duration}ms ease-out`
    });
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    // Trigger animation
    requestAnimationFrame(() => {
      ripple.style.transform = 'translate(-50%, -50%) scale(1)';
      ripple.style.opacity = '0';
    });
    
    setTimeout(() => {
      ripple.remove();
    }, config.duration);
  }
  
  private static createHighlight(element: HTMLElement, config: VisualFeedbackConfig): void {
    const originalBackground = element.style.backgroundColor;
    const originalTransition = element.style.transition;
    
    element.style.transition = `background-color ${config.duration}ms ease`;
    element.style.backgroundColor = config.color || 'rgba(0, 122, 255, 0.1)';
    
    setTimeout(() => {
      element.style.backgroundColor = originalBackground;
      setTimeout(() => {
        element.style.transition = originalTransition;
      }, config.duration);
    }, config.duration);
  }
  
  private static createScale(element: HTMLElement, config: VisualFeedbackConfig): void {
    const originalTransform = element.style.transform;
    const originalTransition = element.style.transition;
    
    element.style.transition = `transform ${config.duration}ms ease`;
    element.style.transform = `${originalTransform} scale(${config.scale || 0.95})`;
    
    setTimeout(() => {
      element.style.transform = originalTransform;
      setTimeout(() => {
        element.style.transition = originalTransition;
      }, config.duration);
    }, config.duration / 2);
  }
  
  private static createGlow(element: HTMLElement, config: VisualFeedbackConfig): void {
    const originalBoxShadow = element.style.boxShadow;
    const originalTransition = element.style.transition;
    
    element.style.transition = `box-shadow ${config.duration}ms ease`;
    element.style.boxShadow = `0 0 20px ${config.color || 'rgba(0, 122, 255, 0.5)'}`;
    
    setTimeout(() => {
      element.style.boxShadow = originalBoxShadow;
      setTimeout(() => {
        element.style.transition = originalTransition;
      }, config.duration);
    }, config.duration);
  }
  
  private static createPulse(element: HTMLElement, config: VisualFeedbackConfig): void {
    element.style.animation = `touch-pulse ${config.duration}ms ease`;
    
    setTimeout(() => {
      element.style.animation = '';
    }, config.duration);
  }
  
  private static createShake(element: HTMLElement, config: VisualFeedbackConfig): void {
    element.style.animation = `touch-shake ${config.duration}ms ease`;
    
    setTimeout(() => {
      element.style.animation = '';
    }, config.duration);
  }
}

/**
 * Combined touch feedback manager
 */
export class TouchFeedback {
  private haptic = HapticFeedback.getInstance();
  
  trigger(
    gesture: GestureType,
    element?: HTMLElement,
    position?: { x: number; y: number },
    customConfig?: Partial<TouchFeedbackConfig>
  ): void {
    const defaultConfig = gestureFeedbackPresets[gesture];
    const config = customConfig 
      ? { ...defaultConfig, ...customConfig }
      : defaultConfig;
    
    // Haptic feedback
    if (config.haptic.enabled) {
      this.haptic.trigger(config.haptic);
    }
    
    // Visual feedback
    if (config.visual.enabled && element) {
      VisualFeedback.trigger(element, config.visual, position);
    }
    
    // Audio feedback (if implemented)
    if (config.audio?.enabled) {
      // Play audio feedback
    }
  }
}

/**
 * CSS animations for visual feedback
 */
export const touchFeedbackStyles = `
  @keyframes touch-pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }
  
  @keyframes touch-shake {
    0%, 100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-5px);
    }
    75% {
      transform: translateX(5px);
    }
  }
  
  .touch-ripple {
    will-change: transform, opacity;
  }
`;