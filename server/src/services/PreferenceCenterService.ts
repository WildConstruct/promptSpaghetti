// Preference Center Service - Epic 19
// Comprehensive user preference management system integrating policy, consent, and privacy controls

import { DatabaseService } from '../database/DatabaseService';
import { AuditService } from '../auth/services/AuditService';
import { PolicyAcceptanceTrackingService, ConsentData, GranularConsent } from './PolicyAcceptanceTrackingService';
import { EventEmitter } from 'events';

export interface UserPreferenceCenter {
  preferenceCenterId: string;
  userId: string;
  userEmail: string;
  profileSettings: ProfilePreferences;
  privacySettings: PrivacyPreferences;
  communicationSettings: CommunicationPreferences;
  dataSettings: DataPreferences;
  securitySettings: SecurityPreferences;
  consentSettings: ConsentPreferences;
  notificationSettings: NotificationPreferences;
  accessibilitySettings: AccessibilityPreferences;
  integrationSettings: IntegrationPreferences;
  customPreferences: CustomPreference[];
  preferencesVersion: string;
  lastUpdated: Date;
  metadata: PreferenceCenterMetadata;
}

export interface ProfilePreferences {
  displayName: string;
  firstName: string;
  lastName: string;
  bio: string;
  profileImage?: string;
  timezone: string;
  locale: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
  dateFormat: string;
  timeFormat: '12h' | '24h';
  visibility: ProfileVisibility;
}

export interface ProfileVisibility {
  profilePublic: boolean;
  showEmail: boolean;
  showName: boolean;
  showActivity: boolean;
  showBadges: boolean;
  searchable: boolean;
  allowDirectMessages: boolean;
}

export interface PrivacyPreferences {
  dataMinimization: boolean;
  anonymousAnalytics: boolean;
  personalizedContent: boolean;
  behaviorTracking: boolean;
  locationTracking: boolean;
  crossSiteTracking: boolean;
  adPersonalization: boolean;
  thirdPartySharing: ThirdPartySharing;
  rightToErasure: RightToErasureSettings;
  dataPortability: DataPortabilitySettings;
  consentWithdrawal: ConsentWithdrawalSettings;
}

export interface ThirdPartySharing {
  enabled: boolean;
  allowedCategories: ThirdPartyCategory[];
  blockedCategories: ThirdPartyCategory[];
  requireExplicitConsent: boolean;
  allowDataEnrichment: boolean;
  allowMarketing: boolean;
  allowAnalytics: boolean;
}

export enum ThirdPartyCategory {
  ANALYTICS = 'ANALYTICS',
  MARKETING = 'MARKETING',
  ADVERTISING = 'ADVERTISING',
  PAYMENT = 'PAYMENT',
  SECURITY = 'SECURITY',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  CUSTOMER_SUPPORT = 'CUSTOMER_SUPPORT',
  CONTENT_DELIVERY = 'CONTENT_DELIVERY',
  RESEARCH = 'RESEARCH',
  COMPLIANCE = 'COMPLIANCE'
}

export interface RightToErasureSettings {
  enableAutomaticDeletion: boolean;
  automaticDeletionPeriod: number; // days
  retainForLegal: boolean;
  retainForSecurity: boolean;
  allowPartialDeletion: boolean;
  deleteRequestMethod: 'IMMEDIATE' | 'SCHEDULED' | 'MANUAL_REVIEW';
  notifyBeforeDeletion: boolean;
  notificationPeriod: number; // days
}

export interface DataPortabilitySettings {
  allowDataExport: boolean;
  exportFormats: DataExportFormat[];
  includeMetadata: boolean;
  includeAnalytics: boolean;
  includeLogs: boolean;
  automaticBackups: boolean;
  backupFrequency: BackupFrequency;
  encryptExports: boolean;
}

export enum DataExportFormat {
  JSON = 'JSON',
  CSV = 'CSV',
  XML = 'XML',
  PDF = 'PDF',
  PLAIN_TEXT = 'PLAIN_TEXT'
}

export enum BackupFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  NEVER = 'NEVER'
}

export interface ConsentWithdrawalSettings {
  allowGranularWithdrawal: boolean;
  requireReason: boolean;
  confirmationRequired: boolean;
  cooldownPeriod: number; // days
  notifyDataControllers: boolean;
  retainWithdrawalRecord: boolean;
  automaticCleanup: boolean;
}

export interface CommunicationPreferences {
  email: EmailCommunicationSettings;
  sms: SMSCommunicationSettings;
  push: PushNotificationSettings;
  inApp: InAppNotificationSettings;
  postal: PostalCommunicationSettings;
  frequency: CommunicationFrequency;
  quietHours: QuietHoursSettings;
  channels: CommunicationChannel[];
}

export interface EmailCommunicationSettings {
  enabled: boolean;
  categories: EmailCategory[];
  frequency: EmailFrequency;
  format: 'HTML' | 'PLAIN_TEXT';
  unsubscribeMethod: UnsubscribeMethod;
  suppressDuplicates: boolean;
  personalizedContent: boolean;
  trackingPixels: boolean;
  allowThirdParty: boolean;
}

export interface EmailCategory {
  category: EmailCategoryType;
  enabled: boolean;
  frequency: EmailFrequency;
  priority: CommunicationPriority;
}

export enum EmailCategoryType {
  SECURITY = 'SECURITY',
  SYSTEM = 'SYSTEM',
  UPDATES = 'UPDATES',
  MARKETING = 'MARKETING',
  PROMOTIONAL = 'PROMOTIONAL',
  EDUCATIONAL = 'EDUCATIONAL',
  SURVEYS = 'SURVEYS',
  NEWSLETTERS = 'NEWSLETTERS',
  REMINDERS = 'REMINDERS',
  LEGAL = 'LEGAL'
}

export enum EmailFrequency {
  IMMEDIATE = 'IMMEDIATE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  NEVER = 'NEVER'
}

export enum CommunicationPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum UnsubscribeMethod {
  ONE_CLICK = 'ONE_CLICK',
  EMAIL_REPLY = 'EMAIL_REPLY',
  PREFERENCE_CENTER = 'PREFERENCE_CENTER',
  SUPPORT_REQUEST = 'SUPPORT_REQUEST'
}

export interface SMSCommunicationSettings {
  enabled: boolean;
  phoneNumber: string;
  categories: SMSCategory[];
  allowMarketing: boolean;
  allowReminders: boolean;
  allowSecurity: boolean;
  optOutMethod: SMSOptOutMethod;
}

export interface SMSCategory {
  category: SMSCategoryType;
  enabled: boolean;
  priority: CommunicationPriority;
}

export enum SMSCategoryType {
  SECURITY = 'SECURITY',
  TWO_FACTOR = 'TWO_FACTOR',
  ALERTS = 'ALERTS',
  REMINDERS = 'REMINDERS',
  MARKETING = 'MARKETING',
  UPDATES = 'UPDATES'
}

export enum SMSOptOutMethod {
  REPLY_STOP = 'REPLY_STOP',
  PREFERENCE_CENTER = 'PREFERENCE_CENTER',
  CUSTOMER_SERVICE = 'CUSTOMER_SERVICE'
}

export interface PushNotificationSettings {
  enabled: boolean;
  devices: PushDevice[];
  categories: PushCategory[];
  allowBadges: boolean;
  allowSounds: boolean;
  allowVibration: boolean;
  quietHours: QuietHoursSettings;
  geofencing: boolean;
}

export interface PushDevice {
  deviceId: string;
  deviceName: string;
  platform: 'iOS' | 'Android' | 'Web';
  enabled: boolean;
  registeredAt: Date;
  lastSeen: Date;
}

export interface PushCategory {
  category: PushCategoryType;
  enabled: boolean;
  priority: CommunicationPriority;
  allowQuietHours: boolean;
}

export enum PushCategoryType {
  SECURITY = 'SECURITY',
  MESSAGES = 'MESSAGES',
  MENTIONS = 'MENTIONS',
  UPDATES = 'UPDATES',
  REMINDERS = 'REMINDERS',
  SOCIAL = 'SOCIAL',
  NEWS = 'NEWS',
  PROMOTIONS = 'PROMOTIONS'
}

export interface InAppNotificationSettings {
  enabled: boolean;
  categories: InAppCategory[];
  showPreviews: boolean;
  playSound: boolean;
  showBadges: boolean;
  autoMarkRead: boolean;
  retentionPeriod: number; // days
}

export interface InAppCategory {
  category: InAppCategoryType;
  enabled: boolean;
  priority: CommunicationPriority;
  showPreview: boolean;
}

export enum InAppCategoryType {
  SYSTEM = 'SYSTEM',
  MESSAGES = 'MESSAGES',
  MENTIONS = 'MENTIONS',
  UPDATES = 'UPDATES',
  ACHIEVEMENTS = 'ACHIEVEMENTS',
  REMINDERS = 'REMINDERS',
  TIPS = 'TIPS'
}

export interface PostalCommunicationSettings {
  enabled: boolean;
  address: PostalAddress;
  categories: PostalCategory[];
  allowMarketing: boolean;
  allowCatalogs: boolean;
  allowSurveys: boolean;
}

export interface PostalAddress {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  verified: boolean;
  verifiedAt?: Date;
}

export interface PostalCategory {
  category: PostalCategoryType;
  enabled: boolean;
}

export enum PostalCategoryType {
  LEGAL = 'LEGAL',
  MARKETING = 'MARKETING',
  CATALOGS = 'CATALOGS',
  SURVEYS = 'SURVEYS',
  INVITATIONS = 'INVITATIONS'
}

export interface CommunicationFrequency {
  global: GlobalFrequency;
  byChannel: ChannelFrequency[];
  byCategory: CategoryFrequency[];
  respectQuietHours: boolean;
  batchSimilar: boolean;
  intelligentTiming: boolean;
}

export interface GlobalFrequency {
  maxDaily: number;
  maxWeekly: number;
  maxMonthly: number;
  priorityOverride: boolean;
}

export interface ChannelFrequency {
  channel: CommunicationChannelType;
  maxDaily: number;
  maxWeekly: number;
  respectGlobal: boolean;
}

export interface CategoryFrequency {
  category: string;
  maxDaily: number;
  maxWeekly: number;
  priority: CommunicationPriority;
}

