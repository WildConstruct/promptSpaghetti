/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Epic 16 - Community Contribution Architecture
 * Task: E16-1753114247115-253BF0 - Design contribution architecture
 * 
 * Foundational architecture for community members to contribute content to the knowledge base.
 * Integrates with existing version control and quality assessment systems.
 */
import { CommunityContent, ContentVersion, ContentQualityScore } from './ContentVersionManager';
import { CommunityContentQualityMetrics, QualityAssessmentWorkflow } from './ContentQualityAssessment';

// ====================================
// Core Contribution Types
// ====================================

export type ContributionType = 
  | 'article'           // Knowledge base article
  | 'tutorial'          // Step-by-step tutorial
  | 'case-study'        // Real-world case study
  | 'guide'             // Comprehensive guide
  | 'documentation'     // Technical documentation
  | 'example'           // Code/implementation example
  | 'template'          // Reusable template
  | 'resource'          // External resource/link
  | 'translation'       // Translation of existing content
  | 'update';           // Update to existing content

export type ContributionStatus = 
  | 'draft'             // Being written
  | 'submitted'         // Submitted for review
  | 'under_review'      // Being reviewed
  | 'revision_needed'   // Needs changes
  | 'approved'          // Approved for publication
  | 'published'         // Live and public
  | 'featured'          // Featured content
  | 'archived'          // Archived/outdated
  | 'rejected';         // Rejected

export type ContributorRole = 
  | 'author'            // Primary content creator
  | 'co-author'         // Contributing author
  | 'editor'            // Content editor
  | 'reviewer'          // Content reviewer
  | 'translator'        // Language translator
  | 'maintainer'        // Content maintainer
  | 'subject_expert';   // Subject matter expert

export type ContributionCategory = 
  | 'getting-started'   // Beginner-friendly content
  | 'tutorials'         // How-to guides
  | 'best-practices'    // Industry best practices
  | 'case-studies'      // Real-world examples
  | 'troubleshooting'   // Problem-solving guides
  | 'advanced'          // Advanced techniques
  | 'tools-resources'   // Tool reviews and resources
  | 'community'         // Community-generated content
  | 'official'          // Official documentation
  | 'experimental';     // Experimental/beta content

// ====================================
// Contribution Data Models
// ====================================


