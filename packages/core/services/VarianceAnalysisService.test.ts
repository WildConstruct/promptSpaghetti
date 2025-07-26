/**
 * Variance Analysis Service Tests
 * Epic 8.5: Real-Time Multi-Seed Preview - Task 5: Creative Variance Analysis
 */

import { VarianceAnalysisService } from './VarianceAnalysisService';
import { PreviewResultWithPath } from '../types/ExecutionPath';

const varianceService = new VarianceAnalysisService();

const createMockResult = (
  seed: number, 
  output: string, 
  executionTime: number = 100,
  executionPath?: unknown
): PreviewResultWithPath => ({
  seed,
  output,
  executionTimeMs: executionTime,
  usedNodeIds: ['node1', 'node2'],
  usedEdgeIds: ['edge1'],
  executionPath: executionPath || {
    id: `exec_${seed}`,
    seed,
    startTime: Date.now() - 1000,
    endTime: Date.now(),
    totalExecutionTime: executionTime,
    steps: [
      {
        nodeId: 'node1',
        nodeType: 'WeightedChoice',
        stepIndex: 0,
        timestamp: Date.now() - 800,
        executionTimeMs: 50,
        inputs: [],
        output: `choice_${seed}`,
        randomChoice: {
          choiceType: 'weighted',
          availableOptions: [`choice_${seed}`, 'other_choice'],
          selectedOption: `choice_${seed}`,
          selectionReason: 'Weight-based selection',
          probability: 0.7,
          weight: 3
        }
      }
    ],
    finalOutput: output,
    nodeExecutionOrder: ['node1', 'node2'],
    randomizationPoints: []
  }
});

