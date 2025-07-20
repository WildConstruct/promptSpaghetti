/**
 * Timeout Manager Integration Helpers
 * 
 * Provides pre-configured integration points for different services
 * with timeout management, retry logic, and graceful degradation.
 */

import { Database } from 'better-sqlite3';
import { RedisService } from '../auth/database/RedisService';
import { getTimeoutManager, OperationResult } from './TimeoutManager';
import nodemailer from 'nodemailer';
import fetch, { Response } from 'node-fetch';
import { createWriteStream, createReadStream } from 'fs';
import { pipeline } from 'stream/promises';

/**
 * Database Integration
 */
export class DatabaseTimeoutIntegration {
  private timeoutManager = getTimeoutManager();

  constructor(private db: Database) {}

  /**
   * Execute database query with timeout and retry
   */
  async query<T = any>(
    sql: string,
    params?: any[],
    operationId?: string
  ): Promise<OperationResult<T[]>> {
    return this.timeoutManager.executeWithTimeout(
      async () => {
        const stmt = this.db.prepare(sql);
        return params ? stmt.all(...params) : stmt.all();
      },
      'database',
      'query',
      operationId
    );
  }

  /**
   * Execute database query with fallback to read replica
   */
  async queryWithFallback<T = any>(
    sql: string,
    params?: any[],
    readOnlyDb?: Database
  ): Promise<OperationResult<T[]>> {
    if (!readOnlyDb) {
      return this.query(sql, params);
    }

    return this.timeoutManager.executeWithFallback(
      async () => {
        const stmt = this.db.prepare(sql);
        return params ? stmt.all(...params) : stmt.all();
      },
      async () => {
        const stmt = readOnlyDb.prepare(sql);
        return params ? stmt.all(...params) : stmt.all();
      },
      'database',
      'query'
    );
  }

  /**
   * Execute transaction with timeout
   */
  async transaction<T>(
    operation: (db: Database) => T,
    operationId?: string
  ): Promise<OperationResult<T>> {
    return this.timeoutManager.executeWithTimeout(
      async () => {
        return this.db.transaction(operation)();
      },
      'database',
      'transaction',
      operationId
    );
  }

  /**
   * Run database migrations with extended timeout
   */
  async runMigration(
    migrationSql: string,
    operationId?: string
  ): Promise<OperationResult<void>> {
    return this.timeoutManager.executeWithTimeout(
      async () => {
        this.db.exec(migrationSql);
      },
      'database',
      'migration',
      operationId
    );
  }
}

/**
 * Redis Integration
 */
export class RedisTimeoutIntegration {
  private timeoutManager = getTimeoutManager();

  constructor(private redis: RedisService) {}

  /**
   * Redis operation with timeout and retry
   */
  async operation<T>(
    operation: (redis: RedisService) => Promise<T>,
    operationId?: string
  ): Promise<OperationResult<T>> {
    return this.timeoutManager.executeWithTimeout(
      () => operation(this.redis),
      'redis',
      'operation',
      operationId
    );
  }

  /**
   * Redis pipeline with timeout
   */
  async pipeline(
    operations: (redis: RedisService) => Promise<any>,
    operationId?: string
  ): Promise<OperationResult<any>> {
    return this.timeoutManager.executeWithTimeout(
      () => operations(this.redis),
      'redis',
      'pipeline',
      operationId
    );
  }

  /**
   * Redis publish with timeout
   */
  async publish(
    channel: string,
    message: string,
    operationId?: string
  ): Promise<OperationResult<number>> {
    return this.timeoutManager.executeWithTimeout(
      async () => {
        const client = this.redis.getClient();
        return client.publish(channel, message);
      },
      'redis',
      'publish',
      operationId
    );
  }

  /**
   * Cache operation with fallback to in-memory
   */
  async cacheWithFallback<T>(
    key: string,
    getValue: () => Promise<T>,
    ttl: number,
    inMemoryCache?: Map<string, { value: T; expires: number }>
  ): Promise<OperationResult<T>> {
    return this.timeoutManager.executeWithFallback(
      async () => {
        // Try to get from Redis first
        const cached = await this.redis.getCache(key);
        if (cached) return cached;

        // Generate value and cache it
        const value = await getValue();
        await this.redis.cache(key, value, ttl);
        return value;
      },
      async () => {
        // Fallback to in-memory cache
        if (inMemoryCache) {
          const cached = inMemoryCache.get(key);
          if (cached && cached.expires > Date.now()) {
            return cached.value;
          }
        }

        // Generate value and cache in memory
        const value = await getValue();
        if (inMemoryCache) {
          inMemoryCache.set(key, {
            value,
            expires: Date.now() + ttl * 1000
          });
        }
        return value;
      },
      'redis',
      'operation'
    );
  }
}

/**
 * Authentication Integration
 */
