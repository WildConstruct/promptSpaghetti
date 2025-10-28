// Drag and Drop Handler for Asset Browser
// Story 2.5a: Asset Browser Integration MVP

import React, { useEffect, useRef } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DragPerformanceMonitor } from '../../services/performanceMonitor';

export interface DraggedAsset {
  type: 'psg' | 'psglib';
  id: string;
  name: string;
  metadata?: {
    theme?: string;
    mood?: string;
    setting?: string;
    tags?: string[];
  };
  content: unknown;
}

export interface DropResult {
  position: { x: number; y: number };
  targetNode?: string;
  action: 'create' | 'replace' | 'add-choice';
}

interface DragDropHandlerProps {
  asset: DraggedAsset;
  onDrop?: (result: DropResult) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

const performanceMonitor = new DragPerformanceMonitor();

export const DragDropHandler: React.FC<DragDropHandlerProps> = ({
  asset,
  onDrop,
  children,
  disabled = false
}) => {
  const dragId = useRef<string>('');

  const [{ isDragging }, drag] = useDrag<DraggedAsset, DropResult | undefined, { isDragging: boolean}>({
    type: 'ASSET',
    item: () => {
      dragId.current = `drag-${Date.now()}`;
      performanceMonitor.startDragOperation(dragId.current);
      return asset;
    },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    }),
    canDrag: !disabled,
    end: (_, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult && onDrop) {
        performanceMonitor.recordDragEvent(dragId.current, 'drop');
        onDrop(dropResult);
      }
    }
  });

  // Create ghost preview
  useEffect(() => {
    if (isDragging) {
      const ghostEl = document.createElement('div');
      ghostEl.className = 'drag-ghost-preview';
      ghostEl.textContent = asset.name;
      ghostEl.style.cssText = `
        position: fixed;
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        border-radius: 4px;
        pointer-events: none;
        z-index: 10000;
        font-size: 12px;
        opacity: 0.9;
        border: 1px solid rgba(255, 255, 255, 0.2);
      `;
      document.body.appendChild(ghostEl);

      const handleMouseMove = (e: MouseEvent) => {
        ghostEl.style.left = `${e.clientX + 10}px`;
        ghostEl.style.top = `${e.clientY + 10}px`;
        performanceMonitor.recordDragEvent(dragId.current, 'hover');
      };

      document.addEventListener('mousemove', handleMouseMove);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        ghostEl.remove();
      };
    }
  }, [isDragging, asset.name]);

  return (
    <div
      ref={drag}
      className={`draggable-asset ${isDragging ? 'dragging' : ''}`}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'grab'
      }}
    >
      {children}
    </div>
  );
};

// Canvas Drop Target Component
export interface CanvasDropTargetProps {
  onDrop: (
    asset: DraggedAsset,
    position: { x: number; y: number },
    targetNode?: string
  ) => void;
  onHover?: (isOver: boolean, canDrop: boolean) => void;
  children: React.ReactNode;
  acceptTypes?: DraggedAsset['type'][];
  // Optional integration hooks to support ACs
  onInvalidDrop?: (error: unknown) => void;
}

export const CanvasDropTarget: React.FC<CanvasDropTargetProps> = ({
  onDrop,
  onHover,
  children,
  acceptTypes = ['psg', 'psglib'],
  onInvalidDrop
}) => {
  const dropRef = useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop }, drop] = useDrop<DraggedAsset, DropResult | undefined, { isOver: boolean; canDrop: boolean }>({
    accept: 'ASSET',
    drop: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (clientOffset && dropRef.current) {
        const rect = dropRef.current.getBoundingClientRect();
        const position = {
          x: clientOffset.x - rect.left,
          y: clientOffset.y - rect.top
        };

        // Enforce 50px boundary rule
        const tooCloseToEdge =
          position.x < 50 ||
          position.y < 50 ||
          rect.width - position.x < 50 ||
          rect.height - position.y < 50;
        if (tooCloseToEdge) {
          onInvalidDrop?.({
            type: 'invalid_position',
            message:
              "Can't drop here - too close to edge. Move 50px inward or use grid snap (G key).",
            details: { requiredDistance: 50 }
          });
          return undefined;
        }

        // Detect target node at client coordinates
        const targetNode = getNodeAtClientPoint(clientOffset.x, clientOffset.y);
        onDrop(item, position, targetNode);

        return {
          position,
          targetNode,
          action: targetNode ? 'replace' : 'create'
        } as DropResult;
      }
    },
    canDrop: (item: DraggedAsset) => {
      return acceptTypes.includes(item.type);
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  });

  useEffect(() => {
    if (onHover) {
      onHover(isOver, canDrop);
    }
  }, [isOver, canDrop, onHover]);

  drop(dropRef);

  return (
    <div
      ref={dropRef}
      className={`canvas-drop-target ${isOver ? 'drag-over' : ''} ${canDrop ? 'can-drop' : ''}`}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative'
      }}
    >
      {children}
    </div>
  );
};

// Helper function to detect node at position
function getNodeAtClientPoint(
  clientX: number,
  clientY: number
): string | undefined {
  // Integrates with React Flow DOM to detect nodes under the cursor
  const elements = document.elementsFromPoint(clientX, clientY);
  const nodeElement = elements.find(el =>
    el.classList.contains('react-flow__node')
  );
  return nodeElement?.getAttribute('data-id') || undefined;
}

// Wrapper component to provide DnD context
export const AssetBrowserDndProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <DndProvider backend={HTML5Backend}>{children}</DndProvider>;
};
