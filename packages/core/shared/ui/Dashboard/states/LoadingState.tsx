/**
 * LoadingState - Consistent loading indicators for dashboards
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 * 
 * Provides standardized loading states with optional overlay
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import './LoadingState.css';

export interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  overlay?: boolean;
  showSpinner?: boolean;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'medium',
  overlay = false,
  showSpinner = true,
  className = ''
}) => {
  const sizeConfig = {
    small: { spinner: 16, fontSize: '14px', padding: '16px' },
    medium: { spinner: 24, fontSize: '16px', padding: '24px' },
    large: { spinner: 32, fontSize: '18px', padding: '32px' }
  };

  const config = sizeConfig[size];

  const content = (
    <div 
      className={`loading-state ${overlay ? 'overlay' : ''} ${className}`}
      style={{ padding: config.padding }}
    >
      <div className="loading-content">
        {showSpinner && (
          <Loader2 
            size={config.spinner} 
            className="loading-spinner"
          />
        )}
        <span 
          className="loading-message"
          style={{ fontSize: config.fontSize }}
        >
          {message}
        </span>
      </div>
    </div>
  );

  return overlay ? (
    <div className="loading-overlay">
      {content}
    </div>
  ) : content;
};

export default LoadingState;