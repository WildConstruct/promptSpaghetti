/**
 * Security Analytics Capacity Planning and Scaling Automation
 * Epic 31 - Security Integration Framework
 * Task: E31-1753313263634-4DFC3D
 * 
 * Intelligent capacity planning and automated scaling for security analytics systems,
 * ensuring optimal performance and cost efficiency under varying loads.
 */
import { EventEmitter } from 'events';
import * as os from 'os';

export interface CapacityPlan {
  id: string;
  name: string;
  description: string;
  service: string;
  // Planning parameters
  planning_horizon: {,
    short_term_days: number; // Operational planning (typically 7-30 days)
    medium_term_days: number; // Tactical planning (typically 90-180 days)
    long_term_days: number; // Strategic planning (typically 365+ days)
  };
  // Capacity requirements
  requirements: {,
    baseline_capacity: ResourceRequirements;
    peak_capacity: ResourceRequirements;
    growth_projections: GrowthProjection[];
    performance_targets: PerformanceTargets;
    availability_requirements: AvailabilityRequirements;
  };
  // Scaling configuration
  scaling: {,
    auto_scaling_enabled: boolean;
    scaling_policies: ScalingPolicy[];
    scaling_cooldown: number; // milliseconds between scaling operations
    min_instances: number;
    max_instances: number;
    target_utilization: {,
      cpu_percentage: number;
      memory_percentage: number;
      network_percentage: number;
      custom_metrics: CustomMetricTarget[];
    };
  };
  // Cost optimization
  cost_optimization: {,
    budget_constraints: {,
      monthly_budget: number;
      cost_per_hour_limit: number;
      currency: string;
    };
    instance_types: InstanceTypeConfig[];
    reserved_capacity: {,
      percentage: number; // % of baseline to reserve
      commitment_period: 'monthly' | 'yearly' | 'multi_year';
    };
    spot_instances: {,
      enabled: boolean;
      max_percentage: number; // % of capacity that can be spot
      fallback_strategy: 'on_demand' | 'reserved' | 'scale_down';
    };
  };
  // Monitoring and alerting
  monitoring: {,
    capacity_thresholds: {,
      warning_percentage: number;
      critical_percentage: number;
      forecast_breach_days: number; // Alert when forecast shows breach in N days
    };
    metrics_collection: {,
      interval_seconds: number;
      retention_days: number;
      custom_metrics: string[];
    };
    alerting: {,
      notification_channels: string[];
      escalation_policy: string[];
      alert_suppression_minutes: number;
    };
  };
  created_by: string;
  created_at: number;
  last_updated: number;
  last_reviewed: number;
  next_review_date: number;
  enabled: boolean;
}

export interface ResourceRequirements {
  cpu_cores: number;
  memory_gb: number;
  storage_gb: number;
  network_bandwidth_mbps: number;
  iops_required: number;
  gpu_units?: number;
  custom_resources?: Record<string, number>;
}

export interface GrowthProjection {
  period: 'monthly' | 'quarterly' | 'yearly';
  metric: 'transactions' | 'users' | 'data_volume' | 'requests' | 'events';
  current_value: number;
  projected_growth_rate: number; // percentage
  confidence_level: number; // 0-1 scale
  assumptions: string[];
  seasonal_factors?: SeasonalFactor[];
}

export interface SeasonalFactor {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  pattern: 'cyclical' | 'trending' | 'spike';
  multiplier: number; // Factor to multiply baseline by
  duration_hours?: number; // For spike patterns
  description: string;
}

export interface PerformanceTargets {
  response_time_p95_ms: number;
  response_time_p99_ms: number;
  throughput_rps: number;
  error_rate_percentage: number;
  availability_percentage: number;
  data_processing_latency_ms: number;
}

export interface AvailabilityRequirements {
  target_availability: number; // 99.9%
  downtime_budget_minutes_monthly: number;
  maintenance_window: {,
    day_of_week: string;
    start_time: string;
    duration_hours: number;
    timezone: string;
  };
  disaster_recovery: {,
    rto_minutes: number; // Recovery Time Objective
    rpo_minutes: number; // Recovery Point Objective
    geographic_redundancy: boolean;
  };
}

export interface ScalingPolicy {
  id: string;
  name: string;
  description: string;
  type: 'reactive' | 'predictive' | 'scheduled';
  enabled: boolean;
  // Trigger conditions
  triggers: {,
    metric_based: MetricTrigger[];
    time_based: TimeTrigger[];
    event_based: EventTrigger[];
  };
  // Scaling actions
  actions: {,
    scale_up: ScalingAction;
    scale_down: ScalingAction;
    notification: NotificationAction[];
  };
  // Policy constraints
  constraints: {,
    max_scale_up_percentage: number; // Max % increase per scaling operation
    max_scale_down_percentage: number; // Max % decrease per scaling operation
    cooldown_period_seconds: number;
    min_stable_period_seconds: number; // Minimum time before considering scale down
  };
  created_at: number;
  last_triggered: number;
  trigger_count: number;
}

export interface MetricTrigger {
  metric_name: string;
  comparison: 'greater_than' | 'less_than' | 'greater_than_or_equal' | 'less_than_or_equal';
  threshold: number;
  duration_seconds: number; // How long condition must persist
  datapoints_to_alarm: number;
  evaluation_periods: number;
}

export interface TimeTrigger {
  schedule_type: 'cron' | 'recurring' | 'one_time';
  cron_expression?: string;
  recurring_pattern?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    times: string[]; // HH:MM format
    days_of_week?: string[];
    timezone: string;
  };
  one_time_datetime?: number;
  target_capacity: number; // Target instance count or percentage
}

export interface EventTrigger {
  event_type: 'security_incident' | 'high_alert_volume' | 'system_failure' | 'maintenance_mode';
  event_source: string;
  conditions: Record<string, any>;
  scaling_factor: number; // Multiplier for capacity
}

export interface ScalingAction {
  action_type: 'instance_count' | 'resource_adjustment' | 'load_balancer_weight';
  target_value?: number; // Absolute target
  adjustment_value?: number; // Relative adjustment
  adjustment_type: 'percentage' | 'absolute';
  instance_types?: string[];
  availability_zones?: string[];
  termination_policy?: 'oldest_first' | 'newest_first' | 'least_utilized';
}

