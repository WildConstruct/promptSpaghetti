/**
 * Demo for Auto-Layout functionality
 * Story 1.32: Auto-Layout and Node Positioning System
 */

import React, { useCallback } from 'react';
import { Epic1GraphEditor } from '../Epic1GraphEditor';
import { Node, Edge } from 'reactflow';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'default',
    position: { x: 100, y: 100 },
    data: { 
      nodeType: 'textBlock',
      value: 'Node 1',
      label: 'Node 1'
    }
  },
  {
    id: '2',
    type: 'default',
    position: { x: 100, y: 150 },
    data: { 
      nodeType: 'textBlock',
      value: 'Node 2',
      label: 'Node 2'
    }
  },
  {
    id: '3',
    type: 'default',
    position: { x: 100, y: 200 },
    data: { 
      nodeType: 'textBlock',
      value: 'Node 3',
      label: 'Node 3'
    }
  },
  {
    id: '4',
    type: 'default',
    position: { x: 100, y: 250 },
    data: { 
      nodeType: 'textBlock',
      value: 'Node 4',
      label: 'Node 4'
    }
  }
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4' }
];

export const AutoLayoutDemo: React.FC = () => {
  const handleExecute = useCallback((nodes: Node[], edges: Edge[]) => {
    console.log('Executing graph with', nodes.length, 'nodes');
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ 
        position: 'absolute', 
        top: 20, 
        left: 20, 
        zIndex: 1000,
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2>Auto-Layout Demo</h2>
        <p>Test the auto-layout functionality:</p>
        <ul>
          <li>Press <strong>Cmd+Shift+L</strong> to clean up all nodes</li>
          <li>Select nodes and press <strong>Cmd+Shift+L</strong> to clean up selection</li>
          <li>Right-click canvas for "Clean Up Layout" option</li>
          <li>Drag assets from browser - multiple nodes auto-arrange</li>
        </ul>
        <p>Notice how stacked nodes (initial state) get properly arranged!</p>
      </div>
      
      <Epic1GraphEditor
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        onExecute={handleExecute}
        showAssetLibrary={true}
        showPreview={true}
      />
    </div>
  );
};

export default AutoLayoutDemo;