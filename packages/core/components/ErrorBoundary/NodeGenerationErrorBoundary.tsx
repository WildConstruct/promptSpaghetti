/**
 * Node Generation Error Boundary
 * Epic 36.3: Node Generation and Canvas Integration
 * 
 * Comprehensive error boundary for node generation operations with graceful
 * error handling, user-friendly fallback UI, and production monitoring
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

export interface NodeGenerationErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  theme?: 'light' | 'dark' | 'cinema';
}

export interface NodeGenerationErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

/**
 * Error boundary component for node generation operations
 */
export class NodeGenerationErrorBoundary extends Component<
  NodeGenerationErrorBoundaryProps,
  NodeGenerationErrorBoundaryState
> {
  private maxRetries = 3;
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: NodeGenerationErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): NodeGenerationErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
      retryCount: 0
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Node generation error caught by boundary:', error, errorInfo);
    
    this.setState(prevState => ({
      ...prevState,
      errorInfo
    }));

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.logToMonitoringService(error, errorInfo);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private logToMonitoringService(error: Error, errorInfo: ErrorInfo) {
    // In a real application, this would send to a monitoring service like Sentry
    console.warn('Production error in node generation:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }

  private handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      console.warn('Maximum retry attempts reached for node generation');
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));

    // Add a small delay before retry to allow any transient issues to resolve
    this.retryTimeoutId = setTimeout(() => {
      // Force re-render to retry the operation
      this.forceUpdate();
    }, 1000);
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
  };

  private getThemeStyles = () => {
    const theme = this.props.theme || 'cinema';
    const themes = {
      light: {
        background: '#ffffff',
        secondary: '#f8fafc',
        border: '#e5e7eb',
        text: '#374151',
        textSecondary: '#6b7280',
        accent: '#3b82f6',
        error: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981'
      },
      dark: {
        background: '#1f2937',
        secondary: '#111827',
        border: '#4b5563',
        text: '#f9fafb',
        textSecondary: '#9ca3af',
        accent: '#60a5fa',
        error: '#f87171',
        warning: '#fbbf24',
        success: '#34d399'
      },
      cinema: {
        background: '#1a1a1a',
        secondary: '#0d1117',
        border: '#ff7c00',
        text: '#ffffff',
        textSecondary: '#a0a0a0',
        accent: '#ff7c00',
        error: '#ff4444',
        warning: '#ffaa00',
        success: '#00ff88'
      }
    };
    return themes[theme];
  };

  private renderErrorDetails = (error: Error, errorInfo: ErrorInfo | null) => {
    const styles = this.getThemeStyles();
    
    if (process.env.NODE_ENV !== 'development') {
      return null;
    }

    return (
      <details style={{
        marginTop: '16px',
        padding: '12px',
        background: styles.secondary,
        border: `1px solid ${styles.border}`,
        borderRadius: '6px',
        fontSize: '12px',
        color: styles.textSecondary,
        fontFamily: 'Monaco, monospace'
      }}>
        <summary style={{
          cursor: 'pointer',
          fontWeight: 600,
          marginBottom: '8px',
          color: styles.text
        }}>
          Error Details (Development Only)
        </summary>
        <div style={{ whiteSpace: 'pre-wrap', maxHeight: '200px', overflow: 'auto' }}>
          <strong>Error:</strong> {error.message}
          {error.stack && (
            <>
              <br /><br />
              <strong>Stack Trace:</strong>
              <br />
              {error.stack}
            </>
          )}
          {errorInfo?.componentStack && (
            <>
              <br /><br />
              <strong>Component Stack:</strong>
              <br />
              {errorInfo.componentStack}
            </>
          )}
        </div>
      </details>
    );
  };

  private renderDefaultFallback = (error: Error) => {
    const styles = this.getThemeStyles();
    const canRetry = this.state.retryCount < this.maxRetries;

    return (
      <div style={{
        padding: '32px',
        textAlign: 'center',
        background: styles.background,
        border: `1px solid ${styles.error}`,
        borderRadius: '12px',
        margin: '16px',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        {/* Error Icon */}
        <div style={{
          fontSize: '48px',
          marginBottom: '16px'
        }}>
          ⚠️
        </div>

        {/* Error Title */}
        <h2 style={{
          margin: '0 0 8px 0',
          fontSize: '20px',
          fontWeight: 600,
          color: styles.error
        }}>
          Node Generation Failed
        </h2>

        {/* Error Message */}
        <p style={{
          margin: '0 0 24px 0',
          color: styles.textSecondary,
          lineHeight: 1.5
        }}>
          We encountered an error while generating your nodes. This could be due to:
        </p>

        {/* Common Causes */}
        <ul style={{
          textAlign: 'left',
          margin: '0 0 24px 0',
          padding: '0 0 0 20px',
          color: styles.textSecondary,
          fontSize: '14px',
          lineHeight: 1.6
        }}>
          <li>Invalid suggestion data or analysis results</li>
          <li>Network connectivity issues</li>
          <li>Temporary system overload</li>
          <li>Browser compatibility issues</li>
          <li>Insufficient system resources</li>
        </ul>

        {/* Suggestions */}
        <div style={{
          background: styles.secondary,
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            fontWeight: 600,
            color: styles.text
          }}>
            Suggested Solutions:
          </h3>
          <ul style={{
            margin: 0,
            padding: '0 0 0 16px',
            fontSize: '13px',
            color: styles.textSecondary,
            lineHeight: 1.5
          }}>
            <li>Try reducing the number of selected suggestions</li>
            <li>Check your internet connection</li>
            <li>Refresh the page and try again</li>
            <li>Clear your browser cache</li>
            <li>Try a different browser if the issue persists</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {canRetry && (
            <button
              onClick={this.handleRetry}
              style={{
                padding: '12px 24px',
                background: styles.accent,
                border: 'none',
                borderRadius: '6px',
                color: styles.background,
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🔄 Retry ({this.maxRetries - this.state.retryCount} attempts left)
            </button>
          )}
          
          <button
            onClick={this.handleReset}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: `1px solid ${styles.border}`,
              borderRadius: '6px',
              color: styles.text,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🔄 Reset
          </button>
          
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: `1px solid ${styles.warning}`,
              borderRadius: '6px',
              color: styles.warning,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🔄 Reload Page
          </button>
        </div>

        {/* Retry Information */}
        {this.state.retryCount > 0 && (
          <div style={{
            marginTop: '16px',
            padding: '8px 12px',
            background: styles.warning + '20',
            border: `1px solid ${styles.warning}`,
            borderRadius: '6px',
            fontSize: '12px',
            color: styles.warning
          }}>
            ⚠️ Retry attempt {this.state.retryCount} of {this.maxRetries}
          </div>
        )}

        {/* No More Retries */}
        {!canRetry && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: styles.error + '20',
            border: `1px solid ${styles.error}`,
            borderRadius: '6px',
            fontSize: '13px',
            color: styles.error
          }}>
            <strong>Maximum retry attempts reached.</strong>
            <br />
            Please refresh the page or contact support if the issue persists.
          </div>
        )}

        {/* Error Details for Development */}
        {this.renderErrorDetails(error, this.state.errorInfo)}
      </div>
    );
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided, otherwise use default
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }
      
      return this.renderDefaultFallback(this.state.error);
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for wrapping components with node generation error boundary
 */
export function withNodeGenerationErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<NodeGenerationErrorBoundaryProps, 'children'>
) {
  const WithErrorBoundaryComponent = (props: P) => (
    <NodeGenerationErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </NodeGenerationErrorBoundary>
  );

  WithErrorBoundaryComponent.displayName = 
    `withNodeGenerationErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
}

/**
 * Hook for programmatically triggering error boundaries in functional components
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    // This would typically integrate with error reporting services
    console.error('Error handled programmatically:', error, errorInfo);
    
    if (process.env.NODE_ENV === 'production') {
      // Log to monitoring service
      console.warn('Production error reported:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
    
    // Re-throw to trigger error boundary
    throw error;
  };
}

export default NodeGenerationErrorBoundary;