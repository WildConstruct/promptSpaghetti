/**
 * Epic 23: Conflict Resolution Service
 * 
 * Service layer that integrates conflict resolution engine with workspace
 * data access, real-time notifications, and collaborative editing features.
 * 
 * Task: E23-1753115279513-6E9F4C - Implement conflict resolution & rollback logic
 */

import { EventEmitter } from 'events';
import {
  ConflictResolutionEngine,
  ConflictType,
  ConflictSeverity,
  ResolutionStrategy,
  ResolutionResult,
  ConflictContext
 from './ConflictResolutionEngine';
import { Epic23WorkspaceDAO } from '../database/epic23-workspace-dao';
import {
  ConflictMarker,
  EditSession,
  CollaborativeResource,
  UserPresence,
  COLLABORATIVE_PERMISSIONS
 from '../database/epic23-workspace-models';

// =============================================================================
// SERVICE INTERFACES
// =============================================================================



export interface ConflictResolutionConfig {
  default_strategy: ResolutionStrategy;
  auto_resolution_enabled: boolean;
  max_resolution_time_ms: number;
  rollback_enabled: boolean;
  max_rollback_points: number;
  notification_enabled: boolean;
  conflict_threshold_seconds: number; // Time window for conflict detection







export interface ConflictNotification {
  type: 'conflict_detected' | 'conflict_resolved' | 'resolution_failed' | 'rollback_performed';
  resource_id: string;
  workspace_id: string;
  affected_users: string[];
  conflicts: ConflictMarker[];
  resolution_result?: ResolutionResult;
  timestamp: Date;
  severity: ConflictSeverity;
  requires_user_action: boolean;







export interface ConflictAnalysis {
  resource_id: string;
  conflict_probability: number;    // 0-1 probability of conflict
  risk_factors: string[];
  recommended_strategy: ResolutionStrategy;
  prevention_suggestions: string[];
  estimated_resolution_time: number;





// =============================================================================
// CONFLICT RESOLUTION SERVICE
// =============================================================================

export class ConflictResolutionService extends EventEmitter {
  private conflictEngine: ConflictResolutionEngine;
  private workspaceDAO: Epic23WorkspaceDAO;
  private config: ConflictResolutionConfig;
  private activeMonitoring: Map<string, NodeJS.Timeout> = new Map();
  private conflictAnalysisCache: Map<string, ConflictAnalysis> = new Map();

  constructor(
    workspaceDAO: Epic23WorkspaceDAO,
    config: Partial<ConflictResolutionConfig> = {}
  ) {
    super();
    
    this.workspaceDAO = workspaceDAO;
    this.conflictEngine = new ConflictResolutionEngine();
    
    this.config = {
      default_strategy: ResolutionStrategy.AUTO_MERGE,
      auto_resolution_enabled: true,
      max_resolution_time_ms: 30000, // 30 seconds
      rollback_enabled: true,
      max_rollback_points: 10,
      notification_enabled: true,
      conflict_threshold_seconds: 5,
      ...config
    };

    this.setupEngineEventHandlers();


  // =============================================================================
  // CONFLICT MONITORING & DETECTION
  // =============================================================================

  /**
   * Start monitoring a resource for conflicts
   */
  async startConflictMonitoring(resourceId: string): Promise<void> {

    if (this.activeMonitoring.has(resourceId)) {
      return; // Already monitoring


    const monitorInterval = setInterval(async () => {
      try {
        await this.checkResourceForConflicts(resourceId);
 catch (error) {
        console.error(`Error monitoring conflicts for resource ${resourceId}:`, error);

    }, this.config.conflict_threshold_seconds * 1000);

    this.activeMonitoring.set(resourceId, monitorInterval);
    
    // Create initial rollback point
    if (this.config.rollback_enabled) {
      await this.createInitialRollbackPoint(resourceId);


    this.emit('monitoring_started', { resourceId });


  /**
   * Stop monitoring a resource for conflicts
   */
  stopConflictMonitoring(resourceId: string): void {
    const interval = this.activeMonitoring.get(resourceId);
    if (interval) {
      clearInterval(interval);
      this.activeMonitoring.delete(resourceId);
      this.conflictAnalysisCache.delete(resourceId);
      
      this.emit('monitoring_stopped', { resourceId });



  /**
   * Check a resource for active conflicts
   */
  async checkResourceForConflicts(resourceId: string): Promise<ConflictMarker[]> {

    try {
      // Get active edit sessions for the resource
      const activeSessions = await this.workspaceDAO.getActiveEditSessions(resourceId);
      
      if (activeSessions.length < 2) {
        return []; // No conflicts possible with single/no editors


      // Detect conflicts using the engine
      const conflicts = await this.conflictEngine.detectConflicts(resourceId, activeSessions);
      
      if (conflicts.length > 0) {
        await this.handleDetectedConflicts(resourceId, conflicts, activeSessions);


      return conflicts;
 catch (error) {
      console.error(`Error checking conflicts for resource ${resourceId}:`, error);
      return [];



  /**
   * Handle detected conflicts
   */
  private async handleDetectedConflicts(
    resourceId: string,
    conflicts: ConflictMarker[],
    sessions: EditSession[]
  ): Promise<void> {

    const workspaceId = sessions[0]?.workspace_id;
    if (!workspaceId) return;

    // Create conflict notification
    const notification: ConflictNotification = {
      type: 'conflict_detected',
      resource_id: resourceId,
      workspace_id: workspaceId,
      affected_users: sessions.map(s => s.user_id),
      conflicts,
      timestamp: new Date(),
      severity: this.calculateConflictSeverity(conflicts),
      requires_user_action: !this.config.auto_resolution_enabled
    };

    // Notify users
    if (this.config.notification_enabled) {
      await this.sendConflictNotification(notification);


    // Attempt auto-resolution if enabled
    if (this.config.auto_resolution_enabled) {
      await this.attemptAutoResolution(resourceId, conflicts, notification);


    this.emit('conflicts_detected', notification);


  /**
   * Attempt automatic conflict resolution
   */
  private async attemptAutoResolution(
    resourceId: string,
    conflicts: ConflictMarker[],
    notification: ConflictNotification
  ): Promise<void> {

    try {
      // Create rollback point before attempting resolution
      if (this.config.rollback_enabled) {
        const currentContent = await this.getCurrentResourceContent(resourceId);
        this.conflictEngine.createRollbackPoint(
          resourceId,
          currentContent,
          `Pre-resolution backup ${new Date().toISOString()}`
        );


      // Resolve conflicts using configured strategy
      const resolutionResult = await this.conflictEngine.resolveConflicts(
        resourceId,
        this.config.default_strategy
      );

      // Handle resolution result
      if (resolutionResult.success) {
        await this.applyResolution(resourceId, resolutionResult);
        
        // Send success notification
        const successNotification: ConflictNotification = {
          ...notification,
          type: 'conflict_resolved',
          resolution_result: resolutionResult,
          requires_user_action: false
        };
        
        if (this.config.notification_enabled) {
          await this.sendConflictNotification(successNotification);

        
        this.emit('conflicts_auto_resolved', successNotification);
 else {
        // Auto-resolution failed, require manual intervention
        const failureNotification: ConflictNotification = {
          ...notification,
          type: 'resolution_failed',
          resolution_result: resolutionResult,
          requires_user_action: true
        };
        
        if (this.config.notification_enabled) {
          await this.sendConflictNotification(failureNotification);

        
        this.emit('auto_resolution_failed', failureNotification);

 catch (error) {
      console.error(`Auto-resolution failed for resource ${resourceId}:`, error);
      
      // Send error notification
      const errorNotification: ConflictNotification = {
        ...notification,
        type: 'resolution_failed',
        requires_user_action: true
      };
      
      if (this.config.notification_enabled) {
        await this.sendConflictNotification(errorNotification);




  // =============================================================================
  // MANUAL CONFLICT RESOLUTION
  // =============================================================================

  /**
   * Resolve conflicts manually with user input
   */
  async resolveConflictsManually(
    resourceId: string,
    strategy: ResolutionStrategy,
    userResolution?: unknown,
    userId?: string
  ): Promise<ResolutionResult> {

    try {
      // Verify user has permission to resolve conflicts
      if (userId) {
        const sessions = await this.workspaceDAO.getActiveEditSessions(resourceId);
        const workspaceId = sessions[0]?.workspace_id;
        
        if (workspaceId) {
          const canResolve = await this.workspaceDAO.hasCollaborativePermission(
            userId,
            workspaceId,
            COLLABORATIVE_PERMISSIONS.CONFLICT_RESOLVE
          );
          
          if (!canResolve) {
            throw new Error('User does not have permission to resolve conflicts');




      // Create rollback point before manual resolution
      if (this.config.rollback_enabled) {
        const currentContent = await this.getCurrentResourceContent(resourceId);
        this.conflictEngine.createRollbackPoint(
          resourceId,
          currentContent,
          `Pre-manual-resolution backup by ${userId || 'system'}`
        );


      // Resolve using specified strategy
      const resolutionResult = await this.conflictEngine.resolveConflicts(
        resourceId,
        strategy,
        userResolution
      );

      // Apply resolution if successful
      if (resolutionResult.success) {
        await this.applyResolution(resourceId, resolutionResult);
        
        // Update resolution metadata
        resolutionResult.metadata.resolved_by = 'user';
        
        // Send notification
        const notification: ConflictNotification = {
          type: 'conflict_resolved',
          resource_id: resourceId,
          workspace_id: '', // Will be filled by notification handler
          affected_users: resolutionResult.metadata.affected_users,
          conflicts: [],
          resolution_result: resolutionResult,
          timestamp: new Date(),
          severity: ConflictSeverity.LOW,
          requires_user_action: false
        };
        
        if (this.config.notification_enabled) {
          await this.sendConflictNotification(notification);

        
        this.emit('manual_resolution_completed', { resourceId, result: resolutionResult, userId });


      return resolutionResult;
 catch (error) {
      console.error(`Manual resolution failed for resource ${resourceId}:`, error);
      throw error;



  // =============================================================================
  // ROLLBACK OPERATIONS
  // =============================================================================

  /**
   * Perform rollback to a specific point
   */
  async performRollback(
    resourceId: string,
    rollbackId?: string,
    userId?: string
  ): Promise<boolean> {

    try {
      // Verify user has permission to perform rollback
      if (userId) {
        const sessions = await this.workspaceDAO.getActiveEditSessions(resourceId);
        const workspaceId = sessions[0]?.workspace_id;
        
        if (workspaceId) {
          const canRollback = await this.workspaceDAO.hasCollaborativePermission(
            userId,
            workspaceId,
            COLLABORATIVE_PERMISSIONS.VERSION_CONTROL
          );
          
          if (!canRollback) {
            throw new Error('User does not have permission to perform rollback');




      // Perform rollback
      const rolledBackContent = this.conflictEngine.performRollback(resourceId, rollbackId);
      
      if (!rolledBackContent) {
        return false;


      // Apply rolled back content
      await this.updateResourceContent(resourceId, rolledBackContent);
      
      // End all active edit sessions to prevent further conflicts
      await this.endAllEditSessions(resourceId);
      
      // Send rollback notification
      const notification: ConflictNotification = {
        type: 'rollback_performed',
        resource_id: resourceId,
        workspace_id: '', // Will be filled by notification handler
        affected_users: [], // Will be filled by notification handler
        conflicts: [],
        timestamp: new Date(),
        severity: ConflictSeverity.MEDIUM,
        requires_user_action: false
      };
      
      if (this.config.notification_enabled) {
        await this.sendConflictNotification(notification);

      
      this.emit('rollback_performed', { resourceId, rollbackId, userId });
      return true;
 catch (error) {
      console.error(`Rollback failed for resource ${resourceId}:`, error);
      return false;



  /**
   * Get available rollback points for a resource
   */
  getRollbackPoints(resourceId: string): unknown[] {
    return this.conflictEngine.getRollbackPoints(resourceId);


  /**
   * Create manual rollback point
   */
  async createRollbackPoint(
    resourceId: string,
    label?: string,
    userId?: string
  ): Promise<string> {

    const currentContent = await this.getCurrentResourceContent(resourceId);
    const rollbackId = this.conflictEngine.createRollbackPoint(
      resourceId,
      currentContent,
      label || `Manual checkpoint by ${userId || 'system'}`
    );
    
    this.emit('rollback_point_created', { resourceId, rollbackId, userId });
    return rollbackId;


  // =============================================================================
  // CONFLICT ANALYSIS & PREVENTION
  // =============================================================================

  /**
   * Analyze conflict risk for a resource
   */
  async analyzeConflictRisk(resourceId: string): Promise<ConflictAnalysis> {

    // Check cache first
    const cached = this.conflictAnalysisCache.get(resourceId);
    if (cached) {
      return cached;


    try {
      const activeSessions = await this.workspaceDAO.getActiveEditSessions(resourceId);
      const presence = await this.getResourcePresence(resourceId);
      
      // Calculate conflict probability based on various factors
      let conflictProbability = 0;
      const riskFactors: string[] = [];
      const preventionSuggestions: string[] = [];
      let recommendedStrategy = ResolutionStrategy.AUTO_MERGE;

      // Factor 1: Number of concurrent editors
      if (activeSessions.length > 1) {
        conflictProbability += Math.min(0.3, activeSessions.length * 0.1);
        riskFactors.push(`${activeSessions.length} concurrent editors`);


      // Factor 2: Overlapping selections
      const overlappingSelections = this.detectOverlappingSelections(presence);
      if (overlappingSelections > 0) {
        conflictProbability += 0.4;
        riskFactors.push(`${overlappingSelections} overlapping selections`);
        preventionSuggestions.push('Coordinate editing areas between team members');


      // Factor 3: Rapid edit frequency
      const rapidEdits = this.detectRapidEditing(activeSessions);
      if (rapidEdits) {
        conflictProbability += 0.2;
        riskFactors.push('Rapid concurrent editing detected');
        preventionSuggestions.push('Slow down editing pace to reduce conflicts');
        recommendedStrategy = ResolutionStrategy.OPERATIONAL_TRANSFORM;


      // Factor 4: Resource complexity
      const resourceComplexity = await this.assessResourceComplexity(resourceId);
      if (resourceComplexity > 0.7) {
        conflictProbability += 0.1;
        riskFactors.push('Complex resource structure');
        preventionSuggestions.push('Break complex resources into smaller components');


      // Estimate resolution time based on complexity and conflict probability
      const estimatedResolutionTime = Math.ceil(
        (conflictProbability * resourceComplexity * activeSessions.length) * 5000
      );

      // Cap probability at 1.0
      conflictProbability = Math.min(1.0, conflictProbability);

      if (conflictProbability < 0.3) {
        recommendedStrategy = ResolutionStrategy.LAST_WRITER_WINS;
 else if (conflictProbability < 0.7) {
        recommendedStrategy = ResolutionStrategy.AUTO_MERGE;
 else {
        recommendedStrategy = ResolutionStrategy.MANUAL_RESOLUTION;
        preventionSuggestions.push('Consider manual coordination before editing');


      const analysis: ConflictAnalysis = {
        resource_id: resourceId,
        conflict_probability: conflictProbability,
        risk_factors: riskFactors,
        recommended_strategy: recommendedStrategy,
        prevention_suggestions: preventionSuggestions,
        estimated_resolution_time: estimatedResolutionTime
      };

      // Cache the analysis for 30 seconds
      this.conflictAnalysisCache.set(resourceId, analysis);
      setTimeout(() => {
        this.conflictAnalysisCache.delete(resourceId);
      }, 30000);

      return analysis;
 catch (error) {
      console.error(`Error analyzing conflict risk for resource ${resourceId}:`, error);
      
      // Return default analysis
      return {
        resource_id: resourceId,
        conflict_probability: 0.5,
        risk_factors: ['Analysis error'],
        recommended_strategy: ResolutionStrategy.AUTO_MERGE,
        prevention_suggestions: ['Monitor system status'],
        estimated_resolution_time: 5000
      };



  // =============================================================================
  // STATISTICS & MONITORING
  // =============================================================================

  /**
   * Get conflict resolution statistics
   */
  getConflictStatistics(resourceId?: string) {
    const stats = this.conflictEngine.getConflictStatistics(resourceId);
    
    return {
      ...stats,
      monitoring_active: resourceId 
        ? this.activeMonitoring.has(resourceId)
        : this.activeMonitoring.size > 0,
      monitored_resources: this.activeMonitoring.size,
      config: this.config
    };


  /**
   * Update conflict resolution configuration
   */
  updateConfig(newConfig: Partial<ConflictResolutionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('config_updated', this.config);


  /**
   * Clean up service resources
   */
  cleanup(): void {
    // Stop all monitoring
    for (const [resourceId] of this.activeMonitoring) {
      this.stopConflictMonitoring(resourceId);

    
    // Clear caches
    this.conflictAnalysisCache.clear();
    
    // Clear engine history
    this.conflictEngine.clearHistory();
    
    this.emit('service_cleanup_completed');


  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  /**
   * Setup event handlers for conflict engine
   */
  private setupEngineEventHandlers(): void {
    this.conflictEngine.on('conflicts_detected', (data) => {
      this.emit('engine_conflicts_detected', data);
    });

    this.conflictEngine.on('conflict_resolved', (data) => {
      this.emit('engine_conflict_resolved', data);
    });

    this.conflictEngine.on('conflict_resolution_failed', (data) => {
      this.emit('engine_resolution_failed', data);
    });

    this.conflictEngine.on('rollback_point_created', (data) => {
      this.emit('engine_rollback_point_created', data);
    });

    this.conflictEngine.on('rollback_performed', (data) => {
      this.emit('engine_rollback_performed', data);
    });


  /**
   * Calculate conflict severity based on conflict markers
   */
  private calculateConflictSeverity(conflicts: ConflictMarker[]): ConflictSeverity {
    if (conflicts.length === 0) return ConflictSeverity.LOW;
    
    const hasStructuralConflicts = conflicts.some(c => c.conflict_type === ConflictType.STRUCTURE);
    const hasMultipleContentConflicts = conflicts.filter(c => c.conflict_type === ConflictType.CONTENT).length > 3;
    
    if (hasStructuralConflicts || hasMultipleContentConflicts) {
      return ConflictSeverity.HIGH;
 else if (conflicts.length > 1) {
      return ConflictSeverity.MEDIUM;
 else {
      return ConflictSeverity.LOW;



  /**
   * Send conflict notification to affected users
   */
  private async sendConflictNotification(notification: ConflictNotification): Promise<void> {

    // This would integrate with the notification system
    // For now, just emit an event
    this.emit('conflict_notification', notification);


  /**
   * Apply conflict resolution to resource
   */
  private async applyResolution(resourceId: string, result: ResolutionResult): Promise<void> {

    if (result.resolved_content) {
      await this.updateResourceContent(resourceId, result.resolved_content);

    
    // Update resource metadata to mark conflicts as resolved
    // This would integrate with the workspace DAO


  /**
   * Get current resource content
   */
  private async getCurrentResourceContent(resourceId: string): Promise<any> {

    // This would fetch the actual resource content from the database
    // For now, return a placeholder
    return { content: 'resource_content', timestamp: new Date() };


  /**
   * Update resource content
   */
  private async updateResourceContent(resourceId: string, content: unknown): Promise<void> {

    // This would update the actual resource content in the database
    console.log(`Updating resource ${resourceId} with new content`);


  /**
   * Create initial rollback point for a resource
   */
  private async createInitialRollbackPoint(resourceId: string): Promise<void> {

    const currentContent = await this.getCurrentResourceContent(resourceId);
    this.conflictEngine.createRollbackPoint(
      resourceId,
      currentContent,
      'Initial monitoring checkpoint'
    );


  /**
   * End all edit sessions for a resource
   */
  private async endAllEditSessions(resourceId: string): Promise<void> {

    const activeSessions = await this.workspaceDAO.getActiveEditSessions(resourceId);
    
    for (const session of activeSessions) {
      await this.workspaceDAO.endEditSession(session.id);



  /**
   * Get resource presence data
   */
  private async getResourcePresence(resourceId: string): Promise<UserPresence[]> {

    // This would get presence data for users viewing/editing the resource
    // For now, return empty array
    return [];


  /**
   * Detect overlapping selections
   */
  private detectOverlappingSelections(presence: UserPresence[]): number {
    // This would analyze user selections for overlaps
    // For now, return 0
    return 0;


  /**
   * Detect rapid editing patterns
   */
  private detectRapidEditing(sessions: EditSession[]): boolean {
    // This would analyze edit timing patterns
    // For now, return false
    return false;


  /**
   * Assess resource complexity
   */
  private async assessResourceComplexity(resourceId: string): Promise<number> {

    // This would analyze the resource structure complexity
    // For now, return moderate complexity
    return 0.5;

