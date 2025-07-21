/**
 * SMS Rate Limiting Service
 * 
 * Comprehensive rate limiting system for SMS sends with multiple algorithms,
 * queue management, and monitoring capabilities.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 * Task: E19-1753114711634-951867 - Implement rate limiting for SMS sends
 */

import { EventEmitter } from 'events';

// Rate limiting algorithms
export enum RateLimitAlgorithm {
  TOKEN_BUCKET = 'token_bucket',
  SLIDING_WINDOW = 'sliding_window',
  FIXED_WINDOW = 'fixed_window',
  LEAKY_BUCKET = 'leaky_bucket',
  ADAPTIVE = 'adaptive'
}

// Rate limit scopes
export enum RateLimitScope {
  GLOBAL = 'global',
  PER_USER = 'per_user',
  PER_PHONE = 'per_phone',
  PER_IP = 'per_ip',
  PER_TENANT = 'per_tenant',
  PER_MESSAGE_TYPE = 'per_message_type'
}

// SMS message types with different priority levels
export enum SMSMessageType {
  SECURITY_ALERT = 'security_alert',           // Highest priority - 2FA, security breaches
  VERIFICATION = 'verification',               // High priority - email/phone verification
  AUTHENTICATION = 'authentication',          // High priority - login codes
  NOTIFICATION = 'notification',              // Medium priority - general notifications
  MARKETING = 'marketing',                    // Low priority - promotional messages
  REMINDER = 'reminder',                      // Low priority - appointment reminders
  SUPPORT = 'support',                        // Medium priority - support communications
  SYSTEM_ALERT = 'system_alert'              // Highest priority - critical system alerts
}

// Rate limit configuration
export interface RateLimitConfig {
  algorithm: RateLimitAlgorithm;
  scope: RateLimitScope;
  windowSizeMs: number;           // Time window in milliseconds
  maxRequests: number;            // Maximum requests per window
  burstCapacity?: number;         // For token bucket - max burst capacity
  refillRate?: number;            // For token bucket - tokens per second
  priority: number;               // Higher number = higher priority (1-10)
  enabled: boolean;
}

// SMS message data
export interface SMSMessage {
  id: string;
  to: string;
  from?: string;
  message: string;
  type: SMSMessageType;
  userId?: string;
  tenantId?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
  scheduledAt?: Date;
  priority: number;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
}

// Rate limit result
export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  remainingRequests: number;
  resetTime: Date;
  retryAfter?: number; // seconds
  currentUsage: number;
  limit: number;
  scope: string;
  metadata?: Record<string, any>;
}

// Queue status
export interface QueueStatus {
  pending: number;
  processing: number;
  failed: number;
  completed: number;
  averageProcessingTime: number;
  oldestPendingAge: number; // milliseconds
  queueHealthScore: number; // 0-100
}

// Rate limiting storage interface
interface RateLimitStorage {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttlMs?: number): Promise<void>;
  increment(key: string, amount?: number): Promise<number>;
  expire(key: string, ttlMs: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  cleanup(): Promise<void>;
}

/**
 * In-memory rate limiting storage (for development/testing)
 */
class MemoryRateLimitStorage implements RateLimitStorage {
  private store: Map<string, { value: any; expires?: Date }> = new Map();

