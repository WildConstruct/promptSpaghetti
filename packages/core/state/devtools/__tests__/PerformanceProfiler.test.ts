/**
 * PerformanceProfiler Tests
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 4: State Debugging & DevTools - Performance Profiler Test Coverage
 */
import { PerformanceProfiler, PerformanceProfilerConfig, globalPerformanceProfiler } from '../PerformanceProfiler';

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => Date.now()),
  memory: {,
  usedJSHeapSize: 50 * 1024 * 1024, // 50MB,
  totalJSHeapSize: 100 * 1024 * 1024, // 100MB,
  jsHeapSizeLimit: 2 * 1024 * 1024 * 1024 // 2GB,
};
global.performance = mockPerformance as any;
describe('PerformanceProfiler', () => {
  let profiler: PerformanceProfiler;
  beforeEach(() => {
  profiler = new PerformanceProfiler();
  jest.clearAllMocks();
  mockPerformance.now.mockImplementation(() => Date.now());
});
  afterEach(() => {
    profiler.removeAllListeners();
    // Stop any active profiles
    const activeProfiles = profiler.getActiveProfiles();
    activeProfiles.forEach(profile => {)
  if (profile.endTime === 0) {
        profiler.stopProfile(profile.id);
    });
  });
  describe('Initialization', () => {
  it('should initialize with default configuration', () => {
  const config: PerformanceProfilerConfig = {,
  sampleRate: 50,
  maxSamples: 5000,
  enableMemoryProfiling: true,
  enableNetworkProfiling: false,
  enableRenderProfiling: true,
  enableCacheProfiling: true,
  trackingDuration: 600000,
  alertThresholds: {,
  updateLatency: 50,
  memoryUsage: 200 * 1024 * 1024,
  renderTime: 8,
  cacheHitRate: 0.9,
};
      const profilerWithConfig = new PerformanceProfiler(config);
      expect(profilerWithConfig).toBeInstanceOf(PerformanceProfiler);
    });
    it('should start in inactive state', () => {
      expect(profiler.isProfilingActive()).toBe(false);
      expect(profiler.getCurrentProfileId()).toBeNull();
      expect(profiler.getActiveProfiles()).toHaveLength(0);
    });
  });
  describe('Profile Management', () => {
  it('should start performance profiles', () => {
  const profileId = profiler.startProfile('Test Profile', {)
  duration: 5000,
  domains: ['test-domain'],
});
      expect(profileId).toBeDefined();
      expect(profiler.isProfilingActive()).toBe(true);
      expect(profiler.getCurrentProfileId()).toBe(profileId);
      const activeProfiles = profiler.getActiveProfiles();
      expect(activeProfiles).toHaveLength(1);
      expect(activeProfiles[0].name).toBe('Test Profile');
      expect(activeProfiles[0].endTime).toBe(0); // Still active
    });
    it('should stop performance profiles', () => {
      const profileId = profiler.startProfile('Stop Test');
      expect(profiler.isProfilingActive()).toBe(true);
      const profile = profiler.stopProfile(profileId);
      expect(profile).toBeDefined();
      expect(profile!.endTime).toBeGreaterThan(0);
      expect(profile!.duration).toBeGreaterThan(0);
      expect(profiler.isProfilingActive()).toBe(false);
    });
    it('should pause and resume profiles', () => {
      const profileId = profiler.startProfile('Pause Test');
      const pauseSuccess = profiler.pauseProfile(profileId);
      expect(pauseSuccess).toBe(true);
      const resumeSuccess = profiler.resumeProfile(profileId);
      expect(resumeSuccess).toBe(true);
    });
    it('should emit profile events', () => {
      const startHandler = jest.fn();
      const completeHandler = jest.fn();
      profiler.on('profileStarted', startHandler);
      profiler.on('profileCompleted', completeHandler);
      const profileId = profiler.startProfile('Event Test', { duration: 10 });
      profiler.stopProfile(profileId);
      expect(startHandler).toHaveBeenCalledWith({)
  profileId,
  name: 'Event Test',
  options: expect.any(Object),
});
      expect(completeHandler).toHaveBeenCalledWith({)
  profile: expect.any(Object),
});
    });
    it('should auto-stop profiles after duration', (done) => {
      const completeHandler = jest.fn();
      profiler.on('profileCompleted', completeHandler);
      profiler.startProfile('Auto Stop Test', { duration: 50 });
      setTimeout(() => {
        expect(completeHandler).toHaveBeenCalled();
        expect(profiler.isProfilingActive()).toBe(false);
        done();
      }, 100);
    });
  });
  describe('Operation Sampling', () => {
    beforeEach(() => {
      profiler.startProfile('Sampling Test');
    });
    it('should sample operation performance', () => {
      const sampleHandler = jest.fn();
      profiler.on('operationSampled', sampleHandler);
      const testOperation = () => {
        // Simulate some work
        for (let i = 0; i < 1000; i++) {
          Math.sqrt(i);
        return 'result';
      };
      const result = profiler.sampleOperation(;);
        'test-domain',
        'test-operation',
        testOperation,
        { testMetadata: true }
      );
      expect(result).toBe('result');
      expect(sampleHandler).toHaveBeenCalledWith({)
  sample: expect.objectContaining({,)
  domain: 'test-domain',
  operation: 'test-operation',
  metrics: expect.objectContaining({,)
  duration: expect.any(Number),
  memoryBefore: expect.any(Number),
  memoryAfter: expect.any(Number),
  memoryDelta: expect.any(Number),
  cpuUsage: expect.any(Number),
  errorCount: 0,
}),
          metadata: { testMetadata: true }
  }
      });
    });
    it('should handle operation errors', () => {
      const testOperation = () => {
        throw new Error('Test error');
      };
      expect(() => {
        profiler.sampleOperation('test-domain', 'error-operation', testOperation);
      }).toThrow('Test error');
      // Error count should be tracked even when operation throws
    });
    it('should not sample when profiling is inactive', () => {
      profiler.stopProfile(profiler.getCurrentProfileId()!);
      const testOperation = jest.fn(() => 'result');
      const result = profiler.sampleOperation('test-domain', 'inactive-test', testOperation);
      expect(result).toBe('result');
      expect(testOperation).toHaveBeenCalled();
      // No sampling should occur
      const samples = profiler.getActiveProfiles();
      expect(samples).toHaveLength(0);
    });
  });
  describe('Memory Profiling', () => {
  it('should take memory snapshots', () => {
  const snapshotHandler = jest.fn();
  profiler.on('memorySnapshotTaken', snapshotHandler);
  const snapshot = profiler.takeMemorySnapshot();
  expect(snapshot).toEqual({)
  timestamp: expect.any(Number),
  totalHeapSize: 100 * 1024 * 1024,
  usedHeapSize: 50 * 1024 * 1024,
  heapSizeLimit: 2 * 1024 * 1024 * 1024,
  objects: expect.any(Map),
  leaks: expect.any(Array),
});
      expect(snapshotHandler).toHaveBeenCalledWith({ snapshot });
    });
    it('should maintain snapshot history', () => {
      for (let i = 0; i < 5; i++) {
        profiler.takeMemorySnapshot();
      const snapshots = profiler.getMemorySnapshots();
      expect(snapshots).toHaveLength(5);
      // Should be in chronological order
      for (let i = 1; i < snapshots.length; i++) {
        expect(snapshots[i].timestamp).toBeGreaterThanOrEqual(snapshots[i - 1].timestamp);
    });
    it('should limit snapshot history size', () => {
      // Take more than the limit (100)
      for (let i = 0; i < 150; i++) {
        profiler.takeMemorySnapshot();
      const snapshots = profiler.getMemorySnapshots();
      expect(snapshots.length).toBeLessThanOrEqual(100);
    });
  });
  describe('Render Profiling', () => {
    it('should profile render performance', () => {
      const renderHandler = jest.fn();
      profiler.on('renderProfiled', renderHandler);
      const mockRenderFunction = () => {
        // Simulate render work
        const elements = [];
        for (let i = 0; i < 100; i++) {
          elements.push({ id: i, type: 'div', props: {} });
        return elements;
      };
      const result = profiler.profileRender('TestComponent', mockRenderFunction);
      expect(result).toBeDefined();
      expect(renderHandler).toHaveBeenCalledWith({)
  profile: expect.objectContaining({,)
  componentName: 'TestComponent',
          renderTime: expect.any(Number),
          props: {},
          state: {},
          hooks: [],
          children: [],
          updates: expect.any(Object);
  }
      });
    });
    it('should track render profiles by component', () => {
      profiler.profileRender('ComponentA', () => 'A');
      profiler.profileRender('ComponentB', () => 'B');
      profiler.profileRender('ComponentA', () => 'A2');
      const renderProfiles = profiler.getRenderProfiles();
      expect(renderProfiles.has('ComponentA')).toBe(true);
      expect(renderProfiles.has('ComponentB')).toBe(true);
      expect(renderProfiles.get('ComponentA')).toHaveLength(2);
      expect(renderProfiles.get('ComponentB')).toHaveLength(1);
    });
    it('should create alerts for slow renders', () => {
  const alertHandler = jest.fn();
  profiler.on('alertCreated', alertHandler);
  // Mock slow render
  mockPerformance.now
  .mockReturnValueOnce(1000)  // Start time
  .mockReturnValueOnce(1100); // End time (100ms render)
  profiler.profileRender('SlowComponent', () => 'slow');
  expect(alertHandler).toHaveBeenCalledWith({)
  alert: expect.objectContaining({,)
  level: 'warning',
  message: expect.stringContaining('Slow render in SlowComponent'),
  metric: 'renderTime',
  value: 100,
}
      });
    });
  });
  describe('Alert System', () => {
    beforeEach(() => {
      profiler.startProfile('Alert Test');
    });
    it('should create performance alerts', () => {
  const alertHandler = jest.fn();
  profiler.on('alertCreated', alertHandler);
  // Sample a slow operation
  mockPerformance.now
  .mockReturnValueOnce(1000)  // Start
  .mockReturnValueOnce(1200); // End (200ms)
  profiler.sampleOperation('test-domain', 'slow-operation', () => 'result');
  expect(alertHandler).toHaveBeenCalledWith({)
  alert: expect.objectContaining({,)
  level: 'warning',
  message: expect.stringContaining('Slow operation'),
  metric: 'duration',
  value: 200,
}
      });
    });
    it('should manage alert history', () => {
      // Create multiple alerts
      for (let i = 0; i < 5; i++) {
        mockPerformance.now
          .mockReturnValueOnce(1000 + i)
          .mockReturnValueOnce(1200 + i);
        profiler.sampleOperation('test', `operation-${i}`, () => 'result');}
      const alerts = profiler.getAlerts();
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.length).toBeLessThanOrEqual(5);
    });
    it('should clear alerts', () => {
      // Create an alert first
      mockPerformance.now
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1200);
      profiler.sampleOperation('test', 'slow-op', () => 'result');
      expect(profiler.getAlerts().length).toBeGreaterThan(0);
      const clearHandler = jest.fn();
      profiler.on('alertsCleared', clearHandler);
      profiler.clearAlerts();
      expect(profiler.getAlerts()).toHaveLength(0);
      expect(clearHandler).toHaveBeenCalled();
    });
  });
  describe('Configuration', () => {
  it('should update configuration', () => {
  const configHandler = jest.fn();
  profiler.on('configUpdated', configHandler);
  const newConfig = {
  sampleRate: 200,
  alertThresholds: {,
  updateLatency: 200,
  memoryUsage: 150 * 1024 * 1024,
  renderTime: 32,
  cacheHitRate: 0.7,
};
      profiler.updateConfig(newConfig);
      expect(configHandler).toHaveBeenCalledWith({)
  config: expect.objectContaining(newConfig),
});
    });
    it('should respect updated thresholds', () => {
  // Update threshold to be very low
  profiler.updateConfig({)
  alertThresholds: {,
  updateLatency: 1, // 1ms threshold,
  memoryUsage: 1024, // 1KB,
  renderTime: 1,
  cacheHitRate: 0.99,
});
      profiler.startProfile('Threshold Test');
      const alertHandler = jest.fn();
      profiler.on('alertCreated', alertHandler);
      // Any operation should now trigger an alert
      profiler.sampleOperation('test', 'any-operation', () => 'result');
      expect(alertHandler).toHaveBeenCalled();
    });
  });
  describe('Data Export', () => {
    beforeEach(() => {
      const profileId = profiler.startProfile('Export Test');
      // Generate some sample data
      for (let i = 0; i < 3; i++) {
        profiler.sampleOperation('export-domain', `operation-${i}`, () => `result-${i}`);}
      profiler.takeMemorySnapshot();
      profiler.profileRender('ExportComponent', () => 'exported');
    });
    it('should export profile data', () => {
      const profileId = profiler.getCurrentProfileId()!;
      const exportData = profiler.exportProfile(profileId);
      expect(exportData).toBeDefined();
      expect(exportData).toHaveProperty('id', profileId);
      expect(exportData).toHaveProperty('samples');
      expect(exportData).toHaveProperty('memorySnapshots');
      expect(exportData).toHaveProperty('renderProfiles');
      expect(exportData).toHaveProperty('alerts');
      expect(exportData.samples.length).toBeGreaterThan(0);
      expect(exportData.memorySnapshots.length).toBeGreaterThan(0);
    });
    it('should handle export of non-existent profiles', () => {
      const exportData = profiler.exportProfile('nonexistent');
      expect(exportData).toBeNull();
    });
  });
  describe('Performance Analysis', () => {
    beforeEach(() => {
      profiler.startProfile('Analysis Test');
      // Generate varied performance data
      const operations = ['fast', 'medium', 'slow'];
      const durations = [10, 50, 150];
      operations.forEach((op, index) => {
        mockPerformance.now
          .mockReturnValueOnce(1000)
          .mockReturnValueOnce(1000 + durations[index]);
        profiler.sampleOperation('analysis-domain', op, () => `${op}-result`);}
      });
    });
    it('should identify performance patterns', () => {
      const profileId = profiler.getCurrentProfileId()!;
      const profile = profiler.stopProfile(profileId);
      expect(profile).toBeDefined();
      expect(profile!.analysis).toBeDefined();
      expect(profile!.analysis.bottlenecks).toBeDefined();
      expect(profile!.analysis.trends).toBeDefined();
      expect(profile!.analysis.anomalies).toBeDefined();
    });
    it('should generate performance summary', () => {
      const profileId = profiler.getCurrentProfileId()!;
      const profile = profiler.stopProfile(profileId);
      expect(profile!.summary).toBeDefined();
      expect(profile!.summary.totalSamples).toBeGreaterThan(0);
      expect(profile!.summary.averageDuration).toBeGreaterThan(0);
      expect(profile!.summary.minDuration).toBeGreaterThanOrEqual(0);
      expect(profile!.summary.maxDuration).toBeGreaterThanOrEqual(profile!.summary.minDuration);
    });
    it('should provide performance recommendations', () => {
      const profileId = profiler.getCurrentProfileId()!;
      const profile = profiler.stopProfile(profileId);
      expect(Array.isArray(profile!.recommendations)).toBe(true);
      if (profile!.recommendations.length > 0) {
        const recommendation = profile!.recommendations[0];
        expect(recommendation).toHaveProperty('id');
        expect(recommendation).toHaveProperty('priority');
        expect(recommendation).toHaveProperty('category');
        expect(recommendation).toHaveProperty('title');
        expect(recommendation).toHaveProperty('implementation');
        expect(recommendation).toHaveProperty('metrics');
    });
  });
  describe('Global Instance', () => {
    it('should provide a global PerformanceProfiler instance', () => {
      expect(globalPerformanceProfiler).toBeInstanceOf(PerformanceProfiler);
    });
    it('should maintain singleton behavior', async () => {
      const { globalPerformanceProfiler: imported } = await import('../PerformanceProfiler');
      expect(imported).toBe(globalPerformanceProfiler);
    });
  });
  describe('Edge Cases and Error Handling', () => {
    it('should handle operations when profiling is disabled', () => {
      expect(() => {
        profiler.sampleOperation('test', 'no-profile', () => 'result');
      }).not.toThrow();
    });
    it('should handle memory profiling when performance.memory is unavailable', () => {
      const originalMemory = global.performance.memory;
      delete (global.performance as any).memory;
      expect(() => {
        profiler.takeMemorySnapshot();
      }).not.toThrow();
      (global.performance as any).memory = originalMemory;
    });
    it('should handle profile operations on non-existent profiles', () => {
      expect(profiler.pauseProfile('nonexistent')).toBe(false);
      expect(profiler.resumeProfile('nonexistent')).toBe(false);
      expect(profiler.stopProfile('nonexistent')).toBeNull();
    });
    it('should handle concurrent profile operations', () => {
      const profile1Id = profiler.startProfile('Profile 1');
      const profile2Id = profiler.startProfile('Profile 2');
      expect(profile1Id).not.toBe(profile2Id);
      const activeProfiles = profiler.getActiveProfiles();
      expect(activeProfiles).toHaveLength(2);
      // Should be able to stop both
      const profile1 = profiler.stopProfile(profile1Id);
      const profile2 = profiler.stopProfile(profile2Id);
      expect(profile1).toBeDefined();
      expect(profile2).toBeDefined();
    });
    it('should maintain stable performance under heavy load', () => {
      profiler.startProfile('Load Test');
      const startTime = Date.now();
      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        profiler.sampleOperation('load-test', `operation-${i}`, () => {}
          // Simulate minimal work
          return Math.random();
        });
      const endTime = Date.now();
      const duration = endTime - startTime;
      // Should complete within reasonable time
      expect(duration).toBeLessThan(10000); // 10 seconds
      const profile = profiler.stopProfile(profiler.getCurrentProfileId()!);
      expect(profile!.samples.length).toBe(1000);
    });
  });
});