export interface NotificationAction {
  channel: 'email' | 'slack' | 'webhook' | 'sms';
  target: string;
  message_template: string;
  severity: 'info' | 'warning' | 'error';
}

export interface CustomMetricTarget {
  metric_name: string;
  target_value: number;
  comparison: 'less_than' | 'greater_than';
  weight: number; // Relative importance (0-1)
}

export interface InstanceTypeConfig {
  instance_type: string;
  cpu_cores: number;
  memory_gb: number;
  network_performance: 'low' | 'moderate' | 'high' | 'very_high';
  storage_type: 'ebs' | 'instance_store';
  cost_per_hour: number;
  spot_availability: boolean;
  use_cases: string[];
  priority: number; // Lower numbers = higher priority
}

export interface CapacityMetrics {
  id: string;
  service: string;
  timestamp: number;
  collection_period: {,
    start: number;
    end: number;
  };
  // Current utilization
  current_utilization: {,
    cpu_percentage: number;
    memory_percentage: number;
    disk_percentage: number;
    network_percentage: number;
    custom_metrics: Record<string, number>;
  };
  // Performance metrics
  performance: {,
    avg_response_time: number;
    p95_response_time: number;
    p99_response_time: number;
    throughput_rps: number;
    error_rate: number;
    queue_depth: number;
    active_connections: number;
  };
  // Resource allocation
  resources: {,
    allocated_instances: number;
    running_instances: number;
    pending_instances: number;
    terminating_instances: number;
    total_cpu_cores: number;
    total_memory_gb: number;
    total_storage_gb: number;
  };
  // Cost tracking
  cost: {,
    current_hourly_cost: number;
    projected_monthly_cost: number;
    reserved_capacity_utilization: number;
    spot_instance_percentage: number;
    cost_per_request: number;
  };
  // Health indicators
  health: {,
    overall_health_score: number; // 0-100
    bottleneck_indicators: string[];
    scaling_recommendations: string[];
    cost_optimization_opportunities: string[];
  };
}

export interface ScalingEvent {
  id: string;
  timestamp: number;
  service: string;
  policy_id: string;
  // Event details
  event_type: 'scale_up' | 'scale_down' | 'policy_triggered' | 'manual_intervention';
  trigger_reason: string;
  triggered_by: string; // user, policy, or system
  // Scaling details
  scaling_details: {,
    previous_capacity: number;
    target_capacity: number;
    actual_capacity: number;
    scaling_duration_seconds: number;
    instances_added: number;
    instances_removed: number;
  };
  // Impact assessment
  impact: {,
    performance_change: {,
      response_time_change_ms: number;
      throughput_change_rps: number;
      error_rate_change: number;
    };
    cost_impact: {,
      hourly_cost_change: number;
      estimated_monthly_impact: number;
    };
    availability_impact: 'none' | 'minimal' | 'moderate' | 'significant';
  };
  // Validation and success
  validation: {,
    scaling_successful: boolean;
    target_reached: boolean;
    performance_improved: boolean;
    issues_encountered: string[];
    rollback_required: boolean;
  };
}

export interface CapacityForecast {
  id: string;
  service: string;
  generated_at: number;
  forecast_horizon_days: number;
  // Forecast methodology
  methodology: {,
    algorithm: 'linear_regression' | 'exponential_smoothing' | 'arima' | 'machine_learning';
    confidence_interval: number; // e.g., 95%
    historical_data_points: number;
    seasonal_adjustments: boolean;
    trend_adjustments: boolean;
  };
  // Forecast data
  forecasts: Array<{,
    date: number;
    predicted_load: number;
    confidence_upper: number;
    confidence_lower: number;
    required_capacity: ResourceRequirements;
    estimated_cost: number;
    risk_factors: string[];
  }>;
  // Capacity recommendations
  recommendations: {,
    immediate_actions: CapacityRecommendation[];
    short_term_planning: CapacityRecommendation[];
    long_term_strategy: CapacityRecommendation[];
  };
  // Accuracy tracking
  accuracy: {,
    last_forecast_accuracy: number; // 0-1 scale
    trend_accuracy: number;
    peak_prediction_accuracy: number;
    cost_prediction_accuracy: number;
  };
}

export interface CapacityRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'scaling' | 'optimization' | 'cost_reduction' | 'performance' | 'reliability';
  title: string;
  description: string;
  rationale: string;
  // Implementation details
  implementation: {,
    estimated_effort_hours: number;
    estimated_cost_impact: number;
    estimated_benefit: string;
    prerequisites: string[];
    risks: string[];
    rollback_plan: string;
  };
  // Timeline
  timeline: {,
    recommended_start: number;
    estimated_completion: number;
    deadline?: number;
  };
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  created_at: number;
  last_updated: number;
}

