/**
 * Session Priority Manager
 * 
 * Comprehensive session priority and eviction management system for handling
 * session conflicts, priority-based session allocation, and intelligent eviction
 * policies when session limits are reached.
 * 
 * Features:
 * - Priority-based session ranking and allocation
 * - Intelligent eviction policies (LRU, LFU, Priority-based, Hybrid)
 * - Session conflict detection and resolution
 * - Real-time session monitoring and metrics
 * - Customizable priority factors and weights
 * - Emergency session override capabilities
 * - Session lifecycle management
 */
import { EventEmitter } from 'events';

// Priority Types
export enum SessionPriority { CRITICAL = 'critical',     // System admin, emergency access
  HIGH = 'high',            // Important business operations
  MEDIUM = 'medium',        // Regular user operations
  LOW = 'low',             // Background, non-critical operations
  MINIMAL = 'minimal'       // Temporary, disposable sessions
  export enum EvictionPolicy {
  LRU = 'lru',                    // Least Recently Used
  LFU = 'lfu',                    // Least Frequently Used
  PRIORITY_BASED = 'priority',     // Based on session priority
  HYBRID = 'hybrid',              // Combination of factors
  FIFO = 'fifo',                  // First In, First Out
  ACTIVITY_BASED = 'activity'     // Based on activity patterns
  export enum ConflictResolution {
  REJECT_NEW = 'reject_new',           // Reject new session
  EVICT_OLDEST = 'evict_oldest',       // Remove oldest session
  EVICT_LOWEST_PRIORITY = 'evict_lowest', // Remove lowest priority
  PROMPT_USER = 'prompt_user',         // Ask user to choose
  MERGE_SESSIONS = 'merge_sessions'    // Combine session data
  // Session Priority Configuration
  export interface SessionPriorityConfig {
  maxSessionsPerUser: number;
  maxSessionsPerDevice: number;
  maxTotalSessions: number;
  evictionPolicy: EvictionPolicy;
  conflictResolution: ConflictResolution;
  priorityWeights: {;
  userRole: number;           // Weight for user role;
  deviceTrust: number;        // Weight for device trust level;
  location: number;           // Weight for location familiarity;
  timeOfDay: number;          // Weight for typical usage times;
  sessionAge: number;         // Weight for how long session exists;
  activityLevel: number;      // Weight for recent activity;
  securityLevel: number;      // Weight for security requirements }


};
  emergencyOverride: boolean;
  gracePeriodMinutes: number;

// Priority Factors


export interface PriorityFactors { userRole: 'admin' | 'moderator' | 'user' | 'guest';
  deviceTrustLevel: number;     // 0-100;
  locationFamiliarity: number;  // 0-100;
  timeOfDayScore: number;       // 0-100 based on typical usage;
  sessionDuration: number;      // in minutes;
  activityLevel: number;        // 0-100;
  securityRequirement: number;  // 0-100;
  businessCriticality: number;  // 0-100 }
  // Session Metadata for Priority Calculations




export interface PrioritySessionData {
  sessionId: string;
  userId: string;
  deviceId: string;
  priority: SessionPriority;
  score: number;
  createdAt: Date;
  lastActivity: Date;
  accessCount: number;
  factors: PriorityFactors;
  conflicts: string;
  evictionProtection: boolean;
  emergencySession: boolean;
  gracePeriodEnd?: Date;
  // Eviction Decision




export interface EvictionDecision {
  sessionId: string;
  reason: string;
  evictionPolicy: EvictionPolicy;
  confidence: number;
  alternativeSessions: string;
  gracePeriodOffered: boolean;
  userNotificationRequired: boolean;
  // Session Conflict




export interface SessionConflict { id: string;
  type: 'user_limit' | 'device_limit' | 'total_limit' | 'resource_contention';
  affectedSessions: string;
  newSessionRequest: { }
  userId: string;
  deviceId: string;
  priority: SessionPriority;
  factors: PriorityFactors;


};
  resolutionOptions: ConflictResolution;
  recommendedResolution: ConflictResolution;
  severity: 'low' | 'medium' | 'high' | 'critical';,
  autoResolvable: boolean;
  timeoutMinutes: number;

// Priority Metrics


export interface PriorityMetrics { totalSessions: number;
  sessionsByPriority: Record<SessionPriority, number>;
  evictionRate: number;
  conflictRate: number;
  averageSessionScore: number;
  utilizationPercentage: number }

