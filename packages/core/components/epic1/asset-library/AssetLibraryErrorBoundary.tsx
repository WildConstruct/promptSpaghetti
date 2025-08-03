/**
 * Error Boundary for Asset Library
 * Catches and handles errors gracefully to prevent app crashes
 */

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AssetLibraryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    console.error('[AssetLibraryErrorBoundary] Caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to console for debugging
    console.error('[AssetLibraryErrorBoundary] Error details:', {
      error,
      errorInfo,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when error occurs
      return (
        this.props.fallback || (
          <div className="asset-library-error" style={{
            padding: '20px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            margin: '10px'
          }}>
            <h3 style={{ color: '#dc3545', marginBottom: '10px' }}>
              📚 Asset Browser Error
            </h3>
            <p style={{ color: '#6c757d', marginBottom: '15px' }}>
              The asset browser encountered an error and couldn't load properly.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ marginTop: '15px' }}>
                <summary style={{ cursor: 'pointer', color: '#6c757d' }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{
                  marginTop: '10px',
                  padding: '10px',
                  backgroundColor: '#f1f3f4',
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto'
                }}>
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default AssetLibraryErrorBoundary;