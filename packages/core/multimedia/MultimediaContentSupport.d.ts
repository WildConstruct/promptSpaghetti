/**
 * Multimedia Content Support (Epic 16)
 *
 * DEPLOYMENT BLOCKER FIX: Comprehensive multimedia content support system
 * for handling images, videos, audio, documents, and interactive media
 * within the application. Provides content processing, optimization,
 * accessibility features, and interactive media capabilities.
 *
 * Features:
 * - Image processing and optimization
 * - Video transcoding and streaming
 * - Audio processing and analysis
 * - Document conversion and preview
 * - Interactive media components
 * - Content accessibility features
 * - Media asset management
 * - Performance optimization
 */
import { EventEmitter } from 'events';

}
export interface MediaAsset {
    id: string;
    name: string;
    type: 'image' | 'video' | 'audio' | 'document' | 'interactive';
    mimeType: string;
    size: number;
    duration?: number;
    dimensions?: {
        width: number;
        height: number;
}
    };
    url: string;
    thumbnailUrl?: string;
    metadata: MediaMetadata;
    accessibility: AccessibilityFeatures;
    processing: ProcessingStatus;
    storage: StorageInfo;
    created: Date;
    lastModified: Date;

}
export interface MediaMetadata {
    title?: string;
    description?: string;
    alt?: string;
    caption?: string;
    tags: string[];
    author?: string;
    copyright?: string;
    exif?: Record<string, any>;
    chapters?: MediaChapter[];
    quality: 'low' | 'medium' | 'high' | 'original';
    encoding?: {
        codec: string;
        bitrate: number;
        framerate?: number;
        sampleRate?: number;
}
    };

}
export interface MediaChapter {
    id: string;
    title: string;
    startTime: number;
    endTime: number;
    description?: string;
    thumbnailUrl?: string;

}
export interface AccessibilityFeatures {
    altText: string;
    transcription?: string;
    captions?: MediaCaption[];
    audioDescription?: string;
    signLanguage?: boolean;
    highContrast?: boolean;
    screenReaderOptimized: boolean;

}
export interface MediaCaption {
    id: string;
    language: string;
    startTime: number;
    endTime: number;
    text: string;
    position?: {
        x: number;
        y: number;
}
    };
    styling?: {
        fontSize: number;
        color: string;
        backgroundColor: string;
        fontFamily: string;
    };

}
export interface ProcessingStatus {
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'optimizing';
    progress: number;
    stages: ProcessingStage[];
    errors: string[];
    estimatedCompletion?: Date;
    processingTime?: number;

}
export interface ProcessingStage {
    name: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    startTime?: Date;
    endTime?: Date;
    details?: string;

}
export interface StorageInfo {
    provider: 'local' | 'cloud' | 'cdn';
    bucket?: string;
    path: string;
    cdn?: {
        url: string;
        distribution: string;
        region: string;
}
    };
    compression: {
        enabled: boolean;
        algorithm: string;
        ratio: number;
    };
    backup: {
        enabled: boolean;
        locations: string[];
        lastBackup?: Date;
    };

}
export interface MediaProcessingOptions {
    image?: {
        resize?: {
            width?: number;
            height?: number;
            maintainAspectRatio?: boolean;
}
        };
        optimize?: boolean;
        format?: 'jpeg' | 'png' | 'webp' | 'avif';
        quality?: number;
        progressive?: boolean;
        watermark?: {
            text?: string;
            image?: string;
            position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
            opacity: number;
        };
    };
    video?: {
        transcode?: {
            resolution?: '480p' | '720p' | '1080p' | '4k';
            bitrate?: number;
            framerate?: number;
            codec?: 'h264' | 'h265' | 'vp9'
  };
        thumbnail?: {
            count: number;
            interval?: number;
            size?: {
                width: number;
                height: number;
            };
        };
        chapters?: boolean;
        captions?: boolean;
    };
    audio?: {
        transcode?: {
            bitrate?: number;
            sampleRate?: number;
            channels?: number;
            codec?: 'mp3' | 'aac' | 'ogg' | 'flac'
  };
        normalize?: boolean;
        noiseReduction?: boolean;
        transcription?: boolean;
    };
    document?: {
        convert?: 'pdf' | 'html' | 'markdown';
        preview?: boolean;
        searchable?: boolean;
        compress?: boolean;
    };

}
export interface MultimediaConfig {
    storage: {
        provider: 'local' | 'aws' | 'gcp' | 'azure';
        maxFileSize: number;
        allowedTypes: string[];
        compressionEnabled: boolean;
}
    };
    processing: {
        enableTranscoding: boolean;
        enableOptimization: boolean;
        enableThumbnails: boolean;
        enableAccessibility: boolean;
        maxConcurrentJobs: number;
        timeoutMs: number;
    };
    delivery: {
        cdnEnabled: boolean;
        cacheMaxAge: number;
        adaptiveStreaming: boolean;
        lazyLoading: boolean;
    };
    accessibility: {
        requireAltText: boolean;
        autoGenerateTranscriptions: boolean;
        autoGenerateCaptions: boolean;
        enforceStandards: boolean;
    };

