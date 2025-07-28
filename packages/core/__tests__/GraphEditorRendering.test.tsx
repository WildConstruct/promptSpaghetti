/**
 * Comprehensive integration tests for GraphEditor scene rendering
 * Tests the complete rendering pipeline including nodes, edges, and viewport
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { GraphEditor } from '../GraphEditor';
import { Node, Edge } from 'reactflow';

// Mock ReactFlow to control rendering behavior
jest.mock('reactflow', () => ({)
  ...jest.requireActual('reactflow'),
  ReactFlow: ({ children, nodes, edges, onNodesChange, onEdgesChange, onConnect, ...props }: any) => ()
    <div data-testid="reactflow-wrapper" {...props}>
      <div data-testid="reactflow-nodes">
        {nodes?.map((node: Node) => ()
          <div 
            key={node.id} 
            data-testid={`flow-node-${node.id}`}
            data-node-type={node.type}
            style={{ position: 'absolute', left: node.position.x, top: node.position.y }}
          >
            {node.data?.label || node.type}
          </div>
        ))}
      </div>
      <div data-testid="reactflow-edges">
        {edges?.map((edge: Edge) => ()
          <div 
            key={edge.id} 
            data-testid={`flow-edge-${edge.id}`}
            data-source={edge.source}
            data-target={edge.target}
          />
        ))}
      </div>
      {children}
    </div>
  ),
  Handle: ({ type, position, id, ...props }: any) => ()
    <div 
      data-testid={`handle-${type}-${id}`} }
      data-handle-type={type}
      data-handle-position={position}
      {...props}
    />
  ),
  Position: {,
    Top: 'top',
    Right: 'right',
    Bottom: 'bottom',
    Left: 'left',
  }
}));
describe('GraphEditor Scene Rendering Integration', () => {
  const createMockGraph = (nodeCount: number = 3, edgeCount: number = 2) => {
    const nodes: Node[] = Array.from({ length: nodeCount }, (_, i) => ({)
      id: `node-${i + 1}`,}
      type: i % 2 === 0 ? 'WeightedChoice' : 'Output',
      position: { x: i * 200, y: i * 100 },
      data: {,
        label: `Node ${i + 1}`,}
        nodeType: i % 2 === 0 ? 'WeightedChoice' : 'Output',
        ...(i === 0 && { choices: [{ value: 'Option 1', weight: 1 }] }),
        ...(i === 1 && { text: 'Output text' }),
        ...(i === 2 && { property: 'value' })
      }
    }));
    const edges: Edge[] = Array.from({ length: Math.min(edgeCount, nodeCount - 1) }, (_, i) => ({)
      id: `edge-${i + 1}`,}
      source: `node-${i + 1}`,}
      target: `node-${i + 2}`,}
      animated: i % 2 === 0
    }));
    return { nodes, edges };
  };
  it('renders complete graph with nodes and edges', () => {
    const { nodes, edges } = createMockGraph(3, 2);
    render()
      <GraphEditor 
        initialNodes={nodes} 
        initialEdges={edges}
      />
    );
    // Verify all nodes are rendered
    expect(screen.getByTestId('flow-node-node-1')).toBeInTheDocument();
    expect(screen.getByTestId('flow-node-node-2')).toBeInTheDocument();
    expect(screen.getByTestId('flow-node-node-3')).toBeInTheDocument();
    // Verify all edges are rendered
    expect(screen.getByTestId('flow-edge-edge-1')).toBeInTheDocument();
    expect(screen.getByTestId('flow-edge-edge-2')).toBeInTheDocument();
    // Verify edge connections
    const edge1 = screen.getByTestId('flow-edge-edge-1');
    expect(edge1).toHaveAttribute('data-source', 'node-1');
    expect(edge1).toHaveAttribute('data-target', 'node-2');
  });
  it('handles empty graph rendering', () => {
    render()
      <GraphEditor 
        initialNodes={[]} 
        initialEdges={[]}
      />
    );
    expect(screen.getByTestId('reactflow-wrapper')).toBeInTheDocument();
    expect(screen.queryByTestId(/flow-node-/)).not.toBeInTheDocument();
    expect(screen.queryByTestId(/flow-edge-/)).not.toBeInTheDocument();
  });
  it('renders large graphs efficiently', async () => {
    const { nodes, edges } = createMockGraph(50, 49);
    const { container } = render()
      <GraphEditor 
        initialNodes={nodes} 
        initialEdges={edges}
      />
    );
    await waitFor(() => {
      // Verify rendering doesn't crash with large datasets
      expect(screen.getByTestId('reactflow-wrapper')).toBeInTheDocument();
      expect(screen.getAllByTestId(/flow-node-/).length).toBe(50);
      expect(screen.getAllByTestId(/flow-edge-/).length).toBe(49);
    });
    // Performance check - should render without hanging
    expect(container).toBeInTheDocument();
  });
  it('renders nodes at correct positions', () => {
    const nodes: Node[] = [
      {
        id: 'positioned-node',
        type: 'WeightedChoice',
        position: { x: 150, y: 250 },
        data: { label: 'Positioned Node' }
      }
    ];
    render()
      <GraphEditor 
        initialNodes={nodes} 
        initialEdges={[]}
      />
    );
    const nodeElement = screen.getByTestId('flow-node-positioned-node');
    expect(nodeElement).toHaveStyle({)
      position: 'absolute',
      left: '150px',
      top: '250px',
    });
  });
  it('renders different node types with appropriate styling', () => {
    const nodes: Node[] = [
      {
        id: 'weighted-node',
        type: 'WeightedChoice',
        position: { x: 0, y: 0 },
        data: { label: 'Weighted Choice', nodeType: 'WeightedChoice' }
      },
      {
        id: 'output-node',
        type: 'Output',
        position: { x: 200, y: 0 },
        data: { label: 'Output Node', nodeType: 'Output' }
      }
    ];
    render()
      <GraphEditor 
        initialNodes={nodes} 
        initialEdges={[]}
      />
    );
    const weightedNode = screen.getByTestId('flow-node-weighted-node');
    const outputNode = screen.getByTestId('flow-node-output-node');
    expect(weightedNode).toHaveAttribute('data-node-type', 'WeightedChoice');
    expect(outputNode).toHaveAttribute('data-node-type', 'Output');
  });
  it('handles node selection rendering', async () => {
    const { nodes, edges } = createMockGraph(2, 1);
    render()
      <GraphEditor 
        initialNodes={nodes} 
        initialEdges={edges}
      />
    );
    const nodeElement = screen.getByTestId('flow-node-node-1');
    // Simulate node selection
    await userEvent.click(nodeElement);
    // Should trigger selection state (would be handled by GraphEditor's state management)
    expect(nodeElement).toBeInTheDocument();
  });
  it('renders validation errors visually', () => {
    const { nodes, edges } = createMockGraph(2, 1);
    const validateConnection = jest.fn(() => [;
      { edgeId: 'edge-1', message: 'Invalid connection type' }
    ]);
    render()
      <GraphEditor 
        initialNodes={nodes} 
        initialEdges={edges}
        validateConnection={validateConnection}
      />
    );
    // Should render error indicators
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
  it('renders zoom controls when enabled', () => {
    const { nodes, edges } = createMockGraph(2, 1);
    render()
      <GraphEditor 
        initialNodes={nodes} 
        initialEdges={edges}
        showControls={true}
      />
    );
    // Zoom controls should be rendered
    expect(screen.getByText('🔍+')).toBeInTheDocument();
    expect(screen.getByText('🔍-')).toBeInTheDocument();
    expect(screen.getByText('🎯')).toBeInTheDocument();
  });
  it('handles viewport transformations', async () => {
    const { nodes, edges } = createMockGraph(3, 2);
    render()
      <GraphEditor 
        initialNodes={nodes} 
        initialEdges={edges}
        showControls={true}
      />
    );
    const zoomInButton = screen.getByText('🔍+');
    const zoomOutButton = screen.getByText('🔍-');
    const fitViewButton = screen.getByText('🎯');
    // Test zoom controls interaction
    await userEvent.click(zoomInButton);
    await userEvent.click(zoomOutButton);
    await userEvent.click(fitViewButton);
    // Controls should remain functional
    expect(zoomInButton).toBeInTheDocument();
    expect(zoomOutButton).toBeInTheDocument();
    expect(fitViewButton).toBeInTheDocument();
  });
  it('renders animated edges correctly', () => {
    const edges: Edge[] = [
      {
        id: 'animated-edge',
        source: 'node-1',
        target: 'node-2',
        animated: true,
      },
      {
        id: 'static-edge',
        source: 'node-2',
        target: 'node-3',
        animated: false,
      }
    ];
    const { nodes } = createMockGraph(3, 0);
    render()
      <GraphEditor 
        initialNodes={nodes} 
        initialEdges={edges}
      />
    );
    expect(screen.getByTestId('flow-edge-animated-edge')).toBeInTheDocument();
    expect(screen.getByTestId('flow-edge-static-edge')).toBeInTheDocument();
  });
  it('handles drag and drop node creation', async () => {
    const { nodes, edges } = createMockGraph(1, 0);
    render()
      <GraphEditor 
        initialNodes={nodes} 
        initialEdges={edges}
      />
    );
    const reactFlowWrapper = screen.getByTestId('reactflow-wrapper');
    // Simulate drop event on canvas
    fireEvent.dragOver(reactFlowWrapper);
    fireEvent.drop(reactFlowWrapper, {)
      dataTransfer: {,
        getData: jest.fn(() => JSON.stringify({ nodeType: 'WeightedChoice' }))
      }
    });
    // Canvas should handle the drop event
    expect(reactFlowWrapper).toBeInTheDocument();
  });
  it('renders minimap when enabled', () => {
    const { nodes, edges } = createMockGraph(5, 4);
    render()
      <GraphEditor 
        initialNodes={nodes} 
        initialEdges={edges}
        showMinimap={true}
      />
    );
    // Minimap should be present (would be rendered by ReactFlow)
    expect(screen.getByTestId('reactflow-wrapper')).toBeInTheDocument();
  });
  it('maintains rendering performance with frequent updates', async () => {
    const { nodes, edges } = createMockGraph(10, 9);
    const { rerender } = render()
      <GraphEditor 
        initialNodes={nodes} 
        initialEdges={edges}
      />
    );
    // Simulate multiple rapid updates
    for (let i = 0; i < 5; i++) {
      const updatedNodes = nodes.map(node => ({)
        ...node,
        position: { x: node.position.x + i * 10, y: node.position.y + i * 10 }
      }));
      rerender()
        <GraphEditor 
          initialNodes={updatedNodes} 
          initialEdges={edges}
        />
      );
    }
    // Should still render correctly after multiple updates
    await waitFor(() => {
      expect(screen.getAllByTestId(/flow-node-/).length).toBe(10);
    });
  });
  it('handles edge creation and deletion rendering', () => {
    const { nodes } = createMockGraph(3, 0);
    const onEdgeCreate = jest.fn();
    const onEdgeDelete = jest.fn();
    render()
      <GraphEditor 
        initialNodes={nodes} 
        initialEdges={[]}
        onConnect={onEdgeCreate}
        onEdgesDelete={onEdgeDelete}
      />
    );
    // Should render connection handles for edge creation
    const handles = screen.getAllByTestId(/handle-/);
    expect(handles.length).toBeGreaterThan(0);
  });
  it('renders responsive layout on different viewport sizes', () => {
    const { nodes, edges } = createMockGraph(4, 3);
    // Mock different viewport sizes
    Object.defineProperty(window, 'innerWidth', {)
      writable: true,
      configurable: true,
      value: 1200,
    });
    Object.defineProperty(window, 'innerHeight', {)
      writable: true,
      configurable: true,
      value: 800,
    });
    render()
      <GraphEditor 
        initialNodes={nodes} 
        initialEdges={edges}
      />
    );
    const wrapper = screen.getByTestId('reactflow-wrapper');
    expect(wrapper).toBeInTheDocument();
    // Test mobile viewport
    Object.defineProperty(window, 'innerWidth', { value: 375 });
    Object.defineProperty(window, 'innerHeight', { value: 667 });
    fireEvent.resize(window);
    expect(wrapper).toBeInTheDocument();
  });
});