export interface QuietHoursSettings {
  enabled: boolean;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  timezone: string;
  daysOfWeek: DayOfWeek[];
  allowCritical: boolean;
  allowSecurity: boolean;
  exceptions: QuietHoursException[];
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

export interface QuietHoursException {
  exceptionId: string;
  name: string;
  channels: CommunicationChannelType[];
  categories: string[];
  startDate: Date;
  endDate: Date;
  recurring: boolean;
  recurrencePattern?: RecurrencePattern;
}

export interface RecurrencePattern {
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  daysOfWeek?: DayOfWeek[];
  dayOfMonth?: number;
  monthOfYear?: number;
}

export interface CommunicationChannel {
  channelId: string;
  type: CommunicationChannelType;
  enabled: boolean;
  priority: number;
  settings: Record<string, any>;
}

export enum CommunicationChannelType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
  POSTAL = 'POSTAL',
  WEBHOOK = 'WEBHOOK',
  SLACK = 'SLACK',
  TEAMS = 'TEAMS'
}

export interface DataPreferences {
  collection: DataCollectionSettings;
  processing: DataProcessingSettings;
  retention: DataRetentionSettings;
  sharing: DataSharingSettings;
  analytics: AnalyticsSettings;
  cookies: CookieSettings;
  tracking: TrackingSettings;
}

export interface DataCollectionSettings {
  allowAutomaticCollection: boolean;
  minimizeCollection: boolean;
  requiredDataOnly: boolean;
  explicitConsentRequired: boolean;
  allowInference: boolean;
  allowEnrichment: boolean;
  collectMetadata: boolean;
  collectBehavioral: boolean;
  collectGeolocation: boolean;
  collectDevice: boolean;
}

export interface DataProcessingSettings {
  allowAutomatedDecisions: boolean;
  allowProfiling: boolean;
  allowMachineLearning: boolean;
  allowPersonalization: boolean;
  allowAggregation: boolean;
  allowAnonymization: boolean;
  allowPseudonymization: boolean;
  requireHumanReview: boolean;
  processOnlyNecessary: boolean;
}

export interface DataRetentionSettings {
  useDefaultRetention: boolean;
  customRetentionPeriods: CustomRetentionPeriod[];
  autoDeleteExpired: boolean;
  notifyBeforeExpiry: boolean;
  notificationPeriod: number; // days
  allowExtension: boolean;
  extensionReason: string[];
  archiveBeforeDelete: boolean;
}

export interface CustomRetentionPeriod {
  dataCategory: string;
  retentionPeriod: number; // days
  reason: string;
  legalBasis: string;
  reviewRequired: boolean;
}

export interface DataSharingSettings {
  allowSharing: boolean;
  allowInternalSharing: boolean;
  allowThirdPartySharing: boolean;
  requireExplicitConsent: boolean;
  allowedPartners: SharingPartner[];
  blockedPartners: string[];
  allowedPurposes: SharingPurpose[];
  geographicRestrictions: GeographicRestriction[];
}

export interface SharingPartner {
  partnerId: string;
  partnerName: string;
  partnerType: PartnerType;
  allowedDataTypes: string[];
  allowedPurposes: SharingPurpose[];
  retentionPeriod: number;
  contractualSafeguards: boolean;
  adequacyDecision: boolean;
}

export enum PartnerType {
  SERVICE_PROVIDER = 'SERVICE_PROVIDER',
  BUSINESS_PARTNER = 'BUSINESS_PARTNER',
  AFFILIATE = 'AFFILIATE',
  GOVERNMENT = 'GOVERNMENT',
  RESEARCH = 'RESEARCH',
  MARKETING = 'MARKETING'
}

export enum SharingPurpose {
  SERVICE_DELIVERY = 'SERVICE_DELIVERY',
  ANALYTICS = 'ANALYTICS',
  MARKETING = 'MARKETING',
  RESEARCH = 'RESEARCH',
  COMPLIANCE = 'COMPLIANCE',
  SECURITY = 'SECURITY',
  FRAUD_PREVENTION = 'FRAUD_PREVENTION',
  CUSTOMER_SUPPORT = 'CUSTOMER_SUPPORT'
}

export interface GeographicRestriction {
  type: 'ALLOW' | 'BLOCK';
  countries: string[];
  regions: string[];
  adequacyRequired: boolean;
  safeguardsRequired: boolean;
}

export interface AnalyticsSettings {
  allowAnalytics: boolean;
  allowPersonalizedAnalytics: boolean;
  allowCrossSiteAnalytics: boolean;
  allowThirdPartyAnalytics: boolean;
  allowHeatmaps: boolean;
  allowSessionRecording: boolean;
  allowABTesting: boolean;
  allowCohortAnalysis: boolean;
  allowPredictiveAnalytics: boolean;
  retentionPeriod: number; // days
}

export interface CookieSettings {
  allowEssentialCookies: boolean;
  allowFunctionalCookies: boolean;
  allowAnalyticsCookies: boolean;
  allowMarketingCookies: boolean;
  allowThirdPartyCookies: boolean;
  allowCrossSiteCookies: boolean;
  cookieRetention: CookieRetentionSettings;
  sameSitePolicy: SameSitePolicy;
  secureOnly: boolean;
}

export interface CookieRetentionSettings {
  essentialRetention: number; // days
  functionalRetention: number;
  analyticsRetention: number;
  marketingRetention: number;
  autoCleanup: boolean;
}

export enum SameSitePolicy {
  STRICT = 'Strict',
  LAX = 'Lax',
  NONE = 'None'
}

export interface TrackingSettings {
  allowTracking: boolean;
  allowCrossSiteTracking: boolean;
  allowFingerprintingProtection: boolean;
  allowReferrerTracking: boolean;
  allowPixelTracking: boolean;
  allowEmailTracking: boolean;
  allowLocationTracking: boolean;
  allowDeviceTracking: boolean;
  doNotTrack: boolean;
  globalPrivacyControl: boolean;
}

export interface SecurityPreferences {
  twoFactorAuth: TwoFactorSettings;
  passwordSettings: PasswordSecuritySettings;
  sessionManagement: SessionSecuritySettings;
  deviceManagement: DeviceSecuritySettings;
  loginNotifications: LoginNotificationSettings;
  securityAlerts: SecurityAlertSettings;
  privacyEnhancements: PrivacyEnhancementSettings;
}

export interface TwoFactorSettings {
  enabled: boolean;
  methods: TwoFactorMethod[];
  backupCodes: boolean;
  requireForSensitive: boolean;
  rememberDevice: boolean;
  rememberDuration: number; // days
}

export interface TwoFactorMethod {
  methodId: string;
  type: TwoFactorType;
  enabled: boolean;
  isPrimary: boolean;
  isBackup: boolean;
  metadata: Record<string, any>;
}

export enum TwoFactorType {
  TOTP = 'TOTP',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  HARDWARE_KEY = 'HARDWARE_KEY',
  BIOMETRIC = 'BIOMETRIC',
  PUSH = 'PUSH'
}

export interface PasswordSecuritySettings {
  requireStrong: boolean;
  minLength: number;
  requireSpecialChars: boolean;
  requireNumbers: boolean;
  requireUppercase: boolean;
  requireLowercase: boolean;
  preventReuse: boolean;
  reuseHistory: number;
  expiration: boolean;
  expirationDays: number;
  warningDays: number;
}

export interface SessionSecuritySettings {
  maxConcurrentSessions: number;
  sessionTimeout: number; // minutes
  extendOnActivity: boolean;
  requireReauth: boolean;
  reauthTimeout: number; // minutes
  terminateOnLogout: boolean;
  secureTransmission: boolean;
}

export interface DeviceSecuritySettings {
  allowedDevices: TrustedDevice[];
  requireDeviceAuth: boolean;
  deviceFingerprinting: boolean;
  suspiciousDeviceAlert: boolean;
  autoLockUnknownDevices: boolean;
  deviceLimit: number;
}

export interface TrustedDevice {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  platform: string;
  trusted: boolean;
  firstSeen: Date;
  lastSeen: Date;
  location?: string;
}

export interface LoginNotificationSettings {
  enabled: boolean;
  notifySuccessful: boolean;
  notifyFailed: boolean;
  notifyUnusualLocation: boolean;
  notifyNewDevice: boolean;
  notifyPasswordChange: boolean;
  deliveryMethods: CommunicationChannelType[];
}

export interface SecurityAlertSettings {
  enabled: boolean;
  alertTypes: SecurityAlertType[];
  severity: SecurityAlertSeverity;
  deliveryMethods: CommunicationChannelType[];
  autoResponse: boolean;
  escalation: boolean;
}

export enum SecurityAlertType {
  SUSPICIOUS_LOGIN = 'SUSPICIOUS_LOGIN',
  DATA_BREACH = 'DATA_BREACH',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  POLICY_VIOLATION = 'POLICY_VIOLATION',
  UNUSUAL_ACTIVITY = 'UNUSUAL_ACTIVITY',
  FAILED_ATTEMPTS = 'FAILED_ATTEMPTS'
}

export enum SecurityAlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface PrivacyEnhancementSettings {
  anonymizeIpAddress: boolean;
  maskSensitiveData: boolean;
  encryptStoredData: boolean;
  useProxy: boolean;
  vpnRequired: boolean;
  minimizeDataExposure: boolean;
  pseudonymization: boolean;
  differentialPrivacy: boolean;
}

export interface ConsentPreferences {
  consentMethod: ConsentMethod;
  granularConsent: boolean;
  implicitConsent: boolean;
  requireExplicit: boolean;
  consentHistory: ConsentHistorySettings;
  withdrawalSettings: ConsentWithdrawalSettings;
  renewalSettings: ConsentRenewalSettings;
  crossBorderConsent: CrossBorderConsentSettings;
}

export enum ConsentMethod {
  OPT_IN = 'OPT_IN',
  OPT_OUT = 'OPT_OUT',
  EXPLICIT = 'EXPLICIT',
  IMPLIED = 'IMPLIED',
  LEGITIMATE_INTEREST = 'LEGITIMATE_INTEREST'
}

export interface ConsentHistorySettings {
  trackHistory: boolean;
  retainHistory: boolean;
  historyRetentionPeriod: number; // years
  allowAudit: boolean;
  exportHistory: boolean;
  includeWithdrawals: boolean;
}

