import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant
} from 'reactflow';

interface BrowserSafeGraphEditorProps {
  initialNodes?: unknown;
  initialEdges?: unknown;
}

interface NodeData {
  label?: string;
  description?: string;
}



// Sample node types for the basic editor
const nodeTypes = {
        default: ({ data }: { data: NodeData }) => (
          <div style={{
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            background: 'white',
            minWidth: '150px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              {data.label || 'Node'}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {data.description || 'Basic node'}
            </div>
          </div>
      ),
      input: ({ data }: { data: NodeData }) => (
        <div style={{
          padding: '10px',
          border: '2px solid #4CAF50',
          borderRadius: '6px',
          background: '#f9fff9',
          minWidth: '150px'
        }}>
          <div style={{ fontWeight: 'bold', color: '#4CAF50', marginBottom: '5px' }}>
            📥 {data.label || 'Input'}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {data.description || 'Input node'}
          </div>
        </div>
    ),
    output: ({ data }: { data: NodeData }) => (
      <div style={{
        padding: '10px',
        border: '2px solid #FF9800',
        borderRadius: '6px',
        background: '#fff9f0',
        minWidth: '150px'
      }}>
        <div style={{ fontWeight: 'bold', color: '#FF9800', marginBottom: '5px' }}>
          📤 {data.label || 'Output'}
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {data.description || 'Output node'}
        </div>
      </div>
  ),
  process: ({ data }: { data: NodeData }) => (
    <div style={{
      padding: '10px',
      border: '2px solid #2196F3',
      borderRadius: '6px',
      background: '#f0f9ff',
      minWidth: '150px'
    }}>
      <div style={{ fontWeight: 'bold', color: '#2196F3', marginBottom: '5px' }}>
        ⚙️ {data.label || 'Process'}
      </div>
      <div style={{ fontSize: '12px', color: '#666' }}>
        {data.description || 'Processing node'}
      </div>
    </div>
  )
};

const defaultNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    position: { x: 250, y: 25 },
    data: { label: 'Start', description: 'Beginning of the graph' }
  },
  {
    id: '2',
    type: 'process',
    position: { x: 250, y: 125 },
    data: { label: 'Process', description: 'Main processing step' }
  },
  {
    id: '3',
    type: 'output',
    position: { x: 250, y: 225 },
    data: { label: 'End', description: 'Final output' }
  }
];

const defaultEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' }
];

      export const BrowserSafeGraphEditor: React.FC<BrowserSafeGraphEditorProps> = ({
        initialNodes = [],
        initialEdges = []
      }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialNodes.length > 0 ? (initialNodes as Node[]) : defaultNodes
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialEdges.length > 0 ? (initialEdges as Edge[]) : defaultEdges
  );
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
      const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
    },
    []
  );
  const addNode = useCallback((type: string) => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type,
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100
      },
      data: {
        label: `New ${type}`,
        description: `${type} node created ${new Date().toLocaleTimeString()}`
      }
    };
  setNodes((nds) => [...nds, newNode]);
}, [setNodes]);
const deleteSelectedNode = useCallback(() => {
  if (selectedNode) {
    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
    setEdges((eds) => eds.filter((edge) =>
      edge.source !== selectedNode.id && edge.target !== selectedNode.id
    ));
    setSelectedNode(null);
  }
}, [selectedNode, setNodes, setEdges]);
const clearGraph = useCallback(() => {
  setNodes([]);
  setEdges([]);
  setSelectedNode(null);
}, [setNodes, setEdges]);
return (
  <div style={{ width: '100%', height: '100%', display: 'flex' }}>
  {/* Main Graph Area */}
  <div style={{ flex: 1, height: '100%' }}>
  <ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}
  onNodeClick={onNodeClick}
  nodeTypes={nodeTypes}
  fitView
  style={{ background: '#f8f9fa' }}
  >
  <Controls />
  <MiniMap />
  <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
  </ReactFlow>
  </div>
  {/* Side Panel */}
  <div style={{
    width: '300px',
    borderLeft: '1px solid #ddd',
    backgroundColor: 'white',
    padding: '20px',
    overflowY: 'auto'
  }>
<h3 style={{ margin: '0 0 20px 0', color: '#333' }}>🎨 Graph Tools</h3>
{/* Add Node Section */}
<div style={{ marginBottom: '30px' }}>
<h4 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Add Nodes</h4>
<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
<button
onClick={() => addNode('input')}
style={{
  padding: '8px 12px',
  border: '1px solid #4CAF50',
  borderRadius: '4px',
  background: '#f9fff9',
  color: '#4CAF50',
  cursor: 'pointer',
  fontSize: '12px'
}}
>
📥 Input Node
</button>
<button
onClick={() => addNode('process')}
style={{
  padding: '8px 12px',
  border: '1px solid #2196F3',
  borderRadius: '4px',
  background: '#f0f9ff',
  color: '#2196F3',
  cursor: 'pointer',
  fontSize: '12px'
}}
>
⚙️ Process Node
</button>
<button
onClick={() => addNode('output')}
style={{
  padding: '8px 12px',
  border: '1px solid #FF9800',
  borderRadius: '4px',
  background: '#fff9f0',
  color: '#FF9800',
  cursor: 'pointer',
  fontSize: '12px'
}}
>
📤 Output Node
</button>
</div>
</div>
{/* Graph Actions */}
<div style={{ marginBottom: '30px' }}>
<h4 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Graph Actions</h4>
<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
<button
onClick={deleteSelectedNode}
disabled={!selectedNode}
style={{
  padding: '8px 12px',
  border: '1px solid #f44336',
  borderRadius: '4px',
  background: selectedNode ? '#fff0f0' : '#f5f5f5',
  color: selectedNode ? '#f44336' : '#999',
  cursor: selectedNode ? 'pointer' : 'not-allowed',
  fontSize: '12px'
}}
>
  🗑️ Delete Selected
  </button>
  <button
  onClick={clearGraph}
  style={{
    padding: '8px 12px',
    border: '1px solid #666',
    borderRadius: '4px',
    background: '#f8f9fa',
    color: '#666',
    cursor: 'pointer',
    fontSize: '12px'
  }}
>
🧹 Clear All
</button>
</div>
</div>
{/* Node Inspector */}
{selectedNode && (
  <div style={{ marginBottom: '20px' }}>
  <h4 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Selected Node</h4>
  <div style={{
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    background: '#f8f9fa'
  }>
<div style={{ fontSize: '12px', marginBottom: '8px' }}>
<strong>ID:</strong> {selectedNode.id}
</div>
<div style={{ fontSize: '12px', marginBottom: '8px' }}>
<strong>Type:</strong> {selectedNode.type}
</div>
<div style={{ fontSize: '12px', marginBottom: '8px' }}>
<strong>Label:</strong> {selectedNode.data?.label}
</div>
<div style={{ fontSize: '12px' }}>
<strong>Position:</strong> ({Math.round(selectedNode.position.x)}, {Math.round(selectedNode.position.y)})
</div>
</div>
</div>
)}
{/* Graph Stats */}
<div>
<h4 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Graph Statistics</h4>
<div style={{
  padding: '12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  background: '#f8f9fa',
  fontSize: '12px'
}>
<div style={{ marginBottom: '4px' }}>📊 Nodes: {nodes.length}</div>
<div style={{ marginBottom: '4px' }}>🔗 Edges: {edges.length}</div>
<div>✨ Last updated: {new Date().toLocaleTimeString()}</div>
</div>
</div>
</div>
</div>
);
};

export default BrowserSafeGraphEditor;