/**
 * Automated Rollback System
 * Monitors system health and triggers rollbacks when thresholds are exceeded
 */

import { EventEmitter } from 'events';
import { monitoring, MonitoringService } from '../monitoring/MonitoringService';
import { safety } from './SafetyFramework';
import { RollbackOrchestrator } from '../../scripts/rollback/rollback-orchestrator';

export interface RollbackTrigger {
  id: string;
  name: string;
  condition: RollbackCondition;
  action: RollbackAction;
  cooldown: number; // minutes
  enabled: boolean;
}

export interface RollbackCondition {
  metric: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  threshold: number;
  duration?: number; // seconds - condition must be true for this long
  aggregate?: 'avg' | 'sum' | 'max' | 'min' | 'count';
}

export interface RollbackAction {
  type: 'full' | 'frontend' | 'backend' | 'database' | 'feature';
  reason: string;
  notifyBeforeAction?: boolean;
  requireConfirmation?: boolean;
}

export interface RollbackDecision {
  trigger: RollbackTrigger;
  metricValue: number;
  shouldRollback: boolean;
  reason: string;
  timestamp: Date;
}

/**
 * Automated rollback manager
 */
export class AutomatedRollbackManager extends EventEmitter {
  private static instance: AutomatedRollbackManager;
  private triggers: Map<string, RollbackTrigger> = new Map();
  private lastTriggerTime: Map<string, Date> = new Map();
  private monitoringInterval?: NodeJS.Timer;
  private conditionTracking: Map<string, Date> = new Map();
  
  static getInstance(): AutomatedRollbackManager {
    if (!this.instance) {
      this.instance = new AutomatedRollbackManager();
    }
    return this.instance;
  }
  
  constructor() {
    super();
    this.initializeDefaultTriggers();
  }
  
  /**
   * Initialize default rollback triggers
   */
  private initializeDefaultTriggers(): void {
    // Critical error rate trigger
    this.addTrigger({
      id: 'critical-error-rate',
      name: 'Critical Error Rate',
      condition: {
        metric: 'errors.rate',
        operator: '>',
        threshold: 1, // 1% error rate
        duration: 60, // sustained for 1 minute
        aggregate: 'avg',
      },
      action: {
        type: 'full',
        reason: 'Error rate exceeded 1% for 1 minute',
        notifyBeforeAction: true,
        requireConfirmation: false,
      },
      cooldown: 30,
      enabled: true,
    });
    
    // Performance degradation trigger
    this.addTrigger({
      id: 'performance-degradation',
      name: 'Performance Degradation',
      condition: {
        metric: 'response_time',
        operator: '>',
        threshold: 5000, // 5 seconds
        duration: 120, // sustained for 2 minutes
        aggregate: 'avg',
      },
      action: {
        type: 'backend',
        reason: 'Response time exceeded 5s for 2 minutes',
        notifyBeforeAction: true,
        requireConfirmation: true,
      },
      cooldown: 60,
      enabled: true,
    });
    
    // Memory leak trigger
    this.addTrigger({
      id: 'memory-leak',
      name: 'Memory Leak Detection',
      condition: {
        metric: 'memory.usage',
        operator: '>',
        threshold: 1024 * 1024 * 1024, // 1GB
        duration: 300, // sustained for 5 minutes
        aggregate: 'max',
      },
      action: {
        type: 'backend',
        reason: 'Memory usage exceeded 1GB for 5 minutes',
        notifyBeforeAction: true,
        requireConfirmation: true,
      },
      cooldown: 120,
      enabled: true,
    });
    
    // Database connection failure
    this.addTrigger({
      id: 'database-failure',
      name: 'Database Connection Failure',
      condition: {
        metric: 'database.connections.failed',
        operator: '>',
        threshold: 10,
        duration: 30,
        aggregate: 'sum',
      },
      action: {
        type: 'database',
        reason: 'Database connection failures exceeded threshold',
        notifyBeforeAction: false,
        requireConfirmation: false,
      },
      cooldown: 15,
      enabled: true,
    });
    
    // Feature flag error spike
    this.addTrigger({
      id: 'feature-flag-errors',
      name: 'Feature Flag Error Spike',
      condition: {
        metric: 'feature_flag.errors',
        operator: '>',
        threshold: 100,
        duration: 60,
        aggregate: 'count',
      },
      action: {
        type: 'feature',
        reason: 'Feature flag errors exceeded 100 in 1 minute',
        notifyBeforeAction: false,
        requireConfirmation: false,
      },
      cooldown: 30,
      enabled: true,
    });
  }
  
