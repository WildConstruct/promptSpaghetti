/**
 * Adaptive navigation patterns for different platforms
 */

import React, { useState, useRef, useEffect } from 'react';
import { deviceDetector } from '../responsive/device-detection';
import { useBreakpoint } from '../responsive/hooks';
import { IOSNavigationBar, IOSTabBar } from './ios/IOSAdaptations';
import { MaterialAppBar, MaterialBottomNav } from './android/AndroidAdaptations';
import { DesktopWindowControls } from './desktop/DesktopAdaptations';

/**
 * Navigation item definition
 */
export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  path?: string;
  badge?: number;
  children?: NavigationItem[];
}

/**
 * Adaptive navigation props
 */
export interface AdaptiveNavigationProps {
  title?: string;
  items: NavigationItem[];
  activeItem: string;
  onNavigate: (itemId: string) => void;
  onBack?: () => void;
  actions?: React.ReactNode[];
  showBackButton?: boolean;
  variant?: 'auto' | 'top' | 'bottom' | 'side' | 'rail';
}

/**
 * Main adaptive navigation component
 */
export const AdaptiveNavigation: React.FC<AdaptiveNavigationProps> = ({
  title,
  items,
  activeItem,
  onNavigate,
  onBack,
  actions,
  showBackButton = false,
  variant = 'auto'
}) => {
  const platform = deviceDetector.getPlatform();
  const os = deviceDetector.getOS();
  const breakpoint = useBreakpoint();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Determine navigation variant based on platform and screen size
  const getNavigationVariant = () => {
    if (variant !== 'auto') return variant;
    
    if (platform === 'mobile') {
      return 'bottom';
    }
    
    if (breakpoint === 'xs' || breakpoint === 'sm') {
      return 'bottom';
    }
    
    if (breakpoint === 'md') {
      return 'rail';
    }
    
    return 'side';
  };
  
  const navVariant = getNavigationVariant();
  
  // Mobile bottom navigation
  if (navVariant === 'bottom') {
    const bottomItems = items.slice(0, 5).map(item => ({
      id: item.id,
      label: item.label,
      icon: item.icon,
      activeIcon: item.activeIcon,
      badge: item.badge
    }));
    
    if (os === 'iOS') {
      return (
        <>
          {title && (
            <IOSNavigationBar
              title={title}
              leftItems={showBackButton && onBack ? [] : undefined}
              rightItems={actions}
              onBack={showBackButton ? onBack : undefined}
            />
          )}
          <IOSTabBar
            items={bottomItems}
            activeItem={activeItem}
            onItemSelect={onNavigate}
          />
        </>
      );
    }
    
    return (
      <>
        {title && (
          <MaterialAppBar
            title={title}
            navigationIcon={showBackButton && onBack ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
            ) : undefined}
            actions={actions}
            onNavigationClick={onBack}
          />
        )}
        <MaterialBottomNav
          items={bottomItems}
          activeItem={activeItem}
          onItemSelect={onNavigate}
        />
      </>
    );
  }
  
  // Desktop side navigation
  if (navVariant === 'side') {
    return (
      <div className="adaptive-navigation-side" style={{
        display: 'flex',
        height: '100vh'
      }}>
        <nav style={{
          width: isCollapsed ? '64px' : '280px',
          backgroundColor: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            {!isCollapsed && title && (
              <h2 style={{ margin: 0, fontSize: '20px' }}>{title}</h2>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d={isCollapsed ? 
                  'M7 4L13 10L7 16' : 
                  'M13 16L7 10L13 4'
                }/>
              </svg>
            </button>
          </div>
          
          {/* Navigation items */}
          <div style={{ flex: 1, padding: '8px' }}>
            {items.map(item => (
              <NavItem
                key={item.id}
                item={item}
                isActive={activeItem === item.id}
                isCollapsed={isCollapsed}
                onClick={() => onNavigate(item.id)}
              />
            ))}
          </div>
          
          {/* Actions */}
          {actions && (
            <div style={{
              padding: '16px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              gap: '8px',
              justifyContent: isCollapsed ? 'center' : 'flex-end'
            }}>
              {actions}
            </div>
          )}
        </nav>
      </div>
    );
  }
  
  // Navigation rail (narrow side nav)
  if (navVariant === 'rail') {
    return (
      <nav className="adaptive-navigation-rail" style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: '80px',
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px 0'
      }}>
        {items.slice(0, 7).map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              width: '56px',
              height: '56px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              backgroundColor: activeItem === item.id ? 'var(--color-primary-container)' : 'transparent',
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              margin: '4px 0',
              position: 'relative',
              color: activeItem === item.id ? 'var(--color-on-primary-container)' : 'var(--color-on-surface)'
            }}
          >
            <div style={{ fontSize: '24px' }}>
              {activeItem === item.id && item.activeIcon ? item.activeIcon : item.icon}
            </div>
            <span style={{ fontSize: '12px' }}>{item.label}</span>
            {item.badge && item.badge > 0 && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                backgroundColor: 'var(--color-error)',
                color: 'white',
                borderRadius: '10px',
                padding: '2px 6px',
                fontSize: '10px',
                minWidth: '16px'
              }}>
                {item.badge > 99 ? '99+' : item.badge}
              </div>
            )}
          </button>
        ))}
      </nav>
    );
  }
  
  // Top navigation (desktop)
  return (
    <nav className="adaptive-navigation-top" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '64px',
      backgroundColor: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      zIndex: 1000
    }}>
      {showBackButton && onBack && (
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
            marginRight: '16px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-primary)'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M15 18l-8-8 8-8"/>
          </svg>
          Back
        </button>
      )}
      
      {title && (
        <h1 style={{ margin: 0, fontSize: '20px', marginRight: 'auto' }}>{title}</h1>
      )}
      
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        {items.slice(0, 6).map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeItem === item.id ? '2px solid var(--color-primary)' : '2px solid transparent',
              cursor: 'pointer',
              color: activeItem === item.id ? 'var(--color-primary)' : 'var(--color-on-surface)',
              fontWeight: activeItem === item.id ? 600 : 400
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
      
      {actions && (
        <div style={{ display: 'flex', gap: '8px', marginLeft: '24px' }}>
          {actions}
        </div>
      )}
    </nav>
  );
};

