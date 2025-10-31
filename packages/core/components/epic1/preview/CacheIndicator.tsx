/**
 * CacheIndicator - Shows cache status and statistics
 */

import React from 'react';
import './CacheIndicator.css';

export interface CacheIndicatorProps {
  cached: boolean;
  hitRate?: number;
  size?: number;
  maxSize?: number;
  className?: string;
}

export const CacheIndicator: React.FC<CacheIndicatorProps> = ({
  cached,
  hitRate = 0,
  size = 0,
  maxSize = 100,
  className = ''
}) => {
  const hitRatePercent = Math.round(hitRate * 100);
  const sizePercent = Math.round((size / maxSize) * 100);

  return (
    <div className={`cache-indicator ${className}`}>
      {cached && (
        <span className="cache-badge cached">
          ⚡ Cached
        </span>
      )}
      
      <div className="cache-stats">
        <div className="cache-stat" title={`Cache hit rate: ${hitRatePercent}%`}>
          <span className="cache-stat-label">Hit Rate:</span>
          <span className="cache-stat-value">{hitRatePercent}%</span>
        </div>
        
        <div className="cache-stat" title={`Cache size: ${size}/${maxSize} entries`}>
          <span className="cache-stat-label">Size:</span>
          <span className="cache-stat-value">{size}/{maxSize}</span>
          <div className="cache-size-bar">
            <div 
              className="cache-size-fill" 
              style={{ width: `${sizePercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};