export interface ConsentRenewalSettings {
  requireRenewal: boolean;
  renewalPeriod: number; // months
  reminderNotifications: boolean;
  reminderSchedule: ReminderSchedule[];
  autoExpiry: boolean;
  gracePeriod: number; // days
}

export interface ReminderSchedule {
  daysBefore: number;
  channels: CommunicationChannelType[];
  message: string;
  critical: boolean;
}

export interface CrossBorderConsentSettings {
  allowCrossBorderTransfer: boolean;
  requireSpecificConsent: boolean;
  adequacyDecisionRequired: boolean;
  safeguardsRequired: boolean;
  allowedDestinations: string[];
  blockedDestinations: string[];
}

export interface NotificationPreferences {
  globalSettings: GlobalNotificationSettings;
  categorySettings: NotificationCategorySettings[];
  channelSettings: NotificationChannelSettings[];
  timingSettings: NotificationTimingSettings;
  deliverySettings: NotificationDeliverySettings;
  appearanceSettings: NotificationAppearanceSettings;
}

export interface GlobalNotificationSettings {
  enabled: boolean;
  respectQuietHours: boolean;
  batchSimilar: boolean;
  intelligentTiming: boolean;
  frequencyLimits: FrequencyLimit[];
  priorityOverride: boolean;
}

export interface FrequencyLimit {
  timeWindow: number; // minutes
  maxNotifications: number;
  priority: CommunicationPriority;
  channels: CommunicationChannelType[];
}

export interface NotificationCategorySettings {
  category: NotificationCategory;
  enabled: boolean;
  priority: CommunicationPriority;
  channels: CommunicationChannelType[];
  timing: NotificationTiming;
  grouping: boolean;
  sound: string;
  vibration: boolean;
}

export enum NotificationCategory {
  SECURITY = 'SECURITY',
  SYSTEM = 'SYSTEM',
  PERSONAL = 'PERSONAL',
  SOCIAL = 'SOCIAL',
  CONTENT = 'CONTENT',
  MARKETING = 'MARKETING',
  REMINDERS = 'REMINDERS',
  UPDATES = 'UPDATES'
}

export interface NotificationTiming {
  immediate: boolean;
  delayed: boolean;
  delayMinutes: number;
  scheduled: boolean;
  scheduledTime: string;
  respectQuietHours: boolean;
}

export interface NotificationChannelSettings {
  channel: CommunicationChannelType;
  enabled: boolean;
  priority: number;
  fallback: boolean;
  retrySettings: RetrySettings;
  formatSettings: FormatSettings;
}

export interface RetrySettings {
  enabled: boolean;
  maxRetries: number;
  retryInterval: number; // minutes
  backoffMultiplier: number;
  giveUpAfter: number; // hours
}

export interface FormatSettings {
  template: string;
  includeImages: boolean;
  includeLinks: boolean;
  truncateLength: number;
  personalized: boolean;
}

export interface NotificationTimingSettings {
  quietHours: QuietHoursSettings;
  timeZone: string;
  workingHours: WorkingHoursSettings;
  weekendSettings: WeekendSettings;
  holidaySettings: HolidaySettings;
}

export interface WorkingHoursSettings {
  enabled: boolean;
  startTime: string;
  endTime: string;
  daysOfWeek: DayOfWeek[];
  allowCritical: boolean;
  allowUrgent: boolean;
}

export interface WeekendSettings {
  treatAsQuietTime: boolean;
  allowCritical: boolean;
  allowPersonal: boolean;
  customSchedule: boolean;
  customStartTime?: string;
  customEndTime?: string;
}

export interface HolidaySettings {
  respectHolidays: boolean;
  holidayCalendar: string;
  allowCritical: boolean;
  allowPersonal: boolean;
  customHolidays: CustomHoliday[];
}

export interface CustomHoliday {
  name: string;
  date: Date;
  recurring: boolean;
  allowNotifications: boolean;
  allowedCategories: NotificationCategory[];
}

export interface NotificationDeliverySettings {
  consolidation: ConsolidationSettings;
  batching: BatchingSettings;
  throttling: ThrottlingSettings;
  failover: FailoverSettings;
}

export interface ConsolidationSettings {
  enabled: boolean;
  timeWindow: number; // minutes
  maxConsolidated: number;
  groupByCategory: boolean;
  groupBySender: boolean;
  groupByPriority: boolean;
}

export interface BatchingSettings {
  enabled: boolean;
  batchSize: number;
  batchInterval: number; // minutes
  respectPriority: boolean;
  respectTiming: boolean;
}

export interface ThrottlingSettings {
  enabled: boolean;
  maxPerMinute: number;
  maxPerHour: number;
  maxPerDay: number;
  burstAllowance: number;
  priorityExempt: CommunicationPriority[];
}

export interface FailoverSettings {
  enabled: boolean;
  failoverDelay: number; // minutes
  maxFailovers: number;
  fallbackChannels: CommunicationChannelType[];
  criticalOnly: boolean;
}

export interface NotificationAppearanceSettings {
  theme: 'light' | 'dark' | 'auto';
  position: NotificationPosition;
  duration: number; // seconds
  animation: NotificationAnimation;
  sounds: NotificationSoundSettings;
  visual: VisualSettings;
}

export enum NotificationPosition {
  TOP_LEFT = 'TOP_LEFT',
  TOP_CENTER = 'TOP_CENTER',
  TOP_RIGHT = 'TOP_RIGHT',
  BOTTOM_LEFT = 'BOTTOM_LEFT',
  BOTTOM_CENTER = 'BOTTOM_CENTER',
  BOTTOM_RIGHT = 'BOTTOM_RIGHT'
}

export enum NotificationAnimation {
  NONE = 'NONE',
  FADE = 'FADE',
  SLIDE = 'SLIDE',
  BOUNCE = 'BOUNCE',
  SCALE = 'SCALE'
}

export interface NotificationSoundSettings {
  enabled: boolean;
  volume: number; // 0-100
  soundScheme: SoundScheme;
  customSounds: CustomSound[];
  respectSystemVolume: boolean;
}

export enum SoundScheme {
  SYSTEM = 'SYSTEM',
  MINIMAL = 'MINIMAL',
  STANDARD = 'STANDARD',
  RICH = 'RICH',
  CUSTOM = 'CUSTOM'
}

export interface CustomSound {
  category: NotificationCategory;
  soundFile: string;
  volume: number;
  enabled: boolean;
}

export interface VisualSettings {
  showPreviews: boolean;
  showImages: boolean;
  showActions: boolean;
  opacity: number; // 0-100
  blur: boolean;
  badges: boolean;
  colors: ColorSettings;
}

export interface ColorSettings {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
}

export interface AccessibilityPreferences {
  visualAccessibility: VisualAccessibilitySettings;
  audioAccessibility: AudioAccessibilitySettings;
  motorAccessibility: MotorAccessibilitySettings;
  cognitiveAccessibility: CognitiveAccessibilitySettings;
  assistiveTechnology: AssistiveTechnologySettings;
}

export interface VisualAccessibilitySettings {
  highContrast: boolean;
  darkMode: boolean;
  fontSize: FontSize;
  fontFamily: string;
  reducedMotion: boolean;
  focusIndicators: boolean;
  colorBlindSupport: ColorBlindSupport;
  screenReader: boolean;
}

export enum FontSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  EXTRA_LARGE = 'EXTRA_LARGE'
}

export enum ColorBlindSupport {
  NONE = 'NONE',
  DEUTERANOPIA = 'DEUTERANOPIA',
  PROTANOPIA = 'PROTANOPIA',
  TRITANOPIA = 'TRITANOPIA',
  MONOCHROME = 'MONOCHROME'
}

export interface AudioAccessibilitySettings {
  audioDescriptions: boolean;
  captions: boolean;
  transcripts: boolean;
  audioControls: boolean;
  volumeBoost: boolean;
  noiseReduction: boolean;
  audioFormats: AudioFormat[];
}

export enum AudioFormat {
  MP3 = 'MP3',
  WAV = 'WAV',
  OGG = 'OGG',
  AAC = 'AAC'
}

export interface MotorAccessibilitySettings {
  keyboardNavigation: boolean;
  stickyKeys: boolean;
  slowKeys: boolean;
  bounceKeys: boolean;
  mouseKeys: boolean;
  clickAssist: boolean;
  gestureAlternatives: boolean;
  voiceControl: boolean;
}

export interface CognitiveAccessibilitySettings {
  simplifiedInterface: boolean;
  reducedComplexity: boolean;
  clearLanguage: boolean;
  consistentNavigation: boolean;
  timeout: TimeoutSettings;
  reminderSettings: CognitiveReminderSettings;
}

export interface TimeoutSettings {
  enabled: boolean;
  warningTime: number; // seconds
  extendTime: number; // seconds
  maxExtensions: number;
  sessionTimeout: number; // minutes
}

export interface CognitiveReminderSettings {
  enabled: boolean;
  taskReminders: boolean;
  navigationHelp: boolean;
  progressIndicators: boolean;
  confirmationDialogs: boolean;
}

export interface AssistiveTechnologySettings {
  screenReader: ScreenReaderSettings;
  voiceControl: VoiceControlSettings;
  eyeTracking: EyeTrackingSettings;
  switchControl: SwitchControlSettings;
}

export interface ScreenReaderSettings {
  enabled: boolean;
  software: string;
  speechRate: number;
  speechVolume: number;
  punctuationLevel: PunctuationLevel;
  verbosity: VerbosityLevel;
}

export enum PunctuationLevel {
  NONE = 'NONE',
  SOME = 'SOME',
  MOST = 'MOST',
  ALL = 'ALL'
}

export enum VerbosityLevel {
  BRIEF = 'BRIEF',
  STANDARD = 'STANDARD',
  VERBOSE = 'VERBOSE'
}

export interface VoiceControlSettings {
  enabled: boolean;
  sensitivity: number;
  language: string;
  commandSet: string;
  noiseFiltering: boolean;
}

export interface EyeTrackingSettings {
  enabled: boolean;
  calibrated: boolean;
  dwellTime: number; // milliseconds
  gazeSensitivity: number;
  smoothing: boolean;
}

