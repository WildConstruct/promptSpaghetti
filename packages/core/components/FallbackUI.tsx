/**
 * Frontend Fallback UI Components
 * Provides graceful degradation when new features fail
 */

import React, { Component, ErrorInfo, ReactNode, useState, useEffect } from 'react';
import { useFeatureFlag } from '../safety/FeatureFlagManager';
import { monitoring } from '../monitoring/MonitoringService';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  fallbackLevel: 'component' | 'feature' | 'page';
}

/**
 * Enhanced error boundary with fallback UI
 */
export class FallbackErrorBoundary extends Component<
  {
    children: ReactNode;
    fallbackLevel?: 'component' | 'feature' | 'page';
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
  },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
      fallbackLevel: props.fallbackLevel || 'component',
    };
  }
  
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Report to monitoring
    monitoring.recordMetric('ui.error', 1, {
      component: errorInfo.componentStack?.split('\n')[0] || 'unknown',
      level: this.state.fallbackLevel,
    });
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo);
    
    this.setState({ errorInfo });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <FallbackUI
          level={this.state.fallbackLevel}
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }
    
    return this.props.children;
  }
}

/**
 * Fallback UI component
 */
const FallbackUI: React.FC<{
  level: 'component' | 'feature' | 'page';
  error?: Error;
  onRetry: () => void;
}> = ({ level, error, onRetry }) => {
  const styles: React.CSSProperties = {
    padding: '20px',
    margin: '20px',
    border: '1px solid #ff6b6b',
    borderRadius: '8px',
    backgroundColor: '#ffe0e0',
    textAlign: 'center',
  };
  
  switch (level) {
    case 'component':
      return (
        <div style={styles}>
          <h3>Component Error</h3>
          <p>This component encountered an error and cannot be displayed.</p>
          <button onClick={onRetry} style={{ marginTop: '10px' }}>
            Try Again
          </button>
        </div>
      );
      
    case 'feature':
      return (
        <div style={styles}>
          <h2>Feature Unavailable</h2>
          <p>This feature is temporarily unavailable. We've switched to a simplified version.</p>
          <p style={{ fontSize: '12px', color: '#666' }}>
            Error: {error?.message}
          </p>
          <button onClick={onRetry} style={{ marginTop: '10px' }}>
            Retry Feature
          </button>
        </div>
      );
      
    case 'page':
      return (
        <div style={{ ...styles, margin: '50px auto', maxWidth: '600px' }}>
          <h1>Page Error</h1>
          <p>We're having trouble loading this page. Please try refreshing.</p>
          <div style={{ marginTop: '20px' }}>
            <button onClick={() => window.location.reload()}>
              Refresh Page
            </button>
            <button onClick={onRetry} style={{ marginLeft: '10px' }}>
              Try Again
            </button>
          </div>
        </div>
      );
  }
};

/**
 * Feature-specific fallback wrapper
 */
export const FeatureFallback: React.FC<{
  feature: string;
  children: ReactNode;
  fallback: ReactNode;
  errorFallback?: ReactNode;
}> = ({ feature, children, fallback, errorFallback }) => {
  const isEnabled = useFeatureFlag(feature);
  const [hasError, setHasError] = useState(false);
  
  if (!isEnabled) {
    return <>{fallback}</>;
  }
  
  if (hasError && errorFallback) {
    return <>{errorFallback}</>;
  }
  
  return (
    <FallbackErrorBoundary
      fallbackLevel="feature"
      onError={() => setHasError(true)}
    >
      {children}
    </FallbackErrorBoundary>
  );
};

/**
 * Progressive enhancement wrapper
 */
