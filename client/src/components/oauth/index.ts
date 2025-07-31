/**
 * OAuth Components - Epic 19.5
 *
 * Export all OAuth-related components for the configuration UI framework.
 *
 * Task: T-1752989143998-560 - Build OAuth configuration UI
 * Part of Epic 19.5 - OAuth Implementation & Framework
 */

export { default as OAuthConfigurationInterface } from './OAuthConfigurationInterface';
export { default as OAuthProviderManager } from './OAuthProviderManager';
export { default as OAuthUserAccountManager } from './OAuthUserAccountManager';
export { default as OAuthSecurityDashboard } from './OAuthSecurityDashboard';

// Re-export all types for external consumption
export type {
  // From OAuthConfigurationInterface
  OAuthProvider,
  OAuthConfiguration,
  SecuritySettings,
  ComplianceSettings,
  SecurityAssessment,
  SecurityFinding,
  ComplianceStatus,
  ComplianceIssue,
  ValidationResult,
  ValidationError,
  ValidationWarning,

  // From OAuthProviderManager
  ProviderStatistics,
  ProviderTestResult,

  // From OAuthUserAccountManager
  LinkedOAuthAccount,
  Permission,
  AccountMetadata,
  AvailableProvider,
  ProviderScope,
  LinkingResult,
} from './OAuthConfigurationInterface';
