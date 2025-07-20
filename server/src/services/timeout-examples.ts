/**
 * Timeout Service Integration Examples
 * 
 * This file demonstrates how to integrate the TimeoutManager service
 * with existing code in the application, showing practical usage patterns
 * and best practices.
 */

import { Database } from 'better-sqlite3';
import { RedisService } from '../auth/database/RedisService';
import { getTimeoutManager } from './TimeoutManager';
import {
  DatabaseTimeoutIntegration,
  RedisTimeoutIntegration,
  AuthTimeoutIntegration,
  FileTimeoutIntegration,
  EmailTimeoutIntegration,
  APITimeoutIntegration,
  HealthCheckTimeoutIntegration,
  createDatabaseIntegration,
  createRedisIntegration,
  createAuthIntegration,
  createFileIntegration,
  createEmailIntegration,
  createAPIIntegration,
  createHealthCheckIntegration
} from './timeout-integrations';
import {
  withDatabaseTimeout,
  withRedisTimeout,
  withAPITimeout,
  withAuthTimeout,
  withFileTimeout,
  withEmailTimeout
} from '../middleware/timeout-middleware';
import nodemailer from 'nodemailer';

/**
 * Example 1: Database Operations with Timeout
 */
export class WorkspaceServiceWithTimeout {
  private dbIntegration: DatabaseTimeoutIntegration;

  constructor(private db: Database) {
    this.dbIntegration = createDatabaseIntegration(db);
  }

  // Original method without timeout handling
  async getWorkspaceOriginal(workspaceId: number) {
    const stmt = this.db.prepare('SELECT * FROM workspaces WHERE id = ?');
    return stmt.get(workspaceId);
  }

  // Enhanced method with timeout handling
  async getWorkspace(workspaceId: number) {
    const result = await this.dbIntegration.query(
      'SELECT * FROM workspaces WHERE id = ?',
      [workspaceId],
      `get_workspace_${workspaceId}`
    );

    if (!result.success) {
      throw new Error(`Failed to get workspace: ${result.error?.message}`);
    }

    return result.data?.[0];
  }

  // Transaction with timeout and fallback
  async createWorkspaceWithFallback(workspaceData: any, readOnlyDb?: Database) {
    const result = await this.dbIntegration.queryWithFallback(
      'INSERT INTO workspaces (name, description, created_at) VALUES (?, ?, ?)',
      [workspaceData.name, workspaceData.description, new Date().toISOString()],
      readOnlyDb
    );

    if (!result.success) {
      throw new Error(`Failed to create workspace: ${result.error?.message}`);
    }

    return result.data;
  }

  // Complex transaction with timeout
  async updateWorkspaceWithHistory(workspaceId: number, updates: any) {
    const result = await this.dbIntegration.transaction(
      (db) => {
        // Insert history record
        const historyStmt = db.prepare(`
          INSERT INTO workspace_history (workspace_id, changes, updated_at) 
          VALUES (?, ?, ?)
        `);
        historyStmt.run(workspaceId, JSON.stringify(updates), new Date().toISOString());

        // Update workspace
        const updateStmt = db.prepare(`
          UPDATE workspaces 
          SET name = COALESCE(?, name), 
              description = COALESCE(?, description),
              updated_at = ?
          WHERE id = ?
        `);
        return updateStmt.run(updates.name, updates.description, new Date().toISOString(), workspaceId);
      },
      `update_workspace_${workspaceId}`
    );

    if (!result.success) {
      throw new Error(`Failed to update workspace: ${result.error?.message}`);
    }

    return result.data;
  }
}

/**
 * Example 2: Redis Operations with Timeout
 */
export class CacheServiceWithTimeout {
  private redisIntegration: RedisTimeoutIntegration;
  private inMemoryCache = new Map<string, { value: any; expires: number }>();

  constructor(private redis: RedisService) {
    this.redisIntegration = createRedisIntegration(redis);
  }

  // Cache with Redis fallback to in-memory
  async getCachedData(key: string, generator: () => Promise<any>, ttl: number = 3600) {
    const result = await this.redisIntegration.cacheWithFallback(
      key,
      generator,
      ttl,
      this.inMemoryCache
    );

    if (!result.success) {
      console.warn(`Cache operation failed: ${result.error?.message}`);
      // Fallback to direct generation
      return generator();
    }

    return result.data;
  }

