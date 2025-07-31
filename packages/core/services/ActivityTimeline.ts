/**
 * Enhanced User Activity Timeline System - Epic 17
 * 
 * Comprehensive activity tracking service that captures user interactions,
 * system events, and collaborative activities with advanced filtering,
 * analytics, and real-time updates.
 * 
 * Features:
 * - Real-time activity capture and streaming
 * - Rich activity context and metadata
 * - Advanced filtering and search capabilities
 * - Activity aggregation and analytics
 * - Collaborative activity tracking
 * - Performance monitoring integration
 * - Export and reporting capabilities
 */

}
export interface ActivityEvent {
  id: string;
  timestamp: Date;
  userId: string;
  userDisplayName?: string;
  userRole?: string;
  // Event classification
  type: ActivityType;
  category: ActivityCategory;
  action: string;
  resource?: string;
  resourceId?: string;
  // Event details
  title: string;
  description?: string;
  details: ActivityDetails;
  // Context information
  sessionId?: string;
  workspaceId?: string;
  projectId?: string;
  graphId?: string;
  nodeId?: string;
  // Technical metadata
  source: ActivitySource;
  clientInfo?: ClientInfo;
  location?: GeolocationInfo;
  // Impact and analytics
  impact: ActivityImpact;
  duration?: number; // milliseconds,
  success: boolean;
  errorMessage?: string;
  // Relationships
  parentEventId?: string;
  relatedEventIds?: string;
  causedByEventId?: string;
  // Collaboration
  collaborators?: string;
  visibility: ActivityVisibility;
  // UI and presentation
  icon?: string;
  color?: string;
  tags: string;
  // Lifecycle
  acknowledged?: boolean;
  bookmarked?: boolean;
  archived?: boolean;
}
}
}
export interface ActivityDetails {
  // Graph and node changes
  nodeChanges?: NodeChange;
  connectionChanges?: ConnectionChange;
  variableChanges?: VariableChange;
  // Content changes
  beforeValue?: unknown;
  afterValue?: unknown;
  diff?: string;
  // Performance data
  executionTime?: number;
  memoryUsage?: number;
  cacheHit?: boolean;
  // User interaction data
  mousePosition?: [number, number];
  keyboardShortcut?: string;
  clickCount?: number;
  // File and project data
  fileName?: string;
  fileSize?: number;
  filePath?: string;
  // External integrations
  externalId?: string;
  externalSource?: string;
  externalUrl?: string;
  // Custom metadata
  customData?: Record<string, unknown>;
}
}
}
export interface NodeChange {
  nodeId: string;
  nodeType: string;
  changeType: 'created' | 'updated' | 'deleted' | 'moved';
  field?: string;
  oldValue?: unknown;
  newValue?: unknown;
  position?: [number, number];
}
}
}
export interface ConnectionChange {
  connectionId: string;
  changeType: 'created' | 'deleted';
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle?: string;
  targetHandle?: string;
}
}
}
export interface VariableChange {
  variableName: string;
  oldValue?: string;
  newValue?: string;
  scope: 'global' | 'local' | 'session'
}
  }
}
export interface ClientInfo {
  userAgent: string;
  platform: string;
  browser: string;
  browserVersion: string;
  screenResolution: [number, number];
  viewport: [number, number];
  timezone: string;
  language: string;
}
}
}
export interface GeolocationInfo {
  country?: string;
  region?: string;
  city?: string;
  coordinates?: [number, number];
  timezone: string;
}
}
export type ActivityType = 
  | 'user_interaction'
  | 'system_event'
  | 'graph_operation'
  | 'file_operation'
  | 'collaboration'
  | 'authentication'
  | 'performance'
  | 'error'
  | 'admin'
  | 'integration';

export type ActivityCategory =
  | 'graph_editing'
  | 'node_manipulation'
  | 'execution'
  | 'file_management'
  | 'user_management'
  | 'collaboration'
  | 'system_health'
  | 'security'
  | 'performance'
  | 'configuration';

export type ActivitySource = 
  | 'web_ui'
  | 'mobile_app'
  | 'api'
  | 'cli'
  | 'webhook'
  | 'system'
  | 'background_task'
  | 'integration';

