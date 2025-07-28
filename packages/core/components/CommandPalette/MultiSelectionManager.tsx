/**
 * Professional Multi-Selection System for Graph Editor
 * Phase 2: Critical Professional Features Implementation
 * 
 * Cinema 4D-inspired multi-selection with professional visual feedback
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Node, Edge, useReactFlow } from 'reactflow';

export interface SelectionRect {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  active: boolean;
}
export interface MultiSelectionManagerProps {
  nodes: Node[];
  edges: Edge[];
  selectedNodes: Node[];
  selectedEdges: Edge[];
  onNodesSelect: (nodes: Node[]) => void;
  onEdgesSelect: (edges: Edge[]) => void;
  onSelectionChange: (selection: { nodes: Node[]; edges: Edge[] }) => void;
  theme?: 'light' | 'dark' | 'cinema';
  disabled?: boolean;
}
export const MultiSelectionManager: React.FC<MultiSelectionManagerProps> = ({
  nodes,
  edges,
  selectedNodes,
  selectedEdges,
  onNodesSelect,
  onEdgesSelect,
  onSelectionChange,
  theme = 'cinema',
  disabled = false
}) => {
  const [selectionRect, setSelectionRect] = useState<SelectionRect>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    active: false,
  });
  const [isSelecting, setIsSelecting] = useState(false);
  const [lastSelectedNode, setLastSelectedNode] = useState<Node | null>(null);
  const reactFlowInstance = useReactFlow();
  const selectionRef = useRef<HTMLDivElement>(null);
  // Keyboard shortcuts for selection operations
  useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
  if (disabled) return;
  // Select All (Cmd/Ctrl + A)
  if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
  e.preventDefault();
  handleSelectAll();
  }
  // Clear Selection (Escape)
  if (e.key === 'Escape') {
  e.preventDefault();
  handleClearSelection();
  }
  // Invert Selection (Cmd/Ctrl + I)
  if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
  e.preventDefault();
  handleInvertSelection();
  }
};
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [disabled, nodes, selectedNodes]);
  // Mouse event handlers for drag selection
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
  if (disabled || e.button !== 0) return; // Only handle left click
  const rect = e.currentTarget.getBoundingClientRect();
  const startX = e.clientX - rect.left;
  const startY = e.clientY - rect.top;
  setSelectionRect({
  startX,
  startY,
  currentX: startX,
  currentY: startY,
  active: true,
});
    setIsSelecting(true);
    // Prevent default to avoid text selection
    e.preventDefault();
  }, [disabled]);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    setSelectionRect(prev => ({
      ...prev,
      currentX,
      currentY
    }));
    // Update selection based on current rectangle
    updateSelectionFromRect(selectionRect.startX, selectionRect.startY, currentX, currentY);
  }, [isSelecting, disabled, selectionRect.startX, selectionRect.startY]);
  const handleMouseUp = useCallback(() => {
    if (!isSelecting || disabled) return;
    setIsSelecting(false);
    setSelectionRect(prev => ({ ...prev, active: false }));
  }, [isSelecting, disabled]);
  // Update selection based on rectangle coordinates
  const updateSelectionFromRect = useCallback((startX: number, startY: number, endX: number, endY: number) => {
    if (!reactFlowInstance) return;
    const viewport = reactFlowInstance.getViewport();
    // Convert screen coordinates to flow coordinates
    const flowStartX = (Math.min(startX, endX) - viewport.x) / viewport.zoom;
    const flowStartY = (Math.min(startY, endY) - viewport.y) / viewport.zoom;
    const flowEndX = (Math.max(startX, endX) - viewport.x) / viewport.zoom;
    const flowEndY = (Math.max(startY, endY) - viewport.y) / viewport.zoom;
    // Find nodes within selection rectangle
    const nodesInSelection = nodes.filter(node => {
      const nodeX = node.position.x;
      const nodeY = node.position.y;
      const nodeWidth = node.width || 200; // Default width
      const nodeHeight = node.height || 100; // Default height
      return (
        nodeX >= flowStartX &&
        nodeY >= flowStartY &&
        nodeX + nodeWidth <= flowEndX &&
        nodeY + nodeHeight <= flowEndY
      );
    });
    // Update selection
    onNodesSelect(nodesInSelection);
    onSelectionChange({ nodes: nodesInSelection, edges: selectedEdges });
  }, [reactFlowInstance, nodes, selectedEdges, onNodesSelect, onSelectionChange]);
  // Selection operations
  const handleSelectAll = useCallback(() => {
    onNodesSelect(nodes);
    onEdgesSelect(edges);
    onSelectionChange({ nodes, edges });
  }, [nodes, edges, onNodesSelect, onEdgesSelect, onSelectionChange]);
  const handleClearSelection = useCallback(() => {
    onNodesSelect([]);
    onEdgesSelect([]);
    onSelectionChange({ nodes: [], edges: [] });
    setLastSelectedNode(null);
  }, [onNodesSelect, onEdgesSelect, onSelectionChange]);
  const handleInvertSelection = useCallback(() => {
    const unselectedNodes = nodes.filter(node => 
      !selectedNodes.some(selected => selected.id === node.id)
    );
    const unselectedEdges = edges.filter(edge => 
      !selectedEdges.some(selected => selected.id === edge.id)
    );
    onNodesSelect(unselectedNodes);
    onEdgesSelect(unselectedEdges);
    onSelectionChange({ nodes: unselectedNodes, edges: unselectedEdges });
  }, [nodes, edges, selectedNodes, selectedEdges, onNodesSelect, onEdgesSelect, onSelectionChange]);

  // Handle individual node selection with modifiers
  const handleNodeSelection = useCallback((node: Node, event: MouseEvent) => {
    if (event.metaKey || event.ctrlKey) {
      // Toggle selection
      const isSelected = selectedNodes.some(n => n.id === node.id);
      let newSelection: Node[];
      if (isSelected) {
        newSelection = selectedNodes.filter(n => n.id !== node.id);
      } else {
        newSelection = [...selectedNodes, node];
      onNodesSelect(newSelection);
      onSelectionChange({ nodes: newSelection, edges: selectedEdges });
      setLastSelectedNode(node);
    } else if (event.shiftKey && lastSelectedNode) {
      // Range selection
      const startIndex = nodes.findIndex(n => n.id === lastSelectedNode.id);
      const endIndex = nodes.findIndex(n => n.id === node.id);
      if (startIndex !== -1 && endIndex !== -1) {
        const rangeStart = Math.min(startIndex, endIndex);
        const rangeEnd = Math.max(startIndex, endIndex);
        const rangeNodes = nodes.slice(rangeStart, rangeEnd + 1);
        // Combine with existing selection
        const newSelection = [...selectedNodes];
        rangeNodes.forEach(rangeNode => {
          if (!newSelection.some(n => n.id === rangeNode.id)) {
            newSelection.push(rangeNode);
          }
        });
        onNodesSelect(newSelection);
        onSelectionChange({ nodes: newSelection, edges: selectedEdges });
      }
    } else {
      // Single selection
      onNodesSelect([node]);
      onSelectionChange({ nodes: [node], edges: [] });
      setLastSelectedNode(node);
    }
  }, [disabled, selectedNodes, selectedEdges, lastSelectedNode, nodes, onNodesSelect, onSelectionChange]);
  // Theme styles
  const getThemeStyles = () => {
    const themes = {
      light: {
        selection: 'rgba(59, 130, 246, 0.2)',
        selectionBorder: '#3b82f6',
        background: '#ffffff',
        text: '#374151',
        accent: '#3b82f6',
      },
      dark: {
        selection: 'rgba(96, 165, 250, 0.2)',
        selectionBorder: '#60a5fa',
        background: '#1f2937',
        text: '#f9fafb',
        accent: '#60a5fa',
      },
      cinema: {
        selection: 'rgba(255, 124, 0, 0.15)',
        selectionBorder: 'var(--color-accent-orange)',
        background: 'var(--color-bg-secondary)',
        text: 'var(--color-text-primary)',
        accent: 'var(--color-accent-orange)',
      }
    };
    return themes[theme];
  };
  const styles = getThemeStyles();
  // Calculate selection rectangle for rendering
  const getSelectionRectStyle = () => {
    if (!selectionRect.active) return { display: 'none' };
    const left = Math.min(selectionRect.startX, selectionRect.currentX);
    const top = Math.min(selectionRect.startY, selectionRect.currentY);
    const width = Math.abs(selectionRect.currentX - selectionRect.startX);
    const height = Math.abs(selectionRect.currentY - selectionRect.startY);
    return {
      position: 'absolute' as const,
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
      background: styles.selection,
      border: `1px dashed ${styles.selectionBorder}`,
      borderRadius: '2px',
      pointerEvents: 'none' as const,
      zIndex: 1000,
      transition: 'none'
    };
  };
  return (
    <>
      {/* Selection Overlay */}
      <div
        ref={selectionRef}
        style={{
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 999,
  pointerEvents: disabled ? 'none' : 'auto',
}}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Selection Rectangle */}
        <div style={getSelectionRectStyle()} />
      </div>
      {/* Selection Info Panel */}
      {(selectedNodes.length > 0 || selectedEdges.length > 0) && (
        <SelectionInfoPanel
          selectedNodes={selectedNodes}
          selectedEdges={selectedEdges}
          onClearSelection={handleClearSelection}
          onSelectAll={handleSelectAll}
          onInvertSelection={handleInvertSelection}
          theme={theme}
        />
      )}
    </>
  );
};

