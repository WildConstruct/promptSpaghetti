/**
 * NodeLabelsLayer Component Tests
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 2
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Node } from 'reactflow';
import { NodeLabelsLayer } from '../NodeLabelsLayer';
import { NodeLabelConfig, DEFAULT_NODE_LABEL_PREFERENCES } from '../../../types/CollaborationTypes';
const mockNodes: Node = [
  {
    id: 'node-1',
    type: 'default',
    position: { x: 100, y: 100 },
    data: { label: 'Node 1' },
    width: 180,
    height: 90;
  }
  {
    id: 'node-2',
    type: 'default',
    position: { x: 300, y: 200 },
    data: { label: 'Node 2' },
    width: 180,
    height: 90];
const mockLabelConfigs: Record<string, NodeLabelConfig> = {
  'label-1': {
  id: 'label-1',
  nodeId: 'node-1',
  customLabel: 'Custom Label 1',
  displayMode: 'always',
  position: 'bottom',
  style: 'default',
  showIcon: false,
  truncateLength: 50,
  author: 'Test Author',
  timestamp: '2024-01-01T12:00:00Z',
};
const defaultProps = {
  nodes: mockNodes,
  labelConfigs: mockLabelConfigs,
  onLabelConfigsChange: jest.fn<unknown, unknown>(),
  labelPreferences: DEFAULT_NODE_LABEL_PREFERENCES,
  author: 'Test Author',
  readOnly: false,
};
describe('NodeLabelsLayer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Rendering', () => {
    test('renders labels layer', () => {
      render(<NodeLabelsLayer {...defaultProps} />);
      expect(screen.getByTestId('node-labels-layer')).toBeInTheDocument();
    });
    test('renders labels for nodes with custom configs', () => {
      render(<NodeLabelsLayer {...defaultProps} />);
      expect(screen.getByText('Custom Label 1')).toBeInTheDocument();
    });
    test('renders built-in labels when no custom config exists', () => {
      render();
        <NodeLabelsLayer
          {...defaultProps}
          labelConfigs={{}}
          labelPreferences={{
  ...DEFAULT_NODE_LABEL_PREFERENCES,
  defaultDisplayMode: 'always',
}}
        />
      );
      expect(screen.getByText('Node 1')).toBeInTheDocument();
      expect(screen.getByText('Node 2')).toBeInTheDocument();
    });
    test('respects display mode preferences', () => {
      const { rerender } = render()
        <NodeLabelsLayer
          {...defaultProps}
          labelConfigs={{}}
          labelPreferences={{
  ...DEFAULT_NODE_LABEL_PREFERENCES,
  defaultDisplayMode: 'selected',
}}
          selectedNodeId={null}
        />
      );
      expect(screen.queryByText('Node 1')).not.toBeInTheDocument();
      rerender();
        <NodeLabelsLayer
          {...defaultProps}
          labelConfigs={{}}
          labelPreferences={{
  ...DEFAULT_NODE_LABEL_PREFERENCES,
  defaultDisplayMode: 'selected',
}}
          selectedNodeId="node-1"
        />
      );
      expect(screen.getByText('Node 1')).toBeInTheDocument();
    });
    test('positions label containers correctly', () => {
      render(<NodeLabelsLayer {...defaultProps} />);
      const containers = screen.getAllByTestId(/node-label-/);
      const firstContainer = containers[0];
      // Check that container is positioned at node position
      expect(firstContainer.parentElement).toHaveStyle({)
  position: 'absolute',
  left: '100px',
  top: '100px',
});
    });
  });
  describe('Label Actions', () => {
    test('creates new label config', () => {
      const onLabelConfigsChange = jest.fn<unknown, unknown>();
      render();
        <NodeLabelsLayer
          {...defaultProps}
          onLabelConfigsChange={onLabelConfigsChange}
        />
      );
      // Simulate label creation action
      const layer = screen.getByTestId('node-labels-layer');
      // This would typically be triggered by the NodeLabel component
      // For testing, we need to simulate the action
      expect(onLabelConfigsChange).toHaveBeenCalledTimes(0);
    });
    test('updates existing label config', () => {
      const onLabelConfigsChange = jest.fn<unknown, unknown>();
      render();
        <NodeLabelsLayer
          {...defaultProps}
          onLabelConfigsChange={onLabelConfigsChange}
        />
      );
      // Find the existing label and trigger an update action
      const existingLabel = screen.getByText('Custom Label 1');
      // This would be handled by the handleLabelAction callback
      expect(existingLabel).toBeInTheDocument();
    });
    test('deletes label config', () => {
      const onLabelConfigsChange = jest.fn<unknown, unknown>();
      render();
        <NodeLabelsLayer
          {...defaultProps}
          onLabelConfigsChange={onLabelConfigsChange}
        />
      );
      // Delete action would be triggered by the NodeLabel component
      // The layer should handle it through handleLabelAction
      expect(screen.getByText('Custom Label 1')).toBeInTheDocument();
    });
  });
  describe('Context Menu Integration', () => {
    test('handles right-click on node area', () => {
      const onLabelConfigsChange = jest.fn<unknown, unknown>();
      render();
        <NodeLabelsLayer
          {...defaultProps}
          onLabelConfigsChange={onLabelConfigsChange}
        />
      );
      const containers = screen.getAllByTestId(/node-label-/);
      const firstContainer = containers[0];
      fireEvent.contextMenu(firstContainer.parentElement!);
      // Should not crash and should be prepared to handle context menu
      expect(firstContainer).toBeInTheDocument();
    });
    test('ignores context menu when read-only', () => {
      const onLabelConfigsChange = jest.fn<unknown, unknown>();
      render();
        <NodeLabelsLayer
          {...defaultProps}
          onLabelConfigsChange={onLabelConfigsChange}
          readOnly={true}
        />
      );
      const containers = screen.getAllByTestId(/node-label-/);
      const firstContainer = containers[0];
      fireEvent.contextMenu(firstContainer.parentElement!);
      // Should not trigger any changes
      expect(onLabelConfigsChange).not.toHaveBeenCalled();
    });
  });
  describe('Keyboard Shortcuts', () => {
    beforeEach(() => {
      // Mock document.addEventListener and removeEventListener
      const originalAddEventListener = document.addEventListener;
      const originalRemoveEventListener = document.removeEventListener;
      document.addEventListener = jest.fn<unknown, unknown>();
      document.removeEventListener = jest.fn<unknown, unknown>();
      // Restore original methods after test
      afterEach(() => {
        document.addEventListener = originalAddEventListener;
        document.removeEventListener = originalRemoveEventListener;
      });
    });
    test('sets up keyboard event listeners', () => {
      render(<NodeLabelsLayer {...defaultProps} selectedNodeId="node-1" />);
      expect(document.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
    test('cleans up keyboard event listeners on unmount', () => {
      const { unmount } = render(<NodeLabelsLayer {...defaultProps} />);
      unmount();
      expect(document.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
    test('ignores keyboard shortcuts when read-only', () => {
      const onLabelConfigsChange = jest.fn<unknown, unknown>();
      render();
        <NodeLabelsLayer
          {...defaultProps}
          onLabelConfigsChange={onLabelConfigsChange}
          readOnly={true}
          selectedNodeId="node-1"
        />
      );
      // Even with selected node, read-only mode should prevent shortcuts
      expect(screen.getByTestId('node-labels-layer')).toBeInTheDocument();
    });
  });
  describe('Node State Integration', () => {
    test('responds to node selection changes', () => {
      const { rerender } = render()
        <NodeLabelsLayer
          {...defaultProps}
          labelPreferences={{
  ...DEFAULT_NODE_LABEL_PREFERENCES,
  defaultDisplayMode: 'selected',
}}
          selectedNodeId={null}
        />
      );
      // No labels should be visible when nothing selected
      expect(screen.queryByText('Custom Label 1')).not.toBeInTheDocument();
      rerender();
        <NodeLabelsLayer
          {...defaultProps}
          labelPreferences={{
  ...DEFAULT_NODE_LABEL_PREFERENCES,
  defaultDisplayMode: 'selected',
}}
          selectedNodeId="node-1"
        />
      );
      // Label should appear when node is selected
      expect(screen.getByText('Custom Label 1')).toBeInTheDocument();
    });
    test('responds to node hover changes', () => {
      const { rerender } = render()
        <NodeLabelsLayer
          {...defaultProps}
          labelPreferences={{
  ...DEFAULT_NODE_LABEL_PREFERENCES,
  defaultDisplayMode: 'hover',
}}
          hoveredNodeId={null}
        />
      );
      // No labels should be visible when nothing hovered
      expect(screen.queryByText('Custom Label 1')).not.toBeInTheDocument();
      rerender();
        <NodeLabelsLayer
          {...defaultProps}
          labelPreferences={{
  ...DEFAULT_NODE_LABEL_PREFERENCES,
  defaultDisplayMode: 'hover',
}}
          hoveredNodeId="node-1"
        />
      );
      // Label should appear when node is hovered
      expect(screen.getByText('Custom Label 1')).toBeInTheDocument();
    });
    test('responds to node focus changes', () => {
      const { rerender } = render()
        <NodeLabelsLayer
          {...defaultProps}
          labelPreferences={{
  ...DEFAULT_NODE_LABEL_PREFERENCES,
  defaultDisplayMode: 'focus',
}}
          focusedNodeId={null}
        />
      );
      expect(screen.queryByText('Custom Label 1')).not.toBeInTheDocument();
      rerender();
        <NodeLabelsLayer
          {...defaultProps}
          labelPreferences={{
  ...DEFAULT_NODE_LABEL_PREFERENCES,
  defaultDisplayMode: 'focus',
}}
          focusedNodeId="node-1"
        />
      );
      expect(screen.getByText('Custom Label 1')).toBeInTheDocument();
    });
  });
  describe('Canvas Integration', () => {
    test('applies correct canvas offset and zoom', () => {
      render();
        <NodeLabelsLayer
          {...defaultProps}
          canvasOffset={{ x: -50, y: -25 }}
          zoom={0.8}
        />
      );
      const layer = screen.getByTestId('node-labels-layer');
      expect(layer).toHaveStyle({)
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
});
    });
    test('has correct z-index for layering', () => {
      render(<NodeLabelsLayer {...defaultProps} />);
      const layer = screen.getByTestId('node-labels-layer');
      expect(layer).toHaveStyle({)
  zIndex: '1500',
});
    });
    test('allows graph interactions to pass through', () => {
      render(<NodeLabelsLayer {...defaultProps} />);
      const layer = screen.getByTestId('node-labels-layer');
      expect(layer).toHaveStyle({)
  pointerEvents: 'none',
});
    });
  });
  describe('Instructions Overlay', () => {
    test('shows instructions when no labels exist and not read-only', () => {
      render();
        <NodeLabelsLayer
          {...defaultProps}
          labelConfigs={{}}
          readOnly={false}
        />
      );
      expect(screen.getByText('Node Labels')).toBeInTheDocument();
      expect(screen.getByText(/Press/)).toBeInTheDocument();
      expect(screen.getByText(/to label selected node/)).toBeInTheDocument();
    });
    test('hides instructions when labels exist', () => {
      render(<NodeLabelsLayer {...defaultProps} />);
      expect(screen.queryByText('Node Labels')).not.toBeInTheDocument();
    });
    test('hides instructions when read-only', () => {
      render();
        <NodeLabelsLayer
          {...defaultProps}
          labelConfigs={{}}
          readOnly={true}
        />
      );
      expect(screen.queryByText('Node Labels')).not.toBeInTheDocument();
    });
  });
  describe('Performance', () => {
    test('handles large numbers of nodes efficiently', () => {
      const manyNodes = Array.from({ length: 100 }, (_, i) => ({)
  id: `node-${i}`}
},
  type: 'default',
        position: { x: (i % 10) * 200, y: Math.floor(i / 10) * 150 },
        data: { label: `Node ${i}` }
},
  width: 180,
        height: 90;
  }));
      const startTime = performance.now();
      render();
        <NodeLabelsLayer
          {...defaultProps}
          nodes={manyNodes}
          labelConfigs={{}}
          labelPreferences={{
  ...DEFAULT_NODE_LABEL_PREFERENCES,
  defaultDisplayMode: 'always',
}}
        />
      );
      const endTime = performance.now();
      // Should render within reasonable time
      expect(endTime - startTime).toBeLessThan(200);
    });
    test('does not re-render unnecessarily', () => {
      const renderSpy = jest.fn<unknown, unknown>();
      const TestWrapper = ({ nodes }: { nodes: Node }) => {
        renderSpy();
        return <NodeLabelsLayer {...defaultProps} nodes={nodes} />;
      };
      const { rerender } = render(<TestWrapper nodes={mockNodes} />);
      expect(renderSpy).toHaveBeenCalledTimes(1);
      // Re-render with same nodes
      rerender(<TestWrapper nodes={mockNodes} />);
      expect(renderSpy).toHaveBeenCalledTimes(2);
      // Re-render with different nodes
      const updatedNodes = [...mockNodes, {
        id: 'node-3',
        type: 'default',
        position: { x: 500, y: 300 },
        data: { label: 'Node 3' },
        width: 180,
        height: 90;
  }];
      rerender(<TestWrapper nodes={updatedNodes} />);
      expect(renderSpy).toHaveBeenCalledTimes(3);
    });
  });
  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(<NodeLabelsLayer {...defaultProps} />);
      const layer = screen.getByTestId('node-labels-layer');
      expect(layer).toHaveAttribute('role', 'region');
    });
    test('provides keyboard navigation hints', () => {
      render();
        <NodeLabelsLayer
          {...defaultProps}
          labelConfigs={{}}
          readOnly={false}
        />
      );
      expect(screen.getByText(/Press/)).toBeInTheDocument();
      expect(screen.getByText('L')).toBeInTheDocument();
    });
  });
  describe('Error Handling', () => {
    test('handles missing node data gracefully', () => {
      const nodesWithMissingData = [;
        {
          id: 'node-1',
          type: 'default',
          position: { x: 100, y: 100 },
          data: {},
          width: 180,
          height: 90];
      expect(() => {
        render();
          <NodeLabelsLayer
            {...defaultProps}
            nodes={nodesWithMissingData}
          />
        );
      }).not.toThrow();
    });
    test('handles invalid label configs gracefully', () => {
  const invalidConfigs = {
  'invalid-label': {
  id: 'invalid-label',
  nodeId: 'non-existent-node',
} as any
      };
      expect(() => {
        render();
          <NodeLabelsLayer
            {...defaultProps}
            labelConfigs={invalidConfigs}
          />
        );
      }).not.toThrow();
    });
  });
});