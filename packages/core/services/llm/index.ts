// LLM Service Exports
// Using API-based services that don't require OpenAI in the browser

// Export API-based services instead of OpenAI-dependent ones
export {
  LLMService,
  NodeIntelligenceService,
  TextRefinementService,
  GraphAnalyzer,
  MetadataExtractor,
  SimilarityEngine,
  TokenTracker
} from '../ApiLLMService';

// These don't depend on OpenAI, can be exported as-is
export { ModelSelector } from './ModelSelector';
export { CacheManager } from './CacheManager';
export { PrivacyFilter } from './PrivacyFilter';
export { ContinuityTracker } from './ContinuityTracker';
export { BulkOperationsManager } from './BulkOperationsManager';
export { ComplianceAuditSystem } from './ComplianceAuditSystem';

export type { SegmentMetadata, ExtractionResult } from './MetadataExtractor';

export type {
  ExtraProfile,
  ContinuityIssue,
  ValidationResult,
  SceneContext,
  WardrobeHistory,
  ActionHistory
} from './ContinuityTracker';

export type {
  SimilarAsset,
  AssetEmbedding,
  ClusterInfo,
  SimilarityOptions
} from './SimilarityEngine';

export type {
  BulkOperation,
  BulkOperationOptions,
  StyleTemplate,
  NaturalLanguageQuery
} from './BulkOperationsManager';

export type {
  AuditEntry,
  ConsentRecord,
  DataRetentionPolicy,
  ComplianceReport,
  DeletionRequest
} from './ComplianceAuditSystem';

export type {
  Choice,
  WeightOptimizationResult,
  InspirationSuggestion,
  VariableInfo
} from './NodeIntelligence';

export type {
  RefinementMode,
  RefinementResult,
  DiffSegment
} from './TextRefinementService';

export type {
  Conflict,
  MergeSuggestion,
  SplitSuggestion,
  ComplexityReport,
  PreviewVariation
} from './GraphAnalyzer';

export type {
  LLMRequest,
  LLMResponse,
  LLMServiceConfig,
  LLMMetrics,
  ModelConfig,
  TokenUsage,
  UserQuota,
  CacheEntry,
  SuggestionResponse,
  MetadataResponse,
  RefinementResponse,
  StructuredOutputSchema
} from './types';
