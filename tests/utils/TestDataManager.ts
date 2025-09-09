/**
 * Test Data Manager
 * Centralized system for managing test data generation, persistence, and cleanup
 */

import fs from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import { fixtures } from './testFixtures';
import { testUtils } from './mockHelpers';

export interface TestDataConfig {
  seed?: number;
  environment: 'test' | 'development' | 'ci';
  persistence: {
    enabled: boolean;
    directory: string;
    cleanup: boolean;
    retentionDays: number;
  };
  generation: {
    deterministic: boolean;
    maxCacheSize: number;
    batchSize: number;
  };
}

export interface TestDataSnapshot {
  id: string;
  timestamp: string;
  testSuite: string;
  data: Record<string, any>;
  metadata: {
    seed: number;
    environment: string;
    testCount: number;
    generatedBy: string;
  };
}

export interface TestDataRequest {
  type: string;
  count?: number;
  seed?: number;
  options?: Record<string, any>;
  constraints?: Record<string, any>;
}

export class TestDataManager {
  private config: TestDataConfig;
  private cache: Map<string, any>;
  private snapshots: Map<string, TestDataSnapshot>;
  private generators: Map<string, Function>;
  private dataDirectory: string;
  private currentSeed: number;

  constructor(config: Partial<TestDataConfig> = {}) {
    this.config = {
      seed: config.seed || Math.floor(Math.random() * 1000000),
      environment: config.environment || 'test',
      persistence: {
        enabled: true,
        directory: 'test-data',
        cleanup: true,
        retentionDays: 7,
        ...config.persistence
      },
      generation: {
        deterministic: true,
        maxCacheSize: 1000,
        batchSize: 100,
        ...config.generation
      }
    };

    this.cache = new Map();
    this.snapshots = new Map();
    this.generators = new Map();
    this.dataDirectory = path.join(
      process.cwd(),
      this.config.persistence.directory
    );
    this.currentSeed = this.config.seed!;

    this.initializeGenerators();
  }

