/**
 * Touch interaction system exports
 */

// Core touch system
export { TouchManager } from './TouchManager';
export type { GestureHandler, TouchManagerOptions } from './TouchManager';

// Gesture definitions
export type { GestureType, SwipeDirection, TouchPoint, GestureState, GestureEvent, GestureConfig } from './gestures';

export {
  defaultGestureConfig,
  graphGestures,
  getDistance,
  getAngle,
  getCenter,
  getVelocity,
  getSwipeDirection,
  getPinchScale,
  getRotation,
  isWithinBounds,
  gestureHelpers,
} from './gestures';

// Feedback system
export type {
  HapticStyle,
  VisualFeedbackType,
  HapticFeedbackConfig,
  VisualFeedbackConfig,
  TouchFeedbackConfig,
} from './feedback';

export { gestureFeedbackPresets, HapticFeedback, VisualFeedback, TouchFeedback, touchFeedbackStyles } from './feedback';

// Accessibility utilities
export type { TouchTargetConfig, TouchTargetAnalysis } from './accessibility';

export {
  accessibilityGuidelines,
  analyzeTouchTarget,
  createAccessibleTouchTarget,
  enableTouchTargetDebugging,
  touchTargetUtils,
} from './accessibility';

// Node gesture components
export type { NodeGestureHandlers, TouchableNodeProps, SelectionBoxProps } from './NodeGestures';

export { TouchableNode, SelectionBox } from './NodeGestures';

// Multi-touch gestures
export type {
  MultiTouchHandlers,
  MultiTouchControllerProps,
  GestureCombination,
  GestureTrainerProps,
} from './MultiTouchGestures';

export { MultiTouchController, gestureShortcuts, GestureTrainer } from './MultiTouchGestures';

// Context menu system
export type { ContextMenuItem, TouchContextMenuProps, ContextMenuProviderProps } from './TouchContextMenu';

export { TouchContextMenu, ContextMenuProvider, graphContextMenuItems } from './TouchContextMenu';

/**
 * Touch interaction system initialization
 * @deprecated This function has implementation issues and will be fixed in a future version
 */
export function initializeTouchSystem(options?: {
  enableHaptics?: boolean;
  enableDebugging?: boolean;
  customGestureConfig?: any;
}): void {
  console.warn('initializeTouchSystem is currently disabled due to implementation issues');
  // Implementation temporarily disabled to resolve build issues
}

/**
 * Touch device detection utilities
 */
export const touchUtils = {
  /**
   * Check if device is touch-enabled
   */
  isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  /**
   * Check if device supports haptic feedback
   */
  supportsHaptics(): boolean {
    return 'vibrate' in navigator;
  },

  /**
   * Check if device supports force touch
   */
  supportsForceTouch(): boolean {
    return 'ontouchforcechange' in document;
  },

  /**
   * Get touch capabilities
   */
  getTouchCapabilities(): {
    touch: boolean;
    multiTouch: boolean;
    haptics: boolean;
    forceTouch: boolean;
    maxTouchPoints: number;
  } {
    return {
      touch: this.isTouchDevice(),
      multiTouch: navigator.maxTouchPoints > 1,
      haptics: this.supportsHaptics(),
      forceTouch: this.supportsForceTouch(),
      maxTouchPoints: navigator.maxTouchPoints || 0,
    };
  },
};
