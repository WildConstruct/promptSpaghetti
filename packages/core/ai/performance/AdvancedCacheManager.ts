/**
 * Advanced Cache Manager for AI Models
 * Epic 35.1.6 - Performance Optimization
 * 
 * Intelligent caching system with multiple eviction policies and performance optimization
 */


export interface CacheConfig { maxSize: number;
  maxMemoryMB: number;
  defaultTTL: number; // Time to live in milliseconds;
  evictionPolicy: 'LRU' | 'LFU' | 'TTL' | 'ADAPTIVE' | 'HYBRID';
  compressionEnabled: boolean;
  persistToDisk: boolean;
  diskCachePath?: string;
  metrics: { }
  enabled: boolean;
  reportingInterval: number;


};


export interface CacheItem<T = any> { key: string;
  value: T;
  size: number;
  createdAt: number;
  lastAccessed: number;
  accessCount: number;
  ttl: number;
  priority: number;
  compressed: boolean;
  metadata: { }
  modelType: string;
  inputHash: string;
  responseTime: number;
  cost: number;
};


export interface CacheMetrics { hitRate: number;
  missRate: number;
  evictionRate: number;
  memoryUsage: number;
  diskUsage: number;
  averageResponseTime: number;
  totalRequests: number;
  cacheSize: number;
  compressionRatio: number;
  costSavings: number }



export interface EvictionStrategy { name: string;
  shouldEvict(item: CacheItem, config: CacheConfig): boolean;
  selectItemsForEviction(items: CacheItem, count: number): CacheItem;
  calculatePriority(item: CacheItem): number }

