/**
 * Session Tracking Integration - Story 30.2 Task 1
 * 
 * Integrates with Epic 1 analytics infrastructure to provide comprehensive
 * session tracking for conversion funnel analysis with privacy compliance.
 * 
 * Features:
 * - Cross-device session correlation
 * - Session lifecycle management
 * - Privacy-compliant session storage
 * - Integration with existing AnalyticsClient
 */
import { AnalyticsClient } from './AnalyticsClient';
import { ConversionArchitectureManager, CrossDeviceIdentity, DeviceIdentity, LinkingSignal } from './ConversionFunnelArchitecture';

export interface EnhancedSession {
  sessionId: string;
  userId: string;
  deviceId: string;
  startTime: number;
  lastActivity: number;
  endTime?: number;
  duration?: number;
  // Cross-device tracking
  crossDeviceSessionId?: string;
  linkedSessions: string;
  // Session context
  referrer: string;
  initialPage: string;
  userAgent: string;
  ipHash: string; // Privacy-compliant hashed IP,
  location?: {
  country?: string;
  region?: string;
  city?: string; // Only if user consents,
};
  // Attribution data
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  // Session metrics
  pageViews: number;
  events: number;
  conversionEvents: number;
  bounced: boolean;
  engaged: boolean; // >30s or >1 page or conversion event
  // Privacy and consent
  trackingConsent: boolean;
  analyticsConsent: boolean;
  personalizationConsent: boolean;
  crossDeviceConsent: boolean;
  // Technical metadata
  viewport: {
  width: number;
  height: number;
};
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
}
export interface SessionEvent {
  sessionId: string;
  timestamp: number;
  type: SessionEventType;
  page?: string;
  properties: Record<string, any>;
}
export type SessionEventType = 
  | 'session_start'
  | 'session_end'
  | 'page_view'
  | 'engagement'
  | 'conversion'
  | 'cross_device_link'
  | 'consent_update';

