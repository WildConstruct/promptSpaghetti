/**
 * Enhanced adaptor registry for lifecycle management
 */
export class AdaptorRegistry {
    constructor(logger, metrics, healthCheckIntervalMs = 60000 // 1 minute
    ) {
        this.logger = logger;
        this.metrics = metrics;
        this.healthCheckIntervalMs = healthCheckIntervalMs;
        this.adaptors = new Map();
        this.healthStatuses = new Map();
    }
    /**
     * Register an adaptor with lifecycle management
     */
    async register(id, adaptor, context) {
        try {
            await adaptor.initialize(context);
            this.adaptors.set(id, adaptor);
            const health = await adaptor.healthCheck();
            this.healthStatuses.set(id, health);
            this.logger.info('Adaptor registered successfully', {
                adaptorId: id,
                healthy: health.healthy
            });
            this.metrics.counter('adaptor.registered', 1, { adaptor_id: id });
            // Start health checking if this is the first adaptor
            if (this.adaptors.size === 1) {
                this.startHealthChecking();
            }
        }
        catch (error) {
            this.logger.error('Failed to register adaptor', {
                adaptorId: id,
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }
    /**
     * Unregister an adaptor and cleanup resources
     */
    async unregister(id) {
        const adaptor = this.adaptors.get(id);
        if (adaptor) {
            try {
                await adaptor.destroy();
                this.adaptors.delete(id);
                this.healthStatuses.delete(id);
                this.logger.info('Adaptor unregistered successfully', { adaptorId: id });
                this.metrics.counter('adaptor.unregistered', 1, { adaptor_id: id });
                // Stop health checking if no adaptors remain
                if (this.adaptors.size === 0) {
                    this.stopHealthChecking();
                }
            }
            catch (error) {
                this.logger.error('Error during adaptor cleanup', {
                    adaptorId: id,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }
    }
    /**
     * Get all registered adaptors
     */
    getAdaptors() {
        return new Map(this.adaptors);
    }
    /**
     * Get health status for all adaptors
     */
    getHealthStatuses() {
        return new Map(this.healthStatuses);
    }
    /**
     * Get health status for specific adaptor
     */
    getHealthStatus(adaptorId) {
        return this.healthStatuses.get(adaptorId);
    }
    /**
     * Force health check for all adaptors
     */
    async checkHealth() {
        const results = new Map();
        for (const [id, adaptor] of this.adaptors.entries()) {
            try {
                const health = await adaptor.healthCheck();
                this.healthStatuses.set(id, health);
                results.set(id, health);
                this.metrics.gauge('adaptor.health.status', health.healthy ? 1 : 0, {
                    adaptor_id: id
                });
            }
            catch (error) {
                const unhealthyStatus = {
                    healthy: false,
                    status: 'unhealthy',
                    lastChecked: new Date(),
                    details: {
                        connectivity: {
                            reachable: false,
                            errorMessage: error instanceof Error ? error.message : String(error)
                        },
                        capabilities: { available: false },
                        configuration: { valid: false },
                        dependencies: []
                    },
                    metrics: {
                        uptime: 0,
                        requestCount: 0,
                        successRate: 0,
                        averageResponseTime: 0,
                        errorRate: 1,
                        lastError: {
                            timestamp: new Date(),
                            message: error instanceof Error ? error.message : String(error),
                            type: error instanceof Error ? error.constructor.name : 'Unknown'
                        }
                    }
                };
                this.healthStatuses.set(id, unhealthyStatus);
                results.set(id, unhealthyStatus);
                this.logger.error('Health check failed', {
                    adaptorId: id,
                    error: error instanceof Error ? error.message : String(error)
                });
            }
        }
        return results;
    }
    /**
     * Start periodic health checking
     */
    startHealthChecking() {
        if (this.healthCheckInterval) {
            return; // Already running
        }
        this.healthCheckInterval = setInterval(async () => {
            await this.checkHealth();
        }, this.healthCheckIntervalMs);
        this.logger.info('Started adaptor health checking', {
            intervalMs: this.healthCheckIntervalMs
        });
    }
    /**
     * Stop periodic health checking
     */
    stopHealthChecking() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = undefined;
            this.logger.info('Stopped adaptor health checking');
        }
    }
    /**
     * Cleanup all adaptors and stop health checking
     */
    async destroy() {
        this.stopHealthChecking();
        const cleanupPromises = Array.from(this.adaptors.keys()).map(id => this.unregister(id));
        await Promise.all(cleanupPromises);
        this.logger.info('Adaptor registry destroyed');
    }
}
