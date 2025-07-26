/**
 * Core touch event handler and gesture recognition
 */
import { defaultGestureConfig, getDistance, getCenter, getVelocity, getSwipeDirection, getPinchScale, getRotation, gestureHelpers } from './gestures';
import { TouchFeedback } from './feedback';
export class TouchManager {
    element;
    config;
    handlers = new Map();
    feedback;
    enableFeedback;
    // Gesture state
    currentGesture = null;
    touches = new Map();
    gestureHistory = [];
    // Timers
    longPressTimer;
    doubleTapTimer;
    lastTapTime = 0;
    constructor(options) {
        this.element = options.element;
        this.config = { ...defaultGestureConfig, ...options.config };
        this.feedback = new TouchFeedback();
        this.enableFeedback = options.enableFeedback ?? true;
        // Register initial handlers
        if (options.handlers) {
            Object.entries(options.handlers).forEach(([type, handler]) => {
                this.on(type, handler);
            });
        }
        this.attachEventListeners();
    }
    /**
     * Register a gesture handler
     */
    on(type, handler) {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, []);
        }
        this.handlers.get(type).push(handler);
    }
    /**
     * Remove a gesture handler
     */
    off(type, handler) {
        const handlers = this.handlers.get(type);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index !== -1) {
                handlers.splice(index, 1);
            }
        }
    }
    /**
     * Destroy the touch manager
     */
    destroy() {
        this.removeEventListeners();
        this.clearTimers();
        this.handlers.clear();
    }
    attachEventListeners() {
        // Touch events
        this.element.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        this.element.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        this.element.addEventListener('touchend', this.handleTouchEnd, { passive: false });
        this.element.addEventListener('touchcancel', this.handleTouchCancel, { passive: false });
        // Mouse events (for desktop testing)
        this.element.addEventListener('mousedown', this.handleMouseDown);
        this.element.addEventListener('mousemove', this.handleMouseMove);
        this.element.addEventListener('mouseup', this.handleMouseUp);
        this.element.addEventListener('mouseleave', this.handleMouseLeave);
        // Wheel events for pinch simulation
        this.element.addEventListener('wheel', this.handleWheel, { passive: false });
    }
    removeEventListeners() {
        this.element.removeEventListener('touchstart', this.handleTouchStart);
        this.element.removeEventListener('touchmove', this.handleTouchMove);
        this.element.removeEventListener('touchend', this.handleTouchEnd);
        this.element.removeEventListener('touchcancel', this.handleTouchCancel);
        this.element.removeEventListener('mousedown', this.handleMouseDown);
        this.element.removeEventListener('mousemove', this.handleMouseMove);
        this.element.removeEventListener('mouseup', this.handleMouseUp);
        this.element.removeEventListener('mouseleave', this.handleMouseLeave);
        this.element.removeEventListener('wheel', this.handleWheel);
    }
    handleTouchStart = (e) => {
        if (this.config.preventDefault)
            e.preventDefault();
        if (this.config.stopPropagation)
            e.stopPropagation();
        // Update touches
        Array.from(e.changedTouches).forEach(touch => {
            this.touches.set(touch.identifier, {
                id: touch.identifier,
                x: touch.clientX,
                y: touch.clientY,
                startX: touch.clientX,
                startY: touch.clientY,
                timestamp: Date.now(),
                force: touch.force
            });
        });
        // Start gesture
        this.startGesture();
        // Check for long press
        if (this.touches.size === 1) {
            this.startLongPressTimer();
        }
    };
    handleTouchMove = (e) => {
        if (this.config.preventDefault)
            e.preventDefault();
        // Update touches
        Array.from(e.changedTouches).forEach(touch => {
            const point = this.touches.get(touch.identifier);
            if (point) {
                point.x = touch.clientX;
                point.y = touch.clientY;
                point.force = touch.force;
            }
        });
        // Update gesture
        this.updateGesture();
        // Cancel long press if moved too much
        if (this.currentGesture && this.touches.size === 1) {
            const touch = Array.from(this.touches.values())[0];
            const distance = getDistance({ x: touch.startX, y: touch.startY }, { x: touch.x, y: touch.y });
            if (distance > this.config.longPressMoveThreshold) {
                this.cancelLongPress();
            }
        }
    };
    handleTouchEnd = (e) => {
        if (this.config.preventDefault)
            e.preventDefault();
        // Update touches
        Array.from(e.changedTouches).forEach(touch => {
            this.touches.delete(touch.identifier);
        });
        // End gesture if no more touches
        if (this.touches.size === 0) {
            this.endGesture();
        }
        else {
            this.updateGesture();
        }
    };
    handleTouchCancel = (e) => {
        this.handleTouchEnd(e);
    };
    // Mouse event handlers for desktop
    handleMouseDown = (e) => {
        // Only handle left click
        if (e.button !== 0)
            return;
        this.touches.set(0, {
            id: 0,
            x: e.clientX,
            y: e.clientY,
            startX: e.clientX,
            startY: e.clientY,
            timestamp: Date.now()
        });
        this.startGesture();
        this.startLongPressTimer();
    };
    handleMouseMove = (e) => {
        const touch = this.touches.get(0);
        if (!touch)
            return;
        touch.x = e.clientX;
        touch.y = e.clientY;
        this.updateGesture();
        // Cancel long press if moved too much
        const distance = getDistance({ x: touch.startX, y: touch.startY }, { x: touch.x, y: touch.y });
        if (distance > this.config.longPressMoveThreshold) {
            this.cancelLongPress();
        }
    };
    handleMouseUp = (e) => {
        if (!this.touches.has(0))
            return;
        this.touches.delete(0);
        this.endGesture();
    };
    handleMouseLeave = (e) => {
        if (this.touches.has(0)) {
            this.touches.delete(0);
            this.cancelGesture();
        }
    };
    handleWheel = (e) => {
        if (this.config.preventDefault)
            e.preventDefault();
        // Simulate pinch gesture
        const scale = e.deltaY > 0 ? 0.95 : 1.05;
        this.emitGesture('pinch', {
            center: { x: e.clientX, y: e.clientY },
            scale
        });
    };
    startGesture() {
        const touches = Array.from(this.touches.values());
        this.currentGesture = {
            type: this.detectGestureType(),
            active: true,
            startTime: Date.now(),
            touches,
            center: getCenter(touches)
        };
    }
    updateGesture() {
        if (!this.currentGesture)
            return;
        const touches = Array.from(this.touches.values());
        const previousTouches = this.currentGesture.touches;
        this.currentGesture.touches = touches;
        this.currentGesture.center = getCenter(touches);
        // Detect gesture type changes
        const newType = this.detectGestureType();
        if (newType !== this.currentGesture.type) {
            this.currentGesture.type = newType;
        }
        // Calculate gesture-specific data
        if (touches.length === 2 && previousTouches.length === 2) {
            this.currentGesture.scale = getPinchScale(previousTouches, touches);
            this.currentGesture.rotation = getRotation(previousTouches, touches);
        }
        // Emit ongoing gestures
        if (this.currentGesture.type === 'pan' ||
            this.currentGesture.type === 'drag' ||
            this.currentGesture.type === 'pinch' ||
            this.currentGesture.type === 'rotate') {
            this.emitCurrentGesture();
        }
    }
    endGesture() {
        if (!this.currentGesture)
            return;
        this.currentGesture.active = false;
        this.currentGesture.endTime = Date.now();
        // Calculate final velocity
        if (this.currentGesture.touches.length > 0) {
            const touch = this.currentGesture.touches[0];
            this.currentGesture.velocity = getVelocity({
                x: touch.startX,
                y: touch.startY,
                timestamp: this.currentGesture.startTime
            }, {
                x: touch.x,
                y: touch.y,
                timestamp: this.currentGesture.endTime
            });
        }
        // Detect final gesture type
        const finalType = this.detectFinalGestureType();
        if (finalType) {
            this.currentGesture.type = finalType;
            this.emitCurrentGesture();
        }
        // Store in history
        this.gestureHistory.push(this.currentGesture);
        if (this.gestureHistory.length > 10) {
            this.gestureHistory.shift();
        }
        this.currentGesture = null;
        this.clearTimers();
    }
    cancelGesture() {
        this.currentGesture = null;
        this.clearTimers();
    }
    detectGestureType() {
        const touchCount = this.touches.size;
        if (touchCount === 0)
            return 'tap';
        if (touchCount === 1)
            return 'drag';
        if (touchCount === 2)
            return 'pinch';
        return 'tap';
    }
    detectFinalGestureType() {
        if (!this.currentGesture)
            return null;
        const gesture = this.currentGesture;
        // Check for tap
        if (gestureHelpers.isTap(gesture, this.config)) {
            // Check for double tap
            const now = Date.now();
            if (now - this.lastTapTime < this.config.doubleTapDelay) {
                this.lastTapTime = 0;
                return 'doubleTap';
            }
            this.lastTapTime = now;
            return 'tap';
        }
        // Check for swipe
        if (gestureHelpers.isSwipe(gesture, this.config)) {
            return 'swipe';
        }
        // Check for long press (already handled by timer)
        return null;
    }
    startLongPressTimer() {
        this.cancelLongPress();
        this.longPressTimer = setTimeout(() => {
            if (this.currentGesture && gestureHelpers.isLongPress(this.currentGesture, this.config)) {
                this.currentGesture.type = 'longPress';
                this.emitCurrentGesture();
            }
        }, this.config.longPressDelay);
    }
    cancelLongPress() {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = undefined;
        }
    }
    clearTimers() {
        this.cancelLongPress();
        if (this.doubleTapTimer) {
            clearTimeout(this.doubleTapTimer);
            this.doubleTapTimer = undefined;
        }
    }
    emitCurrentGesture() {
        if (!this.currentGesture)
            return;
        const touch = this.currentGesture.touches[0];
        const event = {
            type: this.currentGesture.type,
            target: this.element,
            touches: this.currentGesture.touches,
            center: this.currentGesture.center,
            deltaX: touch ? touch.x - touch.startX : 0,
            deltaY: touch ? touch.y - touch.startY : 0,
            distance: touch ? getDistance({ x: touch.startX, y: touch.startY }, { x: touch.x, y: touch.y }) : 0,
            direction: touch ? getSwipeDirection(touch.x - touch.startX, touch.y - touch.startY) : undefined,
            velocity: this.currentGesture.velocity,
            scale: this.currentGesture.scale,
            rotation: this.currentGesture.rotation,
            preventDefault: () => { },
            stopPropagation: () => { }
        };
        this.emitGesture(this.currentGesture.type, event);
    }
    emitGesture(type, event = {}) {
        const fullEvent = {
            type,
            target: this.element,
            touches: Array.from(this.touches.values()),
            center: getCenter(Array.from(this.touches.values())),
            deltaX: 0,
            deltaY: 0,
            distance: 0,
            preventDefault: () => { },
            stopPropagation: () => { },
            ...event
        };
        // Trigger feedback
        if (this.enableFeedback) {
            this.feedback.trigger(type, this.element, fullEvent.center);
        }
        // Call handlers
        const handlers = this.handlers.get(type);
        if (handlers) {
            handlers.forEach(handler => handler(fullEvent));
        }
    }
}
//# sourceMappingURL=TouchManager.js.map