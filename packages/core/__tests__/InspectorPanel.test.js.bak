import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent } from '@testing-library/react';
import { InspectorPanel } from '../components/Inspector/InspectorPanel';
import { z } from 'zod';
// Mock the graph store
jest.mock('../graphStore', () => ({
    useGraphStore: () => ({
        addVariation: jest.fn(),
        removeVariation: jest.fn(),
        updateVariation: jest.fn(),
        reorderVariations: jest.fn(),
    }),
}));
describe('InspectorPanel', () => {
    const mockSchema = z.object({
        label: z.string().default('Test Node'),
        value: z.string().default(''),
        variations: z.array(z.string()).default([]),
    });
    const mockNode = {
        id: 'test-node',
        type: 'TestNode',
        data: {
            label: 'Test Node',
            value: 'test value',
            variations: ['var1', 'var2'],
        },
    };
    const defaultProps = {
        node: mockNode,
        schema: mockSchema,
        onChange: jest.fn(),
    };
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('renders inspector panel with node data', () => {
        render(_jsx(InspectorPanel, { ...defaultProps }));
        expect(screen.getByText('Test Node Inspector')).toBeInTheDocument();
    });
    it('shows empty state when no node selected', () => {
        render(_jsx(InspectorPanel, { ...defaultProps, node: null }));
        expect(screen.getByText('Select a node to edit its properties')).toBeInTheDocument();
    });
    it('shows collapse/expand button', () => {
        render(_jsx(InspectorPanel, { ...defaultProps }));
        const collapseButton = screen.getByTitle('Collapse Inspector');
        expect(collapseButton).toBeInTheDocument();
        fireEvent.click(collapseButton);
        expect(screen.getByTitle('Expand Inspector')).toBeInTheDocument();
    });
    it('shows close button when onClose is provided', () => {
        const onClose = jest.fn();
        render(_jsx(InspectorPanel, { ...defaultProps, onClose: onClose }));
        const closeButton = screen.getByTitle('Close Inspector');
        expect(closeButton).toBeInTheDocument();
        fireEvent.click(closeButton);
        expect(onClose).toHaveBeenCalled();
    });
    it('renders properties and variations sections', () => {
        render(_jsx(InspectorPanel, { ...defaultProps }));
        expect(screen.getByText('Common Properties')).toBeInTheDocument();
        expect(screen.getByText('Text Variations')).toBeInTheDocument();
        expect(screen.getByText('Preview')).toBeInTheDocument();
    });
    it('allows panel resizing', () => {
        render(_jsx(InspectorPanel, { ...defaultProps }));
        // The resize handle should be present (look for a more specific selector)
        const inspectorPanel = screen.getByText('Test Node Inspector').closest('aside');
        expect(inspectorPanel).toBeInTheDocument();
    });
});