export interface SwitchControlSettings {
  enabled: boolean;
  switches: SwitchConfiguration[];
  scanningSpeed: number;
  autoScan: boolean;
  scanningMethod: ScanningMethod;
}

export interface SwitchConfiguration {
  switchId: string;
  switchType: string;
  action: string;
  enabled: boolean;
}

export enum ScanningMethod {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
  INVERSE = 'INVERSE'
}

export interface IntegrationPreferences {
  apiAccess: APIAccessSettings;
  webhooks: WebhookSettings;
  thirdPartyIntegrations: ThirdPartyIntegrationSettings;
  dataSync: DataSyncSettings;
  exportSettings: ExportSettings;
  importSettings: ImportSettings;
}

export interface APIAccessSettings {
  enabled: boolean;
  apiKeys: APIKey[];
  rateLimits: APIRateLimit[];
  allowedOperations: APIOperation[];
  ipWhitelist: string[];
  requireSSL: boolean;
  logAccess: boolean;
}

export interface APIKey {
  keyId: string;
  keyName: string;
  keyValue: string;
  permissions: APIPermission[];
  rateLimits: APIRateLimit[];
  expiresAt?: Date;
  enabled: boolean;
  createdAt: Date;
  lastUsed?: Date;
}

export interface APIPermission {
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
}

export interface APIRateLimit {
  operation: string;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
}

export enum APIOperation {
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT'
}

export interface WebhookSettings {
  enabled: boolean;
  webhooks: Webhook[];
  retrySettings: WebhookRetrySettings;
  security: WebhookSecuritySettings;
  logging: WebhookLoggingSettings;
}

export interface Webhook {
  webhookId: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  headers: Record<string, string>;
  secret: string;
  enabled: boolean;
  retries: number;
  timeout: number; // seconds
  lastTriggered?: Date;
  status: WebhookStatus;
}

export enum WebhookEvent {
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  PREFERENCE_UPDATED = 'PREFERENCE_UPDATED',
  CONSENT_GRANTED = 'CONSENT_GRANTED',
  CONSENT_WITHDRAWN = 'CONSENT_WITHDRAWN',
  DATA_EXPORTED = 'DATA_EXPORTED',
  DATA_DELETED = 'DATA_DELETED'
}

export enum WebhookStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  FAILED = 'FAILED',
  DISABLED = 'DISABLED'
}

export interface WebhookRetrySettings {
  maxRetries: number;
  retryInterval: number; // seconds
  backoffMultiplier: number;
  maxBackoffTime: number; // seconds
}

export interface WebhookSecuritySettings {
  validateSignature: boolean;
  requireHTTPS: boolean;
  allowedDomains: string[];
  ipWhitelist: string[];
  timeoutSeconds: number;
}

export interface WebhookLoggingSettings {
  logRequests: boolean;
  logResponses: boolean;
  logHeaders: boolean;
  logErrors: boolean;
  retentionDays: number;
}

export interface ThirdPartyIntegrationSettings {
  integrations: ThirdPartyIntegration[];
  oauthSettings: OAuthIntegrationSettings;
  apiSettings: APIIntegrationSettings;
  dataSharing: IntegrationDataSharingSettings;
}

export interface ThirdPartyIntegration {
  integrationId: string;
  providerId: string;
  providerName: string;
  type: IntegrationType;
  enabled: boolean;
  configuration: Record<string, any>;
  permissions: IntegrationPermission[];
  connectedAt: Date;
  lastSync?: Date;
  status: IntegrationStatus;
}

export enum IntegrationType {
  OAUTH = 'OAUTH',
  API = 'API',
  WEBHOOK = 'WEBHOOK',
  SAML = 'SAML',
  OPENID = 'OPENID'
}

export interface IntegrationPermission {
  scope: string;
  granted: boolean;
  grantedAt: Date;
  expiresAt?: Date;
}

export enum IntegrationStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  PENDING = 'PENDING',
  ERROR = 'ERROR',
  EXPIRED = 'EXPIRED'
}

export interface OAuthIntegrationSettings {
  allowOAuth: boolean;
  authorizedProviders: string[];
  scopeRestrictions: ScopeRestriction[];
  tokenSettings: OAuthTokenSettings;
  refreshSettings: OAuthRefreshSettings;
}

export interface ScopeRestriction {
  providerId: string;
  allowedScopes: string[];
  deniedScopes: string[];
  requireExplicitConsent: boolean;
}

export interface OAuthTokenSettings {
  storeTokens: boolean;
  encryptTokens: boolean;
  tokenExpiry: number; // hours
  rotateRefreshTokens: boolean;
}

export interface OAuthRefreshSettings {
  autoRefresh: boolean;
  refreshBefore: number; // minutes before expiry
  notifyOnRefresh: boolean;
  failureRetries: number;
}

export interface APIIntegrationSettings {
  allowAPIIntegrations: boolean;
  authorizedAPIs: string[];
  rateLimitSettings: IntegrationRateLimitSettings;
  securitySettings: IntegrationSecuritySettings;
}

export interface IntegrationRateLimitSettings {
  enableLimits: boolean;
  defaultLimits: APIRateLimit;
  customLimits: Record<string, APIRateLimit>;
  shareUserLimits: boolean;
}

export interface IntegrationSecuritySettings {
  requireSSL: boolean;
  validateCertificates: boolean;
  allowSelfSigned: boolean;
  trustedCAs: string[];
  ipWhitelist: string[];
}

export interface IntegrationDataSharingSettings {
  allowDataSharing: boolean;
  sharedDataTypes: string[];
  restrictedDataTypes: string[];
  requireConsent: boolean;
  auditSharing: boolean;
  retentionLimits: Record<string, number>;
}

export interface DataSyncSettings {
  enableSync: boolean;
  syncFrequency: SyncFrequency;
  syncScope: SyncScope[];
  conflictResolution: ConflictResolutionStrategy;
  syncSecurity: SyncSecuritySettings;
}

export enum SyncFrequency {
  REAL_TIME = 'REAL_TIME',
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MANUAL = 'MANUAL'
}

export interface SyncScope {
  dataType: string;
  direction: SyncDirection;
  enabled: boolean;
  lastSync?: Date;
  nextSync?: Date;
}

export enum SyncDirection {
  BIDIRECTIONAL = 'BIDIRECTIONAL',
  IMPORT_ONLY = 'IMPORT_ONLY',
  EXPORT_ONLY = 'EXPORT_ONLY'
}

export enum ConflictResolutionStrategy {
  LOCAL_WINS = 'LOCAL_WINS',
  REMOTE_WINS = 'REMOTE_WINS',
  NEWEST_WINS = 'NEWEST_WINS',
  MANUAL_REVIEW = 'MANUAL_REVIEW'
}

export interface SyncSecuritySettings {
  encryptInTransit: boolean;
  encryptAtRest: boolean;
  validateIntegrity: boolean;
  auditSync: boolean;
  requireApproval: boolean;
}

export interface ExportSettings {
  allowExports: boolean;
  exportFormats: DataExportFormat[];
  exportSchedule: ExportSchedule;
  exportSecurity: ExportSecuritySettings;
  exportRetention: ExportRetentionSettings;
}

export interface ExportSchedule {
  enabled: boolean;
  frequency: ExportFrequency;
  time: string;
  timezone: string;
  includeMetadata: boolean;
  notifyOnCompletion: boolean;
}

export enum ExportFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY'
}

export interface ExportSecuritySettings {
  encryptExports: boolean;
  passwordProtect: boolean;
  requireApproval: boolean;
  auditExports: boolean;
  watermarkFiles: boolean;
}

export interface ExportRetentionSettings {
  retainExports: boolean;
  retentionPeriod: number; // days
  autoCleanup: boolean;
  archiveBeforeDelete: boolean;
  notifyBeforeDelete: boolean;
}

export interface ImportSettings {
  allowImports: boolean;
  supportedFormats: DataExportFormat[];
  importValidation: ImportValidationSettings;
  importSecurity: ImportSecuritySettings;
  conflictResolution: ImportConflictResolution;
}

export interface ImportValidationSettings {
  validateSchema: boolean;
  validateData: boolean;
  requirePreview: boolean;
  allowPartialImports: boolean;
  maximumSize: number; // MB
}

export interface ImportSecuritySettings {
  scanForMalware: boolean;
  validateSources: boolean;
  requireApproval: boolean;
  auditImports: boolean;
  quarantineSuspicious: boolean;
}

export interface ImportConflictResolution {
  strategy: ConflictResolutionStrategy;
  allowOverwrite: boolean;
  createDuplicates: boolean;
  requireManualReview: boolean;
  preserveHistory: boolean;
}

export interface CustomPreference {
  preferenceId: string;
  category: string;
  name: string;
  description: string;
  type: PreferenceType;
  value: any;
  defaultValue: any;
  options?: PreferenceOption[];
  validation?: PreferenceValidation;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum PreferenceType {
  BOOLEAN = 'BOOLEAN',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  SELECT = 'SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
  DATE = 'DATE',
  TIME = 'TIME',
  COLOR = 'COLOR',
  URL = 'URL',
  EMAIL = 'EMAIL',
  JSON = 'JSON'
}

export interface PreferenceOption {
  value: any;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface PreferenceValidation {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  customValidator?: string;
}

export interface PreferenceCenterMetadata {
  version: string;
  createdAt: Date;
  lastModified: Date;
  modifiedBy: string;
  source: PreferenceSource;
  migrationHistory: PreferenceMigration[];
  syncStatus: SyncStatus;
  validationStatus: ValidationStatus;
  auditTrail: PreferenceAuditEvent[];
}

export enum PreferenceSource {
  USER_INPUT = 'USER_INPUT',
  SYSTEM_DEFAULT = 'SYSTEM_DEFAULT',
  IMPORT = 'IMPORT',
  MIGRATION = 'MIGRATION',
  API = 'API',
  ADMIN = 'ADMIN'
}

export interface PreferenceMigration {
  migrationId: string;
  fromVersion: string;
  toVersion: string;
  migratedAt: Date;
  changes: PreferenceChange[];
  success: boolean;
  errors?: string[];
}

export interface PreferenceChange {
  field: string;
  oldValue: any;
  newValue: any;
  reason: string;
  timestamp: Date;
}

export enum SyncStatus {
  SYNCED = 'SYNCED',
  PENDING = 'PENDING',
  CONFLICT = 'CONFLICT',
  ERROR = 'ERROR',
  NOT_SYNCED = 'NOT_SYNCED'
}

export enum ValidationStatus {
  VALID = 'VALID',
  INVALID = 'INVALID',
  WARNING = 'WARNING',
  PENDING = 'PENDING'
}

export interface PreferenceAuditEvent {
  eventId: string;
  eventType: PreferenceEventType;
  userId: string;
  timestamp: Date;
  changes: PreferenceChange[];
  context: AuditContext;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
}

export enum PreferenceEventType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
  IMPORTED = 'IMPORTED',
  EXPORTED = 'EXPORTED',
  MIGRATED = 'MIGRATED',
  SYNCED = 'SYNCED',
  RESET = 'RESET'
}

export interface AuditContext {
  source: string;
  reason: string;
  metadata: Record<string, any>;
}

// Service Implementation
export class PreferenceCenterService extends EventEmitter {
  private db: DatabaseService;
  private auditService: AuditService;
  private policyService: PolicyAcceptanceTrackingService;

