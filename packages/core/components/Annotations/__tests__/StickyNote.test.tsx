/**
 * StickyNote Component Tests
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 1
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StickyNote } from '../StickyNote';
import { StickyNote as StickyNoteType, StickyNoteAction } from '../../../types/CollaborationTypes';

const mockNote: StickyNoteType = {
  id: 'test-note-1',
  position: { x: 100, y: 100 },
  content: 'Test sticky note content',
  color: 'yellow',
  size: { width: 200, height: 150 },
  author: 'Test Author',
  timestamp: '2024-01-01T12:00:00Z',
  isEditing: false,
  zIndex: 1
};

const mockOnAction = jest.fn<unknown[], unknown>();
const mockOnContextMenu = jest.fn<unknown[], unknown>();

describe('StickyNote Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders note with correct content and styling', () => {
      render(
        <StickyNote
          note={mockNote}
          onAction={mockOnAction}
          onContextMenu={mockOnContextMenu}
        />
      );

      expect(screen.getByText('Test sticky note content')).toBeInTheDocument();
      expect(screen.getByTestId('sticky-note')).toHaveStyle({
        backgroundColor: '#fef3c7',
        border: '2px solid #f59e0b'
      });
    });

    test('applies correct positioning and sizing', () => {
      render(
        <StickyNote
          note={mockNote}
          onAction={mockOnAction}
          onContextMenu={mockOnContextMenu}
        />
      );

      const noteElement = screen.getByTestId('sticky-note');
      expect(noteElement).toHaveStyle({
        left: '100px',
        top: '100px',
        width: '200px',
        height: '150px'
      });
    });

    test('shows selected state when selected prop is true', () => {
      render(
        <StickyNote
          note={mockNote}
          onAction={mockOnAction}
          onContextMenu={mockOnContextMenu}
          selected={true}
        />
      );

      const noteElement = screen.getByTestId('sticky-note');
      expect(noteElement).toHaveClass('selected');
    });

    test('renders in editing mode when isEditing is true', () => {
      const editingNote = { ...mockNote, isEditing: true };
      render(
        <StickyNote
          note={editingNote}
          onAction={mockOnAction}
          onContextMenu={mockOnContextMenu}
        />
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test sticky note content')).toBeInTheDocument();
    });
  });

  describe('Drag and Drop', () => {
    test('handles drag start correctly', () => {
      render(
        <StickyNote
          note={mockNote}
          onAction={mockOnAction}
          onContextMenu={mockOnContextMenu}
          canMove={true}
        />
      );

      const noteElement = screen.getByTestId('sticky-note');
      fireEvent.mouseDown(noteElement, { clientX: 150, clientY: 150 });

      expect(noteElement).toHaveClass('dragging');
    });

    test('prevents drag when canMove is false', () => {
      render(
        <StickyNote
          note={mockNote}
          onAction={mockOnAction}
          onContextMenu={mockOnContextMenu}
          canMove={false}
        />
      );

      const noteElement = screen.getByTestId('sticky-note');
      fireEvent.mouseDown(noteElement, { clientX: 150, clientY: 150 });

      expect(noteElement).not.toHaveClass('dragging');
    });

    test('calls onAction with move action during drag', () => {
      render(
        <StickyNote
          note={mockNote}
          onAction={mockOnAction}
          onContextMenu={mockOnContextMenu}
          canMove={true}
        />
      );

      const noteElement = screen.getByTestId('sticky-note');
      
      // Start drag
      fireEvent.mouseDown(noteElement, { clientX: 150, clientY: 150 });
      
      // Move mouse
      fireEvent.mouseMove(document, { clientX: 200, clientY: 200 });
      
      // End drag
      fireEvent.mouseUp(document);

      expect(mockOnAction).toHaveBeenCalledWith({
        type: 'move',
        noteId: mockNote.id,
        position: { x: 150, y: 150 }
      });
    });
  });

  describe('Resizing', () => {
    test('shows resize handles when canResize is true', () => {
      render(
        <StickyNote
          note={mockNote}
          onAction={mockOnAction}
          onContextMenu={mockOnContextMenu}
          canResize={true}
        />
      );

      expect(screen.getByTestId('resize-handle-se')).toBeInTheDocument();
    });

    test('hides resize handles when canResize is false', () => {
      render(
        <StickyNote
          note={mockNote}
          onAction={mockOnAction}
          onContextMenu={mockOnContextMenu}
          canResize={false}
        />
      );

      expect(screen.queryByTestId('resize-handle-se')).not.toBeInTheDocument();
    });

    test('handles resize correctly', () => {
      render(
        <StickyNote
          note={mockNote}
          onAction={mockOnAction}
          onContextMenu={mockOnContextMenu}
          canResize={true}
        />
      );

      const resizeHandle = screen.getByTestId('resize-handle-se');
      
      // Start resize
      fireEvent.mouseDown(resizeHandle, { clientX: 300, clientY: 250 });
      
      // Move to resize
      fireEvent.mouseMove(document, { clientX: 350, clientY: 300 });
      
      // End resize
      fireEvent.mouseUp(document);

      expect(mockOnAction).toHaveBeenCalledWith({
        type: 'resize',
        noteId: mockNote.id,
        size: { width: 250, height: 200 }
      });
    });
  });

  describe('Editing', () => {
    test('enters editing mode on double click when canEdit is true', async () => {
      const user = userEvent.setup();
      render(
        <StickyNote
          note={mockNote}
          onAction={mockOnAction}
          onContextMenu={mockOnContextMenu}
          canEdit={true}
        />
      );

      const noteElement = screen.getByTestId('sticky-note');
      await user.dblClick(noteElement);

      expect(mockOnAction).toHaveBeenCalledWith({
        type: 'startEdit',
        noteId: mockNote.id
      });
    });

    test('prevents editing when canEdit is false', async () => {
      const user = userEvent.setup();
      render(
        <StickyNote
          note={mockNote}
          onAction={mockOnAction}
          onContextMenu={mockOnContextMenu}
          canEdit={false}
        />
      );

      const noteElement = screen.getByTestId('sticky-note');
      await user.dblClick(noteElement);

      expect(mockOnAction).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'startEdit' })
      );
    });

    test('saves content on blur during editing', async () => {
      const user = userEvent.setup();
      const editingNote = { ...mockNote, isEditing: true };
      
      render(
        <StickyNote
          note={editingNote}
          onAction={mockOnAction}
          onContextMenu={mockOnContextMenu}
          canEdit={true}
        />
      );

      const textArea = screen.getByRole('textbox');
      await user.clear(textArea);
      await user.type(textArea, 'Updated content');
      await user.tab(); // Blur the textarea

      expect(mockOnAction).toHaveBeenCalledWith({
        type: 'updateContent',
        noteId: mockNote.id,
        content: 'Updated content'
      });
    });

    test('saves content on Enter key during editing', async () => {
      const user = userEvent.setup();
      const editingNote = { ...mockNote, isEditing: true };
      
      render(
        <StickyNote
          note={editingNote}
          onAction={mockOnAction}
          onContextMenu={mockOnContextMenu}
          canEdit={true}
        />
      );

      const textArea = screen.getByRole('textbox');
      await user.clear(textArea);
      await user.type(textArea, 'New content{enter}');

      expect(mockOnAction).toHaveBeenCalledWith({
        type: 'updateContent',
        noteId: mockNote.id,
        content: 'New content'
      });
    });
  });

  describe('Context Menu', () => {
    test('calls onContextMenu on right click', () => {
      render(
        <StickyNote
          note={mockNote}
          onAction={mockOnAction}
          onContextMenu={mockOnContextMenu}
        />
      );

      const noteElement = screen.getByTestId('sticky-note');
      fireEvent.contextMenu(noteElement, { clientX: 150, clientY: 150 });

      expect(mockOnContextMenu).toHaveBeenCalledWith({
        x: 150,
        y: 150,
        noteId: mockNote.id,
        canEdit: true,
        canDelete: true,
        onEdit: expect.any(Function),
        onDelete: expect.any(Function),
        onChangeColor: expect.any(Function),
        onDuplicate: expect.any(Function)
      });
    });
  });

  describe('Delete Functionality', () => {
    test('shows delete button when canDelete is true', () => {
      render(
        <StickyNote
          note={mockNote}
          onAction={mockOnAction}
          onContextMenu={mockOnContextMenu}
          canDelete={true}
        />
      );

      expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    });

    test('hides delete button when canDelete is false', () => {
      render(
        <StickyNote
          note={mockNote}
          onAction={mockOnAction}
          onContextMenu={mockOnContextMenu}
          canDelete={false}
        />
      );

      expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument();
    });

    test('calls delete action when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <StickyNote
          note={mockNote}
          onAction={mockOnAction}
          onContextMenu={mockOnContextMenu}
          canDelete={true}
        />
      );

      const deleteButton = screen.getByTestId('delete-button');
      await user.click(deleteButton);

      expect(mockOnAction).toHaveBeenCalledWith({
        type: 'delete',
        noteId: mockNote.id
      });
    });
  });

  describe('Color Variants', () => {
    const colorTests = [
      { color: 'blue', expectedBg: '#dbeafe', expectedBorder: '#3b82f6' },
      { color: 'green', expectedBg: '#d1fae5', expectedBorder: '#10b981' },
      { color: 'red', expectedBg: '#fee2e2', expectedBorder: '#ef4444' },
      { color: 'purple', expectedBg: '#e9d5ff', expectedBorder: '#8b5cf6' }
    ] as const;

    colorTests.forEach(({ color, expectedBg, expectedBorder }) => {
      test(`renders ${color} color variant correctly`, () => {
        const coloredNote = { ...mockNote, color };
        render(
          <StickyNote
            note={coloredNote}
            onAction={mockOnAction}
            onContextMenu={mockOnContextMenu}
          />
        );

        expect(screen.getByTestId('sticky-note')).toHaveStyle({
          backgroundColor: expectedBg,
          border: `2px solid ${expectedBorder}`
        });
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(
        <StickyNote
          note={mockNote}
          onAction={mockOnAction}
          onContextMenu={mockOnContextMenu}
        />
      );

      const noteElement = screen.getByTestId('sticky-note');
      expect(noteElement).toHaveAttribute('role', 'article');
      expect(noteElement).toHaveAttribute('aria-label', expect.stringContaining('Sticky note'));
      expect(noteElement).toHaveAttribute('tabIndex', '0');
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(
        <StickyNote
          note={mockNote}
          onAction={mockOnAction}
          onContextMenu={mockOnContextMenu}
          canEdit={true}
          canDelete={true}
        />
      );

      const noteElement = screen.getByTestId('sticky-note');
      await user.tab();
      expect(noteElement).toHaveFocus();

      // Test Enter key for editing
      await user.keyboard('{Enter}');
      expect(mockOnAction).toHaveBeenCalledWith({
        type: 'startEdit',
        noteId: mockNote.id
      });
    });
  });

  describe('Performance', () => {
    test('does not re-render unnecessarily', () => {
      const renderSpy = jest.fn<unknown[], unknown>();
      const TestWrapper = ({ note }: { note: StickyNoteType }) => {
        renderSpy();
        return (
          <StickyNote
            note={note}
            onAction={mockOnAction}
            onContextMenu={mockOnContextMenu}
          />
        );
      };

      const { rerender } = render(<TestWrapper note={mockNote} />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestWrapper note={mockNote} />);
      expect(renderSpy).toHaveBeenCalledTimes(2); // Expected to re-render, but memo could optimize this

      // Re-render with different note content
      const updatedNote = { ...mockNote, content: 'Updated content' };
      rerender(<TestWrapper note={updatedNote} />);
      expect(renderSpy).toHaveBeenCalledTimes(3);
    });
  });
});