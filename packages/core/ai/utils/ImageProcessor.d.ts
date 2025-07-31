/**
 * Image Processing and Optimization Utilities
 * Epic 35.1.2 - Text-to-Image Integration
 *
 * Utilities for image format conversion, compression, metadata extraction, and optimization
 */

}
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
}
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
}
    };
    watermark?: {
        text?: string;
        image?: string;
        position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
        opacity: number;
    };

export declare class ImageProcessor {
    private canvas;
    private ctx;
    constructor();
    convertFormat(imageData: string | ArrayBuffer, options: ImageProcessingOptions): Promise<{
        data: string;
        metadata: ImageMetadata;
    }>;
    extractMetadata(imageData: string | ArrayBuffer): Promise<ImageMetadata>;
    compress(imageData: string, quality?: number, format?: 'jpeg' | 'webp'): Promise<{
        data: string;
        compressionRatio: number;
        originalSize: number;
        compressedSize: number;
    }>;
    resize(imageData: string, width: number, height?: number, maintainAspectRatio?: boolean): Promise<string>;
    processBatch(images: string[], options: ImageBatchProcessingOptions): Promise<Array<{
        original: string;
        processed: string;
        metadata: ImageMetadata;
    }>>;
    generateVariations(imageData: string, options: ImageVariationOptions): Promise<string[]>;
    compareImages(image1: string, image2: string): Promise<{
        similarity: number;
        differences: {
            colorDifference: number;
            structuralDifference: number;
            pixelDifference: number;
        };
    }>;
    private _loadImage;
    private _setupCanvas;
    private _optimizeCanvas;
    private _getMimeType;
    private _getFormatFromDataURL;
    private _estimateDataURLSize;
    private _parseImageHeaders;
    private _parsePNGHeaders;
    private _parseJPEGHeaders;
    private _parseWebPHeaders;
    private _applyWatermark;
    private _drawTextWatermark;
    private _drawImageWatermark;
    private _getWatermarkPosition;
    private _createVariation;
    private _applyBrightnessVariation;
    private _applyContrastVariation;
    private _applyHueVariation;
    private _applySaturationVariation;
    private _getImageData;
    private _rgbToHsl;
    private _hslToRgb;

export default ImageProcessor;
//# sourceMappingURL=ImageProcessor.d.ts.map