  constructor(
    db: DatabaseService,
    auditService: AuditService,
    policyService: PolicyAcceptanceTrackingService
  ) {
    super();
    this.db = db;
    this.auditService = auditService;
    this.policyService = policyService;
  }

  async initializePreferenceCenter(
    userId: string,
    userEmail: string,
    context: OperationContext
  ): Promise<UserPreferenceCenter> {
    const preferenceCenterId = `pc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const defaultPreferences: UserPreferenceCenter = {
      preferenceCenterId,
      userId,
      userEmail,
      profileSettings: this.getDefaultProfilePreferences(),
      privacySettings: this.getDefaultPrivacyPreferences(),
      communicationSettings: this.getDefaultCommunicationPreferences(),
      dataSettings: this.getDefaultDataPreferences(),
      securitySettings: this.getDefaultSecurityPreferences(),
      consentSettings: this.getDefaultConsentPreferences(),
      notificationSettings: this.getDefaultNotificationPreferences(),
      accessibilitySettings: this.getDefaultAccessibilityPreferences(),
      integrationSettings: this.getDefaultIntegrationPreferences(),
      customPreferences: [],
      preferencesVersion: '1.0.0',
      lastUpdated: new Date(),
      metadata: {
        version: '1.0.0',
        createdAt: new Date(),
        lastModified: new Date(),
        modifiedBy: userId,
        source: PreferenceSource.SYSTEM_DEFAULT,
        migrationHistory: [],
        syncStatus: SyncStatus.SYNCED,
        validationStatus: ValidationStatus.VALID,
        auditTrail: []
      }
    };

    const query = `
      INSERT INTO user_preference_centers (
        preference_center_id, user_id, user_email, preferences_data, 
        preferences_version, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    await this.db.query(query, [
      preferenceCenterId,
      userId,
      userEmail,
      JSON.stringify(defaultPreferences),
      defaultPreferences.preferencesVersion,
      new Date(),
      new Date()
    ]);

    // Log audit event
    await this.logAuditEvent({
      eventType: PreferenceEventType.CREATED,
      userId,
      timestamp: new Date(),
      changes: [{
        field: 'preference_center',
        oldValue: null,
        newValue: 'initialized',
        reason: 'Initial preference center creation',
        timestamp: new Date()
      }],
      context: {
        source: 'PreferenceCenterService',
        reason: 'User preference center initialization',
        metadata: context
      },
      ipAddress: context.ipAddress || 'unknown',
      userAgent: context.userAgent || 'unknown',
      sessionId: context.sessionId || 'unknown'
    });

    this.emit('preferenceCenterInitialized', { userId, preferenceCenterId });

    return defaultPreferences;
  }

  async getPreferenceCenter(userId: string): Promise<UserPreferenceCenter | null> {
    const query = `
      SELECT preferences_data
      FROM user_preference_centers
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await this.db.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].preferences_data as UserPreferenceCenter;
  }

  async updatePreferences(
    userId: string,
    updates: Partial<UserPreferenceCenter>,
    context: OperationContext
  ): Promise<UserPreferenceCenter> {
    const current = await this.getPreferenceCenter(userId);
    if (!current) {
      throw new Error('Preference center not found for user');
    }

    const changes = this.calculateChanges(current, updates);
    const updated = { ...current, ...updates, lastUpdated: new Date() };

    // Update metadata
    updated.metadata = {
      ...updated.metadata,
      lastModified: new Date(),
      modifiedBy: userId,
      source: PreferenceSource.USER_INPUT
    };

    // Validate preferences
    const validation = await this.validatePreferences(updated);
    if (!validation.isValid) {
      throw new Error(`Preference validation failed: ${validation.errors.join(', ')}`);
    }

    const query = `
      UPDATE user_preference_centers
      SET preferences_data = $1, updated_at = $2
      WHERE user_id = $3
      RETURNING preferences_data
    `;

    const result = await this.db.query(query, [
      JSON.stringify(updated),
      new Date(),
      userId
    ]);

    // Log audit event
    await this.logAuditEvent({
      eventType: PreferenceEventType.UPDATED,
      userId,
      timestamp: new Date(),
      changes,
      context: {
        source: 'PreferenceCenterService',
        reason: 'User preference update',
        metadata: context
      },
      ipAddress: context.ipAddress || 'unknown',
      userAgent: context.userAgent || 'unknown',
      sessionId: context.sessionId || 'unknown'
    });

    this.emit('preferencesUpdated', { userId, changes });

    return result.rows[0].preferences_data as UserPreferenceCenter;
  }

  async updateCommunicationPreferences(
    userId: string,
    communicationSettings: Partial<CommunicationPreferences>,
    context: OperationContext
  ): Promise<CommunicationPreferences> {
    const current = await this.getPreferenceCenter(userId);
    if (!current) {
      throw new Error('Preference center not found for user');
    }

    const updated = {
      ...current.communicationSettings,
      ...communicationSettings
    };

    await this.updatePreferences(userId, { communicationSettings: updated }, context);

    this.emit('communicationPreferencesUpdated', { userId, settings: updated });

    return updated;
  }

  async updatePrivacyPreferences(
    userId: string,
    privacySettings: Partial<PrivacyPreferences>,
    context: OperationContext
  ): Promise<PrivacyPreferences> {
    const current = await this.getPreferenceCenter(userId);
    if (!current) {
      throw new Error('Preference center not found for user');
    }

    const updated = {
      ...current.privacySettings,
      ...privacySettings
    };

    await this.updatePreferences(userId, { privacySettings: updated }, context);

    this.emit('privacyPreferencesUpdated', { userId, settings: updated });

    return updated;
  }

  async updateSecurityPreferences(
    userId: string,
    securitySettings: Partial<SecurityPreferences>,
    context: OperationContext
  ): Promise<SecurityPreferences> {
    const current = await this.getPreferenceCenter(userId);
    if (!current) {
      throw new Error('Preference center not found for user');
    }

    const updated = {
      ...current.securitySettings,
      ...securitySettings
    };

    await this.updatePreferences(userId, { securitySettings: updated }, context);

    this.emit('securityPreferencesUpdated', { userId, settings: updated });

    return updated;
  }

  async updateConsentPreferences(
    userId: string,
    consentSettings: Partial<ConsentPreferences>,
    context: OperationContext
  ): Promise<ConsentPreferences> {
    const current = await this.getPreferenceCenter(userId);
    if (!current) {
      throw new Error('Preference center not found for user');
    }

    const updated = {
      ...current.consentSettings,
      ...consentSettings
    };

    await this.updatePreferences(userId, { consentSettings: updated }, context);

    // Update related policy acceptances if consent method changes
    if (consentSettings.consentMethod) {
      await this.syncConsentWithPolicies(userId, updated, context);
    }

    this.emit('consentPreferencesUpdated', { userId, settings: updated });

    return updated;
  }

  async addCustomPreference(
    userId: string,
    preference: Omit<CustomPreference, 'preferenceId' | 'createdAt' | 'updatedAt'>,
    context: OperationContext
  ): Promise<CustomPreference> {
    const current = await this.getPreferenceCenter(userId);
    if (!current) {
      throw new Error('Preference center not found for user');
    }

    const customPreference: CustomPreference = {
      ...preference,
      preferenceId: `pref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedCustomPreferences = [...current.customPreferences, customPreference];

    await this.updatePreferences(userId, { customPreferences: updatedCustomPreferences }, context);

    this.emit('customPreferenceAdded', { userId, preference: customPreference });

    return customPreference;
  }

  async exportPreferences(userId: string, format: DataExportFormat): Promise<ExportResult> {
    const preferences = await this.getPreferenceCenter(userId);
    if (!preferences) {
      throw new Error('Preference center not found for user');
    }

    const exportData = this.prepareExportData(preferences);
    const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let formattedData: string;
    let mimeType: string;

    switch (format) {
    case DataExportFormat.JSON:
      formattedData = JSON.stringify(exportData, null, 2);
      mimeType = 'application/json';
      break;
    case DataExportFormat.CSV:
      formattedData = this.convertToCSV(exportData);
      mimeType = 'text/csv';
      break;
    case DataExportFormat.XML:
      formattedData = this.convertToXML(exportData);
      mimeType = 'application/xml';
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
    }

    // Store export record
    const exportQuery = `
      INSERT INTO preference_exports (
        export_id, user_id, format, data_size, created_at, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days retention

    await this.db.query(exportQuery, [
      exportId,
      userId,
      format,
      Buffer.byteLength(formattedData, 'utf8'),
      new Date(),
      expiresAt
    ]);

    this.emit('preferencesExported', { userId, exportId, format });

    return {
      exportId,
      data: formattedData,
      mimeType,
      filename: `preferences_${userId}_${Date.now()}.${format.toLowerCase()}`,
      size: Buffer.byteLength(formattedData, 'utf8'),
      createdAt: new Date(),
      expiresAt
    };
  }

  async generatePreferenceSummary(userId: string): Promise<PreferenceSummary> {
    const preferences = await this.getPreferenceCenter(userId);
    if (!preferences) {
      throw new Error('Preference center not found for user');
    }

    return {
      userId,
      summaryId: `summary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      profileComplete: this.calculateProfileCompleteness(preferences.profileSettings),
      privacyLevel: this.calculatePrivacyLevel(preferences.privacySettings),
      communicationChannels: this.getActiveCommunicationChannels(preferences.communicationSettings),
      consentStatus: this.getConsentStatus(preferences.consentSettings),
      securityLevel: this.calculateSecurityLevel(preferences.securitySettings),
      accessibilityEnabled: this.isAccessibilityEnabled(preferences.accessibilitySettings),
      customPreferencesCount: preferences.customPreferences.length,
      lastUpdated: preferences.lastUpdated,
      recommendations: await this.generateRecommendations(preferences),
      completionScore: this.calculateCompletionScore(preferences)
    };
  }