  /**
   * Initialize built-in data generators
   */
  private initializeGenerators() {
    // User data generator
    this.registerGenerator('user', (count = 1, options = {}) => {
      return Array.from({ length: count }, (_, i) => ({
        id: this.generateId('user'),
        username: `testuser${i + 1}`,
        email: `test${i + 1}@example.com`,
        name: `Test User ${i + 1}`,
        role: options.role || 'user',
        active: options.active !== false,
        createdAt: new Date(
          Date.now() - Math.random() * 86400000
        ).toISOString(),
        permissions: options.permissions || ['read'],
        profile: {
          avatar: `https://api.dicebear.com/6.x/personas/svg?seed=user${i + 1}`,
          bio: `Test user ${i + 1} biography`,
          preferences: {
            theme: ['light', 'dark'][i % 2],
            notifications: true,
            language: 'en'
          }
        }
      }));
    });

    // Graph data generator
    this.registerGenerator('graph', (count = 1, options = {}) => {
      const graphTypes = ['simple', 'branching', 'complex'];
      return Array.from({ length: count }, (_, i) => {
        const type = options.type || graphTypes[i % graphTypes.length];
        const baseGraph = this.getFixtureGraph(type);

        return {
          id: this.generateId('graph'),
          name: `Test Graph ${i + 1}`,
          description: `Generated test graph of type ${type}`,
          version: '1.0.0',
          tags: options.tags || ['test', type],
          createdAt: new Date().toISOString(),
          ...baseGraph,
          metadata: {
            nodeCount: baseGraph.nodes.length,
            edgeCount: baseGraph.edges.length,
            complexity: this.calculateGraphComplexity(baseGraph),
            testGenerated: true
          }
        };
      });
    });

    // API response generator
    this.registerGenerator('apiResponse', (count = 1, options = {}) => {
      return Array.from({ length: count }, (_, i) => ({
        id: this.generateId('response'),
        status: options.status || 200,
        statusText: options.statusText || 'OK',
        data: options.data || { message: `Test response ${i + 1}` },
        timestamp: new Date().toISOString(),
        headers: {
          'content-type': 'application/json',
          'x-request-id': this.generateId('req'),
          ...options.headers
        },
        metadata: {
          responseTime: Math.floor(Math.random() * 100) + 50,
          cached: false,
          testGenerated: true
        }
      }));
    });

    // File data generator
    this.registerGenerator('file', (count = 1, options = {}) => {
      const fileTypes = ['json', 'csv', 'txt', 'xml'];
      return Array.from({ length: count }, (_, i) => {
        const ext = options.type || fileTypes[i % fileTypes.length];
        return {
          id: this.generateId('file'),
          name: `test-file-${i + 1}.${ext}`,
          size: Math.floor(Math.random() * 10000) + 1000,
          type: `application/${ext}`,
          lastModified: new Date(
            Date.now() - Math.random() * 86400000
          ).toISOString(),
          content: this.generateFileContent(ext, options),
          metadata: {
            checksum: randomBytes(16).toString('hex'),
            encoding: 'utf-8',
            testGenerated: true
          }
        };
      });
    });

    // Performance data generator
    this.registerGenerator('performance', (count = 1, options = {}) => {
      return Array.from({ length: count }, (_, i) => ({
        id: this.generateId('perf'),
        testName: options.testName || `performance-test-${i + 1}`,
        metrics: {
          executionTime: Math.floor(Math.random() * 1000) + 100,
          memoryUsage: Math.floor(Math.random() * 100) + 10,
          cpuUsage: Math.random() * 100,
          networkLatency: Math.floor(Math.random() * 50) + 10
        },
        timestamp: new Date().toISOString(),
        environment: this.config.environment,
        baseline: options.baseline || {
          executionTime: 500,
          memoryUsage: 50,
          cpuUsage: 30,
          networkLatency: 20
        },
        passed: options.passed !== false,
        testGenerated: true
      }));
    });

    // Error data generator
    this.registerGenerator('error', (count = 1, options = {}) => {
      const errorTypes = [
        'ValidationError',
        'NetworkError',
        'AuthenticationError',
        'NotFoundError'
      ];
      return Array.from({ length: count }, (_, i) => ({
        id: this.generateId('error'),
        name: options.name || errorTypes[i % errorTypes.length],
        message: options.message || `Test error message ${i + 1}`,
        code: options.code || `E${1000 + i}`,
        statusCode: options.statusCode || 400,
        stack: this.generateStackTrace(
          options.name || errorTypes[i % errorTypes.length]
        ),
        timestamp: new Date().toISOString(),
        context: options.context || {
          operation: `test-operation-${i + 1}`,
          userId: this.generateId('user'),
          requestId: this.generateId('req')
        },
        testGenerated: true
      }));
    });
  }

  /**
   * Register a custom data generator
   */
  registerGenerator(type: string, generator: Function) {
    this.generators.set(type, generator);
  }

  /**
   * Generate test data of specified type
   */
  async generate<T = any>(request: TestDataRequest): Promise<T[]> {
    const { type, count = 1, seed, options = {}, constraints = {} } = request;

    // Use provided seed or current seed
    const useSeed = seed || this.currentSeed;
    this.seedRandom(useSeed);

    const cacheKey = this.getCacheKey(request);

    // Check cache first
    if (this.cache.has(cacheKey) && this.config.generation.deterministic) {
      return this.cache.get(cacheKey);
    }

    // Get generator
    const generator = this.generators.get(type);
    if (!generator) {
      throw new Error(`No generator found for type: ${type}`);
    }

    // Generate data
    const data = generator(count, { ...options, ...constraints });

    // Cache the result
    if (this.cache.size < this.config.generation.maxCacheSize) {
      this.cache.set(cacheKey, data);
    }

    return data;
  }

  /**
   * Generate batch of different data types
   */
  async generateBatch(
    requests: TestDataRequest[]
  ): Promise<Record<string, any[]>> {
    const results: Record<string, any[]> = {};

    for (const request of requests) {
      results[request.type] = await this.generate(request);
    }

    return results;
  }

