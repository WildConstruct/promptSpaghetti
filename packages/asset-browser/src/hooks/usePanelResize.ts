/**
 * Hook for resizable panel functionality with localStorage persistence
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  readStoredNumberInRange,
  writeStoredString
} from '../utils/storage';

interface UsePanelResizeOptions {
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  storageKey?: string;
  onResize?: (width: number) => void;
}

interface UsePanelResizeReturn {
  width: number;
  isResizing: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  setWidth: (width: number) => void;
  resetWidth: () => void;
}

export function usePanelResize({
  defaultWidth = 300,
  minWidth = 200,
  maxWidth = 600,
  storageKey = 'panelWidth',
  onResize
}: UsePanelResizeOptions = {}): UsePanelResizeReturn {
  // Load saved width from localStorage
  const getSavedWidth = () => {
    return readStoredNumberInRange(
      storageKey,
      defaultWidth,
      minWidth,
      maxWidth
    );
  };

  const [width, setWidthState] = useState(getSavedWidth);
  const [isResizing, setIsResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  // Save width to localStorage
  const saveWidth = useCallback(
    (newWidth: number) => {
      writeStoredString(storageKey, newWidth.toString());
    },
    [storageKey]
  );

  // Set width with constraints
  const setWidth = useCallback(
    (newWidth: number) => {
      const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setWidthState(constrainedWidth);
      saveWidth(constrainedWidth);
      onResize?.(constrainedWidth);
    },
    [minWidth, maxWidth, saveWidth, onResize]
  );

  // Reset to default width
  const resetWidth = useCallback(() => {
    setWidth(defaultWidth);
  }, [defaultWidth, setWidth]);

  // Handle mouse down on resize handle
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      startX.current = e.clientX;
      startWidth.current = width;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [width]
  );

  // Handle mouse move
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX.current;
      const newWidth = startWidth.current + deltaX;
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, setWidth]);

  // Load saved width on mount
  useEffect(() => {
    const saved = getSavedWidth();
    if (saved !== width) {
      setWidthState(saved);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    width,
    isResizing,
    handleMouseDown,
    setWidth,
    resetWidth
  };
}
