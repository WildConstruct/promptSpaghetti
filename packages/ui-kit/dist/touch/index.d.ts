/**
 * Touch interaction system exports
 */
export { TouchManager } from './TouchManager';
export type { GestureHandler, TouchManagerOptions } from './TouchManager';
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
export type {
  HapticStyle,
  VisualFeedbackType,
  HapticFeedbackConfig,
  VisualFeedbackConfig,
  TouchFeedbackConfig,
} from './feedback';
export { gestureFeedbackPresets, HapticFeedback, VisualFeedback, TouchFeedback, touchFeedbackStyles } from './feedback';
export type { TouchTargetConfig, TouchTargetAnalysis } from './accessibility';
export {
  accessibilityGuidelines,
  analyzeTouchTarget,
  createAccessibleTouchTarget,
  enableTouchTargetDebugging,
  touchTargetUtils,
} from './accessibility';
export type { NodeGestureHandlers, TouchableNodeProps, SelectionBoxProps } from './NodeGestures';
export { TouchableNode, SelectionBox } from './NodeGestures';
export type {
  MultiTouchHandlers,
  MultiTouchControllerProps,
  GestureCombination,
  GestureTrainerProps,
} from './MultiTouchGestures';
export { MultiTouchController, gestureShortcuts, GestureTrainer } from './MultiTouchGestures';
export type { ContextMenuItem, TouchContextMenuProps, ContextMenuProviderProps } from './TouchContextMenu';
export { TouchContextMenu, ContextMenuProvider, graphContextMenuItems } from './TouchContextMenu';
/**
 * Touch interaction system initialization
 * @deprecated This function has implementation issues and will be fixed in a future version
 */
export declare function initializeTouchSystem(options?: {
  enableHaptics?: boolean;
  enableDebugging?: boolean;
  customGestureConfig?: any;
}): void;
//# sourceMappingURL=index.d.ts.map
