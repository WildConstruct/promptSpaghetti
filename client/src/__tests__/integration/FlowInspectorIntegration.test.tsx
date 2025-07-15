import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest } from '@jest/globals';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import App from '../../App';

// Mock ReactFlow
jest.mock('reactflow', () => {
  const originalModule = jest.requireActual('reactflow') as Record<string, any>;
  
  // Return the components we need with test-specific implementations
  return {
    __esModule: true,
    ...originalModule,
    // Mock specific ReactFlow components and hooks for testing
    ReactFlow: ({ 
      nodes, 
      edges, 
      onNodeClick, 
      onNodesChange,
      onDrop,
      children 
    }: any) => (
      <div data-testid="reactflow-mock">
        <div data-testid="node-container">
          {nodes.map((node: any) => (
            <div 
              key={node.id} 
              data-testid={`node-${node.id}`}
              data-selected={node.selected}
              onClick={(e) => onNodeClick && onNodeClick(e, node)}
              style={{ cursor: 'pointer' }}
            >
              {node.data?.label || node.id}
              {node.data?.nodeType && (
                <div data-testid={`node-type-${node.id}`}>{node.data.nodeType}</div>
              )}
            </div>
          ))}
        </div>
        <div data-testid="edge-container">
          {edges.map((edge: any) => (
            <div key={edge.id} data-testid={`edge-${edge.id}`}>
              {edge.id}
            </div>
          ))}
        </div>
        {children}
      </div>
    ),
    // Mock other required components
    Background: () => <div data-testid="reactflow-background">Background</div>,
    Controls: () => <div data-testid="reactflow-controls">Controls</div>,
    MiniMap: () => <div data-testid="reactflow-minimap">MiniMap</div>,
    // Mock hooks
    useReactFlow: () => ({
      project: jest.fn((position) => position),
      getViewport: jest.fn(() => ({ x: 0, y: 0, zoom: 1 }))
    }),
    ReactFlowProvider: ({ children }: any) => <div data-testid="reactflow-provider">{children}</div>,
  };
});

describe('ReactFlow and Inspector Integration Tests', () => {
  /**
   * Test that node selection updates the inspector panel
   */
  test('selecting a node updates the inspector panel', async () => {
    render(<App />);
    
    // First, simulate creating a node
    // Find the node palette item
    const subjectNodeInPalette = screen.getByText('Subject');
    
    // Simulate drag start
    fireEvent.dragStart(subjectNodeInPalette, {
      dataTransfer: { setData: jest.fn() }
    });
    
    // Get the ReactFlow container
    const reactFlowContainer = screen.getByTestId('reactflow-mock');
    
    // Simulate drop on ReactFlow
    fireEvent.drop(reactFlowContainer, {
      dataTransfer: { getData: () => 'Subject' },
      clientX: 100,
      clientY: 100
    });
    
    // Wait for the node to be created
    await waitFor(() => {
      const nodes = screen.getAllByTestId(/^node-/);
      expect(nodes.length).toBeGreaterThan(0);
    });
    
    // Get the first node
    const firstNode = screen.getAllByTestId(/^node-/)[0];
    
    // Click the node to select it
    fireEvent.click(firstNode);
    
    // Check that the inspector panel shows the node data
    await waitFor(() => {
      const inspectorTitle = screen.getByText('Inspector');
      expect(inspectorTitle).toBeInTheDocument();
      
      // The inspector should show the node type (Subject)
      const nodeTypeInInspector = screen.getByText('Subject');
      expect(nodeTypeInInspector).toBeInTheDocument();
    });
    
    // Verify the node is visually selected
    expect(firstNode).toHaveAttribute('data-selected', 'true');
  });
  
  /**
   * Test that changes in inspector update the node data
   */
  test('changes in inspector update node data', async () => {
    render(<App />);
    
    // Create a node first
    const weightedChoiceNode = screen.getByText('WeightedChoice');
    fireEvent.dragStart(weightedChoiceNode, {
      dataTransfer: { setData: jest.fn() }
    });
    
    const reactFlowContainer = screen.getByTestId('reactflow-mock');
    fireEvent.drop(reactFlowContainer, {
      dataTransfer: { getData: () => 'WeightedChoice' },
      clientX: 100,
      clientY: 100
    });
    
    // Wait for node to be created
    await waitFor(() => {
      const nodes = screen.getAllByTestId(/^node-/);
      expect(nodes.length).toBeGreaterThan(0);
    });
    
    // Select the node
    const node = screen.getAllByTestId(/^node-/)[0];
    fireEvent.click(node);
    
    // Find the label input in the inspector
    const labelInput = await screen.findByLabelText(/Label/i);
    
    // Change the label
    fireEvent.change(labelInput, { target: { value: 'Updated Node Label' } });
    
    // Check if the node label was updated
    await waitFor(() => {
      const updatedNode = screen.getByText('Updated Node Label');
      expect(updatedNode).toBeInTheDocument();
    });
  });
  
  /**
   * Test node position when dropped
   */
  test('nodes are positioned correctly when dropped', async () => {
    // Mock ReactFlow's project function to verify it's being called correctly
    const mockProject = jest.fn((pos: { x: number; y: number }) => ({ x: pos.x, y: pos.y }));
    jest.spyOn(require('reactflow'), 'useReactFlow').mockImplementation(() => ({
      project: mockProject,
      getViewport: jest.fn(() => ({ x: 0, y: 0, zoom: 1 }))
    }));
    
    render(<App />);
    
    // Create a node with drag and drop
    const subjectNode = screen.getByText('Subject');
    fireEvent.dragStart(subjectNode, {
      dataTransfer: { setData: jest.fn() }
    });
    
    const reactFlowContainer = screen.getByTestId('reactflow-mock');
    fireEvent.drop(reactFlowContainer, {
      dataTransfer: { getData: () => 'Subject' },
      clientX: 200,
      clientY: 150
    });
    
    // Verify project was called with the correct coordinates
    expect(mockProject).toHaveBeenCalledWith(
      expect.objectContaining({
        x: 200,
        y: 150
      })
    );
  });
  
  /**
   * Test cursor styles for different interaction modes
   */
  test('cursor style changes for different interaction modes', async () => {
    render(<App />);
    
    // Check default cursor on the canvas
    const reactFlowContainer = screen.getByTestId('reactflow-mock');
    expect(reactFlowContainer).toHaveStyle({ cursor: 'default' });
    
    // TODO: Add more cursor tests when we implement proper cursor styling
    // This will require adding CSS classes or inline styles for different modes
  });
});
