/**
 * Node Replacement Handler
 * Handles drag-and-drop replacement of nodes from asset browser
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Node, useReactFlow } from 'reactflow';

export interface NodeReplacementHandlerProps {
  children: React.ReactNode;
  onNodeReplace?: (nodeId: string, preset: any) => void;
}

export const NodeReplacementHandler: React.FC<NodeReplacementHandlerProps> = ({ 
  children, 
  onNodeReplace 
}) => {
  const { getNodes, setNodes, getEdges } = useReactFlow();
  const [draggedOverNode, setDraggedOverNode] = useState<string | null>(null);

  // Handle drag over event
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'copy';
    
    // Find if we're over a node
    const target = e.target as HTMLElement;
    const nodeElement = target.closest('.react-flow__node');
    
    if (nodeElement) {
      const nodeId = nodeElement.getAttribute('data-id');
      if (nodeId && nodeId !== draggedOverNode) {
        setDraggedOverNode(nodeId);
        nodeElement.classList.add('node-replaceable', 'drop-hover');
      }
    } else if (draggedOverNode) {
      // Clear hover state if not over a node
      document.querySelectorAll('.drop-hover').forEach(el => {
        el.classList.remove('drop-hover');
      });
      setDraggedOverNode(null);
    }
  }, [draggedOverNode]);

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
    
    // Clear all hover states
    document.querySelectorAll('.drop-hover').forEach(el => {
      el.classList.remove('drop-hover');
    });
    
    try {
      const presetData = e.dataTransfer!.getData('application/x-preset');
      if (!presetData) return;

      const preset = JSON.parse(presetData);
      const target = e.target as HTMLElement;
      const nodeElement = target.closest('.react-flow__node');
      
      if (nodeElement) {
        const nodeId = nodeElement.getAttribute('data-id');
        if (nodeId) {
          // Get the current node
          const nodes = getNodes();
          const nodeToReplace = nodes.find(n => n.id === nodeId);
          
          if (nodeToReplace) {
            // Create new node with same position and connections
            const newNode: Node = {
              ...nodeToReplace,
              type: mapPresetTypeToNodeType(preset.type),
              data: {
                ...nodeToReplace.data,
                label: preset.name,
                preset: preset,
                // Preserve any existing connections data
                ...extractPresetData(preset)
              }
            };
            
            // Update nodes
            setNodes(nodes => nodes.map(n => n.id === nodeId ? newNode : n));
            
            // Visual feedback
            nodeElement.classList.add('node-replacement-success');
            setTimeout(() => {
              nodeElement.classList.remove('node-replacement-success', 'node-replaceable');
            }, 600);
            
            // Notify parent
            if (onNodeReplace) {
              onNodeReplace(nodeId, preset);
            }
            
            console.log(`Replaced node ${nodeId} with preset ${preset.name}`);
          }
        }
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
    
    setDraggedOverNode(null);
  }, [getNodes, setNodes, onNodeReplace]);

  // Set up event listeners
  useEffect(() => {
    const container = document.querySelector('.react-flow');
    if (!container) return;

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
      document.querySelectorAll('.drop-hover, .node-replaceable').forEach(el => {
        el.classList.remove('drop-hover', 'node-replaceable');
      });
    };
  }, [handleDragOver, handleDragLeave, handleDrop]);

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
function extractPresetData(preset: any): Record<string, any> {
  const data: Record<string, any> = {};
  
  if (preset.metadata) {
    if (preset.metadata.options) {
      data.options = Array(preset.metadata.options).fill('').map((_, i) => ({
        id: `option-${i}`,
        text: `Option ${i + 1}`,
        weight: 1
      }));
    }
    
    if (preset.metadata.combinations) {
      data.combinations = preset.metadata.combinations;
    }
    
    if (preset.metadata.file) {
      data.sourceFile = preset.metadata.file;
    }
  }
  
  if (preset.tags) {
    data.tags = preset.tags;
  }
  
  return data;
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