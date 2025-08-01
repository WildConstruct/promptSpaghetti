// Epic 17.1.5 - Feature Toggle Scheduling Service

import { SchedulingDAO } from '../database/scheduling-dao';
import { FeatureToggleDAO } from '../database/feature-toggle-dao';
import {
  FeatureToggleSchedule,
  ScheduleExecution,
  ScheduleConflict,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  ScheduleQuery,
  ScheduleAnalytics,
  ScheduleType,
  ScheduleStatus,
  ExecutionStatus,
  ScheduleAction,
  RecurrenceType
 from '../database/scheduling-models';

export class SchedulingService {
  constructor(
    private schedulingDAO: SchedulingDAO,
    private featureToggleDAO: FeatureToggleDAO
  ) {}

  // Schedule management
  async createSchedule(request: CreateScheduleRequest, createdBy: string): Promise<FeatureToggleSchedule> {

    // Validate toggle exists
    const toggle = await this.featureToggleDAO.getToggle(request.toggleId);
    if (!toggle) {
      throw new Error(`Feature toggle with ID ${request.toggleId} not found`);


    // Validate schedule times
    this.validateScheduleTimes(request);

    // Check for conflicts
    const conflicts = await this.detectScheduleConflicts(request);
    if (conflicts.length > 0 && request.conflictResolution === 'skip') {
      throw new Error(`Schedule conflicts detected: ${conflicts.map(c => c.description).join(', ')}`);


    // Create the schedule
    const schedule = await this.schedulingDAO.createSchedule(request, createdBy);

    // Calculate next execution time
    await this.updateNextExecutionTime(schedule.id);

    // Handle conflicts based on resolution strategy
    if (conflicts.length > 0) {
      await this.handleScheduleConflicts(schedule, conflicts);


    return schedule;


  async getSchedule(id: string): Promise<FeatureToggleSchedule | null> {

    return this.schedulingDAO.getSchedule(id);


  async getSchedulesByToggle(toggleId: string): Promise<FeatureToggleSchedule[]> {

    return this.schedulingDAO.getSchedulesByToggle(toggleId);


  async querySchedules(query: ScheduleQuery): Promise<{ schedules: FeatureToggleSchedule[]; total: number }> {

    return this.schedulingDAO.querySchedules(query);


  async updateSchedule(request: UpdateScheduleRequest, updatedBy: string): Promise<FeatureToggleSchedule | null> {

    const existing = await this.schedulingDAO.getSchedule(request.id);
    if (!existing) {
      throw new Error(`Schedule with ID ${request.id} not found`);


    // Validate changes
    if (request.startTime || request.endTime) {
      this.validateScheduleTimes(request as CreateScheduleRequest);


    // Update the schedule
    const updated = await this.schedulingDAO.updateSchedule(request, updatedBy);
    if (!updated) return null;

    // Recalculate next execution time if timing changed
    if (request.startTime || request.recurrence) {
      await this.updateNextExecutionTime(updated.id);


    return updated;


  async deleteSchedule(id: string): Promise<boolean> {

    const schedule = await this.schedulingDAO.getSchedule(id);
    if (!schedule) return false;

    // Cancel any pending executions
    if (schedule.status === ScheduleStatus.ACTIVE || schedule.status === ScheduleStatus.PENDING) {
      await this.schedulingDAO.updateSchedule(
        { id, status: ScheduleStatus.CANCELLED },
        'system'
      );


    return this.schedulingDAO.deleteSchedule(id);


  // Schedule execution engine
  async executeScheduledActions(): Promise<void> {

    const now = new Date();
    
    // Get all schedules that should execute now
    const { schedules } = await this.schedulingDAO.querySchedules({
      status: ScheduleStatus.ACTIVE,
      sortBy: 'priority',
      sortOrder: 'desc',
      limit: 1000
    });

    const readySchedules = schedules.filter(schedule => 
      schedule.enabled && 
      schedule.nextExecution && 
      schedule.nextExecution <= now
    );

    for (const schedule of readySchedules) {
      try {
        await this.executeSchedule(schedule);
 catch (error) {
        console.error(`Failed to execute schedule ${schedule.id}:`, error);
        await this.handleExecutionFailure(schedule, error as Error);




  private async executeSchedule(schedule: FeatureToggleSchedule): Promise<void> {

    const startTime = Date.now();
    const executionTime = new Date();

    try {
      // Get current toggle state
      const toggle = await this.featureToggleDAO.getToggle(schedule.toggleId);
      if (!toggle) {
        throw new Error(`Feature toggle ${schedule.toggleId} not found`);


      const beforeValue = toggle.value;
      let afterValue = beforeValue;
      const affectedUsers = 0;

      // Execute the action
      switch (schedule.action) {
      case ScheduleAction.ENABLE:
        await this.featureToggleDAO.updateToggle({
          id: schedule.toggleId,
          enabled: true
        }, 'scheduler');
        break;

      case ScheduleAction.DISABLE:
        await this.featureToggleDAO.updateToggle({
          id: schedule.toggleId,
          enabled: false
        }, 'scheduler');
        break;

      case ScheduleAction.UPDATE_VALUE:
        if (schedule.actionConfig.targetValue !== undefined) {
          await this.featureToggleDAO.updateToggle({
            id: schedule.toggleId,
            value: schedule.actionConfig.targetValue
          }, 'scheduler');
          afterValue = schedule.actionConfig.targetValue;

        break;

      case ScheduleAction.MODIFY_PERCENTAGE:
        if (schedule.actionConfig.rolloutPercentage !== undefined) {
          const newValue = { ...toggle.value };
          if (toggle.type === 'percentage_rollout') {
            newValue.percentage = schedule.actionConfig.rolloutPercentage;

          await this.featureToggleDAO.updateToggle({
            id: schedule.toggleId,
            value: newValue
          }, 'scheduler');
          afterValue = newValue;

        break;

      case ScheduleAction.ACTIVATE_ROLLOUT:
        if (schedule.actionConfig.gradualRollout) {
          await this.handleGradualRollout(schedule);
          return; // Gradual rollout handles its own execution logging

        break;


      // Log successful execution
      await this.schedulingDAO.createExecution({
        scheduleId: schedule.id,
        toggleId: schedule.toggleId,
        executionTime,
        status: ExecutionStatus.SUCCESS,
        triggeredBy: 'scheduler',
        executionContext: {
          timezone: schedule.timezone,
          originalTime: schedule.nextExecution!,
          actualTime: executionTime,
          delay: executionTime.getTime() - schedule.nextExecution!.getTime()

        beforeValue,
        afterValue,
        affectedUsers,
        duration: Date.now() - startTime,
        metadata: {
          action: schedule.action,
          actionConfig: schedule.actionConfig

      });

      // Update schedule execution count and calculate next execution
      await this.updateScheduleExecution(schedule, true);
 catch (error) {
      // Log failed execution
      await this.schedulingDAO.createExecution({
        scheduleId: schedule.id,
        toggleId: schedule.toggleId,
        executionTime,
        status: ExecutionStatus.FAILED,
        triggeredBy: 'scheduler',
        executionContext: {
          timezone: schedule.timezone,
          originalTime: schedule.nextExecution!,
          actualTime: executionTime

        error: {
          code: 'EXECUTION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          retryable: this.isRetryableError(error)

        duration: Date.now() - startTime,
        metadata: {
          action: schedule.action,
          actionConfig: schedule.actionConfig

      });

      await this.updateScheduleExecution(schedule, false);
      throw error;



  private async handleGradualRollout(schedule: FeatureToggleSchedule): Promise<void> {

    const { gradualRollout } = schedule.actionConfig;
    if (!gradualRollout) return;

    const { startPercentage, endPercentage, incrementMinutes } = gradualRollout;
    const currentPercentage = startPercentage;
    const incrementSize = (endPercentage - startPercentage) / Math.ceil(incrementMinutes);

    // This would typically be implemented with a separate background job
    // For now, we'll schedule the next increment
    const nextIncrement = currentPercentage + incrementSize;
    const nextTime = new Date(Date.now() + (incrementMinutes * 60 * 1000));

    if (nextIncrement <= endPercentage) {
      // Create a new schedule for the next increment
      await this.schedulingDAO.createSchedule({
        toggleId: schedule.toggleId,
        name: `${schedule.name} - Increment ${nextIncrement}%`,
        type: ScheduleType.ONE_TIME,
        action: ScheduleAction.MODIFY_PERCENTAGE,
        startTime: nextTime.toISOString(),
        timezone: schedule.timezone,
        actionConfig: {
          rolloutPercentage: nextIncrement

      }, 'scheduler');



  // Conflict detection and resolution
  private async detectScheduleConflicts(request: CreateScheduleRequest): Promise<ScheduleConflict[]> {

    const conflicts: ScheduleConflict[] = [];
    const existingSchedules = await this.schedulingDAO.getSchedulesByToggle(request.toggleId);

    for (const existing of existingSchedules) {
      if (existing.status === ScheduleStatus.CANCELLED || !existing.enabled) continue;

      // Time overlap check
      const hasTimeOverlap = this.checkTimeOverlap(
        new Date(request.startTime),
        request.endTime ? new Date(request.endTime) : undefined,
        existing.startTime,
        existing.endTime
      );

      if (hasTimeOverlap) {
        // Action conflict check
        const hasActionConflict = this.checkActionConflict(request.action, existing.action);
        
        if (hasActionConflict) {
          const conflict: Omit<ScheduleConflict, 'id' | 'detectedAt'> = {
            toggleId: request.toggleId,
            conflictingSchedules: [existing.id],
            conflictType: 'action_conflict',
            severity: this.calculateConflictSeverity(request.action, existing.action),
            description: `Schedule action '${request.action}' conflicts with existing schedule '${existing.action}' during overlapping time period`,
            autoResolvable: this.isAutoResolvableConflict(request.action, existing.action),
            suggestedResolution: this.generateResolutionSuggestion(request, existing)
          };

          conflicts.push(conflict);




    return conflicts;


  private checkTimeOverlap(start1: Date, end1: Date | undefined, start2: Date, end2: Date | undefined): boolean {
    // If either schedule has no end time, treat as ongoing
    const effectiveEnd1 = end1 || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
    const effectiveEnd2 = end2 || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    return start1 < effectiveEnd2 && start2 < effectiveEnd1;


  private checkActionConflict(action1: ScheduleAction, action2: ScheduleAction): boolean {
    const conflictingActions = [
      [ScheduleAction.ENABLE, ScheduleAction.DISABLE],
      [ScheduleAction.UPDATE_VALUE, ScheduleAction.UPDATE_VALUE] // Same action with different values
    ];

    return conflictingActions.some(([a1, a2]) => 
      (action1 === a1 && action2 === a2) || (action1 === a2 && action2 === a1)
    );


  private calculateConflictSeverity(action1: ScheduleAction, action2: ScheduleAction): 'low' | 'medium' | 'high' | 'critical' {
    if (action1 === ScheduleAction.DISABLE || action2 === ScheduleAction.DISABLE) {
      return 'critical';

    if (action1 === ScheduleAction.UPDATE_VALUE && action2 === ScheduleAction.UPDATE_VALUE) {
      return 'high';

    return 'medium';


  private isAutoResolvableConflict(action1: ScheduleAction, action2: ScheduleAction): boolean {
    // Some conflicts can be auto-resolved based on priority
    return action1 !== ScheduleAction.DISABLE && action2 !== ScheduleAction.DISABLE;


  private generateResolutionSuggestion(_____newRequest: CreateScheduleRequest, _____existing: FeatureToggleSchedule): unknown {
    return {
      action: 'modify_priority',
      details: {
        suggestion: 'Adjust schedule priority to determine execution order',
        options: [
          { action: 'increase_new_priority', description: 'Give new schedule higher priority' },
          { action: 'decrease_existing_priority', description: 'Lower existing schedule priority' },
          { action: 'reschedule_one', description: 'Modify timing of one schedule' }
        ]

    };


  private async handleScheduleConflicts(schedule: FeatureToggleSchedule, conflicts: ScheduleConflict[]): Promise<void> {

    for (const conflict of conflicts) {
      await this.schedulingDAO.createConflict(conflict);

      // Auto-resolve if possible
      if (conflict.autoResolvable && conflict.suggestedResolution) {
        try {
          await this.autoResolveConflict(schedule, conflict);
 catch (error) {
          console.warn(`Failed to auto-resolve conflict ${conflict.description}:`, error);





  private async autoResolveConflict(schedule: FeatureToggleSchedule, conflict: ScheduleConflict): Promise<void> {

    const { suggestedResolution } = conflict;
    if (!suggestedResolution) return;

    switch (suggestedResolution.action) {
    case 'modify_priority':
      // Increase new schedule priority by 1
      await this.schedulingDAO.updateSchedule(
        { id: schedule.id, priority: schedule.priority + 1 },
        'auto-resolver'
      );
      break;



  // Utility methods
  private validateScheduleTimes(request: CreateScheduleRequest | UpdateScheduleRequest): void {
    const now = new Date();
    const startTime = new Date(request.startTime!);

    if (startTime <= now) {
      throw new Error('Schedule start time must be in the future');


    if (request.endTime) {
      const endTime = new Date(request.endTime);
      if (endTime <= startTime) {
        throw new Error('Schedule end time must be after start time');



    // Validate recurrence
    if (request.recurrence) {
      const { type, interval } = request.recurrence;
      if (interval <= 0) {
        throw new Error('Recurrence interval must be positive');


      if (type === RecurrenceType.WEEKLY && request.recurrence.daysOfWeek) {
        const validDays = request.recurrence.daysOfWeek.every(day => day >= 0 && day <= 6);
        if (!validDays) {
          throw new Error('Days of week must be between 0 (Sunday) and 6 (Saturday)');



      if (type === RecurrenceType.MONTHLY && request.recurrence.daysOfMonth) {
        const validDays = request.recurrence.daysOfMonth.every(day => day >= 1 && day <= 31);
        if (!validDays) {
          throw new Error('Days of month must be between 1 and 31');





  private async updateNextExecutionTime(scheduleId: string): Promise<void> {

    const schedule = await this.schedulingDAO.getSchedule(scheduleId);
    if (!schedule) return;

    const nextExecution = this.calculateNextExecution(schedule);
    
    await this.schedulingDAO.updateSchedule(
      { id: scheduleId, nextExecution },
      'system'
    );


  private calculateNextExecution(schedule: FeatureToggleSchedule): Date | undefined {
    const now = new Date();
    
    // One-time schedules
    if (schedule.type === ScheduleType.ONE_TIME) {
      return schedule.startTime > now ? schedule.startTime : undefined;


    // Recurring schedules
    if (schedule.type === ScheduleType.RECURRING && schedule.recurrence) {
      const { type, interval } = schedule.recurrence;
      const nextDate = new Date(schedule.startTime);

      // If start time has passed, calculate next occurrence
      if (nextDate <= now) {
        switch (type) {
        case RecurrenceType.DAILY:
          while (nextDate <= now) {
            nextDate.setDate(nextDate.getDate() + interval);

          break;

        case RecurrenceType.WEEKLY:
          while (nextDate <= now) {
            nextDate.setDate(nextDate.getDate() + (7 * interval));

          break;

        case RecurrenceType.MONTHLY:
          while (nextDate <= now) {
            nextDate.setMonth(nextDate.getMonth() + interval);

          break;

        case RecurrenceType.YEARLY:
          while (nextDate <= now) {
            nextDate.setFullYear(nextDate.getFullYear() + interval);

          break;



      // Check if within end date bounds
      if (schedule.endTime && nextDate > schedule.endTime) {
        return undefined;


      // Check max occurrences
      if (schedule.recurrence.maxOccurrences && 
          schedule.executionCount >= schedule.recurrence.maxOccurrences) {
        return undefined;


      return nextDate;


    return undefined;


  private async updateScheduleExecution(schedule: FeatureToggleSchedule, success: boolean): Promise<void> {

    const updates: unknown = {
      id: schedule.id,
      lastExecution: new Date(),
      executionCount: schedule.executionCount + 1
    };

    if (!success) {
      updates.failureCount = schedule.failureCount + 1;


    // Calculate next execution
    const nextExecution = this.calculateNextExecution({
      ...schedule,
      executionCount: updates.executionCount
    });

    if (!nextExecution) {
      updates.status = ScheduleStatus.COMPLETED;
 else {
      updates.nextExecution = nextExecution;


    await this.schedulingDAO.updateSchedule(updates, 'system');


  private async handleExecutionFailure(schedule: FeatureToggleSchedule, error: Error): Promise<void> {

    const isRetryable = this.isRetryableError(error);
    const maxRetries = 3;

    if (isRetryable && schedule.failureCount < maxRetries) {
      // Schedule retry in 5 minutes
      const retryTime = new Date(Date.now() + 5 * 60 * 1000);
      await this.schedulingDAO.updateSchedule(
        { id: schedule.id, nextExecution: retryTime },
        'system'
      );
 else {
      // Mark as failed
      await this.schedulingDAO.updateSchedule(
        { id: schedule.id, status: ScheduleStatus.FAILED },
        'system'
      );



  private isRetryableError(error: Error): boolean {
    // Define which errors are retryable
    const retryableErrors = [
      'NETWORK_ERROR',
      'TIMEOUT',
      'TEMPORARY_FAILURE',
      'RATE_LIMIT'
    ];

    if (error.code && retryableErrors.includes(error.code)) {
      return true;


    // Check error message for retryable patterns
    const message = error.message?.toLowerCase() || '';
    return message.includes('timeout') || 
           message.includes('network') || 
           message.includes('temporary');


  // Analytics
  async getScheduleAnalytics(startDate?: Date, endDate?: Date): Promise<ScheduleAnalytics> {

    return this.schedulingDAO.getScheduleAnalytics(startDate, endDate);


  async getExecutionsBySchedule(scheduleId: string, limit = 100): Promise<ScheduleExecution[]> {

    return this.schedulingDAO.getExecutionsBySchedule(scheduleId, limit);


  async getUnresolvedConflicts(): Promise<ScheduleConflict[]> {

    return this.schedulingDAO.getUnresolvedConflicts();

