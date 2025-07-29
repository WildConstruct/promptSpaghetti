/**
 * StateDevTools Tests
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 4: State Debugging & DevTools - Test Coverage
 */
import { StateDevTools, StateInspectionConfig, globalStateDevTools } from '../StateDevTools';
import { TimeTravel } from '../TimeTravel';
import { PerformanceProfiler } from '../PerformanceProfiler';

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  memory: {
  usedJSHeapSize: 50 * 1024 * 1024, // 50MB,
  totalJSHeapSize: 100 * 1024 * 1024, // 100MB,
  jsHeapSizeLimit: 2 * 1024 * 1024 * 1024 // 2GB,
};
global.performance = mockPerformance as any;
describe('StateDevTools', () => {
  let devTools: StateDevTools;
  beforeEach(() => {
  devTools = new StateDevTools();
  jest.clearAllMocks();
});
  afterEach(() => {
    devTools.removeAllListeners();
    devTools.stopRecording();
  });
  describe('Initialization', () => {
  it('should initialize with default configuration', () => {
  const config: StateInspectionConfig = {,
  enableTimeTravel: true,
  enablePerformanceTracking: true,
  enableDependencyVisualization: true,
  maxHistorySize: 1000,
  trackingInterval: 100,
  enableStateValidation: true,
  enableMemoryTracking: true,
  enableNetworkTracking: true,
};
      const devToolsWithConfig = new StateDevTools(config);
      expect(devToolsWithConfig).toBeInstanceOf(StateDevTools);
    });
    it('should start recording when enabled', () => {
      devTools.startRecording();
      const status = devTools.getRecordingStatus();
      expect(status.isRecording).toBe(true);
      expect(status.isReplaying).toBe(false);
    });
    it('should stop recording when disabled', () => {
      devTools.startRecording();
      devTools.stopRecording();
      const status = devTools.getRecordingStatus();
      expect(status.isRecording).toBe(false);
    });
  });
  describe('State Recording', () => {
    beforeEach(() => {
      devTools.startRecording();
    });
    it('should record state changes', () => {
      const snapshot = {
        id: 'test_snapshot_1',
        timestamp: Date.now(),
        state: { count: 1, name: 'test' },
        metadata: { domain: 'test-domain' }
      };
      devTools.recordStateChange(snapshot, 'test-domain');
      const history = devTools.getStateHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject(snapshot);
    });
    it('should maintain history size limit', () => {
  const maxSize = 5;
  const devToolsLimited = new StateDevTools({)
  maxHistorySize: maxSize,
  enableTimeTravel: true,
  enablePerformanceTracking: false,
  enableDependencyVisualization: false,
  trackingInterval: 100,
  enableStateValidation: false,
  enableMemoryTracking: false,
  enableNetworkTracking: false,
});
      devToolsLimited.startRecording();
      // Record more snapshots than the limit
      for (let i = 0; i < maxSize + 3; i++) {
        const snapshot = {
          id: `snapshot_${i}`}
},
  timestamp: Date.now() + i,
          state: { count: i },
          metadata: { domain: 'test' }
        };
        devToolsLimited.recordStateChange(snapshot, 'test');
      const history = devToolsLimited.getStateHistory();
      expect(history).toHaveLength(maxSize);
      devToolsLimited.stopRecording();
    });
    it('should emit events when recording state changes', () => {
      const eventHandler = jest.fn();
      devTools.on('stateRecorded', eventHandler);
      const snapshot = {
        id: 'test_snapshot_2',
        timestamp: Date.now(),
        state: { data: 'test' },
        metadata: { domain: 'test-domain' }
      };
      devTools.recordStateChange(snapshot, 'test-domain');
      expect(eventHandler).toHaveBeenCalledWith({)
  snapshot: expect.objectContaining(snapshot),
  domain: 'test-domain',
});
    });
  });
  describe('State Validation', () => {
    it('should validate state integrity', () => {
      const state = {
        users: [,
          { id: 1, name: 'John', active: true },
          { id: 2, name: 'Jane', active: false }
        ],
        settings: {
  theme: 'dark',
  notifications: true,
};
      const result = devTools.validateStateIntegrity(state, 'app', {)
  deep: true,
  checkReferences: true,
});
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.performance.validationTime).toBeGreaterThan(0);
    });
    it('should detect invalid state', () => {
      const invalidState = null;
      const result = devTools.validateStateIntegrity(invalidState, 'app');
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('NULL_STATE');
    });
    it('should detect circular references', () => {
      const circularState: any = { name: 'test' };
      circularState.self = circularState;
      const result = devTools.validateStateIntegrity(circularState, 'app', {)
  deep: true,
  checkReferences: true,
});
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'CIRCULAR_REFERENCE')).toBe(true);
    });
    it('should provide performance metrics for validation', () => {
      const largeState = {
        items: Array.from({ length: 1000 }, (_, i) => ({)
  id: i,
          data: `item_${i}`}
},
  metadata: { created: Date.now(), index: i }
        }))
      };
      const result = devTools.validateStateIntegrity(largeState, 'app');
      expect(result.performance.validationTime).toBeGreaterThan(0);
      expect(result.performance.memoryImpact).toBeGreaterThanOrEqual(0);
    });
  });
  describe('Time Travel Replay', () => {
    beforeEach(() => {
      devTools.startRecording();
      // Record some snapshots
      for (let i = 0; i < 5; i++) {
        const snapshot = {
          id: `snapshot_${i}`}
},
  timestamp: Date.now() + i * 1000,
          state: { count: i, step: `step_${i}` }
},
  metadata: { domain: 'counter', step: i }
        };
        devTools.recordStateChange(snapshot, 'counter');
    });
    it('should create replay environment', () => {
  const fromTime = Date.now() - 1000;
  const toTime = Date.now() + 10000;
  const replayEnv = devTools.replayStateChanges(fromTime, toTime, {)
  stepDelay: 10,
  highlightChanges: true,
  showDiff: true,
});
      expect(replayEnv.id).toBeDefined();
      expect(replayEnv.changes.length).toBeGreaterThan(0);
      expect(replayEnv.currentIndex).toBe(-1);
    });
    it('should emit replay events', (done) => {
  const replayStartHandler = jest.fn();
  const replayStepHandler = jest.fn();
  devTools.on('replayStarted', replayStartHandler);
  devTools.on('replayStep', replayStepHandler);
  const fromTime = Date.now() - 1000;
  const toTime = Date.now() + 10000;
  devTools.replayStateChanges(fromTime, toTime, {)
  stepDelay: 10,
  speed: 10 // Speed up for testing,
});
      setTimeout(() => {
        expect(replayStartHandler).toHaveBeenCalled();
        // Stop replay and check
        devTools.stopReplay();
        done();
      }, 100);
    });
    it('should handle empty time range', () => {
      const futureTime = Date.now() + 100000;
      expect(() => {
        devTools.replayStateChanges(futureTime, futureTime + 1000);
      }).toThrow('No state changes found in the specified time range');
    });
  });
  describe('Dependency Visualization', () => {
  it('should generate dependency graph', () => {
  const graph = devTools.visualizeStateDependencies({)
  domains: ['test-domain'],
  includeComponents: true,
  includeSelectors: true,
  layout: 'hierarchical',
});
      expect(graph).toHaveProperty('nodes');
      expect(graph).toHaveProperty('edges');
      expect(graph).toHaveProperty('metadata');
      expect(graph.metadata).toHaveProperty('totalNodes');
      expect(graph.metadata).toHaveProperty('totalEdges');
      expect(graph.metadata).toHaveProperty('lastUpdated');
    });
    it('should emit dependency graph update events', () => {
  const eventHandler = jest.fn();
  devTools.on('dependencyGraphUpdated', eventHandler);
  devTools.visualizeStateDependencies();
  expect(eventHandler).toHaveBeenCalledWith({)
  graph: expect.objectContaining({,)
  nodes: expect.any(Array),
  edges: expect.any(Array),
  metadata: expect.any(Object),
}
      });
    });
  });
  describe('Performance Analysis', () => {
  it('should detect performance bottlenecks', () => {
  const timeRange = {
  start: Date.now() - 60000, // 1 minute ago,
  end: Date.now(),
};
      const report = devTools.detectStateBottlenecks(timeRange);
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('bottlenecks');
      expect(report).toHaveProperty('recommendations');
      expect(report).toHaveProperty('trends');
      expect(report.summary).toHaveProperty('totalStateUpdates');
      expect(report.summary).toHaveProperty('averageUpdateLatency');
      expect(report.summary).toHaveProperty('memoryUsage');
    });
    it('should generate performance recommendations', () => {
      const report = devTools.detectStateBottlenecks();
      expect(Array.isArray(report.recommendations)).toBe(true);
      report.recommendations.forEach(recommendation => {)
  expect(recommendation).toHaveProperty('id');
        expect(recommendation).toHaveProperty('priority');
        expect(recommendation).toHaveProperty('category');
        expect(recommendation).toHaveProperty('title');
        expect(recommendation).toHaveProperty('description');
      });
    });
    it('should emit performance report events', () => {
  const eventHandler = jest.fn();
  devTools.on('performanceReportGenerated', eventHandler);
  devTools.detectStateBottlenecks();
  expect(eventHandler).toHaveBeenCalledWith({)
  report: expect.any(Object),
  timeRange: expect.any(Object),
});
    });
  });
  describe('Data Management', () => {
    it('should export session data', () => {
      // Record some data first
      devTools.startRecording();
      const snapshot = {
        id: 'export_test',
        timestamp: Date.now(),
        state: { test: true },
        metadata: { domain: 'export-test' }
      };
      devTools.recordStateChange(snapshot, 'export-test');
      const sessionData = devTools.exportSession();
      expect(sessionData).toHaveProperty('config');
      expect(sessionData).toHaveProperty('history');
      expect(sessionData).toHaveProperty('metrics');
      expect(sessionData).toHaveProperty('dependencyGraph');
      expect(sessionData.history).toHaveLength(1);
    });
    it('should import session data', () => {
  const mockSessionData = {
  config: {
  enableTimeTravel: true,
  maxHistorySize: 500,
},
  history: [,
          {
            id: 'imported_snapshot',
            timestamp: Date.now(),
            state: { imported: true },
            metadata: { domain: 'import-test' }
        ],
        metrics: {},
        dependencyGraph: {
  nodes: [],
          edges: [],
          metadata: { totalNodes: 0, totalEdges: 0 }
      };
      const eventHandler = jest.fn();
      devTools.on('sessionImported', eventHandler);
      devTools.importSession(mockSessionData);
      expect(eventHandler).toHaveBeenCalledWith({)
  sessionData: mockSessionData,
});
      const history = devTools.getStateHistory();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe('imported_snapshot');
    });
    it('should clear history', () => {
      // Record some data first
      devTools.startRecording();
      for (let i = 0; i < 3; i++) {
        const snapshot = {
          id: `clear_test_${i}`}
},
  timestamp: Date.now() + i,
          state: { index: i },
          metadata: { domain: 'clear-test' }
        };
        devTools.recordStateChange(snapshot, 'clear-test');
      expect(devTools.getStateHistory()).toHaveLength(3);
      const eventHandler = jest.fn();
      devTools.on('historyCleared', eventHandler);
      devTools.clearHistory();
      expect(devTools.getStateHistory()).toHaveLength(0);
      expect(eventHandler).toHaveBeenCalled();
    });
  });
  describe('Memory Tracking', () => {
    it('should get recording status with memory usage', () => {
      devTools.startRecording();
      const status = devTools.getRecordingStatus();
      expect(status).toHaveProperty('memoryUsage');
      expect(status.memoryUsage).toBe(50 * 1024 * 1024); // Mock value
    });
    it('should track memory in state snapshots', () => {
      devTools.startRecording();
      const snapshot = {
        id: 'memory_test',
        timestamp: Date.now(),
        state: { data: 'test' },
        metadata: { domain: 'memory-test' }
      };
      devTools.recordStateChange(snapshot, 'memory-test');
      const history = devTools.getStateHistory();
      expect(history[0].metadata).toHaveProperty('memoryUsage');
      expect(history[0].metadata.memoryUsage).toBe(50 * 1024 * 1024);
    });
  });
  describe('Error Handling', () => {
    it('should handle validation errors gracefully', () => {
      const invalidState = { test: true };
      // Mock console.error to avoid noise in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      // Should not throw
      expect(() => {
  devTools.validateStateIntegrity(invalidState, 'error-test', {)
  deep: true,
  checkReferences: true,
});
      }).not.toThrow();
      consoleSpy.mockRestore();
    });
    it('should handle replay errors gracefully', () => {
      // Should not throw with invalid time range
      expect(() => {
        devTools.stopReplay();
      }).not.toThrow();
    });
  });
  describe('Global Instance', () => {
    it('should provide a global DevTools instance', () => {
      expect(globalStateDevTools).toBeInstanceOf(StateDevTools);
    });
    it('should maintain singleton behavior', async () => {
      const { globalStateDevTools: imported } = await import('../StateDevTools');
      expect(imported).toBe(globalStateDevTools);
    });
  });
  describe('Integration Scenarios', () => {
    it('should handle rapid state changes', () => {
      devTools.startRecording();
      // Rapidly record many changes
      for (let i = 0; i < 100; i++) {
        const snapshot = {
          id: `rapid_${i}`}
},
  timestamp: Date.now() + i,
          state: { counter: i, batch: 'rapid' },
          metadata: { domain: 'rapid-test', index: i }
        };
        devTools.recordStateChange(snapshot, 'rapid-test');
      const history = devTools.getStateHistory();
      expect(history.length).toBe(100);
      // Should maintain chronological order
      for (let i = 1; i < history.length; i++) {
        expect(history[i].timestamp).toBeGreaterThanOrEqual(history[i - 1].timestamp);
    });
    it('should work with multiple domains simultaneously', () => {
      devTools.startRecording();
      const domains = ['domain-a', 'domain-b', 'domain-c'];
      domains.forEach((domain, domainIndex) => {
        for (let i = 0; i < 5; i++) {
          const snapshot = {
            id: `${domain}_${i}`}
},
  timestamp: Date.now() + domainIndex * 1000 + i,
            state: { domain, index: i },
            metadata: { domain, step: i }
          };
          devTools.recordStateChange(snapshot, domain);
      });
      const history = devTools.getStateHistory();
      expect(history.length).toBe(15);
      // Check that all domains are represented
      const recordedDomains = [...new Set(history.map(s => s.metadata?.domain))];
      expect(recordedDomains.sort()).toEqual(domains.sort());
    });
    it('should maintain performance under load', () => {
      const startTime = performance.now();
      devTools.startRecording();
      // Record a large number of state changes
      for (let i = 0; i < 1000; i++) {
        const snapshot = {
          id: `load_test_${i}`}
},
  timestamp: Date.now() + i,
          state: {
  counter: i,
            data: Array.from({ length: 10 }, (_, j) => `item_${i}_${j}`)}
},
  metadata: { processed: Date.now(), batch: Math.floor(i / 100) }
  },
  metadata: { domain: 'load-test', index: i }
        };
        devTools.recordStateChange(snapshot, 'load-test');
      const endTime = performance.now();
      const duration = endTime - startTime;
      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(5000); // 5 seconds
      const history = devTools.getStateHistory();
      expect(history.length).toBe(1000);
    });
  });
});