/**
 * Touch gesture definitions and types
 */

export type GestureType = 
  | 'tap'
  | 'doubleTap'
  | 'longPress'
  | 'swipe'
  | 'pan'
  | 'pinch'
  | 'rotate'
  | 'drag'
  | 'flick';

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
  center: { x: number; y: number };
  distance?: number;
  angle?: number;
  velocity?: { x: number; y: number };
  scale?: number;
  rotation?: number;
}

export interface GestureEvent {
  type: GestureType;
  target: EventTarget | null;
  touches: TouchPoint[];
  center: { x: number; y: number };
  deltaX: number;
  deltaY: number;
  distance: number;
  direction?: SwipeDirection;
  velocity?: { x: number; y: number };
  scale?: number;
  rotation?: number;
  preventDefault: () => void;
  stopPropagation: () => void;
}

export interface GestureConfig {
  // Tap configuration
  tapDelay: number;              // Max time for tap (ms)
  tapMoveThreshold: number;      // Max movement for tap (px)
  doubleTapDelay: number;        // Max time between taps (ms)
  
  // Long press configuration
  longPressDelay: number;        // Min time for long press (ms)
  longPressMoveThreshold: number; // Max movement during long press (px)
  
  // Swipe configuration
  swipeThreshold: number;        // Min distance for swipe (px)
  swipeVelocity: number;         // Min velocity for swipe (px/ms)
  
  // Pan configuration
  panThreshold: number;          // Min distance to start pan (px)
  
  // Pinch configuration
  pinchThreshold: number;        // Min scale change for pinch
  
  // General configuration
  preventDefault: boolean;       // Prevent default browser behavior
  stopPropagation: boolean;     // Stop event propagation
}

export const defaultGestureConfig: GestureConfig = {
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
  stopPropagation: false
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
} as const;

/**
 * Calculate distance between two points
 */
export function getDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate angle between two points
 */
export function getAngle(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
}

/**
 * Calculate center point of multiple touches
 */
export function getCenter(touches: TouchPoint[]): { x: number; y: number } {
  const sum = touches.reduce(
    (acc, touch) => ({
      x: acc.x + touch.x,
      y: acc.y + touch.y
    }),
    { x: 0, y: 0 }
  );
  
  return {
    x: sum.x / touches.length,
    y: sum.y / touches.length
  };
}

/**
 * Calculate velocity of movement
 */
export function getVelocity(
  start: { x: number; y: number; timestamp: number },
  end: { x: number; y: number; timestamp: number }
): { x: number; y: number } {
  const timeDiff = end.timestamp - start.timestamp;
  if (timeDiff === 0) return { x: 0, y: 0 };
  
  return {
    x: (end.x - start.x) / timeDiff,
    y: (end.y - start.y) / timeDiff
  };
}

/**
 * Determine swipe direction
 */
export function getSwipeDirection(
  deltaX: number,
  deltaY: number,
  threshold: number = 30
): SwipeDirection | null {
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  
  if (absX < threshold && absY < threshold) return null;
  
  if (absX > absY) {
    return deltaX > 0 ? 'right' : 'left';
  } else {
    return deltaY > 0 ? 'down' : 'up';
  }
}

/**
 * Calculate pinch scale
 */
export function getPinchScale(
  touches1: TouchPoint[],
  touches2: TouchPoint[]
): number {
  if (touches1.length < 2 || touches2.length < 2) return 1;
  
  const distance1 = getDistance(touches1[0], touches1[1]);
  const distance2 = getDistance(touches2[0], touches2[1]);
  
  return distance2 / distance1;
}

/**
 * Calculate rotation angle
 */
export function getRotation(
  touches1: TouchPoint[],
  touches2: TouchPoint[]
): number {
  if (touches1.length < 2 || touches2.length < 2) return 0;
  
  const angle1 = getAngle(touches1[0], touches1[1]);
  const angle2 = getAngle(touches2[0], touches2[1]);
  
  return angle2 - angle1;
}

/**
 * Check if gesture is within bounds
 */
export function isWithinBounds(
  point: { x: number; y: number },
  bounds: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
}

/**
 * Gesture recognition helpers
 */
export const gestureHelpers = {
  isTap: (gesture: GestureState, config = defaultGestureConfig): boolean => {
    const duration = (gesture.endTime || Date.now()) - gesture.startTime;
    const movement = gesture.touches[0] 
      ? getDistance(
          { x: gesture.touches[0].startX, y: gesture.touches[0].startY },
          { x: gesture.touches[0].x, y: gesture.touches[0].y }
        )
      : 0;
    
    return (
      gesture.touches.length === 1 &&
      duration <= config.tapDelay &&
      movement <= config.tapMoveThreshold
    );
  },
  
  isLongPress: (gesture: GestureState, config = defaultGestureConfig): boolean => {
    const duration = Date.now() - gesture.startTime;
    const movement = gesture.touches[0]
      ? getDistance(
          { x: gesture.touches[0].startX, y: gesture.touches[0].startY },
          { x: gesture.touches[0].x, y: gesture.touches[0].y }
        )
      : 0;
    
    return (
      gesture.touches.length === 1 &&
      duration >= config.longPressDelay &&
      movement <= config.longPressMoveThreshold
    );
  },
  
  isSwipe: (gesture: GestureState, config = defaultGestureConfig): boolean => {
    if (gesture.touches.length !== 1 || !gesture.velocity) return false;
    
    const touch = gesture.touches[0];
    const distance = getDistance(
      { x: touch.startX, y: touch.startY },
      { x: touch.x, y: touch.y }
    );
    
    const velocity = Math.sqrt(
      gesture.velocity.x * gesture.velocity.x +
      gesture.velocity.y * gesture.velocity.y
    );
    
    return (
      distance >= config.swipeThreshold &&
      velocity >= config.swipeVelocity
    );
  },
  
  isPinch: (gesture: GestureState, config = defaultGestureConfig): boolean => {
    return (
      gesture.touches.length === 2 &&
      gesture.scale !== undefined &&
      Math.abs(gesture.scale - 1) >= config.pinchThreshold
    );
  }
};