  // Publish with timeout
  async publishEvent(event: string, data: any) {
    const result = await this.redisIntegration.publish(
      'events',
      JSON.stringify({ event, data, timestamp: Date.now() }),
      `publish_${event}_${Date.now()}`
    );

    if (!result.success) {
      console.error(`Failed to publish event: ${result.error?.message}`);
      // Could implement local event handling as fallback
    }

    return result.success;
  }
}

/**
 * Example 3: Authentication with Timeout
 */
export class AuthServiceWithTimeout {
  private authIntegration: AuthTimeoutIntegration;

  constructor() {
    this.authIntegration = createAuthIntegration();
  }

  // Login with timeout
  @withAuthTimeout('login')
  async login(username: string, password: string) {
    // Simulate authentication logic
    await this.simulateAuthDelay(2000);
    
    if (username === 'admin' && password === 'password') {
      return { token: 'jwt-token', user: { id: 1, username } };
    }
    
    throw new Error('Invalid credentials');
  }

  // CAPTCHA verification with timeout
  async verifyCaptcha(token: string) {
    const result = await this.authIntegration.verifyCaptcha(
      token,
      async (captchaToken) => {
        // Simulate external CAPTCHA verification
        await this.simulateAuthDelay(1000);
        return captchaToken.length > 10; // Simple validation
      },
      `captcha_${token.substring(0, 8)}`
    );

    if (!result.success) {
      throw new Error(`CAPTCHA verification failed: ${result.error?.message}`);
    }

    return result.data;
  }

  private simulateAuthDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Example 4: File Operations with Timeout
 */
export class FileServiceWithTimeout {
  private fileIntegration: FileTimeoutIntegration;

  constructor() {
    this.fileIntegration = createFileIntegration();
  }

  // File upload with timeout
  @withFileTimeout('upload')
  async uploadFile(file: any, destination: string) {
    // Simulate file upload
    await this.simulateFileOperation(5000);
    return { path: destination, size: file.size, uploaded: true };
  }

  // File processing with timeout
  async processFile(filePath: string) {
    const result = await this.fileIntegration.process(
      async () => {
        // Simulate intensive file processing
        await this.simulateFileOperation(10000);
        return { processed: true, outputPath: `${filePath}.processed` };
      },
      `process_${filePath.split('/').pop()}`
    );

    if (!result.success) {
      throw new Error(`File processing failed: ${result.error?.message}`);
    }

    return result.data;
  }

  private simulateFileOperation(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Example 5: Email Operations with Timeout
 */
export class EmailServiceWithTimeout {
  private emailIntegration: EmailTimeoutIntegration;
  private fallbackTransporter?: nodemailer.Transporter;

  constructor(
    private transporter: nodemailer.Transporter,
    fallbackTransporter?: nodemailer.Transporter
  ) {
    this.emailIntegration = createEmailIntegration(transporter);
    this.fallbackTransporter = fallbackTransporter;
  }

  // Send email with timeout and fallback
  async sendNotificationEmail(to: string, subject: string, content: string) {
    const emailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@example.com',
      to,
      subject,
      html: content
    };

    const result = await this.emailIntegration.sendWithFallback(
      emailOptions,
      this.fallbackTransporter
    );

    if (!result.success) {
      throw new Error(`Email sending failed: ${result.error?.message}`);
    }

    return result.data;
  }

  // Email verification with timeout
  @withEmailTimeout('verify')
  async verifyEmailConnection() {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email verification failed:', error);
      return false;
    }
  }
}

/**
 * Example 6: External API with Timeout
 */
export class ExternalAPIServiceWithTimeout {
  private apiIntegration: APITimeoutIntegration;

  constructor() {
    this.apiIntegration = createAPIIntegration();
  }

  // Webhook with timeout
  async sendWebhook(url: string, payload: any) {
    const result = await this.apiIntegration.webhook(
      url,
      payload,
      `webhook_${Date.now()}`
    );

    if (!result.success) {
      throw new Error(`Webhook failed: ${result.error?.message}`);
    }

    return result.data;
  }

  // API call with fallback endpoints
  async fetchUserData(userId: number) {
    const primaryUrl = `${process.env.PRIMARY_API_URL}/users/${userId}`;
    const fallbackUrl = `${process.env.FALLBACK_API_URL}/users/${userId}`;

    const result = await this.apiIntegration.notificationWithFallback(
      primaryUrl,
      fallbackUrl,
      { userId }
    );

    if (!result.success) {
      throw new Error(`Failed to fetch user data: ${result.error?.message}`);
    }

    return result.data;
  }
}

/**
 * Example 7: Health Check with Timeout
 */
export class HealthCheckServiceWithTimeout {
  private healthIntegration: HealthCheckTimeoutIntegration;

