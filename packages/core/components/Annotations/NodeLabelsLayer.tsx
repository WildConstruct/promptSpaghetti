/**
 * Node Labels Layer Component
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 2
 * 
 * Management layer for all node labels on the canvas, handling
 * label creation, updates, display modes, and ensuring proper
 * integration with the node system.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Node } from 'reactflow';
import { NodeLabel } from './NodeLabel';
import { 
  NodeLabelConfig, 
  NodeLabelAction,
  NodeLabelPreferences,
  DEFAULT_NODE_LABEL_PREFERENCES
} from '../../types/CollaborationTypes';

interface NodeLabelsLayerProps {
  nodes: Node[];
  labelConfigs: Record<string, NodeLabelConfig>;
  onLabelConfigsChange: (configs: Record<string, NodeLabelConfig>) => void;
  labelPreferences?: NodeLabelPreferences;
  selectedNodeId?: string | null;
  hoveredNodeId?: string | null;
  focusedNodeId?: string | null;
  author?: string;
  readOnly?: boolean;
  canvasOffset?: { x: number; y: number };
  zoom?: number;
}

export const NodeLabelsLayer: React.FC<NodeLabelsLayerProps> = ({
  nodes,
  labelConfigs,
  onLabelConfigsChange,
  labelPreferences = DEFAULT_NODE_LABEL_PREFERENCES,
  selectedNodeId = null,
  hoveredNodeId = null,
  focusedNodeId = null,
  author = 'Anonymous',
  readOnly = false,
  canvasOffset = { x: 0, y: 0 },
  zoom = 1
}) => {
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  // Generate unique ID for new labels
  const generateLabelId = useCallback((): string => {
    return `label_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Create label config for a node
  const createLabelConfig = useCallback((nodeId: string, customLabel: string = ''): NodeLabelConfig => {
    return {
      id: generateLabelId(),
      nodeId,
      customLabel,
      displayMode: labelPreferences.defaultDisplayMode,
      position: labelPreferences.defaultPosition,
      style: labelPreferences.defaultStyle,
      showIcon: false,
      truncateLength: labelPreferences.maxLabelLength,
      author,
      timestamp: new Date().toISOString()
    };
  }, [generateLabelId, labelPreferences, author]);

  // Handle label actions
  const handleLabelAction = useCallback((action: NodeLabelAction) => {
    const updatedConfigs = { ...labelConfigs };

    switch (action.type) {
      case 'create':
        if (!action.config && action.customLabel) {
          const newConfig = createLabelConfig(action.nodeId, action.customLabel);
          updatedConfigs[newConfig.id] = newConfig;
        } else if (action.config) {
          const newConfig = {
            ...createLabelConfig(action.nodeId),
            ...action.config,
            id: action.labelId || generateLabelId()
          };
          updatedConfigs[newConfig.id] = newConfig;
        }
        break;

      case 'update':
        if (action.labelId && updatedConfigs[action.labelId]) {
          updatedConfigs[action.labelId] = {
            ...updatedConfigs[action.labelId],
            ...action.config,
            timestamp: new Date().toISOString()
          };
          
          if (action.customLabel !== undefined) {
            updatedConfigs[action.labelId].customLabel = action.customLabel;
          }
        }
        break;

      case 'delete':
        if (action.labelId && updatedConfigs[action.labelId]) {
          delete updatedConfigs[action.labelId];
        }
        break;

      case 'startEdit':
        setEditingLabelId(action.labelId || null);
        if (action.labelId && updatedConfigs[action.labelId]) {
          updatedConfigs[action.labelId] = {
            ...updatedConfigs[action.labelId],
            isEditing: true
          };
        }
        break;

      case 'stopEdit':
        setEditingLabelId(null);
        if (action.labelId && updatedConfigs[action.labelId]) {
          updatedConfigs[action.labelId] = {
            ...updatedConfigs[action.labelId],
            isEditing: false
          };
        }
        break;
    }

    onLabelConfigsChange(updatedConfigs);
  }, [labelConfigs, onLabelConfigsChange, createLabelConfig, generateLabelId]);

  // Get or create label config for a node
  const getLabelConfigForNode = useCallback((nodeId: string): NodeLabelConfig | null => {
    // Find existing config for this node
    const existingConfig = Object.values(labelConfigs).find(config => config.nodeId === nodeId);
    if (existingConfig) {
      return existingConfig;
    }

    // If no custom label is set and we're in a mode that shows labels, return null
    // This allows nodes to use their built-in labels
    return null;
  }, [labelConfigs]);

  // Handle right-click to create/edit labels
  const handleContextMenu = useCallback((e: React.MouseEvent, nodeId: string) => {
    if (readOnly) return;
    
    e.preventDefault();
    e.stopPropagation();

    const existingConfig = getLabelConfigForNode(nodeId);
    
    if (existingConfig) {
      // Start editing existing label
      handleLabelAction({
        type: 'startEdit',
        nodeId,
        labelId: existingConfig.id
      });
    } else {
      // Create new label
      handleLabelAction({
        type: 'create',
        nodeId,
        customLabel: ''
      });
    }
  }, [readOnly, getLabelConfigForNode, handleLabelAction]);

  // Handle double-click on empty area near node to create quick label
  const handleQuickLabelCreate = useCallback((nodeId: string) => {
    if (readOnly) return;

    const existingConfig = getLabelConfigForNode(nodeId);
    if (!existingConfig) {
      const newConfig = createLabelConfig(nodeId, '');
      handleLabelAction({
        type: 'create',
        nodeId,
        config: { ...newConfig, isEditing: true }
      });
    }
  }, [readOnly, getLabelConfigForNode, createLabelConfig, handleLabelAction]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (readOnly || !selectedNodeId) return;

      // L key to add/edit label for selected node
      if (e.key === 'l' || e.key === 'L') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          
          const existingConfig = getLabelConfigForNode(selectedNodeId);
          if (existingConfig) {
            handleLabelAction({
              type: 'startEdit',
              nodeId: selectedNodeId,
              labelId: existingConfig.id
            });
          } else {
            handleQuickLabelCreate(selectedNodeId);
          }
        }
      }

      // Escape to cancel editing
      if (e.key === 'Escape' && editingLabelId) {
        handleLabelAction({
          type: 'stopEdit',
          nodeId: selectedNodeId,
          labelId: editingLabelId
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [readOnly, selectedNodeId, editingLabelId, getLabelConfigForNode, handleLabelAction, handleQuickLabelCreate]);

  // Get node position for label positioning
      if (!node) return { x: 0, y: 0 };
    
    return {
      x: node.position.x,
      y: node.position.y
    };
  }, [nodes]);

  return (
    <div
      ref={layerRef}
      data-testid="node-labels-layer"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // Allow graph interactions to pass through
        zIndex: 1500, // Above sticky notes but below modals
        overflow: 'visible'
      }}
    >
      {nodes.map(node => {
        const labelConfig = getLabelConfigForNode(node.id);
        
        // Show label if we have a custom config, or if the node should show its default label
        const shouldShowLabel = labelConfig || (
          labelPreferences.defaultDisplayMode === 'always' ||
          (labelPreferences.defaultDisplayMode === 'selected' && selectedNodeId === node.id) ||
          (labelPreferences.defaultDisplayMode === 'hover' && hoveredNodeId === node.id) ||
          (labelPreferences.defaultDisplayMode === 'focus' && focusedNodeId === node.id)
        );

        if (!shouldShowLabel) return null;

        // Use existing config or create a temporary one for built-in labels
        const effectiveConfig = labelConfig || {
          id: `temp-${node.id}`,
          nodeId: node.id,
          customLabel: '',
          displayMode: labelPreferences.defaultDisplayMode,
          position: labelPreferences.defaultPosition,
          style: labelPreferences.defaultStyle,
          showIcon: false,
          truncateLength: labelPreferences.maxLabelLength,
          author,
          timestamp: new Date().toISOString()
        };

        return (
          <div
            key={`label-container-${node.id}`}
            style={{
              position: 'absolute',
              left: node.position.x,
              top: node.position.y,
              width: node.width || 180,
              height: node.height || 90,
              pointerEvents: 'none'
            }}
            onContextMenu={(e) => handleContextMenu(e, node.id)}
          >
            <NodeLabel
              config={effectiveConfig}
              nodeId={node.id}
              currentNodeLabel={node.data?.label}
              onAction={handleLabelAction}
              displayMode={labelPreferences.defaultDisplayMode}
              isNodeSelected={selectedNodeId === node.id}
              isNodeHovered={hoveredNodeId === node.id}
              isNodeFocused={focusedNodeId === node.id}
              canEdit={!readOnly && labelPreferences.enableInlineEditing}
              showTooltip={labelPreferences.showLabelTooltips}
            />
          </div>
        );
      })}

      {/* Instructions overlay when no labels exist */}
      {Object.keys(labelConfigs).length === 0 && !readOnly && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '12px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            maxWidth: '200px',
            pointerEvents: 'all',
            zIndex: 2000,
            opacity: 0.7,
            transition: 'opacity 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.7';
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            Node Labels
          </div>
          <div style={{ lineHeight: 1.4 }}>
            • Press <kbd style={{ background: 'rgba(
              255,
              255,
              255,
              0.2
            )', padding: '2px 4px', borderRadius: '3px' }}>L</kbd> to label selected node
            <br />
            • Right-click node to add custom label
            <br />
            • Double-click labels to edit
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeLabelsLayer;