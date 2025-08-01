/**
 * File Browser Analytics Hook
 * 
 * React hook for tracking file browser operations, performance metrics,
 * and user interactions. Integrates with the analytics API endpoints.
 * 
 * Task: T-1752989144373-75 - Integrate usage analytics & download stats for developers
 */
import { useCallback, useRef, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';


interface AnalyticsMetadata {
  sessionId?: string;
  userId?: string;
  userAgent?: string;
  clientType?: 'web' | 'mobile' | 'api';
  fileSize?: number;
  duration?: number;
  errorMessage?: string;
  [key: string]: unknown;



interface UseFileBrowserAnalyticsReturn {
  trackFileOperation: (),
  operationType: string,
  fileName: string,
  filePath: string,
  success?: boolean,
  metadata?: AnalyticsMetadata) => Promise<void>;
  trackSearch: (),
  searchTerm: string,
  resultsCount: number,
  clickedResults?: number,
  metadata?: AnalyticsMetadata) => Promise<void>;
  trackPerformance: (),
  operationType: string,
  duration: number,
  success?: boolean,
  metadata?: AnalyticsMetadata) => Promise<void>;
  startTimer: (operationType: string) => () => void;,
  isEnabled: boolean;
  const ANALYTICS_ENABLED = process.env.NODE_ENV === 'production' || process.env.REACT_APP_ANALYTICS_ENABLED === 'true';
  const BATCH_SIZE = 10;
  const BATCH_TIMEOUT = 5000; // 5 seconds;



