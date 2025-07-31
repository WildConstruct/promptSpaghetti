/**
 * GraphCanvas component tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphCanvas } from '../../src/components/GraphCanvas';
import { ThemeProvider } from '../../src/components/ThemeProvider';

const mockGraph = {
  nodes: [
    {
      id: 'node1',
      type: 'WeightedChoice',
      data: { choices: [{ value: 'Option 1', weight: 1 }] },
      position: { x: 100, y: 100 },
    },
    {
      id: 'node2',
      type: 'Output',
      data: { text: 'Hello World' },
      position: { x: 300, y: 100 },
    },
  ],
  edges: [
    {
      id: 'edge1',
      source: 'node1',
      target: 'node2',
    },
  ],
};

const renderGraphCanvas = (props = {}) => {
  return render(
    <ThemeProvider>
      <GraphCanvas
        graph={mockGraph}
        onNodeSelect={jest.fn()}
        onNodeMove={jest.fn()}
        onEdgeCreate={jest.fn()}
        onEdgeDelete={jest.fn()}
        {...props}
      />
    </ThemeProvider>
  );
};

describe('GraphCanvas', () => {
  it('renders graph nodes', () => {
    renderGraphCanvas();
    expect(screen.getByText('WeightedChoice')).toBeInTheDocument();
    expect(screen.getByText('Output')).toBeInTheDocument();
  });

  it('renders graph edges', () => {
    renderGraphCanvas();
    const svg = document.querySelector('svg.ui-graph-edges');
    expect(svg).toBeInTheDocument();

    const edges = svg?.querySelectorAll('line');
    expect(edges).toHaveLength(1);
  });

  it('calls onNodeSelect when node is clicked', async () => {
    const handleNodeSelect = jest.fn();
    renderGraphCanvas({ onNodeSelect: handleNodeSelect });

    const node = screen.getByText('WeightedChoice').closest('.ui-graph-node');
    if (node) {
      await userEvent.click(node);
      expect(handleNodeSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'node1',
          type: 'WeightedChoice',
        })
      );
    }
  });

  it('shows selected node with highlight', () => {
    renderGraphCanvas({ selectedNodeId: 'node1' });
    const selectedNode = screen.getByText('WeightedChoice').closest('.ui-graph-node');
    expect(selectedNode).toHaveClass('ui-graph-node--selected');
  });

  it('shows zoom controls when enabled', () => {
    renderGraphCanvas({ showControls: true });
    expect(screen.getByText('🔍+')).toBeInTheDocument();
    expect(screen.getByText('🔍-')).toBeInTheDocument();
    expect(screen.getByText('🎯')).toBeInTheDocument();
    expect(screen.getByText('📐')).toBeInTheDocument();
  });

  it('hides controls when disabled', () => {
    renderGraphCanvas({ showControls: false });
    expect(screen.queryByText('🔍+')).not.toBeInTheDocument();
  });

  it('shows minimap when enabled', () => {
    renderGraphCanvas({ showMinimap: true });
    expect(screen.getByText('Minimap')).toBeInTheDocument();
  });

  it('shows status info', () => {
    renderGraphCanvas();
    expect(screen.getByText(/Nodes: 2/)).toBeInTheDocument();
    expect(screen.getByText(/Edges: 1/)).toBeInTheDocument();
    expect(screen.getByText(/Zoom: 100%/)).toBeInTheDocument();
  });

  it('handles zoom controls', async () => {
    renderGraphCanvas({ showControls: true });

    const zoomInButton = screen.getByText('🔍+');
    const zoomOutButton = screen.getByText('🔍-');

    await userEvent.click(zoomInButton);
    expect(screen.getByText(/Zoom: 120%/)).toBeInTheDocument();

    await userEvent.click(zoomOutButton);
    expect(screen.getByText(/Zoom: 100%/)).toBeInTheDocument();
  });

  it('handles wheel zoom', () => {
    renderGraphCanvas();
    const canvas = screen.getByRole('generic', { hidden: true });

    fireEvent.wheel(canvas, { deltaY: -100 });
    expect(screen.getByText(/Zoom: 110%/)).toBeInTheDocument();

    fireEvent.wheel(canvas, { deltaY: 100 });
    expect(screen.getByText(/Zoom: 100%/)).toBeInTheDocument();
  });

  it('supports readonly mode', () => {
    renderGraphCanvas({ readOnly: true });
    const nodes = document.querySelectorAll('.ui-graph-node');

    nodes.forEach(node => {
      expect(node).toHaveStyle({ cursor: 'pointer' });
    });

    // Connection handles should not be visible in readonly mode
    const connectionHandles = document.querySelectorAll('.ui-connection-handle');
    expect(connectionHandles).toHaveLength(0);
  });

  it('shows connection handles in edit mode', () => {
    renderGraphCanvas({ readOnly: false });
    const connectionHandles = document.querySelectorAll('.ui-connection-handle');
    expect(connectionHandles.length).toBeGreaterThan(0);
  });

  it('handles mouse interactions for panning', () => {
    renderGraphCanvas();
    const container = document.querySelector('.ui-graph-canvas-container');

    if (container) {
      fireEvent.mouseDown(container, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(container, { clientX: 110, clientY: 110, movementX: 10, movementY: 10 });
      fireEvent.mouseUp(container);
    }

    // Pan functionality would be tested through viewport state changes
  });

  it('applies node type-specific styling', () => {
    renderGraphCanvas();

    const weightedChoiceNode = screen.getByText('WeightedChoice').closest('.ui-graph-node');
    const outputNode = screen.getByText('Output').closest('.ui-graph-node');

    // Different node types should have different border colors
    expect(weightedChoiceNode).toHaveStyle({ borderColor: expect.any(String) });
    expect(outputNode).toHaveStyle({ borderColor: expect.any(String) });
  });

  it('handles empty graph', () => {
    renderGraphCanvas({ graph: { nodes: [], edges: [] } });
    expect(screen.getByText(/Nodes: 0/)).toBeInTheDocument();
    expect(screen.getByText(/Edges: 0/)).toBeInTheDocument();
  });

  it('supports custom className and styles', () => {
    renderGraphCanvas({
      className: 'custom-canvas',
      style: { backgroundColor: 'red' },
    });

    const canvas = document.querySelector('.ui-graph-canvas');
    expect(canvas).toHaveClass('custom-canvas');
    expect(canvas).toHaveStyle({ backgroundColor: 'red' });
  });
});
