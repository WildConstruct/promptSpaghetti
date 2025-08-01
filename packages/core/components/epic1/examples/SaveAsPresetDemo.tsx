/**
 * Demo: Save as Preset Functionality
 * Shows how to save nodes as custom presets
 */

import React from 'react';
import { Epic1GraphEditorWithProvider } from '../Epic1GraphEditor';
import { Node, Edge } from 'reactflow';
import { EditableNodeData } from '../nodes';

// Initial demo nodes
const initialNodes: Node<EditableNodeData>[] = [
  {
    id: '1',
    type: 'textBlock',
    position: { x: 100, y: 100 },
    data: {
      value: 'The brave knight',
      text: 'The brave knight',
      nodeType: 'textBlock',
    },
  },
  {
    id: '2',
    type: 'weightedChoice',
    position: { x: 100, y: 200 },
    data: {
      value: JSON.stringify([
        { text: 'charges forward', weight: 40 },
        { text: 'raises his shield', weight: 30 },
        { text: 'calls for backup', weight: 30 },
      ]),
      options: [
        { text: 'charges forward', weight: 40 },
        { text: 'raises his shield', weight: 30 },
        { text: 'calls for backup', weight: 30 },
      ],
      nodeType: 'weightedChoice',
    },
  },
  {
    id: '3',
    type: 'concat',
    position: { x: 400, y: 150 },
    data: {
      value: ' ',
      separator: ' ',
      nodeType: 'concat',
    },
  },
  {
    id: '4',
    type: 'output',
    position: { x: 600, y: 150 },
    data: {
      value: 'Action Sequence',
      label: 'Action Sequence',
      nodeType: 'output',
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4' },
];

export const SaveAsPresetDemo: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ padding: 20, background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>Save as Preset Demo</h1>
        <p style={{ margin: '10px 0 0 0', color: '#666' }}>
          Right-click any node and select "Save as Preset" to create a reusable preset
        </p>
        <ul style={{ margin: '10px 0 0 0', paddingLeft: 20, color: '#666' }}>
          <li>Right-click on any node to open context menu</li>
          <li>Choose "Save as Preset" to save current node configuration</li>
          <li>Give your preset a name, category, and description</li>
          <li>Your custom presets will appear in the Asset Library</li>
        </ul>
      </div>
      <div style={{ height: 'calc(100% - 120px)' }}>
        <Epic1GraphEditorWithProvider
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          showAssetLibrary={true}
          assetLibraryPosition="left"
          showPreview={true}
          previewPosition="right"
        />
      </div>
    </div>
  );
};