import { TransformationError, ValidationError, } from '../types/index.js';
/**
 * Abstract base class for all model adaptors.
 * Provides common functionality and enforces the adaptor interface.
 */
export class BaseAdaptor {
    constructor(id, version, platform, name, description, context) {
        this.id = id;
        this.version = version;
        this.platform = platform;
        this.name = name;
        this.description = description;
        this.logger = context.logger;
        this.cache = context.cache;
        this.metrics = context.metrics;
        this.config = context.config;
    }
    /**
     * Validates a prompt graph for compatibility with this adaptor
     */
    async validate(graph) {
        const timer = this.metrics.timer('adaptor.validate.duration');
        try {
            this.logger.debug('Starting validation', {
                adaptorId: this.id,
                graphId: graph.id,
            });
            // Basic structural validation
            const structuralResults = await this.validateStructure(graph);
            // Adaptor-specific validation
            const adaptorResults = await this.doValidate(graph);
            const allResults = [...structuralResults, ...adaptorResults];
            this.metrics.counter('adaptor.validate.total', 1, {
                adaptor: this.id,
                platform: this.platform,
            });
            this.metrics.counter('adaptor.validate.issues', allResults.length, {
                adaptor: this.id,
                platform: this.platform,
            });
            this.logger.info('Validation completed', {
                adaptorId: this.id,
                graphId: graph.id,
                issueCount: allResults.length,
            });
            return allResults;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.metrics.counter('adaptor.validate.error', 1, {
                adaptor: this.id,
                platform: this.platform,
            });
            this.logger.error('Validation failed', {
                adaptorId: this.id,
                graphId: graph.id,
                error: errorMessage,
            });
            throw new ValidationError(`Validation failed: ${errorMessage}`, []);
        }
        finally {
            timer.end();
        }
    }
    /**
     * Transforms a prompt graph into platform-specific format
     */
    async transform(graph, options) {
        const timer = this.metrics.timer('adaptor.transform.duration');
        try {
            this.logger.debug('Starting transformation', {
                adaptorId: this.id,
                graphId: graph.id,
                options,
            });
            // Validate first
            const validationResults = await this.validate(graph);
            const errors = validationResults.filter(r => r.type === 'error');
            if (errors.length > 0) {
                throw new ValidationError('Graph validation failed', validationResults);
            }
            // Check cache
            const cacheKey = this.generateCacheKey(graph, options);
            const cached = await this.cache.get(cacheKey);
            if (cached) {
                this.metrics.counter('adaptor.transform.cache.hit', 1, {
                    adaptor: this.id,
                    platform: this.platform,
                });
                this.logger.debug('Cache hit for transformation', {
                    adaptorId: this.id,
                    graphId: graph.id,
                    cacheKey,
                });
                return cached;
            }
            // Perform transformation
            const result = await this.doTransform(graph, options);
            // Cache the result
            await this.cache.set(cacheKey, result, this.getCacheTTL());
            this.metrics.counter('adaptor.transform.success', 1, {
                adaptor: this.id,
                platform: this.platform,
            });
            this.metrics.counter('adaptor.transform.cache.miss', 1, {
                adaptor: this.id,
                platform: this.platform,
            });
            this.logger.info('Transformation completed', {
                adaptorId: this.id,
                graphId: graph.id,
                quality: result.metadata.quality.overall,
            });
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.metrics.counter('adaptor.transform.error', 1, {
                adaptor: this.id,
                platform: this.platform,
            });
            this.logger.error('Transformation failed', {
                adaptorId: this.id,
                graphId: graph.id,
                error: errorMessage,
            });
            if (error instanceof ValidationError || error instanceof TransformationError) {
                throw error;
            }
            throw new TransformationError(`Transformation failed: ${errorMessage}`);
        }
        finally {
            timer.end();
        }
    }
    /**
     * Estimates the quality of transformation for a given graph
     */
    async estimateQuality(graph) {
        try {
            const capabilities = await this.capabilities();
            const validationResults = await this.validate(graph);
            return this.calculateQualityScore(graph, capabilities, validationResults);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.warn('Quality estimation failed', {
                adaptorId: this.id,
                graphId: graph.id,
                error: errorMessage,
            });
            // Return a low quality score if estimation fails
            return {
                overall: 10,
                fidelity: 10,
                compatibility: 10,
                performance: 10,
                completeness: 10,
                breakdown: {
                    nodeTranslation: 10,
                    parameterMapping: 10,
                    featureSupport: 10,
                    semanticPreservation: 10,
                    syntaxValidity: 10,
                },
            };
        }
    }
    /**
     * Basic structural validation common to all adaptors
     */
    async validateStructure(graph) {
        const results = [];
        // Check for empty graph
        if (!graph.nodes || graph.nodes.length === 0) {
            results.push({
                id: 'empty-graph',
                type: 'error',
                severity: 'critical',
                message: 'Graph is empty',
                description: 'The prompt graph contains no nodes',
                autoFixable: false,
            });
        }
        // Check for disconnected nodes
        const nodeIds = new Set(graph.nodes.map(n => n.id));
        const connectedNodes = new Set();
        graph.edges.forEach(edge => {
            connectedNodes.add(edge.source);
            connectedNodes.add(edge.target);
        });
        graph.nodes.forEach(node => {
            if (!connectedNodes.has(node.id) && graph.nodes.length > 1) {
                results.push({
                    id: `disconnected-node-${node.id}`,
                    type: 'warning',
                    severity: 'medium',
                    message: 'Disconnected node detected',
                    description: `Node "${node.data.label || node.id}" is not connected to the graph`,
                    nodeId: node.id,
                    autoFixable: true,
                    suggestions: [
                        {
                            type: 'fix',
                            description: 'Remove disconnected node or connect it to the graph',
                        },
                    ],
                });
            }
        });
        // Check for invalid edges
        graph.edges.forEach(edge => {
            if (!nodeIds.has(edge.source)) {
                results.push({
                    id: `invalid-edge-source-${edge.id}`,
                    type: 'error',
                    severity: 'high',
                    message: 'Invalid edge source',
                    description: `Edge "${edge.id}" references non-existent source node "${edge.source}"`,
                    edgeId: edge.id,
                    autoFixable: true,
                });
            }
            if (!nodeIds.has(edge.target)) {
                results.push({
                    id: `invalid-edge-target-${edge.id}`,
                    type: 'error',
                    severity: 'high',
                    message: 'Invalid edge target',
                    description: `Edge "${edge.id}" references non-existent target node "${edge.target}"`,
                    edgeId: edge.id,
                    autoFixable: true,
                });
            }
        });
        return results;
    }
    /**
     * Calculate quality score based on graph, capabilities, and validation results
     */
    calculateQualityScore(graph, capabilities, validationResults) {
        const errors = validationResults.filter(r => r.type === 'error').length;
        const warnings = validationResults.filter(r => r.type === 'warning').length;
        // Node type support analysis
        const unsupportedNodes = graph.nodes.filter(node => !capabilities.supportedNodeTypes.includes(node.type)).length;
        const nodeSupport = Math.max(0, 100 - (unsupportedNodes / graph.nodes.length) * 100);
        // Error/warning impact
        const errorImpact = Math.max(0, 100 - errors * 25);
        const warningImpact = Math.max(0, 100 - warnings * 10);
        // Feature completeness
        const featureSupport = (capabilities.features.filter(f => f.supported).length / Math.max(1, capabilities.features.length)) * 100;
        // Overall calculations
        const fidelity = (nodeSupport + errorImpact) / 2;
        const compatibility = (nodeSupport + featureSupport) / 2;
        const performance = warningImpact;
        const completeness = featureSupport;
        const overall = (fidelity + compatibility + performance + completeness) / 4;
        return {
            overall: Math.round(overall),
            fidelity: Math.round(fidelity),
            compatibility: Math.round(compatibility),
            performance: Math.round(performance),
            completeness: Math.round(completeness),
            breakdown: {
                nodeTranslation: Math.round(nodeSupport),
                parameterMapping: Math.round(featureSupport),
                featureSupport: Math.round(featureSupport),
                semanticPreservation: Math.round(fidelity),
                syntaxValidity: Math.round(errorImpact),
            },
        };
    }
    /**
     * Generate cache key for a graph and options combination
     */
    generateCacheKey(graph, options) {
        const graphHash = this.hashObject({
            nodes: graph.nodes,
            edges: graph.edges,
            version: graph.version,
        });
        const optionsHash = options ? this.hashObject(options) : 'none';
        return `${this.id}:${this.version}:${graphHash}:${optionsHash}`;
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
    /**
     * Get cache TTL for this adaptor's results
     */
    getCacheTTL() {
        return this.config.cacheTTL || 3600; // Default 1 hour
    }
    /**
     * Helper to create validation results
     */
    createValidationResult(id, type, severity, message, options = {}) {
        return {
            id,
            type,
            severity,
            message,
            description: options.description,
            nodeId: options.nodeId,
            edgeId: options.edgeId,
            autoFixable: options.autoFixable || false,
            suggestions: options.suggestions || [],
        };
    }
}
