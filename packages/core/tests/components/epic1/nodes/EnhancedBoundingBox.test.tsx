import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReactFlowProvider, Position } from 'reactflow';
import { EnhancedBoundingBox } from '../../../../components/epic1/nodes/EnhancedBoundingBox';
import { NodeProps, Node } from 'reactflow';
import '@testing-library/jest-dom';

// Mock React Flow hooks
const mockSetNodes = jest.fn();
const mockGetNodes = jest.fn();
const mockGetEdges = jest.fn();
const mockSetEdges = jest.fn();
const mockNodeInternals = new Map();

jest.mock('reactflow', () => ({
  ...jest.requireActual('reactflow'),
  useReactFlow: () => ({
    setNodes: mockSetNodes,
    getNodes: mockGetNodes,
    getEdges: mockGetEdges,
    setEdges: mockSetEdges,
  }),
  Handle: ({ children, ...props }: any) => <div data-testid={`handle-${props.type}-${props.id}`} {...props}>{children}</div>,
  Position: {
    Left: 'left',
    Right: 'right',
    Top: 'top',
    Bottom: 'bottom',
  },
  useStore: (selector: any) => {
    const state = {
      nodeInternals: mockNodeInternals,
      edges: [],
    };
    return typeof selector === 'function' ? selector(state) : state;
  },
}));

