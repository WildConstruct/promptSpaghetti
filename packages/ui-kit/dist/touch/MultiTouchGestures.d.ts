/**
 * Multi-touch gesture handlers and shortcuts
 */
import React from 'react';
import { GestureEvent, SwipeDirection } from './gestures';
export interface MultiTouchHandlers {
    onTwoFingerTap?: () => void;
    onTwoFingerSwipe?: (direction: SwipeDirection) => void;
    onTwoFingerRotate?: (angle: number) => void;
    onThreeFingerTap?: () => void;
    onThreeFingerSwipe?: (direction: SwipeDirection) => void;
    onThreeFingerPinch?: (scale: number) => void;
    onFourFingerTap?: () => void;
    onFourFingerSwipe?: (direction: SwipeDirection) => void;
    onUndo?: () => void;
    onRedo?: () => void;
    onZoomReset?: () => void;
    onSelectAll?: () => void;
    onDeselectAll?: () => void;
    onShowMenu?: () => void;
    onToggleFullscreen?: () => void;
    onSwitchMode?: () => void;
}
export interface MultiTouchControllerProps {
    handlers: MultiTouchHandlers;
    enableShortcuts?: boolean;
    enableHaptics?: boolean;
    children: React.ReactNode;
}
/**
 * Multi-touch gesture controller
 */
export declare     private checkCombinations;
    clear(): void;
}
/**
 * Touch gesture trainer component
 */
export interface GestureTrainerProps {
    onComplete?: () => void;
}
export declare const GestureTrainer: React.FC<GestureTrainerProps>;
//# sourceMappingURL=MultiTouchGestures.d.ts.map