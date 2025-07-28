// Epic 17.5.5 - Marketplace Verification System Types
import { z } from 'zod';

export enum VerificationLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate', 
  ADVANCED = 'advanced',
  PREMIUM = 'premium'
}

export enum VerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  IN_REVIEW = 'in_review', 
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended'
}

export enum DocumentType {
  IDENTITY = 'identity',
  BUSINESS_LICENSE = 'business_license',
  TAX_DOCUMENT = 'tax_document',
  BANK_STATEMENT = 'bank_statement',
  PORTFOLIO = 'portfolio',
  CREDENTIAL = 'credential',
  OTHER = 'other'
}

export enum VerificationRequestStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REQUIRES_ADDITIONAL_INFO = 'requires_additional_info'
}

// Core verification interfaces
}
export interface VerificationRequest {
  id: string;
  user_id: string;
  requested_level: VerificationLevel;
  status: VerificationRequestStatus;
  submitted_at?: Date;
  reviewed_at?: Date;
  reviewer_id?: string;
  review_notes?: string;
  rejection_reason?: string;
  information: VerificationInformation;
  documents: VerificationDocument[];
  created_at: Date;
  updated_at: Date;
}
}

}
export interface VerificationInformation {
  personal_info: {
    full_name: string;
    email: string;
    phone?: string;
    date_of_birth?: string;
    country: string;
    state_province?: string;
    city?: string;
    postal_code?: string;
    address_line_1?: string;
    address_line_2?: string;
}
  };
  professional_info?: {
    job_title?: string;
    company?: string;
    industry?: string;
    years_experience?: number;
    linkedin_url?: string;
    website_url?: string;
    portfolio_url?: string;
  };
  business_info?: {
    business_name?: string;
    business_type?: string;
    registration_number?: string;
    tax_id?: string;
    business_address?: {
      country: string;
      state_province?: string;
      city?: string;
      postal_code?: string;
      address_line_1?: string;
      address_line_2?: string;
    };
  };
  verification_purpose: string;
  additional_notes?: string;
}

}
export interface VerificationDocument {
  id: string;
  verification_request_id: string;
  document_type: DocumentType;
  file_name: string;
  file_size: number;
  file_type: string; // MIME type
  s3_key: string;
  upload_url?: string; // Presigned URL for upload
  status: 'pending_upload' | 'uploaded' | 'processing' | 'verified' | 'rejected';
  verification_notes?: string;
  uploaded_at?: Date;
  verified_at?: Date;
  created_at: Date;
  updated_at: Date;
}
}

}
export interface UserVerificationStatus {
  user_id: string;
  current_level: VerificationLevel;
  status: VerificationStatus;
  verified_at?: Date;
  expires_at?: Date;
  trust_score: number; // 0-100
  badges: string[];
  verification_history: VerificationRequest[];
}
}

}
export interface TrustBadge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  requirements: {
    min_verification_level: VerificationLevel;
    additional_criteria: Record<string, any>;
}
  };
  is_active: boolean;
  created_at: Date;
}

// API request/response schemas
export const VerificationInformationSchema = z.object({
  personal_info: z.object({
    full_name: z.string().min(1).max(255),
    email: z.string().email(),
    phone: z.string().optional(),
    date_of_birth: z.string().optional(),
    country: z.string().min(2).max(2), // ISO country code
    state_province: z.string().optional(),
    city: z.string().optional(),
    postal_code: z.string().optional(),
    address_line_1: z.string().optional(),
    address_line_2: z.string().optional()
  }),
  professional_info: z.object({
    job_title: z.string().optional(),
    company: z.string().optional(),
    industry: z.string().optional(),
    years_experience: z.number().int().min(0).max(70).optional(),
    linkedin_url: z.string().url().optional(),
    website_url: z.string().url().optional(),
    portfolio_url: z.string().url().optional()
  }).optional(),
  business_info: z.object({
    business_name: z.string().optional(),
    business_type: z.string().optional(),
    registration_number: z.string().optional(),
    tax_id: z.string().optional(),
    business_address: z.object({
      country: z.string().min(2).max(2),
      state_province: z.string().optional(),
      city: z.string().optional(),
      postal_code: z.string().optional(),
      address_line_1: z.string().optional(),
      address_line_2: z.string().optional()
    }).optional()
  }).optional(),
  verification_purpose: z.string().min(10).max(1000),
  additional_notes: z.string().max(2000).optional()
});

export const CreateVerificationRequestSchema = z.object({
  requested_level: z.nativeEnum(VerificationLevel),
  information: VerificationInformationSchema
});

export const UpdateVerificationRequestSchema = z.object({
  information: VerificationInformationSchema.optional(),
  status: z.nativeEnum(VerificationRequestStatus).optional()
});

export const CreateDocumentUploadSchema = z.object({
  verification_request_id: z.string().uuid(),
  document_type: z.nativeEnum(DocumentType),
  file_name: z.string().min(1).max(255),
  file_size: z.number().int().min(1).max(50 * 1024 * 1024), // 50MB max
  file_type: z.string().regex(/^(image|application|text)\/[\w\-\.]+$/)
});

export const ReviewVerificationRequestSchema = z.object({
  status: z.enum(['approved', 'rejected', 'requires_additional_info']),
  review_notes: z.string().optional(),
  rejection_reason: z.string().optional(),
  approved_level: z.nativeEnum(VerificationLevel).optional()
});

// Analytics and reporting interfaces
}
export interface VerificationMetrics {
  period_start: Date;
  period_end: Date;
  total_requests: number;
  requests_by_level: Record<VerificationLevel, number>;
  requests_by_status: Record<VerificationRequestStatus, number>;
  avg_review_time_hours: number;
  approval_rate: number;
}
  trust_score_distribution: Array<{ range: string; count: number }>;
  top_rejection_reasons: Array<{ reason: string; count: number }>;
}

}
export interface VerificationQueue {
  pending_reviews: VerificationRequest[];
  avg_wait_time_hours: number;
  queue_depth: number;
  sla_breaches: number;
}
  reviewer_workload: Array<{ reviewer_id: string; assigned_count: number }>;
}

// Export all types
export type {
  VerificationRequest,
  VerificationInformation, 
  VerificationDocument,
  UserVerificationStatus,
  TrustBadge,
  VerificationMetrics,
  VerificationQueue
};

export {
  VerificationInformationSchema,
  CreateVerificationRequestSchema,
  UpdateVerificationRequestSchema,
  CreateDocumentUploadSchema,
  ReviewVerificationRequestSchema
};