/**
 * Image Processing and Optimization Utilities
 * Epic 35.1.2 - Text-to-Image Integration
 *
 * Utilities for image format conversion, compression, metadata extraction, and optimization
 */
export interface ImageMetadata {
    width: number;
    height: number;
    format: string;
    size: number;
    colorDepth?: number;
    hasAlpha?: boolean;
    compressionRatio?: number;
    quality?: number;
    exif?: Record<string, any>;
    generationInfo?: {
        model?: string;
        prompt?: string;
        seed?: number;
        parameters?: Record<string, any>;
    };
}
export interface ImageProcessingOptions {
    format?: 'jpeg' | 'png' | 'webp' | 'avif';
    quality?: number;
    width?: number;
    height?: number;
    maintainAspectRatio?: boolean;
    compression?: 'lossy' | 'lossless';
    optimize?: boolean;
    progressive?: boolean;
    removeMetadata?: boolean;
}
export interface ImageVariationOptions {
    count: number;
    strength: number;
    seed?: number;
    preserveStyle?: boolean;
}
export interface ImageBatchProcessingOptions {
    concurrency?: number;
    outputFormat?: 'jpeg' | 'png' | 'webp';
    quality?: number;
    resize?: {
        width: number;
        height: number;
    };
    watermark?: {
        text?: string;
        image?: string;
        position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
        opacity: number;
    };
}
export declare class ImageProcessor {
    private canvas;
    private ctx;
    constructor();
    private _drawTextWatermark;
    private _drawImageWatermark;
    position: string;
    canvasWidth: number;
    canvasHeight: number;
    Promise(): any;
}
//# sourceMappingURL=ImageProcessor.d.ts.map