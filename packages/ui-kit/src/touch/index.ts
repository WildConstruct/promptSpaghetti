/**
 * Touch interaction system exports
 */

// Core touch system
export { TouchManager } from './TouchManager';
export type { GestureHandler, TouchManagerOptions } from './TouchManager';

// Gesture definitions
export {
  GestureType,
  SwipeDirection,
  TouchPoint,
  GestureState,
  GestureEvent,
  GestureConfig,
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
  gestureHelpers
} from './gestures';

// Feedback system
export {
  HapticStyle,
  VisualFeedbackType,
  HapticFeedbackConfig,
  VisualFeedbackConfig,
  TouchFeedbackConfig,
  gestureFeedbackPresets,
  HapticFeedback,
  VisualFeedback,
  TouchFeedback,
  touchFeedbackStyles
} from './feedback';

// Accessibility utilities
export {
  TouchTargetConfig,
  TouchTargetAnalysis,
  accessibilityGuidelines,
  analyzeTouchTarget,
  createAccessibleTouchTarget,
  enableTouchTargetDebugging,
  touchTargetUtils
} from './accessibility';

// Node gesture components
export {
  NodeGestureHandlers,
  TouchableNodeProps,
  TouchableNode,
  SelectionBoxProps,
  SelectionBox
} from './NodeGestures';

// Multi-touch gestures
export {
  MultiTouchHandlers,
  MultiTouchControllerProps,
  MultiTouchController,
  gestureShortcuts,
  GestureCombination,
  GestureTrainerProps,
  GestureTrainer
} from './MultiTouchGestures';

// Context menu system
export {
  ContextMenuItem,
  TouchContextMenuProps,
  TouchContextMenu,
  ContextMenuProviderProps,
  ContextMenuProvider,
  graphContextMenuItems
} from './TouchContextMenu';

/**
 * Touch interaction system initialization
 */
export function initializeTouchSystem(options?: {
  enableHaptics?: boolean;
  enableDebugging?: boolean;
  customGestureConfig?: Partial<GestureConfig>;
}): void {
  // Enable/disable haptics globally
  if (options?.enableHaptics !== undefined) {
    HapticFeedback.getInstance().setEnabled(options.enableHaptics);
  }
  
  // Enable touch target debugging
  if (options?.enableDebugging) {
    enableTouchTargetDebugging(true);
  }
  
  // Add touch feedback styles to document
  if (!document.getElementById('touch-feedback-styles')) {
    const style = document.createElement('style');
    style.id = 'touch-feedback-styles';
    style.textContent = touchFeedbackStyles;
    document.head.appendChild(style);
  }
}

/**
 * Touch device detection utilities
 */
export const touchUtils = {
  /**
   * Check if device supports touch
   */
  isTouchDevice(): boolean {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
    );
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
      maxTouchPoints: navigator.maxTouchPoints || 0
    };
  }
};