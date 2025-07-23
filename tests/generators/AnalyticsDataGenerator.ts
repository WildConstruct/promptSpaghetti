/**
 * Analytics Data Generator for Testing
 * 
 * Generates comprehensive analytics test data including metrics, events,
 * performance data, user behavior, and time-series data for testing
 * analytics functionality and dashboards.
 * 
 * Task: E18-1753114562159-0BC5A0
 */

import seedrandom from 'seedrandom';

export interface MetricData {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface EventData {
  id: string;
  type: string;
  category: string;
  action: string;
  properties: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  source: string;
}

export interface PerformanceMetric {
  id: string;
  metricType: 'execution_time' | 'memory_usage' | 'throughput' | 'error_rate' | 'latency';
  value: number;
  unit: string;
  component: string;
  operation: string;
  timestamp: Date;
  context: Record<string, any>;
}

export interface UserBehaviorData {
  userId: string;
  sessionId: string;
  actions: Array<{
    action: string;
    target: string;
    timestamp: Date;
    duration?: number;
    metadata?: Record<string, any>;
  }>;
  sessionStart: Date;
  sessionEnd?: Date;
  deviceInfo: string;
  geolocation?: {
    country: string;
    region: string;
    city: string;
  };
}

export interface TimeSeriesData {
  metric: string;
  dataPoints: Array<{
    timestamp: Date;
    value: number;
    tags?: Record<string, string>;
  }>;
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count';
  interval: 'minute' | 'hour' | 'day' | 'week' | 'month';
}

export interface RuleUsageAnalytics {
  ruleId: string;
  ruleName: string;
  applications: number;
  successRate: number;
  avgExecutionTime: number;
  charactersProcessed: number;
  errorCount: number;
  lastUsed: Date;
  userRatings: number[];
  trendData: Array<{
    date: Date;
    applications: number;
    successRate: number;
    avgExecutionTime: number;
  }>;
}

export class AnalyticsDataGenerator {
  private rng: seedrandom.PRNG;

  constructor(seed: number = 12345) {
    this.rng = seedrandom(seed.toString());
  }

  /**
   * Generate system metrics for monitoring dashboards
   */
  generateSystemMetrics(days: number = 30): MetricData[] {
    const metrics: MetricData[] = [];
    const metricTypes = [
      { name: 'cpu_usage', unit: 'percent', range: [10, 90] },
      { name: 'memory_usage', unit: 'percent', range: [20, 85] },
      { name: 'disk_usage', unit: 'percent', range: [30, 95] },
      { name: 'network_throughput', unit: 'mbps', range: [50, 1000] },
      { name: 'active_connections', unit: 'count', range: [100, 5000] },
      { name: 'request_rate', unit: 'requests_per_second', range: [10, 500] },
      { name: 'error_rate', unit: 'percent', range: [0, 5] },
      { name: 'response_time', unit: 'ms', range: [50, 2000] }
    ];

    const components = ['web_server', 'database', 'cache', 'message_queue', 'background_worker'];

    for (let day = 0; day < days; day++) {
      const date = new Date(Date.now() - (day * 24 * 60 * 60 * 1000));
      
      // Generate hourly metrics for each day
      for (let hour = 0; hour < 24; hour++) {
        const timestamp = new Date(date.getTime() + (hour * 60 * 60 * 1000));
        
        metricTypes.forEach(metricType => {
          components.forEach(component => {
            const baseValue = metricType.range[0] + 
              (this.rng() * (metricType.range[1] - metricType.range[0]));
            
            // Add time-based variations (higher load during business hours)
            const timeMultiplier = hour >= 9 && hour <= 17 ? 1.3 : 0.8;
            const value = Math.max(0, baseValue * timeMultiplier * (0.8 + this.rng() * 0.4));

            metrics.push({
              id: `${metricType.name}_${component}_${timestamp.getTime()}`,
              name: metricType.name,
              value: Math.round(value * 100) / 100,
              unit: metricType.unit,
              timestamp,
              tags: {
                component,
                environment: 'production',
                datacenter: ['us-east-1', 'us-west-2', 'eu-west-1'][Math.floor(this.rng() * 3)],
                instance: `instance-${Math.floor(this.rng() * 5) + 1}`
              },
              metadata: {
                collection_method: 'automated',
                accuracy: 0.95 + (this.rng() * 0.05)
              }
            });
          });
        });
      }
    }

    return metrics;
  }

