/**
 * Test Environment Manager
 *
 * Provides dynamic test environment provisioning, isolation, and management
 * for comprehensive testing infrastructure.
 *
 * Task: E18-1753114562152-28B905
 */

import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface TestEnvironmentConfig {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  isolation: 'none' | 'process' | 'container' | 'vm';
  resources: {
    cpu?: string;
    memory?: string;
    storage?: string;
    network?: boolean;
  };
  services: Array<{
    name: string;
    image?: string;
    port?: number;
    healthCheck?: string;
    environment?: Record<string, string>;
  }>;
  database?: {
    type: 'sqlite' | 'postgres' | 'redis';
    seedData?: string[];
    migrations?: string[];
  };
  timeout: number;
  cleanup: boolean;
}

export interface TestEnvironmentInstance {
  id: string;
  config: TestEnvironmentConfig;
  status:
    | 'provisioning'
    | 'ready'
    | 'running'
    | 'stopping'
    | 'stopped'
    | 'failed';
  startTime: Date;
  endTime?: Date;
  services: Map<string, ServiceInstance>;
  ports: Map<string, number>;
  processes: ChildProcess[];
  tempDirs: string[];
  healthChecks: Map<string, boolean>;
}

export interface ServiceInstance {
  name: string;
  process?: ChildProcess;
  containerId?: string;
  port?: number;
  healthCheckUrl?: string;
  status: 'starting' | 'ready' | 'failed' | 'stopped';
}

export class TestEnvironmentManager {
  private environments: Map<string, TestEnvironmentInstance> = new Map();
  private portPool: Set<number> = new Set();
  private readonly basePort = 3000;
  private readonly maxPort = 3100;

  constructor() {
    // Initialize port pool
    for (let port = this.basePort; port <= this.maxPort; port++) {
      this.portPool.add(port);
    }
  }

  /**
   * Create and provision a new test environment
   */
  async createEnvironment(
    config: TestEnvironmentConfig
  ): Promise<TestEnvironmentInstance> {
    const instance: TestEnvironmentInstance = {
      id: config.id,
      config,
      status: 'provisioning',
      startTime: new Date(),
      services: new Map(),
      ports: new Map(),
      processes: [],
      tempDirs: [],
      healthChecks: new Map()
    };

    this.environments.set(config.id, instance);

    try {
      // Create temporary directories
      await this.createTempDirectories(instance);

      // Set up database if specified
      if (config.database) {
        await this.setupDatabase(instance);
      }

      // Start services
      await this.startServices(instance);

      // Wait for health checks
      await this.waitForHealthChecks(instance);

      instance.status = 'ready';
      console.log(`✅ Test environment ${config.id} is ready`);

      // Schedule cleanup if configured
      if (config.cleanup && config.timeout > 0) {
        setTimeout(() => {
          this.destroyEnvironment(config.id).catch(console.error);
        }, config.timeout);
      }

      return instance;
    } catch (error) {
      instance.status = 'failed';
      await this.destroyEnvironment(config.id);
      throw error;
    }
  }

  /**
   * Get an existing environment instance
   */
  getEnvironment(id: string): TestEnvironmentInstance | undefined {
    return this.environments.get(id);
  }

  /**
   * List all environments
   */
  listEnvironments(): TestEnvironmentInstance[] {
    return Array.from(this.environments.values());
  }

  /**
   * Destroy a test environment and clean up resources
   */
  async destroyEnvironment(id: string): Promise<void> {
    const instance = this.environments.get(id);
    if (!instance) {
      return;
    }

    instance.status = 'stopping';

    try {
      // Stop all processes
      for (const process of instance.processes) {
        if (process && !process.killed) {
          process.kill('SIGTERM');

          // Force kill after 5 seconds
          setTimeout(() => {
            if (!process.killed) {
              process.kill('SIGKILL');
            }
          }, 5000);
        }
      }

      // Stop containers if using container isolation
      if (instance.config.isolation === 'container') {
        await this.stopContainers(instance);
      }

      // Clean up temporary directories
      await this.cleanupTempDirectories(instance);

      // Return ports to pool
      for (const port of instance.ports.values()) {
        this.portPool.add(port);
      }

      instance.status = 'stopped';
      instance.endTime = new Date();

      console.log(`🧹 Test environment ${id} cleaned up`);
    } catch (error) {
      console.error(`❌ Error cleaning up environment ${id}:`, error);
    } finally {
      this.environments.delete(id);
    }
  }

