/**
 * Mock Factory - Central Mock Creation and Management System
 * 
 * Provides a unified factory pattern for creating and managing all types of mocks
 * including API mocks, database mocks, service mocks, and component mocks.
 * 
 * Task: E18-1753114562158-DAD671
 */

import { EventEmitter } from 'events';
import seedrandom from 'seedrandom';

export interface MockConfig {
  seed?: number;
  deterministic?: boolean;
  enableLogging?: boolean;
  persistence?: boolean;
  baseUrl?: string;
  environment?: 'test' | 'development' | 'production';
}

export interface MockInstance {
  id: string;
  type: string;
  _config: MockConfig;
  active: boolean;
  createdAt: Date;
  lastUsed?: Date;
  callCount: number;
  data?: unknown;
}

export interface MockBehavior {
  name: string;
  condition?: (request: unknown) => boolean;
  response: unknown | ((request: unknown) => unknown);
  delay?: number;
  errorRate?: number;
  statusCode?: number;
}

export type MockType = 
  | 'api' 
  | 'database' 
  | 'service' 
  | 'component' 
  | 'filesystem' 
  | 'network' 
  | 'auth' 
  | 'analytics';

export class MockFactory extends EventEmitter {
  private mocks: Map<string, MockInstance> = new Map();
  private behaviors: Map<string, MockBehavior[]> = new Map();
  private globalConfig: MockConfig;
  private rng: seedrandom.PRNG;

  constructor(_config: MockConfig = {}) {
    super();
    this.globalConfig = {
      seed: 12345,
      deterministic: true,
      enableLogging: false,
      persistence: false,
      environment: 'test',
      ...config
    };
    
    this.rng = seedrandom(this.globalConfig.seed?.toString() || '12345');
    
    if (this.globalConfig.enableLogging) {
      console.log('🏭 Mock Factory initialized with config:', this.globalConfig);
    }
  }

  /**
   * Create a new mock instance
   */
  createMock<T>(type: MockType, id: string, config: Partial<MockConfig> = {}): T {
    const mockConfig: MockConfig = {
      ...this.globalConfig,
      ...config
    };

    const mockInstance: MockInstance = {
      id,
      type,
      config: mockConfig,
      active: true,
      createdAt: new Date(),
      callCount: 0
    };

    // Create specific mock based on type
    const mock = this.createSpecificMock<T>(type, id, mockConfig);
    
    // Store mock instance
    this.mocks.set(id, mockInstance);
    
    if (mockConfig.enableLogging) {
      console.log(`🎭 Created ${type} mock: ${id}`);
    }

    this.emit('mockCreated', { type, id, config: mockConfig });
    
    return mock;
  }

  /**
   * Get an existing mock instance
   */
  getMock<T>(id: string): T | undefined {
    const instance = this.mocks.get(id);
    if (instance && instance.active) {
      instance.lastUsed = new Date();
      instance.callCount++;
      return this.createSpecificMock<T>(instance.type as MockType, id, instance.config);
    }
    return undefined;
  }

  /**
   * Remove a mock instance
   */
  removeMock(id: string): boolean {
    const instance = this.mocks.get(id);
    if (instance) {
      instance.active = false;
      this.mocks.delete(id);
      this.behaviors.delete(id);
      
      this.emit('mockRemoved', { id, type: instance.type });
      
      if (instance.config.enableLogging) {
        console.log(`🗑️ Removed mock: ${id}`);
      }
      
      return true;
    }
    return false;
  }

  /**
   * Add behavior to a mock
   */
  addBehavior(mockId: string, behavior: MockBehavior): void {
    if (!this.behaviors.has(mockId)) {
      this.behaviors.set(mockId, []);
    }
    
    this.behaviors.get(mockId)!.push(behavior);
    
    if (this.globalConfig.enableLogging) {
      console.log(`🎯 Added behavior "${behavior.name}" to mock: ${mockId}`);
    }
  }

  /**
   * Get behaviors for a mock
   */
  getBehaviors(mockId: string): MockBehavior[] {
    return this.behaviors.get(mockId) || [];
  }

