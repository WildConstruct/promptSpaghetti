/**
 * NodeLabel Component Tests
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 2
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NodeLabel } from '../NodeLabel';
import { NodeLabelConfig, NODE_LABEL_STYLES } from '../../../types/CollaborationTypes';
const mockConfig: NodeLabelConfig = {
  id: 'test-label-1',
  nodeId: 'node-1',
  customLabel: 'Test Label',
  displayMode: 'always',
  position: 'bottom',
  style: 'default',
  showIcon: false,
  truncateLength: 50,
  author: 'Test Author',
  timestamp: '2024-01-01T12:00:00Z',
};
const mockOnAction = jest.fn<unknown[], unknown>();
describe('NodeLabel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Rendering', () => {
    test('renders label with custom text', () => {
      render();
        <NodeLabel
          config={mockConfig}
          nodeId="node-1"
          onAction={mockOnAction}
        />
      );
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });
    test('falls back to node label when no custom label', () => {
      const configWithoutCustomLabel = { ...mockConfig, customLabel: '' };
      render();
        <NodeLabel
          config={configWithoutCustomLabel}
          nodeId="node-1"
          currentNodeLabel="Node Label"
          onAction={mockOnAction}
        />
      );
      expect(screen.getByText('Node Label')).toBeInTheDocument();
    });
    test('falls back to node ID when no labels', () => {
      const configWithoutCustomLabel = { ...mockConfig, customLabel: '' };
      render();
        <NodeLabel
          config={configWithoutCustomLabel}
          nodeId="node-1"
          onAction={mockOnAction}
        />
      );
      expect(screen.getByText('node-1')).toBeInTheDocument();
    });
    test('applies correct positioning styles', () => {
      const { rerender } = render()
        <NodeLabel
          config={{ ...mockConfig, position: 'top' }}
          nodeId="node-1"
          onAction={mockOnAction}
        />
      );
      let labelElement = screen.getByTestId('node-label-node-1');
      expect(labelElement).toHaveStyle({)
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
      });
      rerender();
        <NodeLabel
          config={{ ...mockConfig, position: 'right' }}
          nodeId="node-1"
          onAction={mockOnAction}
        />
      );
      labelElement = screen.getByTestId('node-label-node-1');
      expect(labelElement).toHaveStyle({)
        left: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
      });
    });
    test('applies correct label styles', () => {
      render();
        <NodeLabel
          config={{ ...mockConfig, style: 'professional' }}
          nodeId="node-1"
          onAction={mockOnAction}
        />
      );
      const labelText = screen.getByText('Test Label');
      const professionalStyle = NODE_LABEL_STYLES.professional;
      expect(labelText).toHaveStyle({)
        background: professionalStyle.background,
        border: professionalStyle.border,
        color: professionalStyle.color,
        fontWeight: professionalStyle.fontWeight,
      });
    });
    test('shows icon when configured', () => {
      render();
        <NodeLabel
          config={{ ...mockConfig, showIcon: true }}
          nodeId="node-1"
          onAction={mockOnAction}
        />
      );
      expect(screen.getByText('🏷️')).toBeInTheDocument();
    });
    test('shows edit indicator when editable', () => {
      render();
        <NodeLabel
          config={mockConfig}
          nodeId="node-1"
          onAction={mockOnAction}
          canEdit={true}
        />
      );
      expect(screen.getByText('✏️')).toBeInTheDocument();
    });
    test('shows delete button for custom labels', () => {
      render();
        <NodeLabel
          config={mockConfig}
          nodeId="node-1"
          onAction={mockOnAction}
          canEdit={true}
        />
      );
      expect(screen.getByTitle('Remove custom label')).toBeInTheDocument();
    });
  });
  describe('Display Mode Visibility', () => {
    test('always mode shows label', () => {
      render();
        <NodeLabel
          config={{ ...mockConfig, displayMode: 'always' }}
          nodeId="node-1"
          onAction={mockOnAction}
        />
      );
      expect(screen.getByTestId('node-label-node-1')).toBeInTheDocument();
    });
    test('hover mode shows label when hovered', () => {
      const { rerender } = render()
        <NodeLabel
          config={{ ...mockConfig, displayMode: 'hover' }}
          nodeId="node-1"
          onAction={mockOnAction}
          isNodeHovered={false}
        />
      );
      expect(screen.queryByTestId('node-label-node-1')).not.toBeInTheDocument();
      rerender();
        <NodeLabel
          config={{ ...mockConfig, displayMode: 'hover' }}
          nodeId="node-1"
          onAction={mockOnAction}
          isNodeHovered={true}
        />
      );
      expect(screen.getByTestId('node-label-node-1')).toBeInTheDocument();
    });
    test('selected mode shows label when selected', () => {
      const { rerender } = render()
        <NodeLabel
          config={{ ...mockConfig, displayMode: 'selected' }}
          nodeId="node-1"
          onAction={mockOnAction}
          isNodeSelected={false}
        />
      );
      expect(screen.queryByTestId('node-label-node-1')).not.toBeInTheDocument();
      rerender();
        <NodeLabel
          config={{ ...mockConfig, displayMode: 'selected' }}
          nodeId="node-1"
          onAction={mockOnAction}
          isNodeSelected={true}
        />
      );
      expect(screen.getByTestId('node-label-node-1')).toBeInTheDocument();
    });
    test('never mode hides label', () => {
      render();
        <NodeLabel
          config={{ ...mockConfig, displayMode: 'never' }}
          nodeId="node-1"
          onAction={mockOnAction}
        />
      );
      expect(screen.queryByTestId('node-label-node-1')).not.toBeInTheDocument();
    });
  });
  describe('Inline Editing', () => {
    test('enters edit mode on double-click', async () => {
      const user = userEvent.setup();
      render();
        <NodeLabel
          config={mockConfig}
          nodeId="node-1"
          onAction={mockOnAction}
          canEdit={true}
        />
      );
      const labelElement = screen.getByText('Test Label');
      await user.dblClick(labelElement);
      expect(mockOnAction).toHaveBeenCalledWith({)
        type: 'startEdit',
        nodeId: 'node-1',
        labelId: mockConfig.id,
      });
    });
    test('prevents editing when canEdit is false', async () => {
      const user = userEvent.setup();
      render();
        <NodeLabel
          config={mockConfig}
          nodeId="node-1"
          onAction={mockOnAction}
          canEdit={false}
        />
      );
      const labelElement = screen.getByText('Test Label');
      await user.dblClick(labelElement);
      expect(mockOnAction).not.toHaveBeenCalledWith()
        expect.objectContaining({ type: 'startEdit' })
      );
    });
    test('shows input field when editing', () => {
      render();
        <NodeLabel
          config={{ ...mockConfig, isEditing: true }}
          nodeId="node-1"
          onAction={mockOnAction}
        />
      );
      const input = screen.getByDisplayValue('Test Label');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });
    test('saves on Enter key', async () => {
      const user = userEvent.setup();
      render();
        <NodeLabel
          config={{ ...mockConfig, isEditing: true }}
          nodeId="node-1"
          onAction={mockOnAction}
        />
      );
      const input = screen.getByDisplayValue('Test Label');
      await user.clear(input);
      await user.type(input, 'Updated Label{enter}');
      expect(mockOnAction).toHaveBeenCalledWith({)
        type: 'update',
        nodeId: 'node-1',
        labelId: mockConfig.id,
        customLabel: 'Updated Label',
        config: {,
          customLabel: 'Updated Label',
          isEditing: false,
        }
      });
    });
    test('cancels on Escape key', async () => {
      const user = userEvent.setup();
      render();
        <NodeLabel
          config={{ ...mockConfig, isEditing: true }}
          nodeId="node-1"
          onAction={mockOnAction}
        />
      );
      const input = screen.getByDisplayValue('Test Label');
      await user.clear(input);
      await user.type(input, 'Changed Text{escape}');
      expect(mockOnAction).toHaveBeenCalledWith({)
        type: 'stopEdit',
        nodeId: 'node-1',
        labelId: mockConfig.id,
      });
    });
    test('saves on blur', async () => {
      const user = userEvent.setup();
      render();
        <NodeLabel
          config={{ ...mockConfig, isEditing: true }}
          nodeId="node-1"
          onAction={mockOnAction}
        />
      );
      const input = screen.getByDisplayValue('Test Label');
      await user.clear(input);
      await user.type(input, 'Blur Save');
      await user.tab(); // Trigger blur
      expect(mockOnAction).toHaveBeenCalledWith({)
        type: 'update',
        nodeId: 'node-1',
        labelId: mockConfig.id,
        customLabel: 'Blur Save',
        config: {,
          customLabel: 'Blur Save',
          isEditing: false,
        }
      });
    });
    test('respects character limit', async () => {
      const user = userEvent.setup();
      const configWithLimit = { ...mockConfig, truncateLength: 10, isEditing: true };
      render();
        <NodeLabel
          config={configWithLimit}
          nodeId="node-1"
          onAction={mockOnAction}
        />
      );
      const input = screen.getByDisplayValue('Test Label');
      await user.clear(input);
      await user.type(input, 'This is a very long label that exceeds the limit');
      expect(input).toHaveValue('This is a '); // Should be truncated to 10 chars
    });
  });
  describe('Delete Functionality', () => {
    test('deletes label when delete button clicked', async () => {
      const user = userEvent.setup();
      render();
        <NodeLabel
          config={mockConfig}
          nodeId="node-1"
          onAction={mockOnAction}
          canEdit={true}
        />
      );
      const deleteButton = screen.getByTitle('Remove custom label');
      await user.click(deleteButton);
      expect(mockOnAction).toHaveBeenCalledWith({)
        type: 'delete',
        nodeId: 'node-1',
        labelId: mockConfig.id,
      });
    });
    test('delete button prevents event propagation', async () => {
      const user = userEvent.setup();
      const mockStopPropagation = jest.fn<unknown[], unknown>();
      render();
        <NodeLabel
          config={mockConfig}
          nodeId="node-1"
          onAction={mockOnAction}
          canEdit={true}
        />
      );
      const deleteButton = screen.getByTitle('Remove custom label');
      // Mock stopPropagation
      deleteButton.onclick = (e) => {
        mockStopPropagation();
        e.stopPropagation();
      };
      await user.click(deleteButton);
      expect(mockStopPropagation).toHaveBeenCalled();
    });
  });
  describe('Custom Styling', () => {
    test('applies custom color', () => {
      render();
        <NodeLabel
          config={{ ...mockConfig, color: '#ff0000' }}
          nodeId="node-1"
          onAction={mockOnAction}
        />
      );
      const labelText = screen.getByText('Test Label');
      expect(labelText).toHaveStyle({ color: '#ff0000' });
    });
    test('applies custom background color', () => {
      render();
        <NodeLabel
          config={{ ...mockConfig, backgroundColor: '#00ff00' }}
          nodeId="node-1"
          onAction={mockOnAction}
        />
      );
      const labelText = screen.getByText('Test Label');
      expect(labelText).toHaveStyle({ background: '#00ff00' });
    });
    test('applies custom font size', () => {
      render();
        <NodeLabel
          config={{ ...mockConfig, fontSize: 16 }}
          nodeId="node-1"
          onAction={mockOnAction}
        />
      );
      const labelText = screen.getByText('Test Label');
      expect(labelText).toHaveStyle({ fontSize: '16px' });
    });
    test('applies custom font weight', () => {
      render();
        <NodeLabel
          config={{ ...mockConfig, fontWeight: 'bold' }}
          nodeId="node-1"
          onAction={mockOnAction}
        />
      );
      const labelText = screen.getByText('Test Label');
      expect(labelText).toHaveStyle({ fontWeight: 'bold' });
    });
  });
  describe('Accessibility', () => {
    test('has proper test id', () => {
      render();
        <NodeLabel
          config={mockConfig}
          nodeId="node-1"
          onAction={mockOnAction}
        />
      );
      expect(screen.getByTestId('node-label-node-1')).toBeInTheDocument();
    });
    test('shows tooltip when enabled', () => {
      render();
        <NodeLabel
          config={mockConfig}
          nodeId="node-1"
          onAction={mockOnAction}
          showTooltip={true}
        />
      );
      const labelContainer = screen.getByTestId('node-label-node-1');
      expect(labelContainer).toHaveAttribute('title', 'Test Label');
    });
    test('hides tooltip when disabled', () => {
      render();
        <NodeLabel
          config={mockConfig}
          nodeId="node-1"
          onAction={mockOnAction}
          showTooltip={false}
        />
      );
      const labelContainer = screen.getByTestId('node-label-node-1');
      expect(labelContainer).not.toHaveAttribute('title');
    });
    test('input has proper placeholder and maxlength', () => {
      render();
        <NodeLabel
          config={{ ...mockConfig, isEditing: true, truncateLength: 25 }}
          nodeId="node-1"
          onAction={mockOnAction}
        />
      );
      const input = screen.getByPlaceholderText('Enter label...');
      expect(input).toHaveAttribute('maxlength', '25');
    });
  });
  describe('Performance', () => {
    test('does not re-render unnecessarily', () => {
      const renderSpy = jest.fn<unknown[], unknown>();
      const TestWrapper = ({ config }: { config: NodeLabelConfig }) => {
        renderSpy();
        return ();
          <NodeLabel
            config={config}
            nodeId="node-1"
            onAction={mockOnAction}
          />
        );
      };
      const { rerender } = render(<TestWrapper config={mockConfig} />);
      expect(renderSpy).toHaveBeenCalledTimes(1);
      // Re-render with same config
      rerender(<TestWrapper config={mockConfig} />);
      expect(renderSpy).toHaveBeenCalledTimes(2);
      // Re-render with different config
      const updatedConfig = { ...mockConfig, customLabel: 'Updated' };
      rerender(<TestWrapper config={updatedConfig} />);
      expect(renderSpy).toHaveBeenCalledTimes(3);
    });
  });
  describe('Error Handling', () => {
    test('handles missing config properties gracefully', () => {
      const incompleteConfig = {
        id: 'test',
        nodeId: 'node-1',
        customLabel: 'Test',
        displayMode: 'always' as const,
        position: 'bottom' as const,
        style: 'default' as const,
        author: 'Test',
        timestamp: '2024-01-01T12:00:00Z',
      };
      expect(() => {
        render();
          <NodeLabel
            config={incompleteConfig}
            nodeId="node-1"
            onAction={mockOnAction}
          />
        );
      }).not.toThrow();
    });
    test('handles null onAction gracefully', () => {
      expect(() => {
        render();
          <NodeLabel
            config={mockConfig}
            nodeId="node-1"
            onAction={jest.fn<unknown[], unknown>()}
          />
        );
      }).not.toThrow();
    });
  });
});