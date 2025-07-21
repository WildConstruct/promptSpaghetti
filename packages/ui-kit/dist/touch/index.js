/**
 * Touch interaction system exports
 */
// Core touch system
export { TouchManager } from './TouchManager';
// Gesture definitions
export { defaultGestureConfig, graphGestures, getDistance, getAngle, getCenter, getVelocity, getSwipeDirection, getPinchScale, getRotation, isWithinBounds, gestureHelpers } from './gestures';
// Feedback system
export { gestureFeedbackPresets, HapticFeedback, VisualFeedback, TouchFeedback, touchFeedbackStyles } from './feedback';
// Accessibility utilities
export { accessibilityGuidelines, analyzeTouchTarget, createAccessibleTouchTarget, enableTouchTargetDebugging, touchTargetUtils } from './accessibility';
// Node gesture components
export { TouchableNode, SelectionBox } from './NodeGestures';
// Multi-touch gestures
export { MultiTouchController, gestureShortcuts, GestureCombination, GestureTrainer } from './MultiTouchGestures';
// Context menu system
export { TouchContextMenu, ContextMenuProvider, graphContextMenuItems } from './TouchContextMenu';
/**
 * Touch interaction system initialization
 */
export function initializeTouchSystem(options) {
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
    isTouchDevice() {
        return ('ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            (window.matchMedia && window.matchMedia('(pointer: coarse)').matches));
    },
    /**
     * Check if device supports haptic feedback
     */
    supportsHaptics() {
        return 'vibrate' in navigator;
    },
    /**
     * Check if device supports force touch
     */
    supportsForceTouch() {
        return 'ontouchforcechange' in document;
    },
    /**
     * Get touch capabilities
     */
    getTouchCapabilities() {
        return {
            touch: this.isTouchDevice(),
            multiTouch: navigator.maxTouchPoints > 1,
            haptics: this.supportsHaptics(),
            forceTouch: this.supportsForceTouch(),
            maxTouchPoints: navigator.maxTouchPoints || 0
        };
    }
};
//# sourceMappingURL=index.js.map