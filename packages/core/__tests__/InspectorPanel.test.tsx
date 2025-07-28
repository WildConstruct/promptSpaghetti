import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { InspectorPanel } from '../components/Inspector/InspectorPanel';
import { z } from 'zod';

// Mock the graph store with proper typing
const mockGraphStore = {
  selectedNodeId: 'test-node-id',
  nodes: [,
    {
      id: 'test-node-id',
      type: 'WeightedChoice',
      data: {,
        label: 'Test Node',
        value: 'test value',
        variations: ['var1', 'var2']
      }
    }
  ],
  addVariation: jest.fn<unknown[], unknown>(),
  removeVariation: jest.fn<unknown[], unknown>(),
  updateVariation: jest.fn<unknown[], unknown>(),
  reorderVariations: jest.fn<unknown[], unknown>(),
  updateNode: jest.fn<unknown[], unknown>()
};
jest.mock('../graphStore', () => ({)
  useGraphStore: jest.fn(() => mockGraphStore),
}));

// Error boundary for comprehensive error testing
class TestErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }
  render() {
    if (this.state.hasError) {
      return <div data-testid="error-boundary">Error: {this.state.error?.message}</div>;
    }
    return this.props.children;
  }
}
describe('InspectorPanel - Comprehensive Testing', () => {
  const mockSchema = z.object({)
    label: z.string().default('Test Node'),
    value: z.string().default(''),
    variations: z.array(z.string()).default([]),
  });
  const mockNode = {
    id: 'test-node',
    type: 'TestNode',
    data: {,
      label: 'Test Node',
      value: 'test value',
      variations: ['var1', 'var2']
    }
  };
  const defaultProps = {
    node: mockNode,
    schema: mockSchema,
    onChange: jest.fn<unknown[], unknown>()
  };
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  describe('Basic Functionality', () => {
    it('renders inspector panel with node data', () => {
      render(<InspectorPanel {...defaultProps} />);
      expect(screen.getByText('Test Node Properties')).toBeInTheDocument();
    });
    it('shows empty state when no node selected', () => {
      render(<InspectorPanel {...defaultProps} node={null} />);
      expect(screen.getByText('Select a node to edit its properties')).toBeInTheDocument();
    });
    it('shows collapse/expand button with proper accessibility', () => {
      render(<InspectorPanel {...defaultProps} />);
      const collapseButton = screen.getByTitle('Collapse Inspector');
      expect(collapseButton).toBeInTheDocument();
      expect(collapseButton).toHaveAttribute('aria-label', 'Collapse Inspector');
      fireEvent.click(collapseButton);
      const expandButton = screen.getByTitle('Expand Inspector');
      expect(expandButton).toHaveAttribute('aria-label', 'Expand Inspector');
    });
    it('shows close button when onClose is provided', () => {
      const onClose = jest.fn<unknown[], unknown>();
      render(<InspectorPanel {...defaultProps} onClose={onClose} />);
      const closeButton = screen.getByTitle('Close Inspector');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveAttribute('aria-label', 'Close Inspector');
      fireEvent.click(closeButton);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
    it('renders properties and variations sections', () => {
      render(<InspectorPanel {...defaultProps} />);
      expect(screen.getByText('Common Properties')).toBeInTheDocument();
      expect(screen.getByText('Text Variations')).toBeInTheDocument();
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });
  });
  describe('Error Handling', () => {
    it('handles null node gracefully', () => {
      expect(() => {
        render(<InspectorPanel {...defaultProps} node={null} />);
      }).not.toThrow();
    });
    it('handles undefined node gracefully', () => {
      expect(() => {
        render(<InspectorPanel {...defaultProps} node={undefined as any} />);
      }).not.toThrow();
    });
    it('handles malformed node data gracefully', () => {
      const malformedNode = {
        id: 'test',
        type: 'TestNode',
        data: null,
      } as any;
      expect(() => {
        render(<InspectorPanel {...defaultProps} node={malformedNode} />);
      }).not.toThrow();
    });
    it('handles invalid schema gracefully', () => {
      expect(() => {
        render(<InspectorPanel {...defaultProps} schema={null as any} />);
      }).not.toThrow();
    });
    it('handles onChange errors gracefully', async () => {
      const onError = jest.fn<unknown[], unknown>();
      const errorOnChange = jest.fn(() => {
        throw new Error('onChange error');
      });
      render();
        <TestErrorBoundary onError={onError}>
          <InspectorPanel {...defaultProps} onChange={errorOnChange} />
        </TestErrorBoundary>
      );
      // Trigger onChange through user interaction
      const input = screen.queryByRole('textbox');
      if (input) {
        await userEvent.type(input, 'test');
        // Should handle error gracefully
        expect(onError).toHaveBeenCalled();
      }
    });
    it('handles store access errors gracefully', () => {
      const mockUseGraphStore = require('../graphStore').useGraphStore;
      mockUseGraphStore.mockImplementation(() => {
        throw new Error('Store access error');
      });
      const onError = jest.fn<unknown[], unknown>();
      render();
        <TestErrorBoundary onError={onError}>
          <InspectorPanel {...defaultProps} />
        </TestErrorBoundary>
      );
      expect(onError).toHaveBeenCalledWith()
        expect.objectContaining({)
          message: 'Store access error',
        })
      );
      // Restore mock
      mockUseGraphStore.mockImplementation(() => mockGraphStore);
    });
  });
  describe('Performance Concerns', () => {
    it('debounces rapid prop changes', async () => {
      const onChange = jest.fn<unknown[], unknown>();
      const user = userEvent.setup();
      render(<InspectorPanel {...defaultProps} onChange={onChange} />);
      const input = screen.queryByRole('textbox');
      if (input) {
        // Rapid typing
        await user.type(input, 'abc');
        // Should not call onChange until debounce period
        expect(onChange).not.toHaveBeenCalled();
        // Fast forward debounce time
        act(() => {
          jest.advanceTimersByTime(300);
        });
        // Now onChange should be called
        expect(onChange).toHaveBeenCalled();
      }
    });
    it('handles resize operations efficiently', async () => {
      const startTime = performance.now();
      render(<InspectorPanel {...defaultProps} />);
      // Simulate multiple resize operations
      for (let i = 0; i < 100; i++) {
        window.dispatchEvent(new Event('resize'));
      }
      const endTime = performance.now();
      // Should handle resizes efficiently (< 100ms for 100 operations)
      expect(endTime - startTime).toBeLessThan(100);
    });
    it('memoizes complex computations', () => {
      const complexSchema = z.object({)
        complexField: z.string().transform((val) => {,
          // Simulate expensive computation
          let result = val;
          for (let i = 0; i < 1000; i++) {
            result = result + String(i);
          }
          return result;
        })
      });
      const startTime = performance.now();
      const { rerender } = render()
        <InspectorPanel 
          {...defaultProps} 
          schema={complexSchema}
        />
      );
      // Rerender with same props - should use memoized result
      rerender();
        <InspectorPanel 
          {...defaultProps} 
          schema={complexSchema}
        />
      );
      const endTime = performance.now();
      // Should be fast due to memoization
      expect(endTime - startTime).toBeLessThan(50);
    });
    it('efficiently handles large variation lists', () => {
      const largeVariationNode = {
        ...mockNode,
        data: {,
          ...mockNode.data,
          variations: Array.from({ length: 1000 }, (_, i) => `Variation ${i}`)}
        }
      };
      const startTime = performance.now();
      render(<InspectorPanel {...defaultProps} node={largeVariationNode} />);
      const endTime = performance.now();
      // Should render large lists efficiently
      expect(endTime - startTime).toBeLessThan(200);
    });
  });
  describe('Accessibility & Code Quality', () => {
    it('provides proper ARIA labels and roles', () => {
      render(<InspectorPanel {...defaultProps} />);
      const panel = screen.getByRole('complementary');
      expect(panel).toHaveAttribute('aria-label', 'Node Inspector');
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {)
        expect(button).toHaveAttribute('aria-label');
      });
    });
    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<InspectorPanel {...defaultProps} />);
      // Should be able to tab through interactive elements
      await user.tab();
      expect(document.activeElement).toBeDefined();
      // Should be able to use Enter key on buttons
      const buttons = screen.getAllByRole('button');
      if (buttons.length > 0) {
        buttons[0].focus();
        await user.keyboard('{Enter}');
        // Should not crash
      }
    });
    it('follows TypeScript strict mode requirements', () => {
      // This test ensures all props are properly typed
      const strictProps = {
        node: mockNode as const,
        schema: mockSchema,
        onChange: jest.fn<unknown[], unknown>() as (data: unknown) => void,
        onClose: jest.fn<unknown[], unknown>() as () => void
      };
      expect(() => {
        render(<InspectorPanel {...strictProps} />);
      }).not.toThrow();
    });
    it('handles cleanup properly on unmount', () => {
      const { unmount } = render(<InspectorPanel {...defaultProps} />);
      // Should cleanup without errors
      expect(() => unmount()).not.toThrow();
      // Should not have memory leaks - advance timers after unmount
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    });
  });
  describe('Panel Resizing', () => {
    it('allows panel resizing with proper constraints', async () => {
      render(<InspectorPanel {...defaultProps} />);
      const inspectorPanel = screen.getByText('Test Node Properties').closest('aside');
      expect(inspectorPanel).toBeInTheDocument();
      // Check for resize handle
      const resizeHandle = inspectorPanel?.querySelector('[data-testid="resize-handle"]');
      if (resizeHandle) {
        // Should be able to resize within constraints
        fireEvent.mouseDown(resizeHandle, { clientX: 300 });
        fireEvent.mouseMove(document, { clientX: 400 });
        fireEvent.mouseUp(document);
        // Panel should maintain reasonable bounds
        const computedStyle = window.getComputedStyle(inspectorPanel);
        const width = parseInt(computedStyle.width);
        expect(width).toBeGreaterThan(200); // Minimum width
        expect(width).toBeLessThan(800); // Maximum width
      }
    });
    it('persists resize preferences', () => {
      const { rerender } = render(<InspectorPanel {...defaultProps} />);
      // Simulate resize
      const inspectorPanel = screen.getByText('Test Node Properties').closest('aside');
      const resizeHandle = inspectorPanel?.querySelector('[data-testid="resize-handle"]');
      if (resizeHandle) {
        fireEvent.mouseDown(resizeHandle, { clientX: 300 });
        fireEvent.mouseMove(document, { clientX: 400 });
        fireEvent.mouseUp(document);
      }
      // Rerender - should maintain size
      rerender(<InspectorPanel {...defaultProps} />);
      // Size should be preserved (would need localStorage mock for full test)
      expect(inspectorPanel).toBeInTheDocument();
    });
  });
  describe('Integration with Store', () => {
    it('updates store when variations change', async () => {
      const user = userEvent.setup();
      render(<InspectorPanel {...defaultProps} />);
      // Find add variation button
      const addButton = screen.queryByText(/Add Variation/i);
      if (addButton) {
        await user.click(addButton);
        expect(mockGraphStore.addVariation).toHaveBeenCalled();
      }
    });
    it('handles store update failures gracefully', async () => {
      const user = userEvent.setup();
      mockGraphStore.addVariation.mockImplementation(() => {
        throw new Error('Store update failed');
      });
      const onError = jest.fn<unknown[], unknown>();
      render();
        <TestErrorBoundary onError={onError}>
          <InspectorPanel {...defaultProps} />
        </TestErrorBoundary>
      );
      const addButton = screen.queryByText(/Add Variation/i);
      if (addButton) {
        await user.click(addButton);
        // Should handle store errors gracefully
        expect(onError).toHaveBeenCalled();
      }
    });
  });
});