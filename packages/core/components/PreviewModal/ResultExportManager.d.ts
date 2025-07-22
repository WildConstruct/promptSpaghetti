/**
 * Epic 8.5 - Result Export Manager
 *
 * Professional export system for film industry workflows.
 * Integrates with existing export infrastructure for VFX-ready outputs.
 */
import React from 'react';
import { EnhancedPreviewResult } from './EnhancedPreviewModal';
export interface ExportFormat {
    id: string;
    name: string;
    description: string;
    extension: string;
    category: 'script' | 'vfx' | 'data' | 'report';
    vfxCompatible?: boolean;
    controlNetReady?: boolean;
    icon: string;
}
export interface ExportOptions {
    format: ExportFormat;
    includeMetadata?: boolean;
    includeExecutionPath?: boolean;
    includeVarianceAnalysis?: boolean;
    compressOutput?: boolean;
    vfxOptions?: {
        targetPipeline?: 'stable-diffusion' | 'midjourney' | 'dalle' | 'custom';
        includeControlNet?: boolean;
        includeSceneData?: boolean;
        frameRate?: number;
        resolution?: [number, number];
    };
    filmOptions?: {
        scriptFormat?: 'fountain' | 'final-draft' | 'writerpro';
        includeCharacterNotes?: boolean;
        includeDirectorNotes?: boolean;
        includeSceneBreakdowns?: boolean;
        watermark?: string;
    };
}
export interface ResultExportManagerProps {
    results: EnhancedPreviewResult[];
    selectedResultIds: string[];
    onExportComplete?: (exportedResultIds: string[], format: ExportFormat) => void;
    onExportError?: (error: Error) => void;
    className?: string;
}
export declare const ResultExportManager: React.FC<ResultExportManagerProps>;
//# sourceMappingURL=ResultExportManager.d.ts.map