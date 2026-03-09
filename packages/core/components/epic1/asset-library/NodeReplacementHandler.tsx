/**
 * Node Replacement Handler
 * Handles drag-and-drop replacement of nodes from asset browser
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Node, useReactFlow } from 'reactflow';
import type { Preset } from './types';
import { findFragmentDropTarget } from '../services/FragmentDropTargeting';
import type { AgentFragmentRecord } from '@prompt/asset-browser';

export interface NodeReplacementHandlerProps {
  children: React.ReactNode;
  onNodeReplace?: (nodeId: string, preset: Preset) => void;
}

export const NodeReplacementHandler: React.FC<NodeReplacementHandlerProps> = ({ 
  children, 
  onNodeReplace 
}) => {
  const { getNodes, getEdges, setNodes, screenToFlowPosition } = useReactFlow();
  const [draggedOverNode, setDraggedOverNode] = useState<string | null>(null);

  const clearHoverState = useCallback(() => {
    document.querySelectorAll('.drop-hover, .node-replaceable').forEach(el => {
      el.classList.remove('drop-hover', 'node-replaceable');
    });
    setDraggedOverNode(null);
  }, []);

  // Handle drag over event
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (!e.dataTransfer) {
      return;
    }
    e.dataTransfer.dropEffect = 'copy';

    const presetData = e.dataTransfer.getData('application/x-preset');
    if (!presetData) {
      if (draggedOverNode) {
        clearHoverState();
      }
      return;
    }

    try {
      const preset = JSON.parse(presetData) as Preset;
      const dropTarget = findFragmentDropTarget({
        pointer: screenToFlowPosition({
          x: e.clientX,
          y: e.clientY
        }),
        fragment: presetToAgentFragmentRecord(preset),
        nodes: getNodes(),
        edges: getEdges()
      });

      if (dropTarget.kind !== 'replace-node') {
        if (draggedOverNode) {
          clearHoverState();
        }
        return;
      }

      if (dropTarget.nodeId === draggedOverNode) {
        return;
      }

      clearHoverState();

      const nodeElement = document.querySelector(
        `.react-flow__node[data-id="${dropTarget.nodeId}"]`
      );

      if (nodeElement instanceof HTMLElement) {
        setDraggedOverNode(dropTarget.nodeId);
        nodeElement.classList.add('node-replaceable', 'drop-hover');
      }
    } catch {
      if (draggedOverNode) {
        clearHoverState();
      }
    }
  }, [clearHoverState, draggedOverNode, getEdges, getNodes, screenToFlowPosition]);

  // Handle drag leave event
  const handleDragLeave = useCallback((e: DragEvent) => {
    const target = e.target as HTMLElement;
    const nodeElement = target.closest('.react-flow__node');
    
    if (nodeElement) {
      nodeElement.classList.remove('drop-hover');
    }
  }, []);

  // Handle drop event
  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();

    try {
      if (!e.dataTransfer) {
        return;
      }
      const presetData = e.dataTransfer.getData('application/x-preset');
      if (!presetData) {return;}

      const preset = JSON.parse(presetData) as Preset;
      const dropTarget = findFragmentDropTarget({
        pointer: screenToFlowPosition({
          x: e.clientX,
          y: e.clientY
        }),
        fragment: presetToAgentFragmentRecord(preset),
        nodes: getNodes(),
        edges: getEdges()
      });

      if (dropTarget.kind !== 'replace-node') {
        return;
      }

      const nodeId = dropTarget.nodeId;
      const nodes = getNodes();
      const nodeToReplace = nodes.find(n => n.id === nodeId);
      
      if (nodeToReplace) {
        const newNode: Node = {
          ...nodeToReplace,
          type: mapPresetTypeToNodeType(preset.type),
          data: {
            ...nodeToReplace.data,
            label: preset.name,
            preset: preset,
            ...extractPresetData(preset)
          }
        };
        
        setNodes(currentNodes =>
          currentNodes.map(n => (n.id === nodeId ? newNode : n))
        );
        
        const nodeElement = document.querySelector(
          `.react-flow__node[data-id="${nodeId}"]`
        );
        if (nodeElement instanceof HTMLElement) {
          nodeElement.classList.add('node-replacement-success');
          setTimeout(() => {
            nodeElement.classList.remove(
              'node-replacement-success',
              'node-replaceable',
              'drop-hover'
            );
          }, 600);
        }
        
        if (onNodeReplace) {
          onNodeReplace(nodeId, preset);
        }
        
        console.log(`Replaced node ${nodeId} with preset ${preset.name}`);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    } finally {
      clearHoverState();
    }
  }, [clearHoverState, getEdges, getNodes, onNodeReplace, screenToFlowPosition, setNodes]);

  // Set up event listeners
  useEffect(() => {
    const container = document.querySelector('.react-flow');
    if (!container) {return;}

    // Use proper event listener typing
    const dragOverHandler = handleDragOver as EventListener;
    const dragLeaveHandler = handleDragLeave as EventListener;
    const dropHandler = handleDrop as EventListener;

    container.addEventListener('dragover', dragOverHandler);
    container.addEventListener('dragleave', dragLeaveHandler);
    container.addEventListener('drop', dropHandler);

    return () => {
      container.removeEventListener('dragover', dragOverHandler);
      container.removeEventListener('dragleave', dragLeaveHandler);
      container.removeEventListener('drop', dropHandler);
      
      // Clean up any remaining hover states
      clearHoverState();
    };
  }, [clearHoverState, handleDragOver, handleDragLeave, handleDrop]);

  return <>{children}</>;
};

/**
 * Map preset type to React Flow node type
 */
