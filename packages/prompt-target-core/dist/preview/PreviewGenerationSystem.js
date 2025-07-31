/**
 * Comprehensive preview generation system for text-to-image models
 */
export class PreviewGenerationSystem {
    constructor() {
        this.queue = [];
        this.processing = new Map();
        this.results = new Map();
        this.cache = new Map();
        this.callbacks = new Map();
        this.maxConcurrent = 3;
        this.maxQueueSize = 50;
        this.cacheMaxSize = 1000;
        this.cacheTTL = 24 * 60 * 60 * 1000; // 24 hours
        this.requestTimeout = 60000; // 60 seconds
    }
    /**
     * Request preview generation
     */
    async requestPreview(request, onProgress) {
        // Check cache first
        const cacheKey = this.generateCacheKey(request);
        const cached = this.getCachedResult(cacheKey);
        if (cached) {
            if (onProgress) {
                onProgress({
                    requestId: request.id,
                    status: 'completed',
                    progress: 100,
                    message: 'Retrieved from cache',
                });
            }
            this.results.set(request.id, {
                ...cached,
                id: request.id,
                metadata: {
                    ...cached.metadata,
                    cacheHit: true,
                },
            });
            return request.id;
        }
        // Register progress callback
        if (onProgress) {
            this.callbacks.set(request.id, onProgress);
        }
        // Add to queue
        if (this.queue.length >= this.maxQueueSize) {
            throw new Error('Preview queue is full. Please try again later.');
        }
        this.queue.push(request);
        // Create initial result
        this.results.set(request.id, {
            id: request.id,
            status: 'pending',
            platform: request.platform,
            prompt: await this.buildTargetPrompt(request),
            metadata: {
                requestTime: new Date(),
            },
        });
        // Start processing if possible
        this.processQueue();
        return request.id;
    }
    /**
     * Get preview result
     */
    getPreviewResult(requestId) {
        return this.results.get(requestId) || null;
    }
    /**
     * Cancel preview request
     */
    cancelPreview(requestId) {
        // Remove from queue
        const queueIndex = this.queue.findIndex(req => req.id === requestId);
        if (queueIndex >= 0) {
            this.queue.splice(queueIndex, 1);
            this.results.delete(requestId);
            this.callbacks.delete(requestId);
            return true;
        }
        // Cancel if currently processing
        if (this.processing.has(requestId)) {
            // Update status to failed
            const result = this.results.get(requestId);
            if (result) {
                result.status = 'failed';
                result.error = 'Cancelled by user';
            }
            this.processing.delete(requestId);
            this.callbacks.delete(requestId);
            return true;
        }
        return false;
    }
    /**
     * Get current queue status
     */
    getQueueStatus() {
        const pending = this.queue.length;
        const generating = this.processing.size;
        const completed = Array.from(this.results.values()).filter(r => r.status === 'completed').length;
        const failed = Array.from(this.results.values()).filter(r => r.status === 'failed').length;
        // Calculate average wait time based on recent completions
        const recentCompletions = Array.from(this.results.values())
            .filter(r => r.status === 'completed' && r.metadata.processingDuration)
            .slice(-10);
        const averageWaitTime = recentCompletions.length > 0
            ? recentCompletions.reduce((sum, r) => sum + (r.metadata.processingDuration || 0), 0) / recentCompletions.length
            : 30000; // Default 30 seconds
        return {
            pending,
            generating,
            completed,
            failed,
            averageWaitTime,
        };
    }
    /**
     * Clear completed results
     */
    clearCompletedResults() {
        const toDelete = [];
        for (const [id, result] of this.results.entries()) {
            if (result.status === 'completed' || result.status === 'failed') {
                toDelete.push(id);
            }
        }
        toDelete.forEach(id => {
            this.results.delete(id);
            this.callbacks.delete(id);
        });
    }
    /**
     * Process the preview queue
     */
    async processQueue() {
        // Check if we can process more items
        if (this.processing.size >= this.maxConcurrent || this.queue.length === 0) {
            return;
        }
        const request = this.queue.shift();
        if (!request)
            return;
        this.processing.set(request.id, request);
        // Update status to generating
        const result = this.results.get(request.id);
        if (result) {
            result.status = 'generating';
            result.metadata.generationTime = new Date();
        }
        this.notifyProgress(request.id, 'generating', 10, 'Starting generation...');
        try {
            // Simulate image generation (replace with actual API calls)
            const images = await this.generateImages(request);
            // Update result with images
            if (result) {
                result.status = 'completed';
                result.images = images;
                result.metadata.completionTime = new Date();
                result.metadata.processingDuration =
                    result.metadata.completionTime.getTime() -
                        (result.metadata.generationTime?.getTime() || result.metadata.requestTime.getTime());
            }
            // Cache the result
            const cacheKey = this.generateCacheKey(request);
            this.cacheResult(cacheKey, result);
            this.notifyProgress(request.id, 'completed', 100, 'Generation completed');
        }
        catch (error) {
            // Handle generation error
            if (result) {
                result.status = 'failed';
                result.error = error instanceof Error ? error.message : 'Unknown error';
                result.metadata.completionTime = new Date();
            }
            this.notifyProgress(request.id, 'failed', 0, `Generation failed: ${error}`);
        }
        finally {
            this.processing.delete(request.id);
            this.callbacks.delete(request.id);
            // Process next item in queue
            this.processQueue();
        }
    }
    /**
     * Generate images (mock implementation - replace with actual API calls)
     */
    async generateImages(request) {
        const startTime = Date.now();
        // Simulate generation delay
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
        this.notifyProgress(request.id, 'generating', 50, 'Processing prompt...');
        // Simulate more delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        this.notifyProgress(request.id, 'generating', 80, 'Finalizing image...');
        const generationTime = Date.now() - startTime;
        const variations = Math.min(request.options?.maxVariations || 1, 4);
        const images = [];
        for (let i = 0; i < variations; i++) {
            // In a real implementation, these would be actual generated images
            images.push({
                id: `${request.id}-${i}`,
                url: `https://example.com/generated/${request.id}-${i}.jpg`,
                thumbnailUrl: `https://example.com/generated/thumb/${request.id}-${i}.jpg`,
                width: request.options?.lowResolution ? 512 : 1024,
                height: request.options?.lowResolution ? 512 : 1024,
                format: 'jpeg',
                size: 1024 * 1024, // 1MB
                generationTime,
                parameters: request.parameters || {},
                metadata: {
                    seed: Math.floor(Math.random() * 1000000),
                    variation: i,
                    platform: request.platform,
                },
            });
        }
        return images;
    }
    /**
     * Build target prompt for the request
     */
    async buildTargetPrompt(request) {
        // This would use the actual adaptor to transform the graph
        // For now, return a mock target prompt
        return {
            platform: request.platform,
            content: 'Mock generated prompt',
            parameters: request.parameters || {},
            format: `${request.platform}_prompt`,
            metadata: {
                originalGraphId: request.graph.id,
                translationId: `preview-${request.id}`,
                timestamp: new Date(),
                adaptorVersion: '1.0.0',
                quality: {
                    overall: 0.8,
                    fidelity: 0.8,
                    compatibility: 0.8,
                    performance: 0.8,
                    completeness: 0.8,
                    breakdown: {
                        nodeTranslation: 0.8,
                        parameterMapping: 0.8,
                        featureSupport: 0.8,
                        semanticPreservation: 0.8,
                        syntaxValidity: 0.8,
                    },
                },
                warnings: [],
                transformations: [],
            },
        };
    }
    /**
     * Generate cache key for request
     */
    generateCacheKey(request) {
        const graphHash = this.hashObject(request.graph);
        const paramHash = this.hashObject(request.parameters || {});
        const optionsHash = this.hashObject(request.options || {});
        return `${request.platform}-${graphHash}-${paramHash}-${optionsHash}`;
    }
    /**
     * Get cached result if available and valid
     */
    getCachedResult(cacheKey) {
        const cached = this.cache.get(cacheKey);
        if (!cached)
            return null;
        // Check if cache entry is still valid
        const age = Date.now() - cached.timestamp.getTime();
        if (age > this.cacheTTL) {
            this.cache.delete(cacheKey);
            return null;
        }
        // Update access time and hit count
        cached.lastAccessed = new Date();
        cached.hits++;
        return cached.result;
    }
    /**
     * Cache a result
     */
    cacheResult(cacheKey, result) {
        // Only cache successful results
        if (result.status !== 'completed')
            return;
        // Clean cache if at capacity
        if (this.cache.size >= this.cacheMaxSize) {
            this.cleanCache();
        }
        this.cache.set(cacheKey, {
            result: { ...result },
            timestamp: new Date(),
            hits: 1,
            lastAccessed: new Date(),
        });
    }
    /**
     * Clean cache by removing oldest/least used entries
     */
    cleanCache() {
        const entries = Array.from(this.cache.entries());
        // Sort by last accessed time (oldest first)
        entries.sort((a, b) => a[1].lastAccessed.getTime() - b[1].lastAccessed.getTime());
        // Remove oldest 25% of entries
        const toRemove = Math.floor(entries.length * 0.25);
        for (let i = 0; i < toRemove; i++) {
            this.cache.delete(entries[i][0]);
        }
    }
    /**
     * Notify progress to callback
     */
    notifyProgress(requestId, status, progress, message) {
        const callback = this.callbacks.get(requestId);
        if (callback) {
            callback({ requestId, status, progress, message });
        }
    }
    /**
     * Simple object hashing for cache keys
     */
    hashObject(obj) {
        const str = JSON.stringify(obj, Object.keys(obj).sort());
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }
}
/**
 * Global preview generation system instance
 */
export const previewGenerationSystem = new PreviewGenerationSystem();
