/**
 * Android Material Design adaptations and components
 */

import React, { useState, useEffect, useRef } from 'react';
import { deviceDetector } from '../../responsive/device-detection';
import { HapticFeedback } from '../../touch/feedback';

/**
 * Material Design 3 elevation system
 */
export const materialElevation = {
  level0: 'none',
  level1: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  level2: '0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  level3: '0 4px 8px 0 rgba(0, 0, 0, 0.08)',
  level4: '0 6px 12px 0 rgba(0, 0, 0, 0.10)',
  level5: '0 8px 16px 0 rgba(0, 0, 0, 0.12)',
};

/**
 * Material Design 3 motion
 */
export const materialMotion = {
  emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
  emphasizedAccelerate: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  standardDecelerate: 'cubic-bezier(0, 0, 0, 1)',
  standardAccelerate: 'cubic-bezier(0.3, 0, 1, 1)',
  duration: {
    short1: 50,
    short2: 100,
    short3: 150,
    short4: 200,
    medium1: 250,
    medium2: 300,
    medium3: 350,
    medium4: 400,
    long1: 450,
    long2: 500,
    long3: 550,
    long4: 600,
  },
};

/**
 * Material You dynamic color system
 */
export interface MaterialColorScheme {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  shadow: string;
  scrim: string;
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
}

/**
 * Material Design app bar
 */
export interface MaterialAppBarProps {
  title?: string;
  type?: 'center' | 'small' | 'medium' | 'large';
  navigationIcon?: React.ReactNode;
  actions?: React.ReactNode[];
  scrolled?: boolean;
  onNavigationClick?: () => void;
}

export const MaterialAppBar: React.FC<MaterialAppBarProps> = ({
  title,
  type = 'small',
  navigationIcon,
  actions,
  scrolled = false,
  onNavigationClick,
}) => {
  const [elevation, setElevation] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setElevation(window.scrollY > 0 ? 2 : 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getHeight = () => {
    switch (type) {
      case 'center':
        return 64;
      case 'small':
        return 64;
      case 'medium':
        return scrolled ? 64 : 112;
      case 'large':
        return scrolled ? 64 : 152;
      default:
        return 64;
    }
  };

  return (
    <header
      className={`material-app-bar ${type}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: getHeight(),
        backgroundColor: 'var(--md-sys-color-surface)',
        boxShadow: elevation > 0 ? materialElevation.level2 : 'none',
        transition: `all ${materialMotion.duration.medium2}ms ${materialMotion.emphasized}`,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 64,
          padding: '0 4px',
        }}
      >
        {navigationIcon && (
          <button
            onClick={onNavigationClick}
            className="material-icon-button"
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--md-sys-color-on-surface)',
            }}
          >
            {navigationIcon}
          </button>
        )}

        <h1
          style={{
            flex: 1,
            fontSize: type === 'large' && !scrolled ? '28px' : '22px',
            fontWeight: 400,
            margin: 0,
            padding: '0 16px',
            textAlign: type === 'center' ? 'center' : 'left',
            transition: `font-size ${materialMotion.duration.medium2}ms ${materialMotion.emphasized}`,
            color: 'var(--md-sys-color-on-surface)',
          }}
        >
          {title}
        </h1>

        {actions && <div style={{ display: 'flex', gap: '4px' }}>{actions}</div>}
      </div>
    </header>
  );
};

/**
 * Material Design bottom navigation
 */
export interface MaterialBottomNavProps {
  items: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    activeIcon?: React.ReactNode;
    badge?: number;
  }>;
  activeItem: string;
  onItemSelect: (id: string) => void;
}

export const MaterialBottomNav: React.FC<MaterialBottomNavProps> = ({ items, activeItem, onItemSelect }) => {
  return (
    <nav
      className="material-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: 'var(--md-sys-color-surface-container)',
        boxShadow: materialElevation.level2,
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
      }}
    >
      {items.map(item => {
        const isActive = activeItem === item.id;

        return (
          <button
            key={item.id}
            onClick={() => {
              onItemSelect(item.id);
              HapticFeedback.getInstance().trigger('selection');
            }}
            className={`nav-item ${isActive ? 'active' : ''}`}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              color: isActive ? 'var(--md-sys-color-on-secondary-container)' : 'var(--md-sys-color-on-surface-variant)',
              transition: `all ${materialMotion.duration.short4}ms ${materialMotion.standard}`,
            }}
          >
            <div
              className="nav-indicator"
              style={{
                position: 'absolute',
                top: '12px',
                width: isActive ? '64px' : '0',
                height: '32px',
                borderRadius: '16px',
                backgroundColor: 'var(--md-sys-color-secondary-container)',
                transition: `width ${materialMotion.duration.medium1}ms ${materialMotion.emphasized}`,
                opacity: isActive ? 1 : 0,
              }}
            />

            <div
              style={{
                position: 'relative',
                fontSize: '24px',
                transition: `transform ${materialMotion.duration.short4}ms ${materialMotion.standard}`,
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
              }}
            >
              {isActive && item.activeIcon ? item.activeIcon : item.icon}
            </div>

            <span
              style={{
                fontSize: '12px',
                fontWeight: isActive ? 500 : 400,
                position: 'relative',
              }}
            >
              {item.label}
            </span>

            {item.badge && item.badge > 0 && (
              <div
                className="badge"
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: 'calc(50% - 20px)',
                  backgroundColor: 'var(--md-sys-color-error)',
                  color: 'var(--md-sys-color-on-error)',
                  borderRadius: '8px',
                  padding: '2px 6px',
                  fontSize: '11px',
                  minWidth: '16px',
                  textAlign: 'center',
                  fontWeight: 500,
                }}
              >
                {item.badge > 99 ? '99+' : item.badge}
              </div>
            )}
          </button>
        );
      })}
    </nav>
  );
};

/**
 * Material Design FAB (Floating Action Button)
 */
export interface MaterialFABProps {
  icon: React.ReactNode;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  extended?: boolean;
  position?: { bottom: number; right: number };
  onClick?: () => void;
}

export const MaterialFAB: React.FC<MaterialFABProps> = ({
  icon,
  label,
  size = 'medium',
  extended = false,
  position = { bottom: 16, right: 16 },
  onClick,
}) => {
  const sizes = {
    small: 40,
    medium: 56,
    large: 96,
  };

  return (
    <button
      onClick={() => {
        onClick?.();
        HapticFeedback.getInstance().trigger('medium');
      }}
      className={`material-fab ${size} ${extended ? 'extended' : ''}`}
      style={{
        position: 'fixed',
        bottom: position.bottom + (deviceDetector.isAndroid() ? 80 : 0), // Account for nav bar
        right: position.right,
        width: extended ? 'auto' : sizes[size],
        height: sizes[size],
        minWidth: sizes[size],
        padding: extended ? `0 ${size === 'small' ? 16 : 24}px` : 0,
        borderRadius: size === 'large' ? 28 : 16,
        backgroundColor: 'var(--md-sys-color-primary-container)',
        color: 'var(--md-sys-color-on-primary-container)',
        border: 'none',
        boxShadow: materialElevation.level3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: extended ? '12px' : 0,
        cursor: 'pointer',
        transition: `all ${materialMotion.duration.medium2}ms ${materialMotion.emphasized}`,
        fontSize: size === 'small' ? '20px' : '24px',
      }}
    >
      {icon}
      {extended && label && <span style={{ fontSize: '14px', fontWeight: 500 }}>{label}</span>}
    </button>
  );
};

/**
 * Material Design switch
 */
export interface MaterialSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const MaterialSwitch: React.FC<MaterialSwitchProps> = ({ checked, onChange, disabled = false }) => {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      className={`material-switch ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}`}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      style={{
        position: 'relative',
        width: '52px',
        height: '32px',
        borderRadius: '16px',
        backgroundColor: checked ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface-variant)',
        border: `2px solid ${checked ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)'}`,
        padding: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.38 : 1,
        transition: `all ${materialMotion.duration.short4}ms ${materialMotion.standard}`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: checked ? '24px' : '16px',
          height: checked ? '24px' : '16px',
          borderRadius: '50%',
          backgroundColor: checked ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-outline)',
          top: '50%',
          transform: `translate(${checked ? '24px' : '4px'}, -50%)`,
          transition: `all ${materialMotion.duration.short4}ms ${materialMotion.standard}`,
          boxShadow: materialElevation.level1,
        }}
      />
    </button>
  );
};

