// Epic 11 Redis Service
// Redis service for session management and rate limiting
import Redis from 'ioredis';
export class RedisService {
  client;
  config;
  constructor(config) {
    this.config = config;
    this.client = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db || 0,
      keyPrefix: config.keyPrefix || 'auth:',
      enableReadyCheck: true,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });
    // Handle Redis events
    this.client.on('connect', () => {
      console.log('Redis connected');
    });
    this.client.on('error', err => {
      console.error('Redis error:', err);
    });
    this.client.on('disconnect', () => {
      console.warn('Redis disconnected');
    });
  }
  async connect() {
    if (this.client.status !== 'ready') {
      await this.client.connect();
    }
  }
  async get(key) {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }
  async set(key, value) {
    try {
      await this.client.set(key, value);
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      throw error;
    }
  }
  async setex(key, seconds, value) {
    try {
      await this.client.setex(key, seconds, value);
    } catch (error) {
      console.error(`Redis SETEX error for key ${key}:`, error);
      throw error;
    }
  }
  async exists(key) {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }
  async del(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error);
      throw error;
    }
  }
  async incr(key) {
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error(`Redis INCR error for key ${key}:`, error);
      throw error;
    }
  }
  async expire(key, seconds) {
    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      console.error(`Redis EXPIRE error for key ${key}:`, error);
      throw error;
    }
  }
  async ttl(key) {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error(`Redis TTL error for key ${key}:`, error);
      return -1;
    }
  }
  // Rate limiting with sliding window
  async checkRateLimit(key, window, limit) {
    try {
      const now = Date.now();
      const pipeline = this.client.pipeline();
      // Remove expired entries
      pipeline.zremrangebyscore(key, 0, now - window * 1000);
      // Count current entries
      pipeline.zcard(key);
      // Add current request
      pipeline.zadd(key, now, `${now}-${Math.random()}`);
      // Set expiry for the key
      pipeline.expire(key, window);
      const results = await pipeline.exec();
      if (!results) {
        throw new Error('Redis pipeline failed');
      }
      const count = results[1][1] || 0;
      const allowed = count < limit;
      const remaining = Math.max(0, limit - count - 1);
      const resetTime = new Date(now + window * 1000);
      return {
        allowed,
        count: count + 1,
        remaining,
        resetTime,
      };
    } catch (error) {
      console.error(`Redis rate limit error for key ${key}:`, error);
      // Default to allowing the request if Redis is down
      return {
        allowed: true,
        count: 1,
        remaining: limit - 1,
        resetTime: new Date(Date.now() + window * 1000),
      };
    }
  }
  // Session management
  async storeSession(sessionId, data, ttl) {
    const key = `session:${sessionId}`;
    await this.setex(key, ttl, JSON.stringify(data));
  }
  async getSession(sessionId) {
    const key = `session:${sessionId}`;
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }
  async deleteSession(sessionId) {
    const key = `session:${sessionId}`;
    await this.del(key);
  }
  async extendSession(sessionId, ttl) {
    const key = `session:${sessionId}`;
    await this.expire(key, ttl);
  }
  // Cache management
  async cache(key, data, ttl) {
    await this.setex(key, ttl, JSON.stringify(data));
  }
  async getCache(key) {
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }
  async invalidateCache(pattern) {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      console.error(`Redis cache invalidation error for pattern ${pattern}:`, error);
    }
  }
  async healthCheck() {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }
  async getInfo() {
    try {
      const info = await this.client.info();
      const lines = info.split('\r\n');
      const result = {};
      let section = '';
      for (const line of lines) {
        if (line.startsWith('#')) {
          section = line.substring(2).toLowerCase();
          result[section] = {};
        } else if (line.includes(':')) {
          const [key, value] = line.split(':');
          if (section && key && value) {
            result[section][key] = isNaN(Number(value)) ? value : Number(value);
          }
        }
      }
      return result;
    } catch (error) {
      console.error('Redis info error:', error);
      return {};
    }
  }
  async close() {
    await this.client.quit();
  }
  // Get Redis client for advanced operations
  getClient() {
    return this.client;
  }
}
