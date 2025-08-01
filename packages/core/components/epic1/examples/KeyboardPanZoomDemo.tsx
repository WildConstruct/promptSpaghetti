import React from 'react';
import { Node, Edge } from 'reactflow';
import { Epic1GraphEditorWithProvider } from '../Epic1GraphEditor';
import type { EditableNodeData } from '../nodes';

// Sample nodes spread across the canvas to test pan/zoom
const initialNodes: Node<EditableNodeData>[] = [
  {
    id: '1',
    type: 'textBlock',
    position: { x: 100, y: 100 },
    data: {
      value: 'Welcome to Keyboard & Pan/Zoom Demo!\n\nPress ? to see all shortcuts',
      nodeType: 'textBlock',
    },
  },
  {
    id: '2',
    type: 'textBlock',
    position: { x: 500, y: 100 },
    data: {
      value: 'Navigation:\n• Arrow keys to pan\n• Space+drag for pan mode\n• ⌘/Ctrl +/- to zoom\n• ⌘/Ctrl 0 to fit',
      nodeType: 'textBlock',
    },
  },
  {
    id: '3',
    type: 'weightedChoice',
    position: { x: 100, y: 300 },
    data: {
      value: '',
      nodeType: 'weightedChoice',
      options: [
        { text: 'Save with ⌘S', weight: 30 },
        { text: 'Load with ⌘O', weight: 40 },
        { text: 'Export with ⌘E', weight: 30 },
      ],
    },
  },
  {
    id: '4',
    type: 'concat',
    position: { x: 500, y: 300 },
    data: {
      value: ' → ',
      nodeType: 'concat',
    },
  },
  {
    id: '5',
    type: 'textBlock',
    position: { x: 900, y: 100 },
    data: {
      value: 'Selection:\n• ⌘A to select all\n• ⌘D to duplicate\n• Delete to remove',
      nodeType: 'textBlock',
    },
  },
  {
    id: '6',
    type: 'setVariable',
    position: { x: 300, y: 500 },
    data: {
      value: 'demo',
      nodeType: 'variable',
      isGetter: false,
    },
  },
  {
    id: '7',
    type: 'output',
    position: { x: 700, y: 500 },
    data: {
      value: 'Result',
      nodeType: 'output',
    },
  },
  // Nodes spread far apart to demonstrate pan/zoom
  {
    id: '8',
    type: 'textBlock',
    position: { x: -300, y: -200 },
    data: {
      value: 'This node is far to the left and up.\nUse arrow keys or pan controls to navigate!',
      nodeType: 'textBlock',
    },
  },
  {
    id: '9',
    type: 'textBlock',
    position: { x: 1200, y: 700 },
    data: {
      value: 'This node is far to the right and down.\nPress ⌘0 to fit all nodes in view!',
      nodeType: 'textBlock',
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-4', source: '1', target: '4', type: 'smoothstep' },
  { id: 'e3-6', source: '3', target: '6', type: 'smoothstep' },
  { id: 'e4-7', source: '4', target: '7', type: 'smoothstep' },
  { id: 'e6-7', source: '6', target: '7', type: 'smoothstep' },
];

export const KeyboardPanZoomDemo: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px', background: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
          Epic 1 - Keyboard Shortcuts & Pan/Zoom Demo
        </h1>
        <div style={{ marginTop: '8px', color: '#666', fontSize: '14px' }}>
          <p style={{ margin: '4px 0' }}>
            Test the complete keyboard navigation and pan/zoom system:
          </p>
          <div style={{ display: 'flex', gap: '32px', marginTop: '8px' }}>
            <div>
              <strong>Quick Actions:</strong>
              <ul style={{ margin: '4px 0 0 20px', lineHeight: 1.6 }}>
                <li>Press <kbd>?</kbd> for help overlay</li>
                <li>Press <kbd>Tab</kbd> to navigate nodes</li>
                <li>Click any node to edit inline</li>
                <li>Use pan/zoom controls (bottom-right)</li>
              </ul>
            </div>
            <div>
              <strong>Test Features:</strong>
              <ul style={{ margin: '4px 0 0 20px', lineHeight: 1.6 }}>
                <li>Save/Load graphs with ⌘S/⌘O</li>
                <li>Export to JSON with ⌘E</li>
                <li>Duplicate nodes with ⌘D</li>
                <li>Pan with arrows or Space+drag</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ flex: 1 }}>
        <Epic1GraphEditorWithProvider
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          onExecute={(nodes, edges) => {
            console.log('Executing graph with keyboard/pan-zoom features:', { nodes, edges });
            alert('Graph executed! Check console for output.');
          }}
        />
      </div>
    </div>
  );
};

export default KeyboardPanZoomDemo;