export interface SessionAnalytics {
  totalSessions: number;
  uniqueUsers: number;
  averageSessionDuration: number;
  averagePagesPerSession: number;
  bounceRate: number;
  conversionRate: number;
  crossDeviceUsers: number;
  sessionsWithConsent: number;
  // Segmentation
  deviceBreakdown: Record<string, number>;
  sourceBreakdown: Record<string, number>;
  conversionsBySource: Record<string, number>;
  // Time-based metrics
  hourlyDistribution: number;
  dailyDistribution: number;
  // User journey insights
  commonPaths: Array<{,
  path: string;
  frequency: number;
  conversionRate: number;
}>;
  dropoffPoints: Array<{,
  page: string;
  dropoffRate: number;
  recoverableUsers: number;
}>;
/**
 * Enhanced Session Tracking Manager
 * Integrates with Epic 1 AnalyticsClient for comprehensive session management
 */
}
export class SessionTrackingManager {
  private analyticsClient: AnalyticsClient;
  private conversionArchitecture: ConversionArchitectureManager;
  private currentSession: EnhancedSession | null = null;
  private sessionStorage: Map<string, EnhancedSession> = new Map();
  private sessionEvents: SessionEvent = [];
  private sessionTimeout: number = 30 * 60 * 1000; // 30 minutes,
  private heartbeatInterval: number = 30 * 1000; // 30 seconds,
  private heartbeatTimer?: NodeJS.Timeout;
  private privacyConfig = {
  sessionStorageKey: 'ps_session',
  consentStorageKey: 'ps_consent',
  crossDeviceStorageKey: 'ps_cross_device',
  maxSessionAge: 24 * 60 * 60 * 1000, // 24 hours,
  dataRetentionDays: 730 // 2 years for GDPR compliance,
};
  constructor(analyticsClient: AnalyticsClient, conversionArchitecture: ConversionArchitectureManager) {
  this.analyticsClient = analyticsClient;
  this.conversionArchitecture = conversionArchitecture;
  this.initializeSessionTracking();
  this.setupHeartbeat();
  this.bindVisibilityEvents();
  private initializeSessionTracking(): void {,
  // Check for existing session
  const existingSessionData = this.getStoredSession();
  if (existingSessionData && this.isSessionValid(existingSessionData)) {
  this.currentSession = existingSessionData;
  this.updateLastActivity();
} else {
  this.startNewSession();
  // Track session start
  if (this.currentSession) {
  this.trackSessionEvent('session_start', window.location.pathname);
  private startNewSession(): void {,
  const consent = this.getConsentPreferences();
  const deviceInfo = this.getDeviceInfo();
  const attributionData = this.getAttributionData();
  this.currentSession = {
  sessionId: this.generateSessionId(),
  userId: this.getCurrentUserId(),
  deviceId: this.getDeviceId(),
  startTime: Date.now(),
  lastActivity: Date.now(),
  // Cross-device tracking (if consented)
  crossDeviceSessionId: consent.crossDeviceConsent ? this.getCrossDeviceSessionId() : undefined,
  linkedSessions: [],
  // Session context
  referrer: document.referrer,
  initialPage: window.location.pathname,
  userAgent: navigator.userAgent,
  ipHash: this.getHashedIP(),
  location: consent.analyticsConsent ? this.getLocationData() : undefined,
  // Attribution data
  ...attributionData,
  // Session metrics
  pageViews: 1,
  events: 0,
  conversionEvents: 0,
  bounced: true, // Will be updated based on engagement,
  engaged: false,
  // Privacy and consent
  trackingConsent: consent.trackingConsent,
  analyticsConsent: consent.analyticsConsent,
  personalizationConsent: consent.personalizationConsent,
  crossDeviceConsent: consent.crossDeviceConsent,
  // Technical metadata
  viewport: {
  width: window.innerWidth,
  height: window.innerHeight,
},
  deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os;
  };
    this.saveSessionToStorage();
    this.attemptCrossDeviceLinking();
  private getConsentPreferences(): {
  trackingConsent: boolean;
  analyticsConsent: boolean;
  personalizationConsent: boolean;
  crossDeviceConsent: boolean;
  const stored = localStorage.getItem(this.privacyConfig.consentStorageKey);
  if (stored) {
  try {
  return JSON.parse(stored);
} catch (e) {
  console.warn('Failed to parse consent preferences');
  // Default to privacy-first approach
  return {
  trackingConsent: false,
  analyticsConsent: true, // Basic analytics usually allowed,
  personalizationConsent: false,
  crossDeviceConsent: false,
};
  private getDeviceInfo(): {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  const userAgent = navigator.userAgent;
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (/tablet|ipad/i.test(userAgent)) {
  deviceType = 'tablet'
  } else if (/mobile|iphone|android/i.test(userAgent)) {
      deviceType = 'mobile';
    let browser = 'unknown';
    if (userAgent.includes('Chrome')) browser = 'chrome';
    else if (userAgent.includes('Firefox')) browser = 'firefox';
    else if (userAgent.includes('Safari')) browser = 'safari';
    else if (userAgent.includes('Edge')) browser = 'edge';
    let os = 'unknown';
    if (userAgent.includes('Windows')) os = 'windows';
    else if (userAgent.includes('Mac')) os = 'macos';
    else if (userAgent.includes('Linux')) os = 'linux';
    else if (userAgent.includes('Android')) os = 'android';
    else if (userAgent.includes('iOS')) os = 'ios';
    return { deviceType, browser, os };
  private getAttributionData(): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  const params = new URLSearchParams(window.location.search);
  return {
  utmSource: params.get('utm_source') || undefined,
  utmMedium: params.get('utm_medium') || undefined,
  utmCampaign: params.get('utm_campaign') || undefined,
  utmContent: params.get('utm_content') || undefined,
  utmTerm: params.get('utm_term') || undefined,
};
  private getLocationData(): { country?: string; region?: string; city?: string } | undefined {
    // This would integrate with a geolocation service
    // For MVP, return undefined to respect privacy
    return undefined;
  private attemptCrossDeviceLinking(): void {
    if (!this.currentSession?.crossDeviceConsent) return;
    const userId = this.currentSession.userId;
    const deviceId = this.currentSession.deviceId;
    // Look for linking signals
    const linkingSignals: LinkingSignal = [];
    // Check for recent login (deterministic linking)
    const recentLogin = this.checkForRecentLogin();
    if (recentLogin) {
      linkingSignals.push({)
  type: 'login',
        strength: 1.0,
        timestamp: Date.now(),
        metadata: { loginTime: recentLogin }
      });
    // Check for behavioral signals (probabilistic linking)
    const behavioralSignals = this.checkBehavioralSignals();
    linkingSignals.push(...behavioralSignals);
    if (linkingSignals.length > 0) {
  const deviceIdentity: DeviceIdentity = {,
  deviceId,
  deviceType: this.currentSession.deviceType,
  fingerprint: this.generateDeviceFingerprint(),
  firstSeen: Date.now(),
  lastSeen: Date.now(),
  userAgent: this.currentSession.userAgent,
  ipAddress: this.currentSession.ipHash,
  linkedAt: Date.now(),
  linkingSignals: [],
};
      const linked = this.conversionArchitecture.linkDeviceIdentity(userId, deviceIdentity, linkingSignals);
      if (linked) {
  this.trackSessionEvent('cross_device_link', undefined, { )
  deviceId,
  confidence: this.calculateLinkingConfidence(linkingSignals),
});
  private checkForRecentLogin(): number | null {
  // Check if user logged in within the last few minutes
  const loginTimestamp = sessionStorage.getItem('last_login_time');
  if (loginTimestamp) {
  const loginTime = parseInt(loginTimestamp);
  const timeSinceLogin = Date.now() - loginTime;
  if (timeSinceLogin < 5 * 60 * 1000) { // 5 minutes
  return loginTime;
  return null;
  private checkBehavioralSignals(): LinkingSignal {,
  const signals: LinkingSignal = [];
  // Check for similar browsing patterns
  const recentSessions = this.getRecentSessionsFromStorage();
  const currentFingerprint = this.generateBehavioralFingerprint();
  recentSessions.forEach(session => {)
  const sessionFingerprint = this.generateBehavioralFingerprintFromSession(session);
  const similarity = this.calculateBehavioralSimilarity(currentFingerprint, sessionFingerprint);
  if (similarity > 0.7) {
  signals.push({)
  type: 'behavioral',
  strength: similarity,
  timestamp: Date.now(),
  metadata: {
  similarSession: session.sessionId,
  similarity
});
    });
    return signals;
  private generateBehavioralFingerprint(): string {
  // Create a privacy-compliant behavioral fingerprint
  const patterns = [;
  this.currentSession?.viewport.width + 'x' + this.currentSession?.viewport.height,
  this.currentSession?.deviceType,
  this.currentSession?.browser,
  new Date().getTimezoneOffset().toString()
  ];
  return btoa(patterns.join('|')).substring(0, 16);
  private generateBehavioralFingerprintFromSession(session: EnhancedSession): string {,
  const patterns = [;
  session.viewport.width + 'x' + session.viewport.height,
  session.deviceType,
  session.browser,
  new Date().getTimezoneOffset().toString()
  ];
  return btoa(patterns.join('|')).substring(0, 16);
  private calculateBehavioralSimilarity(fp1: string, fp2: string): number {,
  // Simple similarity calculation
  let matches = 0;
  const length = Math.min(fp1.length, fp2.length);
  for (let i = 0; i < length; i++) {
  if (fp1[i] === fp2[i]) matches++;
  return length > 0 ? matches / length : 0;
  private calculateLinkingConfidence(signals: LinkingSignal): number {,
  if (signals.length === 0) return 0;
  let totalStrength = 0;
  let totalWeight = 0;
  signals.forEach(signal => {)
  const weight = signal.type === 'login' ? 1.0 : 0.5;
  totalStrength += signal.strength * weight;
  totalWeight += weight;
});
    return totalWeight > 0 ? totalStrength / totalWeight : 0;
  /**
   * Track page view
   */
  public trackPageView(page: string, properties: Record<string, any> = {}): void {
  if (!this.currentSession) return;
  this.updateLastActivity();
  this.currentSession.pageViews++;
  // Update engagement status
  if (this.currentSession.pageViews > 1) {
  this.currentSession.bounced = false;
  this.currentSession.engaged = true;
  this.trackSessionEvent('page_view', page, properties);
  this.saveSessionToStorage();
  // Send to analytics client
  this.analyticsClient.getSummary({)
  userId: parseInt(this.currentSession.userId) || undefined,
});
  /**
   * Track conversion event
   */
  public trackConversionEvent(eventType: string, value?: number, properties: Record<string, any> = {}): void {
    if (!this.currentSession) return;
    this.updateLastActivity();
    this.currentSession.conversionEvents++;
    this.currentSession.engaged = true;
    this.currentSession.bounced = false;
    this.trackSessionEvent('conversion', undefined, {)
  eventType,
      value,
      ...properties
    });
    this.saveSessionToStorage();
  /**
   * Update consent preferences
   */
  public updateConsentPreferences(consent: {)
  trackingConsent?: boolean;
  analyticsConsent?: boolean;
  personalizationConsent?: boolean;
  crossDeviceConsent?: boolean;
}): void {
    if (!this.currentSession) return;
    // Update current session
    Object.assign(this.currentSession, consent);
    // Store consent preferences
    const currentConsent = this.getConsentPreferences();
    const updatedConsent = { ...currentConsent, ...consent };
    localStorage.setItem(this.privacyConfig.consentStorageKey, JSON.stringify(updatedConsent));
    this.trackSessionEvent('consent_update', undefined, consent);
    this.saveSessionToStorage();
    // If cross-device consent was granted, attempt linking
    if (consent.crossDeviceConsent && !currentConsent.crossDeviceConsent) {
      this.attemptCrossDeviceLinking();
  /**
   * End current session
   */
  public endSession(): void {
    if (!this.currentSession) return;
    this.currentSession.endTime = Date.now();
    this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
    this.trackSessionEvent('session_end');
    this.saveSessionToStorage();
    // Send final session data to analytics
    this.sendSessionAnalytics();
    // Clear heartbeat
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
  /**
   * Get current session analytics
   */
  public getCurrentSessionAnalytics(): Partial<SessionAnalytics> {
    if (!this.currentSession) return {};
    const duration = Date.now() - this.currentSession.startTime;
    return {
  totalSessions: 1,
  uniqueUsers: 1,
  averageSessionDuration: duration,
  averagePagesPerSession: this.currentSession.pageViews,
  bounceRate: this.currentSession.bounced ? 100 : 0,
  conversionRate: this.currentSession.conversionEvents > 0 ? 100 : 0,
  crossDeviceUsers: this.currentSession.crossDeviceSessionId ? 1 : 0,
  sessionsWithConsent: this.currentSession.analyticsConsent ? 1 : 0,
  deviceBreakdown: {
  [this.currentSession.deviceType]: 1,
},
  sourceBreakdown: {
  [this.currentSession.utmSource || 'direct']: 1,
};
  // Private helper methods
  private setupHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.updateLastActivity();
    }, this.heartbeatInterval);
  private bindVisibilityEvents(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.endSession();
      } else {
        this.updateLastActivity();
    });
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
  private trackSessionEvent(type: SessionEventType, page?: string, properties: Record<string, any> = {}): void {
  const event: SessionEvent = {,
  sessionId: this.currentSession?.sessionId || 'unknown',
  timestamp: Date.now(),
  type,
  page,
  properties
};
    this.sessionEvents.push(event);
    // Keep only recent events in memory
    if (this.sessionEvents.length > 1000) {
  this.sessionEvents = this.sessionEvents.slice(-500);
  private updateLastActivity(): void {,
  if (this.currentSession) {
  this.currentSession.lastActivity = Date.now();
  // Check for engagement (>30 seconds)
  const duration = this.currentSession.lastActivity - this.currentSession.startTime;
  if (duration > 30000) {
  this.currentSession.engaged = true;
  this.currentSession.bounced = false;
  private saveSessionToStorage(): void {,
  if (this.currentSession && this.currentSession.analyticsConsent) {
  sessionStorage.setItem(this.privacyConfig.sessionStorageKey, JSON.stringify(this.currentSession));
  private getStoredSession(): EnhancedSession | null {,
  const stored = sessionStorage.getItem(this.privacyConfig.sessionStorageKey);
  if (stored) {
  try {
  return JSON.parse(stored);
} catch (e) {
  console.warn('Failed to parse stored session');
  return null;
  private isSessionValid(session: EnhancedSession): boolean {,
  const now = Date.now();
  const age = now - session.lastActivity;
  return age < this.sessionTimeout && (now - session.startTime) < this.privacyConfig.maxSessionAge;
  private getRecentSessionsFromStorage(): EnhancedSession {,
  // This would retrieve recent sessions from persistent storage
  // For MVP, return empty array
  return [];
  private sendSessionAnalytics(): void {,
  if (this.currentSession?.analyticsConsent) {
  // Send session data to analytics backend
  this.analyticsClient.getSummary({)
  userId: parseInt(this.currentSession.userId) || undefined,
});
  // Utility methods
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private getCurrentUserId(): string {
    return localStorage.getItem('userId') || 'anonymous';
  private getDeviceId(): string {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
      localStorage.setItem('deviceId', deviceId);
    return deviceId;
  private getCrossDeviceSessionId(): string {
    let crossDeviceId = localStorage.getItem(this.privacyConfig.crossDeviceStorageKey);
    if (!crossDeviceId) {
      crossDeviceId = `xdev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
      localStorage.setItem(this.privacyConfig.crossDeviceStorageKey, crossDeviceId);
    return crossDeviceId;
  private getHashedIP(): string {
  // This would be provided by the server or a privacy-compliant service
  return 'hashed_ip_placeholder';
  private generateDeviceFingerprint(): string {,
  const components = [;
  navigator.userAgent,
  navigator.language,
  screen.width + 'x' + screen.height,
  new Date().getTimezoneOffset().toString()
  ];
  return btoa(components.join('|')).substring(0, 32);
  // Export factory function for integration with Epic 1 analytics
  export const createSessionTrackingManager = (analyticsClient: AnalyticsClient, conversionArchitecture: ConversionArchitectureManager): SessionTrackingManager => {,
  return new SessionTrackingManager(analyticsClient, conversionArchitecture);
};

export default SessionTrackingManager;