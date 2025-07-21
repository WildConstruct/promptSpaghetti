/**
 * Core touch event handler and gesture recognition
 */
import { GestureType, GestureEvent, GestureConfig } from './gestures';
export type GestureHandler = (event: GestureEvent) => void;
export interface TouchManagerOptions {
    element: HTMLElement;
    config?: Partial<GestureConfig>;
    handlers?: Partial<Record<GestureType, GestureHandler>>;
    enableFeedback?: boolean;
}
export declare class TouchManager {
    private element;
    private config;
    private handlers;
    private feedback;
    private enableFeedback;
    private currentGesture;
    private touches;
    private gestureHistory;
    private longPressTimer?;
    private doubleTapTimer?;
    private lastTapTime;
    constructor(options: TouchManagerOptions);
    /**
     * Register a gesture handler
     */
    on(type: GestureType, handler: GestureHandler): void;
    /**
     * Remove a gesture handler
     */
    off(type: GestureType, handler: GestureHandler): void;
    /**
     * Destroy the touch manager
     */
    destroy(): void;
    private attachEventListeners;
    private removeEventListeners;
    private handleTouchStart;
    private handleTouchMove;
    private handleTouchEnd;
    private handleTouchCancel;
    private handleMouseDown;
    private handleMouseMove;
    private handleMouseUp;
    private handleMouseLeave;
    private handleWheel;
    private startGesture;
    private updateGesture;
    private endGesture;
    private cancelGesture;
    private detectGestureType;
    private detectFinalGestureType;
    private startLongPressTimer;
    private cancelLongPress;
    private clearTimers;
    private emitCurrentGesture;
    private emitGesture;
}
//# sourceMappingURL=TouchManager.d.ts.map