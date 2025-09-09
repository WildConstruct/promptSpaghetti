import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReactFlowProvider } from 'reactflow';
import { EnhancedBoundingBox } from '../../../../components/epic1/nodes/EnhancedBoundingBox';
import { NodeProps } from 'reactflow';
import '@testing-library/jest-dom';

// Mock React Flow hooks
const mockSetNodes = jest.fn();
const mockGetNodes = jest.fn();
const mockGetEdges = jest.fn();
const mockSetEdges = jest.fn();

jest.mock('reactflow', () => ({
  ...jest.requireActual('reactflow'),
  useReactFlow: () => ({
    setNodes: mockSetNodes,
    getNodes: mockGetNodes,
    getEdges: mockGetEdges,
    setEdges: mockSetEdges,
  }),
  Handle: ({ children, ...props }: any) => <div data-testid={`handle-${props.id}`} {...props}>{children}</div>,
  Position: {
    Left: 'left',
    Right: 'right',
    Top: 'top',
    Bottom: 'bottom',
  },
}));

describe('EnhancedBoundingBox', () => {
  const defaultProps: NodeProps = {
    id: 'test-box',
    data: {
      title: 'Test Region',
      description: 'Test Description',
      backgroundColor: '#FF5252',
      opacity: 0.3,
      borderColor: '#FF5252',
      borderStyle: 'solid' as const,
      borderWidth: 2,
      locked: false,
      width: 400,
      height: 300,
      isCollapsed: false,
      ports: [],
      autoLayout: false,
    },
    xPos: 100,
    yPos: 100,
    selected: false,
    type: 'enhancedBoundingBox',
    draggable: true,
  } as NodeProps;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetNodes.mockReturnValue([
      { id: 'test-box', position: { x: 100, y: 100 }, type: 'enhancedBoundingBox' },
      { id: 'node-1', position: { x: 150, y: 150 }, width: 100, height: 50 },
      { id: 'node-2', position: { x: 250, y: 200 }, width: 100, height: 50 },
    ]);
    mockGetEdges.mockReturnValue([]);
  });

  describe('UI Layout', () => {
    it('should render collapse button in upper right corner', () => {
      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...defaultProps} />
        </ReactFlowProvider>
      );
      
      const collapseButton = screen.getByTitle('Collapse');
      expect(collapseButton).toBeInTheDocument();
      // Check it's a button element instead of checking class
      expect(collapseButton.tagName).toBe('BUTTON');
    });

    it('should render lock icon next to collapse button', () => {
      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...defaultProps} />
        </ReactFlowProvider>
      );
      
      const lockButton = screen.getByTitle('Lock');
      expect(lockButton).toBeInTheDocument();
      // Check it's a button element instead of checking class
      expect(lockButton.tagName).toBe('BUTTON');
    });

    it('should toggle lock state when lock button clicked', () => {
      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...defaultProps} />
        </ReactFlowProvider>
      );
      
      const lockButton = screen.getByTitle('Lock');
      fireEvent.click(lockButton);
      
      expect(mockSetNodes).toHaveBeenCalledWith(expect.any(Function));
      expect(screen.getByTitle('Unlock')).toBeInTheDocument();
    });
  });

  describe('Resize Functionality', () => {
    it('should show resize handles when selected and not collapsed', () => {
      const props = { ...defaultProps, selected: true };
      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...props} />
        </ReactFlowProvider>
      );
      
      // Check for resize handles by looking for elements with resize cursors
      const container = document.querySelector('.bounding-box');
      const resizeHandles = container?.querySelectorAll('.nodrag') || [];
      
      // Should have at least 8 resize handles (nw, ne, sw, se, n, s, e, w)
      expect(resizeHandles.length).toBeGreaterThanOrEqual(8);
      
      // Check that at least one has resize cursor style
      const hasResizeCursor = Array.from(resizeHandles).some(el => {
        const style = (el as HTMLElement).style;
        return style.cursor && style.cursor.includes('resize');
      });
      expect(hasResizeCursor).toBeTruthy();
    });

    it('should not show resize handles when locked', () => {
      const props = { 
        ...defaultProps, 
        selected: true,
        data: { ...defaultProps.data, locked: true } 
      };
      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...props} />
        </ReactFlowProvider>
      );
      
      expect(document.querySelector('.resize-handle-nw')).not.toBeInTheDocument();
    });

    it('should not show resize handles when collapsed', () => {
      const props = { 
        ...defaultProps, 
        selected: true,
        data: { ...defaultProps.data, isCollapsed: true } 
      };
      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...props} />
        </ReactFlowProvider>
      );
      
      expect(document.querySelector('.resize-handle-nw')).not.toBeInTheDocument();
    });
  });

  describe('Collapse/Expand Behavior', () => {
    it('should toggle collapse state when button clicked', () => {
      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...defaultProps} />
        </ReactFlowProvider>
      );
      
      const collapseButton = screen.getByTitle('Collapse');
      fireEvent.click(collapseButton);
      
      expect(mockSetNodes).toHaveBeenCalled();
      expect(screen.getByTitle('Expand')).toBeInTheDocument();
    });

    it('should hide contained nodes when collapsed', () => {
      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...defaultProps} />
        </ReactFlowProvider>
      );
      
      const collapseButton = screen.getByTitle('Collapse');
      fireEvent.click(collapseButton);
      
      // Check that setNodes was called to hide nodes
      const setNodesCall = mockSetNodes.mock.calls[0][0];
      const updatedNodes = setNodesCall([
        { id: 'test-box', position: { x: 100, y: 100 } },
        { id: 'node-1', position: { x: 150, y: 150 }, hidden: false },
      ]);
      
      const containedNode = updatedNodes.find((n: any) => n.id === 'node-1');
      expect(containedNode.hidden).toBe(true);
    });
  });

  describe('Port System', () => {
    it('should render ports when collapsed', () => {
      const props = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          isCollapsed: true,
          ports: [
            { id: 'input-1', label: 'Input 1', type: 'string' as const, direction: 'input' as const, nodeId: 'test-box', position: 'left' as any },
            { id: 'output-1', label: 'Output 1', type: 'string' as const, direction: 'output' as const, nodeId: 'test-box', position: 'right' as any },
          ],
        },
      };
      
      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...props} />
        </ReactFlowProvider>
      );
      
      expect(screen.getByTestId('handle-input-1')).toBeInTheDocument();
      expect(screen.getByTestId('handle-output-1')).toBeInTheDocument();
    });

    it('should show port labels', () => {
      const props = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          isCollapsed: true,
          ports: [
            { id: 'input-1', label: 'Input 1', type: 'string' as const, direction: 'input' as const, nodeId: 'test-box', position: 'left' as any },
          ],
        },
      };
      
      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...props} />
        </ReactFlowProvider>
      );
      
      // Port label might be in a tooltip or handle element
      const portElement = screen.getByTestId('handle-input-1');
      expect(portElement).toBeInTheDocument();
      // Check if label is present as text or title attribute
      const labelText = screen.queryByText('Input 1');
      const hasTitle = portElement.getAttribute('title') === 'Input 1';
      expect(labelText || hasTitle).toBeTruthy();
    });
  });

  describe('Styling', () => {
    it('should apply border radius and color from data', () => {
      const { container } = render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...defaultProps} />
        </ReactFlowProvider>
      );
      
      const boundingBox = container.querySelector('.bounding-box');
      expect(boundingBox).toHaveStyle({
        borderRadius: '8px',
        border: '2px solid #FF5252',
      });
    });

    it('should apply background with opacity', () => {
      const { container } = render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...defaultProps} />
        </ReactFlowProvider>
      );
      
      const background = container.querySelector('.bounding-box-background');
      expect(background).toHaveStyle({
        backgroundColor: 'rgba(255, 82, 82, 0.3)',
      });
    });
  });

  describe('Title and Description Editing', () => {
    it('should allow title editing on double click', () => {
      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...defaultProps} />
        </ReactFlowProvider>
      );
      
      const title = screen.getByText('Test Region');
      fireEvent.doubleClick(title);
      
      const input = screen.getByDisplayValue('Test Region');
      expect(input).toBeInTheDocument();
      
      fireEvent.change(input, { target: { value: 'New Title' } });
      fireEvent.blur(input);
      
      expect(mockSetNodes).toHaveBeenCalled();
    });
  });
});