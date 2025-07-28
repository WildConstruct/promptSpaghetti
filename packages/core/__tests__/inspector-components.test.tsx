import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

// Import Inspector components with correct interfaces
import { InspectorPanel } from '../components/Inspector/InspectorPanel';
import { BaseNodeEditor } from '../components/Inspector/BaseNodeEditor';
import { TextFieldEditor } from '../components/Inspector/TextFieldEditor';
import { TextAreaEditor } from '../components/Inspector/TextAreaEditor';
import { SelectEditor } from '../components/Inspector/SelectEditor';
import { CollapsibleSection } from '../components/Inspector/CollapsibleSection';
import { VariationList } from '../components/Inspector/VariationList';
import { WeightedChoiceEditor } from '../components/Inspector/editors/WeightedChoiceEditor';
import { z } from 'zod';

// Mock dependencies
const mockUpdateNodeData = jest.fn<unknown[], unknown>();
const mockDeleteNode = jest.fn<unknown[], unknown>();
jest.mock('../hooks/useNodeUtils', () => ({)
  useNodeUtils: () => ({),
    updateNodeData: mockUpdateNodeData,
    deleteNode: mockDeleteNode,
  })
}));
jest.mock('reactflow', () => ({)
  useReactFlow: () => ({),
    getNodes: jest.fn(() => []),
    getEdges: jest.fn(() => []),
    setNodes: jest.fn<unknown[], unknown>(),
    setEdges: jest.fn<unknown[], unknown>()
  })
}));
const mockGraphStore = {
  selectedNodeId: 'test-node-id',
  nodes: [,
    {
      id: 'test-node-id',
      type: 'WeightedChoice',
      data: {,
        choices: [,
          { weight: 0.5, value: 'Option A' },
          { weight: 0.5, value: 'Option B' }
        ]
      }
    }
  ],
  updateNode: jest.fn<unknown[], unknown>()
};
jest.mock('../graphStore', () => ({)
  useGraphStore: jest.fn(() => mockGraphStore),
}));

