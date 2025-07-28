/**
 * DashboardShell - Universal dashboard layout wrapper
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 * 
 * Provides consistent structure and functionality across all dashboards
 */
import React, { useState } from 'react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardTabs } from './DashboardTabs';
import { DashboardProvider } from './DashboardProvider';
import { LoadingState, ErrorState } from '../states';
import './DashboardShell.css';

export interface TabConfig {
  id: string;
  label: string;
  content: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface TimeRangeOption {
  label: string;
  value: string;
  days?: number;
}

export interface DashboardShellProps {
  // Header configuration
  title: string;
  description?: string;
  icon?: React.ComponentType<{ size?: number }>;
  // Actions and controls
  actions?: React.ReactNode;
  showRefresh?: boolean;
  showExport?: boolean;
  onRefresh?: () => void;
  onExport?: (format: 'csv' | 'pdf' | 'excel') => void;
  // Time range filtering
  timeRange?: string;
  timeRangeOptions?: TimeRangeOption[];
  onTimeRangeChange?: (timeRange: string) => void;
  showTimeRange?: boolean;
  // Tab navigation
  tabs?: TabConfig[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  // Content and states
  children: React.ReactNode;
  loading?: boolean;
  error?: string | Error | null;
  // Layout options
  fullWidth?: boolean;
  maxWidth?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  // Customization
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}
const DEFAULT_TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { label: 'Last 24 hours', value: '24h', days: 1 },
  { label: 'Last 7 days', value: '7d', days: 7 },
  { label: 'Last 30 days', value: '30d', days: 30 },
  { label: 'Last 90 days', value: '90d', days: 90 }
];

export const DashboardShell: React.FC<DashboardShellProps> = ({)
  title,
  description,
  icon,
  actions,
  showRefresh = true,
  showExport = true,
  onRefresh,
  onExport,
  timeRange = '7d',
  timeRangeOptions = DEFAULT_TIME_RANGE_OPTIONS,
  onTimeRangeChange,
  showTimeRange = true,
  tabs,
  activeTab,
  onTabChange,
  children,
  loading = false,
  error = null,
  fullWidth = false,
  maxWidth,
  padding = 'medium',
  className = '',
  headerClassName = '',
  contentClassName = ''
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState()
    activeTab || tabs?.[0]?.id || ''
  );
  const currentActiveTab = activeTab || internalActiveTab;
  const handleTabChange = (tabId: string) => {
    setInternalActiveTab(tabId);
    onTabChange?.(tabId);
  };
  const handleRefresh = () => {
    onRefresh?.();
  };
  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    onExport?.(format);
  };
  const handleTimeRangeChange = (newTimeRange: string) => {
    onTimeRangeChange?.(newTimeRange);
  };
  // Get current tab content
  const currentTabContent = tabs?.find(tab => tab.id === currentActiveTab)?.content;
  // Determine padding class
  const paddingClass = {
    none: 'dashboard-padding-none',
    small: 'dashboard-padding-small', 
    medium: 'dashboard-padding-medium',
    large: 'dashboard-padding-large',
  }[padding];
  return ()
    <DashboardProvider
      timeRange={timeRange}
      onTimeRangeChange={handleTimeRangeChange}
      onRefresh={handleRefresh}
      onExport={handleExport}
    >
      <div 
        className={`dashboard-shell ${fullWidth ? 'full-width' : ''} ${className}`}
        style={{ maxWidth: fullWidth ? undefined : maxWidth }}
      >
        {/* Dashboard Header */}
        <DashboardHeader
          title={title}
          description={description}
          icon={icon}
          actions={actions}
          showRefresh={showRefresh}
          showExport={showExport}
          onRefresh={handleRefresh}
          onExport={handleExport}
          timeRange={timeRange}
          timeRangeOptions={timeRangeOptions}
          onTimeRangeChange={handleTimeRangeChange}
          showTimeRange={showTimeRange}
          className={headerClassName}
        />
        {/* Tab Navigation */}
        {tabs && tabs.length > 0 && ()
          <DashboardTabs
            tabs={tabs}
            activeTab={currentActiveTab}
            onTabChange={handleTabChange}
          />
        )}
        {/* Content Area */}
        <div className={`dashboard-content ${paddingClass} ${contentClassName}`}>}
          {/* Loading State */}
          {loading && ()
            <LoadingState 
              message="Loading dashboard data..."
              overlay={!!children}
            />
          )}
          {/* Error State */}
          {error && !loading && ()
            <ErrorState
              error={error}
              title="Failed to load dashboard"
              onRetry={onRefresh}
            />
          )}
          {/* Main Content */}
          {!loading && !error && ()
            <>
              {tabs ? currentTabContent : children}
            </>
          )}
        </div>
      </div>
    </DashboardProvider>
  );
};

export default DashboardShell;