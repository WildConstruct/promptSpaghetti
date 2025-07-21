/**
 * Touch interaction system exports
 */
export { TouchManager } from './TouchManager';
export type { GestureHandler, TouchManagerOptions } from './TouchManager';
export { GestureType, SwipeDirection, TouchPoint, GestureState, GestureEvent, GestureConfig, defaultGestureConfig, graphGestures, getDistance, getAngle, getCenter, getVelocity, getSwipeDirection, getPinchScale, getRotation, isWithinBounds, gestureHelpers } from './gestures';
export { HapticStyle, VisualFeedbackType, HapticFeedbackConfig, VisualFeedbackConfig, TouchFeedbackConfig, gestureFeedbackPresets, HapticFeedback, VisualFeedback, TouchFeedback, touchFeedbackStyles } from './feedback';
export { TouchTargetConfig, TouchTargetAnalysis, accessibilityGuidelines, analyzeTouchTarget, createAccessibleTouchTarget, enableTouchTargetDebugging, touchTargetUtils } from './accessibility';
export { NodeGestureHandlers, TouchableNodeProps, TouchableNode, SelectionBoxProps, SelectionBox } from './NodeGestures';
export { MultiTouchHandlers, MultiTouchControllerProps, MultiTouchController, gestureShortcuts, GestureCombination, GestureTrainerProps, GestureTrainer } from './MultiTouchGestures';
export { ContextMenuItem, TouchContextMenuProps, TouchContextMenu, ContextMenuProviderProps, ContextMenuProvider, graphContextMenuItems } from './TouchContextMenu';
/**
 * Touch interaction system initialization
 */
export declare function initializeTouchSystem(options?: {
    enableHaptics?: boolean;
    enableDebugging?: boolean;
    customGestureConfig?: Partial<GestureConfig>;
}): void;
/**
 * Touch device detection utilities
 */
export declare const touchUtils: {
    /**
     * Check if device supports touch
     */
    isTouchDevice(): boolean;
    /**
     * Check if device supports haptic feedback
     */
    supportsHaptics(): boolean;
    /**
     * Check if device supports force touch
     */
    supportsForceTouch(): boolean;
    /**
     * Get touch capabilities
     */
    getTouchCapabilities(): {
        touch: boolean;
        multiTouch: boolean;
        haptics: boolean;
        forceTouch: boolean;
        maxTouchPoints: number;
    };
};
//# sourceMappingURL=index.d.ts.map