  topEvictionReasons: Array<{ reason: string; count: number }>;
  emergencyOverrides: number;
  gracePeriodUsage: number;
/**
 * Comprehensive session priority and eviction management service
 */

export class SessionPriorityManager extends EventEmitter {
  private sessions: Map<string, PrioritySessionData> = new Map();
  private userSessions: Map<string, Set<string>> = new Map();
  private deviceSessions: Map<string, Set<string>> = new Map();
  private conflicts: Map<string, SessionConflict> = new Map();
  private evictionHistory: EvictionDecision = [];
  private config: SessionPriorityConfig;
  private monitoringTimer?: NodeJS.Timeout;
  constructor(config: Partial<SessionPriorityConfig> = {}) { super();
    this.config = this.mergeConfig(config);
    this.startMonitoring();
  /**
   * Register a new session with priority management
   */
  public registerSession(sessionId: string)
  userId: string
    deviceId: string
    priority: SessionPriority }
    factors: PriorityFactors): { allowed: boolean; conflicts?: SessionConflict; evicted?: string } { // Check for conflicts
  const conflicts = this.detectConflicts(userId, deviceId, priority);
  if (conflicts.length > 0 && !this.canAutoResolve(conflicts)) {
  return {
  allowed: false
  conflicts: conflicts.filter(c => !c.autoResolvable) }
};
    // Calculate priority score
    const score = this.calculatePriorityScore(factors);
    // Create session data
    const sessionData: PrioritySessionData = { sessionId
  userId
  deviceId
  priority
  score
  createdAt: new Date()
  lastActivity: new Date()
  accessCount: 1
  factors
  conflicts: conflicts.map(c => c.id)
  evictionProtection: priority === SessionPriority.CRITICAL
  emergencySession: false
  gracePeriodEnd: undefined }
};
    // Handle auto-resolvable conflicts
    const evictedSessions: string = [];
    for (const conflict of conflicts.filter(c => c.autoResolvable)) { const resolution = this.resolveConflict(conflict);
  if (resolution.evicted) {
  evictedSessions.push(...resolution.evicted);
  // Register the session
  this.sessions.set(sessionId, sessionData);
  this.updateUserSessions(userId, sessionId);
  this.updateDeviceSessions(deviceId, sessionId);
  this.emit('sessionRegistered', { )
  sessionId
  sessionData
  evictedSessions
  conflicts: conflicts.length }
});
    return { allowed: true
  evicted: evictedSessions.length > 0 ? evictedSessions : undefined }
};
  /**
   * Update session activity and recalculate priority
   */
  public updateSessionActivity(sessionId: string)
  activityLevel: number
    newFactors?: Partial<PriorityFactors>
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.lastActivity = new Date();
    session.accessCount++;
    session.factors.activityLevel = activityLevel;
    if (newFactors) {
      session.factors = { ...session.factors, ...newFactors };
    // Recalculate priority score
    session.score = this.calculatePriorityScore(session.factors);
    this.emit('sessionActivityUpdated', { sessionId, session });
  /**
   * Detect conflicts for a new session request
   */
  public detectConflicts(userId: string)
  deviceId: string
    priority: SessionPriority): SessionConflict { 
    const conflicts: SessionConflict = [];
    // Check user session limit
    const userSessions = this.userSessions.get(userId);
    if (userSessions && userSessions.size >= this.config.maxSessionsPerUser) {
      conflicts.push(this.createConflict()
        'user_limit'
        Array.from(userSessions) }
        { userId, deviceId, priority }
      ));
    // Check device session limit
    const deviceSessionIds = this.deviceSessions.get(deviceId);
    if (deviceSessionIds && deviceSessionIds.size >= this.config.maxSessionsPerDevice) { conflicts.push(this.createConflict()
        'device_limit'
        Array.from(deviceSessionIds) }
        { userId, deviceId, priority }
      ));
    // Check total session limit
    if (this.sessions.size >= this.config.maxTotalSessions) { conflicts.push(this.createConflict()
        'total_limit'
        Array.from(this.sessions.keys()) }
        { userId, deviceId, priority }
      ));
    return conflicts;
  /**
   * Resolve a session conflict
   */
  public resolveConflict(conflict: SessionConflict): { resolved: boolean; evicted?: string; gracePeriod?: number } {
    switch (conflict.recommendedResolution) {
    case ConflictResolution.REJECT_NEW:
      return { resolved: false };
    case ConflictResolution.EVICT_OLDEST:
      return this.evictOldestSession(conflict.affectedSessions);
    case ConflictResolution.EVICT_LOWEST_PRIORITY:
      return this.evictLowestPrioritySession(conflict.affectedSessions);
    case ConflictResolution.PROMPT_USER: return this.offerUserChoice(conflict)
  default:
      return this.applyEvictionPolicy(conflict.affectedSessions);
  /**
   * Force evict a session with specified reason
   */
  public evictSession(sessionId: string)
  reason: string
    gracePeriodMinutes?: number
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;
    // Check eviction protection
    if (session.evictionProtection && !session.emergencySession) {
      this.emit('evictionBlocked', { sessionId, reason: 'protected' });
      return false;
    // Offer grace period if specified
    if (gracePeriodMinutes && gracePeriodMinutes > 0) {
      session.gracePeriodEnd = new Date(Date.now() + gracePeriodMinutes * 60 * 1000);
      this.emit('gracePeriodOffered', { sessionId, minutes: gracePeriodMinutes });
      return true;
    // Record eviction decision
    const decision: EvictionDecision = { sessionId
  reason
  evictionPolicy: this.config.evictionPolicy
  confidence: 0.9
  alternativeSessions: []
  gracePeriodOffered: false
  userNotificationRequired: true }
};
    this.evictionHistory.push(decision);
    this.removeSession(sessionId);
    this.emit('sessionEvicted', { sessionId, decision });
    return true;
  /**
   * Create emergency override session
   */
  public createEmergencySession(sessionId: string)
  userId: string
    deviceId: string
    factors: PriorityFactors): { created: boolean; evicted?: string } {
    if (!this.config.emergencyOverride) {
      return { created: false };
    // Find sessions to evict if needed
    const evictedSessions: string = [];
    const conflicts = this.detectConflicts(userId, deviceId, SessionPriority.CRITICAL);
    for (const conflict of conflicts) { const resolution = this.applyEvictionPolicy(conflict.affectedSessions);
  if (resolution.evicted) {
  evictedSessions.push(...resolution.evicted);
  // Create emergency session
  const sessionData: PrioritySessionData = {
  sessionId
  userId
  deviceId
  priority: SessionPriority.CRITICAL
  score: 100, // Maximum score
  createdAt: new Date()
  lastActivity: new Date()
  accessCount: 1
  factors
  conflicts: []
  evictionProtection: true
  emergencySession: true }
};
    this.sessions.set(sessionId, sessionData);
    this.updateUserSessions(userId, sessionId);
    this.updateDeviceSessions(deviceId, sessionId);
    this.emit('emergencySessionCreated', { sessionId, evicted: evictedSessions });
    return { created: true, evicted: evictedSessions };
  /**
   * Get session priority ranking
   */
  public getSessionRanking(): PrioritySessionData { return Array.from(this.sessions.values())
      .sort((a, b) => {
        // Sort by priority first, then by score
        if (a.priority !== b.priority) {
          return this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority);
        return b.score - a.score });
  /**
   * Get priority metrics and statistics
   */
  public getMetrics(): PriorityMetrics { const sessions = Array.from(this.sessions.values());
  const totalSessions = sessions.length;
  const sessionsByPriority = {
  [SessionPriority.CRITICAL]: 0
  [SessionPriority.HIGH]: 0
  [SessionPriority.MEDIUM]: 0
  [SessionPriority.LOW]: 0
  [SessionPriority.MINIMAL]: 0 }
};
    let totalScore = 0;
    sessions.forEach(session => { )
  sessionsByPriority[session.priority]++;
      totalScore += session.score });
    const recentEvictions = this.evictionHistory.slice(-100);
    const evictionReasons = new Map<string, number>();
    recentEvictions.forEach(eviction => { )
  evictionReasons.set(eviction.reason, (evictionReasons.get(eviction.reason) || 0) + 1) });
    const topEvictionReasons = Array.from(evictionReasons.entries());
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    return { totalSessions
  sessionsByPriority
  evictionRate: recentEvictions.length / Math.max(1, totalSessions)
  conflictRate: this.conflicts.size / Math.max(1, totalSessions)
  averageSessionScore: totalSessions > 0 ? totalScore / totalSessions : 0
  utilizationPercentage: (totalSessions / this.config.maxTotalSessions) * 100
  topEvictionReasons
  emergencyOverrides: sessions.filter(s => s.emergencySession).length
  gracePeriodUsage: sessions.filter(s => s.gracePeriodEnd).length }
};
  /**
   * Get sessions for a specific user
   */
  public getUserSessions(userId: string): PrioritySessionData {
    const sessionIds = this.userSessions.get(userId);
    if (!sessionIds) return [];
    return Array.from(sessionIds)
      .map(id => this.sessions.get(id))
      .filter((session): session is PrioritySessionData => session !== undefined);
  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<SessionPriorityConfig>): void {
    this.config = this.mergeConfig(newConfig);
    this.emit('configUpdated', { config: this.config });
  // Private helper methods
  private mergeConfig(config: Partial<SessionPriorityConfig>): SessionPriorityConfig { return {
  maxSessionsPerUser: 3
  maxSessionsPerDevice: 2
  maxTotalSessions: 1000
  evictionPolicy: EvictionPolicy.HYBRID
  conflictResolution: ConflictResolution.EVICT_OLDEST
  priorityWeights: {
  userRole: 0.25
  deviceTrust: 0.15
  location: 0.1
  timeOfDay: 0.05
  sessionAge: 0.1
  activityLevel: 0.2
  securityLevel: 0.15 }

  emergencyOverride: true
      gracePeriodMinutes: 5
      ...config
    };
  private calculatePriorityScore(factors: PriorityFactors): number { const weights = this.config.priorityWeights;
    const roleScore = this.getRoleScore(factors.userRole);
    return Math.min(100, Math.max(0)
      roleScore * weights.userRole +
      factors.deviceTrustLevel * weights.deviceTrust +
      factors.locationFamiliarity * weights.location +
      factors.timeOfDayScore * weights.timeOfDay +
      this.getAgeScore(factors.sessionDuration) * weights.sessionAge +
      factors.activityLevel * weights.activityLevel +
      factors.securityRequirement * weights.securityLevel
    ));
  private getRoleScore(role: string): number {
    switch (role) {
    case 'admin': return 100;
    case 'moderator': return 80;
    case 'user': return 60;
    case 'guest': return 30;
    default: return 40;
  private getAgeScore(durationMinutes: number): number {
    // Newer sessions get higher scores, but with diminishing returns
    return Math.max(0, 100 - (durationMinutes / 60) * 10);
  private getPriorityWeight(priority: SessionPriority): number {
    switch (priority) {
    case SessionPriority.CRITICAL: return 100;
    case SessionPriority.HIGH: return 80;
    case SessionPriority.MEDIUM: return 60;
    case SessionPriority.LOW: return 40;
    case SessionPriority.MINIMAL: return 20
  default: return 50;
  private createConflict(type: SessionConflict['type'](;
  affectedSessions: string }
    newRequest: { userId: string; deviceId: string; priority: SessionPriority }
  ): SessionConflict {
    const conflictId = `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
    const conflict: SessionConflict = { 
  id: conflictId
  type
  affectedSessions
  newSessionRequest: {
  ...newRequest
  factors: {
  userRole: 'user'
  deviceTrustLevel: 50
  locationFamiliarity: 50
  timeOfDayScore: 50
  sessionDuration: 0
  activityLevel: 50
  securityRequirement: 50
  businessCriticality: 50 }

  resolutionOptions: [ConflictResolution.EVICT_OLDEST, ConflictResolution.EVICT_LOWEST_PRIORITY]
      recommendedResolution: this.config.conflictResolution
      severity: 'medium'
      autoResolvable: true
      timeoutMinutes: this.config.gracePeriodMinutes;
  };
    this.conflicts.set(conflictId, conflict);
    return conflict;
  private canAutoResolve(conflicts: SessionConflict): boolean {
    return conflicts.every(conflict => conflict.autoResolvable);
  private applyEvictionPolicy(candidateSessions: string): { resolved: boolean; evicted?: string } {
    if (candidateSessions.length === 0) {
      return { resolved: false };
    const sessions = candidateSessions;
      .map(id => this.sessions.get(id))
      .filter((session): session is PrioritySessionData => session !== undefined);
    let sessionToEvict: PrioritySessionData;
    switch (this.config.evictionPolicy) { case EvictionPolicy.LRU:
  sessionToEvict = sessions.reduce((oldest, current) =>
  current.lastActivity < oldest.lastActivity ? current : oldest);
  break;
  case EvictionPolicy.LFU:,
  sessionToEvict = sessions.reduce((least, current) =>
  current.accessCount < least.accessCount ? current : least);
  break;
  case EvictionPolicy.PRIORITY_BASED:,
  sessionToEvict = sessions.reduce((lowest, current) =>
  current.score < lowest.score ? current : lowest);
  break;
  case EvictionPolicy.HYBRID: }
  sessionToEvict = sessions.reduce((best, current) => { const currentScore = this.calculateHybridScore(current);
  const bestScore = this.calculateHybridScore(best);
  return currentScore < bestScore ? current : best });
      break;
    case EvictionPolicy.FIFO:
      sessionToEvict = sessions.reduce((oldest, current) => 
        current.createdAt < oldest.createdAt ? current : oldest
      );
      break;
    case EvictionPolicy.ACTIVITY_BASED:
      sessionToEvict = sessions.reduce((least, current) => 
        current.factors.activityLevel < least.factors.activityLevel ? current : least
      );
      break;
    default:
      sessionToEvict = sessions[0];
    if (sessionToEvict.evictionProtection) {
      return { resolved: false };
    this.evictSession(sessionToEvict.sessionId, `eviction_policy_${this.config.evictionPolicy}`);}
    return { resolved: true, evicted: [sessionToEvict.sessionId] };
  private calculateHybridScore(session: PrioritySessionData): number {
    const ageScore = (Date.now() - session.lastActivity.getTime()) / 1000 / 60; // Minutes since last activity;
    const frequencyScore = 100 / Math.max(1, session.accessCount);
    const priorityScore = 100 - session.score;
    return (ageScore * 0.4) + (frequencyScore * 0.3) + (priorityScore * 0.3);
  private evictOldestSession(sessionIds: string): { resolved: boolean; evicted?: string } {
    return this.applyEvictionPolicy(sessionIds);
  private evictLowestPrioritySession(sessionIds: string): { resolved: boolean; evicted?: string } {
    const sessions = sessionIds;
      .map(id => this.sessions.get(id))
      .filter((session): session is PrioritySessionData => session !== undefined);
    const lowestPriority = sessions.reduce((lowest, current) => ;
      current.score < lowest.score ? current : lowest
    );
    if (lowestPriority.evictionProtection) {
      return { resolved: false };
    this.evictSession(lowestPriority.sessionId, 'lowest_priority');
    return { resolved: true, evicted: [lowestPriority.sessionId] };
  private offerUserChoice(conflict: SessionConflict): { resolved: boolean; gracePeriod?: number } {
    // In a real implementation, this would trigger user notification
    this.emit('userChoiceRequired', { conflict });
    return { resolved: false, gracePeriod: this.config.gracePeriodMinutes };
  private updateUserSessions(userId: string, sessionId: string): void { if (!this.userSessions.has(userId)) {
  this.userSessions.set(userId, new Set());
  this.userSessions.get(userId)!.add(sessionId);
  private updateDeviceSessions(deviceId: string, sessionId: string): void {,
  if (!this.deviceSessions.has(deviceId)) {
  this.deviceSessions.set(deviceId, new Set());
  this.deviceSessions.get(deviceId)!.add(sessionId);
  private removeSession(sessionId: string): void {,
  const session = this.sessions.get(sessionId);
  if (!session) return;
  // Remove from mappings
  this.userSessions.get(session.userId)?.delete(sessionId);
  this.deviceSessions.get(session.deviceId)?.delete(sessionId);
  // Clean up empty sets
  if (this.userSessions.get(session.userId)?.size === 0) {
  this.userSessions.delete(session.userId);
  if (this.deviceSessions.get(session.deviceId)?.size === 0) {
  this.deviceSessions.delete(session.deviceId);
  this.sessions.delete(sessionId);
  private startMonitoring(): void { }
  this.monitoringTimer = setInterval(() => { this.performMaintenanceTasks() }, 60 * 1000); // Run every minute
  private performMaintenanceTasks(): void { // Check for expired grace periods
    const now = new Date();
    for (const [sessionId, session] of this.sessions) {
      if (session.gracePeriodEnd && session.gracePeriodEnd <= now) {
        this.evictSession(sessionId, 'grace_period_expired');
    // Clean up old conflicts
    const oldConflicts = Array.from(this.conflicts.entries());
      .filter(([_, conflict]) => {
        const age = now.getTime() - new Date().getTime(); // This would use conflict timestamp;
        return age > conflict.timeoutMinutes * 60 * 1000 });
    oldConflicts.forEach(([id]) => this.conflicts.delete(id));
    // Trim eviction history
    if (this.evictionHistory.length > 1000) { this.evictionHistory = this.evictionHistory.slice(-500);
  this.emit('maintenanceCompleted', {)
  expiredGracePeriods: 0,
  cleanedConflicts: oldConflicts.length,
  evictionHistorySize: this.evictionHistory.length }
});
  /**
   * Destroy the priority manager and clean up resources
   */
  public destroy(): void {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
    this.sessions.clear();
    this.userSessions.clear();
    this.deviceSessions.clear();
    this.conflicts.clear();
    this.evictionHistory = [];
    this.emit('destroyed');

// Export default instance
export const sessionPriorityManager = new SessionPriorityManager();

export default SessionPriorityManager;