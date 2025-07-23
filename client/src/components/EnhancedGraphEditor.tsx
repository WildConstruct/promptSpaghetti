import React, { useState, useCallback, useRef } from 'react';
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
  BackgroundVariant,
  NodeTypes,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';

// Professional Design System
interface ProfessionalColors {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  text: {
    primary: string;
    secondary: string;
    accent: string;
  };
  accent: {
    orange: string;
    blue: string;
    cyan: string;
    purple: string;
    green: string;
    red: string;
  };
  nodes: {
    text: string;
    logic: string;
    output: string;
    variable: string;
    advanced: string;
    transform: string;
  };
  ui: {
    border: string;
    borderHover: string;
    borderActive: string;
    hover: string;
    selection: string;
  };
}

const professionalColors: ProfessionalColors = {
  background: {
    primary: '#1e1e1e',
    secondary: '#2a2a2a',
    tertiary: '#353535',
  },
  text: {
    primary: '#e8e8e8',
    secondary: '#b8b8b8',
    accent: '#ff7c00',
  },
  accent: {
    orange: '#ff7c00',
    blue: '#4a9eff',
    cyan: '#00d4ff',
    purple: '#b45cff',
    green: '#4ade80',
    red: '#ef4444',
  },
  nodes: {
    text: '#4f46e5',
    logic: '#059669',
    output: '#dc2626',
    variable: '#7c3aed',
    advanced: '#6366f1',
    transform: '#f59e0b',
  },
  ui: {
    border: '#404040',
    borderHover: '#5a5a5a',
    borderActive: '#ff7c00',
    hover: '#2d2d2d',
    selection: '#ff7c0040',
  }
};

const professionalShadows = {
  node: {
    default: '0 4px 12px rgba(0, 0, 0, 0.35), 0 2px 4px rgba(0, 0, 0, 0.2)',
    hover: '0 8px 25px rgba(0, 0, 0, 0.45), 0 4px 10px rgba(0, 0, 0, 0.25)',
    selected: '0 0 0 2px #ff7c00, 0 8px 25px rgba(255, 124, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.4)',
  }
};

interface EnhancedGraphEditorProps {
  initialNodes?: unknown[];
  initialEdges?: unknown[];
}

interface NodeData {
  label?: string;
  description?: string;
  category?: string;
  type?: string;
}

// Professional Node Components
const TextNode = ({ data, selected }: { data: NodeData; selected: boolean }) => (
  <div style={{
    background: `linear-gradient(135deg, ${professionalColors.nodes.text}15, ${professionalColors.nodes.text}25)`,
    border: `2px solid ${selected ? professionalColors.ui.borderActive : professionalColors.nodes.text}`,
    borderRadius: '8px',
    padding: '12px 16px',
    minWidth: '160px',
    color: professionalColors.text.primary,
    boxShadow: selected ? professionalShadows.node.selected : professionalShadows.node.default,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(8px)',
    position: 'relative',
  }}>
    <Handle
      type="target"
      position={Position.Left}
      style={{
        background: professionalColors.nodes.text,
        border: `2px solid ${professionalColors.background.primary}`,
        width: '12px',
        height: '12px',
      }}
    />
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      marginBottom: '6px',
      fontSize: '14px',
      fontWeight: 600,
      color: professionalColors.nodes.text
    }}>
      <span style={{ marginRight: '8px', fontSize: '16px' }}>📝</span>
      {data.label || 'Text Node'}
    </div>
    <div style={{ 
      fontSize: '12px', 
      color: professionalColors.text.secondary,
      lineHeight: 1.4
    }}>
      {data.description || 'Text manipulation and processing'}
    </div>
    <Handle
      type="source"
      position={Position.Right}
      style={{
        background: professionalColors.nodes.text,
        border: `2px solid ${professionalColors.background.primary}`,
        width: '12px',
        height: '12px',
      }}
    />
  </div>
);