  /**
   * Generate user interaction events
   */
  generateUserEvents(users: string[], days: number = 7): EventData[] {
    const events: EventData[] = [];
    const eventTypes = [
      { category: 'user', action: 'login', source: 'web_app' },
      { category: 'user', action: 'logout', source: 'web_app' },
      { category: 'rule', action: 'create', source: 'editor' },
      { category: 'rule', action: 'edit', source: 'editor' },
      { category: 'rule', action: 'delete', source: 'editor' },
      { category: 'rule', action: 'execute', source: 'engine' },
      { category: 'project', action: 'create', source: 'web_app' },
      { category: 'project', action: 'share', source: 'web_app' },
      { category: 'export', action: 'download', source: 'api' },
      { category: 'settings', action: 'update', source: 'web_app' }
    ];

    for (let day = 0; day < days; day++) {
      const date = new Date(Date.now() - (day * 24 * 60 * 60 * 1000));
      
      users.forEach(userId => {
        // Each user generates 5-30 events per day
        const eventCount = Math.floor(this.rng() * 25) + 5;
        
        for (let i = 0; i < eventCount; i++) {
          const eventType = eventTypes[Math.floor(this.rng() * eventTypes.length)];
          const timestamp = new Date(date.getTime() + (this.rng() * 24 * 60 * 60 * 1000));
          
          events.push({
            id: `event_${userId}_${day}_${i}`,
            type: eventType.action,
            category: eventType.category,
            action: eventType.action,
            properties: this.generateEventProperties(eventType),
            timestamp,
            userId,
            sessionId: `session_${userId}_${Math.floor(day / 3)}_${Math.floor(i / 10)}`,
            source: eventType.source
          });
        }
      });
    }

    return events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  private generateEventProperties(eventType: { category: string; action: string; source: string }): Record<string, any> {
    const properties: Record<string, any> = {
      source: eventType.source,
      timestamp: new Date().toISOString(),
      session_duration: Math.floor(this.rng() * 3600) + 300 // 5 minutes to 1 hour
    };

    switch (eventType.category) {
    case 'rule':
      properties.rule_type = ['WeightedChoice', 'Conditional', 'Sequential', 'Markov'][Math.floor(this.rng() * 4)];
      properties.complexity = ['simple', 'moderate', 'complex'][Math.floor(this.rng() * 3)];
      if (eventType.action === 'execute') {
        properties.execution_time = Math.floor(this.rng() * 1000) + 10;
        properties.success = this.rng() > 0.05; // 95% success rate
      }
      break;
        
    case 'project':
      properties.project_size = ['small', 'medium', 'large'][Math.floor(this.rng() * 3)];
      properties.collaboration = this.rng() > 0.6;
      break;
        
    case 'export':
      properties.format = ['json', 'yaml', 'csv'][Math.floor(this.rng() * 3)];
      properties.file_size = Math.floor(this.rng() * 10000) + 1000; // 1KB to 10MB
      break;
        
    case 'user':
      properties.device_type = ['desktop', 'mobile', 'tablet'][Math.floor(this.rng() * 3)];
      properties.browser = ['chrome', 'firefox', 'safari', 'edge'][Math.floor(this.rng() * 4)];
      break;
    }

    return properties;
  }

  /**
   * Generate performance metrics for system components
   */
  generatePerformanceMetrics(days: number = 30): PerformanceMetric[] {
    const metrics: PerformanceMetric[] = [];
    const components = ['graph_engine', 'validation', 'export', 'api', 'database', 'cache'];
    const operations = ['execute', 'validate', 'export', 'query', 'insert', 'update', 'delete'];

    for (let day = 0; day < days; day++) {
      const date = new Date(Date.now() - (day * 24 * 60 * 60 * 1000));
      
      // Generate metrics every 15 minutes
      for (let interval = 0; interval < 96; interval++) {
        const timestamp = new Date(date.getTime() + (interval * 15 * 60 * 1000));
        
        components.forEach(component => {
          operations.forEach(operation => {
            // Generate different types of performance metrics
            const metricTypes: Array<PerformanceMetric['metricType']> = [
              'execution_time', 'memory_usage', 'throughput', 'error_rate', 'latency'
            ];
            
            metricTypes.forEach(metricType => {
              let value: number;
              let unit: string;
              
              switch (metricType) {
              case 'execution_time':
                value = Math.floor(this.rng() * 1000) + 10; // 10-1010ms
                unit = 'ms';
                break;
              case 'memory_usage':
                value = Math.floor(this.rng() * 500) + 50; // 50-550MB
                unit = 'mb';
                break;
              case 'throughput':
                value = Math.floor(this.rng() * 1000) + 100; // 100-1100 ops/sec
                unit = 'ops_per_second';
                break;
              case 'error_rate':
                value = this.rng() * 5; // 0-5%
                unit = 'percent';
                break;
              case 'latency':
                value = Math.floor(this.rng() * 200) + 5; // 5-205ms
                unit = 'ms';
                break;
              }

              metrics.push({
                id: `perf_${component}_${operation}_${metricType}_${timestamp.getTime()}`,
                metricType,
                value: Math.round(value * 100) / 100,
                unit,
                component,
                operation,
                timestamp,
                context: {
                  environment: 'production',
                  version: '1.0.0',
                  load_factor: this.rng(),
                  concurrent_users: Math.floor(this.rng() * 500) + 50
                }
              });
            });
          });
        });
      }
    }

    return metrics;
  }

  /**
   * Generate user behavior analytics
   */
  generateUserBehavior(users: string[], days: number = 14): UserBehaviorData[] {
    const behaviorData: UserBehaviorData[] = [];
    const actions = [
      'page_view', 'button_click', 'form_submit', 'search', 'filter',
      'create_rule', 'edit_rule', 'delete_rule', 'run_preview',
      'export_data', 'share_project', 'invite_user'
    ];
    
    const targets = [
      'dashboard', 'editor', 'settings', 'analytics', 'help',
      'rule_list', 'project_list', 'user_profile', 'export_modal'
    ];

    users.forEach(userId => {
      for (let day = 0; day < days; day++) {
        // 70% chance user is active on any given day
        if (this.rng() > 0.3) {
          const sessionStart = new Date(Date.now() - (day * 24 * 60 * 60 * 1000) + (this.rng() * 24 * 60 * 60 * 1000));
          const sessionDuration = (this.rng() * 3600 + 300) * 1000; // 5 minutes to 1 hour
          const sessionEnd = new Date(sessionStart.getTime() + sessionDuration);
          
          const sessionActions = [];
          const actionCount = Math.floor(this.rng() * 50) + 10; // 10-60 actions per session
          
          for (let i = 0; i < actionCount; i++) {
            const actionTimestamp = new Date(sessionStart.getTime() + (i * sessionDuration / actionCount));
            const action = actions[Math.floor(this.rng() * actions.length)];
            const target = targets[Math.floor(this.rng() * targets.length)];
            
            sessionActions.push({
              action,
              target,
              timestamp: actionTimestamp,
              duration: action.includes('edit') ? Math.floor(this.rng() * 300) + 30 : undefined, // Edit actions have duration
              metadata: {
                scroll_depth: this.rng(),
                click_position: { x: Math.floor(this.rng() * 1920), y: Math.floor(this.rng() * 1080) },
                referrer: this.rng() > 0.8 ? 'external' : 'internal'
              }
            });
          }

          behaviorData.push({
            userId,
            sessionId: `session_${userId}_${day}`,
            actions: sessionActions,
            sessionStart,
            sessionEnd,
            deviceInfo: this.generateDeviceInfo(),
            geolocation: this.generateGeolocation()
          });
        }
      }
    });

    return behaviorData;
  }

  private generateDeviceInfo(): string {
    const devices = [
      'Desktop - Windows 11',
      'Desktop - macOS Ventura',
      'Desktop - Ubuntu 22.04',
      'Mobile - iPhone 14 Pro',
      'Mobile - Samsung Galaxy S23',
      'Tablet - iPad Pro 12.9"',
      'Tablet - Surface Pro 9'
    ];
    return devices[Math.floor(this.rng() * devices.length)];
  }

  private generateGeolocation() {
    const locations = [
      { country: 'US', region: 'California', city: 'San Francisco' },
      { country: 'US', region: 'New York', city: 'New York' },
      { country: 'GB', region: 'England', city: 'London' },
      { country: 'DE', region: 'Bavaria', city: 'Munich' },
      { country: 'JP', region: 'Tokyo', city: 'Tokyo' },
      { country: 'AU', region: 'New South Wales', city: 'Sydney' },
      { country: 'CA', region: 'Ontario', city: 'Toronto' }
    ];
    return locations[Math.floor(this.rng() * locations.length)];
  }

  /**
   * Generate time series data for trending analysis
   */
  generateTimeSeriesData(metric: string, days: number = 90): TimeSeriesData {
    const dataPoints = [];
    const intervals = ['minute', 'hour', 'day', 'week', 'month'] as const;
    const interval = intervals[Math.floor(this.rng() * intervals.length)];
    
    let intervalMs: number;
    let pointCount: number;
    
    switch (interval) {
    case 'minute':
      intervalMs = 60 * 1000;
      pointCount = Math.min(days * 24 * 60, 1440); // Max 24 hours of minute data
      break;
    case 'hour':
      intervalMs = 60 * 60 * 1000;
      pointCount = days * 24;
      break;
    case 'day':
      intervalMs = 24 * 60 * 60 * 1000;
      pointCount = days;
      break;
    case 'week':
      intervalMs = 7 * 24 * 60 * 60 * 1000;
      pointCount = Math.ceil(days / 7);
      break;
    case 'month':
      intervalMs = 30 * 24 * 60 * 60 * 1000;
      pointCount = Math.ceil(days / 30);
      break;
    }

    const baseValue = this.rng() * 1000 + 100;
    const trend = (this.rng() - 0.5) * 0.1; // -5% to +5% trend
    
    for (let i = 0; i < pointCount; i++) {
      const timestamp = new Date(Date.now() - ((pointCount - i - 1) * intervalMs));
      const noise = (this.rng() - 0.5) * 0.3; // ±15% noise
      const seasonality = Math.sin((i / pointCount) * 2 * Math.PI) * 0.2; // Seasonal variation
      
      const value = Math.max(0, baseValue * (1 + trend * i + noise + seasonality));
      
      dataPoints.push({
        timestamp,
        value: Math.round(value * 100) / 100,
        tags: {
          source: 'system',
          quality: this.rng() > 0.95 ? 'estimated' : 'measured'
        }
      });
    }

    return {
      metric,
      dataPoints,
      aggregation: ['sum', 'avg', 'min', 'max', 'count'][Math.floor(this.rng() * 5)] as any,
      interval
    };
  }

  /**
   * Generate rule usage analytics
   */
  generateRuleUsageAnalytics(ruleIds: string[], days: number = 30): RuleUsageAnalytics[] {
    return ruleIds.map(ruleId => {
      const ruleName = `Rule ${ruleId.split('-')[1]}`;
      const applications = Math.floor(this.rng() * 10000) + 100;
      const successRate = 0.85 + (this.rng() * 0.14); // 85-99% success rate
      const avgExecutionTime = Math.floor(this.rng() * 500) + 50; // 50-550ms
      const charactersProcessed = applications * (Math.floor(this.rng() * 1000) + 100);
      const errorCount = Math.floor(applications * (1 - successRate));
      const lastUsed = new Date(Date.now() - (this.rng() * days * 24 * 60 * 60 * 1000));
      
      // Generate user ratings (1-5 stars)
      const ratingCount = Math.floor(this.rng() * 50) + 5;
      const userRatings = Array.from({ length: ratingCount }, () => 
        Math.floor(this.rng() * 5) + 1
      );

      // Generate trend data
      const trendData = [];
      for (let day = 0; day < days; day++) {
        const date = new Date(Date.now() - (day * 24 * 60 * 60 * 1000));
        const dailyApplications = Math.floor(applications / days * (0.7 + this.rng() * 0.6));
        const dailySuccessRate = successRate * (0.95 + this.rng() * 0.1);
        const dailyAvgTime = avgExecutionTime * (0.8 + this.rng() * 0.4);
        
        trendData.push({
          date,
          applications: dailyApplications,
          successRate: Math.min(1, dailySuccessRate),
          avgExecutionTime: dailyAvgTime
        });
      }

      return {
        ruleId,
        ruleName,
        applications,
        successRate,
        avgExecutionTime,
        charactersProcessed,
        errorCount,
        lastUsed,
        userRatings,
        trendData: trendData.reverse() // Oldest to newest
      };
    });
  }

  /**
   * Generate a comprehensive analytics test dataset
   */
  generateAnalyticsTestSuite(options: {
    userCount?: number;
    ruleCount?: number;
    days?: number;
  } = {}): {
    systemMetrics: MetricData[];
    userEvents: EventData[];
    performanceMetrics: PerformanceMetric[];
    userBehavior: UserBehaviorData[];
    timeSeriesData: TimeSeriesData[];
    ruleAnalytics: RuleUsageAnalytics[];
  } {
    const { userCount = 100, ruleCount = 50, days = 30 } = options;
    
    const users = Array.from({ length: userCount }, (_, i) => `user-${i.toString().padStart(4, '0')}`);
    const ruleIds = Array.from({ length: ruleCount }, (_, i) => `rule-${i.toString().padStart(4, '0')}`);
    
    const metrics = [
      'cpu_usage', 'memory_usage', 'request_rate', 'error_rate', 
      'rule_executions', 'user_sessions', 'data_processed'
    ];

    return {
      systemMetrics: this.generateSystemMetrics(days),
      userEvents: this.generateUserEvents(users, days),
      performanceMetrics: this.generatePerformanceMetrics(days),
      userBehavior: this.generateUserBehavior(users, days),
      timeSeriesData: metrics.map(metric => this.generateTimeSeriesData(metric, days)),
      ruleAnalytics: this.generateRuleUsageAnalytics(ruleIds, days)
    };
  }
}

export default AnalyticsDataGenerator;