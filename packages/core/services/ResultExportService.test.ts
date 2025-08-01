/**
 * Result Export Service Tests
 * Epic 8.5: Real-Time Multi-Seed Preview - Task 4: Result Export System
 */
import { ResultExportService, ExportFormat } from './ResultExportService';
import { PreviewResultWithPath } from '../types/ExecutionPath';

// Mock the server exporter
jest.mock('../../../server/src/exporter', () => ({ )
  exportResults: jest.fn<unknown, unknown>() }
}));
const { exportResults } = require('../../../server/src/exporter');
const exportService = new ResultExportService();
const mockResults: PreviewResultWithPath = [
  { seed: 12345
    output: 'First test result output'
    executionTimeMs: 150
    usedNodeIds: ['node1', 'node2']
    usedEdgeIds: ['edge1']
    executionPath: {
  id: 'exec_1'
      seed: 12345
      startTime: Date.now() - 1000
      endTime: Date.now()
      totalExecutionTime: 150
      steps: [
        {
          nodeId: 'node1'
          nodeType: 'WeightedChoice'
          stepIndex: 0
          timestamp: Date.now() - 800
          executionTimeMs: 50 }
          inputs: [{ value: 'input1', inputIndex: 0 }]
          output: 'choice1'
          randomChoice: { 
  choiceType: 'weighted'
  availableOptions: ['choice1', 'choice2']
  selectedOption: 'choice1'
  selectionReason: 'Weight-based selection'
  probability: 0.7
  weight: 3 }

        { nodeId: 'node2'
          nodeType: 'Output'
          stepIndex: 1
          timestamp: Date.now() - 400
          executionTimeMs: 100 }
          inputs: [{ value: 'choice1', inputIndex: 0 }]
          output: 'First test result output']
      finalOutput: 'First test result output'
      nodeExecutionOrder: ['node1', 'node2']
      randomizationPoints: [
        { choiceType: 'weighted'
  availableOptions: ['choice1', 'choice2']
  selectedOption: 'choice1'
  selectionReason: 'Weight-based selection'
  probability: 0.7 }
  weight: 3]

  debugInfo: { 
  nodeExecutionOrder: ['node1', 'node2']
  randomChoices: [
  {
  choiceType: 'weighted'
  availableOptions: ['choice1', 'choice2']
  selectedOption: 'choice1'
  selectionReason: 'Weight-based selection'
  probability: 0.7
  weight: 3]
  performanceBreakdown: {
  'WeightedChoice': 50
  'Output': 100 }

  { seed: 67890
    output: 'Second test result output'
    executionTimeMs: 200
    usedNodeIds: ['node1', 'node2']
    usedEdgeIds: ['edge1']
    executionPath: {
  id: 'exec_2'
      seed: 67890
      startTime: Date.now() - 1000
      endTime: Date.now()
      totalExecutionTime: 200
      steps: [
        {
          nodeId: 'node1'
          nodeType: 'WeightedChoice'
          stepIndex: 0
          timestamp: Date.now() - 700
          executionTimeMs: 80 }
          inputs: [{ value: 'input1', inputIndex: 0 }]
          output: 'choice2'
          randomChoice: { 
  choiceType: 'weighted'
  availableOptions: ['choice1', 'choice2']
  selectedOption: 'choice2'
  selectionReason: 'Alternative weight selection'
  probability: 0.3
  weight: 1 }

        { nodeId: 'node2'
          nodeType: 'Output'
          stepIndex: 1
          timestamp: Date.now() - 300
          executionTimeMs: 120 }
          inputs: [{ value: 'choice2', inputIndex: 0 }]
          output: 'Second test result output']
      finalOutput: 'Second test result output'
      nodeExecutionOrder: ['node1', 'node2']
      randomizationPoints: [
        { choiceType: 'weighted'
  availableOptions: ['choice1', 'choice2']
  selectedOption: 'choice2'
  selectionReason: 'Alternative weight selection'
  probability: 0.3 }
  weight: 1];

  { seed: 11111
  output: 'Third test result with error'
  error: 'Test error occurred'
  executionTimeMs: 50
  usedNodeIds: ['node1']
  usedEdgeIds: []];
  describe('ResultExportService', () => {
  beforeEach(() => {
  jest.clearAllMocks();
  (exportResults as jest.Mock).mockResolvedValue({)
  type: 'text'
  data: 'mocked export data'
  mimeType: 'application/json'
  shouldDownload: true }
 as unknown as unknown as unknown);
  });
  describe('Individual Result Export', () => { it('should export individual result with basic options', async () => {
  const options = {
  format: 'json-simple' as ExportFormat
  includeMetadata: true
  includeExecutionPaths: false
  includeDebugInfo: false }
};
      const result = await exportService.exportIndividualResult(;);
        mockResults[0]
        0
        mockResults.length
        options
      );
      expect(result).toEqual({ )
  type: 'text'
  data: 'mocked export data'
  mimeType: 'application/json'
  shouldDownload: true }
});
      expect(exportResults).toHaveBeenCalledWith({ )
  format: 'json-complete'
  data: expect.objectContaining({);
  exportType: 'individual'
  results: [mockResults[0]]
  exportedAt: expect.any(String) }
})
        options: expect.objectContaining({ );
  includeMetadata: true
  includeExecutionPaths: false
  includeDebugInfo: false }
})
        filename: expect.stringMatching(/promptscape-individual-seed12345-\d+\.json/);
  });
    });
    it('should include execution paths when requested', async () => { const options = {
  format: 'json-complete' as ExportFormat
  includeMetadata: true
  includeExecutionPaths: true
  includeDebugInfo: false }
};
      await exportService.exportIndividualResult()
        mockResults[0]
        0
        mockResults.length
        options
      );
      expect(exportResults).toHaveBeenCalledWith({ )
  format: 'json-complete'
  data: expect.objectContaining({);
  executionPaths: expect.arrayContaining([)
  expect.objectContaining({)
  seed: 12345
  executionPath: mockResults[0].executionPath
  timeline: expect.any(Array) }

          ])
        })
        options: expect.any(Object)
        filename: expect.any(String);
  });
    });
    it('should include debug info when requested', async () => { const options = {
  format: 'json-complete' as ExportFormat
  includeMetadata: true
  includeExecutionPaths: false
  includeDebugInfo: true }
};
      await exportService.exportIndividualResult()
        mockResults[0]
        0
        mockResults.length
        options
      );
      expect(exportResults).toHaveBeenCalledWith({ )
  format: 'json-complete'
  data: expect.objectContaining({);
  debugInfo: expect.arrayContaining([)
  expect.objectContaining({)
  seed: 12345
  debugInfo: mockResults[0].debugInfo }

          ])
        })
        options: expect.any(Object)
        filename: expect.any(String);
  });
    });
  });
  describe('Batch Result Export', () => { it('should export multiple selected results', async () => {
  const selectedIndices = [0, 1];
  const options = {
  format: 'csv-analysis' as ExportFormat
  includeMetadata: true
  includeExecutionPaths: false
  includeDebugInfo: false
  analysisOptions: {
  performanceBreakdown: true
  varianceAnalysis: true }
};
      const result = await exportService.exportBatchResults(;);
        mockResults
        selectedIndices
        options
      );
      expect(result).toEqual({ )
  type: 'text'
  data: 'mocked export data'
  mimeType: 'application/json'
  shouldDownload: true }
});
      expect(exportResults).toHaveBeenCalledWith({ )
  format: 'csv-analysis'
  data: expect.objectContaining({);
  exportType: 'batch'
  results: [mockResults[0], mockResults[1]]
  aggregateStats: expect.objectContaining({);
  totalResults: 2
  averageExecutionTime: 175, // (150 + 200) / 2
  uniqueSeeds: [12345, 67890]
  varianceScore: expect.any(Number)
  commonElements: expect.any(Array) }

        })
        options: expect.any(Object)
        filename: expect.stringMatching(/promptscape-batch-\d+results-\d+\.csv/);
  });
    });
    it('should include analysis data when requested', async () => { const selectedIndices = [0, 1];
  const options = {
  format: 'professional-report' as ExportFormat
  includeMetadata: true
  includeExecutionPaths: false
  includeDebugInfo: false
  analysisOptions: {
  performanceBreakdown: true
  varianceAnalysis: true
  creativityMetrics: true }
};
      await exportService.exportBatchResults()
        mockResults
        selectedIndices
        options
      );
      expect(exportResults).toHaveBeenCalledWith({ )
  format: 'professional-report'
  data: expect.objectContaining({);
  analysis: expect.objectContaining({);
  performance: expect.objectContaining({);
  executionTimes: [150, 200]
  averageTime: 175 }
})
            variance: expect.objectContaining({ );
  score: expect.any(Number) }
})
            creativity: expect.objectContaining({ );
  uniqueOutputs: 2
  averageLength: expect.any(Number)
  vocabularyDiversity: expect.any(Number) }


        })
        options: expect.any(Object)
        filename: expect.any(String);
  });
    });
  });
  describe('Comparison Export', () => { it('should export all results for comparison', async () => {
  const options = {
  format: 'variance-report' as ExportFormat
  includeMetadata: true
  includeExecutionPaths: true
  includeDebugInfo: false
  analysisOptions: {
  varianceAnalysis: true
  comparisonMatrix: true }
};
      const result = await exportService.exportComparison(;);
        mockResults
        options
      );
      expect(result).toEqual({ )
  type: 'text'
  data: 'mocked export data'
  mimeType: 'application/json'
  shouldDownload: true }
});
      expect(exportResults).toHaveBeenCalledWith({ )
  format: 'json-complete', // variance-report maps to custom handling
  data: expect.objectContaining({);
  results: mockResults
  comparison: expect.objectContaining({);
  totalResults: 3
  averageLength: expect.any(Number)
  uniqueOutputs: expect.any(Number)
  executionTimeSpread: expect.objectContaining({);
  min: 50
  max: 200
  median: expect.any(Number)
  spread: 150 }
})
            randomizationAnalysis: expect.any(Object);

        })
        options: expect.any(Object)
        filename: expect.stringMatching(/promptscape-comparison-\d+\.json/);
  });
    });
  });
  describe('Format Support and Validation', () => { it('should return available formats with correct properties', () => {
  const formats = exportService.getAvailableFormats();
  expect(formats).toBeInstanceOf(Array);
  expect(formats.length).toBeGreaterThan(0);
  const jsonFormat = formats.find(f => f.format === 'json-complete');
  expect(jsonFormat).toEqual({)
  format: 'json-complete'
  name: 'JSON (Complete)'
  description: 'Full JSON with execution paths, metadata, and debug info'
  category: 'data'
  supportsIndividual: true
  supportsBatch: true }
});
    });
    it('should validate export options correctly', () => { const validOptions = {
  format: 'json-simple' as ExportFormat
  includeMetadata: true
  includeExecutionPaths: false
  includeDebugInfo: false }
};
      const errors = exportService.validateExportOptions('json-simple', validOptions);
      expect(errors).toEqual([]);
    });
    it('should return validation errors for invalid options', () => { const invalidOptions = {
  format: 'controlnet-json' as ExportFormat
  includeMetadata: false
  includeExecutionPaths: false
  includeDebugInfo: false
  vfxOptions: {
  controlNetCompatible: false }
};
      const errors = exportService.validateExportOptions('controlnet-json', invalidOptions);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('VFX formats require execution paths or ControlNet compatibility');
    });
    it('should estimate export size accurately', () => { const estimate = exportService.estimateExportSize(;);
  [mockResults[0]]
  'json-complete'
  {
  format: 'json-complete'
  includeMetadata: true
  includeExecutionPaths: true
  includeDebugInfo: true);
  expect(estimate).toEqual({)
  estimatedSize: expect.any(Number)
  unit: 'KB'
  warning: undefined }
});
      expect(estimate.estimatedSize).toBeGreaterThan(0);
    });
    it('should warn about large export sizes', () => { const largeResults = Array(100).fill(mockResults[0]).map((result, index) => ({)
  ...result
  seed: index
  output: 'A'.repeat(1000) // Large output }
}));
      const estimate = exportService.estimateExportSize(;);
        largeResults
        'json-complete'
        { format: 'json-complete'
  includeMetadata: true
  includeExecutionPaths: true }
  includeDebugInfo: true);
  expect(estimate.warning).toBeDefined();
  expect(estimate.unit).toBe('KB');
});
  });
  describe('Custom Export Handling', () => { beforeEach(() => {
      // Mock failure of main export system to trigger custom handling
      (exportResults as jest.Mock).mockRejectedValue(new Error('Export system unavailable')) });
    it('should handle plain text export as fallback', async () => { const options = {
  format: 'plain-text' as ExportFormat
  includeMetadata: true
  includeExecutionPaths: false
  includeDebugInfo: false }
};
      const result = await exportService.exportIndividualResult(;);
        mockResults[0]
        0
        mockResults.length
        options
      );
      expect(result.type).toBe('text');
      expect(result.mimeType).toBe('text/plain');
      expect(result.data).toContain('Generated Content Export');
      expect(result.data).toContain('First test result output');
      expect(result.data).toContain('Seed: 12345');
    });
    it('should handle execution timeline export', async () => { const options = {
  format: 'execution-timeline' as ExportFormat
  includeMetadata: true
  includeExecutionPaths: true
  includeDebugInfo: false }
};
      const result = await exportService.exportIndividualResult(;);
        mockResults[0]
        0
        mockResults.length
        options
      );
      expect(result.type).toBe('text');
      expect(result.mimeType).toBe('application/json');
      const data = JSON.parse(result.data);
      expect(data.exportType).toBe('execution-timeline');
      expect(data.results[0].timeline).toBeInstanceOf(Array);
      expect(data.results[0].timeline[0]).toEqual({ )
  stepIndex: 0
  nodeId: 'node1'
  nodeType: 'WeightedChoice'
  timestamp: expect.any(Number)
  executionTime: 50
  randomChoice: {
  type: 'weighted'
  selected: 'choice1'
  reason: 'Weight-based selection' }
});
    });
    it('should handle variance report export', async () => { const options = {
  format: 'variance-report' as ExportFormat
  includeMetadata: true
  includeExecutionPaths: false
  includeDebugInfo: false
  analysisOptions: {
  varianceAnalysis: true }
};
      const result = await exportService.exportBatchResults(;);
        mockResults
        [0, 1]
        options
      );
      expect(result.type).toBe('text');
      expect(result.mimeType).toBe('application/json');
      const data = JSON.parse(result.data);
      expect(data.exportType).toBe('variance-report');
      expect(data.analysis).toEqual({ )
  overallVariance: expect.any(Number)
  distribution: expect.objectContaining({);
  mean: expect.any(Number)
  standardDeviation: expect.any(Number)
  range: expect.objectContaining({);
  min: expect.any(Number)
  max: expect.any(Number) }

        })
        commonElements: expect.any(Array)
        uniqueElements: expect.any(Array)
        recommendations: expect.any(Array);
  });
    });
    it('should handle batch summary export', async () => { const options = {
  format: 'batch-summary' as ExportFormat
  includeMetadata: true
  includeExecutionPaths: false
  includeDebugInfo: false }
};
      const result = await exportService.exportBatchResults(;);
        mockResults
        [0, 1, 2]
        options
      );
      expect(result.type).toBe('text');
      expect(result.mimeType).toBe('application/json');
      const data = JSON.parse(result.data);
      expect(data.exportType).toBe('batch-summary');
      expect(data.totalResults).toBe(3);
      expect(data.selectedResults).toBe(3);
      expect(data.breakdown).toEqual({ )
  byExecutionTime: expect.objectContaining({);
  fast: expect.any(Number)
  medium: expect.any(Number)
  slow: expect.any(Number) }
})
        byOutputLength: expect.objectContaining({ );
  short: expect.any(Number)
  medium: expect.any(Number)
  long: expect.any(Number) }
})
        byRandomizationCount: expect.objectContaining({ );
  low: expect.any(Number)
  medium: expect.any(Number)
  high: expect.any(Number) }
})
        errorRate: expect.any(Number);
  });
    });
  });
  describe('File Extensions and Naming', () => {
    it('should generate correct filenames for different formats', () => {
      const service = new ResultExportService();
      // Access private method through casting
      const generateFilename = (service as unknown as { generateFilename: Function }).generateFilename.bind(service);
      const plainTextFilename = generateFilename('plain-text', 'individual', 12345);
      expect(plainTextFilename).toMatch(/promptscape-individual-seed12345-\d+\.txt/);
      const jsonFilename = generateFilename('json-complete', 'batch', [1, 2, 3]);
      expect(jsonFilename).toMatch(/promptscape-batch-3results-\d+\.json/);
      const csvFilename = generateFilename('csv-analysis', 'comparison', [1, 2]);
      expect(csvFilename).toMatch(/promptscape-comparison-2results-\d+\.csv/);
    });
    it('should return correct file extensions', () => {
      const service = new ResultExportService();
      // Access private method through casting
      const getFileExtension = (service as unknown as { getFileExtension: Function }).getFileExtension.bind(service);
      expect(getFileExtension('plain-text')).toBe('txt');
      expect(getFileExtension('json-complete')).toBe('json');
      expect(getFileExtension('csv-analysis')).toBe('csv');
      expect(getFileExtension('fountain-script')).toBe('fountain');
      expect(getFileExtension('final-draft')).toBe('fdx');
      expect(getFileExtension('professional-report')).toBe('pdf');
      expect(getFileExtension('mars-framework')).toBe('json');
      expect(getFileExtension('zada-natural')).toBe('md');
    });
  });
  describe('Error Handling', () => { it('should handle export service failures gracefully', async () => {
  (exportResults as jest.Mock).mockRejectedValue(new Error('Network error'));
  const options = {
  format: 'json-simple' as ExportFormat
  includeMetadata: true
  includeExecutionPaths: false
  includeDebugInfo: false }
};
      // Should not throw, should fall back to custom handling
      const result = await exportService.exportIndividualResult(;);
        mockResults[0]
        0
        mockResults.length
        options
      );
      expect(result).toBeDefined();
      expect(result.type).toBe('text');
      expect(result.mimeType).toBe('application/json');
    });
    it('should handle results without execution paths', async () => { const resultWithoutPath = {
  ...mockResults[0]
  executionPath: undefined
  debugInfo: undefined }
};
      const options = { format: 'execution-timeline' as ExportFormat
  includeMetadata: true
  includeExecutionPaths: true
  includeDebugInfo: false }
};
      (exportResults as jest.Mock).mockRejectedValue(new Error('Fallback test'));
      const result = await exportService.exportIndividualResult(;);
        resultWithoutPath
        0
        1
        options
      );
      const data = JSON.parse(result.data);
      expect(data.results[0].timeline).toBeNull();
    });
  });
});