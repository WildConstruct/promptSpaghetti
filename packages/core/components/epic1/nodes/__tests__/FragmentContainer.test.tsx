import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReactFlowProvider } from 'reactflow';
import { FragmentContainer } from '../FragmentContainer';
import type { NodeProps } from 'reactflow';

// Mock React Flow hooks
const mockGetNodes = jest.fn();
const mockSetNodes = jest.fn();

jest.mock('reactflow', () => ({
  ...jest.requireActual('reactflow'),
  useReactFlow: () => ({
    getNodes: mockGetNodes,
    setNodes: mockSetNodes,
  }),
  Handle: ({ children, ...props }: any) => <div data-testid="handle" {...props}>{children}</div>,
  Position: {
    Left: 'left',
    Right: 'right',
    Top: 'top',
    Bottom: 'bottom',
  },
}));

describe('FragmentContainer', () => {
  const defaultProps: NodeProps = {
    id: 'fragment-1',
    type: 'fragmentContainer',
    data: {
      title: 'Test Fragment',
      description: 'A test fragment container',
      isCollapsed: false,
      fragmentSource: 'test.psg',
      nodeCount: 3,
    },
    selected: false,
    dragging: false,
    xPos: 0,
    yPos: 0,
    zIndex: 1,
    isConnectable: true,
    targetPosition: 'left' as any,
    sourcePosition: 'right' as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetNodes.mockReturnValue([
      { id: 'fragment-1', type: 'fragmentContainer', position: { x: 0, y: 0 } },
      { id: 'node-1', parentNode: 'fragment-1', position: { x: 10, y: 10 } },
      { id: 'node-2', parentNode: 'fragment-1', position: { x: 10, y: 50 } },
      { id: 'node-3', parentNode: 'fragment-1', position: { x: 10, y: 90 } },
    ]);
  });

  it('renders with correct title and description', () => {
    render(
      <ReactFlowProvider>
        <FragmentContainer {...defaultProps} />
      </ReactFlowProvider>
    );

    expect(screen.getByText('Test Fragment')).toBeInTheDocument();
    expect(screen.getByText('A test fragment container')).toBeInTheDocument();
    expect(screen.getByText('Source: test.psg')).toBeInTheDocument();
    expect(screen.getByText('Contains: 3 nodes')).toBeInTheDocument();
  });

  it('renders collapsed state correctly', () => {
    const collapsedProps = {
      ...defaultProps,
      data: { ...defaultProps.data, isCollapsed: true },
    };

    render(
      <ReactFlowProvider>
        <FragmentContainer {...collapsedProps} />
      </ReactFlowProvider>
    );

    expect(screen.getByText('Test Fragment')).toBeInTheDocument();
    expect(screen.getByText('3 nodes')).toBeInTheDocument(); // Badge shows in collapsed state
    expect(screen.queryByText('A test fragment container')).not.toBeInTheDocument();
    expect(screen.getByText('▼ Expand')).toBeInTheDocument();
  });

  it('toggles collapse/expand when button is clicked', () => {
    render(
      <ReactFlowProvider>
        <FragmentContainer {...defaultProps} />
      </ReactFlowProvider>
    );

    const toggleButton = screen.getByText('▲ Collapse');
    fireEvent.click(toggleButton);

    expect(mockSetNodes).toHaveBeenCalledTimes(1);
    const setNodesCallback = mockSetNodes.mock.calls[0][0];
    const updatedNodes = setNodesCallback([
      { id: 'fragment-1', data: { isCollapsed: false } },
      { id: 'node-1', parentNode: 'fragment-1', hidden: false },
      { id: 'node-2', parentNode: 'fragment-1', hidden: false },
    ]);

    // Check that the fragment container's isCollapsed is toggled
    expect(updatedNodes[0].data.isCollapsed).toBe(true);
    // Check that child nodes are hidden
    expect(updatedNodes[1].hidden).toBe(true);
    expect(updatedNodes[2].hidden).toBe(true);
  });

  it('hides child nodes when collapsed', () => {
    render(
      <ReactFlowProvider>
        <FragmentContainer {...defaultProps} />
      </ReactFlowProvider>
    );

    fireEvent.click(screen.getByText('▲ Collapse'));

    const setNodesCallback = mockSetNodes.mock.calls[0][0];
    const nodes = [
      { id: 'fragment-1', data: {} },
      { id: 'node-1', parentNode: 'fragment-1', hidden: false },
      { id: 'node-2', parentNode: 'fragment-1', hidden: false },
      { id: 'node-3', parentNode: 'other', hidden: false }, // Different parent
    ];

    const updatedNodes = setNodesCallback(nodes);

    // Only nodes with this fragment as parent should be hidden
    expect(updatedNodes[1].hidden).toBe(true);
    expect(updatedNodes[2].hidden).toBe(true);
    expect(updatedNodes[3].hidden).toBe(false); // Not a child of this fragment
  });

  it('applies correct styles when selected', () => {
    const selectedProps = { ...defaultProps, selected: true };

    const { container } = render(
      <ReactFlowProvider>
        <FragmentContainer {...selectedProps} />
      </ReactFlowProvider>
    );

    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveStyle({
      background: expect.stringContaining('#9b59b6'),
      border: expect.stringContaining('#8e44ad'),
      boxShadow: expect.stringContaining('rgba(155, 89, 182'),
    });
  });

  it('applies correct styles when dragging', () => {
    const draggingProps = { ...defaultProps, dragging: true };

    const { container } = render(
      <ReactFlowProvider>
        <FragmentContainer {...draggingProps} />
      </ReactFlowProvider>
    );

    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveStyle({ opacity: '0.7' });
  });

  it('renders connection handles', () => {
    render(
      <ReactFlowProvider>
        <FragmentContainer {...defaultProps} />
      </ReactFlowProvider>
    );

    const handles = screen.getAllByTestId('handle');
    expect(handles).toHaveLength(2); // One source, one target
    expect(handles[0]).toHaveAttribute('type', 'target');
    expect(handles[1]).toHaveAttribute('type', 'source');
  });

  it('uses purple theme for visual distinction', () => {
    const { container } = render(
      <ReactFlowProvider>
        <FragmentContainer {...defaultProps} />
      </ReactFlowProvider>
    );

    const containerDiv = container.firstChild as HTMLElement;
    // Check for purple gradient background
    expect(containerDiv).toHaveStyle({
      background: expect.stringContaining('#a569bd'),
      borderRadius: '12px',
    });
  });

  it('counts child nodes correctly', () => {
    render(
      <ReactFlowProvider>
        <FragmentContainer {...defaultProps} />
      </ReactFlowProvider>
    );

    // Should show the count from props or calculated from children
    expect(screen.getByText('Contains: 3 nodes')).toBeInTheDocument();
  });

  it('handles missing data gracefully', () => {
    const minimalProps = {
      ...defaultProps,
      data: {},
    };

    render(
      <ReactFlowProvider>
        <FragmentContainer {...minimalProps} />
      </ReactFlowProvider>
    );

    expect(screen.getByText('Fragment')).toBeInTheDocument(); // Default title
    expect(screen.getByText('Contains: 3 nodes')).toBeInTheDocument();
  });
});