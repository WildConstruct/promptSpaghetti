/**
 * Test Data Manager
 * Centralized system for managing test data generation, persistence, and cleanup
 */

import fs from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import { fixtures } from './testFixtures';

type GeneratorOptions = Record<string, unknown>;
type TestDataGenerator<T = unknown> = (count?: number, options?: GeneratorOptions) => T[];

interface GraphLike {
  nodes: unknown[];
  edges: unknown[];
}

interface DatabaseFile {
  id: string;
  name: string;
  schema: Record<string, unknown>;
  tables: Record<string, unknown[]>;
  createdAt: string;
  updatedAt?: string;
  testGenerated: boolean;
}

interface ExportPayload {
  config: TestDataConfig;
  snapshots: TestDataSnapshot[];
  statistics: ReturnType<TestDataManager['getStatistics']>;
  exportedAt: string;
}

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
  data: Record<string, unknown>;
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
  options?: GeneratorOptions;
  constraints?: GeneratorOptions;
}

export class TestDataManager {
  private config: TestDataConfig;
  private cache: Map<string, unknown>;
  private snapshots: Map<string, TestDataSnapshot>;
  private generators: Map<string, TestDataGenerator>;
  private dataDirectory: string;
  private currentSeed: number;

  constructor(config: Partial<TestDataConfig> = {}) {
    const initialSeed = config.seed ?? Math.floor(Math.random() * 1000000);
    this.config = {
      seed: initialSeed,
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
    this.currentSeed = initialSeed;

    this.initializeGenerators();
  }

  /**
   * Initialize built-in data generators
   */
  private initializeGenerators() {
    // User data generator
    this.registerGenerator('user', (count = 1, options: GeneratorOptions = {}) => {
      const userOptions = options as {
        role?: string;
        active?: boolean;
        permissions?: string[];
      };
      return Array.from({ length: count }, (_, i) => ({
        id: this.generateId('user'),
        username: `testuser${i + 1}`,
        email: `test${i + 1}@example.com`,
        name: `Test User ${i + 1}`,
        role: userOptions.role ?? 'user',
        active: userOptions.active !== false,
        createdAt: new Date(
          Date.now() - Math.random() * 86400000
        ).toISOString(),
        permissions: userOptions.permissions ?? ['read'],
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
    this.registerGenerator('graph', (count = 1, options: GeneratorOptions = {}) => {
      const graphTypes = ['simple', 'branching', 'complex'];
      const graphOptions = options as {
        type?: string;
        tags?: string[];
      };
      return Array.from({ length: count }, (_, i) => {
        const type = graphOptions.type ?? graphTypes[i % graphTypes.length];
        const baseGraph = this.getFixtureGraph(type);

        return {
          id: this.generateId('graph'),
          name: `Test Graph ${i + 1}`,
          description: `Generated test graph of type ${type}`,
          version: '1.0.0',
          tags: graphOptions.tags ?? ['test', type],
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
    this.registerGenerator('apiResponse', (count = 1, options: GeneratorOptions = {}) => {
      const responseOptions = options as {
        status?: number;
        statusText?: string;
        data?: unknown;
        headers?: Record<string, string>;
      };
      return Array.from({ length: count }, (_, i) => ({
        id: this.generateId('response'),
        status: responseOptions.status ?? 200,
        statusText: responseOptions.statusText ?? 'OK',
        data: responseOptions.data ?? { message: `Test response ${i + 1}` },
        timestamp: new Date().toISOString(),
        headers: {
          'content-type': 'application/json',
          'x-request-id': this.generateId('req'),
          ...(responseOptions.headers ?? {})
        },
        metadata: {
          responseTime: Math.floor(Math.random() * 100) + 50,
          cached: false,
          testGenerated: true
        }
      }));
    });

    // File data generator
    this.registerGenerator('file', (count = 1, options: GeneratorOptions = {}) => {
      const fileTypes = ['json', 'csv', 'txt', 'xml'];
      const fileOptions = options as {
        type?: string;
      };
      return Array.from({ length: count }, (_, i) => {
        const ext = fileOptions.type ?? fileTypes[i % fileTypes.length];
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
    this.registerGenerator('performance', (count = 1, options: GeneratorOptions = {}) => {
      const performanceOptions = options as {
        testName?: string;
        baseline?: {
          executionTime: number;
          memoryUsage: number;
          cpuUsage: number;
          networkLatency: number;
        };
        passed?: boolean;
      };
      return Array.from({ length: count }, (_, i) => ({
        id: this.generateId('perf'),
        testName: performanceOptions.testName ?? `performance-test-${i + 1}`,
        metrics: {
          executionTime: Math.floor(Math.random() * 1000) + 100,
          memoryUsage: Math.floor(Math.random() * 100) + 10,
          cpuUsage: Math.random() * 100,
          networkLatency: Math.floor(Math.random() * 50) + 10
        },
        timestamp: new Date().toISOString(),
        environment: this.config.environment,
        baseline: performanceOptions.baseline ?? {
          executionTime: 500,
          memoryUsage: 50,
          cpuUsage: 30,
          networkLatency: 20
        },
        passed: performanceOptions.passed !== false,
        testGenerated: true
      }));
    });

    // Error data generator
    this.registerGenerator('error', (count = 1, options: GeneratorOptions = {}) => {
      const errorTypes = [
        'ValidationError',
        'NetworkError',
        'AuthenticationError',
        'NotFoundError'
      ];
      const errorOptions = options as {
        name?: string;
        message?: string;
        code?: string;
        statusCode?: number;
        stack?: string;
        context?: Record<string, unknown>;
      };
      return Array.from({ length: count }, (_, i) => ({
        id: this.generateId('error'),
        name: errorOptions.name ?? errorTypes[i % errorTypes.length],
        message: errorOptions.message ?? `Test error message ${i + 1}`,
        code: errorOptions.code ?? `E${1000 + i}`,
        statusCode: errorOptions.statusCode ?? 400,
        stack: this.generateStackTrace(
          errorOptions.name ?? errorTypes[i % errorTypes.length]
        ),
        timestamp: new Date().toISOString(),
        context: errorOptions.context ?? {
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
  registerGenerator<T>(type: string, generator: TestDataGenerator<T>) {
    this.generators.set(type, generator);
  }

  /**
   * Generate test data of specified type
   */
  async generate<T = unknown>(request: TestDataRequest): Promise<T[]> {
    const { type, count = 1, seed, options = {}, constraints = {} } = request;

    // Use provided seed or current seed
    const useSeed = seed || this.currentSeed;
    this.seedRandom(useSeed);

    const cacheKey = this.getCacheKey(request);

    // Check cache first
    if (this.cache.has(cacheKey) && this.config.generation.deterministic) {
      return this.cache.get(cacheKey) as T[];
    }

    // Get generator
    const generator = this.generators.get(type) as TestDataGenerator<T> | undefined;
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
  ): Promise<Record<string, unknown[]>> {
    const results: Record<string, unknown[]> = {};

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
    data: Record<string, unknown>
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
    const cachedSnapshot = this.snapshots.get(snapshotId);
    if (cachedSnapshot) {
      return cachedSnapshot;
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
  getFixture<T = unknown>(category: string, name: string): T {
    const categoryFixtures = (fixtures as Record<string, Record<string, unknown>>)[category];
    if (!categoryFixtures) {
      throw new Error(`Fixture category not found: ${category}`);
    }

    const fixture = categoryFixtures[name];
    if (!fixture) {
      throw new Error(`Fixture not found: ${category}.${name}`);
    }

    if (typeof fixture === 'function') {
      return (fixture as () => T)();
    }

    return fixture as T;
  }

  /**
   * Create test database
   */
  async createTestDatabase(name: string, schema?: Record<string, unknown>): Promise<string> {
    const dbId = this.generateId('db');
    const dbPath = path.join(
      this.dataDirectory,
      'databases',
      `${name}_${dbId}.json`
    );

    const database = {
      id: dbId,
      name,
      schema: schema ?? {},
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
    tableData: Record<string, unknown[]>
  ): Promise<void> {
    const dbPath = path.join(this.dataDirectory, 'databases', `*_${dbId}.json`);
    const files = await this.globFiles(dbPath);

    if (files.length === 0) {
      throw new Error(`Database not found: ${dbId}`);
    }

    const database = JSON.parse(await fs.readFile(files[0], 'utf8')) as DatabaseFile;
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
  getStatistics(): {
    cacheSize: number;
    snapshotCount: number;
    generatorCount: number;
    currentSeed: number;
    environment: string;
    persistenceEnabled: boolean;
    dataDirectory: string;
  } {
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
    const exportData: ExportPayload = {
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

  private getFixtureGraph(type: string): GraphLike {
    switch (type) {
      case 'simple':
        return fixtures.graphs.simple as GraphLike;
      case 'branching':
        return fixtures.graphs.branching as GraphLike;
      case 'complex':
        return fixtures.graphs.complex as GraphLike;
      default:
        return fixtures.graphs.simple as GraphLike;
    }
  }

  private calculateGraphComplexity(graph: GraphLike): number {
    const nodeCount = graph.nodes.length;
    const edgeCount = graph.edges.length;
    const branchingFactor = edgeCount / Math.max(nodeCount - 1, 1);
    return Math.round(nodeCount * 0.5 + edgeCount * 0.3 + branchingFactor * 2);
  }

  private generateFileContent(type: string, options: GeneratorOptions): string {
    switch (type) {
      case 'json':
        return JSON.stringify(
          {
            test: true,
            data: 'data' in options ? options.data : 'sample'
          },
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

  private convertToCSV(data: ExportPayload): string {
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
  snapshot: (testSuite: string, data: Record<string, unknown>) =>
    getTestDataManager().createSnapshot(testSuite, data),

  /**
   * Clean up test data
   */
  cleanup: (options = {}) => getTestDataManager().cleanup(options)
};