  /**
   * Create a data snapshot for a test suite
   */
  async createSnapshot(
    testSuite: string,
    data: Record<string, any>
  ): Promise<string> {
    const snapshot: TestDataSnapshot = {
      id: this.generateId('snapshot'),
      timestamp: new Date().toISOString(),
      testSuite,
      data,
      metadata: {
        seed: this.currentSeed,
        environment: this.config.environment,
        testCount: Object.keys(data).length,
        generatedBy: 'TestDataManager'
      }
    };

    this.snapshots.set(snapshot.id, snapshot);

    if (this.config.persistence.enabled) {
      await this.saveSnapshot(snapshot);
    }

    return snapshot.id;
  }

  /**
   * Load a data snapshot
   */
  async loadSnapshot(snapshotId: string): Promise<TestDataSnapshot | null> {
    // Check memory first
    if (this.snapshots.has(snapshotId)) {
      return this.snapshots.get(snapshotId)!;
    }

    // Try to load from disk
    if (this.config.persistence.enabled) {
      return await this.loadSnapshotFromDisk(snapshotId);
    }

    return null;
  }

  /**
   * Get fixture data
   */
  getFixture<T = any>(category: string, name: string): T {
    const categoryFixtures = (fixtures as any)[category];
    if (!categoryFixtures) {
      throw new Error(`Fixture category not found: ${category}`);
    }

    const fixture = categoryFixtures[name];
    if (!fixture) {
      throw new Error(`Fixture not found: ${category}.${name}`);
    }

    return typeof fixture === 'function' ? fixture() : fixture;
  }

  /**
   * Create test database
   */
  async createTestDatabase(name: string, schema?: any): Promise<string> {
    const dbId = this.generateId('db');
    const dbPath = path.join(
      this.dataDirectory,
      'databases',
      `${name}_${dbId}.json`
    );

    const database = {
      id: dbId,
      name,
      schema: schema || {},
      tables: {},
      createdAt: new Date().toISOString(),
      testGenerated: true
    };

    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    await fs.writeFile(dbPath, JSON.stringify(database, null, 2));

    return dbId;
  }

  /**
   * Seed test database with data
   */
  async seedDatabase(
    dbId: string,
    tableData: Record<string, any[]>
  ): Promise<void> {
    const dbPath = path.join(this.dataDirectory, 'databases', `*_${dbId}.json`);
    const files = await this.globFiles(dbPath);

    if (files.length === 0) {
      throw new Error(`Database not found: ${dbId}`);
    }

    const database = JSON.parse(await fs.readFile(files[0], 'utf8'));
    database.tables = { ...database.tables, ...tableData };
    database.updatedAt = new Date().toISOString();

    await fs.writeFile(files[0], JSON.stringify(database, null, 2));
  }

  /**
   * Clean up test data
   */
  async cleanup(
    options: { olderThan?: Date; testSuite?: string; force?: boolean } = {}
  ): Promise<void> {
    const { olderThan, testSuite, force = false } = options;

    // Clear memory cache
    if (force || !testSuite) {
      this.cache.clear();
    }

    // Clean snapshots
    const snapshotsToRemove = [];
    for (const [id, snapshot] of this.snapshots.entries()) {
      let shouldRemove = false;

      if (force) {
        shouldRemove = true;
      } else if (testSuite && snapshot.testSuite === testSuite) {
        shouldRemove = true;
      } else if (olderThan && new Date(snapshot.timestamp) < olderThan) {
        shouldRemove = true;
      }

      if (shouldRemove) {
        snapshotsToRemove.push(id);
      }
    }

    for (const id of snapshotsToRemove) {
      this.snapshots.delete(id);
      if (this.config.persistence.enabled) {
        await this.deleteSnapshotFromDisk(id);
      }
    }

    // Clean persistent data
    if (this.config.persistence.enabled && this.config.persistence.cleanup) {
      await this.cleanupPersistentData(options);
    }
  }

