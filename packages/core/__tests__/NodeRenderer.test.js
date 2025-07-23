import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { NodeRenderer } from '../components/NodeRenderer';
const mockGetNodeMeta = jest.fn((nodeType) => ({
    label: nodeType,
    category: 'general',
    icon: '🔧'
}));
const mockGetCategoryColor = jest.fn((category) => {
    const colors = {
        general: '#3182ce',
        input: '#38a169',
        output: '#d69e2e',
        processing: '#805ad5'
    };
    return colors[category] || '#718096';
});
const mockOnSelect = jest.fn();
describe('NodeRenderer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    const defaultProps = {
        id: 'node-1',
        data: {
            label: 'Test Node',
            nodeType: 'WeightedChoice'
        },
        onSelect: mockOnSelect,
        getNodeMeta: mockGetNodeMeta,
        getCategoryColor: mockGetCategoryColor
    };
    it('renders node with basic properties', () => {
        render(_jsx(NodeRenderer, { ...defaultProps }));
        expect(screen.getAllByText('WeightedChoice')[0]).toBeInTheDocument();
        expect(screen.getByText('Test Node')).toBeInTheDocument();
        expect(screen.getByTestId('node-node-1')).toBeInTheDocument();
    });
    it('displays node with selected state styling', () => {
        render(_jsx(NodeRenderer, { ...defaultProps, selected: true }));
        const nodeElement = screen.getByTestId('node-node-1');
        expect(nodeElement).toHaveStyle({
            border: '2px solid #3182ce'
        });
    });
    it('displays node with unselected state styling', () => {
        render(_jsx(NodeRenderer, { ...defaultProps, selected: false }));
        const nodeElement = screen.getByTestId('node-node-1');
        expect(nodeElement).toHaveStyle({
            border: '1px solid #4a5568'
        });
    });
    it('calls onSelect when clicked', async () => {
        render(_jsx(NodeRenderer, { ...defaultProps }));
        const nodeElement = screen.getByTestId('node-node-1');
        await userEvent.click(nodeElement);
        expect(mockOnSelect).toHaveBeenCalledWith('node-1');
    });
    it('calls onSelect when Enter key is pressed', async () => {
        render(_jsx(NodeRenderer, { ...defaultProps }));
        const nodeElement = screen.getByTestId('node-node-1');
        fireEvent.keyDown(nodeElement, { key: 'Enter' });
        expect(mockOnSelect).toHaveBeenCalledWith('node-1');
    });
    it('calls onSelect when Space key is pressed', async () => {
        render(_jsx(NodeRenderer, { ...defaultProps }));
        const nodeElement = screen.getByTestId('node-node-1');
        fireEvent.keyDown(nodeElement, { key: ' ' });
        expect(mockOnSelect).toHaveBeenCalledWith('node-1');
    });
    it('displays variations count badge when variations exist', () => {
        const propsWithVariations = {
            ...defaultProps,
            data: {
                ...defaultProps.data,
                variations: ['var1', 'var2', 'var3']
            }
        };
        render(_jsx(NodeRenderer, { ...propsWithVariations }));
        const badge = screen.getByText('3');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveAttribute('title', '3 variations');
    });
    it('does not display variations badge when no variations', () => {
        render(_jsx(NodeRenderer, { ...defaultProps }));
        expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
    it('displays node properties (max 3)', () => {
        const propsWithProperties = {
            ...defaultProps,
            data: {
                label: 'Test Node',
                nodeType: 'WeightedChoice',
                property1: 'value1',
                property2: 'value2',
                property3: 'value3',
                property4: 'value4' // Should be filtered out
            }
        };
        render(_jsx(NodeRenderer, { ...propsWithProperties }));
        // The code filters out 'label', 'variations', 'type' and shows max 3 properties
        // So we should see nodeType, property1, property2 but NOT property3 or property4
        expect(screen.getByText('nodeType:')).toBeInTheDocument();
        expect(screen.getByText('property1:')).toBeInTheDocument();
        expect(screen.getByText('value1')).toBeInTheDocument();
        expect(screen.getByText('property2:')).toBeInTheDocument();
        expect(screen.getByText('value2')).toBeInTheDocument();
        // These should be filtered out due to max 3 limit
        expect(screen.queryByText('property3:')).not.toBeInTheDocument();
        expect(screen.queryByText('property4:')).not.toBeInTheDocument();
    });
    it('truncates long property values', () => {
        const longValue = 'This is a very long property value that should be truncated';
        const propsWithLongValue = {
            ...defaultProps,
            data: {
                ...defaultProps.data,
                longProperty: longValue
            }
        };
        render(_jsx(NodeRenderer, { ...propsWithLongValue }));
        expect(screen.getByText('This is a very long ...')).toBeInTheDocument();
        expect(screen.queryByText(longValue)).not.toBeInTheDocument();
    });
    it('uses category-specific colors', () => {
        mockGetNodeMeta.mockReturnValue({
            label: 'Output Node',
            category: 'output',
            icon: '📤'
        });
        render(_jsx(NodeRenderer, { ...defaultProps }));
        expect(mockGetCategoryColor).toHaveBeenCalledWith('output');
    });
    it('renders with icon from node meta', () => {
        mockGetNodeMeta.mockReturnValue({
            label: 'Custom Node',
            category: 'processing',
            icon: '⚙️'
        });
        render(_jsx(NodeRenderer, { ...defaultProps }));
        expect(screen.getByText('⚙️')).toBeInTheDocument();
    });
    it('handles missing data gracefully', () => {
        const propsWithMinimalData = {
            ...defaultProps,
            data: {}
        };
        render(_jsx(NodeRenderer, { ...propsWithMinimalData }));
        // Should still render without crashing
        expect(screen.getByTestId('node-node-1')).toBeInTheDocument();
    });
    it('generates accessible aria-label', () => {
        const propsWithProperties = {
            ...defaultProps,
            data: {
                label: 'My Node',
                property1: 'value1',
                property2: 'value2'
            }
        };
        render(_jsx(NodeRenderer, { ...propsWithProperties }));
        const nodeElement = screen.getByTestId('node-node-1');
        expect(nodeElement).toHaveAttribute('aria-label', 'My Node. property1: value1, property2: value2');
    });
    it('handles error state gracefully', () => {
        // Force an error by passing a getNodeMeta that throws
        const errorProps = {
            ...defaultProps,
            getNodeMeta: () => { throw new Error('Mock error'); }
        };
        render(_jsx(NodeRenderer, { ...errorProps }));
        expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
    it('applies hover effects on mouse enter/leave', () => {
        render(_jsx(NodeRenderer, { ...defaultProps, selected: false }));
        const nodeElement = screen.getByTestId('node-node-1');
        // Mouse enter should apply hover effect
        fireEvent.mouseEnter(nodeElement);
        expect(nodeElement).toHaveStyle({
            transform: 'translateY(-2px) translateZ(0)'
        });
        // Mouse leave should remove hover effect
        fireEvent.mouseLeave(nodeElement);
        expect(nodeElement).toHaveStyle({
            transform: 'translateY(0) translateZ(0)'
        });
    });
    it('does not apply hover effects when selected', () => {
        render(_jsx(NodeRenderer, { ...defaultProps, selected: true }));
        const nodeElement = screen.getByTestId('node-node-1');
        fireEvent.mouseEnter(nodeElement);
        // Transform should not change when selected
        expect(nodeElement).toHaveStyle({
            transform: 'translateZ(0)'
        });
    });
    it('filters out internal properties from display', () => {
        const propsWithInternalData = {
            ...defaultProps,
            data: {
                label: 'Test Node',
                variations: ['var1'],
                type: 'SomeType',
                actualProperty: 'shouldShow'
            }
        };
        render(_jsx(NodeRenderer, { ...propsWithInternalData }));
        expect(screen.getByText('actualProperty:')).toBeInTheDocument();
        expect(screen.getByText('shouldShow')).toBeInTheDocument();
        // Internal properties should not be displayed
        expect(screen.queryByText('label:')).not.toBeInTheDocument();
        expect(screen.queryByText('variations:')).not.toBeInTheDocument();
        expect(screen.queryByText('type:')).not.toBeInTheDocument();
    });
    it('stops event propagation on click', async () => {
        const parentClickHandler = jest.fn();
        render(_jsx("div", { onClick: parentClickHandler, children: _jsx(NodeRenderer, { ...defaultProps }) }));
        const nodeElement = screen.getByTestId('node-node-1');
        await userEvent.click(nodeElement);
        expect(mockOnSelect).toHaveBeenCalledWith('node-1');
        expect(parentClickHandler).not.toHaveBeenCalled();
    });
    it('renders React Flow handles for connections', () => {
        render(_jsx(NodeRenderer, { ...defaultProps }));
        // Check for React Flow Handle elements by their actual test IDs from the output
        expect(screen.getByTestId('handle-target-left')).toBeInTheDocument();
        expect(screen.getByTestId('handle-source-right')).toBeInTheDocument();
    });
});