  private getDefaultProfilePreferences(): ProfilePreferences {
    return {
      displayName: '',
      firstName: '',
      lastName: '',
      bio: '',
      timezone: 'UTC',
      locale: 'en-US',
      language: 'en',
      theme: 'auto',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      visibility: {
        profilePublic: false,
        showEmail: false,
        showName: true,
        showActivity: false,
        showBadges: true,
        searchable: true,
        allowDirectMessages: true
      }
    };
  }

  private getDefaultPrivacyPreferences(): PrivacyPreferences {
    return {
      dataMinimization: true,
      anonymousAnalytics: false,
      personalizedContent: true,
      behaviorTracking: false,
      locationTracking: false,
      crossSiteTracking: false,
      adPersonalization: false,
      thirdPartySharing: {
        enabled: false,
        allowedCategories: [],
        blockedCategories: Object.values(ThirdPartyCategory),
        requireExplicitConsent: true,
        allowDataEnrichment: false,
        allowMarketing: false,
        allowAnalytics: false
      },
      rightToErasure: {
        enableAutomaticDeletion: false,
        automaticDeletionPeriod: 365,
        retainForLegal: true,
        retainForSecurity: true,
        allowPartialDeletion: true,
        deleteRequestMethod: 'MANUAL_REVIEW',
        notifyBeforeDeletion: true,
        notificationPeriod: 7
      },
      dataPortability: {
        allowDataExport: true,
        exportFormats: [DataExportFormat.JSON, DataExportFormat.CSV],
        includeMetadata: false,
        includeAnalytics: false,
        includeLogs: false,
        automaticBackups: false,
        backupFrequency: BackupFrequency.MONTHLY,
        encryptExports: true
      },
      consentWithdrawal: {
        allowGranularWithdrawal: true,
        requireReason: false,
        confirmationRequired: true,
        cooldownPeriod: 0,
        notifyDataControllers: true,
        retainWithdrawalRecord: true,
        automaticCleanup: false
      }
    };
  }

  private getDefaultCommunicationPreferences(): CommunicationPreferences {
    return {
      email: {
        enabled: true,
        categories: [
          { category: EmailCategoryType.SECURITY, enabled: true, frequency: EmailFrequency.IMMEDIATE, priority: CommunicationPriority.CRITICAL },
          { category: EmailCategoryType.SYSTEM, enabled: true, frequency: EmailFrequency.DAILY, priority: CommunicationPriority.HIGH },
          { category: EmailCategoryType.UPDATES, enabled: false, frequency: EmailFrequency.WEEKLY, priority: CommunicationPriority.MEDIUM }
        ],
        frequency: EmailFrequency.DAILY,
        format: 'HTML',
        unsubscribeMethod: UnsubscribeMethod.ONE_CLICK,
        suppressDuplicates: true,
        personalizedContent: false,
        trackingPixels: false,
        allowThirdParty: false
      },
      sms: {
        enabled: false,
        phoneNumber: '',
        categories: [],
        allowMarketing: false,
        allowReminders: true,
        allowSecurity: true,
        optOutMethod: SMSOptOutMethod.REPLY_STOP
      },
      push: {
        enabled: false,
        devices: [],
        categories: [],
        allowBadges: true,
        allowSounds: true,
        allowVibration: true,
        quietHours: {
          enabled: true,
          startTime: '22:00',
          endTime: '08:00',
          timezone: 'UTC',
          daysOfWeek: Object.values(DayOfWeek),
          allowCritical: true,
          allowSecurity: true,
          exceptions: []
        },
        geofencing: false
      },
      inApp: {
        enabled: true,
        categories: [],
        showPreviews: true,
        playSound: false,
        showBadges: true,
        autoMarkRead: false,
        retentionPeriod: 30
      },
      postal: {
        enabled: false,
        address: {
          name: '',
          addressLine1: '',
          city: '',
          state: '',
          postalCode: '',
          country: '',
          verified: false
        },
        categories: [],
        allowMarketing: false,
        allowCatalogs: false,
        allowSurveys: false
      },
      frequency: {
        global: {
          maxDaily: 5,
          maxWeekly: 20,
          maxMonthly: 50,
          priorityOverride: true
        },
        byChannel: [],
        byCategory: [],
        respectQuietHours: true,
        batchSimilar: true,
        intelligentTiming: true
      },
      quietHours: {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00',
        timezone: 'UTC',
        daysOfWeek: Object.values(DayOfWeek),
        allowCritical: true,
        allowSecurity: true,
        exceptions: []
      },
      channels: []
    };
  }

  private getDefaultDataPreferences(): DataPreferences {
    return {
      collection: {
        allowAutomaticCollection: false,
        minimizeCollection: true,
        requiredDataOnly: true,
        explicitConsentRequired: true,
        allowInference: false,
        allowEnrichment: false,
        collectMetadata: false,
        collectBehavioral: false,
        collectGeolocation: false,
        collectDevice: true
      },
      processing: {
        allowAutomatedDecisions: false,
        allowProfiling: false,
        allowMachineLearning: false,
        allowPersonalization: false,
        allowAggregation: true,
        allowAnonymization: true,
        allowPseudonymization: true,
        requireHumanReview: true,
        processOnlyNecessary: true
      },
      retention: {
        useDefaultRetention: true,
        customRetentionPeriods: [],
        autoDeleteExpired: true,
        notifyBeforeExpiry: true,
        notificationPeriod: 30,
        allowExtension: false,
        extensionReason: [],
        archiveBeforeDelete: true
      },
      sharing: {
        allowSharing: false,
        allowInternalSharing: true,
        allowThirdPartySharing: false,
        requireExplicitConsent: true,
        allowedPartners: [],
        blockedPartners: [],
        allowedPurposes: [SharingPurpose.SERVICE_DELIVERY, SharingPurpose.SECURITY],
        geographicRestrictions: []
      },
      analytics: {
        allowAnalytics: false,
        allowPersonalizedAnalytics: false,
        allowCrossSiteAnalytics: false,
        allowThirdPartyAnalytics: false,
        allowHeatmaps: false,
        allowSessionRecording: false,
        allowABTesting: false,
        allowCohortAnalysis: false,
        allowPredictiveAnalytics: false,
        retentionPeriod: 90
      },
      cookies: {
        allowEssentialCookies: true,
        allowFunctionalCookies: false,
        allowAnalyticsCookies: false,
        allowMarketingCookies: false,
        allowThirdPartyCookies: false,
        allowCrossSiteCookies: false,
        cookieRetention: {
          essentialRetention: 365,
          functionalRetention: 30,
          analyticsRetention: 90,
          marketingRetention: 365,
          autoCleanup: true
        },
        sameSitePolicy: SameSitePolicy.STRICT,
        secureOnly: true
      },
      tracking: {
        allowTracking: false,
        allowCrossSiteTracking: false,
        allowFingerprintingProtection: true,
        allowReferrerTracking: false,
        allowPixelTracking: false,
        allowEmailTracking: false,
        allowLocationTracking: false,
        allowDeviceTracking: false,
        doNotTrack: true,
        globalPrivacyControl: true
      }
    };
  }

  private getDefaultSecurityPreferences(): SecurityPreferences {
    return {
      twoFactorAuth: {
        enabled: false,
        methods: [],
        backupCodes: false,
        requireForSensitive: true,
        rememberDevice: false,
        rememberDuration: 30
      },
      passwordSettings: {
        requireStrong: true,
        minLength: 12,
        requireSpecialChars: true,
        requireNumbers: true,
        requireUppercase: true,
        requireLowercase: true,
        preventReuse: true,
        reuseHistory: 5,
        expiration: false,
        expirationDays: 90,
        warningDays: 7
      },
      sessionManagement: {
        maxConcurrentSessions: 3,
        sessionTimeout: 30,
        extendOnActivity: true,
        requireReauth: false,
        reauthTimeout: 60,
        terminateOnLogout: true,
        secureTransmission: true
      },
      deviceManagement: {
        allowedDevices: [],
        requireDeviceAuth: false,
        deviceFingerprinting: true,
        suspiciousDeviceAlert: true,
        autoLockUnknownDevices: false,
        deviceLimit: 5
      },
      loginNotifications: {
        enabled: true,
        notifySuccessful: false,
        notifyFailed: true,
        notifyUnusualLocation: true,
        notifyNewDevice: true,
        notifyPasswordChange: true,
        deliveryMethods: [CommunicationChannelType.EMAIL]
      },
      securityAlerts: {
        enabled: true,
        alertTypes: Object.values(SecurityAlertType),
        severity: SecurityAlertSeverity.MEDIUM,
        deliveryMethods: [CommunicationChannelType.EMAIL],
        autoResponse: false,
        escalation: true
      },
      privacyEnhancements: {
        anonymizeIpAddress: true,
        maskSensitiveData: true,
        encryptStoredData: true,
        useProxy: false,
        vpnRequired: false,
        minimizeDataExposure: true,
        pseudonymization: true,
        differentialPrivacy: false
      }
    };
  }

