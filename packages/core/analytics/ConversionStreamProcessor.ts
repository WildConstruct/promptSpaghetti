/**
 * Conversion Stream Processor - Story 30.2 Task 2
 * 
 * Real-time conversion event streaming infrastructure for processing
 * and distributing conversion events across the system.
 * 
 * Features:
 * - Real-time event streaming
 * - Event stream partitioning
 * - Fault-tolerant processing
 * - Stream analytics and monitoring
 * - Dead letter queue handling
 * - Consumer group management
 */
import { EventEmitter } from 'events';
import { EnhancedConversionEvent, FunnelStreamConfig } from './ConversionFunnelArchitecture';


export interface StreamEvent { id: string;
  type: 'conversion_event' | 'funnel_step' | 'attribution_update' | 'session_event';
  payload: EnhancedConversionEvent;
  partition: number;
  offset: number;
  timestamp: number;
  headers: Record<string, string>;
  retryCount: number }



export interface StreamPartition { id: number;
  events: StreamEvent;
  offset: number;
  lastProcessed: number;
  consumerCount: number;
  lag: number }



export interface StreamConsumer { id: string;
  groupId: string;
  assignedPartitions: number;
  lastHeartbeat: number;
  processedOffset: Map<number, number>;
  isActive: boolean;
  processingRate: number }



