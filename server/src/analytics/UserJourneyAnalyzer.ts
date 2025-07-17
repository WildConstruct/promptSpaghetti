import { EventEmitter } from 'events';
import { AnalyticsDAO, AnalyticsFilters, UserInteraction } from '../database/analytics-dao';
import { AnalyticsEventType } from './AnalyticsCollector';

/**
 * User journey path segment
 */
export interface JourneySegment {
  step: number;
  eventType: AnalyticsEventType;
  component?: string;
  nodeType?: string;
  timestamp: number;
  duration?: number;
  metadata?: Record<string, any>;
}

/**
 * Complete user journey
 */
export interface UserJourney {
  journeyId: string;
  sessionId: string;
  userId?: number;
  startTime: number;
  endTime: number;
  totalDuration: number;
  segments: JourneySegment[];
  outcome: 'completed' | 'abandoned' | 'error';
  conversionEvents: string[];
  dropoffPoint?: number;
}

/**
 * User journey pattern
 */
export interface JourneyPattern {
  patternId: string;
  name: string;
  description: string;
  commonPath: string[];
  frequency: number;
  successRate: number;
  averageDuration: number;
  conversionRate: number;
  dropoffPoints: Array<{ step: number; rate: number }>;
  variants: Array<{
    path: string[];
    frequency: number;
    successRate: number;
  }>;
}

/**
 * Funnel analysis result
 */
export interface FunnelAnalysis {
  funnelId: string;
  name: string;
  steps: Array<{
    stepName: string;
    eventType: AnalyticsEventType;
    totalUsers: number;
    conversionRate: number;
    dropoffRate: number;
    averageTimeToNext?: number;
  }>;
  overallConversionRate: number;
  totalUsers: number;
  completedUsers: number;
  timeToComplete: {
    median: number;
    p95: number;
    average: number;
  };
}

/**
 * User flow analysis
 */
export interface UserFlow {
  flowId: string;
  sourceStep: string;
  targetStep: string;
  userCount: number;
  percentage: number;
  averageTime: number;
  successRate: number;
}

/**
 * Advanced user journey analysis system
 */
export class UserJourneyAnalyzer extends EventEmitter {
  private analyticsDAO: AnalyticsDAO;
  private journeyCache: Map<string, UserJourney[]> = new Map();
  private patternCache: Map<string, JourneyPattern[]> = new Map();

  constructor(analyticsDAO: AnalyticsDAO) {
    super();
    this.analyticsDAO = analyticsDAO;
  }

  /**
   * Analyze user journeys for a time period
   */
  analyzeUserJourneys(
    startTime: number,
    endTime: number,
    filters?: AnalyticsFilters
  ): UserJourney[] {
    const cacheKey = `${startTime}-${endTime}-${JSON.stringify(filters)}`;
    
    if (this.journeyCache.has(cacheKey)) {
      return this.journeyCache.get(cacheKey)!;
    }

    const journeys = this.buildUserJourneys(startTime, endTime, filters);
    this.journeyCache.set(cacheKey, journeys);
    
    // Cache cleanup after 5 minutes
    setTimeout(() => {
      this.journeyCache.delete(cacheKey);
    }, 300000);

    return journeys;
  }