  private getDefaultConsentPreferences(): ConsentPreferences {
    return {
      consentMethod: ConsentMethod.EXPLICIT,
      granularConsent: true,
      implicitConsent: false,
      requireExplicit: true,
      consentHistory: {
        trackHistory: true,
        retainHistory: true,
        historyRetentionPeriod: 7,
        allowAudit: true,
        exportHistory: true,
        includeWithdrawals: true
      },
      withdrawalSettings: {
        allowGranularWithdrawal: true,
        requireReason: false,
        confirmationRequired: true,
        cooldownPeriod: 0,
        notifyDataControllers: true,
        retainWithdrawalRecord: true,
        automaticCleanup: false
      },
      renewalSettings: {
        requireRenewal: true,
        renewalPeriod: 12,
        reminderNotifications: true,
        reminderSchedule: [
          { daysBefore: 30, channels: [CommunicationChannelType.EMAIL], message: 'Consent renewal reminder', critical: false },
          { daysBefore: 7, channels: [CommunicationChannelType.EMAIL], message: 'Consent expiring soon', critical: true }
        ],
        autoExpiry: false,
        gracePeriod: 30
      },
      crossBorderConsent: {
        allowCrossBorderTransfer: false,
        requireSpecificConsent: true,
        adequacyDecisionRequired: true,
        safeguardsRequired: true,
        allowedDestinations: [],
        blockedDestinations: []
      }
    };
  }

  private getDefaultNotificationPreferences(): NotificationPreferences {
    return {
      globalSettings: {
        enabled: true,
        respectQuietHours: true,
        batchSimilar: true,
        intelligentTiming: true,
        frequencyLimits: [],
        priorityOverride: true
      },
      categorySettings: [],
      channelSettings: [],
      timingSettings: {
        quietHours: {
          enabled: true,
          startTime: '22:00',
          endTime: '08:00',
          timezone: 'UTC',
          daysOfWeek: Object.values(DayOfWeek),
          allowCritical: true,
          allowSecurity: true,
          exceptions: []
        },
        timeZone: 'UTC',
        workingHours: {
          enabled: false,
          startTime: '09:00',
          endTime: '17:00',
          daysOfWeek: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY],
          allowCritical: true,
          allowUrgent: true
        },
        weekendSettings: {
          treatAsQuietTime: false,
          allowCritical: true,
          allowPersonal: true,
          customSchedule: false
        },
        holidaySettings: {
          respectHolidays: false,
          holidayCalendar: 'US',
          allowCritical: true,
          allowPersonal: true,
          customHolidays: []
        }
      },
      deliverySettings: {
        consolidation: {
          enabled: true,
          timeWindow: 15,
          maxConsolidated: 5,
          groupByCategory: true,
          groupBySender: false,
          groupByPriority: true
        },
        batching: {
          enabled: false,
          batchSize: 10,
          batchInterval: 30,
          respectPriority: true,
          respectTiming: true
        },
        throttling: {
          enabled: true,
          maxPerMinute: 5,
          maxPerHour: 20,
          maxPerDay: 50,
          burstAllowance: 3,
          priorityExempt: [CommunicationPriority.CRITICAL]
        },
        failover: {
          enabled: true,
          failoverDelay: 5,
          maxFailovers: 3,
          fallbackChannels: [CommunicationChannelType.EMAIL],
          criticalOnly: true
        }
      },
      appearanceSettings: {
        theme: 'auto',
        position: NotificationPosition.TOP_RIGHT,
        duration: 5,
        animation: NotificationAnimation.SLIDE,
        sounds: {
          enabled: true,
          volume: 50,
          soundScheme: SoundScheme.STANDARD,
          customSounds: [],
          respectSystemVolume: true
        },
        visual: {
          showPreviews: true,
          showImages: true,
          showActions: true,
          opacity: 90,
          blur: false,
          badges: true,
          colors: {
            primary: '#007bff',
            secondary: '#6c757d',
            accent: '#28a745',
            background: '#ffffff',
            text: '#212529',
            border: '#dee2e6'
          }
        }
      }
    };
  }

  private getDefaultAccessibilityPreferences(): AccessibilityPreferences {
    return {
      visualAccessibility: {
        highContrast: false,
        darkMode: false,
        fontSize: FontSize.MEDIUM,
        fontFamily: 'system-ui',
        reducedMotion: false,
        focusIndicators: true,
        colorBlindSupport: ColorBlindSupport.NONE,
        screenReader: false
      },
      audioAccessibility: {
        audioDescriptions: false,
        captions: false,
        transcripts: false,
        audioControls: true,
        volumeBoost: false,
        noiseReduction: false,
        audioFormats: [AudioFormat.MP3]
      },
      motorAccessibility: {
        keyboardNavigation: true,
        stickyKeys: false,
        slowKeys: false,
        bounceKeys: false,
        mouseKeys: false,
        clickAssist: false,
        gestureAlternatives: false,
        voiceControl: false
      },
      cognitiveAccessibility: {
        simplifiedInterface: false,
        reducedComplexity: false,
        clearLanguage: true,
        consistentNavigation: true,
        timeout: {
          enabled: false,
          warningTime: 30,
          extendTime: 60,
          maxExtensions: 3,
          sessionTimeout: 30
        },
        reminderSettings: {
          enabled: false,
          taskReminders: false,
          navigationHelp: false,
          progressIndicators: true,
          confirmationDialogs: true
        }
      },
      assistiveTechnology: {
        screenReader: {
          enabled: false,
          software: '',
          speechRate: 200,
          speechVolume: 80,
          punctuationLevel: PunctuationLevel.SOME,
          verbosity: VerbosityLevel.STANDARD
        },
        voiceControl: {
          enabled: false,
          sensitivity: 50,
          language: 'en-US',
          commandSet: 'standard',
          noiseFiltering: true
        },
        eyeTracking: {
          enabled: false,
          calibrated: false,
          dwellTime: 1000,
          gazeSensitivity: 50,
          smoothing: true
        },
        switchControl: {
          enabled: false,
          switches: [],
          scanningSpeed: 1000,
          autoScan: true,
          scanningMethod: ScanningMethod.AUTO
        }
      }
    };
  }

  private getDefaultIntegrationPreferences(): IntegrationPreferences {
    return {
      apiAccess: {
        enabled: false,
        apiKeys: [],
        rateLimits: [],
        allowedOperations: [],
        ipWhitelist: [],
        requireSSL: true,
        logAccess: true
      },
      webhooks: {
        enabled: false,
        webhooks: [],
        retrySettings: {
          maxRetries: 3,
          retryInterval: 30,
          backoffMultiplier: 2,
          maxBackoffTime: 300
        },
        security: {
          validateSignature: true,
          requireHTTPS: true,
          allowedDomains: [],
          ipWhitelist: [],
          timeoutSeconds: 30
        },
        logging: {
          logRequests: true,
          logResponses: false,
          logHeaders: false,
          logErrors: true,
          retentionDays: 30
        }
      },
      thirdPartyIntegrations: {
        integrations: [],
        oauthSettings: {
          allowOAuth: false,
          authorizedProviders: [],
          scopeRestrictions: [],
          tokenSettings: {
            storeTokens: true,
            encryptTokens: true,
            tokenExpiry: 24,
            rotateRefreshTokens: true
          },
          refreshSettings: {
            autoRefresh: true,
            refreshBefore: 15,
            notifyOnRefresh: false,
            failureRetries: 3
          }
        },
        apiSettings: {
          allowAPIIntegrations: false,
          authorizedAPIs: [],
          rateLimitSettings: {
            enableLimits: true,
            defaultLimits: {
              operation: 'default',
              requestsPerMinute: 60,
              requestsPerHour: 1000,
              requestsPerDay: 10000,
              burstLimit: 10
            },
            customLimits: {},
            shareUserLimits: false
          },
          securitySettings: {
            requireSSL: true,
            validateCertificates: true,
            allowSelfSigned: false,
            trustedCAs: [],
            ipWhitelist: []
          }
        },
        dataSharing: {
          allowDataSharing: false,
          sharedDataTypes: [],
          restrictedDataTypes: ['personal', 'financial', 'health'],
          requireConsent: true,
          auditSharing: true,
          retentionLimits: {}
        }
      },
      dataSync: {
        enableSync: false,
        syncFrequency: SyncFrequency.MANUAL,
        syncScope: [],
        conflictResolution: ConflictResolutionStrategy.MANUAL_REVIEW,
        syncSecurity: {
          encryptInTransit: true,
          encryptAtRest: true,
          validateIntegrity: true,
          auditSync: true,
          requireApproval: true
        }
      },
      exportSettings: {
        allowExports: true,
        exportFormats: [DataExportFormat.JSON],
        exportSchedule: {
          enabled: false,
          frequency: ExportFrequency.MONTHLY,
          time: '02:00',
          timezone: 'UTC',
          includeMetadata: false,
          notifyOnCompletion: true
        },
        exportSecurity: {
          encryptExports: true,
          passwordProtect: false,
          requireApproval: false,
          auditExports: true,
          watermarkFiles: false
        },
        exportRetention: {
          retainExports: true,
          retentionPeriod: 30,
          autoCleanup: true,
          archiveBeforeDelete: true,
          notifyBeforeDelete: true
        }
      },
      importSettings: {
        allowImports: false,
        supportedFormats: [DataExportFormat.JSON],
        importValidation: {
          validateSchema: true,
          validateData: true,
          requirePreview: true,
          allowPartialImports: false,
          maximumSize: 10
        },
        importSecurity: {
          scanForMalware: true,
          validateSources: true,
          requireApproval: true,
          auditImports: true,
          quarantineSuspicious: true
        },
        conflictResolution: {
          strategy: ConflictResolutionStrategy.MANUAL_REVIEW,
          allowOverwrite: false,
          createDuplicates: false,
          requireManualReview: true,
          preserveHistory: true
        }
      }
    };
  }

