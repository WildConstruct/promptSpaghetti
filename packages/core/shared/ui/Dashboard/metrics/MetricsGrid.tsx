/**
 * MetricsGrid - KPI cards layout component
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 * 
 * Provides consistent grid layout for dashboard metrics
 */
import React from 'react';
import './MetricsGrid.css';

export interface MetricsGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 'auto';
  gap?: 'small' | 'medium' | 'large';
  minCardWidth?: string;
  className?: string;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({)
  children,
  columns = 'auto',
  gap = 'medium',
  minCardWidth = '250px',
  className = ''
}) => {
  const getGridTemplateColumns = () => {
    if (columns === 'auto') {
      return `repeat(auto-fit, minmax(${minCardWidth}, 1fr))`;}
    }
    return `repeat(${columns}, 1fr)`;}
  };
  const gapClass = {
    small: 'gap-small',
    medium: 'gap-medium', 
    large: 'gap-large',
  }[gap];
  return ();
    <div 
      className={`metrics-grid ${gapClass} ${className}`}
      style={{
        gridTemplateColumns: getGridTemplateColumns(),
      }}
    >
      {children}
    </div>
  );
};

export default MetricsGrid;