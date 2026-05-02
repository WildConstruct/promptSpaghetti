import { useState, useCallback, useRef, useEffect } from 'react';
import {
  readStoredNumberInRange,
  readStoredString,
  writeStoredString
} from '../utils/storage';

interface UseResizableOptions {
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  storageKey?: string;
  onResize?: (width: number) => void;
}

export function useResizable({
  initialWidth = 300,
  minWidth = 200,
  maxWidth = 600,
  storageKey = 'assetBrowser.panelWidth',
  onResize
}: UseResizableOptions = {}) {
  // Load saved width from localStorage
  const getSavedWidth = () => {
    return readStoredNumberInRange(
      storageKey,
      initialWidth,
      minWidth,
      maxWidth
    );
  };

  const [width, setWidth] = useState(getSavedWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return readStoredString('assetBrowser.collapsed') === 'true';
  });

  const resizeRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(width);

  // Save width to localStorage
  const saveWidth = useCallback(
    (newWidth: number) => {
      writeStoredString(storageKey, String(newWidth));
    },
    [storageKey]
  );

  // Handle resize start
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = width;
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    },
    [width]
  );

  // Handle resize move
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startXRef.current;
      const newWidth = Math.min(
        Math.max(startWidthRef.current + deltaX, minWidth),
        maxWidth
      );

      setWidth(newWidth);
      onResize?.(newWidth);
    },
    [isResizing, minWidth, maxWidth, onResize]
  );

  // Handle resize end
  const handleMouseUp = useCallback(() => {
    if (!isResizing) return;

    setIsResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    saveWidth(width);
  }, [isResizing, width, saveWidth]);

  // Toggle collapse
  const toggleCollapse = useCallback(() => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    writeStoredString('assetBrowser.collapsed', String(newCollapsed));
  }, [isCollapsed]);

  // Set up global mouse listeners
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Load saved state on mount
  useEffect(() => {
    const savedWidth = getSavedWidth();
    if (savedWidth !== width) {
      setWidth(savedWidth);
    }
  }, []);

  return {
    width: isCollapsed ? 0 : width,
    isResizing,
    isCollapsed,
    handleMouseDown,
    toggleCollapse,
    resizeRef
  };
}
