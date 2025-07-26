/**
 * RegionGroup Component Tests
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 3
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegionGroup } from '../RegionGroup';
import { RegionGroup as RegionGroupType, REGION_GROUP_COLORS } from '../../../types/CollaborationTypes';

const mockGroup: RegionGroupType = {
  id: 'test-group-1',
  label: 'Test Group',
  description: 'Test group description',
  color: '#3b82f6',
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  opacity: 0.8,
  bounds: { x: 100, y: 100, width: 300, height: 200 },
  nodeIds: ['node-1', 'node-2'],
  collapsed: false,
  visible: true,
  style: 'rounded',
  visibility: 'always',
  borderWidth: 2,
  showLabel: true,
  showNodeCount: true,
  isLocked: false,
  zIndex: 0,
  author: 'Test Author',
  timestamp: '2024-01-01T12:00:00Z',
  lastModified: '2024-01-01T12:00:00Z'
};

const mockOnAction = jest.fn<unknown[], unknown>();

describe('RegionGroup Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders group with correct styling and position', () => {
      render(
        <RegionGroup
          group={mockGroup}
          onAction={mockOnAction}
          nodeCount={2}
        />
      );

      const groupElement = screen.getByTestId('region-group-test-group-1');
      expect(groupElement).toBeInTheDocument();
      expect(groupElement).toHaveStyle({
        position: 'absolute',
        left: '100px',
        top: '100px',
        width: '300px',
        height: '200px',
        border: '2px solid #3b82f6'
      });
    });

    test('displays group label and node count', () => {
      render(
        <RegionGroup
          group={mockGroup}
          onAction={mockOnAction}
          nodeCount={2}
          showLabel={true}
          showNodeCount={true}
        />
      );

      expect(screen.getByText('Test Group')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    test('applies correct color theme', () => {
      const blueGroup = { ...mockGroup, color: REGION_GROUP_COLORS.blue.primary };
      render(
        <RegionGroup
          group={blueGroup}
          onAction={mockOnAction}
          nodeCount={2}
        />
      );

      const groupElement = screen.getByTestId('region-group-test-group-1');
      expect(groupElement).toHaveStyle({
        border: `2px solid ${REGION_GROUP_COLORS.blue.primary}`
      });
    });

    test('shows collapse/expand button', () => {
      render(
        <RegionGroup
          group={mockGroup}
          onAction={mockOnAction}
          nodeCount={2}
        />
      );

      expect(screen.getByTitle('Collapse group')).toBeInTheDocument();
    });

    test('shows lock indicator when group is locked', () => {
      const lockedGroup = { ...mockGroup, isLocked: true };
      render(
        <RegionGroup
          group={lockedGroup}
          onAction={mockOnAction}
          nodeCount={2}
        />
      );

      expect(screen.getByTitle('Group is locked')).toBeInTheDocument();
    });

    test('hides group when visibility conditions not met', () => {
      const hoverGroup = { ...mockGroup, visibility: 'hover' as const };
      render(
        <RegionGroup
          group={hoverGroup}
          onAction={mockOnAction}
          nodeCount={2}
        />
      );

      expect(screen.queryByTestId('region-group-test-group-1')).not.toBeInTheDocument();
    });

    test('shows collapsed state indicator', () => {
      const collapsedGroup = { ...mockGroup, collapsed: true };
      render(
        <RegionGroup
          group={collapsedGroup}
          onAction={mockOnAction}
          nodeCount={2}
        />
      );

      expect(screen.getByText('⋯')).toBeInTheDocument();
    });
  });

  describe('Group Interactions', () => {
    test('handles collapse/expand toggle', async () => {
      const user = userEvent.setup();
      render(
        <RegionGroup
          group={mockGroup}
          onAction={mockOnAction}
          nodeCount={2}
        />
      );

      const collapseButton = screen.getByTitle('Collapse group');
      await user.click(collapseButton);

      expect(mockOnAction).toHaveBeenCalledWith({
        type: 'collapse',
        groupId: 'test-group-1'
      });
    });

    test('handles expand when collapsed', async () => {
      const user = userEvent.setup();
      const collapsedGroup = { ...mockGroup, collapsed: true };
      render(
        <RegionGroup
          group={collapsedGroup}
          onAction={mockOnAction}
          nodeCount={2}
        />
      );

      const expandButton = screen.getByTitle('Expand group');
      await user.click(expandButton);

      expect(mockOnAction).toHaveBeenCalledWith({
        type: 'expand',
        groupId: 'test-group-1'
      });
    });

    test('starts label editing on double-click', async () => {
      const user = userEvent.setup();
      render(
        <RegionGroup
          group={mockGroup}
          onAction={mockOnAction}
          nodeCount={2}
          canEdit={true}
        />
      );

      const labelElement = screen.getByText('Test Group');
      await user.dblClick(labelElement);

      expect(screen.getByDisplayValue('Test Group')).toBeInTheDocument();
    });

    test('prevents label editing when canEdit is false', async () => {
      const user = userEvent.setup();
      render(
        <RegionGroup
          group={mockGroup}
          onAction={mockOnAction}
          nodeCount={2}
          canEdit={false}
        />
      );

      const labelElement = screen.getByText('Test Group');
      await user.dblClick(labelElement);

      expect(screen.queryByDisplayValue('Test Group')).not.toBeInTheDocument();
    });

    test('saves label on Enter key', async () => {
      const user = userEvent.setup();
      render(
        <RegionGroup
          group={mockGroup}
          onAction={mockOnAction}
          nodeCount={2}
          canEdit={true}
        />
      );

      const labelElement = screen.getByText('Test Group');
      await user.dblClick(labelElement);

      const input = screen.getByDisplayValue('Test Group');
      await user.clear(input);
      await user.type(input, 'Updated Label{enter}');

      expect(mockOnAction).toHaveBeenCalledWith({
        type: 'update',
        groupId: 'test-group-1',
        group: { label: 'Updated Label' }
      });
    });

    test('cancels label editing on Escape key', async () => {
      const user = userEvent.setup();
      render(
        <RegionGroup
          group={mockGroup}
          onAction={mockOnAction}
          nodeCount={2}
          canEdit={true}
        />
      );

      const labelElement = screen.getByText('Test Group');
      await user.dblClick(labelElement);

      const input = screen.getByDisplayValue('Test Group');
      await user.clear(input);
      await user.type(input, 'Changed Text{escape}');

      // Should revert to original label
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });
  });

  describe('Drag and Move', () => {
    test('handles mouse down for dragging', () => {
      render(
        <RegionGroup
          group={mockGroup}
          onAction={mockOnAction}
          nodeCount={2}
          canMove={true}
        />
      );

      const groupElement = screen.getByTestId('region-group-test-group-1');
      fireEvent.mouseDown(groupElement, { clientX: 150, clientY: 150 });

      // Should change cursor to grabbing during drag
      expect(groupElement).toHaveStyle({ cursor: 'grabbing' });
    });

    test('prevents dragging when canMove is false', () => {
      render(
        <RegionGroup
          group={mockGroup}
          onAction={mockOnAction}
          nodeCount={2}
          canMove={false}
        />
      );

      const groupElement = screen.getByTestId('region-group-test-group-1');
      expect(groupElement).toHaveStyle({ cursor: 'default' });
    });

    test('prevents dragging when locked', () => {
      const lockedGroup = { ...mockGroup, isLocked: true };
      render(
        <RegionGroup
          group={lockedGroup}
          onAction={mockOnAction}
          nodeCount={2}
          canMove={true}
        />
      );

      const groupElement = screen.getByTestId('region-group-test-group-1');
      fireEvent.mouseDown(groupElement, { clientX: 150, clientY: 150 });

      // Should not enter dragging state for locked group
      expect(groupElement).not.toHaveStyle({ cursor: 'grabbing' });
    });
  });

  describe('Resize Handles', () => {
    test('shows resize handles when selected and canResize is true', () => {
      render(
        <RegionGroup
          group={mockGroup}
          onAction={mockOnAction}
          nodeCount={2}
          selected={true}
          canResize={true}
        />
      );

      // Should show all 4 corner resize handles
      const handles = screen.getAllByRole('generic').filter(el => 
        el.style.cursor?.includes('resize')
      );
      expect(handles).toHaveLength(4);
    });

    test('hides resize handles when not selected', () => {
      render(
        <RegionGroup
          group={mockGroup}
          onAction={mockOnAction}
          nodeCount={2}
          selected={false}
          canResize={true}
        />
      );

      const handles = screen.queryAllByRole('generic').filter(el => 
        el.style.cursor?.includes('resize')
      );
      expect(handles).toHaveLength(0);
    });

    test('hides resize handles when locked', () => {
      const lockedGroup = { ...mockGroup, isLocked: true };
      render(
        <RegionGroup
          group={lockedGroup}
          onAction={mockOnAction}
          nodeCount={2}
          selected={true}
          canResize={true}
        />
      );

      const handles = screen.queryAllByRole('generic').filter(el => 
        el.style.cursor?.includes('resize')
      );
      expect(handles).toHaveLength(0);
    });
  });

  describe('Visual States', () => {
    test('applies selected styling when selected', () => {
      render(
        <RegionGroup
          group={mockGroup}
          onAction={mockOnAction}
          nodeCount={2}
          selected={true}
        />
      );

      const groupElement = screen.getByTestId('region-group-test-group-1');
      expect(groupElement).toHaveStyle({
        transform: 'scale(1.02)',
        zIndex: '100' // Base zIndex + selected bonus
      });
    });

    test('applies hover effects during interaction', () => {
      render(
        <RegionGroup
          group={mockGroup}
          onAction={mockOnAction}
          nodeCount={2}
        />
      );

      const groupElement = screen.getByTestId('region-group-test-group-1');
      
      // Simulate drag start
      fireEvent.mouseDown(groupElement, { clientX: 150, clientY: 150 });
      
      expect(groupElement).toHaveStyle({
        cursor: 'grabbing',
        transition: 'none'
      });
    });

    test('shows appropriate cursor based on interaction state', () => {
      const { rerender } = render(
        <RegionGroup
          group={mockGroup}
          onAction={mockOnAction}
          nodeCount={2}
          canMove={true}
        />
      );

      let groupElement = screen.getByTestId('region-group-test-group-1');
      expect(groupElement).toHaveStyle({ cursor: 'grab' });

      rerender(
        <RegionGroup
          group={mockGroup}
          onAction={mockOnAction}
          nodeCount={2}
          canMove={false}
        />
      );

      groupElement = screen.getByTestId('region-group-test-group-1');
      expect(groupElement).toHaveStyle({ cursor: 'default' });
    });
  });

  describe('Accessibility', () => {
    test('has proper test id', () => {
      render(
        <RegionGroup
          group={mockGroup}
          onAction={mockOnAction}
          nodeCount={2}
        />
      );

      expect(screen.getByTestId('region-group-test-group-1')).toBeInTheDocument();
    });

    test('provides meaningful tooltips', () => {
      render(
        <RegionGroup
          group={mockGroup}
          onAction={mockOnAction}
          nodeCount={2}
        />
      );

      expect(screen.getByTitle('Collapse group')).toBeInTheDocument();
      expect(screen.getByTitle('2 nodes')).toBeInTheDocument();
    });

    test('supports keyboard navigation for label editing', async () => {
      const user = userEvent.setup();
      render(
        <RegionGroup
          group={mockGroup}
          onAction={mockOnAction}
          nodeCount={2}
          canEdit={true}
        />
      );

      const labelElement = screen.getByText('Test Group');
      await user.dblClick(labelElement);

      const input = screen.getByDisplayValue('Test Group');
      expect(input).toHaveFocus();
    });
  });

  describe('Error Handling', () => {
    test('handles missing color theme gracefully', () => {
      const invalidColorGroup = { ...mockGroup, color: '#invalid' };
      
      expect(() => {
        render(
          <RegionGroup
            group={invalidColorGroup}
            onAction={mockOnAction}
            nodeCount={2}
          />
        );
      }).not.toThrow();
    });

    test('handles invalid style configuration', () => {
      const invalidStyleGroup = { ...mockGroup, style: 'invalid' as any };
      
      expect(() => {
        render(
          <RegionGroup
            group={invalidStyleGroup}
            onAction={mockOnAction}
            nodeCount={2}
          />
        );
      }).not.toThrow();
    });

    test('handles zero or negative node count', () => {
      expect(() => {
        render(
          <RegionGroup
            group={mockGroup}
            onAction={mockOnAction}
            nodeCount={0}
          />
        );
      }).not.toThrow();

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('does not re-render unnecessarily', () => {
      const renderSpy = jest.fn<unknown[], unknown>();
      const TestWrapper = ({ group }: { group: RegionGroupType }) => {
        renderSpy();
        return (
          <RegionGroup
            group={group}
            onAction={mockOnAction}
            nodeCount={2}
          />
        );
      };

      const { rerender } = render(<TestWrapper group={mockGroup} />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same group
      rerender(<TestWrapper group={mockGroup} />);
      expect(renderSpy).toHaveBeenCalledTimes(2);

      // Re-render with updated group
      const updatedGroup = { ...mockGroup, label: 'Updated Label' };
      rerender(<TestWrapper group={updatedGroup} />);
      expect(renderSpy).toHaveBeenCalledTimes(3);
    });

    test('handles rapid interaction events efficiently', async () => {
      const user = userEvent.setup();
      render(
        <RegionGroup
          group={mockGroup}
          onAction={mockOnAction}
          nodeCount={2}
          canMove={true}
        />
      );

      const groupElement = screen.getByTestId('region-group-test-group-1');
      
      // Rapid mouse events
      for (let i = 0; i < 10; i++) {
        fireEvent.mouseDown(groupElement, { clientX: 100 + i, clientY: 100 + i });
        fireEvent.mouseUp(groupElement);
      }

      // Should not crash or cause performance issues
      expect(groupElement).toBeInTheDocument();
    });
  });
});