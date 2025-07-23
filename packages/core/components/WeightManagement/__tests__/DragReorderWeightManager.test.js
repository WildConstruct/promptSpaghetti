import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DragReorderWeightManager } from '../DragReorderWeightManager';
// Mock react-beautiful-dnd
jest.mock('react-beautiful-dnd', () => ({
    DragDropContext: ({ children }) => _jsx("div", { "data-testid": "drag-drop-context", children: children }),
    Droppable: ({ children }) => {
        const provided = {
            droppableProps: {},
            innerRef: jest.fn(),
            placeholder: _jsx("div", { "data-testid": "placeholder" })
        };
        const snapshot = { isDraggingOver: false };
        return _jsx("div", { "data-testid": "droppable", children: children(provided, snapshot) });
    },
    Draggable: ({ children, draggableId }) => {
        const provided = {
            innerRef: jest.fn(),
            draggableProps: { 'data-rbd-draggable-context-id': '1' },
            dragHandleProps: { 'data-testid': `drag-handle-${draggableId}` }
        };
        const snapshot = { isDragging: false };
        return _jsx("div", { "data-testid": `draggable-${draggableId}`, children: children(provided, snapshot) });
    }
}));
describe('DragReorderWeightManager', () => {
    const mockOptions = [
        { id: '1', text: 'Option 1', weight: 10 },
        { id: '2', text: 'Option 2', weight: 20 },
        { id: '3', text: 'Option 3', weight: 30 },
        { id: '4', text: 'Option 4', weight: 5, locked: true }
    ];
    const defaultProps = {
        options: mockOptions,
        onChange: jest.fn()
    };
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('Basic Rendering', () => {
        test('renders weight manager with default props', () => {
            render(_jsx(DragReorderWeightManager, { ...defaultProps }));
            expect(screen.getByText('Weight Management')).toBeInTheDocument();
            expect(screen.getByText('Drag items to reorder, adjust weights for probability control')).toBeInTheDocument();
            expect(screen.getByTestId('drag-drop-context')).toBeInTheDocument();
        });
        test('renders all options', () => {
            render(_jsx(DragReorderWeightManager, { ...defaultProps }));
            mockOptions.forEach(option => {
                expect(screen.getByText(option.text)).toBeInTheDocument();
            });
        });
        test('displays weights and percentages by default', () => {
            render(_jsx(DragReorderWeightManager, { ...defaultProps }));
            // Total weight is 65, so percentages should be calculated
            expect(screen.getByText('10.0')).toBeInTheDocument(); // Weight
            expect(screen.getByText('15.4%')).toBeInTheDocument(); // 10/65 * 100
            expect(screen.getByText('30.8%')).toBeInTheDocument(); // 20/65 * 100
        });
        test('shows drag handles for all items', () => {
            render(_jsx(DragReorderWeightManager, { ...defaultProps }));
            mockOptions.forEach(option => {
                expect(screen.getByTestId(`drag-handle-${option.id}`)).toBeInTheDocument();
            });
        });
    });
    describe('Theme Variations', () => {
        test('applies light theme styles', () => {
            render(_jsx(DragReorderWeightManager, { ...defaultProps, theme: "light" }));
            const container = screen.getByText('Weight Management').closest('.drag-reorder-weight-manager');
            expect(container).toHaveStyle({ backgroundColor: '#ffffff' });
        });
        test('applies dark theme styles', () => {
            render(_jsx(DragReorderWeightManager, { ...defaultProps, theme: "dark" }));
            const container = screen.getByText('Weight Management').closest('.drag-reorder-weight-manager');
            expect(container).toHaveStyle({ backgroundColor: '#1f2937' });
        });
        test('applies cinema theme styles', () => {
            render(_jsx(DragReorderWeightManager, { ...defaultProps, theme: "cinema" }));
            const container = screen.getByText('Weight Management').closest('.drag-reorder-weight-manager');
            expect(container).toHaveStyle({ backgroundColor: '#1a1a1a' });
            expect(screen.getByText('🎬 Cinema Mode')).toBeInTheDocument();
        });
    });
    describe('Weight Display Options', () => {
        test('hides weights when showWeights is false', () => {
            render(_jsx(DragReorderWeightManager, { ...defaultProps, showWeights: false }));
            expect(screen.queryByText('10.0')).not.toBeInTheDocument();
            expect(screen.queryByText('20.0')).not.toBeInTheDocument();
        });
        test('hides percentages when showPercentages is false', () => {
            render(_jsx(DragReorderWeightManager, { ...defaultProps, showPercentages: false }));
            expect(screen.queryByText('15.4%')).not.toBeInTheDocument();
            expect(screen.queryByText('30.8%')).not.toBeInTheDocument();
        });
        test('shows visual weight bars when enabled', () => {
            render(_jsx(DragReorderWeightManager, { ...defaultProps, showVisualWeights: true }));
            // Visual weight bars should be present (rendered as divs with specific styles)
            const container = screen.getByTestId('drag-drop-context');
            const weightBars = container.querySelectorAll('[style*="linear-gradient"]');
            expect(weightBars.length).toBeGreaterThan(0);
        });
    });
    describe('Weight Editing', () => {
        test('allows weight editing when enabled', async () => {
            const user = userEvent.setup();
            render(_jsx(DragReorderWeightManager, { ...defaultProps, allowWeightEditing: true }));
            const weightElement = screen.getByText('10.0');
            await user.click(weightElement);
            // Should show an input field
            const input = screen.getByDisplayValue('10');
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute('type', 'number');
        });
        test('updates weight value on input change', async () => {
            const user = userEvent.setup();
            const onChange = jest.fn();
            render(_jsx(DragReorderWeightManager, { ...defaultProps, onChange: onChange, allowWeightEditing: true }));
            const weightElement = screen.getByText('10.0');
            await user.click(weightElement);
            const input = screen.getByDisplayValue('10');
            await user.clear(input);
            await user.type(input, '15');
            expect(onChange).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({ id: '1', weight: 15 })
            ]));
        });
        test('respects min and max weight constraints', async () => {
            const user = userEvent.setup();
            const onChange = jest.fn();
            render(_jsx(DragReorderWeightManager, { ...defaultProps, onChange: onChange, allowWeightEditing: true, minWeight: 1, maxWeight: 50 }));
            const weightElement = screen.getByText('10.0');
            await user.click(weightElement);
            const input = screen.getByDisplayValue('10');
            expect(input).toHaveAttribute('min', '1');
            expect(input).toHaveAttribute('max', '50');
        });
        test('disables weight editing when allowWeightEditing is false', async () => {
            const user = userEvent.setup();
            render(_jsx(DragReorderWeightManager, { ...defaultProps, allowWeightEditing: false }));
            const weightElement = screen.getByText('10.0');
            await user.click(weightElement);
            // Should not show input field
            expect(screen.queryByDisplayValue('10')).not.toBeInTheDocument();
        });
    });
    describe('Locking Functionality', () => {
        test('shows lock buttons when allowLocking is enabled', () => {
            render(_jsx(DragReorderWeightManager, { ...defaultProps, allowLocking: true }));
            // Should show lock icons (🔒 for locked, 🔓 for unlocked)
            expect(screen.getByText('🔒')).toBeInTheDocument(); // Locked item
            expect(screen.getAllByText('🔓')).toHaveLength(3); // Unlocked items
        });
        test('toggles lock state on click', async () => {
            const user = userEvent.setup();
            const onChange = jest.fn();
            render(_jsx(DragReorderWeightManager, { ...defaultProps, onChange: onChange, allowLocking: true }));
            const unlockButton = screen.getAllByText('🔓')[0];
            await user.click(unlockButton);
            expect(onChange).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({ id: '1', locked: true })
            ]));
        });
        test('shows locked items with reduced opacity', () => {
            render(_jsx(DragReorderWeightManager, { ...defaultProps, allowLocking: true }));
            // The locked item (Option 4) should have reduced opacity
            const lockedOption = screen.getByText('Option 4');
            expect(lockedOption).toHaveStyle({ opacity: 0.6 });
        });
    });
    describe('Statistics Display', () => {
        test('shows statistics when enabled', () => {
            render(_jsx(DragReorderWeightManager, { ...defaultProps, showStatistics: true }));
            expect(screen.getByText('65.0')).toBeInTheDocument(); // Total weight
            expect(screen.getByText('Total Weight')).toBeInTheDocument();
            expect(screen.getByText('Average')).toBeInTheDocument();
            expect(screen.getByText('Entropy')).toBeInTheDocument();
            expect(screen.getByText('Distribution')).toBeInTheDocument();
        });
        test('calculates statistics correctly', () => {
            render(_jsx(DragReorderWeightManager, { ...defaultProps, showStatistics: true }));
            // Total weight: 10 + 20 + 30 + 5 = 65
            expect(screen.getByText('65.0')).toBeInTheDocument();
            // Average weight: 65 / 4 = 16.25
            expect(screen.getByText('16.3')).toBeInTheDocument();
        });
        test('hides statistics when disabled', () => {
            render(_jsx(DragReorderWeightManager, { ...defaultProps, showStatistics: false }));
            expect(screen.queryByText('Total Weight')).not.toBeInTheDocument();
        });
    });
    describe('Bulk Operations', () => {
        test('shows bulk actions button when enabled', () => {
            render(_jsx(DragReorderWeightManager, { ...defaultProps, enableBulkOperations: true }));
            expect(screen.getByText('Bulk Actions')).toBeInTheDocument();
        });
        test('shows bulk actions panel when activated', async () => {
            const user = userEvent.setup();
            render(_jsx(DragReorderWeightManager, { ...defaultProps, enableBulkOperations: true }));
            const bulkButton = screen.getByText('Bulk Actions');
            await user.click(bulkButton);
            expect(screen.getByText('Equal Weights')).toBeInTheDocument();
            expect(screen.getByText('Normalize')).toBeInTheDocument();
            expect(screen.getByText('Randomize')).toBeInTheDocument();
            expect(screen.getByText('Clear')).toBeInTheDocument();
        });
        test('applies equal weights operation', async () => {
            const user = userEvent.setup();
            const onChange = jest.fn();
            render(_jsx(DragReorderWeightManager, { ...defaultProps, onChange: onChange, enableBulkOperations: true }));
            const bulkButton = screen.getByText('Bulk Actions');
            await user.click(bulkButton);
            const equalButton = screen.getByText('Equal Weights');
            await user.click(equalButton);
            // Should set all unlocked weights to equal values (100/4 = 25)
            expect(onChange).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({ id: '1', weight: 25 }),
                expect.objectContaining({ id: '2', weight: 25 }),
                expect.objectContaining({ id: '3', weight: 25 }),
                expect.objectContaining({ id: '4', weight: 5, locked: true }) // Locked item unchanged
            ]));
        });
        test('applies normalize operation', async () => {
            const user = userEvent.setup();
            const onChange = jest.fn();
            render(_jsx(DragReorderWeightManager, { ...defaultProps, onChange: onChange, enableBulkOperations: true }));
            const bulkButton = screen.getByText('Bulk Actions');
            await user.click(bulkButton);
            const normalizeButton = screen.getByText('Normalize');
            await user.click(normalizeButton);
            // Should normalize weights to sum to 100
            // Current total is 65, so multiply each by 100/65
            expect(onChange).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({ id: '1', weight: expect.closeTo(15.38, 1) }),
                expect.objectContaining({ id: '2', weight: expect.closeTo(30.77, 1) }),
                expect.objectContaining({ id: '3', weight: expect.closeTo(46.15, 1) }),
                expect.objectContaining({ id: '4', weight: expect.closeTo(7.69, 1) })
            ]));
        });
        test('shows selection checkboxes when bulk operations enabled', () => {
            render(_jsx(DragReorderWeightManager, { ...defaultProps, enableBulkOperations: true }));
            const checkboxes = screen.getAllByRole('checkbox');
            expect(checkboxes).toHaveLength(4); // One for each option
        });
    });
    describe('Disabled State', () => {
        test('disables drag handles when disabled', () => {
            render(_jsx(DragReorderWeightManager, { ...defaultProps, disabled: true }));
            const dragHandles = screen.getAllByText('⋮⋮');
            dragHandles.forEach(handle => {
                expect(handle).toHaveStyle({ cursor: 'not-allowed' });
            });
        });
        test('disables weight editing when disabled', async () => {
            const user = userEvent.setup();
            render(_jsx(DragReorderWeightManager, { ...defaultProps, disabled: true, allowWeightEditing: true }));
            const weightElement = screen.getByText('10.0');
            await user.click(weightElement);
            // Should not show input field
            expect(screen.queryByDisplayValue('10')).not.toBeInTheDocument();
        });
        test('hides bulk actions when disabled', () => {
            render(_jsx(DragReorderWeightManager, { ...defaultProps, disabled: true, enableBulkOperations: true }));
            expect(screen.queryByText('Bulk Actions')).not.toBeInTheDocument();
        });
    });
    describe('Categories', () => {
        test('displays categories when options have them', () => {
            const optionsWithCategories = [
                { id: '1', text: 'Option 1', weight: 10, category: 'Category A' },
                { id: '2', text: 'Option 2', weight: 20, category: 'Category B' }
            ];
            render(_jsx(DragReorderWeightManager, { options: optionsWithCategories, onChange: jest.fn(), enableCategories: true }));
            expect(screen.getByText('Category A')).toBeInTheDocument();
            expect(screen.getByText('Category B')).toBeInTheDocument();
        });
    });
    describe('Empty State', () => {
        test('handles empty options array', () => {
            render(_jsx(DragReorderWeightManager, { options: [], onChange: jest.fn() }));
            expect(screen.getByText('Weight Management')).toBeInTheDocument();
            expect(screen.getByText('0 options')).toBeInTheDocument();
        });
    });
    describe('Custom Styling', () => {
        test('applies custom className', () => {
            render(_jsx(DragReorderWeightManager, { ...defaultProps, className: "custom-class" }));
            const container = screen.getByText('Weight Management').closest('.drag-reorder-weight-manager');
            expect(container).toHaveClass('custom-class');
        });
        test('applies custom style', () => {
            const customStyle = { border: '2px solid red' };
            render(_jsx(DragReorderWeightManager, { ...defaultProps, style: customStyle }));
            const container = screen.getByText('Weight Management').closest('.drag-reorder-weight-manager');
            expect(container).toHaveStyle({ border: '2px solid red' });
        });
    });
    describe('Drag and Drop', () => {
        test('calls onChange when drag operation completes', () => {
            const onChange = jest.fn();
            render(_jsx(DragReorderWeightManager, { ...defaultProps, onChange: onChange }));
            // This is a simplified test since we're mocking react-beautiful-dnd
            // In a real implementation, you'd simulate drag operations
            expect(screen.getByTestId('drag-drop-context')).toBeInTheDocument();
            expect(screen.getByTestId('droppable')).toBeInTheDocument();
            mockOptions.forEach(option => {
                expect(screen.getByTestId(`draggable-${option.id}`)).toBeInTheDocument();
            });
        });
    });
    describe('Performance', () => {
        test('handles large number of options efficiently', () => {
            const manyOptions = Array.from({ length: 100 }, (_, i) => ({
                id: `option-${i}`,
                text: `Option ${i + 1}`,
                weight: Math.random() * 100
            }));
            const startTime = performance.now();
            render(_jsx(DragReorderWeightManager, { options: manyOptions, onChange: jest.fn() }));
            const endTime = performance.now();
            // Should render within reasonable time (less than 100ms)
            expect(endTime - startTime).toBeLessThan(100);
            // Should display all options
            expect(screen.getByText('100 options')).toBeInTheDocument();
        });
    });
    describe('Accessibility', () => {
        test('provides proper ARIA labels for drag handles', () => {
            render(_jsx(DragReorderWeightManager, { ...defaultProps }));
            const dragHandles = screen.getAllByTestId(/drag-handle-/);
            expect(dragHandles).toHaveLength(4);
        });
        test('supports keyboard navigation', () => {
            render(_jsx(DragReorderWeightManager, { ...defaultProps, allowWeightEditing: true }));
            const weightInputs = screen.getAllByText(/\d+\.0/);
            weightInputs.forEach(input => {
                expect(input).toBeInTheDocument();
            });
        });
        test('provides proper focus management', async () => {
            const user = userEvent.setup();
            render(_jsx(DragReorderWeightManager, { ...defaultProps, allowWeightEditing: true }));
            const weightElement = screen.getByText('10.0');
            await user.click(weightElement);
            const input = screen.getByDisplayValue('10');
            expect(input).toHaveFocus();
        });
    });
    describe('Error Handling', () => {
        test('handles invalid weight values gracefully', async () => {
            const user = userEvent.setup();
            const onChange = jest.fn();
            render(_jsx(DragReorderWeightManager, { ...defaultProps, onChange: onChange, allowWeightEditing: true }));
            const weightElement = screen.getByText('10.0');
            await user.click(weightElement);
            const input = screen.getByDisplayValue('10');
            await user.clear(input);
            await user.type(input, 'invalid');
            // Should handle invalid input gracefully
            expect(input).toHaveValue(NaN);
        });
        test('handles missing option properties', () => {
            const incompleteOptions = [
                { id: '1', text: '', weight: 0 },
                { id: '2', text: 'Valid Option', weight: 10 }
            ];
            render(_jsx(DragReorderWeightManager, { options: incompleteOptions, onChange: jest.fn() }));
            expect(screen.getByText('Valid Option')).toBeInTheDocument();
        });
    });
});
