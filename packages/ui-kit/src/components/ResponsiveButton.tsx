/**
 * Example of responsive button component using the new framework
 */

import React from 'react';
import { Button, ButtonProps } from './Button';
import { useBreakpointValue, useDeviceDetection } from '../responsive/utilities';
import { ResponsiveValueEnhanced, ComponentSize } from '../types';

export interface ResponsiveButtonProps extends Omit<ButtonProps, 'size' | 'fullWidth'> {
  size?: ResponsiveValueEnhanced<ComponentSize>;
  fullWidth?: ResponsiveValueEnhanced<boolean>;
  hideOn?: string | string[];
  showOn?: string | string[];
}

export const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({
  size,
  fullWidth,
  hideOn,
  showOn,
  children,
  ...props
}) => {
  const responsiveSize = useBreakpointValue(typeof size === 'object' ? size : { xs: size }, 'md');

  const responsiveFullWidth = useBreakpointValue(typeof fullWidth === 'object' ? fullWidth : { xs: fullWidth }, false);

  const { isMobile, isTouch } = useDeviceDetection();

  // Adjust for touch devices
  const touchSize = isTouch && responsiveSize === 'sm' ? 'md' : responsiveSize;

  return (
    <Button {...props} size={touchSize} fullWidth={responsiveFullWidth}>
      {children}
    </Button>
  );
};
