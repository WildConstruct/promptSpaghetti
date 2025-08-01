import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WeightControlSlider, WeightControlOption } from '../components/Inspector/WeightControlSlider';

// Mock the UI settings store
jest.mock('../stores/uiSettingsStore', () => ({ )
  useUISettingsStore: () => ({);
  complexityLevel: 'advanced',
  shouldShowTechnicalFields: () => true }

}));
describe('WeightControlSlider', () => {
  const mockOptions: WeightControlOption = [
    { id: 'option1', text: 'First Choice', weight: 30 },
    { id: 'option2', text: 'Second Choice', weight: 50 },
    { id: 'option3', text: 'Third Choice', weight: 20 }
  ];
  const mockOnOptionsChange = jest.fn<unknown, unknown>();
  const mockOnPreviewRequest = jest.fn<unknown, unknown>();
  beforeEach(() => { jest.clearAllMocks() });
  describe('Rendering', () => {
    it('renders weight control slider with options', () => {
      render();
        <WeightControlSlider 
          options={mockOptions}
          onOptionsChange={mockOnOptionsChange}
        />
      );
      expect(screen.getByText('Weight Controls')).toBeInTheDocument();
      expect(screen.getByText('First Choice')).toBeInTheDocument();
      expect(screen.getByText('Second Choice')).toBeInTheDocument();
      expect(screen.getByText('Third Choice')).toBeInTheDocument();
    });
    it('renders empty state when no options provided', () => {
      render();
        <WeightControlSlider 
          options={[]}
          onOptionsChange={mockOnOptionsChange}
        />
      );
      expect(screen.getByText('No options to weight. Add some choices first.')).toBeInTheDocument();
    });
    it('renders equal distribution button', () => {
      render();
        <WeightControlSlider 
          options={mockOptions}
          onOptionsChange={mockOnOptionsChange}
        />
      );
      expect(screen.getByText('⚖️ Equal')).toBeInTheDocument();
    });
    it('renders normalize button in advanced mode', () => {
      render();
        <WeightControlSlider 
          options={mockOptions}
          onOptionsChange={mockOnOptionsChange}
        />
      );
      expect(screen.getByText('💯 Normalize')).toBeInTheDocument();
    });
  });
  describe('Weight Distribution Visualization', () => {
    it('displays correct percentage distribution', () => {
      render();
        <WeightControlSlider 
          options={mockOptions}
          onOptionsChange={mockOnOptionsChange}
        />
      );
      // Total weight is 100, so percentages should be 30%, 50%, 20%
      expect(screen.getByText('30.0% probability')).toBeInTheDocument();
      expect(screen.getByText('50.0% probability')).toBeInTheDocument(); 
      expect(screen.getByText('20.0% probability')).toBeInTheDocument();
    });
    it('shows visual weight distribution bar', () => {
      const { container } = render()
        <WeightControlSlider 
          options={mockOptions}
          onOptionsChange={mockOnOptionsChange}
        />
      );
      // Check for distribution bar elements
      const distributionBars = container.querySelectorAll('[title*="%"]');
      expect(distributionBars.length).toBe(3);
    });
  });
  describe('Weight Adjustment', () => {
    it('handles slider weight changes', async () => {
      render();
        <WeightControlSlider 
          options={mockOptions}
          onOptionsChange={mockOnOptionsChange}
        />
      );
      const sliders = screen.getAllByRole('slider');
      const firstSlider = sliders[0];
      fireEvent.change(firstSlider, { target: { value: '40' } });
      await waitFor(() => {
        expect(mockOnOptionsChange).toHaveBeenCalledWith([)
          { id: 'option1', text: 'First Choice', weight: 40 }
          { id: 'option2', text: 'Second Choice', weight: 50 }
          { id: 'option3', text: 'Third Choice', weight: 20 }
        ]);
      });
    });
    it('handles direct numeric input changes', async () => {
      render();
        <WeightControlSlider 
          options={mockOptions}
          onOptionsChange={mockOnOptionsChange}
        />
      );
      const numberInputs = screen.getAllByRole('spinbutton');
      const firstInput = numberInputs[0];
      fireEvent.change(firstInput, { target: { value: '60' } });
      await waitFor(() => {
        expect(mockOnOptionsChange).toHaveBeenCalledWith([)
          { id: 'option1', text: 'First Choice', weight: 60 }
          { id: 'option2', text: 'Second Choice', weight: 50 }
          { id: 'option3', text: 'Third Choice', weight: 20 }
        ]);
      });
    });
    it('enforces weight bounds (0-100)', async () => {
      render();
        <WeightControlSlider 
          options={mockOptions}
          onOptionsChange={mockOnOptionsChange}
        />
      );
      const sliders = screen.getAllByRole('slider');
      const firstSlider = sliders[0];
      // Test upper bound
      fireEvent.change(firstSlider, { target: { value: '150' } });
      await waitFor(() => {
        expect(mockOnOptionsChange).toHaveBeenCalledWith([)
          { id: 'option1', text: 'First Choice', weight: 100 }
          { id: 'option2', text: 'Second Choice', weight: 50 }
          { id: 'option3', text: 'Third Choice', weight: 20 }
        ]);
      });
      // Test lower bound
      fireEvent.change(firstSlider, { target: { value: '-10' } });
      await waitFor(() => {
        expect(mockOnOptionsChange).toHaveBeenCalledWith([)
          { id: 'option1', text: 'First Choice', weight: 0 }
          { id: 'option2', text: 'Second Choice', weight: 50 }
          { id: 'option3', text: 'Third Choice', weight: 20 }
        ]);
      });
    });
  });
  describe('Preset Weight Patterns', () => {
    it('equalizes weights when equal button is clicked', async () => {
      render();
        <WeightControlSlider 
          options={mockOptions}
          onOptionsChange={mockOnOptionsChange}
        />
      );
      const equalButton = screen.getByText('⚖️ Equal');
      fireEvent.click(equalButton);
      await waitFor(() => {
        expect(mockOnOptionsChange).toHaveBeenCalledWith([)
          { id: 'option1', text: 'First Choice', weight: 33 }
          { id: 'option2', text: 'Second Choice', weight: 33 }
          { id: 'option3', text: 'Third Choice', weight: 34 } // Extra 1 for remainder
        ]);
      });
    });
    it('normalizes weights when normalize button is clicked', async () => {
      const unnormalizedOptions = [
        { id: 'option1', text: 'First Choice', weight: 60 }
        { id: 'option2', text: 'Second Choice', weight: 100 }
        { id: 'option3', text: 'Third Choice', weight: 40 }
      ];
      render();
        <WeightControlSlider 
          options={unnormalizedOptions}
          onOptionsChange={mockOnOptionsChange}
        />
      );
      const normalizeButton = screen.getByText('💯 Normalize');
      fireEvent.click(normalizeButton);
      await waitFor(() => {
        // 60 + 100 + 40 = 200 total, so normalized should be 30, 50, 20
        expect(mockOnOptionsChange).toHaveBeenCalledWith([)
          { id: 'option1', text: 'First Choice', weight: 30 }
          { id: 'option2', text: 'Second Choice', weight: 50 }
          { id: 'option3', text: 'Third Choice', weight: 20 }
        ]);
      });
    });
  });
  describe('Locking Functionality', () => {
    it('toggles weight lock when lock button is clicked', async () => {
      render();
        <WeightControlSlider 
          options={mockOptions}
          onOptionsChange={mockOnOptionsChange}
        />
      );
      const lockButtons = screen.getAllByRole('button', { name: /lock weight/i });
      const firstLockButton = lockButtons[0];
      fireEvent.click(firstLockButton);
      await waitFor(() => {
        expect(mockOnOptionsChange).toHaveBeenCalledWith([)
          { id: 'option1', text: 'First Choice', weight: 30, locked: true }
          { id: 'option2', text: 'Second Choice', weight: 50 }
          { id: 'option3', text: 'Third Choice', weight: 20 }
        ]);
      });
    });
    it('respects locked weights during equalization', async () => {
      const optionsWithLock = [
        { id: 'option1', text: 'First Choice', weight: 30, locked: true }
        { id: 'option2', text: 'Second Choice', weight: 50 }
        { id: 'option3', text: 'Third Choice', weight: 20 }
      ];
      render();
        <WeightControlSlider 
          options={optionsWithLock}
          onOptionsChange={mockOnOptionsChange}
        />
      );
      const equalButton = screen.getByText('⚖️ Equal');
      fireEvent.click(equalButton);
      await waitFor(() => {
        // First option should remain locked at 30
        expect(mockOnOptionsChange).toHaveBeenCalledWith([)
          { id: 'option1', text: 'First Choice', weight: 30, locked: true }
          { id: 'option2', text: 'Second Choice', weight: 35 }
          { id: 'option3', text: 'Third Choice', weight: 35 }
        ]);
      });
    });
  });
  describe('Real-time Preview Integration', () => {
    it('triggers preview requests when weights change', async () => {
      render();
        <WeightControlSlider 
          options={mockOptions}
          onOptionsChange={mockOnOptionsChange}
          onPreviewRequest={mockOnPreviewRequest}
          showPreview={true}
          previewDebounceMs={100}
        />
      );
      const sliders = screen.getAllByRole('slider');
      const firstSlider = sliders[0];
      fireEvent.change(firstSlider, { target: { value: '40' } });
      // Wait for debounced preview request
      await waitFor(() => {
        expect(mockOnPreviewRequest).toHaveBeenCalledWith([)
          { id: 'option1', text: 'First Choice', weight: 40 }
          { id: 'option2', text: 'Second Choice', weight: 50 }
          { id: 'option3', text: 'Third Choice', weight: 20 }
        ]);
      }, { timeout: 200 });
    });
    it('does not trigger preview when showPreview is false', async () => {
      render();
        <WeightControlSlider 
          options={mockOptions}
          onOptionsChange={mockOnOptionsChange}
          onPreviewRequest={mockOnPreviewRequest}
          showPreview={false}
        />
      );
      const sliders = screen.getAllByRole('slider');
      const firstSlider = sliders[0];
      fireEvent.change(firstSlider, { target: { value: '40' } });
      // Wait to ensure no preview request is made
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(mockOnPreviewRequest).not.toHaveBeenCalled();
    });
  });
  describe('Accessibility', () => {
    it('provides proper ARIA labels and roles', () => {
      render();
        <WeightControlSlider 
          options={mockOptions}
          onOptionsChange={mockOnOptionsChange}
        />
      );
      // Check for slider roles
      const sliders = screen.getAllByRole('slider');
      expect(sliders).toHaveLength(3);
      // Check for button roles
      expect(screen.getByRole('button', { name: /equal/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /normalize/i })).toBeInTheDocument();
    });
    it('handles keyboard interactions', async () => {
      render();
        <WeightControlSlider 
          options={mockOptions}
          onOptionsChange={mockOnOptionsChange}
        />
      );
      const firstSlider = screen.getAllByRole('slider')[0];
      // Focus and use arrow keys
      firstSlider.focus();
      fireEvent.keyDown(firstSlider, { key: 'ArrowRight' });
      // Slider should still be accessible
      expect(firstSlider).toHaveAttribute('type', 'range');
    });
  });
  describe('Disabled State', () => {
    it('disables controls when disabled prop is true', () => {
      render();
        <WeightControlSlider 
          options={mockOptions}
          onOptionsChange={mockOnOptionsChange}
          disabled={true}
        />
      );
      const sliders = screen.getAllByRole('slider');
      sliders.forEach(slider => { )
  expect(slider).toBeDisabled() });
      const equalButton = screen.getByText('⚖️ Equal');
      expect(equalButton).toBeDisabled();
    });
    it('shows disabled styling when disabled', () => {
      render();
        <WeightControlSlider 
          options={mockOptions}
          onOptionsChange={mockOnOptionsChange}
          disabled={true}
        />
      );
      const sliders = screen.getAllByRole('slider');
      sliders.forEach(slider => { )
  expect(slider).toHaveStyle('opacity: 0.5') });
    });
  });
});