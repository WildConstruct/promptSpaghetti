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
export interface EnhancedPreviewResult {
    seed: number;
    output?: string;
    error?: string;
    executionTimeMs?: number;
    usedNodeIds?: string;
    usedEdgeIds?: string;
    metadata?: {
        createdAt: Date;
        wordCount?: number;
        characterCount?: number;
        estimatedReadingTime?: number;
        contentType?: 'dialogue' | 'action' | 'description' | 'mixed';
        tags?: string;
        rating?: 1 | 2 | 3 | 4 | 5;
        notes?: string;
    };
    id: string;
    selected?: boolean;
    saved?: boolean;
    exported?: boolean;
}
export declare const expandedResult: string, setExpandedResult: React.Dispatch<React.SetStateAction<string>>;
//# sourceMappingURL=EnhancedPreviewModal.d.ts.map