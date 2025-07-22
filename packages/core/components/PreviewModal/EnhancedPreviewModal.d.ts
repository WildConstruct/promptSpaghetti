/**
 * Epic 8.5 - Enhanced Preview Modal for Film Industry Professionals
 *
 * Professional-grade preview system with individual result management,
 * designed for the Wild Construct film industry demo.
 *
 * Features:
 * - Individual result selection and management
 * - Professional UI suitable for cinema professionals
 * - Result persistence and organization
 * - Export integration
 */
import React from 'react';
import { VarianceAnalysis } from '../../hooks/useEnhancedPreview';
export interface EnhancedPreviewResult {
    seed: number;
    output?: string;
    error?: string;
    executionTimeMs?: number;
    usedNodeIds?: string[];
    usedEdgeIds?: string[];
    metadata?: {
        createdAt: Date;
        wordCount?: number;
        characterCount?: number;
        estimatedReadingTime?: number;
        contentType?: 'dialogue' | 'action' | 'description' | 'mixed';
        tags?: string[];
        rating?: 1 | 2 | 3 | 4 | 5;
        notes?: string;
    };
    id: string;
    selected?: boolean;
    saved?: boolean;
    exported?: boolean;
}
interface EnhancedPreviewModalProps {
    open: boolean;
    loading: boolean;
    error: string | null;
    results: EnhancedPreviewResult[];
    varianceAnalysis?: VarianceAnalysis | null;
    onClose: () => void;
    onCancel?: () => void;
    onResultHover?: (index: number) => void;
    onResultSelect?: (resultId: string, selected: boolean) => void;
    onResultSave?: (resultId: string, metadata?: any) => Promise<void>;
    onResultExport?: (resultIds: string[]) => Promise<void>;
    onResultRate?: (resultId: string, rating: number) => void;
    onResultTag?: (resultId: string, tags: string[]) => void;
    onResultNote?: (resultId: string, note: string) => void;
    enableSelection?: boolean;
    enableRating?: boolean;
    enableNotes?: boolean;
    enableExport?: boolean;
    maxResults?: number;
}
export declare const EnhancedPreviewModal: React.FC<EnhancedPreviewModalProps>;
export {};
//# sourceMappingURL=EnhancedPreviewModal.d.ts.map