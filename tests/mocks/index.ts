/**
 * Mock System - Comprehensive Mock Infrastructure
 * 
 * Provides unified access to all mock system components including factory,
 * API mocks, database mocks, and service mocks with consistent interfaces
 * and configuration management.
 * 
 * Task: E18-1753114562158-DAD671
 */

// Core Factory
import MockFactory from './MockFactory';
export { MockFactory };
export type { MockConfig, MockInstance, MockBehavior, MockType } from './MockFactory';

// API Layer Mocks
import APIMockService from './APIMocks';
export { APIMockService };
export type { 
  APIResponse, 
  AuthTokenPayload, 
  GraphExecutionRequest,
  DatabaseOperationRequest 
} from './APIMocks';

// Database Layer Mocks
import DatabaseMockService from './DatabaseMocks';
export { DatabaseMockService };
export type { 
  DatabaseConnection, 
  QueryResult, 
  TransactionContext,
  MockTable 
} from './DatabaseMocks';

// Service Layer Mocks
import ServiceMockManager from './ServiceMocks';
export { ServiceMockManager };
export type { 
  ServiceConfig, 
  MockResponse, 
  ServiceCall 
} from './ServiceMocks';

/**
 * Comprehensive Mock System Orchestrator
 * 
 * Provides unified management of all mock system components with
 * consistent configuration, lifecycle management, and testing utilities.
 */
export class ComprehensiveMockSystem {
  private factory: MockFactory;
  private apiMocks: APIMockService;
  private databaseMocks: DatabaseMockService;
  private serviceMocks: ServiceMockManager;
  private isInitialized: boolean = false;

  constructor(config: MockConfig = {}) {
    this.factory = new MockFactory(config);
    this.apiMocks = new APIMockService(config);
    this.databaseMocks = new DatabaseMockService(config);
    this.serviceMocks = new ServiceMockManager(config);
  }

  /**
   * Initialize all mock system components
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ Mock system already initialized');
      return;
    }

    try {
      // Start API mock server
      this.apiMocks.start();
      
      // Set up service event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      console.log('🚀 Comprehensive Mock System initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize mock system:', error);
      throw error;
    }
  }

  /**
   * Shutdown all mock system components
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      console.log('⚠️ Mock system not initialized');
      return;
    }

    try {
      // Stop API mock server
      this.apiMocks.stop();
      
      // Clean up all components
      this.databaseMocks.cleanup();
      this.serviceMocks.cleanup();
      this.factory.cleanup();
      
      this.isInitialized = false;
      console.log('🛑 Comprehensive Mock System shutdown completed');
    } catch (error) {
      console.error('❌ Error during mock system shutdown:', error);
      throw error;
    }
  }

  /**
   * Reset all mocks to initial state
   */
  async reset(): Promise<void> {
    this.apiMocks.resetHandlers();
    this.databaseMocks.clearQueryLog();
    this.serviceMocks.clearCallHistory();
    this.factory.resetAll();
    
    console.log('🔄 All mock systems reset to initial state');
  }

  /**
   * Get comprehensive mock system statistics
   */
  getStatistics(): {
    factory: unknown;
    database: unknown;
    services: unknown;
    system: {
      initialized: boolean;
      uptime: number;
      memoryUsage: unknown;
    };
    } {
    return {
      factory: this.factory.getStatistics(),
      database: {
        totalQueries: this.databaseMocks.getQueryLog().length,
        activeTables: this.databaseMocks.getTables().size,
        activeTransactions: this.databaseMocks.getActiveTransactions().length
      },
      services: {
        registeredServices: this.serviceMocks.getServices().length,
        totalCalls: this.serviceMocks.getCallHistory().length
      },
      system: {
        initialized: this.isInitialized,
        uptime: Date.now() - (this.factory as { createdAt?: number }).createdAt || 0,
        memoryUsage: process.memoryUsage()
      }
    };
  }

  /**
   * Create a complete test environment with all mock components
   */
  createTestEnvironment(testName: string): {
    factory: MockFactory;
    api: APIMockService;
    database: DatabaseMockService;
    services: ServiceMockManager;
    cleanup: () => Promise<void>;
  } {
    console.log(`🧪 Creating test environment: ${testName}`);
    
    return {
      factory: this.factory,
      api: this.apiMocks,
      database: this.databaseMocks,
      services: this.serviceMocks,
      cleanup: async () => {
        console.log(`🧹 Cleaning up test environment: ${testName}`);
        await this.reset();
      }
    };
  }

  /**
   * Configure mock behaviors for common test scenarios
   */
  configureTestScenarios(): {
    successFlow: () => void;
    errorFlow: () => void;
    slowResponse: () => void;
    authenticationFlow: () => void;
    } {
    return {
      successFlow: () => {
        // Configure all mocks for successful responses
        this.apiMocks.addCustomBehavior('success', {
          name: 'success-flow',
          response: { success: true, data: 'test-data' },
          delay: 50
        });
      },
      
      errorFlow: () => {
        // Configure mocks to simulate errors
        this.apiMocks.addCustomBehavior('error', {
          name: 'error-flow',
          response: { success: false, error: 'Simulated error' },
          statusCode: 500,
          errorRate: 0.3
        });
      },
      
      slowResponse: () => {
        // Configure mocks for slow responses
        this.apiMocks.addCustomBehavior('slow', {
          name: 'slow-response',
          response: { success: true, data: 'delayed-data' },
          delay: 2000
        });
      },
      
      authenticationFlow: () => {
        // Configure authentication mocks
        this.serviceMocks.createAuthenticationService('test-auth');
        // Auth service is automatically configured with mock users and sessions
      }
    };
  }

  // Getters for individual components
  get mockFactory(): MockFactory {
    return this.factory;
  }

  get apiMockService(): APIMockService {
    return this.apiMocks;
  }

  get databaseMockService(): DatabaseMockService {
    return this.databaseMocks;
  }

  get serviceMockManager(): ServiceMockManager {
    return this.serviceMocks;
  }

  get isRunning(): boolean {
    return this.isInitialized;
  }

  /**
   * Set up event listeners for cross-component communication
   */
  private setupEventListeners(): void {
    // Listen for service calls and log API interactions
    this.serviceMocks.on('serviceCall', (call) => {
      console.log(`📡 Service call: ${call.service}.${call.method}`);
    });

    // Listen for factory events
    this.factory.on('mockCreated', (event) => {
      console.log(`🎭 Mock created: ${event.type}/${event.id}`);
    });
  }
}

// Export default instance for convenience
export default ComprehensiveMockSystem;

/**
 * Utility function to create a configured mock system for testing
 */
export function createMockSystem(config: MockConfig = {}): ComprehensiveMockSystem {
  return new ComprehensiveMockSystem({
    seed: 12345,
    deterministic: true,
    enableLogging: false,
    environment: 'test',
    ...config
  });
}

/**
 * Utility function to create mock system presets
 */
export };