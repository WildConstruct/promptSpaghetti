// packages/core/components/Annotations/ConnectionAnnotations.tsx
// Epic 8.7 Task 4: Connection Annotations System
import React, { useState, useCallback, useMemo } from 'react';
import { Edge, getBezierPath, EdgeProps } from 'reactflow';

// Enhanced Edge interface with label support

export interface AnnotatedEdge extends Edge {
  label?: string;
  labelStyle?: {
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
  border?: string;
};
  labelPosition?: 'center' | 'start' | 'end' | number; // number represents percentage along path
  labelOffset?: { x: number; y: number };
  showLabel?: boolean;
  interactive?: boolean; // Whether label can be edited by clicking
interface ConnectionLabelProps {
  edge: AnnotatedEdge;
  x: number;
  y: number;
  onLabelChange?: (edgeId: string, newLabel: string) => void;
  onLabelStyleChange?: (edgeId: string, newStyle: AnnotatedEdge['labelStyle']) => void;
  // Floating connection label component
  export const ConnectionLabel: React.FC<ConnectionLabelProps> = ({,)
  edge,
  x,
  y,
  onLabelChange,
  onLabelStyleChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(edge.label || '');
  const labelStyle = useMemo(() => ({)
  fontSize: edge.labelStyle?.fontSize || 12,
    color: edge.labelStyle?.color || '#e2e8f0',
    backgroundColor: edge.labelStyle?.backgroundColor || 'rgba(45, 55, 72, 0.9)',
    padding: edge.labelStyle?.padding || 4,
    borderRadius: edge.labelStyle?.borderRadius || 4,
    border: edge.labelStyle?.border || '1px solid #4a5568',
    position: 'absolute' as const,
    transform: `translate(${x + (edge.labelOffset?.x || 0)}px, ${y + (edge.labelOffset?.y || 0)}px)`}
},
  transformOrigin: 'center center',
    cursor: edge.interactive ? 'text' : 'default',
    whiteSpace: 'nowrap' as const,
    userSelect: edge.interactive ? 'text' as const : 'none',
    zIndex: 1000,
    pointerEvents: 'all' as const,
    maxWidth: 200,
    textAlign: 'center' as const;
  }), [edge, x, y]);
  const handleClick = useCallback(() => {
    if (edge.interactive && !isEditing) {
      setIsEditing(true);
      setEditValue(edge.label || '');
  }, [edge.interactive, edge.label, isEditing]);
  const handleSubmit = useCallback(() => {
    if (onLabelChange && editValue.trim() !== edge.label) {
      onLabelChange(edge.id, editValue.trim());
    setIsEditing(false);
  }, [onLabelChange, edge.id, edge.label, editValue]);
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(edge.label || '');
  }, [handleSubmit, edge.label]);
  const handleBlur = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);
  if (!edge.showLabel || !edge.label) {
    return null;
  return;
    <div
      style={labelStyle}
      onClick={handleClick}
      onDoubleClick={handleClick}
    >
      {isEditing ? ()
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          autoFocus
          style={{
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: 'inherit',
  fontSize: 'inherit',
  textAlign: 'center',
  width: Math.max(60, editValue.length * 8 + 20),
  padding: 0,
}}
        />
      ) : ()
        <span>{edge.label}</span>
      )}
    </div>
  );
};

// Enhanced edge component with label support
interface AnnotatedEdgeComponentProps extends EdgeProps {
  data?: AnnotatedEdge;
  onLabelChange?: (edgeId: string, newLabel: string) => void;
  onLabelStyleChange?: (edgeId: string, newStyle: AnnotatedEdge['labelStyle']) => void;

export const AnnotatedEdgeComponent: React.FC<AnnotatedEdgeComponentProps> = ({)
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
  onLabelChange,
  onLabelStyleChange
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({)
  sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });
  // Calculate label position based on labelPosition setting
  const getLabelPosition = useCallback(() => {
    const annotatedEdge = data as AnnotatedEdge;
    if (!annotatedEdge?.labelPosition) return { x: labelX, y: labelY };
    let position = 0.5; // Default to center;
    if (typeof annotatedEdge.labelPosition === 'number') {
      position = Math.max(0, Math.min(1, annotatedEdge.labelPosition / 100));
    } else if (annotatedEdge.labelPosition === 'start') {
      position = 0.1;
    } else if (annotatedEdge.labelPosition === 'end') {
      position = 0.9;
    // Calculate position along the curve
    const deltaX = targetX - sourceX;
    const deltaY = targetY - sourceY;
    const x = sourceX + deltaX * position;
    const y = sourceY + deltaY * position;
    return { x, y };
  }, [data, labelX, labelY, sourceX, sourceY, targetX, targetY]);
  const { x: finalLabelX, y: finalLabelY } = getLabelPosition();
  return;
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {data && ()
        <ConnectionLabel
          edge={data as AnnotatedEdge}
          x={finalLabelX}
          y={finalLabelY}
          onLabelChange={onLabelChange}
          onLabelStyleChange={onLabelStyleChange}
        />
      )}
    </>
  );
};

