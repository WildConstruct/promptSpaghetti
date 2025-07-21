import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Multi-touch gesture handlers and shortcuts
 */
import React, { useRef, useCallback, useEffect } from 'react';
import { TouchManager } from './TouchManager';
import { HapticFeedback } from './feedback';
/**
 * Multi-touch gesture controller
 */
export const MultiTouchController = ({ handlers, enableShortcuts = true, enableHaptics = true, children }) => {
    const containerRef = useRef(null);
    const gestureHistoryRef = useRef([]);
    const haptic = useRef(HapticFeedback.getInstance());
    // Track multi-touch state
    const multiTouchStateRef = useRef({
        touchCount: 0,
        lastGesture: null,
        lastGestureTime: 0
    });
    useEffect(() => {
        if (!containerRef.current)
            return;
        const touchManager = new TouchManager({
            element: containerRef.current,
            config: {
                preventDefault: true,
                longPressDelay: 500
            },
            handlers: {
                tap: handleMultiTouchTap,
                doubleTap: handleMultiTouchDoubleTap,
                longPress: handleMultiTouchLongPress,
                swipe: handleMultiTouchSwipe,
                pinch: handleMultiTouchPinch,
                rotate: handleMultiTouchRotate
            }
        });
        return () => touchManager.destroy();
    }, [handlers, enableShortcuts]);
    const handleMultiTouchTap = useCallback((event) => {
        const touchCount = event.touches.length;
        // Update multi-touch state
        multiTouchStateRef.current = {
            touchCount,
            lastGesture: 'tap',
            lastGestureTime: Date.now()
        };
        // Add to history
        gestureHistoryRef.current.push(event);
        if (gestureHistoryRef.current.length > 10) {
            gestureHistoryRef.current.shift();
        }
        // Handle based on finger count
        switch (touchCount) {
            case 2:
                handlers.onTwoFingerTap?.();
                if (enableShortcuts) {
                    // Two-finger tap shortcut (e.g., zoom to fit)
                    if (enableHaptics)
                        haptic.current.trigger('selection');
                }
                break;
            case 3:
                handlers.onThreeFingerTap?.();
                if (enableShortcuts) {
                    handlers.onSelectAll?.();
                    if (enableHaptics)
                        haptic.current.trigger('success');
                }
                break;
            case 4:
                handlers.onFourFingerTap?.();
                if (enableShortcuts) {
                    handlers.onToggleFullscreen?.();
                    if (enableHaptics)
                        haptic.current.trigger('heavy');
                }
                break;
        }
    }, [handlers, enableShortcuts, enableHaptics]);
    const handleMultiTouchDoubleTap = useCallback((event) => {
        const touchCount = event.touches.length;
        switch (touchCount) {
            case 2:
                if (enableShortcuts) {
                    handlers.onZoomReset?.();
                    if (enableHaptics)
                        haptic.current.trigger('medium');
                }
                break;
            case 3:
                if (enableShortcuts) {
                    handlers.onDeselectAll?.();
                    if (enableHaptics)
                        haptic.current.trigger('light');
                }
                break;
        }
    }, [handlers, enableShortcuts, enableHaptics]);
    const handleMultiTouchLongPress = useCallback((event) => {
        const touchCount = event.touches.length;
        if (touchCount === 3 && enableShortcuts) {
            handlers.onShowMenu?.();
            if (enableHaptics)
                haptic.current.trigger('heavy');
        }
    }, [handlers, enableShortcuts, enableHaptics]);
    const handleMultiTouchSwipe = useCallback((event) => {
        const touchCount = event.touches.length;
        const direction = event.direction;
        if (!direction)
            return;
        switch (touchCount) {
            case 2:
                handlers.onTwoFingerSwipe?.(direction);
                if (enableShortcuts) {
                    if (direction === 'right') {
                        handlers.onUndo?.();
                        if (enableHaptics)
                            haptic.current.trigger('soft');
                    }
                    else if (direction === 'left') {
                        handlers.onRedo?.();
                        if (enableHaptics)
                            haptic.current.trigger('soft');
                    }
                }
                break;
            case 3:
                handlers.onThreeFingerSwipe?.(direction);
                break;
            case 4:
                handlers.onFourFingerSwipe?.(direction);
                if (enableShortcuts) {
                    handlers.onSwitchMode?.();
                    if (enableHaptics)
                        haptic.current.trigger('rigid');
                }
                break;
        }
    }, [handlers, enableShortcuts, enableHaptics]);
    const handleMultiTouchPinch = useCallback((event) => {
        if (event.touches.length === 3 && event.scale) {
            handlers.onThreeFingerPinch?.(event.scale);
        }
    }, [handlers]);
    const handleMultiTouchRotate = useCallback((event) => {
        if (event.touches.length === 2 && event.rotation) {
            handlers.onTwoFingerRotate?.(event.rotation);
        }
    }, [handlers]);
    return (_jsx("div", { ref: containerRef, style: {
            width: '100%',
            height: '100%',
            touchAction: 'none'
        }, children: children }));
};
/**
 * Gesture shortcut definitions
 */
