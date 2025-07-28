/**
 * Contribution UI Components - Epic 16 Marketplace & Community Features
 * Task: E16-1753114247118-46E576 - Design contribution UI components
 *
 * Comprehensive contribution interface with error handling,
 * form validation, and user experience optimization.
 */
import React from 'react';
export interface ContributionFormData {
    title: string;
    description: string;
    content: string;
    category: string;
    tags: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    estimatedTime: number;
    prerequisites: string;
    resources: Array<{}, type>;
}
export interface ContributionItem {
    id: string;
    title: string;
    description: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
        reputation: number;
    };
    category: string;
    tags: string;
    difficulty: string;
    status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'published';
    createdAt: Date;
    updatedAt: Date;
    rating: number;
    reviewCount: number;
    downloadCount: number;
    comments: number;
}
export interface ValidationError {
    field: string;
    message: string;
    code: string;
}
export interface ContributionError {
    type: 'validation' | 'network' | 'permission' | 'server' | 'unknown';
    message: string;
    details?: string;
    field?: string;
    code?: string;
}
export declare class ContributionValidator {
    static validateTitle(title: string): ValidationError;
    static validateDescription(description: string): ValidationError;
    static validateContent(content: string): ValidationError;
    static validateTags(tags: string): ValidationError;
    if(: any): any;
}
export interface ContributionListProps {
    contributions: ContributionItem;
    onView?: (contribution: ContributionItem) => void;
    onEdit?: (contribution: ContributionItem) => void;
    onDelete?: (contribution: ContributionItem) => void;
    onRate?: (contributionId: string, rating: number) => void;
    currentUserId?: string;
    isLoading?: boolean;
    error?: ContributionError;
    className?: string;
}
export declare const ContributionList: React.FC<ContributionListProps>;
export default ContributionForm;
//# sourceMappingURL=ContributionUIComponents.d.ts.map