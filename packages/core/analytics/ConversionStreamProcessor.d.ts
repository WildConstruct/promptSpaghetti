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

}
export interface StreamEvent {
    id: string;
    type: 'conversion_event' | 'funnel_step' | 'attribution_update' | 'session_event';
    payload: EnhancedConversionEvent;
    partition: number;
    offset: number;
    timestamp: number;
    headers: Record<string, string>;
    retryCount: number;

}
export interface StreamPartition {
    id: number;
    events: StreamEvent[];
    offset: number;
    lastProcessed: number;
    consumerCount: number;
    lag: number;

}
export interface StreamConsumer {
    id: string;
    groupId: string;
    assignedPartitions: number[];
    lastHeartbeat: number;
    processedOffset: Map<number, number>;
    isActive: boolean;
    processingRate: number;

}
export interface StreamMetrics {
    totalEvents: number;
    eventsPerSecond: number;
    averageLatency: number;
    partitionMetrics: Map<number, {
        events: number;
        lag: number;
        throughput: number;
}
    }>;
    consumerMetrics: Map<string, {
        processedEvents: number;
        errorCount: number;
        avgProcessingTime: number;
    }>;
    deadLetterQueue: {
        size: number;
        oldestEvent: number;
    };

}
export interface ProcessingResult {
    success: boolean;
    eventId: string;
    processingTime: number;
    error?: string;
    retryable: boolean;

export type EventProcessor = (event: StreamEvent) => Promise<ProcessingResult>;
/**
 * Conversion Stream Processor
 * Manages real-time conversion event streaming with fault tolerance
 */
export declare class ConversionStreamProcessor extends EventEmitter {
    private config;
    private partitions;
    private consumers;
    private processors;
    private deadLetterQueue;
    private isRunning;
    private metricsInterval;
    private heartbeatInterval;
    private cleanupInterval;
    private metrics;
    constructor(config: FunnelStreamConfig);
    /**
     * Initialize stream partitions
     */
    private initializePartitions;
    /**
     * Start background monitoring and maintenance tasks
     */
    private startBackgroundTasks;
    /**
     * Publish conversion event to stream
     */
    publishEvent(event: EnhancedConversionEvent, headers?: Record<string, string>): Promise<boolean>;
    /**
     * Register event processor
     */
    registerProcessor(name: string, processor: EventProcessor): void;
    /**
     * Register stream consumer
     */
    registerConsumer(consumerId: string, groupId: string, partitions?: number[]): StreamConsumer;
    /**
     * Start stream processing
     */
    start(): void;
    /**
     * Stop stream processing
     */
    stop(): void;
    /**
     * Process all partitions
     */
    private processAllPartitions;
    /**
     * Process single partition
     */
    private processPartition;
    /**
     * Process individual event
     */
    private processEvent;
    /**
     * Retry event processing
     */
    private retryEvent;
    /**
     * Send event to dead letter queue
     */
    private sendToDeadLetterQueue;
    /**
     * Select partition for event
     */
    private selectPartition;
    private hashCode;
    /**
     * Auto-assign partitions to consumer
     */
    private autoAssignPartitions;
    private getEventType;
    private getNextOffset;
    private updateMetrics;
    private checkConsumerHeartbeats;
    private cleanupDeadLetterQueue;
    private generateEventId;
    /**
     * Consumer heartbeat
     */
    heartbeat(consumerId: string): boolean;
    /**
     * Get stream metrics
     */
    getMetrics(): StreamMetrics;
    /**
     * Get partition info
     */
    getPartitionInfo(partitionId: number): StreamPartition | null;
    /**
     * Get dead letter queue events
     */
    getDeadLetterQueue(): StreamEvent[];
    /**
     * Reprocess dead letter queue event
     */
    reprocessDeadLetterEvent(eventId: string): Promise<boolean>;
/**
 * Factory function to create ConversionStreamProcessor
 */
export declare export default ConversionStreamProcessor;
//# sourceMappingURL=ConversionStreamProcessor.d.ts.map
}