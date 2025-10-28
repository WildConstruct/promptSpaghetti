import { useState, useCallback, useRef, useEffect } from 'react';

interface Column {
  id: string;
  minWidth: number;
  defaultWidth: number;
  maxWidth?: number;
}

interface UseColumnResizeOptions {
  columns: Column[];
  storageKey?: string;
  onWidthChange?: (columnId: string, width: number) => void;
}

export function useColumnResize({
  columns,
  storageKey = 'assetBrowser.columnWidths',
  onWidthChange
}: UseColumnResizeOptions) {
  // Load saved widths from localStorage
  const getSavedWidths = (): Record<string, number> => {
    if (typeof window === 'undefined') return {};

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Invalid JSON, return empty
      }
    }

    // Return default widths
    const defaults: Record<string, number> = {};
    columns.forEach(column => {
      defaults[column.id] = column.defaultWidth;
    });
    return defaults;
  };

  const [columnWidths, setColumnWidths] =
    useState<Record<string, number>>(getSavedWidths);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);

  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(0);

  // Save widths to localStorage
  const saveWidths = useCallback(
    (widths: Record<string, number>) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(widths));
      }
    },
    [storageKey]
  );

  // Handle resize start
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, columnId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setResizingColumn(columnId);
      dragStartXRef.current = e.clientX;
      dragStartWidthRef.current = columnWidths[columnId] || 200;

      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    },
    [columnWidths]
  );

  // Handle resize move
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizingColumn) return;

      const column = columns.find(c => c.id === resizingColumn);
      if (!column) return;

      const deltaX = e.clientX - dragStartXRef.current;
      let newWidth = dragStartWidthRef.current + deltaX;

      // Apply min/max constraints
      newWidth = Math.max(newWidth, column.minWidth);
      if (column.maxWidth) {
        newWidth = Math.min(newWidth, column.maxWidth);
      }

      setColumnWidths(prev => ({
        ...prev,
        [resizingColumn]: newWidth
      }));

      onWidthChange?.(resizingColumn, newWidth);
    },
    [resizingColumn, columns, onWidthChange]
  );

  // Handle resize end
  const handleMouseUp = useCallback(() => {
    if (!resizingColumn) return;

    setResizingColumn(null);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    saveWidths(columnWidths);
  }, [resizingColumn, columnWidths, saveWidths]);

  // Get column width
  const getColumnWidth = useCallback(
    (columnId: string): number => {
      return (
        columnWidths[columnId] ||
        columns.find(c => c.id === columnId)?.defaultWidth ||
        200
      );
    },
    [columnWidths, columns]
  );

  // Set up global mouse listeners
  useEffect(() => {
    if (resizingColumn) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizingColumn, handleMouseMove, handleMouseUp]);

  // Initialize widths for new columns
  useEffect(() => {
    const currentIds = Object.keys(columnWidths);
    const newColumns = columns.filter(c => !currentIds.includes(c.id));

    if (newColumns.length > 0) {
      setColumnWidths(prev => {
        const updated = { ...prev };
        newColumns.forEach(column => {
          updated[column.id] = column.defaultWidth;
        });
        return updated;
      });
    }
  }, [columns]);

  return {
    getColumnWidth,
    handleResizeStart,
    isResizing: resizingColumn !== null,
    resizingColumn
  };
}