  /**
   * Add a rollback trigger
   */
  addTrigger(trigger: RollbackTrigger): void {
    this.triggers.set(trigger.id, trigger);
    this.emit('trigger-added', trigger);
  }
  
  /**
   * Remove a rollback trigger
   */
  removeTrigger(triggerId: string): void {
    this.triggers.delete(triggerId);
    this.emit('trigger-removed', triggerId);
  }
  
  /**
   * Enable/disable a trigger
   */
  setTriggerEnabled(triggerId: string, enabled: boolean): void {
    const trigger = this.triggers.get(triggerId);
    if (trigger) {
      trigger.enabled = enabled;
      this.emit('trigger-updated', trigger);
    }
  }
  
  /**
   * Start monitoring for rollback conditions
   */
  startMonitoring(intervalSeconds: number = 10): void {
    if (this.monitoringInterval) {
      this.stopMonitoring();
    }
    
    this.monitoringInterval = setInterval(() => {
      this.checkAllTriggers();
    }, intervalSeconds * 1000);
    
    this.emit('monitoring-started');
  }
  
  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
      this.emit('monitoring-stopped');
    }
  }
  
  /**
   * Check all active triggers
   */
  private async checkAllTriggers(): Promise<void> {
    for (const trigger of this.triggers.values()) {
      if (!trigger.enabled) continue;
      
      try {
        const decision = await this.evaluateTrigger(trigger);
        
        if (decision.shouldRollback) {
          await this.handleRollbackDecision(decision);
        }
      } catch (error) {
        console.error(`Error evaluating trigger ${trigger.id}:`, error);
      }
    }
  }
  
  /**
   * Evaluate a single trigger
   */
  private async evaluateTrigger(trigger: RollbackTrigger): Promise<RollbackDecision> {
    const { condition } = trigger;
    
    // Get metric value
    const stats = monitoring.getMetricStats(condition.metric, 5); // Last 5 minutes
    if (!stats) {
      return {
        trigger,
        metricValue: 0,
        shouldRollback: false,
        reason: 'No metric data available',
        timestamp: new Date(),
      };
    }
    
    // Get aggregated value
    let metricValue: number;
    switch (condition.aggregate || 'avg') {
      case 'avg': metricValue = stats.avg; break;
      case 'max': metricValue = stats.max; break;
      case 'min': metricValue = stats.min; break;
      case 'sum': metricValue = stats.avg * 300; break; // Approximate sum
      case 'count': metricValue = monitoring.getMetrics(condition.metric)[condition.metric]?.length || 0; break;
      default: metricValue = stats.avg;
    }
    
    // Check condition
    let conditionMet = false;
    switch (condition.operator) {
      case '>': conditionMet = metricValue > condition.threshold; break;
      case '<': conditionMet = metricValue < condition.threshold; break;
      case '>=': conditionMet = metricValue >= condition.threshold; break;
      case '<=': conditionMet = metricValue <= condition.threshold; break;
      case '==': conditionMet = metricValue === condition.threshold; break;
      case '!=': conditionMet = metricValue !== condition.threshold; break;
    }
    
    // Check duration requirement
    if (conditionMet && condition.duration) {
      const trackingKey = `${trigger.id}-condition`;
      const firstSeen = this.conditionTracking.get(trackingKey);
      
      if (!firstSeen) {
        // First time seeing this condition
        this.conditionTracking.set(trackingKey, new Date());
        conditionMet = false; // Don't trigger yet
      } else {
        // Check if duration requirement met
        const durationMet = (Date.now() - firstSeen.getTime()) >= condition.duration * 1000;
        if (!durationMet) {
          conditionMet = false; // Still waiting
        }
      }
    } else if (!conditionMet) {
      // Clear tracking if condition no longer met
      const trackingKey = `${trigger.id}-condition`;
      this.conditionTracking.delete(trackingKey);
    }
    
    // Check cooldown
    if (conditionMet) {
      const lastTrigger = this.lastTriggerTime.get(trigger.id);
      if (lastTrigger) {
        const cooldownMs = trigger.cooldown * 60 * 1000;
        if (Date.now() - lastTrigger.getTime() < cooldownMs) {
          conditionMet = false; // Still in cooldown
        }
      }
    }
    
    return {
      trigger,
      metricValue,
      shouldRollback: conditionMet,
      reason: conditionMet ? 
        `${condition.metric} ${condition.operator} ${condition.threshold} (current: ${metricValue.toFixed(2)})` :
        'Condition not met',
      timestamp: new Date(),
    };
  }
  
  /**
   * Handle a rollback decision
   */
  private async handleRollbackDecision(decision: RollbackDecision): Promise<void> {
    const { trigger, reason } = decision;
    
    // Record trigger time
    this.lastTriggerTime.set(trigger.id, new Date());
    
    // Clear condition tracking
    this.conditionTracking.delete(`${trigger.id}-condition`);
    
    // Emit decision event
    this.emit('rollback-decision', decision);
    
    // Log decision
    console.error(`AUTOMATED ROLLBACK TRIGGERED: ${trigger.name}`);
    console.error(`Reason: ${reason}`);
    
    // Record metric
    monitoring.recordMetric('rollback.automated.triggered', 1, {
      trigger: trigger.id,
      type: trigger.action.type,
    });
    
    // Handle notifications
    if (trigger.action.notifyBeforeAction) {
      await this.sendNotification(decision);
    }
    
    // Check if confirmation required
    if (trigger.action.requireConfirmation) {
      // In a real system, this would wait for manual confirmation
      console.log('ROLLBACK REQUIRES CONFIRMATION - Waiting for manual approval');
      this.emit('rollback-pending-confirmation', decision);
      return;
    }
    
    // Execute rollback
    try {
      const orchestrator = RollbackOrchestrator.getInstance();
      const result = await orchestrator.executeRollback({
        type: trigger.action.type,
        reason: trigger.action.reason,
        dryRun: false,
      });
      
      this.emit('rollback-executed', { decision, result });
      
      if (!result.success) {
        console.error('ROLLBACK FAILED:', result.errors);
      }
    } catch (error) {
      console.error('ROLLBACK EXECUTION ERROR:', error);
      this.emit('rollback-error', { decision, error });
    }
  }
  
  /**
   * Send notification about rollback
   */
  private async sendNotification(decision: RollbackDecision): Promise<void> {
    const message = {
      severity: 'critical',
      title: `Automated Rollback: ${decision.trigger.name}`,
      description: decision.reason,
      trigger: decision.trigger.id,
      action: decision.trigger.action.type,
      timestamp: decision.timestamp,
    };
    
    // In a real system, this would send to various channels
    console.log('NOTIFICATION:', message);
    this.emit('notification-sent', message);
  }
  
  /**
   * Get all triggers
   */
  getTriggers(): RollbackTrigger[] {
    return Array.from(this.triggers.values());
  }
  
  /**
   * Get trigger status
   */
  getTriggerStatus(triggerId: string): {
    trigger: RollbackTrigger;
    lastTriggered?: Date;
    inCooldown: boolean;
    conditionTracking?: Date;
  } | null {
    const trigger = this.triggers.get(triggerId);
    if (!trigger) return null;
    
    const lastTriggered = this.lastTriggerTime.get(triggerId);
    const conditionTracking = this.conditionTracking.get(`${triggerId}-condition`);
    
    let inCooldown = false;
    if (lastTriggered) {
      const cooldownMs = trigger.cooldown * 60 * 1000;
      inCooldown = Date.now() - lastTriggered.getTime() < cooldownMs;
    }
    
    return {
      trigger,
      lastTriggered,
      inCooldown,
      conditionTracking,
    };
  }
}

// Export singleton instance
export const automatedRollback = AutomatedRollbackManager.getInstance();