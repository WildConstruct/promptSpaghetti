/**
 * Cross-platform Card component
 */

import React, { forwardRef } from 'react';
import { CardProps } from '../types';
import { useTheme } from '../hooks';
import { cn, createSpacingStyles, resolveResponsiveValue, createTransition } from '../utils';

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      clickable = false,
      onClick,
      className,
      style,
      testId,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();

    const getVariantStyles = () => {
      const baseStyles = {
        backgroundColor: theme.colors.surface,
        borderRadius: `${theme.borderRadius}px`,
        transition: createTransition(['box-shadow', 'transform']),
        position: 'relative' as const,
        overflow: 'hidden' as const
      };

      switch (variant) {
        case 'outlined':
          return {
            ...baseStyles,
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.background
          };

        case 'elevated':
          return {
            ...baseStyles,
            boxShadow: theme.shadows.md,
            border: 'none',
            '&:hover': clickable ? {
              boxShadow: theme.shadows.lg,
              transform: 'translateY(-2px)'
            } : {}
          };

        case 'filled':
          return {
            ...baseStyles,
            backgroundColor: theme.colors.surface,
            border: 'none'
          };

        case 'default':
        default:
          return {
            ...baseStyles,
            boxShadow: theme.shadows.sm,
            border: `1px solid ${theme.colors.border}`
          };
      }
    };

    const paddingStyles = createSpacingStyles('padding', padding, theme);

    const clickableStyles = clickable ? {
      cursor: 'pointer',
      userSelect: 'none' as const,
      WebkitTapHighlightColor: 'transparent',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: variant === 'elevated' ? theme.shadows.lg : theme.shadows.md
      },
      '&:active': {
        transform: 'translateY(0)',
        transition: createTransition(['transform'], '100ms')
      }
    } : {};

    const cardStyles = {
      ...getVariantStyles(),
      ...paddingStyles,
      ...clickableStyles,
      ...style
    };

    const handleClick = () => {
      if (clickable && onClick) {
        onClick();
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (clickable && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onClick?.();
      }
    };

    return (
      <div
        ref={ref}
        className={cn('ui-card', className)}
        style={cardStyles}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        data-testid={testId}
        {...props}
      >
        {children}
        {clickable && (
          <div
            className="ui-card-ripple"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '0 0',
              transition: createTransition(['background-size'], '300ms'),
              pointerEvents: 'none'
            }}
          />
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card sub-components for better composition
export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, style, ...props }, ref) => {
    const theme = useTheme();
    
    return (
      <div
        ref={ref}
        className={cn('ui-card-header', className)}
        style={{
          borderBottom: `1px solid ${theme.colors.border}`,
          marginBottom: `${theme.spacing.md}px`,
          paddingBottom: `${theme.spacing.md}px`,
          ...style
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }>(
  ({ children, className, style, level = 3, ...props }, ref) => {
    const theme = useTheme();
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;
    
    return (
      <Tag
        ref={ref as any}
        className={cn('ui-card-title', className)}
        style={{
          margin: 0,
          fontSize: level <= 2 ? `${theme.typography.fontSize.xl}px` : `${theme.typography.fontSize.lg}px`,
          fontWeight: theme.typography.fontWeight.semibold,
          color: theme.colors.text,
          fontFamily: theme.typography.fontFamily,
          lineHeight: theme.typography.lineHeight.tight,
          ...style
        }}
        {...props}
      >
        {children}
      </Tag>
    );
  }
);

CardTitle.displayName = 'CardTitle';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, style, ...props }, ref) => {
    const theme = useTheme();
    
    return (
      <div
        ref={ref}
        className={cn('ui-card-content', className)}
        style={{
          color: theme.colors.text,
          lineHeight: theme.typography.lineHeight.normal,
          ...style
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, style, ...props }, ref) => {
    const theme = useTheme();
    
    return (
      <div
        ref={ref}
        className={cn('ui-card-footer', className)}
        style={{
          borderTop: `1px solid ${theme.colors.border}`,
          marginTop: `${theme.spacing.md}px`,
          paddingTop: `${theme.spacing.md}px`,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: `${theme.spacing.sm}px`,
          ...style
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';