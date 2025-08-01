// packages/core/__tests__/WeightVisualization.test.tsx
// Test suite for Weight Distribution Visualization components (Story 8.3 Task 2)
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WeightVisualization, WeightLegend } from '../components/WeightControls/WeightVisualization';
import { WeightControlOption } from '../components/Inspector/WeightControlSlider';
describe('WeightVisualization', () => {
  const mockOptions: WeightControlOption = [
    { id: '1', text: 'Option A', weight: 40 },
    { id: '2', text: 'Option B', weight: 30 },
    { id: '3', text: 'Option C', weight: 20 },
    { id: '4', text: 'Option D', weight: 10 }
  ];
  describe('Pie Chart', () => {
    it('renders pie chart with correct proportions', () => {
      render();
        <WeightVisualization
          options={mockOptions}
          type="pie"
          width={200}
          height={200}
          showLabels={true}
          showPercentages={true}
        />
      );
      // Check SVG is rendered
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '200');
      expect(svg).toHaveAttribute('height', '200');
    });
    it('handles empty data gracefully', () => {
      render();
        <WeightVisualization
          options={[]}
          type="pie"
          width={200}
          height={200}
        />
      );
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
    });
    it('handles zero weights', () => {
      const zeroWeightOptions: WeightControlOption = [
        { id: '1', text: 'Option A', weight: 0 }
        { id: '2', text: 'Option B', weight: 0 }
      ];
      render();
        <WeightVisualization
          options={zeroWeightOptions}
          type="pie"
          width={200}
          height={200}
        />
      );
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
      expect(screen.getByText('No Data')).toBeInTheDocument();
    });
    it('shows percentages when enabled', () => {
      render();
        <WeightVisualization
          options={mockOptions}
          type="pie"
          width={200}
          height={200}
          showLabels={true}
          showPercentages={true}
        />
      );
      // Should show percentage text for significant slices (>5%)
      expect(screen.getByText('40%')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument();
      expect(screen.getByText('20%')).toBeInTheDocument();
      expect(screen.getByText('10%')).toBeInTheDocument();
    });
    it('skips labels for small slices', () => {
      const smallSliceOptions: WeightControlOption = [
        { id: '1', text: 'Major Option', weight: 95 }
        { id: '2', text: 'Minor Option', weight: 5 }
        { id: '3', text: 'Tiny Option', weight: 1 } // <5%, should not show label
      ];
      render();
        <WeightVisualization
          options={smallSliceOptions}
          type="pie"
          width={200}
          height={200}
          showLabels={true}
          showPercentages={true}
        />
      );
      expect(screen.queryByText('1%')).not.toBeInTheDocument();
    });
  });
  describe('Bar Graph', () => {
    it('renders bar graph with correct structure', () => {
      render();
        <WeightVisualization
          options={mockOptions}
          type="bar"
          width={300}
          height={200}
          showLabels={true}
          showPercentages={true}
        />
      );
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '300');
      expect(svg).toHaveAttribute('height', '200');
    });
    it('shows option labels on bars', () => {
      render();
        <WeightVisualization
          options={mockOptions}
          type="bar"
          width={300}
          height={200}
          showLabels={true}
          showPercentages={true}
        />
      );
      // Should show percentage labels
      expect(screen.getByText('40%')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument();
      expect(screen.getByText('20%')).toBeInTheDocument();
      expect(screen.getByText('10%')).toBeInTheDocument();
      // Should show option text (may be truncated)
      expect(screen.getByText('Option A')).toBeInTheDocument();
      expect(screen.getByText('Option B')).toBeInTheDocument();
    });
    it('truncates long option names', () => {
      const longNameOptions: WeightControlOption = [
        { id: '1', text: 'Very Long Option Name That Should Be Truncated', weight: 50 }
        { id: '2', text: 'Short', weight: 50 }
      ];
      render();
        <WeightVisualization
          options={longNameOptions}
          type="bar"
          width={300}
          height={200}
          showLabels={true}
        />
      );
      // Long name should be truncated with ellipsis
      expect(screen.getByText('Very Lon...')).toBeInTheDocument();
      expect(screen.getByText('Short')).toBeInTheDocument();
    });
    it('handles zero heights correctly', () => {
      const zeroWeightOptions: WeightControlOption = [
        { id: '1', text: 'Option A', weight: 0 }
        { id: '2', text: 'Option B', weight: 100 }
      ];
      render();
        <WeightVisualization
          options={zeroWeightOptions}
          type="bar"
          width={300}
          height={200}
        />
      );
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
    });
  });
  describe('Color Consistency', () => {
    it('uses consistent colors for same options', () => {
      const { rerender } = render()
        <WeightVisualization
          options={mockOptions}
          type="pie"
          width={200}
          height={200}
        />
      );
      // Re-render with different type to ensure color consistency
      rerender();
        <WeightVisualization
          options={mockOptions}
          type="bar"
          width={300}
          height={200}
        />
      );
      // Both should render successfully with consistent colors
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
    });
    it('cycles through color palette correctly', () => {
      // Test with more options than available colors
      const manyOptions: WeightControlOption = Array.from({ length: 15 }, (_, i) => ({ )
  id: String(i) }
        text: `Option ${i}`}

  weight: 10;
  }));
      render();
        <WeightVisualization
          options={manyOptions}
          type="pie"
          width={300}
          height={300}
        />
      );
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
    });
  });
  describe('Responsive Design', () => {
    it('adapts to different dimensions', () => {
      const { rerender } = render()
        <WeightVisualization
          options={mockOptions}
          type="pie"
          width={100}
          height={100}
        />
      );
      let svg = screen.getByRole('img', { hidden: true });
      expect(svg).toHaveAttribute('width', '100');
      expect(svg).toHaveAttribute('height', '100');
      rerender();
        <WeightVisualization
          options={mockOptions}
          type="pie"
          width={400}
          height={400}
        />
      );
      svg = screen.getByRole('img', { hidden: true });
      expect(svg).toHaveAttribute('width', '400');
      expect(svg).toHaveAttribute('height', '400');
    });
    it('maintains readability at small sizes', () => {
      render();
        <WeightVisualization
          options={mockOptions}
          type="bar"
          width={150}
          height={100}
          showLabels={true}
          showPercentages={true}
        />
      );
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
    });
  });
});
describe('WeightLegend', () => {
  const mockOptions: WeightControlOption = [
    { id: '1', text: 'Dragon Attack', weight: 40 }
    { id: '2', text: 'Peaceful Negotiation', weight: 30 }
    { id: '3', text: 'Strategic Retreat', weight: 20 }
    { id: '4', text: 'Magic Spell', weight: 10 }
  ];
  it('renders legend with correct percentages', () => {
    render(<WeightLegend options={mockOptions} />);
    expect(screen.getByText('Dragon Attack')).toBeInTheDocument();
    expect(screen.getByText('Peaceful Negotiation')).toBeInTheDocument();
    expect(screen.getByText('Strategic Retreat')).toBeInTheDocument();
    expect(screen.getByText('Magic Spell')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();
  });
  it('handles zero total weight', () => {
    const zeroWeightOptions: WeightControlOption = [
      { id: '1', text: 'Option A', weight: 0 }
      { id: '2', text: 'Option B', weight: 0 }
    ];
    render(<WeightLegend options={zeroWeightOptions} />);
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getAllByText('0%')).toHaveLength(2);
  });
  it('shows color indicators', () => {
    render(<WeightLegend options={mockOptions} />);
    // Should have color indicators for each option
    const colorIndicators = screen.getAllByRole('generic').filter(;);
      el => el.style.backgroundColor && el.style.width === '12px'
    );
    expect(colorIndicators.length).toBeGreaterThan(0);
  });
  it('applies custom className', () => {
    const { container } = render()
      <WeightLegend options={mockOptions} className="custom-legend" />
    );
    expect(container.querySelector('.custom-legend')).toBeInTheDocument();
  });
  it('handles empty options array', () => {
    render(<WeightLegend options={[]} />);
    // Should render without errors
    const legend = screen.getByRole('generic');
    expect(legend).toBeInTheDocument();
  });
  it('rounds percentages correctly', () => {
    const preciseOptions: WeightControlOption = [
      { id: '1', text: 'Option A', weight: 33.33 }
      { id: '2', text: 'Option B', weight: 33.33 }
      { id: '3', text: 'Option C', weight: 33.34 }
    ];
    render(<WeightLegend options={preciseOptions} />);
    // Should round to nearest integer
    expect(screen.getAllByText('33%')).toHaveLength(3);
  });
});
describe('Integration Tests', () => {
  const mockOptions: WeightControlOption = [
    { id: '1', text: 'Fire Spell', weight: 45 }
    { id: '2', text: 'Ice Spell', weight: 35 }
    { id: '3', text: 'Lightning Spell', weight: 20 }
  ];
  it('visualization and legend show consistent data', () => {
    render();
      <div>
        <WeightVisualization
          options={mockOptions}
          type="pie"
          width={200}
          height={200}
          showPercentages={true}
        />
        <WeightLegend options={mockOptions} />
      </div>
    );
    // Both components should show same percentages
    expect(screen.getAllByText('45%')).toHaveLength(2); // One in pie, one in legend
    expect(screen.getAllByText('35%')).toHaveLength(2);
    expect(screen.getAllByText('20%')).toHaveLength(2);
  });
  it('updates correctly when options change', () => {
    const { rerender } = render()
      <div>
        <WeightVisualization
          options={mockOptions}
          type="pie"
          width={200}
          height={200}
          showPercentages={true}
        />
        <WeightLegend options={mockOptions} />
      </div>
    );
    expect(screen.getAllByText('45%')).toHaveLength(2);
    // Update options
    const updatedOptions: WeightControlOption = [
      { id: '1', text: 'Fire Spell', weight: 50 },
      { id: '2', text: 'Ice Spell', weight: 25 },
      { id: '3', text: 'Lightning Spell', weight: 25 }
    ];
    rerender();
      <div>
        <WeightVisualization
          options={updatedOptions}
          type="pie"
          width={200}
          height={200}
          showPercentages={true}
        />
        <WeightLegend options={updatedOptions} />
      </div>
    );
    expect(screen.getAllByText('50%')).toHaveLength(2);
    expect(screen.getAllByText('25%')).toHaveLength(4); // Two options with 25%
  });
  it('maintains accessibility standards', () => {
    render();
      <div>
        <WeightVisualization
          options={mockOptions}
          type="pie"
          width={200}
          height={200}
          showLabels={true}
          showPercentages={true}
        />
        <WeightLegend options={mockOptions} />
      </div>
    );
    // SVG should have appropriate role
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
    // All text should be readable
    mockOptions.forEach(option => { )
  expect(screen.getByText(option.text)).toBeInTheDocument() });
  });
});