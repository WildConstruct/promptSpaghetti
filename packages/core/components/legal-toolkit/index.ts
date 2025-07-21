/**
 * Legal & Regulatory Toolkit - Index exports
 * Epic 28.3 - Domain-specific legal document processing and compliance components
 * 
 * Comprehensive toolkit for legal professionals including document parsing,
 * contract analysis, compliance checking, citation management, and terminology validation
 */

// Main components
export { LegalDocumentParser } from './LegalDocumentParser';
export { ContractAnalyzer } from './ContractAnalyzer';
export { ComplianceChecker } from './ComplianceChecker';
export { CitationManager } from './CitationManager';
export { TerminologyValidator } from './TerminologyValidator';

// Type definitions
export * from './types';

// Re-export commonly used types for convenience
export type {
  LegalDocument,
  ContractAnalysis,
  ContractClause,
  ComplianceCheck,
  Citation,
  LegalTerminology,
  TermValidationResult,
  WorkflowTemplate
} from './types';