// Connection label editing interface
interface ConnectionLabelEditorProps {
  edge: AnnotatedEdge | null;
  onUpdateEdge: (edgeId: string, updates: Partial<AnnotatedEdge>) => void;
  onClose: () => void;
  export const ConnectionLabelEditor: React.FC<ConnectionLabelEditorProps> = ({,)
  edge,
  onUpdateEdge,
  onClose
}) => {
  const [label, setLabel] = useState(edge?.label || '');
  const [fontSize, setFontSize] = useState(edge?.labelStyle?.fontSize || 12);
  const [color, setColor] = useState(edge?.labelStyle?.color || '#e2e8f0');
  const [backgroundColor, setBackgroundColor] = useState(edge?.labelStyle?.backgroundColor || 'rgba(45, 55, 72, 0.9)');
  const [labelPosition, setLabelPosition] = useState<string>()
  typeof edge?.labelPosition === 'number' ? edge.labelPosition.toString() : (edge?.labelPosition || 'center'));
  const [showLabel, setShowLabel] = useState(edge?.showLabel ?? true);
  const [interactive, setInteractive] = useState(edge?.interactive ?? true);
  const handleSubmit = useCallback(() => {
  if (!edge) return;
  const updates: Partial<AnnotatedEdge> = {,
  label: label.trim(),
  labelStyle: {
  ...edge.labelStyle,
  fontSize,
  color,
  backgroundColor
},
  labelPosition: labelPosition === 'center' || labelPosition === 'start' || labelPosition === 'end' ,
        ? labelPosition as 'center' | 'start' | 'end'
        : parseFloat(labelPosition) || 50,
      showLabel,
      interactive
    };
    onUpdateEdge(edge.id, updates);
    onClose();
  }, [edge, label, fontSize, color, backgroundColor, labelPosition, showLabel, interactive, onUpdateEdge, onClose]);
  if (!edge) return null;
  return;
    <div style={{
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: '#2d3748',
  border: '1px solid #4a5568',
  borderRadius: 8,
  padding: 20,
  zIndex: 2000,
  minWidth: 300,
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
}}>
      <h3 style={{ color: '#e2e8f0', marginBottom: 16, fontSize: 16 }}>
        Edit Connection Label
      </h3>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', color: '#e2e8f0', fontSize: 12, marginBottom: 4 }}>
          Label Text
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Enter connection description..."
          style={{
  width: '100%',
  padding: 8,
  background: '#1a202c',
  border: '1px solid #4a5568',
  borderRadius: 4,
  color: '#e2e8f0',
  fontSize: 12,
}}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ display: 'block', color: '#e2e8f0', fontSize: 12, marginBottom: 4 }}>
            Font Size
          </label>
          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value) || 12)}
            min="8"
            max="24"
            style={{
  width: '100%',
  padding: 6,
  background: '#1a202c',
  border: '1px solid #4a5568',
  borderRadius: 4,
  color: '#e2e8f0',
  fontSize: 12,
}}
          />
        </div>
        <div>
          <label style={{ display: 'block', color: '#e2e8f0', fontSize: 12, marginBottom: 4 }}>
            Position
          </label>
          <select
            value={labelPosition}
            onChange={(e) => setLabelPosition(e.target.value)}
            style={{
  width: '100%',
  padding: 6,
  background: '#1a202c',
  border: '1px solid #4a5568',
  borderRadius: 4,
  color: '#e2e8f0',
  fontSize: 12,
}}
          >
            <option value="start">Start</option>
            <option value="center">Center</option>
            <option value="end">End</option>
            <option value="25">25%</option>
            <option value="75">75%</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ display: 'block', color: '#e2e8f0', fontSize: 12, marginBottom: 4 }}>
            Text Color
          </label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{
  width: '100%',
  padding: 2,
  background: '#1a202c',
  border: '1px solid #4a5568',
  borderRadius: 4,
  height: 32,
}}
          />
        </div>
        <div>
          <label style={{ display: 'block', color: '#e2e8f0', fontSize: 12, marginBottom: 4 }}>
            Background
          </label>
          <input
            type="color"
            value={backgroundColor.includes('rgba') ? '#2d3748' : backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            style={{
  width: '100%',
  padding: 2,
  background: '#1a202c',
  border: '1px solid #4a5568',
  borderRadius: 4,
  height: 32,
}}
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', color: '#e2e8f0', fontSize: 12, gap: 6 }}>
          <input
            type="checkbox"
            checked={showLabel}
            onChange={(e) => setShowLabel(e.target.checked)}
          />
          Show Label
        </label>
        <label style={{ display: 'flex', alignItems: 'center', color: '#e2e8f0', fontSize: 12, gap: 6 }}>
          <input
            type="checkbox"
            checked={interactive}
            onChange={(e) => setInteractive(e.target.checked)}
          />
          Editable
        </label>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          onClick={onClose}
          style={{
  padding: '8px 16px',
  background: 'transparent',
  border: '1px solid #4a5568',
  borderRadius: 4,
  color: '#e2e8f0',
  cursor: 'pointer',
  fontSize: 12,
}}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          style={{
  padding: '8px 16px',
  background: '#4299e1',
  border: 'none',
  borderRadius: 4,
  color: 'white',
  cursor: 'pointer',
  fontSize: 12,
}}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

// Utility functions for connection annotations
export const createAnnotatedEdge = (baseEdge: Edge)
  label?: string,
  options?: Partial<AnnotatedEdge>
): AnnotatedEdge => ({)
  ...baseEdge,
  label: label || '',
  labelStyle: {
  fontSize: 12,
  color: '#e2e8f0',
  backgroundColor: 'rgba(45, 55, 72, 0.9)',
  padding: 4,
  borderRadius: 4,
  border: '1px solid #4a5568',
  ...options?.labelStyle
},
  labelPosition: options?.labelPosition || 'center',
  labelOffset: options?.labelOffset || { x: 0, y: -10 },
  showLabel: options?.showLabel ?? true,
  interactive: options?.interactive ?? true,
  ...options
});