  constructor() {
    this.healthIntegration = createHealthCheckIntegration();
  }

  // Comprehensive health check
  async performHealthCheck(
    db: Database,
    redis: RedisService,
    externalServices: string[] = []
  ) {
    const result = await this.healthIntegration.comprehensiveHealthCheck(
      db,
      redis,
      externalServices
    );

    return {
      status: result.overall ? 'healthy' : 'unhealthy',
      components: {
        database: {
          status: result.database.success ? 'healthy' : 'unhealthy',
          responseTime: result.database.totalTime,
          error: result.database.error?.message
        },
        redis: {
          status: result.redis.success ? 'healthy' : 'unhealthy',
          responseTime: result.redis.totalTime,
          error: result.redis.error?.message
        },
        externalServices: Object.entries(result.externalServices).reduce((acc, [url, result]) => {
          acc[url] = {
            status: result.success ? 'healthy' : 'unhealthy',
            responseTime: result.totalTime,
            error: result.error?.message
          };
          return acc;
        }, {} as any)
      },
      timeoutManager: result.timeoutManagerHealth
    };
  }
}

/**
 * Example 8: Manual Timeout Usage
 */
export class ManualTimeoutExample {
  private timeoutManager = getTimeoutManager();

  // Manual timeout usage for custom operations
  async customDatabaseOperation(query: string) {
    const result = await this.timeoutManager.executeWithTimeout(
      async () => {
        // Custom database operation
        await this.simulateOperation(3000);
        return { rows: [], affectedRows: 0 };
      },
      'database',
      'query',
      `custom_query_${Date.now()}`
    );

    if (!result.success) {
      console.error('Custom operation failed:', result.error?.message);
      throw result.error;
    }

    return result.data;
  }

  // Operation with fallback
  async primaryWithFallback() {
    const result = await this.timeoutManager.executeWithFallback(
      async () => {
        // Primary operation that might fail
        await this.simulateOperation(5000);
        throw new Error('Primary failed');
      },
      async () => {
        // Fallback operation
        await this.simulateOperation(1000);
        return { fallback: true, data: 'fallback data' };
      },
      'api',
      'authentication'
    );

    return result.data;
  }

  private simulateOperation(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Example 9: Fastify Route Integration
 */
export function exampleRouteWithTimeout(fastify: any) {
  // Using middleware decorators
  fastify.get('/example/workspace/:id', async (request: any, reply: any) => {
    // The middleware automatically provides timeout context
    const result = await request.executeWithTimeout(async () => {
      // Your business logic here
      const workspaceService = new WorkspaceServiceWithTimeout(request.db);
      return workspaceService.getWorkspace(request.params.id);
    });

    if (!result.success) {
      reply.status(500).send({
        error: 'Workspace fetch failed',
        message: result.error?.message,
        timedOut: result.timedOut,
        circuitBreakerOpen: result.circuitBreakerOpen
      });
      return;
    }

    return result.data;
  });

  // Using fallback
  fastify.get('/example/data/:id', async (request: any, reply: any) => {
    const result = await request.executeWithFallback(
      async () => {
        // Primary data source
        return { primary: true, data: 'primary data' };
      },
      async () => {
        // Fallback data source
        return { primary: false, data: 'fallback data' };
      }
    );

    return result.data;
  });
}

/**
 * Example 10: Configuration-based Usage
 */
export function setupTimeoutManagerWithConfig() {
  // Custom timeout configuration
  const customConfig = {
    database: {
      query: 15000, // 15 seconds for queries
      transaction: 45000 // 45 seconds for transactions
    },
    redis: {
      operation: 8000 // 8 seconds for Redis operations
    },
    api: {
      webhook: 20000 // 20 seconds for webhooks
    }
  };

  // Custom retry configuration
  const retryConfig = {
    maxRetries: 5,
    baseDelay: 2000,
    maxDelay: 60000,
    backoffMultiplier: 2.5,
    jitterEnabled: true
  };

  // Custom circuit breaker configuration
  const circuitBreakerConfig = {
    failureThreshold: 3,
    resetTimeout: 30000,
    monitoringPeriod: 120000
  };

  // Initialize with custom configuration
  return {
    timeoutManager: getTimeoutManager(),
    customConfig,
    retryConfig,
    circuitBreakerConfig
  };
}