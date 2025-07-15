import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import GraphNode from '../components/GraphNode';
import { NodeProps } from 'react-flow-renderer';

// Mock the react-flow-renderer components and hooks
jest.mock('react-flow-renderer', () => ({
  Handle: ({ type, position, style }: { type: string; position: string; style?: React.CSSProperties }) => (
    <div data-testid={`handle-${type}`} data-position={position} style={style} />
  ),
  Position: {
    Top: 'top',
    Bottom: 'bottom',
  },
  // Mock the NodeProps type
  NodeProps: {}
}));

describe('GraphNode', () => {
  it('renders with the correct label and handles', () => {
    // Create a minimal set of props that satisfies NodeProps
    const nodeData = {
      data: { label: 'Test Node' },
      id: 'test-node-1',
      position: { x: 0, y: 0 },
      type: 'default',
      selected: false,
      isConnectable: true,
      xPos: 0,
      yPos: 0,
      dragging: false,
      zIndex: 1
    } as NodeProps;

    const { getByText, getByTestId } = render(<GraphNode {...nodeData} />);
    
    // Test the label is rendered
    expect(getByText('Test Node')).toBeInTheDocument();
    
    // Test both handles are rendered
    const sourceHandle = getByTestId('handle-source');
    const targetHandle = getByTestId('handle-target');
    
    expect(sourceHandle).toBeInTheDocument();
    expect(targetHandle).toBeInTheDocument();
    
    // Test handle positions
    expect(sourceHandle.getAttribute('data-position')).toBe('bottom');
    expect(targetHandle.getAttribute('data-position')).toBe('top');
  });
});
