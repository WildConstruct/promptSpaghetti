import { Platform } from '../types/index.js';
/**
 * Export format types
 */
export type ExportFormat = 'json' | 'csv' | 'xlsx' | 'pdf' | 'html' | 'zip' | 'png' | 'jpeg' | 'webp' | 'midjourney_prompt' | 'dalle_prompt' | 'stable_diffusion_prompt';
/**
 * Export options configuration
 */
export interface ExportOptions {
    format: ExportFormat;
    includeImages?: boolean;
    includeMetadata?: boolean;
    includePrompts?: boolean;
    includeParameters?: boolean;
    imageFormat?: 'original' | 'png' | 'jpeg' | 'webp';
    imageQuality?: number;
    maxImageSize?: {
        width: number;
        height: number;
    };
    compression?: 'none' | 'low' | 'medium' | 'high';
    password?: string;
    customFields?: string[];
    templateId?: string;
    batchSize?: number;
    metadata?: Record<string, any>;
}
/**
 * Export request
 */
export interface ExportRequest {
    id: string;
    name: string;
    description?: string;
    items: string[];
    options: ExportOptions;
    created: Date;
    requestedBy?: string;
}
/**
 * Export result
 */
export interface ExportResult {
    id: string;
    requestId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
    format: ExportFormat;
    url?: string;
    filename?: string;
    size?: number;
    itemCount: number;
    created: Date;
    completed?: Date;
    expiresAt?: Date;
    downloadCount: number;
    error?: string;
    progress?: number;
    metadata?: Record<string, any>;
}
/**
 * Export template for reusable configurations
 */
export interface ExportTemplate {
    id: string;
    name: string;
    description?: string;
    options: ExportOptions;
    isPublic: boolean;
    created: Date;
    modified: Date;
    usageCount: number;
    tags: string[];
}
/**
 * Platform-specific export configuration
 */
export interface PlatformExportConfig {
    platform: Platform;
    promptFormat: string;
    parameterMapping: Record<string, string>;
    fileExtension: string;
    mimeType: string;
    maxPromptLength?: number;
    supportedParameters?: string[];
    templateVariables?: Record<string, string>;
}
/**
 * Export progress callback
 */
export type ExportProgressCallback = (progress: {
    requestId: string;
    status: ExportResult['status'];
    progress: number;
    message?: string;
    itemsProcessed?: number;
    totalItems?: number;
}) => void;
/**
 * Comprehensive export system for gallery items and metadata
 */
export declare class ExportSystem {
    private requests;
    private results;
    private templates;
    private platformConfigs;
    private progressCallbacks;
    private readonly maxConcurrentExports;
    private readonly maxFileSize;
    private readonly resultTTL;
    private processingQueue;
    private activeExports;
    constructor();
    /**
     * Create export request
     */
    createExportRequest(name: string, itemIds: string[], options: ExportOptions, description?: string, onProgress?: ExportProgressCallback): Promise<string>;
    /**
     * Get export result
     */
    getExportResult(resultId: string): ExportResult | null;
    /**
     * Get export request
     */
    getExportRequest(requestId: string): ExportRequest | null;
    /**
     * Cancel export request
     */
    cancelExport(requestId: string): boolean;
    /**
     * Create export template
     */
    createTemplate(name: string, options: ExportOptions, description?: string, isPublic?: boolean, tags?: string[]): string;
    /**
     * Get export template
     */
    getTemplate(templateId: string): ExportTemplate | null;
    /**
     * Get all templates
     */
    getTemplates(includePublic?: boolean): ExportTemplate[];
    /**
     * Update template
     */
    updateTemplate(templateId: string, updates: Partial<ExportTemplate>): boolean;
    /**
     * Delete template
     */
    deleteTemplate(templateId: string): boolean;
    /**
     * Export to platform-specific format
     */
    exportToPlatform(itemIds: string[], platform: Platform, options?: Partial<ExportOptions>): Promise<string>;
    /**
     * Get export statistics
     */
    getExportStats(): {
        totalExports: number;
        successfulExports: number;
        failedExports: number;
        totalDownloads: number;
        popularFormats: Array<{
            format: ExportFormat;
            count: number;
        }>;
        averageFileSize: number;
    };
    /**
     * Process export queue
     */
    private processQueue;
    /**
     * Process individual export request
     */
    private processExport;
    /**
     * Generate JSON export
     */
    private generateJSONExport;
    /**
     * Generate CSV export
     */
    private generateCSVExport;
    /**
     * Generate ZIP export
     */
    private generateZIPExport;
    /**
     * Generate PDF export
     */
    private generatePDFExport;
    /**
     * Generate HTML export
     */
    private generateHTMLExport;
    /**
     * Generate platform-specific export
     */
    private generatePlatformExport;
    /**
     * Initialize platform configurations
     */
    private initializePlatformConfigs;
    /**
     * Initialize default templates
     */
    private initializeDefaultTemplates;
    /**
     * Start background cleaner for expired results
     */
    private startBackgroundCleaner;
    /**
     * Notify progress callback
     */
    private notifyProgress;
    /**
     * Calculate data size (mock implementation)
     */
    private calculateSize;
    /**
     * Generate unique IDs
     */
    private generateRequestId;
    private generateResultId;
    private generateTemplateId;
}
/**
 * Global export system instance
 */
export declare const exportSystem: ExportSystem;
