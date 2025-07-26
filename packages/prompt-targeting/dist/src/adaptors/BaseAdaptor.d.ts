/**
 * Base adaptor implementation for platform-specific prompt translation
 * Epic 10.1.2 - Common Interface Definition
 */
import { ModelAdaptor, PlatformCapabilities, ValidationResult, PlatformPrompt, AdaptorConfig } from '../types';
/**
 * Abstract base class for all platform adaptors
 * Provides common functionality and enforces interface compliance
 */
export declare abstract class BaseAdaptor implements ModelAdaptor {
    abstract readonly id: string;
    abstract readonly version: string;
    abstract readonly name: string;
    abstract readonly description: string;
    abstract readonly platforms: string[];
    protected initialized: boolean;
    protected config: Record<string, unknown>;
    protected logger: Console;
    /**
     * Initialize the adaptor with configuration
     */
    initialize(config?: Record<string, unknown>): Promise<void>;
    /**
     * Clean up adaptor resources
     */
    cleanup(): Promise<void>;
    /**
     * Get platform capabilities
     */
    abstract capabilities(): Promise<PlatformCapabilities>;
    /**
     * Validate a prompt graph for this platform
     */
    validate(graph: any, config?: AdaptorConfig): Promise<ValidationResult>;
    /**
     * Transform a prompt graph to platform-specific format
     */
    transform(graph: any, config?: AdaptorConfig): Promise<PlatformPrompt>;
    /**
     * Get default configuration for this adaptor
     */
    protected getDefaultConfig(): Record<string, unknown>;
    /**
     * Lifecycle hook for initialization
     */
    protected onInitialize(): Promise<void>;
    /**
     * Lifecycle hook for cleanup
     */
    protected onCleanup(): Promise<void>;
    /**
     * Platform-specific validation implementation
     */
    protected abstract performPlatformValidation(graph: any, config?: AdaptorConfig): Promise<ValidationResult>;
    /**
     * Platform-specific transformation implementation
     */
    protected abstract performTransformation(
      graph: any,
      config?: AdaptorConfig
    ): Promise<Omit<PlatformPrompt, 'metadata'>>;
    /**
     * Base validation checks common to all platforms
     */
    protected performBaseValidation(graph: any, config?: AdaptorConfig): Promise<ValidationResult>;
    /**
     * Combine multiple validation results
     */
    protected combineValidationResults(...results: ValidationResult[]): ValidationResult;
    /**
     * Generate a hash for the source graph
     */
    protected generateGraphHash(graph: any): string;
    /**
     * Get list of optimizations applied during transformation
     */
    protected getAppliedOptimizations(graph: any, config?: AdaptorConfig): Promise<string[]>;
    /**
     * Get platform-specific optimizations (override in subclasses)
     */
    protected getPlatformOptimizations(graph: any, config?: AdaptorConfig): Promise<string[]>;
    /**
     * Ensure adaptor is initialized before operations
     */
    protected ensureInitialized(): void;
    /**
     * Normalize parameter value to platform range
     */
    protected normalizeParameter(value: number, sourceRange: [number, number], targetRange: [number, number]): number;
    /**
     * Extract text content from graph nodes
     */
    protected extractTextContent(graph: any): string;
    /**
     * Extract style information from graph
     */
    protected extractStyleInfo(graph: any): Record<string, unknown>;
    /**
     * Create a session ID for tracking
     */
    protected createSessionId(): string;
    /**
     * Log performance metrics
     */
    protected logPerformance(operation: string, startTime: number, metadata?: Record<string, unknown>): void;
}
//# sourceMappingURL=BaseAdaptor.d.ts.map