  /**
   * Execute mock behavior based on request
   */
  async executeBehavior(mockId: string, request: unknown): Promise<unknown> {
    const behaviors = this.getBehaviors(mockId);
    const instance = this.mocks.get(mockId);
    
    if (!instance) {
      throw new Error(`Mock ${mockId} not found`);
    }

    // Find matching behavior
    const behavior = behaviors.find(b => !b.condition || b.condition(request));
    
    if (!behavior) {
      throw new Error(`No matching behavior found for mock ${mockId}`);
    }

    // Simulate network delay
    if (behavior.delay && behavior.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, behavior.delay));
    }

    // Simulate random errors
    if (behavior.errorRate && this.rng() < behavior.errorRate) {
      throw new Error(`Simulated error for mock ${mockId}`);
    }

    // Update mock statistics
    instance.callCount++;
    instance.lastUsed = new Date();

    // Generate response
    let response;
    if (typeof behavior.response === 'function') {
      response = behavior.response(request);
    } else {
      response = behavior.response;
    }

    // Add status code if specified
    if (behavior.statusCode) {
      response = {
        ...response,
        statusCode: behavior.statusCode
      };
    }

    this.emit('behaviorExecuted', { mockId, behavior: behavior.name, request, response });

    return response;
  }

  /**
   * List all active mocks
   */
  listMocks(): MockInstance[] {
    return Array.from(this.mocks.values()).filter(mock => mock.active);
  }

  /**
   * Get mock statistics
   */
  getStatistics(): {
    totalMocks: number;
    activeMocks: number;
    mocksByType: Record<string, number>;
    totalCalls: number;
    averageCallsPerMock: number;
    } {
    const activeMocks = this.listMocks();
    const mocksByType: Record<string, number> = {};
    let totalCalls = 0;

    activeMocks.forEach(mock => {
      mocksByType[mock.type] = (mocksByType[mock.type] || 0) + 1;
      totalCalls += mock.callCount;
    });

    return {
      totalMocks: this.mocks.size,
      activeMocks: activeMocks.length,
      mocksByType,
      totalCalls,
      averageCallsPerMock: activeMocks.length > 0 ? totalCalls / activeMocks.length : 0
    };
  }

  /**
   * Reset all mocks to initial state
   */
  resetAll(): void {
    for (const instance of this.mocks.values()) {
      instance.callCount = 0;
      instance.lastUsed = undefined;
    }
    
    this.emit('allMocksReset');
    
    if (this.globalConfig.enableLogging) {
      console.log('🔄 All mocks reset to initial state');
    }
  }

  /**
   * Clean up all mocks
   */
  cleanup(): void {
    const mockIds = Array.from(this.mocks.keys());
    mockIds.forEach(id => this.removeMock(id));
    
    this.removeAllListeners();
    
    if (this.globalConfig.enableLogging) {
      console.log('🧹 Mock factory cleanup completed');
    }
  }

  /**
   * Create specific mock based on type
   */
  private createSpecificMock<T>(type: MockType, id: string, _config: MockConfig): T {
    switch (type) {
    case 'api':
      return this.createAPIMock(id, config) as T;
    case 'database':
      return this.createDatabaseMock(id, config) as T;
    case 'service':
      return this.createServiceMock(id, config) as T;
    case 'component':
      return this.createComponentMock(id, config) as T;
    case 'filesystem':
      return this.createFilesystemMock(id, config) as T;
    case 'network':
      return this.createNetworkMock(id, config) as T;
    case 'auth':
      return this.createAuthMock(id, config) as T;
    case 'analytics':
      return this.createAnalyticsMock(id, config) as T;
    default:
      throw new Error(`Unknown mock type: ${type}`);
    }
  }

  private createAPIMock(id: string, __config: MockConfig): unknown {
    return {
      id,
      type: 'api',
      get: async (path: string, params?: unknown) => this.executeBehavior(id, { method: 'GET', path, params }),
      post: async (path: string, data?: unknown) => this.executeBehavior(id, { method: 'POST', path, data }),
      put: async (path: string, data?: unknown) => this.executeBehavior(id, { method: 'PUT', path, data }),
      delete: async (path: string) => this.executeBehavior(id, { method: 'DELETE', path }),
      patch: async (path: string, data?: unknown) => this.executeBehavior(id, { method: 'PATCH', path, data })
    };
  }

  private createDatabaseMock(id: string, _config: MockConfig): unknown {
    const mockData = new Map();
    
    return {
      id,
      type: 'database',
      query: async (sql: string, params?: unknown[]) => this.executeBehavior(id, { type: 'query', sql, params }),
      find: async (table: string, conditions: unknown) => this.executeBehavior(id, { type: 'find', table, conditions }),
      insert: async (table: string, data: unknown) => {
        if (config.deterministic) {
          const key = `${table}_${JSON.stringify(data)}`;
          const result = { id: this.generateId(), ...data };
          mockData.set(key, result);
          return result;
        }
        return this.executeBehavior(id, { type: 'insert', table, data });
      },
      update: async (table: string, conditions: unknown, data: unknown) => 
        this.executeBehavior(id, { type: 'update', table, conditions, data }),
      delete: async (table: string, conditions: unknown) => 
        this.executeBehavior(id, { type: 'delete', table, conditions })
    };
  }

  private createServiceMock(id: string, _config: MockConfig): unknown {
    return {
      id,
      type: 'service',
      call: async (method: string, args?: unknown[]) => this.executeBehavior(id, { method, args }),
      isAvailable: () => true,
      getStatus: () => ({ status: 'active', uptime: Date.now() - this.mocks.get(id)!.createdAt.getTime() })
    };
  }

  private createComponentMock(id: string, _config: MockConfig): unknown {
    const mockProps: unknown = {};
    const mockMethods: unknown = {};
    
    return {
      id,
      type: 'component',
      props: mockProps,
      methods: mockMethods,
      trigger: async (event: string, data?: unknown) => this.executeBehavior(id, { event, data }),
      setState: (state: unknown) => { mockProps.state = { ...mockProps.state, ...state }; },
      getState: () => mockProps.state || {}
    };
  }

  private createFilesystemMock(id: string, _config: MockConfig): unknown {
    const mockFiles = new Map();
    
    return {
      id,
      type: 'filesystem',
      readFile: async (path: string) => {
        if (mockFiles.has(path)) {
          return mockFiles.get(path);
        }
        return this.executeBehavior(id, { operation: 'readFile', path });
      },
      writeFile: async (path: string, content: unknown) => {
        if (config.deterministic) {
          mockFiles.set(path, content);
          return { success: true, path, size: JSON.stringify(content).length };
        }
        return this.executeBehavior(id, { operation: 'writeFile', path, content });
      },
      exists: async (path: string) => {
        if (config.deterministic) {
          return mockFiles.has(path);
        }
        return this.executeBehavior(id, { operation: 'exists', path });
      },
      delete: async (path: string) => {
        if (config.deterministic) {
          const existed = mockFiles.has(path);
          mockFiles.delete(path);
          return { success: true, existed };
        }
        return this.executeBehavior(id, { operation: 'delete', path });
      }
    };
  }

  private createNetworkMock(id: string, _config: MockConfig): unknown {
    return {
      id,
      type: 'network',
      fetch: async (url: string, options?: RequestInit) => 
        this.executeBehavior(id, { type: 'fetch', url, options }),
      websocket: {
        connect: async (url: string) => this.executeBehavior(id, { type: 'websocket_connect', url }),
        send: async (data: unknown) => this.executeBehavior(id, { type: 'websocket_send', data }),
        close: async () => this.executeBehavior(id, { type: 'websocket_close' })
      }
    };
  }

  private createAuthMock(id: string, _config: MockConfig): unknown {
    const sessions = new Map();
    
    return {
      id,
      type: 'auth',
      login: async (credentials: { email: string; password: string }) => {
        if (config.deterministic) {
          const sessionId = this.generateId();
          const user = { id: this.generateId(), email: credentials.email, role: 'user' };
          sessions.set(sessionId, { user, createdAt: new Date() });
          return { success: true, sessionId, user, token: `mock_token_${sessionId}` };
        }
        return this.executeBehavior(id, { type: 'login', credentials });
      },
      logout: async (sessionId: string) => {
        if (config.deterministic) {
          sessions.delete(sessionId);
          return { success: true };
        }
        return this.executeBehavior(id, { type: 'logout', sessionId });
      },
      validateToken: async (token: string) => {
        const sessionId = token.replace('mock_token_', '');
        if (config.deterministic) {
          const session = sessions.get(sessionId);
          return { valid: !!session, user: session?.user };
        }
        return this.executeBehavior(id, { type: 'validateToken', token });
      },
      refreshToken: async (refreshToken: string) => this.executeBehavior(id, { type: 'refreshToken', refreshToken })
    };
  }

  private createAnalyticsMock(id: string, _config: MockConfig): unknown {
    const events: unknown[] = [];
    
    return {
      id,
      type: 'analytics',
      track: async (event: string, properties?: unknown) => {
        if (config.deterministic) {
          events.push({ event, properties, timestamp: new Date() });
          return { success: true, eventId: this.generateId() };
        }
        return this.executeBehavior(id, { type: 'track', event, properties });
      },
      identify: async (userId: string, traits?: unknown) => 
        this.executeBehavior(id, { type: 'identify', userId, traits }),
      page: async (name: string, properties?: unknown) => 
        this.executeBehavior(id, { type: 'page', name, properties }),
      getEvents: () => config.deterministic ? events : []
    };
  }

  private generateId(): string {
    return `mock_${Date.now()}_${Math.floor(this.rng() * 10000)}`;
  }

  /**
   * Create preset mock configurations
   */
  static createPresets() {
    return {
      testing: new MockFactory({
        seed: 12345,
        deterministic: true,
        enableLogging: false,
        environment: 'test'
      }),
      
      development: new MockFactory({
        seed: Date.now(),
        deterministic: false,
        enableLogging: true,
        environment: 'development'
      }),
      
      performance: new MockFactory({
        seed: 12345,
        deterministic: true,
        enableLogging: false,
        environment: 'test'
      })
    };
  }
}

export default MockFactory;