/**
 * Material Design ripple effect
 */
export const MaterialRipple: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const rippleRef = useRef<HTMLDivElement>(null);

  const createRipple = (e: React.MouseEvent | React.TouchEvent) => {
    if (!rippleRef.current) return;

    const rect = rippleRef.current.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x - size / 2}px`;
    ripple.style.top = `${y - size / 2}px`;
    ripple.classList.add('material-ripple-effect');

    rippleRef.current.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, materialMotion.duration.long2);
  };

  return (
    <div
      ref={rippleRef}
      className="material-ripple-container"
      onMouseDown={createRipple}
      onTouchStart={createRipple}
      style={{
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
};

/**
 * Material Design snackbar
 */
export interface MaterialSnackbarProps {
  message: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  duration?: number;
  onDismiss?: () => void;
}

export const MaterialSnackbar: React.FC<MaterialSnackbarProps> = ({ message, action, duration = 4000, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div
      className="material-snackbar"
      style={{
        position: 'fixed',
        bottom: 'calc(16px + env(safe-area-inset-bottom, 0))',
        left: '16px',
        right: '16px',
        maxWidth: '672px',
        margin: '0 auto',
        backgroundColor: 'var(--md-sys-color-inverse-surface)',
        color: 'var(--md-sys-color-inverse-on-surface)',
        borderRadius: '4px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: materialElevation.level3,
        animation: `slideUp ${materialMotion.duration.medium1}ms ${materialMotion.emphasizedDecelerate}`,
        zIndex: 9999,
      }}
    >
      <span style={{ fontSize: '14px', lineHeight: '20px' }}>{message}</span>

      {action && (
        <button
          onClick={action.onPress}
          style={{
            marginLeft: '8px',
            padding: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--md-sys-color-inverse-primary)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.1px',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

/**
 * Material Design styles
 */
export const materialStyles = `
  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  .material-ripple-effect {
    position: absolute;
    border-radius: 50%;
    background-color: currentColor;
    opacity: 0.12;
    animation: ripple ${materialMotion.duration.long2}ms ${materialMotion.standard};
    pointer-events: none;
  }
  
  @keyframes ripple {
    from {
      transform: scale(0);
      opacity: 0.24;
    }
    to {
      transform: scale(2);
      opacity: 0;
    }
  }
  
  /* Material elevation transitions */
  .material-elevated {
    transition: box-shadow ${materialMotion.duration.short4}ms ${materialMotion.standard};
  }
  
  /* Material state layers */
  .material-state-layer {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    transition: opacity ${materialMotion.duration.short2}ms ${materialMotion.standard};
  }
  
  .material-state-layer:hover {
    background-color: currentColor;
    opacity: 0.08;
  }
  
  .material-state-layer:focus {
    background-color: currentColor;
    opacity: 0.12;
  }
  
  .material-state-layer:active {
    background-color: currentColor;
    opacity: 0.12;
  }
`;
