import React, { useCallback } from 'react';
import ReactFlow, { 
  Node, 
  Edge, 
  Controls, 
  Background,
  ReactFlowProvider,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeProps
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';

// Comment out the import for now - it's causing issues
// import { TextBlockNode } from '@promptscape/core/components/epic1/nodes';

// Custom node with better styling and draggability
const CustomNode = ({ data }: NodeProps) => {
  return (
    <div style={{
      background: '#ffffff',
      border: '2px solid #4a5568',
      borderRadius: '8px',
      padding: '16px 24px',
      fontSize: '16px',
      fontWeight: '500',
      color: '#1a202c',
      minWidth: '180px',
      textAlign: 'center',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      cursor: 'grab'
    }}>
      <Handle 
        type="target" 
        position={Position.Top}
        style={{
          background: '#4a5568',
          width: '12px',
          height: '12px',
          border: '2px solid #ffffff'
        }}
      />
      <div>{data.label}</div>
      <Handle 
        type="source" 
        position={Position.Bottom}
        style={{
          background: '#4a5568',
          width: '12px',
          height: '12px',
          border: '2px solid #ffffff'
        }}
      />
    </div>
  );
};

// Simple TextBlock node for testing
const SimpleTextBlockNode = ({ data }: NodeProps) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [text, setText] = React.useState(data.content || '');

  return (
    <div style={{
      background: '#f7fafc',
      border: '2px solid #cbd5e0',
      borderRadius: '8px',
      padding: '12px',
      minWidth: '200px',
      minHeight: '80px',
      cursor: 'pointer'
    }}
    onDoubleClick={() => setIsEditing(true)}
    >
      <Handle 
        type="target" 
        position={Position.Top}
        style={{
          background: '#4a5568',
          width: '12px',
          height: '12px',
          border: '2px solid #ffffff'
        }}
      />
      {isEditing ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              setIsEditing(false);
            }
          }}
          style={{
            width: '100%',
            minHeight: '60px',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            resize: 'none',
            fontSize: '14px',
            fontFamily: 'inherit'
          }}
          autoFocus
        />
      ) : (
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {text || 'Double-click to edit...'}
        </div>
      )}
      <Handle 
        type="source" 
        position={Position.Bottom}
        style={{
          background: '#4a5568',
          width: '12px',
          height: '12px',
          border: '2px solid #ffffff'
        }}
      />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
  textBlock: SimpleTextBlockNode,
};

// Test nodes with better positioning
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 250, y: 50 },
    data: { label: '🍝 Prompt Spaghetti' },
  },
  {
    id: '2',
    type: 'textBlock',
    position: { x: 100, y: 150 },
    data: { 
      content: 'This is a text block node from Epic 1' 
    },
  },
  {
    id: '3',
    type: 'custom',
    position: { x: 400, y: 150 },
    data: { label: '🎯 Output Node' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3', animated: true },
];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  console.log('App component rendering with draggable nodes...');
  
  return (
    <div className="App" style={{ width: '100vw', height: '100vh' }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
        >
          <Background color="#aaa" gap={16} />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

export default App;