describe('VarianceAnalysisService', () => {
  describe('analyzeVariance', () => {
    it('should return minimal variance for single result', () => {
      const results = [createMockResult(1, 'First result')];
      const analysis = varianceService.analyzeVariance(results);

      expect(analysis.overallVariance).toBe('low');
      expect(analysis.varianceScore).toBe(0);
      expect(analysis.suggestions.length).toBeGreaterThan(0);
      expect(analysis.suggestions[0].message).toContain('more results');
    });

    it('should calculate low variance for very similar results', () => {
      const results = [
        createMockResult(1, 'The quick brown fox jumps'),
        createMockResult(2, 'The quick brown fox leaps'),
        createMockResult(3, 'The quick brown fox bounds')
      ];

      const analysis = varianceService.analyzeVariance(results);

      expect(analysis.overallVariance).toBe('low');
      expect(analysis.varianceScore).toBeLessThan(0.3);
      expect(analysis.creativeRange.repetitionRate).toBeGreaterThan(0.5);
      expect(analysis.creativeRange.commonElements).toContain('quick');
      expect(analysis.creativeRange.commonElements).toContain('brown');
    });

    it('should calculate high variance for diverse results', () => {
      const results = [
        createMockResult(1, 'The majestic elephant trumpeted loudly across the savannah grasslands'),
        createMockResult(2, 'Quantum mechanics reveals fascinating paradoxes about reality and observation'),
        createMockResult(3, 'Chef Julia prepared an exquisite soufflé with delicate vanilla essence'),
        createMockResult(4, 'Binary code streams through fiber optic cables at lightspeed'),
        createMockResult(5, 'Ancient pyramids stand testament to architectural brilliance and mystery')
      ];

      const analysis = varianceService.analyzeVariance(results);

      expect(['medium', 'high']).toContain(analysis.overallVariance);
      expect(analysis.varianceScore).toBeGreaterThan(0.5);
      expect(analysis.diversityMetrics.vocabularyDiversity).toBeGreaterThan(0.8);
      expect(analysis.creativeRange.uniqueElements.length).toBeGreaterThan(10);
    });

    it('should calculate medium variance for balanced results', () => {
      const results = [
        createMockResult(1, 'The red car drove quickly down the winding mountain road'),
        createMockResult(2, 'A blue bicycle rolled slowly through the quiet neighborhood streets'),
        createMockResult(3, 'The yellow bus moved steadily along the busy highway lanes'),
        createMockResult(4, 'An old truck rumbled loudly across the dusty countryside path')
      ];

      const analysis = varianceService.analyzeVariance(results);

      expect(analysis.overallVariance).toBe('medium');
      expect(analysis.varianceScore).toBeGreaterThan(0.3);
      expect(analysis.varianceScore).toBeLessThan(0.7);
    });

    it('should detect execution path diversity', () => {
      const results = [
        createMockResult(1, 'Path A result', 100, {
          steps: [{ nodeId: 'node1', nodeType: 'WeightedChoice' }, { nodeId: 'node2', nodeType: 'Output' }]
        }),
        createMockResult(2, 'Path B result', 120, {
          steps: [{ nodeId: 'node1', nodeType: 'Conditional' }, { nodeId: 'node3', nodeType: 'Output' }]
        }),
        createMockResult(3, 'Path C result', 90, {
          steps: [{ nodeId: 'node4', nodeType: 'Sequential' }, { nodeId: 'node5', nodeType: 'Output' }]
        })
      ];

      const analysis = varianceService.analyzeVariance(results);

      expect(analysis.diversityMetrics.executionPathDiversity).toBeGreaterThan(0.5);
    });

    it('should calculate structural diversity correctly', () => {
      const results = [
        createMockResult(1, 'Short.'),
        createMockResult(2, 'This is a medium length sentence with some complexity, punctuation, and structure.'),
        createMockResult(
          3,
          'A very long and elaborate sentence that contains multiple clauses,
          extensive detail,
          sophisticated vocabulary,
          and complex grammatical structures that demonstrate significant variation in writing style and approach!'
        )
      ];

      const analysis = varianceService.analyzeVariance(results);

      expect(analysis.diversityMetrics.outputLengthVariance).toBeGreaterThan(0.5);
      expect(analysis.diversityMetrics.structuralDiversity).toBeGreaterThan(0.3);
    });
  });

  describe('createDiversityIndicators', () => {
    it('should create proper diversity indicators', () => {
      const results = [
        createMockResult(1, 'Different content here'),
        createMockResult(2, 'Another unique output'),
        createMockResult(3, 'Third variation present')
      ];

      const analysis = varianceService.analyzeVariance(results);
      const indicators = varianceService.createDiversityIndicators(analysis);

      expect(indicators.length).toBeGreaterThan(3);
      
      const lengthIndicator = indicators.find(i => i.metric === 'Length Variance');
      expect(lengthIndicator).toBeDefined();
      expect(lengthIndicator?.level).toMatch(/^(low|medium|high)$/);
      expect(lengthIndicator?.color).toMatch(/^#[0-9a-f]{6}$/i);

      const vocabIndicator = indicators.find(i => i.metric === 'Vocabulary Diversity');
      expect(vocabIndicator).toBeDefined();
      expect(vocabIndicator?.value).toBeGreaterThan(0);
      expect(vocabIndicator?.value).toBeLessThanOrEqual(1);
    });

    it('should categorize metrics correctly', () => {
      const results = [
        createMockResult(1, 'a'),
        createMockResult(2, 'b'),
      ];

      const analysis = varianceService.analyzeVariance(results);
      const indicators = varianceService.createDiversityIndicators(analysis);

      indicators.forEach(indicator => {
        expect(indicator.value).toBeGreaterThanOrEqual(0);
        expect(indicator.value).toBeLessThanOrEqual(1);
        expect(['low', 'medium', 'high']).toContain(indicator.level);
        expect(indicator.description).toBeTruthy();
      });
    });
  });

  describe('getVarianceLevelInfo', () => {
    it('should return correct info for low variance', () => {
      const info = varianceService.getVarianceLevelInfo('low');
      
      expect(info.color).toBe('#ef4444');
      expect(info.icon).toBe('🔴');
      expect(info.description).toContain('similar');
    });

    it('should return correct info for medium variance', () => {
      const info = varianceService.getVarianceLevelInfo('medium');
      
      expect(info.color).toBe('#f59e0b');
      expect(info.icon).toBe('🟡');
      expect(info.description).toContain('balance');
    });

    it('should return correct info for high variance', () => {
      const info = varianceService.getVarianceLevelInfo('high');
      
      expect(info.color).toBe('#10b981');
      expect(info.icon).toBe('🟢');
      expect(info.description).toContain('diversity');
    });
  });

  describe('suggestion generation', () => {
    it('should generate increase suggestions for low variance', () => {
      const results = [
        createMockResult(1, 'same content'),
        createMockResult(2, 'same content'),
        createMockResult(3, 'same content')
      ];

      const analysis = varianceService.analyzeVariance(results);

      expect(analysis.suggestions.some(s => s.type === 'increase')).toBe(true);
      expect(analysis.suggestions.some(s => s.category === 'content')).toBe(true);
    });

    it('should generate optimization suggestions for high variance', () => {
      const results = [
        createMockResult(1, 'Completely different content with unique vocabulary and structure'),
        createMockResult(2, 'Entirely separate narrative using alternative language patterns'),
        createMockResult(3, 'Distinct textual composition featuring novel expressions'),
        createMockResult(4, 'Unrelated subject matter with diverse linguistic elements'),
        createMockResult(5, 'Original creative work displaying varied stylistic approaches')
      ];

      const analysis = varianceService.analyzeVariance(results);

      if (analysis.overallVariance === 'high') {
        expect(analysis.suggestions.some(s => s.type === 'optimize')).toBe(true);
      }
    });

    it('should provide actionable suggestions', () => {
      const results = [
        createMockResult(1, 'test'),
        createMockResult(2, 'test')
      ];

      const analysis = varianceService.analyzeVariance(results);

      analysis.suggestions.forEach(suggestion => {
        expect(['increase', 'decrease', 'optimize']).toContain(suggestion.type);
        expect(['weights', 'structure', 'content', 'execution']).toContain(suggestion.category);
        expect(['low', 'medium', 'high']).toContain(suggestion.impact);
        expect(typeof suggestion.actionable).toBe('boolean');
        expect(suggestion.message.length).toBeGreaterThan(10);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty results', () => {
      const analysis = varianceService.analyzeVariance([]);
      
      expect(analysis.overallVariance).toBe('low');
      expect(analysis.varianceScore).toBe(0);
      expect(analysis.suggestions.length).toBeGreaterThan(0);
    });

    it('should handle results with errors', () => {
      const results = [
        { ...createMockResult(1, 'Good result'), error: undefined },
        { ...createMockResult(2, ''), error: 'Error occurred' },
        createMockResult(3, 'Another good result')
      ];

      const analysis = varianceService.analyzeVariance(results);
      
      expect(analysis).toBeDefined();
      expect(analysis.varianceScore).toBeGreaterThanOrEqual(0);
    });

    it('should handle results without execution paths', () => {
      const results = [
        { seed: 1, output: 'Result 1', executionTimeMs: 100, usedNodeIds: [], usedEdgeIds: [] },
        { seed: 2, output: 'Result 2', executionTimeMs: 110, usedNodeIds: [], usedEdgeIds: [] },
        { seed: 3, output: 'Result 3', executionTimeMs: 90, usedNodeIds: [], usedEdgeIds: [] }
      ] as PreviewResultWithPath[];

      const analysis = varianceService.analyzeVariance(results);
      
      expect(analysis.diversityMetrics.executionPathDiversity).toBe(0);
      expect(analysis.overallVariance).toMatch(/^(low|medium|high)$/);
    });

    it('should handle very short outputs', () => {
      const results = [
        createMockResult(1, 'a'),
        createMockResult(2, 'b'),
        createMockResult(3, 'c')
      ];

      const analysis = varianceService.analyzeVariance(results);
      
      expect(analysis.diversityMetrics.vocabularyDiversity).toBeGreaterThanOrEqual(0);
      expect(analysis.creativeRange.uniqueElements.length).toBe(0); // Too short for meaningful analysis
    });

    it('should handle identical outputs', () => {
      const results = [
        createMockResult(1, 'identical output'),
        createMockResult(2, 'identical output'),
        createMockResult(3, 'identical output')
      ];

      const analysis = varianceService.analyzeVariance(results);
      
      expect(analysis.overallVariance).toBe('low');
      expect(analysis.creativeRange.repetitionRate).toBe(1);
      expect(analysis.suggestions.some(s => s.message.includes('repetition'))).toBe(true);
    });
  });

  describe('performance', () => {
    it('should handle large result sets efficiently', () => {
      const results = Array.from({ length: 100 }, (_, i) => 
        createMockResult(i, `Result number ${i} with unique content variation ${i * 2}`)
      );

      const startTime = Date.now();
      const analysis = varianceService.analyzeVariance(results);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(analysis.overallVariance).toMatch(/^(low|medium|high)$/);
      expect(analysis.varianceScore).toBeGreaterThanOrEqual(0);
      expect(analysis.varianceScore).toBeLessThanOrEqual(1);
    });
  });
});