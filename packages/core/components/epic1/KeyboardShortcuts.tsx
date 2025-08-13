import React, { useEffect, useCallback, useState } from 'react';
import { useReactFlow, useKeyPress, useStore } from 'reactflow';
import { Node, Edge } from 'reactflow';
import type { EditableNodeData } from './nodes';

interface KeyboardShortcutsProps {
  onSave?: () => void;
  onLoad?: () => void;
  onExport?: () => void;
  onDelete?: (nodes: Node[]) => void;
  onDuplicate?: (nodes: Node[]) => void;
  onSelectAll?: () => void;
  onGroup?: (nodes: Node[]) => void;
  onUngroup?: (nodes: Node[]) => void;
  additionalHandlers?: Record<string, () => void>;
}

/**
 * Epic 1 Keyboard Shortcuts
 * Provides comprehensive keyboard navigation and control
 */
export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  onSave,
  onLoad,
  onExport,
  onDelete,
  onDuplicate,
  onSelectAll,
  onGroup,
  onUngroup,
  additionalHandlers = {},
}) => {
  const reactFlowInstance = useReactFlow();
  const [showHelp, setShowHelp] = useState(false);
  
  // Get selected nodes and edges from store with safety check
  const selectedNodes = useStore((state) => 
    state?.nodes?.filter(node => node.selected) || []
  );
  const selectedEdges = useStore((state) => 
    state?.edges?.filter(edge => edge.selected) || []
  );

  // Pan shortcuts (Arrow keys)
  const handlePan = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const viewport = reactFlowInstance.getViewport();
    const panDistance = 50;
    
    switch (direction) {
      case 'up':
        reactFlowInstance.setViewport({ 
          x: viewport.x, 
          y: viewport.y + panDistance, 
          zoom: viewport.zoom 
        });
        break;
      case 'down':
        reactFlowInstance.setViewport({ 
          x: viewport.x, 
          y: viewport.y - panDistance, 
          zoom: viewport.zoom 
        });
        break;
      case 'left':
        reactFlowInstance.setViewport({ 
          x: viewport.x + panDistance, 
          y: viewport.y, 
          zoom: viewport.zoom 
        });
        break;
      case 'right':
        reactFlowInstance.setViewport({ 
          x: viewport.x - panDistance, 
          y: viewport.y, 
          zoom: viewport.zoom 
        });
        break;
    }
  }, [reactFlowInstance]);

  // Zoom shortcuts
  const handleZoom = useCallback((zoomIn: boolean) => {
    const viewport = reactFlowInstance.getViewport();
    const zoomStep = 0.1;
    const newZoom = zoomIn 
      ? Math.min(viewport.zoom + zoomStep, 2) 
      : Math.max(viewport.zoom - zoomStep, 0.1);
    
    reactFlowInstance.setViewport({ 
      x: viewport.x, 
      y: viewport.y, 
      zoom: newZoom 
    });
  }, [reactFlowInstance]);

  // Fit view shortcut
  const handleFitView = useCallback(() => {
    reactFlowInstance.fitView({ 
      padding: 0.2
      // Removed duration to eliminate animation
    });
  }, [reactFlowInstance]);

  // Node navigation (Tab/Shift+Tab)
  const handleNodeNavigation = useCallback((forward: boolean) => {
    const nodes = reactFlowInstance.getNodes();
    const selectedNode = nodes.find(n => n.selected);
    
    if (!selectedNode && forward) {
      // Select first node
      if (nodes.length > 0) {
        reactFlowInstance.setNodes(nodes.map((n, i) => ({ 
          ...n, 
          selected: i === 0 
        })));
      }
    } else if (selectedNode) {
      const currentIndex = nodes.findIndex(n => n.id === selectedNode.id);
      const nextIndex = forward 
        ? (currentIndex + 1) % nodes.length 
        : (currentIndex - 1 + nodes.length) % nodes.length;
      
      reactFlowInstance.setNodes(nodes.map((n, i) => ({ 
        ...n, 
        selected: i === nextIndex 
      })));
    }
  }, [reactFlowInstance]);

  // Delete selected nodes and edges
  const handleDelete = useCallback(() => {
    // Handle node deletion
    if (selectedNodes.length > 0 && onDelete) {
      onDelete(selectedNodes);
    }
    
    // Handle edge deletion
    if (selectedEdges.length > 0) {
      const edgeIds = selectedEdges.map(e => e.id);
      reactFlowInstance.setEdges((edges) => edges.filter(e => !edgeIds.includes(e.id)));
    }
  }, [selectedNodes, selectedEdges, onDelete, reactFlowInstance]);

  // Duplicate selected nodes
  const handleDuplicate = useCallback(() => {
    if (selectedNodes.length > 0 && onDuplicate) {
      onDuplicate(selectedNodes);
    }
  }, [selectedNodes, onDuplicate]);

  // Select all nodes
  const handleSelectAll = useCallback(() => {
    // Always use reactFlow instance directly for immediate selection
    const nodes = reactFlowInstance.getNodes();
    const edges = reactFlowInstance.getEdges();
    reactFlowInstance.setNodes(nodes.map(n => ({ ...n, selected: true })));
    reactFlowInstance.setEdges(edges.map(e => ({ ...e, selected: true })));
    
    // Also call the callback if provided (for toast notification)
    if (onSelectAll) {
      onSelectAll();
    }
  }, [reactFlowInstance, onSelectAll]);

  // Main keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if we're in an input field
      const target = event.target as HTMLElement;
      const isInputField = ['INPUT', 'TEXTAREA'].includes(target.tagName);
      
      // For Cmd+A, ALWAYS handle it regardless of input field focus
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        // Clear any text selection
        if (window.getSelection) {
          window.getSelection()?.removeAllRanges();
        }
        
        handleSelectAll();
        return; // Exit early after handling Cmd+A
      }
      
      // Don't handle other shortcuts when typing in input fields
      if (isInputField && !event.metaKey && !event.ctrlKey) {
        return;
      }

      const key = event.key.toLowerCase();
      const hasCmd = event.metaKey || event.ctrlKey;
      const hasShift = event.shiftKey;
      const hasAlt = event.altKey;

      // Help menu
      if (key === '?' || (hasCmd && key === '/')) {
        event.preventDefault();
        setShowHelp(prev => !prev);
        return;
      }

      // File operations
      if (hasCmd && !hasShift && !hasAlt) {
        switch (key) {
          case 's':
            event.preventDefault();
            onSave?.();
            break;
          case 'o':
            event.preventDefault();
            onLoad?.();
            break;
          case 'e':
            event.preventDefault();
            onExport?.();
            break;
          // case 'a' handled above before this switch
          case 'd':
            event.preventDefault();
            handleDuplicate();
            break;
          case 'g':
            event.preventDefault();
            if (selectedNodes.length > 1 && onGroup) {
              onGroup(selectedNodes);
            }
            break;
        }
      }
      
      // Ungroup shortcut (Cmd/Ctrl+Shift+G)
      if (hasCmd && hasShift && !hasAlt) {
        if (key === 'g') {
          event.preventDefault();
          if (selectedNodes.length > 0 && onUngroup) {
            onUngroup(selectedNodes);
          }
        }
      }

      // Zoom controls
      if (hasCmd) {
        switch (key) {
          case '=':
          case '+':
            event.preventDefault();
            handleZoom(true);
            break;
          case '-':
          case '_':
            event.preventDefault();
            handleZoom(false);
            break;
          case '0':
            event.preventDefault();
            handleFitView();
            break;
        }
      }

      // Pan controls (arrow keys, no modifiers)
      if (!hasCmd && !hasShift && !hasAlt && !isInputField) {
        switch (key) {
          case 'arrowup':
            event.preventDefault();
            handlePan('up');
            break;
          case 'arrowdown':
            event.preventDefault();
            handlePan('down');
            break;
          case 'arrowleft':
            event.preventDefault();
            handlePan('left');
            break;
          case 'arrowright':
            event.preventDefault();
            handlePan('right');
            break;
        }
      }

      // Node navigation
      if (key === 'tab' && !hasCmd && !hasAlt) {
        event.preventDefault();
        handleNodeNavigation(!hasShift);
      }

      // Delete
      if ((key === 'delete' || key === 'backspace') && !isInputField) {
        event.preventDefault();
        handleDelete();
      }

      // Space for hand tool (pan mode)
      if (key === ' ' && !isInputField) {
        event.preventDefault();
        // React Flow handles space for pan mode automatically
      }

      // Check additional handlers
      if (additionalHandlers[key] && !isInputField) {
        event.preventDefault();
        additionalHandlers[key]();
      }
    };

    // Add listener in capture phase to intercept before other handlers
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [
    onSave,
    onLoad,
    onExport,
    handlePan,
    handleZoom,
    handleFitView,
    handleNodeNavigation,
    handleDelete,
    handleDuplicate,
    handleSelectAll,
    additionalHandlers,
  ]);

  // Help overlay
  if (showHelp) {
    return (
      <div className="epic1-keyboard-help-overlay" onClick={() => setShowHelp(false)}>
        <div className="epic1-keyboard-help-content" onClick={e => e.stopPropagation()}>
          <h2>Keyboard Shortcuts</h2>
          
          <div className="epic1-shortcuts-section">
            <h3>Navigation</h3>
            <div className="epic1-shortcut-row">
              <span className="epic1-shortcut-keys">Arrow Keys</span>
              <span className="epic1-shortcut-desc">Pan canvas</span>
            </div>
            <div className="epic1-shortcut-row">
              <span className="epic1-shortcut-keys">Space + Drag</span>
              <span className="epic1-shortcut-desc">Pan mode</span>
            </div>
            <div className="epic1-shortcut-row">
              <span className="epic1-shortcut-keys">Tab / Shift+Tab</span>
              <span className="epic1-shortcut-desc">Navigate between nodes</span>
            </div>
          </div>

          <div className="epic1-shortcuts-section">
            <h3>Zoom</h3>
            <div className="epic1-shortcut-row">
              <span className="epic1-shortcut-keys">⌘/Ctrl + Plus</span>
              <span className="epic1-shortcut-desc">Zoom in</span>
            </div>
            <div className="epic1-shortcut-row">
              <span className="epic1-shortcut-keys">⌘/Ctrl + Minus</span>
              <span className="epic1-shortcut-desc">Zoom out</span>
            </div>
            <div className="epic1-shortcut-row">
              <span className="epic1-shortcut-keys">⌘/Ctrl + 0</span>
              <span className="epic1-shortcut-desc">Fit to view</span>
            </div>
          </div>

          <div className="epic1-shortcuts-section">
            <h3>Editing</h3>
            <div className="epic1-shortcut-row">
              <span className="epic1-shortcut-keys">Click</span>
              <span className="epic1-shortcut-desc">Edit node</span>
            </div>
            <div className="epic1-shortcut-row">
              <span className="epic1-shortcut-keys">Enter</span>
              <span className="epic1-shortcut-desc">Confirm edit</span>
            </div>
            <div className="epic1-shortcut-row">
              <span className="epic1-shortcut-keys">Escape</span>
              <span className="epic1-shortcut-desc">Cancel edit</span>
            </div>
            <div className="epic1-shortcut-row">
              <span className="epic1-shortcut-keys">Delete/Backspace</span>
              <span className="epic1-shortcut-desc">Delete selected</span>
            </div>
          </div>

          <div className="epic1-shortcuts-section">
            <h3>Selection</h3>
            <div className="epic1-shortcut-row">
              <span className="epic1-shortcut-keys">⌘/Ctrl + A</span>
              <span className="epic1-shortcut-desc">Select all</span>
            </div>
            <div className="epic1-shortcut-row">
              <span className="epic1-shortcut-keys">⌘/Ctrl + D</span>
              <span className="epic1-shortcut-desc">Duplicate selected</span>
            </div>
          </div>

          <div className="epic1-shortcuts-section">
            <h3>File Operations</h3>
            <div className="epic1-shortcut-row">
              <span className="epic1-shortcut-keys">⌘/Ctrl + S</span>
              <span className="epic1-shortcut-desc">Save</span>
            </div>
            <div className="epic1-shortcut-row">
              <span className="epic1-shortcut-keys">⌘/Ctrl + O</span>
              <span className="epic1-shortcut-desc">Load/Open</span>
            </div>
            <div className="epic1-shortcut-row">
              <span className="epic1-shortcut-keys">⌘/Ctrl + E</span>
              <span className="epic1-shortcut-desc">Export</span>
            </div>
          </div>

          <button 
            className="epic1-help-close"
            onClick={() => setShowHelp(false)}
          >
            Close (Esc)
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default KeyboardShortcuts;