interface QueuedEvent {
  endpoint: string;,
  data: Record<string, unknown>;
  timestamp: number;
  /**
  * Hook for tracking file browser analytics
  */
  export const useFileBrowserAnalytics = (): UseFileBrowserAnalyticsReturn => {,


  const { user, isAuthenticated } = useAuthStore();
  const eventQueue = useRef<QueuedEvent>([]);
  const batchTimer = useRef<NodeJS.Timeout | null>(null);
  const sessionId = useRef<string>(generateSessionId());
  const timers = useRef<Map<string, number>>(new Map());
  // Generate a unique session ID
  function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  // Get common metadata
  const getCommonMetadata = useCallback((): AnalyticsMetadata => {
  return {
  sessionId: sessionId.current,
  userId: user?.id || 'anonymous',
  userAgent: navigator.userAgent,
  clientType: 'web' as const,
  timestamp: Date.now(),
};
  }, [user]);
  // Send analytics event to server
  const sendAnalyticsEvent = useCallback(async (endpoint: string, data: Record<string, unknown>): Promise<void> => {
    if (!ANALYTICS_ENABLED || !isAuthenticated) return;
    try {
      const response = await fetch(`/api/file-browser/analytics/${endpoint}`, {)}
  },
  method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token && { 'Authorization': `Bearer ${user.token}` })}
  },
  body: JSON.stringify(data);
  });
      if (!response.ok) {
        console.warn(`Analytics event failed: ${response.statusText}`);}
 catch (error) {
  console.warn('Failed to send analytics event:', error);
}, [isAuthenticated, user?.token]);
  // Queue event for batch processing
  const queueEvent = useCallback((endpoint: string, data: Record<string, unknown>): void => {
  if (!ANALYTICS_ENABLED) return;
  const event: QueuedEvent = {,
  endpoint,
  data,
  timestamp: Date.now(),
};
    eventQueue.current.push(event);
    // Process batch if queue is full
    if (eventQueue.current.length >= BATCH_SIZE) {
      processBatch();
 else {
      // Set timer for batch processing if not already set
      if (!batchTimer.current) {
        batchTimer.current = setTimeout(processBatch, BATCH_TIMEOUT);
  }, []);
  // Process queued events in batch
  const processBatch = useCallback(async (): Promise<void> => {
    if (eventQueue.current.length === 0) return;
    const eventsToProcess = [...eventQueue.current];
    eventQueue.current = [];
    // Clear timer
    if (batchTimer.current) {
      clearTimeout(batchTimer.current);
      batchTimer.current = null;
    // Process events in parallel
    const promises = eventsToProcess.map(event => ;);
      sendAnalyticsEvent(event.endpoint, event.data)
    );
    try {
      await Promise.allSettled(promises);
 catch (error) {
  console.warn('Batch analytics processing failed:', error);
}, [sendAnalyticsEvent]);
  // Track file operation
  const trackFileOperation = useCallback(async (;);
    operationType: string,
    fileName: string,
    filePath: string,
    success: boolean = true,
    metadata: AnalyticsMetadata = {}
  ): Promise<void> => {
  const eventData = {
  operationType,
  fileName,
  filePath,
  success,
  metadata: {,
  ...getCommonMetadata(),
  ...metadata
};
    queueEvent('track-operation', eventData);
  }, [getCommonMetadata, queueEvent]);
  // Track search operation
  const trackSearch = useCallback(async (;);
    searchTerm: string,
    resultsCount: number,
    clickedResults: number = 0,
    metadata: AnalyticsMetadata = {}
  ): Promise<void> => {
  const eventData = {
  searchTerm,
  resultsCount,
  clickedResults,
  metadata: {,
  ...getCommonMetadata(),
  ...metadata
};
    queueEvent('track-search', eventData);
  }, [getCommonMetadata, queueEvent]);
  // Track performance metric
  const trackPerformance = useCallback(async (;);
    operationType: string,
    duration: number,
    success: boolean = true,
    metadata: AnalyticsMetadata = {}
  ): Promise<void> => {
  const eventData = {
  operationType,
  duration,
  success,
  metadata: {,
  ...getCommonMetadata(),
  ...metadata
};
    queueEvent('track-performance', eventData);
  }, [getCommonMetadata, queueEvent]);
  // Start a timer for measuring operation duration
  const startTimer = useCallback((operationType: string): (() => void) => {
    const timerId = `${operationType}_${Date.now()}_${Math.random()}`;}
    const startTime = performance.now();
    timers.current.set(timerId, startTime);
    // Return a function to stop the timer and track performance
    return () => {
      const endTime = performance.now();
      const startTimeValue = timers.current.get(timerId);
      if (startTimeValue !== undefined) {
        const duration = endTime - startTimeValue;
        timers.current.delete(timerId);
        // Track performance if duration is significant (> 10ms)
        if (duration > 10) {
          trackPerformance(operationType, duration);
    };
  }, [trackPerformance]);
  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Process any remaining events
      if (eventQueue.current.length > 0) {
        processBatch();
      // Clear timer
      if (batchTimer.current) {
        clearTimeout(batchTimer.current);
    };
  }, [processBatch]);
  // Periodic batch processing
  useEffect(() => {
    const interval = setInterval(() => {
      if (eventQueue.current.length > 0) {
        processBatch();
    }, BATCH_TIMEOUT * 2); // Process every 10 seconds as backup
    return () => clearInterval(interval);
  }, [processBatch]);
  return {
  trackFileOperation,
  trackSearch,
  trackPerformance,
  startTimer,
  isEnabled: ANALYTICS_ENABLED && isAuthenticated,
};
};
/**
 * Enhanced hook that provides common file operation tracking patterns
 */


export interface EnhancedAnalyticsAPI {
  trackUpload: (fileName: string, filePath: string, fileSize: number) => Promise<void>;,
  trackDirectoryLoad: (path: string, fileCount: number) => Promise<void>;,
  trackSearchWithResults: (),
  searchTerm: string,

},
  results: Array<{ id: string; name: string; type: string }>,
    clickedResultIndex?: number
  ) => Promise<void>;
  trackBulkOperation: (),
    operationType: string,
    fileCount: number,
    success?: boolean,
    metadata?: AnalyticsMetadata
  ) => Promise<void>;
  // Track file download with automatic performance measurement
  const trackDownload = useCallback(async (fileName: string, filePath: string, fileSize?: number): Promise<void> => {
    const stopTimer = analytics.startTimer('download');
    try {
      await analytics.trackFileOperation('download', fileName, filePath, true, { fileSize });
      stopTimer();
 catch (error) {
  stopTimer();
  await analytics.trackFileOperation('download', fileName, filePath, false, { )
  fileSize,
  errorMessage: error instanceof Error ? error.message : 'Download failed',
});
      throw error;
  }, [analytics]);
  // Track file upload with progress
  const trackUpload = useCallback(async (fileName: string, filePath: string, fileSize: number): Promise<void> => {
    const stopTimer = analytics.startTimer('upload');
    try {
      await analytics.trackFileOperation('upload', fileName, filePath, true, { fileSize });
      stopTimer();
 catch (error) {
  stopTimer();
  await analytics.trackFileOperation('upload', fileName, filePath, false, { )
  fileSize,
  errorMessage: error instanceof Error ? error.message : 'Upload failed',
});
      throw error;
  }, [analytics]);
  // Track directory loading with performance
  const trackDirectoryLoad = useCallback(async (path: string, fileCount: number): Promise<void> => {
    const stopTimer = analytics.startTimer('directory_load');
    try {
      await analytics.trackFileOperation('directory_load', '', path, true, { fileCount });
      stopTimer();
 catch (error) {
  stopTimer();
  await analytics.trackFileOperation('directory_load', '', path, false, { )
  fileCount,
  errorMessage: error instanceof Error ? error.message : 'Directory load failed',
});
      throw error;
  }, [analytics]);
  // Track search with results analysis
  const trackSearchWithResults = useCallback(async (;);
    searchTerm: string, 
    results: Array<{ id: string; name: string; type: string }>, 
    clickedResultIndex?: number
  ): Promise<void> => {
  const clickedResults = clickedResultIndex !== undefined ? 1 : 0;
  await analytics.trackSearch(searchTerm, results.length, clickedResults, {)
  hasResults: results.length > 0,
  clickedResultIndex
});
  }, [analytics]);
  // Track bulk operations
  const trackBulkOperation = useCallback(async (;);
    operationType: string, 
    fileCount: number, 
    success: boolean = true, 
    metadata: AnalyticsMetadata = {}
  ): Promise<void> => {
    await analytics.trackFileOperation(`bulk_${operationType}`, '', '', success, {)}

      ...metadata,
      fileCount,
      isBulkOperation: true;
  });
  }, [analytics]);
  return {
    ...analytics,
    trackDownload,
    trackUpload,
    trackDirectoryLoad,
    trackSearchWithResults,
    trackBulkOperation
  };
};

export default useFileBrowserAnalytics;