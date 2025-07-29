/**
 * Epic 16 - Community Components Export Index
 * Tasks: E16-1753114247131-3FFAA7 (Version Control) & E16-1753114247130-02122C (Quality Assessment)
 * 
 * Central export file for all community content management components.
 */

// Version Control Components
export { ContentVersionControl } from './ContentVersionControl';
export type { ContentVersionControlProps } from './ContentVersionControl';

// Quality Assessment Components  
export { QualityAssessmentDashboard } from './QualityAssessmentDashboard';
export type { QualityAssessmentDashboardProps } from './QualityAssessmentDashboard';

// Core Data Models and Services
export type {
  CommunityContent,
  ContentVersion,
  ContentVersionDiff,
  ContentContributor,
  ContentQualityScore,
  ContentImportOptions,
  ContentExportOptions,
  ReviewFeedback,
  PlagiarismResult,
  FactCheckResult,
  ContentMediaAttachment,
  ContentBundle
} from '../../community/ContentVersionManager';

export { ContentVersionManager } from '../../community/ContentVersionManager';

// Import ContentVersion for local use
import { ContentVersion } from '../../community/ContentVersionManager';

export type {
  CommunityContentQualityMetrics,
  EditorialQualityMetrics,
  TechnicalQualityMetrics,
  ContentEngagementMetrics,
  CommunityValueMetrics,
  AutomatedContentAnalysis,
  EditorialReview,
  QualityRecommendation,
  QualityFlag,
  QualityAssessmentWorkflow,
  AutomatedIssue
} from '../../community/ContentQualityAssessment';

export { 
  ContentQualityAssessmentService,
  QUALITY_ASSESSMENT_CONFIG 
} from '../../community/ContentQualityAssessment';

// Component configuration types
export type ContentVersionControlMode = 'author' | 'editor' | 'reviewer' | 'admin';
export type QualityAssessmentType = 'automated' | 'editorial' | 'community' | 'comprehensive';
export type WorkflowStage = 'automated_analysis' | 'editorial_review' | 'specialist_review' | 'final_approval' | 'published';

// Default configurations
// Workflow presets for common scenarios
// Quality thresholds by content type
// Integration helpers for Epic 16 components
// Event types for component communication

export interface CommunityComponentEvents {
  // Version control events
  'version:created': { version: ContentVersion; contentId: string };
  'version:published': { version: ContentVersion; contentId: string };
  'version:reviewed': { version: ContentVersion; feedback: ReviewFeedback };
  // Quality assessment events
  'quality:assessed': { metrics: CommunityContentQualityMetrics; contentId: string };
  'quality:improved': { oldScore: number; newScore: number; contentId: string };
  'quality:flagged': { flag: QualityFlag; contentId: string };
  // Workflow events
  'workflow:updated': { workflow: QualityAssessmentWorkflow; contentId: string };
  'workflow:escalated': { workflow: QualityAssessmentWorkflow; reason: string };
  'workflow:completed': { workflow: QualityAssessmentWorkflow; outcome: string };

// Utility functions for common operations
}
export const bParts = b.split('.').map(Number);
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aVal = aParts[i] || 0;
      const bVal = bParts[i] || 0;
      if (aVal !== bVal) {
        return aVal - bVal;
    return 0;
  }
  // Quality score calculation
  calculateOverallScore: (dimensions: Record<string, number>): number => {
  const weights = {
  editorial: 0.3,
  technical: 0.25,
  engagement: 0.25,
  community: 0.2,
};
    let totalScore = 0;
    let totalWeight = 0;
    Object.entries(dimensions).forEach(([dimension, score]) => {
      const weight = weights[dimension as keyof typeof weights] || 0.1;
      totalScore += score * weight;
      totalWeight += weight;
    });
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }
  // Grade calculation
  calculateGrade: (score: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' => {,
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F'
  }
  // Workflow stage validation
  validateWorkflowTransition: (),
    currentStage: WorkflowStage,
    targetStage: WorkflowStage,
    userRole: ContentVersionControlMode): boolean => {,
  const allowedTransitions: Record<WorkflowStage, WorkflowStage> = {,
  'automated_analysis': ['editorial_review'],
  'editorial_review': ['specialist_review', 'final_approval'],
  'specialist_review': ['final_approval'],
  'final_approval': ['published'],
  'published': [],
};
    const rolePermissions: Record<ContentVersionControlMode, WorkflowStage> = {
  'author': ['automated_analysis'],
  'editor': ['automated_analysis', 'editorial_review'],
  'reviewer': ['editorial_review', 'specialist_review'],
  'admin': ['automated_analysis', 'editorial_review', 'specialist_review', 'final_approval', 'published'],
};
    return allowedTransitions[currentStage]?.includes(targetStage) && 
           rolePermissions[userRole]?.includes(targetStage);
};