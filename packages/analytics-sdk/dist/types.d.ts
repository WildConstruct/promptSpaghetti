/**
 * Analytics SDK types
 */
export type Platform = 'web' | 'mobile' | 'desktop';
export interface AnalyticsEvent {
  name: string;
  properties: Record<string, unknown>;
  timestamp: Date;
  platform: Platform;
  userId?: string;
  sessionId?: string;
}
export interface AnalyticsConfig {
  apiKey: string;
  endpoint: string;
  platform: Platform;
  batchSize?: number;
  flushInterval?: number;
}
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  platform: Platform;
}
//# sourceMappingURL=types.d.ts.map
