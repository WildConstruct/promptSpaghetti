// Epic 16.2.1 Template Submission System Types
import { z } from 'zod';
import { TemplateStatus } from './types';

// Submission workflow statuses
export enum SubmissionStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  CHANGES_REQUESTED = 'changes_requested',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// Submission validation types
export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

// File upload types
export enum FileType {
  GRAPH_JSON = 'graph_json',
  PROMPT_YAML = 'prompt_yaml',
  ASSET_FILE = 'asset_file',
  DOCUMENTATION = 'documentation'
}

// Template submission interface
}
}
export interface TemplateSubmission {
  id: string;
  template_id: string;
  submitter_id: string;
  version_number: number;
  status: SubmissionStatus;
  submission_data: SubmissionData;
  validation_results: ValidationResult[];
  reviewer_id?: string;
  review_comments?: string;
  review_score?: number;
  submitted_at: Date;
  reviewed_at?: Date;
  created_at: Date;
  updated_at: Date;
}
}
}

// Submission data structure
}
}
export interface SubmissionData {
  // Template metadata
  title: string;
  description: string;
  tags: string[];
  categories: string[];
  price_cents: number;
  is_ai_generated: boolean;
  claude_compat: string[];
  
  // Version data
  claude_model: string;
  graph_json: Record<string, any>;
  prompt_yaml?: string;
  changelog_md?: string;
  token_per_run_estimate: number;
  
  // Additional metadata
  intended_use_cases: string[];
  technical_requirements: string[];
  example_outputs: string[];
  documentation_md?: string;
  
  // Submission specifics
  moderation_notes?: string;
  is_first_submission: boolean;
  previous_version_id?: string;
}
}
}

// Validation result interface
}
}
export interface ValidationResult {
  id: string;
  rule_id: string;
  severity: ValidationSeverity;
  message: string;
  details?: Record<string, any>;
  suggested_fix?: string;
  auto_fixable: boolean;
  location?: {
    file_type: FileType;
    line?: number;
    column?: number;
    field?: string;
}
}
  };
}

// File upload interface
}
}
export interface UploadedFile {
  id: string;
  submission_id: string;
  file_type: FileType;
  filename: string;
  file_size: number;
  mime_type: string;
  s3_key: string;
  validation_status: 'pending' | 'valid' | 'invalid';
  validation_errors: string[];
  uploaded_at: Date;
}
}
}

// Submission review interface
}
}
export interface SubmissionReview {
  id: string;
  submission_id: string;
  reviewer_id: string;
  decision: 'approved' | 'rejected' | 'changes_requested';
  score: number; // 1-100
  comments: string;
  detailed_feedback: ReviewFeedback[];
  created_at: Date;
}
}
}

// Review feedback structure
}
}
export interface ReviewFeedback {
  category: 'content' | 'quality' | 'compliance' | 'usability' | 'technical';
  rating: number; // 1-5
  comments: string;
  suggestions: string[];
}
}
}

// Zod schemas for validation
export const SubmissionDataSchema = z.object({
  // Template metadata
  title: z.string().min(1).max(255),
  description: z.string().min(10).max(2000),
  tags: z.array(z.string().min(1).max(50)).min(1).max(20),
  categories: z.array(z.string().uuid()).min(1).max(3),
  price_cents: z.number().int().min(0).max(100000), // Max $1000
  is_ai_generated: z.boolean(),
  claude_compat: z.array(z.string()).min(1),
  
  // Version data
  claude_model: z.string().min(1),
  graph_json: z.record(z.any()),
  prompt_yaml: z.string().optional(),
  changelog_md: z.string().optional(),
  token_per_run_estimate: z.number().int().min(0),
  
  // Additional metadata
  intended_use_cases: z.array(z.string()).min(1).max(10),
  technical_requirements: z.array(z.string()).max(20),
  example_outputs: z.array(z.string()).min(1).max(5),
  documentation_md: z.string().optional(),
  
  // Submission specifics
  moderation_notes: z.string().optional(),
  is_first_submission: z.boolean(),
  previous_version_id: z.string().uuid().optional()
});

export const CreateSubmissionSchema = z.object({
  template_id: z.string().uuid().optional(), // Optional for new templates
  submission_data: SubmissionDataSchema
});

export const UpdateSubmissionSchema = z.object({
  submission_data: SubmissionDataSchema.partial(),
  status: z.nativeEnum(SubmissionStatus).optional()
});

export const SubmissionReviewSchema = z.object({
  decision: z.enum(['approved', 'rejected', 'changes_requested']),
  score: z.number().int().min(1).max(100),
  comments: z.string().min(1).max(2000),
  detailed_feedback: z.array(z.object({
    category: z.enum(['content', 'quality', 'compliance', 'usability', 'technical']),
    rating: z.number().int().min(1).max(5),
    comments: z.string().min(1).max(1000),
    suggestions: z.array(z.string()).max(10)
  })).min(1).max(5)
});

export const FileUploadSchema = z.object({
  file_type: z.nativeEnum(FileType),
  filename: z.string().min(1).max(255),
  file_size: z.number().int().min(1).max(10 * 1024 * 1024), // 10MB max
  mime_type: z.string().min(1)
});

// Export all types
export type {
  TemplateSubmission,
  SubmissionData,
  ValidationResult,
  UploadedFile,
  SubmissionReview,
  ReviewFeedback
};

export {
  SubmissionStatus,
  ValidationSeverity,
  FileType,
  SubmissionDataSchema,
  CreateSubmissionSchema,
  UpdateSubmissionSchema,
  SubmissionReviewSchema,
  FileUploadSchema
};