export class LRUEvictionStrategy implements EvictionStrategy { name = 'LRU';
  shouldEvict(item: CacheItem, config: CacheConfig): boolean {
  return Date.now() - item.lastAccessed > config.defaultTTL;
  selectItemsForEviction(items: CacheItem, count: number): CacheItem {
  return items
  .sort((a, b) => a.lastAccessed - b.lastAccessed)
  .slice(0, count);
  calculatePriority(item: CacheItem): number {
  const ageScore = (Date.now() - item.lastAccessed) / (1000 * 60 * 60); // Hours;
  return Math.max(0, 1 - (ageScore / 24)); // Lower priority for older items
  export class LFUEvictionStrategy implements EvictionStrategy {
  name = 'LFU';
  shouldEvict(item: CacheItem, config: CacheConfig): boolean {
  return item.accessCount < 2 && Date.now() - item.createdAt > config.defaultTTL;
  selectItemsForEviction(items: CacheItem, count: number): CacheItem {,
  return items
  .sort((a, b) => a.accessCount - b.accessCount)
  .slice(0, count);
  calculatePriority(item: CacheItem): number {,
  const accessScore = Math.min(item.accessCount / 10, 1); // Normalize access count;
  const recencyScore = 1 - ((Date.now() - item.lastAccessed) / (1000 * 60 * 60 * 24));
  return (accessScore * 0.7) + (recencyScore * 0.3);
  export class AdaptiveEvictionStrategy implements EvictionStrategy {
  name = 'ADAPTIVE';
  private performanceHistory: Map<string, number> = new Map();
  shouldEvict(item: CacheItem, config: CacheConfig): boolean {
  const performance = this.getItemPerformance(item.key);
  const ageThreshold = this.calculateAgeThreshold(performance);
  return Date.now() - item.lastAccessed > ageThreshold;
  selectItemsForEviction(items: CacheItem, count: number): CacheItem {
  return items
  .map(item => ({)
  item
  score: this.calculateEvictionScore(item) }
}))
      .sort((a, b) => a.score - b.score) // Lower score = higher eviction priority
      .slice(0, count)
      .map(entry => entry.item);
  calculatePriority(item: CacheItem): number { const performance = this.getItemPerformance(item.key);
  const accessScore = Math.min(item.accessCount / 5, 1);
  const performanceScore = performance > 0 ? Math.min(performance, 1) : 0.5;
  const recencyScore = 1 - ((Date.now() - item.lastAccessed) / (1000 * 60 * 60 * 12));
  const sizeScore = 1 - Math.min(item.size / (10 * 1024 * 1024), 1); // Favor smaller items;
  return (accessScore * 0.3) + (performanceScore * 0.3) + (recencyScore * 0.25) + (sizeScore * 0.15);
  private getItemPerformance(key: string): number {
  const history = this.performanceHistory.get(key) || [];
  if (history.length === 0) return 0.5;
  return history.reduce((sum, val) => sum + val, 0) / history.length;
  private calculateAgeThreshold(performance: number): number {
  const baseTTL = 1000 * 60 * 60; // 1 hour;
  const performanceMultiplier = 1 + (performance * 2); // 1x to 3x based on performance;
  return baseTTL * performanceMultiplier;
  private calculateEvictionScore(item: CacheItem): number {
  const age = Date.now() - item.lastAccessed;
  const frequency = item.accessCount;
  const size = item.size;
  const performance = this.getItemPerformance(item.key);
  // Lower score = higher eviction priority
  return (age / 1000) / Math.max(frequency, 1) * (size / 1024) * (1 - performance);
  recordPerformance(key: string, responseTime: number, success: boolean): void {
  const performanceScore = success ? Math.max(0, 1 - (responseTime / 10000)) : 0; // 10s baseline;
  if (!this.performanceHistory.has(key)) {
  this.performanceHistory.set(key, []);
  const history = this.performanceHistory.get(key)!;
  history.push(performanceScore);
  // Keep only last 10 performance records
  if (history.length > 10) {
  history.shift();
  export class AdvancedCacheManager {
  private cache = new Map<string, CacheItem>();
  private config: CacheConfig;
  private evictionStrategy: EvictionStrategy;
  private metrics: CacheMetrics;
  private metricsTimer?: NodeJS.Timeout;
  private compressionWorker?: Worker;
  constructor(config: CacheConfig) {
  this.config = config;
  this.evictionStrategy = this.createEvictionStrategy(config.evictionPolicy);
  this.metrics = this.initializeMetrics();
  if (config.metrics.enabled) {
  this.startMetricsReporting();
  if (config.compressionEnabled) {
  this.initializeCompression();
  async get<T>(key: string): Promise<T | null> {
  const startTime = Date.now();
  const item = this.cache.get(key);
  if (!item) {
  this.recordMiss();
  return null;
  // Check TTL expiration
  if (Date.now() - item.createdAt > item.ttl) {
  this.cache.delete(key);
  this.recordMiss();
  return null;
  // Update access metadata
  item.lastAccessed = Date.now();
  item.accessCount++;
  // Decompress if needed
  let value = item.value;
  if (item.compressed && this.config.compressionEnabled) {
  value = await this.decompress(value);
  this.recordHit(Date.now() - startTime);
  return value as T;
  async set<T>(key: string)
  value: T
  options: { }
  ttl?: number;
  priority?: number;
  metadata?: Partial<CacheItem['metadata']>;
 = {}
  ): Promise<void> { const size = this.calculateSize(value);
  // Check if we need to make space
  await this.ensureCapacity(size);
  let processedValue = value;
  let compressed = false;
  // Compress large items if enabled
  if (this.config.compressionEnabled && size > 1024) { // 1KB threshold
  processedValue = await this.compress(value);
  compressed = true;
  const item: CacheItem = {
  key
  value: processedValue
  size: compressed ? this.calculateSize(processedValue) : size
  createdAt: Date.now()
  lastAccessed: Date.now()
  accessCount: 0
  ttl: options.ttl || this.config.defaultTTL
  priority: options.priority || 1
  compressed
  metadata: {
  modelType: 'unknown'
  inputHash: this.hashInput(key)
  responseTime: 0
  cost: 0 }
  ...options.metadata
};
    this.cache.set(key, item);
    this.updateMetrics();
  async delete(key: string): Promise<boolean> {

    const deleted = this.cache.delete(key);
    if (deleted) {
      this.updateMetrics();
    return deleted;
  async clear(): Promise<void> {

    this.cache.clear();
    this.metrics = this.initializeMetrics();
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  getSize(): number { return this.cache.size;
  getMemoryUsage(): number {
  let totalSize = 0;
  for (const item of this.cache.values()) {
  totalSize += item.size;
  return totalSize;
  async optimize(): Promise<{ }
  itemsEvicted: number;
  memoryFreed: number;
  optimizationTime: number;
> { const startTime = Date.now();
  const initialMemory = this.getMemoryUsage();
  const initialCount = this.cache.size;
  // Perform various optimizations
  await this.performEviction(0.1); // Evict 10% of items proactively
  await this.defragmentCache();
  await this.recomputePriorities();
  const finalMemory = this.getMemoryUsage();
  const finalCount = this.cache.size;
  return {
  itemsEvicted: initialCount - finalCount,
  memoryFreed: initialMemory - finalMemory,
  optimizationTime: Date.now() - startTime }
};
  // Performance analysis methods
  analyzeHitPatterns(): {
    topKeys: Array<{ key: string; hitRate: number; accessCount: number }>;
    lowPerformanceKeys: Array<{ key: string; performance: number }>;
    recommendations: string;
    const keyStats = new Map<string, { hits: number; misses: number; accessCount: number }>();
    for (const [key, item] of this.cache.entries()) { keyStats.set(key, {)
  hits: item.accessCount
  misses: 0, // Would need to track separately
  accessCount: item.accessCount }
});
    const topKeys = Array.from(keyStats.entries());
      .map(([key, stats]) => ({ )
  key
  hitRate: stats.hits / Math.max(stats.hits + stats.misses, 1)
  accessCount: stats.accessCount }
}))
      .sort((a, b) => b.hitRate - a.hitRate)
      .slice(0, 10);
    const recommendations: string = [];
    if (this.metrics.hitRate < 0.5) { recommendations.push('Consider increasing cache size or TTL values');
  if (this.metrics.memoryUsage / (this.config.maxMemoryMB * 1024 * 1024) > 0.9) {
  recommendations.push('Memory usage is high, consider enabling compression or reducing cache size');
  return {
  topKeys,
  lowPerformanceKeys: [], // Would implement based on performance tracking }
  recommendations
};
  // Private helper methods
  private createEvictionStrategy(policy: CacheConfig['evictionPolicy']): EvictionStrategy { switch (policy) {
  case 'LRU':,
  return new LRUEvictionStrategy();
  case 'LFU':,
  return new LFUEvictionStrategy();
  case 'ADAPTIVE':,
  return new AdaptiveEvictionStrategy();
  case 'HYBRID':,
  // Combine multiple strategies
  return new AdaptiveEvictionStrategy(); // Simplified for now
  default:,
  return new LRUEvictionStrategy();
  private async ensureCapacity(additionalSize: number): Promise<void> {
  const currentMemory = this.getMemoryUsage();
  const maxMemory = this.config.maxMemoryMB * 1024 * 1024;
  if (this.cache.size >= this.config.maxSize || )
  currentMemory + additionalSize > maxMemory) {
  const itemsToEvict = Math.max(;);
  Math.ceil(this.config.maxSize * 0.1), // Evict 10% of max size
  1
  );
  await this.performEviction(itemsToEvict / this.cache.size);
  private async performEviction(percentage: number): Promise<void> {
  const itemsToEvict = Math.ceil(this.cache.size * percentage);
  if (itemsToEvict <= 0) return;
  const allItems = Array.from(this.cache.values());
  const itemsForEviction = this.evictionStrategy.selectItemsForEviction(allItems, itemsToEvict);
  for (const item of itemsForEviction) {
  this.cache.delete(item.key);
  this.metrics.evictionRate++;
  this.updateMetrics();
  private async defragmentCache(): Promise<void> {
  // Reorganize cache for better memory locality
  const items = Array.from(this.cache.entries());
  .sort(([ a], [ b]) => b.priority - a.priority);
  this.cache.clear();
  for (const [key, item] of items) {
  this.cache.set(key, item);
  private async recomputePriorities(): Promise<void> {
  for (const item of this.cache.values()) {
  item.priority = this.evictionStrategy.calculatePriority(item);
  private calculateSize(value: any): number { }
  if (value === null || value === undefined) return 0;
  if (typeof value === 'string') return value.length * 2; // Unicode characters
  if (typeof value === 'number') return 8;
  if (typeof value === 'boolean') return 1;
  if (value instanceof ArrayBuffer) return value.byteLength;
  if (value instanceof Uint8Array) return value.length;
  // For objects, estimate based on JSON serialization
  try { return JSON.stringify(value).length * 2 } catch {
      return 1024; // Default estimate for complex objects
  private hashInput(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    return hash.toString(36);
  private async compress(value: any): Promise<any> {

    // Simplified compression - in production would use proper compression library
    if (typeof value === 'string') {
      return { __compressed: true, data: value }; // Placeholder
    return value;
  private async decompress(value: any): Promise<any> { if (value && value.__compressed) {
  return value.data;
  return value;
  private initializeMetrics(): CacheMetrics {
  return {
  hitRate: 0
  missRate: 0
  evictionRate: 0
  memoryUsage: 0
  diskUsage: 0
  averageResponseTime: 0
  totalRequests: 0
  cacheSize: 0
  compressionRatio: 0
  costSavings: 0 }
};
  private recordHit(responseTime: number): void { this.metrics.totalRequests++;
  this.metrics.averageResponseTime =
  (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime) /
  this.metrics.totalRequests;
  this.updateHitRate();
  private recordMiss(): void {
  this.metrics.totalRequests++;
  this.updateHitRate();
  private updateHitRate(): void {
  const hits = this.metrics.totalRequests - this.metrics.evictionRate;
  this.metrics.hitRate = hits / Math.max(this.metrics.totalRequests, 1);
  this.metrics.missRate = 1 - this.metrics.hitRate;
  private updateMetrics(): void {
  this.metrics.memoryUsage = this.getMemoryUsage();
  this.metrics.cacheSize = this.cache.size;
  // Calculate compression ratio
  let compressedSize = 0;
  let uncompressedSize = 0;
  for (const item of this.cache.values()) {
  if (item.compressed) {
  compressedSize += item.size;
  uncompressedSize += item.size * 2; // Estimate
  this.metrics.compressionRatio = compressedSize > 0 ? uncompressedSize / compressedSize : 1;
  private startMetricsReporting(): void { }
  this.metricsTimer = setInterval(() => { this.updateMetrics();
  if (this.config.metrics.enabled) {
  this.reportMetrics() }, this.config.metrics.reportingInterval);
  private reportMetrics(): void {
    console.log('Cache Metrics:', {)
  hitRate: `${(this.metrics.hitRate * 100).toFixed(2)}%`}

  memoryUsage: `${(this.metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`}

  cacheSize: this.metrics.cacheSize
      averageResponseTime: `${this.metrics.averageResponseTime.toFixed(2)}ms`}
    });
  private initializeCompression(): void {
    // Initialize compression worker if available
    // In a real implementation, this would set up a Web Worker or worker thread
  destroy(): void {
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
    if (this.compressionWorker) {
      this.compressionWorker.terminate();
    this.cache.clear();

export default AdvancedCacheManager;