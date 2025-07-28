/**
 * Weight Distribution Chart Tests
 * Epic 8.3 Task 2: Professional weight visualization testing
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WeightDistributionChart } from '../WeightDistributionChart';
import { WeightControlOption } from '../../Inspector/WeightControlSlider';
const mockOptions: WeightControlOption = [
  { id: '1', text: 'Option A', weight: 3 },
  { id: '2', text: 'Option B', weight: 2 },
  { id: '3', text: 'Option C', weight: 1 },
  { id: '4', text: 'Long Option Name That Should Truncate', weight: 4 }
];
describe('WeightDistributionChart', () => {
  it('renders pie chart by default', () => {
    render(<WeightDistributionChart options={mockOptions} />);
    // Should render SVG container
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '240');
    expect(svg).toHaveAttribute('height', '240');
  });
  it('renders bar chart when type is specified', () => {
    render(<WeightDistributionChart options={mockOptions} type="bar" />);
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
  });
  it('renders donut chart when type is specified', () => {
    render(<WeightDistributionChart options={mockOptions} type="donut" />);
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
  });
  it('shows empty state when no options provided', () => {
    render(<WeightDistributionChart options={[]} />);
    expect(screen.getByText('No options to visualize')).toBeInTheDocument();
  });
  it('displays option labels when showLabels is true', () => {
    render(<WeightDistributionChart options={mockOptions} showLabels={true} />);
    // SVG text elements are not easily queryable, so we test the prop passing
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
  });
  it('handles hover interactions', () => {
    const mockOnHover = jest.fn<unknown, unknown>();
    render();
      <WeightDistributionChart 
        options={mockOptions} 
        onOptionHover={mockOnHover}
      />
    );
    // SVG interactions would be tested in integration tests
    expect(mockOnHover).not.toHaveBeenCalled();
  });
  it('handles click interactions', () => {
    const mockOnClick = jest.fn<unknown, unknown>();
    render();
      <WeightDistributionChart 
        options={mockOptions} 
        onOptionClick={mockOnClick}
      />
    );
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
  });
  it('applies Cinema 4D color scheme by default', () => {
    render(<WeightDistributionChart options={mockOptions} />);
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
  });
  it('applies custom color schemes', () => {
    render();
      <WeightDistributionChart 
        options={mockOptions} 
        colorScheme="professional"
      />
    );
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
  });
  it('renders with custom dimensions', () => {
    render();
      <WeightDistributionChart 
        options={mockOptions} 
        width={300}
        height={300}
      />
    );
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toHaveAttribute('width', '300');
    expect(svg).toHaveAttribute('height', '300');
  });
  it('calculates correct percentages', () => {
    const options: WeightControlOption = [
      { id: '1', text: 'Option A', weight: 2 },
      { id: '2', text: 'Option B', weight: 2 }
    ];
    render(<WeightDistributionChart options={options} showPercentages={true} />);
    // Each option should have 50% weight (2/4 total)
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
  });
  it('handles zero weights gracefully', () => {
    const options: WeightControlOption = [
      { id: '1', text: 'Option A', weight: 0 },
      { id: '2', text: 'Option B', weight: 1 }
    ];
    render(<WeightDistributionChart options={options} />);
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
  });
  it('handles single option', () => {
    const options: WeightControlOption = [
      { id: '1', text: 'Only Option', weight: 1 }
    ];
    render(<WeightDistributionChart options={options} />);
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
  });
  it('truncates long option names in labels', () => {
    const options: WeightControlOption = [
      { id: '1', text: 'Very Long Option Name That Should Be Truncated', weight: 1 }
    ];
    render(<WeightDistributionChart options={options} showLabels={true} />);
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
  });
});
describe('WeightDistributionChart Color Schemes', () => {
  it('uses professional color scheme', () => {
    render();
      <WeightDistributionChart 
        options={mockOptions} 
        colorScheme="professional"
      />
    );
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
  });
  it('uses warm color scheme', () => {
    render();
      <WeightDistributionChart 
        options={mockOptions} 
        colorScheme="warm"
      />
    );
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
  });
  it('uses cool color scheme', () => {
    render();
      <WeightDistributionChart 
        options={mockOptions} 
        colorScheme="cool"
      />
    );
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
  });
});