  async get(key: string): Promise<any> {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (item.expires && item.expires < new Date()) {
      this.store.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set(key: string, value: any, ttlMs?: number): Promise<void> {
    const expires = ttlMs ? new Date(Date.now() + ttlMs) : undefined;
    this.store.set(key, { value, expires });
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    const current = (await this.get(key)) || 0;
    const newValue = current + amount;
    await this.set(key, newValue);
    return newValue;
  }

  async expire(key: string, ttlMs: number): Promise<void> {
    const item = this.store.get(key);
    if (item) {
      item.expires = new Date(Date.now() + ttlMs);
    }
  }

  async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  async cleanup(): Promise<void> {
    const now = new Date();
    for (const [key, item] of this.store.entries()) {
      if (item.expires && item.expires < now) {
        this.store.delete(key);
      }
    }
  }
}

/**
 * SMS Rate Limiting Service
 */
export class SMSRateLimitingService extends EventEmitter {
  private configs: Map<string, RateLimitConfig> = new Map();
  private storage: RateLimitStorage;
  private messageQueue: SMSMessage[] = [];
  private processingQueue: Set<string> = new Set();
  private isProcessing: boolean = false;
  private stats: Map<string, any> = new Map();
  private providers: Map<string, SMSProvider> = new Map();

  // Configuration
  private readonly config = {
    queueProcessingInterval: 1000, // Process queue every 1 second
    maxQueueSize: 10000,
    cleanupInterval: 300000, // 5 minutes
    defaultRetries: 3,
    enableMonitoring: true,
    enableAdaptiveRates: true
  };

  constructor(storage?: RateLimitStorage) {
    super();
    this.storage = storage || new MemoryRateLimitStorage();
    this.initializeDefaultConfigs();
    this.startQueueProcessing();
    this.startCleanupInterval();
  }

  /**
   * Initialize default rate limiting configurations
   */
  private initializeDefaultConfigs(): void {
    const defaultConfigs: Array<{ id: string; config: RateLimitConfig }> = [
      // Global rate limits
      {
        id: 'global_sms_limit',
        config: {
          algorithm: RateLimitAlgorithm.TOKEN_BUCKET,
          scope: RateLimitScope.GLOBAL,
          windowSizeMs: 60000, // 1 minute
          maxRequests: 100,
          burstCapacity: 50,
          refillRate: 2, // 2 tokens per second
          priority: 5,
          enabled: true
        }
      },
      // Per-user limits
      {
        id: 'per_user_sms_limit',
        config: {
          algorithm: RateLimitAlgorithm.SLIDING_WINDOW,
          scope: RateLimitScope.PER_USER,
          windowSizeMs: 300000, // 5 minutes
          maxRequests: 10,
          priority: 7,
          enabled: true
        }
      },
      // Per-phone limits (anti-spam)
      {
        id: 'per_phone_sms_limit',
        config: {
          algorithm: RateLimitAlgorithm.SLIDING_WINDOW,
          scope: RateLimitScope.PER_PHONE,
          windowSizeMs: 600000, // 10 minutes
          maxRequests: 5,
          priority: 8,
          enabled: true
        }
      },
      // Security alerts (highest priority)
      {
        id: 'security_alert_limit',
        config: {
          algorithm: RateLimitAlgorithm.TOKEN_BUCKET,
          scope: RateLimitScope.PER_MESSAGE_TYPE,
          windowSizeMs: 60000,
          maxRequests: 50,
          burstCapacity: 20,
          refillRate: 1,
          priority: 10,
          enabled: true
        }
      },
      // Marketing messages (lower priority)
      {
        id: 'marketing_sms_limit',
        config: {
          algorithm: RateLimitAlgorithm.FIXED_WINDOW,
          scope: RateLimitScope.PER_USER,
          windowSizeMs: 86400000, // 24 hours
          maxRequests: 3,
          priority: 2,
          enabled: true
        }
      }
    ];

    defaultConfigs.forEach(({ id, config }) => {
      this.configs.set(id, config);
    });
  }

  /**
   * Check if SMS send is allowed by rate limits
   */
  async checkRateLimit(message: SMSMessage): Promise<RateLimitResult> {
    const applicableConfigs = this.getApplicableConfigs(message);
    
    // Check each applicable rate limit
    for (const [configId, config] of applicableConfigs) {
      if (!config.enabled) continue;

      const key = this.generateRateLimitKey(config, message);
      const result = await this.evaluateRateLimit(config, key, message);
      
      if (!result.allowed) {
        // Log rate limit exceeded
        this.emit('rate_limit_exceeded', {
          configId,
          config,
          message,
          result,
          timestamp: new Date()
        });
        
        return {
          ...result,
          scope: `${config.scope}:${configId}`,
          metadata: { configId, algorithm: config.algorithm }
        };
      }
    }

    return {
      allowed: true,
      remainingRequests: 999,
      resetTime: new Date(Date.now() + 60000),
      currentUsage: 0,
      limit: 1000,
      scope: 'passed_all_checks'
    };
  }

  /**
   * Queue SMS message for sending with rate limiting
   */
  async queueSMS(message: Omit<SMSMessage, 'id' | 'createdAt' | 'retryCount'>): Promise<string> {
    const smsMessage: SMSMessage = {
      id: this.generateMessageId(),
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: this.config.defaultRetries,
      priority: this.getMessagePriority(message.type),
      ...message
    };

    // Check if queue is full
    if (this.messageQueue.length >= this.config.maxQueueSize) {
      throw new Error('SMS queue is full. Please try again later.');
    }

    // Check rate limits before queueing
    const rateLimitResult = await this.checkRateLimit(smsMessage);
    if (!rateLimitResult.allowed) {
      throw new Error(`Rate limit exceeded: ${rateLimitResult.reason}. Retry after ${rateLimitResult.retryAfter} seconds.`);
    }

    // Add to queue with priority ordering
    this.messageQueue.push(smsMessage);
    this.messageQueue.sort((a, b) => b.priority - a.priority || a.createdAt.getTime() - b.createdAt.getTime());

    this.emit('message_queued', { message: smsMessage, queueSize: this.messageQueue.length });
    
    return smsMessage.id;
  }

  /**
   * Send SMS immediately (bypass queue) - for critical messages only
   */
  async sendSMSImmediate(message: Omit<SMSMessage, 'id' | 'createdAt' | 'retryCount'>): Promise<boolean> {
    const smsMessage: SMSMessage = {
      id: this.generateMessageId(),
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: 1,
      priority: 10, // Highest priority
      ...message
    };

    // Only allow immediate send for critical message types
    const criticalTypes = [SMSMessageType.SECURITY_ALERT, SMSMessageType.SYSTEM_ALERT];
    if (!criticalTypes.includes(message.type)) {
      throw new Error('Immediate send only allowed for critical message types');
    }

    return await this.processSMSMessage(smsMessage);
  }

  /**
   * Get current queue status
   */
  getQueueStatus(): QueueStatus {
    const totalProcessed = this.stats.get('completed') || 0;
    const totalProcessingTime = this.stats.get('totalProcessingTime') || 0;
    const oldestPending = this.messageQueue.reduce((oldest, msg) => 
      !oldest || msg.createdAt < oldest ? msg.createdAt : oldest, null as Date | null);

    return {
      pending: this.messageQueue.length,
      processing: this.processingQueue.size,
      failed: this.stats.get('failed') || 0,
      completed: totalProcessed,
      averageProcessingTime: totalProcessed > 0 ? totalProcessingTime / totalProcessed : 0,
      oldestPendingAge: oldestPending ? Date.now() - oldestPending.getTime() : 0,
      queueHealthScore: this.calculateQueueHealthScore()
    };
  }

  /**
   * Register SMS provider
   */
  registerProvider(name: string, provider: SMSProvider): void {
    this.providers.set(name, provider);
  }

  /**
   * Update rate limit configuration
   */
  updateRateLimitConfig(configId: string, config: Partial<RateLimitConfig>): void {
    const existingConfig = this.configs.get(configId);
    if (!existingConfig) {
      throw new Error(`Rate limit config not found: ${configId}`);
    }

    this.configs.set(configId, { ...existingConfig, ...config });
    this.emit('config_updated', { configId, config });
  }

  /**
   * Get rate limit statistics
   */
  async getRateLimitStats(scope?: RateLimitScope): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};

    for (const [configId, config] of this.configs) {
      if (scope && config.scope !== scope) continue;

      const keys = await this.getAllKeysForConfig(config);
      const configStats = {
        configId,
        scope: config.scope,
        algorithm: config.algorithm,
        enabled: config.enabled,
        activeUsers: keys.length,
        totalUsage: 0,
        limit: config.maxRequests
      };

      // Calculate total usage across all keys for this config
      for (const key of keys) {
        const usage = await this.getCurrentUsage(config, key);
        configStats.totalUsage += usage;
      }

      stats[configId] = configStats;
    }

    return stats;
  }

