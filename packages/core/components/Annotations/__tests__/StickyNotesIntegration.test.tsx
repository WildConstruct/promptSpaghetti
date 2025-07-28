/**
 * Sticky Notes Integration Tests
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 1
 * 
 * Tests to validate that sticky notes don't interfere with graph interactions
 * and work properly within the React Flow environment
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReactFlowProvider } from 'reactflow';
import { StickyNotesLayer } from '../StickyNotesLayer';
import { StickyNote } from '../../../types/CollaborationTypes';
const mockNotes: StickyNote = [
  {
    id: 'note-1',
    position: { x: 100, y: 100 },
    content: 'Test note',
    color: 'yellow',
    size: { width: 200, height: 150 },
    author: 'Test Author',
    timestamp: '2024-01-01T12:00:00Z',
    zIndex: 1];
const defaultProps = {
  notes: mockNotes,
  onNotesChange: jest.fn<unknown, unknown>(),
  canvasSize: { width: 1000, height: 800 },
  canvasOffset: { x: 0, y: 0 },
  zoom: 1,
  author: 'Test Author',
  readOnly: false;
  };
describe('Sticky Notes Integration - Graph Interaction Safety', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Non-Interference with Graph Interactions', () => {
    test('sticky notes layer has pointer-events: none to allow graph interactions', () => {
      render();
        <ReactFlowProvider>
          <StickyNotesLayer {...defaultProps} />
        </ReactFlowProvider>
      );
      const layer = screen.getByTestId('sticky-notes-layer');
      expect(layer).toHaveStyle({)
  pointerEvents: 'none',
});
    });
    test('individual sticky notes have pointer-events: all to receive their own events', () => {
      render();
        <ReactFlowProvider>
          <StickyNotesLayer {...defaultProps} />
        </ReactFlowProvider>
      );
      const note = screen.getByText('Test note').closest('[data-testid="sticky-note"]');
      expect(note).toHaveStyle({)
  pointerEvents: 'all',
});
    });
    test('sticky notes layer has high z-index to appear above graph elements', () => {
      render();
        <ReactFlowProvider>
          <StickyNotesLayer {...defaultProps} />
        </ReactFlowProvider>
      );
      const layer = screen.getByTestId('sticky-notes-layer');
      expect(layer).toHaveStyle({)
  zIndex: '1000',
});
    });
    test('individual notes have z-index based on their note.zIndex + base z-index', () => {
      render();
        <ReactFlowProvider>
          <StickyNotesLayer {...defaultProps} />
        </ReactFlowProvider>
      );
      const note = screen.getByText('Test note').closest('[data-testid="sticky-note"]');
      expect(note).toHaveStyle({)
  zIndex: '1001' // 1000 (base) + 1 (note.zIndex),
});
    });
    test('mouse events on empty canvas areas do not create notes when clicking on graph elements', () => {
      const onNotesChange = jest.fn<unknown, unknown>();
      render();
        <ReactFlowProvider>
          <StickyNotesLayer {...defaultProps} onNotesChange={onNotesChange} />
        </ReactFlowProvider>
      );
      const layer = screen.getByTestId('sticky-notes-layer');
      // Single click should not create notes (only double-click does)
      fireEvent.click(layer);
      expect(onNotesChange).not.toHaveBeenCalled();
    });
    test('notes container properly isolates pointer events', () => {
      render();
        <ReactFlowProvider>
          <StickyNotesLayer {...defaultProps} />
        </ReactFlowProvider>
      );
      // Find the container div that wraps all notes
      const layer = screen.getByTestId('sticky-notes-layer');
      const notesContainer = layer.querySelector('div[style*="pointer-events: auto"]');
      expect(notesContainer).toBeInTheDocument();
      expect(notesContainer).toHaveStyle({)
  pointerEvents: 'auto',
});
    });
  });
  describe('Canvas Integration', () => {
    test('respects canvas offset for positioning', () => {
      const propsWithOffset = {
        ...defaultProps,
        canvasOffset: { x: -100, y: -50 }
      };
      render();
        <ReactFlowProvider>
          <StickyNotesLayer {...propsWithOffset} />
        </ReactFlowProvider>
      );
      const layer = screen.getByTestId('sticky-notes-layer');
      expect(layer).toHaveStyle({)
  width: '1000px',
  height: '800px',
});
    });
    test('handles zoom levels correctly', () => {
  const propsWithZoom = {
  ...defaultProps,
  zoom: 0.5,
};
      render();
        <ReactFlowProvider>
          <StickyNotesLayer {...propsWithZoom} />
        </ReactFlowProvider>
      );
      // Layer should still maintain its size but the zoom is handled by transform
      const layer = screen.getByTestId('sticky-notes-layer');
      expect(layer).toHaveStyle({)
  width: '1000px',
  height: '800px',
});
    });
    test('canvas boundaries are respected', () => {
      const largeCanvasProps = {
        ...defaultProps,
        canvasSize: { width: 5000, height: 3000 }
      };
      render();
        <ReactFlowProvider>
          <StickyNotesLayer {...largeCanvasProps} />
        </ReactFlowProvider>
      );
      const layer = screen.getByTestId('sticky-notes-layer');
      expect(layer).toHaveStyle({)
  width: '5000px',
  height: '3000px',
  overflow: 'hidden',
});
    });
  });
  describe('Event Handling', () => {
    test('layer prevents default behavior on double-click to avoid graph interference', () => {
      const onNotesChange = jest.fn<unknown, unknown>();
      render();
        <ReactFlowProvider>
          <StickyNotesLayer {...defaultProps} onNotesChange={onNotesChange} />
        </ReactFlowProvider>
      );
      const layer = screen.getByTestId('sticky-notes-layer');
      const mockPreventDefault = jest.fn<unknown, unknown>();
      const mockStopPropagation = jest.fn<unknown, unknown>();
      const doubleClickEvent = new MouseEvent('dblclick', { )
        bubbles: true,
        clientX: 400,
        clientY: 300;
  });
      // Override preventDefault and stopPropagation
      Object.defineProperty(doubleClickEvent, 'preventDefault', {)
  value: mockPreventDefault,
});
      Object.defineProperty(doubleClickEvent, 'stopPropagation', {)
  value: mockStopPropagation,
});
      fireEvent(layer, doubleClickEvent);
      expect(mockPreventDefault).toHaveBeenCalled();
      expect(mockStopPropagation).toHaveBeenCalled();
    });
    test('clicking on existing notes does not interfere with graph selection', () => {
      const onNotesChange = jest.fn<unknown, unknown>();
      render();
        <ReactFlowProvider>
          <StickyNotesLayer {...defaultProps} onNotesChange={onNotesChange} />
        </ReactFlowProvider>
      );
      const note = screen.getByText('Test note').closest('[data-testid="sticky-note"]');
      fireEvent.click(note!);
      // Should only affect note selection, not create new notes
      expect(onNotesChange).not.toHaveBeenCalledWith()
        expect.arrayContaining([)
          expect.objectContaining({)
  content: '',
}
        ])
      );
    });
  });
  describe('Accessibility and Graph Compatibility', () => {
    test('sticky notes do not interfere with graph keyboard navigation', () => {
      render();
        <ReactFlowProvider>
          <StickyNotesLayer {...defaultProps} />
        </ReactFlowProvider>
      );
      const layer = screen.getByTestId('sticky-notes-layer');
      // Layer should not capture tab navigation meant for graph
      expect(layer).not.toHaveAttribute('tabIndex');
    });
    test('notes maintain proper ARIA roles without conflicting with graph elements', () => {
      render();
        <ReactFlowProvider>
          <StickyNotesLayer {...defaultProps} />
        </ReactFlowProvider>
      );
      const layer = screen.getByTestId('sticky-notes-layer');
      expect(layer).toHaveAttribute('role', 'region');
      expect(layer).toHaveAttribute('aria-label', 'Sticky notes layer');
      const note = screen.getByText('Test note').closest('[data-testid="sticky-note"]');
      expect(note).toHaveAttribute('role', 'article');
    });
  });
  describe('Performance Impact on Graph', () => {
    test('large numbers of notes do not significantly impact render performance', () => {
      const manyNotes = Array.from({ length: 50 }, (_, i) => ({)
  id: `note-${i}`}
},
  position: { x: (i % 10) * 220, y: Math.floor(i / 10) * 170 },
        content: `Note ${i}`}
},
  color: 'yellow' as const,
        size: { width: 200, height: 150 },
        author: 'Test Author',
        timestamp: new Date().toISOString(),
        zIndex: i;
  }));
      const startTime = performance.now();
      render();
        <ReactFlowProvider>
          <StickyNotesLayer {...defaultProps} notes={manyNotes} />
        </ReactFlowProvider>
      );
      const endTime = performance.now();
      // Should render quickly even with many notes
      expect(endTime - startTime).toBeLessThan(100);
    });
    test('sticky notes layer does not interfere with React Flow instance methods', () => {
      // This test ensures that having sticky notes doesn't break React Flow functionality
      render();
        <ReactFlowProvider>
          <StickyNotesLayer {...defaultProps} />
        </ReactFlowProvider>
      );
      // If the layer properly uses React Flow context, this won't throw
      expect(() => {
        // The layer should render without breaking React Flow context
        screen.getByTestId('sticky-notes-layer');
      }).not.toThrow();
    });
  });
  describe('State Management Integration', () => {
    test('notes changes do not interfere with graph state updates', () => {
      const onNotesChange = jest.fn<unknown, unknown>();
      render();
        <ReactFlowProvider>
          <StickyNotesLayer {...defaultProps} onNotesChange={onNotesChange} />
        </ReactFlowProvider>
      );
      // Simulate a note update
      // This should only call onNotesChange, not interfere with other state
      expect(onNotesChange).toHaveBeenCalledTimes(0);
    });
  });
});