// Epic 17.5.5 - Frontend Types for Verification System

export type VerificationLevel = 'basic' | 'intermediate' | 'advanced' | 'premium';

export type VerificationStatus = 'unverified' | 'pending' | 'in_review' | 'approved' | 'rejected' | 'suspended';

export type VerificationRequestStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'requires_additional_info';

export type DocumentType = 'identity' | 'business_license' | 'tax_document' | 'bank_statement' | 'portfolio' | 'credential' | 'other';

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

export interface VerificationRequest {
  id: string;
  user_id: string;
  requested_level: VerificationLevel;
  status: VerificationRequestStatus;
  submitted_at?: string;
  reviewed_at?: string;
  reviewer_id?: string;
  review_notes?: string;
  rejection_reason?: string;
  information: VerificationInformation;
  documents: VerificationDocument[];
  created_at: string;
  updated_at: string;
}

export interface VerificationDocument {
  id: string;
  verification_request_id: string;
  document_type: DocumentType;
  file_name: string;
  file_size: number;
  file_type: string;
  s3_key: string;
  status: 'pending_upload' | 'uploaded' | 'processing' | 'verified' | 'rejected';
  verification_notes?: string;
  uploaded_at?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserVerificationStatus {
  user_id: string;
  current_level: VerificationLevel;
  status: VerificationStatus;
  verified_at?: string;
  expires_at?: string;
  trust_score: number;
  badges: string[];
  verification_history: VerificationRequest[];
}

export interface TrustBadge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  requirements: {
    min_verification_level: VerificationLevel;
    additional_criteria: Record<string, any>;
  };
  is_active: boolean;
  created_at: string;
}