  // Private methods

  private getApplicableConfigs(message: SMSMessage): Map<string, RateLimitConfig> {
    const applicable = new Map<string, RateLimitConfig>();

    for (const [configId, config] of this.configs) {
      if (this.isConfigApplicable(config, message)) {
        applicable.set(configId, config);
      }
    }

    return applicable;
  }

  private isConfigApplicable(config: RateLimitConfig, message: SMSMessage): boolean {
    switch (config.scope) {
      case RateLimitScope.GLOBAL:
        return true;
      case RateLimitScope.PER_USER:
        return !!message.userId;
      case RateLimitScope.PER_PHONE:
        return !!message.to;
      case RateLimitScope.PER_TENANT:
        return !!message.tenantId;
      case RateLimitScope.PER_IP:
        return !!message.ipAddress;
      case RateLimitScope.PER_MESSAGE_TYPE:
        return true; // All messages have a type
      default:
        return false;
    }
  }

  private generateRateLimitKey(config: RateLimitConfig, message: SMSMessage): string {
    const prefix = `sms_rate_limit:${config.scope}`;
    
    switch (config.scope) {
      case RateLimitScope.GLOBAL:
        return `${prefix}:global`;
      case RateLimitScope.PER_USER:
        return `${prefix}:user:${message.userId}`;
      case RateLimitScope.PER_PHONE:
        return `${prefix}:phone:${message.to}`;
      case RateLimitScope.PER_TENANT:
        return `${prefix}:tenant:${message.tenantId}`;
      case RateLimitScope.PER_IP:
        return `${prefix}:ip:${message.ipAddress}`;
      case RateLimitScope.PER_MESSAGE_TYPE:
        return `${prefix}:type:${message.type}`;
      default:
        return `${prefix}:unknown`;
    }
  }

