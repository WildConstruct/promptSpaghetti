/**
 * Base adaptor implementation for platform-specific prompt translation
 * Epic 10.1.2 - Common Interface Definition
 */
import { AdaptorError, ValidationError, TranslationError } from '../types';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
/**
 * Abstract base class for all platform adaptors
 * Provides common functionality and enforces interface compliance
 */
export class BaseAdaptor {
    initialized = false;
    config = {};
    logger = console;
    /**
     * Initialize the adaptor with configuration
     */
    async initialize(config = {}) {
        try {
            this.config = { ...this.getDefaultConfig(), ...config };
            await this.onInitialize();
            this.initialized = true;
            this.logger.log(`Adaptor ${this.id} v${this.version} initialized successfully`);
        }
        catch (error) {
            throw new AdaptorError(`Failed to initialize adaptor ${this.id}: ${error instanceof Error ? error.message : 'Unknown error'}`, this.id, 'INITIALIZATION_ERROR', { config, error });
        }
    }
    /**
     * Clean up adaptor resources
     */
    async cleanup() {
        try {
            await this.onCleanup();
            this.initialized = false;
            this.logger.log(`Adaptor ${this.id} cleaned up successfully`);
        }
        catch (error) {
            this.logger.error(`Error cleaning up adaptor ${this.id}:`, error);
        }
    }
    /**
     * Validate a prompt graph for this platform
     */
    async validate(graph, config) {
        this.ensureInitialized();
        try {
            // Base validation checks
            const baseValidation = await this.performBaseValidation(graph, config);
            // Platform-specific validation
            const platformValidation = await this.performPlatformValidation(graph, config);
            // Combine results
            return this.combineValidationResults(baseValidation, platformValidation);
        }
        catch (error) {
            throw new ValidationError(`Validation failed for adaptor ${this.id}: ${error instanceof Error ? error.message : 'Unknown error'}`, [], 'VALIDATION_FAILED');
        }
    }
    /**
     * Transform a prompt graph to platform-specific format
     */
    async transform(graph, config) {
        this.ensureInitialized();
        try {
            // Validate first
            const validation = await this.validate(graph, config);
            if (!validation.valid) {
                throw new ValidationError('Graph validation failed before transformation', validation.errors, 'PRE_TRANSFORM_VALIDATION_FAILED');
            }
            // Perform transformation
            const startTime = Date.now();
            const result = await this.performTransformation(graph, config);
            const transformTime = Date.now() - startTime;
            // Add metadata
            const sourceHash = this.generateGraphHash(graph);
            const platformPrompt = {
                ...result,
                metadata: {
                    sourceHash,
                    timestamp: new Date(),
                    qualityScore: validation.compatibilityScore,
                    optimizations: await this.getAppliedOptimizations(graph, config),
                    ...result.metadata,
                    transformTime
                }
            };
            this.logger.log(`Transform completed for ${this.id} in ${transformTime}ms`);
            return platformPrompt;
        }
        catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            throw new TranslationError(`Transformation failed for adaptor ${this.id}: ${error instanceof Error ? error.message : 'Unknown error'}`, this.platforms[0], 'TRANSFORMATION_FAILED', { graph, config, error });
        }
    }
    /**
     * Get default configuration for this adaptor
     */
    getDefaultConfig() {
        return {
            enableOptimizations: true,
            qualityPreference: 0.7,
            stylePreference: 'default'
        };
    }
    /**
     * Lifecycle hook for initialization
     */
    async onInitialize() {
        // Override in subclasses
    }
    /**
     * Lifecycle hook for cleanup
     */
    async onCleanup() {
        // Override in subclasses
    }
    /**
     * Base validation checks common to all platforms
     */
    async performBaseValidation(graph, config) {
        const errors = [];
        const warnings = [];
        // Check if graph exists and has basic structure
        if (!graph) {
            errors.push({
                code: 'MISSING_GRAPH',
                message: 'No graph provided for validation',
                severity: 'error'
            });
            return { valid: false, errors, warnings, compatibilityScore: 0 };
        }
        // Check for required graph properties
        if (!graph.nodes || !Array.isArray(graph.nodes)) {
            errors.push({
                code: 'INVALID_GRAPH_STRUCTURE',
                message: 'Graph must contain a nodes array',
                severity: 'error'
            });
        }
        if (!graph.edges || !Array.isArray(graph.edges)) {
            errors.push({
                code: 'INVALID_GRAPH_STRUCTURE',
                message: 'Graph must contain an edges array',
                severity: 'error'
            });
        }
        // Check for empty graph
        if (graph.nodes && graph.nodes.length === 0) {
            warnings.push({
                code: 'EMPTY_GRAPH',
                message: 'Graph contains no nodes',
                optimization: 'Add content nodes to generate meaningful output'
            });
        }
        // Calculate base compatibility score
        const errorWeight = 0.5;
        const warningWeight = 0.1;
        const maxScore = 1.0;
        const errorPenalty = errors.length * errorWeight;
        const warningPenalty = warnings.length * warningWeight;
        const compatibilityScore = Math.max(0, maxScore - errorPenalty - warningPenalty);
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            compatibilityScore
        };
    }
    /**
     * Combine multiple validation results
     */
    combineValidationResults(...results) {
        const allErrors = results.flatMap(r => r.errors);
        const allWarnings = results.flatMap(r => r.warnings);
        const avgCompatibilityScore = results.reduce((sum, r) => sum + r.compatibilityScore, 0) / results.length;
        return {
            valid: allErrors.length === 0,
            errors: allErrors,
            warnings: allWarnings,
            compatibilityScore: avgCompatibilityScore
        };
    }
    /**
     * Generate a hash for the source graph
     */
    generateGraphHash(graph) {
        const graphString = JSON.stringify(graph, Object.keys(graph).sort());
        return createHash('sha256').update(graphString).digest('hex').substring(0, 16);
    }
    /**
     * Get list of optimizations applied during transformation
     */
    async getAppliedOptimizations(graph, config) {
        const optimizations = [];
        if (config?.enableOptimizations !== false) {
            optimizations.push('parameter-normalization');
            // Add platform-specific optimizations
            const platformOptimizations = await this.getPlatformOptimizations(graph, config);
            optimizations.push(...platformOptimizations);
        }
        return optimizations;
    }
    /**
     * Get platform-specific optimizations (override in subclasses)
     */
    async getPlatformOptimizations(graph, config) {
        return [];
    }
    /**
     * Ensure adaptor is initialized before operations
     */
    ensureInitialized() {
        if (!this.initialized) {
            throw new AdaptorError(`Adaptor ${this.id} must be initialized before use`, this.id, 'NOT_INITIALIZED');
        }
    }
    /**
     * Normalize parameter value to platform range
     */
    normalizeParameter(value, sourceRange, targetRange) {
        const [sourceMin, sourceMax] = sourceRange;
        const [targetMin, targetMax] = targetRange;
        // Clamp to source range
        const clampedValue = Math.max(sourceMin, Math.min(sourceMax, value));
        // Normalize to 0-1
        const normalized = (clampedValue - sourceMin) / (sourceMax - sourceMin);
        // Scale to target range
        return targetMin + normalized * (targetMax - targetMin);
    }
    /**
     * Extract text content from graph nodes
     */
    extractTextContent(graph) {
        if (!graph.nodes || !Array.isArray(graph.nodes)) {
            return '';
        }
        return graph.nodes
            .filter((node) => node.data?.text || node.data?.content)
            .map((node) => node.data.text || node.data.content)
            .join(' ')
            .trim();
    }
    /**
     * Extract style information from graph
     */
    extractStyleInfo(graph) {
        const style = {};
        if (!graph.nodes || !Array.isArray(graph.nodes)) {
            return style;
        }
        // Look for style-related nodes
        graph.nodes.forEach((node) => {
            if (node.type === 'style' || node.data?.style) {
                Object.assign(style, node.data.style || {});
            }
        });
        return style;
    }
    /**
     * Create a session ID for tracking
     */
    createSessionId() {
        return uuidv4();
    }
    /**
     * Log performance metrics
     */
    logPerformance(operation, startTime, metadata) {
        const duration = Date.now() - startTime;
        this.logger.log(`[${this.id}] ${operation} completed in ${duration}ms`, metadata);
    }
}
//# sourceMappingURL=BaseAdaptor.js.map