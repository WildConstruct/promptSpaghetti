import React from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  ConnectionMode,
  ReactFlowInstance,
} from 'reactflow';
import { CustomMinimap } from '../CustomMinimap';
import { ConnectionFeedback } from '../ConnectionFeedback';
import { PanZoomControls } from '../PanZoomControls';
import { SafeReactFlowWrapper } from '../SafeReactFlowWrapper';

interface GraphCanvasProps {
  nodes: Node[];
  edges: Edge[];
  nodeTypes: any;
  edgeTypes: any;
  onNodesChange: (changes: any[]) => void;
  onEdgesChange: (changes: any[]) => void;
  onConnect: (params: any) => void;
  onPaneClick: (event: React.MouseEvent) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onEdgeClick: (event: React.MouseEvent, edge: Edge) => void;
  onSelectionStart: () => void;
  onSelectionEnd: () => void;
  onInit: (instance: ReactFlowInstance) => void;
  isValidConnection: (connection: any) => boolean;
  activatedEdges: Set<string>;
  showMinimap?: boolean;
  minimapStyle?: React.CSSProperties;
  children?: React.ReactNode;
}

/**
 * GraphCanvas - Pure presentation component for the ReactFlow canvas
 * Handles only the visual rendering and basic interactions
 */
export const GraphCanvas: React.FC<GraphCanvasProps> = ({
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
  children,
}) => {
  // Process edges to add activation and selection classes
  const processedEdges = edges.map(edge => ({
    ...edge,
    animated: activatedEdges.has(edge.id),
    className: `${activatedEdges.has(edge.id) ? 'activated' : ''} ${edge.selected ? 'selected' : ''}`.trim()
  }));

  return (
    <ReactFlow
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
      panOnDrag={[1, 2]}
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