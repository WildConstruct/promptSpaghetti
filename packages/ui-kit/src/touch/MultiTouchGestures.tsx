/**
 * Multi-touch gesture handlers and shortcuts
 */

import React, { useRef, useCallback, useEffect } from 'react';
import { TouchManager } from './TouchManager';
import { GestureEvent, GestureType, SwipeDirection } from './gestures';
import { HapticFeedback } from './feedback';

export interface MultiTouchHandlers {
  // Two-finger gestures
  onTwoFingerTap?: () => void;
  onTwoFingerSwipe?: (direction: SwipeDirection) => void;
  onTwoFingerRotate?: (angle: number) => void;

  // Three-finger gestures
  onThreeFingerTap?: () => void;
  onThreeFingerSwipe?: (direction: SwipeDirection) => void;
  onThreeFingerPinch?: (scale: number) => void;

  // Four-finger gestures
  onFourFingerTap?: () => void;
  onFourFingerSwipe?: (direction: SwipeDirection) => void;

  // Gesture shortcuts
  onUndo?: () => void; // Two-finger right swipe
  onRedo?: () => void; // Two-finger left swipe
  onZoomReset?: () => void; // Two-finger double tap
  onSelectAll?: () => void; // Three-finger tap
  onDeselectAll?: () => void; // Three-finger double tap
  onShowMenu?: () => void; // Three-finger long press
  onToggleFullscreen?: () => void; // Four-finger tap
  onSwitchMode?: () => void; // Four-finger swipe
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
export const MultiTouchController: React.FC<MultiTouchControllerProps> = ({
  handlers,
  enableShortcuts = true,
  enableHaptics = true,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gestureHistoryRef = useRef<GestureEvent[]>([]);
  const haptic = useRef(HapticFeedback.getInstance());

  // Track multi-touch state
  const multiTouchStateRef = useRef({
    touchCount: 0,
    lastGesture: null as GestureType | null,
    lastGestureTime: 0,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const touchManager = new TouchManager({
      element: containerRef.current,
      config: {
        preventDefault: true,
        longPressDelay: 500,
      },
      handlers: {
        tap: handleMultiTouchTap,
        doubleTap: handleMultiTouchDoubleTap,
        longPress: handleMultiTouchLongPress,
        swipe: handleMultiTouchSwipe,
        pinch: handleMultiTouchPinch,
        rotate: handleMultiTouchRotate,
      },
    });

    return () => touchManager.destroy();
  }, [handlers, enableShortcuts]);

  const handleMultiTouchTap = useCallback(
    (event: GestureEvent) => {
      const touchCount = event.touches.length;

      // Update multi-touch state
      multiTouchStateRef.current = {
        touchCount,
        lastGesture: 'tap',
        lastGestureTime: Date.now(),
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
            if (enableHaptics) haptic.current.trigger('selection');
          }
          break;

        case 3:
          handlers.onThreeFingerTap?.();
          if (enableShortcuts) {
            handlers.onSelectAll?.();
            if (enableHaptics) haptic.current.trigger('success');
          }
          break;

        case 4:
          handlers.onFourFingerTap?.();
          if (enableShortcuts) {
            handlers.onToggleFullscreen?.();
            if (enableHaptics) haptic.current.trigger('heavy');
          }
          break;
      }
    },
    [handlers, enableShortcuts, enableHaptics]
  );

  const handleMultiTouchDoubleTap = useCallback(
    (event: GestureEvent) => {
      const touchCount = event.touches.length;

      switch (touchCount) {
        case 2:
          if (enableShortcuts) {
            handlers.onZoomReset?.();
            if (enableHaptics) haptic.current.trigger('medium');
          }
          break;

        case 3:
          if (enableShortcuts) {
            handlers.onDeselectAll?.();
            if (enableHaptics) haptic.current.trigger('light');
          }
          break;
      }
    },
    [handlers, enableShortcuts, enableHaptics]
  );

  const handleMultiTouchLongPress = useCallback(
    (event: GestureEvent) => {
      const touchCount = event.touches.length;

      if (touchCount === 3 && enableShortcuts) {
        handlers.onShowMenu?.();
        if (enableHaptics) haptic.current.trigger('heavy');
      }
    },
    [handlers, enableShortcuts, enableHaptics]
  );

  const handleMultiTouchSwipe = useCallback(
    (event: GestureEvent) => {
      const touchCount = event.touches.length;
      const direction = event.direction;

      if (!direction) return;

      switch (touchCount) {
        case 2:
          handlers.onTwoFingerSwipe?.(direction);

          if (enableShortcuts) {
            if (direction === 'right') {
              handlers.onUndo?.();
              if (enableHaptics) haptic.current.trigger('soft');
            } else if (direction === 'left') {
              handlers.onRedo?.();
              if (enableHaptics) haptic.current.trigger('soft');
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
            if (enableHaptics) haptic.current.trigger('rigid');
          }
          break;
      }
    },
    [handlers, enableShortcuts, enableHaptics]
  );

  const handleMultiTouchPinch = useCallback(
    (event: GestureEvent) => {
      if (event.touches.length === 3 && event.scale) {
        handlers.onThreeFingerPinch?.(event.scale);
      }
    },
    [handlers]
  );

  const handleMultiTouchRotate = useCallback(
    (event: GestureEvent) => {
      if (event.touches.length === 2 && event.rotation) {
        handlers.onTwoFingerRotate?.(event.rotation);
      }
    },
    [handlers]
  );

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        touchAction: 'none',
      }}
    >
      {children}
    </div>
  );
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
  toggleGrid: { fingers: 2, type: 'rotate', angle: '>45' },
} as const;