export interface StreamMetrics { totalEvents: number;
  eventsPerSecond: number;
  averageLatency: number;
  partitionMetrics: Map<number, { }
  events: number;
  lag: number;
  throughput: number;


>;
  consumerMetrics: Map<string, { processedEvents: number;
  errorCount: number;
  avgProcessingTime: number }>;
  deadLetterQueue: { 
  size: number;
  oldestEvent: number };


export interface ProcessingResult { success: boolean;
  eventId: string;
  processingTime: number;
  error?: string;
  retryable: boolean }

export type EventProcessor = (event: StreamEvent) => Promise<ProcessingResult>;
/**
 * Conversion Stream Processor
 * Manages real-time conversion event streaming with fault tolerance
 */
export class ConversionStreamProcessor extends EventEmitter { private config: FunnelStreamConfig;
  private partitions: Map<number, StreamPartition> = new Map();
  private consumers: Map<string, StreamConsumer> = new Map();
  private processors: Map<string, EventProcessor> = new Map();
  private deadLetterQueue: StreamEvent = [];
  private isRunning: boolean = false;
  private metricsInterval: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private metrics: StreamMetrics = {
  totalEvents: 0
    eventsPerSecond: 0
    averageLatency: 0
    partitionMetrics: new Map()
    consumerMetrics: new Map() }
    deadLetterQueue: { size: 0, oldestEvent: 0 }
  };
  constructor(config: FunnelStreamConfig) { super();
  this.config = {
  streamName: config.streamName || 'conversion-events'
  batchSize: config.batchSize || 100
  flushInterval: config.flushInterval || 5000
  retryPolicy: config.retryPolicy || {
  maxRetries: 3
  backoffMultiplier: 2
  maxBackoffTime: 30000 }

  deadLetterQueue: config.deadLetterQueue || { 
  enabled: true
  maxAge: 24 }

  partitioning: config.partitioning || { 
  strategy: 'user_id'
  partitionCount: 10 }
};
    this.initializePartitions();
    this.startBackgroundTasks();
  /**
   * Initialize stream partitions
   */
  private initializePartitions(): void { for (let i = 0; i < this.config.partitioning.partitionCount; i++) {
  this.partitions.set(i, {)
  id: i,
  events: [],
  offset: 0,
  lastProcessed: Date.now(),
  consumerCount: 0,
  lag: 0 }
});
      this.metrics.partitionMetrics.set(i, { )
  events: 0,
  lag: 0,
  throughput: 0 }
});
  /**
   * Start background monitoring and maintenance tasks
   */
  private startBackgroundTasks(): void { // Metrics collection
    this.metricsInterval = setInterval(() => {
      this.updateMetrics();
      this.emit('metrics_updated', this.metrics) }, 10000); // Every 10 seconds
    // Consumer heartbeat monitoring
    this.heartbeatInterval = setInterval(() => { this.checkConsumerHeartbeats() }, 30000); // Every 30 seconds
    // Cleanup dead letter queue
    this.cleanupInterval = setInterval(() => { this.cleanupDeadLetterQueue() }, 3600000); // Every hour
  /**
   * Publish conversion event to stream
   */
  public async publishEvent(
    event: EnhancedConversionEvent,
    headers: Record<string, string> = {}
  ): Promise<boolean> { try {
  const partition = this.selectPartition(event);
  const streamEvent: StreamEvent = {
  id: this.generateEventId()
  type: this.getEventType(event)
  payload: event
  partition
  offset: this.getNextOffset(partition)
  timestamp: Date.now()
  headers: {
  'content-type': 'application/json'
  'source': 'conversion-architecture' }
  ...headers

  retryCount: 0;
  };
      // Add to partition
      const partitionData = this.partitions.get(partition);
      if (!partitionData) {
        throw new Error(`Invalid partition: ${partition}`);}
      partitionData.events.push(streamEvent);
      partitionData.offset++;
      // Update metrics
      this.metrics.totalEvents++;
      const partitionMetrics = this.metrics.partitionMetrics.get(partition)!;
      partitionMetrics.events++;
      // Emit event for real-time processing
      this.emit('event_published', streamEvent);
      // Trigger processing if batch size reached
      if (partitionData.events.length >= this.config.batchSize) { this.processPartition(partition);
      return true } catch (error) {
      this.emit('publish_error', { event, error });
      return false;
  /**
   * Register event processor
   */
  public registerProcessor(name: string, processor: EventProcessor): void {
    this.processors.set(name, processor);
    this.emit('processor_registered', { name });
  /**
   * Register stream consumer
   */
  public registerConsumer(consumerId: string)
  groupId: string
    partitions: number = []): StreamConsumer { 
  // Auto-assign partitions if not specified
  const assignedPartitions = partitions.length > 0 ;
  ? partitions
  : this.autoAssignPartitions();
  const consumer: StreamConsumer = {
  id: consumerId
  groupId
  assignedPartitions
  lastHeartbeat: Date.now()
  processedOffset: new Map()
  isActive: true
  processingRate: 0 }
};
    this.consumers.set(consumerId, consumer);
    // Update partition consumer counts
    assignedPartitions.forEach(partitionId => { )
  const partition = this.partitions.get(partitionId);
      if (partition) {
        partition.consumerCount++ });
    this.emit('consumer_registered', consumer);
    return consumer;
  /**
   * Start stream processing
   */
  public start(): void { if (this.isRunning) return;
    this.isRunning = true;
    // Start periodic processing
    setInterval(() => {
      if (this.isRunning) {
        this.processAllPartitions() }, this.config.flushInterval);
    this.emit('processor_started');
  /**
   * Stop stream processing
   */
  public stop(): void { this.isRunning = false;
  // Clear intervals
  if (this.metricsInterval) clearInterval(this.metricsInterval);
  if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
  if (this.cleanupInterval) clearInterval(this.cleanupInterval);
  this.emit('processor_stopped');
  /**
  * Process all partitions
  */
  private async processAllPartitions(): Promise<void> {
  const promises = Array.from(this.partitions.keys()).map(partitionId => ;);
  this.processPartition(partitionId)
  );
  await Promise.allSettled(promises);
  /**
  * Process single partition
  */
  private async processPartition(partitionId: number): Promise<void> {
  const partition = this.partitions.get(partitionId);
  if (!partition || partition.events.length === 0) return;
  const eventsToProcess = partition.events.splice(0, this.config.batchSize);
  const startTime = Date.now();
  for (const event of eventsToProcess) {
  await this.processEvent(event);
  // Update partition metrics
  partition.lastProcessed = Date.now();
  const processingTime = Date.now() - startTime;
  const partitionMetrics = this.metrics.partitionMetrics.get(partitionId)!;
  partitionMetrics.throughput = eventsToProcess.length / (processingTime / 1000);
  partitionMetrics.lag = partition.events.length;
  /**
  * Process individual event
  */
  private async processEvent(event: StreamEvent): Promise<void> {
  const startTime = Date.now();
  try {
  // Process with all registered processors
  const processingPromises = Array.from(this.processors.entries()).map(;);
  async ([name, processor]) => {
  try {
  const result = await processor(event);
  // Update consumer metrics
  const consumerMetrics = this.metrics.consumerMetrics.get(name) || {
  processedEvents: 0
  errorCount: 0
  avgProcessingTime: 0 }
};
            consumerMetrics.processedEvents++;
            const processingTime = Date.now() - startTime;
            consumerMetrics.avgProcessingTime = 
              (consumerMetrics.avgProcessingTime + processingTime) / 2;
            if (!result.success) { consumerMetrics.errorCount++;
              if (result.retryable && event.retryCount < this.config.retryPolicy.maxRetries) {
                await this.retryEvent(event) } else { this.sendToDeadLetterQueue(event, result.error || 'Processing failed');
            this.metrics.consumerMetrics.set(name, consumerMetrics);
            return result } catch (error) {
            this.emit('processing_error', { event, processor: name, error });
            return { success: false,
  eventId: event.id,
  processingTime: Date.now() - startTime,
  error: String(error),
  retryable: true }
});
      await Promise.allSettled(processingPromises);
      this.emit('event_processed', event);
 catch (error) {
      this.emit('processing_error', { event, error });
      await this.retryEvent(event);
  /**
   * Retry event processing
   */
  private async retryEvent(event: StreamEvent): Promise<void> { event.retryCount++;
    if (event.retryCount <= this.config.retryPolicy.maxRetries) {
      // Calculate backoff delay
      const delay = Math.min(;);
        this.config.retryPolicy.backoffMultiplier ** event.retryCount * 1000 }
        this.config.retryPolicy.maxBackoffTime
      );
      setTimeout(() => {
        const partition = this.partitions.get(event.partition);
        if (partition) {
          partition.events.unshift(event); // Add to front for priority
      }, delay);
      this.emit('event_retried', { event, delay });
 else { this.sendToDeadLetterQueue(event, 'Max retries exceeded');
  /**
  * Send event to dead letter queue
  */
  private sendToDeadLetterQueue(event: StreamEvent, reason: string): void {,
  if (!this.config.deadLetterQueue.enabled) return;
  this.deadLetterQueue.push({)
  ...event,
  headers: {,
  ...event.headers,
  'dlq-reason': reason,
  'dlq-timestamp': Date.now().toString() }
});
    this.metrics.deadLetterQueue.size = this.deadLetterQueue.length;
    if (this.deadLetterQueue.length === 1) {
      this.metrics.deadLetterQueue.oldestEvent = event.timestamp;
    this.emit('event_dead_lettered', { event, reason });
  /**
   * Select partition for event
   */
  private selectPartition(event: EnhancedConversionEvent): number {
    const { strategy, partitionCount } = this.config.partitioning;
    switch (strategy) {
      case 'user_id':
        return this.hashCode(event.userId) % partitionCount;
      case 'session_id':
        return this.hashCode(event.sessionId) % partitionCount;
      case 'time_based':
        return Math.floor(Date.now() / 60000) % partitionCount; // Minute-based
      case 'random':
      default:
        return Math.floor(Math.random() * partitionCount);
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    return Math.abs(hash);
  /**
   * Auto-assign partitions to consumer
   */
  private autoAssignPartitions(): number {
    const partitionLoads = Array.from(this.partitions.entries());
      .map(([id, partition]) => ({ id, load: partition.consumerCount }))
      .sort((a, b) => a.load - b.load);
    // Assign to least loaded partitions
    const assignmentCount = Math.max(1, Math.floor(this.config.partitioning.partitionCount / 4));
    return partitionLoads.slice(0, assignmentCount).map(p => p.id);
  private getEventType(event: EnhancedConversionEvent): StreamEvent['type'] { if (event.type.includes('funnel')) return 'funnel_step';
  if (event.type.includes('attribution')) return 'attribution_update';
  if (event.type.includes('session')) return 'session_event';
  return 'conversion_event';
  private getNextOffset(partition: number): number {,
  const partitionData = this.partitions.get(partition);
  return partitionData ? partitionData.offset + 1 : 0;
  private updateMetrics(): void {,
  const now = Date.now();
  // Calculate events per second (based on last 10 seconds)
  const recentEvents = Array.from(this.partitions.values());
  .flatMap(p => p.events)
  .filter(e => (now - e.timestamp) < 10000).length;
  this.metrics.eventsPerSecond = recentEvents / 10;
  // Calculate average latency
  const recentProcessingTimes = Array.from(this.metrics.consumerMetrics.values());
  .map(m => m.avgProcessingTime)
  .filter(t => t > 0);
  this.metrics.averageLatency = recentProcessingTimes.length > 0
  ? recentProcessingTimes.reduce((sum, t) => sum + t, 0) / recentProcessingTimes.length
  : 0;
  private checkConsumerHeartbeats(): void { }
  const now = Date.now();
  const staleThreshold = 60000; // 1 minute;
  for (const [consumerId, consumer] of this.consumers.entries()) { if ((now - consumer.lastHeartbeat) > staleThreshold) {
  consumer.isActive = false;
  this.emit('consumer_stale', consumer);
  // Reassign partitions
  consumer.assignedPartitions.forEach(partitionId => {)
  const partition = this.partitions.get(partitionId);
  if (partition) {
  partition.consumerCount-- });
  private cleanupDeadLetterQueue(): void {
    if (!this.config.deadLetterQueue.enabled) return;
    const now = Date.now();
    const maxAge = this.config.deadLetterQueue.maxAge * 60 * 60 * 1000; // Convert hours to ms;
    const originalSize = this.deadLetterQueue.length;
    this.deadLetterQueue = this.deadLetterQueue.filter()
      event => (now - event.timestamp) < maxAge
    );
    const cleaned = originalSize - this.deadLetterQueue.length;
    if (cleaned > 0) {
      this.emit('dlq_cleaned', { cleaned, remaining: this.deadLetterQueue.length });
    this.metrics.deadLetterQueue.size = this.deadLetterQueue.length;
    this.metrics.deadLetterQueue.oldestEvent = this.deadLetterQueue.length > 0
      ? Math.min(...this.deadLetterQueue.map(e => e.timestamp))
      : 0;
  private generateEventId(): string {
    return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  /**
   * Consumer heartbeat
   */
  public heartbeat(consumerId: string): boolean {
    const consumer = this.consumers.get(consumerId);
    if (consumer) {
      consumer.lastHeartbeat = Date.now();
      consumer.isActive = true;
      return true;
    return false;
  /**
   * Get stream metrics
   */
  public getMetrics(): StreamMetrics {
    return { ...this.metrics };
  /**
   * Get partition info
   */
  public getPartitionInfo(partitionId: number): StreamPartition | null {
    return this.partitions.get(partitionId) || null;
  /**
   * Get dead letter queue events
   */
  public getDeadLetterQueue(): StreamEvent {
    return [...this.deadLetterQueue];
  /**
   * Reprocess dead letter queue event
   */
  public async reprocessDeadLetterEvent(eventId: string): Promise<boolean> {

    const eventIndex = this.deadLetterQueue.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return false;
    const event = this.deadLetterQueue.splice(eventIndex, 1)[0];
    event.retryCount = 0; // Reset retry count
    const partition = this.partitions.get(event.partition);
    if (partition) {
      partition.events.push(event);
      this.emit('dlq_event_reprocessed', event);
      return true;
    return false;
/**
 * Factory function to create ConversionStreamProcessor
 */
export };

export default ConversionStreamProcessor;