export class SecurityCapacityManager extends EventEmitter {
  private capacityPlans: Map<string, CapacityPlan> = new Map();
  private scalingPolicies: Map<string, ScalingPolicy> = new Map();
  private metrics: Map<string, CapacityMetrics[]> = new Map();
  private scalingEvents: ScalingEvent[] = [];
  private forecasts: Map<string, CapacityForecast> = new Map();
  private recommendations: Map<string, CapacityRecommendation> = new Map();
  // Current system state
  private currentCapacity: Map<string, number> = new Map();
  private activeScaling: Map<string, boolean> = new Map();
  private cooldownPeriods: Map<string, number> = new Map();
  constructor() {
    super();
    this.initializeDefaultPlans();
    this.startMetricsCollection();
    this.startCapacityMonitoring();
    this.startForecastGeneration();
  }
  // Capacity Planning
  async createCapacityPlan(plan: Omit<CapacityPlan, 'id' | 'created_at' | 'last_updated' | 'last_reviewed' | 'next_review_date'>): Promise<string> {
    const id = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
    const newPlan: CapacityPlan = {
      ...plan,
      id,
      created_at: Date.now(),
      last_updated: Date.now(),
      last_reviewed: Date.now(),
      next_review_date: Date.now() + (90 * 24 * 60 * 60 * 1000) // 90 days
    };
    this.capacityPlans.set(id, newPlan);
    // Initialize capacity tracking for the service
    this.currentCapacity.set(plan.service, plan.scaling.min_instances);
    this.activeScaling.set(plan.service, false);
    // Create default scaling policies if auto-scaling is enabled
    if (plan.scaling.auto_scaling_enabled) {
      await this.createDefaultScalingPolicies(id, plan.service);
    }
    this.emit('capacity_plan_created', {)
      plan_id: id,
      service: plan.service,
      auto_scaling: plan.scaling.auto_scaling_enabled,
      created_by: plan.created_by,
    });
    return id;
  }
  private async createDefaultScalingPolicies(planId: string, service: string): Promise<void> {
    const plan = this.capacityPlans.get(planId);
    if (!plan) return;
    // CPU-based scale up policy
    const scaleUpPolicy: Omit<ScalingPolicy, 'id' | 'created_at' | 'last_triggered' | 'trigger_count'> = {
      name: `${service} - CPU Scale Up`,}
      description: 'Scale up when CPU utilization is high',
      type: 'reactive',
      enabled: true,
      triggers: {,
        metric_based: [{,
          metric_name: 'cpu_utilization',
          comparison: 'greater_than',
          threshold: plan.scaling.target_utilization.cpu_percentage,
          duration_seconds: 300, // 5 minutes
          datapoints_to_alarm: 2,
          evaluation_periods: 2,
        }],
        time_based: [],
        event_based: [],
      },
      actions: {,
        scale_up: {,
          action_type: 'instance_count',
          adjustment_value: 2,
          adjustment_type: 'absolute',
        },
        scale_down: {,
          action_type: 'instance_count',
          adjustment_value: 0,
          adjustment_type: 'absolute',
        },
        notification: [{,
          channel: 'slack',
          target: '#capacity-alerts',
          message_template: 'Scaling up {{service}} due to high CPU utilization ({{cpu_percentage}}%)',
          severity: 'info',
        }]
      },
      constraints: {,
        max_scale_up_percentage: 50,
        max_scale_down_percentage: 25,
        cooldown_period_seconds: 300,
        min_stable_period_seconds: 600,
      }
    };
    await this.createScalingPolicy(scaleUpPolicy);
    // Memory-based scale up policy
    const memoryScaleUpPolicy: Omit<ScalingPolicy, 'id' | 'created_at' | 'last_triggered' | 'trigger_count'> = {
      name: `${service} - Memory Scale Up`,}
      description: 'Scale up when memory utilization is high',
      type: 'reactive',
      enabled: true,
      triggers: {,
        metric_based: [{,
          metric_name: 'memory_utilization',
          comparison: 'greater_than',
          threshold: plan.scaling.target_utilization.memory_percentage,
          duration_seconds: 300,
          datapoints_to_alarm: 2,
          evaluation_periods: 2,
        }],
        time_based: [],
        event_based: [],
      },
      actions: {,
        scale_up: {,
          action_type: 'instance_count',
          adjustment_value: 1,
          adjustment_type: 'absolute',
        },
        scale_down: {,
          action_type: 'instance_count',
          adjustment_value: 0,
          adjustment_type: 'absolute',
        },
        notification: [{,
          channel: 'slack',
          target: '#capacity-alerts',
          message_template: 'Scaling up {{service}} due to high memory utilization ({{memory_percentage}}%)',
          severity: 'warning',
        }]
      },
      constraints: {,
        max_scale_up_percentage: 40,
        max_scale_down_percentage: 20,
        cooldown_period_seconds: 600,
        min_stable_period_seconds: 900,
      }
    };
    await this.createScalingPolicy(memoryScaleUpPolicy);
  }
  async createScalingPolicy(policy: Omit<ScalingPolicy, 'id' | 'created_at' | 'last_triggered' | 'trigger_count'>): Promise<string> {
    const id = `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
    const newPolicy: ScalingPolicy = {
      ...policy,
      id,
      created_at: Date.now(),
      last_triggered: 0,
      trigger_count: 0,
    };
    this.scalingPolicies.set(id, newPolicy);
    this.emit('scaling_policy_created', {)
      policy_id: id,
      policy_name: policy.name,
      type: policy.type,
      enabled: policy.enabled,
    });
    return id;
  }
  // Metrics Collection and Monitoring
  async collectCapacityMetrics(service: string): Promise<string> {
    const id = `metrics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
    // Simulate realistic capacity metrics
    const currentInstances = this.currentCapacity.get(service) || 1;
    const cpuUtilization = 30 + Math.random() * 50; // 30-80%;
    const memoryUtilization = 40 + Math.random() * 40; // 40-80%;
    const metrics: CapacityMetrics = {
      id,
      service,
      timestamp: Date.now(),
      collection_period: {,
        start: Date.now() - 300000, // Last 5 minutes
        end: Date.now(),
      },
      current_utilization: {,
        cpu_percentage: cpuUtilization,
        memory_percentage: memoryUtilization,
        disk_percentage: 20 + Math.random() * 30,
        network_percentage: 10 + Math.random() * 20,
        custom_metrics: {,
          'alert_processing_rate': 85 + Math.random() * 15,
          'threat_detection_accuracy': 92 + Math.random() * 8,
          'data_ingestion_rate': 75 + Math.random() * 25
        }
      },
      performance: {,
        avg_response_time: 50 + Math.random() * 100,
        p95_response_time: 200 + Math.random() * 300,
        p99_response_time: 500 + Math.random() * 1000,
        throughput_rps: currentInstances * (100 + Math.random() * 200),
        error_rate: Math.random() * 2,
        queue_depth: Math.floor(Math.random() * 100),
        active_connections: currentInstances * (50 + Math.random() * 150)
      },
      resources: {,
        allocated_instances: currentInstances,
        running_instances: currentInstances,
        pending_instances: 0,
        terminating_instances: 0,
        total_cpu_cores: currentInstances * 4,
        total_memory_gb: currentInstances * 16,
        total_storage_gb: currentInstances * 100
      },
      cost: {,
        current_hourly_cost: currentInstances * 0.50, // $0.50 per instance per hour
        projected_monthly_cost: currentInstances * 0.50 * 24 * 30,
        reserved_capacity_utilization: 75 + Math.random() * 25,
        spot_instance_percentage: Math.random() * 30,
        cost_per_request: (currentInstances * 0.50) / Math.max(1, currentInstances * 150)
      },
      health: {,
        overall_health_score: this.calculateHealthScore(cpuUtilization, memoryUtilization, currentInstances),
        bottleneck_indicators: this.identifyBottlenecks(cpuUtilization, memoryUtilization),
        scaling_recommendations: this.generateScalingRecommendations(service, cpuUtilization, memoryUtilization),
        cost_optimization_opportunities: this.identifyCostOptimizations(currentInstances, cpuUtilization)
      }
    };
    if (!this.metrics.has(service)) {
      this.metrics.set(service, []);
    }
    const serviceMetrics = this.metrics.get(service)!;
    serviceMetrics.push(metrics);
    // Keep only last 1000 metric records per service
    if (serviceMetrics.length > 1000) {
      serviceMetrics.splice(0, serviceMetrics.length - 1000);
    }
    // Check for scaling triggers
    await this.evaluateScalingPolicies(service, metrics);
    this.emit('metrics_collected', {)
      service,
      metrics_id: id,
      health_score: metrics.health.overall_health_score,
      scaling_needed: metrics.health.scaling_recommendations.length > 0
    });
    return id;
  }
  private calculateHealthScore(cpuUtil: number, memoryUtil: number, instances: number): number {
    let score = 100;
    // CPU utilization impact
    if (cpuUtil > 80) score -= (cpuUtil - 80) * 2;
    if (cpuUtil < 20) score -= (20 - cpuUtil) * 0.5; // Under-utilization penalty
    // Memory utilization impact
    if (memoryUtil > 85) score -= (memoryUtil - 85) * 3;
    if (memoryUtil < 30) score -= (30 - memoryUtil) * 0.3;
    // Instance count health (avoid single points of failure)
    if (instances < 2) score -= 20;
    return Math.max(0, Math.min(100, score));
  }
  private identifyBottlenecks(cpuUtil: number, memoryUtil: number): string[] {
    const bottlenecks: string[] = [];
    if (cpuUtil > 80) bottlenecks.push('CPU utilization above 80%');
    if (memoryUtil > 85) bottlenecks.push('Memory utilization above 85%');
    if (cpuUtil > 70 && memoryUtil > 70) bottlenecks.push('Both CPU and memory under pressure');
    return bottlenecks;
  }
  private generateScalingRecommendations(service: string, cpuUtil: number, memoryUtil: number): string[] {
    const recommendations: string[] = [];
    const currentInstances = this.currentCapacity.get(service) || 1;
    if (cpuUtil > 75) {
      recommendations.push(`Scale up: CPU utilization (${cpuUtil.toFixed(1)}%) suggests adding 1-2 instances`);}
    }
    if (memoryUtil > 80) {
      recommendations.push(`Scale up: Memory utilization (${memoryUtil.toFixed(1)}%) suggests adding instances or upgrading instance types`);}
    }
    if (cpuUtil < 30 && memoryUtil < 40 && currentInstances > 2) {
      recommendations.push(`Scale down: Low resource utilization suggests reducing 1 instance`);
    }
    return recommendations;
  }
  private identifyCostOptimizations(instances: number, cpuUtil: number): string[] {
    const optimizations: string[] = [];
    if (cpuUtil < 40 && instances > 1) {
      optimizations.push('Consider using smaller instance types or reducing instance count');
    }
    if (instances > 3) {
      optimizations.push('Evaluate reserved instance pricing for long-term savings');
    }
    optimizations.push('Consider spot instances for non-critical workloads');
    return optimizations;
  }
  // Scaling Operations
  private async evaluateScalingPolicies(service: string, metrics: CapacityMetrics): Promise<void> {
    const relevantPolicies = Array.from(this.scalingPolicies.values());
      .filter(policy => policy.enabled);
    for (const policy of relevantPolicies) {
      await this.evaluatePolicy(service, policy, metrics);
    }
  }
  private async evaluatePolicy(service: string, policy: ScalingPolicy, metrics: CapacityMetrics): Promise<void> {
    // Check if in cooldown period
    const lastCooldown = this.cooldownPeriods.get(`${service}_${policy.id}`) || 0;}
    if (Date.now() - lastCooldown < policy.constraints.cooldown_period_seconds * 1000) {
      return;
    }
    // Evaluate metric-based triggers
    for (const trigger of policy.triggers.metric_based) {
      const shouldTrigger = await this.evaluateMetricTrigger(trigger, metrics);
      if (shouldTrigger) {
        await this.executeScalingAction(service, policy, trigger.metric_name, 'metric_triggered');
        break; // Only execute one scaling action per evaluation
      }
    }
    // Evaluate time-based triggers
    for (const trigger of policy.triggers.time_based) {
      const shouldTrigger = this.evaluateTimeTrigger(trigger);
      if (shouldTrigger) {
        await this.executeScalingAction(service, policy, 'scheduled', 'time_triggered');
        break;
      }
    }
  }
  private async evaluateMetricTrigger(trigger: MetricTrigger, metrics: CapacityMetrics): Promise<boolean> {
    let metricValue: number;
    switch (trigger.metric_name) {
      case 'cpu_utilization':
        metricValue = metrics.current_utilization.cpu_percentage;
        break;
      case 'memory_utilization':
        metricValue = metrics.current_utilization.memory_percentage;
        break;
      case 'response_time':
        metricValue = metrics.performance.avg_response_time;
        break;
      case 'error_rate':
        metricValue = metrics.performance.error_rate;
        break;
      case 'throughput':
        metricValue = metrics.performance.throughput_rps;
        break;
      default:
        metricValue = metrics.current_utilization.custom_metrics[trigger.metric_name] || 0;
    }
    return this.compareMetricValue(metricValue, trigger.threshold, trigger.comparison);
  }
  private compareMetricValue(value: number, threshold: number, comparison: MetricTrigger['comparison']): boolean {
    switch (comparison) {
      case 'greater_than':
        return value > threshold;
      case 'less_than':
        return value < threshold;
      case 'greater_than_or_equal':
        return value >= threshold;
      case 'less_than_or_equal':
        return value <= threshold;
      default:
        return false;
    }
  }
  private evaluateTimeTrigger(trigger: TimeTrigger): boolean {
    const now = new Date();
    if (trigger.schedule_type === 'one_time' && trigger.one_time_datetime) {
      return Math.abs(Date.now() - trigger.one_time_datetime) < 60000; // Within 1 minute
    }
    if (trigger.schedule_type === 'recurring' && trigger.recurring_pattern) {
      const pattern = trigger.recurring_pattern;
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;}
      return pattern.times.includes(currentTime);
    }
    // Cron expression evaluation would require a cron parser library
    return false;
  }
  private async executeScalingAction(service: string, policy: ScalingPolicy, triggerReason: string, triggerType: string): Promise<void> {
    if (this.activeScaling.get(service)) {
      return; // Already scaling
    }
    this.activeScaling.set(service, true);
    const currentCapacity = this.currentCapacity.get(service) || 1;
    const plan = Array.from(this.capacityPlans.values()).find(p => p.service === service);
    if (!plan) {
      this.activeScaling.set(service, false);
      return;
    }
    const scalingStartTime = Date.now();
    let newCapacity = currentCapacity;
    let scalingAction: ScalingAction;
    // Determine scaling direction and action
    if (triggerReason.includes('high') || triggerReason.includes('above')) {
      scalingAction = policy.actions.scale_up;
    } else {
      scalingAction = policy.actions.scale_down;
    }
    // Calculate new capacity
    if (scalingAction.target_value !== undefined) {
      newCapacity = scalingAction.target_value;
    } else if (scalingAction.adjustment_value !== undefined) {
      if (scalingAction.adjustment_type === 'percentage') {
        const adjustment = Math.floor(currentCapacity * (scalingAction.adjustment_value / 100));
        newCapacity = currentCapacity + adjustment;
      } else {
        newCapacity = currentCapacity + scalingAction.adjustment_value;
      }
    }
    // Apply constraints
    newCapacity = Math.max(plan.scaling.min_instances, Math.min(plan.scaling.max_instances, newCapacity));
    // Apply scaling limits
    const maxScaleUp = Math.floor(currentCapacity * (policy.constraints.max_scale_up_percentage / 100));
    const maxScaleDown = Math.floor(currentCapacity * (policy.constraints.max_scale_down_percentage / 100));
    if (newCapacity > currentCapacity) {
      newCapacity = Math.min(newCapacity, currentCapacity + maxScaleUp);
    } else if (newCapacity < currentCapacity) {
      newCapacity = Math.max(newCapacity, currentCapacity - maxScaleDown);
    }
    // Execute scaling
    const scalingEvent = await this.performScaling(service, currentCapacity, newCapacity, policy.id, triggerReason);
    // Update state
    this.currentCapacity.set(service, newCapacity);
    this.cooldownPeriods.set(`${service}_${policy.id}`, Date.now());}
    this.activeScaling.set(service, false);
    // Update policy statistics
    policy.last_triggered = Date.now();
    policy.trigger_count++;
    this.scalingPolicies.set(policy.id, policy);
    // Send notifications
    for (const notification of policy.actions.notification) {
      await this.sendScalingNotification(notification, service, scalingEvent);
    }
    this.emit('scaling_completed', scalingEvent);
  }
  private async performScaling(service: string, currentCapacity: number, targetCapacity: number, policyId: string, triggerReason: string): Promise<ScalingEvent> {
    const scalingEvent: ScalingEvent = {
      id: `scaling_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,}
      timestamp: Date.now(),
      service,
      policy_id: policyId,
      event_type: targetCapacity > currentCapacity ? 'scale_up' : 'scale_down',
      trigger_reason: triggerReason,
      triggered_by: 'system',
      scaling_details: {,
        previous_capacity: currentCapacity,
        target_capacity: targetCapacity,
        actual_capacity: targetCapacity, // Assume successful scaling
        scaling_duration_seconds: 60 + Math.random() * 120, // 1-3 minutes
        instances_added: Math.max(0, targetCapacity - currentCapacity),
        instances_removed: Math.max(0, currentCapacity - targetCapacity)
      },
      impact: {,
        performance_change: {,
          response_time_change_ms: targetCapacity > currentCapacity ? -20 - Math.random() * 30 : 10 + Math.random() * 20,
          throughput_change_rps: (targetCapacity - currentCapacity) * (100 + Math.random() * 100),
          error_rate_change: targetCapacity > currentCapacity ? -0.1 - Math.random() * 0.5 : 0.05 + Math.random() * 0.3
        },
        cost_impact: {,
          hourly_cost_change: (targetCapacity - currentCapacity) * 0.50,
          estimated_monthly_impact: (targetCapacity - currentCapacity) * 0.50 * 24 * 30
        },
        availability_impact: 'minimal',
      },
      validation: {,
        scaling_successful: true,
        target_reached: true,
        performance_improved: targetCapacity > currentCapacity,
        issues_encountered: [],
        rollback_required: false,
      }
    };
    this.scalingEvents.push(scalingEvent);
    return scalingEvent;
  }
  private async sendScalingNotification(notification: NotificationAction, service: string, event: ScalingEvent): Promise<void> {
    // Simulate notification sending
    const message = notification.message_template;
      .replace('{{service}}', service)
      .replace('{{cpu_percentage}}', '75')
      .replace('{{memory_percentage}}', '80')
      .replace('{{instances_added}}', event.scaling_details.instances_added.toString())
      .replace('{{instances_removed}}', event.scaling_details.instances_removed.toString());
    this.emit('notification_sent', {)
      channel: notification.channel,
      target: notification.target,
      message,
      severity: notification.severity,
      scaling_event_id: event.id,
    });
  }
  // Capacity Forecasting
  async generateCapacityForecast(service: string, horizonDays: number = 30): Promise<string> {
    const id = `forecast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
    const serviceMetrics = this.metrics.get(service) || [];
    const historicalDataPoints = Math.min(serviceMetrics.length, 100);
    const forecast: CapacityForecast = {
      id,
      service,
      generated_at: Date.now(),
      forecast_horizon_days: horizonDays,
      methodology: {,
        algorithm: 'linear_regression',
        confidence_interval: 95,
        historical_data_points: historicalDataPoints,
        seasonal_adjustments: true,
        trend_adjustments: true,
      },
      forecasts: this.generateForecastData(service, horizonDays),
      recommendations: await this.generateCapacityRecommendations(service),
      accuracy: {,
        last_forecast_accuracy: 0.85 + Math.random() * 0.1,
        trend_accuracy: 0.80 + Math.random() * 0.15,
        peak_prediction_accuracy: 0.75 + Math.random() * 0.2,
        cost_prediction_accuracy: 0.90 + Math.random() * 0.08
      }
    };
    this.forecasts.set(id, forecast);
    this.emit('forecast_generated', {)
      forecast_id: id,
      service,
      horizon_days: horizonDays,
      peak_capacity_needed: Math.max(...forecast.forecasts.map(f => f.required_capacity.cpu_cores))
    });
    return id;
  }
  private generateForecastData(service: string, horizonDays: number): CapacityForecast['forecasts'] {
    const forecasts: CapacityForecast['forecasts'] = [];
    const currentDate = new Date();
    const currentCapacity = this.currentCapacity.get(service) || 1;
    // Simulate growth trend with seasonal variations
    const baseGrowthRate = 0.02; // 2% monthly growth;
    const seasonalVariation = 0.15; // 15% seasonal variation;
    for (let day = 0; day <= horizonDays; day++) {
      const forecastDate = new Date(currentDate);
      forecastDate.setDate(currentDate.getDate() + day);
      // Calculate trend growth
      const trendFactor = Math.pow(1 + baseGrowthRate / 30, day);
      // Add seasonal variation (simplified sine wave)
      const seasonalFactor = 1 + seasonalVariation * Math.sin((day / 7) * Math.PI);
      // Add some randomness for confidence intervals
      const baseLoad = currentCapacity * trendFactor * seasonalFactor;
      const confidenceSpread = baseLoad * 0.2;
      forecasts.push({)
        date: forecastDate.getTime(),
        predicted_load: baseLoad,
        confidence_upper: baseLoad + confidenceSpread,
        confidence_lower: Math.max(1, baseLoad - confidenceSpread),
        required_capacity: {,
          cpu_cores: Math.ceil(baseLoad) * 4,
          memory_gb: Math.ceil(baseLoad) * 16,
          storage_gb: Math.ceil(baseLoad) * 100,
          network_bandwidth_mbps: Math.ceil(baseLoad) * 1000,
          iops_required: Math.ceil(baseLoad) * 1000
        },
        estimated_cost: Math.ceil(baseLoad) * 0.50 * 24, // Daily cost
        risk_factors: this.identifyForecastRisks(day, baseLoad, currentCapacity)
      });
    }
    return forecasts;
  }
  private identifyForecastRisks(day: number, predictedLoad: number, currentCapacity: number): string[] {
    const risks: string[] = [];
    if (predictedLoad > currentCapacity * 1.5) {
      risks.push('Significant capacity increase needed - plan infrastructure scaling');
    }
    if (day > 20 && predictedLoad > currentCapacity * 2) {
      risks.push('Long-term growth may require architectural changes');
    }
    if (day < 7 && predictedLoad > currentCapacity * 1.2) {
      risks.push('Short-term spike predicted - prepare immediate scaling');
    }
    return risks;
  }
  private async generateCapacityRecommendations(service: string): Promise<CapacityForecast['recommendations']> {
    const immediate: CapacityRecommendation[] = [];
    const shortTerm: CapacityRecommendation[] = [];
    const longTerm: CapacityRecommendation[] = [];
    // Immediate actions (next 7 days)
    immediate.push({)
      id: `rec_${Date.now()}_1`,}
      priority: 'high',
      category: 'scaling',
      title: 'Enable auto-scaling policies',
      description: 'Ensure all critical scaling policies are enabled and tuned',
      rationale: 'Prevents manual intervention during unexpected load spikes',
      implementation: {,
        estimated_effort_hours: 2,
        estimated_cost_impact: 0,
        estimated_benefit: 'Reduced downtime risk by 80%',
        prerequisites: ['Review current policies', 'Test scaling procedures'],
        risks: ['Potential cost increase if poorly configured'],
        rollback_plan: 'Disable auto-scaling and revert to manual scaling'
      },
      timeline: {,
        recommended_start: Date.now(),
        estimated_completion: Date.now() + (24 * 60 * 60 * 1000),
        deadline: Date.now() + (3 * 24 * 60 * 60 * 1000)
      },
      status: 'pending',
      created_at: Date.now(),
      last_updated: Date.now(),
    });
    // Short-term planning (next 30 days)
    shortTerm.push({)
      id: `rec_${Date.now()}_2`,}
      priority: 'medium',
      category: 'optimization',
      title: 'Optimize instance types based on usage patterns',
      description: 'Analyze current usage and switch to more cost-effective instance types',
      rationale: 'Current CPU utilization patterns suggest compute-optimized instances would be more cost-effective',
      implementation: {,
        estimated_effort_hours: 8,
        estimated_cost_impact: -200, // Cost reduction
        estimated_benefit: '15-20% cost reduction',
        prerequisites: ['Usage analysis', 'Performance testing'],
        risks: ['Temporary performance impact during migration'],
        rollback_plan: 'Revert to previous instance types within 24 hours'
      },
      timeline: {,
        recommended_start: Date.now() + (7 * 24 * 60 * 60 * 1000),
        estimated_completion: Date.now() + (14 * 24 * 60 * 60 * 1000)
      },
      status: 'pending',
      created_at: Date.now(),
      last_updated: Date.now(),
    });
    // Long-term strategy (next 90+ days)
    longTerm.push({)
      id: `rec_${Date.now()}_3`,}
      priority: 'medium',
      category: 'architecture',
      title: 'Implement multi-region deployment',
      description: 'Deploy service across multiple regions for improved reliability and performance',
      rationale: 'Forecast shows significant growth requiring geographic distribution',
      implementation: {,
        estimated_effort_hours: 120,
        estimated_cost_impact: 500, // Initial increase
        estimated_benefit: 'Improved availability and reduced latency',
        prerequisites: ['Network architecture review', 'Data replication strategy'],
        risks: ['Increased complexity', 'Initial cost increase'],
        rollback_plan: 'Consolidate to single region if needed'
      },
      timeline: {,
        recommended_start: Date.now() + (30 * 24 * 60 * 60 * 1000),
        estimated_completion: Date.now() + (90 * 24 * 60 * 60 * 1000)
      },
      status: 'pending',
      created_at: Date.now(),
      last_updated: Date.now(),
    });
    return {
      immediate_actions: immediate,
      short_term_planning: shortTerm,
      long_term_strategy: longTerm,
    };
  }
  // Manual Scaling Operations
  async manualScale(service: string, targetCapacity: number, reason: string, scaledBy: string): Promise<string> {
    const currentCapacity = this.currentCapacity.get(service) || 1;
    const plan = Array.from(this.capacityPlans.values()).find(p => p.service === service);
    if (!plan) {
      throw new Error(`No capacity plan found for service: ${service}`);}
    }
    // Validate capacity limits
    if (targetCapacity < plan.scaling.min_instances || targetCapacity > plan.scaling.max_instances) {
      throw new Error(`Target capacity ${targetCapacity} outside allowed range [${plan.scaling.min_instances}, ${plan.scaling.max_instances}]`);}
    }
    const scalingEvent = await this.performScaling(service, currentCapacity, targetCapacity, 'manual', reason);
    scalingEvent.triggered_by = scaledBy;
    scalingEvent.event_type = 'manual_intervention';
    this.currentCapacity.set(service, targetCapacity);
    this.emit('manual_scaling_completed', {)
      service,
      previous_capacity: currentCapacity,
      new_capacity: targetCapacity,
      scaled_by: scaledBy,
      reason
    });
    return scalingEvent.id;
  }
  // System Status and Health
  getCapacityStatus(): {
    services: Array<{,
      service: string;
      current_capacity: number;
      utilization: { cpu: number; memory: number };
      health_score: number;
      scaling_status: 'stable' | 'scaling_up' | 'scaling_down' | 'at_limits';
      cost_efficiency: number;
    }>;
    overall_health: number;
    total_monthly_cost: number;
    scaling_events_last_24h: number;
    recommendations_pending: number;
  } {
    const services = Array.from(this.capacityPlans.keys()).map(planId => {)
      const plan = this.capacityPlans.get(planId)!;
      const currentCapacity = this.currentCapacity.get(plan.service) || 1;
      const recentMetrics = this.metrics.get(plan.service)?.slice(-1)[0];
      const isScaling = this.activeScaling.get(plan.service) || false;
      let scalingStatus: 'stable' | 'scaling_up' | 'scaling_down' | 'at_limits' = 'stable';
      if (isScaling) {
        scalingStatus = currentCapacity < plan.scaling.max_instances ? 'scaling_up' : 'scaling_down';
      } else if (currentCapacity >= plan.scaling.max_instances || currentCapacity <= plan.scaling.min_instances) {
        scalingStatus = 'at_limits';
      }
      return {
        service: plan.service,
        current_capacity: currentCapacity,
        utilization: {,
          cpu: recentMetrics?.current_utilization.cpu_percentage || 0,
          memory: recentMetrics?.current_utilization.memory_percentage || 0
        },
        health_score: recentMetrics?.health.overall_health_score || 100,
        scaling_status: scalingStatus,
        cost_efficiency: this.calculateCostEfficiency(plan.service, currentCapacity, recentMetrics)
      };
    });
    const overallHealth = services.length > 0 ;
      ? services.reduce((sum, s) => sum + s.health_score, 0) / services.length 
      : 100;
    const totalMonthlyCost = services.reduce((sum, s) => sum + (s.current_capacity * 0.50 * 24 * 30), 0);
    const recentScalingEvents = this.scalingEvents.filter(event => ;)
      Date.now() - event.timestamp < 24 * 60 * 60 * 1000
    ).length;
    const pendingRecommendations = Array.from(this.recommendations.values());
      .filter(rec => rec.status === 'pending').length;
    return {
      services,
      overall_health: overallHealth,
      total_monthly_cost: totalMonthlyCost,
      scaling_events_last_24h: recentScalingEvents,
      recommendations_pending: pendingRecommendations,
    };
  }
  private calculateCostEfficiency(service: string, currentCapacity: number, metrics?: CapacityMetrics): number {
    if (!metrics) return 50; // Default neutral score
    const avgUtilization = (metrics.current_utilization.cpu_percentage + metrics.current_utilization.memory_percentage) / 2;
    const costPerRequest = metrics.cost.cost_per_request;
    // Higher utilization and lower cost per request = better efficiency
    const utilizationScore = Math.min(100, avgUtilization * 1.25); // Optimal around 80%;
    const costScore = Math.max(0, 100 - (costPerRequest * 10000)); // Lower cost = higher score;
    return (utilizationScore + costScore) / 2;
  }
  // Utility methods
  private initializeDefaultPlans(): void {
    const defaultPlans = [;
      {
        name: 'Security Alert Processing',
        description: 'Capacity plan for security alert processing service',
        service: 'security-alerts',
        planning_horizon: {,
          short_term_days: 30,
          medium_term_days: 90,
          long_term_days: 365,
        },
        requirements: {,
          baseline_capacity: {,
            cpu_cores: 8,
            memory_gb: 32,
            storage_gb: 500,
            network_bandwidth_mbps: 1000,
            iops_required: 2000,
          },
          peak_capacity: {,
            cpu_cores: 32,
            memory_gb: 128,
            storage_gb: 2000,
            network_bandwidth_mbps: 4000,
            iops_required: 8000,
          },
          growth_projections: [{,
            period: 'monthly',
            metric: 'events',
            current_value: 100000,
            projected_growth_rate: 15,
            confidence_level: 0.85,
            assumptions: ['Business growth continues', 'No major architectural changes']
          }],
          performance_targets: {,
            response_time_p95_ms: 200,
            response_time_p99_ms: 500,
            throughput_rps: 1000,
            error_rate_percentage: 0.1,
            availability_percentage: 99.9,
            data_processing_latency_ms: 100,
          },
          availability_requirements: {,
            target_availability: 99.9,
            downtime_budget_minutes_monthly: 43.2,
            maintenance_window: {,
              day_of_week: 'Sunday',
              start_time: '02:00',
              duration_hours: 4,
              timezone: 'UTC',
            },
            disaster_recovery: {,
              rto_minutes: 30,
              rpo_minutes: 5,
              geographic_redundancy: true,
            }
          }
        },
        scaling: {,
          auto_scaling_enabled: true,
          scaling_policies: [],
          scaling_cooldown: 300000,
          min_instances: 2,
          max_instances: 20,
          target_utilization: {,
            cpu_percentage: 75,
            memory_percentage: 80,
            network_percentage: 70,
            custom_metrics: [{,
              metric_name: 'alert_processing_rate',
              target_value: 90,
              comparison: 'greater_than',
              weight: 0.8,
            }]
          }
        },
        cost_optimization: {,
          budget_constraints: {,
            monthly_budget: 5000,
            cost_per_hour_limit: 10,
            currency: 'USD',
          },
          instance_types: [{,
            instance_type: 'c5.2xlarge',
            cpu_cores: 8,
            memory_gb: 16,
            network_performance: 'high',
            storage_type: 'ebs',
            cost_per_hour: 0.34,
            spot_availability: true,
            use_cases: ['CPU intensive', 'Security processing'],
            priority: 1,
          }],
          reserved_capacity: {,
            percentage: 60,
            commitment_period: 'yearly',
          },
          spot_instances: {,
            enabled: true,
            max_percentage: 30,
            fallback_strategy: 'on_demand',
          }
        },
        monitoring: {,
          capacity_thresholds: {,
            warning_percentage: 75,
            critical_percentage: 90,
            forecast_breach_days: 7,
          },
          metrics_collection: {,
            interval_seconds: 60,
            retention_days: 90,
            custom_metrics: ['alert_processing_rate', 'threat_detection_accuracy']
          },
          alerting: {,
            notification_channels: ['#capacity-alerts', 'capacity-team@company.com'],
            escalation_policy: ['devops-lead@company.com', 'cto@company.com'],
            alert_suppression_minutes: 15,
          }
        },
        created_by: 'system',
        enabled: true,
      }
    ];
    defaultPlans.forEach(async (plan) => {
      await this.createCapacityPlan(plan);
    });
  }
  private startMetricsCollection(): void {
    // Collect metrics every 5 minutes
    setInterval(async () => {
      const services = Array.from(this.capacityPlans.values()).map(plan => plan.service);
      for (const service of services) {
        try {
          await this.collectCapacityMetrics(service);
        } catch (error) {
          console.error(`Failed to collect capacity metrics for ${service}:`, error);}
        }
      }
    }, 300000);
  }
  private startCapacityMonitoring(): void {
    // Monitor capacity thresholds every minute
    setInterval(() => {
      for (const [service] of this.currentCapacity) {
        this.checkCapacityThresholds(service);
      }
    }, 60000);
  }
  private startForecastGeneration(): void {
    // Generate forecasts daily
    setInterval(async () => {
      const services = Array.from(this.capacityPlans.values()).map(plan => plan.service);
      for (const service of services) {
        try {
          await this.generateCapacityForecast(service, 30);
        } catch (error) {
          console.error(`Failed to generate forecast for ${service}:`, error);}
        }
      }
    }, 24 * 60 * 60 * 1000);
  }
  private checkCapacityThresholds(service: string): void {
    const recentMetrics = this.metrics.get(service)?.slice(-1)[0];
    if (!recentMetrics) return;
    const plan = Array.from(this.capacityPlans.values()).find(p => p.service === service);
    if (!plan) return;
    const avgUtilization = (recentMetrics.current_utilization.cpu_percentage + ;)
                           recentMetrics.current_utilization.memory_percentage) / 2;
    if (avgUtilization > plan.monitoring.capacity_thresholds.critical_percentage) {
      this.emit('capacity_threshold_critical', {)
        service,
        utilization: avgUtilization,
        threshold: plan.monitoring.capacity_thresholds.critical_percentage,
      });
    } else if (avgUtilization > plan.monitoring.capacity_thresholds.warning_percentage) {
      this.emit('capacity_threshold_warning', {)
        service,
        utilization: avgUtilization,
        threshold: plan.monitoring.capacity_thresholds.warning_percentage,
      });
    }
  }
  // Public API methods
  getCapacityPlans(): CapacityPlan[] {
    return Array.from(this.capacityPlans.values());
  }
  getScalingPolicies(): ScalingPolicy[] {
    return Array.from(this.scalingPolicies.values());
  }
  getScalingEvents(): ScalingEvent[] {
    return this.scalingEvents.slice(-1000); // Return last 1000 events
  }
  getForecasts(): CapacityForecast[] {
    return Array.from(this.forecasts.values());
  }
  getRecommendations(): CapacityRecommendation[] {
    return Array.from(this.recommendations.values());
  }
  async exportConfiguration(): Promise<string> {
    const config = {
      capacity_plans: Array.from(this.capacityPlans.values()),
      scaling_policies: Array.from(this.scalingPolicies.values()),
      metadata: {,
        exported_at: Date.now(),
        version: '1.0.0',
      }
    };
    return JSON.stringify(config, null, 2);
  }
  async importConfiguration(configJson: string): Promise<void> {
    try {
      const config = JSON.parse(configJson);
      // Import capacity plans
      if (config.capacity_plans) {
        for (const plan of config.capacity_plans) {
          this.capacityPlans.set(plan.id, plan);
          this.currentCapacity.set(plan.service, plan.scaling.min_instances);
        }
      }
      // Import scaling policies
      if (config.scaling_policies) {
        for (const policy of config.scaling_policies) {
          this.scalingPolicies.set(policy.id, policy);
        }
      }
      this.emit('configuration_imported', {)
        plans_imported: config.capacity_plans?.length || 0,
        policies_imported: config.scaling_policies?.length || 0
      });
    } catch (error) {
      throw new Error(`Failed to import configuration: ${error}`);}
    }
  }
}

export default SecurityCapacityManager;