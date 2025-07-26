/**
 * Touch interaction system exports
 */
// Core touch system
export { TouchManager } from './TouchManager';
export { defaultGestureConfig, graphGestures, getDistance, getAngle, getCenter, getVelocity, getSwipeDirection, getPinchScale, getRotation, isWithinBounds, gestureHelpers } from './gestures';
export { gestureFeedbackPresets, HapticFeedback, VisualFeedback, TouchFeedback, touchFeedbackStyles } from './feedback';
export { accessibilityGuidelines, analyzeTouchTarget, createAccessibleTouchTarget, enableTouchTargetDebugging, touchTargetUtils } from './accessibility';
export { TouchableNode, SelectionBox } from './NodeGestures';
export { MultiTouchController, gestureShortcuts, GestureTrainer } from './MultiTouchGestures';
export { TouchContextMenu, ContextMenuProvider, graphContextMenuItems } from './TouchContextMenu';
/**
 * Touch interaction system initialization
 */
export function initializeTouchSystem(options) {
    // Enable/disable haptics globally
    if (options?.enableHaptics !== undefined && typeof window !== 'undefined') {
        try {
            HapticFeedback.getInstance().setEnabled(options.enableHaptics);
        }
        catch (error) {
            console.warn('Failed to initialize haptic feedback:', error);
        }
    }
    // Enable touch target debugging
    if (options?.enableDebugging && typeof window !== 'undefined') {
        try {
            enableTouchTargetDebugging(true);
        }
        catch (error) {
            console.warn('Failed to enable touch target debugging:', error);
        }
    }
    // Add touch feedback styles to document
    if (typeof document !== 'undefined' && !document.getElementById('touch-feedback-styles')) {
        try {
            const style = document.createElement('style');
            style.id = 'touch-feedback-styles';
            style.textContent = touchFeedbackStyles;
            document.head.appendChild(style);
        }
        catch (error) {
            console.warn('Failed to add touch feedback styles:', error);
        }
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