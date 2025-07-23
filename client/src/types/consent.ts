/**
 * Consent Management Types
 * 
 * TypeScript type definitions for GDPR-compliant consent management system
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */

// Core consent types
export enum ConsentType {
  NECESSARY = 'necessary',
  ANALYTICS = 'analytics',
  MARKETING = 'marketing',
  PERSONALIZATION = 'personalization',
  ADVERTISING = 'advertising',
  SOCIAL_MEDIA = 'social_media',
  FUNCTIONAL = 'functional',
  PERFORMANCE = 'performance'
}

export enum ConsentStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  PENDING = 'pending',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired'
}

export enum LegalBasis {
  CONSENT = 'consent',
  LEGITIMATE_INTEREST = 'legitimate_interest',
  CONTRACT = 'contract',
  LEGAL_OBLIGATION = 'legal_obligation',
  VITAL_INTERESTS = 'vital_interests',
  PUBLIC_TASK = 'public_task'
}

// Consent record structure
export interface ConsentRecord {
  consentId: string;
  userId?: string;
  sessionId: string;
  consentType: ConsentType;
  status: ConsentStatus;
  legalBasis: LegalBasis;
  grantedAt: Date;
  expiresAt?: Date;
  withdrawnAt?: Date;
  source: 'banner' | 'preferences' | 'just_in_time' | 'api';
  version: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
}

// Configuration types
export interface ConsentConfiguration {
  version: string;
  lastUpdated: Date;
  consentTypes: ConsentTypeConfig[];
  bannerConfig: BannerConfiguration;
  retentionPeriod: number; // days
  autoExpiry: boolean;
  requireExplicitConsent: boolean;
}

export interface ConsentTypeConfig {
  type: ConsentType;
  name: string;
  description: string;
  purpose: string;
  isEssential: boolean;
  legalBasis: LegalBasis;
  defaultStatus: ConsentStatus;
  expiryDays?: number;
  dataCategories: DataCategoryInfo[];
  thirdParties: ThirdPartyInfo[];
  cookies: CookieInfo[];
  justInTimePrompts: JustInTimePromptConfig[];
}

export interface DataCategoryInfo {
  name: string;
  description: string;
  examples: string[];
  retention: string;
}

export interface ThirdPartyInfo {
  name: string;
  domain: string;
  purpose: string;
  dataShared: string[];
  privacyPolicy: string;
}

export interface CookieInfo {
  name: string;
  purpose: string;
  type: 'session' | 'persistent' | 'secure' | 'httpOnly';
  duration?: number; // days
  domain: string;
  path?: string;
}

// Just-in-time prompt configuration
export interface JustInTimePromptConfig {
  triggerId: string;
  title: string;
  message: string;
  contexts: JustInTimeContext[];
  appearance: JustInTimeAppearance;
  behavior: JustInTimeBehavior;
}

export interface JustInTimeContext {
  feature: string; // e.g., 'analytics_dashboard', 'marketing_newsletter', 'social_sharing'
  action: string; // e.g., 'view', 'click', 'submit', 'load'
  selector?: string; // CSS selector for DOM elements
  urlPattern?: string; // URL pattern to match
  conditions?: ContextCondition[];
}

export interface ContextCondition {
  type: 'user_property' | 'session_property' | 'page_property' | 'time_based';
  property: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'greater_than' | 'less_than';
  value: unknown;
}

export interface JustInTimeAppearance {
  style: 'modal' | 'banner' | 'sidebar' | 'tooltip' | 'inline';
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  theme: 'light' | 'dark' | 'auto';
  size: 'small' | 'medium' | 'large';
  showIcon: boolean;
  iconType?: 'info' | 'warning' | 'question' | 'shield';
  customStyles?: CSSStyleDeclaration;
}

export interface JustInTimeBehavior {
  showOnce: boolean;
  cooldownPeriod?: number; // minutes
  maxShowsPerSession?: number;
  requireResponse: boolean;
  allowDismiss: boolean;
  autoHideAfter?: number; // seconds
  blockInteraction: boolean; // block the original action until consent is given
}

// Banner configuration
export interface BannerConfiguration {
  enabled: boolean;
  position: 'top' | 'bottom' | 'center';
  theme: 'light' | 'dark';
  layout: BannerLayout;
  content: BannerContent;
  styling: BannerStyling;
  enableAcceptAll: boolean;
  enableRejectAll: boolean;
  enableCustomize: boolean;
}

export interface BannerLayout {
  showLogo: boolean;
  buttonsLayout: 'horizontal' | 'vertical' | 'stacked';
  showCloseButton: boolean;
  showProgressBar: boolean;
}

export interface BannerContent {
  title: string;
  message: string;
  acceptAllText: string;
  rejectAllText: string;
  customizeText: string;
  privacyPolicyUrl: string;
  cookiePolicyUrl: string;
  learnMoreUrl?: string;
}

