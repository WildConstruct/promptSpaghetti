import React from 'react';
import { Node, Edge } from 'reactflow';
import { Epic1GraphEditorWithProvider } from '../Epic1GraphEditor';
import type { EditableNodeData } from '../nodes';

// Sample nodes to demonstrate connection validation
const initialNodes: Node<EditableNodeData>[] = [
  {
    id: '1',
    type: 'textBlock',
    position: { x: 100, y: 50 },
    data: {
      value: 'Story beginning',
      nodeType: 'textBlock',
    },
  },
  {
    id: '2',
    type: 'getVariable',
    position: { x: 100, y: 150 },
    data: {
      value: 'characterName',
      nodeType: 'variable',
      isGetter: true,
    },
  },
  {
    id: '3',
    type: 'weightedChoice',
    position: { x: 350, y: 100 },
    data: {
      value: '',
      nodeType: 'weightedChoice',
      options: [
        { text: 'brave', weight: 50 },
        { text: 'cautious', weight: 30 },
        { text: 'curious', weight: 20 },
      ],
    },
  },
  {
    id: '4',
    type: 'concat',
    position: { x: 600, y: 100 },
    data: {
      value: ' ',
      nodeType: 'concat',
    },
  },
  {
    id: '5',
    type: 'setVariable',
    position: { x: 350, y: 250 },
    data: {
      value: 'mood',
      nodeType: 'variable',
      isGetter: false,
    },
  },
  {
    id: '6',
    type: 'output',
    position: { x: 850, y: 100 },
    data: {
      value: 'Result',
      nodeType: 'output',
    },
  },
  {
    id: '7',
    type: 'output',
    position: { x: 850, y: 250 },
    data: {
      value: 'Debug',
      nodeType: 'output',
    },
  },
  {
    id: '8',
    type: 'textBlock',
    position: { x: 100, y: 350 },
    data: {
      value: 'Another path',
      nodeType: 'textBlock',
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-4', source: '1', target: '4', type: 'smoothstep' },
  { id: 'e3-5', source: '3', target: '5', type: 'smoothstep' },
];

export const ConnectionValidationDemo: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px', background: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
          Epic 1 - Connection Validation Demo
        </h1>
        <div style={{ marginTop: '8px', color: '#666', fontSize: '14px' }}>
          <p style={{ margin: '4px 0' }}>
            Try these connections to see validation in action:
          </p>
          <ul style={{ margin: '4px 0 0 20px', lineHeight: 1.6 }}>
            <li>✅ <strong>Valid:</strong> Text Block → Concat, Variable Getter → Output</li>
            <li>❌ <strong>Invalid:</strong> Output → Any Node (outputs cannot be sources)</li>
            <li>❌ <strong>Invalid:</strong> Any Node → Itself (no self-connections)</li>
            <li>❌ <strong>Invalid:</strong> Creating cycles (e.g., A → B → C → A)</li>
            <li>✅ <strong>Valid targets highlight in green</strong> while dragging</li>
            <li>❌ <strong>Invalid targets fade out</strong> to show they cannot be connected</li>
          </ul>
        </div>
      </div>
      
      <div style={{ flex: 1 }}>
        <Epic1GraphEditorWithProvider
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          onExecute={(nodes, edges) => {
            console.log('Executing validated graph:', { nodes, edges });
          }}
        />
      </div>
    </div>
  );
};

export default ConnectionValidationDemo;
