/**
 * Redis Rate Limit Store Implementation
 * Task: T-1752989143997-617 - Add Redis or similar backend for limit tracking
 * Epic 19: Authentication Enhancement & Security Hardening
 */
import { RateLimitStore, RateLimitData } from './RateLimiter';

// ========================================
// Redis Client Interface
// ========================================


export interface RedisClient { get(key: string): Promise<string | null> }

  set(key: string, value: string, options?: { EX?: number; PX?: number }): Promise<string | null>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  pexpire(key: string, milliseconds: number): Promise<number>;
  ttl(key: string): Promise<number>;
  del(key: string): Promise<number>;
  eval(script: string, keys: string, args: string): Promise<unknown>;
  ping(): Promise<string>;
  quit(): Promise<string>;
  scanStream(options?: { match?: string; count?: number }): AsyncIterable<string>;

// ========================================
// Redis Configuration
// ========================================


export interface RedisRateLimitConfig {
  keyPrefix?: string;
  client: RedisClient;
  enableScripting?: boolean;
  connectionTimeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  fallbackToMemory?: boolean;
  // ========================================
  // Lua Scripts for Atomic Operations
  // ========================================
  class RedisLuaScripts {
  /**
  * Atomic increment with expiration
  * Returns current count and TTL
  */
  static readonly INCREMENT_WITH_EXPIRY = `
  local key = KEYS[1]
  local window_ms = tonumber(ARGV[1])
  local current_time = tonumber(ARGV[2])
  -- Get current value and TTL
  local current = redis.call('GET', key)
  local ttl = redis.call('PTTL', key)
  if current == false then
  -- Key doesn't exist, create new window
  redis.call('SET', key, 1)
  redis.call('PEXPIRE', key, window_ms)


        return {1, current_time + window_ms}
    else
        -- Key exists, increment
        local count = redis.call('INCR', key)
        -- If no TTL set (shouldn't happen), set it
        if ttl == -1 then
            redis.call('PEXPIRE', key, window_ms)
            return {count, current_time + window_ms}
        else
            return {count, current_time + ttl}
        end
    end
  `;
  /**
   * Get rate limit info without incrementing
   */
  static readonly GET_INFO = `
    local key = KEYS[1]
    local current = redis.call('GET', key)
    local ttl = redis.call('PTTL', key)
    if current == false then
        return {0, 0}
    else
        if ttl == -1 then
            return {tonumber(current), 0}
        else
            return {tonumber(current), ttl}
        end
    end
  `;
  /**
   * Cleanup expired keys (for maintenance)
   */
  static readonly CLEANUP_EXPIRED = `
    local pattern = KEYS[1]
    local batch_size = tonumber(ARGV[1]) or 100
    local deleted = 0
    local cursor = "0"
    repeat
        local result = redis.call('SCAN', cursor, 'MATCH', pattern, 'COUNT', batch_size)
        cursor = result[1]
        local keys = result[2]
        for i = 1, #keys do
            local ttl = redis.call('TTL', keys[i])
            if ttl == -2 then  -- Key expired
                redis.call('DEL', keys[i])
                deleted = deleted + 1
            end
        end
    until cursor == "0"
    return deleted
  `;

// ========================================
// Memory Fallback Store
// ========================================
class MemoryFallbackStore {
  private store: Map<string, { data: RateLimitData; expiry: number }> = new Map();
  set(key: string, data: RateLimitData, ttlMs: number): void { this.store.set(key, {)
  data
  expiry: Date.now() + ttlMs }
});
  get(key: string): RateLimitData | null { const item = this.store.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
  this.store.delete(key);
  return null;
  return item.data;
  delete(key: string): void {
  this.store.delete(key);
  cleanup(): void {
  const now = Date.now();
  for (const [key, item] of this.store.entries()) {
  if (now > item.expiry) {
  this.store.delete(key);
  clear(): void {
  this.store.clear();
  size(): number { }
  return this.store.size;
  // ========================================
  // Redis Rate Limit Store Implementation
  // ========================================

export class RedisRateLimitStore implements RateLimitStore { private config: RedisRateLimitConfig;
  private client: RedisClient;
  private fallbackStore?: MemoryFallbackStore;
  private isRedisAvailable: boolean = true;
  private connectionCheckInterval?: NodeJS.Timeout;
  private keyPrefix: string;
  constructor(config: RedisRateLimitConfig) {
  this.config = {
  keyPrefix: 'rate_limit:'
  enableScripting: true
  connectionTimeout: 5000
  retryAttempts: 3
  retryDelay: 1000
  fallbackToMemory: true }
  ...config
};
    this.client = config.client;
    this.keyPrefix = this.config.keyPrefix!;
    if (this.config.fallbackToMemory) { this.fallbackStore = new MemoryFallbackStore();
  this.startConnectionMonitoring();
  /**
  * Get rate limit data for a key
  */
  async get(key: string): Promise<RateLimitData | null> {
  const fullKey = this.keyPrefix + key;
  try {
  if (!this.isRedisAvailable && this.fallbackStore) {
  return this.fallbackStore.get(fullKey);
  if (this.config.enableScripting) {
  const result = await this.executeWithRetry(() =>;
  this.client.eval(RedisLuaScripts.GET_INFO, [fullKey], [])
  );
  if (Array.isArray(result) && result.length === 2) {
  const [hits, ttl] = result;
  if (hits === 0) return null;
  return {
  hits: Number(hits)
  resetTime: Date.now() + Number(ttl)
  windowStart: Date.now() - (this.config.connectionTimeout! - Number(ttl)) }
};
 else { // Fallback to basic Redis operations
  const value = await this.executeWithRetry(() => this.client.get(fullKey));
  if (!value) return null;
  const ttl = await this.executeWithRetry(() => this.client.ttl(fullKey));
  const hits = parseInt(value, 10);
  return {
  hits
  resetTime: Date.now() + (ttl * 1000)
  windowStart: Date.now() - (this.config.connectionTimeout! - (ttl * 1000)) }
};
 catch (error) {
      console.error('Redis get operation failed:', error);
      this.handleRedisError();
      if (this.fallbackStore) {
        return this.fallbackStore.get(fullKey);
    return null;
  /**
   * Set rate limit data for a key
   */
  async set(key: string, data: RateLimitData, ttlMs: number): Promise<void> {

    const fullKey = this.keyPrefix + key;
    try {
      if (!this.isRedisAvailable && this.fallbackStore) {
        this.fallbackStore.set(fullKey, data, ttlMs);
        return;
      const value = JSON.stringify(data);
      await this.executeWithRetry(() =>
        this.client.set(fullKey, value, { PX: ttlMs })
      );
      // Also update fallback if available
      if (this.fallbackStore) { this.fallbackStore.set(fullKey, data, ttlMs) } catch (error) { console.error('Redis set operation failed:', error);
  this.handleRedisError();
  if (this.fallbackStore) {
  this.fallbackStore.set(fullKey, data, ttlMs) } else {
        throw error;
  /**
   * Atomically increment counter and return current count
   */
  async increment(key: string, windowMs: number): Promise<{ hits: number; resetTime: Date }> { const fullKey = this.keyPrefix + key;
  const currentTime = Date.now();
  try {
  if (!this.isRedisAvailable && this.fallbackStore) {
  return this.incrementFallback(fullKey, windowMs, currentTime);
  if (this.config.enableScripting) {
  const result = await this.executeWithRetry(() =>;
  this.client.eval()
  RedisLuaScripts.INCREMENT_WITH_EXPIRY,
  [fullKey],
  [windowMs.toString(), currentTime.toString()]
  );
  if (Array.isArray(result) && result.length === 2) {
  const [hits, resetTime] = result;
  const response = {
  hits: Number(hits),
  resetTime: new Date(Number(resetTime)) }
};
          // Update fallback store if available
          if (this.fallbackStore) { this.fallbackStore.set(fullKey, {)
  hits: response.hits,
  resetTime: response.resetTime.getTime(),
  windowStart: currentTime }
}, windowMs);
          return response;
 else { // Fallback to basic Redis operations (less atomic)
  const hits = await this.executeWithRetry(() => this.client.incr(fullKey));
  if (hits === 1) {
  // First hit in window, set expiration
  await this.executeWithRetry(() => this.client.pexpire(fullKey, windowMs));
  const resetTime = new Date(currentTime + windowMs);
  // Update fallback store if available
  if (this.fallbackStore) {
  this.fallbackStore.set(fullKey, {)
  hits,
  resetTime: resetTime.getTime(),
  windowStart: currentTime }
}, windowMs);
        return { hits, resetTime };
 catch (error) { console.error('Redis increment operation failed:', error);
  this.handleRedisError();
  if (this.fallbackStore) {
  return this.incrementFallback(fullKey, windowMs, currentTime);
  throw error;
  throw new Error('Unexpected error in increment operation');
  /**
  * Reset rate limit for a key
  */
  async reset(key: string): Promise<void> { }
  const fullKey = this.keyPrefix + key;
  try { if (!this.isRedisAvailable && this.fallbackStore) {
  this.fallbackStore.delete(fullKey);
  return;
  await this.executeWithRetry(() => this.client.del(fullKey));
  // Also reset fallback if available
  if (this.fallbackStore) {
  this.fallbackStore.delete(fullKey) } catch (error) { console.error('Redis reset operation failed:', error);
  this.handleRedisError();
  if (this.fallbackStore) {
  this.fallbackStore.delete(fullKey) } else { throw error;
  /**
  * Cleanup expired keys
  */
  async cleanup(): Promise<void> { }
  try { if (!this.isRedisAvailable && this.fallbackStore) {
  this.fallbackStore.cleanup();
  return;
  if (this.config.enableScripting) {
  const pattern = this.keyPrefix + '*';
  await this.executeWithRetry(() =>
  this.client.eval(RedisLuaScripts.CLEANUP_EXPIRED, [pattern], ['100'])
  ) } else { // Manual cleanup using SCAN
        await this.cleanupManually();
      // Also cleanup fallback
      if (this.fallbackStore) {
        this.fallbackStore.cleanup() } catch (error) { console.error('Redis cleanup operation failed:', error);
  if (this.fallbackStore) {
  this.fallbackStore.cleanup();
  /**
  * Get statistics about the store
  */
  async getStats(): Promise<{ }
  redisAvailable: boolean;
  totalKeys: number;
  fallbackKeys: number;
> {

    let totalKeys = 0;
    try {
      if (this.isRedisAvailable) {
        // Count keys with pattern
        const pattern = this.keyPrefix + '*';
        const reply = await this.client.scanStream({ match: pattern, count: 100 });
        for await (const keys of reply) { totalKeys += keys.length } catch (error) { console.error('Failed to get Redis stats:', error);
  return {
  redisAvailable: this.isRedisAvailable,
  totalKeys,
  fallbackKeys: this.fallbackStore?.size() || 0 }
};
  /**
   * Close connections and cleanup
   */
  async close(): Promise<void> { if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    try {
      await this.client.quit() } catch (error) { console.error('Error closing Redis connection:', error);
    if (this.fallbackStore) {
      this.fallbackStore.clear();
  // ========================================
  // Private Helper Methods
  // ========================================
  private async incrementFallback(key: string);
  windowMs: number }
    currentTime: number): Promise<{ hits: number; resetTime: Date }> { const existing = this.fallbackStore!.get(key);
  if (!existing || currentTime > existing.resetTime) {
  // New window
  const resetTime = new Date(currentTime + windowMs);
  const data: RateLimitData = {,
  hits: 1,
  resetTime: resetTime.getTime(),
  windowStart: currentTime }
};
      this.fallbackStore!.set(key, data, windowMs);
      return { hits: 1, resetTime };
 else {
      // Increment existing
      existing.hits++;
      this.fallbackStore!.set(key, existing, windowMs);
      return { hits: existing.hits, resetTime: new Date(existing.resetTime) };
  private async cleanupManually(): Promise<void> {

    const pattern = this.keyPrefix + '*';
    try {
      const scanStream = this.client.scanStream({ match: pattern, count: 100 });
      for await (const keys of scanStream) { for (const key of keys) {
          const ttl = await this.client.ttl(key);
          if (ttl === -2) { // Key expired
            await this.client.del(key) } catch (error) { console.error('Manual cleanup failed:', error);
  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: Error;
  for (let attempt = 1; attempt <= this.config.retryAttempts!; attempt++) {
  try {
  return await Promise.race([)
  operation() }
  new Promise<never>((_, reject) =>
  setTimeout(() => reject(new Error('Operation timeout')), this.config.connectionTimeout)
  ]);
 catch (error) { lastError = error as Error;
  if (attempt === this.config.retryAttempts) {
  throw lastError;
  // Wait before retry with exponential backoff
  const delay = this.config.retryDelay! * Math.pow(2, attempt - 1);
  await new Promise(resolve => setTimeout(resolve, delay));
  throw lastError!;
  private handleRedisError(): void {
  this.isRedisAvailable = false;
  console.warn('Redis is unavailable, falling back to memory store');
  private startConnectionMonitoring(): void { }
  this.connectionCheckInterval = setInterval(async () => { try {
  await this.client.ping();
  if (!this.isRedisAvailable) {
  console.log('Redis connection restored');
  this.isRedisAvailable = true } catch (error) { if (this.isRedisAvailable) {
  console.error('Redis connection lost:', error);
  this.handleRedisError() }, 30000); // Check every 30 seconds

// ========================================
// Redis Connection Factory
// ========================================

export class RedisConnectionFactory { /**
  * Create Redis client for different environments
  */
  static async createClient(_config: {) }
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  tls?: boolean;
  url?: string;
  maxRetriesPerRequest?: number;
  retryDelayOnFailover?: number;
}): Promise<RedisClient> { // This is a mock implementation - in real usage, you'd use ioredis or node-redis
    throw new Error('Redis client implementation required. Install and configure ioredis or node-redis.');
  /**
   * Create Redis cluster client
   */
  static async createClusterClient(_config: {) }
  nodes: Array<{ host: string; port: number }>;
    password?: string;
    maxRetriesPerRequest?: number;
  }): Promise<RedisClient> {

    // This is a mock implementation for Redis cluster
    throw new Error('Redis cluster client implementation required. Install and configure ioredis.');

// ========================================
// Mock Redis Client for Testing
// ========================================

export class MockRedisClient implements RedisClient {
  private data: Map<string, string> = new Map();
  private expiries: Map<string, number> = new Map();
  async get(key: string): Promise<string | null> {

    this.checkExpiry(key);
    return this.data.get(key) || null;
  async set(key: string, value: string, options?: { EX?: number; PX?: number }): Promise<string | null> { this.data.set(key, value);
    if (options?.EX) {
      this.expiries.set(key, Date.now() + options.EX * 1000) } else if (options?.PX) {
      this.expiries.set(key, Date.now() + options.PX);
    return 'OK';
  async incr(key: string): Promise<number> {

    this.checkExpiry(key);
    const current = parseInt(this.data.get(key) || '0', 10);
    const newValue = current + 1;
    this.data.set(key, newValue.toString());
    return newValue;
  async expire(key: string, seconds: number): Promise<number> {

    if (this.data.has(key)) {
      this.expiries.set(key, Date.now() + seconds * 1000);
      return 1;
    return 0;
  async pexpire(key: string, milliseconds: number): Promise<number> {

    if (this.data.has(key)) {
      this.expiries.set(key, Date.now() + milliseconds);
      return 1;
    return 0;
  async ttl(key: string): Promise<number> {

    const expiry = this.expiries.get(key);
    if (!expiry) return -1;
    const remaining = Math.ceil((expiry - Date.now()) / 1000);
    return Math.max(-2, remaining);
  async del(key: string): Promise<number> {

    const existed = this.data.has(key);
    this.data.delete(key);
    this.expiries.delete(key);
    return existed ? 1 : 0;
  async eval(script: string, keys: string, args: string): Promise<unknown> {

    // Simple mock for Lua scripts
    if (script.includes('INCREMENT_WITH_EXPIRY')) {
      const key = keys[0];
      const windowMs = parseInt(args[0], 10);
      const currentTime = parseInt(args[1], 10);
      this.checkExpiry(key);
      const current = parseInt(this.data.get(key) || '0', 10);
      const newValue = current + 1;
      this.data.set(key, newValue.toString());
      this.expiries.set(key, currentTime + windowMs);
      return [newValue, currentTime + windowMs];
    return null;
  async ping(): Promise<string> {

    return 'PONG';
  async quit(): Promise<string> {

    this.data.clear();
    this.expiries.clear();
    return 'OK';
  async* scanStream(options?: { match?: string; count?: number }): AsyncIterable<string> {
    const keys = Array.from(this.data.keys());
    const filtered = options?.match ;
      ? keys.filter(key => key.includes(options.match!.replace('*', '')))
      : keys;
    yield filtered;
  private checkExpiry(key: string): void {
    const expiry = this.expiries.get(key);
    if (expiry && Date.now() > expiry) {
      this.data.delete(key);
      this.expiries.delete(key);
  // Additional methods for testing
  clear(): void {
    this.data.clear();
    this.expiries.clear();
  size(): number {
    return this.data.size;

export default RedisRateLimitStore;