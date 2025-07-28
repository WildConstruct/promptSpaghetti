// packages/core/__tests__/ReproducibilityValidator.test.ts
// Test suite for ReproducibilityValidator service
import { ReproducibilityValidator } from '../services/ReproducibilityValidator';
import { VFXExportFormat } from '../types/VFXExport';
describe('ReproducibilityValidator', () => {
  let validator: ReproducibilityValidator;
  let mockValidExport: VFXExportFormat;
  let mockInvalidExport: VFXExportFormat;
  beforeEach(() => {
  validator = ReproducibilityValidator.getInstance();
  // Create mock valid export data
  mockValidExport = {
  metadata: {,
  exportId: 'test-export-001',
  version: '1.2.0',
  timestamp: '2025-07-24T10:00:00.000Z',
  generator: {,
  name: 'Wild Construct Prompt Generator',
  version: '1.0.0',
  build: 'test-build',
  coreVersion: '2.1.0',
  exporterVersion: '1.2.0',
  schemaVersion: '1.2.0',
  dependencies: {,
  reactflow: '11.10.1',
  seedrandom: '3.0.5',
  typescript: '5.0.0',
},
  project: {,
  name: 'Test Project',
  id: 'test-project-001',
},
  export: {,
  format: 'vfx-pipeline-v1',
  quality: 'production',
  includeDebugInfo: true,
  includeHistoricalData: false,
},
  compatibility: {,
  controlNet: true,
  diffusionModels: ['stable-diffusion', 'sdxl'],
  animationFramework: true,
  billboardProjection: true,
},
  prompt: {,
  finalPrompt: 'A warrior in ancient temple',
  components: {,
  subject: ['warrior'],
  action: ['standing'],
  setting: ['ancient temple'],
  mood: ['dramatic'],
  technical: ['cinematic lighting'],
  style: ['realistic'],
},
  variables: {,
  subject: {,
  value: 'warrior',
  source: 'generated',
  confidence: 0.85,
},
  variants: [{,
  id: 'variant-001',
  seed: 12345,
  prompt: 'A warrior in ancient temple',
  confidence: 0.85,
  metadata: {,
  generationTime: 150,
  nodesExecuted: 3,
  variablesUsed: ['subject'],
}],
        weights: {,
  overall: 1.0,
  subject: 1.2,
  composition: 1.0,
  style: 0.8,
},
  graph: {,
  nodes: [{;
  id: 'node-001',
          type: 'weightedChoice',
          label: 'Subject Choice',
          category: 'input',
          purpose: 'Select character type',
          configuration: {,
  name: 'Subject Choice',
            choices: [,
              { text: 'warrior', weight: 3 },
              { text: 'mage', weight: 2 }
            ]
  },
  executionOrder: 1,
          executionTime: 50,
          dependsOn: [],
          affects: ['node-002'],
          reproducibilityData: {,
  originalPosition: { x: 100, y: 100 },
            originalSize: { width: 200, height: 100 },
            creationTimestamp: '2025-07-24T09:00:00.000Z',
            lastModified: '2025-07-24T09:30:00.000Z',
            configurationHash: 'abc123def456';
  }],
        connections: [{,
  id: 'conn-001',
          source: { nodeId: 'node-001' },
          target: { nodeId: 'node-002' },
          dataType: 'text';
  }],
        executionPath: ['node-001', 'node-002'],
        criticalPath: ['node-001', 'node-002'],
        analysis: {,
  complexity: 'simple',
  variabilityScore: 0.6,
  determinismScore: 0.8,
  performanceScore: 0.9,
},
  execution: {,
  randomization: {,
  masterSeed: 12345,
  nodeSeed: {,
  'node-001': 12346,
  'node-002': 12347,
},
  rngState: 'mocked-rng-state-string',
          reproducibilityHash: 'repro-hash-123',
          nodeRngStates: {,
  'node-001': {,
  seed: 12346,
  state: 'node-rng-state-1',
  callCount: 3,
  lastValue: 0.7234,
},
  executionSequence: ['node-001', 'node-002']
  },
  performance: {,
  totalTime: 150,
  nodePerformance: {,
  'node-001': {,
  executionTime: 50,
  cacheHits: 0,
  cacheMisses: 1,
},
  memoryUsage: 2048000;
  },
  history: {,
  iterations: [{,
  iterationId: 'iter-001',
  timestamp: '2025-07-24T10:00:00.000Z',
  trigger: 'user_request',
  seed: 12345,
  result: 'A warrior in ancient temple',
  executionTime: 150,
}],
          modifications: [];
  },
  reproduction: {,
  environment: {,
  nodeVersion: '18.17.0',
  platform: 'darwin',
},
  exactReproduction: true,
          approximateReproduction: true;
  },
  extensions: {},
      rendering: {,
  resolution: {,
  width: 1920,
  height: 1080,
  aspectRatio: '16:9',
},
  camera: {,
  fov: 45,
  position: [0, 0, 5],
},
  lighting: {,
  timeOfDay: 'afternoon',
  mood: 'dramatic',
},
  style: {,
  filmstock: 'digital',
  colorGrading: 'cinematic',
},
  quality: {,
  samples: 100,
  denoising: 0.7,
};
    // Create mock invalid export (missing critical data)
    mockInvalidExport = {
      ...mockValidExport,
      execution: {,
        ...mockValidExport.execution,
        randomization: {,
  masterSeed: undefined as any,
          nodeSeed: {},
          rngState: undefined,
          reproducibilityHash: undefined;
  };
  });
  describe('Basic Validation', () => {
    it('should validate a complete valid export', () => {
      const report = validator.validateReproducibility(mockValidExport);
      expect(report.isValid).toBe(true);
      expect(report.exactReproducible).toBe(true);
      expect(report.approximateReproducible).toBe(true);
      expect(report.errors).toHaveLength(0);
      expect(report.integrity.seedsValid).toBe(true);
      expect(report.integrity.configurationValid).toBe(true);
      expect(report.integrity.versionCompatible).toBe(true);
    });
    it('should detect missing master seed', () => {
      const report = validator.validateReproducibility(mockInvalidExport);
      expect(report.isValid).toBe(false);
      expect(report.errors.some(e => e.code === 'MISSING_MASTER_SEED')).toBe(true);
      expect(report.integrity.seedsValid).toBe(false);
    });
    it('should handle missing node seeds', () => {
  const exportWithMissingNodeSeeds = {
  ...mockValidExport,
  execution: {,
  ...mockValidExport.execution,
  randomization: {,
  ...mockValidExport.execution.randomization,
  nodeSeed: undefined as any,
};
      const report = validator.validateReproducibility(exportWithMissingNodeSeeds);
      expect(report.isValid).toBe(false);
      expect(report.errors.some(e => e.code === 'MISSING_NODE_SEEDS')).toBe(true);
    });
  });
  describe('Randomization State Validation', () => {
    it('should validate RNG state presence for exact reproducibility', () => {
      const report = validator.validateReproducibility(mockValidExport);
      expect(report.exactReproducible).toBe(true);
      expect(report.warnings.some(w => w.code === 'MISSING_RNG_STATE')).toBe(false);
    });
    it('should warn about missing RNG state', () => {
  const exportWithoutRngState = {
  ...mockValidExport,
  execution: {,
  ...mockValidExport.execution,
  randomization: {,
  ...mockValidExport.execution.randomization,
  rngState: undefined,
};
      const report = validator.validateReproducibility(exportWithoutRngState);
      expect(report.exactReproducible).toBe(false);
      expect(report.approximateReproducible).toBe(true);
      expect(report.warnings.some(w => w.code === 'MISSING_RNG_STATE')).toBe(true);
    });
    it('should validate per-node RNG states', () => {
      const report = validator.validateReproducibility(mockValidExport);
      expect(report.errors.filter(e => e.code.includes('NODE_RNG')).length).toBe(0);
    });
    it('should detect invalid per-node RNG states', () => {
  const exportWithInvalidNodeRng = {
  ...mockValidExport,
  execution: {,
  ...mockValidExport.execution,
  randomization: {,
  ...mockValidExport.execution.randomization,
  nodeRngStates: {,
  'node-001': {,
  seed: 'invalid-seed' as any,
  state: null as any,
  callCount: -1,
  lastValue: 0.5,
};
      const report = validator.validateReproducibility(exportWithInvalidNodeRng);
      expect(report.errors.some(e => e.code === 'INVALID_NODE_RNG_SEED')).toBe(true);
      expect(report.errors.some(e => e.code === 'INVALID_NODE_RNG_STATE')).toBe(true);
      expect(report.warnings.some(w => w.code === 'INVALID_RNG_CALL_COUNT')).toBe(true);
    });
  });
  describe('Node Configuration Validation', () => {
    it('should validate node structure', () => {
      const report = validator.validateReproducibility(mockValidExport);
      expect(report.integrity.configurationValid).toBe(true);
      expect(report.errors.filter(e => e.code === 'INVALID_NODE_STRUCTURE').length).toBe(0);
    });
    it('should detect invalid node structure', () => {
  const exportWithInvalidNode = {
  ...mockValidExport,
  graph: {,
  ...mockValidExport.graph,
  nodes: [{,
  id: undefined as any,
  type: undefined as any,
  label: 'Invalid Node',
} as any]
      };
      const report = validator.validateReproducibility(exportWithInvalidNode);
      expect(report.integrity.configurationValid).toBe(false);
      expect(report.errors.some(e => e.code === 'INVALID_NODE_STRUCTURE')).toBe(true);
    });
    it('should warn about missing node configurations', () => {
  const exportWithoutConfig = {
  ...mockValidExport,
  graph: {,
  ...mockValidExport.graph,
  nodes: [{,
  ...mockValidExport.graph.nodes[0],
  configuration: undefined,
} as any]
      };
      const report = validator.validateReproducibility(exportWithoutConfig);
      expect(report.warnings.some(w => w.code === 'MISSING_NODE_CONFIGURATION')).toBe(true);
    });
  });
  describe('Version Compatibility Validation', () => {
    it('should validate version metadata', () => {
      const report = validator.validateReproducibility(mockValidExport);
      expect(report.integrity.versionCompatible).toBe(true);
      expect(report.errors.filter(e => e.code.includes('VERSION')).length).toBe(0);
    });
    it('should detect missing version information', () => {
  const exportWithoutVersion = {
  ...mockValidExport,
  metadata: {,
  ...mockValidExport.metadata,
  version: undefined as any,
};
      const report = validator.validateReproducibility(exportWithoutVersion);
      expect(report.errors.some(e => e.code === 'MISSING_VERSION')).toBe(true);
    });
    it('should warn about missing dependency versions', () => {
  const exportWithoutDeps = {
  ...mockValidExport,
  metadata: {,
  ...mockValidExport.metadata,
  generator: {,
  ...mockValidExport.metadata.generator,
  dependencies: undefined as any,
};
      const report = validator.validateReproducibility(exportWithoutDeps);
      expect(report.warnings.some(w => w.code === 'MISSING_DEPENDENCIES')).toBe(true);
    });
    it('should check for critical dependencies', () => {
  const exportWithMissingCriticalDep = {
  ...mockValidExport,
  metadata: {,
  ...mockValidExport.metadata,
  generator: {,
  ...mockValidExport.metadata.generator,
  dependencies: {,
  typescript: '5.0.0',
  // Missing seedrandom and reactflow
};
      const report = validator.validateReproducibility(exportWithMissingCriticalDep);
      expect(report.warnings.filter(w => w.code === 'MISSING_CRITICAL_DEPENDENCY').length).toBe(2);
    });
  });
  describe('Performance Estimation', () => {
    it('should calculate performance estimates', () => {
      const report = validator.validateReproducibility(mockValidExport);
      expect(report.performance.estimatedReproductionTime).toBeGreaterThan(0);
      expect(report.performance.complexityScore).toBeGreaterThan(0);
      expect(report.performance.memoryRequirement).toBeGreaterThan(0);
    });
    it('should estimate reproduction time from performance data', () => {
      const report = validator.validateReproducibility(mockValidExport);
      // Should use actual performance data if available
      expect(report.performance.estimatedReproductionTime).toBe(165); // 150ms * 1.1
    });
    it('should calculate complexity score', () => {
      const report = validator.validateReproducibility(mockValidExport);
      expect(report.performance.complexityScore).toBeGreaterThan(0);
      expect(report.performance.complexityScore).toBeLessThanOrEqual(100);
    });
    it('should estimate memory requirements', () => {
      const report = validator.validateReproducibility(mockValidExport);
      expect(report.performance.memoryRequirement).toBeGreaterThan(1000); // Should be reasonable size
    });
  });
  describe('Validation Options', () => {
    it('should respect strict mode', () => {
      const reportNormal = validator.validateReproducibility(mockValidExport, { strictMode: false });
      const reportStrict = validator.validateReproducibility(mockValidExport, { strictMode: true });
      expect(reportNormal.isValid).toBe(true);
      expect(reportStrict.isValid).toBe(true);
    });
    it('should handle strict mode with errors', () => {
      const reportStrict = validator.validateReproducibility(mockInvalidExport, { strictMode: true });
      expect(reportStrict.isValid).toBe(false);
    });
    it('should handle allowApproximate option', () => {
  const exportWithApproximateOnly = {
  ...mockValidExport,
  execution: {,
  ...mockValidExport.execution,
  randomization: {,
  ...mockValidExport.execution.randomization,
  rngState: undefined // Only approximate reproducibility,
};
      const reportWithApproximate = validator.validateReproducibility(;);
        exportWithApproximateOnly, 
        { allowApproximate: true }
      );
      const reportWithoutApproximate = validator.validateReproducibility(;);
        exportWithApproximateOnly, 
        { allowApproximate: false }
      );
      expect(reportWithApproximate.isValid).toBe(true);
      expect(reportWithoutApproximate.isValid).toBe(false);
    });
  });
  describe('Suggestions Generation', () => {
    it('should generate optimization suggestions for complex graphs', () => {
      // Create export with high complexity
      const complexExport = {
        ...mockValidExport,
        graph: {,
          ...mockValidExport.graph,
          nodes: Array.from({ length: 30 }, (_, i) => ({)
  ...mockValidExport.graph.nodes[0],
            id: `node-${i}`}
          }))
      };
      const report = validator.validateReproducibility(complexExport);
      expect(report.suggestions.some(s => s.code === 'HIGH_COMPLEXITY')).toBe(true);
    });
    it('should suggest enhancement for missing RNG tracking', () => {
  const exportWithoutNodeRng = {
  ...mockValidExport,
  execution: {,
  ...mockValidExport.execution,
  randomization: {,
  ...mockValidExport.execution.randomization,
  nodeRngStates: undefined,
};
      const report = validator.validateReproducibility(exportWithoutNodeRng);
      expect(report.suggestions.some(s => s.code === 'ENHANCE_RNG_TRACKING')).toBe(true);
    });
    it('should suggest debug mode for exports with errors', () => {
      const report = validator.validateReproducibility(mockInvalidExport);
      expect(report.suggestions.some(s => s.code === 'ENABLE_DEBUG_MODE')).toBe(true);
    });
  });
  describe('Graph Integrity Validation', () => {
    it('should detect orphaned connections', () => {
      const exportWithOrphanedConnection = {
        ...mockValidExport,
        graph: {,
          ...mockValidExport.graph,
          connections: [{,
  id: 'orphaned-conn',
            source: { nodeId: 'non-existent-node' },
            target: { nodeId: 'node-001' },
            dataType: 'text';
  }]
      };
      const report = validator.validateReproducibility(exportWithOrphanedConnection);
      expect(report.warnings.some(w => w.code === 'ORPHANED_CONNECTION_SOURCE')).toBe(true);
    });
    it('should validate execution path integrity', () => {
  const exportWithInvalidExecutionPath = {
  ...mockValidExport,
  graph: {,
  ...mockValidExport.graph,
  executionPath: ['node-001', 'non-existent-node'],
};
      const report = validator.validateReproducibility(exportWithInvalidExecutionPath);
      expect(report.warnings.some(w => w.code === 'INVALID_EXECUTION_PATH')).toBe(true);
    });
  });
  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const validator1 = ReproducibilityValidator.getInstance();
      const validator2 = ReproducibilityValidator.getInstance();
      expect(validator1).toBe(validator2);
    });
  });
});