  private async evaluateRateLimit(
    config: RateLimitConfig,
    key: string,
    message: SMSMessage
  ): Promise<RateLimitResult> {
    switch (config.algorithm) {
      case RateLimitAlgorithm.TOKEN_BUCKET:
        return await this.evaluateTokenBucket(config, key);
      case RateLimitAlgorithm.SLIDING_WINDOW:
        return await this.evaluateSlidingWindow(config, key);
      case RateLimitAlgorithm.FIXED_WINDOW:
        return await this.evaluateFixedWindow(config, key);
      case RateLimitAlgorithm.LEAKY_BUCKET:
        return await this.evaluateLeakyBucket(config, key);
      case RateLimitAlgorithm.ADAPTIVE:
        return await this.evaluateAdaptive(config, key, message);
      default:
        throw new Error(`Unsupported rate limit algorithm: ${config.algorithm}`);
    }
  }

  private async evaluateTokenBucket(config: RateLimitConfig, key: string): Promise<RateLimitResult> {
    const bucketKey = `${key}:tokens`;
    const lastRefillKey = `${key}:last_refill`;
    
    const now = Date.now();
    const lastRefill = await this.storage.get(lastRefillKey) || now;
    const currentTokens = await this.storage.get(bucketKey) || config.burstCapacity || config.maxRequests;
    
    // Calculate tokens to add based on refill rate
    const timePassed = (now - lastRefill) / 1000; // seconds
    const tokensToAdd = Math.floor(timePassed * (config.refillRate || 1));
    const maxTokens = config.burstCapacity || config.maxRequests;
    const newTokens = Math.min(maxTokens, currentTokens + tokensToAdd);
    
    if (newTokens < 1) {
      const resetTime = new Date(now + ((1 - newTokens) / (config.refillRate || 1)) * 1000);
      return {
        allowed: false,
        reason: 'Token bucket empty',
        remainingRequests: newTokens,
        resetTime,
        retryAfter: Math.ceil((resetTime.getTime() - now) / 1000),
        currentUsage: maxTokens - newTokens,
        limit: maxTokens
      };
    }
    
    // Consume one token
    await this.storage.set(bucketKey, newTokens - 1, config.windowSizeMs);
    await this.storage.set(lastRefillKey, now, config.windowSizeMs);
    
    return {
      allowed: true,
      remainingRequests: newTokens - 1,
      resetTime: new Date(now + config.windowSizeMs),
      currentUsage: maxTokens - (newTokens - 1),
      limit: maxTokens
    };
  }