  /**
   * Get usage statistics
   */
  getStatistics() {
    return {
      cacheSize: this.cache.size,
      snapshotCount: this.snapshots.size,
      generatorCount: this.generators.size,
      currentSeed: this.currentSeed,
      environment: this.config.environment,
      persistenceEnabled: this.config.persistence.enabled,
      dataDirectory: this.dataDirectory
    };
  }

  /**
   * Export test data for sharing
   */
  async export(format: 'json' | 'csv' = 'json'): Promise<string> {
    const exportData = {
      config: this.config,
      snapshots: Array.from(this.snapshots.values()),
      statistics: this.getStatistics(),
      exportedAt: new Date().toISOString()
    };

    const exportPath = path.join(
      this.dataDirectory,
      'exports',
      `test-data-export-${Date.now()}.${format}`
    );
    await fs.mkdir(path.dirname(exportPath), { recursive: true });

    if (format === 'json') {
      await fs.writeFile(exportPath, JSON.stringify(exportData, null, 2));
    } else if (format === 'csv') {
      const csv = this.convertToCSV(exportData);
      await fs.writeFile(exportPath, csv);
    }

    return exportPath;
  }

  /**
   * Import test data
   */
  async import(filePath: string): Promise<void> {
    const data = JSON.parse(await fs.readFile(filePath, 'utf8'));

    if (data.snapshots) {
      for (const snapshot of data.snapshots) {
        this.snapshots.set(snapshot.id, snapshot);
      }
    }

    if (data.config) {
      this.config = { ...this.config, ...data.config };
    }
  }

  // Private helper methods

  private generateId(prefix: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 6);
    return `${prefix}_${timestamp}_${random}`;
  }

  private seedRandom(seed: number) {
    if (this.config.generation.deterministic) {
      // Simple seeded random implementation
      let currentSeed = seed;
      Math.random = () => {
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        return currentSeed / 233280;
      };
    }
  }

  private getCacheKey(request: TestDataRequest): string {
    return `${request.type}_${request.count}_${JSON.stringify(request.options)}_${JSON.stringify(request.constraints)}`;
  }

  private getFixtureGraph(type: string) {
    switch (type) {
      case 'simple':
        return fixtures.graphs.simple;
      case 'branching':
        return fixtures.graphs.branching;
      case 'complex':
        return fixtures.graphs.complex;
      default:
        return fixtures.graphs.simple;
    }
  }

  private calculateGraphComplexity(graph: any): number {
    const nodeCount = graph.nodes.length;
    const edgeCount = graph.edges.length;
    const branchingFactor = edgeCount / Math.max(nodeCount - 1, 1);
    return Math.round(nodeCount * 0.5 + edgeCount * 0.3 + branchingFactor * 2);
  }

  private generateFileContent(type: string, options: any): string {
    switch (type) {
      case 'json':
        return JSON.stringify(
          { test: true, data: options.data || 'sample' },
          null,
          2
        );
      case 'csv':
        return 'id,name,value\n1,test1,100\n2,test2,200\n3,test3,300';
      case 'txt':
        return 'This is a test file content.\nGenerated for testing purposes.';
      case 'xml':
        return '<?xml version="1.0"?>\n<root>\n  <test>data</test>\n</root>';
      default:
        return 'Test file content';
    }
  }

  private generateStackTrace(errorName: string): string {
    return [
      `${errorName}: Test error occurred`,
      '    at TestFunction (test-file.js:10:5)',
      '    at TestSuite (test-suite.js:25:10)',
      '    at TestRunner (test-runner.js:50:15)'
    ].join('\n');
  }

  private async saveSnapshot(snapshot: TestDataSnapshot): Promise<void> {
    const snapshotPath = path.join(
      this.dataDirectory,
      'snapshots',
      `${snapshot.id}.json`
    );
    await fs.mkdir(path.dirname(snapshotPath), { recursive: true });
    await fs.writeFile(snapshotPath, JSON.stringify(snapshot, null, 2));
  }

  private async loadSnapshotFromDisk(
    snapshotId: string
  ): Promise<TestDataSnapshot | null> {
    try {
      const snapshotPath = path.join(
        this.dataDirectory,
        'snapshots',
        `${snapshotId}.json`
      );
      const data = await fs.readFile(snapshotPath, 'utf8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  private async deleteSnapshotFromDisk(snapshotId: string): Promise<void> {
    try {
      const snapshotPath = path.join(
        this.dataDirectory,
        'snapshots',
        `${snapshotId}.json`
      );
      await fs.unlink(snapshotPath);
    } catch {
      // Ignore errors when deleting
    }
  }

  private async cleanupPersistentData(options: {
    olderThan?: Date;
  }): Promise<void> {
    const { olderThan } = options;
    const cutoffDate =
      olderThan ||
      new Date(
        Date.now() - this.config.persistence.retentionDays * 24 * 60 * 60 * 1000
      );

    const directories = ['snapshots', 'databases', 'exports'];

    for (const dir of directories) {
      const dirPath = path.join(this.dataDirectory, dir);
      try {
        const files = await fs.readdir(dirPath);
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const stats = await fs.stat(filePath);
          if (stats.mtime < cutoffDate) {
            await fs.unlink(filePath);
          }
        }
      } catch {
        // Directory might not exist
      }
    }
  }

  private async globFiles(pattern: string): Promise<string[]> {
    // Simple glob implementation for database files
    const dir = path.dirname(pattern);
    const filename = path.basename(pattern);

    try {
      const files = await fs.readdir(dir);
      return files
        .filter(file => (filename.includes('*') ? true : file === filename))
        .map(file => path.join(dir, file));
    } catch {
      return [];
    }
  }

  private convertToCSV(data: any): string {
    // Simple CSV conversion for export
    const rows = [];
    rows.push('Type,ID,Timestamp,TestSuite,DataCount');

    for (const snapshot of data.snapshots) {
      rows.push(
        [
          'Snapshot',
          snapshot.id,
          snapshot.timestamp,
          snapshot.testSuite,
          Object.keys(snapshot.data).length
        ].join(',')
      );
    }

    return rows.join('\n');
  }
}

