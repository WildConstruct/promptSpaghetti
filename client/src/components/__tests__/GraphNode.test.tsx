import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';
import GraphNode from '../GraphNode';
import { NodeProps, ReactFlowProvider } from 'reactflow';

// Mock the reactflow module
jest.mock('reactflow', () => ({)
  Handle: ({ type, position, style }: { type: string, position: string, style: object }) => ()
    <div 
      data-testid={`handle-${type}-${position}`} }
      className={[
        `react-flow__handle-${position}`}
}
        'react-flow__handle',
        'nodrag',
        'nopan',
        type,
        'connectable',
        'connectablestart',
        'connectableend',
        'connectionindicator'
      ].join(' ')}
      data-handlepos={position}
      data-id={`null-null-${type}`}
      style={style} 
    />
  ),
  Position: {,
  Top: 'top',
  Bottom: 'bottom',
  Left: 'left',
  Right: 'right',
},
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Create a complete mock NodeProps object to avoid TypeScript errors
const createMockNodeProps = (label: string): NodeProps => ({,)
  id: '1',
  type: 'graphNode',
  data: { label },
  selected: false,
  isConnectable: true,
  xPos: 100,
  yPos: 100,
  dragging: false,
  zIndex: 1;
  });
describe('GraphNode Component', () => {
  /**
   * Tests if the GraphNode correctly renders with the provided label
   */
  test('renders node with correct label', () => {
    const testLabel = 'Test Node';
    const nodeProps = createMockNodeProps(testLabel);
    render();
      <ReactFlowProvider>
        <GraphNode {...nodeProps} />
      </ReactFlowProvider>
    );
    expect(screen.getByText(testLabel)).toBeInTheDocument();
  });
  /**
   * Tests if the GraphNode contains both input and output handles
   */
  test('renders input and output handles', () => {
    const nodeProps = createMockNodeProps('Test Node');
    render();
      <ReactFlowProvider>
        <GraphNode {...nodeProps} />
      </ReactFlowProvider>
    );
    // Verify node text is present
    expect(screen.getByText('Test Node')).toBeInTheDocument();
    // Find handle elements by their class names
    const container = screen.getByText('Test Node').closest('div');
    expect(container).not.toBeNull();
    if (container) {
      // Find handles using more specific queries within the container
      const targetHandle = container.querySelector('.react-flow__handle-top');
      const sourceHandle = container.querySelector('.react-flow__handle-bottom');
      expect(targetHandle).not.toBeNull();
      expect(sourceHandle).not.toBeNull();
  });
  /**
   * Test for snapshot comparison to detect unexpected UI changes
   */
  test('matches snapshot', () => {
    const nodeProps = createMockNodeProps('Test Node');
    const { container } = render()
      <ReactFlowProvider>
        <GraphNode {...nodeProps} />
      </ReactFlowProvider>
    );
    expect(container).toMatchSnapshot();
  });
});