import Database from 'better-sqlite3';
import { RepositoryFactoryImpl, createRepositoryFactory } from '../factories/RepositoryFactoryImpl';
import { RepositoryConfig } from '../interfaces/RepositoryFactory';
import { DatabaseGraphRepository, FileSystemGraphRepository } from '../implementations';

// Mock the database connection module
jest.mock('../../database/connection', () => ({
  getDatabase: jest.fn<unknown[], unknown>(),
  healthCheck: jest.fn<unknown[], unknown>()
}));

describe('RepositoryFactory', () => {
  let mockDb: Database.Database;
  
  beforeEach(() => {
    mockDb = new Database(':memory:');
    
    // Create test schemas
    mockDb.exec(`
      CREATE TABLE graphs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        data TEXT NOT NULL,
        version INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        organization_id TEXT,
        is_active INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        last_login_at INTEGER
      );
      
      CREATE TABLE analytics_events (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        user_id TEXT,
        graph_id TEXT,
        timestamp INTEGER NOT NULL,
        data TEXT NOT NULL,
        metadata TEXT
      );
    `);
    
    // Mock the getDatabase function to return our test database
    const { getDatabase, healthCheck } = require('../../database/connection');
    getDatabase.mockReturnValue(mockDb as unknown);
    healthCheck.mockReturnValue(true as unknown);
  });
  
  afterEach(() => {
    mockDb.close();
    jest.clearAllMocks();
  });

  describe('Database Configuration', () => {
    test('should create database repositories with database config', async () => {
      const config: RepositoryConfig = {
        database: { type: 'sqlite', path: ':memory:' },
        cache: { type: 'memory' },
        storage: { type: 'database' }
      };
      
      const factory = new RepositoryFactoryImpl(config);
      await factory.initialize();
      
      const graphRepo = factory.createGraphRepository();
      const userRepo = factory.createUserRepository();
      const sessionRepo = factory.createSessionRepository();
      const analyticsRepo = factory.createAnalyticsRepository();
      
      expect(graphRepo).toBeInstanceOf(DatabaseGraphRepository);
      expect(userRepo).toBeDefined();
      expect(sessionRepo).toBeDefined();
      expect(analyticsRepo).toBeDefined();
      
      await factory.close();
    });
    
    test('should create filesystem repositories with filesystem config', async () => {
      const config: RepositoryConfig = {
        database: { type: 'sqlite', path: ':memory:' },
        cache: { type: 'memory' },
        storage: { type: 'filesystem', basePath: '/tmp/test-graphs' }
      };
      
      const factory = new RepositoryFactoryImpl(config);
      await factory.initialize();
      
      const graphRepo = factory.createGraphRepository();
      expect(graphRepo).toBeInstanceOf(FileSystemGraphRepository);
      
      await factory.close();
    });
  });

  describe('Singleton Pattern', () => {
    test('should return same repository instances on multiple calls', async () => {
      const config: RepositoryConfig = {
        database: { type: 'sqlite', path: ':memory:' },
        cache: { type: 'memory' },
        storage: { type: 'database' }
      };
      
      const factory = new RepositoryFactoryImpl(config);
      await factory.initialize();
      
      const graphRepo1 = factory.createGraphRepository();
      const graphRepo2 = factory.createGraphRepository();
      
      expect(graphRepo1).toBe(graphRepo2);
      
      await factory.close();
    });
  });

  describe('Health Check', () => {
    test('should perform health check on all repositories', async () => {
      const config: RepositoryConfig = {
        database: { type: 'sqlite', path: ':memory:' },
        cache: { type: 'memory' },
        storage: { type: 'database' }
      };
      
      const factory = new RepositoryFactoryImpl(config);
      await factory.initialize();
      
      const health = await factory.healthCheck();
      
      expect(health.graph).toBe(true);
      expect(health.user).toBe(true);
      expect(health.session).toBe(true);
      expect(health.analytics).toBe(true);
      expect(health.overall).toBe(true);
      
      await factory.close();
    });
  });

  describe('Factory Creation', () => {
    test('should create factory with default configuration', () => {
      const factory = createRepositoryFactory();
      expect(factory).toBeInstanceOf(RepositoryFactoryImpl);
    });
    
    test('should create factory with overridden configuration', () => {
      const overrides = {
        storage: { type: 'filesystem' as const, basePath: '/custom/path' }
      };
      
      const factory = createRepositoryFactory(overrides);
      expect(factory).toBeInstanceOf(RepositoryFactoryImpl);
    });
  });

  describe('Error Handling', () => {
    test('should throw error when database not initialized for user repository', async () => {
      const { getDatabase } = require('../../database/connection');
      getDatabase.mockImplementation(() => {
        throw new Error('Database not initialized');
      });
      
      const config: RepositoryConfig = {
        database: { type: 'sqlite', path: ':memory:' },
        cache: { type: 'memory' },
        storage: { type: 'database' }
      };
      
      const factory = new RepositoryFactoryImpl(config);
      
      expect(() => factory.createUserRepository()).toThrow('Database required for user repository');
    });
  });
});