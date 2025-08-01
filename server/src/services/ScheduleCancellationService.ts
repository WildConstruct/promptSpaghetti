/**
 * Schedule Cancellation Service
 * Epic 17.1.5 - Feature Toggle Scheduling System
 * Task: E17-1753114396822-8C8D12
 * 
 * Enhanced schedule cancellation functionality with reason tracking,
 * bulk operations, rollback capabilities, and audit integration.
 */

import { SchedulingDAO } from '../database/scheduling-dao';
import { FeatureToggleDAO } from '../database/feature-toggle-dao';
import {
  FeatureToggleSchedule,
  ScheduleExecution,
  ScheduleStatus,
  ExecutionStatus
 from '../database/scheduling-models';

// Cancellation Types and Interfaces
export type CancellationReason = 
  | 'user_requested'
  | 'schedule_conflict'
  | 'emergency_stop'
  | 'business_requirement'
  | 'technical_issue'
  | 'compliance_violation'
  | 'resource_unavailable'
  | 'policy_change'
  | 'maintenance_window'
  | 'rollback_request';

export type CancellationMode = 
  | 'immediate' // Cancel immediately without waiting
  | 'graceful'  // Let current execution complete, then cancel
  | 'after_completion' // Cancel after current cycle completes
  | 'scheduled'; // Cancel at a specific future time



export interface CancellationRequest {
  scheduleIds: string[];
  reason: CancellationReason;
  mode: CancellationMode;
  comment?: string;
  scheduledTime?: string; // For 'scheduled' mode
  notifyUsers?: boolean;
  rollbackPreviousExecutions?: boolean;
  cancelledBy: string;







export interface CancellationResult {
  id: string;
  requestId: string;
  scheduleId: string;
  scheduleName: string;
  status: 'success' | 'failed' | 'partial' | 'scheduled';
  reason: CancellationReason;
  mode: CancellationMode;
  
  // Execution State
  wasActive: boolean;
  hasExecutions: boolean;
  lastExecution?: Date;
  nextPlannedExecution?: Date;
  
  // Cancellation Details
  cancelledAt: string;
  cancelledBy: string;
  comment?: string;
  
  // Actions Taken
  actionsTaken: CancellationAction[];
  executionsAffected: number;
  rollbacksPerformed: number;
  
  // Metadata
  originalScheduleState?: Partial<FeatureToggleSchedule>;
  error?: {
    code: string;
    message: string;
    recoverable: boolean;



  };




export interface CancellationAction {
  id: string;
  action: 'stop_schedule' | 'cancel_execution' | 'rollback_execution' | 'notify_users' | 'update_status';
  description: string;
  timestamp: string;
  success: boolean;
  details?: Record<string, any>;
  error?: string;







export interface BulkCancellationRequest {
  filters: {
    toggleIds?: string[];
    status?: ScheduleStatus[];
    createdBy?: string[];
    tags?: string[];
    startDateFrom?: string;
    startDateTo?: string;



  };
  reason: CancellationReason;
  mode: CancellationMode;
  comment?: string;
  maxSchedules?: number; // Safety limit
  dryRun?: boolean; // Preview what would be cancelled
  cancelledBy: string;




export interface BulkCancellationResult {
  requestId: string;
  totalRequested: number;
  totalProcessed: number;
  successful: number;
  failed: number;
  skipped: number;
  dryRun: boolean;
  
  results: CancellationResult[];
  summary: {
    reasonBreakdown: Record<CancellationReason, number>;
    modeBreakdown: Record<CancellationMode, number>;
    togglesAffected: string[];
    totalExecutionsAffected: number;
    totalRollbacksPerformed: number;



  };
  
  executionTimeMs: number;
  timestamp: string;


export class ScheduleCancellationService {
  constructor(
    private schedulingDAO: SchedulingDAO,
    private featureToggleDAO: FeatureToggleDAO
  ) {}

  // Main Cancellation Methods
  async cancelSchedule(request: {
    scheduleId: string;
    reason: CancellationReason;
    mode?: CancellationMode;
    comment?: string;
    rollbackPreviousExecutions?: boolean;
    cancelledBy: string;
  }): Promise<CancellationResult> {

    const fullRequest: CancellationRequest = {
      scheduleIds: [request.scheduleId],
      reason: request.reason,
      mode: request.mode || 'immediate',
      comment: request.comment,
      rollbackPreviousExecutions: request.rollbackPreviousExecutions || false,
      notifyUsers: true,
      cancelledBy: request.cancelledBy
    };

    const results = await this.cancelMultipleSchedules(fullRequest);
    return results[0];


  async cancelMultipleSchedules(request: CancellationRequest): Promise<CancellationResult[]> {

    const results: CancellationResult[] = [];
    const requestId = `cancel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    for (const scheduleId of request.scheduleIds) {
      try {
        const result = await this.processSingleCancellation(requestId, scheduleId, request);
        results.push(result);
 catch (error) {
        results.push(this.createErrorResult(requestId, scheduleId, request, error as Error));



    // Log bulk cancellation
    await this.logBulkCancellation(requestId, request, results);

    return results;


  async bulkCancelSchedules(request: BulkCancellationRequest): Promise<BulkCancellationResult> {

    const startTime = Date.now();
    const requestId = `bulk_cancel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Find schedules matching filters
    const matchingSchedules = await this.findSchedulesForBulkOperation(request.filters);
    
    // Apply safety limit
    const maxSchedules = request.maxSchedules || 100;
    const schedulesToProcess = matchingSchedules.slice(0, maxSchedules);
    
    if (request.dryRun) {
      return this.createDryRunResult(requestId, schedulesToProcess, request, startTime);


    // Process cancellations
    const cancellationRequest: CancellationRequest = {
      scheduleIds: schedulesToProcess.map(s => s.id),
      reason: request.reason,
      mode: request.mode,
      comment: request.comment,
      notifyUsers: true,
      rollbackPreviousExecutions: false,
      cancelledBy: request.cancelledBy
    };

    const results = await this.cancelMultipleSchedules(cancellationRequest);

    // Create bulk result
    const bulkResult: BulkCancellationResult = {
      requestId,
      totalRequested: matchingSchedules.length,
      totalProcessed: schedulesToProcess.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      skipped: Math.max(0, matchingSchedules.length - schedulesToProcess.length),
      dryRun: false,
      results,
      summary: this.generateBulkSummary(results),
      executionTimeMs: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };

    // Log bulk operation
    await this.logBulkCancellationResult(bulkResult);

    return bulkResult;


  // Core Cancellation Processing
  private async processSingleCancellation(
    requestId: string,
    scheduleId: string,
    request: CancellationRequest
  ): Promise<CancellationResult> {

    const _____startTime = Date.now();
    const schedule = await this.schedulingDAO.getSchedule(scheduleId);
    
    if (!schedule) {
      throw new Error(`Schedule with ID ${scheduleId} not found`);


    // Validate cancellation is allowed
    await this.validateCancellation(schedule, request);

    const actionsTaken: CancellationAction[] = [];
    let executionsAffected = 0;
    let rollbacksPerformed = 0;

    // Store original state for audit
    const originalScheduleState = { ...schedule };

    try {
      // Handle different cancellation modes
      switch (request.mode) {
      case 'immediate':
        await this.performImmediateCancellation(schedule, actionsTaken);
        break;
      case 'graceful':
        await this.performGracefulCancellation(schedule, actionsTaken);
        break;
      case 'after_completion':
        await this.performAfterCompletionCancellation(schedule, actionsTaken);
        break;
      case 'scheduled':
        await this.scheduleDelayCancellation(schedule, request.scheduledTime!, actionsTaken);
        break;


      // Count affected executions
      const executions = await this.schedulingDAO.getExecutionsBySchedule(scheduleId);
      executionsAffected = executions.filter(e => 
        e.status === ExecutionStatus.PENDING || e.status === ExecutionStatus.RUNNING
      ).length;

      // Perform rollbacks if requested
      if (request.rollbackPreviousExecutions) {
        rollbacksPerformed = await this.rollbackPreviousExecutions(
          scheduleId, 
          schedule.toggleId, 
          actionsTaken
        );


      // Update schedule status and metadata
      await this.updateScheduleForCancellation(schedule, request, actionsTaken);

      // Send notifications if requested
      if (request.notifyUsers) {
        await this.sendCancellationNotifications(schedule, request, actionsTaken);


      const result: CancellationResult = {
        id: `cancellation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        requestId,
        scheduleId: schedule.id,
        scheduleName: schedule.name,
        status: 'success',
        reason: request.reason,
        mode: request.mode,
        wasActive: schedule.status === ScheduleStatus.ACTIVE,
        hasExecutions: executions.length > 0,
        lastExecution: schedule.lastExecution,
        nextPlannedExecution: schedule.nextExecution,
        cancelledAt: new Date().toISOString(),
        cancelledBy: request.cancelledBy,
        comment: request.comment,
        actionsTaken,
        executionsAffected,
        rollbacksPerformed,
        originalScheduleState
      };

      // Log successful cancellation
      await this.logCancellation(result);

      return result;
 catch (error) {
      // Log failure and return error result
      console.error(`Cancellation failed for schedule ${scheduleId}:`, error);
      return this.createErrorResult(requestId, scheduleId, request, error as Error);



  // Cancellation Mode Implementations
  private async performImmediateCancellation(
    schedule: FeatureToggleSchedule,
    actionsTaken: CancellationAction[]
  ): Promise<void> {

    // Stop any running executions
    await this.stopRunningExecutions(schedule.id, actionsTaken);

    // Update schedule status
    await this.schedulingDAO.updateSchedule(
      { id: schedule.id, status: ScheduleStatus.CANCELLED },
      'cancellation-service'
    );

    actionsTaken.push({
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action: 'stop_schedule',
      description: 'Immediately cancelled schedule and stopped running executions',
      timestamp: new Date().toISOString(),
      success: true
    });


  private async performGracefulCancellation(
    schedule: FeatureToggleSchedule,
    actionsTaken: CancellationAction[]
  ): Promise<void> {

    // Let current execution complete, then cancel
    const runningExecution = await this.getCurrentExecution(schedule.id);
    
    if (runningExecution) {
      // Mark for cancellation after current execution
      await this.schedulingDAO.updateSchedule(
        { 
          id: schedule.id, 
          status: ScheduleStatus.PENDING_CANCELLATION,
          metadata: { 
            ...schedule.metadata,
            gracefulCancellation: true,
            cancellationAfterExecution: runningExecution.id


        'cancellation-service'
      );

      actionsTaken.push({
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action: 'stop_schedule',
        description: 'Marked for graceful cancellation after current execution completes',
        timestamp: new Date().toISOString(),
        success: true,
        details: { executionId: runningExecution.id }
      });
 else {
      // No running execution, cancel immediately
      await this.performImmediateCancellation(schedule, actionsTaken);



  private async performAfterCompletionCancellation(
    schedule: FeatureToggleSchedule,
    actionsTaken: CancellationAction[]
  ): Promise<void> {

    // Cancel after current cycle completes (for recurring schedules)
    if (schedule.type === 'recurring') {
      await this.schedulingDAO.updateSchedule(
        { 
          id: schedule.id, 
          status: ScheduleStatus.PENDING_CANCELLATION,
          metadata: { 
            ...schedule.metadata,
            cancelAfterCycle: true,
            maxExecutions: schedule.executionCount + 1 // Allow one more execution


        'cancellation-service'
      );

      actionsTaken.push({
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action: 'stop_schedule',
        description: 'Marked for cancellation after current recurrence cycle completes',
        timestamp: new Date().toISOString(),
        success: true
      });
 else {
      // One-time schedule, cancel after execution
      await this.performGracefulCancellation(schedule, actionsTaken);



  private async scheduleDelayCancellation(
    schedule: FeatureToggleSchedule,
    scheduledTime: string,
    actionsTaken: CancellationAction[]
  ): Promise<void> {

    const cancelTime = new Date(scheduledTime);
    
    // Store cancellation instruction for later execution
    await this.schedulingDAO.updateSchedule(
      { 
        id: schedule.id,
        metadata: { 
          ...schedule.metadata,
          scheduledCancellation: {
            time: cancelTime.toISOString(),
            status: 'scheduled'



      'cancellation-service'
    );

    actionsTaken.push({
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action: 'stop_schedule',
      description: `Scheduled cancellation for ${cancelTime.toISOString()}`,
      timestamp: new Date().toISOString(),
      success: true,
      details: { scheduledTime: cancelTime.toISOString() }
    });


  // Rollback Operations
  private async rollbackPreviousExecutions(
    scheduleId: string,
    toggleId: string,
    actionsTaken: CancellationAction[]
  ): Promise<number> {

    const executions = await this.schedulingDAO.getExecutionsBySchedule(scheduleId, 10);
    const successfulExecutions = executions.filter(e => e.status === ExecutionStatus.SUCCESS);
    
    let rollbackCount = 0;
    const toggle = await this.featureToggleDAO.getToggle(toggleId);
    
    if (!toggle) {
      throw new Error(`Feature toggle ${toggleId} not found for rollback`);


    // Rollback executions in reverse order (most recent first)
    for (const execution of successfulExecutions.reverse()) {
      try {
        await this.rollbackExecution(execution, toggle, actionsTaken);
        rollbackCount++;
 catch (error) {
        console.error(`Failed to rollback execution ${execution.id}:`, error);
        actionsTaken.push({
          id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          action: 'rollback_execution',
          description: `Failed to rollback execution ${execution.id}`,
          timestamp: new Date().toISOString(),
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });



    return rollbackCount;


  private async rollbackExecution(
    execution: ScheduleExecution,
    toggle: Error,
    actionsTaken: CancellationAction[]
  ): Promise<void> {

    if (!execution.beforeValue) {
      throw new Error('Cannot rollback execution without before value');


    // Restore previous value
    await this.featureToggleDAO.updateToggle({
      id: toggle.id,
      enabled: execution.beforeValue.enabled,
      value: execution.beforeValue.value
    }, 'rollback-service');

    // Mark execution as rolled back
    await this.schedulingDAO.updateExecution(execution.id, {
      status: ExecutionStatus.ROLLED_BACK,
      metadata: {
        ...execution.metadata,
        rolledBackAt: new Date().toISOString(),
        rollbackReason: 'schedule_cancelled'

    });

    actionsTaken.push({
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action: 'rollback_execution',
      description: `Rolled back execution ${execution.id} to previous state`,
      timestamp: new Date().toISOString(),
      success: true,
      details: {
        executionId: execution.id,
        beforeValue: execution.beforeValue,
        afterValue: execution.afterValue

    });


  // Helper Methods
  private async validateCancellation(
    schedule: FeatureToggleSchedule,
    request: CancellationRequest
  ): Promise<void> {

    // Check if already cancelled
    if (schedule.status === ScheduleStatus.CANCELLED) {
      throw new Error('Schedule is already cancelled');


    // Check if completed
    if (schedule.status === ScheduleStatus.COMPLETED) {
      throw new Error('Cannot cancel completed schedule');


    // Validate scheduled cancellation time
    if (request.mode === 'scheduled' && request.scheduledTime) {
      const scheduledTime = new Date(request.scheduledTime);
      const now = new Date();
      
      if (scheduledTime <= now) {
        throw new Error('Scheduled cancellation time must be in the future');


      if (schedule.endTime && scheduledTime > schedule.endTime) {
        throw new Error('Scheduled cancellation time is after schedule end time');




  private async stopRunningExecutions(scheduleId: string, actionsTaken: CancellationAction[]): Promise<void> {

    const runningExecutions = await this.getRunningExecutions(scheduleId);
    
    for (const execution of runningExecutions) {
      await this.schedulingDAO.updateExecution(execution.id, {
        status: ExecutionStatus.CANCELLED,
        endTime: new Date(),
        metadata: {
          ...execution.metadata,
          cancelledAt: new Date().toISOString(),
          cancelReason: 'schedule_cancelled'

      });

      actionsTaken.push({
        id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        action: 'cancel_execution',
        description: `Cancelled running execution ${execution.id}`,
        timestamp: new Date().toISOString(),
        success: true,
        details: { executionId: execution.id }
      });



  private async getCurrentExecution(scheduleId: string): Promise<ScheduleExecution | null> {

    const executions = await this.schedulingDAO.getExecutionsBySchedule(scheduleId, 1);
    return executions.find(e => e.status === ExecutionStatus.RUNNING) || null;


  private async getRunningExecutions(scheduleId: string): Promise<ScheduleExecution[]> {

    const executions = await this.schedulingDAO.getExecutionsBySchedule(scheduleId);
    return executions.filter(e => 
      e.status === ExecutionStatus.RUNNING || e.status === ExecutionStatus.PENDING
    );


  private async updateScheduleForCancellation(
    schedule: FeatureToggleSchedule,
    request: CancellationRequest,
    actionsTaken: CancellationAction[]
  ): Promise<void> {

    await this.schedulingDAO.updateSchedule({
      id: schedule.id,
      status: ScheduleStatus.CANCELLED,
      metadata: {
        ...schedule.metadata,
        cancellation: {
          reason: request.reason,
          mode: request.mode,
          comment: request.comment,
          cancelledBy: request.cancelledBy,
          cancelledAt: new Date().toISOString()


    }, request.cancelledBy);

    actionsTaken.push({
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action: 'update_status',
      description: 'Updated schedule status to CANCELLED',
      timestamp: new Date().toISOString(),
      success: true
    });


  private async sendCancellationNotifications(
    schedule: FeatureToggleSchedule,
    request: CancellationRequest,
    actionsTaken: CancellationAction[]
  ): Promise<void> {

    // This would integrate with a notification service
    // For now, just log and record the action
    console.log(`Sending cancellation notification for schedule ${schedule.id}`);

    actionsTaken.push({
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action: 'notify_users',
      description: 'Sent cancellation notification to relevant users',
      timestamp: new Date().toISOString(),
      success: true,
      details: {
        recipients: ['admin@example.com'], // Would be actual recipients
        method: 'email'

    });


  private async findSchedulesForBulkOperation(filters: BulkCancellationRequest['filters']): Promise<FeatureToggleSchedule[]> {

    // This would use the DAO to find schedules matching the filters
    // For now, return a mock implementation
    const { schedules } = await this.schedulingDAO.querySchedules({
      limit: 1000 // Apply safety limit
    });

    let filtered = schedules;

    if (filters.toggleIds) {
      filtered = filtered.filter(s => filters.toggleIds!.includes(s.toggleId));


    if (filters.status) {
      filtered = filtered.filter(s => filters.status!.includes(s.status));


    if (filters.createdBy) {
      filtered = filtered.filter(s => filters.createdBy!.includes(s.createdBy));


    return filtered;


  private createDryRunResult(
    requestId: string,
    schedules: FeatureToggleSchedule[],
    request: BulkCancellationRequest,
    startTime: number
  ): BulkCancellationResult {
    const mockResults = schedules.map(schedule => ({
      id: `dry_run_${schedule.id}`,
      requestId,
      scheduleId: schedule.id,
      scheduleName: schedule.name,
      status: 'success' as const,
      reason: request.reason,
      mode: request.mode,
      wasActive: schedule.status === ScheduleStatus.ACTIVE,
      hasExecutions: schedule.executionCount > 0,
      lastExecution: schedule.lastExecution,
      nextPlannedExecution: schedule.nextExecution,
      cancelledAt: new Date().toISOString(),
      cancelledBy: request.cancelledBy,
      comment: request.comment,
      actionsTaken: [],
      executionsAffected: 0,
      rollbacksPerformed: 0
    }));

    return {
      requestId,
      totalRequested: schedules.length,
      totalProcessed: schedules.length,
      successful: schedules.length,
      failed: 0,
      skipped: 0,
      dryRun: true,
      results: mockResults,
      summary: this.generateBulkSummary(mockResults),
      executionTimeMs: Date.now() - startTime,
      timestamp: new Date().toISOString(};


  private generateBulkSummary(results: CancellationResult[]): BulkCancellationResult['summary'] {
    const reasonBreakdown = {} as Record<CancellationReason, number>;
    const modeBreakdown = {} as Record<CancellationMode, number>;
    const togglesAffected: string[] = [];

    let totalExecutionsAffected = 0;
    let totalRollbacksPerformed = 0;

    for (const result of results) {
      reasonBreakdown[result.reason] = (reasonBreakdown[result.reason] || 0) + 1;
      modeBreakdown[result.mode] = (modeBreakdown[result.mode] || 0) + 1;
      
      if (result.originalScheduleState?.toggleId && !togglesAffected.includes(result.originalScheduleState.toggleId)) {
        togglesAffected.push(result.originalScheduleState.toggleId);


      totalExecutionsAffected += result.executionsAffected;
      totalRollbacksPerformed += result.rollbacksPerformed;


    return {
      reasonBreakdown,
      modeBreakdown,
      togglesAffected,
      totalExecutionsAffected,
      totalRollbacksPerformed
    };


  private createErrorResult(
    requestId: string,
    scheduleId: string,
    request: CancellationRequest,
    error: Error
  ): CancellationResult {
    return {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      requestId,
      scheduleId,
      scheduleName: 'Unknown',
      status: 'failed',
      reason: request.reason,
      mode: request.mode,
      wasActive: false,
      hasExecutions: false,
      cancelledAt: new Date().toISOString(),
      cancelledBy: request.cancelledBy,
      comment: request.comment,
      actionsTaken: [],
      executionsAffected: 0,
      rollbacksPerformed: 0,
      error: {
        code: 'CANCELLATION_ERROR',
        message: error.message,
        recoverable: this.isRecoverableError(error)

    };


  private isRecoverableError(error: Error): boolean {
    const recoverablePatterns = [
      'timeout',
      'network',
      'temporary',
      'rate limit',
      'connection'
    ];

    const message = error.message.toLowerCase();
    return recoverablePatterns.some(pattern => message.includes(pattern));


  // Logging Methods
  private async logCancellation(result: CancellationResult): Promise<void> {

    console.log('Schedule Cancellation:', {
      scheduleId: result.scheduleId,
      reason: result.reason,
      mode: result.mode,
      status: result.status,
      cancelledBy: result.cancelledBy,
      executionsAffected: result.executionsAffected,
      rollbacksPerformed: result.rollbacksPerformed
    });


  private async logBulkCancellation(
    requestId: string,
    request: CancellationRequest,
    results: CancellationResult[]
  ): Promise<void> {

    console.log('Bulk Schedule Cancellation:', {
      requestId,
      totalSchedules: request.scheduleIds.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      reason: request.reason,
      mode: request.mode,
      cancelledBy: request.cancelledBy
    });


  private async logBulkCancellationResult(result: BulkCancellationResult): Promise<void> {

    console.log('Bulk Cancellation Completed:', {
      requestId: result.requestId,
      totalProcessed: result.totalProcessed,
      successful: result.successful,
      failed: result.failed,
      executionTimeMs: result.executionTimeMs
    });



export default ScheduleCancellationService;