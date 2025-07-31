/**
 * Cross-platform analytics client
 */
export class AnalyticsClient {
    config;
    eventQueue = [];
    metricsQueue = [];
    constructor(config) {
        this.config = config;
    }
    track(event) {
        const fullEvent = {
            ...event,
            timestamp: new Date(),
            platform: this.config.platform,
        };
        this.eventQueue.push(fullEvent);
        if (this.eventQueue.length >= (this.config.batchSize || 10)) {
            this.flush();
        }
    }
    trackPerformance(metric) {
        const fullMetric = {
            ...metric,
            timestamp: new Date(),
            platform: this.config.platform,
        };
        this.metricsQueue.push(fullMetric);
    }
    async flush() {
        // TODO: Implement actual data sending to Epic 13 ClickHouse
        if (this.eventQueue.length > 0) {
            console.log(`Flushing ${this.eventQueue.length} events`, this.eventQueue);
            this.eventQueue = [];
        }
        if (this.metricsQueue.length > 0) {
            console.log(`Flushing ${this.metricsQueue.length} metrics`, this.metricsQueue);
            this.metricsQueue = [];
        }
    }
}
//# sourceMappingURL=client.js.map