function mapPresetTypeToNodeType(presetType: string): string {
  const typeMap: Record<string, string> = {
    'SIMPLE': 'weightedChoice',
    'CONTEXTUAL': 'conditional',
    'MULTI-ASPECT': 'concat',
    'PATTERN': 'sequential',
    'textBlock': 'output',
    'weightedChoice': 'weightedChoice',
    'concat': 'concat',
    'variable': 'variable',
    'output': 'output'
  };
  
  return typeMap[presetType] || 'output';
}

/**
 * Extract relevant data from preset for node
 */
function extractPresetData(preset: Preset): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  
  const { metadata, tags } = preset;

  if (metadata) {
    if (typeof metadata.options === 'number' && metadata.options > 0) {
      data.options = Array.from({ length: metadata.options }, (_, i) => ({
        id: `option-${i}`,
        text: `Option ${i + 1}`,
        weight: 1
      }));
    }
    
    if (metadata.combinations !== undefined) {
      data.combinations = metadata.combinations;
    }
    
    if (typeof metadata.file === 'string') {
      data.sourceFile = metadata.file;
    }
  }
  
  if (tags?.length) {
    data.tags = tags;
  }
  
  return data;
}

function presetToAgentFragmentRecord(preset: Preset): AgentFragmentRecord {
  return {
    id: preset.id,
    name: preset.name,
    path: typeof preset.metadata?.file === 'string' ? preset.metadata.file : '',
    category: preset.category ?? 'uncategorized',
    description: preset.metadata?.description,
    tags: preset.tags ?? [],
    roles: [],
    domains: [],
    nodeTypes: preset.nodeType
      ? [
          (preset.nodeType === 'concat'
            ? 'merge'
            : preset.nodeType) as AgentFragmentRecord['nodeTypes'][number]
        ]
      : [],
    placementHints: [],
    tone: [],
    nodeCount: 1,
    priority: 0
  };
}

// CSS for node replacement effects
const styles = `
.node-replaceable {
  transition: all 0.2s ease;
}

.node-replaceable.drop-hover {
  transform: scale(1.05);
  filter: brightness(1.1);
}

.node-replacement-success {
  animation: successPulse 0.6s ease;
}

@keyframes successPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); filter: brightness(1.2); }
  100% { transform: scale(1); }
}
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('node-replacement-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'node-replacement-styles';
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
