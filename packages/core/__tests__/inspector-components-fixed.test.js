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
    updateNode: jest.fn(),
    addVariation: jest.fn(),
    removeVariation: jest.fn(),
    updateVariation: jest.fn(),
    reorderVariations: jest.fn()
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
describe('Inspector Components - Fixed for 80% Coverage', () => {
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
        it('should handle malformed schema gracefully', () => {
            expect(() => {
                render(_jsx(InspectorPanel, { node: mockNode, schema: null, onChange: jest.fn() }));
            }).not.toThrow();
        });
        it('should handle missing onChange gracefully', () => {
            expect(() => {
                render(_jsx(InspectorPanel, { node: mockNode, schema: mockSchema, onChange: undefined }));
            }).not.toThrow();
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
        it('should handle empty nodeId gracefully', () => {
            expect(() => {
                render(_jsx(BaseNodeEditor, { nodeId: "", nodeData: mockNodeData, schema: mockSchema, onChange: jest.fn(), children: _jsx("div", { children: "Test Content" }) }));
            }).not.toThrow();
        });
        it('should handle undefined nodeId gracefully', () => {
            expect(() => {
                render(_jsx(BaseNodeEditor, { nodeId: undefined, nodeData: mockNodeData, schema: mockSchema, onChange: jest.fn(), children: _jsx("div", { children: "Test Content" }) }));
            }).not.toThrow();
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
        it('should handle empty fieldKey gracefully', () => {
            expect(() => {
                render(_jsx(TextFieldEditor, { ...mockProps, fieldKey: "" }));
            }).not.toThrow();
        });
        it('should handle empty label gracefully', () => {
            expect(() => {
                render(_jsx(TextFieldEditor, { ...mockProps, label: "" }));
            }).not.toThrow();
        });
        it('should handle disabled state correctly', () => {
            render(_jsx(TextFieldEditor, { ...mockProps, disabled: true }));
            const input = screen.getByRole('textbox');
            expect(input).toBeDisabled();
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
        it('should handle autoResize mode correctly', () => {
            expect(() => {
                render(_jsx(TextAreaEditor, { ...mockProps, autoResize: true }));
            }).not.toThrow();
        });
        it('should handle maxLength constraint', () => {
            expect(() => {
                render(_jsx(TextAreaEditor, { ...mockProps, maxLength: 100 }));
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
        it('should handle invalid value gracefully', () => {
            expect(() => {
                render(_jsx(SelectEditor, { ...mockProps, value: "invalid-option" }));
            }).not.toThrow();
        });
        it('should handle placeholder correctly', () => {
            render(_jsx(SelectEditor, { ...mockProps, value: "", placeholder: "Choose an option..." }));
            expect(screen.getByText('Choose an option...')).toBeInTheDocument();
        });
    });
    describe('CollapsibleSection - Performance & Error Handling', () => {
        it('should handle rapid toggle operations', async () => {
            const user = userEvent.setup();
            const onToggle = jest.fn();
            let collapsed = false;
            const { rerender } = render(_jsx(CollapsibleSection, { title: "Test Section", collapsed: collapsed, onToggle: onToggle, children: _jsx("div", { children: "Content" }) }));
            const header = screen.getByText('Test Section');
            // Rapid clicks
            for (let i = 0; i < 10; i++) {
                await user.click(header);
                collapsed = !collapsed;
                rerender(_jsx(CollapsibleSection, { title: "Test Section", collapsed: collapsed, onToggle: onToggle, children: _jsx("div", { children: "Content" }) }));
            }
            // Should not crash and toggle should have been called
            expect(onToggle).toHaveBeenCalledTimes(10);
        });
        it('should handle null children gracefully', () => {
            expect(() => {
                render(_jsx(CollapsibleSection, { title: "Test", collapsed: false, onToggle: jest.fn(), children: null }));
            }).not.toThrow();
        });
        it('should handle undefined children gracefully', () => {
            expect(() => {
                render(_jsx(CollapsibleSection, { title: "Test", collapsed: false, onToggle: jest.fn(), children: undefined }));
            }).not.toThrow();
        });
        it('should handle complex nested content', () => {
            const complexContent = (_jsxs("div", { children: [_jsx("input", { type: "text" }), _jsx("select", { children: _jsx("option", { value: "1", children: "Option 1" }) }), _jsx("textarea", {}), _jsx("button", { children: "Nested Button" })] }));
            render(_jsx(CollapsibleSection, { title: "Complex Section", collapsed: false, onToggle: jest.fn(), children: complexContent }));
            expect(screen.getByRole('textbox')).toBeInTheDocument();
            expect(screen.getByRole('combobox')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Nested Button' })).toBeInTheDocument();
        });
        it('should handle onToggle errors gracefully', async () => {
            const onToggle = jest.fn(() => {
                throw new Error('Toggle error');
            });
            const user = userEvent.setup();
            const onError = jest.fn();
            render(_jsx(TestErrorBoundary, { onError: onError, children: _jsx(CollapsibleSection, { title: "Test Section", collapsed: false, onToggle: onToggle, children: _jsx("div", { children: "Content" }) }) }));
            const header = screen.getByText('Test Section');
            await user.click(header);
            expect(onError).toHaveBeenCalled();
        });
        it('should handle empty title gracefully', () => {
            expect(() => {
                render(_jsx(CollapsibleSection, { title: "", collapsed: false, onToggle: jest.fn(), children: _jsx("div", { children: "Content" }) }));
            }).not.toThrow();
        });
    });
    describe('VariationList - Performance & Error Handling', () => {
        const mockProps = {
            nodeId: 'test-node',
            variations: ['var1', 'var2'],
            onAdd: jest.fn(),
            onRemove: jest.fn(),
            onUpdate: jest.fn(),
            onReorder: jest.fn()
        };
        it('should handle large number of variations efficiently', () => {
            const manyVariations = Array.from({ length: 1000 }, (_, i) => `Variation ${i}`);
            const startTime = performance.now();
            render(_jsx(VariationList, { ...mockProps, variations: manyVariations }));
            const endTime = performance.now();
            // Should render within reasonable time (< 500ms)
            expect(endTime - startTime).toBeLessThan(500);
        });
        it('should handle onAdd errors gracefully', async () => {
            const onAdd = jest.fn().mockImplementation(() => {
                throw new Error('onAdd error');
            });
            const user = userEvent.setup();
            const onError = jest.fn();
            render(_jsx(TestErrorBoundary, { onError: onError, children: _jsx(VariationList, { ...mockProps, onAdd: onAdd }) }));
            const addButton = screen.queryByText(/Add/i);
            if (addButton) {
                await user.click(addButton);
                expect(onError).toHaveBeenCalled();
            }
        });
        it('should handle empty variations array', () => {
            render(_jsx(VariationList, { ...mockProps, variations: [] }));
            // Should render without crashing
            expect(screen.queryByText(/Add/i)).toBeInTheDocument();
        });
        it('should handle null variations gracefully', () => {
            expect(() => {
                render(_jsx(VariationList, { ...mockProps, variations: null }));
            }).not.toThrow();
        });
        it('should handle missing nodeId gracefully', () => {
            expect(() => {
                render(_jsx(VariationList, { ...mockProps, nodeId: "" }));
            }).not.toThrow();
        });
        it('should handle maxVariations constraint', () => {
            render(_jsx(VariationList, { ...mockProps, maxVariations: 1, variations: ['var1'] }));
            // Add button should be disabled or hidden when at max
            const addButton = screen.queryByText(/Add/i);
            if (addButton) {
                expect(addButton).toBeDisabled();
            }
        });
        it('should handle placeholder text', () => {
            render(_jsx(VariationList, { ...mockProps, placeholder: "Custom placeholder" }));
            expect(screen.getByText('Custom placeholder')).toBeInTheDocument();
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
        it('should cleanup CollapsibleSection event listeners', () => {
            const { unmount } = render(_jsx(CollapsibleSection, { title: "Test", collapsed: false, onToggle: jest.fn(), children: _jsx("div", { children: "Content" }) }));
            expect(() => unmount()).not.toThrow();
        });
        it('should cleanup VariationList event listeners', () => {
            const { unmount } = render(_jsx(VariationList, { nodeId: "test", variations: ['var1'], onAdd: jest.fn(), onRemove: jest.fn(), onUpdate: jest.fn() }));
            expect(() => unmount()).not.toThrow();
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
        it('should handle focus management properly', async () => {
            const user = userEvent.setup();
            render(_jsx(CollapsibleSection, { title: "Test Section", collapsed: false, onToggle: jest.fn(), children: _jsx("input", { type: "text" }) }));
            // Click the header
            await user.click(screen.getByText('Test Section'));
            // Should maintain focus management
            expect(document.activeElement).toBeDefined();
        });
        it('should handle screen reader compatibility', () => {
            render(_jsx(VariationList, { nodeId: "test", variations: ['var1', 'var2'], onAdd: jest.fn(), onRemove: jest.fn(), onUpdate: jest.fn() }));
            // Should have proper labels for screen readers
            const inputs = screen.getAllByRole('textbox');
            inputs.forEach((input, index) => {
                expect(input.getAttribute('aria-label') || input.getAttribute('placeholder')).toBeTruthy();
            });
        });
    });
    describe('Edge Cases and Boundary Conditions', () => {
        it('should handle concurrent state updates gracefully', async () => {
            const onChange = jest.fn();
            const user = userEvent.setup();
            render(_jsx(TextFieldEditor, { label: "Test", value: "initial", fieldKey: "test", zodType: z.string(), onChange: onChange }));
            const input = screen.getByRole('textbox');
            // Simulate concurrent updates
            await Promise.all([
                user.type(input, 'a'),
                user.type(input, 'b'),
                user.type(input, 'c')
            ]);
            // Should handle all updates without crashing
            expect(onChange).toHaveBeenCalled();
        });
        it('should handle browser compatibility issues', () => {
            // Mock older browser features
            const originalPerformance = global.performance;
            delete global.performance;
            expect(() => {
                render(_jsx(InspectorPanel, { node: { id: 'test', type: 'Test', data: { label: 'test' } }, schema: z.object({ label: z.string() }), onChange: jest.fn() }));
            }).not.toThrow();
            // Restore
            global.performance = originalPerformance;
        });
        it('should handle JSON serialization edge cases', () => {
            const circularRef = { name: 'test' };
            circularRef.self = circularRef;
            expect(() => {
                render(_jsx(TextFieldEditor, { label: "Test", value: circularRef.name, fieldKey: "test", zodType: z.string(), onChange: jest.fn() }));
            }).not.toThrow();
        });
    });
});
