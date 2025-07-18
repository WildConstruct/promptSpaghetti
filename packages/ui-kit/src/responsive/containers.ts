/**
 * Adaptive container components
 */

import React, { useState, useEffect } from 'react';
import { cn } from '../utils';
import { useResponsive } from '../hooks';
import { BreakpointKey } from './breakpoints';

export interface CollapsiblePanelProps {
  title: string;
  defaultOpen?: boolean;
  collapsible?: boolean;
  collapseOn?: BreakpointKey | BreakpointKey[];
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  children: React.ReactNode;
  onToggle?: (isOpen: boolean) => void;
}

/**
 * Collapsible panel that can auto-collapse on specific breakpoints
 */
export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  title,
  defaultOpen = true,
  collapsible = true,
  collapseOn,
  icon,
  actions,
  className,
  headerClassName,
  contentClassName,
  children,
  onToggle
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { breakpoint } = useResponsive();
  
  // Auto-collapse based on breakpoint
  useEffect(() => {
    if (collapseOn) {
      const breakpoints = Array.isArray(collapseOn) ? collapseOn : [collapseOn];
      const shouldCollapse = breakpoints.includes(breakpoint);
      setIsOpen(!shouldCollapse);
    }
  }, [breakpoint, collapseOn]);
  
  const handleToggle = () => {
    if (!collapsible) return;
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };
  
  return (
    <div className={cn('ui-collapsible-panel', className)}>
      <div
        className={cn(
          'ui-panel-header',
          collapsible && 'cursor-pointer',
          headerClassName
        )}
        onClick={handleToggle}
        role={collapsible ? 'button' : undefined}
        tabIndex={collapsible ? 0 : undefined}
        onKeyDown={(e) => {
          if (collapsible && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        <div className="flex items-center gap-2">
          {collapsible && (
            <span className="ui-collapse-icon">
              {isOpen ? '▼' : '▶'}
            </span>
          )}
          {icon && <span className="ui-panel-icon">{icon}</span>}
          <h3 className="ui-panel-title">{title}</h3>
        </div>
        {actions && (
          <div className="ui-panel-actions" onClick={(e) => e.stopPropagation()}>
            {actions}
          </div>
        )}
      </div>
      {isOpen && (
        <div className={cn('ui-panel-content', contentClassName)}>
          {children}
        </div>
      )}
    </div>
  );
};

export interface AdaptiveLayoutProps {
  sidebar?: React.ReactNode;
  sidebarPosition?: 'left' | 'right';
  sidebarWidth?: number | string;
  sidebarCollapsible?: boolean;
  sidebarCollapseOn?: BreakpointKey | BreakpointKey[];
  main: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Adaptive layout that adjusts based on viewport
 */
export const AdaptiveLayout: React.FC<AdaptiveLayoutProps> = ({
  sidebar,
  sidebarPosition = 'left',
  sidebarWidth = 280,
  sidebarCollapsible = true,
  sidebarCollapseOn = ['xs', 'sm'],
  main,
  header,
  footer,
  className
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { breakpoint } = useResponsive();
  
  // Auto-collapse sidebar on small screens
  useEffect(() => {
    if (sidebarCollapseOn) {
      const breakpoints = Array.isArray(sidebarCollapseOn) ? sidebarCollapseOn : [sidebarCollapseOn];
      const shouldCollapse = breakpoints.includes(breakpoint);
      setSidebarOpen(!shouldCollapse);
    }
  }, [breakpoint, sidebarCollapseOn]);
  
  return (
    <div className={cn('ui-adaptive-layout', className)}>
      {header && <div className="ui-layout-header">{header}</div>}
      
      <div className="ui-layout-body">
        {sidebar && sidebarOpen && (
          <aside
            className={cn(
              'ui-layout-sidebar',
              `ui-sidebar-${sidebarPosition}`
            )}
            style={{ width: sidebarWidth }}
          >
            {sidebar}
          </aside>
        )}
        
        <main className="ui-layout-main">
          {sidebarCollapsible && sidebar && !sidebarOpen && (
            <button
              className="ui-sidebar-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              ☰
            </button>
          )}
          {main}
        </main>
      </div>
      
      {footer && <div className="ui-layout-footer">{footer}</div>}
    </div>
  );
};

export interface ResponsiveDrawerProps {
  open: boolean;
  onClose: () => void;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
  variant?: 'temporary' | 'persistent' | 'permanent';
  breakpoint?: BreakpointKey;
  width?: number | string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Responsive drawer that adapts behavior based on screen size
 */
export const ResponsiveDrawer: React.FC<ResponsiveDrawerProps> = ({
  open,
  onClose,
  anchor = 'left',
  variant = 'temporary',
  breakpoint = 'md',
  width = 280,
  className,
  children
}) => {
  const { breakpoint: currentBreakpoint } = useResponsive();
  const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
  const isLargeScreen = breakpointOrder.indexOf(currentBreakpoint) >= breakpointOrder.indexOf(breakpoint);
  
  const actualVariant = isLargeScreen && variant === 'temporary' ? 'persistent' : variant;
  
  if (!open && actualVariant === 'temporary') {
    return null;
  }
  
  return (
    <>
      {actualVariant === 'temporary' && (
        <div
          className="ui-drawer-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      <div
        className={cn(
          'ui-drawer',
          `ui-drawer-${anchor}`,
          `ui-drawer-${actualVariant}`,
          open && 'ui-drawer-open',
          className
        )}
        style={{
          width: anchor === 'left' || anchor === 'right' ? width : '100%',
          height: anchor === 'top' || anchor === 'bottom' ? width : '100%'
        }}
      >
        {actualVariant === 'temporary' && (
          <button
            className="ui-drawer-close"
            onClick={onClose}
            aria-label="Close drawer"
          >
            ×
          </button>
        )}
        {children}
      </div>
    </>
  );
};

export interface TabsProps {
  tabs: Array<{
    id: string;
    label: string;
    content: React.ReactNode;
    icon?: React.ReactNode;
    disabled?: boolean;
  }>;
  defaultTab?: string;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline';
  stackOn?: BreakpointKey | BreakpointKey[];
  className?: string;
  onChange?: (tabId: string) => void;
}

/**
 * Responsive tabs that can stack on small screens
 */
export const ResponsiveTabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  orientation = 'horizontal',
  variant = 'default',
  stackOn = ['xs', 'sm'],
  className,
  onChange
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const { breakpoint } = useResponsive();
  
  const shouldStack = Array.isArray(stackOn) 
    ? stackOn.includes(breakpoint)
    : breakpoint === stackOn;
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };
  
  const actualOrientation = shouldStack ? 'vertical' : orientation;
  
  return (
    <div
      className={cn(
        'ui-tabs',
        `ui-tabs-${actualOrientation}`,
        `ui-tabs-${variant}`,
        className
      )}
    >
      <div className="ui-tabs-list" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              'ui-tab',
              activeTab === tab.id && 'ui-tab-active',
              tab.disabled && 'ui-tab-disabled'
            )}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            disabled={tab.disabled}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.icon && <span className="ui-tab-icon">{tab.icon}</span>}
            <span className="ui-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
      
      <div className="ui-tabs-panels">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`tabpanel-${tab.id}`}
            className={cn(
              'ui-tab-panel',
              activeTab === tab.id && 'ui-tab-panel-active'
            )}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            hidden={activeTab !== tab.id}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};