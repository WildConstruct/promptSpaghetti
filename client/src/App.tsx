import React, { useCallback, useState, useMemo, memo } from "react";
import { 
  Edge, 
  Node, 
  ReactFlowProvider, 
  addEdge, 
  Background, 
  Controls, 
  MiniMap, 
  ReactFlow, 
  Connection, 
  OnConnect, 
  OnEdgesChange, 
  OnNodesChange, 
  EdgeChange, 
  NodeChange,
  Handle,
  Position,
  BackgroundVariant
} from "reactflow";
import "reactflow/dist/style.css";
import { create } from 'zustand';
import { z } from 'zod';

// Custom styles for better cursor feedback
const customStyles = `
  .react-flow__pane {
    cursor: grab !important;
  }
  
  .react-flow__pane:active {
    cursor: grabbing !important;
  }
  
  .react-flow__node {
    cursor: move !important;
  }
  
  .react-flow__handle {
    cursor: crosshair !important;
  }
  
  .react-flow__handle:hover {
    background: #3b82f6 !important;
    transform: scale(1.2);
  }
  
  .react-flow__connection-line {
    stroke: #3b82f6 !important;
    stroke-width: 2px !important;
    stroke-dasharray: 5,5 !important;
  }
  
  .react-flow__edge {
    cursor: pointer !important;
  }
  
  .react-flow__edge:hover .react-flow__edge-path {
    stroke: #3b82f6 !important;
    stroke-width: 3px !important;
  }
`;

