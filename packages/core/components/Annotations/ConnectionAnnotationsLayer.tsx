/**
 * Connection Annotations Layer Component
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 4
 * 
 * Management layer for connection annotations with label positioning along paths,
 * visual enhancements, and integration with React Flow edge system.
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useReactFlow, useEdges } from 'reactflow';
import { ConnectionLabel } from './ConnectionLabel';
import { useGraphStore } from '../../graphStore';
import { 
  ConnectionLabel as ConnectionLabelType,
  ConnectionAnnotation,
  ConnectionLabelAction,
  ConnectionAnnotationAction,
  ConnectionLabelPosition,
  CONNECTION_LABEL_STYLES,
  DEFAULT_CONNECTION_ANNOTATION_PREFERENCES
} from '../../types/CollaborationTypes';
}
interface ConnectionAnnotationsLayerProps {
  canEdit?: boolean;
  showTooltips?: boolean;
  visible?: boolean;
  onSelectionChange?: (selectedAnnotations: string[]) => void;
}
}

export const ConnectionAnnotationsLayer: React.FC<ConnectionAnnotationsLayerProps> = ({
  canEdit = true,
  showTooltips = true,
  visible = true,
  onSelectionChange
}) => {
  const reactFlowInstance = useReactFlow();
  const edges = useEdges();
  const { 
    annotations,
    connectionAnnotationPreferences,
    addConnectionLabel,
    updateConnectionLabel,
    removeConnectionLabel,
    addConnectionAnnotation,
    updateConnectionAnnotation
  } = useGraphStore();
  const [selectedAnnotations, setSelectedAnnotations] = useState<Set<string>>(new Set());
  const [highlightedConnection, setHighlightedConnection] = useState<string | null>(null);
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
  x: number;
  y: number;
  connectionId: string;
} | null>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  // Get connection path coordinates for label positioning
  const getConnectionPath = useCallback((connectionId: string) => {
  const edge = edges.find(e => e.id === connectionId);
  if (!edge) return null;
  const sourceNode = reactFlowInstance.getNode(edge.source);
  const targetNode = reactFlowInstance.getNode(edge.target);
  if (!sourceNode || !targetNode) return null;
  // Calculate connection path points
  const sourceCenter = {
  x: sourceNode.position.x + (sourceNode.width || 150) / 2,
  y: sourceNode.position.y + (sourceNode.height || 40) / 2,
};
    const targetCenter = {
  x: targetNode.position.x + (targetNode.width || 150) / 2,
  y: targetNode.position.y + (targetNode.height || 40) / 2,
};
    return {
      source: sourceCenter,
      target: targetCenter,
      path: `M ${sourceCenter.x},${sourceCenter.y} L ${targetCenter.x},${targetCenter.y}`}
    };
  }, [edges, reactFlowInstance]);
  // Calculate position along connection path
  const calculateLabelPosition = useCallback((;);
    connectionId: string,
    positionType: ConnectionLabelPosition,
    offset: number = 0.5) => {,
    const pathData = getConnectionPath(connectionId);
    if (!pathData) return { x: 0, y: 0 };
    const { source, target } = pathData;
    let t = offset; // Position along path (0-1);
    switch (positionType) {
      case 'start':
        t = 0.1;
        break;
      case 'middle':
        t = 0.5;
        break;
      case 'end':
        t = 0.9;
        break;
      case 'custom':
        t = Math.max(0, Math.min(1, offset));
        break;
    // Linear interpolation along path
    const x = source.x + (target.x - source.x) * t;
    const y = source.y + (target.y - source.y) * t;
    return { x, y };
  }, [getConnectionPath]);
  // Handle label actions
  const handleLabelAction = useCallback((action: ConnectionLabelAction) => {
    switch (action.type) {
      case 'create':
        if (action.connectionId && action.content) {
          const position = calculateLabelPosition(;);
            action.connectionId,
            'middle',
            0.5
          );
          const newLabel: ConnectionLabelType = {,
  id: `label-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`}
},
  connectionId: action.connectionId,
            content: action.content,
            position,
            positionType: 'middle',
            positionOffset: 0.5,
            style: connectionAnnotationPreferences?.defaultLabelStyle || 'default',
            visible: true,
            author: 'Current User',
            timestamp: new Date().toISOString(),
            lastModified: new Date().toISOString();
  };
          addConnectionLabel(newLabel);
        break;
      case 'update':
        if (action.labelId && action.label) {
  updateConnectionLabel(action.labelId, action.label);
  break;
  case 'delete':,
  if (action.labelId) {
  removeConnectionLabel(action.labelId);
  break;
  case 'move':,
  if (action.labelId && action.position) {
  updateConnectionLabel(action.labelId, {)
  position: action.position,
  positionType: 'custom',
  lastModified: new Date().toISOString(),
});
        break;
      case 'startEdit':
        // Handle edit state if needed
        break;
      case 'stopEdit':
        // Handle edit state if needed
        break;
  }, [
    addConnectionLabel,
    updateConnectionLabel,
    removeConnectionLabel,
    calculateLabelPosition,
    connectionAnnotationPreferences
  ]);
  // Handle connection right-click for context menu
  const handleConnectionContextMenu = useCallback((e: React.MouseEvent, connectionId: string) => {
  e.preventDefault();
  e.stopPropagation();
  const rect = layerRef.current?.getBoundingClientRect();
  if (!rect) return;
  setContextMenu({)
  x: e.clientX - rect.left,
  y: e.clientY - rect.top,
  connectionId
});
  }, []);
  // Handle context menu actions
  const handleContextMenuAction = useCallback((action: string, connectionId: string) => {
  setContextMenu(null);
  switch (action) {
  case 'addLabel':,
  handleLabelAction({)
  type: 'create',
  connectionId,
  content: 'New Label',
});
        break;
      case 'highlight':
        setHighlightedConnection(connectionId);
        setTimeout(() => setHighlightedConnection(null), 3000);
        break;
      case 'editStyle':
        // Open style editor (could be implemented as modal)
        break;
  }, [handleLabelAction]);
  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);
  // Handle keyboard shortcuts
  useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {,
  if (!canEdit) return;
  // Ctrl/Cmd + L: Add label to selected connection,
  if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
  e.preventDefault();
  if (highlightedConnection) {
  handleLabelAction({)
  type: 'create',
  connectionId: highlightedConnection,
  content: 'New Label',
});
      // Escape: Clear selection and context menu
      if (e.key === 'Escape') {
        setContextMenu(null);
        setSelectedAnnotations(new Set());
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canEdit, highlightedConnection, handleLabelAction]);
  // Update selection callback
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(Array.from(selectedAnnotations));
  }, [selectedAnnotations, onSelectionChange]);
  if (!visible) return null;
  return;
    <div
      ref={layerRef}
      data-testid="connection-annotations-layer"
      style={{
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 50,
}}
    >
      {/* SVG overlay for connection visual enhancements */}
      <svg
        ref={svgRef}
        style={{
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
}}
      >
        <defs>
          {/* Gradient definitions for enhanced connections */}
          <linearGradient id="connection-gradient-blue" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.4" />
          </linearGradient>
          {/* Animation definitions */}
          <style>
            {`
              @keyframes connection-flow {
                0% { stroke-dashoffset: 0; }
                100% { stroke-dashoffset: -20; }
              .connection-animated {
                animation: connection-flow 2s linear infinite;
              .connection-highlighted {
                filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
            `}
          </style>
        </defs>
        {/* Enhanced connection paths */}
        {edges.map(edge => {)
  const pathData = getConnectionPath(edge.id);
          const annotation = annotations.connectionAnnotations?.find(a => a.connectionId === edge.id);
          const isHighlighted = highlightedConnection === edge.id;
          if (!pathData || !annotation) return null;
          return;
            <g key={`enhanced-${edge.id}`}>}
              {/* Enhanced connection line */}
              <path
                d={pathData.path}
                stroke={annotation.color || '#6b7280'}
                strokeWidth={annotation.strokeWidth || 2}
                strokeOpacity={annotation.opacity || 1}
                strokeDasharray={
                  annotation.visualStyle === 'dashed' ? '8 4' :
                  annotation.visualStyle === 'dotted' ? '2 3' :
                  annotation.visualStyle === 'animated' ? '8 4' : 'none'
                className={`
                  ${annotation.visualStyle === 'animated' ? 'connection-animated' : ''}
                  ${isHighlighted ? 'connection-highlighted' : ''}
                `}
                fill="none"
                style={{ pointerEvents: 'stroke' }}
                onContextMenu={(e) => handleConnectionContextMenu(e, edge.id)}
              />
              {/* Direction arrows */}
              {annotation.showDirection && ()
                <polygon
                  points="0,-4 8,0 0,4"
                  fill={annotation.color || '#6b7280'}
                  transform={`translate(${pathData.target.x - 8}, ${pathData.target.y}) rotate(${)}
  }
                    Math.atan2()
                      pathData.target.y - pathData.source.y,
                      pathData.target.x - pathData.source.x
                    ) * 180 / Math.PI
                  })`}
                />
              )}
            </g>
          );
        })}
      </svg>
      {/* Connection Labels */}
      {annotations.connectionLabels?.map(label => ()
        <ConnectionLabel
          key={label.id}
          label={label}
          onAction={handleLabelAction}
          canEdit={canEdit}
          showTooltip={showTooltips}
          isHighlighted={selectedAnnotations.has(label.id)}
          connectionPath={getConnectionPath(label.connectionId)?.path}
        />
      ))}
      {/* Context Menu */}
      {contextMenu && ()
        <div
          data-testid="connection-context-menu"
          style={{
  position: 'absolute',
  left: contextMenu.x,
  top: contextMenu.y,
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  padding: '8px 0',
  minWidth: '180px',
  zIndex: 1000,
  pointerEvents: 'all',
}}
        >
          <button
            onClick={() => handleContextMenuAction('addLabel', contextMenu.connectionId)}
            style={{
  width: '100%',
  padding: '8px 16px',
  border: 'none',
  background: 'none',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: '14px',
  color: '#374151',
}}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none'
  }}
          >
            📝 Add Label
          </button>
          <button
            onClick={() => handleContextMenuAction('highlight', contextMenu.connectionId)}
            style={{
  width: '100%',
  padding: '8px 16px',
  border: 'none',
  background: 'none',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: '14px',
  color: '#374151',
}}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none'
  }}
          >
            ✨ Highlight
          </button>
          <button
            onClick={() => handleContextMenuAction('editStyle', contextMenu.connectionId)}
            style={{
  width: '100%',
  padding: '8px 16px',
  border: 'none',
  background: 'none',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: '14px',
  color: '#374151',
}}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none'
  }}
          >
            🎨 Edit Style
          </button>
        </div>
      )}
      {/* Instructions overlay when no labels exist */}
      {(!annotations.connectionLabels || annotations.connectionLabels.length === 0) && canEdit && ()
        <div
          style={{
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: 'rgba(255, 255, 255, 0.95)',
  border: '2px dashed #d1d5db',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center',
  maxWidth: '300px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  pointerEvents: 'all',
}}
        >
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔗</div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#374151' }}>
            Connection Annotations
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.4' }}>
            Right-click on connections to add labels and visual enhancements
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
            Keyboard: Ctrl+L to add label,
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionAnnotationsLayer;