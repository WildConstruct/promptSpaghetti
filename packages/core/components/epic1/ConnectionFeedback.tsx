import React, { useEffect, useState } from 'react';
import { useStore, Node, Edge } from 'reactflow';
import { connectionValidator } from './validation/ConnectionValidator';
import type { EditableNodeData } from './nodes';
import './ConnectionFeedback.css';

interface ConnectionFeedbackProps {
  nodes: Node<EditableNodeData>[];
  edges: Edge[];
}

/**
 * Visual feedback component for connection validation
 * Shows valid/invalid drop zones while dragging connections
 */
export const ConnectionFeedback: React.FC<ConnectionFeedbackProps> = ({ nodes, edges }) => {
  const [connectingNodeId, setConnectingNodeId] = useState<string | null>(null);
  const [validTargets, setValidTargets] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Subscribe to React Flow connection state
  const connectionNodeId = useStore((state) => state.connectionNodeId);
  const connectionHandleType = useStore((state) => state.connectionHandleType);

  useEffect(() => {
    if (connectionNodeId && connectionHandleType === 'source') {
      // User is dragging from a source handle
      const sourceNode = nodes.find(n => n.id === connectionNodeId);
      
      if (sourceNode) {
        setConnectingNodeId(connectionNodeId);
        
        // Get valid target types
        const validTargetTypes = connectionValidator.getValidTargets(sourceNode);
        
        // Find all nodes that are valid targets
        const validTargetIds = new Set<string>();
        nodes.forEach(node => {
          if (node.id !== connectionNodeId && node.type && validTargetTypes.includes(node.type)) {
            // Additional validation
            const result = connectionValidator.validateConnection(
              { source: connectionNodeId, target: node.id },
              nodes,
              edges
            );
            
            if (result.isValid) {
              validTargetIds.add(node.id);
            }
          }
        });
        
        setValidTargets(validTargetIds);
        
        // Set error message if source cannot connect to anything
        if (validTargetIds.size === 0) {
          const sourceType = sourceNode.type || 'default';
          if (sourceType === 'output') {
            setErrorMessage('Output nodes cannot have outgoing connections');
          } else {
            setErrorMessage('No valid targets available');
          }
        }
      }
    } else {
      // Not connecting, clear state
      setConnectingNodeId(null);
      setValidTargets(new Set());
      setErrorMessage('');
    }
  }, [connectionNodeId, connectionHandleType, nodes, edges]);

  // Apply visual indicators to nodes
  useEffect(() => {
    if (connectingNodeId) {
      // Add classes to nodes for styling
      nodes.forEach(node => {
        const element = document.querySelector(`[data-id="${node.id}"]`);
        if (element) {
          element.classList.remove('epic1-valid-target', 'epic1-invalid-target', 'epic1-connecting-source');
          
          if (node.id === connectingNodeId) {
            element.classList.add('epic1-connecting-source');
          } else if (validTargets.has(node.id)) {
            element.classList.add('epic1-valid-target');
          } else {
            element.classList.add('epic1-invalid-target');
          }
        }
      });
    } else {
      // Clear all classes
      document.querySelectorAll('.epic1-valid-target, .epic1-invalid-target, .epic1-connecting-source')
        .forEach(el => {
          el.classList.remove('epic1-valid-target', 'epic1-invalid-target', 'epic1-connecting-source');
        });
    }

    return () => {
      // Cleanup on unmount
      document.querySelectorAll('.epic1-valid-target, .epic1-invalid-target, .epic1-connecting-source')
        .forEach(el => {
          el.classList.remove('epic1-valid-target', 'epic1-invalid-target', 'epic1-connecting-source');
        });
    };
  }, [connectingNodeId, validTargets, nodes]);

  // Show error message if needed
  if (errorMessage && connectingNodeId) {
    return (
      <div className="epic1-connection-error">
        <div className="epic1-connection-error-message">
          <span className="epic1-error-icon">⚠️</span>
          {errorMessage}
        </div>
      </div>
    );
  }

  return null;
};

/**
 * Hook to validate connections in real-time
 */
export const useConnectionValidation = (
  nodes: Node<EditableNodeData>[], 
  edges: Edge[],
  onError?: (error: string) => void
) => {
  const isValidConnection = React.useCallback((connection: any) => {
    const result = connectionValidator.validateConnection(connection, nodes, edges);
    
    // Show error toast if invalid
    if (!result.isValid && result.error) {
      onError?.(result.error);
    }
    
    return result.isValid;
  }, [nodes, edges, onError]);

  return { isValidConnection };
};