  /**
   * Identify common journey patterns
   */
  identifyJourneyPatterns(
    journeys: UserJourney[],
    minFrequency: number = 5
  ): JourneyPattern[] {
    const pathGroups = new Map<string, UserJourney[]>();
    
    // Group journeys by their event sequence
    journeys.forEach(journey => {
      const pathKey = journey.segments
        .map(s => `${s.eventType}:${s.component || 'unknown'}`)
        .join(' -> ');
      
      if (!pathGroups.has(pathKey)) {
        pathGroups.set(pathKey, []);
      }
      pathGroups.get(pathKey)!.push(journey);
    });

    const patterns: JourneyPattern[] = [];
    let patternId = 1;

    pathGroups.forEach((journeyGroup, pathKey) => {
      if (journeyGroup.length >= minFrequency) {
        const pattern = this.createJourneyPattern(
          `pattern_${patternId++}`,
          pathKey,
          journeyGroup
        );
        patterns.push(pattern);
      }
    });

    return patterns.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Perform funnel analysis
   */
  performFunnelAnalysis(
    funnelSteps: Array<{
      stepName: string;
      eventType: AnalyticsEventType;
      component?: string;
    }>,
    startTime: number,
    endTime: number,
    filters?: AnalyticsFilters
  ): FunnelAnalysis {
    const journeys = this.analyzeUserJourneys(startTime, endTime, filters);
    const funnelData = this.buildFunnelData(journeys, funnelSteps);
    
    return {
      funnelId: `funnel_${Date.now()}`,
      name: 'User Flow Funnel',
      steps: funnelData.steps,
      overallConversionRate: funnelData.overallConversionRate,
      totalUsers: funnelData.totalUsers,
      completedUsers: funnelData.completedUsers,
      timeToComplete: funnelData.timeToComplete
    };
  }

  /**
   * Analyze user flows between steps
   */
  analyzeUserFlows(
    startTime: number,
    endTime: number,
    filters?: AnalyticsFilters
  ): UserFlow[] {
    const journeys = this.analyzeUserJourneys(startTime, endTime, filters);
    const flowMap = new Map<string, UserFlow>();

    journeys.forEach(journey => {
      for (let i = 0; i < journey.segments.length - 1; i++) {
        const currentSegment = journey.segments[i];
        const nextSegment = journey.segments[i + 1];
        
        const flowKey = `${currentSegment.eventType}:${currentSegment.component} -> ${nextSegment.eventType}:${nextSegment.component}`;
        
        if (!flowMap.has(flowKey)) {
          flowMap.set(flowKey, {
            flowId: `flow_${Date.now()}_${i}`,
            sourceStep: `${currentSegment.eventType}:${currentSegment.component}`,
            targetStep: `${nextSegment.eventType}:${nextSegment.component}`,
            userCount: 0,
            percentage: 0,
            averageTime: 0,
            successRate: 0
          });
        }

        const flow = flowMap.get(flowKey)!;
        flow.userCount++;
        
        if (nextSegment.duration) {
          flow.averageTime = (flow.averageTime + nextSegment.duration) / 2;
        }
      }
    });

    const flows = Array.from(flowMap.values());
    const totalFlows = flows.reduce((sum, flow) => sum + flow.userCount, 0);
    
    // Calculate percentages
    flows.forEach(flow => {
      flow.percentage = totalFlows > 0 ? (flow.userCount / totalFlows) * 100 : 0;
    });

    return flows.sort((a, b) => b.userCount - a.userCount);
  }

  /**
   * Find common drop-off points
   */
  findDropoffPoints(
    journeys: UserJourney[],
    minDropoffRate: number = 0.1
  ): Array<{
    step: number;
    eventType: AnalyticsEventType;
    component?: string;
    dropoffRate: number;
    affectedUsers: number;
    commonReasons: string[];
  }> {
    const stepDropoffs = new Map<string, number>();
    const stepTotals = new Map<string, number>();
    
    journeys.forEach(journey => {
      if (journey.outcome === 'abandoned' && journey.dropoffPoint) {
        const segment = journey.segments[journey.dropoffPoint];
        if (segment) {
          const stepKey = `${segment.step}:${segment.eventType}:${segment.component}`;
          stepDropoffs.set(stepKey, (stepDropoffs.get(stepKey) || 0) + 1);
        }
      }
      
      journey.segments.forEach(segment => {
        const stepKey = `${segment.step}:${segment.eventType}:${segment.component}`;
        stepTotals.set(stepKey, (stepTotals.get(stepKey) || 0) + 1);
      });
    });

    const dropoffPoints: Array<{
      step: number;
      eventType: AnalyticsEventType;
      component?: string;
      dropoffRate: number;
      affectedUsers: number;
      commonReasons: string[];
    }> = [];

    stepDropoffs.forEach((dropoffCount, stepKey) => {
      const total = stepTotals.get(stepKey) || 0;
      const dropoffRate = total > 0 ? dropoffCount / total : 0;
      
      if (dropoffRate >= minDropoffRate) {
        const [step, eventType, component] = stepKey.split(':');
        dropoffPoints.push({
          step: parseInt(step),
          eventType: eventType as AnalyticsEventType,
          component: component !== 'undefined' ? component : undefined,
          dropoffRate,
          affectedUsers: dropoffCount,
          commonReasons: [] // Would analyze error patterns for reasons
        });
      }
    });

    return dropoffPoints.sort((a, b) => b.dropoffRate - a.dropoffRate);
  }

  /**
   * Generate journey optimization recommendations
   */
  generateJourneyRecommendations(
    patterns: JourneyPattern[],
    dropoffPoints: Array<any>
  ): Array<{
    type: 'reduce_friction' | 'optimize_flow' | 'improve_conversion';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    affectedUsers: number;
    potentialImpact: number;
    actionItems: string[];
  }> {
    const recommendations: Array<any> = [];

    // Analyze high-dropoff points
    dropoffPoints.forEach(dropoff => {
      if (dropoff.dropoffRate > 0.3) {
        recommendations.push({
          type: 'reduce_friction',
          priority: 'high',
          title: `Reduce friction at ${dropoff.eventType}`,
          description: `${(dropoff.dropoffRate * 100).toFixed(1)}% of users drop off at this step`,
          affectedUsers: dropoff.affectedUsers,
          potentialImpact: dropoff.affectedUsers * 0.5,
          actionItems: [
            'Analyze user feedback at this step',
            'Simplify the user interface',
            'Add progress indicators',
            'Provide better guidance or tooltips'
          ]
        });
      }
    });

    // Analyze successful patterns
    const successfulPatterns = patterns.filter(p => p.successRate > 0.8);
    if (successfulPatterns.length > 0) {
      recommendations.push({
        type: 'optimize_flow',
        priority: 'medium',
        title: 'Promote successful user flows',
        description: `${successfulPatterns.length} patterns show high success rates`,
        affectedUsers: successfulPatterns.reduce((sum, p) => sum + p.frequency, 0),
        potentialImpact: 0.2,
        actionItems: [
          'Guide users toward successful patterns',
          'Implement smart defaults based on successful flows',
          'Add contextual suggestions',
          'Create tutorials for optimal paths'
        ]
      });
    }

    // Analyze conversion opportunities
    const lowConversionPatterns = patterns.filter(p => p.conversionRate < 0.5);
    if (lowConversionPatterns.length > 0) {
      recommendations.push({
        type: 'improve_conversion',
        priority: 'medium',
        title: 'Improve conversion rates',
        description: `${lowConversionPatterns.length} patterns have low conversion rates`,
        affectedUsers: lowConversionPatterns.reduce((sum, p) => sum + p.frequency, 0),
        potentialImpact: 0.3,
        actionItems: [
          'Add conversion triggers at key points',
          'Implement progressive disclosure',
          'Provide clear calls-to-action',
          'Reduce cognitive load'
        ]
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Build user journeys from raw analytics data
   */
  private buildUserJourneys(
    startTime: number,
    endTime: number,
    filters?: AnalyticsFilters
  ): UserJourney[] {
    const events = this.analyticsDAO.getEvents({
      startTime,
      endTime,
      ...filters
    });

    const sessionMap = new Map<string, any[]>();
    
    // Group events by session
    events.forEach(event => {
      if (!sessionMap.has(event.sessionId)) {
        sessionMap.set(event.sessionId, []);
      }
      sessionMap.get(event.sessionId)!.push(event);
    });

    const journeys: UserJourney[] = [];

    sessionMap.forEach((sessionEvents, sessionId) => {
      // Sort events by timestamp
      sessionEvents.sort((a, b) => a.timestamp - b.timestamp);
      
      if (sessionEvents.length > 0) {
        const journey = this.createUserJourney(sessionId, sessionEvents);
        journeys.push(journey);
      }
    });

    return journeys;
  }

  /**
   * Create user journey from session events
   */
  private createUserJourney(sessionId: string, events: any[]): UserJourney {
    const segments: JourneySegment[] = [];
    let conversionEvents: string[] = [];
    let dropoffPoint: number | undefined;

    events.forEach((event, index) => {
      const segment: JourneySegment = {
        step: index + 1,
        eventType: event.type,
        component: event.metadata?.component,
        nodeType: event.metadata?.nodeType,
        timestamp: event.timestamp,
        metadata: event.metadata
      };

      // Calculate duration to next event
      if (index < events.length - 1) {
        segment.duration = events[index + 1].timestamp - event.timestamp;
      }

      segments.push(segment);

      // Track conversion events
      if (this.isConversionEvent(event.type)) {
        conversionEvents.push(event.type);
      }

      // Detect dropoff point
      if (event.type.includes('error') && !dropoffPoint) {
        dropoffPoint = index;
      }
    });

    const startTime = events[0].timestamp;
    const endTime = events[events.length - 1].timestamp;
    const totalDuration = endTime - startTime;

    // Determine outcome
    let outcome: 'completed' | 'abandoned' | 'error' = 'completed';
    if (dropoffPoint !== undefined) {
      outcome = 'error';
    } else if (conversionEvents.length === 0 && totalDuration < 10000) {
      outcome = 'abandoned';
    }

    return {
      journeyId: `journey_${sessionId}_${startTime}`,
      sessionId,
      userId: events[0].userId,
      startTime,
      endTime,
      totalDuration,
      segments,
      outcome,
      conversionEvents,
      dropoffPoint
    };
  }

  /**
   * Create journey pattern from grouped journeys
   */
  private createJourneyPattern(
    patternId: string,
    pathKey: string,
    journeys: UserJourney[]
  ): JourneyPattern {
    const pathSteps = pathKey.split(' -> ');
    const frequency = journeys.length;
    const successfulJourneys = journeys.filter(j => j.outcome === 'completed');
    const successRate = successfulJourneys.length / frequency;
    const conversionJourneys = journeys.filter(j => j.conversionEvents.length > 0);
    const conversionRate = conversionJourneys.length / frequency;
    
    const averageDuration = journeys.reduce((sum, j) => sum + j.totalDuration, 0) / frequency;

    // Calculate dropoff points
    const dropoffPoints: Array<{ step: number; rate: number }> = [];
    const stepCounts = new Map<number, number>();
    const stepDropoffs = new Map<number, number>();

    journeys.forEach(journey => {
      journey.segments.forEach(segment => {
        stepCounts.set(segment.step, (stepCounts.get(segment.step) || 0) + 1);
      });
      
      if (journey.dropoffPoint) {
        stepDropoffs.set(journey.dropoffPoint, (stepDropoffs.get(journey.dropoffPoint) || 0) + 1);
      }
    });

    stepDropoffs.forEach((dropoffCount, step) => {
      const totalAtStep = stepCounts.get(step) || 0;
      if (totalAtStep > 0) {
        dropoffPoints.push({
          step,
          rate: dropoffCount / totalAtStep
        });
      }
    });

    return {
      patternId,
      name: `Pattern: ${pathSteps.slice(0, 3).join(' → ')}${pathSteps.length > 3 ? '...' : ''}`,
      description: `Common user journey with ${frequency} occurrences`,
      commonPath: pathSteps,
      frequency,
      successRate,
      averageDuration,
      conversionRate,
      dropoffPoints,
      variants: [] // Would group similar patterns as variants
    };
  }

  /**
   * Build funnel data from journeys
   */
  private buildFunnelData(
    journeys: UserJourney[],
    funnelSteps: Array<{
      stepName: string;
      eventType: AnalyticsEventType;
      component?: string;
    }>
  ): any {
    const stepUsers = new Map<number, Set<string>>();
    const stepTimings = new Map<number, number[]>();
    
    // Initialize step tracking
    funnelSteps.forEach((_, index) => {
      stepUsers.set(index, new Set());
      stepTimings.set(index, []);
    });

    journeys.forEach(journey => {
      let currentStep = 0;
      let stepStartTime = journey.startTime;
      
      journey.segments.forEach(segment => {
        if (currentStep < funnelSteps.length) {
          const expectedStep = funnelSteps[currentStep];
          
          if (segment.eventType === expectedStep.eventType &&
              (!expectedStep.component || segment.component === expectedStep.component)) {
            
            stepUsers.get(currentStep)!.add(journey.sessionId);
            
            if (currentStep > 0) {
              const timeToStep = segment.timestamp - stepStartTime;
              stepTimings.get(currentStep)!.push(timeToStep);
            }
            
            stepStartTime = segment.timestamp;
            currentStep++;
          }
        }
      });
    });

    const totalUsers = stepUsers.get(0)?.size || 0;
    const completedUsers = stepUsers.get(funnelSteps.length - 1)?.size || 0;
    
    const steps = funnelSteps.map((step, index) => {
      const usersAtStep = stepUsers.get(index)!.size;
      const conversionRate = index === 0 ? 100 : (usersAtStep / totalUsers) * 100;
      const dropoffRate = index === 0 ? 0 : 100 - conversionRate;
      
      const timings = stepTimings.get(index) || [];
      const averageTimeToNext = timings.length > 0 
        ? timings.reduce((sum, time) => sum + time, 0) / timings.length 
        : undefined;

      return {
        stepName: step.stepName,
        eventType: step.eventType,
        totalUsers: usersAtStep,
        conversionRate,
        dropoffRate,
        averageTimeToNext
      };
    });

    // Calculate completion time statistics
    const completionTimes = journeys
      .filter(j => j.outcome === 'completed')
      .map(j => j.totalDuration);
    
    const sortedTimes = completionTimes.sort((a, b) => a - b);
    const median = sortedTimes[Math.floor(sortedTimes.length / 2)] || 0;
    const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0;
    const average = completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length || 0;

    return {
      steps,
      overallConversionRate: totalUsers > 0 ? (completedUsers / totalUsers) * 100 : 0,
      totalUsers,
      completedUsers,
      timeToComplete: {
        median,
        p95,
        average
      }
    };
  }

  /**
   * Check if event type represents a conversion
   */
  private isConversionEvent(eventType: AnalyticsEventType): boolean {
    const conversionEvents = [
      AnalyticsEventType.GRAPH_EXECUTION_COMPLETE,
      AnalyticsEventType.CONVERSION_EVENT
    ];
    return conversionEvents.includes(eventType);
  }
}