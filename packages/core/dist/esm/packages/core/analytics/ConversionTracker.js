/**
 * Conversion Tracking System - E17-1753114397422-300202
 *
 * Comprehensive conversion tracking for Wild Construct platform
 * focusing on user engagement, creative workflow completion, and business metrics.
 *
 * Features:
 * - Multi-funnel conversion tracking
 * - Real-time event streaming
 * - A/B testing integration
 * - Revenue attribution
 * - User journey analytics
 */
;
;
metrics: {
    totalUsers: number;
    conversions: number;
    conversionRate: number;
    averageTimeToConvert: number;
    dropoffPoints: {
        step: string;
        dropoffRate: number;
        users: number;
    }
    [];
}
;
segmentBreakdown: {
    [segment, string];
    {
        users: number;
        conversions: number;
        rate: number;
    }
    ;
}
;
export class ConversionTracker {
    events = [];
    funnels = new Map();
    userSessions = new Map();
    eventListeners = new Map();
    analyticsEndpoint = '/api/analytics/events';
    batchSize = 50;
    flushInterval = 30000; // 30 seconds,
    pendingEvents = [];
    constructor() {
        this.initializeDefaultFunnels();
        this.startEventFlushing();
    }
    initializeDefaultFunnels() {
        // Director Onboarding Funnel
        const directorOnboardingFunnel = {
            id: 'director-onboarding',
            name: 'Director Onboarding',
            description: 'Complete onboarding flow for film industry professionals',
            timeWindow: 7 * 24 * 60 * 60 * 1000, // 7 days,
            category: 'activation',
            steps: [,
                {
                    id: 'signup',
                    name: 'Account Created',
                    eventType: 'user_signup',
                    required: true,
                },
                {
                    id: 'email-verify',
                    name: 'Email Verified',
                    eventType: 'email_verified',
                    required: true,
                },
                {
                    id: 'profile-complete',
                    name: 'Profile Completed',
                    eventType: 'profile_completed',
                    required: false,
                    conditions: { role: 'director' }
                },
                {
                    id: 'first-project',
                    name: 'First Project Created',
                    eventType: 'first_project_created',
                    required: true,
                },
                {
                    id: 'tutorial-complete',
                    name: 'Director Tutorial Completed',
                    eventType: 'tutorial_completed',
                    required: false,
                    conditions: { tutorial: 'director-fundamentals' }
                }
            ]
        };
        // Creative Workflow Funnel
        const creativeWorkflowFunnel = {
            id: 'creative-workflow',
            name: 'Creative Workflow Completion',
            description: 'Complete creative workflow from idea to export',
            timeWindow: 2 * 60 * 60 * 1000, // 2 hours,
            category: 'activation',
            steps: [,
                {
                    id: 'node-create',
                    name: 'First Node Created',
                    eventType: 'node_created',
                    required: true,
                },
                {
                    id: 'connection-made',
                    name: 'First Connection Made',
                    eventType: 'first_connection_made',
                    required: true,
                },
                {
                    id: 'preview-generated',
                    name: 'First Preview Generated',
                    eventType: 'first_preview_generated',
                    required: true,
                },
                {
                    id: 'project-saved',
                    name: 'Project Saved',
                    eventType: 'project_saved',
                    required: true,
                },
                {
                    id: 'export-generated',
                    name: 'Export Generated',
                    eventType: 'export_generated',
                    required: false
                }]
        };
        // Subscription Conversion Funnel
        const subscriptionFunnel = {
            id: 'subscription-conversion',
            name: 'Trial to Paid Conversion',
            description: 'Conversion from trial to paid subscription',
            timeWindow: 14 * 24 * 60 * 60 * 1000, // 14 days,
            category: 'revenue',
            steps: [,
                {
                    id: 'trial-start',
                    name: 'Trial Started',
                    eventType: 'trial_started',
                    required: true,
                },
                {
                    id: 'advanced-feature',
                    name: 'Advanced Feature Used',
                    eventType: 'advanced_feature_used',
                    required: false,
                },
                {
                    id: 'subscription-upgrade',
                    name: 'Subscription Upgraded',
                    eventType: 'subscription_upgraded',
                    required: true,
                },
                {
                    id: 'payment-complete',
                    name: 'Payment Completed',
                    eventType: 'payment_completed',
                    required: true
                }]
        };
        this.funnels.set(directorOnboardingFunnel.id, directorOnboardingFunnel);
        this.funnels.set(creativeWorkflowFunnel.id, creativeWorkflowFunnel);
        this.funnels.set(subscriptionFunnel.id, subscriptionFunnel);
        /**
         * Track a conversion event
         */
    }
    properties = {};
    value;
}
void {
    const: userId = this.getCurrentUserId(),
    const: sessionId = this.getCurrentSessionId(),
    const: event, ConversionEvent = {
        id: this.generateEventId(),
        userId,
        sessionId,
        timestamp: Date.now(),
        type,
        category: this.getCategoryForEventType(type),
        value,
        properties,
        metadata: {
            userAgent: (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : 'server',
            referrer: (typeof document !== 'undefined' && document.referrer) ? document.referrer : '',
            campaignSource: this.getCampaignSource(),
            experimentGroup: this.getExperimentGroup(),
        },
        // Store event locally
        this: .events.push(event),
        this: .pendingEvents.push(event),
        // Trigger event listeners
        this: .triggerEventListeners(event),
        // Check for funnel progress
        this: .checkFunnelProgress(event),
        : .pendingEvents.length >= this.batchSize }
};
{
    this.flushEvents();
    trackDirectorWorkflow(action, string, context, (Record) = {});
    void {
        const: workflowEvents
    };
    {
        'node-created';
        'node_created',
            'connection-made';
        'first_connection_made',
            'preview-generated';
        'first_preview_generated',
            'advanced-feature-used';
        'advanced_feature_used',
            'project-saved';
        'project_saved',
            'project-shared';
        'project_shared',
            'template-used';
        'template_used',
            'export-generated';
        'export_generated',
        ;
    }
    ;
    if (workflowEvents[action]) {
        this.trackEvent(workflowEvents[action], {});
        workflow_context: 'director',
        ;
        context;
    }
    ;
    trackEngagement(engagementType, 'feature_usage' | 'help_interaction' | 'collaboration' | 'content_creation');
    details: (Record) = {};
    void {
        const: baseProperties = {
            engagement_type: engagementType,
            session_duration: this.getSessionDuration(),
            ...details
        },
        switch(engagementType) {
        },
        case: 'feature_usage',
        this: .trackEvent('feature_discovered', baseProperties),
        break: ,
        case: 'help_interaction',
        this: .trackEvent('help_content_viewed', baseProperties),
        break: ,
        case: 'collaboration',
        this: .trackEvent('collaboration_invited', baseProperties),
        break: ,
        case: 'content_creation',
        this: .trackEvent('template_shared', baseProperties),
        break: ,
        value: number,
        metadata: (Record) = {},
        void: {
            this: .trackEvent(eventType, {}),
            business_event: true,
            ...metadata
        }, value,
        /**
         * Get conversion metrics for a specific funnel
         */
        getFunnelMetrics(funnelId, startTime, endTime) {
            const funnel = this.funnels.get(funnelId);
            if (!funnel)
                return null;
            const relevantEvents = this.events.filter();
            ;
            event => event.timestamp >= startTime && event.timestamp <= endTime;
            ;
            // Group events by user
            const userEvents = new Map();
            relevantEvents.forEach(event => { });
            if (!userEvents.has(event.userId)) {
                userEvents.set(event.userId, []);
                userEvents.get(event.userId).push(event);
            }
            ;
            // Analyze funnel progression for each user
            const userJourneys = Array.from(userEvents.entries()).map(([userId, events]) => {
                const sortedEvents = events.sort((a, b) => a.timestamp - b.timestamp);
                return this.analyzeFunnelProgression(funnel, sortedEvents);
            });
            // Calculate metrics
            const totalUsers = userJourneys.length;
            const conversions = userJourneys.filter(journey => journey.completed).length;
            const conversionRate = totalUsers > 0 ? (conversions / totalUsers) * 100 : 0;
            const completedJourneys = userJourneys.filter(j => j.completed);
            const averageTimeToConvert = completedJourneys.length > 0;
            completedJourneys.reduce((sum, j) => sum + j.timeToComplete, 0) / completedJourneys.length;
            0;
            // Calculate dropoff points
            const stepCompletions = new Map();
            funnel.steps.forEach(step => stepCompletions.set(step.id, 0));
            userJourneys.forEach(journey => { });
            journey.completedSteps.forEach(stepId => { });
            stepCompletions.set(stepId, (stepCompletions.get(stepId) || 0) + 1);
        }
    };
    ;
    const dropoffPoints = funnel.steps.map((step, index) => {
        const currentStepUsers = stepCompletions.get(step.id) || 0;
        const previousStepUsers = index > 0;
    })
        ? stepCompletions.get(funnel.steps[index - 1].id) || totalUsers
        : totalUsers;
    const dropoffRate = previousStepUsers > 0;
    ((previousStepUsers - currentStepUsers) / previousStepUsers) * 100;
    0;
    return {
        step: step.name,
        dropoffRate,
        users: currentStepUsers,
    };
}
;
return {
    funnel: funnelId,
    period: { start: startTime, end: endTime },
    metrics: {
        totalUsers,
        conversions,
        conversionRate,
        averageTimeToConvert,
        dropoffPoints
    },
    segmentBreakdown: this.calculateSegmentBreakdown(userJourneys, relevantEvents)
};
getDashboardData();
{
    realTimeMetrics: {
        activeUsers: number;
        conversionsLast24h: number;
        topConvertingFunnel: string;
        averageSessionDuration: number;
    }
    ;
    funnelPerformance: {
        [funnelId, string];
        {
            conversionRate: number;
            trend: 'up' | 'down' | 'stable';
            completions24h: number;
        }
        ;
    }
    ;
    recentEvents: ConversionEvent;
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);
    const last48h = now - (48 * 60 * 60 * 1000);
    const recentEvents = this.events.filter(e => e.timestamp >= last24h);
    // Calculate real-time metrics
    const activeUsers = new Set(recentEvents.map(e => e.userId)).size;
    const conversionsLast24h = recentEvents.filter(e => );
    ;
    ['subscription_upgraded', 'payment_completed', 'first_project_created'].includes(e.type);
    length;
    // Funnel performance
    const funnelPerformance = {};
    Array.from(this.funnels.keys()).forEach(funnelId => { });
    const currentMetrics = this.getFunnelMetrics(funnelId, last24h, now);
    const previousMetrics = this.getFunnelMetrics(funnelId, last48h, last24h);
    if (currentMetrics) {
        let trend = 'stable';
        if (previousMetrics) {
            const rateDiff = currentMetrics.metrics.conversionRate - previousMetrics.metrics.conversionRate;
            if (rateDiff > 1)
                trend = 'up';
            else if (rateDiff < -1)
                trend = 'down';
            funnelPerformance[funnelId] = {
                conversionRate: currentMetrics.metrics.conversionRate,
                trend,
                completions24h: currentMetrics.metrics.conversions,
            };
        }
        ;
        // Top converting funnel
        const topConvertingFunnel = Object.entries(funnelPerformance);
        sort(([a], [b]) => b.conversionRate - a.conversionRate)[0]?.[0] || '';
        // Average session duration
        const sessionDurations = this.calculateSessionDurations(recentEvents);
        const averageSessionDuration = sessionDurations.length > 0;
        sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length;
        0;
        return {
            realTimeMetrics: {
                activeUsers,
                conversionsLast24h,
                topConvertingFunnel,
                averageSessionDuration
            },
            funnelPerformance,
            recentEvents: recentEvents.slice(-50) // Last 50 events;
        };
        trackExperimentConversion(experimentId, string);
        variantId: string,
            eventType;
        ConversionEventType,
            properties;
        (Record) = {};
        void {
            this: .trackEvent(eventType, {}),
            experiment_id: experimentId,
            variant_id: variantId,
            is_experiment: true,
            ...properties
        };
        ;
        addEventListener(eventType, ConversionEventType, callback, (event) => void );
        void {
            : .eventListeners.has(eventType)
        };
        {
            this.eventListeners.set(eventType, []);
            this.eventListeners.get(eventType).push(callback);
            removeEventListener(eventType, ConversionEventType, callback, (event) => void );
            void {
                const: listeners = this.eventListeners.get(eventType),
                if(listeners) {
                    const index = listeners.indexOf(callback);
                    if (index > -1) {
                        listeners.splice(index, 1);
                        // Private helper methods
                    }
                    // Private helper methods
                }
                // Private helper methods
                ,
                // Private helper methods
                generateEventId() {
                    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                },
                getCurrentUserId() {
                    // This would integrate with your authentication system
                    return typeof localStorage !== 'undefined' ? localStorage.getItem('userId') || 'anonymous' : 'anonymous';
                },
                getCurrentSessionId() {
                    const userId = this.getCurrentUserId();
                    if (!this.userSessions.has(userId)) {
                        this.userSessions.set(userId, `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
                    }
                    return this.userSessions.get(userId);
                },
                getCategoryForEventType(type) {
                    const categoryMap = {
                        'user_signup': 'acquisition',
                        'email_verified': 'acquisition',
                        'first_project_created': 'activation',
                        'tutorial_completed': 'activation',
                        'daily_active_user': 'retention',
                        'subscription_upgraded': 'revenue',
                        'payment_completed': 'revenue',
                        'project_shared': 'referral',
                        'template_shared': 'referral',
                    };
                    return categoryMap[type] || 'retention';
                },
                getCampaignSource() {
                    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
                    return urlParams.get('utm_source') || undefined;
                },
                getExperimentGroup() {
                    return typeof localStorage !== 'undefined' ? localStorage.getItem('experimentGroup') || undefined : undefined;
                },
                getSessionDuration() {
                    const sessionStart = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('sessionStart') : null;
                    return sessionStart ? Date.now() - parseInt(sessionStart) : 0;
                },
                triggerEventListeners(event) {
                    const listeners = this.eventListeners.get(event.type) || [];
                    listeners.forEach(callback => { });
                    try {
                        callback(event);
                    }
                    catch (error) {
                        console.error('Error in conversion event listener:', error);
                    }
                    ;
                },
                checkFunnelProgress(event) {
                    // Check if this event progresses any active funnels
                    Array.from(this.funnels.values()).forEach(funnel => { });
                    const relevantStep = funnel.steps.find(step => step.eventType === event.type);
                    if (relevantStep) {
                        // This could trigger funnel progress notifications
                        console.log(`Funnel progress: ${funnel.name} - ${relevantStep.name} completed`);
                    }
                },
                let, timeToComplete = 0,
                let, dropoffStep: string | undefined,
                const: firstEvent = userEvents[0],
                if(, firstEvent) {
                    return { completed: false, completedSteps, timeToComplete };
                    for (const step of funnel.steps) {
                        const stepEvent = userEvents.find(event => { });
                        if (event.type !== step.eventType)
                            return false;
                        // Check conditions if any
                        if (step.conditions) {
                            for (const [key, value] of Object.entries(step.conditions)) {
                                if (event.properties[key] !== value)
                                    return false;
                                // Check timeout if any
                                if (step.timeout && event.timestamp > firstEvent.timestamp + step.timeout) {
                                    return false;
                                    return true;
                                }
                                ;
                                if (stepEvent) {
                                    completedSteps.push(step.id);
                                    timeToComplete = stepEvent.timestamp - firstEvent.timestamp;
                                }
                                else if (step.required) {
                                    dropoffStep = step.id;
                                    break;
                                    const completed = completedSteps.length === funnel.steps.filter(s => s.required).length;
                                    return {
                                        completed,
                                        completedSteps,
                                        timeToComplete,
                                        dropoffStep
                                    };
                                }
                            }
                        }
                    }
                },
                events: ConversionEvent, Record() { users: number; conversions: number; rate: number; }
            } > {
                // This would segment users by various criteria
                return: {
                    'directors': { users: 45, conversions: 23, rate: 51.1 },
                    'producers': { users: 32, conversions: 18, rate: 56.3 },
                    'writers': { users: 28, conversions: 12, rate: 42.9 },
                    'new_users': { users: 67, conversions: 31, rate: 46.3 },
                    'returning_users': { users: 38, conversions: 22, rate: 57.9 }
                },
                calculateSessionDurations(events) {
                    // Group by session and calculate durations
                    const sessionEvents = new Map();
                    events.forEach(event => { });
                    if (!sessionEvents.has(event.sessionId)) {
                        sessionEvents.set(event.sessionId, []);
                        sessionEvents.get(event.sessionId).push(event);
                    }
                    ;
                    return Array.from(sessionEvents.values()).map(sessionEvts => { });
                    const sorted = sessionEvts.sort((a, b) => a.timestamp - b.timestamp);
                    return sorted[sorted.length - 1].timestamp - sorted[0].timestamp;
                },
                async flushEvents() {
                    if (this.pendingEvents.length === 0)
                        return;
                    const eventsToFlush = [...this.pendingEvents];
                    this.pendingEvents = [];
                    try {
                        await fetch(this.analyticsEndpoint, {});
                        method: 'POST',
                            headers;
                        {
                            'Content-Type';
                            'application/json',
                            ;
                        }
                        body: JSON.stringify({ events: eventsToFlush });
                    }
                    finally { }
                    ;
                }, catch(error) {
                    console.error('Failed to flush conversion events:', error);
                    // Re-add events to pending queue for retry
                    this.pendingEvents.unshift(...eventsToFlush);
                },
                startEventFlushing() {
                    setInterval(() => {
                        this.flushEvents();
                    }, this.flushInterval);
                    // Global instance
                    export const conversionTracker = new ConversionTracker();
                    // Auto-initialize session tracking
                    if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
                        if (!sessionStorage.getItem('sessionStart')) {
                            sessionStorage.setItem('sessionStart', Date.now().toString());
                            // Track session start
                            conversionTracker.trackEvent('session_started');
                            export default conversionTracker;
                        }
                    }
                }
            };
        }
    }
}
