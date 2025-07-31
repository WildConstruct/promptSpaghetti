/**
 * Web-specific Button implementation
 */

import React from 'react';
import { Button, ButtonProps } from '../../components/Button';
import { usePlatformAdapter } from '../usePlatformAdapter';

export interface WebButtonProps extends ButtonProps {
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  download?: string;
}

export const WebButton: React.FC<WebButtonProps> = ({
  href,
  target = '_blank',
  download,
  onClick,
  children,
  ...props
}) => {
  const adapter = usePlatformAdapter();

  const handleClick = () => {
    if (href) {
      if (target === '_blank') {
        adapter.openUrl(href);
      } else {
        window.location.href = href;
      }
    }
    onClick?.();
  };

  // If href is provided, render as link button
  if (href) {
    return (
      <Button
        {...props}
        onClick={handleClick}
        style={{
          ...props.style,
          textDecoration: 'none',
        }}
        role="link"
        aria-label={props['aria-label'] || `Navigate to ${href}`}
      >
        {children}
      </Button>
    );
  }

  // Enhanced web button with additional features
  return (
    <Button
      {...props}
      onClick={handleClick}
      style={{
        ...props.style,
        // Web-specific enhancements
        transition: 'all 0.2s ease',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
      onMouseDown={e => {
        // Prevent text selection on mouse down
        e.preventDefault();
      }}
      onContextMenu={e => {
        // Prevent right-click context menu on buttons
        e.preventDefault();
      }}
    >
      {children}
    </Button>
  );
};