  private calculateChanges(
    current: UserPreferenceCenter,
    updates: Partial<UserPreferenceCenter>
  ): PreferenceChange[] {
    const changes: PreferenceChange[] = [];
    const timestamp = new Date();

    Object.keys(updates).forEach(key => {
      const oldValue = (current as any)[key];
      const newValue = (updates as any)[key];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field: key,
          oldValue,
          newValue,
          reason: 'User preference update',
          timestamp
        });
      }
    });

    return changes;
  }

  private async validatePreferences(preferences: UserPreferenceCenter): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate email format if provided
    if (preferences.profileSettings.firstName && preferences.profileSettings.firstName.length > 100) {
      errors.push('First name must be less than 100 characters');
    }

    // Validate timezone
    if (preferences.profileSettings.timezone && !this.isValidTimezone(preferences.profileSettings.timezone)) {
      errors.push('Invalid timezone specified');
    }

    // Validate communication settings
    if (preferences.communicationSettings.email.enabled && !preferences.userEmail) {
      warnings.push('Email communication enabled but no email address provided');
    }

    // Validate security settings
    if (preferences.securitySettings.passwordSettings.minLength < 8) {
      warnings.push('Password minimum length is below recommended 8 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private isValidTimezone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  }

  private async syncConsentWithPolicies(
    userId: string,
    consentSettings: ConsentPreferences,
    context: OperationContext
  ): Promise<void> {
    // This would sync consent preferences with existing policy acceptances
    // Implementation would depend on specific policy requirements
  }

  private prepareExportData(preferences: UserPreferenceCenter): any {
    // Remove sensitive data and prepare for export
    const exportData = { ...preferences };
    
    // Remove internal IDs and sensitive metadata
    delete exportData.preferenceCenterId;
    delete exportData.metadata.auditTrail;
    
    // Remove API keys and sensitive security data
    if (exportData.integrationSettings?.apiAccess?.apiKeys) {
      exportData.integrationSettings.apiAccess.apiKeys = exportData.integrationSettings.apiAccess.apiKeys.map(key => ({
        ...key,
        keyValue: '[REDACTED]'
      }));
    }

    return exportData;
  }

  private convertToCSV(data: any): string {
    // Implementation would flatten the nested preference structure to CSV
    // This is a simplified version
    const flattenObject = (obj: any, prefix = ''): any => {
      const flattened: any = {};
      for (const key in obj) {
        if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          Object.assign(flattened, flattenObject(obj[key], `${prefix}${key}.`));
        } else {
          flattened[`${prefix}${key}`] = obj[key];
        }
      }
      return flattened;
    };

    const flattened = flattenObject(data);
    const headers = Object.keys(flattened).join(',');
    const values = Object.values(flattened).map(v => 
      typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
    ).join(',');

    return `${headers}\n${values}`;
  }

  private convertToXML(data: any): string {
    // Implementation would convert the preference structure to XML
    // This is a simplified version
    const xmlEscape = (str: string): string => {
      return str.replace(/[<>&'"]/g, (c) => {
        switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
        }
      });
    };

    const objectToXML = (obj: any, indent = 0): string => {
      const spaces = ' '.repeat(indent);
      let xml = '';

      for (const key in obj) {
        const value = obj[key];
        if (value === null || value === undefined) {
          xml += `${spaces}<${key} />\n`;
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          xml += `${spaces}<${key}>\n${objectToXML(value, indent + 2)}${spaces}</${key}>\n`;
        } else if (Array.isArray(value)) {
          xml += `${spaces}<${key}>\n`;
          value.forEach(item => {
            xml += `${spaces}  <item>${typeof item === 'object' ? '\n' + objectToXML(
              item,
              indent + 4
            ) + spaces + '  ' : xmlEscape(String(item))}</item>\n`;
          });
          xml += `${spaces}</${key}>\n`;
        } else {
          xml += `${spaces}<${key}>${xmlEscape(String(value))}</${key}>\n`;
        }
      }

      return xml;
    };

    return `<?xml version="1.0" encoding="UTF-8"?>\n<preferences>\n${objectToXML(data, 2)}</preferences>`;
  }

  private calculateProfileCompleteness(profile: ProfilePreferences): number {
    const fields = ['displayName', 'firstName', 'lastName', 'bio', 'timezone', 'locale'];
    const completedFields = fields.filter(field => profile[field as keyof ProfilePreferences]).length;
    return Math.round((completedFields / fields.length) * 100);
  }

  private calculatePrivacyLevel(privacy: PrivacyPreferences): 'LOW' | 'MEDIUM' | 'HIGH' {
    let score = 0;
    if (privacy.dataMinimization) score += 2;
    if (!privacy.behaviorTracking) score += 2;
    if (!privacy.locationTracking) score += 2;
    if (!privacy.crossSiteTracking) score += 2;
    if (!privacy.thirdPartySharing.enabled) score += 2;

    if (score >= 8) return 'HIGH';
    if (score >= 5) return 'MEDIUM';
    return 'LOW';
  }

  private getActiveCommunicationChannels(communication: CommunicationPreferences): CommunicationChannelType[] {
    const active: CommunicationChannelType[] = [];
    if (communication.email.enabled) active.push(CommunicationChannelType.EMAIL);
    if (communication.sms.enabled) active.push(CommunicationChannelType.SMS);
    if (communication.push.enabled) active.push(CommunicationChannelType.PUSH);
    if (communication.inApp.enabled) active.push(CommunicationChannelType.IN_APP);
    if (communication.postal.enabled) active.push(CommunicationChannelType.POSTAL);
    return active;
  }

  private getConsentStatus(consent: ConsentPreferences): 'GRANTED' | 'PARTIAL' | 'WITHDRAWN' {
    // This would analyze the consent settings to determine overall status
    // Implementation would depend on specific consent requirements
    if (consent.granularConsent) return 'PARTIAL';
    return 'GRANTED';
  }

  private calculateSecurityLevel(security: SecurityPreferences): 'LOW' | 'MEDIUM' | 'HIGH' {
    let score = 0;
    if (security.twoFactorAuth.enabled) score += 3;
    if (security.passwordSettings.requireStrong) score += 2;
    if (security.sessionManagement.sessionTimeout <= 30) score += 2;
    if (security.loginNotifications.enabled) score += 1;
    if (security.securityAlerts.enabled) score += 1;
    if (security.privacyEnhancements.encryptStoredData) score += 1;

    if (score >= 7) return 'HIGH';
    if (score >= 4) return 'MEDIUM';
    return 'LOW';
  }

  private isAccessibilityEnabled(accessibility: AccessibilityPreferences): boolean {
    return accessibility.visualAccessibility.highContrast ||
           accessibility.visualAccessibility.screenReader ||
           accessibility.audioAccessibility.captions ||
           accessibility.motorAccessibility.keyboardNavigation ||
           accessibility.assistiveTechnology.screenReader.enabled;
  }

  private async generateRecommendations(preferences: UserPreferenceCenter): Promise<string[]> {
    const recommendations: string[] = [];

    // Privacy recommendations
    if (!preferences.privacySettings.dataMinimization) {
      recommendations.push('Enable data minimization to reduce your privacy footprint');
    }

    // Security recommendations
    if (!preferences.securitySettings.twoFactorAuth.enabled) {
      recommendations.push('Enable two-factor authentication for better security');
    }

    // Communication recommendations
    if (preferences.communicationSettings.email.enabled && preferences.communicationSettings.email.trackingPixels) {
      recommendations.push('Disable email tracking pixels to improve privacy');
    }

    return recommendations;
  }

  private calculateCompletionScore(preferences: UserPreferenceCenter): number {
    const totalSections = 8;
    let completedSections = 0;

    // Check if each section has been customized from defaults
    if (this.isProfileCustomized(preferences.profileSettings)) completedSections++;
    if (this.isPrivacyCustomized(preferences.privacySettings)) completedSections++;
    if (this.isCommunicationCustomized(preferences.communicationSettings)) completedSections++;
    if (this.isDataCustomized(preferences.dataSettings)) completedSections++;
    if (this.isSecurityCustomized(preferences.securitySettings)) completedSections++;
    if (this.isConsentCustomized(preferences.consentSettings)) completedSections++;
    if (this.isNotificationCustomized(preferences.notificationSettings)) completedSections++;
    if (this.isAccessibilityCustomized(preferences.accessibilitySettings)) completedSections++;

    return Math.round((completedSections / totalSections) * 100);
  }

  private isProfileCustomized(profile: ProfilePreferences): boolean {
    return !!(profile.displayName || profile.firstName || profile.lastName || profile.bio);
  }

  private isPrivacyCustomized(privacy: PrivacyPreferences): boolean {
    const defaults = this.getDefaultPrivacyPreferences();
    return JSON.stringify(privacy) !== JSON.stringify(defaults);
  }

  private isCommunicationCustomized(communication: CommunicationPreferences): boolean {
    return communication.email.enabled || communication.sms.enabled || 
           communication.push.enabled || communication.postal.enabled;
  }

  private isDataCustomized(data: DataPreferences): boolean {
    const defaults = this.getDefaultDataPreferences();
    return JSON.stringify(data) !== JSON.stringify(defaults);
  }

  private isSecurityCustomized(security: SecurityPreferences): boolean {
    return security.twoFactorAuth.enabled || security.loginNotifications.enabled;
  }

  private isConsentCustomized(consent: ConsentPreferences): boolean {
    const defaults = this.getDefaultConsentPreferences();
    return JSON.stringify(consent) !== JSON.stringify(defaults);
  }

  private isNotificationCustomized(notification: NotificationPreferences): boolean {
    return notification.categorySettings.length > 0 || notification.channelSettings.length > 0;
  }

  private isAccessibilityCustomized(accessibility: AccessibilityPreferences): boolean {
    return accessibility.visualAccessibility.highContrast || 
           accessibility.visualAccessibility.screenReader ||
           accessibility.audioAccessibility.captions;
  }

  private async logAuditEvent(event: Omit<PreferenceAuditEvent, 'eventId'>): Promise<string> {
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    
    const query = `
      INSERT INTO preference_audit_events (
        event_id, event_type, user_id, timestamp, changes, 
        context, ip_address, user_agent, session_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    await this.db.query(query, [
      eventId,
      event.eventType,
      event.userId,
      event.timestamp,
      JSON.stringify(event.changes),
      JSON.stringify(event.context),
      event.ipAddress,
      event.userAgent,
      event.sessionId
    ]);

    return eventId;
  }
}

// Supporting interfaces and types
export interface OperationContext {
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  source?: string;
  reason?: string;
  metadata?: Record<string, any>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ExportResult {
  exportId: string;
  data: string;
  mimeType: string;
  filename: string;
  size: number;
  createdAt: Date;
  expiresAt: Date;
}

export interface PreferenceSummary {
  userId: string;
  summaryId: string;
  profileComplete: number; // percentage
  privacyLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  communicationChannels: CommunicationChannelType[];
  consentStatus: 'GRANTED' | 'PARTIAL' | 'WITHDRAWN';
  securityLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  accessibilityEnabled: boolean;
  customPreferencesCount: number;
  lastUpdated: Date;
  recommendations: string[];
  completionScore: number; // percentage
}