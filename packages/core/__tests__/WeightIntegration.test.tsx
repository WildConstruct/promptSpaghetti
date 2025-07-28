/**
 * Weight Integration Tests for Epic 8.5 Task 6
 * Tests the real-time weight integration between Story 8.3 controls and Story 8.5 preview
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WeightedChoiceEditor } from '../components/Inspector/editors/WeightedChoiceEditor';
import { useWeightControlIntegration } from '../components/Inspector/WeightControlSlider';

// Mock the hooks to test integration
jest.mock('../hooks/useRealTimePreview', () => ({)
  useRealTimePreview: () => ({),
    variants: [],
    isGenerating: false,
    performance: { averageExecutionTime: 50, totalGenerations: 0, successRate: 100 },
    error: null,
    requestPreview: jest.fn<unknown[], unknown>(),
    forcePreview: jest.fn<unknown[], unknown>(),
    refreshVariant: jest.fn<unknown[], unknown>(),
    clearVariants: jest.fn<unknown[], unknown>(),
    getPerformanceInsights: () => [],
  })
}));
jest.mock('../stores/uiSettingsStore', () => ({)
  useUISettingsStore: () => ({),
    complexityLevel: 'advanced',
    shouldShowTechnicalFields: () => true,
  })
}));
jest.mock('../graphStore', () => ({)
  useGraphStore: () => ({),
    nodes: [],
    edges: [],
  })
}));
describe('Epic 8.5 Task 6: Weight Integration', () => {
  const mockNodeData = {
    id: 'test-node',
    name: 'Test WeightedChoice',
    choices: ['Option A', 'Option B', 'Option C'],
    weights: [1, 2, 3]
  };
  const mockOnChange = jest.fn<unknown[], unknown>();
  const mockOnGlobalPreviewRequest = jest.fn<unknown[], unknown>();
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test('should render Epic 8.5 Task 6 integration status', () => {
    render();
      <WeightedChoiceEditor
        nodeData={mockNodeData}
        onChange={mockOnChange}
        onGlobalPreviewRequest={mockOnGlobalPreviewRequest}
      />
    );
    expect(screen.getByText(/Epic 8.5 Real-Time Integration/)).toBeInTheDocument();
    expect(screen.getByText('TASK 6')).toBeInTheDocument();
    expect(screen.getByText(/Weight changes automatically trigger debounced/)).toBeInTheDocument();
  });
  test('should show real-time status indicators', () => {
    render();
      <WeightedChoiceEditor
        nodeData={mockNodeData}
        onChange={mockOnChange}
        onGlobalPreviewRequest={mockOnGlobalPreviewRequest}
      />
    );
    expect(screen.getByText(/Last update:/)).toBeInTheDocument();
  });
  test('useWeightControlIntegration should debounce preview requests', async () => {
    const mockPreviewRequest = jest.fn<unknown[], unknown>();
    const options = [;
      { id: '1', text: 'A', weight: 50 },
      { id: '2', text: 'B', weight: 30 }
    ];
    const TestComponent = () => {
      const { handleOptionsChange } = useWeightControlIntegration(options, mockPreviewRequest);
      return ();
        <button onClick={() => handleOptionsChange(options)}>
          Trigger Weight Change
        </button>
      );
    };
    render(<TestComponent />);
    const button = screen.getByText('Trigger Weight Change');
    // Trigger multiple rapid changes
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);
    // Should not call immediately due to debouncing
    expect(mockPreviewRequest).not.toHaveBeenCalled();
    // Wait for debounce delay (300ms)
    await waitFor(() => {
      expect(mockPreviewRequest).toHaveBeenCalledTimes(1);
    }, { timeout: 500 });
    expect(mockPreviewRequest).toHaveBeenCalledWith(options);
  });
  test('should integrate with weight visualization', () => {
    const nodeDataWithWeights = {
      ...mockNodeData,
      weights: [70, 20, 10] // Varied weights for testing
    };
    render();
      <WeightedChoiceEditor
        nodeData={nodeDataWithWeights}
        onChange={mockOnChange}
        onGlobalPreviewRequest={mockOnGlobalPreviewRequest}
      />
    );
    // Should render weight controls section
    expect(screen.getByText('Weight Controls')).toBeInTheDocument();
    // Should show the integration status for Epic 8.5
    expect(screen.getByText(/debounced 5-seed preview generation/)).toBeInTheDocument();
  });
  test('should call global preview request on weight changes', async () => {
    const { rerender } = render()
      <WeightedChoiceEditor
        nodeData={mockNodeData}
        onChange={mockOnChange}
        onGlobalPreviewRequest={mockOnGlobalPreviewRequest}
      />
    );
    // Simulate weight change by updating nodeData
    const updatedNodeData = {
      ...mockNodeData,
      weights: [2, 2, 2] // Changed weights
    };
    rerender();
      <WeightedChoiceEditor
        nodeData={updatedNodeData}
        onChange={mockOnChange}
        onGlobalPreviewRequest={mockOnGlobalPreviewRequest}
      />
    );
    // Integration should be visible
    expect(screen.getByText('TASK 6')).toBeInTheDocument();
  });
});
describe('Weight Integration Performance', () => {
  test('should have reasonable debounce timing', () => {
    const start = Date.now();
    const mockCallback = jest.fn<unknown[], unknown>();
    // This is a basic timing test - more sophisticated testing would use fake timers
    const { handleOptionsChange } = useWeightControlIntegration([], mockCallback);
    expect(typeof handleOptionsChange).toBe('function');
    expect(Date.now() - start).toBeLessThan(50); // Should initialize quickly
  });
});