/**
 * Gesture combination detector
 */
export class GestureCombination {
  private gestures: GestureEvent[] = [];
  private timeWindow = 500; // ms
  private callbacks = new Map<string, () => void>();

  addGesture(gesture: GestureEvent): void {
    const now = Date.now();

    // Remove old gestures
    this.gestures = this.gestures.filter(g => now - g.touches[0].timestamp < this.timeWindow);

    // Add new gesture
    this.gestures.push(gesture);

    // Check for combinations
    this.checkCombinations();
  }

  onCombination(pattern: string, callback: () => void): void {
    this.callbacks.set(pattern, callback);
  }

  private checkCombinations(): void {
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

  clear(): void {
    this.gestures = [];
  }
}

/**
 * Touch gesture trainer component
 */
export interface GestureTrainerProps {
  onComplete?: () => void;
}

export const GestureTrainer: React.FC<GestureTrainerProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [completed, setCompleted] = React.useState<boolean[]>([]);

  const trainingSteps = [
    { gesture: 'tap', description: 'Tap to select' },
    { gesture: 'doubleTap', description: 'Double tap to edit' },
    { gesture: 'longPress', description: 'Long press for menu' },
    { gesture: 'swipe', description: 'Swipe to navigate' },
    { gesture: 'pinch', description: 'Pinch to zoom' },
    { gesture: 'twoFingerSwipe', description: 'Two-finger swipe to undo' },
    { gesture: 'threeFingerTap', description: 'Three-finger tap to select all' },
  ];

  return (
    <div className="gesture-trainer">
      <h3>Learn Touch Gestures</h3>
      <div className="training-steps">
        {trainingSteps.map((step, index) => (
          <div
            key={step.gesture}
            className={`training-step ${completed[index] ? 'completed' : ''} ${currentStep === index ? 'active' : ''}`}
          >
            <div className="step-icon">{completed[index] ? '✓' : index + 1}</div>
            <div className="step-description">{step.description}</div>
          </div>
        ))}
      </div>

      <div className="training-area">
        <MultiTouchController
          handlers={{
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
            },
          }}
        >
          <div className="gesture-practice-area">
            <p>Practice the gesture: {trainingSteps[currentStep]?.description}</p>
          </div>
        </MultiTouchController>
      </div>
    </div>
  );
};
