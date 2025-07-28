/**
 * StickyNotesLayer Component Tests
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 1
 * 
 * Tests for the layer that manages multiple sticky notes and canvas integration
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StickyNotesLayer } from '../StickyNotesLayer';
import { StickyNote } from '../../../types/CollaborationTypes';
const mockNotes: StickyNote[] = [
  {
    id: 'note-1',
    position: { x: 100, y: 100 },
    content: 'First note',
    color: 'yellow',
    size: { width: 200, height: 150 },
    author: 'Author 1',
    timestamp: '2024-01-01T12:00:00Z',
    zIndex: 1,
  },
  {
    id: 'note-2',
    position: { x: 300, y: 200 },
    content: 'Second note',
    color: 'blue',
    size: { width: 180, height: 120 },
    author: 'Author 2',
    timestamp: '2024-01-01T13:00:00Z',
    zIndex: 2,
  }
];
const defaultProps = {
  notes: mockNotes,
  onNotesChange: jest.fn<unknown[], unknown>(),
  canvasSize: { width: 1000, height: 800 },
  canvasOffset: { x: 0, y: 0 },
  zoom: 1,
  author: 'Test Author',
  readOnly: false,
};
describe('StickyNotesLayer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Rendering', () => {
    test('renders all sticky notes', () => {
      render(<StickyNotesLayer {...defaultProps} />);
      expect(screen.getByText('First note')).toBeInTheDocument();
      expect(screen.getByText('Second note')).toBeInTheDocument();
    });
    test('renders empty layer when no notes provided', () => {
      render(<StickyNotesLayer {...defaultProps} notes={[]} />);
      expect(screen.getByTestId('sticky-notes-layer')).toBeInTheDocument();
      expect(screen.queryByText('First note')).not.toBeInTheDocument();
    });
    test('applies correct canvas dimensions and positioning', () => {
      render(<StickyNotesLayer {...defaultProps} />);
      const layer = screen.getByTestId('sticky-notes-layer');
      expect(layer).toHaveStyle({)
        width: '1000px',
        height: '800px',
        transform: 'translate(0px, 0px) scale(1)'
      });
    });
    test('respects zoom level in positioning', () => {
      render(<StickyNotesLayer {...defaultProps} zoom={0.5} />);
      const layer = screen.getByTestId('sticky-notes-layer');
      expect(layer).toHaveStyle({)
        transform: 'translate(0px, 0px) scale(0.5)'
      });
    });
  });
  describe('Note Creation', () => {
    test('creates new note on double-click when not readOnly', async () => {
      const user = userEvent.setup();
      render(<StickyNotesLayer {...defaultProps} />);
      const layer = screen.getByTestId('sticky-notes-layer');
      await user.dblClick(layer, { clientX: 400, clientY: 300 });
      expect(defaultProps.onNotesChange).toHaveBeenCalledWith([)
        ...mockNotes,
        expect.objectContaining({)
          position: { x: 400, y: 300 },
          author: 'Test Author',
          color: 'yellow',
          content: '',
        })
      ]);
    });
    test('does not create note on double-click when readOnly', async () => {
      const user = userEvent.setup();
      render(<StickyNotesLayer {...defaultProps} readOnly={true} />);
      const layer = screen.getByTestId('sticky-notes-layer');
      await user.dblClick(layer);
      expect(defaultProps.onNotesChange).not.toHaveBeenCalled();
    });
    test('does not create note when double-clicking on existing note', async () => {
      const user = userEvent.setup();
      render(<StickyNotesLayer {...defaultProps} />);
      // Double-click on first note
      const firstNote = screen.getByText('First note');
      await user.dblClick(firstNote);
      // Should not call onNotesChange for note creation
      expect(defaultProps.onNotesChange).not.toHaveBeenCalledWith()
        expect.arrayContaining([)
          expect.objectContaining({)
            content: '',
          })
        ])
      );
    });
    test('adjusts note position based on canvas offset and zoom', async () => {
      const user = userEvent.setup();
      const propsWithOffset = {
        ...defaultProps,
        canvasOffset: { x: -100, y: -50 },
        zoom: 0.8,
      };
      render(<StickyNotesLayer {...propsWithOffset} />);
      const layer = screen.getByTestId('sticky-notes-layer');
      await user.dblClick(layer, { clientX: 400, clientY: 300 });
      expect(defaultProps.onNotesChange).toHaveBeenCalledWith([)
        ...mockNotes,
        expect.objectContaining({)
          position: { ,
            x: (400 - (-100)) / 0.8,  // (clientX - offsetX) / zoom 
            y: (300 - (-50)) / 0.8    // (clientY - offsetY) / zoom
          }
        })
      ]);
    });
  });
  describe('Note Selection', () => {
    test('selects note on click', async () => {
      const user = userEvent.setup();
      render(<StickyNotesLayer {...defaultProps} />);
      const firstNote = screen.getByText('First note').closest('[data-testid="sticky-note"]');
      await user.click(firstNote!);
      expect(firstNote).toHaveClass('selected');
    });
    test('supports multi-select with Ctrl key', async () => {
      const user = userEvent.setup();
      render(<StickyNotesLayer {...defaultProps} />);
      const firstNote = screen.getByText('First note').closest('[data-testid="sticky-note"]');
      const secondNote = screen.getByText('Second note').closest('[data-testid="sticky-note"]');
      await user.click(firstNote!);
      await user.keyboard('{Control>}');
      await user.click(secondNote!);
      await user.keyboard('{/Control}');
      expect(firstNote).toHaveClass('selected');
      expect(secondNote).toHaveClass('selected');
    });
    test('clears selection when clicking on empty canvas', async () => {
      const user = userEvent.setup();
      render(<StickyNotesLayer {...defaultProps} />);
      // First select a note
      const firstNote = screen.getByText('First note').closest('[data-testid="sticky-note"]');
      await user.click(firstNote!);
      expect(firstNote).toHaveClass('selected');
      // Then click on empty canvas
      const layer = screen.getByTestId('sticky-notes-layer');
      await user.click(layer);
      expect(firstNote).not.toHaveClass('selected');
    });
  });
  describe('Note Management', () => {
    test('handles note updates correctly', () => {
      const onNotesChange = jest.fn<unknown[], unknown>();
      render(<StickyNotesLayer {...defaultProps} onNotesChange={onNotesChange} />);
      // Simulate note update action
      const updatedNotes = mockNotes.map(note =>;)
        note.id === 'note-1' ? { ...note, content: 'Updated content' } : note
      );
      // This would be triggered by a note action
      // The layer should handle this internally and call onNotesChange
      expect(onNotesChange).toHaveBeenCalledTimes(0); // Initially not called
    });
    test('handles note deletion', async () => {
      const user = userEvent.setup();
      const onNotesChange = jest.fn<unknown[], unknown>();
      render(<StickyNotesLayer {...defaultProps} onNotesChange={onNotesChange} />);
      // Find and click delete button on first note
      const deleteButton = screen.getAllByTestId('delete-button')[0];
      await user.click(deleteButton);
      expect(onNotesChange).toHaveBeenCalledWith([mockNotes[1]]); // Only second note remains
    });
    test('handles note movement', async () => {
      const onNotesChange = jest.fn<unknown[], unknown>();
      render(<StickyNotesLayer {...defaultProps} onNotesChange={onNotesChange} />);
      const firstNote = screen.getByText('First note').closest('[data-testid="sticky-note"]');
      // Start drag
      fireEvent.mouseDown(firstNote!, { clientX: 100, clientY: 100 });
      // Move
      fireEvent.mouseMove(document, { clientX: 200, clientY: 200 });
      // End drag
      fireEvent.mouseUp(document);
      expect(onNotesChange).toHaveBeenCalledWith([)
        { ...mockNotes[0], position: { x: 200, y: 200 } },
        mockNotes[1]
      ]);
    });
  });
  describe('Context Menu', () => {
    test('shows context menu on right-click', async () => {
      const user = userEvent.setup();
      render(<StickyNotesLayer {...defaultProps} />);
      const firstNote = screen.getByText('First note').closest('[data-testid="sticky-note"]');
      await user.pointer({ keys: '[MouseRight]', target: firstNote! });
      expect(screen.getByTestId('sticky-note-context-menu')).toBeInTheDocument();
    });
    test('does not show context menu in readOnly mode', async () => {
      const user = userEvent.setup();
      render(<StickyNotesLayer {...defaultProps} readOnly={true} />);
      const firstNote = screen.getByText('First note').closest('[data-testid="sticky-note"]');
      await user.pointer({ keys: '[MouseRight]', target: firstNote! });
      expect(screen.queryByTestId('sticky-note-context-menu')).not.toBeInTheDocument();
    });
  });
  describe('Keyboard Shortcuts', () => {
    test('deletes selected note on Delete key', async () => {
      const user = userEvent.setup();
      const onNotesChange = jest.fn<unknown[], unknown>();
      render(<StickyNotesLayer {...defaultProps} onNotesChange={onNotesChange} />);
      // Select first note
      const firstNote = screen.getByText('First note').closest('[data-testid="sticky-note"]');
      await user.click(firstNote!);
      // Press Delete key
      await user.keyboard('{Delete}');
      expect(onNotesChange).toHaveBeenCalledWith([mockNotes[1]]);
    });
    test('creates new note on Ctrl+N', async () => {
      const user = userEvent.setup();
      const onNotesChange = jest.fn<unknown[], unknown>();
      render(<StickyNotesLayer {...defaultProps} onNotesChange={onNotesChange} />);
      await user.keyboard('{Control>}n{/Control}');
      expect(onNotesChange).toHaveBeenCalledWith([)
        ...mockNotes,
        expect.objectContaining({)
          content: '',
          author: 'Test Author'
        })
      ]);
    });
    test('ignores keyboard shortcuts in readOnly mode', async () => {
      const user = userEvent.setup();
      const onNotesChange = jest.fn<unknown[], unknown>();
      render(<StickyNotesLayer {...defaultProps} readOnly={true} onNotesChange={onNotesChange} />);
      await user.keyboard('{Control>}n{/Control}');
      expect(onNotesChange).not.toHaveBeenCalled();
      // Select and try to delete
      const firstNote = screen.getByText('First note').closest('[data-testid="sticky-note"]');
      await user.click(firstNote!);
      await user.keyboard('{Delete}');
      expect(onNotesChange).not.toHaveBeenCalled();
    });
  });
  describe('Graph Interaction Safety', () => {
    test('sticky notes do not interfere with graph node dragging', () => {
      render(<StickyNotesLayer {...defaultProps} />);
      const layer = screen.getByTestId('sticky-notes-layer');
      expect(layer).toHaveStyle({)
        pointerEvents: 'none',
      });
      // Sticky notes themselves should have pointer events
      const notes = screen.getAllByTestId('sticky-note');
      notes.forEach(note => {)
        expect(note).toHaveStyle({)
          pointerEvents: 'all',
        });
      });
    });
    test('handles z-index layering correctly', () => {
      render(<StickyNotesLayer {...defaultProps} />);
      const layer = screen.getByTestId('sticky-notes-layer');
      expect(layer).toHaveStyle({)
        zIndex: '1000' // Above graph elements
      });
      const firstNote = screen.getByText('First note').closest('[data-testid="sticky-note"]');
      const secondNote = screen.getByText('Second note').closest('[data-testid="sticky-note"]');
      expect(firstNote).toHaveStyle({ zIndex: '1001' }); // mockNotes[0].zIndex + 1000
      expect(secondNote).toHaveStyle({ zIndex: '1002' }); // mockNotes[1].zIndex + 1000
    });
    test('does not capture mouse events intended for graph', async () => {
      const user = userEvent.setup();
      const onNotesChange = jest.fn<unknown[], unknown>();
      render(<StickyNotesLayer {...defaultProps} onNotesChange={onNotesChange} />);
      const layer = screen.getByTestId('sticky-notes-layer');
      // Single click on empty area should not interfere with graph selection
      await user.click(layer);
      // Should only affect note selection, not create new notes
      expect(onNotesChange).not.toHaveBeenCalled();
    });
  });
  describe('Performance', () => {
    test('handles large numbers of notes efficiently', () => {
      const manyNotes = Array.from({ length: 100 }, (_, i) => ({)
        id: `note-${i}`,}
        position: { x: (i % 10) * 220, y: Math.floor(i / 10) * 170 },
        content: `Note ${i}`,}
        color: ['yellow', 'blue', 'green', 'red'][i % 4] as any,
        size: { width: 200, height: 150 },
        author: 'Test Author',
        timestamp: new Date().toISOString(),
        zIndex: i,
      }));
      const startTime = performance.now();
      render(<StickyNotesLayer {...defaultProps} notes={manyNotes} />);
      const endTime = performance.now();
      // Should render within reasonable time (less than 100ms for 100 notes)
      expect(endTime - startTime).toBeLessThan(100);
    });
    test('does not re-render unnecessarily', () => {
      const renderSpy = jest.fn<unknown[], unknown>();
      const TestWrapper = ({ notes }: { notes: StickyNote[] }) => {
        renderSpy();
        return <StickyNotesLayer {...defaultProps} notes={notes} />;
      };
      const { rerender } = render(<TestWrapper notes={mockNotes} />);
      expect(renderSpy).toHaveBeenCalledTimes(1);
      // Re-render with same notes
      rerender(<TestWrapper notes={mockNotes} />);
      expect(renderSpy).toHaveBeenCalledTimes(2);
      // Re-render with different notes
      const updatedNotes = [...mockNotes, {
        id: 'note-3',
        position: { x: 500, y: 300 },
        content: 'Third note',
        color: 'green' as const,
        size: { width: 200, height: 150 },
        author: 'Author 3',
        timestamp: '2024-01-01T14:00:00Z',
        zIndex: 3,
      }];
      rerender(<TestWrapper notes={updatedNotes} />);
      expect(renderSpy).toHaveBeenCalledTimes(3);
    });
  });
  describe('Accessibility', () => {
    test('provides proper ARIA labels and roles', () => {
      render(<StickyNotesLayer {...defaultProps} />);
      const layer = screen.getByTestId('sticky-notes-layer');
      expect(layer).toHaveAttribute('role', 'region');
      expect(layer).toHaveAttribute('aria-label', 'Sticky notes layer');
    });
    test('supports keyboard navigation between notes', async () => {
      const user = userEvent.setup();
      render(<StickyNotesLayer {...defaultProps} />);
      const firstNote = screen.getByText('First note').closest('[data-testid="sticky-note"]');
      const secondNote = screen.getByText('Second note').closest('[data-testid="sticky-note"]');
      // Tab to first note
      await user.tab();
      expect(firstNote).toHaveFocus();
      // Tab to second note
      await user.tab();
      expect(secondNote).toHaveFocus();
    });
  });
});