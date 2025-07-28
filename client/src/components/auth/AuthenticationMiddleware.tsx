/**
 * Authentication Middleware - Global authentication state management and protection
 * 
 * Handles app-wide authentication concerns including token refresh, session monitoring,
 * and automatic logout on token expiration
 */
import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

// =============================================================================
// Types and Configuration
// =============================================================================
/**
 * Authentication middleware configuration
 */
interface AuthMiddlewareConfig {
  /** Enable automatic token refresh */
  autoRefresh?: boolean;
  /** Token refresh interval in milliseconds */
  refreshInterval?: number;
  /** Time before token expiry to trigger refresh (in milliseconds) */
  refreshThreshold?: number;
  /** Enable session monitoring */
  sessionMonitoring?: boolean;
  /** Session timeout in milliseconds (for inactivity detection) */
  sessionTimeout?: number;
  /** Routes that don't require authentication */
  publicRoutes?: string;
  /** Enable debug logging */
  debug?: boolean;
  /**
  * Default configuration
  */
  const DEFAULT_CONFIG: Required<AuthMiddlewareConfig> = {,
  autoRefresh: true,
  refreshInterval: 60000, // 1 minute,
  refreshThreshold: 300000, // 5 minutes before expiry,
  sessionMonitoring: true,
  sessionTimeout: 1800000, // 30 minutes,
  publicRoutes: ['/login', '/register', '/reset-password', '/verify-email', '/unauthorized', '/auth/callback'],
  debug: process.env.NODE_ENV === 'development',
};

// =============================================================================
// Session Activity Tracking
// =============================================================================
/**
 * Track user activity for session management
 */
class SessionActivityTracker {
  private lastActivity: number = Date.now();
  private activityListeners: (() => void)[] = [];
  private isListening: boolean = false;
  constructor() {
  this.updateActivity = this.updateActivity.bind(this);
  /**
  * Start tracking user activity
  */
  startTracking(): void {,
  if (this.isListening) return;
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  events.forEach(event => {)
  document.addEventListener(event, this.updateActivity, true);
});
    this.isListening = true;
  /**
   * Stop tracking user activity
   */
  stopTracking(): void {
    if (!this.isListening) return;
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {)
  document.removeEventListener(event, this.updateActivity, true);
    });
    this.isListening = false;
  /**
   * Update last activity timestamp
   */
  private updateActivity(): void {
  this.lastActivity = Date.now();
  this.activityListeners.forEach(listener => listener());
  /**
  * Get time since last activity
  */
  getTimeSinceLastActivity(): number {,
  return Date.now() - this.lastActivity;
  /**
  * Add activity listener
  */
  onActivity(listener: () => void): () => void {,
  this.activityListeners.push(listener);
  return () => {
  const index = this.activityListeners.indexOf(listener);
  if (index > -1) {
  this.activityListeners.splice(index, 1);
};
  /**
   * Reset activity tracking
   */
  reset(): void {
    this.lastActivity = Date.now();

// =============================================================================
// Authentication Middleware Component
// =============================================================================
/**
 * Authentication middleware props
 */
interface AuthenticationMiddlewareProps {
  children: React.ReactNode;
  config?: AuthMiddlewareConfig;
/**
 * Global authentication middleware component
 */
export const AuthenticationMiddleware: React.FC<AuthenticationMiddlewareProps> = ({)
  children,
  config = {}
}) => {
  const fullConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isAuthenticated,
    tokenExpiration,
    refreshTokens,
    logout,
    checkAuthStatus
  } = useAuthStore();
  // Refs for intervals and tracking
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const activityTrackerRef = useRef<SessionActivityTracker | null>(null);
  // Debug logging
  const log = useCallback((message: string, data?: unknown) => {
    if (fullConfig.debug) {
      console.log(`[AuthMiddleware] ${message}`, data);}
  }, [fullConfig.debug]);
  // Check if current route is public
  const isPublicRoute = useCallback((pathname: string): boolean => {
    return fullConfig.publicRoutes.some(route => {)
  if (route.includes('*')) {
        const pattern = route.replace('*', '.*');
        return new RegExp(`^${pattern}$`).test(pathname);}
      return pathname === route || pathname.startsWith(route);
    });
  }, [fullConfig.publicRoutes]);
  // Initialize activity tracker
  useEffect(() => {
    if (fullConfig.sessionMonitoring && !activityTrackerRef.current) {
      activityTrackerRef.current = new SessionActivityTracker();
      log('Activity tracker initialized');
    return () => {
      if (activityTrackerRef.current) {
        activityTrackerRef.current.stopTracking();
        activityTrackerRef.current = null;
    };
  }, [fullConfig.sessionMonitoring, log]);
  // Handle authentication state changes
  useEffect(() => {
  const isCurrentRoutePublic = isPublicRoute(location.pathname);
  if (isAuthenticated && !isCurrentRoutePublic) {
  // User is authenticated and on protected route - start monitoring
  log('Starting authentication monitoring', { )
  route: location.pathname,
  tokenExpiration
});
      // Start activity tracking
      if (fullConfig.sessionMonitoring && activityTrackerRef.current) {
        activityTrackerRef.current.startTracking();
        activityTrackerRef.current.reset();
      // Start token refresh monitoring
      if (fullConfig.autoRefresh) {
        startTokenRefreshMonitoring();
      // Start session timeout monitoring
      if (fullConfig.sessionMonitoring) {
        startSessionTimeoutMonitoring();
    } else if (!isAuthenticated && !isCurrentRoutePublic) {
      // User is not authenticated but trying to access protected route
      log('Unauthenticated access attempt', { route: location.pathname });
      // Try to restore authentication from stored tokens
      checkAuthStatus().then((restored) => {
        if (!restored) {
          log('Authentication restoration failed, redirecting to login');
          navigate('/login');
      });
    } else if (isAuthenticated && isCurrentRoutePublic) {
      // Authenticated user on public route - stop monitoring but don't logout
      log('Authenticated user on public route', { route: location.pathname });
      stopMonitoring();
    } else {
      // Unauthenticated user on public route - normal state
      log('Public route access', { route: location.pathname });
      stopMonitoring();
  }, [isAuthenticated, location.pathname, tokenExpiration, fullConfig, log, navigate, checkAuthStatus, isPublicRoute, startSessionTimeoutMonitoring, startTokenRefreshMonitoring, stopMonitoring]);
  /**
   * Start token refresh monitoring
   */
  const startTokenRefreshMonitoring = useCallback(() => {
  if (refreshIntervalRef.current) {
  clearInterval(refreshIntervalRef.current);
  refreshIntervalRef.current = setInterval(async () => {
  if (!tokenExpiration || !isAuthenticated) {
  return;
  const timeUntilExpiry = tokenExpiration - Date.now();
  log('Token refresh check', { )
  timeUntilExpiry,
  threshold: fullConfig.refreshThreshold,
});
      if (timeUntilExpiry <= fullConfig.refreshThreshold) {
        log('Token refresh triggered');
        try {
          const success = await refreshTokens();
          if (!success) {
            log('Token refresh failed, logging out');
            handleForceLogout('Token refresh failed');
          } else {
            log('Token refresh successful');
        } catch (error) {
          log('Token refresh error', error);
          handleForceLogout('Token refresh error');
    }, fullConfig.refreshInterval);
  }, [tokenExpiration, isAuthenticated, fullConfig, refreshTokens, log, handleForceLogout]);
  /**
   * Start session timeout monitoring
   */
  const startSessionTimeoutMonitoring = useCallback(() => {
  if (sessionCheckIntervalRef.current) {
  clearInterval(sessionCheckIntervalRef.current);
  if (!activityTrackerRef.current) {
  return;
  sessionCheckIntervalRef.current = setInterval(() => {
  if (!activityTrackerRef.current || !isAuthenticated) {
  return;
  const timeSinceActivity = activityTrackerRef.current.getTimeSinceLastActivity();
  log('Session timeout check', { )
  timeSinceActivity,
  timeout: fullConfig.sessionTimeout,
});
      if (timeSinceActivity >= fullConfig.sessionTimeout) {
        log('Session timeout triggered');
        handleForceLogout('Session timed out due to inactivity');
    }, 30000); // Check every 30 seconds
  }, [isAuthenticated, fullConfig, log, handleForceLogout]);
  /**
   * Stop all monitoring
   */
  const stopMonitoring = useCallback(() => {
    log('Stopping authentication monitoring');
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    if (sessionCheckIntervalRef.current) {
      clearInterval(sessionCheckIntervalRef.current);
      sessionCheckIntervalRef.current = null;
    if (activityTrackerRef.current) {
      activityTrackerRef.current.stopTracking();
  }, [log]);
  /**
   * Handle forced logout scenarios
   */
  const handleForceLogout = useCallback((reason: string) => {
    log('Forcing logout', { reason });
    // Clean up monitoring
    stopMonitoring();
    // Logout user
    logout();
    // Show notification to user
    if (reason.includes('timeout')) {
      // Could integrate with a toast/notification system here
      alert('Your session has expired due to inactivity. Please log in again.');
    } else if (reason.includes('refresh')) {
      alert('Your session has expired. Please log in again.');
    // Navigate to login
    navigate('/login');
  }, [log, stopMonitoring, logout, navigate]);
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);
  // Handle page visibility changes (tab switching, minimize, etc.)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        log('Page became hidden');
      } else {
        log('Page became visible');
        // Reset activity tracker when page becomes visible
        if (activityTrackerRef.current && isAuthenticated) {
          activityTrackerRef.current.reset();
        // Check authentication status when returning to page
        if (isAuthenticated && !isPublicRoute(location.pathname)) {
          checkAuthStatus();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, location.pathname, checkAuthStatus, isPublicRoute, log]);
  // Handle browser beforeunload (page refresh/close)
  useEffect(() => {
    const handleBeforeUnload = () => {
      log('Page unloading');
      stopMonitoring();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [stopMonitoring, log]);
  return <>{children}</>;
};

// =============================================================================
// Utility Hooks
// =============================================================================
/**
 * Hook to get authentication middleware status
 */
export function useAuthMiddlewareStatus(): {
  isMonitoring: boolean;,
  lastActivity: number;
  timeSinceLastActivity: number;
  const [lastActivity, setLastActivity] = React.useState(Date.now());
  const [isMonitoring, setIsMonitoring] = React.useState(false);
  const { isAuthenticated } = useAuthStore();
  React.useEffect(() => {
    setIsMonitoring(isAuthenticated);
    // Simple activity tracking for the hook
    const updateActivity = () => setLastActivity(Date.now());
    if (isAuthenticated) {
      const events = ['mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
      events.forEach(event => {)
  document.addEventListener(event, updateActivity, true);
      });
      return () => {
        events.forEach(event => {)
  document.removeEventListener(event, updateActivity, true);
        });
      };
  }, [isAuthenticated]);
  return {
  isMonitoring,
  lastActivity,
  timeSinceLastActivity: Date.now() - lastActivity,
};

export default AuthenticationMiddleware;