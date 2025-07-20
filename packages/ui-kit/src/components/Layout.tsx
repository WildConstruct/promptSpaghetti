/**
 * Layout components for responsive design
 */

import React, { forwardRef } from 'react';
import { LayoutProps } from '../types';
import { useTheme } from '../hooks';
import { cn, resolveResponsiveValue, createSpacingStyles } from '../utils';

// Flex layout component
export const Flex = forwardRef<HTMLDivElement, LayoutProps>(
  (
    {
      children,
      direction = 'row',
      align = 'stretch',
      justify = 'start',
      gap = 'md',
      wrap = false,
      padding,
      margin,
      className,
      style,
      testId,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();

    const flexStyles = {
      display: 'flex',
      flexDirection: resolveResponsiveValue(direction),
      alignItems: resolveResponsiveValue(align),
      justifyContent: resolveResponsiveValue(justify),
      flexWrap: resolveResponsiveValue(wrap) ? 'wrap' : 'nowrap',
      gap: `${theme.spacing[resolveResponsiveValue(gap)]}px`,
      ...(padding && createSpacingStyles('padding', padding, theme)),
      ...(margin && createSpacingStyles('margin', margin, theme)),
      ...style
    };

    return (
      <div
        ref={ref}
        className={cn('ui-flex', className)}
        style={flexStyles}
        data-testid={testId}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Flex.displayName = 'Flex';

// Grid layout component
export const Grid = forwardRef<HTMLDivElement, LayoutProps & {
  columns?: number | string;
  rows?: number | string;
  areas?: string;
  autoFit?: boolean;
  minColumnWidth?: string;
}>(
  (
    {
      children,
      columns = 'auto',
      rows = 'auto',
      areas,
      gap = 'md',
      padding,
      margin,
      autoFit = false,
      minColumnWidth = '250px',
      className,
      style,
      testId,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();

    const getGridColumns = () => {
      if (autoFit) {
        return `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))`;
      }
      if (typeof columns === 'number') {
        return `repeat(${columns}, 1fr)`;
      }
      return columns;
    };

    const getGridRows = () => {
      if (typeof rows === 'number') {
        return `repeat(${rows}, auto)`;
      }
      return rows;
    };

    const gridStyles = {
      display: 'grid',
      gridTemplateColumns: getGridColumns(),
      gridTemplateRows: getGridRows(),
      ...(areas && { gridTemplateAreas: areas }),
      gap: `${theme.spacing[resolveResponsiveValue(gap)]}px`,
      ...(padding && createSpacingStyles('padding', padding, theme)),
      ...(margin && createSpacingStyles('margin', margin, theme)),
      ...style
    };

    return (
      <div
        ref={ref}
        className={cn('ui-grid', className)}
        style={gridStyles}
        data-testid={testId}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = 'Grid';

// Stack layout component (vertical flex with spacing)
export const Stack = forwardRef<HTMLDivElement, LayoutProps & {
  spacing?: keyof typeof import('../types').ThemeSpacing;
  divider?: React.ReactNode;
    }>(
    (
      {
        children,
        spacing = 'md',
        divider,
        align = 'stretch',
        padding,
        margin,
        className,
        style,
        testId,
        ...props
      },
      ref
    ) => {
      const theme = useTheme();
      const childrenArray = React.Children.toArray(children);

      const stackStyles = {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: resolveResponsiveValue(align),
        ...(padding && createSpacingStyles('padding', padding, theme)),
        ...(margin && createSpacingStyles('margin', margin, theme)),
        ...style
      };

      return (
        <div
          ref={ref}
          className={cn('ui-stack', className)}
          style={stackStyles}
          data-testid={testId}
          {...props}
        >
          {childrenArray.map((child, index) => (
            <React.Fragment key={index}>
              {child}
              {divider && index < childrenArray.length - 1 && (
                <div
                  className="ui-stack-divider"
                  style={{
                    margin: `${theme.spacing[spacing] / 2}px 0`
                  }}
                >
                  {divider}
                </div>
              )}
              {!divider && index < childrenArray.length - 1 && (
                <div
                  className="ui-stack-spacer"
                  style={{
                    height: `${theme.spacing[spacing]}px`
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      );
    }
    );

Stack.displayName = 'Stack';

// Grid item component for more control
export const GridItem = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
  colSpan?: number;
  rowSpan?: number;
  colStart?: number;
  colEnd?: number;
  rowStart?: number;
  rowEnd?: number;
  area?: string;
}>(
  (
    {
      children,
      colSpan,
      rowSpan,
      colStart,
      colEnd,
      rowStart,
      rowEnd,
      area,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const gridItemStyles = {
      ...(colSpan && { gridColumn: `span ${colSpan}` }),
      ...(rowSpan && { gridRow: `span ${rowSpan}` }),
      ...(colStart && { gridColumnStart: colStart }),
      ...(colEnd && { gridColumnEnd: colEnd }),
      ...(rowStart && { gridRowStart: rowStart }),
      ...(rowEnd && { gridRowEnd: rowEnd }),
      ...(area && { gridArea: area }),
      ...style
    };

    return (
      <div
        ref={ref}
        className={cn('ui-grid-item', className)}
        style={gridItemStyles}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GridItem.displayName = 'GridItem';

// Center component for quick centering
export const Center = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
  minHeight?: string;
}>(
  ({ children, minHeight = '100%', className, style, ...props }, ref) => {
    const centerStyles = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight,
      ...style
    };

    return (
      <div
        ref={ref}
        className={cn('ui-center', className)}
        style={centerStyles}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Center.displayName = 'Center';

// Container component for max-width layouts
export const Container = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & {
  maxWidth?: string;
  centerContent?: boolean;
}>(
  (
    { 
      children, 
      maxWidth = '1200px', 
      centerContent = true, 
      className, 
      style, 
      ...props 
    }, 
    ref
  ) => {
    const theme = useTheme();
    
    const containerStyles = {
      width: '100%',
      maxWidth,
      ...(centerContent && {
        marginLeft: 'auto',
        marginRight: 'auto'
      }),
      paddingLeft: `${theme.spacing.md}px`,
      paddingRight: `${theme.spacing.md}px`,
      ...style
    };

    return (
      <div
        ref={ref}
        className={cn('ui-container', className)}
        style={containerStyles}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';