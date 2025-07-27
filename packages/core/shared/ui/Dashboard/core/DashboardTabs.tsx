/**
 * DashboardTabs - Consistent tab navigation for dashboards
 * REFACTOR-003: Dashboard Component Architecture Consolidation
 * 
 * Provides standardized tab navigation with badges and states
 */

import React from 'react';
import type { TabConfig } from './DashboardShell';

export interface DashboardTabsProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}) => {
  const handleTabClick = (tabId: string, disabled?: boolean) => {
    if (!disabled) {
      onTabChange(tabId);
    }
  };

  return (
    <div className={`dashboard-tabs ${className}`}>
      <div className="tabs-container">
        <div className="tabs-list" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              disabled={tab.disabled}
              className={`
                tab-trigger 
                ${activeTab === tab.id ? 'active' : ''} 
                ${tab.disabled ? 'disabled' : ''}
              `}
              onClick={() => handleTabClick(tab.id, tab.disabled)}
            >
              <span className="tab-label">{tab.label}</span>
              {tab.badge && (
                <span className="tab-badge">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        
        {/* Active tab indicator */}
        <div className="tab-indicator" />
      </div>
    </div>
  );
};

export default DashboardTabs;