export class AuthTimeoutIntegration {
  private timeoutManager = getTimeoutManager();

  /**
   * Login operation with timeout
   */
  async login(
    loginOperation: () => Promise<any>,
    operationId?: string
  ): Promise<OperationResult<any>> {
    return this.timeoutManager.executeWithTimeout(
      loginOperation,
      'auth',
      'login',
      operationId
    );
  }

  /**
   * Registration with timeout
   */
  async register(
    registerOperation: () => Promise<any>,
    operationId?: string
  ): Promise<OperationResult<any>> {
    return this.timeoutManager.executeWithTimeout(
      registerOperation,
      'auth',
      'register',
      operationId
    );
  }

  /**
   * Password reset with timeout
   */
  async passwordReset(
    resetOperation: () => Promise<any>,
    operationId?: string
  ): Promise<OperationResult<any>> {
    return this.timeoutManager.executeWithTimeout(
      resetOperation,
      'auth',
      'passwordReset',
      operationId
    );
  }

  /**
   * Token refresh with timeout
   */
  async refreshToken(
    refreshOperation: () => Promise<any>,
    operationId?: string
  ): Promise<OperationResult<any>> {
    return this.timeoutManager.executeWithTimeout(
      refreshOperation,
      'auth',
      'tokenRefresh',
      operationId
    );
  }

  /**
   * CAPTCHA verification with timeout
   */
  async verifyCaptcha(
    captchaToken: string,
    verifyOperation: (token: string) => Promise<boolean>,
    operationId?: string
  ): Promise<OperationResult<boolean>> {
    return this.timeoutManager.executeWithTimeout(
      () => verifyOperation(captchaToken),
      'auth',
      'captcha',
      operationId
    );
  }

  /**
   * Two-factor authentication with timeout
   */
  async verifyTwoFactor(
    verifyOperation: () => Promise<boolean>,
    operationId?: string
  ): Promise<OperationResult<boolean>> {
    return this.timeoutManager.executeWithTimeout(
      verifyOperation,
      'auth',
      'twoFactor',
      operationId
    );
  }
}

/**
 * File Operations Integration
 */
export class FileTimeoutIntegration {
  private timeoutManager = getTimeoutManager();

  /**
   * File upload with timeout and progress tracking
   */
  async upload(
    uploadOperation: () => Promise<any>,
    operationId?: string
  ): Promise<OperationResult<any>> {
    return this.timeoutManager.executeWithTimeout(
      uploadOperation,
      'file',
      'upload',
      operationId
    );
  }

