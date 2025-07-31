/**
 * iOS-specific UI adaptations and components
 */

import React, { useEffect, useState, useRef } from 'react';
import { deviceDetector } from '../../responsive/device-detection';

/**
 * iOS safe area insets
 */
export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Get iOS safe area insets
 */
export function getIOSSafeAreaInsets(): SafeAreaInsets {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const computedStyle = getComputedStyle(document.documentElement);

  return {
    top: parseInt(
      computedStyle.getPropertyValue('--sat') || computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'
    ),
    right: parseInt(
      computedStyle.getPropertyValue('--sar') || computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0'
    ),
    bottom: parseInt(
      computedStyle.getPropertyValue('--sab') || computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'
    ),
    left: parseInt(
      computedStyle.getPropertyValue('--sal') || computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0'
    ),
  };
}

/**
 * iOS safe area provider
 */
export const IOSSafeAreaContext = React.createContext<SafeAreaInsets>({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});

export const IOSSafeAreaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [insets, setInsets] = useState(getIOSSafeAreaInsets());

  useEffect(() => {
    const updateInsets = () => {
      setInsets(getIOSSafeAreaInsets());
    };

    // Update on orientation change
    window.addEventListener('orientationchange', updateInsets);
    window.addEventListener('resize', updateInsets);

    // Initial update
    updateInsets();

    return () => {
      window.removeEventListener('orientationchange', updateInsets);
      window.removeEventListener('resize', updateInsets);
    };
  }, []);

  return <IOSSafeAreaContext.Provider value={insets}>{children}</IOSSafeAreaContext.Provider>;
};

/**
 * iOS-style navigation bar
 */
export interface IOSNavigationBarProps {
  title?: string;
  leftItems?: React.ReactNode[];
  rightItems?: React.ReactNode[];
  transparent?: boolean;
  large?: boolean;
  onBack?: () => void;
}

