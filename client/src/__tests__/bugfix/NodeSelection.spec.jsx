/**
 * Basic Node Selection Test - JavaScript version to avoid TS complexities
 * 
 * This test verifies the core functionality of node selection in ReactFlow
 * and checks if it properly updates the inspector panel.
 */

import { jest } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../App';

// Jest will automatically mock ReactFlow
jest.mock('reactflow', async () => {
  // ESM compatible approach
  const originalModule = await import('reactflow');
  return {
    ...originalModule,
    // Mock the ReactFlow component
    ReactFlow: ({ nodes, onNodeClick }) => (
      <div data-testid="reactflow-container">
        {nodes?.map(node => (
          <div 
            key={node.id}
            data-testid={`node-${node.data.label}`}
            onClick={(e) => onNodeClick && onNodeClick(e, node)}
            className={node.selected ? 'selected' : ''}
          >
            {node.data.label}
          </div>
        ))}
      </div>
    ),
    // Mock the provider and hooks
    ReactFlowProvider: ({ children }) => <>{children}</>,
    useReactFlow: () => ({
      project: ({ x, y }) => ({ x: x - 100, y: y - 50 }),
      getNodes: () => [],
      getEdges: () => [],
    }),
    Background: () => <div>Background</div>,
    Controls: () => <div>Controls</div>,
    MiniMap: () => <div>MiniMap</div>,
  };
});

describe('Node Selection Tests', () => {
  test('Clicking a node updates the inspector panel', () => {
    // Render the app
    render(<App />);
    
    // Create a node by dragging from palette
    const subjectNode = screen.getByText('Subject');
    fireEvent.dragStart(subjectNode);
    fireEvent.dragOver(screen.getByTestId('reactflow-container'));
    fireEvent.drop(screen.getByTestId('reactflow-container'), {
      clientX: 300,
      clientY: 200
    });
    
    // Wait for the node to be created and verify it exists
    const createdNode = screen.getByTestId('node-Subject');
    expect(createdNode).toBeInTheDocument();
    
    // Click the node to select it
    fireEvent.click(createdNode);
    
    // Verify inspector panel shows the node's data
    expect(screen.getByTestId('inspector-panel')).toBeInTheDocument();
    expect(screen.getByTestId('inspector-panel')).toHaveTextContent('Subject');
    
    // Verify the node has the 'selected' class
    expect(createdNode).toHaveClass('selected');
  });
  
  test('Node drops at the correct position', () => {
    // Render the app
    render(<App />);
    
    // Create a node by dragging from palette
    const actionNode = screen.getByText('Action');
    fireEvent.dragStart(actionNode);
    fireEvent.dragOver(screen.getByTestId('reactflow-container'));
    fireEvent.drop(screen.getByTestId('reactflow-container'), {
      clientX: 300,
      clientY: 200
    });
    
    // Get the created node and verify it exists
    const createdNode = screen.getByTestId('node-Action');
    expect(createdNode).toBeInTheDocument();
    
    // Verify the node position is correct based on our mock project function
    // Our mock transforms 300,200 to 200,150
    const nodeStyle = window.getComputedStyle(createdNode);
    expect(nodeStyle.left).toBe('200px');
    expect(nodeStyle.top).toBe('150px');
  });
});
