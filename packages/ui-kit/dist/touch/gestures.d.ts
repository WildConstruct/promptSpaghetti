/**
 * Touch gesture definitions and types
 */
export type GestureType = 'tap' | 'doubleTap' | 'longPress' | 'swipe' | 'pan' | 'pinch' | 'rotate' | 'drag' | 'flick';
export type SwipeDirection = 'up' | 'down' | 'left' | 'right';
export interface TouchPoint {
    id: number;
    x: number;
    y: number;
    startX: number;
    startY: number;
    timestamp: number;
    force?: number;
}
export interface GestureState {
    type: GestureType;
    active: boolean;
    startTime: number;
    endTime?: number;
    touches: TouchPoint[];
    center: {
        x: number;
        y: number;
    };
    distance?: number;
    angle?: number;
    velocity?: {
        x: number;
        y: number;
    };
    scale?: number;
    rotation?: number;
}
export interface GestureEvent {
    type: GestureType;
    target: EventTarget | null;
    touches: TouchPoint[];
    center: {
        x: number;
        y: number;
    };
    deltaX: number;
    deltaY: number;
    distance: number;
    direction?: SwipeDirection;
    velocity?: {
        x: number;
        y: number;
    };
    scale?: number;
    rotation?: number;
    preventDefault: () => void;
    stopPropagation: () => void;
}
export interface GestureConfig {
    tapDelay: number;
    tapMoveThreshold: number;
    doubleTapDelay: number;
    longPressDelay: number;
    longPressMoveThreshold: number;
    swipeThreshold: number;
    swipeVelocity: number;
    panThreshold: number;
    pinchThreshold: number;
    preventDefault: boolean;
    stopPropagation: boolean;
}
export declare     isLongPress: (gesture: GestureState, config?: GestureConfig) => boolean;
    isSwipe: (gesture: GestureState, config?: GestureConfig) => boolean;
    isPinch: (gesture: GestureState, config?: GestureConfig) => boolean;
};
//# sourceMappingURL=gestures.d.ts.map