export const IOSNavigationBar: React.FC<IOSNavigationBarProps> = ({
  title,
  leftItems,
  rightItems,
  transparent = false,
  large = false,
  onBack,
}) => {
  const { top } = React.useContext(IOSSafeAreaContext);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`ios-navigation-bar ${large ? 'large' : ''} ${scrolled ? 'scrolled' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: top,
        backgroundColor: transparent ? 'transparent' : 'var(--color-background)',
        backdropFilter: transparent || scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: transparent || scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '0.5px solid var(--color-border)' : 'none',
        transition: 'all 0.3s ease',
        zIndex: 1000,
      }}
    >
      <div
        className="nav-content"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: large && !scrolled ? 96 : 44,
          padding: '0 16px',
          transition: 'height 0.3s ease',
        }}
      >
        <div className="nav-left" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          {onBack && (
            <button
              onClick={onBack}
              className="ios-back-button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px',
                marginLeft: '-8px',
                color: 'var(--color-primary)',
                fontSize: '17px',
              }}
            >
              <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
                <path d="M10 0L0 10L10 20L11.5 18.5L3 10L11.5 1.5L10 0Z" />
              </svg>
              Back
            </button>
          )}
          {leftItems}
        </div>

        <div
          className="nav-center"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: large && !scrolled ? '34px' : '17px',
            fontWeight: large ? 700 : 600,
            transition: 'font-size 0.3s ease',
          }}
        >
          {title}
        </div>

        <div
          className="nav-right"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
        >
          {rightItems}
        </div>
      </div>
    </nav>
  );
};

/**
 * iOS-style tab bar
 */
export interface IOSTabBarProps {
  items: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }>;
  activeItem: string;
  onItemSelect: (id: string) => void;
}

export const IOSTabBar: React.FC<IOSTabBarProps> = ({ items, activeItem, onItemSelect }) => {
  const { bottom } = React.useContext(IOSSafeAreaContext);

  return (
    <div
      className="ios-tab-bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        backgroundColor: 'var(--color-background)',
        borderTop: '0.5px solid var(--color-border)',
        paddingBottom: bottom,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onItemSelect(item.id)}
          className={`tab-item ${activeItem === item.id ? 'active' : ''}`}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '8px',
            color: activeItem === item.id ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            fontSize: '10px',
            position: 'relative',
          }}
        >
          <div style={{ fontSize: '24px' }}>{item.icon}</div>
          <span>{item.label}</span>
          {item.badge && item.badge > 0 && (
            <div
              className="badge"
              style={{
                position: 'absolute',
                top: '4px',
                right: 'calc(50% - 16px)',
                backgroundColor: 'var(--color-danger)',
                color: 'white',
                borderRadius: '10px',
                padding: '2px 6px',
                fontSize: '12px',
                minWidth: '20px',
                textAlign: 'center',
              }}
            >
              {item.badge > 99 ? '99+' : item.badge}
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

/**
 * iOS-style switch
 */
export interface IOSSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const IOSSwitch: React.FC<IOSSwitchProps> = ({ checked, onChange, disabled = false }) => {
  return (
    <button
      className={`ios-switch ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={() => !disabled && onChange(!checked)}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      style={{
        width: '51px',
        height: '31px',
        borderRadius: '31px',
        backgroundColor: checked ? 'var(--color-primary)' : 'var(--color-border)',
        border: 'none',
        padding: '2px',
        position: 'relative',
        transition: 'background-color 0.2s ease',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div
        style={{
          width: '27px',
          height: '27px',
          borderRadius: '27px',
          backgroundColor: 'white',
          boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
          transform: `translateX(${checked ? '20px' : '0'})`,
          transition: 'transform 0.2s ease',
        }}
      />
    </button>
  );
};

/**
 * iOS-style action sheet
 */
export interface IOSActionSheetProps {
  visible: boolean;
  title?: string;
  message?: string;
  actions: Array<{
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress: () => void;
  }>;
  onDismiss: () => void;
}

export const IOSActionSheet: React.FC<IOSActionSheetProps> = ({ visible, title, message, actions, onDismiss }) => {
  const { bottom } = React.useContext(IOSSafeAreaContext);

  if (!visible) return null;

  return (
    <>
      <div
        className="ios-action-sheet-backdrop"
        onClick={onDismiss}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease',
        }}
      />

      <div
        className="ios-action-sheet"
        style={{
          position: 'fixed',
          left: '8px',
          right: '8px',
          bottom: bottom + 8,
          zIndex: 10000,
          animation: 'slideUp 0.3s ease',
        }}
      >
        {(title || message) && (
          <div
            className="action-sheet-header"
            style={{
              backgroundColor: 'var(--color-background)',
              borderRadius: '13px',
              marginBottom: '8px',
              padding: '16px',
              textAlign: 'center',
            }}
          >
            {title && <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>{title}</div>}
            {message && <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{message}</div>}
          </div>
        )}

        <div
          className="action-sheet-actions"
          style={{
            backgroundColor: 'var(--color-background)',
            borderRadius: '13px',
            overflow: 'hidden',
          }}
        >
          {actions
            .filter(action => action.style !== 'cancel')
            .map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onPress();
                  onDismiss();
                }}
                style={{
                  width: '100%',
                  padding: '20px',
                  fontSize: '20px',
                  fontWeight: action.style === 'destructive' ? 600 : 400,
                  color: action.style === 'destructive' ? 'var(--color-danger)' : 'var(--color-primary)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderTop: index > 0 ? '0.5px solid var(--color-border)' : 'none',
                }}
              >
                {action.text}
              </button>
            ))}
        </div>

        {actions.find(action => action.style === 'cancel') && (
          <button
            onClick={() => {
              const cancelAction = actions.find(action => action.style === 'cancel');
              cancelAction?.onPress();
              onDismiss();
            }}
            style={{
              width: '100%',
              padding: '20px',
              fontSize: '20px',
              fontWeight: 600,
              color: 'var(--color-primary)',
              backgroundColor: 'var(--color-background)',
              border: 'none',
              borderRadius: '13px',
              marginTop: '8px',
            }}
          >
            {actions.find(action => action.style === 'cancel')?.text}
          </button>
        )}
      </div>
    </>
  );
};

/**
 * iOS haptic feedback
 */
export const iOSHaptics = {
  impact: (style: 'light' | 'medium' | 'heavy' | 'soft' | 'rigid') => {
    if (deviceDetector.isIOS() && 'vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30,
        soft: [5, 10, 5],
        rigid: [20, 10, 20],
      };
      navigator.vibrate(patterns[style]);
    }
  },

  notification: (type: 'success' | 'warning' | 'error') => {
    if (deviceDetector.isIOS() && 'vibrate' in navigator) {
      const patterns = {
        success: [10, 50, 10],
        warning: [20, 20, 20],
        error: [50, 100, 50],
      };
      navigator.vibrate(patterns[type]);
    }
  },

  selection: () => {
    if (deviceDetector.isIOS() && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
};

/**
 * iOS-specific styles
 */
export const iOSStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  
  /* iOS bounce scrolling */
  .ios-scroll-container {
    -webkit-overflow-scrolling: touch;
    overflow-y: auto;
  }
  
  /* iOS-style tap highlight */
  .ios-touchable {
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
  }
  
  /* Prevent iOS zoom on input focus */
  input, select, textarea {
    font-size: 16px;
  }
  
  /* iOS safe area CSS variables */
  :root {
    --sat: env(safe-area-inset-top);
    --sar: env(safe-area-inset-right);
    --sab: env(safe-area-inset-bottom);
    --sal: env(safe-area-inset-left);
  }
`;
