/**
 * Mobile navigation components
 */

import React, { useState } from 'react';
import { TOUCH_TARGETS, mobileStyles, MOBILE_SPACING, getSafeAreaPadding } from '../design-system';
import { cn } from '../../utils';
import { useDeviceDetection } from '../../responsive/utilities';

/**
 * Mobile hamburger menu
 */
export interface HamburgerMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  color?: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onToggle,
  color = 'currentColor',
  size = 24,
  className,
  style,
}) => {
  return (
    <button
      className={cn('hamburger-menu', isOpen && 'is-open', className)}
      onClick={onToggle}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      style={{
        width: TOUCH_TARGETS.preferred,
        height: TOUCH_TARGETS.preferred,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        ...mobileStyles.tapHighlight,
        ...style,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d={isOpen ? 'M6 6L18 18M6 18L18 6' : 'M3 12H21M3 6H21M3 18H21'}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: 'd 0.3s ease, opacity 0.3s ease',
          }}
        />
      </svg>
    </button>
  );
};

/**
 * Mobile bottom navigation
 */
export interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
}

export interface BottomNavigationProps {
  items: BottomNavItem[];
  activeId: string;
  onItemClick: (id: string) => void;
  showLabels?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items,
  activeId,
  onItemClick,
  showLabels = true,
  className,
  style,
}) => {
  const { isTouch } = useDeviceDetection();

  const handleItemClick = (id: string) => {
    if (isTouch && 'vibrate' in navigator) {
      navigator.vibrate(10); // Light haptic feedback
    }
    onItemClick(id);
  };

  return (
    <nav
      className={cn('bottom-navigation', className)}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        backgroundColor: 'var(--color-background)',
        borderTop: '1px solid var(--color-border)',
        paddingBottom: getSafeAreaPadding('bottom'),
        zIndex: 999,
        ...style,
      }}
    >
      {items.map(item => {
        const isActive = item.id === activeId;

        return (
          <button
            key={item.id}
            className={cn('bottom-nav-item', isActive && 'is-active')}
            onClick={() => handleItemClick(item.id)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: `${MOBILE_SPACING.sm}px ${MOBILE_SPACING.xs}px`,
              minHeight: TOUCH_TARGETS.large,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              transition: 'color 0.2s ease',
              position: 'relative',
              ...mobileStyles.tapHighlight,
              ...mobileStyles.noSelect,
            }}
          >
            <div className="bottom-nav-icon" style={{ position: 'relative' }}>
              {item.icon}
              {item.badge && (
                <span
                  className="bottom-nav-badge"
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -8,
                    minWidth: 16,
                    height: 16,
                    padding: '0 4px',
                    backgroundColor: 'var(--color-error)',
                    color: 'white',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>
            {showLabels && (
              <span
                className="bottom-nav-label"
                style={{
                  fontSize: 12,
                  marginTop: 4,
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {item.label}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

/**
 * Mobile header with navigation
 */
export interface MobileHeaderProps {
  title?: string;
  leftAction?: {
    icon: React.ReactNode;
    onClick: () => void;
    label: string;
  };
  rightActions?: Array<{
    icon: React.ReactNode;
    onClick: () => void;
    label: string;
  }>;
  transparent?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  leftAction,
  rightActions = [],
  transparent = false,
  className,
  style,
  children,
}) => {
  return (
    <header
      className={cn('mobile-header', transparent && 'transparent', className)}
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        minHeight: TOUCH_TARGETS.large,
        paddingTop: getSafeAreaPadding('top'),
        paddingLeft: MOBILE_SPACING.sm,
        paddingRight: MOBILE_SPACING.sm,
        backgroundColor: transparent ? 'transparent' : 'var(--color-background)',
        borderBottom: transparent ? 'none' : '1px solid var(--color-border)',
        zIndex: 998,
        ...style,
      }}
    >
      {leftAction && (
        <button
          className="mobile-header-action left"
          onClick={leftAction.onClick}
          aria-label={leftAction.label}
          style={{
            width: TOUCH_TARGETS.preferred,
            height: TOUCH_TARGETS.preferred,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginRight: MOBILE_SPACING.sm,
            ...mobileStyles.tapHighlight,
          }}
        >
          {leftAction.icon}
        </button>
      )}

      {title && (
        <h1
          className="mobile-header-title"
          style={{
            flex: 1,
            fontSize: 18,
            fontWeight: 600,
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </h1>
      )}

      {children && (
        <div className="mobile-header-content" style={{ flex: 1 }}>
          {children}
        </div>
      )}

      {rightActions.length > 0 && (
        <div className="mobile-header-actions right" style={{ display: 'flex', gap: 4 }}>
          {rightActions.map((action, index) => (
            <button
              key={index}
              className="mobile-header-action"
              onClick={action.onClick}
              aria-label={action.label}
              style={{
                width: TOUCH_TARGETS.preferred,
                height: TOUCH_TARGETS.preferred,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                ...mobileStyles.tapHighlight,
              }}
            >
              {action.icon}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

/**
 * Mobile slide-out menu
 */
export interface SlideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
  width?: number | string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const SlideMenu: React.FC<SlideMenuProps> = ({
  isOpen,
  onClose,
  position = 'left',
  width = '80%',
  className,
  style,
  children,
}) => {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="slide-menu-backdrop"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            opacity: isOpen ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      {/* Menu */}
      <div
        className={cn('slide-menu', `position-${position}`, isOpen && 'is-open', className)}
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          [position]: 0,
          width,
          maxWidth: '100vw',
          backgroundColor: 'var(--color-background)',
          transform: `translateX(${isOpen ? '0' : position === 'left' ? '-100%' : '100%'})`,
          transition: 'transform 0.3s ease',
          zIndex: 1001,
          overflowY: 'auto',
          ...mobileStyles.smoothScroll,
          ...style,
        }}
      >
        {children}
      </div>
    </>
  );
};
