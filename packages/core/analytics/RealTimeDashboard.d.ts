/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Real-time Analytics Dashboard - Story 1.5 Task 4
 *
 * Consolidated real-time dashboard integrating all 12+ analytics systems
 * through the unified event bus with WebSocket streaming and performance widgets.
 */
import React from 'react';
import { UnifiedEventBus } from './UnifiedEventBus';
import { EventRepository } from './EventPersistenceLayer';
import { AnalyticsAuthorizationService, AuthContext } from './AnalyticsAuthorization';
import './RealTimeDashboard.css';

}
}
interface DashboardConfig { refreshInterval: number;
    maxEventsDisplay: number;
    enableWebSocket: boolean;
    enableAutoRefresh: boolean;
    defaultTimeRange: number;
    widgetLayout: 'grid' | 'masonry' | 'flex';
    theme: 'light' | 'dark' | 'auto';

export declare enum WidgetType {
    EVENT_STREAM = "event_stream";
    METRICS_SUMMARY = "metrics_summary";
    TIME_SERIES_CHART = "time_series_chart";
    HEAT_MAP = "heat_map";
    TOP_SOURCES = "top_sources";
    ERROR_RATE = "error_rate";
    PERFORMANCE_METRICS = "performance_metrics";
    USER_ACTIVITY = "user_activity";
    SYSTEM_HEALTH = "system_health";
    COST_TRACKING = "cost_tracking";
    INTEGRATION_STATUS = "integration_status" }
    SECURITY_EVENTS = "security_events"

}
}
}
interface RealTimeDashboardProps {
    eventBus: UnifiedEventBus;
    eventRepository: EventRepository;
    authService: AnalyticsAuthorizationService;
    authContext: AuthContext;
    config?: Partial<DashboardConfig>;
    onWidgetError?: (widgetId: string, error: Error) => void;


/**
 * Real-time Analytics Dashboard Component
 */
export declare const RealTimeDashboard: React.FC<RealTimeDashboardProps>;
export default RealTimeDashboard;
//# sourceMappingURL=RealTimeDashboard.d.ts.map
}
}