  /**
   * File download with timeout
   */
  async download(
    url: string,
    destinationPath: string,
    operationId?: string
  ): Promise<OperationResult<void>> {
    return this.timeoutManager.executeWithTimeout(
      async () => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Download failed: ${response.statusText}`);
        }
        
        if (response.body) {
          await pipeline(
            response.body,
            createWriteStream(destinationPath)
          );
        }
      },
      'file',
      'download',
      operationId
    );
  }

  /**
   * File processing with timeout
   */
  async process(
    processingOperation: () => Promise<any>,
    operationId?: string
  ): Promise<OperationResult<any>> {
    return this.timeoutManager.executeWithTimeout(
      processingOperation,
      'file',
      'processing',
      operationId
    );
  }

  /**
   * File validation with timeout
   */
  async validate(
    validationOperation: () => Promise<boolean>,
    operationId?: string
  ): Promise<OperationResult<boolean>> {
    return this.timeoutManager.executeWithTimeout(
      validationOperation,
      'file',
      'validation',
      operationId
    );
  }
}

/**
 * Email Integration
 */
export class EmailTimeoutIntegration {
  private timeoutManager = getTimeoutManager();

  constructor(private transporter: nodemailer.Transporter) {}

  /**
   * Send email with timeout and retry
   */
  async sendEmail(
    emailOptions: nodemailer.SendMailOptions,
    operationId?: string
  ): Promise<OperationResult<nodemailer.SentMessageInfo>> {
    return this.timeoutManager.executeWithTimeout(
      () => this.transporter.sendMail(emailOptions),
      'email',
      'send',
      operationId
    );
  }

  /**
   * Verify email configuration with timeout
   */
  async verify(operationId?: string): Promise<OperationResult<boolean>> {
    return this.timeoutManager.executeWithTimeout(
      () => this.transporter.verify(),
      'email',
      'verify',
      operationId
    );
  }

  /**
   * Send email with fallback to different transporter
   */
  async sendWithFallback(
    emailOptions: nodemailer.SendMailOptions,
    fallbackTransporter?: nodemailer.Transporter
  ): Promise<OperationResult<nodemailer.SentMessageInfo>> {
    if (!fallbackTransporter) {
      return this.sendEmail(emailOptions);
    }

    return this.timeoutManager.executeWithFallback(
      () => this.transporter.sendMail(emailOptions),
      () => fallbackTransporter.sendMail(emailOptions),
      'email',
      'send'
    );
  }
}

/**
 * External API Integration
 */
export class APITimeoutIntegration {
  private timeoutManager = getTimeoutManager();

  /**
   * API call with timeout and retry
   */
  async apiCall<T>(
    url: string,
    options: RequestInit = {},
    apiType: 'authentication' | 'webhook' | 'notification' | 'export' = 'authentication',
    operationId?: string
  ): Promise<OperationResult<T>> {
    return this.timeoutManager.executeWithTimeout(
      async () => {
        const response = await fetch(url, options);
        
        if (!response.ok) {
          throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }
        
        return response.json() as T;
      },
      'api',
      apiType,
      operationId
    );
  }

  /**
   * Webhook call with timeout
   */
  async webhook(
    url: string,
    payload: any,
    operationId?: string
  ): Promise<OperationResult<any>> {
    return this.apiCall(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      },
      'webhook',
      operationId
    );
  }

  /**
   * Notification API call with fallback
   */
  async notificationWithFallback(
    primaryUrl: string,
    fallbackUrl: string,
    payload: any
  ): Promise<OperationResult<any>> {
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    };

    return this.timeoutManager.executeWithFallback(
      async () => {
        const response = await fetch(primaryUrl, options);
        if (!response.ok) {
          throw new Error(`Notification failed: ${response.statusText}`);
        }
        return response.json();
      },
      async () => {
        const response = await fetch(fallbackUrl, options);
        if (!response.ok) {
          throw new Error(`Fallback notification failed: ${response.statusText}`);
        }
        return response.json();
      },
      'api',
      'notification'
    );
  }
}

/**
 * Health Check Integration
 */
export class HealthCheckTimeoutIntegration {
  private timeoutManager = getTimeoutManager();

  /**
   * Database health check with timeout
   */
  async checkDatabase(db: Database): Promise<OperationResult<boolean>> {
    return this.timeoutManager.executeWithTimeout(
      async () => {
        const result = db.prepare('SELECT 1 as test').get() as { test: number };
        return result.test === 1;
      },
      'database',
      'query',
      'health_check_db'
    );
  }

  /**
   * Redis health check with timeout
   */
  async checkRedis(redis: RedisService): Promise<OperationResult<boolean>> {
    return this.timeoutManager.executeWithTimeout(
      () => redis.healthCheck(),
      'redis',
      'operation',
      'health_check_redis'
    );
  }

  /**
   * External service health check
   */
  async checkExternalService(url: string): Promise<OperationResult<boolean>> {
    return this.timeoutManager.executeWithTimeout(
      async () => {
        const response = await fetch(`${url}/health`);
        return response.ok;
      },
      'api',
      'authentication',
      'health_check_external'
    );
  }

  /**
   * Comprehensive health check
   */
  async comprehensiveHealthCheck(
    db: Database,
    redis: RedisService,
    externalServices: string[] = []
  ): Promise<{
    overall: boolean;
    database: OperationResult<boolean>;
    redis: OperationResult<boolean>;
    externalServices: { [url: string]: OperationResult<boolean> };
    timeoutManagerHealth: any;
  }> {
    const [dbResult, redisResult] = await Promise.all([
      this.checkDatabase(db),
      this.checkRedis(redis)
    ]);

    const externalResults: { [url: string]: OperationResult<boolean> } = {};
    
    for (const serviceUrl of externalServices) {
      externalResults[serviceUrl] = await this.checkExternalService(serviceUrl);
    }

    const overall = dbResult.success && 
                   redisResult.success && 
                   Object.values(externalResults).every(result => result.success);

    return {
      overall,
      database: dbResult,
      redis: redisResult,
      externalServices: externalResults,
      timeoutManagerHealth: this.timeoutManager.getHealthStatus()
    };
  }
}

// Export factory functions for easy integration
export function createDatabaseIntegration(db: Database): DatabaseTimeoutIntegration {
  return new DatabaseTimeoutIntegration(db);
}

export function createRedisIntegration(redis: RedisService): RedisTimeoutIntegration {
  return new RedisTimeoutIntegration(redis);
}

export function createAuthIntegration(): AuthTimeoutIntegration {
  return new AuthTimeoutIntegration();
}

export function createFileIntegration(): FileTimeoutIntegration {
  return new FileTimeoutIntegration();
}

export function createEmailIntegration(transporter: nodemailer.Transporter): EmailTimeoutIntegration {
  return new EmailTimeoutIntegration(transporter);
}

export function createAPIIntegration(): APITimeoutIntegration {
  return new APITimeoutIntegration();
}

export function createHealthCheckIntegration(): HealthCheckTimeoutIntegration {
  return new HealthCheckTimeoutIntegration();
}