import React from 'react';
import { Node, Edge } from 'reactflow';
import { Epic1GraphEditorWithProvider } from '../Epic1GraphEditor';
import type { EditableNodeData } from '../nodes';

// Sample nodes to demonstrate visual feedback
const initialNodes: Node<EditableNodeData>[] = [
  {
    id: '1',
    type: 'textBlock',
    position: { x: 100, y: 50 },
    data: {
      value: 'Welcome to the Visual Feedback Demo!\n\n🎯 Try these interactions:',
      nodeType: 'textBlock',
    },
  },
  {
    id: '2',
    type: 'weightedChoice',
    position: { x: 100, y: 200 },
    data: {
      value: '',
      nodeType: 'weightedChoice',
      options: [
        { text: 'Hover over nodes', weight: 40 },
        { text: 'Click to edit', weight: 35 },
        { text: 'Drag the sliders', weight: 25 },
      ],
    },
  },
  {
    id: '3',
    type: 'concat',
    position: { x: 400, y: 125 },
    data: {
      value: ' → ',
      nodeType: 'concat',
    },
  },
  {
    id: '4',
    type: 'textBlock',
    position: { x: 600, y: 50 },
    data: {
      value: 'Visual feedback features:\n✨ Edit mode glow\n📌 Connection point hover\n✅ Save animation\n🎨 Type-specific colors',
      nodeType: 'textBlock',
    },
  },
  {
    id: '5',
    type: 'setVariable',
    position: { x: 400, y: 250 },
    data: {
      value: 'userChoice',
      nodeType: 'variable',
      isGetter: false,
    },
  },
  {
    id: '6',
    type: 'output',
    position: { x: 600, y: 250 },
    data: {
      value: 'Result',
      nodeType: 'output',
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-3', source: '1', target: '3', type: 'smoothstep' },
  { id: 'e2-5', source: '2', target: '5', type: 'smoothstep' },
  { id: 'e3-4', source: '3', target: '4', type: 'smoothstep' },
  { id: 'e5-6', source: '5', target: '6', type: 'smoothstep' },
];

export const VisualFeedbackDemo: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px', background: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
          Epic 1 - Visual Feedback Demo
        </h1>
        <div style={{ marginTop: '8px', color: '#666', fontSize: '14px' }}>
          <p style={{ margin: '4px 0' }}>
            Experience the enhanced visual feedback system:
          </p>
          <ul style={{ margin: '4px 0 0 20px', lineHeight: 1.6 }}>
            <li>✨ <strong>Edit Mode Glow:</strong> Click any node to see the animated glow effect</li>
            <li>🎯 <strong>Hover States:</strong> Smooth transitions on node and handle hover</li>
            <li>✅ <strong>Save Animation:</strong> Confirm edits to see the checkmark animation</li>
            <li>🎨 <strong>Type-Specific Colors:</strong> Each node type has unique visual styling</li>
            <li>📊 <strong>Dynamic Sliders:</strong> WeightedChoice sliders show live value updates</li>
            <li>🔗 <strong>Connection Feedback:</strong> Handle hover effects for better targeting</li>
          </ul>
        </div>
      </div>
      
      <div style={{ flex: 1 }}>
        <Epic1GraphEditorWithProvider
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          onExecute={(nodes, edges) => {
            console.log('Executing graph with enhanced visual feedback:', { nodes, edges });
          }}
        />
      </div>
    </div>
  );
};

export default VisualFeedbackDemo;