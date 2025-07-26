/**
 * Web-specific SafeAreaView implementation
 */

import React, { forwardRef, useEffect, useState } from 'react';
import { useTheme } from '../../hooks';

export interface WebSafeAreaViewProps extends React.HTMLAttributes<HTMLDivElement> {
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  mode?: 'padding' | 'margin';
}

export const WebSafeAreaView = forwardRef<HTMLDivElement, WebSafeAreaViewProps>(({
  children,
  edges = ['top', 'bottom', 'left', 'right'],
  mode = 'padding',
  style,
  className,
  ...props
}, ref) => {
  const theme = useTheme();
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });

  useEffect(() => {
    // Detect safe area insets using CSS environment variables
    const updateSafeAreaInsets = () => {
      if (typeof window !== 'undefined' && CSS.supports('top: env(safe-area-inset-top)')) {
        const computedStyle = getComputedStyle(document.documentElement);
        
        setSafeAreaInsets({
          top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0', 10),
          bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0', 10),
          left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0', 10),
          right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0', 10)
        });
      } else {
        // Fallback for browsers that don't support safe area insets
        // Detect if we're in a PWA or fullscreen mode
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                            (window.navigator as any).standalone ||
                            document.referrer.includes('android-app://');
        
        if (isStandalone) {
          // Approximate safe area for common devices
          const userAgent = navigator.userAgent;
          
          if (/iPhone/.test(userAgent)) {
            // iPhone with notch detection
            const hasNotch = window.screen.height >= 812; // iPhone X and newer
            setSafeAreaInsets({
              top: hasNotch ? 44 : 20,
              bottom: hasNotch ? 34 : 0,
              left: 0,
              right: 0
            });
          } else {
            // Default for other devices
            setSafeAreaInsets({
              top: 24, // Status bar height
              bottom: 0,
              left: 0,
              right: 0
            });
          }
        }
      }
    };

    updateSafeAreaInsets();

    // Listen for orientation changes
    window.addEventListener('orientationchange', updateSafeAreaInsets);
    window.addEventListener('resize', updateSafeAreaInsets);

    return () => {
      window.removeEventListener('orientationchange', updateSafeAreaInsets);
      window.removeEventListener('resize', updateSafeAreaInsets);
    };
  }, []);

  const getSafeAreaStyle = (): React.CSSProperties => {
    const appliedInsets = {
      top: edges.includes('top') ? safeAreaInsets.top : 0,
      bottom: edges.includes('bottom') ? safeAreaInsets.bottom : 0,
      left: edges.includes('left') ? safeAreaInsets.left : 0,
      right: edges.includes('right') ? safeAreaInsets.right : 0
    };

    if (mode === 'padding') {
      return {
        paddingTop: `${appliedInsets.top}px`,
        paddingBottom: `${appliedInsets.bottom}px`,
        paddingLeft: `${appliedInsets.left}px`,
        paddingRight: `${appliedInsets.right}px`
      };
    } else {
      return {
        marginTop: `${appliedInsets.top}px`,
        marginBottom: `${appliedInsets.bottom}px`,
        marginLeft: `${appliedInsets.left}px`,
        marginRight: `${appliedInsets.right}px`
      };
    }
  };

  const safeAreaViewStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.background,
    ...getSafeAreaStyle(),
    ...style
  };

  return (
    <>
      {/* CSS custom properties for safe area insets */}
      <style>{`
        :root {
          --safe-area-inset-top: env(safe-area-inset-top, ${safeAreaInsets.top}px);
          --safe-area-inset-bottom: env(safe-area-inset-bottom, ${safeAreaInsets.bottom}px);
          --safe-area-inset-left: env(safe-area-inset-left, ${safeAreaInsets.left}px);
          --safe-area-inset-right: env(safe-area-inset-right, ${safeAreaInsets.right}px);
        }
      `}</style>
      
      <div
        ref={ref}
        className={`web-safe-area-view ${className || ''}`}
        style={safeAreaViewStyles}
        {...props}
      >
        {children}
      </div>
    </>
  );
});

WebSafeAreaView.displayName = 'WebSafeAreaView';