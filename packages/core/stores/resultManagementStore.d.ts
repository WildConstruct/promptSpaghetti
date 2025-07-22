/**
 * Epic 8.5 - Result Management Store
 *
 * Professional result persistence and management system for film industry workflows.
 * Handles result selection, saving, tagging, rating, and organization.
 */
import { EnhancedPreviewResult } from '../components/PreviewModal/EnhancedPreviewModal';
export interface SavedResult extends EnhancedPreviewResult {
    savedAt: Date;
    lastModified: Date;
    collection?: string;
    projectId?: string;
    graphId?: string;
    version?: number;
    workflow?: {
        status: 'draft' | 'review' | 'approved' | 'rejected' | 'final';
        assignee?: string;
        reviewer?: string;
        deadline?: Date;
        priority: 'low' | 'medium' | 'high' | 'urgent';
    };
    creative?: {
        genre?: string;
        tone?: string;
        style?: string;
        characterCount?: number;
        sceneType?: 'interior' | 'exterior' | 'mixed';
        timeOfDay?: 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';
    };
}
export interface ResultCollection {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    lastModified: Date;
    resultIds: string[];
    tags: string[];
    projectInfo?: {
        title?: string;
        director?: string;
        producer?: string;
        genre?: string;
        budget?: string;
        targetRating?: string;
    };
}
export interface ResultFilter {
    tags?: string[];
    rating?: {
        min?: number;
        max?: number;
    };
    contentType?: string[];
    dateRange?: {
        start?: Date;
        end?: Date;
    };
    collection?: string;
    status?: string[];
    searchText?: string;
}
export interface ResultStats {
    totalResults: number;
    averageRating: number;
    averageWordCount: number;
    totalExecutionTime: number;
    topTags: Array<{
        tag: string;
        count: number;
    }>;
    contentTypeDistribution: Record<string, number>;
    recentActivity: Array<{
        type: 'save' | 'rate' | 'tag' | 'export' | 'note';
        timestamp: Date;
        resultId: string;
        details?: string;
    }>;
}
export declare const now: Date;
//# sourceMappingURL=resultManagementStore.d.ts.map