export interface BannerStyling {
  backgroundColor?: string;
  textColor?: string;
  linkColor?: string;
  primaryButtonColor?: string;
  primaryButtonTextColor?: string;
  secondaryButtonColor?: string;
  secondaryButtonTextColor?: string;
  borderRadius?: string;
  fontSize?: string;
  fontFamily?: string;
  boxShadow?: string;
  zIndex?: number;
}

// User preferences
export interface ConsentPreferences {
  userId?: string;
  sessionId: string;
  version: string;
  lastUpdated: Date;
  consents: Record<ConsentType, ConsentStatus>;
  userPreferences: UserPreferenceSettings;
  notifications: NotificationSettings;
}

export interface UserPreferenceSettings {
  language: string;
  timezone: string;
  privacySettings: PrivacySettings;
  communicationPreferences: CommunicationPreferences;
}

export interface PrivacySettings {
  dataProcessingOptOut: boolean;
  profileVisibility: 'public' | 'limited' | 'private';
  trackingOptOut: boolean;
  dataRetentionPeriod: number; // days
}

export interface CommunicationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  productUpdates: boolean;
  securityAlerts: boolean;
}

export interface NotificationSettings {
  showBanner: boolean;
  showJustInTimePrompts: boolean;
  reminderFrequency: number; // days
  lastReminderShown?: Date;
}

// State management
export interface ConsentBannerState {
  isVisible: boolean;
  mode: 'compact' | 'detailed';
  hasInteracted: boolean;
  showPreferences: boolean;
  isLoading: boolean;
  error?: string;
}

export interface JustInTimePromptState {
  activePrompts: ActivePrompt[];
  cooldowns: Record<string, Date>;
  sessionCounts: Record<string, number>;
  dismissedPrompts: string[];
}

export interface ActivePrompt {
  id: string;
  config: JustInTimePromptConfig;
  consentType: ConsentType;
  context: JustInTimeContext;
  triggeredAt: Date;
  position?: { x: number; y: number };
}

// Data export (GDPR Article 20)
export interface ConsentExport {
  exportId: string;
  userId?: string;
  sessionId: string;
  exportedAt: Date;
  version: string;
  data: {
    consents: ConsentRecord[];
    preferences: ConsentPreferences;
    interactions: ConsentInteraction[];
    configuration: ConsentConfiguration;
  };
}

export interface ConsentInteraction {
  interactionId: string;
  timestamp: Date;
  action: 'view_banner' | 'accept_all' | 'reject_all' | 'customize' | 'just_in_time_prompt' | 'grant_consent' | 'withdraw_consent';
  consentType?: ConsentType;
  source: string;
  metadata?: Record<string, unknown>;
}

// API types
export interface ConsentConfigRequest {
  version?: string;
  types?: ConsentType[];
}

export interface ConsentConfigResponse {
  success: boolean;
  data: ConsentConfiguration;
  version: string;
}

export interface ConsentPreferencesRequest {
  userId?: string;
  sessionId: string;
  preferences: Partial<ConsentPreferences>;
}

export interface ConsentPreferencesResponse {
  success: boolean;
  preferences: ConsentPreferences;
  message?: string;
}

export interface ConsentRecordRequest {
  consentType: ConsentType;
  status: ConsentStatus;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface ConsentRecordResponse {
  success: boolean;
  record: ConsentRecord;
  message?: string;
}

// Hook return type
export interface UseConsentReturn {
  preferences: ConsentPreferences | null;
  isLoading: boolean;
  error: string | null;
  hasConsent: (type: ConsentType) => boolean;
  grantConsent: (type: ConsentType, source?: string) => Promise<void>;
  withdrawConsent: (type: ConsentType, source?: string) => Promise<void>;
  updatePreferences: (updates: Partial<ConsentPreferences>) => Promise<void>;
  exportData: () => Promise<ConsentExport>;
  resetConsents: () => Promise<void>;
  refreshConfig: () => Promise<void>;
}

// Just-in-time prompt hook return type
export interface UseJustInTimeReturn {
  activePrompts: ActivePrompt[];
  showPrompt: (feature: string, action: string, element?: HTMLElement) => Promise<boolean>;
  dismissPrompt: (promptId: string) => void;
  respondToPrompt: (promptId: string, granted: boolean) => Promise<void>;
  clearCooldowns: () => void;
  isPromptAllowed: (triggerId: string) => boolean;
}

// Event types for consent service
export interface ConsentEvent {
  type: 'consent_given' | 'consent_withdrawn' | 'preferences_saved' | 'just_in_time_shown' | 'just_in_time_responded';
  consentType?: ConsentType;
  source: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Validation types
export interface ConsentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ConsentComplianceCheck {
  isCompliant: boolean;
  missingConsents: ConsentType[];
  expiredConsents: ConsentType[];
  recommendations: string[];
}