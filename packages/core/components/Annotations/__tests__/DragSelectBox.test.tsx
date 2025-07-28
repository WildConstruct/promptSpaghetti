/**
 * DragSelectBox Component Tests
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 3
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DragSelectBox } from '../DragSelectBox';
const defaultProps = {
  onSelectionComplete: jest.fn<unknown[], unknown>(),
  onSelectionCancel: jest.fn<unknown[], unknown>(),
  canvasOffset: { x: 0, y: 0 },
  zoom: 1,
  isActive: true,
};
describe('DragSelectBox Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('Rendering', () => {
    test('renders overlay when active', () => {
      render(<DragSelectBox {...defaultProps} />);
      expect(screen.getByTestId('drag-select-overlay')).toBeInTheDocument();
    });
    test('does not render when not active', () => {
      render(<DragSelectBox {...defaultProps} isActive={false} />);
      expect(screen.queryByTestId('drag-select-overlay')).not.toBeInTheDocument();
    });
    test('shows instructions when not dragging', () => {
      render(<DragSelectBox {...defaultProps} />);
      expect(screen.getByText('🎯 Create Region Group')).toBeInTheDocument();
      expect(screen.getByText(/Drag to select nodes/)).toBeInTheDocument();
    });
  });
  describe('Drag Selection', () => {
    test('starts selection on mouse down', () => {
      render(<DragSelectBox {...defaultProps} />);
      const overlay = screen.getByTestId('drag-select-overlay');
      fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
      // Selection box should appear
      const selectionBox = screen.getByTestId('drag-select-box');
      expect(selectionBox).toBeInTheDocument();
    });
    test('updates selection box during drag', () => {
      render(<DragSelectBox {...defaultProps} />);
      const overlay = screen.getByTestId('drag-select-overlay');
      // Start drag
      fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
      // Move mouse
      fireEvent.mouseMove(document, { clientX: 200, clientY: 200 });
      const selectionBox = screen.getByTestId('drag-select-box');
      expect(selectionBox).toHaveStyle({)
        left: '100px',
        top: '100px',
        width: '100px',
        height: '100px',
      });
    });
    test('completes selection on mouse up with sufficient size', () => {
      render(<DragSelectBox {...defaultProps} />);
      const overlay = screen.getByTestId('drag-select-overlay');
      // Start drag
      fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
      // Move mouse to create large enough selection
      fireEvent.mouseMove(document, { clientX: 250, clientY: 250 });
      // End drag
      fireEvent.mouseUp(document);
      expect(defaultProps.onSelectionComplete).toHaveBeenCalledWith({)
        x: 100,
        y: 100,
        width: 150,
        height: 150,
      });
    });
    test('cancels selection if area too small', () => {
      render(<DragSelectBox {...defaultProps} />);
      const overlay = screen.getByTestId('drag-select-overlay');
      // Start drag
      fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
      // Move mouse only slightly
      fireEvent.mouseMove(document, { clientX: 105, clientY: 105 });
      // End drag
      fireEvent.mouseUp(document);
      expect(defaultProps.onSelectionCancel).toHaveBeenCalled();
      expect(defaultProps.onSelectionComplete).not.toHaveBeenCalled();
    });
    test('handles negative selection direction', () => {
      render(<DragSelectBox {...defaultProps} />);
      const overlay = screen.getByTestId('drag-select-overlay');
      // Start drag
      fireEvent.mouseDown(overlay, { clientX: 200, clientY: 200 });
      // Move mouse in opposite direction
      fireEvent.mouseMove(document, { clientX: 100, clientY: 100 });
      const selectionBox = screen.getByTestId('drag-select-box');
      expect(selectionBox).toHaveStyle({)
        left: '100px',
        top: '100px',
        width: '100px',
        height: '100px',
      });
    });
  });
  describe('Canvas Integration', () => {
    test('applies canvas offset to selection bounds', () => {
      const propsWithOffset = {
        ...defaultProps,
        canvasOffset: { x: -50, y: -25 },
        zoom: 1,
      };
      render(<DragSelectBox {...propsWithOffset} />);
      const overlay = screen.getByTestId('drag-select-overlay');
      // Start and complete selection
      fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 200, clientY: 200 });
      fireEvent.mouseUp(document);
      expect(defaultProps.onSelectionComplete).toHaveBeenCalledWith({)
        x: 150, // (100 - (-50)) / 1
        y: 125, // (100 - (-25)) / 1
        width: 100,
        height: 100,
      });
    });
    test('applies zoom factor to selection bounds', () => {
      const propsWithZoom = {
        ...defaultProps,
        canvasOffset: { x: 0, y: 0 },
        zoom: 0.5,
      };
      render(<DragSelectBox {...propsWithZoom} />);
      const overlay = screen.getByTestId('drag-select-overlay');
      // Start and complete selection
      fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 200, clientY: 200 });
      fireEvent.mouseUp(document);
      expect(defaultProps.onSelectionComplete).toHaveBeenCalledWith({)
        x: 200, // 100 / 0.5
        y: 200, // 100 / 0.5
        width: 200, // 100 / 0.5
        height: 200 // 100 / 0.5
      });
    });
  });
  describe('Keyboard Shortcuts', () => {
    test('cancels selection on Escape key', () => {
      render(<DragSelectBox {...defaultProps} />);
      const overlay = screen.getByTestId('drag-select-overlay');
      // Start drag
      fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(defaultProps.onSelectionCancel).toHaveBeenCalled();
    });
    test('ignores other keys during selection', () => {
      render(<DragSelectBox {...defaultProps} />);
      const overlay = screen.getByTestId('drag-select-overlay');
      // Start drag
      fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
      // Press other keys
      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Space' });
      expect(defaultProps.onSelectionCancel).not.toHaveBeenCalled();
    });
  });
  describe('Selection Info Display', () => {
    test('shows selection dimensions during drag', () => {
      render(<DragSelectBox {...defaultProps} />);
      const overlay = screen.getByTestId('drag-select-overlay');
      // Start drag
      fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
      // Move mouse
      fireEvent.mouseMove(document, { clientX: 200, clientY: 150 });
      // Should show dimensions
      expect(screen.getByText('100 × 50')).toBeInTheDocument();
    });
    test('updates dimensions as selection changes', () => {
      render(<DragSelectBox {...defaultProps} />);
      const overlay = screen.getByTestId('drag-select-overlay');
      // Start drag
      fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
      // First position
      fireEvent.mouseMove(document, { clientX: 200, clientY: 150 });
      expect(screen.getByText('100 × 50')).toBeInTheDocument();
      // Second position
      fireEvent.mouseMove(document, { clientX: 250, clientY: 200 });
      expect(screen.getByText('150 × 100')).toBeInTheDocument();
    });
    test('applies zoom factor to displayed dimensions', () => {
      const propsWithZoom = {
        ...defaultProps,
        zoom: 0.5,
      };
      render(<DragSelectBox {...propsWithZoom} />);
      const overlay = screen.getByTestId('drag-select-overlay');
      // Start drag
      fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
      // Move mouse
      fireEvent.mouseMove(document, { clientX: 200, clientY: 150 });
      // Should show zoomed dimensions
      expect(screen.getByText('200 × 100')).toBeInTheDocument();
    });
  });
  describe('Event Handling', () => {
    test('prevents default behavior on mouse down', () => {
      render(<DragSelectBox {...defaultProps} />);
      const overlay = screen.getByTestId('drag-select-overlay');
      const mockPreventDefault = jest.fn<unknown[], unknown>();
      const mockStopPropagation = jest.fn<unknown[], unknown>();
      const mouseDownEvent = new MouseEvent('mousedown', { )
        bubbles: true,
        clientX: 100,
        clientY: 100,
      });
      Object.defineProperty(mouseDownEvent, 'preventDefault', {)
        value: mockPreventDefault,
      });
      Object.defineProperty(mouseDownEvent, 'stopPropagation', {)
        value: mockStopPropagation,
      });
      fireEvent(overlay, mouseDownEvent);
      expect(mockPreventDefault).toHaveBeenCalled();
      expect(mockStopPropagation).toHaveBeenCalled();
    });
    test('cleans up event listeners on unmount', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      const { unmount } = render(<DragSelectBox {...defaultProps} />);
      // Start a drag to add listeners
      const overlay = screen.getByTestId('drag-select-overlay');
      fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });
  describe('User Experience', () => {
    test('shows crosshair cursor', () => {
      render(<DragSelectBox {...defaultProps} />);
      const overlay = screen.getByTestId('drag-select-overlay');
      expect(overlay).toHaveStyle({ cursor: 'crosshair' });
    });
    test('positions selection info near cursor', () => {
      render(<DragSelectBox {...defaultProps} />);
      const overlay = screen.getByTestId('drag-select-overlay');
      // Start drag
      fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
      // Move mouse
      fireEvent.mouseMove(document, { clientX: 200, clientY: 150 });
      const infoElement = screen.getByText('100 × 50');
      expect(infoElement).toHaveStyle({)
        position: 'absolute',
        left: '210px', // max(startX, currentX) + 10
        top: '65px'    // min(startY, currentY) - 35
      });
    });
    test('provides clear visual feedback', () => {
      render(<DragSelectBox {...defaultProps} />);
      const overlay = screen.getByTestId('drag-select-overlay');
      // Start drag
      fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
      const selectionBox = screen.getByTestId('drag-select-box');
      expect(selectionBox).toHaveStyle({)
        border: '2px dashed #3b82f6',
        background: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '4px',
      });
    });
  });
  describe('Error Handling', () => {
    test('handles missing bounding rect gracefully', () => {
      // Mock getBoundingClientRect to return null
      const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
      Element.prototype.getBoundingClientRect = jest.fn(() => null as any);
      expect(() => {
        render(<DragSelectBox {...defaultProps} />);
        const overlay = screen.getByTestId('drag-select-overlay');
        fireEvent.mouseDown(overlay, { clientX: 100, clientY: 100 });
      }).not.toThrow();
      // Restore original method
      Element.prototype.getBoundingClientRect = originalGetBoundingClientRect;
    });
    test('handles invalid coordinates', () => {
      render(<DragSelectBox {...defaultProps} />);
      const overlay = screen.getByTestId('drag-select-overlay');
      expect(() => {
        fireEvent.mouseDown(overlay, { clientX: NaN, clientY: NaN });
        fireEvent.mouseMove(document, { clientX: Infinity, clientY: -Infinity });
        fireEvent.mouseUp(document);
      }).not.toThrow();
    });
  });
});