  private async evaluateSlidingWindow(config: RateLimitConfig, key: string): Promise<RateLimitResult> {
    const windowKey = `${key}:window`;
    const now = Date.now();
    const windowStart = now - config.windowSizeMs;
    
    // Get existing requests in the window
    const requests: number[] = await this.storage.get(windowKey) || [];
    
    // Remove requests outside the window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    
    if (validRequests.length >= config.maxRequests) {
      const oldestRequest = Math.min(...validRequests);
      const resetTime = new Date(oldestRequest + config.windowSizeMs);
      
      return {
        allowed: false,
        reason: 'Sliding window limit exceeded',
        remainingRequests: Math.max(0, config.maxRequests - validRequests.length),
        resetTime,
        retryAfter: Math.ceil((resetTime.getTime() - now) / 1000),
        currentUsage: validRequests.length,
        limit: config.maxRequests
      };
    }
    
    // Add current request
    validRequests.push(now);
    await this.storage.set(windowKey, validRequests, config.windowSizeMs);
    
    return {
      allowed: true,
      remainingRequests: config.maxRequests - validRequests.length,
      resetTime: new Date(now + config.windowSizeMs),
      currentUsage: validRequests.length,
      limit: config.maxRequests
    };
  }

  private async evaluateFixedWindow(config: RateLimitConfig, key: string): Promise<RateLimitResult> {
    const windowKey = `${key}:fixed_window`;
    const now = Date.now();
    const windowStart = Math.floor(now / config.windowSizeMs) * config.windowSizeMs;
    
    const windowData = await this.storage.get(windowKey) || { count: 0, windowStart: 0 };
    
    // Reset if new window
    if (windowData.windowStart !== windowStart) {
      windowData.count = 0;
      windowData.windowStart = windowStart;
    }
    
    if (windowData.count >= config.maxRequests) {
      const resetTime = new Date(windowStart + config.windowSizeMs);
      
      return {
        allowed: false,
        reason: 'Fixed window limit exceeded',
        remainingRequests: Math.max(0, config.maxRequests - windowData.count),
        resetTime,
        retryAfter: Math.ceil((resetTime.getTime() - now) / 1000),
        currentUsage: windowData.count,
        limit: config.maxRequests
      };
    }
    
    // Increment counter
    windowData.count++;
    await this.storage.set(windowKey, windowData, config.windowSizeMs);
    
    return {
      allowed: true,
      remainingRequests: config.maxRequests - windowData.count,
      resetTime: new Date(windowStart + config.windowSizeMs),
      currentUsage: windowData.count,
      limit: config.maxRequests
    };
  }

