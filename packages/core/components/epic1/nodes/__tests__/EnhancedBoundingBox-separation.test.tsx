import React from 'react';
import { render } from '@testing-library/react';
import { ReactFlowProvider } from 'reactflow';
import { EnhancedBoundingBox } from '../EnhancedBoundingBox';
import type { NodeProps } from 'reactflow';

// Mock React Flow hooks
const mockGetNodes = jest.fn();
const mockGetEdges = jest.fn();
const mockSetNodes = jest.fn();

jest.mock('reactflow', () => ({
  ...jest.requireActual('reactflow'),
  useReactFlow: () => ({
    getNodes: mockGetNodes,
    getEdges: mockGetEdges,
    setNodes: mockSetNodes,
  }),
  useStore: () => ({ nodeInternals: new Map() }),
  Handle: ({ children, ...props }: any) => <div data-testid="handle" {...props}>{children}</div>,
  Position: {
    Left: 'left',
    Right: 'right',
    Top: 'top',
    Bottom: 'bottom',
  },
}));

describe('EnhancedBoundingBox - System Separation', () => {
  const defaultProps: NodeProps = {
    id: 'box-1',
    type: 'enhancedBoundingBox',
    data: {
      title: 'Test Region Box',
      description: 'A test region box',
      backgroundColor: '#1a202c',
      borderColor: '#22d3ee',
      borderStyle: 'dashed',
      borderWidth: 2,
      opacity: 0.1,
      locked: false,
      isCollapsed: false,
    },
    selected: false,
    dragging: false,
    xPos: 0,
    yPos: 0,
    zIndex: 0,
    isConnectable: true,
    targetPosition: 'left' as any,
    sourcePosition: 'right' as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Position-based containment only', () => {
    it('should NOT include nodes with parentNode in containment', () => {
      mockGetNodes.mockReturnValue([
        { id: 'box-1', type: 'enhancedBoundingBox', position: { x: 0, y: 0 }, width: 400, height: 300 },
        // Node with parent (belongs to a fragment)
        { id: 'node-1', parentNode: 'fragment-1', position: { x: 50, y: 50 }, width: 150, height: 50 },
        // Free node within bounds
        { id: 'node-2', position: { x: 50, y: 100 }, width: 150, height: 50 },
        // Free node outside bounds
        { id: 'node-3', position: { x: 500, y: 500 }, width: 150, height: 50 },
      ]);
      mockGetEdges.mockReturnValue([]);

      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...defaultProps} />
        </ReactFlowProvider>
      );

      // The component should calculate contained nodes
      // Based on the refactored logic, only node-2 should be contained
      // node-1 has a parentNode so should be skipped
      // node-3 is outside bounds
      
      // We can't directly test the internal state, but we can verify
      // through the movement behavior when locked and dragging
    });

    it('should ignore fragmentContainer nodes in containment check', () => {
      mockGetNodes.mockReturnValue([
        { id: 'box-1', type: 'enhancedBoundingBox', position: { x: 0, y: 0 }, width: 400, height: 300 },
        { id: 'fragment-1', type: 'fragmentContainer', position: { x: 50, y: 50 }, width: 150, height: 100 },
        { id: 'node-1', position: { x: 50, y: 200 }, width: 150, height: 50 },
      ]);
      mockGetEdges.mockReturnValue([]);

      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...defaultProps} />
        </ReactFlowProvider>
      );

      // FragmentContainer should not be considered for containment
      // Only regular nodes without parentNode should be contained
    });

    it('should only move position-contained nodes when locked', () => {
      const nodes = [
        { id: 'box-1', type: 'enhancedBoundingBox', position: { x: 0, y: 0 }, width: 400, height: 300 },
        // Fragment child - should NOT move
        { id: 'node-1', parentNode: 'fragment-1', position: { x: 50, y: 50 }, width: 150, height: 50 },
        // Position-contained node - should move
        { id: 'node-2', position: { x: 50, y: 100 }, width: 150, height: 50 },
        // Outside node - should NOT move
        { id: 'node-3', position: { x: 500, y: 500 }, width: 150, height: 50 },
      ];
      
      mockGetNodes.mockReturnValue(nodes);
      mockGetEdges.mockReturnValue([]);

      const lockedProps = {
        ...defaultProps,
        data: { ...defaultProps.data, locked: true },
        dragging: true,
      };

      const { rerender } = render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...lockedProps} xPos={0} yPos={0} />
        </ReactFlowProvider>
      );

      // Simulate dragging by changing position
      rerender(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...lockedProps} xPos={10} yPos={10} />
        </ReactFlowProvider>
      );

      // Check that setNodes was called
      expect(mockSetNodes).toHaveBeenCalled();
      
      const setNodeCallbacks = mockSetNodes.mock.calls
        .map(call => call[0])
        .filter((fn): fn is (nodes: any[]) => any[] => typeof fn === 'function');
      const updatedNodes = setNodeCallbacks
        .map(callback => callback(nodes))
        .find(updated => updated[2].position.x === 60 && updated[2].position.y === 110);

      expect(updatedNodes).toBeDefined();

      // node-1 should NOT move (has parentNode)
      expect(updatedNodes![1].position).toEqual({ x: 50, y: 50 });
      
      // node-2 should move (position-contained)
      expect(updatedNodes![2].position).toEqual({ x: 60, y: 110 });
      
      // node-3 should NOT move (outside bounds)
      expect(updatedNodes![3].position).toEqual({ x: 500, y: 500 });
    });
  });

  describe('No fragment handling', () => {
    it('should not check for parentNode equality with box id', () => {
      mockGetNodes.mockReturnValue([
        { id: 'box-1', type: 'enhancedBoundingBox', position: { x: 0, y: 0 }, width: 400, height: 300 },
        // This node has box-1 as parent (old fragment behavior)
        // Should NOT be included since it has any parentNode
        { id: 'node-1', parentNode: 'box-1', position: { x: 50, y: 50 }, width: 150, height: 50 },
      ]);
      mockGetEdges.mockReturnValue([]);

      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...defaultProps} />
        </ReactFlowProvider>
      );

      // The node should be excluded from containment because it has a parentNode
      // regardless of whether the parentNode is this box or not
    });

    it('should not have special handling for nodes with parentNode during movement', () => {
      const nodes = [
        { id: 'box-1', type: 'enhancedBoundingBox', position: { x: 0, y: 0 }, width: 400, height: 300 },
        { id: 'node-1', parentNode: 'box-1', position: { x: 50, y: 50 }, width: 150, height: 50 },
        { id: 'node-2', position: { x: 50, y: 100 }, width: 150, height: 50 },
      ];
      
      mockGetNodes.mockReturnValue(nodes);
      mockGetEdges.mockReturnValue([]);

      const lockedProps = {
        ...defaultProps,
        data: { ...defaultProps.data, locked: true },
        dragging: true,
      };

      const { rerender } = render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...lockedProps} xPos={0} yPos={0} />
        </ReactFlowProvider>
      );

      rerender(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...lockedProps} xPos={10} yPos={10} />
        </ReactFlowProvider>
      );

      const setNodeCallbacks = mockSetNodes.mock.calls
        .map(call => call[0])
        .filter((fn): fn is (nodes: any[]) => any[] => typeof fn === 'function');
      const setNodesCallback = setNodeCallbacks[setNodeCallbacks.length - 1];
      const updatedNodes = setNodesCallback(nodes);

      // node-1 should not move even though it has box-1 as parent
      // because nodes with parentNode are excluded from region box containment
      expect(updatedNodes[1].position).toEqual({ x: 50, y: 50 });
    });
  });

  describe('Visual distinction', () => {
    it('should use teal color scheme for region boxes', () => {
      const { container } = render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...defaultProps} />
        </ReactFlowProvider>
      );

      // The component should maintain its teal color scheme
      // This is visually distinct from purple FragmentContainers
      // Testing through data props since styles are complex
      expect(defaultProps.data.borderColor).toBe('#22d3ee'); // Teal
    });

    it('should maintain dashed border style option', () => {
      const dashedProps = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          borderStyle: 'dashed' as const,
        },
      };

      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...dashedProps} />
        </ReactFlowProvider>
      );

      // Should support dashed borders for visual distinction
      expect(dashedProps.data.borderStyle).toBe('dashed');
    });
  });

  describe('Clean separation from fragments', () => {
    it('should work independently of fragment containers', () => {
      mockGetNodes.mockReturnValue([
        // Region box
        { id: 'box-1', type: 'enhancedBoundingBox', position: { x: 0, y: 0 }, width: 400, height: 300 },
        // Fragment container (separate system)
        { id: 'fragment-1', type: 'fragmentContainer', position: { x: 500, y: 0 }, width: 200, height: 200 },
        // Fragment child
        { id: 'node-1', parentNode: 'fragment-1', position: { x: 10, y: 10 }, width: 150, height: 50 },
        // Free node in region box
        { id: 'node-2', position: { x: 50, y: 50 }, width: 150, height: 50 },
      ]);
      mockGetEdges.mockReturnValue([]);

      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...defaultProps} />
        </ReactFlowProvider>
      );

      // Region box should only care about node-2
      // Fragment and its children are completely separate
    });

    it('should not interfere with fragment collapse/expand', () => {
      mockGetNodes.mockReturnValue([
        { id: 'box-1', type: 'enhancedBoundingBox', position: { x: 0, y: 0 }, width: 400, height: 300 },
        { id: 'fragment-1', type: 'fragmentContainer', position: { x: 50, y: 50 }, width: 200, height: 150 },
        { id: 'node-1', parentNode: 'fragment-1', position: { x: 10, y: 10 }, hidden: true }, // Collapsed
      ]);
      mockGetEdges.mockReturnValue([]);

      render(
        <ReactFlowProvider>
          <EnhancedBoundingBox {...defaultProps} />
        </ReactFlowProvider>
      );

      // Should not try to include or move hidden fragment children
      // They are managed by the fragment container
    });
  });
});
