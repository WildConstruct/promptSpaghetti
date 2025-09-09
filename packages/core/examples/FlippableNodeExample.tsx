// Example usage of FlippableNode from Story 2.7
// Shows how to integrate metadata flip animation with React Flow nodes

import React, { useState, useCallback } from 'react';
import { Handle, Position, Node } from 'reactflow';
import { FlippableNode } from '../components/nodes/FlippableNode';
import { SegmentMetadata } from '../services/llm/MetadataExtractor';

interface FlippableReactFlowNodeData {
  label: string;
  content: string;
  metadata?: SegmentMetadata;
}

export interface FlippableReactFlowNode extends Node {
  data: FlippableReactFlowNodeData;
}

interface FlippableNodeExampleProps {
  node: FlippableReactFlowNode;
  isEditMode?: boolean;
  onFlip?: (nodeId: string, isFlipped: boolean) => void;
}

export const FlippableNodeExample: React.FC<FlippableNodeExampleProps> = ({
  node,
  isEditMode = false,
  onFlip
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = useCallback(() => {
    const newFlipState = !isFlipped;
    setIsFlipped(newFlipState);
    onFlip?.(node.id, newFlipState);
  }, [isFlipped, node.id, onFlip]);

  // Sample metadata for demonstration
  const sampleMetadata: SegmentMetadata = node.data.metadata || {
    themes: [
      { name: 'Adventure', confidence: 0.9 },
      { name: 'Fantasy', confidence: 0.8 }
    ],
    entities: [
      { name: 'Hero', type: 'character', confidence: 0.9 },
      { name: 'Dragon', type: 'creature', confidence: 0.7 }
    ],
    style: ['epic', 'heroic'],
    sentiment: 0.6,
    complexity: 0.5,
    extractedAt: Date.now(),
    source: 'llm'
  };

  return (
    <>
      {/* Input/Output handles for React Flow */}
      <Handle type="target" position={Position.Top} />

      <FlippableNode
        node={node}
        isFlipped={isFlipped}
        onFlip={handleFlip}
        metadata={sampleMetadata}
        isEditMode={isEditMode}
      >
        {/* Front face content - normal React Flow node */}
        <div className="react-flow-node-content">
          <div className="node-header">
            <strong>{node.data.label}</strong>
          </div>
          <div className="node-body">{node.data.content}</div>
          {isEditMode && (
            <div className="node-edit-actions">
              <button
                onClick={handleFlip}
                className="flip-button"
                title="Flip to view metadata (or Alt+Click)"
              >
                🔄 Flip
              </button>
            </div>
          )}
        </div>
      </FlippableNode>

      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

// Example usage in a React Flow graph
export const FlippableNodeExampleUsage = () => {
  const [nodes, setNodes] = useState<FlippableReactFlowNode[]>([
    {
      id: '1',
      type: 'flippableExample',
      position: { x: 100, y: 100 },
      data: {
        label: 'Story Node',
        content:
          'A brave {hero_name} ventures into the dark forest to face the ancient dragon.',
        metadata: {
          themes: [{ name: 'Fantasy Adventure', confidence: 0.95 }],
          entities: [
            { name: '{hero_name}', type: 'variable', confidence: 1.0 },
            { name: 'dragon', type: 'creature', confidence: 0.9 }
          ],
          style: ['heroic', 'mystical'],
          sentiment: 0.7,
          complexity: 0.6,
          extractedAt: Date.now(),
          source: 'llm'
        }
      }
    }
  ]);

  const handleFlip = useCallback((nodeId: string, isFlipped: boolean) => {
    console.log(
      `Node ${nodeId} ${isFlipped ? 'flipped to metadata' : 'flipped to content'}`
    );

    // Optional: Track flip events for analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'node_flip', {
        event_category: 'interaction',
        event_label: nodeId,
        value: isFlipped ? 1 : 0
      });
    }
  }, []);

  return (
    <div className="flippable-node-example-container">
      <h3>Flippable Node Example</h3>
      <p>
        Alt+Click the node or use the flip button in edit mode to reveal
        metadata.
      </p>

      <div
        className="node-wrapper"
        style={{
          position: 'relative',
          width: 300,
          height: 200,
          border: '1px dashed #ccc',
          margin: 20
        }}
      >
        <FlippableNodeExample
          node={nodes[0]}
          isEditMode={true}
          onFlip={handleFlip}
        />
      </div>

      <div className="usage-notes">
        <h4>Integration Notes:</h4>
        <ul>
          <li>
            <strong>Alt+Click:</strong> Power user flip trigger
          </li>
          <li>
            <strong>Flip Button:</strong> Available in edit mode
          </li>
          <li>
            <strong>Long Press:</strong> Mobile support (500ms)
          </li>
          <li>
            <strong>Metadata:</strong> Shows themes, entities, style,
            performance metrics
          </li>
          <li>
            <strong>Accessibility:</strong> WCAG AA compliant with ARIA
            attributes
          </li>
          <li>
            <strong>Performance:</strong> GPU-accelerated 3D CSS transforms
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FlippableNodeExample;