export const updateEdgeLabel = (edges: AnnotatedEdge)
  edgeId: string,
  updates: Partial<AnnotatedEdge>): AnnotatedEdge => {,
  return edges.map(edge =>)
    edge.id === edgeId ? { ...edge, ...updates } : edge
  );
};

export const toggleEdgeLabel = (()
    edges: AnnotatedEdge,
    edgeId: string,
  ): AnnotatedEdge => {
  return edges.map(edge =>)
    edge.id === edgeId 
      ? { ...edge, showLabel: !edge.showLabel } 
      : edge
  );
};

export const getEdgeCenter = (_____edge: Edge): { x: number; y: number } => {
  // This would need access to node positions to calculate properly
  // For now, return a placeholder - would be calculated in the actual component
  return { x: 0, y: 0 };
};

// Smart positioning to avoid label overlap
export const optimizeLabelPositions = (edges: AnnotatedEdge): AnnotatedEdge => {
  const positions = new Map<string, { x: number; y: number }>();
  return edges.map(edge => {)
  if (!edge.showLabel || !edge.label) return edge;
    // Basic collision detection and adjustment
    // In a real implementation, this would use spatial hashing or quadtree
    let offset = edge.labelOffset || { x: 0, y: -10 };
    let attempts = 0;
    const maxAttempts = 5;
    while (attempts < maxAttempts) {
      const posKey = `${Math.round(offset.x / 10)}_${Math.round(offset.y / 10)}`;}
      if (!positions.has(posKey)) {
        positions.set(posKey, { x: offset.x, y: offset.y });
        break;
      // Adjust position if collision detected
      offset = {
  x: offset.x + (Math.random() - 0.5) * 20,
  y: offset.y + (Math.random() - 0.5) * 20,
};
      attempts++;
    return { ...edge, labelOffset: offset };
  });
};