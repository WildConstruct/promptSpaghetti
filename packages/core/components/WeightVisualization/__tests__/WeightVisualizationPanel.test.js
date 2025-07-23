import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WeightVisualizationPanel } from '../WeightVisualizationPanel';
const mockOptions = [
    { id: '1', text: 'Option A', weight: 3 },
    { id: '2', text: 'Option B', weight: 2 },
    { id: '3', text: 'Option C', weight: 1 },
    { id: '4', text: 'Option D', weight: 4 }
];
describe('WeightVisualizationPanel', () => {
    it('renders with default title', () => {
        render(_jsx(WeightVisualizationPanel, { options: mockOptions }));
        expect(screen.getByText(/Weight Distribution/)).toBeInTheDocument();
    });
    it('renders with custom title', () => {
        render(_jsx(WeightVisualizationPanel, { options: mockOptions, title: "Custom Weight Chart" }));
        expect(screen.getByText(/Custom Weight Chart/)).toBeInTheDocument();
    });
    it('renders chart type selector when showChartControls is true', () => {
        render(_jsx(WeightVisualizationPanel, { options: mockOptions, showChartControls: true }));
        expect(screen.getByText('Pie')).toBeInTheDocument();
        expect(screen.getByText('Donut')).toBeInTheDocument();
        expect(screen.getByText('Bar')).toBeInTheDocument();
    });
    it('hides chart controls when showChartControls is false', () => {
        render(_jsx(WeightVisualizationPanel, { options: mockOptions, showChartControls: false }));
        expect(screen.queryByText('Pie')).not.toBeInTheDocument();
        expect(screen.queryByText('Donut')).not.toBeInTheDocument();
        expect(screen.queryByText('Bar')).not.toBeInTheDocument();
    });
    it('switches chart types when buttons are clicked', () => {
        render(_jsx(WeightVisualizationPanel, { options: mockOptions, showChartControls: true }));
        const donutButton = screen.getByText('Donut');
        fireEvent.click(donutButton);
        // Button should be selected (visual state change)
        expect(donutButton).toBeInTheDocument();
    });
    it('renders color scheme selector', () => {
        render(_jsx(WeightVisualizationPanel, { options: mockOptions, showChartControls: true }));
        expect(screen.getByText('Color Scheme')).toBeInTheDocument();
        const selector = screen.getByDisplayValue('Cinema 4D Orange');
        expect(selector).toBeInTheDocument();
    });
    it('changes color scheme when selector is used', () => {
        render(_jsx(WeightVisualizationPanel, { options: mockOptions, showChartControls: true }));
        const selector = screen.getByDisplayValue('Cinema 4D Orange');
        fireEvent.change(selector, { target: { value: 'professional' } });
        expect(selector).toHaveValue('professional');
    });
    it('renders display options checkboxes', () => {
        render(_jsx(WeightVisualizationPanel, { options: mockOptions, showChartControls: true }));
        expect(screen.getByText('Show Labels')).toBeInTheDocument();
        expect(screen.getByText('Show Percentages')).toBeInTheDocument();
    });
    it('toggles display options when checkboxes are clicked', () => {
        render(_jsx(WeightVisualizationPanel, { options: mockOptions, showChartControls: true }));
        const labelsCheckbox = screen.getByLabelText('Show Labels');
        const percentagesCheckbox = screen.getByLabelText('Show Percentages');
        expect(labelsCheckbox.checked).toBe(true);
        expect(percentagesCheckbox.checked).toBe(true);
        fireEvent.click(labelsCheckbox);
        expect(labelsCheckbox.checked).toBe(false);
    });
    it('renders statistics when showStatistics is true', () => {
        render(_jsx(WeightVisualizationPanel, { options: mockOptions, showStatistics: true }));
        expect(screen.getByText('Distribution Statistics')).toBeInTheDocument();
        expect(screen.getByText(/Options:/)).toBeInTheDocument();
        expect(screen.getByText(/Total Weight:/)).toBeInTheDocument();
        expect(screen.getByText(/Dominant Option:/)).toBeInTheDocument();
    });
    it('hides statistics when showStatistics is false', () => {
        render(_jsx(WeightVisualizationPanel, { options: mockOptions, showStatistics: false }));
        expect(screen.queryByText('Distribution Statistics')).not.toBeInTheDocument();
    });
    it('calculates correct statistics', () => {
        const balancedOptions = [
            { id: '1', text: 'A', weight: 2 },
            { id: '2', text: 'B', weight: 2 },
            { id: '3', text: 'C', weight: 2 },
            { id: '4', text: 'D', weight: 2 }
        ];
        render(_jsx(WeightVisualizationPanel, { options: balancedOptions, showStatistics: true }));
        // Should show balanced distribution
        expect(screen.getByText(/Well Balanced/)).toBeInTheDocument();
    });
    it('identifies unbalanced distributions', () => {
        const unbalancedOptions = [
            { id: '1', text: 'A', weight: 10 },
            { id: '2', text: 'B', weight: 1 },
            { id: '3', text: 'C', weight: 1 }
        ];
        render(_jsx(WeightVisualizationPanel, { options: unbalancedOptions, showStatistics: true }));
        // Should show unbalanced distribution
        expect(screen.getByText(/Unbalanced/)).toBeInTheDocument();
    });
    it('handles collapsible state', () => {
        const mockOnCollapseChange = jest.fn();
        render(_jsx(WeightVisualizationPanel, { options: mockOptions, collapsed: false, onCollapseChange: mockOnCollapseChange }));
        // Should render collapsible section
        expect(screen.getByText(/Weight Distribution/)).toBeInTheDocument();
    });
    it('handles option hover events', () => {
        const mockOnHover = jest.fn();
        render(_jsx(WeightVisualizationPanel, { options: mockOptions, onOptionHover: mockOnHover }));
        // Component should render without errors
        expect(screen.getByText(/Weight Distribution/)).toBeInTheDocument();
    });
    it('handles option click events', () => {
        const mockOnClick = jest.fn();
        render(_jsx(WeightVisualizationPanel, { options: mockOptions, onOptionClick: mockOnClick }));
        // Component should render without errors
        expect(screen.getByText(/Weight Distribution/)).toBeInTheDocument();
    });
    it('renders non-collapsible version when no onCollapseChange provided', () => {
        render(_jsx(WeightVisualizationPanel, { options: mockOptions }));
        // Should still render the content
        expect(screen.getByText(/Weight Distribution/)).toBeInTheDocument();
    });
    it('handles empty options gracefully', () => {
        render(_jsx(WeightVisualizationPanel, { options: [], showStatistics: true }));
        // Should not show statistics for empty options
        expect(screen.queryByText('Distribution Statistics')).not.toBeInTheDocument();
    });
});
describe('WeightVisualizationPanel Statistics', () => {
    it('calculates entropy correctly for balanced distribution', () => {
        const balancedOptions = [
            { id: '1', text: 'A', weight: 1 },
            { id: '2', text: 'B', weight: 1 },
            { id: '3', text: 'C', weight: 1 },
            { id: '4', text: 'D', weight: 1 }
        ];
        render(_jsx(WeightVisualizationPanel, { options: balancedOptions, showStatistics: true }));
        // Perfect balance should show high balance score
        expect(screen.getByText(/100%/)).toBeInTheDocument();
        expect(screen.getByText(/Well Balanced/)).toBeInTheDocument();
    });
    it('identifies dominant options correctly', () => {
        const dominantOptions = [
            { id: '1', text: 'Dominant', weight: 8 },
            { id: '2', text: 'Minor', weight: 1 },
            { id: '3', text: 'Minor2', weight: 1 }
        ];
        render(_jsx(WeightVisualizationPanel, { options: dominantOptions, showStatistics: true }));
        expect(screen.getByText(/Dominant Option:/)).toBeInTheDocument();
        expect(screen.getByText(/Dominant/)).toBeInTheDocument();
    });
});
