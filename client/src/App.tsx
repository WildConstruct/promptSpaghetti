import React, { useCallback, useState, useMemo, memo, useRef } from "react";
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
  NodeSelectionChange,
  Handle,
  Position,
  BackgroundVariant,
  ConnectionMode,
  useReactFlow
} from "reactflow";
import "reactflow/dist/style.css";

function FlowEditor() {
  // Clean initial state
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const reactFlowWrapperRef = useRef<HTMLDivElement>(null);
  const { project, getViewport } = useReactFlow();

  // Sync ReactFlow's internal selection state with our state
  const syncNodeSelection = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    setNodes(nds => nds.map(node => ({
      ...node,
      selected: node.id === nodeId
    })));
  }, []);

  // Clear any localStorage that might contain problematic data
  React.useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();
  }, []);

  // Debug selection changes
  React.useEffect(() => {
    console.log('Selection changed to:', selectedNodeId);
  }, [selectedNodeId]);

  // Debug nodes changes
  React.useEffect(() => {
    console.log('Nodes array updated:', nodes.length, nodes.map(n => ({ id: n.id, type: n.type, nodeType: n.data?.nodeType })));
  }, [nodes]);

  // Stable hover state outside the memo
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Professional node rendering
  const NodeRender = useMemo(() => memo((props: any) => {
    const isSelected = selectedNodeId === props.id;
    const isHovered = hoveredNodeId === props.id;
    const nodeType = props.data?.nodeType || 'WeightedChoice';
    
    // Category colors
    const getCategoryColor = (type: string) => {
      switch (type) {
        case 'WeightedChoice': case 'Concat': case 'Include': return '#059669'; // Green
        case 'Output': return '#dc2626'; // Red  
        case 'Subject': case 'Action': case 'Attribute': case 'Connector': return '#4f46e5'; // Blue
        case 'SetVariable': case 'GetVariable': return '#7c3aed'; // Purple
        default: return '#6b7280'; // Gray
      }
    };
    
    const categoryColor = getCategoryColor(nodeType);
    
    return (
      <div 
        className={isSelected ? 'selected' : ''}
        style={{ position: 'relative' }}
      >
        {/* Input Handle */}
        <Handle 
          type="target" 
          position={Position.Left} 
          style={{
            width: 12,
            height: 12,
            background: '#4a5568',
            border: '2px solid #2d3748',
          }}
        />
        
        {/* Node Body */}
        <div
          // Removed onClick handler here - we'll use ReactFlow's built-in node selection
          onMouseEnter={() => setHoveredNodeId(props.id)}
          onMouseLeave={() => setHoveredNodeId(null)}
          style={{
            cursor: 'grab',
            background: '#2d3748',
            border: isSelected 
              ? `3px solid ${categoryColor}` 
              : isHovered
                ? `2px solid ${categoryColor}80`
                : '1px solid #4a5568',
            borderRadius: 6,
            minWidth: 160,
            minHeight: 80,
            boxShadow: isSelected 
              ? `0 0 0 2px ${categoryColor}40, 0 6px 20px rgba(0,0,0,0.3)` 
              : isHovered
                ? `0 0 0 1px ${categoryColor}40, 0 4px 10px rgba(0,0,0,0.2)`
                : '0 2px 8px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            transition: 'all 0.2s ease'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: categoryColor,
              color: '#fff',
              padding: '8px 12px',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ fontSize: 14 }}>🔧</span>
            <span>{nodeType}</span>
          </div>

          {/* Content */}
          <div style={{ padding: '10px 12px', color: '#e2e8f0' }}>
            <div style={{ fontWeight: 500, fontSize: 13, color: '#f7fafc' }}>
              {props.data?.label || props.id}
            </div>
          </div>
        </div>

        {/* Output Handle */}
        <Handle 
          type="source" 
          position={Position.Right} 
          style={{
            width: 12,
            height: 12,
            background: categoryColor,
            border: '2px solid #2d3748',
          }}
        />
      </div>
    );
  }), [selectedNodeId, hoveredNodeId]);

  const nodeTypes = useMemo(() => {
    // Create a proxy that catches ALL possible node types
    const baseTypes = {
      default: NodeRender,
      WeightedChoice: NodeRender,
      Concat: NodeRender,
      Output: NodeRender,
      Subject: NodeRender,
      Action: NodeRender,
      SetVariable: NodeRender,
      GetVariable: NodeRender,
      // React Flow internal types
      dimensions: NodeRender,
      select: NodeRender,
      position: NodeRender,
      input: NodeRender,
      output: NodeRender,
      group: NodeRender,
    };

    // Return proxy that handles any unknown types
    return new Proxy(baseTypes, {
      get: (target, prop) => {
        const key = String(prop);
        if ((target as Record<string, any>)[key]) {
          return (target as Record<string, any>)[key];
        }
        console.log(`Unknown node type requested: ${key}, using NodeRender fallback`);
        return NodeRender;
      }
    });
  }, [NodeRender]);

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    []
  );

  const onNodesChange: OnNodesChange = useCallback((changes: NodeChange[]) => {
    // Apply changes normally without forcing types - let React Flow manage its internal state
    setNodes((nds) => {
      const updatedNodes = nds.map((node) => {
        const change = changes.find((c) => 'id' in c && c.id === node.id);
        if (change && 'selected' in change && change.selected) {
          // Update our selection state when ReactFlow selects a node
          setSelectedNodeId(node.id);
          return { ...node, ...change };
        } else if (change) {
          return { ...node, ...change };
        }
        return node;
      });
      
      // Handle deselection
      const selectionChange = changes.find((c): c is NodeSelectionChange => 'id' in c && 'selected' in c && c.selected === false && c.id === selectedNodeId);
      if (selectionChange) {
        setSelectedNodeId(null);
      }
      
      return updatedNodes;
    });
  }, [selectedNodeId]);

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
    
    // Validate node type
    const validTypes = ['WeightedChoice', 'Concat', 'Output', 'Subject', 'Action', 'SetVariable', 'GetVariable'];
    const safeNodeType = validTypes.includes(nodeType) ? nodeType : 'WeightedChoice';
    
    // Get position - convert screen coordinates to flow coordinates
    if (reactFlowWrapperRef.current) {
      // Important: Get the latest bounds each time to ensure accuracy
      const reactFlowBounds = reactFlowWrapperRef.current.getBoundingClientRect();
      
      // Calculate drop position relative to the flow container
      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top
      });
      
      // Create node data
      const defaultData = {
        label: safeNodeType,
        nodeType: safeNodeType,
        ...(safeNodeType === 'WeightedChoice' && { options: ['Option 1', 'Option 2'] }),
        ...(safeNodeType === 'Output' && { prompt: 'Output text here' }),
        ...(safeNodeType === 'Concat' && { separator: ' ' }),
        ...(safeNodeType === 'SetVariable' && { variableName: 'myVar', value: 'default value' }),
        ...(safeNodeType === 'GetVariable' && { variableName: 'myVar' }),
      };
      
      const newNode: Node = {
        id: `${safeNodeType}-${Date.now()}`,
        type: "default",
        position,  // Use the projected position
        data: defaultData,
      };
      
      console.log('Creating node at position:', position);
      
      // Add the new node and select it
      setNodes((prev) => [...prev.map(n => ({ ...n, selected: false })), newNode]);
      // Select the newly created node
      setTimeout(() => syncNodeSelection(newNode.id), 50);
    } else {
      console.error('ReactFlow wrapper reference is not available');
    }
  }, [project, syncNodeSelection]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Palette */}
      <aside style={{ width: 200, background: '#181b21', color: '#fff', padding: 8, height: '100%' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: 14 }}>Node Library</h3>
        {[
          { id: "WeightedChoice", label: "WeightedChoice", icon: "⚖️" },
          { id: "Concat", label: "Concat", icon: "🔗" },
          { id: "Output", label: "Output", icon: "📤" },
          { id: "Subject", label: "Subject", icon: "👤" },
          { id: "Action", label: "Action", icon: "⚡" },
          { id: "SetVariable", label: "SetVariable", icon: "📝" },
          { id: "GetVariable", label: "GetVariable", icon: "📖" },
        ].map((node) => (
          <div
            key={node.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer?.setData?.('application/node-type', node.id);
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

      {/* Canvas */}
      <div 
        ref={reactFlowWrapperRef}
        style={{ 
          flex: 1, 
          position: 'relative',
          cursor: 'default' 
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onPaneClick={() => setSelectedNodeId(null)}
          onNodeClick={(event, node) => {
            event.stopPropagation();
            console.log('ReactFlow onNodeClick:', node.id);
            syncNodeSelection(node.id);
          }}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          snapToGrid={true}
          fitView
          style={{ background: '#1a202c', height: '100%' }}
          defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
          selectNodesOnDrag={false}
          selectionOnDrag={false}
        >
          <Background color="#2d3748" gap={16} />
          <MiniMap nodeColor={() => '#363a45'} maskColor="#181b21BB" />
          <Controls />
        </ReactFlow>
      </div>

      {/* Inspector */}
      <aside style={{ width: 320, borderLeft: "1px solid #4a5568", background: "#1a202c", height: "100%", padding: 16 }}>
        <h3 style={{ color: "#e2e8f0", marginTop: 0, fontSize: 14 }}>Inspector</h3>
        {selectedNodeId ? (() => {
          const selectedNode = nodes.find(n => n.id === selectedNodeId);
          console.log('Inspector render - selectedNodeId:', selectedNodeId);
          console.log('Inspector render - selectedNode:', selectedNode);
          console.log('Inspector render - all nodes:', nodes);
          
          if (!selectedNode) {
            console.log('No selected node found!');
            return <div style={{ color: "#e2e8f0" }}>Node not found: {selectedNodeId}</div>;
          }
          
          return (
            <div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", color: "#cbd5e0", fontSize: 12, marginBottom: 4 }}>Node Type</label>
                <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500 }}>{selectedNode.data?.nodeType}</div>
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", color: "#cbd5e0", fontSize: 12, marginBottom: 4 }}>Label</label>
                <input
                  type="text"
                  value={selectedNode.data?.label || ""}
                  onChange={(e) => {
                    setNodes(prev => prev.map(n => 
                      n.id === selectedNodeId 
                        ? { ...n, data: { ...n.data, label: e.target.value } }
                        : n
                    ));
                  }}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    border: "1px solid #4a5568",
                    borderRadius: 4,
                    background: "#2d3748",
                    color: "#e2e8f0",
                    fontSize: 13
                  }}
                />
              </div>

              {selectedNode.data?.nodeType === 'WeightedChoice' && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", color: "#cbd5e0", fontSize: 12, marginBottom: 4 }}>Options</label>
                  <textarea
                    value={(selectedNode.data?.options as string[] || []).join('\n')}
                    onChange={(e) => {
                      setNodes(prev => prev.map(n => 
                        n.id === selectedNodeId 
                          ? { ...n, data: { ...n.data, options: e.target.value.split('\n').filter(s => s.trim()) } }
                          : n
                      ));
                    }}
                    style={{
                      width: "100%",
                      height: 80,
                      padding: "6px 8px",
                      border: "1px solid #4a5568",
                      borderRadius: 4,
                      background: "#2d3748",
                      color: "#e2e8f0",
                      fontSize: 13,
                      resize: 'vertical'
                    }}
                    placeholder="Enter options, one per line"
                  />
                </div>
              )}

              {selectedNode.data?.nodeType === 'Output' && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", color: "#cbd5e0", fontSize: 12, marginBottom: 4 }}>Prompt</label>
                  <textarea
                    value={selectedNode.data?.prompt || ""}
                    onChange={(e) => {
                      setNodes(prev => prev.map(n => 
                        n.id === selectedNodeId 
                          ? { ...n, data: { ...n.data, prompt: e.target.value } }
                          : n
                      ));
                    }}
                    style={{
                      width: "100%",
                      height: 80,
                      padding: "6px 8px",
                      border: "1px solid #4a5568",
                      borderRadius: 4,
                      background: "#2d3748",
                      color: "#e2e8f0",
                      fontSize: 13,
                      resize: 'vertical'
                    }}
                    placeholder="Enter output prompt"
                  />
                </div>
              )}

              {selectedNode.data?.nodeType === 'Concat' && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", color: "#cbd5e0", fontSize: 12, marginBottom: 4 }}>Separator</label>
                  <input
                    type="text"
                    value={selectedNode.data?.separator || " "}
                    onChange={(e) => {
                      setNodes(prev => prev.map(n => 
                        n.id === selectedNodeId 
                          ? { ...n, data: { ...n.data, separator: e.target.value } }
                          : n
                      ));
                    }}
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      border: "1px solid #4a5568",
                      borderRadius: 4,
                      background: "#2d3748",
                      color: "#e2e8f0",
                      fontSize: 13
                    }}
                  />
                </div>
              )}

              {selectedNode.data?.nodeType === 'SetVariable' && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", color: "#cbd5e0", fontSize: 12, marginBottom: 4 }}>Variable Name</label>
                    <input
                      type="text"
                      value={selectedNode.data?.variableName || ""}
                      onChange={(e) => {
                        setNodes(prev => prev.map(n => 
                          n.id === selectedNodeId 
                            ? { ...n, data: { ...n.data, variableName: e.target.value } }
                            : n
                        ));
                      }}
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        border: "1px solid #4a5568",
                        borderRadius: 4,
                        background: "#2d3748",
                        color: "#e2e8f0",
                        fontSize: 13
                      }}
                      placeholder="e.g., userName"
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", color: "#cbd5e0", fontSize: 12, marginBottom: 4 }}>Value</label>
                    <textarea
                      value={selectedNode.data?.value || ""}
                      onChange={(e) => {
                        setNodes(prev => prev.map(n => 
                          n.id === selectedNodeId 
                            ? { ...n, data: { ...n.data, value: e.target.value } }
                            : n
                        ));
                      }}
                      style={{
                        width: "100%",
                        height: 60,
                        padding: "6px 8px",
                        border: "1px solid #4a5568",
                        borderRadius: 4,
                        background: "#2d3748",
                        color: "#e2e8f0",
                        fontSize: 13,
                        resize: 'vertical'
                      }}
                      placeholder="Variable value"
                    />
                  </div>
                </>
              )}

              {selectedNode.data?.nodeType === 'GetVariable' && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", color: "#cbd5e0", fontSize: 12, marginBottom: 4 }}>Variable Name</label>
                  <input
                    type="text"
                    value={selectedNode.data?.variableName || ""}
                    onChange={(e) => {
                      setNodes(prev => prev.map(n => 
                        n.id === selectedNodeId 
                          ? { ...n, data: { ...n.data, variableName: e.target.value } }
                          : n
                      ));
                    }}
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      border: "1px solid #4a5568",
                      borderRadius: 4,
                      background: "#2d3748",
                      color: "#e2e8f0",
                      fontSize: 13
                    }}
                    placeholder="e.g., userName"
                  />
                </div>
              )}
              
              <div style={{ fontSize: 11, color: "#718096", marginTop: 16 }}>
                ID: {selectedNode.id}
              </div>
            </div>
          );
        })() : (
          <em style={{ color: "#a0aec0" }}>Select a node to edit its properties.</em>
        )}
      </aside>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowEditor />
    </ReactFlowProvider>
  );
}