/**
 * Navigation item component
 */
interface NavItemProps {
  item: NavigationItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ item, isActive, isCollapsed, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div>
      <button
        onClick={() => {
          if (item.children) {
            setIsExpanded(!isExpanded);
          } else {
            onClick();
          }
        }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          backgroundColor: isActive ? 'var(--color-primary-container)' : 'transparent',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          color: isActive ? 'var(--color-on-primary-container)' : 'var(--color-on-surface)',
          transition: 'all 0.2s ease',
          position: 'relative'
        }}
      >
        <div style={{ fontSize: '20px', width: '20px', flexShrink: 0 }}>
          {isActive && item.activeIcon ? item.activeIcon : item.icon}
        </div>
        
        {!isCollapsed && (
          <>
            <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
            
            {item.badge && item.badge > 0 && (
              <div style={{
                backgroundColor: 'var(--color-error)',
                color: 'white',
                borderRadius: '10px',
                padding: '2px 8px',
                fontSize: '12px',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {item.badge > 99 ? '99+' : item.badge}
              </div>
            )}
            
            {item.children && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                style={{
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <path d="M6 4L10 8L6 12"/>
              </svg>
            )}
          </>
        )}
      </button>
      
      {/* Nested items */}
      {!isCollapsed && item.children && isExpanded && (
        <div style={{ marginLeft: '32px', marginTop: '4px' }}>
          {item.children.map(child => (
            <NavItem
              key={child.id}
              item={child}
              isActive={isActive}
              isCollapsed={isCollapsed}
              onClick={onClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Breadcrumb navigation for desktop
 */
export interface BreadcrumbItem {
  id: string;
  label: string;
  path?: string;
}

export interface AdaptiveBreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (item: BreadcrumbItem) => void;
}

export const AdaptiveBreadcrumb: React.FC<AdaptiveBreadcrumbProps> = ({
  items,
  onNavigate
}) => {
  const platform = deviceDetector.getPlatform();
  
  if (platform === 'mobile') {
    // Mobile: Show only current and parent
    const current = items[items.length - 1];
    const parent = items.length > 1 ? items[items.length - 2] : null;
    
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        fontSize: '14px'
      }}>
        {parent && (
          <>
            <button
              onClick={() => onNavigate(parent)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              {parent.label}
            </button>
            <span style={{ color: 'var(--color-text-secondary)' }}>›</span>
          </>
        )}
        <span style={{ fontWeight: 600 }}>{current.label}</span>
      </div>
    );
  }
  
  // Desktop: Show full breadcrumb
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      fontSize: '14px'
    }}>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && (
            <span style={{ color: 'var(--color-text-secondary)' }}>›</span>
          )}
          {index < items.length - 1 ? (
            <button
              onClick={() => onNavigate(item)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                padding: '4px',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              {item.label}
            </button>
          ) : (
            <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};