// Selection Info Panel Component
interface SelectionInfoPanelProps {
  selectedNodes: Node[];
  selectedEdges: Edge[];
  onClearSelection: () => void;
  onSelectAll: () => void;
  onInvertSelection: () => void;
  theme: 'light' | 'dark' | 'cinema';
}

const SelectionInfoPanel: React.FC<SelectionInfoPanelProps> = ({
  selectedNodes,
  selectedEdges,
  onClearSelection,
  onSelectAll,
  onInvertSelection,
  theme
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const getThemeStyles = () => {
    const themes = {
      light: {
        background: '#ffffff',
        secondary: '#f8fafc',
        border: '#e5e7eb',
        text: '#374151',
        textSecondary: '#6b7280',
        accent: '#3b82f6',
        hover: '#f3f4f6',
      },
      dark: {
        background: '#1f2937',
        secondary: '#111827',
        border: '#4b5563',
        text: '#f9fafb',
        textSecondary: '#9ca3af',
        accent: '#60a5fa',
        hover: '#374151',
      },
      cinema: {
        background: 'var(--color-bg-secondary)',
        secondary: 'var(--color-bg-tertiary)',
        border: 'var(--color-ui-border)',
        text: 'var(--color-text-primary)',
        textSecondary: 'var(--color-text-secondary)',
        accent: 'var(--color-accent-orange)',
        hover: 'var(--color-ui-hover)',
      }
    };
    return themes[theme];
  };
  const styles = getThemeStyles();
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        background: styles.background,
        border: `1px solid ${styles.border}`}
},
  borderRadius: '8px',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 1001,
        minWidth: '280px',
        maxWidth: '400px',
        fontFamily: 'var(--font-family-primary)';
  }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          background: styles.secondary,
          borderBottom: `1px solid ${styles.border}`}
},
  borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer';
  }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}}>
          <span style={{ fontSize: '16px' }}>🎯</span>
          <div>
            <div style={{
  color: styles.text,
  fontSize: '14px',
  fontWeight: '600',
}}>
              Selection ({selectedNodes.length + selectedEdges.length})
            </div>
            <div style={{
  color: styles.textSecondary,
  fontSize: '12px',
}}>
              {selectedNodes.length} nodes, {selectedEdges.length} edges
            </div>
          </div>
        </div>
        <span style={{
  color: styles.textSecondary,
  fontSize: '12px',
  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
  transition: 'transform var(--transition-fast)',
}}>
          ▼
        </span>
      </div>
      {/* Expanded Content */}
      {isExpanded && ()
        <div style={{ padding: '16px' }}>
          {/* Selection Actions */}
          <div style={{
  display: 'flex',
  gap: '8px',
  marginBottom: '16px',
  flexWrap: 'wrap',
}}>
            <button
              onClick={onSelectAll}
              style={{
                padding: '6px 12px',
                background: styles.accent + '20',
                border: `1px solid ${styles.accent}`}
},
  borderRadius: '4px',
                color: styles.accent,
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)';
  }}
              title="Select All (⌘A)"
            >
              Select All
            </button>
            <button
              onClick={onInvertSelection}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                border: `1px solid ${styles.border}`}
},
  borderRadius: '4px',
                color: styles.text,
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)';
  }}
              title="Invert Selection (⌘I)"
            >
              Invert
            </button>
            <button
              onClick={onClearSelection}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                border: `1px solid ${styles.border}`}
},
  borderRadius: '4px',
                color: styles.text,
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)';
  }}
              title="Clear Selection (Esc)"
            >
              Clear
            </button>
          </div>
          {/* Selected Nodes List */}
          {selectedNodes.length > 0 && ()
            <div style={{ marginBottom: '12px' }}>
              <div style={{
  color: styles.textSecondary,
  fontSize: '12px',
  fontWeight: '500',
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}}>
                Selected Nodes
              </div>
              <div style={{
                maxHeight: '120px',
                overflowY: 'auto',
                border: `1px solid ${styles.border}`}
},
  borderRadius: '4px',
                background: styles.secondary;
  }}>
                {selectedNodes.map((node, index) => ()
                  <div
                    key={node.id}
                    style={{
                      padding: '8px 12px',
                      borderBottom: index < selectedNodes.length - 1 ? `1px solid ${styles.border}` : 'none'}
},
  display: 'flex',
                      alignItems: 'center',
                      gap: '8px';
  }}
                  >
                    <div style={{
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: styles.accent,
}} />
                    <div>
                      <div style={{
  color: styles.text,
  fontSize: '13px',
  fontWeight: '500',
}}>
                        {node.data?.label || node.id}
                      </div>
                      <div style={{
  color: styles.textSecondary,
  fontSize: '11px',
}}>
                        {node.type} • {Math.round(node.position.x)}, {Math.round(node.position.y)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Keyboard Shortcuts */}
          <div style={{
            padding: '8px 12px',
            background: styles.secondary,
            borderRadius: '4px',
            border: `1px solid ${styles.border}`}
          }}>
            <div style={{
  color: styles.textSecondary,
  fontSize: '11px',
  fontWeight: '500',
  marginBottom: '4px',
}}>
              Keyboard Shortcuts
            </div>
            <div style={{
  color: styles.textSecondary,
  fontSize: '10px',
  lineHeight: 1.4,
}}>
              ⌘A Select All • ⌘I Invert • Esc Clear<br />
              Click+Drag Rectangle Select • ⌘+Click Toggle<br />
              ⇧+Click Range Select
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectionManager;