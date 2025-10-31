import React from 'react';
import ReactFlow, { Node, Edge, Controls, Background } from 'reactflow';
import { EnhancedBoundingBox } from '../packages/core/components/epic1/nodes/EnhancedBoundingBox';
import 'reactflow/dist/style.css';

/**
 * Example: Using Enhanced Bounding Box with Micro-Expression Asset Bundle
 */

const nodeTypes = {
  enhancedBoundingBox: EnhancedBoundingBox
};

// Example nodes for micro-expression bundle
const initialNodes: Node[] = [
  // Region container
  {
    id: 'region_micro_expressions',
    type: 'enhancedBoundingBox',
    position: { x: 100, y: 100 },
    data: {
      title: 'Micro-Expressions',
      description:
        'Subtle facial expressions with intensity and context modifiers',
      backgroundColor: '#FF5252', // Character-Emotion color
      opacity: 0.3,
      borderColor: '#FF5252',
      borderStyle: 'solid',
      borderWidth: 2,
      locked: true,
      width: 600,
      height: 400,
      isCollapsed: false,
      autoLayout: true,
      ports: []
    }
  },
  // WeightedChoice: Micro-Expression
  {
    id: 'micro_expression',
    type: 'default',
    position: { x: 120, y: 180 },
    data: {
      label: 'Micro-Expression',
      type: 'WeightedChoice',
      choices: [
        { text: 'fleeting eyebrow flash', weight: 2 },
        { text: 'subtle lip purse', weight: 1.8 },
        { text: 'quick eye dart', weight: 1.8 }
      ]
    }
  },
  // WeightedChoice: Intensity
  {
    id: 'intensity',
    type: 'default',
    position: { x: 320, y: 180 },
    data: {
      label: 'Intensity',
      type: 'WeightedChoice',
      choices: [
        { text: 'barely perceptible', weight: 2 },
        { text: 'fleeting', weight: 3 },
        { text: 'subtle but noticeable', weight: 2 }
      ]
    }
  },
  // WeightedChoice: Context
  {
    id: 'context',
    type: 'default',
    position: { x: 520, y: 180 },
    data: {
      label: 'Context',
      type: 'WeightedChoice',
      choices: [
        { text: 'betraying', weight: 2.5 },
        { text: 'revealing', weight: 2 },
        { text: 'trying to hide', weight: 2 }
      ]
    }
  },
  // Output Template
  {
    id: 'output',
    type: 'default',
    position: { x: 320, y: 320 },
    data: {
      label: 'Complete Expression',
      type: 'Output',
      template:
        'A {{intensity}} {{micro_expression}}, {{context}} their true feelings'
    }
  }
];

// Connections between nodes
const initialEdges: Edge[] = [
  { id: 'e1', source: 'micro_expression', target: 'output' },
  { id: 'e2', source: 'intensity', target: 'output' },
  { id: 'e3', source: 'context', target: 'output' }
];

export const EnhancedRegionExample: React.FC = () => {
  const [nodes, setNodes] = React.useState(initialNodes);
  const [edges, setEdges] = React.useState(initialEdges);

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={changes => {
          // Handle node changes
        }}
        onEdgesChange={changes => {
          // Handle edge changes
        }}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

/**
 * Usage Instructions:
 *
 * 1. COLLAPSE/EXPAND:
 *    - Click the ▼/▶ button in the top-left corner
 *    - When collapsed, only the region header and ports are visible
 *    - Internal nodes are hidden but connections preserved
 *
 * 2. AUTO-LAYOUT:
 *    - Click the 📐 button to auto-arrange contained nodes
 *    - Prevents overlapping and ensures readability
 *
 * 3. PORTS (when collapsed):
 *    - Input ports appear on the left (blue)
 *    - Output ports appear on the right (green)
 *    - Hover to see port labels
 *    - Connect to these ports as if connecting to the internal nodes
 *
 * 4. COLOR CODING:
 *    - Red (#FF5252) = Character/Emotion
 *    - Teal (#4ECDC4) = Environment
 *    - Green (#95E77E) = Narrative
 *    - Yellow (#FFE66D) = Dialogue
 *
 * 5. COPY/PASTE REGIONS:
 *    - Select the region
 *    - Ctrl+C to copy entire bundle
 *    - Ctrl+V to paste as new instance
 *    - All internal nodes and connections are preserved
 */
