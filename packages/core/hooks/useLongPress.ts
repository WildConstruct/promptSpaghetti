// Long Press Hook - Story 2.7
// Handles long-press gesture for mobile flip triggers

import { useRef, useCallback } from 'react';

interface UseLongPressOptions {
  threshold?: number; // ms before trigger
  cancelOnMovement?: number; // pixels of movement to cancel
  cancelEvents?: string[]; // events that cancel the long press
}

interface LongPressHandlers {
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchCancel: (e: React.TouchEvent) => void;
}

export const useLongPress = (
  callback: () => void,
  options: UseLongPressOptions = {}
): LongPressHandlers => {
  const { threshold = 500, cancelOnMovement = 3, cancelEvents = [] } = options;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startPositionRef = useRef<{ x: number; y: number } | null>(null);
  const isActiveRef = useRef(false);
  const cancelListenersRef = useRef<(() => void)[]>([]);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isActiveRef.current = false;
    startPositionRef.current = null;

    // Remove cancel event listeners
    cancelListenersRef.current.forEach(remove => remove());
    cancelListenersRef.current = [];
  }, []);

  const startLongPress = useCallback(
    (x: number, y: number) => {
      clearTimer();

      startPositionRef.current = { x, y };
      isActiveRef.current = true;

      // Add cancel event listeners
      const addCancelListener = (event: string) => {
        const handler = () => {
          if (isActiveRef.current) {
            clearTimer();
          }
        };

        document.addEventListener(event, handler, { passive: true });
        cancelListenersRef.current.push(() => {
          document.removeEventListener(event, handler);
        });
      };

      cancelEvents.forEach(addCancelListener);

      // Set up the long press timer
      timeoutRef.current = setTimeout(() => {
        if (isActiveRef.current) {
          callback();
          clearTimer();

          // Add visual feedback
          const element = document.elementFromPoint(x, y);
          if (element) {
            element.setAttribute('data-long-press', 'true');
            setTimeout(() => {
              element.removeAttribute('data-long-press');
            }, 500);
          }
        }
      }, threshold);
    },
    [callback, threshold, cancelEvents, clearTimer]
  );

  const checkMovement = useCallback(
    (x: number, y: number) => {
      if (!isActiveRef.current || !startPositionRef.current) return;

      const deltaX = Math.abs(x - startPositionRef.current.x);
      const deltaY = Math.abs(y - startPositionRef.current.y);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > cancelOnMovement) {
        clearTimer();
      }
    },
    [cancelOnMovement, clearTimer]
  );

  // Mouse handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only trigger on primary button
      if (e.button !== 0) return;

      startLongPress(e.clientX, e.clientY);
    },
    [startLongPress]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      clearTimer();
    },
    [clearTimer]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      checkMovement(e.clientX, e.clientY);
    },
    [checkMovement]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      clearTimer();
    },
    [clearTimer]
  );

  // Touch handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      // Prevent mouse events
      e.preventDefault();

      const touch = e.touches[0];
      if (touch) {
        startLongPress(touch.clientX, touch.clientY);
      }
    },
    [startLongPress]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      clearTimer();
    },
    [clearTimer]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        checkMovement(touch.clientX, touch.clientY);
      }
    },
    [checkMovement]
  );

  const handleTouchCancel = useCallback(
    (e: React.TouchEvent) => {
      clearTimer();
    },
    [clearTimer]
  );

  return {
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
    onTouchCancel: handleTouchCancel
  };
};