export declare class MultimediaContentSupport extends EventEmitter {
    private assets;
    private processingQueue;
    private config;
    private processingWorkers;
    private isProcessing;
    constructor(config?: Partial<MultimediaConfig>);
    uploadAsset(file: File | Buffer, metadata?: Partial<MediaMetadata>, options?: MediaProcessingOptions): Promise<string>;
    processAsset(assetId: string, options?: MediaProcessingOptions): Promise<void>;
    getAsset(assetId: string): MediaAsset | null;
    listAssets(filters?: {)
        type?: MediaAsset['type'];
        tags?: string[];
        dateRange?: {
            start: Date;
            end: Date;
        };
        status?: ProcessingStatus['status'];
    }): MediaAsset[];
    updateAsset(assetId: string, updates: Partial<MediaAsset>): Promise<void>;
    deleteAsset(assetId: string): Promise<boolean>;
    getOptimizedUrl(assetId: string, options?: {)
        quality?: 'low' | 'medium' | 'high';
        format?: string;
        size?: {
            width?: number;
            height?: number;
        };
    }): string;
    getProcessingStatus(assetId: string): ProcessingStatus | null;
    generateThumbnail(assetId: string, options?: {)
        size?: {
            width: number;
            height: number;
        };
        timestamp?: number;
    }): Promise<string>;
    batchProcess(assetIds: string[], options?: MediaProcessingOptions): Promise<void>;
    batchDelete(assetIds: string[]): Promise<boolean[]>;
    getUsageMetrics(): {
        totalAssets: number;
        totalSize: number;
        assetsByType: Record<string, number>;
        processingStats: {
            pending: number;
            processing: number;
            completed: number;
            failed: number;
        };
        storageUsage: {
            used: number;
            available: number;
            efficiency: number;
        };
    };
    updateConfig(config: Partial<MultimediaConfig>): void;
    destroy(): void;
    private validateFile;
    private getMediaType;
    private generateDefaultAccessibility;
    private generateProcessingStages;
    private uploadFile;
    private processImage;
    private processVideo;
    private processAudio;
    private processDocument;
    private processInteractive;
    private generateAccessibilityFeatures;
    private updateProcessingStage;
    private generateImageThumbnail;
    private generateVideoThumbnail;
    private generateDocumentThumbnail;
    private deleteFromStorage;
    private getQualityValue;
    private calculateStorageEfficiency;
    private initializeProcessingWorkers;
    private startProcessing;
    private stopProcessing;
    private processQueue;
    private terminateWorkers;
    private getBaseUrl;
    private delay;

export declare class MultimediaComponentFactory {
    static createImageViewer(assetId: string): React.ComponentType<any>;
    static createVideoPlayer(assetId: string): React.ComponentType<any>;
    static createAudioPlayer(assetId: string): React.ComponentType<any>;
    static createDocumentViewer(assetId: string): React.ComponentType<any>;
declare const _default: {
    MultimediaContentSupport: typeof MultimediaContentSupport;
    MultimediaComponentFactory: typeof MultimediaComponentFactory;
};
export default _default;
//# sourceMappingURL=MultimediaContentSupport.d.ts.map