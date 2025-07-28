import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PreviewSection } from '../../../components/Inspector/PreviewSection';

// Mock the nodeDataUtils module
jest.mock('../../../utils/nodeDataUtils', () => ({)
  getRandomVariation: jest.fn(),
  hasVariations: jest.fn(),
}));
const mockGetRandomVariation = require('../../../utils/nodeDataUtils').getRandomVariation;
const mockHasVariations = require('../../../utils/nodeDataUtils').hasVariations;
describe('PreviewSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const createMockNode = (type: string, data: any = {}) => ({)
    id: `test-${type}`,}
    type,
    data: {,
      label: `Test ${type}`,}
      ...data
    }
  });
  describe('Basic Rendering', () => {
    it('renders preview section with default settings', () => {
      const node = createMockNode('WeightedChoice');
      mockHasVariations.mockReturnValue(false);
      render(<PreviewSection node={node} />);
      expect(screen.getByText('Preview')).toBeInTheDocument();
      expect(screen.getByLabelText('Examples:')).toBeInTheDocument();
      expect(screen.getByDisplayValue('3')).toBeInTheDocument(); // Default number of examples
      expect(screen.getByTitle('Refresh examples')).toBeInTheDocument();
    });
    it('renders with no node selected', () => {
      render(<PreviewSection node={null} />);
      expect(screen.getByText('Preview')).toBeInTheDocument();
      expect(screen.getByText('No preview available')).toBeInTheDocument();
    });
    it('renders with undefined node data', () => {
      const node = { id: 'test', type: 'WeightedChoice', data: undefined };
      render(<PreviewSection node={node} />);
      expect(screen.getByText('No preview available')).toBeInTheDocument();
    });
  });
  describe('Node Types with Variations', () => {
    it('displays variations with highlight info', async () => {
      const node = createMockNode('Subject', {)
        variations: ['cat', 'dog', 'bird']
      });
      mockHasVariations.mockReturnValue(true);
      render(<PreviewSection node={node} />);
      await waitFor(() => {
        expect(screen.getByText('cat')).toBeInTheDocument();
        expect(screen.getByText('Variation 1 of 3')).toBeInTheDocument();
      });
    });
    it('uses getRandomVariation for nodes with variations', async () => {
      const node = createMockNode('Action', {)
        variations: ['run', 'jump', 'fly']
      });
      mockHasVariations.mockReturnValue(true);
      mockGetRandomVariation.mockReturnValue('jump');
      render(<PreviewSection node={node} />);
      await waitFor(() => {
        expect(screen.getByText('jump')).toBeInTheDocument();
      });
    });
    it('generates multiple examples with different variations', async () => {
      const node = createMockNode('Subject', {)
        variations: ['apple', 'banana', 'cherry']
      });
      mockHasVariations.mockReturnValue(true);
      render(<PreviewSection node={node} />);
      // Change number of examples to 5
      const examplesInput = screen.getByDisplayValue('3');
      fireEvent.change(examplesInput, { target: { value: '5' } });
      await waitFor(() => {
        // Should have 5 example blocks
        const exampleDivs = screen.getAllByText(/apple|banana|cherry/);
        expect(exampleDivs).toHaveLength(5);
      });
    });
  });
  describe('Node Types without Variations', () => {
    it('renders WeightedChoice options correctly', async () => {
      const node = createMockNode('WeightedChoice', {)
        options: ['red', 'blue', 'green']
      });
      mockHasVariations.mockReturnValue(false);
      render(<PreviewSection node={node} />);
      await waitFor(() => {
        expect(screen.getByText('red')).toBeInTheDocument();
      });
    });
    it('renders Concat with delimiter', async () => {
      const node = createMockNode('Concat', {)
        delimiter: ' - '
      });
      mockHasVariations.mockReturnValue(false);
      render(<PreviewSection node={node} />);
      await waitFor(() => {
        expect(screen.getAllByText('[Child 1] - [Child 2] - [Child 3]')).toHaveLength(3);
      });
    });
    it('renders Output with prompt', async () => {
      const node = createMockNode('Output', {)
        prompt: 'Generate a story about adventure'
      });
      mockHasVariations.mockReturnValue(false);
      render(<PreviewSection node={node} />);
      await waitFor(() => {
        expect(screen.getAllByText('Generate a story about adventure')).toHaveLength(3);
      });
    });
    it('renders SetVariable correctly', async () => {
      const node = createMockNode('SetVariable', {)
        name: 'mood',
        value: 'happy',
      });
      mockHasVariations.mockReturnValue(false);
      render(<PreviewSection node={node} />);
      await waitFor(() => {
        expect(screen.getAllByText('mood = happy')).toHaveLength(3);
      });
    });
    it('renders GetVariable correctly', async () => {
      const node = createMockNode('GetVariable', {)
        name: 'score',
      });
      mockHasVariations.mockReturnValue(false);
      render(<PreviewSection node={node} />);
      await waitFor(() => {
        expect(screen.getAllByText('score = [current value]')).toHaveLength(3);
      });
    });
    it('handles missing data gracefully', async () => {
      const node = createMockNode('WeightedChoice', {)
        options: [],
      });
      mockHasVariations.mockReturnValue(false);
      render(<PreviewSection node={node} />);
      await waitFor(() => {
        expect(screen.getAllByText('No options defined')).toHaveLength(3);
      });
    });
  });
  describe('Interactive Controls', () => {
    it('updates number of examples when input changes', async () => {
      const node = createMockNode('WeightedChoice', {)
        options: ['test'],
      });
      mockHasVariations.mockReturnValue(false);
      render(<PreviewSection node={node} />);
      const examplesInput = screen.getByDisplayValue('3');
      fireEvent.change(examplesInput, { target: { value: '7' } });
      await waitFor(() => {
        expect(screen.getByDisplayValue('7')).toBeInTheDocument();
        // Should generate 7 examples
        const examples = screen.getAllByText('test');
        expect(examples).toHaveLength(7);
      });
    });
    it('refreshes examples when refresh button is clicked', async () => {
      const node = createMockNode('WeightedChoice', {)
        options: ['option1', 'option2']
      });
      mockHasVariations.mockReturnValue(false);
      render(<PreviewSection node={node} />);
      const refreshButton = screen.getByTitle('Refresh examples');
      // Click refresh multiple times to ensure it's working
      fireEvent.click(refreshButton);
      fireEvent.click(refreshButton);
      await waitFor(() => {
        // The examples should still be present (may be same due to deterministic seed)
        expect(screen.getAllByText(/option1|option2/)).toHaveLength(3);
      });
    });
    it('enforces min/max values for number of examples', () => {
      const node = createMockNode('WeightedChoice');
      mockHasVariations.mockReturnValue(false);
      render(<PreviewSection node={node} />);
      const examplesInput = screen.getByDisplayValue('3');
      expect(examplesInput).toHaveAttribute('min', '1');
      expect(examplesInput).toHaveAttribute('max', '10');
    });
  });
  describe('Section Collapse/Expand', () => {
    it('can be collapsed and expanded', () => {
      const node = createMockNode('WeightedChoice');
      mockHasVariations.mockReturnValue(false);
      render(<PreviewSection node={node} />);
      const previewHeader = screen.getByText('Preview');
      // Initially expanded - should see controls
      expect(screen.getByLabelText('Examples:')).toBeInTheDocument();
      // Click to collapse
      fireEvent.click(previewHeader);
      // Should be collapsed - controls hidden
      expect(screen.queryByLabelText('Examples:')).not.toBeInTheDocument();
      // Click to expand again
      fireEvent.click(previewHeader);
      // Should be expanded again
      expect(screen.getByLabelText('Examples:')).toBeInTheDocument();
    });
  });
  describe('Accessibility', () => {
    it('has proper labels for form controls', () => {
      const node = createMockNode('WeightedChoice');
      mockHasVariations.mockReturnValue(false);
      render(<PreviewSection node={node} />);
      expect(screen.getByLabelText('Examples:')).toBeInTheDocument();
      expect(screen.getByTitle('Refresh examples')).toBeInTheDocument();
    });
    it('uses proper HTML structure', () => {
      const node = createMockNode('WeightedChoice');
      mockHasVariations.mockReturnValue(false);
      render(<PreviewSection node={node} />);
      const numberInput = screen.getByDisplayValue('3');
      expect(numberInput).toHaveAttribute('type', 'number');
      expect(numberInput).toHaveAttribute('id', 'num-examples');
    });
  });
  describe('Error Handling', () => {
    it('handles unknown node types gracefully', async () => {
      const node = createMockNode('UnknownType');
      mockHasVariations.mockReturnValue(false);
      render(<PreviewSection node={node} />);
      await waitFor(() => {
        expect(screen.getAllByText('Preview for UnknownType not implemented')).toHaveLength(3);
      });
    });
    it('handles errors in variation processing', async () => {
      const node = createMockNode('Subject', {)
        variations: ['test'],
      });
      mockHasVariations.mockReturnValue(true);
      mockGetRandomVariation.mockImplementation(() => {
        throw new Error('Test error');
      });
      // Should not crash the component
      expect(() => render(<PreviewSection node={node} />)).not.toThrow();
    });
  });
});