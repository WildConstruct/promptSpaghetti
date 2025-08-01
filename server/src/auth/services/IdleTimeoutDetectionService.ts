/**
 * Idle Timeout Detection Service - Epic 19 Implementation
 * Advanced idle timeout detection with configurable policies and activity monitoring
 */

import { EventEmitter } from 'events';
import { RedisService } from '../database/RedisService';
import { SessionActivityTrackingService } from './SessionActivityTrackingService';



export interface IdleTimeoutPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  
  conditions: {
    userRoles?: string[];
    sessionTypes?: string[];
    deviceTypes?: string[];
    trustLevels?: string[];
    timeConditions?: {



      businessHours?: { start: string; end: string };
      weekends?: boolean;
      holidays?: boolean;
    };
    locationRestrictions?: {
      allowedCountries?: string[];
      blockedCountries?: string[];
      riskThreshold?: number;
    };
  };
  
  timeouts: {
    baseIdleTimeout: number; // seconds
    warningThreshold: number; // seconds before timeout
    gracePeriod: number; // seconds after warning
    maxIdleTime: number; // absolute maximum regardless of activity
    escalationTimeouts?: Array<{
      triggerAfter: number; // seconds of idle time
      newTimeout: number; // new timeout value
      reason: string;
>;
  };
  
  detection: {
    activityTypes: string[]; // Which activities reset idle timer
    excludeTypes?: string[]; // Activities that don't count as user activity
    minimumActivityThreshold: number; // Minimum time between activities to count
    heartbeatRequired: boolean; // Require periodic heartbeat
    heartbeatInterval: number; // seconds
  };
  
  actions: {
    onWarning: {
      notifyUser: boolean;
      notificationMethods: ('ui' | 'email' | 'push' | 'websocket')[];
      customMessage?: string;
      allowExtension: boolean;
      extensionDuration?: number; // seconds
      maxExtensions?: number;
    };
    onTimeout: {
      action: 'logout' | 'lock' | 'prompt_reauth' | 'degrade_session';
      preserveData: boolean;
      notifyUser: boolean;
      gracefulShutdown: boolean;
      redirectUrl?: string;
    };
    onGracePeriodExpiry: {
      forceLogout: boolean;
      lockAccount: boolean;
      clearSessionData: boolean;
    };
  };




export interface IdleSession {
  sessionId: string;
  userId: string;
  deviceId: string;
  
  timing: {
    lastActivity: Date;
    idleTime: number; // seconds
    warningIssuedAt?: Date;
    timeoutScheduledAt?: Date;
    gracePeriodEnds?: Date;



  };
  
  policy: {
    policyId: string;
    appliedTimeout: number;
    warningThreshold: number;
    gracePeriod: number;
  };
  
  status: {
    state: 'active' | 'idle' | 'warned' | 'timed_out' | 'grace_period' | 'terminated';
    warningsSent: number;
    extensionsGranted: number;
    heartbeatMissed: number;
    lastHeartbeat?: Date;
  };
  
  context: {
    currentLocation?: string;
    deviceType: string;
    sessionType: string;
    trustLevel: string;
    userRoles: string[];
  };
  
  activities: {
    recentActivities: Array<{
      timestamp: Date;
      type: string;
      resetIdle: boolean;
>;
    activityCount: number;
    lastResetActivity?: Date;
  };




export interface TimeoutEvent {
  id: string;
  sessionId: string;
  userId: string;
  timestamp: Date;
  
  event: {
    type: 'idle_detected' | 'warning_sent' | 'timeout_triggered' | 
          'extension_granted' | 'activity_resumed' | 'force_logout';
    severity: 'info' | 'warning' | 'error';
    details: Record<string, any>;



  };
  
  session: {
    idleDuration: number;
    totalSessionTime: number;
    activitiesInSession: number;
    policyApplied: string;
  };
  
  outcome: {
    success: boolean;
    action?: string;
    error?: string;
    userResponse?: 'acknowledged' | 'extended' | 'ignored';
  };




export interface IdleStatistics {
  timeRange: { start: Date; end: Date };
  
  overview: {
    totalSessions: number;
    idleSessions: number;
    timedOutSessions: number;
    averageIdleTime: number;
    extensionsGranted: number;
  };
  
  patterns: {
    peakIdleHours: Array<{ hour: number; count: number }>;
    commonIdleDurations: Array<{ duration: number; count: number }>;
    deviceTypeBreakdown: Record<string, {
      idleRate: number;
      averageIdleTime: number;
      timeoutRate: number;
>;
  };
  
  policies: {
    byPolicy: Record<string, {
      sessionsApplied: number;
      averageIdleTime: number;
      timeoutRate: number;
      extensionRate: number;
>;
    effectiveness: Array<{
      policyId: string;
      effectiveness: number; // 0-100
      recommendations: string[];
>;
  };


export class IdleTimeoutDetectionService extends EventEmitter {
  private redis: RedisService;
  private activityService: SessionActivityTrackingService;
  private policies: Map<string, IdleTimeoutPolicy> = new Map();
  private idleSessions: Map<string, IdleSession> = new Map();
  private timeoutEvents: TimeoutEvent[] = [];
  private monitoringInterval: NodeJS.Timeout;
  private heartbeatInterval: NodeJS.Timeout;
  private config: {
    monitoringFrequency: number; // milliseconds
    eventRetention: number; // days
    batchSize: number;
    enableHeartbeat: boolean;
    heartbeatGracePeriod: number; // seconds
  };

  constructor(
    redis: RedisService,
    activityService: SessionActivityTrackingService,
    config?: Partial<IdleTimeoutDetectionService['config']>
  ) {
    super();
    this.redis = redis;
    this.activityService = activityService;
    this.config = {
      monitoringFrequency: 30000, // 30 seconds
      eventRetention: 30, // 30 days
      batchSize: 100,
      enableHeartbeat: true,
      heartbeatGracePeriod: 60,
      ...config
    };
    
    this.initializeDefaultPolicies();
    this.startMonitoring();
    this.startHeartbeatMonitoring();
    this.setupActivityListeners();


  /**
   * Register a new idle timeout policy
   */
  async registerPolicy(
    policyData: Omit<IdleTimeoutPolicy, 'id'>,
    createdBy: string
  ): Promise<IdleTimeoutPolicy> {

    const policy: IdleTimeoutPolicy = {
      ...policyData,
      id: this.generatePolicyId()
    };

    await this.validatePolicy(policy);
    this.policies.set(policy.id, policy);

    await this.logEvent('policy_registered', '', createdBy, {
      policyId: policy.id,
      policyName: policy.name,
      baseTimeout: policy.timeouts.baseIdleTimeout
    });

    this.emit('policyRegistered', policy);
    return policy;


  /**
   * Initialize idle timeout monitoring for a session
   */
  async initializeSession(
    sessionId: string,
    userId: string,
    context: {
      deviceType: string;
      sessionType: string;
      trustLevel: string;
      userRoles: string[];
      location?: string;
    }
  ): Promise<{
    success: boolean;
    policy?: IdleTimeoutPolicy;
    initialTimeout?: number;
    message?: string;
> {

    try {
      // Find applicable policy
      const policy = await this.findApplicablePolicy(context);
      if (!policy) {
        return {
          success: false,
          message: 'No applicable idle timeout policy found'
        };


      // Create idle session tracking
      const idleSession: IdleSession = {
        sessionId,
        userId,
        deviceId: `device-${userId}`, // Would get from session service
        timing: {
          lastActivity: new Date(),
          idleTime: 0

        policy: {
          policyId: policy.id,
          appliedTimeout: policy.timeouts.baseIdleTimeout,
          warningThreshold: policy.timeouts.warningThreshold,
          gracePeriod: policy.timeouts.gracePeriod

        status: {
          state: 'active',
          warningsSent: 0,
          extensionsGranted: 0,
          heartbeatMissed: 0

        context,
        activities: {
          recentActivities: [],
          activityCount: 0

      };

      // Store session
      this.idleSessions.set(sessionId, idleSession);

      // Set up Redis tracking
      await this.setupRedisTracking(sessionId, policy);

      await this.logEvent('session_initialized', sessionId, userId, {
        policyId: policy.id,
        initialTimeout: policy.timeouts.baseIdleTimeout,
        deviceType: context.deviceType
      });

      this.emit('sessionInitialized', {
        sessionId,
        userId,
        policy: policy.name,
        timeout: policy.timeouts.baseIdleTimeout
      });

      return {
        success: true,
        policy,
        initialTimeout: policy.timeouts.baseIdleTimeout
      };
 catch (error) {
      console.error('Error initializing idle session:', error);
      return {
        success: false,
        message: 'Failed to initialize idle timeout monitoring'
      };



  /**
   * Record activity and reset idle timer
   */
  async recordActivity(
    sessionId: string,
    activityType: string,
    metadata: {
      timestamp?: Date;
      resetIdle?: boolean;
      userInitiated?: boolean;
 = {}
  ): Promise<{
    idleReset: boolean;
    currentIdleTime: number;
    timeToWarning: number;
    timeToTimeout: number;
> {

    const session = this.idleSessions.get(sessionId);
    if (!session) {
      return {
        idleReset: false,
        currentIdleTime: 0,
        timeToWarning: 0,
        timeToTimeout: 0
      };


    const now = metadata.timestamp || new Date();
    const policy = this.policies.get(session.policy.policyId);
    if (!policy) {
      return {
        idleReset: false,
        currentIdleTime: session.timing.idleTime,
        timeToWarning: 0,
        timeToTimeout: 0
      };


    // Check if this activity type resets idle timer
    const shouldReset = metadata.resetIdle !== false && 
                       policy.detection.activityTypes.includes(activityType) &&
                       !policy.detection.excludeTypes?.includes(activityType);

    // Check minimum activity threshold
    if (shouldReset && session.timing.lastActivity) {
      const timeSinceLastActivity = now.getTime() - session.timing.lastActivity.getTime();
      if (timeSinceLastActivity < policy.detection.minimumActivityThreshold * 1000) {
        // Too soon after last activity, don't reset
        return {
          idleReset: false,
          currentIdleTime: session.timing.idleTime,
          timeToWarning: Math.max(0, policy.timeouts.warningThreshold - session.timing.idleTime),
          timeToTimeout: Math.max(0, session.policy.appliedTimeout - session.timing.idleTime)
        };



    // Record activity
    session.activities.recentActivities.push({
      timestamp: now,
      type: activityType,
      resetIdle: shouldReset
    });

    // Keep only recent activities
    if (session.activities.recentActivities.length > 100) {
      session.activities.recentActivities.shift();


    session.activities.activityCount++;

    if (shouldReset) {
      // Reset idle timer
      session.timing.lastActivity = now;
      session.timing.idleTime = 0;
      session.activities.lastResetActivity = now;
      
      // Clear any pending warnings/timeouts
      if (session.status.state === 'warned' || session.status.state === 'grace_period') {
        session.status.state = 'active';
        await this.cancelScheduledTimeout(sessionId);


      // Update Redis
      await this.updateRedisActivity(sessionId, now);

      await this.logEvent('activity_recorded', sessionId, session.userId, {
        activityType,
        idleReset: true,
        previousIdleTime: session.timing.idleTime
      });

      this.emit('idleReset', {
        sessionId,
        userId: session.userId,
        activityType,
        previousIdleTime: session.timing.idleTime
      });


    return {
      idleReset: shouldReset,
      currentIdleTime: session.timing.idleTime,
      timeToWarning: Math.max(0, policy.timeouts.warningThreshold - session.timing.idleTime),
      timeToTimeout: Math.max(0, session.policy.appliedTimeout - session.timing.idleTime)
    };


  /**
   * Process heartbeat from client
   */
  async processHeartbeat(
    sessionId: string,
    clientTimestamp?: Date
  ): Promise<{
    acknowledged: boolean;
    serverTime: Date;
    idleTime: number;
    timeToWarning: number;
> {

    const session = this.idleSessions.get(sessionId);
    if (!session) {
      return {
        acknowledged: false,
        serverTime: new Date(),
        idleTime: 0,
        timeToWarning: 0
      };


    const now = new Date();
    session.status.lastHeartbeat = now;
    session.status.heartbeatMissed = 0;

    // Update Redis heartbeat
    await this.redis.setex(`heartbeat:${sessionId}`, 300, now.toISOString()); // 5 minute TTL

    const policy = this.policies.get(session.policy.policyId);
    const timeToWarning = policy ? 
      Math.max(0, policy.timeouts.warningThreshold - session.timing.idleTime) : 0;

    return {
      acknowledged: true,
      serverTime: now,
      idleTime: session.timing.idleTime,
      timeToWarning
    };


  /**
   * Grant session extension for warned session
   */
  async grantExtension(
    sessionId: string,
    requestedBy: string,
    extensionDuration?: number
  ): Promise<{
    success: boolean;
    newTimeout?: number;
    extensionsRemaining?: number;
    message: string;
> {

    const session = this.idleSessions.get(sessionId);
    if (!session) {
      return {
        success: false,
        message: 'Session not found'
      };


    const policy = this.policies.get(session.policy.policyId);
    if (!policy) {
      return {
        success: false,
        message: 'Policy not found'
      };


    // Check if extensions are allowed
    if (!policy.actions.onWarning.allowExtension) {
      return {
        success: false,
        message: 'Extensions not allowed by policy'
      };


    // Check extension limit
    const maxExtensions = policy.actions.onWarning.maxExtensions || 3;
    if (session.status.extensionsGranted >= maxExtensions) {
      return {
        success: false,
        message: `Maximum extensions (${maxExtensions}) already granted`
      };


    // Calculate extension duration
    const duration = extensionDuration || policy.actions.onWarning.extensionDuration || 300; // 5 minutes default
    
    // Reset idle timer and extend timeout
    session.timing.lastActivity = new Date();
    session.timing.idleTime = 0;
    session.policy.appliedTimeout += duration;
    session.status.extensionsGranted++;
    session.status.state = 'active';

    // Cancel any scheduled timeouts
    await this.cancelScheduledTimeout(sessionId);

    await this.logEvent('extension_granted', sessionId, requestedBy, {
      extensionDuration: duration,
      extensionsGranted: session.status.extensionsGranted,
      newTimeout: session.policy.appliedTimeout
    });

    this.emit('extensionGranted', {
      sessionId,
      userId: session.userId,
      duration,
      extensionsRemaining: maxExtensions - session.status.extensionsGranted
    });

    return {
      success: true,
      newTimeout: session.policy.appliedTimeout,
      extensionsRemaining: maxExtensions - session.status.extensionsGranted,
      message: `Session extended by ${duration} seconds`
    };


  /**
   * Get idle statistics and analytics
   */
  async getIdleStatistics(
    timeRange: { start: Date; end: Date },
    filters?: {
      userIds?: string[];
      deviceTypes?: string[];
      policies?: string[];
    }
  ): Promise<IdleStatistics> {

    try {
      // Filter events by time range and criteria
      const filteredEvents = this.timeoutEvents.filter(event => {
        if (event.timestamp < timeRange.start || event.timestamp > timeRange.end) {
          return false;

        
        if (filters?.userIds && !filters.userIds.includes(event.userId)) {
          return false;

        
        if (filters?.policies && !filters.policies.includes(event.session.policyApplied)) {
          return false;

        
        return true;
      });

      // Calculate overview statistics
      const sessionEvents = filteredEvents.filter(e => e.event.type === 'idle_detected');
      const timeoutEvents = filteredEvents.filter(e => e.event.type === 'timeout_triggered');
      const extensionEvents = filteredEvents.filter(e => e.event.type === 'extension_granted');

      const overview = {
        totalSessions: new Set(sessionEvents.map(e => e.sessionId)).size,
        idleSessions: sessionEvents.length,
        timedOutSessions: timeoutEvents.length,
        averageIdleTime: this.calculateAverageIdleTime(sessionEvents),
        extensionsGranted: extensionEvents.length
      };

      // Calculate patterns
      const patterns = {
        peakIdleHours: this.calculatePeakIdleHours(sessionEvents),
        commonIdleDurations: this.calculateCommonIdleDurations(sessionEvents),
        deviceTypeBreakdown: await this.calculateDeviceBreakdown(filteredEvents)
      };

      // Calculate policy effectiveness
      const policies = {
        byPolicy: this.calculatePolicyStats(filteredEvents),
        effectiveness: await this.calculatePolicyEffectiveness(filteredEvents)
      };

      return {
        timeRange,
        overview,
        patterns,
        policies
      };
 catch (error) {
      console.error('Error generating idle statistics:', error);
      throw new Error('Failed to generate idle statistics');



  // Private helper methods

  private async startMonitoring(): Promise<void> {

    this.monitoringInterval = setInterval(async () => {
      await this.performIdleCheck();
    }, this.config.monitoringFrequency);


  private async performIdleCheck(): Promise<void> {

    const now = new Date();
    const sessionsToCheck = Array.from(this.idleSessions.values());

    for (const session of sessionsToCheck) {
      try {
        await this.checkSessionIdle(session, now);
 catch (error) {
        console.error(`Error checking idle for session ${session.sessionId}:`, error);




  private async checkSessionIdle(session: IdleSession, now: Date): Promise<void> {

    const policy = this.policies.get(session.policy.policyId);
    if (!policy || !policy.enabled) return;

    // Calculate current idle time
    const idleTime = (now.getTime() - session.timing.lastActivity.getTime()) / 1000;
    session.timing.idleTime = idleTime;

    // Check heartbeat if required
    if (policy.detection.heartbeatRequired) {
      await this.checkHeartbeat(session, now);


    // Check for timeout conditions
    if (idleTime >= session.policy.appliedTimeout) {
      await this.handleTimeout(session, 'idle_timeout');
 else if (idleTime >= policy.timeouts.warningThreshold && session.status.state === 'active') {
      await this.handleWarning(session);


    // Check for escalation timeouts
    if (policy.timeouts.escalationTimeouts) {
      for (const escalation of policy.timeouts.escalationTimeouts) {
        if (idleTime >= escalation.triggerAfter && session.policy.appliedTimeout !== escalation.newTimeout) {
          session.policy.appliedTimeout = escalation.newTimeout;
          await this.logEvent('timeout_escalated', session.sessionId, session.userId, {
            newTimeout: escalation.newTimeout,
            reason: escalation.reason,
            idleTime
          });
          break;





  private async handleWarning(session: IdleSession): Promise<void> {

    const policy = this.policies.get(session.policy.policyId);
    if (!policy) return;

    session.status.state = 'warned';
    session.status.warningsSent++;
    session.timing.warningIssuedAt = new Date();

    // Send warning notifications
    if (policy.actions.onWarning.notifyUser) {
      await this.sendIdleWarning(session, policy);


    // Schedule timeout
    const timeToTimeout = session.policy.appliedTimeout - session.timing.idleTime;
    session.timing.timeoutScheduledAt = new Date(Date.now() + timeToTimeout * 1000);

    await this.logEvent('warning_sent', session.sessionId, session.userId, {
      idleTime: session.timing.idleTime,
      timeToTimeout,
      warningCount: session.status.warningsSent
    });

    this.emit('idleWarning', {
      sessionId: session.sessionId,
      userId: session.userId,
      idleTime: session.timing.idleTime,
      timeToTimeout
    });


  private async handleTimeout(session: IdleSession, reason: string): Promise<void> {

    const policy = this.policies.get(session.policy.policyId);
    if (!policy) return;

    session.status.state = 'timed_out';

    // Apply grace period if configured
    if (policy.timeouts.gracePeriod > 0) {
      session.status.state = 'grace_period';
      session.timing.gracePeriodEnds = new Date(Date.now() + policy.timeouts.gracePeriod * 1000);
      
      // Schedule final timeout
      setTimeout(() => {
        this.handleFinalTimeout(session.sessionId);
      }, policy.timeouts.gracePeriod * 1000);
 else {
      await this.executeTimeoutAction(session, policy);


    await this.logEvent('timeout_triggered', session.sessionId, session.userId, {
      reason,
      idleTime: session.timing.idleTime,
      totalSessionTime: Date.now() - session.timing.lastActivity.getTime(),
      hasGracePeriod: policy.timeouts.gracePeriod > 0
    });

    this.emit('sessionTimeout', {
      sessionId: session.sessionId,
      userId: session.userId,
      reason,
      gracePeriod: policy.timeouts.gracePeriod
    });


  private async handleFinalTimeout(sessionId: string): Promise<void> {

    const session = this.idleSessions.get(sessionId);
    if (!session || session.status.state !== 'grace_period') return;

    const policy = this.policies.get(session.policy.policyId);
    if (!policy) return;

    await this.executeTimeoutAction(session, policy);


  private async executeTimeoutAction(session: IdleSession, policy: IdleTimeoutPolicy): Promise<void> {

    session.status.state = 'terminated';

    switch (policy.actions.onTimeout.action) {
    case 'logout':
      await this.performLogout(session, policy.actions.onTimeout.gracefulShutdown);
      break;
    case 'lock':
      await this.performSessionLock(session);
      break;
    case 'prompt_reauth':
      await this.promptReauthentication(session);
      break;
    case 'degrade_session':
      await this.degradeSession(session);
      break;


    // Clean up session tracking
    this.idleSessions.delete(session.sessionId);
    await this.cleanupRedisTracking(session.sessionId);


  private async findApplicablePolicy(context: any): Promise<IdleTimeoutPolicy | null> {

    const applicablePolicies = [];

    for (const policy of this.policies.values()) {
      if (!policy.enabled) continue;

      let isApplicable = true;

      // Check user roles
      if (policy.conditions.userRoles && context.userRoles) {
        const hasRole = policy.conditions.userRoles.some(role => 
          context.userRoles.includes(role)
        );
        if (!hasRole) isApplicable = false;


      // Check session type
      if (policy.conditions.sessionTypes && 
          !policy.conditions.sessionTypes.includes(context.sessionType)) {
        isApplicable = false;


      // Check device type
      if (policy.conditions.deviceTypes && 
          !policy.conditions.deviceTypes.includes(context.deviceType)) {
        isApplicable = false;


      // Check trust level
      if (policy.conditions.trustLevels && 
          !policy.conditions.trustLevels.includes(context.trustLevel)) {
        isApplicable = false;


      if (isApplicable) {
        applicablePolicies.push(policy);



    // Return highest priority policy
    return applicablePolicies.sort((a, b) => b.priority - a.priority)[0] || null;


  private initializeDefaultPolicies(): void {
    const policies: Array<Omit<IdleTimeoutPolicy, 'id'>> = [
      {
        name: 'Standard Session Timeout',
        description: 'Default idle timeout for regular users',
        enabled: true,
        priority: 100,
        conditions: {
          sessionTypes: ['web', 'mobile'],
          trustLevels: ['trusted', 'verified']

        timeouts: {
          baseIdleTimeout: 1800, // 30 minutes
          warningThreshold: 1500, // 25 minutes
          gracePeriod: 60, // 1 minute
          maxIdleTime: 3600 // 1 hour max

        detection: {
          activityTypes: ['page_view', 'api_call', 'interaction'],
          excludeTypes: ['heartbeat', 'ping'],
          minimumActivityThreshold: 10, // 10 seconds
          heartbeatRequired: true,
          heartbeatInterval: 60 // 1 minute

        actions: {
          onWarning: {
            notifyUser: true,
            notificationMethods: ['ui', 'websocket'],
            allowExtension: true,
            extensionDuration: 300, // 5 minutes
            maxExtensions: 2

          onTimeout: {
            action: 'logout',
            preserveData: true,
            notifyUser: true,
            gracefulShutdown: true

          onGracePeriodExpiry: {
            forceLogout: true,
            lockAccount: false,
            clearSessionData: true



      {
        name: 'High Security Timeout',
        description: 'Strict timeout for admin and privileged sessions',
        enabled: true,
        priority: 200,
        conditions: {
          sessionTypes: ['admin', 'api'],
          userRoles: ['admin', 'security'],
          trustLevels: ['verified']

        timeouts: {
          baseIdleTimeout: 900, // 15 minutes
          warningThreshold: 600, // 10 minutes
          gracePeriod: 30, // 30 seconds
          maxIdleTime: 900 // 15 minutes max

        detection: {
          activityTypes: ['api_call', 'admin_action', 'security_event'],
          excludeTypes: ['heartbeat'],
          minimumActivityThreshold: 5, // 5 seconds
          heartbeatRequired: true,
          heartbeatInterval: 30 // 30 seconds

        actions: {
          onWarning: {
            notifyUser: true,
            notificationMethods: ['ui', 'email', 'websocket'],
            allowExtension: false

          onTimeout: {
            action: 'logout',
            preserveData: false,
            notifyUser: true,
            gracefulShutdown: false

          onGracePeriodExpiry: {
            forceLogout: true,
            lockAccount: false,
            clearSessionData: true



    ];

    for (const policyData of policies) {
      const id = this.generatePolicyId();
      this.policies.set(id, { ...policyData, id });



  private async setupRedisTracking(sessionId: string, policy: IdleTimeoutPolicy): Promise<void> {

    const key = `idle:${sessionId}`;
    const data = {
      lastActivity: new Date().toISOString(),
      timeout: policy.timeouts.baseIdleTimeout,
      policyId: policy.id
    };
    
    await this.redis.hmset(key, data);
    await this.redis.expire(key, policy.timeouts.maxIdleTime);


  private async updateRedisActivity(sessionId: string, timestamp: Date): Promise<void> {

    const key = `idle:${sessionId}`;
    await this.redis.hset(key, 'lastActivity', timestamp.toISOString());


  private generatePolicyId(): string {
    return `IDLE-POL-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;


  private async logEvent(action: string, sessionId: string, userId: string, details: any): Promise<void> {

    const event: TimeoutEvent = {
      id: `IDLE-EVT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      sessionId,
      userId,
      timestamp: new Date(),
      event: {
        type: action as any,
        severity: 'info',
        details

      session: {
        idleDuration: details.idleTime || 0,
        totalSessionTime: details.totalSessionTime || 0,
        activitiesInSession: details.activityCount || 0,
        policyApplied: details.policyId || ''

      outcome: {
        success: true

    };

    this.timeoutEvents.push(event);

    // Keep only recent events
    const cutoff = new Date(Date.now() - this.config.eventRetention * 24 * 60 * 60 * 1000);
    this.timeoutEvents = this.timeoutEvents.filter(e => e.timestamp >= cutoff);

    console.log(`Idle Timeout Event: ${action} for ${sessionId}`, details);


  destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);

    this.policies.clear();
    this.idleSessions.clear();
    this.timeoutEvents = [];

