/**
 * Variance Analysis Component Tests
 * Epic 8.5: Real-Time Multi-Seed Preview - Task 5: Creative Variance Analysis
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VarianceAnalysis } from './VarianceAnalysis';
import { PreviewResultWithPath } from '../types/ExecutionPath';
import { VarianceSuggestion } from '../services/VarianceAnalysisService';

// Mock the variance analysis service
jest.mock('../services/VarianceAnalysisService', () => ({
  varianceAnalysisService: {
    analyzeVariance: jest.fn<unknown[], unknown>(),
    createDiversityIndicators: jest.fn<unknown[], unknown>(),
    getVarianceLevelInfo: jest.fn<unknown[], unknown>()
  }
}));

const mockVarianceService = require('../services/VarianceAnalysisService').varianceAnalysisService;

const createMockResult = (seed: number, output: string): PreviewResultWithPath => ({
  seed,
  output,
  executionTimeMs: 100,
  usedNodeIds: ['node1'],
  usedEdgeIds: ['edge1'],
  executionPath: {
    id: `exec_${seed}`,
    seed,
    startTime: Date.now() - 1000,
    endTime: Date.now(),
    totalExecutionTime: 100,
    steps: [],
    finalOutput: output,
    nodeExecutionOrder: ['node1'],
    randomizationPoints: []
  }
});

const mockAnalysis = {
  overallVariance: 'medium' as const,
  varianceScore: 0.65,
  diversityMetrics: {
    outputLengthVariance: 0.4,
    vocabularyDiversity: 0.7,
    structuralDiversity: 0.5,
    executionPathDiversity: 0.3
  },
  creativeRange: {
    uniqueElements: ['unique', 'elements', 'here'],
    commonElements: ['common', 'words'],
    repetitionRate: 0.3,
    creativityScore: 0.75
  },
  suggestions: [
    {
      type: 'increase' as const,
      category: 'weights' as const,
      message: 'Adjust weight distributions for more variation',
      impact: 'high' as const,
      actionable: true
    },
    {
      type: 'optimize' as const,
      category: 'content' as const,
      message: 'Good balance achieved',
      impact: 'low' as const,
      actionable: false
    }
  ]
};

const mockIndicators = [
  {
    metric: 'Length Variance',
    value: 0.4,
    level: 'medium' as const,
    description: 'Variation in output length',
    color: '#f59e0b'
  },
  {
    metric: 'Vocabulary Diversity',
    value: 0.7,
    level: 'high' as const,
    description: 'Word diversity score',
    color: '#10b981'
  },
  {
    metric: 'Creativity Score',
    value: 0.75,
    level: 'high' as const,
    description: 'Overall creativity metric',
    color: '#10b981'
  }
];

const mockVarianceInfo = {
  color: '#f59e0b',
  background: '#fffbeb',
  border: '#fed7aa',
  icon: '🟡',
  description: 'Good balance of consistency and variety'
};

describe('VarianceAnalysis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVarianceService.analyzeVariance.mockReturnValue(mockAnalysis as unknown);
    mockVarianceService.createDiversityIndicators.mockReturnValue(mockIndicators as unknown);
    mockVarianceService.getVarianceLevelInfo.mockReturnValue(mockVarianceInfo as unknown);
  });

  describe('Basic Rendering', () => {
    it('should render variance analysis for multiple results', () => {
      const results = [
        createMockResult(1, 'First result'),
        createMockResult(2, 'Second result')
      ];

      render(<VarianceAnalysis results={results} />);

      expect(screen.getByText('Creative Variance Analysis')).toBeInTheDocument();
      expect(screen.getByText('MEDIUM VARIANCE')).toBeInTheDocument();
      expect(screen.getByText('Good balance of consistency and variety')).toBeInTheDocument();
    });

    it('should show message for insufficient results', () => {
      const results = [createMockResult(1, 'Single result')];

      render(<VarianceAnalysis results={results} />);

      expect(screen.getByText('Generate more results to analyze creative variance')).toBeInTheDocument();
    });

    it('should render compact mode correctly', () => {
      const results = [
        createMockResult(1, 'First result'),
        createMockResult(2, 'Second result')
      ];

      render(<VarianceAnalysis results={results} compact={true} />);

      expect(screen.getByText('MEDIUM VARIANCE')).toBeInTheDocument();
      expect(screen.getByText('65%')).toBeInTheDocument();
    });
  });

  describe('Diversity Metrics', () => {
    it('should display diversity metric cards', () => {
      const results = [
        createMockResult(1, 'First result'),
        createMockResult(2, 'Second result')
      ];

      render(<VarianceAnalysis results={results} />);

      expect(screen.getByText('📈 Diversity Metrics')).toBeInTheDocument();
      expect(screen.getByText('Length Variance')).toBeInTheDocument();
      expect(screen.getByText('Vocabulary Diversity')).toBeInTheDocument();
      expect(screen.getByText('Creativity Score')).toBeInTheDocument();
    });

    it('should show metric levels correctly', () => {
      const results = [
        createMockResult(1, 'First result'),
        createMockResult(2, 'Second result')
      ];

      render(<VarianceAnalysis results={results} />);

      expect(screen.getByText('MEDIUM')).toBeInTheDocument();
      expect(screen.getAllByText('HIGH')).toHaveLength(2); // Vocabulary and Creativity
    });

    it('should display metric descriptions', () => {
      const results = [
        createMockResult(1, 'First result'),
        createMockResult(2, 'Second result')
      ];

      render(<VarianceAnalysis results={results} />);

      expect(screen.getByText('Variation in output length')).toBeInTheDocument();
      expect(screen.getByText('Word diversity score')).toBeInTheDocument();
      expect(screen.getByText('Overall creativity metric')).toBeInTheDocument();
    });
  });

  describe('Creative Range Summary', () => {
    it('should display creative range information', () => {
      const results = [
        createMockResult(1, 'First result'),
        createMockResult(2, 'Second result')
      ];

      render(<VarianceAnalysis results={results} />);

      expect(screen.getByText('🎨 Creative Range Summary')).toBeInTheDocument();
      expect(screen.getByText('Unique Elements (3)')).toBeInTheDocument();
      expect(screen.getByText('Common Elements (2)')).toBeInTheDocument();
    });

    it('should show unique and common elements', () => {
      const results = [
        createMockResult(1, 'First result'),
        createMockResult(2, 'Second result')
      ];

      render(<VarianceAnalysis results={results} />);

      expect(screen.getByText('unique, elements, here')).toBeInTheDocument();
      expect(screen.getByText('common, words')).toBeInTheDocument();
    });

    it('should display repetition rate and creativity score', () => {
      const results = [
        createMockResult(1, 'First result'),
        createMockResult(2, 'Second result')
      ];

      render(<VarianceAnalysis results={results} />);

      expect(screen.getByText('Repetition Rate')).toBeInTheDocument();
      expect(screen.getByText('30.0%')).toBeInTheDocument();
      expect(screen.getByText('Creativity Score')).toBeInTheDocument();
      expect(screen.getByText('75/100')).toBeInTheDocument();
    });
  });

  describe('Suggestions', () => {
    it('should display optimization suggestions', () => {
      const results = [
        createMockResult(1, 'First result'),
        createMockResult(2, 'Second result')
      ];

      render(<VarianceAnalysis results={results} />);

      expect(screen.getByText('💡 Optimization Suggestions')).toBeInTheDocument();
      expect(screen.getByText('Adjust weight distributions for more variation')).toBeInTheDocument();
      expect(screen.getByText('Good balance achieved')).toBeInTheDocument();
    });

    it('should show suggestion categories and impacts', () => {
      const results = [
        createMockResult(1, 'First result'),
        createMockResult(2, 'Second result')
      ];

      render(<VarianceAnalysis results={results} />);

      expect(screen.getByText('WEIGHTS')).toBeInTheDocument();
      expect(screen.getByText('CONTENT')).toBeInTheDocument();
      expect(screen.getAllByText('HIGH IMPACT')).toHaveLength(1);
      expect(screen.getAllByText('LOW IMPACT')).toHaveLength(1);
    });

    it('should handle suggestion clicks for actionable suggestions', () => {
      const mockOnSuggestionClick = jest.fn<unknown[], unknown>();
      const results = [
        createMockResult(1, 'First result'),
        createMockResult(2, 'Second result')
      ];

      render(
        <VarianceAnalysis 
          results={results} 
          onSuggestionClick={mockOnSuggestionClick}
        />
      );

      const actionableSuggestion = screen.getByText('Adjust weight distributions for more variation').closest('div');
      fireEvent.click(actionableSuggestion!);

      expect(mockOnSuggestionClick).toHaveBeenCalledWith(mockAnalysis.suggestions[0]);
    });

    it('should not handle clicks for non-actionable suggestions', () => {
      const mockOnSuggestionClick = jest.fn<unknown[], unknown>();
      const results = [
        createMockResult(1, 'First result'),
        createMockResult(2, 'Second result')
      ];

      render(
        <VarianceAnalysis 
          results={results} 
          onSuggestionClick={mockOnSuggestionClick}
        />
      );

      const nonActionableSuggestion = screen.getByText('Good balance achieved').closest('div');
      fireEvent.click(nonActionableSuggestion!);

      expect(mockOnSuggestionClick).not.toHaveBeenCalled();
    });
  });

  describe('Variance Levels', () => {
    it('should display low variance styling', () => {
      const lowVarianceAnalysis = {
        ...mockAnalysis,
        overallVariance: 'low' as const,
        varianceScore: 0.2
      };

      const lowVarianceInfo = {
        color: '#ef4444',
        background: '#fef2f2',
        border: '#fecaca',
        icon: '🔴',
        description: 'Results are very similar'
      };

      mockVarianceService.analyzeVariance.mockReturnValue(lowVarianceAnalysis as unknown);
      mockVarianceService.getVarianceLevelInfo.mockReturnValue(lowVarianceInfo as unknown);

      const results = [
        createMockResult(1, 'First result'),
        createMockResult(2, 'Second result')
      ];

      render(<VarianceAnalysis results={results} />);

      expect(screen.getByText('🔴')).toBeInTheDocument();
      expect(screen.getByText('LOW VARIANCE')).toBeInTheDocument();
      expect(screen.getByText('Results are very similar')).toBeInTheDocument();
    });

    it('should display high variance styling', () => {
      const highVarianceAnalysis = {
        ...mockAnalysis,
        overallVariance: 'high' as const,
        varianceScore: 0.9
      };

      const highVarianceInfo = {
        color: '#10b981',
        background: '#f0fdf4',
        border: '#bbf7d0',
        icon: '🟢',
        description: 'High creative diversity'
      };

      mockVarianceService.analyzeVariance.mockReturnValue(highVarianceAnalysis as unknown);
      mockVarianceService.getVarianceLevelInfo.mockReturnValue(highVarianceInfo as unknown);

      const results = [
        createMockResult(1, 'First result'),
        createMockResult(2, 'Second result')
      ];

      render(<VarianceAnalysis results={results} />);

      expect(screen.getByText('🟢')).toBeInTheDocument();
      expect(screen.getByText('HIGH VARIANCE')).toBeInTheDocument();
      expect(screen.getByText('High creative diversity')).toBeInTheDocument();
    });
  });

  describe('Service Integration', () => {
    it('should call variance analysis service with correct parameters', () => {
      const results = [
        createMockResult(1, 'First result'),
        createMockResult(2, 'Second result')
      ];

      render(<VarianceAnalysis results={results} />);

      expect(mockVarianceService.analyzeVariance).toHaveBeenCalledWith(results);
      expect(mockVarianceService.createDiversityIndicators).toHaveBeenCalledWith(mockAnalysis);
      expect(mockVarianceService.getVarianceLevelInfo).toHaveBeenCalledWith('medium');
    });

    it('should recalculate when results change', () => {
      const { rerender } = render(
        <VarianceAnalysis results={[createMockResult(1, 'First result')]} />
      );

      expect(mockVarianceService.analyzeVariance).toHaveBeenCalledTimes(1);

      const newResults = [
        createMockResult(1, 'First result'),
        createMockResult(2, 'Second result')
      ];

      rerender(<VarianceAnalysis results={newResults} />);

      expect(mockVarianceService.analyzeVariance).toHaveBeenCalledTimes(2);
      expect(mockVarianceService.analyzeVariance).toHaveBeenLastCalledWith(newResults);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty suggestions', () => {
      const analysisWithoutSuggestions = {
        ...mockAnalysis,
        suggestions: []
      };

      mockVarianceService.analyzeVariance.mockReturnValue(analysisWithoutSuggestions as unknown);

      const results = [
        createMockResult(1, 'First result'),
        createMockResult(2, 'Second result')
      ];

      render(<VarianceAnalysis results={results} />);

      expect(screen.queryByText('💡 Optimization Suggestions')).not.toBeInTheDocument();
    });

    it('should handle empty unique/common elements', () => {
      const analysisWithEmptyElements = {
        ...mockAnalysis,
        creativeRange: {
          ...mockAnalysis.creativeRange,
          uniqueElements: [],
          commonElements: []
        }
      };

      mockVarianceService.analyzeVariance.mockReturnValue(analysisWithEmptyElements as unknown);

      const results = [
        createMockResult(1, 'First result'),
        createMockResult(2, 'Second result')
      ];

      render(<VarianceAnalysis results={results} />);

      expect(screen.getByText('Unique Elements (0)')).toBeInTheDocument();
      expect(screen.getByText('Common Elements (0)')).toBeInTheDocument();
    });

    it('should handle missing onSuggestionClick prop', () => {
      const results = [
        createMockResult(1, 'First result'),
        createMockResult(2, 'Second result')
      ];

      // Should not throw error
      expect(() => {
        render(<VarianceAnalysis results={results} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const results = [
        createMockResult(1, 'First result'),
        createMockResult(2, 'Second result')
      ];

      render(<VarianceAnalysis results={results} />);

      // Progress bars should be accessible
      const progressBars = document.querySelectorAll('[style*="width"]');
      expect(progressBars.length).toBeGreaterThan(0);
    });

    it('should be keyboard navigable for actionable suggestions', () => {
      const results = [
        createMockResult(1, 'First result'),
        createMockResult(2, 'Second result')
      ];

      render(<VarianceAnalysis results={results} />);

      const actionableSuggestion = screen.getByText('Adjust weight distributions for more variation').closest('div');
      expect(actionableSuggestion).toHaveStyle('cursor: pointer');
    });
  });
});