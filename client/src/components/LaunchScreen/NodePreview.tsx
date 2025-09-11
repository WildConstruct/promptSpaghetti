import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeTypes,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import type {
  PromptAnalysis,
  GeneratedNodeInternal
} from '../../lib/simplePromptParser';
import './NodePreview.css';

interface NodePreviewProps {
  analysis: PromptAnalysis | null;
  onNodeSelect?: (nodeId: string | null) => void;
  selectedNodeId?: string | null;
}

// Simple preview node component
const PreviewNode: React.FC<{ data: any; selected: boolean }> = ({
  data,
  selected
}) => {
  const nodeColor = data.color || '#666';

  return (
    <div
      className={`preview-node ${selected ? 'selected' : ''}`}
      style={{
        borderColor: nodeColor,
        backgroundColor: selected ? `${nodeColor}22` : 'transparent'
      }}
    >
      <Handle type="target" position={Position.Left} />
      <div className="preview-node-type">{data.nodeType}</div>
      <div className="preview-node-content">{data.label}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  preview: PreviewNode
};

export const NodePreview: React.FC<NodePreviewProps> = ({
  analysis,
  onNodeSelect,
  selectedNodeId
}) => {
  // Convert analysis to ReactFlow nodes and edges
  const { flowNodes, flowEdges } = useMemo(() => {
    if (!analysis || !analysis.nodes || analysis.nodes.length === 0) {
      return { flowNodes: [], flowEdges: [] };
    }

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const nodeWidth = 180;
    const nodeHeight = 80;
    const horizontalSpacing = 320; // Increased from 250 to prevent overlap
    const verticalSpacing = 150; // Increased from 120 for better spacing

    // Create nodes from analysis
    analysis.nodes.forEach((genNode, index) => {
      const row = Math.floor(index / 3); // 3 nodes per row
      const col = index % 3;

      // Find the mapping for this node to get its color
      const mapping = analysis.mappings.find(m => m.nodeId === genNode.node.id);
      const color = mapping?.highlightColor || '#666';
      const internal: GeneratedNodeInternal = genNode.node;
      const label =
        internal.nodeType === 'Variable'
          ? internal.variableName
            ? `$${internal.variableName}`
            : 'Variable'
          : internal.getPreviewText
            ? internal.getPreviewText()
            : 'Text';

      nodes.push({
        id: genNode.node.id,
        type: 'preview',
        position: {
          x: col * horizontalSpacing + 50,
          y: row * verticalSpacing + 50
        },
        data: {
          label,
          nodeType: internal.nodeType,
          color: color
        },
        selected: genNode.node.id === selectedNodeId
      });
    });

    // Create edges based on node relationships
    // For now, create a simple chain if multiple nodes
    if (nodes.length > 1) {
      for (let i = 0; i < nodes.length - 1; i++) {
        edges.push({
          id: `edge-${i}`,
          source: nodes[i].id,
          target: nodes[i + 1].id,
          type: 'smoothstep',
          animated: true,
          style: {
            stroke: '#666',
            strokeWidth: 2
          }
        });
      }
    }

    return { flowNodes: nodes, flowEdges: edges };
  }, [analysis, selectedNodeId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // Update nodes when analysis changes
  React.useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setNodes, setEdges]);

  // Handle node click
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (onNodeSelect) {
        onNodeSelect(node.id);
      }
    },
    [onNodeSelect]
  );

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    if (onNodeSelect) {
      onNodeSelect(null);
    }
  }, [onNodeSelect]);

  if (!analysis || analysis.nodes.length === 0) {
    return (
      <div className="node-preview-empty">
        <div className="empty-state">
          <svg
            className="empty-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <path d="M10 7h4M7 10v4M17 10v4M10 17h4" strokeLinecap="round" />
          </svg>
          <p>Enter a prompt to see the node graph</p>
          <p className="empty-hint">
            Your text will be automatically parsed into interconnected nodes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="node-preview">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#333" gap={16} size={1} />
        <Controls />
        <MiniMap
          nodeColor={node => node.data?.color || '#666'}
          style={{
            backgroundColor: 'rgba(20, 22, 28, 0.95)',
            width: 120,
            height: 80
          }}
          maskColor="rgba(103, 126, 234, 0.15)"
        />
      </ReactFlow>
    </div>
  );
};
