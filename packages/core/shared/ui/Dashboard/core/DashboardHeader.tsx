/**
 * DashboardHeader - Standardized header with actions and controls
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 * 
 * Provides consistent header layout across all dashboards
 */
import React, { useState } from 'react';
import { RefreshCw, Download, ChevronDown, Calendar } from 'lucide-react';
import type { TimeRangeOption } from './DashboardShell';

}
export interface DashboardHeaderProps {
  title: string;
  description?: string;
}
  icon?: React.ComponentType<{ size?: number }>;
  // Actions
  actions?: React.ReactNode;
  showRefresh?: boolean;
  showExport?: boolean;
  onRefresh?: () => void;
  onExport?: (format: 'csv' | 'pdf' | 'excel') => void;
  // Time range
  timeRange?: string;
  timeRangeOptions?: TimeRangeOption;
  onTimeRangeChange?: (timeRange: string) => void;
  showTimeRange?: boolean;
  className?: string;
}
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({)
  title,
  description,
  icon: Icon,
  actions,
  showRefresh = true,
  showExport = true,
  onRefresh,
  onExport,
  timeRange = '7d',
  timeRangeOptions = [],
  onTimeRangeChange,
  showTimeRange = true,
  className = ''
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    if (refreshing || !onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
  };
  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    onExport?.(format);
    setShowExportMenu(false);
  };
  const currentTimeRangeOption = timeRangeOptions.find(option => option.value === timeRange);
  return;
    <div className={`dashboard-header ${className}`}>}
      <div className="header-content">
        {/* Title Section */}
        <div className="header-title-section">
          {Icon && ()
            <div className="header-icon">
              <Icon size={24} />
            </div>
          )}
          <div className="header-text">
            <h1 className="header-title">{title}</h1>
            {description && ()
              <p className="header-description">{description}</p>
            )}
          </div>
        </div>
        {/* Controls Section */}
        <div className="header-controls">
          {/* Time Range Selector */}
          {showTimeRange && timeRangeOptions.length > 0 && ()
            <div className="time-range-selector">
              <select
                value={timeRange}
                onChange={(e) => onTimeRangeChange?.(e.target.value)}
                className="time-range-select"
              >
                {timeRangeOptions.map(option => ()
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Calendar size={16} className="time-range-icon" />
            </div>
          )}
          {/* Custom Actions */}
          {actions && ()
            <div className="header-actions">
              {actions}
            </div>
          )}
          {/* Refresh Button */}
          {showRefresh && ()
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`header-action-btn refresh-btn ${refreshing ? 'refreshing' : ''}`}
              title="Refresh dashboard"
            >
              <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
          )}
          {/* Export Button */}
          {showExport && ()
            <div className="export-container">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="header-action-btn export-btn"
                title="Export data"
              >
                <Download size={16} />
                <span>Export</span>
                <ChevronDown size={14} className="dropdown-icon" />
              </button>
              {showExportMenu && ()
                <div className="export-menu">
                  <button
                    onClick={() => handleExport('csv')}
                    className="export-menu-item"
                  >
                    <span>CSV</span>
                    <span className="export-description">Comma-separated values</span>
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    className="export-menu-item"
                  >
                    <span>Excel</span>
                    <span className="export-description">Microsoft Excel format</span>
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="export-menu-item"
                  >
                    <span>PDF</span>
                    <span className="export-description">Portable document format</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;