const LogicNode = ({ data, selected }: { data: NodeData; selected: boolean }) => (
  <div style={{
    background: `linear-gradient(135deg, ${professionalColors.nodes.logic}15, ${professionalColors.nodes.logic}25)`,
    border: `2px solid ${selected ? professionalColors.ui.borderActive : professionalColors.nodes.logic}`,
    borderRadius: '8px',
    padding: '12px 16px',
    minWidth: '160px',
    color: professionalColors.text.primary,
    boxShadow: selected ? professionalShadows.node.selected : professionalShadows.node.default,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(8px)',
    position: 'relative',
  }}>
    <Handle
      type="target"
      position={Position.Left}
      style={{
        background: professionalColors.nodes.logic,
        border: `2px solid ${professionalColors.background.primary}`,
        width: '12px',
        height: '12px',
      }}
    />
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      marginBottom: '6px',
      fontSize: '14px',
      fontWeight: 600,
      color: professionalColors.nodes.logic
    }}>
      <span style={{ marginRight: '8px', fontSize: '16px' }}>⚡</span>
      {data.label || 'Logic Node'}
    </div>
    <div style={{ 
      fontSize: '12px', 
      color: professionalColors.text.secondary,
      lineHeight: 1.4
    }}>
      {data.description || 'Logic and flow control'}
    </div>
    <Handle
      type="source"
      position={Position.Right}
      style={{
        background: professionalColors.nodes.logic,
        border: `2px solid ${professionalColors.background.primary}`,
        width: '12px',
        height: '12px',
      }}
    />
  </div>
);

const OutputNode = ({ data, selected }: { data: NodeData; selected: boolean }) => (
  <div style={{
    background: `linear-gradient(135deg, ${professionalColors.nodes.output}15, ${professionalColors.nodes.output}25)`,
    border: `2px solid ${selected ? professionalColors.ui.borderActive : professionalColors.nodes.output}`,
    borderRadius: '8px',
    padding: '12px 16px',
    minWidth: '160px',
    color: professionalColors.text.primary,
    boxShadow: selected ? professionalShadows.node.selected : professionalShadows.node.default,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(8px)',
    position: 'relative',
  }}>
    <Handle
      type="target"
      position={Position.Left}
      style={{
        background: professionalColors.nodes.output,
        border: `2px solid ${professionalColors.background.primary}`,
        width: '12px',
        height: '12px',
      }}
    />
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      marginBottom: '6px',
      fontSize: '14px',
      fontWeight: 600,
      color: professionalColors.nodes.output
    }}>
      <span style={{ marginRight: '8px', fontSize: '16px' }}>📤</span>
      {data.label || 'Output Node'}
    </div>
    <div style={{ 
      fontSize: '12px', 
      color: professionalColors.text.secondary,
      lineHeight: 1.4
    }}>
      {data.description || 'Final output generation'}
    </div>
  </div>
);

const VariableNode = ({ data, selected }: { data: NodeData; selected: boolean }) => (
  <div style={{
    background: `linear-gradient(
      135deg,
      ${professionalColors.nodes.variable}15,
      ${professionalColors.nodes.variable}25
    )`,
    border: `2px solid ${selected ? professionalColors.ui.borderActive : professionalColors.nodes.variable}`,
    borderRadius: '8px',
    padding: '12px 16px',
    minWidth: '160px',
    color: professionalColors.text.primary,
    boxShadow: selected ? professionalShadows.node.selected : professionalShadows.node.default,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(8px)',
    position: 'relative',
  }}>
    <Handle
      type="target"
      position={Position.Left}
      style={{
        background: professionalColors.nodes.variable,
        border: `2px solid ${professionalColors.background.primary}`,
        width: '12px',
        height: '12px',
      }}
    />
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      marginBottom: '6px',
      fontSize: '14px',
      fontWeight: 600,
      color: professionalColors.nodes.variable
    }}>
      <span style={{ marginRight: '8px', fontSize: '16px' }}>🔗</span>
      {data.label || 'Variable Node'}
    </div>
    <div style={{ 
      fontSize: '12px', 
      color: professionalColors.text.secondary,
      lineHeight: 1.4
    }}>
      {data.description || 'Variable storage and retrieval'}
    </div>
    <Handle
      type="source"
      position={Position.Right}
      style={{
        background: professionalColors.nodes.variable,
        border: `2px solid ${professionalColors.background.primary}`,
        width: '12px',
        height: '12px',
      }}
    />
  </div>
);