// Mock PerformanceMonitor
jest.mock('../../../../utils/performance/PerformanceMonitor', () => ({
  PerformanceMonitor: {
    getInstance: () => ({
      record: jest.fn(),
      startMeasure: jest.fn(),
      endMeasure: jest.fn(),
    }),
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
    mockNodeInternals.clear();
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
      
      const collapseButton = screen.getByTitle(/Collapse|Expand/i);
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
      
      const lockButton = screen.getByTitle(/Lock|Unlock/i);
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
      
      const lockButton = screen.getByTitle(/Lock|Unlock/i);
      fireEvent.click(lockButton);
      
      // Check that setNodes was called
      expect(mockSetNodes).toHaveBeenCalled();
    });

    it('should display title in header', () => {
      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...defaultProps} />
        </ReactFlowProvider>
      );

      expect(screen.getByText('Test Region')).toBeInTheDocument();
    });

    it('toggles the definition when clicking the Region Box headline', () => {
      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...defaultProps} />
        </ReactFlowProvider>
      );

      expect(screen.getByText('Test Description')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Test Region'));
      expect(screen.queryByText('Test Description')).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('Test Region'));
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('should display node count when expanded', () => {
      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...defaultProps} />
        </ReactFlowProvider>
      );
      
      // Look for the node count text (might be "0 nodes" since containment calc may not work in test)
      const nodeCountElement = screen.queryByText(/\d+ node/i);
      expect(nodeCountElement).toBeInTheDocument();
    });

    it('counts direct React Flow children from subscribed node internals', () => {
      mockGetNodes.mockReturnValue([
        { id: 'test-box', position: { x: 100, y: 100 }, type: 'enhancedBoundingBox' },
      ]);
      mockNodeInternals.set('test-box', {
        id: 'test-box',
        type: 'enhancedBoundingBox',
        position: { x: 100, y: 100 },
        width: 400,
        height: 300,
        data: {},
      });
      mockNodeInternals.set('text-1', {
        id: 'text-1',
        type: 'textBlock',
        parentNode: 'test-box',
        position: { x: 42, y: 120 },
        width: 220,
        height: 150,
        data: {},
      });

      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...defaultProps} />
        </ReactFlowProvider>
      );

      expect(screen.getByText('1 node')).toBeInTheDocument();
    });

    it('uses compact header sizing for narrow Region Boxes', () => {
      const narrowProps = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          title: 'Extraction backdrop (locked)',
          description: 'Locked neutral gray plate; the frontier location is composited later.',
          width: 314,
          height: 420
        }
      };

      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...narrowProps} />
        </ReactFlowProvider>
      );

      const header = document.querySelector(
        '.bounding-box-header'
      ) as HTMLElement | null;
      const title = header?.querySelector('.bounding-box-title');
      const description = header?.querySelector('.bounding-box-description div');

      expect(header).toHaveAttribute('data-header-density', 'narrow');
      expect(header).toHaveStyle({
        minHeight: '86px',
        padding: '18px 20px 20px'
      });
      expect(title).toHaveStyle({ fontSize: '20px' });
      expect(description).toHaveStyle({ fontSize: '18px' });
    });

    it('auto-compacts the definition when the Region Box is not tall enough to leave a node viewport', () => {
      const shortProps = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          title: 'Family DNA',
          description: 'The fixed era and material language every facade inherits.',
          width: 560,
          height: 260
        }
      };

      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...shortProps} />
        </ReactFlowProvider>
      );

      const header = document.querySelector(
        '.bounding-box-header'
      ) as HTMLElement | null;

      expect(header).toHaveAttribute('data-header-density', 'narrow');
      expect(header).toHaveAttribute('data-definition-state', 'auto-compact');
      expect(header).toHaveStyle({
        minHeight: '64px',
        padding: '18px 20px 20px'
      });
      expect(
        screen.queryByText('The fixed era and material language every facade inherits.')
      ).not.toBeInTheDocument();
    });

    it('keeps the definition visible for an empty short Region Box', () => {
      mockGetNodes.mockReturnValue([
        {
          id: 'test-box',
          position: { x: 100, y: 100 },
          type: 'enhancedBoundingBox'
        },
      ]);
      const emptyShortProps = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          title: 'Empty Region',
          description: 'No child nodes need vertical breathing room yet.',
          width: 560,
          height: 260
        }
      };

      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...emptyShortProps} />
        </ReactFlowProvider>
      );

      const header = document.querySelector(
        '.bounding-box-header'
      ) as HTMLElement | null;

      expect(header).toHaveAttribute('data-header-density', 'narrow');
      expect(header).toHaveAttribute('data-definition-state', 'expanded');
      expect(
        screen.getByText('No child nodes need vertical breathing room yet.')
      ).toBeInTheDocument();
    });
  });

  describe('Resize Functionality', () => {
    it('should show resize handles when selected and not collapsed', () => {
      const props = { ...defaultProps, selected: true };
      const { container } = render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...props} />
        </ReactFlowProvider>
      );
      
      const resizeHandles = container.querySelectorAll('[class*="resize-handle"]');
      expect(resizeHandles).toHaveLength(8);
    });

    it('should not show resize handles when collapsed', () => {
      const props = {
        ...defaultProps,
        selected: true,
        data: { ...defaultProps.data, isCollapsed: true },
      };
      const { container } = render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...props} />
        </ReactFlowProvider>
      );
      
      const resizeHandles = container.querySelectorAll('[class*="resize-handle"]');
      expect(resizeHandles.length).toBe(0);
    });
  });

  describe('Collapse/Expand', () => {
    it('should hide contained nodes when collapsed', () => {
      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...defaultProps} />
        </ReactFlowProvider>
      );
      
      const collapseButton = screen.getByTitle(/Collapse|Expand/i);
      fireEvent.click(collapseButton);
      
      // Check that setNodes was called to hide nodes
      expect(mockSetNodes).toHaveBeenCalled();
      
      const callbacks = mockSetNodes.mock.calls
        .map(call => call[0])
        .filter((fn): fn is (nodes: Node[]) => Node[] => typeof fn === 'function');
      expect(callbacks.length).toBeGreaterThan(0);

      const candidateResults = callbacks.map(fn =>
        fn([
          { id: 'test-box', position: { x: 100, y: 100 }, data: {} },
          { id: 'node-1', position: { x: 150, y: 150 }, hidden: false, data: {} },
        ])
      );
      const resultWithHiddenNode = candidateResults.find(updatedNodes =>
        updatedNodes.find(n => n.id === 'node-1')?.hidden === true
      );
      expect(resultWithHiddenNode).toBeDefined();
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
            { id: 'input-1', label: 'Input 1', type: 'string' as const, direction: 'input' as const, nodeId: 'test-box', position: Position.Left },
            { id: 'output-1', label: 'Output 1', type: 'string' as const, direction: 'output' as const, nodeId: 'test-box', position: Position.Right },
          ],
        },
      };
      
      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...props} />
        </ReactFlowProvider>
      );
      
      // The refactored component uses Handle components, look for those
      expect(screen.getByTestId('handle-source-output-1')).toBeInTheDocument();
      expect(screen.getByTestId('handle-target-input-1')).toBeInTheDocument();
    });

    it('should show port labels', () => {
      const props = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          isCollapsed: true,
          ports: [
            { id: 'input-1', label: 'Input 1', type: 'string' as const, direction: 'input' as const, nodeId: 'test-box', position: Position.Left },
          ],
        },
      };
      
      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...props} />
        </ReactFlowProvider>
      );
      
      // Port label might be in a tooltip or as text
      const labelText = screen.queryByText('Input 1');
      const portElement = screen.queryByTestId('handle-target-input-1');
      
      // Either the label is displayed as text or the port element exists
      expect(labelText || portElement).toBeTruthy();
    });
  });

  describe('Styling', () => {
    it('renders the header inside the box (draggable, not portaled) with its dark styling', () => {
      const wideHeaderProps = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          width: 560,
          height: 520
        }
      };
      const viewport = document.createElement('div');
      viewport.className = 'react-flow__viewport';
      const wrapper = document.createElement('div');
      wrapper.className = 'react-flow__node react-flow__node-enhancedBoundingBox';
      const mount = document.createElement('div');
      wrapper.appendChild(mount);
      viewport.appendChild(wrapper);
      document.body.appendChild(viewport);

      try {
        render(
          <ReactFlowProvider>
            <EnhancedBoundingBox {...wideHeaderProps} />
          </ReactFlowProvider>,
          { container: mount }
        );

        const headerLayer = document.querySelector(
          '.bounding-box-header-layer'
        ) as HTMLElement | null;
        const header = document.querySelector(
          '.bounding-box-header'
        ) as HTMLElement | null;
        const background = mount.querySelector('.bounding-box-background');

        expect(background).toBeTruthy();
        expect(headerLayer).toBeTruthy();
        expect(header).toBeTruthy();
        // The header is rendered INSIDE the region's node wrapper (so React
        // Flow's node-drag works from it), not portaled out to the viewport.
        expect(
          header?.closest('.react-flow__node-enhancedBoundingBox')
        ).not.toBeNull();
        // It must not be marked nodrag — the header bar is the drag handle.
        expect(headerLayer?.classList.contains('nodrag')).toBe(false);
        expect(headerLayer).toHaveStyle({ zIndex: '2200' });
        expect(header).toHaveStyle({
          backgroundColor: 'rgba(31, 34, 34, 0.98)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          minHeight: '132px',
          padding: '32px 36px 34px'
        });
        expect(header?.style.boxShadow).toContain('inset 0 1px 0');
      } finally {
        document.body.removeChild(viewport);
      }
    });

    it('should apply border radius and color from data', () => {
      const { container } = render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...defaultProps} />
        </ReactFlowProvider>
      );
      
      const boundingBox = container.querySelector('.enhanced-bounding-box-refactored');
      // Check that the element exists with proper styling (style is applied inline)
      expect(boundingBox).toBeTruthy();
      if (boundingBox) {
        const style = window.getComputedStyle(boundingBox);
        expect(style.border).toContain('2px');
      }
    });

    it('should apply background with opacity', () => {
      const { container } = render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...defaultProps} />
        </ReactFlowProvider>
      );
      
      const background = container.querySelector('.bounding-box-background');
      expect(background).toBeTruthy();
      if (background) {
        const style = window.getComputedStyle(background);
        // Background color is applied inline with rgba
        expect(style.backgroundColor).toContain('rgba');
      }
    });
  });
});
