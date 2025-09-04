/**
 * Simple ResizeHandles for FragmentContainer
 * Matches the props expected by FragmentContainer.tsx
 */

import React, { useRef } from 'react';

export interface FragmentResizeHandlesProps {
 width: number;
 height: number;
 minWidth: number;
 minHeight: number;
 onResize: (size: { width: number; height: number }) => void;
 onResizeStart?: () => void;
 onResizeEnd?: () => void;
}

export const ResizeHandles: React.FC<FragmentResizeHandlesProps> = ({
 width,
 height,
 minWidth,
 minHeight,
 onResize,
 onResizeStart,
 onResizeEnd,
}) => {
 const startRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

 const onMouseDown = (
 e: React.MouseEvent<HTMLDivElement>,
 direction: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'
 ) => {
 e.stopPropagation();
 e.preventDefault();

 startRef.current = { x: e.clientX, y: e.clientY, w: width, h: height };
 onResizeStart?.();

 const onMove = (ev: MouseEvent) => {
 if (!startRef.current) return;
 const dx = ev.clientX - startRef.current.x;
 const dy = ev.clientY - startRef.current.y;

 let newW = startRef.current.w;
 let newH = startRef.current.h;

 if (direction.includes('e')) newW = Math.max(minWidth, startRef.current.w + dx);
 if (direction.includes('w')) newW = Math.max(minWidth, startRef.current.w - dx);
 if (direction.includes('s')) newH = Math.max(minHeight, startRef.current.h + dy);
 if (direction.includes('n')) newH = Math.max(minHeight, startRef.current.h - dy);

 onResize({ width: newW, height: newH });
 };

 const onUp = () => {
 startRef.current = null;
 document.removeEventListener('mousemove', onMove);
 document.removeEventListener('mouseup', onUp);
 onResizeEnd?.();
 };

 document.addEventListener('mousemove', onMove);
 document.addEventListener('mouseup', onUp);
 };

 const baseStyle: React.CSSProperties = {
 position: 'absolute',
 background: 'rgba(255, 255, 255, 0.9)',
 border: '1px solid rgba(0,0,0,0.25)',
 borderRadius: 2,
 zIndex: 2,
 };

 const cornerSize = 10;
 const edgeThickness = 6;

 return (
 <>
 {/* Corners */}
 <div
 className="nodrag resize-handle-nw"
 style={{ ...baseStyle, top: -5, left: -5, width: cornerSize, height: cornerSize, cursor: 'nwse-resize' }}
 onMouseDown={(e) => onMouseDown(e, 'nw')}
 onPointerDown={(e) => e.stopPropagation()}
 />
 <div
 className="nodrag resize-handle-ne"
 style={{ ...baseStyle, top: -5, right: -5, width: cornerSize, height: cornerSize, cursor: 'nesw-resize' }}
 onMouseDown={(e) => onMouseDown(e, 'ne')}
 onPointerDown={(e) => e.stopPropagation()}
 />
 <div
 className="nodrag resize-handle-sw"
 style={{ ...baseStyle, bottom: -5, left: -5, width: cornerSize, height: cornerSize, cursor: 'nesw-resize' }}
 onMouseDown={(e) => onMouseDown(e, 'sw')}
 onPointerDown={(e) => e.stopPropagation()}
 />
 <div
 className="nodrag resize-handle-se"
 style={{ ...baseStyle, bottom: -5, right: -5, width: cornerSize, height: cornerSize, cursor: 'nwse-resize' }}
 onMouseDown={(e) => onMouseDown(e, 'se')}
 onPointerDown={(e) => e.stopPropagation()}
 />

 {/* Edges */}
 <div
 className="nodrag resize-handle-n"
 style={{ ...baseStyle, top: -4, left: '50%', transform: 'translateX(-50%)', width: 40, height: edgeThickness, cursor: 'ns-resize' }}
 onMouseDown={(e) => onMouseDown(e, 'n')}
 onPointerDown={(e) => e.stopPropagation()}
 />
 <div
 className="nodrag resize-handle-s"
 style={{ ...baseStyle, bottom: -4, left: '50%', transform: 'translateX(-50%)', width: 40, height: edgeThickness, cursor: 'ns-resize' }}
 onMouseDown={(e) => onMouseDown(e, 's')}
 onPointerDown={(e) => e.stopPropagation()}
 />
 <div
 className="nodrag resize-handle-e"
 style={{ ...baseStyle, right: -4, top: '50%', transform: 'translateY(-50%)', width: edgeThickness, height: 40, cursor: 'ew-resize' }}
 onMouseDown={(e) => onMouseDown(e, 'e')}
 onPointerDown={(e) => e.stopPropagation()}
 />
 <div
 className="nodrag resize-handle-w"
 style={{ ...baseStyle, left: -4, top: '50%', transform: 'translateY(-50%)', width: edgeThickness, height: 40, cursor: 'ew-resize' }}
 onMouseDown={(e) => onMouseDown(e, 'w')}
 onPointerDown={(e) => e.stopPropagation()}
 />
 </>
 );
};

export default ResizeHandles;