const TransformNode = ({ data, selected }: { data: NodeData; selected: boolean }) => (
  <div style={{
    background: `linear-gradient(
      135deg,
      ${professionalColors.nodes.transform}15,
      ${professionalColors.nodes.transform}25
    )`,
    border: `2px solid ${selected ? professionalColors.ui.borderActive : professionalColors.nodes.transform}`,
    borderRadius: '8px',
    padding: '12px 16px',
    minWidth: '160px',
    color: professionalColors.text.primary,
    boxShadow: selected ? professionalShadows.node.selected : professionalShadows.node.default,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(8px)',
    position: 'relative',
  }}>
    <Handle
      type="target"
      position={Position.Left}
      style={{
        background: professionalColors.nodes.transform,
        border: `2px solid ${professionalColors.background.primary}`,
        width: '12px',
        height: '12px',
      }}
    />
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      marginBottom: '6px',
      fontSize: '14px',
      fontWeight: 600,
      color: professionalColors.nodes.transform
    }}>
      <span style={{ marginRight: '8px', fontSize: '16px' }}>🔄</span>
      {data.label || 'Transform Node'}
    </div>
    <div style={{ 
      fontSize: '12px', 
      color: professionalColors.text.secondary,
      lineHeight: 1.4
    }}>
      {data.description || 'Data transformation and processing'}
    </div>
    <Handle
      type="source"
      position={Position.Right}
      style={{
        background: professionalColors.nodes.transform,
        border: `2px solid ${professionalColors.background.primary}`,
        width: '12px',
        height: '12px',
      }}
    />
  </div>
);

// Node Types Registry
const nodeTypes: NodeTypes = {
  text: TextNode,
  logic: LogicNode,
  output: OutputNode,
  variable: VariableNode,
  transform: TransformNode,
};

// Node Categories for Palette
const nodeCategories = {
  'Content': [
    { id: 'text', label: 'Text Node', icon: '📝', description: 'Text manipulation and processing' },
    { id: 'output', label: 'Output Node', icon: '📤', description: 'Final output generation' },
  ],
  'Logic': [
    { id: 'logic', label: 'Logic Node', icon: '⚡', description: 'Logic and flow control' },
    { id: 'variable', label: 'Variable Node', icon: '🔗', description: 'Variable storage and retrieval' },
  ],
  'Transform': [
    { id: 'transform', label: 'Transform Node', icon: '🔄', description: 'Data transformation and processing' },
  ]
};

