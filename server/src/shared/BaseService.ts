import { EventEmitter } from 'events';
import { DatabaseService } from '../auth/database/DatabaseService';
import { RedisService } from '../auth/database/RedisService';
import { AuditService } from '../auth/services/AuditService';
import { Logger } from '../utils/logger';

/**
 * Base service class that provides common dependencies and functionality
 * for all services in the application. This eliminates duplicate imports
 * and provides a consistent interface for service implementation.
 */
export abstract class BaseService extends EventEmitter {
  protected db: DatabaseService;
  protected redis: RedisService;
  protected audit: AuditService;
  protected logger: Logger;

  constructor() {
    super();
    this.db = DatabaseService.getInstance();
    this.redis = RedisService.getInstance();
    this.audit = AuditService.getInstance();
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * Initialize the service. Override in subclasses for custom initialization.
   */
  async initialize(): Promise<void> {
    this.logger.info(`Initializing ${this.constructor.name}`);
  }

  /**
   * Cleanup resources. Override in subclasses for custom cleanup.
   */
  async cleanup(): Promise<void> {
    this.logger.info(`Cleaning up ${this.constructor.name}`);
    this.removeAllListeners();
  }

  /**
   * Log an audit event with consistent formatting
   */
  protected async logAudit(
    action: string,
    userId: string,
    details: Record<string, any>
  ): Promise<void> {
    await this.audit.log({
      service: this.constructor.name,
      action,
      userId,
      details,
      timestamp: new Date()
    });
  }

  /**
   * Execute a database transaction with automatic rollback on error
   */
  protected async withTransaction<T>(
    callback: (trx: any) => Promise<T>
  ): Promise<T> {
    const trx = await this.db.transaction();
    try {
      const result = await callback(trx);
      await trx.commit();
      return result;
    } catch (error) {
      await trx.rollback();
      this.logger.error('Transaction failed', error);
      throw error;
    }
  }

  /**
   * Cache a value with automatic serialization
   */
  protected async cacheSet(
    key: string,
    value: any,
    ttl?: number
  ): Promise<void> {
    const cacheKey = `${this.constructor.name}:${key}`;
    await this.redis.set(cacheKey, JSON.stringify(value), ttl);
  }

  /**
   * Get a cached value with automatic deserialization
   */
  protected async cacheGet<T>(key: string): Promise<T | null> {
    const cacheKey = `${this.constructor.name}:${key}`;
    const value = await this.redis.get(cacheKey);
    return value ? JSON.parse(value) : null;
  }

  /**
   * Invalidate cache entries
   */
  protected async cacheInvalidate(pattern: string): Promise<void> {
    const cachePattern = `${this.constructor.name}:${pattern}`;
    await this.redis.deletePattern(cachePattern);
  }

  /**
   * Handle errors consistently across services
   */
  protected handleError(error: Error, context?: string): void {
    const errorContext = context || 'Unknown operation';
    this.logger.error(`Error in ${errorContext}`, {
      service: this.constructor.name,
      error: error.message,
      stack: error.stack
    });
    this.emit('error', { error, context: errorContext });
  }
}

/**
 * Interface for services that require singleton pattern
 */
export interface SingletonService {
  getInstance(): BaseService;
}

/**
 * Decorator to make a service a singleton
 */
export function Singleton<T extends { new(...args: any[]): {} }>(constructor: T) {
  let instance: T;
  
  return class extends constructor {
    constructor(...args: any[]) {
      if (instance) {
        return instance as any;
      }
      super(...args);
      instance = this as any;
    }
    
    static getInstance() {
      if (!instance) {
        instance = new this() as T;
      }
      return instance;
    }
  };
}