import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VariationList } from '../components/Inspector/VariationList';

// Mock the graph store
jest.mock('../graphStore', () => ({)
  useGraphStore: () => ({,)
  addVariation: jest.fn(),
  removeVariation: jest.fn(),
  updateVariation: jest.fn(),
  reorderVariations: jest.fn(),
}
}));
describe('VariationList', () => {
  const defaultProps = {
  nodeId: 'test-node',
  variations: ['variation 1', 'variation 2', 'variation 3'],
};
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders variations correctly', () => {
    render(<VariationList {...defaultProps} />);
    expect(screen.getByText('variation 1')).toBeInTheDocument();
    expect(screen.getByText('variation 2')).toBeInTheDocument();
    expect(screen.getByText('variation 3')).toBeInTheDocument();
  });
  it('shows variation count in the label', () => {
    render(<VariationList {...defaultProps} />);
    expect(screen.getByText('Variations (3)')).toBeInTheDocument();
  });
  it('shows add input and button', () => {
    render(<VariationList {...defaultProps} />);
    expect(screen.getByPlaceholderText('Add a variation...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });
  it('shows empty state when no variations', () => {
    render(<VariationList {...defaultProps} variations={[]} />);
    expect(screen.getByText('No variations yet. Add some above.')).toBeInTheDocument();
  });
  it('allows toggling quick entry mode', () => {
    render(<VariationList {...defaultProps} allowQuickEntry={true} />);
    const quickButton = screen.getByRole('button', { name: 'Quick' });
    fireEvent.click(quickButton);
    expect(screen.getByPlaceholderText('Enter variations separated by commas...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add All' })).toBeInTheDocument();
  });
  it('shows remove buttons for each variation', () => {
    render(<VariationList {...defaultProps} />);
    const removeButtons = screen.getAllByText('×');
    expect(removeButtons).toHaveLength(3);
  });
  it('makes variations draggable', () => {
    render(<VariationList {...defaultProps} />);
    const variations = screen.getAllByText(/variation [123]/);
    variations.forEach(variation => {)
  const parent = variation.closest('div[draggable="true"]');
      expect(parent).toHaveAttribute('draggable', 'true');
    });
  });
});