// Professional Palette Component
const ProfessionalPalette: React.FC<{
  collapsed: boolean;
  onToggle: () => void;
}> = ({ collapsed, onToggle }) => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside style={{
    width: collapsed ? 56 : 240,
    background: professionalColors.background.secondary,
    borderRight: `1px solid ${professionalColors.ui.border}`,
    height: '100%',
    transition: 'width 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.3)',
  }}>
    <button
      onClick={onToggle}
      style={{
        background: professionalColors.ui.hover,
        border: `1px solid ${professionalColors.ui.border}`,
        color: professionalColors.text.primary,
        fontSize: '18px',
        width: '100%',
        padding: '12px 0',
        cursor: 'pointer',
        outline: 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {collapsed ? '»' : '«'}
    </button>
    
    <div style={{ 
      flex: 1, 
      overflowY: 'auto', 
      padding: collapsed ? '8px 4px' : '16px 12px',
      scrollbarWidth: 'thin',
      scrollbarColor: `${professionalColors.ui.border} transparent`,
    }}>
      {collapsed ? (
        // Collapsed view - icons only
        Object.values(nodeCategories).flat().map((node) => (
          <div
            key={node.id}
            draggable
            onDragStart={(event) => onDragStart(event, node.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 0',
              marginBottom: '4px',
              borderRadius: '6px',
              cursor: 'grab',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              fontSize: '20px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = professionalColors.ui.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
            title={`${node.label} - ${node.description}`}
          >
            {node.icon}
          </div>
        ))
      ) : (
        // Expanded view - categories
        Object.entries(nodeCategories).map(([category, nodes]) => (
          <div key={category} style={{ marginBottom: '20px' }}>
            <h3 style={{
              color: professionalColors.text.accent,
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {category}
            </h3>
            {nodes.map((node) => (
              <div
                key={node.id}
                draggable
                onDragStart={(event) => onDragStart(event, node.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 12px',
                  marginBottom: '6px',
                  borderRadius: '6px',
                  cursor: 'grab',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: `1px solid transparent`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = professionalColors.ui.hover;
                  e.currentTarget.style.borderColor = professionalColors.ui.borderHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <span style={{ fontSize: '18px', marginRight: '12px' }}>{node.icon}</span>
                <div>
                  <div style={{
                    color: professionalColors.text.primary,
                    fontSize: '14px',
                    fontWeight: 500,
                    marginBottom: '2px',
                  }}>
                    {node.label}
                  </div>
                  <div style={{
                    color: professionalColors.text.secondary,
                    fontSize: '11px',
                    lineHeight: 1.3,
                  }}>
                    {node.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
    </aside>
  );
};

// Inspector Panel Component
const InspectorPanel: React.FC<{
  selectedNode: Node | null;
  onUpdateNode: (nodeId: string, updates: Partial<NodeData>) => void;
  onDeleteNode: (nodeId: string) => void;
}> = ({ selectedNode, onUpdateNode, onDeleteNode }) => {
  const [label, setLabel] = useState(selectedNode?.data?.label || '');
  const [description, setDescription] = useState(selectedNode?.data?.description || '');

  React.useEffect(() => {
    setLabel(selectedNode?.data?.label || '');
    setDescription(selectedNode?.data?.description || '');
  }, [selectedNode]);

  const handleSave = useCallback(() => {
    if (selectedNode) {
      onUpdateNode(selectedNode.id, { label, description });
    }
  }, [selectedNode, label, description, onUpdateNode]);

  if (!selectedNode) {
    return (
      <div style={{
        width: '300px',
        background: professionalColors.background.secondary,
        borderLeft: `1px solid ${professionalColors.ui.border}`,
        padding: '20px',
        color: professionalColors.text.secondary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        fontSize: '14px',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>🔍</div>
        <div style={{ textAlign: 'center', lineHeight: 1.5 }}>
          Select a node to edit its properties
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '300px',
      background: professionalColors.background.secondary,
      borderLeft: `1px solid ${professionalColors.ui.border}`,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: `1px solid ${professionalColors.ui.border}`,
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: professionalColors.nodes[selectedNode.type as keyof typeof professionalColors.nodes] || professionalColors.ui.border,
          marginRight: '12px',
        }} />
        <div>
          <div style={{
            color: professionalColors.text.primary,
            fontSize: '16px',
            fontWeight: 600,
            marginBottom: '2px',
          }}>
            {selectedNode.type?.charAt(0).toUpperCase()}{selectedNode.type?.slice(1)} Node
          </div>
          <div style={{
            color: professionalColors.text.secondary,
            fontSize: '12px',
          }}>
            ID: {selectedNode.id}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          color: professionalColors.text.primary,
          fontSize: '13px',
          fontWeight: 500,
          marginBottom: '8px',
        }}>
          Label
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleSave}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: professionalColors.background.primary,
            border: `1px solid ${professionalColors.ui.border}`,
            borderRadius: '6px',
            color: professionalColors.text.primary,
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = professionalColors.ui.borderActive;
          }}
          onBlurCapture={(e) => {
            e.target.style.borderColor = professionalColors.ui.border;
            handleSave();
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          color: professionalColors.text.primary,
          fontSize: '13px',
          fontWeight: 500,
          marginBottom: '8px',
        }}>
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleSave}
          rows={3}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: professionalColors.background.primary,
            border: `1px solid ${professionalColors.ui.border}`,
            borderRadius: '6px',
            color: professionalColors.text.primary,
            fontSize: '14px',
            outline: 'none',
            resize: 'vertical',
            minHeight: '80px',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = professionalColors.ui.borderActive;
          }}
          onBlurCapture={(e) => {
            e.target.style.borderColor = professionalColors.ui.border;
            handleSave();
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          color: professionalColors.text.primary,
          fontSize: '13px',
          fontWeight: 500,
          marginBottom: '8px',
        }}>
          Position
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
        }}>
          <div>
            <div style={{
              fontSize: '11px',
              color: professionalColors.text.secondary,
              marginBottom: '4px',
            }}>
              X
            </div>
            <div style={{
              padding: '8px 12px',
              background: professionalColors.background.primary,
              border: `1px solid ${professionalColors.ui.border}`,
              borderRadius: '6px',
              color: professionalColors.text.secondary,
              fontSize: '14px',
              textAlign: 'center',
            }}>
              {Math.round(selectedNode.position.x)}
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '11px',
              color: professionalColors.text.secondary,
              marginBottom: '4px',
            }}>
              Y
            </div>
            <div style={{
              padding: '8px 12px',
              background: professionalColors.background.primary,
              border: `1px solid ${professionalColors.ui.border}`,
              borderRadius: '6px',
              color: professionalColors.text.secondary,
              fontSize: '14px',
              textAlign: 'center',
            }}>
              {Math.round(selectedNode.position.y)}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
        <button
          onClick={() => onDeleteNode(selectedNode.id)}
          style={{
            width: '100%',
            padding: '10px 16px',
            background: professionalColors.accent.red + '20',
            border: `1px solid ${professionalColors.accent.red}`,
            borderRadius: '6px',
            color: professionalColors.accent.red,
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = professionalColors.accent.red + '30';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = professionalColors.accent.red + '20';
          }}
        >
          🗑️ Delete Node
        </button>
      </div>
    </div>
  );
};

// Status Bar Component
const StatusBar: React.FC<{
  nodeCount: number;
  edgeCount: number;
  onSave: () => void;
  onLoad: () => void;
  onClear: () => void;
}> = ({ nodeCount, edgeCount, onSave, onLoad, onClear }) => (
  <div style={{
    height: '40px',
    background: professionalColors.background.tertiary,
    borderTop: `1px solid ${professionalColors.ui.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    fontSize: '12px',
    color: professionalColors.text.secondary,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <span>Nodes: {nodeCount}</span>
      <span>Edges: {edgeCount}</span>
      <span style={{ color: professionalColors.accent.green }}>✓ Ready</span>
    </div>
    
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        onClick={onSave}
        style={{
          background: professionalColors.ui.hover,
          border: `1px solid ${professionalColors.ui.border}`,
          color: professionalColors.text.primary,
          padding: '4px 8px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '11px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        💾 Save
      </button>
      <button
        onClick={onLoad}
        style={{
          background: professionalColors.ui.hover,
          border: `1px solid ${professionalColors.ui.border}`,
          color: professionalColors.text.primary,
          padding: '4px 8px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '11px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        📁 Load
      </button>
      <button
        onClick={onClear}
        style={{
          background: professionalColors.ui.hover,
          border: `1px solid ${professionalColors.ui.border}`,
          color: professionalColors.text.primary,
          padding: '4px 8px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '11px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        🗑️ Clear
      </button>
    </div>
  </div>
);

// Techpanel Demo Graph - Anachronistic Tech Panel Generator
const defaultNodes: Node[] = [
  {
    id: "start-1",
    type: "text",
    position: { x: 100, y: 100 },
    data: {
      label: "Tech Panel Generator",
      description: "Anachronistic Tech Panel Generator - Creates retro-futuristic interface prompts",
      category: "content"
    }
  },
  {
    id: "archetype-2", 
    type: "logic",
    position: { x: 350, y: 50 },
    data: {
      label: "Panel Archetype",
      description: "Choose panel type: Cockpit, Bridge Console, Engineering Panel, etc.",
      category: "logic"
    }
  },
  {
    id: "aesthetic-3",
    type: "logic", 
    position: { x: 350, y: 150 },
    data: {
      label: "Aesthetic Influence",
      description: "Style: Star Wars, Cassette Futurism, Dieselpunk, Atompunk, etc.",
      category: "logic"
    }
  },
  {
    id: "faction-4",
    type: "logic",
    position: { x: 600, y: 50 },
    data: {
      label: "Faction Alignment", 
      description: "Empire/Corporate, Rebel/Resistance, Civilian/Smuggler, etc.",
      category: "logic"
    }
  },
  {
    id: "wear-5",
    type: "transform",
    position: { x: 600, y: 150 },
    data: {
      label: "Wear Level",
      description: "Condition: Pristine, Lightly Used, Battle-Scarred, etc.",
      category: "transform"
    }
  },
  {
    id: "colors-6",
    type: "transform",
    position: { x: 350, y: 250 },
    data: {
      label: "Color Palette",
      description: "Dark Grays & Blues, Military Greens, Chrome & Pastels, etc.",
      category: "transform"
    }
  },
  {
    id: "materials-7",
    type: "transform",
    position: { x: 600, y: 250 },
    data: {
      label: "Key Materials",
      description: "Painted Metal, Bakelite, Aged Plastic, Cast Iron, etc.",
      category: "transform"
    }
  },
  {
    id: "screen-8",
    type: "logic",
    position: { x: 100, y: 200 },
    data: {
      label: "Screen Type",
      description: "CRT, Vector Display, Nixie Tubes, LED Segments, etc.",
      category: "logic"
    }
  },
  {
    id: "controls-9",
    type: "logic",
    position: { x: 100, y: 300 },
    data: {
      label: "Controls",
      description: "Toggle Switches, Chunky Buttons, Rotary Dials, etc.",
      category: "logic"
    }
  },
  {
    id: "greeble-10",
    type: "transform",
    position: { x: 350, y: 350 },
    data: {
      label: "Detail Density",
      description: "Greeble level: None, Low, Medium, High, Extreme",
      category: "transform"
    }
  },
  {
    id: "labeling-11",
    type: "variable",
    position: { x: 600, y: 350 },
    data: {
      label: "Labeling Style",
      description: "Stenciled, Engraved, Dymo Tape, Alien Glyphs, etc.",
      category: "variable"
    }
  },
  {
    id: "lighting-12",
    type: "variable",
    position: { x: 100, y: 400 },
    data: {
      label: "Panel Lighting",
      description: "Dimly Lit, Harsh Industrial, Soft Glow, Flickering, etc.",
      category: "variable"
    }
  },
  {
    id: "function-13",
    type: "variable",
    position: { x: 350, y: 450 },
    data: {
      label: "Tech Function",
      description: "Navigation Computer, Weapons Control, Life Support, etc.",
      category: "variable"
    }
  },
  {
    id: "output-final",
    type: "output",
    position: { x: 600, y: 500 },
    data: {
      label: "Generated Prompt",
      description: "Final detailed prompt for retro-futuristic tech panel",
      category: "content"
    }
  }
];

const defaultEdges: Edge[] = [
  { id: "e1-2", source: "start-1", target: "archetype-2", type: "smoothstep" },
  { id: "e1-3", source: "start-1", target: "aesthetic-3", type: "smoothstep" },
  { id: "e1-8", source: "start-1", target: "screen-8", type: "smoothstep" },
  { id: "e2-4", source: "archetype-2", target: "faction-4", type: "smoothstep" },
  { id: "e3-5", source: "aesthetic-3", target: "wear-5", type: "smoothstep" },
  { id: "e3-6", source: "aesthetic-3", target: "colors-6", type: "smoothstep" },
  { id: "e4-7", source: "faction-4", target: "materials-7", type: "smoothstep" },
  { id: "e5-7", source: "wear-5", target: "materials-7", type: "smoothstep" },
  { id: "e6-10", source: "colors-6", target: "greeble-10", type: "smoothstep" },
  { id: "e7-11", source: "materials-7", target: "labeling-11", type: "smoothstep" },
  { id: "e8-9", source: "screen-8", target: "controls-9", type: "smoothstep" },
  { id: "e9-12", source: "controls-9", target: "lighting-12", type: "smoothstep" },
  { id: "e10-13", source: "greeble-10", target: "function-13", type: "smoothstep" },
  { id: "e11-final", source: "labeling-11", target: "output-final", type: "smoothstep" },
  { id: "e12-13", source: "lighting-12", target: "function-13", type: "smoothstep" },
  { id: "e13-final", source: "function-13", target: "output-final", type: "smoothstep" }
];

const EnhancedGraphEditorInner: React.FC<EnhancedGraphEditorProps> = ({
  initialNodes = [],
  initialEdges = []
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialNodes.length > 0 ? (initialNodes as Node[]) : defaultNodes
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialEdges.length > 0 ? (initialEdges as Edge[]) : defaultEdges
  );
  
  const [paletteCollapsed, setPaletteCollapsed] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      style: { stroke: professionalColors.accent.cyan, strokeWidth: 2 }
    }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
    },
    []
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const type = event.dataTransfer.getData('application/reactflow');
    if (typeof type === 'undefined' || !type) {
      return;
    }

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const nodeConfig = Object.values(nodeCategories).flat().find(n => n.id === type);
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type,
      position,
      data: { 
        label: nodeConfig?.label || `New ${type}`,
        description: nodeConfig?.description || `${type} node created ${new Date().toLocaleTimeString()}`,
        category: type
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }, [screenToFlowPosition, setNodes]);

  const saveGraph = useCallback(() => {
    const graphData = { nodes, edges, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(graphData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `graph-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const loadGraph = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            if (data.nodes) setNodes(data.nodes);
            if (data.edges) setEdges(data.edges);
          } catch {
            alert('Invalid graph file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [setNodes, setEdges]);

  const clearGraph = useCallback(() => {
    if (confirm('Clear all nodes and edges?')) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
    }
  }, [setNodes, setEdges]);

  const updateNode = useCallback((nodeId: string, updates: Partial<NodeData>) => {
    setNodes((nds) => nds.map((node) => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...updates } }
        : node
    ));
  }, [setNodes]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex',
      flexDirection: 'column',
      background: professionalColors.background.primary,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "SF Pro Display", system-ui, sans-serif',
    }}>
      <div style={{ display: 'flex', flex: 1 }}>
        <ProfessionalPalette
          collapsed={paletteCollapsed}
          onToggle={() => setPaletteCollapsed(!paletteCollapsed)}
        />
        
        <div ref={reactFlowWrapper} style={{ flex: 1, height: '100%', position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            style={{ background: professionalColors.background.primary }}
            connectionLineStyle={{ stroke: professionalColors.accent.cyan, strokeWidth: 2 }}
            defaultEdgeOptions={{
              style: { stroke: professionalColors.accent.cyan, strokeWidth: 2 },
              type: 'smoothstep',
            }}
          >
            <Controls 
              style={{ 
                background: professionalColors.background.secondary,
                border: `1px solid ${professionalColors.ui.border}`,
              }} 
            />
            <MiniMap 
              style={{ 
                background: professionalColors.background.secondary,
                border: `1px solid ${professionalColors.ui.border}`,
              }}
              nodeColor={(node) => {
                const colorMap: Record<string, string> = {
                  text: professionalColors.nodes.text,
                  logic: professionalColors.nodes.logic,
                  output: professionalColors.nodes.output,
                  variable: professionalColors.nodes.variable,
                  transform: professionalColors.nodes.transform,
                };
                return colorMap[node.type || 'text'] || professionalColors.ui.border;
              }}
            />
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1}
              color={professionalColors.ui.border}
            />
          </ReactFlow>
        </div>
        
        <InspectorPanel
          selectedNode={selectedNode}
          onUpdateNode={updateNode}
          onDeleteNode={deleteNode}
        />
      </div>
      
      <StatusBar
        nodeCount={nodes.length}
        edgeCount={edges.length}
        onSave={saveGraph}
        onLoad={loadGraph}
        onClear={clearGraph}
      />
    </div>
  );
};

// Wrapper with ReactFlowProvider
export const EnhancedGraphEditor: React.FC<EnhancedGraphEditorProps> = (props) => (
  <ReactFlowProvider>
    <EnhancedGraphEditorInner {...props} />
  </ReactFlowProvider>
);

export default EnhancedGraphEditor;