import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';

interface DroppableCanvasProps {
  children: React.ReactNode;
  onDrop: (type: string, position: { x: number; y: number }) => void;
  reactFlowInstance?: any;
}

export const DroppableCanvas: React.FC<DroppableCanvasProps> = ({ 
  children, 
  onDrop,
  reactFlowInstance 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'new-node',
    drop: (item: { nodeType: string }, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (clientOffset && containerRef.current) {
        const bounds = containerRef.current.getBoundingClientRect();
        
        // Calculate position relative to canvas
        const x = clientOffset.x - bounds.left;
        const y = clientOffset.y - bounds.top;

        // If we have a reactFlowInstance, use it to project coordinates
        const position = reactFlowInstance 
          ? reactFlowInstance.project({ x, y })
          : { x, y };

        onDrop(item.nodeType, position);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }), [reactFlowInstance, onDrop]);

  // Combine refs
  const setRefs = (el: HTMLDivElement | null) => {
    drop(el);
    containerRef.current = el;
  };

  return (
    <div 
      ref={setRefs} 
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative',
        // Only show drop indicator when actively dragging a new node
        background: isOver && canDrop ? 'rgba(33, 150, 243, 0.05)' : 'transparent',
        transition: 'background 0.2s ease',
        // Remove pointer-events manipulation - let children handle their own events
        // The drop zone will still work through react-dnd without blocking child interactions
      }}
    >
      {children}
    </div>
  );
};