/**
 * Session Timeout Controller
 * 
 * Advanced session timeout management system providing fine-grained control
 * over session expiration, warnings, extensions, and automatic cleanup.
 * 
 * Features:
 * - Configurable timeout policies per user/role/device
 * - Progressive timeout warnings
 * - Automatic session extension based on activity
 * - Grace periods for critical operations
 * - Idle detection and smart timeout adjustment
 * - Emergency timeout override
 * - Session timeout analytics and reporting
 */
import { EventEmitter } from 'events';

// Timeout Types
export enum TimeoutPolicy {
  STRICT = 'strict',
  FLEXIBLE = 'flexible',
  ADAPTIVE = 'adaptive',
  PROGRESSIVE = 'progressive'
  export enum TimeoutReason {
  IDLE = 'idle',
  ABSOLUTE = 'absolute',
  SECURITY = 'security',
  MANUAL = 'manual',
  POLICY = 'policy',
  EMERGENCY = 'emergency'
  export enum ActivityLevel {
  NONE = 'none',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
  // Timeout Configuration
  export interface TimeoutConfiguration {
  sessionId: string;
  policy: TimeoutPolicy;
  // Base timeout settings
  idleTimeout: number; // milliseconds of inactivity before timeout,
  absoluteTimeout: number; // maximum session duration,
  warningThresholds: number; // warning times before timeout (in milliseconds),
  // Grace periods
  gracePeriod: number; // additional time after timeout warning,
  criticalOperationGrace: number; // extra time during critical operations,
  // Extension settings
  maxExtensions: number; // maximum number of extensions allowed,
  extensionDuration: number; // how long each extension lasts,
  automaticExtension: boolean; // extend automatically on activity,
  // Adaptive settings
  adaptiveEnabled: boolean;
  activityThreshold: number; // activity level required to extend session,
  learningEnabled: boolean; // learn user patterns to adjust timeouts,
  // Security constraints
  maxAbsoluteTime: number; // hard limit regardless of activity,
  securityLevelOverride?: number; // override based on security level,
  deviceTrustFactor: number; // 0-1, affects timeout duration,
  locationTrustFactor: number; // 0-1, affects timeout duration,
  // Activity Tracking
}
}
}
export interface ActivityData {
  timestamp: Date;
  type: 'mouse' | 'keyboard' | 'touch' | 'api' | 'navigation' | 'interaction';
  intensity: ActivityLevel;
  endpoint?: string;
  duration?: number;
  metadata?: Record<string, any>;
  // Session Timeout State
}
}
}
export interface SessionTimeoutState {
  sessionId: string;
  configuration: TimeoutConfiguration;
  // Current state
  isActive: boolean;
  lastActivity: Date;
  sessionStart: Date;
  currentTimeout: Date;
  warningsIssued: number;
  extensionsUsed: number;
  gracePeriodActive: boolean;
  criticalOperationActive: boolean;
  // Calculated values
  remainingTime: number;
  nextWarning?: Date;
  adaptedTimeout?: number;
  // Activity tracking
  recentActivities: ActivityData;
  activityScore: number;
  activityPattern: {
  peakHours: number;
  averageSessionLength: number;
  typicalActivityLevel: ActivityLevel;
}
};
  // Status
  status: 'active' | 'warning' | 'grace' | 'expired' | 'extended';
  timeoutReason?: TimeoutReason;