export interface ContributionSubmission { id: string;
  // Basic information
  title: string;
  description: string;
  type: ContributionType;
  category: ContributionCategory;
  // Content structure
  content: CommunityContent;
  // Submission metadata
  submission: {;
  submitted_by: string;
  submitted_at: string;
  submission_notes?: string;
  intended_audience: string;
  learning_objectives?: string;
  prerequisites?: string;
  estimated_completion_time?: number; // minutes }


};
  // Status and workflow
  status: ContributionStatus;
  workflow: ContributionWorkflow;
  // Quality and assessment
  quality_assessment?: CommunityContentQualityMetrics;
  review_feedback: ReviewFeedbackEntry;
  // Attribution and collaboration
  contributors: ContributionContributor;
  attribution: ContributionAttribution;
  // Community engagement
  engagement: ContributionEngagement;
  // Publishing and distribution
  publishing: PublishingConfiguration;
  // Monetization (optional)
  monetization?: MonetizationConfiguration;
  // Version tracking
  version_history: string; // Array of version IDs,
  current_version_id: string;
  // Metadata
  created_at: string;
  updated_at: string;
  published_at?: string;
  featured_at?: string;


export interface ContributionWorkflow { current_stage: WorkflowStage;
  assigned_reviewers: string;
  review_deadlines: Record<string, string>;
  escalation_level: 'normal' | 'priority' | 'urgent';
  // Stage history
  stage_history: WorkflowStageEntry;
  // Review assignments
  reviewer_assignments: ReviewerAssignment;
  // Quality gates
  quality_gates: QualityGate;
  quality_gate_results: QualityGateResult;
  // Approval chain
  approval_chain: ApprovalEntry;
  // Publication scheduling
  publication_schedule?: PublicationSchedule }

export type WorkflowStage = 
  | 'submission'        // Initial submission
  | 'intake_review'     // Initial screening
  | 'quality_check'     // Automated quality analysis
  | 'editorial_review'  // Editorial review
  | 'technical_review'  // Technical/specialist review
  | 'community_review'  // Community feedback period
  | 'final_approval'    // Final approval
  | 'publication'       // Publishing process
  | 'post_publication'; // Post-publication monitoring


export interface WorkflowStageEntry { stage: WorkflowStage;
  entered_at: string;
  completed_at?: string;
  completed_by?: string;
  duration_hours?: number;
  notes?: string;
  outcome: 'completed' | 'skipped' | 'failed' | 'escalated' }




export interface ReviewerAssignment { reviewer_id: string;
  reviewer_name: string;
  review_type: 'editorial' | 'technical' | 'subject_matter' | 'community' | 'accessibility';
  assigned_at: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue' | 'declined';
  expertise_areas: string;
  workload_capacity: number; // 0-100 }




export interface QualityGate { name: string;
  type: 'automated' | 'manual' | 'hybrid';
  criteria: QualityGateCriteria;
  required: boolean;
  stage: WorkflowStage;
  timeout_hours?: number }



export interface QualityGateCriteria { minimum_score?: number;
  required_checks: string;
  blocking_issues: string;
  reviewer_consensus?: number; // Percentage of reviewers who must approve }
  automated_thresholds: Record<string, number>;




export interface QualityGateResult { gate_name: string;
  passed: boolean;
  score?: number;
  issues_found: string;
  recommendations: string;
  checked_at: string;
  checked_by?: string;
  retry_count: number }



export interface ApprovalEntry { approver_id: string;
  approver_name: string;
  approver_role: string;
  approved_at: string;
  approval_type: 'conditional' | 'full' | 'escalated';
  conditions?: string;
  notes?: string }



export interface PublicationSchedule { scheduled_date?: string;
  publication_priority: 'low' | 'medium' | 'high' | 'urgent' }
  target_channels: PublicationChannel;
  embargo_until?: string;
  auto_publish: boolean;
  notification_settings: NotificationConfiguration;


export type PublicationChannel = 
  | 'knowledge_base'    // Main knowledge base
  | 'community_forum'   // Community forum
  | 'newsletter'        // Email newsletter
  | 'social_media'      // Social media platforms
  | 'rss_feed'          // RSS feed
  | 'api_endpoints'     // API distribution
  | 'mobile_app';       // Mobile app


export interface ContributionContributor { user_id: string;
  name: string;
  email?: string;
  role: ContributorRole;
  contribution_type: string;
  contribution_percentage: number;
  attribution_visible: boolean;
  contact_allowed: boolean;
  // Contributor profile
  profile: { }
  bio?: string;
  expertise_areas: string;
  website?: string;
  social_links: Record<string, string>;
  preferred_attribution: string;


};
  // Contribution history
  contribution_date: string;
  previous_contributions: number;
  reputation_score: number;


export interface ContributionAttribution { attribution_model: 'individual' | 'collaborative' | 'organizational' | 'anonymous';
  primary_author: string;
  co_authors: string;
  acknowledgments: string;
  // Attribution display
  display_preferences: { }
  show_contributors: boolean;
  contributor_order: 'contribution' | 'alphabetical' | 'chronological';
  show_roles: boolean;
  show_percentages: boolean;


};
  // Legal and licensing
  copyright_holder: string;
  license_type: string;
  attribution_requirements: string;


export interface ContributionEngagement { // View metrics
  total_views: number;
  unique_views: number;
  view_sources: Record<string, number>;
  // Interaction metrics
  likes: number;
  shares: number;
  bookmarks: number;
  comments: number;
  // Quality feedback
  helpfulness_rating: number; // 1-5 stars;
  accuracy_rating: number;
  clarity_rating: number;
  usefulness_rating: number;
  // Community metrics
  community_votes: { }
  upvotes: number;
  downvotes: number;
  expert_endorsements: number;


};
  // Usage analytics
  completion_rate: number; // For tutorials,
  success_rate: number; // How often people succeed following the content,
  time_to_complete: number; // Average completion time
  // Feedback collection
  feedback_summary: { ,
  positive_feedback: string;
  improvement_suggestions: string;
  error_reports: string;
  update_requests: string };


export interface PublishingConfiguration { visibility: 'public' | 'community' | 'restricted' | 'private';
  access_level: 'free' | 'premium' | 'subscriber_only' | 'invitation_only';
  // SEO configuration
  seo: {;
  slug: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  canonical_url?: string;
  open_graph: { }
  title: string;
  description: string;
  image?: string;
  type: string;


};
  };
  // Content organization
  categories: string;
  tags: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';,
  estimated_reading_time: number;
  // Distribution settings
  distribution: { ,
  include_in_search: boolean;
  include_in_recommendations: boolean;
  allow_syndication: boolean;
  allow_translations: boolean;
  allow_derivatives: boolean };
  // Notification settings
  notifications: { ,
  notify_followers: boolean;
  send_newsletter: boolean;
  post_to_social: boolean;
  notify_collaborators: boolean };


export interface MonetizationConfiguration { monetization_enabled: boolean;
  pricing_model: 'free' | 'one_time' | 'subscription' | 'donation' | 'sponsored';
  // Pricing details
  pricing: { }
  base_price?: number;
  currency?: string;
  discount_percentage?: number;
  promotional_price?: number;
  promotion_end_date?: string;


};
  // Revenue sharing
  revenue_sharing: { ,
  contributor_percentage: number;
  platform_percentage: number;
  charity_percentage?: number;
  charity_organization?: string };
  // Sponsorship
  sponsorship?: { sponsor_name: string;
  sponsor_logo?: string;
  sponsor_link?: string;
  sponsorship_type: 'brand' | 'product' | 'service' | 'educational' }
  disclosure_required: boolean;
};


export interface ReviewFeedbackEntry { id: string;
  reviewer_id: string;
  reviewer_name: string;
  review_type: 'editorial' | 'technical' | 'subject_matter' | 'community';
  // Review content
  overall_rating: number; // 1-5 stars;
  detailed_feedback: DetailedFeedback;
  // Recommendations
  recommendation: 'approve' | 'approve_with_minor_edits' | 'request_major_revision' | 'reject';
  priority_level: 'low' | 'medium' | 'high' | 'critical';
  // Timing
  submitted_at: string;
  review_duration_hours: number;
  // Follow-up
  follow_up_required: boolean;
  follow_up_notes?: string;
  // Public visibility
  public_feedback?: string; // Feedback visible to community;
  private_notes?: string;   // Internal reviewer notes }




export interface DetailedFeedback { // Content quality
  content_quality: {;
  accuracy: number;       // 1-5;
  clarity: number;        // 1-5;
  completeness: number;   // 1-5;
  usefulness: number;     // 1-5;
  originality: number;    // 1-5 }


};
  // Technical quality
  technical_quality: { ,
  formatting: number;     // 1-5,
  code_quality?: number;  // 1-5 (if applicable),
  accessibility: number; // 1-5,
  seo_optimization: number; // 1-5 }
};
  // Specific feedback areas
  feedback_areas: FeedbackArea;
  // Improvement suggestions
  suggestions: { ,
  high_priority: string;
  medium_priority: string;
  low_priority: string;
  nice_to_have: string };
  // Errors and issues
  issues_found: { ,
  factual_errors: string;
  grammar_issues: string;
  formatting_problems: string;
  broken_links: string;
  accessibility_issues: string };


export interface FeedbackArea { section: string;          // Which part of the content;
  line_number?: number;     // Specific line if applicable;
  issue_type: 'error' | 'suggestion' | 'question' | 'praise' }
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggested_change?: string;
  explanation?: string;




export interface NotificationConfiguration { // Notification recipients
  notify_contributors: boolean;
  notify_reviewers: boolean;
  notify_followers: boolean;
  notify_administrators: boolean;
  // Notification channels
  channels: { }
  email: boolean;
  in_app: boolean;
  push_notification: boolean;
  slack?: boolean;
  discord?: boolean;


};
  // Notification timing
  timing: { ,
  immediate: boolean;
  daily_digest: boolean;
  weekly_summary: boolean;
  milestone_only: boolean };
  // Notification types
  notification_types: { ,
  status_changes: boolean;
  review_feedback: boolean;
  publication: boolean;
  engagement_milestones: boolean;
  quality_improvements: boolean };

// ====================================
// Contribution Management System
// ====================================


export interface ContributionRepository { // Submission management
  submitContribution(submission: Omit<ContributionSubmission, 'id' | 'created_at' | 'updated_at'>): Promise<ContributionSubmission>;
  updateContribution(id: string, updates: Partial<ContributionSubmission>): Promise<ContributionSubmission>;
  getContribution(id: string): Promise<ContributionSubmission>;
  getContributionsByUser(userId: string, status?: ContributionStatus): Promise<ContributionSubmission>;
  // Workflow management
  advanceWorkflowStage(contributionId: string, newStage: WorkflowStage, notes?: string): Promise<ContributionWorkflow>;
  assignReviewer(contributionId: string, assignment: ReviewerAssignment): Promise<void>;
  submitReviewFeedback(contributionId: string, feedback: ReviewFeedbackEntry): Promise<void>;
  approveContribution(contributionId: string, approval: ApprovalEntry): Promise<void>;
  // Quality assessment integration
  runQualityAssessment(contributionId: string): Promise<CommunityContentQualityMetrics>;
  checkQualityGates(contributionId: string): Promise<QualityGateResult>;
  // Publication management
  schedulePublication(contributionId: string, schedule: PublicationSchedule): Promise<void>;
  publishContribution(contributionId: string): Promise<void>;
  featureContribution(contributionId: string): Promise<void>;
  // Analytics and reporting
  getContributionAnalytics(contributionId: string): Promise<ContributionEngagement>;
  getContributorStatistics(userId: string): Promise<ContributorStatistics>;
  getSystemMetrics(timeRange?: string): Promise<ContributionSystemMetrics> }



export interface ContributorStatistics { user_id: string;
  // Contribution counts
  total_contributions: number;
  published_contributions: number;
  featured_contributions: number;
  // Quality metrics
  average_quality_score: number;
  quality_trend: 'improving' | 'stable' | 'declining';
  peer_review_rating: number;
  // Engagement metrics
  total_views: number;
  total_likes: number;
  total_shares: number;
  average_helpfulness_rating: number;
  // Recognition
  badges_earned: ContributorBadge;
  reputation_score: number;
  expert_endorsements: number;
  // Activity
  contribution_frequency: number; // contributions per month;
  review_participation: number;   // reviews completed;
  community_engagement: number;   // comments, discussions;
  // Performance
  average_review_time: number;    // days from submission to publication;
  revision_rate: number;         // percentage requiring revisions;
  acceptance_rate: number;       // percentage approved }




export interface ContributorBadge { id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' }
  earned_at: string;
  criteria_met: string;




export interface ContributionSystemMetrics { time_period: string;
  // Submission metrics
  total_submissions: number;
  submissions_by_type: Record<ContributionType, number>;
  submissions_by_category: Record<ContributionCategory, number>;
  // Workflow metrics
  average_review_time: number;
  workflow_bottlenecks: Array<{ }
  stage: WorkflowStage;
  average_duration: number;
  backlog_count: number;


>;
  // Quality metrics
  average_quality_score: number;
  quality_distribution: Record<string, number>;
  common_quality_issues: Array<{ ,
  issue_type: string;
  frequency: number;
  impact: string }>;
  // Publication metrics
  publication_rate: number;
  featured_content_rate: number;
  content_longevity: number; // average time content remains relevant
  // Community engagement
  community_participation: { ,
  active_contributors: number;
  active_reviewers: number;
  community_feedback_volume: number;
  collaboration_rate: number };
  // System performance
  processing_efficiency: { ,
  automated_approval_rate: number;
  quality_gate_pass_rate: number;
  escalation_rate: number;
  reviewer_workload_balance: number };

// ====================================
// Configuration and Templates
// ====================================

export const CONTRIBUTION_WORKFLOW_TEMPLATES = { // Simple workflow for trusted contributors
  trusted_contributor: {,
  stages: ['submission', 'quality_check', 'final_approval', 'publication'],
    quality_gates: ['automated_quality', 'plagiarism_check'] }
    review_requirements: { min_reviewers: 1, specialist_required: false },
    auto_publish_threshold: 85;

  // Standard workflow for regular contributors
  standard: { ,
  stages: ['submission', 'intake_review', 'quality_check', 'editorial_review', 'final_approval', 'publication'],
    quality_gates: ['automated_quality', 'editorial_review', 'technical_review'] }
    review_requirements: { min_reviewers: 2, specialist_required: false },
    auto_publish_threshold: 90;

  // Comprehensive workflow for new contributors or complex content
  comprehensive: { ,
  stages: ['submission', 'intake_review', 'quality_check', 'editorial_review', 'technical_review', 'community_review', 'final_approval', 'publication'],
    quality_gates: ['automated_quality', 'editorial_review', 'technical_review', 'community_consensus'] }
    review_requirements: { min_reviewers: 3, specialist_required: true },
    auto_publish_threshold: 95;

  // Express workflow for urgent content
  express: { ,
  stages: ['submission', 'quality_check', 'editorial_review', 'publication'],
    quality_gates: ['automated_quality', 'expedited_review'] }
    review_requirements: { min_reviewers: 1, specialist_required: false },
    auto_publish_threshold: 80,
    max_review_time: 24 // hours;
 as const;

export const QUALITY_GATE_PRESETS = { automated_basic: {,
  minimum_score: 70,
  required_checks: ['grammar', 'spelling', 'readability'],
  blocking_issues: ['plagiarism_detected', 'policy_violation'],
  automated_thresholds: {,
  grammar_score: 80,
  plagiarism_similarity: 15, // max 15% similarity,
  readability_score: 70 }
},
  automated_comprehensive: { ,
  minimum_score: 80,
  required_checks: ['grammar', 'spelling', 'readability', 'seo', 'accessibility'],
  blocking_issues: ['plagiarism_detected', 'policy_violation', 'accessibility_violation'],
  automated_thresholds: {,
  grammar_score: 85,
  plagiarism_similarity: 10,
  readability_score: 75,
  seo_score: 70,
  accessibility_score: 80 }
},
  editorial_standard: { ,
  minimum_score: 75,
  required_checks: ['content_accuracy', 'style_consistency', 'target_audience'],
  reviewer_consensus: 75, // 75% of reviewers must approve,
  automated_thresholds: {,
  editorial_score: 75,
  technical_accuracy: 80 }
 as const;