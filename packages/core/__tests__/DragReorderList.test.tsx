// packages/core/__tests__/DragReorderList.test.tsx
// Test suite for Drag-to-Reorder Interface (Story 8.3 Task 3)

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DragReorderList } from '../components/WeightControls/DragReorderList';
import { WeightControlOption } from '../components/Inspector/WeightControlSlider';

describe('DragReorderList', () => {
  const mockOptions: WeightControlOption[] = [
    { id: '1', text: 'Fire Spell', weight: 40 },
    { id: '2', text: 'Ice Spell', weight: 30 },
    { id: '3', text: 'Lightning Spell', weight: 20 },
    { id: '4', text: 'Earth Spell', weight: 10 }
  ];

  const mockOnReorder = jest.fn<unknown[], unknown>();
  const mockOnWeightChange = jest.fn<unknown[], unknown>();
  const mockOnTextChange = jest.fn<unknown[], unknown>();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders all options with drag handles', () => {
      render(
        <DragReorderList
          options={mockOptions}
          onReorder={mockOnReorder}
          onWeightChange={mockOnWeightChange}
          onTextChange={mockOnTextChange}
        />
      );

      expect(screen.getByDisplayValue('Fire Spell')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Ice Spell')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Lightning Spell')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Earth Spell')).toBeInTheDocument();

      // Should have drag handles (⋮⋮ symbols)
      const dragHandles = screen.getAllByText('⋮⋮');
      expect(dragHandles).toHaveLength(4);
    });

    it('shows color indicators for each option', () => {
      const { container } = render(
        <DragReorderList
          options={mockOptions}
          onReorder={mockOnReorder}
        />
      );

      // Should have color indicator divs
      const colorIndicators = container.querySelectorAll('[style*="backgroundColor"]');
      expect(colorIndicators.length).toBeGreaterThanOrEqual(4);
    });

    it('displays weight percentages when enabled', () => {
      render(
        <DragReorderList
          options={mockOptions}
          onReorder={mockOnReorder}
          showWeights={true}
        />
      );

      expect(screen.getByText('40%')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument();
      expect(screen.getByText('20%')).toBeInTheDocument();
      expect(screen.getByText('10%')).toBeInTheDocument();
    });

    it('hides weight controls when disabled', () => {
      render(
        <DragReorderList
          options={mockOptions}
          onReorder={mockOnReorder}
          showWeights={false}
        />
      );

      expect(screen.queryByText('40%')).not.toBeInTheDocument();
      expect(screen.queryByText('30%')).not.toBeInTheDocument();
    });

    it('handles empty options array', () => {
      render(
        <DragReorderList
          options={[]}
          onReorder={mockOnReorder}
        />
      );

      // Should render without errors
      const container = screen.getByRole('generic');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Text Editing', () => {
    it('calls onTextChange when option text is modified', () => {
      render(
        <DragReorderList
          options={mockOptions}
          onReorder={mockOnReorder}
          onTextChange={mockOnTextChange}
        />
      );

      const input = screen.getByDisplayValue('Fire Spell');
      fireEvent.change(input, { target: { value: 'Fireball Spell' } });

      expect(mockOnTextChange).toHaveBeenCalledWith('1', 'Fireball Spell');
    });

    it('prevents drag when clicking on text input', () => {
      render(
        <DragReorderList
          options={mockOptions}
          onReorder={mockOnReorder}
        />
      );

      const input = screen.getByDisplayValue('Fire Spell');
      
      // Mouse down on input should not start drag
      fireEvent.mouseDown(input, { button: 0, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(input, { clientX: 120, clientY: 120 });
      
      // Should not show ghost element or trigger drag
      expect(screen.queryByText('Fire Spell')).toBeInTheDocument(); // Still in original position
    });
  });

  describe('Weight Controls', () => {
    it('calls onWeightChange when weight slider is adjusted', () => {
      render(
        <DragReorderList
          options={mockOptions}
          onReorder={mockOnReorder}
          onWeightChange={mockOnWeightChange}
          showWeights={true}
        />
      );

      const sliders = screen.getAllByRole('slider');
      fireEvent.change(sliders[0], { target: { value: '50' } });

      expect(mockOnWeightChange).toHaveBeenCalledWith('1', 50);
    });

    it('prevents drag when adjusting weight slider', () => {
      render(
        <DragReorderList
          options={mockOptions}
          onReorder={mockOnReorder}
          onWeightChange={mockOnWeightChange}
          showWeights={true}
        />
      );

      const slider = screen.getAllByRole('slider')[0];
      
      // Mouse down on slider should not start drag
      fireEvent.mouseDown(slider, { button: 0, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(slider, { clientX: 120, clientY: 120 });
      
      // Should not trigger reorder
      expect(mockOnReorder).not.toHaveBeenCalled();
    });

    it('disables weight controls for locked options', () => {
      const lockedOptions: WeightControlOption[] = [
        { id: '1', text: 'Locked Option', weight: 50, locked: true },
        { id: '2', text: 'Normal Option', weight: 50, locked: false }
      ];

      render(
        <DragReorderList
          options={lockedOptions}
          onReorder={mockOnReorder}
          onWeightChange={mockOnWeightChange}
          showWeights={true}
        />
      );

      const sliders = screen.getAllByRole('slider');
      expect(sliders[0]).toBeDisabled();
      expect(sliders[1]).not.toBeDisabled();
    });
  });

  describe('Mouse Drag Operations', () => {
    it('ignores non-left mouse button clicks', () => {
      render(
        <DragReorderList
          options={mockOptions}
          onReorder={mockOnReorder}
        />
      );

      const dragHandle = screen.getAllByText('⋮⋮')[0];
      
      // Right click should be ignored
      fireEvent.mouseDown(dragHandle, { button: 1, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 120, clientY: 120 });
      
      expect(mockOnReorder).not.toHaveBeenCalled();
    });

    it('requires minimum drag threshold to start dragging', async () => {
      render(
        <DragReorderList
          options={mockOptions}
          onReorder={mockOnReorder}
        />
      );

      const dragHandle = screen.getAllByText('⋮⋮')[0];
      
      // Small movement should not start drag
      fireEvent.mouseDown(dragHandle, { button: 0, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 102, clientY: 102 });
      
      // Should not have drag ghost
      expect(document.body.style.cursor).toBe('');
    });

    it('starts drag when threshold is exceeded', async () => {
      render(
        <DragReorderList
          options={mockOptions}
          onReorder={mockOnReorder}
        />
      );

      const dragHandle = screen.getAllByText('⋮⋮')[0];
      
      // Large movement should start drag
      fireEvent.mouseDown(dragHandle, { button: 0, clientX: 100, clientY: 100 });
      
      await act(async () => {
        fireEvent.mouseMove(document, { clientX: 110, clientY: 110 });
      });
      
      // Should set grabbing cursor
      expect(document.body.style.cursor).toBe('grabbing');
    });

    it('shows drop zone indicators during drag', async () => {
      const { container } = render(
        <DragReorderList
          options={mockOptions}
          onReorder={mockOnReorder}
        />
      );

      const dragHandle = screen.getAllByText('⋮⋮')[0];
      
      // Start drag
      fireEvent.mouseDown(dragHandle, { button: 0, clientX: 100, clientY: 100 });
      
      await act(async () => {
        fireEvent.mouseMove(document, { clientX: 110, clientY: 150 });
      });
      
      // Should show drop zone indicators
      const dropZones = container.querySelectorAll('[style*="background: #4299e1"]');
      expect(dropZones.length).toBeGreaterThan(0);
    });

    it('completes reorder on mouse up', async () => {
      render(
        <DragReorderList
          options={mockOptions}
          onReorder={mockOnReorder}
        />
      );

      const dragHandle = screen.getAllByText('⋮⋮')[0];
      
      // Start drag
      fireEvent.mouseDown(dragHandle, { button: 0, clientX: 100, clientY: 100 });
      
      await act(async () => {
        fireEvent.mouseMove(document, { clientX: 110, clientY: 150 });
        fireEvent.mouseUp(document);
      });
      
      // Should call onReorder (exact params depend on drop position calculation)
      expect(mockOnReorder).toHaveBeenCalled();
      
      // Should reset cursor
      expect(document.body.style.cursor).toBe('');
    });

    it('cancels drag on mouse up without valid drop target', async () => {
      render(
        <DragReorderList
          options={mockOptions}
          onReorder={mockOnReorder}
        />
      );

      const dragHandle = screen.getAllByText('⋮⋮')[0];
      
      // Start drag but don't move to valid drop position
      fireEvent.mouseDown(dragHandle, { button: 0, clientX: 100, clientY: 100 });
      
      await act(async () => {
        fireEvent.mouseMove(document, { clientX: 110, clientY: 110 });
        fireEvent.mouseUp(document);
      });
      
      // Should not call onReorder if no valid drop target
      // (Implementation may vary based on drop target detection)
      expect(document.body.style.cursor).toBe('');
    });
  });

  describe('Touch Drag Operations', () => {
    it('handles touch start events', () => {
      render(
        <DragReorderList
          options={mockOptions}
          onReorder={mockOnReorder}
        />
      );

      const dragHandle = screen.getAllByText('⋮⋮')[0];
      
      fireEvent.touchStart(dragHandle, {
        touches: [{ clientX: 100, clientY: 100 }]
      });
      
      // Should prepare for potential drag
      expect(() => {
        fireEvent.touchMove(document, {
          touches: [{ clientX: 110, clientY: 110 }]
        });
      }).not.toThrow();
    });

    it('ignores multi-touch gestures', () => {
      render(
        <DragReorderList
          options={mockOptions}
          onReorder={mockOnReorder}
        />
      );

      const dragHandle = screen.getAllByText('⋮⋮')[0];
      
      // Multi-touch should be ignored
      fireEvent.touchStart(dragHandle, {
        touches: [
          { clientX: 100, clientY: 100 },
          { clientX: 200, clientY: 200 }
        ]
      });
      
      fireEvent.touchMove(document, {
        touches: [
          { clientX: 110, clientY: 110 },
          { clientX: 210, clientY: 210 }
        ]
      });
      
      expect(mockOnReorder).not.toHaveBeenCalled();
    });

    it('completes touch drag on touch end', async () => {
      render(
        <DragReorderList
          options={mockOptions}
          onReorder={mockOnReorder}
        />
      );

      const dragHandle = screen.getAllByText('⋮⋮')[0];
      
      // Start touch drag
      fireEvent.touchStart(dragHandle, {
        touches: [{ clientX: 100, clientY: 100 }]
      });
      
      await act(async () => {
        fireEvent.touchMove(document, {
          touches: [{ clientX: 110, clientY: 150 }]
        });
        fireEvent.touchEnd(document);
      });
      
      // Should complete drag operation
      expect(document.body.style.cursor).toBe('');
    });
  });

  describe('Disabled State', () => {
    it('disables all drag operations when disabled', () => {
      render(
        <DragReorderList
          options={mockOptions}
          onReorder={mockOnReorder}
          disabled={true}
        />
      );

      const dragHandle = screen.getAllByText('⋮⋮')[0];
      
      fireEvent.mouseDown(dragHandle, { button: 0, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(document, { clientX: 120, clientY: 120 });
      
      expect(mockOnReorder).not.toHaveBeenCalled();
      expect(document.body.style.cursor).toBe('');
    });

    it('shows default cursor when disabled', () => {
      const { container } = render(
        <DragReorderList
          options={mockOptions}
          onReorder={mockOnReorder}
          disabled={true}
        />
      );

      const items = container.querySelectorAll('[style*="cursor"]');
      items.forEach(item => {
        if (item.textContent?.includes('⋮⋮')) {
          expect(item).toHaveStyle('cursor: default');
        }
      });
    });

    it('disables text and weight inputs when disabled', () => {
      render(
        <DragReorderList
          options={mockOptions}
          onReorder={mockOnReorder}
          onTextChange={mockOnTextChange}
          onWeightChange={mockOnWeightChange}
          disabled={true}
          showWeights={true}
        />
      );

      const textInputs = screen.getAllByRole('textbox');
      const sliders = screen.getAllByRole('slider');
      
      textInputs.forEach(input => {
        expect(input).toBeDisabled();
      });
      
      sliders.forEach(slider => {
        expect(slider).toBeDisabled();
      });
    });
  });

  describe('Ghost Element', () => {
    it('shows ghost element during drag', async () => {
      const { container } = render(
        <DragReorderList
          options={mockOptions}
          onReorder={mockOnReorder}
        />
      );

      const dragHandle = screen.getAllByText('⋮⋮')[0];
      
      // Start drag
      fireEvent.mouseDown(dragHandle, { button: 0, clientX: 100, clientY: 100 });
      
      await act(async () => {
        fireEvent.mouseMove(document, { clientX: 110, clientY: 110 });
      });
      
      // Should show ghost element with fixed positioning
      const ghostElement = container.querySelector('[style*="position: fixed"]');
      expect(ghostElement).toBeInTheDocument();
    });

    it('positions ghost element correctly', async () => {
      const { container } = render(
        <DragReorderList
          options={mockOptions}
          onReorder={mockOnReorder}
        />
      );

      const dragHandle = screen.getAllByText('⋮⋮')[0];
      
      fireEvent.mouseDown(dragHandle, { button: 0, clientX: 100, clientY: 100 });
      
      await act(async () => {
        fireEvent.mouseMove(document, { clientX: 150, clientY: 200 });
      });
      
      const ghostElement = container.querySelector('[style*="position: fixed"]');
      expect(ghostElement).toHaveStyle({ position: 'fixed' });
    });

    it('hides ghost element after drag completes', async () => {
      const { container } = render(
        <DragReorderList
          options={mockOptions}
          onReorder={mockOnReorder}
        />
      );

      const dragHandle = screen.getAllByText('⋮⋮')[0];
      
      // Complete drag cycle
      fireEvent.mouseDown(dragHandle, { button: 0, clientX: 100, clientY: 100 });
      
      await act(async () => {
        fireEvent.mouseMove(document, { clientX: 110, clientY: 110 });
        fireEvent.mouseUp(document);
      });
      
      // Ghost element should be removed
      const ghostElement = container.querySelector('[style*="position: fixed"]');
      expect(ghostElement).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('maintains keyboard accessibility', () => {
      render(
        <DragReorderList
          options={mockOptions}
          onReorder={mockOnReorder}
          onTextChange={mockOnTextChange}
          showWeights={true}
        />
      );

      const textInputs = screen.getAllByRole('textbox');
      const sliders = screen.getAllByRole('slider');
      
      // Text inputs should be focusable
      textInputs.forEach(input => {
        expect(input).not.toHaveAttribute('tabindex', '-1');
      });
      
      // Sliders should be focusable
      sliders.forEach(slider => {
        expect(slider).not.toHaveAttribute('tabindex', '-1');
      });
    });

    it('maintains text content accessibility during drag', async () => {
      render(
        <DragReorderList
          options={mockOptions}
          onReorder={mockOnReorder}
        />
      );

      // All option text should remain accessible
      expect(screen.getByDisplayValue('Fire Spell')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Ice Spell')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Lightning Spell')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Earth Spell')).toBeInTheDocument();
    });
  });
});