export const gestureShortcuts = {
    // Navigation
    back: { fingers: 1, type: 'swipe', direction: 'right' },
    forward: { fingers: 1, type: 'swipe', direction: 'left' },
    home: { fingers: 2, type: 'tap' },
    // Editing
    undo: { fingers: 2, type: 'swipe', direction: 'right' },
    redo: { fingers: 2, type: 'swipe', direction: 'left' },
    copy: { fingers: 3, type: 'tap' },
    paste: { fingers: 3, type: 'doubleTap' },
    // View
    zoomIn: { fingers: 2, type: 'pinch', scale: '>1' },
    zoomOut: { fingers: 2, type: 'pinch', scale: '<1' },
    zoomReset: { fingers: 2, type: 'doubleTap' },
    fullscreen: { fingers: 4, type: 'tap' },
    // Selection
    selectAll: { fingers: 3, type: 'tap' },
    deselectAll: { fingers: 3, type: 'doubleTap' },
    multiSelect: { fingers: 1, type: 'drag', modifier: 'shift' },
    // Tools
    showMenu: { fingers: 3, type: 'longPress' },
    quickAdd: { fingers: 2, type: 'longPress' },
    search: { fingers: 3, type: 'swipe', direction: 'up' },
    // Mode switches
    switchMode: { fingers: 4, type: 'swipe' },
    toggleGrid: { fingers: 2, type: 'rotate', angle: '>45' }
};
/**
 * Gesture combination detector
 */
export class GestureCombination {
    gestures = [];
    timeWindow = 500; // ms
    callbacks = new Map();
    addGesture(gesture) {
        const now = Date.now();
        // Remove old gestures
        this.gestures = this.gestures.filter(g => (now - g.touches[0].timestamp) < this.timeWindow);
        // Add new gesture
        this.gestures.push(gesture);
        // Check for combinations
        this.checkCombinations();
    }
    onCombination(pattern, callback) {
        this.callbacks.set(pattern, callback);
    }
    checkCombinations() {
        // Check for tap-tap-hold pattern (open advanced menu)
        if (this.gestures.length >= 3) {
            const [g1, g2, g3] = this.gestures.slice(-3);
            if (g1.type === 'tap' && g2.type === 'tap' && g3.type === 'longPress') {
                this.callbacks.get('tap-tap-hold')?.();
            }
        }
        // Check for pinch-rotate (reset view)
        if (this.gestures.length >= 2) {
            const [g1, g2] = this.gestures.slice(-2);
            if (g1.type === 'pinch' && g2.type === 'rotate') {
                this.callbacks.get('pinch-rotate')?.();
            }
        }
        // Check for swipe-tap (quick action)
        if (this.gestures.length >= 2) {
            const [g1, g2] = this.gestures.slice(-2);
            if (g1.type === 'swipe' && g2.type === 'tap') {
                this.callbacks.get('swipe-tap')?.();
            }
        }
    }
    clear() {
        this.gestures = [];
    }
}
export const GestureTrainer = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = React.useState(0);
    const [completed, setCompleted] = React.useState([]);
    const trainingSteps = [
        { gesture: 'tap', description: 'Tap to select' },
        { gesture: 'doubleTap', description: 'Double tap to edit' },
        { gesture: 'longPress', description: 'Long press for menu' },
        { gesture: 'swipe', description: 'Swipe to navigate' },
        { gesture: 'pinch', description: 'Pinch to zoom' },
        { gesture: 'twoFingerSwipe', description: 'Two-finger swipe to undo' },
        { gesture: 'threeFingerTap', description: 'Three-finger tap to select all' }
    ];
    return (_jsxs("div", { className: "gesture-trainer", children: [_jsx("h3", { children: "Learn Touch Gestures" }), _jsx("div", { className: "training-steps", children: trainingSteps.map((step, index) => (_jsxs("div", { className: `training-step ${completed[index] ? 'completed' : ''} ${currentStep === index ? 'active' : ''}`, children: [_jsx("div", { className: "step-icon", children: completed[index] ? '✓' : index + 1 }), _jsx("div", { className: "step-description", children: step.description })] }, step.gesture))) }), _jsx("div", { className: "training-area", children: _jsx(MultiTouchController, { handlers: {
                        onTwoFingerSwipe: () => {
                            if (currentStep === 5) {
                                const newCompleted = [...completed];
                                newCompleted[5] = true;
                                setCompleted(newCompleted);
                                setCurrentStep(6);
                            }
                        },
                        onThreeFingerTap: () => {
                            if (currentStep === 6) {
                                const newCompleted = [...completed];
                                newCompleted[6] = true;
                                setCompleted(newCompleted);
                                onComplete?.();
                            }
                        }
                    }, children: _jsx("div", { className: "gesture-practice-area", children: _jsxs("p", { children: ["Practice the gesture: ", trainingSteps[currentStep]?.description] }) }) }) })] }));
};
//# sourceMappingURL=MultiTouchGestures.js.map