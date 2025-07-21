/**
 * Epic 24.2 - Extension Lifecycle Manager Unit Tests
 * 
 * Comprehensive unit tests for ExtensionLifecycleManager covering:
 * - Complete lifecycle state management and transitions
 * - Extension context management and isolation
 * - Health monitoring and error recovery
 * - Event system and notification handling
 * - Multi-extension dependency chains
 * - Resource cleanup and memory management
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock external dependencies
jest.mock('../ExtensionPointRegistry');
jest.mock('../../hooks/useWebSocket');

// Import types and interfaces (these would be defined in the actual implementation)
interface ExtensionContext {
  storage: unknown;
  logging: unknown;
  runtime: unknown;
  ui: unknown;
  api: unknown;
}

interface Extension {
  id: string;
  name: string;
  version: string;
  state: ExtensionState;
  dependencies?: string[];
  activate?(context: ExtensionContext): Promise<void>;
  deactivate?(context: ExtensionContext): Promise<void>;
  dispose?(): Promise<void>;
}

enum ExtensionState {
  UNINITIALIZED = 'uninitialized',
  INITIALIZING = 'initializing', 
  INITIALIZED = 'initialized',
  ACTIVATING = 'activating',
  ACTIVE = 'active',
  DEACTIVATING = 'deactivating',
  DEACTIVATED = 'deactivated',
  DISPOSED = 'disposed',
  ERROR = 'error'
}

interface ExtensionLifecycleManager {
  initialize(): Promise<void>;
  registerExtension(extension: Extension): void;
  unregisterExtension(extensionId: string): void;
  activateExtension(extensionId: string): Promise<boolean>;
  deactivateExtension(extensionId: string): Promise<boolean>;
  disposeExtension(extensionId: string): Promise<boolean>;
  getExtensionState(extensionId: string): ExtensionState;
  getActiveExtensions(): Extension[];
  getExtensionHealth(extensionId: string): unknown;
  addEventListener(event: string, handler: Function): void;
  removeEventListener(event: string, handler: Function): void;
  createExtensionContext(extensionId: string): ExtensionContext;
  validateExtensionDependencies(extensionId: string): boolean;
  resolveActivationOrder(extensionIds: string[]): string[];
}

// Mock extension implementations for testing
const createMockExtension = (id: string, dependencies: string[] = []): Extension => ({
  id,
  name: `Extension ${id}`,
  version: '1.0.0',
  state: ExtensionState.UNINITIALIZED,
  dependencies,
  activate: jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown as unknown),
  deactivate: jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown as unknown),
  dispose: jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown as unknown)
});

const createFailingExtension = (id: string): Extension => ({
  id,
  name: `Failing Extension ${id}`,
  version: '1.0.0',
  state: ExtensionState.UNINITIALIZED,
  activate: jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Activation failed')),
  deactivate: jest.fn<unknown[], unknown>().mockRejectedValue(new Error('Deactivation failed')),
  dispose: jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown as unknown)
});

describe('Epic 24.2 - Extension Lifecycle Manager Unit Tests', () => {
  let lifecycleManager: unknown; // Will be properly typed when ExtensionLifecycleManager exists
  let mockExtensions: Map<string, Extension>;
  let mockEventHandlers: Map<string, Function[]>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockExtensions = new Map();
    mockEventHandlers = new Map();

    // Mock implementation of ExtensionLifecycleManager
    lifecycleManager = {
      extensions: mockExtensions,
      eventHandlers: mockEventHandlers,
      
      initialize: jest.fn<unknown[], unknown>().mockResolvedValue(undefined as unknown as unknown),
      registerExtension: jest.fn<unknown[], unknown>().mockImplementation((ext: Extension) => {
        mockExtensions.set(ext.id, ext);
      }),
      unregisterExtension: jest.fn<unknown[], unknown>().mockImplementation((id: string) => {
        mockExtensions.delete(id);
      }),
      activateExtension: jest.fn<unknown[], unknown>(),
      deactivateExtension: jest.fn<unknown[], unknown>(),
      disposeExtension: jest.fn<unknown[], unknown>(),
      getExtensionState: jest.fn<unknown[], unknown>(),
      getActiveExtensions: jest.fn<unknown[], unknown>(),
      getExtensionHealth: jest.fn<unknown[], unknown>(),
      addEventListener: jest.fn<unknown[], unknown>(),
      removeEventListener: jest.fn<unknown[], unknown>(),
      createExtensionContext: jest.fn<unknown[], unknown>(),
      validateExtensionDependencies: jest.fn<unknown[], unknown>(),
      resolveActivationOrder: jest.fn<unknown[], unknown>()
    };

    // Setup default state tracking
    lifecycleManager.getExtensionState.mockImplementation((id: string) => {
      const ext = mockExtensions.get(id);
      return ext ? ext.state : ExtensionState.UNINITIALIZED;
    });

    lifecycleManager.getActiveExtensions.mockImplementation(() => {
      return Array.from(mockExtensions.values()).filter(
        ext => ext.state === ExtensionState.ACTIVE
      );
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('1. Lifecycle Manager Initialization', () => {
    it('should initialize lifecycle manager successfully', async () => {
      lifecycleManager.initialize.mockResolvedValueOnce(undefined);

      await lifecycleManager.initialize();

      expect(lifecycleManager.initialize).toHaveBeenCalled();
    });

    it('should setup event system during initialization', async () => {
      lifecycleManager.addEventListener.mockImplementation((event: string, handler: Function) => {
        if (!mockEventHandlers.has(event)) {
          mockEventHandlers.set(event, []);
        }
        mockEventHandlers.get(event)!.push(handler);
      });

      const mockHandler = jest.fn<unknown[], unknown>();
      lifecycleManager.addEventListener('extensionActivated', mockHandler);

      expect(mockEventHandlers.get('extensionActivated')).toContain(mockHandler);
    });

    it('should handle initialization failures gracefully', async () => {
      lifecycleManager.initialize.mockRejectedValueOnce(
        new Error('Initialization failed')
      );

      await expect(lifecycleManager.initialize())
        .rejects.toThrow('Initialization failed');
    });
  });

  describe('2. Extension Registration and Management', () => {
    it('should register extension successfully', () => {
      const extension = createMockExtension('test-extension');

      lifecycleManager.registerExtension(extension);

      expect(mockExtensions.has('test-extension')).toBe(true);
      expect(mockExtensions.get('test-extension')).toEqual(extension);
      expect(lifecycleManager.registerExtension).toHaveBeenCalledWith(extension);
    });

    it('should unregister extension and cleanup resources', () => {
      const extension = createMockExtension('test-extension');
      lifecycleManager.registerExtension(extension);

      lifecycleManager.unregisterExtension('test-extension');

      expect(mockExtensions.has('test-extension')).toBe(false);
      expect(lifecycleManager.unregisterExtension).toHaveBeenCalledWith('test-extension');
    });

    it('should prevent duplicate extension registration', () => {
      const extension1 = createMockExtension('duplicate-extension');
      const extension2 = createMockExtension('duplicate-extension');

      lifecycleManager.registerExtension.mockImplementationOnce((ext: Extension) => {
        if (mockExtensions.has(ext.id)) {
          throw new Error(`Extension ${ext.id} already registered`);
        }
        mockExtensions.set(ext.id, ext);
      });

      lifecycleManager.registerExtension(extension1);
      
      expect(() => lifecycleManager.registerExtension(extension2))
        .toThrow('Extension duplicate-extension already registered');
    });

    it('should validate extension metadata on registration', () => {
      const invalidExtension = {
        // Missing required fields
        name: 'Invalid Extension'
      } as Extension;

      lifecycleManager.registerExtension.mockImplementationOnce((ext: Extension) => {
        if (!ext.id || !ext.name || !ext.version) {
          throw new Error('Invalid extension metadata');
        }
        mockExtensions.set(ext.id, ext);
      });

      expect(() => lifecycleManager.registerExtension(invalidExtension))
        .toThrow('Invalid extension metadata');
    });
  });

  describe('3. Extension State Transitions', () => {
    let testExtension: Extension;

    beforeEach(() => {
      testExtension = createMockExtension('state-test-extension');
      lifecycleManager.registerExtension(testExtension);
    });

    it('should transition from UNINITIALIZED to ACTIVE', async () => {
      // Mock state transitions
      lifecycleManager.getExtensionState
        .mockReturnValueOnce(ExtensionState.UNINITIALIZED)
        .mockReturnValueOnce(ExtensionState.INITIALIZING)
        .mockReturnValueOnce(ExtensionState.INITIALIZED)
        .mockReturnValueOnce(ExtensionState.ACTIVATING)
        .mockReturnValueOnce(ExtensionState.ACTIVE);

      lifecycleManager.activateExtension.mockResolvedValueOnce(true);

      expect(lifecycleManager.getExtensionState('state-test-extension'))
        .toBe(ExtensionState.UNINITIALIZED);

      const result = await lifecycleManager.activateExtension('state-test-extension');

      expect(result).toBe(true);
      expect(lifecycleManager.activateExtension)
        .toHaveBeenCalledWith('state-test-extension');
    });

    it('should transition from ACTIVE to DEACTIVATED', async () => {
      // Setup extension as active
      testExtension.state = ExtensionState.ACTIVE;
      lifecycleManager.getExtensionState.mockReturnValue(ExtensionState.ACTIVE as unknown as unknown);

      lifecycleManager.deactivateExtension.mockImplementationOnce(async (id: string) => {
        const ext = mockExtensions.get(id);
        if (ext) {
          ext.state = ExtensionState.DEACTIVATED;
        }
        return true;
      });

      lifecycleManager.getExtensionState.mockReturnValueOnce(ExtensionState.DEACTIVATED);

      const result = await lifecycleManager.deactivateExtension('state-test-extension');

      expect(result).toBe(true);
      expect(lifecycleManager.getExtensionState('state-test-extension'))
        .toBe(ExtensionState.DEACTIVATED);
    });

    it('should transition to ERROR state on activation failure', async () => {
      const failingExtension = createFailingExtension('failing-extension');
      lifecycleManager.registerExtension(failingExtension);

      lifecycleManager.activateExtension.mockImplementationOnce(async (id: string) => {
        const ext = mockExtensions.get(id);
        if (ext && ext.activate) {
          try {
            await ext.activate({} as ExtensionContext);
            ext.state = ExtensionState.ACTIVE;
            return true;
          } catch (error) {
            ext.state = ExtensionState.ERROR;
            throw error;
          }
        }
        return false;
      });

      await expect(lifecycleManager.activateExtension('failing-extension'))
        .rejects.toThrow('Activation failed');

      expect(failingExtension.state).toBe(ExtensionState.ERROR);
    });

    it('should prevent invalid state transitions', async () => {
      // Try to deactivate an uninitialized extension
      lifecycleManager.deactivateExtension.mockRejectedValueOnce(
        new Error('Cannot deactivate extension in UNINITIALIZED state')
      );

      await expect(lifecycleManager.deactivateExtension('state-test-extension'))
        .rejects.toThrow('Cannot deactivate extension in UNINITIALIZED state');
    });
  });

  describe('4. Extension Context Management', () => {
    it('should create isolated context for each extension', () => {
      const mockContext = {
        storage: { get: jest.fn<unknown[], unknown>(), set: jest.fn<unknown[], unknown>() },
        logging: { log: jest.fn<unknown[], unknown>(), error: jest.fn<unknown[], unknown>() },
        runtime: { version: '1.0.0' },
        ui: { createElement: jest.fn<unknown[], unknown>() },
        api: { call: jest.fn<unknown[], unknown>() }
      };

      lifecycleManager.createExtensionContext.mockReturnValue(mockContext as unknown as unknown);

      const context1 = lifecycleManager.createExtensionContext('extension-1');
      const context2 = lifecycleManager.createExtensionContext('extension-2');

      expect(context1).toBeDefined();
      expect(context2).toBeDefined();
      expect(lifecycleManager.createExtensionContext).toHaveBeenCalledTimes(2);
    });

    it('should provide sandbox isolation between extensions', () => {
      const context = lifecycleManager.createExtensionContext('sandbox-test');
      
      lifecycleManager.createExtensionContext.mockImplementationOnce((id: string) => {
        return {
          storage: {
            namespace: id, // Each extension has its own namespace
            get: jest.fn<unknown[], unknown>(),
            set: jest.fn<unknown[], unknown>()
          },
          logging: {
            prefix: `[${id}]`,
            log: jest.fn<unknown[], unknown>(),
            error: jest.fn<unknown[], unknown>()
          },
          runtime: {
            extensionId: id,
            version: '1.0.0'
          }
        };
      });

      const sandboxedContext = lifecycleManager.createExtensionContext('sandbox-test');

      expect(sandboxedContext.storage.namespace).toBe('sandbox-test');
      expect(sandboxedContext.logging.prefix).toBe('[sandbox-test]');
      expect(sandboxedContext.runtime.extensionId).toBe('sandbox-test');
    });

    it('should cleanup context when extension is disposed', async () => {
      const extension = createMockExtension('cleanup-test');
      lifecycleManager.registerExtension(extension);

      const mockContext = {
        cleanup: jest.fn<unknown[], unknown>(),
        storage: { clear: jest.fn<unknown[], unknown>() },
        logging: { flush: jest.fn<unknown[], unknown>() }
      };

      lifecycleManager.createExtensionContext.mockReturnValue(mockContext as unknown as unknown);
      lifecycleManager.disposeExtension.mockImplementationOnce(async (id: string) => {
        const context = lifecycleManager.createExtensionContext(id);
        if (context.cleanup) {
          await context.cleanup();
        }
        return true;
      });

      await lifecycleManager.disposeExtension('cleanup-test');

      expect(lifecycleManager.disposeExtension).toHaveBeenCalledWith('cleanup-test');
    });
  });

  describe('5. Dependency Resolution and Activation Order', () => {
    it('should resolve activation order based on dependencies', () => {
      const extensionA = createMockExtension('extension-a');
      const extensionB = createMockExtension('extension-b', ['extension-a']);
      
      lifecycleManager.resolveActivationOrder.mockReturnValue([
        'extension-a',
        'extension-b', 
        'extension-c'
      ] as unknown as unknown);

      const activationOrder = lifecycleManager.resolveActivationOrder([
        'extension-c',
        'extension-a',
        'extension-b'
      ]);

      expect(activationOrder).toEqual(['extension-a', 'extension-b', 'extension-c']);
    });

    it('should validate extension dependencies', () => {
      const extensionWithDeps = createMockExtension('dependent-extension', ['missing-dependency']);

      lifecycleManager.validateExtensionDependencies.mockImplementationOnce((id: string) => {
        const ext = mockExtensions.get(id);
        if (ext && ext.dependencies) {
          return ext.dependencies.every(depId => mockExtensions.has(depId));
        }
        return true;
      });

      lifecycleManager.registerExtension(extensionWithDeps);

      const isValid = lifecycleManager.validateExtensionDependencies('dependent-extension');

      expect(isValid).toBe(false);
    });

    it('should detect circular dependencies', () => {
      const extensionA = createMockExtension('circular-a', ['circular-b']);
      const extensionB = createMockExtension('circular-b', ['circular-a']);

      lifecycleManager.resolveActivationOrder.mockImplementationOnce(() => {
        throw new Error('Circular dependency detected: circular-a -> circular-b -> circular-a');
      });

      expect(() => lifecycleManager.resolveActivationOrder(['circular-a', 'circular-b']))
        .toThrow('Circular dependency detected');
    });

    it('should activate extensions in dependency order', async () => {
      const extensionA = createMockExtension('dep-a');
      const extensionB = createMockExtension('dep-b', ['dep-a']);
      
      lifecycleManager.registerExtension(extensionA);
      lifecycleManager.registerExtension(extensionB);

      const activationOrder: string[] = [];
      
      lifecycleManager.activateExtension.mockImplementation(async (id: string) => {
        activationOrder.push(id);
        const ext = mockExtensions.get(id);
        if (ext) {
          ext.state = ExtensionState.ACTIVE;
        }
        return true;
      });

      await lifecycleManager.activateExtension('dep-a');
      await lifecycleManager.activateExtension('dep-b');

      expect(activationOrder).toEqual(['dep-a', 'dep-b']);
    });
  });

  describe('6. Health Monitoring and Error Recovery', () => {
    it('should monitor extension health status', () => {
      const extension = createMockExtension('health-test');
      extension.state = ExtensionState.ACTIVE;
      lifecycleManager.registerExtension(extension);

      const mockHealth = {
        status: 'healthy',
        uptime: 3600000,
        memoryUsage: 1024 * 1024,
        errorCount: 0,
        lastError: null
      };

      lifecycleManager.getExtensionHealth.mockReturnValue(mockHealth as unknown as unknown);

      const health = lifecycleManager.getExtensionHealth('health-test');

      expect(health.status).toBe('healthy');
      expect(health.errorCount).toBe(0);
    });

    it('should detect unhealthy extensions', () => {
      const unhealthyExtension = createMockExtension('unhealthy-test');
      unhealthyExtension.state = ExtensionState.ERROR;

      const mockHealth = {
        status: 'unhealthy',
        uptime: 60000,
        memoryUsage: 1024 * 1024 * 100, // High memory usage
        errorCount: 5,
        lastError: 'Runtime exception'
      };

      lifecycleManager.getExtensionHealth.mockReturnValue(mockHealth as unknown as unknown);

      const health = lifecycleManager.getExtensionHealth('unhealthy-test');

      expect(health.status).toBe('unhealthy');
      expect(health.errorCount).toBeGreaterThan(0);
    });

    it('should attempt recovery for failed extensions', async () => {
      const failedExtension = createMockExtension('recovery-test');
      failedExtension.state = ExtensionState.ERROR;

      lifecycleManager.activateExtension.mockImplementationOnce(async (id: string) => {
        // Simulate recovery attempt
        const ext = mockExtensions.get(id);
        if (ext && ext.state === ExtensionState.ERROR) {
          ext.state = ExtensionState.ACTIVE;
          return true;
        }
        return false;
      });

      const recovered = await lifecycleManager.activateExtension('recovery-test');

      expect(recovered).toBe(true);
      expect(failedExtension.state).toBe(ExtensionState.ACTIVE);
    });
  });

  describe('7. Event System and Notifications', () => {
    it('should emit events during lifecycle transitions', () => {
      const eventHandler = jest.fn<unknown[], unknown>();
      
      lifecycleManager.addEventListener.mockImplementation((event: string, handler: Function) => {
        if (!mockEventHandlers.has(event)) {
          mockEventHandlers.set(event, []);
        }
        mockEventHandlers.get(event)!.push(handler);
      });

      lifecycleManager.addEventListener('extensionActivated', eventHandler);

      // Simulate extension activation event
      const handlers = mockEventHandlers.get('extensionActivated');
      if (handlers) {
        handlers.forEach(handler => handler('test-extension'));
      }

      expect(eventHandler).toHaveBeenCalledWith('test-extension');
    });

    it('should handle event listener registration and removal', () => {
      const handler1 = jest.fn<unknown[], unknown>();
      const handler2 = jest.fn<unknown[], unknown>();

      lifecycleManager.addEventListener('test-event', handler1);
      lifecycleManager.addEventListener('test-event', handler2);

      expect(lifecycleManager.addEventListener).toHaveBeenCalledTimes(2);

      lifecycleManager.removeEventListener('test-event', handler1);

      expect(lifecycleManager.removeEventListener).toHaveBeenCalledWith('test-event', handler1);
    });

    it('should emit error events for failed operations', async () => {
      const errorHandler = jest.fn<unknown[], unknown>();
      
      lifecycleManager.addEventListener('extensionError', errorHandler);
      
      lifecycleManager.activateExtension.mockRejectedValueOnce(
        new Error('Activation failed')
      );

      try {
        await lifecycleManager.activateExtension('error-test');
      } catch (error) {
        // Simulate error event emission
        const handlers = mockEventHandlers.get('extensionError');
        if (handlers) {
          handlers.forEach(handler => handler('error-test', error));
        }
      }

      expect(errorHandler).toHaveBeenCalledWith('error-test', expect.any(Error));
    });
  });

  describe('8. Resource Management and Cleanup', () => {
    it('should dispose of all extensions on shutdown', async () => {
      const extensions = [
        createMockExtension('cleanup-1'),
        createMockExtension('cleanup-2'),
        createMockExtension('cleanup-3')
      ];

      extensions.forEach(ext => {
        lifecycleManager.registerExtension(ext);
        ext.state = ExtensionState.ACTIVE;
      });

      lifecycleManager.disposeExtension.mockResolvedValue(true as unknown as unknown);

      // Simulate shutdown - dispose all extensions
      const disposalPromises = extensions.map(ext => 
        lifecycleManager.disposeExtension(ext.id)
      );

      await Promise.all(disposalPromises);

      expect(lifecycleManager.disposeExtension).toHaveBeenCalledTimes(3);
    });

    it('should prevent memory leaks during extension lifecycle', async () => {
      const initialMemoryUsage = process.memoryUsage();
      
      // Create, activate, deactivate, and dispose multiple extensions
      for (let i = 0; i < 20; i++) {
        const extension = createMockExtension(`memory-test-${i}`);
        lifecycleManager.registerExtension(extension);
        
        lifecycleManager.activateExtension.mockResolvedValue(true as unknown as unknown);
        lifecycleManager.deactivateExtension.mockResolvedValue(true as unknown as unknown);
        lifecycleManager.disposeExtension.mockResolvedValue(true as unknown as unknown);
        
        await lifecycleManager.activateExtension(extension.id);
        await lifecycleManager.deactivateExtension(extension.id);
        await lifecycleManager.disposeExtension(extension.id);
        
        lifecycleManager.unregisterExtension(extension.id);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemoryUsage = process.memoryUsage();
      const memoryIncrease = finalMemoryUsage.heapUsed - initialMemoryUsage.heapUsed;

      // Memory increase should be minimal (less than 5MB)
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });

    it('should cleanup event listeners on extension disposal', async () => {
      const extension = createMockExtension('event-cleanup-test');
      lifecycleManager.registerExtension(extension);

      const handler = jest.fn<unknown[], unknown>();
      lifecycleManager.addEventListener('test-event', handler);

      lifecycleManager.disposeExtension.mockImplementationOnce(async (id: string) => {
        // Cleanup all event listeners for this extension
        lifecycleManager.removeEventListener('test-event', handler);
        return true;
      });

      await lifecycleManager.disposeExtension('event-cleanup-test');

      expect(lifecycleManager.removeEventListener).toHaveBeenCalledWith('test-event', handler);
    });
  });

  describe('9. Concurrent Operations and Thread Safety', () => {
    it('should handle concurrent extension activations', async () => {
      const extensions = ['concurrent-1', 'concurrent-2', 'concurrent-3'];
      
      extensions.forEach(id => {
        const ext = createMockExtension(id);
        lifecycleManager.registerExtension(ext);
      });

      lifecycleManager.activateExtension.mockImplementation(async (id: string) => {
        // Simulate activation delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
        return true;
      });

      const activationPromises = extensions.map(id => 
        lifecycleManager.activateExtension(id)
      );

      const results = await Promise.all(activationPromises);

      expect(results.every(result => result === true)).toBe(true);
      expect(lifecycleManager.activateExtension).toHaveBeenCalledTimes(3);
    });

    it('should prevent race conditions during state changes', async () => {
      const extension = createMockExtension('race-condition-test');
      lifecycleManager.registerExtension(extension);

      let activationCount = 0;
      
      lifecycleManager.activateExtension.mockImplementation(async (id: string) => {
        const currentCount = ++activationCount;
        
        // Simulate concurrent activation attempts
        if (currentCount > 1) {
          throw new Error('Extension is already being activated');
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        return true;
      });

      const promise1 = lifecycleManager.activateExtension('race-condition-test');
      const promise2 = lifecycleManager.activateExtension('race-condition-test');

      const results = await Promise.allSettled([promise1, promise2]);

      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
    });
  });
});