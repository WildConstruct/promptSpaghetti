import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeightedChoiceEditor } from '../components/Inspector/editors/WeightedChoiceEditor';

// Mock the graph store
jest.mock('../graphStore', () => ({)
  useGraphStore: () => ({),
    addVariation: jest.fn(),
    removeVariation: jest.fn(),
    updateVariation: jest.fn(),
    reorderVariations: jest.fn(),
  })
}));
describe('VariationList Integration with Editors', () => {
  const mockNodeData = {
    id: 'test-choice-node',
    type: 'WeightedChoice' as const,
    label: 'Test Choice',
    choices: ['Option A', 'Option B'],
    weights: [1, 2],
    variations: [],
  };
  const mockOnChange = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders WeightedChoiceEditor with enhanced VariationList', () => {
    render();
      <WeightedChoiceEditor
        nodeId={mockNodeData.id}
        nodeData={mockNodeData}
        schema={null as any}
        onChange={mockOnChange}
      />
    );
    // Check that the enhanced VariationList features are present
    expect(screen.getByText('Choice Options')).toBeInTheDocument();
    expect(screen.getAllByText('Option A')).toHaveLength(2); // One in list, one in weights
    expect(screen.getAllByText('Option B')).toHaveLength(2); // One in list, one in weights
    // Check for Quick Entry button (from enhanced VariationList)
    expect(screen.getByRole('button', { name: /quick/i })).toBeInTheDocument();
  });
  it('supports adding new choices via the enhanced interface', () => {
    render();
      <WeightedChoiceEditor
        nodeId={mockNodeData.id}
        nodeData={mockNodeData}
        schema={null as any}
        onChange={mockOnChange}
      />
    );
    // Find the input field for adding new choices
    const addInput = screen.getByPlaceholderText(/Enter choice option/i);
    expect(addInput).toBeInTheDocument();
    // Add a new choice
    fireEvent.change(addInput, { target: { value: 'Option C' } });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    // Verify onChange was called with the updated choices
    expect(mockOnChange).toHaveBeenCalledWith({)
      choices: ['Option A', 'Option B', 'Option C'],
      weights: [1, 2, 1]
    });
  });
  it('supports quick entry mode toggle', () => {
    render();
      <WeightedChoiceEditor
        nodeId={mockNodeData.id}
        nodeData={mockNodeData}
        schema={null as any}
        onChange={mockOnChange}
      />
    );
    // Click the Quick entry toggle
    const quickButton = screen.getByRole('button', { name: /quick/i });
    fireEvent.click(quickButton);
    // Should show the quick entry textarea
    expect(screen.getByPlaceholderText(/Enter variations separated by commas/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add All/i })).toBeInTheDocument();
  });
  it('shows variation count in the interface', () => {
    const nodeDataWithChoices = {
      ...mockNodeData,
      choices: ['A', 'B', 'C'],
      weights: [1, 1, 1]
    };
    render();
      <WeightedChoiceEditor
        nodeId={nodeDataWithChoices.id}
        nodeData={nodeDataWithChoices}
        schema={null as any}
        onChange={mockOnChange}
      />
    );
    // Should show the count of variations
    expect(screen.getByText(/\(3\)/)).toBeInTheDocument();
  });
});