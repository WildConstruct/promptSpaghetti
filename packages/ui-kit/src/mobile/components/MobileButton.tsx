/**
 * Mobile-optimized button component
 */

import React from 'react';
import { Button, ButtonProps } from '../../components/Button';
import { TOUCH_TARGETS, mobileStyles } from '../design-system';
import { useDeviceDetection } from '../../responsive/utilities';
import { cn } from '../../utils';

export interface MobileButtonProps extends ButtonProps {
  /**
   * Make button full width on mobile
   */
  mobileFullWidth?: boolean;
  
  /**
   * Add haptic feedback on press (mobile only)
   */
  hapticFeedback?: boolean;
  
  /**
   * Show loading spinner inline on mobile
   */
  mobileLoading?: boolean;
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  size = 'md',
  mobileFullWidth = false,
  hapticFeedback = true,
  mobileLoading = false,
  onClick,
  className,
  style,
  children,
  ...props
}) => {
  const { isMobile, isTouch } = useDeviceDetection();
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Haptic feedback for supported devices
    if (hapticFeedback && isTouch && 'vibrate' in navigator) {
      navigator.vibrate(10); // Light haptic feedback
    }
    
    onClick?.(e);
  };
  
  // Mobile-specific styles
  const mobileButtonStyles: React.CSSProperties = {
    minHeight: TOUCH_TARGETS.preferred,
    minWidth: TOUCH_TARGETS.preferred,
    // Larger tap area with padding
    padding: '12px 24px',
    // Full width on mobile if specified
    width: (isMobile && mobileFullWidth) ? '100%' : undefined,
    // Prevent double-tap zoom
    touchAction: 'manipulation',
    // Remove tap highlight on iOS
    WebkitTapHighlightColor: 'transparent',
    // Ensure text doesn't wrap
    whiteSpace: 'nowrap',
    ...style
  };
  
  return (
    <Button
      {...props}
      size={size}
      onClick={handleClick}
      className={cn(
        'mobile-button',
        isTouch && 'touch-device',
        className
      )}
      style={mobileButtonStyles}
      loading={mobileLoading || props.loading}
    >
      {children}
    </Button>
  );
};

/**
 * Mobile floating action button
 */
export interface MobileFABProps extends Omit<MobileButtonProps, 'variant'> {
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  offset?: number;
}

export const MobileFAB: React.FC<MobileFABProps> = ({
  position = 'bottom-right',
  offset = 16,
  className,
  style,
  children,
  ...props
}) => {
  const positionStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 1000,
    minWidth: TOUCH_TARGETS.large,
    minHeight: TOUCH_TARGETS.large,
    borderRadius: '50%',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    ...mobileStyles.tapHighlight,
    ...mobileStyles.noSelect
  };
  
  // Position-specific styles
  switch (position) {
    case 'bottom-right':
      positionStyles.bottom = `calc(${offset}px + env(safe-area-inset-bottom))`;
      positionStyles.right = `calc(${offset}px + env(safe-area-inset-right))`;
      break;
    case 'bottom-left':
      positionStyles.bottom = `calc(${offset}px + env(safe-area-inset-bottom))`;
      positionStyles.left = `calc(${offset}px + env(safe-area-inset-left))`;
      break;
    case 'bottom-center':
      positionStyles.bottom = `calc(${offset}px + env(safe-area-inset-bottom))`;
      positionStyles.left = '50%';
      positionStyles.transform = 'translateX(-50%)';
      break;
  }
  
  return (
    <MobileButton
      {...props}
      variant="primary"
      className={cn('mobile-fab', className)}
      style={{
        ...positionStyles,
        ...style
      }}
    >
      {children}
    </MobileButton>
  );
};