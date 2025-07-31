/**
 * Advanced GraphCanvas rendering tests focusing on performance and edge cases
 * Complements existing GraphCanvas.test.tsx with specialized scenarios
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { GraphCanvas } from '../../src/components/GraphCanvas';
import { ThemeProvider } from '../../src/components/ThemeProvider';

// Performance testing utilities
const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now();
  renderFn();
  await waitFor(() => {}, { timeout: 100 });
  return performance.now() - start;
};

const createLargeGraph = (nodeCount: number, edgeRatio: number = 0.3) => {
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    id: `perf-node-${i}`,
    type: i % 3 === 0 ? 'WeightedChoice' : i % 3 === 1 ? 'Output' : 'Concat',
    data: {
      label: `Node ${i}`,
      ...(i % 3 === 0 && { choices: [{ value: `Choice ${i}`, weight: 1 }] }),
      ...(i % 3 === 1 && { text: `Output ${i}` }),
      ...(i % 3 === 2 && { parts: [`Part ${i}`] }),
    },
    position: {
      x: (i % 10) * 150,
      y: Math.floor(i / 10) * 100,
    },
  }));

  const edgeCount = Math.floor(nodeCount * edgeRatio);
  const edges = Array.from({ length: edgeCount }, (_, i) => ({
    id: `perf-edge-${i}`,
    source: `perf-node-${i}`,
    target: `perf-node-${Math.min(i + 1, nodeCount - 1)}`,
    animated: i % 5 === 0,
  }));

  return { nodes, edges };
};

const renderGraphCanvas = (props = {}) => {
  return render(
    <ThemeProvider>
      <GraphCanvas
        graph={{ nodes: [], edges: [] }}
        onNodeSelect={jest.fn()}
        onNodeMove={jest.fn()}
        onEdgeCreate={jest.fn()}
        onEdgeDelete={jest.fn()}
        {...props}
      />
    </ThemeProvider>
  );
};

describe('GraphCanvas Advanced Rendering', () => {
  describe('Performance Tests', () => {
    it('renders 100 nodes within acceptable time', async () => {
      const largeGraph = createLargeGraph(100);

      const renderTime = await measureRenderTime(() => {
        renderGraphCanvas({ graph: largeGraph });
      });

      // Should render within 1 second
      expect(renderTime).toBeLessThan(1000);

      expect(screen.getAllByText(/Node \d+/).length).toBe(100);
    });

    it('handles 500 nodes without crashing', async () => {
      const massiveGraph = createLargeGraph(500, 0.1);

      expect(() => {
        renderGraphCanvas({ graph: massiveGraph });
      }).not.toThrow();

      await waitFor(() => {
        expect(screen.getByText(/Nodes: 500/)).toBeInTheDocument();
      });
    });

    it('maintains 60fps during node dragging simulation', async () => {
      const graph = createLargeGraph(50);
      renderGraphCanvas({ graph });

      const node = screen.getAllByText(/Node \d+/)[0].closest('.ui-graph-node');
      expect(node).toBeInTheDocument();

      // Simulate continuous drag operations
      const dragOperations = 30;
      const startTime = performance.now();

      for (let i = 0; i < dragOperations; i++) {
        fireEvent.mouseDown(node!, { clientX: 100 + i, clientY: 100 + i });
        fireEvent.mouseMove(node!, { clientX: 105 + i, clientY: 105 + i });
        fireEvent.mouseUp(node!);
        await new Promise(resolve => setTimeout(resolve, 16)); // ~60fps
      }

      const totalTime = performance.now() - startTime;
      const avgTimePerFrame = totalTime / dragOperations;

      // Should maintain 60fps (16.67ms per frame)
      expect(avgTimePerFrame).toBeLessThan(20);
    });

    it('efficiently updates when nodes change', async () => {
      const initialGraph = createLargeGraph(50);
      const { rerender } = renderGraphCanvas({ graph: initialGraph });

      const updateTime = await measureRenderTime(() => {
        const updatedGraph = {
          ...initialGraph,
          nodes: initialGraph.nodes.map((node, i) => ({
            ...node,
            position: { x: node.position.x + 10, y: node.position.y + 10 },
          })),
        };

        rerender(
          <ThemeProvider>
            <GraphCanvas
              graph={updatedGraph}
              onNodeSelect={jest.fn()}
              onNodeMove={jest.fn()}
              onEdgeCreate={jest.fn()}
              onEdgeDelete={jest.fn()}
            />
          </ThemeProvider>
        );
      });

      // Updates should be fast
      expect(updateTime).toBeLessThan(100);
    });
  });

  describe('Edge Cases', () => {
    it('handles circular graphs without infinite loops', () => {
      const circularGraph = {
        nodes: [
          { id: 'a', type: 'WeightedChoice', data: { label: 'A' }, position: { x: 0, y: 0 } },
          { id: 'b', type: 'Output', data: { label: 'B' }, position: { x: 100, y: 0 } },
          { id: 'c', type: 'Concat', data: { label: 'C' }, position: { x: 50, y: 100 } },
        ],
        edges: [
          { id: 'ab', source: 'a', target: 'b' },
          { id: 'bc', source: 'b', target: 'c' },
          { id: 'ca', source: 'c', target: 'a' },
        ],
      };

      expect(() => {
        renderGraphCanvas({ graph: circularGraph });
      }).not.toThrow();

      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('C')).toBeInTheDocument();
    });

    it('handles malformed node data gracefully', () => {
      const malformedGraph = {
        nodes: [
          { id: 'good', type: 'Output', data: { label: 'Good Node' }, position: { x: 0, y: 0 } },
          { id: 'bad', type: 'WeightedChoice', data: null, position: { x: 100, y: 0 } },
          { id: 'ugly', type: undefined, data: { label: 'Ugly Node' }, position: { x: 200, y: 0 } },
        ],
        edges: [],
      };

      expect(() => {
        renderGraphCanvas({ graph: malformedGraph });
      }).not.toThrow();

      expect(screen.getByText('Good Node')).toBeInTheDocument();
    });

    it('handles overlapping nodes correctly', () => {
      const overlappingGraph = {
        nodes: [
          { id: 'node1', type: 'Output', data: { label: 'Node 1' }, position: { x: 100, y: 100 } },
          { id: 'node2', type: 'Output', data: { label: 'Node 2' }, position: { x: 100, y: 100 } },
          { id: 'node3', type: 'Output', data: { label: 'Node 3' }, position: { x: 105, y: 105 } },
        ],
        edges: [],
      };

      renderGraphCanvas({ graph: overlappingGraph });

      expect(screen.getByText('Node 1')).toBeInTheDocument();
      expect(screen.getByText('Node 2')).toBeInTheDocument();
      expect(screen.getByText('Node 3')).toBeInTheDocument();
    });

    it('handles extreme zoom levels', async () => {
      const graph = createLargeGraph(10);
      renderGraphCanvas({ graph, showControls: true });

      const zoomInButton = screen.getByText('🔍+');
      const zoomOutButton = screen.getByText('🔍-');

      // Extreme zoom in
      for (let i = 0; i < 20; i++) {
        await userEvent.click(zoomInButton);
      }

      expect(screen.getByText(/Zoom: \d+%/)).toBeInTheDocument();

      // Extreme zoom out
      for (let i = 0; i < 30; i++) {
        await userEvent.click(zoomOutButton);
      }

      expect(screen.getByText(/Zoom: \d+%/)).toBeInTheDocument();
    });

    it('handles rapid viewport changes', async () => {
      const graph = createLargeGraph(25);
      renderGraphCanvas({ graph, showControls: true });

      const container = document.querySelector('.ui-graph-canvas-container');
      expect(container).toBeInTheDocument();

      // Rapid pan operations
      for (let i = 0; i < 10; i++) {
        fireEvent.mouseDown(container!, { clientX: 100, clientY: 100 });
        fireEvent.mouseMove(container!, { clientX: 100 + i * 10, clientY: 100 + i * 10 });
        fireEvent.mouseUp(container!);
      }

      // Should remain stable
      expect(container).toBeInTheDocument();
    });
  });

  describe('Memory Management', () => {
    it('cleans up resources when unmounting', () => {
      const graph = createLargeGraph(100);
      const { unmount } = renderGraphCanvas({ graph });

      // Verify initial render
      expect(screen.getAllByText(/Node \d+/).length).toBe(100);

      // Should unmount without memory leaks
      expect(() => unmount()).not.toThrow();
    });

    it('handles component re-mounting', () => {
      const graph = createLargeGraph(50);
      const { unmount } = renderGraphCanvas({ graph });

      unmount();

      // Re-mount should work correctly
      expect(() => {
        renderGraphCanvas({ graph });
      }).not.toThrow();

      expect(screen.getAllByText(/Node \d+/).length).toBe(50);
    });
  });

  describe('Accessibility', () => {
    it('maintains keyboard navigation with large graphs', async () => {
      const graph = createLargeGraph(20);
      renderGraphCanvas({ graph });

      const nodes = screen.getAllByRole('generic').filter(el => el.classList.contains('ui-graph-node'));

      expect(nodes.length).toBeGreaterThan(0);

      // Test tabbing through nodes
      if (nodes[0]) {
        nodes[0].focus();
        expect(document.activeElement).toBe(nodes[0]);

        // Should be able to navigate with keyboard
        fireEvent.keyDown(nodes[0], { key: 'Tab' });
      }
    });

    it('provides screen reader information for large graphs', () => {
      const graph = createLargeGraph(100);
      renderGraphCanvas({ graph });

      expect(screen.getByText(/Nodes: 100/)).toBeInTheDocument();
      expect(screen.getByText(/Edges: \d+/)).toBeInTheDocument();
    });
  });

  describe('Error Recovery', () => {
    it('recovers from rendering errors gracefully', () => {
      // Force an error condition
      const errorGraph = {
        nodes: [
          {
            id: 'error-node',
            type: 'WeightedChoice',
            data: { label: 'Error Node' },
            position: { x: NaN, y: NaN },
          },
        ],
        edges: [],
      };

      // Should handle NaN positions gracefully
      expect(() => {
        renderGraphCanvas({ graph: errorGraph });
      }).not.toThrow();
    });

    it('continues working after prop validation errors', () => {
      const invalidProps = {
        graph: null,
        onNodeSelect: 'not-a-function',
        showControls: 'not-a-boolean',
      };

      // Should render with fallback behavior
      expect(() => {
        renderGraphCanvas(invalidProps);
      }).not.toThrow();
    });
  });

  describe('Theme Switching', () => {
    it('handles theme changes with large graphs', async () => {
      const graph = createLargeGraph(50);

      const { rerender } = render(
        <ThemeProvider theme="light">
          <GraphCanvas
            graph={graph}
            onNodeSelect={jest.fn()}
            onNodeMove={jest.fn()}
            onEdgeCreate={jest.fn()}
            onEdgeDelete={jest.fn()}
          />
        </ThemeProvider>
      );

      expect(screen.getAllByText(/Node \d+/).length).toBe(50);

      // Switch to dark theme
      rerender(
        <ThemeProvider theme="dark">
          <GraphCanvas
            graph={graph}
            onNodeSelect={jest.fn()}
            onNodeMove={jest.fn()}
            onEdgeCreate={jest.fn()}
            onEdgeDelete={jest.fn()}
          />
        </ThemeProvider>
      );

      // Should maintain node count after theme switch
      expect(screen.getAllByText(/Node \d+/).length).toBe(50);
    });
  });
});