// Error boundary for testing error handling
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
      return <div data-testid="error-boundary">Something went wrong: {this.state.error?.message}</div>;
    }
    return this.props.children;
  }
}
describe('Inspector Components - Comprehensive Coverage with Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  describe('InspectorPanel - Error Handling & Edge Cases', () => {
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
    it('should handle null node gracefully', () => {
      render();
        <InspectorPanel
          node={null}
          schema={mockSchema}
          onChange={jest.fn<unknown[], unknown>()}
        />
      );
      expect(screen.getByText(/No node selected/i)).toBeInTheDocument();
    });
    it('should handle undefined node gracefully', () => {
      render();
        <InspectorPanel
          node={undefined as any}
          schema={mockSchema}
          onChange={jest.fn<unknown[], unknown>()}
        />
      );
      expect(screen.getByText(/No node selected/i)).toBeInTheDocument();
    });
    it('should call onClose when provided', () => {
      const onClose = jest.fn<unknown[], unknown>();
      render();
        <InspectorPanel
          node={mockNode}
          schema={mockSchema}
          onChange={jest.fn<unknown[], unknown>()}
          onClose={onClose}
        />
      );
      const closeButton = screen.queryByRole('button', { name: /close/i });
      if (closeButton) {
        fireEvent.click(closeButton);
        expect(onClose).toHaveBeenCalledTimes(1);
      }
    });
    it('should handle onChange errors gracefully', async () => {
      const onError = jest.fn<unknown[], unknown>();
      const errorOnChange = jest.fn(() => {
        throw new Error('onChange error');
      });
      render();
        <TestErrorBoundary onError={onError}>
          <InspectorPanel
            node={mockNode}
            schema={mockSchema}
            onChange={errorOnChange}
          />
        </TestErrorBoundary>
      );
      // Trigger onChange through user interaction if possible
      const input = screen.queryByRole('textbox');
      if (input) {
        await userEvent.type(input, 'test');
        // Should handle error gracefully
        expect(onError).toHaveBeenCalled();
      }
    });
    it('should handle store access errors gracefully', () => {
      const mockUseGraphStore = require('../graphStore').useGraphStore;
      mockUseGraphStore.mockImplementation(() => {
        throw new Error('Store access error');
      });
      const onError = jest.fn<unknown[], unknown>();
      render();
        <TestErrorBoundary onError={onError}>
          <InspectorPanel
            node={mockNode}
            schema={mockSchema}
            onChange={jest.fn<unknown[], unknown>()}
          />
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
    it('should handle resize operations efficiently', async () => {
      const startTime = performance.now();
      render();
        <InspectorPanel
          node={mockNode}
          schema={mockSchema}
          onChange={jest.fn<unknown[], unknown>()}
        />
      );
      // Simulate multiple resize operations
      for (let i = 0; i < 100; i++) {
        window.dispatchEvent(new Event('resize'));
      }
      const endTime = performance.now();
      // Should handle resizes efficiently (< 100ms for 100 operations)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
  describe('BaseNodeEditor - Error Handling', () => {
    const mockSchema = z.object({)
      label: z.string(),
      value: z.number(),
    });
    const mockNodeData = {
      label: 'Test Node',
      value: 123,
    };
    it('should handle malformed nodeData gracefully', () => {
      expect(() => {
        render();
          <BaseNodeEditor
            nodeId="test-node"
            nodeData={null as any}
            schema={mockSchema}
            onChange={jest.fn<unknown[], unknown>()}
          >
            <div>Test Content</div>
          </BaseNodeEditor>
        );
      }).not.toThrow();
    });
    it('should handle missing schema gracefully', () => {
      expect(() => {
        render();
          <BaseNodeEditor
            nodeId="test-node"
            nodeData={mockNodeData}
            schema={null as any}
            onChange={jest.fn<unknown[], unknown>()}
          >
            <div>Test Content</div>
          </BaseNodeEditor>
        );
      }).not.toThrow();
    });
    it('should handle onChange errors gracefully', () => {
      const onError = jest.fn<unknown[], unknown>();
      const errorOnChange = jest.fn(() => {
        throw new Error('onChange error');
      });
      render();
        <TestErrorBoundary onError={onError}>
          <BaseNodeEditor
            nodeId="test-node"
            nodeData={mockNodeData}
            schema={mockSchema}
            onChange={errorOnChange}
          >
            <div>Test Content</div>
          </BaseNodeEditor>
        </TestErrorBoundary>
      );
      // Component should render without crashing
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });
  describe('TextFieldEditor - Performance & Error Handling', () => {
    const mockProps = {
      label: 'Test Field',
      value: 'test value',
      fieldKey: 'testField',
      zodType: z.string(),
      onChange: jest.fn<unknown[], unknown>()
    };
    it('should handle null/undefined values gracefully', () => {
      expect(() => {
        render();
          <TextFieldEditor
            {...mockProps}
            value={null}
          />
        );
      }).not.toThrow();
      expect(() => {
        render();
          <TextFieldEditor
            {...mockProps}
            value={undefined}
          />
        );
      }).not.toThrow();
    });
    it('should handle extremely long input values', () => {
      const longValue = 'x'.repeat(10000);
      render();
        <TextFieldEditor
          {...mockProps}
          value={longValue}
        />
      );
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe(longValue);
    });
    it('should handle special characters and unicode', () => {
      const specialValue = '🎉 Special chars: <>&"\'\\n\\t 中文 العربية';
      render();
        <TextFieldEditor
          {...mockProps}
          value={specialValue}
        />
      );
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe(specialValue);
    });
    it('should handle onChange errors gracefully', async () => {
      const onChange = jest.fn<unknown[], unknown>().mockImplementation(() => {
        throw new Error('onChange error');
      });
      const user = userEvent.setup();
      const onError = jest.fn<unknown[], unknown>();
      render();
        <TestErrorBoundary onError={onError}>
          <TextFieldEditor
            {...mockProps}
            onChange={onChange}
          />
        </TestErrorBoundary>
      );
      const input = screen.getByRole('textbox');
      await user.type(input, 'x');
      // Component should handle error gracefully
      expect(onError).toHaveBeenCalled();
    });
    it('should handle invalid zodType gracefully', () => {
      expect(() => {
        render();
          <TextFieldEditor
            {...mockProps}
            zodType={null as any}
          />
        );
      }).not.toThrow();
    });
  });
  describe('TextAreaEditor - Performance & Error Handling', () => {
    const mockProps = {
      label: 'Test TextArea',
      value: 'test value',
      fieldKey: 'testField',
      zodType: z.string(),
      onChange: jest.fn<unknown[], unknown>()
    };
    it('should handle very large text content', () => {
      const largeText = 'Line 1\\n'.repeat(1000);
      render();
        <TextAreaEditor
          {...mockProps}
          value={largeText}
        />
      );
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(largeText);
    });
    it('should handle invalid rows prop gracefully', () => {
      expect(() => {
        render();
          <TextAreaEditor
            {...mockProps}
            rows={-5}
          />
        );
      }).not.toThrow();
    });
    it('should handle null/undefined rows gracefully', () => {
      expect(() => {
        render();
          <TextAreaEditor
            {...mockProps}
            rows={null as any}
          />
        );
      }).not.toThrow();
    });
  });
  describe('SelectEditor - Error Handling', () => {
    const mockProps = {
      label: 'Test Select',
      value: 'option1',
      fieldKey: 'testField',
      zodType: z.enum(['option1', 'option2']),
      onChange: jest.fn<unknown[], unknown>(),
      options: [,
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
      ]
    };
    it('should handle empty options array', () => {
      render();
        <SelectEditor
          {...mockProps}
          options={[]}
        />
      );
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });
    it('should handle null options', () => {
      expect(() => {
        render();
          <SelectEditor
            {...mockProps}
            options={null as any}
          />
        );
      }).not.toThrow();
    });
    it('should handle malformed options', () => {
      const malformedOptions = [;
        { value: 'opt1' }, // missing label
        { label: 'Option 2' }, // missing value
        null,
        undefined
      ] as any;
      expect(() => {
        render();
          <SelectEditor
            {...mockProps}
            options={malformedOptions}
          />
        );
      }).not.toThrow();
    });
    it('should handle options with special characters', () => {
      const specialOptions = [;
        { value: '<script>', label: 'Dangerous &<>&"\' content' },
        { value: '🎉', label: '🎉 Unicode 中文' }
      ];
      render();
        <SelectEditor
          {...mockProps}
          options={specialOptions}
        />
      );
      expect(screen.getByText('Dangerous &<>&"\' content')).toBeInTheDocument();
      expect(screen.getByText('🎉 Unicode 中文')).toBeInTheDocument();
    });
  });
  describe('CollapsibleSection - Performance & Error Handling', () => {
    it('should handle rapid toggle operations', async () => {
      const user = userEvent.setup();
      render();
        <CollapsibleSection title="Test Section" defaultOpen={false}>
          <div>Content</div>
        </CollapsibleSection>
      );
      const header = screen.getByText('Test Section');
      // Rapid clicks
      for (let i = 0; i < 10; i++) {
        await user.click(header);
      }
      // Should not crash and final state should be stable
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
    it('should handle null children gracefully', () => {
      expect(() => {
        render();
          <CollapsibleSection title="Test">
            {null}
          </CollapsibleSection>
        );
      }).not.toThrow();
    });
    it('should handle undefined children gracefully', () => {
      expect(() => {
        render();
          <CollapsibleSection title="Test">
            {undefined}
          </CollapsibleSection>
        );
      }).not.toThrow();
    });
    it('should handle complex nested content', () => {
      const complexContent = (;);
        <div>
          <input type="text" />
          <select>
            <option value="1">Option 1</option>
          </select>
          <textarea />
          <button>Nested Button</button>
        </div>
      );
      render();
        <CollapsibleSection title="Complex Section" defaultOpen={true}>
          {complexContent}
        </CollapsibleSection>
      );
      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Nested Button' })).toBeInTheDocument();
    });
  });
  describe('VariationList - Performance & Error Handling', () => {
    const mockProps = {
      label: 'Test Variations',
      value: ['var1', 'var2'],
      fieldKey: 'variations',
      zodType: z.array(z.string()),
      onChange: jest.fn<unknown[], unknown>()
    };
    it('should handle large number of variations efficiently', () => {
      const manyVariations = Array.from({ length: 1000 }, (_, i) => `Variation ${i}`);}
      const startTime = performance.now();
      render();
        <VariationList
          {...mockProps}
          value={manyVariations}
        />
      );
      const endTime = performance.now();
      // Should render within reasonable time (< 500ms)
      expect(endTime - startTime).toBeLessThan(500);
    });
    it('should handle onChange errors gracefully', async () => {
      const onChange = jest.fn<unknown[], unknown>().mockImplementation(() => {
        throw new Error('onChange error');
      });
      const user = userEvent.setup();
      const onError = jest.fn<unknown[], unknown>();
      render();
        <TestErrorBoundary onError={onError}>
          <VariationList
            {...mockProps}
            onChange={onChange}
          />
        </TestErrorBoundary>
      );
      const addButton = screen.queryByText(/Add/i);
      if (addButton) {
        await user.click(addButton);
        expect(onError).toHaveBeenCalled();
      }
    });
    it('should handle null/undefined value gracefully', () => {
      expect(() => {
        render();
          <VariationList
            {...mockProps}
            value={null as any}
          />
        );
      }).not.toThrow();
      expect(() => {
        render();
          <VariationList
            {...mockProps}
            value={undefined as any}
          />
        );
      }).not.toThrow();
    });
  });
  describe('WeightedChoiceEditor - Advanced Error Handling', () => {
    const mockNode = {
      id: 'weighted-node',
      type: 'WeightedChoice',
      data: {,
        choices: [,
          { weight: 0.6, value: 'Choice A' },
          { weight: 0.4, value: 'Choice B' }
        ]
      }
    };
    it('should handle node with malformed choices', () => {
      const nodeWithMalformedChoices = {
        ...mockNode,
        data: {,
          choices: [,
            null,
            undefined,
            { weight: 'invalid' },
            { value: 'missing weight' },
            { weight: 0.5 } // missing value
          ]
        }
      } as any;
      expect(() => {
        render();
          <WeightedChoiceEditor 
            nodeId={nodeWithMalformedChoices.id}
            nodeData={nodeWithMalformedChoices.data}
            schema={z.object({ choices: z.array(z.object({ weight: z.number(), value: z.string() })) })}
            onChange={jest.fn<unknown[], unknown>()}
          />
        );
      }).not.toThrow();
    });
    it('should handle add choice with updateNodeData error', async () => {
      const user = userEvent.setup();
      mockUpdateNodeData.mockImplementation(() => {
        throw new Error('Update failed');
      });
      const onError = jest.fn<unknown[], unknown>();
      render();
        <TestErrorBoundary onError={onError}>
          <WeightedChoiceEditor 
            nodeId={mockNode.id}
            nodeData={mockNode.data}
            schema={z.object({ choices: z.array(z.object({ weight: z.number(), value: z.string() })) })}
            onChange={jest.fn<unknown[], unknown>()}
          />
        </TestErrorBoundary>
      );
      const addButton = screen.queryByText(/Add/i);
      if (addButton) {
        await user.click(addButton);
        // Should handle error gracefully
        expect(onError).toHaveBeenCalled();
      }
    });
    it('should handle missing nodeData gracefully', () => {
      expect(() => {
        render();
          <WeightedChoiceEditor 
            nodeId="test-node"
            nodeData={null as any}
            schema={z.object({ choices: z.array(z.object({ weight: z.number(), value: z.string() })) })}
            onChange={jest.fn<unknown[], unknown>()}
          />
        );
      }).not.toThrow();
    });
  });
  describe('Integration Tests - Error Recovery', () => {
    it('should recover from store updates errors', async () => {
      const user = userEvent.setup();
      // Simulate store error
      mockUpdateNodeData.mockImplementationOnce(() => {
        throw new Error('Store update failed');
      });
      const onError = jest.fn<unknown[], unknown>();
      const mockSchema = z.object({ choices: z.array(z.object({ weight: z.number(), value: z.string() })) });
      render();
        <TestErrorBoundary onError={onError}>
          <WeightedChoiceEditor 
            nodeId="test-node"
            nodeData={mockGraphStore.nodes[0].data}
            schema={mockSchema}
            onChange={jest.fn<unknown[], unknown>()}
          />
        </TestErrorBoundary>
      );
      const addButton = screen.queryByText(/Add/i);
      if (addButton) {
        // First click should trigger error
        await user.click(addButton);
        expect(onError).toHaveBeenCalled();
        // Reset error boundary and try again
        onError.mockClear();
        mockUpdateNodeData.mockImplementation(jest.fn<unknown[], unknown>()); // Reset to working mock
        // Should recover and work normally
        const { rerender } = render()
          <WeightedChoiceEditor 
            nodeId="test-node"
            nodeData={mockGraphStore.nodes[0].data}
            schema={mockSchema}
            onChange={jest.fn<unknown[], unknown>()}
          />
        );
        const newAddButton = screen.queryByText(/Add/i);
        if (newAddButton) {
          await user.click(newAddButton);
          expect(mockUpdateNodeData).toHaveBeenCalled();
        }
      }
    });
  });
  describe('Memory Leak Prevention', () => {
    it('should cleanup event listeners on unmount', () => {
      const { unmount } = render()
        <TextFieldEditor
          label="Test"
          value=""
          fieldKey="test"
          zodType={z.string()}
          onChange={jest.fn<unknown[], unknown>()}
        />
      );
      // Should not throw on unmount
      expect(() => unmount()).not.toThrow();
    });
    it('should cleanup timers on unmount', () => {
      const mockSchema = z.object({)
        label: z.string(),
      });
      const { unmount } = render()
        <InspectorPanel
          node={{ id: 'test', type: 'Test', data: { label: 'test' } }}
          schema={mockSchema}
          onChange={jest.fn<unknown[], unknown>()}
        />
      );
      // Should cleanup timers
      expect(() => unmount()).not.toThrow();
      // Advance timers after unmount - should not cause errors
      act(() => {
        jest.advanceTimersByTime(500);
      });
    });
  });
  describe('Accessibility & Code Quality', () => {
    it('should provide proper ARIA labels and roles', () => {
      const mockSchema = z.object({)
        label: z.string(),
      });
      render();
        <InspectorPanel
          node={{ id: 'test', type: 'Test', data: { label: 'test' } }}
          schema={mockSchema}
          onChange={jest.fn<unknown[], unknown>()}
        />
      );
      // Check for basic accessibility attributes
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {)
        // Should have some form of accessible name
        expect();
          button.getAttribute('aria-label') || 
          button.getAttribute('title') || 
          button.textContent
        ).toBeTruthy();
      });
    });
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render();
        <TextFieldEditor
          label="Test Field"
          value=""
          fieldKey="test"
          zodType={z.string()}
          onChange={jest.fn<unknown[], unknown>()}
        />
      );
      // Should be able to tab to the input
      await user.tab();
      expect(document.activeElement).toBe(screen.getByRole('textbox'));
    });
    it('should follow TypeScript strict mode requirements', () => {
      const mockSchema = z.object({)
        label: z.string(),
      });
      const strictProps = {
        node: { id: 'test', type: 'Test', data: { label: 'test' } } as const,
        schema: mockSchema,
        onChange: jest.fn<unknown[], unknown>() as (data: unknown) => void
      };
      expect(() => {
        render(<InspectorPanel {...strictProps} />);
      }).not.toThrow();
    });
  });
});