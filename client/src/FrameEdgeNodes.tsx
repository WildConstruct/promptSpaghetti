import React from 'react';
import ReactFlow, { 
  Node, 
  Edge, 
  Controls, 
  Background,
  ReactFlowProvider,
  ConnectionMode,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom node component with visible handles
const FrameEdgeNode = ({ data, id }: any) => {
  const getHandlePosition = () => {
    switch (data.frameEdge) {
      case 'top': return { top: Position.Bottom, bottom: Position.Top };
      case 'bottom': return { top: Position.Top, bottom: Position.Bottom };
      case 'left': return { top: Position.Right, bottom: Position.Left };
      case 'right': return { top: Position.Left, bottom: Position.Right };
      default: return { top: Position.Top, bottom: Position.Bottom };
    }
  };
  
  const handles = getHandlePosition();
  
  return (
    <div style={{
      background: '#2a2a3e',
      border: '2px solid #ff6b35',
      borderRadius: '8px',
      padding: '10px 20px',
      color: 'white',
      minWidth: '200px',
      position: 'relative'
    }}>
      <Handle
        type="source"
        position={handles.top}
        style={{
          background: '#ff6b35',
          width: '20px',
          height: '20px',
          border: '3px solid #1a1a2e'
        }}
      />
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{data.label}</div>
      <div style={{ fontSize: '12px' }}>{data.content || data.outputName || 'Node'}</div>
      <Handle
        type="target"
        position={handles.bottom}
        style={{
          background: '#ff6b35',
          width: '20px',
          height: '20px',
          border: '3px solid #1a1a2e'
        }}
      />
      {/* Visual edge indicator */}
      <div style={{
        position: 'absolute',
        width: '100px',
        height: '2px',
        background: 'linear-gradient(90deg, transparent, #ff6b35, transparent)',
        top: '50%',
        [data.frameEdge === 'left' ? 'right' : data.frameEdge === 'right' ? 'left' : 'left']: '100%',
        display: data.frameEdge === 'left' || data.frameEdge === 'right' ? 'block' : 'none'
      }} />
    </div>
  );
};

const nodeTypes = {
  frameEdgeNode: FrameEdgeNode
};

export const FrameEdgeNodes: React.FC = () => {
  // Get viewport dimensions
  const width = window.innerWidth - 400; // Account for panels
  const height = window.innerHeight - 100; // Account for menu
  
  // Create nodes at absolute edges
  const nodes: Node[] = [
    {
      id: '1',
      type: 'frameEdgeNode',
      position: { x: width / 2 - 100, y: 10 }, // Top center
      data: { 
        label: 'Prompt Start', 
        content: 'Generate a character for a',
        frameEdge: 'top'
      }
    },
    {
      id: '2',
      type: 'frameEdgeNode',
      position: { x: width - 220, y: height / 2 - 50 }, // Right middle
      data: { 
        label: 'Setting',
        content: 'medieval fantasy world',
        frameEdge: 'right'
      }
    },
    {
      id: '3',
      type: 'frameEdgeNode',
      position: { x: width / 2 - 100, y: height - 100 }, // Bottom center
      data: { 
        label: 'Character Type',
        content: 'brave knight',
        frameEdge: 'bottom'
      }
    },
    {
      id: '4',
      type: 'frameEdgeNode',
      position: { x: 10, y: height / 2 - 50 }, // Left middle
      data: { 
        label: 'Output',
        outputName: 'character_prompt',
        frameEdge: 'left'
      }
    }
  ];
  
  const edges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e2-3', source: '2', target: '3', animated: true },
    { id: 'e3-4', source: '3', target: '4', animated: true }
  ];
  
  return (
    <div style={{ width: '100%', height: '100vh', background: '#0f0f23' }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView={false}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          style={{ background: '#0f0f23' }}
        >
          <Background color="#aaa" gap={16} />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};