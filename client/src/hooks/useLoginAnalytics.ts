// Epic 11 Login Analytics Hook
// React hook for tracking login metrics and user behavior
import { useState, useCallback, useRef } from 'react';

// Analytics event types
interface LoginAttemptEvent {
  email: string;
  success: boolean;
  duration: number;
  failureReason?: string;
  attemptNumber?: number;
  rememberMe?: boolean;
}
interface FormInteractionEvent {
  action: string;
  field?: string;
  value?: any;
  timestamp?: Date;
}
interface LoginAnalytics {
  totalAttempts: number;
  successfulLogins: number;
  failedAttempts: number;
  successRate: number;
  topFailureReasons: Array<{,
    reason: string;
    count: number;
    percentage: number;
  }>;
  suspiciousActivity: Array<{,
    type: string;
    description: string;
    count: number;
    severity: 'low' | 'medium' | 'high';
  }>;
  deviceAnalysis: {,
    newDevices: number;
    returningDevices: number;
    suspiciousDevices: number;
  };
}

export const useLoginAnalytics = () => {
  const [isTracking, setIsTracking] = useState(true);
  const [analytics, setAnalytics] = useState<LoginAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Track form interactions in memory before sending
  const formInteractions = useRef<FormInteractionEvent[]>([]);
  const sessionStartTime = useRef<Date>(new Date());
  // Enable/disable tracking
  const setTrackingEnabled = useCallback((enabled: boolean) => {
    setIsTracking(enabled);
  }, []);
  // Track form interactions (focus, blur, change events)
  const trackFormInteraction = useCallback((action: string, field?: string, value?: any) => {
    if (!isTracking) return;
    const event: FormInteractionEvent = {
      action,
      field,
      value: typeof value === 'string' ? value.substring(0, 50) : value, // Limit value length
      timestamp: new Date(),
    };
    formInteractions.current.push(event);
    // Send interactions in batches to avoid overwhelming the server
    if (formInteractions.current.length >= 10) {
      sendFormInteractions();
    }
  }, [isTracking]);
  // Track login attempts with detailed metrics
  const trackLoginAttempt = useCallback(async (event: LoginAttemptEvent) => {
    if (!isTracking) return;
    try {
      // Prepare analytics payload
      const payload = {
        ...event,
        sessionDuration: new Date().getTime() - sessionStartTime.current.getTime(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenResolution: `${screen.width}x${screen.height}`,}
        timestamp: new Date().toISOString(),
        // Include recent form interactions
        formInteractions: formInteractions.current.slice(-20) // Last 20 interactions,
      };
      // Send to analytics endpoint
      await fetch('/api/auth/analytics/login-attempt', {)
        method: 'POST',
        headers: {,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      // Clear form interactions after successful login
      if (event.success) {
        formInteractions.current = [];
      }
    } catch (error) {
      console.error('Failed to track login attempt:', error);
    }
  }, [isTracking]);
  // Send batched form interactions
  const sendFormInteractions = useCallback(async () => {
    if (!isTracking || formInteractions.current.length === 0) return;
    try {
      const payload = {
        interactions: formInteractions.current,
        sessionId: generateSessionId(),
        timestamp: new Date().toISOString(),
      };
      await fetch('/api/auth/analytics/form-interactions', {)
        method: 'POST',
        headers: {,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      // Clear sent interactions
      formInteractions.current = [];
    } catch (error) {
      console.error('Failed to send form interactions:', error);
    }
  }, [isTracking]);
  // Track security events (unusual behavior, suspicious patterns)
  const trackSecurityEvent = useCallback(async (eventType: string, details: any) => {
    if (!isTracking) return;
    try {
      const payload = {
        type: eventType,
        details,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        sessionId: generateSessionId(),
      };
      await fetch('/api/auth/analytics/security-event', {)
        method: 'POST',
        headers: {,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Failed to track security event:', error);
    }
  }, [isTracking]);
  // Fetch login analytics data
  const fetchAnalytics = useCallback(async (timeframe: 'day' | 'week' | 'month' = 'week') => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/analytics?timeframe=${timeframe}`, {)}
        method: 'GET',
        credentials: 'include',
        headers: {,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      setAnalytics(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  // Track page performance metrics
  const trackPageMetrics = useCallback(async () => {
    if (!isTracking) return;
    try {
      // Use Performance API if available
      if ('performance' in window && 'getEntriesByType' in performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        const metrics = {
          pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          connectionType: (navigator as any).connection?.effectiveType || 'unknown',
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        };
        await fetch('/api/auth/analytics/page-metrics', {)
          method: 'POST',
          headers: {,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(metrics),
        });
      }
    } catch (error) {
      console.error('Failed to track page metrics:', error);
    }
  }, [isTracking]);
  // Track user engagement metrics
  const trackEngagement = useCallback(async (engagementType: string, data?: any) => {
    if (!isTracking) return;
    try {
      const payload = {
        type: engagementType,
        data,
        timestamp: new Date().toISOString(),
        sessionDuration: new Date().getTime() - sessionStartTime.current.getTime(),
        pageUrl: window.location.href,
      };
      await fetch('/api/auth/analytics/engagement', {)
        method: 'POST',
        headers: {,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Failed to track engagement:', error);
    }
  }, [isTracking]);
  // Generate a session ID for tracking
  const generateSessionId = (): string => {
    // Use existing session ID if available, otherwise generate new one
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  };
  // Detect and track suspicious behavior patterns
  const detectSuspiciousBehavior = useCallback(async () => {
    if (!isTracking) return;
    try {
      const interactions = formInteractions.current;
      const recentInteractions = interactions.slice(-10);
      // Detect rapid typing (possible bot)
      const typingIntervals = recentInteractions;
        .filter(i => i.action.includes('changed'))
        .map((interaction, index, arr) => {
          if (index === 0) return null;
          return interaction.timestamp!.getTime() - arr[index - 1].timestamp!.getTime();
        })
        .filter(interval => interval !== null) as number[];
      if (typingIntervals.length > 5) {
        const avgInterval = typingIntervals.reduce((a, b) => a + b, 0) / typingIntervals.length;
        if (avgInterval < 50) { // Less than 50ms between keystrokes
          await trackSecurityEvent('rapid_typing_detected', {)
            averageInterval: avgInterval,
            intervalCount: typingIntervals.length,
          });
        }
      }
      // Detect copy-paste behavior
      const pasteEvents = recentInteractions.filter(i => i.action.includes('paste'));
      if (pasteEvents.length > 0) {
        await trackSecurityEvent('paste_detected', {)
          pasteCount: pasteEvents.length,
          fields: pasteEvents.map(e => e.field),
        });
      }
      // Detect form abandonment patterns
      const formFocusEvents = interactions.filter(i => i.action.includes('focus'));
      const formSubmitEvents = interactions.filter(i => i.action.includes('submit'));
      if (formFocusEvents.length > 3 && formSubmitEvents.length === 0) {
        const sessionDuration = new Date().getTime() - sessionStartTime.current.getTime();
        if (sessionDuration > 30000) { // More than 30 seconds without submitting
          await trackSecurityEvent('form_abandonment', {)
            focusEvents: formFocusEvents.length,
            sessionDuration
          });
        }
      }
    } catch (error) {
      console.error('Failed to detect suspicious behavior:', error);
    }
  }, [isTracking, trackSecurityEvent]);
  // Cleanup function to send remaining data
  const cleanup = useCallback(async () => {
    await sendFormInteractions();
    await detectSuspiciousBehavior();
  }, [sendFormInteractions, detectSuspiciousBehavior]);
  return {
    isTracking,
    analytics,
    isLoading,
    setTrackingEnabled,
    trackFormInteraction,
    trackLoginAttempt,
    trackSecurityEvent,
    trackPageMetrics,
    trackEngagement,
    fetchAnalytics,
    detectSuspiciousBehavior,
    cleanup
  };
};

// Hook for analytics dashboard components
export const useAnalyticsDashboard = () => {
  const { fetchAnalytics, analytics, isLoading } = useLoginAnalytics();
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const refreshAnalytics = useCallback(async () => {
    await fetchAnalytics(timeframe);
  }, [fetchAnalytics, timeframe]);
  // Calculate additional metrics
  const getSecurityScore = useCallback((): number => {
    if (!analytics) return 0;
    const totalAttempts = analytics.totalAttempts;
    const suspiciousCount = analytics.suspiciousActivity.reduce((sum, activity) => sum + activity.count, 0);
    const highSeverityCount = analytics.suspiciousActivity;
      .filter(activity => activity.severity === 'high')
      .reduce((sum, activity) => sum + activity.count, 0);
    // Calculate score out of 100
    const suspiciousRatio = totalAttempts > 0 ? suspiciousCount / totalAttempts : 0;
    const highSeverityRatio = totalAttempts > 0 ? highSeverityCount / totalAttempts : 0;
    const score = Math.max(0, 100 - (suspiciousRatio * 50) - (highSeverityRatio * 30));
    return Math.round(score);
  }, [analytics]);
  const getTrendData = useCallback(() => {
    if (!analytics) return null;
    return {
      successRate: analytics.successRate,
      securityScore: getSecurityScore(),
      deviceTrustRatio: analytics.deviceAnalysis.returningDevices / ,
        (analytics.deviceAnalysis.newDevices + analytics.deviceAnalysis.returningDevices || 1)
    };
  }, [analytics, getSecurityScore]);
  return {
    analytics,
    isLoading,
    timeframe,
    setTimeframe,
    refreshAnalytics,
    getSecurityScore,
    getTrendData
  };
};

export default useLoginAnalytics;