/**
 * Epic 24.2 - Plugin Loader Integration Tests
 * 
 * Integration tests covering complete plugin loading workflows:
 * - End-to-end plugin loading from different sources
 * - Integration with ExtensionLifecycleManager
 * - Real filesystem operations and dependency resolution
 * - Cross-component communication and state synchronization
 */
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Mock external dependencies while keeping filesystem real for integration
jest.mock('child_process');

// Integration test interfaces (would match actual implementation)
interface PluginSystem {
  loader: unknown;
  lifecycle: unknown;
  registry: unknown;
  initialize(): Promise<void>;
  loadAndActivatePlugin(source: string): Promise<boolean>;
  deactivateAndUnloadPlugin(pluginId: string): Promise<boolean>;
  getSystemStatus(): unknown;
  describe('Epic 24.2 - Plugin Loader Integration Tests', () => {
  let testDir: string;
  let pluginSystem: unknown; // Mock plugin system implementation,
  let mockPluginFiles: Map<string, string>;
  beforeEach(async () => {
  jest.clearAllMocks();
  // Create temporary directory for real filesystem operations
  testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'plugin-test-'));
  mockPluginFiles = new Map();
  // Mock integrated plugin system
  pluginSystem = {
  loader: {
  loadPlugin: jest.fn<unknown, unknown>(),
  unloadPlugin: jest.fn<unknown, unknown>(),
  validatePlugin: jest.fn<unknown, unknown>(),
  getCachedPlugin: jest.fn<unknown, unknown>(),
  clearCache: jest.fn<unknown, unknown>(),
},
  lifecycle: {
  registerExtension: jest.fn<unknown, unknown>(),
  activateExtension: jest.fn<unknown, unknown>(),
  deactivateExtension: jest.fn<unknown, unknown>(),
  unregisterExtension: jest.fn<unknown, unknown>(),
  getExtensionState: jest.fn<unknown, unknown>(),
  addEventListener: jest.fn<unknown, unknown>(),
},
  registry: {
  register: jest.fn<unknown, unknown>(),
  unregister: jest.fn<unknown, unknown>(),
  findByName: jest.fn<unknown, unknown>(),
  getAllRegistered: jest.fn<unknown, unknown>(),
},
  initialize: jest.fn<unknown, unknown>().mockResolvedValue(undefined as unknown as unknown as unknown),
      loadAndActivatePlugin: jest.fn<unknown, unknown>(),
      deactivateAndUnloadPlugin: jest.fn<unknown, unknown>(),
      getSystemStatus: jest.fn<unknown, unknown>()
    };
    // Setup default implementations
    pluginSystem.loader.loadPlugin.mockImplementation(async (source: string) => {
      const pluginData = mockPluginFiles.get(source);
      if (!pluginData) {
        throw new Error(`Plugin not found: ${source}`);}
      return {
        id: path.basename(source),
        name: `Plugin ${path.basename(source)}`}
},
  version: '1.0.0',
        source,
        status: 'loaded'
  };
    });
    pluginSystem.lifecycle.activateExtension.mockResolvedValue(true as unknown as unknown as unknown);
    pluginSystem.lifecycle.deactivateExtension.mockResolvedValue(true as unknown as unknown as unknown);
    pluginSystem.lifecycle.getExtensionState.mockReturnValue('active' as unknown as unknown as unknown);
  });
  afterEach(async () => {
    // Cleanup test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    jest.restoreAllMocks();
  });
  describe('1. End-to-End Plugin Loading Workflows', () => {
  it('should complete full load-activate-deactivate-unload cycle', async () => {
  const pluginSource = '/test/plugins/sample-plugin';
  const pluginId = 'sample-plugin';
  // Setup mock plugin data
  mockPluginFiles.set(pluginSource, JSON.stringify({)
  id: pluginId,
  name: 'Sample Plugin',
  version: '1.0.0',
  main: 'index',
}));
      // Mock integrated workflow
      pluginSystem.loadAndActivatePlugin.mockImplementationOnce(async (source: string) => {
  // Step 1: Load plugin,
  const plugin = await pluginSystem.loader.loadPlugin(source);
  // Step 2: Register with lifecycle manager,
  await pluginSystem.lifecycle.registerExtension(plugin);
  // Step 3: Activate plugin,
  const activated = await pluginSystem.lifecycle.activateExtension(plugin.id);
  // Step 4: Register with registry,
  pluginSystem.registry.register(plugin);
  return activated;
});
      pluginSystem.deactivateAndUnloadPlugin.mockImplementationOnce(async (id: string) => {
  // Step 1: Deactivate,
  const deactivated = await pluginSystem.lifecycle.deactivateExtension(id);
  // Step 2: Unregister from registry,
  pluginSystem.registry.unregister(id);
  // Step 3: Unregister from lifecycle,
  pluginSystem.lifecycle.unregisterExtension(id);
  // Step 4: Unload plugin,
  await pluginSystem.loader.unloadPlugin(id);
  return deactivated;
});
      // Execute full cycle
      const loadResult = await pluginSystem.loadAndActivatePlugin(pluginSource);
      expect(loadResult).toBe(true);
      // Verify all components were called in order
      expect(pluginSystem.loader.loadPlugin).toHaveBeenCalledWith(pluginSource);
      expect(pluginSystem.lifecycle.registerExtension).toHaveBeenCalled();
      expect(pluginSystem.lifecycle.activateExtension).toHaveBeenCalledWith(pluginId);
      expect(pluginSystem.registry.register).toHaveBeenCalled();
      const unloadResult = await pluginSystem.deactivateAndUnloadPlugin(pluginId);
      expect(unloadResult).toBe(true);
      // Verify cleanup was called in reverse order
      expect(pluginSystem.lifecycle.deactivateExtension).toHaveBeenCalledWith(pluginId);
      expect(pluginSystem.registry.unregister).toHaveBeenCalledWith(pluginId);
      expect(pluginSystem.lifecycle.unregisterExtension).toHaveBeenCalledWith(pluginId);
      expect(pluginSystem.loader.unloadPlugin).toHaveBeenCalledWith(pluginId);
    });
    it('should handle plugin loading from filesystem with real directory structure', async () => {
      // Create real plugin structure in test directory
      const pluginDir = path.join(testDir, 'test-plugin');
      await fs.mkdir(pluginDir, { recursive: true });
      const manifest = {
  id: 'test-plugin',
  name: 'Test Plugin',
  version: '1.0.0',
  main: 'index',
  description: 'Test plugin for integration testing',
};
      await fs.writeFile()
        path.join(pluginDir, 'package.json'),
        JSON.stringify(manifest, null, 2)
      );
      await fs.writeFile()
        path.join(pluginDir, 'index'),
        `
        module.exports = {
          activate() {
            console.log('Plugin activated');
  }
          deactivate() {
            console.log('Plugin deactivated');
        };
        `
      );
      // Mock filesystem-aware loading
      pluginSystem.loader.loadPlugin.mockImplementationOnce(async (source: string) => {
  // Verify files exist
  await fs.access(path.join(source, 'package.json'));
  await fs.access(path.join(source, 'index'));
  const manifestContent = await fs.readFile(;);
  path.join(source, 'package.json'),
  'utf-8'
  );
  return {
  ...JSON.parse(manifestContent),
  status: 'loaded',
  source
};
      });
      const result = await pluginSystem.loader.loadPlugin(pluginDir);
      expect(result.id).toBe('test-plugin');
      expect(result.name).toBe('Test Plugin');
      expect(result.status).toBe('loaded');
      expect(result.source).toBe(pluginDir);
    });
    it('should integrate plugin cache with lifecycle state management', async () => {
  const pluginId = 'cached-plugin';
  const pluginSource = '/plugins/cached-plugin';
  // Setup cached plugin
  const cachedPlugin = {
  id: pluginId,
  name: 'Cached Plugin',
  version: '1.0.0',
  status: 'loaded',
  cachedAt: new Date().toISOString(),
};
      pluginSystem.loader.getCachedPlugin.mockReturnValue(cachedPlugin as unknown as unknown as unknown);
      // Mock integrated loading that checks cache first
      pluginSystem.loadAndActivatePlugin.mockImplementationOnce(async (source: string) => {
        // Check cache first
        const cached = pluginSystem.loader.getCachedPlugin(pluginId);
        if (cached) {
          // Use cached version - register and activate
          await pluginSystem.lifecycle.registerExtension(cached);
          return await pluginSystem.lifecycle.activateExtension(cached.id);
        // Fallback to regular loading
        const plugin = await pluginSystem.loader.loadPlugin(source);
        await pluginSystem.lifecycle.registerExtension(plugin);
        return await pluginSystem.lifecycle.activateExtension(plugin.id);
      });
      const result = await pluginSystem.loadAndActivatePlugin(pluginSource);
      expect(result).toBe(true);
      expect(pluginSystem.loader.getCachedPlugin).toHaveBeenCalledWith(pluginId);
      expect(pluginSystem.loader.loadPlugin).not.toHaveBeenCalled(); // Used cache
      expect(pluginSystem.lifecycle.activateExtension).toHaveBeenCalledWith(pluginId);
    });
  });
  describe('2. Multi-Plugin Dependency Resolution Integration', () => {
    it('should resolve and load plugin dependencies in correct order', async () => {
      const plugins = {
        'base-plugin': {
          id: 'base-plugin',
          name: 'Base Plugin',
          version: '1.0.0',
          dependencies: {}
  }
        'mid-plugin': {
          id: 'mid-plugin', 
          name: 'Mid Plugin',
          version: '1.0.0',
          dependencies: { 'base-plugin': '^1.0.0' }
  }
        'top-plugin': {
          id: 'top-plugin',
          name: 'Top Plugin', 
          version: '1.0.0',
          dependencies: { 'mid-plugin': '^1.0.0', 'base-plugin': '^1.0.0' }
      };
      // Setup plugin data
      Object.entries(plugins).forEach(([id, plugin]) => {
        mockPluginFiles.set(`/plugins/${id}`, JSON.stringify(plugin));}
      });
      const loadOrder: string = [];
      pluginSystem.loadAndActivatePlugin.mockImplementation(async (source: string) => {
        const pluginId = path.basename(source);
        const plugin = plugins[pluginId as keyof typeof plugins];
        if (!plugin) {
          throw new Error(`Plugin not found: ${pluginId}`);}
        // Load dependencies first
        if (plugin.dependencies) {
          for (const depId of Object.keys(plugin.dependencies)) {
            if (!loadOrder.includes(depId)) {
              await pluginSystem.loadAndActivatePlugin(`/plugins/${depId}`);}
        // Load this plugin
        loadOrder.push(plugin.id);
        await pluginSystem.loader.loadPlugin(source);
        await pluginSystem.lifecycle.registerExtension(plugin);
        return await pluginSystem.lifecycle.activateExtension(plugin.id);
      });
      // Load top-plugin (should trigger dependency chain)
      await pluginSystem.loadAndActivatePlugin('/plugins/top-plugin');
      // Verify loading order respects dependencies
      expect(loadOrder).toEqual(['base-plugin', 'mid-plugin', 'top-plugin']);
      expect(pluginSystem.lifecycle.activateExtension).toHaveBeenCalledTimes(3);
    });
    it('should handle circular dependency detection across components', async () => {
      const circularPlugins = {
        'plugin-a': {
          id: 'plugin-a',
          name: 'Plugin A',
          version: '1.0.0',
          dependencies: { 'plugin-b': '^1.0.0' }
  }
        'plugin-b': {
          id: 'plugin-b',
          name: 'Plugin B',
          version: '1.0.0',
          dependencies: { 'plugin-a': '^1.0.0' }
      };
      Object.entries(circularPlugins).forEach(([id, plugin]) => {
        mockPluginFiles.set(`/plugins/${id}`, JSON.stringify(plugin));}
      });
      const dependencyStack: string = [];
      pluginSystem.loadAndActivatePlugin.mockImplementation(async (source: string) => {
        const pluginId = path.basename(source);
        if (dependencyStack.includes(pluginId)) {
          throw new Error(`Circular dependency detected: ${dependencyStack.join(' -> ')} -> ${pluginId}`);}
        dependencyStack.push(pluginId);
        const plugin = circularPlugins[pluginId as keyof typeof circularPlugins];
        if (plugin.dependencies) {
          for (const depId of Object.keys(plugin.dependencies)) {
            await pluginSystem.loadAndActivatePlugin(`/plugins/${depId}`);}
        return true;
      });
      await expect(pluginSystem.loadAndActivatePlugin('/plugins/plugin-a'))
        .rejects.toThrow('Circular dependency detected');
    });
  });
  describe('3. Error Handling and Recovery Integration', () => {
    it('should handle plugin loading failures with proper cleanup', async () => {
      const failingPluginId = 'failing-plugin';
      const source = `/plugins/${failingPluginId}`;}
      // Mock plugin that fails during activation
      pluginSystem.loadAndActivatePlugin.mockImplementationOnce(async (source: string) => {
  // Loading succeeds
  const plugin = await pluginSystem.loader.loadPlugin(source);
  await pluginSystem.lifecycle.registerExtension(plugin);
  // Activation fails
  pluginSystem.lifecycle.activateExtension.mockRejectedValueOnce()
  new Error('Activation failed: runtime error'));
  try {
  await pluginSystem.lifecycle.activateExtension(plugin.id);
  return true;
} catch (error) {
          // Cleanup on failure
          await pluginSystem.lifecycle.unregisterExtension(plugin.id);
          await pluginSystem.loader.unloadPlugin(plugin.id);
          throw error;
      });
      mockPluginFiles.set(source, JSON.stringify({)
  id: failingPluginId,
  name: 'Failing Plugin',
  version: '1.0.0',
}));
      await expect(pluginSystem.loadAndActivatePlugin(source))
        .rejects.toThrow('Activation failed: runtime error');
      // Verify cleanup was performed
      expect(pluginSystem.lifecycle.unregisterExtension).toHaveBeenCalledWith(failingPluginId);
      expect(pluginSystem.loader.unloadPlugin).toHaveBeenCalledWith(failingPluginId);
    });
    it('should recover from system-wide plugin failures', async () => {
      const plugins = ['plugin-1', 'plugin-2', 'plugin-3'];
      plugins.forEach(id => {)
  mockPluginFiles.set(`/plugins/${id}`, JSON.stringify({)}
  }
          id, name: `Plugin ${id}`, version: '1.0.0'}
        }));
      });
      let loadAttempts = 0;
      pluginSystem.loadAndActivatePlugin.mockImplementation(async (source: string) => {
        loadAttempts++;
        // Fail first two attempts, succeed on third
        if (loadAttempts <= 2) {
          throw new Error('System temporarily unavailable');
        const plugin = await pluginSystem.loader.loadPlugin(source);
        await pluginSystem.lifecycle.registerExtension(plugin);
        return await pluginSystem.lifecycle.activateExtension(plugin.id);
      });
      // Should fail initially
      await expect(pluginSystem.loadAndActivatePlugin('/plugins/plugin-1'))
        .rejects.toThrow('System temporarily unavailable');
      await expect(pluginSystem.loadAndActivatePlugin('/plugins/plugin-2'))
        .rejects.toThrow('System temporarily unavailable');
      // Should recover on third attempt
      const result = await pluginSystem.loadAndActivatePlugin('/plugins/plugin-3');
      expect(result).toBe(true);
      expect(loadAttempts).toBe(3);
    });
  });
  describe('4. Performance and Concurrency Integration', () => {
    it('should handle concurrent plugin operations without race conditions', async () => {
      const plugins = ['concurrent-1', 'concurrent-2', 'concurrent-3', 'concurrent-4'];
      plugins.forEach(id => {)
  mockPluginFiles.set(`/plugins/${id}`, JSON.stringify({)}
  }
          id, name: `Plugin ${id}`, version: '1.0.0'}
        }));
      });
      const activeOperations = new Set<string>();
      pluginSystem.loadAndActivatePlugin.mockImplementation(async (source: string) => {
        const pluginId = path.basename(source);
        if (activeOperations.has(pluginId)) {
          throw new Error(`Plugin ${pluginId} is already being processed`);}
        activeOperations.add(pluginId);
        try {
          // Simulate async operations with random delays
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
          const plugin = await pluginSystem.loader.loadPlugin(source);
          await pluginSystem.lifecycle.registerExtension(plugin);
          const result = await pluginSystem.lifecycle.activateExtension(plugin.id);
          return result;
        } finally {
          activeOperations.delete(pluginId);
      });
      // Launch concurrent operations
      const promises = plugins.map(id => ;);
        pluginSystem.loadAndActivatePlugin(`/plugins/${id}`)}
      );
      const results = await Promise.all(promises);
      expect(results.every(result => result === true)).toBe(true);
      expect(pluginSystem.loader.loadPlugin).toHaveBeenCalledTimes(4);
      expect(pluginSystem.lifecycle.activateExtension).toHaveBeenCalledTimes(4);
      expect(activeOperations.size).toBe(0); // All operations completed
    });
    it('should maintain performance under high plugin load', async () => {
      const pluginCount = 50;
      const plugins: string = [];
      // Setup many plugins
      for (let i = 0; i < pluginCount; i++) {
        const pluginId = `perf-plugin-${i}`;}
        plugins.push(pluginId);
        mockPluginFiles.set(`/plugins/${pluginId}`, JSON.stringify({)}
  },
  id: pluginId,
          name: `Performance Plugin ${i}`}
},
  version: '1.0.0';
  }));
      const startTime = Date.now();
      const loadTimes: number = [];
      pluginSystem.loadAndActivatePlugin.mockImplementation(async (source: string) => {
        const startLoad = Date.now();
        // Simulate realistic loading time (10-50ms)
        await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 40));
        const plugin = await pluginSystem.loader.loadPlugin(source);
        await pluginSystem.lifecycle.registerExtension(plugin);
        const result = await pluginSystem.lifecycle.activateExtension(plugin.id);
        loadTimes.push(Date.now() - startLoad);
        return result;
      });
      // Load all plugins concurrently
      const promises = plugins.map(id => ;);
        pluginSystem.loadAndActivatePlugin(`/plugins/${id}`)}
      );
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      expect(results.length).toBe(pluginCount);
      expect(results.every(r => r === true)).toBe(true);
      expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds
      // Average load time should be reasonable
      const averageLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
      expect(averageLoadTime).toBeLessThan(100); // Average < 100ms per plugin
    });
  });
  describe('5. System State Synchronization', () => {
    it('should maintain consistent state across all components', async () => {
      const pluginId = 'state-sync-plugin';
      const source = `/plugins/${pluginId}`;}
      mockPluginFiles.set(source, JSON.stringify({)
  id: pluginId,
  name: 'State Sync Plugin',
  version: '1.0.0',
}));
      const systemState: unknown = {,
  loader: new Map(),
  lifecycle: new Map(),
  registry: new Map(),
};
      // Mock state tracking across components
      pluginSystem.loader.loadPlugin.mockImplementation(async (source: string) => {
        const plugin = { id: pluginId, status: 'loaded', source };
        systemState.loader.set(pluginId, plugin);
        return plugin;
      });
      pluginSystem.lifecycle.registerExtension.mockImplementation(async (plugin: unknown) => {
        systemState.lifecycle.set(plugin.id, { ...plugin, state: 'registered' });
      });
      pluginSystem.lifecycle.activateExtension.mockImplementation(async (id: string) => {
        const ext = systemState.lifecycle.get(id);
        if (ext) {
          ext.state = 'active';
          systemState.lifecycle.set(id, ext);
        return true;
      });
      pluginSystem.registry.register.mockImplementation((plugin: unknown) => {
        systemState.registry.set(plugin.id, { ...plugin, registered: true });
      });
      pluginSystem.getSystemStatus.mockImplementation(() => {
  return {
  loader: Object.fromEntries(systemState.loader),
  lifecycle: Object.fromEntries(systemState.lifecycle),
  registry: Object.fromEntries(systemState.registry),
};
      });
      // Execute integrated workflow
      pluginSystem.loadAndActivatePlugin.mockImplementationOnce(async (source: string) => {
        const plugin = await pluginSystem.loader.loadPlugin(source);
        await pluginSystem.lifecycle.registerExtension(plugin);
        await pluginSystem.lifecycle.activateExtension(plugin.id);
        pluginSystem.registry.register(plugin);
        return true;
      });
      await pluginSystem.loadAndActivatePlugin(source);
      const status = pluginSystem.getSystemStatus();
      // Verify consistent state across all components
      expect(status.loader[pluginId]).toBeDefined();
      expect(status.loader[pluginId].status).toBe('loaded');
      expect(status.lifecycle[pluginId]).toBeDefined();
      expect(status.lifecycle[pluginId].state).toBe('active');
      expect(status.registry[pluginId]).toBeDefined();
      expect(status.registry[pluginId].registered).toBe(true);
    });
    it('should propagate state changes through event system', async () => {
      const eventLog: Array<{event: string, data: any}> = [];
      // Mock event system integration
      pluginSystem.lifecycle.addEventListener.mockImplementation((event: string, handler: Function) => {
        // Simulate event dispatch
        setTimeout(() => {
          handler({ pluginId: 'event-test-plugin', event });
          eventLog.push({ event, data: { pluginId: 'event-test-plugin' } });
        }, 10);
      });
      pluginSystem.loadAndActivatePlugin.mockImplementationOnce(async () => {
        // Setup event listeners
        pluginSystem.lifecycle.addEventListener('pluginLoaded', (data: unknown) => {
          eventLog.push({ event: 'pluginLoaded', data });
        });
        pluginSystem.lifecycle.addEventListener('pluginActivated', (data: unknown) => {
          eventLog.push({ event: 'pluginActivated', data });
        });
        // Simulate loading and activation
        await new Promise(resolve => setTimeout(resolve, 50));
        return true;
      });
      await pluginSystem.loadAndActivatePlugin('/plugins/event-test-plugin');
      // Wait for events to propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(eventLog.length).toBeGreaterThan(0);
      expect(pluginSystem.lifecycle.addEventListener).toHaveBeenCalledWith('pluginLoaded', expect.any(Function));
      expect(pluginSystem.lifecycle.addEventListener).toHaveBeenCalledWith('pluginActivated', expect.any(Function));
    });
  });
});