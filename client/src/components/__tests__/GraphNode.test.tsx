import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GraphNode from '../GraphNode';
import { NodeProps } from 'reactflow';

// Mock the reactflow module
jest.mock('reactflow', () => ({
  Handle: ({ type, position, style }: { type: string, position: string, style: object }) => (
    <div data-testid={`handle-${type}-${position}`} style={style} />
  ),
  Position: {
    Top: 'top',
    Bottom: 'bottom',
    Left: 'left',
    Right: 'right'
  }
}));

// Create a complete mock NodeProps object to avoid TypeScript errors
const createMockNodeProps = (label: string): NodeProps => ({
  id: '1',
  type: 'graphNode',
  data: { label },
  selected: false,
  isConnectable: true,
  xPos: 100,
  yPos: 100,
  dragging: false,
  zIndex: 1
});

describe('GraphNode Component', () => {
  /**
   * Tests if the GraphNode correctly renders with the provided label
   */
  test('renders node with correct label', () => {
    const testLabel = 'Test Node';
    const nodeProps = createMockNodeProps(testLabel);
    render(<GraphNode {...nodeProps} />);
    
    expect(screen.getByText(testLabel)).toBeInTheDocument();
  });

  /**
   * Tests if the GraphNode contains both input and output handles
   */
  test('renders input and output handles', () => {
    const nodeProps = createMockNodeProps('Test Node');
    render(<GraphNode {...nodeProps} />);
    
    expect(screen.getByTestId('handle-target-top')).toBeInTheDocument();
    expect(screen.getByTestId('handle-source-bottom')).toBeInTheDocument();
  });
  
  /**
   * Test for snapshot comparison to detect unexpected UI changes
   */
  test('matches snapshot', () => {
    const nodeProps = createMockNodeProps('Test Node');
    const { container } = render(<GraphNode {...nodeProps} />);
    expect(container).toMatchSnapshot();
  });
});
