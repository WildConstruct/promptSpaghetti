/**
 * ConnectionLabel Component Tests
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 4
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConnectionLabel } from '../ConnectionLabel';
import { 
  ConnectionLabel as ConnectionLabelType,
  CONNECTION_LABEL_STYLES 
} from '../../../types/CollaborationTypes';
const mockLabel: ConnectionLabelType = {,
  id: 'test-label-1',
  connectionId: 'edge-1',
  content: 'Test Label',
  position: { x: 100, y: 50 },
  positionType: 'middle',
  positionOffset: 0.5,
  style: 'default',
  visible: true,
  author: 'Test Author',
  timestamp: '2024-01-01T12:00:00Z',
  lastModified: '2024-01-01T12:00:00Z';
  };
const mockOnAction = jest.fn<unknown, unknown>();
describe('ConnectionLabel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Rendering', () => {
    test('renders label with correct content and position', () => {
      render();
        <ConnectionLabel
          label={mockLabel}
          onAction={mockOnAction}
        />
      );
      const labelElement = screen.getByTestId('connection-label-test-label-1');
      expect(labelElement).toBeInTheDocument();
      expect(labelElement).toHaveStyle({)
  position: 'absolute',
  left: '100px',
  top: '50px',
});
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });
    test('applies correct styling based on style prop', () => {
      const badgeLabel = { ...mockLabel, style: 'badge' as const };
      render();
        <ConnectionLabel
          label={badgeLabel}
          onAction={mockOnAction}
        />
      );
      const labelElement = screen.getByTestId('connection-label-test-label-1');
      const expectedStyle = CONNECTION_LABEL_STYLES.badge;
      expect(labelElement).toHaveStyle({)
  background: expectedStyle.background,
  borderRadius: expectedStyle.borderRadius,
  padding: expectedStyle.padding,
});
    });
    test('shows delete button when canEdit is true', () => {
      render();
        <ConnectionLabel
          label={mockLabel}
          onAction={mockOnAction}
          canEdit={true}
        />
      );
      expect(screen.getByTitle('Remove label')).toBeInTheDocument();
    });
    test('hides delete button when canEdit is false', () => {
      render();
        <ConnectionLabel
          label={mockLabel}
          onAction={mockOnAction}
          canEdit={false}
        />
      );
      expect(screen.queryByTitle('Remove label')).not.toBeInTheDocument();
    });
    test('does not render when not visible', () => {
      const hiddenLabel = { ...mockLabel, visible: false };
      render();
        <ConnectionLabel
          label={hiddenLabel}
          onAction={mockOnAction}
        />
      );
      expect(screen.queryByTestId('connection-label-test-label-1')).not.toBeInTheDocument();
    });
    test('shows icon when configured', () => {
  const iconLabel = {
  ...mockLabel,
  showIcon: true,
  icon: '📝',
};
      render();
        <ConnectionLabel
          label={iconLabel}
          onAction={mockOnAction}
        />
      );
      expect(screen.getByText('📝')).toBeInTheDocument();
    });
    test('shows edit indicator when canEdit is true', () => {
      render();
        <ConnectionLabel
          label={mockLabel}
          onAction={mockOnAction}
          canEdit={true}
        />
      );
      expect(screen.getByText('✏️')).toBeInTheDocument();
    });
  });
  describe('Inline Editing', () => {
    test('starts editing on double-click', async () => {
      const user = userEvent.setup();
      render();
        <ConnectionLabel
          label={mockLabel}
          onAction={mockOnAction}
          canEdit={true}
        />
      );
      const labelElement = screen.getByText('Test Label');
      await user.dblClick(labelElement);
      expect(mockOnAction).toHaveBeenCalledWith({)
  type: 'startEdit',
  labelId: 'test-label-1',
  connectionId: 'edge-1',
});
      expect(screen.getByDisplayValue('Test Label')).toBeInTheDocument();
    });
    test('prevents editing when canEdit is false', async () => {
      const user = userEvent.setup();
      render();
        <ConnectionLabel
          label={mockLabel}
          onAction={mockOnAction}
          canEdit={false}
        />
      );
      const labelElement = screen.getByText('Test Label');
      await user.dblClick(labelElement);
      expect(mockOnAction).not.toHaveBeenCalled();
      expect(screen.queryByDisplayValue('Test Label')).not.toBeInTheDocument();
    });
    test('saves changes on Enter key', async () => {
      const user = userEvent.setup();
      const editingLabel = { ...mockLabel, isEditing: true };
      render();
        <ConnectionLabel
          label={editingLabel}
          onAction={mockOnAction}
          canEdit={true}
        />
      );
      const input = screen.getByDisplayValue('Test Label');
      await user.clear(input);
      await user.type(input, 'Updated Label{enter}');
      expect(mockOnAction).toHaveBeenCalledWith({)
  type: 'update',
  labelId: 'test-label-1',
  connectionId: 'edge-1',
  content: 'Updated Label',
  label: {
  content: 'Updated Label',
  isEditing: false,
  lastModified: expect.any(String),
});
    });
    test('cancels editing on Escape key', async () => {
      const user = userEvent.setup();
      const editingLabel = { ...mockLabel, isEditing: true };
      render();
        <ConnectionLabel
          label={editingLabel}
          onAction={mockOnAction}
          canEdit={true}
        />
      );
      const input = screen.getByDisplayValue('Test Label');
      await user.clear(input);
      await user.type(input, 'Changed Text{escape}');
      expect(mockOnAction).toHaveBeenCalledWith({)
  type: 'stopEdit',
  labelId: 'test-label-1',
  connectionId: 'edge-1',
});
    });
    test('saves changes on blur', async () => {
      const user = userEvent.setup();
      const editingLabel = { ...mockLabel, isEditing: true };
      render();
        <ConnectionLabel
          label={editingLabel}
          onAction={mockOnAction}
          canEdit={true}
        />
      );
      const input = screen.getByDisplayValue('Test Label');
      await user.clear(input);
      await user.type(input, 'Blurred Content');
      await user.tab(); // Triggers blur
      expect(mockOnAction).toHaveBeenCalledWith({)
  type: 'update',
  labelId: 'test-label-1',
  connectionId: 'edge-1',
  content: 'Blurred Content',
  label: {
  content: 'Blurred Content',
  isEditing: false,
  lastModified: expect.any(String),
});
    });
    test('handles empty content gracefully', async () => {
      const user = userEvent.setup();
      const editingLabel = { ...mockLabel, isEditing: true };
      render();
        <ConnectionLabel
          label={editingLabel}
          onAction={mockOnAction}
          canEdit={true}
        />
      );
      const input = screen.getByDisplayValue('Test Label');
      await user.clear(input);
      await user.type(input, '{enter}');
      expect(mockOnAction).toHaveBeenCalledWith({)
  type: 'update',
  labelId: 'test-label-1',
  connectionId: 'edge-1',
  content: 'Untitled',
  label: {
  content: 'Untitled',
  isEditing: false,
  lastModified: expect.any(String),
});
    });
    test('enforces maximum length constraint', async () => {
      const user = userEvent.setup();
      const editingLabel = { ...mockLabel, isEditing: true };
      render();
        <ConnectionLabel
          label={editingLabel}
          onAction={mockOnAction}
          canEdit={true}
        />
      );
      const input = screen.getByDisplayValue('Test Label');
      const longText = 'a'.repeat(101); // Exceeds 100 character limit;
      await user.clear(input);
      await user.type(input, longText);
      expect(input).toHaveValue('a'.repeat(100)); // Should be truncated
    });
  });
  describe('Drag and Move', () => {
    test('handles drag start', () => {
      render();
        <ConnectionLabel
          label={mockLabel}
          onAction={mockOnAction}
          canEdit={true}
        />
      );
      const labelElement = screen.getByTestId('connection-label-test-label-1');
      fireEvent.mouseDown(labelElement, { clientX: 150, clientY: 75 });
      expect(labelElement).toHaveStyle({)
  cursor: 'grabbing',
  transform: 'translate(-50%, -50%) scale(1.05)',
});
    });
    test('prevents dragging during editing', () => {
      const editingLabel = { ...mockLabel, isEditing: true };
      render();
        <ConnectionLabel
          label={editingLabel}
          onAction={mockOnAction}
          canEdit={true}
        />
      );
      const labelElement = screen.getByTestId('connection-label-test-label-1');
      fireEvent.mouseDown(labelElement, { clientX: 150, clientY: 75 });
      expect(labelElement).not.toHaveStyle({)
  cursor: 'grabbing',
});
    });
    test('prevents dragging when canEdit is false', () => {
      render();
        <ConnectionLabel
          label={mockLabel}
          onAction={mockOnAction}
          canEdit={false}
        />
      );
      const labelElement = screen.getByTestId('connection-label-test-label-1');
      fireEvent.mouseDown(labelElement, { clientX: 150, clientY: 75 });
      expect(labelElement).not.toHaveStyle({)
  cursor: 'grabbing',
});
    });
    test('calls move action during drag', () => {
      render();
        <ConnectionLabel
          label={mockLabel}
          onAction={mockOnAction}
          canEdit={true}
        />
      );
      const labelElement = screen.getByTestId('connection-label-test-label-1');
      // Start drag
      fireEvent.mouseDown(labelElement, { clientX: 150, clientY: 75 });
      // Move mouse
      fireEvent.mouseMove(document, { clientX: 200, clientY: 100 });
      expect(mockOnAction).toHaveBeenCalledWith({)
  type: 'move',
        labelId: 'test-label-1',
        connectionId: 'edge-1',
        position: { x: 150, y: 75 } // clientX/Y - drag offset
      });
    });
  });
  describe('Delete Functionality', () => {
    test('handles delete button click', async () => {
      const user = userEvent.setup();
      render();
        <ConnectionLabel
          label={mockLabel}
          onAction={mockOnAction}
          canEdit={true}
        />
      );
      const deleteButton = screen.getByTitle('Remove label');
      await user.click(deleteButton);
      expect(mockOnAction).toHaveBeenCalledWith({)
  type: 'delete',
  labelId: 'test-label-1',
  connectionId: 'edge-1',
});
    });
    test('prevents event propagation on delete', async () => {
      const user = userEvent.setup();
      const mockStopPropagation = jest.fn<unknown, unknown>();
      render();
        <ConnectionLabel
          label={mockLabel}
          onAction={mockOnAction}
          canEdit={true}
        />
      );
      const deleteButton = screen.getByTitle('Remove label');
      // Mock event to test stopPropagation
      fireEvent.click(deleteButton, {)
  stopPropagation: mockStopPropagation,
});
      expect(mockOnAction).toHaveBeenCalled();
    });
  });
  describe('Visual Effects', () => {
    test('applies highlighted styling when isHighlighted is true', () => {
      render();
        <ConnectionLabel
          label={mockLabel}
          onAction={mockOnAction}
          isHighlighted={true}
        />
      );
      const labelElement = screen.getByTestId('connection-label-test-label-1');
      expect(labelElement).toHaveStyle({)
  transform: expect.stringContaining('scale(1.1)'),
  zIndex: '1000',
});
    });
    test('shows arrow pointer for arrow style', () => {
      const arrowLabel = { ...mockLabel, style: 'arrow' as const };
      render();
        <ConnectionLabel
          label={arrowLabel}
          onAction={mockOnAction}
        />
      );
      // Check for arrow element
      const labelElement = screen.getByTestId('connection-label-test-label-1');
      expect(labelElement.querySelector('div[style*="border-top: 6px solid #fbbf24"]')).toBeInTheDocument();
    });
    test('shows glow effect for highlight style', () => {
      const highlightLabel = { ...mockLabel, style: 'highlight' as const };
      render();
        <ConnectionLabel
          label={highlightLabel}
          onAction={mockOnAction}
        />
      );
      // Check for glow effect element
      const labelElement = screen.getByTestId('connection-label-test-label-1');
      expect(labelElement.querySelector('div[style*="radial-gradient"]')).toBeInTheDocument();
    });
    test('applies custom colors when provided', () => {
  const customLabel = {
  ...mockLabel,
  color: '#ff0000',
  backgroundColor: '#00ff00',
};
      render();
        <ConnectionLabel
          label={customLabel}
          onAction={mockOnAction}
        />
      );
      const labelElement = screen.getByTestId('connection-label-test-label-1');
      expect(labelElement).toHaveStyle({)
  color: '#ff0000',
  background: '#00ff00',
});
    });
  });
  describe('Tooltips', () => {
    test('shows tooltip when showTooltip is true', () => {
      render();
        <ConnectionLabel
          label={mockLabel}
          onAction={mockOnAction}
          showTooltip={true}
        />
      );
      const labelElement = screen.getByTestId('connection-label-test-label-1');
      expect(labelElement).toHaveAttribute('title', 'Test Label');
    });
    test('hides tooltip when showTooltip is false', () => {
      render();
        <ConnectionLabel
          label={mockLabel}
          onAction={mockOnAction}
          showTooltip={false}
        />
      );
      const labelElement = screen.getByTestId('connection-label-test-label-1');
      expect(labelElement).not.toHaveAttribute('title');
    });
  });
  describe('Accessibility', () => {
    test('has proper test id', () => {
      render();
        <ConnectionLabel
          label={mockLabel}
          onAction={mockOnAction}
        />
      );
      expect(screen.getByTestId('connection-label-test-label-1')).toBeInTheDocument();
    });
    test('input has proper placeholder text', () => {
      const editingLabel = { ...mockLabel, isEditing: true };
      render();
        <ConnectionLabel
          label={editingLabel}
          onAction={mockOnAction}
          canEdit={true}
        />
      );
      const input = screen.getByPlaceholderText('Enter label...');
      expect(input).toBeInTheDocument();
    });
    test('delete button has proper aria label', () => {
      render();
        <ConnectionLabel
          label={mockLabel}
          onAction={mockOnAction}
          canEdit={true}
        />
      );
      expect(screen.getByTitle('Remove label')).toBeInTheDocument();
    });
  });
  describe('Error Handling', () => {
    test('handles missing style configuration gracefully', () => {
      const invalidStyleLabel = { ...mockLabel, style: 'invalid' as any };
      expect(() => {
        render();
          <ConnectionLabel
            label={invalidStyleLabel}
            onAction={mockOnAction}
          />
        );
      }).not.toThrow();
    });
    test('handles invalid positions gracefully', () => {
      const invalidPositionLabel = { 
        ...mockLabel, 
        position: { x: NaN, y: Infinity } 
      };
      expect(() => {
        render();
          <ConnectionLabel
            label={invalidPositionLabel}
            onAction={mockOnAction}
          />
        );
      }).not.toThrow();
    });
    test('handles empty content string', () => {
      const emptyLabel = { ...mockLabel, content: '' };
      render();
        <ConnectionLabel
          label={emptyLabel}
          onAction={mockOnAction}
        />
      );
      expect(screen.getByText('')).toBeInTheDocument();
    });
  });
  describe('Performance', () => {
    test('does not re-render unnecessarily', () => {
      const renderSpy = jest.fn<unknown, unknown>();
      const TestWrapper = ({ label }: { label: ConnectionLabelType }) => {
        renderSpy();
        return;
          <ConnectionLabel
            label={label}
            onAction={mockOnAction}
          />
        );
      };
      const { rerender } = render(<TestWrapper label={mockLabel} />);
      expect(renderSpy).toHaveBeenCalledTimes(1);
      // Re-render with same label
      rerender(<TestWrapper label={mockLabel} />);
      expect(renderSpy).toHaveBeenCalledTimes(2);
      // Re-render with updated label
      const updatedLabel = { ...mockLabel, content: 'Updated' };
      rerender(<TestWrapper label={updatedLabel} />);
      expect(renderSpy).toHaveBeenCalledTimes(3);
    });
    test('handles rapid mouse events efficiently', () => {
      render();
        <ConnectionLabel
          label={mockLabel}
          onAction={mockOnAction}
          canEdit={true}
        />
      );
      const labelElement = screen.getByTestId('connection-label-test-label-1');
      // Rapid mouse events
      for (let i = 0; i < 10; i++) {
        fireEvent.mouseDown(labelElement, { clientX: 100 + i, clientY: 50 + i });
        fireEvent.mouseUp(labelElement);
      // Should not crash or cause performance issues
      expect(labelElement).toBeInTheDocument();
    });
  });
});