  private async evaluateLeakyBucket(config: RateLimitConfig, key: string): Promise<RateLimitResult> {
    const bucketKey = `${key}:leak_bucket`;
    const lastLeakKey = `${key}:last_leak`;
    
    const now = Date.now();
    const lastLeak = await this.storage.get(lastLeakKey) || now;
    const currentLevel = await this.storage.get(bucketKey) || 0;
    
    // Calculate leak (requests processed since last check)
    const timePassed = (now - lastLeak) / 1000;
    const leakRate = config.maxRequests / (config.windowSizeMs / 1000); // requests per second
    const leaked = Math.floor(timePassed * leakRate);
    const newLevel = Math.max(0, currentLevel - leaked);
    
    if (newLevel >= config.maxRequests) {
      const resetTime = new Date(now + (newLevel / leakRate) * 1000);
      
      return {
        allowed: false,
        reason: 'Leaky bucket full',
        remainingRequests: Math.max(0, config.maxRequests - newLevel),
        resetTime,
        retryAfter: Math.ceil((resetTime.getTime() - now) / 1000),
        currentUsage: newLevel,
        limit: config.maxRequests
      };
    }
    
    // Add current request to bucket
    await this.storage.set(bucketKey, newLevel + 1, config.windowSizeMs);
    await this.storage.set(lastLeakKey, now, config.windowSizeMs);
    
    return {
      allowed: true,
      remainingRequests: config.maxRequests - (newLevel + 1),
      resetTime: new Date(now + config.windowSizeMs),
      currentUsage: newLevel + 1,
      limit: config.maxRequests
    };
  }

  private async evaluateAdaptive(config: RateLimitConfig, key: string, message: SMSMessage): Promise<RateLimitResult> {
    // Adaptive rate limiting based on system load and message priority
    const systemLoadKey = 'system_load';
    const systemLoad = await this.storage.get(systemLoadKey) || 0.5; // 0.0 - 1.0
    
    // Adjust limits based on system load and message priority
    const adaptiveFactor = this.calculateAdaptiveFactor(systemLoad, message.priority);
    const adaptedLimit = Math.floor(config.maxRequests * adaptiveFactor);
    
    // Use sliding window with adapted limit
    const adaptedConfig = { ...config, maxRequests: adaptedLimit };
    const result = await this.evaluateSlidingWindow(adaptedConfig, key);
    
    return {
      ...result,
      metadata: {
        ...result.metadata,
        systemLoad,
        adaptiveFactor,
        originalLimit: config.maxRequests,
        adaptedLimit
      }
    };
  }

  private calculateAdaptiveFactor(systemLoad: number, messagePriority: number): number {
    // Higher priority messages get higher adaptive factors
    const priorityFactor = messagePriority / 10; // normalize to 0.1 - 1.0
    const loadFactor = 1 - systemLoad; // inverse of system load
    
    // Combine factors with weighted average
    return (priorityFactor * 0.7) + (loadFactor * 0.3);
  }

  private getMessagePriority(type: SMSMessageType): number {
    const priorities = {
      [SMSMessageType.SECURITY_ALERT]: 10,
      [SMSMessageType.SYSTEM_ALERT]: 10,
      [SMSMessageType.AUTHENTICATION]: 9,
      [SMSMessageType.VERIFICATION]: 8,
      [SMSMessageType.SUPPORT]: 6,
      [SMSMessageType.NOTIFICATION]: 5,
      [SMSMessageType.REMINDER]: 3,
      [SMSMessageType.MARKETING]: 1
    };
    
    return priorities[type] || 5;
  }

  private async startQueueProcessing(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    const processQueue = async () => {
      try {
        await this.processNextMessages();
      } catch (error) {
        console.error('Queue processing error:', error);
        this.emit('processing_error', { error, timestamp: new Date() });
      }
      
      setTimeout(processQueue, this.config.queueProcessingInterval);
    };
    
    processQueue();
  }