export type ActivityImpact = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type ActivityVisibility = 'private' | 'team' | 'workspace' | 'public';

}
export interface ActivityFilter {
  userIds?: string;
  types?: ActivityType;
  categories?: ActivityCategory;
  sources?: ActivitySource;
  workspaceIds?: string;
  projectIds?: string;
  graphIds?: string;
  dateRange?: {
  start: Date;
  end: Date;
}
};
  impactLevels?: ActivityImpact;
  successOnly?: boolean;
  errorsOnly?: boolean;
  searchQuery?: string;
  tags?: string;
  // Advanced filters
  hasCollaborators?: boolean;
  hasParent?: boolean;
  hasChildren?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'impact' | 'duration';
  sortDirection?: 'asc' | 'desc'
  }
}
export interface ActivityStats {
  totalEvents: number;
  uniqueUsers: number;
  averageSessionDuration: number;
  // Activity distribution
  byType: Record<ActivityType, number>;
  byCategory: Record<ActivityCategory, number>;
  bySource: Record<ActivitySource, number>;
  byImpact: Record<ActivityImpact, number>;
  // Time-based stats
  eventsPerHour: Record<string, number>;
  eventsPerDay: Record<string, number>;
  peakActivity: {
  hour: number;
  count: number;
}
};
  // User engagement
  mostActiveUsers: Array<{
  userId: string;
  displayName: string;
  eventCount: number;
  lastActivity: Date;
}>;
  // Performance insights
  averageExecutionTime: number;
  errorRate: number;
  cacheHitRate: number;
  // Collaboration stats
  collaborativeEvents: number;
  teamsActive: number;
  sharingEvents: number;
}
}
export interface ActivitySession {
  id: string;
  userId: string;
  workspaceId?: string;
  projectId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // milliseconds,
  eventCount: number;
  uniqueResources: string;
  clientInfo: ClientInfo;
  location?: GeolocationInfo;
  // Session classification
  type: 'work' | 'exploration' | 'collaboration' | 'admin';
  productivity: 'high' | 'medium' | 'low';
  // Key activities in session
  primaryActivities: ActivityType;
  keyEvents: string; // event IDs,
  // Outcomes
  goalsAchieved?: string;
  tasksCompleted?: string;
  errorsEncountered?: number;
  /**
  * Enhanced Activity Timeline Service
  */
}
}
export class ActivityTimelineService {
  private static instance: ActivityTimelineService;
  private activities: Map<string, ActivityEvent> = new Map();
  private sessions: Map<string, ActivitySession> = new Map();
  private listeners: Map<string, (event: ActivityEvent) => void> = new Map();
  private currentSession: ActivitySession | null = null;
  private constructor() {
    this.initializeSession();
    this.startBackgroundProcessing();
  static getInstance(): ActivityTimelineService {
    if (!ActivityTimelineService.instance) {
      ActivityTimelineService.instance = new ActivityTimelineService();
    return ActivityTimelineService.instance;
  /**
   * Track a new activity event
   */
  async trackActivity(event: Partial<ActivityEvent>): Promise<ActivityEvent> {

    const fullEvent: ActivityEvent = {,
  id: this.generateEventId(),
      timestamp: new Date(),
      userId: event.userId || 'anonymous',
      type: event.type || 'user_interaction',
      category: event.category || 'graph_editing',
      action: event.action || 'unknown',
      title: event.title || 'Activity',
      details: event.details || {},
      source: event.source || 'web_ui',
      impact: event.impact || 'low',
      success: event.success !== false,
      visibility: event.visibility || 'private',
      tags: event.tags || [],
      ...event
    };
    // Store the event
    this.activities.set(fullEvent.id, fullEvent);
    // Update current session
    this.updateCurrentSession(fullEvent);
    // Process event for insights
    await this.processEventInsights(fullEvent);
    // Notify listeners
    this.notifyListeners(fullEvent);
    // Emit for external integrations
    this.emitActivity(fullEvent);
    return fullEvent;
  /**
   * Track a graph operation
   */
  async trackGraphOperation(action: string)
    details: Partial<ActivityDetails> & {,
  nodeChanges?: NodeChange;
  connectionChanges?: ConnectionChange;
  variableChanges?: VariableChange;
},
  userId: string,
    context?: {
  workspaceId?: string;
  projectId?: string;
  graphId?: string;
  ): Promise<ActivityEvent> {,
  return this.trackActivity({)
  type: 'graph_operation',
  category: 'graph_editing',
  action,
  title: this.generateGraphOperationTitle(action, details),
  description: this.generateGraphOperationDescription(action, details),
  details,
  userId,
  impact: this.calculateGraphOperationImpact(details),
  tags: this.generateGraphOperationTags(action, details),
  ...context
});
  /**
   * Track user interaction
   */
  async trackUserInteraction(action: string)
    element: string,
    details: Partial<ActivityDetails> = {},
    userId: string,
    context?: Record<string, unknown>
  ): Promise<ActivityEvent> {

    return this.trackActivity({)
  type: 'user_interaction',
      category: this.categorizeUserInteraction(action),
      action,
      title: `${action} ${element}`}
},
  resource: element,
      details: {
  ...details,
  interactionType: action,
  element,
  ...context
}
      userId,
      impact: 'low',
      tags: ['interaction', action, element]
    });
  /**
   * Track performance event
   */
  async trackPerformance(operation: string)
    duration: number,
    success: boolean,
    details: Partial<ActivityDetails> = {},
    userId?: string
  ): Promise<ActivityEvent> {

    return this.trackActivity({)
  type: 'performance',
      category: 'system_health',
      action: `performance_${operation}`}
},
  title: `${operation} completed in ${duration}ms`}
}
      duration,
      success,
      details: {
  ...details,
  executionTime: duration,
  operation
},
  userId: userId || 'system',
      impact: this.calculatePerformanceImpact(duration, success),
      tags: ['performance', operation, success ? 'success' : 'error']
    });
  /**
   * Track collaboration event
   */
  async trackCollaboration(action: string)
    collaborators: string,
    resource: string,
    details: Partial<ActivityDetails> = {},
    userId: string,
    context?: Record<string, unknown>
  ): Promise<ActivityEvent> {

    return this.trackActivity({)
  type: 'collaboration',
      category: 'collaboration',
      action,
      title: `${action} ${resource} with ${collaborators.length} collaborators`}
}
      resource,
      details: {
  ...details,
  collaboratorCount: collaborators.length,
}
      userId,
      collaborators,
      impact: 'medium',
      visibility: 'team',
      tags: ['collaboration', action, 'team'],
      ...context
    });
  /**
   * Get activities with filtering
   */
  getActivities(filter?: ActivityFilter): ActivityEvent {
    let activities = Array.from(this.activities.values());
    if (!filter) {
      return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    // Apply filters
    if (filter.userIds?.length) {
      activities = activities.filter(a => filter.userIds!.includes(a.userId));
    if (filter.types?.length) {
      activities = activities.filter(a => filter.types!.includes(a.type));
    if (filter.categories?.length) {
      activities = activities.filter(a => filter.categories!.includes(a.category));
    if (filter.sources?.length) {
      activities = activities.filter(a => filter.sources!.includes(a.source));
    if (filter.workspaceIds?.length) {
      activities = activities.filter(a => )
        a.workspaceId && filter.workspaceIds!.includes(a.workspaceId)
      );
    if (filter.projectIds?.length) {
      activities = activities.filter(a => )
        a.projectId && filter.projectIds!.includes(a.projectId)
      );
    if (filter.graphIds?.length) {
      activities = activities.filter(a => )
        a.graphId && filter.graphIds!.includes(a.graphId)
      );
    if (filter.dateRange) {
      activities = activities.filter(a => )
        a.timestamp >= filter.dateRange!.start &&
        a.timestamp <= filter.dateRange!.end
      );
    if (filter.impactLevels?.length) {
      activities = activities.filter(a => filter.impactLevels!.includes(a.impact));
    if (filter.successOnly) {
      activities = activities.filter(a => a.success);
    if (filter.errorsOnly) {
      activities = activities.filter(a => !a.success);
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      activities = activities.filter(a => )
        a.title.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.action.toLowerCase().includes(query) ||
        a.tags.some(tag => tag.toLowerCase().includes(query))
      );
    if (filter.tags?.length) {
      activities = activities.filter(a => )
        filter.tags!.some(tag => a.tags.includes(tag))
      );
    if (filter.hasCollaborators !== undefined) {
      activities = activities.filter(a => )
        filter.hasCollaborators ? 
          (a.collaborators && a.collaborators.length > 0) : 
          (!a.collaborators || a.collaborators.length === 0)
      );
    if (filter.hasParent !== undefined) {
      activities = activities.filter(a => )
        filter.hasParent ? !!a.parentEventId : !a.parentEventId
      );
    if (filter.hasChildren !== undefined) {
      activities = activities.filter(a => )
        filter.hasChildren ? 
          activities.some(child => child.parentEventId === a.id) :
          !activities.some(child => child.parentEventId === a.id)
      );
    // Sort results
    const sortBy = filter.sortBy || 'timestamp';
    const sortDirection = filter.sortDirection || 'desc';
    activities.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
      case 'timestamp':
        comparison = a.timestamp.getTime() - b.timestamp.getTime();
        break;
      case 'impact':
        const impactOrder = { none: 0, low: 1, medium: 2, high: 3, critical: 4 };
        comparison = impactOrder[a.impact] - impactOrder[b.impact];
        break;
      case 'duration':
        comparison = (a.duration || 0) - (b.duration || 0);
        break;
      return sortDirection === 'desc' ? -comparison : comparison;
    });
    // Apply limit and offset
    if (filter.offset || filter.limit) {
      const start = filter.offset || 0;
      const end = filter.limit ? start + filter.limit : undefined;
      activities = activities.slice(start, end);
    return activities;
  /**
   * Get activity statistics
   */
  getActivityStats(filter?: ActivityFilter): ActivityStats {
    const activities = filter ? this.getActivities(filter) : Array.from(this.activities.values());
    // Calculate basic stats
    const uniqueUsers = new Set(activities.map(a => a.userId)).size;
    const sessions = Array.from(this.sessions.values());
    const averageSessionDuration = sessions.length > 0 ;
      ? sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length 
      : 0;
    // Time-based analysis
    const eventsPerHour: Record<string, number> = {};
    const eventsPerDay: Record<string, number> = {};
    activities.forEach(activity => {)
  const hour = activity.timestamp.getHours().toString();
      const day = activity.timestamp.toISOString().split('T')[0];
      eventsPerHour[hour] = (eventsPerHour[hour] || 0) + 1;
      eventsPerDay[day] = (eventsPerDay[day] || 0) + 1;
    });
    // Find peak activity hour
    const peakHour = Object.entries(eventsPerHour);
      .reduce((peak, [hour, count]) => 
        count > peak.count ? { hour: parseInt(hour), count } : peak,
      { hour: 0, count: 0 }
      );
    // Most active users
    const userActivity: Record<string, { count: number; lastActivity: Date; displayName: string }> = {};
    activities.forEach(activity => {)
  const userId = activity.userId;
  if (!userActivity[userId]) {
  userActivity[userId] = {
  count: 0,
  lastActivity: activity.timestamp,
  displayName: activity.userDisplayName || userId,
};
      userActivity[userId].count++;
      if (activity.timestamp > userActivity[userId].lastActivity) {
        userActivity[userId].lastActivity = activity.timestamp;
    });
    const mostActiveUsers = Object.entries(userActivity);
      .map(([userId, data]) => ({)
  userId,
  displayName: data.displayName,
  eventCount: data.count,
  lastActivity: data.lastActivity,
}))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);
    // Performance metrics
    const performanceEvents = activities.filter(a => a.type === 'performance');
    const averageExecutionTime = performanceEvents.length > 0;
      ? performanceEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / performanceEvents.length
      : 0;
    const errorRate = activities.length > 0;
      ? (activities.filter(a => !a.success).length / activities.length) * 100
      : 0;
    const cacheEvents = activities.filter(a => a.details.cacheHit !== undefined);
    const cacheHitRate = cacheEvents.length > 0;
      ? (cacheEvents.filter(a => a.details.cacheHit).length / cacheEvents.length) * 100
      : 0;
    // Collaboration stats
    const collaborativeEvents = activities.filter(a => a.type === 'collaboration').length;
    const teamsActive = new Set(;);
      activities
        .filter(a => a.workspaceId)
        .map(a => a.workspaceId)
    ).size;
    const sharingEvents = activities.filter(a => ;);
      a.action.includes('share') || a.visibility === 'public' || a.visibility === 'team'
    ).length;
    return {
  totalEvents: activities.length,
  uniqueUsers,
  averageSessionDuration,
  byType: this.groupByField(activities, 'type'),
  byCategory: this.groupByField(activities, 'category'),
  bySource: this.groupByField(activities, 'source'),
  byImpact: this.groupByField(activities, 'impact'),
  eventsPerHour,
  eventsPerDay,
  peakActivity: peakHour,
  mostActiveUsers,
  averageExecutionTime,
  errorRate,
  cacheHitRate,
  collaborativeEvents,
  teamsActive,
  sharingEvents
};
  /**
   * Get user activity timeline
   */
  getUserTimeline(userId: string, filter?: Partial<ActivityFilter>): ActivityEvent {
  return this.getActivities({)
  ...filter,
  userIds: [userId],
});
  /**
   * Get collaborative activities
   */
  getCollaborativeActivities(workspaceId?: string, filter?: Partial<ActivityFilter>): ActivityEvent {
  return this.getActivities({)
  ...filter,
  types: ['collaboration'],
  workspaceIds: workspaceId ? [workspaceId] : filter?.workspaceIds,
});
  /**
   * Subscribe to activity events
   */
  subscribe(listenerId: string, callback: (event: ActivityEvent) => void): void {
  this.listeners.set(listenerId, callback);
  /**
  * Unsubscribe from activity events
  */
  unsubscribe(listenerId: string): void {,
  this.listeners.delete(listenerId);
  /**
  * Start a new user session
  */
  startSession(userId: string, clientInfo: ClientInfo, context?: {)
  workspaceId?: string;
  projectId?: string;
  location?: GeolocationInfo;
}): ActivitySession {
  // End current session if exists
  if (this.currentSession && !this.currentSession.endTime) {
  this.endSession();
  const session: ActivitySession = {,
  id: this.generateSessionId(),
  userId,
  workspaceId: context?.workspaceId,
  projectId: context?.projectId,
  startTime: new Date(),
  eventCount: 0,
  uniqueResources: [],
  clientInfo,
  location: context?.location,
  type: 'work',
  productivity: 'medium',
  primaryActivities: [],
};
    this.sessions.set(session.id, session);
    this.currentSession = session;
    // Track session start
    this.trackActivity({)
  type: 'system_event',
  category: 'user_management',
  action: 'session_started',
  title: 'User session started',
  userId,
  sessionId: session.id,
  workspaceId: context?.workspaceId,
  projectId: context?.projectId,
  impact: 'low',
  tags: ['session', 'start'],
});
    return session;
  /**
   * End current user session
   */
  endSession(): ActivitySession | null {
    if (!this.currentSession) return null;
    const session = this.currentSession;
    session.endTime = new Date();
    session.duration = session.endTime.getTime() - session.startTime.getTime();
    // Analyze session
    this.analyzeSession(session);
    // Track session end
    this.trackActivity({)
  type: 'system_event',
      category: 'user_management',
      action: 'session_ended',
      title: `User session ended (${Math.round(session.duration / 1000 / 60)}m)`}
},
  userId: session.userId,
      sessionId: session.id,
      duration: session.duration,
      impact: 'low',
      tags: ['session', 'end']
    });
    this.sessions.set(session.id, session);
    this.currentSession = null;
    return session;
  // Private methods
  private generateEventId(): string {
    return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  private initializeSession(): void {
  // Initialize with basic client info
  const clientInfo: ClientInfo = {,
  userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
  platform: typeof navigator !== 'undefined' ? navigator.platform : 'Server',
  browser: 'Unknown',
  browserVersion: '1.0',
  screenResolution: [1920, 1080],
  viewport: [1920, 1080],
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  language: typeof navigator !== 'undefined' ? navigator.language : 'en',
};
    // Start anonymous session
    this.startSession('anonymous', clientInfo);
  private updateCurrentSession(event: ActivityEvent): void {
  if (!this.currentSession) return;
  this.currentSession.eventCount++;
  if (event.resource && !this.currentSession.uniqueResources.includes(event.resource)) {
  this.currentSession.uniqueResources.push(event.resource);
  if (!this.currentSession.primaryActivities.includes(event.type)) {
  this.currentSession.primaryActivities.push(event.type);
  this.sessions.set(this.currentSession.id, this.currentSession);
  private async processEventInsights(event: ActivityEvent): Promise<void> {,
  // Process event for patterns, anomalies, and insights
  // This could include ML-based analysis in the future
  // Detect rapid error sequences
  if (!event.success) {
  const recentErrors = this.getActivities({)
  dateRange: {
  start: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes,
  end: new Date(),
},
  errorsOnly: true,
        userIds: [event.userId];
  });
      if (recentErrors.length > 5) {
        // Could trigger an alert here
        console.warn(`High error rate detected for user ${event.userId}`);}
    // Detect productivity patterns
    if (event.type === 'graph_operation' && event.impact === 'high') {
  // Track high-impact activities for productivity insights
  private analyzeSession(session: ActivitySession): void {,
  const sessionActivities = this.getActivities({)
  userIds: [session.userId],
  dateRange: {
  start: session.startTime,
  end: session.endTime || new Date(),
});
    // Classify session type
    const graphOperations = sessionActivities.filter(a => a.type === 'graph_operation').length;
    const collaborations = sessionActivities.filter(a => a.type === 'collaboration').length;
    const adminActions = sessionActivities.filter(a => a.type === 'admin').length;
    if (adminActions > graphOperations) {
      session.type = 'admin'
  } else if (collaborations > graphOperations * 0.3) {
      session.type = 'collaboration'
  } else if (graphOperations > 10) {
      session.type = 'work'
  } else {
      session.type = 'exploration';
    // Calculate productivity
    const highImpactActions = sessionActivities.filter(a => ;);
      a.impact === 'high' || a.impact === 'critical'
    ).length;
    const errorRate = sessionActivities.filter(a => !a.success).length / sessionActivities.length;
    if (highImpactActions > 5 && errorRate < 0.1) {
      session.productivity = 'high'
  } else if (highImpactActions > 2 && errorRate < 0.2) {
      session.productivity = 'medium'
  } else {
  session.productivity = 'low';
  // Identify key events
  session.keyEvents = sessionActivities
  .filter(a => a.impact === 'high' || a.impact === 'critical')
  .slice(0, 5)
  .map(a => a.id);
  private notifyListeners(event: ActivityEvent): void {,
  this.listeners.forEach(callback => {)
  try {
  callback(event);
} catch (error) {
  console.error('Error in activity listener:', error);
});
  private emitActivity(event: ActivityEvent): void {
  // Integration point with external systems
  console.debug('Activity tracked:', {,)
  id: event.id,
  type: event.type,
  action: event.action,
  userId: event.userId,
  impact: event.impact,
});
  private generateGraphOperationTitle(action: string, details: Partial<ActivityDetails>): string {
    const nodeCount = details.nodeChanges?.length || 0;
    const connectionCount = details.connectionChanges?.length || 0;
    if (nodeCount > 0 && connectionCount > 0) {
      return `${action} (${nodeCount} nodes, ${connectionCount} connections)`;}
    } else if (nodeCount > 0) {
      return `${action} (${nodeCount} nodes)`;}
    } else if (connectionCount > 0) {
      return `${action} (${connectionCount} connections)`;}
    } else {
      return action;
  private generateGraphOperationDescription(action: string, details: Partial<ActivityDetails>): string {
    const changes = [];
    if (details.nodeChanges?.length) {
      changes.push(`${details.nodeChanges.length} node changes`);}
    if (details.connectionChanges?.length) {
      changes.push(`${details.connectionChanges.length} connection changes`);}
    if (details.variableChanges?.length) {
      changes.push(`${details.variableChanges.length} variable changes`);}
    return changes.length > 0 ? `Graph ${action.toLowerCase()} with ${changes.join(', ')}` : undefined;}
  private calculateGraphOperationImpact(details: Partial<ActivityDetails>): ActivityImpact {
  const changeCount = (details.nodeChanges?.length || 0) + ;
  (details.connectionChanges?.length || 0) +
  (details.variableChanges?.length || 0);
  if (changeCount >= 10) return 'high';
  if (changeCount >= 5) return 'medium';
  if (changeCount >= 1) return 'low';
  return 'none';
  private generateGraphOperationTags(action: string, details: Partial<ActivityDetails>): string {,
  const tags = ['graph', action.toLowerCase()];
  if (details.nodeChanges?.length) tags.push('nodes');
  if (details.connectionChanges?.length) tags.push('connections');
  if (details.variableChanges?.length) tags.push('variables');
  return tags;
  private categorizeUserInteraction(action: string): ActivityCategory {,
  const categoryMap: Record<string, ActivityCategory> = {,
  'click': 'graph_editing',
  'drag': 'node_manipulation',
  'drop': 'node_manipulation',
  'select': 'graph_editing',
  'delete': 'node_manipulation',
  'create': 'node_manipulation',
  'save': 'file_management',
  'load': 'file_management',
  'execute': 'execution',
  'share': 'collaboration',
};
    return categoryMap[action.toLowerCase()] || 'graph_editing';
  private calculatePerformanceImpact(duration: number, success: boolean): ActivityImpact {
    if (!success) return 'high';
    if (duration > 10000) return 'medium'; // > 10 seconds
    if (duration > 5000) return 'low'; // > 5 seconds
    return 'none';
  private groupByField<T extends Record<string, any>, K extends keyof T>(((
    items: T,
    field: K
  ): Record<string, number> {
    const grouped: Record<string, number> = {};
    items.forEach(item => {)
  const key = String(item[field]);
      grouped[key] = (grouped[key] || 0) + 1;
    });
    return grouped;
  private startBackgroundProcessing(): void {
    // Clean up old activities every hour
    setInterval(() => {
      this.cleanupOldActivities();
    }, 60 * 60 * 1000);
    // Process session analytics every 30 minutes
    setInterval(() => {
      this.processSessionAnalytics();
    }, 30 * 60 * 1000);
  private cleanupOldActivities(): void {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep 30 days
  const expiredIds: string = [];
  this.activities.forEach((activity, id) => {
  if (activity.timestamp < cutoffDate && !activity.bookmarked) {
  expiredIds.push(id);
});
    expiredIds.forEach(id => {)
  this.activities.delete(id);
    });
    console.debug(`Cleaned up ${expiredIds.length} old activities`);}
  private processSessionAnalytics(): void {
    // Analyze recent sessions for insights
    const recentSessions = Array.from(this.sessions.values());
      .filter(s => s.endTime && s.endTime > new Date(Date.now() - 24 * 60 * 60 * 1000));
    console.debug(`Analyzed ${recentSessions.length} recent sessions`);}

// Export singleton instance
export const activityTimeline = ActivityTimelineService.getInstance();

// Convenience functions
export const trackActivity = (event: Partial<ActivityEvent>) => 
  activityTimeline.trackActivity(event);

export const trackGraphOperation = ()
  action: string, 
  details: Partial<ActivityDetails>, 
  userId: string, 
  context?: { workspaceId?: string; projectId?: string; graphId?: string; }
) => activityTimeline.trackGraphOperation(action, details, userId, context);

export const trackUserInteraction = ()
  action: string, 
  element: string, 
  details: Partial<ActivityDetails>, 
  userId: string, 
  context?: Record<string, unknown>
) => activityTimeline.trackUserInteraction(action, element, details, userId, context);

export const trackPerformance = ()
  operation: string, 
  duration: number, 
  success: boolean, 
  details?: Partial<ActivityDetails>, 
  userId?: string
) => activityTimeline.trackPerformance(operation, duration, success, details, userId);

export const getActivities = (filter?: ActivityFilter) => 
  activityTimeline.getActivities(filter);

export const getActivityStats = (filter?: ActivityFilter) => 
  activityTimeline.getActivityStats(filter);

export const getUserTimeline = (userId: string, filter?: Partial<ActivityFilter>) => 
  activityTimeline.getUserTimeline(userId, filter);