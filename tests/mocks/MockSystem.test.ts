/**
 * Mock System Integration Tests
 *
 * Comprehensive tests for the mock system infrastructure including
 * factory, API mocks, database mocks, and service mocks.
 *
 * Task: E18-1753114562158-DAD671
 */

import MockFactory from './MockFactory';
import DatabaseMockService from './DatabaseMocks';
import ServiceMockManager from './ServiceMocks';

// Mock the API service to avoid MSW dependency in tests
jest.mock('./APIMocks', () => {
  return {
    __esModule: true,
    default: class MockAPIMockService {
      constructor() {}
      start() {
        console.log('Mock API server started');
      }
      stop() {
        console.log('Mock API server stopped');
      }
      resetHandlers() {
        console.log('API handlers reset');
      }
      addCustomBehavior() {}
      getServer() {
        return {};
      }
      getFactory() {
        return new MockFactory();
      }
      getMockData() {
        return new Map();
      }
    }
  };
});

// Import after mocking
import {
  ComprehensiveMockSystem,
  createMockSystem,
  MockSystemPresets
} from './index';

describe('Mock System Infrastructure', () => {
  let mockSystem: ComprehensiveMockSystem;

  beforeEach(() => {
    mockSystem = createMockSystem({ enableLogging: false });
  });

  afterEach(async () => {
    if (mockSystem.isRunning) {
      await mockSystem.shutdown();
    }
  });

  describe('ComprehensiveMockSystem', () => {
    it('should initialize and shutdown correctly', async () => {
      expect(mockSystem.isRunning).toBe(false);

      await mockSystem.initialize();
      expect(mockSystem.isRunning).toBe(true);

      await mockSystem.shutdown();
      expect(mockSystem.isRunning).toBe(false);
    });

    it('should provide access to all mock components', () => {
      expect(mockSystem.mockFactory).toBeInstanceOf(MockFactory);
      expect(mockSystem.apiMockService).toBeDefined();
      expect(mockSystem.databaseMockService).toBeInstanceOf(
        DatabaseMockService
      );
      expect(mockSystem.serviceMockManager).toBeInstanceOf(ServiceMockManager);
    });

    it('should generate comprehensive statistics', () => {
      const stats = mockSystem.getStatistics();

      expect(stats).toHaveProperty('factory');
      expect(stats).toHaveProperty('database');
      expect(stats).toHaveProperty('services');
      expect(stats).toHaveProperty('system');

      expect(stats.system).toHaveProperty('initialized');
      expect(stats.system).toHaveProperty('uptime');
      expect(stats.system).toHaveProperty('memoryUsage');
    });

    it('should create test environment with cleanup', () => {
      const testEnv = mockSystem.createTestEnvironment('test-case-1');

      expect(testEnv).toHaveProperty('factory');
      expect(testEnv).toHaveProperty('api');
      expect(testEnv).toHaveProperty('database');
      expect(testEnv).toHaveProperty('services');
      expect(testEnv).toHaveProperty('cleanup');
      expect(typeof testEnv.cleanup).toBe('function');
    });

    it('should configure test scenarios', () => {
      const scenarios = mockSystem.configureTestScenarios();

      expect(scenarios).toHaveProperty('successFlow');
      expect(scenarios).toHaveProperty('errorFlow');
      expect(scenarios).toHaveProperty('slowResponse');
      expect(scenarios).toHaveProperty('authenticationFlow');

      expect(typeof scenarios.successFlow).toBe('function');
      expect(typeof scenarios.errorFlow).toBe('function');
      expect(typeof scenarios.slowResponse).toBe('function');
      expect(typeof scenarios.authenticationFlow).toBe('function');
    });

    it('should reset all mock systems', async () => {
      await mockSystem.initialize();

      // Add some mock data
      const factory = mockSystem.mockFactory;
      factory.createMock('api', 'test-api');

      await mockSystem.reset();

      const stats = mockSystem.getStatistics();
      expect(stats.factory.activeMocks).toBeGreaterThanOrEqual(0);
    });
  });

  describe('MockFactory', () => {
    let factory: MockFactory;

    beforeEach(() => {
      factory = new MockFactory({ seed: 12345, deterministic: true });
    });

    afterEach(() => {
      factory.cleanup();
    });

    it('should create different types of mocks', () => {
      const apiMock = factory.createMock('api', 'test-api');
      const dbMock = factory.createMock('database', 'test-db');
      const serviceMock = factory.createMock('service', 'test-service');

      expect(apiMock).toHaveProperty('type', 'api');
      expect(dbMock).toHaveProperty('type', 'database');
      expect(serviceMock).toHaveProperty('type', 'service');
    });

    it('should manage mock lifecycle', () => {
      const mockId = 'test-mock-1';
      factory.createMock('api', mockId);

      expect(factory.getMock(mockId)).toBeDefined();
      expect(factory.removeMock(mockId)).toBe(true);
      expect(factory.getMock(mockId)).toBeUndefined();
    });

    it('should generate statistics', () => {
      factory.createMock('api', 'mock-1');
      factory.createMock('database', 'mock-2');
      factory.createMock('service', 'mock-3');

      const stats = factory.getStatistics();
      expect(stats.totalMocks).toBe(3);
      expect(stats.activeMocks).toBe(3);
      expect(stats.mocksByType).toHaveProperty('api', 1);
      expect(stats.mocksByType).toHaveProperty('database', 1);
      expect(stats.mocksByType).toHaveProperty('service', 1);
    });
  });

  describe('DatabaseMockService', () => {
    let dbMock: DatabaseMockService;

    beforeEach(() => {
      dbMock = new DatabaseMockService({ seed: 12345 });
    });

    afterEach(() => {
      dbMock.cleanup();
    });

    it('should create database connections', () => {
      const connection = dbMock.createConnection('test-conn', {
        type: 'sqlite',
        database: ':memory:'
      });

      expect(connection).toHaveProperty('id', 'test-conn');
      expect(connection).toHaveProperty('type', 'sqlite');
      expect(connection).toHaveProperty('query');
      expect(connection).toHaveProperty('beginTransaction');
    });

    it('should execute queries with mock results', async () => {
      const connection = dbMock.createConnection('test-conn', {
        type: 'sqlite'
      });

      const result = await connection.query('SELECT * FROM users');
      expect(result).toHaveProperty('rows');
      expect(result).toHaveProperty('rowCount');
      expect(result).toHaveProperty('executionTime');
    });

    it('should manage transactions', async () => {
      const connection = dbMock.createConnection('test-conn', {
        type: 'postgres'
      });

      const transactionId = await connection.beginTransaction('READ_COMMITTED');
      expect(typeof transactionId).toBe('string');

      await connection.commit(transactionId);

      const activeTransactions = dbMock.getActiveTransactions();
      expect(activeTransactions).toEqual([]);
    });

    it('should track query logs', async () => {
      const connection = dbMock.createConnection('test-conn', {
        type: 'sqlite'
      });

      await connection.query('SELECT 1');
      await connection.query('SELECT 2');

      const queryLog = dbMock.getQueryLog();
      expect(queryLog).toHaveLength(2);
      expect(queryLog[0]).toHaveProperty('_sql');
      expect(queryLog[0]).toHaveProperty('timestamp');
    });
  });

  describe('ServiceMockManager', () => {
    let serviceMock: ServiceMockManager;

    beforeEach(() => {
      serviceMock = new ServiceMockManager({ seed: 12345 });
    });

    afterEach(() => {
      serviceMock.cleanup();
    });

    it('should create authentication service', () => {
      const authService = serviceMock.createAuthenticationService('auth-test');

      expect(authService).toHaveProperty('name', 'auth-test');
      expect(authService).toHaveProperty('type', 'authentication');
      expect(authService).toHaveProperty('login');
      expect(authService).toHaveProperty('logout');
      expect(authService).toHaveProperty('validateToken');
    });

    it('should create file storage service', () => {
      const storageService =
        serviceMock.createFileStorageService('storage-test');

      expect(storageService).toHaveProperty('name', 'storage-test');
      expect(storageService).toHaveProperty('type', 'storage');
      expect(storageService).toHaveProperty('upload');
      expect(storageService).toHaveProperty('download');
      expect(storageService).toHaveProperty('delete');
    });

    it('should create email service', () => {
      const emailService = serviceMock.createEmailService('email-test');

      expect(emailService).toHaveProperty('name', 'email-test');
      expect(emailService).toHaveProperty('type', 'email');
      expect(emailService).toHaveProperty('send');
      expect(emailService).toHaveProperty('sendBulk');
      expect(emailService).toHaveProperty('getDeliveryStatus');
    });

    it('should create analytics service', () => {
      const analyticsService =
        serviceMock.createAnalyticsService('analytics-test');

      expect(analyticsService).toHaveProperty('name', 'analytics-test');
      expect(analyticsService).toHaveProperty('type', 'analytics');
      expect(analyticsService).toHaveProperty('track');
      expect(analyticsService).toHaveProperty('identify');
      expect(analyticsService).toHaveProperty('getEvents');
    });

    it('should track service call history', () => {
      serviceMock.createAuthenticationService('auth-test');

      const callHistory = serviceMock.getCallHistory();
      expect(Array.isArray(callHistory)).toBe(true);
    });
  });

  describe('Mock System Presets', () => {
    it('should create testing preset', () => {
      const testingSystem = MockSystemPresets.testing();
      expect(testingSystem).toBeInstanceOf(ComprehensiveMockSystem);
    });

    it('should create development preset', () => {
      const devSystem = MockSystemPresets.development();
      expect(devSystem).toBeInstanceOf(ComprehensiveMockSystem);
    });

    it('should create performance preset', () => {
      const perfSystem = MockSystemPresets.performance();
      expect(perfSystem).toBeInstanceOf(ComprehensiveMockSystem);
    });
  });

  describe('Integration Tests', () => {
    it('should work with all components together', async () => {
      await mockSystem.initialize();

      // Test factory
      const apiMock = mockSystem.mockFactory.createMock(
        'api',
        'integration-api'
      );
      expect(apiMock).toBeDefined();

      // Test database
      const dbConnection = mockSystem.databaseMockService.createConnection(
        'integration-db',
        {
          type: 'postgres'
        }
      );
      expect(dbConnection).toBeDefined();

      // Test services
      const authService =
        mockSystem.serviceMockManager.createAuthenticationService(
          'integration-auth'
        );
      expect(authService).toBeDefined();

      // Test statistics
      const stats = mockSystem.getStatistics();
      expect(stats.factory.activeMocks).toBeGreaterThan(0);

      await mockSystem.shutdown();
    });

    it('should handle errors gracefully', async () => {
      // Test double initialization
      await mockSystem.initialize();
      await mockSystem.initialize(); // Should not throw

      // Test shutdown without initialization
      const newSystem = createMockSystem();
      await newSystem.shutdown(); // Should not throw

      await mockSystem.shutdown();
    });
  });
});