// Singleton instance for global use
let globalTestDataManager: TestDataManager | null = null;

/**
 * Get or create global test data manager instance
 */
export function getTestDataManager(
  config?: Partial<TestDataConfig>
): TestDataManager {
  if (!globalTestDataManager) {
    globalTestDataManager = new TestDataManager(config);
  }
  return globalTestDataManager;
}

/**
 * Reset global test data manager (for testing)
 */
export function resetTestDataManager(): void {
  globalTestDataManager = null;
}

// Convenient helper functions
export const testData = {
  /**
   * Generate users for testing
   */
  users: (count = 1, options = {}) =>
    getTestDataManager().generate({ type: 'user', count, options }),

  /**
   * Generate graphs for testing
   */
  graphs: (count = 1, options = {}) =>
    getTestDataManager().generate({ type: 'graph', count, options }),

  /**
   * Generate API responses for testing
   */
  apiResponses: (count = 1, options = {}) =>
    getTestDataManager().generate({ type: 'apiResponse', count, options }),

  /**
   * Generate files for testing
   */
  files: (count = 1, options = {}) =>
    getTestDataManager().generate({ type: 'file', count, options }),

  /**
   * Generate performance data for testing
   */
  performance: (count = 1, options = {}) =>
    getTestDataManager().generate({ type: 'performance', count, options }),

  /**
   * Generate errors for testing
   */
  errors: (count = 1, options = {}) =>
    getTestDataManager().generate({ type: 'error', count, options }),

  /**
   * Create snapshot of test data
   */
  snapshot: (testSuite: string, data: Record<string, any>) =>
    getTestDataManager().createSnapshot(testSuite, data),

  /**
   * Clean up test data
   */
  cleanup: (options = {}) => getTestDataManager().cleanup(options)
};
