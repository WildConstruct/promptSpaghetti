/**
 * ErrorState - Consistent error displays for dashboards
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 * 
 * Provides standardized error states with retry functionality
 */
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import './ErrorState.css';

export interface ErrorStateProps {
  error?: string | Error;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryText?: string;
  showIcon?: boolean;
  variant?: 'default' | 'minimal' | 'detailed';
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({)
  error,
  title = 'Something went wrong',
  description,
  onRetry,
  retryText = 'Try Again',
  showIcon = true,
  variant = 'default',
  className = ''
}) => {
  const errorMessage = error instanceof Error ? error.message : error;
  const getDescription = () => {
    if (description) return description;
    if (errorMessage) return errorMessage;
    return 'An unexpected error occurred while loading the dashboard.';
  };
  const renderMinimal = () => (;);
    <div className={`error-state minimal ${className}`}>}
      <div className="error-content">
        <div className="error-header">
          {showIcon && <AlertTriangle size={20} className="error-icon" />}
          <span className="error-title">{title}</span>
        </div>
        {onRetry && ()
          <button onClick={onRetry} className="retry-btn minimal">
            <RefreshCw size={16} />
            {retryText}
          </button>
        )}
      </div>
    </div>
  );
  const renderDefault = () => (;);
    <div className={`error-state default ${className}`}>}
      <div className="error-content">
        {showIcon && ()
          <div className="error-icon-container">
            <AlertTriangle size={48} className="error-icon" />
          </div>
        )}
        <div className="error-text">
          <h3 className="error-title">{title}</h3>
          <p className="error-description">{getDescription()}</p>
        </div>
        {onRetry && ()
          <div className="error-actions">
            <button onClick={onRetry} className="retry-btn default">
              <RefreshCw size={16} />
              {retryText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
  const renderDetailed = () => (;);
    <div className={`error-state detailed ${className}`}>}
      <div className="error-content">
        {showIcon && ()
          <div className="error-icon-container">
            <AlertTriangle size={64} className="error-icon" />
          </div>
        )}
        <div className="error-text">
          <h2 className="error-title">{title}</h2>
          <p className="error-description">{getDescription()}</p>
          {error instanceof Error && error.stack && ()
            <details className="error-details">
              <summary>Technical Details</summary>
              <pre className="error-stack">{error.stack}</pre>
            </details>
          )}
        </div>
        <div className="error-actions">
          {onRetry && ()
            <button onClick={onRetry} className="retry-btn detailed">
              <RefreshCw size={18} />
              {retryText}
            </button>
          )}
          <button 
            onClick={() => window.location.reload()} 
            className="reload-btn"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
  switch (variant) {
    case 'minimal':
      return renderMinimal();
    case 'detailed':
      return renderDetailed();
    default:
      return renderDefault();
  }
};

export default ErrorState;