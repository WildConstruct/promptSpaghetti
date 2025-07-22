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
export const CONTENT_VERSION_DEFAULTS = {
  showEditorialWorkflow: true,
  readOnly: false,
  defaultBranch: 'main',
  autoSave: true,
  versioningStrategy: 'semantic'
} as const;

export const QUALITY_ASSESSMENT_DEFAULTS = {
  showReviewInterface: false,
  readOnly: false,
  assessmentType: 'automated' as QualityAssessmentType,
  autoRunChecks: true,
  confidenceThreshold: 80
} as const;

// Workflow presets for common scenarios
export const CONTENT_WORKFLOWS = {
  // Simple author workflow
  author: {
    stages: ['draft', 'review', 'published'],
    permissions: ['create', 'edit', 'submit_review'],
    assessmentType: 'automated' as QualityAssessmentType
  },
  
  // Editorial workflow with quality gates
  editorial: {
    stages: ['draft', 'automated_check', 'editorial_review', 'approved', 'published'],
    permissions: ['create', 'edit', 'review', 'approve', 'publish'],
    assessmentType: 'comprehensive' as QualityAssessmentType,
    qualityGates: {
      minimum_score: 70,
      required_checks: ['grammar', 'plagiarism', 'factual']
    }
  },
  
  // Enterprise workflow with specialist review
  enterprise: {
    stages: ['draft', 'automated_check', 'editorial_review', 'specialist_review', 'legal_review', 'approved', 'published'],
    permissions: ['create', 'edit', 'review', 'specialist_review', 'legal_review', 'approve', 'publish'],
    assessmentType: 'comprehensive' as QualityAssessmentType,
    qualityGates: {
      minimum_score: 85,
      required_checks: ['grammar', 'plagiarism', 'factual', 'legal', 'accessibility']
    },
    escalation: {
      auto_escalate_threshold: 'high',
      specialist_required_topics: ['technical', 'legal', 'medical', 'financial']
    }
  }
} as const;

// Quality thresholds by content type
export const QUALITY_THRESHOLDS_BY_TYPE = {
  'article': {
    minimum_publication_score: 75,
    recommended_score: 85,
    dimensions: {
      editorial: 80,
      technical: 70,
      engagement: 75,
      community: 70
    }
  },
  'tutorial': {
    minimum_publication_score: 80,
    recommended_score: 90,
    dimensions: {
      editorial: 85,
      technical: 85,
      engagement: 80,
      community: 75
    }
  },
  'case-study': {
    minimum_publication_score: 75,
    recommended_score: 85,
    dimensions: {
      editorial: 80,
      technical: 70,
      engagement: 85,
      community: 80
    }
  },
  'guide': {
    minimum_publication_score: 85,
    recommended_score: 90,
    dimensions: {
      editorial: 90,
      technical: 80,
      engagement: 80,
      community: 85
    }
  },
  'documentation': {
    minimum_publication_score: 90,
    recommended_score: 95,
    dimensions: {
      editorial: 95,
      technical: 95,
      engagement: 70,
      community: 80
    }
  }
} as const;

// Integration helpers for Epic 16 components
export const COMMUNITY_INTEGRATIONS = {
  // Integration with Epic 16 marketplace components
  marketplace: {
    template_integration: true,
    case_study_showcase: true,
    community_ratings: true,
    creator_profiles: true
  },
  
  // Integration with Epic 17 admin controls
  admin: {
    policy_enforcement: true,
    compliance_monitoring: true,
    content_moderation: true,
    analytics_tracking: true
  },
  
  // Integration with core platform features
  platform: {
    user_authentication: true,
    notification_system: true,
    search_indexing: true,
    analytics_collection: true
  }
} as const;

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
}

// Utility functions for common operations
export const CommunityUtils = {
  // Version comparison utilities
  compareVersions: (a: string, b: string): number => {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aVal = aParts[i] || 0;
      const bVal = bParts[i] || 0;
      
      if (aVal !== bVal) {
        return aVal - bVal;
      }
    }
    
    return 0;
  },
  
  // Quality score calculation
  calculateOverallScore: (dimensions: Record<string, number>): number => {
    const weights = {
      editorial: 0.3,
      technical: 0.25,
      engagement: 0.25,
      community: 0.2
    };
    
    let totalScore = 0;
    let totalWeight = 0;
    
    Object.entries(dimensions).forEach(([dimension, score]) => {
      const weight = weights[dimension as keyof typeof weights] || 0.1;
      totalScore += score * weight;
      totalWeight += weight;
    });
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  },
  
  // Grade calculation
  calculateGrade: (score: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F' => {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  },
  
  // Workflow stage validation
  validateWorkflowTransition: (
    currentStage: WorkflowStage,
    targetStage: WorkflowStage,
    userRole: ContentVersionControlMode
  ): boolean => {
    const allowedTransitions: Record<WorkflowStage, WorkflowStage[]> = {
      'automated_analysis': ['editorial_review'],
      'editorial_review': ['specialist_review', 'final_approval'],
      'specialist_review': ['final_approval'],
      'final_approval': ['published'],
      'published': []
    };
    
    const rolePermissions: Record<ContentVersionControlMode, WorkflowStage[]> = {
      'author': ['automated_analysis'],
      'editor': ['automated_analysis', 'editorial_review'],
      'reviewer': ['editorial_review', 'specialist_review'],
      'admin': ['automated_analysis', 'editorial_review', 'specialist_review', 'final_approval', 'published']
    };
    
    return allowedTransitions[currentStage]?.includes(targetStage) && 
           rolePermissions[userRole]?.includes(targetStage);
  }
} as const;