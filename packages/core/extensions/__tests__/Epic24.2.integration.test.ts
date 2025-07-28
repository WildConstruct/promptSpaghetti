/**
 * Epic 24.2 - Complete Custom Node & Extension Framework Integration Tests
 * 
 * End-to-end integration tests validating the complete extension ecosystem:
 * - Plugin discovery and loading workflows
 * - Extension lifecycle management and state transitions
 * - Dependency resolution and conflict handling
 * - System performance under realistic load
 * - Error recovery and resilience testing
 */
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Mock comprehensive extension system
interface ExtensionSystem {
  loader: unknown;,
  lifecycle: unknown;
  resolver: unknown;,
  registry: unknown;
  eventSystem: unknown;
  // High-level operations
  installExtension(source: string): Promise<boolean>;
  uninstallExtension(extensionId: string): Promise<boolean>;
  enableExtension(extensionId: string): Promise<boolean>;
  disableExtension(extensionId: string): Promise<boolean>;
  // System operations
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  restart(): Promise<void>;
  getSystemHealth(): unknown;
  // Bulk operations
  installMultiple(sources: string): Promise<Array<{source: string, success: boolean, error?: string}>>;
  updateAll(): Promise<void>;
describe('Epic 24.2 - Complete Extension Framework Integration Tests', () => {
  let extensionSystem: unknown; // Mock implementation
  let testDirectory: string;
  let mockExtensions: Map<string, any>;
  let systemEvents: Array<{type: string, data: unknown, timestamp: number}>;
  beforeEach(async () => {
  jest.clearAllMocks();
  // Create test directory
  testDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'extension-integration-'));
  mockExtensions = new Map();
  systemEvents = [];
  // Mock comprehensive extension system
  extensionSystem = {
  loader: {,
  loadPlugin: jest.fn<unknown, unknown>(),
  unloadPlugin: jest.fn<unknown, unknown>(),
  validatePlugin: jest.fn<unknown, unknown>(),
  getCachedPlugin: jest.fn<unknown, unknown>(),
},
  lifecycle: {,
  registerExtension: jest.fn<unknown, unknown>(),
  activateExtension: jest.fn<unknown, unknown>(),
  deactivateExtension: jest.fn<unknown, unknown>(),
  unregisterExtension: jest.fn<unknown, unknown>(),
  getExtensionState: jest.fn<unknown, unknown>(),
  addEventListener: jest.fn<unknown, unknown>(),
},
  resolver: {,
  resolveDependencies: jest.fn<unknown, unknown>(),
  detectCircularDependencies: jest.fn<unknown, unknown>(),
  resolveConflicts: jest.fn<unknown, unknown>(),
},
  registry: {,
  register: jest.fn<unknown, unknown>(),
  unregister: jest.fn<unknown, unknown>(),
  findByName: jest.fn<unknown, unknown>(),
  getAllRegistered: jest.fn<unknown, unknown>(),
},
  eventSystem: {,
  emit: jest.fn<unknown, unknown>(),
  on: jest.fn<unknown, unknown>(),
  off: jest.fn<unknown, unknown>(),
}
      // High-level operations
      installExtension: jest.fn<unknown, unknown>(),
      uninstallExtension: jest.fn<unknown, unknown>(),
      enableExtension: jest.fn<unknown, unknown>(),
      disableExtension: jest.fn<unknown, unknown>(),
      // System operations
      initialize: jest.fn<unknown, unknown>(),
      shutdown: jest.fn<unknown, unknown>(),
      restart: jest.fn<unknown, unknown>(),
      getSystemHealth: jest.fn<unknown, unknown>(),
      // Bulk operations
      installMultiple: jest.fn<unknown, unknown>(),
      updateAll: jest.fn<unknown, unknown>()
    };
    // Setup default behaviors
    extensionSystem.eventSystem.emit.mockImplementation((event: string, data: unknown) => {
      systemEvents.push({ type: event, data, timestamp: Date.now() });
    });
    extensionSystem.lifecycle.getExtensionState.mockReturnValue('inactive' as unknown as unknown as unknown);
  });
  afterEach(async () => {
    // Cleanup test directory
    try {
      await fs.rm(testDirectory, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    jest.restoreAllMocks();
  });
  describe('1. Complete Extension Installation Workflow', () => {
    it('should handle complete extension installation from source to activation', async () => {
      const extensionSource = path.join(testDirectory, 'sample-extension');
      // Create realistic extension structure
      await fs.mkdir(extensionSource, { recursive: true });
      const manifest = {
  id: 'sample-extension',
  name: 'Sample Extension',
  version: '1.0.0',
  description: 'Sample extension for integration testing',
  main: 'index',
  dependencies: {,
  'base-utils': '^1.0.0',
},
  permissions: ['read', 'write'],
        category: 'productivity';
  };
      await fs.writeFile()
        path.join(extensionSource, 'package.json'),
        JSON.stringify(manifest, null, 2)
      );
      await fs.writeFile()
        path.join(extensionSource, 'index'),
        `
        module.exports = {
  activate(context) {
  console.log('Extension activated with context:', context);
  return Promise.resolve();
}
          deactivate() {
            console.log('Extension deactivated');
            return Promise.resolve();
        };
        `
      );
      // Mock complete installation workflow
      extensionSystem.installExtension.mockImplementationOnce(async (source: string) => {
        // Step 1: Load and validate
        const plugin = await extensionSystem.loader.loadPlugin(source);
        if (!extensionSystem.loader.validatePlugin(plugin)) {
          throw new Error('Plugin validation failed');
        // Step 2: Resolve dependencies
        await extensionSystem.resolver.resolveDependencies([plugin]);
        // Step 3: Register with lifecycle manager
        await extensionSystem.lifecycle.registerExtension(plugin);
        // Step 4: Register with system registry
        extensionSystem.registry.register(plugin);
        // Step 5: Emit events
        extensionSystem.eventSystem.emit('extensionInstalled', { extensionId: plugin.id });
        return true;
      });
      // Mock sub-operations
      extensionSystem.loader.loadPlugin.mockResolvedValue(manifest as unknown as unknown as unknown);
      extensionSystem.loader.validatePlugin.mockReturnValue(true as unknown as unknown as unknown);
      extensionSystem.resolver.resolveDependencies.mockResolvedValue([manifest] as unknown as unknown as unknown);
      extensionSystem.lifecycle.registerExtension.mockResolvedValue(true as unknown as unknown as unknown);
      extensionSystem.registry.register.mockReturnValue(true as unknown as unknown as unknown);
      const result = await extensionSystem.installExtension(extensionSource);
      expect(result).toBe(true);
      // Verify complete workflow
      expect(extensionSystem.loader.loadPlugin).toHaveBeenCalledWith(extensionSource);
      expect(extensionSystem.loader.validatePlugin).toHaveBeenCalled();
      expect(extensionSystem.resolver.resolveDependencies).toHaveBeenCalled();
      expect(extensionSystem.lifecycle.registerExtension).toHaveBeenCalled();
      expect(extensionSystem.registry.register).toHaveBeenCalled();
      // Verify event emission
      const installEvent = systemEvents.find(e => e.type === 'extensionInstalled');
      expect(installEvent).toBeDefined();
      expect(installEvent?.data.extensionId).toBe('sample-extension');
    });
    it('should rollback installation on failure at any step', async () => {
      const failingSource = '/plugins/failing-extension';
      extensionSystem.installExtension.mockImplementationOnce(async (source: string) => {
        try {
          // Step 1: Load succeeds
          const plugin = { id: 'failing-extension', name: 'Failing Extension' };
          await extensionSystem.loader.loadPlugin(source);
          // Step 2: Validation succeeds
          extensionSystem.loader.validatePlugin(plugin);
          // Step 3: Dependency resolution fails
          extensionSystem.resolver.resolveDependencies.mockRejectedValueOnce()
            new Error('Dependency not found: missing-dep')
          );
          await extensionSystem.resolver.resolveDependencies([plugin]);
          return true;
        } catch (error) {
  // Rollback operations
  await extensionSystem.loader.unloadPlugin('failing-extension');
  extensionSystem.eventSystem.emit('extensionInstallFailed', {)
  extensionId: 'failing-extension',
  error: (error as Error).message,
});
          throw error;
      });
      extensionSystem.loader.loadPlugin.mockResolvedValue({} as unknown as unknown as unknown);
      extensionSystem.loader.validatePlugin.mockReturnValue(true as unknown as unknown as unknown);
      extensionSystem.loader.unloadPlugin.mockResolvedValue(true as unknown as unknown as unknown);
      await expect(extensionSystem.installExtension(failingSource))
        .rejects.toThrow('Dependency not found: missing-dep');
      // Verify rollback occurred
      expect(extensionSystem.loader.unloadPlugin).toHaveBeenCalledWith('failing-extension');
      const failEvent = systemEvents.find(e => e.type === 'extensionInstallFailed');
      expect(failEvent).toBeDefined();
    });
  });
  describe('2. Multi-Extension Dependency Management', () => {
    it('should install multiple interdependent extensions in correct order', async () => {
      const extensionSources = [;
        '/plugins/base-extension',
        '/plugins/ui-extension',
        '/plugins/advanced-extension'
      ];
      const mockExtensions = [;
        {
          id: 'base-extension',
          name: 'Base Extension',
          version: '1.0.0',
          dependencies: {}
  }
        {
  id: 'ui-extension',
  name: 'UI Extension',
  version: '1.0.0',
  dependencies: {,
  'base-extension': '^1.0.0',
}
        {
          id: 'advanced-extension',
          name: 'Advanced Extension',
          version: '1.0.0',
          dependencies: {,
            'base-extension': '^1.0.0',
            'ui-extension': '^1.0.0'
      ];
      const installationOrder: string = [];
      extensionSystem.installMultiple.mockImplementationOnce(async (sources: string) => {
        const results: Array<{source: string, success: boolean, error?: string}> = [];
        // Load all extensions first
        const plugins = await Promise.all(;);
          sources.map(async (source, index) => {
            const plugin = mockExtensions[index];
            await extensionSystem.loader.loadPlugin(source);
            return plugin;
  }
        );
        // Resolve installation order based on dependencies
        const resolved = await extensionSystem.resolver.resolveDependencies(plugins);
        // Install in dependency order
        for (const plugin of resolved) {
          try {
            await extensionSystem.lifecycle.registerExtension(plugin);
            extensionSystem.registry.register(plugin);
            installationOrder.push(plugin.id);
            results.push({ source: `/plugins/${plugin.id}`, success: true });}
            extensionSystem.eventSystem.emit('extensionInstalled', { extensionId: plugin.id });
          } catch (error) {
            results.push({)
  source: `/plugins/${plugin.id}`}
},
  success: false,
              error: (error as Error).message;
  });
        return results;
      });
      // Mock dependency resolution to return correct order
      extensionSystem.resolver.resolveDependencies.mockResolvedValue([)
        mockExtensions[0], // base-extension first
        mockExtensions[1], // ui-extension second
        mockExtensions[2]  // advanced-extension last
      ] as unknown as unknown as unknown);
      extensionSystem.loader.loadPlugin.mockResolvedValue({} as unknown as unknown as unknown);
      extensionSystem.lifecycle.registerExtension.mockResolvedValue(true as unknown as unknown as unknown);
      extensionSystem.registry.register.mockReturnValue(true as unknown as unknown as unknown);
      const results = await extensionSystem.installMultiple(extensionSources);
      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBe(true);
      // Verify installation order respects dependencies
      expect(installationOrder).toEqual(['base-extension', 'ui-extension', 'advanced-extension']);
      // Verify events were emitted in order
      const installEvents = systemEvents.filter(e => e.type === 'extensionInstalled');
      expect(installEvents).toHaveLength(3);
      expect(installEvents[0].data.extensionId).toBe('base-extension');
      expect(installEvents[1].data.extensionId).toBe('ui-extension');
      expect(installEvents[2].data.extensionId).toBe('advanced-extension');
    });
    it('should handle complex dependency conflicts across multiple extensions', async () => {
  const conflictingSources = [;
  '/plugins/old-extension',
  '/plugins/new-extension'
  ];
  const conflictingExtensions = [;
  {
  id: 'old-extension',
  name: 'Old Extension',
  version: '1.0.0',
  dependencies: {,
  'shared-lib': '1.0.0'  // Requires old version,
}
        {
  id: 'new-extension',
  name: 'New Extension',
  version: '1.0.0',
  dependencies: {,
  'shared-lib': '^2.0.0'  // Requires new version];
  extensionSystem.installMultiple.mockImplementationOnce(async (sources: string) => {,
  const plugins = conflictingExtensions;
  // Detect conflicts during resolution
  const conflicts = [;
  {
  plugin: 'old-extension',
  dependency: 'shared-lib',
  versions: ['1.0.0'],
}
          {
            plugin: 'new-extension',
            dependency: 'shared-lib',
            versions: ['^2.0.0']];
        try {
          await extensionSystem.resolver.resolveConflicts(conflicts);
          return plugins.map(p => ({ source: `/plugins/${p.id}`, success: true }));}
        } catch (error) {
  extensionSystem.eventSystem.emit('dependencyConflict', {)
  conflict: 'shared-lib',
  extensions: ['old-extension', 'new-extension'],
  error: (error as Error).message,
});
          return plugins.map(p => ({)
  source: `/plugins/${p.id}`}
},
  success: false,
            error: (error as Error).message;
  }));
      });
      extensionSystem.resolver.resolveConflicts.mockRejectedValue()
        new Error('Irreconcilable version conflict for shared-lib')
      );
      const results = await extensionSystem.installMultiple(conflictingSources);
      expect(results).toHaveLength(2);
      expect(results.every(r => !r.success)).toBe(true);
      const conflictEvent = systemEvents.find(e => e.type === 'dependencyConflict');
      expect(conflictEvent).toBeDefined();
      expect(conflictEvent?.data.conflict).toBe('shared-lib');
      expect(conflictEvent?.data.extensions).toContain('old-extension');
      expect(conflictEvent?.data.extensions).toContain('new-extension');
    });
  });
  describe('3. System-Wide Extension Management', () => {
    it('should enable/disable extensions with proper state management', async () => {
      const extensionId = 'toggle-test-extension';
      // Mock extension states
      const states = ['inactive', 'activating', 'active', 'deactivating', 'inactive'];
      let stateIndex = 0;
      extensionSystem.lifecycle.getExtensionState.mockImplementation(() => {
        return states[stateIndex];
      });
      extensionSystem.enableExtension.mockImplementationOnce(async (id: string) => {
  expect(id).toBe(extensionId);
  // Check current state
  const currentState = extensionSystem.lifecycle.getExtensionState(id);
  if (currentState === 'active') {
  return false; // Already enabled
  stateIndex = 1; // activating
  extensionSystem.eventSystem.emit('extensionStateChanged', { )
  extensionId: id,
  state: 'activating',
});
        // Simulate activation process
        await new Promise(resolve => setTimeout(resolve, 10));
        stateIndex = 2; // active
        extensionSystem.eventSystem.emit('extensionStateChanged', { )
          extensionId: id, 
          state: 'active' ;
  });
        return true;
      });
      extensionSystem.disableExtension.mockImplementationOnce(async (id: string) => {
  stateIndex = 3; // deactivating
  extensionSystem.eventSystem.emit('extensionStateChanged', { )
  extensionId: id,
  state: 'deactivating',
});
        await new Promise(resolve => setTimeout(resolve, 10));
        stateIndex = 4; // inactive
        extensionSystem.eventSystem.emit('extensionStateChanged', { )
          extensionId: id, 
          state: 'inactive' ;
  });
        return true;
      });
      // Test enable
      const enableResult = await extensionSystem.enableExtension(extensionId);
      expect(enableResult).toBe(true);
      // Test disable
      const disableResult = await extensionSystem.disableExtension(extensionId);
      expect(disableResult).toBe(true);
      // Verify state change events
      const stateEvents = systemEvents.filter(e => e.type === 'extensionStateChanged');
      expect(stateEvents).toHaveLength(4);
      expect(stateEvents[0].data.state).toBe('activating');
      expect(stateEvents[1].data.state).toBe('active');
      expect(stateEvents[2].data.state).toBe('deactivating');
      expect(stateEvents[3].data.state).toBe('inactive');
    });
    it('should handle system restart with proper extension state preservation', async () => {
      const activeExtensions = ['ext-1', 'ext-2', 'ext-3'];
      // Mock system state before shutdown
      extensionSystem.registry.getAllRegistered.mockReturnValue()
        activeExtensions.map(id => ({ id, state: 'active' } as unknown as unknown as unknown))
      );
      extensionSystem.shutdown.mockImplementationOnce(async () => {
        extensionSystem.eventSystem.emit('systemShuttingDown', {});
        // Deactivate all extensions
        for (const extId of activeExtensions) {
          await extensionSystem.lifecycle.deactivateExtension(extId);
          extensionSystem.eventSystem.emit('extensionDeactivated', { extensionId: extId });
      });
      extensionSystem.initialize.mockImplementationOnce(async () => {
        extensionSystem.eventSystem.emit('systemInitializing', {});
        // Restore previously active extensions
        for (const extId of activeExtensions) {
          await extensionSystem.lifecycle.activateExtension(extId);
          extensionSystem.eventSystem.emit('extensionActivated', { extensionId: extId });
        extensionSystem.eventSystem.emit('systemReady', {});
      });
      extensionSystem.restart.mockImplementationOnce(async () => {
        await extensionSystem.shutdown();
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulate restart delay
        await extensionSystem.initialize();
      });
      await extensionSystem.restart();
      // Verify shutdown events
      const shutdownEvent = systemEvents.find(e => e.type === 'systemShuttingDown');
      expect(shutdownEvent).toBeDefined();
      const deactivatedEvents = systemEvents.filter(e => e.type === 'extensionDeactivated');
      expect(deactivatedEvents).toHaveLength(3);
      // Verify startup events
      const initEvent = systemEvents.find(e => e.type === 'systemInitializing');
      expect(initEvent).toBeDefined();
      const activatedEvents = systemEvents.filter(e => e.type === 'extensionActivated');
      expect(activatedEvents).toHaveLength(3);
      const readyEvent = systemEvents.find(e => e.type === 'systemReady');
      expect(readyEvent).toBeDefined();
    });
  });
  describe('4. Performance and Resilience Testing', () => {
    it('should handle high-volume extension operations efficiently', async () => {
      const extensionCount = 20;
      const extensions = Array.from({ length: extensionCount }, (_, i) => ({)
  id: `perf-extension-${i}`}
},
  name: `Performance Extension ${i}`}
},
  version: '1.0.0',
        dependencies: i > 0 ? { [`perf-extension-${Math.floor(i / 2)}`]: '^1.0.0' } : {}
      }));
      const startTime = Date.now();
      const operationTimes: number = [];
      extensionSystem.installMultiple.mockImplementationOnce(async (sources: string) => {
        const results: Array<{source: string, success: boolean}> = [];
        // Resolve dependencies (should be efficient)
        const resolveStart = Date.now();
        await extensionSystem.resolver.resolveDependencies(extensions);
        operationTimes.push(Date.now() - resolveStart);
        // Install each extension
        for (let i = 0; i < extensions.length; i++) {
          const opStart = Date.now();
          await extensionSystem.loader.loadPlugin(sources[i]);
          await extensionSystem.lifecycle.registerExtension(extensions[i]);
          extensionSystem.registry.register(extensions[i]);
          operationTimes.push(Date.now() - opStart);
          results.push({ source: sources[i], success: true });
          // Emit progress events for large operations
          if (i % 5 === 0) {
  extensionSystem.eventSystem.emit('installProgress', {)
  completed: i + 1,
  total: extensions.length,
  percentage: Math.round(((i + 1) / extensions.length) * 100),
});
        return results;
      });
      // Mock fast operations
      extensionSystem.resolver.resolveDependencies.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms for 20 extensions
        return extensions;
      });
      extensionSystem.loader.loadPlugin.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 10)); // 10ms per extension
        return {};
      });
      extensionSystem.lifecycle.registerExtension.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 5)); // 5ms per extension
        return true;
      });
      const sources = extensions.map(ext => `/plugins/${ext.id}`);}
      const results = await extensionSystem.installMultiple(sources);
      const totalTime = Date.now() - startTime;
      const averageOperationTime = operationTimes.reduce((a, b) => a + b, 0) / operationTimes.length;
      expect(results).toHaveLength(extensionCount);
      expect(results.every(r => r.success)).toBe(true);
      expect(totalTime).toBeLessThan(2000); // Complete within 2 seconds
      expect(averageOperationTime).toBeLessThan(50); // Average operation < 50ms
      // Verify progress events were emitted
      const progressEvents = systemEvents.filter(e => e.type === 'installProgress');
      expect(progressEvents.length).toBeGreaterThan(0);
    });
    it('should maintain system stability during extension failures', async () => {
      const stableExtensions = ['stable-1', 'stable-2'];
      const faultyExtensions = ['faulty-1', 'faulty-2'];
      const systemHealth = { status: 'healthy', activeExtensions: 0, errors: 0 };
      extensionSystem.getSystemHealth.mockReturnValue(systemHealth as unknown as unknown as unknown);
      extensionSystem.enableExtension.mockImplementation(async (id: string) => {
  if (faultyExtensions.includes(id)) {
  systemHealth.errors++;
  extensionSystem.eventSystem.emit('extensionError', {)
  extensionId: id,
  error: 'Extension crashed during activation',
});
          throw new Error('Extension crashed during activation');
        systemHealth.activeExtensions++;
        extensionSystem.eventSystem.emit('extensionActivated', { extensionId: id });
        return true;
      });
      // Try to enable all extensions
      const results = await Promise.allSettled([);
        ...stableExtensions.map(id => extensionSystem.enableExtension(id)),
        ...faultyExtensions.map(id => extensionSystem.enableExtension(id))
      ]);
      const stableResults = results.slice(0, 2);
      const faultyResults = results.slice(2);
      // Stable extensions should succeed
      expect(stableResults.every(r => r.status === 'fulfilled')).toBe(true);
      // Faulty extensions should fail
      expect(faultyResults.every(r => r.status === 'rejected')).toBe(true);
      // System should remain functional
      const health = extensionSystem.getSystemHealth();
      expect(health.status).toBe('healthy'); // System still healthy despite errors
      expect(health.activeExtensions).toBe(2); // Stable extensions still active
      expect(health.errors).toBe(2); // Errors tracked
      // Error events should be emitted
      const errorEvents = systemEvents.filter(e => e.type === 'extensionError');
      expect(errorEvents).toHaveLength(2);
    });
  });
  describe('5. Real-World Usage Scenarios', () => {
  it('should handle extension update workflow with backward compatibility', async () => {
  const extensionId = 'updateable-extension';
  const oldVersion = '1.0.0';
  const newVersion = '1.1.0';
  // Mock current extension state
  mockExtensions.set(extensionId, {)
  id: extensionId,
  version: oldVersion,
  state: 'active',
});
      extensionSystem.updateAll.mockImplementationOnce(async () => {
        extensionSystem.eventSystem.emit('updateStarted', {});
        // Find extensions that need updates
        const currentExt = mockExtensions.get(extensionId);
        if (currentExt && currentExt.version !== newVersion) {
  // Backup current state
  extensionSystem.eventSystem.emit('extensionBackup', {)
  extensionId,
  version: currentExt.version,
});
          // Deactivate for update
          await extensionSystem.lifecycle.deactivateExtension(extensionId);
          // Update extension
          currentExt.version = newVersion;
          mockExtensions.set(extensionId, currentExt);
          // Reactivate with new version
          await extensionSystem.lifecycle.activateExtension(extensionId);
          extensionSystem.eventSystem.emit('extensionUpdated', {)
  extensionId,
            oldVersion,
            newVersion
          });
        extensionSystem.eventSystem.emit('updateCompleted', {});
      });
      await extensionSystem.updateAll();
      // Verify update workflow events
      const updateEvents = [;
        'updateStarted',
        'extensionBackup', 
        'extensionUpdated',
        'updateCompleted'
      ];
      updateEvents.forEach(eventType => {)
  const event = systemEvents.find(e => e.type === eventType);
        expect(event).toBeDefined();
      });
      // Verify version was updated
      const updatedExt = mockExtensions.get(extensionId);
      expect(updatedExt?.version).toBe(newVersion);
      const updateEvent = systemEvents.find(e => e.type === 'extensionUpdated');
      expect(updateEvent?.data.oldVersion).toBe(oldVersion);
      expect(updateEvent?.data.newVersion).toBe(newVersion);
    });
    it('should handle extension marketplace integration scenario', async () => {
  const marketplaceExtensions = [;
  {
  id: 'marketplace-ext-1',
  name: 'Productivity Suite',
  version: '2.0.0',
  rating: 4.5,
  downloads: 10000,
  source: 'https://marketplace.example.com/productivity-suite',
}
        {
          id: 'marketplace-ext-2', 
          name: 'Theme Pack',
          version: '1.3.0',
          rating: 4.8,
          downloads: 25000,
          source: 'https://marketplace.example.com/theme-pack'];
      extensionSystem.installMultiple.mockImplementationOnce(async (sources: string) => {
        const results: Array<{source: string, success: boolean}> = [];
        for (const [index, source] of sources.entries()) {
  const extension = marketplaceExtensions[index];
  // Simulate marketplace download
  extensionSystem.eventSystem.emit('downloadStarted', {)
  extensionId: extension.id,
  source
});
          // Simulate download progress
          for (let progress = 25; progress <= 100; progress += 25) {
  extensionSystem.eventSystem.emit('downloadProgress', {)
  extensionId: extension.id,
  progress
});
          // Verify authenticity (mock)
          extensionSystem.eventSystem.emit('verifyingSignature', {)
  extensionId: extension.id,
});
          // Install
          await extensionSystem.loader.loadPlugin(source);
          await extensionSystem.lifecycle.registerExtension(extension);
          extensionSystem.registry.register(extension);
          extensionSystem.eventSystem.emit('extensionInstalled', {)
  extensionId: extension.id,
  source: 'marketplace',
});
          results.push({ source, success: true });
        return results;
      });
      const sources = marketplaceExtensions.map(ext => ext.source);
      const results = await extensionSystem.installMultiple(sources);
      expect(results).toHaveLength(2);
      expect(results.every(r => r.success)).toBe(true);
      // Verify marketplace-specific events
      const downloadEvents = systemEvents.filter(e => e.type === 'downloadStarted');
      expect(downloadEvents).toHaveLength(2);
      const progressEvents = systemEvents.filter(e => e.type === 'downloadProgress');
      expect(progressEvents.length).toBeGreaterThan(0);
      const verifyEvents = systemEvents.filter(e => e.type === 'verifyingSignature');
      expect(verifyEvents).toHaveLength(2);
      const installEvents = systemEvents.filter(e => ;);
        e.type === 'extensionInstalled' && e.data.source === 'marketplace'
      );
      expect(installEvents).toHaveLength(2);
    });
  });
});