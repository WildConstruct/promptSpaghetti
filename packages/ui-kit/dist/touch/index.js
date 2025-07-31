/**
 * Touch interaction system exports
 */
// Core touch system
export { TouchManager } from './TouchManager';
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
export { gestureFeedbackPresets, HapticFeedback, VisualFeedback, TouchFeedback, touchFeedbackStyles } from './feedback';
export {
  accessibilityGuidelines,
  analyzeTouchTarget,
  createAccessibleTouchTarget,
  enableTouchTargetDebugging,
  touchTargetUtils,
} from './accessibility';
export { TouchableNode, SelectionBox } from './NodeGestures';
export { MultiTouchController, gestureShortcuts, GestureTrainer } from './MultiTouchGestures';
export { TouchContextMenu, ContextMenuProvider, graphContextMenuItems } from './TouchContextMenu';
/**
 * Touch interaction system initialization
 * @deprecated This function has implementation issues and will be fixed in a future version
 */
export function initializeTouchSystem(options) {
  console.warn('initializeTouchSystem is currently disabled due to implementation issues');
  // Implementation temporarily disabled to resolve build issues
}
/**
 * Check if device supports haptic feedback
 */
supportsHaptics();
boolean;
{
  return 'vibrate' in navigator;
}
/**
 * Check if device supports force touch
 */
supportsForceTouch();
boolean;
{
  return 'ontouchforcechange' in document;
}
/**
 * Get touch capabilities
 */
getTouchCapabilities();
{
  touch: boolean;
  multiTouch: boolean;
  haptics: boolean;
  forceTouch: boolean;
  maxTouchPoints: number;
}
{
  return {
    touch: this.isTouchDevice(),
    multiTouch: navigator.maxTouchPoints > 1,
    haptics: this.supportsHaptics(),
    forceTouch: this.supportsForceTouch(),
    maxTouchPoints: navigator.maxTouchPoints || 0,
  };
}
//# sourceMappingURL=index.js.map
