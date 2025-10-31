/**
 * Story 1.5: Variable Node Data Inlet Demo
 * Demonstrates the three-handle Variable node with data injection
 */

import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
} from 'reactflow';
import { epic1NodeTypes } from '../nodes';
import 'reactflow/dist/style.css';
import '../styles/Epic1GraphEditor.css';

// Demo nodes showing the three-handle Variable node
const initialNodes: Node[] = [
  {
    id: 'data-source',
    type: 'textBlock',
    position: { x: 50, y: 200 },
    data: {
      nodeType: 'textBlock',
      value: JSON.stringify({
        event: 'explosion',
        intensity: 8,
        proximity: 'near',
        reaction: 'diving for cover'
      }, null, 2),
    },
  },
  {
    id: 'variable-hub',
    type: 'variable',
    position: { x: 350, y: 100 },
    data: {
      nodeType: 'variable',
      value: 'reaction',
      variableName: 'reaction',
      isGetter: false,
      hasDataInlet: true,
      mergeMode: 'override',
      dataInletConnected: false,
    },
  },
  {
    id: 'text-template',
    type: 'textBlock',
    position: { x: 250, y: 50 },
    data: {
      nodeType: 'textBlock',
      value: 'Extra #{id} is {reaction} from the blast',
    },
  },
  {
    id: 'output',
    type: 'output',
    position: { x: 650, y: 100 },
    data: {
      nodeType: 'output',
      value: '',
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'template-to-variable',
    source: 'text-template',
    target: 'variable-hub',
    sourceHandle: 'source',
    targetHandle: 'target',
    type: 'default',
  },
  {
    id: 'variable-to-output',
    source: 'variable-hub',
    target: 'output',
    sourceHandle: 'source',
    targetHandle: 'target',
    type: 'default',
  },
];

export const VariableDataInletDemo: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [dataConnected, setDataConnected] = useState(false);

  const onConnect = useCallback(
    (params: Connection) => {
      // Check if connecting to data inlet
      if (params.target === 'variable-hub' && params.targetHandle === 'data') {
        setDataConnected(true);
        // Update the variable node to show data is connected
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === 'variable-hub') {
              return {
                ...node,
                data: {
                  ...node.data,
                  dataInletConnected: true,
                  dataSource: 'inlet',
                },
              };
            }
            return node;
          })
        );
      }
      setEdges((eds) => addEdge({ ...params, animated: true }, eds));
    },
    [setEdges, setNodes]
  );

  const toggleMergeMode = () => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === 'variable-hub') {
          const currentMode = node.data.mergeMode || 'override';
          const modes = ['override', 'template', 'append'];
          const nextMode = modes[(modes.indexOf(currentMode) + 1) % modes.length];
          return {
            ...node,
            data: {
              ...node.data,
              mergeMode: nextMode,
            },
          };
        }
        return node;
      })
    );
  };

  const injectTestData = () => {
    // Simulate data injection
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === 'variable-hub') {
          return {
            ...node,
            data: {
              ...node.data,
              dataInletConnected: true,
              dataSource: 'inlet',
              resolvedValue: 'diving for cover',
            },
          };
        }
        if (node.id === 'output') {
          return {
            ...node,
            data: {
              ...node.data,
              value: 'Extra #47 is diving for cover from the blast',
            },
          };
        }
        return node;
      })
    );
  };

  return (
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '8px',
        }}
      >
        <h3>Story 1.5: Variable Data Inlet Demo</h3>
        <p>Connect the Data Source to the Variable&apos;s bottom handle (green data inlet)</p>
        <button onClick={toggleMergeMode} style={{ marginRight: '10px' }}>
          Toggle Merge Mode
        </button>
        <button onClick={injectTestData}>Inject Test Data</button>
        <div style={{ marginTop: '10px' }}>
          <strong>Current Mode:</strong>{' '}
          {nodes.find((n) => n.id === 'variable-hub')?.data.mergeMode || 'override'}
        </div>
        <div>
          <strong>Data Connected:</strong> {dataConnected ? 'Yes ✅' : 'No ❌'}
        </div>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={epic1NodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            background: 'rgba(76, 175, 80, 0.1)',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #4CAF50',
          }}
        >
          <h4>Demo Scenario: Reactive Extras</h4>
          <pre style={{ fontSize: '11px', margin: 0 }}>
{`World Event: {
  "event": "explosion",
  "intensity": 8,
  "proximity": "near"
}
→ Variable:{reaction} (data inlet)
→ TextBlock: "Extra #{id} is {reaction}"
→ Output: Dynamic prompt`}
          </pre>
        </div>
      </ReactFlow>
    </div>
  );
};