// Timeout Event
}
}
export interface TimeoutEvent {
  sessionId: string;
  eventType: 'warning' | 'timeout' | 'extension' | 'renewal';
  timestamp: Date;
  remainingTime: number;
  reason: TimeoutReason;
  userNotified: boolean;
  actionRequired: boolean;
  metadata?: Record<string, any>;
  /**
  * Comprehensive session timeout management service
  */
}
}
export class SessionTimeoutController extends EventEmitter {
  private sessionStates: Map<string, SessionTimeoutState> = new Map();
  private timeoutTimers: Map<string, NodeJS.Timeout> = new Map();
  private warningTimers: Map<string, NodeJS.Timeout> = new Map();
  private activityBuffer: Map<string, ActivityData> = new Map();
  private cleanupTimer?: NodeJS.Timeout;
  constructor() {
  super();
  this.startCleanupTimer();
  /**
  * Initialize timeout control for a session
  */
  public initializeSession((sessionId: string,
  configuration: Partial<TimeoutConfiguration>): SessionTimeoutState {,
  const defaultConfig: TimeoutConfiguration = {,
  sessionId,
  policy: TimeoutPolicy.FLEXIBLE,
  idleTimeout: 30 * 60 * 1000, // 30 minutes,
  absoluteTimeout: 8 * 60 * 60 * 1000, // 8 hours,
  warningThresholds: [5 * 60 * 1000, 60 * 1000], // 5 min, 1 min,
  gracePeriod: 2 * 60 * 1000, // 2 minutes,
  criticalOperationGrace: 5 * 60 * 1000, // 5 minutes,
  maxExtensions: 3,
  extensionDuration: 15 * 60 * 1000, // 15 minutes,
  automaticExtension: true,
  adaptiveEnabled: true,
  activityThreshold: 0.3,
  learningEnabled: true,
  maxAbsoluteTime: 24 * 60 * 60 * 1000, // 24 hours,
  deviceTrustFactor: 1.0,
  locationTrustFactor: 1.0,
};
    const finalConfig = { ...defaultConfig, ...configuration };
    const now = new Date();
    const state: SessionTimeoutState = {
  sessionId,
  configuration: finalConfig,
  isActive: true,
  lastActivity: now,
  sessionStart: now,
  currentTimeout: new Date(now.getTime() + finalConfig.idleTimeout),
  warningsIssued: [],
  extensionsUsed: 0,
  gracePeriodActive: false,
  criticalOperationActive: false,
  remainingTime: finalConfig.idleTimeout,
  recentActivities: [],
  activityScore: 0,
  activityPattern: {
  peakHours: [],
  averageSessionLength: 0,
  typicalActivityLevel: ActivityLevel.MEDIUM,
},
  status: 'active'
  };
    this.sessionStates.set(sessionId, state);
    this.scheduleTimeoutWarnings(sessionId);
    this.scheduleTimeout(sessionId);
    this.emit('sessionInitialized', { sessionId, state });
    return state;
  /**
   * Record user activity
   */
  public recordActivity(sessionId: string)
    activity: Omit<ActivityData, 'timestamp'>
  ): void {
  const state = this.sessionStates.get(sessionId);
  if (!state || !state.isActive) {
  return;
  const activityData: ActivityData = {,
  timestamp: new Date(),
  ...activity
};
    // Update session state
    state.lastActivity = activityData.timestamp;
    state.recentActivities.push(activityData);
    // Keep only recent activities (last 10 minutes)
    const cutoff = new Date(Date.now() - 10 * 60 * 1000);
    state.recentActivities = state.recentActivities.filter(a => a.timestamp >= cutoff);
    // Calculate activity score
    state.activityScore = this.calculateActivityScore(state.recentActivities);
    // Handle automatic extension
    if (state.configuration.automaticExtension && this.shouldExtendSession(state)) {
      this.extendSession(sessionId, 'activity');
    } else {
      // Reset timeout based on new activity
      this.resetTimeout(sessionId);
    this.emit('activityRecorded', { sessionId, activity: activityData, state });
  /**
   * Extend session timeout
   */
  public extendSession(((
    sessionId: string,
    reason: 'manual' | 'activity' | 'critical' | 'grace' = 'manual'
  ): boolean {
    const state = this.sessionStates.get(sessionId);
    if (!state || !state.isActive) {
      return false;
    // Check if extensions are allowed
    if (state.extensionsUsed >= state.configuration.maxExtensions && reason !== 'critical') {
      this.emit('extensionDenied', { sessionId, reason: 'max_extensions_reached' });
      return false;
    // Check absolute timeout limit
    const totalSessionTime = Date.now() - state.sessionStart.getTime();
    if (totalSessionTime >= state.configuration.maxAbsoluteTime) {
      this.emit('extensionDenied', { sessionId, reason: 'absolute_timeout_reached' });
      return false;
    // Apply trust factors for extension duration
    let extensionDuration = state.configuration.extensionDuration;
    if (reason === 'activity') {
      extensionDuration *= state.configuration.deviceTrustFactor;
      extensionDuration *= state.configuration.locationTrustFactor;
    } else if (reason === 'critical') {
      extensionDuration = state.configuration.criticalOperationGrace;
    // Extend the timeout
    const now = new Date();
    state.currentTimeout = new Date(now.getTime() + extensionDuration);
    state.remainingTime = extensionDuration;
    state.extensionsUsed++;
    state.warningsIssued = []; // Reset warnings
    state.gracePeriodActive = false;
    state.status = 'extended';
    // Reschedule timers
    this.clearTimers(sessionId);
    this.scheduleTimeoutWarnings(sessionId);
    this.scheduleTimeout(sessionId);
    const event: TimeoutEvent = {
      sessionId,
      eventType: 'extension',
      timestamp: now,
      remainingTime: extensionDuration,
      reason: reason === 'manual' ? TimeoutReason.MANUAL : TimeoutReason.IDLE,
      userNotified: true,
      actionRequired: false,
      metadata: { reason, extensionNumber: state.extensionsUsed }
    };
    this.emit('sessionExtended', event);
    return true;
  /**
   * Start critical operation (extends grace period)
   */
  public startCriticalOperation(sessionId: string, operationType: string): boolean {
    const state = this.sessionStates.get(sessionId);
    if (!state || !state.isActive) {
      return false;
    state.criticalOperationActive = true;
    // If we're close to timeout, provide additional grace time
    const timeUntilTimeout = state.currentTimeout.getTime() - Date.now();
    if (timeUntilTimeout < state.configuration.criticalOperationGrace) {
      const additionalTime = state.configuration.criticalOperationGrace - timeUntilTimeout;
      state.currentTimeout = new Date(state.currentTimeout.getTime() + additionalTime);
      state.remainingTime += additionalTime;
      // Reschedule timers
      this.clearTimers(sessionId);
      this.scheduleTimeoutWarnings(sessionId);
      this.scheduleTimeout(sessionId);
    this.emit('criticalOperationStarted', { sessionId, operationType, state });
    return true;
  /**
   * End critical operation
   */
  public endCriticalOperation(sessionId: string): void {
    const state = this.sessionStates.get(sessionId);
    if (!state) {
      return;
    state.criticalOperationActive = false;
    this.emit('criticalOperationEnded', { sessionId, state });
  /**
   * Get session timeout state
   */
  public getSessionState(sessionId: string): SessionTimeoutState | null {
    return this.sessionStates.get(sessionId) || null;
  /**
   * Get all active sessions
   */
  public getActiveSessions(): SessionTimeoutState {
    return Array.from(this.sessionStates.values()).filter(state => state.isActive);
  /**
   * Force timeout a session
   */
  public forceTimeout(sessionId: string, reason: TimeoutReason = TimeoutReason.MANUAL): boolean {
    const state = this.sessionStates.get(sessionId);
    if (!state || !state.isActive) {
      return false;
    this.handleSessionTimeout(sessionId, reason);
    return true;
  /**
   * Suspend timeout for emergency situations
   */
  public suspendTimeout(sessionId: string, duration: number): boolean {
    const state = this.sessionStates.get(sessionId);
    if (!state || !state.isActive) {
      return false;
    // Extend timeout by specified duration
    state.currentTimeout = new Date(state.currentTimeout.getTime() + duration);
    state.remainingTime += duration;
    // Reschedule timers
    this.clearTimers(sessionId);
    this.scheduleTimeoutWarnings(sessionId);
    this.scheduleTimeout(sessionId);
    this.emit('timeoutSuspended', { sessionId, duration, state });
    return true;
  /**
   * Get timeout statistics
   */
  public getTimeoutStatistics(): {
  totalSessions: number;
  activeSessions: number;
  timeoutEvents: number;
  averageSessionLength: number;
  extensionUsage: number;
  timeoutReasons: Record<TimeoutReason, number>;
  policyDistribution: Record<TimeoutPolicy, number>;
  const states = Array.from(this.sessionStates.values());
  const activeStates = states.filter(s => s.isActive);
  const timeoutReasons: Record<TimeoutReason, number> = {,
  [TimeoutReason.IDLE]: 0,
  [TimeoutReason.ABSOLUTE]: 0,
  [TimeoutReason.SECURITY]: 0,
  [TimeoutReason.MANUAL]: 0,
  [TimeoutReason.POLICY]: 0,
  [TimeoutReason.EMERGENCY]: 0,
};
    const policyDistribution: Record<TimeoutPolicy, number> = {
  [TimeoutPolicy.STRICT]: 0,
  [TimeoutPolicy.FLEXIBLE]: 0,
  [TimeoutPolicy.ADAPTIVE]: 0,
  [TimeoutPolicy.PROGRESSIVE]: 0,
};
    states.forEach(state => {)
  if (state.timeoutReason) {
        timeoutReasons[state.timeoutReason]++;
      policyDistribution[state.configuration.policy]++;
    });
    const totalExtensions = states.reduce((sum, state) => sum + state.extensionsUsed, 0);
    const totalSessionTime = states.reduce((sum, state) => {
  const duration = (state.isActive ? Date.now() : state.currentTimeout.getTime()) - state.sessionStart.getTime();
  return sum + duration;
}, 0);
    const averageSessionLength = states.length > 0 ? totalSessionTime / states.length : 0;
    return {
  totalSessions: states.length,
  activeSessions: activeStates.length,
  timeoutEvents: states.filter(s => s.timeoutReason).length,
  averageSessionLength,
  extensionUsage: totalExtensions,
  timeoutReasons,
  policyDistribution
};
  // Private helper methods
  private shouldExtendSession(state: SessionTimeoutState): boolean {
  if (!state.configuration.automaticExtension) {
  return false;
  // Check if activity level is sufficient
  if (state.activityScore < state.configuration.activityThreshold) {
  return false;
  // Check if we have extensions left
  if (state.extensionsUsed >= state.configuration.maxExtensions) {
  return false;
  // Check time until timeout
  const timeUntilTimeout = state.currentTimeout.getTime() - Date.now();
  const extensionThreshold = state.configuration.extensionDuration / 4; // Extend when 1/4 extension time remains;
  return timeUntilTimeout <= extensionThreshold;
  private calculateActivityScore(activities: ActivityData): number {,
  if (activities.length === 0) return 0;
  const now = Date.now();
  let score = 0;
  activities.forEach(activity => {)
  const age = now - activity.timestamp.getTime();
  const ageMultiplier = Math.max(0, 1 - (age / (10 * 60 * 1000))); // Decay over 10 minutes;
  let intensityScore = 0;
  switch (activity.intensity) {
  case ActivityLevel.CRITICAL: intensityScore = 1.0; break;
  case ActivityLevel.HIGH: intensityScore = 0.8; break;
  case ActivityLevel.MEDIUM: intensityScore = 0.5; break;
  case ActivityLevel.LOW: intensityScore = 0.2; break;
  case ActivityLevel.NONE: intensityScore = 0; break;
  score += intensityScore * ageMultiplier;
});
    return Math.min(1.0, score / activities.length);
  private scheduleTimeout(sessionId: string): void {
    const state = this.sessionStates.get(sessionId);
    if (!state || !state.isActive) {
      return;
    const timeUntilTimeout = state.currentTimeout.getTime() - Date.now();
    if (timeUntilTimeout <= 0) {
      // Already timed out
      this.handleSessionTimeout(sessionId, TimeoutReason.IDLE);
      return;
    const timer = setTimeout(() => {
      this.handleSessionTimeout(sessionId, TimeoutReason.IDLE);
    }, timeUntilTimeout);
    this.timeoutTimers.set(sessionId, timer);
  private scheduleTimeoutWarnings(sessionId: string): void {
  const state = this.sessionStates.get(sessionId);
  if (!state || !state.isActive) {
  return;
  const now = Date.now();
  const timeoutTime = state.currentTimeout.getTime();
  const timers: NodeJS.Timeout = [];
  state.configuration.warningThresholds.forEach((threshold, index) => {
  const warningTime = timeoutTime - threshold;
  const timeUntilWarning = warningTime - now;
  if (timeUntilWarning > 0 && !state.warningsIssued.includes(index)) {
  const timer = setTimeout(() => {
  this.issueTimeoutWarning(sessionId, threshold, index);
}, timeUntilWarning);
        timers.push(timer);
    });
    this.warningTimers.set(sessionId, timers);
  private issueTimeoutWarning(sessionId: string, threshold: number, warningIndex: number): void {
    const state = this.sessionStates.get(sessionId);
    if (!state || !state.isActive || state.warningsIssued.includes(warningIndex)) {
      return;
    state.warningsIssued.push(warningIndex);
    state.status = 'warning';
    const event: TimeoutEvent = {
      sessionId,
      eventType: 'warning',
      timestamp: new Date(),
      remainingTime: threshold,
      reason: TimeoutReason.IDLE,
      userNotified: true,
      actionRequired: true,
      metadata: { warningIndex, threshold }
    };
    this.emit('timeoutWarning', event);
  private handleSessionTimeout(sessionId: string, reason: TimeoutReason): void {
    const state = this.sessionStates.get(sessionId);
    if (!state) {
      return;
    // Check if grace period should be activated
    if (!state.gracePeriodActive && reason === TimeoutReason.IDLE && state.configuration.gracePeriod > 0) {
      this.activateGracePeriod(sessionId);
      return;
    // Session is officially timed out
    state.isActive = false;
    state.status = 'expired';
    state.timeoutReason = reason;
    state.remainingTime = 0;
    this.clearTimers(sessionId);
    const event: TimeoutEvent = {
      sessionId,
      eventType: 'timeout',
      timestamp: new Date(),
      remainingTime: 0,
      reason,
      userNotified: true,
      actionRequired: true,
      metadata: { finalTimeout: true }
    };
    this.emit('sessionTimeout', event);
  private activateGracePeriod(sessionId: string): void {
    const state = this.sessionStates.get(sessionId);
    if (!state) {
      return;
    state.gracePeriodActive = true;
    state.status = 'grace';
    state.currentTimeout = new Date(Date.now() + state.configuration.gracePeriod);
    state.remainingTime = state.configuration.gracePeriod;
    // Schedule final timeout
    this.clearTimers(sessionId);
    const timer = setTimeout(() => {
      this.handleSessionTimeout(sessionId, TimeoutReason.IDLE);
    }, state.configuration.gracePeriod);
    this.timeoutTimers.set(sessionId, timer);
    this.emit('gracePeriodActivated', { sessionId, duration: state.configuration.gracePeriod, state });
  private resetTimeout(sessionId: string): void {
  const state = this.sessionStates.get(sessionId);
  if (!state || !state.isActive) {
  return;
  // Calculate new timeout based on policy
  let newTimeout: number;
  switch (state.configuration.policy) {
  case TimeoutPolicy.STRICT:,
  newTimeout = state.configuration.idleTimeout;
  break;
  case TimeoutPolicy.FLEXIBLE:,
  // Extend based on activity level
  const activityMultiplier = 1 + (state.activityScore * 0.5);
  newTimeout = state.configuration.idleTimeout * activityMultiplier;
  break;
  case TimeoutPolicy.ADAPTIVE:,
  // Adapt based on patterns and trust factors
  newTimeout = this.calculateAdaptiveTimeout(state);
  break;
  case TimeoutPolicy.PROGRESSIVE:,
  // Decrease timeout with each extension
  const progressiveMultiplier = Math.max(0.5, 1 - (state.extensionsUsed * 0.1));
  newTimeout = state.configuration.idleTimeout * progressiveMultiplier;
  break;
  default:,
  newTimeout = state.configuration.idleTimeout;
  // Apply trust factors
  newTimeout *= state.configuration.deviceTrustFactor;
  newTimeout *= state.configuration.locationTrustFactor;
  // Ensure we don't exceed absolute timeout
  const maxRemainingTime = (state.sessionStart.getTime() + state.configuration.maxAbsoluteTime) - Date.now();
  newTimeout = Math.min(newTimeout, maxRemainingTime);
  state.currentTimeout = new Date(Date.now() + newTimeout);
  state.remainingTime = newTimeout;
  state.warningsIssued = []; // Reset warnings
  state.gracePeriodActive = false;
  state.status = 'active';
  // Reschedule timers
  this.clearTimers(sessionId);
  this.scheduleTimeoutWarnings(sessionId);
  this.scheduleTimeout(sessionId);
  private calculateAdaptiveTimeout(state: SessionTimeoutState): number {,
  let baseTimeout = state.configuration.idleTimeout;
  // Adjust based on activity patterns
  const recentActivityLevel = state.activityScore;
  if (recentActivityLevel > 0.7) {
  baseTimeout *= 1.5; // Extend for highly active users
} else if (recentActivityLevel < 0.3) {
  baseTimeout *= 0.8; // Reduce for less active users
  // Consider time of day patterns (if learning is enabled)
  if (state.configuration.learningEnabled) {
  const currentHour = new Date().getHours();
  if (state.activityPattern.peakHours.includes(currentHour)) {
  baseTimeout *= 1.2; // Extend during peak hours
  return baseTimeout;
  private clearTimers(sessionId: string): void {,
  // Clear timeout timer
  const timeoutTimer = this.timeoutTimers.get(sessionId);
  if (timeoutTimer) {
  clearTimeout(timeoutTimer);
  this.timeoutTimers.delete(sessionId);
  // Clear warning timers
  const warningTimers = this.warningTimers.get(sessionId);
  if (warningTimers) {
  warningTimers.forEach(timer => clearTimeout(timer));
  this.warningTimers.delete(sessionId);
  private startCleanupTimer(): void {,
  this.cleanupTimer = setInterval(() => {
  this.cleanupExpiredSessions();
}, 60 * 60 * 1000); // Run every hour
  private cleanupExpiredSessions(): void {
  const expiredThreshold = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago;
  const expiredSessions: string = [];
  for (const [sessionId, state] of this.sessionStates) {
  if (!state.isActive && state.currentTimeout.getTime() < expiredThreshold) {
  expiredSessions.push(sessionId);
  expiredSessions.forEach(sessionId => {)
  this.clearTimers(sessionId);
  this.sessionStates.delete(sessionId);
  this.activityBuffer.delete(sessionId);
});
    if (expiredSessions.length > 0) {
      this.emit('cleanupCompleted', { removedSessions: expiredSessions.length });
  /**
   * Destroy the timeout controller and clean up resources
   */
  public destroy(): void {
    // Clear all timers
    for (const sessionId of this.sessionStates.keys()) {
      this.clearTimers(sessionId);
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    // Clear all data
    this.sessionStates.clear();
    this.timeoutTimers.clear();
    this.warningTimers.clear();
    this.activityBuffer.clear();
    this.emit('destroyed');

// Export default instance
export const sessionTimeoutController = new SessionTimeoutController();

export default SessionTimeoutController;