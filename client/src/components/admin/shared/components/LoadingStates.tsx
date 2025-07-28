/**
 * LoadingStates - Consistent loading, error, and empty state components
 * REFACTOR-002: Admin Dashboard Architecture Consolidation
 * 
 * Standardized components for various loading and feedback states
 */
import React from 'react';
import { Loader2, AlertCircle, Search, Database, Users } from 'lucide-react';

// ===== LOADING SPINNER =====
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({)
  size = 'medium',
  message = 'Loading...',
  className = ''
}) => {
  const sizeConfig = {
    small: { spinner: 16, fontSize: '12px', gap: '8px' },
    medium: { spinner: 24, fontSize: '14px', gap: '12px' },
    large: { spinner: 32, fontSize: '16px', gap: '16px' }
  };
  const config = sizeConfig[size];
  return ()
    <div
      className={`loading-spinner ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: config.gap,
        padding: '20px',
        color: '#6b7280',
      }}
    >
      <Loader2 
        size={config.spinner} 
        className="animate-spin"
        style={{ animation: 'spin 1s linear infinite' }}
      />
      <span style={{ fontSize: config.fontSize }}>{message}</span>
    </div>
  );
};

// ===== ERROR STATE =====
interface ErrorStateProps {
  error?: string | Error;
  title?: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({)
  error,
  title = 'Something went wrong',
  onRetry,
  retryText = 'Try Again',
  className = ''
}) => {
  const errorMessage = error instanceof Error ? error.message : error || 'An unexpected error occurred.';
  return ()
    <div
      className={`error-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        color: '#6b7280',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          backgroundColor: '#fef2f2',
          borderRadius: '50%',
          marginBottom: '16px',
        }}
      >
        <AlertCircle size={32} style={{ color: '#dc2626' }} />
      </div>
      <h3 style={{ 
        margin: '0 0 8px 0', 
        fontSize: '18px', 
        fontWeight: '600', 
        color: '#111827' ,
      }}>
        {title}
      </h3>
      <p style={{ 
        margin: '0 0 20px 0', 
        fontSize: '14px', 
        maxWidth: '400px' ,
      }}>
        {errorMessage}
      </p>
      {onRetry && ()
        <button
          onClick={onRetry}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6';
          }}
        >
          {retryText}
        </button>
      )}
    </div>
  );
};

// ===== EMPTY STATE =====
interface EmptyStateProps {
  icon?: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({)
  icon: Icon = Database,
  title = 'No data found',
  description = 'There are no items to display at this time.',
  action,
  className = ''
}) => {
  return ()
    <div
      className={`empty-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        color: '#6b7280',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '64px',
          height: '64px',
          backgroundColor: '#f3f4f6',
          borderRadius: '50%',
          marginBottom: '16px',
        }}
      >
        <Icon size={32} style={{ color: '#9ca3af' }} />
      </div>
      <h3 style={{ 
        margin: '0 0 8px 0', 
        fontSize: '18px', 
        fontWeight: '600', 
        color: '#111827' ,
      }}>
        {title}
      </h3>
      <p style={{ 
        margin: '0 0 20px 0', 
        fontSize: '14px', 
        maxWidth: '400px' ,
      }}>
        {description}
      </p>
      {action && ()
        <button
          onClick={action.onClick}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6';
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

// ===== EMPTY SEARCH STATE =====
interface EmptySearchStateProps {
  query?: string;
  onClearSearch?: () => void;
  className?: string;
}

export const EmptySearchState: React.FC<EmptySearchStateProps> = ({)
  query,
  onClearSearch,
  className = ''
}) => {
  return ()
    <EmptyState
      icon={Search}
      title="No search results"
      description={
        query 
          ? `No results found for "${query}". Try adjusting your search terms.`}
          : 'Try searching for something else.'
      }
      action={onClearSearch ? {
        label: 'Clear Search',
        onClick: onClearSearch,
      } : undefined}
      className={className}
    />
  );
};

// ===== EMPTY USERS STATE =====
export const EmptyUsersState: React.FC<{ onAddUser?: () => void; className?: string }> = ({)
  onAddUser,
  className = ''
}) => {
  return ()
    <EmptyState
      icon={Users}
      title="No users found"
      description="Users will appear here once they are added to the system."
      action={onAddUser ? {
        label: 'Add User',
        onClick: onAddUser,
      } : undefined}
      className={className}
    />
  );
};

// ===== LOADING OVERLAY =====
interface LoadingOverlayProps {
  message?: string;
  transparent?: boolean;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({)
  message = 'Loading...',
  transparent = false,
  className = ''
}) => {
  return ()
    <div
      className={`loading-overlay ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: transparent ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.95)',
        zIndex: 10,
      }}
    >
      <LoadingSpinner message={message} />
    </div>
  );
};

// Export all components
export default {
  LoadingSpinner,
  ErrorState,
  EmptyState,
  EmptySearchState,
  EmptyUsersState,
  LoadingOverlay
};