export const ProgressiveEnhancement: React.FC<{
  basic: ReactNode;
  enhanced: ReactNode;
  checkSupport: () => boolean;
}> = ({ basic, enhanced, checkSupport }) => {
  const [supportsEnhanced, setSupportsEnhanced] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check browser capabilities
    try {
      const supported = checkSupport();
      setSupportsEnhanced(supported);
    } catch (error) {
      console.warn('Enhancement check failed:', error);
      setSupportsEnhanced(false);
    }
    setLoading(false);
  }, [checkSupport]);
  
  if (loading) {
    return <>{basic}</>;
  }
  
  return supportsEnhanced ? (
    <FallbackErrorBoundary fallbackLevel="component">
      {enhanced}
    </FallbackErrorBoundary>
  ) : (
    <>{basic}</>
  );
};

/**
 * Network fallback component
 */
export const NetworkFallback: React.FC<{
  children: ReactNode;
  offlineContent?: ReactNode;
}> = ({ children, offlineContent }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (!isOnline) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        backgroundColor: '#f0f0f0',
      }}>
        {offlineContent || (
          <>
            <h2>You're Offline</h2>
            <p>Please check your internet connection and try again.</p>
          </>
        )}
      </div>
    );
  }
  
  return <>{children}</>;
};

/**
 * Lazy loading with fallback
 */
export const LazyLoadFallback: React.FC<{
  load: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  props?: any;
}> = ({ load, fallback, errorFallback, props = {} }) => {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    load()
      .then(module => {
        setComponent(() => module.default);
        setLoading(false);
      })
      .catch(err => {
        console.error('Lazy load failed:', err);
        setError(err);
        setLoading(false);
      });
  }, [load]);
  
  if (loading) {
    return <>{fallback || <div>Loading...</div>}</>;
  }
  
  if (error || !Component) {
    return <>{errorFallback || <div>Failed to load component</div>}</>;
  }
  
  return (
    <FallbackErrorBoundary fallbackLevel="component">
      <Component {...props} />
    </FallbackErrorBoundary>
  );
};

/**
 * Graceful degradation for inline editing
 */
export const InlineEditingFallback: React.FC<{
  nodeId: string;
  value: any;
  onChange: (value: any) => void;
}> = ({ nodeId, value, onChange }) => {
  const supportsInlineEditing = useFeatureFlag('epic1-inline-editing');
  
  if (!supportsInlineEditing) {
    // Fallback to simple form
    return (
      <div className="fallback-editor">
        <label htmlFor={`node-${nodeId}`}>Node Value:</label>
        <input
          id={`node-${nodeId}`}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '4px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </div>
    );
  }
  
  // Return null - actual inline editing component will be rendered
  return null;
};

/**
 * Performance fallback
 */
export const PerformanceFallback: React.FC<{
  children: ReactNode;
  fallback: ReactNode;
  threshold?: number; // milliseconds
}> = ({ children, fallback, threshold = 100 }) => {
  const [shouldUseFallback, setShouldUseFallback] = useState(false);
  
  useEffect(() => {
    const startTime = performance.now();
    
    // Use requestIdleCallback if available
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        const renderTime = performance.now() - startTime;
        if (renderTime > threshold) {
          setShouldUseFallback(true);
          monitoring.recordMetric('ui.performance.fallback', 1, {
            renderTime: renderTime.toString(),
          });
        }
      });
    }
  }, [threshold]);
  
  return shouldUseFallback ? <>{fallback}</> : <>{children}</>;
};

/**
 * Rollback status indicator
 */
export const RollbackStatusIndicator: React.FC = () => {
  const [rollbackActive, setRollbackActive] = useState(false);
  
  useEffect(() => {
    // Check if any rollback is active
    const checkRollbackStatus = () => {
      // This would check actual rollback status
      const isActive = localStorage.getItem('rollback_active') === 'true';
      setRollbackActive(isActive);
    };
    
    checkRollbackStatus();
    const interval = setInterval(checkRollbackStatus, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!rollbackActive) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#ff6b6b',
      color: 'white',
      padding: '10px',
      textAlign: 'center',
      zIndex: 9999,
    }}>
      ⚠️ System is operating in rollback mode. Some features may be limited.
    </div>
  );
};