  /**
   * Health check for an environment
   */
  async checkEnvironmentHealth(id: string): Promise<boolean> {
    const instance = this.environments.get(id);
    if (!instance || instance.status !== 'ready') {
      return false;
    }

    for (const [serviceName, service] of instance.services.entries()) {
      if (service.healthCheckUrl) {
        try {
          const response = await fetch(service.healthCheckUrl);
          const isHealthy = response.ok;
          instance.healthChecks.set(serviceName, isHealthy);

          if (!isHealthy) {
            console.warn(`⚠️ Service ${serviceName} health check failed`);
            return false;
          }
        } catch (error) {
          console.error(`❌ Health check failed for ${serviceName}:`, error);
          instance.healthChecks.set(serviceName, false);
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Get environment metrics
   */
  getEnvironmentMetrics(id: string): {
    uptime: number;
    serviceCount: number;
    healthyServices: number;
    memoryUsage?: number;
    cpuUsage?: number;
  } | null {
    const instance = this.environments.get(id);
    if (!instance) {
      return null;
    }

    const uptime = Date.now() - instance.startTime.getTime();
    const serviceCount = instance.services.size;
    const healthyServices = Array.from(instance.healthChecks.values()).filter(
      Boolean
    ).length;

    return {
      uptime,
      serviceCount,
      healthyServices,
      // TODO: Add actual memory/CPU monitoring
      memoryUsage: undefined,
      cpuUsage: undefined
    };
  }

  private async createTempDirectories(
    instance: TestEnvironmentInstance
  ): Promise<void> {
    const tempDir = path.join(process.cwd(), 'temp', `test-env-${instance.id}`);
    await fs.mkdir(tempDir, { recursive: true });
    instance.tempDirs.push(tempDir);

    // Create subdirectories for different purposes
    const subdirs = ['data', 'logs', 'config', 'uploads'];
    for (const subdir of subdirs) {
      const subdirPath = path.join(tempDir, subdir);
      await fs.mkdir(subdirPath, { recursive: true });
    }
  }

  private async setupDatabase(
    instance: TestEnvironmentInstance
  ): Promise<void> {
    const { database } = instance.config;
    if (!database) return;

    switch (database.type) {
      case 'sqlite':
        await this.setupSQLiteDatabase(instance);
        break;
      case 'postgres':
        await this.setupPostgresDatabase(instance);
        break;
      case 'redis':
        await this.setupRedisDatabase(instance);
        break;
    }
  }

  private async setupSQLiteDatabase(
    instance: TestEnvironmentInstance
  ): Promise<void> {
    const tempDir = instance.tempDirs[0];
    const dbPath = path.join(tempDir, 'data', 'test.db');

    // Create database file
    await fs.writeFile(dbPath, '');

    // TODO: Run migrations and seed data
    console.log(`📦 SQLite database created at ${dbPath}`);
  }

  private async setupPostgresDatabase(
    instance: TestEnvironmentInstance
  ): Promise<void> {
    const port = this.allocatePort();
    if (!port) {
      throw new Error('No available ports for PostgreSQL');
    }

    // TODO: Start PostgreSQL container or process
    console.log(`🐘 PostgreSQL database starting on port ${port}`);
    instance.ports.set('postgres', port);
  }

  private async setupRedisDatabase(
    instance: TestEnvironmentInstance
  ): Promise<void> {
    const port = this.allocatePort();
    if (!port) {
      throw new Error('No available ports for Redis');
    }

    // TODO: Start Redis container or process
    console.log(`🔴 Redis database starting on port ${port}`);
    instance.ports.set('redis', port);
  }

  private async startServices(
    instance: TestEnvironmentInstance
  ): Promise<void> {
    for (const serviceConfig of instance.config.services) {
      const service: ServiceInstance = {
        name: serviceConfig.name,
        status: 'starting'
      };

      const port = serviceConfig.port || this.allocatePort();
      if (!port) {
        throw new Error(`No available port for service ${serviceConfig.name}`);
      }

      service.port = port;
      instance.ports.set(serviceConfig.name, port);

      // Start service based on isolation type
      switch (instance.config.isolation) {
        case 'process':
          await this.startServiceProcess(instance, service, serviceConfig);
          break;
        case 'container':
          await this.startServiceContainer(instance, service, serviceConfig);
          break;
        default:
          // No isolation - service runs in same process
          service.status = 'ready';
      }

      instance.services.set(serviceConfig.name, service);
    }
  }

  private async startServiceProcess(
    instance: TestEnvironmentInstance,
    service: ServiceInstance,
    config: any
  ): Promise<void> {
    // TODO: Start service as separate process
    console.log(`🚀 Starting service ${service.name} on port ${service.port}`);
    service.status = 'ready';
  }

  private async startServiceContainer(
    instance: TestEnvironmentInstance,
    service: ServiceInstance,
    config: any
  ): Promise<void> {
    // TODO: Start service in container
    console.log(
      `🐳 Starting container for ${service.name} on port ${service.port}`
    );
    service.status = 'ready';
  }

  private async waitForHealthChecks(
    instance: TestEnvironmentInstance
  ): Promise<void> {
    const timeout = 30000; // 30 seconds
    const interval = 1000; // 1 second
    const maxAttempts = timeout / interval;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      let allHealthy = true;

      for (const [serviceName, service] of instance.services.entries()) {
        if (service.healthCheckUrl) {
          try {
            const response = await fetch(service.healthCheckUrl);
            const isHealthy = response.ok;
            instance.healthChecks.set(serviceName, isHealthy);

            if (!isHealthy) {
              allHealthy = false;
            }
          } catch (error) {
            allHealthy = false;
          }
        }
      }

      if (allHealthy) {
        return;
      }

      await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error('Health checks timed out');
  }

  private async stopContainers(
    instance: TestEnvironmentInstance
  ): Promise<void> {
    // TODO: Implement container cleanup
    console.log(`🛑 Stopping containers for environment ${instance.id}`);
  }

  private async cleanupTempDirectories(
    instance: TestEnvironmentInstance
  ): Promise<void> {
    for (const tempDir of instance.tempDirs) {
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch (error) {
        console.error(`Error cleaning up ${tempDir}:`, error);
      }
    }
  }

  private allocatePort(): number | null {
    const availablePorts = Array.from(this.portPool);
    if (availablePorts.length === 0) {
      return null;
    }

    const port = availablePorts[0];
    this.portPool.delete(port);
    return port;
  }

  /**
   * Clean up all environments (for graceful shutdown)
   */
  async destroyAllEnvironments(): Promise<void> {
    const environmentIds = Array.from(this.environments.keys());
    await Promise.all(environmentIds.map(id => this.destroyEnvironment(id)));
  }
}

/**
 * Pre-configured environment templates
 */
export const EnvironmentTemplates = {
  unit: (): TestEnvironmentConfig => ({
    id: `unit-${Date.now()}`,
    name: 'Unit Test Environment',
    type: 'unit',
    isolation: 'none',
    resources: {},
    services: [],
    timeout: 300000, // 5 minutes
    cleanup: true
  }),

  integration: (): TestEnvironmentConfig => ({
    id: `integration-${Date.now()}`,
    name: 'Integration Test Environment',
    type: 'integration',
    isolation: 'process',
    resources: {
      memory: '512MB'
    },
    services: [
      {
        name: 'test-server',
        port: 8080,
        healthCheck: 'http://localhost:8080/health'
      }
    ],
    database: {
      type: 'sqlite',
      seedData: ['test-data.sql']
    },
    timeout: 900000, // 15 minutes
    cleanup: true
  }),

  e2e: (): TestEnvironmentConfig => ({
    id: `e2e-${Date.now()}`,
    name: 'End-to-End Test Environment',
    type: 'e2e',
    isolation: 'container',
    resources: {
      cpu: '1',
      memory: '1GB',
      network: true
    },
    services: [
      {
        name: 'web-app',
        port: 3000,
        healthCheck: 'http://localhost:3000'
      },
      {
        name: 'api-server',
        port: 8000,
        healthCheck: 'http://localhost:8000/api/health'
      }
    ],
    database: {
      type: 'postgres',
      migrations: ['migrations/*.sql'],
      seedData: ['e2e-test-data.sql']
    },
    timeout: 1800000, // 30 minutes
    cleanup: true
  }),

  performance: (): TestEnvironmentConfig => ({
    id: `performance-${Date.now()}`,
    name: 'Performance Test Environment',
    type: 'performance',
    isolation: 'container',
    resources: {
      cpu: '2',
      memory: '2GB',
      network: true
    },
    services: [
      {
        name: 'app-under-test',
        port: 3000,
        healthCheck: 'http://localhost:3000/health'
      },
      {
        name: 'load-generator',
        port: 8080
      }
    ],
    database: {
      type: 'postgres',
      seedData: ['performance-test-data.sql']
    },
    timeout: 3600000, // 1 hour
    cleanup: true
  })
};

export default TestEnvironmentManager;
