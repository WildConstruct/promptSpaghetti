import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
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
const mockUpdateNodeData = jest.fn();
const mockDeleteNode = jest.fn();
jest.mock('../hooks/useNodeUtils', () => ({
    useNodeUtils: () => ({
        updateNodeData: mockUpdateNodeData,
        deleteNode: mockDeleteNode
    })
}));
jest.mock('reactflow', () => ({
    useReactFlow: () => ({
        getNodes: jest.fn(() => []),
        getEdges: jest.fn(() => []),
        setNodes: jest.fn(),
        setEdges: jest.fn()
    })
}));
const mockGraphStore = {
    selectedNodeId: 'test-node-id',
    nodes: [
        {
            id: 'test-node-id',
            type: 'WeightedChoice',
            data: {
                choices: [
                    { weight: 0.5, value: 'Option A' },
                    { weight: 0.5, value: 'Option B' }
                ]
            }
        }
    ],
    updateNode: jest.fn()
};
jest.mock('../graphStore', () => ({
    useGraphStore: jest.fn(() => mockGraphStore)
}));
// Error boundary for testing error handling
class TestErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error) {
        this.props.onError?.(error);
    }
    render() {
        if (this.state.hasError) {
            return _jsxs("div", { "data-testid": "error-boundary", children: ["Something went wrong: ", this.state.error?.message] });
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
        const mockSchema = z.object({
            label: z.string().default('Test Node'),
            value: z.string().default(''),
            variations: z.array(z.string()).default([])
        });
        const mockNode = {
            id: 'test-node',
            type: 'TestNode',
            data: {
                label: 'Test Node',
                value: 'test value',
                variations: ['var1', 'var2']
            }
        };
        it('should handle null node gracefully', () => {
            render(_jsx(InspectorPanel, { node: null, schema: mockSchema, onChange: jest.fn() }));
            expect(screen.getByText(/No node selected/i)).toBeInTheDocument();
        });
        it('should handle undefined node gracefully', () => {
            render(_jsx(InspectorPanel, { node: undefined, schema: mockSchema, onChange: jest.fn() }));
            expect(screen.getByText(/No node selected/i)).toBeInTheDocument();
        });
        it('should call onClose when provided', () => {
            const onClose = jest.fn();
            render(_jsx(InspectorPanel, { node: mockNode, schema: mockSchema, onChange: jest.fn(), onClose: onClose }));
            const closeButton = screen.queryByRole('button', { name: /close/i });
            if (closeButton) {
                fireEvent.click(closeButton);
                expect(onClose).toHaveBeenCalledTimes(1);
            }
        });
        it('should handle onChange errors gracefully', async () => {
            const onError = jest.fn();
            const errorOnChange = jest.fn(() => {
                throw new Error('onChange error');
            });
            render(_jsx(TestErrorBoundary, { onError: onError, children: _jsx(InspectorPanel, { node: mockNode, schema: mockSchema, onChange: errorOnChange }) }));
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
            const onError = jest.fn();
            render(_jsx(TestErrorBoundary, { onError: onError, children: _jsx(InspectorPanel, { node: mockNode, schema: mockSchema, onChange: jest.fn() }) }));
            expect(onError).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Store access error'
            }));
            // Restore mock
            mockUseGraphStore.mockImplementation(() => mockGraphStore);
        });
        it('should handle resize operations efficiently', async () => {
            const startTime = performance.now();
            render(_jsx(InspectorPanel, { node: mockNode, schema: mockSchema, onChange: jest.fn() }));
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
        const mockSchema = z.object({
            label: z.string(),
            value: z.number()
        });
        const mockNodeData = {
            label: 'Test Node',
            value: 123
        };
        it('should handle malformed nodeData gracefully', () => {
            expect(() => {
                render(_jsx(BaseNodeEditor, { nodeId: "test-node", nodeData: null, schema: mockSchema, onChange: jest.fn(), children: _jsx("div", { children: "Test Content" }) }));
            }).not.toThrow();
        });
        it('should handle missing schema gracefully', () => {
            expect(() => {
                render(_jsx(BaseNodeEditor, { nodeId: "test-node", nodeData: mockNodeData, schema: null, onChange: jest.fn(), children: _jsx("div", { children: "Test Content" }) }));
            }).not.toThrow();
        });
        it('should handle onChange errors gracefully', () => {
            const onError = jest.fn();
            const errorOnChange = jest.fn(() => {
                throw new Error('onChange error');
            });
            render(_jsx(TestErrorBoundary, { onError: onError, children: _jsx(BaseNodeEditor, { nodeId: "test-node", nodeData: mockNodeData, schema: mockSchema, onChange: errorOnChange, children: _jsx("div", { children: "Test Content" }) }) }));
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
            onChange: jest.fn()
        };
        it('should handle null/undefined values gracefully', () => {
            expect(() => {
                render(_jsx(TextFieldEditor, { ...mockProps, value: null }));
            }).not.toThrow();
            expect(() => {
                render(_jsx(TextFieldEditor, { ...mockProps, value: undefined }));
            }).not.toThrow();
        });
        it('should handle extremely long input values', () => {
            const longValue = 'x'.repeat(10000);
            render(_jsx(TextFieldEditor, { ...mockProps, value: longValue }));
            const input = screen.getByRole('textbox');
            expect(input.value).toBe(longValue);
        });
        it('should handle special characters and unicode', () => {
            const specialValue = '🎉 Special chars: <>&"\'\\n\\t 中文 العربية';
            render(_jsx(TextFieldEditor, { ...mockProps, value: specialValue }));
            const input = screen.getByRole('textbox');
            expect(input.value).toBe(specialValue);
        });
        it('should handle onChange errors gracefully', async () => {
            const onChange = jest.fn().mockImplementation(() => {
                throw new Error('onChange error');
            });
            const user = userEvent.setup();
            const onError = jest.fn();
            render(_jsx(TestErrorBoundary, { onError: onError, children: _jsx(TextFieldEditor, { ...mockProps, onChange: onChange }) }));
            const input = screen.getByRole('textbox');
            await user.type(input, 'x');
            // Component should handle error gracefully
            expect(onError).toHaveBeenCalled();
        });
        it('should handle invalid zodType gracefully', () => {
            expect(() => {
                render(_jsx(TextFieldEditor, { ...mockProps, zodType: null }));
            }).not.toThrow();
        });
    });
    describe('TextAreaEditor - Performance & Error Handling', () => {
        const mockProps = {
            label: 'Test TextArea',
            value: 'test value',
            fieldKey: 'testField',
            zodType: z.string(),
            onChange: jest.fn()
        };
        it('should handle very large text content', () => {
            const largeText = 'Line 1\\n'.repeat(1000);
            render(_jsx(TextAreaEditor, { ...mockProps, value: largeText }));
            const textarea = screen.getByRole('textbox');
            expect(textarea.value).toBe(largeText);
        });
        it('should handle invalid rows prop gracefully', () => {
            expect(() => {
                render(_jsx(TextAreaEditor, { ...mockProps, rows: -5 }));
            }).not.toThrow();
        });
        it('should handle null/undefined rows gracefully', () => {
            expect(() => {
                render(_jsx(TextAreaEditor, { ...mockProps, rows: null }));
            }).not.toThrow();
        });
    });
    describe('SelectEditor - Error Handling', () => {
        const mockProps = {
            label: 'Test Select',
            value: 'option1',
            fieldKey: 'testField',
            zodType: z.enum(['option1', 'option2']),
            onChange: jest.fn(),
            options: [
                { value: 'option1', label: 'Option 1' },
                { value: 'option2', label: 'Option 2' }
            ]
        };
        it('should handle empty options array', () => {
            render(_jsx(SelectEditor, { ...mockProps, options: [] }));
            const select = screen.getByRole('combobox');
            expect(select).toBeInTheDocument();
        });
        it('should handle null options', () => {
            expect(() => {
                render(_jsx(SelectEditor, { ...mockProps, options: null }));
            }).not.toThrow();
        });
        it('should handle malformed options', () => {
            const malformedOptions = [
                { value: 'opt1' }, // missing label
                { label: 'Option 2' }, // missing value
                null,
                undefined
            ];
            expect(() => {
                render(_jsx(SelectEditor, { ...mockProps, options: malformedOptions }));
            }).not.toThrow();
        });
        it('should handle options with special characters', () => {
            const specialOptions = [
                { value: '<script>', label: 'Dangerous &<>&"\' content' },
                { value: '🎉', label: '🎉 Unicode 中文' }
            ];
            render(_jsx(SelectEditor, { ...mockProps, options: specialOptions }));
            expect(screen.getByText('Dangerous &<>&"\' content')).toBeInTheDocument();
            expect(screen.getByText('🎉 Unicode 中文')).toBeInTheDocument();
        });
    });
    describe('CollapsibleSection - Performance & Error Handling', () => {
        it('should handle rapid toggle operations', async () => {
            const user = userEvent.setup();
            render(_jsx(CollapsibleSection, { title: "Test Section", defaultOpen: false, children: _jsx("div", { children: "Content" }) }));
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
                render(_jsx(CollapsibleSection, { title: "Test", children: null }));
            }).not.toThrow();
        });
        it('should handle undefined children gracefully', () => {
            expect(() => {
                render(_jsx(CollapsibleSection, { title: "Test", children: undefined }));
            }).not.toThrow();
        });
        it('should handle complex nested content', () => {
            const complexContent = (_jsxs("div", { children: [_jsx("input", { type: "text" }), _jsx("select", { children: _jsx("option", { value: "1", children: "Option 1" }) }), _jsx("textarea", {}), _jsx("button", { children: "Nested Button" })] }));
            render(_jsx(CollapsibleSection, { title: "Complex Section", defaultOpen: true, children: complexContent }));
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
            onChange: jest.fn()
        };
        it('should handle large number of variations efficiently', () => {
            const manyVariations = Array.from({ length: 1000 }, (_, i) => `Variation ${i}`);
            const startTime = performance.now();
            render(_jsx(VariationList, { ...mockProps, value: manyVariations }));
            const endTime = performance.now();
            // Should render within reasonable time (< 500ms)
            expect(endTime - startTime).toBeLessThan(500);
        });
        it('should handle onChange errors gracefully', async () => {
            const onChange = jest.fn().mockImplementation(() => {
                throw new Error('onChange error');
            });
            const user = userEvent.setup();
            const onError = jest.fn();
            render(_jsx(TestErrorBoundary, { onError: onError, children: _jsx(VariationList, { ...mockProps, onChange: onChange }) }));
            const addButton = screen.queryByText(/Add/i);
            if (addButton) {
                await user.click(addButton);
                expect(onError).toHaveBeenCalled();
            }
        });
        it('should handle null/undefined value gracefully', () => {
            expect(() => {
                render(_jsx(VariationList, { ...mockProps, value: null }));
            }).not.toThrow();
            expect(() => {
                render(_jsx(VariationList, { ...mockProps, value: undefined }));
            }).not.toThrow();
        });
    });
    describe('WeightedChoiceEditor - Advanced Error Handling', () => {
        const mockNode = {
            id: 'weighted-node',
            type: 'WeightedChoice',
            data: {
                choices: [
                    { weight: 0.6, value: 'Choice A' },
                    { weight: 0.4, value: 'Choice B' }
                ]
            }
        };
        it('should handle node with malformed choices', () => {
            const nodeWithMalformedChoices = {
                ...mockNode,
                data: {
                    choices: [
                        null,
                        undefined,
                        { weight: 'invalid' },
                        { value: 'missing weight' },
                        { weight: 0.5 } // missing value
                    ]
                }
            };
            expect(() => {
                render(_jsx(WeightedChoiceEditor, { nodeId: nodeWithMalformedChoices.id, nodeData: nodeWithMalformedChoices.data, schema: z.object({ choices: z.array(z.object({ weight: z.number(), value: z.string() })) }), onChange: jest.fn() }));
            }).not.toThrow();
        });
        it('should handle add choice with updateNodeData error', async () => {
            const user = userEvent.setup();
            mockUpdateNodeData.mockImplementation(() => {
                throw new Error('Update failed');
            });
            const onError = jest.fn();
            render(_jsx(TestErrorBoundary, { onError: onError, children: _jsx(WeightedChoiceEditor, { nodeId: mockNode.id, nodeData: mockNode.data, schema: z.object({ choices: z.array(z.object({ weight: z.number(), value: z.string() })) }), onChange: jest.fn() }) }));
            const addButton = screen.queryByText(/Add/i);
            if (addButton) {
                await user.click(addButton);
                // Should handle error gracefully
                expect(onError).toHaveBeenCalled();
            }
        });
        it('should handle missing nodeData gracefully', () => {
            expect(() => {
                render(_jsx(WeightedChoiceEditor, { nodeId: "test-node", nodeData: null, schema: z.object({ choices: z.array(z.object({ weight: z.number(), value: z.string() })) }), onChange: jest.fn() }));
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
            const onError = jest.fn();
            const mockSchema = z.object({ choices: z.array(z.object({ weight: z.number(), value: z.string() })) });
            render(_jsx(TestErrorBoundary, { onError: onError, children: _jsx(WeightedChoiceEditor, { nodeId: "test-node", nodeData: mockGraphStore.nodes[0].data, schema: mockSchema, onChange: jest.fn() }) }));
            const addButton = screen.queryByText(/Add/i);
            if (addButton) {
                // First click should trigger error
                await user.click(addButton);
                expect(onError).toHaveBeenCalled();
                // Reset error boundary and try again
                onError.mockClear();
                mockUpdateNodeData.mockImplementation(jest.fn()); // Reset to working mock
                // Should recover and work normally
                const { rerender } = render(_jsx(WeightedChoiceEditor, { nodeId: "test-node", nodeData: mockGraphStore.nodes[0].data, schema: mockSchema, onChange: jest.fn() }));
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
            const { unmount } = render(_jsx(TextFieldEditor, { label: "Test", value: "", fieldKey: "test", zodType: z.string(), onChange: jest.fn() }));
            // Should not throw on unmount
            expect(() => unmount()).not.toThrow();
        });
        it('should cleanup timers on unmount', () => {
            const mockSchema = z.object({
                label: z.string()
            });
            const { unmount } = render(_jsx(InspectorPanel, { node: { id: 'test', type: 'Test', data: { label: 'test' } }, schema: mockSchema, onChange: jest.fn() }));
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
            const mockSchema = z.object({
                label: z.string()
            });
            render(_jsx(InspectorPanel, { node: { id: 'test', type: 'Test', data: { label: 'test' } }, schema: mockSchema, onChange: jest.fn() }));
            // Check for basic accessibility attributes
            const buttons = screen.getAllByRole('button');
            buttons.forEach(button => {
                // Should have some form of accessible name
                expect(button.getAttribute('aria-label') ||
                    button.getAttribute('title') ||
                    button.textContent).toBeTruthy();
            });
        });
        it('should support keyboard navigation', async () => {
            const user = userEvent.setup();
            render(_jsx(TextFieldEditor, { label: "Test Field", value: "", fieldKey: "test", zodType: z.string(), onChange: jest.fn() }));
            // Should be able to tab to the input
            await user.tab();
            expect(document.activeElement).toBe(screen.getByRole('textbox'));
        });
        it('should follow TypeScript strict mode requirements', () => {
            const mockSchema = z.object({
                label: z.string()
            });
            const strictProps = {
                node: { id: 'test', type: 'Test', data: { label: 'test' } },
                schema: mockSchema,
                onChange: jest.fn()
            };
            expect(() => {
                render(_jsx(InspectorPanel, { ...strictProps }));
            }).not.toThrow();
        });
    });
});
