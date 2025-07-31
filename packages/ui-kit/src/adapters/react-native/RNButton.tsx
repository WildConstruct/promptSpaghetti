/**
 * React Native-specific Button implementation
 */

import React from 'react';
import { Button, ButtonProps } from '../../components/Button';
import { usePlatformAdapter } from '../usePlatformAdapter';

export interface RNButtonProps extends ButtonProps {
  hapticFeedback?: 'light' | 'medium' | 'heavy';
  accessibilityRole?: string;
  accessibilityHint?: string;
  testID?: string;
}

export const RNButton: React.FC<RNButtonProps> = ({
  hapticFeedback,
  accessibilityRole = 'button',
  accessibilityHint,
  testID,
  onClick,
  onLongPress,
  children,
  ...props
}) => {
  const adapter = usePlatformAdapter();

  const handlePress = () => {
    // Haptic feedback on button press
    if (hapticFeedback) {
      adapter.hapticFeedback(hapticFeedback);
    }

    onClick?.();
  };

  const handleLongPress = () => {
    // Stronger haptic feedback for long press
    adapter.hapticFeedback('medium');
    onLongPress?.();
  };

  // Convert web-style props to React Native props
  const rnProps = {
    ...adapter.handlePress(handlePress),
    ...(onLongPress && adapter.handleLongPress(handleLongPress)),
    accessibilityRole,
    accessibilityLabel: props['aria-label'],
    accessibilityHint,
    testID: testID || props.testId,
    // React Native specific styling
    style: {
      ...props.style,
      // Ensure proper touch target size (minimum 44x44 points)
      minHeight: 44,
      minWidth: 44,
      // Remove web-specific properties
      transition: undefined,
      userSelect: undefined,
      WebkitTapHighlightColor: undefined,
    },
  };

  return (
    <Button {...props} {...rnProps} style={rnProps.style}>
      {children}
    </Button>
  );
};
