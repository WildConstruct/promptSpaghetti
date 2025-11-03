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
  Position,
  addEdge,
  Connection
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { PromptAnalysis } from '../../lib/simplePromptParser';
import { convertAnalysisToGraph } from '../../lib/analysisToGraph';
import './NodePreview.css';

interface NodePreviewProps {
  analysis: PromptAnalysis | null;
  onNodeSelect?: (nodeId: string | null) => void;
  selectedNodeId?: string | null;
}

interface PreviewNodeData {
  label: string;
  nodeType: string;
  color?: string;
}

// Simple preview node component
const PreviewNode: React.FC<{
  data: PreviewNodeData;
  selected: boolean;
}> = ({ data, selected }) => {
  const nodeColor = data.color || '#666';

  return (
    <div
      className={`preview-node ${selected ? 'selected' : ''}`}
      style={{
        borderColor: nodeColor,
        backgroundColor: selected ? `${nodeColor}22` : 'transparent'
      }}
    >
      <Handle id="target" type="target" position={Position.Left} />
      <div className="preview-node-type">{data.nodeType}</div>
      <div className="preview-node-content">{data.label}</div>
      <Handle id="source" type="source" position={Position.Right} />
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

    const graph = convertAnalysisToGraph(analysis, {
      nodesPerRow: 3,
      spacing: { x: 320, y: 150 },
      start: { x: 50, y: 50 }
    });

    const flowNodes: Node<PreviewNodeData>[] = graph.nodes.map(node => {
      const mapping = analysis.mappings.find(m => m.nodeId === node.id);
      const color = mapping?.highlightColor || '#666';
      const labelCandidate =
        typeof node.data?.label === 'string' && node.data.label.length > 0
          ? node.data.label
          : typeof node.data?.value === 'string'
            ? node.data.value
            : node.id;
      const nodeType =
        typeof node.data?.nodeType === 'string' ? node.data.nodeType : 'Text';

      return {
        id: node.id,
        type: 'preview',
        position: node.position ?? { x: 50, y: 50 },
        data: {
          label: labelCandidate,
          nodeType,
          color
        },
        selected: node.id === selectedNodeId
      };
    });

    const flowEdges: Edge[] = graph.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type ?? 'smoothstep',
      animated: true,
      style: {
        stroke: '#666',
        strokeWidth: 2
      }
    }));

    return { flowNodes, flowEdges };
  }, [analysis, selectedNodeId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  // Allow users to connect nodes in the preview
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges(eds =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#666', strokeWidth: 2 }
          },
          eds
        )
      );
    },
    [setEdges]
  );

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
    <div
      className="node-preview"
      style={{ display: 'flex', flex: 1, minHeight: 0, height: '100%' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={() => true}
        connectionMode="loose"
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        style={{ width: '100%', height: '100%' }}
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
