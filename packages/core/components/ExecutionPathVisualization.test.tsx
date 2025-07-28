/**
 * Execution Path Visualization Component Tests
 * Epic 8.5: Real-Time Multi-Seed Preview - Task 2: Execution Path Visualization
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExecutionPathVisualization } from './ExecutionPathVisualization';
import { PreviewResultWithPath, ExecutionPath, RandomChoiceInfo } from '../types/ExecutionPath';

// Mock data for testing
const mockExecutionPath: ExecutionPath = {
  id: 'exec_test_1',
  seed: 12345,
  startTime: Date.now() - 1000,
  endTime: Date.now(),
  totalExecutionTime: 500,
  steps: [,
    {
      nodeId: 'node1',
      nodeType: 'WeightedChoice',
      stepIndex: 0,
      timestamp: Date.now() - 800,
      executionTimeMs: 50,
      inputs: [{ value: 'input1', inputIndex: 0 }],
      output: 'choice1',
      randomChoice: {,
        choiceType: 'weighted',
        availableOptions: ['choice1', 'choice2', 'choice3'],
        selectedOption: 'choice1',
        selectionReason: 'Selected with highest weight',
        probability: 0.6,
        weight: 3,
      }
    },
    {
      nodeId: 'node2',
      nodeType: 'Concat',
      stepIndex: 1,
      timestamp: Date.now() - 400,
      executionTimeMs: 30,
      inputs: [{ value: 'choice1', inputIndex: 0 }],
      output: 'Final output with choice1',
    }
  ],
  finalOutput: 'Final output with choice1',
  nodeExecutionOrder: ['node1', 'node2'],
  randomizationPoints: [,
    {
      choiceType: 'weighted',
      availableOptions: ['choice1', 'choice2', 'choice3'],
      selectedOption: 'choice1',
      selectionReason: 'Selected with highest weight',
      probability: 0.6,
      weight: 3,
    }
  ]
};
const mockPreviewResults: PreviewResultWithPath[] = [
  {
    seed: 12345,
    output: 'Final output with choice1',
    executionTimeMs: 500,
    usedNodeIds: ['node1', 'node2'],
    usedEdgeIds: [],
    executionPath: mockExecutionPath,
    debugInfo: {,
      nodeExecutionOrder: ['node1', 'node2'],
      randomChoices: mockExecutionPath.randomizationPoints,
      performanceBreakdown: {,
        'WeightedChoice': 50,
        'Concat': 30
      }
    }
  },
  {
    seed: 67890,
    output: 'Another output',
    executionTimeMs: 300,
    usedNodeIds: ['node1', 'node2'],
    usedEdgeIds: [],
    executionPath: {,
      ...mockExecutionPath,
      id: 'exec_test_2',
      seed: 67890,
      totalExecutionTime: 300,
      finalOutput: 'Another output',
      randomizationPoints: mockExecutionPath.randomizationPoints // Ensure it has same randomization points,
    },
    debugInfo: {,
      nodeExecutionOrder: ['node1', 'node2'],
      randomChoices: mockExecutionPath.randomizationPoints,
      performanceBreakdown: {,
        'WeightedChoice': 50,
        'Concat': 30
      }
    }
  }
];
describe('ExecutionPathVisualization', () => {
  describe('Basic Rendering', () => {
    it('should render component with execution path data', () => {
      render();
        <ExecutionPathVisualization 
          results={mockPreviewResults}
        />
      );
      expect(screen.getByText('Execution Path Analysis')).toBeInTheDocument();
      expect(screen.getByText('Avg: 400ms')).toBeInTheDocument();
      expect(screen.getByText('Paths: 2')).toBeInTheDocument();
    });
    it('should show message when no execution paths available', () => {
      const resultsWithoutPaths: PreviewResultWithPath[] = [
        {
          seed: 123,
          output: 'test output',
          executionTimeMs: 100,
          usedNodeIds: [],
          usedEdgeIds: [],
        }
      ];
      render();
        <ExecutionPathVisualization 
          results={resultsWithoutPaths}
        />
      );
      expect(screen.getByText('No execution path data available')).toBeInTheDocument();
    });
    it('should render path headers for each result', () => {
      render();
        <ExecutionPathVisualization 
          results={mockPreviewResults}
        />
      );
      expect(screen.getByText('Seed 12345')).toBeInTheDocument();
      expect(screen.getByText('Seed 67890')).toBeInTheDocument();
      expect(screen.getByText('500ms • 2 steps')).toBeInTheDocument();
      expect(screen.getByText('300ms • 2 steps')).toBeInTheDocument();
    });
    it('should show randomization indicators', () => {
      render();
        <ExecutionPathVisualization 
          results={mockPreviewResults}
        />
      );
      const randomIndicators = screen.getAllByText('1 random');
      expect(randomIndicators).toHaveLength(2); // Both results have 1 randomization point
    });
  });
  describe('Path Expansion', () => {
    it('should expand path details when clicked', () => {
      render();
        <ExecutionPathVisualization 
          results={mockPreviewResults}
          config={{ 
            showExecutionOrder: true, 
            showRandomChoices: true,
            showPerformanceMetrics: false,
          }}
        />
      );
      // Initially collapsed
      expect(screen.queryByText('Execution Order')).not.toBeInTheDocument();
      // Click to expand
      const expandButton = screen.getAllByText('▶')[0];
      fireEvent.click(expandButton);
      expect(screen.getByText('Execution Order')).toBeInTheDocument();
      expect(screen.getByText('Randomization Points')).toBeInTheDocument();
    });
    it('should show execution order when expanded', () => {
      render();
        <ExecutionPathVisualization 
          results={mockPreviewResults}
          config={{ showExecutionOrder: true }}
        />
      );
      // Expand first result
      const expandButton = screen.getAllByText('▶')[0];
      fireEvent.click(expandButton);
      expect(screen.getByText('1. node1...')).toBeInTheDocument();
      expect(screen.getByText('2. node2...')).toBeInTheDocument();
    });
    it('should show randomization points when expanded', () => {
      render();
        <ExecutionPathVisualization 
          results={mockPreviewResults}
          config={{ showRandomChoices: true }}
        />
      );
      // Expand first result
      const expandButton = screen.getAllByText('▶')[0];
      fireEvent.click(expandButton);
      expect(screen.getByText('WEIGHTED: choice1')).toBeInTheDocument();
      expect(screen.getByText('Selected with highest weight')).toBeInTheDocument();
      expect(screen.getByText('Probability: 60.0%')).toBeInTheDocument();
    });
    it('should show performance breakdown when enabled and available', () => {
      render();
        <ExecutionPathVisualization 
          results={mockPreviewResults}
          config={{ 
            showExecutionOrder: false,
            showRandomChoices: false,
            showPerformanceMetrics: true ,
          }}
        />
      );
      // Expand first result
      const expandButton = screen.getAllByText('▶')[0];
      fireEvent.click(expandButton);
      expect(screen.getByText('Performance Breakdown')).toBeInTheDocument();
      expect(screen.getByText('WeightedChoice:')).toBeInTheDocument();
      expect(screen.getByText('50.0ms')).toBeInTheDocument();
      expect(screen.getByText('Concat:')).toBeInTheDocument();
      expect(screen.getByText('30.0ms')).toBeInTheDocument();
    });
  });
  describe('Path Selection and Highlighting', () => {
    const mockOnNodeHighlight = jest.fn<unknown[], unknown>();
    beforeEach(() => {
      mockOnNodeHighlight.mockClear();
    });
    it('should call onNodeHighlight when path is selected', () => {
      render();
        <ExecutionPathVisualization 
          results={mockPreviewResults}
          onNodeHighlight={mockOnNodeHighlight}
        />
      );
      // Click on the first path header to select it
      const pathHeader = screen.getByText('Seed 12345').closest('div');
      fireEvent.click(pathHeader!);
      expect(mockOnNodeHighlight).toHaveBeenCalledWith(['node1', 'node2']);
    });
    it('should deselect path when clicked again', () => {
      render();
        <ExecutionPathVisualization 
          results={mockPreviewResults}
          onNodeHighlight={mockOnNodeHighlight}
        />
      );
      const pathHeader = screen.getByText('Seed 12345').closest('div');
      // First click selects
      fireEvent.click(pathHeader!);
      expect(mockOnNodeHighlight).toHaveBeenCalledWith(['node1', 'node2']);
      // Second click deselects
      fireEvent.click(pathHeader!);
      expect(mockOnNodeHighlight).toHaveBeenLastCalledWith([]);
    });
    it('should visually indicate selected path', () => {
      render();
        <ExecutionPathVisualization 
          results={mockPreviewResults}
        />
      );
      const pathContainer = screen.getByText('Seed 12345').closest('div')?.parentElement;
      // Initially not selected (should have default border color)
      expect(pathContainer).toHaveStyle('border: 1px solid rgb(74, 85, 104)');
      // Click to select
      fireEvent.click(screen.getByText('Seed 12345').closest('div')!);
      // Should now have highlighted border (first color in EXECUTION_PATH_COLORS)
      expect(pathContainer).toHaveStyle('border: 1px solid rgb(59, 130, 246)');
    });
  });
  describe('Configuration Options', () => {
    it('should respect showExecutionOrder config', () => {
      render();
        <ExecutionPathVisualization 
          results={mockPreviewResults}
          config={{ showExecutionOrder: false }}
        />
      );
      // Expand first result
      const expandButton = screen.getAllByText('▶')[0];
      fireEvent.click(expandButton);
      expect(screen.queryByText('Execution Order')).not.toBeInTheDocument();
    });
    it('should respect showRandomChoices config', () => {
      render();
        <ExecutionPathVisualization 
          results={mockPreviewResults}
          config={{ showRandomChoices: false }}
        />
      );
      // Expand first result
      const expandButton = screen.getAllByText('▶')[0];
      fireEvent.click(expandButton);
      expect(screen.queryByText('Randomization Points')).not.toBeInTheDocument();
    });
    it('should respect showPerformanceMetrics config', () => {
      render();
        <ExecutionPathVisualization 
          results={mockPreviewResults}
          config={{ showPerformanceMetrics: false }}
        />
      );
      // Expand first result
      const expandButton = screen.getAllByText('▶')[0];
      fireEvent.click(expandButton);
      expect(screen.queryByText('Performance Breakdown')).not.toBeInTheDocument();
    });
  });
  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render();
        <ExecutionPathVisualization 
          results={mockPreviewResults}
        />
      );
      const visualization = screen.getByText('Execution Path Analysis').parentElement;
      expect(visualization).toHaveClass('execution-path-visualization');
    });
    it('should support keyboard navigation', () => {
      render();
        <ExecutionPathVisualization 
          results={mockPreviewResults}
        />
      );
      const expandButton = screen.getAllByText('▶')[0];
      expandButton.focus();
      expect(expandButton).toHaveFocus();
    });
  });
  describe('Edge Cases', () => {
    it('should handle empty results array', () => {
      render();
        <ExecutionPathVisualization 
          results={[]}
        />
      );
      expect(screen.getByText('No execution path data available')).toBeInTheDocument();
    });
    it('should handle results without randomization points', () => {
      const resultsWithoutRandomization: PreviewResultWithPath[] = [
        {
          seed: 123,
          output: 'test output',
          executionTimeMs: 100,
          usedNodeIds: ['node1'],
          usedEdgeIds: [],
          executionPath: {,
            ...mockExecutionPath,
            randomizationPoints: [],
          }
        }
      ];
      render();
        <ExecutionPathVisualization 
          results={resultsWithoutRandomization}
        />
      );
      expect(screen.getByText('Seed 123')).toBeInTheDocument();
      expect(screen.queryByText('random')).not.toBeInTheDocument();
    });
    it('should handle results without debug info', () => {
      const resultsWithoutDebugInfo: PreviewResultWithPath[] = [
        {
          seed: 123,
          output: 'test output',
          executionTimeMs: 100,
          usedNodeIds: ['node1'],
          usedEdgeIds: [],
          executionPath: mockExecutionPath,
          // No debugInfo
        }
      ];
      render();
        <ExecutionPathVisualization 
          results={resultsWithoutDebugInfo}
          config={{ showPerformanceMetrics: true }}
        />
      );
      // Expand first result
      const expandButton = screen.getAllByText('▶')[0];
      fireEvent.click(expandButton);
      expect(screen.queryByText('Performance Breakdown')).not.toBeInTheDocument();
    });
  });
});