  private async processNextMessages(): Promise<void> {
    const maxConcurrent = 5; // Process up to 5 messages concurrently
    const availableSlots = maxConcurrent - this.processingQueue.size;
    
    if (availableSlots <= 0 || this.messageQueue.length === 0) {
      return;
    }
    
    // Get next messages to process (up to available slots)
    const messagesToProcess = this.messageQueue.splice(0, availableSlots);
    
    // Process messages concurrently
    const processPromises = messagesToProcess.map(async (message) => {
      this.processingQueue.add(message.id);
      
      try {
        const success = await this.processSMSMessage(message);
        
        if (success) {
          this.updateStats('completed', 1);
          this.emit('message_sent', { message, success: true, timestamp: new Date() });
        } else {
          // Retry if possible
          if (message.retryCount < message.maxRetries) {
            message.retryCount++;
            this.messageQueue.unshift(message); // Add back to front of queue
            this.emit('message_retry', { message, attempt: message.retryCount });
          } else {
            this.updateStats('failed', 1);
            this.emit('message_failed', { message, reason: 'Max retries exceeded' });
          }
        }
      } catch (error) {
        console.error(`Failed to process SMS ${message.id}:`, error);
        this.updateStats('failed', 1);
        this.emit('message_failed', { message, error, timestamp: new Date() });
      } finally {
        this.processingQueue.delete(message.id);
      }
    });
    
    await Promise.all(processPromises);
  }

  private async processSMSMessage(message: SMSMessage): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      // Check rate limits again (they might have changed)
      const rateLimitResult = await this.checkRateLimit(message);
      if (!rateLimitResult.allowed) {
        this.emit('message_rate_limited', { message, rateLimitResult });
        return false;
      }
      
      // Select provider and send SMS
      const provider = this.selectProvider(message);
      if (!provider) {
        throw new Error('No SMS provider available');
      }
      
      const success = await provider.sendSMS(message);
      
      // Update processing time stats
      const processingTime = Date.now() - startTime;
      this.updateStats('totalProcessingTime', processingTime);
      
      return success;
      
    } catch (error) {
      console.error('SMS processing error:', error);
      return false;
    }
  }

  private selectProvider(message: SMSMessage): SMSProvider | null {
    // Simple provider selection - could be enhanced with load balancing, failover, etc.
    const providers = Array.from(this.providers.values());
    return providers.find(provider => provider.isAvailable()) || providers[0] || null;
  }

  private generateMessageId(): string {
    return `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateStats(key: string, value: number): void {
    const current = this.stats.get(key) || 0;
    this.stats.set(key, current + value);
  }

  private calculateQueueHealthScore(): number {
    const status = {
      pending: this.messageQueue.length,
      processing: this.processingQueue.size,
      failed: this.stats.get('failed') || 0,
      completed: this.stats.get('completed') || 0
    };
    
    // Calculate health score based on various factors
    let score = 100;
    
    // Penalize large queue sizes
    if (status.pending > 100) score -= 20;
    if (status.pending > 500) score -= 30;
    if (status.pending > 1000) score -= 40;
    
    // Penalize high failure rates
    const total = status.failed + status.completed;
    if (total > 0) {
      const failureRate = status.failed / total;
      score -= failureRate * 50;
    }
    
    return Math.max(0, score);
  }

  private async getCurrentUsage(config: RateLimitConfig, key: string): Promise<number> {
    // This is a simplified implementation - actual usage calculation would depend on the algorithm
    const data = await this.storage.get(key);
    if (!data) return 0;
    
    switch (config.algorithm) {
      case RateLimitAlgorithm.TOKEN_BUCKET:
        return (config.maxRequests || 0) - (data || 0);
      case RateLimitAlgorithm.SLIDING_WINDOW:
        return Array.isArray(data) ? data.length : 0;
      case RateLimitAlgorithm.FIXED_WINDOW:
        return data.count || 0;
      default:
        return 0;
    }
  }

  private async getAllKeysForConfig(config: RateLimitConfig): Promise<string[]> {
    // This is a placeholder - actual implementation would scan storage for keys matching the pattern
    return [];
  }

  private startCleanupInterval(): void {
    setInterval(async () => {
      try {
        await this.storage.cleanup();
      } catch (error) {
        console.error('Storage cleanup error:', error);
      }
    }, this.config.cleanupInterval);
  }
}

// SMS Provider interface
export interface SMSProvider {
  name: string;
  sendSMS(message: SMSMessage): Promise<boolean>;
  isAvailable(): boolean;
  getStatus(): { healthy: boolean; lastError?: string; };
}

export default SMSRateLimitingService;