import React from 'react';
import ReactFlow, {
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type NodeChange,
  type EdgeChange,
  type NodeMouseHandler,
  type EdgeMouseHandler,
  type PaneMouseHandler,
  type OnConnect,
  type Connection,
  Background,
  Controls,
  ConnectionMode,
  type ReactFlowInstance
} from 'reactflow';
import { CustomMinimap } from '../CustomMinimap';
import { ConnectionFeedback } from '../ConnectionFeedback';
import { PanZoomControls } from '../PanZoomControls';
import { SafeReactFlowWrapper } from '../SafeReactFlowWrapper';

interface GraphCanvasProps<TNodeData = unknown, TEdgeData = unknown> {
  nodes: Array<Node<TNodeData>>;
  edges: Array<Edge<TEdgeData>>;
  nodeTypes: NodeTypes<TNodeData>;
  edgeTypes: EdgeTypes<TEdgeData>;
  onNodesChange: (changes: NodeChange<TNodeData>[]) => void;
  onEdgesChange: (changes: EdgeChange<TEdgeData>[]) => void;
  onConnect: OnConnect;
  onPaneClick: PaneMouseHandler | undefined;
  onNodeClick: NodeMouseHandler<TNodeData>;
  onEdgeClick: EdgeMouseHandler<TEdgeData>;
  onSelectionStart: () => void;
  onSelectionEnd: () => void;
  onInit: (instance: ReactFlowInstance) => void;
  isValidConnection: (connection: Connection) => boolean;
  activatedEdges: Set<string>;
  showMinimap?: boolean;
  minimapStyle?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * GraphCanvas - Pure presentation component for the ReactFlow canvas
 * Handles only the visual rendering and basic interactions
 */
export const GraphCanvas = <TNodeData = unknown, TEdgeData = unknown>({
  nodes,
  edges,
  nodeTypes,
  edgeTypes,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onPaneClick,
  onNodeClick,
  onEdgeClick,
  onSelectionStart,
  onSelectionEnd,
  onInit,
  isValidConnection,
  activatedEdges,
  showMinimap = true,
  minimapStyle,
  children
}: GraphCanvasProps<TNodeData, TEdgeData>) => {
  // Process edges to add activation and selection classes
  const processedEdges = edges.map(edge => ({
    ...edge,
    animated: activatedEdges.has(edge.id),
    className: `${activatedEdges.has(edge.id) ? 'activated' : ''} ${edge.selected ? 'selected' : ''}`.trim()
  }));

  return (
    <ReactFlow<Node<TNodeData>, Edge<TEdgeData>>
      nodes={nodes}
      edges={processedEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onPaneClick={onPaneClick}
      onSelectionStart={onSelectionStart}
      onSelectionEnd={onSelectionEnd}
      onNodeClick={onNodeClick}
      onEdgeClick={onEdgeClick}
      onInit={onInit}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      isValidConnection={isValidConnection}
      connectionMode={ConnectionMode.Loose}
      connectionLineType="smoothstep"
      defaultEdgeOptions={{
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#9ca3af', strokeWidth: 3 }
      }}
      fitView={true}
      fitViewOptions={{
        padding: 0.2,
        includeHiddenNodes: false,
        minZoom: 0.3,
        maxZoom: 2
      }}
      defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      attributionPosition="bottom-left"
      panOnScroll={false}
      zoomOnScroll={true}
      zoomOnPinch={true}
      panOnDrag={[1]}
      selectionOnDrag={true}
      panActivationKeyCode="Space"
      selectionMode="partial"
      nodesDraggable={true}
      nodesConnectable={true}
      elementsSelectable={true}
      selectNodesOnDrag={true}
      deleteKeyCode={['Delete', 'Backspace']}
      multiSelectionKeyCode="Shift"
      nodeDragThreshold={5}
    >
      <Background variant="dots" gap={16} size={1} color="#333333" />
      <Controls />
      
      {showMinimap && nodes.length > 0 && (
        <CustomMinimap 
          nodes={nodes}
          edges={edges}
          style={minimapStyle}
        />
      )}
      
      <ConnectionFeedback nodes={nodes} edges={edges} />
      
      <SafeReactFlowWrapper>
        <PanZoomControls position="bottom-right" />
      </SafeReactFlowWrapper>
      
      {children}
    </ReactFlow>
  );
};
