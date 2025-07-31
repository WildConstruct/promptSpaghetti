import { Platform, PromptGraph, TargetPrompt } from '../types/index.js';
/**
 * Preview generation request
 */
export interface PreviewRequest {
  id: string;
  graph: PromptGraph;
  platform: Platform;
  parameters?: Record<string, any>;
  options?: PreviewOptions;
}
/**
 * Preview generation options
 */
export interface PreviewOptions {
  lowResolution?: boolean;
  fastMode?: boolean;
  maxVariations?: number;
  cacheKey?: string;
  timeout?: number;
}
/**
 * Preview generation result
 */
export interface PreviewResult {
  id: string;
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'cached';
  platform: Platform;
  prompt: TargetPrompt;
  images?: PreviewImage[];
  error?: string;
  metadata: PreviewMetadata;
}
/**
 * Preview image data
 */
export interface PreviewImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  width: number;
  height: number;
  format: string;
  size: number;
  generationTime: number;
  parameters: Record<string, any>;
  metadata?: Record<string, any>;
}
/**
 * Preview metadata
 */
export interface PreviewMetadata {
  requestTime: Date;
  generationTime?: Date;
  completionTime?: Date;
  processingDuration?: number;
  estimatedCost?: number;
  cacheHit?: boolean;
  quality?: number;
  variations?: number;
}
/**
 * Preview queue status
 */
export interface QueueStatus {
  pending: number;
  generating: number;
  completed: number;
  failed: number;
  averageWaitTime: number;
  estimatedPosition?: number;
}
/**
 * Preview generation progress callback
 */
export type ProgressCallback = (progress: {
  requestId: string;
  status: PreviewResult['status'];
  progress: number;
  message?: string;
}) => void;
/**
 * Comprehensive preview generation system for text-to-image models
 */
export declare class PreviewGenerationSystem {
  private queue;
  private processing;
  private results;
  private cache;
  private callbacks;
  private maxConcurrent;
  private maxQueueSize;
  private cacheMaxSize;
  private cacheTTL;
  private requestTimeout;
  /**
   * Request preview generation
   */
  requestPreview(request: PreviewRequest, onProgress?: ProgressCallback): Promise<string>;
  /**
   * Get preview result
   */
  getPreviewResult(requestId: string): PreviewResult | null;
  /**
   * Cancel preview request
   */
  cancelPreview(requestId: string): boolean;
  /**
   * Get current queue status
   */
  getQueueStatus(): QueueStatus;
  /**
   * Clear completed results
   */
  clearCompletedResults(): void;
  /**
   * Process the preview queue
   */
  private processQueue;
  /**
   * Generate images (mock implementation - replace with actual API calls)
   */
  private generateImages;
  /**
   * Build target prompt for the request
   */
  private buildTargetPrompt;
  /**
   * Generate cache key for request
   */
  private generateCacheKey;
  /**
   * Get cached result if available and valid
   */
  private getCachedResult;
  /**
   * Cache a result
   */
  private cacheResult;
  /**
   * Clean cache by removing oldest/least used entries
   */
  private cleanCache;
  /**
   * Notify progress to callback
   */
  private notifyProgress;
  /**
   * Simple object hashing for cache keys
   */
  private hashObject;
}
/**
 * Global preview generation system instance
 */
export declare const previewGenerationSystem: PreviewGenerationSystem;