// Simplified Inspector Panel
const InspectorPanel = ({ node, onChange }: { node: any | null, onChange: (partial: Record<string, unknown>) => void }) => {
  const [values, setValues] = useState<Record<string, unknown>>({});

  React.useEffect(() => {
    if (node) {
      setValues({ ...node.data });
    }
  }, [node]);

  const updateField = (key: string, val: unknown) => {
    const newVals = { ...values, [key]: val };
    setValues(newVals);
    onChange({ [key]: val });
  };

  if (!node) {
    return (
      <aside style={{ width: 320, borderLeft: "1px solid #e0e0e0", background: "#fafbfc", height: "100%", padding: 16 }}>
        <em>Select a node to edit its properties.</em>
      </aside>
    );
  }

  return (
    <aside style={{ width: 320, borderLeft: "1px solid #e0e0e0", background: "#fafbfc", height: "100%", padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>{node.data?.label || node.type} Inspector</h3>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>Label</label>
        <input
          type="text"
          value={values.label as string || ""}
          onChange={(e) => updateField('label', e.target.value)}
          style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
        />
      </div>
      {node.type === 'WeightedChoice' && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>Options</label>
          <textarea
            value={(values.options as string[] || []).join('\n')}
            onChange={(e) => updateField('options', e.target.value.split('\n').filter(s => s.trim()))}
            style={{ width: "100%", height: 100, padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
            placeholder="Enter options, one per line"
          />
        </div>
      )}
      {node.type === 'Output' && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 4 }}>Prompt</label>
          <textarea
            value={values.prompt as string || ""}
            onChange={(e) => updateField('prompt', e.target.value)}
            style={{ width: "100%", height: 100, padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
          />
        </div>
      )}
    </aside>
  );
};

// Simplified Palette
const NodePalette = ({ onDragStart }: { onDragStart?: (nodeId: string) => void }) => {
  const nodeTypes = [
    { id: "WeightedChoice", label: "WeightedChoice", icon: "⚖️" },
    { id: "Concat", label: "Concat", icon: "🔗" },
    { id: "Output", label: "Output", icon: "📤" },
    { id: "Subject", label: "Subject", icon: "👤" },
    { id: "Action", label: "Action", icon: "⚡" },
  ];

  return (
    <aside style={{ width: 200, background: '#181b21', color: '#fff', padding: 8, height: '100%' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: 14 }}>Node Library</h3>
      {nodeTypes.map((node) => (
        <div
          key={node.id}
          draggable
          onDragStart={(e) => {
            e.dataTransfer?.setData?.('application/node-type', node.id);
            onDragStart?.(node.id);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 16px',
            marginBottom: 4,
            borderRadius: 6,
            cursor: 'grab',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2f3a'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <span style={{ fontSize: 20 }}>{node.icon}</span>
          <span style={{ fontSize: 13 }}>{node.label}</span>
        </div>
      ))}
    </aside>
  );
};

// Graph Store
const useGraphStore = create<{
  nodes: Node[];
  edges: Edge[];
  updateNode: (nodeId: string, partial: Record<string, unknown>) => void;
}>((set) => ({
  nodes: [],
  edges: [],
  updateNode: (nodeId, partial) => set((state) => ({
    nodes: state.nodes.map((n) =>
      n.id === nodeId ? { ...n, data: { ...n.data, ...partial } } : n
    ),
  })),
}));

function FlowEditor() {
  // Initial data
  const initialNodes = [
    {
      id: '1',
      type: 'default',
      position: { x: 100, y: 100 },
      data: { 
        label: 'WeightedChoice',
        type: 'WeightedChoice',
        options: ['option 1', 'option 2', 'option 3'],
      },
    },
    {
      id: '2',
      type: 'default',
      position: { x: 400, y: 200 },
      data: { 
        label: 'Output',
        type: 'Output',
        prompt: 'Final output',
      },
    },
  ];

  const initialEdges = [
    { id: 'e1-2', source: '1', target: '2' },
  ];

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const { updateNode } = useGraphStore();

  // Node rendering with proper handles and cursor states
  const NodeRender = useMemo(() => memo<any>((props) => {
    const isSelected = selectedNodeId === props.id;
    
    return (
      <>
        {/* Input Handle - Top */}
        <Handle
          type="target"
          position={Position.Top}
          style={{
            width: 10,
            height: 10,
            background: '#64748b',
            border: '2px solid #fff',
            borderRadius: '50%',
            cursor: 'crosshair',
          }}
        />
        
        {/* Node Body */}
        <div
          onClick={() => setSelectedNodeId(props.id)}
          style={{
            background: isSelected ? '#3b82f6' : '#23272f',
            color: '#fff',
            border: isSelected ? '1px solid #1d4ed8' : '1px solid #444',
            borderRadius: 8,
            padding: '12px 16px',
            minWidth: 120,
            minHeight: 50,
            boxShadow: isSelected 
              ? '0 0 0 2px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(0,0,0,0.15)' 
              : '0 2px 8px rgba(0,0,0,0.10)',
            cursor: 'move',
            position: 'relative',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!isSelected) {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 14 }}>{props.data?.label ?? props.id}</div>
          <div style={{ fontSize: 11, color: isSelected ? '#e0f2fe' : '#999', marginTop: 4 }}>
            {props.data?.type}
          </div>
        </div>
        
        {/* Output Handle - Bottom */}
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            width: 10,
            height: 10,
            background: '#64748b',
            border: '2px solid #fff',
            borderRadius: '50%',
            cursor: 'crosshair',
          }}
        />
      </>
    );
  }), [selectedNodeId]);

  const nodeTypes = useMemo(() => ({ default: NodeRender }), [NodeRender]);

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    []
  );

  const onNodesChange: OnNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => nds.map((node) => {
      const change = changes.find((c) => 'id' in c && c.id === node.id);
      return change ? { ...node, ...change } : node;
    }));
  }, []);

  const onEdgesChange: OnEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => eds.map((edge) => {
      const change = changes.find((c) => 'id' in c && c.id === edge.id);
      return change ? { ...edge, ...change } : edge;
    }));
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const nodeType = event.dataTransfer.getData('application/node-type');
    if (!nodeType) return;
    
    const reactFlowBounds = (event.target as HTMLElement).getBoundingClientRect();
    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };
    
    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: "default",
      position,
      data: { label: nodeType, type: nodeType },
      selected: false,
    };
    
    setNodes((prev) => [...prev, newNode]);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  const handleInspectorChange = (partial: Record<string, unknown>) => {
    if (!selectedNode) return;
    setNodes((prev) => prev.map((n) => 
      n.id === selectedNode.id ? { ...n, data: { ...n.data, ...partial } } : n
    ));
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <NodePalette />
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          style={{ 
            background: '#20232a', 
            height: '100%',
            cursor: 'default',
          }}
          nodeTypes={nodeTypes}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          // Better interaction settings
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          selectNodesOnDrag={false}
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          panOnScroll={false}
          // Connection line styling
          connectionLineStyle={{ 
            strokeWidth: 2, 
            stroke: '#3b82f6',
            strokeDasharray: '5,5',
          }}
          connectionLineType="smoothstep"
          // Default edge styling
          defaultEdgeOptions={{
            style: { 
              strokeWidth: 2, 
              stroke: '#64748b',
            },
            type: 'smoothstep',
            animated: false,
          }}
          // Pan and zoom behavior
          onPaneClick={() => setSelectedNodeId(null)}
          onPaneMouseEnter={(e) => {
            e.currentTarget.style.cursor = 'grab';
          }}
          onPaneMouseMove={(e) => {
            if (e.buttons === 1) { // Left mouse button down
              e.currentTarget.style.cursor = 'grabbing';
            } else {
              e.currentTarget.style.cursor = 'grab';
            }
          }}
          onPaneMouseLeave={(e) => {
            e.currentTarget.style.cursor = 'default';
          }}
        >
          <Background 
            color="#333" 
            gap={20} 
            size={1}
            variant={BackgroundVariant.Dots}
          />
          <MiniMap 
            nodeColor={() => '#363a45'} 
            maskColor="#181b21BB"
            style={{
              background: '#1a1a1a',
              border: '1px solid #333',
            }}
          />
          <Controls 
            style={{ 
              button: { 
                backgroundColor: '#2a2a2a', 
                color: '#e0e0e0',
                border: '1px solid #444',
                borderRadius: '6px',
              }
            }} 
          />
        </ReactFlow>
      </div>
      <InspectorPanel
        node={selectedNode}
        onChange={handleInspectorChange}
      />
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <FlowEditor />
    </ReactFlowProvider>
  );
}
