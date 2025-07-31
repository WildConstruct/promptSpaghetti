import { jsx as _jsx } from 'react/jsx-runtime';
import { Button } from './Button';
import { useBreakpointValue, useDeviceDetection } from '../responsive/utilities';
export const ResponsiveButton = ({ size, fullWidth, hideOn, showOn, children, ...props }) => {
  const responsiveSize = useBreakpointValue(typeof size === 'object' ? size : { xs: size }, 'md');
  const responsiveFullWidth = useBreakpointValue(typeof fullWidth === 'object' ? fullWidth : { xs: fullWidth }, false);
  const { isMobile, isTouch } = useDeviceDetection();
  // Adjust for touch devices
  const touchSize = isTouch && responsiveSize === 'sm' ? 'md' : responsiveSize;
  return _jsx(Button, { ...props, size: touchSize, fullWidth: responsiveFullWidth, children: children });
};
//# sourceMappingURL=ResponsiveButton.js.map
