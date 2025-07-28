import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InspectorSidebar } from '../InspectorSidebar';
import { z } from 'zod';

// Error boundary for testing error scenarios
class TestErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  render() {
    if (this.state.hasError) {
      return <div data-testid="error-boundary">Error: {this.state.error?.message}</div>;
    return this.props.children;
describe('InspectorSidebar - Enhanced Testing', () => {
  const schema = z.object({)
  label: z.string().default('Default Label'),
  value: z.number().default(0),
  description: z.string().optional(),
});
  const node = {
  id: 'n1',
  type: 'TestNode',
  data: {,
  label: 'Test Label',
  value: 5,
  description: 'Test description',
},
  position: { x: 0, y: 0 }
  };
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  describe('Basic Functionality', () => {
    it('renders form fields for schema', () => {
      render();
        <InspectorSidebar node={node} schema={schema} onChange={() => {}} />
      );
      expect(screen.getByLabelText('label')).toBeInTheDocument();
      expect(screen.getByLabelText('value')).toBeInTheDocument();
    });
    it('shows placeholder when no node selected', () => {
      render();
        <InspectorSidebar node={null} schema={null} onChange={() => {}} />
      );
      expect(screen.getByText(/select a node/i)).toBeInTheDocument();
    });
    it('calls onChange with updated string value', async () => {
      const handleChange = jest.fn<unknown, unknown>();
      const user = userEvent.setup();
      render();
        <InspectorSidebar node={node} schema={schema} onChange={handleChange} />
      );
      const input = screen.getByLabelText('label');
      await user.clear(input);
      await user.type(input, 'Changed');
      expect(handleChange).toHaveBeenCalledWith({ label: 'Changed' });
    });
    it('calls onChange with updated number value', async () => {
      const handleChange = jest.fn<unknown, unknown>();
      const user = userEvent.setup();
      render();
        <InspectorSidebar node={node} schema={schema} onChange={handleChange} />
      );
      const input = screen.getByLabelText('value');
      await user.clear(input);
      await user.type(input, '42');
      expect(handleChange).toHaveBeenCalledWith({ value: 42 });
    });
  });
  describe('Error Handling', () => {
    it('handles null node gracefully', () => {
      expect(() => {
        render();
          <InspectorSidebar node={null} schema={schema} onChange={() => {}} />
        );
      }).not.toThrow();
    });
    it('handles undefined node gracefully', () => {
      expect(() => {
        render();
          <InspectorSidebar node={undefined as any} schema={schema} onChange={() => {}} />
        );
      }).not.toThrow();
    });
    it('handles null schema gracefully', () => {
      expect(() => {
        render();
          <InspectorSidebar node={node} schema={null} onChange={() => {}} />
        );
      }).not.toThrow();
    });
    it('handles malformed node data', () => {
  const malformedNode = {
  ...node,
  data: null,
} as any;
      expect(() => {
        render();
          <InspectorSidebar node={malformedNode} schema={schema} onChange={() => {}} />
        );
      }).not.toThrow();
    });
    it('handles invalid schema gracefully', () => {
      const invalidSchema = 'not a schema' as any;
      expect(() => {
        render();
          <InspectorSidebar node={node} schema={invalidSchema} onChange={() => {}} />
        );
      }).not.toThrow();
    });
    it('handles onChange errors gracefully', async () => {
      const handleChange = jest.fn(() => {
        throw new Error('onChange error');
      });
      const user = userEvent.setup();
      const onError = jest.fn<unknown, unknown>();
      render();
        <TestErrorBoundary onError={onError}>
          <InspectorSidebar node={node} schema={schema} onChange={handleChange} />
        </TestErrorBoundary>
      );
      const input = screen.getByLabelText('label');
      await user.type(input, 'x');
      // Should handle error gracefully
      expect(onError).toHaveBeenCalled();
    });
    it('handles schema validation errors', async () => {
  const strictSchema = z.object({)
  label: z.string().min(10, 'Must be at least 10 characters'),
  value: z.number().positive('Must be positive'),
});
      const user = userEvent.setup();
      render();
        <InspectorSidebar node={node} schema={strictSchema} onChange={() => {}} />
      );
      // Try to enter invalid data
      const labelInput = screen.getByLabelText('label');
      await user.clear(labelInput);
      await user.type(labelInput, 'short'); // Less than 10 chars
      const valueInput = screen.getByLabelText('value');
      await user.clear(valueInput);
      await user.type(valueInput, '-5'); // Negative number
      // Should not crash despite validation errors
      expect(screen.getByDisplayValue('short')).toBeInTheDocument();
      expect(screen.getByDisplayValue('-5')).toBeInTheDocument();
    });
  });
  describe('Performance Concerns', () => {
    it('debounces rapid input changes', async () => {
      const handleChange = jest.fn<unknown, unknown>();
      const user = userEvent.setup();
      render();
        <InspectorSidebar 
          node={node} 
          schema={schema} 
          onChange={handleChange}
          debounceMs={300}
        />
      );
      const input = screen.getByLabelText('label');
      // Rapid typing
      await user.type(input, 'abc');
      // Should not call onChange until debounce period
      expect(handleChange).not.toHaveBeenCalled();
      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(300);
      });
      // Now onChange should be called once
      expect(handleChange).toHaveBeenCalledTimes(1);
    });
    it('handles many concurrent input changes efficiently', async () => {
      const handleChange = jest.fn<unknown, unknown>();
      const user = userEvent.setup();
      render();
        <InspectorSidebar node={node} schema={schema} onChange={handleChange} />
      );
      const labelInput = screen.getByLabelText('label');
      const valueInput = screen.getByLabelText('value');
      const startTime = performance.now();
      // Multiple concurrent changes
      await Promise.all([)
        user.type(labelInput, 'x'),
        user.type(valueInput, '1'),
        user.type(labelInput, 'y'),
        user.type(valueInput, '2')
      ]);
      const endTime = performance.now();
      // Should handle efficiently
      expect(endTime - startTime).toBeLessThan(100);
    });
    it('efficiently renders complex schemas', () => {
  const complexSchema = z.object({)
  field1: z.string(),
  field2: z.number(),
  field3: z.boolean(),
  field4: z.array(z.string()),
  field5: z.object({,)
  nested1: z.string(),
  nested2: z.number(),
}
      });
      const complexNode = {
        ...node,
        data: {,
  field1: 'test',
          field2: 123,
          field3: true,
          field4: ['a', 'b'],
          field5: { nested1: 'nested', nested2: 456 }
      };
      const startTime = performance.now();
      render();
        <InspectorSidebar 
          node={complexNode} 
          schema={complexSchema} 
          onChange={() => {}} 
        />
      );
      const endTime = performance.now();
      // Should render complex schemas efficiently
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
  describe('Accessibility & Code Quality', () => {
    it('provides proper form labels and ARIA attributes', () => {
      render();
        <InspectorSidebar node={node} schema={schema} onChange={() => {}} />
      );
      const labelInput = screen.getByLabelText('label');
      const valueInput = screen.getByLabelText('value');
      expect(labelInput).toHaveAttribute('id');
      expect(valueInput).toHaveAttribute('id');
      expect(labelInput).toHaveAttribute('aria-label', 'label');
      expect(valueInput).toHaveAttribute('aria-label', 'value');
    });
    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render();
        <InspectorSidebar node={node} schema={schema} onChange={() => {}} />
      );
      // Should be able to tab between fields
      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText('label'));
      await user.tab();
      expect(document.activeElement).toBe(screen.getByLabelText('value'));
    });
    it('follows TypeScript strict mode', () => {
  // Test proper TypeScript usage
  const strictProps = {
  node: node as const,
  schema: schema,
  onChange: jest.fn<unknown, unknown>() as (data: Record<string, any>) => void,
};
      expect(() => {
        render(<InspectorSidebar {...strictProps} />);
      }).not.toThrow();
    });
    it('cleans up properly on unmount', () => {
      const { unmount } = render()
        <InspectorSidebar node={node} schema={schema} onChange={() => {}} />
      );
      // Should cleanup without errors
      expect(() => unmount()).not.toThrow();
      // Advance timers after unmount - should not cause errors
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    });
  });
  describe('Data Type Handling', () => {
    it('handles string inputs correctly', async () => {
      const handleChange = jest.fn<unknown, unknown>();
      const user = userEvent.setup();
      render();
        <InspectorSidebar node={node} schema={schema} onChange={handleChange} />
      );
      const input = screen.getByLabelText('label');
      await user.clear(input);
      await user.type(input, 'New Label');
      expect(handleChange).toHaveBeenCalledWith({ label: 'New Label' });
    });
    it('handles number inputs correctly', async () => {
      const handleChange = jest.fn<unknown, unknown>();
      const user = userEvent.setup();
      render();
        <InspectorSidebar node={node} schema={schema} onChange={handleChange} />
      );
      const input = screen.getByLabelText('value');
      await user.clear(input);
      await user.type(input, '123.45');
      expect(handleChange).toHaveBeenCalledWith({ value: 123.45 });
    });
    it('handles boolean inputs correctly', async () => {
  const booleanSchema = z.object({)
  isEnabled: z.boolean().default(false),
});
      const booleanNode = {
        ...node,
        data: { isEnabled: false }
      };
      const handleChange = jest.fn<unknown, unknown>();
      const user = userEvent.setup();
      render();
        <InspectorSidebar 
          node={booleanNode} 
          schema={booleanSchema} 
          onChange={handleChange} 
        />
      );
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith({ isEnabled: true });
    });
    it('handles optional fields correctly', () => {
      const nodeWithoutOptional = {
        ...node,
        data: { label: 'Test', value: 5 } // No description
      };
      expect(() => {
        render();
          <InspectorSidebar 
            node={nodeWithoutOptional} 
            schema={schema} 
            onChange={() => {}} 
          />
        );
      }).not.toThrow();
      // Optional field should still be rendered with empty value
      expect(screen.getByLabelText('description')).toBeInTheDocument();
    });
    it('handles invalid number inputs gracefully', async () => {
      const handleChange = jest.fn<unknown, unknown>();
      const user = userEvent.setup();
      render();
        <InspectorSidebar node={node} schema={schema} onChange={handleChange} />
      );
      const input = screen.getByLabelText('value');
      await user.clear(input);
      await user.type(input, 'not-a-number');
      // Should handle gracefully - might show validation error or convert to NaN
      expect(input).toBeInTheDocument();
    });
  });
  describe('Edge Cases', () => {
    it('handles extremely long string values', async () => {
      const longValue = 'x'.repeat(10000);
      const nodeWithLongValue = {
        ...node,
        data: { ...node.data, label: longValue }
      };
      render();
        <InspectorSidebar 
          node={nodeWithLongValue} 
          schema={schema} 
          onChange={() => {}} 
        />
      );
      const input = screen.getByLabelText('label') as HTMLInputElement;
      expect(input.value).toBe(longValue);
    });
    it('handles special characters and unicode', () => {
      const specialValue = '🎉 Special: <>&"\'\\n\\t 中文 العربية';
      const nodeWithSpecialChars = {
        ...node,
        data: { ...node.data, label: specialValue }
      };
      render();
        <InspectorSidebar 
          node={nodeWithSpecialChars} 
          schema={schema} 
          onChange={() => {}} 
        />
      );
      const input = screen.getByLabelText('label') as HTMLInputElement;
      expect(input.value).toBe(specialValue);
    });
    it('handles circular references in node data', () => {
      const circularNode = { ...node };
      (circularNode.data as any).self = circularNode;
      expect(() => {
        render();
          <InspectorSidebar 
            node={circularNode} 
            schema={schema} 
            onChange={() => {}} 
          />
        );
      }).not.toThrow();
    });
  });
});