/**
 * Touch gesture definitions and types
 */
export const defaultGestureConfig = {
    // Tap
    tapDelay: 300,
    tapMoveThreshold: 10,
    doubleTapDelay: 300,
    // Long press
    longPressDelay: 500,
    longPressMoveThreshold: 10,
    // Swipe
    swipeThreshold: 50,
    swipeVelocity: 0.3,
    // Pan
    panThreshold: 10,
    // Pinch
    pinchThreshold: 0.05,
    // General
    preventDefault: true,
    stopPropagation: false,
};
/**
 * Common gesture patterns for graph editing
 */
export const graphGestures = {
    // Node interactions
    nodeSelect: 'tap',
    nodeEdit: 'doubleTap',
    nodeMove: 'drag',
    nodeDelete: 'longPress',
    nodeContextMenu: 'longPress',
    // Edge interactions
    edgeCreate: 'drag', // From node output to input
    edgeSelect: 'tap',
    edgeDelete: 'longPress',
    // Canvas interactions
    canvasPan: 'pan',
    canvasZoom: 'pinch',
    canvasReset: 'doubleTap', // On empty area
    // Selection
    multiSelect: 'drag', // On empty area
    selectAll: 'doubleTap', // With modifier
    // Navigation
    navigateBack: 'swipe', // Right swipe
    navigateForward: 'swipe', // Left swipe
    // Quick actions
    quickAdd: 'longPress', // On empty area
    quickSearch: 'swipe', // Up swipe
    // Undo/Redo
    undo: 'swipe', // Two-finger right swipe
    redo: 'swipe', // Two-finger left swipe
};
/**
 * Calculate distance between two points
 */
export function getDistance(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}
/**
 * Calculate angle between two points
 */
export function getAngle(p1, p2) {
    return (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
}
/**
 * Calculate center point of multiple touches
 */
export function getCenter(touches) {
    const sum = touches.reduce((acc, touch) => ({
        x: acc.x + touch.x,
        y: acc.y + touch.y,
    }), { x: 0, y: 0 });
    return {
        x: sum.x / touches.length,
        y: sum.y / touches.length,
    };
}
/**
 * Calculate velocity of movement
 */
export function getVelocity(start, end) {
    const timeDiff = end.timestamp - start.timestamp;
    if (timeDiff === 0)
        return { x: 0, y: 0 };
    return {
        x: (end.x - start.x) / timeDiff,
        y: (end.y - start.y) / timeDiff,
    };
}
/**
 * Determine swipe direction
 */
export function getSwipeDirection(deltaX, deltaY, threshold = 30) {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    if (absX < threshold && absY < threshold)
        return null;
    if (absX > absY) {
        return deltaX > 0 ? 'right' : 'left';
    }
    else {
        return deltaY > 0 ? 'down' : 'up';
    }
}
/**
 * Calculate pinch scale
 */
export function getPinchScale(touches1, touches2) {
    if (touches1.length < 2 || touches2.length < 2)
        return 1;
    const distance1 = getDistance(touches1[0], touches1[1]);
    const distance2 = getDistance(touches2[0], touches2[1]);
    return distance2 / distance1;
}
/**
 * Calculate rotation angle
 */
export function getRotation(touches1, touches2) {
    if (touches1.length < 2 || touches2.length < 2)
        return 0;
    const angle1 = getAngle(touches1[0], touches1[1]);
    const angle2 = getAngle(touches2[0], touches2[1]);
    return angle2 - angle1;
}
/**
 * Check if gesture is within bounds
 */
export function isWithinBounds(point, bounds) {
    return (point.x >= bounds.x &&
        point.x <= bounds.x + bounds.width &&
        point.y >= bounds.y &&
        point.y <= bounds.y + bounds.height);
}
/**
 * Gesture recognition helpers
 */
export const gestureHelpers = {
    isTap: (gesture, config = defaultGestureConfig) => {
        const duration = (gesture.endTime || Date.now()) - gesture.startTime;
        const movement = gesture.touches[0]
            ? getDistance({ x: gesture.touches[0].startX, y: gesture.touches[0].startY }, { x: gesture.touches[0].x, y: gesture.touches[0].y })
            : 0;
        return gesture.touches.length === 1 && duration <= config.tapDelay && movement <= config.tapMoveThreshold;
    },
    isLongPress: (gesture, config = defaultGestureConfig) => {
        const duration = Date.now() - gesture.startTime;
        const movement = gesture.touches[0]
            ? getDistance({ x: gesture.touches[0].startX, y: gesture.touches[0].startY }, { x: gesture.touches[0].x, y: gesture.touches[0].y })
            : 0;
        return (gesture.touches.length === 1 && duration >= config.longPressDelay && movement <= config.longPressMoveThreshold);
    },
    isSwipe: (gesture, config = defaultGestureConfig) => {
        if (gesture.touches.length !== 1 || !gesture.velocity)
            return false;
        const touch = gesture.touches[0];
        const distance = getDistance({ x: touch.startX, y: touch.startY }, { x: touch.x, y: touch.y });
        const velocity = Math.sqrt(gesture.velocity.x * gesture.velocity.x + gesture.velocity.y * gesture.velocity.y);
        return distance >= config.swipeThreshold && velocity >= config.swipeVelocity;
    },
    isPinch: (gesture, config = defaultGestureConfig) => {
        return (gesture.touches.length === 2 &&
            gesture.scale !== undefined &&
            Math.abs(gesture.scale - 1) >= config.pinchThreshold);
    },
};
//# sourceMappingURL=gestures.js.map